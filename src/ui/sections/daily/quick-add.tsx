import { AnimatePresence, motion } from 'motion/react'
import { Check, Plus } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { toDateKey } from '../../../domain/dates'
import { SPEND_CATEGORIES, type Spend } from '../../../domain/types'
import { parseAmount } from '../../format'
import { categoryStyle } from './categories'

interface Props {
  onAdd: (spend: Spend) => boolean
}

/** Fixed id so the page's "+" button can jump straight to the amount. */
export const QUICK_AMOUNT_ID = 'quick-add-amount'

export function focusQuickAdd() {
  const input = document.getElementById(QUICK_AMOUNT_ID)
  input?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  input?.focus({ preventScroll: true })
}

export function QuickAdd({ onAdd }: Props) {
  const id = useId()
  const amountRef = useRef<HTMLInputElement>(null)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<string>(SPEND_CATEGORIES[0])
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const today = toDateKey(new Date())

  useEffect(() => {
    if (!saved) return
    const timer = setTimeout(() => setSaved(false), 1600)
    return () => clearTimeout(timer)
  }, [saved])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const value = parseAmount(amount)
    if (value === null) {
      setError('Escribe un importe mayor que 0, con hasta dos decimales.')
      amountRef.current?.focus()
      return
    }
    const day = date && date <= today ? date : today
    if (!onAdd({ id: crypto.randomUUID(), amount: value, category, note: note.trim(), date: day })) return
    setAmount('')
    setNote('')
    setDate('')
    setError('')
    setSaved(true)
    // Keep the keyboard out of the way on touch screens; on desktop, ready for the next one.
    if (window.matchMedia('(pointer: fine)').matches) amountRef.current?.focus()
    else amountRef.current?.blur()
  }

  return (
    <form className='panel quick-add' onSubmit={submit} noValidate>
      <header className='panel-heading'>
        <h2>Anotar un gasto</h2>
      </header>

      <label className='amount-input' htmlFor={QUICK_AMOUNT_ID}>
        <span className='sr-only'>Importe en euros</span>
        <input
          ref={amountRef}
          id={QUICK_AMOUNT_ID}
          inputMode='decimal'
          autoComplete='off'
          placeholder='0,00'
          value={amount}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => {
            if (/^\d*([.,]\d{0,2})?$/.test(e.target.value)) setAmount(e.target.value)
            setError('')
          }}
        />
        <span aria-hidden>€</span>
      </label>
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            className='field-error'
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className='chips' role='radiogroup' aria-label='Categoría'>
        {SPEND_CATEGORIES.map((c) => {
          const { icon: Icon, color } = categoryStyle(c)
          const active = c === category
          return (
            <button
              key={c}
              type='button'
              role='radio'
              aria-checked={active}
              className={active ? 'chip active' : 'chip'}
              style={{ '--chip': color } as React.CSSProperties}
              onClick={() => setCategory(c)}
            >
              <Icon size={15} aria-hidden />
              {c}
            </button>
          )
        })}
      </div>

      <div className='quick-row'>
        <div className='field'>
          <label htmlFor={`${id}-note`}>Concepto (opcional)</label>
          <input id={`${id}-note`} maxLength={120} placeholder='Ej. Cena con amigos' value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className='field'>
          <label htmlFor={`${id}-date`}>Fecha</label>
          <input id={`${id}-date`} type='date' max={today} value={date || today} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <button className='button primary quick-submit' type='submit'>
        <AnimatePresence mode='wait' initial={false}>
          <motion.span
            key={String(saved)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {saved ? <Check size={17} aria-hidden /> : <Plus size={17} aria-hidden />}
            {saved ? 'Anotado' : 'Anotar gasto'}
          </motion.span>
        </AnimatePresence>
      </button>
    </form>
  )
}
