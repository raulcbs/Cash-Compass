import type { ReactNode } from 'react'
import { cx } from '../../cx'
import styles from './legend.module.css'

export interface LegendItem {
  label: string
  color: string
  value: ReactNode
  /** Highlights the row (for example the segment the compass needle points at). */
  emphasis?: boolean
}

/** A color key with a value on the right. */
export function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cx(styles.legend, className)}>
      {items.map((item) => (
        <li key={item.label} className={cx(item.emphasis && styles.emphasis)}>
          <span>
            <i style={{ background: item.color }} />
            {item.label}
          </span>
          <strong className='tabular'>{item.value}</strong>
        </li>
      ))}
    </ul>
  )
}
