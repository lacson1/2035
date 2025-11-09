# System Architecture Documentation

**Last Updated:** November 2025  
**Version:** 1.0

---

## Overview

Physician Dashboard 2035 is a full-stack healthcare management system built with modern web technologies. This document provides a comprehensive overview of the system architecture.

---

## High-Level Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│   React SPA     │◄───────►│   Express API   │◄───────►│   PostgreSQL    │
│   (Frontend)    │  HTTP   │   (Backend)     │  SQL    │   (Database)    │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                      │
                                      │
                            ┌─────────┴─────────┐
                            │                   │
                            ▼                   ▼
                      ┌──────────┐      ┌──────────┐
                      │  Redis    │      │  Sentry  │
                      │  (Cache)  │      │ (Errors) │
                      └──────────┘      └──────────┘
```

---

## Frontend Architecture

### Technology Stack
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Routing:** React Router (client-side)
- **HTTP Client:** Fetch API with custom wrapper

### Architecture Pattern
- **Component-Based:** Reusable, composable components
- **Context API:** Global state management
- **Service Layer:** Centralized API communication
- **Custom Hooks:** Reusable logic extraction

### Key Directories
```
src/
├── components/     # Reusable UI components
├── pages/          # Page-level components
├── context/        # React contexts (Auth, Dashboard, etc.)
├── services/       # API service layer
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
└── types.ts        # TypeScript type definitions
```

### State Management Flow
```
User Action → Component → Context/Service → API → Backend
                ↓                              ↓
            UI Update                    Response Handling
```

---

## Backend Architecture

### Technology Stack
- **Runtime:** Node.js with Express
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Cache:** Redis (optional)
- **Authentication:** JWT with refresh tokens

### Architecture Pattern
**Layered Architecture:**
```
Routes → Controllers → Services → Database
```

### Key Directories
```
backend/src/
├── routes/         # API route definitions
├── controllers/    # Request/response handling
├── services/       # Business logic
├── middleware/     # Cross-cutting concerns
├── config/         # Configuration
├── utils/          # Utility functions
└── types/          # TypeScript types
```

### Middleware Stack
1. **Sentry** - Error tracking
2. **Helmet** - Security headers
3. **CORS** - Cross-origin resource sharing
4. **Body Parser** - Request body parsing
5. **Cookie Parser** - Cookie handling
6. **Sanitize** - Input sanitization
7. **Rate Limiting** - API rate limiting
8. **Metrics** - Request metrics collection
9. **Authentication** - JWT verification
10. **Audit** - HIPAA-compliant logging
11. **Error Handler** - Centralized error handling

---

## Database Architecture

### Database System
- **Type:** PostgreSQL (relational database)
- **ORM:** Prisma
- **Migrations:** Prisma Migrate

### Schema Design
- **Normalized:** 3NF (Third Normal Form)
- **Relationships:** Foreign keys with proper constraints
- **Indexes:** On frequently queried columns
- **Audit Trail:** AuditLog table for HIPAA compliance

### Key Models
- `User` - System users (physicians, nurses, etc.)
- `Patient` - Patient records
- `Medication` - Medications
- `Appointment` - Appointments
- `ClinicalNote` - Clinical notes
- `AuditLog` - Audit trail
- And 20+ more models

---

## Authentication & Authorization

### Authentication Flow
```
1. User submits credentials
2. Backend validates credentials
3. Backend generates JWT tokens:
   - Access token (15 min, in response)
   - Refresh token (7 days, in httpOnly cookie)
