# ✅ System Verification Guide

Use this guide to verify your full-stack setup is working correctly.

## Pre-Flight Checks

### 1. Verify Backend Setup

```bash
cd backend

# Check dependencies
npm list --depth=0

# Check Prisma Client
npm run prisma:generate

# Check TypeScript compilation
npm run build
```

### 2. Verify Frontend Setup

```bash
# Check dependencies
npm list --depth=0

# Check TypeScript compilation
npm run build
```

### 3. Verify Database

```bash
# Check if PostgreSQL is accessible
psql $DATABASE_URL -c "SELECT version();"

# Or if using Docker
docker ps | grep postgres
```

## Step-by-Step Verification

### Step 1: Database Connection

```bash
cd backend
npm run prisma:studio
```

If Prisma Studio opens, database connection is working ✅

### Step 2: Backend Server

```bash
cd backend
npm run dev
```

In another terminal:
```bash
# Health check
curl http://localhost:3000/health

# Should return: {"status":"ok","timestamp":"...","environment":"development"}
```

✅ If you see the health response, backend is working!

### Step 3: Authentication

```bash
# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@hospital2035.com","password":"password123"}'
```

✅ Should return accessToken and refreshToken

### Step 4: Protected Endpoint

```bash
# Get the token from previous response
TOKEN="your-access-token-here"

# Test protected endpoint
curl http://localhost:3000/api/v1/patients \
  -H "Authorization: Bearer $TOKEN"
```

✅ Should return list of patients

### Step 5: Frontend

```bash
# Start frontend
npm run dev
```

1. Open http://localhost:5173
2. Should see login page ✅
3. Login with test credentials
4. Should see patient dashboard ✅

### Step 6: Frontend-Backend Integration

1. Login in frontend
2. Check browser console for API calls
3. Verify patient data loads
4. Try creating/updating a patient

✅ If data persists, integration is working!

## Common Issues & Solutions

### Issue: Database Connection Failed

**Symptoms:**
- Backend won't start
- Prisma errors

**Solutions:**
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Issue: CORS Errors in Browser

**Symptoms:**
- Frontend can't connect to backend
- CORS errors in console

**Solutions:**
1. Check `CORS_ORIGIN` in backend `.env`
2. Should match frontend URL: `http://localhost:5173`
3. Restart backend after changing `.env`

### Issue: 401 Unauthorized

**Symptoms:**
- Login works but API calls fail
- Token errors

**Solutions:**
1. Check token is stored: `localStorage.getItem('authToken')`
2. Verify token format in Authorization header
3. Check token expiration
4. Test token refresh endpoint

### Issue: No Patients Loaded

**Symptoms:**
- Dashboard shows empty
- No error messages

**Solutions:**
1. Check if database is seeded: `npm run prisma:seed`
2. Verify API endpoint works: `curl http://localhost:3000/api/v1/patients -H "Authorization: Bearer $TOKEN"`
3. Check browser console for errors
4. Verify authentication is working

## Verification Checklist

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Database created and accessible
- [ ] Prisma migrations run
- [ ] Database seeded
- [ ] Backend server starts
- [ ] Health endpoint responds
- [ ] Login endpoint works
- [ ] Protected endpoints work
- [ ] Frontend starts
- [ ] Login page displays
- [ ] Login works
- [ ] Patient data loads
- [ ] No console errors
- [ ] API calls in network tab
- [ ] Data persists after refresh

## Quick Verification Script

```bash
#!/bin/bash
echo "🔍 Verifying setup..."

# Backend
echo "Checking backend..."
cd backend && npm run build > /dev/null 2>&1 && echo "✅ Backend builds" || echo "❌ Backend build failed"

# Frontend  
echo "Checking frontend..."
cd .. && npm run build > /dev/null 2>&1 && echo "✅ Frontend builds" || echo "❌ Frontend build failed"

# Database
echo "Checking database..."
cd backend && psql $DATABASE_URL -c "SELECT 1;" > /dev/null 2>&1 && echo "✅ Database accessible" || echo "⚠️  Database not accessible"

echo "Done!"
```

## Success Indicators

✅ **Everything is working if:**
1. Backend health endpoint responds
2. Login returns tokens
3. Protected endpoints work with token
4. Frontend loads and shows login
5. Login works and shows dashboard
6. Patient data loads from API
7. No console errors
8. No network errors

## Next Steps After Verification

1. ✅ All checks pass → Ready for development!
2. ⚠️ Some checks fail → See troubleshooting above
3. 📚 Need help → Check documentation files
4. 🐛 Found bugs → Check error messages and logs

---

**Status:** Run these checks to verify your setup! 🎯

