# 🔧 Fix Connection - Step by Step

Your backend is ✅ **RUNNING** at: `https://physician-dashboard-backend.fly.dev`

## Current Status
- ✅ Backend deployed and responding
- ✅ All backend secrets configured
- ❓ Connection issue to fix

---

## Most Likely Issues & Fixes

### Issue 1: Frontend Not Deployed to Vercel Yet

**Check**: Have you deployed to Vercel?
- Go to https://vercel.com/dashboard
- Do you see your project listed?

**If NO** - Deploy now:
```bash
# Option 1: Via Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variable:
   VITE_API_BASE_URL = https://physician-dashboard-backend.fly.dev/api
5. Click "Deploy"

# Option 2: Via CLI
vercel login
vercel --prod
```

**If YES** - Go to Issue 2

---

### Issue 2: VITE_API_BASE_URL Not Set in Vercel

**Check**: Is the environment variable set?

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Look for `VITE_API_BASE_URL`

**If NOT SET** - Add it:
1. Click "Add New"
2. Name: `VITE_API_BASE_URL`
3. Value: `https://physician-dashboard-backend.fly.dev/api`
4. Select: **Production**, **Preview**, **Development** (all)
5. Click "Save"
6. **Redeploy**: Go to Deployments → Click "..." → Redeploy

**IMPORTANT**: The value MUST end with `/api`
- ✅ Correct: `https://physician-dashboard-backend.fly.dev/api`
- ❌ Wrong: `https://physician-dashboard-backend.fly.dev`

---

### Issue 3: CORS Not Matching Your Vercel URL

**Get your Vercel URL**:
1. Go to Vercel dashboard
2. Click on your project
3. Copy the URL (e.g., `https://2035-abc123.vercel.app`)

**Update CORS**:
```bash
cd backend

# Replace with YOUR actual Vercel URL
flyctl secrets set CORS_ORIGIN="https://your-actual-vercel-url.vercel.app,https://*.vercel.app"

# Example:
# flyctl secrets set CORS_ORIGIN="https://2035-abc123.vercel.app,https://*.vercel.app"
```

The `https://*.vercel.app` part allows preview deployments to work too.

---

### Issue 4: Testing Locally Instead of on Vercel

**Check**: Where are you trying to connect from?
- If you're running `npm run dev` locally, it will try to connect to `localhost:3000`
- You need to deploy to Vercel or set the env var locally

**For local testing with Fly.io backend**:
Create a `.env.local` file in the root:
```bash
VITE_API_BASE_URL=https://physician-dashboard-backend.fly.dev/api
```

Then restart your dev server:
```bash
npm run dev
```

---

## Quick Fix Commands

### 1. Deploy Frontend (if not deployed)
```bash
# Via CLI
vercel --prod
```

### 2. Set Environment Variable (if missing)
```bash
# Via CLI
vercel env add VITE_API_BASE_URL production
# When prompted, enter: https://physician-dashboard-backend.fly.dev/api

# Then redeploy
vercel --prod
```

### 3. Update CORS (after getting your Vercel URL)
```bash
cd backend
flyctl secrets set CORS_ORIGIN="https://your-vercel-url.vercel.app,https://*.vercel.app"
```

---

## Testing the Connection

### 1. Test Backend (Already Works!)
```bash
curl https://physician-dashboard-backend.fly.dev/health/live
# Should return: healthy
```

### 2. Test Frontend
1. Open your Vercel URL in browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for any errors (red text)

**Common Errors & What They Mean**:
- `CORS policy` → CORS_ORIGIN doesn't match (use Issue 3 fix)
- `404 Not Found` → VITE_API_BASE_URL is wrong (use Issue 2 fix)
- `Failed to fetch` → Backend not running (already working for you!)
- Nothing loads → Frontend not deployed (use Issue 1 fix)

---

## Visual Checklist

- [ ] Backend deployed ✅ (Already done!)
- [ ] Frontend deployed to Vercel
- [ ] `VITE_API_BASE_URL` set in Vercel = `https://physician-dashboard-backend.fly.dev/api`
- [ ] Got your Vercel URL
- [ ] `CORS_ORIGIN` in Fly.io = Your Vercel URL
- [ ] Redeployed frontend after setting env var
- [ ] Tested in browser (F12 → Console)
- [ ] No errors in console

---

## Next Steps

1. **Tell me**:
   - Have you deployed to Vercel yet?
   - If yes, what's your Vercel URL?
   - What errors do you see in browser console? (F12)

2. **Quick fixes** based on above:
   - Not deployed → Use Issue 1 fix
   - Deployed but 404s → Use Issue 2 fix
   - CORS error → Use Issue 3 fix

---

## Need More Help?

Share these details:
1. Your Vercel URL (if deployed)
2. Screenshot of browser console (F12)
3. Which issue you think it is (1, 2, 3, or 4)

I'll help you fix it! 🚀

