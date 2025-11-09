import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { body, validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';

const router = Router();

const validate = (validations: any[]) => {
  return async (req: any, res: any, next: any) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMap: Record<string, string[]> = {};
    errors.array().forEach((error: any) => {
      if (error.path) {
        if (!errorMap[error.path]) {
          errorMap[error.path] = [];
        }
        errorMap[error.path].push(error.msg);
      }
    });

    next(new ValidationError('Validation failed', errorMap));
  };
};

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

// POST /users/:id/reset-password - Reset user password (admin only)
router.post(
  '/:id/reset-password',
  authenticate,
  requireRole('admin'),
  validate([
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number')
      .matches(/[^A-Za-z0-9]/)
      .withMessage('Password must contain at least one special character'),
  ]),
  usersController.resetUserPassword.bind(usersController)
);

export default router;

