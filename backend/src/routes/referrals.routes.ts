import { Router } from 'express';
import { referralsController } from '../controllers/referrals.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// GET /patients/:patientId/referrals - Get all referrals for a patient
router.get('/', referralsController.getPatientReferrals.bind(referralsController));

// GET /patients/:patientId/referrals/:referralId - Get single referral
router.get('/:referralId', referralsController.getReferral.bind(referralsController));

// POST /patients/:patientId/referrals - Create referral
router.post(
  '/',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant', 'receptionist'),
  referralsController.createReferral.bind(referralsController)
);

// PUT /patients/:patientId/referrals/:referralId - Update referral
router.put(
  '/:referralId',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant', 'receptionist'),
  referralsController.updateReferral.bind(referralsController)
);

// DELETE /patients/:patientId/referrals/:referralId - Delete referral
router.delete(
  '/:referralId',
  requireRole('admin', 'physician', 'receptionist'),
  referralsController.deleteReferral.bind(referralsController)
);

export default router;

