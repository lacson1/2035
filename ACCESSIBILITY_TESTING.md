# Accessibility Testing Guide

This guide covers the accessibility testing setup and best practices for the Physician Dashboard 2035 application.

## Overview

Accessibility testing ensures our application is usable by people with disabilities, including those using screen readers, keyboard navigation, and other assistive technologies.

## Testing Tools

### Automated Testing
- **axe-core**: Automated accessibility testing tool
- **vitest-axe**: Integration with Vitest for accessibility assertions
- **@axe-core/react**: React-specific accessibility testing

### Manual Testing
- Keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Color contrast verification
- Focus management validation

## Test Structure

### Accessibility Test Files
Accessibility tests are located in `src/components/__tests__/*.accessibility.test.tsx`

Example structure:
```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Component from '../Component';

describe('Component - Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels', () => {
    // Specific accessibility assertions
  });
});
```

## Running Tests

### Run All Tests
```bash
npm run test:all
```

### Run Only Accessibility Tests
```bash
npm run test:accessibility
```

### Run with Coverage
```bash
npm run test:coverage
```

## Accessibility Rules Tested

### WCAG 2.1 AA Compliance

#### Perceivable
- **Text Alternatives**: Images, icons have proper alt text or ARIA labels
- **Time-based Media**: No media that requires timed interaction
- **Adaptable**: Content works with different presentations
- **Distinguishable**: Sufficient color contrast, text resizing

#### Operable
- **Keyboard Accessible**: All functionality available via keyboard
- **Enough Time**: No time limits that can't be extended
- **Seizures**: No content that could cause seizures
- **Navigable**: Logical focus order, headings, landmarks

#### Understandable
- **Readable**: Clear language, predictable behavior
- **Predictable**: Consistent navigation and behavior
- **Input Assistance**: Clear labels, error messages, prevention of mistakes

#### Robust
- **Compatible**: Works with current and future assistive technologies

## Common Accessibility Issues & Fixes

### 1. Missing Alt Text
```typescript
// ❌ Bad
<img src="icon.png" />

// ✅ Good
<img src="icon.png" alt="Save document" />
```

### 2. Missing Form Labels
```typescript
// ❌ Bad
<input type="email" />

// ✅ Good
<label htmlFor="email">Email Address</label>
<input type="email" id="email" />
```

### 3. Poor Color Contrast
```typescript
// ❌ Bad - Low contrast
<div style={{ color: '#888', backgroundColor: '#fff' }}>Text</div>

// ✅ Good - High contrast
<div className="text-gray-900 bg-white">Text</div>
```

### 4. Missing Focus Indicators
```typescript
// ❌ Bad - No visible focus
<button className="bg-blue-500">Click me</button>

// ✅ Good - Visible focus
<button className="bg-blue-500 focus:ring-2 focus:ring-blue-300">Click me</button>
```

### 5. Incorrect Heading Hierarchy
```typescript
// ❌ Bad - Skipping levels
<h1>Title</h1>
<h3>Subtitle</h3>

// ✅ Good - Proper hierarchy
<h1>Title</h1>
<h2>Subtitle</h2>
```

### 6. Missing ARIA Labels for Icons
```typescript
// ❌ Bad
<UserIcon />

// ✅ Good
<UserIcon aria-label="User profile" />
```

## Component-Specific Guidelines

### Forms
- Every input needs a label or `aria-label`
- Required fields should be marked with `aria-required`
- Error messages should be associated with inputs using `aria-describedby`
- Use appropriate input types (`email`, `password`, etc.)

### Buttons
- Use semantic `<button>` elements when possible
- Icon-only buttons need `aria-label` or `title`
- Loading states should be communicated to screen readers

### Navigation
- Use proper heading hierarchy (h1 → h2 → h3)
- Navigation landmarks with `role="navigation"`
- Skip links for keyboard users

### Data Tables
- Use semantic `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>`
- Table headers need proper `scope` attributes
- Complex tables may need `aria-label` or `aria-describedby`

### Modals/Dialogs
- Use `role="dialog"`
- Proper focus management (focus trap)
- `aria-labelledby` and `aria-describedby`
- Close button should be accessible

## Testing Checklist

### Automated Tests
- [ ] No axe-core violations
- [ ] Proper ARIA labels
- [ ] Semantic HTML elements
- [ ] Keyboard navigation works
- [ ] Focus management correct

### Manual Tests
- [ ] Keyboard-only navigation
- [ ] Screen reader compatibility
- [ ] Color contrast ratios
- [ ] Text resizing (200%)
- [ ] Mobile accessibility
- [ ] Touch target sizes

### User Testing
- [ ] Screen reader users
- [ ] Keyboard-only users
- [ ] Voice control users
- [ ] Users with motor disabilities

## Configuration

### Axe-Core Rules
Some rules may be disabled during development:

```typescript
const results = await axe(container, {
  rules: {
    'color-contrast': { enabled: false }, // Design system handles this
    'html-has-lang': { enabled: false }, // Set at app level
  },
});
```

### Test Setup
Accessibility tests extend the main test setup with:
- `vitest-axe/extend-expect` for accessibility matchers
- Proper cleanup and mocking for isolated testing

## Continuous Integration

Accessibility tests run as part of the CI pipeline:
```yaml
- name: Run Accessibility Tests
  run: npm run test:accessibility

- name: Upload Accessibility Report
  uses: actions/upload-artifact@v3
  with:
    name: accessibility-report
    path: reports/accessibility/
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WebAIM Accessibility Resources](https://webaim.org/resources/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Contributing

When adding new components:
1. Include accessibility tests
2. Follow established patterns
3. Test with real assistive technologies
4. Update this guide if needed

## Reporting Issues

Accessibility issues should be:
1. Logged as high-priority bugs
2. Include specific WCAG criteria violated
3. Provide reproduction steps
4. Suggest specific fixes when possible
