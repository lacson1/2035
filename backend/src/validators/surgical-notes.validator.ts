import { z } from 'zod';
import { SurgicalProcedureType, SurgicalStatus } from '@prisma/client';

export const createSurgicalNoteSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  procedureName: z.string().min(1, 'Procedure name is required').max(200),
  procedureType: z.nativeEnum(SurgicalProcedureType),
  status: z.nativeEnum(SurgicalStatus).optional(),
  surgeonId: z.string().uuid().optional(),
  assistantSurgeons: z.array(z.string().uuid()).optional(),
  anesthesiologistId: z.string().uuid().optional(),
  anesthesiaType: z.string().max(100).optional(),
  indication: z.string().min(1, 'Indication is required'),
  preoperativeDiagnosis: z.string().min(1, 'Preoperative diagnosis is required'),
  postoperativeDiagnosis: z.string().optional(),
  procedureDescription: z.string().min(1, 'Procedure description is required'),
  findings: z.string().optional(),
  complications: z.string().optional(),
  estimatedBloodLoss: z.string().max(100).optional(),
  specimens: z.array(z.string()).optional(),
  drains: z.string().optional(),
  postOpInstructions: z.string().optional(),
  recoveryNotes: z.string().optional(),
  followUpDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  operatingRoom: z.string().max(50).optional(),
  duration: z.number().int().positive().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const updateSurgicalNoteSchema = createSurgicalNoteSchema.partial();

