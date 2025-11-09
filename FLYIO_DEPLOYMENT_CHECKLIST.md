# ✅ Fly.io Deployment Checklist

Use this checklist to deploy your backend to Fly.io.

---

## 📋 Pre-Deployment Checklist

### Prerequisites

- [ ] Fly.io CLI installed (`flyctl version`)
- [ ] Fly.io account created
- [ ] Payment method added to Fly.io
- [ ] Backend code is working locally
- [ ] Database schema is finalized

### Installation

```bash
# Install flyctl (if not already installed)
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login
```

---

## 🚀 Deployment Steps

### Step 1: Navigate to Backend

```bash
cd backend
```

- [ ] Confirmed in backend directory

### Step 2: Review Configuration

Check these files exist:
- [ ] `fly.toml` - Fly.io configuration
- [ ] `Dockerfile.flyio` - Docker build file
- [ ] `.dockerignore` - Build exclusions
- [ ] `docker-entrypoint.sh` - Startup script

### Step 3: Setup Secrets (Interactive)

```bash
./scripts/setup-flyio-secrets.sh
```

Configure:
- [ ] Database URL (Fly.io Postgres or external)
- [ ] JWT_SECRET (auto-generated)
- [ ] JWT_REFRESH_SECRET (auto-generated)
- [ ] CORS_ORIGIN (your frontend URL)
- [ ] REDIS_URL (optional, for caching)

**Verify secrets:**
```bash
flyctl secrets list
```

Expected secrets:
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] JWT_REFRESH_SECRET
- [ ] CORS_ORIGIN

### Step 4: Deploy Application

```bash
./scripts/deploy-flyio.sh
```

**Or manually:**
```bash
flyctl deploy
```

Wait for:
- [ ] Build completes
- [ ] Migrations run
- [ ] Health checks pass
- [ ] Application starts

---

## ✅ Post-Deployment Verification

### Step 5: Check Status

```bash
flyctl status
```

Verify:
- [ ] Status: `running`
- [ ] Health: `passing`
- [ ] Instances: 1 or more

### Step 6: View Logs

```bash
flyctl logs
```

Look for:
- [ ] "🚀 Starting Physician Dashboard Backend..."
- [ ] "✅ Database URL configured"
- [ ] "📊 Running database migrations..."
- [ ] "🚀 Starting application server..."
- [ ] No error messages

### Step 7: Test Health Endpoint

```bash
curl https://your-app-name.fly.dev/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T10:00:00.000Z",
  "environment": "production"
}
```

- [ ] Health check returns 200 OK
- [ ] Status is "ok"
- [ ] Environment is "production"

### Step 8: Test API Endpoints

```bash
# List all endpoints
curl https://your-app-name.fly.dev/api/v1
```

- [ ] API info endpoint works
- [ ] Returns list of endpoints

```bash
# Test authentication
curl -X POST https://your-app-name.fly.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

- [ ] Auth endpoint accessible
- [ ] Can login with test credentials (after seeding)

### Step 9: Verify Database

```bash
# Check database connection
flyctl ssh console -C "npx prisma migrate status"
```

- [ ] Migrations are up to date
- [ ] No pending migrations

---

## 🌐 Frontend Integration

### Step 10: Update Frontend Configuration

**File:** `.env` (in frontend root)

```bash
VITE_API_BASE_URL=https://your-app-name.fly.dev/api
```

- [ ] Frontend .env file updated
- [ ] Correct backend URL

### Step 11: Restart Frontend

```bash
npm run dev
```

- [ ] Frontend starts successfully
- [ ] Can login to application
- [ ] API requests work

### Step 12: Test Integration

- [ ] Login works
- [ ] Patient list loads
- [ ] Can create/edit patients
- [ ] Medications load
- [ ] Appointments work
- [ ] All features functional

---

## 🔧 Optional Enhancements

### Performance

- [ ] Redis caching enabled (optional)
  ```bash
  # Get Upstash Redis: https://upstash.com
  flyctl secrets set REDIS_URL="redis://..."
  flyctl deploy
  ```

### Monitoring

- [ ] Sentry configured (optional)
  ```bash
  flyctl secrets set SENTRY_DSN="your-sentry-dsn"
  flyctl deploy
  ```

### Custom Domain

- [ ] Custom domain added (optional)
  ```bash
  flyctl certs add api.your-domain.com
  ```

- [ ] DNS configured
  - [ ] A record or CNAME added
  - [ ] SSL certificate issued

### Scaling

- [ ] Memory adjusted (if needed)
  ```bash
  flyctl scale memory 512  # Upgrade to 512MB
  ```

- [ ] Multiple instances (if needed)
  ```bash
  flyctl scale count 2  # Scale to 2 instances
  ```

- [ ] Multiple regions (if needed)
  ```bash
  flyctl regions add lax  # Add US West
  ```

---

## 📊 Monitoring Setup

### Regular Checks

- [ ] Set up daily health checks
- [ ] Monitor logs for errors
- [ ] Check performance metrics
- [ ] Review cost usage

### Useful Commands

```bash
# Status
flyctl status

# Logs
flyctl logs

# Metrics
flyctl dashboard metrics

