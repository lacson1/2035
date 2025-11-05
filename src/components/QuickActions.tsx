import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Video,
  Calendar,
  FileText,
  Pill,
  Scan,
  Clock,
  Stethoscope,
  Activity,
  Users,
  FlaskConical,
  Send,
  Shield,
  UtensilsCrossed,
  Syringe,
  Calculator,
  Dna,
  Sparkles,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  History,
  Keyboard,
} from "lucide-react";
import { useDashboard } from "../context/DashboardContext";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  workflowGroup?: string;
  priority?: "high" | "medium" | "low";
  description?: string;
  badge?: number;
  shortcut?: string;
  category?: string;
}

interface QuickActionsProps {
  onAction: (action: string) => void;
}

// Action descriptions for tooltips
const actionDescriptions: Record<string, string> = {
  vitals: "Record patient vital signs including blood pressure, heart rate, and temperature",
  consultation: "Start a new consultation session with the patient",
  medication: "Prescribe or manage patient medications",
  note: "Add a clinical note or documentation",
  schedule: "Schedule a new appointment or visit",
  team: "Manage and view the patient's care team members",
  imaging: "Order or view imaging studies (X-rays, CT scans, MRI)",
  labs: "Order laboratory tests or view lab results",
  telemedicine: "Start a video consultation with the patient",
  timeline: "View complete patient timeline and history",
  referrals: "Create or manage patient referrals to specialists",
  consents: "Manage patient consent forms and documentation",
  nutrition: "Track and manage patient nutrition plans",
  vaccinations: "Record and manage patient vaccinations",
  calculator: "Use medication dosage and calculation tools",
  longevity: "Access longevity and preventive care tools",
  microbiome: "View microbiome analysis and recommendations",
};

// Action keyboard shortcuts
const actionShortcuts: Record<string, string> = {
  vitals: "V",
  consultation: "C",
  medication: "M",
  note: "N",
  schedule: "S",
  team: "T",
  imaging: "I",
  labs: "L",
  telemedicine: "⌘K",
  timeline: "⌘T",
};

