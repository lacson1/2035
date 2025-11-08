#!/bin/bash
# Quick Fly.io Deployment Script

set -e

echo "🚀 Fly.io Deployment Script for Physician Dashboard Backend"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo -e "${YELLOW}⚠️  flyctl not found. Installing...${NC}"
    echo ""
    echo "Please install flyctl first:"
    echo "  macOS:   brew install flyctl"
    echo "  Linux:   curl -L https://fly.io/install.sh | sh"
    echo "  Windows: iwr https://fly.io/install.ps1 -useb | iex"
    exit 1
fi

echo -e "${GREEN}✅ flyctl found${NC}"
echo ""

# Check if logged in
if ! flyctl auth whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Fly.io${NC}"
    echo ""
    echo "Logging in..."
    flyctl auth login
fi

echo -e "${GREEN}✅ Logged in to Fly.io${NC}"
echo ""

# Check if app exists
APP_NAME="physician-dashboard-backend"
if flyctl status -a "$APP_NAME" &> /dev/null; then
    echo -e "${BLUE}📦 App '$APP_NAME' exists. Deploying update...${NC}"
    echo ""
    flyctl deploy
else
    echo -e "${YELLOW}⚠️  App '$APP_NAME' not found${NC}"
    echo ""
    echo "Creating new app..."
    echo ""
    
    # Launch app (this will prompt for region, org, etc.)
    flyctl launch --no-deploy
    
    echo ""
    echo -e "${GREEN}✅ App created${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo "1. Set up PostgreSQL database:"
    echo "   flyctl postgres create --name physician-dashboard-db --region iad"
    echo ""
    echo "2. Attach database to app:"
    echo "   flyctl postgres attach physician-dashboard-db"
    echo ""
    echo "3. Set required secrets:"
    echo "   flyctl secrets set JWT_SECRET=\$(openssl rand -base64 32)"
    echo "   flyctl secrets set JWT_REFRESH_SECRET=\$(openssl rand -base64 32)"
    echo "   flyctl secrets set CORS_ORIGIN=https://your-frontend-url.vercel.app"
    echo ""
    echo "4. Deploy:"
    echo "   flyctl deploy"
    echo ""
    echo "See FLY_IO_DEPLOYMENT.md for complete instructions."
fi

echo ""
echo -e "${GREEN}✅ Done!${NC}"

