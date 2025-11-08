# ⚡ Quick Fix: Vercel Still Using Localhost

## The Issue

Your Vercel frontend is **still** trying to connect to `localhost:3000` because the environment variable isn't set.

---

## 🚀 2-Minute Fix

### Option 1: Set Environment Variable (Recommended)

1. **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. **Add**:
   ```
   Key: VITE_API_BASE_URL
   Value: https://your-backend.onrender.com/api
   ```
3. **Redeploy** (automatic or manual)

---

### Option 2: Check Current Value

The frontend uses this code:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

If `VITE_API_BASE_URL` is not set, it defaults to `localhost:3000`.

---

## 🔍 Find Your Backend URL

**Render Backend:**
1. Go to: https://dashboard.render.com
2. Click your backend service
3. Copy the URL shown (e.g., `https://physician-dashboard-backend-xxxx.onrender.com`)
4. Add `/api` → `https://physician-dashboard-backend-xxxx.onrender.com/api`

**Railway Backend:**
1. Go to: https://railway.app
2. Click your service
3. Copy the URL → Add `/api`

---

## ✅ After Setting Environment Variable

1. **Vercel will auto-redeploy** (or manually redeploy)
2. **Frontend will use your Render backend**
3. **CORS will work** (backend already updated)

---

## 🆘 Still Not Working?

Check:
- [ ] Environment variable name is exactly: `VITE_API_BASE_URL`
- [ ] Value includes `/api` at the end
- [ ] Set for all environments (Production, Preview, Development)
- [ ] Redeployed after setting variable

