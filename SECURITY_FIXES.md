# Security Fixes - Implementation Guide

Quick fixes for the security issues identified in the audit.

## 🔴 Critical Fix #1: Token Storage

### Option A: Use httpOnly Cookies (Most Secure)

**Backend Changes** (`backend/src/services/auth.service.ts`):

```typescript
// Update login method to set httpOnly cookie
async login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{
  tokens: AuthTokens;
  user: any;
}> {
  // ... existing login logic ...
  
  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth',
  });
  
  // Return only access token (short-lived)
  return {
    tokens: { accessToken: tokens.accessToken }, // Don't return refresh token
    user: userWithoutPassword,
  };
}
```

**Frontend Changes** (`src/services/api.ts`):

```typescript
// Remove localStorage token management
// Tokens are now in httpOnly cookies (refresh) and memory (access)

// Update token refresh logic
if (response.status === 401 && retry) {
  // Refresh token is in httpOnly cookie, backend handles it
  const refreshResponse = await fetch(`${this.baseURL}/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (refreshResponse.ok) {
    const refreshData = await refreshResponse.json();
    const newToken = refreshData.data?.accessToken || refreshData.accessToken;
    // Store access token in memory (not localStorage)
    this.accessToken = newToken; // Class property
    // Retry original request
    return this.request<T>(endpoint, options, false);
  }
}
```

**Update Auth Context** (`src/context/AuthContext.tsx`):

```typescript
// Remove localStorage.getItem('authToken')
// Store access token in memory/state only
// Refresh token is in httpOnly cookie (handled by backend)

const login = async (email: string, password: string) => {
  const response = await fetch(`${apiBaseUrl}/v1/auth/login`, {
    method: 'POST',
    credentials: 'include', // Include cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  // Store access token in state only (not localStorage)
  setAccessToken(data.data.accessToken);
  setUser(data.data.user);
};
```

---

### Option B: Use sessionStorage (Quick Fix)

**Frontend Changes** (`src/services/api.ts`):

```typescript
// Replace localStorage with sessionStorage
const token = sessionStorage.getItem('authToken'); // Changed from localStorage

// On login
sessionStorage.setItem('authToken', token); // Changed from localStorage

// On logout
sessionStorage.removeItem('authToken'); // Changed from localStorage
```

**Pros**: 
- Quick fix (5 minutes)
- Tokens cleared when tab closes
- Less persistent than localStorage

**Cons**:
- Still vulnerable to XSS
- Tokens lost on tab close (user experience issue)

---

## 🟡 Medium Fix #1: CSRF Protection

### Add SameSite Cookies

**Backend** (`backend/src/routes/auth.routes.ts`):

```typescript
// Update refresh token cookie setting
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict', // Add this
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
});
```

**That's it!** SameSite='strict' prevents CSRF attacks.

---

## 🟡 Medium Fix #2: Redact Sensitive Data from Logs

**Backend** (`backend/src/middleware/error.middleware.ts`):

```typescript
import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config/env';

// Helper to redact sensitive fields
const redactSensitiveData = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveFields = ['password', 'passwordHash', 'passwordConfirm', 'ssn', 'creditCard'];
  const redacted = { ...obj };
  
  for (const key in redacted) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }
  
  return redacted;
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Capture exception in Sentry (only for unexpected errors)
  if (!(err instanceof AppError) && process.env.SENTRY_DSN) {
    // Don't log body for auth endpoints
    const isAuthEndpoint = req.path.includes('/auth/');
    const bodyToLog = isAuthEndpoint ? undefined : redactSensitiveData(req.body);
    
    Sentry.captureException(err, {
      tags: {
        endpoint: req.path,
        method: req.method,
      },
      extra: {
        userId: (req as any).user?.id,
        body: bodyToLog, // Redacted or undefined for auth
        query: req.query,
      },
    });
  }
  
  // ... rest of error handler
};
```

---

## 🟡 Medium Fix #3: Strengthen Password Requirements

**Backend** (`backend/src/routes/auth.routes.ts`):

```typescript
import { body } from 'express-validator';

// Add password validation with complexity
const passwordValidation = [
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain at least one special character'),
];

// Use in routes
router.post('/register', passwordValidation, controller.register);
router.post('/reset-password', passwordValidation, controller.resetPassword);
```

**Frontend** (`src/components/Login.tsx` or password input component):

```typescript
// Add password strength meter
const getPasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

// Show strength indicator
const strength = getPasswordStrength(password);
const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
```

---

## 📋 Implementation Priority

1. **🔴 CRITICAL**: Fix token storage (Option A or B)
2. **🟡 MEDIUM**: Add SameSite cookies (5 minutes)
3. **🟡 MEDIUM**: Redact sensitive data from logs (15 minutes)
4. **🟡 MEDIUM**: Strengthen password requirements (30 minutes)

**Total Time**: 1-4 hours depending on which token storage option you choose.

---

## ✅ Testing Checklist

After implementing fixes:

- [ ] Test login flow (tokens work correctly)
- [ ] Test token refresh (refresh token in cookie)
- [ ] Test logout (tokens cleared)
- [ ] Test error logging (no passwords in Sentry)
- [ ] Test password validation (complexity requirements)
- [ ] Test CSRF protection (can't make requests from other domains)

---

**Last Updated**: December 2024

