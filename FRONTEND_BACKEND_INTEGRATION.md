# Frontend-Backend Integration Guide

## Overview

This guide explains how to integrate the existing frontend with the new backend API.

---

## Step 1: Environment Configuration

### Update Frontend `.env`

Create or update `.env` in the project root:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Development
VITE_APP_ENV=development
```

The existing `src/services/api.ts` already uses `VITE_API_BASE_URL`, so no code changes needed!

---

## Step 2: Authentication Integration

### Create Auth Context

Create `src/context/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get<User>('/auth/me');
      setUser(response.data);
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>('/auth/login', { email, password });

    localStorage.setItem('authToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.post<{ accessToken: string }>('/auth/refresh');
      localStorage.setItem('authToken', response.data.accessToken);
    } catch (error) {
      // Refresh failed, logout user
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Update API Client for Token Refresh

Update `src/services/api.ts` to handle token refresh on 401 errors:

```typescript
// Add to ApiClient class

private async request<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<ApiResponse<T>> {
  // ... existing code ...

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && retry) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('authToken', refreshData.data.accessToken);
            
            // Retry original request with new token
            return this.request<T>(endpoint, options, false);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          throw new ApiError('Session expired. Please login again.', 401);
        }
      }
    }

    // ... rest of existing code ...
  }
}
```

---

## Step 3: Update Patient Service

The existing `src/services/patients.ts` is already structured correctly! It just needs to point to the real backend.

### Optional: Add Mock Data Fallback

For gradual migration, you can add a fallback:

```typescript
// src/services/patients.ts

import { patients as mockPatients } from '../data/patients';

export const patientService = {
  async getPatients(params?: PatientListParams): Promise<ApiResponse<PatientListResponse>> {
    try {
      const response = await apiClient.get<PatientListResponse>('/patients', params as Record<string, string>);
      if (response.data.patients) {
        response.data.patients = validatePatients(response.data.patients);
      }
      return response;
    } catch (error) {
      // Fallback to mock data during development
      if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.warn('API failed, using mock data');
        // Return mock data
        return {
          data: {
            patients: mockPatients,
            total: mockPatients.length,
            page: params?.page || 1,
            limit: params?.limit || 20,
            totalPages: Math.ceil(mockPatients.length / (params?.limit || 20)),
          },
        };
      }
      throw error;
    }
  },
  // ... rest of methods
};
```

---

## Step 4: Update App.tsx

Wrap your app with AuthProvider:

```typescript
// src/App.tsx

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <DashboardProvider>
          {/* ... existing app code ... */}
        </DashboardProvider>
      </UserProvider>
    </AuthProvider>
  );
}
```

---

## Step 5: Create Login Component (if needed)

Create `src/components/Login.tsx`:

```typescript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // or your routing solution

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-white">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
```

---

## Step 6: Update DashboardContext

Update `src/context/DashboardContext.tsx` to fetch from API:

```typescript
// Replace initialPatients import with API call

useEffect(() => {
  const loadPatients = async () => {
    try {
      const response = await patientService.getPatients({ page: 1, limit: 100 });
      setPatients(response.data.patients);
      if (response.data.patients.length > 0 && !selectedPatient?.id) {
        setSelectedPatientState(response.data.patients[0]);
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
      // Fallback to mock data or show error
    }
  };

  loadPatients();
}, []);
```

---

## Step 7: Migration Strategy

### Phase 1: Parallel Operation
- Backend runs but frontend still uses mock data
- Test backend independently
- Feature flag: `VITE_USE_MOCK_DATA=true`

### Phase 2: Gradual Migration
- Start with read-only endpoints (GET)
- Update components one by one
- Keep mock data as fallback

### Phase 3: Full Integration
- All endpoints use backend
- Remove mock data
- Remove feature flags

### Migration Checklist

- [ ] Backend API is running and accessible
- [ ] Authentication works (login/logout)
- [ ] Patient list loads from API
- [ ] Patient details load from API
- [ ] Patient create/update works
- [ ] Medications CRUD works
- [ ] Appointments CRUD works
- [ ] Clinical notes CRUD works
- [ ] Imaging studies CRUD works
- [ ] Care team management works
- [ ] Timeline events load correctly
- [ ] Search functionality works
- [ ] Error handling works
- [ ] Loading states work
- [ ] Remove all mock data imports
- [ ] Remove feature flags

---

## Step 8: Testing

### Test API Connection

Create a test script `test-api.ts`:

```typescript
// Test if API is accessible
const testApi = async () => {
  try {
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();
    console.log('✅ API is accessible:', data);
  } catch (error) {
    console.error('❌ API is not accessible:', error);
  }
};

testApi();
```

### Test Authentication

```typescript
// Test login
const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah.johnson@hospital2035.com',
        password: 'password123'
      })
    });
    const data = await response.json();
    console.log('✅ Login successful:', data);
  } catch (error) {
    console.error('❌ Login failed:', error);
  }
};
```

---

## Step 9: Error Handling

Update error handling in components to handle API errors:

```typescript
// Example in PatientList component
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadPatients = async () => {
    try {
      setError(null);
      const response = await patientService.getPatients();
      setPatients(response.data.patients);
    } catch (err: any) {
      if (err.status === 401) {
        // Redirect to login
        window.location.href = '/login';
      } else if (err.status === 403) {
        setError('You do not have permission to view patients');
      } else {
        setError('Failed to load patients. Please try again.');
      }
    }
  };

  loadPatients();
}, []);
```

---

## Step 10: Environment-Specific Configuration

### Development
```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

### Production
```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_USE_MOCK_DATA=false
```

---

## Troubleshooting

### CORS Errors
- Ensure backend CORS is configured for frontend origin
- Check `CORS_ORIGIN` in backend `.env`

### Authentication Issues
- Verify token is stored in localStorage
- Check token expiration
- Verify refresh token logic

### API Connection Issues
- Verify `VITE_API_BASE_URL` is set correctly
- Check backend is running
- Verify network connectivity
- Check browser console for errors

### Data Not Loading
- Check API response format matches expected format
- Verify validation schemas
- Check network tab for API calls
- Verify authentication token is valid

---

## Next Steps

1. **Set up backend** following `BACKEND_QUICKSTART.md`
2. **Test backend endpoints** independently
3. **Update frontend** to use API (this guide)
4. **Test integration** thoroughly
5. **Deploy** both frontend and backend

See `BACKEND_PLAN.md` for detailed backend architecture.

