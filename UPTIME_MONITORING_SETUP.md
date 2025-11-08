# Uptime Monitoring Setup Guide

This guide helps you set up uptime monitoring for your production application.

## Why Uptime Monitoring?

- **Know immediately** when your app goes down
- **Track uptime** percentage (SLA compliance)
- **Get alerts** via email/SMS/Slack
- **Monitor response times** and performance

## Quick Setup (15 minutes)

### Option 1: UptimeRobot (Recommended - Free Tier Available)

1. **Sign up**: Go to [uptimerobot.com](https://uptimerobot.com)
2. **Create Monitor**:
   - Click "Add New Monitor"
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Physician Dashboard Backend
   - **URL**: `https://your-backend.railway.app/health`
   - **Monitoring Interval**: 5 minutes (free tier)
   - **Alert Contacts**: Add your email
3. **Repeat for Frontend**:
   - Create another monitor for your frontend URL
   - URL: `https://your-frontend.vercel.app`

**Free Tier Includes**:
- 50 monitors
- 5-minute check interval
- Email alerts
- Basic status pages

---

### Option 2: Pingdom (Paid)

1. Sign up at [pingdom.com](https://www.pingdom.com)
2. Create HTTP check
3. Set up alerts (email, SMS, Slack)

**Pricing**: Starts at $10/month

---

### Option 3: StatusCake (Free Tier Available)

1. Sign up at [statuscake.com](https://www.statuscake.com)
2. Create uptime test
3. Configure alerts

**Free Tier Includes**:
- 10 uptime tests
- 5-minute check interval
- Email alerts

---

## Recommended Configuration

### Backend Monitor

```
Monitor Type: HTTP(s)
URL: https://your-backend.railway.app/health
Expected Status: 200
Check Interval: 5 minutes
Timeout: 30 seconds
```

### Frontend Monitor

```
Monitor Type: HTTP(s)
URL: https://your-frontend.vercel.app
Expected Status: 200
Check Interval: 5 minutes
Timeout: 30 seconds
```

### Advanced: Detailed Health Check

For more detailed monitoring, use the `/health/detailed` endpoint:

```
URL: https://your-backend.railway.app/health/detailed
Expected Response: {"status":"ok","database":"connected",...}
```

---

## Alert Configuration

### Email Alerts
- ✅ Configure in monitoring service dashboard
- ✅ Add multiple email addresses
- ✅ Set alert frequency (immediate, daily digest, etc.)

### SMS Alerts (Optional)
- Some services offer SMS alerts (may require paid plan)
- Useful for critical production issues

### Slack Integration (Optional)
- Many services support Slack webhooks
- Get alerts in your team's Slack channel

---

## What to Monitor

### Critical Endpoints

1. **Backend Health**: `/health`
   - Should return 200 OK
   - Indicates server is running

2. **Frontend**: Root URL
   - Should return 200 OK
   - Indicates frontend is accessible

3. **API Endpoint**: `/api/v1`
   - Should return API info
   - Indicates API is responding

### Optional Endpoints

- `/health/detailed` - Database connectivity check
- `/health/ready` - Kubernetes readiness probe
- `/health/live` - Kubernetes liveness probe

---

## Monitoring Best Practices

### 1. Set Appropriate Intervals
- **Production**: 1-5 minutes
- **Staging**: 5-15 minutes
- **Development**: Not needed

### 2. Configure Alert Thresholds
- Alert after **2 consecutive failures**
- Don't alert on single failures (may be transient)

### 3. Set Up Multiple Alert Channels
- Email (always)
- SMS (critical only)
- Slack (team notifications)

### 4. Monitor Response Times
- Set up performance monitoring
- Alert if response time > 2 seconds

### 5. Create Status Page
- Many services offer public status pages
- Share with users: `status.yourdomain.com`

---

## GitHub Actions Alternative

If you prefer to monitor via GitHub Actions:

Create `.github/workflows/health-check.yml`:

```yaml
name: Health Check

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check backend health
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://your-backend.railway.app/health)
          if [ "$response" != "200" ]; then
            echo "Backend health check failed!"
            exit 1
          fi
      
      - name: Check frontend
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://your-frontend.vercel.app)
          if [ "$response" != "200" ]; then
            echo "Frontend health check failed!"
            exit 1
          fi
```

**Note**: GitHub Actions has rate limits, so dedicated monitoring services are recommended.

---

## Troubleshooting

### Monitor Shows "Down" But App Works

1. **Check URL**: Ensure URL is correct
2. **Check CORS**: Health endpoint should not require CORS
3. **Check Firewall**: Ensure monitoring service IPs aren't blocked
4. **Check SSL**: Ensure SSL certificate is valid

### Too Many False Alerts

1. **Increase Alert Threshold**: Require 2-3 consecutive failures
2. **Check Interval**: Increase check interval if network is unstable
3. **Timeout Settings**: Increase timeout if responses are slow

### Monitor Not Alerting

1. **Check Email Settings**: Verify email address is correct
2. **Check Spam Folder**: Alerts may be in spam
3. **Verify Alert Rules**: Ensure alerts are enabled
4. **Test Alert**: Use "Test Alert" feature in dashboard

---

## Recommended Services Comparison

| Service | Free Tier | Paid Plans | Best For |
|---------|----------|------------|----------|
| **UptimeRobot** | ✅ 50 monitors | $7/month | Small to medium apps |
| **StatusCake** | ✅ 10 tests | $20/month | Enterprise features |
| **Pingdom** | ❌ | $10/month | Advanced features |
| **Better Uptime** | ✅ Limited | $10/month | Modern UI |

---

## Next Steps

1. ✅ Set up monitoring service (UptimeRobot recommended)
2. ✅ Configure backend health check
3. ✅ Configure frontend health check
4. ✅ Set up email alerts
5. ✅ Test alerts (trigger a test alert)
6. ✅ Share status page URL with team

---

**Last Updated**: December 2024
**Status**: Ready to use

