# Render Prisma Binary Target Fix

## Problem
Prisma was failing with OpenSSL-related errors:
```
Error: Env var PRISMA_QUERY_ENGINE_LIBRARY is provided but provided path debian-openssl-1.1.x can't be resolved.
PrismaClientInitializationError: Unable to require(`debian-openssl-1.1.x`).
Error loading shared library debian-openssl-1.1.x: No such file or directory
```

## Root Cause
The `PRISMA_QUERY_ENGINE_LIBRARY` environment variable was set to a binary target name (`debian-openssl-1.1.x`) instead of a file path. This caused Prisma to try to load it as a file, which failed.

## Solution Applied (2025-11-08)

### 1. Fixed Dockerfile
- **Removed** the incorrect `PRISMA_QUERY_ENGINE_LIBRARY` environment variable (line 62)
- **Updated** OpenSSL installation to use `libssl3` (OpenSSL 3.x) which is available in node:18-slim
- **Kept** `PRISMA_BINARY_TARGETS` to generate both OpenSSL 1.1.x and 3.0.x binaries for compatibility
- Prisma will now auto-detect the correct binary at runtime

### 2. Updated docker-entrypoint.sh
- Simplified Prisma generation to use auto-detection instead of forcing specific targets
- Removed hardcoded binary target flags

### 3. Improved Redis Error Logging
- Changed Redis connection errors from ERROR to INFO level when connection is refused
- Makes it clear that Redis is optional and the app continues without it

## Action Required in Render

### Using Docker (Recommended - Already Configured)
The Dockerfile has been fixed and is ready to deploy:

1. **Verify Render Settings**:
   - Go to Render Dashboard → Your Service → Settings
   - Ensure **Dockerfile Path** is set to: `backend/Dockerfile`
   - **Build Command** should be empty (Render will use Dockerfile)

2. **Set Required Environment Variables**:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - Your JWT secret key
   - `JWT_REFRESH_SECRET` - Your refresh token secret
   - `REDIS_URL` - (Optional) Redis connection string (app works without it)
   - `CORS_ORIGIN` - Your frontend URL(s)

3. **Deploy**:
   - Push your code changes
   - Render will automatically rebuild with the fixed Dockerfile
   - Monitor the build logs for success

### If Using Native Build (Without Docker)
Not recommended. Use the Dockerfile method above for consistent, reproducible builds.

## Verification

After deployment, check logs for:
- ✅ No `PRISMA_QUERY_ENGINE_LIBRARY` errors
- ✅ No `Unable to require` errors
- ✅ `✅ Redis connected successfully` OR `ℹ️ Redis not available, continuing without cache`
- ✅ `📊 Running database migrations...` completes successfully
- ✅ `🚀 Starting application...` appears

### Expected Log Output
```
🚀 Starting backend deployment...
🔧 Verifying Prisma Client binary...
📊 Running database migrations...
🏥 Checking and seeding hubs...
🚀 Starting application...
ℹ️ Redis not available, continuing without cache (if Redis not configured)
✅ Server started on port 3000
```

## Testing

After successful deployment:
1. **Health Check**: `https://your-service.onrender.com/health/live`
2. **API Docs**: `https://your-service.onrender.com/api-docs`
3. **Database**: Verify migrations ran by checking database tables

## Common Issues

### Issue: Prisma still fails
**Solution**: Check that `PRISMA_QUERY_ENGINE_LIBRARY` is NOT set in your Render environment variables. Remove it if present.

### Issue: Redis errors appear
**Solution**: These are informational if you haven't configured Redis. The app works fine without Redis. To silence them, simply don't set `REDIS_URL` or leave it empty.

---

**Fix Applied**: 2025-11-08 - Removed incorrect `PRISMA_QUERY_ENGINE_LIBRARY` environment variable, updated to OpenSSL 3.x, and improved error logging.

