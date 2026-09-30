import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../cx'
import styles from './chip.module.css'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'role'> {
  selected: boolean
  icon?: ReactNode
}

/** A radio-style choice rendered as a pill. Wrap several in an element with role="radiogroup". */
export function Chip({ selected, icon, children, type = 'button', ...rest }: Props) {
  return (
    <button type={type} role='radio' aria-checked={selected} className={cx(styles.chip, selected && styles.selected)} {...rest}>
      {icon}
      {children}
    </button>
  )
}
