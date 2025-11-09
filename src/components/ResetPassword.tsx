import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import SmartFormField from './SmartFormField';
import apiClient from '../services/api';

export default function ResetPassword() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Get token from URL query parameter
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
      verifyToken(tokenParam);
    } else {
      setIsVerifying(false);
      setIsValidToken(false);
      setError('No reset token provided. Please use the link from your email.');
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await apiClient.get(`/v1/auth/password-reset/verify?token=${tokenToVerify}`);
      setIsValidToken(true);
    } catch (err: any) {
      setIsValidToken(false);
      if (err?.status === 400 || err?.status === 401) {
        setError('This reset link is invalid or has expired. Please request a new password reset.');
      } else {
        setError('Unable to verify reset token. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/v1/auth/password-reset/reset', {
        token,
        password,
      });
      setIsSuccess(true);
    } catch (err: any) {
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (err?.status === 0) {
        errorMessage = 'Unable to connect to server. Please ensure the backend server is running.';
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.errors && typeof err.errors === 'object') {
        const firstError = Object.values(err.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0];
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Modern animated gradient background */}
      <div className="absolute inset-0 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900" style={{ background: 'linear-gradient(to bottom right, #f8fcff, #ffffff, #f8fcff)' }}></div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-400/40 to-teal-600/20 dark:from-teal-500/20 dark:to-teal-700/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-400/40 to-emerald-600/20 dark:from-emerald-500/20 dark:to-emerald-700/10 rounded-full blur-3xl animate-pulse-slow [animation-delay:1s]"></div>
      </div>

      <div className="relative w-full max-w-md z-10 animate-scale-in">
        <div className="glass-strong p-8 md:p-10 rounded-2xl shadow-2xl border border-teal-200/30 dark:border-teal-700/30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-500 mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              {isSuccess 
                ? 'Your password has been reset successfully'
                : 'Enter your new password below'}
            </p>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 animate-fade-in">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Password reset successful!</p>
                <p className="text-xs mt-1">
                  You can now log in with your new password.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !isSuccess && (
            <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          {isValidToken && !isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <SmartFormField
                type="password"
                name="password"
                label="New Password"
                value={password}
                onChange={setPassword}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                disabled={isLoading}
                validation={{ minLength: 8 }}
                helpText="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
              />

              <SmartFormField
                type="password"
                name="confirmPassword"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Resetting password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="w-full text-center text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Physician Dashboard 2035
        </p>
      </div>
    </div>
  );
}

