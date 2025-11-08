# 🔧 Backend Development Guide

Complete guide for backend development and local setup.

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL (via Docker or local)
- npm or yarn

### Local Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Start Database**
   ```bash
   docker-compose up -d postgres
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Run Migrations**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Seed Database** (optional)
   ```bash
   npm run prisma:seed
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

Server runs on: http://localhost:3000

---

## Project Structure

```
backend/
├── src/
│   ├── app.ts              # Express app setup
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── validators/         # Input validation
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/          # Database migrations
├── tests/                   # Test files
└── scripts/                 # Utility scripts
```

---

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build TypeScript
npm start                # Start production server

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open Prisma Studio
npm run prisma:seed      # Seed database

# Debugging
npm run debug:database    # Test database connection
npm run debug:shell       # Interactive debug shell

# Testing
npm test                 # Run tests
npm run test:coverage    # Run tests with coverage
```

---

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Patients
- `GET /api/v1/patients` - List patients
- `GET /api/v1/patients/:id` - Get patient
- `POST /api/v1/patients` - Create patient
- `PUT /api/v1/patients/:id` - Update patient
- `DELETE /api/v1/patients/:id` - Delete patient

### Health Check
- `GET /health` - Health check
- `GET /health/live` - Liveness probe

See [API Documentation](./API.md) for complete list.

---

## Database

### Schema Management

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Prisma Studio

Visual database browser:
```bash
npm run prisma:studio
```

Opens at: http://localhost:5555

---

## Environment Variables

Create `.env` file:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Redis (optional)
REDIS_URL=

# Sentry (optional)
SENTRY_DSN=
```

---

## Docker

### Local Development

```bash
# Start all services
docker-compose -f docker-compose.local.yml up

# Start only database
docker-compose -f docker-compose.local.yml up postgres

# Stop services
docker-compose -f docker-compose.local.yml down
```

### Production Build

```bash
# Build image
docker build -t physician-dashboard-backend .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  physician-dashboard-backend
```

---

## Testing

### Run Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/          # Unit tests
├── integration/   # Integration tests
└── e2e/           # End-to-end tests
```

---

## Debugging

### Database Connection

```bash
npm run debug:database
```

### Interactive Shell

```bash
npm run debug:shell
```

### Logs

Development logs are printed to console. For production:
- Use logging service (e.g., Sentry)
- Check Render/Vercel logs
- Use `console.log()` for debugging

---

## Common Issues

### Port Already in Use

```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Prisma Client Not Generated

```bash
npx prisma generate
```

### Migration Conflicts

```bash
# Reset migrations (⚠️ deletes data)
npx prisma migrate reset

# Or resolve manually
npx prisma migrate resolve --applied <migration-name>
```

---

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

