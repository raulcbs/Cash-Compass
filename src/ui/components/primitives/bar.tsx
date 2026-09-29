import { motion } from 'motion/react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../cx'
import styles from './bar.module.css'

interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'color'> {
  percent: number
  /** Any CSS color; defaults to the primary green. */
  color?: string
  size?: 'sm' | 'md'
}

/** A horizontal track whose fill animates to the given percentage. Extra props (role, aria-*) go to the track. */
export function Bar({ percent, color, size = 'md', ...track }: Props) {
  return (
    <span className={cx(styles.track, size === 'sm' && styles.small)} {...track}>
      <motion.i
        className={styles.fill}
        style={{ background: color }}
        initial={false}
        animate={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 22 }}
      />
    </span>
  )
}
