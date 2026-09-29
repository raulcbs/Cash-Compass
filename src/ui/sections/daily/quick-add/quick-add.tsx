import { AnimatePresence, motion } from 'motion/react'
import { Check, Plus } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { toDateKey } from '../../../../domain/dates'
import { SPEND_CATEGORIES, type Spend } from '../../../../domain/types'
import { parseAmount } from '../../../format'
import { Button } from '../../../components/primitives/button'
import { Chip } from '../../../components/primitives/chip'
import { Field } from '../../../components/primitives/field'
import { Panel } from '../../../components/primitives/panel'
import { categoryStyle } from '../categories'
import styles from './quick-add.module.css'

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

  function submit(e: FormEvent) {
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
    <Panel title='Anotar un gasto'>
      <form onSubmit={submit} noValidate>
        <label className={styles.amount} htmlFor={QUICK_AMOUNT_ID}>
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
              className={styles.error}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className={styles.chips} role='radiogroup' aria-label='Categoría'>
          {SPEND_CATEGORIES.map((c) => {
            const { icon: Icon } = categoryStyle(c)
            return (
              <Chip key={c} selected={c === category} icon={<Icon size={15} aria-hidden />} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            )
          })}
        </div>

        <div className={styles.row}>
          <Field label='Concepto (opcional)' htmlFor={`${id}-note`}>
            <input id={`${id}-note`} maxLength={120} placeholder='Ej. Cena con amigos' value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <Field label='Fecha' htmlFor={`${id}-date`}>
            <input id={`${id}-date`} type='date' max={today} value={date || today} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>

        <Button variant='primary' type='submit' className={styles.submit}>
          <AnimatePresence mode='wait' initial={false}>
            <motion.span
              key={String(saved)}
              className={styles.submitLabel}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {saved ? <Check size={17} aria-hidden /> : <Plus size={17} aria-hidden />}
              {saved ? 'Anotado' : 'Anotar gasto'}
            </motion.span>
          </AnimatePresence>
        </Button>
      </form>
    </Panel>
  )
}
