# Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com
   - Sign in with GitHub

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `lacson1/2035`
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Environment Variables:**
   Add these in Vercel Dashboard → Settings → Environment Variables:
   
   ```env
   VITE_API_URL=https://your-backend-url.com
   ```
   
   **Note:** Replace `your-backend-url.com` with your actual backend URL (Railway, Render, or your own server)

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at: `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# For production deployment
vercel --prod
```

## Environment Variables

### Required for Frontend:
- `VITE_API_URL` - Backend API URL (e.g., `https://your-backend.railway.app` or `https://your-backend.render.com`)

### Optional:
- `VITE_SENTRY_DSN` - Sentry error tracking (if using)

## Backend Deployment

The frontend needs a backend API. Deploy backend separately:

### Option A: Railway (Recommended)
1. Go to https://railway.app
2. Create new project
3. Add PostgreSQL database
4. Deploy backend from GitHub
5. Set environment variables (see `backend/.env.example`)
6. Copy backend URL to `VITE_API_URL` in Vercel

### Option B: Render
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Set root directory to `backend`
5. Set environment variables
6. Copy backend URL to `VITE_API_URL` in Vercel

## Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed (Railway/Render)
- [ ] `VITE_API_URL` set in Vercel environment variables
- [ ] Backend database migrations run
- [ ] Backend seeded with initial data (if needed)
- [ ] Test login functionality
- [ ] Test API connectivity

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify `vercel.json` configuration

### API Connection Issues
- Verify `VITE_API_URL` is set correctly
- Check backend CORS settings allow Vercel domain
- Test backend API directly

### Environment Variables Not Working
- Ensure variables start with `VITE_` prefix
- Redeploy after adding variables
- Check variable names match exactly

## Current Status

✅ Code pushed to GitHub: `cursor/run-application-a271` branch
✅ Vercel configuration ready (`vercel.json`)
✅ Build passing locally
✅ All TypeScript errors fixed
✅ All linting issues resolved

## Next Steps

1. Deploy frontend to Vercel (follow steps above)
2. Deploy backend to Railway/Render
3. Set `VITE_API_URL` in Vercel
4. Test the deployed application
