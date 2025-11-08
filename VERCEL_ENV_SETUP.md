# Fix Vercel Environment Variable - Step by Step

## 🔴 Current Problem

Your Vercel frontend is trying to connect to `http://localhost:3000`, but:
- ❌ Vercel can't reach localhost (it's not publicly accessible)
- ❌ You need to point it to your deployed backend on Render

---

## ✅ Solution: Set Environment Variable in Vercel

### Step 1: Get Your Render Backend URL

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Click your **backend service**
3. Copy the **Service URL** (looks like: `https://physician-dashboard-backend-xxxx.onrender.com`)
4. Add `/api` to the end: `https://physician-dashboard-backend-xxxx.onrender.com/api`

---

### Step 2: Set Environment Variable in Vercel

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Click your project**: `2035`
3. **Go to**: **Settings** → **Environment Variables**
4. **Click**: **"Add New"**
5. **Fill in**:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-url.onrender.com/api` (replace with your actual Render URL)
   - **Environments**: ✅ Production ✅ Preview ✅ Development
6. **Click**: **"Save"**

---

### Step 3: Redeploy Frontend

After saving the environment variable:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **"..."** (three dots)
4. Click **"Redeploy"**
5. Wait for deployment to complete (~2 minutes)

---

### Step 4: Update Backend CORS (Render)

While frontend is redeploying, update backend CORS:

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click your backend service**
3. **Go to**: **Environment** tab
4. **Add/Update**:
   - **Key**: `CORS_ORIGIN`
   - **Value**: `https://2035-git-cursor-run-application-a271-lacs-projects-650efe27.vercel.app,https://*.vercel.app,http://localhost:5173`
5. **Save** (will auto-redeploy)

---

## 🧪 Verify It Works

After both redeploy:

1. **Refresh your Vercel frontend**
2. **Try logging in**
3. **Check browser console** - should see requests to your Render backend, not localhost

---

## 📋 Quick Checklist

- [ ] Got Render backend URL
- [ ] Set `VITE_API_BASE_URL` in Vercel
- [ ] Redeployed Vercel frontend
- [ ] Set `CORS_ORIGIN` in Render
- [ ] Backend auto-redeployed
- [ ] Tested login from Vercel

---

## 🔍 What's Your Render Backend URL?

If you don't know your Render backend URL:

1. Go to: https://dashboard.render.com
2. Look for your backend service
3. The URL is shown at the top (e.g., `physician-dashboard-backend.onrender.com`)

**Share it with me and I can help you set it up!**

