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

interface PatientListItemProps {
  patient: Patient;
  isSelected: boolean;
  onClick: () => void;
}

const PatientListItem = memo(({ patient, isSelected, onClick }: PatientListItemProps) => {
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
      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
        isSelected
          ? "border-teal-500 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 shadow-md ring-2 ring-teal-200 dark:ring-teal-800"
          : "border-gray-200/50 dark:border-gray-700/50 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 hover:shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <User size={16} className="text-gray-400 flex-shrink-0" />
          <span className="font-medium truncate">{patient.name}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {recentDays !== null && (
            <span className="text-xs text-green-600 dark:text-green-400" title="Recent activity">
              {recentDays}d
            </span>
          )}
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${getRiskColorClasses(
              patient.risk
            )}`}
          >
            {patient.risk}%
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span>{patient.age}y • {patient.gender}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">{patient.condition}</span>
          <div className="flex items-center gap-2">
            {upcomingApts > 0 && (
              <span className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400">
                <Calendar size={12} />
                {upcomingApts}
              </span>
            )}
          </div>
        </div>
        {/* Contact Information */}
        <div className="mt-2 space-y-1">
          {patient.address && (
            <div className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <MapPin size={12} className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
              <span className="truncate">{patient.address}</span>
            </div>
          )}
          {patient.phone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Phone size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span>{patient.phone}</span>
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
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700">
            ID: {patient.id.length > 8 ? `***${patient.id.slice(-4)}` : `***${patient.id.slice(-4)}`}
          </span>
          {Array.isArray(patient.allergies) && patient.allergies.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700">
              Allergies: {patient.allergies.length}
            </span>
          )}
          {patient.insurance?.provider && (
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700 truncate max-w-[140px]">
              {patient.insurance.provider}
            </span>
          )}
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-1.5 py-0.5 rounded ${getRiskColorClasses(patient.risk)}`}>
          {getRiskLabel(patient.risk)}
        </span>
        {getActiveMedicationsCount(patient) > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getActiveMedicationsCount(patient)} meds
          </span>
        )}
      </div>
    </button>
  );
});

PatientListItem.displayName = "PatientListItem";

export default PatientListItem;

