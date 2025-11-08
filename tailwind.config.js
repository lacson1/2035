/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Font Family - Inter from Google Fonts
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      // Consistent Font Sizes with proper line heights
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5rem', letterSpacing: '-0.005em' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em' }],      // 14px
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em' }],       // 16px
        'lg': ['1.125rem', { lineHeight: '1.5rem', letterSpacing: '-0.015em' }],    // 18px
        'xl': ['1.25rem', { lineHeight: '1.4rem', letterSpacing: '-0.015em' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '1.3rem', letterSpacing: '-0.02em' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '1.2rem', letterSpacing: '-0.025em' }],   // 30px
        '4xl': ['2.25rem', { lineHeight: '1.2rem', letterSpacing: '-0.025em' }],    // 36px
      },
      // Font Weights - Inter supports all these weights
      fontWeight: {
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
      },
      // Consistent Color Palette - Cool, Calm & Professional
      colors: {
        // Primary - Soft Sky Blue (cool, calm, professional)
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // Soft sky blue - calm & professional
          600: '#0284c7',  // Deeper blue for hover
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Success - Muted Sage Green (calm, trustworthy)
        success: {
          50: '#f6f7f6',
          100: '#e8ebe8',
          200: '#d1d7d1',
          300: '#a8b5a8',
          400: '#7a8a7a',
          500: '#6b9b8a',  // Soft mint green - calm & professional
          600: '#5a8574',  // Deeper mint for hover
          700: '#4a6f5f',
          800: '#3a5a4a',
          900: '#2a4535',
          950: '#1a2f20',
        },
        // Warning - Soft Amber (gentle alert)
        warning: {
          50: '#fef9f3',
          100: '#fdf2e7',
          200: '#fae4cc',
          300: '#f6cfa6',
          400: '#f0b573',
          500: '#e89b4a',  // Soft amber - calm alert
          600: '#d17d2a',  // Deeper amber for hover
          700: '#b8621f',
          800: '#954d1a',
          900: '#7a3f16',
          950: '#421f0b',
        },
        // Destructive - Muted Coral (professional alert)
        destructive: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',  // Muted coral - professional alert
          600: '#dc2626',  // Deeper red for hover
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Special - Muted Lavender (calm & elegant)
        special: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',  // Muted lavender - calm & elegant
          600: '#9333ea',  // Deeper purple for hover
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        // Advanced - Slate
        advanced: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      screens: {
        'xs': '475px',
      },
      borderRadius: {
        'card': '0.75rem', // 12px - consistent card radius
        'button': '0.75rem', // 12px - consistent button radius
        'input': '0.75rem', // 12px - consistent input radius
      },
    },
  },
  plugins: [],
}

