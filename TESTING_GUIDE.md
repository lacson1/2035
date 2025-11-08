# Comprehensive Testing Guide

This guide outlines the complete testing strategy for the Physician Dashboard 2035 application, including unit tests, integration tests, E2E tests, accessibility testing, and CI/CD integration.

## Testing Overview

### Test Types
- **Unit Tests**: Individual components, hooks, and utilities
- **Integration Tests**: API endpoints and data flow
- **E2E Tests**: Complete user workflows
- **Accessibility Tests**: WCAG 2.1 AA compliance
- **Performance Tests**: Loading and responsiveness

### Test Structure
```
src/
├── components/
│   ├── __tests__/
│   │   ├── Component.test.tsx           # Unit tests
│   │   └── Component.accessibility.test.tsx  # Accessibility tests
├── hooks/
│   └── __tests__/
│       └── hook.test.ts                 # Hook tests
├── utils/
│   └── __tests__/
│       └── utility.test.ts              # Utility tests
└── test/
    ├── factories/                       # Test data factories
    │   └── testDataFactory.ts
    ├── mocks/                          # Mock utilities
    │   └── mockUtils.ts
    └── setup.ts                        # Global test setup

backend/tests/
├── unit/                               # Backend unit tests
├── integration/                        # API integration tests
└── setup.ts                           # Backend test setup

e2e/                                   # End-to-end tests
├── auth-flow.spec.ts
├── patient-creation-flow.spec.ts
├── comprehensive-workflow.spec.ts
└── ...
```

## Running Tests

### Frontend Tests
```bash
# Run all frontend tests
npm test

# Run with UI
npm run test:ui

# Run coverage report
npm run test:coverage

# Run accessibility tests only
npm run test:accessibility

# Run all test types
npm run test:all
```

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific test file
npx playwright test auth-flow.spec.ts
```

## Test Configuration

### Frontend (Vitest)
- **Environment**: jsdom for DOM testing
- **Setup**: Global test setup with mocks and utilities
- **Coverage**: 70% minimum coverage required
- **Reporters**: Text, JSON, HTML, LCOV, Cobertura

### Backend (Vitest)
- **Environment**: Node.js
- **Database**: Test database with migrations
- **Coverage**: 75% minimum coverage required

### E2E (Playwright)
- **Browsers**: Chromium, Firefox, WebKit
- **Parallel**: Fully parallel execution
- **Screenshots**: On failure only
- **Video**: On first retry

## Test Data & Mocking

### Test Data Factory
Use the `TestDataFactory` for consistent test data:

```typescript
import { PatientFactory, UserFactory } from '../test/factories/testDataFactory';

// Create test data
const patient = PatientFactory.create({ firstName: 'John' });
const doctor = UserFactory.createDoctor();
```

### Mock Utilities
Use `MockUtils` for common mocking scenarios:

```typescript
import { MockContextFactory, TestEnvironment } from '../test/mocks/mockUtils';

// Setup complete test environment
const mocks = TestEnvironment.setup();

// Create mock contexts
const authContext = MockContextFactory.createAuthContext();
```

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from '../Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<Component />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Updated text')).toBeInTheDocument();
  });
});
```

### Hook Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'changed' });
    expect(result.current).toBe('initial');

    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('changed');
  });
});
```

### Accessibility Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Component from '../Component';

describe('Component - Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Workflow', () => {
  test('completes full user journey', async ({ page }) => {
    await page.goto('/');

    // Login
    await page.fill('input[type="email"]', 'doctor@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // Navigate and interact
    await page.click('text=Patients');
    await page.click('text=Add Patient');

    // Fill form
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Patient added successfully')).toBeVisible();
  });
});
```

## Coverage Requirements

### Global Coverage
- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

### Component Coverage
- **Statements**: 60%
- **Branches**: 60%
- **Functions**: 60%
- **Lines**: 60%

### Hooks & Utils Coverage
- **Statements**: 75%+
- **Branches**: 75%+
- **Functions**: 75%+
- **Lines**: 75%+

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Testing Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Run accessibility tests
        run: npm run test:accessibility

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Start backend
        run: |
          cd backend
          npm ci
          npm run build
          npm start &
          sleep 10

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Codecov Integration
```yaml
coverage:
  status:
    project:
      default:
        target: 70%
        threshold: 1%
    patch:
      default:
        target: 70%
```

## Test Organization

### Test Naming Convention
- `*.test.ts` - Unit tests
- `*.accessibility.test.ts` - Accessibility tests
- `*.spec.ts` - E2E tests
- `*.integration.test.ts` - Integration tests

### Test Categories
- **Smoke Tests**: Critical functionality
- **Regression Tests**: Prevent bug reintroduction
- **Feature Tests**: New functionality
- **Edge Case Tests**: Error conditions and boundaries

## Debugging Tests

### Common Issues
1. **Async Operations**: Use `await` and `act()` for state updates
2. **Timers**: Mock timers with `vi.useFakeTimers()`
3. **Network Requests**: Mock with `MockHttpClient`
4. **DOM Events**: Use `fireEvent` or `userEvent`

### Debugging Commands
```bash
# Run specific test
npm test -- Component.test.tsx

# Debug mode
npm test -- --inspect-brk

# Verbose output
npm test -- --reporter=verbose

# Run with coverage details
npm run test:coverage -- --reporter=text-details
```

## Performance Testing

### Lighthouse CI
```yaml
- name: Lighthouse
  uses: treosh/lighthouse-ci-action@v10
  with:
    urls: http://localhost:5173
    configPath: .lighthouserc.json
```

### Bundle Analysis
```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "npm run preview",
      "url": ["http://localhost:4173"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.8}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.8}]
      }
    }
  }
}
```

## Best Practices

### Test Quality
1. **Descriptive Names**: Tests should explain what they're testing
2. **Independent Tests**: Each test should run in isolation
3. **Fast Execution**: Tests should run quickly
4. **Realistic Data**: Use factory-generated realistic data
5. **Complete Coverage**: Test both success and error paths

### Test Maintenance
1. **DRY Principle**: Extract common test utilities
2. **Regular Updates**: Keep tests in sync with code changes
3. **Documentation**: Document complex test scenarios
4. **Refactoring**: Refactor tests when code changes

### Accessibility Testing
1. **Automated First**: Use axe-core for automated checks
2. **Manual Verification**: Test with real assistive technologies
3. **Color Contrast**: Verify contrast ratios
4. **Keyboard Navigation**: Test all interactive elements

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [axe-core](https://github.com/dequelabs/axe-core)
- [WCAG Guidelines](https://www.w3.org/TR/WCAG21/)

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Include accessibility tests
3. Add E2E tests for critical workflows
4. Update coverage thresholds if needed
5. Document complex test scenarios
