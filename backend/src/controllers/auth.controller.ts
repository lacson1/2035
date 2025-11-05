import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { auditService } from '../services/audit.service';
import { UnauthorizedError } from '../utils/errors';
import prisma from '../config/database';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
    const userAgent = req.headers['user-agent'];
    
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        // Log failed login attempt
        await auditService.logAuthEvent(
          undefined,
          email,
          'LOGIN',
          ipAddress,
          userAgent,
          false,
          'Email and password are required'
        );
        throw new UnauthorizedError('Email and password are required');
      }

      const result = await authService.login(email, password);

      // Log successful login
      await auditService.logAuthEvent(
        result.user.id,
        result.user.email,
        'LOGIN',
        ipAddress,
        userAgent,
        true
      );

      res.json({
        data: result,
      });
    } catch (error) {
      // Log failed login attempt
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      await auditService.logAuthEvent(
        undefined,
        req.body?.email,
        'LOGIN',
        ipAddress,
        userAgent,
        false,
        errorMessage
      );
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Refresh token should be in HTTP-only cookie or body
      const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token required');
      }

      const { accessToken } = await authService.refreshToken(refreshToken);

      res.json({
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Log logout
      if (req.user) {
        await auditService.logAuthEvent(
          req.user.userId,
          req.user.email,
          'LOGOUT',
          req.ip || req.headers['x-forwarded-for'] as string,
          req.headers['user-agent'],
          true
        );
      }
      
      res.json({
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }

      // Fetch fresh user data
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          specialty: true,
          department: true,
          phone: true,
          avatarUrl: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      res.json({
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

