import { useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/users';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';

interface UseUsersOptions {
  /**
   * If true, allows loading users for assignment purposes even if not admin
   * This is useful for appointment assignment, referrals, etc.
   */
  allowForAssignment?: boolean;
  /**
   * Filter by specific roles
   */
  roles?: string[];
}

/**
 * Hook to load and manage users list
 * By default, only loads users if the current user is an admin
 * Set allowForAssignment=true to allow loading for assignment purposes
 */
export function useUsers(options: UseUsersOptions = {}) {
  const { allowForAssignment = false, roles } = options;
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Allow loading if:
    // 1. User is admin, OR
    // 2. allowForAssignment is true and user is authenticated
    const canLoadUsers = user && (
      user.role === 'admin' || 
      (allowForAssignment && isAuthenticated)
    );

    if (!canLoadUsers) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    // Prevent duplicate requests
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    // Use providers endpoint if allowForAssignment is true (available to all authenticated users)
    // Otherwise use users endpoint (admin only)
    if (allowForAssignment) {
      const params: any = {};
      if (roles && roles.length > 0) {
        // For providers, we can filter by role
        params.role = roles[0]; // Backend supports single role filter
      }

      userService
        .getProviders(params)
        .then((response) => {
          if (cancelled) return;
          
          try {
            // Ensure response.data is an array
            if (!response || !response.data) {
              logger.warn('Providers response missing data:', response);
              setUsers([]);
              return;
            }

            // Ensure response.data is an array
            if (!Array.isArray(response.data)) {
              logger.warn('Providers response.data is not an array:', {
                data: response.data,
                type: typeof response.data,
                isArray: Array.isArray(response.data),
              });
              setUsers([]);
              return;
            }

            let filteredUsers: any[] = response.data;
            
            // Additional filtering by roles if multiple roles specified
            if (roles && roles.length > 1 && Array.isArray(filteredUsers)) {
              filteredUsers = filteredUsers.filter(u => u && roles.includes(u.role));
            }
            
            setUsers(filteredUsers);
            setError(null);
          } catch (error: any) {
            if (cancelled) return;
            logger.error('Error processing providers response:', error);
            setError(new Error(`Error processing providers: ${error?.message || error}`));
            setUsers([]);
          }
        })
        .catch((err: any) => {
          if (cancelled) return;
          
          // Only log actual errors, not expected failures
          if (err?.status !== 404 && err?.status !== 401) {
            logger.error('Failed to load providers:', err);
          }
          
          const errorMessage = err?.message || err?.toString() || 'Unknown error';
          const status = err?.status;
          
          // Create a more descriptive error
          let descriptiveError: Error;
          if (status === 404) {
            descriptiveError = new Error('Providers endpoint not found. Please ensure the backend server is running and has been restarted.');
          } else if (status === 401) {
            descriptiveError = new Error('Authentication required. Please log in again.');
          } else if (status === 403) {
            descriptiveError = new Error('Access denied. You do not have permission to view providers.');
          } else if (status === 500) {
            descriptiveError = new Error('Server error. Please check the backend logs.');
          } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
            descriptiveError = new Error('Cannot connect to API server. Please ensure the backend is running.');
          } else {
            descriptiveError = new Error(`Failed to load providers: ${errorMessage}`);
          }
          
          setError(descriptiveError);
          setUsers([]);
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false);
          }
        });
    } else {
      const params: any = { limit: 100 };
      if (roles && roles.length > 0) {
        params.role = roles[0];
      }

      userService
        .getUsers(params)
        .then((response) => {
          if (cancelled) return;
          
          logger.debug('useUsers - getUsers response:', response);
          
          // Handle different possible response structures
          let usersArray: User[] = [];
          
          if (response.data) {
            // Check if response.data is the UserListResponse with users property
            if (response.data.users && Array.isArray(response.data.users)) {
              usersArray = response.data.users;
            } 
            // Check if response.data is directly an array of users
            else if (Array.isArray(response.data)) {
              usersArray = response.data;
            }
            // Check if response.data has a data property (nested structure)
            else if ((response.data as any).data && Array.isArray((response.data as any).data)) {
              usersArray = (response.data as any).data;
            }
          }
          
          if (usersArray.length > 0) {
            logger.debug('useUsers - Users from API:', usersArray.length);
            
            // Filter by roles if specified
            if (roles && roles.length > 1) {
              usersArray = usersArray.filter(u => roles.includes(u.role));
            }
            
            setUsers(usersArray);
            setError(null);
          } else {
            // Only warn if we got a response but no users (not an error condition)
            if (response && response.data) {
              logger.debug('useUsers - No users found in response (this may be normal if no users exist):', {
                hasData: !!response.data,
                dataType: typeof response.data,
                isArray: Array.isArray(response.data),
                dataKeys: response.data ? Object.keys(response.data) : []
              });
            }
            setUsers([]);
            setError(null); // Not an error, just no users
          }
        })
        .catch((err) => {
          if (cancelled) return;
          
          logger.error('Failed to load users:', err);
          setError(err as Error);
          setUsers([]);
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role, isAuthenticated, allowForAssignment, roles?.join(',')]);

  return { users, isLoading, error };
}

