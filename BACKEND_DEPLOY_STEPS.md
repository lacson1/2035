# Step-by-Step: Deploy Backend to Cloud

## 🚀 Quick Deploy Guide

### Option 1: Railway (Easiest - Recommended)

#### Step 1: Go to Railway
1. Open browser → Go to **https://railway.app**
2. Click **"Login"** or **"Start a New Project"**
3. Sign in with **GitHub** (click "Login with GitHub")
4. Authorize Railway to access your repositories

#### Step 2: Create New Project
1. Click **"New Project"** (big button)
2. Select **"Deploy from GitHub repo"**
3. Find your repository: **`lacson1/2035`**
4. Click on it to select
5. Railway will create a new project

#### Step 3: Add PostgreSQL Database
1. In your Railway project, click **"+ New"** (top right)
2. Click **"Database"**
3. Select **"Add PostgreSQL"**
4. Railway automatically:
   - Creates PostgreSQL database
   - Sets up `DATABASE_URL` environment variable
   - Links it to your project
5. **Wait ~1 minute** for database to be ready

#### Step 4: Deploy Backend Service
1. Click **"+ New"** again
2. Select **"GitHub Repo"**
3. Choose repository: **`lacson1/2035`**
4. Railway will start deploying automatically

#### Step 5: Configure Root Directory (CRITICAL!)
1. Click on your **backend service** (the one that just appeared)
2. Click **"Settings"** tab (gear icon)
3. Scroll down to **"Root Directory"**
4. Click **"Change"**
5. Type: `backend`
6. Click **"Save"**

#### Step 6: Add Environment Variables
1. Still in your backend service, click **"Variables"** tab
2. Click **"New Variable"** for each:

   **Variable 1:**
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - Click **"Add"**

   **Variable 2:**
   - **Key**: `DATABASE_URL`
   - **Value**: `${{Postgres.DATABASE_URL}}`
   - ⚠️ **Important**: Type exactly `${{Postgres.DATABASE_URL}}` (Railway auto-fills this)
   - Click **"Add"**

   **Variable 3:**
   - **Key**: `PORT`
   - **Value**: `3000`
   - Click **"Add"**

   **Variable 4:**
   - **Key**: `JWT_SECRET`
   - **Value**: `Tu8cHhAT0ZhsgPcrRhZJh9ZMtnJEi7Ef5oekw/J8qEM=`
   - Click **"Add"**

   **Variable 5:**
   - **Key**: `JWT_REFRESH_SECRET`
   - **Value**: `bY6Su7/R1f4kTdW++A+w4otsoSi94ncL1Q57ty9V6ws=`
   - Click **"Add"**

   **Variable 6 (Optional - add later after Vercel deploy):**
   - **Key**: `CORS_ORIGIN`
   - **Value**: `https://your-project.vercel.app` (replace with your Vercel URL)
   - Click **"Add"**

#### Step 7: Watch Deployment
1. Click **"Deployments"** tab
2. Watch the build logs
3. You'll see:
   - ✅ Building Docker image
   - ✅ Installing dependencies
   - ✅ Running migrations
   - ✅ Starting server
4. **Wait ~3-5 minutes** for deployment to complete

#### Step 8: Get Your Backend URL
1. Once deployment is complete, Railway shows:
   - **"Your service is live"**
   - **URL**: `https://your-service.railway.app`
2. **Copy this URL** - you'll need it for Vercel!

#### Step 9: Test Your Backend
Open a new terminal and test:

```bash
# Health check
curl https://your-service.railway.app/health

# Should return: {"status":"ok"}

# API info
curl https://your-service.railway.app/api/v1

# Should return API information
```

---

### Option 2: Render (Free Tier Available)

#### Step 1: Go to Render
1. Open browser → Go to **https://render.com**
2. Click **"Get Started for Free"**
3. Sign in with **GitHub**
4. Authorize Render

#### Step 2: Create PostgreSQL Database
1. Click **"New +"** (top right)
2. Select **"PostgreSQL"**
3. Fill in:
   - **Name**: `physician-dashboard-db`
   - **Database**: `physician_dashboard_2035`
   - **Region**: Choose closest (e.g., `Oregon (US West)`)
   - **Plan**: Free (or Starter $7/month)
4. Click **"Create Database"**
5. **Wait ~2 minutes** for database to be ready

#### Step 3: Copy Database URL
1. Click on your PostgreSQL service
2. Go to **"Info"** tab
3. Find **"Internal Database URL"**
4. **Copy it** (looks like: `postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/dbname`)
5. ⚠️ **Important**: Use "Internal Database URL", not "External"

