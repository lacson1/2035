# Deploy to Railway - Step by Step

## 🚀 Quick Deployment Steps

### Step 1: Configure Railway Service Root Directory

**CRITICAL**: Railway must build from the `backend` directory!

1. Go to your Railway project: https://railway.app
2. Click on your **backend service** (the one showing "Failed")
3. Click **Settings** (gear icon)
4. Scroll to **Root Directory**
5. Set it to: `backend`
6. Click **Save**

### Step 2: Add PostgreSQL Database (if not already added)

1. In Railway project, click **+ New**
2. Select **Database** → **Add PostgreSQL**
3. Railway auto-creates `DATABASE_URL` environment variable

### Step 3: Set Environment Variables

Go to your backend service → **Variables** tab and add:

#### Required Variables:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3000
JWT_SECRET=<generate-secret-below>
JWT_REFRESH_SECRET=<generate-secret-below>
```

#### Generate Secrets:

Run these commands in your terminal:

```bash
openssl rand -base64 32
# Copy the output as JWT_SECRET

openssl rand -base64 32  
# Copy the output as JWT_REFRESH_SECRET
```

#### Optional Variables:

```env
CORS_ORIGIN=https://your-frontend-domain.com
REDIS_URL=${{Redis.REDIS_URL}}  # If using Railway Redis
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger auto-deploy

### Step 5: Verify Deployment

Watch the build logs. You should see:

✅ **Build Stage:**
- Building from `backend/` directory
- Installing backend dependencies
- Generating Prisma Client
- Building TypeScript

✅ **Deploy Stage:**
- Running database migrations
- Starting application

✅ **Success:**
- Server running on port 3000
- Health check passing

### Step 6: Test Your API

Once deployed, Railway will give you a URL like: `https://your-service.railway.app`

Test it:

```bash
# Health check
curl https://your-service.railway.app/health

# API info
curl https://your-service.railway.app/api/v1
```

## 📋 Deployment Checklist

Before deploying:
- [ ] Root Directory set to `backend` in Railway settings
- [ ] PostgreSQL database added to project
- [ ] `DATABASE_URL` environment variable set (use `${{Postgres.DATABASE_URL}}`)
- [ ] `JWT_SECRET` generated and set (use `openssl rand -base64 32`)
- [ ] `JWT_REFRESH_SECRET` generated and set
- [ ] `NODE_ENV=production` set
- [ ] `PORT=3000` set
- [ ] `CORS_ORIGIN` set to your frontend URL (if applicable)

After deploying:
- [ ] Build completes successfully
- [ ] Migrations run without errors
- [ ] Health endpoint responds: `/health`
- [ ] API endpoint responds: `/api/v1`

## 🔧 Troubleshooting

### Build Fails with "Missing Sentry packages"
**Fix:** Ensure Root Directory is set to `backend` (not root)

### Database Connection Error
**Fix:** Verify `DATABASE_URL=${{Postgres.DATABASE_URL}}` is set correctly

### Migrations Fail
**Fix:** Check build logs for specific error. Ensure Prisma migrations folder is included.

### Service Won't Start
**Fix:** Check deploy logs. Verify all required environment variables are set.

## 🎯 Next Steps After Deployment

1. ✅ Backend deployed successfully
2. Update frontend `VITE_API_BASE_URL` to Railway backend URL
3. Deploy frontend (separate service or static hosting)
4. Test end-to-end functionality
5. Set up monitoring and alerts

## 📚 More Help

- Detailed guide: `RAILWAY_DEPLOYMENT.md`
- Quick reference: `RAILWAY_QUICKSTART.md`
- Fix common issues: `RAILWAY_FIX.md`

