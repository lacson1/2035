import { Router } from 'express';
import { medicationsController } from '../controllers/medications.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';
import { auditMiddleware } from '../middleware/audit.middleware';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);
router.use(auditMiddleware);

// GET /patients/:patientId/medications - Get all medications for a patient
router.get('/', medicationsController.getPatientMedications.bind(medicationsController));

// GET /patients/:patientId/medications/:medId - Get single medication
router.get('/:medId', medicationsController.getMedication.bind(medicationsController));

// POST /patients/:patientId/medications - Create medication
router.post(
  '/',
  requireRole('admin', 'physician', 'nurse_practitioner', 'physician_assistant', 'pharmacist'),
  medicationsController.createMedication.bind(medicationsController)
);

// PUT /patients/:patientId/medications/:medId - Update medication
router.put(
  '/:medId',
  requireRole('admin', 'physician', 'nurse_practitioner', 'physician_assistant', 'pharmacist'),
  medicationsController.updateMedication.bind(medicationsController)
);

// DELETE /patients/:patientId/medications/:medId - Delete medication
router.delete(
  '/:medId',
  requireRole('admin', 'physician', 'nurse_practitioner', 'physician_assistant'),
  medicationsController.deleteMedication.bind(medicationsController)
);

export default router;

