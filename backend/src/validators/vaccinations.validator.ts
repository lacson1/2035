import { z } from 'zod';
import { VaccinationRoute } from '@prisma/client';

export const createVaccinationSchema = z.object({
  vaccineName: z.string().min(1, 'Vaccine name is required').max(200),
  vaccineCode: z.string().max(50).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  administeredById: z.string().uuid().optional(),
  location: z.string().max(200).optional(),
  route: z.nativeEnum(VaccinationRoute).optional(),
  site: z.string().max(100).optional(),
  lotNumber: z.string().max(100).optional(),
  manufacturer: z.string().max(200).optional(),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  doseNumber: z.number().int().positive().optional(),
  totalDoses: z.number().int().positive().optional(),
  nextDoseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adverseReactions: z.array(z.string()).optional(),
  notes: z.string().optional(),
  verified: z.boolean().optional(),
  verifiedBy: z.string().max(100).optional(),
  verifiedById: z.string().uuid().optional(),
  verifiedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const updateVaccinationSchema = createVaccinationSchema.partial();

