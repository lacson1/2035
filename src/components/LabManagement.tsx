import { useState } from "react";
import { 
  FlaskConical, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  AlertCircle, 
  X, 
  CheckCircle,
  FileText,
  Clock,
  Building2,
  User,
  Printer
} from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { useUser } from "../context/UserContext";
import { Patient, LabResult, LabStatus } from "../types";
import UserAssignment from "./UserAssignment";
import { useUsers } from "../hooks/useUsers";
import FormAutocomplete from "./FormAutocomplete";
import { commonLabTests } from "../utils/formHelpers";

interface LabManagementProps {
  patient?: Patient;
}

export default function LabManagement({ patient }: LabManagementProps) {
  const { selectedPatient } = useDashboard();
  const { currentUser } = useUser();
  const currentPatient = patient || selectedPatient;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LabStatus>("all");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState<LabResult | null>(null);
  const { users } = useUsers();
  const [labResults, setLabResults] = useState<LabResult[]>(
    currentPatient?.labResults || []
  );

  const [orderFormData, setOrderFormData] = useState({
    testName: "",
    testCode: "",
    category: "Blood Work",
    orderedDate: new Date().toISOString().split("T")[0],
    labName: "LabCorp",
    labLocation: "",
    notes: "",
    useCommonTest: false,
    selectedCommonTest: "",
    assignedTo: null as string | null,
  });

  const filteredResults = labResults.filter((lab) => {
    const matchesSearch = lab.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lab.testCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lab.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lab.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: LabStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "in_progress":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400";
      case "pending_review":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400";
      case "ordered":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: LabStatus) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "pending_review":
        return "Pending Review";
      case "ordered":
        return "Ordered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getFlagColor = (flag?: string) => {
    switch (flag) {
      case "high":
      case "low":
        return "text-orange-600 dark:text-orange-400";
      case "critical":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-green-600 dark:text-green-400";
    }
  };

  const handleOrderLab = (e: React.FormEvent) => {
    e.preventDefault();
    const newLab: LabResult = {
      id: `lab-${Date.now()}`,
      testName: orderFormData.testName,
      testCode: orderFormData.testCode || undefined,
      category: orderFormData.category,
      orderedDate: orderFormData.orderedDate,
      status: "ordered",
      orderingPhysician: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : undefined,
      orderingPhysicianId: currentUser?.id,
      labName: orderFormData.labName,
      labLocation: orderFormData.labLocation || undefined,
      notes: orderFormData.notes || undefined,
    };
    setLabResults([...labResults, newLab]);
    setOrderFormData({
      testName: "",
      testCode: "",
      category: "Blood Work",
      orderedDate: new Date().toISOString().split("T")[0],
      labName: "LabCorp",
      labLocation: "",
      notes: "",
      useCommonTest: false,
      selectedCommonTest: "",
      assignedTo: null,
    });
    setShowOrderForm(false);
  };

  const handleViewResults = (lab: LabResult) => {
    setSelectedLab(lab);
    setShowResultsModal(true);
  };

  const handlePrint = (lab: LabResult) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lab Report - ${lab.testName}</title>
          <style>
            @page {
              margin: 1in;
              size: letter;
            }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #1e40af;
            }
            .header h2 {
              margin: 5px 0 0 0;
              font-size: 18px;
              color: #4b5563;
              font-weight: normal;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 30px;
            }
            .info-item {
              padding: 10px;
              background: #f9fafb;
              border-radius: 4px;
            }
            .info-label {
              font-size: 11px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            .info-value {
              font-size: 14px;
              font-weight: 600;
              color: #111827;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th {
              background: #2563eb;
              color: white;
              padding: 12px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            tr:nth-child(even) {
              background: #f9fafb;
            }
            .flag-high, .flag-low {
              color: #f59e0b;
              font-weight: 600;
            }
            .flag-critical {
              color: #dc2626;
              font-weight: 600;
            }
            .flag-normal {
              color: #059669;
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
            .interpretation {
              background: #eff6ff;
              padding: 15px;
              border-left: 4px solid #2563eb;
              border-radius: 4px;
              margin: 20px 0;
            }
            .notes {
              background: #f9fafb;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
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
          <div class="header">
            <h1>LABORATORY REPORT</h1>
            <h2>${lab.testName}${lab.testCode ? ` (${lab.testCode})` : ""}</h2>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Patient Name</div>
              <div class="info-value">${currentPatient?.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Test Code</div>
              <div class="info-value">${lab.testCode || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Category</div>
              <div class="info-value">${lab.category || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Ordered Date</div>
              <div class="info-value">${new Date(lab.orderedDate).toLocaleDateString()}</div>
            </div>
            ${lab.collectedDate ? `
            <div class="info-item">
              <div class="info-label">Collected Date</div>
              <div class="info-value">${new Date(lab.collectedDate).toLocaleDateString()}</div>
            </div>
            ` : ""}
            ${lab.resultDate ? `
            <div class="info-item">
              <div class="info-label">Result Date</div>
              <div class="info-value">${new Date(lab.resultDate).toLocaleDateString()}</div>
            </div>
            ` : ""}
            ${lab.orderingPhysician ? `
            <div class="info-item">
              <div class="info-label">Ordering Physician</div>
              <div class="info-value">${lab.orderingPhysician}</div>
            </div>
            ` : ""}
            ${lab.labName ? `
            <div class="info-item">
              <div class="info-label">Laboratory</div>
              <div class="info-value">${lab.labName}</div>
            </div>
            ` : ""}
          </div>

          ${lab.results && Object.keys(lab.results).length > 0 ? `
          <div class="section">
            <div class="section-title">Test Results</div>
            <table>
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Result</th>
                  <th>Reference Range</th>
                  <th>Flag</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(lab.results).map(([key, result]) => `
                  <tr>
                    <td><strong>${key}</strong></td>
                    <td>${result.value} ${result.unit || ""}</td>
                    <td>${result.referenceRange || lab.referenceRanges?.[key] || "N/A"}</td>
                    <td class="${result.flag ? `flag-${result.flag}` : 'flag-normal'}">${result.flag ? result.flag.toUpperCase() : "NORMAL"}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ""}

          ${lab.interpretation ? `
          <div class="section">
            <div class="section-title">Clinical Interpretation</div>
            <div class="interpretation">${lab.interpretation}</div>
          </div>
          ` : ""}

          ${lab.notes ? `
          <div class="section">
            <div class="section-title">Notes</div>
            <div class="notes">${lab.notes}</div>
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

  const handleDownload = (lab: LabResult) => {
    // Create a text representation of the lab results
    let content = `LABORATORY REPORT\n`;
    content += `========================================\n\n`;
    content += `Patient: ${currentPatient?.name}\n`;
    content += `Test: ${lab.testName}${lab.testCode ? ` (${lab.testCode})` : ""}\n`;
    content += `Category: ${lab.category || "N/A"}\n`;
    content += `Ordered Date: ${new Date(lab.orderedDate).toLocaleDateString()}\n`;
    if (lab.collectedDate) {
      content += `Collected Date: ${new Date(lab.collectedDate).toLocaleDateString()}\n`;
    }
    if (lab.resultDate) {
      content += `Result Date: ${new Date(lab.resultDate).toLocaleDateString()}\n`;
    }
    content += `Status: ${getStatusLabel(lab.status)}\n`;
    if (lab.orderingPhysician) {
      content += `Ordering Physician: ${lab.orderingPhysician}\n`;
    }
    if (lab.labName) {
      content += `Laboratory: ${lab.labName}\n`;
    }
    content += `\n========================================\n\n`;

    if (lab.results) {
      content += `RESULTS:\n`;
      content += `----------------------------------------\n`;
      Object.entries(lab.results).forEach(([key, result]) => {
        content += `${key}: ${result.value} ${result.unit || ""}`;
        if (result.referenceRange) {
          content += ` (Ref: ${result.referenceRange})`;
        }
        if (result.flag && result.flag !== "normal") {
          content += ` [${result.flag.toUpperCase()}]`;
        }
        content += `\n`;
      });
      content += `\n`;
    }

    if (lab.referenceRanges) {
      content += `REFERENCE RANGES:\n`;
      content += `----------------------------------------\n`;
      Object.entries(lab.referenceRanges).forEach(([key, range]) => {
        content += `${key}: ${range}\n`;
      });
      content += `\n`;
    }

    if (lab.interpretation) {
      content += `INTERPRETATION:\n`;
      content += `----------------------------------------\n`;
      content += `${lab.interpretation}\n\n`;
    }

    if (lab.notes) {
      content += `NOTES:\n`;
      content += `----------------------------------------\n`;
      content += `${lab.notes}\n\n`;
    }

    content += `========================================\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;

    // Create and download file
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lab.testCode || lab.testName}_${new Date(lab.resultDate || lab.orderedDate).toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [labToAssign, setLabToAssign] = useState<LabResult | null>(null);

  const handleAssignForReview = (lab: LabResult) => {
    setLabToAssign(lab);
    setShowAssignModal(true);
  };

  const handleAssignReview = (userId: string | null) => {
    if (!labToAssign) return;
    
    const updatedLab = {
      ...labToAssign,
      assignedForReview: userId || undefined,
      status: userId ? ("pending_review" as LabStatus) : labToAssign.status,
    };
    
    setLabResults(labResults.map(l => l.id === labToAssign.id ? updatedLab : l));
    setShowAssignModal(false);
    setLabToAssign(null);
  };

  const handleReview = (lab: LabResult) => {
    const updatedLab = {
      ...lab,
      status: "completed" as LabStatus,
      reviewedById: currentUser?.id,
      reviewedAt: new Date().toISOString(),
      assignedForReview: undefined, // Clear assignment after review
    };
    setLabResults(labResults.map(l => l.id === lab.id ? updatedLab : l));
    setSelectedLab(updatedLab);
    setShowResultsModal(true);
  };

  const handleCommonTestSelect = (testName: string) => {
    const test = commonLabTests.find(t => t.label === testName || t.value === testName);
    if (test) {
      setOrderFormData({
        ...orderFormData,
        testName: test.label,
        testCode: test.value,
        category: test.category || "Blood Work",
        selectedCommonTest: testName,
      });
    }
  };

  if (!currentPatient) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium mb-2">No Patient Selected</p>
        <p className="text-sm">Please select a patient to view lab results.</p>
      </div>
    );
  }

  return (
    <div className="section-spacing">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FlaskConical className="text-blue-600 dark:text-blue-400" size={24} />
            Lab Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage lab orders and results for {currentPatient.name}
          </p>
        </div>
        <button
          onClick={() => setShowOrderForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Order Lab Test
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search lab tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LabStatus)}
              aria-label="Filter by status"
              title="Filter by status"
              className="px-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="ordered">Ordered</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="pending_review">Pending Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lab Results List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredResults.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FlaskConical size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">No Lab Results Found</p>
            <p className="text-sm">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No lab tests have been ordered for this patient"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredResults.map((lab) => (
              <div
                key={lab.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {lab.testName}
                      </h3>
                      {lab.testCode && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                          {lab.testCode}
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(lab.status)}`}>
                        {getStatusLabel(lab.status)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Ordered: {new Date(lab.orderedDate).toLocaleDateString()}
                      </span>
                      {lab.collectedDate && (
                        <span className="flex items-center gap-1">
                          Collected: {new Date(lab.collectedDate).toLocaleDateString()}
                        </span>
                      )}
                      {lab.resultDate && (
                        <span className="flex items-center gap-1">
                          Results: {new Date(lab.resultDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>Category: {lab.category}</span>
                      {lab.orderingPhysician && (
                        <span>Ordered by: {lab.orderingPhysician}</span>
                      )}
                      {lab.labName && <span>Lab: {lab.labName}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {/* Show assignment status */}
                    {lab.assignedForReview && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                        Assigned for review
                      </div>
                    )}
                    {lab.status === "completed" && (
                      <>
                        <button
                          onClick={() => handleViewResults(lab)}
                          className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          title="View Results"
                          aria-label="View Results"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleAssignForReview(lab)}
                          className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                          title="Assign for Review"
                          aria-label="Assign for Review"
                        >
                          <User size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(lab)}
                          className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          title="Download Results"
                          aria-label="Download Results"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handlePrint(lab)}
                          className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          title="Print Results"
                          aria-label="Print Results"
                        >
                          <Printer size={18} />
                        </button>
                      </>
                    )}
                    {lab.status === "pending_review" && (
                      <>
                        <button
                          onClick={() => handleReview(lab)}
                          className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                          title="Review Results"
                          aria-label="Review Results"
                        >
                          <AlertCircle size={18} />
                        </button>
                        {!lab.assignedForReview && (
                          <button
                            onClick={() => handleAssignForReview(lab)}
                            className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                            title="Assign for Review"
                            aria-label="Assign for Review"
                          >
                            <User size={18} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Lab Test Modal */}
      {showOrderForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowOrderForm(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order Lab Test</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create a new lab order for {currentPatient.name}</p>
              </div>
              <button
                onClick={() => setShowOrderForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close order form"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleOrderLab} className="p-6 space-y-5">
              {/* Common Tests Quick Select */}
              <div>
                <label className="block text-base font-medium mb-2.5" htmlFor="common-test-select">Quick Select Common Test</label>
                <select
                  id="common-test-select"
                  value={orderFormData.selectedCommonTest}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleCommonTestSelect(e.target.value);
                    }
                  }}
                  aria-label="Select a common test"
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                >
                  <option value="">Select a common test...</option>
                  {commonLabTests.map((test) => (
                    <option key={test.value} value={test.label}>
                      {test.label} - {test.category || "General"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <FormAutocomplete
                    value={orderFormData.testName}
                    onChange={(value) => {
                      const test = commonLabTests.find(t => t.value === value || t.label === value);
                      setOrderFormData({ 
                        ...orderFormData, 
                        testName: value,
                        testCode: test?.value === value ? test.value.split(" ")[0] : orderFormData.testCode,
                      });
                    }}
                    options={commonLabTests}
                    placeholder="e.g., Complete Blood Count"
                    label="Test Name"
                    required
                    fieldName="testName"
                    maxSuggestions={12}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5" htmlFor="test-code-input">Test Code (Optional)</label>
                  <input
                    id="test-code-input"
                    type="text"
                    value={orderFormData.testCode}
                    onChange={(e) => setOrderFormData({ ...orderFormData, testCode: e.target.value })}
                    placeholder="e.g., CBC"
                    aria-label="Test code"
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5" htmlFor="category-select">Category <span className="text-red-500">*</span></label>
                  <select
                    id="category-select"
                    required
                    value={orderFormData.category}
                    onChange={(e) => setOrderFormData({ ...orderFormData, category: e.target.value })}
                    aria-label="Select lab category"
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  >
                    <option value="Blood Work">Blood Work</option>
                    <option value="Urine">Urine</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Hormones">Hormones</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5" htmlFor="order-date-input">Order Date <span className="text-red-500">*</span></label>
                  <input
                    id="order-date-input"
                    type="date"
                    required
                    value={orderFormData.orderedDate}
                    onChange={(e) => setOrderFormData({ ...orderFormData, orderedDate: e.target.value })}
                    max={new Date().toISOString().split("T")[0]}
                    aria-label="Order date"
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Lab Name</label>
                  <input
                    type="text"
                    value={orderFormData.labName}
                    onChange={(e) => setOrderFormData({ ...orderFormData, labName: e.target.value })}
                    placeholder="e.g., LabCorp"
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Lab Location (Optional)</label>
                  <input
                    type="text"
                    value={orderFormData.labLocation}
                    onChange={(e) => setOrderFormData({ ...orderFormData, labLocation: e.target.value })}
                    placeholder="Lab address or location"
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5" htmlFor="notes-textarea">Notes (Optional)</label>
                <textarea
                  id="notes-textarea"
                  value={orderFormData.notes}
                  onChange={(e) => setOrderFormData({ ...orderFormData, notes: e.target.value })}
                  placeholder="Additional notes or instructions..."
                  rows={3}
                  aria-label="Notes"
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Assign to Lab Technician */}
              <UserAssignment
                assignedTo={orderFormData.assignedTo}
                allowedRoles={["lab_technician"]}
                label="Assign to Lab Technician"
                placeholder="Select lab technician..."
                onAssign={(userId) => setOrderFormData({ ...orderFormData, assignedTo: userId })}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 transition-colors"
                  aria-label="Cancel order form"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Order Lab Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Results Modal */}
      {showResultsModal && selectedLab && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowResultsModal(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedLab.testName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedLab.testCode && `Test Code: ${selectedLab.testCode}`} {selectedLab.category && `• ${selectedLab.category}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selectedLab)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Download"
                  aria-label="Download Results"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => handlePrint(selectedLab)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Print"
                  aria-label="Print Results"
                >
                  <Printer size={20} />
                </button>
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Close results modal"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Lab Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="text-blue-600 dark:text-blue-400" size={16} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Ordered</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(selectedLab.orderedDate).toLocaleDateString()}
                  </p>
                </div>
                {selectedLab.collectedDate && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="text-green-600 dark:text-green-400" size={16} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Collected</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(selectedLab.collectedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedLab.resultDate && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="text-purple-600 dark:text-purple-400" size={16} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Results</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(selectedLab.resultDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-gray-600 dark:text-gray-400" size={16} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</span>
                  </div>
                  <p className={`text-sm font-semibold ${getStatusColor(selectedLab.status)}`}>
                    {getStatusLabel(selectedLab.status)}
                  </p>
                </div>
              </div>

              {/* Lab Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedLab.orderingPhysician && (
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Ordering Physician:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedLab.orderingPhysician}</span>
                  </div>
                )}
                {selectedLab.labName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Laboratory:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedLab.labName}</span>
                  </div>
                )}
              </div>

              {/* Results Table */}
              {selectedLab.results && Object.keys(selectedLab.results).length > 0 && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">Test Results</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Test</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Result</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Reference Range</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Object.entries(selectedLab.results).map(([key, result]) => (
                          <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{key}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {result.value} {result.unit || ""}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {result.referenceRange || selectedLab.referenceRanges?.[key] || "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              {result.flag && (
                                <span className={`text-xs font-medium px-2 py-1 rounded ${getFlagColor(result.flag)}`}>
                                  {result.flag.toUpperCase()}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Interpretation */}
              {selectedLab.interpretation && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Clinical Interpretation</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedLab.interpretation}</p>
                </div>
              )}

              {/* Notes */}
              {selectedLab.notes && (
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedLab.notes}</p>
                </div>
              )}

              {/* Assignment Info */}
              {selectedLab.assignedForReview && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="text-purple-600 dark:text-purple-400" size={20} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Assigned for Review</p>
                        {(() => {
                          const assignedUser = users.find((u) => u.id === selectedLab.assignedForReview);
                          return assignedUser ? (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {assignedUser.firstName} {assignedUser.lastName} ({assignedUser.role.replace("_", " ")})
                            </p>
                          ) : null;
                        })()}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const updatedLab = { ...selectedLab, assignedForReview: undefined };
                        setLabResults(labResults.map(l => l.id === selectedLab.id ? updatedLab : l));
                        setSelectedLab(updatedLab);
                      }}
                      title="Remove assignment"
                      aria-label="Remove assignment"
                      className="text-xs px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
                    >
                      Unassign
                    </button>
                  </div>
                </div>
              )}

              {/* Review Info */}
              {selectedLab.reviewedAt && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Reviewed</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(selectedLab.reviewedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign for Review Modal */}
      {showAssignModal && labToAssign && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAssignModal(false);
              setLabToAssign(null);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Assign for Review</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Assign lab result to a physician or nurse for review
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setLabToAssign(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close assign modal"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {labToAssign.testName}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {labToAssign.testCode && `${labToAssign.testCode} • `}
                  {labToAssign.category && labToAssign.category}
                  {labToAssign.resultDate && ` • ${new Date(labToAssign.resultDate).toLocaleDateString()}`}
                </p>
              </div>

              <UserAssignment
                assignedTo={labToAssign.assignedForReview || undefined}
                allowedRoles={["physician", "nurse", "nurse_practitioner", "physician_assistant"]}
                label="Assign to"
                placeholder="Select physician or nurse..."
                onAssign={handleAssignReview}
                showCurrentAssignment={true}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setLabToAssign(null);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
