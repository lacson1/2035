import { memo } from "react";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Patient } from "../../types";
import { getRiskColorClasses, getRiskLabel } from "../../utils/riskUtils";
import { getUpcomingAppointmentsCount, getActiveMedicationsCount } from "../../utils/patientUtils";

interface PatientGridItemProps {
  patient: Patient;
  isSelected: boolean;
  onClick: () => void;
}

const PatientGridItem = memo(({ patient, isSelected, onClick }: PatientGridItemProps) => {
  const getRecentActivity = (patient: Patient) => {
    const recent = patient.timeline?.[0];
    if (!recent) return null;
    const daysAgo = Math.floor(
      (Date.now() - new Date(recent.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysAgo <= 7 ? daysAgo : null;
  };

  const upcomingApts = getUpcomingAppointmentsCount(patient);
  const recentDays = getRecentActivity(patient);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
        isSelected
          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-md ring-2 ring-blue-200 dark:ring-blue-800"
          : "border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 hover:shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`p-2 rounded-lg ${
            isSelected 
              ? "bg-blue-200 dark:bg-blue-800" 
              : "bg-gray-100 dark:bg-gray-700"
          }`}>
            <User size={18} className="text-gray-600 dark:text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{patient.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {patient.age}y • {patient.gender}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{patient.condition}</span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0 ${getRiskColorClasses(
              patient.risk
            )}`}
          >
            {patient.risk}%
          </span>
        </div>
        {/* Contact Information */}
        <div className="space-y-1.5">
          {patient.address && (
            <div className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <MapPin size={12} className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
              <span className="truncate line-clamp-1">{patient.address}</span>
            </div>
          )}
          {patient.phone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Phone size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">{patient.phone}</span>
            </div>
          )}
          {patient.email && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Mail size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">{patient.email}</span>
            </div>
          )}
        </div>
        {/* Extra details chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700">
            ID: {patient.id.length > 8 ? `***${patient.id.slice(-4)}` : `***${patient.id.slice(-4)}`}
          </span>
          {Array.isArray(patient.allergies) && patient.allergies.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700">
              {patient.allergies.length} allergies
            </span>
          )}
          {patient.insurance?.provider && (
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700 truncate max-w-[150px]">
              {patient.insurance.provider}
            </span>
          )}
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-1.5 py-0.5 rounded ${getRiskColorClasses(patient.risk)}`}>
            {getRiskLabel(patient.risk)}
          </span>
          {getActiveMedicationsCount(patient) > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getActiveMedicationsCount(patient)} meds
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {upcomingApts > 0 && (
            <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <Calendar size={12} />
              {upcomingApts}
            </span>
          )}
        </div>
      </div>
    </button>
  );
});

PatientGridItem.displayName = "PatientGridItem";

export default PatientGridItem;

