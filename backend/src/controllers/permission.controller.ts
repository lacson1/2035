import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/permission.service';

const permissionService = new PermissionService();

export class PermissionController {
  async getAllPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: { category?: string; isActive?: boolean } = {};
      if (req.query.category) {
        filters.category = req.query.category as string;
      }
      if (req.query.isActive !== undefined) {
        filters.isActive = req.query.isActive === 'true';
      }
      const permissions = await permissionService.getAllPermissions(filters);
      res.json(permissions);
    } catch (error) {
      next(error);
    }
  }

  async getPermissionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const permission = await permissionService.getPermissionById(id);
      res.json(permission);
    } catch (error) {
      next(error);
    }
  }

  async getPermissionByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const permission = await permissionService.getPermissionByCode(code);
      res.json(permission);
    } catch (error) {
      next(error);
    }
  }

  async createPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const permission = await permissionService.createPermission(req.body);
      res.status(201).json(permission);
    } catch (error) {
      next(error);
    }
  }

  async updatePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const permission = await permissionService.updatePermission(id, req.body);
      res.json(permission);
    } catch (error) {
      next(error);
    }
  }

  async deletePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await permissionService.deletePermission(id);
      res.json({ success: true, message: 'Permission deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getPermissionCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await permissionService.getPermissionCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }
}

