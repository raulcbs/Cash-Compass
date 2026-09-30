import type { ReactNode } from 'react'
import styles from './text.module.css'

/** Small print under a form or panel: assumptions, caveats. */
export function Footnote({ children }: { children: ReactNode }) {
  return <p className={styles.footnote}>{children}</p>
}

/** Secondary body text. */
export function Muted({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={className ? `${styles.muted} ${className}` : styles.muted}>{children}</p>
}
