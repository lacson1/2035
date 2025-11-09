import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/node';
import { config } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import prisma from './config/database';
import { createRedisClient } from './config/redis';
import { auditMiddleware } from './middleware/audit.middleware';
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimit.middleware';
import { sanitizeInput } from './middleware/sanitize.middleware';
import { metricsMiddleware } from './middleware/metrics.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Initialize Sentry before anything else
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: config.nodeEnv,
    tracesSampleRate: config.nodeEnv === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: undefined }),
    ],
  });
  logger.info('✅ Sentry initialized for error tracking');
} else if (config.nodeEnv === 'production') {
  logger.warn('⚠️  SENTRY_DSN not set - error tracking disabled in production');
}

// Routes
import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health.routes';
import patientsRoutes from './routes/patients.routes';
import medicationsRoutes from './routes/medications.routes';
import appointmentsRoutes from './routes/appointments.routes';
import generalAppointmentsRoutes from './routes/general-appointments.routes';
import clinicalNotesRoutes from './routes/clinical-notes.routes';
import imagingStudiesRoutes from './routes/imaging-studies.routes';
import vitalsRoutes from './routes/vitals.routes';
import labResultsRoutes from './routes/lab-results.routes';
import careTeamRoutes from './routes/care-team.routes';
import referralsRoutes from './routes/referrals.routes';
import settingsRoutes from './routes/settings.routes';
import billingRoutes from './routes/billing.routes';
import auditRoutes from './routes/audit.routes';
import metricsRoutes from './routes/metrics.routes';
import hubsRoutes from './routes/hubs.routes';
import rolesRoutes from './routes/roles.routes';
import permissionsRoutes from './routes/permissions.routes';
import usersRoutes from './routes/users.routes';
import consentsRoutes from './routes/consents.routes';
import vaccinationsRoutes from './routes/vaccinations.routes';
import surgicalNotesRoutes from './routes/surgical-notes.routes';
import nutritionRoutes from './routes/nutrition.routes';
import { seedHubsIfNeeded } from './utils/seedHubs';
import { configValidator } from './utils/config-validator';

const app = express();

// Trust proxy for Fly.io (required for rate limiting and X-Forwarded-For header)
app.set('trust proxy', true);

// Sentry request handler must be the first middleware
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Security middleware with CSP configuration
app.use(helmet({
  contentSecurityPolicy: config.nodeEnv === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'",
        ...(Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin]),
        ...(process.env.SENTRY_DSN ? ["https://*.sentry.io"] : []),
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  } : false, // Disable CSP in development for easier debugging
  hsts: config.nodeEnv === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  } : false,
}));

// CORS - Support multiple origins
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    const allowedOrigins = Array.isArray(config.cors.origin) 
      ? config.cors.origin 
      : [config.cors.origin];
    
    // Check exact match
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check wildcard patterns (e.g., *.vercel.app)
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string' && allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      return callback(null, true);
    }

    // Log for debugging
    logger.warn(`[CORS] Origin not allowed: ${origin}`, { allowedOrigins });
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Cookie parsing (for httpOnly cookies)
app.use(cookieParser());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Input sanitization (prevent XSS)
app.use(sanitizeInput);

// Static file serving for uploaded documents
app.use('/uploads', express.static('uploads'));

// Metrics collection
app.use(metricsMiddleware);

// Initialize Redis (non-blocking, optional)
// Only initialize if REDIS_URL is explicitly set and not default localhost
if (config.redis.url && config.redis.url !== 'redis://localhost:6379') {
  try {
    createRedisClient();
  } catch (error) {
    logger.warn('Redis not available, continuing without cache');
  }
} else {
  logger.info('ℹ️  Redis not configured, skipping initialization');
}

// Apply global rate limiting to all API routes (except health check)
app.use('/api', apiRateLimiter);

// Audit logging middleware (HIPAA compliance - must be after auth middleware)
// Note: Place this after routes that have authentication middleware
// We'll apply it selectively to protected routes

