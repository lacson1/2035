/**
 * Print Template Utilities
 * Centralized HTML generation for print previews
 * Reduces code duplication across components
 */

import { getOrganizationDetails, getOrganizationFooter } from './organization';
import { Patient } from '../types';

export interface PrintTemplateOptions {
  title: string;
  subtitle?: string;
  patient?: Patient;
  content: string;
  showSignature?: boolean;
  signatureLabel?: string;
  additionalFooter?: string;
}

/**
 * Generate common print styles
 */
export const getPrintStyles = () => `
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
    gap: 15px;
    margin: 25px 0;
  }
  .info-item {
    padding: 10px;
    background: #f9fafb;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
  }
  .info-label {
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 5px;
    font-weight: 600;
  }
  .info-value {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
  }
  .signature-section {
    margin-top: 60px;
    padding-top: 20px;
    border-top: 2px solid #e5e7eb;
  }
  .signature-line {
    margin-top: 60px;
    border-top: 1px solid #333;
    width: 300px;
  }
  .signature-label {
    font-size: 11px;
    color: #6b7280;
    margin-top: 5px;
  }
  .footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
    font-size: 10px;
    color: #6b7280;
    text-align: center;
  }
  @media print {
    .no-print {
      display: none;
    }
  }
`;

/**
 * Generate organization header HTML
 */
export const getOrganizationHeader = () => {
  const orgDetails = getOrganizationDetails();
  return `
    <div class="org-header">
      <div class="org-name">${orgDetails.name}</div>
      <div class="org-type">${orgDetails.type}</div>
      <div class="org-details">
        ${orgDetails.address}, ${orgDetails.city}, ${orgDetails.state} ${orgDetails.zipCode}<br>
        Phone: ${orgDetails.phone}${orgDetails.fax ? ` | Fax: ${orgDetails.fax}` : ''}${orgDetails.email ? ` | Email: ${orgDetails.email}` : ''}
      </div>
    </div>
  `;
};

/**
 * Generate document header HTML
 */
export const getDocumentHeader = (title: string, subtitle?: string) => {
  return `
    <div class="document-header">
      <h1>${title}</h1>
      ${subtitle ? `<h2>${subtitle}</h2>` : ''}
    </div>
  `;
};

/**
 * Generate patient info grid HTML
 */
export const getPatientInfoGrid = (patient?: Patient) => {
  if (!patient) return '';

  return `
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Patient Name</div>
        <div class="info-value">${patient.name || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Date of Birth</div>
        <div class="info-value">${patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Patient ID</div>
        <div class="info-value">${patient.id || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Date</div>
        <div class="info-value">${new Date().toLocaleDateString()}</div>
      </div>
    </div>
  `;
};

/**
 * Generate signature section HTML
 */
export const getSignatureSection = (label: string = 'Signature') => {
  return `
    <div class="signature-section">
      <div class="signature-line"></div>
      <div class="signature-label">${label}</div>
    </div>
  `;
};

/**
 * Generate footer HTML
 */
export const getPrintFooter = (additionalText?: string) => {
  const orgFooter = getOrganizationFooter();
  return `
    <div class="footer">
      ${orgFooter}<br>
      Generated: ${new Date().toLocaleString()}<br>
      ${additionalText || ''}
    </div>
  `;
};

/**
 * Generate complete print document HTML
 */
export const generatePrintDocument = (options: PrintTemplateOptions): string => {
  const {
    title,
    subtitle,
    patient,
    content,
    showSignature = true,
    signatureLabel = 'Signature',
    additionalFooter,
  } = options;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          ${getPrintStyles()}
        </style>
      </head>
      <body>
        ${getOrganizationHeader()}
        ${getDocumentHeader(title, subtitle)}
        ${getPatientInfoGrid(patient)}
        ${content}
        ${showSignature ? getSignatureSection(signatureLabel) : ''}
        ${getPrintFooter(additionalFooter)}
      </body>
    </html>
  `;
};

/**
 * Escape HTML to prevent XSS
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

