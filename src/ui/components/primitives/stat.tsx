import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from '../../cx'
import { AnimatedNumber } from '../animated-number/animated-number'
import styles from './stat.module.css'

export type StatTone = 'primary' | 'saffron' | 'river' | 'rose'

interface StatProps {
  label: string
  value: number
  note: string
  icon: LucideIcon
  tone: StatTone
}

/** A headline figure: the number leads, label and note stay quiet. */
export function Stat({ label, value, note, icon: Icon, tone }: StatProps) {
  return (
    <div className={styles.stat}>
      <div className={styles.head}>
        <span>{label}</span>
        <span className={cx(styles.icon, styles[tone])} aria-hidden>
          <Icon size={17} />
        </span>
      </div>
      <strong className={cx(styles.value, value < 0 && 'is-negative')}>
        <AnimatedNumber value={value} />
      </strong>
      <small className={styles.note}>{note}</small>
    </div>
  )
}

export function StatGrid({ columns = 4, children }: { columns?: 3 | 4; children: ReactNode }) {
  return <div className={cx(styles.grid, columns === 3 && styles.three)}>{children}</div>
}
