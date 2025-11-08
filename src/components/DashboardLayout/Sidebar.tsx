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
          bg-white/98 dark:bg-gray-900/98 backdrop-blur-lg
          border-r border-gray-200/60 dark:border-gray-700/60
          shadow-xl md:shadow-sm
          p-5 space-y-5
          transform transition-transform duration-300 ease-out
          overflow-y-auto overflow-x-hidden
          flex flex-col
        `}
      >
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl md:text-2xl font-bold text-gradient">Bluequee2.0</h1>
          <div className="hidden md:block">
            <UserSelector />
          </div>
        </div>

        {/* User selector for mobile */}
        <div className="md:hidden mb-2">
          <UserSelector />
        </div>

        <button
          onClick={onToggleDarkMode}
          className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 hover:bg-gray-100/90 dark:hover:bg-gray-700/90 w-full text-sm font-medium min-h-[44px] transition-all duration-200 hover:shadow-sm active:scale-[0.98] border border-gray-200/40 dark:border-gray-700/40"
        >
          {darkMode ? <Sun size={18} className="text-warning-600 dark:text-warning-400" /> : <Moon size={18} className="text-primary-600 dark:text-primary-400" />}
          <span className="text-gray-700 dark:text-gray-300">{darkMode ? "Light Mode" : "Dark Mode"}</span>
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

