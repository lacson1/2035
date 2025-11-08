# Local vs Vercel Setup - Choose Your Path

## 🔍 Are You Testing Locally or on Vercel?

The error shows `localhost:3000` - this means different things depending on where you're testing:

---

## 🏠 Option 1: Testing Locally (localhost)

If you're running the frontend locally (e.g., `npm run dev` on port 5173):

### ✅ Start Backend Locally

```bash
# Terminal 1: Start database
cd backend
docker-compose up -d postgres redis

# Terminal 2: Start backend
cd backend
npm run dev
```

**Then:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- ✅ Should work!

---

## ☁️ Option 2: Testing on Vercel (Deployed)

If you're testing on your Vercel URL (`https://2035-git-cursor-run-application-a271-lacs-projects-650efe27.vercel.app`):

### ✅ Set Environment Variable in Vercel

**The frontend MUST point to your deployed backend, not localhost!**

1. **Get your Render backend URL:**
   - Go to: https://dashboard.render.com
   - Click your backend service
   - Copy URL (e.g., `https://physician-dashboard-backend-xxxx.onrender.com`)

2. **Set in Vercel:**
   - Go to: https://vercel.com → Your Project → Settings → Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
   - Redeploy

---

## 🚀 Quick Start: Run Locally Now

If you want to test locally right now:

```bash
# Start everything
cd "/Users/lacbis/ 2035/backend"
docker-compose up -d postgres redis
npm run dev
```

Then open: http://localhost:5173

---

## 📋 Which One Are You Using?

**Tell me:**
- Are you testing on **localhost:5173** (local)?
- Or on **Vercel URL** (deployed)?

I'll give you the exact steps for your scenario!

