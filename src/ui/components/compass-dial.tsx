import { motion } from 'motion/react'
import { AnimatedNumber } from './animated-number'

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
const RING = 78
const CIRCUMFERENCE = 2 * Math.PI * RING
const TICKS = Array.from({ length: 72 }, (_, i) => i)
const GAP = 3

/**
 * The month as a compass: each ring arc is a share of income and the needle
 * settles on the heading (investment) whenever the allocation changes.
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
    <div className='dial'>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role='img' aria-label={ariaLabel}>
        <circle cx={C} cy={C} r={C - 4} className='dial-bezel' />
        {TICKS.map((i) => {
          const major = i % 6 === 0
          const angle = (i / TICKS.length) * 2 * Math.PI
          const outer = C - 10
          const inner = outer - (major ? 9 : 4)
          return (
            <line
              key={i}
              className={major ? 'dial-tick major' : 'dial-tick'}
              x1={C + outer * Math.sin(angle)}
              y1={C - outer * Math.cos(angle)}
              x2={C + inner * Math.sin(angle)}
              y2={C - inner * Math.cos(angle)}
            />
          )
        })}
        <circle cx={C} cy={C} r={RING} className='dial-track' />
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
                strokeWidth={14}
                initial={{ strokeDasharray: `0 ${CIRCUMFERENCE}`, strokeDashoffset: 0 }}
                animate={{ strokeDasharray: `${visible} ${CIRCUMFERENCE}`, strokeDashoffset: -a.offset }}
                transition={{ type: 'spring', stiffness: 70, damping: 18 }}
              />
            )
          })}
        </g>
        <motion.g
          className={target ? 'dial-needle' : 'dial-needle idle'}
          initial={{ rotate: needleAngle - 60 }}
          animate={{ rotate: needleAngle }}
          transition={{ type: 'spring', stiffness: 55, damping: 7, mass: 0.9 }}
          style={{ originX: '50%', originY: '50%' }}
        >
          <path d={`M ${C} ${C - RING + 16} L ${C + 6} ${C} L ${C - 6} ${C} Z`} className='needle-north' />
          <path d={`M ${C} ${C + RING - 16} L ${C + 6} ${C} L ${C - 6} ${C} Z`} className='needle-south' />
        </motion.g>
        <circle cx={C} cy={C} r={5} className='dial-pin' />
      </svg>
      <div className='dial-center'>
        <small>{centerLabel}</small>
        <strong>
          <AnimatedNumber value={centerValue} />
        </strong>
      </div>
    </div>
  )
}
