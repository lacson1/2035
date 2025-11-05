import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();
const roleController = new RoleController();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

// Get all roles
router.get('/', roleController.getAllRoles.bind(roleController));

// Get role by ID
router.get('/:id', roleController.getRoleById.bind(roleController));

// Get role by code
router.get('/code/:code', roleController.getRoleByCode.bind(roleController));

// Create new role
router.post('/', roleController.createRole.bind(roleController));

// Update role
router.put('/:id', roleController.updateRole.bind(roleController));

// Delete role
router.delete('/:id', roleController.deleteRole.bind(roleController));

// Get role permissions
router.get('/:id/permissions', roleController.getRolePermissions.bind(roleController));

// Add permission to role
router.post('/:id/permissions', roleController.addPermissionToRole.bind(roleController));

// Remove permission from role (permissionCode as query param)
router.delete('/:id/permissions/:permissionCode', roleController.removePermissionFromRole.bind(roleController));

export default router;

