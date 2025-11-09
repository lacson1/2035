# 🚀 Quick Deployment Guide - Vercel + Fly.io

## ⚡ Quick Start (5 minutes)

### Step 1: Deploy Backend to Fly.io (2 minutes)

```bash
cd backend

# Login to Fly.io
flyctl auth login

# Generate JWT secrets
export JWT_SECRET=$(openssl rand -base64 32)
export JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Deploy (this will create and deploy the app)
flyctl launch --no-deploy

# Set secrets
flyctl secrets set \
  JWT_SECRET="$JWT_SECRET" \
  JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  CORS_ORIGIN="*"

# Deploy
flyctl deploy

# Verify
flyctl status
curl https://physician-dashboard-backend.fly.dev/health/live
```

**Backend URL**: `https://physician-dashboard-backend.fly.dev`

### Step 2: Deploy Frontend to Vercel (2 minutes)

#### Option A: Via Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - Framework: **Vite**
   - Root Directory: **.**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variable:
   ```
   VITE_API_BASE_URL=https://physician-dashboard-backend.fly.dev/api
   ```
6. Click **"Deploy"**

#### Option B: Via CLI (If you have Vercel CLI)

```bash
# From project root
cd ..

# Login
vercel login

# Deploy
vercel --prod

# Set environment variable
vercel env add VITE_API_BASE_URL production
# Enter: https://physician-dashboard-backend.fly.dev/api
```

### Step 3: Update CORS (1 minute)

After Vercel deployment, you'll get a URL like: `https://your-app.vercel.app`

Update backend CORS:

```bash
cd backend

# Replace with your actual Vercel URL
flyctl secrets set CORS_ORIGIN="https://your-app.vercel.app,https://*.vercel.app"
```

### Step 4: Test 🎉

1. Open your Vercel URL
2. Try logging in
3. Check browser console for errors
4. Check backend logs: `cd backend && flyctl logs`

---

## 📋 Checklist

- [ ] Backend deployed to Fly.io
- [ ] Backend health check works
- [ ] Frontend deployed to Vercel  
- [ ] CORS configured with Vercel URL
- [ ] Environment variables set
- [ ] Can login successfully
- [ ] No console errors

---

## 🔧 Quick Commands

### Backend (Fly.io)
```bash
cd backend
flyctl status              # Check status
flyctl logs                # View logs
flyctl deploy              # Redeploy
flyctl secrets list        # List secrets
```

### Frontend (Vercel)
```bash
vercel --prod              # Deploy
vercel logs                # View logs
vercel env ls              # List env vars
```

---

## 🐛 Quick Troubleshooting

### CORS Errors
```bash
cd backend
flyctl secrets set CORS_ORIGIN="https://your-app.vercel.app"
```

### API Not Found (404)
Check `VITE_API_BASE_URL` in Vercel:
- Should be: `https://physician-dashboard-backend.fly.dev/api`
- Must end with `/api`

### Backend Not Responding
```bash
cd backend
flyctl status              # Check if running
flyctl logs                # Check errors
curl https://physician-dashboard-backend.fly.dev/health/live
```

---

## 📚 Full Documentation

See `VERCEL_FLYIO_DEPLOYMENT.md` for complete details.

---

## 🆘 Need Help?

1. **Fly.io issues**: Check logs with `flyctl logs`
2. **Vercel issues**: Check deployment logs in Vercel dashboard
3. **CORS issues**: Verify CORS_ORIGIN matches your Vercel URL exactly

---

## ✨ URLs After Deployment

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://physician-dashboard-backend.fly.dev`
- **API Docs**: `https://physician-dashboard-backend.fly.dev/api-docs` (dev only)
- **Health Check**: `https://physician-dashboard-backend.fly.dev/health/live`

---

**Ready to deploy!** 🎉

