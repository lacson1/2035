import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
};

export default function LoadingSpinner({
  size = "md",
  className = "",
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinnerSize = sizeMap[size];

  const spinner = (
    <div
      role="generic"
      aria-busy="true"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <Loader2 className="animate-spin text-teal-600 dark:text-teal-400" size={spinnerSize} />
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        {spinner}
      </div>
    );
  }

  return spinner;
}

