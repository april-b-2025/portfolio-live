# 📊 Portfolio Command Center

A beautiful, real-time portfolio monitoring dashboard that tracks your Trading 212 investments and cryptocurrency holdings with live data.

![Portfolio Command Center](https://img.shields.io/badge/Status-Ready%20to%20Deploy-brightgreen)

## ✨ Features

- **Live Trading 212 Integration** - Automatically fetches your portfolio positions
- **Real-time Crypto Prices** - Powered by CoinGecko API
- **AI Financial Advisor** - Chat with Claude AI about your portfolio
- **Currency Switcher** - Toggle between GBP (£) and USD ($)
- **P&L Tracking** - See profit/loss for each holding
- **Beautiful Dark Theme** - Easy on the eyes, professional look
- **Auto-refresh** - Updates every 60 seconds

---

## 🚀 DEPLOYMENT GUIDE (No Coding Required!)

### Step 1: Create a Replit Account

1. Go to [replit.com](https://replit.com)
2. Click **Sign Up** (use Google, GitHub, or email)
3. Verify your email if required

---

### Step 2: Create a New Repl

1. Once logged in, click the **+ Create Repl** button (blue button, top left)
2. Select **Import from GitHub** OR choose **Node.js** template
3. If using template:
   - Name it: `portfolio-command-center`
   - Click **Create Repl**

---

### Step 3: Upload the Files

If you created from template, you need to add the project files:

1. In the left sidebar, you'll see the file explorer
2. **Delete** any existing files (like `index.js`)
3. Click the three dots menu → **Upload folder** or **Upload file**
4. Upload these files:
   - `index.js` (the server)
   - `package.json` (dependencies)
   - `.replit` (configuration)
   - `replit.nix` (system config)
   - `public/index.html` (the dashboard)

**Or copy-paste method:**
1. Click **+ New file** for each file
2. Name it exactly as shown above
3. Copy the contents from the downloaded files

---

### Step 4: Add Your API Keys (IMPORTANT!)

This is where you add your personal API keys securely:

1. In the left sidebar, click the **🔒 Secrets** tab (or Tools → Secrets)
2. Add each of these secrets:

| Key | Value | Required? |
|-----|-------|-----------|
| `T212_API_KEY` | Your Trading 212 API key | ✅ Yes |
| `COINGECKO_API_KEY` | Your CoinGecko API key | Optional (improves rate limits) |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Optional (enables AI chat) |

**To add a secret:**
1. Click **+ New Secret**
2. Enter the key name (e.g., `T212_API_KEY`)
3. Enter the value (your actual API key)
4. Click **Add Secret**

---

### Step 5: Run Your App!

1. Click the big green **▶ Run** button at the top
2. Wait for it to install dependencies (first time only)
3. A preview window will appear showing your dashboard!
4. Click **Open in new tab** for the full experience

---

### Step 6: Get Your Permanent URL

Your portfolio is now live! 

1. Look at the **Webview** panel - there's a URL at the top
2. It will look like: `https://portfolio-command-center.yourusername.repl.co`
3. **Bookmark this URL** - this is your personal portfolio dashboard!
4. You can access it from any device, anytime

---

### Step 7: Keep It Running (Optional)

Free Replit accounts put Repls to sleep after inactivity. To keep yours running:

**Option A: Replit Deployments (Recommended)**
1. Click the **Deploy** button (rocket icon)
2. Choose **Reserved VM** or **Autoscale**
3. Follow the payment setup (starts at $7/month)

**Option B: Use UptimeRobot (Free)**
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Create a free account
3. Add a new monitor:
   - Monitor Type: HTTP(s)
   - URL: Your Replit URL
   - Monitoring Interval: 5 minutes
4. This will ping your app regularly, keeping it awake

---

## 🔑 Getting Your API Keys

### Trading 212 API Key

1. Open Trading 212 app or website
2. Go to **Settings** → **API**
3. Click **Generate new key**
4. Copy the API key
5. **Important**: Save this somewhere safe - you can't see it again!

### CoinGecko API Key (Optional but Recommended)

1. Go to [coingecko.com/api](https://www.coingecko.com/en/api)
2. Sign up for a **Demo** account (free)
3. Go to your Dashboard
4. Copy your API key

### Anthropic API Key (For AI Advisor)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to **API Keys**
4. Create a new key
5. Copy and save it

---

## 📝 Customizing Your Crypto Holdings

Your crypto holdings are stored in the `public/index.html` file. To update them:

1. Open `public/index.html` in Replit
2. Find the section that says `CRYPTO_HOLDINGS`
3. Edit the entries to match your actual holdings:

```javascript
const CRYPTO_HOLDINGS = [
    { ticker: 'BTC', name: 'Bitcoin', units: 0.5, costBasisUsd: 30000 },
    { ticker: 'ETH', name: 'Ethereum', units: 2.0, costBasisUsd: 2000 },
    // Add more...
];
```

4. Click **Run** again to see your changes

---

## ❓ Troubleshooting

### "T212 API error" or empty portfolio
- Double-check your T212_API_KEY in Secrets
- Make sure you generated an API key from Trading 212 settings
- The API key should be a long string of letters and numbers

### Crypto prices not updating
- CoinGecko free tier has rate limits
- Adding a COINGECKO_API_KEY helps with this
- Prices update every 60 seconds automatically

### AI Advisor not responding
- Make sure ANTHROPIC_API_KEY is set in Secrets
- Check you have credits in your Anthropic account

### App shows "Loading..." forever
- Click the **Stop** button then **Run** again
- Check the Console tab for error messages

---

## 🔒 Security Notes

- Your API keys are stored securely in Replit Secrets
- Keys are never exposed in your code or to users
- Only you can see your portfolio data
- The URL is unique to your account

---

## 📱 Access From Anywhere

Once deployed, you can:
- Bookmark the URL on your phone
- Add to home screen for app-like access
- Share with no one (it's your personal dashboard!)

---

## 🆘 Need Help?

If you get stuck:
1. Check the Console tab in Replit for error messages
2. Make sure all Secrets are correctly named (case-sensitive!)
3. Try stopping and re-running the app

---

Made with ❤️ for easy portfolio tracking
