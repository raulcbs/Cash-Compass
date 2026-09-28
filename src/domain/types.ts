export type Frequency = 'monthly' | 'annual'
export type ExpenseKind = 'fixed' | 'variable'

export interface Income {
  id: string
  name: string
  amount: number
  frequency: Frequency
}

export interface Expense {
  id: string
  name: string
  amount: number
  frequency: Frequency
  kind: ExpenseKind
  category: string
  essential: boolean
}

export interface Asset {
  id: string
  name: string
  category: string
  value: number
  cost: number
}

export interface Settings {
  /** % of the surplus that is always reserved for personal spending. */
  personalSplit: number
  /** % of the remainder sent to the emergency fund while it is incomplete. */
  savingsSplit: number
  liquidSavings: number
  emergencyMonths: number
  /** Effective annual return, in percent. */
  annualReturn: number
  horizonYears: number
}

/** A day-to-day purchase paid from the personal ("Para ti") budget. */
export interface Spend {
  id: string
  amount: number
  category: string
  note: string
  /** Local calendar day, YYYY-MM-DD. */
  date: string
}

export interface Plan {
  version: 1
  isDemo?: boolean
  incomes: Income[]
  expenses: Expense[]
  assets: Asset[]
  spending: Spend[]
  settings: Settings
}

export type Collection = 'incomes' | 'expenses' | 'assets'
export type Entry<C extends Collection> = Plan[C][number]

export const EXPENSE_CATEGORIES = ['Vivienda', 'Alimentación', 'Suministros', 'Transporte', 'Seguros', 'Deudas', 'Salud', 'Ocio', 'Otros'] as const
export const ASSET_CATEGORIES = ['Fondos', 'Acciones', 'Renta fija', 'Criptoactivos', 'Otros'] as const
export const SPEND_CATEGORIES = ['Comer fuera', 'Compras', 'Ocio', 'Caprichos', 'Transporte', 'Otros'] as const
export const MAX_ENTRIES = 1000
export const MAX_SPENDS = 10000
