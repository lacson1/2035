# ADR-0004: React Context API for State Management

**Status:** Accepted  
**Date:** 2025-11-09  
**Deciders:** Development Team  
**Supersedes:** None

## Context

We need to manage application state in our React frontend. We have several options:
- Redux/Redux Toolkit
- Zustand
- MobX
- React Context API
- React Query (for server state)

## Decision

We will use **React Context API** for global state management, combined with **React Query** (via custom hooks) for server state.

### Current Contexts
- `AuthContext` - Authentication state
- `DashboardContext` - Dashboard data
- `ToastContext` - Toast notifications
- `UserContext` - User preferences

## Alternatives Considered

1. **Redux Toolkit**
   - Pros: Predictable state, DevTools, middleware
   - Cons: Boilerplate, learning curve, overkill for our needs

2. **Zustand**
   - Pros: Simple, lightweight, good TypeScript support
   - Cons: Additional dependency, less familiar to team

3. **React Query only**
   - Pros: Excellent for server state
   - Cons: Doesn't handle client-only state well

## Consequences

### Positive
- ✅ No additional dependencies
- ✅ Built into React
- ✅ Simple for our use cases
- ✅ Easy to understand for new developers

### Negative
- ⚠️ Can cause unnecessary re-renders if not optimized
- ⚠️ Less structured than Redux
- ⚠️ Can become complex with many contexts

### Mitigations
- Split contexts by domain (auth, dashboard, etc.)
- Use `useMemo` and `useCallback` to prevent re-renders
- Consider Zustand if complexity grows
- Use React Query for server state to reduce context usage

## Examples

```typescript
// Context definition
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider with optimized re-renders
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

