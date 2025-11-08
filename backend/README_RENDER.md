# Render Deployment Quick Start

## Quick Deploy Checklist

1. ✅ **render.yaml** created - Render will auto-detect this
2. ✅ **app.ts** updated - Now listens on `0.0.0.0` (required for Render)
3. ✅ **.renderignore** created - Excludes unnecessary files

## Environment Variables Needed

Set these in Render Dashboard → Environment:

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=<your-postgres-url>
JWT_SECRET=<32-char-secret>
JWT_REFRESH_SECRET=<32-char-secret>
CORS_ORIGIN=https://your-frontend.vercel.app
```

## Common Issues & Fixes

### Issue: Build fails
**Fix**: Check that `npm run build` completes successfully locally first

### Issue: Service won't start
**Fix**: 
- Ensure `PORT` env var is set (Render sets this automatically)
- Check logs for specific error messages
- Verify `npm start` works locally

### Issue: Database connection fails
**Fix**:
- Verify `DATABASE_URL` is correct
- Ensure database is accessible from Render
- Run migrations: `npx prisma migrate deploy`

### Issue: CORS errors
**Fix**: 
- Set `CORS_ORIGIN` to your Vercel frontend URL
- Restart service after updating env vars

## First Time Setup

1. **Create PostgreSQL Database** on Render
2. **Create Web Service** pointing to `backend/` directory
3. **Set environment variables** (see above)
4. **Deploy** - Render will build and start automatically
5. **Run migrations**: Use Render Shell → `npx prisma migrate deploy`
6. **Seed data** (optional): `npm run seed:hubs`

## Testing Deployment

After deployment, test:
- Health check: `https://your-service.onrender.com/health`
- API endpoint: `https://your-service.onrender.com/api/v1/patients`

## File Uploads

Uploads are stored in `backend/uploads/documents/`. On Render free tier, this is ephemeral storage. For production, consider:
- AWS S3
- Cloudinary
- Vercel Blob Storage

