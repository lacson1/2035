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
            {/* Workflow Group Header - Compact */}
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border ${config?.bgColor || "bg-gray-50 dark:bg-gray-800"} backdrop-blur-sm shadow-sm`}>
              <GroupIcon size={10} className={config?.color || "text-gray-600"} />
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
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 min-h-[36px] ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg scale-105"
                        : "bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-105 active:scale-95"
                    } transform`}
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

