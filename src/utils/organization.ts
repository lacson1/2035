/**
 * Organization details utility
 * Manages organization information for print headers and documents
 */

export interface OrganizationDetails {
  name: string;
  type: string; // "Hospital", "Clinic", "Medical Center", etc.
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  fax?: string;
  email?: string;
  website?: string;
  licenseNumber?: string;
  taxId?: string;
}

const DEFAULT_ORGANIZATION: OrganizationDetails = {
  name: "Bluequee2.0 Medical Center",
  type: "Medical Center",
  address: "123 Medical Drive",
  city: "Springfield",
  state: "IL",
  zipCode: "62701",
  phone: "(217) 555-0100",
  fax: "(217) 555-0101",
  email: "info@bluequee2.com",
  website: "www.bluequee2.com",
  licenseNumber: "LIC-BQ20-001",
};

const ORGANIZATION_STORAGE_KEY = "organizationDetails";

/**
 * Get organization details from localStorage or return defaults
 */
export function getOrganizationDetails(): OrganizationDetails {
  try {
    const stored = localStorage.getItem(ORGANIZATION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      return { ...DEFAULT_ORGANIZATION, ...parsed };
    }
  } catch (error) {
    console.warn("Failed to load organization details from localStorage", error);
  }
  return DEFAULT_ORGANIZATION;
}

/**
 * Save organization details to localStorage
 */
export function saveOrganizationDetails(details: Partial<OrganizationDetails>): void {
  try {
    const current = getOrganizationDetails();
    const updated = { ...current, ...details };
    localStorage.setItem(ORGANIZATION_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save organization details", error);
  }
}

/**
 * Get formatted organization header for print documents
 */
export function getOrganizationHeader(): string {
  const org = getOrganizationDetails();
  return `${org.name}
${org.type}
${org.address}, ${org.city}, ${org.state} ${org.zipCode}
Phone: ${org.phone}${org.fax ? ` | Fax: ${org.fax}` : ""}${org.email ? ` | Email: ${org.email}` : ""}`;
}

/**
 * Get organization footer text
 */
export function getOrganizationFooter(): string {
  const org = getOrganizationDetails();
  return `${org.name} | ${org.address}, ${org.city}, ${org.state} ${org.zipCode} | ${org.phone}`;
}

