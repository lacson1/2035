import { Request, Response, NextFunction } from 'express';
import { passwordResetService } from '../services/passwordReset.service';
import { body } from 'express-validator';

export class PasswordResetController {
  /**
   * Request password reset
   * POST /api/v1/auth/password-reset/request
   */
  async requestReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message: 'Email is required',
          status: 400,
        });
      }

      await passwordResetService.requestPasswordReset(email);

      // Always return success (security: don't reveal if email exists)
      res.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password with token
   * POST /api/v1/auth/password-reset/reset
   */
  async reset(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          message: 'Token and password are required',
          status: 400,
        });
      }

      await passwordResetService.resetPassword(token, password);

      res.json({
        message: 'Password reset successfully. You can now login with your new password.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify reset token
   * GET /api/v1/auth/password-reset/verify?token=...
   */
  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          message: 'Token is required',
          status: 400,
        });
      }

      const isValid = await passwordResetService.verifyToken(token);

      if (!isValid) {
        return res.status(400).json({
          message: 'Invalid or expired token',
          status: 400,
        });
      }

      res.json({
        message: 'Token is valid',
        valid: true,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const passwordResetController = new PasswordResetController();

