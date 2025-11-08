import { Router } from 'express';
import { vaccinationsController } from '../controllers/vaccinations.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createVaccinationSchema, updateVaccinationSchema } from '../validators/vaccinations.validator';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// GET /patients/:patientId/vaccinations - Get all vaccinations for a patient
router.get('/', vaccinationsController.getPatientVaccinations.bind(vaccinationsController));

// GET /patients/:patientId/vaccinations/:vaccinationId - Get single vaccination
router.get('/:vaccinationId', vaccinationsController.getVaccination.bind(vaccinationsController));

// POST /patients/:patientId/vaccinations - Create vaccination
router.post(
  '/',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant', 'medical_assistant'),
  validate(createVaccinationSchema),
  vaccinationsController.createVaccination.bind(vaccinationsController)
);

// PUT /patients/:patientId/vaccinations/:vaccinationId - Update vaccination
router.put(
  '/:vaccinationId',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant', 'medical_assistant'),
  validate(updateVaccinationSchema),
  vaccinationsController.updateVaccination.bind(vaccinationsController)
);

// DELETE /patients/:patientId/vaccinations/:vaccinationId - Delete vaccination
router.delete(
  '/:vaccinationId',
  requireRole('admin', 'physician', 'nurse_practitioner', 'physician_assistant'),
  vaccinationsController.deleteVaccination.bind(vaccinationsController)
);

export default router;

