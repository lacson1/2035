# Backend & Full-Stack Implementation Plan

## Executive Summary

This document outlines the comprehensive plan for transitioning from a frontend-only application to a full-stack healthcare dashboard system. The plan includes backend architecture, database design, API design, authentication, and integration strategy.

---

## 1. Technology Stack Recommendations

### Option A: Node.js/Express (Recommended for Quick Start)
**Pros:**
- JavaScript/TypeScript consistency across stack
- Large ecosystem and community
- Fast development
- Easy integration with existing frontend

**Tech Stack:**
- **Runtime:** Node.js 18+
- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL (primary) + Redis (caching/sessions)
- **ORM:** Prisma or TypeORM
- **Authentication:** JWT + bcrypt
- **Validation:** Zod (already in use)
- **API Documentation:** Swagger/OpenAPI

### Option B: Python/FastAPI (Alternative)
**Pros:**
- Excellent for data science/ML features
- Strong type safety
- Auto-generated API docs
- Great for healthcare data processing

**Tech Stack:**
- **Framework:** FastAPI
- **Database:** PostgreSQL + SQLAlchemy
- **Authentication:** JWT + passlib
- **Validation:** Pydantic

### Option C: Go/Gin (High Performance)
**Pros:**
- Excellent performance
- Strong concurrency
- Small memory footprint

**Tech Stack:**
- **Framework:** Gin or Fiber
- **Database:** PostgreSQL + GORM
- **Authentication:** JWT + bcrypt

**Recommendation:** **Option A (Node.js/Express)** for fastest development and consistency with existing TypeScript codebase.

---

## 2. Database Schema Design

### Core Entities

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL, -- enum: admin, physician, nurse, etc.
  specialty VARCHAR(100),
  department VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
```

#### Patients Table
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) NOT NULL,
  age INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(date_of_birth))) STORED,
  blood_pressure VARCHAR(10), -- e.g., "138/86"
  condition VARCHAR(100),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  address TEXT,
  email VARCHAR(255),
  phone VARCHAR(20),
  preferred_language VARCHAR(50) DEFAULT 'English',
  
  -- Emergency Contact (JSONB or separate table)
  emergency_contact JSONB,
  
  -- Insurance (JSONB or separate table)
  insurance JSONB,
  
  -- Complex nested data as JSONB
  allergies TEXT[],
  family_history TEXT[],
  pharmacogenomics JSONB,
  social_determinants JSONB,
  lifestyle JSONB,
  immunizations JSONB,
  advanced_directives JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_condition ON patients(condition);
CREATE INDEX idx_patients_risk ON patients(risk_score);
CREATE INDEX idx_patients_created_at ON patients(created_at DESC);
```

#### Medications Table
```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Discontinued', 'Historical', 'Archived')),
  started_date DATE NOT NULL,
  instructions TEXT,
  prescribed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_medications_patient ON medications(patient_id);
CREATE INDEX idx_medications_status ON medications(status);
```

#### Appointments Table
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type VARCHAR(50) NOT NULL,
  provider_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  consultation_type VARCHAR(20) CHECK (consultation_type IN ('general', 'specialty')),
  specialty VARCHAR(50),
  duration INTEGER, -- minutes
  location VARCHAR(50),
  reason TEXT,
  referral_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_provider ON appointments(provider_id);
CREATE INDEX idx_appointments_status ON appointments(status);
```

#### Clinical Notes Table
```sql
CREATE TABLE clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  consultation_type VARCHAR(20),
  specialty VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_clinical_notes_patient ON clinical_notes(patient_id);
CREATE INDEX idx_clinical_notes_author ON clinical_notes(author_id);
CREATE INDEX idx_clinical_notes_date ON clinical_notes(date DESC);
```

#### Imaging Studies Table
```sql
CREATE TABLE imaging_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  modality VARCHAR(20) NOT NULL CHECK (modality IN ('CT', 'MRI', 'X-Ray', 'Ultrasound', 'PET')),
  body_part VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  findings TEXT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'pending', 'cancelled')),
  report_url TEXT,
  ordering_physician_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_imaging_patient ON imaging_studies(patient_id);
