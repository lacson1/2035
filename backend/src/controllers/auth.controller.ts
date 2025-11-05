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

      const result = await authService.login(email, password, ipAddress, userAgent);

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
      const userId = (req as any).user?.userId;
      const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

      // Delete session from database if refresh token is provided
      if (refreshToken && userId) {
        try {
          await prisma.session.deleteMany({
            where: {
              refreshToken,
              userId,
            },
          });
        } catch (error) {
          // Continue with logout even if session deletion fails
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to delete session:', error);
          }
        }
      } else if (userId) {
        // If no refresh token provided but user ID exists, delete all sessions for user
        // (for logout from all devices)
        try {
          await prisma.session.deleteMany({
            where: { userId },
          });
        } catch (error) {
          // Continue with logout even if session deletion fails
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to delete user sessions:', error);
          }
        }
      }
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

  async register(req: Request, res: Response, next: NextFunction) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
    const userAgent = req.headers['user-agent'];
    
    try {
      const { email, password, firstName, lastName, username } = req.body;

      if (!email || !password || !firstName || !lastName) {
        await auditService.logAuthEvent(
          undefined,
          email,
          'REGISTER',
          ipAddress,
          userAgent,
          false,
          'Email, password, first name, and last name are required'
        );
        throw new UnauthorizedError('Email, password, first name, and last name are required');
      }

      const result = await authService.register(
        email,
        password,
        firstName,
        lastName,
        username,
        ipAddress,
        userAgent
      );

      // Log successful registration
      await auditService.logAuthEvent(
        result.user.id,
        result.user.email,
        'REGISTER',
        ipAddress,
        userAgent,
        true
      );

      res.status(201).json({
        data: result,
        message: 'Account created successfully',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      await auditService.logAuthEvent(
        undefined,
        req.body?.email,
        'REGISTER',
        ipAddress,
        userAgent,
        false,
        errorMessage
      );
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

