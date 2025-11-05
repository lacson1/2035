import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';

const roleService = new RoleService();

export class RoleController {
  async getAllRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const includePermissions = req.query.includePermissions !== 'false';
      const roles = await roleService.getAllRoles(includePermissions);
      res.json(roles);
    } catch (error) {
      next(error);
    }
  }

  async getRoleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const includePermissions = req.query.includePermissions !== 'false';
      const role = await roleService.getRoleById(id, includePermissions);
      res.json(role);
    } catch (error) {
      next(error);
    }
  }

  async getRoleByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const includePermissions = req.query.includePermissions !== 'false';
      const role = await roleService.getRoleByCode(code, includePermissions);
      res.json(role);
    } catch (error) {
      next(error);
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleService.createRole(req.body);
      res.status(201).json(role);
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const role = await roleService.updateRole(id, req.body);
      res.json(role);
    } catch (error) {
      next(error);
    }
  }

  async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await roleService.deleteRole(id);
      res.json({ success: true, message: 'Role deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getRolePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const permissions = await roleService.getRolePermissions(id);
      res.json(permissions);
    } catch (error) {
      next(error);
    }
  }

  async addPermissionToRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { permissionCode } = req.body;
      const role = await roleService.addPermissionToRole(id, permissionCode);
      res.json(role);
    } catch (error) {
      next(error);
    }
  }

  async removePermissionFromRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, permissionCode } = req.params;
      const role = await roleService.removePermissionFromRole(id, permissionCode);
      res.json(role);
    } catch (error) {
      next(error);
    }
  }
}

