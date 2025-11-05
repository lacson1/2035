import { useEffect } from "react";
import { Sun, Moon, X } from "lucide-react";
import PatientList from "../PatientList";
import UserSelector from "../UserSelector";
import { useDashboard } from "../../context/DashboardContext";

interface SidebarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ darkMode, onToggleDarkMode, isOpen = false, onClose }: SidebarProps) {
  const { patients, selectedPatient, setSelectedPatient } = useDashboard();

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile sidebar */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 md:w-64
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
          border-r border-gray-200/50 dark:border-gray-700/50
          shadow-xl md:shadow-none
          p-4 space-y-4
          transform transition-transform duration-300 ease-in-out
          overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bluequee2.0</h1>
          <div className="hidden md:block">
            <UserSelector />
          </div>
        </div>

        {/* User selector for mobile */}
        <div className="md:hidden mb-4">
          <UserSelector />
        </div>

        <button
          onClick={onToggleDarkMode}
          className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 w-full text-sm font-medium min-h-[44px] transition-all duration-200 hover:scale-[1.02] active:scale-95"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <PatientList
          patients={patients}
          selectedPatient={selectedPatient}
          onSelectPatient={(patient) => {
            setSelectedPatient(patient);
            if (onClose) onClose(); // Close sidebar on mobile after selection
          }}
        />
      </aside>
    </>
  );
}

