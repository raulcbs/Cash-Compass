import { AnimatePresence, motion } from 'motion/react'
import type { PlanStore } from '../../../application/use-plan'
import { cx } from '../../cx'
import { money, percent, wholeMoney } from '../../format'
import { AnimatedNumber } from '../../components/animated-number/animated-number'
import { CompassDial, type DialSegment } from '../../components/compass-dial/compass-dial'
import { Legend } from '../../components/primitives/legend'
import { Panel } from '../../components/primitives/panel'
import { Pill } from '../../components/primitives/pill'
import styles from './month-panel.module.css'

const HEADING = 'Inversión'
/** Segments already rounded by the plan's rounding step. */
const ROUNDED = new Set(['Al fondo', HEADING])

export function MonthPanel({ store }: { store: PlanStore }) {
  const r = store.summary
  const segments: DialSegment[] = [
    { label: 'Gastos', value: r.expenses, color: 'var(--rose)' },
    { label: 'Al fondo', value: r.savings, color: 'var(--saffron)' },
    { label: HEADING, value: r.investment, color: 'var(--river)' },
    { label: 'Para ti', value: r.personal, color: 'var(--primary)' },
    { label: 'Sin asignar', value: Math.max(0, r.remaining), color: 'color-mix(in srgb, var(--ink) 25%, transparent)' },
  ]
  const deficit = r.remaining < 0

  return (
    <Panel tone='hero' title='Hacia dónde va tu mes' aside={<Pill tone='neutral'>Mensual</Pill>}>
      <div className={styles.body}>
        <div className={styles.layout}>
          <div className={styles.dial}>
            <CompassDial
              segments={segments}
              heading={HEADING}
              centerLabel='Ingresos netos'
              centerValue={r.income}
              ariaLabel={`Reparto mensual: ${segments.map((s) => `${s.label} ${money(s.value)}`).join(', ')}`}
            />
          </div>
          <div className={styles.breakdown}>
            <Legend
              className={styles.legend}
              items={segments.map((s) => ({
                label: s.label,
                color: s.color,
                value: (
                  <>
                    {r.income > 0 && <small>{percent((s.value / r.income) * 100)}</small>}
                    {ROUNDED.has(s.label) ? wholeMoney(s.value) : money(s.value)}
                  </>
                ),
                emphasis: s.label === HEADING,
              }))}
            />
            <div>
              <div className={cx(styles.balance, deficit && styles.deficit)}>
                <span>{deficit ? 'Déficit del plan' : 'Margen libre'}</span>
                <strong>
                  <AnimatedNumber value={r.remaining} />
                </strong>
              </div>
              <AnimatePresence>
                {deficit && (
                  <motion.p
                    className={styles.warning}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    Tus gastos superan tus ingresos. El dial muestra asignaciones, no dinero disponible.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}
