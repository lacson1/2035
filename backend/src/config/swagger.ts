import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Physician Dashboard 2035 API',
      version: '1.0.0',
      description: 'RESTful API for Physician Dashboard 2035 - Healthcare Management System',
      contact: {
        name: 'API Support',
        email: 'support@hospital2035.com',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
      {
        url: 'https://api.hospital2035.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/v1/auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            status: {
              type: 'number',
              description: 'HTTP status code',
            },
            errors: {
              type: 'object',
              description: 'Validation errors (if any)',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Patient: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            mrn: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant', 'medical_assistant'] },
            specialty: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                  },
                },
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication and authorization endpoints',
      },
      {
        name: 'Patients',
        description: 'Patient management endpoints',
      },
      {
        name: 'Medications',
        description: 'Medication management endpoints',
      },
      {
        name: 'Appointments',
        description: 'Appointment scheduling endpoints',
      },
      {
        name: 'Clinical Notes',
        description: 'Clinical documentation endpoints',
      },
      {
        name: 'Imaging Studies',
        description: 'Imaging study management endpoints',
      },
      {
        name: 'Care Team',
        description: 'Care team assignment endpoints',
      },
      {
        name: 'Health',
        description: 'Health check and monitoring endpoints',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/app.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

