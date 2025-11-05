import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface TestUser {
  label: string;
  email: string;
  password: string;
  role: string;
}

const TEST_USERS: TestUser[] = [
  {
    label: 'Admin',
    email: 'admin@hospital2035.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    label: 'Physician',
    email: 'sarah.johnson@hospital2035.com',
    password: 'password123',
    role: 'physician',
  },
  {
    label: 'Nurse',
    email: 'patricia.williams@hospital2035.com',
    password: 'password123',
    role: 'nurse',
  },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const loadTestUser = (testUser: TestUser) => {
    setEmail(testUser.email);
    setPassword(testUser.password);
    setError(''); // Clear any previous errors
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation will happen automatically via AuthContext state change
      // Clear form on success
      setEmail('');
      setPassword('');
    } catch (err: any) {
      // Extract error message - handle both Error objects and ApiError
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err?.status === 0) {
        // Network error - connection failed
        errorMessage = 'Unable to connect to server. Please ensure the backend server is running and CORS is configured correctly.';
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.errors && typeof err.errors === 'object') {
        // Handle validation errors from API
        const firstError = Object.values(err.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0];
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg w-full max-w-md shadow-lg border border-blue-200/50">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-base bg-white text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="sarah.johnson@hospital2035.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-2.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-base bg-white text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="password123"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 text-base rounded-lg transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-3">Quick Login (Test Users):</p>
          <div className="flex flex-col gap-2">
            {TEST_USERS.map((testUser) => (
              <button
                key={testUser.email}
                type="button"
                onClick={() => loadTestUser(testUser)}
                disabled={isLoading}
                className="w-full px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 rounded transition-colors flex items-center justify-between border border-blue-200"
              >
                <span className="font-medium">{testUser.label}</span>
                <span className="text-xs text-gray-500">{testUser.email}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            Click a button above to auto-fill credentials
          </p>
        </div>
      </div>
    </div>
  );
}

