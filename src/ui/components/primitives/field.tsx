import { useId, type ReactNode } from 'react'
import styles from './field.module.css'

interface Props {
  label: string
  /** id of the control the label names. */
  htmlFor: string
  /** Short unit shown inside the control, on the right (for example € or %). */
  suffix?: string
  children: ReactNode
}

/** Label + control. Native inputs and selects inside receive the input styling. */
export function Field({ label, htmlFor, suffix, children }: Props) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        {children}
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
    </div>
  )
}

/** Same layout as Field for composite controls (radio groups); the render prop receives the caption id. */
export function FieldGroup({ label, children }: { label: string; children: (labelId: string) => ReactNode }) {
  const id = useId()
  return (
    <div className={styles.field}>
      <span id={id} className={styles.label}>
        {label}
      </span>
      {children(id)}
    </div>
  )
}

/** Two controls side by side; stacked on phones. */
export function FormRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>
}
