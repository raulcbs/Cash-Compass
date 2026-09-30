import type { ReactNode } from 'react'
import { Bar } from './bar'
import styles from './bar-list.module.css'

export interface BarListItem {
  label: string
  /** Bar length, 0 to 100. */
  percent: number
  color?: string
  value: ReactNode
}

/** Ranked rows: label, proportional bar, amount. The bar drops under the label on phones. */
export function BarList({ items }: { items: BarListItem[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.label}>
          <span>{item.label}</span>
          <Bar percent={item.percent} color={item.color} />
          <strong className='tabular'>{item.value}</strong>
        </li>
      ))}
    </ul>
  )
}
