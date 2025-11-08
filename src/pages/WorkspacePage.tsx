import { useState, useEffect } from "react";
import { Sun, Moon, Users, Menu, Info } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { useKeyboardShortcuts, KeyboardShortcut } from "../hooks/useKeyboardShortcuts";
import DashboardHeader from "../components/DashboardLayout/DashboardHeader";
import TabContent from "../components/DashboardLayout/TabContent";
import UserSelector from "../components/UserSelector";
import LeftSidebar from "../components/DashboardLayout/LeftSidebar";
import RightSidebar from "../components/DashboardLayout/RightSidebar";
import DashboardShortcuts from "../components/DashboardShortcuts";
import KeyboardShortcutsModal from "../components/KeyboardShortcutsModal";
import QuickActionsBar from "../components/QuickActionsBar";

interface WorkspacePageProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigateToPatients: () => void;
}

export default function WorkspacePage({ 
  darkMode, 
  onToggleDarkMode, 
  onNavigateToPatients 
}: WorkspacePageProps) {
  const { selectedPatient, setActiveTab } = useDashboard();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true); // Always start open
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('rightSidebarOpen');
      return saved !== null ? saved === 'true' : true; // Default to open
    } catch {
      return true;
    }
  });
  const [leftSidebarMinimized, setLeftSidebarMinimized] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sidebarMinimized');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: "?",
      action: () => setShowKeyboardShortcuts(true),
      description: "Show keyboard shortcuts",
      category: "Help",
    },
    {
      key: "Escape",
      action: () => {
        setShowKeyboardShortcuts(false);
        // Close any open modals
        const event = new CustomEvent("close-modals");
        window.dispatchEvent(event);
      },
      description: "Close modals/shortcuts",
      category: "Navigation",
    },
    {
      key: "v",
      action: () => setActiveTab("vitals"),
      description: "Open Vitals tab",
      category: "Navigation",
    },
    {
      key: "c",
      action: () => setActiveTab("consultation"),
      description: "Open Consultation tab",
      category: "Navigation",
    },
    {
      key: "m",
      action: () => setActiveTab("medications"),
      description: "Open Medications tab",
      category: "Navigation",
    },
    {
      key: "n",
      ctrl: true,
      action: () => setActiveTab("notes"),
      description: "New Note (Ctrl+N)",
      category: "Documentation",
    },
    {
      key: "p",
      ctrl: true,
      action: () => setActiveTab("medications"),
      description: "Prescribe (Ctrl+P)",
      category: "Medication",
    },
    {
      key: "l",
      ctrl: true,
      action: () => setActiveTab("labs"),
      description: "Order Labs (Ctrl+L)",
      category: "Diagnostics",
    },
    {
      key: "a",
      ctrl: true,
      action: () => setActiveTab("appointments"),
      description: "Schedule Appointment (Ctrl+A)",
      category: "Scheduling",
    },
    {
      key: "n",
      action: () => setActiveTab("notes"),
      description: "Open Clinical Notes tab",
      category: "Navigation",
    },
    {
      key: "o",
      action: () => setActiveTab("overview"),
      description: "Open Overview tab",
      category: "Navigation",
    },
  ];

  useKeyboardShortcuts(shortcuts);

  // Save right sidebar state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rightSidebarOpen', rightSidebarOpen.toString());
    } catch {
      // Ignore errors
    }
  }, [rightSidebarOpen]);

  // Handle window resize - on mobile, close sidebars if needed
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      if (!isDesktop) {
        // On mobile, close sidebars if they were open
        // But don't force them open on desktop - let user control it
        if (window.innerWidth < 768) {
          setLeftSidebarOpen(false);
          setRightSidebarOpen(false);
        }
      }
    };
    
    // Set initial state based on screen size
    if (typeof window !== 'undefined') {
      const isDesktop = window.innerWidth >= 768;
      if (!isDesktop) {
        // On mobile, start closed
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      }
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-row relative overflow-hidden">
      {/* Left Sidebar - Navigation */}
      <LeftSidebar 
        isOpen={leftSidebarOpen}
        onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
        onNavigateToPatients={onNavigateToPatients}
        onMinimizedChange={setLeftSidebarMinimized}
      />

      {/* Main Content */}
      <main className={`flex-1 w-full h-full flex flex-col transition-all duration-300 min-w-0 ${
        !leftSidebarOpen 
          ? 'ml-0' 
          : leftSidebarMinimized 
            ? 'ml-16 md:ml-0' 
            : 'ml-56 md:ml-0'
      } ${rightSidebarOpen ? 'mr-0 md:mr-0' : 'mr-0'}`}>
        {/* Note: Left sidebar width is controlled internally based on minimized state */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
          <div className="p-2 md:p-3 space-y-2 md:space-y-2.5">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              {/* Left Sidebar Toggle */}
              <button
                onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                className="p-1 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Toggle navigation"
              >
                <Menu size={14} />
              </button>

              <h1 className="text-base md:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bluequee2.0
              </h1>
            </div>

            <div className="flex items-center gap-1">
              {/* Right Sidebar Toggle */}
              <button
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                className="p-1 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Toggle patient info"
              >
                <Info size={14} />
              </button>

              {/* Navigation to Patient List */}
              <button
                onClick={onNavigateToPatients}
                className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-teal-50/80 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-[10px] font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 border border-teal-200 dark:border-teal-800"
              >
                <Users size={12} className="text-teal-600 dark:text-teal-400" />
                <span className="hidden sm:inline text-teal-700 dark:text-teal-300">Patients</span>
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={onToggleDarkMode}
                className="p-1 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={12} /> : <Moon size={12} />}
              </button>

              {/* User Selector */}
              <div className="hidden md:block">
                <UserSelector />
              </div>
            </div>
          </div>

          {/* User selector for mobile */}
          <div className="md:hidden">
            <UserSelector />
          </div>

          {/* Dashboard Content */}
          {selectedPatient ? (
            <>
              <DashboardHeader />
              <DashboardShortcuts />
              <TabContent />
            </>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium mb-2">No Patient Selected</p>
              <p className="text-sm">Please select a patient to view their information.</p>
            </div>
          )}
          </div>
        </div>
      </main>

      {/* Right Sidebar - Patient Info */}
      <RightSidebar 
        isOpen={rightSidebarOpen}
        onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
      />

      {/* Quick Actions Bar */}
      <QuickActionsBar patient={selectedPatient} position="bottom" />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
        shortcuts={shortcuts}
      />
    </div>
  );
}

