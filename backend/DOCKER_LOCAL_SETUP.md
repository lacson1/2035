# Run Backend with Docker Locally

## Quick Start

### Step 1: Generate JWT Secrets

```bash
cd backend

# Generate secrets
export JWT_SECRET=$(openssl rand -base64 32)
export JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Or create a .env file
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env.local
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 32)" >> .env.local
```

### Step 2: Start Services

```bash
cd backend
docker-compose -f docker-compose.local.yml up --build
```

This will:
- Build the backend Docker image
- Start PostgreSQL database
- Start Redis
- Start the backend API
- Run database migrations automatically

### Step 3: Access Your API

Once running, your backend will be available at:
- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Info**: http://localhost:3000/api/v1

### Step 4: Stop Services

Press `Ctrl+C` or run:
```bash
docker-compose -f docker-compose.local.yml down
```

## Commands

### Start in Background
```bash
docker-compose -f docker-compose.local.yml up -d
```

### View Logs
```bash
docker-compose -f docker-compose.local.yml logs -f backend
```

### Stop Services
```bash
docker-compose -f docker-compose.local.yml down
```

### Stop and Remove Volumes (Clean Start)
```bash
docker-compose -f docker-compose.local.yml down -v
```

### Rebuild Backend
```bash
docker-compose -f docker-compose.local.yml up --build backend
```

### Access Database
```bash
# Connect to PostgreSQL
docker exec -it physician-dashboard-db psql -U postgres -d physician_dashboard_2035
```

### Access Backend Container
```bash
docker exec -it physician-dashboard-backend sh
```

## Environment Variables

Create a `.env.local` file in the `backend/` directory:

```env
JWT_SECRET=your-generated-secret-here
JWT_REFRESH_SECRET=your-generated-secret-here
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/physician_dashboard_2035
PORT=3000
CORS_ORIGIN=http://localhost:5173
REDIS_URL=redis://redis:6379
```

Or export them before running docker-compose:
```bash
export JWT_SECRET=$(openssl rand -base64 32)
export JWT_REFRESH_SECRET=$(openssl rand -base64 32)
docker-compose -f docker-compose.local.yml up --build
```

## Troubleshooting

### Port Already in Use
If port 3000, 5433, or 6379 are already in use:
1. Stop the services using those ports
2. Or change ports in `docker-compose.local.yml`

### Database Connection Issues
```bash
# Check if database is running
docker-compose -f docker-compose.local.yml ps

# Check database logs
docker-compose -f docker-compose.local.yml logs postgres
```

### Backend Build Fails
```bash
# Rebuild from scratch
docker-compose -f docker-compose.local.yml build --no-cache backend
docker-compose -f docker-compose.local.yml up backend
```

### Migrations Not Running
The migrations run automatically via `docker-entrypoint.sh`. If they fail:
```bash
# Access backend container
docker exec -it physician-dashboard-backend sh

# Run migrations manually
npx prisma migrate deploy

# Or check migration status
npx prisma migrate status
```

## Development Mode

For development with hot-reload, you might want to use the existing `docker-compose.yml` which only runs PostgreSQL and Redis, then run the backend locally with `npm run dev`.

## Production Build

The Docker setup uses the production Dockerfile. For a production-like environment:
```bash
docker-compose -f docker-compose.local.yml up --build
```

## Next Steps

1. ✅ Backend running on http://localhost:3000
2. Update frontend `VITE_API_BASE_URL` to `http://localhost:3000/api`
3. Test the API endpoints
4. Access database with Prisma Studio: `docker exec -it physician-dashboard-backend npx prisma studio`

