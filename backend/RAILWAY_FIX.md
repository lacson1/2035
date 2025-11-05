# Fix Railway Deployment Issue

## Problem
Railway is building from the root directory (frontend) instead of the `backend` directory.

## Solution: Set Root Directory in Railway

### Step 1: Go to Railway Service Settings

1. In your Railway project dashboard, click on your **backend service** (the one that failed)
2. Click on **Settings** tab (gear icon)
3. Scroll down to **Root Directory** section

### Step 2: Set Root Directory

1. In the **Root Directory** field, enter:
   ```
   backend
   ```
2. Click **Save** or **Update**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger automatic deployment

## Alternative: Create New Service

If the settings don't work, create a new service:

1. In Railway project, click **+ New**
2. Select **GitHub Repo**
3. Choose your repository
4. **IMPORTANT**: In the setup wizard, set **Root Directory** to `backend`
5. Railway will now use `backend/Dockerfile` instead of the root one

## Verify

After redeploying, check the build logs. You should see:
- ✅ Building from `backend/` directory
- ✅ Using `backend/Dockerfile`
- ✅ Installing backend dependencies (not frontend Sentry packages)
- ✅ Running Prisma migrations

## Quick Checklist

- [ ] Root Directory set to `backend` in Railway settings
- [ ] Service redeployed
- [ ] Build logs show correct Dockerfile being used
- [ ] Database migrations run successfully
- [ ] Application starts without errors

