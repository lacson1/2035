// Common medications database for autocomplete
export interface DrugInfo {
  name: string;
  genericName?: string;
  commonDoses: string[];
  frequencies: string[];
  category: string;
  interactions?: string[];
  warnings?: string[];
}

export const medicationDatabase: DrugInfo[] = [
  {
    name: "Metformin",
    genericName: "Metformin HCl",
    commonDoses: ["500mg", "850mg", "1000mg"],
    frequencies: ["BID", "TID", "QD"],
    category: "Antidiabetic",
    warnings: ["Take with meals to reduce GI upset"],
  },
  {
    name: "Lisinopril",
    genericName: "Lisinopril",
    commonDoses: ["5mg", "10mg", "20mg", "40mg"],
    frequencies: ["QD"],
    category: "ACE Inhibitor",
    interactions: ["Potassium supplements", "Diuretics"],
  },
  {
    name: "Atorvastatin",
    genericName: "Atorvastatin Calcium",
    commonDoses: ["10mg", "20mg", "40mg", "80mg"],
    frequencies: ["QHS"],
    category: "Statin",
    warnings: ["Take at bedtime for best efficacy"],
  },
  {
    name: "Amlodipine",
    genericName: "Amlodipine Besylate",
    commonDoses: ["2.5mg", "5mg", "10mg"],
    frequencies: ["QD"],
    category: "Calcium Channel Blocker",
  },
  {
    name: "Levothyroxine",
    genericName: "Levothyroxine Sodium",
    commonDoses: ["25mcg", "50mcg", "75mcg", "100mcg", "125mcg", "150mcg"],
    frequencies: ["QD"],
    category: "Thyroid Hormone",
    warnings: ["Take on empty stomach, 30-60 minutes before breakfast"],
  },
  {
    name: "Omeprazole",
    genericName: "Omeprazole",
    commonDoses: ["20mg", "40mg"],
    frequencies: ["QD", "BID"],
    category: "Proton Pump Inhibitor",
    warnings: ["Take before meals"],
  },
  {
    name: "Warfarin",
    genericName: "Warfarin Sodium",
    commonDoses: ["1mg", "2mg", "2.5mg", "3mg", "4mg", "5mg", "7.5mg", "10mg"],
    frequencies: ["QD"],
    category: "Anticoagulant",
    interactions: ["Aspirin", "NSAIDs", "Antibiotics"],
    warnings: ["Monitor INR regularly"],
  },
  {
    name: "Aspirin",
    genericName: "Acetylsalicylic Acid",
    commonDoses: ["81mg", "325mg"],
    frequencies: ["QD"],
    category: "Antiplatelet",
    interactions: ["Warfarin", "NSAIDs"],
  },
  {
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    commonDoses: ["200mg", "400mg", "600mg", "800mg"],
    frequencies: ["TID", "QID", "PRN"],
    category: "NSAID",
    interactions: ["Warfarin", "Aspirin"],
    warnings: ["Take with food"],
  },
  {
    name: "Gabapentin",
    genericName: "Gabapentin",
    commonDoses: ["100mg", "300mg", "400mg", "600mg", "800mg"],
    frequencies: ["TID", "QID"],
    category: "Anticonvulsant",
  },
  {
    name: "Sertraline",
    genericName: "Sertraline HCl",
    commonDoses: ["25mg", "50mg", "100mg", "150mg", "200mg"],
    frequencies: ["QD"],
    category: "SSRI",
    warnings: ["May take 4-6 weeks for full effect"],
  },
  {
    name: "Amlodipine",
    genericName: "Amlodipine Besylate",
    commonDoses: ["2.5mg", "5mg", "10mg"],
    frequencies: ["QD"],
    category: "Calcium Channel Blocker",
  },
  {
    name: "Furosemide",
    genericName: "Furosemide",
    commonDoses: ["20mg", "40mg", "80mg"],
    frequencies: ["QD", "BID"],
    category: "Diuretic",
    warnings: ["Take in morning to avoid nighttime urination"],
  },
  {
    name: "Hydrochlorothiazide",
    genericName: "HCTZ",
    commonDoses: ["12.5mg", "25mg"],
    frequencies: ["QD"],
    category: "Diuretic",
  },
  {
    name: "Losartan",
    genericName: "Losartan Potassium",
    commonDoses: ["25mg", "50mg", "100mg"],
    frequencies: ["QD"],
    category: "ARB",
  },
];

// Search medications with fuzzy matching
export function searchMedications(query: string): DrugInfo[] {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return medicationDatabase
    .filter((drug) => {
      const nameMatch = drug.name.toLowerCase().includes(lowerQuery);
      const genericMatch = drug.genericName?.toLowerCase().includes(lowerQuery);
      const categoryMatch = drug.category.toLowerCase().includes(lowerQuery);
      return nameMatch || genericMatch || categoryMatch;
    })
    .slice(0, 10); // Limit to 10 results
}

// Get drug interactions
export function checkDrugInteractions(
  currentMedications: string[],
  newMedication: string
): string[] {
  const interactions: string[] = [];
  const newMed = medicationDatabase.find(
    (d) => d.name.toLowerCase() === newMedication.toLowerCase()
  );
  
  if (!newMed || !newMed.interactions) return interactions;
  
  currentMedications.forEach((currentMed) => {
    const medName = currentMed.toLowerCase();
    newMed.interactions?.forEach((interaction) => {
      if (medName.includes(interaction.toLowerCase())) {
        interactions.push(`${newMed.name} interacts with ${currentMed}`);
      }
    });
  });
  
  // Check for known dangerous combinations
  const allMeds = [...currentMedications, newMedication].map((m) => m.toLowerCase());
  if (allMeds.some((m) => m.includes("warfarin")) && allMeds.some((m) => m.includes("aspirin"))) {
    interactions.push("Warfarin + Aspirin: Increased bleeding risk");
  }
  if (allMeds.some((m) => m.includes("warfarin")) && allMeds.some((m) => m.includes("ibuprofen"))) {
    interactions.push("Warfarin + Ibuprofen: Increased bleeding risk");
  }
  
  return interactions;
}

// Get suggested dosage based on medication name
export function getSuggestedDose(medicationName: string): string[] {
  const drug = medicationDatabase.find(
    (d) => d.name.toLowerCase() === medicationName.toLowerCase()
  );
  return drug?.commonDoses || [];
}

// Get suggested frequency based on medication name
export function getSuggestedFrequency(medicationName: string): string[] {
  const drug = medicationDatabase.find(
    (d) => d.name.toLowerCase() === medicationName.toLowerCase()
  );
  return drug?.frequencies || ["QD", "BID", "TID", "QID", "QHS", "PRN"];
}

// Get medication warnings
export function getMedicationWarnings(medicationName: string): string[] {
  const drug = medicationDatabase.find(
    (d) => d.name.toLowerCase() === medicationName.toLowerCase()
  );
  return drug?.warnings || [];
}

