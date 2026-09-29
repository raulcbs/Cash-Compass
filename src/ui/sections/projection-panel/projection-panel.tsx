import { useMemo } from 'react'
import type { PlanStore } from '../../../application/use-plan'
import { projection } from '../../../domain/finance'
import { wholeMoney } from '../../format'
import { AnimatedNumber } from '../../components/animated-number/animated-number'
import { NumberField } from '../../components/number-field/number-field'
import { FormRow } from '../../components/primitives/field'
import { Panel } from '../../components/primitives/panel'
import { Pill } from '../../components/primitives/pill'
import { Footnote } from '../../components/primitives/text'
import { ProjectionChart } from '../../components/projection-chart/projection-chart'
import styles from './projection-panel.module.css'

export function ProjectionPanel({ store, compact = false }: { store: PlanStore; compact?: boolean }) {
  const { plan, summary: r, setSetting } = store
  const points = useMemo(() => projection(plan), [plan])
  const last = points.at(-1)!
  const years = plan.settings.horizonYears

  return (
    <Panel title='El tiempo también suma' aside={<Pill tone='neutral'>Hipotético</Pill>}>
      <div className={styles.total}>
        <strong>
          <AnimatedNumber value={last.value} format={wholeMoney} />
        </strong>
        <span>
          en {years} {years === 1 ? 'año' : 'años'}, con {wholeMoney(last.contributed)} aportados
        </span>
      </div>
      <ProjectionChart points={points} compact={compact} ariaLabel={`Proyección de ${wholeMoney(r.portfolio)} a ${wholeMoney(last.value)} en ${years} años`} />
      <div className={styles.legend}>
        <span>
          <i className={styles.value} />
          Valor proyectado
        </span>
        <span>
          <i className={styles.contributed} />
          Capital y aportaciones
        </span>
      </div>
      <FormRow>
        <NumberField
          label='Rentabilidad anual supuesta'
          suffix='%'
          value={plan.settings.annualReturn}
          min={-99.9}
          max={100}
          onChange={(v) => setSetting('annualReturn', v)}
        />
        <NumberField label='Horizonte' suffix='años' value={years} min={1} max={50} integer onChange={(v) => setSetting('horizonYears', v)} />
      </FormRow>
      <Footnote>
        {r.monthsToFund
          ? `Aportas ${wholeMoney(r.investment)} al mes hasta completar el fondo y ${wholeMoney(r.investmentAfterFund)} después, al final de cada mes.`
          : `Aportas ${wholeMoney(r.investment)} al final de cada mes.`}{' '}
        Sin impuestos, comisiones ni inflación. La rentabilidad es una hipótesis; puedes perder capital.
      </Footnote>
    </Panel>
  )
}
