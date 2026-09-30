import type { LucideIcon } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../cx'
import styles from './panel.module.css'

export type PanelTone = 'default' | 'feature' | 'hero'

/** The priority a panel belongs to: its title carries that crop's terrace mark. */
export type PanelAccent = 'water' | 'stone' | 'orange' | 'rice' | 'crop'

const ACCENT: Record<PanelAccent, string> = {
  water: 'var(--primary)',
  stone: 'var(--stone)',
  orange: 'var(--orange)',
  rice: 'var(--rice)',
  crop: 'var(--crop)',
}

interface Props {
  title?: string
  icon?: LucideIcon
  aside?: ReactNode
  /** default: quiet slab. feature: tinted slab. hero: the deep water field. */
  tone?: PanelTone
  /** Colour of the small terrace beside the title; the same mark the hero uses for each priority. */
  accent?: PanelAccent
  labelledBy?: string
  className?: string
  children: ReactNode
}

export function Panel({ title, icon: Icon, aside, tone = 'default', accent = 'water', labelledBy, className, children }: Props) {
  return (
    <section
      className={cx(styles.panel, tone !== 'default' && styles[tone], className)}
      style={{ '--accent': ACCENT[accent] } as CSSProperties}
      aria-labelledby={labelledBy}
    >
      {title && (
        <header className={styles.heading}>
          <h2 className={styles.title}>
            {Icon ? <Icon size={18} aria-hidden /> : <i className={styles.mark} aria-hidden />}
            {title}
          </h2>
          {aside}
        </header>
      )}
      {children}
    </section>
  )
}
