# Deploy Both to Fly.io - Simple Guide

## 🚀 Quick Deploy (15 minutes)

### Prerequisites
```bash
# Install Fly CLI
brew install flyctl

# Login
flyctl auth login
```

---

## Step 1: Deploy Backend (10 min)

```bash
cd backend

# Create app
flyctl launch --no-deploy
# Choose: physician-dashboard-api, region (iad), PostgreSQL (YES), Deploy (NO)

# Set secrets
flyctl secrets set JWT_SECRET="$(openssl rand -base64 32)"
flyctl secrets set JWT_REFRESH_SECRET="$(openssl rand -base64 32)"
flyctl secrets set CORS_ORIGIN="https://physician-dashboard.fly.dev"

# Deploy
flyctl deploy

# Test
curl https://physician-dashboard-api.fly.dev/health/live
```

✅ Backend: `https://physician-dashboard-api.fly.dev`

---

## Step 2: Deploy Frontend (5 min)

```bash
# Go back to root
cd ..

# Deploy using the frontend config
flyctl launch --no-deploy --config fly.frontend.toml --dockerfile Dockerfile.frontend

# If prompted for app name: physician-dashboard
# If prompted for region: same as backend (iad)

# Deploy
flyctl deploy --config fly.frontend.toml

# Test
flyctl open -a physician-dashboard
```

✅ Frontend: `https://physician-dashboard.fly.dev`

---

## Step 3: Test Everything

### Test Backend
```bash
curl https://physician-dashboard-api.fly.dev/health/live
# Should return: {"status":"ok","timestamp":"..."}
```

### Test Frontend
```bash
open https://physician-dashboard.fly.dev
# Should open your app
```

### Test Login
1. Open frontend URL
2. Try to register/login
3. Check browser console - should see API calls to physician-dashboard-api.fly.dev

---

## 🎉 Done!

| Service | URL |
|---------|-----|
| Frontend | https://physician-dashboard.fly.dev |
| Backend | https://physician-dashboard-api.fly.dev |
| API Docs | https://physician-dashboard-api.fly.dev/api-docs |

---

## Update Deployments

### Update Backend
```bash
cd backend
flyctl deploy
```

### Update Frontend
```bash
# From root directory
flyctl deploy --config fly.frontend.toml
```

---

## View Logs

```bash
# Backend logs
flyctl logs -a physician-dashboard-api

# Frontend logs
flyctl logs -a physician-dashboard
```

---

## Troubleshooting

### Frontend can't connect to backend
```bash
# Check backend is running
curl https://physician-dashboard-api.fly.dev/health/live

# Check CORS
flyctl secrets list -a physician-dashboard-api | grep CORS

# Update CORS if needed
cd backend
flyctl secrets set CORS_ORIGIN="https://physician-dashboard.fly.dev"
```

### Build fails
```bash
# Test build locally
npm run build

# Check logs
flyctl logs -a physician-dashboard
```

---

## Cost: $0/month 🎉

Both apps run on Fly.io free tier.

---

**That's it!** Your full-stack app is now live on Fly.io.

