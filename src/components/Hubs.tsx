import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  ChevronRight,
  Sparkles,
  Search,
  FileText,
  Users,
  BarChart3,
  Link2,
  BookOpen,
  Zap,
  Calendar,
  Stethoscope,
  ArrowRight,
  User,
  ClipboardList,
  Play,
  CheckCircle2,
  FileEdit,
  X,
  Eye,
  Settings,
  Clock,
  Activity,
  Filter,
  Printer,
} from "lucide-react";
import { getAllHubsSync, getHubById, HubId, getHubColorClass, initializeHubs, Hub } from "../data/hubs";
import { useDashboard } from "../context/DashboardContext";
import { filterPatientsByHub, getHubStats, getHubQuickActions } from "../utils/hubIntegration";
import { getHubConditions, getHubTreatments, getPatientConditions } from "../utils/hubConditions";
import { getQuestionnairesByHub, Questionnaire, Question } from "../data/questionnaires";
import { getScoringFunction, QuestionnaireScore } from "../utils/questionnaireScoring";
import { CustomConsultationTemplate, SpecialtyType, SurgicalNote, SurgicalProcedureType, SurgicalStatus } from "../types";
import { hubService, HubFunction as ApiHubFunction, HubResource as ApiHubResource, HubNote as ApiHubNote, HubTemplate as ApiHubTemplate } from "../services/hubs";
import { getSpecialtyTemplate, getAllSpecialties } from "../data/specialtyTemplates";
import { storeTemplateForConsultation } from "../utils/templateTransfer";
import { useUsers } from "../hooks/useUsers";
import UserAssignment from "./UserAssignment";
import FormAutocomplete from "./FormAutocomplete";
import { commonProcedures } from "../utils/formHelpers";
import { openPrintWindow } from "../utils/popupHandler";
import { getOrganizationDetails } from "../utils/organization";
import { useToast } from "../context/ToastContext";

// Use API types
type HubFunction = ApiHubFunction;
type HubNote = ApiHubNote;
type HubResource = ApiHubResource;

interface HubTeamMember {
  userId: string;
  role?: string;
}

interface HubStats {
  totalPatients: number;
  activeAppointments: number;
  recentActivities: number;
}

interface HubFunctions {
  [hubId: string]: HubFunction[];
}

interface HubNotes {
  [hubId: string]: HubNote[];
}

interface HubResources {
  [hubId: string]: HubResource[];
}

interface HubTeamMembers {
  [hubId: string]: HubTeamMember[];
}

