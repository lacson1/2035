# Fly.io and Docker Integration Guide

## 🎯 Overview

Your backend uses **Docker for both local development and Fly.io deployment**. Here's how they work together:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  LOCAL DEVELOPMENT              PRODUCTION (Fly.io)              │
│  ┌──────────────────┐           ┌──────────────────┐           │
│  │  Docker Compose  │           │  Fly.io Platform │           │
│  │  ┌────────────┐  │           │  ┌────────────┐  │           │
│  │  │ Backend    │  │           │  │ Backend    │  │           │
│  │  │ Container  │  │           │  │ Container  │  │           │
│  │  └────────────┘  │           │  └────────────┘  │           │
│  │  ┌────────────┐  │           │  ┌────────────┐  │           │
│  │  │ PostgreSQL │  │           │  │ PostgreSQL │  │           │
│  │  │ Container  │  │           │  │ (Managed)  │  │           │
│  │  └────────────┘  │           │  └────────────┘  │           │
│  │  ┌────────────┐  │           │  ┌────────────┐  │           │
│  │  │   Redis    │  │           │  │   Redis    │  │           │
│  │  │ Container  │  │           │  │ (Optional) │  │           │
│  │  └────────────┘  │           │  └────────────┘  │           │
│  └──────────────────┘           └──────────────────┘           │
│  localhost:3000                  fly.dev (HTTPS)                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Docker Files Explained

### 1. Backend Dockerfile (`/workspace/backend/Dockerfile`)

**Purpose:** Build production-ready backend container

**Multi-stage Build Process:**

```dockerfile
# Stage 1: Builder
FROM node:18-alpine AS builder
- Install dependencies
- Generate Prisma client
- Compile TypeScript → JavaScript

# Stage 2: Production
FROM node:18-alpine AS production
- Copy only production dependencies
- Copy compiled code from builder
- Run as non-root user (security)
- Execute entrypoint script
```

**Key Features:**
- ✅ Multi-stage build (smaller final image)
- ✅ Non-root user (security best practice)
- ✅ Health checks built-in
- ✅ Automatic database migrations on startup
- ✅ Optimized for Fly.io deployment

**Image Size:** ~150MB (optimized with Alpine Linux)

### 2. Frontend Dockerfile (`/workspace/Dockerfile`)

**Purpose:** Build production-ready frontend container (for deployment)

```dockerfile
# Stage 1: Builder
FROM node:18-alpine AS builder
- Install dependencies
- Build React app (npm run build)

# Stage 2: Production (Nginx)
FROM nginx:alpine AS production
- Serve static files with Nginx
- SPA routing support (try_files)
- Health check endpoint
```

**Note:** Frontend Docker is for deployment only. For development, use `npm run dev` (Vite dev server).

### 3. Docker Compose Files

#### `docker-compose.yml` - Full Local Stack

```yaml
services:
  postgres:    # PostgreSQL database
  redis:       # Redis cache
  backend:     # Backend API (built from Dockerfile)
```

**Use Case:** Run complete backend stack locally with Docker

**Start:**
```bash
cd backend
docker-compose up -d
```

#### `docker-compose.local.yml` - Infrastructure Only

```yaml
services:
  postgres:    # PostgreSQL database
  redis:       # Redis cache
  # NO backend service - run backend with npm run dev
```

**Use Case:** Run just database and Redis, develop backend with hot-reload

**Start:**
```bash
cd backend
./run-docker.sh
# OR
docker-compose -f docker-compose.local.yml up -d
cd backend && npm run dev  # Separate terminal
```

### 4. Docker Entrypoint Script (`docker-entrypoint.sh`)

**Purpose:** Run migrations before starting the app

```bash
#!/bin/sh
1. Run Prisma migrations (prisma migrate deploy)
2. Start Node.js application (node dist/app.js)
```

**Why:** Ensures database schema is up-to-date before app starts

## 🚀 Fly.io Deployment

### How Fly.io Uses Docker

**Fly.io automatically detects and builds your Dockerfile:**

1. You run: `flyctl deploy`
2. Fly.io finds `backend/Dockerfile`
3. Fly.io builds Docker image in the cloud
4. Fly.io deploys container to their infrastructure
5. Fly.io manages PostgreSQL separately (Fly Postgres)

### Current Fly.io Configuration

**File:** `fly.toml` (root directory)

