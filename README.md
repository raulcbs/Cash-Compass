# Cash Compass

Personal financial planner in Spanish (EUR, net income). Runs entirely in the browser: no account, no bank connection, no external requests.

Built with Vite, React, TypeScript and [Motion](https://motion.dev/docs/react).

## Getting started

```sh
npm install
npm run dev      # development server
npm test         # domain tests (Vitest)
npm run build    # typecheck + production build
```

## Structure

```
src/
  domain/          Pure finance logic and validation (no React, fully tested)
  infrastructure/  localStorage persistence and JSON backup import/export
  application/     usePlan hook: state, persistence and use cases
  ui/              Components, sections and formatting
  styles/          Design tokens and responsive layout
```

## Calculations

- Annual amounts are divided by 12.
- Priority allocation: expenses → money for you → emergency fund → investment.
  Surplus = max(0, income − expenses). Personal = surplus × personal %. The rest goes to the emergency fund (rest × savings %, capped at what is missing) and the remainder is invested; once the fund is complete, all of the rest is invested. Deficits are shown, never hidden.
- Rounding: savings and investment are rounded to the chosen step (1, 5, 10 or 50 €, default 10) and the personal share absorbs the difference, so the allocation still adds up to the surplus. When rounding to the nearest step does not fit, it rounds down; the last top-up of the emergency fund is rounded up to the whole euro so the fund always completes. Expenses and day-to-day purchases keep their cents.
- Emergency fund target = essential expenses × chosen months. Coverage = liquid savings / essential expenses.
- Projection with month-end contributions and an effective annual rate: `i = (1+r)^(1/12) − 1`, simulated month by month because the contribution rises when the fund is complete. Taxes, fees and inflation are excluded.
- Portfolio values are entered manually; unrealized gain = value − cost.
- Day to day: personal purchases are logged against the monthly personal share. Left this month = personal share − purchases. Today's allowance = (personal share − spent before today) / days left, today included − spent today. Past months are measured against the current personal share.

Data is saved automatically to `localStorage`. Export a JSON backup from the top bar; imports are validated (structure, limits, duplicates) and amounts are rounded to cents before replacing the plan.
