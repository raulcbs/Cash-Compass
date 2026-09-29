import { describe, expect, test } from 'vitest'
import { daysInMonth, isDateKey, shiftMonth, toDateKey } from './dates'
import { demoPlan } from './finance'
import { groupByDay, personalMonth } from './spending'
import type { Spend } from './types'
import { validatePlan } from './validation'

const near = (actual: number, expected: number) => expect(Math.abs(actual - expected)).toBeLessThan(1e-9)
const spend = (id: string, date: string, amount: number): Spend => ({ id, date, amount, category: 'Comer fuera', note: '' })

// Demo plan rounded to whole euros: "Para ti" budget = 429 €/month. Today: 10 September 2026 (30-day month).
const today = new Date(2026, 8, 10, 22, 30)
const plan = () => {
  const p = demoPlan(today)
  p.settings.roundingStep = 1
  p.spending = [spend('a', '2026-08-31', 100), spend('b', '2026-09-01', 30), spend('c', '2026-09-05', 50), spend('d', '2026-09-10', 20)]
  return p
}

describe('personalMonth', () => {
  test('current month tracks what is left of the personal budget', () => {
    const m = personalMonth(plan(), '2026-09', today)
    expect(m.status).toBe('current')
    expect(m.budget).toBe(429)
    expect(m.spent).toBe(100)
    expect(m.remaining).toBe(329)
    expect(m.spentToday).toBe(20)
    expect(m.daysLeft).toBe(21)
  })

  test('daily allowance spreads what was left at the start of today over the remaining days', () => {
    const m = personalMonth(plan(), '2026-09', today)
    near(m.todayBudget, (429 - 80) / 21)
    near(m.todayLeft, (429 - 80) / 21 - 20)
  })

  test('pace compares spending with an even split of the budget', () => {
    const m = personalMonth(plan(), '2026-09', today)
    expect(m.expectedByNow).toBe(143)
    expect(m.overPace).toBe(-43)
  })

  test('overspending leaves no allowance and a negative remainder', () => {
    const p = plan()
    p.spending.push(spend('e', '2026-09-02', 500))
    const m = personalMonth(p, '2026-09', today)
    expect(m.remaining).toBe(-171)
    expect(m.todayBudget).toBe(0)
    expect(m.todayLeft).toBe(-20)
  })

  test('past months are closed and future months are untouched', () => {
    const past = personalMonth(plan(), '2026-08', today)
    expect(past.status).toBe('past')
    expect(past.spent).toBe(100)
    expect(past.daysLeft).toBe(0)
    expect(past.todayBudget).toBe(0)
    const future = personalMonth(plan(), '2026-10', today)
    expect(future.status).toBe('future')
    expect(future.daysLeft).toBe(31)
    expect(future.spent).toBe(0)
  })

  test('entries are newest first, including within the same day', () => {
    const p = plan()
    p.spending.push(spend('later', '2026-09-10', 5))
    expect(personalMonth(p, '2026-09', today).entries.map((s) => s.id)).toEqual(['later', 'd', 'c', 'b'])
  })

  test('without a personal budget every purchase is over budget', () => {
    const p = plan()
    p.settings.personalSplit = 0
    const m = personalMonth(p, '2026-09', today)
    expect(m.budget).toBe(0)
    expect(m.remaining).toBe(-100)
    expect(m.todayBudget).toBe(0)
  })
})

test('groupByDay keeps order and sums each day', () => {
  const days = groupByDay([spend('x', '2026-09-10', 5), spend('y', '2026-09-10', 20), spend('z', '2026-09-05', 50)])
  expect(days.map((d) => [d.date, d.total, d.entries.length])).toEqual([
    ['2026-09-10', 25, 2],
    ['2026-09-05', 50, 1],
  ])
})

describe('dates', () => {
  test('date keys use the local calendar day', () => {
    expect(toDateKey(new Date(2026, 8, 10, 23, 59))).toBe('2026-09-10')
  })
  test('rejects impossible dates', () => {
    expect(isDateKey('2026-02-30')).toBe(false)
    expect(isDateKey('2026-2-3')).toBe(false)
    expect(isDateKey('2024-02-29')).toBe(true)
  })
  test('month helpers handle leap years and year boundaries', () => {
    expect(daysInMonth('2024-02')).toBe(29)
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
  })
})

describe('spending persistence', () => {
  test('demo purchases never fall outside the current month', () => {
    const p = demoPlan(new Date(2026, 8, 3))
    expect(p.spending.every((s) => s.date >= '2026-09-01' && s.date <= '2026-09-03')).toBe(true)
    expect(p.spending).toHaveLength(3)
  })

  test('plans saved before day-to-day tracking get an empty list', () => {
    const p = demoPlan(today) as unknown as Record<string, unknown>
    delete p.spending
    expect(validatePlan(p).spending).toEqual([])
  })

  test('imports reject invalid purchases and round amounts to cents', () => {
    const p = plan()
    p.spending[0]!.amount = 12.345
    expect(validatePlan(p).spending[0]!.amount).toBe(12.35)
    p.spending[0]!.date = '2026-02-30'
    expect(() => validatePlan(p)).toThrow()
    p.spending[0]!.date = '2026-08-31'
    p.spending[0]!.amount = 0
    expect(() => validatePlan(p)).toThrow()
  })
})
