# 🌐 Deployment URLs & Endpoints

Quick reference for all URLs after deployment.

---

## 🌍 Production URLs

### Frontend (Vercel)
```
https://your-app.vercel.app
```
- Replace `your-app` with your actual Vercel project name
- Automatically assigned on first deployment
- Can be customized in Vercel dashboard

### Backend (Fly.io)
```
https://physician-dashboard-backend.fly.dev
```
- Based on app name in `backend/fly.toml`
- Can be changed during `flyctl launch`

---

## 🔗 API Endpoints

### Health Check
```bash
GET https://physician-dashboard-backend.fly.dev/health/live
```
**Test**:
```bash
curl https://physician-dashboard-backend.fly.dev/health/live
```
**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-11-08T..."
}
```

### API Base URL
```
https://physician-dashboard-backend.fly.dev/api
```
This is what you set in `VITE_API_BASE_URL` on Vercel.

### API Version 1 Endpoints
```
https://physician-dashboard-backend.fly.dev/api/v1
```

Common endpoints:
- `/api/v1/auth/login` - Login
- `/api/v1/auth/logout` - Logout
- `/api/v1/auth/me` - Get current user
- `/api/v1/patients` - Patient management
- `/api/v1/appointments` - Appointments
- `/api/v1/medications` - Medications
- And more...

### API Documentation (Development)
```
https://physician-dashboard-backend.fly.dev/api-docs
```
Note: Only available in development mode

---

## 📊 Dashboards

### Vercel Dashboard
```
https://vercel.com/dashboard
```
- View deployments
- Check build logs
- Manage environment variables
- View analytics
- Configure domains

### Fly.io Dashboard
```
https://fly.io/dashboard
```
- View app status
- Check metrics
- View logs
- Manage secrets
- Scale resources

### Your Specific App Dashboard
```
https://fly.io/apps/physician-dashboard-backend
```
Direct link to your backend app on Fly.io

---

## 🔒 Database

### PostgreSQL Connection
```
# View connection string
cd backend
flyctl postgres connect -a physician-dashboard-db

# Or check secrets
flyctl secrets list
```

The `DATABASE_URL` is automatically set when you attach the database.

---

## 🌐 Preview Deployments (Vercel)

Vercel creates preview URLs for every branch and PR:

```
https://your-app-git-branch-name-username.vercel.app
```

These preview deployments:
- Are created automatically on git push
- Have separate environment variables
- Can be used for testing
- Share the same backend (or can have separate backend)

---

## 🎯 Environment Variable Configuration

### Frontend (Vercel)
Set in: **Vercel Dashboard → Project → Settings → Environment Variables**

Production:
```
VITE_API_BASE_URL=https://physician-dashboard-backend.fly.dev/api
```

Preview (optional, same as production):
```
VITE_API_BASE_URL=https://physician-dashboard-backend.fly.dev/api
```

### Backend (Fly.io)
Set via: `flyctl secrets set KEY=VALUE`

```bash
flyctl secrets set \
  JWT_SECRET="your-secret" \
  JWT_REFRESH_SECRET="your-refresh-secret" \
  CORS_ORIGIN="https://your-app.vercel.app"
```

For multiple origins (production + previews):
```bash
flyctl secrets set \
  CORS_ORIGIN="https://your-app.vercel.app,https://*.vercel.app"
```

---

## 📋 URL Checklist

After deployment, verify these URLs:

- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Backend health check: `https://physician-dashboard-backend.fly.dev/health/live`
- [ ] API responds: `https://physician-dashboard-backend.fly.dev/api/v1`
- [ ] Login works from frontend
- [ ] No CORS errors in browser console
- [ ] Vercel dashboard shows successful deployment
- [ ] Fly.io dashboard shows app running

---

## 🔍 Testing URLs

### Frontend
```bash
# Open in browser
open https://your-app.vercel.app

# Check if it's live
curl -I https://your-app.vercel.app
```

### Backend
```bash
# Health check
curl https://physician-dashboard-backend.fly.dev/health/live

# API info
curl https://physician-dashboard-backend.fly.dev/api/v1

# Test login (replace with actual credentials)
curl -X POST https://physician-dashboard-backend.fly.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

---

## 🌍 Custom Domains (Optional)

### Vercel
```bash
# Add custom domain
vercel domains add yourdomain.com

# Or via dashboard:
# Vercel Dashboard → Project → Settings → Domains
```

Example: `app.yourdomain.com` → Your Vercel app

### Fly.io
```bash
# Add custom domain
flyctl certs add api.yourdomain.com

# View certificates
flyctl certs list
```

Example: `api.yourdomain.com` → Your Fly.io backend

With custom domains:
- Frontend: `https://app.yourdomain.com`
- Backend: `https://api.yourdomain.com`
- Update `VITE_API_BASE_URL` and `CORS_ORIGIN` accordingly

---

## 📞 Support URLs

### Fly.io
- Community: https://community.fly.io
- Docs: https://fly.io/docs
- Status: https://status.fly.io

### Vercel
- Support: https://vercel.com/support
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions

---

## 📝 Quick Reference

| What | URL |
|------|-----|
| Frontend | `https://your-app.vercel.app` |
| Backend | `https://physician-dashboard-backend.fly.dev` |
| API Base | `https://physician-dashboard-backend.fly.dev/api` |
| Health Check | `https://physician-dashboard-backend.fly.dev/health/live` |
| Vercel Dashboard | `https://vercel.com/dashboard` |
| Fly.io Dashboard | `https://fly.io/dashboard` |

---

## 🎉 After Deployment

1. Save your URLs in a secure location
2. Share frontend URL with your team
3. Keep backend URL confidential (or at least document it securely)
4. Set up monitoring/alerts
5. Configure custom domain (optional)
6. Test all major features

**Your app is live!** 🚀

