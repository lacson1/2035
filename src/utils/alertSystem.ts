import { Patient, Medication } from "../types";

export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AlertType =
  | "drug-interaction"
  | "allergy"
  | "critical-lab"
  | "critical-vital"
  | "overdue-followup"
  | "medication-review"
  | "preventive-care"
  | "trend-alert";

export interface Alert {
  id: string;
  patientId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  createdAt: Date;
  actionRequired?: boolean;
  relatedData?: any;
}

// Critical lab value thresholds
const CRITICAL_LAB_VALUES: Record<string, { min?: number; max?: number }> = {
  potassium: { min: 3.0, max: 6.0 },
  sodium: { min: 130, max: 150 },
  glucose: { min: 70, max: 400 },
  creatinine: { max: 2.5 },
  hemoglobin: { min: 7, max: 18 },
  platelets: { min: 50000, max: 1000000 },
  wbc: { min: 2000, max: 30000 },
};

// Critical vital thresholds
const CRITICAL_VITAL_VALUES = {
  systolicBP: { min: 90, max: 180 },
  diastolicBP: { min: 60, max: 120 },
  heartRate: { min: 40, max: 150 },
  temperature: { min: 95, max: 104 },
  oxygen: { min: 90 },
};

/**
 * Check for drug interactions and create alerts
 */
export function checkDrugInteractionAlerts(
  patient: Patient,
  newMedication?: Medication
): Alert[] {
  const alerts: Alert[] = [];
  const medications = patient.medications || [];

  if (medications.length < 2) return alerts;

  // Check for known dangerous combinations
  const medNames = medications.map((m) => m.name.toLowerCase());
  if (newMedication) {
    medNames.push(newMedication.name.toLowerCase());
  }

  // Warfarin + Aspirin/NSAIDs
  if (
    medNames.some((m) => m.includes("warfarin")) &&
    (medNames.some((m) => m.includes("aspirin")) ||
      medNames.some((m) => m.includes("ibuprofen")) ||
      medNames.some((m) => m.includes("naproxen")))
  ) {
    alerts.push({
      id: `interaction-${Date.now()}`,
      patientId: patient.id,
      type: "drug-interaction",
      severity: "critical",
      title: "Critical Drug Interaction",
      message: "Warfarin + Aspirin/NSAIDs: Significantly increased bleeding risk",
      acknowledged: false,
      createdAt: new Date(),
      actionRequired: true,
      relatedData: {
        medications: medNames.filter(
          (m) =>
            m.includes("warfarin") ||
            m.includes("aspirin") ||
            m.includes("ibuprofen") ||
            m.includes("naproxen")
        ),
      },
    });
  }

  // ACE Inhibitor + Potassium supplements
  if (
    medNames.some(
      (m) =>
        m.includes("lisinopril") ||
        m.includes("enalapril") ||
        m.includes("ramipril")
    ) &&
    medNames.some((m) => m.includes("potassium"))
  ) {
    alerts.push({
      id: `interaction-${Date.now()}-1`,
      patientId: patient.id,
      type: "drug-interaction",
      severity: "high",
      title: "Drug Interaction Warning",
      message: "ACE Inhibitor + Potassium: Risk of hyperkalemia",
      acknowledged: false,
      createdAt: new Date(),
      actionRequired: true,
    });
  }

  return alerts;
}

/**
 * Check for allergy alerts
 */
export function checkAllergyAlerts(
  patient: Patient,
  medication: Medication
): Alert[] {
  const alerts: Alert[] = [];
  const allergies = patient.allergies || [];

  if (allergies.length === 0) return alerts;

  const medName = medication.name.toLowerCase();

  // Check for direct allergy match
  const directMatch = allergies.some((allergy) =>
    medName.includes(allergy.toLowerCase())
  );

  if (directMatch) {
    alerts.push({
      id: `allergy-${Date.now()}`,
      patientId: patient.id,
      type: "allergy",
      severity: "critical",
      title: "CRITICAL: Patient Allergy",
      message: `Patient is allergic to ${medication.name}`,
      acknowledged: false,
      createdAt: new Date(),
      actionRequired: true,
      relatedData: { medication: medication.name, allergies },
    });
  }

  // Check for cross-allergies (penicillin -> cephalosporins)
  const hasPenicillinAllergy = allergies.some((a) =>
    a.toLowerCase().includes("penicillin")
  );
  if (
    hasPenicillinAllergy &&
    (medName.includes("cef") || medName.includes("cephalexin"))
  ) {
    alerts.push({
      id: `cross-allergy-${Date.now()}`,
      patientId: patient.id,
      type: "allergy",
      severity: "high",
      title: "Cross-Allergy Warning",
      message: "Patient allergic to Penicillin - consider Cephalosporin cross-reactivity",
      acknowledged: false,
      createdAt: new Date(),
      actionRequired: true,
    });
  }

  return alerts;
}

/**
 * Check for critical lab values
 */
