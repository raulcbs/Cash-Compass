import { describe, expect, test } from 'vitest'
import { calculate, demoPlan, emptyPlan, futureValue, monthly, projection } from './finance'
import { ROUNDING_STEPS } from './types'
import { validatePlan } from './validation'

const near = (actual: number, expected: number) => expect(Math.abs(actual - expected)).toBeLessThan(1e-6)

describe('calculate', () => {
  test('zero income has no investment and undefined emergency coverage', () => {
    const r = calculate(emptyPlan())
    expect(r.investment).toBe(0)
    expect(r.investmentPercent).toBe(0)
    expect(r.coverage).toBeNull()
  })

  test('annual expenses are normalized', () => {
    expect(monthly({ amount: 1200, frequency: 'annual' })).toBe(100)
  })

  test('deficits remain visible without creating personal money, savings or investment', () => {
    const p = demoPlan()
    p.incomes = []
    const r = calculate(p)
    expect(r.personal).toBe(0)
    expect(r.savings).toBe(0)
    expect(r.investment).toBe(0)
    expect(r.remaining).toBe(-1670)
    expect(r.deficit).toBe(-1670)
  })

  test('personal share comes first and the rest is split while the fund is incomplete', () => {
    const r = calculate(demoPlan())
    expect(r.surplus).toBe(1430)
    expect(r.allocable).toBe(1001)
    // 700.7 and 300.3 rounded to 10; the personal share absorbs the 1 € left over.
    expect(r.savings).toBe(700)
    expect(r.investment).toBe(300)
    expect(r.personal).toBe(430)
    expect(r.monthsToFund).toBe(5)
    near(r.income, r.expenses + r.personal + r.savings + r.investment + r.remaining)
  })

  test('complete emergency fund invests everything except the personal share', () => {
    const p = demoPlan()
    p.settings.liquidSavings = 9000
    const r = calculate(p)
    expect(r.personal).toBe(430)
    expect(r.savings).toBe(0)
    expect(r.investment).toBe(1000)
    expect(r.investmentAfterFund).toBe(1000)
    expect(r.monthsToFund).toBe(0)
  })

  test('savings are capped at what the fund is missing', () => {
    const p = demoPlan()
    p.settings.liquidSavings = 8500
    const r = calculate(p)
    expect(r.savings).toBe(200)
    expect(r.investment).toBe(800)
    expect(r.monthsToFund).toBe(1)
  })

  test('zero savings split never completes the fund', () => {
    const p = demoPlan()
    p.settings.savingsSplit = 0
    const r = calculate(p)
    expect(r.savings).toBe(0)
    expect(r.investment).toBe(1000)
    expect(r.monthsToFund).toBeNull()
  })
})

describe('rounding', () => {
  test('whole-euro step rounds each amount to the nearest euro', () => {
    const p = demoPlan()
    p.settings.roundingStep = 1
    const r = calculate(p)
    expect(r.savings).toBe(701)
    expect(r.investment).toBe(300)
    expect(r.personal).toBe(429)
  })

  test('rounding never allocates more than the surplus', () => {
    for (const step of ROUNDING_STEPS) {
      for (const personalSplit of [0, 5, 30, 100]) {
        for (const extra of [0, 3.37, 24.99, 48, 126.5]) {
          const p = demoPlan()
          p.incomes.push({ id: 'x', name: 'x', amount: extra, frequency: 'monthly' })
          p.settings = { ...p.settings, roundingStep: step, personalSplit }
          const r = calculate(p)
          expect(r.personal).toBeGreaterThanOrEqual(0)
          expect(r.savings % 1).toBe(0)
          expect(r.investment % step).toBe(0)
          near(r.surplus, r.personal + r.savings + r.investment)
        }
      }
    }
  })

  test('a fund gap smaller than the step is still closed', () => {
    const p = demoPlan()
    p.settings.liquidSavings = 8696.4
    const r = calculate(p)
    expect(r.savings).toBe(4)
    expect(r.monthsToFund).toBe(1)
  })

  test('portfolio profit is value minus cost', () => {
    const r = calculate(demoPlan())
    expect(r.portfolio).toBe(12500)
    expect(r.profit).toBe(1200)
  })
})

describe('projection', () => {
  test('zero return uses deposits with no interest', () => {
    expect(futureValue(1000, 100, 0, 2)).toBe(3400)
  })

  test('effective annual rate and month-end contributions agree with recurrence including negative rates', () => {
    for (const rate of [-50, -5, 5, 50]) {
      let value = 1000
      const m = (1 + rate / 100) ** (1 / 12) - 1
      for (let i = 0; i < 120; i++) value = value * (1 + m) + 100
      expect(Math.abs(futureValue(1000, 100, rate, 10) - value)).toBeLessThan(1e-7)
    }
  })

  test('matches closed form once the fund is complete', () => {
    const p = demoPlan()
    p.settings.liquidSavings = 9000
    near(projection(p).at(-1)!.value, futureValue(12500, 1000, 5, 10))
  })

  test('invests the full rounded allocable amount after the fund is complete', () => {
    near(projection(demoPlan()).at(-1)!.contributed - 12500, 1000 * 120 - 3500)
  })

  test('has one point per year plus today', () => {
    expect(projection(demoPlan())).toHaveLength(11)
  })
})

describe('validatePlan', () => {
  test('rejects invalid imports and duplicate ids', () => {
    const p = demoPlan()
    expect(validatePlan(p)).toBe(p)
    p.settings.annualReturn = -100
    expect(() => validatePlan(p)).toThrow()
    p.settings.annualReturn = 5
    p.incomes.push(p.incomes[0]!)
    expect(() => validatePlan(p)).toThrow()
  })

  test('rejects non-objects', () => {
    expect(() => validatePlan(null)).toThrow()
    expect(() => validatePlan('plan')).toThrow()
    expect(() => validatePlan({ version: 2 })).toThrow()
  })

  test('normalizes imported monetary values to cents', () => {
    const p = demoPlan()
    p.incomes[0]!.amount = 123.456
    p.assets.push({ id: 'asset', name: 'Fondo', category: 'Fondos', value: 12.345, cost: 10.004 })
    p.settings.liquidSavings = 1.005
    const normalized = validatePlan(p)
    expect(normalized.incomes[0]!.amount).toBe(123.46)
    expect(normalized.assets.at(-1)!.value).toBe(12.35)
    expect(normalized.assets.at(-1)!.cost).toBe(10)
    expect(normalized.settings.liquidSavings).toBe(1.01)
  })

  test('plans saved before automatic allocation get the default splits', () => {
    const p = demoPlan() as unknown as { settings: Record<string, unknown> }
    delete p.settings.savingsSplit
    delete p.settings.personalSplit
    Object.assign(p.settings, { investmentPercent: 20, monthlySavings: 200, personalReserve: 300 })
    const s = validatePlan(p).settings
    expect(s.savingsSplit).toBe(70)
    expect(s.personalSplit).toBe(30)
  })

  test('plans saved before rounding get the default step and unknown steps are rejected', () => {
    const p = demoPlan() as unknown as { settings: Record<string, unknown> }
    delete p.settings.roundingStep
    expect(validatePlan(p).settings.roundingStep).toBe(10)
    p.settings.roundingStep = 3
    expect(() => validatePlan(p)).toThrow()
  })
})
