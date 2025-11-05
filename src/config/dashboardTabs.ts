import {
  LayoutDashboard,
  Activity,
  Pill,
  Calendar,
  FileText,
  Scan,
  Clock,
  Video,
  Sparkles,
  Users,
  Shield,
  Dna,
  Stethoscope,
  UserCircle,
  Settings as SettingsIcon,
  FlaskConical,
  Calculator,
  ArrowRight,
  FileCheck,
  Scissors,
  Apple,
  Syringe,
  DollarSign,
  Building2,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface DashboardTab {
  id: string;
  label: string;
  icon: LucideIcon;
  component: React.ComponentType<any>;
  requiresPatient?: boolean;
  permission?: string;
  workflowGroup?: "assessment" | "active-care" | "planning" | "diagnostics" | "advanced" | "administrative";
  order?: number;
}

// Import all components lazily or directly
import Overview from "../components/Overview";
import Vitals from "../components/Vitals";
import MedicationList from "../components/MedicationList";
import Consultation from "../components/Consultation";
import ScheduleAppointment from "../components/ScheduleAppointment";
import ClinicalNotes from "../components/ClinicalNotes";
import ViewImaging from "../components/ViewImaging";
import PatientTimeline from "../components/PatientTimeline";
import Telemedicine from "../components/Telemedicine";
import Longevity from "../components/Longevity";
import Microbiome from "../components/Microbiome";
import CareTeam from "../components/CareTeam";
import UserManagement from "../components/UserManagement";
import RoleManagement from "../components/RoleManagement";
import UserProfile from "../components/UserProfile";
import Settings from "../components/Settings";
import LabManagement from "../components/LabManagement";
import MedicationCalculators from "../components/MedicationCalculators";
import Referrals from "../components/Referrals";
import Consents from "../components/Consents";
import SurgicalNotes from "../components/SurgicalNotes";
import Nutrition from "../components/Nutrition";
import Vaccinations from "../components/Vaccinations";
import Billing from "../components/Billing";
import Hubs from "../components/Hubs";

// Clinical workflow groups organized by care phases:
// 1. ASSESSMENT: Initial patient evaluation and vital signs
// 2. ACTIVE CARE: Active treatment and consultation activities
// 3. PLANNING: Care coordination, scheduling, and documentation
// 4. DIAGNOSTICS: Imaging, labs, and diagnostic results
// 5. ADVANCED: Future-focused care (longevity, microbiome, genomics)
// 6. ADMINISTRATIVE: System and user management

export const dashboardTabs: DashboardTab[] = [
  // ASSESSMENT GROUP - First phase of patient encounter
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    component: Overview,
    requiresPatient: true,
    permission: "view_patients",
    workflowGroup: "assessment",
    order: 1,
  },
  {
    id: "vitals",
    label: "Vitals",
    icon: Activity,
    component: Vitals,
    requiresPatient: true,
    permission: "view_patients",
    workflowGroup: "assessment",
    order: 2,
  },

  // ACTIVE CARE GROUP - Core clinical activities
  {
    id: "consultation",
    label: "Consultation",
    icon: Stethoscope,
    component: Consultation,
    requiresPatient: true,
    permission: "view_consultations",
    workflowGroup: "active-care",
    order: 3,
  },
  {
    id: "medications",
    label: "Medications",
    icon: Pill,
    component: MedicationList,
    requiresPatient: true,
    permission: "view_medications",
    workflowGroup: "active-care",
    order: 4,
  },
  {
    id: "medication-calculators",
    label: "Med Calculators",
    icon: Calculator,
    component: MedicationCalculators,
    requiresPatient: false,
    permission: "view_medications",
    workflowGroup: "active-care",
    order: 5,
  },

  // PLANNING GROUP - Care coordination and documentation
  {
    id: "notes",
    label: "Clinical Notes",
    icon: FileText,
    component: ClinicalNotes,
    requiresPatient: true,
    permission: "view_notes",
    workflowGroup: "planning",
    order: 6,
  },
  {
    id: "appointments",
    label: "Appointments",
    icon: Calendar,
    component: ScheduleAppointment,
    requiresPatient: true,
    permission: "view_appointments",
    workflowGroup: "planning",
    order: 7,
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: Clock,
    component: PatientTimeline,
    requiresPatient: true,
    permission: "view_patients",
    workflowGroup: "planning",
    order: 8,
  },
  {
    id: "team",
    label: "Care Team",
    icon: Users,
    component: CareTeam,
    requiresPatient: true,
    permission: "view_patients",
    workflowGroup: "planning",
    order: 9,
  },
  {
    id: "referrals",
    label: "Referrals",
    icon: ArrowRight,
    component: Referrals,
    requiresPatient: true,
    permission: "view_patients",
    workflowGroup: "planning",
    order: 10,
  },
  {
    id: "consents",
    label: "Consents",
    icon: FileCheck,
    component: Consents,
    requiresPatient: true,
    permission: "view_notes",
    workflowGroup: "planning",
    order: 11,
  },
  {
    id: "surgical-notes",
    label: "Surgical Notes",
    icon: Scissors,
    component: SurgicalNotes,
    requiresPatient: true,
    permission: "view_notes",
    workflowGroup: "active-care",
    order: 12,
  },
  {
    id: "nutrition",
    label: "Nutrition",
    icon: Apple,
    component: Nutrition,
    requiresPatient: true,
    permission: "view_patients",
    workflowGroup: "active-care",
    order: 13,
  },
  {
    id: "vaccinations",
    label: "Vaccinations",
    icon: Syringe,
    component: Vaccinations,
    requiresPatient: true,
    permission: "view_patients",
    workflowGroup: "assessment",
    order: 14,
  },

  // DIAGNOSTICS GROUP - Diagnostic imaging and results
  {
    id: "imaging",
    label: "Imaging",
    icon: Scan,
    component: ViewImaging,
    requiresPatient: true,
    permission: "view_imaging",
    workflowGroup: "diagnostics",
    order: 15,
  },
  {
    id: "labs",
    label: "Lab Management",
    icon: FlaskConical,
    component: LabManagement,
    requiresPatient: true,
    permission: "view_labs",
    workflowGroup: "diagnostics",
    order: 16,
  },

  // ADVANCED GROUP - Future-focused care
  {
    id: "telemedicine",
    label: "Telemedicine",
    icon: Video,
    component: Telemedicine,
    requiresPatient: true,
    permission: "view_telemedicine",
    workflowGroup: "advanced",
    order: 17,
  },
  {
    id: "longevity",
    label: "Longevity",
    icon: Sparkles,
    component: Longevity,
    requiresPatient: true,
    permission: "view_patients",
    workflowGroup: "advanced",
    order: 18,
  },
  {
    id: "microbiome",
    label: "Microbiome",
    icon: Dna,
    component: Microbiome,
    requiresPatient: true,
    permission: "view_patients",
    workflowGroup: "advanced",
    order: 19,
  },

  // ADMINISTRATIVE GROUP - System management
  {
    id: "hubs",
    label: "Hubs",
    icon: Building2,
    component: Hubs,
    requiresPatient: false,
    permission: "view_patients",
    workflowGroup: "administrative",
    order: 20,
  },
  {
    id: "billing",
    label: "Billing",
    icon: DollarSign,
    component: Billing,
    requiresPatient: false,
    permission: "view_billing",
    workflowGroup: "administrative",
    order: 21,
  },
  {
    id: "profile",
    label: "Profile",
    icon: UserCircle,
    component: UserProfile,
    requiresPatient: false,
    workflowGroup: "administrative",
    order: 22,
  },
  {
    id: "users",
    label: "Users",
    icon: Shield,
    component: UserManagement,
    requiresPatient: false,
    permission: "manage_users",
    workflowGroup: "administrative",
    order: 23,
  },
  {
    id: "roles",
    label: "Roles & Permissions",
    icon: Shield,
    component: RoleManagement,
    requiresPatient: false,
    permission: "roles:write",
    workflowGroup: "administrative",
    order: 24,
  },
  {
    id: "settings",
    label: "Settings",
    icon: SettingsIcon,
    component: Settings,
    requiresPatient: false,
    workflowGroup: "administrative",
    order: 25,
  },
];

