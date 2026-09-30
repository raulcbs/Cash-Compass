import { AnimatePresence, motion } from 'motion/react'
import { useId, useState, type PointerEvent } from 'react'
import type { ProjectionPoint } from '../../../domain/finance'
import { cx } from '../../cx'
import { wholeMoney } from '../../format'
import styles from './projection-chart.module.css'

const WIDTH = 600
const HEIGHT = 190
const PAD_TOP = 14

interface Props {
  points: ProjectionPoint[]
  ariaLabel: string
  compact?: boolean
}

/** Projection line chart; hovering or tapping inspects a given year. */
export function ProjectionChart({ points, ariaLabel, compact = false }: Props) {
  const [active, setActive] = useState<number | null>(null)
  const clipId = useId().replace(/:/g, '')
  const values = points.flatMap((p) => [p.value, p.contributed])
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const x = (i: number) => (i / Math.max(1, points.length - 1)) * WIDTH
  const y = (v: number) => HEIGHT - ((v - min) / (max - min || 1)) * (HEIGHT - PAD_TOP)
  const line = (key: 'value' | 'contributed') => points.map((p, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(2)} ${y(p[key]).toFixed(2)}`).join(' ')
  const area = `${line('value')} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`
  const years = points.length - 1

  const inspect = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    setActive(Math.round(ratio * years))
  }

  const point = active === null ? null : points[active]
  const morph = { type: 'spring', stiffness: 90, damping: 20 } as const

  return (
    <div className={styles.chart} onPointerMove={inspect} onPointerDown={inspect} onPointerLeave={() => setActive(null)}>
      <svg
        className={cx(styles.svg, compact && styles.compact)}
        viewBox={`0 0 ${WIDTH} ${HEIGHT + 4}`}
        preserveAspectRatio='none'
        role='img'
        aria-label={ariaLabel}
      >
        <defs>
          <linearGradient id='projection-fill' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='var(--crop)' stopOpacity='.2' />
            <stop offset='100%' stopColor='var(--crop)' stopOpacity='0' />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1='0' x2={WIDTH} y1={PAD_TOP + f * (HEIGHT - PAD_TOP)} y2={PAD_TOP + f * (HEIGHT - PAD_TOP)} className={styles.grid} />
        ))}
        {/* Keyed by horizon: a new point count redraws (clip reveal), same count morphs.
            pathLength is avoided: its dasharray breaks with non-scaling strokes. */}
        <g key={years}>
          <clipPath id={`${clipId}-${years}`}>
            <motion.rect
              x={0}
              y={-10}
              height={HEIGHT + 20}
              initial={{ width: 0 }}
              animate={{ width: WIDTH }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </clipPath>
          <g clipPath={`url(#${clipId}-${years})`}>
            <motion.path initial={false} animate={{ d: area }} transition={morph} fill='url(#projection-fill)' />
            <motion.path
              initial={false}
              animate={{ d: line('contributed') }}
              transition={morph}
              className={styles.contributed}
              vectorEffect='non-scaling-stroke'
            />
            <motion.path initial={false} animate={{ d: line('value') }} transition={morph} className={styles.value} vectorEffect='non-scaling-stroke' />
          </g>
        </g>
        {point && active !== null && <line x1={x(active)} x2={x(active)} y1={0} y2={HEIGHT} className={styles.guide} vectorEffect='non-scaling-stroke' />}
      </svg>
      {point && active !== null && (
        <span className={styles.dot} style={{ left: `${(x(active) / WIDTH) * 100}%`, top: `${(y(point.value) / (HEIGHT + 4)) * 100}%` }} />
      )}
      <AnimatePresence>
        {point && active !== null && (
          <motion.div
            className={styles.tooltip}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0, left: `${Math.min(78, Math.max(0, (active / Math.max(1, years)) * 100 - 11))}%` }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <small>{active === 0 ? 'Hoy' : `Año ${active}`}</small>
            <strong className='tabular'>{wholeMoney(point.value)}</strong>
            <span className='tabular'>Aportado {wholeMoney(point.contributed)}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.years}>
        <span>Hoy</span>
        <span>Año {Math.round(years / 2)}</span>
        <span>Año {years}</span>
      </div>
    </div>
  )
}
