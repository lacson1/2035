/**
 * Users Data - DEPRECATED
 * 
 * This file is kept for backward compatibility but should not be used.
 * Use the API service instead: import { userService } from '../services/users'
 * 
 * Components should load users from the API endpoint: GET /api/v1/users
 */

export const users: any[] = [];

// These functions are deprecated - use API service instead
export function getCurrentUser(): any {
  return null;
}

export function setCurrentUser(_userId: string): void {
  console.warn('setCurrentUser is deprecated, use AuthContext instead');
}

export function clearCurrentUser(): void {
  console.warn('clearCurrentUser is deprecated, use AuthContext logout instead');
}

