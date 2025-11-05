import { useState } from "react";
import { Clock, TrendingUp, Activity, Heart, Brain, Dna, Plus, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Patient } from "../types";

interface LongevityProps {
  patient: Patient;
}

interface Biomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  optimalRange: { min: number; max: number };
  status: "optimal" | "good" | "needs_attention";
  date: string;
  category: "cellular" | "metabolic" | "inflammatory" | "cardiovascular" | "cognitive";
}

interface LongevityMetric {
  id: string;
  name: string;
  value: number;
  unit?: string;
  trend: "improving" | "stable" | "declining";
  lastUpdated: string;
}

export default function Longevity({ patient }: LongevityProps) {
  const [addBiomarkerOpen, setAddBiomarkerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    unit: "",
    category: "metabolic" as Biomarker["category"],
    date: new Date().toISOString().split("T")[0],
  });

  // Longevity data - loaded from patient data or API
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>(
    patient?.biomarkers || []
  );

  const [metrics, setMetrics] = useState<LongevityMetric[]>(
    patient?.longevityMetrics || []
  );

  const getStatusColor = (status: Biomarker["status"]) => {
    switch (status) {
      case "optimal":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "good":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "needs_attention":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  const getTrendIcon = (trend: LongevityMetric["trend"]) => {
    switch (trend) {
      case "improving":
        return <TrendingUp size={16} className="text-green-500" />;
      case "declining":
        return <TrendingUp size={16} className="text-red-500 rotate-180" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: Biomarker["category"]) => {
    switch (category) {
      case "cellular":
        return <Dna size={18} className="text-purple-600 dark:text-purple-400" />;
      case "metabolic":
        return <Activity size={18} className="text-blue-600 dark:text-blue-400" />;
      case "inflammatory":
        return <AlertCircle size={18} className="text-orange-600 dark:text-orange-400" />;
      case "cardiovascular":
        return <Heart size={18} className="text-red-600 dark:text-red-400" />;
      case "cognitive":
        return <Brain size={18} className="text-indigo-600 dark:text-indigo-400" />;
    }
  };

  const calculateStatus = (value: number, optimalRange: { min: number; max: number }): Biomarker["status"] => {
    if (value >= optimalRange.min && value <= optimalRange.max) {
      return "optimal";
    } else if (value >= optimalRange.min * 0.9 && value <= optimalRange.max * 1.1) {
      return "good";
    }
    return "needs_attention";
  };

  const handleAddBiomarker = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(formData.value);
    const optimalRange = { min: value * 0.8, max: value * 1.2 }; // Mock range
    
    const newBiomarker: Biomarker = {
      id: `bio-${Date.now()}`,
      name: formData.name,
      value,
      unit: formData.unit,
      optimalRange,
      status: calculateStatus(value, optimalRange),
      date: formData.date,
      category: formData.category,
    };

    setBiomarkers([...biomarkers, newBiomarker]);
    setFormData({ name: "", value: "", unit: "", category: "metabolic", date: new Date().toISOString().split("T")[0] });
    setAddBiomarkerOpen(false);
  };

  const biologicalAge = metrics.find((m) => m.id === "metric-001")?.value || patient.age;
  const ageGap = patient.age - biologicalAge;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{metric.name}</p>
              {getTrendIcon(metric.trend)}
            </div>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              {metric.value}
              {metric.unit && <span className="text-lg ml-1">{metric.unit}</span>}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Updated: {new Date(metric.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Age Gap Indicator */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-blue-600 dark:text-blue-400" />
          Biological vs Chronological Age
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Chronological Age</p>
            <p className="text-4xl font-bold text-gray-800 dark:text-gray-200">{patient.age}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Actual age</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Biological Age</p>
            <p className={`text-4xl font-bold ${ageGap > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {biologicalAge.toFixed(1)}
            </p>
            <p className={`text-sm font-medium mt-1 ${ageGap > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {ageGap > 0 ? `${ageGap.toFixed(1)} years younger` : `${Math.abs(ageGap).toFixed(1)} years older`}
            </p>
          </div>
        </div>
      </div>

      {/* Biomarkers */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Dna size={20} className="text-purple-600 dark:text-purple-400" />
            Longevity Biomarkers
          </h3>
          <button
            onClick={() => setAddBiomarkerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            <Plus size={18} /> Add Biomarker
          </button>
        </div>

        <div className="space-y-4">
          {biomarkers.map((biomarker) => (
            <div
              key={biomarker.id}
              className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(biomarker.category)}
                  <div>
                    <h4 className="font-semibold">{biomarker.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{biomarker.category}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(biomarker.status)}`}>
                  {biomarker.status.replace("_", " ")}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Value</p>
                  <p className="text-lg font-bold">
                    {biomarker.value} {biomarker.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Optimal Range</p>
                  <p className="text-sm">
                    {biomarker.optimalRange.min} - {biomarker.optimalRange.max} {biomarker.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Last Tested</p>
                  <p className="text-sm">{new Date(biomarker.date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      biomarker.status === "optimal"
                        ? "bg-green-500"
                        : biomarker.status === "good"
                        ? "bg-blue-500"
                        : "bg-yellow-500"
                    }`}
                    style={{
                      width: `${Math.min(100, ((biomarker.value - biomarker.optimalRange.min) / (biomarker.optimalRange.max - biomarker.optimalRange.min)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
          Longevity Recommendations
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
              ✓ Optimal Telomere Length
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              Continue current lifestyle. Consider intermittent fasting and regular exercise.
            </p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              ℹ Metabolic Health
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Maintain healthy insulin sensitivity through diet and exercise. Monitor glucose levels.
            </p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">
              🧠 Cognitive Health
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              Brain age is excellent. Continue cognitive training and social engagement.
            </p>
          </div>
        </div>
      </div>

      {/* Add Biomarker Modal */}
      {addBiomarkerOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setAddBiomarkerOpen(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-[500px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Add Biomarker</h4>
              <button
                onClick={() => setAddBiomarkerOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddBiomarker} className="space-y-5">
              <div>
                <label className="block text-base font-medium mb-2.5">Biomarker Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Telomere Length, CRP"
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium mb-2.5">Value</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Unit</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., mg/L, kb"
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-base font-medium mb-2.5">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Biomarker["category"] })}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                >
                  <option value="cellular">Cellular</option>
                  <option value="metabolic">Metabolic</option>
                  <option value="inflammatory">Inflammatory</option>
                  <option value="cardiovascular">Cardiovascular</option>
                  <option value="cognitive">Cognitive</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-medium mb-2.5">Test Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setAddBiomarkerOpen(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Biomarker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

