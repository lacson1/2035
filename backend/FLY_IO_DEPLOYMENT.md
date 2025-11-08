# Fly.io Deployment Guide

## Prerequisites

1. **Install Fly.io CLI:**
   ```bash
   # macOS
   brew install flyctl
   
   # Linux
   curl -L https://fly.io/install.sh | sh
   
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Verify installation:**
   ```bash
   flyctl version
   ```

3. **Sign up / Login to Fly.io:**
   ```bash
   flyctl auth signup  # If you don't have an account
   # OR
   flyctl auth login   # If you already have an account
   ```

## Initial Setup

### Step 1: Configure Your App

The `fly.toml` file is already configured. You can customize:
- **app name** (line 4): Change `physician-dashboard-backend` if needed
- **region** (line 5): Change `iad` to region closest to you
  - `iad` - Washington D.C. (US East)
  - `lax` - Los Angeles (US West)
  - `lhr` - London (Europe)
  - `syd` - Sydney (Australia)
  - `sin` - Singapore (Asia)
  - See all regions: `flyctl platform regions`

### Step 2: Create PostgreSQL Database

Fly.io offers free PostgreSQL (limited):

```bash
cd backend

# Create a Postgres cluster
flyctl postgres create \
  --name physician-dashboard-db \
  --region iad \
  --initial-cluster-size 1 \
  --vm-size shared-cpu-1x \
  --volume-size 1
```

This will output a connection string. **Save it!**

### Step 3: Attach Database to Your App

```bash
# Attach the database (creates DATABASE_URL secret automatically)
flyctl postgres attach physician-dashboard-db --app physician-dashboard-backend
```

### Step 4: Set Required Secrets

Set your environment secrets (never commit these to git):

```bash
# JWT Secrets (generate strong random strings)
flyctl secrets set JWT_SECRET="your-super-secret-jwt-key-here" --app physician-dashboard-backend
flyctl secrets set JWT_REFRESH_SECRET="your-super-secret-refresh-key-here" --app physician-dashboard-backend

# CORS Origin (your frontend URL)
flyctl secrets set CORS_ORIGIN="https://your-frontend.vercel.app" --app physician-dashboard-backend

# Optional: Redis URL (if you have Redis)
# flyctl secrets set REDIS_URL="redis://your-redis-url" --app physician-dashboard-backend

# Optional: Sentry DSN (for error tracking)
# flyctl secrets set SENTRY_DSN="your-sentry-dsn" --app physician-dashboard-backend
```

**Generate secure secrets:**
```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Step 5: Deploy!

```bash
# Deploy your application
flyctl deploy

# Monitor deployment logs
flyctl logs
```

## Post-Deployment

### Verify Deployment

1. **Check app status:**
   ```bash
   flyctl status
   ```

2. **View logs:**
   ```bash
   flyctl logs
   ```

3. **Test health endpoint:**
   ```bash
   curl https://physician-dashboard-backend.fly.dev/health/live
   ```

4. **Test API docs:**
   ```bash
   open https://physician-dashboard-backend.fly.dev/api-docs
   ```

### Run Database Migrations

Migrations run automatically via `docker-entrypoint.sh`, but if you need to run them manually:

```bash
# SSH into your app
flyctl ssh console

# Run migrations
npx prisma migrate deploy

# Exit
exit
```

### Scale Your App

```bash
# Scale to specific number of instances
flyctl scale count 2

# Scale VM resources
flyctl scale vm shared-cpu-2x --memory 1024
```

## Managing Your App

### View Secrets
```bash
flyctl secrets list
```

### Update Secrets
```bash
flyctl secrets set KEY=NEW_VALUE
```

### Remove Secrets
```bash
flyctl secrets unset KEY
```

### View App Info
```bash
flyctl info
```

### View Metrics
```bash
flyctl dashboard
```

### Access PostgreSQL
```bash
# Connect to Postgres
flyctl postgres connect -a physician-dashboard-db

# Or use connection string
flyctl postgres connect -a physician-dashboard-db --database physician_dashboard_2035
```

