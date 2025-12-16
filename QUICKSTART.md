# 🚀 QUICK START GUIDE
## Deploy Your Portfolio in 5 Minutes

---

## What You Need Before Starting:
- [ ] Trading 212 API Key (from T212 app → Settings → API)
- [ ] CoinGecko API Key (optional, from coingecko.com/api)
- [ ] Anthropic API Key (optional, for AI chat, from console.anthropic.com)

---

## Step-by-Step:

### 1️⃣ GO TO REPLIT
```
https://replit.com
```
Sign up with Google/GitHub/Email

---

### 2️⃣ CREATE NEW REPL
- Click "+ Create Repl" (blue button)
- Choose "Node.js" 
- Name it: portfolio-dashboard
- Click "Create Repl"

---

### 3️⃣ UPLOAD FILES
Delete any existing files, then upload:
- index.js
- package.json
- .replit
- replit.nix
- public/index.html (create 'public' folder first)

---

### 4️⃣ ADD YOUR API KEYS
Click 🔒 Secrets in left sidebar, then add:

| Secret Name | Your Value |
|-------------|------------|
| T212_API_KEY | your-trading212-key |
| COINGECKO_API_KEY | your-coingecko-key |
| ANTHROPIC_API_KEY | your-anthropic-key |

---

### 5️⃣ CLICK RUN ▶️
- Wait for "Server running on port 3000"
- Click "Open in new tab"
- 🎉 Done! Bookmark your URL!

---

## Your URL will look like:
```
https://portfolio-dashboard.YOURUSERNAME.repl.co
```

---

## Common Issues:

❌ **Empty portfolio?**
→ Check T212_API_KEY is correct in Secrets

❌ **App keeps sleeping?**
→ Use uptimerobot.com to ping it every 5 min (free)

❌ **AI not working?**
→ Add ANTHROPIC_API_KEY to Secrets

---

## To Update Crypto Holdings:
1. Open public/index.html
2. Find `CRYPTO_HOLDINGS` section
3. Edit your coins and amounts
4. Click Run again

---

That's it! Your portfolio now auto-updates every 60 seconds 📊
