#!/bin/bash

# Render Redeploy Script
# This script helps automate Render deployment

set -e

echo "🚀 Render Redeploy Helper"
echo "=========================="
echo ""

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    echo "⚠️  Render CLI not found"
    echo ""
    echo "To install Render CLI:"
    echo "  npm install -g render-cli"
    echo ""
    echo "Or use Render Dashboard:"
    echo "  1. Go to https://dashboard.render.com"
    echo "  2. Select your backend service"
    echo "  3. Settings → Clear Build Cache"
    echo "  4. Manual Deploy → Deploy latest commit"
    echo ""
    exit 1
fi

echo "✅ Render CLI found"
echo ""

# Check if logged in
if ! render whoami &> /dev/null; then
    echo "⚠️  Not logged in to Render"
    echo ""
    echo "Please login:"
    echo "  render login"
    echo ""
    exit 1
fi

echo "✅ Logged in to Render"
echo ""

# Get service info
echo "📋 Available services:"
render services list

echo ""
echo "To redeploy manually:"
echo "  1. Go to Render Dashboard: https://dashboard.render.com"
echo "  2. Select your backend service"
echo "  3. Click 'Settings' → 'Clear Build Cache'"
echo "  4. Click 'Manual Deploy' → 'Deploy latest commit'"
echo ""
echo "Or use Render CLI:"
echo "  render services:deploy <service-id>"
echo ""