## Continuous Deployment

### Option 1: Deploy from GitHub Actions

Create `.github/workflows/fly-deploy.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: superfly/flyctl-actions/setup-flyctl@master
      
      - name: Deploy to Fly.io
        run: flyctl deploy --remote-only
        working-directory: ./backend
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Then set `FLY_API_TOKEN` in GitHub Secrets:
```bash
# Get your token
flyctl auth token

# Add to GitHub: Settings → Secrets → New repository secret
# Name: FLY_API_TOKEN
# Value: (paste your token)
```

### Option 2: Manual Deployment
```bash
cd backend
flyctl deploy
```

## Troubleshooting

### Check Logs for Errors
```bash
flyctl logs
```

### Restart App
```bash
flyctl apps restart
```

### SSH into Container
```bash
flyctl ssh console
```

### Check App Status
```bash
flyctl status
flyctl checks list
```

### Common Issues

#### 1. Database Connection Error
**Error:** `Can't reach database server`

**Solution:**
```bash
# Verify DATABASE_URL is set
flyctl secrets list

# Re-attach database
flyctl postgres attach physician-dashboard-db
```

#### 2. Prisma Migration Errors
**Error:** `Migration failed`

**Solution:**
```bash
# SSH into app and run migrations manually
flyctl ssh console
npx prisma migrate deploy
```

#### 3. Out of Memory
**Error:** App keeps restarting

**Solution:**
```bash
# Increase memory
flyctl scale vm shared-cpu-1x --memory 512
# or
flyctl scale vm shared-cpu-2x --memory 1024
```

#### 4. App Won't Start
**Check logs:**
```bash
flyctl logs

# Common fixes:
# - Verify all secrets are set
# - Check DATABASE_URL is correct
# - Ensure Dockerfile builds successfully locally
```

## Cost Management

### Free Tier Includes:
- Up to 3 shared-cpu-1x VMs (256MB RAM each)
- 160GB outbound data transfer
- 3GB persistent volume storage

### Scale to Zero
Your app is configured to scale to zero when idle (saves resources):
- `auto_stop_machines = true`
- `min_machines_running = 0`

First request after idle will take 5-10 seconds to start.

### Monitor Usage
```bash
flyctl dashboard  # Opens web dashboard
```

## URLs

- **App URL:** `https://physician-dashboard-backend.fly.dev`
- **Dashboard:** `https://fly.io/apps/physician-dashboard-backend`
- **Metrics:** `https://fly.io/apps/physician-dashboard-backend/metrics`

## Update Frontend to Use Fly.io Backend

Update your `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://physician-dashboard-backend.fly.dev/api/:path*"
    }
  ]
}
```

Or set environment variable in Vercel:
```
VITE_API_URL=https://physician-dashboard-backend.fly.dev
```

## Useful Commands

```bash
# Deploy
flyctl deploy

# View logs
flyctl logs

# Open app in browser
flyctl open

# SSH into container
flyctl ssh console

# View status
flyctl status

# Scale app
flyctl scale count 2
flyctl scale vm shared-cpu-2x --memory 1024

# Restart app
flyctl apps restart

# View secrets
flyctl secrets list

# Set secret
flyctl secrets set KEY=VALUE

# View app info
flyctl info

# View regions
flyctl platform regions

# View VM sizes
flyctl platform vm-sizes

# Destroy app (careful!)
flyctl apps destroy physician-dashboard-backend
```

## Next Steps

1. ✅ Deploy to Fly.io
2. ✅ Set up database
3. ✅ Configure secrets
4. ✅ Test endpoints
5. ✅ Update frontend URL
6. ✅ Set up monitoring
7. ✅ (Optional) Configure CI/CD

## Support

- **Documentation:** https://fly.io/docs
- **Community:** https://community.fly.io
- **Status:** https://status.fly.io

---

**Status:** Ready to deploy ✅

