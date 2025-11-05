# Fix Railway When Root Directory Setting is Missing

## Solution: Delete and Recreate Service

Since the Root Directory setting isn't visible in your Railway UI, we'll create a new service and set it during creation.

### Step 1: Delete Current Service

1. Go to your Railway project: https://railway.app
2. Click on your **backend service** (the one that's failing)
3. Go to **Settings** tab
4. Scroll to the bottom to **Danger Zone**
5. Click **Delete Service**
6. Confirm deletion

### Step 2: Create New Service with Root Directory

1. In your Railway project, click **+ New**
2. Select **GitHub Repo** or **Deploy from GitHub repo**
3. Choose your repository (`lacson1/2035`)
4. **IMPORTANT**: During the setup wizard, look for:
   - **Root Directory** field, OR
   - **Source Directory** field, OR
   - **Build Path** field
5. Enter: `backend` (no quotes, no slashes)
6. Click **Deploy** or **Create Service**

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **+ New**
2. Select **Database** → **Add PostgreSQL**
3. Railway will automatically create the `DATABASE_URL` variable

### Step 4: Set Environment Variables

Go to your new backend service → **Variables** tab:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3000
JWT_SECRET=<generate with: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate with: openssl rand -base64 32>
```

### Step 5: Verify Build

After creating the service, check the build logs. You should see:
- ✅ Building from `backend/` directory
- ✅ `FROM node:18-alpine` (not nginx)
- ✅ Installing backend packages (express, prisma)

---

## Alternative: Use Railway CLI

If you prefer using the command line:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Create a new service with root directory
railway service create --name backend --root-directory backend

# Or if that doesn't work, try:
railway up --service backend --root-directory backend
```

---

## Alternative: Move Backend to Root (Temporary Workaround)

If the above doesn't work, we can temporarily restructure:

1. Create a new branch
2. Move backend files to root
3. Deploy
4. Move back after deployment

But this is not recommended - better to use the service creation method above.

---

## What to Look For During Service Creation

When creating a new service in Railway, the setup wizard might show:

1. **Repository Selection** - Choose your repo
2. **Service Configuration** - Look for:
   - "Root Directory" or
   - "Source Directory" or  
   - "Build Path" or
   - "Working Directory"
3. **Build Settings** - May have root directory option here

If you don't see any of these options during creation, Railway might auto-detect. In that case:

1. After service is created, check if it's building from root
2. If it is, try the CLI method above
3. Or contact Railway support

---

## Quick Test After Recreation

Once the new service is created and deployed:

```bash
# Check if it's working
curl https://your-service.railway.app/health

# Should return: {"status":"ok"}
```

