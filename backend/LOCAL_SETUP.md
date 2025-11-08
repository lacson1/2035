# Local Development Setup

## Quick Start (5 Minutes)

### Option 1: Automated Setup (Recommended)
```bash
cd backend
./setup-local.sh
npm run dev
```

### Option 2: Manual Setup

#### 1. Create `.env` file
```bash
cd backend
cat > .env << 'EOF'
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/physician_dashboard_2035"
JWT_SECRET="local-dev-secret"
JWT_REFRESH_SECRET="local-dev-refresh-secret"
CORS_ORIGIN="http://localhost:5173"
REDIS_URL=""
EOF
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Setup Database

**Option A: Use Docker (Easiest)**
```bash
# Start PostgreSQL with Docker
docker run --name physician-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=physician_dashboard_2035 \
  -p 5432:5432 \
  -d postgres:15

# Run migrations
npx prisma migrate dev
```

**Option B: Use Local PostgreSQL**
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb physician_dashboard_2035

# Run migrations
npx prisma migrate dev
```

#### 4. Generate Prisma Client
```bash
npx prisma generate
```

#### 5. Start Development Server
```bash
npm run dev
```

#### 6. Verify Server is Running
```bash
# Test health endpoint
curl http://localhost:3000/health/live

# Expected response:
# {"status":"ok","timestamp":"..."}
```

## Access Your Local Backend

- **Health Check:** http://localhost:3000/health/live
- **API Docs:** http://localhost:3000/api-docs
- **API Base:** http://localhost:3000/api

## Frontend Configuration

Make sure your frontend is pointing to the local backend:

**In your frontend `.env` or config:**
```bash
VITE_API_URL=http://localhost:3000
```

Or the frontend will automatically use `http://localhost:3000` if running in development mode.

## Common Issues

### Issue 1: Port 3000 Already in Use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different port in .env
PORT=3001
```

### Issue 2: Database Connection Failed
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql

# Or with Docker:
docker start physician-db
```

### Issue 3: Prisma Client Not Generated
```bash
# Generate Prisma Client
npx prisma generate

# If still fails, reinstall
rm -rf node_modules
npm install
npx prisma generate
```

### Issue 4: Migration Errors
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or create fresh migration
npx prisma migrate dev --name init
```

## Useful Commands

```bash
# Development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production build
npm start

# Run migrations
npx prisma migrate dev

# Open Prisma Studio (Database GUI)
npx prisma studio

# View database
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Reset database
npx prisma migrate reset

# Seed database
npm run prisma:seed
```

## Database Management

### View Database with Prisma Studio
```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Manual Database Connection
```bash
# Connect to PostgreSQL
psql physician_dashboard_2035

# Or with connection string
psql "postgresql://postgres:postgres@localhost:5432/physician_dashboard_2035"
```

### Database Backup
```bash
# Backup database
pg_dump physician_dashboard_2035 > backup.sql

# Restore database
psql physician_dashboard_2035 < backup.sql
```

## Environment Variables

Create a `.env` file with these variables:

```bash
# Required
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/physician_dashboard_2035
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:5173

# Optional
REDIS_URL=redis://localhost:6379
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=debug
```

## Testing the API

### Using cURL
```bash
# Health check
curl http://localhost:3000/health/live

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"password123","firstName":"Admin","lastName":"User","role":"admin"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

### Using API Docs
Open http://localhost:3000/api-docs in your browser for interactive API documentation.

## Troubleshooting

### Check Server Logs
The server logs will show any errors. Look for:
- Database connection errors
- Prisma errors
- Port conflicts
- Missing environment variables

### Verify Dependencies
```bash
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Clean Start
```bash
# Stop server (Ctrl+C)
# Clean build and dependencies
rm -rf node_modules dist
npm install
npx prisma generate
npm run dev
```

## Next Steps

1. ✅ Start backend server locally
2. ✅ Verify health endpoint works
3. ✅ Start frontend (it will connect to backend automatically)
4. ✅ Test login/registration

Once everything works locally, you can deploy to Fly.io using the deployment guide.

---

**Need help?** Check the error messages in your terminal or see the troubleshooting section above.

