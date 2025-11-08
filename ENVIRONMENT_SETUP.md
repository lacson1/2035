# Environment Setup Guide

Complete guide for setting up environment variables for the Physician Dashboard 2035 application.

## Quick Start

1. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Frontend Setup:**
   ```bash
   # In project root
   cp .env.example .env
   # Edit .env with your values
   ```

## Backend Environment Variables

### Required Variables

#### `DATABASE_URL`
PostgreSQL database connection string.

**Format:**
```
postgresql://username:password@host:port/database
```

**Examples:**
- Local: `postgresql://postgres:password@localhost:5432/physician_dashboard`
- Railway: `postgresql://user:pass@containers-us-west-xxx.railway.app:5432/railway`
- Render: `postgresql://user:pass@dpg-xxx-a.oregon-postgres.render.com/dbname`

**How to get:**
- Local: Create database with `createdb physician_dashboard`
- Railway: Found in Railway dashboard → Database → Connection String
- Render: Found in Render dashboard → Database → Internal Database URL

#### `JWT_SECRET`
Secret key for signing JWT access tokens. **CRITICAL for security.**

**Requirements:**
- Minimum 32 characters in production
- Must be cryptographically random
- Never commit to version control

**Generate:**
```bash
openssl rand -base64 32
```

**Example:**
```
JWT_SECRET=K8xL2mN9pQ4rS7tU1vW5yZ8aB3cD6eF9gH2jK5mN8pQ1rS4tU7vW0yZ3aB6cD9eF
```

#### `JWT_REFRESH_SECRET`
Secret key for signing JWT refresh tokens. **CRITICAL for security.**

**Requirements:**
- Minimum 32 characters in production
- Must be different from `JWT_SECRET`
- Must be cryptographically random

**Generate:**
```bash
openssl rand -base64 32
```

### Optional Variables

#### `NODE_ENV`
Node.js environment mode.

**Values:**
- `development` (default)
- `production`
- `test`

**Example:**
```
NODE_ENV=production
```

#### `PORT`
Server port number.

**Default:** `3000`

**Example:**
```
PORT=3000
```

#### `REDIS_URL`
Redis connection URL for caching.

**Format:**
```
redis://host:port
redis://:password@host:port
```

**Default:** `redis://localhost:6379`

**Examples:**
- Local: `redis://localhost:6379`
- Railway: `redis://default:password@containers-us-west-xxx.railway.app:6379`
- Upstash: `redis://default:password@xxx.upstash.io:6379`

**Note:** Application works without Redis (falls back to memory cache), but Redis is recommended for production.

#### `CORS_ORIGIN`
Allowed CORS origin for frontend.

**Default:** `http://localhost:5173`

**Examples:**
- Development: `http://localhost:5173`
- Production: `https://yourdomain.com`
- Multiple origins: Not directly supported (use middleware)

#### `JWT_EXPIRES_IN`
Access token expiration time.

**Default:** `15m` (15 minutes)