#### Step 4: Create Web Service
1. Click **"New +"** again
2. Select **"Web Service"**
3. **Connect Repository**:
   - If not connected, click **"Connect account"**
   - Select **GitHub** → Authorize
   - Find repository: **`lacson1/2035`**
   - Click **"Connect"**

#### Step 5: Configure Service
Fill in the form:

- **Name**: `physician-dashboard-backend`
- **Region**: Same as database
- **Branch**: `cursor/run-application-a271` (or `main`)
- **Root Directory**: `backend` ⚠️ **CRITICAL**
- **Runtime**: Select **"Docker"** from dropdown
- **Plan**: 
  - **Free** - For testing ($0/month, spins down)
  - **Starter** - For production ($7/month, always on)

#### Step 6: Add Environment Variables
Scroll down to **"Environment Variables"** section:

Click **"Add Environment Variable"** for each:

1. **NODE_ENV** = `production`
2. **DATABASE_URL** = `<paste Internal Database URL from Step 3>`
3. **PORT** = `3000`
4. **JWT_SECRET** = `Tu8cHhAT0ZhsgPcrRhZJh9ZMtnJEi7Ef5oekw/J8qEM=`
5. **JWT_REFRESH_SECRET** = `bY6Su7/R1f4kTdW++A+w4otsoSi94ncL1Q57ty9V6ws=`
6. **CORS_ORIGIN** = `https://your-project.vercel.app` (add after Vercel deploy)

#### Step 7: Create and Deploy
1. Scroll down
2. Click **"Create Web Service"**
3. Render starts building automatically
4. **Wait ~5-10 minutes** for deployment

#### Step 8: Watch Build Logs
1. Click on your service
2. Go to **"Logs"** tab
3. Watch for:
   - ✅ Building Docker image
   - ✅ Installing dependencies
   - ✅ Running migrations
   - ✅ Server started

#### Step 9: Get Your Backend URL
1. Once deployment completes, Render shows:
   - **Status**: Live ✅
   - **URL**: `https://your-service.onrender.com`
2. **Copy this URL**

#### Step 10: Test Your Backend
```bash
# Health check
curl https://your-service.onrender.com/health

# API info
curl https://your-service.onrender.com/api/v1
```

---

## 📋 Environment Variables Checklist

Make sure you add ALL of these:

### Required:
- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = (from PostgreSQL)
- [ ] `PORT` = `3000`
- [ ] `JWT_SECRET` = `Tu8cHhAT0ZhsgPcrRhZJh9ZMtnJEi7Ef5oekw/J8qEM=`
- [ ] `JWT_REFRESH_SECRET` = `bY6Su7/R1f4kTdW++A+w4otsoSi94ncL1Q57ty9V6ws=`

### Optional (add after Vercel deploy):
- [ ] `CORS_ORIGIN` = `https://your-project.vercel.app`

---

## ⚠️ Common Mistakes to Avoid

1. **Wrong Root Directory**
   - ❌ Don't leave it empty
   - ✅ Set to: `backend`

2. **Wrong Database URL (Render)**
   - ❌ Don't use External Database URL
   - ✅ Use Internal Database URL

3. **Missing Environment Variables**
   - ❌ Don't forget JWT_SECRET and JWT_REFRESH_SECRET
   - ✅ Add all required variables

4. **Wrong Runtime (Render)**
   - ❌ Don't select "Node"
   - ✅ Select "Docker"

---

## ✅ After Deployment

1. **Copy Backend URL**:
   - Railway: `https://your-service.railway.app`
   - Render: `https://your-service.onrender.com`

2. **Update Vercel**:
   - Go to Vercel Dashboard → Your Project
   - Settings → Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://your-backend-url.com/api`
   - Redeploy frontend

3. **Test Everything**:
   - Visit Vercel URL
   - Try logging in
   - Check browser console for errors

---

## 🆘 Need Help?

### Build Fails?
- Check **Logs** tab in Railway/Render
- Verify **Root Directory** is `backend`
- Ensure `Dockerfile` exists in `backend/` directory

### Database Connection Error?
- Verify `DATABASE_URL` is correct
- Check PostgreSQL service is running
- For Railway: Use `${{Postgres.DATABASE_URL}}`
- For Render: Use Internal Database URL

### Service Won't Start?
- Check all environment variables are set
- Verify JWT secrets are added
- Check logs for specific error messages

---

**Follow these steps and your backend will be live in the cloud! 🚀**

