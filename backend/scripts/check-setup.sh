#!/bin/bash

# Setup Verification Script

echo "🔍 Checking backend setup..."
echo ""

ERRORS=0

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not found"
    ERRORS=$((ERRORS + 1))
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client installed"
else
    echo "⚠️  PostgreSQL client not found (optional if using Docker)"
fi

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    echo "✅ Docker: $DOCKER_VERSION"
else
    echo "⚠️  Docker not found (optional, for easy database setup)"
fi

echo ""

# Check .env file
if [ -f .env ]; then
    echo "✅ .env file exists"
    
    # Check if DATABASE_URL is set
    if grep -q "DATABASE_URL=" .env && ! grep -q "DATABASE_URL=\"\"" .env; then
        echo "✅ DATABASE_URL is configured"
    else
        echo "⚠️  DATABASE_URL not configured in .env"
    fi
    
    # Check if JWT secrets are set
    if grep -q "JWT_SECRET=" .env && ! grep -q "JWT_SECRET=\"change-me" .env; then
        echo "✅ JWT_SECRET is configured"
    else
        echo "⚠️  JWT_SECRET should be changed from default"
    fi
else
    echo "❌ .env file not found"
    ERRORS=$((ERRORS + 1))
fi

# Check node_modules
if [ -d node_modules ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed (run: npm install)"
    ERRORS=$((ERRORS + 1))
fi

# Check Prisma Client
if [ -d node_modules/@prisma/client ]; then
    echo "✅ Prisma Client generated"
else
    echo "⚠️  Prisma Client not generated (run: npm run prisma:generate)"
fi

# Check build
if [ -d dist ]; then
    echo "✅ TypeScript compiled"
else
    echo "⚠️  Not yet built (run: npm run build)"
fi

echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ Setup looks good!"
else
    echo "❌ Found $ERRORS issue(s) that need to be fixed"
    exit 1
fi

