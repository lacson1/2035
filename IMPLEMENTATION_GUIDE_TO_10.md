# Implementation Guide: Steps to 10/10

This guide provides **actionable, step-by-step instructions** with code examples to implement the critical improvements.

---

## 🚀 Phase 1: Critical Improvements (Start Here)

### 1.1 Comprehensive Testing Coverage

#### Step 1: Set Up Backend Test Infrastructure

**File**: `backend/vitest.config.ts` (create if doesn't exist)

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'prisma/',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### Step 2: Create Test Utilities

**File**: `backend/tests/utils/test-helpers.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

export async function setupTestDatabase() {
  // Reset database
  execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
  // Seed test data
  execSync('npx prisma db seed', { stdio: 'inherit' });
}

export async function cleanupTestDatabase() {
  await prisma.$disconnect();
}

export async function createTestUser(overrides = {}) {
  return prisma.user.create({
    data: {
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      role: 'physician',
      ...overrides,
    },
  });
}

export async function createTestPatient(overrides = {}) {
  return prisma.patient.create({
    data: {
      name: 'Test Patient',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Male',
      ...overrides,
    },
  });
}
```

#### Step 3: Write Service Tests

**File**: `backend/tests/unit/services/patients.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PatientsService } from '../../../src/services/patients.service';
import { setupTestDatabase, cleanupTestDatabase, createTestPatient } from '../../utils/test-helpers';

describe('PatientsService', () => {
  let service: PatientsService;

  beforeEach(async () => {
    await setupTestDatabase();
    service = new PatientsService();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('getPatients', () => {
    it('should return paginated patients', async () => {
      // Create test data
      await createTestPatient({ name: 'Patient 1' });
      await createTestPatient({ name: 'Patient 2' });

      const result = await service.getPatients({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it('should filter by search query', async () => {
      await createTestPatient({ name: 'John Doe' });
      await createTestPatient({ name: 'Jane Smith' });

      const result = await service.getPatients({ search: 'John' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('John Doe');
    });

    it('should filter by risk score', async () => {
      await createTestPatient({ name: 'Low Risk', riskScore: 20 });
      await createTestPatient({ name: 'High Risk', riskScore: 80 });

      const result = await service.getPatients({ risk: 'low' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Low Risk');
    });
  });

  describe('getPatientById', () => {
    it('should return patient by id', async () => {
      const patient = await createTestPatient({ name: 'Test Patient' });

      const result = await service.getPatientById(patient.id);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Patient');
    });

    it('should throw NotFoundError for invalid id', async () => {
      await expect(
        service.getPatientById('invalid-id')
      ).rejects.toThrow('Patient not found');
    });
  });
});
```

#### Step 4: Write Integration Tests

**File**: `backend/tests/integration/patients.api.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { createTestUser, createTestPatient } from '../utils/test-helpers';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config/env';

describe('Patients API', () => {
  let authToken: string;
  let testUserId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    testUserId = user.id;
    authToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret
    );
  });

  describe('GET /api/v1/patients', () => {
    it('should return patients list', async () => {
      await createTestPatient();

      const response = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.patients).toBeDefined();
      expect(Array.isArray(response.body.data.patients)).toBe(true);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/patients')
        .expect(401);
    });
  });

  describe('POST /api/v1/patients', () => {
    it('should create a new patient', async () => {
      const patientData = {
        name: 'New Patient',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
      };

      const response = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(patientData)
        .expect(201);

      expect(response.body.data.name).toBe('New Patient');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });
});
```

#### Step 5: Add Test Scripts

**Update**: `backend/package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run tests/integration",
    "test:unit": "vitest run tests/unit"
  }
}
```

---

### 1.2 Production Monitoring & Observability

#### Step 1: Set Up Structured Logging

**File**: `backend/src/utils/logger.ts` (enhance existing)

```typescript
import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'physician-dashboard-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Request ID tracking
export const logWithRequestId = (requestId: string) => {
  return logger.child({ requestId });
};
```

**Install**: `npm install winston`

#### Step 2: Add Request ID Middleware

**File**: `backend/src/middleware/requestId.middleware.ts` (new)

```typescript
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.headers['x-request-id'] as string || randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};
```

**Update**: `backend/src/app.ts`

```typescript
import { requestIdMiddleware } from './middleware/requestId.middleware';

// Add after body parsing
app.use(requestIdMiddleware);
```

#### Step 3: Configure Sentry Properly

**File**: `src/utils/sentry.ts` (enhance existing)

```typescript
import * as Sentry from '@sentry/react';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    if (import.meta.env.DEV) {
      console.warn('Sentry DSN not configured');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.Authorization;
      }
      return event;
    },
  });
}
```

**File**: `backend/src/utils/sentry.ts` (new)

```typescript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    integrations: [
      new ProfilingIntegration(),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}
```

**Install**: `npm install @sentry/node @sentry/profiling-node`

#### Step 4: Add Performance Monitoring

**File**: `backend/src/middleware/metrics.middleware.ts` (enhance existing)

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const requestId = req.id || 'unknown';

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    };

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', logData);
    }

    // Log metrics
    logger.info('Request completed', logData);
  });

  next();
};
```

---

### 1.3 Enhanced Error Handling

#### Step 1: Standardize Error Responses

**File**: `backend/src/utils/errors.ts` (enhance existing)

```typescript
export class AppError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;
  code?: string;
  requestId?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errors?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR', errors);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}
