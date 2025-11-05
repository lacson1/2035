# Railway Quick Start

## TL;DR - Deploy in 5 Minutes

### 1. Create Railway Project
- Go to [railway.app](https://railway.app)
- Click "New Project" → "Deploy from GitHub repo"
- Select your repository

### 2. Add PostgreSQL Database
- Click "+ New" → "Database" → "Add PostgreSQL"
- Railway auto-creates `DATABASE_URL` environment variable

### 3. Deploy Backend
- Click "+ New" → "GitHub Repo" → Select your repo
- Set **Root Directory** to `backend`
- Railway will auto-detect Dockerfile

### 4. Set Environment Variables
Go to your service → **Variables** and add:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate with: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate with: openssl rand -base64 32>
PORT=3000
CORS_ORIGIN=https://your-frontend-domain.com
```

### 5. Deploy!
Railway automatically:
- ✅ Builds Docker image
- ✅ Runs database migrations
- ✅ Starts your app

Your API will be available at: `https://your-service.railway.app`

## Generate Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET (run again)
openssl rand -base64 32
```

## Verify Deployment

```bash
# Health check
curl https://your-service.railway.app/health

# API info
curl https://your-service.railway.app/api/v1
```

## Troubleshooting

**Build fails?**
- Check Railway → Deployments → Logs
- Verify Dockerfile is in `backend/` directory

**Database connection error?**
- Verify `DATABASE_URL=${{Postgres.DATABASE_URL}}` is set
- Check PostgreSQL service is running

**Migrations fail?**
- Check logs for specific error
- Ensure `prisma/migrations/` folder is included in build

**Need more help?**
See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed guide.

