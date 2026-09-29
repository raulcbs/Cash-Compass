import { LifeBuoy } from 'lucide-react'
import type { PlanStore } from '../../../application/use-plan'
import { wholeMoney } from '../../format'
import { AnimatedNumber } from '../../components/animated-number/animated-number'
import { NumberField } from '../../components/number-field/number-field'
import { Bar } from '../../components/primitives/bar'
import { FormRow } from '../../components/primitives/field'
import { Panel } from '../../components/primitives/panel'
import { Pill } from '../../components/primitives/pill'
import { Footnote } from '../../components/primitives/text'
import styles from './emergency-panel.module.css'

export function EmergencyPanel({ store }: { store: PlanStore }) {
  const { summary: r, plan, setSetting } = store
  const s = plan.settings
  const progress = r.emergencyTarget > 0 ? Math.min(100, (s.liquidSavings / r.emergencyTarget) * 100) : 0

  return (
    <Panel title='Tu colchón de seguridad' icon={LifeBuoy} aside={<Pill tone='saffron'>Fondo de emergencia</Pill>}>
      <div className={styles.amount}>
        <strong>
          <AnimatedNumber value={s.liquidSavings} />
        </strong>
        <span>de {wholeMoney(r.emergencyTarget)} de objetivo</span>
      </div>
      <Bar
        percent={progress}
        color='var(--saffron)'
        role='progressbar'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label='Progreso del fondo de emergencia'
      />
      <div className={styles.caption}>
        <span>{r.coverage === null ? 'Añade gastos esenciales para calcular la cobertura' : `${r.coverage.toFixed(1).replace('.', ',')} meses cubiertos`}</span>
        <strong className='tabular'>{Math.round(progress)} %</strong>
      </div>
      <FormRow>
        <NumberField label='Ahorro líquido actual' suffix='€' value={s.liquidSavings} onChange={(v) => setSetting('liquidSavings', v)} />
        <NumberField label='Meses de cobertura' value={s.emergencyMonths} min={1} max={24} integer onChange={(v) => setSetting('emergencyMonths', v)} />
      </FormRow>
      <Footnote>
        Objetivo = gastos esenciales × meses elegidos. No hay una cifra universal: elige los meses según tu situación. Solo cuenta el dinero líquido.
      </Footnote>
    </Panel>
  )
}
