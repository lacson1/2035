import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0); // seconds remaining
  const { login, register } = useAuth();

  // Handle rate limit cooldown timer
  React.useEffect(() => {
    if (isRateLimited && rateLimitCooldown > 0) {
      const timer = setInterval(() => {
        setRateLimitCooldown((prev) => {
          if (prev <= 1) {
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRateLimited, rateLimitCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        await register(email, password, firstName, lastName, username || undefined);
        // Clear form on success
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setUsername('');
      } else {
        await login(email, password);
        // Clear form on success
        setEmail('');
        setPassword('');
      }
      // Navigation will happen automatically via AuthContext state change
    } catch (err: any) {
      // Check for rate limiting (429 status or "Too many" message)
      const isRateLimitError = err?.status === 429 ||
        err?.message?.includes('Too many login attempts') ||
        err?.message?.includes('Too many requests');

      if (isRateLimitError) {
        // Extract retry-after time from response or use default
        let cooldownSeconds = 5 * 60; // Default: 5 minutes (300 seconds)

        // Try to extract from retryAfter header or response
        if (err?.retryAfter) {
          cooldownSeconds = Math.ceil(err.retryAfter);
        } else if (err?.message?.match(/(\d+)\s*minutes?/i)) {
          const match = err.message.match(/(\d+)\s*minutes?/i);
          if (match) {
            cooldownSeconds = parseInt(match[1]) * 60;
          }
        }

        setIsRateLimited(true);
        setRateLimitCooldown(cooldownSeconds);

        const minutes = Math.floor(cooldownSeconds / 60);
        const seconds = cooldownSeconds % 60;
        setError(`Too many login attempts. Please try again in ${minutes}:${seconds.toString().padStart(2, '0')}.`);
        return;
      }

      // Extract error message - handle both Error objects and ApiError
      let errorMessage = isSignUp
        ? 'Registration failed. Please try again.'
        : 'Login failed. Please check your credentials.';

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
      setIsRateLimited(false);
      setRateLimitCooldown(0);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setUsername('');
    setIsRateLimited(false);
    setRateLimitCooldown(0);
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setIsLoading(true);

    try {
      await login(demoEmail, demoPassword);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      const errorMessage = err?.message || 'Demo login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Modern animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900"></div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large animated orb - top right */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-400/40 to-teal-600/20 dark:from-teal-500/20 dark:to-teal-700/10 rounded-full blur-3xl animate-pulse-slow"></div>

        {/* Large animated orb - bottom left */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-400/40 to-emerald-600/20 dark:from-emerald-500/20 dark:to-emerald-700/10 rounded-full blur-3xl animate-pulse-slow [animation-delay:1s]"></div>

        {/* Medium orb - center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-teal-300/30 to-emerald-300/20 dark:from-teal-600/10 dark:to-emerald-600/5 rounded-full blur-3xl animate-pulse-slow [animation-delay:2s]"></div>

        {/* Small accent orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-teal-200/30 dark:bg-teal-700/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-32 right-32 w-40 h-40 bg-emerald-200/30 dark:bg-emerald-700/10 rounded-full blur-2xl animate-float [animation-delay:1.5s]"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-teal-300/20 dark:bg-teal-600/8 rounded-full blur-xl animate-float [animation-delay:0.5s]"></div>
      </div>

      {/* Grid pattern overlay */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgb(0, 0, 0) 1px, transparent 1px), linear-gradient(to bottom, rgb(0, 0, 0) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        } as React.CSSProperties}
      ></div>

      {/* Subtle geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 border border-teal-200/20 dark:border-teal-800/20 rounded-full blur-2xl rotate-45"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 border border-emerald-200/20 dark:border-emerald-800/20 rounded-full blur-2xl -rotate-45"></div>
      </div>

      <div className="relative w-full max-w-md z-10 animate-scale-in">
        {/* Main Card - Enhanced */}
        <div className="glass-strong p-8 md:p-10 rounded-2xl shadow-2xl border border-teal-200/30 dark:border-teal-700/30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-500 mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-glow">
              {isSignUp ? (
                <UserPlus className="w-8 h-8 text-white" />
              ) : (
                <LogIn className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              {isSignUp
                ? 'Sign up to access your healthcare dashboard'
                : 'Sign in to continue to your dashboard'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 animate-fade-in ${isRateLimited
                ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              }`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm">{error}</p>
                {isRateLimited && rateLimitCooldown > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                      {/* eslint-disable-next-line react/no-unknown-property */}
                      <div
                        className="h-full bg-amber-500 dark:bg-amber-600 transition-all duration-1000"
                        style={{ width: `${(rateLimitCooldown / (5 * 60)) * 100}%` } as React.CSSProperties}
                      />
                    </div>
                    <span className="text-xs font-mono font-semibold min-w-[50px] text-right">
                      {Math.floor(rateLimitCooldown / 60)}:{(rateLimitCooldown % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="input-base input-with-icon pr-4 py-3 text-sm"
                        placeholder="John"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="input-base input-with-icon pr-4 py-3 text-sm"
                        placeholder="Doe"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-base input-with-icon pr-4 py-3 text-sm"
                      placeholder="johndoe"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    If not provided, username will be generated from your email
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base input-with-icon pr-4 py-3 text-sm"
                  placeholder="sarah.johnson@hospital2035.com"
                  autoComplete={isSignUp ? "email" : "username"}
                  required
                  disabled={isLoading || isRateLimited}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base input-with-icon pr-4 py-3 text-sm"
                  placeholder={isSignUp ? "At least 8 characters" : "Enter your password"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  minLength={isSignUp ? 8 : undefined}
                  disabled={isLoading || isRateLimited}
                />
              </div>
              {isSignUp && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  Password must be at least 8 characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isRateLimited}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isSignUp ? 'Creating account...' : 'Logging in...'}</span>
                </>
              ) : (
                <>
                  {isSignUp ? (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Create Account</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </>
                  )}
                </>
              )}
            </button>

            {/* Toggle Sign Up/Login */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={resetForm}
                className="w-full text-center text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>

            {isSignUp && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center flex items-center justify-center gap-1.5">
                  <span className="text-teal-600 dark:text-teal-400">💡</span>
                  <span>The first user to register becomes an administrator</span>
                </p>
              </div>
            )}
          </form>

          {/* Demo Login Section */}
          {!isSignUp && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 text-center">
                Quick Demo Login
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('sarah.johnson@hospital2035.com', 'password123')}
                  disabled={isLoading || isRateLimited}
                  className="w-full px-4 py-2.5 text-sm bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">Login as Doctor</span>
                  <span className="text-xs opacity-75">(sarah.johnson@hospital2035.com)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('patricia.williams@hospital2035.com', 'password123')}
                  disabled={isLoading || isRateLimited}
                  className="w-full px-4 py-2.5 text-sm bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">Login as Nurse</span>
                  <span className="text-xs opacity-75">(patricia.williams@hospital2035.com)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@hospital2035.com', 'admin123')}
                  disabled={isLoading || isRateLimited}
                  className="w-full px-4 py-2.5 text-sm bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">Login as Admin</span>
                  <span className="text-xs opacity-75">(admin@hospital2035.com)</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                These are demo accounts for testing. Make sure the backend is seeded with these users.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Physician Dashboard 2035
        </p>
      </div>
    </div>
  );
}

