// Calendar days are stored as local "YYYY-MM-DD" keys: toISOString() would
// shift late-evening purchases into the next (UTC) day.

const pad = (n: number) => String(n).padStart(2, '0')

export const toDateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const parseDateKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

export function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && toDateKey(parseDateKey(value)) === value
}

/** "YYYY-MM" of a date key. */
export const monthOf = (dateKey: string) => dateKey.slice(0, 7)

export function daysInMonth(month: string) {
  const [y, m] = month.split('-').map(Number)
  return new Date(y!, m!, 0).getDate()
}

export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y!, m! - 1 + delta, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

export const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)
