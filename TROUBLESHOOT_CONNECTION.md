# 🔧 Troubleshooting Connection Issues

## Quick Diagnostic Steps

Run these commands to diagnose the issue:

### 1. Check if backend is deployed and running
```bash
curl https://physician-dashboard-backend.fly.dev/health/live
```

**Expected**: `{"status":"ok","timestamp":"..."}`
**If fails**: Backend is not deployed or not running

### 2. Check Vercel environment variable
Go to: https://vercel.com/dashboard
- Select your project
- Go to Settings → Environment Variables
- Check if `VITE_API_BASE_URL` is set

**Should be**: `https://physician-dashboard-backend.fly.dev/api`

### 3. Check CORS configuration
```bash
cd backend
flyctl secrets list
```

Look for `CORS_ORIGIN` - should match your Vercel URL

### 4. Check browser console
- Open your Vercel app
- Press F12 to open Developer Tools
- Go to Console tab
- Look for errors (especially CORS errors)

## Common Issues & Fixes

### Issue 1: Backend Not Deployed Yet
**Symptoms**: Cannot reach backend URL
**Fix**:
```bash
cd backend
flyctl auth login
flyctl deploy
```

### Issue 2: Wrong API URL in Vercel
**Symptoms**: All API calls return 404
**Fix**:
- Go to Vercel Dashboard
- Project → Settings → Environment Variables
- Update `VITE_API_BASE_URL` to: `https://physician-dashboard-backend.fly.dev/api`
- Redeploy: `vercel --prod`

### Issue 3: CORS Error
**Symptoms**: Browser console shows "CORS policy" error
**Fix**:
```bash
cd backend
flyctl secrets set CORS_ORIGIN="https://your-exact-vercel-url.vercel.app"
```

### Issue 4: Missing Environment Variables
**Symptoms**: Backend crashes or doesn't start
**Fix**:
```bash
cd backend
flyctl secrets set \
  JWT_SECRET="$(openssl rand -base64 32)" \
  JWT_REFRESH_SECRET="$(openssl rand -base64 32)" \
  CORS_ORIGIN="https://your-app.vercel.app"
```

### Issue 5: Vercel Build Failed
**Symptoms**: Vercel deployment failed
**Fix**:
- Check build logs in Vercel dashboard
- Ensure environment variable is set BEFORE building
- Redeploy

## Detailed Diagnostics

### Test Backend
```bash
# Health check
curl https://physician-dashboard-backend.fly.dev/health/live

# API endpoint
curl https://physician-dashboard-backend.fly.dev/api/v1

# Check backend logs
cd backend
flyctl logs
```

### Test Frontend
```bash
# Check if deployed
curl -I https://your-app.vercel.app

# View Vercel logs
vercel logs
```

## Step-by-Step Fix

1. **Ensure backend is running**:
   ```bash
   cd backend
   flyctl status
   ```
   If not running: `flyctl deploy`

2. **Get your Vercel URL**:
   Go to Vercel dashboard and copy your URL

3. **Update CORS**:
   ```bash
   cd backend
   flyctl secrets set CORS_ORIGIN="https://your-vercel-url.vercel.app"
   ```

4. **Verify Vercel env var**:
   - Vercel Dashboard → Settings → Environment Variables
   - `VITE_API_BASE_URL` = `https://physician-dashboard-backend.fly.dev/api`

5. **Redeploy frontend**:
   ```bash
   vercel --prod
   ```

6. **Test**:
   Open your Vercel URL and check browser console

## Get Help

Share these details:
1. Backend status: `flyctl status`
2. Backend logs: `flyctl logs`
3. Frontend console errors (screenshot)
4. Your Vercel URL
5. What step you're at in deployment
