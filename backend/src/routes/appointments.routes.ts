import { Router } from 'express';
import { appointmentsController } from '../controllers/appointments.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';
import { auditMiddleware } from '../middleware/audit.middleware';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);
router.use(auditMiddleware);

// GET /patients/:patientId/appointments - Get all appointments for a patient
router.get('/', appointmentsController.getPatientAppointments.bind(appointmentsController));

// GET /patients/:patientId/appointments/:aptId - Get single appointment
router.get('/:aptId', appointmentsController.getAppointment.bind(appointmentsController));

// POST /patients/:patientId/appointments - Create appointment
router.post(
  '/',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant', 'receptionist'),
  appointmentsController.createAppointment.bind(appointmentsController)
);

// PUT /patients/:patientId/appointments/:aptId - Update appointment
router.put(
  '/:aptId',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant', 'receptionist'),
  appointmentsController.updateAppointment.bind(appointmentsController)
);

// DELETE /patients/:patientId/appointments/:aptId - Delete appointment
router.delete(
  '/:aptId',
  requireRole('admin', 'physician', 'receptionist'),
  appointmentsController.deleteAppointment.bind(appointmentsController)
);

export default router;

