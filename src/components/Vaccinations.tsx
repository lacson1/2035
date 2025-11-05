import { useState } from "react";
import {
  Syringe,
  Plus,
  Search,
  Calendar,
  User,
  CheckCircle,
  X,
  Printer,
  AlertCircle,
  Clock,
  Shield,
  FileText,
} from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { useUser } from "../context/UserContext";
import { Patient, Vaccination } from "../types";
import UserAssignment from "./UserAssignment";
import { useUsers } from "../hooks/useUsers";

interface VaccinationsProps {
  patient?: Patient;
}

export default function Vaccinations({ patient }: VaccinationsProps) {
  const { selectedPatient, addTimelineEvent } = useDashboard();
  const { currentUser } = useUser();
  const currentPatient = patient || selectedPatient;
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { users } = useUsers();

  const [vaccinations, setVaccinations] = useState<Vaccination[]>(
    currentPatient?.vaccinations || []
  );

  const [formData, setFormData] = useState({
    vaccineName: "",
    vaccineCode: "",
    date: new Date().toISOString().split("T")[0],
    administeredById: null as string | null,
    location: "",
    route: "intramuscular" as Vaccination["route"],
    site: "",
    lotNumber: "",
    manufacturer: "",
    expirationDate: "",
    doseNumber: "",
    totalDoses: "",
    nextDoseDate: "",
    adverseReactions: [] as string[],
    notes: "",
    currentReaction: "",
  });

  const filteredVaccinations = vaccinations.filter((vax) => {
    return (
      vax.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vax.vaccineCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vax.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAddVaccination = (e: React.FormEvent) => {
    e.preventDefault();
    const administeredBy = formData.administeredById ? users.find(u => u.id === formData.administeredById) : null;

    const newVaccination: Vaccination = {
      id: `vax-${Date.now()}`,
      vaccineName: formData.vaccineName,
      vaccineCode: formData.vaccineCode || undefined,
      date: formData.date,
      administeredBy: administeredBy ? `${administeredBy.firstName} ${administeredBy.lastName}` : undefined,
      administeredById: formData.administeredById || undefined,
      location: formData.location || undefined,
      route: formData.route,
      site: formData.site || undefined,
      lotNumber: formData.lotNumber || undefined,
      manufacturer: formData.manufacturer || undefined,
      expirationDate: formData.expirationDate || undefined,
      doseNumber: formData.doseNumber ? parseInt(formData.doseNumber) : undefined,
      totalDoses: formData.totalDoses ? parseInt(formData.totalDoses) : undefined,
      nextDoseDate: formData.nextDoseDate || undefined,
      adverseReactions: formData.adverseReactions.length > 0 ? formData.adverseReactions : undefined,
      notes: formData.notes || undefined,
      verified: false,
    };

    setVaccinations([...vaccinations, newVaccination]);
    addTimelineEvent(currentPatient.id, {
      date: newVaccination.date,
      type: "vaccination",
      title: `${newVaccination.vaccineName} - Dose ${newVaccination.doseNumber || 1}`,
      description: `Administered by ${newVaccination.administeredBy || "Unknown"}`,
      icon: "syringe",
    });

    setFormData({
      vaccineName: "",
      vaccineCode: "",
      date: new Date().toISOString().split("T")[0],
      administeredById: null,
      location: "",
      route: "intramuscular",
      site: "",
      lotNumber: "",
      manufacturer: "",
      expirationDate: "",
      doseNumber: "",
      totalDoses: "",
      nextDoseDate: "",
      adverseReactions: [],
      notes: "",
      currentReaction: "",
    });
    setShowAddForm(false);
  };

  const handleVerify = (vaccinationId: string) => {
    setVaccinations(vaccinations.map(vax => 
      vax.id === vaccinationId 
        ? { 
            ...vax, 
            verified: true, 
            verifiedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : undefined,
            verifiedById: currentUser?.id,
            verifiedDate: new Date().toISOString().split("T")[0],
          }
        : vax
    ));
    setShowDetailsModal(false);
  };

  const handlePrint = (vax: Vaccination) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vaccination Record - ${vax.vaccineName}</title>
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
            .verified-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 4px; display: inline-block; margin: 10px 0; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>VACCINATION RECORD</h1>
            <h2>${vax.vaccineName}</h2>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Patient Name</div>
              <div class="info-value">${currentPatient?.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Vaccination Date</div>
              <div class="info-value">${new Date(vax.date).toLocaleDateString()}</div>
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
            ${vax.vaccineCode ? `
            <div class="info-item">
              <div class="info-label">Vaccine Code</div>
              <div class="info-value">${vax.vaccineCode}</div>
            </div>
            ` : ""}
            ${vax.manufacturer ? `
            <div class="info-item">
              <div class="info-label">Manufacturer</div>
              <div class="info-value">${vax.manufacturer}</div>
            </div>
            ` : ""}
            ${vax.lotNumber ? `
            <div class="info-item">
              <div class="info-label">Lot Number</div>
              <div class="info-value">${vax.lotNumber}</div>
            </div>
            ` : ""}
            ${vax.doseNumber ? `
            <div class="info-item">
              <div class="info-label">Dose</div>
              <div class="info-value">${vax.doseNumber}${vax.totalDoses ? ` of ${vax.totalDoses}` : ""}</div>
            </div>
            ` : ""}
            ${vax.route ? `
            <div class="info-item">
              <div class="info-label">Route</div>
              <div class="info-value">${vax.route.charAt(0).toUpperCase() + vax.route.slice(1).replace("_", " ")}</div>
            </div>
            ` : ""}
            ${vax.site ? `
            <div class="info-item">
              <div class="info-label">Administration Site</div>
              <div class="info-value">${vax.site}</div>
            </div>
            ` : ""}
            ${vax.administeredBy ? `
            <div class="info-item">
              <div class="info-label">Administered By</div>
              <div class="info-value">${vax.administeredBy}</div>
            </div>
            ` : ""}
            ${vax.location ? `
            <div class="info-item">
              <div class="info-label">Location</div>
              <div class="info-value">${vax.location}</div>
            </div>
            ` : ""}
            ${vax.nextDoseDate ? `
            <div class="info-item">
              <div class="info-label">Next Dose Date</div>
              <div class="info-value">${new Date(vax.nextDoseDate).toLocaleDateString()}</div>
            </div>
            ` : ""}
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value">${vax.verified ? "Verified" : "Pending Verification"}</div>
            </div>
          </div>
          ${vax.verified ? `
          <div class="section">
            <div class="verified-badge">✓ VERIFIED</div>
            ${vax.verifiedBy ? `<p><strong>Verified by:</strong> ${vax.verifiedBy}</p>` : ""}
            ${vax.verifiedDate ? `<p><strong>Verified on:</strong> ${new Date(vax.verifiedDate).toLocaleDateString()}</p>` : ""}
          </div>
          ` : ""}
          ${vax.adverseReactions && vax.adverseReactions.length > 0 ? `
          <div class="section">
            <div class="section-title">Adverse Reactions</div>
            <div class="content">${vax.adverseReactions.join(", ")}</div>
          </div>
          ` : ""}
          ${vax.notes ? `
          <div class="section">
            <div class="section-title">Notes</div>
            <div class="content">${vax.notes}</div>
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
        <p className="text-sm">Please select a patient to view vaccinations.</p>
      </div>
    );
  }

  return (
    <div className="section-spacing">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Syringe className="text-teal-600 dark:text-teal-400" size={24} />
            Vaccinations
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Immunization records for {currentPatient.name}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Record Vaccination
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search vaccinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Vaccinations List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredVaccinations.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Syringe size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">No Vaccinations Found</p>
            <p className="text-sm">
              {searchTerm
                ? "Try adjusting your search"
                : "No vaccinations have been recorded for this patient"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredVaccinations.map((vax) => (
              <div
                key={vax.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {vax.vaccineName}
                      </h3>
                      {vax.verified ? (
                        <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                          <CheckCircle size={12} />
                          Verified
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
                          Pending
                        </span>
                      )}
                      {vax.doseNumber && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400">
                          Dose {vax.doseNumber}{vax.totalDoses ? `/${vax.totalDoses}` : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(vax.date).toLocaleDateString()}
                      </span>
                      {vax.manufacturer && (
                        <span className="flex items-center gap-1">
                          <Shield size={14} />
                          {vax.manufacturer}
                        </span>
                      )}
                      {vax.administeredBy && (
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {vax.administeredBy}
                        </span>
                      )}
                      {vax.nextDoseDate && (
                        <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                          <Clock size={14} />
                          Next: {new Date(vax.nextDoseDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedVaccination(vax);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors text-sm font-medium"
                    >
                      <FileText size={16} />
                      View
                    </button>
                    <button
                      onClick={() => handlePrint(vax)}
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

      {/* Add Vaccination Modal */}
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Record Vaccination</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add new immunization record</p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddVaccination} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Vaccine Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.vaccineName}
                    onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
                    placeholder="e.g., Influenza (Flu), COVID-19"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Vaccine Code</label>
                  <input
                    type="text"
                    value={formData.vaccineCode}
                    onChange={(e) => setFormData({ ...formData, vaccineCode: e.target.value })}
                    placeholder="e.g., FLU2024, COVID-MRNA"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Date <span className="text-red-500">*</span></label>
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
                  <label className="block text-base font-medium mb-2.5">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Hospital 2035 - Main Clinic"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <UserAssignment
                  assignedTo={formData.administeredById}
                  allowedRoles={["physician", "nurse", "nurse_practitioner", "medical_assistant"]}
                  label="Administered By (Optional)"
                  placeholder="Select healthcare provider..."
                  onAssign={(userId) => setFormData({ ...formData, administeredById: userId })}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Route <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value as Vaccination["route"] })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="intramuscular">Intramuscular</option>
                    <option value="subcutaneous">Subcutaneous</option>
                    <option value="oral">Oral</option>
                    <option value="intranasal">Intranasal</option>
                    <option value="intradermal">Intradermal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Administration Site</label>
                  <input
                    type="text"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    placeholder="e.g., Left Deltoid, Right Deltoid"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Lot Number</label>
                  <input
                    type="text"
                    value={formData.lotNumber}
                    onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                    placeholder="Lot number..."
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g., Pfizer, Moderna, Sanofi"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Dose Number</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.doseNumber}
                    onChange={(e) => setFormData({ ...formData, doseNumber: e.target.value })}
                    placeholder="1"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Total Doses</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalDoses}
                    onChange={(e) => setFormData({ ...formData, totalDoses: e.target.value })}
                    placeholder="1"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Expiration Date</label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Next Dose Date</label>
                <input
                  type="date"
                  value={formData.nextDoseDate}
                  onChange={(e) => setFormData({ ...formData, nextDoseDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Adverse Reactions (Optional)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.currentReaction}
                      onChange={(e) => setFormData({ ...formData, currentReaction: e.target.value })}
                      placeholder="Enter adverse reaction..."
                      className="flex-1 px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && formData.currentReaction.trim()) {
                          e.preventDefault();
                          setFormData({
                            ...formData,
                            adverseReactions: [...formData.adverseReactions, formData.currentReaction.trim()],
                            currentReaction: "",
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.currentReaction.trim()) {
                          setFormData({
                            ...formData,
                            adverseReactions: [...formData.adverseReactions, formData.currentReaction.trim()],
                            currentReaction: "",
                          });
                        }
                      }}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    >
                      Add
                    </button>
                  </div>
                  {formData.adverseReactions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.adverseReactions.map((reaction, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm"
                        >
                          {reaction}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                adverseReactions: formData.adverseReactions.filter((_, i) => i !== idx),
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
                <label className="block text-base font-medium mb-2.5">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
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
                  Record Vaccination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedVaccination && (
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Vaccination Details</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedVaccination.vaccineName}</p>
              </div>
              <div className="flex items-center gap-2">
                {!selectedVaccination.verified && (
                  <button
                    onClick={() => handleVerify(selectedVaccination.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors"
                  >
                    Verify
                  </button>
                )}
                <button
                  onClick={() => handlePrint(selectedVaccination)}
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
                    {new Date(selectedVaccination.date).toLocaleDateString()}
                  </p>
                </div>
                {selectedVaccination.doseNumber && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Syringe className="text-purple-600 dark:text-purple-400" size={16} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Dose</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {selectedVaccination.doseNumber}{selectedVaccination.totalDoses ? `/${selectedVaccination.totalDoses}` : ""}
                    </p>
                  </div>
                )}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</span>
                  </div>
                  <p className={`text-sm font-semibold ${selectedVaccination.verified ? "text-green-700 dark:text-green-400" : "text-yellow-700 dark:text-yellow-400"}`}>
                    {selectedVaccination.verified ? "Verified" : "Pending"}
                  </p>
                </div>
                {selectedVaccination.nextDoseDate && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="text-orange-600 dark:text-orange-400" size={16} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Next Dose</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(selectedVaccination.nextDoseDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedVaccination.vaccineCode && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Vaccine Code:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedVaccination.vaccineCode}</span>
                  </div>
                )}
                {selectedVaccination.manufacturer && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Manufacturer:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedVaccination.manufacturer}</span>
                  </div>
                )}
                {selectedVaccination.lotNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Lot Number:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedVaccination.lotNumber}</span>
                  </div>
                )}
                {selectedVaccination.route && (
                  <div className="flex items-center gap-2 text-sm">
                    <Syringe size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Route:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedVaccination.route.charAt(0).toUpperCase() + selectedVaccination.route.slice(1).replace("_", " ")}
                    </span>
                  </div>
                )}
                {selectedVaccination.site && (
                  <div className="flex items-center gap-2 text-sm">
                    <Syringe size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Site:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedVaccination.site}</span>
                  </div>
                )}
                {selectedVaccination.administeredBy && (
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Administered By:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedVaccination.administeredBy}</span>
                  </div>
                )}
                {selectedVaccination.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Location:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedVaccination.location}</span>
                  </div>
                )}
              </div>

              {selectedVaccination.verified && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                    Verified
                  </h4>
                  <div className="space-y-1 text-sm">
                    {selectedVaccination.verifiedBy && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Verified by:</span> {selectedVaccination.verifiedBy}
                      </p>
                    )}
                    {selectedVaccination.verifiedDate && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Verified on:</span> {new Date(selectedVaccination.verifiedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedVaccination.adverseReactions && selectedVaccination.adverseReactions.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Adverse Reactions</h4>
                  <ul className="space-y-1">
                    {selectedVaccination.adverseReactions.map((reaction, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                        <span>{reaction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedVaccination.notes && (
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedVaccination.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

