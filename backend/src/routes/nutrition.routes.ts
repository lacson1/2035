import { Router } from 'express';
import { nutritionController } from '../controllers/nutrition.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createNutritionEntrySchema, updateNutritionEntrySchema } from '../validators/nutrition.validator';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// GET /patients/:patientId/nutrition - Get all nutrition entries for a patient
router.get('/', nutritionController.getPatientNutritionEntries.bind(nutritionController));

// GET /patients/:patientId/nutrition/:entryId - Get single nutrition entry
router.get('/:entryId', nutritionController.getNutritionEntry.bind(nutritionController));

// POST /patients/:patientId/nutrition - Create nutrition entry
router.post(
  '/',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant', 'medical_assistant'),
  validate(createNutritionEntrySchema),
  nutritionController.createNutritionEntry.bind(nutritionController)
);

// PUT /patients/:patientId/nutrition/:entryId - Update nutrition entry
router.put(
  '/:entryId',
  requireRole('admin', 'physician', 'nurse', 'nurse_practitioner', 'physician_assistant', 'medical_assistant'),
  validate(updateNutritionEntrySchema),
  nutritionController.updateNutritionEntry.bind(nutritionController)
);

// DELETE /patients/:patientId/nutrition/:entryId - Delete nutrition entry
router.delete(
  '/:entryId',
  requireRole('admin', 'physician', 'nurse_practitioner', 'physician_assistant'),
  nutritionController.deleteNutritionEntry.bind(nutritionController)
);

export default router;

