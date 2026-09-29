import { Check } from 'lucide-react'
import { useId, useState } from 'react'
import { ASSET_CATEGORIES, EXPENSE_CATEGORIES, type Asset, type Collection, type Entry, type Expense } from '../../domain/types'
import { NumberField } from './number-field'
import { Segmented } from './segmented'

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
      className='entry-form'
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ ...entry, name: entry.name.trim() } as Entry<C>)
      }}
    >
      <div className='field'>
        <label htmlFor={`${id}-name`}>Nombre</label>
        <input
          id={`${id}-name`}
          required
          maxLength={120}
          value={entry.name}
          placeholder={PLACEHOLDER[collection]}
          onChange={(e) => set({ name: e.target.value })}
        />
      </div>

      {collection === 'assets' ? (
        <>
          <Select label='Categoría' value={asset.category} options={ASSET_CATEGORIES} onChange={(category) => set({ category })} />
          <div className='form-row'>
            <NumberField label='Valor actual' suffix='€' value={asset.value} onChange={(value) => set({ value })} />
            <NumberField label='Coste de adquisición' suffix='€' value={asset.cost} onChange={(cost) => set({ cost })} />
          </div>
        </>
      ) : (
        <>
          <div className='form-row'>
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
          </div>
          {collection === 'expenses' && (
            <>
              <div className='form-row'>
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
              </div>
              <label className='checkbox'>
                <input type='checkbox' checked={expense.essential} onChange={(e) => set({ essential: e.target.checked })} />
                <span>
                  Es esencial
                  <small>Cuenta para calcular tu fondo de emergencia.</small>
                </span>
              </label>
              <p className='footnote'>Incluye las cuotas obligatorias de deuda en «Deudas». Evita duplicar estos importes en tus reservas.</p>
            </>
          )}
        </>
      )}

      <div className='modal-actions'>
        <button className='button' type='button' onClick={onCancel}>
          Cancelar
        </button>
        <button className='button primary' type='submit' disabled={!entry.name.trim()}>
          <Check size={16} /> Guardar {NOUN[collection]}
        </button>
      </div>
    </form>
  )
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  const id = useId()
  // Keep imported categories that are not in the default list selectable.
  const all = options.includes(value) ? options : [...options, value]
  return (
    <div className='field'>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {all.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </div>
  )
}
