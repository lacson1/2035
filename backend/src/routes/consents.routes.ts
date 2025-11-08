import { Router } from 'express';
import { consentsController } from '../controllers/consents.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createConsentSchema, updateConsentSchema } from '../validators/consents.validator';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// GET /patients/:patientId/consents - Get all consents for a patient
router.get('/', consentsController.getPatientConsents.bind(consentsController));

// GET /patients/:patientId/consents/:consentId - Get single consent
router.get('/:consentId', consentsController.getConsent.bind(consentsController));

// POST /patients/:patientId/consents - Create consent
router.post(
  '/',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant', 'medical_assistant'),
  validate(createConsentSchema),
  consentsController.createConsent.bind(consentsController)
);

// PUT /patients/:patientId/consents/:consentId - Update consent
router.put(
  '/:consentId',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant', 'medical_assistant'),
  validate(updateConsentSchema),
  consentsController.updateConsent.bind(consentsController)
);

// DELETE /patients/:patientId/consents/:consentId - Delete consent
router.delete(
  '/:consentId',
  requireRole('admin', 'physician', 'nurse_practitioner', 'physician_assistant'),
  consentsController.deleteConsent.bind(consentsController)
);

export default router;

