import { ChevronRight } from 'lucide-react'
import type { PlanStore } from '../../application/use-plan'
import { groupBy, monthly } from '../../domain/finance'
import { Bar, CHART_COLORS, Empty, Panel } from '../components/primitives'
import { money } from '../format'

export function SpendingPanel({ store, onNavigate }: { store: PlanStore; onNavigate: () => void }) {
  const groups = groupBy(store.plan.expenses, (x) => x.category, monthly)
  const max = Math.max(...groups.map(([, v]) => v), 1)

  return (
    <Panel
      title='¿Dónde va tu dinero?'
      aside={
        <button className='text-button' onClick={onNavigate}>
          Ver gastos <ChevronRight size={15} />
        </button>
      }
    >
      {!groups.length ? (
        <Empty text='Añade tus gastos para ver qué categorías pesan más.' />
      ) : (
        <ul className='spending-bars'>
          {groups.slice(0, 5).map(([name, value], i) => (
            <li key={name}>
              <span>{name}</span>
              <span className='bar-track'>
                <Bar percent={(value / max) * 100} color={CHART_COLORS[i % CHART_COLORS.length]} />
              </span>
              <strong className='tabular'>{money(value)}</strong>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
