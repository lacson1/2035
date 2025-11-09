#!/bin/bash

echo "🔍 DIAGNOSING CONNECTION ISSUE..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Checking if backend is deployed..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if curl -s https://physician-dashboard-backend.fly.dev/health/live > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is responding!${NC}"
    RESPONSE=$(curl -s https://physician-dashboard-backend.fly.dev/health/live)
    echo "Response: $RESPONSE"
else
    echo -e "${RED}❌ Backend is NOT responding${NC}"
    echo ""
    echo "ISSUE: Backend not deployed or not running"
    echo ""
    echo "FIX: Deploy backend first:"
    echo "  cd backend"
    echo "  flyctl auth login"
    echo "  flyctl deploy"
    echo ""
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Checking backend secrets..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd backend
if flyctl secrets list > /dev/null 2>&1; then
    echo -e "${GREEN}Backend secrets:${NC}"
    flyctl secrets list
    echo ""
    echo "Check if these are set:"
    echo "  - JWT_SECRET"
    echo "  - JWT_REFRESH_SECRET"
    echo "  - CORS_ORIGIN"
else
    echo -e "${YELLOW}⚠️  Cannot check secrets (not logged in or app doesn't exist)${NC}"
    echo ""
    echo "Run: flyctl auth login"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: What you need to check manually..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "1. Check Vercel Environment Variable:"
echo "   - Go to: https://vercel.com/dashboard"
echo "   - Select your project"
echo "   - Settings → Environment Variables"
echo "   - Check: VITE_API_BASE_URL = https://physician-dashboard-backend.fly.dev/api"
echo ""
echo "2. Check Browser Console:"
echo "   - Open your Vercel URL"
echo "   - Press F12"
echo "   - Look for errors (red text)"
echo "   - Take a screenshot if needed"
echo ""
echo "3. Check CORS:"
echo "   - If you see 'CORS policy' error in console"
echo "   - Run: flyctl secrets set CORS_ORIGIN=\"https://your-vercel-url.vercel.app\""
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "What's the issue you're seeing?"
echo "  A) Backend is not deployed"
echo "  B) CORS error in browser console"
echo "  C) API calls return 404"
echo "  D) Frontend not deployed to Vercel"
echo "  E) Other error"
echo ""
echo "Tell me which one and I'll help you fix it!"
