import { useState, useEffect } from "react";
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
import { getAllSpecialties, getSpecialtyTemplate } from "../data/specialtyTemplates";
import UserAssignment from "./UserAssignment";
import { useUsers } from "../hooks/useUsers";
import PrintPreview from "./PrintPreview";
import { openPrintWindow } from "../utils/popupHandler";
import { getOrganizationDetails, getOrganizationHeader, getOrganizationFooter } from "../utils/organization";
import { referralService } from "../services/referrals";

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
  const [printPreview, setPrintPreview] = useState<{ content: string; title: string } | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { users } = useUsers();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load referrals from API when patient changes
  useEffect(() => {
    const loadReferrals = async () => {
      if (!currentPatient?.id) {
        setReferrals([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await referralService.getPatientReferrals(currentPatient.id);
        if (response.data) {
          // Transform backend data to match frontend Referral type
          const transformedReferrals = response.data.map((ref: any) => ({
            ...ref,
            date: ref.date ? (typeof ref.date === 'string' ? ref.date : new Date(ref.date).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
            appointmentDate: ref.appointmentDate ? (typeof ref.appointmentDate === 'string' ? ref.appointmentDate : new Date(ref.appointmentDate).toISOString().split('T')[0]) : undefined,
            followUpDate: ref.followUpDate ? (typeof ref.followUpDate === 'string' ? ref.followUpDate : new Date(ref.followUpDate).toISOString().split('T')[0]) : undefined,
            referringPhysician: ref.referringPhysician ? `${ref.referringPhysician.firstName} ${ref.referringPhysician.lastName}` : undefined,
            referredToProvider: ref.referredToProvider ? (typeof ref.referredToProvider === 'string' ? ref.referredToProvider : `${ref.referredToProvider.firstName} ${ref.referredToProvider.lastName}`) : undefined,
          }));
          setReferrals(transformedReferrals);
        }
      } catch (err: any) {
        console.error('Failed to load referrals:', err);
        setError(err?.message || 'Failed to load referrals');
        setReferrals([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReferrals();
  }, [currentPatient?.id]);

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
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (status: ReferralStatus) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "sent":
        return "bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400";
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
        return "bg-teal-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleAddReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPatient?.id) {
      setError('No patient selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await referralService.createReferral(currentPatient.id, {
        date: formData.date,
        specialty: formData.specialty,
        reason: formData.reason,
        diagnosis: formData.diagnosis || undefined,
        priority: formData.priority,
        status: "pending",
        referringPhysicianId: currentUser?.id,
        referredToProviderId: formData.referredToProviderId || undefined,
        referredToProvider: formData.referredToProvider || undefined,
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
      });

      if (response.data) {
        // Transform backend data to match frontend Referral type
        const newReferral: Referral = {
          ...response.data,
          date: response.data.date ? (typeof response.data.date === 'string' ? response.data.date : new Date(response.data.date).toISOString().split('T')[0]) : formData.date,
          appointmentDate: response.data.appointmentDate ? (typeof response.data.appointmentDate === 'string' ? response.data.appointmentDate : new Date(response.data.appointmentDate).toISOString().split('T')[0]) : undefined,
          followUpDate: response.data.followUpDate ? (typeof response.data.followUpDate === 'string' ? response.data.followUpDate : new Date(response.data.followUpDate).toISOString().split('T')[0]) : undefined,
          referringPhysician: response.data.referringPhysician ? (typeof response.data.referringPhysician === 'string' ? response.data.referringPhysician : `${(response.data.referringPhysician as any).firstName} ${(response.data.referringPhysician as any).lastName}`) : (currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : undefined),
          referredToProvider: response.data.referredToProvider ? (typeof response.data.referredToProvider === 'string' ? response.data.referredToProvider : `${(response.data.referredToProvider as any).firstName} ${(response.data.referredToProvider as any).lastName}`) : formData.referredToProvider || undefined,
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
      }
    } catch (err: any) {
      console.error('Failed to create referral:', err);
      setError(err?.message || 'Failed to create referral');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintFromPreview = () => {
    if (!printPreview) return;
    openPrintWindow(printPreview.content, printPreview.title);
  };

  const handlePrint = (ref: Referral) => {
    const orgHeader = getOrganizationHeader();
    const orgFooter = getOrganizationFooter();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Referral - ${ref.specialty}</title>
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
              gap: 15px; 
              margin: 25px 0; 
            }
            .info-item { 
              padding: 10px; 
              background: #f9fafb; 
              border-radius: 4px; 
              border: 1px solid #e5e7eb;
            }
            .info-label { 
              font-size: 11px; 
              color: #6b7280; 
              text-transform: uppercase; 
              letter-spacing: 0.5px; 
              margin-bottom: 5px; 
              font-weight: 600;
            }
            .info-value { 
              font-size: 14px; 
              font-weight: 600; 
              color: #111827; 
            }
            .section { 
              margin: 30px 0; 
            }
            .section-title { 
              font-size: 16px; 
              font-weight: 600; 
              color: #1e40af; 
              margin-bottom: 15px; 
              padding-bottom: 8px; 
              border-bottom: 2px solid #e5e7eb; 
            }
            .content { 
              background: #f9fafb; 
              padding: 15px; 
              border-radius: 4px; 
              margin: 20px 0; 
              white-space: pre-wrap; 
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
            .footer { 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              font-size: 11px; 
              color: #6b7280; 
              text-align: center; 
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
            <h1>MEDICAL REFERRAL</h1>
            <h2>${ref.specialty}</h2>
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
              <div class="info-label">Referred To Facility</div>
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

          <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-label">${ref.referringPhysician || 'Referring Physician'} Signature</div>
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
      title: `Referral - ${ref.specialty}`
    });
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
            <ArrowRight className="text-teal-600 dark:text-teal-400" size={24} />
            Referrals
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage referrals for {currentPatient.name}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          New Referral
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle size={18} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

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
              className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReferralStatus)}
              className="px-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
              className="px-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>Loading referrals...</p>
          </div>
        ) : filteredReferrals.length === 0 ? (
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
                        {ref.specialty}
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
                      {ref.referringPhysician && (
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          Referring: {ref.referringPhysician}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Building2 size={14} />
                        From: {getOrganizationDetails().name}
                      </span>
                      {ref.referredToProvider && (
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          To: {ref.referredToProvider}
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
                      className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors text-sm font-medium"
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
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Priority <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as ReferralPriority })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select specialty...</option>
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

              <div>
                <label className="block text-base font-medium mb-2.5">Reason for Referral <span className="text-red-500">*</span></label>
                <textarea
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Describe the reason for this referral..."
                  rows={3}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Diagnosis (Optional)</label>
                <input
                  type="text"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="Primary diagnosis..."
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Facility Phone (Optional)</label>
                  <input
                    type="tel"
                    value={formData.referredToPhone}
                    onChange={(e) => setFormData({ ...formData, referredToPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Appointment Time (Optional)</label>
                  <input
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
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
                  {getSpecialtyTemplate(selectedReferral.specialty as SpecialtyType)?.name || selectedReferral.specialty}
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
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="text-teal-600 dark:text-teal-400" size={16} />
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

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Referring Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedReferral.referringPhysician && (
                    <div className="flex items-start gap-2 text-sm">
                      <User size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 block">Referring Physician:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{selectedReferral.referringPhysician}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm">
                    <Building2 size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block">Referring Organization:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{getOrganizationDetails().name}</span>
                      {getOrganizationDetails().type && (
                        <span className="text-xs text-gray-500 dark:text-gray-400"> ({getOrganizationDetails().type})</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Referred To Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedReferral.referredToProvider && (
                    <div className="flex items-start gap-2 text-sm">
                      <User size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 block">Referred To Provider:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{selectedReferral.referredToProvider}</span>
                      </div>
                    </div>
                  )}
                  {selectedReferral.referredToFacility && (
                    <div className="flex items-start gap-2 text-sm">
                      <Building2 size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 block">Facility:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{selectedReferral.referredToFacility}</span>
                      </div>
                    </div>
                  )}
                  {selectedReferral.referredToPhone && (
                    <div className="flex items-start gap-2 text-sm">
                      <Phone size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 block">Phone:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{selectedReferral.referredToPhone}</span>
                      </div>
                    </div>
                  )}
                  {selectedReferral.referredToAddress && (
                    <div className="flex items-start gap-2 text-sm md:col-span-2">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 block">Address:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{selectedReferral.referredToAddress}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedReferral.insurancePreAuth && (
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
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

