import { FileCheck, Syringe, Activity, Apple } from "lucide-react";

interface LoadingSkeletonProps {
  type?: "consent" | "vaccination" | "surgical" | "nutrition" | "generic";
  count?: number;
}

export function LoadingSkeleton({ type = "generic", count = 3 }: LoadingSkeletonProps) {
  const getIcon = () => {
    switch (type) {
      case "consent":
        return <FileCheck size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600 animate-pulse" />;
      case "vaccination":
        return <Syringe size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600 animate-pulse" />;
      case "surgical":
        return <Activity size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600 animate-pulse" />;
      case "nutrition":
        return <Apple size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600 animate-pulse" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {getIcon()}
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="flex gap-2 mt-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

