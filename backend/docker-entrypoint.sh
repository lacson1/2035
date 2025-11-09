#!/bin/sh
set -e

echo "🚀 Starting Physician Dashboard Backend..."
echo "   Environment: ${NODE_ENV:-production}"
echo "   Port: ${PORT:-3000}"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  echo "   Please set DATABASE_URL environment variable"
  exit 1
fi

echo "✅ Database URL configured"

# Generate Prisma Client (in case it's not available)
echo "📦 Ensuring Prisma Client is generated..."
npx prisma generate || echo "⚠️  Prisma generate failed (may already exist)"

# Run database migrations
# migrate deploy is safe for production - only runs pending migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy || {
  echo "⚠️  Migration failed or no migrations to run"
  echo "   This is normal on first deployment or if migrations already applied"
}

# Optional: Seed database if SEED_DATABASE is true
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed || echo "⚠️  Seeding skipped or failed"
fi

# Start the application
echo "🚀 Starting application server..."
echo "   Listening on port ${PORT:-3000}"
exec node dist/app.js

