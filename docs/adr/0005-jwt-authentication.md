# ADR-0005: JWT Authentication with Refresh Tokens

**Status:** Accepted  
**Date:** 2025-11-09  
**Deciders:** Development Team  
**Supersedes:** None

## Context

We need a secure authentication mechanism that:
- Works with stateless API
- Supports token refresh
- Works across multiple domains (CORS)
- Is HIPAA-compliant

## Decision

We will use **JWT (JSON Web Tokens)** with **refresh tokens** stored in httpOnly cookies.

### Token Structure
- **Access Token**: Short-lived (15 minutes), stored in memory/state
- **Refresh Token**: Long-lived (7 days), stored in httpOnly cookie

## Alternatives Considered

1. **Session-based (cookies)**
   - Pros: Simple, server-side revocation
   - Cons: Requires server-side storage, not stateless

2. **OAuth 2.0 / OpenID Connect**
   - Pros: Industry standard, supports SSO
   - Cons: Complex setup, external dependency

3. **API Keys**
   - Pros: Simple
   - Cons: Not secure for user authentication

## Consequences

### Positive
- ✅ Stateless authentication
- ✅ Works well with microservices
- ✅ Refresh tokens in httpOnly cookies (CSRF protection)
- ✅ Access tokens in memory (XSS protection)
- ✅ No server-side session storage needed

### Negative
- ⚠️ Cannot revoke access tokens immediately (until expiry)
- ⚠️ Refresh token rotation not implemented (can be added)
- ⚠️ Requires careful token storage on client

### Mitigations
- Short access token lifetime (15 minutes)
- Refresh token stored in httpOnly cookie (secure)
- Access token in memory only (not localStorage)
- Session table for refresh token revocation if needed

## Implementation

```typescript
// Access token in state (not localStorage)
const [accessToken, setAccessToken] = useState<string | null>(null);

// Refresh token in httpOnly cookie (set by backend)
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
});
```

