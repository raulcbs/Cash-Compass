import { motion } from 'motion/react'
import { AnimatedNumber } from '../animated-number/animated-number'
import styles from './compass-dial.module.css'

export interface DialSegment {
  label: string
  value: number
  color: string
}

interface Props {
  segments: DialSegment[]
  /** Label of the segment the needle points at. */
  heading: string
  centerLabel: string
  centerValue: number
  ariaLabel: string
}

const SIZE = 220
const C = SIZE / 2
const RING = 88
const CIRCUMFERENCE = 2 * Math.PI * RING
/** Twelve cardinal marks around the bezel. */
const TICKS = Array.from({ length: 12 }, (_, i) => i)
const GAP = 3
const STROKE = 16

/**
 * The month as a compass: each ring arc is a share of income and the needle
 * settles on the heading (investment) whenever the allocation changes.
 * Colors come from CSS variables so the dial follows whatever surface hosts it.
 */
export function CompassDial({ segments, heading, centerLabel, centerValue, ariaLabel }: Props) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  let offset = 0
  const arcs = segments.map((s) => {
    const length = total ? (s.value / total) * CIRCUMFERENCE : 0
    const arc = { ...s, length, offset }
    offset += length
    return arc
  })
  const target = arcs.find((a) => a.label === heading && a.length > 0)
  const needleAngle = target ? ((target.offset + target.length / 2) / CIRCUMFERENCE) * 360 : 0

  return (
    <div className={styles.dial}>
      <div className={styles.face}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role='img' aria-label={ariaLabel} className={styles.svg}>
          {TICKS.map((i) => {
            const angle = (i / TICKS.length) * 2 * Math.PI
            const outer = C - 4
            const inner = outer - 8
            return (
              <line
                key={i}
                className={styles.tick}
                x1={C + outer * Math.sin(angle)}
                y1={C - outer * Math.cos(angle)}
                x2={C + inner * Math.sin(angle)}
                y2={C - inner * Math.cos(angle)}
              />
            )
          })}
          <circle cx={C} cy={C} r={RING} className={styles.track} />
          <g transform={`rotate(-90 ${C} ${C})`}>
            {arcs.map((a) => {
              const visible = Math.max(0, a.length - (a.length > GAP * 2 ? GAP : 0))
              return (
                <motion.circle
                  key={a.label}
                  cx={C}
                  cy={C}
                  r={RING}
                  fill='none'
                  stroke={a.color}
                  strokeWidth={STROKE}
                  initial={{ strokeDasharray: `0 ${CIRCUMFERENCE}`, strokeDashoffset: 0 }}
                  animate={{ strokeDasharray: `${visible} ${CIRCUMFERENCE}`, strokeDashoffset: -a.offset }}
                  transition={{ type: 'spring', stiffness: 70, damping: 18 }}
                />
              )
            })}
          </g>
          <motion.g
            className={target ? undefined : styles.idle}
            initial={{ rotate: needleAngle - 60 }}
            animate={{ rotate: needleAngle }}
            transition={{ type: 'spring', stiffness: 55, damping: 7, mass: 0.9 }}
            style={{ originX: '50%', originY: '50%' }}
          >
            <path d={`M ${C} ${C - RING + 20} L ${C + 6} ${C} L ${C - 6} ${C} Z`} className={styles.north} />
            <path d={`M ${C} ${C + RING - 20} L ${C + 6} ${C} L ${C - 6} ${C} Z`} className={styles.south} />
          </motion.g>
          <circle cx={C} cy={C} r={5} className={styles.pin} />
        </svg>
      </div>
      <div className={styles.center}>
        <span className={styles.centerLabel}>{centerLabel}</span>
        <strong className={styles.centerValue}>
          <AnimatedNumber value={centerValue} />
        </strong>
      </div>
    </div>
  )
}
