import { AnimatePresence, motion } from 'motion/react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { monthly } from '../../../domain/finance'
import type { Asset, Collection, Entry, Expense, Income } from '../../../domain/types'
import { cx } from '../../cx'
import { money } from '../../format'
import { Button, IconButton } from '../primitives/button'
import { Empty } from '../primitives/empty'
import { Panel } from '../primitives/panel'
import { Pill } from '../primitives/pill'
import styles from './entry-list.module.css'

interface Props<C extends Collection> {
  collection: C
  title: string
  items: Entry<C>[]
  onAdd: () => void
  onEdit: (entry: Entry<C>) => void
  onDelete: (entry: Entry<C>) => void
}

const EMPTY: Record<Collection, string> = { incomes: 'ingresos', expenses: 'gastos', assets: 'activos' }

/** Table on wide screens, stacked rows on phones (same markup, CSS grid). */
export function EntryList<C extends Collection>({ collection, title, items, onAdd, onEdit, onDelete }: Props<C>) {
  const isAsset = collection === 'assets'
  return (
    <Panel
      title={title}
      className={styles.panel}
      aside={
        <Button size='sm' icon={<Plus size={15} />} onClick={onAdd}>
          Añadir
        </Button>
      }
    >
      {!items.length ? (
        <Empty text={`Todavía no hay ${EMPTY[collection]}. Añade el primero para empezar.`} />
      ) : (
        <div className={cx(styles.entries, collection === 'expenses' && styles.withKind)} role='table' aria-label={title}>
          <div className={cx(styles.row, styles.head)} role='row'>
            <span role='columnheader'>Concepto</span>
            <span role='columnheader'>{isAsset ? 'Categoría' : 'Frecuencia'}</span>
            {collection === 'expenses' && <span role='columnheader'>Tipo</span>}
            <span role='columnheader' className={styles.num}>
              {isAsset ? 'Coste' : 'Importe'}
            </span>
            <span role='columnheader' className={styles.num}>
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
                className={styles.row}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 36 }}
              >
                <Row collection={collection} entry={x} />
                <span role='cell' className={styles.actions}>
                  <IconButton aria-label={`Editar ${x.name}`} onClick={() => onEdit(x)}>
                    <Pencil size={15} />
                  </IconButton>
                  <IconButton tone='danger' aria-label={`Eliminar ${x.name}`} onClick={() => onDelete(x)}>
                    <Trash2 size={15} />
                  </IconButton>
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
        <span role='cell' className={styles.name}>
          <strong>{a.name}</strong>
          <small className={profit < 0 ? 'is-negative' : 'is-positive'}>
            {profit >= 0 ? '+' : ''}
            {money(profit)}
          </small>
        </span>
        <span role='cell' className={styles.meta}>
          {a.category}
        </span>
        <span role='cell' className={cx(styles.num, styles.secondary)} data-label='Coste'>
          {money(a.cost)}
        </span>
        <span role='cell' className={cx(styles.num, styles.total)}>
          {money(a.value)}
        </span>
      </>
    )
  }
  const e = entry as Income & Partial<Expense>
  return (
    <>
      <span role='cell' className={styles.name}>
        <strong>{e.name}</strong>
        {collection === 'expenses' && (
          <small>
            {e.category}
            {e.essential && <Pill tone='primary'>Esencial</Pill>}
          </small>
        )}
      </span>
      <span role='cell' className={styles.meta}>
        {e.frequency === 'annual' ? 'Anual' : 'Mensual'}
      </span>
      {collection === 'expenses' && (
        <span role='cell' className={styles.meta}>
          <Pill tone='neutral'>{e.kind === 'fixed' ? 'Fijo' : 'Variable'}</Pill>
        </span>
      )}
      <span role='cell' className={cx(styles.num, styles.secondary)} data-label='Importe'>
        {money(e.amount)}
      </span>
      <span role='cell' className={cx(styles.num, styles.total)}>
        {money(monthly(e))}
      </span>
    </>
  )
}
