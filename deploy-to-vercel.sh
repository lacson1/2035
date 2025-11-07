#!/bin/bash
set -e

echo "🚀 Deploying Physician Dashboard to Vercel"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI is not installed!${NC}"
    echo ""
    echo "Install it with:"
    echo "  npm install -g vercel"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI installed${NC}"
echo ""

# Check if on correct branch
BRANCH=$(git branch --show-current)
echo "Current branch: ${BLUE}${BRANCH}${NC}"
echo ""

# Ask for backend URL
echo -e "${YELLOW}📝 Configuration${NC}"
echo ""
read -p "Enter your backend API URL (or press Enter to skip): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo -e "${YELLOW}⚠️  No backend URL provided. You can set it later in Vercel dashboard.${NC}"
    BACKEND_URL="https://your-backend-url.com/api"
fi

echo ""
echo "Backend API URL: ${BLUE}${BACKEND_URL}${NC}"
echo ""

# Ask for deployment type
echo "Choose deployment type:"
echo "1) Production deployment"
echo "2) Preview deployment"
echo ""
read -p "Enter your choice (1 or 2, default: 2): " DEPLOY_TYPE
DEPLOY_TYPE=${DEPLOY_TYPE:-2}

echo ""

# Build the project first
echo -e "${BLUE}📦 Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Deploy based on choice
if [ "$DEPLOY_TYPE" = "1" ]; then
    echo -e "${BLUE}🚀 Deploying to production...${NC}"
    vercel --prod -e VITE_API_BASE_URL="$BACKEND_URL"
else
    echo -e "${BLUE}🚀 Creating preview deployment...${NC}"
    vercel -e VITE_API_BASE_URL="$BACKEND_URL"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo -e "${GREEN}🎉 Your app is now live on Vercel!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Visit the deployment URL provided above"
    echo "2. Test the application"
    echo "3. Configure custom domain in Vercel dashboard (optional)"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Make sure you're logged in: vercel login"
    echo "2. Check your internet connection"
    echo "3. Verify your project settings in Vercel dashboard"
    echo ""
    exit 1
fi
