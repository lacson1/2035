# Deploy Backend (Fly.io) + Frontend (Vercel)

Complete guide to deploy your full-stack application.

## 🎯 Overview

- **Backend:** Fly.io (API + Database)
- **Frontend:** Vercel (React App)
- **Total Time:** ~15 minutes

---

## Part 1: Deploy Backend to Fly.io (10 min)

### Step 1: Install Fly.io CLI

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
iwr https://fly.io/install.ps1 -useb | iex
```

### Step 2: Login to Fly.io

```bash
flyctl auth login
```

### Step 3: Deploy Backend

```bash
# Navigate to backend directory
cd backend

# Launch app (creates app and database)
flyctl launch --no-deploy

# When prompted:
# ✓ App name: physician-dashboard-backend (or your choice)
# ✓ Region: Choose closest to your users (e.g., iad for US East)
# ✓ PostgreSQL: YES - create database
# ✓ Deploy now: NO
```

### Step 4: Set Environment Secrets

```bash
# Generate and set JWT secrets
flyctl secrets set JWT_SECRET="$(openssl rand -base64 32)"
flyctl secrets set JWT_REFRESH_SECRET="$(openssl rand -base64 32)"

# Set CORS (we'll update this after Vercel deployment)
flyctl secrets set CORS_ORIGIN="*"
```

### Step 5: Deploy!

```bash
flyctl deploy
```

Wait for deployment to complete (~3-5 minutes).

### Step 6: Verify Backend is Running

```bash
# Check status
flyctl status

# View logs
flyctl logs

# Test health endpoint
curl https://physician-dashboard-backend.fly.dev/health/live

# Open API docs
flyctl open
# Then navigate to /api-docs
```

✅ **Your backend is now live at:** `https://physician-dashboard-backend.fly.dev`

---

## Part 2: Deploy Frontend to Vercel (5 min)

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

Go to https://vercel.com and sign up/login with GitHub.

### Step 3: Connect GitHub Repository

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repository
4. Click "Import"

### Step 4: Configure Project

**Framework Preset:** Vite

**Root Directory:** `./` (or leave as root)

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```bash
dist
```

**Install Command:**
```bash
npm install
```

### Step 5: Add Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://physician-dashboard-backend.fly.dev` |

### Step 6: Deploy!

Click **"Deploy"**

Wait for deployment to complete (~2-3 minutes).

✅ **Your frontend is now live!** Vercel will show you the URL (e.g., `https://your-app.vercel.app`)

---

## Part 3: Connect Backend & Frontend

### Step 1: Update Backend CORS

Now that you have your Vercel URL, update the backend CORS:

```bash
cd backend

# Replace with your actual Vercel URL
flyctl secrets set CORS_ORIGIN="https://your-app.vercel.app,https://your-app-git-*.vercel.app"
```

### Step 2: Redeploy Backend (Optional)

The secret change will automatically restart the app, but you can verify:

```bash
flyctl status
flyctl logs
```

### Step 3: Update Frontend API URL (If Needed)

If you used a different app name for Fly.io backend:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Update `VITE_API_URL` to your actual Fly.io URL
3. **Redeploy** from Deployments tab

---

## Part 4: Verify Everything Works

### Test Backend
```bash
# Health check
curl https://physician-dashboard-backend.fly.dev/health/live

# API docs
open https://physician-dashboard-backend.fly.dev/api-docs
```

### Test Frontend
1. Open your Vercel URL: `https://your-app.vercel.app`
2. Try to register/login
3. Check browser console for any errors
4. Verify API calls are going to your Fly.io backend

---

## 🎉 You're Done!

| Service | URL |
|---------|-----|
| **Frontend** | `https://your-app.vercel.app` |
| **Backend API** | `https://physician-dashboard-backend.fly.dev` |
| **API Docs** | `https://physician-dashboard-backend.fly.dev/api-docs` |
| **Health Check** | `https://physician-dashboard-backend.fly.dev/health/live` |

---

## Continuous Deployment

### Backend (Fly.io)
Every time you push to your repo:
```bash
cd backend
flyctl deploy
```

Or set up GitHub Actions (see `FLY_IO_DEPLOYMENT.md`).

### Frontend (Vercel)
Automatic! Every push to `main` branch automatically deploys to Vercel.

---

## Useful Commands

### Fly.io (Backend)
```bash
flyctl status              # Check app status
flyctl logs               # View logs
flyctl ssh console        # SSH into container
flyctl deploy             # Deploy updates
flyctl secrets list       # View secrets
flyctl postgres connect   # Connect to database
```

### Vercel (Frontend)
```bash
vercel                    # Deploy from CLI
vercel --prod             # Deploy to production
vercel logs               # View logs
vercel env ls             # List environment variables
```

---

## Troubleshooting

### Backend Issues

**Problem:** Database connection error
```bash
# Check if database is attached
flyctl postgres list
flyctl postgres attach physician-dashboard-db
```

**Problem:** Prisma errors
```bash
# SSH into container
flyctl ssh console

# Check Prisma
npx prisma migrate deploy
```

**Problem:** App won't start
```bash
# Check logs
flyctl logs

# Common fixes:
flyctl secrets list  # Verify all secrets are set
flyctl deploy        # Redeploy
```

### Frontend Issues

**Problem:** Can't connect to backend
1. Check `VITE_API_URL` in Vercel environment variables
2. Verify CORS is set correctly in backend
3. Check browser console for errors

**Problem:** Build fails
1. Check build logs in Vercel dashboard
2. Verify all dependencies are in `package.json`
3. Test build locally: `npm run build`

---

## Cost

### Fly.io (Backend)
- **Free Tier:** 3 VMs, 256MB RAM each, 3GB storage
- **Your app:** Uses 1 VM (~512MB RAM) + PostgreSQL
- **Cost:** $0/month on free tier

### Vercel (Frontend)
- **Hobby Plan:** Free
- 100GB bandwidth, unlimited deployments
- **Cost:** $0/month

**Total Cost:** $0/month 🎉

---

## Next Steps

1. ✅ Backend deployed to Fly.io
2. ✅ Frontend deployed to Vercel
3. ✅ Both connected
4. Set up custom domain (optional)
5. Add monitoring (optional)
6. Set up CI/CD (optional)

## Support

- **Fly.io Docs:** https://fly.io/docs
- **Vercel Docs:** https://vercel.com/docs
- **Your Backend Logs:** `flyctl logs`
- **Your Frontend Logs:** Vercel Dashboard

---

**Need help?** Check the logs first, then refer to:
- `backend/FLY_IO_DEPLOYMENT.md` - Detailed Fly.io guide
- `backend/FLY_QUICKSTART.md` - Quick reference
- `docs/DEPLOYMENT.md` - General deployment info

