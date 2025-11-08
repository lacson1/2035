# ⚠️ URGENT: Vercel Deployment Fix

## 🔴 Current Issue

You're testing on **Vercel** but frontend is trying to connect to `localhost:3000` which **won't work**.

**Your Vercel URL**: `https://2035-851d9jfja-lacs-projects-650efe27.vercel.app`

---

## ✅ IMMEDIATE FIX (2 Steps)

### Step 1: Set Vercel Environment Variable

1. **Go to**: https://vercel.com → Your Project → Settings → Environment Variables
2. **Add**:
   ```
   Key: VITE_API_BASE_URL
   Value: https://your-backend.onrender.com/api
   ```
   (Get your Render backend URL first!)
3. **Save** → **Redeploy**

### Step 2: Deploy Backend to Render (If Not Done)

1. **Go to**: https://dashboard.render.com
2. **Create/Select** your backend service
3. **Set Environment Variable**:
   ```
   CORS_ORIGIN=https://2035-851d9jfja-lacs-projects-650efe27.vercel.app,https://*.vercel.app
   ```
4. **Deploy**

---

## 🎯 What's Happening

- ✅ Code pushed to GitHub
- ✅ CORS updated to allow your Vercel domain
- ⏳ **You need**: Backend deployed to Render
- ⏳ **You need**: `VITE_API_BASE_URL` set in Vercel

---

## 🚀 After These Steps

1. Both services redeploy
2. Open Vercel URL
3. Login works! ✅

---

**Do these 2 steps and you're live!** 🎉

