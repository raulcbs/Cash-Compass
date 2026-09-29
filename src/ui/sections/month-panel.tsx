import { AnimatePresence, motion } from 'motion/react'
import type { PlanStore } from '../../application/use-plan'
import { AnimatedNumber } from '../components/animated-number'
import { CompassDial, type DialSegment } from '../components/compass-dial'
import { Panel } from '../components/primitives'
import { money, wholeMoney } from '../format'

const HEADING = 'Inversión'
/** Segments already rounded by the plan's rounding step. */
const ROUNDED = new Set(['Al fondo', HEADING])

export function MonthPanel({ store }: { store: PlanStore }) {
  const r = store.summary
  const segments: DialSegment[] = [
    { label: 'Gastos', value: r.expenses, color: 'var(--slate)' },
    { label: 'Al fondo', value: r.savings, color: 'var(--sea)' },
    { label: HEADING, value: r.investment, color: 'var(--blue)' },
    { label: 'Para ti', value: r.personal, color: 'var(--plum)' },
    { label: 'Sin asignar', value: Math.max(0, r.remaining), color: 'var(--line-strong)' },
  ]
  const deficit = r.remaining < 0

  return (
    <Panel title='Hacia dónde va tu mes' className='month' aside={<span className='pill neutral'>Mensual</span>}>
      <div className='month-body'>
        <CompassDial
          segments={segments}
          heading={HEADING}
          centerLabel='Ingresos netos'
          centerValue={r.income}
          ariaLabel={`Reparto mensual: ${segments.map((s) => `${s.label} ${money(s.value)}`).join(', ')}`}
        />
        <ul className='legend'>
          {segments.map((s) => (
            <li key={s.label} className={s.label === HEADING ? 'is-heading' : undefined}>
              <span>
                <i style={{ background: s.color }} />
                {s.label}
              </span>
              <strong className='tabular'>{ROUNDED.has(s.label) ? wholeMoney(s.value) : money(s.value)}</strong>
            </li>
          ))}
        </ul>
      </div>
      <div className={deficit ? 'balance deficit' : 'balance'}>
        <span>{deficit ? 'Déficit del plan' : 'Margen libre'}</span>
        <strong>
          <AnimatedNumber value={r.remaining} />
        </strong>
      </div>
      <AnimatePresence>
        {deficit && (
          <motion.p className='warning-text' initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            Tus gastos superan tus ingresos. El dial muestra asignaciones, no dinero disponible.
          </motion.p>
        )}
      </AnimatePresence>
    </Panel>
  )
}
