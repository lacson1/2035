import { Router } from 'express';
import { patientsController } from '../controllers/patients.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';
import { auditMiddleware } from '../middleware/audit.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Audit logging for all patient routes (HIPAA compliance)
router.use(auditMiddleware);

// GET /patients - List patients with pagination and filters
router.get('/', patientsController.getPatients.bind(patientsController));

// GET /patients/search - Search patients
router.get('/search', patientsController.searchPatients.bind(patientsController));

// GET /patients/:id - Get single patient
router.get('/:id', patientsController.getPatient.bind(patientsController));

// POST /patients - Create patient (requires edit permission)
router.post(
  '/',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant'),
  patientsController.createPatient.bind(patientsController)
);

// PUT /patients/:id - Update patient (requires edit permission)
router.put(
  '/:id',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant'),
  patientsController.updatePatient.bind(patientsController)
);

// DELETE /patients/:id - Delete patient (admin only)
router.delete(
  '/:id',
  requireRole('admin'),
  patientsController.deletePatient.bind(patientsController)
);

export default router;

