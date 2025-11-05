# Quick Start Guide - Billing System Setup

## Issue: "Failed to fetch" Error

This error means the backend server is not running. Follow these steps:

## Step 1: Set Up Backend Environment

```bash
cd backend

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/physician_dashboard_2035?schema=public"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
EOF
  echo "✅ Created .env file - Please update DATABASE_URL with your database credentials"
fi
```

## Step 2: Install Dependencies (if not already done)

```bash
cd backend
npm install
```

## Step 3: Run Database Migrations

Since we added new billing models, you need to run migrations:

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations (this will create the billing tables)
npm run prisma:migrate

# If you need to seed the database with initial data
npm run prisma:seed
```

## Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
📝 Environment: development
🔗 CORS Origin: http://localhost:5173
```

## Step 5: Verify Backend is Running

In a new terminal, test the health endpoint:

```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok","timestamp":"...","environment":"development"}`

## Step 6: Start Frontend (if not already running)

```bash
# From project root
npm run dev
```

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. **PostgreSQL not running?**
   ```bash
   # Check if PostgreSQL is running
   psql -U postgres -c "SELECT version();"
   
   # Or if using Docker
   cd backend
   docker-compose up -d postgres
   ```

2. **Update DATABASE_URL in backend/.env**
   - Format: `postgresql://username:password@host:port/database_name`
   - Example: `postgresql://postgres:postgres@localhost:5432/physician_dashboard_2035`

### Migration Errors

If migrations fail:

```bash
cd backend

# Reset database (WARNING: This deletes all data!)
npm run prisma:migrate reset

# Or create a new migration
npx prisma migrate dev --name add_billing_models
```

### Port Already in Use

If port 3000 is already in use:

```bash
# Find what's using port 3000
lsof -ti:3000

# Kill the process
lsof -ti:3000 | xargs kill

# Or change port in backend/.env
PORT=3001
```

And update frontend `.env`:
```
VITE_API_BASE_URL=http://localhost:3001/api
```

## Quick Test

Once both servers are running:

1. Open browser: http://localhost:5173
2. Try to login
3. Should connect to backend successfully

## Common Issues

| Error | Solution |
|-------|----------|
| "Failed to fetch" | Backend not running - start with `npm run dev` in backend folder |
| "Database connection failed" | Check DATABASE_URL in backend/.env and ensure PostgreSQL is running |
| "CORS error" | Verify CORS_ORIGIN in backend/.env matches frontend URL |
| "Module not found" | Run `npm install` in backend folder |

