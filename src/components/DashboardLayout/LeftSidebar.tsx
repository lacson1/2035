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
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800",
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
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });

  // Track window size for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        // Exclude "My Schedule" from workflow groups since it's shown as a top button
        if (tab.id === "daily-schedule") {
          return false;
        }
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
          fixed md:static inset-y-0 left-0 z-50
          ${isMinimized ? 'w-16' : 'w-56'}
          bg-white/98 dark:bg-gray-900/98 backdrop-blur-lg
          border-r border-gray-200/60 dark:border-gray-700/60
          shadow-xl md:shadow-sm
          transition-all duration-300 ease-out
          overflow-y-auto overflow-x-hidden
          flex flex-col
          flex-shrink-0
        `}
        style={{
          transform: isDesktop ? 'translateX(0)' : (isOpen ? 'translateX(0)' : 'translateX(-100%)')
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200/40 dark:border-gray-700/40 flex items-center justify-between bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-800/50">
          {!isMinimized && (
            <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <LayoutDashboard size={16} className="text-primary-600 dark:text-primary-400" />
              Navigation
            </h2>
          )}
          {isMinimized && (
            <LayoutDashboard size={16} className="text-primary-600 dark:text-primary-400 mx-auto" />
          )}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setIsMinimized(!isMinimized);
                localStorage.setItem('sidebarMinimized', (!isMinimized).toString());
              }}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            <button
              onClick={onToggle}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2.5">
          {/* My Schedule Link */}
          <button
            onClick={() => {
              setActiveTab("daily-schedule");
              if (window.innerWidth < 768) {
                onToggle();
              }
            }}
            className={`w-full flex items-center ${isMinimized ? 'justify-center' : 'gap-2.5'} px-3 py-2.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 hover:from-teal-100 hover:to-emerald-100 dark:hover:from-teal-900/30 dark:hover:to-emerald-900/30 text-teal-700 dark:text-teal-300 text-sm font-medium transition-all duration-200 border border-teal-200/60 dark:border-teal-800/60 mb-3 group relative hover:shadow-sm active:scale-[0.98] ${activeTab === "daily-schedule" ? "ring-2 ring-teal-500 dark:ring-teal-400" : ""}`}
            title="My Schedule"
          >
            <CalendarCheck size={16} className="text-teal-600 dark:text-teal-400 flex-shrink-0" />
            {!isMinimized && (
              <span className="flex-1 text-left">My Schedule</span>
            )}
            {isMinimized && (
              <div className="absolute left-full ml-3 hidden group-hover:block z-50 animate-fade-in">
                <div className="bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg py-2 px-3 shadow-xl whitespace-nowrap border border-gray-700/50">
                  My Schedule
                </div>
              </div>
            )}
          </button>

          {/* Patient List Link */}
          {onNavigateToPatients && (
            <button
              onClick={() => {
                onNavigateToPatients();
                onToggle();
              }}
              className={`w-full flex items-center ${isMinimized ? 'justify-center' : 'gap-2.5'} px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary-50 to-success-50 dark:from-primary-900/20 dark:to-success-900/20 hover:from-primary-100 hover:to-success-100 dark:hover:from-primary-900/30 dark:hover:to-success-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium transition-all duration-200 border border-primary-200/60 dark:border-primary-800/60 mb-3 group relative hover:shadow-sm active:scale-[0.98]`}
              title="All Patients"
            >
              <Users size={16} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
              {!isMinimized && (
                <>
                  <span className="flex-1 text-left">All Patients</span>
                  {patients.length > 0 && (
                    <span className="text-xs bg-primary-200/80 dark:bg-primary-800/80 text-primary-800 dark:text-primary-200 px-2 py-0.5 rounded-full font-semibold">
                      {patients.length}
                    </span>
                  )}
                </>
              )}
              {isMinimized && (
                <div className="absolute left-full ml-3 hidden group-hover:block z-50 animate-fade-in">
                  <div className="bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg py-2 px-3 shadow-xl whitespace-nowrap border border-gray-700/50">
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
                    className={`w-full flex items-center justify-center px-2.5 py-2 rounded-xl border ${config?.bgColor || "bg-gray-50/80 dark:bg-gray-800/80"} transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-sm`}
                    title={label}
                  >
                    <GroupIcon size={14} className={config?.color || "text-gray-600 dark:text-gray-400"} />
                  </button>
                  {/* Expanded tabs on hover */}
                  <div className="absolute left-full ml-3 top-0 hidden group-hover:block z-50 min-w-[200px] animate-fade-in">
                    <div className="bg-white/98 dark:bg-gray-800/98 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 p-2.5 space-y-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 px-2 py-1.5 border-b border-gray-200/60 dark:border-gray-700/60">
                        {label}
                      </div>
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === tab.id
                                ? "bg-gradient-to-r from-primary-600 to-success-600 text-white shadow-md"
                                : "bg-gray-50/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:shadow-sm"
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
              <div key={group} className="space-y-1.5">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border ${config?.bgColor || "bg-gray-50/80 dark:bg-gray-800/80"} transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:shadow-sm group`}
                >
                  <div className="flex items-center gap-2">
                    <GroupIcon size={13} className={`${config?.color || "text-gray-600 dark:text-gray-400"} transition-transform duration-200 group-hover:scale-110`} />
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${config?.color || "text-gray-600 dark:text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                  <ChevronRight
                    size={12}
                    className={`transition-transform duration-300 ease-out ${isExpanded ? 'rotate-90' : ''} text-gray-500 dark:text-gray-400`}
                  />
                </button>

                {/* Tabs in this group */}
                {isExpanded && (
                  <div className="pl-4 space-y-1 animate-fade-in">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabClick(tab.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === tab.id
                              ? "bg-gradient-to-r from-primary-600 to-success-600 text-white shadow-md hover:shadow-lg"
                              : "bg-gray-50/60 dark:bg-gray-800/60 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:shadow-sm"
                            } active:scale-[0.98]`}
                          title={tab.label}
                        >
                          <Icon size={14} className={activeTab === tab.id ? "text-white" : ""} />
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
