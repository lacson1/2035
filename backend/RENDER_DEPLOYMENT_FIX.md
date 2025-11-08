# Render Deployment Fix Guide

## Current Issues and Solutions

### Issue 1: DATABASE_URL Not Set

**Error**: `Error validating datasource 'db': the URL must start with the protocol 'postgresql://' or 'postgres://'`

**Solution**: Set DATABASE_URL in Render Dashboard

1. Go to your Render service → **Environment** tab
2. Add environment variable:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```
3. If using Render PostgreSQL:
   - Go to your PostgreSQL database → **Connections** tab
   - Copy the **Internal Database URL** (for same service) or **External Database URL**
   - Format: `postgresql://user:password@host:port/database`

### Issue 2: Prisma OpenSSL Library Error

**Error**: `Error loading shared library libssl.so.1.1: No such file or directory`

**Solution**: Already fixed in Dockerfile - rebuild the service

1. The Dockerfile has been updated to install `libssl1.1`
2. Prisma schema updated to support both OpenSSL 1.1 and 3.0
3. **Action**: Trigger a new deployment in Render (or push a new commit)

### Issue 3: Redis Connection Errors

**Error**: `Redis connection error: Error: connect ECONNREFUSED`

**Solution**: This is expected if Redis is not configured

1. **Option A**: Leave Redis unconfigured (app will work without it)
   - Don't set `REDIS_URL` environment variable
   - App will continue without caching

2. **Option B**: Set up Redis (optional)
   - Create a Redis instance in Render
   - Set `REDIS_URL` environment variable
   - Format: `redis://host:port` or `rediss://host:port` (for SSL)

## Quick Fix Steps

### Step 1: Set DATABASE_URL

1. Go to Render Dashboard → Your Service → **Environment**
2. Click **Add Environment Variable**
3. Key: `DATABASE_URL`
4. Value: Your PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database`
   - Example: `postgresql://postgres:password@dpg-xxxxx-a.oregon-postgres.render.com/dbname`

### Step 2: Set Other Required Variables

```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-base64-32>
CORS_ORIGIN=https://your-app.vercel.app
```

### Step 3: Trigger Rebuild

1. Go to Render Dashboard → Your Service → **Manual Deploy**
2. Click **Deploy latest commit**
3. Or push a new commit to trigger auto-deploy

### Step 4: Run Migrations

After deployment succeeds:

1. Go to Render Dashboard → Your Service → **Shell**
2. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### Step 5: Verify

1. Check health endpoint: `https://your-service.onrender.com/health`
2. Should return: `{"status":"ok"}`
3. Check logs for any errors

## Environment Variables Checklist

### Required
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NODE_ENV` - Set to `production`
- [ ] `PORT` - Set to `10000` (Render default)
- [ ] `JWT_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `JWT_REFRESH_SECRET` - Generate with `openssl rand -base64 32`

### Optional but Recommended
- [ ] `CORS_ORIGIN` - Your Vercel frontend URL
- [ ] `REDIS_URL` - Redis connection string (optional)
- [ ] `SENTRY_DSN` - Sentry error tracking (optional)

## Troubleshooting

### Build Fails
- Check build logs in Render
- Ensure all dependencies are in `package.json`
- Verify Node.js version matches (18.x)

### Database Connection Fails
- Verify `DATABASE_URL` format is correct
- Check database is running and accessible
- Ensure database allows connections from Render IPs

### Prisma Errors
- Run `npx prisma generate` in Render Shell
- Check Prisma schema is valid
- Verify binary targets match system

### App Won't Start
- Check logs for error messages
- Verify all required env vars are set
- Check port binding (should use `PORT` env var)

## Next Steps After Fix

1. ✅ Set DATABASE_URL
2. ✅ Trigger rebuild
3. ✅ Run migrations
4. ✅ Test health endpoint
5. ✅ Deploy frontend to Vercel
6. ✅ Update CORS_ORIGIN with Vercel URL

---

**Note**: The code has been updated to handle missing DATABASE_URL more gracefully and support both OpenSSL versions. After setting DATABASE_URL and rebuilding, the deployment should succeed.

