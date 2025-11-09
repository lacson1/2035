# 🏠 Running Docker Backend Locally with Vercel Frontend

**Question:** Can I run my backend in Docker on my computer while the frontend is on Vercel?

**Short Answer:** Yes, but only for **development/testing**. For production, both should be in the cloud.

---

## 🎯 Two Approaches

### Approach 1: Local Development (Both Local) ✅ **RECOMMENDED**
Run both frontend and backend on your computer for development.

### Approach 2: Hybrid (Local Backend + Cloud Frontend) ⚠️ **POSSIBLE BUT TRICKY**
Backend on your computer, frontend on Vercel (requires tunneling).

---

## 🖥️ Approach 1: Full Local Development (Best for Development)

This is the **easiest and most common** approach for development.

### Setup

**Terminal 1 - Backend (Docker):**
```bash
cd "/Users/lacbis/ 2035/backend"

# Option A: Docker Compose (recommended)
docker-compose up

# Option B: Direct npm (no Docker)
npm run dev
```

**Terminal 2 - Frontend (Local):**
```bash
cd "/Users/lacbis/ 2035"

# Make sure .env.local points to localhost
echo 'VITE_API_BASE_URL=http://localhost:3000/api' > .env.local

# Start frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Database: localhost:5432

### ✅ Advantages
- **Fast** - No network latency
- **Simple** - No configuration needed
- **Free** - No hosting costs
- **Full control** - Can debug both frontend and backend
- **Works offline** - No internet needed

### ❌ Disadvantages
- **Local only** - Can't share with others
- **Not production-like** - Different environment

---

## 🌐 Approach 2: Local Backend + Vercel Frontend (Hybrid)

Run backend on your computer, access it from Vercel using a tunnel.

### The Problem

**Vercel (internet) → Your Computer (localhost) = ❌ Won't work**

Your computer's `localhost` is not accessible from the internet. Vercel can't reach it.

### The Solution: Tunneling Services

Use a service to expose your local backend to the internet:

| Service | Free Tier | Speed | Setup Difficulty |
|---------|-----------|-------|------------------|
| **ngrok** | ✅ Yes (limited) | Fast | Easy |
| **Cloudflare Tunnel** | ✅ Yes (unlimited) | Fast | Medium |
| **localtunnel** | ✅ Yes | Medium | Easy |
| **Tailscale Funnel** | ✅ Yes | Fast | Medium |

---

## 🚀 Option A: Using ngrok (Easiest)

### Step 1: Install ngrok
```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

### Step 2: Start Your Backend
```bash
cd "/Users/lacbis/ 2035/backend"

# Using Docker
docker-compose up

# Or without Docker
npm run dev
```

### Step 3: Create Tunnel
```bash
# In a new terminal
ngrok http 3000
```

**Output:**
```
ngrok                                                                          

Session Status                online
Account                       your-email@example.com (Plan: Free)
Version                       3.5.0
Region                        United States (us)
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

Copy the `https://abc123.ngrok.io` URL (yours will be different).

### Step 4: Update Backend CORS

Edit `backend/.env`:
```bash
CORS_ORIGIN=http://localhost:5173,https://physician-dashboard-2035.vercel.app,https://abc123.ngrok.io
```

Restart backend:
```bash
# Stop (Ctrl+C) and restart
cd "/Users/lacbis/ 2035/backend"
npm run dev
```

### Step 5: Update Vercel Environment Variable
```bash
cd "/Users/lacbis/ 2035"

# Set your ngrok URL
echo "https://abc123.ngrok.io/api" | npx vercel env add VITE_API_BASE_URL production

# Redeploy
npx vercel --prod --yes
```

### Step 6: Test
Visit https://physician-dashboard-2035.vercel.app and try logging in!

### ⚠️ ngrok Limitations (Free Tier)
- URL changes every time you restart ngrok (unless you upgrade)
- 40 connections/minute limit
- Sessions expire after 8 hours
- Not suitable for production

---

## 🔒 Option B: Using Cloudflare Tunnel (Better for Long-term)

### Step 1: Install Cloudflare Tunnel
```bash
brew install cloudflare/cloudflare/cloudflared
```

### Step 2: Login
```bash
cloudflared tunnel login
```

### Step 3: Create Tunnel
```bash
# Create a tunnel named "backend"
cloudflared tunnel create backend

# Note the tunnel ID (shown in output)
```

### Step 4: Configure Tunnel

Create `~/.cloudflared/config.yml`:
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /Users/lacbis/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: backend.yourdomain.com  # Or use trycloudflare.com for free
    service: http://localhost:3000
  - service: http_status:404
```

### Step 5: Run Tunnel
```bash
# Quick test (no custom domain needed)
cloudflared tunnel --url http://localhost:3000

