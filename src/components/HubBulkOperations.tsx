import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  MoreHorizontal,
  Trash2,
  Archive,
  Tag,
  Download,
  Upload,
  AlertTriangle,
  X
} from 'lucide-react';
import { Hub } from '../data/hubs';
import { Patient } from '../types/patient';
import { filterPatientsByHub, getHubStats } from '../utils/hubIntegration';

interface HubBulkOperationsProps {
  hubs: Hub[];
  patients: Patient[];
  selectedHubs: string[];
  onSelectionChange: (hubIds: string[]) => void;
  onClose: () => void;
}

type BulkAction = 'archive' | 'delete' | 'export' | 'tag' | 'transfer-patients';

interface BulkActionConfig {
  id: BulkAction;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  variant: 'danger' | 'warning' | 'primary';
  requiresConfirmation?: boolean;
}

const BULK_ACTIONS: BulkActionConfig[] = [
  {
    id: 'export',
    label: 'Export Data',
    description: 'Download hub data and patient records as CSV/JSON',
    icon: Download,
    variant: 'primary'
  },
  {
    id: 'tag',
    label: 'Add Tags',
    description: 'Apply tags to selected hubs for better organization',
    icon: Tag,
    variant: 'primary'
  },
  {
    id: 'transfer-patients',
    label: 'Transfer Patients',
    description: 'Move patients from selected hubs to another hub',
    icon: Upload,
    variant: 'warning'
  },
  {
    id: 'archive',
    label: 'Archive Hubs',
    description: 'Move selected hubs to archive (can be restored later)',
    icon: Archive,
    variant: 'warning',
    requiresConfirmation: true
  },
  {
    id: 'delete',
    label: 'Delete Hubs',
    description: 'Permanently delete selected hubs and their data',
    icon: Trash2,
    variant: 'danger',
    requiresConfirmation: true
  }
];

export default function HubBulkOperations({
  hubs,
  patients,
  selectedHubs,
  onSelectionChange,
  onClose
}: HubBulkOperationsProps) {
  const [showActionDialog, setShowActionDialog] = useState<BulkAction | null>(null);
  const [confirmationText, setConfirmationText] = useState('');

  // Get selected hub data
  const selectedHubData = useMemo(() => {
    return selectedHubs.map(hubId => {
      const hub = hubs.find(h => h.id === hubId)!;
      const hubPatients = filterPatientsByHub(patients, hubId);
      const stats = getHubStats(patients, hubId);

      return {
        hub,
        patientCount: hubPatients.length,
        activeAppointments: stats?.activeAppointments ?? 0,
        recentNotes: stats?.recentNotes ?? 0
      };
    });
  }, [selectedHubs, hubs, patients]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    return selectedHubData.reduce(
      (acc, data) => ({
        totalPatients: acc.totalPatients + data.patientCount,
        totalAppointments: acc.totalAppointments + data.activeAppointments,
        totalNotes: acc.totalNotes + data.recentNotes
      }),
      { totalPatients: 0, totalAppointments: 0, totalNotes: 0 }
    );
  }, [selectedHubData]);

  const handleSelectAll = () => {
    if (selectedHubs.length === hubs.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(hubs.map(h => h.id));
    }
  };

  const handleHubToggle = (hubId: string) => {
    if (selectedHubs.includes(hubId)) {
      onSelectionChange(selectedHubs.filter(id => id !== hubId));
    } else {
      onSelectionChange([...selectedHubs, hubId]);
    }
  };

  const handleActionExecute = (action: BulkAction) => {
    // Here you would implement the actual bulk operations
    // For now, we'll just show a success message
    console.log(`Executing bulk action: ${action} on hubs:`, selectedHubs);

    // Simulate API call
    setTimeout(() => {
      alert(`Successfully executed ${action} on ${selectedHubs.length} hubs`);
      setShowActionDialog(null);
      onSelectionChange([]);
      onClose();
    }, 1000);
  };

  const getActionVariantClasses = (variant: BulkActionConfig['variant']) => {
    switch (variant) {
      case 'danger':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30';
      default:
        return 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/30';
    }
  };

  if (selectedHubs.length === 0) {
    return null;
  }

  return (
    <>
      {/* Bulk Operations Bar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[500px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  {selectedHubs.length === hubs.length ? (
                    <CheckSquare size={16} />
                  ) : (
                    <Square size={16} />
                  )}
                  {selectedHubs.length} selected
                </button>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {summaryStats.totalPatients} patients • {summaryStats.totalAppointments} appointments
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {BULK_ACTIONS.map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => setShowActionDialog(action.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${getActionVariantClasses(action.variant)}`}
                >
                  <IconComponent size={16} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Confirmation Dialog */}
      {showActionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full">
            {(() => {
              const action = BULK_ACTIONS.find(a => a.id === showActionDialog)!;
              const IconComponent = action.icon;

              return (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-full ${
                      action.variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                      action.variant === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                      'bg-teal-100 dark:bg-teal-900/30 text-teal-600'
                    }`}>
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {action.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  {/* Selected Hubs List */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Selected Hubs ({selectedHubs.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {selectedHubData.map(({ hub, patientCount }) => (
                        <div key={hub.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{hub.name}</span>
                          <span className="text-gray-500 dark:text-gray-400">{patientCount} patients</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirmation Warning */}
                  {action.requiresConfirmation && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                            This action cannot be undone
                          </p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            {action.id === 'delete'
                              ? 'All hub data, patient associations, and custom functions will be permanently deleted.'
                              : 'Selected hubs will be moved to archive and hidden from the main interface.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confirmation Input for Dangerous Actions */}
                  {action.requiresConfirmation && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type "{action.label.toLowerCase()}" to confirm
                      </label>
                      <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder={`Type "${action.label.toLowerCase()}"`}
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowActionDialog(null);
                        setConfirmationText('');
                      }}
                      className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleActionExecute(action.id)}
                      disabled={action.requiresConfirmation && confirmationText !== action.label.toLowerCase()}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        action.variant === 'danger'
                          ? 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed'
                          : action.variant === 'warning'
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed'
                          : 'bg-teal-500 text-white hover:bg-teal-600 disabled:bg-teal-300 disabled:cursor-not-allowed'
                      }`}
                    >
                      {action.label}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}
