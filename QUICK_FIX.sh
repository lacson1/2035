#!/bin/bash
# Quick Fix Script for Console Errors
# This script configures your local development environment

set -e  # Exit on error

echo "🔧 Physician Dashboard - Console Errors Fix"
echo "==========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run this script from the project root directory"
    exit 1
fi

echo "📝 Step 1: Creating .env.local file..."
cat > .env.local << 'EOF'
# API Configuration for Local Development
VITE_API_BASE_URL=https://physician-dashboard-backend.fly.dev/api

# Environment
NODE_ENV=development
EOF

if [ -f ".env.local" ]; then
    echo "✅ Created .env.local"
    echo ""
    cat .env.local
    echo ""
else
    echo "❌ Failed to create .env.local"
    exit 1
fi

echo ""
echo "🧪 Step 2: Testing backend connection..."
if command -v curl &> /dev/null; then
    echo "Testing: https://physician-dashboard-backend.fly.dev/health/live"
    if curl -s -f https://physician-dashboard-backend.fly.dev/health/live > /dev/null; then
        echo "✅ Backend is accessible"
    else
        echo "⚠️  Backend might be down or unreachable"
    fi
else
    echo "⚠️  curl not found, skipping backend test"
fi

echo ""
echo "📦 Step 3: Checking if frontend is running..."
if lsof -i :5173 &> /dev/null; then
    echo "⚠️  Frontend is already running on port 5173"
    echo "   You need to restart it to pick up the new configuration:"
    echo ""
    echo "   1. Stop the server (Ctrl+C in the terminal where it's running)"
    echo "   2. Run: npm run dev"
    echo ""
else
    echo "ℹ️  Frontend is not running"
    echo "   To start it with the new configuration:"
    echo ""
    echo "   npm run dev"
    echo ""
fi

echo "✅ Configuration complete!"
echo ""
echo "============================================"
echo "🎯 Next Steps:"
echo "============================================"
echo ""
echo "1. If frontend is running, RESTART it:"
echo "   - Press Ctrl+C to stop"
echo "   - Run: npm run dev"
echo ""
echo "2. Clear browser cache:"
echo "   - Press Ctrl+Shift+R (Windows/Linux)"
echo "   - Press Cmd+Shift+R (Mac)"
echo ""
echo "3. Log in with:"
echo "   Email:    admin@hospital2035.com"
echo "   Password: Admin123!"
echo ""
echo "4. Check DevTools Console (F12)"
echo "   - Should see NO errors except browser extension warnings"
echo "   - Extension warnings are HARMLESS - ignore them"
echo ""
echo "============================================"
echo "📖 For detailed troubleshooting, see:"
echo "   CONSOLE_ERRORS_FIX.md"
echo "============================================"

