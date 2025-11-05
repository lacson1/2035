/**
 * Hub Configuration - Reference Data
 * 
 * In production, these should be loaded from the backend API or database.
 * For now, kept as minimal reference data.
 */

export type HubId = string;

export interface Hub {
  id: HubId;
  name: string;
  description: string;
  color: string;
}

// Hub definitions - should be loaded from API in production
const hubs: Hub[] = [
  {
    id: "cardiology",
    name: "Cardiology",
    description: "Heart and cardiovascular care, including heart disease management, cardiac procedures, and cardiovascular monitoring.",
    color: "red",
  },
  {
    id: "oncology",
    name: "Oncology",
    description: "Cancer care and treatment, including chemotherapy, radiation therapy, and cancer screening programs.",
    color: "purple",
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    description: "Medical care for infants, children, and adolescents, including well-child visits and pediatric specialty care.",
    color: "blue",
  },
  {
    id: "orthopedics",
    name: "Orthopedics",
    description: "Musculoskeletal care, including joint replacement, sports medicine, and fracture management.",
    color: "green",
  },
  {
    id: "neurology",
    name: "Neurology",
    description: "Brain and nervous system care, including stroke management, epilepsy treatment, and neurological disorders.",
    color: "indigo",
  },
  {
    id: "psychiatry",
    name: "Psychiatry",
    description: "Mental health care, including therapy, medication management, and psychiatric evaluation.",
    color: "pink",
  },
  {
    id: "dermatology",
    name: "Dermatology",
    description: "Skin care and treatment, including dermatological conditions, skin cancer screening, and cosmetic procedures.",
    color: "orange",
  },
  {
    id: "endocrinology",
    name: "Endocrinology",
    description: "Hormone and metabolic care, including diabetes management, thyroid disorders, and hormone therapy.",
    color: "cyan",
  },
  {
    id: "gastroenterology",
    name: "Gastroenterology",
    description: "Digestive system care, including gastrointestinal disorders, endoscopy, and liver disease management.",
    color: "yellow",
  },
  {
    id: "emergency",
    name: "Emergency Medicine",
    description: "Acute care and emergency response, including trauma care, urgent medical conditions, and emergency procedures.",
    color: "red",
  },
];

export function getAllHubs(): Hub[] {
  return hubs;
}

export function getHubById(id: HubId): Hub | undefined {
  return hubs.find(h => h.id === id);
}

export function getHubBySpecialty(_specialty: string): Hub | undefined {
  // This should be implemented based on your hub-specialty mapping
  return undefined;
}

export function getHubColorClass(hubId: HubId): string {
  const hub = getHubById(hubId);
  if (!hub) {
    return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300";
  }

  const colorMap: Record<string, string> = {
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300",
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
    pink: "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300",
    orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300",
    cyan: "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300",
  };

  return colorMap[hub.color] || "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300";
}

