import { addDays, monthOf, toDateKey } from './dates'
import type { Asset, Frequency, Plan, Settings } from './types'

export const emptyPlan = (): Plan => ({
  version: 1,
  incomes: [],
  expenses: [],
  assets: [],
  spending: [],
  settings: { personalSplit: 30, savingsSplit: 70, liquidSavings: 0, emergencyMonths: 6, annualReturn: 5, horizonYears: 10, roundingStep: 10 },
})

export const monthly = (item: { amount: number; frequency: Frequency }) => item.amount / (item.frequency === 'annual' ? 12 : 1)

const sum = <T>(items: T[], pick: (item: T) => number) => items.reduce((total, item) => total + pick(item), 0)

// Priority rule: expenses first; personalSplit % of the surplus is always money for yourself.
// The rest (allocable) goes to the emergency fund and investment: while the fund is incomplete,
// savingsSplit % of it goes to savings (capped at what is missing) and the remainder is invested.
// Savings and investment are rounded to the rounding step; the personal share absorbs the difference
// so the allocation still adds up to the surplus.
function allocate(surplus: number, gap: number, settings: Settings) {
  const { personalSplit, savingsSplit, roundingStep: step } = settings
  const allocable = surplus - (surplus * personalSplit) / 100
  const target = Math.min((allocable * savingsSplit) / 100, gap)
  // Never hand out more than there is: round down when rounding to the nearest step does not fit.
  const fit = (value: number, room: number) => (value <= room + 1e-9 ? value : Math.max(0, Math.floor(room / step + 1e-9) * step))
  // The last top-up closes the fund to the whole euro; a gap smaller than the step would never close otherwise.
  const savings = fit(gap > 0 && target === gap ? Math.ceil(gap - 1e-9) : roundTo(target, step), surplus)
  const investment = fit(roundTo(allocable - target, step), surplus - savings)
  return { allocable, savings, investment, personal: surplus - savings - investment }
}

export const roundTo = (value: number, step: number) => Math.round(value / step + 1e-9) * step

export type Summary = ReturnType<typeof calculate>

export function calculate(plan: Plan) {
  const income = sum(plan.incomes, monthly)
  const expenses = sum(plan.expenses, monthly)
  const essential = sum(
    plan.expenses.filter((x) => x.essential),
    monthly,
  )
  const { liquidSavings, emergencyMonths } = plan.settings

  const available = income - expenses
  const surplus = Math.max(0, available)
  const emergencyTarget = essential * emergencyMonths
  const emergencyGap = Math.max(0, emergencyTarget - liquidSavings)
  const { allocable, personal, savings, investment } = allocate(surplus, emergencyGap, plan.settings)
  const monthsToFund = emergencyGap === 0 ? 0 : savings > 0 ? Math.ceil(emergencyGap / savings - 1e-9) : null
  const remaining = available - personal - savings - investment

  const portfolio = sum(plan.assets, (x) => x.value)
  const cost = sum(plan.assets, (x) => x.cost)
  const share = (v: number) => (income > 0 ? (v / income) * 100 : 0)

  return {
    income,
    expenses,
    essential,
    available,
    surplus,
    personal,
    allocable,
    savings,
    investment,
    /** Monthly investment once the emergency fund is complete. */
    investmentAfterFund: allocate(surplus, 0, plan.settings).investment,
    remaining,
    deficit: Math.min(0, remaining),
    personalPercent: share(personal),
    savingsPercent: share(savings),
    investmentPercent: share(investment),
    monthsToFund,
    portfolio,
    cost,
    profit: portfolio - cost,
    emergencyTarget,
    emergencyGap,
    /** Months of essential expenses covered by liquid savings; null when there are no essentials. */
    coverage: essential > 0 ? liquidSavings / essential : null,
  }
}

const monthlyRate = (annualPercent: number) => Math.pow(1 + annualPercent / 100, 1 / 12) - 1

/** Future value with month-end contributions and an effective annual rate. */
export function futureValue(initial: number, contribution: number, annualPercent: number, years: number) {
  const rate = monthlyRate(annualPercent)
  const months = Math.round(years * 12)
  if (Math.abs(rate) < 1e-12) return initial + contribution * months
  const growth = Math.pow(1 + rate, months)
  return initial * growth + (contribution * (growth - 1)) / rate
}

