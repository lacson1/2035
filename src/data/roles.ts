/**
 * Role Definitions and Permissions
 * 
 * This file contains role definitions. In production, these should be:
 * 1. Loaded from the backend API
 * 2. Or maintained as configuration
 * 
 * For now, kept as minimal reference data.
 */

export type UserRole = 
  | 'admin'
  | 'physician'
  | 'nurse'
  | 'nurse_practitioner'
  | 'physician_assistant'
  | 'medical_assistant'
  | 'receptionist'
  | 'billing'
  | 'pharmacist'
  | 'lab_technician'
  | 'radiologist'
  | 'therapist'
  | 'social_worker'
  | 'care_coordinator'
  | 'read_only';

export type Permission = 
  | 'patients:read'
  | 'patients:write'
  | 'patients:delete'
  | 'medications:read'
  | 'medications:write'
  | 'appointments:read'
  | 'appointments:write'
  | 'clinical_notes:read'
  | 'clinical_notes:write'
  | 'imaging:read'
  | 'imaging:write'
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'settings:read'
  | 'settings:write'
  | 'billing:read'
  | 'billing:write';

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'patients:read', 'patients:write', 'patients:delete',
    'medications:read', 'medications:write',
    'appointments:read', 'appointments:write',
    'clinical_notes:read', 'clinical_notes:write',
    'imaging:read', 'imaging:write',
    'users:read', 'users:write', 'users:delete',
    'settings:read', 'settings:write',
    'billing:read', 'billing:write',
  ],
  physician: [
    'patients:read', 'patients:write',
    'medications:read', 'medications:write',
    'appointments:read', 'appointments:write',
    'clinical_notes:read', 'clinical_notes:write',
    'imaging:read', 'imaging:write',
  ],
  nurse: [
    'patients:read',
    'medications:read',
    'appointments:read', 'appointments:write',
    'clinical_notes:read', 'clinical_notes:write',
  ],
  nurse_practitioner: [
    'patients:read', 'patients:write',
    'medications:read', 'medications:write',
    'appointments:read', 'appointments:write',
    'clinical_notes:read', 'clinical_notes:write',
  ],
  physician_assistant: [
    'patients:read', 'patients:write',
    'medications:read', 'medications:write',
    'appointments:read', 'appointments:write',
    'clinical_notes:read', 'clinical_notes:write',
  ],
  medical_assistant: [
    'patients:read',
    'appointments:read', 'appointments:write',
  ],
  receptionist: [
    'patients:read',
    'appointments:read', 'appointments:write',
  ],
  billing: [
    'patients:read',
    'billing:read', 'billing:write',
  ],
  pharmacist: [
    'patients:read',
    'medications:read', 'medications:write',
  ],
  lab_technician: [
    'patients:read',
  ],
  radiologist: [
    'patients:read',
    'imaging:read', 'imaging:write',
  ],
  therapist: [
    'patients:read',
    'clinical_notes:read', 'clinical_notes:write',
  ],
  social_worker: [
    'patients:read',
    'clinical_notes:read', 'clinical_notes:write',
  ],
  care_coordinator: [
    'patients:read',
    'appointments:read', 'appointments:write',
  ],
  read_only: [
    'patients:read',
    'medications:read',
    'appointments:read',
    'clinical_notes:read',
    'imaging:read',
    'billing:read',
    'users:read',
    'settings:read',
  ],
};

// Role display names
const roleNames: Record<UserRole, string> = {
  admin: "Administrator",
  physician: "Physician",
  nurse: "Nurse",
  nurse_practitioner: "Nurse Practitioner",
  physician_assistant: "Physician Assistant",
  medical_assistant: "Medical Assistant",
  receptionist: "Receptionist",
  billing: "Billing Specialist",
  pharmacist: "Pharmacist",
  lab_technician: "Lab Technician",
  radiologist: "Radiologist",
  therapist: "Therapist",
  social_worker: "Social Worker",
  care_coordinator: "Care Coordinator",
  read_only: "Read Only",
};

// Permission mapping from types.ts format to roles.ts format
const permissionMapping: Record<string, Permission[]> = {
  "manage_users": ["users:write", "users:delete"],
  "prescribe_medications": ["medications:write"],
  "edit_patients": ["patients:write"],
  "create_notes": ["clinical_notes:write"],
  "schedule_appointments": ["appointments:write"],
  "view_patients": ["patients:read"],
  "view_medications": ["medications:read"],
  "view_notes": ["clinical_notes:read"],
  "view_appointments": ["appointments:read"],
  "view_imaging": ["imaging:read"],
  "view_consultations": ["patients:read", "clinical_notes:read"],
  "view_telemedicine": ["patients:read"],
  "order_imaging": ["imaging:write"],
  "view_labs": ["patients:read"],
  "order_labs": ["patients:write"],
  "view_billing": ["billing:read"],
  "edit_billing": ["billing:write"],
  "manage_settings": ["settings:write"],
};

export function getAllRoles(): UserRole[] {
  return Object.keys(rolePermissions) as UserRole[];
}

export function getRoleName(role: UserRole): string {
  return roleNames[role] || role;
}

export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] || [];
}

// Support both permission formats (types.ts format and roles.ts format)
export function hasPermission(role: UserRole, permission: string | Permission): boolean {
  const rolePerms = rolePermissions[role] || [];
  
  // Check direct match (roles.ts format)
  if (rolePerms.includes(permission as Permission)) {
    return true;
  }
  
  // Check mapped permissions (types.ts format)
  const mappedPerms = permissionMapping[permission];
  if (mappedPerms) {
    return mappedPerms.some(p => rolePerms.includes(p));
  }
  
  return false;
}

