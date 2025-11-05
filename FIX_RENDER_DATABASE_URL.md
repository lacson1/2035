# Fix Render DATABASE_URL Missing Error

## The Problem

Your backend is deploying correctly, but it's missing the `DATABASE_URL` environment variable. The error shows:

```
Error: Environment variable not found: DATABASE_URL
Error: DATABASE_URL is required
```

## Solution: Set DATABASE_URL in Render

### Step 1: Create PostgreSQL Database (if not already created)

1. Go to Render Dashboard: https://render.com
2. Click **"New +"**
3. Select **"PostgreSQL"**
4. Configure:
   - **Name**: `physician-dashboard-db`
   - **Database**: `physician_dashboard_2035`
   - **User**: `physician_user` (or auto-generated)
   - **Region**: Same as your backend service
   - **Plan**: Free (for testing) or Starter ($7/month)
5. Click **"Create Database"**
6. **Wait for database to be created**

### Step 2: Get Database Connection String

1. Click on your **PostgreSQL database** service
2. Go to **"Info"** or **"Connections"** tab
3. Look for **"Internal Database URL"** or **"Connection String"**
4. It will look like:
   ```
   postgresql://user:password@hostname:5432/database_name
   ```
5. **Copy this connection string**

### Step 3: Add Environment Variable to Backend Service

1. Go to your **backend service** (the one that failed)
2. Click on **"Environment"** tab (or Settings → Environment)
3. Click **"Add Environment Variable"**
4. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the connection string you copied
5. Click **"Save Changes"**

### Step 4: Add Other Required Environment Variables

While you're in Environment Variables, also add:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<generate with: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate with: openssl rand -base64 32>
CORS_ORIGIN=https://your-frontend.vercel.app
```

**Generate JWT secrets:**
```bash
openssl rand -base64 32  # Copy for JWT_SECRET
openssl rand -base64 32  # Copy for JWT_REFRESH_SECRET
```

### Step 5: Redeploy

1. Go to **"Manual Deploy"** tab
2. Click **"Deploy latest commit"**
3. Watch the logs - it should work now!

## Using Internal Database URL vs External

Render provides two connection strings:

- **Internal Database URL**: Use this! It's faster and more secure
  - Format: `postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/dbname`
  - Only works from other Render services
  
- **External Database URL**: For connecting from outside Render
  - Format: Similar but with different hostname
  - Use if connecting from Vercel or other services (not recommended)

**For your backend service on Render, use the Internal Database URL.**

## Quick Checklist

- [ ] PostgreSQL database created in Render
- [ ] Database is running (status: Available)
- [ ] `DATABASE_URL` environment variable set in backend service
- [ ] `NODE_ENV=production` set
- [ ] `PORT=3000` set
- [ ] `JWT_SECRET` set
- [ ] `JWT_REFRESH_SECRET` set
- [ ] Backend service redeployed

## After Fix

You should see:
- ✅ Database migrations run successfully
- ✅ Application starts without errors
- ✅ Backend is live and accessible

---

**The DATABASE_URL is the missing piece! Add it in Render Environment Variables and redeploy.**

