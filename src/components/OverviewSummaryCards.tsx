import { useMemo } from "react";
import {
  ArrowRight,
  FileCheck,
  Activity,
  Apple,
  Syringe,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Patient, Referral, Consent, SurgicalNote, NutritionEntry, Vaccination } from "../types";
import { useDashboard } from "../context/DashboardContext";

interface OverviewSummaryCardsProps {
  patient: Patient;
}

export default function OverviewSummaryCards({ patient }: OverviewSummaryCardsProps) {
  const { setActiveTab } = useDashboard();

  // Get recent items
  const recentReferrals = useMemo(() => {
    const referrals = patient.referrals || [];
    return referrals
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [patient.referrals]);

  const recentConsents = useMemo(() => {
    const consents = patient.consents || [];
    return consents
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [patient.consents]);

  const recentSurgicalNotes = useMemo(() => {
    const notes = patient.surgicalNotes || [];
    return notes
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [patient.surgicalNotes]);

  const recentNutritionEntries = useMemo(() => {
    const entries = patient.nutritionEntries || [];
    return entries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [patient.nutritionEntries]);

  const recentVaccinations = useMemo(() => {
    const vaccinations = patient.vaccinations || [];
    return vaccinations
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [patient.vaccinations]);

  // Get pending items
  const pendingReferrals = useMemo(() => {
    return (patient.referrals || []).filter((r) => r.status === "pending" || r.status === "sent").length;
  }, [patient.referrals]);

  const pendingConsents = useMemo(() => {
    return (patient.consents || []).filter((c) => c.status === "pending").length;
  }, [patient.consents]);

  const upcomingVaccinations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (patient.vaccinations || []).filter((v) => {
      if (!v.nextDoseDate) return false;
      const nextDate = new Date(v.nextDoseDate);
      nextDate.setHours(0, 0, 0, 0);
      return nextDate >= today && nextDate <= new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000); // Next 90 days
    }).length;
  }, [patient.vaccinations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
      case "signed":
      case "completed":
        return "text-green-600 dark:text-green-400";
      case "pending":
      case "sent":
      case "scheduled":
        return "text-yellow-600 dark:text-yellow-400";
      case "cancelled":
      case "declined":
      case "revoked":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const SummaryCard = ({ 
    title, 
    icon: Icon, 
    count, 
    pending, 
    items, 
    tabId,
    itemRenderer 
  }: {
    title: string;
    icon: React.ComponentType<any>;
    count: number;
    pending?: number;
    items: any[];
    tabId: string;
    itemRenderer: (item: any) => React.ReactNode;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="text-teal-600 dark:text-teal-400" size={20} />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <button
          onClick={() => setActiveTab(tabId)}
          className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
        >
          View All
        </button>
      </div>
      
      <div className="flex items-center gap-4 mb-3">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</div>
        {pending !== undefined && pending > 0 && (
          <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
            <AlertCircle size={14} />
            <span>{pending} pending</span>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setActiveTab(tabId)}
            >
              {itemRenderer(item)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 dark:text-gray-400">No items yet</p>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Referrals Card */}
      <SummaryCard
        title="Referrals"
        icon={ArrowRight}
        count={patient.referrals?.length || 0}
        pending={pendingReferrals}
        items={recentReferrals}
        tabId="referrals"
        itemRenderer={(ref: Referral) => (
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {typeof ref.specialty === 'string' ? ref.specialty : String(ref.specialty)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(ref.date).toLocaleDateString()}
              </p>
            </div>
            <span className={`text-xs font-medium ${getStatusColor(ref.status)}`}>
              {ref.status}
            </span>
          </div>
        )}
      />

      {/* Consents Card */}
      <SummaryCard
        title="Consents"
        icon={FileCheck}
        count={patient.consents?.length || 0}
        pending={pendingConsents}
        items={recentConsents}
        tabId="consents"
        itemRenderer={(consent: Consent) => (
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {consent.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(consent.date).toLocaleDateString()}
              </p>
            </div>
            <span className={`text-xs font-medium ${getStatusColor(consent.status)}`}>
              {consent.status === "signed" ? (
                <CheckCircle size={14} className="text-green-600 dark:text-green-400" />
              ) : (
                consent.status
              )}
            </span>
          </div>
        )}
      />

      {/* Surgical Notes Card */}
      <SummaryCard
        title="Surgical Notes"
        icon={Activity}
        count={patient.surgicalNotes?.length || 0}
        items={recentSurgicalNotes}
        tabId="surgical-notes"
        itemRenderer={(note: SurgicalNote) => (
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {note.procedureName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(note.date).toLocaleDateString()}
              </p>
            </div>
            <span className={`text-xs font-medium ${getStatusColor(note.status)}`}>
              {note.status}
            </span>
          </div>
        )}
      />

      {/* Nutrition Card */}
      <SummaryCard
        title="Nutrition"
        icon={Apple}
        count={patient.nutritionEntries?.length || 0}
        items={recentNutritionEntries}
        tabId="nutrition"
        itemRenderer={(entry: NutritionEntry) => (
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
              {entry.type.replace("_", " ")}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(entry.date).toLocaleDateString()}
              {entry.dietitian && ` • ${entry.dietitian}`}
            </p>
          </div>
        )}
      />

      {/* Vaccinations Card */}
      <SummaryCard
        title="Vaccinations"
        icon={Syringe}
        count={patient.vaccinations?.length || 0}
        pending={upcomingVaccinations}
        items={recentVaccinations}
        tabId="vaccinations"
        itemRenderer={(vax: Vaccination) => (
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {vax.vaccineName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(vax.date).toLocaleDateString()}
                {vax.doseNumber && ` • Dose ${vax.doseNumber}`}
              </p>
            </div>
            {vax.verified ? (
              <CheckCircle size={14} className="text-green-600 dark:text-green-400" />
            ) : (
              <Clock size={14} className="text-yellow-600 dark:text-yellow-400" />
            )}
          </div>
        )}
      />
    </div>
  );
}

