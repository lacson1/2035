# 🚀 Deployment Guide

Complete guide for deploying the Physician Dashboard 2035 application.

## Quick Links

- [Render Backend Deployment](#render-backend-deployment)
- [Vercel Frontend Deployment](#vercel-frontend-deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Render Backend Deployment

### Prerequisites

1. Render account: https://render.com
2. PostgreSQL database service on Render
3. GitHub repository connected

### Steps

1. **Create Backend Service**
   - New → Web Service
   - Connect your GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
   - Environment: Docker

2. **Set Environment Variables**
   ```
   DATABASE_URL=<from PostgreSQL Internal URL>
   CORS_ORIGIN=<your-vercel-url>,https://*.vercel.app,http://localhost:5173
   JWT_SECRET=<generate-random-string>
   JWT_REFRESH_SECRET=<generate-random-string>
   NODE_ENV=production
   PORT=3000
   ```

3. **Clear Build Cache** (if redeploying)
   - Settings → Build & Deploy → Clear build cache

4. **Deploy**
   - Manual Deploy → Deploy latest commit
   - Wait ~5-10 minutes

---

## Vercel Frontend Deployment

### Prerequisites

1. Vercel account: https://vercel.com
2. GitHub repository connected

### Steps

1. **Import Project**
   - New Project → Import from GitHub
   - Select repository
   - Framework Preset: Vite
   - Root Directory: `.` (root)

2. **Set Environment Variables**
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com/api
   ```

3. **Deploy**
   - Deploy automatically on push
   - Or manually redeploy from dashboard

---

## Environment Variables

### Backend (Render)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `CORS_ORIGIN` | ✅ | Comma-separated list of allowed origins |
| `JWT_SECRET` | ✅ | Secret for JWT token signing |
| `JWT_REFRESH_SECRET` | ✅ | Secret for refresh token signing |
| `NODE_ENV` | ✅ | Set to `production` |
| `PORT` | ✅ | Server port (default: 3000) |
| `REDIS_URL` | ❌ | Optional Redis connection (leave empty if not using) |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | ✅ | Backend API URL |

---

## Troubleshooting

### Prisma OpenSSL Errors

**Problem**: `Error loading shared library libssl.so.1.1`

**Solution**: 
- ✅ Use Debian base image (already configured in Dockerfile)
- ✅ Clear build cache in Render
- ✅ Verify `PRISMA_BINARY_TARGETS=debian-openssl-3.0.x` is set

### CORS Errors

**Problem**: `Access-Control-Allow-Origin header mismatch`

**Solution**:
- ✅ Set `CORS_ORIGIN` in Render to include your Vercel URL
- ✅ Set `VITE_API_BASE_URL` in Vercel to your Render backend URL
- ✅ Use comma-separated list: `https://your-app.vercel.app,https://*.vercel.app`

### Database Connection Errors

**Problem**: `PrismaClientInitializationError`

**Solution**:
- ✅ Use **Internal Database URL** from Render PostgreSQL service
- ✅ Format: `postgresql://user:password@host:port/database`
- ✅ Verify database is running and accessible

### Redis Connection Errors

**Problem**: `ECONNREFUSED ::1:6379`

**Solution**:
- ✅ Redis is optional - leave `REDIS_URL` empty/unset
- ✅ App will work without Redis (caching disabled)

---

## Health Checks

### Backend Health

```bash
curl https://your-backend.onrender.com/health
```

Expected response:
```json
{"status":"ok"}
```

### Frontend Check

1. Open your Vercel URL
2. Try logging in
3. Check browser console for errors

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

