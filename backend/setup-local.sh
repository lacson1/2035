#!/bin/bash
# Local Development Setup Script

set -e

echo "🚀 Setting up local development environment..."
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file already exists"
else
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Backend Environment Variables - Local Development

# Node Environment
NODE_ENV=development

# Server Port
PORT=3000

# Database (PostgreSQL)
# For local development, you can use a local PostgreSQL or Docker
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/physician_dashboard_2035"

# JWT Secrets (change these in production!)
JWT_SECRET="local-dev-secret-change-in-production"
JWT_REFRESH_SECRET="local-dev-refresh-secret-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# CORS Origins (comma-separated)
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"

# Redis (Optional - leave empty if not using)
REDIS_URL=""

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Sentry (Optional - leave empty if not using)
SENTRY_DSN=""

# Log Level (debug, info, warn, error)
LOG_LEVEL="debug"
EOF
    echo "✅ .env file created"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Setting up database..."
echo "⚠️  Make sure PostgreSQL is running!"
echo ""

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL=\"postgresql://" .env; then
    echo "🔧 Generating Prisma Client..."
    npx prisma generate
    
    echo ""
    echo "🔄 Running database migrations..."
    npx prisma migrate dev || {
        echo "⚠️  Migration failed. This is normal if database doesn't exist yet."
        echo ""
        echo "To create the database:"
        echo "  1. Install PostgreSQL: brew install postgresql"
        echo "  2. Start PostgreSQL: brew services start postgresql"
        echo "  3. Create database: createdb physician_dashboard_2035"
        echo "  4. Run migrations: npx prisma migrate dev"
        echo ""
    }
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To verify the server is running:"
echo "  curl http://localhost:3000/health/live"
echo ""