// Health check routes (before rate limiting - used for monitoring)
app.use('/health', healthRoutes);

// API Documentation (Swagger)
if (config.nodeEnv === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Physician Dashboard API Docs',
  }));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  logger.info(`📚 API Documentation available at http://localhost:${config.port}/api-docs`);
}

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientsRoutes);
app.use('/api/v1/patients/:patientId/medications', medicationsRoutes);
app.use('/api/v1/patients/:patientId/appointments', appointmentsRoutes);
app.use('/api/v1/appointments', generalAppointmentsRoutes);
app.use('/api/v1/patients/:patientId/notes', clinicalNotesRoutes);
app.use('/api/v1/patients/:patientId/imaging', imagingStudiesRoutes);
app.use('/api/v1/patients/:patientId/vitals', vitalsRoutes);
app.use('/api/v1/patients/:patientId/lab-results', labResultsRoutes);
app.use('/api/v1/patients/:patientId/care-team', careTeamRoutes);
app.use('/api/v1/patients/:patientId/referrals', referralsRoutes);
app.use('/api/v1/patients/:patientId/consents', consentsRoutes);
app.use('/api/v1/patients/:patientId/vaccinations', vaccinationsRoutes);
app.use('/api/v1/patients/:patientId/surgical-notes', surgicalNotesRoutes);
app.use('/api/v1/patients/:patientId/nutrition', nutritionRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/metrics', metricsRoutes);
app.use('/api/v1/hubs', hubsRoutes);
app.use('/api/v1/roles', rolesRoutes);
app.use('/api/v1/permissions', permissionsRoutes);
app.use('/api/v1/users', usersRoutes);

// API info
app.use('/api/v1', (req, res) => {
  res.json({
    message: 'API v1',
    endpoints: {
      auth: '/api/v1/auth',
      patients: '/api/v1/patients',
      medications: '/api/v1/patients/:patientId/medications',
      appointments: '/api/v1/patients/:patientId/appointments',
      clinicalNotes: '/api/v1/patients/:patientId/notes',
      imaging: '/api/v1/patients/:patientId/imaging',
      vitals: '/api/v1/patients/:patientId/vitals',
      labResults: '/api/v1/patients/:patientId/lab-results',
      careTeam: '/api/v1/patients/:patientId/care-team',
      referrals: '/api/v1/patients/:patientId/referrals',
      consents: '/api/v1/patients/:patientId/consents',
      vaccinations: '/api/v1/patients/:patientId/vaccinations',
      surgicalNotes: '/api/v1/patients/:patientId/surgical-notes',
      nutrition: '/api/v1/patients/:patientId/nutrition',
      settings: '/api/v1/settings',
      billing: '/api/v1/billing',
      audit: '/api/v1/audit',
      hubs: '/api/v1/hubs',
      roles: '/api/v1/roles',
      permissions: '/api/v1/permissions',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    status: 404,
    path: req.path,
  });
});

// Sentry error handler must be before error handler
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Error handler (must be last)
app.use(errorHandler);

// Validate configuration before starting server
logger.info('🔍 Validating configuration...');
const validationResult = configValidator.validateAll();

if (!validationResult.isValid) {
  logger.error('❌ Configuration validation failed:');
  validationResult.errors.forEach(error => logger.error(`  - ${error}`));
  process.exit(1);
}

if (validationResult.warnings.length > 0) {
  logger.warn('⚠️  Configuration warnings:');
  validationResult.warnings.forEach(warning => logger.warn(`  - ${warning}`));
}

logger.info('✅ Configuration validation passed');

// Start server
// Use PORT from environment (Render/Vercel) or fallback to config
const PORT = parseInt(process.env.PORT || String(config.port), 10);

// Auto-seed hubs on startup (non-blocking)
seedHubsIfNeeded().catch((error) => {
  logger.warn('Failed to auto-seed hubs:', error);
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server running on http://0.0.0.0:${PORT}`);
  logger.info(`📝 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 CORS Origin: ${config.cors.origin}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;

