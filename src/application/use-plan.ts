import { useEffect, useMemo, useRef, useState } from 'react'
import { calculate, demoPlan, emptyPlan } from '../domain/finance'
import { MAX_ENTRIES, type Collection, type Entry, type Plan, type Settings } from '../domain/types'
import { loadPlan, savePlan } from '../infrastructure/storage'

export type SaveStatus = 'saved' | 'error'

export function usePlan() {
  const [initial] = useState(loadPlan)
  const [plan, setPlan] = useState<Plan>(initial.plan)
  const [status, setStatus] = useState<SaveStatus>(initial.error ? 'error' : 'saved')
  const [notice, setNotice] = useState(initial.error)
  // Never overwrite unreadable stored data until the user makes a change.
  const dirty = useRef(false)

  useEffect(() => {
    if (!dirty.current) return
    if (savePlan(plan)) setStatus('saved')
    else {
      setStatus('error')
      setNotice('El navegador no permite guardar los datos. Exporta una copia antes de cerrar.')
    }
  }, [plan])

  const update = (fn: (p: Plan) => Plan) => {
    dirty.current = true
    setPlan(fn)
  }

  const summary = useMemo(() => calculate(plan), [plan])

  return {
    plan,
    summary,
    status,
    notice,
    setNotice,
    setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => update((p) => ({ ...p, settings: { ...p.settings, [key]: value } })),
    /** Inserts or replaces an entry. Returns false when the collection is full. */
    saveEntry: <C extends Collection>(collection: C, entry: Entry<C>) => {
      const list = plan[collection] as Entry<C>[]
      const exists = list.some((x) => x.id === entry.id)
      if (!exists && list.length >= MAX_ENTRIES) {
        setNotice(`El límite es de ${MAX_ENTRIES} entradas por sección. Elimina una antes de añadir otra.`)
        return false
      }
      update((p) => {
        const current = p[collection] as Entry<C>[]
        return { ...p, [collection]: exists ? current.map((x) => (x.id === entry.id ? entry : x)) : [...current, entry] }
      })
      return true
    },
    removeEntry: (collection: Collection, id: string) =>
      update((p) => ({ ...p, [collection]: (p[collection] as { id: string }[]).filter((x) => x.id !== id) })),
    loadDemo: () => update(() => demoPlan()),
    reset: () => update(emptyPlan),
    replace: (next: Plan) => update(() => next),
  }
}

export type PlanStore = ReturnType<typeof usePlan>
