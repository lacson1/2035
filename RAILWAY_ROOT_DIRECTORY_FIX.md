# 🚨 CRITICAL: Railway Root Directory Not Set

## The Problem
Railway is **STILL** building from the root directory (frontend) instead of `backend/`. 

The build log shows:
- `FROM nginx:alpine` ← This is the **FRONTEND** Dockerfile
- Installing Sentry packages ← These are **FRONTEND** dependencies
- `context: rjbl-S` ← Should be `backend`, not root

## ✅ SOLUTION: Set Root Directory in Railway Dashboard

### Method 1: Via Railway Web Dashboard (RECOMMENDED)

1. **Go to Railway**: https://railway.app
2. **Click on your project** (2035)
3. **Click on your backend service** (the one showing "Failed")
4. **Click the Settings tab** (⚙️ gear icon in the top right)
5. **Scroll down** to find "Root Directory" section
6. **Enter exactly**: `backend` (no slashes, no quotes)
7. **Click Save** or **Update**
8. **Wait for save confirmation**
9. **Go to Deployments tab**
10. **Click "Redeploy"** on the latest deployment

### Method 2: Delete and Recreate Service (If Method 1 doesn't work)

1. **Delete the current failing service**:
   - Go to your service
   - Settings → Danger Zone → Delete Service

2. **Create a new service**:
   - Click **+ New** in your Railway project
   - Select **GitHub Repo**
   - Choose your repository
   - **IMPORTANT**: During setup, look for "Root Directory" or "Source Directory"
   - Set it to: `backend`
   - Railway will create the service

3. **Add PostgreSQL** (if not already added):
   - Click **+ New** → **Database** → **Add PostgreSQL**

4. **Set Environment Variables**:
   - Go to your new backend service → **Variables**
   - Add all required variables (see DEPLOY_NOW.md)

5. **Deploy**:
   - Railway will auto-deploy or you can trigger manually

### Method 3: Use Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set root directory for the service
railway service --set-root-directory backend

# Or create a new service with root directory
railway service create --root-directory backend
```

## 🔍 How to Verify Root Directory is Set

After setting Root Directory and redeploying, check the build logs. You should see:

**✅ CORRECT (Building from backend):**
```
[Region: europe-west4]
=========================
Using Detected Dockerfile
=========================

context: backend  ← Should say "backend"
FROM node:18-alpine  ← Should be Node.js, NOT nginx
Installing express, prisma, etc.  ← Backend packages
```

**❌ WRONG (Building from root):**
```
context: rjbl-S  ← Random hash, not "backend"
FROM nginx:alpine  ← Frontend Dockerfile
Installing @sentry/react  ← Frontend packages
```

## 📍 Where to Find Root Directory Setting

In Railway Dashboard:
```
Project: 2035
└── Service: backend (or your service name)
    └── Settings Tab (⚙️)
        └── General Section
            └── Root Directory: [backend]  ← SET THIS!
```

## 🆘 If You Can't Find the Setting

1. **Check you're on the right service**: Make sure you clicked the backend service, not the frontend
2. **Check Railway version**: Some older interfaces might have it under "Source" or "Build Settings"
3. **Try the CLI method** (Method 3 above)
4. **Create a new service** (Method 2 above) - this ensures it's set from the start

## ⚠️ Important Notes

- Root Directory setting is **per-service**, not per-project
- You must set it for **each service** that needs a different root
- After setting, you **must redeploy** for changes to take effect
- The setting persists across deployments

## 🎯 After Fixing

Once Root Directory is set to `backend`:
1. ✅ Build will use `backend/Dockerfile`
2. ✅ Will install backend dependencies only
3. ✅ Will run Prisma migrations
4. ✅ Will start Node.js server (not nginx)

