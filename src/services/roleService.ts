import { apiClient } from './api';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  color?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rolePermissions?: Array<{
    id: string;
    permission: Permission;
  }>;
}

export interface CreateRoleData {
  code: string;
  name: string;
  description?: string;
  color?: string;
  permissions?: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  permissions?: string[];
}

export const roleService = {
  async getAllRoles(includePermissions = true): Promise<Role[]> {
    const response = await apiClient.get<Role[]>('/v1/roles', {
      includePermissions: includePermissions.toString(),
    });
    return response.data;
  },

  async getRoleById(id: string, includePermissions = true): Promise<Role> {
    const response = await apiClient.get<Role>(`/v1/roles/${id}`, {
      includePermissions: includePermissions.toString(),
    });
    return response.data;
  },

  async getRoleByCode(code: string, includePermissions = true): Promise<Role> {
    const response = await apiClient.get<Role>(`/v1/roles/code/${code}`, {
      includePermissions: includePermissions.toString(),
    });
    return response.data;
  },

  async createRole(data: CreateRoleData): Promise<Role> {
    const response = await apiClient.post<Role>('/v1/roles', data);
    return response.data;
  },

  async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
    const response = await apiClient.put<Role>(`/v1/roles/${id}`, data);
    return response.data;
  },

  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/v1/roles/${id}`);
  },

  async getRolePermissions(id: string): Promise<Permission[]> {
    const response = await apiClient.get<Permission[]>(`/v1/roles/${id}/permissions`);
    return response.data;
  },

  async addPermissionToRole(roleId: string, permissionCode: string): Promise<Role> {
    const response = await apiClient.post<Role>(`/v1/roles/${roleId}/permissions`, {
      permissionCode,
    });
    return response.data;
  },

  async removePermissionFromRole(roleId: string, permissionCode: string): Promise<Role> {
    const response = await apiClient.delete<Role>(`/v1/roles/${roleId}/permissions/${permissionCode}`);
    return response.data;
  },
};

export const permissionService = {
  async getAllPermissions(filters?: {
    category?: string;
    isActive?: boolean;
  }): Promise<Permission[]> {
    const params: Record<string, string> = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.isActive !== undefined) params.isActive = filters.isActive.toString();
    const response = await apiClient.get<Permission[]>('/v1/permissions', params);
    return response.data;
  },

  async getPermissionById(id: string): Promise<Permission> {
    const response = await apiClient.get<Permission>(`/v1/permissions/${id}`);
    return response.data;
  },

  async getPermissionByCode(code: string): Promise<Permission> {
    const response = await apiClient.get<Permission>(`/v1/permissions/code/${code}`);
    return response.data;
  },

  async createPermission(data: {
    code: string;
    name: string;
    description?: string;
    category?: string;
  }): Promise<Permission> {
    const response = await apiClient.post<Permission>('/v1/permissions', data);
    return response.data;
  },

  async updatePermission(
    id: string,
    data: {
      name?: string;
      description?: string;
      category?: string;
      isActive?: boolean;
    }
  ): Promise<Permission> {
    const response = await apiClient.put<Permission>(`/v1/permissions/${id}`, data);
    return response.data;
  },

  async deletePermission(id: string): Promise<void> {
    await apiClient.delete(`/v1/permissions/${id}`);
  },

  async getPermissionCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/v1/permissions/categories');
    return response.data;
  },
};

