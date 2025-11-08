import { useState, useMemo, useEffect } from "react";
import { FileText, Plus, User, Calendar, Printer, X, Zap, Copy, RotateCcw, Save } from "lucide-react";
import { Patient, ClinicalNote } from "../types";
import { useDashboard } from "../context/DashboardContext";
import { sortByDateDesc } from "../utils/patientUtils";
import { getOrganizationHeader, getOrganizationFooter } from "../utils/organization";
import FormAutocomplete from "./FormAutocomplete";
import InteractiveNoteEditor from "./InteractiveNoteEditor";
import FormProgressIndicator from "./FormProgressIndicator";
import { commonDiagnoses, commonSymptoms, getPatientHistorySuggestions } from "../utils/formHelpers";
import { useFormDraft } from "../hooks/useFormDraft";
import { useToast } from "../context/ToastContext";
import {
  getMeasurementSystem,
  formatTemperature,
} from "../utils/measurements";
import { openPrintWindow } from "../utils/popupHandler";
import PrintPreview from "./PrintPreview";
import { logger } from "../utils/logger";
import { processTemplateShortcuts, hasShortcuts } from "../utils/templateShortcuts";
import TemplateShortcutsHelper from "./TemplateShortcutsHelper";

interface ClinicalNotesProps {
  patient: Patient;
  onNoteAdded?: (note: ClinicalNote) => void;
}

