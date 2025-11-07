# Quick Docker Start Guide

Get the backend running in Docker in **5 minutes**! 🐳

## Prerequisites

- Docker Desktop installed and running
- Git (to clone the repo)

## Option 1: One Command Setup (Easiest!)

```bash
cd backend
./docker-start.sh
```

This interactive script will:
- ✅ Check Docker installation
- ✅ Let you choose full-stack or database-only setup
- ✅ Build and start all services
- ✅ Show you all service URLs

## Option 2: Manual Full Stack Setup

```bash
# Clone and navigate
git clone https://github.com/lacson1/2035.git
cd 2035/backend

# Start everything
docker-compose -f docker-compose.full.yml up --build -d

# View logs
docker-compose -f docker-compose.full.yml logs -f
```

**Access your services:**
- 🌐 Backend API: http://localhost:3000
- 📚 API Docs: http://localhost:3000/api-docs
- ❤️ Health Check: http://localhost:3000/health

## Option 3: Databases Only (For Development)

```bash
cd backend
docker-compose up -d
```

Then run backend locally:
```bash
npm install
cp .env.docker.example .env
# Edit .env to use localhost:5433
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Test the Backend

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital2035.com","password":"admin123"}'
```

## Stop Services

```bash
# Full stack
docker-compose -f docker-compose.full.yml down

# Database only
docker-compose down

# Remove volumes too (deletes data)
docker-compose down -v
```

## Troubleshooting

**Issue: Port 3000 already in use**
```bash
lsof -ti:3000 | xargs kill -9
```

**Issue: Services won't start**
```bash
docker-compose -f docker-compose.full.yml logs backend
```

**Issue: Need to rebuild**
```bash
docker-compose -f docker-compose.full.yml up --build --force-recreate
```

## What's Running?

```bash
# Check status
docker ps

# View logs
docker logs physician-dashboard-backend -f

# Execute commands in container
docker exec -it physician-dashboard-backend sh
```

## Next Steps

1. ✅ Backend is running in Docker
2. Start frontend: `cd .. && npm run dev`
3. Visit: http://localhost:5173
4. Login with: admin@hospital2035.com / admin123

## Full Documentation

- [DOCKER_SETUP_GUIDE.md](./DOCKER_SETUP_GUIDE.md) - Complete Docker guide
- [LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md) - Local development guide
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API documentation

---

**That's it! You're ready to develop! 🚀**
