# 🚨 URGENT: Fix Railway Root Directory Issue

## The Problem
Railway is building from the **root directory** (frontend) instead of the **backend** directory. That's why you're seeing Sentry package errors - those are frontend dependencies.

## The Solution: Set Root Directory in Railway

### Step 1: Go to Your Service Settings

1. Open your Railway project: https://railway.app
2. Click on your **backend service** (the one showing "Failed")
3. Click the **Settings** tab (⚙️ gear icon)

### Step 2: Find Root Directory Setting

1. Scroll down to find **Root Directory** section
2. You should see a field that might be empty or set to `/` or `.`

### Step 3: Set Root Directory to `backend`

1. In the **Root Directory** field, type exactly:
   ```
   backend
   ```
   (No leading slash, no trailing slash, just `backend`)

2. Click **Save** or **Update**

### Step 4: Verify the Setting

After saving, you should see:
- Root Directory: `backend`

### Step 5: Redeploy

1. Go to the **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or make a small commit and push to trigger auto-deploy

## What You Should See After Fix

✅ **Build logs should show:**
- Building from `backend/` directory
- Installing backend packages (express, prisma, etc.)
- NOT installing Sentry packages
- Running Prisma migrations
- Starting Node.js server

## If Root Directory Setting Doesn't Appear

If you can't find the Root Directory setting:

### Option A: Create a New Service

1. In Railway project, click **+ New**
2. Select **GitHub Repo**
3. Choose your repository
4. **During setup**, look for **Root Directory** or **Source Directory**
5. Set it to `backend`
6. Delete the old service

### Option B: Use Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set root directory
railway variables set RAILWAY_ROOT_DIRECTORY=backend

# Deploy
railway up
```

## Visual Guide

In Railway Settings, you should see something like:

```
Settings
├── General
│   ├── Name: backend
│   ├── Root Directory: backend  ← SET THIS!
│   └── ...
├── Environment Variables
└── ...
```

## Still Having Issues?

If the Root Directory setting doesn't work:

1. **Check Railway Dashboard**: Make sure you're looking at the correct service
2. **Try creating a new service**: Sometimes it's easier to start fresh
3. **Check Railway docs**: https://docs.railway.app/develop/variables#root-directory

## Quick Test

After setting Root Directory and redeploying, check the build logs. You should see:

```
[Region: europe-west4]
=========================
Using Detected Dockerfile
=========================

context: backend  ← Should say "backend", not root
```

If you see `context: zfqk-FBEl` or similar, Railway is still using the wrong directory.