```toml
app = '2035'                           # App name
primary_region = 'iad'                 # US East (Virginia)

[http_service]
  internal_port = 80                   # Container listens on port 80
  force_https = true                   # Force HTTPS
  auto_stop_machines = 'stop'          # Stop when idle
  auto_start_machines = true           # Start on request
  min_machines_running = 0             # Can scale to 0

[[vm]]
  memory = '1gb'                       # 1GB RAM
  cpu_kind = 'shared'                  # Shared CPU
  cpus = 1                             # 1 vCPU
```

**Key Features:**
- ✅ Auto-scaling: Starts on demand, stops when idle
- ✅ HTTPS: Automatic TLS certificates
- ✅ Global CDN: Edge network for fast access
- ✅ Health checks: Automatic container restarts
- ✅ Managed Postgres: Separate database service

### Backend Deployment URL

**Production:** `https://physician-dashboard-backend.fly.dev`

**Health Check:** `https://physician-dashboard-backend.fly.dev/health`

## 🔄 Development Workflows

### Option 1: Full Docker Stack (Production-like)

**When to use:** Testing production build locally

```bash
cd backend

# Start everything with Docker
docker-compose up -d

# View logs
docker-compose logs -f backend

# Access API
curl http://localhost:3000/health

# Stop everything
docker-compose down
```

**What runs:**
- ✅ Backend API (port 3000)
- ✅ PostgreSQL (port 5433)
- ✅ Redis (port 6379)

**Pros:**
- Identical to production environment
- Easy to share with team
- No local Node.js setup needed

**Cons:**
- No hot-reload (must rebuild on code changes)
- Slower feedback loop

### Option 2: Docker Infrastructure + Node.js Backend (Recommended for Development)

**When to use:** Active development with hot-reload

```bash
cd backend

# Terminal 1: Start database and Redis
./run-docker.sh
# OR
docker-compose -f docker-compose.local.yml up -d

# Terminal 2: Start backend with hot-reload
npm run dev  # Uses nodemon for auto-restart
```

**What runs:**
- ✅ PostgreSQL (Docker, port 5433)
- ✅ Redis (Docker, port 6379)
- ✅ Backend API (Node.js directly, port 3000)

**Pros:**
- ✅ Hot-reload on file changes
- ✅ Fast feedback loop
- ✅ Easy debugging
- ✅ TypeScript errors in real-time

**Cons:**
- Requires Node.js installed locally

### Option 3: Local Backend + Fly.io Database (Advanced)

**When to use:** Testing with production data

```bash
# Connect to Fly.io database from local backend
flyctl proxy 5432 -a <your-postgres-app>

# Update local .env
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Run backend locally
npm run dev
```

**Note:** Not recommended for regular development

## 🏗️ Build Process Explained

### Local Docker Build

```bash
cd backend
docker build -t physician-dashboard-backend .
```

**What happens:**
1. **Stage 1 (Builder):**
   - Install all dependencies (including dev)
   - Generate Prisma client
   - Compile TypeScript to JavaScript (`npm run build`)
   - Output: `dist/` folder with compiled JS

2. **Stage 2 (Production):**
   - Fresh Alpine Linux image
   - Copy only production dependencies
   - Copy compiled code from Stage 1
   - Copy Prisma client
   - Create non-root user
   - Set entrypoint script

**Final Image:** ~150MB

### Fly.io Build

```bash
cd backend
flyctl deploy
```

**What happens:**
1. Fly.io uploads your code
2. Fly.io builds Docker image remotely (same Dockerfile)
3. Fly.io deploys to VMs in specified region
4. Fly.io updates routing to new container
5. Old container shuts down (zero-downtime)

**Build time:** 2-3 minutes

## 🗄️ Database Management

### Local Development

**PostgreSQL in Docker:**
```bash
# Start
docker-compose -f docker-compose.local.yml up -d postgres

# Access database
docker exec -it physician-dashboard-db psql -U postgres -d physician_dashboard_2035

# Run migrations
cd backend
npx prisma migrate dev

# Seed data
npx prisma db seed
```

**Connection String:**
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/physician_dashboard_2035
```

### Production (Fly.io)

**Managed Postgres:**
```bash
# Create Postgres (if not exists)
flyctl postgres create --name physician-dashboard-db

# Connect database to app
flyctl postgres attach physician-dashboard-db -a 2035

# Run migrations (automatic via entrypoint script)
# Or manually:
flyctl ssh console -a 2035
cd /app && npx prisma migrate deploy
```

**Connection String:** Automatically set as `DATABASE_URL` env var

## 🔐 Environment Variables

### Local Development (.env)

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/physician_dashboard_2035
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-local-secret
JWT_REFRESH_SECRET=your-local-secret
CORS_ORIGIN=http://localhost:5173
PORT=3000
```

