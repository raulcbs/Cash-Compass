import { motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import type { PlanStore } from '../../../application/use-plan'
import { assetsByCategory } from '../../../domain/finance'
import { money, percent } from '../../format'
import { AnimatedNumber } from '../../components/animated-number/animated-number'
import { TextButton } from '../../components/primitives/button'
import { CHART_COLORS } from '../../components/primitives/chart-colors'
import { Empty } from '../../components/primitives/empty'
import { Legend } from '../../components/primitives/legend'
import { Panel } from '../../components/primitives/panel'
import { Muted } from '../../components/primitives/text'
import styles from './portfolio-panel.module.css'

export function PortfolioPanel({ store, compact = false, onNavigate }: { store: PlanStore; compact?: boolean; onNavigate?: () => void }) {
  const { plan, summary: r } = store
  const groups = assetsByCategory(plan.assets)
  const share = (v: number) => (r.portfolio ? (v / r.portfolio) * 100 : 0)

  return (
    <Panel
      title='Tu cartera actual'
      className={compact ? undefined : styles.full}
      aside={
        compact && (
          <TextButton onClick={onNavigate}>
            Ver cartera <ChevronRight size={15} aria-hidden />
          </TextButton>
        )
      }
    >
      <div className={styles.value}>
        <strong>
          <AnimatedNumber value={r.portfolio} />
        </strong>
        <span className={r.profit < 0 ? 'is-negative' : 'is-positive'}>
          {r.profit >= 0 ? '+' : ''}
          {money(r.profit)} <small>sin realizar</small>
        </span>
      </div>
      <div className={styles.bar} aria-hidden>
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
        <Legend
          items={groups.map(([name, value], i) => ({
            label: name,
            color: CHART_COLORS[i % CHART_COLORS.length]!,
            value: (
              <>
                {!compact && <small>{money(value)}</small>}
                {percent(share(value))}
              </>
            ),
          }))}
        />
      )}
      {!compact && (
        <Muted className={styles.note}>
          Coste de adquisición: {money(r.cost)}. Plusvalía no realizada = valor actual − coste de adquisición. No incluye dividendos ni ventas.
        </Muted>
      )}
    </Panel>
  )
}
