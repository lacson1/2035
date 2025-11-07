# Deploy to Vercel - Step by Step Guide

## 🚀 Quick Deploy (3 Minutes)

### Method 1: Using the Deploy Script (Easiest)

```bash
# Make sure you're on the right branch
git checkout claude/analysis-work-011CUtQHFLitF7oDDACVHpKL

# Run the deployment script
./deploy-to-vercel.sh
```

The script will:
1. ✅ Check if Vercel CLI is installed
2. ✅ Build your project
3. ✅ Deploy to Vercel
4. ✅ Provide you with the live URL

### Method 2: Manual CLI Deployment

```bash
# 1. Login to Vercel (opens browser)
vercel login

# 2. Deploy (interactive)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name? physician-dashboard-2035
# - Directory? ./
# - Override settings? No

# 3. For production deployment
vercel --prod
```

### Method 3: Via Vercel Dashboard (No CLI needed)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import `lacson1/2035` repository
5. Select branch: `claude/analysis-work-011CUtQHFLitF7oDDACVHpKL`
6. Configure:
   - Framework: Vite (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`
7. Add Environment Variable:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-backend-url.com/api`
8. Click "Deploy"

---

## 🎯 What Gets Deployed

- ✅ Frontend application (React + Vite)
- ✅ Production build (optimized and minified)
- ✅ Static assets with caching
- ✅ SPA routing configured
- ✅ TypeScript compiled
- ✅ All components and pages

**Note:** Backend is NOT deployed to Vercel. For backend, see [DOCKER_SETUP_GUIDE.md](./DOCKER_SETUP_GUIDE.md) for Railway/Render/Docker deployment.

---

## ⚙️ Environment Variables

After deployment, configure in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://your-backend.com/api` | Backend API endpoint |
| `VITE_SENTRY_DSN` | (optional) | Error tracking DSN |

After adding/changing environment variables, **redeploy** for changes to take effect.

---

## 🔧 Post-Deployment Configuration

### 1. Custom Domain (Optional)

In Vercel Dashboard → Settings → Domains:
- Add your custom domain
- Configure DNS records as shown
- SSL is automatic

### 2. Connect Backend

You have several options for the backend:

**Option A: Deploy Backend to Railway**
```bash
# See Railway deployment guide
cd backend
railway up
```

**Option B: Deploy Backend to Render**
```bash
# See Render deployment guide
cd backend
# Follow Render setup in DOCKER_SETUP_GUIDE.md
```

**Option C: Use Docker Backend**
```bash
# Run locally or on a server
cd backend
docker-compose -f docker-compose.full.yml up -d
```

Then update `VITE_API_BASE_URL` in Vercel with your backend URL.

### 3. Test Deployment

Visit your Vercel URL:
```bash
https://physician-dashboard-2035.vercel.app
```

Test checklist:
- [ ] Page loads correctly
- [ ] Login page appears
- [ ] Dark mode toggle works
- [ ] No console errors
- [ ] Backend connection works (after configuring)

---

## 🐛 Troubleshooting

### Issue: Build Failed

**Check build logs in Vercel dashboard**

Common causes:
- TypeScript errors (should be fixed in this branch ✅)
- Missing dependencies
- Environment variables

**Solution:**
```bash
# Test build locally first
npm run build

# If successful, redeploy
vercel --prod
```

### Issue: Page Shows "Cannot connect to backend"

**This is expected if backend isn't deployed yet!**

**Solution:**
1. Deploy backend (Railway/Render/Docker)
2. Get backend URL
3. Update `VITE_API_BASE_URL` in Vercel
4. Redeploy or wait for automatic redeployment

### Issue: 404 on Page Refresh

**Cause:** SPA routing not configured

**Solution:**
The `vercel.json` should already have this configured:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

If still having issues, check that `vercel.json` is committed.

### Issue: Environment Variables Not Working

**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Make sure variables start with `VITE_` prefix
3. Redeploy after adding variables

---

## 📊 Deployment URLs

After deployment, you'll get:

- **Production URL**: `https://physician-dashboard-2035.vercel.app`
- **Preview URLs**: Unique URL for each commit/branch
- **Custom Domain**: (if configured)

Each git push automatically triggers a new deployment!

---

## 🚀 Automatic Deployments

Vercel automatically deploys:
- ✅ **Production**: Every push to `main` branch
- ✅ **Preview**: Every push to other branches
- ✅ **PR Previews**: Every pull request

To change which branch is production:
1. Vercel Dashboard → Settings → Git
2. Change "Production Branch"

---

## 🔐 Security Considerations

Before going live:

- ✅ Set proper CORS origin in backend
- ✅ Use HTTPS for backend URL
- ✅ Set secure JWT secrets
- ✅ Enable rate limiting
- ✅ Configure Sentry for error tracking
- ✅ Set up monitoring

---

## 💡 Pro Tips

1. **Preview Deployments**: Share preview URLs for testing
2. **Environment-Specific Variables**: Different values for production/preview
3. **Deployment Protection**: Password-protect preview deployments
4. **Analytics**: Enable Vercel Analytics in dashboard
5. **Speed Insights**: Monitor performance metrics

---

## 📝 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Branch: `claude/analysis-work-011CUtQHFLitF7oDDACVHpKL`
- [ ] TypeScript builds successfully ✅
- [ ] Tests passing ✅
- [ ] Vercel CLI installed
- [ ] Logged into Vercel
- [ ] Environment variables configured
- [ ] Backend deployed and accessible
- [ ] Deployment successful
- [ ] Application loads in browser
- [ ] Login functionality works
- [ ] Custom domain configured (optional)

---

## 🎉 Success!

Your application is now live! 🚀

**Share your deployment:**
- Production URL: `https://your-app.vercel.app`
- GitHub Repo: `https://github.com/lacson1/2035`
- Branch: `claude/analysis-work-011CUtQHFLitF7oDDACVHpKL`

---

## Next Steps

1. ✅ Deploy backend to Railway/Render
2. ✅ Update VITE_API_BASE_URL
3. ✅ Test full application
4. ✅ Configure custom domain
5. ✅ Set up monitoring
6. ✅ Enable automatic backups

For backend deployment, see:
- [DOCKER_SETUP_GUIDE.md](./DOCKER_SETUP_GUIDE.md)
- [Backend deployment guides](./backend/)

---

**Happy Deploying! 🎉**
