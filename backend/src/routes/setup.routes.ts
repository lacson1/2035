import { Router } from 'express';
import { setupController } from '../controllers/setup.controller';

const router = Router();

// POST /api/v1/setup/seed-patients - Seed demo patients
router.post('/seed-patients', setupController.seedPatients.bind(setupController));

export default router;

