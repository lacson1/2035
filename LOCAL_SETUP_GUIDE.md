# Local Setup Guide - Physician Dashboard 2035

Complete guide to run the full-stack application on your local machine.

## Prerequisites

- Node.js 18+ and npm
- Docker Desktop (for PostgreSQL and Redis)
- Git

## Quick Start

### 1. Clone and Checkout

```bash
git clone https://github.com/lacson1/2035.git
cd 2035
git checkout claude/analysis-work-011CUtQHFLitF7oDDACVHpKL
```

### 2. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### 3. Start Database Services

```bash
cd backend
docker-compose up -d
```

Verify services are running:
```bash
docker ps
# Should see: physician-dashboard-db and physician-dashboard-redis
```

### 4. Configure Backend Environment

```bash
cd backend
cat > .env << 'ENV_EOF'
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/physician_dashboard_2035

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets (generate your own in production!)
JWT_SECRET=dev-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
NODE_ENV=development
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
ENV_EOF
```

### 5. Setup Database

```bash
# Still in backend directory

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with test data
npm run prisma:seed
```

### 6. Configure Frontend Environment

```bash
# Back to project root
cd ..

cat > .env << 'ENV_EOF'
VITE_API_BASE_URL=http://localhost:3000/api
ENV_EOF
```

### 7. Start the Application

Open **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
✅ Database connected
✅ Redis connected
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

You should see:
```
VITE v4.5.14  ready in 301 ms
➜  Local:   http://localhost:5173/
```

### 8. Access the Application

Open your browser to: **http://localhost:5173**

## Default Login Credentials

### Admin Account
- **Email:** admin@hospital2035.com
- **Password:** admin123
- **Role:** Full system access

### Physician Account
- **Email:** sarah.johnson@hospital2035.com
- **Password:** password123
- **Role:** Patient care, clinical notes, prescriptions

### Nurse Account
- **Email:** patricia.williams@hospital2035.com
- **Password:** password123
- **Role:** Vitals, medications, care coordination

## Verify Backend is Running

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-11-07T..."}
```

Test authentication:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital2035.com",
    "password": "admin123"
  }'
```

You should receive a JWT token in the response.

## API Documentation

Once the backend is running, access Swagger API docs at:
- **http://localhost:3000/api-docs**

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL container is running
docker ps | grep physician-dashboard-db

# If not running, start it
cd backend
docker-compose up -d postgres

# Check logs
docker logs physician-dashboard-db
```

### Issue: "Redis connection failed"

**Solution:**
```bash
# Check if Redis container is running
docker ps | grep physician-dashboard-redis

# If not running, start it
cd backend
docker-compose up -d redis

# Test Redis connection
docker exec -it physician-dashboard-redis redis-cli ping
# Should return: PONG
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
cd backend
npm run prisma:generate
```

### Issue: "Migration failed"

**Solution:**
```bash
cd backend

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name init
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or change port in backend/.env
PORT=3001
```

### Issue: "Port 5173 already in use"

**Solution:**
```bash
# Kill process on port 5173
kill -9 $(lsof -ti:5173)

# Or Vite will auto-increment to 5174
```

### Issue: "Frontend shows 'Cannot connect to backend'"

**Checklist:**
1. Backend server is running on port 3000
2. `.env` file exists in project root with correct `VITE_API_BASE_URL`
3. CORS is configured correctly in backend
4. Restart frontend after changing `.env`

### Issue: "Login fails with 401 Unauthorized"

**Solution:**
```bash
# Reseed the database
cd backend
npm run prisma:seed
```

## Development Workflow

### Running Tests

**Frontend tests:**
```bash
npm run test              # Watch mode
npm run test -- --run     # Run once
npm run test:coverage     # With coverage
```

**Backend tests:**
```bash
cd backend
npm run test              # Run tests
npm run test:coverage     # With coverage
```

### Building for Production

**Frontend:**
```bash
npm run build
npm run preview  # Test production build
```

**Backend:**
```bash
cd backend
npm run build
npm start        # Run production build
```

### Database Management

**Open Prisma Studio (Database GUI):**
```bash
cd backend
npm run prisma:studio
# Opens at http://localhost:5555
```

**Create new migration:**
```bash
cd backend
npx prisma migrate dev --name description_of_changes
```

**Reset database:**
```bash
cd backend
npx prisma migrate reset  # WARNING: Deletes all data
npm run prisma:seed       # Reseed
```

## Stopping the Application

### Stop servers:
- Press `Ctrl+C` in both terminal windows

### Stop Docker services:
```bash
cd backend
docker-compose down

# To also remove volumes (deletes data):
docker-compose down -v
```

## Environment Variables Reference

### Backend (.env)
| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | - | PostgreSQL connection string |
| REDIS_URL | redis://localhost:6379 | Redis connection string |
| JWT_SECRET | - | JWT signing secret |
| JWT_REFRESH_SECRET | - | Refresh token secret |
| JWT_EXPIRES_IN | 15m | Access token expiry |
| JWT_REFRESH_EXPIRES_IN | 7d | Refresh token expiry |
| NODE_ENV | development | Environment mode |
| PORT | 3000 | Server port |
| CORS_ORIGIN | http://localhost:5173 | Allowed CORS origin |

### Frontend (.env)
| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_BASE_URL | - | Backend API base URL |
| VITE_SENTRY_DSN | - | Sentry error tracking DSN (optional) |

## Next Steps

1. **Explore the UI** - Login and navigate through different modules
2. **Check API docs** - Visit http://localhost:3000/api-docs
3. **Review code** - Familiarize yourself with the codebase structure
4. **Run tests** - Ensure everything works correctly
5. **Make changes** - Start developing new features!

## Useful Commands

```bash
# View all npm scripts
npm run

# Backend logs (if running in background)
cd backend
npm run dev 2>&1 | tee backend.log

# Check database connection
cd backend
npx prisma db pull

# Format code
npm run lint

# View git branches
git branch -a

# Switch to main branch
git checkout main
```

## Additional Resources

- [Backend API Documentation](./API_ENDPOINTS.md)
- [Testing Guide](./TESTING.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Error Handling](./ERROR_HANDLING.md)

## Support

If you encounter issues not covered here:
1. Check existing documentation files
2. Review backend logs: `cd backend && npm run dev`
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

**Happy Coding! 🚀**
