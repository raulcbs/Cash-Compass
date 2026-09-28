import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PersonalMonth } from '../../../domain/spending'
import { AnimatedNumber } from '../../components/animated-number'
import { money, monthName, plural } from '../../format'

interface Props {
  month: PersonalMonth
  onShiftMonth: (delta: number) => void
  onAdjustBudget: () => void
}

function paceMessage(m: PersonalMonth) {
  if (m.remaining < 0) return { tone: 'over', text: `Te has pasado ${money(-m.remaining)} de tu presupuesto para ti.` }
  if (m.status === 'past') return { tone: 'good', text: `Cerraste el mes con ${money(m.remaining)} sin gastar.` }
  if (m.status === 'future') return { tone: 'neutral', text: 'Este mes aún no ha empezado.' }
  // A 5 % tolerance avoids warning over a single coffee.
  if (m.overPace > m.budget * 0.05)
    return { tone: 'warn', text: `Vas ${money(m.overPace)} por encima del ritmo. Si gastas menos estos días, llegarás a fin de mes.` }
  if (m.overPace < -m.budget * 0.05) return { tone: 'good', text: `Vas bien: llevas ${money(-m.overPace)} menos de lo previsto a estas alturas.` }
  return { tone: 'good', text: 'Vas al ritmo previsto para llegar a fin de mes.' }
}

export function AllowancePanel({ month: m, onShiftMonth, onAdjustBudget }: Props) {
  const used = m.budget > 0 ? (m.spent / m.budget) * 100 : m.spent > 0 ? 100 : 0
  const pace = m.budget > 0 ? (m.expectedByNow / m.budget) * 100 : 0
  const message = paceMessage(m)
  const over = m.remaining < 0

  return (
    <section className='panel allowance' aria-labelledby='allowance-title'>
      <header className='month-switch'>
        <button className='icon-button' aria-label='Mes anterior' onClick={() => onShiftMonth(-1)}>
          <ChevronLeft size={18} />
        </button>
        <h2 id='allowance-title'>{monthName(m.month)}</h2>
        <button className='icon-button' aria-label='Mes siguiente' disabled={m.status !== 'past'} onClick={() => onShiftMonth(1)}>
          <ChevronRight size={18} />
        </button>
      </header>

      {m.budget === 0 ? (
        <div className='allowance-empty'>
          <p>
            Tu parte <strong>Para ti</strong> es de 0 € al mes, así que cualquier gasto personal sale de otros objetivos.
          </p>
          <button className='button' onClick={onAdjustBudget}>
            Ajustar el reparto
          </button>
        </div>
      ) : (
        <div className='allowance-figures'>
          <div className='allowance-main'>
            <small>{m.status === 'past' ? 'Te sobró' : 'Te queda este mes'}</small>
            <strong className={over ? 'is-negative' : undefined}>
              <AnimatedNumber value={m.remaining} />
            </strong>
            <span>
              de {money(m.budget)} para ti
              {m.status === 'current' && ` · ${plural(m.daysLeft, 'día', 'días')} por delante`}
            </span>
          </div>
          {m.status === 'current' && (
            <div className={m.todayLeft < 0 ? 'allowance-today is-over' : 'allowance-today'}>
              <small>{m.todayLeft < 0 ? 'Hoy te has pasado' : 'Hoy puedes gastar'}</small>
              <strong>
                <AnimatedNumber value={Math.abs(m.todayLeft)} />
              </strong>
              <span>{m.spentToday > 0 ? `Llevas ${money(m.spentToday)} hoy` : 'Aún no has gastado nada hoy'}</span>
            </div>
          )}
        </div>
      )}

      <div
        className='gauge'
        role='meter'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(used)}
        aria-label='Parte del presupuesto para ti ya gastada'
      >
        <motion.span
          className={over ? 'gauge-fill is-over' : 'gauge-fill'}
          initial={false}
          animate={{ width: `${Math.min(100, used)}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        />
        {m.status === 'current' && m.budget > 0 && (
          <span className='gauge-pace' style={{ left: `${Math.min(100, pace)}%` }}>
            <span>Ritmo de hoy</span>
          </span>
        )}
      </div>
      <div className='gauge-caption'>
        <span>Gastado {money(m.spent)}</span>
        <span className='tabular'>{Math.round(used)} %</span>
      </div>

      {m.budget > 0 && <p className={`pace-message tone-${message.tone}`}>{message.text}</p>}
    </section>
  )
}
