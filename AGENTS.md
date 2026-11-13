# Pathora engineering guide

## Required checks

Run `npm run check` and `npm run build` before completing a change. Run `npm run test:e2e` when a user flow or routing behavior changes.

## Architecture

- `src/app` owns Next.js routing, metadata, global styles, and application composition.
- `src/widgets` composes multiple features or entities into page-level sections.
- `src/features` owns user actions and business use cases.
- `src/entities` owns domain types, domain data, and entity-focused UI.
- `src/shared` contains domain-agnostic UI, configuration, and utilities.
- Dependencies flow downward only: `app → widgets → features → entities → shared`.
- Import a slice through its public `index.ts`; use relative imports inside the same slice.

## Code quality

- Keep TypeScript strict. Do not add `any`, non-null assertions, or suppressed diagnostics as shortcuts.
- Keep Server Components as the default. Add `"use client"` only at the smallest interactive boundary.
- Prefer pure functions for domain calculations and test their behavior.
- Add dependencies only when the platform and current utilities cannot express the requirement cleanly.
- Model loading, empty, error, and success states deliberately for asynchronous work.
- Preserve semantic HTML, keyboard operation, visible focus, and reduced-motion support.
