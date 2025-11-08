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
      className={`w-full text-left p-3 rounded-xl border transition-all duration-300 ${
        isSelected
          ? "border-primary-500 bg-gradient-to-br from-primary-50 via-white to-success-50 dark:from-primary-900/30 dark:via-gray-800 dark:to-success-900/20 shadow-lg ring-2 ring-primary-200 dark:ring-primary-800"
          : "border-gray-200/60 dark:border-gray-700/60 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gradient-to-br hover:from-gray-50 hover:to-primary-50/30 dark:hover:from-gray-800 dark:hover:to-primary-900/10 hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div title={conditionIcon.label} className="flex-shrink-0">
            <ConditionIcon 
              size={14} 
              className={`${conditionIcon.color} ${conditionIcon.darkColor}`}
            />
          </div>
          <PatientHoverTooltip patient={patient} onEdit={handleEdit}>
            <span 
              className="font-semibold text-sm truncate cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {patient.name}
            </span>
          </PatientHoverTooltip>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0 ${getRiskColorClasses(
            patient.risk
          )}`}
        >
          {patient.risk}%
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            {patient.age}y
            <GenderIcon 
              size={12} 
              className={isMale ? "text-blue-500 dark:text-blue-400" : "text-pink-500 dark:text-pink-400"} 
            />
            {patient.gender}
            {patient.dob && (
              <>
                <span className="mx-1">•</span>
                <Calendar size={11} className="text-gray-400 dark:text-gray-500" />
                <span>{new Date(patient.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </>
            )}
          </span>
          {upcomingApts > 0 && (
            <span className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
              <Calendar size={12} />
              {upcomingApts}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate flex-1">{patient.condition || "No condition"}</span>
        </div>
        {patient.address && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <MapPin size={11} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="truncate">{patient.address}</span>
          </div>
        )}
      </div>
    </button>
  );
});

PatientListItem.displayName = "PatientListItem";

export default PatientListItem;

