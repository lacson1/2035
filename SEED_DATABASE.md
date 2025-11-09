# 🌱 Database Seeding Guide

## Current Status

✅ **Patients already exist in database** (5 demo patients seeded)

The error "No patients found" is likely due to:
1. **Authentication issue** - User not logged in
2. **API URL misconfiguration** - Frontend pointing to wrong backend
3. **CORS issue** - Backend not allowing frontend origin

---

## Quick Fix: Seed Patients via API

### Option 1: Using API Endpoint (Recommended for Production)

The backend has a setup endpoint that can seed patients:

```bash
# For production (Fly.io)
curl -X POST https://physician-dashboard-backend.fly.dev/api/v1/setup/seed-patients \
  -H "Content-Type: application/json" \
  -H "x-setup-secret: dev-setup-secret-change-in-production" \
  -d '{}'

# For local development
curl -X POST http://localhost:3000/api/v1/setup/seed-patients \
  -H "Content-Type: application/json" \
  -H "x-setup-secret: dev-setup-secret-change-in-production" \
  -d '{}'
```

**Note**: The default secret is `dev-setup-secret-change-in-production`. For production, set `SETUP_SECRET` environment variable in Fly.io:

```bash
cd backend
flyctl secrets set SETUP_SECRET="your-secure-secret-here"
```

### Option 2: Using Script (Local Development Only)

```bash
cd backend
npx ts-node scripts/seed-patients.ts
```

**Requirements**:
- Database must be running
- At least one user must exist (physician, admin, or any user)
- Prisma must be configured

---

## Troubleshooting "No Patients Found" Error

### Step 1: Verify Backend is Running

```bash
# Check backend health
curl https://physician-dashboard-backend.fly.dev/health/live

# Should return: {"status":"ok"}
```

### Step 2: Verify Patients Exist in Database

```bash
# Check if patients exist (requires authentication)
curl -X GET https://physician-dashboard-backend.fly.dev/api/v1/patients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 3: Check Frontend API Configuration

**For Vercel Deployment**:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify `VITE_API_BASE_URL` is set to:
   ```
   https://physician-dashboard-backend.fly.dev/api
   ```
5. **Redeploy** if you just added/changed it

**For Local Development**:
Check `.env` file in project root:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Step 4: Verify User is Logged In

The patients endpoint requires authentication. Make sure:
1. User is logged in to the frontend
2. Auth token is being sent with requests
3. Token hasn't expired

### Step 5: Check CORS Configuration

The backend must allow your frontend origin:

```bash
cd backend

# Check current CORS settings
flyctl secrets list

# Update CORS to include your Vercel URL
flyctl secrets set CORS_ORIGIN="https://your-app.vercel.app,https://*.vercel.app"
```

---

## Verify Seeding Worked

After seeding, verify patients exist:

```bash
# Using the setup endpoint response
# Should show: {"summary":{"created":5,"skipped":0,"total":5}}

# Or check via API (requires auth token)
curl -X GET https://physician-dashboard-backend.fly.dev/api/v1/patients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Sample Patients Created

The seed script creates 5 demo patients:

1. **John Smith** - Hypertension (Risk: 3)
2. **Emily Johnson** - Type 2 Diabetes (Risk: 5)
3. **Robert Williams** - Coronary Artery Disease (Risk: 7)
4. **Maria Garcia** - Asthma (Risk: 2)
5. **David Chen** - Chronic Kidney Disease (Risk: 6)

---

## Next Steps

1. ✅ Verify backend is running
2. ✅ Seed patients (if needed)
3. ✅ Configure frontend API URL
4. ✅ Update CORS settings
5. ✅ Log in to frontend
6. ✅ Verify patients load

If issues persist, check:
- Browser console for errors
- Network tab for failed requests
- Backend logs: `flyctl logs -a physician-dashboard-backend`

