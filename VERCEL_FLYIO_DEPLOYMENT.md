# Vercel + Fly.io Deployment Guide

Complete guide to deploy the frontend on Vercel and connect it with the backend on Fly.io.

## Overview
- **Frontend**: Vercel (React + Vite)
- **Backend**: Fly.io (Node.js + Express + PostgreSQL)

---

## 🚀 Part 1: Deploy Backend to Fly.io

### Prerequisites
1. Install Fly.io CLI:
   ```bash
   # macOS
   brew install flyctl
   
   # Linux
   curl -L https://fly.io/install.sh | sh
   
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. Verify installation:
   ```bash
   flyctl version
   ```

3. Login to Fly.io:
   ```bash
   flyctl auth login
   ```

### Step 1: Deploy Backend

```bash
cd backend

# Initialize Fly app (fly.toml already exists)
flyctl launch --no-deploy

# Use existing config? Yes
# Choose app name: physician-dashboard-backend (or your preferred name)
# Choose region: Select closest to your users (e.g., iad for US East)
```

### Step 2: Create PostgreSQL Database

```bash
# Create Postgres cluster
flyctl postgres create \
  --name physician-dashboard-db \
  --region iad \
  --initial-cluster-size 1 \
  --vm-size shared-cpu-1x \
  --volume-size 1

# Attach database to your app (creates DATABASE_URL automatically)
flyctl postgres attach physician-dashboard-db --app physician-dashboard-backend
```

### Step 3: Set Backend Environment Variables

Generate secure JWT secrets:
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET  
openssl rand -base64 32
```

Set the secrets in Fly.io:
```bash
# Required secrets
flyctl secrets set \
  JWT_SECRET="your-generated-jwt-secret-here" \
  JWT_REFRESH_SECRET="your-generated-refresh-secret-here" \
  --app physician-dashboard-backend

# CORS origin (we'll update this after Vercel deployment)
flyctl secrets set \
  CORS_ORIGIN="*" \
  --app physician-dashboard-backend

# Optional: Sentry for error tracking
# flyctl secrets set SENTRY_DSN="your-sentry-dsn" --app physician-dashboard-backend
```

### Step 4: Deploy Backend

```bash
# Deploy to Fly.io
flyctl deploy

# Monitor deployment
flyctl logs
```

### Step 5: Verify Backend Deployment

```bash
# Check status
flyctl status

# Test health endpoint
curl https://physician-dashboard-backend.fly.dev/health/live

# View logs
flyctl logs
```

Your backend URL will be: `https://physician-dashboard-backend.fly.dev`

**Save this URL** - you'll need it for Vercel configuration.

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Prerequisites
1. Create a Vercel account: https://vercel.com
2. Connect your GitHub account to Vercel

### Step 1: Update vercel.json

The `vercel.json` file needs to point to your Fly.io backend:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://physician-dashboard-backend.fly.dev/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Step 2: Deploy to Vercel via Dashboard

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables** (click "Environment Variables" section):
   ```
   VITE_API_BASE_URL=https://physician-dashboard-backend.fly.dev/api
   ```

6. Click **"Deploy"**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (run from project root)
vercel

# Follow prompts:
# - Link to existing project? No (first time)
# - What's your project's name? physician-dashboard-2035
# - In which directory is your code? ./
# - Want to override settings? No

# Set environment variable
vercel env add VITE_API_BASE_URL production
# Enter: https://physician-dashboard-backend.fly.dev/api

# Deploy to production
vercel --prod
```

### Step 3: Get Your Vercel URL

After deployment, Vercel will provide a URL like:
```
https://physician-dashboard-2035.vercel.app
```

**Save this URL** - you'll need it for CORS configuration.

---

## 🔗 Part 3: Connect Frontend & Backend

### Step 1: Update Backend CORS

Now that you have your Vercel URL, update the backend CORS settings:

```bash
cd backend

# Update CORS_ORIGIN to your Vercel URL
flyctl secrets set \
  CORS_ORIGIN="https://physician-dashboard-2035.vercel.app" \
  --app physician-dashboard-backend

