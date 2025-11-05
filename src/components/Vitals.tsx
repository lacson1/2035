import { useState, useMemo, memo, useEffect } from "react";
import { Activity, Heart, Thermometer, Gauge, TrendingUp, TrendingDown, Minus, Plus, X } from "lucide-react";
import { Patient } from "../types";
import { useDashboard } from "../context/DashboardContext";
import {
  getMeasurementSystem,
  convertTemperatureForDisplay,
  convertTemperatureForStorage,
  formatTemperature,
  getTemperaturePlaceholder,
  getTemperatureRange,
} from "../utils/measurements";

interface VitalsProps {
  patient: Patient;
}

interface VitalReading {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  oxygen: number;
}

// Generate sample historical data based on patient's current BP
function Vitals({ patient }: VitalsProps) {
  const { updatePatient } = useDashboard();
  const [selectedMetric, setSelectedMetric] = useState<"bp" | "hr" | "temp" | "o2">("bp");
  const [showAddForm, setShowAddForm] = useState(false);
  const [measurementSystem, setMeasurementSystem] = useState(() => getMeasurementSystem());
  const [recordedVitals, setRecordedVitals] = useState<VitalReading[]>(() => {
    // Load recorded vitals from localStorage for this patient
    const stored = localStorage.getItem(`patient_vitals_${patient.id}`);
    return stored ? JSON.parse(stored) : [];
  });
  
  // Listen for measurement system changes
  useEffect(() => {
    const handleStorageChange = () => {
      setMeasurementSystem(getMeasurementSystem());
    };
    window.addEventListener('storage', handleStorageChange);
    // Also check periodically in case localStorage is updated in the same window
    const interval = setInterval(() => {
      const current = getMeasurementSystem();
      if (current !== measurementSystem) {
        setMeasurementSystem(current);
      }
    }, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [measurementSystem]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    systolic: "",
    diastolic: "",
    heartRate: "",
    temperature: "",
    oxygen: "",
    notes: "",
  });
  
  // Reload recorded vitals when patient changes
  useEffect(() => {
    const stored = localStorage.getItem(`patient_vitals_${patient.id}`);
    setRecordedVitals(stored ? JSON.parse(stored) : []);
  }, [patient.id]);
  
  // Save recorded vitals to localStorage when they change
  useEffect(() => {
    if (recordedVitals.length > 0) {
      localStorage.setItem(`patient_vitals_${patient.id}`, JSON.stringify(recordedVitals));
    }
  }, [recordedVitals, patient.id]);
  
  const [systolic, diastolic] = patient.bp.split("/").map(Number);
  
  // Generate historical data (last 30 days)
  const generateHistoricalData = (): VitalReading[] => {
    const data: VitalReading[] = [];
    const baseSystolic = systolic;
    const baseDiastolic = diastolic;
    
    // Start from 30 days ago, but don't generate data for dates that have recorded vitals
    const recordedDates = new Set(recordedVitals.map(v => v.date));
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      // Skip if we have a recorded vital for this date
      if (!recordedDates.has(dateStr)) {
        data.push({
          date: dateStr,
          systolic: baseSystolic + Math.floor(Math.random() * 10) - 5,
          diastolic: baseDiastolic + Math.floor(Math.random() * 8) - 4,
          heartRate: 65 + Math.floor(Math.random() * 20),
          temperature: 36.8 + (Math.random() * 0.4), // Store in Celsius (UK standard)
          oxygen: 96 + Math.floor(Math.random() * 4),
        });
      }
    }
    return data;
  };

  // Merge generated historical data with recorded vitals, sorted by date
  const historicalData = useMemo(() => {
    const generated = generateHistoricalData();
    const combined = [...generated, ...recordedVitals];
    // Sort by date, most recent first
    return combined.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    }).reverse(); // Reverse to get oldest first for display
  }, [recordedVitals, systolic, diastolic]);

  const getTrend = (values: number[]) => {
    if (values.length < 2) return "stable";
    const recent = values.slice(-7);
    const older = values.slice(-14, -7);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const diff = recentAvg - olderAvg;
    if (Math.abs(diff) < 0.5) return "stable";
    return diff > 0 ? "up" : "down";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp size={16} className="text-red-500" />;
      case "down":
        return <TrendingDown size={16} className="text-green-500" />;
      default:
        return <Minus size={16} className="text-gray-500" />;
    }
  };

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) return { text: "High", color: "text-red-600 dark:text-red-400" };
    if (systolic >= 120 || diastolic >= 80) return { text: "Elevated", color: "text-orange-600 dark:text-orange-400" };
    return { text: "Normal", color: "text-green-600 dark:text-green-400" };
  };

  const getHRStatus = (hr: number) => {
    if (hr > 100) return { text: "Elevated", color: "text-orange-600 dark:text-orange-400" };
    if (hr < 60) return { text: "Low", color: "text-blue-600 dark:text-blue-400" };
    return { text: "Normal", color: "text-green-600 dark:text-green-400" };
  };

  const SimpleChart = ({ values, color, min, max }: { values: number[]; color: string; min: number; max: number }) => {
    const width = 600;
    const height = 100;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const normalized = values.map(v => {
      const normalized = ((v - min) / (max - min));
      return padding + chartHeight - (normalized * chartHeight);
    });
    
    const points = normalized.map((y, i) => {
      const x = padding + (i / (values.length - 1)) * chartWidth;
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg width={width} height={height} className="w-full">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {normalized.map((y, i) => {
          const x = padding + (i / (values.length - 1)) * chartWidth;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill={color}
            />
          );
        })}
      </svg>
    );
  };

  // Get the most recent vital reading (latest date)
  const latest = useMemo(() => {
    if (historicalData.length === 0) {
      // Fallback to patient's current BP if no data
      const [systolic, diastolic] = patient.bp.split("/").map(Number);
      return {
        date: new Date().toISOString().split("T")[0],
        systolic,
        diastolic,
        heartRate: 72,
        temperature: 37.0, // Store in Celsius (UK standard)
        oxygen: 98,
      };
    }
    // Return the most recent (last item after sorting)
    return historicalData[historicalData.length - 1];
  }, [historicalData, patient.bp]);

  const trends = useMemo(() => ({
    bp: getTrend(historicalData.map(d => d.systolic)),
    hr: getTrend(historicalData.map(d => d.heartRate)),
    temp: getTrend(historicalData.map(d => d.temperature)),
    o2: getTrend(historicalData.map(d => d.oxygen)),
  }), [historicalData]);

  const bpStatus = useMemo(() => getBPStatus(latest.systolic, latest.diastolic), [latest]);
  const hrStatus = useMemo(() => getHRStatus(latest.heartRate), [latest]);

  const handleAddVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const systolicNum = parseInt(formData.systolic);
    const diastolicNum = parseInt(formData.diastolic);
    const heartRateNum = parseInt(formData.heartRate);
    const temperatureInput = parseFloat(formData.temperature);
    const oxygenNum = parseInt(formData.oxygen);
    
    if (isNaN(systolicNum) || isNaN(diastolicNum) || isNaN(heartRateNum) || 
        isNaN(temperatureInput) || isNaN(oxygenNum)) {
      alert("Please fill in all required vital sign fields with valid numbers.");
      return;
    }
    
    // Convert temperature to Celsius for storage (UK standard)
    const temperatureCelsius = convertTemperatureForStorage(temperatureInput, measurementSystem);
    
    // Create new vital reading (temperature stored in Celsius)
    const newVital: VitalReading = {
      date: formData.date,
      systolic: systolicNum,
      diastolic: diastolicNum,
      heartRate: heartRateNum,
      temperature: temperatureCelsius,
      oxygen: oxygenNum,
    };
    
    // Add to recorded vitals (remove any existing reading for the same date)
    setRecordedVitals(prev => {
      const filtered = prev.filter(v => v.date !== formData.date);
      return [...filtered, newVital].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
    });
    
    // Update patient's BP with the latest reading
    const newBP = `${systolicNum}/${diastolicNum}`;
    updatePatient(patient.id, (p) => ({
      ...p,
      bp: newBP,
    }));
    
    // Try to save to API if authenticated
    try {
      const { patientService } = await import("../services/patients");
      await patientService.updatePatient(patient.id, {
        bp: newBP,
      });
    } catch (apiError) {
      // API save failed, but continue with local update
      if (import.meta.env.DEV) {
        console.warn('Failed to save vitals to API, using local update only:', apiError);
      }
    }
    
    // Reset form and close modal
    setFormData({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      systolic: "",
      diastolic: "",
      heartRate: "",
      temperature: "",
      oxygen: "",
      notes: "",
    });
    setShowAddForm(false);
  };

  return (
    <div className="section-spacing">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 font-sans">Vital Signs</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Record Vitals
        </button>
      </div>

      {/* Current Vitals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Blood Pressure */}
        <div className="card hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gauge className="text-blue-600 dark:text-blue-400" size={24} />
              <span className="font-semibold">Blood Pressure</span>
            </div>
            {getTrendIcon(trends.bp)}
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{latest.systolic}/{latest.diastolic}</p>
            <p className={`text-sm font-medium ${bpStatus.color}`}>
              {bpStatus.text}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last updated: {new Date(latest.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Heart Rate */}
        <div className="card hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="text-red-600 dark:text-red-400" size={24} />
              <span className="font-semibold">Heart Rate</span>
            </div>
            {getTrendIcon(trends.hr)}
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{latest.heartRate}</p>
            <p className={`text-sm font-medium ${hrStatus.color}`}>
              {hrStatus.text} bpm
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Resting rate
            </p>
          </div>
        </div>

        {/* Temperature */}
        <div className="card hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Thermometer className="text-orange-600 dark:text-orange-400" size={24} />
              <span className="font-semibold">Temperature</span>
            </div>
            {getTrendIcon(trends.temp)}
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">
              {formatTemperature(latest.temperature, measurementSystem, true)}
            </p>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Normal
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Oral measurement
            </p>
          </div>
        </div>

        {/* Oxygen Saturation */}
        <div className="card hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="text-green-600 dark:text-green-400" size={24} />
              <span className="font-semibold">SpO2</span>
            </div>
            {getTrendIcon(trends.o2)}
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{latest.oxygen}%</p>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Normal
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Pulse oximetry
            </p>
          </div>
        </div>
      </div>

      {/* Chart Selection */}
      <div className="card-compact">
        <div className="flex gap-2 mb-4">
          {[
            { key: "bp" as const, label: "Blood Pressure" },
            { key: "hr" as const, label: "Heart Rate" },
            { key: "temp" as const, label: "Temperature" },
            { key: "o2" as const, label: "Oxygen Saturation" },
          ].map((metric) => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                selectedMetric === metric.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>

        {/* Chart Display */}
        <div className="mt-4">
          {selectedMetric === "bp" && (
            <div>
              <h4 className="font-semibold mb-2">Blood Pressure Trend (30 days)</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Systolic (mmHg)</p>
                  <SimpleChart
                    values={historicalData.map(d => d.systolic)}
                    color="#3b82f6"
                    min={100}
                    max={160}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Diastolic (mmHg)</p>
                  <SimpleChart
                    values={historicalData.map(d => d.diastolic)}
                    color="#8b5cf6"
                    min={60}
                    max={100}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedMetric === "hr" && (
            <div>
              <h4 className="font-semibold mb-2">Heart Rate Trend (30 days)</h4>
              <SimpleChart
                values={historicalData.map(d => d.heartRate)}
                color="#ef4444"
                min={50}
                max={100}
              />
            </div>
          )}

          {selectedMetric === "temp" && (
            <div>
              <h4 className="font-semibold mb-2">
                Temperature Trend (30 days) - {measurementSystem === "uk" ? "°C" : "°F"}
              </h4>
              <SimpleChart
                values={historicalData.map(d => 
                  convertTemperatureForDisplay(d.temperature, measurementSystem)
                )}
                color="#f97316"
                min={measurementSystem === "uk" ? 36 : 97}
                max={measurementSystem === "uk" ? 38 : 100}
              />
            </div>
          )}

          {selectedMetric === "o2" && (
            <div>
              <h4 className="font-semibold mb-2">Oxygen Saturation Trend (30 days)</h4>
              <SimpleChart
                values={historicalData.map(d => d.oxygen)}
                color="#10b981"
                min={92}
                max={100}
              />
            </div>
          )}
        </div>
      </div>

      {/* Recent Readings Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Readings (Last 7 Days)</h3>
        <div className="table-container">
          <table className="table-mobile text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 text-gray-600 dark:text-gray-400">Date</th>
                <th className="text-left py-2 text-gray-600 dark:text-gray-400">BP</th>
                <th className="text-left py-2 text-gray-600 dark:text-gray-400">HR</th>
                <th className="text-left py-2 text-gray-600 dark:text-gray-400">Temp</th>
                <th className="text-left py-2 text-gray-600 dark:text-gray-400">SpO2</th>
              </tr>
            </thead>
            <tbody>
              {historicalData.slice(-7).reverse().map((reading) => (
                <tr key={reading.date} className="border-b dark:border-gray-700">
                  <td className="py-2">{new Date(reading.date).toLocaleDateString()}</td>
                  <td className="py-2 font-medium">{reading.systolic}/{reading.diastolic}</td>
                  <td className="py-2">{reading.heartRate} bpm</td>
                  <td className="py-2">
                    {formatTemperature(reading.temperature, measurementSystem, true)}
                  </td>
                  <td className="py-2">{reading.oxygen}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vitals Modal */}
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
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Record New Vital Signs</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enter current patient vital signs</p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddVitals} className="p-6 space-y-5">
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <label className="block text-base font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Gauge className="text-blue-600 dark:text-blue-400" size={20} />
                  Blood Pressure <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Systolic (mmHg)</label>
                    <input
                      type="number"
                      required
                      min="50"
                      max="250"
                      value={formData.systolic}
                      onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                      placeholder="e.g., 120"
                      className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Diastolic (mmHg)</label>
                    <input
                      type="number"
                      required
                      min="30"
                      max="150"
                      value={formData.diastolic}
                      onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                      placeholder="e.g., 80"
                      className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Heart Rate */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <label className="block text-base font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Heart className="text-red-600 dark:text-red-400" size={20} />
                  Heart Rate <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="30"
                  max="200"
                  value={formData.heartRate}
                  onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                  placeholder="e.g., 72"
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Beats per minute (bpm)</p>
              </div>

              {/* Temperature */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <label className="block text-base font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Thermometer className="text-orange-600 dark:text-orange-400" size={20} />
                  Temperature <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={getTemperatureRange(measurementSystem).min}
                  max={getTemperatureRange(measurementSystem).max}
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  placeholder={getTemperaturePlaceholder(measurementSystem)}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {measurementSystem === "uk" ? "Celsius (°C)" : "Fahrenheit (°F)"}
                </p>
              </div>

              {/* Oxygen Saturation */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <label className="block text-base font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Activity className="text-green-600 dark:text-green-400" size={20} />
                  Oxygen Saturation (SpO2) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="70"
                  max="100"
                  value={formData.oxygen}
                  onChange={(e) => setFormData({ ...formData, oxygen: e.target.value })}
                  placeholder="e.g., 98"
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Percentage (%)</p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Notes <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about the vital signs (e.g., patient position, method of measurement)..."
                  rows={3}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      date: new Date().toISOString().split("T")[0],
                      time: new Date().toTimeString().slice(0, 5),
                      systolic: "",
                      diastolic: "",
                      heartRate: "",
                      temperature: "",
                      oxygen: "",
                      notes: "",
                    });
                  }}
                  className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Record Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(Vitals);