export const getTabById = (id: string): DashboardTab | undefined => {
  return dashboardTabs.find((tab) => tab.id === id);
};

export const getPatientTabs = (): DashboardTab[] => {
  return dashboardTabs.filter((tab) => tab.requiresPatient !== false);
};

export const getNonPatientTabs = (): DashboardTab[] => {
  return dashboardTabs.filter((tab) => tab.requiresPatient === false);
};

export const getTabsByWorkflowGroup = (group: DashboardTab["workflowGroup"]): DashboardTab[] => {
  return dashboardTabs.filter((tab) => tab.workflowGroup === group);
};

export const getWorkflowGroups = (): DashboardTab["workflowGroup"][] => {
  const groups = new Set<DashboardTab["workflowGroup"]>();
  dashboardTabs.forEach((tab) => {
    if (tab.workflowGroup) groups.add(tab.workflowGroup);
  });
  return Array.from(groups) as DashboardTab["workflowGroup"][];
};

export const getWorkflowGroupLabel = (group: DashboardTab["workflowGroup"]): string => {
  const labels: Record<string, string> = {
    assessment: "Assessment",
    "active-care": "Active Care",
    planning: "Planning & Coordination",
    diagnostics: "Diagnostics",
    advanced: "Advanced Care",
    administrative: "Administrative",
  };
  return labels[group || ""] || "";
};

// Sort tabs by workflow order
export const getOrderedTabs = (): DashboardTab[] => {
  return [...dashboardTabs].sort((a, b) => (a.order || 999) - (b.order || 999));
};

