import { daysInMonth, monthOf, toDateKey } from './dates'
import { calculate, groupBy } from './finance'
import type { Plan, Spend } from './types'

export type MonthStatus = 'past' | 'current' | 'future'

/**
 * How the personal ("Para ti") budget is going in a given month.
 *
 * The daily allowance is recalculated every day from what is left, so a
 * cheap day raises tomorrow's allowance and an expensive one lowers it:
 *   today's budget = (budget − spent before today) / days left, today included
 */
export function personalMonth(plan: Plan, month: string, today: Date) {
  const budget = calculate(plan).personal
  const todayKey = toDateKey(today)
  const currentMonth = monthOf(todayKey)
  const status: MonthStatus = month === currentMonth ? 'current' : month < currentMonth ? 'past' : 'future'

  // Newest first; the stable sort keeps same-day entries in reverse insertion order.
  const entries = plan.spending
    .filter((s) => monthOf(s.date) === month)
    .reverse()
    .sort((a, b) => b.date.localeCompare(a.date))

  const total = (list: Spend[]) => list.reduce((sum, s) => sum + s.amount, 0)
  const spent = total(entries)
  const spentToday = status === 'current' ? total(entries.filter((s) => s.date === todayKey)) : 0

  const days = daysInMonth(month)
  const dayOfMonth = status === 'current' ? today.getDate() : status === 'past' ? days : 0
  const daysLeft = status === 'current' ? days - dayOfMonth + 1 : status === 'future' ? days : 0

  const todayBudget = daysLeft > 0 ? Math.max(0, budget - (spent - spentToday)) / daysLeft : 0
  // What a perfectly even pace would have spent by the end of today.
  const expectedByNow = (budget * dayOfMonth) / days

  return {
    month,
    status,
    budget,
    spent,
    remaining: budget - spent,
    spentToday,
    todayBudget,
    todayLeft: todayBudget - spentToday,
    days,
    dayOfMonth,
    daysLeft,
    expectedByNow,
    /** Positive when spending runs ahead of the even pace. */
    overPace: spent - expectedByNow,
    entries,
    byCategory: groupBy(
      entries,
      (s) => s.category,
      (s) => s.amount,
    ),
  }
}

export type PersonalMonth = ReturnType<typeof personalMonth>

/** Groups (already sorted) entries by day, keeping order. */
export function groupByDay(entries: Spend[]) {
  const days: { date: string; total: number; entries: Spend[] }[] = []
  for (const s of entries) {
    const last = days.at(-1)
    if (last?.date === s.date) {
      last.entries.push(s)
      last.total += s.amount
    } else days.push({ date: s.date, total: s.amount, entries: [s] })
  }
  return days
}
