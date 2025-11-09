# 🔄 Deployment Flow - Vercel + Fly.io

Visual guide showing how everything connects.

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         PRODUCTION                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐         HTTPS         ┌──────────────┐ │
│  │                 │ ◄─────────────────────►│              │ │
│  │  Vercel         │                        │  Fly.io      │ │
│  │  (Frontend)     │     API Calls          │  (Backend)   │ │
│  │                 │                        │              │ │
│  │  React + Vite   │                        │  Node.js +   │ │
│  │  TypeScript     │                        │  Express     │ │
│  │                 │                        │              │ │
│  └─────────────────┘                        └──────┬───────┘ │
│                                                     │         │
│  https://your-app.vercel.app        https://physician-dashboard-backend.fly.dev
│                                                     │         │
│                                              ┌──────▼───────┐ │
│                                              │              │ │
│                                              │  PostgreSQL  │ │
│                                              │  (Fly.io)    │ │
│                                              │              │ │
│                                              └──────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Environment Variables Flow

### Frontend (Vercel)
```
┌──────────────────────┐
│ VITE_API_BASE_URL    │
│ ↓                    │
│ Set in Vercel        │
│ Dashboard            │
└──────────────────────┘
         │
         ▼
Points to: https://physician-dashboard-backend.fly.dev/api
```

### Backend (Fly.io)
```
┌──────────────────────┐
│ JWT_SECRET           │
│ JWT_REFRESH_SECRET   │
│ CORS_ORIGIN          │
│ DATABASE_URL         │
│ ↓                    │
│ Set via flyctl       │
│ secrets set          │
└──────────────────────┘
```

---

## 📋 Deployment Steps Flow

```
START
  │
  ├─► 1. Install CLIs
  │      ├─ flyctl (Fly.io CLI)
  │      └─ vercel (Optional)
  │
  ├─► 2. Deploy Backend (Fly.io)
  │      ├─ Login: flyctl auth login
  │      ├─ Create app: flyctl launch
  │      ├─ Create DB: flyctl postgres create
  │      ├─ Set secrets: flyctl secrets set
  │      └─ Deploy: flyctl deploy
  │         │
  │         ▼
  │      Backend URL: https://physician-dashboard-backend.fly.dev
  │
  ├─► 3. Deploy Frontend (Vercel)
  │      ├─ Go to vercel.com/dashboard
  │      ├─ Import GitHub repo
  │      ├─ Set VITE_API_BASE_URL
  │      └─ Click Deploy
  │         │
  │         ▼
  │      Frontend URL: https://your-app.vercel.app
  │
  ├─► 4. Update CORS
  │      └─ flyctl secrets set CORS_ORIGIN="https://your-app.vercel.app"
  │
  ├─► 5. Test
  │      ├─ Visit frontend URL
  │      ├─ Check browser console
  │      ├─ Test login
  │      └─ Verify API calls
  │
  ▼
SUCCESS! 🎉
```

---

## 🔄 Request Flow

```
User Browser
    │
    │ 1. Visit https://your-app.vercel.app
    ▼
┌────────────────┐
│ Vercel (CDN)   │
│ Serves static  │
│ React app      │
└────────┬───────┘
         │
         │ 2. User logs in
         │    API call to /api/v1/auth/login
         ▼
┌────────────────────┐
│ Fly.io Backend     │
│ - Validates creds  │
│ - Creates JWT      │
│ - Sets cookie      │
└────────┬───────────┘
         │
         │ 3. Returns access token + httpOnly cookie
         ▼
┌────────────────┐
│ Frontend       │
│ - Stores token │
│ - Redirects    │
└────────┬───────┘
         │
         │ 4. Subsequent requests include:
         │    - Authorization: Bearer <token>
         │    - Cookie with refresh token
         ▼
┌────────────────────┐
│ Backend            │
│ - Validates token  │
│ - Returns data     │
└────────────────────┘
```

---

## 🔒 CORS Configuration

