import { AlertCircle, RefreshCw } from "lucide-react";

interface FallbackUIProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
}

export function FallbackUI({
  error,
  resetError,
  title = "Something went wrong",
  message = "An error occurred. Please try again.",
}: FallbackUIProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="text-red-600 dark:text-red-400 mb-4" size={48} />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {message}
      </p>
      {resetError && (
        <button
          onClick={resetError}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium text-sm"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
      {import.meta.env.DEV && error && (
        <details className="mt-4 text-left max-w-md">
          <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
            Error Details (Development)
          </summary>
          <pre className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-auto">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
    </div>
  );
}