export function checkCriticalLabAlerts(patient: Patient): Alert[] {
  const alerts: Alert[] = [];
  const labResults = patient.labResults || [];

  labResults.forEach((lab) => {
    // Extract value from results object if available
    const labValue = (lab as any).value || (lab.results && Object.values(lab.results)[0] ? (Object.values(lab.results)[0] as any).value : null);
    if (!labValue || !lab.testName) return;

    const testName = lab.testName.toLowerCase();
    const value = parseFloat(String(labValue));

    if (isNaN(value)) return;

    // Check potassium
    if (testName.includes("potassium") || testName.includes("k+")) {
      const threshold = CRITICAL_LAB_VALUES.potassium;
      if ((threshold.min && value < threshold.min) || (threshold.max && value > threshold.max)) {
        alerts.push({
          id: `critical-lab-${lab.id}`,
          patientId: patient.id,
          type: "critical-lab",
          severity: value < 3.0 || value > 6.0 ? "critical" : "high",
          title: `Critical Lab Value: ${lab.testName}`,
          message: (() => {
            const labUnit = (lab as any).unit || (lab.results && Object.values(lab.results)[0] ? (Object.values(lab.results)[0] as any).unit : "");
            return `${lab.testName}: ${labValue} ${labUnit} - ${
              value < 3.0 || value > 6.0 ? "CRITICAL" : "Abnormal"
            }`;
          })(),
          acknowledged: false,
          createdAt: new Date(),
          actionRequired: true,
          relatedData: { lab },
        });
      }
    }

    // Check glucose
    if (testName.includes("glucose")) {
      const threshold = CRITICAL_LAB_VALUES.glucose;
      if ((threshold.min && value < threshold.min) || (threshold.max && value > threshold.max)) {
        alerts.push({
          id: `critical-lab-glucose-${lab.id}`,
          patientId: patient.id,
          type: "critical-lab",
          severity: value < 50 || value > 500 ? "critical" : "high",
          title: `Critical Glucose: ${labValue}`,
          message: `Glucose: ${labValue} mg/dL - ${
            value < 50 || value > 500 ? "CRITICAL" : "Abnormal"
          }`,
          acknowledged: false,
          createdAt: new Date(),
          actionRequired: true,
          relatedData: { lab },
        });
      }
    }

    // Check creatinine
    if (testName.includes("creatinine")) {
      const threshold = CRITICAL_LAB_VALUES.creatinine;
      if (threshold.max && value > threshold.max) {
        alerts.push({
          id: `critical-lab-creatinine-${lab.id}`,
          patientId: patient.id,
          type: "critical-lab",
          severity: "high",
          title: `Elevated Creatinine: ${labValue || 'N/A'}`,
          message: `Creatinine: ${labValue || 'N/A'} mg/dL - Possible renal impairment`,
          acknowledged: false,
          createdAt: new Date(),
          actionRequired: true,
          relatedData: { lab },
        });
      }
    }
  });

  return alerts;
}

/**
 * Check for critical vital signs
 */
export function checkCriticalVitalAlerts(patient: Patient): Alert[] {
  const alerts: Alert[] = [];

  // Parse blood pressure
  if (patient.bp) {
    const bpMatch = patient.bp.match(/(\d+)\/(\d+)/);
    if (bpMatch) {
      const systolic = parseInt(bpMatch[1]);
      const diastolic = parseInt(bpMatch[2]);

      if (
        systolic > CRITICAL_VITAL_VALUES.systolicBP.max ||
        systolic < CRITICAL_VITAL_VALUES.systolicBP.min ||
        diastolic > CRITICAL_VITAL_VALUES.diastolicBP.max ||
        diastolic < CRITICAL_VITAL_VALUES.diastolicBP.min
      ) {
        alerts.push({
          id: `critical-vital-bp-${Date.now()}`,
          patientId: patient.id,
          type: "critical-vital",
          severity:
            systolic > 180 || diastolic > 120 || systolic < 90
              ? "critical"
              : "high",
          title: `Critical Blood Pressure: ${patient.bp}`,
          message: `BP: ${patient.bp} - ${
            systolic > 180 || diastolic > 120
              ? "Hypertensive Crisis"
              : systolic < 90
              ? "Hypotension"
              : "Abnormal"
          }`,
          acknowledged: false,
          createdAt: new Date(),
          actionRequired: true,
        });
      }
    }
  }

  return alerts;
}

/**
 * Get all alerts for a patient
 */
export function getAllPatientAlerts(patient: Patient): Alert[] {
  const alerts: Alert[] = [];

  // Check drug interactions
  alerts.push(...checkDrugInteractionAlerts(patient));

  // Check critical labs
  alerts.push(...checkCriticalLabAlerts(patient));

  // Check critical vitals
  alerts.push(...checkCriticalVitalAlerts(patient));

  // Check for overdue follow-ups (if appointments exist)
  if (patient.appointments) {
    const overdueAppointments = patient.appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate < new Date() && apt.status === "scheduled";
    });

    if (overdueAppointments.length > 0) {
      alerts.push({
        id: `overdue-followup-${Date.now()}`,
        patientId: patient.id,
        type: "overdue-followup",
        severity: "medium",
        title: "Overdue Follow-up",
        message: `${overdueAppointments.length} overdue appointment(s)`,
        acknowledged: false,
        createdAt: new Date(),
        actionRequired: true,
        relatedData: { appointments: overdueAppointments },
      });
    }
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Acknowledge an alert
 */
export function acknowledgeAlert(
  _alertId: string,
  userId: string
): Partial<Alert> {
  return {
    acknowledged: true,
    acknowledgedAt: new Date(),
    acknowledgedBy: userId,
  };
}

/**
 * Get alert count by severity
 */
export function getAlertCounts(alerts: Alert[]): {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
} {
  return {
    critical: alerts.filter((a) => a.severity === "critical" && !a.acknowledged).length,
    high: alerts.filter((a) => a.severity === "high" && !a.acknowledged).length,
    medium: alerts.filter((a) => a.severity === "medium" && !a.acknowledged).length,
    low: alerts.filter((a) => a.severity === "low" && !a.acknowledged).length,
    total: alerts.filter((a) => !a.acknowledged).length,
  };
}

