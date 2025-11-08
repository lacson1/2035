import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// GET /users/providers - Get providers list (available to all authenticated users for assignment)
router.get(
  '/providers',
  authenticate,
  usersController.getProviders.bind(usersController)
);

// GET /users - Get all users (admin only)
router.get(
  '/',
  authenticate,
  requireRole('admin'),
  usersController.getUsers.bind(usersController)
);

// POST /users - Create new user (admin only)
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  usersController.createUser.bind(usersController)
);

// GET /users/:id - Get single user (admin only)
router.get(
  '/:id',
  authenticate,
  requireRole('admin'),
  usersController.getUser.bind(usersController)
);

// PUT /users/:id - Update user (admin only)
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  usersController.updateUser.bind(usersController)
);

// DELETE /users/:id - Delete user (admin only)
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  usersController.deleteUser.bind(usersController)
);

// GET /users/:id/permissions - Get user permissions
router.get(
  '/:id/permissions',
  authenticate,
  requireRole('admin'),
  usersController.getUserPermissions.bind(usersController)
);

export default router;

