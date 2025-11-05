# Fix Railway Root Directory Using CLI

## The Problem
Railway is still building from the root directory (frontend) instead of `backend/`. The build log shows `nginx:alpine` which is the frontend Dockerfile.

## Solution: Use Railway CLI

Since the Root Directory setting isn't visible in the Railway UI, we'll use the CLI to set it.

### Step 1: Install Railway CLI

Open your terminal and run:

```bash
npm i -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate.

### Step 3: Link to Your Project

```bash
cd "/Users/lacbis/ 2035"
railway link
```

Select your project "2035" when prompted.

### Step 4: List Services

```bash
railway service list
```

Note the name of your backend service (might be "2035" or similar).

### Step 5: Set Root Directory

Try one of these commands:

```bash
# Option 1: Set root directory for current service
railway variables set RAILWAY_ROOT_DIRECTORY=backend

# Option 2: If that doesn't work, try:
railway service --set-root-directory backend

# Option 3: Or create a new service with root directory
railway service create --name backend-api --root-directory backend
```

### Step 6: Verify and Deploy

```bash
# Check current service
railway service

# Deploy
railway up
```

---

## Alternative: Delete and Recreate Service

If CLI doesn't work, delete the current service and create a new one:

### Via Railway Dashboard:

1. Go to your service → Settings → Danger Zone → Delete Service
2. Click **+ New** → **GitHub Repo**
3. Choose your repository
4. **During setup**, look carefully for any field asking about:
   - Source directory
   - Build path
   - Working directory
   - Root directory
5. Set it to `backend`
6. Complete the setup

---

## Quick Test After Fix

After setting root directory, check the build logs. You should see:
- `context: backend` (not a random hash)
- `FROM node:18-alpine` (not nginx)
- Installing backend packages

