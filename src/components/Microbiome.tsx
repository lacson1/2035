import { useState, useMemo } from "react";
import { 
  Dna, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  X, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  FileText,
  Clock,
  FlaskConical,
  ClipboardCheck,
  ArrowRight
} from "lucide-react";
import { Patient } from "../types";

interface MicrobiomeProps {
  patient: Patient;
}

interface MicrobiomeTest {
  id: string;
  date: string;
  diversityScore: number;
  beneficialBacteria: number;
  harmfulBacteria: number;
  overallHealth: "excellent" | "good" | "moderate" | "poor";
  notes?: string;
  status?: "ordered" | "sample-collected" | "processing" | "completed" | "reviewed";
  orderedDate?: string;
  collectedDate?: string;
  completedDate?: string;
  reviewedDate?: string;
}

interface BacteriaType {
  name: string;
  category: "beneficial" | "harmful" | "neutral";
  abundance: number;
  status: "optimal" | "normal" | "low" | "high";
  impact: string;
}

export default function Microbiome({}: MicrobiomeProps) {
  const [addTestOpen, setAddTestOpen] = useState(false);
  const [orderTestOpen, setOrderTestOpen] = useState(false);
  const [workflowView, setWorkflowView] = useState<"overview" | "workflow">("overview");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    diversityScore: "",
    beneficialBacteria: "",
    harmfulBacteria: "",
    notes: "",
  });
  
  const [orderFormData, setOrderFormData] = useState({
    testType: "full-panel" as "full-panel" | "diversity-only" | "targeted",
    reason: "",
    priority: "routine" as "routine" | "urgent",
    scheduledDate: new Date().toISOString().split("T")[0],
    provider: "",
    notes: "",
  });

  const [tests, setTests] = useState<MicrobiomeTest[]>([
    {
      id: "micro-001",
      date: "2025-01-10",
      diversityScore: 85,
      beneficialBacteria: 78,
      harmfulBacteria: 12,
      overallHealth: "good",
      notes: "Improving diversity after probiotic regimen",
      status: "reviewed",
      orderedDate: "2025-01-05",
      collectedDate: "2025-01-08",
      completedDate: "2025-01-10",
      reviewedDate: "2025-01-10",
    },
    {
      id: "micro-002",
      date: "2024-12-05",
      diversityScore: 72,
      beneficialBacteria: 65,
      harmfulBacteria: 18,
      overallHealth: "moderate",
      status: "reviewed",
      orderedDate: "2024-11-28",
      collectedDate: "2024-12-03",
      completedDate: "2024-12-05",
      reviewedDate: "2024-12-05",
    },
  ]);
  
  const [pendingOrders, setPendingOrders] = useState<MicrobiomeTest[]>([
    {
      id: "micro-pending-001",
      date: "",
      diversityScore: 0,
      beneficialBacteria: 0,
      harmfulBacteria: 0,
      overallHealth: "moderate",
      status: "ordered",
      orderedDate: new Date().toISOString().split("T")[0],
    },
  ]);

  const [bacteriaTypes, _setBacteriaTypes] = useState<BacteriaType[]>([
    {
      name: "Lactobacillus",
      category: "beneficial",
      abundance: 82,
      status: "optimal",
      impact: "Supports digestion and immune function",
    },
    {
      name: "Bifidobacterium",
      category: "beneficial",
      abundance: 75,
      status: "optimal",
      impact: "Aids in nutrient absorption",
    },
    {
      name: "Akkermansia",
      category: "beneficial",
      abundance: 68,
      status: "normal",
      impact: "Maintains gut barrier integrity",
    },
    {
      name: "E. coli",
      category: "harmful",
      abundance: 8,
      status: "normal",
      impact: "Low levels - no concern",
    },
    {
      name: "Clostridium difficile",
      category: "harmful",
      abundance: 4,
      status: "optimal",
      impact: "Well-controlled",
    },
  ]);

  const latestTest = tests[0];
  const previousTest = tests[1];
  
  const allTests = useMemo(() => {
    return [...tests, ...pendingOrders].sort((a, b) => {
      const dateA = a.orderedDate || a.date || "";
      const dateB = b.orderedDate || b.date || "";
      return dateB.localeCompare(dateA);
    });
  }, [tests, pendingOrders]);
  
  const activeOrders = useMemo(() => {
    return pendingOrders.filter(t => 
      t.status === "ordered" || 
      t.status === "sample-collected" || 
      t.status === "processing"
    );
  }, [pendingOrders]);

  const getHealthColor = (health: MicrobiomeTest["overallHealth"]) => {
    switch (health) {
      case "excellent":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "good":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "moderate":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "poor":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
    }
  };

  const getBacteriaStatusColor = (status: BacteriaType["status"]) => {
    switch (status) {
      case "optimal":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "normal":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "low":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "high":
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };
  
  const getStatusColor = (status?: MicrobiomeTest["status"]) => {
    switch (status) {
      case "ordered":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "sample-collected":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "processing":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
      case "reviewed":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800";
    }
  };


  const calculateDiversityTrend = () => {
    if (!previousTest) return "stable";
    const diff = latestTest.diversityScore - previousTest.diversityScore;
    if (diff > 5) return "improving";
    if (diff < -5) return "declining";
    return "stable";
  };

  const diversityTrend = calculateDiversityTrend();

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    const diversity = parseFloat(formData.diversityScore);
    const beneficial = parseFloat(formData.beneficialBacteria);
    const harmful = parseFloat(formData.harmfulBacteria);

    let overallHealth: MicrobiomeTest["overallHealth"] = "moderate";
    if (diversity >= 80 && beneficial >= 75 && harmful <= 15) {
      overallHealth = "excellent";
    } else if (diversity >= 70 && beneficial >= 65 && harmful <= 20) {
      overallHealth = "good";
    } else if (diversity < 60 || harmful > 25) {
      overallHealth = "poor";
    }

    const newTest: MicrobiomeTest = {
      id: `micro-${Date.now()}`,
      date: formData.date,
      diversityScore: diversity,
      beneficialBacteria: beneficial,
      harmfulBacteria: harmful,
      overallHealth,
      notes: formData.notes || undefined,
      status: "completed",
      completedDate: formData.date,
      reviewedDate: new Date().toISOString().split("T")[0],
    };

    setTests([newTest, ...tests]);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      diversityScore: "",
      beneficialBacteria: "",
      harmfulBacteria: "",
      notes: "",
    });
    setAddTestOpen(false);
  };
  
  const handleOrderTest = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: MicrobiomeTest = {
      id: `micro-order-${Date.now()}`,
      date: orderFormData.scheduledDate,
      diversityScore: 0,
      beneficialBacteria: 0,
      harmfulBacteria: 0,
      overallHealth: "moderate",
      status: "ordered",
      orderedDate: new Date().toISOString().split("T")[0],
      notes: orderFormData.notes || undefined,
    };
    
    setPendingOrders([...pendingOrders, newOrder]);
    setOrderFormData({
      testType: "full-panel",
      reason: "",
      priority: "routine",
      scheduledDate: new Date().toISOString().split("T")[0],
      provider: "",
      notes: "",
    });
    setOrderTestOpen(false);
  };
  
  const updateTestStatus = (testId: string, newStatus: MicrobiomeTest["status"]) => {
    const updateTest = (test: MicrobiomeTest) => {
      if (test.id === testId) {
        const updated = { ...test, status: newStatus };
        if (newStatus === "sample-collected" && !test.collectedDate) {
          updated.collectedDate = new Date().toISOString().split("T")[0];
        } else if (newStatus === "completed" && !test.completedDate) {
          updated.completedDate = new Date().toISOString().split("T")[0];
        } else if (newStatus === "reviewed" && !test.reviewedDate) {
          updated.reviewedDate = new Date().toISOString().split("T")[0];
        }
        return updated;
      }
      return test;
    };
    
    setPendingOrders(pendingOrders.map(updateTest));
    setTests(tests.map(updateTest));
  };
  
  const getStatusIcon = (status?: MicrobiomeTest["status"]) => {
    switch (status) {
      case "ordered":
        return <FileText size={16} />;
      case "sample-collected":
        return <ClipboardCheck size={16} />;
      case "processing":
        return <FlaskConical size={16} />;
      case "completed":
        return <CheckCircle2 size={16} />;
      case "reviewed":
        return <CheckCircle2 size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const beneficialBacteria = bacteriaTypes.filter((b) => b.category === "beneficial");
  const harmfulBacteria = bacteriaTypes.filter((b) => b.category === "harmful");

  return (
    <div className="section-spacing">
      {/* Header with Workflow Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 font-sans">Microbiome Analysis</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWorkflowView("overview")}
            className={`px-4 py-2 rounded-xl text-sm font-medium font-sans transition-all ${
              workflowView === "overview"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setWorkflowView("workflow")}
            className={`px-4 py-2 rounded-xl text-sm font-medium font-sans transition-all ${
              workflowView === "workflow"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Workflow
          </button>
          <button
            onClick={() => setOrderTestOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Order Test
          </button>
        </div>
      </div>

      {/* Active Workflow Status */}
      {activeOrders.length > 0 && (
        <div className="card mb-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 font-sans">
              <Activity size={20} className="text-blue-600 dark:text-blue-400" />
              Active Test Orders
            </h3>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium font-sans">
              {activeOrders.length} Active
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map((order) => (
              <div key={order.id} className={`p-4 rounded-xl border ${getStatusColor(order.status)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="text-sm font-semibold font-sans capitalize">{order.status?.replace("-", " ")}</span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-sans">
                    {order.orderedDate && new Date(order.orderedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400 font-sans">Test ID:</span>
                    <span className="font-medium font-sans">{order.id}</span>
                  </div>
                  {order.status === "ordered" && (
                    <button
                      onClick={() => updateTestStatus(order.id, "sample-collected")}
                      className="btn-secondary w-full text-xs py-1.5 mt-2"
                    >
                      Mark Sample Collected
                    </button>
                  )}
                  {order.status === "sample-collected" && (
                    <button
                      onClick={() => updateTestStatus(order.id, "processing")}
                      className="btn-secondary w-full text-xs py-1.5 mt-2"
                    >
                      Start Processing
                    </button>
                  )}
                  {order.status === "processing" && (
                    <button
                      onClick={() => updateTestStatus(order.id, "completed")}
                      className="btn-primary w-full text-xs py-1.5 mt-2"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {workflowView === "workflow" ? (
        /* Workflow View */
        <div className="space-y-6">
          {/* Workflow Steps */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 font-sans">
              <ClipboardCheck size={20} className="text-blue-600 dark:text-blue-400" />
              Microbiome Test Workflow
            </h3>
            <div className="space-y-4">
              {/* Step 1: Order Test */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold font-sans">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 font-sans">Order Test</h4>
                    <button
                      onClick={() => setOrderTestOpen(true)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Order Now
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-sans mb-2">
                    Order a microbiome analysis test. Select test type, priority, and schedule collection date.
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-500 font-sans">
                    <span className="font-medium">Status:</span> {activeOrders.length > 0 ? `${activeOrders.length} pending orders` : "No active orders"}
                  </div>
                </div>
              </div>

              {/* Step 2: Sample Collection */}
              <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold font-sans">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 font-sans">Sample Collection</h4>
                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-sans">
                      {pendingOrders.filter(t => t.status === "sample-collected").length} Collected
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-sans mb-2">
                    Patient collects stool sample using provided kit. Mark as collected when sample is received.
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-500 font-sans">
                    <span className="font-medium">Next:</span> Process sample in lab
                  </div>
                </div>
              </div>

              {/* Step 3: Lab Processing */}
              <div className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold font-sans">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 font-sans">Lab Processing</h4>
                    <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg font-sans">
                      {pendingOrders.filter(t => t.status === "processing").length} Processing
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-sans mb-2">
                    Lab analyzes sample using DNA sequencing. Typically takes 2-3 weeks for full results.
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-500 font-sans">
                    <span className="font-medium">Duration:</span> 14-21 days
                  </div>
                </div>
              </div>

              {/* Step 4: Results & Analysis */}
              <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold font-sans">
                  4
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 font-sans">Results & Analysis</h4>
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-sans">
                      {tests.length} Completed
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-sans mb-2">
                    Review test results, analyze bacteria composition, and assess microbiome health status.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setAddTestOpen(true)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Add Results
                    </button>
                    <button
                      onClick={() => setWorkflowView("overview")}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      View Results <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 5: Recommendations & Follow-up */}
              <div className="flex items-start gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold font-sans">
                  5
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 font-sans">Recommendations & Follow-up</h4>
                    <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg font-sans">
                      {tests.filter(t => t.status === "reviewed").length} Reviewed
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-sans mb-2">
                    Provide dietary recommendations, probiotic suggestions, and schedule follow-up testing (typically 3-6 months).
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-500 font-sans">
                    <span className="font-medium">Follow-up:</span> Schedule next test in 3-6 months to track progress
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Overview View */
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="card hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-sans">Diversity Score</p>
            {diversityTrend === "improving" ? (
              <TrendingUp size={16} className="text-green-500" />
            ) : diversityTrend === "declining" ? (
              <TrendingDown size={16} className="text-red-500" />
            ) : (
              <Activity size={16} className="text-gray-500" />
            )}
          </div>
          <p className="text-3xl font-bold text-green-700 dark:text-green-400 font-sans">
            {latestTest.diversityScore}
            <span className="text-lg ml-1">/100</span>
          </p>
          {previousTest && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 font-sans">
              {diversityTrend === "improving" && "+"}
              {latestTest.diversityScore - previousTest.diversityScore} from last test
            </p>
          )}
        </div>

        <div className="card hover:shadow-lg transition-all duration-300">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 font-sans">Beneficial Bacteria</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-400 font-sans">
            {latestTest.beneficialBacteria}
            <span className="text-lg ml-1">%</span>
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 font-sans">
            {beneficialBacteria.length} species identified
          </p>
        </div>

        <div className="card hover:shadow-lg transition-all duration-300">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 font-sans">Harmful Bacteria</p>
          <p className="text-3xl font-bold text-red-700 dark:text-red-400 font-sans">
            {latestTest.harmfulBacteria}
            <span className="text-lg ml-1">%</span>
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 font-sans">
            {harmfulBacteria.length} species monitored
          </p>
        </div>
      </div>

      {/* Overall Health Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2 font-sans">
            <Dna size={20} className="text-green-600 dark:text-green-400" />
            Overall Microbiome Health
          </h3>
          <span className={`px-4 py-2 text-sm rounded-xl font-semibold font-sans ${getHealthColor(latestTest.overallHealth)}`}>
            {latestTest.overallHealth.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 font-sans">Latest Test Results</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-sans">Test Date:</span>
                <span className="font-semibold font-sans">{new Date(latestTest.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-sans">Diversity Score:</span>
                <span className="font-semibold font-sans">{latestTest.diversityScore}/100</span>
              </div>
              {latestTest.notes && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm font-sans">
                  {latestTest.notes}
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 font-sans">Health Assessment</p>
            <div className="space-y-2">
              {latestTest.overallHealth === "excellent" && (
                <p className="text-sm text-green-700 dark:text-green-300 font-sans">
                  ✓ Excellent microbiome diversity and balance. Continue current regimen.
                </p>
              )}
              {latestTest.overallHealth === "good" && (
                <p className="text-sm text-blue-700 dark:text-blue-300 font-sans">
                  ✓ Good microbiome health. Minor improvements possible with dietary adjustments.
                </p>
              )}
              {latestTest.overallHealth === "moderate" && (
                <p className="text-sm text-yellow-700 dark:text-yellow-300 font-sans">
                  ⚠ Moderate health. Consider probiotic supplementation and dietary changes.
                </p>
              )}
              {latestTest.overallHealth === "poor" && (
                <p className="text-sm text-red-700 dark:text-red-300 font-sans">
                  ⚠ Poor microbiome health. Consult with gastroenterologist for treatment plan.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bacteria Types */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 font-sans">
          <Dna size={20} className="text-purple-600 dark:text-purple-400" />
          Bacteria Composition
        </h3>

        {/* Beneficial Bacteria */}
        <div className="mb-6">
          <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2 font-sans">
            <CheckCircle2 size={16} className="text-green-600" />
            Beneficial Bacteria ({beneficialBacteria.length})
          </h4>
          <div className="space-y-3">
            {beneficialBacteria.map((bacteria, idx) => (
              <div key={idx} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200 font-sans">{bacteria.name}</p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1 font-sans">{bacteria.impact}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-lg font-medium font-sans ${getBacteriaStatusColor(bacteria.status)}`}>
                      {bacteria.status}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2 font-sans">
                    <span>Abundance</span>
                    <span className="font-semibold">{bacteria.abundance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${bacteria.abundance}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Harmful Bacteria */}
        <div>
          <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2 font-sans">
            <AlertTriangle size={16} className="text-red-600" />
            Harmful Bacteria ({harmfulBacteria.length})
          </h4>
          <div className="space-y-3">
            {harmfulBacteria.map((bacteria, idx) => (
              <div key={idx} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-200 font-sans">{bacteria.name}</p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1 font-sans">{bacteria.impact}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-lg font-medium font-sans ${getBacteriaStatusColor(bacteria.status)}`}>
                      {bacteria.status}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2 font-sans">
                    <span>Abundance</span>
                    <span className="font-semibold">{bacteria.abundance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-red-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${bacteria.abundance}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test History */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2 font-sans">
            <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
            Test History
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddTestOpen(true)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Plus size={18} /> Add Results
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {allTests.map((test) => (
            <div
              key={test.id}
              className={`p-4 rounded-xl border ${
                test.status === "reviewed" || test.status === "completed"
                  ? "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  : `border-l-4 ${getStatusColor(test.status)}`
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold font-sans">{test.date ? new Date(test.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "Pending"}</p>
                    {test.status && (
                      <span className={`px-2 py-1 text-xs rounded-lg font-medium font-sans flex items-center gap-1 ${getStatusColor(test.status)}`}>
                        {getStatusIcon(test.status)}
                        {test.status.replace("-", " ")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">
                    Test ID: {test.id}
                  </p>
                </div>
                {test.overallHealth && test.status === "reviewed" && (
                  <span className={`px-3 py-1 text-xs rounded-xl font-semibold font-sans ${getHealthColor(test.overallHealth)}`}>
                    {test.overallHealth}
                  </span>
                )}
              </div>

              {test.status === "reviewed" || test.status === "completed" ? (
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-sans">Diversity</p>
                    <p className="text-lg font-bold font-sans">{test.diversityScore}/100</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-sans">Beneficial</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400 font-sans">{test.beneficialBacteria}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-sans">Harmful</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400 font-sans">{test.harmfulBacteria}%</p>
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                    {test.status === "ordered" && "Test ordered. Awaiting sample collection."}
                    {test.status === "sample-collected" && "Sample collected. Processing in lab."}
                    {test.status === "processing" && "Sample processing. Results typically available in 14-21 days."}
                  </p>
                  {test.orderedDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-sans">
                      Ordered: {new Date(test.orderedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )}

              {test.notes && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 p-3 bg-white dark:bg-gray-800 rounded-xl font-sans">
                  {test.notes}
                </p>
              )}
              
              {test.status && test.status !== "reviewed" && (
                <div className="flex gap-2 mt-4">
                  {test.status === "ordered" && (
                    <button
                      onClick={() => updateTestStatus(test.id, "sample-collected")}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Mark Sample Collected
                    </button>
                  )}
                  {test.status === "sample-collected" && (
                    <button
                      onClick={() => updateTestStatus(test.id, "processing")}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Start Processing
                    </button>
                  )}
                  {test.status === "processing" && (
                    <button
                      onClick={() => updateTestStatus(test.id, "completed")}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Mark Completed
                    </button>
                  )}
                  {test.status === "completed" && (
                    <button
                      onClick={() => updateTestStatus(test.id, "reviewed")}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Mark Reviewed
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 font-sans">
          <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
          Dietary & Lifestyle Recommendations
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2 font-sans">
              ✓ Increase Prebiotic Foods
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 font-sans">
              Add more fiber-rich foods: garlic, onions, bananas, oats, and legumes.
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 font-sans">
              ✓ Probiotic Supplementation
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 font-sans">
              Consider Lactobacillus and Bifidobacterium supplements to boost beneficial bacteria.
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <p className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2 font-sans">
              ✓ Fermented Foods
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300 font-sans">
              Include yogurt, kefir, sauerkraut, and kimchi in your diet 2-3 times per week.
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 font-sans">
              ⚠ Limit Processed Foods
            </p>
            <p className="text-xs text-orange-700 dark:text-orange-300 font-sans">
              Reduce intake of processed foods, sugars, and artificial sweeteners that can harm beneficial bacteria.
            </p>
          </div>
        </div>
      </div>
        </div>
      )}

      {/* Order Test Modal */}
      {orderTestOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOrderTestOpen(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-[500px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-semibold font-sans">Order Microbiome Test</h4>
              <button
                onClick={() => setOrderTestOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleOrderTest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 font-sans">Test Type</label>
                <select
                  required
                  value={orderFormData.testType}
                  onChange={(e) => setOrderFormData({ ...orderFormData, testType: e.target.value as any })}
                  className="input-base"
                >
                  <option value="full-panel">Full Panel (Complete Analysis)</option>
                  <option value="diversity-only">Diversity Only</option>
                  <option value="targeted">Targeted (Specific Bacteria)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 font-sans">Priority</label>
                <select
                  required
                  value={orderFormData.priority}
                  onChange={(e) => setOrderFormData({ ...orderFormData, priority: e.target.value as any })}
                  className="input-base"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 font-sans">Scheduled Collection Date</label>
                <input
                  type="date"
                  required
                  value={orderFormData.scheduledDate}
                  onChange={(e) => setOrderFormData({ ...orderFormData, scheduledDate: e.target.value })}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 font-sans">Reason for Test</label>
                <textarea
                  value={orderFormData.reason}
                  onChange={(e) => setOrderFormData({ ...orderFormData, reason: e.target.value })}
                  placeholder="Clinical indication for microbiome testing..."
                  rows={3}
                  className="input-base resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 font-sans">Ordering Provider</label>
                <input
                  type="text"
                  value={orderFormData.provider}
                  onChange={(e) => setOrderFormData({ ...orderFormData, provider: e.target.value })}
                  placeholder="Provider name"
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 font-sans">Notes (Optional)</label>
                <textarea
                  value={orderFormData.notes}
                  onChange={(e) => setOrderFormData({ ...orderFormData, notes: e.target.value })}
                  placeholder="Additional instructions or notes..."
                  rows={2}
                  className="input-base resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setOrderTestOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Order Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Test Results Modal */}
      {addTestOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setAddTestOpen(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-[500px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-semibold font-sans">Add Microbiome Test Results</h4>
              <button
                onClick={() => setAddTestOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 font-sans">Test Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-base"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2 font-sans">Diversity Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    required
                    value={formData.diversityScore}
                    onChange={(e) => setFormData({ ...formData, diversityScore: e.target.value })}
                    placeholder="0-100"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 font-sans">Beneficial %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    required
                    value={formData.beneficialBacteria}
                    onChange={(e) => setFormData({ ...formData, beneficialBacteria: e.target.value })}
                    placeholder="0-100"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 font-sans">Harmful %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    required
                    value={formData.harmfulBacteria}
                    onChange={(e) => setFormData({ ...formData, harmfulBacteria: e.target.value })}
                    placeholder="0-100"
                    className="input-base"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 font-sans">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional observations or recommendations..."
                  rows={3}
                  className="input-base resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setAddTestOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Add Test Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

