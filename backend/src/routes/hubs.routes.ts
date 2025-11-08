import { Router } from 'express';
import { hubsController } from '../controllers/hubs.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';
import { auditMiddleware } from '../middleware/audit.middleware';

const router = Router();

// Hub CRUD operations
// GET /hubs - List all hubs (public, no auth required for reading)
// Note: These routes must be defined BEFORE router.use(authenticate) to be public
// IMPORTANT: More specific routes must come before less specific ones (e.g., /:hubId/functions before /:id)
router.get('/', hubsController.getHubs.bind(hubsController));

// GET /hubs/:hubId/functions - Get all functions for a hub (public, read-only)
router.get('/:hubId/functions', hubsController.getHubFunctions.bind(hubsController));

// GET /hubs/:hubId/resources - Get all resources for a hub (public, read-only)
router.get('/:hubId/resources', hubsController.getHubResources.bind(hubsController));

// GET /hubs/:hubId/notes - Get all notes for a hub (public, read-only)
router.get('/:hubId/notes', hubsController.getHubNotes.bind(hubsController));

// GET /hubs/:hubId/templates - Get all templates for a hub (public, read-only)
router.get('/:hubId/templates', hubsController.getHubTemplates.bind(hubsController));

// GET /hubs/:id - Get single hub (public) - Must come after more specific routes
router.get('/:id', hubsController.getHub.bind(hubsController));

// All other routes require authentication
router.use(authenticate);

// Audit logging for all authenticated hub routes
router.use(auditMiddleware);

// POST /hubs - Create hub (admin only)
router.post(
  '/',
  requireRole('admin'),
  hubsController.createHub.bind(hubsController)
);

// PUT /hubs/:id - Update hub (admin only)
router.put(
  '/:id',
  requireRole('admin'),
  hubsController.updateHub.bind(hubsController)
);

// DELETE /hubs/:id - Delete hub (admin only)
router.delete(
  '/:id',
  requireRole('admin'),
  hubsController.deleteHub.bind(hubsController)
);

// Hub Functions
// POST /hubs/:hubId/functions - Create hub function
router.post(
  '/:hubId/functions',
  requireRole('admin', 'physician', 'nurse_practitioner'),
  hubsController.createHubFunction.bind(hubsController)
);

// PUT /hubs/:hubId/functions/:functionId - Update hub function
router.put(
  '/:hubId/functions/:functionId',
  requireRole('admin', 'physician', 'nurse_practitioner'),
  hubsController.updateHubFunction.bind(hubsController)
);

// DELETE /hubs/:hubId/functions/:functionId - Delete hub function
router.delete(
  '/:hubId/functions/:functionId',
  requireRole('admin', 'physician', 'nurse_practitioner'),
  hubsController.deleteHubFunction.bind(hubsController)
);

// Hub Resources
// POST /hubs/:hubId/resources - Create hub resource
router.post(
  '/:hubId/resources',
  requireRole('admin', 'physician', 'nurse_practitioner'),
  hubsController.createHubResource.bind(hubsController)
);

// PUT /hubs/:hubId/resources/:resourceId - Update hub resource
router.put(
  '/:hubId/resources/:resourceId',
  requireRole('admin', 'physician', 'nurse_practitioner'),
  hubsController.updateHubResource.bind(hubsController)
);

// DELETE /hubs/:hubId/resources/:resourceId - Delete hub resource
router.delete(
  '/:hubId/resources/:resourceId',
  requireRole('admin', 'physician', 'nurse_practitioner'),
  hubsController.deleteHubResource.bind(hubsController)
);

// Hub Notes
// POST /hubs/:hubId/notes - Create or update hub note
router.post(
  '/:hubId/notes',
  requireRole('admin', 'physician', 'nurse_practitioner', 'nurse'),
  hubsController.createOrUpdateHubNote.bind(hubsController)
);

// DELETE /hubs/:hubId/notes/:noteId - Delete hub note
router.delete(
  '/:hubId/notes/:noteId',
  requireRole('admin', 'physician', 'nurse_practitioner'),
  hubsController.deleteHubNote.bind(hubsController)
);

// Hub Templates
// POST /hubs/:hubId/templates - Create hub template (hubId optional)
router.post(
  '/:hubId/templates',
  requireRole('admin', 'physician', 'nurse_practitioner'),
  hubsController.createHubTemplate.bind(hubsController)
);

// PUT /hubs/templates/:templateId - Update hub template
router.put(
  '/templates/:templateId',
  requireRole('admin', 'physician', 'nurse_practitioner'),
  hubsController.updateHubTemplate.bind(hubsController)
);

// DELETE /hubs/templates/:templateId - Delete hub template
router.delete(
  '/templates/:templateId',
  requireRole('admin', 'physician', 'nurse_practitioner'),
  hubsController.deleteHubTemplate.bind(hubsController)
);

export default router;

