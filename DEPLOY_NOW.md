# 🚀 Deploy Application - Complete Guide

## ✅ Code Pushed to GitHub

Your code has been pushed to GitHub successfully!

---

## 🌐 Deployment Steps

### Step 1: Deploy Backend to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click your backend service** (or create new if needed)
3. **Settings** → **Environment Variables** → **Add**:
   ```
   CORS_ORIGIN=https://2035-git-cursor-run-application-a271-lacs-projects-650efe27.vercel.app,https://*.vercel.app,http://localhost:5173
   DATABASE_URL=<your-render-postgres-internal-url>
   JWT_SECRET=<your-jwt-secret>
   JWT_REFRESH_SECRET=<your-refresh-secret>
   NODE_ENV=production
   PORT=3000
   ```
4. **Manual Deploy** → **Clear build cache & deploy**
5. **Wait for deployment** (~5-10 minutes)
6. **Copy your backend URL** (e.g., `https://physician-dashboard-backend-xxxx.onrender.com`)

---

### Step 2: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Select your project**: `2035`
3. **Settings** → **Environment Variables** → **Add**:
   ```
   Key: VITE_API_BASE_URL
   Value: https://your-backend.onrender.com/api
   ```
   (Replace with your actual Render backend URL)
4. **Deployments** → **Redeploy** (or it will auto-deploy from GitHub)

---

## ✅ Quick Checklist

- [ ] Backend deployed to Render
- [ ] Backend URL copied
- [ ] `VITE_API_BASE_URL` set in Vercel
- [ ] `CORS_ORIGIN` set in Render
- [ ] Both services deployed
- [ ] Test login from Vercel URL

---

## 🧪 Test Deployment

After both are deployed:

1. **Open your Vercel URL**: `https://2035-git-cursor-run-application-a271-lacs-projects-650efe27.vercel.app`
2. **Login with**:
   - Email: `test@admin.com`
   - Password: `Test123!@#`
3. **Should work!** ✅

---

## 📝 Current Status

- ✅ Code pushed to GitHub
- ⏳ Backend needs deployment to Render
- ⏳ Frontend needs environment variable update in Vercel

---

## 🚀 Next Steps

1. Deploy backend to Render (if not already deployed)
2. Set `VITE_API_BASE_URL` in Vercel
3. Set `CORS_ORIGIN` in Render
4. Both will auto-redeploy
5. Test from Vercel URL!

