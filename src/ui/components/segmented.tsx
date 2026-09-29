import { useId } from 'react'

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
  const id = useId()
  return (
    <div className='field'>
      <span id={id} className='field-label'>
        {label}
      </span>
      <div className='segmented' role='radiogroup' aria-labelledby={id}>
        {options.map(([key, text]) => (
          <button
            key={key}
            type='button'
            role='radio'
            aria-checked={value === key}
            className={value === key ? 'active' : undefined}
            onClick={() => onChange(key)}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}