export interface ProjectionPoint {
  year: number
  value: number
  contributed: number
}

// Month-by-month simulation: the contribution rises once the emergency fund is complete.
export function projection(plan: Plan): ProjectionPoint[] {
  const r = calculate(plan)
  const rate = monthlyRate(plan.settings.annualReturn)
  let value = r.portfolio
  let contributed = r.portfolio
  let gap = r.emergencyGap
  const points: ProjectionPoint[] = [{ year: 0, value, contributed }]
  for (let m = 1; m <= plan.settings.horizonYears * 12; m++) {
    const { savings, investment } = allocate(r.surplus, gap, plan.settings)
    gap = Math.max(0, gap - savings)
    value = value * (1 + rate) + investment
    contributed += investment
    if (m % 12 === 0) points.push({ year: m / 12, value, contributed })
  }
  return points
}

export function groupBy<T>(items: T[], key: (item: T) => string, amount: (item: T) => number) {
  const groups = new Map<string, number>()
  for (const item of items) groups.set(key(item), (groups.get(key(item)) ?? 0) + amount(item))
  return [...groups.entries()].sort((a, b) => b[1] - a[1])
}

export const assetsByCategory = (assets: Asset[]) =>
  groupBy(
    assets,
    (x) => x.category,
    (x) => x.value,
  )

export function demoPlan(today = new Date()): Plan {
  const p = emptyPlan()
  p.isDemo = true
  p.incomes = [
    { id: 'salary', name: 'Salario neto', amount: 2800, frequency: 'monthly' },
    { id: 'extra', name: 'Proyectos personales', amount: 300, frequency: 'monthly' },
  ]
  p.expenses = [
    { id: 'rent', name: 'Alquiler', amount: 850, frequency: 'monthly', kind: 'fixed', category: 'Vivienda', essential: true },
    { id: 'food', name: 'Supermercado', amount: 320, frequency: 'monthly', kind: 'variable', category: 'Alimentación', essential: true },
    { id: 'utilities', name: 'Luz, agua e internet', amount: 140, frequency: 'monthly', kind: 'fixed', category: 'Suministros', essential: true },
    { id: 'transport', name: 'Transporte', amount: 90, frequency: 'monthly', kind: 'variable', category: 'Transporte', essential: true },
    { id: 'leisure', name: 'Restaurantes y ocio', amount: 180, frequency: 'monthly', kind: 'variable', category: 'Ocio', essential: false },
    { id: 'subscriptions', name: 'Suscripciones', amount: 40, frequency: 'monthly', kind: 'fixed', category: 'Otros', essential: false },
    { id: 'insurance', name: 'Seguro', amount: 600, frequency: 'annual', kind: 'fixed', category: 'Seguros', essential: true },
  ]
  p.assets = [
    { id: 'fund', name: 'Fondo indexado global', category: 'Fondos', value: 8400, cost: 7200 },
    { id: 'bonds', name: 'Bonos', category: 'Renta fija', value: 2600, cost: 2500 },
    { id: 'stocks', name: 'Acciones', category: 'Acciones', value: 1500, cost: 1600 },
  ]
  p.settings = { ...p.settings, liquidSavings: 5200 }
  // A few personal purchases from earlier this month (never in the future).
  const samples: [number, number, string, string][] = [
    [0, 4.5, 'Comer fuera', 'Café y tostada'],
    [-1, 32, 'Ocio', 'Cine con amigos'],
    [-2, 18.9, 'Comer fuera', 'Menú del día'],
    [-4, 45, 'Compras', 'Camiseta'],
    [-6, 12, 'Caprichos', 'Libro de bolsillo'],
    [-9, 27.5, 'Comer fuera', 'Cena'],
  ]
  p.spending = samples
    .map(([offset, amount, category, note], i) => ({ id: `spend-${i}`, amount, category, note, date: toDateKey(addDays(today, offset)) }))
    .filter((s) => monthOf(s.date) === monthOf(toDateKey(today)))
    .reverse()
  return p
}
