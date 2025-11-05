# Vercel Deployment Guide

## ✅ Frontend Successfully Deployed!

**Production URL:** https://2035-chhqnsp6m-lacs-projects-650efe27.vercel.app

**Status:** ✅ Ready and Live

## 📋 Next Steps

### 1. Set Environment Variables

Your frontend needs to know where your backend API is located. Set the environment variable in Vercel:

```bash
# Option 1: Using Vercel CLI
npx vercel env add VITE_API_BASE_URL production
# When prompted, enter your backend API URL (e.g., https://your-backend.railway.app/api)

# Option 2: Using Vercel Dashboard
# 1. Go to https://vercel.com/lacs-projects-650efe27/2035/settings/environment-variables
# 2. Add new variable:
#    - Key: VITE_API_BASE_URL
#    - Value: https://your-backend-url.com/api
#    - Environment: Production, Preview, Development
# 3. Redeploy after adding the variable
```

### 2. Deploy Backend Separately

The backend (Express/Node.js) needs to be deployed to a service that supports persistent Node.js servers:

**Recommended Services:**
- **Railway** (railway.app) - Easy deployment, supports PostgreSQL
- **Render** (render.com) - Free tier available
- **Heroku** (heroku.com) - Paid plans
- **DigitalOcean App Platform** - Good for production

**Backend Deployment Steps:**
1. Push backend code to a separate repository or branch
2. Connect to your chosen hosting service
3. Set environment variables (DATABASE_URL, JWT_SECRET, etc.)
4. Deploy
5. Update `VITE_API_BASE_URL` in Vercel with your backend URL

### 3. Redeploy After Environment Variable Changes

After setting environment variables, redeploy:

```bash
npx vercel --prod
```

Or trigger a redeploy from the Vercel dashboard.

## 🔍 Useful Vercel Commands

```bash
# View deployments
npx vercel ls

# View logs
npx vercel logs

# Redeploy
npx vercel --prod

# View project info
npx vercel inspect

# Check environment variables
npx vercel env ls

# Add environment variable
npx vercel env add VARIABLE_NAME production
```

## 📝 Notes

- The frontend is a static React/Vite app, perfect for Vercel
- The backend requires a Node.js hosting service (can't run on Vercel serverless functions without significant refactoring)
- Make sure CORS is configured in your backend to allow requests from your Vercel domain
- Environment variables set in Vercel will be available at build time for Vite

## 🚀 Current Deployment Info

- **Project:** lacs-projects-650efe27/2035
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

