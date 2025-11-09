# ADR-0002: Layered Architecture Pattern

**Status:** Accepted  
**Date:** 2025-11-09  
**Deciders:** Development Team  
**Supersedes:** None

## Context

We need to organize our backend codebase in a way that:
- Separates concerns clearly
- Makes the codebase maintainable
- Allows for easy testing
- Supports future scalability

## Decision

We will use a **layered architecture** pattern with the following layers:

```
Routes → Controllers → Services → Database (Prisma)
```

### Layer Responsibilities

1. **Routes Layer** (`src/routes/`)
   - Define API endpoints
   - Apply middleware (auth, validation, rate limiting)
   - Route requests to controllers

2. **Controllers Layer** (`src/controllers/`)
   - Handle HTTP request/response
   - Extract and validate input
   - Call services
   - Format responses
   - Handle errors

3. **Services Layer** (`src/services/`)
   - Business logic
   - Data transformation
   - Caching logic
   - External API calls

4. **Database Layer** (Prisma)
   - Data access
   - Query optimization
   - Transaction management

## Consequences

### Positive
- ✅ Clear separation of concerns
- ✅ Easy to test each layer independently
- ✅ Business logic separated from HTTP concerns
- ✅ Easy to add new features following the pattern

### Negative
- ⚠️ Can lead to "pass-through" methods in controllers
- ⚠️ Requires discipline to maintain layer boundaries
- ⚠️ May add some boilerplate code

### Mitigations
- Use TypeScript interfaces to enforce contracts
- Code reviews to ensure layer boundaries are respected
- Extract common patterns to utilities

## Examples

```typescript
// Route Layer
router.get('/patients', authenticate, patientsController.getPatients);

// Controller Layer
async getPatients(req: Request, res: Response) {
  const result = await patientsService.getPatients(params);
  res.json({ data: result });
}

// Service Layer
async getPatients(params: PatientListParams) {
  // Business logic, caching, etc.
  return await prisma.patient.findMany(...);
}
```

