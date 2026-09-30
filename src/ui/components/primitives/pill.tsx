import type { ReactNode } from 'react'
import { cx } from '../../cx'
import styles from './pill.module.css'

export type PillTone = 'primary' | 'neutral' | 'stone' | 'orange' | 'rice' | 'crop'

export function Pill({ tone = 'primary', children }: { tone?: PillTone; children: ReactNode }) {
  return <span className={cx(styles.pill, styles[tone])}>{children}</span>
}
