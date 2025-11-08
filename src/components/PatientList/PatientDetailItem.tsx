import { memo } from "react";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  Pill,
  AlertTriangle,
  Heart,
  FileText,
  Clock,
  Circle,
  Square,
} from "lucide-react";
import { Patient } from "../../types";
import { getRiskColorClasses, getRiskLabel } from "../../utils/riskUtils";
import { getUpcomingAppointmentsCount, getActiveMedicationsCount } from "../../utils/patientUtils";
import { getConditionIcons } from "../../utils/patientConditionIcons";
import PatientHoverTooltip from "../PatientHoverTooltip";
import { useDashboard } from "../../context/DashboardContext";
import { PatientRiskBadge } from "../PatientRiskIndicator";

interface PatientDetailItemProps {
  patient: Patient;
  isSelected: boolean;
  onClick: () => void;
}

const PatientDetailItem = memo(({ patient, isSelected, onClick }: PatientDetailItemProps) => {
  const { setSelectedPatient, setActiveTab } = useDashboard();
  const upcomingApts = getUpcomingAppointmentsCount(patient);
  const activeMeds = getActiveMedicationsCount(patient);
  const genderLower = patient.gender?.toLowerCase() || "";
  const isMale = genderLower.includes("male") || genderLower === "m";
  const GenderIcon = isMale ? Square : Circle;
  const conditionIcons = getConditionIcons({ ...patient, medications: patient.medications });

  const handleEdit = () => {
    setSelectedPatient(patient);
    setActiveTab("overview");
    onClick();
  };

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`w-full text-left p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
        isSelected
          ? "border-primary-500 bg-gradient-to-br from-primary-50 via-white to-success-50 dark:from-primary-900/30 dark:via-gray-800 dark:to-success-900/20 shadow-lg ring-2 ring-primary-200 dark:ring-primary-800"
          : "border-gray-200/60 dark:border-gray-700/60 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gradient-to-br hover:from-gray-50 hover:to-primary-50/30 dark:hover:from-gray-800 dark:hover:to-primary-900/10 hover:shadow-md"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-3 rounded-lg transition-all duration-300 flex-shrink-0 ${
            isSelected 
              ? "bg-gradient-to-br from-primary-500 to-success-500 shadow-md" 
              : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600"
          }`}>
            {conditionIcons.length > 0 ? (() => {
              const PrimaryIcon = conditionIcons[0].icon;
              return (
                <div title={conditionIcons[0].label}>
                  <PrimaryIcon
                    size={20}
                    className={isSelected ? "text-white" : `${conditionIcons[0].color} ${conditionIcons[0].darkColor}`}
                  />
                </div>
              );
            })() : (
              <User size={20} className={isSelected ? "text-white" : "text-gray-600 dark:text-gray-300"} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <PatientHoverTooltip patient={patient} onEdit={handleEdit}>
                <h3 
                  className="font-bold text-base truncate cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {patient.name}
                </h3>
              </PatientHoverTooltip>
              <PatientRiskBadge patient={patient} />
              {/* Additional condition icons */}
              {conditionIcons.length > 1 && (
                <div className="flex items-center gap-1">
                  {conditionIcons.slice(1).map((iconConfig, idx) => {
                    const Icon = iconConfig.icon;
                    return (
                      <div key={idx} title={iconConfig.label}>
                        <Icon
                          size={14}
                          className={`${iconConfig.color} ${iconConfig.darkColor}`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span className="flex items-center gap-1.5">
                {patient.age}y
                <GenderIcon 
                  size={14} 
                  className={isMale ? "text-blue-500 dark:text-blue-400" : "text-pink-500 dark:text-pink-400"} 
                />
                {patient.gender}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getRiskColorClasses(patient.risk)}`}>
                {patient.risk}% • {getRiskLabel(patient.risk)}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {patient.condition || "No condition"}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {patient.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="truncate">{patient.phone}</span>
          </div>
        )}
        {patient.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="truncate">{patient.email}</span>
          </div>
        )}
        {patient.address && (
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 md:col-span-2">
            <MapPin size={14} className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="truncate">{patient.address}</span>
          </div>
        )}
        {patient.dob && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span>DOB: {new Date(patient.dob).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {upcomingApts > 0 && (
          <div className="flex items-center gap-2 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Calendar size={16} className="text-primary-600 dark:text-primary-400" />
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Appointments</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{upcomingApts}</div>
            </div>
          </div>
        )}
        {activeMeds > 0 && (
          <div className="flex items-center gap-2 p-2 bg-success-50 dark:bg-success-900/20 rounded-lg">
            <Pill size={16} className="text-success-600 dark:text-success-400" />
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Medications</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{activeMeds}</div>
            </div>
          </div>
        )}
        {patient.bp && (
          <div className="flex items-center gap-2 p-2 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
            <Heart size={16} className="text-warning-600 dark:text-warning-400" />
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Blood Pressure</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{patient.bp}</div>
            </div>
          </div>
        )}
        {Array.isArray(patient.allergies) && patient.allergies.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-destructive-50 dark:bg-destructive-900/20 rounded-lg">
            <AlertTriangle size={16} className="text-destructive-600 dark:text-destructive-400" />
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Allergies</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{patient.allergies.length}</div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Details */}
      <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        {patient.insurance?.provider && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Shield size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="truncate">
              Insurance: {patient.insurance.provider}
              {patient.insurance.policyNumber && ` • ${patient.insurance.policyNumber.slice(-4)}`}
            </span>
          </div>
        )}
        {patient.emergencyContact && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Phone size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="truncate">
              Emergency: {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
            </span>
          </div>
        )}
        {patient.preferredLanguage && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <FileText size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span>Language: {patient.preferredLanguage}</span>
          </div>
        )}
        {patient.id && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            <Clock size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span>ID: {patient.id.length > 8 ? `***${patient.id.slice(-4)}` : patient.id}</span>
          </div>
        )}
      </div>
    </div>
  );
});

PatientDetailItem.displayName = "PatientDetailItem";

export default PatientDetailItem;

