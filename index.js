// Portfolio Command Center - Server
// This server proxies Trading 212 API calls to avoid CORS issues

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// =============================================================================
// API KEYS FROM ENVIRONMENT (Replit Secrets)
// =============================================================================

const T212_API_KEY = process.env.T212_API_KEY;
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// =============================================================================
// TRADING 212 API PROXY
// =============================================================================

// Get portfolio positions
app.get('/api/t212/portfolio', async (req, res) => {
    if (!T212_API_KEY) {
        return res.status(500).json({ error: 'T212_API_KEY not configured' });
    }
    
    try {
        const response = await fetch('https://live.trading212.com/api/v0/equity/portfolio', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${T212_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('T212 API Error:', response.status, errorText);
            return res.status(response.status).json({ error: 'Trading 212 API error', details: errorText });
        }
        
        const data = await response.json();
        console.log(`✅ Fetched ${data.length} positions from Trading 212`);
        res.json(data);
    } catch (error) {
        console.error('T212 Proxy Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch from Trading 212', details: error.message });
    }
});

// Get account cash
app.get('/api/t212/cash', async (req, res) => {
    if (!T212_API_KEY) {
        return res.status(500).json({ error: 'T212_API_KEY not configured' });
    }
    
    try {
        const response = await fetch('https://live.trading212.com/api/v0/equity/account/cash', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${T212_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Trading 212 API error' });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('T212 Cash Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch cash balance' });
    }
});

// Get instrument info
app.get('/api/t212/instruments', async (req, res) => {
    if (!T212_API_KEY) {
        return res.status(500).json({ error: 'T212_API_KEY not configured' });
    }
    
    try {
        const response = await fetch('https://live.trading212.com/api/v0/equity/metadata/instruments', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${T212_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Trading 212 API error' });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('T212 Instruments Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch instruments' });
    }
});

// =============================================================================
// COINGECKO API PROXY
// =============================================================================

app.get('/api/crypto/prices', async (req, res) => {
    const { ids } = req.query;
    
    if (!ids) {
        return res.status(400).json({ error: 'Missing coin IDs' });
    }
    
    try {
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=gbp,usd&include_24hr_change=true`;
        const headers = COINGECKO_API_KEY ? { 'x-cg-demo-api-key': COINGECKO_API_KEY } : {};
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            return res.status(response.status).json({ error: 'CoinGecko API error' });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('CoinGecko Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch crypto prices' });
    }
});

// Exchange rate endpoint
app.get('/api/exchange-rate', async (req, res) => {
    try {
        const url = 'https://api.coingecko.com/api/v3/simple/price?ids=british-pound-sterling&vs_currencies=usd';
        const headers = COINGECKO_API_KEY ? { 'x-cg-demo-api-key': COINGECKO_API_KEY } : {};
        
        const response = await fetch(url, { headers });
        const data = await response.json();
        
        const gbpToUsd = data['british-pound-sterling']?.usd || 1.27;
        res.json({ gbpToUsd, usdToGbp: 1 / gbpToUsd });
    } catch (error) {
        res.json({ gbpToUsd: 1.27, usdToGbp: 0.79 });
    }
});

// =============================================================================
// ANTHROPIC API PROXY (for AI Advisor)
// =============================================================================

app.post('/api/ai/chat', async (req, res) => {
    if (!ANTHROPIC_API_KEY) {
        return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }
    
    try {
        const { messages, system } = req.body;
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                system,
                messages
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Anthropic API Error:', errorText);
            return res.status(response.status).json({ error: 'Anthropic API error' });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Anthropic Error:', error.message);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

// =============================================================================
// CONFIG ENDPOINT - Check which APIs are configured
// =============================================================================

app.get('/api/config', (req, res) => {
    res.json({
        t212Configured: !!T212_API_KEY,
        coingeckoConfigured: !!COINGECKO_API_KEY,
        anthropicConfigured: !!ANTHROPIC_API_KEY
    });
});

// =============================================================================
// HEALTH CHECK
// =============================================================================

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// =============================================================================
// SERVE FRONTEND
// =============================================================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🚀 ═══════════════════════════════════════════════════════════');
    console.log('   PORTFOLIO COMMAND CENTER');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`   Server running on port ${PORT}`);
    console.log('');
    console.log('   API Status:');
    console.log(`   • Trading 212:  ${T212_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   • CoinGecko:    ${COINGECKO_API_KEY ? '✅ Configured' : '⚠️  Using free tier'}`);
    console.log(`   • Anthropic:    ${ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log('');
    console.log('   Open your browser and visit the URL above to view your portfolio!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
});
