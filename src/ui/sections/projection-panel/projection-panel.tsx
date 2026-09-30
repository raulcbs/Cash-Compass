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

/** The curve leads; the two end figures sit under it and double as its legend. */
export function ProjectionPanel({ store, compact = false }: { store: PlanStore; compact?: boolean }) {
  const { plan, summary: r, setSetting } = store
  const points = useMemo(() => projection(plan), [plan])
  const last = points.at(-1)!
  const years = plan.settings.horizonYears
  const horizon = `${years} ${years === 1 ? 'año' : 'años'}`

  return (
    <Panel title='El tiempo también suma' accent='crop' aside={<Pill tone='neutral'>Hipotético</Pill>}>
      <ProjectionChart points={points} compact={compact} ariaLabel={`Proyección de ${wholeMoney(r.portfolio)} a ${wholeMoney(last.value)} en ${horizon}`} />
      <dl className={styles.ends}>
        <div>
          <dt>
            <i className={styles.value} aria-hidden />
            Valor proyectado en {horizon}
          </dt>
          <dd className={styles.projected}>
            <AnimatedNumber value={last.value} format={wholeMoney} />
          </dd>
        </div>
        <div>
          <dt>
            <i className={styles.contributed} aria-hidden />
            Capital y aportaciones
          </dt>
          <dd>
            <AnimatedNumber value={last.contributed} format={wholeMoney} />
          </dd>
        </div>
      </dl>
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
