# Docker Setup Guide - Physician Dashboard 2035

Complete guide to build and run the backend in Docker containers.

## Prerequisites

- Docker Desktop installed (includes Docker Compose)
- Git (to clone the repository)

### Install Docker Desktop

- **Windows/Mac**: Download from https://www.docker.com/products/docker-desktop
- **Linux**: 
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  ```

Verify installation:
```bash
docker --version
docker-compose --version
```

---

## Quick Start with Docker

### Option 1: Full Stack in Docker (Recommended for Testing)

This runs **everything** in containers: PostgreSQL, Redis, and Backend API.

```bash
# Clone and navigate to repository
git clone https://github.com/lacson1/2035.git
cd 2035
git checkout claude/analysis-work-011CUtQHFLitF7oDDACVHpKL

# Navigate to backend
cd backend

# Build and start all services
docker-compose -f docker-compose.full.yml up --build
```

**What this does:**
- Builds the backend Docker image
- Starts PostgreSQL database
- Starts Redis cache
- Runs database migrations automatically
- Starts the backend API server

**Access:**
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health

### Option 2: Databases in Docker, Backend on Host (Recommended for Development)

This is better for active development since you can edit code and see changes immediately.

```bash
cd backend

# Start only PostgreSQL and Redis
docker-compose up -d

# Install dependencies locally
npm install

# Create .env file
cp .env.docker.example .env
# Edit .env and use: DATABASE_URL=postgresql://postgres:postgres@localhost:5433/...

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start backend in development mode
npm run dev
```

---

## Detailed Setup

### 1. Build Backend Docker Image

```bash
cd backend

# Build the image
docker build -t physician-dashboard-backend .

# Verify the image was created
docker images | grep physician-dashboard
```

**Build options:**
```bash
# Build with specific tag
docker build -t physician-dashboard-backend:v1.0.0 .

# Build without cache (clean build)
docker build --no-cache -t physician-dashboard-backend .

# Build and view build output
docker build -t physician-dashboard-backend . --progress=plain
```

### 2. Run with Docker Compose

#### Start All Services:
```bash
docker-compose -f docker-compose.full.yml up -d
```

Options:
- `-d` = detached mode (runs in background)
- `--build` = rebuild images before starting
- `--force-recreate` = recreate containers even if config hasn't changed

#### View Logs:
```bash
# All services
docker-compose -f docker-compose.full.yml logs -f

# Specific service
docker-compose -f docker-compose.full.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.full.yml logs --tail=100 backend
```

#### Stop Services:
```bash
# Stop but keep containers
docker-compose -f docker-compose.full.yml stop

# Stop and remove containers
docker-compose -f docker-compose.full.yml down

# Stop, remove containers, and delete volumes (WARNING: deletes database!)
docker-compose -f docker-compose.full.yml down -v
```

### 3. Verify Backend is Running

```bash
# Check health endpoint
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital2035.com",
    "password": "admin123"
  }'
```

### 4. Seed Database in Docker

If you need to reseed the database after the container is running:

```bash
# Execute seed command inside the container
docker exec -it physician-dashboard-backend npx prisma db seed

# Or with docker-compose
docker-compose -f docker-compose.full.yml exec backend npx prisma db seed
```

---

## Environment Variables for Docker

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.docker.example .env
```

**Important variables:**

| Variable | Docker Network Value | Local Development Value |
|----------|---------------------|------------------------|
| DATABASE_URL | `postgresql://postgres:postgres@postgres:5432/...` | `postgresql://postgres:postgres@localhost:5433/...` |
| REDIS_URL | `redis://redis:6379` | `redis://localhost:6379` |
| JWT_SECRET | Generate secure value | Generate secure value |

**Generate secure JWT secrets:**
```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Docker Commands Reference

### Container Management

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop a container
docker stop physician-dashboard-backend

# Start a stopped container
docker start physician-dashboard-backend

# Restart a container
docker restart physician-dashboard-backend

# Remove a container
docker rm physician-dashboard-backend

# Remove all stopped containers
docker container prune
```

### Image Management

```bash
# List images
docker images

# Remove an image
docker rmi physician-dashboard-backend

# Remove unused images
docker image prune

# Remove all unused images, containers, networks
docker system prune -a
```

### Logs and Debugging

```bash
# View container logs
docker logs physician-dashboard-backend

# Follow logs in real-time
docker logs -f physician-dashboard-backend

# Last 100 lines
docker logs --tail=100 physician-dashboard-backend

# Execute command in running container
docker exec -it physician-dashboard-backend sh

# Execute Prisma Studio in container
docker exec -it physician-dashboard-backend npx prisma studio
```

### Database Access

