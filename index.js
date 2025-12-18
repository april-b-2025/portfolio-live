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
// API KEYS FROM ENVIRONMENT (Render Environment Variables)
// =============================================================================

const T212_API_KEY = process.env.T212_API_KEY;
const T212_API_SECRET = process.env.T212_API_SECRET;
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Helper to build Trading212 Basic auth header
function getT212AuthHeader() {
  if (!T212_API_KEY || !T212_API_SECRET) return null;
  const credentials = Buffer.from(`${T212_API_KEY}:${T212_API_SECRET}`).toString('base64');
  return `Basic ${credentials}`;
}

// =============================================================================
// INSTRUMENTS CACHE + GBX -> GBP NORMALIZATION (NO GUESSING)
// =============================================================================

// Cache instruments in memory (so we don't download thousands of rows every request)
let instrumentsCache = null;     // Map(ticker -> instrument)
let instrumentsCacheTime = 0;
const INSTRUMENTS_CACHE_MS = 6 * 60 * 60 * 1000; // 6 hours

async function fetchInstrumentsMap(authHeader) {
  const now = Date.now();

  // Serve from cache if fresh
  if (instrumentsCache && (now - instrumentsCacheTime) < INSTRUMENTS_CACHE_MS) {
    return instrumentsCache;
  }

  const response = await fetch('https://live.trading212.com/api/v0/equity/metadata/instruments', {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`T212 instruments fetch failed (${response.status}): ${errorText}`);
  }

  const instruments = await response.json();

  // Build a lookup map by ticker
  const map = new Map();
  for (const inst of instruments) {
    if (!inst?.ticker) continue;
    map.set(inst.ticker, inst);
    map.set(inst.ticker.replace('_EQ', ''), inst);
  }

  instrumentsCache = map;
  instrumentsCacheTime = now;

  return map;
}

function normalizeGbxPrices(position, instrument) {
  // Trading 212 instruments usually include a currency-like field.
  // Depending on account / API version it might be: currencyCode, currency, currencyId, etc.
  const currency =
    instrument?.currencyCode ||
    instrument?.currency ||
    instrument?.currencyId ||
    position?.currencyCode ||
    position?.currency;

  // If the instrument is priced in GBX (pence), convert to GBP (pounds)
  if (currency === 'GBX') {
    if (typeof position.currentPrice === 'number') position.currentPrice = position.currentPrice / 100;
    if (typeof position.averagePrice === 'number') position.averagePrice = position.averagePrice / 100;

    // Optional debug flags (harmless)
    position._priceWasGbx = true;
    position._currencyNormalizedTo = 'GBP';
  } else {
    position._priceWasGbx = false;
  }

  return position;
}

// =============================================================================
// TRADING 212 API PROXY
// =============================================================================

// Get portfolio positions (NOW NORMALIZED using instruments currency, not estimates)
app.get('/api/t212/portfolio', async (req, res) => {
  const authHeader = getT212AuthHeader();
  if (!authHeader) {
    return res.status(500).json({ error: 'T212_API_KEY or T212_API_SECRET not configured' });
  }

  try {
    // 1) Fetch portfolio
    const response = await fetch('https://live.trading212.com/api/v0/equity/portfolio', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('T212 API Error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Trading 212 API error', details: errorText });
    }

    const data = await response.json();

    // 2) Fetch instruments map (for currency info like GBX/GBP)
    const instrumentsMap = await fetchInstrumentsMap(authHeader);

    // 3) Normalize: for each position, look up its instrument and convert only if GBX
    const normalized = data.map(pos => {
      const tickerKey = (pos.ticker || '').replace('_EQ', '');
      const inst = instrumentsMap.get(pos.ticker) || instrumentsMap.get(tickerKey);
      return normalizeGbxPrices(pos, inst);
    });

    console.log(`✅ Fetched ${normalized.length} positions from Trading 212 (GBX->GBP normalized where needed)`);
    res.json(normalized);

  } catch (error) {
    console.error('T212 Proxy Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch from Trading 212', details: error.message });
  }
});

// Get account cash
app.get('/api/t212/cash', async (req, res) => {
  const authHeader = getT212AuthHeader();
  if (!authHeader) {
    return res.status(500).json({ error: 'T212_API_KEY or T212_API_SECRET not configured' });
  }

  try {
    const response = await fetch('https://live.trading212.com/api/v0/equity/account/cash', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('T212 Cash API Error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Trading 212 API error', details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('T212 Cash Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch cash balance', details: error.message });
  }
});

// Get instrument info (still available as your original endpoint)
app.get('/api/t212/instruments', async (req, res) => {
  const authHeader = getT212AuthHeader();
  if (!authHeader) {
    return res.status(500).json({ error: 'T212_API_KEY or T212_API_SECRET not configured' });
  }

  try {
    const response = await fetch('https://live.trading212.com/api/v0/equity/metadata/instruments', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('T212 Instruments API Error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Trading 212 API error', details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('T212 Instruments Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch instruments', details: error.message });
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
      const errorText = await response.text();
      console.error('CoinGecko API Error:', response.status, errorText);
      return res.status(response.status).json({ error: 'CoinGecko API error', details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('CoinGecko Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch crypto prices', details: error.message });
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
      return res.status(response.status).json({ error: 'Anthropic API error', details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Anthropic Error:', error.message);
    res.status(500).json({ error: 'Failed to get AI response', details: error.message });
  }
});

// =============================================================================
// CONFIG ENDPOINT - Check which APIs are configured
// =============================================================================

app.get('/api/config', (req, res) => {
  res.json({
    t212Configured: !!(T212_API_KEY && T212_API_SECRET),
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
  console.log(`   • Trading 212:  ${(T212_API_KEY && T212_API_SECRET) ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   • CoinGecko:    ${COINGECKO_API_KEY ? '✅ Configured' : '⚠️  Using free tier'}`);
  console.log(`   • Anthropic:    ${ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log('');
  console.log('   Open your browser and visit the URL above to view your portfolio!');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
});
