import { Check } from 'lucide-react'
import { useId, useState } from 'react'
import { ASSET_CATEGORIES, EXPENSE_CATEGORIES, type Asset, type Collection, type Entry, type Expense } from '../../../domain/types'
import { ModalActions } from '../modal/modal'
import { NumberField } from '../number-field/number-field'
import { Button } from '../primitives/button'
import { Field, FormRow } from '../primitives/field'
import { Footnote } from '../primitives/text'
import { Segmented } from '../segmented/segmented'
import styles from './entry-form.module.css'

export const NOUN: Record<Collection, string> = { incomes: 'ingreso', expenses: 'gasto', assets: 'activo' }
const PLACEHOLDER: Record<Collection, string> = { incomes: 'Ej. Salario neto', expenses: 'Ej. Alquiler', assets: 'Ej. Fondo indexado' }

function blank(collection: Collection): Entry<Collection> {
  const id = crypto.randomUUID()
  if (collection === 'assets') return { id, name: '', category: 'Fondos', value: 0, cost: 0 }
  if (collection === 'expenses') return { id, name: '', amount: 0, frequency: 'monthly', kind: 'fixed', category: 'Vivienda', essential: true }
  return { id, name: '', amount: 0, frequency: 'monthly' }
}

interface Props<C extends Collection> {
  collection: C
  entry?: Entry<C>
  onCancel: () => void
  onSave: (entry: Entry<C>) => void
}

export function EntryForm<C extends Collection>({ collection, entry: initial, onCancel, onSave }: Props<C>) {
  const [entry, setEntry] = useState<Entry<Collection>>(initial ?? blank(collection))
  const id = useId()
  // The form edits a union; each branch below only touches fields of its own shape.
  const set = (patch: Partial<Expense & Asset>) => setEntry((e) => ({ ...e, ...patch }) as Entry<Collection>)
  const expense = entry as Expense
  const asset = entry as Asset

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ ...entry, name: entry.name.trim() } as Entry<C>)
      }}
    >
      <Field label='Nombre' htmlFor={`${id}-name`}>
        <input
          id={`${id}-name`}
          required
          maxLength={120}
          value={entry.name}
          placeholder={PLACEHOLDER[collection]}
          onChange={(e) => set({ name: e.target.value })}
        />
      </Field>

      {collection === 'assets' ? (
        <>
          <Select label='Categoría' value={asset.category} options={ASSET_CATEGORIES} onChange={(category) => set({ category })} />
          <FormRow>
            <NumberField label='Valor actual' suffix='€' value={asset.value} onChange={(value) => set({ value })} />
            <NumberField label='Coste de adquisición' suffix='€' value={asset.cost} onChange={(cost) => set({ cost })} />
          </FormRow>
        </>
      ) : (
        <>
          <FormRow>
            <NumberField label='Importe neto' suffix='€' value={expense.amount} onChange={(amount) => set({ amount })} />
            <Segmented
              label='Frecuencia'
              value={expense.frequency}
              options={[
                ['monthly', 'Mensual'],
                ['annual', 'Anual'],
              ]}
              onChange={(frequency) => set({ frequency })}
            />
          </FormRow>
          {collection === 'expenses' && (
            <>
              <FormRow>
                <Segmented
                  label='Tipo'
                  value={expense.kind}
                  options={[
                    ['fixed', 'Fijo'],
                    ['variable', 'Variable'],
                  ]}
                  onChange={(kind) => set({ kind })}
                />
                <Select label='Categoría' value={expense.category} options={EXPENSE_CATEGORIES} onChange={(category) => set({ category })} />
              </FormRow>
              <label className={styles.checkbox}>
                <input type='checkbox' checked={expense.essential} onChange={(e) => set({ essential: e.target.checked })} />
                <span>
                  Es esencial
                  <small>Cuenta para calcular tu fondo de emergencia.</small>
                </span>
              </label>
              <Footnote>Incluye las cuotas obligatorias de deuda en «Deudas». Evita duplicar estos importes en tus reservas.</Footnote>
            </>
          )}
        </>
      )}

      <ModalActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button variant='primary' type='submit' disabled={!entry.name.trim()} icon={<Check size={16} />}>
          Guardar {NOUN[collection]}
        </Button>
      </ModalActions>
    </form>
  )
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  const id = useId()
  // Keep imported categories that are not in the default list selectable.
  const all = options.includes(value) ? options : [...options, value]
  return (
    <Field label={label} htmlFor={id}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {all.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </Field>
  )
}
