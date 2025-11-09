# CI/CD Workflows Documentation

This directory contains all GitHub Actions workflows for the Physician Dashboard 2035 application.

## 📋 Available Workflows

### 1. **CI** (`ci.yml`)
**Purpose:** Basic continuous integration pipeline  
**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**
- `test` - Runs linter, type check, and unit tests
- `build` - Builds the application
- `e2e` - Runs end-to-end tests with Playwright

**Status:** ✅ Active

---

### 2. **Test Coverage** (`test-coverage.yml`)
**Purpose:** Generates and reports test coverage  
**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual dispatch

**Jobs:**
- `coverage` - Runs frontend and backend tests with coverage, uploads to Codecov

**Features:**
- PostgreSQL service for backend tests
- Coverage reports uploaded to Codecov
- Coverage artifacts retained for 30 days

**Status:** ✅ Active

---

### 3. **Deploy** (`deploy.yml`)
**Purpose:** Deploy application to production  
**Triggers:**
- Push to `main` or `cursor/run-application-a271` branches
- Manual dispatch (requires admin access and "DEPLOY" confirmation)

**Jobs:**
- `validate-admin` - Validates admin/write permissions
- `deploy-backend` - Deploys backend to Render
- `deploy-frontend` - Deploys frontend to Vercel
- `notify` - Deployment status notification

**Security:**
- Requires admin/write permissions for manual dispatch
- Requires "DEPLOY" confirmation input

**Status:** ✅ Active

---

### 4. **Enhanced CI/CD** (`ci-enhanced.yml`)
**Purpose:** Comprehensive CI/CD pipeline with security scans and deployments  
**Triggers:**
- Push to `main`, `develop`, or `staging` branches
- Pull requests to `main`, `develop`, or `staging`
- Manual dispatch

**Jobs:**
- `security-scan` - Security audit, code quality, secret scanning
- `test` - Full test suite (unit, backend, E2E)
- `build-and-push` - Builds and pushes Docker images (main/staging only)
- `deploy-staging` - Deploys to staging environment
- `deploy-production` - Deploys to production (main only)

**Features:**
- GitLeaks secret scanning
- Docker image building and pushing
- Staging and production deployments
- Health checks after deployment

**Status:** ✅ Active

---

### 5. **Blue-Green Deployment** (`blue-green-deploy.yml`)
**Purpose:** Zero-downtime blue-green deployments  
**Triggers:**
- Manual dispatch only

**Features:**
- Blue-green deployment strategy
- Traffic switching between environments
- Rollback capability

**Status:** ✅ Active (requires load balancer setup)

---

### 6. **Rollback** (`rollback.yml`)
**Purpose:** Emergency rollback to previous deployment  
**Triggers:**
- Manual dispatch only

**Features:**
- Rollback to specific commit SHA
- Rollback to previous deployment
- Slack notifications (if configured)
- Deployment status tracking

**Status:** ✅ Active

---

### 7. **Database Backup** (`backup-database.yml`)
**Purpose:** Automated database backups  
**Triggers:**
- Daily at 2:00 AM UTC (cron)
- Manual dispatch

**Features:**
- Automated daily backups
- Manual backup trigger
- Backup to S3 (if configured)

**Status:** ✅ Active

---

### 8. **Testing** (`testing.yml`)
**Purpose:** Comprehensive testing pipeline  
**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**
- `lint` - Code linting
- `type-check` - TypeScript type checking
- `unit-tests` - Unit tests
- `integration-tests` - Integration tests
- `e2e-tests` - End-to-end tests
- `test-summary` - Test results summary (PR only)

**Status:** ✅ Active

---

## 🔧 Workflow Selection Guide

### For Development
- **CI** (`ci.yml`) - Quick feedback on code changes
- **Testing** (`testing.yml`) - Comprehensive test suite

### For Pull Requests
- **CI** (`ci.yml`) - Basic validation
- **Test Coverage** (`test-coverage.yml`) - Coverage reporting
- **Testing** (`testing.yml`) - Full test suite

