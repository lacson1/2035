# Fly.io Backend Deployment Configuration

## Backend URL
**Production Backend:** https://physician-dashboard-backend.fly.dev

## Status
✅ **FULLY OPERATIONAL**

### Health Check
```bash
curl https://physician-dashboard-backend.fly.dev/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T17:22:14.568Z",
  "environment": "production"
}
```

### API Endpoints
Base URL: `https://physician-dashboard-backend.fly.dev/api/v1`

**Available Endpoints:**
- `/api/v1/auth` - Authentication (login, register, refresh)
- `/api/v1/patients` - Patient management
- `/api/v1/patients/:patientId/medications` - Medication tracking
- `/api/v1/patients/:patientId/appointments` - Appointment scheduling
- `/api/v1/patients/:patientId/notes` - Clinical notes
- `/api/v1/patients/:patientId/imaging` - Imaging studies
- `/api/v1/patients/:patientId/lab-results` - Lab results
- `/api/v1/patients/:patientId/care-team` - Care team management
- `/api/v1/settings` - User settings
- `/api/v1/billing` - Billing operations
- `/api/v1/audit` - Audit logs
- `/api/v1/hubs` - Hub management
- `/api/v1/roles` - Role management
- `/api/v1/permissions` - Permission management
- `/health` - Health check endpoint

## Frontend Configuration

### Environment Setup
The frontend has been configured to connect to the Fly.io backend:

**File: `.env`**
```env
VITE_API_BASE_URL=https://physician-dashboard-backend.fly.dev/api
```

### How It Works
The frontend API client (`src/services/api.ts`) reads the `VITE_API_BASE_URL` environment variable:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

All API requests will now be sent to the Fly.io backend automatically.

## Testing the Connection

### 1. Test Health Endpoint
```bash
curl https://physician-dashboard-backend.fly.dev/health
```

### 2. Test API Info
```bash
curl https://physician-dashboard-backend.fly.dev/api/v1
```

### 3. Test Authentication
```bash
curl -X POST https://physician-dashboard-backend.fly.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

## Running the Frontend

### Development Mode
```bash
npm run dev
```

The frontend will:
1. Start on http://localhost:5173
2. Automatically connect to https://physician-dashboard-backend.fly.dev
3. Handle authentication and API calls through the Fly.io backend

### Build for Production
```bash
npm run build
```

## CORS Configuration

The backend is configured to accept requests from specified origins. If you encounter CORS errors, ensure your frontend URL is added to the `CORS_ORIGIN` environment variable in the Fly.io backend deployment.

**Current CORS Origin:** Set in backend environment variables

## Deployment Information

### Fly.io App Configuration
- **App Name:** `2035`
- **Region:** `iad` (US East - Virginia)
- **Port:** 80 (internal), HTTPS (external)
- **Memory:** 1GB
- **Auto-stop:** Enabled (stops when idle)
- **Auto-start:** Enabled (starts on request)

### Backend Technology Stack
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (via Prisma ORM)
- **Cache:** Redis (optional)
- **Authentication:** JWT with refresh tokens
- **Security:** Helmet, CORS, Rate Limiting, Input Sanitization

## Troubleshooting

### Issue: Cannot connect to backend
**Solution:** Check if the backend is running:
```bash
curl https://physician-dashboard-backend.fly.dev/health
```

### Issue: 401 Unauthorized
**Solution:** Ensure you're logged in and have a valid authentication token. The frontend handles this automatically.

### Issue: CORS errors
**Solution:** Contact backend administrator to add your frontend URL to the CORS whitelist.

### Issue: 502 Bad Gateway
**Solution:** The backend may be starting up (auto-start). Wait a few seconds and retry.

## Next Steps

1. ✅ Backend deployed and operational on Fly.io
2. ✅ Frontend configured to use Fly.io backend
3. ⏭️ Test full authentication flow
4. ⏭️ Test patient management features
5. ⏭️ Deploy frontend to production (Vercel/Netlify)

## Additional Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Backend API Documentation](https://physician-dashboard-backend.fly.dev/api-docs) (if enabled in production)
- Backend Repository: `/workspace/backend`
- Frontend Repository: `/workspace`

---

**Last Updated:** 2025-11-09  
**Status:** Production Ready ✅