// Workflow-aware action groups
const workflowActions: Record<string, QuickAction[]> = {
  assessment: [
    {
      id: "vitals",
      label: "Record Vitals",
      icon: <Activity size={20} />,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => {},
      priority: "high",
      category: "Assessment",
      description: actionDescriptions.vitals,
      shortcut: actionShortcuts.vitals,
    },
  ],
  "active-care": [
    {
      id: "consultation",
      label: "Start Consultation",
      icon: <Stethoscope size={20} />,
      color: "bg-red-600 hover:bg-red-700",
      onClick: () => {},
      priority: "high",
      category: "Active Care",
      description: actionDescriptions.consultation,
      shortcut: actionShortcuts.consultation,
    },
    {
      id: "medication",
      label: "Prescribe Medication",
      icon: <Pill size={20} />,
      color: "bg-orange-600 hover:bg-orange-700",
      onClick: () => {},
      priority: "high",
      category: "Active Care",
      description: actionDescriptions.medication,
      shortcut: actionShortcuts.medication,
    },
  ],
  planning: [
    {
      id: "note",
      label: "Add Note",
      icon: <FileText size={20} />,
      color: "bg-purple-600 hover:bg-purple-700",
      onClick: () => {},
      priority: "high",
      category: "Planning",
      description: actionDescriptions.note,
      shortcut: actionShortcuts.note,
    },
    {
      id: "schedule",
      label: "Schedule Visit",
      icon: <Calendar size={20} />,
      color: "bg-green-600 hover:bg-green-700",
      onClick: () => {},
      priority: "medium",
      category: "Planning",
      description: actionDescriptions.schedule,
      shortcut: actionShortcuts.schedule,
    },
    {
      id: "team",
      label: "Care Team",
      icon: <Users size={20} />,
      color: "bg-indigo-600 hover:bg-indigo-700",
      onClick: () => {},
      priority: "medium",
      category: "Planning",
      description: actionDescriptions.team,
      shortcut: actionShortcuts.team,
    },
    {
      id: "referrals",
      label: "Referrals",
      icon: <Send size={20} />,
      color: "bg-pink-600 hover:bg-pink-700",
      onClick: () => {},
      priority: "medium",
      category: "Planning",
      description: actionDescriptions.referrals,
    },
    {
      id: "consents",
      label: "Consents",
      icon: <Shield size={20} />,
      color: "bg-amber-600 hover:bg-amber-700",
      onClick: () => {},
      priority: "low",
      category: "Planning",
      description: actionDescriptions.consents,
    },
  ],
  diagnostics: [
    {
      id: "imaging",
      label: "Order Imaging",
      icon: <Scan size={20} />,
      color: "bg-teal-600 hover:bg-teal-700",
      onClick: () => {},
      priority: "high",
      category: "Diagnostics",
      description: actionDescriptions.imaging,
      shortcut: actionShortcuts.imaging,
    },
    {
      id: "labs",
      label: "Lab Orders",
      icon: <FlaskConical size={20} />,
      color: "bg-cyan-600 hover:bg-cyan-700",
      onClick: () => {},
      priority: "high",
      category: "Diagnostics",
      description: actionDescriptions.labs,
      shortcut: actionShortcuts.labs,
    },
  ],
  advanced: [
    {
      id: "telemedicine",
      label: "Video Call",
      icon: <Video size={20} />,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => {},
      priority: "medium",
      category: "Advanced",
      description: actionDescriptions.telemedicine,
      shortcut: actionShortcuts.telemedicine,
    },
    {
      id: "nutrition",
      label: "Nutrition",
      icon: <UtensilsCrossed size={20} />,
      color: "bg-emerald-600 hover:bg-emerald-700",
      onClick: () => {},
      priority: "medium",
      category: "Advanced",
      description: actionDescriptions.nutrition,
    },
    {
      id: "longevity",
      label: "Longevity",
      icon: <Sparkles size={20} />,
      color: "bg-violet-600 hover:bg-violet-700",
      onClick: () => {},
      priority: "low",
      category: "Advanced",
      description: actionDescriptions.longevity,
    },
    {
      id: "microbiome",
      label: "Microbiome",
      icon: <Dna size={20} />,
      color: "bg-rose-600 hover:bg-rose-700",
      onClick: () => {},
      priority: "low",
      category: "Advanced",
      description: actionDescriptions.microbiome,
    },
  ],
};

// Common actions available across all workflows
const commonActions: QuickAction[] = [
  {
    id: "timeline",
    label: "View Timeline",
    icon: <Clock size={20} />,
    color: "bg-gray-600 hover:bg-gray-700",
    onClick: () => {},
    priority: "low",
    category: "Common",
    description: actionDescriptions.timeline,
    shortcut: actionShortcuts.timeline,
  },
  {
    id: "vaccinations",
    label: "Vaccinations",
    icon: <Syringe size={20} />,
    color: "bg-lime-600 hover:bg-lime-700",
    onClick: () => {},
    priority: "medium",
    category: "Common",
    description: actionDescriptions.vaccinations,
  },
  {
    id: "calculator",
    label: "Med Calculator",
    icon: <Calculator size={20} />,
    color: "bg-slate-600 hover:bg-slate-700",
    onClick: () => {},
    priority: "medium",
    category: "Common",
    description: actionDescriptions.calculator,
  },
];

// Workflow group mapping based on tab IDs
const tabToWorkflowGroup: Record<string, string> = {
  overview: "assessment",
  vitals: "assessment",
  consultation: "active-care",
  medications: "active-care",
  "medication-calculators": "active-care",
  notes: "planning",
  appointments: "planning",
  timeline: "planning",
  team: "planning",
  imaging: "diagnostics",
  labs: "diagnostics",
  telemedicine: "advanced",
  longevity: "advanced",
  microbiome: "advanced",
  nutrition: "advanced",
};

