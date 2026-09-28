import { AnimatePresence, motion } from 'motion/react'
import { Trash2 } from 'lucide-react'
import { addDays, toDateKey } from '../../../domain/dates'
import { groupByDay } from '../../../domain/spending'
import type { Spend } from '../../../domain/types'
import { Empty, Panel } from '../../components/primitives'
import { dayName, money, plural } from '../../format'
import { categoryStyle } from './categories'

interface Props {
  entries: Spend[]
  onDelete: (spend: Spend) => void
}

function dayLabel(date: string) {
  const today = new Date()
  if (date === toDateKey(today)) return 'Hoy'
  if (date === toDateKey(addDays(today, -1))) return 'Ayer'
  return dayName(date)
}

export function SpendHistory({ entries, onDelete }: Props) {
  const days = groupByDay(entries)
  return (
    <Panel title='Movimientos' className='history' aside={<span className='pill neutral'>{plural(entries.length, 'gasto', 'gastos')}</span>}>
      {!entries.length ? (
        <Empty text='Todavía no hay gastos anotados este mes.' />
      ) : (
        <div className='history-days'>
          <AnimatePresence initial={false}>
            {days.map((day) => (
              <motion.section key={day.date} layout className='history-day' exit={{ opacity: 0 }} aria-label={dayLabel(day.date)}>
                <h3>
                  <span>{dayLabel(day.date)}</span>
                  <span className='tabular'>{money(day.total)}</span>
                </h3>
                <ul>
                  <AnimatePresence initial={false}>
                    {day.entries.map((s) => {
                      const { icon: Icon, color } = categoryStyle(s.category)
                      return (
                        <motion.li
                          key={s.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                        >
                          <span className='spend-icon' style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }} aria-hidden>
                            <Icon size={16} />
                          </span>
                          <span className='spend-text'>
                            <strong>{s.note || s.category}</strong>
                            {s.note && <small>{s.category}</small>}
                          </span>
                          <span className='spend-amount tabular'>{money(s.amount)}</span>
                          <button
                            className='icon-button danger'
                            aria-label={`Eliminar ${s.note || s.category} de ${money(s.amount)}`}
                            onClick={() => onDelete(s)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              </motion.section>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Panel>
  )
}
