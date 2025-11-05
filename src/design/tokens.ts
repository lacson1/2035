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
 */
export const colors = {
  // Primary actions (main CTAs, primary buttons)
  primary: {
    bg: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-600',
    light: 'bg-blue-50 dark:bg-blue-900/20',
    borderLight: 'border-blue-200 dark:border-blue-800',
  },
  // Success actions (add, save, confirm)
  success: {
    bg: 'bg-green-600',
    hover: 'hover:bg-green-700',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-600',
    light: 'bg-green-50 dark:bg-green-900/20',
    borderLight: 'border-green-200 dark:border-green-800',
  },
  // Special features (premium, advanced, templates)
  special: {
    bg: 'bg-purple-600',
    hover: 'hover:bg-purple-700',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-600',
    light: 'bg-purple-50 dark:bg-purple-900/20',
    borderLight: 'border-purple-200 dark:border-purple-800',
  },
  // Advanced features (settings, tools)
  advanced: {
    bg: 'bg-indigo-600',
    hover: 'hover:bg-indigo-700',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-600',
    light: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderLight: 'border-indigo-200 dark:border-indigo-800',
  },
  // Destructive actions (delete, remove, cancel)
  destructive: {
    bg: 'bg-red-600',
    hover: 'hover:bg-red-700',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-600',
    light: 'bg-red-50 dark:bg-red-900/20',
    borderLight: 'border-red-200 dark:border-red-800',
  },
  // Warning actions
  warning: {
    bg: 'bg-yellow-600',
    hover: 'hover:bg-yellow-700',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-600',
    light: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderLight: 'border-yellow-200 dark:border-yellow-800',
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
    base: 'w-full px-4 py-2.5 text-base border rounded-xl dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-sans',
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

