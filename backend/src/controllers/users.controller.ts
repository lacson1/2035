import { Request, Response, NextFunction } from 'express';
import { usersService, UserListParams } from '../services/users.service';
import { logger } from '../utils/logger';

export class UsersController {
  /**
   * Get list of users (admin only for full list, or providers for assignment)
   */
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug('getUsers called', { user: req.user, query: req.query });
      
      const params: UserListParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
        role: req.query.role as string,
        search: req.query.search as string,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : true,
      };

      logger.debug('Calling usersService.getUsers', params);
      const result = await usersService.getUsers(params);
      logger.debug('getUsers result', {
        itemsCount: result.items.length,
        total: result.total,
        page: result.page,
      });

      res.json({
        data: {
          users: result.items,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      logger.error('Error in getUsers', error);
      next(error);
    }
  }

  /**
   * Get providers list (available to all authenticated users for assignment)
   */
  async getProviders(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug('getProviders called', { user: req.user, query: req.query });
      
      const role = req.query.role as string;
      const search = req.query.search as string;

      logger.debug('Calling usersService.getProviders', { role, search });
      const providers = await usersService.getProviders({ role, search });
      logger.debug('getProviders result', { 
        count: providers.length,
        sample: providers.length > 0 ? {
          id: providers[0].id,
          name: `${providers[0].firstName} ${providers[0].lastName}`,
          role: providers[0].role,
        } : null
      });

      res.json({
        data: providers,
      });
    } catch (error) {
      logger.error('Error in getProviders', error);
      next(error);
    }
  }

  /**
   * Get single user by ID
   */
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await usersService.getUserById(id);

      res.json({
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new user (admin only)
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        username,
        role,
        specialty,
        department,
        phone,
      } = req.body;

      if (!email || !password || !firstName || !lastName) {
        throw new (await import('../utils/errors')).ValidationError(
          'Email, password, first name, and last name are required'
        );
      }

      const user = await usersService.createUser({
        email,
        password,
        firstName,
        lastName,
        username,
        role,
        specialty,
        department,
        phone,
      });

      res.status(201).json({
        data: user,
        message: 'User created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user (admin only)
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const {
        email,
        firstName,
        lastName,
        username,
        role,
        specialty,
        department,
        phone,
        isActive,
        avatarUrl,
      } = req.body;

      const user = await usersService.updateUser(id, {
        email,
        firstName,
        lastName,
        username,
        role,
        specialty,
        department,
        phone,
        isActive,
        avatarUrl,
      });

      res.json({
        data: user,
        message: 'User updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (admin only) - soft delete
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await usersService.deleteUser(id);

      res.json({
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const permissions = await usersService.getUserPermissions(id);

      res.json({
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset user password (admin only)
   */
  async resetUserPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        throw new (await import('../utils/errors')).ValidationError(
          'New password is required'
        );
      }

      await usersService.resetUserPassword(id, newPassword);

      res.json({
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();