# Or with config
cloudflared tunnel run backend
```

### ✅ Cloudflare Advantages
- **Persistent URL** (doesn't change)
- **No limits** on connections
- **Better security** (encrypted tunnel)
- **Free forever**

---

## 📝 Docker Setup for Local Backend

### Option 1: Docker Compose (Full Stack)

Create `backend/docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/physician_dashboard
      - NODE_ENV=development
      - CORS_ORIGIN=http://localhost:5173
    depends_on:
      - db
    volumes:
      - ./src:/app/src  # Hot reload

  db:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=physician_dashboard
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Start:**
```bash
cd "/Users/lacbis/ 2035/backend"
docker-compose up
```

**Stop:**
```bash
docker-compose down
```

### Option 2: Docker for Backend Only

```bash
cd "/Users/lacbis/ 2035/backend"

# Build
docker build -t physician-backend .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e CORS_ORIGIN="http://localhost:5173" \
  physician-backend
```

---

## 🎯 Comparison: Which Approach?

### For Daily Development
**✅ Full Local (Both Local)**
- Fastest
- Simplest
- Most reliable
- Best developer experience

**Setup:**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### For Showing Others / Testing on Mobile
**✅ ngrok/Cloudflare (Hybrid)**
- Can share URL with others
- Test on real devices
- Preview before deploying

**Setup:**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
ngrok http 3000

# Terminal 3 (update Vercel)
npx vercel env add VITE_API_BASE_URL production
```

### For Production
**✅ Both in Cloud**
- Backend: Fly.io ($0-5/month)
- Frontend: Vercel ($0)
- Most reliable
- Best performance

---

## 💡 My Recommendation

### Development Workflow:

**Daily work (fastest):**
```bash
# Both local
cd "/Users/lacbis/ 2035/backend" && npm run dev  # Terminal 1
cd "/Users/lacbis/ 2035" && npm run dev          # Terminal 2
```

**Show to others (when needed):**
```bash
# Use ngrok occasionally
cd "/Users/lacbis/ 2035/backend" && npm run dev  # Terminal 1
ngrok http 3000                                   # Terminal 2
# Update Vercel env to use ngrok URL
```

**Production (deploy both):**
```bash
# Backend to Fly.io
cd "/Users/lacbis/ 2035/backend" && flyctl deploy

# Frontend to Vercel
cd "/Users/lacbis/ 2035" && npx vercel --prod
```

---

## 🚨 Important Notes

### Security Warning
**Never expose your local backend to the internet in production!**
- Tunnels are fine for development/testing
- For production, always use proper hosting (Fly.io, AWS, etc.)

### Why Not Use Local Backend for Production?
1. **Unreliable** - Your computer needs to be on 24/7
2. **Slow** - Home internet upload speed is limited
3. **Insecure** - Home network is not designed for public access
4. **No scaling** - Can't handle multiple users
5. **No backups** - If your computer fails, everything is gone

---

## 📋 Quick Command Reference

### Start Everything Locally
```bash
# Backend
cd "/Users/lacbis/ 2035/backend"
npm run dev

# Frontend (new terminal)
cd "/Users/lacbis/ 2035"
npm run dev
```

### Start Backend with Docker
```bash
cd "/Users/lacbis/ 2035/backend"
docker-compose up
```

### Expose Local Backend with ngrok
```bash
ngrok http 3000
```

### Update Vercel to Use ngrok
```bash
# Replace YOUR_NGROK_URL with actual URL
echo "https://YOUR_NGROK_URL.ngrok.io/api" | npx vercel env add VITE_API_BASE_URL production
npx vercel --prod --yes
```

### Check What's Running
```bash
# Check if backend is running
curl http://localhost:3000/health

# Check Docker containers
docker ps

# Check ports in use
lsof -i :3000
lsof -i :5173
```

---

## ❓ FAQ

**Q: Can I use Docker for backend while developing frontend locally?**  
A: Yes! Just run `docker-compose up` for backend, then `npm run dev` for frontend.

**Q: Do I need ngrok for local development?**  
A: No, only if you want to access your local backend from Vercel or share with others.

**Q: Is it free?**  
A: Yes! ngrok and Cloudflare tunnels have free tiers that work great.

**Q: What about the database?**  
A: Include PostgreSQL in your `docker-compose.yml` (see example above).

**Q: Can multiple people use my local backend?**  
A: With ngrok/Cloudflare, yes, but it's slow and not recommended for many users.

**Q: Should I use this in production?**  
A: **NO!** Always deploy both to the cloud for production (Fly.io + Vercel).

---

## ✅ Bottom Line

| Scenario | Solution | Cost |
|----------|----------|------|
| **Daily development** | Both local (no Docker needed) | $0 |
| **Testing with Docker** | Backend in Docker, frontend local | $0 |
| **Share with others** | Backend local + ngrok, frontend Vercel | $0 |
| **Production** | Backend Fly.io, frontend Vercel | $0-5/month |

**Best practice:** Develop locally, deploy to cloud for production. Use ngrok/tunnels only when you need to test the Vercel frontend with your local backend.

---

**Created:** November 8, 2025  
**Last Updated:** November 8, 2025


