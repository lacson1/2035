# Console Errors Fix Guide

## Summary of Console Errors from Your Log

### 1. ✅ FIXED: 401 Unauthorized Errors
**Error:**
```
POST https://physician-dashboard-backend.fly.dev/api/v1/auth/login 401 (Unauthorized)
POST https://physician-dashboard-backend.fly.dev/api/v1/auth/refresh 401 (Unauthorized)
```

**Cause:** No users existed in the database

**Fix Applied:** Created admin account
- Email: `admin@hospital2035.com`
- Password: `Admin123!`

**Status:** ✅ RESOLVED - You can now log in

---

### 2. ⚠️ Chrome Extension Errors (IGNORE THESE)
**Errors:**
```
GET chrome-extension://pejdijmoenmkgeppbflobdenhhabjlaj/extensionState.js net::ERR_FILE_NOT_FOUND
GET chrome-extension://pejdijmoenmkgeppbflobdenhhabjlaj/utils.js net::ERR_FILE_NOT_FOUND
content.js:2523 Uncaught Error: Untrusted event
```

**Cause:** Browser password manager or autofill extension trying to inject scripts

**Fix:** These are **NOT** from your application - they're from browser extensions. You can:
- Ignore them (they don't affect your app)
- Disable the extension if they bother you
- Filter them out in Chrome DevTools:
  1. Open Console
  2. Click the filter dropdown
  3. Uncheck "Extension" errors

**Status:** ⚠️ HARMLESS - Not your app's problem

---

## How to Ensure Errors Don't Persist

### If Running Frontend Locally (Development Mode)

#### Step 1: Stop the Frontend Server
If it's running, press `Ctrl+C` in the terminal

#### Step 2: Create Environment File
Create a file called `.env.local` in the project root:

```bash
# For Mac/Linux
cat > .env.local << 'EOF'
VITE_API_BASE_URL=https://physician-dashboard-backend.fly.dev/api
NODE_ENV=development
EOF

# For Windows (PowerShell)
@"
VITE_API_BASE_URL=https://physician-dashboard-backend.fly.dev/api
NODE_ENV=development
"@ | Out-File -FilePath .env.local -Encoding utf8
```

#### Step 3: Restart Frontend
```bash
npm run dev
```

#### Step 4: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click the refresh button → **Empty Cache and Hard Reload**
3. Or use: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

---

### If Using Deployed Frontend (https://2035.fly.dev)

The deployed frontend should already have the correct configuration. Just:

1. **Clear browser cache** (Ctrl+Shift+R / Cmd+Shift+R)
2. **Log in** with: `admin@hospital2035.com` / `Admin123!`

---

## Verification Steps

### 1. Check API Connection
Open browser DevTools (F12) → Network tab:

**✅ Correct:**
```
POST https://physician-dashboard-backend.fly.dev/api/v1/auth/login → 200 OK
```

**❌ Wrong:**
```
POST http://localhost:3000/api/v1/auth/login → Failed to fetch
```

### 2. Check Console for Real Errors
After logging in, you should see **NO** errors except possibly:
- Chrome extension errors (ignore these)
- Info/debug logs (these are fine)

**✅ Successful Login Looks Like:**
```
API Request: POST https://physician-dashboard-backend.fly.dev/api/v1/auth/login
API Response: POST https://physician-dashboard-backend.fly.dev/api/v1/auth/login - Status: 200
```

---

## Still Seeing Errors?

### Debug Checklist

1. **Check which URL the frontend is using:**
   - Open Console (F12)
   - Type: `import.meta.env.VITE_API_BASE_URL`
   - Should show: `https://physician-dashboard-backend.fly.dev/api`

2. **Check if backend is accessible:**
   ```bash
   curl https://physician-dashboard-backend.fly.dev/health/live
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

3. **Check browser storage:**
   - DevTools → Application tab → Storage
   - Clear all storage for your site
   - Refresh page

4. **Check CORS:**
   - Network tab → Click failed request
   - Look for CORS errors in response headers
   - If CORS errors, backend needs to allow your frontend origin

---

## Quick Test: Verify Everything Works

### Test 1: Backend Health Check
```bash
curl https://physician-dashboard-backend.fly.dev/health/live
```
**Expected:** `{"status":"ok",...}`

### Test 2: Login Test
```bash
curl -X POST https://physician-dashboard-backend.fly.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital2035.com","password":"Admin123!"}'
```
**Expected:** JSON with `accessToken` and user info (HTTP 200)

### Test 3: Frontend Connection
1. Open your app (locally or deployed)
2. Open DevTools Console (F12)
3. Try to log in with: `admin@hospital2035.com` / `Admin123!`
4. Check Network tab - should see successful requests to `physician-dashboard-backend.fly.dev`

---

## Common Issues

### Issue: "Cannot connect to backend"
**Solution:** Create `.env.local` file (see Step 2 above)

### Issue: "Invalid credentials" 
**Solution:** Use correct credentials:
- Email: `admin@hospital2035.com`
- Password: `Admin123!`

### Issue: CORS errors
**Solution:** Backend CORS is already configured for:
- `https://2035.fly.dev`
- `https://physician-dashboard.fly.dev`
- `http://localhost:5173`

If using different port locally, add it to backend CORS.

---

## Additional Users

To create more users:

1. **Register through UI:**
   - Click "Sign Up" on login page
   - Fill in details
   - First user = admin role
   - Subsequent users = read_only role

2. **Register via API:**
   ```bash
   curl -X POST https://physician-dashboard-backend.fly.dev/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email":"user@example.com",
       "password":"SecurePass123!",
       "firstName":"John",
       "lastName":"Doe"
     }'
   ```

---

## Need Help?

If errors persist:
1. Share screenshot of DevTools Console (filtered to show only your app's errors)
2. Share screenshot of Network tab showing the failed request
3. Share the exact error message

The Chrome extension errors are **HARMLESS** and should be ignored.

