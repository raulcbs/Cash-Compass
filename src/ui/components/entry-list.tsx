import { AnimatePresence, motion } from 'motion/react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { monthly } from '../../domain/finance'
import type { Asset, Collection, Entry, Expense, Income } from '../../domain/types'
import { money } from '../format'
import { Empty, Panel } from './primitives'

interface Props<C extends Collection> {
  collection: C
  title: string
  items: Entry<C>[]
  onAdd: () => void
  onEdit: (entry: Entry<C>) => void
  onDelete: (entry: Entry<C>) => void
}

const EMPTY: Record<Collection, string> = { incomes: 'ingresos', expenses: 'gastos', assets: 'activos' }

/** Table on wide screens, stacked cards on phones (same markup, CSS grid). */
export function EntryList<C extends Collection>({ collection, title, items, onAdd, onEdit, onDelete }: Props<C>) {
  const isAsset = collection === 'assets'
  return (
    <Panel
      title={title}
      className='entry-panel'
      aside={
        <button className='button small' onClick={onAdd}>
          <Plus size={15} /> Añadir
        </button>
      }
    >
      {!items.length ? (
        <Empty text={`Todavía no hay ${EMPTY[collection]}. Añade el primero para empezar.`} />
      ) : (
        <div className={`entries entries-${collection}`} role='table' aria-label={title}>
          <div className='entry-row entry-head' role='row'>
            <span role='columnheader'>Concepto</span>
            <span role='columnheader'>{isAsset ? 'Categoría' : 'Frecuencia'}</span>
            {collection === 'expenses' && <span role='columnheader'>Tipo</span>}
            <span role='columnheader' className='num'>
              {isAsset ? 'Coste' : 'Importe'}
            </span>
            <span role='columnheader' className='num'>
              {isAsset ? 'Valor actual' : 'Por mes'}
            </span>
            <span role='columnheader'>
              <span className='sr-only'>Acciones</span>
            </span>
          </div>
          <AnimatePresence initial={false}>
            {items.map((x) => (
              <motion.div
                key={x.id}
                layout
                role='row'
                className='entry-row'
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 36 }}
              >
                <Row collection={collection} entry={x} />
                <span role='cell' className='row-actions'>
                  <button className='icon-button' aria-label={`Editar ${x.name}`} onClick={() => onEdit(x)}>
                    <Pencil size={15} />
                  </button>
                  <button className='icon-button danger' aria-label={`Eliminar ${x.name}`} onClick={() => onDelete(x)}>
                    <Trash2 size={15} />
                  </button>
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Panel>
  )
}

function Row({ collection, entry }: { collection: Collection; entry: Income | Expense | Asset }) {
  if (collection === 'assets') {
    const a = entry as Asset
    const profit = a.value - a.cost
    return (
      <>
        <span role='cell' className='entry-name'>
          <strong>{a.name}</strong>
          <small className={profit < 0 ? 'is-negative' : 'is-positive'}>
            {profit >= 0 ? '+' : ''}
            {money(profit)}
          </small>
        </span>
        <span role='cell' className='entry-meta'>
          {a.category}
        </span>
        <span role='cell' className='num muted-cell' data-label='Coste'>
          {money(a.cost)}
        </span>
        <span role='cell' className='num entry-total'>
          {money(a.value)}
        </span>
      </>
    )
  }
  const e = entry as Income & Partial<Expense>
  return (
    <>
      <span role='cell' className='entry-name'>
        <strong>{e.name}</strong>
        {collection === 'expenses' && (
          <small>
            {e.category}
            {e.essential && <span className='essential-tag'>Esencial</span>}
          </small>
        )}
      </span>
      <span role='cell' className='entry-meta'>
        {e.frequency === 'annual' ? 'Anual' : 'Mensual'}
      </span>
      {collection === 'expenses' && (
        <span role='cell' className='entry-meta'>
          <span className='pill'>{e.kind === 'fixed' ? 'Fijo' : 'Variable'}</span>
        </span>
      )}
      <span role='cell' className='num muted-cell' data-label='Importe'>
        {money(e.amount)}
      </span>
      <span role='cell' className='num entry-total'>
        {money(monthly(e))}
      </span>
    </>
  )
}
