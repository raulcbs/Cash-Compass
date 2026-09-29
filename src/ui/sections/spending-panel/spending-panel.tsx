import { ChevronRight } from 'lucide-react'
import type { PlanStore } from '../../../application/use-plan'
import { groupBy, monthly } from '../../../domain/finance'
import { money } from '../../format'
import { BarList } from '../../components/primitives/bar-list'
import { TextButton } from '../../components/primitives/button'
import { CHART_COLORS } from '../../components/primitives/chart-colors'
import { Empty } from '../../components/primitives/empty'
import { Panel } from '../../components/primitives/panel'

export function SpendingPanel({ store, onNavigate }: { store: PlanStore; onNavigate: () => void }) {
  const groups = groupBy(store.plan.expenses, (x) => x.category, monthly)
  const max = Math.max(...groups.map(([, v]) => v), 1)

  return (
    <Panel
      title='¿Dónde va tu dinero?'
      aside={
        <TextButton onClick={onNavigate}>
          Ver gastos <ChevronRight size={15} aria-hidden />
        </TextButton>
      }
    >
      {!groups.length ? (
        <Empty text='Añade tus gastos para ver qué categorías pesan más.' />
      ) : (
        <BarList
          items={groups.slice(0, 5).map(([name, value], i) => ({
            label: name,
            percent: (value / max) * 100,
            color: CHART_COLORS[i % CHART_COLORS.length],
            value: money(value),
          }))}
        />
      )}
    </Panel>
  )
}
