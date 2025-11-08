import { useUser } from "../context/UserContext";
import { hasPermission } from "../data/roles";
import { logger } from "../utils/logger";

export const usePermissions = () => {
  const { currentUser } = useUser();

  const checkPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    return hasPermission(currentUser.role, permission);
  };

  const checkMultiplePermissions = (permissions: string[]): boolean => {
    return permissions.some((permission) => checkPermission(permission));
  };

  const requirePermission = (permission: string): boolean => {
    if (!checkPermission(permission)) {
      logger.debug(`Permission denied: ${permission} for user ${currentUser?.role}`);
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

