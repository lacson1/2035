# Accessibility Guide

## WCAG 2.1 AA Compliance

### Current Status
- ✅ Semantic HTML elements
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Dark mode support
- ⚠️ Color contrast (needs audit)
- ⚠️ Screen reader announcements (needs improvement)

### Improvements Needed

#### 1. Keyboard Navigation
- [ ] Skip links
- [ ] Focus management in modals
- [ ] Tab order optimization
- [ ] Escape key handlers

#### 2. Screen Readers
- [ ] Live regions for dynamic content
- [ ] Proper heading hierarchy
- [ ] Descriptive link text
- [ ] Form label associations

#### 3. Color Contrast
Run audit:
```bash
# Use axe DevTools browser extension
# Or Lighthouse accessibility audit
```

Target: WCAG AA (4.5:1 for normal text, 3:1 for large text)

#### 4. Focus Indicators
- Ensure all interactive elements have visible focus
- Custom focus styles for better visibility

#### 5. Form Accessibility
- All inputs have associated labels
- Error messages are associated with inputs
- Required fields are marked

## Testing Tools

1. **axe DevTools** (Browser Extension)
2. **Lighthouse** (Built into Chrome)
3. **WAVE** (Web Accessibility Evaluation Tool)
4. **Keyboard-only testing** (Tab navigation)

## Quick Wins

1. Add `aria-label` to icon-only buttons
2. Add `role="alert"` to error messages
3. Add `aria-live="polite"` to dynamic content
4. Ensure all images have alt text
5. Add skip links

## Example Improvements

```tsx
// Before
<button onClick={handleClick}>
  <X />
</button>

// After
<button 
  onClick={handleClick}
  aria-label="Close dialog"
>
  <X />
</button>
```

```tsx
// Error message
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

