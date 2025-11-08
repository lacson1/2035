# Fix Vercel CORS Error - Complete Guide

## 🔴 The Problem

Your frontend is deployed on Vercel but trying to connect to `localhost:3000`, which causes:
1. ❌ **CORS Error**: Backend only allows `http://localhost:5173`
2. ❌ **Connection Error**: Vercel can't reach `localhost:3000` (it's not publicly accessible)

---

## ✅ Solution: Two Steps Required

### Step 1: Update Vercel Environment Variable

Your frontend needs to point to your **deployed backend**, not localhost.

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Select your project**: `2035`
3. **Go to**: Settings → Environment Variables
4. **Add/Update**:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend.onrender.com/api` (or your Railway URL)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
5. **Save**
6. **Redeploy**: Go to Deployments → Latest → "..." → Redeploy

---

### Step 2: Update Backend CORS (Already Done ✅)

I've updated the backend to:
- ✅ Support multiple CORS origins
- ✅ Allow `*.vercel.app` domains
- ✅ Support comma-separated origins

**For your deployed backend on Render:**

Set environment variable in Render:
```
CORS_ORIGIN=https://2035-git-cursor-run-application-a271-lacs-projects-650efe27.vercel.app,https://*.vercel.app,http://localhost:5173
```

Or use wildcard (less secure but easier):
```
CORS_ORIGIN=https://*.vercel.app,http://localhost:5173
```

---

## 🚀 Quick Fix Steps

### 1. Get Your Backend URL

**If deployed on Render:**
- Go to Render Dashboard → Your Backend Service
- Copy the URL (e.g., `https://physician-dashboard-backend.onrender.com`)

**If deployed on Railway:**
- Go to Railway Dashboard → Your Service
- Copy the URL (e.g., `https://your-service.railway.app`)

### 2. Update Vercel Environment Variable

```
VITE_API_BASE_URL=https://your-backend-url.com/api
```

**Important**: Include `/api` at the end!

### 3. Update Backend CORS (Render/Railway)

Set in your backend environment variables:
```
CORS_ORIGIN=https://2035-git-cursor-run-application-a271-lacs-projects-650efe27.vercel.app,https://*.vercel.app
```

### 4. Redeploy Both

- **Vercel**: Redeploy frontend (automatic after env var change)
- **Render/Railway**: Redeploy backend (or it will auto-update)

---

## 🧪 Test It

After redeploying:

1. **Check backend CORS**:
```bash
curl -H "Origin: https://2035-git-cursor-run-application-a271-lacs-projects-650efe27.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-backend-url.com/api/v1/auth/login \
     -v
```

Should see: `Access-Control-Allow-Origin: https://2035-git-cursor-run-application-a271-lacs-projects-650efe27.vercel.app`

2. **Test login** from Vercel frontend

---

## 📋 Summary

✅ **Backend CORS updated** - Now supports multiple origins and wildcards
⏳ **You need to**:
   1. Set `VITE_API_BASE_URL` in Vercel to your deployed backend URL
   2. Set `CORS_ORIGIN` in Render/Railway to your Vercel domain
   3. Redeploy both services

---

## 🔍 Current Status

- ✅ Backend code updated (supports multiple CORS origins)
- ⏳ Vercel env var needs updating
- ⏳ Render/Railway CORS_ORIGIN needs setting
- ⏳ Both need redeploying

