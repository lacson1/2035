/**
 * Hub Configuration
 * 
 * Loads hubs from the backend API. Falls back to cached data if API is unavailable.
 */

import { hubService, Hub as ApiHub } from '../services/hubs';
import { SpecialtyType } from '../types';

export type HubId = string;

// Re-export Hub type for convenience
export type Hub = ApiHub;

// Cache for hubs (fallback if API fails)
let cachedHubs: Hub[] = [];
let hubsLoaded = false;

// Specialty to Hub ID mapping
const specialtyToHubMap: Record<string, HubId> = {
  cardiology: 'cardiology',
  endocrinology: 'endocrinology',
  neurology: 'neurology',
  dermatology: 'dermatology',
  gastroenterology: 'gastroenterology',
  orthopedics: 'orthopedics',
  pediatrics: 'pediatrics',
  psychiatry: 'psychiatry',
  oncology: 'oncology',
  emergency: 'emergency',
  'general_surgery': 'general_surgery',
  // Additional mappings
  'cardiac': 'cardiology',
  'cardiac_surgery': 'cardiology',
  'endocrinology_diabetes': 'endocrinology',
  'neurological': 'neurology',
  'dermatological': 'dermatology',
  'gi': 'gastroenterology',
  'gastro': 'gastroenterology',
  'orthopedic': 'orthopedics',
  'pediatric': 'pediatrics',
  'psychiatric': 'psychiatry',
  'cancer': 'oncology',
  'emergency_medicine': 'emergency',
  'surgery': 'general_surgery',
  'surgical': 'general_surgery',
};

/**
 * Load hubs from API
 */
export async function loadHubs(): Promise<Hub[]> {
  try {
    const response = await hubService.getHubs({ limit: 100 });
    // Backend returns: { data: Hub[], meta: {...} }
    // API client wraps it: { data: { data: Hub[], meta: {...} }, message, errors }
    // So we need: response.data.data (the array of hubs)
    const hubs = Array.isArray(response.data?.data) 
      ? response.data.data 
      : Array.isArray(response.data) 
        ? response.data 
        : [];
    
    if (hubs.length > 0) {
      cachedHubs = hubs;
      hubsLoaded = true;
      console.log(`✅ Loaded ${hubs.length} hubs from API`);
    }
    return hubs;
  } catch (error) {
    console.warn('Failed to load hubs from API, using cached data:', error);
    // Return cached hubs if available, otherwise return empty array
    return cachedHubs;
  }
}

/**
 * Get all hubs (loads from API if not already loaded)
 */
export async function getAllHubs(): Promise<Hub[]> {
  if (hubsLoaded && cachedHubs.length > 0) {
    return cachedHubs;
  }
  return loadHubs();
}

/**
 * Get all hubs synchronously (returns cached data)
 * Use this for synchronous operations, but call getAllHubs() first to ensure data is loaded
 */
export function getAllHubsSync(): Hub[] {
  return cachedHubs;
}

/**
 * Get hub by ID
 */
export function getHubById(id: HubId): Hub | undefined {
  return cachedHubs.find(h => h.id === id);
}

/**
 * Get hub by specialty name
 */
export function getHubBySpecialty(specialty: string | SpecialtyType): Hub | undefined {
  if (!specialty) return undefined;
  
  const normalizedSpecialty = specialty.toLowerCase().trim();
  
  // Direct match
  const hubId = specialtyToHubMap[normalizedSpecialty];
  if (hubId) {
    return getHubById(hubId);
  }
  
  // Check if any hub has this specialty in its specialties array
  const hub = cachedHubs.find(h => 
    h.specialties && h.specialties.some(s => 
      s.toLowerCase() === normalizedSpecialty
    )
  );
  
  if (hub) return hub;
  
  // Partial match (e.g., "cardiac" matches "cardiology")
  const partialMatch = cachedHubs.find(h => {
    const hubName = h.name.toLowerCase();
    const hubIdLower = h.id.toLowerCase();
    return hubName.includes(normalizedSpecialty) || 
           normalizedSpecialty.includes(hubName) ||
           hubIdLower.includes(normalizedSpecialty) ||
           normalizedSpecialty.includes(hubIdLower);
  });
  
  return partialMatch;
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
    teal: "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300",
  };

  return colorMap[hub.color] || "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300";
}

/**
 * Initialize hubs by loading from API
 * Call this on app startup
 */
export async function initializeHubs(): Promise<void> {
  try {
    await loadHubs();
  } catch (error) {
    console.error('Failed to initialize hubs:', error);
  }
}

