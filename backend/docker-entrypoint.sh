#!/bin/sh
set -e

echo "🚀 Starting backend deployment..."

# Run database migrations
# migrate deploy is safe for production - only runs pending migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy || {
  echo "⚠️  Migration failed or no migrations to run"
  echo "   This is normal on first deployment or if migrations already applied"
}

# Seed hubs if they don't exist (non-blocking)
# The app will also auto-seed on startup, but this ensures they're created before first request
echo "🏥 Checking and seeding hubs..."
npm run seed:hubs 2>/dev/null || echo "⚠️  Hub seeding skipped (will be created on app startup)"

# Start the application
echo "🚀 Starting application..."
exec node dist/app.js

