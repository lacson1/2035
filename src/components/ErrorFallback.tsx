import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Send, Copy } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const toast = useToast();
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleCopyError = async () => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      toast.success('Error details copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy error details');
    }
  };

  const handleSendFeedback = async () => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    try {
      // In a real app, this would send to your error tracking service
      console.log('Sending error feedback:', errorDetails);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFeedbackSent(true);
      toast.success('Thank you for your feedback! We\'ll look into this issue.');
    } catch (err) {
      toast.error('Failed to send feedback. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <div className="mb-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Oops! Something went wrong
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We encountered an unexpected error. Our team has been notified and is working on a fix.
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={resetError}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

        {/* Feedback Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center justify-center gap-2">
            <Bug className="w-4 h-4" />
            Help us improve
          </h3>

          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            Send us feedback about this error to help us fix it faster.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleCopyError}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Copy error details"
            >
              <Copy className="w-3 h-3" />
              Copy Error
            </button>

            <button
              onClick={handleSendFeedback}
              disabled={feedbackSent}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-3 h-3" />
              {feedbackSent ? 'Sent!' : 'Send Feedback'}
            </button>
          </div>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              🔧 Error Details (Development Only)
            </summary>
            <div className="mt-3 space-y-2">
              <div className="text-xs bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
                <strong className="text-red-700 dark:text-red-400">Error:</strong>
                <pre className="mt-1 text-red-600 dark:text-red-300 whitespace-pre-wrap font-mono">
                  {error.message}
                </pre>
              </div>

              {error.stack && (
                <div className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded border border-gray-300 dark:border-gray-600 max-h-32 overflow-auto">
                  <strong className="text-gray-700 dark:text-gray-300">Stack Trace:</strong>
                  <pre className="mt-1 text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Recovery Tips */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            💡 Quick Recovery Tips
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Clear your browser cache and cookies</li>
            <li>• Try using a different browser</li>
            <li>• Check your internet connection</li>
            <li>• Contact support if the problem persists</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
