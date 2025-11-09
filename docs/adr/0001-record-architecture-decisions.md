# ADR-0001: Record Architecture Decisions

**Status:** Accepted  
**Date:** 2025-11-09  
**Deciders:** Development Team

## Context

We need to record the architectural decisions made on this project. Architecture Decision Records (ADRs) provide a way to document important technical decisions, their context, and consequences.

## Decision

We will use Architecture Decision Records (ADRs) as described by Michael Nygard in [this article](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions).

We will keep ADRs in the `docs/adr` directory, numbered sequentially and monotonically. Numbers will not be reused.

If an ADR is superseded, it will be marked as "Superseded by ADR-XXXX" and the new ADR will reference the old one.

## Consequences

- ADRs are in markdown format in the `docs/adr` directory
- We may have ADRs that are less formal than those described by Michael Nygard
- ADRs can be written by anyone on the team
- ADRs are reviewed in pull requests
- ADRs are version controlled

