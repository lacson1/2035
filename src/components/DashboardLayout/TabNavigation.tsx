import { useMemo } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { dashboardTabs, getWorkflowGroups, getWorkflowGroupLabel, getTabsByWorkflowGroup } from "../../config/dashboardTabs";
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
    color: "text-primary-600 dark:text-primary-400",
    bgColor: "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800",
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
    color: "text-primary-600 dark:text-primary-400",
    bgColor: "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800",
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

export default function TabNavigation() {
  const { activeTab, setActiveTab, selectedPatient } = useDashboard();
  const { currentUser } = useUser();

  // Filter and group tabs by workflow
  const groupedTabs = useMemo(() => {
    const groups = getWorkflowGroups();
    const result: Record<string, typeof dashboardTabs> = {};

    groups.forEach((group) => {
      const groupTabs = getTabsByWorkflowGroup(group);
      const visibleTabs = groupTabs.filter((tab) => {
        // Check permission if required
        if (tab.permission && currentUser) {
          if (!hasPermission(currentUser.role, tab.permission as any)) {
            return false;
          }
        }
        // Check if patient is required
        if (tab.requiresPatient && !selectedPatient) {
          return false;
        }
        return true;
      });

      // Sort by order
      visibleTabs.sort((a, b) => (a.order || 999) - (b.order || 999));

      if (visibleTabs.length > 0) {
        result[group || ""] = visibleTabs;
      }
    });

    return result;
  }, [currentUser, selectedPatient]);

  return (
    <div className="mt-1.5 space-y-1.5">
      {Object.entries(groupedTabs).map(([group, tabs]) => {
        const config = workflowGroupConfig[group];
        const GroupIcon = config?.icon || ClipboardCheck;
        const label = getWorkflowGroupLabel(group as any);

        return (
          <div key={group} className="space-y-0.5">
            {/* Workflow Group Header - Enhanced */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${config?.bgColor || "bg-gray-50 dark:bg-gray-800"} backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200`}>
              <div className="p-0.5 rounded bg-white/50 dark:bg-gray-800/50">
                <GroupIcon size={10} className={config?.color || "text-gray-600"} />
              </div>
              <span className={`text-[9px] font-semibold uppercase tracking-wide ${config?.color || "text-gray-600 dark:text-gray-400"}`}>
                {label}
              </span>
            </div>
            
            {/* Tabs in this group - Compact */}
            <div className="flex gap-1 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 min-h-[36px] ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-primary-600 via-primary-600 to-success-600 text-white shadow-lg hover:shadow-xl scale-105 ring-2 ring-primary-200 dark:ring-primary-800"
                        : "bg-white/80 dark:bg-gray-800/80 hover:bg-gradient-to-r hover:from-primary-50 hover:to-success-50 dark:hover:from-primary-900/20 dark:hover:to-success-900/20 text-gray-700 dark:text-gray-300 hover:scale-105 active:scale-95 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700"
                    } transform shadow-sm hover:shadow-md`}
                    title={tab.label}
                  >
                    <Icon size={12} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

