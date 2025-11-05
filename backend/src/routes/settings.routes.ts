import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /settings/preferences - Get user preferences
router.get('/preferences', settingsController.getPreferences.bind(settingsController));

// PUT /settings/preferences - Save user preferences
router.put('/preferences', settingsController.savePreferences.bind(settingsController));

// GET /settings/export - Export user data
router.get('/export', settingsController.exportData.bind(settingsController));

// DELETE /settings/preferences - Clear user preferences
router.delete('/preferences', settingsController.clearPreferences.bind(settingsController));

export default router;

