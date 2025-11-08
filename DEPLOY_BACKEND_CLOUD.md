# Deploy Backend to Cloud - Quick Guide

## 🚀 Option 1: Railway (Recommended - Easiest)

### Step 1: Create Railway Account & Project
1. Go to **https://railway.app**
2. Sign in with **GitHub**
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose repository: **`lacson1/2035`**

### Step 2: Add PostgreSQL Database
1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway automatically creates `DATABASE_URL` environment variable
4. **Wait for database to be ready** (takes ~1 minute)

### Step 3: Deploy Backend Service
1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository: **`lacson1/2035`**
3. **IMPORTANT**: Set **Root Directory** to `backend`:
   - Click on the service → **Settings** (gear icon)
   - Scroll to **"Root Directory"**
   - Set to: `backend`
   - Click **Save**

### Step 4: Set Environment Variables
Go to your backend service → **Variables** tab and add:

#### Required Variables:
```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3000
JWT_SECRET=<paste-secret-below>
JWT_REFRESH_SECRET=<paste-secret-below>
```

#### Generate Secrets (run in terminal):
```bash
# JWT_SECRET
openssl rand -base64 32

# JWT_REFRESH_SECRET (run again)
openssl rand -base64 32
```

#### Optional Variables:
```env
CORS_ORIGIN=https://your-frontend.vercel.app
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 5: Deploy
- Railway automatically builds and deploys
- Watch the **Deployments** tab for progress
- Build takes ~3-5 minutes

### Step 6: Get Your Backend URL
After deployment:
- Railway provides URL: `https://your-service.railway.app`
- Copy this URL
- Use it in Vercel: `VITE_API_BASE_URL=https://your-service.railway.app/api`

### Step 7: Verify Deployment
```bash
# Health check
curl https://your-service.railway.app/health

# API info
curl https://your-service.railway.app/api/v1
```

---

## 🌐 Option 2: Render (Free Tier Available)

### Step 1: Create PostgreSQL Database
1. Go to **https://render.com**
2. Sign in with **GitHub**
3. Click **"New +"** → **"PostgreSQL"**
4. Configure:
   - **Name**: `physician-dashboard-db`
   - **Database**: `physician_dashboard_2035`
   - **Plan**: Free (or Starter $7/month)
5. Click **"Create Database"**
6. **Copy the "Internal Database URL"** (you'll need this)

### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repository: **`lacson1/2035`**
3. Configure:
   - **Name**: `physician-dashboard-backend`
   - **Root Directory**: `backend`
   - **Runtime**: **Docker**
   - **Plan**: Free (or Starter $7/month)

### Step 3: Set Environment Variables
In Render → Your Service → **Environment** tab:

```env
NODE_ENV=production
DATABASE_URL=<paste Internal Database URL from PostgreSQL>
PORT=3000
JWT_SECRET=<generate with: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate with: openssl rand -base64 32>
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Render builds Docker image automatically
3. Wait for deployment (~5-10 minutes)
4. Get URL: `https://your-service.onrender.com`

### Step 5: Update Vercel
Set `VITE_API_BASE_URL=https://your-service.onrender.com/api` in Vercel

---

## 🔐 Generate Secrets

Run these commands to generate secure secrets:

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET (run again)
openssl rand -base64 32
```

**Copy each output** and paste into your cloud platform's environment variables.

---

## ✅ Post-Deployment Checklist

- [ ] Backend deployed and running
- [ ] Database migrations completed (automatic via Dockerfile)
- [ ] Health check endpoint responding: `/health`
- [ ] API endpoint responding: `/api/v1`
- [ ] Backend URL copied
- [ ] `VITE_API_BASE_URL` set in Vercel
- [ ] Frontend redeployed with new API URL
- [ ] Test login functionality

---

## 🐛 Troubleshooting

### Build Fails
- Check deployment logs in Railway/Render dashboard
- Verify Root Directory is set to `backend`
- Ensure Dockerfile exists in `backend/` directory

### Database Connection Error
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running
- For Railway: Use `${{Postgres.DATABASE_URL}}`
- For Render: Use Internal Database URL (not External)

### Migrations Fail
- Check logs for specific error
- Ensure `prisma/migrations/` folder is in repository
- Verify Prisma schema is correct

### CORS Errors
- Set `CORS_ORIGIN` to your Vercel frontend URL
- Format: `https://your-project.vercel.app` (no trailing slash)

---

## 💰 Pricing

### Railway
- **Hobby Plan**: $5/month (includes $5 credit)
- **Pro Plan**: $20/month (includes $20 credit)
- **Free trial**: $5 credit to start

### Render
- **Free Tier**: $0/month (spins down after 15 min inactivity)
- **Starter Plan**: $7/month (always on)
- **Free tier**: Good for testing, slow wake-up time

---

## 🎯 Recommended Setup

**For Production:**
- **Backend**: Railway Starter ($5/month) or Render Starter ($7/month)
- **Frontend**: Vercel (Free tier is fine)
- **Database**: Included with Railway/Render PostgreSQL

**For Development/Testing:**
- **Backend**: Render Free tier (works, but slow wake-up)
- **Frontend**: Vercel Free tier
- **Database**: Render Free PostgreSQL

---

## 📝 Next Steps After Deployment

1. **Copy Backend URL** (e.g., `https://your-service.railway.app`)
2. **Update Vercel Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add/Update: `VITE_API_BASE_URL` = `https://your-service.railway.app/api`
3. **Redeploy Frontend** in Vercel
4. **Test the Application**:
   - Visit your Vercel URL
   - Try logging in
   - Verify API calls work

---

**Your backend is ready to deploy! Choose Railway (easiest) or Render (free tier available).**

