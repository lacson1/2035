# Fix Railway Root Directory - Step by Step

## The Problem
Railway is building from root directory (frontend) instead of `backend/`. The build shows `nginx:alpine` which is the frontend Dockerfile.

## Solution 1: Use Railway CLI (Recommended)

Since Root Directory setting isn't visible in Railway UI, use the CLI:

### Install Railway CLI (run in terminal):

**Option A: With sudo (if needed):**
```bash
sudo npm i -g @railway/cli
```

**Option B: Use npx (no install needed):**
```bash
npx @railway/cli login
```

### Then run these commands:

```bash
# Navigate to your project
cd "/Users/lacbis/ 2035"

# Login to Railway (will open browser)
npx @railway/cli login

# Link to your project
npx @railway/cli link

# List services to find your backend service name
npx @railway/cli service list

# Set root directory (replace 'your-service-name' with actual name)
npx @railway/cli variables set RAILWAY_ROOT_DIRECTORY=backend --service your-service-name

# Or try this alternative:
npx @railway/cli service --set-root-directory backend
```

---

## Solution 2: Delete and Recreate Service (Easier)

If CLI is too complicated, just recreate the service:

### Step 1: Delete Current Service
1. Go to Railway → Your service
2. Settings → Scroll to bottom → **Danger Zone**
3. Click **Delete Service**
4. Confirm deletion

### Step 2: Create New Service
1. In Railway project, click **+ New**
2. Select **GitHub Repo**
3. Choose repository: `lacson1/2035`
4. **IMPORTANT**: During setup wizard, BEFORE clicking Deploy:
   - Look for any field about "Source", "Path", "Directory", or "Root"
   - If you see it, set to: `backend`
   - If you don't see it, proceed anyway

### Step 3: After Service is Created
1. Go to the new service → **Settings**
2. Look for **"Source"** section
3. Look for **"Root Directory"** or **"Source Directory"**
4. If you find it, set to: `backend`
5. Save

### Step 4: Add PostgreSQL
1. Click **+ New** → **Database** → **Add PostgreSQL**

### Step 5: Set Environment Variables
Go to service → **Variables**:
- `NODE_ENV` = `production`
- `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
- `PORT` = `3000`
- `JWT_SECRET` = (generate with `openssl rand -base64 32`)
- `JWT_REFRESH_SECRET` = (generate with `openssl rand -base64 32`)

---

## Solution 3: Check Railway Project Settings

Sometimes the root directory is set at the project level:

1. Go to Railway project "2035"
2. Click on project **Settings** (not service settings)
3. Look for "Default Root Directory" or similar
4. Set to: `backend`

---

## Quick Test After Fix

After applying any solution, check build logs. You should see:
- ✅ `context: backend` (not random hash)
- ✅ `FROM node:18-alpine` (not nginx)
- ✅ Installing backend packages (express, prisma)

---

## What to Do Right Now

**Easiest option:** Delete the current service and create a new one. During creation, Railway sometimes prompts for the root directory.

1. Delete current service
2. Create new service from GitHub
3. During setup, look carefully for root directory option
4. Set to `backend`
5. Add PostgreSQL
6. Set environment variables
7. Deploy

This should work! 🚀

