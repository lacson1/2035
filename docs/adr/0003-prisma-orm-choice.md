# ADR-0003: Prisma ORM Choice

**Status:** Accepted  
**Date:** 2025-11-09  
**Deciders:** Development Team  
**Supersedes:** None

## Context

We need a database access layer that:
- Provides type safety
- Handles migrations
- Supports PostgreSQL
- Is developer-friendly
- Has good performance

## Decision

We will use **Prisma** as our ORM (Object-Relational Mapping) tool.

## Alternatives Considered

1. **TypeORM**
   - Pros: Mature, decorator-based, supports multiple databases
   - Cons: More complex, less type-safe, larger bundle size

2. **Sequelize**
   - Pros: Mature, feature-rich
   - Cons: Less type-safe, callback-based, complex API

3. **Raw SQL with pg**
   - Pros: Full control, best performance
   - Cons: No type safety, manual migrations, more boilerplate

4. **Drizzle ORM**
   - Pros: Lightweight, type-safe
   - Cons: Less mature, smaller ecosystem

## Consequences

### Positive
- ✅ Excellent TypeScript support with full type safety
- ✅ Auto-generated types from schema
- ✅ Built-in migration system
- ✅ Developer-friendly API
- ✅ Good performance with connection pooling
- ✅ Active development and community

### Negative
- ⚠️ Learning curve for Prisma-specific syntax
- ⚠️ Schema-first approach (can be seen as positive)
- ⚠️ Less flexibility than raw SQL for complex queries

### Mitigations
- Use `$queryRaw` for complex queries when needed
- Regular Prisma updates for new features
- Comprehensive documentation and examples

## Examples

```typescript
// Type-safe queries
const patient = await prisma.patient.findUnique({
  where: { id: patientId },
  include: { medications: true }
});

// Raw SQL when needed
const results = await prisma.$queryRaw`
  SELECT * FROM patients WHERE age > ${minAge}
`;
```

