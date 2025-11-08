# Deploy Both Frontend & Backend to Fly.io

Complete guide to deploy your full-stack application entirely on Fly.io.

## 🎯 Benefits

- **Single Platform:** Manage both apps in one place
- **Same Region:** Frontend & backend in same datacenter = faster
- **Simple CORS:** Use same domain with subdomains
- **Free Tier:** Both apps free (within limits)

---

## Architecture

```
https://physician-dashboard.fly.dev          → Frontend (React/Vite)
https://physician-dashboard-api.fly.dev      → Backend (Node.js/Express)
```

Or with custom domain:
```
https://app.yourdomain.com     → Frontend
https://api.yourdomain.com     → Backend
```

---

## Part 1: Deploy Backend (10 min)

### Step 1: Install & Login

```bash
# Install Fly CLI
brew install flyctl

# Login
flyctl auth login
```

### Step 2: Deploy Backend

```bash
# Go to backend directory
cd backend

# Launch app
flyctl launch --no-deploy

# When prompted:
# ✓ App name: physician-dashboard-api
# ✓ Region: iad (or closest to you)
# ✓ PostgreSQL: YES - create database
# ✓ Deploy now: NO

# Set secrets
flyctl secrets set JWT_SECRET="$(openssl rand -base64 32)"
flyctl secrets set JWT_REFRESH_SECRET="$(openssl rand -base64 32)"
flyctl secrets set CORS_ORIGIN="https://physician-dashboard.fly.dev"

# Deploy!
flyctl deploy
```

### Step 3: Verify Backend

```bash
# Check status
flyctl status

# Test health endpoint
curl https://physician-dashboard-api.fly.dev/health/live

# View logs
flyctl logs

# Open API docs
open https://physician-dashboard-api.fly.dev/api-docs
```

✅ **Backend is live:** `https://physician-dashboard-api.fly.dev`

---

## Part 2: Deploy Frontend (5 min)

### Step 1: Create Frontend Dockerfile

Create `Dockerfile` in your **root directory**:

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage - use nginx to serve static files
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Fly.io default)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Create Nginx Config

Create `nginx.conf` in your **root directory**:

```nginx
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### Step 3: Create Frontend fly.toml

Create `fly.toml` in your **root directory**:

```toml
# Frontend Fly.io Configuration
app = "physician-dashboard"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256

[env]
  VITE_API_URL = "https://physician-dashboard-api.fly.dev"
```

### Step 4: Update Frontend API Configuration

Update your frontend to use the environment variable:

**`src/config/api.ts`** (or wherever you configure API):

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

Or if using services directly, update them to use `API_BASE_URL`.

### Step 5: Deploy Frontend

```bash
# From root directory
cd ..  # if you're in backend directory

# Deploy frontend
flyctl launch --no-deploy --config fly.toml

# Deploy!
flyctl deploy

# Open in browser
flyctl open
```

✅ **Frontend is live:** `https://physician-dashboard.fly.dev`

---

## Part 3: Connect Frontend & Backend

### Update Backend CORS

```bash
cd backend

# Update CORS to include your frontend URL
flyctl secrets set CORS_ORIGIN="https://physician-dashboard.fly.dev"
```

### Update Frontend API URL (if needed)

If you used different app names:

```bash
# From root directory
flyctl secrets set VITE_API_URL="https://your-backend-app.fly.dev"
flyctl deploy
```

---

## 🎉 You're Done!

| Service | URL |
|---------|-----|
| **Frontend** | `https://physician-dashboard.fly.dev` |
| **Backend** | `https://physician-dashboard-api.fly.dev` |
| **API Docs** | `https://physician-dashboard-api.fly.dev/api-docs` |

---

## Managing Your Apps

### View All Apps

```bash
flyctl apps list
```

### Switch Between Apps

```bash
# Backend
cd backend
flyctl status
flyctl logs

# Frontend
cd ..
flyctl status -a physician-dashboard
flyctl logs -a physician-dashboard
```

### Update Backend

```bash
cd backend
flyctl deploy
```

### Update Frontend

```bash
cd ..  # root directory
flyctl deploy -a physician-dashboard
```

---

## Custom Domain (Optional)

### Add Custom Domain

```bash
# Add domain to frontend
flyctl certs add app.yourdomain.com -a physician-dashboard

# Add domain to backend
flyctl certs add api.yourdomain.com -a physician-dashboard-api
```

