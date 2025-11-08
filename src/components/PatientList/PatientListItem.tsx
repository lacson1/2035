import { memo } from "react";
import {
  Calendar,
  Circle,
  Square,
  MapPin,
} from "lucide-react";
import { Patient } from "../../types";
import { getRiskColorClasses } from "../../utils/riskUtils";
import { getUpcomingAppointmentsCount } from "../../utils/patientUtils";
import { getConditionIcon } from "../../utils/patientConditionIcons";
import PatientHoverTooltip from "../PatientHoverTooltip";
import { useDashboard } from "../../context/DashboardContext";

interface PatientListItemProps {
  patient: Patient;
  isSelected: boolean;
  onClick: () => void;
}

const PatientListItem = memo(({ patient, isSelected, onClick }: PatientListItemProps) => {
  const { setSelectedPatient, setActiveTab } = useDashboard();
  
  const upcomingApts = getUpcomingAppointmentsCount(patient);
  const genderLower = patient.gender?.toLowerCase() || "";
  const isMale = genderLower.includes("male") || genderLower === "m";
  const GenderIcon = isMale ? Square : Circle;
  const conditionIcon = getConditionIcon(patient);
  const ConditionIcon = conditionIcon.icon;

  const handleEdit = () => {
    setSelectedPatient(patient);
    setActiveTab("overview");
    onClick();
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group ${
        isSelected
          ? "border-slate-400 bg-gradient-to-br from-slate-50 via-white to-slate-25 dark:from-slate-800/50 dark:via-slate-700 dark:to-slate-600/30 shadow-lg ring-1 ring-slate-300 dark:ring-slate-600"
          : "border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-25/30 dark:hover:from-slate-800/30 dark:hover:to-slate-700/20 hover:shadow-md"
      }`}
    >
      {/* Header with Name and Risk */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Condition Icon */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isSelected
                ? 'bg-white/80 dark:bg-slate-600/80'
                : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-white/60 dark:group-hover:bg-slate-700/60'
            } transition-colors`}
            title={conditionIcon.label}
          >
            <ConditionIcon
              size={16}
              className={`${conditionIcon.color} ${conditionIcon.darkColor}`}
            />
          </div>

          {/* Patient Name */}
          <div className="flex-1 min-w-0">
            <PatientHoverTooltip patient={patient} onEdit={handleEdit}>
              <h3
                className="font-medium text-slate-800 dark:text-slate-100 truncate text-sm cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {patient.name}
              </h3>
            </PatientHoverTooltip>

            {/* Age, Gender, DOB */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {patient.age} years
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
              <div className="flex items-center gap-1">
                <GenderIcon
                  size={10}
                  className={isMale ? "text-blue-500 dark:text-blue-400" : "text-pink-500 dark:text-pink-400"}
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {patient.gender}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Score */}
        <div className="flex items-center gap-2 ml-3">
          {upcomingApts > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-xs font-medium">
              <Calendar size={12} />
              {upcomingApts}
            </div>
          )}
          <div className={`px-2 py-1 rounded-md text-xs font-semibold ${
            patient.risk >= 80 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
            patient.risk >= 60 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
            patient.risk >= 40 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          }`}>
            {patient.risk}%
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-2">
        {/* Condition */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Condition
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
              {patient.condition || "Not specified"}
            </span>
          </div>
        </div>

        {/* Address */}
        {patient.address && (
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {patient.address}
            </span>
          </div>
        )}

        {/* Date of Birth */}
        {patient.dob && (
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {new Date(patient.dob).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        )}
      </div>
    </button>
  );
});

PatientListItem.displayName = "PatientListItem";

export default PatientListItem;

