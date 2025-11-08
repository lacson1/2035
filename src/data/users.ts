/**
 * Users Data - DEPRECATED
 * 
 * This file is kept for backward compatibility but should not be used.
 * Use the API service instead: import { userService } from '../services/users'
 * 
 * Components should load users from the API endpoint: GET /api/v1/users
 */

import { logger } from '../utils/logger';

export const users: any[] = [];

// These functions are deprecated - use API service instead
export function getCurrentUser(): any {
  return null;
}

export function setCurrentUser(_userId: string): void {
  logger.warn('setCurrentUser is deprecated, use AuthContext instead');
}

export function clearCurrentUser(): void {
  logger.warn('clearCurrentUser is deprecated, use AuthContext logout instead');
}

