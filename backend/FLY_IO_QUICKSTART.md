# 🚀 Fly.io Quick Start - 5 Minutes

Get your backend running on Fly.io in 5 minutes!

---

## ⚡ Prerequisites (2 minutes)

```bash
# 1. Install Fly.io CLI
curl -L https://fly.io/install.sh | sh

# 2. Login
flyctl auth login

# 3. Navigate to backend
cd backend
```

---

## 🎯 Deploy (3 minutes)

### Automated Deployment

```bash
# Run the deployment script
./scripts/deploy-flyio.sh
```

That's it! 🎉

---

## 🔐 Set Up Secrets (If First Time)

If you see warnings about missing secrets:

```bash
# Run the secrets setup script
./scripts/setup-flyio-secrets.sh
```

Follow the prompts to configure:
1. Database URL
2. JWT secrets
3. CORS origin
4. Redis (optional)

---

## ✅ Verify Deployment

```bash
# Check status
flyctl status

# View logs
flyctl logs

# Test health endpoint
curl https://your-app-name.fly.dev/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T10:00:00.000Z",
  "environment": "production"
}
```

---

## 🌐 Update Frontend

In your frontend `.env` file:

```bash
VITE_API_BASE_URL=https://your-app-name.fly.dev/api
```

Restart your frontend:
```bash
npm run dev
```

---

## 📝 Manual Deployment (Alternative)

If you prefer manual steps:

```bash
# 1. Create app
flyctl launch --copy-config --yes

# 2. Create and attach database
flyctl postgres create
flyctl postgres attach

# 3. Set secrets
flyctl secrets set JWT_SECRET="$(openssl rand -base64 32)"
flyctl secrets set JWT_REFRESH_SECRET="$(openssl rand -base64 32)"
flyctl secrets set CORS_ORIGIN="https://your-frontend.com"

# 4. Deploy
flyctl deploy
```

---

## 🆘 Troubleshooting

### Deployment fails?
```bash
flyctl logs
```

### CORS errors?
```bash
flyctl secrets set CORS_ORIGIN="https://your-frontend-url.com"
flyctl deploy
```

### Database issues?
```bash
flyctl postgres attach --app your-app-name
```

---

## 📚 Full Documentation

For detailed information, see:
- [FLY_IO_DEPLOYMENT_GUIDE.md](./FLY_IO_DEPLOYMENT_GUIDE.md) - Complete guide
- [Fly.io Docs](https://fly.io/docs/) - Official documentation

---

## 🎉 Success!

Your backend is live at: `https://your-app-name.fly.dev`

**Next steps:**
1. Test API endpoints
2. Update frontend configuration
3. Monitor with `flyctl logs`

---

**Deployment Time:** ~5 minutes  
**Difficulty:** ⭐ Easy
