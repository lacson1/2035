# Migration Setup Guide

## Quick Start

After pulling the latest changes, run these commands to set up the new features:

### 1. Install Dependencies (if needed)

```bash
cd backend
npm install
```

### 2. Run Database Migration

This creates the `audit_logs` table:

```bash
npm run prisma:migrate
```

You'll be prompted to name the migration. Suggested name: `add_audit_logging`

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Start Redis (Optional but Recommended)

Using Docker Compose:
```bash
docker-compose up -d redis
```

Or if using external Redis, ensure `REDIS_URL` is set in `.env`:
```env
REDIS_URL=redis://localhost:6379
```

### 5. Verify Setup

Start the backend:
```bash
npm run dev
```

You should see:
- ✅ Redis connected successfully (if Redis is running)
- 🚀 Server running on http://localhost:3000

### 6. Test Audit Logging

Make a test API call:
```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital2035.com","password":"admin123"}'

# Get patients (requires auth token from above)
curl http://localhost:3000/api/v1/patients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Check audit logs:
```bash
# Using Prisma Studio
npm run prisma:studio

# Or query directly
# Navigate to AuditLog table in Prisma Studio
```

## Verification Checklist

- [ ] Database migration completed successfully
- [ ] Prisma Client generated
- [ ] Redis running (optional)
- [ ] Backend starts without errors
- [ ] Audit logs are created when making API calls
- [ ] Cache is working (check logs for cache hits)

## Troubleshooting

### Migration Fails

If migration fails:
1. Check database connection in `.env`
2. Ensure database is running: `docker-compose ps`
3. Check for existing migrations: `ls prisma/migrations`

### Redis Connection Issues

If you see Redis connection errors:
- Check if Redis is running: `docker ps | grep redis`
- Verify `REDIS_URL` in `.env`
- **Note**: App will continue without Redis (caching disabled)

### Prisma Client Errors

If you see Prisma errors:
```bash
npm run prisma:generate
```

This regenerates the Prisma Client with the new AuditLog model.

## Next Steps

After setup is complete:
1. Review `IMPLEMENTATION_GUIDE.md` for detailed usage
2. Check `IMPROVEMENTS_SUMMARY.md` for feature overview
3. Run tests: `npm test`

