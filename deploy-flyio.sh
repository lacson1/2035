#!/bin/bash

# Deploy script for Fly.io - Frontend and Backend
# This script deploys both apps with proper environment configuration

set -e # Exit on any error

echo "🚀 Deploying Physician Dashboard to Fly.io"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl is not installed. Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io. Please login first:"
    echo "   flyctl auth login"
    exit 1
fi

echo -e "${BLUE}Step 1: Deploy Backend${NC}"
echo "=========================================="
cd backend

# Set secrets for backend (if not already set)
echo "Setting backend secrets..."
flyctl secrets set \
  NODE_ENV=production \
  CORS_ORIGIN="https://2035.fly.dev,https://physician-dashboard.fly.dev" \
  --app physician-dashboard-backend \
  || echo "⚠️  Some secrets may already be set"

echo ""
echo "Deploying backend..."
flyctl deploy --config fly.toml --app physician-dashboard-backend

echo -e "${GREEN}✅ Backend deployed successfully${NC}"
echo ""

# Get backend URL
BACKEND_URL=$(flyctl status --app physician-dashboard-backend -j | grep -o '"hostname":"[^"]*"' | cut -d'"' -f4)
if [ -z "$BACKEND_URL" ]; then
    BACKEND_URL="physician-dashboard-backend.fly.dev"
fi
echo "Backend URL: https://$BACKEND_URL"
echo ""

cd ..

echo -e "${BLUE}Step 2: Deploy Frontend${NC}"
echo "=========================================="

# Build frontend with correct API URL
echo "Deploying frontend with API URL: https://$BACKEND_URL/api"
flyctl deploy \
  --config fly.frontend.toml \
  --app physician-dashboard \
  --build-arg VITE_API_BASE_URL="https://$BACKEND_URL/api"

echo -e "${GREEN}✅ Frontend deployed successfully${NC}"
echo ""

# Get frontend URL
FRONTEND_URL=$(flyctl status --app physician-dashboard -j | grep -o '"hostname":"[^"]*"' | cut -d'"' -f4)
if [ -z "$FRONTEND_URL" ]; then
    FRONTEND_URL="physician-dashboard.fly.dev"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Frontend URL: https://$FRONTEND_URL"
echo "Backend URL:  https://$BACKEND_URL"
echo ""
echo "Next steps:"
echo "1. Visit https://$FRONTEND_URL to access the app"
echo "2. Check backend health: curl https://$BACKEND_URL/health"
echo "3. Monitor logs:"
echo "   - Backend:  flyctl logs --app physician-dashboard-backend"
echo "   - Frontend: flyctl logs --app physician-dashboard"
echo ""
echo -e "${YELLOW}Note: If this is your first deployment, make sure you've set the DATABASE_URL secret:${NC}"
echo "   flyctl secrets set DATABASE_URL='your-database-url' --app physician-dashboard-backend"
echo ""

