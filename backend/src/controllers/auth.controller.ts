import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { auditService } from '../services/audit.service';
import { UnauthorizedError, ValidationError } from '../utils/errors';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
    const userAgent = req.headers['user-agent'];

    try {
      let { email, password } = req.body;

      if (!email || !password) {
        // Log failed login attempt
        await auditService.logAuthEvent(
          undefined,
          email || 'unknown',
          'LOGIN',
          ipAddress,
          userAgent,
          false,
          'Email and password are required'
        );
        throw new UnauthorizedError('Email and password are required');
      }

      // Normalize email: trim whitespace
      email = email.trim();

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

      // Set refresh token as httpOnly cookie (CSRF protection via SameSite)
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: isProduction, // HTTPS only in production
        sameSite: 'strict', // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/v1/auth',
      });

      // Return only access token (refresh token is in httpOnly cookie)
      res.json({
        data: {
          tokens: {
            accessToken: result.tokens.accessToken,
            // Don't return refreshToken - it's in httpOnly cookie
          },
          user: result.user,
        },
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

      // Optionally refresh the refresh token cookie (rotate)
      // For now, we'll keep the same refresh token until it expires
      
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
          logger.warn('Failed to delete session', error);
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
          logger.warn('Failed to delete user sessions', error);
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

      // Clear refresh token cookie
      res.clearCookie('refreshToken', {
        path: '/api/v1/auth',
      });

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
      let { email, password, firstName, lastName, username } = req.body;

      if (!email || !password || !firstName || !lastName) {
        await auditService.logAuthEvent(
          undefined,
          email || 'unknown',
          'REGISTER',
          ipAddress,
          userAgent,
          false,
          'Email, password, first name, and last name are required'
        );
        throw new UnauthorizedError('Email, password, first name, and last name are required');
      }

      // Normalize email: trim whitespace
      email = email.trim();
      firstName = firstName.trim();
      lastName = lastName.trim();
      if (username) username = username.trim();

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

      // Set refresh token as httpOnly cookie (CSRF protection via SameSite)
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: isProduction, // HTTPS only in production
        sameSite: 'strict', // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/v1/auth',
      });

      // Return only access token (refresh token is in httpOnly cookie)
      res.status(201).json({
        data: {
          tokens: {
            accessToken: result.tokens.accessToken,
            // Don't return refreshToken - it's in httpOnly cookie
          },
          user: result.user,
        },
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

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }

      const { firstName, lastName, email, phone, specialty, department, avatarUrl } = req.body;

      // Build update data object
      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) {
        // Check if email is already taken by another user
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            NOT: { id: req.user.userId },
          },
        });
        if (existingUser) {
          throw new ValidationError('Email already in use', { email: ['Email is already registered'] });
        }
        updateData.email = email;
      }
      if (phone !== undefined) updateData.phone = phone;
      if (specialty !== undefined) updateData.specialty = specialty;
      if (department !== undefined) updateData.department = department;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: req.user.userId },
        data: updateData,
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

      res.json({
        data: updatedUser,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

