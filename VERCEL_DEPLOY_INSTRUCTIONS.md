# 🚀 Deploy to Vercel - Instructions

## Current Status
- ✅ Vercel CLI installed
- ✅ Project configured (`vercel.json`)
- ✅ Backend connected (Fly.io)
- ✅ Git repository ready
- ✅ Deployment scripts created

---

## 🎯 Choose Your Deployment Method

### Method 1: Vercel Dashboard (Easiest) ⭐ RECOMMENDED

This is the simplest and most reliable method:

1. **Visit Vercel Dashboard**
   ```
   https://vercel.com/new
   ```

2. **Import Repository**
   - Click "Import Git Repository"
   - Select: `lacson1/2035`
   - Vercel auto-detects Vite configuration

3. **Configure Settings**
   - Framework: Vite ✅ (auto-detected)
   - Root Directory: `./` ✅ (keep as is)
   - Build Command: `npm run build` ✅ (auto-detected)
   - Output Directory: `dist` ✅ (auto-detected)

4. **Add Environment Variable** ⚠️ CRITICAL
   ```
   VITE_API_BASE_URL=https://physician-dashboard-backend.fly.dev/api
   ```
   
   Select: ✅ Production, ✅ Preview, ✅ Development

5. **Click "Deploy"** 🚀

6. **Wait 1-3 minutes** for deployment to complete

---

### Method 2: Vercel CLI (Advanced)

Use this if you prefer command-line deployment:

#### Step 1: Login to Vercel
```bash
vercel login
```

This opens a browser for authentication. Follow the prompts.

#### Step 2: Deploy
```bash
cd /workspace
vercel
```

Or use the automated script:
```bash
./deploy-to-vercel.sh
```

#### Step 3: Add Environment Variable
```bash
vercel env add VITE_API_BASE_URL
```

When prompted:
- **Value**: `https://physician-dashboard-backend.fly.dev/api`
- **Environments**: Production, Preview, Development (select all)

#### Step 4: Deploy to Production
```bash
vercel --prod
```

---

## ⚙️ After Deployment

### 1. Get Your Vercel URL
After deployment, you'll receive a URL like:
```
https://physician-dashboard-2035.vercel.app
```

### 2. Update Backend CORS ⚠️ IMPORTANT

Your Fly.io backend needs to allow requests from Vercel:

```bash
flyctl secrets set CORS_ORIGIN="https://your-vercel-url.vercel.app,http://localhost:5173" -a 2035
```

Replace `your-vercel-url` with your actual Vercel domain.

Or update via Fly.io Dashboard:
1. Go to https://fly.io/dashboard
2. Select your app: `2035`
3. Go to "Secrets"
4. Update `CORS_ORIGIN` to include your Vercel URL

### 3. Test Your Deployment

Visit your Vercel URL and test:
- ✅ App loads correctly
- ✅ Login functionality works
- ✅ API requests reach backend (check DevTools → Network)
- ✅ Data loads from Fly.io backend
- ✅ All features functional

---

## 🐛 Troubleshooting

### Issue: Build Fails
```bash
# Test build locally
npm run build

# If it fails, fix errors and try again
```

### Issue: "Not logged in to Vercel"
```bash
# Login first
vercel login

# Then deploy
vercel
```

### Issue: API Connection Fails
**Possible causes:**
1. Environment variable not set
2. Backend CORS not configured
3. Backend not running

**Solutions:**
```bash
# 1. Verify environment variable
vercel env ls

# 2. Check backend health
curl https://physician-dashboard-backend.fly.dev/health

# 3. Update backend CORS (see section above)
```

### Issue: 404 on Page Refresh
**Solution:** Already handled by `vercel.json` rewrites. If still occurring:
1. Verify `vercel.json` exists in root
2. Redeploy

---

## 📊 Monitoring

### View Deployment Status
```bash
# Via CLI
vercel ls

# Via Dashboard
https://vercel.com/dashboard
```

### View Logs
```bash
vercel logs <deployment-url>
```

### View Build Logs
Go to: Vercel Dashboard → Your Project → Deployments → Select deployment → Logs

---

## 🔄 Automatic Deployments

Once connected, Vercel automatically deploys:
- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployments
- **Pull requests** → Preview deployments

---

## 🌐 Custom Domain (Optional)

After successful deployment:

1. Go to: Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `dashboard.yourdomain.com`)
4. Follow DNS setup instructions
5. Update backend CORS to include custom domain

---

## ✅ Deployment Checklist

Before deploying:
- [x] Code pushed to Git
- [x] Backend operational
- [x] Vercel CLI installed
- [x] Build works locally
- [ ] Logged in to Vercel
- [ ] Deploy via Dashboard or CLI
- [ ] Set environment variable
- [ ] Update backend CORS
- [ ] Test deployment
- [ ] Verify API connectivity

---

## 📝 Quick Command Reference

```bash
# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod

# Add env var
vercel env add VITE_API_BASE_URL

# List deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove <deployment-url>
```

---

## 🎯 Recommended Workflow

**For First-Time Deployment:**
1. Use **Method 1 (Dashboard)** - It's the easiest
2. Set environment variable during setup
3. Deploy and test
4. Update backend CORS
5. Verify everything works

**For Subsequent Deployments:**
- Just push to Git - Vercel auto-deploys! 🎉

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Project Docs**: See `VERCEL_DEPLOYMENT_COMPLETE_GUIDE.md`

---

## 🎉 What Happens After Deployment

1. ✅ Your app is live on Vercel
2. ✅ HTTPS enabled automatically
3. ✅ Global CDN serves your app
4. ✅ Automatic deployments on Git push
5. ✅ Preview URLs for branches/PRs
6. ✅ Analytics available in dashboard
7. ✅ Zero-downtime deployments

---

**Backend:** https://physician-dashboard-backend.fly.dev  
**Status:** Ready to Deploy 🚀  
**Estimated Time:** 3-5 minutes

**Start Here:** https://vercel.com/new (Method 1 - Dashboard)
