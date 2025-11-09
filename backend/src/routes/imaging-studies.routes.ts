import { Router } from 'express';
import { imagingStudiesController } from '../controllers/imaging-studies.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';
import { auditMiddleware } from '../middleware/audit.middleware';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);
router.use(auditMiddleware);

// GET /patients/:patientId/imaging - Get all imaging studies for a patient
router.get('/', imagingStudiesController.getPatientImagingStudies.bind(imagingStudiesController));

// GET /patients/:patientId/imaging/:studyId - Get single imaging study
router.get('/:studyId', imagingStudiesController.getImagingStudy.bind(imagingStudiesController));

// POST /patients/:patientId/imaging - Create imaging study
router.post(
  '/',
  requireRole('admin', 'physician', 'radiologist', 'nurse_practitioner', 'physician_assistant'),
  imagingStudiesController.createImagingStudy.bind(imagingStudiesController)
);

// PUT /patients/:patientId/imaging/:studyId - Update imaging study
router.put(
  '/:studyId',
  requireRole('admin', 'physician', 'radiologist'),
  imagingStudiesController.updateImagingStudy.bind(imagingStudiesController)
);

// DELETE /patients/:patientId/imaging/:studyId - Delete imaging study
router.delete(
  '/:studyId',
  requireRole('admin', 'physician', 'radiologist'),
  imagingStudiesController.deleteImagingStudy.bind(imagingStudiesController)
);

export default router;