4. Frontend stores access token in state
5. Frontend includes access token in API requests
6. On token expiry, frontend uses refresh token
7. Backend validates refresh token and issues new access token
```

### Authorization
- **Role-Based Access Control (RBAC):**
  - `admin` - Full access
  - `physician` - Clinical access
  - `nurse` - Limited clinical access
  - `read_only` - Read-only access

- **Permission System:**
  - Dynamic permissions per role
  - Granular access control
  - Permission checks in middleware

---

## API Design

### RESTful Principles
- **Resources:** Nouns (patients, medications, etc.)
- **HTTP Methods:** GET, POST, PUT, DELETE, PATCH
- **Status Codes:** Proper HTTP status codes
- **Versioning:** `/api/v1/` prefix

### Response Format
```json
{
  "data": { ... },
  "message": "Success message",
  "errors": { ... }
}
```

### Error Handling
- **Structured Errors:** Consistent error format
- **Status Codes:** Appropriate HTTP status codes
- **Error Logging:** Sentry integration
- **User-Friendly Messages:** Sanitized error messages

---

## Caching Strategy

### Redis Caching
- **Purpose:** Performance optimization
- **Cache Keys:** Resource-based (e.g., `patient:${id}`)
- **TTL:** Varies by resource type
  - Patient list: 5 minutes
  - Patient detail: 10 minutes
  - User list: 5 minutes

### Cache Invalidation
- **Write-Through:** Update cache on write
- **TTL-Based:** Automatic expiration
- **Manual Invalidation:** On critical updates

---

## Security Architecture

### Security Layers
1. **Network:** HTTPS/TLS
2. **Application:** Helmet.js security headers
3. **Authentication:** JWT with httpOnly cookies
4. **Authorization:** RBAC + permissions
5. **Input Validation:** Sanitization middleware
6. **Rate Limiting:** API rate limiting
7. **Audit Logging:** HIPAA-compliant audit trail

### HIPAA Compliance
- **Audit Logging:** All patient data access logged
- **Encryption:** Data in transit (TLS) and at rest
- **Access Control:** Role-based with permissions
- **Data Integrity:** Database constraints and validation

---

## Deployment Architecture

### Frontend
- **Platform:** Vercel (or similar)
- **Build:** Static files (Vite build)
- **CDN:** Automatic via Vercel
- **Environment:** Production/Staging

### Backend
- **Platform:** Fly.io (or similar)
- **Runtime:** Node.js
- **Database:** Managed PostgreSQL
- **Cache:** Redis (optional)

### CI/CD
- **GitHub Actions:** Automated testing and deployment
- **Workflows:**
  - CI: Lint, type check, tests
  - Testing: Frontend, backend, E2E
  - Deployment: Automated on merge

---

## Monitoring & Observability

### Health Checks
- `/health` - Basic health check
- `/health/detailed` - Detailed health with dependencies
- `/health/ready` - Readiness probe
- `/health/live` - Liveness probe

### Metrics
- `/api/v1/metrics` - Application metrics (admin only)
- Request counts, response times, error rates
- Database and cache statistics
- System resource usage

### Logging
- **Structured Logging:** Winston logger
- **Error Tracking:** Sentry integration
- **Audit Logs:** Database-stored audit trail

---

## Data Flow

### Patient Data Flow
```
1. User requests patient list
2. Frontend calls API service
3. API service checks cache
4. If cache miss, query database
5. Cache result
6. Return to frontend
7. Frontend updates UI
```

### Authentication Flow
```
1. User submits login form
2. Frontend sends credentials to API
3. Backend validates credentials
4. Backend generates tokens
5. Backend sets refresh token cookie
6. Backend returns access token
7. Frontend stores access token
8. Frontend redirects to dashboard
```

---

## Scalability Considerations

### Current Architecture
- **Stateless Backend:** Horizontal scaling ready
- **Database Connection Pooling:** Prisma handles
- **Caching:** Redis for performance
- **CDN:** Static assets via Vercel

### Future Scalability
- **Microservices:** Can split by domain
- **Database Sharding:** If needed
- **Load Balancing:** Multiple backend instances
- **Caching:** Expand Redis usage

---

## Technology Decisions

See [Architecture Decision Records (ADRs)](./adr/) for detailed decisions:
- [ADR-0002: Layered Architecture](./adr/0002-layered-architecture.md)
- [ADR-0003: Prisma ORM Choice](./adr/0003-prisma-orm-choice.md)
- [ADR-0004: React Context API](./adr/0004-react-context-api-state-management.md)
- [ADR-0005: JWT Authentication](./adr/0005-jwt-authentication.md)

---

## References

- [System Longevity Plan](../SYSTEM_LONGEVITY_PLAN.md)
- [API Documentation](../API_ENDPOINTS.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security Audit](../SECURITY_AUDIT.md)

---

**Last Updated:** November 2025

