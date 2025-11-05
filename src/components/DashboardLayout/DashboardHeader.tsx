import { useEffect, useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { getTabById, getWorkflowGroupLabel } from "../../config/dashboardTabs";
import { 
  ClipboardCheck, 
  Heart, 
  CalendarCheck, 
  Scan, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Copy,
  Check
} from "lucide-react";

const workflowGroupIcons: Record<string, typeof ClipboardCheck> = {
  assessment: ClipboardCheck,
  "active-care": Heart,
  planning: CalendarCheck,
  diagnostics: Scan,
  advanced: Sparkles,
};

const workflowGroupColors: Record<string, string> = {
  assessment: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
  "active-care": "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
  planning: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
  diagnostics: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20",
  advanced: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20",
};

export default function DashboardHeader() {
  const { 
    selectedPatient, 
    activeTab, 
    nextPatient, 
    previousPatient, 
    getCurrentPatientIndex, 
    getTotalPatients 
  } = useDashboard();
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Get current workflow context
  const currentTab = getTabById(activeTab);
  const workflowGroup = currentTab?.workflowGroup;
  const WorkflowIcon = workflowGroup ? workflowGroupIcons[workflowGroup] : null;
  const workflowColor = workflowGroup ? workflowGroupColors[workflowGroup] : "";
  const workflowLabel = workflowGroup ? getWorkflowGroupLabel(workflowGroup) : "";

  // Get patient position info
  const currentIndex = getCurrentPatientIndex();
  const totalPatients = getTotalPatients();
  const patientPosition = currentIndex >= 0 ? currentIndex + 1 : 0;
  const canNavigate = totalPatients > 1;

  // Keyboard shortcuts for navigation
  useEffect(() => {
    if (!canNavigate) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      // Left arrow or Ctrl+Left for previous
      if (e.key === "ArrowLeft" || (e.ctrlKey && e.key === "ArrowLeft")) {
        e.preventDefault();
        previousPatient();
      }
      // Right arrow or Ctrl+Right for next
      else if (e.key === "ArrowRight" || (e.ctrlKey && e.key === "ArrowRight")) {
        e.preventDefault();
        nextPatient();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canNavigate, nextPatient, previousPatient]);

  if (!selectedPatient) {
    return (
      <header className="mt-12 md:mt-0 mb-2">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium mb-2">No Patient Selected</p>
          <p className="text-sm">Please select a patient to view their information.</p>
        </div>
      </header>
    );
  }

  return (
    <header className="mt-12 md:mt-0 mb-6">
      <div className="flex flex-col gap-4">
        {/* Patient Name and Navigation Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              {/* Patient Navigation */}
              {canNavigate && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={previousPatient}
                    className="p-2 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous patient"
                    title="Previous patient (←)"
                  >
                    <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={nextPatient}
                    className="p-2 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next patient"
                    title="Next patient (→)"
                  >
                    <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg font-sans">
                    {patientPosition} / {totalPatients}
                  </span>
                </div>
              )}
              
              {/* Patient Name - Large and Prominent */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight font-sans">
                {selectedPatient.name}
              </h1>
            </div>
            
            {/* Status Tags Row - Better Spacing and Typography */}
            {WorkflowIcon && workflowLabel && (
              <div className="flex items-center flex-wrap gap-2 mb-3">
                {/* Workflow Badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-sans shadow-sm border ${workflowColor}`}>
                  <WorkflowIcon size={14} />
                  <span>{workflowLabel}</span>
                </div>
              </div>
            )}
            
            {/* Demographics - Clean Typography */}
            <div className="mb-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                {selectedPatient.age} years old • {selectedPatient.gender}
                {selectedPatient.dob && ` • DOB: ${new Date(selectedPatient.dob).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
              </p>
            </div>
            
            {/* Contact Information - Well Organized */}
            {(selectedPatient.address || selectedPatient.email || selectedPatient.phone) && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600 dark:text-gray-400 font-sans">
                {selectedPatient.phone && (
                  <div className="flex items-center gap-2 group">
                    <a
                      href={`tel:${selectedPatient.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      title={`Call ${selectedPatient.phone}`}
                    >
                      <Phone size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      <span className="font-medium">{selectedPatient.phone}</span>
                    </a>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (selectedPatient.phone) {
                          navigator.clipboard.writeText(selectedPatient.phone).then(() => {
                            setCopiedField('phone');
                            setTimeout(() => setCopiedField(null), 2000);
                          });
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      title="Copy phone number"
                      aria-label="Copy phone number"
                    >
                      {copiedField === 'phone' ? (
                        <Check size={14} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy size={14} className="text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>
                )}
                {selectedPatient.email && (
                  <div className="flex items-center gap-2 truncate group">
                    <a
                      href={`mailto:${selectedPatient.email}`}
                      className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer min-w-0"
                      title={`Email ${selectedPatient.email}`}
                    >
                      <Mail size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                      <span className="font-medium truncate">{selectedPatient.email}</span>
                    </a>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (selectedPatient.email) {
                          navigator.clipboard.writeText(selectedPatient.email).then(() => {
                            setCopiedField('email');
                            setTimeout(() => setCopiedField(null), 2000);
                          });
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex-shrink-0"
                      title="Copy email address"
                      aria-label="Copy email address"
                    >
                      {copiedField === 'email' ? (
                        <Check size={14} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy size={14} className="text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>
                )}
                {selectedPatient.address && (
                  <div className="flex items-center gap-2 truncate group">
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(selectedPatient.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer min-w-0"
                      title={`Open ${selectedPatient.address} in maps`}
                    >
                      <MapPin size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                      <span className="font-medium truncate">{selectedPatient.address}</span>
                    </a>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (selectedPatient.address) {
                          navigator.clipboard.writeText(selectedPatient.address).then(() => {
                            setCopiedField('address');
                            setTimeout(() => setCopiedField(null), 2000);
                          });
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex-shrink-0"
                      title="Copy address"
                      aria-label="Copy address"
                    >
                      {copiedField === 'address' ? (
                        <Check size={14} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy size={14} className="text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

