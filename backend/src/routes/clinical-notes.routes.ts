import { Router } from 'express';
import { clinicalNotesController } from '../controllers/clinical-notes.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';
import { auditMiddleware } from '../middleware/audit.middleware';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);
router.use(auditMiddleware);

// GET /patients/:patientId/notes - Get all notes for a patient
router.get('/', clinicalNotesController.getPatientNotes.bind(clinicalNotesController));

// GET /patients/:patientId/notes/:noteId - Get single note
router.get('/:noteId', clinicalNotesController.getNote.bind(clinicalNotesController));

// POST /patients/:patientId/notes - Create note
router.post(
  '/',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant'),
  clinicalNotesController.createNote.bind(clinicalNotesController)
);

// PUT /patients/:patientId/notes/:noteId - Update note
router.put(
  '/:noteId',
  requireRole('admin', 'physician', 'nurse_practitioner', 'physician_assistant'),
  clinicalNotesController.updateNote.bind(clinicalNotesController)
);

// DELETE /patients/:patientId/notes/:noteId - Delete note
router.delete(
  '/:noteId',
  requireRole('admin', 'physician'),
  clinicalNotesController.deleteNote.bind(clinicalNotesController)
);

export default router;

