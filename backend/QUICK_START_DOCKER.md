# Quick Start: Run Backend with Docker

## 🚀 One Command to Start Everything

```bash
cd backend
./run-docker.sh
```

This will:
- ✅ Generate JWT secrets automatically
- ✅ Build the backend Docker image
- ✅ Start PostgreSQL database
- ✅ Start Redis cache
- ✅ Start the backend API
- ✅ Run database migrations automatically

## 📍 Access Your API

Once running:
- **API**: http://localhost:3000
- **Health**: http://localhost:3000/health
- **API Info**: http://localhost:3000/api/v1

## 🛑 Stop Services

Press `Ctrl+C` or in another terminal:
```bash
cd backend
docker-compose -f docker-compose.local.yml down
```

## 📋 Manual Commands

### Start in Background
```bash
cd backend
docker-compose -f docker-compose.local.yml up -d
```

### View Logs
```bash
docker-compose -f docker-compose.local.yml logs -f backend
```

### Stop Everything
```bash
docker-compose -f docker-compose.local.yml down
```

### Clean Start (Remove Data)
```bash
docker-compose -f docker-compose.local.yml down -v
```

## 🔧 Environment Variables

The script automatically creates `.env.local` with JWT secrets. To customize, edit `backend/.env.local`:

```env
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-secret
```

## ✅ What Gets Started

1. **PostgreSQL** - Database on port 5433
2. **Redis** - Cache on port 6379  
3. **Backend API** - API on port 3000

## 🐛 Troubleshooting

**Port already in use?**
- Stop other services using ports 3000, 5433, or 6379
- Or modify ports in `docker-compose.local.yml`

**Build fails?**
```bash
docker-compose -f docker-compose.local.yml build --no-cache backend
```

**Database connection issues?**
```bash
# Check if database is running
docker-compose -f docker-compose.local.yml ps
```

## 📚 More Info

See `DOCKER_LOCAL_SETUP.md` for detailed documentation.

