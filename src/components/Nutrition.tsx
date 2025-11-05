import { useState } from "react";
import {
  Apple,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Scale,
  Printer,
  X,
  FileText,
} from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { Patient, NutritionEntry } from "../types";
import UserAssignment from "./UserAssignment";
import { useUsers } from "../hooks/useUsers";
import PrintPreview from "./PrintPreview";
import { openPrintWindow } from "../utils/popupHandler";

interface NutritionProps {
  patient?: Patient;
}

export default function Nutrition({ patient }: NutritionProps) {
  const { selectedPatient, addTimelineEvent } = useDashboard();
  const currentPatient = patient || selectedPatient;
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | NutritionEntry["type"]>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<NutritionEntry | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [printPreview, setPrintPreview] = useState<{ content: string; title: string } | null>(null);

  const { users } = useUsers();
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>(
    currentPatient?.nutritionEntries || []
  );

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "assessment" as NutritionEntry["type"],
    dietitianId: null as string | null,
    dietaryRestrictions: [] as string[],
    allergies: [] as string[],
    currentDiet: "",
    recommendedDiet: "",
    nutritionalGoals: [] as string[],
    caloricNeeds: "",
    proteinNeeds: "",
    fluidNeeds: "",
    supplements: [] as { name: string; dosage: string; frequency: string; reason?: string }[],
    mealPlan: [] as { meal: string; description: string; calories?: number }[],
    weight: "",
    height: "",
    notes: "",
    followUpDate: "",
    currentRestriction: "",
    currentAllergy: "",
    currentGoal: "",
    currentSupplement: { name: "", dosage: "", frequency: "", reason: "" },
    currentMeal: { meal: "", description: "", calories: "" },
  });

  const filteredEntries = nutritionEntries.filter((entry) => {
    const matchesSearch =
      entry.currentDiet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.recommendedDiet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.dietitian?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || entry.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const calculateBMI = (weight: number, height: number): string => {
    if (height === 0) return "0";
    return (weight / ((height / 100) ** 2)).toFixed(1);
  };

  const getTypeColor = (type: NutritionEntry["type"]) => {
    switch (type) {
      case "assessment":
        return "bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400";
      case "plan":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "consultation":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400";
      case "monitoring":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const handleAddNutritionEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const dietitian = formData.dietitianId ? users.find((u: any) => u.id === formData.dietitianId) : null;
    
    const weightNum = formData.weight && formData.weight !== '' ? parseFloat(formData.weight) : NaN;
    const heightNum = formData.height && formData.height !== '' ? parseFloat(formData.height) : NaN;
    const bmi = !isNaN(weightNum) && !isNaN(heightNum) && heightNum > 0
      ? parseFloat(calculateBMI(weightNum, heightNum))
      : undefined;

    const newEntry: NutritionEntry = {
      id: `nutr-${Date.now()}`,
      date: formData.date,
      type: formData.type,
      dietitian: dietitian ? `${dietitian.firstName} ${dietitian.lastName}` : undefined,
      dietitianId: formData.dietitianId || undefined,
      dietaryRestrictions: formData.dietaryRestrictions.length > 0 ? formData.dietaryRestrictions : undefined,
      allergies: formData.allergies.length > 0 ? formData.allergies : undefined,
      currentDiet: formData.currentDiet || undefined,
      recommendedDiet: formData.recommendedDiet || undefined,
      nutritionalGoals: formData.nutritionalGoals.length > 0 ? formData.nutritionalGoals : undefined,
      caloricNeeds: formData.caloricNeeds ? parseInt(formData.caloricNeeds, 10) : undefined,
      proteinNeeds: formData.proteinNeeds ? parseInt(formData.proteinNeeds, 10) : undefined,
      fluidNeeds: formData.fluidNeeds ? parseInt(formData.fluidNeeds, 10) : undefined,
      supplements: formData.supplements.length > 0 ? formData.supplements : undefined,
      mealPlan: formData.mealPlan.length > 0 ? formData.mealPlan.map(m => ({
        meal: m.meal,
        description: m.description,
        calories: m.calories !== undefined && m.calories !== null ? (typeof m.calories === 'number' ? m.calories : undefined) : undefined,
      })) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      bmi: bmi,
      notes: formData.notes || undefined,
      followUpDate: formData.followUpDate || undefined,
    };

    setNutritionEntries([...nutritionEntries, newEntry]);
    addTimelineEvent(currentPatient.id, {
      date: newEntry.date,
      type: "nutrition",
      title: `Nutrition ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`,
      description: formData.recommendedDiet || "Nutrition consultation",
      icon: "apple",
    });

    setFormData({
      date: new Date().toISOString().split("T")[0],
      type: "assessment",
      dietitianId: null,
      dietaryRestrictions: [],
      allergies: [],
      currentDiet: "",
      recommendedDiet: "",
      nutritionalGoals: [],
      caloricNeeds: "",
      proteinNeeds: "",
      fluidNeeds: "",
      supplements: [],
      mealPlan: [],
      weight: "",
      height: "",
      notes: "",
      followUpDate: "",
      currentRestriction: "",
      currentAllergy: "",
      currentGoal: "",
      currentSupplement: { name: "", dosage: "", frequency: "", reason: "" },
      currentMeal: { meal: "", description: "", calories: "" },
    });
    setShowAddForm(false);
  };

  const handlePrintFromPreview = () => {
    if (!printPreview) return;
    openPrintWindow(printPreview.content, printPreview.title);
  };

  const handlePrint = (entry: NutritionEntry) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nutrition ${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} - ${new Date(entry.date).toLocaleDateString()}</title>
          <style>
            @page { margin: 1in; size: letter; }
            body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; color: #1e40af; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
            .info-item { padding: 10px; background: #f9fafb; border-radius: 4px; }
            .info-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
            .info-value { font-size: 14px; font-weight: 600; color: #111827; }
            .section { margin: 30px 0; }
            .section-title { font-size: 16px; font-weight: 600; color: #1e40af; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
            .content { background: #f9fafb; padding: 15px; border-radius: 4px; margin: 20px 0; white-space: pre-wrap; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #2563eb; color: white; font-weight: 600; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>NUTRITION ${entry.type.toUpperCase()}</h1>
            <h2>${new Date(entry.date).toLocaleDateString()}</h2>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Patient Name</div>
              <div class="info-value">${currentPatient?.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date</div>
              <div class="info-value">${new Date(entry.date).toLocaleDateString()}</div>
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
            ${entry.dietitian ? `
            <div class="info-item">
              <div class="info-label">Dietitian</div>
              <div class="info-value">${entry.dietitian}</div>
            </div>
            ` : ""}
            ${entry.weight && entry.height ? `
            <div class="info-item">
              <div class="info-label">Weight</div>
              <div class="info-value">${entry.weight} kg</div>
            </div>
            <div class="info-item">
              <div class="info-label">Height</div>
              <div class="info-value">${entry.height} cm</div>
            </div>
            ${entry.bmi ? `
            <div class="info-item">
              <div class="info-label">BMI</div>
              <div class="info-value">${entry.bmi}</div>
            </div>
            ` : ""}
            ` : ""}
            ${entry.caloricNeeds ? `
            <div class="info-item">
              <div class="info-label">Caloric Needs</div>
              <div class="info-value">${entry.caloricNeeds} kcal/day</div>
            </div>
            ` : ""}
            ${entry.proteinNeeds ? `
            <div class="info-item">
              <div class="info-label">Protein Needs</div>
              <div class="info-value">${entry.proteinNeeds} g/day</div>
            </div>
            ` : ""}
            ${entry.fluidNeeds ? `
            <div class="info-item">
              <div class="info-label">Fluid Needs</div>
              <div class="info-value">${entry.fluidNeeds} ml/day</div>
            </div>
            ` : ""}
          </div>
          ${entry.currentDiet ? `
          <div class="section">
            <div class="section-title">Current Diet</div>
            <div class="content">${entry.currentDiet}</div>
          </div>
          ` : ""}
          ${entry.recommendedDiet ? `
          <div class="section">
            <div class="section-title">Recommended Diet</div>
            <div class="content">${entry.recommendedDiet}</div>
          </div>
          ` : ""}
          ${entry.dietaryRestrictions && entry.dietaryRestrictions.length > 0 ? `
          <div class="section">
            <div class="section-title">Dietary Restrictions</div>
            <div class="content">${entry.dietaryRestrictions.join(", ")}</div>
          </div>
          ` : ""}
          ${entry.allergies && entry.allergies.length > 0 ? `
          <div class="section">
            <div class="section-title">Food Allergies</div>
            <div class="content">${entry.allergies.join(", ")}</div>
          </div>
          ` : ""}
          ${entry.nutritionalGoals && entry.nutritionalGoals.length > 0 ? `
          <div class="section">
            <div class="section-title">Nutritional Goals</div>
            <div class="content">${entry.nutritionalGoals.join(", ")}</div>
          </div>
          ` : ""}
          ${entry.supplements && entry.supplements.length > 0 ? `
          <div class="section">
            <div class="section-title">Supplements</div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  ${entry.supplements.some(s => s.reason) ? "<th>Reason</th>" : ""}
                </tr>
              </thead>
              <tbody>
                ${entry.supplements.map(s => `
                  <tr>
                    <td>${s.name}</td>
                    <td>${s.dosage}</td>
                    <td>${s.frequency}</td>
                    ${s.reason ? `<td>${s.reason}</td>` : "<td></td>"}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ""}
          ${entry.mealPlan && entry.mealPlan.length > 0 ? `
          <div class="section">
            <div class="section-title">Meal Plan</div>
            <table>
              <thead>
                <tr>
                  <th>Meal</th>
                  <th>Description</th>
                  ${entry.mealPlan.some(m => m.calories) ? "<th>Calories</th>" : ""}
                </tr>
              </thead>
              <tbody>
                ${entry.mealPlan.map(m => `
                  <tr>
                    <td>${m.meal}</td>
                    <td>${m.description}</td>
                    ${m.calories ? `<td>${m.calories} kcal</td>` : "<td></td>"}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ""}
          ${entry.notes ? `
          <div class="section">
            <div class="section-title">Notes</div>
            <div class="content">${entry.notes}</div>
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
      title: `Nutrition ${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} - ${new Date(entry.date).toLocaleDateString()}`
    });
  };

  if (!currentPatient) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium mb-2">No Patient Selected</p>
        <p className="text-sm">Please select a patient to view nutrition records.</p>
      </div>
    );
  }

  return (
    <div className="section-spacing">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Apple className="text-teal-600 dark:text-teal-400" size={24} />
            Nutrition
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Nutrition management for {currentPatient.name}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          New Entry
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search nutrition entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as NutritionEntry["type"])}
              className="px-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="assessment">Assessment</option>
              <option value="plan">Plan</option>
              <option value="consultation">Consultation</option>
              <option value="monitoring">Monitoring</option>
            </select>
          </div>
        </div>
      </div>

      {/* Nutrition Entries List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Apple size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">No Nutrition Entries Found</p>
            <p className="text-sm">
              {searchTerm || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No nutrition entries have been created for this patient"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getTypeColor(entry.type)}`}>
                        {entry.type}
                      </span>
                    </div>
                    {entry.recommendedDiet && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Recommended: {entry.recommendedDiet}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      {entry.dietitian && (
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {entry.dietitian}
                        </span>
                      )}
                      {entry.weight && entry.height && (
                        <span className="flex items-center gap-1">
                          <Scale size={14} />
                          {entry.weight} kg / {entry.height} cm
                          {entry.bmi && ` (BMI: ${entry.bmi})`}
                        </span>
                      )}
                      {entry.caloricNeeds && (
                        <span className="flex items-center gap-1">
                          <Apple size={14} />
                          {entry.caloricNeeds} kcal/day
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedEntry(entry);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors text-sm font-medium"
                    >
                      <FileText size={16} />
                      View
                    </button>
                    <button
                      onClick={() => handlePrint(entry)}
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

      {/* Add Nutrition Entry Modal - Large comprehensive form */}
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
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create Nutrition Entry</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Document nutrition assessment or plan</p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddNutritionEntry} className="p-6 space-y-5">
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
                  <label className="block text-base font-medium mb-2.5">Type <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as NutritionEntry["type"] })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="assessment">Assessment</option>
                    <option value="plan">Plan</option>
                    <option value="consultation">Consultation</option>
                    <option value="monitoring">Monitoring</option>
                  </select>
                </div>
              </div>

              <div>
                <UserAssignment
                  assignedTo={formData.dietitianId}
                  allowedRoles={["physician", "nurse_practitioner"]}
                  label="Dietitian (Optional)"
                  placeholder="Select dietitian..."
                  onAssign={(userId) => setFormData({ ...formData, dietitianId: userId })}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => {
                      setFormData({ ...formData, weight: e.target.value });
                      // BMI is calculated automatically in handleAddNutritionEntry
                    }}
                    placeholder="75.0"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => {
                      setFormData({ ...formData, height: e.target.value });
                      // BMI is calculated automatically in handleAddNutritionEntry
                    }}
                    placeholder="170"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Caloric Needs (kcal/day)</label>
                  <input
                    type="number"
                    value={formData.caloricNeeds}
                    onChange={(e) => setFormData({ ...formData, caloricNeeds: e.target.value })}
                    placeholder="2000"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Protein Needs (g/day)</label>
                  <input
                    type="number"
                    value={formData.proteinNeeds}
                    onChange={(e) => setFormData({ ...formData, proteinNeeds: e.target.value })}
                    placeholder="120"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Fluid Needs (ml/day)</label>
                  <input
                    type="number"
                    value={formData.fluidNeeds}
                    onChange={(e) => setFormData({ ...formData, fluidNeeds: e.target.value })}
                    placeholder="2500"
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Current Diet</label>
                <input
                  type="text"
                  value={formData.currentDiet}
                  onChange={(e) => setFormData({ ...formData, currentDiet: e.target.value })}
                  placeholder="e.g., Standard American Diet"
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Recommended Diet</label>
                <input
                  type="text"
                  value={formData.recommendedDiet}
                  onChange={(e) => setFormData({ ...formData, recommendedDiet: e.target.value })}
                  placeholder="e.g., Mediterranean Diet"
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Dietary Restrictions</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.currentRestriction}
                      onChange={(e) => setFormData({ ...formData, currentRestriction: e.target.value })}
                      placeholder="e.g., Gluten-free"
                      className="flex-1 px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && formData.currentRestriction.trim()) {
                          e.preventDefault();
                          setFormData({
                            ...formData,
                            dietaryRestrictions: [...formData.dietaryRestrictions, formData.currentRestriction.trim()],
                            currentRestriction: "",
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.currentRestriction.trim()) {
                          setFormData({
                            ...formData,
                            dietaryRestrictions: [...formData.dietaryRestrictions, formData.currentRestriction.trim()],
                            currentRestriction: "",
                          });
                        }
                      }}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    >
                      Add
                    </button>
                  </div>
                  {formData.dietaryRestrictions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.dietaryRestrictions.map((restriction, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg text-sm"
                        >
                          {restriction}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                dietaryRestrictions: formData.dietaryRestrictions.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-orange-700 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300"
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
                <label className="block text-base font-medium mb-2.5">Food Allergies</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.currentAllergy}
                      onChange={(e) => setFormData({ ...formData, currentAllergy: e.target.value })}
                      placeholder="e.g., Peanuts"
                      className="flex-1 px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && formData.currentAllergy.trim()) {
                          e.preventDefault();
                          setFormData({
                            ...formData,
                            allergies: [...formData.allergies, formData.currentAllergy.trim()],
                            currentAllergy: "",
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.currentAllergy.trim()) {
                          setFormData({
                            ...formData,
                            allergies: [...formData.allergies, formData.currentAllergy.trim()],
                            currentAllergy: "",
                          });
                        }
                      }}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    >
                      Add
                    </button>
                  </div>
                  {formData.allergies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.allergies.map((allergy, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm"
                        >
                          {allergy}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                allergies: formData.allergies.filter((_, i) => i !== idx),
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
                <label className="block text-base font-medium mb-2.5">Nutritional Goals</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.currentGoal}
                      onChange={(e) => setFormData({ ...formData, currentGoal: e.target.value })}
                      placeholder="e.g., Weight management"
                      className="flex-1 px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && formData.currentGoal.trim()) {
                          e.preventDefault();
                          setFormData({
                            ...formData,
                            nutritionalGoals: [...formData.nutritionalGoals, formData.currentGoal.trim()],
                            currentGoal: "",
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.currentGoal.trim()) {
                          setFormData({
                            ...formData,
                            nutritionalGoals: [...formData.nutritionalGoals, formData.currentGoal.trim()],
                            currentGoal: "",
                          });
                        }
                      }}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    >
                      Add
                    </button>
                  </div>
                  {formData.nutritionalGoals.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.nutritionalGoals.map((goal, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm"
                        >
                          {goal}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                nutritionalGoals: formData.nutritionalGoals.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
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
                <label className="block text-base font-medium mb-2.5">Supplements</label>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={formData.currentSupplement.name}
                      onChange={(e) => setFormData({ ...formData, currentSupplement: { ...formData.currentSupplement, name: e.target.value } })}
                      placeholder="Name"
                      className="px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      type="text"
                      value={formData.currentSupplement.dosage}
                      onChange={(e) => setFormData({ ...formData, currentSupplement: { ...formData.currentSupplement, dosage: e.target.value } })}
                      placeholder="Dosage"
                      className="px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      type="text"
                      value={formData.currentSupplement.frequency}
                      onChange={(e) => setFormData({ ...formData, currentSupplement: { ...formData.currentSupplement, frequency: e.target.value } })}
                      placeholder="Frequency"
                      className="px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.currentSupplement.name.trim()) {
                          setFormData({
                            ...formData,
                            supplements: [...formData.supplements, formData.currentSupplement],
                            currentSupplement: { name: "", dosage: "", frequency: "", reason: "" },
                          });
                        }
                      }}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    >
                      Add
                    </button>
                  </div>
                  {formData.supplements.length > 0 && (
                    <div className="space-y-2">
                      {formData.supplements.map((supplement, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg"
                        >
                          <div className="flex-1">
                            <span className="font-medium">{supplement.name}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                              {supplement.dosage} - {supplement.frequency}
                            </span>
                            {supplement.reason && (
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                ({supplement.reason})
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                supplements: formData.supplements.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Meal Plan</label>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={formData.currentMeal.meal}
                      onChange={(e) => setFormData({ ...formData, currentMeal: { ...formData.currentMeal, meal: e.target.value } })}
                      placeholder="Meal (e.g., Breakfast)"
                      className="px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      type="text"
                      value={formData.currentMeal.description}
                      onChange={(e) => setFormData({ ...formData, currentMeal: { ...formData.currentMeal, description: e.target.value } })}
                      placeholder="Description"
                      className="px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      type="number"
                      value={formData.currentMeal.calories}
                      onChange={(e) => setFormData({ ...formData, currentMeal: { ...formData.currentMeal, calories: e.target.value } })}
                      placeholder="Calories"
                      className="px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.currentMeal.meal.trim() && formData.currentMeal.description.trim()) {
                          const calories = formData.currentMeal.calories && formData.currentMeal.calories !== '' 
                            ? (typeof formData.currentMeal.calories === 'string' 
                                ? parseInt(formData.currentMeal.calories, 10) 
                                : formData.currentMeal.calories)
                            : undefined;
                          setFormData({
                            ...formData,
                            mealPlan: [...formData.mealPlan, {
                              meal: formData.currentMeal.meal,
                              description: formData.currentMeal.description,
                              calories,
                            }],
                            currentMeal: { meal: "", description: "", calories: "" },
                          });
                        }
                      }}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    >
                      Add
                    </button>
                  </div>
                  {formData.mealPlan.length > 0 && (
                    <div className="space-y-2">
                      {formData.mealPlan.map((meal, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                        >
                          <div className="flex-1">
                            <span className="font-medium">{meal.meal}:</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                              {meal.description}
                            </span>
                            {meal.calories && (
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                ({meal.calories} kcal)
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                mealPlan: formData.mealPlan.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Follow-up Date</label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  Create Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal - Similar structure to other components, showing all nutrition details */}
      {showDetailsModal && selectedEntry && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetailsModal(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Nutrition {selectedEntry.type.charAt(0).toUpperCase() + selectedEntry.type.slice(1)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {new Date(selectedEntry.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(selectedEntry)}
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
                {selectedEntry.weight && selectedEntry.height && (
                  <>
                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Scale className="text-teal-600 dark:text-teal-400" size={16} />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Weight</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedEntry.weight} kg
                      </p>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Scale className="text-teal-600 dark:text-teal-400" size={16} />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Height</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedEntry.height} cm
                      </p>
                    </div>
                    {selectedEntry.bmi && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Scale className="text-purple-600 dark:text-purple-400" size={16} />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">BMI</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {selectedEntry.bmi}
                        </p>
                      </div>
                    )}
                  </>
                )}
                {selectedEntry.caloricNeeds && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Apple className="text-green-600 dark:text-green-400" size={16} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Calories</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {selectedEntry.caloricNeeds} kcal/day
                    </p>
                  </div>
                )}
              </div>

              {selectedEntry.recommendedDiet && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Recommended Diet</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedEntry.recommendedDiet}</p>
                </div>
              )}

              {selectedEntry.dietaryRestrictions && selectedEntry.dietaryRestrictions.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Dietary Restrictions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.dietaryRestrictions.map((restriction, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-sm">
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.nutritionalGoals && selectedEntry.nutritionalGoals.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Nutritional Goals</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.nutritionalGoals.map((goal, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.supplements && selectedEntry.supplements.length > 0 && (
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Supplements</h4>
                  <div className="space-y-2">
                    {selectedEntry.supplements.map((supplement, idx) => (
                      <div key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{supplement.name}</span> - {supplement.dosage} ({supplement.frequency})
                        {supplement.reason && <span className="text-gray-600 dark:text-gray-400"> - {supplement.reason}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.mealPlan && selectedEntry.mealPlan.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Meal Plan</h4>
                  <div className="space-y-2">
                    {selectedEntry.mealPlan.map((meal, idx) => (
                      <div key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{meal.meal}:</span> {meal.description}
                        {meal.calories && <span className="text-gray-600 dark:text-gray-400"> ({meal.calories} kcal)</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.notes && (
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedEntry.notes}</p>
                </div>
              )}
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

