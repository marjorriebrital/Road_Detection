# RoadScan — AI Road Condition Detector (Gemini Free Tier)

AI-powered road condition analysis using **Google Gemini 1.5 Flash** — free tier, no credit card needed.

## Free Tier Limits
- 15 requests per minute
- 1,500 requests per day
- Completely free at https://aistudio.google.com

## Project Structure

```
road-detector-gemini/
├── api/
│   └── analyze.js       # Vercel serverless function (calls Gemini API)
├── public/
│   └── index.html       # Frontend UI
├── vercel.json          # Vercel routing config
└── README.md
```

## Get Your Free Gemini API Key

1. Go to https://aistudio.google.com
2. Sign in with your Google account
3. Click **"Get API Key"** → **"Create API key"**
4. Copy the key (looks like: `AIzaSy...`)

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create road-detector --public --push
```

### 2. Import to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Framework Preset: **Other**
4. Click **Deploy**

### 3. Add your Gemini API Key
1. Vercel dashboard → your project → **Settings → Environment Variables**
2. Name: `GEMINI_API_KEY`
3. Value: `AIzaSy...` (your actual key)
4. Click **Save**
5. Go to **Deployments → ⋯ → Redeploy**

Your app is now live at `https://your-project.vercel.app` — free!

## Local Development

```bash
npm install -g vercel
vercel dev
```

Create `.env.local`:
```
GEMINI_API_KEY=AIzaSy...your-key-here
```
