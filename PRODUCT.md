# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Salaried people in Spain who are paid a net monthly salary in EUR. They want a clear, private plan for that salary: cover their expenses, keep a share for themselves without guilt, build an emergency fund and invest the rest. They come back to it often: to set up the plan when something changes, and day to day to log personal purchases and see what they can still spend.

## Product Purpose

Cash Compass turns net income into a monthly plan by priority: expenses, then money for you, then the emergency fund, then investment. It also keeps a daily allowance for the personal share. Success means users know where every euro goes this month, how much they can spend today, and where their savings are heading, without giving their data to anyone.

## Positioning

Private and transparent. Everything stays in the browser: no account, no bank connection, no external requests. Every figure comes from a formula the user can see and check in "Cómo se calcula", with public sources linked. Bank apps and aggregators such as Fintonic cannot say this truthfully, because they need your credentials and do not show their rules. Spreadsheets are private, but they come with no method.

## Operating Context

- Two rhythms: setting up the plan (incomes, expenses, portfolio, settings) now and then, and quick daily logging of personal purchases, usually on a phone.
- Sections: Resumen, Día a día, Ingresos y gastos, Mi cartera, Proyección, and Cómo se calcula, which is reference content kept out of the phone tab bar.
- Data lives in `localStorage`. JSON backup export and import (validated, 2 MB cap) is the only way to move data between devices.
- A demo plan lets people explore before entering their own numbers.

## Capabilities and Constraints

- Client-only (Vite + React + TypeScript + Motion). No backend, now or planned.
- Spanish UI, EUR, net amounts. No other languages or currencies are planned.
- Annual amounts are spread over 12 months. Deficits are always shown, never hidden.
- Savings and investment are rounded to a step the user chooses (1, 5, 10 or 50 €), and the personal share absorbs the difference.
- The projection is a hypothetical scenario. It leaves out taxes, fees and inflation and must always say so.
- Portfolio values are entered by hand. There are no market data feeds.
- Light, dark and system themes.
- Open decision: deployment (static site or PWA) has not been chosen.

## Brand Commitments

- Name: Cash Compass. The compass mark is `public/compass.svg` plus the `brand-mark` component. The month itself is drawn as the terrace cascade (`terraces` component), which replaced the compass dial in the 2026-09 redesign.
- Voice: warm, direct Spanish from Spain, addressing the user as "tú" ("Dale un rumbo a tu dinero", "Cada euro tiene su lugar"). Encouraging, never judgmental about spending.
- Code, identifiers and comments are in English. User-facing copy is in Spanish.

## Evidence on Hand

- Method sources linked in `src/ui/sections/method/method.tsx`: CFPB (budgeting, spending assessment, emergency fund), Investor.gov (compound interest), University of Waterloo (ordinary annuities).
- The demo plan (`demoPlan` in `src/domain/finance.ts`) is illustrative data, not real user data.
- There are no users, testimonials, metrics or press. Do not invent any.

## Product Principles

1. Private by construction: no feature may need an account, a server or a third-party request.
2. Every number can be explained: if a figure cannot be traced to a formula shown in "Cómo se calcula", it does not ship.
3. Honest over flattering: show deficits, assumptions and the limits of projections plainly.
4. Living today counts: the personal share is a planned right, not what is left over.
5. Fast daily use: logging a purchase and checking today's allowance must take seconds on a phone.
