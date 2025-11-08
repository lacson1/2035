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
  Check,
  Edit2
} from "lucide-react";
import EditPatientModal from "../EditPatientModal";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import PatientRiskIndicator from "../PatientRiskIndicator";

const workflowGroupIcons: Record<string, typeof ClipboardCheck> = {
  assessment: ClipboardCheck,
  "active-care": Heart,
  planning: CalendarCheck,
  diagnostics: Scan,
  advanced: Sparkles,
};

const workflowGroupColors: Record<string, string> = {
  assessment: "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20",
  "active-care": "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
  planning: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
  diagnostics: "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20",
  advanced: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20",
};

export default function DashboardHeader() {
  const { 
    selectedPatient, 
    activeTab, 
    nextPatient, 
    previousPatient, 
    getCurrentPatientIndex, 
    getTotalPatients,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setActiveTab,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setShouldEditPatient
  } = useDashboard();
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
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
    <header className="mt-12 md:mt-0 mb-4">
      {/* Professional Patient Banner */}
      <div className="bg-sky-100 dark:bg-gray-800 rounded-lg border border-sky-300 dark:border-gray-700 shadow-sm group">
        <div className="p-4">
          {/* Top Row: Name, Navigation, Edit */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Patient Navigation */}
              {canNavigate && (
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={previousPatient}
                      className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-200"
                      aria-label="Previous patient"
                      title="Previous patient (←)"
                    >
                      <ChevronLeft size={14} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={nextPatient}
                      className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-200"
                      aria-label="Next patient"
                      title="Next patient (→)"
                    >
                      <ChevronRight size={14} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                    {patientPosition}/{totalPatients}
                  </span>
                </div>
              )}
              
              {/* Patient Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                    {selectedPatient.name}
                  </h1>
                  <div className="flex items-center gap-2 ml-auto">
                    {selectedPatient.risk !== undefined && (
                      <div
                        className={`
                          w-3 h-3 rounded-full shadow-sm border-2 border-white dark:border-gray-800
                          ${selectedPatient.risk >= 80 ? 'bg-red-500 animate-pulse' : 
                            selectedPatient.risk >= 60 ? 'bg-orange-500' : 
                            selectedPatient.risk >= 40 ? 'bg-yellow-500' : 
                            'bg-green-500'}
                        `}
                        title={`Risk Level: ${selectedPatient.risk}%`}
                      />
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-white/60 dark:hover:bg-gray-700/60 rounded transition-all duration-200"
                      style={{ pointerEvents: 'auto', visibility: 'visible' }}
                      title="Edit patient details"
                      type="button"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                  </div>
                </div>
                
                {/* Patient Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
                  {/* Hospital Number */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Hospital No:</span>
                    <div className="flex items-center gap-1.5 group">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">
                        {selectedPatient.id.slice(0, 8).toUpperCase()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigator.clipboard.writeText(selectedPatient.id).then(() => {
                            setCopiedField('hospitalNumber');
                            setTimeout(() => setCopiedField(null), 2000);
                          });
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Copy hospital number"
                      >
                        {copiedField === 'hospitalNumber' ? (
                          <Check size={12} className="text-green-600 dark:text-green-400" />
                        ) : (
                          <Copy size={12} className="text-gray-400 dark:text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Demographics */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Age:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPatient.age} years</span>
                  </div>
                  
                  {/* Gender */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Gender:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPatient.gender}</span>
                  </div>
                  
                  {/* Date of Birth */}
                  {selectedPatient.dob && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">DOB:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(selectedPatient.dob).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Workflow Badge */}
            {WorkflowIcon && workflowLabel && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${workflowColor} shadow-sm`}>
                <WorkflowIcon size={14} />
                <span>{workflowLabel}</span>
              </div>
            )}
          </div>
          
          {/* Contact Information Row */}
          {(selectedPatient.phone || selectedPatient.email || selectedPatient.address) && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {selectedPatient.phone && (
                  <div className="flex items-center gap-2 group">
                    <Phone size={14} className="text-gray-400 dark:text-gray-500" />
                    <a
                      href={`tel:${selectedPatient.phone.replace(/\s/g, '')}`}
                      className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors"
                      title={`Call ${selectedPatient.phone}`}
                    >
                      {selectedPatient.phone}
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      title="Copy phone"
                    >
                      {copiedField === 'phone' ? (
                        <Check size={12} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy size={12} className="text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>
                )}
                {selectedPatient.email && (
                  <div className="flex items-center gap-2 group min-w-0">
                    <Mail size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <a
                      href={`mailto:${selectedPatient.email}`}
                      className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium truncate transition-colors"
                      title={`Email ${selectedPatient.email}`}
                    >
                      {selectedPatient.email}
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex-shrink-0"
                      title="Copy email"
                    >
                      {copiedField === 'email' ? (
                        <Check size={12} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy size={12} className="text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>
                )}
                {selectedPatient.address && (
                  <div className="flex items-center gap-2 group min-w-0">
                    <MapPin size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(selectedPatient.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium truncate transition-colors"
                      title={`Open ${selectedPatient.address} in maps`}
                    >
                      {selectedPatient.address}
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex-shrink-0"
                      title="Copy address"
                    >
                      {copiedField === 'address' ? (
                        <Check size={12} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy size={12} className="text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Patient Modal */}
      <EditPatientModal
        patient={selectedPatient}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </header>
  );
}