# If you have multiple domains (e.g., preview deployments), use comma-separated:
flyctl secrets set \
  CORS_ORIGIN="https://physician-dashboard-2035.vercel.app,https://*.physician-dashboard-2035.vercel.app" \
  --app physician-dashboard-backend
```

### Step 2: Verify Connection

1. Open your Vercel URL: `https://physician-dashboard-2035.vercel.app`
2. Check browser console for errors
3. Try logging in or making an API request
4. Check backend logs: `flyctl logs --app physician-dashboard-backend`

---

## ✅ Verification Checklist

### Backend (Fly.io)
- [ ] App is deployed and running: `flyctl status`
- [ ] Health check works: `https://physician-dashboard-backend.fly.dev/health/live`
- [ ] Database is connected: `flyctl postgres list`
- [ ] Environment variables are set: `flyctl secrets list`
- [ ] Logs show no errors: `flyctl logs`

### Frontend (Vercel)
- [ ] Build succeeded (check Vercel dashboard)
- [ ] Environment variables set (VITE_API_BASE_URL)
- [ ] App loads: `https://your-app.vercel.app`
- [ ] No console errors in browser

### Integration
- [ ] Frontend can call backend APIs
- [ ] CORS errors resolved
- [ ] Authentication works (login/logout)
- [ ] API requests succeed

---

## 🐛 Troubleshooting

### Issue: CORS Errors

**Symptoms**: Console shows "CORS policy" errors

**Solution**:
```bash
# Check backend CORS_ORIGIN
flyctl secrets list --app physician-dashboard-backend

# Update to match your Vercel URL exactly
flyctl secrets set CORS_ORIGIN="https://your-app.vercel.app"

# Restart backend
flyctl apps restart physician-dashboard-backend
```

### Issue: API Calls Return 404

**Symptoms**: All API calls fail with 404

**Solution**:
1. Check `VITE_API_BASE_URL` in Vercel:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Should be: `https://physician-dashboard-backend.fly.dev/api`
   - Must include `/api` at the end

2. Redeploy frontend:
   ```bash
   vercel --prod
   ```

### Issue: Backend Not Responding

**Symptoms**: Requests timeout or fail to connect

**Solution**:
```bash
# Check backend status
flyctl status --app physician-dashboard-backend

# Check logs
flyctl logs --app physician-dashboard-backend

# If app is stopped, restart it
flyctl apps restart physician-dashboard-backend

# Wake up app with a request
curl https://physician-dashboard-backend.fly.dev/health/live
```

### Issue: Authentication Not Working

**Symptoms**: Login fails or token issues

**Solution**:
1. Check JWT secrets are set:
   ```bash
   flyctl secrets list --app physician-dashboard-backend
   ```

2. Verify cookies are enabled in browser

3. Check CORS includes credentials:
   - Backend should have `credentials: true` in CORS config
   - Frontend `api.ts` already includes `credentials: 'include'`

### Issue: Vercel Build Fails

**Symptoms**: Deployment fails during build

**Solution**:
1. Check build logs in Vercel dashboard
2. Verify `package.json` has all dependencies
3. Test build locally:
   ```bash
   npm run build
   ```

---

## 📝 Environment Variables Reference

### Backend (Fly.io)

| Variable | Value | How to Set |
|----------|-------|------------|
| `DATABASE_URL` | Auto-set by Fly.io | `flyctl postgres attach` |
| `JWT_SECRET` | Your generated secret | `flyctl secrets set JWT_SECRET=...` |
| `JWT_REFRESH_SECRET` | Your generated secret | `flyctl secrets set JWT_REFRESH_SECRET=...` |
| `CORS_ORIGIN` | Your Vercel URL | `flyctl secrets set CORS_ORIGIN=...` |
| `NODE_ENV` | `production` | Set in `fly.toml` |
| `PORT` | `3000` | Set in `fly.toml` |

### Frontend (Vercel)

