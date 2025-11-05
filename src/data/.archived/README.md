# Archived Mock Data Files

This directory contains archived mock data files that were used during development.

These files have been removed from the active codebase to ensure the application uses only real API data.

## Archived Files

- `patients.ts` - Mock patient data
- `users.ts` - Mock user data  
- `hubs.ts` - Hub configuration (reference data)
- `questionnaires.ts` - Questionnaire templates (reference data)
- `roles.ts` - Role definitions (reference data)
- `specialtyTemplates.ts` - Specialty templates (reference data)

## Migration Notes

### Patients
- Now loaded from `/api/v1/patients` endpoint
- Managed in `DashboardContext` via `patientService`

### Users
- Now loaded from `/api/v1/auth/me` endpoint
- Managed in `AuthContext`
- User list can be fetched from `/api/v1/users` (admin only)

### Reference Data (Hubs, Roles, etc.)
- These may need to be:
  1. Moved to backend API endpoints
  2. Kept as configuration files (if they're static)
  3. Loaded from database

**Note:** Some components may still reference these files. Update those components to use API endpoints or configuration services.

---

**Archived:** 2024
**Reason:** Remove mock data to ensure production-ready API-only data flow

