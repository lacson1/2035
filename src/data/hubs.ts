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

// Minimal hub definitions - should be loaded from API in production
const hubs: Hub[] = [];

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
  return hub?.color || 'bg-gray-500';
}

