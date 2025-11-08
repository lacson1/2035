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
    <div className="card hover:shadow-lg transition-all duration-300 animate-slide-up">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/20">
            <Icon className="text-teal-600 dark:text-teal-400" size={16} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <button
          onClick={() => setActiveTab(tabId)}
          className="text-[10px] text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
        >
          View All →
        </button>
      </div>
      
      <div className="flex items-center gap-3 mb-2.5">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</div>
        {pending !== undefined && pending > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-[10px] text-amber-700 dark:text-amber-300 font-medium">
            <AlertCircle size={12} />
            <span>{pending} pending</span>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="text-[10px] text-gray-600 dark:text-gray-400 p-2 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg cursor-pointer hover:from-teal-50 hover:to-teal-50/50 dark:hover:from-teal-900/20 dark:hover:to-teal-900/10 transition-all duration-200 border border-transparent hover:border-teal-200/50 dark:hover:border-teal-700/50"
              onClick={() => setActiveTab(tabId)}
            >
              {itemRenderer(item)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-gray-500 dark:text-gray-400 italic">No items yet</p>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
              <p className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                {typeof ref.specialty === 'string' ? ref.specialty : String(ref.specialty)}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {new Date(ref.date).toLocaleDateString()}
              </p>
            </div>
            <span className={`text-[10px] font-medium ${getStatusColor(ref.status)}`}>
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
              <p className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                {consent.title}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {new Date(consent.date).toLocaleDateString()}
              </p>
            </div>
            <span className={`text-[10px] font-medium ${getStatusColor(consent.status)}`}>
              {consent.status === "signed" ? (
                <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
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
              <p className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                {note.procedureName}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {new Date(note.date).toLocaleDateString()}
              </p>
            </div>
            <span className={`text-[10px] font-medium ${getStatusColor(note.status)}`}>
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
            <p className="font-medium text-xs text-gray-900 dark:text-gray-100 capitalize">
              {entry.type.replace("_", " ")}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
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
              <p className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                {vax.vaccineName}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {new Date(vax.date).toLocaleDateString()}
                {vax.doseNumber && ` • Dose ${vax.doseNumber}`}
              </p>
            </div>
            {vax.verified ? (
              <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
            ) : (
              <Clock size={12} className="text-yellow-600 dark:text-yellow-400" />
            )}
          </div>
        )}
      />
    </div>
  );
}