```bash
# Connect to PostgreSQL in container
docker exec -it physician-dashboard-db psql -U postgres -d physician_dashboard_2035

# Run SQL query
docker exec -it physician-dashboard-db psql -U postgres -d physician_dashboard_2035 -c "SELECT * FROM users LIMIT 5;"

# Backup database
docker exec physician-dashboard-db pg_dump -U postgres physician_dashboard_2035 > backup.sql

# Restore database
docker exec -i physician-dashboard-db psql -U postgres physician_dashboard_2035 < backup.sql
```

### Redis Access

```bash
# Connect to Redis CLI
docker exec -it physician-dashboard-redis redis-cli

# Test Redis
docker exec -it physician-dashboard-redis redis-cli ping

# View all keys
docker exec -it physician-dashboard-redis redis-cli keys '*'

# Clear Redis cache
docker exec -it physician-dashboard-redis redis-cli flushall
```

---

## Troubleshooting

### Issue: Build Fails at Prisma Generate

**Error:** `Failed to fetch Prisma engine binaries`

**Solution:**
```bash
# Build with network access to Prisma CDN
docker build --network=host -t physician-dashboard-backend .

# Or set Prisma binary target explicitly
docker build --build-arg PRISMA_BINARY_TARGET=linux-musl-openssl-3.0.x -t physician-dashboard-backend .
```

### Issue: Cannot Connect to Database

**Check if database is running:**
```bash
docker ps | grep physician-dashboard-db
```

**Check database logs:**
```bash
docker logs physician-dashboard-db
```

**Verify database connection from backend:**
```bash
docker exec -it physician-dashboard-backend npx prisma db execute --stdin < /dev/null
```

### Issue: Port Already in Use

**Error:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or change port in docker-compose.full.yml
ports:
  - "3001:3000"  # Map host port 3001 to container port 3000
```

### Issue: Container Exits Immediately

**Check logs:**
```bash
docker logs physician-dashboard-backend
```

**Common causes:**
- Missing DATABASE_URL environment variable
- Database not ready (increase `start_period` in healthcheck)
- Migration errors

**Debug by running container interactively:**
```bash
docker run -it --rm physician-dashboard-backend sh
```

### Issue: Migrations Fail

**Reset and re-run migrations:**
```bash
docker-compose -f docker-compose.full.yml down -v
docker-compose -f docker-compose.full.yml up --build
```

**Manually run migrations:**
```bash
docker exec -it physician-dashboard-backend npx prisma migrate deploy
```

---

## Production Deployment

### Security Checklist

- ✅ Change default PostgreSQL password
- ✅ Generate strong JWT secrets (32+ characters)
- ✅ Set `NODE_ENV=production`
- ✅ Use environment variables (not hardcoded values)
- ✅ Enable HTTPS/TLS for external access
- ✅ Set up database backups
- ✅ Configure firewall rules
- ✅ Use Docker secrets for sensitive data
- ✅ Set resource limits (CPU, memory)
- ✅ Enable health checks and monitoring

### Example Production docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    image: physician-dashboard-backend:latest
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      NODE_ENV: production
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    restart: always
```

### Build and Push to Registry

```bash
# Tag for registry
docker tag physician-dashboard-backend:latest your-registry.com/physician-dashboard-backend:v1.0.0

# Push to registry
docker push your-registry.com/physician-dashboard-backend:v1.0.0

# Pull on production server
docker pull your-registry.com/physician-dashboard-backend:v1.0.0
```

---

## Frontend with Docker Backend

Once backend is running in Docker, start the frontend:

```bash
# In project root
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env
npm install
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## Performance Optimization

### Multi-stage Build Benefits

The Dockerfile uses multi-stage builds:
- **Stage 1 (builder)**: Full Node.js with dev dependencies
- **Stage 2 (production)**: Slim Node.js with only runtime dependencies

This reduces final image size by ~60%.

### Cache Optimization

```bash
# Leverage build cache
docker build -t physician-dashboard-backend .

# See cache usage
docker builder prune --filter until=24h
```

### Resource Limits

Add to `docker-compose.full.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
```

---

## Monitoring

### Health Checks

The backend includes health checks at:
- `/health` - Basic health status
- `/health/live` - Liveness probe
- `/health/ready` - Readiness probe

### Docker Stats

```bash
# View resource usage
docker stats physician-dashboard-backend

# View all containers
docker stats
```

### Logging

```bash
# Export logs to file
docker logs physician-dashboard-backend > backend.log 2>&1

# Send logs to monitoring service (e.g., Datadog, ELK)
docker run -d \
  --log-driver=syslog \
  --log-opt syslog-address=tcp://logs.example.com:514 \
  physician-dashboard-backend
```

---

## Next Steps

1. ✅ Build and run backend in Docker
2. ✅ Verify all services are healthy
3. ✅ Test API endpoints
4. ✅ Start frontend development
5. ✅ Deploy to production

For more information:
- [Local Setup Guide](./LOCAL_SETUP_GUIDE.md)
- [API Documentation](./API_ENDPOINTS.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

**Happy Dockerizing! 🐳**
