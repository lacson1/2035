import { useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/users';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to load and manage users list
 * Only loads users if the current user is an admin
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only load users if authenticated and user is admin
    if (!user || user.role !== 'admin') {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    userService
      .getUsers({ limit: 100 })
      .then((response) => {
        if (response.data?.users) {
          setUsers(response.data.users);
        }
      })
      .catch((err) => {
        console.error('Failed to load users:', err);
        setError(err as Error);
        setUsers([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);

  return { users, isLoading, error };
}

