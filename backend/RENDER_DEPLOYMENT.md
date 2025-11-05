# Deploy Backend to Render.com

## Prerequisites

- GitHub account (your code is at `lacson1/2035`)
- Render account (sign up at https://render.com)

## Step-by-Step Deployment

### Step 1: Sign Up for Render

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### Step 2: Create PostgreSQL Database

1. In Render Dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Configure:
   - **Name**: `physician-dashboard-db` (or your choice)
   - **Database**: `physician_dashboard_2035`
   - **User**: `physician_user` (or auto-generated)
   - **Region**: Choose closest to you
   - **Plan**: Free (for starting) or Starter ($7/month)
4. Click **"Create Database"**
5. **Save the connection string** - you'll need it later

### Step 3: Create Web Service (Backend)

1. In Render Dashboard, click **"New +"**
2. Select **"Web Service"**
3. **Connect GitHub Repository**:
   - Select `lacson1/2035`
   - Authorize if needed

4. **Configure Service**:
   - **Name**: `physician-dashboard-backend` (or your choice)
   - **Region**: Same as database (for low latency)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: **Docker** (important!)
   - **Dockerfile Path**: `backend/Dockerfile` (auto-detected)
   - **Docker Context**: `backend`

5. **Build & Deploy**:
   - **Build Command**: (leave empty - Docker handles it)
   - **Start Command**: (leave empty - Dockerfile CMD handles it)

6. **Environment Variables**:
   Click **"Add Environment Variable"** and add:

   ```env
   NODE_ENV=production
   DATABASE_URL=<paste your PostgreSQL connection string from Step 2>
   PORT=3000
   JWT_SECRET=<generate with: openssl rand -base64 32>
   JWT_REFRESH_SECRET=<generate with: openssl rand -base64 32>
   CORS_ORIGIN=https://your-frontend.vercel.app
   REDIS_URL=redis://localhost:6379
   ```

   **Generate secrets**:
   ```bash
   openssl rand -base64 32  # For JWT_SECRET
   openssl rand -base64 32  # For JWT_REFRESH_SECRET
   ```

7. **Plan**: 
   - **Free**: For testing (spins down after inactivity)
   - **Starter**: $7/month (always on)

8. Click **"Create Web Service"**

### Step 4: Wait for Deployment

Render will:
1. Clone your repository
2. Build the Docker image
3. Run database migrations (via docker-entrypoint.sh)
4. Start your backend
5. Give you a URL: `https://your-service.onrender.com`

### Step 5: Get Your Backend URL

After deployment completes, you'll see:
- **URL**: `https://your-service.onrender.com`
- **Status**: Live ✅

### Step 6: Update Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update: `VITE_API_BASE_URL` = `https://your-service.onrender.com/api`
3. Redeploy frontend

## Render Free Tier Limitations

⚠️ **Important Notes**:
- Free tier services **spin down after 15 minutes of inactivity**
- First request after spin-down takes ~30-60 seconds to wake up
- For production, upgrade to **Starter plan ($7/month)**

## Upgrading to Starter Plan

1. Go to your service in Render
2. Click **"Settings"** → **"Plan"**
3. Select **"Starter"** ($7/month)
4. Service will always be on

## Environment Variables Reference

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | ✅ Yes |
| `DATABASE_URL` | From PostgreSQL service | ✅ Yes |
| `PORT` | `3000` | ✅ Yes |
| `JWT_SECRET` | Generated secret | ✅ Yes |
| `JWT_REFRESH_SECRET` | Generated secret | ✅ Yes |
| `CORS_ORIGIN` | Your Vercel frontend URL | ⚠️ Recommended |
| `REDIS_URL` | Optional | ❌ No |

## Troubleshooting

### Build Fails
- Check build logs in Render Dashboard
- Verify Dockerfile is in `backend/` directory
- Check Root Directory is set to `backend`

### Service Won't Start
- Check deploy logs
- Verify all environment variables are set
- Check database connection string

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check PostgreSQL service is running
- Ensure database is in same region

### Slow Response (Free Tier)
- Normal for free tier (spins down after inactivity)
- Upgrade to Starter plan for always-on service

## Render Features

✅ **Free Tier Available**
✅ **Docker Support**
✅ **Automatic HTTPS**
✅ **Auto-deploy on Git push**
✅ **Built-in PostgreSQL**
✅ **Environment variable management**
✅ **Logs and metrics**

## Cost Summary

### Free Tier:
- **Web Service**: $0/month (spins down after inactivity)
- **PostgreSQL**: $0/month (free tier available)
- **Total**: $0/month

### Starter Plan:
- **Web Service**: $7/month (always on)
- **PostgreSQL**: $0/month (free tier) or $7/month (starter)
- **Total**: $7-14/month

---

**Render is a great choice for free tier! Deploy your Docker backend there.** 🚀

