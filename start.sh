#!/bin/bash

# Full-Stack Startup Script
# Starts both backend and frontend servers

set -e

echo "🚀 Starting Physician Dashboard 2035..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists for frontend
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Frontend .env not found, creating...${NC}"
    echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env
    echo -e "${GREEN}✅ Created frontend .env${NC}"
fi

# Check if backend .env exists
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}⚠️  Backend .env not found${NC}"
    echo "Please set up backend first:"
    echo "  cd backend && cp .env.example .env"
    echo "  Edit .env and set DATABASE_URL"
    exit 1
fi

# Check if database is running (if using Docker)
if command -v docker &> /dev/null; then
    if docker ps | grep -q physician-dashboard-db; then
        echo -e "${GREEN}✅ Database container is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Database container not running${NC}"
        echo "Starting database..."
        cd backend
        docker-compose up -d postgres
        sleep 2
        cd ..
        echo -e "${GREEN}✅ Database started${NC}"
    fi
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${BLUE}📦 Starting backend server...${NC}"
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo -e "${BLUE}📦 Starting frontend server...${NC}"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ Both servers are starting!${NC}"
echo ""
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Logs:"
echo "  Backend: tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

