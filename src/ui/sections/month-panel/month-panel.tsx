import { AnimatePresence, motion } from 'motion/react'
import type { CSSProperties } from 'react'
import type { PlanStore } from '../../../application/use-plan'
import { cx } from '../../cx'
import { money, percent, wholeMoney } from '../../format'
import { AnimatedNumber } from '../../components/animated-number/animated-number'
import { Panel } from '../../components/primitives/panel'
import { Pill } from '../../components/primitives/pill'
import { Terraces, type Terrace } from '../../components/terraces/terraces'
import styles from './month-panel.module.css'

interface Row extends Terrace {
  /** Savings and investment are already rounded to the plan's rounding step. */
  rounded: boolean
}

export function MonthPanel({ store }: { store: PlanStore }) {
  const r = store.summary
  const rows: Row[] = [
    { label: 'Gastos', value: r.expenses, color: 'var(--stone)', rounded: false },
    { label: 'Para ti', value: r.personal, color: 'var(--orange)', rounded: false },
    { label: 'Al fondo', value: r.savings, color: 'var(--rice)', rounded: true },
    { label: 'Inversión', value: r.investment, color: 'var(--crop)', rounded: true },
  ]
  const deficit = r.remaining < 0
  const describe = rows.map((x) => `${x.label} ${money(x.value)}`).join(', ')

  return (
    <Panel tone='hero' title='Hacia dónde va tu mes' aside={<Pill tone='primary'>Mensual</Pill>}>
      <div className={styles.body}>
        <div className={styles.layout}>
          <div className={styles.field}>
            <div className={styles.source}>
              <span>Ingresos netos</span>
              <strong>
                <AnimatedNumber value={r.income} />
              </strong>
            </div>
            <Terraces
              terraces={rows}
              income={r.income}
              deficit={Math.max(0, r.expenses - r.income)}
              ariaLabel={`Reparto mensual de ${money(r.income)}: ${describe}${deficit ? `, déficit ${money(-r.remaining)}` : ''}`}
            />
          </div>

          <div className={styles.breakdown}>
            <ul className={styles.rows}>
              {rows.map((x) => (
                <li key={x.label} style={{ '--tone': x.color } as CSSProperties}>
                  <span className={styles.label}>
                    <i aria-hidden />
                    {x.label}
                  </span>
                  <span className={styles.share}>{r.income > 0 ? percent((x.value / r.income) * 100) : '—'}</span>
                  <strong className={styles.amount}>
                    <AnimatedNumber value={x.value} format={x.rounded ? wholeMoney : money} />
                  </strong>
                </li>
              ))}
            </ul>
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
                    Tus gastos superan tus ingresos. Los bancales muestran asignaciones, no dinero disponible.
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
