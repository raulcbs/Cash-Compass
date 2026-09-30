import { AnimatePresence, motion } from 'motion/react'
import { Trash2 } from 'lucide-react'
import { addDays, toDateKey } from '../../../../domain/dates'
import { groupByDay } from '../../../../domain/spending'
import type { Spend } from '../../../../domain/types'
import { dayName, money, plural } from '../../../format'
import { IconButton } from '../../../components/primitives/button'
import { Empty } from '../../../components/primitives/empty'
import { Panel } from '../../../components/primitives/panel'
import { Pill } from '../../../components/primitives/pill'
import { categoryStyle } from '../categories'
import styles from './spend-history.module.css'

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
    <Panel title='Movimientos' accent='orange' aside={<Pill tone='neutral'>{plural(entries.length, 'gasto', 'gastos')}</Pill>}>
      {!entries.length ? (
        <Empty text='Todavía no hay gastos anotados este mes.' />
      ) : (
        <div className={styles.days}>
          <AnimatePresence initial={false}>
            {days.map((day) => (
              <motion.section key={day.date} layout className={styles.day} exit={{ opacity: 0 }} aria-label={dayLabel(day.date)}>
                <h3>
                  <span>{dayLabel(day.date)}</span>
                  <span className='tabular'>{money(day.total)}</span>
                </h3>
                <ul>
                  <AnimatePresence initial={false}>
                    {day.entries.map((s) => {
                      const { icon: Icon, color, ink } = categoryStyle(s.category)
                      return (
                        <motion.li
                          key={s.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                        >
                          <span className={styles.icon} style={{ color: ink, background: `color-mix(in srgb, ${color} 16%, transparent)` }} aria-hidden>
                            <Icon size={16} />
                          </span>
                          <span className={styles.text}>
                            <strong>{s.note || s.category}</strong>
                            {s.note && <small>{s.category}</small>}
                          </span>
                          <span className={styles.amount}>{money(s.amount)}</span>
                          <IconButton tone='danger' aria-label={`Eliminar ${s.note || s.category} de ${money(s.amount)}`} onClick={() => onDelete(s)}>
                            <Trash2 size={15} />
                          </IconButton>
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
