import { useState } from "react";
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  X,
  Printer,
  Clock,
  Shield,
} from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { Patient, Consent, ConsentType, ConsentStatus } from "../types";
import UserAssignment from "./UserAssignment";
import { useUsers } from "../hooks/useUsers";

interface ConsentsProps {
  patient?: Patient;
}

export default function Consents({ patient }: ConsentsProps) {
  const { selectedPatient, addTimelineEvent } = useDashboard();
  const currentPatient = patient || selectedPatient;
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ConsentType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ConsentStatus>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { users } = useUsers();
  const [consents, setConsents] = useState<Consent[]>(
    currentPatient?.consents || []
  );

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "procedure" as ConsentType,
    title: "",
    description: "",
    procedureName: "",
    risks: [] as string[],
    benefits: [] as string[],
    alternatives: [] as string[],
    physicianId: null as string | null,
    expirationDate: "",
    notes: "",
    currentRisk: "",
    currentBenefit: "",
    currentAlternative: "",
  });

  const filteredConsents = consents.filter((consent) => {
    const matchesSearch =
      consent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.procedureName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || consent.type === typeFilter;
    const matchesStatus = statusFilter === "all" || consent.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: ConsentStatus) => {
    switch (status) {
      case "signed":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400";
      case "declined":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      case "expired":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400";
      case "revoked":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const getTypeLabel = (type: ConsentType) => {
    return type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const handleAddConsent = (e: React.FormEvent) => {
    e.preventDefault();
    const newConsent: Consent = {
      id: `consent-${Date.now()}`,
      date: formData.date,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      status: "pending",
      procedureName: formData.procedureName || undefined,
      risks: formData.risks.length > 0 ? formData.risks : undefined,
      benefits: formData.benefits.length > 0 ? formData.benefits : undefined,
      alternatives: formData.alternatives.length > 0 ? formData.alternatives : undefined,
      physicianName: formData.physicianId ? users.find(u => u.id === formData.physicianId)?.firstName + " " + users.find(u => u.id === formData.physicianId)?.lastName : undefined,
      physicianId: formData.physicianId || undefined,
      expirationDate: formData.expirationDate || undefined,
      notes: formData.notes || undefined,
    };

    setConsents([...consents, newConsent]);
    addTimelineEvent(currentPatient.id, {
      date: newConsent.date,
      type: "consent",
      title: newConsent.title,
      description: `Status: ${newConsent.status}`,
      icon: "file-check",
    });

    setFormData({
      date: new Date().toISOString().split("T")[0],
      type: "procedure",
      title: "",
      description: "",
      procedureName: "",
      risks: [],
      benefits: [],
      alternatives: [],
      physicianId: null,
      expirationDate: "",
      notes: "",
      currentRisk: "",
      currentBenefit: "",
      currentAlternative: "",
    });
    setShowAddForm(false);
  };

  const handleSignConsent = (consentId: string) => {
    setConsents(consents.map(c => 
      c.id === consentId 
        ? { ...c, status: "signed" as ConsentStatus, signedBy: currentPatient?.name, signedDate: new Date().toISOString().split("T")[0], signedTime: new Date().toTimeString().slice(0, 5) }
        : c
    ));
    setShowDetailsModal(false);
  };

  const handlePrint = (consent: Consent) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Consent Form - ${consent.title}</title>
          <style>
            @page { margin: 1in; size: letter; }
            body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; color: #1e40af; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
            .info-item { padding: 10px; background: #f9fafb; border-radius: 4px; }
            .info-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
            .info-value { font-size: 14px; font-weight: 600; color: #111827; }
            .section { margin: 30px 0; }
            .section-title { font-size: 16px; font-weight: 600; color: #1e40af; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
            .content { background: #f9fafb; padding: 15px; border-radius: 4px; margin: 20px 0; white-space: pre-wrap; }
            .list-item { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .signature-section { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
            .signature-line { margin-top: 60px; border-top: 1px solid #333; padding-top: 5px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INFORMED CONSENT</h1>
            <h2>${consent.title}</h2>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Patient Name</div>
              <div class="info-value">${currentPatient?.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date</div>
              <div class="info-value">${new Date(consent.date).toLocaleDateString()}</div>
            </div>
            ${consent.procedureName ? `
            <div class="info-item">
              <div class="info-label">Procedure</div>
              <div class="info-value">${consent.procedureName}</div>
            </div>
            ` : ""}
            <div class="info-item">
              <div class="info-label">Consent Type</div>
              <div class="info-value">${getTypeLabel(consent.type)}</div>
            </div>
            ${consent.physicianName ? `
            <div class="info-item">
              <div class="info-label">Physician</div>
              <div class="info-value">${consent.physicianName}</div>
            </div>
            ` : ""}
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value">${consent.status.charAt(0).toUpperCase() + consent.status.slice(1)}</div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Description</div>
            <div class="content">${consent.description}</div>
          </div>
          ${consent.risks && consent.risks.length > 0 ? `
          <div class="section">
            <div class="section-title">Risks</div>
            ${consent.risks.map(risk => `<div class="list-item">• ${risk}</div>`).join('')}
          </div>
          ` : ""}
          ${consent.benefits && consent.benefits.length > 0 ? `
          <div class="section">
            <div class="section-title">Benefits</div>
            ${consent.benefits.map(benefit => `<div class="list-item">• ${benefit}</div>`).join('')}
          </div>
          ` : ""}
          ${consent.alternatives && consent.alternatives.length > 0 ? `
          <div class="section">
            <div class="section-title">Alternatives</div>
            ${consent.alternatives.map(alt => `<div class="list-item">• ${alt}</div>`).join('')}
          </div>
          ` : ""}
          ${consent.status === "signed" ? `
          <div class="signature-section">
            <div class="signature-line">
              <div class="info-label">Patient Signature</div>
              <div class="info-value">${consent.signedBy || currentPatient?.name}</div>
              ${consent.signedDate ? `<div class="info-label" style="margin-top: 10px;">Date: ${new Date(consent.signedDate).toLocaleDateString()}</div>` : ""}
            </div>
          </div>
          ` : ""}
          <div class="footer">
            Generated: ${new Date().toLocaleString()}<br>
            Bluequee2.0 - Electronic Health Record System
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

  if (!currentPatient) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium mb-2">No Patient Selected</p>
        <p className="text-sm">Please select a patient to view consents.</p>
      </div>
    );
  }

  return (
    <div className="section-spacing">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileCheck className="text-blue-600 dark:text-blue-400" size={24} />
            Consents
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage consent forms for {currentPatient.name}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          New Consent
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search consents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ConsentType)}
              className="px-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="procedure">Procedure</option>
              <option value="surgery">Surgery</option>
              <option value="anesthesia">Anesthesia</option>
              <option value="blood_transfusion">Blood Transfusion</option>
              <option value="imaging_contrast">Imaging Contrast</option>
              <option value="research">Research</option>
              <option value="photography">Photography</option>
              <option value="other">Other</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ConsentStatus)}
              className="px-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="signed">Signed</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Consents List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredConsents.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FileCheck size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">No Consents Found</p>
            <p className="text-sm">
              {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No consent forms have been created for this patient"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredConsents.map((consent) => (
              <div
                key={consent.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {consent.title}
                      </h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                        {getTypeLabel(consent.type)}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(consent.status)}`}>
                        {consent.status.charAt(0).toUpperCase() + consent.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{consent.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(consent.date).toLocaleDateString()}
                      </span>
                      {consent.procedureName && (
                        <span className="flex items-center gap-1">
                          <Shield size={14} />
                          {consent.procedureName}
                        </span>
                      )}
                      {consent.signedDate && (
                        <span className="flex items-center gap-1">
                          <CheckCircle size={14} />
                          Signed: {new Date(consent.signedDate).toLocaleDateString()}
                        </span>
                      )}
                      {consent.expirationDate && (
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Expires: {new Date(consent.expirationDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedConsent(consent);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                    >
                      <FileCheck size={16} />
                      View
                    </button>
                    <button
                      onClick={() => handlePrint(consent)}
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

      {/* Add Consent Modal */}
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
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create New Consent Form</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create informed consent documentation</p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddConsent} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Consent Type <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ConsentType })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="procedure">Procedure</option>
                    <option value="surgery">Surgery</option>
                    <option value="anesthesia">Anesthesia</option>
                    <option value="blood_transfusion">Blood Transfusion</option>
                    <option value="imaging_contrast">Imaging Contrast</option>
                    <option value="research">Research</option>
                    <option value="photography">Photography</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Consent for Colonoscopy"
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Procedure Name (Optional)</label>
                <input
                  type="text"
                  value={formData.procedureName}
                  onChange={(e) => setFormData({ ...formData, procedureName: e.target.value })}
                  placeholder="Procedure name..."
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Description <span className="text-red-500">*</span></label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the procedure or treatment..."
                  rows={4}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <UserAssignment
                  assignedTo={formData.physicianId}
                  allowedRoles={["physician", "nurse_practitioner", "physician_assistant"]}
                  label="Physician (Optional)"
                  placeholder="Select physician..."
                  onAssign={(userId) => setFormData({ ...formData, physicianId: userId })}
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Risks (Optional)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.currentRisk}
                      onChange={(e) => setFormData({ ...formData, currentRisk: e.target.value })}
                      placeholder="Enter a risk..."
                      className="flex-1 px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && formData.currentRisk.trim()) {
                          e.preventDefault();
                          setFormData({
                            ...formData,
                            risks: [...formData.risks, formData.currentRisk.trim()],
                            currentRisk: "",
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.currentRisk.trim()) {
                          setFormData({
                            ...formData,
                            risks: [...formData.risks, formData.currentRisk.trim()],
                            currentRisk: "",
                          });
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  {formData.risks.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.risks.map((risk, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm"
                        >
                          {risk}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                risks: formData.risks.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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
                <label className="block text-base font-medium mb-2.5">Benefits (Optional)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.currentBenefit}
                      onChange={(e) => setFormData({ ...formData, currentBenefit: e.target.value })}
                      placeholder="Enter a benefit..."
                      className="flex-1 px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && formData.currentBenefit.trim()) {
                          e.preventDefault();
                          setFormData({
                            ...formData,
                            benefits: [...formData.benefits, formData.currentBenefit.trim()],
                            currentBenefit: "",
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.currentBenefit.trim()) {
                          setFormData({
                            ...formData,
                            benefits: [...formData.benefits, formData.currentBenefit.trim()],
                            currentBenefit: "",
                          });
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  {formData.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.benefits.map((benefit, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm"
                        >
                          {benefit}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                benefits: formData.benefits.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
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
                <label className="block text-base font-medium mb-2.5">Alternatives (Optional)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.currentAlternative}
                      onChange={(e) => setFormData({ ...formData, currentAlternative: e.target.value })}
                      placeholder="Enter an alternative..."
                      className="flex-1 px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && formData.currentAlternative.trim()) {
                          e.preventDefault();
                          setFormData({
                            ...formData,
                            alternatives: [...formData.alternatives, formData.currentAlternative.trim()],
                            currentAlternative: "",
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.currentAlternative.trim()) {
                          setFormData({
                            ...formData,
                            alternatives: [...formData.alternatives, formData.currentAlternative.trim()],
                            currentAlternative: "",
                          });
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  {formData.alternatives.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.alternatives.map((alt, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm"
                        >
                          {alt}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                alternatives: formData.alternatives.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
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
                <label className="block text-base font-medium mb-2.5">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create Consent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedConsent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetailsModal(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Consent Details</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedConsent.title}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedConsent.status === "pending" && (
                  <button
                    onClick={() => handleSignConsent(selectedConsent.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors"
                  >
                    Sign Consent
                  </button>
                )}
                <button
                  onClick={() => handlePrint(selectedConsent)}
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
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="text-blue-600 dark:text-blue-400" size={16} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Date</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(selectedConsent.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="text-purple-600 dark:text-purple-400" size={16} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Type</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {getTypeLabel(selectedConsent.type)}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</span>
                  </div>
                  <p className={`text-sm font-semibold ${getStatusColor(selectedConsent.status)}`}>
                    {selectedConsent.status.charAt(0).toUpperCase() + selectedConsent.status.slice(1)}
                  </p>
                </div>
                {selectedConsent.expirationDate && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="text-orange-600 dark:text-orange-400" size={16} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Expires</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(selectedConsent.expirationDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedConsent.description}</p>
              </div>

              {selectedConsent.procedureName && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Procedure</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedConsent.procedureName}</p>
                </div>
              )}

              {selectedConsent.risks && selectedConsent.risks.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Risks</h4>
                  <ul className="space-y-1">
                    {selectedConsent.risks.map((risk, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedConsent.benefits && selectedConsent.benefits.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Benefits</h4>
                  <ul className="space-y-1">
                    {selectedConsent.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedConsent.alternatives && selectedConsent.alternatives.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Alternatives</h4>
                  <ul className="space-y-1">
                    {selectedConsent.alternatives.map((alt, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>{alt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedConsent.signedBy && selectedConsent.signedDate && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Signature</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Signed by:</span> {selectedConsent.signedBy}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Date:</span> {new Date(selectedConsent.signedDate).toLocaleDateString()}
                      {selectedConsent.signedTime && ` at ${selectedConsent.signedTime}`}
                    </p>
                    {selectedConsent.witnessName && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Witness:</span> {selectedConsent.witnessName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedConsent.notes && (
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedConsent.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

