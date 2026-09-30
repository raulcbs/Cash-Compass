import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useTheme, type ThemePreference } from '../../use-theme'
import styles from './theme-control.module.css'

const choices = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
] as const

export function ThemeControl() {
  const { preference, chooseTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const controlRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstOptionRef = useRef<HTMLButtonElement>(null)
  const listId = useId()
  const selected = choices.find((choice) => choice.value === preference)!
  const SelectedIcon = selected.icon

  useEffect(() => {
    if (!open) return
    firstOptionRef.current?.focus()
    const onPointerDown = (event: PointerEvent) => {
      if (!controlRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const choose = (next: ThemePreference) => {
    chooseTheme(next)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className={styles.control} ref={controlRef}>
      <button
        ref={triggerRef}
        type='button'
        className={styles.trigger}
        aria-label={`Tema: ${selected.label}`}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <SelectedIcon size={17} aria-hidden />
        <span className={styles.triggerLabel}>{selected.label}</span>
        <ChevronDown className={styles.chevron} size={14} aria-hidden />
      </button>
      {open && (
        <div className={styles.options} id={listId} role='group' aria-label='Elegir tema'>
          {choices.map(({ value, label, icon: Icon }, index) => (
            <button
              key={value}
              ref={index === 0 ? firstOptionRef : undefined}
              type='button'
              className={styles.option}
              aria-pressed={preference === value}
              onClick={() => choose(value)}
            >
              <Icon size={16} aria-hidden />
              <span>{label}</span>
              {preference === value && <Check size={15} aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
