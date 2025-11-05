import { useState, useEffect } from "react";
import { Calculator, Droplet, Ruler, Activity, Baby, Clock, Syringe, Beaker, DollarSign, TrendingUp, Info, Heart, Brain, Scale, Thermometer, AlertCircle, CheckCircle2 } from "lucide-react";

interface CalculatorResult {
  value: number;
  unit: string;
  explanation?: string;
  warnings?: string[];
}

type CalculatorType =
  | "dosage"
  | "drip-rate"
  | "bsa"
  | "creatinine-clearance"
  | "pediatric-dose"
  | "half-life"
  | "iv-infusion"
  | "body-weight-dose"
  | "alligation"
  | "cost"
  | "dilution"
  | "steady-state"
  | "bmi"
  | "ideal-body-weight"
  | "adjusted-body-weight"
  | "egfr"
  | "anion-gap"
  | "qtc"
  | "map"
  | "parkland"
  | "rule-of-nines"
  | "free-water-deficit"
  | "fluid-maintenance"
  | "antipsychotic-equivalent"
  | "lithium-dose"
  | "blood-loss"
  | "postop-fluids";

const calculatorInfo: Record<CalculatorType, { name: string; description: string; icon: typeof Calculator }> = {
  dosage: { name: "Dosage Calculator", description: "Calculate medication dose based on weight and concentration", icon: Calculator },
  "drip-rate": { name: "IV Drip Rate", description: "Calculate IV drip rate in drops per minute", icon: Droplet },
  bsa: { name: "Body Surface Area", description: "Calculate BSA using Mosteller formula", icon: Ruler },
  "creatinine-clearance": { name: "Creatinine Clearance", description: "Calculate CrCl for dose adjustments (Cockcroft-Gault)", icon: Activity },
  "pediatric-dose": { name: "Pediatric Dose", description: "Calculate safe pediatric medication doses", icon: Baby },
  "half-life": { name: "Drug Half-Life", description: "Calculate drug concentration over time", icon: Clock },
  "iv-infusion": { name: "IV Infusion Rate", description: "Calculate IV infusion rate in mL/hour", icon: Syringe },
  "body-weight-dose": { name: "Weight-Based Dose", description: "Calculate dose per kg body weight", icon: Activity },
  alligation: { name: "Alligation Calculator", description: "Calculate mixing ratios for compounding", icon: Beaker },
  cost: { name: "Medication Cost", description: "Calculate medication cost per dose and per month", icon: DollarSign },
  dilution: { name: "Dilution Calculator", description: "Calculate dilution ratios and concentrations", icon: Beaker },
  "steady-state": { name: "Steady State Time", description: "Calculate time to reach steady state", icon: TrendingUp },
  bmi: { name: "BMI Calculator", description: "Calculate Body Mass Index", icon: Scale },
  "ideal-body-weight": { name: "Ideal Body Weight", description: "Calculate IBW using Devine formula", icon: Scale },
  "adjusted-body-weight": { name: "Adjusted Body Weight", description: "Calculate ABW for obese patients", icon: Scale },
  egfr: { name: "eGFR Calculator", description: "Estimate Glomerular Filtration Rate (MDRD/CKD-EPI)", icon: Activity },
  "anion-gap": { name: "Anion Gap", description: "Calculate anion gap for metabolic acidosis", icon: Activity },
  qtc: { name: "QTc Calculator", description: "Corrected QT interval (Bazett/Fridericia)", icon: Heart },
  map: { name: "Mean Arterial Pressure", description: "Calculate MAP from systolic and diastolic BP", icon: Heart },
  parkland: { name: "Parkland Formula", description: "Burn resuscitation fluid calculation", icon: Thermometer },
  "rule-of-nines": { name: "Rule of Nines", description: "Estimate total body surface area burned", icon: Thermometer },
  "free-water-deficit": { name: "Free Water Deficit", description: "Calculate free water deficit in hypernatremia", icon: Droplet },
  "fluid-maintenance": { name: "Fluid Maintenance", description: "Calculate daily fluid maintenance (Holliday-Segar)", icon: Droplet },
  "antipsychotic-equivalent": { name: "Antipsychotic Equivalent", description: "Convert between antipsychotic doses", icon: Brain },
  "lithium-dose": { name: "Lithium Dosing", description: "Calculate lithium dose based on levels", icon: Brain },
  "blood-loss": { name: "Blood Loss Estimation", description: "Estimate surgical blood loss", icon: Activity },
  "postop-fluids": { name: "Post-op Fluids", description: "Calculate post-operative fluid requirements", icon: Droplet },
};

