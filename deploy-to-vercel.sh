#!/bin/bash

# Automated Vercel Deployment Script
# Deploys the frontend to Vercel with proper configuration

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║           🚀 Vercel Deployment Script                        ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="https://physician-dashboard-backend.fly.dev/api"
PROJECT_NAME="physician-dashboard-2035"

echo -e "${BLUE}📋 Pre-deployment Checks${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

echo -e "${GREEN}✅ Vercel CLI installed${NC}"

# Check if logged in
echo -e "${BLUE}🔐 Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo ""
    echo "Please run: vercel login"
    echo "Then run this script again."
    exit 1
fi

VERCEL_USER=$(vercel whoami)
echo -e "${GREEN}✅ Logged in as: ${VERCEL_USER}${NC}"
echo ""

# Check if backend is healthy
echo -e "${BLUE}🏥 Checking backend health...${NC}"
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://physician-dashboard-backend.fly.dev/health)
if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}✅ Backend is healthy (HTTP $HEALTH_CHECK)${NC}"
else
    echo -e "${RED}⚠️  Backend health check returned HTTP $HEALTH_CHECK${NC}"
    echo "Continuing anyway..."
fi
echo ""

# Check if build works
echo -e "${BLUE}🔨 Testing local build...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Please fix build errors before deploying"
    exit 1
fi
echo ""

# Deploy to Vercel
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
echo ""
echo "This will:"
echo "  1. Upload your code to Vercel"
echo "  2. Build the project"
echo "  3. Deploy to a preview URL"
echo ""
echo "For production deployment, run: vercel --prod"
echo ""

# Run Vercel deploy
if vercel --yes; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Set Environment Variables${NC}"
    echo ""
    echo "Run this command to set the backend URL:"
    echo ""
    echo -e "${BLUE}vercel env add VITE_API_BASE_URL${NC}"
    echo ""
    echo "When prompted, enter:"
    echo "  Value: ${BACKEND_URL}"
    echo "  Environments: Production, Preview, Development (select all)"
    echo ""
    echo "Then redeploy with:"
    echo -e "${BLUE}vercel --prod${NC}"
    echo ""
    echo -e "${YELLOW}📝 Don't forget to update backend CORS!${NC}"
    echo "After deployment, add your Vercel URL to backend CORS_ORIGIN"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check the error messages above"
    exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║           ✅ Deployment Process Complete                     ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