Then add these DNS records to your domain:

```
app  CNAME  physician-dashboard.fly.dev
api  CNAME  physician-dashboard-api.fly.dev
```

Update backend CORS:
```bash
cd backend
flyctl secrets set CORS_ORIGIN="https://app.yourdomain.com"
```

---

## Monitoring & Logs

### View Logs

```bash
# Frontend logs
flyctl logs -a physician-dashboard

# Backend logs
flyctl logs -a physician-dashboard-api

# Follow logs (real-time)
flyctl logs -a physician-dashboard-api --follow
```

### Check Status

```bash
# All apps
flyctl apps list

# Specific app
flyctl status -a physician-dashboard
flyctl status -a physician-dashboard-api
```

### View Metrics

```bash
# Open dashboard
flyctl dashboard physician-dashboard
flyctl dashboard physician-dashboard-api
```

---

## Scaling

### Scale Frontend

```bash
# Increase instances
flyctl scale count 2 -a physician-dashboard

# Increase memory
flyctl scale memory 512 -a physician-dashboard
```

### Scale Backend

```bash
cd backend
flyctl scale count 2
flyctl scale memory 512
```

---

## Cost Breakdown

### Free Tier Includes:
- 3 shared-cpu-1x VMs (256MB RAM each)
- 160GB outbound data transfer
- 3GB persistent volume storage

### Your Apps:
- **Frontend:** 1 VM × 256MB = Free ✅
- **Backend:** 1 VM × 512MB = Free ✅
- **PostgreSQL:** Free tier = Free ✅

**Total:** $0/month 🎉

---

## Troubleshooting

### Frontend Build Fails

```bash
# Test build locally
npm run build

# Check if dist folder is created
ls -la dist/

# View build logs
flyctl logs -a physician-dashboard
```

### Frontend Shows "Cannot connect to backend"

1. **Check API URL:**
   ```bash
   flyctl secrets list -a physician-dashboard
   ```

2. **Check CORS:**
   ```bash
   cd backend
   flyctl secrets list | grep CORS
   ```

3. **Test backend directly:**
   ```bash
   curl https://physician-dashboard-api.fly.dev/health/live
   ```

### Backend Issues

```bash
# Check logs
cd backend
flyctl logs

# SSH into container
flyctl ssh console

# Check database connection
flyctl postgres list
```

---

## CI/CD (Optional)

### GitHub Actions - Deploy on Push

Create `.github/workflows/deploy-fly.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - name: Deploy Backend
        run: flyctl deploy --remote-only
        working-directory: ./backend
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - name: Deploy Frontend
        run: flyctl deploy --remote-only -a physician-dashboard
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Get your token:
```bash
flyctl auth token
```

Add to GitHub: Settings → Secrets → `FLY_API_TOKEN`

---

## Quick Commands Reference

```bash
# Deploy backend
cd backend && flyctl deploy

# Deploy frontend
flyctl deploy -a physician-dashboard

# View all apps
flyctl apps list

# Frontend logs
flyctl logs -a physician-dashboard

# Backend logs
cd backend && flyctl logs

# SSH into backend
cd backend && flyctl ssh console

# SSH into frontend
flyctl ssh console -a physician-dashboard

# Check status
flyctl status -a physician-dashboard
flyctl status -a physician-dashboard-api

# View secrets
flyctl secrets list -a physician-dashboard
cd backend && flyctl secrets list
```

---

## Advantages vs Vercel + Fly.io

| Feature | Both on Fly.io | Fly.io + Vercel |
|---------|----------------|-----------------|
| **Management** | Single platform | Two platforms |
| **Performance** | Same datacenter | Different providers |
| **CORS Setup** | Simple | Need configuration |
| **Cost** | Free | Free |
| **Deployment** | flyctl for both | flyctl + Vercel CLI |
| **Auto-deploy** | GitHub Actions | Built-in (Vercel) |
| **CDN** | Fly.io Anycast | Vercel Edge Network |

---

## Next Steps

1. ✅ Backend deployed
2. ✅ Frontend deployed
3. ✅ Both connected
4. (Optional) Add custom domain
5. (Optional) Set up CI/CD
6. (Optional) Add monitoring

---

**Ready to deploy?** Follow Part 1 (Backend) first, then Part 2 (Frontend)!

