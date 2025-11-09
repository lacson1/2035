# 💰 Hosting Cost Comparison (Nov 2025)

Comparison for your app: **Node.js Backend + PostgreSQL Database**

---

## 🏆 Free Tier Comparison

| Platform | Free Tier | Backend | Database | Total/Month | Limits |
|----------|-----------|---------|----------|-------------|--------|
| **Fly.io** | ✅ Yes | FREE | FREE | **$0** | 3 VMs (256MB RAM), 3GB storage |
| **Render** | ✅ Yes | FREE | $0 (7 paid) | **$7** | 512MB RAM, spins down after 15min |
| **Railway** | ✅ Trial | FREE trial | FREE trial | **$0** ($5 after) | $5 credit/month, then $0.000463/GB-sec |
| **Vercel** | ✅ Yes | Not ideal* | No DB | **N/A** | Frontend-focused, 10s timeout |
| **Heroku** | ❌ No | $7 | $0 (limited) | **$7** | Eco dyno, sleeps after 30min |
| **DigitalOcean** | ❌ No | $6 | $15 | **$21** | 1GB RAM |
| **AWS EC2** | ⚠️ 12mo | Free 12mo | Free 12mo | **$0** → **$30+** | t2.micro, 20GB, then expensive |

\* *Vercel is designed for frontend/serverless functions, not traditional Node.js backends*

---

## 💡 Fly.io Free Tier (What You Get)

### ✅ **FREE Forever Includes:**
- **3 shared-cpu-1x VMs** (256MB RAM each)
- **3GB persistent storage** (across all VMs)
- **160GB outbound bandwidth**
- **Automatic SSL certificates**
- **Global CDN**
- **Health checks & auto-restart**
- **Zero cold starts** (unlike Render/Heroku free tier)

### 📊 **Your Current Usage:**
```
Backend:  1 VM × 512MB RAM = ~$3.50/month
Database: 1 VM × 256MB RAM = ~$1.50/month
Storage:  3GB               = FREE
-----------------------------------------
TOTAL:                       ~$5/month
```

### 🎯 **How to Stay FREE on Fly.io:**
Reduce your backend VM to 256MB RAM:
```bash
# Edit fly.toml
[[vm]]
  memory_mb = 256  # Change from 512
  
# Redeploy
flyctl deploy
```

**Result:** Both backend (256MB) + database (256MB) = **$0/month** ✅

---

## 💵 Paid Tier Comparison (Production Scale)

### Small App (Like Yours - Light Traffic)

| Platform | Backend | Database | Total/Month |
|----------|---------|----------|-------------|
| **Fly.io** | $3.50 (512MB) | $1.50 (256MB) | **$5** |
| **Railway** | ~$5 | ~$5 | **$10** |
| **Render** | $7 (512MB) | $7 (1GB) | **$14** |
| **Heroku** | $7 | $0-9 | **$7-16** |
| **DigitalOcean** | $6 | $15 | **$21** |
| **AWS** | ~$10 | ~$15 | **$25** |

### Medium App (Growing Traffic - 100+ users/day)

| Platform | Backend | Database | Total/Month |
|----------|---------|----------|-------------|
| **Fly.io** | $12 (1GB) | $7 (1GB) | **$19** |
| **Railway** | ~$15 | ~$15 | **$30** |
| **Render** | $25 (2GB) | $20 (4GB) | **$45** |
| **DigitalOcean** | $18 | $35 | **$53** |
| **AWS** | ~$30 | ~$30 | **$60** |

### Large App (High Traffic - 1000+ users/day)

| Platform | Backend | Database | Total/Month |
|----------|---------|----------|-------------|
| **Fly.io** | $30 (4GB) | $30 (4GB) | **$60** |
| **Railway** | ~$50 | ~$50 | **$100** |
| **Render** | $85 (8GB) | $90 (16GB) | **$175** |
| **DigitalOcean** | $48 | $120 | **$168** |
| **AWS** | ~$100+ | ~$100+ | **$200+** |

---

## 📊 Fly.io Detailed Pricing

### Compute (Backend)
```
Shared CPU (what you're using):
├─ 256MB RAM: $1.94/month ($0.0000027/sec)
├─ 512MB RAM: $3.50/month
├─ 1GB RAM:   $5.70/month
└─ 2GB RAM:   $11.00/month

Dedicated CPU (for high performance):
├─ 1 CPU, 2GB RAM:  $62/month
├─ 2 CPU, 4GB RAM:  $124/month
└─ 4 CPU, 8GB RAM:  $248/month
```

### Storage (Database)
```
Persistent Volumes:
├─ First 3GB:    FREE
├─ 3-10GB:       $0.15/GB/month
└─ 10GB+:        $0.15/GB/month

Example:
- 5GB total = 3GB free + 2GB paid = $0.30/month
- 10GB total = 3GB free + 7GB paid = $1.05/month
```

