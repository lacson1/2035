# Performance Monitoring Setup Guide

Complete guide for setting up performance monitoring and error tracking for the Physician Dashboard 2035 application.

## Overview

The application includes Sentry integration for error tracking and performance monitoring. This guide covers setup for both frontend and backend.

## Frontend Monitoring (Sentry)

### Setup

1. **Create Sentry Account**
   - Sign up at [sentry.io](https://sentry.io)
   - Create a new project (select React)
   - Copy your DSN

2. **Configure Environment Variable**
   ```bash
   # In .env file
   VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

3. **Verify Integration**
   - The Sentry SDK is already integrated in `src/utils/sentry.ts`
   - It automatically initializes when `VITE_SENTRY_DSN` is set
   - Only active in production builds

### Features

- ✅ **Error Tracking**: Automatic error capture
- ✅ **Performance Monitoring**: Transaction tracking
- ✅ **Session Replay**: User session recordings (10% sample rate)
- ✅ **Source Maps**: Full stack traces in production

### Usage

The Sentry integration is automatic. No code changes needed.

**Manual Error Reporting:**
```typescript
import * as Sentry from '@sentry/react';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

**Custom Context:**
```typescript
import * as Sentry from '@sentry/react';

Sentry.setUser({
  id: user.id,
  email: user.email,
  role: user.role,
});

Sentry.setTag('patient_id', patientId);
```

## Backend Monitoring

### Option 1: Sentry (Recommended)

1. **Install Sentry SDK**
   ```bash
   cd backend
   npm install @sentry/node @sentry/profiling-node
   ```

2. **Initialize Sentry** (add to `backend/src/app.ts`)
   ```typescript
   import * as Sentry from '@sentry/node';
   import { ProfilingIntegration } from '@sentry/profiling-node';

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     integrations: [
       new ProfilingIntegration(),
     ],
     tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
     profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
   });
   ```

3. **Add Error Handler** (update `backend/src/middleware/error.middleware.ts`)
   ```typescript
   import * as Sentry from '@sentry/node';

   export const errorHandler = (err, req, res, next) => {
     Sentry.captureException(err);
     // ... existing error handling
   };
   ```

4. **Add Environment Variable**
   ```bash
   # In backend/.env
   SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

### Option 2: Application Performance Monitoring (APM)

#### New Relic

1. **Install New Relic**
   ```bash
   cd backend
   npm install newrelic
   ```

2. **Create `newrelic.js`**
   ```javascript
   'use strict';
   exports.config = {
     app_name: ['Physician Dashboard 2035'],
     license_key: process.env.NEW_RELIC_LICENSE_KEY,
     logging: {
       level: 'info',
     },
   };
   ```

3. **Initialize** (add to top of `backend/src/app.ts`)
   ```typescript
   if (process.env.NEW_RELIC_LICENSE_KEY) {
     require('newrelic');
   }
   ```

#### Datadog

1. **Install Datadog APM**
   ```bash
   cd backend
   npm install dd-trace
   ```

2. **Initialize** (add to top of `backend/src/app.ts`)
   ```typescript
   if (process.env.DD_SERVICE) {
     require('dd-trace').init({
       service: process.env.DD_SERVICE || 'physician-dashboard',
       env: process.env.NODE_ENV,
     });
   }
   ```

## Metrics Collection

### Custom Metrics Middleware

The application includes a metrics middleware (`backend/src/middleware/metrics.middleware.ts`) that tracks:

- Request count
- Response times
- Error rates
- Endpoint usage

### Access Metrics

```bash
# Health check endpoint includes basic metrics
curl http://localhost:3000/health

# Dedicated metrics endpoint (if implemented)
curl http://localhost:3000/api/v1/metrics
```

## Logging

### Structured Logging

The application uses a custom logger (`backend/src/utils/logger.ts`) with:

- Log levels (debug, info, warn, error)
- Structured output
- Environment-aware formatting

### Log Aggregation

For production, consider:

1. **Winston** (already compatible)
   ```bash
   npm install winston
   ```

2. **LogRocket** (for frontend)
   ```bash
   npm install logrocket
   ```

3. **CloudWatch** (AWS)
   - Use AWS SDK to send logs

4. **Datadog Logs**
   - Use Datadog agent

## Performance Budgets

### Recommended Thresholds

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Total Blocking Time (TBT)**: < 200ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Monitoring

Add to `vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
```

## Alerting

### Sentry Alerts

1. Go to Sentry dashboard
2. Settings → Alerts
3. Create alert rules for:
   - Error rate spikes
   - Performance degradation
   - New error types

### Uptime Monitoring

Consider services:
- **UptimeRobot** (free tier available)
- **Pingdom**
- **StatusCake**

## Best Practices

### 1. Don't Log Sensitive Data

```typescript
// ❌ Bad
logger.error('User data:', { password: user.password });

// ✅ Good
logger.error('User login failed:', { userId: user.id });
```

### 2. Use Appropriate Log Levels

- **Debug**: Development-only information
- **Info**: General application flow
- **Warn**: Recoverable issues
- **Error**: Errors that need attention

### 3. Add Context to Errors

```typescript
Sentry.captureException(error, {
  tags: {
    endpoint: req.path,
    method: req.method,
  },
  extra: {
    userId: req.user?.id,
    patientId: req.params.patientId,
  },
});
```

### 4. Monitor Key Metrics

- API response times
- Database query performance
- Cache hit rates
- Error rates by endpoint
- User session duration

## Troubleshooting

### Sentry Not Capturing Errors

1. Check `VITE_SENTRY_DSN` is set correctly
2. Verify DSN format: `https://xxx@sentry.io/xxx`
3. Check browser console for Sentry initialization errors
4. Ensure you're in production build (`npm run build`)

### Performance Issues

1. Check Sentry Performance tab
2. Review slow transactions
3. Identify N+1 queries
4. Check cache hit rates
5. Review bundle size

## Cost Considerations

### Sentry

- **Free Tier**: 5,000 events/month
- **Team**: $26/month (50,000 events)
- **Business**: $80/month (unlimited events)

### New Relic

- **Free Tier**: Limited
- **Standard**: $99/month

### Datadog

- **Free Tier**: Limited
- **Pro**: $31/month per host

## Next Steps

1. ✅ Set up Sentry for frontend
2. ⏳ Set up Sentry for backend
3. ⏳ Configure alerting rules
4. ⏳ Set up uptime monitoring
5. ⏳ Review performance budgets
6. ⏳ Set up log aggregation

---

**Last Updated:** December 2024  
**Maintained By:** Development Team

