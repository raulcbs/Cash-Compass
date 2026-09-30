import { motion, useReducedMotion } from 'motion/react'
import { useId } from 'react'
import { percent } from '../../format'
import styles from './terraces.module.css'

export interface Terrace {
  label: string
  value: number
  /** Any CSS colour; read from the host surface's tokens. */
  color: string
}

interface Props {
  /** In priority order: the water reaches them one after another. */
  terraces: Terrace[]
  income: number
  /** Expenses that income does not cover (0 when the plan is balanced). */
  deficit: number
  ariaLabel: string
}

const W = 640
const H = 250
/** Room on the left for the acequia that feeds the first terrace. */
const SOURCE = 36
const TOP = 40
const LIP = 12
const MIN_LAST = 64
/** Depth of the retaining wall's darker top course. */
const RISER = 7

type Shape = { key: string; label: string; x0: number; x1: number; top: number; color: string; share: number; kind: 'crop' | 'dry' | 'deficit' }

/** Rectangle standing on the ground with a rounded lip on its downhill (right) corner. */
function terracePath(x0: number, x1: number, top: number) {
  const r = Math.max(0, Math.min(LIP, (x1 - x0) / 2, H - top))
  return `M ${x0} ${H} L ${x0} ${top} L ${x1 - r} ${top} Q ${x1} ${top} ${x1} ${top + r} L ${x1} ${H} Z`
}

/** The retaining wall's face: a darker course just under the terrace's top edge. */
function riserPath(x0: number, x1: number, top: number) {
  const r = Math.max(0, Math.min(LIP, (x1 - x0) / 2, H - top))
  const b = Math.min(H, top + RISER)
  return `M ${x0} ${b} L ${x0} ${top} L ${x1 - r} ${top} Q ${x1} ${top} ${x1} ${Math.min(b, top + r)} L ${x1} ${b} Z`
}

function layout(terraces: Terrace[], income: number, deficit: number): Shape[] {
  const planted = terraces.filter((t) => t.value > 0)
  const empty = income <= 0 && deficit <= 0
  const rows = empty
    ? terraces.map((t) => ({ label: t.label, value: 1, color: t.color, kind: 'dry' as const }))
    : [
        ...planted.map((t) => ({ ...t, kind: 'crop' as const })),
        ...(deficit > 0 ? [{ label: 'Déficit', value: deficit, color: 'var(--danger)', kind: 'deficit' as const }] : []),
      ]
  const total = rows.reduce((sum, r) => sum + r.value, 0) || 1
  const step = rows.length > 1 ? Math.min(44, (H - TOP - MIN_LAST) / (rows.length - 1)) : 0
  let cursor = SOURCE
  return rows.map((r, i) => {
    const width = (r.value / total) * (W - SOURCE)
    const shape = {
      key: `${r.label}-${i}`,
      label: r.label,
      x0: cursor,
      x1: cursor + width,
      top: TOP + i * step,
      color: r.color,
      share: r.value / total,
      kind: r.kind,
    }
    cursor += width
    return shape
  })
}

/** The water's route: along the acequia, across each watered terrace, and over every lip to the next one. */
function waterPath(shapes: Shape[]) {
  const watered = shapes.filter((s) => s.kind === 'crop')
  if (!watered.length) return ''
  const film = (s: Shape) => s.top - 4
  let d = `M 0 ${film(watered[0]!)} L ${watered[0]!.x1 - LIP} ${film(watered[0]!)}`
  watered.forEach((s, i) => {
    const next = watered[i + 1]
    if (!next) {
      d += ` L ${s.x1 - LIP} ${film(s)}`
      return
    }
    const fall = Math.min(10, Math.max(4, (s.x1 - s.x0) / 3))
    d += ` Q ${s.x1 + 2} ${film(s)} ${s.x1 + 3} ${film(s) + 10} L ${s.x1 + 3} ${film(next) - 8} Q ${s.x1 + 3} ${film(next)} ${s.x1 + 3 + fall} ${film(next)}`
    d += ` L ${next.x1 - LIP} ${film(next)}`
  })
  return d
}

