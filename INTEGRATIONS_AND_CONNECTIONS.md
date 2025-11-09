# 🔗 Integrations & Connections Guide

Complete overview of all integrations, connections, and API endpoints in the application.

---

## 📊 Current Connection Status

### ✅ Working Connections

| Component | Status | URL/Endpoint | Notes |
|-----------|--------|--------------|-------|
| **Frontend (Local)** | ✅ Running | `http://localhost:5173` | Development server |
| **Backend (Local)** | ✅ Running | `http://localhost:3000` | Development server |
| **Backend (Production)** | ✅ Running | `https://physician-dashboard-backend.fly.dev` | Fly.io deployment |
| **Frontend (Production)** | ✅ Deployed | `https://physician-dashboard-2035.vercel.app` | Vercel deployment |
| **Database (Production)** | ✅ Running | Fly.io PostgreSQL | Auto-suspends when idle |
| **API Base (Local)** | ✅ Working | `http://localhost:3000/api` | Full functionality |
| **API Base (Production)** | ⚠️ CORS Issue | `https://physician-dashboard-backend.fly.dev/api` | Needs CORS fix |

---

## 🔌 Core Integrations

### 1. Frontend ↔ Backend API Connection

**Configuration:**
- **Local:** `VITE_API_BASE_URL=http://localhost:3000/api`
- **Production:** `VITE_API_BASE_URL=https://physician-dashboard-backend.fly.dev/api`

**Implementation:**
```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

**Features:**
- ✅ Automatic token refresh
- ✅ Error handling with retry logic
- ✅ Request/response logging (dev mode)
- ✅ Rate limit handling
- ✅ Network error detection

**Authentication Flow:**
1. Login → Receive `accessToken` (stored in memory) + `refreshToken` (httpOnly cookie)
2. All requests include `Authorization: Bearer <accessToken>`
3. On 401 → Auto-refresh using httpOnly cookie
4. On refresh failure → Redirect to login

---

### 2. Database Connection

**Type:** PostgreSQL (via Prisma ORM)

**Configuration:**
- **Local:** `DATABASE_URL=postgresql://user:pass@localhost:5432/dbname`
- **Production:** Managed by Fly.io PostgreSQL

**Connection Pool:**
- Max connections: 10
- Connection timeout: 10s
- Query timeout: 30s

**Health Check:**
```bash
# Check database connection
curl https://physician-dashboard-backend.fly.dev/health
```

---

### 3. CORS Configuration

**Current Setup:**
```typescript
// backend/src/config/env.ts
cors: {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : [
        'http://localhost:5173', 
        'https://*.vercel.app',
        'https://physician-dashboard-2035.vercel.app'
      ],
}
```

**Local Development:**
```bash
CORS_ORIGIN=http://localhost:5173
```

**Production (Needs Update):**
```bash
# Current (blocking production)
CORS_ORIGIN=http://localhost:5173

# Required (to fix production)
CORS_ORIGIN=http://localhost:5173,https://physician-dashboard-2035.vercel.app,https://*.vercel.app
```

**How to Fix Production CORS:**
```bash
cd backend
flyctl secrets set CORS_ORIGIN="http://localhost:5173,https://physician-dashboard-2035.vercel.app,https://*.vercel.app"
```

---

## 🌐 API Endpoints

### Base URLs
- **Local:** `http://localhost:3000/api/v1`
- **Production:** `https://physician-dashboard-backend.fly.dev/api/v1`

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/v1/auth/login` | Login and get tokens | No |
| `POST` | `/v1/auth/refresh` | Refresh access token | No (uses cookie) |
| `POST` | `/v1/auth/logout` | Logout and invalidate token | Yes |
| `GET` | `/v1/auth/me` | Get current user | Yes |

### Patient Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/v1/patients` | List patients (paginated) | Yes |
| `GET` | `/v1/patients/:id` | Get patient details | Yes |
| `POST` | `/v1/patients` | Create patient | Yes |
| `PUT` | `/v1/patients/:id` | Update patient | Yes |
| `PATCH` | `/v1/patients/:id` | Partial update | Yes |
| `DELETE` | `/v1/patients/:id` | Delete patient | Yes |
| `GET` | `/v1/patients/search` | Search patients | Yes |

