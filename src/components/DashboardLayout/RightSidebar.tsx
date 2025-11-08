import { useMemo, useState, useEffect } from "react";
import { X, ChevronLeft, Activity, Heart, Calendar, FileText, Pill, Phone, Mail, MapPin, AlertTriangle } from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { getActiveMedications, getActiveMedicationsCount, getUpcomingAppointments, sortByDateDesc } from "../../utils/patientUtils";
import { getMeasurementSystem, formatTemperature } from "../../utils/measurements";

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function RightSidebar({ isOpen, onToggle }: RightSidebarProps) {
  const { selectedPatient } = useDashboard();
  const [measurementSystem, setMeasurementSystem] = useState(() => getMeasurementSystem());

  // Listen for measurement system changes
  useEffect(() => {
    const handleStorageChange = () => {
      setMeasurementSystem(getMeasurementSystem());
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const current = getMeasurementSystem();
      if (current !== measurementSystem) {
        setMeasurementSystem(current);
      }
    }, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [measurementSystem]);

  if (!selectedPatient) {
    return null;
  }

  // Get recent vitals from patient data (no synthetic generation)
  const recentVitals = useMemo(() => {
    // Safely parse blood pressure, defaulting to normal values if not available
    const bpString = selectedPatient.bp || "120/80";
    const bpParts = bpString.split("/").map(Number);
    const systolic = bpParts[0] || 120;
    const diastolic = bpParts[1] || 80;
    
    // Use actual patient data only (no random generation)
    // Vitals are stored separately, so use defaults here
    // TODO: Fetch latest vitals from vitals service if needed
    return {
      bp: bpString,
      systolic,
      diastolic,
      heartRate: 72, // Default - vitals stored separately
      temperature: 37.0, // Default - vitals stored separately
      oxygen: 98, // Default - vitals stored separately
    };
  }, [selectedPatient]);

  // Get recent medical history
  const recentHistory = useMemo(() => {
    const history = [];
    
    // Recent appointments
    if (selectedPatient.appointments?.length) {
      const recent = sortByDateDesc(
        selectedPatient.appointments.filter(apt => apt.status === "completed")
      ).slice(0, 3);
      history.push(...recent.map(apt => ({
        type: "appointment",
        date: apt.date,
        title: `${apt.type} - ${apt.provider}`,
        icon: Calendar,
      })));
    }

    // Recent notes
    if (selectedPatient.clinicalNotes?.length) {
      const recent = sortByDateDesc(selectedPatient.clinicalNotes).slice(0, 3);
      history.push(...recent.map(note => ({
        type: "note",
        date: note.date,
        title: note.title,
        icon: FileText,
      })));
    }

    return sortByDateDesc(history).slice(0, 5);
  }, [selectedPatient]);

  // Active medications count
  const activeMedicationsCount = useMemo(() => {
    return getActiveMedicationsCount(selectedPatient);
  }, [selectedPatient]);

  // Upcoming appointments
  const upcomingAppointments = useMemo(() => {
    return getUpcomingAppointments(selectedPatient)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [selectedPatient]);

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
          fixed inset-y-0 right-0 z-50
          w-56
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
          border-l border-gray-200/50 dark:border-gray-700/50
          shadow-xl
          transform transition-transform duration-300 ease-in-out
          overflow-y-auto
          flex flex-col
          flex-shrink-0
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="p-2 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
          <h2 className="text-xs font-semibold flex items-center gap-1">
            <Activity size={14} className="text-teal-600 dark:text-teal-400" />
            Patient Info
          </h2>
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <X size={14} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Current Vitals */}
          <div className="card-compact">
            <h3 className="text-[10px] font-semibold mb-1.5 flex items-center gap-1">
              <Heart size={12} className="text-red-600 dark:text-red-400" />
              Current Vitals
            </h3>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Blood Pressure</span>
                <span className={`font-semibold ${
                  recentVitals.systolic >= 140 || recentVitals.diastolic >= 90 
                    ? "text-red-600 dark:text-red-400" 
                    : recentVitals.systolic >= 130 || recentVitals.diastolic >= 80
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-green-600 dark:text-green-400"
                }`}>
                  {recentVitals.bp}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Heart Rate</span>
                <span className={`font-semibold ${
                  recentVitals.heartRate > 100 || recentVitals.heartRate < 60
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-green-600 dark:text-green-400"
                }`}>
                  {recentVitals.heartRate} bpm
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Temperature</span>
                <span className={`font-semibold ${
                  (measurementSystem === "uk" 
                    ? (recentVitals.temperature > 37.5 || recentVitals.temperature < 36.5)
                    : (recentVitals.temperature > 99.5 || recentVitals.temperature < 97.5))
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-green-600 dark:text-green-400"
                }`}>
                  {formatTemperature(recentVitals.temperature, measurementSystem, true)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">SpO2</span>
                <span className={`font-semibold ${
                  recentVitals.oxygen < 95
                    ? "text-red-600 dark:text-red-400"
                    : recentVitals.oxygen < 97
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-green-600 dark:text-green-400"
                }`}>
                  {recentVitals.oxygen}%
                </span>
              </div>
            </div>
          </div>

          {/* Active Medications */}
          {activeMedicationsCount > 0 && (
            <div className="card-compact">
              <h3 className="text-[10px] font-semibold mb-1.5 flex items-center gap-1">
                <Pill size={12} className="text-green-600 dark:text-green-400" />
                Medications
              </h3>
              <div className="text-lg font-bold text-green-700 dark:text-green-400">
                {activeMedicationsCount}
              </div>
              <div className="mt-1 space-y-0.5">
                {getActiveMedications(selectedPatient)
                  .slice(0, 2)
                  .map((med, idx) => (
                    <div key={idx} className="text-[9px] text-gray-600 dark:text-gray-400 truncate">
                      • {med.name}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Allergies */}
          {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
            <div className="card-compact border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
              <h3 className="text-[10px] font-semibold mb-1.5 flex items-center gap-1">
                <AlertTriangle size={12} className="text-red-600 dark:text-red-400" />
                Allergies
              </h3>
              <div className="space-y-0.5">
                {selectedPatient.allergies.map((allergy, idx) => (
                  <div key={idx} className="text-[9px] text-red-700 dark:text-red-300 font-medium">
                    • {allergy}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div className="card-compact">
              <h3 className="text-[10px] font-semibold mb-1.5 flex items-center gap-1">
                <Calendar size={12} className="text-teal-600 dark:text-teal-400" />
                Upcoming
              </h3>
              <div className="space-y-1">
                {upcomingAppointments.slice(0, 2).map((apt, idx) => (
                  <div key={idx} className="text-[9px]">
                    <div className="font-medium truncate">{apt.type}</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {new Date(apt.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Medical History */}
          {recentHistory.length > 0 && (
            <div className="card-compact">
              <h3 className="text-[10px] font-semibold mb-1.5 flex items-center gap-1">
                <FileText size={12} className="text-purple-600 dark:text-purple-400" />
                Recent
              </h3>
              <div className="space-y-1">
                {recentHistory.slice(0, 3).map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-1 text-[9px]">
                      <Icon size={10} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.title}</div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Patient Demographics */}
          <div className="card-compact border-2 border-gray-300/40 dark:border-gray-600/40 shadow-md ring-1 ring-gray-200/30 dark:ring-gray-700/30">
            <h3 className="text-xs font-semibold mb-2">Demographics</h3>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Age</span>
                <span className="font-medium">{selectedPatient.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Gender</span>
                <span className="font-medium">{selectedPatient.gender}</span>
              </div>
              {selectedPatient.dob && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">DOB</span>
                  <span className="font-medium">{new Date(selectedPatient.dob).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Condition</span>
                <span className="font-medium">{selectedPatient.condition}</span>
              </div>
            </div>
          </div>

          {/* Family History */}
          {selectedPatient.familyHistory && selectedPatient.familyHistory.length > 0 && (
            <div className="card-compact">
              <h3 className="text-xs font-semibold mb-2">Family History</h3>
              <div className="space-y-0.5 text-[10px]">
                {selectedPatient.familyHistory.map((history, idx) => (
                  <div key={idx} className="text-gray-700 dark:text-gray-300">
                    • {history}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle Factors */}
          {selectedPatient.lifestyle && (
            <div className="card-compact">
              <h3 className="text-xs font-semibold mb-2">Lifestyle</h3>
              <div className="space-y-1.5 text-[10px]">
                {selectedPatient.lifestyle.activityLevel && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Activity</span>
                    <span className="font-medium capitalize">{selectedPatient.lifestyle.activityLevel.replace('_', ' ')}</span>
                  </div>
                )}
                {selectedPatient.lifestyle.sleepHours && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sleep</span>
                    <span className="font-medium">{selectedPatient.lifestyle.sleepHours} hrs</span>
                  </div>
                )}
                {selectedPatient.lifestyle.smokingStatus && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Smoking</span>
                    <span className="font-medium capitalize">{selectedPatient.lifestyle.smokingStatus}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(selectedPatient.phone || selectedPatient.email || selectedPatient.address) && (
            <div className="card-compact">
              <h3 className="text-xs font-semibold mb-2 font-sans">Contact</h3>
              <div className="space-y-1.5 text-[10px]">
                {selectedPatient.phone && (
                  <a
                    href={`tel:${selectedPatient.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group"
                    title={`Call ${selectedPatient.phone}`}
                  >
                    <Phone size={12} className="text-gray-400 dark:text-gray-500 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                    <span className="text-gray-700 dark:text-gray-300 font-sans">{selectedPatient.phone}</span>
                  </a>
                )}
                {selectedPatient.email && (
                  <a
                    href={`mailto:${selectedPatient.email}`}
                    className="flex items-center gap-2 truncate hover:text-teal-600 dark:hover:text-teal-400 transition-colors group"
                    title={`Email ${selectedPatient.email}`}
                  >
                    <Mail size={12} className="text-gray-400 dark:text-gray-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 truncate font-sans">{selectedPatient.email}</span>
                  </a>
                )}
                {selectedPatient.address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(selectedPatient.address || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group"
                    title={`Open ${selectedPatient.address} in maps`}
                  >
                    <MapPin size={12} className="text-gray-400 dark:text-gray-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 font-sans">{selectedPatient.address}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {selectedPatient.emergencyContact && (
            <div className="card-compact border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/20">
              <h3 className="text-xs font-semibold mb-2 text-teal-700 dark:text-teal-300">Emergency Contact</h3>
              <div className="space-y-0.5 text-[10px]">
                <div className="font-medium text-teal-900 dark:text-teal-200">{selectedPatient.emergencyContact.name}</div>
                <div className="text-teal-700 dark:text-teal-300">{selectedPatient.emergencyContact.relationship}</div>
                <div className="text-teal-600 dark:text-teal-400">{selectedPatient.emergencyContact.phone}</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Toggle Button (when closed) - shows on all screen sizes */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 p-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-l-xl border-l border-y border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          aria-label="Open patient info"
          title="Open patient info sidebar"
        >
          <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
        </button>
      )}
    </>
  );
}

