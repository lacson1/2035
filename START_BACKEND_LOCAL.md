# Start Backend Locally - Quick Guide

## ✅ Backend Started!

The backend is now starting on **http://localhost:3000**

---

## 🚀 Quick Start Options

### Option 1: Using npm (Currently Running ✅)
```bash
cd backend
npm run dev
```
- ✅ Runs on port 3000
- ✅ Hot reload enabled
- ✅ Uses local database (Docker)

### Option 2: Using Docker (Full Stack)
```bash
cd backend
docker-compose -f docker-compose.local.yml up --build
```
- ✅ Runs PostgreSQL + Redis + Backend
- ✅ All in Docker containers
- ✅ Backend on port 3000

---

## 📋 Prerequisites

### For npm run dev:
1. ✅ PostgreSQL running (Docker or local)
2. ✅ Node.js installed
3. ✅ Dependencies installed (`npm install`)

### Start Database Only:
```bash
cd backend
docker-compose up -d postgres redis
```

---

## 🔍 Verify Backend is Running

```bash
# Check health endpoint
curl http://localhost:3000/health

# Check API info
curl http://localhost:3000/api/v1
```

---

## 🐛 Troubleshooting

### Port 3000 Already in Use?
```bash
# Find what's using it
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Database Not Connected?
```bash
# Start database
cd backend
docker-compose up -d postgres

# Check connection
npm run debug:database
```

### Dependencies Not Installed?
```bash
cd backend
npm install
npm run prisma:generate
```

---

## ✅ Next Steps

1. ✅ Backend running on http://localhost:3000
2. ✅ Frontend should connect automatically
3. ✅ Try logging in!

---

## 📝 Environment Variables

Create `backend/.env` if needed:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/physician_dashboard_2035
PORT=3000
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
CORS_ORIGIN=http://localhost:5173
```

