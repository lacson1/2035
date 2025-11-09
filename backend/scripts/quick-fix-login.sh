#!/bin/bash

# Quick Login Fix Script
# This script helps diagnose and fix login issues

echo "🔍 Login Diagnostic & Fix Tool"
echo "================================"
echo ""

# Check if backend is running
echo "1️⃣ Checking backend status..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is not running"
    echo "   💡 Start it with: cd backend && npm run dev"
    exit 1
fi

echo ""
echo "2️⃣ To check your account, run:"
echo "   cd backend && npx tsx scripts/check-user-account.ts"
echo ""
echo "3️⃣ To reset your password, run:"
echo "   cd backend && npx tsx scripts/reset-user-password.ts"
echo ""
echo "4️⃣ If backend needs restart (to apply case-insensitive fix):"
echo "   - Stop backend (Ctrl+C)"
echo "   - Restart: cd backend && npm run dev"
echo ""

