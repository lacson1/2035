import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import prisma from './config/database';
import { createRedisClient } from './config/redis';
import { auditMiddleware } from './middleware/audit.middleware';
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimit.middleware';
import { sanitizeInput } from './middleware/sanitize.middleware';
import { metricsMiddleware } from './middleware/metrics.middleware';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { securityHeaders } from './middleware/security.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Routes
import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health.routes';
import patientsRoutes from './routes/patients.routes';
import medicationsRoutes from './routes/medications.routes';
import appointmentsRoutes from './routes/appointments.routes';
import clinicalNotesRoutes from './routes/clinical-notes.routes';
import imagingStudiesRoutes from './routes/imaging-studies.routes';
import labResultsRoutes from './routes/lab-results.routes';
import careTeamRoutes from './routes/care-team.routes';
import settingsRoutes from './routes/settings.routes';
import billingRoutes from './routes/billing.routes';
import auditRoutes from './routes/audit.routes';
import metricsRoutes from './routes/metrics.routes';
import hubsRoutes from './routes/hubs.routes';
import rolesRoutes from './routes/roles.routes';
import permissionsRoutes from './routes/permissions.routes';

const app = express();

// Request ID middleware (must be early for tracing)
app.use(requestIdMiddleware);

// Security middleware
app.use(helmet());
app.use(securityHeaders);

// CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Input sanitization (prevent XSS)
app.use(sanitizeInput);

// Metrics collection
app.use(metricsMiddleware);

// Initialize Redis (non-blocking)
try {
  createRedisClient();
} catch (error) {
  logger.warn('Redis not available, continuing without cache');
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
app.use('/api/v1/patients/:patientId/notes', clinicalNotesRoutes);
app.use('/api/v1/patients/:patientId/imaging', imagingStudiesRoutes);
app.use('/api/v1/patients/:patientId/lab-results', labResultsRoutes);
app.use('/api/v1/patients/:patientId/care-team', careTeamRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/metrics', metricsRoutes);
app.use('/api/v1/hubs', hubsRoutes);
app.use('/api/v1/roles', rolesRoutes);
app.use('/api/v1/permissions', permissionsRoutes);

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
      labResults: '/api/v1/patients/:patientId/lab-results',
      careTeam: '/api/v1/patients/:patientId/care-team',
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

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
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

