# ADR 0001: Frontend foundation

- **Status:** Accepted
- **Date:** 2026-11-13

## Context

Pathora needs to demonstrate production frontend engineering while remaining easy to evolve as its scenario, evidence, timeline, and collaboration capabilities grow.

## Decision

Use Next.js App Router, React, strict TypeScript, Tailwind CSS, React Compiler, and a feature-based layered structure. Keep Server Components as the default and enforce layer direction with ESLint. Use Vitest for fast behavior tests and Playwright for browser flows.

## Consequences

- Product capabilities have explicit ownership and stable public APIs.
- Server/client boundaries remain visible and reviewable.
- Architectural violations fail in local checks and CI.
- Contributors must resist premature shared abstractions and add new segments only when required by behavior.
