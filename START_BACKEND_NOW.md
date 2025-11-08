# Start Backend Server - Quick Guide

## ✅ Backend Server Starting

The backend server is now starting in the background. Here's what you need to know:

## 🚀 Quick Start Commands

### Start Backend (if not already running):

```bash
cd backend
npm run dev
```

The server will start on **http://localhost:3000**

### Verify Backend is Running:

```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok"}`

## 📋 Prerequisites Checklist

- ✅ Dependencies installed (`npm install` in backend/)
- ✅ `.env` file exists in `backend/`
- ✅ Port 3000 available
- ✅ Database running (PostgreSQL)

## 🔧 If Backend Won't Start

### 1. Check Port 3000

```bash
# See what's using port 3000
lsof -i:3000

# Kill process if needed
kill -9 $(lsof -ti:3000)
```

### 2. Check Database Connection

Make sure PostgreSQL is running:

```bash
# If using Docker
cd backend
docker-compose up -d postgres

# Check if database is running
docker ps | grep postgres
```

### 3. Install Missing Dependencies

```bash
cd backend
npm install
```

### 4. Generate Prisma Client

```bash
cd backend
npm run prisma:generate
```

### 5. Run Migrations

```bash
cd backend
npm run prisma:migrate
```

## 🐛 Common Errors

### "Cannot find module 'cookie-parser'"
**Fix**: 
```bash
cd backend
npm install
```

### "Port 3000 already in use"
**Fix**:
```bash
kill -9 $(lsof -ti:3000)
# Or change port in backend/.env: PORT=3001
```

### "Database connection error"
**Fix**: Start PostgreSQL:
```bash
cd backend
docker-compose up -d postgres
```

### "Prisma Client not generated"
**Fix**:
```bash
cd backend
npm run prisma:generate
```

## 📍 Access Points

Once backend is running:
- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Info**: http://localhost:3000/api/v1
- **API Docs** (dev only): http://localhost:3000/api-docs

## 🔄 Running Both Servers

You need **two terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Or use the startup script:
```bash
./start.sh
```

## ✅ Success Indicators

When backend starts successfully, you should see:
```
🚀 Server running on http://localhost:3000
📝 Environment: development
🔗 CORS Origin: http://localhost:5173
✅ Sentry initialized for error tracking
```

---

**Last Updated**: December 2024

