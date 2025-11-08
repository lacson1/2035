/**
 * Aesthetic Helper Utilities
 * Enhanced visual styling helpers for improved UI aesthetics
 */

/**
 * Get gradient class based on type
 */
export const getGradientClass = (type: 'primary' | 'accent' | 'subtle' | 'animated' = 'subtle'): string => {
  const gradients = {
    primary: 'gradient-primary',
    accent: 'gradient-accent',
    subtle: 'gradient-subtle',
    animated: 'gradient-animated',
  };
  return gradients[type];
};

/**
 * Get card elevation class
 */
export const getCardClass = (elevation: 'default' | 'compact' | 'elevated' = 'default'): string => {
  const cards = {
    default: 'card',
    compact: 'card-compact',
    elevated: 'card-elevated',
  };
  return cards[elevation];
};

/**
 * Get glass effect class
 */
export const getGlassClass = (strength: 'default' | 'strong' = 'default'): string => {
  return strength === 'strong' ? 'glass-strong' : 'glass';
};

/**
 * Get animation class
 */
export const getAnimationClass = (
  type: 'fade' | 'scale' | 'slide-up' | 'glow' | 'shimmer' = 'fade'
): string => {
  const animations = {
    fade: 'animate-fade-in',
    scale: 'animate-scale-in',
    'slide-up': 'animate-slide-up',
    glow: 'animate-glow',
    shimmer: 'animate-shimmer',
  };
  return animations[type];
};

/**
 * Get status color classes with enhanced styling
 */
export const getStatusColorClasses = (status: 'success' | 'warning' | 'error' | 'info' | 'neutral') => {
  const statusClasses = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-500 text-white',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-500 text-white',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-500 text-white',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-500 text-white',
    },
    neutral: {
      bg: 'bg-gray-50 dark:bg-gray-800/50',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-700',
      icon: 'text-gray-600 dark:text-gray-400',
      badge: 'bg-gray-500 text-white',
    },
  };
  return statusClasses[status];
};

/**
 * Get hover effect classes
 */
export const getHoverEffect = (type: 'lift' | 'glow' | 'scale' | 'none' = 'lift'): string => {
  const effects = {
    lift: 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200',
    glow: 'hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-200',
    scale: 'hover:scale-105 transition-transform duration-200',
    none: '',
  };
  return effects[type];
};

/**
 * Get focus ring class
 */
export const getFocusRing = (color: 'primary' | 'success' | 'warning' | 'error' = 'primary'): string => {
  const rings = {
    primary: 'focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500',
    success: 'focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
    warning: 'focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500',
    error: 'focus:ring-2 focus:ring-red-500/20 focus:border-red-500',
  };
  return rings[color];
};

/**
 * Get badge style classes
 */
export const getBadgeClasses = (
  variant: 'solid' | 'outline' | 'subtle' = 'solid',
  color: 'primary' | 'success' | 'warning' | 'error' | 'info' = 'primary'
): string => {
  const base = 'inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200';
  
  const variants = {
    solid: {
      primary: 'bg-teal-500 text-white hover:bg-teal-600',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600',
      warning: 'bg-amber-500 text-white hover:bg-amber-600',
      error: 'bg-red-500 text-white hover:bg-red-600',
      info: 'bg-blue-500 text-white hover:bg-blue-600',
    },
    outline: {
      primary: 'border border-teal-500 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20',
      success: 'border border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
      warning: 'border border-amber-500 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20',
      error: 'border border-red-500 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20',
      info: 'border border-blue-500 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    },
    subtle: {
      primary: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/30',
      success: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
      warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30',
      error: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30',
      info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30',
    },
  };
  
  return `${base} ${variants[variant][color]}`;
};

/**
 * Get divider style
 */
export const getDividerClass = (style: 'solid' | 'dashed' | 'gradient' = 'solid'): string => {
  const styles = {
    solid: 'border-t border-gray-200 dark:border-gray-700',
    dashed: 'border-t border-dashed border-gray-300 dark:border-gray-600',
    gradient: 'border-t border-transparent bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600',
  };
  return styles[style];
};

/**
 * Get shadow class based on elevation
 */
export const getShadowClass = (elevation: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'md'): string => {
  const shadows = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };
  return shadows[elevation];
};

/**
 * Get border radius class
 */
export const getRadiusClass = (size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md'): string => {
  const radii = {
    sm: 'rounded-sm',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  };
  return radii[size];
};

