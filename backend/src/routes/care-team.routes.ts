import { Router } from 'express';
import { careTeamController } from '../controllers/care-team.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';
import { auditMiddleware } from '../middleware/audit.middleware';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);
router.use(auditMiddleware);

// GET /patients/:patientId/care-team - Get all care team members for a patient
router.get('/', careTeamController.getPatientCareTeam.bind(careTeamController));

// GET /patients/:patientId/care-team/:memberId - Get single care team member
router.get('/:memberId', careTeamController.getCareTeamMember.bind(careTeamController));

// POST /patients/:patientId/care-team - Add care team member
router.post(
  '/',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'care_coordinator'),
  careTeamController.addCareTeamMember.bind(careTeamController)
);

// PUT /patients/:patientId/care-team/:memberId - Update care team member
router.put(
  '/:memberId',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'care_coordinator'),
  careTeamController.updateCareTeamMember.bind(careTeamController)
);

// DELETE /patients/:patientId/care-team/:memberId - Remove care team member
router.delete(
  '/:memberId',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'care_coordinator'),
  careTeamController.removeCareTeamMember.bind(careTeamController)
);

export default router;

