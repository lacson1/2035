#!/bin/bash

# Backend Debugging Script
# This script helps diagnose common backend issues

set -e

echo "🔍 Backend Debugging Tool"
echo "=========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the backend directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo -e "${RED}❌ Error: Must run this script from the backend directory${NC}"
    echo "Usage: cd backend && ./debug-backend.sh"
    exit 1
fi

echo -e "${BLUE}1. Checking Node.js and npm...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}2. Checking dependencies...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules directory exists${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules not found. Run: npm install${NC}"
fi

echo ""
echo -e "${BLUE}3. Checking environment variables...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    # Check required variables
    source .env 2>/dev/null || true
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}❌ DATABASE_URL not set${NC}"
    else
        echo -e "${GREEN}✅ DATABASE_URL is set${NC}"
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        echo -e "${YELLOW}⚠️  JWT_SECRET not set (using default in dev)${NC}"
    else
        echo -e "${GREEN}✅ JWT_SECRET is set${NC}"
    fi
    
    if [ -z "$JWT_REFRESH_SECRET" ]; then
        echo -e "${YELLOW}⚠️  JWT_REFRESH_SECRET not set (using default in dev)${NC}"
    else
        echo -e "${GREEN}✅ JWT_REFRESH_SECRET is set${NC}"
    fi
    
    if [ -z "$CORS_ORIGIN" ]; then
        echo -e "${YELLOW}⚠️  CORS_ORIGIN not set (using default: http://localhost:5173)${NC}"
    else
        echo -e "${GREEN}✅ CORS_ORIGIN is set: $CORS_ORIGIN${NC}"
    fi
    
    PORT=${PORT:-3000}
    echo -e "${GREEN}✅ PORT: $PORT${NC}"
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Create one with: cp .env.example .env (if .env.example exists)"
fi

echo ""
echo -e "${BLUE}4. Checking Prisma setup...${NC}"
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✅ Prisma schema exists${NC}"
else
    echo -e "${RED}❌ Prisma schema not found${NC}"
fi

if [ -d "node_modules/.prisma" ] || [ -d "node_modules/@prisma" ]; then
    echo -e "${GREEN}✅ Prisma Client appears to be generated${NC}"
else
    echo -e "${YELLOW}⚠️  Prisma Client may not be generated. Run: npm run prisma:generate${NC}"
fi

echo ""
echo -e "${BLUE}5. Checking database connection...${NC}"
if [ -n "$DATABASE_URL" ]; then
    # Try to connect to PostgreSQL
    if command -v psql &> /dev/null; then
        if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
            echo -e "${GREEN}✅ Database connection successful${NC}"
        else
            echo -e "${RED}❌ Database connection failed${NC}"
            echo "   Check DATABASE_URL and ensure PostgreSQL is running"
        fi
    else
        echo -e "${YELLOW}⚠️  psql not found, skipping database connection test${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  DATABASE_URL not set, skipping database connection test${NC}"
fi

echo ""
echo -e "${BLUE}6. Checking if backend is running...${NC}"
PORT=${PORT:-3000}
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on port $PORT${NC}"
    
    # Test health endpoint
    echo ""
    echo -e "${BLUE}7. Testing health endpoint...${NC}"
    HEALTH_RESPONSE=$(curl -s http://localhost:$PORT/health 2>&1)
    if echo "$HEALTH_RESPONSE" | grep -q "ok\|status"; then
        echo -e "${GREEN}✅ Health endpoint responding:${NC}"
        echo "$HEALTH_RESPONSE" | head -5
    else
        echo -e "${RED}❌ Health endpoint not responding correctly${NC}"
        echo "Response: $HEALTH_RESPONSE"
    fi
    
    # Test API endpoint
    echo ""
    echo -e "${BLUE}8. Testing API endpoint...${NC}"
    API_RESPONSE=$(curl -s http://localhost:$PORT/api/v1 2>&1)
    if echo "$API_RESPONSE" | grep -q "API\|endpoints"; then
        echo -e "${GREEN}✅ API endpoint responding${NC}"
    else
        echo -e "${YELLOW}⚠️  API endpoint response:${NC}"
        echo "$API_RESPONSE" | head -3
    fi
else
    echo -e "${YELLOW}⚠️  Backend is not running on port $PORT${NC}"
    echo "   Start it with: npm run dev"
fi

echo ""
echo -e "${BLUE}9. Checking TypeScript compilation...${NC}"
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ dist directory exists${NC}"
    if [ -f "dist/app.js" ]; then
        echo -e "${GREEN}✅ Compiled app.js exists${NC}"
    else
        echo -e "${YELLOW}⚠️  app.js not found in dist. Run: npm run build${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  dist directory not found (not built yet)${NC}"
fi

echo ""
echo -e "${BLUE}10. Checking for common issues...${NC}"

# Check for port conflicts
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t | head -1)
    PROCESS=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✅ Port $PORT is in use by: $PROCESS (PID: $PID)${NC}"
fi

# Check Redis (optional)
if [ -n "$REDIS_URL" ]; then
    echo -e "${BLUE}   Checking Redis connection...${NC}"
    if command -v redis-cli &> /dev/null; then
        REDIS_HOST=$(echo $REDIS_URL | sed 's|redis://||' | cut -d: -f1)
        REDIS_PORT=$(echo $REDIS_URL | sed 's|redis://||' | cut -d: -f2 | cut -d/ -f1)
        if redis-cli -h "$REDIS_HOST" -p "${REDIS_PORT:-6379}" ping &> /dev/null; then
            echo -e "${GREEN}   ✅ Redis connection successful${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Redis connection failed (optional)${NC}"
        fi
    fi
fi

echo ""
echo -e "${BLUE}==========================${NC}"
echo -e "${GREEN}Debug check complete!${NC}"
echo ""
echo "Next steps:"
echo "1. If backend is not running: npm run dev"
echo "2. If database issues: npm run prisma:studio"
echo "3. If dependencies missing: npm install"
echo "4. If Prisma not generated: npm run prisma:generate"
echo "5. View logs: Check terminal where backend is running"
echo ""
echo "For more help, see:"
echo "- DEBUG_GUIDE.md"
echo "- START_BACKEND.md"
echo "- SETUP_INSTRUCTIONS.md"

