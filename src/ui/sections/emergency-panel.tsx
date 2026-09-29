import { LifeBuoy } from 'lucide-react'
import type { PlanStore } from '../../application/use-plan'
import { AnimatedNumber } from '../components/animated-number'
import { NumberField } from '../components/number-field'
import { Bar, Panel } from '../components/primitives'
import { wholeMoney } from '../format'

export function EmergencyPanel({ store }: { store: PlanStore }) {
  const { summary: r, plan, setSetting } = store
  const s = plan.settings
  const progress = r.emergencyTarget > 0 ? Math.min(100, (s.liquidSavings / r.emergencyTarget) * 100) : 0

  return (
    <Panel title='Tu colchón de seguridad' icon={LifeBuoy} className='emergency' aside={<span className='pill tone-sea'>Fondo de emergencia</span>}>
      <div className='emergency-amount'>
        <strong>
          <AnimatedNumber value={s.liquidSavings} />
        </strong>
        <span>de {wholeMoney(r.emergencyTarget)} de objetivo</span>
      </div>
      <div
        className='progress-track'
        role='progressbar'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label='Progreso del fondo de emergencia'
      >
        <Bar percent={progress} className='progress-fill' />
      </div>
      <div className='progress-caption'>
        <span>{r.coverage === null ? 'Añade gastos esenciales para calcular la cobertura' : `${r.coverage.toFixed(1).replace('.', ',')} meses cubiertos`}</span>
        <strong className='tabular'>{Math.round(progress)} %</strong>
      </div>
      <div className='form-row'>
        <NumberField label='Ahorro líquido actual' suffix='€' value={s.liquidSavings} onChange={(v) => setSetting('liquidSavings', v)} />
        <NumberField label='Meses de cobertura' value={s.emergencyMonths} min={1} max={24} integer onChange={(v) => setSetting('emergencyMonths', v)} />
      </div>
      <p className='footnote'>
        Objetivo = gastos esenciales × meses elegidos. No hay una cifra universal: elige los meses según tu situación. Solo cuenta el dinero líquido.
      </p>
    </Panel>
  )
}