```
Frontend Domain            Backend CORS_ORIGIN
──────────────────────────────────────────────────
https://your-app.vercel.app  ◄──► Must match exactly
https://preview.vercel.app   ◄──► Use wildcard: *.vercel.app

If CORS_ORIGIN doesn't match:
❌ Browser blocks requests
❌ "CORS policy" error in console

If CORS_ORIGIN matches:
✅ Requests allowed
✅ Cookies sent/received
✅ API calls succeed
```

---

## 📦 Build & Deploy Process

### Frontend (Vercel)
```
GitHub Push
    │
    ▼
Vercel Auto-Deploy
    │
    ├─► Install dependencies (npm install)
    ├─► Build (npm run build)
    │   ├─ TypeScript compilation
    │   ├─ Vite bundling
    │   └─ Asset optimization
    ├─► Deploy to CDN
    └─► Live URL ready
```

### Backend (Fly.io)
```
flyctl deploy
    │
    ├─► Build Docker image
    │   ├─ npm install
    │   ├─ TypeScript compilation
    │   ├─ Prisma client generation
    │   └─ Create optimized image
    │
    ├─► Push to Fly.io registry
    │
    ├─► Deploy to VM
    │   ├─ Stop old instance
    │   ├─ Start new instance
    │   ├─ Run migrations
    │   └─ Health check
    │
    └─► Live backend ready
```

---

## 🔍 Troubleshooting Flow

```
Problem Detected
    │
    ▼
┌─────────────────────┐
│ Where is the issue? │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
Frontend    Backend
    │           │
    │           ├─► Check logs: flyctl logs
    │           ├─► Check status: flyctl status
    │           └─► Check secrets: flyctl secrets list
    │
    ├─► Check console: F12 → Console
    ├─► Check network: F12 → Network
    └─► Check env vars: Vercel Dashboard

Common Issues:
├─ CORS Error → Update CORS_ORIGIN
├─ 404 Error → Check VITE_API_BASE_URL
├─ Auth Error → Check JWT secrets
└─ Connection Error → Check backend is running
```

---

## 📊 Monitoring

```
Production Monitoring
    │
    ├─► Frontend (Vercel)
    │   ├─ Vercel Analytics
    │   ├─ Web Vitals
    │   └─ Deployment logs
    │
    ├─► Backend (Fly.io)
    │   ├─ flyctl logs
    │   ├─ flyctl metrics
    │   ├─ Health checks
    │   └─ Fly.io dashboard
    │
    └─► Optional: Sentry
        ├─ Error tracking
        ├─ Performance monitoring
        └─ User sessions
```

---

## 🎯 Success Checklist

```
✅ Backend Health Check
   curl https://physician-dashboard-backend.fly.dev/health/live
   → {"status":"ok"}

✅ Frontend Loads
   Open: https://your-app.vercel.app
   → No console errors

✅ API Calls Work
   Login → Success
   → Token received
   → Redirected to dashboard

✅ CORS Configured
   → No CORS errors in console
   → Cookies sent/received

✅ Environment Variables Set
   Backend: flyctl secrets list
   Frontend: Vercel dashboard

✅ SSL Enabled
   → Both URLs use HTTPS
   → Certificates valid
```

---

## 📞 Getting Help

```
Issue Type           Resource
─────────────────────────────────────────
Backend not starting    → flyctl logs
CORS errors            → CORS_ORIGIN setting
API 404s               → VITE_API_BASE_URL
Build failures         → Vercel/Fly logs
General questions      → Documentation files
```

---

## 📚 Documentation Map

```
Quick Start          → DEPLOY_NOW.md
Complete Guide       → VERCEL_FLYIO_DEPLOYMENT.md
Step-by-Step         → DEPLOYMENT_CHECKLIST.md
Overview             → DEPLOYMENT_SUMMARY.md
Command Reference    → DEPLOYMENT_QUICKREF.md
Architecture (this)  → DEPLOYMENT_FLOW.md
```

---

**Ready to deploy!** Follow the flow from top to bottom. 🚀

