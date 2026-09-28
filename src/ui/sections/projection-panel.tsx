import { useMemo } from 'react'
import type { PlanStore } from '../../application/use-plan'
import { projection } from '../../domain/finance'
import { AnimatedNumber } from '../components/animated-number'
import { NumberField } from '../components/number-field'
import { Panel } from '../components/primitives'
import { ProjectionChart } from '../components/projection-chart'
import { money } from '../format'

export function ProjectionPanel({ store, compact = false }: { store: PlanStore; compact?: boolean }) {
  const { plan, summary: r, setSetting } = store
  const points = useMemo(() => projection(plan), [plan])
  const last = points.at(-1)!
  const years = plan.settings.horizonYears

  return (
    <Panel title='El tiempo también suma' className={compact ? 'projection compact' : 'projection'} aside={<span className='pill neutral'>Hipotético</span>}>
      <div className='projection-total'>
        <strong>
          <AnimatedNumber value={last.value} />
        </strong>
        <span>
          en {years} {years === 1 ? 'año' : 'años'} · {money(last.contributed)} aportados
        </span>
      </div>
      <ProjectionChart points={points} ariaLabel={`Proyección de ${money(r.portfolio)} a ${money(last.value)} en ${years} años`} />
      <div className='chart-legend'>
        <span>
          <i className='swatch-value' />
          Valor proyectado
        </span>
        <span>
          <i className='swatch-contributed' />
          Capital y aportaciones
        </span>
      </div>
      <div className='form-row'>
        <NumberField
          label='Rentabilidad anual supuesta'
          suffix='%'
          value={plan.settings.annualReturn}
          min={-99.9}
          max={100}
          onChange={(v) => setSetting('annualReturn', v)}
        />
        <NumberField label='Horizonte' suffix='años' value={years} min={1} max={50} integer onChange={(v) => setSetting('horizonYears', v)} />
      </div>
      <p className='footnote'>
        {r.monthsToFund
          ? `Aportas ${money(r.investment)} al mes hasta completar el fondo y ${money(r.allocable)} después, al final de cada mes.`
          : `Aportas ${money(r.investment)} al final de cada mes.`}{' '}
        Sin impuestos, comisiones ni inflación. La rentabilidad es una hipótesis; puedes perder capital.
      </p>
    </Panel>
  )
}
