# ✅ Deployment Checklist - Vercel + Fly.io

Use this checklist to ensure a smooth deployment.

## 📋 Pre-Deployment

- [ ] Have Fly.io account created (https://fly.io)
- [ ] Have Vercel account created (https://vercel.com)
- [ ] Have GitHub repository connected
- [ ] Have Fly.io CLI installed (`brew install flyctl`)
- [ ] Have Vercel CLI installed (optional, `npm i -g vercel`)
- [ ] Code is committed and pushed to GitHub

## 🔧 Backend Deployment (Fly.io)

### Setup
- [ ] Navigate to backend directory: `cd backend`
- [ ] Login to Fly.io: `flyctl auth login`
- [ ] Initialize app: `flyctl launch --no-deploy`
- [ ] Create PostgreSQL database: `flyctl postgres create`
- [ ] Attach database: `flyctl postgres attach physician-dashboard-db`

### Configure Secrets
- [ ] Generate JWT_SECRET: `openssl rand -base64 32`
- [ ] Generate JWT_REFRESH_SECRET: `openssl rand -base64 32`
- [ ] Set JWT secrets:
  ```bash
  flyctl secrets set \
    JWT_SECRET="your-secret" \
    JWT_REFRESH_SECRET="your-refresh-secret"
  ```
- [ ] Set temporary CORS (will update after Vercel):
  ```bash
  flyctl secrets set CORS_ORIGIN="*"
  ```

### Deploy
- [ ] Deploy backend: `flyctl deploy`
- [ ] Check status: `flyctl status`
- [ ] Test health endpoint:
  ```bash
  curl https://physician-dashboard-backend.fly.dev/health/live
  ```
- [ ] View logs: `flyctl logs`
- [ ] Verify backend is running (status should be "green")

### Record Backend URL
- [ ] Backend URL: `https://physician-dashboard-backend.fly.dev`
- [ ] Save this URL for Vercel configuration

## 🎨 Frontend Deployment (Vercel)

### Via Dashboard (Recommended)
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New Project"
- [ ] Import your GitHub repository
- [ ] Configure settings:
  - [ ] Framework Preset: **Vite**
  - [ ] Root Directory: **.**
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
  - [ ] Install Command: `npm install`

### Environment Variables
- [ ] Add environment variable in Vercel:
  - Name: `VITE_API_BASE_URL`
  - Value: `https://physician-dashboard-backend.fly.dev/api`
  - Environment: **Production**

### Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (2-5 minutes)
- [ ] Check deployment logs for errors
- [ ] Note your Vercel URL (e.g., `https://your-app.vercel.app`)

### Record Frontend URL
- [ ] Frontend URL: `https://_____.vercel.app`
- [ ] Save this URL for CORS configuration

## 🔗 Connect Frontend & Backend

### Update Backend CORS
- [ ] Navigate to backend: `cd backend`
- [ ] Update CORS with your Vercel URL:
  ```bash
  flyctl secrets set \
    CORS_ORIGIN="https://your-app.vercel.app,https://*.vercel.app"
  ```
- [ ] Backend will automatically restart

### Verify Connection
- [ ] Open your Vercel URL in browser
- [ ] Open browser console (F12)
- [ ] Check for console errors
- [ ] Try logging in (create test account if needed)
- [ ] Verify API calls succeed (check Network tab)
- [ ] Check backend logs: `flyctl logs`

## ✅ Post-Deployment Verification

### Backend Health
- [ ] Health endpoint responds: `curl https://physician-dashboard-backend.fly.dev/health/live`
- [ ] Returns: `{"status":"ok","timestamp":"..."}`
- [ ] API docs accessible (dev): `https://physician-dashboard-backend.fly.dev/api-docs`
- [ ] No errors in logs: `flyctl logs`

### Frontend Health
- [ ] Frontend loads without errors
- [ ] No console errors in browser
- [ ] Authentication works (login/logout)
- [ ] API calls succeed
- [ ] Environment variables set correctly in Vercel

### Integration
- [ ] No CORS errors in browser console
- [ ] API calls return data (not 404)
- [ ] Login flow works end-to-end
- [ ] User data persists after refresh
- [ ] File uploads work (if applicable)

## 🔒 Security Checklist

- [ ] JWT secrets are strong (32+ characters)
- [ ] CORS is set to specific domain (not "*" in production)
- [ ] Environment variables are set (not using defaults)
- [ ] HTTPS enabled (automatic on both platforms)
- [ ] Database has strong password
- [ ] No secrets in code/git

## 📊 Monitoring Setup

- [ ] Sentry configured for error tracking (optional)
- [ ] Fly.io metrics accessible: `flyctl dashboard`
- [ ] Vercel analytics enabled (optional)
- [ ] Health checks configured
- [ ] Alerts set up (optional)

## 📝 Documentation

- [ ] Document your deployment URLs
- [ ] Save your environment variables securely
- [ ] Update README with live URLs
- [ ] Document any custom configuration

## 🎯 Final Steps

- [ ] Test all major features:
  - [ ] User authentication
  - [ ] Patient management
  - [ ] Appointments
  - [ ] Medical records
  - [ ] File uploads
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Share URL with team
- [ ] Celebrate! 🎉

---

## 📚 Helpful Commands

### Backend (Fly.io)
```bash
flyctl status                 # Check app status
flyctl logs                   # View logs
flyctl secrets list           # List secrets
flyctl deploy                 # Redeploy
flyctl ssh console            # SSH into container
flyctl restart                # Restart app
```

### Frontend (Vercel)
```bash
vercel                        # Deploy
vercel --prod                 # Deploy to production
vercel logs                   # View logs
vercel env ls                 # List environment variables
vercel domains ls             # List domains
```

---

## 🆘 Troubleshooting

If something goes wrong, check:
1. Deployment logs (Vercel dashboard or `vercel logs`)
2. Backend logs (`flyctl logs`)
3. Browser console (F12)
4. Network tab in browser dev tools
5. Environment variables are set correctly

For detailed troubleshooting, see:
- `VERCEL_FLYIO_DEPLOYMENT.md` - Full troubleshooting guide
- `DEPLOY_NOW.md` - Quick fixes

---

## 📞 Support

- **Fly.io**: https://community.fly.io
- **Vercel**: https://vercel.com/support
- **Project Docs**: `VERCEL_FLYIO_DEPLOYMENT.md`

---

**Completed**: ____ / ____ tasks

**Deployment Date**: ____________

**URLs**:
- Frontend: ___________________________
- Backend: ____________________________