**Format:** See [zeit/ms](https://github.com/zeit/ms) for valid formats.

**Examples:**
- `15m` - 15 minutes
- `1h` - 1 hour
- `7d` - 7 days

#### `JWT_REFRESH_EXPIRES_IN`
Refresh token expiration time.

**Default:** `7d` (7 days)

**Format:** See [zeit/ms](https://github.com/zeit/ms) for valid formats.

#### `RATE_LIMIT_WINDOW_MS`
Rate limiting window in milliseconds.

**Default:** `60000` (1 minute)

**Example:**
```
RATE_LIMIT_WINDOW_MS=60000
```

#### `RATE_LIMIT_MAX_REQUESTS`
Maximum requests per rate limit window.

**Default:** `100`

**Example:**
```
RATE_LIMIT_MAX_REQUESTS=100
```

## Frontend Environment Variables

### Required Variables

#### `VITE_API_BASE_URL`
Backend API base URL.

**Format:**
```
http://host:port/api
https://host/api
```

**Examples:**
- Local development: `http://localhost:3000/api`
- Production: `https://api.yourdomain.com/api`

**Note:** Must include `/api` path.

### Optional Variables

#### `VITE_SENTRY_DSN`
Sentry DSN for error tracking (frontend).

**Format:**
```
https://your-sentry-dsn@sentry.io/project-id
```

**How to get:**
1. Sign up at [sentry.io](https://sentry.io)
2. Create a project
3. Copy DSN from project settings

**Note:** Only used in production builds.

## Environment Setup by Deployment Platform

### Local Development

1. **Backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env:
   # - Set DATABASE_URL to your local PostgreSQL
   # - Generate JWT_SECRET and JWT_REFRESH_SECRET
   ```

2. **Frontend:**
   ```bash
   cp .env.example .env
   # Edit .env:
   # - Set VITE_API_BASE_URL=http://localhost:3000/api
   ```

### Railway Deployment

1. **Backend:**
   - Go to Railway dashboard → Your service → Variables
   - Add all required variables from `.env.example`
   - Railway automatically provides `DATABASE_URL` if you add a PostgreSQL service
   - Generate secrets: `openssl rand -base64 32`

2. **Frontend:**
   - Go to Railway dashboard → Your service → Variables
   - Add `VITE_API_BASE_URL` pointing to your backend service

### Render Deployment

1. **Backend:**
   - Go to Render dashboard → Your service → Environment
   - Add all required variables
   - Render provides `DATABASE_URL` automatically for PostgreSQL databases
   - Generate secrets: `openssl rand -base64 32`

2. **Frontend:**
   - Go to Render dashboard → Your service → Environment
   - Add `VITE_API_BASE_URL` pointing to your backend service

### Vercel Deployment

1. **Frontend:**
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Add `VITE_API_BASE_URL` pointing to your backend

**Note:** Vercel is typically used for frontend only. Backend should be deployed separately (Railway, Render, etc.).

## Security Best Practices

### ✅ DO:

1. **Never commit `.env` files** to version control
2. **Use strong secrets** (minimum 32 characters)
3. **Use different secrets** for development and production
4. **Rotate secrets** periodically (every 90 days recommended)
5. **Use environment variables** from your hosting provider
6. **Restrict CORS** to your frontend domain in production

### ❌ DON'T:

1. **Don't share secrets** in chat, email, or documentation
2. **Don't use default secrets** in production
3. **Don't commit secrets** to Git (even in private repos)
4. **Don't use the same secret** for JWT_SECRET and JWT_REFRESH_SECRET
5. **Don't expose secrets** in client-side code

## Troubleshooting

### Backend won't start

**Error:** `DATABASE_URL is required`
- **Solution:** Add `DATABASE_URL` to your `.env` file

**Error:** `JWT_SECRET is required in production`
- **Solution:** Generate and set `JWT_SECRET` and `JWT_REFRESH_SECRET`

**Error:** `JWT_SECRET must be at least 32 characters long`
- **Solution:** Generate a longer secret: `openssl rand -base64 32`

### Frontend can't connect to backend

**Error:** `Cannot connect to backend server`
- **Check:** `VITE_API_BASE_URL` is set correctly
- **Check:** Backend server is running
- **Check:** CORS is configured correctly

### Redis connection errors

**Warning:** `Redis not available, continuing without cache`
- **This is OK:** Application works without Redis
- **For production:** Set up Redis for better performance

## Verification

### Verify Backend Environment

```bash
cd backend
npm run dev
# Should start without errors
# Check console for warnings about missing variables
```

### Verify Frontend Environment

```bash
npm run dev
# Open browser console
# Check for API_BASE_URL in logs
```

### Test API Connection

```bash
# Health check
curl http://localhost:3000/health

# Should return: {"status":"ok"}
```

## Additional Resources

- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Redis Connection Strings](https://redis.io/docs/manual/connections/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Environment Variables Best Practices](https://12factor.net/config)

---

**Last Updated:** December 2024  
**Maintained By:** Development Team

