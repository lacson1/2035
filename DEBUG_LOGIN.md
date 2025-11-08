# 🔍 Login Debugging Guide

## ✅ Verified Working

1. **Backend is running** ✅
   - Health check: `http://localhost:3000/health` ✅
   - Login endpoint tested: ✅

2. **Test Credentials** ✅
   - Email: `sarah.johnson@hospital2035.com`
   - Password: `password123`
   - **This login works when tested directly with curl**

3. **Frontend Configuration** ✅
   - API Base URL: `http://localhost:3000/api` ✅
   - Environment file exists: `.env` ✅

## 🔧 Step-by-Step Debugging

### Step 1: Verify Frontend is Running

```bash
# Check if frontend dev server is running
curl http://localhost:5173

# If not running, start it:
npm run dev
```

### Step 2: Check Browser Console

1. Open your browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors when you try to login
4. Go to **Network** tab
5. Try logging in again
6. Look for the `/api/v1/auth/login` request

**What to check:**
- Is the request being made?
- What's the status code? (200 = success, 401 = wrong credentials, 0 = connection failed)
- What's the response body?
- Any CORS errors?

### Step 3: Enable Debug Mode

In browser console, run:
```javascript
localStorage.setItem('showDebugInfo', 'true');
location.reload();
```

This will show detailed API request/response logs in the console.

### Step 4: Test Login Directly

Open browser console and run:
```javascript
fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'sarah.johnson@hospital2035.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(data => console.log('Login response:', data))
.catch(err => console.error('Login error:', err));
```

**Expected:** Should return tokens and user data
**If error:** Check the error message

### Step 5: Check CORS Configuration

Verify backend CORS is configured correctly:

```bash
# Check backend .env file
cd backend
cat .env | grep CORS_ORIGIN

# Should show:
# CORS_ORIGIN=http://localhost:5173
```

If it's different, update it and restart the backend.

### Step 6: Clear Browser Storage

Sometimes stale tokens cause issues:

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to backend server"

**Symptoms:**
- Error message: "Cannot connect to backend server"
- Network tab shows status 0 or "Failed to fetch"

**Solutions:**
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check if frontend can reach backend: `curl http://localhost:3000/api/v1/auth/login`
3. Check firewall/antivirus blocking localhost
4. Try accessing backend directly in browser: `http://localhost:3000/health`

### Issue 2: "Invalid email or password" (401)

**Symptoms:**
- Error message: "Invalid email or password"
- Network tab shows status 401

**Solutions:**
1. **Use correct credentials:**
   - Email: `sarah.johnson@hospital2035.com`
   - Password: `password123`

2. **Or register a new account:**
   - Click "Don't have an account? Sign up"
   - Fill in the form
   - First user becomes admin automatically

### Issue 3: CORS Error

**Symptoms:**
- Console shows: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
- Network tab shows CORS error

**Solutions:**
1. Check backend `.env` has: `CORS_ORIGIN=http://localhost:5173`
2. Restart backend after changing `.env`
3. Verify frontend is running on `http://localhost:5173` (not a different port)

### Issue 4: Login succeeds but user not logged in

**Symptoms:**
- Network tab shows 200 OK
- But user stays on login page

**Solutions:**
1. Check browser console for JavaScript errors
2. Clear localStorage: `localStorage.clear()`
3. Check if tokens are being stored: `localStorage.getItem('authToken')`
4. Refresh the page

## 🧪 Quick Test Script

Run this in browser console to test the full login flow:

```javascript
// Test 1: Check backend health
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend health:', data))
  .catch(err => console.error('❌ Backend not reachable:', err));

// Test 2: Test login
fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'sarah.johnson@hospital2035.com',
    password: 'password123'
  })
})
  .then(r => r.json())
  .then(data => {
    console.log('✅ Login response:', data);
    if (data.data?.tokens) {
      console.log('✅ Tokens received!');
      localStorage.setItem('authToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      console.log('✅ Tokens stored in localStorage');
    }
  })
  .catch(err => console.error('❌ Login failed:', err));

// Test 3: Check API base URL
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api');
```

## 📞 Still Having Issues?

If login still doesn't work after trying all steps:

1. **Check backend logs:**
   ```bash
   cd backend
   npm run dev
   # Look for errors in the terminal
   ```

2. **Check frontend logs:**
   ```bash
   npm run dev
   # Look for errors in the terminal
   ```

3. **Verify both servers are on correct ports:**
   - Backend: `http://localhost:3000`
   - Frontend: `http://localhost:5173`

4. **Try incognito/private browsing mode** to rule out browser extensions interfering

5. **Check for proxy/VPN** that might be interfering with localhost connections

## ✅ Success Indicators

When login works correctly, you should see:
- ✅ Network tab: POST `/api/v1/auth/login` returns 200 OK
- ✅ Response contains `accessToken` and `refreshToken`
- ✅ User is redirected to dashboard
- ✅ `localStorage` contains `authToken` and `refreshToken`
- ✅ No console errors

