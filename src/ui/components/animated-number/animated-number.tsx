import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useCallback, useEffect } from 'react'
import { money } from '../../format'
import styles from './animated-number.module.css'

interface Props {
  value: number
  /** Must be a stable (module-level) function. */
  format?: (n: number) => string
}

/** Splits "1234,56 €" into the integer part and the quieter tail (cents and currency symbol). */
function split(text: string): [string, string] {
  const match = /^(-?[\d.]+)(.*)$/.exec(text)
  return match ? [match[1]!, match[2]!] : [text, '']
}

/**
 * Tweens between values so changes in the plan read as movement, not a jump.
 * The cents and the currency symbol render smaller and muted so the integer leads.
 */
export function AnimatedNumber({ value, format = money }: Props) {
  const reduce = useReducedMotion()
  const current = useMotionValue(value)
  // Stable callbacks: useTransform re-subscribes whenever the function identity changes.
  const head = useCallback((n: number) => split(format(n))[0], [format])
  const rest = useCallback((n: number) => split(format(n))[1], [format])
  const main = useTransform(current, head)
  const tail = useTransform(current, rest)

  useEffect(() => {
    if (reduce) {
      current.set(value)
      return
    }
    const controls = animate(current, value, { duration: 0.6, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [value, reduce, current])

  return (
    <span className='tabular'>
      <motion.span>{main}</motion.span>
      <motion.span className={styles.tail}>{tail}</motion.span>
    </span>
  )
}
