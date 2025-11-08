# Render Deployment Guide - Complete Walkthrough

## 🌟 Why Choose Render?

### ✅ Advantages:
- **Free Tier Available**: $0/month for testing
- **Simple Pricing**: Clear, straightforward plans
- **Good Documentation**: Well-documented platform
- **Reliable**: Stable and reliable service
- **PostgreSQL Included**: Free PostgreSQL database available
- **Docker Support**: Full Docker support

### ⚠️ Considerations:
- **Free Tier Limitations**: Spins down after 15 min inactivity
- **Slow Wake-up**: 30-60 seconds on free tier
- **Setup Time**: Slightly longer than Railway
- **Production Cost**: $7/month (vs Railway's $5/month)

---

## 🚀 Complete Render Deployment Guide

### Step 1: Sign Up & Create Account

1. Go to **https://render.com**
2. Click **"Get Started for Free"**
3. Sign in with **GitHub** (recommended)
4. Authorize Render to access your repositories

### Step 2: Create PostgreSQL Database

1. In Render Dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Configure:
   - **Name**: `physician-dashboard-db`
   - **Database**: `physician_dashboard_2035`
   - **User**: `physician_user` (or auto-generated)
   - **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
   - **PostgreSQL Version**: `14` (recommended)
   - **Plan**: 
     - **Free** - For testing (spins down after inactivity)
     - **Starter** - $7/month (always on, recommended for production)
4. Click **"Create Database"**
5. **Wait for database to be ready** (~2-3 minutes)
6. **Copy the "Internal Database URL"**:
   - Go to your PostgreSQL service
   - Click on **"Info"** tab
   - Find **"Internal Database URL"**
   - Copy it (looks like: `postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/dbname`)
   - ⚠️ **Important**: Use "Internal Database URL", not "External Database URL"

### Step 3: Create Web Service (Backend)

1. In Render Dashboard, click **"New +"**
2. Select **"Web Service"**
3. **Connect Repository**:
   - Click **"Connect account"** if not already connected
   - Select **GitHub** → Authorize
   - Find repository: **`lacson1/2035`**
   - Click **"Connect"**

4. **Configure Service**:
   - **Name**: `physician-dashboard-backend`
   - **Region**: Same as database (e.g., `Oregon (US West)`)
   - **Branch**: `cursor/run-application-a271` (or `main` if merged)
   - **Root Directory**: `backend` ⚠️ **CRITICAL**
   - **Runtime**: **Docker** (select from dropdown)
   - **Plan**: 
     - **Free** - For testing ($0/month, spins down)
     - **Starter** - $7/month (always on, recommended)

5. **Environment Variables**:
   Click **"Add Environment Variable"** and add each:

   ```env
   NODE_ENV=production
   DATABASE_URL=<paste Internal Database URL from PostgreSQL>
   PORT=3000
   JWT_SECRET=Tu8cHhAT0ZhsgPcrRhZJh9ZMtnJEi7Ef5oekw/J8qEM=
   JWT_REFRESH_SECRET=bY6Su7/R1f4kTdW++A+w4otsoSi94ncL1Q57ty9V6ws=
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

   **Important Notes**:
   - Use **Internal Database URL** (not External)
   - Replace `your-frontend.vercel.app` with your actual Vercel domain
   - JWT secrets are already generated (use the ones above)

6. **Advanced Settings** (optional):
   - **Build Command**: (leave empty - Dockerfile handles it)
   - **Start Command**: (leave empty - Dockerfile handles it)
   - **Health Check Path**: `/health/live`

7. Click **"Create Web Service"**

### Step 4: Wait for Deployment

Render will:
1. ✅ Clone your repository
2. ✅ Build Docker image (takes ~5-10 minutes)
3. ✅ Run database migrations (automatic via `docker-entrypoint.sh`)
4. ✅ Start your backend
5. ✅ Provide URL: `https://your-service.onrender.com`

**Watch the logs** in Render Dashboard → Your Service → **Logs** tab

### Step 5: Verify Deployment

Once deployment completes:

1. **Check Health Endpoint**:
   ```bash
   curl https://your-service.onrender.com/health
   ```
   Should return: `{"status":"ok"}`

2. **Check API Endpoint**:
   ```bash
   curl https://your-service.onrender.com/api/v1
   ```
   Should return API information

3. **Check Logs**:
   - Go to Render Dashboard → Your Service → **Logs**
   - Look for: "Server running on port 3000"
   - Look for: "Database migrations completed"

### Step 6: Update Vercel Frontend

1. Go to **Vercel Dashboard** → Your Project
2. Go to **Settings** → **Environment Variables**
3. Add/Update:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-service.onrender.com/api`
   - ⚠️ **Important**: Include `/api` at the end
4. **Redeploy** frontend:
   - Go to **Deployments** tab
   - Click **"Redeploy"** on latest deployment

---

## 🔧 Render Configuration Details

### Environment Variables Reference

| Variable | Value | Required | Notes |
|----------|-------|----------|-------|
| `NODE_ENV` | `production` | ✅ Yes | Sets production mode |
| `DATABASE_URL` | PostgreSQL URL | ✅ Yes | Use Internal Database URL |
| `PORT` | `3000` | ✅ Yes | Server port |
| `JWT_SECRET` | Generated secret | ✅ Yes | Use provided secret |
| `JWT_REFRESH_SECRET` | Generated secret | ✅ Yes | Use provided secret |
| `CORS_ORIGIN` | Vercel URL | ⚠️ Important | Your frontend domain |
| `REDIS_URL` | Redis URL | ❌ Optional | For caching (not required) |
| `JWT_EXPIRES_IN` | `15m` | ❌ Optional | Token expiration |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | ❌ Optional | Refresh token expiration |

### Root Directory Setup

**CRITICAL**: Must set Root Directory to `backend`

1. Go to your Web Service
2. Click **Settings**
3. Scroll to **"Root Directory"**
4. Set to: `backend`
5. Click **Save**

---

## 💰 Render Pricing Explained

### Free Tier ($0/month)
- ✅ **Web Service**: Free (spins down after 15 min)
- ✅ **PostgreSQL**: Free (100MB storage)
- ⚠️ **Limitations**:
  - Spins down after 15 minutes of inactivity
  - Takes 30-60 seconds to wake up
  - Not suitable for production

### Starter Plan ($7/month)
- ✅ **Web Service**: Always on
- ✅ **PostgreSQL**: Included (1GB storage)
- ✅ **Performance**: Fast, consistent
- ✅ **Production Ready**: Yes

### When to Upgrade

**Upgrade to Starter if:**
- ✅ You're deploying to production
- ✅ You need always-on service
- ✅ You want fast response times
- ✅ You have users accessing the app

**Stay on Free if:**
- ✅ Just testing/developing
- ✅ No real users yet
- ✅ Okay with slow wake-up times

---

## 🐛 Common Render Issues & Solutions

### Issue 1: Build Fails

**Symptoms**: Deployment shows "Build Failed"

**Solutions**:
1. Check **Logs** tab for specific error
2. Verify **Root Directory** is set to `backend`
3. Ensure `Dockerfile` exists in `backend/` directory
4. Check that `package.json` is in `backend/` directory

### Issue 2: Database Connection Error

**Symptoms**: "Can't reach database" or "Connection refused"

**Solutions**:
1. Verify `DATABASE_URL` uses **Internal Database URL** (not External)
2. Check PostgreSQL service is running (Status: Available)
3. Ensure database and web service are in same region
4. Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`

### Issue 3: Migrations Fail

**Symptoms**: "Migration failed" in logs

**Solutions**:
1. Check logs for specific migration error
2. Verify `prisma/migrations/` folder is in repository
3. Ensure Prisma schema is correct
4. Check database has proper permissions

### Issue 4: CORS Errors

**Symptoms**: Frontend can't connect to backend

**Solutions**:
1. Set `CORS_ORIGIN` to your Vercel URL (exact match)
2. Format: `https://your-project.vercel.app` (no trailing slash)
3. Redeploy backend after changing environment variables

### Issue 5: Service Spins Down (Free Tier)

**Symptoms**: First request takes 30-60 seconds

**Solutions**:
1. This is normal on free tier
2. Upgrade to Starter plan ($7/month) for always-on
3. Or use a service like UptimeRobot to ping your service every 10 minutes

---

## 📊 Render vs Railway for Your Project

### Choose Render If:
- ✅ You want free tier for testing
- ✅ You prefer simpler pricing structure
- ✅ You're okay with slower setup
- ✅ You want to minimize initial costs

### Choose Railway If:
- ✅ You want faster setup
- ✅ You need better developer experience
- ✅ You want always-on from start ($5/month)
- ✅ You prefer better CLI tools

---

## ✅ Render Deployment Checklist

Before deploying:
- [ ] Render account created
- [ ] GitHub repository connected
- [ ] PostgreSQL database created
- [ ] Internal Database URL copied
- [ ] JWT secrets generated
- [ ] Vercel frontend URL ready

During deployment:
- [ ] Web Service created
- [ ] Root Directory set to `backend`
- [ ] Runtime set to Docker
- [ ] All environment variables added
- [ ] Build started successfully

After deployment:
- [ ] Health check passing: `/health`
- [ ] API endpoint responding: `/api/v1`
- [ ] Database migrations completed
- [ ] Backend URL copied
- [ ] Vercel updated with backend URL
- [ ] Frontend redeployed
- [ ] Test login functionality

---

## 🎯 Quick Start Commands

### Generate Secrets (if needed):
```bash
# JWT_SECRET
openssl rand -base64 32

# JWT_REFRESH_SECRET
openssl rand -base64 32
```

### Test Deployment:
```bash
# Health check
curl https://your-service.onrender.com/health

# API info
curl https://your-service.onrender.com/api/v1

# Test with authentication (after creating user)
curl -X POST https://your-service.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

---

## 📝 Render-Specific Tips

### 1. Use Internal Database URL
- Always use **Internal Database URL** for `DATABASE_URL`
- External URL is for connecting from outside Render
- Internal URL is faster and more secure

### 2. Region Selection
- Choose same region for database and web service
- Reduces latency
- Common choices: `Oregon (US West)`, `Frankfurt (EU)`

### 3. Free Tier Optimization
- Use UptimeRobot to ping service every 10 minutes
- Keeps service awake (free tier)
- URL: https://uptimerobot.com

### 4. Monitoring
- Check Render Dashboard → Logs regularly
- Set up email notifications for failures
- Monitor database storage usage

---

## 🚀 Next Steps After Render Deployment

1. **Copy Backend URL**: `https://your-service.onrender.com`
2. **Update Vercel**: Set `VITE_API_BASE_URL=https://your-service.onrender.com/api`
3. **Redeploy Frontend**: In Vercel dashboard
4. **Test Application**: Visit Vercel URL and test login
5. **Monitor Logs**: Check Render logs for any issues

---

**Render is a great choice if you want a free tier for testing or prefer their pricing structure!**

