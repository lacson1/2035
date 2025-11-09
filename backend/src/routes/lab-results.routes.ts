import { Router } from 'express';
import { labResultsController } from '../controllers/lab-results.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';
import { auditMiddleware } from '../middleware/audit.middleware';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);
router.use(auditMiddleware);

// GET /patients/:patientId/lab-results - Get all lab results for a patient
router.get('/', labResultsController.getPatientLabResults.bind(labResultsController));

// GET /patients/:patientId/lab-results/:labResultId - Get single lab result
router.get('/:labResultId', labResultsController.getLabResult.bind(labResultsController));

// POST /patients/:patientId/lab-results - Create lab result
router.post(
  '/',
  requireRole('admin', 'physician', 'nurse_practitioner', 'physician_assistant', 'lab_technician'),
  labResultsController.createLabResult.bind(labResultsController)
);

// PUT /patients/:patientId/lab-results/:labResultId - Update lab result
router.put(
  '/:labResultId',
  requireRole('admin', 'physician', 'nurse_practitioner', 'physician_assistant', 'lab_technician'),
  labResultsController.updateLabResult.bind(labResultsController)
);

// DELETE /patients/:patientId/lab-results/:labResultId - Delete lab result
router.delete(
  '/:labResultId',
  requireRole('admin', 'physician'),
  labResultsController.deleteLabResult.bind(labResultsController)
);


export default router;