### Production (Fly.io)

**Set via Fly.io CLI:**
```bash
flyctl secrets set JWT_SECRET="$(openssl rand -base64 32)" -a 2035
flyctl secrets set JWT_REFRESH_SECRET="$(openssl rand -base64 32)" -a 2035
flyctl secrets set CORS_ORIGIN="https://your-frontend.vercel.app" -a 2035
```

**Automatic:**
- `DATABASE_URL` - Set by Fly.io when attaching Postgres
- `PORT` - Managed by Fly.io

## 🛠️ Common Docker Commands

### Backend Development

```bash
# Build image
docker build -t physician-backend backend/

# Run container
docker run -p 3000:3000 --env-file backend/.env physician-backend

# View logs
docker logs -f <container-id>

# Execute commands inside container
docker exec -it <container-id> sh

# Clean up
docker system prune -a  # Remove unused images
```

### Docker Compose

```bash
# Start all services
docker-compose -f backend/docker-compose.yml up -d

# Start specific service
docker-compose -f backend/docker-compose.yml up postgres -d

# Stop all services
docker-compose -f backend/docker-compose.yml down

# Stop and remove volumes (DESTRUCTIVE)
docker-compose -f backend/docker-compose.yml down -v

# Rebuild services
docker-compose -f backend/docker-compose.yml up --build

# View logs
docker-compose -f backend/docker-compose.yml logs -f backend

# List running containers
docker-compose -f backend/docker-compose.yml ps
```

## 🚀 Deployment Commands

### Deploy Backend to Fly.io

```bash
cd backend

# Deploy
flyctl deploy

# View logs
flyctl logs -a 2035

# SSH into container
flyctl ssh console -a 2035

# Scale resources
flyctl scale vm shared-cpu-1x --memory 2048 -a 2035

# Check status
flyctl status -a 2035

# View secrets
flyctl secrets list -a 2035
```

### Deploy Frontend (Optional - if using Docker)

**Note:** Currently, frontend is deployed to Vercel (no Docker needed)

**If deploying frontend with Docker to Fly.io:**

```bash
# Create Fly.io app for frontend
flyctl launch --name physician-dashboard-frontend

# Configure fly.toml for frontend
# (Uses /workspace/Dockerfile)

# Deploy
flyctl deploy
```

## 📊 Performance Optimization

### Docker Image Optimization

**Current optimizations in Dockerfile:**

1. **Multi-stage build:** Separate build and runtime stages
2. **Alpine Linux:** Minimal base image (~5MB vs ~1GB for Ubuntu)
3. **Layer caching:** Dependencies cached separately from code
4. **Production deps only:** Dev dependencies excluded from final image
5. **Non-root user:** Security best practice

**Image sizes:**
- Builder stage: ~500MB
- Final image: ~150MB ✅

### Fly.io Optimizations

1. **Auto-scaling:** Scale to zero when idle, save costs
2. **Region:** `iad` (US East) for low latency
3. **Health checks:** Auto-restart unhealthy containers
4. **Shared CPU:** Cost-effective for most workloads
5. **Redis caching:** Optional, reduces database load

## 🐛 Troubleshooting

### Issue: Docker build fails

```bash
# Clear cache and rebuild
docker build --no-cache -t physician-backend backend/

# Check Docker is running
docker ps

# View build logs
docker-compose -f backend/docker-compose.yml build --progress=plain backend
```

### Issue: Port already in use

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # External:Internal
```

### Issue: Database connection failed

```bash
# Check if PostgreSQL is running
docker-compose -f backend/docker-compose.yml ps postgres

# Check PostgreSQL logs
docker-compose -f backend/docker-compose.yml logs postgres

# Restart PostgreSQL
docker-compose -f backend/docker-compose.yml restart postgres

# Verify connection string
echo $DATABASE_URL
```

### Issue: Prisma migration failed

```bash
# Reset database (DESTRUCTIVE - dev only)
npx prisma migrate reset

# Force migration
npx prisma migrate deploy --force

# Generate Prisma client
npx prisma generate
```

### Issue: Fly.io deployment fails

```bash
# Check build logs
flyctl logs -a 2035

# Verify secrets are set
flyctl secrets list -a 2035

# Check app status
flyctl status -a 2035

# SSH into failed container
flyctl ssh console -a 2035

