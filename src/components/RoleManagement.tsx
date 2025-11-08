import { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Check,
} from 'lucide-react';
import {
  roleService,
  permissionService,
  type Role,
  type Permission,
} from '../services/roleService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RoleManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [roleForm, setRoleForm] = useState({
    code: '',
    name: '',
    description: '',
    color: '',
    permissions: [] as string[],
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rolesData, permissionsData] = await Promise.all([
        roleService.getAllRoles(true),
        permissionService.getAllPermissions({ isActive: true }),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleForm({
      code: '',
      name: '',
      description: '',
      color: '',
      permissions: [],
    });
    setShowRoleModal(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    const rolePermissions = role.rolePermissions?.map((rp) => rp.permission.code) || [];
    setRoleForm({
      code: role.code,
      name: role.name,
      description: role.description || '',
      color: role.color || '',
      permissions: rolePermissions,
    });
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    try {
      setError(null);
      if (editingRole) {
        await roleService.updateRole(editingRole.id, {
          name: roleForm.name,
          description: roleForm.description || undefined,
          color: roleForm.color || undefined,
          permissions: roleForm.permissions,
        });
      } else {
        await roleService.createRole({
          code: roleForm.code,
          name: roleForm.name,
          description: roleForm.description || undefined,
          color: roleForm.color || undefined,
          permissions: roleForm.permissions,
        });
      }
      await loadData();
      setShowRoleModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save role');
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) return;
    if (role.isSystem) {
      toast.warning('System roles cannot be deleted');
      return;
    }

    try {
      setError(null);
      await roleService.deleteRole(role.id);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete role');
    }
  };

  const handleTogglePermission = (permissionCode: string) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionCode)
        ? prev.permissions.filter((p) => p !== permissionCode)
        : [...prev.permissions, permissionCode],
    }));
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const permissionsByCategory = permissions.reduce((acc, perm) => {
    const category = perm.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (!isAdmin) {
    return (
      <div className="p-6 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="text-center py-12">
          <Shield className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You must be an administrator to manage roles and permissions.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading roles and permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield size={20} className="text-teal-600 dark:text-teal-400" />
            Role & Permission Management
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage system roles and their permissions
          </p>
        </div>
        <button
          onClick={handleCreateRole}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
        >
          <Plus size={18} /> Create Role
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="flex gap-4 items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
        <Search size={16} className="text-gray-600 dark:text-gray-400" />
        <input
          type="text"
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      {/* Roles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.map((role) => (
          <div
            key={role.id}
            className="p-4 bg-white dark:bg-gray-800 border rounded-lg dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{role.name}</h4>
                  {role.isSystem && (
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                      System
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{role.code}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditRole(role)}
                  className="p-1 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded"
                  title="Edit Role"
                >
                  <Edit size={16} />
                </button>
                {!role.isSystem && (
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="Delete Role"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            {role.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{role.description}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {role.rolePermissions?.length || 0} permissions
              </span>
              <button
                onClick={() => {
                  setSelectedRole(role);
                  setShowPermissionsModal(true);
                }}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
              >
                View Permissions
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Role Modal */}
      {showRoleModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowRoleModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h4>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Role Code *</label>
                  <input
                    type="text"
                    required
                    value={roleForm.code}
                    onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value })}
                    disabled={!!editingRole}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                    placeholder="e.g., custom_role"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role Name *</label>
                  <input
                    type="text"
                    required
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                    placeholder="e.g., Custom Role"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="text"
                  value={roleForm.color}
                  onChange={(e) => setRoleForm({ ...roleForm, color: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                  placeholder="e.g., blue, #3B82F6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Permissions</label>
                <div className="max-h-64 overflow-y-auto border rounded p-3 dark:border-gray-600">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category} className="mb-4">
                      <h5 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </h5>
                      <div className="space-y-1">
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={roleForm.permissions.includes(perm.code)}
                              onChange={() => handleTogglePermission(perm.code)}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {perm.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRole}
                  className="px-4 py-2 rounded-md bg-teal-500 text-white hover:bg-teal-600 flex items-center gap-2"
                >
                  <Save size={16} />
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Permissions Modal */}
      {showPermissionsModal && selectedRole && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowPermissionsModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">
                Permissions for {selectedRole.name}
              </h4>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {selectedRole.rolePermissions && selectedRole.rolePermissions.length > 0 ? (
                Object.entries(permissionsByCategory).map(([category, perms]) => {
                  const rolePerms = perms.filter((perm) =>
                    selectedRole.rolePermissions?.some((rp) => rp.permission.code === perm.code)
                  );
                  if (rolePerms.length === 0) return null;

                  return (
                    <div key={category} className="mb-4">
                      <h5 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </h5>
                      <div className="space-y-1">
                        {rolePerms.map((perm) => (
                          <div
                            key={perm.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                          >
                            <Check size={14} className="text-green-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {perm.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No permissions assigned</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

