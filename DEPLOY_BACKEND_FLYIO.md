# 🚀 Backend Deployment to Fly.io - Complete Guide

This guide will help you deploy the Physician Dashboard 2035 backend to Fly.io in minutes.

---

## 📋 Table of Contents

1. [Quick Start (5 minutes)](#-quick-start-5-minutes)
2. [Prerequisites](#-prerequisites)
3. [Automated Deployment](#-automated-deployment)
4. [Manual Deployment](#-manual-deployment)
5. [Configuration](#-configuration)
6. [Verification](#-verification)
7. [Troubleshooting](#-troubleshooting)

---

## ⚡ Quick Start (5 minutes)

```bash
# 1. Install Fly.io CLI
curl -L https://fly.io/install.sh | sh

# 2. Login to Fly.io
flyctl auth login

# 3. Navigate to backend
cd backend

# 4. Deploy with automation
./scripts/deploy-flyio.sh
```

Done! Your backend is live! 🎉

---

## 📦 Prerequisites

### 1. Install Fly.io CLI

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Verify:**
```bash
flyctl version
```

### 2. Create Fly.io Account

```bash
flyctl auth signup
```

Or login:
```bash
flyctl auth login
```

### 3. Add Payment Method

Fly.io requires a credit card (you won't be charged unless you exceed free limits).

Visit: https://fly.io/dashboard

---

## 🤖 Automated Deployment

### Step 1: Setup Secrets

```bash
cd backend
./scripts/setup-flyio-secrets.sh
```

This interactive script will help you configure:
- ✅ PostgreSQL database
- ✅ JWT secrets (auto-generated)
- ✅ CORS origin
- ✅ Redis cache (optional)

### Step 2: Deploy

```bash
./scripts/deploy-flyio.sh
```

This script will:
- ✅ Check prerequisites
- ✅ Create or update app
- ✅ Build Docker image
- ✅ Run database migrations
- ✅ Deploy application
- ✅ Verify deployment

**That's it!** Your backend is now live!

---

## 🔧 Manual Deployment

If you prefer manual control:

### Step 1: Initialize App

```bash
cd backend
flyctl launch --copy-config --yes
```

### Step 2: Create Database

**Option A: Fly.io Postgres (Recommended)**

```bash
# Create Postgres cluster
flyctl postgres create

# Attach to your app
flyctl postgres attach --app your-app-name
```

**Option B: External Database**

Use Supabase, Neon, or any PostgreSQL provider.

### Step 3: Set Secrets

```bash
# Database URL (if using external)
flyctl secrets set DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"

# JWT Secrets (generate with openssl rand -base64 32)
flyctl secrets set JWT_SECRET="your-generated-secret"
flyctl secrets set JWT_REFRESH_SECRET="your-generated-secret"

# CORS
flyctl secrets set CORS_ORIGIN="https://your-frontend.vercel.app"

# Optional: Redis
flyctl secrets set REDIS_URL="redis://host:6379"
```

### Step 4: Deploy

```bash
flyctl deploy
```

---

## ⚙️ Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Access token secret | Generated 32-char string |
| `JWT_REFRESH_SECRET` | Refresh token secret | Generated 32-char string |
| `CORS_ORIGIN` | Frontend URL | `https://your-app.vercel.app` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `REDIS_URL` | Redis cache URL | None |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests | `100` |

### Generate Secure Secrets

```bash
# Generate JWT secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

---

## ✅ Verification

### 1. Check Status

```bash
flyctl status
```

**Expected output:**
```
Instances
ID       STATUS  HEALTH  REGION  CHECKS
abc123   running passing iad     1 total
```

### 2. View Logs

```bash
flyctl logs
```

**Look for:**
```
🚀 Starting Physician Dashboard Backend...
✅ Database URL configured
📦 Ensuring Prisma Client is generated...
📊 Running database migrations...
🚀 Starting application server...
   Listening on port 3000
```

### 3. Test Health Endpoint

```bash
curl https://your-app-name.fly.dev/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T10:00:00.000Z",
  "environment": "production",
  "database": "connected"
}
```

### 4. Test API

```bash
# List endpoints
curl https://your-app-name.fly.dev/api/v1

# Test authentication
curl -X POST https://your-app-name.fly.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🌐 Connect Frontend

### Update Frontend Environment

In your frontend `.env` file:

```bash
VITE_API_BASE_URL=https://your-app-name.fly.dev/api
```

### Restart Frontend

```bash
npm run dev
```

Your frontend will now use the Fly.io backend! 🎉

---

## 🔍 Monitoring

### Real-time Logs

```bash
# Stream logs
flyctl logs

# Last 100 lines
flyctl logs --tail 100

# Search logs
flyctl logs | grep ERROR
```

### Performance Metrics

```bash
# View metrics
flyctl dashboard metrics

# Or visit: https://fly.io/dashboard
```

### Health Checks

Automatic health checks run every 10 seconds:
- Endpoint: `/health`
- Timeout: 2 seconds
- Grace period: 5 seconds

---

## 🆘 Troubleshooting

### Issue: Deployment Fails

**Check logs:**
```bash
flyctl logs
```

**Common causes:**
- Missing secrets
- Database connection error
- Build failure

**Solution:**
```bash
# Verify secrets
flyctl secrets list

# Ensure DATABASE_URL is set
flyctl secrets set DATABASE_URL="..."

# Force rebuild
flyctl deploy --force
```

### Issue: Database Connection Error

**Error:** `DATABASE_URL is not set`

**Solution:**
```bash
# If using Fly.io Postgres
flyctl postgres attach

# If using external database
flyctl secrets set DATABASE_URL="postgresql://..."
```

### Issue: CORS Errors

**Error:** `Access-Control-Allow-Origin`

**Solution:**
```bash
# Set CORS_ORIGIN to your frontend URL
flyctl secrets set CORS_ORIGIN="https://your-frontend.com"

# Redeploy
flyctl deploy
```

### Issue: 502 Bad Gateway

**Causes:**
- App is starting (auto-start enabled)
- App crashed
- Health check failing

**Solution:**
```bash
# Check status
flyctl status

# View logs
flyctl logs

# Restart
flyctl apps restart
```

### Issue: Health Check Failing

**Check:**
```bash
flyctl logs
curl https://your-app-name.fly.dev/health
```

**Solution:**
- Ensure app listens on port 3000
- Verify health endpoint exists
- Check database connection

---

## 📊 Cost & Performance

### Free Tier Includes

- 3 shared-cpu-1x VMs (256MB RAM)
- 160GB bandwidth/month
- 3GB storage

**Cost:** $0/month with free tier

### Performance Optimization

**1. Enable Redis Caching:**
- 60-85% faster queries
- Use Upstash free tier
- Set `REDIS_URL` secret

**2. Auto-scaling:**
- Configured in `fly.toml`
- Auto-stop when idle (saves $$$)
- Auto-start on request (< 1s)

**3. Regional deployment:**
```bash
# Add regions for better latency
flyctl regions add lax  # US West
flyctl regions add lhr  # Europe
```

---

## 🔄 Updates & Maintenance

### Deploy Updates

```bash
# From backend directory
flyctl deploy
```

### Rollback

```bash
# List releases
flyctl releases

# Rollback to previous
flyctl releases rollback <version>
```

### Database Migrations

Migrations run automatically during deployment.

**Manual migration:**
```bash
flyctl ssh console -C "npx prisma migrate deploy"
```

### Backup Database

```bash
# Create backup
flyctl postgres db backup create

# List backups
flyctl postgres db backup list
```

---

## 🔒 Security Checklist

- ✅ Set strong JWT secrets
- ✅ Configure CORS properly
- ✅ Use PostgreSQL with SSL
- ✅ Enable rate limiting
- ✅ Keep dependencies updated
- ✅ Monitor logs regularly
- ✅ Use environment secrets (never commit)

---

## 📚 Additional Resources

### Documentation
- [Complete Deployment Guide](./backend/FLY_IO_DEPLOYMENT_GUIDE.md)
- [Quick Start](./backend/FLY_IO_QUICKSTART.md)
- [Fly.io Docs](https://fly.io/docs/)

### Scripts
- `./backend/scripts/deploy-flyio.sh` - Deploy script
- `./backend/scripts/setup-flyio-secrets.sh` - Secrets setup

### Community
- [Fly.io Forum](https://community.fly.io/)
- [Discord](https://fly.io/discord)

---

## 🎯 Next Steps

After deployment:

1. ✅ Test all API endpoints
2. ✅ Update frontend configuration
3. ✅ Set up custom domain (optional)
4. ✅ Enable Redis caching (optional)
5. ✅ Configure error tracking (Sentry)
6. ✅ Set up monitoring alerts

---

## 🎉 Success!

Your backend is now live on Fly.io! 🚀

**Your URLs:**
- Health: `https://your-app-name.fly.dev/health`
- API: `https://your-app-name.fly.dev/api/v1`

**Useful Commands:**
```bash
flyctl status           # Check status
flyctl logs             # View logs
flyctl ssh console      # SSH into container
flyctl apps restart     # Restart app
```

---

**Deployment Time:** ~5 minutes  
**Last Updated:** 2025-11-09  
**Status:** Production Ready ✅
