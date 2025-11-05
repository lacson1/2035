import { useUser } from "../context/UserContext";
import { Permission } from "../types";
import { hasPermission } from "../data/roles";

export const usePermissions = () => {
  const { currentUser } = useUser();

  const checkPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    return hasPermission(currentUser.role, permission);
  };

  const checkMultiplePermissions = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => checkPermission(permission));
  };

  const requirePermission = (permission: Permission): boolean => {
    if (!checkPermission(permission)) {
      if (import.meta.env.DEV) {
        console.warn(`Permission denied: ${permission} for user ${currentUser?.role}`);
      }
      return false;
    }
    return true;
  };

  return {
    currentUser,
    checkPermission,
    checkMultiplePermissions,
    requirePermission,
    isAdmin: currentUser?.role === "admin",
    isPhysician: currentUser?.role === "physician",
    canPrescribe: checkPermission("prescribe_medications"),
    canManageUsers: checkPermission("manage_users"),
    canEditPatients: checkPermission("edit_patients"),
    canCreateNotes: checkPermission("create_notes"),
    canScheduleAppointments: checkPermission("schedule_appointments"),
  };
};

