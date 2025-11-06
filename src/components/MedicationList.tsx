import { useState, memo, useEffect, useRef } from "react";
import { Plus, Pill, AlertTriangle, Clock, Calendar, X, Edit2, Archive, Search, CheckCircle, Info, Printer } from "lucide-react";
import { Patient, Medication } from "../types";
import { getActiveMedications } from "../utils/patientUtils";
import UserAssignment from "./UserAssignment";
import { getOrganizationHeader, getOrganizationFooter } from "../utils/organization";
import { openPrintWindow } from "../utils/popupHandler";
import PrintPreview from "./PrintPreview";
import {
  searchMedications,
  checkDrugInteractions,
  getSuggestedDose,
  getSuggestedFrequency,
  getMedicationWarnings,
  type DrugInfo,
} from "../utils/medicationDatabase";

interface MedicationListProps {
  patient: Patient;
  onMedicationUpdated?: (medications: Medication[]) => void;
}


function MedicationList({ patient, onMedicationUpdated }: MedicationListProps) {
  const [open, setOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState<string | null>(null);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [printPreview, setPrintPreview] = useState<{ content: string; title: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    dose: "",
    frequency: "",
    startDate: "",
    instructions: "",
    assignedTo: null as string | null,
    prescriptionType: "acute" as "repeat" | "acute",
    refillsAuthorized: 0,
    durationDays: 30,
  });
  const [adjustData, setAdjustData] = useState({
    newDose: "",
    newFrequency: "",
    reason: "",
    effectiveDate: "",
  });

  // Autocomplete states
  const [drugSuggestions, setDrugSuggestions] = useState<DrugInfo[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<DrugInfo | null>(null);
  const [doseSuggestions, setDoseSuggestions] = useState<string[]>([]);
  const [frequencySuggestions, setFrequencySuggestions] = useState<string[]>([]);
  const [formInteractions, setFormInteractions] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle drug name input with autocomplete
  useEffect(() => {
    if (formData.name.length >= 2) {
      const suggestions = searchMedications(formData.name);
      setDrugSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setDrugSuggestions([]);
      setShowSuggestions(false);
      setSelectedDrug(null);
    }
  }, [formData.name]);

  // Update suggestions when drug is selected
  useEffect(() => {
    if (selectedDrug) {
      const doses = getSuggestedDose(selectedDrug.name);
      const frequencies = getSuggestedFrequency(selectedDrug.name);
      const medWarnings = getMedicationWarnings(selectedDrug.name);
      
      setDoseSuggestions(doses);
      setFrequencySuggestions(frequencies);
      setWarnings(medWarnings);
      
      // Auto-fill dose and frequency if only one suggestion (only on initial selection)
      setFormData(prev => {
        const updates: any = {};
        if (doses.length === 1 && !prev.dose) {
          updates.dose = doses[0];
        }
        if (frequencies.length === 1 && !prev.frequency) {
          updates.frequency = frequencies[0];
        }
        return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
      });
      
      // Check interactions
      const currentMedNames = getActiveMedications(patient).map(m => m.name);
      const drugInteractions = checkDrugInteractions(currentMedNames, selectedDrug.name);
      setFormInteractions(drugInteractions);
    } else {
      setDoseSuggestions([]);
      setFrequencySuggestions([]);
      setWarnings([]);
      setFormInteractions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDrug, patient]);

  // Handle clicking outside autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDrugSelect = (drug: DrugInfo) => {
    setFormData(prev => ({ ...prev, name: drug.name }));
    setSelectedDrug(drug);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate expiry date for repeat prescriptions
    let expiryDate: string | undefined;
    if (formData.prescriptionType === "repeat" && formData.durationDays) {
      const startDate = new Date(formData.startDate);
      const expiry = new Date(startDate);
      expiry.setDate(expiry.getDate() + (formData.durationDays * (formData.refillsAuthorized + 1)));
      expiryDate = expiry.toISOString().split("T")[0];
    }

    const medicationName = `${formData.name} ${formData.dose} ${formData.frequency}`;
    const instructions = formData.instructions || undefined;

    // Create local medication for immediate UI update
    const newMed: Medication = {
      name: medicationName,
      status: "Active",
      started: formData.startDate,
      instructions: instructions,
      prescriptionType: formData.prescriptionType,
      refillsRemaining: formData.prescriptionType === "repeat" ? formData.refillsAuthorized : undefined,
      refillsAuthorized: formData.prescriptionType === "repeat" ? formData.refillsAuthorized : undefined,
      durationDays: formData.durationDays,
      expiryDate: expiryDate,
    };

    // Update local state immediately
    const updated = [...patient.medications, newMed];
    if (onMedicationUpdated) {
      onMedicationUpdated(updated);
    }

    // Try to save to API if authenticated
    try {
      const { medicationService } = await import("../services/medications");
      await medicationService.createMedication(patient.id, {
        name: medicationName,
        status: "Active",
        startedDate: formData.startDate,
        instructions: instructions,
      });
    } catch (apiError) {
      // API save failed, but continue with local update
      if (import.meta.env.DEV) {
        console.warn('Failed to save medication to API, using local update only:', apiError);
      }
    }

    setFormData({ 
      name: "", 
      dose: "", 
      frequency: "", 
      startDate: "", 
      instructions: "", 
      assignedTo: null,
      prescriptionType: "acute",
      refillsAuthorized: 0,
      durationDays: 30,
    });
    setSelectedDrug(null);
    setDoseSuggestions([]);
    setFrequencySuggestions([]);
    setWarnings([]);
    setFormInteractions([]);
    setOpen(false);
  };

  const handleAdjust = (med: Medication) => {
    setSelectedMed(med);
    const parts = med.name.split(" ");
    setAdjustData({
      newDose: parts.length > 1 ? parts[1] : "",
      newFrequency: parts.length > 2 ? parts.slice(2).join(" ") : "",
      reason: "",
      effectiveDate: new Date().toISOString().split("T")[0],
    });
    setAdjustOpen(med.name);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) return;

    const updated = patient.medications.map((med) =>
      med.name === selectedMed.name
        ? {
            ...med,
            name: `${formData.name || selectedMed.name.split(" ")[0]} ${adjustData.newDose} ${adjustData.newFrequency}`,
          }
        : med
    );

    if (onMedicationUpdated) {
      onMedicationUpdated(updated);
    }

    setAdjustOpen(null);
    setSelectedMed(null);
  };

  const handleDiscontinue = (medName: string) => {
    if (window.confirm(`Are you sure you want to discontinue ${medName}?`)) {
      const updated: Medication[] = patient.medications.map((med) =>
        med.name === medName ? { ...med, status: "Discontinued" as const } : med
      );
      if (onMedicationUpdated) {
        onMedicationUpdated(updated);
      }
    }
  };

  const handleArchive = (medName: string) => {
    if (window.confirm(`Are you sure you want to archive ${medName}?`)) {
      const updated: Medication[] = patient.medications.map((med) =>
        med.name === medName ? { ...med, status: "Historical" as const } : med
      );
      if (onMedicationUpdated) {
        onMedicationUpdated(updated);
      }
    }
  };

  const activeMeds = getActiveMedications(patient);
  const repeatPrescriptions = activeMeds.filter((m) => m.prescriptionType === "repeat");
  const acutePrescriptions = activeMeds.filter((m) => m.prescriptionType === "acute" || !m.prescriptionType);
  const discontinuedMeds = patient.medications.filter((m) => m.status === "Discontinued");
  const archivedMeds = patient.medications.filter((m) => m.status === "Archived" || m.status === "Historical");

  const handleRefill = (med: Medication) => {
    if (med.refillsRemaining === undefined || med.refillsRemaining <= 0) {
      alert("No refills remaining for this prescription.");
      return;
    }

    if (window.confirm(`Issue refill for ${med.name}? (${med.refillsRemaining} refills remaining)`)) {
      const updated = patient.medications.map((m) =>
        m === med
          ? {
              ...m,
              refillsRemaining: (m.refillsRemaining || 0) - 1,
              started: new Date().toISOString().split("T")[0], // Update start date for new refill
            }
          : m
      );
      if (onMedicationUpdated) {
        onMedicationUpdated(updated);
      }
    }
  };

  const handlePrintFromPreview = () => {
    if (!printPreview) return;
    openPrintWindow(printPreview.content, printPreview.title);
  };

  const handlePrintPrescription = () => {
    try {
      console.log('Print prescription clicked');
      
      const orgHeader = getOrganizationHeader();
      const orgFooter = getOrganizationFooter();
      const orgHeaderLines = orgHeader.split('\n');
      const orgName = orgHeaderLines[0] || '';
      const orgType = orgHeaderLines[1] || '';
      const orgDetails = orgHeaderLines.slice(2).join('<br>');

      // Build medications HTML
      let medicationsHtml = '';
      if (activeMeds.length > 0) {
        medicationsHtml = activeMeds.map((med) => {
          try {
            const startDate = med.started ? new Date(med.started).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
            const duration = med.started ? Math.floor((Date.now() - new Date(med.started).getTime()) / (1000 * 60 * 60 * 24)) : 0;
            const instructions = med.instructions || '';
            
            const prescriptionType = med.prescriptionType === "repeat" ? "Repeat Prescription" : "Acute Prescription";
            const refillInfo = med.prescriptionType === "repeat" && med.refillsRemaining !== undefined
              ? `<div><strong>Refills:</strong> ${med.refillsRemaining} of ${med.refillsAuthorized || 0} remaining</div>`
              : "";
            const expiryInfo = med.expiryDate
              ? `<div><strong>Expires:</strong> ${new Date(med.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>`
              : "";
            
            let medHtml = `
              <div class="medication-item">
                <div class="medication-name">
                  <span class="rx-symbol">℞</span>${med.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                  <span style="margin-left: 10px; font-size: 12px; padding: 2px 8px; background: ${med.prescriptionType === "repeat" ? "#dcfce7" : "#fed7aa"}; color: ${med.prescriptionType === "repeat" ? "#166534" : "#9a3412"}; border-radius: 12px;">${prescriptionType}</span>
                </div>
                <div class="medication-details">`;
            
            if (startDate) {
              medHtml += `<div><strong>Started:</strong> ${startDate}</div>`;
            }
            
            if (duration > 0) {
              medHtml += `<div><strong>Duration:</strong> ${duration} days</div>`;
            }
            
            if (refillInfo) {
              medHtml += refillInfo;
            }
            
            if (expiryInfo) {
              medHtml += expiryInfo;
            }
            
            if (instructions) {
              medHtml += `
                <div class="instructions-box">
                  <strong>Instructions:</strong><br>
                  ${instructions.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}
                </div>`;
            }
            
            medHtml += `
                </div>
              </div>`;
            
            return medHtml;
          } catch (error) {
            console.error('Error processing medication:', med, error);
            return `<div class="medication-item"><div class="medication-name">℞ ${med.name || 'Unknown Medication'}</div></div>`;
          }
        }).join('');
      } else {
        medicationsHtml = '<p style="text-align: center; color: #6b7280; padding: 20px;">No active medications</p>';
      }

      const patientName = (patient.name || 'Unknown Patient').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const patientDob = patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A';
      const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const allergies = patient.allergies && patient.allergies.length > 0 
        ? patient.allergies.join(', ').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        : 'None known';
      const generatedDate = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

    const printContent = `<!DOCTYPE html>
<html>
<head>
  <title>Prescription - ${patientName}</title>
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
      gap: 12px;
      margin: 25px 0;
    }
    .info-item {
      padding: 10px;
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
    .medications-section {
      margin: 30px 0;
    }
    .medication-item {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-left: 4px solid #2563eb;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 15px;
    }
    .medication-name {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
    }
    .medication-details {
      font-size: 13px;
      color: #4b5563;
      line-height: 1.8;
    }
    .medication-details strong {
      color: #111827;
    }
    .instructions-box {
      background: #eff6ff;
      border-left: 3px solid #2563eb;
      padding: 12px;
      margin-top: 10px;
      border-radius: 4px;
    }
    .instructions-box strong {
      color: #1e40af;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 10px;
      color: #6b7280;
      text-align: center;
    }
    .signature-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .signature-line {
      margin-top: 50px;
      border-top: 1px solid #333;
      width: 300px;
    }
    .signature-label {
      font-size: 11px;
      color: #6b7280;
      margin-top: 5px;
    }
    .rx-symbol {
      font-size: 24px;
      color: #2563eb;
      margin-right: 10px;
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
    <div class="org-name">${orgName}</div>
    <div class="org-type">${orgType}</div>
    <div class="org-details">${orgDetails}</div>
  </div>

  <div class="document-header">
    <h1>PRESCRIPTION</h1>
    <h2>Medication List</h2>
  </div>

  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">Patient Name</div>
      <div class="info-value">${patientName}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Date of Birth</div>
      <div class="info-value">${patientDob}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Date</div>
      <div class="info-value">${currentDate}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Allergies</div>
      <div class="info-value">${allergies}</div>
    </div>
  </div>

  <div class="medications-section">
    <h3 style="font-size: 16px; font-weight: 600; color: #1e40af; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">
      Active Medications (${activeMeds.length})
    </h3>
    ${medicationsHtml}
  </div>

  <div class="signature-section">
    <div class="signature-line"></div>
    <div class="signature-label">Prescribing Physician Signature</div>
  </div>

  <div class="footer">
    <div>Generated: ${generatedDate}</div>
    <div style="margin-top: 5px;">${orgFooter}</div>
    <div style="margin-top: 5px; font-size: 9px;">This is a prescription document. Please present this to your pharmacist.</div>
    <div style="margin-top: 5px; font-size: 9px;">Confidential Medical Document - For Authorized Personnel Only</div>
  </div>
</body>
</html>`;

      // Show print preview instead of printing directly
      setPrintPreview({
        content: printContent,
        title: `Prescription - ${patientName}`
      });
    } catch (error) {
      console.error('Error generating prescription print:', error);
      alert('An error occurred while generating the prescription. Please check the browser console for details.');
    }
  };

  // Check interactions using the medication database
  const checkInteractions = (medications: Medication[]) => {
    const interactions: string[] = [];
    const medNames = medications.map((m) => {
      // Extract drug name from medication string (e.g., "Metformin 1000mg BID" -> "Metformin")
      const parts = m.name.split(" ");
      return parts[0];
    });

    // Check all pairs of medications
    for (let i = 0; i < medNames.length; i++) {
      for (let j = i + 1; j < medNames.length; j++) {
        const interactions1 = checkDrugInteractions([medNames[i]], medNames[j]);
        const interactions2 = checkDrugInteractions([medNames[j]], medNames[i]);
        interactions.push(...interactions1, ...interactions2);
      }
    }

    return [...new Set(interactions)]; // Remove duplicates
  };

  const interactions = checkInteractions(activeMeds);

  return (
    <div className="section-spacing">
      {/* Interactions Alert */}
      {interactions.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                Potential Drug Interactions
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {interactions.map((interaction) => (
                  <li key={interaction}>• {interaction}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="card-compact">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Current Medications</h3>
          <div className="flex gap-2">
            {activeMeds.length > 0 && (
              <button
                onClick={handlePrintPrescription}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                title="Print prescription list"
              >
                <Printer size={16} /> Print Prescription
              </button>
            )}
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium"
            >
              <Plus size={16} /> Add Medication
            </button>
          </div>
        </div>

        {activeMeds.length > 0 ? (
          <div className="space-y-6">
            {/* Repeat Prescriptions Section */}
            {repeatPrescriptions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-md font-semibold text-green-700 dark:text-green-400">Repeat Prescriptions</h4>
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                    {repeatPrescriptions.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {repeatPrescriptions.map((med) => (
                    <div
                      key={`${med.name}-${med.started}`}
                      className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Pill className="text-green-600 dark:text-green-400" size={20} />
                            <h4 className="font-semibold">{med.name}</h4>
                            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                              Repeat
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar size={16} />
                              <span>Started: {new Date(med.started).toLocaleDateString()}</span>
                            </div>
                            {med.refillsRemaining !== undefined && (
                              <div className="flex items-center gap-1">
                                <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 rounded text-xs font-semibold">
                                  Refills: {med.refillsRemaining} / {med.refillsAuthorized || 0}
                                </span>
                              </div>
                            )}
                            {med.expiryDate && (
                              <div className="flex items-center gap-1">
                                <Clock size={16} />
                                <span>Expires: {new Date(med.expiryDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {med.durationDays && (
                              <div className="flex items-center gap-1">
                                <span>Duration: {med.durationDays} days per refill</span>
                              </div>
                            )}
                          </div>
                          {med.instructions && (
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                              <strong>Instructions:</strong> {med.instructions}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {med.refillsRemaining !== undefined && med.refillsRemaining > 0 && (
                            <button
                              onClick={() => handleRefill(med)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                              title={`Issue refill (${med.refillsRemaining} remaining)`}
                            >
                              <Plus size={14} /> Refill
                            </button>
                          )}
                          <button
                            onClick={() => handleAdjust(med)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
                          >
                            <Edit2 size={16} /> Adjust
                          </button>
                          <button
                            onClick={() => handleDiscontinue(med.name)}
                            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                          >
                            Discontinue
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acute Prescriptions Section */}
            {acutePrescriptions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-md font-semibold text-orange-700 dark:text-orange-400">Acute Prescriptions</h4>
                  <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full">
                    {acutePrescriptions.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {acutePrescriptions.map((med) => (
                    <div
                      key={`${med.name}-${med.started}`}
                      className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Pill className="text-orange-600 dark:text-orange-400" size={20} />
                            <h4 className="font-semibold">{med.name}</h4>
                            <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full">
                              Acute
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar size={16} />
                              <span>Started: {new Date(med.started).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={16} />
                              <span>
                                Duration: {Math.floor((Date.now() - new Date(med.started).getTime()) / (1000 * 60 * 60 * 24))} days
                              </span>
                            </div>
                          </div>
                          {med.instructions && (
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                              <strong>Instructions:</strong> {med.instructions}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAdjust(med)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
                          >
                            <Edit2 size={16} /> Adjust
                          </button>
                          <button
                            onClick={() => handleDiscontinue(med.name)}
                            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                          >
                            Discontinue
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No current medications
          </p>
        )}
      </div>

      {/* Discontinued Medications */}
      {discontinuedMeds.length > 0 && (
        <div className="card-compact">
          <h3 className="text-lg font-semibold mb-4">Discontinued Medications</h3>
          <div className="space-y-2">
            {discontinuedMeds.map((med) => (
              <div
                key={`${med.name}-${med.started}-discontinued`}
                className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg opacity-60"
              >
                <div className="flex-1">
                  <p className="font-medium">{med.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Started: {med.started} • Discontinued
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    Discontinued
                  </span>
                  <button
                    onClick={() => handleArchive(med.name)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                    title="Move to historical records"
                  >
                    <Archive size={16} /> Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical/Archived Medications */}
      {archivedMeds.length > 0 && (
        <div className="card-compact">
          <h3 className="text-lg font-semibold mb-4">Historical Medications</h3>
          <div className="space-y-2">
            {archivedMeds.map((med) => (
              <div
                key={`${med.name}-${med.started}-archived`}
                className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg opacity-70"
              >
                <div>
                  <p className="font-medium">{med.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Started: {med.started} • Status: {med.status}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                  Historical
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Medication Modal - Enhanced */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add New Medication</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Smart medication entry with autocomplete</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="p-6 space-y-5">
              {/* Drug Name with Autocomplete */}
              <div className="relative" ref={autocompleteRef}>
                <label
                  htmlFor="medication-name-input"
                  className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                >
                  Drug Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="medication-name-input"
                    ref={inputRef}
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={() => formData.name.length >= 2 && setShowSuggestions(true)}
                    placeholder="Start typing medication name (e.g., Metformin, Lisinopril)..."
                    className="w-full pl-10 pr-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  />
                  {selectedDrug && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle className="text-green-500" size={18} />
                    </div>
                  )}
                </div>

                {/* Autocomplete Suggestions */}
                {showSuggestions && drugSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {drugSuggestions.map((drug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleDrugSelect(drug)}
                        className="w-full px-4 py-3 text-left hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{drug.name}</div>
                            {drug.genericName && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">{drug.genericName}</div>
                            )}
                            <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">{drug.category}</div>
                          </div>
                          <Pill className="text-blue-500 ml-2" size={18} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Drug Info Card */}
              {selectedDrug && (
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" size={18} />
                    <div className="flex-1">
                      <div className="font-semibold text-teal-900 dark:text-blue-100 mb-1">{selectedDrug.name}</div>
                      {selectedDrug.genericName && (
                        <div className="text-sm text-teal-700 dark:text-teal-300 mb-2">Generic: {selectedDrug.genericName}</div>
                      )}
                      <div className="text-xs text-teal-600 dark:text-teal-400">{selectedDrug.category}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactions Alert */}
              {formInteractions.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <div className="font-semibold text-red-800 dark:text-red-200 mb-2">Drug Interactions Detected</div>
                      <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                        {formInteractions.map((interaction, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-500">⚠</span>
                            <span>{interaction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                    <div className="flex-1">
                      <div className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Important Warnings</div>
                      <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                        {warnings.map((warning, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span>•</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Dose and Frequency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Dose <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="dose-suggestions"
                    value={formData.dose}
                    onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
                    placeholder="e.g., 1000mg"
                    className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  />
                  {doseSuggestions.length > 0 && (
                    <datalist id="dose-suggestions">
                      {doseSuggestions.map((dose, idx) => (
                        <option key={idx} value={dose} />
                      ))}
                    </datalist>
                  )}
                  {doseSuggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {doseSuggestions.map((dose, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, dose })}
                          className="px-2.5 py-1 text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors border border-teal-200 dark:border-teal-800"
                        >
                          {dose}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  >
                    <option value="">Select frequency...</option>
                    {frequencySuggestions.length > 0 ? (
                      frequencySuggestions.map((freq) => (
                        <option key={freq} value={freq}>
                          {freq === "QD" && "Once daily (QD)"}
                          {freq === "BID" && "Twice daily (BID)"}
                          {freq === "TID" && "Three times daily (TID)"}
                          {freq === "QID" && "Four times daily (QID)"}
                          {freq === "QHS" && "At bedtime (QHS)"}
                          {freq === "PRN" && "As needed (PRN)"}
                          {!["QD", "BID", "TID", "QID", "QHS", "PRN"].includes(freq) && freq}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="QD">Once daily (QD)</option>
                        <option value="BID">Twice daily (BID)</option>
                        <option value="TID">Three times daily (TID)</option>
                        <option value="QID">Four times daily (QID)</option>
                        <option value="QHS">At bedtime (QHS)</option>
                        <option value="PRN">As needed (PRN)</option>
                      </>
                    )}
                  </select>
                  {frequencySuggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {frequencySuggestions.map((freq, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, frequency: freq })}
                          className={`px-2.5 py-1 text-xs rounded-md transition-colors border ${
                            formData.frequency === freq
                              ? "bg-teal-500 text-white border-teal-600"
                              : "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/30"
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
              </div>

              {/* Prescription Type */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Prescription Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, prescriptionType: "acute" })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.prescriptionType === "acute"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="font-semibold">Acute</div>
                    <div className="text-xs mt-1">Short-term, one-time prescription</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, prescriptionType: "repeat" })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.prescriptionType === "repeat"
                        ? "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="font-semibold">Repeat</div>
                    <div className="text-xs mt-1">Ongoing, refillable prescription</div>
                  </button>
                </div>
              </div>

              {/* Repeat Prescription Details */}
              {formData.prescriptionType === "repeat" && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Refills Authorized
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        value={formData.refillsAuthorized}
                        onChange={(e) => setFormData({ ...formData, refillsAuthorized: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        placeholder="0-12"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Number of refills allowed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Duration per Refill (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.durationDays}
                        onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 30 })}
                        className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        placeholder="30"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Days supply per refill</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Instructions <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Special instructions for the patient (e.g., Take with meals, Avoid alcohol)..."
                  rows={3}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
                />
              </div>

              {/* Assign to Nurse for Administration */}
              <UserAssignment
                assignedTo={formData.assignedTo}
                allowedRoles={["nurse", "nurse_practitioner", "medical_assistant"]}
                label="Assign to Nurse/Staff (Optional)"
                placeholder="Select nurse for administration..."
                onAssign={(userId) => setFormData({ ...formData, assignedTo: userId })}
              />

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setFormData({ 
                      name: "", 
                      dose: "", 
                      frequency: "", 
                      startDate: "", 
                      instructions: "", 
                      assignedTo: null,
                      prescriptionType: "acute",
                      refillsAuthorized: 0,
                      durationDays: 30,
                    });
                    setSelectedDrug(null);
                    setDoseSuggestions([]);
                    setFrequencySuggestions([]);
                    setWarnings([]);
                    setFormInteractions([]);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formInteractions.length > 0}
                  className="px-5 py-2.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Medication Modal */}
      {adjustOpen && selectedMed && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setAdjustOpen(null);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-[500px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Adjust Medication</h4>
              <button
                onClick={() => setAdjustOpen(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Current: {selectedMed.name}
            </p>
            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">New Dose</label>
                  <input
                    type="text"
                    required
                    value={adjustData.newDose}
                    onChange={(e) => setAdjustData({ ...adjustData, newDose: e.target.value })}
                    placeholder="e.g., 500mg"
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Frequency</label>
                  <select
                    required
                    value={adjustData.newFrequency}
                    onChange={(e) => setAdjustData({ ...adjustData, newFrequency: e.target.value })}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="">Select</option>
                    <option value="QD">QD</option>
                    <option value="BID">BID</option>
                    <option value="TID">TID</option>
                    <option value="QID">QID</option>
                    <option value="QHS">QHS</option>
                    <option value="PRN">PRN</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Adjustment</label>
                <textarea
                  required
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  placeholder="Explain why the medication is being adjusted..."
                  rows={3}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Effective Date</label>
                <input
                  type="date"
                  required
                  value={adjustData.effectiveDate}
                  onChange={(e) => setAdjustData({ ...adjustData, effectiveDate: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setAdjustOpen(null)}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 font-medium"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
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

export default memo(MedicationList);

