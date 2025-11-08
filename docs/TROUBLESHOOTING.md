# 🔧 Troubleshooting Guide

Common issues and solutions for the Physician Dashboard 2035 application.

## Table of Contents

- [Authentication Issues](#authentication-issues)
- [Backend Connection Issues](#backend-connection-issues)
- [Database Issues](#database-issues)
- [CORS Issues](#cors-issues)
- [Deployment Issues](#deployment-issues)
- [Port Conflicts](#port-conflicts)

---

## Authentication Issues

### Login Not Working

**Symptoms**: Cannot log in, authentication errors

**Solutions**:
1. Check backend is running: `curl http://localhost:3000/health`
2. Verify JWT secrets are set in environment variables
3. Check browser console for errors
4. Clear browser cookies/localStorage
5. Verify API base URL is correct

### Session Expired

**Symptoms**: Logged out unexpectedly

**Solutions**:
- Check JWT expiration settings
- Verify refresh token is working
- Check backend logs for token validation errors

---

## Backend Connection Issues

### Cannot Connect to Backend

**Symptoms**: `ERR_CONNECTION_REFUSED`, `Network Error`

**Solutions**:
1. **Local Development**:
   ```bash
   cd backend
   npm run dev
   ```
   Verify server starts on port 3000

2. **Production**:
   - Check Render service is running
   - Verify backend URL is correct
   - Check environment variables are set

### 502 Bad Gateway

**Symptoms**: Frontend shows 502 error

**Solutions**:
- Backend service may be down
- Check Render logs for errors
- Verify build completed successfully
- Check health endpoint: `curl https://your-backend.onrender.com/health`

---

## Database Issues

### Prisma Client Errors

**Symptoms**: `PrismaClientInitializationError`, OpenSSL errors

**Solutions**:
1. **Local**:
   ```bash
   cd backend
   npx prisma generate
   ```

2. **Production**:
   - Clear Render build cache
   - Verify Dockerfile uses Debian base image
   - Check `DATABASE_URL` is correct

### Migration Errors

**Symptoms**: Database schema out of sync

**Solutions**:
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Connection String Issues

**Symptoms**: Cannot connect to database

**Solutions**:
- Verify `DATABASE_URL` format: `postgresql://user:password@host:port/db`
- Check database is running
- Verify network access (for cloud databases)

---

## CORS Issues

### CORS Policy Blocked

**Symptoms**: `Access-Control-Allow-Origin header mismatch`

**Solutions**:
1. **Backend** (Render):
   ```
   CORS_ORIGIN=https://your-app.vercel.app,https://*.vercel.app,http://localhost:5173
   ```

2. **Frontend** (Vercel):
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com/api
   ```

3. Verify both URLs are correct and match

---

## Deployment Issues

### Build Fails

**Symptoms**: Deployment fails during build

**Solutions**:
1. Check build logs for specific errors
2. Verify all dependencies are in `package.json`
3. Check Node.js version compatibility
4. Clear build cache and retry

### Environment Variables Not Working

**Symptoms**: Variables not accessible in app

**Solutions**:
- **Vercel**: Variables must start with `VITE_` for frontend
- **Render**: Variables available to backend automatically
- Redeploy after adding variables
- Check variable names match exactly

---

## Port Conflicts

### Port Already in Use

**Symptoms**: `EADDRINUSE: address already in use`

**Solutions**:
1. Find process using port:
   ```bash
   lsof -i :3000
   ```

2. Kill process:
   ```bash
   kill -9 <PID>
   ```

3. Or change port in `.env`:
   ```
   PORT=3001
   ```

---

## Debug Commands

### Backend Debug

```bash
# Check backend health
curl http://localhost:3000/health

# Check database connection
cd backend
npm run debug:database

# View logs
cd backend
npm run dev
```

### Frontend Debug

```bash
# Check API connection
# Open browser console (F12)
# Look for network errors

# Check environment variables
console.log(import.meta.env.VITE_API_BASE_URL)
```

---

## Getting Help

1. Check logs:
   - Render: Dashboard → Logs
   - Vercel: Dashboard → Deployments → View Logs
   - Local: Terminal output

2. Verify configuration:
   - Environment variables
   - URLs and endpoints
   - Database connection

3. Check documentation:
   - [Deployment Guide](./DEPLOYMENT.md)
   - [README](../README.md)

