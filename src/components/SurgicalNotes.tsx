import { useState } from "react";
import {
  Activity,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  X,
  Printer,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { Patient, SurgicalNote, SurgicalProcedureType, SurgicalStatus } from "../types";
import UserAssignment from "./UserAssignment";
import { useUsers } from "../hooks/useUsers";
import FormAutocomplete from "./FormAutocomplete";
import { commonProcedures, commonDiagnoses, commonSymptoms, anesthesiaTypes, operatingRooms, getPatientHistorySuggestions } from "../utils/formHelpers";
import PrintPreview from "./PrintPreview";
import { openPrintWindow } from "../utils/popupHandler";

interface SurgicalNotesProps {
  patient?: Patient;
}

export default function SurgicalNotes({ patient }: SurgicalNotesProps) {
  const { selectedPatient, addTimelineEvent } = useDashboard();
  const currentPatient = patient || selectedPatient;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SurgicalStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | SurgicalProcedureType>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<SurgicalNote | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [printPreview, setPrintPreview] = useState<{ content: string; title: string } | null>(null);

  const { users } = useUsers();
  const [surgicalNotes, setSurgicalNotes] = useState<SurgicalNote[]>(
    currentPatient?.surgicalNotes || []
  );

  const [formData, setFormData] = useState({
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

  const filteredNotes = surgicalNotes.filter((note) => {
    const matchesSearch =
      note.procedureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.indication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.preoperativeDiagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || note.status === statusFilter;
    const matchesType = typeFilter === "all" || note.procedureType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: SurgicalStatus) => {
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

  const getTypeColor = (type: SurgicalProcedureType) => {
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
    const surgeon = formData.surgeonId ? users.find(u => u.id === formData.surgeonId) : null;
    const anesthesiologist = formData.anesthesiologistId ? users.find(u => u.id === formData.anesthesiologistId) : null;
    
    const newNote: SurgicalNote = {
      id: `surg-${Date.now()}`,
      date: formData.date,
      procedureName: formData.procedureName,
      procedureType: formData.procedureType,
      status: formData.status,
      surgeon: surgeon ? `${surgeon.firstName} ${surgeon.lastName}` : undefined,
      surgeonId: formData.surgeonId || undefined,
      anesthesiologist: anesthesiologist ? `${anesthesiologist.firstName} ${anesthesiologist.lastName}` : undefined,
      anesthesiologistId: formData.anesthesiologistId || undefined,
      anesthesiaType: formData.anesthesiaType || undefined,
      indication: formData.indication,
      preoperativeDiagnosis: formData.preoperativeDiagnosis,
      postoperativeDiagnosis: formData.postoperativeDiagnosis || undefined,
      procedureDescription: formData.procedureDescription,
      findings: formData.findings || undefined,
      complications: formData.complications || undefined,
      estimatedBloodLoss: formData.estimatedBloodLoss || undefined,
      specimens: formData.specimens.length > 0 ? formData.specimens : undefined,
      drains: formData.drains || undefined,
      postOpInstructions: formData.postOpInstructions || undefined,
      recoveryNotes: formData.recoveryNotes || undefined,
      followUpDate: formData.followUpDate || undefined,
      operatingRoom: formData.operatingRoom || undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
    };

    setSurgicalNotes([...surgicalNotes, newNote]);
    addTimelineEvent(currentPatient.id, {
      date: newNote.date,
      type: "surgery",
      title: newNote.procedureName,
      description: `Status: ${newNote.status} | Type: ${newNote.procedureType}`,
      icon: "scalpel",
    });

    setFormData({
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
    setShowAddForm(false);
  };

  const handlePrintFromPreview = () => {
    if (!printPreview) return;
    openPrintWindow(printPreview.content, printPreview.title);
  };

  const handlePrint = (note: SurgicalNote) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Surgical Note - ${note.procedureName}</title>
          <style>
            @page { margin: 1in; size: letter; }
            body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; color: #1e40af; }
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
          <div class="header">
            <h1>SURGICAL NOTE</h1>
            <h2>${note.procedureName}</h2>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Patient Name</div>
              <div class="info-value">${currentPatient?.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date</div>
              <div class="info-value">${new Date(note.date).toLocaleDateString()}</div>
            </div>
            <div class="info-item">
              <div class="info-label">DOB</div>
              <div class="info-value">${currentPatient?.dob ? new Date(currentPatient.dob).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Address</div>
              <div class="info-value">${currentPatient?.address || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Telephone</div>
              <div class="info-value">${currentPatient?.phone || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">${currentPatient?.email || 'N/A'}</div>
            </div>
            ${note.surgeon ? `
            <div class="info-item">
              <div class="info-label">Surgeon</div>
              <div class="info-value">${note.surgeon}</div>
            </div>
            ` : ""}
            ${note.anesthesiologist ? `
            <div class="info-item">
              <div class="info-label">Anesthesiologist</div>
              <div class="info-value">${note.anesthesiologist}</div>
            </div>
            ` : ""}
            ${note.operatingRoom ? `
            <div class="info-item">
              <div class="info-label">Operating Room</div>
              <div class="info-value">${note.operatingRoom}</div>
            </div>
            ` : ""}
            ${note.duration ? `
            <div class="info-item">
              <div class="info-label">Duration</div>
              <div class="info-value">${note.duration} minutes</div>
            </div>
            ` : ""}
            <div class="info-item">
              <div class="info-label">Procedure Type</div>
              <div class="info-value">${note.procedureType.charAt(0).toUpperCase() + note.procedureType.slice(1)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value">${note.status.charAt(0).toUpperCase() + note.status.slice(1)}</div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Indication</div>
            <div class="content">${note.indication}</div>
          </div>
          <div class="section">
            <div class="section-title">Preoperative Diagnosis</div>
            <div class="content">${note.preoperativeDiagnosis}</div>
          </div>
          ${note.postoperativeDiagnosis ? `
          <div class="section">
            <div class="section-title">Postoperative Diagnosis</div>
            <div class="content">${note.postoperativeDiagnosis}</div>
          </div>
          ` : ""}
          <div class="section">
            <div class="section-title">Procedure Description</div>
            <div class="content">${note.procedureDescription}</div>
          </div>
          ${note.findings ? `
          <div class="section">
            <div class="section-title">Findings</div>
            <div class="content">${note.findings}</div>
          </div>
          ` : ""}
          ${note.complications ? `
          <div class="section">
            <div class="section-title">Complications</div>
            <div class="content">${note.complications}</div>
          </div>
          ` : ""}
          ${note.estimatedBloodLoss ? `
          <div class="section">
            <div class="section-title">Estimated Blood Loss</div>
            <div class="content">${note.estimatedBloodLoss}</div>
          </div>
          ` : ""}
          ${note.specimens && note.specimens.length > 0 ? `
          <div class="section">
            <div class="section-title">Specimens</div>
            <div class="content">${note.specimens.join(", ")}</div>
          </div>
          ` : ""}
          ${note.postOpInstructions ? `
          <div class="section">
            <div class="section-title">Post-operative Instructions</div>
            <div class="content">${note.postOpInstructions}</div>
          </div>
          ` : ""}
          <div class="footer">
            Generated: ${new Date().toLocaleString()}<br>
            Bluequee2.0 - Electronic Health Record System
          </div>
        </body>
      </html>
    `;

    // Show print preview instead of printing directly
    setPrintPreview({
      content: printContent,
      title: `Surgical Note - ${note.procedureName}`
    });
  };

  if (!currentPatient) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium mb-2">No Patient Selected</p>
        <p className="text-sm">Please select a patient to view surgical notes.</p>
      </div>
    );
  }

  return (
    <div className="section-spacing">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Activity className="text-teal-600 dark:text-teal-400" size={24} />
            Surgical Notes
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Surgical documentation for {currentPatient.name}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          New Surgical Note
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search surgical notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SurgicalStatus)}
              className="px-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="postponed">Postponed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as SurgicalProcedureType)}
              className="px-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Activity size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">No Surgical Notes Found</p>
            <p className="text-sm">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No surgical notes have been documented for this patient"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {note.procedureName}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getTypeColor(note.procedureType)}`}>
                        {note.procedureType.toUpperCase()}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(note.status)}`}>
                        {note.status.charAt(0).toUpperCase() + note.status.slice(1).replace("_", " ")}
                      </span>
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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedNote(note);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors text-sm font-medium"
                    >
                      <FileText size={16} />
                      View
                    </button>
                    <button
                      onClick={() => handlePrint(note)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      <Printer size={16} />
                      Print
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Surgical Note Modal - Large form with all surgical documentation fields */}
      {showAddForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddForm(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create Surgical Note</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Document surgical procedure details</p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSurgicalNote} className="p-6 space-y-5">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <FormAutocomplete
                    value={formData.procedureName}
                    onChange={(value) => setFormData({ ...formData, procedureName: value })}
                    options={commonProcedures}
                    placeholder="e.g., Laparoscopic Appendectomy"
                    label="Procedure Name"
                    required
                    fieldName="procedureName"
                    maxSuggestions={12}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Procedure Type <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.procedureType}
                    onChange={(e) => setFormData({ ...formData, procedureType: e.target.value as SurgicalProcedureType })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="elective">Elective</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Status <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SurgicalStatus })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="postponed">Postponed</option>
                  </select>
                </div>
                <div>
                  <FormAutocomplete
                    value={formData.operatingRoom}
                    onChange={(value) => setFormData({ ...formData, operatingRoom: value })}
                    options={operatingRooms}
                    placeholder="OR-1"
                    label="Operating Room"
                    fieldName="operatingRoom"
                    maxSuggestions={6}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Surgeon <span className="text-red-500">*</span></label>
                  <UserAssignment
                    assignedTo={formData.surgeonId}
                    allowedRoles={["physician"]}
                    label=""
                    placeholder="Select surgeon..."
                    onAssign={(userId) => setFormData({ ...formData, surgeonId: userId })}
                  />
                </div>
                <div>
                  <UserAssignment
                    assignedTo={formData.anesthesiologistId}
                    allowedRoles={["physician"]}
                    label="Anesthesiologist (Optional)"
                    placeholder="Select anesthesiologist..."
                    onAssign={(userId) => setFormData({ ...formData, anesthesiologistId: userId })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div>
                  <FormAutocomplete
                    value={formData.anesthesiaType}
                    onChange={(value) => setFormData({ ...formData, anesthesiaType: value })}
                    options={anesthesiaTypes}
                    placeholder="General, Regional, etc."
                    label="Anesthesia Type"
                    fieldName="anesthesiaType"
                    maxSuggestions={6}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <FormAutocomplete
                  value={formData.indication}
                  onChange={(value) => setFormData({ ...formData, indication: value })}
                  options={[...commonSymptoms, ...commonDiagnoses, ...getPatientHistorySuggestions("diagnosis", currentPatient)]}
                  placeholder="Reason for surgery..."
                  label="Indication"
                  required
                  fieldName="indication"
                  maxSuggestions={10}
                  className="mb-2"
                />
                <textarea
                  required
                  value={formData.indication}
                  onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                  placeholder="Add detailed indication..."
                  rows={2}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div>
                <FormAutocomplete
                  value={formData.preoperativeDiagnosis}
                  onChange={(value) => setFormData({ ...formData, preoperativeDiagnosis: value })}
                  options={[...commonDiagnoses, ...getPatientHistorySuggestions("diagnosis", currentPatient)]}
                  placeholder="Preoperative diagnosis..."
                  label="Preoperative Diagnosis"
                  required
                  fieldName="preoperativeDiagnosis"
                  maxSuggestions={10}
                />
              </div>

              <div>
                <FormAutocomplete
                  value={formData.postoperativeDiagnosis}
                  onChange={(value) => setFormData({ ...formData, postoperativeDiagnosis: value })}
                  options={[...commonDiagnoses, ...getPatientHistorySuggestions("diagnosis", currentPatient)]}
                  placeholder="Postoperative diagnosis..."
                  label="Postoperative Diagnosis"
                  fieldName="postoperativeDiagnosis"
                  maxSuggestions={10}
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Procedure Description <span className="text-red-500">*</span></label>
                <textarea
                  required
                  value={formData.procedureDescription}
                  onChange={(e) => setFormData({ ...formData, procedureDescription: e.target.value })}
                  placeholder="Detailed description of the procedure performed..."
                  rows={5}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Findings</label>
                <textarea
                  value={formData.findings}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                  placeholder="Intraoperative findings..."
                  rows={3}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Estimated Blood Loss</label>
                  <input
                    type="text"
                    value={formData.estimatedBloodLoss}
                    onChange={(e) => setFormData({ ...formData, estimatedBloodLoss: e.target.value })}
                    placeholder="e.g., Minimal (<50ml)"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="45"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Specimens</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.currentSpecimen}
                      onChange={(e) => setFormData({ ...formData, currentSpecimen: e.target.value })}
                      placeholder="Enter specimen..."
                      className="flex-1 px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && formData.currentSpecimen.trim()) {
                          e.preventDefault();
                          setFormData({
                            ...formData,
                            specimens: [...formData.specimens, formData.currentSpecimen.trim()],
                            currentSpecimen: "",
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.currentSpecimen.trim()) {
                          setFormData({
                            ...formData,
                            specimens: [...formData.specimens, formData.currentSpecimen.trim()],
                            currentSpecimen: "",
                          });
                        }
                      }}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    >
                      Add
                    </button>
                  </div>
                  {formData.specimens.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.specimens.map((specimen, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-lg text-sm"
                        >
                          {specimen}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                specimens: formData.specimens.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-blue-300"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Complications</label>
                <textarea
                  value={formData.complications}
                  onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
                  placeholder="Any complications encountered..."
                  rows={2}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Drains</label>
                <input
                  type="text"
                  value={formData.drains}
                  onChange={(e) => setFormData({ ...formData, drains: e.target.value })}
                  placeholder="Type and location of drains..."
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Post-operative Instructions</label>
                <textarea
                  value={formData.postOpInstructions}
                  onChange={(e) => setFormData({ ...formData, postOpInstructions: e.target.value })}
                  placeholder="Instructions for post-operative care..."
                  rows={3}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Recovery Notes</label>
                <textarea
                  value={formData.recoveryNotes}
                  onChange={(e) => setFormData({ ...formData, recoveryNotes: e.target.value })}
                  placeholder="Recovery room notes..."
                  rows={2}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Follow-up Date</label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 font-medium transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create Surgical Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedNote && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetailsModal(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Surgical Note Details</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedNote.procedureName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(selectedNote)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Print"
                >
                  <Printer size={20} />
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="text-teal-600 dark:text-teal-400" size={16} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Date</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(selectedNote.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="text-purple-600 dark:text-purple-400" size={16} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Type</span>
                  </div>
                  <p className={`text-sm font-semibold ${getTypeColor(selectedNote.procedureType)}`}>
                    {selectedNote.procedureType.toUpperCase()}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</span>
                  </div>
                  <p className={`text-sm font-semibold ${getStatusColor(selectedNote.status)}`}>
                    {selectedNote.status.charAt(0).toUpperCase() + selectedNote.status.slice(1).replace("_", " ")}
                  </p>
                </div>
                {selectedNote.duration && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="text-orange-600 dark:text-orange-400" size={16} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Duration</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {selectedNote.duration} min
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Indication</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedNote.indication}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Preoperative Diagnosis</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedNote.preoperativeDiagnosis}</p>
              </div>

              {selectedNote.postoperativeDiagnosis && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Postoperative Diagnosis</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedNote.postoperativeDiagnosis}</p>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Procedure Description</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedNote.procedureDescription}</p>
              </div>

              {selectedNote.findings && (
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Findings</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedNote.findings}</p>
                </div>
              )}

              {selectedNote.complications && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Complications</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedNote.complications}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedNote.surgeon && (
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Surgeon:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedNote.surgeon}</span>
                  </div>
                )}
                {selectedNote.anesthesiologist && (
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Anesthesiologist:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedNote.anesthesiologist}</span>
                  </div>
                )}
                {selectedNote.estimatedBloodLoss && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Blood Loss:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedNote.estimatedBloodLoss}</span>
                  </div>
                )}
                {selectedNote.operatingRoom && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">OR:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedNote.operatingRoom}</span>
                  </div>
                )}
              </div>

              {selectedNote.specimens && selectedNote.specimens.length > 0 && (
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Specimens</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedNote.specimens.join(", ")}</p>
                </div>
              )}

              {selectedNote.postOpInstructions && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Post-operative Instructions</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedNote.postOpInstructions}</p>
                </div>
              )}

              {selectedNote.recoveryNotes && (
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Recovery Notes</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedNote.recoveryNotes}</p>
                </div>
              )}
            </div>
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

