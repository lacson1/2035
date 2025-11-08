import { useState, useEffect } from "react";
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
  Printer,
  Trash2,
  ShoppingCart,
  Info
} from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { useUser } from "../context/UserContext";
import { Patient, LabResult, LabStatus } from "../types";
import UserAssignment from "./UserAssignment";
import { useUsers } from "../hooks/useUsers";
import { getRoleName } from "../data/roles";
import FormAutocomplete from "./FormAutocomplete";
import { commonLabTests } from "../utils/formHelpers";
import PrintPreview from "./PrintPreview";
import { openPrintWindow } from "../utils/popupHandler";
import { getOrganizationHeader, getOrganizationFooter, getOrganizationDetails } from "../utils/organization";
import { labResultsService } from "../services/lab-results";
import { logger } from "../utils/logger";

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
  const [printPreview, setPrintPreview] = useState<{ content: string; title: string } | null>(null);
  const { users } = useUsers();
  const [labResults, setLabResults] = useState<LabResult[]>(
    currentPatient?.labResults || []
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoadingLabResults, setIsLoadingLabResults] = useState(false);

  // Load lab results from API when patient changes
  useEffect(() => {
    const loadLabResults = async () => {
      if (!currentPatient?.id) {
        setLabResults([]);
        return;
      }

      setIsLoadingLabResults(true);
      try {
        const response = await labResultsService.getPatientLabResults(currentPatient.id);
        if (response.data) {
          // Transform backend data to match frontend LabResult type
          const transformedResults = response.data.map((lab: any) => ({
            ...lab,
            orderedDate: lab.orderedDate ? (typeof lab.orderedDate === 'string' ? lab.orderedDate : new Date(lab.orderedDate).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
            collectedDate: lab.collectedDate ? (typeof lab.collectedDate === 'string' ? lab.collectedDate : new Date(lab.collectedDate).toISOString().split('T')[0]) : undefined,
            resultDate: lab.resultDate ? (typeof lab.resultDate === 'string' ? lab.resultDate : new Date(lab.resultDate).toISOString().split('T')[0]) : undefined,
            orderingPhysician: lab.orderingPhysician ? `${lab.orderingPhysician.firstName} ${lab.orderingPhysician.lastName}` : undefined,
          }));
          setLabResults(transformedResults);
        }
      } catch (error) {
        logger.error('Failed to load lab results:', error);
        // Fallback to local data if API fails
        if (currentPatient?.labResults) {
          setLabResults(currentPatient.labResults);
        }
      } finally {
        setIsLoadingLabResults(false);
      }
    };

    loadLabResults();
  }, [currentPatient?.id]);

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

  // Cart for multiple test orders
  const [testCart, setTestCart] = useState<Array<{
    testName: string;
    testCode: string;
    category: string;
    cost?: number;
  }>>([]);
  
  // Order sets (test panels)
  const orderSets = [
    {
      name: "Basic Metabolic Panel",
      tests: [
        { testName: "Basic Metabolic Panel (BMP)", testCode: "BMP", category: "Chemistry", cost: 45 },
      ],
      description: "Glucose, BUN, Creatinine, Electrolytes",
    },
    {
      name: "Complete Metabolic Panel",
      tests: [
        { testName: "Complete Metabolic Panel (CMP)", testCode: "CMP", category: "Chemistry", cost: 65 },
      ],
      description: "BMP + Liver function tests",
    },
    {
      name: "Complete Blood Count",
      tests: [
        { testName: "Complete Blood Count (CBC)", testCode: "CBC", category: "Hematology", cost: 35 },
      ],
      description: "Full blood count with differential",
    },
    {
      name: "Lipid Panel",
      tests: [
        { testName: "Lipid Panel", testCode: "LIPID", category: "Chemistry", cost: 55 },
      ],
      description: "Total cholesterol, HDL, LDL, Triglycerides",
    },
    {
      name: "Thyroid Function Panel",
      tests: [
        { testName: "TSH", testCode: "TSH", category: "Endocrine", cost: 45 },
        { testName: "Free T4", testCode: "FT4", category: "Endocrine", cost: 50 },
      ],
      description: "TSH and Free T4",
    },
    {
      name: "Comprehensive Metabolic Panel",
      tests: [
        { testName: "Complete Metabolic Panel (CMP)", testCode: "CMP", category: "Chemistry", cost: 65 },
        { testName: "Complete Blood Count (CBC)", testCode: "CBC", category: "Hematology", cost: 35 },
        { testName: "Lipid Panel", testCode: "LIPID", category: "Chemistry", cost: 55 },
      ],
      description: "CMP + CBC + Lipid Panel",
    },
  ];
  
  // Test cost estimates (in USD)
  const testCosts: Record<string, number> = {
    "Complete Blood Count": 35,
    "Complete Metabolic Panel": 65,
    "Basic Metabolic Panel": 45,
    "Lipid Panel": 55,
    "Hemoglobin A1C": 40,
    "TSH": 45,
    "Free T4": 50,
    "INR": 25,
    "PT": 30,
    "PTT": 30,
    "Glucose Tolerance Test": 75,
    "Urinalysis": 20,
    "Urine Culture": 45,
    "Blood Culture": 60,
    "Vitamin D": 55,
    "Vitamin B12": 50,
    "Folate": 50,
    "Creatinine": 25,
    "eGFR": 30,
  };
  
  const [collectionDate, setCollectionDate] = useState("");
  const [showOrderSets, setShowOrderSets] = useState(false);
  const [selectedLabsForBulk, setSelectedLabsForBulk] = useState<Set<string>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showGroupedTests, setShowGroupedTests] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["Chemistry", "Hematology"]));
  const [activeTab, setActiveTab] = useState<"orders" | "results">("orders");
  
  // Group tests by category
  const groupedTests = commonLabTests.reduce((acc, test) => {
    const category = test.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(test);
    return acc;
  }, {} as Record<string, typeof commonLabTests>);
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };
  
  const handleAddGroupedTest = (test: typeof commonLabTests[0]) => {
    const testCode = test.value.split("(")[1]?.replace(")", "") || test.value.split(" ")[0] || "";
    const cost = testCosts[test.value] || testCosts[test.label] || testCosts[test.value.split("(")[0]?.trim()] || 0;
    
    if (isDuplicate(test.label, testCode)) {
      if (!confirm(`${test.label} may have been ordered recently. Add anyway?`)) {
        return;
      }
    }
    
    setTestCart([...testCart, {
      testName: test.label,
      testCode: testCode,
      category: test.category || "Blood Work",
      cost: cost,
    }]);
  };
  
  // Suggested tests based on diagnosis
  const getSuggestedTests = (): Array<{ testName: string; testCode: string; category: string; cost: number; reason: string }> => {
    if (!currentPatient?.condition) return [];
    
    const condition = currentPatient.condition.toLowerCase();
    const suggestions: Array<{ testName: string; testCode: string; category: string; cost: number; reason: string }> = [];
    
    // Diabetes
    if (condition.includes("diabetes") || condition.includes("diabetic")) {
      suggestions.push(
        { testName: "Hemoglobin A1C", testCode: "HBA1C", category: "Endocrine", cost: 40, reason: "Routine monitoring for diabetes" },
        { testName: "Complete Metabolic Panel (CMP)", testCode: "CMP", category: "Chemistry", cost: 65, reason: "Monitor glucose and kidney function" }
      );
    }
    
    // Hypertension
    if (condition.includes("hypertension") || condition.includes("high blood pressure")) {
      suggestions.push(
        { testName: "Basic Metabolic Panel (BMP)", testCode: "BMP", category: "Chemistry", cost: 45, reason: "Monitor electrolytes and kidney function" },
        { testName: "Lipid Panel", testCode: "LIPID", category: "Chemistry", cost: 55, reason: "Cardiovascular risk assessment" }
      );
    }
    
    // Kidney disease
    if (condition.includes("kidney") || condition.includes("renal") || condition.includes("ckd")) {
      suggestions.push(
        { testName: "Creatinine", testCode: "CREAT", category: "Chemistry", cost: 25, reason: "Monitor kidney function" },
        { testName: "eGFR", testCode: "EGFR", category: "Chemistry", cost: 30, reason: "Estimate kidney function" },
        { testName: "Complete Metabolic Panel (CMP)", testCode: "CMP", category: "Chemistry", cost: 65, reason: "Comprehensive metabolic assessment" }
      );
    }
    
    // Thyroid
    if (condition.includes("thyroid") || condition.includes("hypothyroid") || condition.includes("hyperthyroid")) {
      suggestions.push(
        { testName: "TSH", testCode: "TSH", category: "Endocrine", cost: 45, reason: "Thyroid function screening" },
        { testName: "Free T4", testCode: "FT4", category: "Endocrine", cost: 50, reason: "Thyroid hormone level" }
      );
    }
    
    // Anemia
    if (condition.includes("anemia")) {
      suggestions.push(
        { testName: "Complete Blood Count (CBC)", testCode: "CBC", category: "Hematology", cost: 35, reason: "Evaluate blood cell counts" },
        { testName: "Vitamin B12", testCode: "B12", category: "Hematology", cost: 50, reason: "Check for B12 deficiency" },
        { testName: "Folate", testCode: "FOLATE", category: "Hematology", cost: 50, reason: "Check for folate deficiency" }
      );
    }
    
    // Cardiovascular
    if (condition.includes("heart") || condition.includes("cardiac") || condition.includes("coronary") || condition.includes("cad")) {
      suggestions.push(
        { testName: "Lipid Panel", testCode: "LIPID", category: "Chemistry", cost: 55, reason: "Cardiovascular risk assessment" },
        { testName: "Complete Metabolic Panel (CMP)", testCode: "CMP", category: "Chemistry", cost: 65, reason: "Metabolic assessment" }
      );
    }
    
    return suggestions;
  };
  
  const suggestedTests = getSuggestedTests();

  // Filter completed results for Results tab
  const completedResults = labResults.filter(lab => lab.status === "completed");
  
  const filteredResults = labResults.filter((lab) => {
    const matchesSearch = lab.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lab.testCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lab.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lab.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Sort by resultDate if available, otherwise orderedDate, newest first
    const dateA = a.resultDate || a.orderedDate || "";
    const dateB = b.resultDate || b.orderedDate || "";
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  // Filter completed results with search
  const filteredCompletedResults = completedResults.filter((lab) => {
    return lab.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lab.testCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lab.category?.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => {
    // Sort by resultDate if available, otherwise orderedDate, newest first
    const dateA = a.resultDate || a.orderedDate || "";
    const dateB = b.resultDate || b.orderedDate || "";
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const resultsToShow = activeTab === "results" ? filteredCompletedResults : filteredResults;

  const getStatusColor = (status: LabStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "in_progress":
        return "bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400";
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

  // Check for duplicates
  const isDuplicate = (testName: string, testCode: string) => {
    // Check in cart
    const inCart = testCart.some(
      t => t.testName.toLowerCase() === testName.toLowerCase() ||
           (t.testCode && testCode && t.testCode.toLowerCase() === testCode.toLowerCase())
    );
    
    // Check in recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrder = labResults.some(
      lab => lab.orderedDate && new Date(lab.orderedDate) >= thirtyDaysAgo &&
      (lab.testName.toLowerCase() === testName.toLowerCase() ||
       (lab.testCode && testCode && lab.testCode.toLowerCase() === testCode.toLowerCase()))
    );
    
    return inCart || recentOrder;
  };

  const handleAddToCart = () => {
    if (!orderFormData.testName.trim()) return;
    
    const testCode = orderFormData.testCode || orderFormData.testName.split("(")[1]?.replace(")", "") || "";
    const cost = testCosts[orderFormData.testName] || testCosts[orderFormData.testName.split("(")[0]?.trim()] || 0;
    
    // Check for duplicates
    if (isDuplicate(orderFormData.testName, testCode)) {
      if (!confirm(`This test may have been ordered recently. Add anyway?`)) {
        return;
      }
    }
    
    const newTest = {
      testName: orderFormData.testName,
      testCode: testCode,
      category: orderFormData.category,
      cost: cost,
    };
    
    setTestCart([...testCart, newTest]);
    setOrderFormData({
      ...orderFormData,
      testName: "",
      testCode: "",
      selectedCommonTest: "",
    });
  };
  
  const handleAddOrderSet = (orderSet: typeof orderSets[0]) => {
    const testsToAdd = orderSet.tests.filter(test => {
      const isDup = isDuplicate(test.testName, test.testCode);
      if (isDup && !confirm(`${test.testName} may have been ordered recently. Add anyway?`)) {
        return false;
      }
      return true;
    });
    
    setTestCart([...testCart, ...testsToAdd]);
  };
  
  const handleReorderFromHistory = (lab: LabResult) => {
    const cost = testCosts[lab.testName] || testCosts[lab.testName.split("(")[0]?.trim()] || 0;
    const testCode = lab.testCode || lab.testName.split("(")[1]?.replace(")", "") || "";
    
    if (isDuplicate(lab.testName, testCode)) {
      if (!confirm(`This test may have been ordered recently. Add anyway?`)) {
        return;
      }
    }
    
    setTestCart([...testCart, {
      testName: lab.testName,
      testCode: testCode,
      category: lab.category || "Blood Work",
      cost: cost,
    }]);
    setShowOrderForm(true);
  };

  const handleRemoveFromCart = (index: number) => {
    setTestCart(testCart.filter((_, i) => i !== index));
  };
  
  // Bulk operations
  const handleBulkStatusUpdate = (newStatus: LabStatus) => {
    if (selectedLabsForBulk.size === 0) return;
    
    setLabResults(labResults.map(lab => 
      selectedLabsForBulk.has(lab.id) 
        ? { ...lab, status: newStatus }
        : lab
    ));
    setSelectedLabsForBulk(new Set());
    setShowBulkActions(false);
  };
  
  const handleBulkCancel = () => {
    if (selectedLabsForBulk.size === 0) return;
    if (!confirm(`Cancel ${selectedLabsForBulk.size} lab order(s)?`)) return;
    
    handleBulkStatusUpdate("cancelled");
  };
  
  const handleBulkPrint = () => {
    if (selectedLabsForBulk.size === 0) return;
    
    const selectedLabs = labResults.filter(lab => selectedLabsForBulk.has(lab.id));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const orgHeader = getOrganizationHeader();
    const orgFooter = getOrganizationFooter();
    const orgDetails = getOrganizationDetails();
    
    // Get common information from first lab (assuming all are for same patient/order)
    const firstLab = selectedLabs[0];
    const allLabNames = selectedLabs.map(lab => lab.labName).filter(Boolean);
    const uniqueLabNames = [...new Set(allLabNames)];
    const allLocations = selectedLabs.map(lab => lab.labLocation).filter(Boolean);
    const uniqueLocations = [...new Set(allLocations)];
    const allNotes = selectedLabs.map(lab => lab.notes).filter(Boolean);
    const uniqueNotes = [...new Set(allNotes)];
    
    // Generate HTML for all tests on one letter
    const testsHtml = selectedLabs.map((lab) => `
      <div class="test-item">
        <strong>${lab.testName}</strong>
        ${lab.testCode ? `<span>Test Code: ${lab.testCode}</span><br>` : ""}
        <span>Category: ${lab.category || "N/A"}</span>
      </div>
    `).join('');
    
    const labRequestsHtml = `
      <div class="lab-request">
        <div class="org-header">
          <div class="org-name">${orgDetails.name}</div>
          <div class="org-type">${orgDetails.type}</div>
          <div class="org-details">
            ${orgDetails.address}, ${orgDetails.city}, ${orgDetails.state} ${orgDetails.zipCode}<br>
            Phone: ${orgDetails.phone}${orgDetails.fax ? ` | Fax: ${orgDetails.fax}` : ""}${orgDetails.email ? ` | Email: ${orgDetails.email}` : ""}
          </div>
        </div>

        <div class="document-header">
          <h1>LABORATORY REQUEST</h1>
          <h2>Test Order Form - ${selectedLabs.length} Test${selectedLabs.length > 1 ? 's' : ''}</h2>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Patient Name</div>
            <div class="info-value">${currentPatient?.name || "N/A"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date of Birth</div>
            <div class="info-value">${currentPatient?.dob ? new Date(currentPatient.dob).toLocaleDateString() : "N/A"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Patient ID</div>
            <div class="info-value">${currentPatient?.id || "N/A"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Order Date</div>
            <div class="info-value">${new Date(firstLab.orderedDate).toLocaleDateString()}</div>
          </div>
          ${firstLab.collectedDate ? `
          <div class="info-item">
            <div class="info-label">Collection Date</div>
            <div class="info-value">${new Date(firstLab.collectedDate).toLocaleDateString()}</div>
          </div>
          ` : ""}
          ${firstLab.orderingPhysician ? `
          <div class="info-item">
            <div class="info-label">Ordering Physician</div>
            <div class="info-value">${firstLab.orderingPhysician}</div>
          </div>
          ` : ""}
        </div>

        <div class="test-details">
          <h3>Requested Test(s) - ${selectedLabs.length} Test${selectedLabs.length > 1 ? 's' : ''}</h3>
          ${testsHtml}
        </div>

        ${uniqueLabNames.length > 0 ? `
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Laboratory</div>
            <div class="info-value">${uniqueLabNames.join(", ")}</div>
          </div>
          ${uniqueLocations.length > 0 ? `
          <div class="info-item">
            <div class="info-label">Lab Location</div>
            <div class="info-value">${uniqueLocations.join(", ")}</div>
          </div>
          ` : ""}
        </div>
        ` : ""}

        ${uniqueNotes.length > 0 ? `
        <div class="instructions">
          <h4>Special Instructions / Clinical Notes</h4>
          ${uniqueNotes.map(note => `<p>${note}</p>`).join('')}
        </div>
        ` : ""}

        <div class="signature-section">
          <div class="signature-line"></div>
          <div class="signature-label">Ordering Physician Signature</div>
        </div>
      </div>
    `;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lab Requests - ${selectedLabs.length} Request${selectedLabs.length > 1 ? 's' : ''}</title>
          <style>
            @page {
              margin: 0.75in;
              size: letter;
            }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.5;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 0;
            }
            .lab-request {
              margin-bottom: 20px;
            }
            .org-header {
              border-bottom: 3px solid #2563eb;
              padding-bottom: 12px;
              margin-bottom: 18px;
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
              line-height: 1.4;
              margin: 0;
            }
            .document-header {
              text-align: center;
              margin: 18px 0;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
            }
            .document-header h1 {
              margin: 0;
              font-size: 20px;
              color: #1e40af;
              font-weight: 600;
            }
            .document-header h2 {
              margin: 6px 0 0 0;
              font-size: 16px;
              color: #4b5563;
              font-weight: normal;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin: 18px 0;
            }
            .info-item {
              padding: 8px;
              background: #f9fafb;
              border-radius: 4px;
              border: 1px solid #e5e7eb;
            }
            .info-label {
              font-size: 10px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
              font-weight: 600;
            }
            .info-value {
              font-size: 13px;
              font-weight: 600;
              color: #111827;
            }
            .test-details {
              background: #eff6ff;
              border: 2px solid #2563eb;
              border-radius: 8px;
              padding: 12px;
              margin: 18px 0;
            }
            .test-details h3 {
              margin: 0 0 8px 0;
              font-size: 15px;
              color: #1e40af;
              font-weight: 600;
            }
            .test-item {
              padding: 5px 10px;
              background: white;
              border-radius: 4px;
              margin-bottom: 2px;
              border-left: 3px solid #2563eb;
            }
            .test-item:last-child {
              margin-bottom: 0;
            }
            .test-item strong {
              display: block;
              font-size: 12px;
              color: #111827;
              margin-bottom: 2px;
            }
            .test-item span {
              font-size: 10px;
              color: #6b7280;
              line-height: 1.3;
            }
            .instructions {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 10px;
              border-radius: 4px;
              margin: 18px 0;
            }
            .instructions h4 {
              margin: 0 0 6px 0;
              font-size: 12px;
              color: #92400e;
              font-weight: 600;
            }
            .instructions p {
              margin: 0;
              font-size: 11px;
              color: #78350f;
              line-height: 1.4;
            }
            .signature-section {
              margin-top: 35px;
              padding-top: 12px;
              border-top: 2px solid #e5e7eb;
            }
            .signature-line {
              margin-top: 45px;
              border-top: 1px solid #333;
              width: 300px;
            }
            .signature-label {
              font-size: 11px;
              color: #6b7280;
              margin-top: 5px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #e5e7eb;
              font-size: 10px;
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
          ${labRequestsHtml}
          
          <div class="footer">
            ${orgFooter}<br>
            Generated: ${new Date().toLocaleString()}<br>
            This document contains ${selectedLabs.length} laboratory request${selectedLabs.length > 1 ? 's' : ''}. Please process according to standard procedures.
          </div>
        </body>
      </html>
    `;

    setPrintPreview({
      content: printContent,
      title: `Lab Requests - ${selectedLabs.length} Request${selectedLabs.length > 1 ? 's' : ''}`
    });
  };
  
  const toggleLabSelection = (labId: string) => {
    setSelectedLabsForBulk(prev => {
      const newSet = new Set(prev);
      if (newSet.has(labId)) {
        newSet.delete(labId);
      } else {
        newSet.add(labId);
      }
      return newSet;
    });
  };
  
  const handleAddSuggestedTest = (test: typeof suggestedTests[0]) => {
    if (isDuplicate(test.testName, test.testCode)) {
      if (!confirm(`${test.testName} may have been ordered recently. Add anyway?`)) {
        return;
      }
    }
    setTestCart([...testCart, test]);
    setShowOrderForm(true);
  };

  const handleOrderAllTests = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (testCart.length === 0) {
      // If cart is empty, order the single test in the form
      if (!orderFormData.testName.trim()) return;
      handleOrderLab([{
        testName: orderFormData.testName,
        testCode: orderFormData.testCode || "",
        category: orderFormData.category,
      }]);
      return;
    }

    // Order all tests in cart
    handleOrderLab(testCart);
  };

  const handleOrderLab = async (tests: Array<{ testName: string; testCode: string; category: string; cost?: number }>) => {
    if (!currentPatient?.id) return;
    
    const collectionDateValue = collectionDate || orderFormData.orderedDate;
    
    // Save each test to API
    const newLabs: LabResult[] = [];
    for (const test of tests) {
      try {
        const response = await labResultsService.createLabResult(currentPatient.id, {
          testName: test.testName,
          testCode: test.testCode || undefined,
          category: test.category,
          orderedDate: orderFormData.orderedDate,
          collectedDate: collectionDateValue || undefined,
          status: "ordered" as LabStatus,
          orderingPhysicianId: currentUser?.id,
          labName: orderFormData.labName,
          labLocation: orderFormData.labLocation || undefined,
          notes: orderFormData.notes || undefined,
        });
        
        if (response.data) {
          // Transform backend response to match frontend type
          const transformedLab: LabResult = {
            ...response.data,
            orderedDate: response.data.orderedDate ? (typeof response.data.orderedDate === 'string' ? response.data.orderedDate : new Date(response.data.orderedDate).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
            collectedDate: response.data.collectedDate ? (typeof response.data.collectedDate === 'string' ? response.data.collectedDate : new Date(response.data.collectedDate).toISOString().split('T')[0]) : undefined,
            orderingPhysician: response.data.orderingPhysician ? (typeof response.data.orderingPhysician === 'string' ? response.data.orderingPhysician : `${(response.data.orderingPhysician as any).firstName} ${(response.data.orderingPhysician as any).lastName}`) : undefined,
          };
          newLabs.push(transformedLab);
        }
      } catch (error) {
        logger.error('Failed to save lab order to API:', error);
        // Fallback: create local lab result if API fails
        newLabs.push({
          id: `lab-${Date.now()}-${Math.random()}`,
          testName: test.testName,
          testCode: test.testCode || undefined,
          category: test.category,
          orderedDate: orderFormData.orderedDate,
          collectedDate: collectionDateValue ? new Date(collectionDateValue).toISOString() : undefined,
          status: "ordered" as LabStatus,
          orderingPhysician: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : undefined,
          orderingPhysicianId: currentUser?.id,
          labName: orderFormData.labName,
          labLocation: orderFormData.labLocation || undefined,
          notes: orderFormData.notes || undefined,
        });
      }
    }
    
    setLabResults([...labResults, ...newLabs]);
    setTestCart([]);
    setCollectionDate("");
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
  
  const totalCartCost = testCart.reduce((sum, test) => sum + (test.cost || 0), 0);

  const handleViewResults = (lab: LabResult) => {
    setSelectedLab(lab);
    setShowResultsModal(true);
  };

  const handlePrintFromPreview = () => {
    if (!printPreview) return;
    openPrintWindow(printPreview.content, printPreview.title);
  };

  const handlePrintRequest = (lab: LabResult) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const orgHeader = getOrganizationHeader();
    const orgFooter = getOrganizationFooter();
    const orgDetails = getOrganizationDetails();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lab Request - ${lab.testName}</title>
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
            .test-details {
              background: #eff6ff;
              border: 2px solid #2563eb;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
            }
            .test-details h3 {
              margin: 0 0 15px 0;
              font-size: 18px;
              color: #1e40af;
              font-weight: 600;
            }
            .test-item {
              padding: 12px;
              background: white;
              border-radius: 4px;
              margin-bottom: 10px;
              border-left: 4px solid #2563eb;
            }
            .test-item strong {
              display: block;
              font-size: 14px;
              color: #111827;
              margin-bottom: 5px;
            }
            .test-item span {
              font-size: 12px;
              color: #6b7280;
            }
            .instructions {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              border-radius: 4px;
              margin: 25px 0;
            }
            .instructions h4 {
              margin: 0 0 10px 0;
              font-size: 14px;
              color: #92400e;
              font-weight: 600;
            }
            .instructions p {
              margin: 0;
              font-size: 12px;
              color: #78350f;
              line-height: 1.6;
            }
            .signature-section {
              margin-top: 60px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
            }
            .signature-line {
              margin-top: 60px;
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
              font-size: 10px;
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
            <div class="org-name">${orgDetails.name}</div>
            <div class="org-type">${orgDetails.type}</div>
            <div class="org-details">
              ${orgDetails.address}, ${orgDetails.city}, ${orgDetails.state} ${orgDetails.zipCode}<br>
              Phone: ${orgDetails.phone}${orgDetails.fax ? ` | Fax: ${orgDetails.fax}` : ""}${orgDetails.email ? ` | Email: ${orgDetails.email}` : ""}
            </div>
          </div>

          <div class="document-header">
            <h1>LABORATORY REQUEST</h1>
            <h2>Test Order Form</h2>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Patient Name</div>
              <div class="info-value">${currentPatient?.name || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date of Birth</div>
              <div class="info-value">${currentPatient?.dob ? new Date(currentPatient.dob).toLocaleDateString() : "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Patient ID</div>
              <div class="info-value">${currentPatient?.id || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Order Date</div>
              <div class="info-value">${new Date(lab.orderedDate).toLocaleDateString()}</div>
            </div>
            ${lab.collectedDate ? `
            <div class="info-item">
              <div class="info-label">Collection Date</div>
              <div class="info-value">${new Date(lab.collectedDate).toLocaleDateString()}</div>
            </div>
            ` : ""}
            ${lab.orderingPhysician ? `
            <div class="info-item">
              <div class="info-label">Ordering Physician</div>
              <div class="info-value">${lab.orderingPhysician}</div>
            </div>
            ` : ""}
          </div>

          <div class="test-details">
            <h3>Requested Test(s)</h3>
            <div class="test-item">
              <strong>${lab.testName}</strong>
              ${lab.testCode ? `<span>Test Code: ${lab.testCode}</span><br>` : ""}
              <span>Category: ${lab.category || "N/A"}</span>
            </div>
          </div>

          ${lab.labName ? `
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Laboratory</div>
              <div class="info-value">${lab.labName}</div>
            </div>
            ${lab.labLocation ? `
            <div class="info-item">
              <div class="info-label">Lab Location</div>
              <div class="info-value">${lab.labLocation}</div>
            </div>
            ` : ""}
          </div>
          ` : ""}

          ${lab.notes ? `
          <div class="instructions">
            <h4>Special Instructions / Clinical Notes</h4>
            <p>${lab.notes}</p>
          </div>
          ` : ""}

          <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-label">Ordering Physician Signature</div>
          </div>

          <div class="footer">
            ${orgFooter}<br>
            Generated: ${new Date().toLocaleString()}<br>
            This is an official laboratory request form. Please process according to standard procedures.
          </div>
        </body>
      </html>
    `;

    setPrintPreview({
      content: printContent,
      title: `Lab Request - ${lab.testName}`
    });
  };

  const handlePrint = (lab: LabResult) => {
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

    // Show print preview instead of printing directly
    setPrintPreview({
      content: printContent,
      title: `Lab Report - ${lab.testName}`
    });
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
            <FlaskConical className="text-teal-600 dark:text-teal-400" size={24} />
            Lab Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage lab orders and results for {currentPatient.name}
          </p>
        </div>
        <button
          onClick={() => setShowOrderForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Order Lab Test
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "orders"
                ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-900/10"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText size={18} />
              Orders ({labResults.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "results"
                ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-900/10"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Eye size={18} />
              Results ({completedResults.length})
            </div>
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedLabsForBulk.size > 0 && (
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-teal-900 dark:text-teal-100">
                {selectedLabsForBulk.size} lab{selectedLabsForBulk.size > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedLabsForBulk(new Set())}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleBulkPrint}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors flex items-center gap-2"
                title="Print all selected lab requests"
              >
                <Printer size={16} />
                Print Selected
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("in_progress")}
                className="px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium transition-colors"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("completed")}
                className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition-colors"
              >
                Mark Completed
              </button>
              <button
                onClick={handleBulkCancel}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors"
              >
                Cancel Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters - Only show on Orders tab */}
      {activeTab === "orders" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search lab tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                className="px-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
      )}

      {/* Search for Results tab */}
      {activeTab === "results" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search completed results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Lab Results List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {resultsToShow.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FlaskConical size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">
              {activeTab === "results" 
                ? "No Completed Results Found" 
                : "No Lab Results Found"}
            </p>
            <p className="text-sm">
              {activeTab === "results"
                ? "No completed lab tests available to view"
                : searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No lab tests have been ordered for this patient"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {resultsToShow.map((lab) => (
              <div
                key={lab.id}
                className={`p-4 transition-all ${
                  selectedLabsForBulk.has(lab.id)
                    ? "bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
                } rounded-lg`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Bulk selection checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedLabsForBulk.has(lab.id)}
                      onChange={() => toggleLabSelection(lab.id)}
                      className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      onClick={(e) => e.stopPropagation()}
                    />
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
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {/* Show assignment status */}
                    {lab.assignedForReview && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded">
                        Assigned for review
                      </div>
                    )}
                    {/* Print Request button for all orders */}
                    {lab.status !== "completed" && (
                      <button
                        onClick={() => handlePrintRequest(lab)}
                        className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        title="Print Lab Request"
                        aria-label="Print Lab Request"
                      >
                        <Printer size={18} />
                      </button>
                    )}
                    {lab.status === "completed" && (
                      <>
                        <button
                          onClick={() => handleViewResults(lab)}
                          className={`flex items-center gap-2 rounded-lg transition-colors ${
                            activeTab === "results"
                              ? "px-3 py-2 bg-teal-500 text-white hover:bg-teal-600 font-medium"
                              : "p-2 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30"
                          }`}
                          title="View Results"
                          aria-label="View Results"
                        >
                          <Eye size={18} />
                          {activeTab === "results" && <span className="text-sm">View</span>}
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
                          onClick={() => handleReorderFromHistory(lab)}
                          className="p-2 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                          title="Reorder this test"
                          aria-label="Reorder this test"
                        >
                          <Plus size={18} />
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

            <form onSubmit={handleOrderAllTests} className="p-6 space-y-5">
              {/* Test Cart Display */}
              {testCart.length > 0 && (
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="text-teal-600 dark:text-teal-400" size={20} />
                      <h4 className="font-semibold text-teal-900 dark:text-teal-100">
                        Tests to Order ({testCart.length})
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTestCart([])}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {testCart.map((test, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-teal-200 dark:border-teal-700"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {test.testName}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {test.testCode && `${test.testCode} • `}
                            {test.category}
                            {test.cost && test.cost > 0 && ` • $${test.cost}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(index)}
                          className="p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          aria-label={`Remove ${test.testName}`}
                          title="Remove from cart"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {totalCartCost > 0 && (
                    <div className="mt-3 pt-3 border-t border-teal-200 dark:border-teal-700">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Estimated Total Cost:</span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">${totalCartCost.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">*Costs are estimates and may vary</p>
                    </div>
                  )}
                </div>
              )}

              {/* Suggested Tests Based on Diagnosis */}
              {suggestedTests.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                        <Info size={16} />
                        Suggested Tests
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Based on patient diagnosis: {currentPatient.condition}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedTests.map((test, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddSuggestedTest(test)}
                        className="p-3 text-left border border-blue-200 dark:border-blue-700 rounded-lg hover:border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors bg-white dark:bg-gray-800"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{test.testName}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{test.reason}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">${test.cost}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{test.testCode}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Sets Panel */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-base font-medium">Order Sets / Test Panels</label>
                  <button
                    type="button"
                    onClick={() => setShowOrderSets(!showOrderSets)}
                    className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {showOrderSets ? "Hide" : "Show"} Order Sets
                  </button>
                </div>
                {showOrderSets && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {orderSets.map((orderSet, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddOrderSet(orderSet)}
                        className="p-3 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                      >
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{orderSet.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{orderSet.description}</div>
                        <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                          {orderSet.tests.length} test{orderSet.tests.length > 1 ? 's' : ''} • 
                          ${orderSet.tests.reduce((sum, t) => sum + (t.cost || 0), 0)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Grouped Test Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-base font-medium">
                    Browse Tests by Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowGroupedTests(!showGroupedTests)}
                    className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {showGroupedTests ? "Hide" : "Show"} Grouped View
                  </button>
                </div>
                
                {showGroupedTests && (
                  <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                    {Object.entries(groupedTests).map(([category, tests]) => (
                      <div key={category} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-3 last:pb-0">
                        <button
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className="w-full flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{category}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">({tests.length} tests)</span>
                          </div>
                          <span className="text-gray-500 dark:text-gray-400">
                            {expandedCategories.has(category) ? "−" : "+"}
                          </span>
                        </button>
                        
                        {expandedCategories.has(category) && (
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {tests.map((test) => {
                              const testCost = testCosts[test.value] || testCosts[test.label] || testCosts[test.value.split("(")[0]?.trim()] || 0;
                              return (
                                <button
                                  key={test.value}
                                  type="button"
                                  onClick={() => handleAddGroupedTest(test)}
                                  className="p-2.5 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors bg-white dark:bg-gray-800"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                        {test.label}
                                      </div>
                                      {test.value !== test.label && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                          {test.value}
                                        </div>
                                      )}
                                    </div>
                                    {testCost > 0 && (
                                      <div className="text-xs font-medium text-teal-600 dark:text-teal-400 ml-2">
                                        ${testCost}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Common Tests Quick Select (Fallback) */}
              <div>
                <label className="block text-base font-medium mb-2.5" htmlFor="common-test-select">
                  Quick Select (Dropdown)
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 font-normal">
                    (Alternative to grouped view)
                  </span>
                </label>
                <select
                  id="common-test-select"
                  value={orderFormData.selectedCommonTest}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleCommonTestSelect(e.target.value);
                    }
                  }}
                  aria-label="Select a common test"
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                >
                  <option value="">Select a common test...</option>
                  {commonLabTests.map((test) => (
                    <option key={test.value} value={test.label}>
                      {test.label} - {test.category || "General"}
                    </option>
                  ))}
                </select>
                {orderFormData.selectedCommonTest && (
                  <button
                    type="button"
                    onClick={() => {
                      const test = commonLabTests.find(t => t.label === orderFormData.selectedCommonTest);
                      if (test) {
                        handleAddGroupedTest(test);
                        setOrderFormData({
                          ...orderFormData,
                          selectedCommonTest: "",
                          testName: "",
                          testCode: "",
                        });
                      }
                    }}
                    className="mt-2 w-full px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 font-medium transition-colors flex items-center justify-center gap-2"
                    title="Add selected test directly to cart"
                  >
                    <Plus size={16} />
                    Add to Cart
                  </button>
                )}
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
                    title="Test code"
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
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
                    title="Select lab category"
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
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
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5" htmlFor="collection-date-input">Collection Date (Optional)</label>
                  <input
                    id="collection-date-input"
                    type="date"
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                    min={orderFormData.orderedDate}
                    aria-label="Collection date"
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Schedule when the sample should be collected</p>
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
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Lab Location (Optional)</label>
                  <input
                    type="text"
                    value={orderFormData.labLocation}
                    onChange={(e) => setOrderFormData({ ...orderFormData, labLocation: e.target.value })}
                    placeholder="Lab address or location"
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
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
                  title="Notes"
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
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

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!orderFormData.testName.trim()}
                  className="px-4 py-2 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/50 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Add test to cart"
                  title="Add test to cart"
                >
                  <Plus size={16} />
                  Add to Cart
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOrderForm(false);
                      setTestCart([]);
                    }}
                    className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 transition-colors"
                    aria-label="Cancel order form"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={testCart.length === 0 && !orderFormData.testName.trim()}
                    className="px-5 py-2.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={testCart.length > 0 ? `Order ${testCart.length} tests` : "Submit lab order"}
                    title={testCart.length > 0 ? `Order ${testCart.length} tests` : "Submit lab order"}
                  >
                    <ShoppingCart size={18} />
                    {testCart.length > 0 ? `Order ${testCart.length} Test${testCart.length > 1 ? 's' : ''}` : 'Order Lab Test'}
                  </button>
                </div>
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
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="text-teal-600 dark:text-teal-400" size={16} />
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
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
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
                              {assignedUser.firstName} {assignedUser.lastName} ({getRoleName(assignedUser.role)})
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
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
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
                  aria-label="Cancel assignment"
                  title="Cancel"
                >
                  Cancel
                </button>
              </div>
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
