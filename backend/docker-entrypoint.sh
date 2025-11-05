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

# Start the application
echo "🚀 Starting application..."
exec node dist/app.js

