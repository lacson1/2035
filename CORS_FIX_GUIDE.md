# CORS Issue Fix - Frontend & Backend Configuration

## Problem Identified

Your frontend at `https://2035.fly.dev` was trying to connect to `http://localhost:3000` because of misconfigured environment variables.

### Issues Found:

1. **Environment Variable Mismatch**:
   - `fly.frontend.toml` was setting `VITE_API_URL`
   - `Dockerfile.frontend` was using `VITE_API_URL`
   - BUT `src/services/api.ts` was expecting `VITE_API_BASE_URL`

2. **Missing CORS Origins**:
   - Backend CORS didn't include `https://2035.fly.dev`
   - Backend CORS didn't include `https://physician-dashboard.fly.dev`

3. **Wrong Default API URL**:
   - The default fallback was pointing to localhost instead of production backend

## Fixes Applied

### 1. Updated Frontend Configuration (`fly.frontend.toml`)
```toml
[env]
  VITE_API_BASE_URL = "https://physician-dashboard-backend.fly.dev/api"
```

### 2. Updated Dockerfile (`Dockerfile.frontend`)
```dockerfile
ARG VITE_API_BASE_URL=https://physician-dashboard-backend.fly.dev/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
```

### 3. Updated Backend CORS (`backend/src/config/env.ts`)
Added Fly.io frontend URLs to allowed origins:
```typescript
origin: [
  'http://localhost:5173', 
  'https://*.vercel.app',
  'https://2035.fly.dev',                    // ← Added
  'https://physician-dashboard.fly.dev',      // ← Added
  // ... other origins
]
```

## Deployment Steps

### Option 1: Use Automated Script (Recommended)

Run the deployment script which handles everything:

```bash
./deploy-flyio.sh
```

This script will:
- Deploy the backend with correct CORS settings
- Deploy the frontend with correct API URL
- Show you the URLs for both apps

### Option 2: Manual Deployment

#### Step 1: Deploy Backend

```bash
cd backend

# Set CORS environment variable (important!)
flyctl secrets set \
  CORS_ORIGIN="https://2035.fly.dev,https://physician-dashboard.fly.dev" \
  --app physician-dashboard-backend

# Deploy backend
flyctl deploy --config fly.toml --app physician-dashboard-backend

cd ..
```

#### Step 2: Deploy Frontend

```bash
# Deploy frontend with API URL
flyctl deploy \
  --config fly.frontend.toml \
  --app physician-dashboard \
  --build-arg VITE_API_BASE_URL="https://physician-dashboard-backend.fly.dev/api"
```

## Verification

After deployment, verify the fix:

### 1. Check Backend Health
```bash
curl https://physician-dashboard-backend.fly.dev/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": "...",
  "database": "connected"
}
```

### 2. Check Frontend
Open your browser to `https://2035.fly.dev` and:
- Open Developer Tools (F12)
- Go to Console tab
- Try to login
- You should see API requests going to `https://physician-dashboard-backend.fly.dev/api/v1/...`
- No more CORS errors!

### 3. Check CORS Headers
```bash
curl -X OPTIONS \
  -H "Origin: https://2035.fly.dev" \
  -H "Access-Control-Request-Method: POST" \
  https://physician-dashboard-backend.fly.dev/api/v1/auth/login \
  -v
```

Look for these headers in the response:
- `Access-Control-Allow-Origin: https://2035.fly.dev`
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`

## Monitoring

Monitor your deployments:

```bash
# Backend logs
flyctl logs --app physician-dashboard-backend

# Frontend logs
flyctl logs --app physician-dashboard

# Check app status
flyctl status --app physician-dashboard-backend
flyctl status --app physician-dashboard
```

## Troubleshooting

### Issue: Still seeing CORS errors

1. **Check that CORS_ORIGIN is set on backend**:
   ```bash
   flyctl secrets list --app physician-dashboard-backend
   ```
   
   If `CORS_ORIGIN` is not listed, set it:
   ```bash
   flyctl secrets set CORS_ORIGIN="https://2035.fly.dev,https://physician-dashboard.fly.dev" --app physician-dashboard-backend
   ```

2. **Verify frontend is using correct API URL**:
   - Open browser DevTools → Network tab
   - Look at the API requests
   - They should go to `https://physician-dashboard-backend.fly.dev/api/...`
   - If they still go to `localhost:3000`, the frontend needs to be rebuilt with the correct env var

3. **Check backend logs for CORS rejections**:
   ```bash
   flyctl logs --app physician-dashboard-backend | grep CORS
   ```
   
   You'll see messages like:
   ```
   [CORS] Origin not allowed: https://some-origin.com
   [CORS] Allowed origins: [...]
   ```

### Issue: Frontend shows wrong API URL

Rebuild the frontend with explicit build arg:
```bash
flyctl deploy \
  --config fly.frontend.toml \
  --app physician-dashboard \
  --build-arg VITE_API_BASE_URL="https://physician-dashboard-backend.fly.dev/api" \
  --no-cache
```

The `--no-cache` flag ensures a clean build.

### Issue: Backend not responding

1. **Check if backend is running**:
   ```bash
   flyctl status --app physician-dashboard-backend
   ```

2. **Check backend logs**:
   ```bash
   flyctl logs --app physician-dashboard-backend
   ```

3. **Restart backend if needed**:
   ```bash
   flyctl apps restart physician-dashboard-backend
   ```

## Environment Variables Summary

### Backend (`physician-dashboard-backend`)

Required secrets (set via `flyctl secrets set`):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for access tokens (32+ chars)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (32+ chars)
- `CORS_ORIGIN` - Comma-separated list of allowed origins

Optional:
- `REDIS_URL` - Redis connection string (for caching)
- `SENTRY_DSN` - Sentry error tracking

### Frontend (`physician-dashboard`)

Build-time environment variable:
- `VITE_API_BASE_URL` - Backend API base URL (set in fly.frontend.toml or as build arg)

## Next Steps

1. ✅ Run `./deploy-flyio.sh` to deploy both apps
2. ✅ Verify the deployment using the verification steps above
3. ✅ Test login functionality on `https://2035.fly.dev`
4. ✅ Monitor logs for any issues

## Additional Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [CORS Configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

