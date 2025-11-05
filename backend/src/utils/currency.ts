/**
 * Currency utility functions
 * Supports multi-currency operations including Nigeria NGN
 */

export interface CurrencyInfo {
  code: string; // ISO 4217 code
  symbol: string;
  name: string;
  symbolPosition: 'before' | 'after'; // Where to place symbol relative to amount
  decimalPlaces: number;
}

// Common currencies with Nigeria NGN included
export const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    symbolPosition: 'before',
    decimalPlaces: 2,
  },
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    symbolPosition: 'before',
    decimalPlaces: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    symbolPosition: 'before',
    decimalPlaces: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    symbolPosition: 'before',
    decimalPlaces: 2,
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    symbolPosition: 'before',
    decimalPlaces: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    symbolPosition: 'before',
    decimalPlaces: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    symbolPosition: 'before',
    decimalPlaces: 0,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    symbolPosition: 'before',
    decimalPlaces: 2,
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    symbolPosition: 'before',
    decimalPlaces: 2,
  },
  GHS: {
    code: 'GHS',
    symbol: '₵',
    name: 'Ghanaian Cedi',
    symbolPosition: 'before',
    decimalPlaces: 2,
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    symbolPosition: 'before',
    decimalPlaces: 2,
  },
  UGX: {
    code: 'UGX',
    symbol: 'USh',
    name: 'Ugandan Shilling',
    symbolPosition: 'before',
    decimalPlaces: 0,
  },
};

/**
 * Get currency information
 */
export function getCurrencyInfo(code: string): CurrencyInfo {
  const upperCode = code.toUpperCase();
  return CURRENCIES[upperCode] || CURRENCIES.USD;
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(amount: number | string, currencyCode: string): string {
  const currency = getCurrencyInfo(currencyCode);
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `${currency.symbol}0`;
  }

  // Format number with appropriate decimal places
  const formattedAmount = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  });

  // Add symbol based on position
  if (currency.symbolPosition === 'before') {
    return `${currency.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount} ${currency.symbol}`;
  }
}

/**
 * Parse currency string to number
 */
export function parseCurrencyAmount(amount: string): number {
  // Remove currency symbols and spaces, then parse
  const cleaned = amount.replace(/[^\d.,-]/g, '').replace(',', '');
  return parseFloat(cleaned) || 0;
}

/**
 * Validate currency code
 */
export function isValidCurrency(code: string): boolean {
  return code.toUpperCase() in CURRENCIES;
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): CurrencyInfo[] {
  return Object.values(CURRENCIES);
}

/**
 * Get currency symbol map for storage
 */
export function getCurrencySymbolMap(): Record<string, string> {
  const map: Record<string, string> = {};
  Object.entries(CURRENCIES).forEach(([code, info]) => {
    map[code] = info.symbol;
  });
  return map;
}

