# 🚀 START HERE - Deploy to Vercel + Fly.io

## ✨ What's Been Set Up

Your physician dashboard is **ready to deploy** to production!

All configuration files have been created and updated to deploy:
- **Frontend** → Vercel (free)
- **Backend** → Fly.io (~$0-5/month)

---

## 📚 Documentation Overview

| File | Purpose | When to Use |
|------|---------|-------------|
| **DEPLOY_NOW.md** | 5-minute quick start | Start here for fastest deployment |
| **VERCEL_FLYIO_DEPLOYMENT.md** | Complete guide | For detailed instructions & troubleshooting |
| **DEPLOYMENT_CHECKLIST.md** | Step-by-step checklist | To ensure nothing is missed |
| **DEPLOYMENT_SUMMARY.md** | Overview & summary | To understand what's configured |
| **DEPLOYMENT_QUICKREF.md** | Command reference | Quick lookup for commands |
| **DEPLOYMENT_FLOW.md** | Architecture diagrams | To understand how everything connects |

---

## ⚡ Quick Start (Choose One)

### Option 1: Interactive Script (Easiest)
```bash
./deploy-vercel-flyio.sh
```
Select option 3 to deploy both backend and frontend.

### Option 2: Follow Quick Guide
Open `DEPLOY_NOW.md` and follow the 3 steps (takes ~5 minutes).

### Option 3: Manual Step-by-Step
Open `DEPLOYMENT_CHECKLIST.md` and check off each item.

---

## 🎯 Deployment in 3 Steps

### 1️⃣ Deploy Backend (Fly.io)
```bash
cd backend
flyctl auth login
flyctl secrets set JWT_SECRET="$(openssl rand -base64 32)" JWT_REFRESH_SECRET="$(openssl rand -base64 32)"
flyctl launch --no-deploy
flyctl deploy
```

**Result**: Backend live at `https://physician-dashboard-backend.fly.dev`

### 2️⃣ Deploy Frontend (Vercel)
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variable:
   - `VITE_API_BASE_URL` = `https://physician-dashboard-backend.fly.dev/api`
5. Click "Deploy"

**Result**: Frontend live at `https://your-app.vercel.app`

### 3️⃣ Update CORS
```bash
cd backend
flyctl secrets set CORS_ORIGIN="https://your-app.vercel.app"
```

**Result**: Frontend can communicate with backend ✅

---

## ✅ What's Already Configured

### Files Updated
- ✅ `vercel.json` - Points to Fly.io backend
- ✅ `README.md` - Added deployment section
- ✅ `deploy-vercel-flyio.sh` - Interactive deployment script
- ✅ Backend CORS - Supports wildcard domains
- ✅ Backend `fly.toml` - Fly.io configuration
- ✅ Frontend API client - Uses `VITE_API_BASE_URL`

### Environment Variables Needed

**Backend (Fly.io)** - Set via `flyctl secrets set`:
- `JWT_SECRET` (generate: `openssl rand -base64 32`)
- `JWT_REFRESH_SECRET` (generate: `openssl rand -base64 32`)
- `CORS_ORIGIN` (your Vercel URL)
- `DATABASE_URL` (auto-set by Fly.io)

**Frontend (Vercel)** - Set in Vercel Dashboard:
- `VITE_API_BASE_URL` = `https://physician-dashboard-backend.fly.dev/api`

---

## 🔍 Quick Verification

After deployment, verify everything works:

```bash
# 1. Check backend health
curl https://physician-dashboard-backend.fly.dev/health/live
# Should return: {"status":"ok","timestamp":"..."}

# 2. Open frontend in browser
open https://your-app.vercel.app

# 3. Check browser console (F12)
# Should have no errors

# 4. Try logging in
# Should succeed and redirect to dashboard
```

---

## 📋 Prerequisites

Before deploying, make sure you have:

- [ ] Fly.io account (sign up at https://fly.io)
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] GitHub account (repository connected)
- [ ] Fly.io CLI installed (`brew install flyctl`)
- [ ] Code committed and pushed to GitHub

---

## 🐛 Common Issues & Quick Fixes

### Issue: CORS Error
```bash
cd backend
flyctl secrets set CORS_ORIGIN="https://your-exact-vercel-url.vercel.app"
```

### Issue: API Returns 404
Check that `VITE_API_BASE_URL` in Vercel ends with `/api`:
- ✅ Correct: `https://physician-dashboard-backend.fly.dev/api`
- ❌ Wrong: `https://physician-dashboard-backend.fly.dev`

### Issue: Backend Not Responding
```bash
cd backend
flyctl status     # Check if running
flyctl logs       # Check for errors
flyctl restart    # Restart if needed
```

---

## 💰 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Vercel (Frontend) | Hobby | **$0/month** |
| Fly.io (Backend) | Free tier | **$0-5/month** |
| Fly.io (PostgreSQL) | 1GB storage | **~$2/month** |
| **Total** | | **~$0-5/month** |

Both platforms offer free tiers suitable for development and small production apps.

---

## 📞 Getting Help

### Documentation
- Quick questions? → `DEPLOYMENT_QUICKREF.md`
- Detailed help? → `VERCEL_FLYIO_DEPLOYMENT.md`
- Architecture? → `DEPLOYMENT_FLOW.md`

### Support
- **Fly.io**: https://community.fly.io
- **Vercel**: https://vercel.com/support
- **Check logs**: `flyctl logs` (backend) or Vercel Dashboard (frontend)

---

## 🎉 After Deployment

Once deployed, you'll have:
- ✅ Production-ready application
- ✅ HTTPS on both frontend and backend
- ✅ Automatic deployments on git push
- ✅ CDN for fast global access
- ✅ PostgreSQL database
- ✅ Monitoring dashboards

### Your Live URLs:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://physician-dashboard-backend.fly.dev`
- **API Health**: `https://physician-dashboard-backend.fly.dev/health/live`

---

## 🔄 Updating After Deployment

### Update Frontend
```bash
# Option 1: Push to GitHub (auto-deploys)
git add .
git commit -m "Update frontend"
git push

# Option 2: Deploy via CLI
vercel --prod
```

### Update Backend
```bash
cd backend
flyctl deploy
```

---

## 🎯 Next Steps

1. **Deploy Now**: Run `./deploy-vercel-flyio.sh` or follow `DEPLOY_NOW.md`
2. **Test**: Verify everything works using the checklist above
3. **Monitor**: Set up alerts (optional)
4. **Custom Domain**: Add your own domain (optional)
5. **Share**: Give the URL to your team! 🎉

---

## 📊 Deployment Status

Mark your progress:
- [ ] Backend deployed to Fly.io
- [ ] Frontend deployed to Vercel
- [ ] CORS configured
- [ ] Environment variables set
- [ ] Application tested and working
- [ ] Team notified of live URL

---

**Ready to deploy?** 

Choose your path:
- 🚀 **Fastest**: `./deploy-vercel-flyio.sh`
- 📖 **Guided**: Open `DEPLOY_NOW.md`
- ✅ **Detailed**: Follow `DEPLOYMENT_CHECKLIST.md`

**Good luck! You've got this!** 💪

