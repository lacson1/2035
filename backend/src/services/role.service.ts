import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';

const prisma = new PrismaClient();

export interface CreateRoleData {
  code: string;
  name: string;
  description?: string;
  color?: string;
  permissions?: string[]; // Permission codes
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  permissions?: string[]; // Permission codes
}

export class RoleService {
  async getAllRoles(includePermissions = true) {
    return prisma.role.findMany({
      where: {
        isActive: true,
      },
      include: {
        rolePermissions: includePermissions
          ? {
              include: {
                permission: true,
              },
            }
          : false,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getRoleById(roleId: string, includePermissions = true) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: includePermissions
          ? {
              include: {
                permission: true,
              },
            }
          : false,
      },
    });

    if (!role) {
      throw new NotFoundError('Role', roleId);
    }

    return role;
  }

  async getRoleByCode(code: string, includePermissions = true) {
    const role = await prisma.role.findUnique({
      where: { code },
      include: {
        rolePermissions: includePermissions
          ? {
              include: {
                permission: true,
              },
            }
          : false,
      },
    });

    if (!role) {
      throw new NotFoundError('Role', code);
    }

    return role;
  }

  async createRole(data: CreateRoleData) {
    // Check if role code already exists
    const existing = await prisma.role.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ValidationError(`Role with code "${data.code}" already exists`);
    }

    // Validate permissions if provided
    if (data.permissions && data.permissions.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: {
          code: { in: data.permissions },
          isActive: true,
        },
      });

      if (permissions.length !== data.permissions.length) {
        const foundCodes = permissions.map((p) => p.code);
        const missing = data.permissions.filter((code) => !foundCodes.includes(code));
        throw new ValidationError(`Invalid permission codes: ${missing.join(', ')}`);
      }
    }

    // Create role with permissions
    const role = await prisma.role.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        color: data.color,
        isSystem: false,
        isActive: true,
        rolePermissions: data.permissions
          ? {
              create: data.permissions.map((permissionCode) => ({
                permission: {
                  connect: { code: permissionCode },
                },
              })),
            }
          : undefined,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return role;
  }

  async updateRole(roleId: string, data: UpdateRoleData) {
    const role = await this.getRoleById(roleId, false);

    // System roles cannot be deactivated
    if (data.isActive === false && role.isSystem) {
      throw new ValidationError('System roles cannot be deactivated');
    }

    // Validate permissions if provided
    if (data.permissions && data.permissions.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: {
          code: { in: data.permissions },
          isActive: true,
        },
      });

      if (permissions.length !== data.permissions.length) {
        const foundCodes = permissions.map((p) => p.code);
        const missing = data.permissions.filter((code) => !foundCodes.includes(code));
        throw new ValidationError(`Invalid permission codes: ${missing.join(', ')}`);
      }
    }

    // Update role permissions if provided
    if (data.permissions !== undefined) {
      // Delete existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId },
      });

      // Create new permissions
      if (data.permissions.length > 0) {
        // First, resolve all permission IDs
        const permissionIds = await Promise.all(
          data.permissions.map(async (permissionCode) => {
            const permission = await prisma.permission.findUnique({
              where: { code: permissionCode },
            });
            if (!permission) {
              throw new NotFoundError('Permission', permissionCode);
            }
            return permission.id;
          })
        );

        // Then create role permissions
        await prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        });
      }
    }

    // Update role fields
    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        isActive: data.isActive,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return updatedRole;
  }

  async deleteRole(roleId: string) {
    const role = await this.getRoleById(roleId, false);

    if (role.isSystem) {
      throw new ValidationError('System roles cannot be deleted');
    }

    // Check if any users have this role
    const userCount = await prisma.user.count({
      where: { role: role.code as any },
    });

    if (userCount > 0) {
      throw new ValidationError(
        `Cannot delete role: ${userCount} user(s) are assigned to this role`
      );
    }

    await prisma.role.delete({
      where: { id: roleId },
    });

    return { success: true };
  }

  async getRolePermissions(roleId: string) {
    // Verify role exists
    await this.getRoleById(roleId, false);
    
    // Fetch permissions directly
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });

    return rolePermissions.map((rp) => rp.permission);
  }

  async addPermissionToRole(roleId: string, permissionCode: string) {
    const role = await this.getRoleById(roleId, false);
    const permission = await prisma.permission.findUnique({
      where: { code: permissionCode },
    });

    if (!permission) {
      throw new NotFoundError('Permission', permissionCode);
    }

    if (!permission.isActive) {
      throw new ValidationError('Cannot add inactive permission to role');
    }

    // Check if already exists
    const existing = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId: permission.id,
        },
      },
    });

    if (existing) {
      throw new ValidationError('Permission already assigned to this role');
    }

    await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId: permission.id,
      },
    });

    return this.getRoleById(roleId, true);
  }

  async removePermissionFromRole(roleId: string, permissionCode: string) {
    const role = await this.getRoleById(roleId, false);
    const permission = await prisma.permission.findUnique({
      where: { code: permissionCode },
    });

    if (!permission) {
      throw new NotFoundError('Permission', permissionCode);
    }

    await prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: permission.id,
      },
    });

    return this.getRoleById(roleId, true);
  }
}

