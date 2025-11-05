import { useMemo } from "react";
import { 
  Users, 
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
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400",
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400",
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50">
            {icon}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
        {trend && (
          <span className="text-xs font-medium opacity-75">{trend}</span>
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
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
        <Activity size={16} />
        Dashboard Analytics
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <AnalyticsCard
          title="Total Patients"
          value={analytics.totalPatients}
          icon={<Users size={18} />}
          color="blue"
        />
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

