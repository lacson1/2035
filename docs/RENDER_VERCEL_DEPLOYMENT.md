# Render + Vercel Deployment Guide

## Overview
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Render

## 🚀 Step 1: Deploy Backend to Render

### Prerequisites
1. Create a Render account: https://render.com
2. Create a PostgreSQL database on Render (or use external provider)
3. Have your GitHub repo ready

### Deployment Steps

#### 1. Create Web Service on Render

1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repository
3. Select the repository
4. Configure:
   - **Name**: `physician-dashboard-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter/Standard for production)

#### 2. Set Environment Variables

In Render dashboard, go to **Environment** tab and add:

```bash
# Required
NODE_ENV=production
PORT=10000
DATABASE_URL=<your-postgres-connection-string>
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-base64-32>

# CORS - Set after Vercel deployment
CORS_ORIGIN=https://your-app.vercel.app

# Optional
REDIS_URL=<your-redis-url-if-using>
SENTRY_DSN=<your-sentry-dsn-if-using>
```

**Generate JWT secrets:**
```bash
openssl rand -base64 32
```

#### 3. Run Database Migrations

After first deployment, run migrations:

**Option A: Via Render Shell**
1. Go to your service → **Shell**
2. Run: `npx prisma migrate deploy`

**Option B: Via Local Machine**
```bash
cd backend
DATABASE_URL=<your-render-db-url> npx prisma migrate deploy
```

#### 4. Seed Initial Data (Optional)

```bash
# Via Render Shell
npm run seed:hubs
```

#### 5. Get Your Backend URL

After deployment, Render will provide a URL like:
```
https://physician-dashboard-backend.onrender.com
```

**Note**: Free tier services spin down after 15 minutes of inactivity. First request may take 30-60 seconds.

---

## 🎨 Step 2: Deploy Frontend to Vercel

### Prerequisites
1. Create a Vercel account: https://vercel.com
2. Install Vercel CLI (optional): `npm i -g vercel`

### Deployment Steps

#### 1. Connect Repository

1. Go to Vercel Dashboard → **Add New Project**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### 2. Set Environment Variables

In Vercel dashboard → **Settings** → **Environment Variables**, add:

```bash
# API Configuration
VITE_API_URL=https://physician-dashboard-backend.onrender.com/api/v1

# Optional - Sentry
VITE_SENTRY_DSN=<your-sentry-dsn>
```

#### 3. Deploy

Click **Deploy** or push to your main branch (auto-deploy enabled).

#### 4. Update Backend CORS

After Vercel deployment, update Render environment variable:
```
CORS_ORIGIN=https://your-app.vercel.app
```

Restart the Render service for changes to take effect.

---

## 🔧 Configuration Files

### Backend (`backend/render.yaml`)
Already created - Render will use this for auto-configuration.

### Frontend (`vercel.json`)
Already configured - Vercel will use this.

---

## ✅ Verification Checklist

### Backend (Render)
- [ ] Service is running (green status)
- [ ] Health check works: `https://your-backend.onrender.com/health`
- [ ] Database migrations completed
- [ ] Environment variables set
- [ ] CORS origin matches Vercel URL

### Frontend (Vercel)
- [ ] Build succeeds
- [ ] Environment variables set
- [ ] API URL points to Render backend
- [ ] App loads without errors

### Integration
- [ ] Frontend can call backend API
- [ ] Authentication works
- [ ] CORS errors resolved
- [ ] File uploads work (if using)

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Build fails
- **Solution**: Check build logs, ensure all dependencies are in `package.json`

**Problem**: Database connection fails
- **Solution**: Verify `DATABASE_URL` is correct, check database is running

**Problem**: Port binding error
- **Solution**: Ensure `PORT` env var is set (Render sets this automatically)

**Problem**: Service spins down
- **Solution**: Free tier limitation. Upgrade to paid plan or use a ping service

### Frontend Issues

**Problem**: API calls fail with CORS error
- **Solution**: Update `CORS_ORIGIN` in Render to match Vercel URL

**Problem**: API calls fail with 404
- **Solution**: Check `VITE_API_URL` includes `/api/v1` path

**Problem**: Build fails
- **Solution**: Check build logs, ensure TypeScript compiles

### Integration Issues

**Problem**: Authentication doesn't work
- **Solution**: 
  1. Check JWT secrets are set in Render
  2. Verify cookies are being sent (check browser dev tools)
  3. Ensure CORS allows credentials

**Problem**: File uploads fail
- **Solution**: 
  1. Check upload directory exists (`backend/uploads/documents/`)
  2. Verify file size limits
  3. Check Render logs for errors

---

## 📝 Environment Variables Reference

### Backend (Render)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | `10000` (Render default) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | 32+ character secret |
| `JWT_REFRESH_SECRET` | Yes | 32+ character secret |
| `CORS_ORIGIN` | Yes | Vercel frontend URL |
| `REDIS_URL` | No | Redis connection string |
| `SENTRY_DSN` | No | Sentry error tracking |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Render backend URL + `/api/v1` |
| `VITE_SENTRY_DSN` | No | Sentry error tracking |

---

## 🔄 Updating After Deployment

### Backend Updates
1. Push changes to GitHub
2. Render auto-deploys (or manually trigger)
3. Check deployment logs

### Frontend Updates
1. Push changes to GitHub
2. Vercel auto-deploys
3. Check deployment logs

### Database Migrations
```bash
# Via Render Shell
cd backend
npx prisma migrate deploy
npx prisma generate
```

---

## 💰 Cost Estimate

### Render (Free Tier)
- **Web Service**: Free (with limitations)
- **PostgreSQL**: Free (90 days) or $7/month
- **Limitations**: 
  - Services spin down after 15 min inactivity
  - 750 hours/month compute time

### Vercel (Free Tier)
- **Frontend**: Free
- **Bandwidth**: 100GB/month
- **Builds**: Unlimited

**Total**: $0/month (free tier) or ~$7/month (with persistent database)

---

## 🚀 Production Recommendations

1. **Upgrade Render Plan**: Use Starter ($7/month) for always-on service
2. **Database**: Use Render PostgreSQL or external provider (Supabase, Neon)
3. **File Storage**: Consider S3 or Cloudinary for uploads
4. **Monitoring**: Set up Sentry for error tracking
5. **CDN**: Vercel provides CDN automatically
6. **SSL**: Both Render and Vercel provide SSL automatically

---

## 📚 Additional Resources

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

## 🆘 Need Help?

1. Check deployment logs in Render/Vercel dashboards
2. Review error messages in browser console
3. Check backend logs: Render → Logs tab
4. Verify environment variables are set correctly

