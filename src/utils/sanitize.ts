/**
 * Frontend input sanitization utilities
 * React automatically escapes most content, but this provides additional protection
 */

/**
 * Sanitize a string by removing potentially dangerous characters
 * Note: React automatically escapes content in JSX, but this adds extra protection
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim();
}

/**
 * Sanitize HTML content
 * WARNING: Only use with trusted content. For user-generated content, use a library like DOMPurify
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }

  // Basic HTML tag removal
  // For production with user-generated HTML, use DOMPurify:
  // import DOMPurify from 'dompurify';
  // return DOMPurify.sanitize(html);
  
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string): string {
  const sanitized = sanitizeString(url);
  
  try {
    const parsed = new URL(sanitized);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return sanitized;
  } catch {
    return '';
  }
}

/**
 * Escape HTML entities (additional protection)
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

