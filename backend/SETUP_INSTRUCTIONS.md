# Backend Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Database

#### Option A: Local PostgreSQL

1. Install PostgreSQL if not already installed
2. Create database:
   ```bash
   createdb physician_dashboard_2035
   ```
3. Update `.env`:
   ```bash
   DATABASE_URL="postgresql://your_username:your_password@localhost:5432/physician_dashboard_2035"
   ```

#### Option B: Docker PostgreSQL

```bash
docker run --name postgres-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=physician_dashboard_2035 \
  -p 5432:5432 \
  -d postgres:14

# Then in .env:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/physician_dashboard_2035"
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - A random secret string (generate with: `openssl rand -base64 32`)
- `JWT_REFRESH_SECRET` - Another random secret string
- `CORS_ORIGIN` - Frontend URL (default: http://localhost:5173)

### 4. Initialize Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database tables
npm run prisma:migrate

# Seed initial data (creates admin user and sample patient)
npm run prisma:seed
```

### 5. Start Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

### 6. Test API

```bash
# Health check
curl http://localhost:3000/health

# Login (from seed data)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@hospital2035.com","password":"password123"}'
```

## User Registration

**No default users are created.** Users must register through the sign-up form on the login page.

To create your first account:
1. Start the frontend: `npm run dev` (from project root)
2. Navigate to the login page
3. Click "Don't have an account? Sign up"
4. Fill in your details and create an account

The **first user** to register will automatically be assigned the `admin` role. All subsequent users will be assigned the `read_only` role by default. Administrators can change user roles through the User Management interface.

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Prisma Client Not Generated
```bash
npm run prisma:generate
```

### Migration Issues
```bash
# Reset database (WARNING: deletes all data)
npm run prisma:migrate reset

# Or manually fix migrations
npm run prisma:migrate dev
```

### Port Already in Use
Change `PORT` in `.env` or kill the process using port 3000

## Next Steps

1. Backend should be running
2. Test endpoints with curl or Postman
3. Follow `FRONTEND_BACKEND_INTEGRATION.md` to connect frontend
4. See `BACKEND_IMPLEMENTATION_STATUS.md` for what's implemented

