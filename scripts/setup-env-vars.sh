#!/bin/bash

# Setup Environment Variables Script
# Helps set environment variables in Vercel and Render

set -e

echo "🔧 Environment Variables Setup"
echo "=============================="
echo ""

# Get backend URL from user
read -p "Enter your Render backend URL (e.g., https://physician-dashboard-backend-xxxx.onrender.com): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Backend URL is required"
    exit 1
fi

# Remove trailing slash and add /api if not present
BACKEND_URL="${BACKEND_URL%/}"
if [[ ! "$BACKEND_URL" == *"/api" ]]; then
    BACKEND_URL="${BACKEND_URL}/api"
fi

echo ""
echo "📋 Environment Variables to Set:"
echo ""

echo "=== VERCEL (Frontend) ==="
echo "Key: VITE_API_BASE_URL"
echo "Value: $BACKEND_URL"
echo ""
echo "To set:"
echo "1. Go to: https://vercel.com → Your Project → Settings → Environment Variables"
echo "2. Add the variable above"
echo "3. Redeploy"
echo ""

echo "=== RENDER (Backend) ==="
echo "Key: CORS_ORIGIN"
echo "Value: https://2035-git-cursor-run-application-a271-lacs-projects-650efe27.vercel.app,https://*.vercel.app,http://localhost:5173"
echo ""
echo "To set:"
echo "1. Go to: https://dashboard.render.com → Your Backend Service → Environment"
echo "2. Add the variable above"
echo "3. Save (will auto-redeploy)"
echo ""

# Check if Vercel CLI is available
if command -v vercel &> /dev/null; then
    read -p "Set VITE_API_BASE_URL in Vercel now? (y/n): " SET_VERCEL
    if [ "$SET_VERCEL" = "y" ]; then
        echo "Setting Vercel environment variable..."
        vercel env add VITE_API_BASE_URL production <<< "$BACKEND_URL" || echo "⚠️  Vercel CLI setup needed"
    fi
fi

echo ""
echo "✅ Environment variables configuration ready!"
echo ""

