import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../cx'
import styles from './button.module.css'

type NativeButton = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>

interface ButtonProps extends NativeButton {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'md' | 'sm'
  icon?: ReactNode
  /** Keeps only the icon visible on phones; the label stays available to assistive tech. */
  iconOnPhone?: boolean
  className?: string
}

export function Button({ variant = 'secondary', size = 'md', icon, iconOnPhone = false, className, type = 'button', children, ...rest }: ButtonProps) {
  return (
    <button type={type} className={cx(styles.button, styles[variant], size === 'sm' && styles.small, iconOnPhone && styles.iconOnPhone, className)} {...rest}>
      {icon}
      {icon ? <span className={styles.label}>{children}</span> : children}
    </button>
  )
}

interface IconButtonProps extends NativeButton {
  tone?: 'neutral' | 'danger'
  size?: 'md' | 'sm'
  active?: boolean
  className?: string
}

/** Icon-only control: callers must provide an aria-label. */
export function IconButton({ tone = 'neutral', size = 'md', active = false, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      className={cx(styles.icon, size === 'sm' && styles.iconSmall, tone === 'danger' && styles.iconDanger, active && styles.iconActive, className)}
      {...rest}
    />
  )
}

interface TextButtonProps extends NativeButton {
  tone?: 'primary' | 'inverse'
  className?: string
}

export function TextButton({ tone = 'primary', className, type = 'button', ...rest }: TextButtonProps) {
  return <button type={type} className={cx(styles.text, tone === 'inverse' && styles.textInverse, className)} {...rest} />
}
