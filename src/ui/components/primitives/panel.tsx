import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from '../../cx'
import styles from './panel.module.css'

export type PanelTone = 'default' | 'feature' | 'hero'

interface Props {
  title?: string
  icon?: LucideIcon
  aside?: ReactNode
  /** default: quiet card. feature: tinted, larger radius. hero: the deep pine surface with the leaf shape. */
  tone?: PanelTone
  labelledBy?: string
  className?: string
  children: ReactNode
}

export function Panel({ title, icon: Icon, aside, tone = 'default', labelledBy, className, children }: Props) {
  return (
    <section className={cx(styles.panel, tone !== 'default' && styles[tone], className)} aria-labelledby={labelledBy}>
      {title && (
        <header className={styles.heading}>
          <h2 className={styles.title}>
            {Icon && <Icon size={18} aria-hidden />}
            {title}
          </h2>
          {aside}
        </header>
      )}
      {children}
    </section>
  )
}
