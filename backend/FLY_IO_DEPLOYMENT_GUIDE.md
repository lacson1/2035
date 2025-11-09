# 🚀 Fly.io Deployment Guide - Backend

Complete guide for deploying the Physician Dashboard 2035 backend to Fly.io.

---

## 📋 Prerequisites

### 1. Install Fly.io CLI

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Verify Installation:**
```bash
flyctl version
```

### 2. Create Fly.io Account

```bash
flyctl auth signup
```

Or login if you already have an account:
```bash
flyctl auth login
```

### 3. Add Payment Method

Fly.io requires a credit card even for the free tier (you won't be charged unless you exceed free limits).

```bash
flyctl auth signup
# Follow the prompts to add payment info
```

---

## 🎯 Quick Deployment (Automated)

### Option 1: One-Command Deployment

```bash
cd backend
./scripts/deploy-flyio.sh
```

This script will:
1. Check if flyctl is installed
2. Verify authentication
3. Create or update the app
4. Check environment variables
5. Deploy the application

### Option 2: Setup Secrets First

```bash
cd backend
./scripts/setup-flyio-secrets.sh
./scripts/deploy-flyio.sh
```

---

## 📝 Manual Deployment (Step by Step)

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Initialize Fly.io App

```bash
flyctl launch --copy-config --yes
```

**What this does:**
- Uses existing `fly.toml` configuration
- Creates the app on Fly.io
- Sets up basic resources

**You'll be asked:**
- App name (use default or customize)
- Region (choose closest to your users)
- PostgreSQL database (choose "Yes" - recommended)

### Step 3: Create PostgreSQL Database

**Option A: Fly.io Postgres (Recommended)**

```bash
# Create a new Postgres cluster
flyctl postgres create

# Attach it to your app
flyctl postgres attach --app your-app-name
```

**Option B: External Database (Supabase, Neon, etc.)**

You'll set the `DATABASE_URL` secret manually (see Step 4).

### Step 4: Set Environment Secrets

#### Generate Secure Secrets

```bash
# Generate JWT secrets (save these!)
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

#### Set All Required Secrets

```bash
# Database (if using external)
flyctl secrets set DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# JWT Secrets
flyctl secrets set JWT_SECRET="your-generated-secret-here"
flyctl secrets set JWT_REFRESH_SECRET="your-generated-secret-here"

# Optional JWT expiry times
flyctl secrets set JWT_EXPIRES_IN="15m"
flyctl secrets set JWT_REFRESH_EXPIRES_IN="7d"

# CORS (your frontend URL)
flyctl secrets set CORS_ORIGIN="https://your-frontend.vercel.app"

# Optional: Redis for caching (Upstash recommended)
flyctl secrets set REDIS_URL="redis://default:password@host:6379"

# Optional: Rate limiting
flyctl secrets set RATE_LIMIT_WINDOW_MS="900000"
flyctl secrets set RATE_LIMIT_MAX_REQUESTS="100"
```

#### Verify Secrets

```bash
flyctl secrets list
```

### Step 5: Deploy Application

```bash
flyctl deploy
```

**What happens during deployment:**
1. Docker image is built
2. Prisma client is generated
3. Database migrations run automatically
4. Application starts on port 3000
5. Health checks begin

### Step 6: Verify Deployment

```bash
# Check app status
flyctl status

# View logs
flyctl logs

# Test health endpoint
curl https://your-app-name.fly.dev/health
```

---

## 🔧 Configuration Details

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | ✅ Yes | Access token secret | Generated 32-char string |
| `JWT_REFRESH_SECRET` | ✅ Yes | Refresh token secret | Generated 32-char string |
| `CORS_ORIGIN` | ✅ Yes | Frontend URL | `https://app.vercel.app` |
| `JWT_EXPIRES_IN` | ⚠️ Optional | Access token expiry | `15m` (default) |
| `JWT_REFRESH_EXPIRES_IN` | ⚠️ Optional | Refresh token expiry | `7d` (default) |
| `REDIS_URL` | ⚠️ Optional | Redis cache URL | `redis://host:6379` |
| `RATE_LIMIT_WINDOW_MS` | ⚠️ Optional | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | ⚠️ Optional | Max requests per window | `100` |

### fly.toml Configuration

The `fly.toml` file is pre-configured with optimal settings:

```toml
app = 'physician-dashboard-backend-2035'
primary_region = 'iad'  # US East

[env]
  NODE_ENV = 'production'
  PORT = '3000'

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true    # Saves costs
  auto_start_machines = true   # Instant wake-up
  min_machines_running = 0     # Free tier friendly

[[vm]]
  memory = '256mb'  # Minimum for free tier
  cpu_kind = 'shared'
  cpus = 1
```

**Customize:**
- `app`: Change to your desired app name
- `primary_region`: Choose region closest to users
  - `iad` - US East (Virginia)
  - `lax` - US West (Los Angeles)
  - `lhr` - Europe (London)
  - `sin` - Asia (Singapore)
  - [Full list](https://fly.io/docs/reference/regions/)

---

## 💰 Cost Optimization

### Free Tier Limits

Fly.io free tier includes:
- 3 shared-cpu-1x VMs (256MB RAM each)
- 160GB bandwidth per month
- 3GB storage

### Minimize Costs

**1. Use Auto-Stop Machines:**
```toml
auto_stop_machines = true
auto_start_machines = true
min_machines_running = 0
```

**2. Optimize Memory:**
```toml
memory = '256mb'  # Minimum
```

**3. Use External Database:**
- Supabase: 500MB free
- Neon: 0.5GB free
- Fly Postgres: Paid after 3GB

**4. Optional Redis:**
- Upstash: 10K requests/day free
- Only use if you need caching

---

## 🔍 Monitoring & Debugging

### View Logs

```bash
# Real-time logs
flyctl logs

# Last 100 lines
flyctl logs --tail 100

# Search logs
flyctl logs | grep ERROR
```

### Check Application Status

```bash
# Overall status
flyctl status

# Detailed info
flyctl info

# List all apps
flyctl apps list
```

### Access Application Shell

```bash
# SSH into the container
flyctl ssh console

# Run commands
flyctl ssh console -C "node -v"
flyctl ssh console -C "npx prisma migrate status"
```

### Monitor Performance

```bash
# View metrics
flyctl dashboard metrics

# Or visit: https://fly.io/dashboard
```

### Health Checks

Automatic health checks are configured:
- **Endpoint:** `/health`
- **Interval:** 10 seconds
- **Timeout:** 2 seconds
- **Grace Period:** 5 seconds

**Test manually:**
```bash
curl https://your-app-name.fly.dev/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T10:00:00.000Z",
  "environment": "production",
  "database": "connected",
  "uptime": 12345
}
```

---

## 🔄 Updates & Redeployment

### Deploy New Changes

```bash
# From backend directory
flyctl deploy
```

### Rollback to Previous Version

```bash
# List releases
flyctl releases

# Rollback
flyctl releases rollback <version>
```

### Zero-Downtime Deployment

Fly.io automatically does rolling deployments. To customize:

```bash
# Deploy with specific strategy
flyctl deploy --strategy rolling
```

---

## 🗄️ Database Management

### Run Migrations

Migrations run automatically during deployment via `docker-entrypoint.sh`.

**Manual migration:**
```bash
flyctl ssh console -C "npx prisma migrate deploy"
```

### Access Database

```bash
# Get connection string
flyctl postgres db list

# Connect to database
flyctl postgres connect -a your-postgres-app
```

### Backup Database

```bash
# Create backup
flyctl postgres db backup create

# List backups
flyctl postgres db backup list

# Restore backup
flyctl postgres db backup restore <backup-id>
```

### Seed Database (Optional)

```bash
# Set environment variable
flyctl secrets set SEED_DATABASE="true"

# Redeploy (seeding happens on startup)
flyctl deploy

# Remove flag after seeding
flyctl secrets unset SEED_DATABASE
```

---

## 🌐 Custom Domain

### Add Custom Domain

```bash
# Add domain
flyctl certs add your-domain.com

# Check certificate status
flyctl certs show your-domain.com

# List all certificates
flyctl certs list
```

### DNS Configuration

Add these records to your DNS provider:

**Option 1: CNAME (Subdomain)**
```
Type:  CNAME
Name:  api (or backend)
Value: your-app-name.fly.dev
```

**Option 2: A Record (Root Domain)**
```
# Get Fly.io IP addresses
flyctl ips list

Type:  A
Name:  @
Value: <IPv4 from above>

Type:  AAAA
Name:  @
Value: <IPv6 from above>
```

---

## 🔒 Security Best Practices

### 1. Secure Secrets

```bash
# Never commit secrets to git
# Always use flyctl secrets

# Rotate secrets periodically
flyctl secrets set JWT_SECRET="new-secret-here"
```

### 2. CORS Configuration

```bash
# Production: Set specific origin
flyctl secrets set CORS_ORIGIN="https://your-frontend.com"

# Multiple origins (comma-separated)
flyctl secrets set CORS_ORIGIN="https://app1.com,https://app2.com"
```

### 3. Rate Limiting

Already configured in the backend. Adjust if needed:

```bash
flyctl secrets set RATE_LIMIT_WINDOW_MS="900000"    # 15 minutes
flyctl secrets set RATE_LIMIT_MAX_REQUESTS="100"    # 100 requests
```

### 4. Database Security

- Always use SSL: `?sslmode=require`
- Use strong passwords
- Limit database user permissions
- Enable connection pooling

### 5. Regular Updates

```bash
# Check for security updates
npm audit

# Update dependencies
npm update

# Redeploy
flyctl deploy
```

---

## 🧪 Testing Deployment

### 1. Health Check

```bash
curl https://your-app-name.fly.dev/health
```

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T10:00:00.000Z",
  "environment": "production"
}
```

### 2. API Endpoints

```bash
# List all endpoints
curl https://your-app-name.fly.dev/api/v1

# Test authentication
curl -X POST https://your-app-name.fly.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Database Connection

```bash
# Check database connectivity (requires auth)
curl https://your-app-name.fly.dev/api/v1/patients \
  -H "Authorization: Bearer <your-token>"
```

---

## 📊 Performance Optimization

### 1. Enable Redis Caching

```bash
# Get Upstash Redis (free tier)
# Visit: https://upstash.com

# Set Redis URL
flyctl secrets set REDIS_URL="redis://..."

# Redeploy
flyctl deploy
```

**Performance gain:** 60-85% faster queries

### 2. Scale Vertically

```bash
# Upgrade VM size (if needed)
flyctl scale memory 512  # 512MB
flyctl scale memory 1024  # 1GB

# Check pricing
flyctl pricing
```

### 3. Scale Horizontally

```bash
# Add more instances
flyctl scale count 2

# Set minimum running
flyctl scale count 1 --min-machines-running 1
```

### 4. Enable Regional Scaling

```bash
# Add region
flyctl regions add lax

# Set backup regions
flyctl regions set iad lax lhr
```

---

## 🆘 Troubleshooting

### Issue: Deployment Fails

**Check logs:**
```bash
flyctl logs
```

**Common causes:**
- Missing environment variables
- Database connection failure
- Build errors
- Port conflicts

**Solution:**
```bash
# Verify secrets
flyctl secrets list

# Check DATABASE_URL is set
# Rebuild
flyctl deploy --force
```

### Issue: Database Connection Error

**Error:** `DATABASE_URL is not set`

**Solution:**
```bash
# Set DATABASE_URL
flyctl secrets set DATABASE_URL="postgresql://..."

# Redeploy
flyctl deploy
```

### Issue: Health Check Failing

**Check:**
```bash
flyctl logs
curl https://your-app-name.fly.dev/health
```

**Solution:**
- Ensure app is listening on port 3000
- Check `PORT` environment variable
- Verify health endpoint exists

### Issue: CORS Errors

**Error:** `Access-Control-Allow-Origin`

**Solution:**
```bash
# Set CORS_ORIGIN to your frontend URL
flyctl secrets set CORS_ORIGIN="https://your-frontend.com"

# For development (not recommended for production)
flyctl secrets set CORS_ORIGIN="*"
```

### Issue: 502 Bad Gateway

**Causes:**
- App is starting (auto-start enabled)
- App crashed
- Port misconfiguration

**Solution:**
```bash
# Check status
flyctl status

# View logs
flyctl logs

# Restart app
flyctl apps restart
```

### Issue: Out of Memory

**Error:** `JavaScript heap out of memory`

**Solution:**
```bash
# Increase memory
flyctl scale memory 512

# Or optimize your code
# Or add Redis caching
```

---

## 📚 Useful Commands

### App Management

```bash
flyctl apps list                    # List all apps
flyctl apps create                  # Create new app
flyctl apps destroy app-name        # Delete app
flyctl apps restart                 # Restart app
```

### Deployment

```bash
flyctl deploy                       # Deploy app
flyctl deploy --force               # Force rebuild
flyctl deploy --strategy rolling    # Rolling deployment
```

### Monitoring

```bash
flyctl status                       # App status
flyctl logs                         # View logs
flyctl logs -a app-name             # Logs for specific app
flyctl dashboard metrics            # Performance metrics
```

### Secrets

```bash
flyctl secrets list                 # List all secrets
flyctl secrets set KEY=VALUE        # Set secret
flyctl secrets unset KEY            # Remove secret
flyctl secrets import < .env        # Import from file
```

### Scaling

```bash
flyctl scale show                   # Show current scale
flyctl scale count 2                # Scale to 2 instances
flyctl scale memory 512             # Set memory to 512MB
flyctl scale vm shared-cpu-2x       # Change VM type
```

### Database

```bash
flyctl postgres create              # Create Postgres
flyctl postgres attach              # Attach to app
flyctl postgres db list             # List databases
flyctl postgres connect             # Connect to DB
```

### Regions

```bash
flyctl regions list                 # List all regions
flyctl regions add lax              # Add region
flyctl regions remove lax           # Remove region
flyctl regions set iad lax          # Set active regions
```

---

## 🎯 Next Steps

After deployment:

1. ✅ **Test Endpoints**
   ```bash
   curl https://your-app-name.fly.dev/health
   ```

2. ✅ **Update Frontend**
   ```bash
   # In your .env file
   VITE_API_BASE_URL=https://your-app-name.fly.dev/api
   ```

3. ✅ **Monitor Application**
   ```bash
   flyctl logs
   flyctl status
   ```

4. ✅ **Set Up Custom Domain**
   ```bash
   flyctl certs add api.your-domain.com
   ```

5. ✅ **Enable Redis** (Optional)
   - Sign up at Upstash
   - Set REDIS_URL secret
   - Redeploy

6. ✅ **Configure Monitoring**
   - Set up error tracking (Sentry)
   - Enable logging
   - Set up alerts

---

## 📞 Support & Resources

### Fly.io Documentation
- [Main Docs](https://fly.io/docs/)
- [Postgres](https://fly.io/docs/postgres/)
- [Secrets](https://fly.io/docs/reference/secrets/)
- [Scaling](https://fly.io/docs/reference/scaling/)

### Community
- [Fly.io Forum](https://community.fly.io/)
- [Discord](https://fly.io/discord)

### Pricing
- [Pricing Calculator](https://fly.io/pricing)
- [Free Tier Details](https://fly.io/docs/about/pricing/)

---

## 🎉 Success!

Your backend is now deployed on Fly.io! 🚀

**Your URLs:**
- Health Check: `https://your-app-name.fly.dev/health`
- API Base: `https://your-app-name.fly.dev/api/v1`
- Auth: `https://your-app-name.fly.dev/api/v1/auth`

**Update your frontend:**
```bash
VITE_API_BASE_URL=https://your-app-name.fly.dev/api
```

---

**Last Updated:** 2025-11-09  
**Guide Version:** 1.0.0
