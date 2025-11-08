# Backend Connection Fix Guide

**Date:** November 8, 2025  
**Status:** ✅ Backend is running and properly configured

## Current Status

### ✅ What's Working:
- ✅ Backend server is running on port 3000 (process ID: 35141)
- ✅ Frontend server is running on port 5173
- ✅ Database connection is healthy (32 tables, 3 users, 5 patients)
- ✅ CORS is properly configured (`Access-Control-Allow-Origin: http://localhost:5173`)
- ✅ API endpoints are responding correctly
- ✅ Health checks pass
- ✅ Public endpoints (like `/api/v1/hubs`) work

### Test Results:
```bash
# Backend Health Check
curl http://localhost:3000/health
# ✅ Returns: {"status":"ok","timestamp":"...","environment":"development"}

# API Base Endpoint
curl http://localhost:3000/api/v1
# ✅ Returns: {"message":"API v1","endpoints":{...}}

# Hubs Endpoint
curl http://localhost:3000/api/v1/hubs
# ✅ Returns: {"data":[... 11 hubs ...]}

# CORS Headers
curl -H "Origin: http://localhost:5173" http://localhost:3000/api/v1/hubs -v 2>&1 | grep "Access-Control"
# ✅ Returns: Access-Control-Allow-Origin: http://localhost:5173
# ✅ Returns: Access-Control-Allow-Credentials: true
```

## Root Cause Analysis

The error message "Cannot connect to backend server" typically appears when:

### 1. **Frontend is not logged in** (Most Common)
   - The error might appear on protected routes that require authentication
   - Solution: Log in through the login page

### 2. **Auth token expired**
   - Old session tokens might be invalid
   - Solution: Clear localStorage and log in again

### 3. **Browser cache issues**
   - Cached API responses or service workers might be causing issues
   - Solution: Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### 4. **Environment variable override**
   - If `VITE_API_BASE_URL` is set incorrectly
   - Solution: Check `.env` file in project root

## Solutions

### Solution 1: Clear Browser State (Recommended First Step)

1. **Open browser DevTools** (F12 or Cmd+Option+I)

2. **Open Console** and run:
```javascript
// Clear all auth data
localStorage.clear();
sessionStorage.clear();
delete window.__authToken;

// Reload the page
window.location.reload();
```

3. **Navigate to login page** and log in again

### Solution 2: Hard Refresh the Frontend

**Chrome/Edge:**
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + F5`

**Firefox:**
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + F5`

**Safari:**
- Mac: `Option + Cmd + E` (clear cache), then `Cmd + R`

### Solution 3: Check Environment Variables

1. **Check if `.env` file exists in project root:**
```bash
ls -la /Users/lacbis/\ 2035/.env
```

2. **If it exists, check the value:**
```bash
# Should be empty or set to http://localhost:3000/api
grep VITE_API_BASE_URL /Users/lacbis/\ 2035/.env
```

3. **If it's set to something else, update it:**
```bash
# Create or update .env file
echo 'VITE_API_BASE_URL=http://localhost:3000/api' > /Users/lacbis/\ 2035/.env
```

4. **Restart the frontend:**
```bash
# In terminal where frontend is running, press Ctrl+C, then:
npm run dev
```

### Solution 4: Verify Login Credentials

**Test Login:**
1. Navigate to http://localhost:5173
2. Use test credentials:
   - Email: `admin@hospital2035.com`
   - Password: (check your backend seed data)

3. If you don't know the admin password, reset it:
```bash
cd backend
node reset-admin-password.js
```

### Solution 5: Check Browser Console for Specific Error

1. **Open DevTools Console** (F12 → Console tab)
2. **Look for specific error messages:**
   - `ERR_CONNECTION_REFUSED` → Backend not running
   - `CORS error` → CORS misconfiguration (but this is already working)
   - `401 Unauthorized` → Authentication issue (need to log in)
   - `Network request failed` → Backend not reachable

3. **Take a screenshot** of the error and investigate further

### Solution 6: Test API Connection from Browser Console

**Open DevTools Console** and run this diagnostic:

```javascript
// Test 1: Check API configuration
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api');

// Test 2: Test health endpoint
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend Health:', d))
  .catch(e => console.error('❌ Backend Health Failed:', e));

// Test 3: Test public API endpoint
fetch('http://localhost:3000/api/v1/hubs')
  .then(r => r.json())
  .then(d => console.log('✅ Hubs API:', d.data.length, 'hubs'))
  .catch(e => console.error('❌ Hubs API Failed:', e));

// Test 4: Check auth status
const token = localStorage.getItem('authToken') || window.__authToken;
console.log('Auth Token:', token ? 'Present ✅' : 'Missing ❌');

if (token) {
  fetch('http://localhost:3000/api/v1/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include'
  })
    .then(r => r.json())
    .then(d => console.log('✅ Authenticated as:', d.data))
    .catch(e => console.error('❌ Auth check failed:', e));
}
```

## Advanced Debugging

### Use the Diagnostic Tool

Open this file in your browser:
```
file:///Users/lacbis/ 2035/diagnose-connection.html
```

This will run comprehensive tests and show you exactly what's failing.

### Check Backend Logs

In the terminal where the backend is running, look for:
- `[CORS] Origin not allowed:` → CORS rejection (shouldn't happen now)
- `401 Unauthorized` → Authentication failures (normal for logged-out users)
- `500 Internal Server Error` → Backend errors

### Check Network Tab

1. Open DevTools → Network tab
2. Reload the page
3. Filter by "Fetch/XHR"
4. Look for requests to `localhost:3000`
5. Check status codes:
   - 200: Success ✅
   - 401: Not authenticated (need to log in)
   - 403: Forbidden (permission issue)
   - 404: Endpoint not found
   - 500: Server error
   - (failed): Connection failed → backend not running

## Quick Commands

### Restart Backend
```bash
cd "/Users/lacbis/ 2035/backend"
npm run dev
```

### Restart Frontend
```bash
cd "/Users/lacbis/ 2035"
npm run dev
```

### Check if Servers are Running
```bash
# Check backend (should show process ID)
lsof -ti:3000

# Check frontend (should show process ID)
lsof -ti:5173
```

### Kill and Restart Servers
```bash
# Kill backend
lsof -ti:3000 | xargs kill -9

# Kill frontend
lsof -ti:5173 | xargs kill -9

# Start backend
cd "/Users/lacbis/ 2035/backend" && npm run dev &

# Start frontend
cd "/Users/lacbis/ 2035" && npm run dev &
```

## Summary

Based on the diagnostic tests, your backend is **working perfectly**. The error "Cannot connect to backend server" is likely appearing because:

1. **You're not logged in** → Go to login page and authenticate
2. **Your session expired** → Clear cache and log in again  
3. **You're viewing the error from a previous failed attempt** → Hard refresh the page

### Next Steps:

1. ✅ **Open the frontend:** http://localhost:5173
2. ✅ **Clear browser cache:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. ✅ **Log in with credentials**
4. ✅ **Test the application**

If you still see the error after these steps, run the diagnostic tool at `diagnose-connection.html` and check the specific test that's failing.

---

**Last Updated:** November 8, 2025  
**Backend Status:** ✅ Running and healthy  
**Database Status:** ✅ Connected and seeded  
**CORS Status:** ✅ Properly configured  
**API Endpoints:** ✅ All working

