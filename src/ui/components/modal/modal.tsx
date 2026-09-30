import { motion, useDragControls, useReducedMotion, type DragControls } from 'motion/react'
import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { MOBILE_QUERY, useMediaQuery } from '../../use-media-query'
import { useScrollLock } from '../../use-scroll-lock'
import { IconButton } from '../primitives/button'
import styles from './modal.module.css'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

const FOCUSABLE = 'button:not(:disabled),input,select,textarea,a[href]'

/**
 * Accessible dialog: traps focus, closes on Escape or backdrop click and
 * restores focus on unmount. On phones it becomes a bottom sheet that can be
 * dragged down to dismiss. Render inside <AnimatePresence> for exit motion.
 */
export function Modal({ title, onClose, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const mobile = useMediaQuery(MOBILE_QUERY)
  const reduce = useReducedMotion()
  const dragControls = useDragControls()
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useScrollLock()

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    // On touch, focusing an input pops the keyboard mid-animation and makes
    // iOS scroll the viewport; let the user tap the field instead.
    const touch = matchMedia('(pointer: coarse)').matches
    const firstInput = touch ? null : ref.current?.querySelector<HTMLElement>('input,select')
    ;(firstInput ?? ref.current)?.focus({ preventScroll: true })

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeRef.current()
      if (e.key !== 'Tab' || !ref.current) return
      const nodes = ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus({ preventScroll: true })
    }
  }, [])

  const hidden = mobile ? { y: '100%' } : { opacity: 0, scale: 0.96, y: 12 }
  const shown = mobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }

  return (
    <motion.div
      className={styles.backdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={ref}
        className={styles.modal}
        role='dialog'
        aria-modal='true'
        aria-labelledby='modal-title'
        tabIndex={-1}
        initial={hidden}
        animate={shown}
        exit={hidden}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 34 }}
        drag={mobile ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        dragListener={false}
        dragControls={dragControls}
        onDragEnd={(_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 600) onClose()
        }}
      >
        {mobile && <SheetHandle controls={dragControls} />}
        <header className={styles.header}>
          <h2 id='modal-title' className={styles.title}>
            {title}
          </h2>
          <IconButton aria-label='Cerrar' onClick={onClose}>
            <X size={20} />
          </IconButton>
        </header>
        {children}
      </motion.div>
    </motion.div>
  )
}

/** Explanatory text above the actions of a confirmation dialog. */
export function ModalBody({ children }: { children: ReactNode }) {
  return <p className={styles.body}>{children}</p>
}

/** Cancel / confirm row. Sticks to the bottom of the sheet on phones. */
export function ModalActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>
}

function SheetHandle({ controls }: { controls: DragControls }) {
  return (
    <div className={styles.handle} aria-hidden onPointerDown={(e) => controls.start(e)}>
      <span />
    </div>
  )
}
