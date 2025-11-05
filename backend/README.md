# Physician Dashboard Backend API

Backend API for the Physician Dashboard 2035 application.

## Tech Stack

- **Node.js** + **TypeScript**
- **Express.js** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Zod** - Validation
- **bcrypt** - Password hashing

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens
- `CORS_ORIGIN` - Frontend URL (default: http://localhost:5173)

3. Set up database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

4. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Health Check
- `GET /health` - Server health status

See [API_ENDPOINTS.md](../API_ENDPOINTS.md) for complete API documentation.

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/          # Data models (Prisma generates)
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   └── app.ts           # Express app
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seed script
└── tests/               # Tests
```

## Development

### Running in Development
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Database Management

```bash
# Generate Prisma Client after schema changes
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Environment Variables

See `.env.example` for all required environment variables.

## Security

- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens with expiration
- CORS configured
- Helmet.js for security headers
- Input validation with Zod and express-validator

## License

ISC

