# 🔴 Vercel Deployment Fix

## The Problem

You're testing on **Vercel** (`https://2035-851d9jfja-lacs-projects-650efe27.vercel.app`), but:
- ❌ Frontend is trying to connect to `localhost:3000`
- ❌ Vercel **cannot** reach localhost (it's not publicly accessible)
- ❌ You need your backend deployed to Render

---

## ✅ Solution: Two Steps

### Step 1: Deploy Backend to Render

If your backend isn't deployed yet:

1. **Go to**: https://dashboard.render.com
2. **Create Web Service** (if not exists)
3. **Connect GitHub**: `lacson1/2035`
4. **Set**:
   - Root Directory: `backend`
   - Runtime: Docker
   - Branch: `cursor/run-application-a271`
5. **Environment Variables**:
   ```
   DATABASE_URL=<your-render-postgres-internal-url>
   CORS_ORIGIN=https://2035-851d9jfja-lacs-projects-650efe27.vercel.app,https://*.vercel.app,http://localhost:5173
   JWT_SECRET=<your-jwt-secret>
   JWT_REFRESH_SECRET=<your-refresh-secret>
   NODE_ENV=production
   PORT=3000
   ```
6. **Deploy**

---

### Step 2: Set Vercel Environment Variable

1. **Go to**: https://vercel.com
2. **Your Project** → **Settings** → **Environment Variables**
3. **Add**:
   ```
   Key: VITE_API_BASE_URL
   Value: https://your-backend.onrender.com/api
   ```
   (Replace with your actual Render backend URL)
4. **Environments**: ✅ Production ✅ Preview ✅ Development
5. **Save** → **Redeploy**

---

## 🎯 Quick Fix

**Your Vercel URL**: `https://2035-851d9jfja-lacs-projects-650efe27.vercel.app`

**What you need**:
1. Backend URL from Render (e.g., `https://physician-dashboard-backend-xxxx.onrender.com`)
2. Set `VITE_API_BASE_URL` in Vercel = `https://your-backend.onrender.com/api`
3. Set `CORS_ORIGIN` in Render = `https://2035-851d9jfja-lacs-projects-650efe27.vercel.app,https://*.vercel.app`

---

## ✅ After Setup

1. Both services redeploy (~5-10 minutes)
2. Open your Vercel URL
3. Login should work!

---

## 📝 Summary

- ✅ Backend code updated (CORS allows your Vercel domain)
- ⏳ Need backend deployed to Render
- ⏳ Need `VITE_API_BASE_URL` set in Vercel
- ⏳ Need `CORS_ORIGIN` set in Render

**Once these are set, everything will work!** 🚀

