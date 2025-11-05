# Testing Guide

This project uses Vitest and React Testing Library for testing.

## Setup

Tests are configured in `vitest.config.ts` and use the setup file at `src/test/setup.ts`.

## Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

### Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Custom Render

The test utils include a custom render function that wraps components with all necessary providers:

```typescript
import { render } from '../../test/utils';

// Automatically includes UserProvider and DashboardProvider
render(<MyComponent />);
```

## Test Structure

- `src/components/__tests__/` - Component tests
- `src/hooks/__tests__/` - Hook tests
- `src/context/__tests__/` - Context tests
- `src/services/__tests__/` - API service tests
- `e2e/` - End-to-end tests (to be added)

## Coverage Goals

- Target: 80% code coverage
- Critical paths: 100% coverage
- Components: 80%+ coverage

