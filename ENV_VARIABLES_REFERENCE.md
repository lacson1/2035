# Environment Variables Reference

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Node Environment
# Options: development, production, test
NODE_ENV=development

# Server Configuration
PORT=3000

# Database Configuration
# PostgreSQL connection string
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/physician_dashboard_2035

# Redis Configuration (Optional - app works without Redis)
# Redis connection string for caching
# Leave empty or comment out to disable Redis caching
REDIS_URL=redis://localhost:6379

# JWT Configuration
# IMPORTANT: Generate strong random secrets for production!
# Use: openssl rand -base64 32
JWT_SECRET=change-me-in-production-generate-strong-secret
JWT_REFRESH_SECRET=change-me-in-production-generate-strong-secret

# JWT Token Expiration
# Access token expiration (default: 15 minutes)
JWT_EXPIRES_IN=15m
# Refresh token expiration (default: 7 days)
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
# Frontend URL - allow requests from this origin
# In production, use your actual domain
CORS_ORIGIN=http://localhost:5173

# Rate Limiting Configuration
# Time window in milliseconds (default: 1 minute)
RATE_LIMIT_WINDOW_MS=60000
# Maximum requests per window (default: 100)
RATE_LIMIT_MAX_REQUESTS=100

# Optional: Sentry Configuration (for error tracking)
# SENTRY_DSN=your-sentry-dsn-here

# Optional: Email Configuration (for password reset, notifications)
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your-email@example.com
# SMTP_PASS=your-password
# SMTP_FROM=noreply@hospital2035.com

# Optional: File Storage Configuration
# AWS_S3_BUCKET=your-bucket-name
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
# AWS_REGION=us-east-1
```

### Required Variables
- `DATABASE_URL` - **REQUIRED** - PostgreSQL connection string
- `JWT_SECRET` - **REQUIRED** - Secret for JWT tokens (change in production!)
- `JWT_REFRESH_SECRET` - **REQUIRED** - Secret for refresh tokens (change in production!)

### Optional Variables
- `REDIS_URL` - Redis for caching (app works without it)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (default: development)
- `CORS_ORIGIN` - Frontend URL (default: http://localhost:5173)

---

## Frontend Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# API Base URL
# Backend API endpoint
# Development: http://localhost:3000/api
# Production: https://api.yourdomain.com/api
VITE_API_BASE_URL=http://localhost:3000/api

# Optional: Sentry Configuration (for error tracking)
# Get your DSN from https://sentry.io
# VITE_SENTRY_DSN=your-sentry-dsn-here

# Optional: Feature Flags
# VITE_ENABLE_DEBUG_MODE=false
# VITE_ENABLE_ANALYTICS=false
```

### Required Variables
- `VITE_API_BASE_URL` - **REQUIRED** - Backend API endpoint

### Optional Variables
- `VITE_SENTRY_DSN` - Sentry error tracking (optional)

---

## Production Security Checklist

Before deploying to production:

- [ ] Generate strong JWT secrets using `openssl rand -base64 32`
- [ ] Use strong database passwords
- [ ] Set `NODE_ENV=production`
- [ ] Update `CORS_ORIGIN` to your actual domain
- [ ] Use HTTPS (required for production)
- [ ] Configure proper database connection string
- [ ] Set up Redis for production (recommended)
- [ ] Configure Sentry for error tracking (recommended)
- [ ] Set up email service for password reset (if implemented)
- [ ] Configure file storage (S3, etc.) if using file uploads

---

## Quick Setup

### Backend
```bash
cd backend
cp .env.example .env  # If .env.example exists
# Or create .env manually with variables above
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Frontend
```bash
# In project root
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env
npm install
npm run dev
```

---

**Note**: For security, never commit `.env` files to version control. They should be in `.gitignore`.

