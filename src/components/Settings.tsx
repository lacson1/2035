import { useState, useEffect, useRef } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Moon,
  Sun,
  Shield,
  Database,
  Download,
  Trash2,
  Save,
  CheckCircle,
  AlertTriangle,
  X,
  Ruler,
  DollarSign,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { settingsService } from "../services/settings";
import { ApiError } from "../services/api";
import { MeasurementSystem, getMeasurementSystem, setMeasurementSystem } from "../utils/measurements";
import { getCurrencyOptions } from "../utils/currency";

interface UserPreferences {
  theme: "light" | "dark" | "system";
  measurementSystem: MeasurementSystem;
  currency?: string;
  notifications: {
    email: boolean;
    inApp: boolean;
    appointmentReminders: boolean;
    labResults: boolean;
    medicationAlerts: boolean;
  };
  dashboard: {
    defaultView: string;
    itemsPerPage: number;
    showRecentActivity: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    dataRetention: number; // days
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  measurementSystem: "uk",
  currency: "USD",
  notifications: {
    email: true,
    inApp: true,
    appointmentReminders: true,
    labResults: true,
    medicationAlerts: true,
  },
  dashboard: {
    defaultView: "overview",
    itemsPerPage: 25,
    showRecentActivity: true,
  },
  privacy: {
    shareAnalytics: false,
    dataRetention: 365,
  },
};

export default function Settings() {
  const { currentUser } = useUser();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyTheme = (theme: "light" | "dark" | "system") => {
    try {
      if (typeof document === "undefined") return;
      
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (theme === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        // System theme - check system preference
        try {
          const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          document.documentElement.classList.toggle("dark", systemPrefersDark);
        } catch (e) {
          // Fallback if matchMedia fails
          document.documentElement.classList.remove("dark");
        }
      }
    } catch (error) {
      // Silently fail theme application
      if (import.meta.env.DEV) {
        console.warn("Failed to apply theme:", error);
      }
    }
  };

  useEffect(() => {
    // Load preferences from API
    const loadPreferences = async () => {
      try {
        // Load measurement system preference first
        const measurementSystem = getMeasurementSystem();
        
        if (!currentUser?.id) {
          // No user, but still load defaults from localStorage if available
          try {
            const saved = localStorage.getItem('userPreferences_default');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed && typeof parsed === 'object') {
                const merged = {
                  ...DEFAULT_PREFERENCES,
                  ...parsed,
                  measurementSystem: parsed.measurementSystem || measurementSystem,
                  notifications: {
                    ...DEFAULT_PREFERENCES.notifications,
                    ...(parsed.notifications || {}),
                  },
                  dashboard: {
                    ...DEFAULT_PREFERENCES.dashboard,
                    ...(parsed.dashboard || {}),
                  },
                  privacy: {
                    ...DEFAULT_PREFERENCES.privacy,
                    ...(parsed.privacy || {}),
                  },
                };
                setPreferences(merged);
                applyTheme(merged.theme);
                setMeasurementSystem(merged.measurementSystem);
              }
            } else {
              const prefs = { ...DEFAULT_PREFERENCES, measurementSystem };
              setPreferences(prefs);
              applyTheme(prefs.theme);
              setMeasurementSystem(measurementSystem);
            }
          } catch (e) {
            const prefs = { ...DEFAULT_PREFERENCES, measurementSystem };
            setPreferences(prefs);
            applyTheme(prefs.theme);
            setMeasurementSystem(measurementSystem);
          }
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        
        // Try API first
        try {
          const response = await settingsService.getPreferences();
          
          if (response && response.data) {
            // Merge API response with defaults to ensure all nested properties exist
            const currentMeasurementSystem = getMeasurementSystem();
            const merged = {
              ...DEFAULT_PREFERENCES,
              ...response.data,
              measurementSystem: (response.data as any).measurementSystem || currentMeasurementSystem,
              notifications: {
                ...DEFAULT_PREFERENCES.notifications,
                ...(response.data.notifications || {}),
              },
              dashboard: {
                ...DEFAULT_PREFERENCES.dashboard,
                ...(response.data.dashboard || {}),
              },
              privacy: {
                ...DEFAULT_PREFERENCES.privacy,
                ...(response.data.privacy || {}),
              },
            };
            setPreferences(merged);
            applyTheme(merged.theme);
            setMeasurementSystem(merged.measurementSystem);
            setIsLoading(false);
            return;
          }
        } catch (apiError) {
          // API call failed, continue to localStorage fallback
          // Don't log in production to avoid console noise
        }

        // Fallback to localStorage if API fails or no data
        try {
          const saved = localStorage.getItem(`userPreferences_${currentUser.id}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object') {
              // Merge with defaults to ensure all fields exist
              const currentMeasurementSystem = getMeasurementSystem();
              const merged = {
                ...DEFAULT_PREFERENCES,
                ...parsed,
                measurementSystem: parsed.measurementSystem || currentMeasurementSystem,
                notifications: {
                  ...DEFAULT_PREFERENCES.notifications,
                  ...(parsed.notifications || {}),
                },
                dashboard: {
                  ...DEFAULT_PREFERENCES.dashboard,
                  ...(parsed.dashboard || {}),
                },
                privacy: {
                  ...DEFAULT_PREFERENCES.privacy,
                  ...(parsed.privacy || {}),
                },
              };
              setPreferences(merged);
              applyTheme(merged.theme);
              setMeasurementSystem(merged.measurementSystem);
            } else {
              throw new Error("Invalid preferences format");
            }
          } else {
            // No saved preferences, use defaults
            const currentMeasurementSystem = getMeasurementSystem();
            const prefs = { ...DEFAULT_PREFERENCES, measurementSystem: currentMeasurementSystem };
            setPreferences(prefs);
            applyTheme(prefs.theme);
            setMeasurementSystem(currentMeasurementSystem);
          }
        } catch (e) {
          // Use defaults if localStorage parse fails
          const currentMeasurementSystem = getMeasurementSystem();
          const prefs = { ...DEFAULT_PREFERENCES, measurementSystem: currentMeasurementSystem };
          setPreferences(prefs);
          applyTheme(prefs.theme);
          setMeasurementSystem(currentMeasurementSystem);
        }
        } catch (error) {
        // Final fallback - use defaults
        if (import.meta.env.DEV) {
          console.error("Error loading settings:", error);
        }
        const currentMeasurementSystem = getMeasurementSystem();
        const prefs = { ...DEFAULT_PREFERENCES, measurementSystem: currentMeasurementSystem };
        setPreferences(prefs);
        applyTheme(prefs.theme);
        setMeasurementSystem(currentMeasurementSystem);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [currentUser?.id]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    if (!currentUser?.id) {
      setSaveStatus("error");
      setErrorMessage("User not found. Please log in again.");
      return;
    }

    // Clear any existing timeout
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = null;
    }

    setIsSaving(true);
    setSaveStatus("idle");
    setErrorMessage("");

    try {
      // Try to save to API first
      try {
        const response = await settingsService.savePreferences(preferences);
        
        // Update preferences with server response if available
        if (response && response.data) {
          // Merge with defaults to ensure all nested properties exist
          const merged = {
            ...DEFAULT_PREFERENCES,
            ...response.data,
            notifications: {
              ...DEFAULT_PREFERENCES.notifications,
              ...(response.data.notifications || {}),
            },
            dashboard: {
              ...DEFAULT_PREFERENCES.dashboard,
              ...(response.data.dashboard || {}),
            },
            privacy: {
              ...DEFAULT_PREFERENCES.privacy,
              ...(response.data.privacy || {}),
            },
          };
          setPreferences(merged);
          applyTheme(merged.theme ?? DEFAULT_PREFERENCES.theme);
        } else {
          // Save successful but no data returned, use current preferences
          applyTheme(preferences.theme ?? DEFAULT_PREFERENCES.theme);
        }
      } catch (apiError) {
        // API save failed, but continue to save locally
        if (import.meta.env.DEV) {
          console.log("Settings API unavailable, saving to localStorage only");
        }
      }
      
      // Always save to localStorage as backup/primary storage
      localStorage.setItem(`userPreferences_${currentUser.id}`, JSON.stringify(preferences));
      applyTheme(preferences.theme ?? DEFAULT_PREFERENCES.theme);
      setMeasurementSystem(preferences.measurementSystem ?? DEFAULT_PREFERENCES.measurementSystem);

      setSaveStatus("success");
      statusTimeoutRef.current = setTimeout(() => {
        setSaveStatus("idle");
        statusTimeoutRef.current = null;
      }, 3000);
    } catch (error) {
      setSaveStatus("error");
      if (error instanceof ApiError) {
        setErrorMessage(error.message || "Failed to save settings");
      } else {
        setErrorMessage("Failed to save settings. Please try again.");
      }
      
      // Final fallback to localStorage
      try {
        localStorage.setItem(`userPreferences_${currentUser.id}`, JSON.stringify(preferences));
        applyTheme(preferences.theme ?? DEFAULT_PREFERENCES.theme);
        setMeasurementSystem(preferences.measurementSystem ?? DEFAULT_PREFERENCES.measurementSystem);
        // Still show success since we saved locally
        setSaveStatus("success");
        statusTimeoutRef.current = setTimeout(() => {
          setSaveStatus("idle");
          setErrorMessage("");
          statusTimeoutRef.current = null;
        }, 3000);
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error("Failed to save to localStorage", e);
        }
        statusTimeoutRef.current = setTimeout(() => {
          setSaveStatus("idle");
          setErrorMessage("");
          statusTimeoutRef.current = null;
        }, 5000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = <K extends keyof UserPreferences>(
    category: K,
    key: keyof UserPreferences[K],
    value: any
  ) => {
    setPreferences((prev) => {
      const categoryValue = prev[category] as Record<string, any>;
      return {
        ...prev,
        [category]: {
          ...categoryValue,
          [key]: value,
        },
      };
    });
  };

  const exportData = async () => {
    if (!currentUser?.id) {
      alert("User not found. Please log in again.");
      return;
    }

    try {
      const response = await settingsService.exportData();
      const data = response.data;
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-data-${currentUser.id}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      if (error instanceof ApiError) {
        alert(`Failed to export data: ${error.message}`);
      } else {
        alert("Failed to export data. Please try again.");
      }
      
      // Fallback to local export
      const data = {
        user: currentUser,
        preferences,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-data-${currentUser.id}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const clearData = async () => {
    if (!currentUser?.id) {
      alert("User not found. Please log in again.");
      return;
    }

    if (confirm("Are you sure you want to clear all saved preferences? This cannot be undone.")) {
      try {
        await settingsService.clearPreferences();
        setPreferences(DEFAULT_PREFERENCES);
        localStorage.removeItem(`userPreferences_${currentUser.id}`);
        applyTheme(DEFAULT_PREFERENCES.theme);
        
        // Show success message
        setSaveStatus("success");
        statusTimeoutRef.current = setTimeout(() => {
          setSaveStatus("idle");
          statusTimeoutRef.current = null;
        }, 3000);
      } catch (error) {
        if (error instanceof ApiError) {
          alert(`Failed to clear preferences: ${error.message}`);
        } else {
          alert("Failed to clear preferences. Please try again.");
        }
        
        // Fallback to local clear
        localStorage.removeItem(`userPreferences_${currentUser.id}`);
        setPreferences(DEFAULT_PREFERENCES);
        applyTheme(DEFAULT_PREFERENCES.theme);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="section-spacing">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="section-spacing">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your account preferences and application settings
          </p>
        </div>
        {currentUser && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium text-sm"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      {!currentUser && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please log in to save your preferences. Settings will be saved locally until you log in.
          </p>
        </div>
      )}

      {saveStatus === "success" && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between gap-2 text-green-700 dark:text-green-300">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>Settings saved successfully</span>
          </div>
          <button
            onClick={() => {
              if (statusTimeoutRef.current) {
                clearTimeout(statusTimeoutRef.current);
                statusTimeoutRef.current = null;
              }
              setSaveStatus("idle");
            }}
            className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between gap-2 text-red-700 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{errorMessage || "Failed to save settings. Please try again."}</span>
          </div>
          <button
            onClick={() => {
              if (statusTimeoutRef.current) {
                clearTimeout(statusTimeoutRef.current);
                statusTimeoutRef.current = null;
              }
              setSaveStatus("idle");
              setErrorMessage("");
            }}
            className="text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Appearance */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sun size={20} />
          Appearance
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setPreferences((prev) => ({ ...prev, theme }))}
                  className={`flex-1 px-4 py-3 rounded-lg border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    (preferences.theme ?? DEFAULT_PREFERENCES.theme) === theme
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center gap-2 justify-center mb-1">
                    {theme === "light" && <Sun size={18} />}
                    {theme === "dark" && <Moon size={18} />}
                    {theme === "system" && <SettingsIcon size={18} />}
                  </div>
                  <div className="text-sm font-medium capitalize">{theme}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Currency Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign size={20} />
          Currency
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Default Currency</label>
            <select
              value={preferences.currency ?? DEFAULT_PREFERENCES.currency}
              onChange={(e) => setPreferences((prev) => ({ ...prev, currency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getCurrencyOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              This will be used as the default currency for invoices and billing. 
              Supports multiple currencies including Nigerian Naira (NGN), US Dollar (USD), Euro (EUR), and more.
            </p>
          </div>
        </div>
      </div>

      {/* Measurement System */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Ruler size={20} />
          Measurement System
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Units</label>
            <div className="flex gap-2">
              {(["uk", "us"] as const).map((system) => (
                <button
                  key={system}
                  type="button"
                  onClick={() => {
                    setPreferences((prev) => ({ ...prev, measurementSystem: system }));
                    setMeasurementSystem(system);
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    (preferences.measurementSystem ?? DEFAULT_PREFERENCES.measurementSystem) === system
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {system === "uk" ? "UK (Metric)" : "US (Imperial)"}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {system === "uk" ? "°C, kg, cm" : "°F, lbs, inches"}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Temperature, weight, and height will be displayed in the selected unit system.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell size={20} />
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email Notifications</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Receive notifications via email
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications?.email ?? DEFAULT_PREFERENCES.notifications.email}
                onChange={(e) => updatePreference("notifications", "email", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">In-App Notifications</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Show notifications within the application
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications?.inApp ?? DEFAULT_PREFERENCES.notifications.inApp}
                onChange={(e) => updatePreference("notifications", "inApp", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Appointment Reminders</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Get reminded about upcoming appointments
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications?.appointmentReminders ?? DEFAULT_PREFERENCES.notifications.appointmentReminders}
                onChange={(e) => updatePreference("notifications", "appointmentReminders", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Lab Results</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Notify when new lab results are available
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications?.labResults ?? DEFAULT_PREFERENCES.notifications.labResults}
                onChange={(e) => updatePreference("notifications", "labResults", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Medication Alerts</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Alert about medication interactions or changes
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications?.medicationAlerts ?? DEFAULT_PREFERENCES.notifications.medicationAlerts}
                onChange={(e) => updatePreference("notifications", "medicationAlerts", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Dashboard Preferences */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Dashboard Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Default View</label>
            <select
              value={preferences.dashboard?.defaultView ?? DEFAULT_PREFERENCES.dashboard.defaultView}
              onChange={(e) => updatePreference("dashboard", "defaultView", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="overview">Overview</option>
              <option value="vitals">Vitals</option>
              <option value="medications">Medications</option>
              <option value="timeline">Timeline</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Items Per Page: {preferences.dashboard?.itemsPerPage ?? DEFAULT_PREFERENCES.dashboard.itemsPerPage}
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={preferences.dashboard?.itemsPerPage ?? DEFAULT_PREFERENCES.dashboard.itemsPerPage}
              onChange={(e) => updatePreference("dashboard", "itemsPerPage", Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>10</span>
              <span>100</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Show Recent Activity</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Display recent patient activity in dashboard
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.dashboard?.showRecentActivity ?? DEFAULT_PREFERENCES.dashboard.showRecentActivity}
                onChange={(e) => updatePreference("dashboard", "showRecentActivity", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy & Data */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} />
          Privacy & Data
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Share Analytics</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Help improve the application by sharing anonymous usage data
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.privacy?.shareAnalytics ?? DEFAULT_PREFERENCES.privacy.shareAnalytics}
                onChange={(e) => updatePreference("privacy", "shareAnalytics", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Data Retention: {preferences.privacy?.dataRetention ?? DEFAULT_PREFERENCES.privacy.dataRetention} days
            </label>
            <input
              type="range"
              min="30"
              max="730"
              step="30"
              value={preferences.privacy?.dataRetention ?? DEFAULT_PREFERENCES.privacy.dataRetention}
              onChange={(e) => updatePreference("privacy", "dataRetention", Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>30 days</span>
              <span>2 years</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database size={20} />
          Data Management
        </h3>
        <div className="space-y-3">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Download size={16} />
            Export My Data
          </button>
          <button
            onClick={clearData}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            <Trash2 size={16} />
            Clear All Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

