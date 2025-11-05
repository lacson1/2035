/**
 * Input sanitization utilities
 * Prevents XSS attacks and sanitizes user input
 */

/**
 * Sanitize a string by removing potentially dangerous characters
 * Basic XSS prevention - for production, consider using a library like DOMPurify
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
 * Sanitize an object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]) as any;
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      if (Array.isArray(sanitized[key])) {
        sanitized[key] = sanitized[key].map((item: any) =>
          typeof item === 'string' ? sanitizeString(item) : item
        ) as any;
      } else {
        sanitized[key] = sanitizeObject(sanitized[key]);
      }
    }
  }

  return sanitized;
}

/**
 * Sanitize HTML content (basic - for production use DOMPurify or similar)
 * This is a basic implementation - for production, use a proper library
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }

  // Basic HTML tag removal - for production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  return sanitizeString(email).toLowerCase().trim();
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string): string {
  const sanitized = sanitizeString(url);
  
  // Basic URL validation
  try {
    const parsed = new URL(sanitized);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return sanitized;
  } catch {
    // If URL parsing fails, return empty string
    return '';
  }
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number): number | null {
  if (typeof input === 'number') {
    return isNaN(input) ? null : input;
  }

  const num = parseFloat(input);
  return isNaN(num) ? null : num;
}

