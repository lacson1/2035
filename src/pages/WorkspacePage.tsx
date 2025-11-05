import { useState, useEffect } from "react";
import { Sun, Moon, Users, Menu, Info } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import DashboardHeader from "../components/DashboardLayout/DashboardHeader";
import TabContent from "../components/DashboardLayout/TabContent";
import UserSelector from "../components/UserSelector";
import LeftSidebar from "../components/DashboardLayout/LeftSidebar";
import RightSidebar from "../components/DashboardLayout/RightSidebar";
import DashboardShortcuts from "../components/DashboardShortcuts";

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
  const { selectedPatient } = useDashboard();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [leftSidebarMinimized, setLeftSidebarMinimized] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sidebarMinimized');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Auto-open sidebars on desktop (optional - can be removed if you want them closed by default)
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      // Only auto-open if not manually toggled
      // You can set to true if you want them open by default on desktop
      if (isDesktop) {
        // Sidebars start closed, user can toggle them
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex relative overflow-hidden">
      {/* Left Sidebar - Navigation */}
      <LeftSidebar 
        isOpen={leftSidebarOpen}
        onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
        onNavigateToPatients={onNavigateToPatients}
        onMinimizedChange={setLeftSidebarMinimized}
      />

      {/* Main Content */}
      <main className={`flex-1 w-full h-full flex flex-col transition-all duration-300 ${
        !leftSidebarOpen 
          ? 'ml-0' 
          : leftSidebarMinimized 
            ? 'ml-16' 
            : 'ml-56'
      } ${rightSidebarOpen ? 'mr-64' : 'mr-0'}`}>
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
                className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-blue-50/80 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-[10px] font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 border border-blue-200 dark:border-blue-800"
              >
                <Users size={12} className="text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline text-blue-700 dark:text-blue-300">Patients</span>
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
    </div>
  );
}

