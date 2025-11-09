#!/bin/bash

# Vercel + Fly.io Deployment Script
# This script helps deploy the frontend to Vercel and backend to Fly.io

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Vercel + Fly.io Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo -e "${RED}❌ flyctl is not installed${NC}"
    echo "Install with: brew install flyctl"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI is not installed${NC}"
    echo "Install with: npm i -g vercel"
    echo "Or deploy via Vercel Dashboard: https://vercel.com/dashboard"
    VERCEL_CLI=false
else
    VERCEL_CLI=true
fi

echo ""
echo -e "${BLUE}What would you like to deploy?${NC}"
echo "1) Backend only (Fly.io)"
echo "2) Frontend only (Vercel)"
echo "3) Both (Backend first, then Frontend)"
echo "4) Just show deployment status"
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo -e "${BLUE}📦 Deploying Backend to Fly.io...${NC}"
        cd backend
        
        # Check if logged in
        if ! flyctl auth whoami &> /dev/null; then
            echo -e "${YELLOW}Not logged in to Fly.io${NC}"
            flyctl auth login
        fi
        
        # Check if app exists
        if ! flyctl status --app physician-dashboard-backend &> /dev/null; then
            echo -e "${YELLOW}App doesn't exist yet. Creating...${NC}"
            flyctl launch --no-deploy
        fi
        
        # Deploy
        echo -e "${GREEN}Deploying backend...${NC}"
        flyctl deploy
        
        echo ""
        echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
        echo -e "URL: ${BLUE}https://physician-dashboard-backend.fly.dev${NC}"
        echo ""
        echo "Test health endpoint:"
        echo "  curl https://physician-dashboard-backend.fly.dev/health/live"
        ;;
        
    2)
        echo -e "${BLUE}🎨 Deploying Frontend to Vercel...${NC}"
        cd "$(dirname "$0")"
        
        if [ "$VERCEL_CLI" = true ]; then
            # Check if logged in
            if ! vercel whoami &> /dev/null; then
                echo -e "${YELLOW}Not logged in to Vercel${NC}"
                vercel login
            fi
            
            # Deploy
            echo -e "${GREEN}Deploying frontend...${NC}"
            vercel --prod
            
            echo ""
            echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
            echo "Check your Vercel dashboard for the URL"
        else
            echo -e "${YELLOW}Deploy via Vercel Dashboard:${NC}"
            echo "1. Go to https://vercel.com/dashboard"
            echo "2. Click 'Add New Project'"
            echo "3. Import your GitHub repository"
            echo "4. Add environment variable:"
            echo "   VITE_API_BASE_URL=https://physician-dashboard-backend.fly.dev/api"
            echo "5. Click 'Deploy'"
        fi
        ;;
        
    3)
        echo -e "${BLUE}🚀 Deploying Both Backend and Frontend...${NC}"
        
        # Backend first
        echo ""
        echo -e "${BLUE}📦 Step 1: Deploying Backend to Fly.io...${NC}"
        cd backend
        
        if ! flyctl auth whoami &> /dev/null; then
            flyctl auth login
        fi
        
        if ! flyctl status --app physician-dashboard-backend &> /dev/null; then
            echo -e "${YELLOW}App doesn't exist yet. Creating...${NC}"
            flyctl launch --no-deploy
        fi
        
        flyctl deploy
        BACKEND_URL="https://physician-dashboard-backend.fly.dev"
        
        echo ""
        echo -e "${GREEN}✅ Backend deployed: ${BACKEND_URL}${NC}"
        
        # Frontend
        echo ""
        echo -e "${BLUE}🎨 Step 2: Deploying Frontend to Vercel...${NC}"
        cd ..
        
        if [ "$VERCEL_CLI" = true ]; then
            if ! vercel whoami &> /dev/null; then
                vercel login
            fi
            
            echo "Setting environment variable..."
            echo "VITE_API_BASE_URL=${BACKEND_URL}/api" | vercel env add VITE_API_BASE_URL production || true
            
            vercel --prod
            
            echo ""
            echo -e "${GREEN}✅ Both deployed successfully!${NC}"
        else
            echo -e "${YELLOW}Deploy frontend via Vercel Dashboard:${NC}"
            echo "1. Go to https://vercel.com/dashboard"
            echo "2. Add environment variable:"
            echo "   VITE_API_BASE_URL=${BACKEND_URL}/api"
            echo "3. Deploy"
        fi
        
        echo ""
        echo -e "${BLUE}📝 Next Steps:${NC}"
        echo "1. Get your Vercel URL from the dashboard"
        echo "2. Update backend CORS:"
        echo "   cd backend"
        echo "   flyctl secrets set CORS_ORIGIN=\"https://your-app.vercel.app\""
        ;;
        
    4)
        echo -e "${BLUE}📊 Deployment Status${NC}"
        echo ""
        
        echo -e "${BLUE}Backend (Fly.io):${NC}"
        cd backend
        if flyctl auth whoami &> /dev/null; then
            if flyctl status --app physician-dashboard-backend &> /dev/null; then
                flyctl status --app physician-dashboard-backend
                echo ""
                echo "Backend URL: https://physician-dashboard-backend.fly.dev"
                echo "Test: curl https://physician-dashboard-backend.fly.dev/health/live"
            else
                echo -e "${YELLOW}App not deployed yet${NC}"
            fi
        else
            echo -e "${YELLOW}Not logged in to Fly.io${NC}"
        fi
        
        echo ""
        echo -e "${BLUE}Frontend (Vercel):${NC}"
        if [ "$VERCEL_CLI" = true ]; then
            cd ..
            if vercel whoami &> /dev/null; then
                vercel ls
            else
                echo -e "${YELLOW}Not logged in to Vercel${NC}"
            fi
        else
            echo "Check: https://vercel.com/dashboard"
        fi
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Done! 🎉${NC}"
echo ""
echo -e "${BLUE}Quick Links:${NC}"
echo "  Fly.io Dashboard: https://fly.io/dashboard"
echo "  Vercel Dashboard: https://vercel.com/dashboard"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "  Full guide: VERCEL_FLYIO_DEPLOYMENT.md"

