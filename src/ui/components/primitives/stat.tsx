import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../cx'
import { AnimatedNumber } from '../animated-number/animated-number'
import styles from './stat.module.css'

/** Each figure takes the colour of the priority it belongs to; water is income and neutral totals. */
export type StatTone = 'water' | 'stone' | 'orange' | 'rice' | 'crop'

const TONE: Record<StatTone, string> = {
  water: 'var(--primary)',
  stone: 'var(--stone)',
  orange: 'var(--orange)',
  rice: 'var(--rice)',
  crop: 'var(--crop)',
}

interface StatProps {
  label: string
  value: number
  note: string
  tone: StatTone
}

/** A headline figure inside a stat strip: a short channel of its colour, the label, the figure, a quiet note. */
export function Stat({ label, value, note, tone }: StatProps) {
  return (
    <div className={styles.stat} style={{ '--tone': TONE[tone] } as CSSProperties}>
      <span className={styles.label}>{label}</span>
      <strong className={cx(styles.value, value < 0 && 'is-negative')}>
        <AnimatedNumber value={value} />
      </strong>
      <small className={styles.note}>{note}</small>
    </div>
  )
}

/** One stone strip holding three or four figures, split by thin grooves rather than separate cards. */
export function StatGrid({ columns = 4, children }: { columns?: 2 | 3 | 4; children: ReactNode }) {
  return <div className={cx(styles.grid, columns === 3 && styles.three, columns === 2 && styles.two)}>{children}</div>
}
