import { useState } from "react";
import { Mail, Phone, Stethoscope, Calendar, X, Plus, List, LayoutGrid } from "lucide-react";
import { Patient } from "../types";
import { useDashboard } from "../context/DashboardContext";

interface CareTeamProps {
  patient?: Patient;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  email: string;
  phone: string;
  department: string;
  assignedDate: string;
  notes?: string;
}

type ViewMode = "list" | "grid";

export default function CareTeam({ patient }: CareTeamProps) {
  const { selectedPatient } = useDashboard();
  const currentPatient = patient || selectedPatient;
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    specialty: "",
    email: "",
    phone: "",
    department: "",
    notes: "",
  });

  // Team members - loaded from patient data or API
  // Note: careTeam might be stored in a different field or loaded separately
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
    (currentPatient as any)?.careTeam || []
  );


  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: formData.name,
      role: formData.role,
      specialty: formData.specialty,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      assignedDate: new Date().toISOString().split("T")[0],
      notes: formData.notes || undefined,
    };

    setTeamMembers([...teamMembers, newMember]);
    setFormData({
      name: "",
      role: "",
      specialty: "",
      email: "",
      phone: "",
      department: "",
      notes: "",
    });
    setAddMemberOpen(false);
  };

  const handleRemoveMember = (id: string) => {
    if (window.confirm("Are you sure you want to remove this team member?")) {
      setTeamMembers(teamMembers.filter((m) => m.id !== id));
    }
  };

  const primaryPhysician = teamMembers.find((m) => m.role.toLowerCase().includes("primary"));
  const specialists = teamMembers.filter(
    (m) => m.role.toLowerCase().includes("specialist") || (m.specialty && !m.role.toLowerCase().includes("primary") && !m.role.toLowerCase().includes("nurse"))
  );
  const supportStaff = teamMembers.filter((m) => m.role.toLowerCase().includes("nurse") || m.role.toLowerCase().includes("coordinator"));

  return (
    <div className="space-y-6">
      {/* Add Team Member - Moved to top */}
      <div className="flex justify-end">
        <button
          onClick={() => setAddMemberOpen(true)}
          className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          title="Add Team Member"
          aria-label="Add Team Member"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Primary Care Physician */}
      {primaryPhysician && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Stethoscope size={20} className="text-blue-600 dark:text-blue-400" />
              Primary Care Physician
            </h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-lg">{primaryPhysician.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {primaryPhysician.role}
                  {primaryPhysician.specialty && ` • ${primaryPhysician.specialty}`}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {primaryPhysician.department}
                </p>
                {primaryPhysician.notes && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    {primaryPhysician.notes}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-4 pt-4 border-t dark:border-gray-700">
              <a
                href={`mailto:${primaryPhysician.email}`}
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Mail size={16} />
                {primaryPhysician.email}
              </a>
              <a
                href={`tel:${primaryPhysician.phone}`}
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Phone size={16} />
                {primaryPhysician.phone}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Specialists */}
      {specialists.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Specialists</h3>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
                title="List view"
                aria-label="List view"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specialists.map((member) => (
                <div
                  key={member.id}
                  className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {member.role}
                      </p>
                      {member.specialty && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {member.specialty}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Mail size={12} />
                      <a href={`mailto:${member.email}`} className="hover:underline">
                        {member.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Phone size={12} />
                      <a href={`tel:${member.phone}`} className="hover:underline">
                        {member.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                      <Calendar size={12} />
                      <span>Assigned: {new Date(member.assignedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {specialists.map((member) => (
                <div
                  key={member.id}
                  className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base">{member.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {member.role}
                            {member.specialty && ` • ${member.specialty}`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 flex-shrink-0"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mt-2">
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-1.5 hover:underline"
                        >
                          <Mail size={12} />
                          <span className="truncate">{member.email}</span>
                        </a>
                        <a
                          href={`tel:${member.phone}`}
                          className="flex items-center gap-1.5 hover:underline"
                        >
                          <Phone size={12} />
                          <span>{member.phone}</span>
                        </a>
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-500">
                          <Calendar size={12} />
                          <span>Assigned: {new Date(member.assignedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Support Staff */}
      {supportStaff.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Support Staff</h3>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
                title="List view"
                aria-label="List view"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportStaff.map((member) => (
                <div
                  key={member.id}
                  className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {member.role}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {member.department}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Mail size={12} />
                      <a href={`mailto:${member.email}`} className="hover:underline">
                        {member.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Phone size={12} />
                      <a href={`tel:${member.phone}`} className="hover:underline">
                        {member.phone}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {supportStaff.map((member) => (
                <div
                  key={member.id}
                  className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base">{member.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {member.role}
                            {member.department && ` • ${member.department}`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 flex-shrink-0"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mt-2">
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-1.5 hover:underline"
                        >
                          <Mail size={12} />
                          <span className="truncate">{member.email}</span>
                        </a>
                        <a
                          href={`tel:${member.phone}`}
                          className="flex items-center gap-1.5 hover:underline"
                        >
                          <Phone size={12} />
                          <span>{member.phone}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Member Modal */}
      {addMemberOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setAddMemberOpen(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-[500px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Add Team Member</h4>
              <button
                onClick={() => setAddMemberOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-5">
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. John Smith"
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Role</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  >
                    <option value="">Select role</option>
                    <option value="Primary Care Physician">Primary Care Physician</option>
                    <option value="Specialist">Specialist</option>
                    <option value="Surgeon">Surgeon</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Care Coordinator">Care Coordinator</option>
                    <option value="Physician Assistant">Physician Assistant</option>
                    <option value="Social Worker">Social Worker</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Specialty (Optional)</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="Cardiology, etc."
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Department</label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Cardiology, Internal Medicine, etc."
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@hospital.com"
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this team member..."
                  rows={4}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setAddMemberOpen(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

