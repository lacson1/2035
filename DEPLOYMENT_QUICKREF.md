# 🚀 Deployment Quick Reference

Quick commands and URLs for deployment.

## 📦 One-Command Deploy

```bash
./deploy-vercel-flyio.sh
```

Choose option 3 for full deployment.

---

## 🔑 Environment Variables

### Backend (Fly.io)
```bash
# Set all at once
flyctl secrets set \
  JWT_SECRET="$(openssl rand -base64 32)" \
  JWT_REFRESH_SECRET="$(openssl rand -base64 32)" \
  CORS_ORIGIN="https://your-app.vercel.app"
```

### Frontend (Vercel)
```
VITE_API_BASE_URL=https://physician-dashboard-backend.fly.dev/api
```

---

## ⚡ Quick Commands

### Backend (Fly.io)
```bash
cd backend
flyctl deploy                  # Deploy
flyctl status                  # Check status
flyctl logs                    # View logs
flyctl secrets list            # List secrets
flyctl ssh console             # SSH into app
```

### Frontend (Vercel)
```bash
vercel --prod                  # Deploy
vercel logs                    # View logs
vercel env ls                  # List env vars
```

---

## 🔗 Important URLs

### After Deployment
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://physician-dashboard-backend.fly.dev`
- **Health Check**: `https://physician-dashboard-backend.fly.dev/health/live`

### Dashboards
- **Vercel**: https://vercel.com/dashboard
- **Fly.io**: https://fly.io/dashboard

---

## ✅ Quick Test

```bash
# Test backend
curl https://physician-dashboard-backend.fly.dev/health/live

# Should return:
# {"status":"ok","timestamp":"..."}
```

---

## 🐛 Quick Fixes

### CORS Error
```bash
cd backend
flyctl secrets set CORS_ORIGIN="https://your-exact-vercel-url.vercel.app"
```

### API Not Found (404)
Check `VITE_API_BASE_URL` ends with `/api`:
- ✅ `https://physician-dashboard-backend.fly.dev/api`
- ❌ `https://physician-dashboard-backend.fly.dev`

### Backend Not Responding
```bash
cd backend
flyctl status
flyctl logs
flyctl restart
```

---

## 📚 Full Documentation

- **5-min Guide**: `DEPLOY_NOW.md`
- **Full Guide**: `VERCEL_FLYIO_DEPLOYMENT.md`
- **Checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Summary**: `DEPLOYMENT_SUMMARY.md`

---

## 💰 Cost

- **Fly.io**: ~$0-5/month
- **Vercel**: $0/month
- **Total**: ~$0-5/month

---

## 🆘 Help

- Fly.io: https://community.fly.io
- Vercel: https://vercel.com/support

