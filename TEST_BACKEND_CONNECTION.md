# Test Backend Connection

## Quick Verification

### 1. Backend Health Check
```bash
curl https://physician-dashboard-backend.fly.dev/health
```

**Expected Output:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T...",
  "environment": "production"
}
```

### 2. API Endpoints Check
```bash
curl https://physician-dashboard-backend.fly.dev/api/v1
```

**Expected Output:**
```json
{
  "message": "API v1",
  "endpoints": {
    "auth": "/api/v1/auth",
    "patients": "/api/v1/patients",
    ...
  }
}
```

### 3. Test Authentication
```bash
curl -X POST https://physician-dashboard-backend.fly.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

**Expected Output (if invalid credentials):**
```json
{
  "message": "Invalid email or password",
  "status": 401,
  "timestamp": "..."
}
```

**Expected Output (if valid credentials):**
```json
{
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": { ... }
  }
}
```

## Frontend Configuration Verification

### 1. Check Environment File
```bash
cat .env
```

**Expected Output:**
```env
VITE_API_BASE_URL=https://physician-dashboard-backend.fly.dev/api
```

### 2. Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. Open Browser and Test
1. Navigate to http://localhost:5173
2. Open Browser DevTools (F12)
3. Go to Network tab
4. Try to login
5. Verify requests go to `https://physician-dashboard-backend.fly.dev/api/v1/auth/login`

## Connection Flow Diagram

```
User Browser
    ↓
http://localhost:5173 (Frontend)
    ↓
JavaScript API Client (src/services/api.ts)
    ↓
Reads: VITE_API_BASE_URL from .env
    ↓
Makes requests to:
https://physician-dashboard-backend.fly.dev/api/v1/*
    ↓
Fly.io Backend Server
    ↓
PostgreSQL Database
```

## Verification Checklist

- [x] Backend deployed to Fly.io
- [x] Backend health endpoint responds (200 OK)
- [x] Backend API v1 endpoints accessible
- [x] Authentication endpoint working
- [x] Frontend .env file created
- [x] VITE_API_BASE_URL configured
- [x] Documentation created
- [ ] Frontend dev server started
- [ ] Login tested in browser
- [ ] Patient data loading tested
- [ ] Network requests verified in DevTools

## Expected API Request Examples

### Login Request
```
POST https://physician-dashboard-backend.fly.dev/api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Patients Request
```
GET https://physician-dashboard-backend.fly.dev/api/v1/patients
Authorization: Bearer <access_token>
```

### Get Patient Medications
```
GET https://physician-dashboard-backend.fly.dev/api/v1/patients/123/medications
Authorization: Bearer <access_token>
```

## Common Issues & Solutions

### Issue: "Failed to fetch"
**Cause:** Backend might be starting up (auto-start enabled)  
**Solution:** Wait 5-10 seconds and retry

### Issue: CORS error
**Cause:** Frontend URL not whitelisted  
**Solution:** Add `http://localhost:5173` to backend CORS_ORIGIN env var

### Issue: 401 Unauthorized
**Cause:** Not logged in or token expired  
**Solution:** Login again, frontend will handle token refresh automatically

### Issue: 502 Bad Gateway  
**Cause:** Backend scaling up from idle state  
**Solution:** Wait a moment and retry, backend will auto-start

## Performance Notes

- **Cold Start:** 2-5 seconds (when backend is idle)
- **Warm Requests:** < 200ms
- **Auto-stop:** Backend stops after 5 minutes of inactivity
- **Auto-start:** Backend starts on first request

## Next Actions

1. **Install Dependencies (if needed):**
   ```bash
   npm install
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Test Login:**
   - Open http://localhost:5173
   - Enter credentials
   - Verify successful authentication

4. **Monitor Network:**
   - Open DevTools → Network tab
   - Watch API calls to Fly.io backend
   - Verify responses are coming from production backend

---

**Backend URL:** https://physician-dashboard-backend.fly.dev  
**Status:** ✅ Operational  
**Configuration:** ✅ Complete
