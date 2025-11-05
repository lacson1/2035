# Deploy Docker Backend - Quick Start

## 🚀 Recommended: Railway (Easiest)

### Step 1: Go to Railway
https://railway.app

### Step 2: Create/Select Project
- Click your project or create new one

### Step 3: Add Backend Service
1. Click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose repository: `lacson1/2035`
4. **IMPORTANT**: Set **Root Directory** to: `backend`
5. Railway will auto-detect Dockerfile

### Step 4: Add PostgreSQL
1. Click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway auto-creates `DATABASE_URL`

### Step 5: Set Environment Variables
Go to backend service → **Variables**:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3000
JWT_SECRET=<run: openssl rand -base64 32>
JWT_REFRESH_SECRET=<run: openssl rand -base64 32>
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Step 6: Deploy
Railway automatically deploys! Watch the build logs.

### Step 7: Get Backend URL
After deployment, Railway gives you a URL:
`https://your-service.railway.app`

### Step 8: Update Vercel
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Set `VITE_API_BASE_URL` = `https://your-service.railway.app/api`
3. Redeploy frontend

---

## ✅ That's It!

Your Docker backend will:
- ✅ Build automatically from Dockerfile
- ✅ Run database migrations on startup
- ✅ Start the Node.js server
- ✅ Be accessible at your Railway URL

---

## 🔍 Verify Deployment

Test your backend:
```bash
curl https://your-service.railway.app/health
curl https://your-service.railway.app/api/v1
```

Both should return JSON responses.

---

**Your Docker setup is production-ready! Just deploy to Railway.**

