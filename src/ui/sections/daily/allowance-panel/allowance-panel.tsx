import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PersonalMonth } from '../../../../domain/spending'
import { cx } from '../../../cx'
import { money, monthName, plural } from '../../../format'
import { AnimatedNumber } from '../../../components/animated-number/animated-number'
import { Button, IconButton } from '../../../components/primitives/button'
import { Panel } from '../../../components/primitives/panel'
import styles from './allowance-panel.module.css'

interface Props {
  month: PersonalMonth
  onShiftMonth: (delta: number) => void
  onAdjustBudget: () => void
}

function paceMessage(m: PersonalMonth) {
  if (m.remaining < 0) return { tone: 'over', text: `Te has pasado ${money(-m.remaining)} de tu presupuesto para ti.` } as const
  if (m.status === 'past') return { tone: 'good', text: `Cerraste el mes con ${money(m.remaining)} sin gastar.` } as const
  if (m.status === 'future') return { tone: 'neutral', text: 'Este mes aún no ha empezado.' } as const
  // A 5 % tolerance avoids warning over a single coffee.
  if (m.overPace > m.budget * 0.05)
    return { tone: 'warn', text: `Vas ${money(m.overPace)} por encima del ritmo. Si gastas menos estos días, llegarás a fin de mes.` } as const
  if (m.overPace < -m.budget * 0.05) return { tone: 'good', text: `Vas bien: llevas ${money(-m.overPace)} menos de lo previsto a estas alturas.` } as const
  return { tone: 'good', text: 'Vas al ritmo previsto para llegar a fin de mes.' } as const
}

export function AllowancePanel({ month: m, onShiftMonth, onAdjustBudget }: Props) {
  const used = m.budget > 0 ? (m.spent / m.budget) * 100 : m.spent > 0 ? 100 : 0
  const pace = m.budget > 0 ? (m.expectedByNow / m.budget) * 100 : 0
  const message = paceMessage(m)
  const over = m.remaining < 0

  return (
    <Panel tone='feature' labelledBy='allowance-title' className={styles.panel}>
      <header className={styles.monthSwitch}>
        <IconButton aria-label='Mes anterior' onClick={() => onShiftMonth(-1)}>
          <ChevronLeft size={18} />
        </IconButton>
        <h2 id='allowance-title'>{monthName(m.month)}</h2>
        <IconButton aria-label='Mes siguiente' disabled={m.status !== 'past'} onClick={() => onShiftMonth(1)}>
          <ChevronRight size={18} />
        </IconButton>
      </header>

      {m.budget === 0 ? (
        <div className={styles.empty}>
          <p>
            Tu parte <strong>Para ti</strong> es de 0 € al mes, así que cualquier gasto personal sale de otros objetivos.
          </p>
          <Button onClick={onAdjustBudget}>Ajustar el reparto</Button>
        </div>
      ) : (
        <div className={styles.figures}>
          <div className={styles.main}>
            <span>{m.status === 'past' ? 'Te sobró' : 'Te queda este mes'}</span>
            <strong className={cx(styles.remaining, over && 'is-negative')}>
              <AnimatedNumber value={m.remaining} />
            </strong>
            <span>
              de {money(m.budget)} para ti
              {m.status === 'current' && `, con ${plural(m.daysLeft, 'día', 'días')} por delante`}
            </span>
          </div>
          {m.status === 'current' && (
            <div className={cx(styles.today, m.todayLeft < 0 && styles.isOver)}>
              <span>{m.todayLeft < 0 ? 'Hoy te has pasado' : 'Hoy puedes gastar'}</span>
              <strong>
                <AnimatedNumber value={Math.abs(m.todayLeft)} />
              </strong>
              <span>{m.spentToday > 0 ? `Llevas ${money(m.spentToday)} hoy` : 'Aún no has gastado nada hoy'}</span>
            </div>
          )}
        </div>
      )}

      <div
        className={styles.gauge}
        role='meter'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(used)}
        aria-label='Parte del presupuesto para ti ya gastada'
      >
        <motion.span
          className={cx(styles.fill, over && styles.fillOver)}
          initial={false}
          animate={{ width: `${Math.min(100, used)}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        />
        {m.status === 'current' && m.budget > 0 && (
          <span className={styles.pace} style={{ left: `${Math.min(100, pace)}%` }}>
            <span>Ritmo de hoy</span>
          </span>
        )}
      </div>
      <div className={styles.caption}>
        <span>Gastado {money(m.spent)}</span>
        <span className='tabular'>{Math.round(used)} %</span>
      </div>

      {m.budget > 0 && <p className={cx(styles.message, styles[message.tone])}>{message.text}</p>}
    </Panel>
  )
}
