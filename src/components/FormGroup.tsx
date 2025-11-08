import { ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface FormGroupProps {
  title?: string;
  description?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  required?: boolean;
}

export default function FormGroup({
  title,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className = "",
  required = false,
}: FormGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {title && (
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {title}
                {required && <span className="text-red-500 text-sm" aria-label="required">*</span>}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
            )}
          </div>
          {collapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label={isCollapsed ? "Expand section" : "Collapse section"}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronUp size={20} />
              )}
            </button>
          )}
        </div>
      )}
      <div
        className={`space-y-4 transition-all duration-200 ${
          collapsible && isCollapsed ? "hidden" : "block"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

