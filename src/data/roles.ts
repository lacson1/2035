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
  ],
};

export function getAllRoles(): UserRole[] {
  return Object.keys(rolePermissions) as UserRole[];
}

export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] || [];
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false;
}

