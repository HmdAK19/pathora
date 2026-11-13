# Pathora

Pathora is a decision-intelligence workspace for exploring choices, comparing possible futures, and turning uncertain goals into transparent, evidence-backed paths.

The first vertical slice models a career transition. Users can adjust readiness, weekly learning time, and market-demand assumptions; then create a scenario through a validated, URL-addressable three-step composer. Created scenarios live in a local library, can be selected as the active path, compared in a three-path decision workbench, drive the dashboard simulation, and use two-step deletion. A traceable evidence engine exposes source, methodology, freshness, and confidence while clearly labeling its current values as modeled prototype data. Drafts and collections are versioned locally until account-backed persistence is introduced.

## Stack

- Next.js App Router and React Server Components
- React Compiler
- TypeScript in strict mode
- Tailwind CSS with semantic design tokens
- Vitest and Testing Library
- Playwright for desktop and mobile flows
- ESLint architecture rules and Prettier

## Getting started

Requirements: Node.js 22.12+ and npm 10+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev            # development server
npm run check          # format, lint, type-check, and unit/component tests
npm run test:watch     # interactive Vitest mode
npm run test:coverage  # coverage report
npm run test:e2e       # Playwright desktop and mobile flows
npm run build          # production build
```

## Architecture

```text
app → widgets → features → entities → shared
```

Each product slice owns its model, UI, and optional API integration. Imports between slices go through a public `index.ts`, while internal imports stay relative. ESLint rejects reverse dependencies and imports that bypass a slice's public API.

Read [the architecture guide](docs/architecture.md) and [the foundation decision record](docs/decisions/0001-frontend-foundation.md) before introducing a new layer or state-management dependency.

## Product principles

- Show ranges and confidence rather than pretending to predict the future.
- Keep every result traceable to assumptions and evidence.
- Recalibrate scenarios as the user or market changes.
- Treat accessibility, responsive behavior, and failure states as product behavior—not polish added later.
