# 🤖 Auto Deploy Setup

## ✅ Automated Deployment Configured!

I've set up automated deployment scripts and GitHub Actions workflow.

---

## 🚀 Quick Deploy Commands

### Option 1: Use Script (Easiest)
```bash
npm run deploy
```

This will:
- ✅ Push code to GitHub
- ✅ Deploy to Vercel (if CLI installed)
- ✅ Deploy to Render (if CLI installed)
- ✅ Show environment variable reminders

### Option 2: Setup Environment Variables
```bash
npm run setup-env
```

This will:
- ✅ Guide you through setting environment variables
- ✅ Generate the correct values
- ✅ Show you where to set them

---

## 🔧 GitHub Actions Auto-Deploy

I've created `.github/workflows/deploy.yml` that will:
- ✅ Auto-deploy on push to GitHub
- ✅ Deploy backend to Render
- ✅ Deploy frontend to Vercel

**To enable:**
1. Add secrets to GitHub:
   - `VERCEL_TOKEN` - Get from Vercel → Settings → Tokens
   - `VERCEL_ORG_ID` - Get from Vercel → Settings → General
   - `VERCEL_PROJECT_ID` - Get from Vercel → Project → Settings → General
   - `RENDER_API_KEY` - Get from Render → Account → API Keys
   - `RENDER_SERVICE_ID` - Get from Render → Your Service → Settings

2. Push to GitHub - deployment happens automatically!

---

## 📋 One-Time Setup

### 1. Install CLIs (Optional but Recommended)

```bash
# Vercel CLI
npm install -g vercel

# Render CLI
npm install -g render-cli
```

### 2. Login to Services

```bash
# Vercel
vercel login

# Render
render login
```

### 3. Set Environment Variables (One-Time)

Run the setup script:
```bash
npm run setup-env
```

Or set manually:
- **Vercel**: `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
- **Render**: `CORS_ORIGIN` = `https://2035-git-cursor-run-application-a271-lacs-projects-650efe27.vercel.app,https://*.vercel.app`

---

## 🎯 Usage

### Deploy Everything:
```bash
npm run deploy
```

### Just Push to GitHub:
```bash
git push origin cursor/run-application-a271
```
(GitHub Actions will auto-deploy if secrets are set)

---

## ✅ What's Automated

- ✅ Code push to GitHub
- ✅ GitHub Actions workflow (if secrets configured)
- ✅ Vercel deployment (if CLI installed)
- ✅ Render deployment (if CLI installed)
- ✅ Environment variable reminders

---

## 🚀 Ready to Deploy!

Just run:
```bash
npm run deploy
```

Everything will be automated! 🎉

