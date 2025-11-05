import { useState, useMemo, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, LayoutDashboard, Users } from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { dashboardTabs, getWorkflowGroups, getTabsByWorkflowGroup, getWorkflowGroupLabel } from "../../config/dashboardTabs";
import { useUser } from "../../context/UserContext";
import { hasPermission } from "../../data/roles";
import {
  ClipboardCheck,
  Heart,
  CalendarCheck,
  Scan,
  Sparkles,
  Settings as SettingsIcon
} from "lucide-react";

// Workflow group icons and colors
const workflowGroupConfig: Record<string, { icon: typeof ClipboardCheck; color: string; bgColor: string }> = {
  assessment: {
    icon: ClipboardCheck,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  },
  "active-care": {
    icon: Heart,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  },
  planning: {
    icon: CalendarCheck,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
  },
  diagnostics: {
    icon: Scan,
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800",
  },
  advanced: {
    icon: Sparkles,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
  },
  administrative: {
    icon: SettingsIcon,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
  },
};

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNavigateToPatients?: () => void;
  onMinimizedChange?: (minimized: boolean) => void;
}

// Track tab usage
const trackTabUsage = (tabId: string, userId?: string) => {
  try {
    if (!userId) return;
    const key = `tabUsage_${userId}`;
    const usage = JSON.parse(localStorage.getItem(key) || "{}");
    usage[tabId] = (usage[tabId] || 0) + 1;
    usage.lastUsed = Date.now();
    localStorage.setItem(key, JSON.stringify(usage));
  } catch {
    // Ignore errors
  }
};

export default function LeftSidebar({ isOpen, onToggle, onNavigateToPatients, onMinimizedChange }: LeftSidebarProps) {
  const { activeTab, setActiveTab, selectedPatient, patients } = useDashboard();
  const { currentUser } = useUser();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const groups = getWorkflowGroups();
    const filtered = groups.filter((g) => g !== undefined) as string[];
    return new Set(filtered);
  });
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sidebarMinimized');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Notify parent of minimized state changes
  useEffect(() => {
    if (onMinimizedChange) {
      onMinimizedChange(isMinimized);
    }
  }, [isMinimized, onMinimizedChange]);


  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  // Filter and group tabs by workflow
  const groupedTabs = useMemo(() => {
    const groups = getWorkflowGroups();
    const result: Record<string, typeof dashboardTabs> = {};

    groups.forEach((group) => {
      const groupTabs = getTabsByWorkflowGroup(group);
      const visibleTabs = groupTabs.filter((tab) => {
        if (tab.permission && currentUser) {
          if (!hasPermission(currentUser.role, tab.permission as any)) {
            return false;
          }
        }
        if (tab.requiresPatient && !selectedPatient) {
          return false;
        }
        return true;
      });

      visibleTabs.sort((a, b) => (a.order || 999) - (b.order || 999));

      if (visibleTabs.length > 0) {
        result[group || ""] = visibleTabs;
      }
    });

    return result;
  }, [currentUser, selectedPatient]);

  // Handle tab click with usage tracking
  const handleTabClick = (tabId: string) => {
    trackTabUsage(tabId, currentUser?.id);
    setActiveTab(tabId);
    if (window.innerWidth < 768) {
      onToggle();
    }
  };


  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          ${isMinimized ? 'w-16' : 'w-56'}
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
          border-r border-gray-200/50 dark:border-gray-700/50
          shadow-xl
          transform transition-all duration-300 ease-in-out
          overflow-y-auto
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="p-2.5 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
          {!isMinimized && (
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <LayoutDashboard size={16} className="text-blue-600 dark:text-blue-400" />
              Navigation
            </h2>
          )}
          {isMinimized && (
            <LayoutDashboard size={16} className="text-blue-600 dark:text-blue-400 mx-auto" />
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setIsMinimized(!isMinimized);
                localStorage.setItem('sidebarMinimized', (!isMinimized).toString());
              }}
              className="hidden md:flex p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            <button
              onClick={onToggle}
              className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {/* Patient List Link */}
          {onNavigateToPatients && (
            <button
              onClick={() => {
                onNavigateToPatients();
                onToggle();
              }}
              className={`w-full flex items-center ${isMinimized ? 'justify-center' : 'gap-2'} px-2.5 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium transition-colors border border-blue-200 dark:border-blue-800 mb-2 group relative`}
              title="All Patients"
            >
              <Users size={16} className="text-blue-600 dark:text-blue-400" />
              {!isMinimized && (
                <>
                  <span className="flex-1 text-left">All Patients</span>
                  {patients.length > 0 && (
                    <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded-full font-semibold">
                      {patients.length}
                    </span>
                  )}
                </>
              )}
              {isMinimized && (
                <div className="absolute left-full ml-2 hidden group-hover:block z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-1.5 px-2 shadow-xl whitespace-nowrap">
                    All Patients {patients.length > 0 && `(${patients.length})`}
                  </div>
                </div>
              )}
            </button>
          )}

          {/* Workflow Groups */}
          {Object.entries(groupedTabs).map(([group, tabs]) => {
            const config = workflowGroupConfig[group];
            const GroupIcon = config?.icon || ClipboardCheck;
            const label = getWorkflowGroupLabel(group as any);
            const isExpanded = expandedGroups.has(group);

            if (isMinimized) {
              // Minimized view: show only group icon, expand on hover
              return (
                <div key={group} className="space-y-1 group relative">
                  <button
                    onClick={() => toggleGroup(group)}
                    className={`w-full flex items-center justify-center px-2 py-1.5 rounded-lg border ${config?.bgColor || "bg-gray-50 dark:bg-gray-800"} transition-all duration-200 hover:scale-[1.02]`}
                    title={label}
                  >
                    <GroupIcon size={14} className={config?.color || "text-gray-600"} />
                  </button>
                  {/* Expanded tabs on hover */}
                  <div className="absolute left-full ml-2 top-0 hidden group-hover:block z-50 min-w-[200px]">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 space-y-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 px-2 py-1 border-b border-gray-200 dark:border-gray-700">
                        {label}
                      </div>
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === tab.id
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                                : "bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                              }`}
                          >
                            <Icon size={14} />
                            <span className="truncate">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={group} className="space-y-1">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg border ${config?.bgColor || "bg-gray-50 dark:bg-gray-800"} transition-all duration-200 hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-1.5">
                    <GroupIcon size={12} className={config?.color || "text-gray-600"} />
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${config?.color || "text-gray-600 dark:text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                  <ChevronRight
                    size={12}
                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>

                {/* Tabs in this group */}
                {isExpanded && (
                  <div className="pl-3 space-y-0.5">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabClick(tab.id)}
                          className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === tab.id
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                              : "bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                          title={tab.label}
                        >
                          <Icon size={14} />
                          <span className="truncate">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Toggle Button (when closed) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 p-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-r-xl border-r border-y border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          aria-label="Open navigation"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </>
  );
}
