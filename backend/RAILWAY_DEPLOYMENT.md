# Railway Deployment Guide

This guide will walk you through deploying the Physician Dashboard Backend to Railway.

## Prerequisites

- A Railway account (sign up at [railway.app](https://railway.app))
- A GitHub repository (or connect via Railway CLI)
- PostgreSQL database (Railway provides this)

## Step-by-Step Deployment

### 1. Create a New Project on Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo" (recommended) or "Empty Project"

### 2. Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. Note the `DATABASE_URL` - it will be available as an environment variable

### 3. Deploy the Backend Service

#### Option A: Deploy from GitHub (Recommended)

1. In your Railway project, click "+ New"
2. Select "GitHub Repo"
3. Choose your repository
4. Railway will detect the `backend/` directory automatically
5. Set the **Root Directory** to `backend`:
   - Go to Service Settings → Root Directory → Set to `backend`

#### Option B: Deploy via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to existing project or create new one
railway link

# Deploy
railway up
```

### 4. Configure Environment Variables

In Railway, go to your service → **Variables** tab and add:

#### Required Variables

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3000
JWT_SECRET=your-strong-secret-here
JWT_REFRESH_SECRET=your-strong-refresh-secret-here
```

**Generate strong secrets:**
```bash
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

#### Optional Variables

```env
CORS_ORIGIN=https://your-frontend-domain.com
REDIS_URL=redis://your-redis-url:6379
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important Notes:**
- `DATABASE_URL` is automatically provided by Railway when you add a PostgreSQL service
- Use Railway's variable reference syntax: `${{Postgres.DATABASE_URL}}` to reference the database connection
- For `CORS_ORIGIN`, use your frontend's production URL (e.g., `https://yourdomain.com`)

### 5. Configure Service Settings

1. Go to your service → **Settings**
2. Set **Root Directory** to `backend` (if deploying from repo root)
3. Railway will automatically detect the Dockerfile
4. Set **Start Command** (optional, already set in Dockerfile):
   ```
   node dist/app.js
   ```

### 6. Add Redis (Optional but Recommended)

1. In your Railway project, click "+ New"
2. Select "Database" → "Add Redis"
3. Railway will create a Redis instance
4. Add to environment variables:
   ```env
   REDIS_URL=${{Redis.REDIS_URL}}
   ```

### 7. Deploy

Railway will automatically:
1. Build your Docker image
2. Run database migrations (via `docker-entrypoint.sh`)
3. Start your application

Monitor the deployment in the **Deployments** tab.

### 8. Verify Deployment

1. Check the **Logs** tab for:
   - ✅ Database migrations completed
   - ✅ Server running on port 3000
   - ✅ Database connected successfully

2. Test the health endpoint:
   ```bash
   curl https://your-service.railway.app/health
   ```

3. Test API:
   ```bash
   curl https://your-service.railway.app/api/v1
   ```

## Custom Domain (Optional)

1. Go to your service → **Settings** → **Networking**
2. Click "Generate Domain" or "Add Custom Domain"
3. Railway will provide a public URL (e.g., `your-service.railway.app`)
4. For custom domain, add DNS records as instructed

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string | Auto-provided by Railway |
| `JWT_SECRET` | ✅ | Secret for JWT tokens | Generated secret |
| `JWT_REFRESH_SECRET` | ✅ | Secret for refresh tokens | Generated secret |
| `NODE_ENV` | ✅ | Environment mode | `production` |
| `PORT` | ✅ | Server port | `3000` |
| `CORS_ORIGIN` | ⚠️ | Frontend URL | `https://yourdomain.com` |
| `REDIS_URL` | ❌ | Redis connection string | Auto-provided if using Railway Redis |
| `JWT_EXPIRES_IN` | ❌ | Access token expiration | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | ❌ | Refresh token expiration | `7d` |

## Database Migrations

Migrations run automatically on each deployment via the `docker-entrypoint.sh` script. The script:
1. Waits for database connection
2. Runs `prisma migrate deploy`
3. Starts the application

If migrations fail, the deployment will continue (this allows you to fix issues manually if needed).

## Troubleshooting

### Build Fails

**Issue:** Docker build fails
- Check logs in Railway → Deployments
- Ensure all dependencies are in `package.json`
- Verify Dockerfile syntax

**Solution:**
```bash
# Test build locally
cd backend
docker build -t test-backend .
```

### Database Connection Issues

**Issue:** Cannot connect to database
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running in Railway
- Ensure database service is in the same project

**Solution:**
- Use Railway's variable reference: `${{Postgres.DATABASE_URL}}`
- Check database service is "Running" in Railway dashboard

### Migrations Fail

**Issue:** Migrations error on startup
- Check migration files in `prisma/migrations/`
- Verify database schema matches migrations
- Check logs for specific error

**Solution:**
```bash
# Connect to Railway database and check status
railway run npx prisma migrate status
```

### Application Won't Start

**Issue:** Service crashes or doesn't start
- Check application logs in Railway
- Verify environment variables are set
- Check port configuration (Railway sets `PORT` automatically)

**Solution:**
- Review logs: Railway → Your Service → Logs
- Verify health endpoint: `/health/live`
- Check if port is correctly configured

### CORS Issues

**Issue:** Frontend can't connect to API
- Verify `CORS_ORIGIN` matches frontend URL exactly
- Check if frontend is using correct API URL

**Solution:**
```env
CORS_ORIGIN=https://your-frontend-domain.com
# No trailing slash
```

## Monitoring

Railway provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory usage
- **Deployments**: Deployment history and status

## Updating the Deployment

1. Push changes to your GitHub repository
2. Railway automatically detects changes and redeploys
3. Or trigger manual deployment:
   - Railway → Your Service → Deployments → "Redeploy"

## Scaling

Railway supports:
- **Horizontal Scaling**: Add multiple instances
- **Auto-scaling**: Configure based on traffic
- **Resource Limits**: Set CPU/memory limits

Configure in Railway → Your Service → Settings → Scaling

## Cost Optimization

- Use Railway's free tier for development
- Monitor resource usage in Railway dashboard
- Set resource limits to control costs
- Use Railway's sleep feature for non-production services

## Next Steps

1. ✅ Backend deployed to Railway
2. Deploy frontend (separate service or static hosting)
3. Update frontend `VITE_API_BASE_URL` to Railway backend URL
4. Test end-to-end functionality
5. Set up monitoring and alerts

## Support

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Check application logs for detailed error messages

