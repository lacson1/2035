#!/bin/bash
set -e

echo "🐳 Docker Setup Script for Physician Dashboard 2035"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Ask user which setup they want
echo "Choose your setup option:"
echo "1) Full Stack in Docker (PostgreSQL + Redis + Backend)"
echo "2) Only Databases (PostgreSQL + Redis)"
echo ""
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting Full Stack Docker Setup..."
        echo ""
        
        # Check if .env file exists
        if [ ! -f .env ]; then
            echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.docker.example...${NC}"
            if [ -f .env.docker.example ]; then
                cp .env.docker.example .env
                echo -e "${GREEN}✅ Created .env file${NC}"
                echo -e "${YELLOW}⚠️  Please edit .env and set your JWT secrets!${NC}"
                echo ""
                read -p "Press Enter to continue after editing .env, or Ctrl+C to exit..."
            else
                echo -e "${RED}❌ .env.docker.example not found!${NC}"
                exit 1
            fi
        fi
        
        echo ""
        echo "Building and starting all services..."
        docker-compose -f docker-compose.full.yml up --build -d
        
        echo ""
        echo "Waiting for services to be healthy..."
        sleep 10
        
        echo ""
        echo -e "${GREEN}✅ All services started!${NC}"
        echo ""
        echo "Service URLs:"
        echo "  🌐 Backend API:      http://localhost:3000"
        echo "  📚 API Docs:         http://localhost:3000/api-docs"
        echo "  ❤️  Health Check:    http://localhost:3000/health"
        echo "  🗄️  PostgreSQL:      localhost:5433"
        echo "  🔴 Redis:            localhost:6379"
        echo ""
        echo "View logs with:"
        echo "  docker-compose -f docker-compose.full.yml logs -f"
        echo ""
        echo "Stop services with:"
        echo "  docker-compose -f docker-compose.full.yml down"
        ;;
        
    2)
        echo ""
        echo "🗄️  Starting Database Services..."
        echo ""
        
        docker-compose up -d
        
        echo ""
        echo "Waiting for databases to be healthy..."
        sleep 5
        
        echo ""
        echo -e "${GREEN}✅ Database services started!${NC}"
        echo ""
        echo "Database URLs:"
        echo "  🗄️  PostgreSQL:      localhost:5433"
        echo "  🔴 Redis:            localhost:6379"
        echo ""
        echo "To start backend locally:"
        echo "  1. Create .env file with local database URL"
        echo "  2. npm install"
        echo "  3. npm run prisma:generate"
        echo "  4. npm run prisma:migrate"
        echo "  5. npm run prisma:seed"
        echo "  6. npm run dev"
        echo ""
        echo "Stop services with:"
        echo "  docker-compose down"
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice!${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
