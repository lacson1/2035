# Fly.io Quick Start - Deploy in 5 Minutes

## 1. Install Fly.io CLI

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
iwr https://fly.io/install.ps1 -useb | iex
```

## 2. Login to Fly.io

```bash
flyctl auth login
```

## 3. Navigate to Backend Directory

```bash
cd backend
```

## 4. Launch Your App

```bash
# This will create the app and prompt for configuration
flyctl launch --no-deploy

# Choose:
# - App name: physician-dashboard-backend (or your choice)
# - Region: Choose closest to your users
# - PostgreSQL: Yes (create database)
# - Deploy now: No
```

## 5. Set Secrets

```bash
# Generate and set JWT secrets
flyctl secrets set JWT_SECRET="$(openssl rand -base64 32)"
flyctl secrets set JWT_REFRESH_SECRET="$(openssl rand -base64 32)"

# Set your frontend URL
flyctl secrets set CORS_ORIGIN="https://your-frontend.vercel.app"
```

## 6. Deploy!

```bash
flyctl deploy
```

## 7. Test Your Deployment

```bash
# View logs
flyctl logs

# Open in browser
flyctl open

# Test health endpoint
curl https://physician-dashboard-backend.fly.dev/health/live
```

## 8. Update Your Frontend

Update the API URL in your frontend to point to Fly.io:

**Option A: Environment Variable (Recommended)**
```bash
# In Vercel dashboard, add environment variable:
VITE_API_URL=https://physician-dashboard-backend.fly.dev
```

**Option B: Update vercel.json**
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

## Done! 🎉

Your backend is now live at:
- **API:** `https://physician-dashboard-backend.fly.dev`
- **Health:** `https://physician-dashboard-backend.fly.dev/health/live`
- **Docs:** `https://physician-dashboard-backend.fly.dev/api-docs`

## Quick Commands

```bash
flyctl logs          # View logs
flyctl status        # Check app status
flyctl open          # Open app in browser
flyctl ssh console   # SSH into container
flyctl deploy        # Deploy updates
```

## Need Help?

See `FLY_IO_DEPLOYMENT.md` for detailed instructions and troubleshooting.

---

**Estimated Time:** 5-10 minutes  
**Cost:** Free tier (3 VMs, 256MB RAM each)