CREATE INDEX idx_imaging_date ON imaging_studies(date DESC);
```

#### Timeline Events Table
```sql
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('appointment', 'note', 'medication', 'imaging', 'lab')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  related_entity_type VARCHAR(50), -- 'appointment', 'note', etc.
  related_entity_id UUID, -- ID of related appointment/note/etc.
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timeline_patient ON timeline_events(patient_id);
CREATE INDEX idx_timeline_date ON timeline_events(date DESC);
```

#### Care Team Assignments Table
```sql
CREATE TABLE care_team_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL,
  specialty VARCHAR(100),
  assigned_date DATE NOT NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(patient_id, user_id)
);

CREATE INDEX idx_care_team_patient ON care_team_assignments(patient_id);
CREATE INDEX idx_care_team_user ON care_team_assignments(user_id);
```

#### Permissions & Roles
```sql
CREATE TABLE role_permissions (
  role VARCHAR(50) PRIMARY KEY,
  permissions JSONB NOT NULL, -- Array of permission strings
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20)
);

-- Insert default roles
INSERT INTO role_permissions (role, permissions, name, description, color) VALUES
('admin', '["view_patients", "edit_patients", "delete_patients", "manage_users", "manage_settings"]', 'Administrator', 'Full system access', 'red'),
('physician', '["view_patients", "edit_patients", "view_medications", "prescribe_medications", "view_notes", "create_notes", "edit_notes", "view_appointments", "schedule_appointments"]', 'Physician', 'Full clinical access', 'blue'),
-- ... more roles
```

---

## 3. API Architecture

### Base Structure
```
/api
  /v1
    /auth
      POST /login
      POST /logout
      POST /refresh
      GET  /me
    /users
      GET    /users
      GET    /users/:id
      POST   /users
      PUT    /users/:id
      DELETE /users/:id
      GET    /users/:id/permissions
    /patients
      GET    /patients
      GET    /patients/:id
      POST   /patients
      PUT    /patients/:id
      PATCH  /patients/:id
      DELETE /patients/:id
      GET    /patients/:id/medications
      POST   /patients/:id/medications
      PUT    /patients/:id/medications/:medId
      DELETE /patients/:id/medications/:medId
      GET    /patients/:id/appointments
      POST   /patients/:id/appointments
      PUT    /patients/:id/appointments/:aptId
      DELETE /patients/:id/appointments/:aptId
      GET    /patients/:id/notes
      POST   /patients/:id/notes
      PUT    /patients/:id/notes/:noteId
      DELETE /patients/:id/notes/:noteId
      GET    /patients/:id/imaging
      POST   /patients/:id/imaging
      GET    /patients/:id/timeline
      GET    /patients/:id/care-team
      POST   /patients/:id/care-team
      DELETE /patients/:id/care-team/:memberId
      GET    /patients/search?q=...
    /appointments
      GET    /appointments
      GET    /appointments/:id
      POST   /appointments
      PUT    /appointments/:id
      DELETE /appointments/:id
    /vitals
      GET    /patients/:id/vitals
      POST   /patients/:id/vitals
    /telemedicine
      POST   /sessions
      GET    /sessions/:id
      POST   /sessions/:id/end
    /consultations
      GET    /consultations
      GET    /consultations/:id
      POST   /consultations
      PUT    /consultations/:id
