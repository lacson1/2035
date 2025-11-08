import { memo } from "react";

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className = "", width, height }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonText({ lines = 1, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          className={i === lines - 1 ? "w-3/4" : "w-full"}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card ${className}`}>
      <div className="space-y-4">
        <Skeleton height="1.5rem" className="w-1/2" />
        <SkeletonText lines={3} />
        <div className="flex gap-2">
          <Skeleton height="2rem" className="w-20" />
          <Skeleton height="2rem" className="w-20" />
        </div>
      </div>
    </div>
  );
}

export function PatientCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-start gap-4">
            {/* Avatar skeleton */}
            <Skeleton
              width="3rem"
              height="3rem"
              className="rounded-full flex-shrink-0"
            />
            
            {/* Content skeleton */}
            <div className="flex-1 space-y-3">
              <Skeleton height="1.25rem" className="w-1/3" />
              <SkeletonText lines={2} />
              <div className="flex gap-2">
                <Skeleton height="1.5rem" className="w-16" />
                <Skeleton height="1.5rem" className="w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function OverviewCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton height="0.875rem" className="w-1/2 mb-2" />
              <Skeleton height="2rem" className="w-1/3" />
            </div>
            <Skeleton width="1.5rem" height="1.5rem" className="rounded" />
          </div>
          <Skeleton height="0.75rem" className="w-2/3 mt-3" />
        </div>
      ))}
    </div>
  );
}

export function TableRowSkeleton({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-gray-200 dark:border-gray-700">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-3">
              <Skeleton height="1rem" className={colIndex === 0 ? "w-1/2" : "w-full"} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function FormFieldSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton height="0.875rem" className="w-1/4 mb-2" />
          <Skeleton height="2.5rem" className="w-full" />
        </div>
      ))}
    </div>
  );
}

export default memo(Skeleton);
