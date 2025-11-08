import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  Briefcase,
  Building2,
  Save,
  Edit2,
  X,
  Camera,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import { getRolePermissions, getRoleName } from "../data/roles";
import { useToast } from "../context/ToastContext";
import apiClient from "../services/api";
import { ApiError } from "../services/api";
import { logger } from "../utils/logger";

export default function UserProfile() {
  const { currentUser } = useUser();
  const { refreshUser } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    specialty: currentUser?.specialty || "",
    department: currentUser?.department || "",
  });

  // Update form data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        specialty: currentUser.specialty || "",
        department: currentUser.department || "",
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No user logged in
      </div>
    );
  }

  const rolePermissions = getRolePermissions(currentUser.role);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Call API to update user profile
      const response = await apiClient.put(`/v1/auth/me`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        specialty: formData.specialty || null,
        department: formData.department || null,
      });

      if (response.data) {
        // Refresh user data from auth context
        await refreshUser();
        
        toast.success("Profile updated successfully", { duration: 3000 });
        setIsEditing(false);
      } else {
        throw new Error("No data received from server");
      }
    } catch (error: any) {
      logger.error("Failed to update profile:", error);
      
      if (error instanceof ApiError) {
        toast.error(error.message || "Failed to update profile. Please try again.", { duration: 5000 });
      } else if (error?.message) {
        toast.error(error.message, { duration: 5000 });
      } else {
        toast.error("Failed to update profile. Please try again.", { duration: 5000 });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      phone: currentUser.phone || "",
      specialty: currentUser.specialty || "",
      department: currentUser.department || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card-elevated p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {currentUser.firstName[0]}{currentUser.lastName[0]}
              </div>
              {isEditing && (
                <button
                  className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                  title="Change avatar"
                >
                  <Camera size={16} />
                </button>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Shield size={16} className="text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{getRoleName(currentUser.role)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <Mail size={14} />
                <span>{currentUser.email}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Edit2 size={16} />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-sm active:scale-95"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Username</div>
            <div className="font-medium">{currentUser.username}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">User ID</div>
            <div className="font-mono text-sm">{currentUser.id}</div>
          </div>
          {currentUser.lastLogin && (
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Login</div>
              <div className="font-medium">
                {new Date(currentUser.lastLogin).toLocaleString()}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Status</div>
            <div className="flex items-center gap-2">
              {currentUser.isActive ? (
                <>
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-red-600 dark:text-red-400 font-medium">Inactive</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="firstName" className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
                First Name
              </label>
              {isEditing ? (
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  aria-label="First Name"
                  title="First Name"
                  className="input-base px-4 py-3"
                  placeholder="Enter first name"
                />
              ) : (
                <div className="px-4 py-3 text-base bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {currentUser.firstName}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  aria-label="Last Name"
                  title="Last Name"
                  className="input-base px-4 py-3"
                  placeholder="Enter last name"
                />
              ) : (
                <div className="px-4 py-3 text-base bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {currentUser.lastName}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="flex items-center gap-2 text-base font-medium mb-2.5 text-gray-700 dark:text-gray-200">
                <Mail size={16} />
                Email
              </label>
              {isEditing ? (
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  aria-label="Email"
                  title="Email"
                  className="input-base px-4 py-3"
                  placeholder="Enter email address"
                />
              ) : (
                <div className="px-4 py-3 text-base bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {currentUser.email}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="flex items-center gap-2 text-base font-medium mb-2.5 text-gray-700 dark:text-gray-200">
                <Phone size={16} />
                Phone
              </label>
              {isEditing ? (
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  aria-label="Phone"
                  title="Phone"
                  className="input-base px-4 py-3"
                  placeholder="(555) 123-4567"
                />
              ) : (
                <div className="px-4 py-3 text-base bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {currentUser.phone || "Not provided"}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="specialty" className="flex items-center gap-2 text-base font-medium mb-2.5 text-gray-700 dark:text-gray-200">
                <Briefcase size={16} />
                Specialty
              </label>
              {isEditing ? (
                <input
                  id="specialty"
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  aria-label="Specialty"
                  title="Specialty"
                  className="input-base px-4 py-3"
                  placeholder="e.g., Cardiology, Internal Medicine"
                />
              ) : (
                <div className="px-4 py-3 text-base bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {currentUser.specialty || "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="department" className="flex items-center gap-2 text-base font-medium mb-2.5 text-gray-700 dark:text-gray-200">
                <Building2 size={16} />
                Department
              </label>
              {isEditing ? (
                <input
                  id="department"
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  aria-label="Department"
                  title="Department"
                  className="input-base px-4 py-3"
                  placeholder="e.g., Cardiology, Emergency"
                />
              ) : (
                <div className="px-4 py-3 text-base bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {currentUser.department || "Not specified"}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Role & Permissions Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} />
          Role & Permissions
        </h3>
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {getRoleName(currentUser.role)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Role permissions for {getRoleName(currentUser.role)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permissions ({rolePermissions?.length || 0})
            </div>
            <div className="flex flex-wrap gap-2">
              {rolePermissions?.slice(0, 10).map((permission, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded"
                >
                  {permission.replace(/_/g, " ")}
                </span>
              ))}
              {rolePermissions && rolePermissions.length > 10 && (
                <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                  +{rolePermissions.length - 10} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

