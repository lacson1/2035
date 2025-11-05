#!/bin/bash

# Generate JWT Secrets for Render
# Run this script to generate secrets for your environment variables

echo "🔐 Generating JWT Secrets for Render..."
echo ""
echo "Copy these values into Render Dashboard → Environment Variables:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "JWT_SECRET="
JWT_SECRET=$(openssl rand -base64 32)
echo "$JWT_SECRET"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "JWT_REFRESH_SECRET="
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
echo "$JWT_REFRESH_SECRET"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Secrets generated!"
echo ""
echo "📋 Next steps:"
echo "1. Copy JWT_SECRET value above"
echo "2. Copy JWT_REFRESH_SECRET value above"
echo "3. Go to Render Dashboard → Your Backend Service → Environment"
echo "4. Add these as environment variables"
echo "5. Add DATABASE_URL from your PostgreSQL service"
echo "6. Redeploy"
echo ""

