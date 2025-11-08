import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

interface HelpTooltipProps {
  content: string;
  title?: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export default function HelpTooltip({
  content,
  title,
  position = "top",
  className = "",
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
        aria-label="Show help"
        aria-expanded={isOpen}
      >
        <HelpCircle size={14} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Tooltip */}
          <div
            className={`
              absolute z-50 w-64 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
              ${positionClasses[position]}
              animate-fade-in
            `}
            role="tooltip"
          >
            {title && (
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close help"
                >
                  <X size={12} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {content}
            </p>
            {/* Arrow */}
            <div
              className={`
                absolute w-2 h-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                ${
                  position === "top"
                    ? "top-full left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-t-0 border-l-0"
                    : position === "bottom"
                    ? "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 border-b-0 border-r-0"
                    : position === "left"
                    ? "left-full top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 border-l-0 border-b-0"
                    : "right-full top-1/2 -translate-y-1/2 -translate-x-1/2 rotate-45 border-r-0 border-t-0"
                }
              `}
            />
          </div>
        </>
      )}
    </div>
  );
}

