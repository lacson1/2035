# 🚀 START HERE: Deploy to Vercel

## ⚡ Quick Start (3 Steps)

### Step 1: Login to Vercel
```bash
vercel login
```
This opens a browser for authentication. Sign in with GitHub.

### Step 2: Deploy
```bash
cd /workspace
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No** (first time)
- What's your project's name? **physician-dashboard-2035**
- In which directory is your code located? **./** (press Enter)

### Step 3: Add Environment Variable
After deployment completes, run:
```bash
vercel env add VITE_API_BASE_URL production
```

When prompted, enter:
```
https://physician-dashboard-backend.fly.dev/api
```

Then redeploy to apply the environment variable:
```bash
vercel --prod
```

---

## 🎯 Alternative: Use Vercel Dashboard (Easier)

If you prefer a visual interface:

1. **Go to:** https://vercel.com/new

2. **Import your repository:** `lacson1/2035`

3. **Configure:**
   - Framework: Vite (auto-detected)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)

4. **Add Environment Variable:**
   ```
   Key: VITE_API_BASE_URL
   Value: https://physician-dashboard-backend.fly.dev/api
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

5. **Click "Deploy"** 🚀

---

## ✅ After Deployment

Your app will be live at: `https://physician-dashboard-2035.vercel.app`

### Important: Update Backend CORS

Add your Vercel URL to backend CORS:
```bash
flyctl secrets set CORS_ORIGIN="https://physician-dashboard-2035.vercel.app,http://localhost:5173" -a 2035
```

Replace `physician-dashboard-2035.vercel.app` with your actual Vercel domain.

---

## 📚 Detailed Documentation

- **Complete Guide:** `VERCEL_DEPLOYMENT_COMPLETE_GUIDE.md`
- **Instructions:** `VERCEL_DEPLOY_INSTRUCTIONS.md`
- **Automated Script:** `deploy-to-vercel.sh`

---

## 🆘 Need Help?

**Build fails locally?**
```bash
npm run build
```
Fix any errors before deploying.

**Not logged in?**
```bash
vercel login
```

**Forgot environment variable?**
```bash
vercel env add VITE_API_BASE_URL
```

---

**Status:** Ready to Deploy ✅  
**Backend:** https://physician-dashboard-backend.fly.dev ✅  
**Estimated Time:** 5 minutes
