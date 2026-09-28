import { motion } from 'motion/react'
import { Coins, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { AnimatedNumber } from './animated-number'

export type Tone = 'ink' | 'sea' | 'blue' | 'brass' | 'plum' | 'rust'

export function Metric({ label, value, note, icon: Icon, tone }: { label: string; value: number; note: string; icon: LucideIcon; tone: Tone }) {
  return (
    <div className='metric'>
      <div className='metric-label'>
        <span>{label}</span>
        <span className={`metric-icon tone-${tone}`} aria-hidden>
          <Icon size={17} />
        </span>
      </div>
      <strong className={value < 0 ? 'is-negative' : undefined}>
        <AnimatedNumber value={value} />
      </strong>
      <small>{note}</small>
    </div>
  )
}

export function Panel({
  title,
  icon: Icon,
  aside,
  className = '',
  children,
}: {
  title: string
  icon?: LucideIcon
  aside?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={`panel ${className}`}>
      <header className='panel-heading'>
        <h2>
          {Icon && <Icon size={18} aria-hidden />}
          {title}
        </h2>
        {aside}
      </header>
      {children}
    </section>
  )
}

export function Empty({ text }: { text: string }) {
  return (
    <div className='empty'>
      <Coins size={24} aria-hidden />
      <p>{text}</p>
    </div>
  )
}

/** A horizontal bar whose fill animates to the given percentage. */
export function Bar({ percent, color, className = 'bar-fill' }: { percent: number; color?: string; className?: string }) {
  return (
    <motion.i
      className={className}
      style={{ background: color }}
      initial={false}
      animate={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      transition={{ type: 'spring', stiffness: 120, damping: 22 }}
    />
  )
}

export const CHART_COLORS = ['var(--blue)', 'var(--sea)', 'var(--brass)', 'var(--plum)', 'var(--slate)']
