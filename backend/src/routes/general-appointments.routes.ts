import { Router } from 'express';
import { appointmentsController } from '../controllers/appointments.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /appointments - Get appointments with filters (providerId, status, date range)
router.get('/', appointmentsController.getAppointments.bind(appointmentsController));

export default router;

