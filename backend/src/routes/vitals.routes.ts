import { Router } from 'express';
import { vitalsController } from '../controllers/vitals.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// GET /patients/:patientId/vitals - Get all vitals for a patient
router.get('/', vitalsController.getPatientVitals.bind(vitalsController));

// GET /patients/:patientId/vitals/:vitalId - Get single vital
router.get('/:vitalId', vitalsController.getVital.bind(vitalsController));

// POST /patients/:patientId/vitals - Create vital
router.post(
  '/',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant', 'medical_assistant'),
  vitalsController.createVital.bind(vitalsController)
);

// PUT /patients/:patientId/vitals/:vitalId - Update vital
router.put(
  '/:vitalId',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant', 'medical_assistant'),
  vitalsController.updateVital.bind(vitalsController)
);

// DELETE /patients/:patientId/vitals/:vitalId - Delete vital
router.delete(
  '/:vitalId',
  requireRole('admin', 'physician', 'nurse_practitioner', 'physician_assistant'),
  vitalsController.deleteVital.bind(vitalsController)
);

export default router;

