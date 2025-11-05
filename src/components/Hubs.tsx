import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { getAllHubs, getHubById, HubId, getHubColorClass } from "../data/hubs";
import { getSpecialtyTemplate } from "../data/specialtyTemplates";
import { useDashboard } from "../context/DashboardContext";
import { filterPatientsByHub, getHubStats, getHubQuickActions } from "../utils/hubIntegration";
import { getQuestionnairesByHub, Questionnaire, Question } from "../data/questionnaires";
import { CustomConsultationTemplate } from "../types";

interface HubFunction {
  id: string;
  name: string;
  description: string;
  category?: string;
}

interface HubNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface HubResource {
  id: string;
  title: string;
  type: "protocol" | "guideline" | "reference" | "tool" | "link";
  url?: string;
  description?: string;
}

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
  const { patients, setSelectedPatient, setActiveTab } = useDashboard();
  const [selectedHub, setSelectedHub] = useState<HubId | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hubActiveTab, setHubActiveTab] = useState<"overview" | "functions" | "notes" | "resources" | "team" | "stats" | "questionnaires" | "templates">("overview");
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({});
  const [viewingCompletedQuestionnaire, setViewingCompletedQuestionnaire] = useState<any | null>(null);
  const [completedQuestionnaires, setCompletedQuestionnaires] = useState<Record<string, any[]>>(() => {
    try {
      const saved = localStorage.getItem("completedQuestionnaires");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  const [hubFunctions, setHubFunctions] = useState<HubFunctions>(() => {
    try {
      const saved = localStorage.getItem("hubFunctions");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [hubNotes, setHubNotes] = useState<HubNotes>(() => {
    try {
      const saved = localStorage.getItem("hubNotes");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [hubResources, setHubResources] = useState<HubResources>(() => {
    try {
      const saved = localStorage.getItem("hubResources");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [hubTeamMembers] = useState<HubTeamMembers>(() => {
    try {
      const saved = localStorage.getItem("hubTeamMembers");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [customTemplates, setCustomTemplates] = useState<CustomConsultationTemplate[]>(() => {
    try {
      const saved = localStorage.getItem("customConsultationTemplates");
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

  const hubs = getAllHubs();

  useEffect(() => {
    localStorage.setItem("hubFunctions", JSON.stringify(hubFunctions));
  }, [hubFunctions]);

  useEffect(() => {
    localStorage.setItem("hubNotes", JSON.stringify(hubNotes));
  }, [hubNotes]);

  useEffect(() => {
    localStorage.setItem("hubResources", JSON.stringify(hubResources));
  }, [hubResources]);

  useEffect(() => {
    localStorage.setItem("hubTeamMembers", JSON.stringify(hubTeamMembers));
  }, [hubTeamMembers]);

  useEffect(() => {
    localStorage.setItem("completedQuestionnaires", JSON.stringify(completedQuestionnaires));
  }, [completedQuestionnaires]);

  useEffect(() => {
    localStorage.setItem("customConsultationTemplates", JSON.stringify(customTemplates));
  }, [customTemplates]);

  const filteredHubs = useMemo(() => {
    if (!searchTerm) return hubs;
    const term = searchTerm.toLowerCase();
    return hubs.filter(
      (hub) =>
        hub.name.toLowerCase().includes(term) ||
        hub.description.toLowerCase().includes(term)
        // Note: hub.specialties doesn't exist in current Hub interface
        // If needed, add specialties to Hub type or load from API
    );
  }, [searchTerm, hubs]);

  const handleAddFunction = () => {
    if (!selectedHub || !newFunction.name.trim()) return;

    const functionToAdd: HubFunction = {
      id: `func-${Date.now()}`,
      name: newFunction.name.trim(),
      description: newFunction.description.trim(),
      category: newFunction.category.trim() || undefined,
    };

    setHubFunctions((prev) => ({
      ...prev,
      [selectedHub]: [...(prev[selectedHub] || []), functionToAdd],
    }));

    setNewFunction({ name: "", description: "", category: "" });
    setIsAddingFunction(false);
  };

  const handleEditFunction = (func: HubFunction) => {
    setEditingFunction(func);
    setNewFunction({
      name: func.name,
      description: func.description,
      category: func.category || "",
    });
    setIsAddingFunction(true);
  };

  const handleUpdateFunction = () => {
    if (!selectedHub || !editingFunction || !newFunction.name.trim()) return;

    setHubFunctions((prev) => ({
      ...prev,
      [selectedHub]: (prev[selectedHub] || []).map((f) =>
        f.id === editingFunction.id
          ? {
              ...f,
              name: newFunction.name.trim(),
              description: newFunction.description.trim(),
              category: newFunction.category.trim() || undefined,
            }
          : f
      ),
    }));

    setEditingFunction(null);
    setNewFunction({ name: "", description: "", category: "" });
    setIsAddingFunction(false);
  };

  const handleDeleteFunction = (functionId: string) => {
    if (!selectedHub) return;
    setHubFunctions((prev) => ({
      ...prev,
      [selectedHub]: (prev[selectedHub] || []).filter((f) => f.id !== functionId),
    }));
  };

  const handleSaveNote = () => {
    if (!selectedHub || !noteContent.trim()) return;

    const notes = hubNotes[selectedHub] || [];
    const existingNote = notes[0]; // Single note per hub for simplicity

    if (existingNote) {
      setHubNotes((prev) => ({
        ...prev,
        [selectedHub]: [
          {
            ...existingNote,
            content: noteContent.trim(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }));
    } else {
      const newNote: HubNote = {
        id: `note-${Date.now()}`,
        content: noteContent.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setHubNotes((prev) => ({
        ...prev,
        [selectedHub]: [newNote],
      }));
    }

    setIsEditingNote(false);
  };

  const handleAddResource = () => {
    if (!selectedHub || !newResource.title.trim()) return;

    const resourceToAdd: HubResource = {
      id: `resource-${Date.now()}`,
      title: newResource.title.trim(),
      type: newResource.type,
      url: newResource.url.trim() || undefined,
      description: newResource.description.trim() || undefined,
    };

    setHubResources((prev) => ({
      ...prev,
      [selectedHub]: [...(prev[selectedHub] || []), resourceToAdd],
    }));

    setNewResource({ title: "", type: "link", url: "", description: "" });
    setIsAddingResource(false);
  };

  const handleDeleteResource = (resourceId: string) => {
    if (!selectedHub) return;
    setHubResources((prev) => ({
      ...prev,
      [selectedHub]: (prev[selectedHub] || []).filter((r) => r.id !== resourceId),
    }));
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
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                checked={value === false}
                onChange={() => setQuestionnaireAnswers({ ...questionnaireAnswers, [question.id]: false })}
                className="w-4 h-4 text-blue-600"
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
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case "radio":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => setQuestionnaireAnswers({ ...questionnaireAnswers, [question.id]: option.value })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      case "checkbox":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const checkedValues = Array.isArray(value) ? value : [];
              const isChecked = checkedValues.includes(option.value);
              return (
                <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...checkedValues, option.value]
                        : checkedValues.filter((v) => v !== option.value);
                      setQuestionnaireAnswers({ ...questionnaireAnswers, [question.id]: newValues });
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">{option.label}</span>
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
      title: selectedQuestionnaire.title,
      answers: { ...questionnaireAnswers },
      completedAt: new Date().toISOString(),
    };

    setCompletedQuestionnaires((prev) => ({
      ...prev,
      [selectedHub]: [...(prev[selectedHub] || []), completed],
    }));

    setSelectedQuestionnaire(null);
    setQuestionnaireAnswers({});
  };

  const currentHub = selectedHub ? getHubById(selectedHub) : null;
  const currentFunctions = selectedHub ? hubFunctions[selectedHub] || [] : [];
  const currentNotes = selectedHub ? hubNotes[selectedHub] || [] : [];
  const currentResources = selectedHub ? hubResources[selectedHub] || [] : [];
  const currentNote = currentNotes[0];
  const hubQuestionnaires = selectedHub ? getQuestionnairesByHub(selectedHub) : [];
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

        <div className={`rounded-lg border-2 p-6 ${getHubColorClass(currentHub)}`}>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <currentHub.icon size={32} className={getHubColorClass(currentHub).split(" ")[4]} />
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
              { id: "resources", label: "Resources", icon: BookOpen },
              { id: "team", label: "Team", icon: Users },
              { id: "stats", label: "Statistics", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setHubActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  hubActiveTab === tab.id
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
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
                  {currentHub.specialties.map((specialty) => {
                    const template = getSpecialtyTemplate(specialty);
                    return (
                      <span
                        key={specialty}
                        className="px-3 py-1.5 rounded-full bg-white/60 dark:bg-gray-800/60 text-sm font-medium"
                      >
                        {template.name}
                      </span>
                    );
                  })}
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
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {hubPatients.slice(0, 5).map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => {
                          setSelectedPatient(patient);
                          setActiveTab("overview");
                        }}
                        className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
                      >
                        <div className="font-medium text-sm">{patient.name}</div>
                        {patient.condition && (
                          <div className="text-xs opacity-70 mt-1">{patient.condition}</div>
                        )}
                      </div>
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
                  {currentHub.commonConditions.map((condition, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 text-sm"
                    >
                      {condition}
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Treatments */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Common Treatments</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {currentHub.commonTreatments.map((treatment, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 text-sm"
                    >
                      {treatment}
                    </div>
                  ))}
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
                      <label className="block text-sm font-medium mb-1">
                        Function Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newFunction.name}
                        onChange={(e) => setNewFunction({ ...newFunction, name: e.target.value })}
                        placeholder="e.g., Crisis Intervention Protocol"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={newFunction.description}
                        onChange={(e) => setNewFunction({ ...newFunction, description: e.target.value })}
                        placeholder="Describe what this function does..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category (optional)</label>
                      <input
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
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
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
                          >
                            <Edit size={14} className="text-blue-600 dark:text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteFunction(func.id)}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Delete function"
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
                  <textarea
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
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      <Save size={16} />
                      Save Note
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
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
                      <label className="block text-sm font-medium mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newResource.title}
                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                        placeholder="Resource title"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        value={newResource.type}
                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      >
                        <option value="link">Link</option>
                        <option value="protocol">Protocol</option>
                        <option value="guideline">Guideline</option>
                        <option value="reference">Reference</option>
                        <option value="tool">Tool</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">URL (optional)</label>
                      <input
                        type="url"
                        value={newResource.url}
                        onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description (optional)</label>
                      <textarea
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
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
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
                              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
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
                      }}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
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
                          {selectedQuestionnaire.category}
                        </span>
                        {selectedQuestionnaire.estimatedTime && (
                          <span>⏱ {selectedQuestionnaire.estimatedTime} min</span>
                        )}
                      </div>
                    </div>

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
                          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <CheckCircle2 size={16} />
                          Submit Questionnaire
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuestionnaire(null);
                            setQuestionnaireAnswers({});
                          }}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
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
                          <div
                            key={index}
                            className="p-4 bg-gradient-to-r from-green-50/60 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700 cursor-pointer transition-all"
                            onClick={() => setViewingCompletedQuestionnaire(completed)}
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
                          </div>
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
                                  {questionnaire.category}
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
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
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
                    Create and manage custom consultation forms for this hub
                  </p>
                </div>
                {!isCreatingTemplate && (
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
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={18} />
                    Create Template
                  </button>
                )}
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
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Template Name *</label>
                      <input
                        type="text"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                        placeholder="e.g., Cardiology Consultation Form"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <input
                        type="text"
                        value={templateForm.description}
                        onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                        placeholder="Brief description of this template"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Chief Complaint</label>
                      <textarea
                        value={templateForm.chiefComplaint}
                        onChange={(e) => setTemplateForm({ ...templateForm, chiefComplaint: e.target.value })}
                        placeholder="Default chief complaint text"
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">History of Present Illness</label>
                      <textarea
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
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayItem("reviewOfSystems", "")}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
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
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayItem("physicalExamination", "")}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Assessment</label>
                      <textarea
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
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayItem("plan", "")}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
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
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayItem("commonDiagnoses", "")}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
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
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayItem("commonTests", "")}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
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
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayItem("commonMedications", "")}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        onClick={handleSaveTemplate}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                                className="flex-1 px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                              >
                                <Edit size={14} className="inline mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="px-3 py-1.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Medical Hubs</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Specialized care centers organized by medical specialty areas. Add custom functions, notes, and resources to personalize each hub.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHubs.map((hub) => {
          const functions = hubFunctions[hub.id] || [];
          const colorClass = getHubColorClass(hub);
          
          return (
            <div
              key={hub.id}
              onClick={() => setSelectedHub(hub.id)}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${colorClass}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <hub.icon size={28} className={colorClass.split(" ")[4]} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{hub.name}</h3>
                  <p className="text-sm opacity-80 line-clamp-2">{hub.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="opacity-70">{hub.specialties.length} specialties</span>
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

      {filteredHubs.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No hubs found</p>
          <p className="text-sm mt-2">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
}
