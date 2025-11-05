# Fix Vercel 502 BAD_GATEWAY Error

## The Problem

The error `502: BAD_GATEWAY` with `DNS_HOSTNAME_NOT_FOUND` means your frontend is trying to connect to a backend API that doesn't exist or isn't accessible.

## Solution 1: Deploy Backend First (Recommended)

Your backend needs to be deployed and accessible. You have two options:

### Option A: Deploy Backend to Railway

1. **Go to Railway**: https://railway.app
2. **Deploy your backend** (follow Railway deployment guides)
3. **Get your backend URL**: `https://your-service.railway.app`
4. **Set in Vercel**: 
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://your-service.railway.app/api`
   - Redeploy

### Option B: Use Local Backend Temporarily

If your backend is running locally, you can't use it from Vercel (it's not publicly accessible). You need to deploy the backend first.

## Solution 2: Update Environment Variable in Vercel

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Select your project**
3. **Go to**: Settings → Environment Variables
4. **Check current `VITE_API_BASE_URL` value**
5. **Update it** to point to your deployed backend
6. **Redeploy** the project

## Solution 3: Use Mock/Development Mode

If you want to test the frontend without a backend:

1. **Create a fallback**: Update `src/services/api.ts` to handle missing backend gracefully
2. **Or deploy backend first** (recommended)

## Quick Fix Steps

### Step 1: Check Current Environment Variable

In Vercel Dashboard → Your Project → Settings → Environment Variables:
- What is `VITE_API_BASE_URL` currently set to?
- Is it pointing to a valid backend URL?

### Step 2: Deploy Backend

Deploy your backend to Railway or another service:
```bash
# Follow Railway deployment steps
# Or use Docker locally and expose it with ngrok
```

### Step 3: Update Vercel Environment Variable

1. Go to Vercel → Project → Settings → Environment Variables
2. Set `VITE_API_BASE_URL` to your deployed backend URL
3. Format: `https://your-backend-url.com/api`
4. Redeploy

### Step 4: Redeploy Frontend

After updating the environment variable:
- Vercel will auto-redeploy on next push, OR
- Manually trigger redeploy in Vercel Dashboard

## Temporary Workaround: Use ngrok for Local Backend

If you need to test quickly:

```bash
# Install ngrok
brew install ngrok  # or download from ngrok.com

# Start your local backend
cd backend
npm run dev

# In another terminal, expose it
ngrok http 3000

# Use the ngrok URL in Vercel environment variable
# Example: https://abc123.ngrok.io/api
```

**Note**: This is temporary - you should deploy your backend properly.

## Check Your Backend Status

1. **Is backend deployed?**
   - Check Railway/Render/your hosting service
   - Verify backend is running and accessible

2. **Test backend directly:**
```bash
curl https://your-backend-url.com/health
```

3. **Check CORS:**
   - Backend must allow requests from your Vercel domain
   - Update `CORS_ORIGIN` in backend to include your Vercel URL

## Next Steps

1. ✅ Deploy backend to Railway (or another service)
2. ✅ Get backend URL
3. ✅ Set `VITE_API_BASE_URL` in Vercel
4. ✅ Redeploy frontend
5. ✅ Test

---

**The 502 error means the backend isn't accessible. Deploy your backend first, then update the Vercel environment variable.**

