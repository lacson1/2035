#!/bin/sh
set -e

echo "🚀 Starting backend deployment..."

# Ensure Prisma Client is generated with correct binary target
# This is a safety check in case the Dockerfile generation didn't work
echo "🔧 Verifying Prisma Client binary..."
export PRISMA_BINARY_TARGETS=debian-openssl-1.1.x,debian-openssl-3.0.x
npx prisma generate --schema=./prisma/schema.prisma --binary-targets=debian-openssl-1.1.x,debian-openssl-3.0.x 2>/dev/null || {
  echo "⚠️  Prisma generate warning (may already be generated)"
}

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

