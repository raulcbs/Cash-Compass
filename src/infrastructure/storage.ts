import { emptyPlan } from '../domain/finance'
import type { Plan } from '../domain/types'
import { validatePlan } from '../domain/validation'

export const STORAGE_KEY = 'cash-compass-plan-v1'

export interface InitialLoad {
  plan: Plan
  error: string
}

export function loadPlan(): InitialLoad {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return { plan: raw ? validatePlan(JSON.parse(raw)) : emptyPlan(), error: '' }
  } catch {
    return {
      plan: emptyPlan(),
      error:
        'No se pudieron recuperar los datos guardados. Puedes importar una copia de seguridad; los datos anteriores no se sobrescribirán hasta que hagas un cambio.',
    }
  }
}

/** Returns false when the browser refuses to persist (quota, private mode…). */
export function savePlan(plan: Plan): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
    return true
  } catch {
    return false
  }
}
