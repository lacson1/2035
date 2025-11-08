# 🚀 Deployment Setup: Vercel (Frontend) + Render (Backend)

## Quick Start

### ✅ Files Created/Updated

1. **`backend/render.yaml`** - Render deployment configuration
2. **`backend/.renderignore`** - Files to exclude from Render build
3. **`backend/src/app.ts`** - Updated to listen on `0.0.0.0` (required for Render)
4. **`vercel.json`** - Already configured for Vercel
5. **`docs/RENDER_VERCEL_DEPLOYMENT.md`** - Complete deployment guide

---

## 📋 Step-by-Step Deployment

### Part 1: Deploy Backend to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **New → Web Service**
3. **Connect GitHub** and select your repository
4. **Configure**:
   - **Name**: `physician-dashboard-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm start`
   - **Plan**: Free (or upgrade for production)

5. **Set Environment Variables**:
   ```bash
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your-postgres-url>
   JWT_SECRET=<generate-with-openssl-rand-base64-32>
   JWT_REFRESH_SECRET=<generate-with-openssl-rand-base64-32>
   CORS_ORIGIN=https://your-app.vercel.app  # Set after Vercel deploy
   ```

6. **Create PostgreSQL Database** (if not already):
   - Render Dashboard → New → PostgreSQL
   - Copy the connection string to `DATABASE_URL`

7. **Deploy** - Render will build automatically

8. **Run Migrations** (after first deploy):
   - Render → Your Service → Shell
   - Run: `npx prisma migrate deploy`

9. **Get Backend URL**: 
   - Your service URL: `https://physician-dashboard-backend.onrender.com`
   - API base: `https://physician-dashboard-backend.onrender.com/api/v1`

---

### Part 2: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Add New Project**
3. **Import GitHub** repository
4. **Configure**:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Set Environment Variables**:
   ```bash
   VITE_API_URL=https://physician-dashboard-backend.onrender.com/api/v1
   ```

6. **Deploy** - Vercel will build and deploy automatically

7. **Get Frontend URL**: 
   - Your app URL: `https://your-app.vercel.app`

---

### Part 3: Connect Frontend to Backend

1. **Update Render CORS**:
   - Go to Render → Your Backend Service → Environment
   - Update `CORS_ORIGIN` to: `https://your-app.vercel.app`
   - Restart service

2. **Test Connection**:
   - Open your Vercel app
   - Try logging in
   - Check browser console for errors

---

## 🔧 API Configuration

The frontend uses relative API paths (`/api/v1/...`). To make it work with Render:

### Option 1: Use Vercel Proxy (Recommended)

Add to `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://physician-dashboard-backend.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option 2: Update API Base URL

If your API service uses absolute URLs, set `VITE_API_URL` in Vercel environment variables.

---

## 🐛 Common Issues & Fixes

### Backend Issues

**Build fails:**
- Check build logs in Render
- Ensure `npm run build` works locally
- Verify all dependencies in `package.json`

**Service won't start:**
- Check logs for errors
- Verify `PORT` env var (Render sets automatically)
- Ensure `npm start` works locally

**Database connection fails:**
- Verify `DATABASE_URL` is correct
- Check database is accessible
- Run migrations: `npx prisma migrate deploy`

**CORS errors:**
- Set `CORS_ORIGIN` to exact Vercel URL
- Restart service after updating env vars
- Check for trailing slashes

### Frontend Issues

**Build fails:**
- Check Vercel build logs
- Verify TypeScript compiles: `npm run build`
- Check for missing dependencies

**API calls fail:**
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Verify backend is running (check Render logs)

**404 errors:**
- Ensure API proxy is configured in `vercel.json`
- Check API paths match backend routes

---

## ✅ Verification Checklist

- [ ] Backend builds successfully on Render
- [ ] Backend service is running (green status)
- [ ] Health check works: `https://your-backend.onrender.com/health`
- [ ] Database migrations completed
- [ ] Frontend builds successfully on Vercel
- [ ] Frontend deploys without errors
- [ ] Environment variables set in both platforms
- [ ] CORS configured correctly
- [ ] Can login from frontend
- [ ] API calls work (check browser Network tab)

---

## 📝 Environment Variables Summary

### Render (Backend)
```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=<postgres-url>
JWT_SECRET=<32-char-secret>
JWT_REFRESH_SECRET=<32-char-secret>
CORS_ORIGIN=https://your-app.vercel.app
```

### Vercel (Frontend)
```bash
VITE_API_URL=https://physician-dashboard-backend.onrender.com/api/v1
```

---

## 🚀 Next Steps

1. **Test thoroughly** - Try all major features
2. **Monitor logs** - Check both Render and Vercel logs
3. **Set up monitoring** - Consider Sentry for error tracking
4. **Upgrade plans** - Free tier has limitations (Render spins down after 15 min)

---

## 📚 Full Documentation

See `docs/RENDER_VERCEL_DEPLOYMENT.md` for complete guide.

---

## 🆘 Need Help?

1. Check deployment logs in Render/Vercel dashboards
2. Review error messages in browser console
3. Verify environment variables are set correctly
4. Test backend API directly: `curl https://your-backend.onrender.com/health`

