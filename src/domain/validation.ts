import { isDateKey } from './dates'
import { MAX_ENTRIES, MAX_SPENDS, type Plan } from './types'

export class PlanValidationError extends Error {}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const finite = (v: unknown, max = 1e12): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max
export const cents = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100

/**
 * Validates untrusted data (localStorage or an imported file) and normalizes
 * monetary values to cents. Throws PlanValidationError with a user-facing message.
 */
export function validatePlan(input: unknown): Plan {
  const fail = (message: string): never => {
    throw new PlanValidationError(message)
  }
  if (
    !isRecord(input) ||
    input.version !== 1 ||
    !Array.isArray(input.incomes) ||
    !Array.isArray(input.expenses) ||
    !Array.isArray(input.assets) ||
    !isRecord(input.settings)
  ) {
    fail('El archivo no tiene el formato de Cash Compass.')
  }
  const p = input as Record<string, unknown[]> & { settings: Record<string, unknown> }

  for (const key of ['incomes', 'expenses', 'assets'] as const) {
    const list = p[key]!
    if (list.length > MAX_ENTRIES) fail('El archivo contiene demasiadas entradas.')
    const ids = new Set<string>()
    for (const x of list) {
      if (!isRecord(x) || typeof x.id !== 'string' || ids.has(x.id) || typeof x.name !== 'string' || !x.name.trim() || x.name.length > 120) {
        fail('Hay entradas no válidas o duplicadas.')
      }
      const entry = x as Record<string, unknown>
      ids.add(entry.id as string)
      if (key === 'assets') {
        if (!finite(entry.value) || !finite(entry.cost) || typeof entry.category !== 'string') fail('Hay activos no válidos.')
        entry.value = cents(entry.value as number)
        entry.cost = cents(entry.cost as number)
      } else {
        const invalidExpense =
          key === 'expenses' &&
          (typeof entry.essential !== 'boolean' || !['fixed', 'variable'].includes(entry.kind as string) || typeof entry.category !== 'string')
        if (!finite(entry.amount) || !['monthly', 'annual'].includes(entry.frequency as string) || invalidExpense) fail('Hay importes o gastos no válidos.')
        entry.amount = cents(entry.amount as number)
      }
    }
  }

  // Plans saved before day-to-day tracking have no spending list.
  const spending = (input as Record<string, unknown>).spending ?? []
  if (!Array.isArray(spending) || spending.length > MAX_SPENDS) fail('Hay gastos del día a día no válidos.')
  const spendIds = new Set<string>()
  for (const x of spending as unknown[]) {
    const valid =
      isRecord(x) &&
      typeof x.id === 'string' &&
      !spendIds.has(x.id) &&
      finite(x.amount) &&
      x.amount > 0 &&
      typeof x.category === 'string' &&
      typeof x.note === 'string' &&
      x.note.length <= 120 &&
      isDateKey(x.date)
    if (!valid) fail('Hay gastos del día a día no válidos.')
    const entry = x as Record<string, unknown>
    spendIds.add(entry.id as string)
    entry.amount = cents(entry.amount as number)
  }
  ;(input as Record<string, unknown>).spending = spending

  const s = p.settings
  // Plans saved before automatic allocation lack these splits.
  s.savingsSplit ??= 70
  s.personalSplit ??= 30
  if (!finite(s.liquidSavings)) fail('Hay ajustes no válidos.')
  s.liquidSavings = cents(s.liquidSavings as number)
  const int = (v: unknown, min: number, max: number) => Number.isInteger(v) && (v as number) >= min && (v as number) <= max
  const validReturn = typeof s.annualReturn === 'number' && Number.isFinite(s.annualReturn) && s.annualReturn > -100 && s.annualReturn <= 100
  if (!finite(s.personalSplit, 100) || !finite(s.savingsSplit, 100) || !int(s.emergencyMonths, 1, 24) || !int(s.horizonYears, 1, 50) || !validReturn) {
    fail('Los ajustes están fuera de los límites permitidos.')
  }
  return input as unknown as Plan
}
