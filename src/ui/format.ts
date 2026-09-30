const moneyFormat = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })
const compactMoneyFormat = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const percentFormat = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 })

export const money = (n: number) => moneyFormat.format(n)
export const wholeMoney = (n: number) => compactMoneyFormat.format(n)
export const percent = (n: number) => `${percentFormat.format(n)} %`
const monthFormat = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
const dayFormat = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

/** "septiembre de 2026" from "2026-09". */
export const monthName = (month: string) => monthFormat.format(new Date(`${month}-01T12:00:00`))
/** "lunes, 7 de septiembre" from "2026-09-07". */
export const dayName = (date: string) => dayFormat.format(new Date(`${date}T12:00:00`))

/** Parses "12", "12,5" or "12.50" into a positive amount; null otherwise. */
export function parseAmount(text: string) {
  const clean = text.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null
  const value = Number(clean)
  return value > 0 && value <= 1e9 ? value : null
}

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
