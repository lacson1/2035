import { useState, useRef, useEffect } from "react";
import { Edit, Phone, Mail, MapPin, Calendar, AlertCircle } from "lucide-react";
import { Patient } from "../types";
import { getRiskColorClasses, getRiskLabel } from "../utils/riskUtils";
import { getActiveMedicationsCount, getUpcomingAppointmentsCount } from "../utils/patientUtils";

interface PatientHoverTooltipProps {
  patient: Patient;
  children: React.ReactNode;
  onEdit?: () => void;
}

export default function PatientHoverTooltip({ patient, children, onEdit }: PatientHoverTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setPosition(null);
    }, 100);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      // Use double requestAnimationFrame to ensure tooltip is rendered and measured
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (tooltipRef.current && triggerRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let top = triggerRect.bottom + 8;
            let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

            // Adjust if tooltip goes off screen horizontally
            if (left < 8) {
              left = 8;
            } else if (left + tooltipRect.width > viewportWidth - 8) {
              left = viewportWidth - tooltipRect.width - 8;
            }

            // If tooltip would go below viewport, show above instead
            if (top + tooltipRect.height > viewportHeight - 8) {
              top = triggerRect.top - tooltipRect.height - 8;
            }

            setPosition({ top, left });
          }
        });
      });
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const upcomingApts = getUpcomingAppointmentsCount(patient);
  const activeMeds = getActiveMedicationsCount(patient);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onMouseDown={handleClick}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && position && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[280px] max-w-[320px] animate-in fade-in-0 zoom-in-95 duration-200 pointer-events-auto"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                {patient.name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {patient.age}y • {patient.gender}
              </p>
            </div>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                  onEdit();
                }}
                className="ml-2 p-1.5 rounded-md hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-600 dark:text-teal-400 transition-colors flex-shrink-0"
                title="Edit patient"
              >
                <Edit size={14} />
              </button>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2 text-xs">
            {/* Condition */}
            {patient.condition && (
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{patient.condition}</span>
              </div>
            )}

            {/* Risk Level */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Risk:</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getRiskColorClasses(patient.risk)}`}>
                {patient.risk}% - {getRiskLabel(patient.risk)}
              </span>
            </div>

            {/* Contact Info */}
            {(patient.phone || patient.email || patient.address) && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
                {patient.phone && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone size={12} className="flex-shrink-0" />
                    <span className="truncate">{patient.phone}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail size={12} className="flex-shrink-0" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{patient.address}</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3">
              {upcomingApts > 0 && (
                <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                  <Calendar size={12} />
                  <span>{upcomingApts} appointment{upcomingApts !== 1 ? 's' : ''}</span>
                </div>
              )}
              {activeMeds > 0 && (
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <span>{activeMeds} medication{activeMeds !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Allergies */}
            {Array.isArray(patient.allergies) && patient.allergies.length > 0 && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="text-gray-500 dark:text-gray-400 mb-1">Allergies:</div>
                <div className="flex flex-wrap gap-1">
                  {patient.allergies.slice(0, 3).map((allergy, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded border border-red-200 dark:border-red-800"
                    >
                      {allergy}
                    </span>
                  ))}
                  {patient.allergies.length > 3 && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      +{patient.allergies.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Insurance */}
            {patient.insurance?.provider && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="text-gray-500 dark:text-gray-400 mb-1">Insurance:</div>
                <div className="text-gray-700 dark:text-gray-300 truncate">
                  {patient.insurance.provider}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

