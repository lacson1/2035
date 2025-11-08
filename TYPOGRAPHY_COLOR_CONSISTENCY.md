# Typography and Color Consistency Implementation

This document outlines the comprehensive typography and color system implemented across the application using Google Fonts (Inter) and a consistent color palette.

## Font System

### Google Fonts - Inter
- **Source**: Google Fonts CDN
- **Weights Available**: 300 (light), 400 (normal), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
- **Loading**: Preconnected and loaded in `index.html` with inline style to prevent FOUT (Flash of Unstyled Text)

### Font Configuration
- **Primary Font**: Inter (from Google Fonts)
- **Fallback Stack**: `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Monospace Font**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

### Font Sizes (Consistent across app)
All font sizes include proper line heights and letter spacing:

| Size | Value | Line Height | Letter Spacing | Usage |
|------|-------|-------------|----------------|-------|
| `xs` | 0.75rem (12px) | 1.5rem | -0.005em | Small labels, badges |
| `sm` | 0.875rem (14px) | 1.5rem | -0.01em | Secondary text, form labels |
| `base` | 1rem (16px) | 1.5rem | -0.01em | Body text, default |
| `lg` | 1.125rem (18px) | 1.5rem | -0.015em | Emphasized text |
| `xl` | 1.25rem (20px) | 1.4rem | -0.015em | Large text |
| `2xl` | 1.5rem (24px) | 1.3rem | -0.02em | Section headings |
| `3xl` | 1.875rem (30px) | 1.2rem | -0.025em | Page titles |
| `4xl` | 2.25rem (36px) | 1.2rem | -0.025em | Large page titles |

### Font Weights
- `light`: 300
- `normal`: 400 (default body text)
- `medium`: 500 (buttons, emphasized text)
- `semibold`: 600 (headings, labels)
- `bold`: 700 (page titles, important headings)
- `extrabold`: 800 (special emphasis)

### Heading Hierarchy
- **h1**: `text-2xl md:text-3xl font-bold tracking-tight font-sans`
- **h2**: `text-xl md:text-2xl font-bold tracking-tight font-sans`
- **h3**: `text-lg md:text-xl font-semibold tracking-tight font-sans`
- **h4**: `text-base md:text-lg font-semibold tracking-tight font-sans`
- **h5**: `text-sm md:text-base font-semibold tracking-tight font-sans`
- **h6**: `text-xs md:text-sm font-semibold tracking-tight font-sans`

## Color System

### Primary Colors (Teal)
Used for main CTAs and primary actions:
- `primary-50` through `primary-950` (full scale)
- **Primary**: `primary-500` (#14b8a6)
- **Hover**: `primary-600` (#0d9488)
- **Text**: `primary-600` / `primary-400` (dark mode)

### Success Colors (Emerald)
Used for positive actions (add, save, confirm):
- `success-50` through `success-950` (full scale)
- **Primary**: `success-500` (#10b981)
- **Hover**: `success-600` (#059669)

### Warning Colors (Amber)
Used for warnings and alerts:
- `warning-50` through `warning-950` (full scale)
- **Primary**: `warning-500` (#f59e0b)
- **Hover**: `warning-600` (#d97706)

### Destructive Colors (Rose)
Used for delete, remove, cancel actions:
- `destructive-50` through `destructive-950` (full scale)
- **Primary**: `destructive-500` (#f43f5e)
- **Hover**: `destructive-600` (#e11d48)

### Special Colors (Violet)
Used for premium, advanced, templates:
- `special-50` through `special-950` (full scale)
- **Primary**: `special-500` (#8b5cf6)
- **Hover**: `special-600` (#7c3aed)

### Advanced Colors (Slate)
Used for settings, tools, advanced features:
- `advanced-50` through `advanced-950` (full scale)
- **Primary**: `advanced-500` (#64748b)
- **Hover**: `advanced-600` (#475569)

## Text Colors

### Default Text Colors
- **Body Text**: `text-gray-700 dark:text-gray-300`
- **Headings**: `text-gray-900 dark:text-gray-100`
- **Labels**: `text-gray-700 dark:text-gray-300`

### Semantic Text Colors
- `.text-primary`: `text-primary-600 dark:text-primary-400`
- `.text-success`: `text-success-600 dark:text-success-400`
- `.text-warning`: `text-warning-600 dark:text-warning-400`
- `.text-destructive`: `text-destructive-600 dark:text-destructive-400`

## Component Classes

### Buttons
- `.btn-primary`: Primary actions (teal)
- `.btn-success`: Success actions (emerald)
- `.btn-warning`: Warning actions (amber)
- `.btn-destructive`: Destructive actions (rose)
- `.btn-secondary`: Neutral actions (gray)

All buttons:
- Use `font-sans` (Inter)
- Have consistent padding: `px-4 py-2.5`
- Use `rounded-xl` (12px border radius)
- Have `min-h-[44px]` for accessibility
- Include smooth transitions

### Inputs
- `.input-base`: Standard input with primary focus ring
- Uses `font-sans` (Inter)
- Consistent padding and border radius
- Focus ring: `focus:ring-primary-500`

### Text Utilities
- `.text-body`: Base body text with proper color
- `.text-body-sm`: Small body text
- `.text-label`: Label text with medium weight

### Background Utilities
- `.bg-primary-light`: Light primary background
- `.bg-success-light`: Light success background
- `.bg-warning-light`: Light warning background
- `.bg-destructive-light`: Light destructive background

## Implementation Files

1. **`index.html`**: Google Fonts preconnect and Inter font loading
2. **`tailwind.config.js`**: Font sizes, weights, and color palette definitions
3. **`src/index.css`**: Base typography styles, component classes, and utilities
4. **`src/design/tokens.ts`**: Design tokens and color system exports

## Usage Guidelines

### Typography
1. **Always use `font-sans`** class or rely on base styles for Inter font
2. **Use semantic font sizes**: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`
3. **Use semantic font weights**: `font-normal`, `font-medium`, `font-semibold`, `font-bold`
4. **Follow heading hierarchy**: Use h1-h6 tags with proper semantic meaning

### Colors
1. **Use semantic color classes**: `primary-*`, `success-*`, `warning-*`, `destructive-*`
2. **Use Tailwind color utilities**: `bg-primary-500`, `text-primary-600`, etc.
3. **Always include dark mode variants**: `dark:text-primary-400`, `dark:bg-primary-900/20`
4. **Use component classes**: `.btn-primary`, `.text-primary`, `.bg-primary-light` for consistency

### Best Practices
1. **Consistency**: Always use the defined font sizes and colors
2. **Accessibility**: Ensure proper contrast ratios (WCAG AA minimum)
3. **Dark Mode**: Always provide dark mode variants
4. **Responsive**: Use responsive font sizes for headings (`md:text-2xl`)

## Migration Notes

If updating existing components:
1. Replace `bg-teal-*` with `bg-primary-*`
2. Replace `bg-emerald-*` with `bg-success-*`
3. Replace `bg-rose-*` with `bg-destructive-*`
4. Replace `bg-amber-*` with `bg-warning-*`
5. Replace `bg-violet-*` with `bg-special-*`
6. Replace `bg-slate-*` with `bg-advanced-*`
7. Ensure all text uses `font-sans` or inherits from base styles
8. Use consistent font sizes from the defined scale