```

#### Step 2: Enhanced Error Middleware

**File**: `backend/src/middleware/error.middleware.ts` (enhance existing)

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.id || 'unknown';

  if (err instanceof AppError) {
    logger.warn('Application error', {
      requestId,
      error: err.message,
      code: err.code,
      statusCode: err.statusCode,
      path: req.path,
    });

    return res.status(err.statusCode).json({
      message: err.message,
      status: err.statusCode,
      code: err.code,
      errors: err.errors,
      requestId,
      timestamp: new Date().toISOString(),
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
  }

  // Unexpected error
  logger.error('Unexpected error', {
    requestId,
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    message: 'Internal server error',
    status: 500,
    code: 'INTERNAL_ERROR',
    requestId,
    timestamp: new Date().toISOString(),
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};
```

#### Step 3: Frontend Error Boundary Enhancement

**File**: `src/components/ErrorBoundary.tsx` (enhance existing)

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

### 1.4 Security Hardening

#### Step 1: Add Security Headers

**File**: `backend/src/middleware/security.middleware.ts` (new)

```typescript
import { Request, Response, NextFunction } from 'express';

export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  next();
};
```

**Update**: `backend/src/app.ts`

```typescript
import { securityHeaders } from './middleware/security.middleware';

// Add after helmet
app.use(securityHeaders);
```

#### Step 2: Enhanced Input Validation

**File**: `backend/src/middleware/validate.middleware.ts` (new)

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;
      
      next();
    } catch (error: any) {
      if (error.errors) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((err: any) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });
        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};
```

**Usage Example**:

```typescript
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const createPatientSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    dateOfBirth: z.string().datetime(),
    gender: z.enum(['Male', 'Female', 'Other']),
  }),
});

router.post('/', authenticate, validate(createPatientSchema), patientsController.createPatient);
```

---

## 🎯 Quick Wins Implementation

### Fix TODOs

#### 1. Audit Controller TODO

**File**: `backend/src/controllers/audit.controller.ts`

```typescript
// Replace TODO with:
async getPatientAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { patientId } = req.params;
    
    // Check if user has access to this patient
    const hasAccess = await this.checkPatientAccess(req.user!.userId, patientId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this patient');
    }
    
    // ... rest of implementation
  } catch (error) {
    next(error);
  }
}

private async checkPatientAccess(userId: string, patientId: string): Promise<boolean> {
  // Check if user is in care team or has admin role
  const careTeam = await prisma.careTeamAssignment.findFirst({
    where: {
      patientId,
      userId,
      isActive: true,
    },
  });
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  return !!careTeam || user?.role === 'admin';
}
```

#### 2. Consultation Component TODO

**File**: `src/components/Consultation.tsx`

```typescript
import { useAuth } from '../context/AuthContext';

// In component:
const { user } = useAuth();

// Replace TODO with:
providerId: user?.id || '',
```

#### 3. Email Service TODO

**File**: `backend/src/services/email.service.ts`

```typescript
/**
 * Email Service
 * 
 * To integrate with an email provider:
 * 1. Install provider SDK (e.g., @sendgrid/mail, aws-sdk for SES)
 * 2. Set environment variables:
 *    - EMAIL_PROVIDER (sendgrid|ses|smtp)
 *    - EMAIL_API_KEY (for SendGrid/SES)
 *    - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (for SMTP)
 * 3. Update sendEmail method to use provider
 * 
 * Example SendGrid integration:
 * import sgMail from '@sendgrid/mail';
 * sgMail.setApiKey(process.env.EMAIL_API_KEY!);
 * await sgMail.send({ to, from, subject, html });
 */
```

---

## 📊 Testing Checklist

- [ ] Backend unit tests: 90%+ coverage
- [ ] Backend integration tests: All endpoints covered
- [ ] Frontend component tests: All components tested
- [ ] E2E tests: Critical flows covered
- [ ] Performance tests: API response times <100ms
- [ ] Security tests: Authentication/authorization tested

---

## 🚀 Next Steps

1. **Start with Quick Wins** (1-2 days)
2. **Set up testing infrastructure** (2-3 days)
3. **Implement monitoring** (2-3 days)
4. **Enhance error handling** (1-2 days)
5. **Security hardening** (2-3 days)

**Total Estimated Time**: 2-3 weeks for Phase 1

---

*This guide provides concrete, actionable steps. Start with Quick Wins for immediate impact!*
