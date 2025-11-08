import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Pill,
  FlaskConical,
  Calendar,
  Activity,
  AlertTriangle,
  Plus,
  X,
  LucideIcon,
  Stethoscope,
  Clock,
} from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { useToast } from "../context/ToastContext";
import { Patient } from "../types";

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  action: () => void;
  shortcut?: string;
  badge?: number;
  requiresPatient?: boolean;
  category?: "documentation" | "medication" | "diagnostics" | "scheduling" | "general";
}

interface QuickActionsBarProps {
  patient?: Patient | null;
  position?: "top" | "bottom";
  collapsed?: boolean;
}

export default function QuickActionsBar({
  patient,
  position = "bottom",
  collapsed: initialCollapsed = false,
}: QuickActionsBarProps) {
  const { setActiveTab, activeTab } = useDashboard();
  const toast = useToast();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [recentActions, setRecentActions] = useState<string[]>(() => {
    const saved = localStorage.getItem("recentActions");
    return saved ? JSON.parse(saved) : [];
  });

  // Track recent actions
  const trackAction = (actionId: string) => {
    setRecentActions((prev) => {
      const updated = [actionId, ...prev.filter((id) => id !== actionId)].slice(0, 5);
      localStorage.setItem("recentActions", JSON.stringify(updated));
      return updated;
    });
  };

  // Context-aware actions based on current tab
  const contextActions = useMemo(() => {
    const actions: QuickAction[] = [];

    if (patient) {
      // Always available actions
      actions.push(
        {
          id: "new-note",
          label: "New Note",
          icon: FileText,
          action: () => {
            setActiveTab("notes");
            trackAction("new-note");
            toast.success("Opening Clinical Notes...");
          },
          shortcut: "Ctrl+N",
          category: "documentation",
        },
        {
          id: "prescribe",
          label: "Prescribe",
          icon: Pill,
          action: () => {
            setActiveTab("medications");
            trackAction("prescribe");
            toast.success("Opening Medications...");
          },
          shortcut: "Ctrl+P",
          category: "medication",
        },
        {
          id: "order-labs",
          label: "Order Labs",
          icon: FlaskConical,
          action: () => {
            setActiveTab("labs");
            trackAction("order-labs");
            toast.success("Opening Lab Management...");
          },
          shortcut: "Ctrl+L",
          category: "diagnostics",
        },
        {
          id: "schedule",
          label: "Schedule",
          icon: Calendar,
          action: () => {
            setActiveTab("appointments");
            trackAction("schedule");
            toast.success("Opening Appointments...");
          },
          shortcut: "Ctrl+A",
          category: "scheduling",
        },
        {
          id: "add-vitals",
          label: "Add Vitals",
          icon: Activity,
          action: () => {
            setActiveTab("vitals");
            trackAction("add-vitals");
            toast.success("Opening Vitals...");
          },
          shortcut: "Ctrl+V",
          category: "diagnostics",
        },
        {
          id: "consultation",
          label: "Consultation",
          icon: Stethoscope,
          action: () => {
            setActiveTab("consultation");
            trackAction("consultation");
            toast.success("Opening Consultation...");
          },
          shortcut: "Ctrl+C",
          category: "documentation",
        }
      );

      // Tab-specific actions
      if (activeTab === "medications") {
        actions.push({
          id: "check-interactions",
          label: "Check Interactions",
          icon: AlertTriangle,
          action: () => {
            toast.info("Checking drug interactions...");
            // This would trigger interaction check
          },
          badge: patient.medications?.length || 0,
          category: "medication",
        });
      }

      if (activeTab === "vitals") {
        actions.push({
          id: "view-trends",
          label: "View Trends",
          icon: Clock,
          action: () => {
            toast.info("Showing vital trends...");
          },
          category: "diagnostics",
        });
      }
    }

    return actions;
  }, [patient, activeTab, setActiveTab, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier) {
        const action = contextActions.find((a) => {
          if (!a.shortcut) return false;
          const [mod, key] = a.shortcut.split("+");
          return (
            modifier &&
            e.key.toLowerCase() === key.toLowerCase() &&
            mod.toLowerCase() === (isMac ? "cmd" : "ctrl")
          );
        });

        if (action) {
          e.preventDefault();
          action.action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [contextActions]);

  if (!patient) {
    return null;
  }

  const positionClasses =
    position === "top"
      ? "top-0 left-0 right-0"
      : "bottom-0 left-0 right-0";

  return (
    <div
      className={`fixed ${positionClasses} z-40 bg-white dark:bg-gray-800 border-t dark:border-gray-700 border-gray-200 shadow-lg transition-all duration-300 ${
        collapsed ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title={collapsed ? "Show quick actions" : "Hide quick actions"}
          >
            {collapsed ? <Plus size={16} /> : <X size={16} />}
          </button>

          {/* Actions */}
          {!collapsed && (
            <div className="flex items-center gap-2 flex-1 justify-center">
              {contextActions.map((action) => {
                const Icon = action.icon;
                const isRecent = recentActions.includes(action.id);

                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg
                      transition-all duration-200
                      bg-gray-50 dark:bg-gray-700
                      hover:bg-teal-50 dark:hover:bg-teal-900/30
                      hover:border-teal-300 dark:hover:border-teal-600
                      border border-transparent
                      text-gray-700 dark:text-gray-300
                      hover:text-teal-600 dark:hover:text-teal-400
                      relative group
                      ${isRecent ? "ring-2 ring-teal-200 dark:ring-teal-800" : ""}
                    `}
                    title={`${action.label}${action.shortcut ? ` (${action.shortcut})` : ""}`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium hidden sm:inline">
                      {action.label}
                    </span>
                    {action.badge && action.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {action.badge}
                      </span>
                    )}
                    {action.shortcut && (
                      <span className="hidden lg:inline text-xs text-gray-400 dark:text-gray-500 ml-1">
                        {action.shortcut.replace("Ctrl", "⌃")}
                      </span>
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                      {action.label}
                      {action.shortcut && (
                        <span className="ml-2 text-gray-400">
                          {action.shortcut}
                        </span>
                      )}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Recent actions indicator */}
          {recentActions.length > 0 && !collapsed && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock size={14} />
              <span className="hidden sm:inline">Recent</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

