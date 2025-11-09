# 📦 Deployment Summary - Vercel + Fly.io

## Overview

Your physician dashboard application is configured to deploy:
- **Frontend**: Vercel
- **Backend**: Fly.io

## 📁 Updated Files

### 1. `vercel.json`
✅ Updated to point to Fly.io backend:
```json
"destination": "https://physician-dashboard-backend.fly.dev/api/:path*"
```

### 2. Configuration Files Created

- ✅ **VERCEL_FLYIO_DEPLOYMENT.md** - Complete deployment guide with troubleshooting
- ✅ **DEPLOY_NOW.md** - Quick 5-minute deployment guide
- ✅ **deploy-vercel-flyio.sh** - Interactive deployment script

## 🚀 Deployment Steps

### Quick Deploy (Recommended)

```bash
# Use the interactive script
./deploy-vercel-flyio.sh
```

Choose option 3 to deploy both backend and frontend.

### Manual Deploy

#### 1. Deploy Backend to Fly.io

```bash
cd backend

# Login
flyctl auth login

# Generate secrets
export JWT_SECRET=$(openssl rand -base64 32)
export JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Set secrets
flyctl secrets set \
  JWT_SECRET="$JWT_SECRET" \
  JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  CORS_ORIGIN="*"

# Deploy
flyctl launch --no-deploy
flyctl deploy

# Verify
flyctl status
curl https://physician-dashboard-backend.fly.dev/health/live
```

**Backend URL**: `https://physician-dashboard-backend.fly.dev`

#### 2. Deploy Frontend to Vercel

**Via Dashboard** (Easiest):
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variable:
   - `VITE_API_BASE_URL` = `https://physician-dashboard-backend.fly.dev/api`
5. Deploy

**Via CLI**:
```bash
cd ..
vercel login
vercel --prod
vercel env add VITE_API_BASE_URL production
# Enter: https://physician-dashboard-backend.fly.dev/api
```

#### 3. Update CORS

After getting your Vercel URL (e.g., `https://your-app.vercel.app`):

```bash
cd backend
flyctl secrets set CORS_ORIGIN="https://your-app.vercel.app,https://*.vercel.app"
```

## 🔑 Environment Variables

### Backend (Fly.io)
Set via: `flyctl secrets set KEY=VALUE`

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Auto-set by Fly.io when you attach Postgres |
| `JWT_SECRET` | Yes | Generate with `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Yes | Generate with `openssl rand -base64 32` |
| `CORS_ORIGIN` | Yes | `https://your-app.vercel.app` |
| `SENTRY_DSN` | No | Your Sentry DSN for error tracking |

### Frontend (Vercel)
Set via: Vercel Dashboard → Settings → Environment Variables

| Variable | Required | Value |
|----------|----------|-------|
| `VITE_API_BASE_URL` | Yes | `https://physician-dashboard-backend.fly.dev/api` |
| `VITE_SENTRY_DSN` | No | Your Sentry DSN |

## ✅ Verification

### Backend
```bash
# Status
flyctl status

# Health check
curl https://physician-dashboard-backend.fly.dev/health/live

# Logs
flyctl logs
```

### Frontend
- Open your Vercel URL
- Check browser console (should have no errors)
- Try logging in
- Check network tab for API calls

## 🐛 Common Issues

### Issue: CORS Error
**Fix**: Update CORS_ORIGIN to match your Vercel URL:
```bash
cd backend
flyctl secrets set CORS_ORIGIN="https://your-exact-vercel-url.vercel.app"
```

### Issue: API 404 Errors
**Fix**: Check VITE_API_BASE_URL ends with `/api`:
- Correct: `https://physician-dashboard-backend.fly.dev/api`
- Wrong: `https://physician-dashboard-backend.fly.dev`

### Issue: Backend Not Responding
**Fix**: Check if it's running:
```bash
flyctl status
flyctl logs
```

## 📊 Deployment URLs

After deployment:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://physician-dashboard-backend.fly.dev`
- **API Docs**: `https://physician-dashboard-backend.fly.dev/api-docs`
- **Health**: `https://physician-dashboard-backend.fly.dev/health/live`

## 💰 Cost

- **Fly.io**: $0-5/month (free tier + small database)
- **Vercel**: $0/month (hobby tier)
- **Total**: ~$0-5/month

## 🔄 Updates

### Update Backend
```bash
cd backend
flyctl deploy
```

### Update Frontend
```bash
# Push to GitHub (auto-deploys)
git push

# Or via CLI
vercel --prod
```

## 📚 Documentation

- **Quick Guide**: `DEPLOY_NOW.md`
- **Full Guide**: `VERCEL_FLYIO_DEPLOYMENT.md`
- **Backend Fly.io Docs**: `backend/FLY_IO_DEPLOYMENT.md`
- **Frontend Vercel Docs**: `docs/RENDER_VERCEL_DEPLOYMENT.md`

## 🎯 Next Steps

1. ✅ Configuration files updated
2. 🔄 Deploy backend to Fly.io
3. 🔄 Deploy frontend to Vercel
4. 🔄 Configure CORS
5. 🔄 Test application
6. ⭐ (Optional) Set up custom domain
7. ⭐ (Optional) Configure monitoring

---

**Ready to deploy!** Use `./deploy-vercel-flyio.sh` or follow the manual steps above.

For detailed instructions, see:
- **Quick Start**: `DEPLOY_NOW.md`
- **Full Guide**: `VERCEL_FLYIO_DEPLOYMENT.md`

