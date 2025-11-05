import { useState } from "react";
import {
  ArrowRight,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Building2,
  Phone,
  MapPin,
  FileText,
  X,
  Printer,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { useUser } from "../context/UserContext";
import { Patient, Referral, ReferralStatus, ReferralPriority, SpecialtyType } from "../types";
import { getAllSpecialties } from "../data/specialtyTemplates";
import UserAssignment from "./UserAssignment";
import { useUsers } from "../hooks/useUsers";

interface ReferralsProps {
  patient?: Patient;
}

export default function Referrals({ patient }: ReferralsProps) {
  const { selectedPatient, addTimelineEvent } = useDashboard();
  const { currentUser } = useUser();
  const currentPatient = patient || selectedPatient;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReferralStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | ReferralPriority>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { users } = useUsers();
  const [referrals, setReferrals] = useState<Referral[]>(
    currentPatient?.referrals || []
  );

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    specialty: "" as SpecialtyType | "",
    reason: "",
    diagnosis: "",
    priority: "routine" as ReferralPriority,
    referredToProvider: "",
    referredToProviderId: null as string | null,
    referredToFacility: "",
    referredToAddress: "",
    referredToPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: "",
    insurancePreAuth: false,
    preAuthNumber: "",
    followUpRequired: false,
    followUpDate: "",
  });

  const filteredReferrals = referrals.filter((ref) => {
    const matchesSearch =
      ref.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.referredToProvider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.referredToFacility?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ref.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ref.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: ReferralStatus) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "sent":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400";
      case "completed":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400";
      case "cancelled":
      case "declined":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const getPriorityColor = (priority: ReferralPriority) => {
    switch (priority) {
      case "emergency":
        return "bg-red-500 text-white";
      case "stat":
        return "bg-orange-500 text-white";
      case "urgent":
        return "bg-yellow-500 text-white";
      case "routine":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleAddReferral = (e: React.FormEvent) => {
    e.preventDefault();
    const newReferral: Referral = {
      id: `ref-${Date.now()}`,
      date: formData.date,
      specialty: formData.specialty,
      reason: formData.reason,
      diagnosis: formData.diagnosis || undefined,
      priority: formData.priority,
      status: "pending",
      referringPhysician: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : undefined,
      referringPhysicianId: currentUser?.id,
      referredToProvider: formData.referredToProvider || undefined,
      referredToProviderId: formData.referredToProviderId || undefined,
      referredToFacility: formData.referredToFacility || undefined,
      referredToAddress: formData.referredToAddress || undefined,
      referredToPhone: formData.referredToPhone || undefined,
      appointmentDate: formData.appointmentDate || undefined,
      appointmentTime: formData.appointmentTime || undefined,
      notes: formData.notes || undefined,
      insurancePreAuth: formData.insurancePreAuth,
      preAuthNumber: formData.preAuthNumber || undefined,
      followUpRequired: formData.followUpRequired,
      followUpDate: formData.followUpDate || undefined,
    };

    setReferrals([...referrals, newReferral]);
    addTimelineEvent(currentPatient.id, {
      date: newReferral.date,
      type: "referral",
      title: `Referral to ${formData.specialty} - ${formData.reason}`,
      description: `Priority: ${formData.priority}`,
      icon: "arrow-right",
    });

    setFormData({
      date: new Date().toISOString().split("T")[0],
      specialty: "" as SpecialtyType | "",
      reason: "",
      diagnosis: "",
      priority: "routine",
      referredToProvider: "",
      referredToProviderId: null,
      referredToFacility: "",
      referredToAddress: "",
      referredToPhone: "",
      appointmentDate: "",
      appointmentTime: "",
      notes: "",
      insurancePreAuth: false,
      preAuthNumber: "",
      followUpRequired: false,
      followUpDate: "",
    });
    setShowAddForm(false);
  };

  const handlePrint = (ref: Referral) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Referral - ${ref.specialty}</title>
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
            <h1>MEDICAL REFERRAL</h1>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Patient Name</div>
              <div class="info-value">${currentPatient?.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Referral Date</div>
              <div class="info-value">${new Date(ref.date).toLocaleDateString()}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Specialty</div>
              <div class="info-value">${ref.specialty}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Priority</div>
              <div class="info-value">${ref.priority.toUpperCase()}</div>
            </div>
            ${ref.referringPhysician ? `
            <div class="info-item">
              <div class="info-label">Referring Physician</div>
              <div class="info-value">${ref.referringPhysician}</div>
            </div>
            ` : ""}
            ${ref.referredToProvider ? `
            <div class="info-item">
              <div class="info-label">Referred To Provider</div>
              <div class="info-value">${ref.referredToProvider}</div>
            </div>
            ` : ""}
            ${ref.referredToFacility ? `
            <div class="info-item">
              <div class="info-label">Facility</div>
              <div class="info-value">${ref.referredToFacility}</div>
            </div>
            ` : ""}
          </div>
          <div class="section">
            <div class="section-title">Reason for Referral</div>
            <div class="content">${ref.reason}</div>
          </div>
          ${ref.diagnosis ? `
          <div class="section">
            <div class="section-title">Diagnosis</div>
            <div class="content">${ref.diagnosis}</div>
          </div>
          ` : ""}
          ${ref.notes ? `
          <div class="section">
            <div class="section-title">Additional Notes</div>
            <div class="content">${ref.notes}</div>
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
        <p className="text-sm">Please select a patient to view referrals.</p>
      </div>
    );
  }

  return (
    <div className="section-spacing">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ArrowRight className="text-blue-600 dark:text-blue-400" size={24} />
            Referrals
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage referrals for {currentPatient.name}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          New Referral
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search referrals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReferralStatus)}
              className="px-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="declined">Declined</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as ReferralPriority)}
              className="px-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredReferrals.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <ArrowRight size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">No Referrals Found</p>
            <p className="text-sm">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No referrals have been created for this patient"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredReferrals.map((ref) => (
              <div
                key={ref.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {getAllSpecialties().find(s => s.specialty === ref.specialty)?.name || ref.specialty}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getPriorityColor(ref.priority)}`}>
                        {ref.priority.toUpperCase()}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(ref.status)}`}>
                        {ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{ref.reason}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(ref.date).toLocaleDateString()}
                      </span>
                      {ref.referredToProvider && (
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {ref.referredToProvider}
                        </span>
                      )}
                      {ref.referredToFacility && (
                        <span className="flex items-center gap-1">
                          <Building2 size={14} />
                          {ref.referredToFacility}
                        </span>
                      )}
                      {ref.appointmentDate && (
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Appointment: {new Date(ref.appointmentDate).toLocaleDateString()}
                          {ref.appointmentTime && ` at ${ref.appointmentTime}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedReferral(ref);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                    >
                      <FileText size={16} />
                      View
                    </button>
                    <button
                      onClick={() => handlePrint(ref)}
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

      {/* Add Referral Modal */}
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
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create New Referral</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Refer patient to specialist or facility</p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddReferral} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Referral Date <span className="text-red-500">*</span></label>
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
                  <label className="block text-base font-medium mb-2.5">Priority <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as ReferralPriority })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Specialty <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value as SpecialtyType })}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select specialty...</option>
                  {getAllSpecialties().map((specialty) => (
                    <option key={specialty.specialty} value={specialty.specialty}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Reason for Referral <span className="text-red-500">*</span></label>
                <textarea
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Describe the reason for this referral..."
                  rows={3}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Diagnosis (Optional)</label>
                <input
                  type="text"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="Primary diagnosis..."
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <UserAssignment
                    assignedTo={formData.referredToProviderId}
                    allowedRoles={["physician", "nurse_practitioner"]}
                    label="Referred To Provider (Optional)"
                    placeholder="Select provider..."
                    onAssign={(userId) => {
                      const assignedUser = userId ? users.find((u) => u.id === userId) : null;
                      setFormData({
                        ...formData,
                        referredToProviderId: userId,
                        referredToProvider: assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : "",
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Facility (Optional)</label>
                  <input
                    type="text"
                    value={formData.referredToFacility}
                    onChange={(e) => setFormData({ ...formData, referredToFacility: e.target.value })}
                    placeholder="Facility name..."
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Facility Address (Optional)</label>
                  <input
                    type="text"
                    value={formData.referredToAddress}
                    onChange={(e) => setFormData({ ...formData, referredToAddress: e.target.value })}
                    placeholder="Facility address..."
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Facility Phone (Optional)</label>
                  <input
                    type="tel"
                    value={formData.referredToPhone}
                    onChange={(e) => setFormData({ ...formData, referredToPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Appointment Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Appointment Time (Optional)</label>
                  <input
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="insurancePreAuth"
                  checked={formData.insurancePreAuth}
                  onChange={(e) => setFormData({ ...formData, insurancePreAuth: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="insurancePreAuth" className="text-base">
                  Insurance Pre-Authorization Required
                </label>
              </div>

              {formData.insurancePreAuth && (
                <div>
                  <label className="block text-base font-medium mb-2.5">Pre-Authorization Number</label>
                  <input
                    type="text"
                    value={formData.preAuthNumber}
                    onChange={(e) => setFormData({ ...formData, preAuthNumber: e.target.value })}
                    placeholder="Pre-auth number..."
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="followUpRequired"
                  checked={formData.followUpRequired}
                  onChange={(e) => setFormData({ ...formData, followUpRequired: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="followUpRequired" className="text-base">
                  Follow-up Required
                </label>
              </div>

              {formData.followUpRequired && (
                <div>
                  <label className="block text-base font-medium mb-2.5">Follow-up Date</label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-base font-medium mb-2.5">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or instructions..."
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
                  Create Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedReferral && (
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Referral Details</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {getAllSpecialties().find(s => s.specialty === selectedReferral.specialty)?.name || selectedReferral.specialty}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(selectedReferral)}
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
                    {new Date(selectedReferral.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="text-purple-600 dark:text-purple-400" size={16} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Priority</span>
                  </div>
                  <p className={`text-sm font-semibold ${getPriorityColor(selectedReferral.priority)}`}>
                    {selectedReferral.priority.toUpperCase()}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</span>
                  </div>
                  <p className={`text-sm font-semibold ${getStatusColor(selectedReferral.status)}`}>
                    {selectedReferral.status.charAt(0).toUpperCase() + selectedReferral.status.slice(1)}
                  </p>
                </div>
                {selectedReferral.appointmentDate && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="text-orange-600 dark:text-orange-400" size={16} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Appointment</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(selectedReferral.appointmentDate).toLocaleDateString()}
                      {selectedReferral.appointmentTime && ` ${selectedReferral.appointmentTime}`}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Reason for Referral</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedReferral.reason}</p>
              </div>

              {selectedReferral.diagnosis && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Diagnosis</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedReferral.diagnosis}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedReferral.referringPhysician && (
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Referring Physician:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedReferral.referringPhysician}</span>
                  </div>
                )}
                {selectedReferral.referredToProvider && (
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Referred To:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedReferral.referredToProvider}</span>
                  </div>
                )}
                {selectedReferral.referredToFacility && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Facility:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedReferral.referredToFacility}</span>
                  </div>
                )}
                {selectedReferral.referredToPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedReferral.referredToPhone}</span>
                  </div>
                )}
                {selectedReferral.referredToAddress && (
                  <div className="flex items-center gap-2 text-sm md:col-span-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Address:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedReferral.referredToAddress}</span>
                  </div>
                )}
              </div>

              {selectedReferral.insurancePreAuth && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Insurance Pre-Authorization</h4>
                  {selectedReferral.preAuthNumber ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300">Number: {selectedReferral.preAuthNumber}</p>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300">Pre-authorization required</p>
                  )}
                </div>
              )}

              {selectedReferral.notes && (
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedReferral.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

