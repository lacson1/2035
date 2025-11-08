import { memo } from "react";
import {
  Calendar,
  Circle,
  Square,
} from "lucide-react";
import { Patient } from "../../types";
import { getRiskColorClasses } from "../../utils/riskUtils";
import { getUpcomingAppointmentsCount } from "../../utils/patientUtils";
import { getConditionIcon } from "../../utils/patientConditionIcons";
import PatientHoverTooltip from "../PatientHoverTooltip";
import { useDashboard } from "../../context/DashboardContext";
import { PatientRiskBadge } from "../PatientRiskIndicator";

interface PatientGridItemProps {
  patient: Patient;
  isSelected: boolean;
  onClick: () => void;
}

const PatientGridItem = memo(({ patient, isSelected, onClick }: PatientGridItemProps) => {
  const { setSelectedPatient, setActiveTab } = useDashboard();
  const upcomingApts = getUpcomingAppointmentsCount(patient);
  const genderLower = patient.gender?.toLowerCase() || "";
  const isMale = genderLower.includes("male") || genderLower === "m";
  const GenderIcon = isMale ? Square : Circle;
  const conditionIcon = getConditionIcon(patient);
  const ConditionIcon = conditionIcon.icon;
  // const recentDays = getRecentActivity(patient); // Unused for now

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
      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 relative ${
        isSelected
          ? "border-primary-500 bg-gradient-to-br from-primary-50 via-white to-success-50 dark:from-primary-900/30 dark:via-gray-800 dark:to-success-900/20 shadow-lg ring-2 ring-primary-200 dark:ring-primary-800"
          : "border-gray-200/60 dark:border-gray-700/60 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gradient-to-br hover:from-gray-50 hover:to-primary-50/30 dark:hover:from-gray-800 dark:hover:to-primary-900/10 hover:shadow-md"
      }`}
    >
      <PatientRiskBadge patient={patient} />
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`p-2 rounded-lg transition-all duration-300 flex-shrink-0 ${
            isSelected 
              ? "bg-gradient-to-br from-primary-500 to-success-500 shadow-md" 
              : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600"
          }`}>
            <div title={conditionIcon.label}>
              <ConditionIcon 
                size={16} 
                className={isSelected ? "text-white" : `${conditionIcon.color} ${conditionIcon.darkColor}`}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <PatientHoverTooltip patient={patient} onEdit={handleEdit}>
              <h4 
                className="font-semibold text-sm truncate cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {patient.name}
              </h4>
            </PatientHoverTooltip>
          </div>
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
          </span>
          {upcomingApts > 0 && (
            <span className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
              <Calendar size={12} />
              {upcomingApts}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate block">
          {patient.condition || "No condition"}
        </span>
      </div>
    </button>
  );
});

PatientGridItem.displayName = "PatientGridItem";

export default PatientGridItem;

