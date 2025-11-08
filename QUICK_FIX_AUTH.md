# Quick Fix for Authentication Errors

## Your Current Situation

✅ **Backend is running** (health check passed)  
⚠️ **Getting 401 Unauthorized on login**  
⚠️ **Connection refused errors on `/api/v1/auth/me`**

---

## Immediate Solutions

### Solution 1: Use Correct Test Credentials

The backend has seeded test users. Try these:

**Option A - Physician (Recommended):**
- Email: `sarah.johnson@hospital2035.com`
- Password: `password123`

**Option B - Admin:**
- Email: `admin@hospital2035.com`
- Password: `admin123`

**Option C - Nurse:**
- Email: `patricia.williams@hospital2035.com`
- Password: `password123`

---

### Solution 2: Re-seed Database (If Users Don't Exist)

```bash
cd backend
npm run prisma:seed
```

This will recreate all test users with the correct passwords.

---

### Solution 3: Clear Browser Storage

The connection refused error on `/api/v1/auth/me` might be from a stale token:

1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Clear Local Storage
4. Refresh the page

Or use console:
```javascript
localStorage.clear()
location.reload()
```

---

### Solution 4: Verify Backend Authentication Endpoint

Test the login endpoint directly:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.johnson@hospital2035.com",
    "password": "password123"
  }'
```

**Expected:** JSON response with `accessToken` and `refreshToken`

**If 401:** Credentials are wrong or user doesn't exist

**If connection refused:** Backend not running (but we know it is from health check)

---

## Understanding the Errors

### `ERR_CONNECTION_REFUSED` on `/api/v1/auth/me`

**What it means:**
- Frontend is trying to check if you're logged in
- Can't reach backend (but backend IS running, so this is odd)

**Why it might happen:**
1. **Timing issue:** Frontend loaded before backend started
2. **Stale token:** Old token in localStorage causing retry loop
3. **CORS issue:** Backend not allowing frontend origin

**Fix:**
- Clear localStorage (Solution 3)
- Check backend CORS config: `CORS_ORIGIN=http://localhost:5173`

---

### `401 Unauthorized` on `/api/v1/auth/login`

**What it means:**
- Backend received the login request
- Rejected it because credentials are wrong

**Common causes:**
1. Wrong email/password
2. User doesn't exist in database
3. Password hash mismatch (database not seeded properly)

**Fix:**
- Use correct test credentials (Solution 1)
- Re-seed database (Solution 2)

---

## Step-by-Step Fix

1. **Clear browser storage:**
   ```javascript
   // In browser console
   localStorage.clear()
   location.reload()
   ```

2. **Verify backend is running:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Re-seed database (if needed):**
   ```bash
   cd backend
   npm run prisma:seed
   ```

4. **Try login with test credentials:**
   - Email: `sarah.johnson@hospital2035.com`
   - Password: `password123`

5. **If still failing, check backend logs:**
   ```bash
   # In backend terminal, look for:
   # - Authentication errors
   # - Database connection issues
   # - JWT secret errors
   ```

---

## Still Not Working?

### Check Backend Logs

Look for these errors in the backend terminal:

1. **"Invalid email or password"**
   - User doesn't exist or wrong password
   - Solution: Re-seed database

2. **"JWT_SECRET is required"**
   - Missing JWT secret
   - Solution: Add to `backend/.env`:
     ```
     JWT_SECRET=$(openssl rand -base64 32)
     JWT_REFRESH_SECRET=$(openssl rand -base64 32)
     ```

3. **Database connection errors**
   - Database not running
   - Solution: `docker-compose up -d postgres`

### Check Frontend Network Tab

1. Open DevTools → Network tab
2. Try to login
3. Click on the `/api/v1/auth/login` request
4. Check:
   - **Status:** Should be 200 (not 401)
   - **Request Payload:** Email/password sent correctly
   - **Response:** Should have tokens

---

## Expected Behavior After Fix

✅ Login page loads  
✅ Enter credentials → Click Login  
✅ Redirects to dashboard  
✅ No console errors  
✅ Network tab shows 200 OK for login request

---

**Quick Test:**
```bash
# Test login via curl
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@hospital2035.com","password":"password123"}' \
  | jq .
```

If this works, the issue is in the frontend. If it fails, the issue is in the backend.

