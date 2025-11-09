import { z } from 'zod';

/**
 * Patient Validation Schemas
 * Used with validate middleware for request validation
 */

export const createPatientSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    dateOfBirth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
    bloodPressure: z.string().optional(),
    condition: z.string().optional(),
    riskScore: z.number().int().min(0).max(100).optional(),
    address: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    preferredLanguage: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    familyHistory: z.array(z.string()).optional(),
    emergencyContact: z.record(z.any()).optional(),
    insurance: z.record(z.any()).optional(),
  }),
});

export const updatePatientSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    dateOfBirth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
    bloodPressure: z.string().optional(),
    condition: z.string().optional(),
    riskScore: z.number().int().min(0).max(100).optional(),
    address: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    preferredLanguage: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    familyHistory: z.array(z.string()).optional(),
    emergencyContact: z.record(z.any()).optional(),
    insurance: z.record(z.any()).optional(),
  }),
});

export const getPatientsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    risk: z.enum(['low', 'medium', 'high']).optional(),
    condition: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const patientParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid patient ID format'),
  }),
});

export const patientIdParamSchema = z.object({
  params: z.object({
    patientId: z.string().uuid('Invalid patient ID format'),
  }),
});