### Patient Sub-resources

| Resource | Endpoints |
|----------|-----------|
| **Medications** | `GET/POST/PUT/DELETE /v1/patients/:id/medications` |
| **Appointments** | `GET/POST/PUT/DELETE /v1/patients/:id/appointments` |
| **Clinical Notes** | `GET/POST/PUT/DELETE /v1/patients/:id/notes` |
| **Imaging Studies** | `GET/POST /v1/patients/:id/imaging` |
| **Timeline** | `GET /v1/patients/:id/timeline` |
| **Care Team** | `GET/POST/DELETE /v1/patients/:id/care-team` |

### User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/v1/users` | List users (admin) | Yes (admin) |
| `GET` | `/v1/users/:id` | Get user | Yes |
| `POST` | `/v1/users` | Create user (admin) | Yes (admin) |
| `PUT` | `/v1/users/:id` | Update user (admin) | Yes (admin) |
| `DELETE` | `/v1/users/:id` | Delete user (admin) | Yes (admin) |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/health/live` | Liveness probe |
| `GET` | `/v1/hubs` | Get hubs (public) |

---

## 🔐 Authentication & Security

### Token Management

**Access Token:**
- Stored in: Memory (via `window.__authToken`)
- Expires: 15 minutes
- Header: `Authorization: Bearer <token>`

**Refresh Token:**
- Stored in: httpOnly cookie
- Expires: 7 days
- Auto-refreshed on 401 errors

### Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| **Auth endpoints** | 5 requests | 10 seconds |
| **General API** | 100 requests | 1 minute |
| **Write operations** | 20 requests | 1 minute |
| **Read operations** | 200 requests | 1 minute |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🗄️ Database Schema

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts | id, email, password, role |
| `patients` | Patient records | id, name, dob, gender, riskScore |
| `medications` | Patient medications | id, patientId, name, status |
| `appointments` | Appointments | id, patientId, date, time, status |
| `clinical_notes` | Clinical documentation | id, patientId, content, date |
| `imaging_studies` | Imaging records | id, patientId, type, findings |
| `care_team` | Care team assignments | id, patientId, userId, role |

**Total Tables:** 32 tables

---

## 🚀 Future Integrations (Planned)

### Phase 4: External System Integrations

#### 1. EHR System Integration
**Target Systems:**
- Epic MyChart API
- Cerner PowerChart API
- Allscripts API

**Features:**
- Patient data sync
- Appointment scheduling
- Clinical notes import/export
- Medication reconciliation

#### 2. Lab Information Systems (LIS)
**Target Systems:**
- Epic Beaker
- Cerner PowerPath
- LabCorp API
- Quest Diagnostics API

**Features:**
- Lab results import
- Order placement
- Result notifications

#### 3. Pharmacy Systems
**Target Systems:**
- Epic Willow
- Cerner Pharmacy
- Surescripts API

**Features:**
- Prescription management
- Medication history
- Drug interaction checking
- Prior authorization

#### 4. Medical Device Integration
**Devices:**
- Blood pressure monitors
- Glucose meters
- Wearable devices (Fitbit, Apple Watch)
- Remote patient monitoring

**Protocols:**
- HL7 FHIR
- DICOM (for imaging)
- MQTT (for IoT devices)

#### 5. Insurance Verification APIs
**Providers:**
- Change Healthcare
- Availity
- Experian Health

**Features:**
- Eligibility verification
- Prior authorization
- Claims submission

---

## 🔧 Connection Troubleshooting

### Issue: CORS Error in Production

**Symptoms:**
```
Access to fetch at 'https://physician-dashboard-backend.fly.dev/api/v1/auth/login' 
from origin 'https://physician-dashboard-2035.vercel.app' has been blocked by CORS policy
```

**Fix:**
```bash
cd backend
flyctl secrets set CORS_ORIGIN="http://localhost:5173,https://physician-dashboard-2035.vercel.app,https://*.vercel.app"
```

### Issue: Cannot Connect to Backend

**Check:**
1. Backend server running: `curl http://localhost:3000/health`
2. Environment variable set: `echo $VITE_API_BASE_URL`
3. Network connectivity: `ping physician-dashboard-backend.fly.dev`

