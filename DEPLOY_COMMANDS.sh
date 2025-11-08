#!/bin/bash
# One-command deployment script for both backend and frontend

set -e

echo "🚀 Full Stack Deployment Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo -e "${BLUE}📋 Checking prerequisites...${NC}"
echo ""

# Check flyctl
if ! command_exists flyctl; then
    echo -e "${RED}❌ flyctl not found${NC}"
    echo "Install: brew install flyctl"
    exit 1
fi
echo -e "${GREEN}✅ flyctl installed${NC}"

# Check vercel CLI (optional)
if command_exists vercel; then
    echo -e "${GREEN}✅ vercel CLI installed${NC}"
else
    echo -e "${YELLOW}⚠️  vercel CLI not found (optional)${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Step 1: Deploy Backend to Fly.io${NC}"
echo ""

cd backend

# Check if logged in to Fly.io
if ! flyctl auth whoami &> /dev/null; then
    echo "Logging in to Fly.io..."
    flyctl auth login
fi

# Check if app exists
if flyctl status -a physician-dashboard-backend &> /dev/null 2>&1; then
    echo -e "${BLUE}Deploying backend update...${NC}"
    flyctl deploy
else
    echo -e "${YELLOW}App not found. Please run:${NC}"
    echo "  cd backend"
    echo "  flyctl launch --no-deploy"
    echo "  flyctl secrets set JWT_SECRET=\$(openssl rand -base64 32)"
    echo "  flyctl secrets set JWT_REFRESH_SECRET=\$(openssl rand -base64 32)"
    echo "  flyctl secrets set CORS_ORIGIN=\"*\""
    echo "  flyctl deploy"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Backend deployed!${NC}"
echo -e "URL: ${BLUE}https://physician-dashboard-backend.fly.dev${NC}"
echo ""

# Get backend URL
BACKEND_URL="https://physician-dashboard-backend.fly.dev"

cd ..

echo -e "${BLUE}🎨 Step 2: Deploy Frontend to Vercel${NC}"
echo ""

if command_exists vercel; then
    echo "Deploying to Vercel..."
    
    # Set environment variable
    export VITE_API_URL="$BACKEND_URL"
    
    # Deploy
    vercel --prod
    
    echo ""
    echo -e "${GREEN}✅ Frontend deployed!${NC}"
else
    echo -e "${YELLOW}Deploy frontend manually:${NC}"
    echo "1. Go to https://vercel.com"
    echo "2. Import your Git repository"
    echo "3. Add environment variable:"
    echo "   VITE_API_URL = $BACKEND_URL"
    echo "4. Deploy"
fi

echo ""
echo -e "${BLUE}🔗 Step 3: Update Backend CORS${NC}"
echo ""
echo "After getting your Vercel URL, run:"
echo -e "${YELLOW}cd backend${NC}"
echo -e "${YELLOW}flyctl secrets set CORS_ORIGIN=\"https://your-app.vercel.app\"${NC}"

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Get your Vercel URL"
echo "2. Update backend CORS with your Vercel URL"
echo "3. Test your application"
echo ""
echo "Backend:  $BACKEND_URL"
echo "Frontend: (check Vercel dashboard)"
echo ""