```

### Response Format
```typescript
{
  data: T,
  message?: string,
  errors?: string[],
  meta?: {
    page?: number,
    limit?: number,
    total?: number,
    totalPages?: number
  }
}
```

### Error Format
```typescript
{
  message: string,
  status: number,
  errors?: Record<string, string[]>,
  timestamp: string
}
```

---

## 4. Authentication & Authorization

### Authentication Flow
1. **Login:** POST `/api/v1/auth/login`
   - Body: `{ email, password }`
   - Returns: `{ accessToken, refreshToken, user }`
   - Sets HTTP-only cookie for refresh token

2. **Token Refresh:** POST `/api/v1/auth/refresh`
   - Uses refresh token from cookie
   - Returns new access token

3. **Logout:** POST `/api/v1/auth/logout`
   - Invalidates refresh token

### Authorization Middleware
```typescript
// Role-based access control
const requireRole = (...roles: UserRole[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

// Permission-based access control
const requirePermission = (...permissions: Permission[]) => {
  return async (req, res, next) => {
    const userPermissions = await getUserPermissions(req.user.id);
    if (!permissions.every(p => userPermissions.includes(p))) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
```

### Security Considerations
- **Password Hashing:** bcrypt with salt rounds = 12
- **JWT:** Access tokens (15 min), Refresh tokens (7 days)
- **HTTPS:** Required in production
- **CORS:** Configured for frontend origin only
- **Rate Limiting:** Express-rate-limit
- **Input Validation:** Zod schemas
- **SQL Injection:** ORM parameterized queries
- **XSS:** Input sanitization
- **Audit Logging:** Track all patient data access/modifications (HIPAA compliance)

---

## 5. Backend Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── env.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── patients.controller.ts
│   │   ├── users.controller.ts
│   │   ├── appointments.controller.ts
│   │   └── clinical-notes.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── rate-limit.middleware.ts
│   ├── models/
│   │   ├── User.model.ts
│   │   ├── Patient.model.ts
│   │   ├── Medication.model.ts
│   │   └── ...
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── patients.routes.ts
│   │   └── users.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── patients.service.ts
│   │   ├── permissions.service.ts
│   │   └── audit.service.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   └── validation.ts
│   ├── types/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── app.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 6. Database Migration Strategy

### Phase 1: Initial Setup
1. Create database schema
2. Seed default roles and permissions
3. Create initial admin user
4. Import existing mock data (patients, users)

### Phase 2: Data Migration Script
```typescript
// scripts/migrate-mock-data.ts
import { patients } from '../frontend/src/data/patients';
import { users } from '../frontend/src/data/users';
import { prisma } from '../src/config/database';

async function migrateData() {
  // 1. Migrate users with hashed passwords
  // 2. Migrate patients
  // 3. Migrate related entities (medications, appointments, etc.)
  // 4. Generate timeline events from existing data
}
```

---

## 7. Frontend-Backend Integration

### Environment Configuration
```bash
# .env
VITE_API_BASE_URL=http://localhost:3000/api
```

### API Client Updates
The existing `src/services/api.ts` is already prepared! Just need to:
1. Update `VITE_API_BASE_URL` in `.env`
2. Implement authentication flow in frontend
3. Update services to remove mock data fallbacks

### Authentication Context
```typescript
// src/context/AuthContext.tsx (new)
- Login/logout functions
- Token refresh logic
- Protected route wrapper
- User session management
```

### Migration Steps
1. **Phase 1:** Backend runs alongside frontend (both use mock data)
2. **Phase 2:** Backend ready, frontend switches to API calls (feature flag)
3. **Phase 3:** Remove all mock data, fully integrated

---

## 8. Testing Strategy

### Backend Testing
- **Unit Tests:** Services, utilities, middleware
- **Integration Tests:** API endpoints
- **E2E Tests:** Full user flows
- **Database Tests:** Seed, test, cleanup

### Tools
- **Jest** or **Vitest** for unit/integration
- **Supertest** for API testing
- **Playwright** for E2E (already in use)

---

## 9. Deployment Considerations

### Development
- Docker Compose for local development
  - PostgreSQL container
  - Redis container
  - Backend API container
  - Frontend container (or run separately)

### Production
- **Backend:** Node.js on AWS/GCP/Azure or containerized
- **Database:** Managed PostgreSQL (AWS RDS, Google Cloud SQL)
- **Caching:** Redis (ElastiCache, Cloud Memorystore)
- **CDN:** CloudFront/Cloudflare for frontend
- **Load Balancer:** For multiple backend instances

### Environment Variables
```bash
# Backend .env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CORS_ORIGIN=https://yourdomain.com
```

---

## 10. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Node.js/Express backend project
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up database (PostgreSQL)
- [ ] Configure Prisma/TypeORM
- [ ] Create database schema
- [ ] Set up authentication (JWT)
- [ ] Create basic CRUD for Users
- [ ] Create basic CRUD for Patients

### Phase 2: Core Features (Week 3-4)
- [ ] Implement patient endpoints (CRUD, search, pagination)
- [ ] Implement medication endpoints
- [ ] Implement appointment endpoints
- [ ] Implement clinical notes endpoints
- [ ] Implement imaging studies endpoints
- [ ] Implement timeline events
- [ ] Implement care team assignments
- [ ] Add permission/role middleware

### Phase 3: Advanced Features (Week 5-6)
- [ ] Implement telemedicine endpoints
- [ ] Implement consultation templates
- [ ] Add audit logging
- [ ] Implement file uploads (imaging reports)
- [ ] Add caching layer (Redis)
- [ ] Optimize database queries
- [ ] Add API rate limiting

### Phase 4: Integration & Testing (Week 7-8)
- [ ] Migrate mock data to database
- [ ] Update frontend to use real API
- [ ] Implement authentication flow in frontend
- [ ] Add error handling and retry logic
- [ ] Write comprehensive tests
- [ ] Performance testing and optimization
- [ ] Security audit

### Phase 5: Deployment (Week 9-10)
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Set up monitoring and logging
- [ ] Documentation

---

## 11. Security & Compliance (HIPAA Considerations)

### Data Protection
- **Encryption at Rest:** Database encryption
- **Encryption in Transit:** HTTPS/TLS
- **Access Controls:** Role-based + permission-based
- **Audit Logs:** All patient data access
- **Data Retention:** Policies for data retention/deletion
- **Backup & Recovery:** Regular backups, tested recovery

### Compliance Requirements
- **HIPAA Compliance:** BAA with hosting provider
- **PHI Protection:** Encrypt all PHI
- **Access Logging:** Who accessed what, when
- **User Authentication:** Strong passwords, MFA option
- **Session Management:** Secure session handling

---

## 12. Next Steps

### Immediate Actions
1. **Choose Technology Stack** (recommend Node.js/Express)
2. **Set up Backend Project Structure**
3. **Design Database Schema** (finalize based on requirements)
4. **Create Database Migration Scripts**
5. **Implement Authentication System**
6. **Build Core API Endpoints**

### Questions to Resolve
- Preferred hosting platform?
- Expected user scale?
- Compliance requirements beyond HIPAA?
- Integration with external systems (EHR, labs, etc.)?
- Real-time features needed (WebSockets)?

---

## Appendix: Quick Start Commands

### Backend Setup (Node.js/Express)
```bash
# Initialize project
mkdir backend && cd backend
npm init -y
npm install express cors helmet morgan dotenv
npm install -D typescript @types/node @types/express ts-node nodemon
npm install prisma @prisma/client
npm install bcrypt jsonwebtoken
npm install zod express-validator
npm install redis ioredis

# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init

# Start development
npm run dev
```

### Database Setup
```bash
# Create database
createdb physician_dashboard_2035

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

---

## Conclusion

This plan provides a comprehensive roadmap for transitioning to a full-stack application. The modular approach allows for incremental development and testing. Start with Phase 1 (Foundation) and iterate based on feedback and requirements.

**Estimated Timeline:** 8-10 weeks for complete implementation
**Team Size:** 1-2 backend developers recommended

