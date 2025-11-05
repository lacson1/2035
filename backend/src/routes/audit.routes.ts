import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /audit/patient/:patientId - Get audit logs for a patient
router.get(
  '/patient/:patientId',
  auditController.getPatientAuditLogs.bind(auditController)
);

// GET /audit/me - Get current user's audit logs
router.get('/me', auditController.getMyAuditLogs.bind(auditController));

// GET /audit/resource/:resourceType/:resourceId - Get audit logs for a resource (admin only)
router.get(
  '/resource/:resourceType/:resourceId',
  requireRole('admin'),
  auditController.getResourceAuditLogs.bind(auditController)
);

export default router;

