# 🚀 Quick Start Guide

Get your full-stack application running in minutes!

## Prerequisites

- Node.js 18+ installed
- Docker (optional, for easy database setup)
- PostgreSQL (or use Docker)

## Option 1: Quick Setup with Docker (Recommended)

### 1. Start Database

```bash
cd backend
docker-compose up -d postgres
```

This starts PostgreSQL on port 5432.

### 2. Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and set (or use defaults):
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/physician_dashboard_2035"

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Set Up Frontend

```bash
# In project root (not backend/)
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## Option 2: Manual Database Setup

### 1. Install PostgreSQL

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Linux
sudo apt-get install postgresql-14
sudo systemctl start postgresql
```

### 2. Create Database

```bash
createdb physician_dashboard_2035

# Or using psql
psql -c "CREATE DATABASE physician_dashboard_2035;"
```

### 3. Configure Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/physician_dashboard_2035"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
CORS_ORIGIN="http://localhost:5173"
```

### 4. Initialize Database

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 5. Start Backend

```bash
npm run dev
```

### 6. Configure & Start Frontend

```bash
# In project root
npm install
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env
npm run dev
```

## 🧪 Test the Setup

### 1. Test Backend

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@hospital2035.com","password":"password123"}'
```

### 2. Test Frontend

1. Open `http://localhost:5173`
2. Login with:
   - Email: `sarah.johnson@hospital2035.com`
   - Password: `password123`

## 📋 Default Users

After seeding, these users are available:

- **Admin**
  - Email: `admin@hospital2035.com`
  - Password: `admin123`

- **Physician**
  - Email: `sarah.johnson@hospital2035.com`
  - Password: `password123`

- **Nurse**
  - Email: `patricia.williams@hospital2035.com`
  - Password: `password123`

## 🛠️ Development Workflow

### Running Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Useful Commands

**Backend:**
```bash
# View database in Prisma Studio
npm run prisma:studio

# Reset database (WARNING: deletes all data)
npm run prisma:migrate reset

# Run tests
npm test
```

**Frontend:**
```bash
# Run tests
npm test

# Build for production
npm run build
```

## 🔧 Troubleshooting

### Database Connection Failed
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Check database exists: `psql -l | grep physician_dashboard_2035`

### Port Already in Use
- Change `PORT` in backend `.env`
- Or kill process: `lsof -ti:3000 | xargs kill`

### CORS Errors
- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Default: `http://localhost:5173`

### Prisma Issues
```bash
# Regenerate Prisma Client
npm run prisma:generate

# Reset and re-migrate
npm run prisma:migrate reset
```

## 📚 Next Steps

1. ✅ Backend and frontend are running
2. Follow `INTEGRATION_CHECKLIST.md` to integrate frontend with backend
3. See `FRONTEND_BACKEND_INTEGRATION.md` for detailed integration steps
4. Check `API_ENDPOINTS.md` for API documentation

## 🎉 You're Ready!

Your full-stack application is now running! Start developing and testing features.

---

**Need Help?** Check the documentation files or run the setup verification:
```bash
cd backend
./scripts/check-setup.sh
```