export default function MedicationCalculators() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>("dosage");

  const renderCalculator = () => {
    switch (activeCalculator) {
      case "dosage":
        return <DosageCalculator />;
      case "drip-rate":
        return <DripRateCalculator />;
      case "bsa":
        return <BSACalculator />;
      case "creatinine-clearance":
        return <CreatinineClearanceCalculator />;
      case "pediatric-dose":
        return <PediatricDoseCalculator />;
      case "half-life":
        return <HalfLifeCalculator />;
      case "iv-infusion":
        return <IVInfusionCalculator />;
      case "body-weight-dose":
        return <BodyWeightDoseCalculator />;
      case "alligation":
        return <AlligationCalculator />;
      case "cost":
        return <CostCalculator />;
      case "dilution":
        return <DilutionCalculator />;
      case "steady-state":
        return <SteadyStateCalculator />;
      case "bmi":
        return <BMICalculator />;
      case "ideal-body-weight":
        return <IdealBodyWeightCalculator />;
      case "adjusted-body-weight":
        return <AdjustedBodyWeightCalculator />;
      case "egfr":
        return <EGFRCalculator />;
      case "anion-gap":
        return <AnionGapCalculator />;
      case "qtc":
        return <QTcCalculator />;
      case "map":
        return <MAPCalculator />;
      case "parkland":
        return <ParklandCalculator />;
      case "rule-of-nines":
        return <RuleOfNinesCalculator />;
      case "free-water-deficit":
        return <FreeWaterDeficitCalculator />;
      case "fluid-maintenance":
        return <FluidMaintenanceCalculator />;
      case "antipsychotic-equivalent":
        return <AntipsychoticEquivalentCalculator />;
      case "lithium-dose":
        return <LithiumDoseCalculator />;
      case "blood-loss":
        return <BloodLossCalculator />;
      case "postop-fluids":
        return <PostOpFluidsCalculator />;
      default:
        return <DosageCalculator />;
    }
  };

  return (
    <div className="section-spacing">
      <div className="card-compact">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Calculator className="text-blue-600" size={28} />
            Medication Calculators
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Professional medication calculation tools for clinical use
          </p>
        </div>

        {/* Calculator Selection */}
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Object.entries(calculatorInfo).map(([key, info]) => {
              const Icon = info.icon;
              const isActive = activeCalculator === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCalculator(key as CalculatorType)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${isActive
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                >
                  <Icon
                    className={`mb-2 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                    size={24}
                  />
                  <div className="font-semibold text-sm mb-1">{info.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{info.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Calculator */}
        <div className="mt-6">{renderCalculator()}</div>
      </div>
    </div>
  );
}

// 1. Dosage Calculator
function DosageCalculator() {
  const [weight, setWeight] = useState("");
  const [dosePerKg, setDosePerKg] = useState("");
  const [concentration, setConcentration] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const dpk = parseFloat(dosePerKg);
    const conc = parseFloat(concentration);

    if (isNaN(w) || isNaN(dpk) || isNaN(conc) || w <= 0 || dpk <= 0 || conc <= 0) {
      setResult(null);
      return;
    }

    const totalDose = w * dpk;
    const volume = totalDose / conc;

    setResult({
      value: totalDose,
      unit: "mg",
      explanation: `Total dose: ${totalDose.toFixed(2)} mg = ${volume.toFixed(2)} mL of ${concentration} mg/mL solution`,
    });
  };

  // Real-time calculation
  useEffect(() => {
    calculate();
  }, [weight, dosePerKg, concentration]);

  const isValid = (val: string) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  };

  return (
    <CalculatorCard title="Dosage Calculator" icon={Calculator}>
      <div className="space-y-5">
        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1.5">
            <Info size={14} />
            Formula: Total Dose = Weight × Dose per kg
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              Patient Weight
              {isValid(weight) && <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />}
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g., 70"
              className={`w-full px-4 py-3 border rounded-xl transition-all ${
                isValid(weight)
                  ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
              } dark:bg-gray-800 focus:outline-none`}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Enter patient weight in kilograms</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              Dose per kg
              {isValid(dosePerKg) && <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />}
            </label>
            <input
              type="number"
              step="0.1"
              value={dosePerKg}
              onChange={(e) => setDosePerKg(e.target.value)}
              placeholder="e.g., 5"
              className={`w-full px-4 py-3 border rounded-xl transition-all ${
                isValid(dosePerKg)
                  ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
              } dark:bg-gray-800 focus:outline-none`}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Medication dose per kilogram body weight</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              Solution Concentration
              {isValid(concentration) && <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />}
            </label>
            <input
              type="number"
              step="0.1"
              value={concentration}
              onChange={(e) => setConcentration(e.target.value)}
              placeholder="e.g., 10"
              className={`w-full px-4 py-3 border rounded-xl transition-all ${
                isValid(concentration)
                  ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
              } dark:bg-gray-800 focus:outline-none`}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Concentration of medication solution in mg/mL</p>
          </div>
        </div>

        {result && (
          <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="text-blue-600 dark:text-blue-400" size={20} />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Calculation Result</span>
            </div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">
              {result.value.toFixed(2)} <span className="text-xl">{result.unit}</span>
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200 mt-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
              {result.explanation}
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 2. IV Drip Rate Calculator
function DripRateCalculator() {
  const [volume, setVolume] = useState("");
  const [time, setTime] = useState("");
  const [dropFactor, setDropFactor] = useState("20");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const v = parseFloat(volume);
    const t = parseFloat(time);
    const df = parseFloat(dropFactor);

    if (isNaN(v) || isNaN(t) || isNaN(df) || v <= 0 || t <= 0 || df <= 0) {
      setResult(null);
      return;
    }

    const dropsPerMinute = (v * df) / (t * 60);

    setResult({
      value: dropsPerMinute,
      unit: "drops/min",
      explanation: `${v} mL over ${t} hours with drop factor ${df} gtt/mL`,
    });
  };

  useEffect(() => {
    calculate();
  }, [volume, time, dropFactor]);

  const isValid = (val: string) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  };

  return (
    <CalculatorCard title="IV Drip Rate Calculator" icon={Droplet}>
      <div className="space-y-5">
        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1.5">
            <Info size={14} />
            Formula: Drops/min = (Volume × Drop Factor) ÷ (Time × 60)
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              Total Volume
              {isValid(volume) && <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />}
            </label>
            <input
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder="e.g., 500"
              className={`w-full px-4 py-3 border rounded-xl transition-all ${
                isValid(volume)
                  ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
              } dark:bg-gray-800 focus:outline-none`}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Total volume to infuse in milliliters</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              Infusion Time
              {isValid(time) && <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />}
            </label>
            <input
              type="number"
              step="0.1"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g., 8"
              className={`w-full px-4 py-3 border rounded-xl transition-all ${
                isValid(time)
                  ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
              } dark:bg-gray-800 focus:outline-none`}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Time required for infusion in hours</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Drop Factor</label>
            <select
              value={dropFactor}
              onChange={(e) => setDropFactor(e.target.value)}
              aria-label="Drop Factor"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all"
            >
              <option value="10">10 gtt/mL (Macrodrip)</option>
              <option value="15">15 gtt/mL</option>
              <option value="20">20 gtt/mL (Standard)</option>
              <option value="60">60 gtt/mL (Microdrip)</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Number of drops per milliliter for the IV set</p>
          </div>
        </div>

        {result && (
          <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Droplet className="text-blue-600 dark:text-blue-400" size={20} />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Infusion Rate</span>
            </div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">
              {result.value.toFixed(1)} <span className="text-xl">{result.unit}</span>
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200 mt-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
              {result.explanation}
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 3. Body Surface Area Calculator
function BSACalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    let h = parseFloat(height);
    let w = parseFloat(weight);

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      setResult(null);
      return;
    }

    // Convert to metric if imperial
    if (unit === "imperial") {
      h = h * 2.54; // inches to cm
      w = w * 0.453592; // lbs to kg
    }

    // Mosteller formula: BSA (m²) = √[(Height × Weight) / 3600]
    const bsa = Math.sqrt((h * w) / 3600);

    setResult({
      value: bsa,
      unit: "m²",
      explanation: `Height: ${height} ${unit === "metric" ? "cm" : "in"}, Weight: ${weight} ${unit === "metric" ? "kg" : "lbs"}`,
    });
  };

  return (
    <CalculatorCard title="Body Surface Area Calculator" icon={Ruler}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Unit System</label>
          <select
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value as "metric" | "imperial");
              setResult(null);
            }}
            aria-label="Unit System"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          >
            <option value="metric">Metric (cm, kg)</option>
            <option value="imperial">Imperial (inches, lbs)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Height ({unit === "metric" ? "cm" : "inches"})</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            onBlur={calculate}
            placeholder={unit === "metric" ? "170" : "67"}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Weight ({unit === "metric" ? "kg" : "lbs"})</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={calculate}
            placeholder={unit === "metric" ? "70" : "154"}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(3)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Using Mosteller formula: BSA = √[(Height × Weight) / 3600]
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 4. Creatinine Clearance Calculator
function CreatinineClearanceCalculator() {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const a = parseFloat(age);
    const w = parseFloat(weight);
    const cr = parseFloat(creatinine);

    if (isNaN(a) || isNaN(w) || isNaN(cr) || a <= 0 || w <= 0 || cr <= 0) {
      setResult(null);
      return;
    }

    // Cockcroft-Gault formula
    const genderFactor = gender === "male" ? 1 : 0.85;
    const crcl = ((140 - a) * w * genderFactor) / (72 * cr);

    const warnings: string[] = [];
    if (crcl < 30) warnings.push("Severe renal impairment - consider dose reduction");
    else if (crcl < 60) warnings.push("Moderate renal impairment - may need dose adjustment");

    setResult({
      value: crcl,
      unit: "mL/min",
      explanation: `${gender === "male" ? "Male" : "Female"}, Age: ${age} years, Weight: ${weight} kg, Cr: ${creatinine} mg/dL`,
      warnings,
    });
  };

  return (
    <CalculatorCard title="Creatinine Clearance Calculator" icon={Activity}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Age (years)</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            onBlur={calculate}
            placeholder="45"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={calculate}
            placeholder="70"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Serum Creatinine (mg/dL)</label>
          <input
            type="number"
            step="0.1"
            value={creatinine}
            onChange={(e) => setCreatinine(e.target.value)}
            onBlur={calculate}
            placeholder="1.0"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Gender</label>
          <select
            value={gender}
            onChange={(e) => {
              setGender(e.target.value as "male" | "female");
              calculate();
            }}
            aria-label="Gender"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(1)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
            {result.warnings && result.warnings.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <Info className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={16} />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    {result.warnings.map((w, i) => (
                      <div key={i}>• {w}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Using Cockcroft-Gault formula
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 5. Pediatric Dose Calculator
function PediatricDoseCalculator() {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [adultDose, setAdultDose] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const a = parseFloat(age);
    const w = parseFloat(weight);
    const ad = parseFloat(adultDose);

    if (isNaN(a) || isNaN(w) || isNaN(ad) || a <= 0 || w <= 0 || ad <= 0) {
      setResult(null);
      return;
    }

    // Young's rule: Child dose = (Age / (Age + 12)) × Adult dose
    // Clark's rule: Child dose = (Weight / 150) × Adult dose
    const youngDose = (a / (a + 12)) * ad;
    const clarkDose = (w / 150) * ad;

    setResult({
      value: Math.min(youngDose, clarkDose),
      unit: "mg",
      explanation: `Young's rule: ${youngDose.toFixed(2)} mg | Clark's rule: ${clarkDose.toFixed(2)} mg (using lower value)`,
    });
  };

  return (
    <CalculatorCard title="Pediatric Dose Calculator" icon={Baby}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Age (years)</label>
          <input
            type="number"
            step="0.1"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            onBlur={calculate}
            placeholder="5"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={calculate}
            placeholder="20"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Adult Dose (mg)</label>
          <input
            type="number"
            value={adultDose}
            onChange={(e) => setAdultDose(e.target.value)}
            onBlur={calculate}
            placeholder="500"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(2)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Always verify with pediatric dosing references
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 6. Half-Life Calculator
function HalfLifeCalculator() {
  const [halfLife, setHalfLife] = useState("");
  const [time, setTime] = useState("");
  const [initialDose, setInitialDose] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const hl = parseFloat(halfLife);
    const t = parseFloat(time);
    const id = parseFloat(initialDose);

    if (isNaN(hl) || isNaN(t) || isNaN(id) || hl <= 0 || t <= 0 || id <= 0) {
      setResult(null);
      return;
    }

    // Remaining amount = Initial × (1/2)^(time/halfLife)
    const remaining = id * Math.pow(0.5, t / hl);
    const eliminated = id - remaining;

    setResult({
      value: remaining,
      unit: "mg",
      explanation: `After ${time} hours: ${remaining.toFixed(2)} mg remaining, ${eliminated.toFixed(2)} mg eliminated`,
    });
  };

  return (
    <CalculatorCard title="Drug Half-Life Calculator" icon={Clock}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Half-Life (hours)</label>
          <input
            type="number"
            value={halfLife}
            onChange={(e) => setHalfLife(e.target.value)}
            onBlur={calculate}
            placeholder="4"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Time Elapsed (hours)</label>
          <input
            type="number"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            onBlur={calculate}
            placeholder="8"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Initial Dose (mg)</label>
          <input
            type="number"
            value={initialDose}
            onChange={(e) => setInitialDose(e.target.value)}
            onBlur={calculate}
            placeholder="100"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(2)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 7. IV Infusion Rate Calculator
function IVInfusionCalculator() {
  const [dose, setDose] = useState("");
  const [weight, setWeight] = useState("");
  const [concentration, setConcentration] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const d = parseFloat(dose);
    const w = parseFloat(weight);
    const c = parseFloat(concentration);

    if (isNaN(d) || isNaN(w) || isNaN(c) || d <= 0 || w <= 0 || c <= 0) {
      setResult(null);
      return;
    }

    const totalDose = d * w;
    const volumePerHour = totalDose / c;

    setResult({
      value: volumePerHour,
      unit: "mL/hour",
      explanation: `Total dose: ${totalDose.toFixed(2)} mg = ${volumePerHour.toFixed(2)} mL/hour of ${concentration} mg/mL solution`,
    });
  };

  return (
    <CalculatorCard title="IV Infusion Rate Calculator" icon={Syringe}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Dose per kg/hour (mg/kg/hr)</label>
          <input
            type="number"
            step="0.1"
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            onBlur={calculate}
            placeholder="0.5"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Patient Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={calculate}
            placeholder="70"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Concentration (mg/mL)</label>
          <input
            type="number"
            value={concentration}
            onChange={(e) => setConcentration(e.target.value)}
            onBlur={calculate}
            placeholder="1"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(2)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 8. Body Weight Dose Calculator
function BodyWeightDoseCalculator() {
  const [weight, setWeight] = useState("");
  const [dosePerKg, setDosePerKg] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const dpk = parseFloat(dosePerKg);

    if (isNaN(w) || isNaN(dpk) || w <= 0 || dpk <= 0) {
      setResult(null);
      return;
    }

    const totalDose = w * dpk;

    setResult({
      value: totalDose,
      unit: "mg",
      explanation: `${weight} kg × ${dosePerKg} mg/kg = ${totalDose.toFixed(2)} mg`,
    });
  };

  return (
    <CalculatorCard title="Weight-Based Dose Calculator" icon={Activity}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Patient Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={calculate}
            placeholder="70"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Dose per kg (mg/kg)</label>
          <input
            type="number"
            step="0.1"
            value={dosePerKg}
            onChange={(e) => setDosePerKg(e.target.value)}
            onBlur={calculate}
            placeholder="5"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(2)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 9. Alligation Calculator
function AlligationCalculator() {
  const [highConc, setHighConc] = useState("");
  const [lowConc, setLowConc] = useState("");
  const [desiredConc, setDesiredConc] = useState("");
  const [result, setResult] = useState<{ high: number; low: number; total: number } | null>(null);

  const calculate = () => {
    const hc = parseFloat(highConc);
    const lc = parseFloat(lowConc);
    const dc = parseFloat(desiredConc);

    if (isNaN(hc) || isNaN(lc) || isNaN(dc) || hc <= 0 || lc < 0 || dc <= 0) {
      setResult(null);
      return;
    }

    if (dc > hc || (lc > 0 && dc < lc)) {
      setResult(null);
      return;
    }

    const highPart = dc - lc;
    const lowPart = hc - dc;
    const total = highPart + lowPart;

    setResult({ high: highPart, low: lowPart, total });
  };

  return (
    <CalculatorCard title="Alligation Calculator" icon={Beaker}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">High Concentration (%)</label>
          <input
            type="number"
            value={highConc}
            onChange={(e) => setHighConc(e.target.value)}
            onBlur={calculate}
            placeholder="50"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Low Concentration (%)</label>
          <input
            type="number"
            value={lowConc}
            onChange={(e) => setLowConc(e.target.value)}
            onBlur={calculate}
            placeholder="0"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Desired Concentration (%)</label>
          <input
            type="number"
            value={desiredConc}
            onChange={(e) => setDesiredConc(e.target.value)}
            onBlur={calculate}
            placeholder="25"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Mixing Ratio:</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <div>High concentration: {result.high.toFixed(1)} parts</div>
              <div>Low concentration: {result.low.toFixed(1)} parts</div>
              <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                Total: {result.total.toFixed(1)} parts
              </div>
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 10. Cost Calculator
function CostCalculator() {
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [unitsPerDose, setUnitsPerDose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [result, setResult] = useState<{ perDose: number; perDay: number; perMonth: number } | null>(null);

  const calculate = () => {
    const ppu = parseFloat(pricePerUnit);
    const upd = parseFloat(unitsPerDose);
    const freq = parseFloat(frequency);

    if (isNaN(ppu) || isNaN(upd) || isNaN(freq) || ppu <= 0 || upd <= 0 || freq <= 0) {
      setResult(null);
      return;
    }

    const perDose = ppu * upd;
    const perDay = perDose * freq;
    const perMonth = perDay * 30;

    setResult({ perDose, perDay, perMonth });
  };

  return (
    <CalculatorCard title="Medication Cost Calculator" icon={DollarSign}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Price per Unit ($)</label>
          <input
            type="number"
            step="0.01"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)}
            onBlur={calculate}
            placeholder="0.50"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Units per Dose</label>
          <input
            type="number"
            value={unitsPerDose}
            onChange={(e) => setUnitsPerDose(e.target.value)}
            onBlur={calculate}
            placeholder="2"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Frequency (times per day)</label>
          <input
            type="number"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            onBlur={calculate}
            placeholder="2"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Per Dose:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">${result.perDose.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Per Day:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">${result.perDay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-800">
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Per Month (30 days):</span>
                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">${result.perMonth.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 11. Dilution Calculator
function DilutionCalculator() {
  const [initialConc, setInitialConc] = useState("");
  const [desiredConc, setDesiredConc] = useState("");
  const [desiredVolume, setDesiredVolume] = useState("");
  const [result, setResult] = useState<{ volume: number; diluent: number } | null>(null);

  const calculate = () => {
    const ic = parseFloat(initialConc);
    const dc = parseFloat(desiredConc);
    const dv = parseFloat(desiredVolume);

    if (isNaN(ic) || isNaN(dc) || isNaN(dv) || ic <= 0 || dc <= 0 || dv <= 0 || dc > ic) {
      setResult(null);
      return;
    }

    // C1V1 = C2V2
    const volume = (dc * dv) / ic;
    const diluent = dv - volume;

    setResult({ volume, diluent });
  };

  return (
    <CalculatorCard title="Dilution Calculator" icon={Beaker}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Initial Concentration (mg/mL)</label>
          <input
            type="number"
            value={initialConc}
            onChange={(e) => setInitialConc(e.target.value)}
            onBlur={calculate}
            placeholder="100"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Desired Concentration (mg/mL)</label>
          <input
            type="number"
            value={desiredConc}
            onChange={(e) => setDesiredConc(e.target.value)}
            onBlur={calculate}
            placeholder="10"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Desired Volume (mL)</label>
          <input
            type="number"
            value={desiredVolume}
            onChange={(e) => setDesiredVolume(e.target.value)}
            onBlur={calculate}
            placeholder="100"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Dilution Required:</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <div>Initial solution: {result.volume.toFixed(2)} mL</div>
              <div>Diluent: {result.diluent.toFixed(2)} mL</div>
              <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                Total: {desiredVolume} mL
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Using C1V1 = C2V2 formula
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 12. Steady State Calculator
function SteadyStateCalculator() {
  const [halfLife, setHalfLife] = useState("");
  const [result, setResult] = useState<{ timeTo90: number; timeTo95: number; timeTo99: number } | null>(null);

  const calculate = () => {
    const hl = parseFloat(halfLife);

    if (isNaN(hl) || hl <= 0) {
      setResult(null);
      return;
    }

    // Time to steady state = n × half-life
    // 90% steady state ≈ 3.3 half-lives
    // 95% steady state ≈ 4.3 half-lives
    // 99% steady state ≈ 6.6 half-lives
    const timeTo90 = 3.3 * hl;
    const timeTo95 = 4.3 * hl;
    const timeTo99 = 6.6 * hl;

    setResult({ timeTo90, timeTo95, timeTo99 });
  };

  return (
    <CalculatorCard title="Steady State Time Calculator" icon={TrendingUp}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Half-Life (hours)</label>
          <input
            type="number"
            value={halfLife}
            onChange={(e) => setHalfLife(e.target.value)}
            onBlur={calculate}
            placeholder="12"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Time to Steady State:</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <div>90% steady state: {result.timeTo90.toFixed(1)} hours</div>
              <div>95% steady state: {result.timeTo95.toFixed(1)} hours</div>
              <div>99% steady state: {result.timeTo99.toFixed(1)} hours</div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Approximate times based on half-life multiples
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 13. BMI Calculator
function BMICalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    let w = parseFloat(weight);
    let h = parseFloat(height);

    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      setResult(null);
      return;
    }

    if (unit === "imperial") {
      w = w * 0.453592; // lbs to kg
      h = h * 0.0254; // inches to meters
    } else {
      h = h / 100; // cm to meters
    }

    const bmi = w / (h * h);

    let category = "";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal weight";
    else if (bmi < 30) category = "Overweight";
    else if (bmi < 35) category = "Obese Class I";
    else if (bmi < 40) category = "Obese Class II";
    else category = "Obese Class III";

    setResult({
      value: bmi,
      unit: "kg/m²",
      explanation: `Category: ${category}`,
      warnings: bmi >= 30 ? ["Obesity may require adjusted dosing for certain medications"] : undefined,
    });
  };

  return (
    <CalculatorCard title="BMI Calculator" icon={Scale}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Unit System</label>
          <select
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value as "metric" | "imperial");
              setResult(null);
            }}
            aria-label="Unit System"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          >
            <option value="metric">Metric (kg, cm)</option>
            <option value="imperial">Imperial (lbs, inches)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Weight ({unit === "metric" ? "kg" : "lbs"})</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={calculate}
            placeholder={unit === "metric" ? "70" : "154"}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Height ({unit === "metric" ? "cm" : "inches"})</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            onBlur={calculate}
            placeholder={unit === "metric" ? "170" : "67"}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(1)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
            {result.warnings && (
              <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                {result.warnings.map((w, i) => (
                  <div key={i}>⚠ {w}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 14. Ideal Body Weight Calculator
function IdealBodyWeightCalculator() {
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    let h = parseFloat(height);

    if (isNaN(h) || h <= 0) {
      setResult(null);
      return;
    }

    if (unit === "imperial") {
      h = h * 2.54; // inches to cm
    }

    // Devine formula
    let ibw: number;
    if (gender === "male") {
      ibw = 50 + 2.3 * ((h - 152.4) / 2.54); // kg
    } else {
      ibw = 45.5 + 2.3 * ((h - 152.4) / 2.54); // kg
    }

    if (unit === "imperial") {
      ibw = ibw * 2.20462; // kg to lbs
    }

    setResult({
      value: ibw,
      unit: unit === "metric" ? "kg" : "lbs",
      explanation: `${gender === "male" ? "Male" : "Female"}, Height: ${height} ${unit === "metric" ? "cm" : "inches"}`,
    });
  };

  return (
    <CalculatorCard title="Ideal Body Weight Calculator" icon={Scale}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Gender</label>
          <select
            value={gender}
            onChange={(e) => {
              setGender(e.target.value as "male" | "female");
              calculate();
            }}
            aria-label="Gender"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Unit System</label>
          <select
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value as "metric" | "imperial");
              setResult(null);
            }}
            aria-label="Unit System"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          >
            <option value="metric">Metric (cm, kg)</option>
            <option value="imperial">Imperial (inches, lbs)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Height ({unit === "metric" ? "cm" : "inches"})</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            onBlur={calculate}
            placeholder={unit === "metric" ? "170" : "67"}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(1)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">Using Devine formula</div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 15. Adjusted Body Weight Calculator
function AdjustedBodyWeightCalculator() {
  const [actualWeight, setActualWeight] = useState("");
  const [idealWeight, setIdealWeight] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const aw = parseFloat(actualWeight);
    const iw = parseFloat(idealWeight);

    if (isNaN(aw) || isNaN(iw) || aw <= 0 || iw <= 0) {
      setResult(null);
      return;
    }

    // ABW = IBW + 0.4 × (Actual Weight - IBW)
    const abw = iw + 0.4 * (aw - iw);

    setResult({
      value: abw,
      unit: "kg",
      explanation: `Actual: ${actualWeight} kg, IBW: ${idealWeight} kg`,
    });
  };

  return (
    <CalculatorCard title="Adjusted Body Weight Calculator" icon={Scale}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Actual Weight (kg)</label>
          <input
            type="number"
            value={actualWeight}
            onChange={(e) => setActualWeight(e.target.value)}
            onBlur={calculate}
            placeholder="90"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Ideal Body Weight (kg)</label>
          <input
            type="number"
            value={idealWeight}
            onChange={(e) => setIdealWeight(e.target.value)}
            onBlur={calculate}
            placeholder="70"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(1)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Formula: ABW = IBW + 0.4 × (Actual Weight - IBW)
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 16. eGFR Calculator
function EGFRCalculator() {
  const [age, setAge] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [race, setRace] = useState<"black" | "other">("other");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const a = parseFloat(age);
    const cr = parseFloat(creatinine);

    if (isNaN(a) || isNaN(cr) || a <= 0 || cr <= 0) {
      setResult(null);
      return;
    }

    // CKD-EPI formula (simplified)
    const genderFactor = gender === "female" ? 0.993 : 1;
    const raceFactor = race === "black" ? 1.159 : 1;
    let egfr = 175 * Math.pow(cr, -1.154) * Math.pow(a, -0.203) * genderFactor * raceFactor;

    const warnings: string[] = [];
    if (egfr < 15) warnings.push("Stage 5 CKD - Consider dialysis");
    else if (egfr < 30) warnings.push("Stage 4 CKD - Severe impairment");
    else if (egfr < 60) warnings.push("Stage 3 CKD - Moderate impairment");
    else if (egfr < 90) warnings.push("Stage 2 CKD - Mild impairment");

    setResult({
      value: egfr,
      unit: "mL/min/1.73m²",
      explanation: `${gender === "male" ? "Male" : "Female"}, Age: ${age} years, Cr: ${creatinine} mg/dL, ${race === "black" ? "Black" : "Non-Black"}`,
      warnings,
    });
  };

  return (
    <CalculatorCard title="eGFR Calculator" icon={Activity}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Age (years)</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            onBlur={calculate}
            placeholder="45"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Serum Creatinine (mg/dL)</label>
          <input
            type="number"
            step="0.1"
            value={creatinine}
            onChange={(e) => setCreatinine(e.target.value)}
            onBlur={calculate}
            placeholder="1.0"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Gender</label>
          <select
            value={gender}
            onChange={(e) => {
              setGender(e.target.value as "male" | "female");
              calculate();
            }}
            aria-label="Gender"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Race</label>
          <select
            value={race}
            onChange={(e) => {
              setRace(e.target.value as "black" | "other");
              calculate();
            }}
            aria-label="Race"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          >
            <option value="other">Non-Black</option>
            <option value="black">Black</option>
          </select>
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(1)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
            {result.warnings && result.warnings.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <Info className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={16} />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    {result.warnings.map((w, i) => (
                      <div key={i}>• {w}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Using CKD-EPI formula (simplified)
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 17. Anion Gap Calculator
function AnionGapCalculator() {
  const [sodium, setSodium] = useState("");
  const [chloride, setChloride] = useState("");
  const [bicarbonate, setBicarbonate] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const na = parseFloat(sodium);
    const cl = parseFloat(chloride);
    const hco3 = parseFloat(bicarbonate);

    if (isNaN(na) || isNaN(cl) || isNaN(hco3) || na <= 0 || cl <= 0 || hco3 <= 0) {
      setResult(null);
      return;
    }

    const anionGap = na - (cl + hco3);

    const warnings: string[] = [];
    if (anionGap > 16) warnings.push("High anion gap - Consider metabolic acidosis causes");
    else if (anionGap < 8) warnings.push("Low anion gap - Consider measurement error or hypoalbuminemia");

    setResult({
      value: anionGap,
      unit: "mEq/L",
      explanation: `Na: ${sodium}, Cl: ${chloride}, HCO₃: ${bicarbonate} mEq/L`,
      warnings,
    });
  };

  return (
    <CalculatorCard title="Anion Gap Calculator" icon={Activity}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Sodium (Na, mEq/L)</label>
          <input
            type="number"
            value={sodium}
            onChange={(e) => setSodium(e.target.value)}
            onBlur={calculate}
            placeholder="140"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Chloride (Cl, mEq/L)</label>
          <input
            type="number"
            value={chloride}
            onChange={(e) => setChloride(e.target.value)}
            onBlur={calculate}
            placeholder="105"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Bicarbonate (HCO₃, mEq/L)</label>
          <input
            type="number"
            value={bicarbonate}
            onChange={(e) => setBicarbonate(e.target.value)}
            onBlur={calculate}
            placeholder="24"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(1)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
            {result.warnings && result.warnings.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <Info className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={16} />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    {result.warnings.map((w, i) => (
                      <div key={i}>• {w}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Normal range: 8-12 mEq/L
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 18. QTc Calculator
function QTcCalculator() {
  const [qt, setQt] = useState("");
  const [rr, setRr] = useState("");
  const [formula, setFormula] = useState<"bazett" | "fridericia">("bazett");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const qtMs = parseFloat(qt);
    const rrSec = parseFloat(rr);

    if (isNaN(qtMs) || isNaN(rrSec) || qtMs <= 0 || rrSec <= 0) {
      setResult(null);
      return;
    }

    let qtc: number;
    if (formula === "bazett") {
      qtc = qtMs / Math.sqrt(rrSec);
    } else {
      qtc = qtMs / Math.cbrt(rrSec);
    }

    const warnings: string[] = [];
    if (qtc > 500) warnings.push("Critical: QTc > 500ms - High risk of torsades de pointes");
    else if (qtc > 470) warnings.push("Prolonged: QTc > 470ms (men) or > 480ms (women)");
    else if (qtc < 350) warnings.push("Short QTc - May indicate hypercalcemia or other conditions");

    setResult({
      value: qtc,
      unit: "ms",
      explanation: `QT: ${qt} ms, RR: ${rr} sec, Formula: ${formula === "bazett" ? "Bazett" : "Fridericia"}`,
      warnings,
    });
  };

  return (
    <CalculatorCard title="QTc Calculator" icon={Heart}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">QT Interval (ms)</label>
          <input
            type="number"
            value={qt}
            onChange={(e) => setQt(e.target.value)}
            onBlur={calculate}
            placeholder="400"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">RR Interval (seconds)</label>
          <input
            type="number"
            step="0.01"
            value={rr}
            onChange={(e) => setRr(e.target.value)}
            onBlur={calculate}
            placeholder="0.8"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Formula</label>
          <select
            value={formula}
            onChange={(e) => {
              setFormula(e.target.value as "bazett" | "fridericia");
              calculate();
            }}
            aria-label="Formula"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          >
            <option value="bazett">Bazett (most common)</option>
            <option value="fridericia">Fridericia (more accurate at high HR)</option>
          </select>
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(0)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
            {result.warnings && result.warnings.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5" size={16} />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    {result.warnings.map((w, i) => (
                      <div key={i}>• {w}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Normal: Men &lt; 470ms, Women &lt; 480ms
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 19. Mean Arterial Pressure Calculator
function MAPCalculator() {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const sys = parseFloat(systolic);
    const dia = parseFloat(diastolic);

    if (isNaN(sys) || isNaN(dia) || sys <= 0 || dia <= 0 || sys < dia) {
      setResult(null);
      return;
    }

    // MAP = (2 × Diastolic + Systolic) / 3
    const map = (2 * dia + sys) / 3;

    const warnings: string[] = [];
    if (map < 60) warnings.push("Low MAP - May indicate shock or hypotension");
    else if (map > 100) warnings.push("High MAP - May indicate hypertension");

    setResult({
      value: map,
      unit: "mmHg",
      explanation: `SBP: ${systolic}, DBP: ${diastolic} mmHg`,
      warnings,
    });
  };

  return (
    <CalculatorCard title="Mean Arterial Pressure Calculator" icon={Heart}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Systolic BP (mmHg)</label>
          <input
            type="number"
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
            onBlur={calculate}
            placeholder="120"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Diastolic BP (mmHg)</label>
          <input
            type="number"
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
            onBlur={calculate}
            placeholder="80"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(1)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
            {result.warnings && result.warnings.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <Info className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={16} />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    {result.warnings.map((w, i) => (
                      <div key={i}>• {w}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Normal range: 70-100 mmHg
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 20. Parkland Formula Calculator
function ParklandCalculator() {
  const [weight, setWeight] = useState("");
  const [tbsa, setTbsa] = useState("");
  const [result, setResult] = useState<{ total: number; first8h: number; next16h: number } | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const t = parseFloat(tbsa);

    if (isNaN(w) || isNaN(t) || w <= 0 || t <= 0 || t > 100) {
      setResult(null);
      return;
    }

    // Parkland: 4 mL × kg × %TBSA
    const total = 4 * w * t;
    const first8h = total / 2;
    const next16h = total / 2;

    setResult({ total, first8h, next16h });
  };

  return (
    <CalculatorCard title="Parkland Formula Calculator" icon={Thermometer}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={calculate}
            placeholder="70"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Total Body Surface Area Burned (%)</label>
          <input
            type="number"
            step="0.1"
            value={tbsa}
            onChange={(e) => setTbsa(e.target.value)}
            onBlur={calculate}
            placeholder="20"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Fluid Requirements:</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <div>Total: {result.total.toFixed(0)} mL</div>
              <div>First 8 hours: {result.first8h.toFixed(0)} mL ({result.first8h.toFixed(0)} mL/hour)</div>
              <div>Next 16 hours: {result.next16h.toFixed(0)} mL ({(result.next16h / 16).toFixed(0)} mL/hour)</div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Formula: 4 mL × kg × %TBSA (use Lactated Ringer's)
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 21. Rule of Nines Calculator
function RuleOfNinesCalculator() {
  const [head, setHead] = useState("");
  const [chest, setChest] = useState("");
  const [abdomen, setAbdomen] = useState("");
  const [back, setBack] = useState("");
  const [leftArm, setLeftArm] = useState("");
  const [rightArm, setRightArm] = useState("");
  const [leftLeg, setLeftLeg] = useState("");
  const [rightLeg, setRightLeg] = useState("");
  const [genitalia, setGenitalia] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const values = {
      head: parseFloat(head) || 0,
      chest: parseFloat(chest) || 0,
      abdomen: parseFloat(abdomen) || 0,
      back: parseFloat(back) || 0,
      leftArm: parseFloat(leftArm) || 0,
      rightArm: parseFloat(rightArm) || 0,
      leftLeg: parseFloat(leftLeg) || 0,
      rightLeg: parseFloat(rightLeg) || 0,
      genitalia: parseFloat(genitalia) || 0,
    };

    const total = Object.values(values).reduce((sum, val) => sum + val, 0);

    if (total > 100) {
      setResult(null);
      return;
    }

    setResult({
      value: total,
      unit: "%",
      explanation: `Total body surface area burned`,
    });
  };

  return (
    <CalculatorCard title="Rule of Nines Calculator" icon={Thermometer}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-2">Head (%)</label>
            <input
              type="number"
              value={head}
              onChange={(e) => setHead(e.target.value)}
              onBlur={calculate}
              placeholder="9"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Chest (%)</label>
            <input
              type="number"
              value={chest}
              onChange={(e) => setChest(e.target.value)}
              onBlur={calculate}
              placeholder="9"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Abdomen (%)</label>
            <input
              type="number"
              value={abdomen}
              onChange={(e) => setAbdomen(e.target.value)}
              onBlur={calculate}
              placeholder="9"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Back (%)</label>
            <input
              type="number"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              onBlur={calculate}
              placeholder="9"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Left Arm (%)</label>
            <input
              type="number"
              value={leftArm}
              onChange={(e) => setLeftArm(e.target.value)}
              onBlur={calculate}
              placeholder="9"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Right Arm (%)</label>
            <input
              type="number"
              value={rightArm}
              onChange={(e) => setRightArm(e.target.value)}
              onBlur={calculate}
              placeholder="9"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Left Leg (%)</label>
            <input
              type="number"
              value={leftLeg}
              onChange={(e) => setLeftLeg(e.target.value)}
              onBlur={calculate}
              placeholder="18"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Right Leg (%)</label>
            <input
              type="number"
              value={rightLeg}
              onChange={(e) => setRightLeg(e.target.value)}
              onBlur={calculate}
              placeholder="18"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">Genitalia (%)</label>
            <input
              type="number"
              value={genitalia}
              onChange={(e) => setGenitalia(e.target.value)}
              onBlur={calculate}
              placeholder="1"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
            />
          </div>
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(1)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 22. Free Water Deficit Calculator
function FreeWaterDeficitCalculator() {
  const [sodium, setSodium] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const na = parseFloat(sodium);
    const w = parseFloat(weight);

    if (isNaN(na) || isNaN(w) || na <= 0 || w <= 0 || na < 135 || na > 160) {
      setResult(null);
      return;
    }

    // FWD = Weight (kg) × 0.6 × [(Current Na - 140) / 140]
    const fwd = w * 0.6 * ((na - 140) / 140);

    setResult({
      value: fwd,
      unit: "L",
      explanation: `Na: ${sodium} mEq/L, Weight: ${weight} kg`,
    });
  };

  return (
    <CalculatorCard title="Free Water Deficit Calculator" icon={Droplet}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Current Sodium (mEq/L)</label>
          <input
            type="number"
            value={sodium}
            onChange={(e) => setSodium(e.target.value)}
            onBlur={calculate}
            placeholder="150"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={calculate}
            placeholder="70"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(2)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Formula: FWD = Weight × 0.6 × [(Current Na - 140) / 140]
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 23. Fluid Maintenance Calculator
function FluidMaintenanceCalculator() {
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<{ hourly: number; daily: number } | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);

    if (isNaN(w) || w <= 0) {
      setResult(null);
      return;
    }

    // Holliday-Segar method
    let hourly: number;
    let daily: number;

    if (w <= 10) {
      daily = w * 100;
    } else if (w <= 20) {
      daily = 1000 + (w - 10) * 50;
    } else {
      daily = 1500 + (w - 20) * 20;
    }

    hourly = daily / 24;

    setResult({ hourly, daily });
  };

  return (
    <CalculatorCard title="Fluid Maintenance Calculator" icon={Droplet}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={calculate}
            placeholder="70"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Maintenance Fluids:</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <div>Hourly: {result.hourly.toFixed(0)} mL/hour</div>
              <div>Daily: {result.daily.toFixed(0)} mL/day</div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Using Holliday-Segar method
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 24. Antipsychotic Equivalent Calculator
function AntipsychoticEquivalentCalculator() {
  const [fromMed, setFromMed] = useState("");
  const [fromDose, setFromDose] = useState("");
  const [toMed, setToMed] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  // Common antipsychotic equivalencies (in chlorpromazine equivalents)
  const equivalents: Record<string, number> = {
    "Chlorpromazine": 100,
    "Haloperidol": 2,
    "Risperidone": 2,
    "Olanzapine": 5,
    "Quetiapine": 75,
    "Aripiprazole": 7.5,
    "Ziprasidone": 40,
    "Clozapine": 50,
    "Fluphenazine": 2,
    "Perphenazine": 10,
  };

  const calculate = () => {
    const from = fromMed.trim();
    const to = toMed.trim();
    const dose = parseFloat(fromDose);

    if (!from || !to || isNaN(dose) || dose <= 0 || !equivalents[from] || !equivalents[to]) {
      setResult(null);
      return;
    }

    // Convert to chlorpromazine equivalent, then to target medication
    const chlorpromazineEquivalent = (dose / equivalents[from]) * 100;
    const targetDose = (chlorpromazineEquivalent / 100) * equivalents[to];

    setResult({
      value: targetDose,
      unit: "mg",
      explanation: `${fromDose} mg ${from} ≈ ${targetDose.toFixed(1)} mg ${to}`,
    });
  };

  return (
    <CalculatorCard title="Antipsychotic Equivalent Calculator" icon={Brain}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">From Medication</label>
          <select
            value={fromMed}
            onChange={(e) => {
              setFromMed(e.target.value);
              calculate();
            }}
            aria-label="From Medication"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          >
            <option value="">Select medication...</option>
            {Object.keys(equivalents).map((med) => (
              <option key={med} value={med}>
                {med}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Current Dose (mg)</label>
          <input
            type="number"
            value={fromDose}
            onChange={(e) => setFromDose(e.target.value)}
            onBlur={calculate}
            placeholder="10"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">To Medication</label>
          <select
            value={toMed}
            onChange={(e) => {
              setToMed(e.target.value);
              calculate();
            }}
            aria-label="To Medication"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          >
            <option value="">Select medication...</option>
            {Object.keys(equivalents).map((med) => (
              <option key={med} value={med}>
                {med}
              </option>
            ))}
          </select>
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(1)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Based on chlorpromazine equivalent dosing
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 25. Lithium Dose Calculator
function LithiumDoseCalculator() {
  const [currentLevel, setCurrentLevel] = useState("");
  const [targetLevel, setTargetLevel] = useState("");
  const [currentDose, setCurrentDose] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const current = parseFloat(currentLevel);
    const target = parseFloat(targetLevel);
    const dose = parseFloat(currentDose);

    if (isNaN(current) || isNaN(target) || isNaN(dose) || current <= 0 || target <= 0 || dose <= 0) {
      setResult(null);
      return;
    }

    // Linear approximation: New dose = (Target level / Current level) × Current dose
    const newDose = (target / current) * dose;

    const warnings: string[] = [];
    if (target > 1.2) warnings.push("Target level > 1.2 mEq/L - Monitor for toxicity");
    if (target < 0.6) warnings.push("Target level < 0.6 mEq/L - May be subtherapeutic");

    setResult({
      value: newDose,
      unit: "mg/day",
      explanation: `Current: ${currentLevel} mEq/L at ${currentDose} mg/day → Target: ${targetLevel} mEq/L`,
      warnings,
    });
  };

  return (
    <CalculatorCard title="Lithium Dose Calculator" icon={Brain}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Current Lithium Level (mEq/L)</label>
          <input
            type="number"
            step="0.1"
            value={currentLevel}
            onChange={(e) => setCurrentLevel(e.target.value)}
            onBlur={calculate}
            placeholder="0.8"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Target Lithium Level (mEq/L)</label>
          <input
            type="number"
            step="0.1"
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value)}
            onBlur={calculate}
            placeholder="1.0"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Current Daily Dose (mg)</label>
          <input
            type="number"
            value={currentDose}
            onChange={(e) => setCurrentDose(e.target.value)}
            onBlur={calculate}
            placeholder="900"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(0)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
            {result.warnings && result.warnings.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <Info className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={16} />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    {result.warnings.map((w, i) => (
                      <div key={i}>• {w}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Therapeutic range: 0.6-1.2 mEq/L. Always monitor levels.
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 26. Blood Loss Estimation Calculator
function BloodLossCalculator() {
  const [preopHct, setPreopHct] = useState("");
  const [postopHct, setPostopHct] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculate = () => {
    const preHct = parseFloat(preopHct);
    const postHct = parseFloat(postopHct);
    const w = parseFloat(weight);

    if (isNaN(preHct) || isNaN(postHct) || isNaN(w) || preHct <= 0 || postHct <= 0 || w <= 0 || postHct > preHct) {
      setResult(null);
      return;
    }

    // Estimated blood loss = EBV × (Preop Hct - Postop Hct) / Average Hct
    // EBV ≈ 70 mL/kg
    const ebv = w * 70;
    const avgHct = (preHct + postHct) / 2;
    const bloodLoss = ebv * ((preHct - postHct) / avgHct);

    setResult({
      value: bloodLoss,
      unit: "mL",
      explanation: `Pre-op Hct: ${preopHct}%, Post-op Hct: ${postopHct}%, Weight: ${weight} kg`,
    });
  };

  return (
    <CalculatorCard title="Blood Loss Estimation Calculator" icon={Activity}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Pre-operative Hematocrit (%)</label>
          <input
            type="number"
            value={preopHct}
            onChange={(e) => setPreopHct(e.target.value)}
            onBlur={calculate}
            placeholder="40"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Post-operative Hematocrit (%)</label>
          <input
            type="number"
            value={postopHct}
            onChange={(e) => setPostopHct(e.target.value)}
            onBlur={calculate}
            placeholder="35"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={calculate}
            placeholder="70"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.value.toFixed(0)} {result.unit}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{result.explanation}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Estimated based on hematocrit change
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// 27. Post-operative Fluids Calculator
function PostOpFluidsCalculator() {
  const [weight, setWeight] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [thirdSpace, setThirdSpace] = useState("");
  const [result, setResult] = useState<{ total: number; hourly: number } | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const maint = parseFloat(maintenance) || 0;
    const third = parseFloat(thirdSpace) || 0;

    if (isNaN(w) || w <= 0) {
      setResult(null);
      return;
    }

    // Maintenance: Holliday-Segar
    let dailyMaint: number;
    if (w <= 10) {
      dailyMaint = w * 100;
    } else if (w <= 20) {
      dailyMaint = 1000 + (w - 10) * 50;
    } else {
      dailyMaint = 1500 + (w - 20) * 20;
    }

    const totalDaily = dailyMaint + maint + third;
    const hourly = totalDaily / 24;

    setResult({ total: totalDaily, hourly });
  };

  return (
    <CalculatorCard title="Post-operative Fluids Calculator" icon={Droplet}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={calculate}
            placeholder="70"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Additional Maintenance (mL/day, optional)</label>
          <input
            type="number"
            value={maintenance}
            onChange={(e) => setMaintenance(e.target.value)}
            onBlur={calculate}
            placeholder="0"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Third Space Losses (mL/day, optional)</label>
          <input
            type="number"
            value={thirdSpace}
            onChange={(e) => setThirdSpace(e.target.value)}
            onBlur={calculate}
            placeholder="0"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        {result && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Fluid Requirements:</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <div>Total Daily: {result.total.toFixed(0)} mL/day</div>
              <div>Hourly Rate: {result.hourly.toFixed(0)} mL/hour</div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Includes maintenance + additional requirements
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}

// Reusable Calculator Card Component
function CalculatorCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Calculator;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="text-blue-600 dark:text-blue-400" size={24} />
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

