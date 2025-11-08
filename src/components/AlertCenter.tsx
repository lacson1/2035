import { useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Search,
  Clock,
} from "lucide-react";
import { Alert, AlertType, AlertSeverity, getAlertCounts } from "../utils/alertSystem";
import AlertBadge from "./AlertBadge";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

interface AlertCenterProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onBulkAcknowledge?: (alertIds: string[]) => void;
  onDismiss?: (alertId: string) => void;
}

export default function AlertCenter({
  alerts,
  onAcknowledge,
  onBulkAcknowledge,
  onDismiss,
}: AlertCenterProps) {
  const toast = useToast();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | "all">("all");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filterType, setFilterType] = useState<AlertType | "all">("all");
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());

  const alertCounts = getAlertCounts(alerts);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch =
        searchQuery === "" ||
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity =
        filterSeverity === "all" || alert.severity === filterSeverity;

      const matchesType = filterType === "all" || alert.type === filterType;

      return matchesSearch && matchesSeverity && matchesType;
    });
  }, [alerts, searchQuery, filterSeverity, filterType]);

  const unacknowledgedAlerts = filteredAlerts.filter((a) => !a.acknowledged);
  const acknowledgedAlerts = filteredAlerts.filter((a) => a.acknowledged);

  const handleBulkAcknowledge = () => {
    if (selectedAlerts.size === 0) {
      toast.warning("Please select alerts to acknowledge");
      return;
    }

    if (onBulkAcknowledge) {
      onBulkAcknowledge(Array.from(selectedAlerts));
      toast.success(`Acknowledged ${selectedAlerts.size} alert(s)`);
      setSelectedAlerts(new Set());
    } else {
      selectedAlerts.forEach((alertId) => {
        onAcknowledge(alertId);
      });
      toast.success(`Acknowledged ${selectedAlerts.size} alert(s)`);
      setSelectedAlerts(new Set());
    }
  };

  const toggleSelectAlert = (alertId: string) => {
    setSelectedAlerts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedAlerts.size === unacknowledgedAlerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(unacknowledgedAlerts.map((a) => a.id)));
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Alert Center
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage patient alerts and notifications
            </p>
          </div>
          {selectedAlerts.size > 0 && (
            <button
              onClick={handleBulkAcknowledge}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <CheckCircle size={16} />
              Acknowledge {selectedAlerts.size}
            </button>
          )}
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {alertCounts.critical}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">Critical</div>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {alertCounts.high}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">High</div>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {alertCounts.medium}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Medium</div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {alertCounts.low}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Low</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterSeverity("all")}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filterSeverity === "all"
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            All Severities
          </button>
          {(["critical", "high", "medium", "low"] as AlertSeverity[]).map((severity) => (
            <button
              key={severity}
              onClick={() => setFilterSeverity(severity)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors capitalize ${
                filterSeverity === severity
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {severity}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Unacknowledged Alerts */}
        {unacknowledgedAlerts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Active Alerts ({unacknowledgedAlerts.length})
              </h3>
              {unacknowledgedAlerts.length > 0 && (
                <button
                  onClick={selectAll}
                  className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                >
                  {selectedAlerts.size === unacknowledgedAlerts.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {unacknowledgedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`
                    p-4 rounded-lg border transition-all
                    ${
                      selectedAlerts.has(alert.id)
                        ? "bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedAlerts.has(alert.id)}
                      onChange={() => toggleSelectAlert(alert.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <AlertBadge
                        alert={alert}
                        onAcknowledge={onAcknowledge}
                        onDismiss={onDismiss}
                        size="md"
                        showMessage
                      />
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                        <span className="capitalize">{alert.type.replace("-", " ")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acknowledged Alerts */}
        {acknowledgedAlerts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Acknowledged ({acknowledgedAlerts.length})
            </h3>
            <div className="space-y-2">
              {acknowledgedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                >
                  <AlertBadge alert={alert} size="md" showMessage />
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <CheckCircle size={12} />
                      Acknowledged{" "}
                      {alert.acknowledgedAt
                        ? new Date(alert.acknowledgedAt).toLocaleString()
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No alerts found</p>
            <p className="text-sm mt-1">
              {alerts.length === 0
                ? "No alerts for this patient"
                : "Try adjusting your filters"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

