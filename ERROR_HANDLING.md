# Error Handling Guide

## Error Boundaries

The app uses React Error Boundaries to catch and handle component errors gracefully.

### Global Error Boundary

A top-level error boundary is set up in `main.tsx` that catches all unhandled errors in the React tree.

### Component-Level Error Boundaries

Use error boundaries for specific sections:

```typescript
import { ErrorBoundary, FallbackUI } from './components/ErrorBoundary';

<ErrorBoundary fallback={<FallbackUI />}>
  <YourComponent />
</ErrorBoundary>
```

### Using with HOC

```typescript
import { withErrorBoundary } from './components/ErrorBoundary';

export default withErrorBoundary(MyComponent);
```

## API Error Handling

API errors are handled through the `ApiError` class in `src/services/api.ts`:

```typescript
import { patientService } from './services/patients';
import { ApiError } from './services/api';

try {
  const response = await patientService.getPatient(id);
  // Handle success
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API error
    console.error(`API Error ${error.status}: ${error.message}`);
  } else {
    // Handle unexpected error
    console.error('Unexpected error:', error);
  }
}
```

## Loading States

Use `LoadingSpinner` and `SkeletonLoader` components for loading states:

```typescript
import LoadingSpinner from './components/LoadingSpinner';
import { SkeletonCard } from './components/SkeletonLoader';

{isLoading ? (
  <SkeletonCard />
) : (
  <PatientList />
)}
```

## Error Reporting

Currently, errors are logged to console. To integrate with error tracking:

1. Uncomment Sentry integration in `ErrorBoundary.tsx`
2. Add `VITE_SENTRY_DSN` to `.env`
3. Install Sentry: `npm install @sentry/react`

