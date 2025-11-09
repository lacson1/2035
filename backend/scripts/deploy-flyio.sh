#!/bin/bash

# Fly.io Deployment Script for Physician Dashboard Backend
# This script automates the deployment process

set -e

echo "🚀 Deploying Backend to Fly.io..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo -e "${RED}❌ flyctl is not installed${NC}"
    echo ""
    echo "Install flyctl:"
    echo "  curl -L https://fly.io/install.sh | sh"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ flyctl is installed${NC}"

# Check if user is logged in
if ! flyctl auth whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Fly.io${NC}"
    echo ""
    echo "Logging in..."
    flyctl auth login
fi

echo -e "${GREEN}✅ Authenticated with Fly.io${NC}"
echo ""

# Check if app exists
APP_NAME=$(grep "^app = " fly.toml | cut -d "'" -f 2)

if flyctl apps list | grep -q "$APP_NAME"; then
    echo -e "${BLUE}📦 App '$APP_NAME' exists${NC}"
    ACTION="update"
else
    echo -e "${YELLOW}📦 App '$APP_NAME' does not exist${NC}"
    ACTION="create"
fi

echo ""

# Create or update app
if [ "$ACTION" = "create" ]; then
    echo -e "${BLUE}🆕 Creating new Fly.io app...${NC}"
    echo ""
    
    # Ask for confirmation
    read -p "Create new app '$APP_NAME'? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 1
    fi
    
    # Launch app
    flyctl launch --copy-config --yes
    
    echo ""
    echo -e "${GREEN}✅ App created successfully${NC}"
else
    echo -e "${BLUE}♻️  Updating existing app...${NC}"
fi

echo ""
echo -e "${BLUE}📝 Checking environment variables...${NC}"

# Check critical environment variables
REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "JWT_REFRESH_SECRET")
MISSING_VARS=()

for VAR in "${REQUIRED_VARS[@]}"; do
    if ! flyctl secrets list | grep -q "$VAR"; then
        MISSING_VARS+=("$VAR")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing required environment variables:${NC}"
    for VAR in "${MISSING_VARS[@]}"; do
        echo "   - $VAR"
    done
    echo ""
    echo "Set secrets using:"
    echo "  flyctl secrets set KEY=VALUE"
    echo ""
    read -p "Continue deployment anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 1
    fi
else
    echo -e "${GREEN}✅ All required secrets are set${NC}"
fi

echo ""
echo -e "${BLUE}🚢 Deploying application...${NC}"
echo ""

# Deploy
flyctl deploy --ha=false

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""

# Get app info
APP_URL="https://${APP_NAME}.fly.dev"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Backend Deployed Successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "App Name:     $APP_NAME"
echo "URL:          $APP_URL"
echo "Health Check: $APP_URL/health"
echo "API Base:     $APP_URL/api/v1"
echo ""
echo "Test health endpoint:"
echo "  curl $APP_URL/health"
echo ""
echo "View logs:"
echo "  flyctl logs"
echo ""
echo "View app status:"
echo "  flyctl status"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
