import { useState } from "react";
import { HelpCircle, X, Zap } from "lucide-react";
import { getAvailableShortcuts } from "../utils/templateShortcuts";

interface TemplateShortcutsHelperProps {
  onShortcutSelect?: (shortcut: string) => void;
  position?: "top" | "bottom";
}

export default function TemplateShortcutsHelper({
  onShortcutSelect,
  position = "bottom",
}: TemplateShortcutsHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const shortcuts = getAvailableShortcuts();
  const templates = shortcuts.filter(s => s.type === "template");
  const macros = shortcuts.filter(s => s.type === "macro");

  const handleShortcutClick = (shortcut: string) => {
    if (onShortcutSelect) {
      onShortcutSelect(shortcut);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors rounded"
        title="Show template shortcuts"
      >
        <Zap size={14} />
        <span className="hidden sm:inline">Shortcuts</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`
              absolute ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"}
              left-0 z-50
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg shadow-xl
              w-80 max-h-96 overflow-y-auto
            `}
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-teal-600 dark:text-teal-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Template Shortcuts
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-3 space-y-4">
              {/* Templates */}
              <div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  Templates
                </div>
                <div className="space-y-1">
                  {templates.map((shortcut) => (
                    <button
                      key={shortcut.shortcut}
                      onClick={() => handleShortcutClick(shortcut.shortcut)}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-mono text-teal-600 dark:text-teal-400">
                          {shortcut.shortcut}
                        </code>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {shortcut.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Macros */}
              <div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  Data Macros
                </div>
                <div className="space-y-1">
                  {macros.map((shortcut) => (
                    <button
                      key={shortcut.shortcut}
                      onClick={() => handleShortcutClick(shortcut.shortcut)}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-mono text-blue-600 dark:text-blue-400">
                          {shortcut.shortcut}
                        </code>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {shortcut.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Help Text */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Type shortcuts in your note and they will be automatically expanded when you save.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