# SSH access
flyctl ssh console

# List secrets
flyctl secrets list

# Database status
flyctl postgres db list
```

---

## 🆘 Troubleshooting

### If Deployment Fails

- [ ] Check logs: `flyctl logs`
- [ ] Verify secrets: `flyctl secrets list`
- [ ] Check status: `flyctl status`
- [ ] Try force rebuild: `flyctl deploy --force`

### If Health Check Fails

- [ ] Check app logs
- [ ] Verify port 3000
- [ ] Check DATABASE_URL
- [ ] Restart app: `flyctl apps restart`

### If Database Connection Fails

- [ ] Verify DATABASE_URL secret
- [ ] Check database is running
- [ ] Test connection manually
- [ ] Review migration logs

### If CORS Errors Occur

- [ ] Set correct CORS_ORIGIN
  ```bash
  flyctl secrets set CORS_ORIGIN="https://your-frontend.com"
  flyctl deploy
  ```

### If 502 Bad Gateway

- [ ] Wait 10-20 seconds (auto-start)
- [ ] Check `flyctl status`
- [ ] Restart: `flyctl apps restart`
- [ ] Check logs for errors

---

## 📚 Documentation Reference

### Quick Reference

- [ ] [FLY_IO_QUICKSTART.md](./backend/FLY_IO_QUICKSTART.md) - 5-minute guide
- [ ] [DEPLOY_BACKEND_FLYIO.md](./DEPLOY_BACKEND_FLYIO.md) - Overview

### Detailed Guides

- [ ] [FLY_IO_DEPLOYMENT_GUIDE.md](./backend/FLY_IO_DEPLOYMENT_GUIDE.md) - Complete guide
- [ ] [FLY_IO_SETUP_COMPLETE.md](./backend/FLY_IO_SETUP_COMPLETE.md) - Setup summary

### Fly.io Resources

- [ ] [Fly.io Documentation](https://fly.io/docs/)
- [ ] [Fly.io Forum](https://community.fly.io/)
- [ ] [Fly.io Discord](https://fly.io/discord)
- [ ] [Pricing Calculator](https://fly.io/pricing)

---

## 🎯 Success Criteria

### Deployment Success

- ✅ Application is running
- ✅ Health checks passing
- ✅ No errors in logs
- ✅ Database connected
- ✅ Migrations applied
- ✅ API endpoints accessible

### Integration Success

- ✅ Frontend connects to backend
- ✅ Authentication works
- ✅ CRUD operations functional
- ✅ All features working
- ✅ No CORS errors
- ✅ Performance acceptable

### Production Ready

- ✅ Secrets properly configured
- ✅ SSL/HTTPS enabled
- ✅ Health monitoring active
- ✅ Logs accessible
- ✅ Auto-scaling configured
- ✅ Error handling in place

---

## 💰 Cost Check

### Free Tier Verification

- [ ] Using 256MB RAM (within free tier)
- [ ] Single instance (within free tier)
- [ ] Auto-stop enabled (saves costs)
- [ ] Bandwidth under 160GB/month
- [ ] Storage under 3GB

### Monitor Usage

```bash
# Check current usage
flyctl dashboard metrics

# View: https://fly.io/dashboard
```

- [ ] Monthly bandwidth < 160GB
- [ ] Storage < 3GB
- [ ] No unexpected charges

---

## 🎉 Deployment Complete!

### Final Checklist

- ✅ Backend deployed to Fly.io
- ✅ All secrets configured
- ✅ Health checks passing
- ✅ API endpoints working
- ✅ Frontend integrated
- ✅ Database connected
- ✅ Migrations applied
- ✅ Documentation reviewed
- ✅ Monitoring setup
- ✅ Cost optimized

### Your Backend URLs

**Health Check:**
```
https://your-app-name.fly.dev/health
```

**API Base:**
```
https://your-app-name.fly.dev/api/v1
```

**Authentication:**
```
https://your-app-name.fly.dev/api/v1/auth
```

### Quick Commands

```bash
# View status
flyctl status

# View logs
flyctl logs

# Restart app
flyctl apps restart

# Update app
flyctl deploy

# Scale memory
flyctl scale memory 512

# Add region
flyctl regions add lax
```

---

## 📞 Need Help?

### Resources

1. **Documentation**
   - Read the comprehensive guides
   - Check troubleshooting sections

2. **Logs**
   - `flyctl logs` for error messages
   - `flyctl status` for app status

3. **Community**
   - [Fly.io Forum](https://community.fly.io/)
   - [Discord Support](https://fly.io/discord)

4. **Official Support**
   - [Fly.io Documentation](https://fly.io/docs/)
   - [Status Page](https://status.fly.io/)

---

## 🎊 Congratulations!

Your backend is now successfully deployed on Fly.io! 🚀

**Deployment Time:** ~5 minutes  
**Status:** ✅ Production Ready  
**Cost:** $0/month (free tier)

**Next Steps:**
1. Deploy frontend (Vercel/Netlify)
2. Add custom domain
3. Enable monitoring
4. Optimize performance

---

**Checklist Version:** 1.0.0  
**Last Updated:** 2025-11-09
