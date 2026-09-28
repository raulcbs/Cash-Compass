import type { Plan } from '../domain/types'
import { PlanValidationError, validatePlan } from '../domain/validation'

const MAX_FILE_BYTES = 2_000_000

export function exportPlan(plan: Plan) {
  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cash-compass-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/** Reads and validates a backup file. Rejects with a user-facing message. */
export async function readBackup(file: File): Promise<Plan> {
  if (file.size > MAX_FILE_BYTES) throw new PlanValidationError('El archivo supera el límite de 2 MB.')
  let data: unknown
  try {
    data = JSON.parse(await file.text())
  } catch {
    throw new PlanValidationError('El archivo no contiene JSON válido.')
  }
  return validatePlan(data)
}
