import { useEffect, useId, useState } from 'react'

interface Props {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  integer?: boolean
  suffix?: string
}

const PARTIAL_NUMBER = /^-?(?:\d*(?:[.,]\d*)?)?$/
const INCOMPLETE = new Set(['', '-', '.', ',', '-.', '-,'])

/**
 * Text input that accepts comma or dot decimals (max two) and only commits
 * values inside [min, max]. Out-of-range drafts revert on blur.
 */
export function NumberField({ label, value, onChange, min = 0, max = 1e12, integer = false, suffix }: Props) {
  const id = useId()
  const [draft, setDraft] = useState(String(value).replace('.', ','))
  useEffect(() => setDraft(String(value).replace('.', ',')), [value])

  return (
    <div className='field'>
      <label htmlFor={id}>{label}</label>
      <div className='input-wrap'>
        <input
          id={id}
          type='text'
          inputMode={integer ? 'numeric' : 'decimal'}
          autoComplete='off'
          value={draft}
          onChange={(e) => {
            const next = e.target.value
            if (!PARTIAL_NUMBER.test(next) || (next.split(/[.,]/)[1]?.length ?? 0) > 2) return
            if (min >= 0 && next.startsWith('-')) return
            setDraft(next)
            if (INCOMPLETE.has(next)) return
            const parsed = Number(next.replace(',', '.'))
            if (next.startsWith('-') && parsed === 0) return
            if (Number.isFinite(parsed) && parsed >= min && parsed <= max && (!integer || Number.isInteger(parsed))) onChange(parsed)
          }}
          onBlur={() => setDraft(String(value).replace('.', ','))}
        />
        {suffix && <span className='input-suffix'>{suffix}</span>}
      </div>
    </div>
  )
}