**Fix:**
```bash
# Local
cd backend && npm run dev

# Check production
flyctl status
flyctl logs
```

### Issue: Database Connection Failed

**Check:**
```bash
# Local
psql $DATABASE_URL

# Production
flyctl postgres connect -a physician-dashboard-db
```

**Fix:**
- Verify `DATABASE_URL` is set correctly
- Check database is running: `flyctl machine list -a physician-dashboard-db`
- Start if stopped: `flyctl machine start <machine-id>`

### Issue: Authentication Token Expired

**Symptoms:**
- 401 Unauthorized errors
- Redirected to login page

**Fix:**
- Clear browser storage
- Log in again
- Check token expiration (15 minutes for access token)

---

## 📡 API Client Usage

### Basic Request

```typescript
import apiClient from './services/api';

// GET request
const response = await apiClient.get('/v1/patients');
const patients = response.data.patients;

// POST request
const newPatient = await apiClient.post('/v1/patients', {
  name: 'John Doe',
  dateOfBirth: '1980-01-15',
  gender: 'M'
});

// PUT request
const updated = await apiClient.put(`/v1/patients/${id}`, data);

// DELETE request
await apiClient.delete(`/v1/patients/${id}`);
```

### Error Handling

```typescript
try {
  const response = await apiClient.get('/v1/patients');
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // Token expired, will auto-refresh
    } else if (error.status === 429) {
      // Rate limited
      const retryAfter = error.retryAfter;
    }
  }
}
```

---

## 🔍 Monitoring & Health Checks

### Health Check Endpoints

**Liveness:**
```bash
curl https://physician-dashboard-backend.fly.dev/health/live
# Returns: {"status":"ok"}
```

**Readiness:**
```bash
curl https://physician-dashboard-backend.fly.dev/health
# Returns: {"status":"ok","timestamp":"...","environment":"production"}
```

### Monitoring Tools

**Fly.io Dashboard:**
- URL: https://fly.io/dashboard
- View: Metrics, logs, machine status

**Vercel Dashboard:**
- URL: https://vercel.com/dashboard
- View: Deployments, analytics, environment variables

---

## 📝 Environment Variables

### Frontend (.env.local)

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

### Backend (.env)

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=<32-char-secret>
JWT_REFRESH_SECRET=<32-char-secret>
CORS_ORIGIN=http://localhost:5173
```

### Production (Fly.io Secrets)

```bash
flyctl secrets set NODE_ENV=production
flyctl secrets set DATABASE_URL=<url>
flyctl secrets set JWT_SECRET=<secret>
flyctl secrets set JWT_REFRESH_SECRET=<secret>
flyctl secrets set CORS_ORIGIN="http://localhost:5173,https://physician-dashboard-2035.vercel.app,https://*.vercel.app"
```

---

## 🎯 Quick Reference

### Local Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Runs on http://localhost:3000

# Terminal 2 - Frontend
npm run dev
# Runs on http://localhost:5173
```

### Production URLs

- **Frontend:** https://physician-dashboard-2035.vercel.app
- **Backend:** https://physician-dashboard-backend.fly.dev
- **API Base:** https://physician-dashboard-backend.fly.dev/api

### Test Connection

```bash
# Health check
curl https://physician-dashboard-backend.fly.dev/health

# Public endpoint
curl https://physician-dashboard-backend.fly.dev/api/v1/hubs

# Authenticated endpoint (requires token)
curl -H "Authorization: Bearer <token>" \
  https://physician-dashboard-backend.fly.dev/api/v1/patients
```

---

## 📚 Additional Resources

- [API Endpoints Documentation](./API_ENDPOINTS.md)
- [Deployment Guide](./DEPLOYMENT_SETUP.md)
- [CORS Fix Guide](./CORS_FIX_GUIDE.md)
- [Backend Connection Fix](./BACKEND_CONNECTION_FIX.md)
- [Current Status](./CURRENT_STATUS.md)

---

**Last Updated:** November 2025  
**Maintained By:** Development Team

