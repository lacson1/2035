# Design System

This document outlines the design tokens and standards used across the application to ensure visual consistency.

## Typography

### Font Family
- **Primary**: Inter (system fallback: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)
- **Monospace**: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace

All text elements use the Inter font family for consistency.

### Font Sizes
- `xs`: 0.75rem (12px) - Small labels, badges
- `sm`: 0.875rem (14px) - Secondary text, form labels
- `base`: 1rem (16px) - Body text, default size
- `lg`: 1.125rem (18px) - Emphasized text
- `xl`: 1.25rem (20px) - Large text
- `2xl`: 1.5rem (24px) - Section headings
- `3xl`: 1.875rem (30px) - Page titles

### Font Weights
- `light`: 300
- `normal`: 400 - Default body text
- `medium`: 500 - Buttons, emphasized text
- `semibold`: 600 - Headings, labels
- `bold`: 700 - Page titles, important headings
- `extrabold`: 800 - Special emphasis

### Heading Hierarchy
- `h1`: text-2xl md:text-3xl font-bold tracking-tight
- `h2`: text-xl md:text-2xl font-bold tracking-tight
- `h3`: text-lg md:text-xl font-semibold tracking-tight
- `h4`: text-base md:text-lg font-semibold tracking-tight

## Spacing

Based on a 4px grid system:
- `xs`: 0.5rem (8px)
- `sm`: 0.75rem (12px)
- `md`: 1rem (16px)
- `lg`: 1.5rem (24px)
- `xl`: 2rem (32px)
- `2xl`: 3rem (48px)
- `3xl`: 4rem (64px)

## Border Radius

Consistent rounded corners:
- `sm`: 0.375rem (6px)
- `md`: 0.5rem (8px)
- `lg`: 0.75rem (12px) - **Standard for cards and buttons**
- `xl`: 1rem (16px)
- `full`: 9999px (circular)

**Standard values:**
- Cards: `rounded-xl` (12px)
- Buttons: `rounded-xl` (12px)
- Inputs: `rounded-xl` (12px)

## Buttons

### Primary Button
```tsx
<button className="btn-primary">
  Button Text
</button>
```

Classes: `px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-medium font-sans min-h-[44px] shadow-sm hover:shadow-md active:scale-95 transform`

### Secondary Button
```tsx
<button className="btn-secondary">
  Button Text
</button>
```

Classes: `px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 text-sm font-medium font-sans min-h-[44px] active:scale-95 transform`

## Input Fields

### Standard Input
```tsx
<input className="input-base" />
```

Classes: `w-full px-4 py-2.5 text-base border rounded-xl dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-sans`

## Cards

### Standard Card
```tsx
<div className="card">
  Card Content
</div>
```

Classes: `bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm`

### Compact Card
```tsx
<div className="card-compact">
  Card Content
</div>
```

Classes: Same as card but with `p-3 md:p-4` instead of `p-4 md:p-6`

## Shadows

- `sm`: Subtle elevation
- `md`: Standard elevation (cards, buttons)
- `lg`: High elevation (modals, dropdowns)
- `xl`: Maximum elevation

## Transitions

- Fast: 150ms
- Base: 200ms (standard for buttons and interactions)
- Slow: 300ms (cards, complex animations)

## Color Palette

### Primary Colors
- Blue 600: Primary actions, links
- Blue 700: Hover states

### Neutral Colors
- Gray 50-950: Backgrounds, text, borders
- White/Black: Base colors

### Semantic Colors
- Red: Errors, warnings
- Green: Success, positive actions
- Yellow: Warnings, alerts
- Purple: Special features

## Best Practices

1. **Always use `font-sans` class** for text elements to ensure Inter font
2. **Use `rounded-xl`** for buttons, inputs, and cards (12px)
3. **Use standard button classes** (`.btn-primary`, `.btn-secondary`) instead of inline styles
4. **Use `input-base` class** for form inputs
5. **Use `card` class** for container cards
6. **Maintain consistent spacing** using the 4px grid system
7. **Use semantic heading tags** (h1, h2, h3, h4) with standard classes
8. **Ensure minimum touch target size** of 44px for interactive elements

## Design Tokens

See `src/design/tokens.ts` for programmatic access to design tokens.
