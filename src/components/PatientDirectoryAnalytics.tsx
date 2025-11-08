import { useMemo } from "react";
import { 
  AlertTriangle, 
  Activity, 
  Calendar,
  TrendingUp,
  Heart
} from "lucide-react";
import { Patient } from "../types";
import { getUpcomingAppointmentsCount } from "../utils/patientUtils";

interface PatientDirectoryAnalyticsProps {
  patients: Patient[];
}

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: "blue" | "red" | "green" | "purple" | "orange";
}

const AnalyticsCard = ({ title, value, icon, trend, color }: AnalyticsCardProps) => {
  const colorClasses = {
    blue: "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400",
    red: "bg-destructive-50 dark:bg-destructive-900/20 border-destructive-200 dark:border-destructive-800 text-destructive-600 dark:text-destructive-400",
    green: "bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800 text-success-600 dark:text-success-400",
    purple: "bg-special-50 dark:bg-special-900/20 border-special-200 dark:border-special-800 text-special-600 dark:text-special-400",
    orange: "bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800 text-warning-600 dark:text-warning-400",
  };

  return (
    <div className={`p-3 rounded-xl border ${colorClasses[color]} transition-all duration-200 hover:shadow-md hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="p-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 flex-shrink-0">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5 truncate">{title}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
        {trend && (
          <span className="text-xs font-medium opacity-75 ml-2 flex-shrink-0">{trend}</span>
        )}
      </div>
    </div>
  );
};

export default function PatientDirectoryAnalytics({ patients }: PatientDirectoryAnalyticsProps) {
  const analytics = useMemo(() => {
    const totalPatients = patients.length;
    
    // High risk patients (risk >= 60%)
    const highRiskPatients = patients.filter(p => p.risk >= 60).length;
    const highRiskPercentage = totalPatients > 0 
      ? Math.round((highRiskPatients / totalPatients) * 100) 
      : 0;
    
    // Patients with allergies
    const patientsWithAllergies = patients.filter(p => p.allergies && p.allergies.length > 0).length;
    
    // Average risk level
    const avgRisk = totalPatients > 0
      ? Math.round(patients.reduce((sum, p) => sum + p.risk, 0) / totalPatients)
      : 0;
    
    // Recent activity (patients with timeline events in last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentActivityCount = patients.filter(p => {
      if (!p.timeline || p.timeline.length === 0) return false;
      const mostRecent = p.timeline[0];
      return new Date(mostRecent.date).getTime() >= sevenDaysAgo;
    }).length;
    
    // Total upcoming appointments
    const totalUpcomingAppointments = patients.reduce((sum, p) => 
      sum + getUpcomingAppointmentsCount(p), 0
    );
    
    // Medium risk patients (40-59%)
    const mediumRiskPatients = patients.filter(p => p.risk >= 40 && p.risk < 60).length;
    
    // Low risk patients (< 40%)
    const lowRiskPatients = patients.filter(p => p.risk < 40).length;

    return {
      totalPatients,
      highRiskPatients,
      highRiskPercentage,
      patientsWithAllergies,
      avgRisk,
      recentActivityCount,
      totalUpcomingAppointments,
      mediumRiskPatients,
      lowRiskPatients,
    };
  }, [patients]);

  if (patients.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
        <Activity size={14} />
        Overview
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <AnalyticsCard
          title="High Risk"
          value={analytics.highRiskPatients}
          icon={<AlertTriangle size={18} />}
          trend={`${analytics.highRiskPercentage}%`}
          color="red"
        />
        <AnalyticsCard
          title="Allergies"
          value={analytics.patientsWithAllergies}
          icon={<Heart size={18} />}
          color="orange"
        />
        <AnalyticsCard
          title="Avg Risk"
          value={`${analytics.avgRisk}%`}
          icon={<TrendingUp size={18} />}
          color="purple"
        />
        <AnalyticsCard
          title="Recent Activity"
          value={analytics.recentActivityCount}
          icon={<Activity size={18} />}
          color="green"
        />
        <AnalyticsCard
          title="Upcoming"
          value={analytics.totalUpcomingAppointments}
          icon={<Calendar size={18} />}
          color="blue"
        />
      </div>
    </div>
  );
}