const tabLabels: Record<string, string> = {
  overview: "Overview",
  vitals: "Vitals",
  consultation: "Consultation",
  medications: "Medications",
  "medication-calculators": "Med Calculators",
  notes: "Clinical Notes",
  appointments: "Appointments",
  timeline: "Timeline",
  team: "Care Team",
  imaging: "Imaging",
  labs: "Lab Management",
  telemedicine: "Telemedicine",
  longevity: "Longevity",
  microbiome: "Microbiome",
  nutrition: "Nutrition",
  referrals: "Referrals",
  consents: "Consents",
  vaccinations: "Vaccinations",
};

// Helper function to get action badge count
const getActionBadge = (actionId: string, patient: any): number | undefined => {
  if (!patient) return undefined;
  
  switch (actionId) {
    case "labs":
      return patient.labResults?.filter((r: any) => r.status === "pending")?.length || 0;
    case "appointments":
      return patient.appointments?.filter((a: any) => 
        new Date(a.date) > new Date() && a.status === "scheduled"
      )?.length || 0;
    case "notes":
      return patient.clinicalNotes?.filter((n: any) => 
        new Date(n.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )?.length || 0;
    case "imaging":
      return patient.imagingStudies?.filter((i: any) => i.status === "pending")?.length || 0;
    default:
      return undefined;
  }
};

// Helper to get recent actions from localStorage
const getRecentActions = (): string[] => {
  try {
    const recent = localStorage.getItem("recentQuickActions");
    return recent ? JSON.parse(recent) : [];
  } catch {
    return [];
  }
};

// Helper to save action to recent
const saveRecentAction = (actionId: string) => {
  try {
    const recent = getRecentActions();
    const updated = [actionId, ...recent.filter(id => id !== actionId)].slice(0, 10);
    localStorage.setItem("recentQuickActions", JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
};

export default function QuickActions({ onAction }: QuickActionsProps) {
  const { activeTab, selectedPatient } = useDashboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [recentActions, setRecentActions] = useState<string[]>(getRecentActions());
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const keyboardModalRef = useRef<HTMLDivElement>(null);

  // Get current workflow context
  const workflowGroup = tabToWorkflowGroup[activeTab] || undefined;
  const currentTabLabel = tabLabels[activeTab] || "Context-aware";

  // Calculate badge counts
  const calculateBadges = (actions: QuickAction[]) => {
    return actions.map(action => ({
      ...action,
      badge: getActionBadge(action.id, selectedPatient),
    }));
  };

  // Build context-aware actions
  const actions = useMemo(() => {
    const workflowSpecific = workflowGroup ? workflowActions[workflowGroup] || [] : [];

    // On overview page, show more actions (high + medium priority from all workflows)
    if (activeTab === "overview") {
      const allWorkflowActions = Object.values(workflowActions).flat();
      const overviewActions = allWorkflowActions.filter(a =>
        a.priority === "high" || a.priority === "medium"
      );
      const combined = [...overviewActions, ...commonActions];
      return calculateBadges(combined);
    }

    // For other pages, combine workflow-specific high-priority actions with common actions
    const highPriorityWorkflow = workflowSpecific.filter(a => a.priority === "high");
    const combined = [...highPriorityWorkflow, ...commonActions];
    return calculateBadges(combined);
  }, [workflowGroup, activeTab, selectedPatient]);

  // Filter actions by search query
  const filteredActions = useMemo(() => {
    if (!searchQuery.trim()) return actions;
    const query = searchQuery.toLowerCase();
    return actions.filter(action =>
      action.label.toLowerCase().includes(query) ||
      action.description?.toLowerCase().includes(query) ||
      action.category?.toLowerCase().includes(query)
    );
  }, [actions, searchQuery]);

  // Group actions by category
  const groupedActions = useMemo(() => {
    const groups: Record<string, QuickAction[]> = {};
    filteredActions.forEach(action => {
      const category = action.category || "Other";
      if (!groups[category]) groups[category] = [];
      groups[category].push(action);
    });
    return groups;
  }, [filteredActions]);

  // Separate recent actions
  const recentActionsList = useMemo(() => {
    return recentActions
      .map(id => actions.find(a => a.id === id))
      .filter(Boolean) as QuickAction[];
  }, [recentActions, actions]);

  // Initialize collapsed categories with all categories when component mounts or categories change
  // Start with all categories collapsed by default (including "Recently Used")
  useEffect(() => {
    const categoryKeys = Object.keys(groupedActions);
    const allKeys = [...categoryKeys];
    // Also add "Recently Used" if we have recent actions
    if (recentActionsList.length > 0 && activeTab === "overview") {
      allKeys.push("Recently Used");
    }
    if (allKeys.length > 0) {
      setCollapsedCategories(prev => {
        // Only update if we haven't initialized yet or if new categories were added
        const currentKeys = Array.from(prev);
        const newKeys = allKeys.filter(k => !currentKeys.includes(k));
        if (prev.size === 0 || newKeys.length > 0) {
          // Add all categories as collapsed (including new ones)
          return new Set([...currentKeys, ...newKeys]);
        }
        return prev;
      });
    }
  }, [groupedActions, recentActionsList.length, activeTab]);

  // Handle action click with recent tracking
  const handleActionClick = (action: QuickAction) => {
    saveRecentAction(action.id);
    setRecentActions(getRecentActions());
    action.onClick();
  };

  // Map action IDs to tab IDs
  const getTabId = (actionId: string): string => {
    const mapping: Record<string, string> = {
      vitals: "vitals",
      consultation: "consultation",
      medication: "medications",
      note: "notes",
      schedule: "appointments",
      team: "team",
      imaging: "imaging",
      labs: "labs",
      telemedicine: "telemedicine",
      timeline: "timeline",
      referrals: "referrals",
      consents: "consents",
      nutrition: "nutrition",
      vaccinations: "vaccinations",
      calculator: "medication-calculators",
      longevity: "longevity",
      microbiome: "microbiome",
    };
    return mapping[actionId] || actionId;
  };

  // Add onClick handlers to actions
  const actionsWithHandlers = useMemo(() => {
    return filteredActions.map(action => ({
      ...action,
      onClick: () => {
        handleActionClick(action);
        onAction(getTabId(action.id));
      },
    }));
  }, [filteredActions, onAction]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K for quick action launcher
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }

      // Escape to close search
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false);
        setSearchQuery("");
      }

      // ? to show keyboard shortcuts
      if (e.key === "?" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== "INPUT" && activeElement?.tagName !== "TEXTAREA") {
          e.preventDefault();
          setShowKeyboardShortcuts(true);
        }
      }

      // Escape to close keyboard shortcuts modal
      if (e.key === "Escape" && showKeyboardShortcuts) {
        setShowKeyboardShortcuts(false);
      }

      // Quick shortcuts for actions (when not typing)
      const activeElement = document.activeElement;
      if (activeElement?.tagName !== "INPUT" && activeElement?.tagName !== "TEXTAREA") {
        const shortcuts: Record<string, string> = {
          v: "vitals",
          c: "consultation",
          m: "medications",
          n: "notes",
          s: "appointments",
          t: "team",
          i: "imaging",
          l: "labs",
        };
        if (shortcuts[e.key.toLowerCase()] && !e.metaKey && !e.ctrlKey && !e.altKey) {
          const tabId = shortcuts[e.key.toLowerCase()];
          if (actions.find(a => getTabId(a.id) === tabId)) {
            e.preventDefault();
            onAction(tabId);
            saveRecentAction(actions.find(a => getTabId(a.id) === tabId)?.id || "");
            setRecentActions(getRecentActions());
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSearch, showKeyboardShortcuts, actions, onAction]);

  // Click outside to close modals
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (keyboardModalRef.current && !keyboardModalRef.current.contains(e.target as Node)) {
        setShowKeyboardShortcuts(false);
      }
    };
    if (showKeyboardShortcuts) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showKeyboardShortcuts]);

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Default actions if no workflow-specific actions
  const displayActions = actionsWithHandlers.length > 0 ? actionsWithHandlers : [
    {
      id: "consultation",
      label: "Start Consultation",
      icon: <Stethoscope size={20} />,
      color: "bg-red-600 hover:bg-red-700",
      onClick: () => onAction("consultation"),
      description: actionDescriptions.consultation,
      shortcut: actionShortcuts.consultation,
    },
    {
      id: "note",
      label: "Add Note",
      icon: <FileText size={20} />,
      color: "bg-purple-600 hover:bg-purple-700",
      onClick: () => onAction("notes"),
      description: actionDescriptions.note,
      shortcut: actionShortcuts.note,
    },
    {
      id: "medication",
      label: "Prescribe",
      icon: <Pill size={20} />,
      color: "bg-orange-600 hover:bg-orange-700",
      onClick: () => onAction("medications"),
      description: actionDescriptions.medication,
      shortcut: actionShortcuts.medication,
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: <Calendar size={20} />,
      color: "bg-green-600 hover:bg-green-700",
      onClick: () => onAction("appointments"),
      description: actionDescriptions.schedule,
      shortcut: actionShortcuts.schedule,
    },
    {
      id: "imaging",
      label: "Imaging",
      icon: <Scan size={20} />,
      color: "bg-teal-600 hover:bg-teal-700",
      onClick: () => onAction("imaging"),
      description: actionDescriptions.imaging,
      shortcut: actionShortcuts.imaging,
    },
    {
      id: "labs",
      label: "Lab Orders",
      icon: <FlaskConical size={20} />,
      color: "bg-cyan-600 hover:bg-cyan-700",
      onClick: () => onAction("labs"),
      description: actionDescriptions.labs,
      shortcut: actionShortcuts.labs,
    },
  ];

  const hasCategories = Object.keys(groupedActions).length > 1;
  const showCategories = activeTab === "overview" && hasCategories;

  return (
    <>
      <div className={`border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 ${isCollapsed ? 'p-1.5' : 'p-3'}`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1 transition-colors flex-shrink-0"
            title={isCollapsed ? "Expand Quick Actions" : "Collapse Quick Actions"}
          >
            {isCollapsed ? (
              <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronUp size={16} className="text-gray-600 dark:text-gray-400" />
            )}
            <h3 className={`font-semibold flex items-center gap-2 ${isCollapsed ? 'text-sm' : 'text-base'}`}>
              <span className="text-blue-600 dark:text-blue-400">⚡</span>
              <span>Quick Actions</span>
              {!isCollapsed && workflowGroup && (
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  ({currentTabLabel})
                </span>
              )}
            </h3>
          </button>
          {!isCollapsed && (
            <div className="flex items-center gap-1">
              {recentActionsList.length > 0 && (
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 p-0.5"
                  title="Recent actions"
                >
                  <History size={12} />
                  <span className="hidden sm:inline">{recentActionsList.length}</span>
                </button>
              )}
              <button
                onClick={() => setShowKeyboardShortcuts(true)}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Keyboard shortcuts (?)"
              >
                <Keyboard size={14} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Search actions (⌘K)"
              >
                <Search size={14} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {!isCollapsed && showSearch && (
          <div className="mb-2 mt-2 relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search actions... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-7 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Recent Actions Section */}
        {!isCollapsed && recentActionsList.length > 0 && !searchQuery && activeTab === "overview" && (
          <div className="mb-3 mt-3 border-b border-gray-200 dark:border-gray-700 pb-3">
            <button
              onClick={() => {
                const recentCategory = "Recently Used";
                toggleCategory(recentCategory);
              }}
              className="w-full flex items-center justify-between px-2 py-1.5 mb-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md transition-colors"
            >
              <div className="flex items-center gap-2">
                <History size={12} className="text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Recently Used
                </span>
              </div>
              {collapsedCategories.has("Recently Used") ? (
                <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronUp size={14} className="text-gray-500 dark:text-gray-400" />
              )}
            </button>
            {!collapsedCategories.has("Recently Used") && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 pl-1">
                {recentActionsList.slice(0, 6).map((action) => {
                  const actionWithHandler = actionsWithHandlers.find(a => a.id === action.id);
                  if (!actionWithHandler) return null;
                  return (
                    <button
                      key={action.id}
                      onClick={actionWithHandler.onClick}
                      className={`${action.color} text-white p-1.5 rounded-md flex flex-col items-center justify-center gap-0.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md relative group`}
                      title={action.description || action.label}
                    >
                      {React.isValidElement(action.icon) ? React.cloneElement(action.icon, { size: 14 }) : action.icon}
                      <span className="text-[8px] font-medium text-center leading-tight">{action.label}</span>
                      {action.badge && action.badge > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {action.badge > 9 ? "9+" : action.badge}
                        </span>
                      )}
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs shadow-xl">
                          <div className="font-semibold mb-1">{action.label}</div>
                          {action.description && (
                            <div className="text-gray-300">{action.description}</div>
                          )}
                          {action.shortcut && (
                            <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400">
                              Shortcut: <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px]">{action.shortcut}</kbd>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Actions Grid */}
        {!isCollapsed && (
          showCategories ? (
            // Grouped by category
            <div className="space-y-2 mt-3">
              {Object.entries(groupedActions).map(([category, categoryActions]) => {
                const isCategoryCollapsed = collapsedCategories.has(category);
                return (
                  <div key={category} className="space-y-1.5">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        {category}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {categoryActions.length}
                      </span>
                      {isCategoryCollapsed ? (
                        <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronUp size={14} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    {!isCategoryCollapsed && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 pl-1">
                        {categoryActions.map((action) => (
                          <button
                            key={action.id}
                            onClick={action.onClick}
                            className={`${action.color} text-white p-1.5 rounded-md flex flex-col items-center justify-center gap-0.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md relative group`}
                            title={action.description || action.label}
                          >
                            {React.isValidElement(action.icon) ? React.cloneElement(action.icon, { size: 14 }) : action.icon}
                            <span className="text-[8px] font-medium text-center leading-tight">{action.label}</span>
                            {action.badge !== undefined && action.badge > 0 && (
                              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {action.badge > 9 ? "9+" : action.badge}
                              </span>
                            )}
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                              <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs shadow-xl">
                                <div className="font-semibold mb-1">{action.label}</div>
                                {action.description && (
                                  <div className="text-gray-300">{action.description}</div>
                                )}
                                {action.shortcut && (
                                  <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400">
                                    Shortcut: <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px]">{action.shortcut}</kbd>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // Regular grid
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 mt-3">
              {displayActions.map((action) => {
                const badge = 'badge' in action ? action.badge : undefined;
                return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className={`${action.color} text-white p-1.5 rounded-md flex flex-col items-center justify-center gap-0.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md relative group`}
                  title={action.description || action.label}
                >
                  {React.isValidElement(action.icon) ? React.cloneElement(action.icon, { size: 14 }) : action.icon}
                  <span className="text-[8px] font-medium text-center leading-tight">{action.label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                    <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs shadow-xl">
                      <div className="font-semibold mb-1">{action.label}</div>
                      {action.description && (
                        <div className="text-gray-300">{action.description}</div>
                      )}
                      {action.shortcut && (
                        <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400">
                          Shortcut: <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px]">{action.shortcut}</kbd>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
                );
              })}
            </div>
          )
        )}

        {/* No results message */}
        {!isCollapsed && searchQuery && filteredActions.length === 0 && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p className="text-xs">No actions found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            ref={keyboardModalRef}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Keyboard size={20} />
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">General</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Open Quick Actions Search</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">⌘K</kbd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Show Keyboard Shortcuts</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">?</kbd>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Quick Actions</h4>
                <div className="space-y-2">
                  {Object.entries(actionShortcuts).map(([action, shortcut]) => (
                    <div key={action} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{actionDescriptions[action]?.split(".")[0] || action}</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{shortcut}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