# Manual migration
flyctl ssh console -a 2035
cd /app && npx prisma migrate deploy
```

### Issue: Fly.io app not starting (502 Bad Gateway)

**Cause:** Auto-start enabled, container starting up

**Solution:** Wait 5-10 seconds, retry request

```bash
# Check if app is starting
flyctl status -a 2035

# View real-time logs
flyctl logs -a 2035 -f

# Force restart
flyctl apps restart 2035
```

## 📈 Monitoring

### Local Development

```bash
# View all container logs
docker-compose -f backend/docker-compose.yml logs -f

# View specific service logs
docker-compose -f backend/docker-compose.yml logs -f backend

# Monitor resource usage
docker stats

# Health check
curl http://localhost:3000/health
```

### Production (Fly.io)

```bash
# View logs
flyctl logs -a 2035

# Real-time logs
flyctl logs -a 2035 -f

# Check metrics
flyctl dashboard -a 2035  # Opens web dashboard

# Health check
curl https://physician-dashboard-backend.fly.dev/health
```

## 🎯 Best Practices

### Development

1. ✅ Use `docker-compose.local.yml` + `npm run dev` for hot-reload
2. ✅ Run migrations before starting: `npx prisma migrate dev`
3. ✅ Seed test data: `npx prisma db seed`
4. ✅ Keep Docker images updated: `docker-compose pull`
5. ✅ Clean up periodically: `docker system prune`

### Production (Fly.io)

1. ✅ Use secrets for sensitive data: `flyctl secrets set`
2. ✅ Run migrations automatically via `docker-entrypoint.sh`
3. ✅ Monitor logs after deployment: `flyctl logs -f`
4. ✅ Set appropriate resource limits in `fly.toml`
5. ✅ Enable auto-scaling for cost optimization
6. ✅ Use health checks for auto-restart
7. ✅ Keep Prisma and dependencies updated

### Security

1. ✅ Never commit `.env` files
2. ✅ Use non-root user in Docker containers
3. ✅ Rotate JWT secrets regularly
4. ✅ Keep base images updated (Alpine Linux)
5. ✅ Scan images for vulnerabilities: `docker scan`

## 📚 Quick Reference

### Start Local Development

```bash
# Option 1: Full Docker (no hot-reload)
cd backend && docker-compose up -d

# Option 2: Docker DB + Node.js (recommended)
cd backend && ./run-docker.sh
# Then in another terminal:
cd backend && npm run dev
```

### Deploy to Fly.io

```bash
cd backend
flyctl deploy
```

### Environment Files

| File | Location | Purpose |
|------|----------|---------|
| `.env.example` | `/workspace` | Frontend template |
| `.env` | `/workspace` | Frontend config (gitignored) |
| `.env.example` | `/workspace/backend` | Backend template |
| `.env` | `/workspace/backend` | Backend local config (gitignored) |
| `.env.local` | `/workspace/backend` | Generated by `run-docker.sh` |

### Ports

| Service | Local Port | Docker Internal | Fly.io |
|---------|------------|-----------------|--------|
| Backend API | 3000 | 3000 | 443 (HTTPS) |
| PostgreSQL | 5433 | 5432 | Managed |
| Redis | 6379 | 6379 | Optional |
| Frontend (dev) | 5173 | N/A | Vercel |

## 🎉 Summary

### Docker Usage

1. **Local Development:** 
   - Database + Redis in Docker containers
   - Backend with `npm run dev` (hot-reload)

2. **Local Testing:**
   - Full stack in Docker (production-like)
   - Use `docker-compose up`

3. **Production (Fly.io):**
   - Fly.io builds your Dockerfile
   - Deploys container automatically
   - Manages PostgreSQL separately

### Key Takeaways

✅ **Docker provides consistent environments** (dev = prod)  
✅ **Fly.io uses your Dockerfile** for deployment  
✅ **Multi-stage builds** optimize image size  
✅ **Docker Compose** simplifies local development  
✅ **Automatic migrations** ensure database is up-to-date  
✅ **Health checks** enable auto-restart  
✅ **Auto-scaling** optimizes costs

### Current Setup

- **Backend Docker:** ✅ Production-ready (`backend/Dockerfile`)
- **Frontend Docker:** ✅ Created (optional deployment)
- **Docker Compose:** ✅ Local development ready
- **Fly.io:** ✅ Deployed and operational
- **Database:** ✅ Managed PostgreSQL on Fly.io

---

**Last Updated:** 2025-11-09  
**Backend:** `https://physician-dashboard-backend.fly.dev`  
**Status:** ✅ Fully Operational with Docker + Fly.io
