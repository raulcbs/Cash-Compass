import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect } from 'react'
import { money } from '../format'

interface Props {
  value: number
  /** Must be a stable (module-level) function. */
  format?: (n: number) => string
}

/** Tweens between values so changes in the plan read as movement, not a jump. */
export function AnimatedNumber({ value, format = money }: Props) {
  const reduce = useReducedMotion()
  const current = useMotionValue(value)
  const text = useTransform(current, format)

  useEffect(() => {
    if (reduce) {
      current.set(value)
      return
    }
    const controls = animate(current, value, { duration: 0.6, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [value, reduce, current])

  return <motion.span className='tabular'>{text}</motion.span>
}
