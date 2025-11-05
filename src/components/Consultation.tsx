import { useState, useEffect, useMemo } from "react";
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  X,
  FileText,
  Building2,
  Video,
  MapPin,
  Filter,
  Sparkles,
  ClipboardList,
  Zap,
  Copy,
  Edit,
  Printer,
} from "lucide-react";
import { Patient, Appointment, ClinicalNote, ConsultationType, SpecialtyType, CustomConsultationTemplate } from "../types";
import { getSpecialtyTemplate, getAllSpecialties } from "../data/specialtyTemplates";
import UserAssignment from "./UserAssignment";
import { useUsers } from "../hooks/useUsers";
import { useDashboard } from "../context/DashboardContext";
import { getOrganizationHeader, getOrganizationFooter } from "../utils/organization";
import {
  getMeasurementSystem,
  formatTemperature,
} from "../utils/measurements";

interface ConsultationProps {
  patient: Patient;
  onConsultationScheduled?: (appointment: Appointment) => void;
  onConsultationNoteAdded?: (note: ClinicalNote) => void;
}

export default function Consultation({
  patient,
  onConsultationScheduled,
  onConsultationNoteAdded,
}: ConsultationProps) {
  const { addAppointment, addClinicalNote, updatePatient } = useDashboard();
  const { users } = useUsers();
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openNote, setOpenNote] = useState(false);
  const [filterType, setFilterType] = useState<"all" | ConsultationType>("all");
  const [filterSpecialty, setFilterSpecialty] = useState<"all" | SpecialtyType>("all");
  const [formData, setFormData] = useState({
    consultationType: "general" as ConsultationType,
    specialty: "" as SpecialtyType | "",
    date: "",
    time: "",
    provider: "",
    duration: "30",
    location: "in-person" as "in-person" | "telemedicine" | "hybrid",
    reason: "",
    referralRequired: false,
    notes: "",
    assignedTo: null as string | null,
  });

  const [noteData, setNoteData] = useState({
    consultationType: "general" as ConsultationType,
    specialty: "" as SpecialtyType | "",
    title: "",
    content: "",
    chiefComplaint: "",
    vitalSigns: "",
    hpi: "",
    reviewOfSystems: "",
    physicalExam: "",
    socialHistory: "",
    familyHistory: "",
    medicationReconciliation: "",
    diagnosisCodes: "",
    assessment: "",
    plan: "",
    patientInstructions: "",
    followUp: "",
  });
  const [showTemplateGenerator, setShowTemplateGenerator] = useState(false);
  // scheduledConsultationId is set but not read - keeping for future use
  const [, setScheduledConsultationId] = useState<string | null>(null);
  const [autoCreateNote, setAutoCreateNote] = useState(true);
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);
  
  // Load custom templates from localStorage
  const [customTemplates, setCustomTemplates] = useState<CustomConsultationTemplate[]>(() => {
    try {
      const saved = localStorage.getItem("customConsultationTemplates");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Refresh templates when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem("customConsultationTemplates");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setCustomTemplates(parsed);
          }
        }
      } catch (error) {
        // Ignore errors silently
        if (import.meta.env.DEV) {
          console.warn('Failed to load custom templates:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also check periodically for changes (in case same window) - reduced frequency
    const interval = setInterval(handleStorageChange, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Auto-populate form with smart defaults
  useEffect(() => {
    if (openSchedule && !formData.date) {
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        date: tomorrow.toISOString().split('T')[0],
        time: "09:00",
      }));
    }
  }, [openSchedule, formData.date]);

  const [measurementSystem, setMeasurementSystem] = useState(() => getMeasurementSystem());

  // Listen for measurement system changes
  useEffect(() => {
    const handleStorageChange = () => {
      setMeasurementSystem(getMeasurementSystem());
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const current = getMeasurementSystem();
      if (current !== measurementSystem) {
        setMeasurementSystem(current);
      }
    }, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [measurementSystem]);

  // Get patient data for auto-population
  const patientData = useMemo(() => {
    const [systolic, diastolic] = (patient.bp || "120/80").split("/").map(Number);
    const activeMeds = patient.medications?.filter(m => m.status === "Active") || [];
    const allergies = patient.allergies || [];
    
    // Store temperature in Celsius (UK standard)
    const tempCelsius = 37.0;
    const tempDisplay = formatTemperature(tempCelsius, measurementSystem, true);
    
    return {
      vitals: {
        bp: patient.bp || "120/80",
        systolic,
        diastolic,
        hr: "72",
        rr: "16",
        temp: tempDisplay,
        o2sat: "98",
        weight: "",
      },
      medications: activeMeds.length > 0 ? activeMeds.map(m => m.name).join(", ") : "",
      allergies: allergies.length > 0 ? allergies.join(", ") : "",
      condition: patient.condition || "",
      recentNotes: patient.clinicalNotes?.slice(0, 3) || [],
    };
  }, [patient, measurementSystem]);

  const consultations = patient.appointments?.filter(
    (apt) => apt.type.toLowerCase().includes("consultation") || apt.consultationType
  ) || [];

  const consultationNotes = patient.clinicalNotes?.filter(
    (note) => note.type === "consultation" || note.type === "general_consultation" || note.type === "specialty_consultation"
  ) || [];

  const filteredConsultations = consultations.filter((c) => {
    if (filterType !== "all" && c.consultationType !== filterType) return false;
    if (filterSpecialty !== "all" && c.specialty !== filterSpecialty) return false;
    return true;
  });

  const filteredNotes = consultationNotes.filter((n) => {
    if (filterType !== "all" && n.consultationType !== filterType) return false;
    if (filterSpecialty !== "all" && n.specialty !== filterSpecialty) return false;
    return true;
  });

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const consultationId = `cons-${Date.now()}`;
    const appointmentType = formData.consultationType === "general" ? "General Consultation" : "Specialty Consultation";
    
    // Create local appointment for immediate UI update
    const newConsultation: Appointment = {
      id: consultationId,
      date: formData.date,
      time: formData.time,
      type: appointmentType,
      provider: formData.provider,
      status: "scheduled",
      consultationType: formData.consultationType,
      specialty: formData.specialty || undefined,
      duration: parseInt(formData.duration),
      location: formData.location,
      reason: formData.reason || undefined,
      referralRequired: formData.referralRequired,
      notes: formData.notes || undefined,
    };

    // Save to context immediately
    addAppointment(patient.id, newConsultation);
    
    // Also call callback if provided
    if (onConsultationScheduled) {
      onConsultationScheduled(newConsultation);
    }

    // Try to save to API if authenticated
    try {
      const { appointmentService } = await import("../services/appointments");
      // Note: We need providerId, but we only have provider name
      // For now, use a placeholder or get from user context
      await appointmentService.createAppointment(patient.id, {
        date: formData.date,
        time: formData.time,
        type: appointmentType,
        providerId: "current-user-id", // TODO: Get actual provider ID from user context
        status: "scheduled",
        consultationType: formData.consultationType,
        specialty: formData.specialty || undefined,
        duration: parseInt(formData.duration),
        location: formData.location,
        reason: formData.reason || undefined,
        referralRequired: formData.referralRequired,
        notes: formData.notes || undefined,
      });
    } catch (apiError) {
      // API save failed, but continue with local update
      if (import.meta.env.DEV) {
        console.warn('Failed to save appointment to API, using local update only:', apiError);
      }
    }

    // Auto-open note creation if enabled
    if (autoCreateNote) {
      setScheduledConsultationId(consultationId);
      setNoteData({
        consultationType: formData.consultationType,
        specialty: formData.specialty || "",
        title: `${formData.consultationType === "specialty" && formData.specialty ? getSpecialtyTemplate(formData.specialty)?.name || formData.specialty : "General"} Consultation - ${patient.name}`,
        content: "",
        chiefComplaint: formData.reason || "",
        vitalSigns: `BP: ${patientData.vitals.bp}, HR: ${patientData.vitals.hr}, RR: ${patientData.vitals.rr}, Temp: ${patientData.vitals.temp}, O2 Sat: ${patientData.vitals.o2sat}%`,
        hpi: formData.reason ? `Patient presents for ${formData.consultationType} consultation. ${formData.reason}` : "",
        reviewOfSystems: "",
        physicalExam: "",
        socialHistory: "",
        familyHistory: "",
        medicationReconciliation: "",
        diagnosisCodes: "",
        assessment: "",
        plan: "",
        patientInstructions: "",
        followUp: "",
      });
      setOpenSchedule(false);
      setTimeout(() => setOpenNote(true), 300);
    } else {
      setFormData({
        consultationType: "general",
        specialty: "",
        assignedTo: null,
        date: "",
        time: "",
        provider: "",
        duration: "30",
        location: "in-person",
        reason: "",
        referralRequired: false,
        notes: "",
      });
      setOpenSchedule(false);
    }
  };

  // Quick fill functions
  const quickFillVitals = () => {
    setNoteData(prev => ({
      ...prev,
      vitalSigns: `BP: ${patientData.vitals.bp}, HR: ${patientData.vitals.hr}, RR: ${patientData.vitals.rr}, Temp: ${patientData.vitals.temp}, O2 Sat: ${patientData.vitals.o2sat}%${patientData.vitals.weight ? `, Weight: ${patientData.vitals.weight} ${measurementSystem === "uk" ? "kg" : "lbs"}` : ""}`,
    }));
  };

  const quickFillMedications = () => {
    if (patientData.medications) {
      setNoteData(prev => ({
        ...prev,
        plan: prev.plan ? `${prev.plan}\n\nCurrent Medications:\n${patientData.medications}` : `Current Medications:\n${patientData.medications}`,
      }));
    }
  };

  const quickFillAllergies = () => {
    if (patientData.allergies) {
      setNoteData(prev => ({
        ...prev,
        hpi: prev.hpi ? `${prev.hpi}\n\nAllergies: ${patientData.allergies}` : `Allergies: ${patientData.allergies}`,
      }));
    }
  };

  const quickFillFamilyHistory = () => {
    if (patient.familyHistory && patient.familyHistory.length > 0) {
      setNoteData(prev => ({
        ...prev,
        familyHistory: patient.familyHistory?.join('\n• ') || "",
      }));
    }
  };

  const quickFillSocialHistory = () => {
    const social: string[] = [];
    if (patient.lifestyle) {
      if (patient.lifestyle.smokingStatus) social.push(`Smoking: ${patient.lifestyle.smokingStatus}`);
      if (patient.lifestyle.alcoholUse) social.push(`Alcohol: ${patient.lifestyle.alcoholUse}`);
      if (patient.lifestyle.activityLevel) social.push(`Activity: ${patient.lifestyle.activityLevel}`);
      if (patient.lifestyle.sleepHours) social.push(`Sleep: ${patient.lifestyle.sleepHours} hours/night`);
    }
    if (patient.socialDeterminants) {
      if (patient.socialDeterminants.housingStability) social.push(`Housing: ${patient.socialDeterminants.housingStability}`);
      if (patient.socialDeterminants.foodSecurity) social.push(`Food Security: ${patient.socialDeterminants.foodSecurity}`);
      if (patient.socialDeterminants.transportation) social.push(`Transportation: ${patient.socialDeterminants.transportation}`);
    }
    if (social.length > 0) {
      setNoteData(prev => ({
        ...prev,
        socialHistory: social.join('\n'),
      }));
    }
  };

  const quickFillMedicationReconciliation = () => {
    if (patientData.medications) {
      const medList = patient.medications?.map(m => 
        `• ${m.name} (${m.status})${m.instructions ? ` - ${m.instructions}` : ""}`
      ).join('\n') || "";
      setNoteData(prev => ({
        ...prev,
        medicationReconciliation: `Current Medications:\n${medList}\n\nReview and reconcile as needed.`,
      }));
    }
  };

  // Parse comprehensive note sections from content
  const parseNoteContent = (content: string) => {
    const sections = {
      chiefComplaint: "",
      vitalSigns: "",
      hpi: "",
      reviewOfSystems: "",
      physicalExam: "",
      socialHistory: "",
      familyHistory: "",
      medicationReconciliation: "",
      diagnosisCodes: "",
      assessment: "",
      plan: "",
      patientInstructions: "",
      followUp: "",
    };

    // Try to parse structured format
    const patterns = {
      chiefComplaint: /CHIEF COMPLAINT:\s*(.*?)(?=\n\n|HISTORY|REVIEW|$)/is,
      hpi: /HISTORY OF PRESENT ILLNESS:\s*(.*?)(?=\n\n|REVIEW|VITAL|PHYSICAL|ASSESSMENT|$)/is,
      reviewOfSystems: /REVIEW OF SYSTEMS:\s*(.*?)(?=\n\n|PHYSICAL|VITAL|ASSESSMENT|$)/is,
      vitalSigns: /VITAL SIGNS:\s*(.*?)(?=\n\n|PHYSICAL|ASSESSMENT|$)/is,
      physicalExam: /PHYSICAL EXAMINATION:\s*(.*?)(?=\n\n|SOCIAL|FAMILY|ASSESSMENT|$)/is,
      socialHistory: /SOCIAL HISTORY:\s*(.*?)(?=\n\n|FAMILY|MEDICATION|ASSESSMENT|$)/is,
      familyHistory: /FAMILY HISTORY:\s*(.*?)(?=\n\n|MEDICATION|ASSESSMENT|$)/is,
      medicationReconciliation: /MEDICATION RECONCILIATION:\s*(.*?)(?=\n\n|DIAGNOSIS|ASSESSMENT|$)/is,
      diagnosisCodes: /DIAGNOSIS.*?CODES?:\s*(.*?)(?=\n\n|ASSESSMENT|$)/is,
      assessment: /ASSESSMENT:\s*(.*?)(?=\n\n|PLAN|$)/is,
      plan: /PLAN:\s*(.*?)(?=\n\n|INSTRUCTIONS|FOLLOW|$)/is,
      patientInstructions: /PATIENT INSTRUCTIONS?:\s*(.*?)(?=\n\n|FOLLOW|$)/is,
      followUp: /FOLLOW.?UP:\s*(.*?)$/is,
    };

    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = content.match(pattern);
      if (match) {
        sections[key as keyof typeof sections] = match[1].trim();
      }
    });

    return sections;
  };

  const combineNoteSections = (): string => {
    const sections = [];
    
    if (noteData.chiefComplaint) {
      sections.push(`CHIEF COMPLAINT:\n${noteData.chiefComplaint}`);
    }
    
    if (noteData.hpi) {
      sections.push(`HISTORY OF PRESENT ILLNESS:\n${noteData.hpi}`);
    }
    
    if (noteData.reviewOfSystems) {
      sections.push(`REVIEW OF SYSTEMS:\n${noteData.reviewOfSystems}`);
    }
    
    if (noteData.vitalSigns) {
      sections.push(`VITAL SIGNS:\n${noteData.vitalSigns}`);
    }
    
    if (noteData.physicalExam) {
      sections.push(`PHYSICAL EXAMINATION:\n${noteData.physicalExam}`);
    }
    
    if (noteData.socialHistory) {
      sections.push(`SOCIAL HISTORY:\n${noteData.socialHistory}`);
    }
    
    if (noteData.familyHistory) {
      sections.push(`FAMILY HISTORY:\n${noteData.familyHistory}`);
    }
    
    if (noteData.medicationReconciliation) {
      sections.push(`MEDICATION RECONCILIATION:\n${noteData.medicationReconciliation}`);
    }
    
    if (noteData.diagnosisCodes) {
      sections.push(`DIAGNOSIS CODES:\n${noteData.diagnosisCodes}`);
    }
    
    if (noteData.assessment) {
      sections.push(`ASSESSMENT:\n${noteData.assessment}`);
    }
    
    if (noteData.plan) {
      sections.push(`PLAN:\n${noteData.plan}`);
    }
    
    if (noteData.patientInstructions) {
      sections.push(`PATIENT INSTRUCTIONS:\n${noteData.patientInstructions}`);
    }
    
    if (noteData.followUp) {
      sections.push(`FOLLOW-UP:\n${noteData.followUp}`);
    }
    
    return sections.length > 0 ? sections.join('\n\n') : "Note content not yet documented";
  };

  const generateTemplateNote = (specialty: SpecialtyType) => {
    const template = getSpecialtyTemplate(specialty);
    // Template structure changed - use fallback content
    if (!template) {
      return `Specialty consultation template for ${specialty} not available.`;
    }
    
    // Since consultationTemplate structure doesn't exist in current SpecialtyTemplate interface,
    // provide a basic template structure
    const templateContent = `
CHIEF COMPLAINT:
[To be documented]

HISTORY OF PRESENT ILLNESS:
[To be documented]

REVIEW OF SYSTEMS:
[To be documented]

VITAL SIGNS:
BP: ${patientData.vitals.bp}, HR: ${patientData.vitals.hr}, RR: ${patientData.vitals.rr}, Temp: ${patientData.vitals.temp}, O2 Sat: ${patientData.vitals.o2sat}%

PHYSICAL EXAMINATION:
[To be documented]

ASSESSMENT:
[To be documented]

PLAN:
[To be documented]
    `.trim();

    const parsed = parseNoteContent(templateContent);
    setNoteData({
      consultationType: "specialty",
      specialty: specialty,
      title: `${template.name} Consultation - ${patient.name}`,
      content: templateContent,
      ...parsed,
    });
    setShowTemplateGenerator(false);
    setOpenNote(true);
  };

  const generateCustomTemplateNote = (customTemplate: CustomConsultationTemplate) => {
    const template = customTemplate.consultationTemplate;
    const reviewOfSystems = Array.isArray(template.reviewOfSystems) ? template.reviewOfSystems : [];
    const physicalExamination = Array.isArray(template.physicalExamination) ? template.physicalExamination : [];
    const plan = Array.isArray(template.plan) ? template.plan : [];
    const commonDiagnoses = Array.isArray(template.commonDiagnoses) ? template.commonDiagnoses : [];
    const commonTests = Array.isArray(template.commonTests) ? template.commonTests : [];
    const commonMedications = Array.isArray(template.commonMedications) ? template.commonMedications : [];
    
    const templateContent = `
CHIEF COMPLAINT:
${template.chiefComplaint || "Chief complaint to be documented"}

HISTORY OF PRESENT ILLNESS:
${template.historyOfPresentIllness || "History of present illness to be documented"}

REVIEW OF SYSTEMS:
${reviewOfSystems.length > 0 ? reviewOfSystems.map(item => `• ${item}`).join('\n') : "Review of systems to be documented"}

VITAL SIGNS:
BP: ${patientData.vitals.bp}, HR: ${patientData.vitals.hr}, RR: ${patientData.vitals.rr}, Temp: ${patientData.vitals.temp}, O2 Sat: ${patientData.vitals.o2sat}%

PHYSICAL EXAMINATION:
${physicalExamination.length > 0 ? physicalExamination.map(item => `• ${item}`).join('\n') : "Physical examination to be documented"}

ASSESSMENT:
${template.assessment || "Assessment to be documented"}

PLAN:
${plan.length > 0 ? plan.map(item => `• ${item}`).join('\n') : "Plan to be documented"}

COMMON DIAGNOSES TO CONSIDER:
${commonDiagnoses.length > 0 ? commonDiagnoses.map(item => `• ${item}`).join('\n') : "None specified"}

COMMON TESTS:
${commonTests.length > 0 ? commonTests.map(item => `• ${item}`).join('\n') : "None specified"}

COMMON MEDICATIONS:
${commonMedications.length > 0 ? commonMedications.map(item => `• ${item}`).join('\n') : "None specified"}
    `.trim();

    const parsed = parseNoteContent(templateContent);
    setNoteData({
      consultationType: "specialty",
      specialty: "other" as SpecialtyType,
      title: `${customTemplate.name || "Custom Template"} - ${patient.name}`,
      content: templateContent,
      ...parsed,
    });
    setShowTemplateGenerator(false);
    setOpenNote(true);
  };

  const handleEditNote = (note: ClinicalNote) => {
    const parsed = parseNoteContent(note.content);
    setEditingNote(note);
    setNoteData({
      consultationType: note.consultationType || "general",
      specialty: note.specialty || "",
      title: note.title,
      content: note.content,
      ...parsed,
    });
    setOpenNote(true);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine all sections if content is empty
    let finalContent = noteData.content;
    if (!finalContent || finalContent.trim() === "") {
      finalContent = combineNoteSections();
    }
    
    if (editingNote) {
      // Update existing note
      const updatedNote: ClinicalNote = {
        ...editingNote,
        title: noteData.title || editingNote.title,
        content: finalContent,
        consultationType: noteData.consultationType,
        specialty: noteData.specialty || undefined,
      };

      // Update in context
      updatePatient(patient.id, (p) => {
        const notes = [...(p.clinicalNotes || [])];
        const index = notes.findIndex(n => n.id === editingNote.id);
        if (index !== -1) {
          notes[index] = updatedNote;
        }
        return { ...p, clinicalNotes: notes };
      });

      // Also call callback if provided
      if (onConsultationNoteAdded) {
        onConsultationNoteAdded(updatedNote);
      }
    } else {
      // Create new note
      const newNote: ClinicalNote = {
        id: `note-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        author: "Dr. Current User",
        title: noteData.title || `${noteData.consultationType === "specialty" && noteData.specialty ? getSpecialtyTemplate(noteData.specialty)?.name || noteData.specialty : "General"} Consultation`,
        content: finalContent,
        type: noteData.consultationType === "general" ? "general_consultation" : "specialty_consultation",
        consultationType: noteData.consultationType,
        specialty: noteData.specialty || undefined,
      };

      // Save to context
      addClinicalNote(patient.id, newNote);

      // Also call callback if provided
      if (onConsultationNoteAdded) {
        onConsultationNoteAdded(newNote);
      }
    }

    setNoteData({
      consultationType: "general",
      specialty: "",
      title: "",
      content: "",
      chiefComplaint: "",
      vitalSigns: "",
      hpi: "",
      reviewOfSystems: "",
      physicalExam: "",
      socialHistory: "",
      familyHistory: "",
      medicationReconciliation: "",
      diagnosisCodes: "",
      assessment: "",
      plan: "",
      patientInstructions: "",
      followUp: "",
    });
    setEditingNote(null);
    setScheduledConsultationId(null);
    setOpenNote(false);
  };

  const getSpecialtyColor = (specialty?: SpecialtyType) => {
    if (!specialty) return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    const colors: Record<string, string> = {
      cardiology: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      endocrinology: "bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200",
      neurology: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      oncology: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
      orthopedics: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    };
    return colors[specialty] || "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
  };

  const getLocationIcon = (location?: string) => {
    switch (location) {
      case "telemedicine":
        return <Video size={14} />;
      case "hybrid":
        return <Building2 size={14} />;
      default:
        return <MapPin size={14} />;
    }
  };

  const handlePrintConsultationNote = (note: ClinicalNote) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const orgHeader = getOrganizationHeader();
    const orgFooter = getOrganizationFooter();

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Consultation Note - ${note.title}</title>
          <style>
            @page {
              margin: 0.75in;
              size: letter;
            }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 0;
            }
            .org-header {
              border-bottom: 3px solid #2563eb;
              padding-bottom: 15px;
              margin-bottom: 25px;
              text-align: center;
            }
            .org-name {
              font-size: 22px;
              font-weight: 700;
              color: #1e40af;
              margin: 0 0 5px 0;
            }
            .org-type {
              font-size: 14px;
              color: #4b5563;
              margin: 0 0 8px 0;
              font-weight: 500;
            }
            .org-details {
              font-size: 11px;
              color: #6b7280;
              line-height: 1.5;
              margin: 0;
            }
            .document-header {
              text-align: center;
              margin: 25px 0;
              padding-bottom: 15px;
              border-bottom: 2px solid #e5e7eb;
            }
            .document-header h1 {
              margin: 0;
              font-size: 20px;
              color: #1e40af;
              font-weight: 600;
            }
            .document-header h2 {
              margin: 8px 0 0 0;
              font-size: 16px;
              color: #4b5563;
              font-weight: normal;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin: 25px 0;
            }
            .info-item {
              padding: 10px;
              background: #f9fafb;
              border-radius: 4px;
              border: 1px solid #e5e7eb;
            }
            .info-label {
              font-size: 10px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
              font-weight: 600;
            }
            .info-value {
              font-size: 13px;
              font-weight: 600;
              color: #111827;
            }
            .content {
              background: #f9fafb;
              padding: 20px;
              border-radius: 4px;
              border-left: 4px solid #2563eb;
              margin: 25px 0;
              white-space: pre-wrap;
              font-size: 13px;
              line-height: 1.7;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 10px;
              color: #6b7280;
              text-align: center;
            }
            .signature-section {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .signature-line {
              margin-top: 50px;
              border-top: 1px solid #333;
              width: 300px;
            }
            .signature-label {
              font-size: 11px;
              color: #6b7280;
              margin-top: 5px;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="org-header">
            <div class="org-name">${orgHeader.split('\n')[0]}</div>
            <div class="org-type">${orgHeader.split('\n')[1] || ''}</div>
            <div class="org-details">${orgHeader.split('\n').slice(2).join('<br>')}</div>
          </div>

          <div class="document-header">
            <h1>CONSULTATION NOTE</h1>
            <h2>${note.title}</h2>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Patient Name</div>
              <div class="info-value">${patient.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date of Birth</div>
              <div class="info-value">${patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Consultation Type</div>
              <div class="info-value">${note.consultationType === "general" ? "General Consultation" : note.specialty ? note.specialty.charAt(0).toUpperCase() + note.specialty.slice(1) + " Consultation" : "Specialty Consultation"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date</div>
              <div class="info-value">${new Date(note.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            ${note.specialty ? `
            <div class="info-item">
              <div class="info-label">Specialty</div>
              <div class="info-value">${note.specialty.charAt(0).toUpperCase() + note.specialty.slice(1)}</div>
            </div>
            ` : ''}
            <div class="info-item">
              <div class="info-label">Author</div>
              <div class="info-value">${note.author}</div>
            </div>
          </div>

          <div class="content">
            ${note.content}
          </div>

          <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-label">Provider Signature</div>
          </div>

          <div class="footer">
            <div>Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</div>
            <div style="margin-top: 5px;">${orgFooter}</div>
            <div style="margin-top: 5px; font-size: 9px;">Confidential Medical Document - For Authorized Personnel Only</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Stethoscope size={20} className="text-teal-600 dark:text-teal-400" />
            Consultations
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage consultation notes and templates
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplateGenerator(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            <Sparkles size={18} /> Generate Template
          </button>
          <button
            onClick={() => setOpenNote(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            <FileText size={18} /> Consultation Notes
          </button>
        </div>
      </div>

      {/* Consultation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Consultations</p>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                {consultations.length}
              </p>
            </div>
            <Stethoscope size={32} className="text-teal-600 dark:text-teal-400 opacity-50" />
          </div>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {consultations.filter((c) => c.status === "scheduled").length}
              </p>
            </div>
            <Calendar size={32} className="text-green-600 dark:text-green-400 opacity-50" />
          </div>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Consultation Notes</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {consultationNotes.length}
              </p>
            </div>
            <FileText size={32} className="text-purple-600 dark:text-purple-400 opacity-50" />
          </div>
        </div>
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Specialty Consultations</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {consultations.filter((c) => c.consultationType === "specialty").length}
              </p>
            </div>
            <Building2 size={32} className="text-orange-600 dark:text-orange-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
        <Filter size={16} className="text-gray-600 dark:text-gray-400" />
        <div className="flex gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "all" | ConsultationType)}
              className="text-sm border rounded px-3 py-1 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="specialty">Specialty</option>
            </select>
          </div>
          {filterType === "specialty" && (
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                Specialty
              </label>
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value as "all" | SpecialtyType)}
                className="text-sm border rounded px-3 py-1 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="all">All Specialties</option>
                {getAllSpecialties().map((specialty) => {
                  const template = getSpecialtyTemplate(specialty);
                  return (
                    <option key={specialty} value={specialty}>
                      {template?.name || specialty}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Scheduled Consultations */}
      <div className="p-4 border rounded-lg dark:border-gray-700">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-teal-600 dark:text-teal-400" />
          Scheduled Consultations ({filteredConsultations.length})
        </h4>
        {filteredConsultations.length > 0 ? (
          <div className="space-y-3">
            {filteredConsultations.map((consultation) => (
              <div
                key={consultation.id}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope size={18} className="text-teal-600 dark:text-teal-400" />
                      <h5 className="font-semibold">
                        {consultation.consultationType === "general"
                          ? "General Consultation"
                          : `${consultation.specialty?.charAt(0).toUpperCase()}${consultation.specialty?.slice(1)} Consultation`}
                      </h5>
                      {consultation.referralRequired && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                          Referral Required
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{consultation.provider}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(consultation.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{consultation.time}</span>
                        {consultation.duration && <span> ({consultation.duration} min)</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        {getLocationIcon(consultation.location)}
                        <span className="capitalize">{consultation.location || "in-person"}</span>
                      </div>
                    </div>
                    {consultation.reason && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Reason:</strong> {consultation.reason}
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap items-center mt-2">
                      {consultation.specialty && (
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded ${getSpecialtyColor(
                            consultation.specialty
                          )}`}
                        >
                          {consultation.specialty}
                        </span>
                      )}
                      {consultation.location && consultation.location !== "in-person" && (
                        <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          {getLocationIcon(consultation.location)}
                          <span className="capitalize">{consultation.location}</span>
                        </span>
                      )}
                    </div>
                    {consultation.notes && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                        {consultation.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        consultation.status === "scheduled"
                          ? "bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200"
                          : consultation.status === "completed"
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {consultation.status}
                    </span>
                    {consultation.status === "scheduled" && (
                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            consultationType: consultation.consultationType || "general",
                            specialty: consultation.specialty || "",
                            date: consultation.date,
                            time: consultation.time,
                            provider: consultation.provider,
                            duration: consultation.duration?.toString() || "30",
                            location: (consultation.location as "in-person" | "telemedicine" | "hybrid") || "in-person",
                            reason: consultation.reason || "",
                            referralRequired: consultation.referralRequired || false,
                            notes: consultation.notes || "",
                          });
                          setOpenSchedule(true);
                        }}
                        className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                        title="Edit consultation"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No consultations scheduled
          </p>
        )}
      </div>

      {/* Consultation Notes */}
      <div className="p-4 border rounded-lg dark:border-gray-700">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <FileText size={18} className="text-purple-600 dark:text-purple-400" />
          Consultation Notes ({filteredNotes.length})
        </h4>
        {filteredNotes.length > 0 ? (
          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-semibold">{note.title}</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      by {note.author} • {new Date(note.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handlePrintConsultationNote(note)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Print note"
                    >
                      <Printer size={14} />
                    </button>
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-1.5 text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded transition-colors"
                      title="Edit note"
                    >
                      <Edit size={14} />
                    </button>
                    <span
                      className={`px-2 py-1 text-xs rounded ${getSpecialtyColor(note.specialty)}`}
                    >
                      {note.consultationType === "general" ? "General" : note.specialty || "Specialty"}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No consultation notes
          </p>
        )}
      </div>

      {/* Schedule Consultation Modal */}
      {openSchedule && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenSchedule(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-[600px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Schedule Consultation</h4>
              <button
                onClick={() => setOpenSchedule(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-base font-medium mb-2.5">Consultation Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, consultationType: "general", specialty: "" })}
                    className={`flex-1 p-3 border-2 rounded-lg transition ${
                      formData.consultationType === "general"
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                    }`}
                  >
                    <Stethoscope size={18} className="mx-auto mb-1" />
                    <span className="text-sm font-medium">General</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, consultationType: "specialty" })}
                    className={`flex-1 p-3 border-2 rounded-lg transition ${
                      formData.consultationType === "specialty"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400"
                        : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                    }`}
                  >
                    <Building2 size={18} className="mx-auto mb-1" />
                    <span className="text-sm font-medium">Specialty</span>
                  </button>
                </div>
              </div>

              {formData.consultationType === "specialty" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Specialty</label>
                  <select
                    required={formData.consultationType === "specialty"}
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({ ...formData, specialty: e.target.value as SpecialtyType })
                    }
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select specialty</option>
                    {getAllSpecialties().map((specialty) => {
                      const template = getSpecialtyTemplate(specialty);
                      return (
                        <option key={specialty} value={specialty}>
                          {template?.name || specialty}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-base font-medium mb-2.5">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <UserAssignment
                    assignedTo={formData.assignedTo}
                    allowedRoles={formData.consultationType === "specialty" 
                      ? ["physician", "nurse_practitioner", "physician_assistant"]
                      : ["physician", "nurse_practitioner", "physician_assistant", "nurse"]}
                    label="Assign to Provider"
                    placeholder="Select provider..."
                    onAssign={(userId) => {
                      const assignedUser = userId ? users.find((u) => u.id === userId) : null;
                      setFormData({ 
                        ...formData, 
                        assignedTo: userId,
                        provider: assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : ""
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Duration (minutes)</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Location</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, location: "in-person" })}
                    className={`p-2.5 border-2 rounded-lg transition text-sm ${
                      formData.location === "in-person"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400"
                        : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                    }`}
                  >
                    <MapPin size={16} className="mx-auto mb-1" />
                    <span>In-Person</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, location: "telemedicine" })}
                    className={`p-2.5 border-2 rounded-lg transition text-sm ${
                      formData.location === "telemedicine"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400"
                        : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                    }`}
                  >
                    <Video size={16} className="mx-auto mb-1" />
                    <span>Telemedicine</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, location: "hybrid" })}
                    className={`p-2.5 border-2 rounded-lg transition text-sm ${
                      formData.location === "hybrid"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400"
                        : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                    }`}
                  >
                    <Building2 size={16} className="mx-auto mb-1" />
                    <span>Hybrid</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Reason for Consultation</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Primary reason for consultation..."
                  rows={3}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="referral"
                    checked={formData.referralRequired}
                    onChange={(e) =>
                      setFormData({ ...formData, referralRequired: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-0"
                  />
                  <label htmlFor="referral" className="text-base">
                    Referral Required
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoCreateNote"
                    checked={autoCreateNote}
                    onChange={(e) => setAutoCreateNote(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-0"
                  />
                  <label htmlFor="autoCreateNote" className="text-base text-gray-600 dark:text-gray-400">
                    Auto-create note
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Additional Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes or instructions..."
                  rows={3}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setOpenSchedule(false)}
                    className="px-5 py-2.5 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                    className="px-5 py-2.5 text-sm font-medium rounded-xl bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-500 dark:hover:bg-teal-600 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Schedule Consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {openNote && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenNote(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-lg font-semibold">
                  {editingNote ? "Edit Consultation Note" : "Add Consultation Note"}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Comprehensive consultation note with SOAP format and additional sections
                </p>
              </div>
              <button
                onClick={() => {
                  setOpenNote(false);
                  setEditingNote(null);
                  setNoteData({
                    consultationType: "general",
                    specialty: "",
                    title: "",
                    content: "",
                    chiefComplaint: "",
                    vitalSigns: "",
                    hpi: "",
                    reviewOfSystems: "",
                    physicalExam: "",
                    socialHistory: "",
                    familyHistory: "",
                    medicationReconciliation: "",
                    diagnosisCodes: "",
                    assessment: "",
                    plan: "",
                    patientInstructions: "",
                    followUp: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Consultation Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNoteData({ ...noteData, consultationType: "general", specialty: "" })}
                      className={`flex-1 p-2.5 border-2 rounded-lg transition text-sm ${
                        noteData.consultationType === "general"
                          ? "border-teal-600 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 shadow-sm"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750"
                      }`}
                    >
                      <Stethoscope size={16} className="mx-auto mb-1" />
                      <span className="text-xs font-medium">General</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteData({ ...noteData, consultationType: "specialty" })}
                      className={`flex-1 p-2.5 border-2 rounded-lg transition text-sm ${
                        noteData.consultationType === "specialty"
                          ? "border-teal-600 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 shadow-sm"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750"
                      }`}
                    >
                      <Building2 size={16} className="mx-auto mb-1" />
                      <span className="text-xs font-medium">Specialty</span>
                    </button>
                  </div>
                </div>

                {noteData.consultationType === "specialty" && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Specialty</label>
                    <select
                      required={noteData.consultationType === "specialty"}
                      value={noteData.specialty}
                      onChange={(e) =>
                        setNoteData({ ...noteData, specialty: e.target.value as SpecialtyType })
                      }
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select specialty</option>
                      {getAllSpecialties().map((specialty) => {
                        const template = getSpecialtyTemplate(specialty);
                        return (
                          <option key={specialty} value={specialty}>
                            {template?.name || specialty}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Note Title</label>
                <input
                  type="text"
                  required
                  value={noteData.title}
                  onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
                  placeholder="e.g., Cardiology Consultation - Follow-up"
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* SOAP Note Structure */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide">S</span>
                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">O</span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">A</span>
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">P</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Subjective</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Objective</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Assessment</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Plan</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const combined = combineNoteSections();
                      setNoteData(prev => ({ ...prev, content: combined }));
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                  >
                    <Copy size={12} />
                    Combine All Sections
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Chief Complaint
                      </label>
                    </div>
                    <input
                      type="text"
                      value={noteData.chiefComplaint}
                      onChange={(e) => setNoteData({ ...noteData, chiefComplaint: e.target.value })}
                      placeholder="Primary reason for visit"
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Vital Signs
                      </label>
                      <button
                        type="button"
                        onClick={quickFillVitals}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                        title="Quick fill from patient data"
                      >
                        <Zap size={10} />
                        Fill
                      </button>
                    </div>
                    <input
                      type="text"
                      value={noteData.vitalSigns}
                      onChange={(e) => setNoteData({ ...noteData, vitalSigns: e.target.value })}
                      placeholder="BP, HR, RR, Temp, O2 Sat"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:border-orange-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-teal-600 dark:text-teal-400">
                      History of Present Illness (HPI)
                    </label>
                    {patientData.allergies && (
                      <button
                        type="button"
                        onClick={quickFillAllergies}
                        className="flex items-center gap-1 px-2 py-0.5 text-xs bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded hover:bg-teal-200 dark:hover:bg-teal-800"
                        title="Add allergies"
                      >
                        <Zap size={10} />
                        Add Allergies
                      </button>
                    )}
                  </div>
                  <textarea
                    value={noteData.hpi}
                    onChange={(e) => setNoteData({ ...noteData, hpi: e.target.value })}
                    placeholder="Detailed history of current complaint..."
                    rows={3}
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                    <label className="block text-xs font-semibold mb-2 text-gray-700 dark:text-gray-200">
                    Review of Systems (ROS)
                  </label>
                  <textarea
                    value={noteData.reviewOfSystems}
                    onChange={(e) => setNoteData({ ...noteData, reviewOfSystems: e.target.value })}
                    placeholder="Systematic review: Constitutional, HEENT, Cardiovascular, Respiratory, GI, GU, Musculoskeletal, Neurological, Psychiatric, etc."
                    rows={3}
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                    <label className="block text-xs font-semibold mb-2 text-gray-700 dark:text-gray-200">
                    Physical Examination
                  </label>
                  <textarea
                    value={noteData.physicalExam}
                    onChange={(e) => setNoteData({ ...noteData, physicalExam: e.target.value })}
                    placeholder="Physical exam findings..."
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:border-orange-400 transition-colors"
                  />
                </div>

                {/* Additional Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Social History
                      </label>
                      {(patient.lifestyle || patient.socialDeterminants) && (
                        <button
                          type="button"
                          onClick={quickFillSocialHistory}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                          title="Fill from patient data"
                        >
                          <Zap size={10} />
                          Fill
                        </button>
                      )}
                    </div>
                    <textarea
                      value={noteData.socialHistory}
                      onChange={(e) => setNoteData({ ...noteData, socialHistory: e.target.value })}
                      placeholder="Smoking, alcohol, activity level, housing, transportation..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Family History
                      </label>
                      {patient.familyHistory && patient.familyHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={quickFillFamilyHistory}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                          title="Fill from patient data"
                        >
                          <Zap size={10} />
                          Fill
                        </button>
                      )}
                    </div>
                    <textarea
                      value={noteData.familyHistory}
                      onChange={(e) => setNoteData({ ...noteData, familyHistory: e.target.value })}
                      placeholder="Family medical history..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Medication Reconciliation
                    </label>
                    {patientData.medications && (
                      <button
                        type="button"
                        onClick={quickFillMedicationReconciliation}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                        title="Fill current medications"
                      >
                        <Zap size={10} />
                        Fill Meds
                      </button>
                    )}
                  </div>
                  <textarea
                    value={noteData.medicationReconciliation}
                    onChange={(e) => setNoteData({ ...noteData, medicationReconciliation: e.target.value })}
                    placeholder="Current medications, changes, additions, discontinuations..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2 text-gray-700 dark:text-gray-200">
                    Diagnosis Codes (ICD-10)
                  </label>
                  <textarea
                    value={noteData.diagnosisCodes}
                    onChange={(e) => setNoteData({ ...noteData, diagnosisCodes: e.target.value })}
                    placeholder="e.g., E11.9 - Type 2 diabetes mellitus without complications, I10 - Essential hypertension"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2 text-gray-700 dark:text-gray-200">
                    Assessment & Diagnosis
                  </label>
                  <textarea
                    value={noteData.assessment}
                    onChange={(e) => setNoteData({ ...noteData, assessment: e.target.value })}
                    placeholder="Clinical assessment, differential diagnoses..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Plan
                    </label>
                    {patientData.medications && (
                      <button
                        type="button"
                        onClick={quickFillMedications}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                        title="Add current medications"
                      >
                        <Zap size={10} />
                        Add Meds
                      </button>
                    )}
                  </div>
                  <textarea
                    value={noteData.plan}
                    onChange={(e) => setNoteData({ ...noteData, plan: e.target.value })}
                    placeholder="Treatment plan, medications, follow-up, tests ordered..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-gray-700 dark:text-gray-200">
                      Patient Instructions & Education
                    </label>
                    <textarea
                      value={noteData.patientInstructions}
                      onChange={(e) => setNoteData({ ...noteData, patientInstructions: e.target.value })}
                      placeholder="Patient education, instructions, precautions, warning signs..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-2 text-gray-700 dark:text-gray-200">
                      Follow-Up Plan
                    </label>
                    <textarea
                      value={noteData.followUp}
                      onChange={(e) => setNoteData({ ...noteData, followUp: e.target.value })}
                      placeholder="Follow-up appointment, labs, imaging, referrals..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
              </div>

              {/* Full Content (for backward compatibility and full note) */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Full Note Content <span className="text-xs text-gray-500">(Auto-populated from SOAP sections above)</span>
                </label>
                <textarea
                  required
                  value={noteData.content}
                  onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
                  placeholder="Enter full consultation notes or use SOAP format above..."
                  rows={8}
                  className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setOpenNote(false);
                    setEditingNote(null);
                    setNoteData({
                      consultationType: "general",
                      specialty: "",
                      title: "",
                      content: "",
                      chiefComplaint: "",
                      vitalSigns: "",
                      hpi: "",
                      reviewOfSystems: "",
                      physicalExam: "",
                      socialHistory: "",
                      familyHistory: "",
                      medicationReconciliation: "",
                      diagnosisCodes: "",
                      assessment: "",
                      plan: "",
                      patientInstructions: "",
                      followUp: "",
                    });
                  }}
                    className="px-5 py-2.5 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                    className="px-5 py-2.5 text-sm font-medium rounded-xl bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-500 dark:hover:bg-teal-600 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {editingNote ? "Update Note" : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Generator Modal */}
      {showTemplateGenerator && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTemplateGenerator(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" />
                  Generate Consultation Template
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Select a specialty to generate a consultation note template
                </p>
              </div>
              <button
                onClick={() => setShowTemplateGenerator(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Custom Templates Section */}
            {customTemplates.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
                  Custom Templates
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                  {customTemplates
                    .filter((template) => template && template.id && template.name && template.consultationTemplate)
                    .map((customTemplate) => (
                      <button
                        key={customTemplate.id}
                        onClick={() => generateCustomTemplateNote(customTemplate)}
                        className="p-4 border-2 border-purple-200 dark:border-purple-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={18} className="text-purple-600 dark:text-purple-400" />
                          <span className="font-medium text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400">
                            {customTemplate.name || "Unnamed Template"}
                          </span>
                        </div>
                        {customTemplate.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {customTemplate.description}
                          </p>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Specialty Templates Section */}
            <div className={customTemplates.length > 0 ? "border-t pt-6" : ""}>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <ClipboardList size={16} className="text-indigo-600 dark:text-indigo-400" />
                Specialty Templates
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {getAllSpecialties()
                  .filter(s => s !== "other")
                  .map((specialty) => {
                    const template = getSpecialtyTemplate(specialty);
                    return (
                      <button
                        key={specialty}
                        onClick={() => generateTemplateNote(specialty as SpecialtyType)}
                        className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <ClipboardList size={18} className="text-indigo-600 dark:text-indigo-400" />
                          <span className="font-medium text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {template?.name || specialty}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {template?.name || `Template for ${specialty} consultation`}
                        </p>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
              <p className="text-sm text-teal-800 dark:text-teal-200">
                <strong>Note:</strong> Templates include structured sections for Chief Complaint, History of Present Illness, Review of Systems, Physical Examination, Assessment, Plan, and common diagnoses, tests, and medications. You can edit the generated template before saving.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