| Variable | Value | How to Set |
|----------|-------|------------|
| `VITE_API_BASE_URL` | `https://physician-dashboard-backend.fly.dev/api` | Vercel Dashboard or `vercel env add` |

---

## 🔄 Updating After Deployment

### Update Backend

```bash
cd backend

# Make your code changes, then:
flyctl deploy

# Monitor deployment
flyctl logs
```

### Update Frontend

```bash
# Make your code changes, then:
# Option 1: Push to GitHub (auto-deploys if connected)
git add .
git commit -m "Update frontend"
git push

# Option 2: Deploy via CLI
vercel --prod
```

### Update Environment Variables

**Backend (Fly.io)**:
```bash
flyctl secrets set KEY=VALUE --app physician-dashboard-backend
```

**Frontend (Vercel)**:
```bash
# Via CLI
vercel env add KEY_NAME production

# Or via Dashboard:
# Vercel Dashboard → Project → Settings → Environment Variables
```

---

## 💰 Cost Estimate

### Fly.io (Free Tier)
- **Compute**: Up to 3 VMs with 256MB RAM (free)
- **PostgreSQL**: $0.10/GB storage + $0.02/GB compute
- **Bandwidth**: 160GB outbound (free)
- **Typical Cost**: $0-5/month for small app

### Vercel (Free Tier)
- **Bandwidth**: 100GB/month
- **Builds**: Unlimited
- **Deployments**: Unlimited
- **Cost**: $0/month (hobby tier)

**Total**: ~$0-5/month for small-scale production

---

## 🚀 Production Optimizations

### 1. Enable Auto-Deploy on Git Push

**Vercel**: Already enabled by default when connected to GitHub

**Fly.io**: Add GitHub Actions workflow (`.github/workflows/fly-deploy.yml`):
```yaml
name: Deploy to Fly.io
on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        working-directory: ./backend
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Get token: `flyctl auth token`
Add to GitHub: Settings → Secrets → New repository secret → `FLY_API_TOKEN`

### 2. Configure Custom Domain

**Vercel**:
```bash
# Via Dashboard: Project → Settings → Domains → Add Domain
# Via CLI:
vercel domains add your-domain.com
```

**Fly.io**:
```bash
flyctl certs add your-api-domain.com
```

### 3. Enable Monitoring

**Fly.io Metrics**:
```bash
flyctl dashboard
```

**Vercel Analytics**:
- Enable in Vercel Dashboard → Project → Analytics

### 4. Set Up Alerts

**Fly.io**: Configure in dashboard for:
- App crashes
- High memory usage
- Slow response times

---

## 📚 Useful Commands

### Fly.io
```bash
# Deploy
flyctl deploy

# Status
flyctl status

# Logs
flyctl logs

# Restart
flyctl apps restart

# Scale
flyctl scale count 2
flyctl scale vm shared-cpu-2x --memory 1024

# SSH into container
flyctl ssh console

# Secrets
flyctl secrets list
flyctl secrets set KEY=VALUE
```

### Vercel
```bash
# Deploy
vercel --prod

# Logs
vercel logs

# Environment variables
vercel env ls
vercel env add KEY_NAME production
vercel env rm KEY_NAME production

# Domains
vercel domains ls
vercel domains add your-domain.com
```

---

## 🆘 Getting Help

### Fly.io
- **Docs**: https://fly.io/docs
- **Community**: https://community.fly.io
- **Status**: https://status.fly.io

### Vercel
- **Docs**: https://vercel.com/docs
- **Support**: https://vercel.com/support
- **Community**: https://github.com/vercel/vercel/discussions

---

## ✨ Next Steps

1. ✅ Deploy backend to Fly.io
2. ✅ Deploy frontend to Vercel
3. ✅ Configure CORS
4. ✅ Test integration
5. [ ] Set up custom domain (optional)
6. [ ] Configure monitoring/alerts
7. [ ] Set up CI/CD (optional)

---

**Status**: Ready to deploy! 🚀

Your app will be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://physician-dashboard-backend.fly.dev`

