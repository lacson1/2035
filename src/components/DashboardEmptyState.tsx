import { AlertCircle, RefreshCw, Server, Database } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../context/AuthContext";

export default function DashboardEmptyState() {
  const { isLoading, error, refreshPatients } = useDashboard();
  const { isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading patients...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 dark:text-yellow-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Authentication Required
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please log in to view patient data.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-2xl mx-auto">
        <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Failed to Load Patients
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error}
        </p>
        <div className="space-y-3 text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">
            Troubleshooting Steps:
          </h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <Server size={16} className="mt-0.5 text-blue-600 dark:text-blue-400" />
              <span>Ensure the backend server is running: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">cd backend && npm run dev</code></span>
            </li>
            <li className="flex items-start gap-2">
              <Database size={16} className="mt-0.5 text-blue-600 dark:text-blue-400" />
              <span>Check if the database is running and seeded with data</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 text-blue-600 dark:text-blue-400" />
              <span>Verify the API URL is correct: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">http://localhost:3000/api</code></span>
            </li>
            <li className="flex items-start gap-2">
              <RefreshCw size={16} className="mt-0.5 text-blue-600 dark:text-blue-400" />
              <span>Check the browser console for detailed error messages</span>
            </li>
          </ul>
        </div>
        <button
          onClick={() => refreshPatients()}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  // No error, but no patients either
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Database className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No Patients Found
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        The database is empty. Please seed the database with test data.
      </p>
      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <p className="mb-2">To seed the database, run:</p>
        <code className="block bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded text-left">
          cd backend && npm run seed
        </code>
      </div>
    </div>
  );
}