### For Staging Deployment
- **Enhanced CI/CD** (`ci-enhanced.yml`) - Full pipeline with staging deployment

### For Production Deployment
- **Deploy** (`deploy.yml`) - Simple production deployment
- **Enhanced CI/CD** (`ci-enhanced.yml`) - Full pipeline with production deployment
- **Blue-Green Deploy** (`blue-green-deploy.yml`) - Zero-downtime deployment

### For Emergency Situations
- **Rollback** (`rollback.yml`) - Quick rollback to previous version

### For Maintenance
- **Database Backup** (`backup-database.yml`) - Automated backups

---

## 🔐 Required Secrets

### Render
- `RENDER_API_KEY` - Render API key
- `RENDER_SERVICE_ID` - Backend service ID
- `RENDER_PRODUCTION_SERVICE_ID` - Production service ID (optional)
- `RENDER_STAGING_SERVICE_ID` - Staging service ID (optional)

### Vercel
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `VERCEL_PRODUCTION_ORG_ID` - Production org ID (optional)
- `VERCEL_PRODUCTION_PROJECT_ID` - Production project ID (optional)
- `VERCEL_STAGING_ORG_ID` - Staging org ID (optional)
- `VERCEL_STAGING_PROJECT_ID` - Staging project ID (optional)

### Codecov (Optional)
- `CODECOV_TOKEN` - Codecov upload token

### Database Backup (Optional)
- `AWS_ACCESS_KEY_ID` - AWS access key for S3
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for S3
- `BACKUP_S3_BUCKET` - S3 bucket name

### Health Checks (Optional)
- `PRODUCTION_BACKEND_URL` - Production backend URL
- `PRODUCTION_FRONTEND_URL` - Production frontend URL
- `STAGING_BACKEND_URL` - Staging backend URL
- `STAGING_FRONTEND_URL` - Staging frontend URL

---

## 📊 Workflow Status

| Workflow | Status | Last Run | Frequency |
|----------|--------|----------|-----------|
| CI | ✅ Active | - | On push/PR |
| Test Coverage | ✅ Active | - | On push/PR |
| Deploy | ✅ Active | - | Manual/Push to main |
| Enhanced CI/CD | ✅ Active | - | On push/PR |
| Blue-Green Deploy | ✅ Active | - | Manual |
| Rollback | ✅ Active | - | Manual |
| Database Backup | ✅ Active | - | Daily 2 AM UTC |
| Testing | ✅ Active | - | On push/PR |

---

## 🚀 Quick Start

### Running Tests Locally
```bash
# Frontend tests
npm run test:coverage

# Backend tests
cd backend && npm run test:coverage

# E2E tests
npm run test:e2e
```

### Manual Deployment
1. Go to GitHub Actions
2. Select "Deploy Application" workflow
3. Click "Run workflow"
4. Type "DEPLOY" in confirmation
5. Click "Run workflow"

### Manual Rollback
1. Go to GitHub Actions
2. Select "Rollback" workflow
3. Click "Run workflow"
4. Select environment
5. Enter commit SHA (or leave empty for previous)
6. Enter reason
7. Type "ROLLBACK" in confirmation
8. Click "Run workflow"

---

## 🔍 Troubleshooting

### Workflow Fails
1. Check workflow logs in GitHub Actions
2. Verify all required secrets are set
3. Check environment variables in deployment platforms
4. Verify database connectivity for tests

### Deployment Issues
1. Verify Render/Vercel API keys are correct
2. Check service IDs match your Render services
3. Ensure environment variables are set in deployment platforms
4. Check deployment logs in Render/Vercel dashboards

### Test Failures
1. Check test logs for specific failures
2. Verify database is accessible (for integration tests)
3. Check for flaky tests (may need retry logic)
4. Verify all dependencies are installed

---

## 📝 Notes

- All workflows use Node.js 18
- PostgreSQL 14/15 is used for testing
- Coverage reports are uploaded to Codecov (if token is set)
- E2E tests use Playwright
- Docker images are pushed to GitHub Container Registry (if enabled)

---

**Last Updated:** November 2025

