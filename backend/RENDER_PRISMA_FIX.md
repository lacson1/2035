# Render Prisma Binary Target Fix

## Problem
Prisma is trying to use `linux-musl` (Alpine) binary instead of Debian binary, causing:
```
Error loading shared library libssl.so.1.1: No such file or directory
```

## Root Cause
Render's build environment may auto-detect the wrong platform, or Prisma Client is generated with wrong binary targets.

## Solution Applied

### 1. Updated `render.yaml`
- Added `PRISMA_BINARY_TARGETS` environment variable
- Updated build command to explicitly set binary targets
- Added `PRISMA_QUERY_ENGINE_LIBRARY` environment variable

### 2. Updated Dockerfile (if using Docker)
- Forces Debian binary targets in both builder and production stages
- Removes existing Prisma client before regeneration
- Sets environment variables explicitly

### 3. Updated Entrypoint Script
- Regenerates Prisma Client at runtime as safety check
- Sets binary targets explicitly

## Action Required in Render

### Option A: If Using Docker (Recommended)
1. In Render Dashboard → Your Service → Settings
2. Set **Dockerfile Path**: `backend/Dockerfile`
3. Remove or leave empty the **Build Command** field
4. Render will use Dockerfile automatically

### Option B: If Using Build Command (Current)
The `render.yaml` has been updated with correct Prisma binary targets.
1. Go to Render Dashboard → Your Service → Settings
2. Verify **Build Command** matches:
   ```
   PRISMA_BINARY_TARGETS=debian-openssl-1.1.x,debian-openssl-3.0.x npm install && npm run build && PRISMA_BINARY_TARGETS=debian-openssl-1.1.x,debian-openssl-3.0.x npx prisma generate --binary-targets=debian-openssl-1.1.x,debian-openssl-3.0.x
   ```
3. Add environment variable in **Environment** tab:
   - Key: `PRISMA_BINARY_TARGETS`
   - Value: `debian-openssl-1.1.x,debian-openssl-3.0.x`

### Option C: Manual Fix via Shell
If deployment still fails:
1. Go to Render Dashboard → Your Service → Shell
2. Run:
   ```bash
   export PRISMA_BINARY_TARGETS=debian-openssl-1.1.x,debian-openssl-3.0.x
   rm -rf node_modules/.prisma
   npx prisma generate --binary-targets=debian-openssl-1.1.x,debian-openssl-3.0.x
   ```

## Verification

After deployment, check logs for:
- ✅ `Prisma Client generated successfully`
- ✅ No `linux-musl` errors
- ✅ No `libssl.so.1.1` errors

## Next Steps

1. **Set DATABASE_URL** (if not already set)
2. **Trigger rebuild** in Render
3. **Check logs** for Prisma generation success
4. **Test health endpoint**: `https://your-service.onrender.com/health`

---

**Note**: The code has been updated to force Debian binary targets. After setting environment variables and rebuilding, Prisma should use the correct binary.

