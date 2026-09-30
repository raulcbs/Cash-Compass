import { ChevronRight } from 'lucide-react'
import type { PlanStore } from '../../../application/use-plan'
import { assetsByCategory } from '../../../domain/finance'
import { money, percent } from '../../format'
import { AnimatedNumber } from '../../components/animated-number/animated-number'
import { Bar } from '../../components/primitives/bar'
import { TextButton } from '../../components/primitives/button'
import { CHART_COLORS } from '../../components/primitives/chart-colors'
import { Empty } from '../../components/primitives/empty'
import { Panel } from '../../components/primitives/panel'
import { Muted } from '../../components/primitives/text'
import styles from './portfolio-panel.module.css'

/** The portfolio as a plot of terraces: one row per asset category, the total and gain on a ruled footing. */
export function PortfolioPanel({ store, compact = false, onNavigate }: { store: PlanStore; compact?: boolean; onNavigate?: () => void }) {
  const { plan, summary: r } = store
  const groups = assetsByCategory(plan.assets)
  const share = (v: number) => (r.portfolio ? (v / r.portfolio) * 100 : 0)

  return (
    <Panel
      title='Tu cartera actual'
      accent='crop'
      className={compact ? undefined : styles.full}
      aside={
        compact && (
          <TextButton onClick={onNavigate}>
            Ver cartera <ChevronRight size={15} aria-hidden />
          </TextButton>
        )
      }
    >
      {!groups.length ? (
        <Empty text='Registra tus activos para ver cómo se distribuyen.' />
      ) : (
        <ul className={styles.plots}>
          {groups.map(([name, value], i) => (
            <li key={name}>
              <span className={styles.name}>{name}</span>
              <span className={styles.share}>{percent(share(value))}</span>
              <strong className={styles.value}>{money(value)}</strong>
              <Bar percent={share(value)} color={CHART_COLORS[i % CHART_COLORS.length]} />
            </li>
          ))}
        </ul>
      )}
      <div className={styles.footing}>
        <div>
          <span>Valor total</span>
          <strong>
            <AnimatedNumber value={r.portfolio} />
          </strong>
        </div>
        <div>
          <span>Sin realizar</span>
          <strong className={r.profit < 0 ? 'is-negative' : 'is-positive'}>
            {r.profit >= 0 ? '+' : ''}
            {money(r.profit)}
          </strong>
        </div>
      </div>
      {!compact && (
        <Muted className={styles.note}>
          Coste de adquisición: {money(r.cost)}. Plusvalía no realizada = valor actual − coste de adquisición. No incluye dividendos ni ventas.
        </Muted>
      )}
    </Panel>
  )
}
