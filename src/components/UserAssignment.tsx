import { useState, useMemo } from "react";
import { UserRole } from "../types";
import { useUsers } from "../hooks/useUsers";
import { UserPlus, X, CheckCircle, User as UserIcon } from "lucide-react";

interface UserAssignmentProps {
  assignedTo?: string | null;
  allowedRoles?: UserRole[];
  label?: string;
  placeholder?: string;
  onAssign: (userId: string | null) => void;
  showCurrentAssignment?: boolean;
  disabled?: boolean;
}

export default function UserAssignment({
  assignedTo,
  allowedRoles,
  label = "Assign to",
  placeholder = "Select user...",
  onAssign,
  showCurrentAssignment = true,
  disabled = false,
}: UserAssignmentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { users } = useUsers();

  // Filter users by allowed roles and active status
  const availableUsers = useMemo(() => {
    let filtered = users.filter((user) => user.isActive);

    if (allowedRoles && allowedRoles.length > 0) {
      filtered = filtered.filter((user) => allowedRoles.includes(user.role));
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`;
      const nameB = `${b.firstName} ${b.lastName}`;
      return nameA.localeCompare(nameB);
    });
  }, [allowedRoles, searchTerm]);

  const assignedUser = useMemo(() => {
    if (!assignedTo) return null;
    return users.find((u) => u.id === assignedTo);
  }, [assignedTo]);

  const handleSelect = (userId: string) => {
    onAssign(userId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onAssign(null);
    setIsOpen(false);
    setSearchTerm("");
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
      physician: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
      nurse: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
      nurse_practitioner: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200",
      physician_assistant: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200",
      lab_technician: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200",
      radiologist: "bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200",
      pharmacist: "bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200",
    };
    return colors[role] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  };

  return (
    <div className="relative">
      <label className="block text-base font-medium mb-2.5">{label}</label>
      
      {/* Current Assignment Display */}
      {showCurrentAssignment && assignedUser && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-blue-600 dark:text-blue-400" size={16} />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {assignedUser.firstName} {assignedUser.lastName}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs px-2 py-0.5 rounded ${getRoleBadgeColor(assignedUser.role)}`}>
                  {assignedUser.role.replace("_", " ")}
                </span>
                {assignedUser.specialty && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {assignedUser.specialty}
                  </span>
                )}
              </div>
            </div>
          </div>
          {!disabled && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
              title="Unassign"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Assignment Dropdown */}
      {!disabled && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors flex items-center justify-between"
          >
            <span className={assignedUser ? "text-gray-900 dark:text-gray-100" : "text-gray-500"}>
              {assignedUser
                ? `${assignedUser.firstName} ${assignedUser.lastName}`
                : placeholder}
            </span>
            <UserPlus size={18} className="text-gray-400" />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              />
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-hidden">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto max-h-48">
                  {availableUsers.length > 0 ? (
                    <div className="py-1">
                      {availableUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleSelect(user.id)}
                          className={`w-full px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                            assignedTo === user.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <UserIcon size={16} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {user.firstName} {user.lastName}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded ${getRoleBadgeColor(user.role)}`}
                                >
                                  {user.role.replace("_", " ")}
                                </span>
                                {user.specialty && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {user.specialty}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {assignedTo === user.id && (
                            <CheckCircle size={16} className="text-blue-600 dark:text-blue-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm
                        ? "No users found matching your search"
                        : allowedRoles && allowedRoles.length > 0
                        ? `No users available with allowed roles: ${allowedRoles.join(", ")}`
                        : "No users available"}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

