import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import {
  Users,
  Edit,
  Trash2,
  Search,
  Shield,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  X,
  Eye,
  EyeOff,
  Save,
  UserPlus,
} from "lucide-react";
import { User, UserRole } from "../types";
import { useUsers } from "../hooks/useUsers";
import { useToast } from "../context/ToastContext";
import { getAllRoles, getRoleName, getRolePermissions, hasPermission } from "../data/roles";
import { logger } from "../utils/logger";

interface UserManagementProps {
  currentUser: User | null;
  onUserChange?: (user: User) => void;
}

export default function UserManagement({ currentUser }: UserManagementProps) {
  const { users: loadedUsers, isLoading: isLoadingUsers, error: usersError } = useUsers();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);

  // Debug logging
  useEffect(() => {
    logger.debug('UserManagement - Current user:', currentUser);
    logger.debug('UserManagement - Loaded users:', loadedUsers);
    logger.debug('UserManagement - Loading:', isLoadingUsers);
    logger.debug('UserManagement - Error:', usersError);
  }, [currentUser, loadedUsers, isLoadingUsers, usersError]);

  // Update users when loaded from API - always update, even if empty
  useEffect(() => {
    logger.debug('UserManagement - Setting users from loadedUsers:', loadedUsers.length);
    setUsers(loadedUsers);
  }, [loadedUsers]);

  // Show error if users failed to load
  useEffect(() => {
    if (usersError) {
      logger.error('UserManagement - Failed to load users:', usersError);
      toast.error(usersError.message || 'Failed to load users');
    }
  }, [usersError, toast]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [openAddEdit, setOpenAddEdit] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPermissions, setShowPermissions] = useState<string | null>(null);

  const canManageUsers = currentUser && hasPermission(currentUser.role, "manage_users");

  const formData = {
    username: editingUser?.username || "",
    email: editingUser?.email || "",
    firstName: editingUser?.firstName || "",
    lastName: editingUser?.lastName || "",
    role: (editingUser?.role || "receptionist") as UserRole,
    specialty: editingUser?.specialty || "",
    department: editingUser?.department || "",
    phone: editingUser?.phone || "",
    isActive: editingUser?.isActive ?? true,
    password: "", // For new users only
  };

  const [formState, setFormState] = useState(formData);

  useEffect(() => {
    if (editingUser) {
      setFormState({
        username: editingUser.username,
        email: editingUser.email,
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        role: editingUser.role,
        specialty: editingUser.specialty || "",
        department: editingUser.department || "",
        phone: editingUser.phone || "",
        isActive: editingUser.isActive,
        password: "", // Don't show password for existing users
      });
    } else {
      setFormState({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        role: "receptionist",
        specialty: "",
        department: "",
        phone: "",
        isActive: true,
        password: "",
      });
    }
  }, [editingUser]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.specialty?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!canManageUsers) return;

    try {
      const { userService } = await import("../services/users");
      
      if (editingUser) {
        // Update existing user
        const updatedUser = await userService.updateUser(editingUser.id, formState);
        setUsers(users.map((u) => (u.id === editingUser.id ? updatedUser.data : u)));
        toast.success('User updated successfully');
      } else {
        // Create new user - need password
        if (!formState.password || formState.password.length < 8) {
          toast.warning('Password is required and must be at least 8 characters');
          return;
        }
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newUser = await userService.createUser({
          ...formState,
          password: (formState as any).password,
        } as any);
        setUsers([...users, newUser.data]);
        toast.success('User created successfully');
      }

      setOpenAddEdit(false);
      setEditingUser(null);
    } catch (error: any) {
      logger.error('Failed to save user:', error);
      toast.error(error?.message || 'Failed to save user');
    }
  };

  const handleDelete = (userId: string) => {
    if (!canManageUsers || !confirm("Are you sure you want to delete this user?")) return;
    if (userId === currentUser?.id) {
      toast.warning("You cannot delete your own account");
      return;
    }
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleToggleActive = (userId: string) => {
    if (!canManageUsers) return;
    if (userId === currentUser?.id) {
      toast.warning("You cannot deactivate your own account");
      return;
    }
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const getRoleColor = (role: UserRole) => {
    const colorMap: Record<UserRole, string> = {
      admin: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700",
      physician: "bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 border-blue-300 dark:border-teal-700",
      nurse: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700",
      nurse_practitioner: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700",
      physician_assistant: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700",
      medical_assistant: "bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-700",
      receptionist: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700",
      billing: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700",
      pharmacist: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700",
      lab_technician: "bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 border-violet-300 dark:border-violet-700",
      radiologist: "bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-700",
      therapist: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700",
      social_worker: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700",
      care_coordinator: "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-700",
    };
    return colorMap[role] || "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600";
  };

  if (!canManageUsers) {
    return (
      <div className="p-6 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="text-center py-12">
          <Shield className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You do not have permission to manage users. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users size={20} className="text-teal-600 dark:text-teal-400" />
            User Management
            {isLoadingUsers && <span className="text-sm text-gray-500">(Loading...)</span>}
            {usersError && <span className="text-sm text-red-500">(Error: {usersError.message})</span>}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Showing {users.length} user{users.length !== 1 ? 's' : ''} {loadedUsers.length !== users.length && `(${loadedUsers.length} loaded)`}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage system users and their roles
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setOpenAddEdit(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
        >
          <UserPlus size={18} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
        <Search size={16} className="text-gray-600 dark:text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
        <div className="flex gap-3">
          <div>
            <label htmlFor="role-filter" className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              Role
            </label>
            <select
              id="role-filter"
              aria-label="Filter by role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
              className="text-sm border rounded px-3 py-1 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All Roles</option>
              {getAllRoles().map((role) => (
                <option key={role} value={role}>
                  {getRoleName(role)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status-filter" className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              Status
            </label>
            <select
              id="status-filter"
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "active" | "inactive")
              }
              className="text-sm border rounded px-3 py-1 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    {usersError ? (
                      <div>
                        <p className="text-red-600 dark:text-red-400 font-medium mb-1">Failed to load users</p>
                        <p className="text-sm">{usersError.message}</p>
                      </div>
                    ) : searchTerm || roleFilter !== "all" || statusFilter !== "all" ? (
                      "No users match your filters"
                    ) : (
                      "No users found. Click 'Add User' to create one."
                    )}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded border ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {getRoleName(user.role)}
                        </span>
                        {user.specialty && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {user.specialty}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {user.department || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm space-y-1">
                        {user.email && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Mail size={12} />
                            <span className="text-xs">{user.email}</span>
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Phone size={12} />
                            <span className="text-xs">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {user.isActive ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                            <CheckCircle size={14} />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-sm">
                            <XCircle size={14} />
                            Inactive
                          </span>
                        )}
                        {user.lastLogin && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowPermissions(showPermissions === user.id ? null : user.id)}
                          className="p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded"
                          title="View Permissions"
                        >
                          <Shield size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setOpenAddEdit(true);
                          }}
                          className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user.id)}
                          className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"
                          title={user.isActive ? "Deactivate" : "Activate"}
                        >
                          {user.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Permissions Detail */}
        {showPermissions && (
          <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
            {(() => {
              const user = users.find((u) => u.id === showPermissions);
              const userRole = (user?.role || "receptionist") as UserRole;
              const permissions = getRolePermissions(userRole);
              return (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      Permissions for {user?.firstName} {user?.lastName}
                    </h4>
                    <button
                      onClick={() => setShowPermissions(null)}
                      aria-label="Close permissions view"
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Permissions for {getRoleName(userRole)} role
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {permissions.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border dark:border-gray-700"
                      >
                        <CheckCircle size={14} className="text-green-500" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {permission.replace(/_/g, " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {openAddEdit && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenAddEdit(false);
              setEditingUser(null);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">
                {editingUser ? "Edit User" : "Add New User"}
              </h4>
              <button
                onClick={() => {
                  setOpenAddEdit(false);
                  setEditingUser(null);
                }}
                aria-label="Close user form"
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label htmlFor="firstName" className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={formState.firstName}
                    onChange={(e) =>
                      setFormState({ ...formState, firstName: e.target.value })
                    }
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={formState.lastName}
                    onChange={(e) =>
                      setFormState({ ...formState, lastName: e.target.value })
                    }
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label htmlFor="username" className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Username</label>
                  <input
                    id="username"
                    type="text"
                    required
                    value={formState.username}
                    onChange={(e) =>
                      setFormState({ ...formState, username: e.target.value })
                    }
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) =>
                      setFormState({ ...formState, email: e.target.value })
                    }
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label htmlFor="role" className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Role</label>
                  <select
                    id="role"
                    aria-label="Select user role"
                    required
                    value={formState.role}
                    onChange={(e) =>
                      setFormState({ ...formState, role: e.target.value as UserRole })
                    }
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                  >
                    {getAllRoles().map((role) => (
                      <option key={role} value={role}>
                        {getRoleName(role)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="department" className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Department</label>
                  <input
                    id="department"
                    type="text"
                    value={formState.department}
                    onChange={(e) =>
                      setFormState({ ...formState, department: e.target.value })
                    }
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label htmlFor="specialty" className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Specialty (Optional)</label>
                  <input
                    id="specialty"
                    type="text"
                    value={formState.specialty}
                    onChange={(e) =>
                      setFormState({ ...formState, specialty: e.target.value })
                    }
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    value={formState.phone}
                    onChange={(e) =>
                      setFormState({ ...formState, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                  />
                </div>
              </div>

              {/* Password field - only for new users */}
              {!editingUser && (
                <div>
                  <label htmlFor="password" className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    required={!editingUser}
                    value={formState.password}
                    onChange={(e) =>
                      setFormState({ ...formState, password: e.target.value })
                    }
                    placeholder="Enter password (min 8 characters)"
                    minLength={8}
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Password must be at least 8 characters long
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formState.isActive}
                  onChange={(e) =>
                    setFormState({ ...formState, isActive: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <label htmlFor="isActive" className="text-base">
                  Active User
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setOpenAddEdit(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-teal-500 text-white hover:bg-teal-600 flex items-center gap-2"
                >
                  <Save size={16} />
                  {editingUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