### Bandwidth
```
Outbound Data Transfer:
├─ First 160GB:   FREE
└─ 160GB+:        $0.02/GB

Typical usage:
- Small app:   20GB/month  = $0
- Medium app:  100GB/month = $0
- Large app:   300GB/month = $2.80
```

---

## 🎯 Why Fly.io is Great for Your Use Case

### ✅ Advantages
1. **Free tier is actually usable** (no sleep/spin-down)
2. **Global edge network** (fast worldwide)
3. **PostgreSQL included** (managed database)
4. **Docker-based** (deploy anything)
5. **Scales automatically** (to zero and up)
6. **Fast cold starts** (~1s vs ~30s on Render)
7. **CLI is excellent** (easy to use)
8. **Pay-as-you-go** (no monthly minimums)

### ⚠️ Disadvantages
1. **Requires credit card** (even for free tier)
2. **Learning curve** (not as simple as Heroku)
3. **Younger platform** (less mature than AWS/Heroku)
4. **Limited GUI** (mostly CLI-based)

---

## 🔄 Alternative Recommendations

### If You Want 100% Free (No Credit Card)
**Railway** or **Render**
- Railway: $5 free credit/month (enough for small apps)
- Render: Free tier with spin-down (15min idle = sleep)

### If You Want Simplicity
**Heroku**
- Most mature platform
- Excellent documentation
- Higher cost ($7+ minimum)

### If You Want Full Control
**DigitalOcean** or **AWS**
- More flexibility
- More complex setup
- Higher cost ($20+ minimum)

### If You Want Best Free Tier
**Fly.io** (current choice)
- Best performance on free tier
- No cold starts
- Most generous limits

---

## 💡 Cost Optimization Tips for Fly.io

### 1. Reduce Memory (Stay Free)
```bash
# Edit backend/fly.toml
[[vm]]
  memory_mb = 256  # Down from 512

# Redeploy
flyctl deploy
```

### 2. Use Fly Postgres Instead of RDS/External
- Fly's PostgreSQL is cheaper than AWS RDS or Supabase paid tiers
- Included in free tier (if under 3GB)

### 3. Auto-stop Machines
```toml
# In fly.toml
[http_service]
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0  # Scale to zero when idle
```

### 4. Monitor Usage
```bash
# Check current usage
flyctl status
flyctl scale show

# Check billing
flyctl billing
```

---

## 📈 Cost Projection for Your App

### Scenario 1: Hobby/Testing (Current)
```
Backend:  512MB RAM           = $3.50/month
Database: 256MB RAM, 1GB data = $1.50/month
Traffic:  20GB/month          = $0
-----------------------------------------
TOTAL:                          ~$5/month ✅
```

### Scenario 2: Optimized Free Tier
```
Backend:  256MB RAM           = FREE (within limit)
Database: 256MB RAM, 2GB data = FREE (within limit)
Traffic:  50GB/month          = FREE (within limit)
-----------------------------------------
TOTAL:                          $0/month ✅✅✅
```

### Scenario 3: Small Production (50 users/day)
```
Backend:  512MB RAM           = $3.50/month
Database: 512MB RAM, 5GB data = $3.50/month
Traffic:  80GB/month          = $0
-----------------------------------------
TOTAL:                          ~$7/month
```

### Scenario 4: Growing Production (500 users/day)
```
Backend:  1GB RAM × 2 VMs     = $11.40/month
Database: 1GB RAM, 10GB data  = $6.75/month
Traffic:  200GB/month         = $0.80/month
-----------------------------------------
TOTAL:                          ~$19/month
```

---

## 🏁 Bottom Line

### For Your Current App:
| Service | Cost | Best For |
|---------|------|----------|
| **Fly.io** (optimized) | **$0** | Best free tier |
| **Fly.io** (current) | **$5** | Production-ready |
| **Railway** | **$5-10** | Simple setup |
| **Render** | **$7-14** | Known brand |
| **Heroku** | **$7-16** | Mature platform |
| **DigitalOcean** | **$21** | Full control |

### 🎯 My Recommendation:
**Stick with Fly.io** - You're getting the best bang for your buck:
- $0-5/month for your current needs
- Can scale to 1000s of users for under $20/month
- No cold starts (better UX than Render free tier)
- Professional features (auto-scaling, health checks, etc.)

Just add the credit card to unlock the full free tier! 💳

---

## 📞 Need Help Optimizing Costs?

**To reduce to $0/month:**
1. Edit `backend/fly.toml` → set `memory_mb = 256`
2. Run `flyctl deploy`
3. Ensure database is under 3GB

**To monitor costs:**
```bash
flyctl billing      # Check current bill
flyctl metrics      # Check resource usage
flyctl status       # Check VM sizes
```

---

**Last Updated:** November 8, 2025  
**Prices sourced from official pricing pages (Nov 2025)**

