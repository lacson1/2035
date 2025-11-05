import { Router } from 'express';
import { PermissionController } from '../controllers/permission.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();
const permissionController = new PermissionController();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

// Get all permissions
router.get('/', permissionController.getAllPermissions.bind(permissionController));

// Get permission categories
router.get('/categories', permissionController.getPermissionCategories.bind(permissionController));

// Get permission by ID
router.get('/:id', permissionController.getPermissionById.bind(permissionController));

// Get permission by code
router.get('/code/:code', permissionController.getPermissionByCode.bind(permissionController));

// Create new permission
router.post('/', permissionController.createPermission.bind(permissionController));

// Update permission
router.put('/:id', permissionController.updatePermission.bind(permissionController));

// Delete permission
router.delete('/:id', permissionController.deletePermission.bind(permissionController));

export default router;

