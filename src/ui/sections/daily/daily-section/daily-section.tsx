import { AnimatePresence, motion } from 'motion/react'
import { Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { PlanStore } from '../../../../application/use-plan'
import { monthOf, shiftMonth, toDateKey } from '../../../../domain/dates'
import { personalMonth } from '../../../../domain/spending'
import type { Spend } from '../../../../domain/types'
import { money, percent } from '../../../format'
import { BarList } from '../../../components/primitives/bar-list'
import { TextButton } from '../../../components/primitives/button'
import { Empty } from '../../../components/primitives/empty'
import { Panel } from '../../../components/primitives/panel'
import { Footnote } from '../../../components/primitives/text'
import { AllowancePanel } from '../allowance-panel/allowance-panel'
import { categoryStyle } from '../categories'
import { QuickAdd } from '../quick-add/quick-add'
import { SpendHistory } from '../spend-history/spend-history'
import styles from './daily-section.module.css'

type Removed = ReturnType<PlanStore['removeSpend']>

export function DailySection({ store, onAdjustBudget }: { store: PlanStore; onAdjustBudget: () => void }) {
  const [month, setMonth] = useState(() => monthOf(toDateKey(new Date())))
  const [removed, setRemoved] = useState<Removed | null>(null)
  const m = personalMonth(store.plan, month, new Date())

  // The undo offer disappears on its own after a few seconds.
  useEffect(() => {
    if (!removed) return
    const timer = setTimeout(() => setRemoved(null), 6000)
    return () => clearTimeout(timer)
  }, [removed])

  const add = (spend: Spend) => {
    const ok = store.addSpend(spend)
    // Show the month the purchase landed in, so it never "disappears".
    if (ok) setMonth(monthOf(spend.date))
    return ok
  }

  return (
    <div className={styles.grid}>
      <div className={styles.allowance}>
        <AllowancePanel month={m} onShiftMonth={(delta) => setMonth((current) => shiftMonth(current, delta))} onAdjustBudget={onAdjustBudget} />
      </div>
      <div className={styles.add}>
        <QuickAdd onAdd={add} />
      </div>
      <div className={styles.history}>
        <SpendHistory entries={m.entries} onDelete={(s) => setRemoved(store.removeSpend(s.id))} />
      </div>
      <div className={styles.categories}>
        <Panel title='En qué se va' accent='orange'>
          {!m.byCategory.length ? (
            <Empty text='Cuando anotes gastos verás aquí qué categorías pesan más.' />
          ) : (
            <BarList
              items={m.byCategory.map(([name, value]) => ({
                label: name,
                percent: (value / Math.max(m.spent, 1)) * 100,
                color: categoryStyle(name).color,
                value: (
                  <>
                    {m.budget > 0 && <small>{percent((value / m.budget) * 100)}</small>}
                    {money(value)}
                  </>
                ),
              }))}
            />
          )}
          <Footnote>
            El presupuesto es tu parte «Para ti» del reparto actual. Si cambias ingresos, gastos o porcentajes, los meses anteriores se recalculan con él.
          </Footnote>
        </Panel>
      </div>

      <AnimatePresence>
        {removed && (
          <motion.div className={styles.toast} role='status' initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}>
            <span>
              Eliminado: {removed.spend.note || removed.spend.category}, {money(removed.spend.amount)}
            </span>
            <TextButton
              tone='inverse'
              onClick={() => {
                store.restoreSpend(removed)
                setRemoved(null)
              }}
            >
              <Undo2 size={15} aria-hidden /> Deshacer
            </TextButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
