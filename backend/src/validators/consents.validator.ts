import { z } from 'zod';
import { ConsentType, ConsentStatus } from '@prisma/client';

export const createConsentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  type: z.nativeEnum(ConsentType),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.nativeEnum(ConsentStatus).optional(),
  procedureName: z.string().max(200).optional(),
  risks: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  alternatives: z.array(z.string()).optional(),
  signedBy: z.string().max(100).optional(),
  signedById: z.string().uuid().optional(),
  witnessName: z.string().max(100).optional(),
  witnessId: z.string().uuid().optional(),
  physicianName: z.string().max(100).optional(),
  physicianId: z.string().uuid().optional(),
  signedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  signedTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional(),
  digitalSignature: z.string().optional(),
  printedSignature: z.boolean().optional(),
});

export const updateConsentSchema = createConsentSchema.partial();

