import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';

const prisma = new PrismaClient();

export interface CreatePermissionData {
  code: string;
  name: string;
  description?: string;
  category?: string;
}

export interface UpdatePermissionData {
  name?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

export class PermissionService {
  async getAllPermissions(filters?: { category?: string; isActive?: boolean }) {
    return prisma.permission.findMany({
      where: {
        ...(filters?.category && { category: filters.category }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async getPermissionById(permissionId: string) {
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundError('Permission', permissionId);
    }

    return permission;
  }

  async getPermissionByCode(code: string) {
    const permission = await prisma.permission.findUnique({
      where: { code },
    });

    if (!permission) {
      throw new NotFoundError('Permission', code);
    }

    return permission;
  }

  async createPermission(data: CreatePermissionData) {
    // Check if permission code already exists
    const existing = await prisma.permission.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ValidationError(`Permission with code "${data.code}" already exists`);
    }

    const permission = await prisma.permission.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category,
        isActive: true,
      },
    });

    return permission;
  }

  async updatePermission(permissionId: string, data: UpdatePermissionData) {
    await this.getPermissionById(permissionId); // Verify exists

    const permission = await prisma.permission.update({
      where: { id: permissionId },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        isActive: data.isActive,
      },
    });

    return permission;
  }

  async deletePermission(permissionId: string) {
    const permission = await this.getPermissionById(permissionId);

    // Check if permission is assigned to any roles
    const roleCount = await prisma.rolePermission.count({
      where: { permissionId },
    });

    if (roleCount > 0) {
      throw new ValidationError(
        `Cannot delete permission: assigned to ${roleCount} role(s)`
      );
    }

    await prisma.permission.delete({
      where: { id: permissionId },
    });

    return { success: true };
  }

  async getPermissionCategories() {
    const categories = await prisma.permission.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      where: {
        category: { not: null },
        isActive: true,
      },
    });

    return categories.map((c) => c.category).filter(Boolean) as string[];
  }
}

