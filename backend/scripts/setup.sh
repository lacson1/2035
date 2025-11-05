#!/bin/bash

# Backend Setup Script
# This script helps set up the backend development environment

set -e

echo "🚀 Setting up Physician Dashboard Backend..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env and set your DATABASE_URL and JWT secrets"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run prisma:generate

# Check if database is accessible
echo ""
echo "🔍 Checking database connection..."
if npm run prisma:migrate -- --dry-run > /dev/null 2>&1; then
    echo "✅ Database connection successful"
    
    # Check if migrations need to be run
    if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
        echo "📊 Database migrations exist"
    else
        echo "📊 Running database migrations..."
        npm run prisma:migrate
        echo "✅ Migrations completed"
    fi
    
    # Ask if user wants to seed
    echo ""
    read -p "🌱 Do you want to seed the database? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run prisma:seed
        echo "✅ Database seeded"
    fi
else
    echo "⚠️  Database connection failed"
    echo "   Please ensure PostgreSQL is running and DATABASE_URL is correct in .env"
    echo ""
    echo "   Quick setup with Docker:"
    echo "   docker-compose up -d postgres"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the server:"
echo "  npm run dev"
echo ""

