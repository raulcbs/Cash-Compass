import { motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import type { PlanStore } from '../../application/use-plan'
import { assetsByCategory } from '../../domain/finance'
import { AnimatedNumber } from '../components/animated-number'
import { CHART_COLORS, Empty, Panel } from '../components/primitives'
import { money, percent } from '../format'

export function PortfolioPanel({ store, compact = false, onNavigate }: { store: PlanStore; compact?: boolean; onNavigate?: () => void }) {
  const { plan, summary: r } = store
  const groups = assetsByCategory(plan.assets)
  const share = (v: number) => (r.portfolio ? (v / r.portfolio) * 100 : 0)

  return (
    <Panel
      title='Tu cartera actual'
      className='portfolio'
      aside={
        compact && (
          <button className='text-button' onClick={onNavigate}>
            Ver cartera <ChevronRight size={15} />
          </button>
        )
      }
    >
      <div className='portfolio-value'>
        <strong>
          <AnimatedNumber value={r.portfolio} />
        </strong>
        <span className={r.profit < 0 ? 'is-negative' : 'is-positive'}>
          {r.profit >= 0 ? '+' : ''}
          {money(r.profit)} <small>sin realizar</small>
        </span>
      </div>
      <div className='allocation-bar' aria-hidden>
        {groups.map(([name, value], i) => (
          <motion.span
            key={name}
            initial={false}
            animate={{ flexGrow: share(value) }}
            style={{ background: CHART_COLORS[i % CHART_COLORS.length], flexBasis: 0 }}
            title={`${name}: ${money(value)}`}
          />
        ))}
      </div>
      {!groups.length ? (
        <Empty text='Registra tus activos para ver cómo se distribuyen.' />
      ) : (
        <ul className='legend'>
          {groups.map(([name, value], i) => (
            <li key={name}>
              <span>
                <i style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {name}
              </span>
              <strong className='tabular'>
                {percent(share(value))}
                {!compact && <small> · {money(value)}</small>}
              </strong>
            </li>
          ))}
        </ul>
      )}
      {!compact && (
        <p className='muted portfolio-note'>
          Coste de adquisición: {money(r.cost)}. Plusvalía no realizada = valor actual − coste de adquisición. No incluye dividendos ni ventas.
        </p>
      )}
    </Panel>
  )
}
