# Backend Quick Start Guide

## Step 1: Initialize Backend Project

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors helmet morgan dotenv
npm install -D typescript @types/node @types/express @types/cors ts-node nodemon
npm install prisma @prisma/client
npm install bcrypt jsonwebtoken
npm install zod express-validator
npm install redis ioredis
npm install -D @types/bcrypt @types/jsonwebtoken
```

## Step 2: TypeScript Configuration

Create `backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Step 3: Environment Setup

Create `backend/.env`:
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/physician_dashboard_2035"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

Create `backend/.env.example` (commit this, not .env)

## Step 4: Package.json Scripts

Update `backend/package.json`:
```json
{
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts"
  }
}
```

## Step 5: Basic Express App Structure

Create `backend/src/app.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1', (req, res) => {
  res.json({ message: 'API v1 - Coming soon' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

## Step 6: Prisma Setup

Create `backend/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  username      String   @unique
  email         String   @unique
  passwordHash  String   @map("password_hash")
  firstName     String   @map("first_name")
  lastName      String   @map("last_name")
  role          String
  specialty     String?
  department    String?
  phone         String?
  avatarUrl     String?  @map("avatar_url")
  isActive      Boolean  @default(true) @map("is_active")
  lastLogin     DateTime? @map("last_login")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@map("users")
}

model Patient {
  id                String   @id @default(uuid())
  name              String
  dateOfBirth       DateTime @map("date_of_birth")
  gender            String
  bloodPressure     String?  @map("blood_pressure")
  condition         String?
  riskScore         Int?     @map("risk_score")
  address           String?
  email             String?
  phone             String?
  preferredLanguage String? @map("preferred_language") @default("English")
  
  // JSONB fields
  emergencyContact  Json?
  insurance         Json?
  allergies         String[]
  familyHistory     String[]
  pharmacogenomics  Json?
  socialDeterminants Json?
  lifestyle         Json?
  immunizations     Json?
  advancedDirectives Json?
  
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  createdBy         String?  @map("created_by")
  updatedBy         String?  @map("updated_by")

  medications       Medication[]
  appointments      Appointment[]
  clinicalNotes     ClinicalNote[]
  imagingStudies    ImagingStudy[]
  timelineEvents    TimelineEvent[]
  careTeamMembers   CareTeamAssignment[]

  @@map("patients")
}

model Medication {
  id            String   @id @default(uuid())
  patientId     String   @map("patient_id")
  name          String
  status        String
  startedDate   DateTime @map("started_date")
  instructions String?
  prescribedBy  String?  @map("prescribed_by")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  patient       Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@map("medications")
}

model Appointment {
  id               String   @id @default(uuid())
  patientId        String   @map("patient_id")
  date             DateTime
  time             String
  type             String
  providerId       String   @map("provider_id")
  status           String
  notes            String?
  consultationType String?  @map("consultation_type")
  specialty        String?
  duration         Int?
  location         String?
  reason           String?
  referralRequired Boolean  @default(false) @map("referral_required")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  patient          Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@map("appointments")
}

model ClinicalNote {
  id               String   @id @default(uuid())
  patientId        String   @map("patient_id")
  title            String
  content          String
  authorId         String   @map("author_id")
  date             DateTime
  type             String
  consultationType String?  @map("consultation_type")
  specialty        String?
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  patient          Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@map("clinical_notes")
}

model ImagingStudy {
  id                String   @id @default(uuid())
  patientId         String   @map("patient_id")
  type              String
  modality          String
  bodyPart          String   @map("body_part")
  date              DateTime
  findings          String
  status            String
  reportUrl         String?  @map("report_url")
  orderingPhysicianId String? @map("ordering_physician_id")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  patient           Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@map("imaging_studies")
}

model TimelineEvent {
  id              String   @id @default(uuid())
  patientId       String   @map("patient_id")
  date            DateTime
  type            String
  title           String
  description     String?
  icon            String?
  relatedEntityType String? @map("related_entity_type")
  relatedEntityId String?  @map("related_entity_id")
  createdAt       DateTime @default(now()) @map("created_at")

  patient         Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@map("timeline_events")
}

model CareTeamAssignment {
  id           String   @id @default(uuid())
  patientId    String   @map("patient_id")
  userId       String   @map("user_id")
  role         String
  specialty    String?
  assignedDate DateTime @map("assigned_date")
  notes        String?
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  patient      Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@unique([patientId, userId])
  @@map("care_team_assignments")
}
```

## Step 7: Initialize Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate -- --name init

# Open Prisma Studio (optional)
npm run prisma:studio
```

## Step 8: Test the Setup

```bash
# Start the server
npm run dev

# In another terminal, test health endpoint
curl http://localhost:3000/health
```

## Next Steps

1. **Create authentication routes** (`src/routes/auth.routes.ts`)
2. **Create patient routes** (`src/routes/patients.routes.ts`)
3. **Implement services** (`src/services/`)
4. **Add middleware** (`src/middleware/`)
5. **Migrate mock data** (see BACKEND_PLAN.md)

See `BACKEND_PLAN.md` for detailed implementation steps.

