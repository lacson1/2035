# Deploy Backend with Docker

## Docker Deployment Options

Your backend is already containerized with Docker. Here are the best options to deploy it:

## Option 1: Railway (Recommended - Easiest)

Railway supports Docker deployments and is the easiest option:

### Steps:

1. **Go to Railway**: https://railway.app
2. **Create New Project** or use existing
3. **Add Service**: Click "+ New" → "GitHub Repo"
4. **Select Repository**: `lacson1/2035`
5. **Set Root Directory**: `backend`
6. **Railway will automatically:**
   - Detect the Dockerfile
   - Build the Docker image
   - Deploy the container

### Add PostgreSQL Database:

1. Click "+ New" → "Database" → "Add PostgreSQL"
2. Railway auto-creates `DATABASE_URL` environment variable

### Set Environment Variables:

Go to your backend service → **Variables**:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3000
JWT_SECRET=<generate with: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate with: openssl rand -base64 32>
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Get Your Backend URL:

After deployment, Railway gives you a URL like:
`https://your-service.railway.app`

Use this in Vercel: `VITE_API_BASE_URL=https://your-service.railway.app/api`

---

## Option 2: Render.com (Free Tier Available)

Render supports Docker and has a free tier:

### Steps:

1. **Go to Render**: https://render.com
2. **New** → **Web Service**
3. **Connect GitHub** repository: `lacson1/2035`
4. **Settings**:
   - **Name**: `physician-dashboard-backend`
   - **Root Directory**: `backend`
   - **Environment**: Docker
   - **Build Command**: (auto-detected from Dockerfile)
   - **Start Command**: (auto-detected)

### Add PostgreSQL:

1. **New** → **PostgreSQL**
2. Create database
3. Copy connection string

### Set Environment Variables:

```env
NODE_ENV=production
DATABASE_URL=<your-postgres-connection-string>
PORT=3000
JWT_SECRET=<generate>
JWT_REFRESH_SECRET=<generate>
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Get Your Backend URL:

Render gives you: `https://your-service.onrender.com`

---

## Option 3: DigitalOcean App Platform

Supports Docker and has good pricing:

1. **Go to DigitalOcean**: https://cloud.digitalocean.com
2. **Create** → **App Platform**
3. **Connect GitHub** → Select repository
4. **Configure**:
   - **Type**: Web Service
   - **Source Directory**: `backend`
   - **Dockerfile Path**: `backend/Dockerfile`
5. **Add Database**: PostgreSQL
6. **Set Environment Variables**
7. **Deploy**

---

## Option 4: Fly.io (Good for Docker)

Fly.io specializes in Docker deployments:

### Steps:

1. **Install Fly CLI**:
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login**:
```bash
fly auth login
```

3. **Create App**:
```bash
cd backend
fly launch
```

4. **Configure**:
   - Follow prompts
   - Set environment variables
   - Add PostgreSQL database

5. **Deploy**:
```bash
fly deploy
```

---

## Option 5: Google Cloud Run (Pay-per-use)

Good for Docker containers:

1. **Install gcloud CLI**
2. **Build and push image**:
```bash
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT/backend
gcloud run deploy --image gcr.io/YOUR_PROJECT/backend
```

---

## Quick Comparison

| Service | Free Tier | Ease of Use | Best For |
|---------|-----------|-------------|----------|
| **Railway** | ✅ Yes | ⭐⭐⭐⭐⭐ | Easiest, auto-detects Docker |
| **Render** | ✅ Yes | ⭐⭐⭐⭐ | Free tier, good docs |
| **Fly.io** | ✅ Yes | ⭐⭐⭐ | Docker-focused |
| **DigitalOcean** | ❌ No | ⭐⭐⭐⭐ | Production-ready |
| **Cloud Run** | ✅ Yes | ⭐⭐⭐ | Pay-per-use |

---

## Recommended: Railway

Since you already have Railway setup, it's the easiest:

1. **Railway auto-detects Dockerfile**
2. **Automatic deployments** on git push
3. **Easy PostgreSQL** integration
4. **Free tier** available

Just:
1. Set Root Directory to `backend`
2. Add PostgreSQL database
3. Set environment variables
4. Deploy!

---

## After Deployment

1. **Get your backend URL** from your hosting service
2. **Update Vercel** environment variable:
   - `VITE_API_BASE_URL` = `https://your-backend-url.com/api`
3. **Redeploy frontend** on Vercel
4. **Test** the connection

---

**Your Docker setup is ready! Just deploy to Railway, Render, or any Docker-compatible service.**

