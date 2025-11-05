# Start Backend Server

## Option 1: Run with Docker (Recommended)

### Quick Start:
```bash
cd backend
./run-docker.sh
```

### Or manually:
```bash
cd backend
docker-compose -f docker-compose.local.yml up --build
```

This starts:
- PostgreSQL database
- Redis cache
- Backend API on port 3000

---

## Option 2: Run Locally (Traditional)

### Prerequisites:
1. PostgreSQL database running (or use Docker for just the database)
2. Node.js installed
3. Dependencies installed

### Steps:

1. **Start Database (if not using Docker):**
```bash
cd backend
docker-compose up -d postgres redis
```

2. **Install Dependencies:**
```bash
cd backend
npm install
```

3. **Generate Prisma Client:**
```bash
npm run prisma:generate
```

4. **Run Migrations:**
```bash
npm run prisma:migrate
```

5. **Start Backend:**
```bash
npm run dev
```

The server will start on http://localhost:3000

---

## Troubleshooting

### Port 3000 Already in Use

**Option A: Stop the process using port 3000**
```bash
# Find the process
lsof -ti:3000

# Kill it (replace PID with actual process ID)
kill -9 $(lsof -ti:3000)
```

**Option B: Change the backend port**
Edit `backend/.env`:
```env
PORT=3001
```

Then update frontend `VITE_API_BASE_URL` to use port 3001.

**Option C: Use Docker (which manages ports)**
```bash
cd backend
docker-compose -f docker-compose.local.yml up --build
```

### Database Connection Error

Make sure PostgreSQL is running:
```bash
# Check if database container is running
docker ps | grep postgres

# Or start it
cd backend
docker-compose up -d postgres
```

### Prisma Client Not Generated

```bash
cd backend
npm run prisma:generate
```

---

## Quick Check Commands

```bash
# Check if backend is running
curl http://localhost:3000/health

# Check what's on port 3000
lsof -i:3000

# Check database connection
cd backend
npm run prisma:studio
```

