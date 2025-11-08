# ⚡ Quick Deploy Guide: Vercel + Render

## ✅ What's Been Set Up

1. ✅ **Backend Render config** (`backend/render.yaml`)
2. ✅ **Backend app.ts** - Updated to listen on `0.0.0.0`
3. ✅ **Vercel config** (`vercel.json`) - Added API proxy
4. ✅ **Deployment docs** - Complete guides created

---

## 🚀 Deploy in 5 Minutes

### Step 1: Deploy Backend to Render (3 min)

1. Go to https://dashboard.render.com → **New → Web Service**
2. Connect GitHub repo
3. Configure:
   - **Root Directory**: `backend`
   - **Build**: `npm install && npm run build && npx prisma generate`
   - **Start**: `npm start`
4. **Set Env Vars**:
   ```bash
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your-postgres-url>
   JWT_SECRET=<openssl rand -base64 32>
   JWT_REFRESH_SECRET=<openssl rand -base64 32>
   ```
5. **Deploy** → Copy your backend URL (e.g., `https://physician-dashboard-backend.onrender.com`)

### Step 2: Update Vercel Config (1 min)

**IMPORTANT**: Update `vercel.json` with your actual Render URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-BACKEND-URL.onrender.com/api/:path*"
    }
  ]
}
```

### Step 3: Deploy Frontend to Vercel (1 min)

1. Go to https://vercel.com → **Add New Project**
2. Import GitHub repo
3. **Framework**: Vite
4. **Deploy** (no env vars needed - using proxy)

### Step 4: Update Backend CORS

In Render dashboard → Environment:
```bash
CORS_ORIGIN=https://your-app.vercel.app
```
Restart service.

---

## 🎯 That's It!

Your app should now be live:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

---

## ⚠️ Important Notes

1. **Update `vercel.json`** with your actual Render backend URL before deploying
2. **Run migrations** after first backend deploy: `npx prisma migrate deploy` (in Render Shell)
3. **Free tier limitations**: Render spins down after 15 min inactivity (first request may be slow)

---

## 📚 Full Documentation

- **Complete Guide**: `docs/RENDER_VERCEL_DEPLOYMENT.md`
- **Backend Setup**: `backend/README_RENDER.md`
- **Troubleshooting**: See deployment docs

---

## 🐛 Quick Fixes

**Backend won't start**: Check logs, verify `PORT` env var
**CORS errors**: Update `CORS_ORIGIN` in Render, restart service
**API 404**: Verify `vercel.json` has correct Render URL
**Database errors**: Run migrations: `npx prisma migrate deploy`

