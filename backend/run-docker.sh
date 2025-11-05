#!/bin/bash

# Run Backend with Docker Locally
# This script sets up and runs the backend API with PostgreSQL and Redis

set -e

echo "🚀 Starting Backend with Docker..."

# Check if .env.local exists, if not create it
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    echo "JWT_SECRET=$(openssl rand -base64 32)" > .env.local
    echo "JWT_REFRESH_SECRET=$(openssl rand -base64 32)" >> .env.local
    echo "✅ .env.local created with generated secrets"
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Start services
echo "🐳 Starting Docker containers..."
docker-compose -f docker-compose.local.yml up --build