/**
 * The month as a hillside of terraces. Each terrace is as long as its exact share of net income
 * and the water reaches them in priority order, running along the acequia and dropping over each lip.
 * A deficit shows as cracked, unwatered ground; with no data the terraces stay dry.
 */
export function Terraces({ terraces, income, deficit, ariaLabel }: Props) {
  const reduce = useReducedMotion()
  const id = useId().replace(/:/g, '')
  const shapes = layout(terraces, income, deficit)
  const water = waterPath(shapes)
  const springy = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 70, damping: 16 }

  return (
    <div className={styles.terraces}>
      <svg viewBox={`0 0 ${W} ${H}`} role='img' aria-label={ariaLabel} className={styles.svg}>
        <defs>
          <pattern id={`${id}-furrows`} width='12' height='9' patternUnits='userSpaceOnUse'>
            <path d='M 0 8.5 H 12' className={styles.furrow} />
          </pattern>
          <pattern id={`${id}-dry`} width='10' height='10' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'>
            <path d='M 0 0 V 10' className={styles.hatch} />
          </pattern>
          <pattern id={`${id}-crack`} width='22' height='18' patternUnits='userSpaceOnUse'>
            <path d='M 0 9 L 6 6 L 11 11 L 17 5 L 22 9' className={styles.crack} />
          </pattern>
        </defs>

        {/* The acequia: a stone channel entering from the hillside. */}
        <path d={`M 0 ${TOP - 4} H ${SOURCE}`} className={styles.channel} />

        {shapes.map((s, i) => (
          <g key={s.key} style={{ fill: s.kind === 'dry' ? 'transparent' : s.color }}>
            <motion.path
              initial={{ d: terracePath(s.x0, s.x1, H - 1) }}
              animate={{ d: terracePath(s.x0, s.x1, s.top) }}
              transition={{ ...springy, delay: reduce ? 0 : i * 0.08 }}
              className={s.kind === 'deficit' ? styles.deficitFill : undefined}
            />
            <motion.path
              initial={{ d: terracePath(s.x0, s.x1, H - 1) }}
              animate={{ d: terracePath(s.x0, s.x1, s.top) }}
              transition={{ ...springy, delay: reduce ? 0 : i * 0.08 }}
              fill={`url(#${id}-${s.kind === 'crop' ? 'furrows' : s.kind === 'dry' ? 'dry' : 'crack'})`}
              className={s.kind === 'dry' ? styles.dry : undefined}
            />
            {s.kind !== 'dry' && (
              <motion.path
                initial={{ d: riserPath(s.x0, s.x1, H - 1) }}
                animate={{ d: riserPath(s.x0, s.x1, s.top) }}
                transition={{ ...springy, delay: reduce ? 0 : i * 0.08 }}
                className={styles.riser}
              />
            )}
          </g>
        ))}

        {water && (
          <g key={water}>
            <motion.path
              d={water}
              className={styles.bank}
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduce ? 0 : 1.5, delay: reduce ? 0 : 0.3, ease: [0.45, 0, 0.2, 1] }}
            />
            <motion.path
              d={water}
              className={styles.water}
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduce ? 0 : 1.5, delay: reduce ? 0 : 0.3, ease: [0.45, 0, 0.2, 1] }}
            />
          </g>
        )}

        <path d={`M 0 ${H - 0.5} H ${W}`} className={styles.ground} />
      </svg>

      {/* Shares are HTML so they stay legible at any width; placed on the terraces they describe. */}
      {income > 0 &&
        shapes
          .filter((s) => s.share >= 0.085)
          .map((s) => (
            <span
              key={s.key}
              className={s.kind === 'deficit' ? styles.shareDeficit : styles.share}
              style={{ left: `${(Math.max(s.x0 + 6, Math.min(s.x0 + 10, s.x1 - 40)) / W) * 100}%`, top: `${((s.top + RISER + 10) / H) * 100}%` }}
              aria-hidden
            >
              {percent(Math.round(s.share * 100))}
            </span>
          ))}
    </div>
  )
}
