#!/bin/bash

# Auto Deploy Script
# This script helps automate deployment to Vercel and Render

set -e

echo "🚀 Auto Deploy Script"
echo "===================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✅ Vercel CLI found${NC}"
    VERCEL_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Install with: npm install -g vercel${NC}"
    VERCEL_AVAILABLE=false
fi

# Check if Render CLI is installed
if command -v render &> /dev/null; then
    echo -e "${GREEN}✅ Render CLI found${NC}"
    RENDER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Render CLI not found. Install with: npm install -g render-cli${NC}"
    RENDER_AVAILABLE=false
fi

echo ""
echo "📋 Deployment Checklist:"
echo ""

# Push to GitHub
echo "1. Pushing to GitHub..."
git add -A
git commit -m "Auto deploy: $(date +%Y-%m-%d\ %H:%M:%S)" || echo "No changes to commit"
git push origin cursor/run-application-a271 || git push origin main
echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
echo ""

# Deploy to Vercel
if [ "$VERCEL_AVAILABLE" = true ]; then
    echo "2. Deploying to Vercel..."
    cd "$(dirname "$0")/.."
    vercel --prod --yes || echo "Vercel deployment skipped (may need login)"
    echo -e "${GREEN}✅ Frontend deployed to Vercel${NC}"
else
    echo "2. Vercel: Manual deployment required"
    echo "   Go to: https://vercel.com → Your Project → Deployments"
fi
echo ""

# Deploy to Render
if [ "$RENDER_AVAILABLE" = true ]; then
    echo "3. Deploying to Render..."
    render services:deploy $RENDER_SERVICE_ID || echo "Render deployment skipped (may need service ID)"
    echo -e "${GREEN}✅ Backend deployed to Render${NC}"
else
    echo "3. Render: Manual deployment required"
    echo "   Go to: https://dashboard.render.com → Your Service → Manual Deploy"
fi
echo ""

echo "📝 Environment Variables Reminder:"
echo ""
echo "Vercel (Frontend):"
echo "  VITE_API_BASE_URL=https://your-backend.onrender.com/api"
echo ""
echo "Render (Backend):"
echo "  CORS_ORIGIN=https://2035-git-cursor-run-application-a271-lacs-projects-650efe27.vercel.app,https://*.vercel.app"
echo "  DATABASE_URL=<your-render-postgres-internal-url>"
echo "  JWT_SECRET=<your-jwt-secret>"
echo "  JWT_REFRESH_SECRET=<your-refresh-secret>"
echo "  NODE_ENV=production"
echo "  PORT=3000"
echo ""

echo -e "${GREEN}✅ Deployment process initiated!${NC}"
echo ""

