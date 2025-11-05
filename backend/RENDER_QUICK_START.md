# Render Deployment - Quick Start

## 🚀 Deploy in 5 Minutes

### Step 1: Sign Up
https://render.com → Sign up with GitHub

### Step 2: Create PostgreSQL
1. **New +** → **PostgreSQL**
2. **Name**: `physician-dashboard-db`
3. **Plan**: Free
4. **Create**
5. **Copy connection string** (Internal Database URL)

### Step 3: Create Web Service
1. **New +** → **Web Service**
2. **Connect GitHub**: Select `lacson1/2035`
3. **Configure**:
   - **Name**: `physician-dashboard-backend`
   - **Root Directory**: `backend`
   - **Runtime**: **Docker**
   - **Plan**: Free (or Starter $7/month for always-on)

4. **Environment Variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=<paste from PostgreSQL>
   PORT=3000
   JWT_SECRET=<generate: openssl rand -base64 32>
   JWT_REFRESH_SECRET=<generate: openssl rand -base64 32>
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

5. **Create Web Service**

### Step 4: Wait & Get URL
- Render builds your Docker image
- Deploys automatically
- Get URL: `https://your-service.onrender.com`

### Step 5: Update Vercel
- Set `VITE_API_BASE_URL` = `https://your-service.onrender.com/api`
- Redeploy frontend

## ✅ Done!

Your backend is live on Render!

## 💰 Cost

- **Free**: $0/month (spins down after 15 min inactivity)
- **Starter**: $7/month (always on)

## ⚠️ Free Tier Note

Free services wake up slowly after inactivity. For production, upgrade to Starter ($7/month).

---

**Quick, easy, and free! Perfect for getting started.** 🎉

