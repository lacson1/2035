import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { passwordResetController } from '../controllers/passwordReset.controller';
import { authenticate } from '../middleware/auth.middleware';
import { body, validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';
import { authRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Apply strict rate limiting to authentication endpoints (but not to /me which is a read operation)
// We'll apply it selectively to login, register, and password reset endpoints

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

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sarah.johnson@hospital2035.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: User registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newuser@hospital2035.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: password123
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               username:
 *                 type: string
 *                 example: johndoe
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/register',
  authRateLimiter, // Apply strict rate limiting to registration
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
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
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  ]),
  authController.register.bind(authController)
);

router.post(
  '/login',
  authRateLimiter, // Apply strict rate limiting to login
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authController.login.bind(authController)
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  '/refresh',
  // No rate limiting on refresh - it's already protected by requiring a valid refresh token
  validate([
    body('refreshToken').optional().notEmpty().withMessage('Refresh token is required'),
  ]),
  authController.refresh.bind(authController)
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authenticate, authController.logout.bind(authController));

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticate, authController.me.bind(authController));

/**
 * @swagger
 * /api/v1/auth/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               specialty:
 *                 type: string
 *               department:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router.put(
  '/me',
  authenticate,
  validate([
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  ]),
  authController.updateMe.bind(authController)
);

/**
 * @swagger
 * /api/v1/auth/password-reset/request:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: If email exists, reset link has been sent
 */
router.post(
  '/password-reset/request',
  authRateLimiter,
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
  ]),
  passwordResetController.requestReset.bind(passwordResetController)
);

/**
 * @swagger
 * /api/v1/auth/password-reset/reset:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid token or password
 */
router.post(
  '/password-reset/reset',
  authRateLimiter,
  validate([
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
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
  passwordResetController.reset.bind(passwordResetController)
);

/**
 * @swagger
 * /api/v1/auth/password-reset/verify:
 *   get:
 *     summary: Verify password reset token
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Invalid or expired token
 */
router.get(
  '/password-reset/verify',
  passwordResetController.verify.bind(passwordResetController)
);

export default router;

