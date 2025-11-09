#!/bin/bash

# Fly.io Secrets Setup Script
# This script helps you set up required environment variables for Fly.io

set -e

echo "🔐 Fly.io Secrets Configuration"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo -e "${RED}❌ flyctl is not installed${NC}"
    echo ""
    echo "Install flyctl:"
    echo "  curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if user is logged in
if ! flyctl auth whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Fly.io${NC}"
    echo "Please login first: flyctl auth login"
    exit 1
fi

echo -e "${GREEN}✅ Authenticated with Fly.io${NC}"
echo ""

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# App name
APP_NAME=$(grep "^app = " fly.toml 2>/dev/null | cut -d "'" -f 2 || echo "")

if [ -z "$APP_NAME" ]; then
    echo -e "${RED}❌ Could not find app name in fly.toml${NC}"
    echo "Please run this script from the backend directory"
    exit 1
fi

echo -e "${BLUE}App: $APP_NAME${NC}"
echo ""

# Check if app exists
if ! flyctl apps list | grep -q "$APP_NAME"; then
    echo -e "${RED}❌ App '$APP_NAME' does not exist on Fly.io${NC}"
    echo "Create it first with: flyctl launch"
    exit 1
fi

echo "This script will help you set up the following secrets:"
echo "  1. DATABASE_URL (PostgreSQL connection string)"
echo "  2. JWT_SECRET (Access token secret)"
echo "  3. JWT_REFRESH_SECRET (Refresh token secret)"
echo "  4. CORS_ORIGIN (Frontend URL)"
echo "  5. REDIS_URL (Optional: Redis cache)"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled"
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  DATABASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You need a PostgreSQL database URL."
echo ""
echo "Options:"
echo "  A) Create Fly.io Postgres (recommended)"
echo "  B) Use external database (Supabase, Neon, etc.)"
echo "  C) Skip (already set)"
echo ""

read -p "Choice (A/B/C): " -n 1 -r DB_CHOICE
echo
echo

case $DB_CHOICE in
    [Aa])
        echo "Creating Fly.io Postgres cluster..."
        echo ""
        flyctl postgres create || {
            echo -e "${RED}Failed to create Postgres${NC}"
            echo "You can create it manually later with:"
            echo "  flyctl postgres create"
        }
        echo ""
        echo "Attach database to app..."
        flyctl postgres attach --app "$APP_NAME" || echo "Manual attachment may be required"
        ;;
    [Bb])
        echo "Enter your PostgreSQL connection string:"
        echo "Format: postgresql://user:password@host:port/dbname?sslmode=require"
        read -r DB_URL
        if [ -n "$DB_URL" ]; then
            flyctl secrets set DATABASE_URL="$DB_URL"
            echo -e "${GREEN}✅ DATABASE_URL set${NC}"
        fi
        ;;
    *)
        echo "Skipping DATABASE_URL"
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  JWT_SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if flyctl secrets list | grep -q "JWT_SECRET"; then
    echo -e "${GREEN}✅ JWT_SECRET already set${NC}"
    read -p "Regenerate? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        JWT_SECRET=$(generate_secret)
        flyctl secrets set JWT_SECRET="$JWT_SECRET"
        echo -e "${GREEN}✅ JWT_SECRET regenerated${NC}"
    fi
else
    JWT_SECRET=$(generate_secret)
    flyctl secrets set JWT_SECRET="$JWT_SECRET"
    echo -e "${GREEN}✅ JWT_SECRET generated and set${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  JWT_REFRESH_SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if flyctl secrets list | grep -q "JWT_REFRESH_SECRET"; then
    echo -e "${GREEN}✅ JWT_REFRESH_SECRET already set${NC}"
    read -p "Regenerate? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        JWT_REFRESH_SECRET=$(generate_secret)
        flyctl secrets set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
        echo -e "${GREEN}✅ JWT_REFRESH_SECRET regenerated${NC}"
    fi
else
    JWT_REFRESH_SECRET=$(generate_secret)
    flyctl secrets set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
    echo -e "${GREEN}✅ JWT_REFRESH_SECRET generated and set${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  CORS_ORIGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Enter your frontend URL (or press Enter for default):"
echo "Examples:"
echo "  - http://localhost:5173 (local development)"
echo "  - https://your-app.vercel.app (production)"
echo "  - * (allow all - not recommended for production)"
echo ""

read -r CORS_ORIGIN
CORS_ORIGIN=${CORS_ORIGIN:-"http://localhost:5173"}

flyctl secrets set CORS_ORIGIN="$CORS_ORIGIN"
echo -e "${GREEN}✅ CORS_ORIGIN set to: $CORS_ORIGIN${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  REDIS_URL (Optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Redis is used for caching (improves performance 60-85%)."
echo ""

read -p "Set up Redis? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Options:"
    echo "  A) Create Upstash Redis (recommended - free tier available)"
    echo "  B) Enter custom Redis URL"
    echo "  C) Skip"
    echo ""
    
    read -p "Choice (A/B/C): " -n 1 -r REDIS_CHOICE
    echo
    echo
    
    case $REDIS_CHOICE in
        [Aa])
            echo "Create a Redis database at: https://upstash.com"
            echo ""
            read -p "Press Enter when you have the Redis URL..."
            echo ""
            echo "Enter your Upstash Redis URL:"
            read -r REDIS_URL
            if [ -n "$REDIS_URL" ]; then
                flyctl secrets set REDIS_URL="$REDIS_URL"
                echo -e "${GREEN}✅ REDIS_URL set${NC}"
            fi
            ;;
        [Bb])
            echo "Enter your Redis URL:"
            read -r REDIS_URL
            if [ -n "$REDIS_URL" ]; then
                flyctl secrets set REDIS_URL="$REDIS_URL"
                echo -e "${GREEN}✅ REDIS_URL set${NC}"
            fi
            ;;
        *)
            echo "Skipping Redis setup"
            ;;
    esac
else
    echo "Skipping Redis setup"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Secrets Configuration Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "View all secrets:"
echo "  flyctl secrets list"
echo ""
echo "Next steps:"
echo "  1. Deploy your app: ./scripts/deploy-flyio.sh"
echo "  2. Check status: flyctl status"
echo "  3. View logs: flyctl logs"
echo ""
