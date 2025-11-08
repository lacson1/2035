/**
 * Design Tokens
 * Centralized design system values for consistent styling across the application
 */

export const designTokens = {
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
    letterSpacing: {
      tight: '-0.01em',
      normal: '0',
      wide: '0.025em',
    },
  },

  // Spacing (based on 4px grid system)
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },

  // Border Radius
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',
    card: '0.75rem',  // 12px - consistent card radius
    button: '0.75rem', // 12px - consistent button radius
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Transitions
  transitions: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  },

  // Z-Index Scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

/**
 * Color system for consistent use across the app
 * Calm, professional healthcare industry palette
 * Uses Tailwind color classes defined in tailwind.config.js
 */
export const colors = {
  // Primary actions (main CTAs, primary buttons) - Teal
  primary: {
    bg: 'bg-primary-500',
    hover: 'hover:bg-primary-600',
    text: 'text-primary-600 dark:text-primary-400',
    border: 'border-primary-500',
    light: 'bg-primary-50 dark:bg-primary-900/20',
    borderLight: 'border-primary-200 dark:border-primary-800',
  },
  // Success actions (add, save, confirm) - Emerald
  success: {
    bg: 'bg-success-500',
    hover: 'hover:bg-success-600',
    text: 'text-success-600 dark:text-success-400',
    border: 'border-success-500',
    light: 'bg-success-50 dark:bg-success-900/20',
    borderLight: 'border-success-200 dark:border-success-800',
  },
  // Special features (premium, advanced, templates) - Violet
  special: {
    bg: 'bg-special-500',
    hover: 'hover:bg-special-600',
    text: 'text-special-600 dark:text-special-400',
    border: 'border-special-500',
    light: 'bg-special-50 dark:bg-special-900/20',
    borderLight: 'border-special-200 dark:border-special-800',
  },
  // Advanced features (settings, tools) - Slate
  advanced: {
    bg: 'bg-advanced-500',
    hover: 'hover:bg-advanced-600',
    text: 'text-advanced-600 dark:text-advanced-400',
    border: 'border-advanced-500',
    light: 'bg-advanced-50 dark:bg-advanced-900/20',
    borderLight: 'border-advanced-200 dark:border-advanced-800',
  },
  // Destructive actions (delete, remove, cancel) - Rose
  destructive: {
    bg: 'bg-destructive-500',
    hover: 'hover:bg-destructive-600',
    text: 'text-destructive-600 dark:text-destructive-400',
    border: 'border-destructive-500',
    light: 'bg-destructive-50 dark:bg-destructive-900/20',
    borderLight: 'border-destructive-200 dark:border-destructive-800',
  },
  // Warning actions - Amber
  warning: {
    bg: 'bg-warning-500',
    hover: 'hover:bg-warning-600',
    text: 'text-warning-600 dark:text-warning-400',
    border: 'border-warning-500',
    light: 'bg-warning-50 dark:bg-warning-900/20',
    borderLight: 'border-warning-200 dark:border-warning-800',
  },
} as const;

/**
 * Standard component classes for consistency
 */
export const componentClasses = {
  // Buttons - All use rounded-xl (12px) for consistency
  button: {
    base: 'font-medium transition-all duration-200 active:scale-95 transform min-h-[44px]',
    // Primary actions (main CTAs)
    primary: `px-4 py-2.5 ${colors.primary.bg} text-white rounded-xl ${colors.primary.hover} shadow-sm hover:shadow-md`,
    // Success actions (add, save, confirm)
    success: `px-4 py-2.5 ${colors.success.bg} text-white rounded-xl ${colors.success.hover} shadow-sm hover:shadow-md`,
    // Special features (templates, premium)
    special: `px-4 py-2.5 ${colors.special.bg} text-white rounded-xl ${colors.special.hover} shadow-sm hover:shadow-md`,
    // Advanced features (settings, tools)
    advanced: `px-4 py-2.5 ${colors.advanced.bg} text-white rounded-xl ${colors.advanced.hover} shadow-sm hover:shadow-md`,
    // Destructive actions (delete, remove)
    destructive: `px-4 py-2.5 ${colors.destructive.bg} text-white rounded-xl ${colors.destructive.hover} shadow-sm hover:shadow-md`,
    // Secondary (neutral actions)
    secondary: 'px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600',
    // Outline style
    outline: `px-4 py-2.5 border-2 ${colors.primary.border} ${colors.primary.text} rounded-xl ${colors.primary.light} ${colors.primary.hover}`,
    // Ghost style
    ghost: 'px-4 py-2.5 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800',
  },

  // Input Fields
  input: {
    base: 'w-full px-4 py-2.5 text-base border rounded-xl dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans',
    error: 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500',
    disabled: 'opacity-50 cursor-not-allowed',
  },

  // Cards
  card: {
    base: 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm',
    hover: 'hover:shadow-md transition-shadow duration-300',
    compact: 'p-3 md:p-4',
    default: 'p-4 md:p-6',
  },

  // Labels
  label: {
    base: 'block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 font-sans',
    required: 'text-red-500 ml-1',
  },

  // Text
  text: {
    xs: 'text-xs font-sans',
    sm: 'text-sm font-sans',
    base: 'text-base font-sans',
    lg: 'text-lg font-sans',
    xl: 'text-xl font-sans',
  },

  // Headings
  heading: {
    h1: 'text-2xl md:text-3xl font-bold tracking-tight font-sans',
    h2: 'text-xl md:text-2xl font-bold tracking-tight font-sans',
    h3: 'text-lg md:text-xl font-semibold tracking-tight font-sans',
    h4: 'text-base md:text-lg font-semibold tracking-tight font-sans',
  },
} as const;

/**
 * Action type to color mapping for consistent button styling
 */
export const actionColors = {
  // Primary actions
  primary: 'primary',
  save: 'primary',
  submit: 'primary',
  continue: 'primary',
  next: 'primary',
  
  // Success actions
  add: 'success',
  create: 'success',
  confirm: 'success',
  approve: 'success',
  
  // Special features
  generate: 'special',
  template: 'special',
  premium: 'special',
  
  // Advanced features
  settings: 'advanced',
  tools: 'advanced',
  configure: 'advanced',
  
  // Destructive actions
  delete: 'destructive',
  remove: 'destructive',
  cancel: 'secondary',
  close: 'secondary',
} as const;

/**
 * Get button class by action type
 */
export function getButtonClass(action: keyof typeof actionColors | 'primary' | 'secondary' | 'outline' | 'ghost', variant?: 'primary' | 'secondary' | 'outline' | 'ghost'): string {
  if (variant) {
    return `${componentClasses.button.base} ${componentClasses.button[variant]}`;
  }
  
  const colorType = actionColors[action as keyof typeof actionColors] || 'primary';
  const buttonType = colorType === 'secondary' ? 'secondary' : colorType;
  
  return `${componentClasses.button.base} ${componentClasses.button[buttonType]}`;
}

