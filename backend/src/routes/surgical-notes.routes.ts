import { Router } from 'express';
import { surgicalNotesController } from '../controllers/surgical-notes.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createSurgicalNoteSchema, updateSurgicalNoteSchema } from '../validators/surgical-notes.validator';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// GET /patients/:patientId/surgical-notes - Get all surgical notes for a patient
router.get('/', surgicalNotesController.getPatientSurgicalNotes.bind(surgicalNotesController));

// GET /patients/:patientId/surgical-notes/:noteId - Get single surgical note
router.get('/:noteId', surgicalNotesController.getSurgicalNote.bind(surgicalNotesController));

// POST /patients/:patientId/surgical-notes - Create surgical note
router.post(
  '/',
  requireRole('admin', 'physician', 'nurse_practitioner', 'physician_assistant'),
  validate(createSurgicalNoteSchema),
  surgicalNotesController.createSurgicalNote.bind(surgicalNotesController)
);

// PUT /patients/:patientId/surgical-notes/:noteId - Update surgical note
router.put(
  '/:noteId',
  requireRole('admin', 'physician', 'nurse_practitioner', 'physician_assistant'),
  validate(updateSurgicalNoteSchema),
  surgicalNotesController.updateSurgicalNote.bind(surgicalNotesController)
);

// DELETE /patients/:patientId/surgical-notes/:noteId - Delete surgical note
router.delete(
  '/:noteId',
  requireRole('admin', 'physician', 'nurse_practitioner', 'physician_assistant'),
  surgicalNotesController.deleteSurgicalNote.bind(surgicalNotesController)
);

export default router;

