# Troubleshoot Railway Deployment

## Check These Things:

### 1. Is Railway Connected to GitHub?

1. Go to Railway → Your service → **Settings**
2. Look for **"Source"** or **"GitHub"** section
3. Verify it shows your repository: `lacson1/2035`
4. Check if it's connected to the correct branch (usually `main`)

### 2. Is Auto-Deploy Enabled?

1. Go to Railway → Your service → **Settings**
2. Look for **"Deploy"** or **"Auto Deploy"** section
3. Make sure **"Auto Deploy"** is enabled
4. If disabled, enable it

### 3. Trigger Manual Deployment

1. Go to Railway → Your service → **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or click **"Deploy"** button if available

### 4. Check Build Logs

1. Go to Railway → Your service → **Deployments** tab
2. Click on the latest deployment
3. Check **Build Logs** for errors

### 5. Verify Service is Active

1. Go to Railway → Your service
2. Check if service status shows:
   - **"Building"** - Deployment in progress
   - **"Active"** - Service is running
   - **"Failed"** - Check error logs
   - **"Stopped"** - Service needs to be started

### 6. Check Root Directory (Again)

1. Go to Railway → Your service → **Settings**
2. Verify **Root Directory** is set to: `backend`
3. If empty or wrong, set it to `backend` and save

### 7. Check Environment Variables

Make sure these are set:
- `DATABASE_URL` - Required
- `JWT_SECRET` - Required
- `JWT_REFRESH_SECRET` - Required
- `NODE_ENV` - Set to `production`
- `PORT` - Set to `3000`

### 8. Check if Service is Paused

1. Go to Railway → Your service
2. Look for a **"Pause"** or **"Resume"** button
3. If paused, click **"Resume"**

## Quick Fixes:

### Force Redeploy:
```bash
# Use Railway CLI
npx @railway/cli login
npx @railway/cli link
npx @railway/cli up
```

### Check Service Status:
```bash
npx @railway/cli status
```

### View Logs:
```bash
npx @railway/cli logs
```

## Common Issues:

1. **Service not connected to GitHub** - Reconnect in Settings
2. **Auto-deploy disabled** - Enable it in Settings
3. **Root directory not set** - Set to `backend`
4. **Missing environment variables** - Add required variables
5. **Service paused** - Resume the service
6. **Build failing** - Check build logs for errors

