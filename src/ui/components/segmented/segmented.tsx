import { cx } from '../../cx'
import { FieldGroup } from '../primitives/field'
import styles from './segmented.module.css'

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: [T, string][]
  onChange: (v: T) => void
}) {
  return (
    <FieldGroup label={label}>
      {(labelId) => (
        <div className={styles.segmented} role='radiogroup' aria-labelledby={labelId}>
          {options.map(([key, text]) => (
            <button
              key={key}
              type='button'
              role='radio'
              aria-checked={value === key}
              className={cx(styles.option, value === key && styles.active)}
              onClick={() => onChange(key)}
            >
              {text}
            </button>
          ))}
        </div>
      )}
    </FieldGroup>
  )
}
