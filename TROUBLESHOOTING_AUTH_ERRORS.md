# Troubleshooting Authentication Errors

## Understanding the Errors

### Error 1: `ERR_CONNECTION_REFUSED` on `/api/v1/auth/me`
**Meaning:** The backend server is **not running** or not accessible.

**What's happening:**
- On app load, the frontend checks if you're already logged in by calling `/api/v1/auth/me`
- This request fails because the backend at `localhost:3000` is not running
- This is **expected behavior** if the backend isn't started

### Error 2: `401 Unauthorized` on `/api/v1/auth/login`
**Meaning:** The backend **IS running**, but authentication failed.

**Possible causes:**
1. Wrong email/password
2. User doesn't exist in database
3. Database not seeded
4. Backend authentication service issue

---

## Quick Fix Guide

### Step 1: Check if Backend is Running

```bash
# Check if backend is running
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

**If you get `connection refused`:**
- Backend is not running
- Go to Step 2

**If you get a response:**
- Backend is running
- Go to Step 3

---

### Step 2: Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Check if .env file exists
ls -la .env

# If .env doesn't exist, create it
cp .env.example .env

# Edit .env and set DATABASE_URL
# DATABASE_URL=postgresql://postgres:postgres@localhost:5433/physician_dashboard_2035

# Install dependencies (if not done)
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (creates test users)
npm run prisma:seed

# Start the backend
npm run dev
```

**Expected output:**
```
🚀 Server running on http://localhost:3000
📝 Environment: development
🔗 CORS Origin: http://localhost:5173
```

---

### Step 3: Verify Database is Seeded

The backend should have seeded test users. Check if they exist:

```bash
# Option 1: Use Prisma Studio
cd backend
npm run prisma:studio

# Option 2: Check via API (once backend is running)
curl http://localhost:3000/health
```

**Default Test Users:**
- **Admin:** `admin@hospital2035.com` / `admin123`
- **Physician:** `sarah.johnson@hospital2035.com` / `password123`
- **Nurse:** `patricia.williams@hospital2035.com` / `password123`

---

### Step 4: Check Frontend Configuration

Verify the frontend is pointing to the correct backend URL:

```bash
# Check if .env file exists in project root
ls -la .env

# If not, create it
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env

# Verify the value
cat .env
```

**Important:** After creating/updating `.env`, **restart the frontend dev server**:

```bash
# Stop the frontend (Ctrl+C)
# Then restart
npm run dev
```

---

### Step 5: Test Login via API

Test if login works directly:

```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.johnson@hospital2035.com",
    "password": "password123"
  }'
```

**Expected response:**
```json
{
  "data": {
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    },
    "user": {
      "id": "...",
      "email": "sarah.johnson@hospital2035.com",
      ...
    }
  }
}
```

**If you get 401:**
- Check the email/password are correct
- Verify database is seeded
- Check backend logs for errors

---

## Common Issues & Solutions

### Issue 1: Backend Starts but Database Connection Fails

**Error in backend logs:**
```
Error: Can't reach database server
```

**Solution:**
```bash
# Start PostgreSQL (if using Docker)
cd backend
docker-compose up -d postgres

# Wait a few seconds, then check
docker-compose ps

# Verify DATABASE_URL in backend/.env
cat backend/.env | grep DATABASE_URL
```

---

### Issue 2: Frontend Can't Connect Even When Backend is Running

**Check:**
1. **CORS Configuration:**
   ```bash
   # Verify backend CORS allows frontend origin
   # In backend/.env:
   CORS_ORIGIN=http://localhost:5173
   ```

2. **Port Conflicts:**
   ```bash
   # Check if port 3000 is in use
   lsof -i :3000
   
   # If something else is using it, change backend port
   # In backend/.env:
   PORT=3001
   # Then update frontend .env:
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

3. **Firewall/Security Software:**
   - Check if firewall is blocking localhost connections
   - Temporarily disable to test

---

### Issue 3: 401 Unauthorized Even with Correct Credentials

**Possible causes:**

1. **JWT Secret Issue:**
   ```bash
   # Check backend/.env has JWT_SECRET set
   # If not, generate one:
   openssl rand -base64 32
   
   # Add to backend/.env:
   JWT_SECRET=<generated-secret>
   JWT_REFRESH_SECRET=<another-generated-secret>
   ```

2. **Password Hash Mismatch:**
   ```bash
   # Re-seed the database
   cd backend
   npm run prisma:seed
   ```

3. **User Account Inactive:**
   - Check database: `isActive` field should be `true`
   - Use Prisma Studio: `npm run prisma:studio`

---

### Issue 4: Frontend Shows Loading Forever

**Cause:** Frontend is waiting for `/api/v1/auth/me` to respond, but backend is down.

**Solution:**
- Start the backend server
- Or clear localStorage to skip auth check:
  ```javascript
  // In browser console:
  localStorage.clear()
  // Then refresh page
  ```

---

## Step-by-Step Complete Setup

### 1. Start Database
```bash
cd backend
docker-compose up -d postgres
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### 3. Setup Frontend
```bash
# In project root
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env
npm install
npm run dev
```

### 4. Verify Everything Works
```bash
# Terminal 1: Backend should show
🚀 Server running on http://localhost:3000

# Terminal 2: Frontend should show
  VITE v4.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/

# Browser: Should show login page
# Login with: sarah.johnson@hospital2035.com / password123
```

---

## Debugging Tools

### Check Backend Logs
```bash
cd backend
npm run dev
# Watch for errors in terminal
```

### Check Frontend Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Check the `/api/v1/auth/login` request:
   - **Status:** Should be 200 (not 401)
   - **Response:** Should contain tokens

### Use Debug Utilities
```javascript
// In browser console (when frontend is running):
window.__DEBUG__.debugAuthState()
window.__DEBUG__.debugEnv()
```

---

## Quick Health Check Script

Create `check-backend.sh`:
```bash
#!/bin/bash
echo "Checking backend health..."
curl -s http://localhost:3000/health | jq .

echo -e "\nTesting login..."
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@hospital2035.com","password":"password123"}' | jq .
```

Make executable and run:
```bash
chmod +x check-backend.sh
./check-backend.sh
```

---

## Still Having Issues?

1. **Check all services are running:**
   ```bash
   # Database
   docker-compose ps
   
   # Backend
   curl http://localhost:3000/health
   
   # Frontend
   curl http://localhost:5173
   ```

2. **Verify environment variables:**
   ```bash
   # Backend
   cd backend && cat .env
   
   # Frontend
   cat .env
   ```

3. **Check browser console for detailed errors**

4. **Review backend logs for authentication errors**

---

## Expected Behavior

✅ **When everything works:**
- Backend: `🚀 Server running on http://localhost:3000`
- Frontend: Login page loads
- Login: Redirects to dashboard
- No console errors

❌ **When backend is down:**
- Frontend: Shows login page (after timeout)
- Console: `ERR_CONNECTION_REFUSED` errors
- Network tab: Red failed requests

❌ **When credentials are wrong:**
- Frontend: Shows error message
- Network tab: `401 Unauthorized` on login request
- Console: May show error message

---

**Need more help?** Check:
- `QUICK_START.md` - Complete setup guide
- `DEBUG_GUIDE.md` - Detailed debugging
- `TROUBLESHOOTING_FETCH_ERRORS.md` - API connection issues