export default function Hubs() {
  const { patients, selectedPatient, setSelectedPatient, setActiveTab, updatePatient } = useDashboard();
  const toast = useToast();
  const [selectedHub, setSelectedHub] = useState<HubId | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hubActiveTab, setHubActiveTab] = useState<"overview" | "functions" | "notes" | "resources" | "team" | "stats" | "questionnaires" | "templates" | "surgical-notes">("overview");
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({});
  const [questionnaireScore, setQuestionnaireScore] = useState<QuestionnaireScore | null>(null);
  const [viewingCompletedQuestionnaire, setViewingCompletedQuestionnaire] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Completed questionnaires still use localStorage (not in backend)
  const [completedQuestionnaires, setCompletedQuestionnaires] = useState<Record<string, any[]>>(() => {
    try {
      const saved = localStorage.getItem("completedQuestionnaires");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Hub data from API
  const [hubFunctions, setHubFunctions] = useState<HubFunctions>({});
  const [hubNotes, setHubNotes] = useState<HubNotes>({});
  const [hubResources, setHubResources] = useState<HubResources>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hubTemplates, setHubTemplates] = useState<Record<string, ApiHubTemplate[]>>({});

  // Team members not yet implemented in backend, keep empty for now
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hubTeamMembers] = useState<HubTeamMembers>({});

  // Custom templates still use localStorage (not fully in backend)
  const [customTemplates, setCustomTemplates] = useState<CustomConsultationTemplate[]>(() => {
    try {
      const saved = localStorage.getItem("customConsultationTemplates");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showTemplateGenerator, setShowTemplateGenerator] = useState(false);
  const [templatePreview, setTemplatePreview] = useState<{ content: string; title: string; specialty?: SpecialtyType } | null>(null);
  const [editedTemplateContent, setEditedTemplateContent] = useState<string>("");
  const [templateCustomization, setTemplateCustomization] = useState<{
    includeSections: {
      chiefComplaint: boolean;
      hpi: boolean;
      reviewOfSystems: boolean;
      vitalSigns: boolean;
      physicalExam: boolean;
      socialHistory: boolean;
      familyHistory: boolean;
      medicationReconciliation: boolean;
      diagnosisCodes: boolean;
      assessment: boolean;
      plan: boolean;
      patientInstructions: boolean;
      followUp: boolean;
    };
    includeCommonDiagnoses: boolean;
    includeCommonTests: boolean;
    includeCommonMedications: boolean;
  }>({
    includeSections: {
      chiefComplaint: true,
      hpi: true,
      reviewOfSystems: true,
      vitalSigns: true,
      physicalExam: true,
      socialHistory: true,
      familyHistory: true,
      medicationReconciliation: true,
      diagnosisCodes: true,
      assessment: true,
      plan: true,
      patientInstructions: true,
      followUp: true,
    },
    includeCommonDiagnoses: true,
    includeCommonTests: true,
    includeCommonMedications: true,
  });
  const [recentTemplates, setRecentTemplates] = useState<SpecialtyType[]>(() => {
    try {
      const saved = localStorage.getItem("recentHubTemplates");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomConsultationTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    chiefComplaint: "",
    historyOfPresentIllness: "",
    reviewOfSystems: [""],
    physicalExamination: [""],
    assessment: "",
    plan: [""],
    commonDiagnoses: [""],
    commonTests: [""],
    commonMedications: [""],
  });

  const [editingFunction, setEditingFunction] = useState<HubFunction | null>(null);
  const [isAddingFunction, setIsAddingFunction] = useState(false);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [newFunction, setNewFunction] = useState({
    name: "",
    description: "",
    category: "",
  });
  const [newResource, setNewResource] = useState({
    title: "",
    type: "link" as "protocol" | "guideline" | "reference" | "tool" | "link",
    url: "",
    description: "",
  });
  const [noteContent, setNoteContent] = useState("");

  // Surgical Notes state
  const { users } = useUsers();
  const [surgicalNotesSearchTerm, setSurgicalNotesSearchTerm] = useState("");
  const [surgicalNotesStatusFilter, setSurgicalNotesStatusFilter] = useState<"all" | SurgicalStatus>("all");
  const [surgicalNotesTypeFilter, setSurgicalNotesTypeFilter] = useState<"all" | SurgicalProcedureType>("all");
  const [showAddSurgicalForm, setShowAddSurgicalForm] = useState(false);
  const [selectedSurgicalNote, setSelectedSurgicalNote] = useState<SurgicalNote | null>(null);
  const [showSurgicalDetailsModal, setShowSurgicalDetailsModal] = useState(false);
  const [surgicalFormData, setSurgicalFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    procedureName: "",
    procedureType: "scheduled" as SurgicalProcedureType,
    status: "scheduled" as SurgicalStatus,
    surgeonId: null as string | null,
    anesthesiologistId: null as string | null,
    anesthesiaType: "",
    indication: "",
    preoperativeDiagnosis: "",
    postoperativeDiagnosis: "",
    procedureDescription: "",
    findings: "",
    complications: "",
    estimatedBloodLoss: "",
    specimens: [] as string[],
    drains: "",
    postOpInstructions: "",
    recoveryNotes: "",
    followUpDate: "",
    operatingRoom: "",
    duration: "",
    startTime: "",
    endTime: "",
    currentSpecimen: "",
  });

  const [hubs, setHubs] = useState<Hub[]>([]);

  // Load hubs on mount
  useEffect(() => {
    const loadHubs = async () => {
      try {
        setLoading(true);
        setError(null);
        await initializeHubs();
        // Refresh the hubs state after loading - use getAllHubsSync to get cached data
        const loadedHubs = getAllHubsSync();
        setHubs(loadedHubs);
        if (loadedHubs.length === 0) {
          console.warn('No hubs loaded - check API connection and database');
        }
      } catch (err) {
        setError('Failed to load hubs');
        console.error('Error loading hubs:', err);
        // Try to use cached data
        const cached = getAllHubsSync();
        setHubs(cached);
      } finally {
        setLoading(false);
      }
    };
    loadHubs();
  }, []);

  // Load hub data when hub is selected
  useEffect(() => {
    if (!selectedHub) return;

    const loadHubData = async () => {
      try {
        // Load functions
        const functionsRes = await hubService.getHubFunctions(selectedHub);
        setHubFunctions(prev => ({
          ...prev,
          [selectedHub]: functionsRes.data || []
        }));

        // Load notes
        const notesRes = await hubService.getHubNotes(selectedHub);
        setHubNotes(prev => ({
          ...prev,
          [selectedHub]: notesRes.data || []
        }));

        // Load resources
        const resourcesRes = await hubService.getHubResources(selectedHub);
        setHubResources(prev => ({
          ...prev,
          [selectedHub]: resourcesRes.data || []
        }));

        // Load templates
        const templatesRes = await hubService.getHubTemplates(selectedHub);
        setHubTemplates(prev => ({
          ...prev,
          [selectedHub]: templatesRes.data || []
        }));
      } catch (err) {
        console.error('Error loading hub data:', err);
      }
    };

    loadHubData();
  }, [selectedHub]);

  // Save completed questionnaires to localStorage
  useEffect(() => {
    localStorage.setItem("completedQuestionnaires", JSON.stringify(completedQuestionnaires));
  }, [completedQuestionnaires]);

  // Save custom templates to localStorage
  useEffect(() => {
    localStorage.setItem("customConsultationTemplates", JSON.stringify(customTemplates));
  }, [customTemplates]);

  const filteredHubs = useMemo(() => {
    if (!hubs || hubs.length === 0) return [];
    if (!searchTerm) return hubs;
    const term = searchTerm.toLowerCase();
    return hubs.filter(
      (hub) =>
        hub.name.toLowerCase().includes(term) ||
        hub.description.toLowerCase().includes(term) ||
        (hub.specialties && hub.specialties.some(s => s.toLowerCase().includes(term)))
    );
  }, [searchTerm, hubs]);

  // Sort hubs alphabetically by name (must be before any early returns)
  const sortedHubs = useMemo(() => {
    if (!filteredHubs || filteredHubs.length === 0) return [];
    return [...filteredHubs].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredHubs]);

  const handleAddFunction = async () => {
    if (!selectedHub || !newFunction.name.trim()) return;

    try {
      const response = await hubService.createHubFunction(selectedHub, {
        name: newFunction.name.trim(),
        description: newFunction.description.trim() || undefined,
        category: newFunction.category.trim() || undefined,
      });

      setHubFunctions((prev) => ({
        ...prev,
        [selectedHub]: [...(prev[selectedHub] || []), response.data],
      }));

      setNewFunction({ name: "", description: "", category: "" });
      setIsAddingFunction(false);
    } catch (err) {
      console.error('Error creating hub function:', err);
      alert('Failed to create function. Please try again.');
    }
  };

  const handleEditFunction = (func: HubFunction) => {
    setEditingFunction(func);
    setNewFunction({
      name: func.name,
      description: func.description || "",
      category: func.category || "",
    });
    setIsAddingFunction(true);
  };

  const handleUpdateFunction = async () => {
    if (!selectedHub || !editingFunction || !newFunction.name.trim()) return;

    try {
      const response = await hubService.updateHubFunction(selectedHub, editingFunction.id, {
        name: newFunction.name.trim(),
        description: newFunction.description.trim() || undefined,
        category: newFunction.category.trim() || undefined,
      });

      setHubFunctions((prev) => ({
        ...prev,
        [selectedHub]: (prev[selectedHub] || []).map((f) =>
          f.id === editingFunction.id ? response.data : f
        ),
      }));

      setEditingFunction(null);
      setNewFunction({ name: "", description: "", category: "" });
      setIsAddingFunction(false);
    } catch (err) {
      console.error('Error updating hub function:', err);
      alert('Failed to update function. Please try again.');
    }
  };

  const handleDeleteFunction = async (functionId: string) => {
    if (!selectedHub) return;
    if (!confirm('Are you sure you want to delete this function?')) return;

    try {
      await hubService.deleteHubFunction(selectedHub, functionId);
      setHubFunctions((prev) => ({
        ...prev,
        [selectedHub]: (prev[selectedHub] || []).filter((f) => f.id !== functionId),
      }));
    } catch (err) {
      console.error('Error deleting hub function:', err);
      alert('Failed to delete function. Please try again.');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedHub || !noteContent.trim()) return;

    try {
      const response = await hubService.createOrUpdateHubNote(selectedHub, {
        content: noteContent.trim(),
      });

      setHubNotes((prev) => ({
        ...prev,
        [selectedHub]: [response.data],
      }));

      setIsEditingNote(false);
    } catch (err) {
      console.error('Error saving hub note:', err);
      alert('Failed to save note. Please try again.');
    }
  };

  const handleAddResource = async () => {
    if (!selectedHub || !newResource.title.trim()) return;

    try {
      const response = await hubService.createHubResource(selectedHub, {
        title: newResource.title.trim(),
        type: newResource.type,
        url: newResource.url.trim() || undefined,
        description: newResource.description.trim() || undefined,
      });

      setHubResources((prev) => ({
        ...prev,
        [selectedHub]: [...(prev[selectedHub] || []), response.data],
      }));

      setNewResource({ title: "", type: "link", url: "", description: "" });
      setIsAddingResource(false);
    } catch (err) {
      console.error('Error creating hub resource:', err);
      alert('Failed to create resource. Please try again.');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!selectedHub) return;
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      await hubService.deleteHubResource(selectedHub, resourceId);
      setHubResources((prev) => ({
        ...prev,
        [selectedHub]: (prev[selectedHub] || []).filter((r) => r.id !== resourceId),
      }));
    } catch (err) {
      console.error('Error deleting hub resource:', err);
      alert('Failed to delete resource. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingFunction(null);
    setNewFunction({ name: "", description: "", category: "" });
    setIsAddingFunction(false);
    setIsAddingResource(false);
    setIsEditingNote(false);
    setNoteContent("");
    setIsCreatingTemplate(false);
    setEditingTemplate(null);
    setTemplateForm({
      name: "",
      description: "",
      chiefComplaint: "",
      historyOfPresentIllness: "",
      reviewOfSystems: [""],
      physicalExamination: [""],
      assessment: "",
      plan: [""],
      commonDiagnoses: [""],
      commonTests: [""],
      commonMedications: [""],
    });
  };

  // Generate template note function (similar to Consultation)
  const generateTemplateNote = (specialty: SpecialtyType, showPreview = false) => {
    const template = getSpecialtyTemplate(specialty);
    const specialtyName = template?.name || specialty.charAt(0).toUpperCase() + specialty.slice(1);
    const templateData = template?.consultationTemplate;

    // Build comprehensive template with customizable sections
    const sections = [];

    // Chief Complaint
    if (templateCustomization.includeSections.chiefComplaint) {
      sections.push("CHIEF COMPLAINT:");
      sections.push(templateData?.chiefComplaint || "[To be documented]");
      sections.push("");
    }

    // History of Present Illness
    if (templateCustomization.includeSections.hpi) {
      sections.push("HISTORY OF PRESENT ILLNESS:");
      sections.push(templateData?.historyOfPresentIllness || "[To be documented]");
      sections.push("");
    }

    // Review of Systems
    if (templateCustomization.includeSections.reviewOfSystems) {
      sections.push("REVIEW OF SYSTEMS:");
      if (templateData?.reviewOfSystems && templateData.reviewOfSystems.length > 0) {
        sections.push(templateData.reviewOfSystems.map(item => `• ${item}`).join('\n'));
        sections.push("\n[Additional systems to review as indicated]");
      } else {
        sections.push("[To be documented]");
      }
      sections.push("");
    }

    // Vital Signs
    if (templateCustomization.includeSections.vitalSigns) {
      sections.push("VITAL SIGNS:");
      sections.push("BP: [To be documented], HR: [To be documented] bpm, RR: [To be documented] /min, Temp: [To be documented], O2 Sat: [To be documented]%");
      sections.push("");
    }

    // Physical Examination
    if (templateCustomization.includeSections.physicalExam) {
      sections.push("PHYSICAL EXAMINATION:");
      if (templateData?.physicalExamination && templateData.physicalExamination.length > 0) {
        sections.push(templateData.physicalExamination.map(item => `• ${item}`).join('\n'));
        sections.push("\n[Additional examination findings to be documented]");
      } else {
        sections.push("[To be documented]");
      }
      sections.push("");
    }

    // Social History
    if (templateCustomization.includeSections.socialHistory) {
      sections.push("SOCIAL HISTORY:");
      sections.push("[To be documented]");
      sections.push("");
    }

    // Family History
    if (templateCustomization.includeSections.familyHistory) {
      sections.push("FAMILY HISTORY:");
      sections.push("[To be documented]");
      sections.push("");
    }

    // Medication Reconciliation
    if (templateCustomization.includeSections.medicationReconciliation) {
      sections.push("MEDICATION RECONCILIATION:");
      sections.push("[Review and document any changes, additions, or discontinuations]");
      sections.push("");
    }

    // Diagnosis Codes
    if (templateCustomization.includeSections.diagnosisCodes) {
      sections.push("DIAGNOSIS CODES:");
      sections.push("[To be documented - ICD-10 codes]");
      sections.push("");
    }

    // Assessment
    if (templateCustomization.includeSections.assessment) {
      sections.push("ASSESSMENT:");
      sections.push(templateData?.assessment || `[${specialtyName} consultation assessment to be documented]`);
      sections.push("");
    }

    // Plan
    if (templateCustomization.includeSections.plan) {
      sections.push("PLAN:");
      if (templateData?.plan && templateData.plan.length > 0) {
        sections.push(templateData.plan.map(item => `• ${item}`).join('\n'));
        sections.push("\n[Additional plan items to be documented]");
      } else {
        sections.push("[To be documented]");
      }
      sections.push("");
    }

    // Common Diagnoses, Tests, and Medications
    if (templateCustomization.includeCommonDiagnoses && templateData?.commonDiagnoses && templateData.commonDiagnoses.length > 0) {
      sections.push("COMMON DIAGNOSES TO CONSIDER:");
      sections.push(templateData.commonDiagnoses.map(item => `• ${item}`).join('\n'));
      sections.push("");
    }

    if (templateCustomization.includeCommonTests && templateData?.commonTests && templateData.commonTests.length > 0) {
      sections.push("COMMON TESTS TO CONSIDER:");
      sections.push(templateData.commonTests.map(item => `• ${item}`).join('\n'));
      sections.push("");
    }

    if (templateCustomization.includeCommonMedications && templateData?.commonMedications && templateData.commonMedications.length > 0) {
      sections.push("COMMON MEDICATIONS TO CONSIDER:");
      sections.push(templateData.commonMedications.map(item => `• ${item}`).join('\n'));
      sections.push("");
    }

    // Patient Instructions
    if (templateCustomization.includeSections.patientInstructions) {
      sections.push("PATIENT INSTRUCTIONS:");
      sections.push("[To be documented - patient education, instructions, precautions, warning signs]");
      sections.push("");
    }

    // Follow-up
    if (templateCustomization.includeSections.followUp) {
      sections.push("FOLLOW-UP:");
      sections.push("[To be documented - follow-up appointment, labs, imaging, referrals]");
    }

    const templateContent = sections.join("\n").trim();
    const templateTitle = `${specialtyName} Consultation Template`;

    // Update recent templates
    const updatedRecent = [specialty, ...recentTemplates.filter(s => s !== specialty)].slice(0, 5);
    setRecentTemplates(updatedRecent);
    try {
      localStorage.setItem("recentHubTemplates", JSON.stringify(updatedRecent));
    } catch (error) {
      console.warn('Failed to save recent templates:', error);
    }

    if (showPreview) {
      setTemplatePreview({
        content: templateContent,
        title: templateTitle,
        specialty: specialty
      });
      setEditedTemplateContent(templateContent);
      setShowTemplateGenerator(false);
    } else {
      // Convert to custom template format and save
      const customTemplate: CustomConsultationTemplate = {
        id: `template-${Date.now()}`,
        name: templateTitle,
        description: `Generated from ${specialtyName} specialty template`,
        hubId: selectedHub || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        consultationTemplate: {
          chiefComplaint: templateData?.chiefComplaint || "",
          historyOfPresentIllness: templateData?.historyOfPresentIllness || "",
          reviewOfSystems: templateData?.reviewOfSystems || [],
          physicalExamination: templateData?.physicalExamination || [],
          assessment: templateData?.assessment || "",
          plan: templateData?.plan || [],
          commonDiagnoses: templateData?.commonDiagnoses || [],
          commonTests: templateData?.commonTests || [],
          commonMedications: templateData?.commonMedications || [],
        }
      };
      setCustomTemplates(prev => [...prev, customTemplate]);
      setShowTemplateGenerator(false);
    }
  };

  const generateCustomTemplateNote = (customTemplate: CustomConsultationTemplate, showPreview = false) => {
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
BP: [To be documented], HR: [To be documented], RR: [To be documented], Temp: [To be documented], O2 Sat: [To be documented]%

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

    const templateTitle = `${customTemplate.name || "Custom Template"}`;

    if (showPreview) {
      setTemplatePreview({
        content: templateContent,
        title: templateTitle,
        specialty: undefined,
      });
      setEditedTemplateContent(templateContent);
      setShowTemplateGenerator(false);
    } else {
      // Apply template - could navigate to Consultation tab or show in preview
      setTemplatePreview({
        content: templateContent,
        title: templateTitle,
        specialty: undefined,
      });
      setEditedTemplateContent(templateContent);
      setShowTemplateGenerator(false);
    }
  };

  // Handle using template in consultation
  const handleUseTemplateInConsultation = () => {
    if (!templatePreview) return;

    // Store template data for Consultation component
    storeTemplateForConsultation({
      content: editedTemplateContent || templatePreview.content,
      title: templatePreview.title,
      specialty: templatePreview.specialty,
    });

    // Ensure a patient is selected
    if (patients.length > 0 && selectedPatient) {
      // Patient already selected, navigate to consultation
      setActiveTab("consultation");
      setTemplatePreview(null);
      setEditedTemplateContent("");
    } else if (patients.length > 0) {
      // Select first patient and navigate
      setSelectedPatient(patients[0]);
      setActiveTab("consultation");
      setTemplatePreview(null);
      setEditedTemplateContent("");
    } else {
      // No patients available - show message
      alert("Please select a patient first to use this template in a consultation.");
    }
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name.trim()) return;

    const template: CustomConsultationTemplate = {
      id: editingTemplate?.id || `template-${Date.now()}`,
      name: templateForm.name.trim(),
      description: templateForm.description.trim() || undefined,
      hubId: selectedHub || undefined,
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      consultationTemplate: {
        chiefComplaint: templateForm.chiefComplaint.trim(),
        historyOfPresentIllness: templateForm.historyOfPresentIllness.trim(),
        reviewOfSystems: templateForm.reviewOfSystems.filter(s => s.trim()),
        physicalExamination: templateForm.physicalExamination.filter(s => s.trim()),
        assessment: templateForm.assessment.trim(),
        plan: templateForm.plan.filter(s => s.trim()),
        commonDiagnoses: templateForm.commonDiagnoses.filter(s => s.trim()),
        commonTests: templateForm.commonTests.filter(s => s.trim()),
        commonMedications: templateForm.commonMedications.filter(s => s.trim()),
      },
    };

    if (editingTemplate) {
      setCustomTemplates(prev => prev.map(t => t.id === editingTemplate.id ? template : t));
    } else {
      setCustomTemplates(prev => [...prev, template]);
    }

    handleCancelEdit();
  };

  const handleEditTemplate = (template: CustomConsultationTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description || "",
      chiefComplaint: template.consultationTemplate.chiefComplaint,
      historyOfPresentIllness: template.consultationTemplate.historyOfPresentIllness,
      reviewOfSystems: template.consultationTemplate.reviewOfSystems.length > 0
        ? template.consultationTemplate.reviewOfSystems
        : [""],
      physicalExamination: template.consultationTemplate.physicalExamination.length > 0
        ? template.consultationTemplate.physicalExamination
        : [""],
      assessment: template.consultationTemplate.assessment,
      plan: template.consultationTemplate.plan.length > 0
        ? template.consultationTemplate.plan
        : [""],
      commonDiagnoses: template.consultationTemplate.commonDiagnoses.length > 0
        ? template.consultationTemplate.commonDiagnoses
        : [""],
      commonTests: template.consultationTemplate.commonTests.length > 0
        ? template.consultationTemplate.commonTests
        : [""],
      commonMedications: template.consultationTemplate.commonMedications.length > 0
        ? template.consultationTemplate.commonMedications
        : [""],
    });
    setIsCreatingTemplate(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleAddArrayItem = (field: keyof typeof templateForm, value: string) => {
    setTemplateForm(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value],
    }));
  };

  const handleUpdateArrayItem = (field: keyof typeof templateForm, index: number, value: string) => {
    setTemplateForm(prev => {
      const arr = [...(prev[field] as string[])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleRemoveArrayItem = (field: keyof typeof templateForm, index: number) => {
    setTemplateForm(prev => {
      const arr = [...(prev[field] as string[])];
      arr.splice(index, 1);
      return { ...prev, [field]: arr.length > 0 ? arr : [""] };
    });
  };

  // Calculate score when answers change
  useEffect(() => {
    if (!selectedQuestionnaire) {
      setQuestionnaireScore(null);
      return;
    }

    const scoringFn = getScoringFunction(selectedQuestionnaire.id);
    if (scoringFn && selectedQuestionnaire.hasScoring) {
      const score = scoringFn(questionnaireAnswers);
      setQuestionnaireScore(score);
    } else {
      setQuestionnaireScore(null);
    }
  }, [questionnaireAnswers, selectedQuestionnaire]);

  const renderQuestionInput = (question: Question) => {
    const value = questionnaireAnswers[question.id];

    switch (question.type) {
      case "text":
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, [question.id]: e.target.value })}
            placeholder={question.placeholder}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, [question.id]: parseFloat(e.target.value) || "" })}
            placeholder={question.placeholder}
            min={question.min}
            max={question.max}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, [question.id]: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
            aria-label={question.question}
          />
        );

      case "boolean":
        return (
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                checked={value === true}
                onChange={() => setQuestionnaireAnswers({ ...questionnaireAnswers, [question.id]: true })}
                className="w-4 h-4 text-teal-600"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                checked={value === false}
                onChange={() => setQuestionnaireAnswers({ ...questionnaireAnswers, [question.id]: false })}
                className="w-4 h-4 text-teal-600"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
        );

      case "select":
        return (
          <select
            value={value || ""}
            onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, [question.id]: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
            aria-label={question.question}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option, index) => {
              if (typeof option === 'string') {
                return (
                  <option key={index} value={option}>
                    {option}
                  </option>
                );
              }
              return (
                <option key={option.id} value={String(option.value)}>
                  {option.label}
                </option>
              );
            })}
          </select>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              const optionId = typeof option === 'string' ? `${question.id}-${index}` : option.id;
              return (
                <label key={optionId} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={question.id}
                    value={String(optionValue)}
                    checked={value === optionValue}
                    onChange={() => setQuestionnaireAnswers({ ...questionnaireAnswers, [question.id]: optionValue })}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span className="text-sm">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              const optionId = typeof option === 'string' ? `${question.id}-${index}` : option.id;
              const checkedValues = Array.isArray(value) ? value : [];
              const isChecked = checkedValues.includes(optionValue);
              return (
                <label key={optionId} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...checkedValues, optionValue]
                        : checkedValues.filter((v) => v !== optionValue);
                      setQuestionnaireAnswers({ ...questionnaireAnswers, [question.id]: newValues });
                    }}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span className="text-sm">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case "scale":
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              {question.scaleLabels && (
                <>
                  <span>{question.scaleLabels.min}</span>
                  <span>{question.scaleLabels.max}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={question.min || 0}
                max={question.max || 10}
                value={value || question.min || 0}
                onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, [question.id]: parseInt(e.target.value) })}
                className="flex-1"
                aria-label={question.question}
              />
              <span className="w-12 text-center font-medium text-sm">{value || question.min || 0}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isQuestionnaireValid = (questionnaire: Questionnaire): boolean => {
    return questionnaire.questions.every((question) => {
      if (!question.required) return true;
      const answer = questionnaireAnswers[question.id];
      if (answer === undefined || answer === null || answer === "") return false;
      if (Array.isArray(answer) && answer.length === 0) return false;
      return true;
    });
  };

  const handleSubmitQuestionnaire = () => {
    if (!selectedHub || !selectedQuestionnaire) return;
    if (!isQuestionnaireValid(selectedQuestionnaire)) return;

    const completed = {
      questionnaireId: selectedQuestionnaire.id,
      title: selectedQuestionnaire.title || selectedQuestionnaire.name || 'Questionnaire',
      answers: { ...questionnaireAnswers },
      score: questionnaireScore,
      completedAt: new Date().toISOString(),
    };

    setCompletedQuestionnaires((prev) => ({
      ...prev,
      [selectedHub]: [...(prev[selectedHub] || []), completed],
    }));

    setSelectedQuestionnaire(null);
    setQuestionnaireAnswers({});
    setQuestionnaireScore(null);
  };

  const currentHub = selectedHub ? getHubById(selectedHub) : null;
  const currentFunctions = selectedHub ? hubFunctions[selectedHub] || [] : [];
  const currentNotes = selectedHub ? hubNotes[selectedHub] || [] : [];
  const currentResources = selectedHub ? hubResources[selectedHub] || [] : [];
  const currentNote = currentNotes[0];
  const hubQuestionnaires = selectedHub ? getQuestionnairesByHub(String(selectedHub)) : [];
  const hubCompletedQuestionnaires = selectedHub ? completedQuestionnaires[selectedHub] || [] : [];

  // Get real stats from patient data
  const realHubStats = selectedHub ? getHubStats(patients, selectedHub) : null;
  const hubStats: HubStats = realHubStats ? {
    totalPatients: realHubStats.totalPatients,
    activeAppointments: realHubStats.activeAppointments,
    recentActivities: realHubStats.recentNotes,
  } : {
    totalPatients: 0,
    activeAppointments: 0,
    recentActivities: 0,
  };

  const quickActions = selectedHub ? getHubQuickActions(selectedHub) : [];
  const hubPatients = selectedHub ? filterPatientsByHub(patients, selectedHub) : [];

  // Check if hub is surgical (has surgical specialties)
  const isSurgicalHub = useMemo(() => {
    if (!currentHub) return false;
    const surgicalKeywords = ['surgery', 'surgical', 'general_surgery', 'cardiac_surgery', 'orthopedic', 'orthopedics'];
    return currentHub.specialties?.some(spec =>
      surgicalKeywords.some(keyword => spec.toLowerCase().includes(keyword.toLowerCase()))
    ) || false;
  }, [currentHub]);

  // Get all surgical notes from hub patients
  const hubSurgicalNotes = useMemo(() => {
    if (!hubPatients.length) return [];
    const allNotes: (SurgicalNote & { patientId: string; patientName: string })[] = [];
    hubPatients.forEach(patient => {
      if (patient.surgicalNotes) {
        patient.surgicalNotes.forEach(note => {
          allNotes.push({
            ...note,
            patientId: patient.id,
            patientName: patient.name,
          });
        });
      }
    });
    return allNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [hubPatients]);

  // Filter surgical notes
  const filteredSurgicalNotes = useMemo(() => {
    return hubSurgicalNotes.filter((note) => {
      const matchesSearch =
        note.procedureName.toLowerCase().includes(surgicalNotesSearchTerm.toLowerCase()) ||
        note.indication.toLowerCase().includes(surgicalNotesSearchTerm.toLowerCase()) ||
        note.preoperativeDiagnosis.toLowerCase().includes(surgicalNotesSearchTerm.toLowerCase()) ||
        note.patientName.toLowerCase().includes(surgicalNotesSearchTerm.toLowerCase());
      const matchesStatus = surgicalNotesStatusFilter === "all" || note.status === surgicalNotesStatusFilter;
      const matchesType = surgicalNotesTypeFilter === "all" || note.procedureType === surgicalNotesTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [hubSurgicalNotes, surgicalNotesSearchTerm, surgicalNotesStatusFilter, surgicalNotesTypeFilter]);

  const handleQuickAction = (action: any) => {
    if (action.action === "schedule" && action.tab) {
      setActiveTab(action.tab);
      // Could pre-fill specialty here if needed
    } else if (action.action === "consultation" && action.tab) {
      setActiveTab(action.tab);
    } else if (action.action === "referral" && action.tab) {
      setActiveTab(action.tab);
    } else if (action.action === "filter-patients") {
      // Navigate to patient list with hub filter
      // This would require passing filter state - for now just show in hub
    }
  };

  // Surgical Notes helper functions
  const getSurgicalStatusColor = (status: SurgicalStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "in_progress":
        return "bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400";
      case "scheduled":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      case "postponed":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const getSurgicalTypeColor = (type: SurgicalProcedureType) => {
    switch (type) {
      case "emergency":
        return "bg-red-500 text-white";
      case "urgent":
        return "bg-orange-500 text-white";
      case "elective":
        return "bg-teal-500 text-white";
      case "scheduled":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleAddSurgicalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert("Please select a patient first");
      return;
    }

    const surgeon = surgicalFormData.surgeonId ? users.find(u => u.id === surgicalFormData.surgeonId) : null;
    const anesthesiologist = surgicalFormData.anesthesiologistId ? users.find(u => u.id === surgicalFormData.anesthesiologistId) : null;

    const newNote: SurgicalNote = {
      id: `surg-${Date.now()}`,
      date: surgicalFormData.date,
      procedureName: surgicalFormData.procedureName,
      procedureType: surgicalFormData.procedureType,
      status: surgicalFormData.status,
      surgeon: surgeon ? `${surgeon.firstName} ${surgeon.lastName}` : undefined,
      surgeonId: surgicalFormData.surgeonId || undefined,
      anesthesiologist: anesthesiologist ? `${anesthesiologist.firstName} ${anesthesiologist.lastName}` : undefined,
      anesthesiologistId: surgicalFormData.anesthesiologistId || undefined,
      anesthesiaType: surgicalFormData.anesthesiaType || undefined,
      indication: surgicalFormData.indication,
      preoperativeDiagnosis: surgicalFormData.preoperativeDiagnosis,
      postoperativeDiagnosis: surgicalFormData.postoperativeDiagnosis || undefined,
      procedureDescription: surgicalFormData.procedureDescription,
      findings: surgicalFormData.findings || undefined,
      complications: surgicalFormData.complications || undefined,
      estimatedBloodLoss: surgicalFormData.estimatedBloodLoss || undefined,
      specimens: surgicalFormData.specimens.length > 0 ? surgicalFormData.specimens : undefined,
      drains: surgicalFormData.drains || undefined,
      postOpInstructions: surgicalFormData.postOpInstructions || undefined,
      recoveryNotes: surgicalFormData.recoveryNotes || undefined,
      followUpDate: surgicalFormData.followUpDate || undefined,
      operatingRoom: surgicalFormData.operatingRoom || undefined,
      duration: surgicalFormData.duration ? parseInt(surgicalFormData.duration) : undefined,
      startTime: surgicalFormData.startTime || undefined,
      endTime: surgicalFormData.endTime || undefined,
    };

    // Add note to patient using context update function
    updatePatient(selectedPatient.id, (patient) => {
      const updatedPatient = { ...patient };
      if (updatedPatient.surgicalNotes) {
        updatedPatient.surgicalNotes = [...updatedPatient.surgicalNotes, newNote];
      } else {
        updatedPatient.surgicalNotes = [newNote];
      }
      // Update selected patient to reflect changes
      setSelectedPatient(updatedPatient);
      return updatedPatient;
    });

    // Show success notification
    toast.success(`Surgical note "${newNote.procedureName}" added successfully`);

    // Reset form
    setSurgicalFormData({
      date: new Date().toISOString().split("T")[0],
      procedureName: "",
      procedureType: "scheduled",
      status: "scheduled",
      surgeonId: null,
      anesthesiologistId: null,
      anesthesiaType: "",
      indication: "",
      preoperativeDiagnosis: "",
      postoperativeDiagnosis: "",
      procedureDescription: "",
      findings: "",
      complications: "",
      estimatedBloodLoss: "",
      specimens: [],
      drains: "",
      postOpInstructions: "",
      recoveryNotes: "",
      followUpDate: "",
      operatingRoom: "",
      duration: "",
      startTime: "",
      endTime: "",
      currentSpecimen: "",
    });
    setShowAddSurgicalForm(false);
  };

  const handlePrintSurgicalNote = (note: SurgicalNote & { patientName?: string }) => {
    const orgDetails = getOrganizationDetails();
    const patient = hubPatients.find(p => p.surgicalNotes?.some(n => n.id === note.id)) || selectedPatient;

    if (!patient) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Surgical Note - ${note.procedureName}</title>
          <style>
            @page { margin: 1in; size: letter; }
            body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .org-header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; text-align: center; }
            .org-name { font-size: 22px; font-weight: 700; color: #1e40af; margin: 0 0 5px 0; }
            .org-type { font-size: 14px; color: #4b5563; margin: 0 0 8px 0; font-weight: 500; }
            .org-details { font-size: 11px; color: #6b7280; line-height: 1.5; margin: 0; }
            .document-header { text-align: center; margin: 25px 0; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb; }
            .document-header h1 { margin: 0; font-size: 20px; color: #1e40af; font-weight: 600; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
            .info-item { padding: 10px; background: #f9fafb; border-radius: 4px; }
            .info-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
            .info-value { font-size: 14px; font-weight: 600; color: #111827; }
            .section { margin: 30px 0; }
            .section-title { font-size: 16px; font-weight: 600; color: #1e40af; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
            .content { background: #f9fafb; padding: 15px; border-radius: 4px; margin: 20px 0; white-space: pre-wrap; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="org-header">
            <div class="org-name">${orgDetails.name}</div>
            <div class="org-type">${orgDetails.type}</div>
            <div class="org-details">
              ${orgDetails.address}, ${orgDetails.city}, ${orgDetails.state} ${orgDetails.zipCode}<br>
              Phone: ${orgDetails.phone}${orgDetails.fax ? ` | Fax: ${orgDetails.fax}` : ""}${orgDetails.email ? ` | Email: ${orgDetails.email}` : ""}
            </div>
          </div>
          <div class="document-header">
            <h1>SURGICAL NOTE</h1>
            <h2>${note.procedureName}</h2>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Patient Name</div>
              <div class="info-value">${patient.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date</div>
              <div class="info-value">${new Date(note.date).toLocaleDateString()}</div>
            </div>
            ${note.surgeon ? `<div class="info-item"><div class="info-label">Surgeon</div><div class="info-value">${note.surgeon}</div></div>` : ""}
            ${note.operatingRoom ? `<div class="info-item"><div class="info-label">Operating Room</div><div class="info-value">${note.operatingRoom}</div></div>` : ""}
          </div>
          ${note.indication ? `<div class="section"><div class="section-title">INDICATION</div><div class="content">${note.indication}</div></div>` : ""}
          ${note.procedureDescription ? `<div class="section"><div class="section-title">PROCEDURE DESCRIPTION</div><div class="content">${note.procedureDescription}</div></div>` : ""}
          ${note.findings ? `<div class="section"><div class="section-title">FINDINGS</div><div class="content">${note.findings}</div></div>` : ""}
          <div class="footer">This is an official surgical note document. Confidential medical information.</div>
        </body>
      </html>
    `;

    openPrintWindow(printContent, `Surgical Note - ${note.procedureName}`);
  };

  if (selectedHub && currentHub) {
    return (
      <div className="space-y-4">
        {/* Hub Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedHub(null);
              setHubActiveTab("overview");
            }}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ChevronRight className="rotate-180" size={16} />
            Back to Hubs
          </button>
        </div>

        <div className={`rounded-lg border-2 p-6 ${getHubColorClass(selectedHub)}`}>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <div className="w-8 h-8 rounded bg-teal-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{currentHub.name}</h2>
              <p className="text-sm opacity-80">{currentHub.description}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "questionnaires", label: "Questionnaires", icon: ClipboardList },
              { id: "templates", label: "Templates", icon: FileEdit },
              { id: "functions", label: "Functions", icon: Zap },
              { id: "notes", label: "Notes", icon: FileText },
              ...(isSurgicalHub ? [{ id: "surgical-notes", label: "Surgical Notes", icon: Activity }] : []),
              { id: "resources", label: "Resources", icon: BookOpen },
              { id: "team", label: "Team", icon: Users },
              { id: "stats", label: "Statistics", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setHubActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${hubActiveTab === tab.id
                  ? "border-teal-600 text-teal-600 dark:text-teal-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {hubActiveTab === "overview" && (
            <div className="space-y-6">
              {/* Specialties */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-white/60 dark:bg-gray-800/60 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Specialty information will be loaded from API
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              {quickActions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action)}
                        className="flex items-center gap-2 px-4 py-3 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-gray-700"
                      >
                        {action.action === "schedule" && <Calendar size={16} />}
                        {action.action === "consultation" && <Stethoscope size={16} />}
                        {action.action === "referral" && <ArrowRight size={16} />}
                        {action.action === "filter-patients" && <User size={16} />}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-2xl font-bold">{hubStats.totalPatients}</div>
                  <div className="text-sm opacity-70">Total Patients</div>
                </div>
                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-2xl font-bold">{hubStats.activeAppointments}</div>
                  <div className="text-sm opacity-70">Active Appointments</div>
                </div>
                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-2xl font-bold">{currentFunctions.length}</div>
                  <div className="text-sm opacity-70">Custom Functions</div>
                </div>
              </div>

              {/* Hub Patients Preview */}
              {hubPatients.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Hub Patients ({hubPatients.length})</h3>
                    <button
                      onClick={() => {
                        // Navigate to patient list - would need to pass filter
                        // For now, just show first patient
                        if (hubPatients[0]) {
                          setSelectedPatient(hubPatients[0]);
                          setActiveTab("overview");
                        }
                      }}
                      className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {hubPatients.slice(0, 5).map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setActiveTab("overview");
                        }}
                        className="w-full text-left p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
                        aria-label={`Select patient: ${patient.name}`}
                      >
                        <div className="font-medium text-sm">{patient.name}</div>
                        {patient.condition && (
                          <div className="text-xs opacity-70 mt-1">{patient.condition}</div>
                        )}
                      </button>
                    ))}
                    {hubPatients.length > 5 && (
                      <div className="text-sm text-center text-gray-500 dark:text-gray-400 py-2">
                        +{hubPatients.length - 5} more patients
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Common Conditions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Common Conditions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(() => {
                    const hub = hubs.find(h => h.id === selectedHub);
                    const commonConditions = hub ? getHubConditions(hub.id) : [];
                    const patientConditions = getPatientConditions(hubPatients);
                    const conditionsToShow = patientConditions.length > 0
                      ? [...new Set([...patientConditions, ...commonConditions])].slice(0, 6)
                      : commonConditions.slice(0, 6);

                    if (conditionsToShow.length === 0) {
                      return (
                        <div className="px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 text-sm text-gray-500 dark:text-gray-400">
                          No conditions available
                        </div>
                      );
                    }

                    return conditionsToShow.map((condition, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                      >
                        {condition}
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Common Treatments */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Common Treatments</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(() => {
                    const hub = hubs.find(h => h.id === selectedHub);
                    const treatments = hub ? getHubTreatments(hub.id) : [];

                    if (treatments.length === 0) {
                      return (
                        <div className="px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 text-sm text-gray-500 dark:text-gray-400">
                          No treatments available
                        </div>
                      );
                    }

                    return treatments.slice(0, 6).map((treatment, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                      >
                        {treatment}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Functions Tab */}
          {hubActiveTab === "functions" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Custom Functions</h3>
                {!isAddingFunction && (
                  <button
                    onClick={() => setIsAddingFunction(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus size={16} />
                    Add Function
                  </button>
                )}
              </div>

              {isAddingFunction && (
                <div className="mb-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="function-name" className="block text-sm font-medium mb-1">
                        Function Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="function-name"
                        type="text"
                        value={newFunction.name}
                        onChange={(e) => setNewFunction({ ...newFunction, name: e.target.value })}
                        placeholder="e.g., Crisis Intervention Protocol"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="function-description" className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        id="function-description"
                        value={newFunction.description}
                        onChange={(e) => setNewFunction({ ...newFunction, description: e.target.value })}
                        placeholder="Describe what this function does..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="function-category" className="block text-sm font-medium mb-1">Category (optional)</label>
                      <input
                        id="function-category"
                        type="text"
                        value={newFunction.category}
                        onChange={(e) => setNewFunction({ ...newFunction, category: e.target.value })}
                        placeholder="e.g., Treatment, Assessment, Protocol"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={editingFunction ? handleUpdateFunction : handleAddFunction}
                        disabled={!newFunction.name.trim()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <Save size={16} />
                        {editingFunction ? "Update" : "Add"} Function
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentFunctions.length > 0 ? (
                <div className="space-y-2">
                  {currentFunctions.map((func) => (
                    <div
                      key={func.id}
                      className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{func.name}</h4>
                            {func.category && (
                              <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                                {func.category}
                              </span>
                            )}
                          </div>
                          {func.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{func.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditFunction(func)}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Edit function"
                            aria-label="Edit function"
                          >
                            <Edit size={14} className="text-teal-600 dark:text-teal-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteFunction(func.id)}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Delete function"
                            aria-label="Delete function"
                          >
                            <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No custom functions added yet</p>
                  <p className="text-xs mt-1">Click "Add Function" to create your first custom function</p>
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {hubActiveTab === "notes" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Hub Notes</h3>
                {!isEditingNote && (
                  <button
                    onClick={() => {
                      setIsEditingNote(true);
                      setNoteContent(currentNote?.content || "");
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit size={16} />
                    {currentNote ? "Edit Note" : "Add Note"}
                  </button>
                )}
              </div>

              {isEditingNote ? (
                <div className="space-y-3">
                  <label htmlFor="hub-note-content" className="block text-sm font-medium mb-1">Hub Notes</label>
                  <textarea
                    id="hub-note-content"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Add your notes about this hub..."
                    rows={10}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNote}
                      disabled={!noteContent.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                      aria-label="Save note"
                    >
                      <Save size={16} />
                      Save Note
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                      aria-label="Cancel editing note"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : currentNote ? (
                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="whitespace-pre-wrap text-sm">{currentNote.content}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Last updated: {new Date(currentNote.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notes added yet</p>
                  <p className="text-xs mt-1">Click "Add Note" to create your first note</p>
                </div>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {hubActiveTab === "resources" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Resources</h3>
                {!isAddingResource && (
                  <button
                    onClick={() => setIsAddingResource(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus size={16} />
                    Add Resource
                  </button>
                )}
              </div>

              {isAddingResource && (
                <div className="mb-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="resource-title" className="block text-sm font-medium mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="resource-title"
                        type="text"
                        value={newResource.title}
                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                        placeholder="Resource title"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="resource-type" className="block text-sm font-medium mb-1">Type</label>
                      <select
                        id="resource-type"
                        value={newResource.type}
                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                        aria-label="Resource type"
                      >
                        <option value="link">Link</option>
                        <option value="protocol">Protocol</option>
                        <option value="guideline">Guideline</option>
                        <option value="reference">Reference</option>
                        <option value="tool">Tool</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="resource-url" className="block text-sm font-medium mb-1">URL (optional)</label>
                      <input
                        id="resource-url"
                        type="url"
                        value={newResource.url}
                        onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="resource-description" className="block text-sm font-medium mb-1">Description (optional)</label>
                      <textarea
                        id="resource-description"
                        value={newResource.description}
                        onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                        placeholder="Resource description..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddResource}
                        disabled={!newResource.title.trim()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <Save size={16} />
                        Add Resource
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentResources.length > 0 ? (
                <div className="space-y-2">
                  {currentResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{resource.title}</h4>
                            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                              {resource.type}
                            </span>
                          </div>
                          {resource.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{resource.description}</p>
                          )}
                          {resource.url && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-teal-600 dark:text-teal-400 hover:underline"
                            >
                              <Link2 size={14} />
                              {resource.url}
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteResource(resource.id)}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Delete resource"
                          aria-label="Delete resource"
                        >
                          <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No resources added yet</p>
                  <p className="text-xs mt-1">Click "Add Resource" to add protocols, guidelines, or links</p>
                </div>
              )}
            </div>
          )}

          {/* Surgical Notes Tab */}
          {hubActiveTab === "surgical-notes" && isSurgicalHub && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Surgical Notes</h3>
                {selectedPatient && (
                  <button
                    onClick={() => setShowAddSurgicalForm(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus size={16} />
                    Add Surgical Note
                  </button>
                )}
              </div>

              {!selectedPatient && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Activity size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Please select a patient to add surgical notes</p>
                </div>
              )}

              {selectedPatient && (
                <>
                  {/* Search and Filters */}
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Search surgical notes..."
                          value={surgicalNotesSearchTerm}
                          onChange={(e) => setSurgicalNotesSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-400" />
                        <select
                          value={surgicalNotesStatusFilter}
                          onChange={(e) => setSurgicalNotesStatusFilter(e.target.value as SurgicalStatus)}
                          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          aria-label="Filter by status"
                        >
                          <option value="all">All Status</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="postponed">Postponed</option>
                        </select>
                        <select
                          value={surgicalNotesTypeFilter}
                          onChange={(e) => setSurgicalNotesTypeFilter(e.target.value as SurgicalProcedureType)}
                          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          aria-label="Filter by procedure type"
                        >
                          <option value="all">All Types</option>
                          <option value="elective">Elective</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="urgent">Urgent</option>
                          <option value="emergency">Emergency</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Surgical Notes List */}
                  {filteredSurgicalNotes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Activity size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No surgical notes found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredSurgicalNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h4 className="font-semibold text-sm">{note.procedureName}</h4>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${getSurgicalTypeColor(note.procedureType)}`}>
                                  {note.procedureType.toUpperCase()}
                                </span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${getSurgicalStatusColor(note.status)}`}>
                                  {note.status.charAt(0).toUpperCase() + note.status.slice(1).replace("_", " ")}
                                </span>
                                {(note as any).patientName && (
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Patient: {(note as any).patientName}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{note.indication}</p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {new Date(note.date).toLocaleDateString()}
                                </span>
                                {note.surgeon && (
                                  <span className="flex items-center gap-1">
                                    <User size={14} />
                                    {note.surgeon}
                                  </span>
                                )}
                                {note.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {note.duration} min
                                  </span>
                                )}
                                {note.operatingRoom && (
                                  <span className="flex items-center gap-1">
                                    <FileText size={14} />
                                    OR {note.operatingRoom}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedSurgicalNote(note);
                                  setShowSurgicalDetailsModal(true);
                                }}
                                className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors text-sm"
                                aria-label="View surgical note details"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handlePrintSurgicalNote(note)}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                                aria-label="Print surgical note"
                                title="Print surgical note"
                              >
                                <Printer size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Team Tab */}
          {hubActiveTab === "team" && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Team Members</h3>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Team member assignment coming soon</p>
              </div>
            </div>
          )}

          {/* Questionnaires Tab */}
          {hubActiveTab === "questionnaires" && (
            <div>
              {selectedQuestionnaire ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => {
                        setSelectedQuestionnaire(null);
                        setQuestionnaireAnswers({});
                        setQuestionnaireScore(null);
                      }}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      aria-label="Back to questionnaires list"
                    >
                      <ChevronRight className="rotate-180" size={16} />
                      Back to Questionnaires
                    </button>
                  </div>

                  <div className="p-6 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2">{selectedQuestionnaire.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {selectedQuestionnaire.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                          General
                        </span>
                        {selectedQuestionnaire.estimatedTime && (
                          <span>⏱ {selectedQuestionnaire.estimatedTime} min</span>
                        )}
                        {selectedQuestionnaire.hasScoring && selectedQuestionnaire.maxScore && (
                          <span>Score: 0-{selectedQuestionnaire.maxScore}</span>
                        )}
                      </div>
                    </div>

                    {/* Score Display */}
                    {questionnaireScore && selectedQuestionnaire.hasScoring && (
                      <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-teal-900 dark:text-teal-100 mb-1">
                              Score: {questionnaireScore.total}
                              {selectedQuestionnaire.maxScore && ` / ${selectedQuestionnaire.maxScore}`}
                            </h4>
                            {questionnaireScore.interpretation && (
                              <p className="text-sm text-teal-700 dark:text-teal-300">
                                {questionnaireScore.interpretation}
                              </p>
                            )}
                            {questionnaireScore.severity && (
                              <span className="inline-block mt-2 px-2 py-1 bg-teal-200 dark:bg-teal-800 rounded text-xs font-medium text-teal-900 dark:text-teal-100">
                                {questionnaireScore.severity}
                              </span>
                            )}
                          </div>
                        </div>
                        {questionnaireScore.recommendations && questionnaireScore.recommendations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-teal-200 dark:border-teal-700">
                            <p className="text-xs font-medium text-teal-900 dark:text-teal-100 mb-2">Recommendations:</p>
                            <ul className="space-y-1">
                              {questionnaireScore.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-xs text-teal-700 dark:text-teal-300 flex items-start gap-2">
                                  <span className="text-teal-500 mt-0.5">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-6">
                      {selectedQuestionnaire.questions.map((question, index) => (
                        <div key={question.id} className="space-y-2">
                          <label className="block text-sm font-medium">
                            {index + 1}. {question.question}
                            {question.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {renderQuestionInput(question)}
                        </div>
                      ))}

                      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={handleSubmitQuestionnaire}
                          disabled={!isQuestionnaireValid(selectedQuestionnaire)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <CheckCircle2 size={16} />
                          Submit Questionnaire
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuestionnaire(null);
                            setQuestionnaireAnswers({});
                            setQuestionnaireScore(null);
                          }}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                          aria-label="Cancel questionnaire"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : viewingCompletedQuestionnaire ? (
                <div>
                  <div className="mb-4">
                    <button
                      onClick={() => setViewingCompletedQuestionnaire(null)}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                      <ChevronRight className="rotate-180" size={16} />
                      Back to Questionnaires
                    </button>
                  </div>

                  <div className="p-6 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold">{viewingCompletedQuestionnaire.title}</h3>
                        <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Completed: {new Date(viewingCompletedQuestionnaire.completedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-6">
                      <h4 className="font-semibold text-lg mb-4">Your Responses</h4>
                      {viewingCompletedQuestionnaire.answers && Object.keys(viewingCompletedQuestionnaire.answers).length > 0 ? (
                        Object.entries(viewingCompletedQuestionnaire.answers).map(([questionId, answer]: [string, any]) => {
                          // Find the question from available questionnaires
                          let question: Question | undefined = undefined;
                          const currentQuestionnaire = selectedQuestionnaire as Questionnaire | null;
                          if (currentQuestionnaire && currentQuestionnaire.questions) {
                            question = currentQuestionnaire.questions.find((q: Question) => q.id === questionId);
                          }
                          if (!question) {
                            question = hubQuestionnaires
                              .flatMap((q: Questionnaire) => q.questions || [])
                              .find((q: Question) => q.id === questionId);
                          }
                          if (!question) return null;

                          return (
                            <div key={questionId} className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                              <label className="block text-sm font-medium">
                                {question.question}
                              </label>
                              <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                {Array.isArray(answer) ? (
                                  <ul className="list-disc list-inside space-y-1">
                                    {answer.map((item: string, idx: number) => (
                                      <li key={idx}>{item}</li>
                                    ))}
                                  </ul>
                                ) : typeof answer === 'boolean' ? (
                                  <span>{answer ? 'Yes' : 'No'}</span>
                                ) : (
                                  <span>{String(answer)}</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No answers available</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {hubCompletedQuestionnaires.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
                        Completed Questionnaires ({hubCompletedQuestionnaires.length})
                      </h3>
                      <div className="space-y-2 mb-6">
                        {hubCompletedQuestionnaires.map((completed: any, index: number) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full text-left p-4 bg-gradient-to-r from-green-50/60 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700 cursor-pointer transition-all"
                            onClick={() => setViewingCompletedQuestionnaire(completed)}
                            aria-label={`View completed questionnaire: ${completed.title}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="font-medium text-sm">{completed.title}</div>
                                  <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Completed: {new Date(completed.completedAt).toLocaleString()}
                                </div>
                              </div>
                              <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Available Questionnaires</h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {hubQuestionnaires.length} available
                    </div>
                  </div>

                  {hubQuestionnaires.length > 0 ? (
                    <div className="space-y-3">
                      {hubQuestionnaires.map((questionnaire) => (
                        <div
                          key={questionnaire.id}
                          className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm">{questionnaire.title}</h4>
                                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                                  General
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {questionnaire.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span>{questionnaire.questions.length} questions</span>
                                {questionnaire.estimatedTime && (
                                  <span>⏱ {questionnaire.estimatedTime} min</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedQuestionnaire(questionnaire)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium transition-colors"
                            >
                              <Play size={14} />
                              Start
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <ClipboardList size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No questionnaires available for this hub</p>
                      <p className="text-xs mt-1">Questionnaires are specialty-specific</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {hubActiveTab === "templates" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Consultation Templates</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Generate and manage custom consultation forms for this hub
                  </p>
                </div>
                <div className="flex gap-2">
                  {!isCreatingTemplate && (
                    <>
                      <button
                        onClick={() => {
                          console.log('Generate Template button clicked');
                          setShowTemplateGenerator(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                        type="button"
                        aria-label="Generate consultation template"
                      >
                        <Sparkles size={18} />
                        Generate Template
                      </button>
                      <button
                        onClick={() => {
                          setIsCreatingTemplate(true);
                          setEditingTemplate(null);
                          setTemplateForm({
                            name: "",
                            description: "",
                            chiefComplaint: "",
                            historyOfPresentIllness: "",
                            reviewOfSystems: [""],
                            physicalExamination: [""],
                            assessment: "",
                            plan: [""],
                            commonDiagnoses: [""],
                            commonTests: [""],
                            commonMedications: [""],
                          });
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                      >
                        <Plus size={18} />
                        Create Custom
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isCreatingTemplate ? (
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">
                      {editingTemplate ? "Edit Template" : "Create New Template"}
                    </h4>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      aria-label="Close template editor"
                      title="Close template editor"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="template-name" className="block text-sm font-medium mb-2">Template Name *</label>
                      <input
                        id="template-name"
                        type="text"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                        placeholder="e.g., Cardiology Consultation Form"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label htmlFor="template-description" className="block text-sm font-medium mb-2">Description</label>
                      <input
                        id="template-description"
                        type="text"
                        value={templateForm.description}
                        onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                        placeholder="Brief description of this template"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label htmlFor="template-chief-complaint" className="block text-sm font-medium mb-2">Chief Complaint</label>
                      <textarea
                        id="template-chief-complaint"
                        value={templateForm.chiefComplaint}
                        onChange={(e) => setTemplateForm({ ...templateForm, chiefComplaint: e.target.value })}
                        placeholder="Default chief complaint text"
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label htmlFor="template-hpi" className="block text-sm font-medium mb-2">History of Present Illness</label>
                      <textarea
                        id="template-hpi"
                        value={templateForm.historyOfPresentIllness}
                        onChange={(e) => setTemplateForm({ ...templateForm, historyOfPresentIllness: e.target.value })}
                        placeholder="Default HPI text"
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Review of Systems</label>
                      {templateForm.reviewOfSystems.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleUpdateArrayItem("reviewOfSystems", index, e.target.value)}
                            placeholder="Review item"
                            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <button
                            onClick={() => handleRemoveArrayItem("reviewOfSystems", index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            aria-label={`Remove review of systems item ${index + 1}`}
                            title={`Remove review of systems item ${index + 1}`}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayItem("reviewOfSystems", "")}
                        className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Physical Examination</label>
                      {templateForm.physicalExamination.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleUpdateArrayItem("physicalExamination", index, e.target.value)}
                            placeholder="Examination item"
                            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <button
                            onClick={() => handleRemoveArrayItem("physicalExamination", index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            aria-label={`Remove physical examination item ${index + 1}`}
                            title={`Remove physical examination item ${index + 1}`}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayItem("physicalExamination", "")}
                        className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div>
                      <label htmlFor="template-assessment" className="block text-sm font-medium mb-2">Assessment</label>
                      <textarea
                        id="template-assessment"
                        value={templateForm.assessment}
                        onChange={(e) => setTemplateForm({ ...templateForm, assessment: e.target.value })}
                        placeholder="Default assessment text"
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Plan</label>
                      {templateForm.plan.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleUpdateArrayItem("plan", index, e.target.value)}
                            placeholder="Plan item"
                            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <button
                            onClick={() => handleRemoveArrayItem("plan", index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            aria-label={`Remove plan item ${index + 1}`}
                            title={`Remove plan item ${index + 1}`}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayItem("plan", "")}
                        className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Common Diagnoses</label>
                      {templateForm.commonDiagnoses.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleUpdateArrayItem("commonDiagnoses", index, e.target.value)}
                            placeholder="Diagnosis"
                            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <button
                            onClick={() => handleRemoveArrayItem("commonDiagnoses", index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            aria-label={`Remove common diagnosis item ${index + 1}`}
                            title={`Remove common diagnosis item ${index + 1}`}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayItem("commonDiagnoses", "")}
                        className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Common Tests</label>
                      {templateForm.commonTests.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleUpdateArrayItem("commonTests", index, e.target.value)}
                            placeholder="Test name"
                            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <button
                            onClick={() => handleRemoveArrayItem("commonTests", index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            aria-label={`Remove common test item ${index + 1}`}
                            title={`Remove common test item ${index + 1}`}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayItem("commonTests", "")}
                        className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Common Medications</label>
                      {templateForm.commonMedications.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleUpdateArrayItem("commonMedications", index, e.target.value)}
                            placeholder="Medication name"
                            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <button
                            onClick={() => handleRemoveArrayItem("commonMedications", index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            aria-label={`Remove common medication item ${index + 1}`}
                            title={`Remove common medication item ${index + 1}`}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayItem("commonMedications", "")}
                        className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        onClick={handleSaveTemplate}
                        className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                      >
                        {editingTemplate ? "Update Template" : "Create Template"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {customTemplates.filter(t => !selectedHub || t.hubId === selectedHub || !t.hubId).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {customTemplates
                        .filter(t => !selectedHub || t.hubId === selectedHub || !t.hubId)
                        .map((template) => (
                          <div
                            key={template.id}
                            className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                                {template.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    {template.description}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  Updated: {new Date(template.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleEditTemplate(template)}
                                className="flex-1 px-3 py-1.5 text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                              >
                                <Edit size={14} className="inline mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="px-3 py-1.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                aria-label={`Delete template: ${template.name}`}
                                title={`Delete template: ${template.name}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                      <FileEdit size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">No templates created yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                        Create custom consultation forms for this hub
                      </p>
                      <button
                        onClick={() => {
                          setIsCreatingTemplate(true);
                          setEditingTemplate(null);
                          setTemplateForm({
                            name: "",
                            description: "",
                            chiefComplaint: "",
                            historyOfPresentIllness: "",
                            reviewOfSystems: [""],
                            physicalExamination: [""],
                            assessment: "",
                            plan: [""],
                            commonDiagnoses: [""],
                            commonTests: [""],
                            commonMedications: [""],
                          });
                        }}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                      >
                        Create Your First Template
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {hubActiveTab === "stats" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-3xl font-bold mb-1">{hubStats.totalPatients}</div>
                  <div className="text-sm opacity-70">Total Patients</div>
                </div>
                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-3xl font-bold mb-1">{hubStats.activeAppointments}</div>
                  <div className="text-sm opacity-70">Active Appointments</div>
                </div>
                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-3xl font-bold mb-1">{currentFunctions.length}</div>
                  <div className="text-sm opacity-70">Custom Functions</div>
                </div>
                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-3xl font-bold mb-1">{currentResources.length}</div>
                  <div className="text-sm opacity-70">Resources</div>
                </div>
                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-3xl font-bold mb-1">{hubQuestionnaires.length}</div>
                  <div className="text-sm opacity-70">Questionnaires</div>
                </div>
                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-3xl font-bold mb-1">{hubCompletedQuestionnaires.length}</div>
                  <div className="text-sm opacity-70">Completed</div>
                </div>
              </div>
              <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <h4 className="font-semibold mb-2">Recent Activity</h4>
                <div className="text-sm opacity-70">{hubStats.recentActivities} activities in the last 7 days</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading hubs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            initializeHubs().finally(() => setLoading(false));
          }}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Medical Hubs</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Specialized care centers organized by medical specialty areas. Add custom functions, notes, and resources to personalize each hub.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{hubs.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Hubs</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search hubs by name, specialty, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          />
        </div>
        {searchTerm && (
          <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            Showing {filteredHubs.length} of {hubs.length} hubs
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedHubs.map((hub) => {
          const functions = hubFunctions[hub.id] || [];
          const colorClass = getHubColorClass(hub.id);

          return (
            <div
              key={hub.id}
              onClick={() => setSelectedHub(hub.id)}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${colorClass}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="w-7 h-7 rounded bg-teal-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{hub.name}</h3>
                  <p className="text-sm opacity-80 line-clamp-2">{hub.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="opacity-70">Specialty hub</span>
                  {functions.length > 0 && (
                    <span className="px-2 py-0.5 bg-white/60 dark:bg-gray-800/60 rounded">
                      {functions.length} {functions.length === 1 ? "function" : "functions"}
                    </span>
                  )}
                </div>
                <ChevronRight size={16} className="opacity-50" />
              </div>
            </div>
          );
        })}
      </div>

      {sortedHubs.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {hubs.length === 0 ? (
            <>
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hubs available</p>
              <p className="text-sm mt-2">Hubs will appear here once loaded from the API</p>
              <button
                onClick={() => {
                  setLoading(true);
                  initializeHubs().then(() => {
                    const loadedHubs = getAllHubsSync();
                    setHubs(loadedHubs);
                    setLoading(false);
                  }).catch(() => setLoading(false));
                }}
                className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                Reload Hubs
              </button>
            </>
          ) : (
            <>
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hubs match your search</p>
              <p className="text-sm mt-2">Try adjusting your search terms</p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Search
              </button>
            </>
          )}
        </div>
      )}

      {/* Template Generator Modal */}
      {showTemplateGenerator && createPortal(
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
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
                aria-label="Close template generator"
                title="Close template generator"
              >
                <X size={20} />
              </button>
            </div>

            {/* Template Customization Options */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Settings size={16} className="text-gray-600 dark:text-gray-400" />
                  Template Customization
                </h4>
                <button
                  onClick={() => {
                    setTemplateCustomization({
                      includeSections: {
                        chiefComplaint: true,
                        hpi: true,
                        reviewOfSystems: true,
                        vitalSigns: true,
                        physicalExam: true,
                        socialHistory: true,
                        familyHistory: true,
                        medicationReconciliation: true,
                        diagnosisCodes: true,
                        assessment: true,
                        plan: true,
                        patientInstructions: true,
                        followUp: true,
                      },
                      includeCommonDiagnoses: true,
                      includeCommonTests: true,
                      includeCommonMedications: true,
                    });
                  }}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Reset to Default
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                {Object.entries(templateCustomization.includeSections).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => {
                        setTemplateCustomization(prev => ({
                          ...prev,
                          includeSections: {
                            ...prev.includeSections,
                            [key]: e.target.checked
                          }
                        }));
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={templateCustomization.includeCommonDiagnoses}
                    onChange={(e) => setTemplateCustomization(prev => ({ ...prev, includeCommonDiagnoses: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Include Common Diagnoses</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={templateCustomization.includeCommonTests}
                    onChange={(e) => setTemplateCustomization(prev => ({ ...prev, includeCommonTests: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Include Common Tests</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={templateCustomization.includeCommonMedications}
                    onChange={(e) => setTemplateCustomization(prev => ({ ...prev, includeCommonMedications: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Include Common Medications</span>
                </label>
              </div>
            </div>

            {/* Recently Used Templates */}
            {recentTemplates.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                  Recently Used
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {recentTemplates.map((specialty) => {
                    const template = getSpecialtyTemplate(specialty);
                    return (
                      <div key={specialty} className="relative group">
                        <button
                          onClick={() => generateTemplateNote(specialty)}
                          className="w-full p-4 border-2 border-amber-200 dark:border-amber-700 rounded-lg hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all text-left"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                            <span className="font-medium text-sm text-amber-700 dark:text-amber-300">
                              {template?.name || specialty}
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={() => generateTemplateNote(specialty, true)}
                          className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-opacity"
                          title="Preview template"
                          aria-label={`Preview ${template?.name || specialty} template`}
                        >
                          <Eye size={14} className="text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Templates Section */}
            {customTemplates.filter(t => !selectedHub || t.hubId === selectedHub || !t.hubId).length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
                  Custom Templates
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                  {customTemplates
                    .filter(t => !selectedHub || t.hubId === selectedHub || !t.hubId)
                    .filter((template) => template && template.id && template.name && template.consultationTemplate)
                    .map((customTemplate) => (
                      <div key={customTemplate.id} className="relative group">
                        <button
                          onClick={() => generateCustomTemplateNote(customTemplate)}
                          className="w-full p-4 border-2 border-purple-200 dark:border-purple-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left"
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
                        <button
                          onClick={() => generateCustomTemplateNote(customTemplate, true)}
                          className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-opacity"
                          title="Preview template"
                          aria-label={`Preview ${customTemplate.name || "custom"} template`}
                        >
                          <Eye size={14} className="text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Specialty Templates Section */}
            <div className={customTemplates.filter(t => !selectedHub || t.hubId === selectedHub || !t.hubId).length > 0 || recentTemplates.length > 0 ? "border-t pt-6" : ""}>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <ClipboardList size={16} className="text-indigo-600 dark:text-indigo-400" />
                All Specialty Templates
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {getAllSpecialties()
                  .filter(s => s !== "other" && !recentTemplates.includes(s))
                  .map((specialty) => {
                    const template = getSpecialtyTemplate(specialty);
                    return (
                      <div key={specialty} className="relative group">
                        <button
                          onClick={() => generateTemplateNote(specialty as SpecialtyType)}
                          className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left"
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
                        <button
                          onClick={() => generateTemplateNote(specialty as SpecialtyType, true)}
                          className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-opacity"
                          title="Preview template"
                          aria-label={`Preview ${template?.name || specialty} template`}
                        >
                          <Eye size={14} className="text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Template Preview Modal */}
      {templatePreview && createPortal(
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setTemplatePreview(null);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Template Preview</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{templatePreview.title}</p>
              </div>
              <button
                onClick={() => setTemplatePreview(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close template preview"
                title="Close template preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FileText size={16} />
                <span>Edit the template below before saving</span>
              </div>
              <textarea
                value={editedTemplateContent}
                onChange={(e) => setEditedTemplateContent(e.target.value)}
                className="w-full h-[60vh] px-4 py-3 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="Template content will appear here..."
              />
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={handleUseTemplateInConsultation}
                  className="px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium transition-colors flex items-center gap-2"
                >
                  <Stethoscope size={18} />
                  Use in Consultation
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setTemplatePreview(null);
                      setEditedTemplateContent("");
                    }}
                    className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Parse template content
                      const parseTemplateContent = (content: string) => {
                        const result: {
                          chiefComplaint: string;
                          historyOfPresentIllness: string;
                          reviewOfSystems: string[];
                          physicalExamination: string[];
                          assessment: string;
                          plan: string[];
                          commonDiagnoses: string[];
                          commonTests: string[];
                          commonMedications: string[];
                        } = {
                          chiefComplaint: "",
                          historyOfPresentIllness: "",
                          reviewOfSystems: [],
                          physicalExamination: [],
                          assessment: "",
                          plan: [],
                          commonDiagnoses: [],
                          commonTests: [],
                          commonMedications: [],
                        };

                        const lines = content.split("\n");
                        let currentSection: string | null = null;
                        let currentText: string[] = [];

                        for (const line of lines) {
                          const upperLine = line.toUpperCase().trim();

                          if (upperLine.includes("CHIEF COMPLAINT")) {
                            if (currentSection && currentText.length > 0) {
                              if (currentSection === "reviewOfSystems" || currentSection === "physicalExamination" || currentSection === "plan" || currentSection === "commonDiagnoses" || currentSection === "commonTests" || currentSection === "commonMedications") {
                                (result[currentSection as keyof typeof result] as string[]).push(...currentText.filter(t => t.trim().replace(/^•\s*/, "")));
                              } else {
                                (result[currentSection as keyof typeof result] as string) = currentText.join("\n").trim();
                              }
                            }
                            currentSection = "chiefComplaint";
                            currentText = [];
                            continue;
                          } else if (upperLine.includes("HISTORY OF PRESENT ILLNESS") || upperLine.includes("HPI")) {
                            if (currentSection && currentText.length > 0) {
                              if (currentSection === "reviewOfSystems" || currentSection === "physicalExamination" || currentSection === "plan" || currentSection === "commonDiagnoses" || currentSection === "commonTests" || currentSection === "commonMedications") {
                                (result[currentSection as keyof typeof result] as string[]).push(...currentText.filter(t => t.trim().replace(/^•\s*/, "")));
                              } else {
                                (result[currentSection as keyof typeof result] as string) = currentText.join("\n").trim();
                              }
                            }
                            currentSection = "historyOfPresentIllness";
                            currentText = [];
                            continue;
                          } else if (upperLine.includes("REVIEW OF SYSTEMS")) {
                            if (currentSection && currentText.length > 0) {
                              if (currentSection === "reviewOfSystems" || currentSection === "physicalExamination" || currentSection === "plan" || currentSection === "commonDiagnoses" || currentSection === "commonTests" || currentSection === "commonMedications") {
                                (result[currentSection as keyof typeof result] as string[]).push(...currentText.filter(t => t.trim().replace(/^•\s*/, "")));
                              } else {
                                (result[currentSection as keyof typeof result] as string) = currentText.join("\n").trim();
                              }
                            }
                            currentSection = "reviewOfSystems";
                            currentText = [];
                            continue;
                          } else if (upperLine.includes("PHYSICAL EXAM")) {
                            if (currentSection && currentText.length > 0) {
                              if (currentSection === "reviewOfSystems" || currentSection === "physicalExamination" || currentSection === "plan" || currentSection === "commonDiagnoses" || currentSection === "commonTests" || currentSection === "commonMedications") {
                                (result[currentSection as keyof typeof result] as string[]).push(...currentText.filter(t => t.trim().replace(/^•\s*/, "")));
                              } else {
                                (result[currentSection as keyof typeof result] as string) = currentText.join("\n").trim();
                              }
                            }
                            currentSection = "physicalExamination";
                            currentText = [];
                            continue;
                          } else if (upperLine.includes("ASSESSMENT")) {
                            if (currentSection && currentText.length > 0) {
                              if (currentSection === "reviewOfSystems" || currentSection === "physicalExamination" || currentSection === "plan" || currentSection === "commonDiagnoses" || currentSection === "commonTests" || currentSection === "commonMedications") {
                                (result[currentSection as keyof typeof result] as string[]).push(...currentText.filter(t => t.trim().replace(/^•\s*/, "")));
                              } else {
                                (result[currentSection as keyof typeof result] as string) = currentText.join("\n").trim();
                              }
                            }
                            currentSection = "assessment";
                            currentText = [];
                            continue;
                          } else if (upperLine.includes("PLAN")) {
                            if (currentSection && currentText.length > 0) {
                              if (currentSection === "reviewOfSystems" || currentSection === "physicalExamination" || currentSection === "plan" || currentSection === "commonDiagnoses" || currentSection === "commonTests" || currentSection === "commonMedications") {
                                (result[currentSection as keyof typeof result] as string[]).push(...currentText.filter(t => t.trim().replace(/^•\s*/, "")));
                              } else {
                                (result[currentSection as keyof typeof result] as string) = currentText.join("\n").trim();
                              }
                            }
                            currentSection = "plan";
                            currentText = [];
                            continue;
                          } else if (upperLine.includes("COMMON DIAGNOSES")) {
                            if (currentSection && currentText.length > 0) {
                              if (currentSection === "reviewOfSystems" || currentSection === "physicalExamination" || currentSection === "plan" || currentSection === "commonDiagnoses" || currentSection === "commonTests" || currentSection === "commonMedications") {
                                (result[currentSection as keyof typeof result] as string[]).push(...currentText.filter(t => t.trim().replace(/^•\s*/, "")));
                              } else {
                                (result[currentSection as keyof typeof result] as string) = currentText.join("\n").trim();
                              }
                            }
                            currentSection = "commonDiagnoses";
                            currentText = [];
                            continue;
                          } else if (upperLine.includes("COMMON TESTS")) {
                            if (currentSection && currentText.length > 0) {
                              if (currentSection === "reviewOfSystems" || currentSection === "physicalExamination" || currentSection === "plan" || currentSection === "commonDiagnoses" || currentSection === "commonTests" || currentSection === "commonMedications") {
                                (result[currentSection as keyof typeof result] as string[]).push(...currentText.filter(t => t.trim().replace(/^•\s*/, "")));
                              } else {
                                (result[currentSection as keyof typeof result] as string) = currentText.join("\n").trim();
                              }
                            }
                            currentSection = "commonTests";
                            currentText = [];
                            continue;
                          } else if (upperLine.includes("COMMON MEDICATIONS")) {
                            if (currentSection && currentText.length > 0) {
                              if (currentSection === "reviewOfSystems" || currentSection === "physicalExamination" || currentSection === "plan" || currentSection === "commonDiagnoses" || currentSection === "commonTests" || currentSection === "commonMedications") {
                                (result[currentSection as keyof typeof result] as string[]).push(...currentText.filter(t => t.trim().replace(/^•\s*/, "")));
                              } else {
                                (result[currentSection as keyof typeof result] as string) = currentText.join("\n").trim();
                              }
                            }
                            currentSection = "commonMedications";
                            currentText = [];
                            continue;
                          }

                          if (currentSection && line.trim() && !line.trim().endsWith(":")) {
                            currentText.push(line);
                          }
                        }

                        // Save last section
                        if (currentSection && currentText.length > 0) {
                          if (currentSection === "reviewOfSystems" || currentSection === "physicalExamination" || currentSection === "plan" || currentSection === "commonDiagnoses" || currentSection === "commonTests" || currentSection === "commonMedications") {
                            (result[currentSection as keyof typeof result] as string[]).push(...currentText.filter(t => t.trim().replace(/^•\s*/, "")));
                          } else {
                            (result[currentSection as keyof typeof result] as string) = currentText.join("\n").trim();
                          }
                        }

                        return result;
                      };

                      const parsed = parseTemplateContent(editedTemplateContent);

                      // Save as custom template
                      const customTemplate: CustomConsultationTemplate = {
                        id: `template-${Date.now()}`,
                        name: templatePreview.title,
                        description: `Generated template${templatePreview.specialty ? ` from ${getSpecialtyTemplate(templatePreview.specialty)?.name}` : ""}`,
                        hubId: selectedHub || undefined,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        consultationTemplate: {
                          chiefComplaint: parsed.chiefComplaint,
                          historyOfPresentIllness: parsed.historyOfPresentIllness,
                          reviewOfSystems: parsed.reviewOfSystems.filter(s => s.trim()),
                          physicalExamination: parsed.physicalExamination.filter(s => s.trim()),
                          assessment: parsed.assessment,
                          plan: parsed.plan.filter(s => s.trim()),
                          commonDiagnoses: parsed.commonDiagnoses.filter(s => s.trim()),
                          commonTests: parsed.commonTests.filter(s => s.trim()),
                          commonMedications: parsed.commonMedications.filter(s => s.trim()),
                        }
                      };
                      setCustomTemplates(prev => [...prev, customTemplate]);
                      setTemplatePreview(null);
                      setEditedTemplateContent("");
                    }}
                    className="px-5 py-2.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 font-medium transition-colors flex items-center gap-2"
                  >
                    <Save size={18} />
                    Save Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Surgical Notes Form Modal */}
      {showAddSurgicalForm && selectedPatient && createPortal(
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddSurgicalForm(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create Surgical Note</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">For {selectedPatient.name}</p>
              </div>
              <button
                onClick={() => setShowAddSurgicalForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSurgicalNote} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="surgical-date" className="block text-sm font-medium mb-1">Date <span className="text-red-500">*</span></label>
                  <input
                    id="surgical-date"
                    type="date"
                    required
                    value={surgicalFormData.date}
                    onChange={(e) => setSurgicalFormData({ ...surgicalFormData, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div>
                  <FormAutocomplete
                    value={surgicalFormData.procedureName}
                    onChange={(value) => setSurgicalFormData({ ...surgicalFormData, procedureName: value })}
                    options={commonProcedures}
                    placeholder="Procedure Name"
                    label="Procedure Name"
                    required
                    fieldName="procedureName"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="surgical-procedure-type" className="block text-sm font-medium mb-1">Procedure Type</label>
                  <select
                    id="surgical-procedure-type"
                    value={surgicalFormData.procedureType}
                    onChange={(e) => setSurgicalFormData({ ...surgicalFormData, procedureType: e.target.value as SurgicalProcedureType })}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    aria-label="Procedure type"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="elective">Elective</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="surgical-status" className="block text-sm font-medium mb-1">Status</label>
                  <select
                    id="surgical-status"
                    value={surgicalFormData.status}
                    onChange={(e) => setSurgicalFormData({ ...surgicalFormData, status: e.target.value as SurgicalStatus })}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    aria-label="Surgical status"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="postponed">Postponed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <UserAssignment
                    assignedTo={surgicalFormData.surgeonId}
                    onAssign={(userId: string | null) => setSurgicalFormData({ ...surgicalFormData, surgeonId: userId })}
                    placeholder="Select surgeon"
                    label="Surgeon"
                  />
                </div>
                <div>
                  <UserAssignment
                    assignedTo={surgicalFormData.anesthesiologistId}
                    onAssign={(userId: string | null) => setSurgicalFormData({ ...surgicalFormData, anesthesiologistId: userId })}
                    placeholder="Select anesthesiologist"
                    label="Anesthesiologist"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Indication</label>
                <textarea
                  value={surgicalFormData.indication}
                  onChange={(e) => setSurgicalFormData({ ...surgicalFormData, indication: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Reason for surgery..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Procedure Description</label>
                <textarea
                  value={surgicalFormData.procedureDescription}
                  onChange={(e) => setSurgicalFormData({ ...surgicalFormData, procedureDescription: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Describe the procedure..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
                >
                  Create Surgical Note
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSurgicalForm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Surgical Note Details Modal */}
      {showSurgicalDetailsModal && selectedSurgicalNote && createPortal(
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSurgicalDetailsModal(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Surgical Note Details</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedSurgicalNote.procedureName}</p>
              </div>
              <button
                onClick={() => setShowSurgicalDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Date</label>
                  <p className="text-sm font-medium">{new Date(selectedSurgicalNote.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Status</label>
                  <p className="text-sm font-medium">{selectedSurgicalNote.status}</p>
                </div>
                {selectedSurgicalNote.surgeon && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Surgeon</label>
                    <p className="text-sm font-medium">{selectedSurgicalNote.surgeon}</p>
                  </div>
                )}
                {selectedSurgicalNote.operatingRoom && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Operating Room</label>
                    <p className="text-sm font-medium">{selectedSurgicalNote.operatingRoom}</p>
                  </div>
                )}
              </div>

              {selectedSurgicalNote.indication && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Indication</label>
                  <p className="text-sm mt-1">{selectedSurgicalNote.indication}</p>
                </div>
              )}

              {selectedSurgicalNote.procedureDescription && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Procedure Description</label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedSurgicalNote.procedureDescription}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handlePrintSurgicalNote(selectedSurgicalNote)}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Printer size={16} />
                  Print
                </button>
                <button
                  onClick={() => setShowSurgicalDetailsModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
