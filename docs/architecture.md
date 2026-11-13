# Pathora frontend architecture

Pathora uses a feature-based, layered architecture. The goal is to let the product grow by adding cohesive slices rather than growing global folders such as `components`, `hooks`, or `utils` without ownership.

```text
src/
├── app/          Next.js routes, metadata, global error/loading states
├── widgets/      Page-level composition of multiple product concerns
├── features/     User-facing use cases and interactions
├── entities/     Domain models and entity-focused presentation
└── shared/       Domain-agnostic UI, config, libraries, and test setup
```

## Dependency direction

```text
app → widgets → features → entities → shared
```

A lower layer never imports a higher layer. ESLint enforces this rule. Cross-slice imports use the slice's public `index.ts`; private modules use relative imports inside their own slice.

## Slice anatomy

A slice adds only the segments it needs:

```text
features/simulate-career-path/
├── model/        Pure calculation and state logic
├── ui/           Interactive presentation
└── index.ts      Stable public API
```

Future slices may add `api`, `lib`, or `config` when real behavior requires them. Empty placeholder directories are intentionally avoided.

## Server and client boundary

Routes and widgets remain Server Components by default. Client Components are placed at the smallest interactive boundary, such as `ScenarioSimulator`. This keeps the shipped JavaScript small and leaves data fetching and secure orchestration on the server.

## SOLID in this frontend

- **Single responsibility:** calculation, domain types, presentation, and composition live in separate modules.
- **Open/closed:** new scenario types can be introduced as new slices without rewriting shared primitives.
- **Liskov substitution:** reusable components preserve native element behavior and prop contracts.
- **Interface segregation:** components receive the smallest useful props instead of an application-wide context.
- **Dependency inversion:** future APIs will implement feature-owned ports; product logic will not depend directly on HTTP clients or persistence vendors.

SOLID is applied where it reduces coupling. We do not add interfaces, repositories, or factories before a second implementation or external boundary makes them useful.

The evidence boundary is one such external boundary: `entities/evidence` owns the evidence contracts and repository port, while `features/inspect-evidence` owns loading, retry, empty, and provenance presentation. Its current adapter returns deterministic prototype evidence and is explicitly labeled as modeled data. A future HTTP adapter can replace it without changing the feature UI.

Scenario comparison lives in `features/compare-scenarios`. Its ranking model is a pure function over scenario entities and projections; the responsive workbench owns only selection and presentation state. The score is deliberately exposed as a decision aid rather than presented as an opaque prediction.

## State strategy

Use URL and server state first, local component state for isolated interactions, and introduce a global client store only when state genuinely spans unrelated subtrees. The scenario composer keeps its active step in URL state and uses a feature-owned, versioned local-storage adapter for drafts. The scenario entity owns a repository contract for its versioned collection and active selection; Composer, Library, and Dashboard depend on that public contract rather than browser storage details. Remote-data tooling will be selected after the backend and caching requirements are known.

## Quality gates

- TypeScript strict mode with additional safety flags
- ESLint with architectural boundaries
- Prettier with Tailwind class sorting
- Vitest and Testing Library for domain and component behavior
- Playwright for desktop and mobile user flows
- Production build and security headers in CI
