# Starting the Backend Server

## Quick Start

The error `ERR_CONNECTION_REFUSED` means the backend server is not running. Here's how to start it:

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies (if not done)
```bash
npm install
```

### Step 3: Check Environment Variables
Make sure you have a `.env` file in the `backend/` directory with:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/physician_dashboard_2035"
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
CORS_ORIGIN="http://localhost:5173"
PORT=3000
```

### Step 4: Start the Server
```bash
npm run dev
```

You should see:
```
Server running on port 3000
🌱 Database connected
```

### Step 5: Verify Server is Running
Open a new terminal and test:
```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok"}`

## Troubleshooting

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

### Database Connection Error
If you see database errors:
```bash
# Check if PostgreSQL is running
pg_isready

# Verify DATABASE_URL in backend/.env
# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Missing Dependencies
```bash
cd backend
npm install
```

### Prisma Client Not Generated
```bash
cd backend
npm run prisma:generate
```

## Running Both Servers

You need **two terminals** running:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Then open: http://localhost:5173

