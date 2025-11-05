import { useState, useEffect } from "react";
import { 
  Plus, 
  X, 
  Settings, 
  LucideIcon
} from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { dashboardTabs } from "../config/dashboardTabs";

interface Shortcut {
  id: string;
  label: string;
  icon: LucideIcon;
  tabId: string;
}

const availableShortcuts: Shortcut[] = dashboardTabs
  .filter(tab => tab.requiresPatient !== false)
  .map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    tabId: tab.id,
  }));

const STORAGE_KEY = "dashboard-shortcuts";

export default function DashboardShortcuts() {
  const { activeTab, setActiveTab, selectedPatient } = useDashboard();
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Load shortcuts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedIds = JSON.parse(saved) as string[];
        const savedShortcuts = savedIds
          .map(id => availableShortcuts.find(s => s.id === id))
          .filter((s): s is Shortcut => s !== undefined);
        setShortcuts(savedShortcuts);
      } catch (e) {
        console.error("Failed to load shortcuts:", e);
      }
    }
  }, []);

  // Save shortcuts to localStorage
  const saveShortcuts = (newShortcuts: Shortcut[]) => {
    setShortcuts(newShortcuts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newShortcuts.map(s => s.id)));
  };

  const handleAddShortcut = (shortcut: Shortcut) => {
    if (!shortcuts.find(s => s.id === shortcut.id)) {
      const newShortcuts = [...shortcuts, shortcut];
      saveShortcuts(newShortcuts);
    }
    setShowAddMenu(false);
  };

  const handleRemoveShortcut = (id: string) => {
    const newShortcuts = shortcuts.filter(s => s.id !== id);
    saveShortcuts(newShortcuts);
  };

  const handleShortcutClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Get available shortcuts that aren't already added
  const availableToAdd = availableShortcuts.filter(
    s => !shortcuts.find(existing => existing.id === s.id)
  );

  if (!selectedPatient) {
    return null;
  }

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Quick Access</h3>
          {isEditing && (
            <span className="text-xs text-gray-500 dark:text-gray-400">Click X to remove</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isEditing && shortcuts.length < availableShortcuts.length && (
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Add shortcut"
            >
              <Plus size={14} />
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-1.5 rounded-lg transition-colors ${
              isEditing 
                ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" 
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            title={isEditing ? "Done editing" : "Edit shortcuts"}
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Shortcuts Grid - Icon Only */}
      <div className="flex flex-wrap gap-2">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          const isActive = activeTab === shortcut.tabId;
          
          return (
            <div
              key={shortcut.id}
              className="relative group"
            >
              <button
                onClick={() => !isEditing && handleShortcutClick(shortcut.tabId)}
                className={`
                  p-2.5 rounded-lg
                  transition-all duration-200
                  ${isActive
                    ? "bg-teal-500 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400"
                  }
                  ${isEditing ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"}
                `}
                title={shortcut.label}
              >
                <Icon size={20} />
              </button>
              
              {/* Tooltip */}
              {!isEditing && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                  {shortcut.label}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              )}
              
              {isEditing && (
                <button
                  onClick={() => handleRemoveShortcut(shortcut.id)}
                  className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
                  title="Remove shortcut"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          );
        })}

        {shortcuts.length === 0 && !isEditing && (
          <div className="text-xs text-gray-400 dark:text-gray-500 py-1">
            Click <Plus size={12} className="inline mx-0.5" /> to add shortcuts
          </div>
        )}
      </div>

      {/* Add Shortcut Menu */}
      {showAddMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowAddMenu(false)}
          />
          <div className="relative z-50 mt-2">
            <div className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-2 max-h-64 overflow-y-auto min-w-[180px]">
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 px-2 pb-1.5 border-b border-gray-200 dark:border-gray-700">
                Add Shortcut
              </div>
              {availableToAdd.length > 0 ? (
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {availableToAdd.map((shortcut) => {
                    const Icon = shortcut.icon;
                    return (
                      <button
                        key={shortcut.id}
                        onClick={() => handleAddShortcut(shortcut)}
                        className="flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors group"
                        title={shortcut.label}
                      >
                        <Icon size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                        <span className="text-xs font-medium">{shortcut.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-3 text-center">
                  All shortcuts added
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

