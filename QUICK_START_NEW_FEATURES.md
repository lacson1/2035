# Quick Start Guide - New Features

## 🚀 Getting Started with New Features

This guide helps you quickly test and use all the newly implemented features.

---

## 1. Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `swagger-jsdoc` - API documentation
- `swagger-ui-express` - Interactive API docs UI

---

## 2. Build the Application

```bash
cd backend
npm run build
```

This compiles TypeScript and verifies everything is working.

---

## 3. Start the Server

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:3000`

---

## 4. Test New Features

### 📚 API Documentation (Swagger)

**Access:** http://localhost:3000/api-docs

**Features:**
- Interactive API explorer
- Try out endpoints directly
- View request/response schemas
- JWT authentication support

**Note:** Only available in development mode (`NODE_ENV=development`)

---

### 🏥 Health Checks

**Basic Health Check:**
```bash
curl http://localhost:3000/health
```

**Detailed Health Check:**
```bash
curl http://localhost:3000/health/detailed
```

**Response includes:**
- Database connectivity status
- Redis connectivity status (if configured)
- Response times
- Uptime
- Environment info

**Kubernetes Probes:**
- Readiness: `GET /health/ready`
- Liveness: `GET /health/live`

---

### 📊 Metrics

**Get Application Metrics (Admin only):**
```bash
# First, get admin token
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital2035.com","password":"admin123"}' \
  | jq -r '.data.tokens.accessToken')

# Get metrics
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/metrics
```

**Metrics include:**
- Total requests
- Requests by method (GET, POST, etc.)
- Requests by status code (2xx, 4xx, 5xx)
- Average response time
- P95 response time
- Error rate
- Uptime

---

### 🔐 Password Reset

**Request Password Reset:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@hospital2035.com"}'
```

**Note:** In development, the email will be logged to console instead of sent.

**Verify Token:**
```bash
curl "http://localhost:3000/api/v1/auth/password-reset/verify?token=YOUR_TOKEN"
```

**Reset Password:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/password-reset/reset \
  -H "Content-Type: application/json" \
  -d '{
    "token":"YOUR_TOKEN",
    "password":"newpassword123"
  }'
```

---

### 💾 Database Backup

**Manual Backup:**
```bash
cd backend
./scripts/backup-database.sh
```

**Setup Automated Daily Backups:**
```bash
cd backend
./scripts/setup-backup-cron.sh
```

**Restore from Backup:**
```bash
cd backend
./scripts/restore-database.sh backups/physician_dashboard_YYYYMMDD_HHMMSS.sql.gz
```

**⚠️ Warning:** Restore will overwrite existing data!

---

### 🛡️ Rate Limiting

Rate limiting is automatically applied. You can test it by making too many requests:

```bash
# Make 100+ requests quickly
for i in {1..105}; do
  curl http://localhost:3000/api/v1/patients \
    -H "Authorization: Bearer $TOKEN"
done
```

After 100 requests in 1 minute, you'll get a 429 (Too Many Requests) response.

**Auth Endpoints:** Limited to 5 requests per 15 minutes per IP.

---

### 🔒 Input Sanitization

Input sanitization is automatically applied to all requests. It:
- Removes dangerous HTML tags
- Strips JavaScript protocols
- Removes event handlers
- Validates URLs

No additional configuration needed - it works automatically!

---

## 5. Docker Deployment

### Build Backend Image

```bash
cd backend
docker build -t physician-dashboard-backend .
```

### Build Frontend Image

```bash
docker build -t physician-dashboard-frontend .
```

### Run with Docker Compose

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    env_file:
      - ./backend/.env
    depends_on:
      - postgres
      - redis

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
```

Then:
```bash
docker-compose up -d
```

---

## 6. Environment Variables

Make sure you have these in `backend/.env`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/physician_dashboard_2035
REDIS_URL=redis://localhost:6379  # Optional
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
CORS_ORIGIN=http://localhost:5173

# Optional: Email configuration (for password reset)
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your-email@example.com
# SMTP_PASS=your-password
# SMTP_FROM=noreply@hospital2035.com

# Optional: S3 backup storage
# BACKUP_S3_BUCKET=your-backup-bucket
```

See `ENV_VARIABLES_REFERENCE.md` for complete list.

---

## 7. Troubleshooting

### Swagger Docs Not Showing

**Check:**
- `NODE_ENV=development` (Swagger only shows in development)
- Server is running
- Visit: `http://localhost:3000/api-docs`

### Health Check Fails

**Check:**
- Database is running and accessible
- `DATABASE_URL` is correct
- Check logs for connection errors

### Password Reset Email Not Sending

**In Development:**
- Emails are logged to console, not actually sent
- Check server logs for email content

**In Production:**
- Configure SMTP settings in `.env`
- Or integrate with SendGrid/AWS SES

### Backup Script Fails

**Check:**
- `DATABASE_URL` is set
- `pg_dump` is installed
- Script has execute permissions: `chmod +x scripts/backup-database.sh`
- Backup directory exists: `mkdir -p backups`

### Rate Limiting Too Strict

**Adjust in `.env`:**
```env
RATE_LIMIT_WINDOW_MS=60000      # 1 minute
RATE_LIMIT_MAX_REQUESTS=100     # Max requests
```

### Docker Build Fails

**Check:**
- Docker is running
- All files are in place
- `.dockerignore` isn't excluding needed files

---

## 8. Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong JWT secrets: `openssl rand -base64 32`
- [ ] Configure SMTP for emails
- [ ] Set up automated backups (cron job)
- [ ] Configure cloud backup storage (S3, etc.)
- [ ] Test restore procedure
- [ ] Review rate limiting settings
- [ ] Set up monitoring/alerts
- [ ] Configure HTTPS
- [ ] Review security headers
- [ ] Test password reset flow
- [ ] Document API endpoints (Swagger)

---

## 9. Additional Resources

- **API Documentation:** `http://localhost:3000/api-docs`
- **Backup Guide:** `backend/DATABASE_BACKUP_GUIDE.md`
- **Environment Variables:** `ENV_VARIABLES_REFERENCE.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`
- **Full Report:** `FINAL_IMPLEMENTATION_REPORT.md`

---

## 🎉 You're All Set!

All critical features are now implemented and ready to use. The application is production-ready with:

- ✅ Security hardening
- ✅ Monitoring and health checks
- ✅ API documentation
- ✅ Backup strategy
- ✅ Password reset
- ✅ Docker support

Happy coding! 🚀

