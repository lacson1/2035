# Force Railway Deployment - Step by Step

## Step 1: Check Railway Dashboard

1. Go to https://railway.app
2. Sign in
3. Click on your project "2035"
4. Click on your backend service

## Step 2: Check Service Status

Look at the service dashboard. What do you see?

- **"Building"** - Deployment in progress (wait for it)
- **"Active"** - Service is running (check if it's working)
- **"Failed"** - Deployment failed (check error logs)
- **"Stopped"** - Service is paused (click Resume)
- **Nothing** - Service might not exist (create new one)

## Step 3: Manual Redeploy

If service exists but not deploying:

1. Go to **Deployments** tab
2. Click **"Redeploy"** button (or three dots menu → Redeploy)
3. Watch the build logs

## Step 4: Check GitHub Connection

1. Go to service → **Settings**
2. Look for **"Source"** or **"GitHub"** section
3. Verify it shows: `lacson1/2035`
4. Check if branch is `main`
5. If not connected, click **"Connect Repository"**

## Step 5: Enable Auto-Deploy

1. Go to service → **Settings**
2. Look for **"Deploy"** section
3. Make sure **"Auto Deploy"** is enabled/toggled ON
4. Save if you changed anything

## Step 6: Verify Root Directory

1. Go to service → **Settings**
2. Look for **"Root Directory"** or **"Source"**
3. It should be: `backend`
4. If empty or wrong, set to: `backend`
5. Save

## Step 7: Use Railway CLI to Force Deploy

Open terminal and run:

```bash
cd "/Users/lacbis/ 2035"
npx @railway/cli login
npx @railway/cli link
npx @railway/cli up
```

## Step 8: Check for Errors

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **"Build Logs"** or **"Deploy Logs"**
4. Look for error messages
5. Share the error if you see one

## Quick Diagnostic Checklist

- [ ] Service exists in Railway project
- [ ] Service is connected to GitHub repo
- [ ] Auto-deploy is enabled
- [ ] Root Directory is set to `backend`
- [ ] Environment variables are set
- [ ] PostgreSQL database is added
- [ ] Service is not paused/stopped

## If Nothing Works: Create New Service

1. Delete current service (if exists)
2. Click **+ New** → **GitHub Repo**
3. Select `lacson1/2035`
4. During setup, set Root Directory to `backend`
5. Add PostgreSQL database
6. Set environment variables
7. Deploy

---

**What specific error or status do you see in Railway?** Share a screenshot or describe what you see and I can help fix it!

