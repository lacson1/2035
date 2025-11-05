# Fix Vercel 502 Error - Quick Fix

## The Problem

Your Vercel frontend is trying to connect to `http://localhost:3000/api`, which doesn't work because:
- Localhost is only accessible on your machine
- Vercel needs a publicly accessible backend URL

## Solution: Deploy Backend First

### Step 1: Deploy Backend to Railway

1. Go to https://railway.app
2. Deploy your backend (follow the Railway deployment guides we created)
3. Get your Railway backend URL: `https://your-service.railway.app`

### Step 2: Update Vercel Environment Variable

1. Go to https://vercel.com
2. Select your project
3. Go to: **Settings** → **Environment Variables**
4. Find or add: `VITE_API_BASE_URL`
5. Set value to: `https://your-service.railway.app/api`
   - Replace `your-service.railway.app` with your actual Railway backend URL
6. Make sure it's set for: **Production, Preview, Development**
7. **Save**

### Step 3: Redeploy Frontend

1. In Vercel Dashboard, go to **Deployments**
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

## Quick Alternative: Use ngrok (Temporary)

If you need to test immediately with your local backend:

```bash
# Install ngrok
brew install ngrok

# Start your local backend
cd backend
npm run dev

# In another terminal, expose it
ngrok http 3000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Set in Vercel: VITE_API_BASE_URL = https://abc123.ngrok.io/api
```

**Note**: This is temporary. Deploy your backend properly for production.

## Check Your Current Setup

1. **Is backend deployed to Railway?**
   - Check Railway dashboard
   - Get the backend URL

2. **What's set in Vercel?**
   - Go to Vercel → Project → Settings → Environment Variables
   - Check `VITE_API_BASE_URL` value

3. **Test backend directly:**
```bash
# Replace with your Railway URL
curl https://your-backend.railway.app/health
```

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Get Railway backend URL
3. ✅ Set `VITE_API_BASE_URL` in Vercel to your Railway URL
4. ✅ Redeploy frontend in Vercel
5. ✅ Test the app

---

**The 502 error will be fixed once you deploy your backend and update the Vercel environment variable!**