export default function ClinicalNotes({ patient, onNoteAdded }: ClinicalNotesProps) {
  const { addClinicalNote } = useDashboard();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [printPreview, setPrintPreview] = useState<{ content: string; title: string } | null>(null);
  const [measurementSystem, setMeasurementSystem] = useState(() => getMeasurementSystem());
  const [hasDraft, setHasDraft] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "visit" as "visit" | "consultation" | "procedure" | "follow-up" | "general_consultation" | "specialty_consultation",
    chiefComplaint: "",
    vitalSigns: "",
    hpi: "",
    physicalExam: "",
    assessment: "",
    plan: "",
  });

  // Auto-save draft
  const { clearDraft, getDraft } = useFormDraft(`clinical_note_${patient.id}`, formData, open);

  // Restore draft when modal opens
  useEffect(() => {
    if (open && !hasDraft) {
      const draft = getDraft();
      if (draft && Object.values(draft).some(v => v && (typeof v === 'string' ? v.trim().length > 0 : true))) {
        setFormData(draft);
        setHasDraft(true);
        toast.info("Draft restored", { duration: 3000 });
      }
    }
  }, [open]);

  // Check for draft on mount
  useEffect(() => {
    const draft = getDraft();
    if (draft && Object.values(draft).some(v => v && (typeof v === 'string' ? v.trim().length > 0 : true))) {
      setHasDraft(true);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const form = document.querySelector('form');
        if (form) {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        }
      }
      // Escape to close
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

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
      },
      medications: activeMeds.length > 0 ? activeMeds.map(m => m.name).join(", ") : "",
      allergies: allergies.length > 0 ? allergies.join(", ") : "",
      condition: patient.condition || "",
    };
  }, [patient, measurementSystem]);

  // Quick fill functions
  const quickFillVitals = () => {
    setFormData(prev => ({
      ...prev,
      vitalSigns: `BP: ${patientData.vitals.bp}, HR: ${patientData.vitals.hr}, RR: ${patientData.vitals.rr}, Temp: ${patientData.vitals.temp}, O2 Sat: ${patientData.vitals.o2sat}%`,
    }));
  };

  const quickFillMedications = () => {
    if (patientData.medications) {
      setFormData(prev => ({
        ...prev,
        plan: prev.plan ? `${prev.plan}\n\nCurrent Medications:\n${patientData.medications}` : `Current Medications:\n${patientData.medications}`,
      }));
    }
  };

  const quickFillAllergies = () => {
    if (patientData.allergies) {
      setFormData(prev => ({
        ...prev,
        hpi: prev.hpi ? `${prev.hpi}\n\nAllergies: ${patientData.allergies}` : `Allergies: ${patientData.allergies}`,
      }));
    }
  };

  const combineSOAPSections = (): string => {
    return `CHIEF COMPLAINT:
${formData.chiefComplaint || "Not specified"}

HISTORY OF PRESENT ILLNESS:
${formData.hpi || "Not documented"}

VITAL SIGNS:
${formData.vitalSigns || "Not recorded"}

PHYSICAL EXAMINATION:
${formData.physicalExam || "Not performed"}

ASSESSMENT:
${formData.assessment || "Pending assessment"}

PLAN:
${formData.plan || "Pending plan"}`;
  };

  // Copy from last note
  const copyFromLastNote = () => {
    const lastNote = patient.clinicalNotes?.[0];
    if (lastNote) {
      const parsed = parseNoteContent(lastNote.content);
      setFormData(prev => ({
        ...prev,
        chiefComplaint: parsed.chiefComplaint || prev.chiefComplaint,
        hpi: parsed.hpi || prev.hpi,
        physicalExam: parsed.physicalExam || prev.physicalExam,
        assessment: parsed.assessment || prev.assessment,
        plan: parsed.plan || prev.plan,
      }));
      toast.success("Copied sections from last note");
    } else {
      toast.warning("No previous note found");
    }
  };

  const parseNoteContent = (content: string) => {
    const sections: Record<string, string> = {};
    const lines = content.split("\n");
    let currentSection: string | null = null;
    let currentText: string[] = [];

    for (const line of lines) {
      const upperLine = line.toUpperCase().trim();
      
      if (upperLine.includes("CHIEF COMPLAINT")) {
        if (currentSection) sections[currentSection] = currentText.join("\n").trim();
        currentSection = "chiefComplaint";
        currentText = [];
        continue;
      } else if (upperLine.includes("HISTORY OF PRESENT ILLNESS") || upperLine.includes("HPI")) {
        if (currentSection) sections[currentSection] = currentText.join("\n").trim();
        currentSection = "hpi";
        currentText = [];
        continue;
      } else if (upperLine.includes("PHYSICAL EXAM")) {
        if (currentSection) sections[currentSection] = currentText.join("\n").trim();
        currentSection = "physicalExam";
        currentText = [];
        continue;
      } else if (upperLine.includes("ASSESSMENT")) {
        if (currentSection) sections[currentSection] = currentText.join("\n").trim();
        currentSection = "assessment";
        currentText = [];
        continue;
      } else if (upperLine.includes("PLAN")) {
        if (currentSection) sections[currentSection] = currentText.join("\n").trim();
        currentSection = "plan";
        currentText = [];
        continue;
      }

      if (currentSection && line.trim()) {
        currentText.push(line);
      }
    }

    if (currentSection) {
      sections[currentSection] = currentText.join("\n").trim();
    }

    return sections;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine SOAP sections if content is empty
    let finalContent = formData.content;
    if (!finalContent || finalContent.trim() === "") {
      finalContent = combineSOAPSections();
    }
    
    // Process template shortcuts before saving
    if (hasShortcuts(finalContent)) {
      finalContent = processTemplateShortcuts(finalContent, patient);
    }
    
    // Also process shortcuts in individual sections
    let processedHpi = formData.hpi;
    if (hasShortcuts(processedHpi)) {
      processedHpi = processTemplateShortcuts(processedHpi, patient);
    }
    
    let processedAssessment = formData.assessment;
    if (hasShortcuts(processedAssessment)) {
      processedAssessment = processTemplateShortcuts(processedAssessment, patient);
    }
    
    let processedPlan = formData.plan;
    if (hasShortcuts(processedPlan)) {
      processedPlan = processTemplateShortcuts(processedPlan, patient);
    }
    
    // Combine processed sections if content was empty
    if (!formData.content || formData.content.trim() === "") {
      finalContent = [
        processedHpi && `History of Present Illness:\n${processedHpi}`,
        formData.physicalExam && `Physical Exam:\n${formData.physicalExam}`,
        processedAssessment && `Assessment:\n${processedAssessment}`,
        processedPlan && `Plan:\n${processedPlan}`,
      ].filter(Boolean).join("\n\n");
    }
    
    const noteTitle = formData.title || `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} Note`;
    const noteDate = new Date().toISOString().split("T")[0];
    
    // Create local note for immediate UI update
    const newNote: ClinicalNote = {
      id: `note-${Date.now()}`,
      date: noteDate,
      author: "Dr. Current User",
      title: noteTitle,
      content: finalContent,
      type: formData.type,
    };

    // Save to context immediately
    addClinicalNote(patient.id, newNote);

    // Also call callback if provided
    if (onNoteAdded) {
      onNoteAdded(newNote);
    }

    // Try to save to API if authenticated
    try {
      const { clinicalNoteService } = await import("../services/clinical-notes");
      await clinicalNoteService.createNote(patient.id, {
        title: noteTitle,
        content: finalContent,
        date: noteDate,
        type: formData.type === "follow-up" ? "follow_up" : formData.type,
      });
    } catch (apiError) {
      // API save failed, but continue with local update
      logger.warn('Failed to save clinical note to API, using local update only:', apiError);
    }

    // Clear draft on successful save
    clearDraft();
    setHasDraft(false);
    setFormData({ 
      title: "", 
      content: "", 
      type: "visit",
      chiefComplaint: "",
      vitalSigns: "",
      hpi: "",
      physicalExam: "",
      assessment: "",
      plan: "",
    });
    setOpen(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "visit":
        return "bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200";
      case "consultation":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      case "procedure":
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      case "follow-up":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  const handlePrintNote = (note: ClinicalNote) => {
    const orgHeader = getOrganizationHeader();
    const orgFooter = getOrganizationFooter();

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Clinical Note - ${note.title}</title>
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
            <h1>CLINICAL NOTE</h1>
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
              <div class="info-label">Note Type</div>
              <div class="info-value">${note.type.charAt(0).toUpperCase() + note.type.slice(1).replace('-', ' ')}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date</div>
              <div class="info-value">${new Date(note.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
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

    // Show print preview instead of printing directly
    setPrintPreview({
      content: printContent,
      title: `Clinical Note - ${note.title}`
    });
  };

  const handlePrintFromPreview = () => {
    if (!printPreview) return;
    openPrintWindow(printPreview.content, printPreview.title);
  };

  return (
    <div className="p-4 border rounded-lg dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Clinical Notes</h3>
        <button
          onClick={() => setOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Add Note
        </button>
      </div>

      <div className="space-y-3">
        {patient.clinicalNotes && patient.clinicalNotes.length > 0 ? (
          sortByDateDesc(patient.clinicalNotes).map((note) => (
            <div
              key={note.id}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-2"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-primary-600 dark:text-primary-400" />
                  <h4 className="font-semibold">{note.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintNote(note)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Print note"
                  >
                    <Printer size={14} />
                  </button>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(note.type)}`}>
                    {note.type}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{note.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User size={12} />
                  <span>{note.author}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No clinical notes available
          </p>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-semibold">Add Clinical Note</h4>
                  <TemplateShortcutsHelper
                    onShortcutSelect={(shortcut) => {
                      // Insert shortcut into content field
                      setFormData(prev => ({ 
                        ...prev, 
                        content: (prev.content || "") + (prev.content ? " " : "") + shortcut + " "
                      }));
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Structured clinical documentation with SOAP format. Use shortcuts like #diabetes or @bp
                </p>
              </div>
              <div className="flex items-center gap-2">
                {hasDraft && (
                  <button
                    type="button"
                    onClick={() => {
                      clearDraft();
                      setHasDraft(false);
                      setFormData({ 
                        title: "", 
                        content: "", 
                        type: "visit",
                        chiefComplaint: "",
                        vitalSigns: "",
                        hpi: "",
                        physicalExam: "",
                        assessment: "",
                        plan: "",
                      });
                      toast.success("Draft cleared");
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Clear draft"
                  >
                    <RotateCcw size={12} />
                    Clear Draft
                  </button>
                )}
                {patient.clinicalNotes && patient.clinicalNotes.length > 0 && (
                  <button
                    type="button"
                    onClick={copyFromLastNote}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                    title="Copy from last note"
                  >
                    <Copy size={12} />
                    Copy Last
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form Progress Indicator */}
              <FormProgressIndicator
                sections={[
                  { id: "basic", label: "Basic Info", fields: ["title", "type"] },
                  { id: "soap", label: "SOAP Sections", fields: ["chiefComplaint", "hpi", "physicalExam", "assessment", "plan"] },
                  { id: "content", label: "Full Content", fields: ["content"] },
                ]}
                formData={formData}
                requiredFields={["title", "content"]}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Note Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Follow-up Visit - Diabetes Management"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Note Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "visit" | "consultation" | "procedure" | "follow-up" | "general_consultation" | "specialty_consultation",
                      })
                    }
                    className="input-base"
                  >
                    <option value="visit">Visit</option>
                    <option value="consultation">Consultation</option>
                    <option value="procedure">Procedure</option>
                    <option value="follow-up">Follow-up</option>
                  </select>
                </div>
              </div>

              {/* SOAP Note Structure */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-1">S</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Subjective</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-1">O</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Objective</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">A</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Assessment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">P</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Plan</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const combined = combineSOAPSections();
                      setFormData(prev => ({ ...prev, content: combined }));
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                  >
                    <Copy size={12} />
                    Combine SOAP
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormAutocomplete
                      value={formData.chiefComplaint}
                      onChange={(value) => setFormData({ ...formData, chiefComplaint: value })}
                      options={[...commonSymptoms, ...getPatientHistorySuggestions("diagnosis", patient)]}
                      placeholder="Primary reason for visit (e.g., chest pain, headache)"
                      label="Chief Complaint"
                      fieldName="chiefComplaint"
                      maxSuggestions={8}
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
                      value={formData.vitalSigns}
                      onChange={(e) => setFormData({ ...formData, vitalSigns: e.target.value })}
                      placeholder="BP, HR, RR, Temp, O2 Sat, Weight"
                      className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-primary-600 dark:text-primary-400">
                      History of Present Illness (HPI)
                    </label>
                    {patientData.allergies && (
                      <button
                        type="button"
                        onClick={quickFillAllergies}
                        className="flex items-center gap-1 px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-200 dark:hover:bg-primary-800"
                        title="Add allergies"
                      >
                        <Zap size={10} />
                        Add Allergies
                      </button>
                    )}
                  </div>
                  <textarea
                    value={formData.hpi}
                    onChange={(e) => setFormData({ ...formData, hpi: e.target.value })}
                    placeholder="Detailed history, onset, duration, severity, associated symptoms..."
                    rows={3}
                    className="input-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-orange-600 dark:text-orange-400">
                    Physical Examination
                  </label>
                  <textarea
                    value={formData.physicalExam}
                    onChange={(e) => setFormData({ ...formData, physicalExam: e.target.value })}
                    placeholder="Physical exam findings, system review..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <FormAutocomplete
                    value={formData.assessment.split('\n')[0]}
                    onChange={(value) => {
                      const currentDetails = formData.assessment.split('\n').slice(1).join('\n');
                      setFormData({ 
                        ...formData, 
                        assessment: currentDetails ? `${value}\n${currentDetails}` : value 
                      });
                    }}
                    options={[...commonDiagnoses, ...getPatientHistorySuggestions("diagnosis", patient)]}
                    placeholder="Clinical assessment, differential diagnoses..."
                    label="Assessment & Diagnosis"
                    fieldName="assessment"
                    maxSuggestions={10}
                    className="mb-2"
                  />
                  <textarea
                    value={formData.assessment}
                    onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                    placeholder="Add detailed assessment notes..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-purple-600 dark:text-purple-400">
                      Plan
                    </label>
                    {patientData.medications && (
                      <button
                        type="button"
                        onClick={quickFillMedications}
                        className="flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800"
                        title="Add current medications"
                      >
                        <Zap size={10} />
                        Add Meds
                      </button>
                    )}
                  </div>
                  <textarea
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    placeholder="Treatment plan, medications prescribed/changed, tests ordered, referrals, follow-up instructions..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Full Content - Interactive Section-Based Editor */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Full Note Content <span className="text-xs text-gray-500">(Click sections to add content with auto-suggestions)</span>
                </label>
                <InteractiveNoteEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  patient={patient}
                  placeholder="Click on a section to start writing..."
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs">Ctrl</kbd>
                  <span>+</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs">S</kbd>
                  <span>to save</span>
                  <span className="mx-2">•</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs">Esc</kbd>
                  <span>to close</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save size={14} />
                    Save Note
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {printPreview && (
        <PrintPreview
          content={printPreview.content}
          title={printPreview.title}
          onClose={() => setPrintPreview(null)}
          onPrint={handlePrintFromPreview}
        />
      )}
    </div>
  );
}

