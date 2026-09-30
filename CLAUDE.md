# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Cash Compass is a client-only personal financial planner (Vite + React 19 + TypeScript + Motion). No backend, no network requests: all data lives in `localStorage` and can be exported/imported as a JSON backup. The UI is in **Spanish** (EUR, net income); code, identifiers and comments are in English. Keep that split when extending it.

## Commands

```sh
npm run dev            # Vite dev server
npm test               # Vitest, run once (only src/**/*.test.ts)
npx vitest run src/domain/finance.test.ts   # single file
npx vitest run -t "annual expenses"         # single test by name
npm run typecheck      # tsc -b
npm run build          # typecheck + production build
npm run format         # Prettier (no semicolons, single quotes, printWidth 160)
```

There is no linter; `tsc` runs in strict mode with `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (use `import type` for types).

## Architecture

Layered, with dependencies pointing inward:

- `src/domain/`: pure logic, no React or browser APIs. `types.ts` defines the `Plan` aggregate (incomes, expenses, assets, spending, settings) and limits (`MAX_ENTRIES`, `MAX_SPENDS`). `finance.ts` holds `calculate(plan)` (the derived `Summary`), the projection, `emptyPlan`/`demoPlan`. `spending.ts` covers the day-to-day allowance, `dates.ts` handles local `YYYY-MM-DD` date keys, and `validation.ts` has `validatePlan`. Tests sit next to the code and only exist for this layer.
- `src/infrastructure/`: `storage.ts` (load/save under key `cash-compass-plan-v1`) and `backup.ts` (JSON export/import, 2 MB cap). Both go through `validatePlan`.
- `src/application/use-plan.ts`: the single state container. `usePlan()` owns the `Plan`, memoizes `calculate(plan)` as `summary`, persists on change, and exposes the use cases (`saveEntry`, `removeEntry`, `addSpend`, `removeSpend`/`restoreSpend` for undo, `setSetting`, `loadDemo`, `reset`, `replace`). Its return type is `PlanStore`.
- `src/ui/`: `app.tsx` wires `usePlan`, navigation and modals. Sections are registered in `ui/sections/index.ts` (`SECTIONS`, `SectionId`); the ones marked `secondary` stay out of the phone tab bar. Reusable pieces live in `ui/components/`, and number/currency formatting in `ui/format.ts`.

Invariants to preserve:

- **All untrusted data** (localStorage and imported files) goes through `validatePlan`. It rejects bad structure, limits and duplicates, rounds money to cents, and throws `PlanValidationError` with a user-facing Spanish message. If you add a field to `Plan`, update `types.ts`, `validatePlan`, `emptyPlan` and `demoPlan` together.
- `usePlan` uses a `dirty` ref so that data it could not read is never overwritten until the user makes a change. Keep that guard.
- State updates are immutable, applied through `update(fn)`.
- Calculation rules (priority allocation, emergency fund, projection with effective monthly rate, daily allowance) are documented in `README.md` under "Calculations" and shown in-app in `ui/sections/method.tsx`. When a formula changes, update the domain code, its tests, the README and the Method section together.
