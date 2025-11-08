# Backend Debugging Guide

## Quick Start

### Run Debug Scripts

**Option 1: Shell Script (Comprehensive)**
```bash
cd backend
./debug-backend.sh
```

**Option 2: Node.js Script (Quick Check)**
```bash
cd backend
node debug.js
```

**Option 3: Manual Check Script**
```bash
cd backend
./scripts/check-setup.sh
```

## Common Issues & Solutions

### 1. Backend Won't Start

#### Port Already in Use
```bash
# Check what's using port 3000
lsof -i:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or change port in .env
PORT=3001
```

#### Missing Dependencies
```bash
cd backend
npm install
```

#### Prisma Client Not Generated
```bash
cd backend
npm run prisma:generate
```

#### Database Connection Error
```bash
# Check if database is running (Docker)
docker ps | grep postgres

# Start database if using Docker
cd backend
docker-compose up -d postgres

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"
```

### 2. Environment Variables Issues

#### Missing .env File
```bash
cd backend
# Create .env file with required variables
cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-here-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-here-min-32-chars"
CORS_ORIGIN="http://localhost:5173"
PORT=3000
NODE_ENV=development
EOF
```

#### Invalid DATABASE_URL
- Format: `postgresql://user:password@host:port/database`
- Check PostgreSQL is running
- Verify credentials are correct
- Ensure database exists

### 3. Database Issues

#### Prisma Migrations Not Applied
```bash
cd backend
npm run prisma:migrate
```

#### Database Schema Out of Sync
```bash
cd backend
# Reset database (WARNING: deletes all data)
npm run prisma:migrate reset

# Or apply migrations
npm run prisma:migrate dev
```

#### View Database with Prisma Studio
```bash
cd backend
npm run prisma:studio
```

### 4. API Endpoints Not Responding

#### Check Backend is Running
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

#### Check API Endpoints
```bash
curl http://localhost:3000/api/v1
# Should return API info
```

#### Test Authentication
```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@hospital2035.com","password":"password123"}'

# Use returned token for authenticated requests
TOKEN="your-token-here"
curl http://localhost:3000/api/v1/patients \
  -H "Authorization: Bearer $TOKEN"
```

### 5. CORS Errors

#### Check CORS Configuration
```bash
cd backend
grep CORS_ORIGIN .env
# Should show: CORS_ORIGIN=http://localhost:5173
```

#### Fix CORS
1. Update `backend/.env`:
   ```env
   CORS_ORIGIN=http://localhost:5173
   ```
2. Restart backend:
   ```bash
   # Stop backend (Ctrl+C)
   npm run dev
   ```

### 6. TypeScript Compilation Errors

#### Build Errors
```bash
cd backend
npm run build
# Check for TypeScript errors
```

#### Type Errors
- Check `tsconfig.json` configuration
- Ensure all types are imported correctly
- Run `npm run build` to see all errors

### 7. Runtime Errors

#### Check Backend Logs
Backend logs appear in the terminal where you ran `npm run dev`. Look for:
- `[ERROR]` - Critical errors
- `[WARN]` - Warnings
- `[INFO]` - Information messages
- `[DEBUG]` - Debug messages (development only)

#### Common Runtime Errors

**Database Connection Error**
```
Error: Can't reach database server
```
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Check network/firewall settings

**JWT Secret Error**
```
JWT_SECRET is required in production
```
- Set JWT_SECRET in .env (min 32 characters)
- Generate secret: `openssl rand -base64 32`

**Prisma Client Error**
```
@prisma/client did not initialize yet
```
- Run: `npm run prisma:generate`
- Restart backend

### 8. Performance Issues

#### Check Database Queries
Enable query logging in `backend/src/config/database.ts`:
```typescript
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

#### Check Redis Connection
```bash
# If using Redis
redis-cli ping
# Should return: PONG
```

#### Monitor API Requests
Backend uses Morgan for HTTP logging. In development, you'll see:
```
GET /api/v1/patients 200 45ms
```

## Debugging Tools

### 1. Prisma Studio (Database GUI)
```bash
cd backend
npm run prisma:studio
# Opens at http://localhost:5555
```

### 2. API Documentation (Swagger)
```bash
# Start backend
npm run dev

# Visit: http://localhost:3000/api-docs
```

### 3. Health Check Endpoint
```bash
curl http://localhost:3000/health
```

### 4. Metrics Endpoint (if enabled)
```bash
curl http://localhost:3000/api/v1/metrics
```

## Step-by-Step Debugging Process

### Step 1: Verify Prerequisites
```bash
# Check Node.js
node --version  # Should be v18+

# Check npm
npm --version

# Check Docker (if using)
docker --version
```

### Step 2: Check Environment
```bash
cd backend
./debug-backend.sh
# Or
node debug.js
```

### Step 3: Install Dependencies
```bash
cd backend
npm install
```

### Step 4: Setup Database
```bash
cd backend
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### Step 5: Start Backend
```bash
cd backend
npm run dev
```

### Step 6: Verify Backend is Running
```bash
# In another terminal
curl http://localhost:3000/health
```

### Step 7: Test API Endpoints
```bash
# Test API info
curl http://localhost:3000/api/v1

# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@hospital2035.com","password":"password123"}'
```

## Debugging Checklist

- [ ] Node.js installed (v18+)
- [ ] npm installed
- [ ] Dependencies installed (`npm install`)
- [ ] .env file exists and configured
- [ ] DATABASE_URL is correct
- [ ] PostgreSQL is running
- [ ] Prisma Client generated (`npm run prisma:generate`)
- [ ] Migrations applied (`npm run prisma:migrate`)
- [ ] Backend starts without errors
- [ ] Health endpoint responds (`/health`)
- [ ] API endpoints respond (`/api/v1`)
- [ ] CORS configured correctly
- [ ] Frontend can connect to backend

## Getting Help

### Check Logs
- Backend terminal output
- Browser console (for frontend issues)
- Network tab in browser DevTools

### Common Error Messages

**"Cannot find module '@prisma/client'"**
```bash
npm run prisma:generate
```

**"DATABASE_URL is required"**
- Create `.env` file with DATABASE_URL

**"Port 3000 already in use"**
```bash
lsof -ti:3000 | xargs kill -9
# Or change PORT in .env
```

**"Prisma schema not found"**
- Ensure you're in the `backend` directory
- Check `prisma/schema.prisma` exists

## Advanced Debugging

### Enable Verbose Logging
Set in `.env`:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

### Debug with VS Code
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Database Query Debugging
Enable in `backend/src/config/database.ts`:
```typescript
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Params: ' + e.params);
  console.log('Duration: ' + e.duration + 'ms');
});
```

## Quick Reference

```bash
# Start backend
cd backend && npm run dev

# Check backend status
curl http://localhost:3000/health

# View database
cd backend && npm run prisma:studio

# Generate Prisma Client
cd backend && npm run prisma:generate

# Run migrations
cd backend && npm run prisma:migrate

# Debug script
cd backend && ./debug-backend.sh
```

---

**Related Documents:**
- `DEBUG_GUIDE.md` - General debugging guide
- `START_BACKEND.md` - How to start the backend
- `SETUP_INSTRUCTIONS.md` - Initial setup guide
- `FIX_BACKEND_CONNECTION.md` - Connection troubleshooting

