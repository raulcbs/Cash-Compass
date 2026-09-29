import { SlidersHorizontal, TrendingUp } from 'lucide-react'
import { useId } from 'react'
import type { PlanStore } from '../../application/use-plan'
import { ROUNDING_STEPS } from '../../domain/types'
import { AnimatedNumber } from '../components/animated-number'
import { Panel } from '../components/primitives'
import { Segmented } from '../components/segmented'
import { money, percent, wholeMoney } from '../format'

export function AllocationPanel({ store }: { store: PlanStore }) {
  const { summary: r, plan, setSetting } = store
  const s = plan.settings
  const fundTime = r.monthsToFund === 0 ? 'Ya completo' : r.monthsToFund === null ? 'Sin fecha' : `${r.monthsToFund} ${r.monthsToFund === 1 ? 'mes' : 'meses'}`
  const message =
    r.available < 0
      ? 'Tus gastos superan tus ingresos: no queda dinero para ti, para ahorrar ni para invertir.'
      : r.emergencyGap > 0
        ? `Tu fondo de emergencia aún no está completo. Cuando lo esté, invertirás ${wholeMoney(r.investmentAfterFund)} al mes.`
        : 'Tu fondo de emergencia está completo: después de tu parte, todo lo que sobra va a inversión.'

  return (
    <Panel
      title='Tu reparto automático'
      className='allocation'
      aside={
        <span className='pill'>
          <SlidersHorizontal size={12} /> Ajustable
        </span>
      }
    >
      <p className='muted'>{message}</p>
      <div className='allocation-result'>
        <div>
          <small>Puedes invertir</small>
          <strong>
            <AnimatedNumber value={r.investment} format={wholeMoney} />
          </strong>
          <span>al mes · {percent(r.investmentPercent)} de tus ingresos</span>
        </div>
        <span className='result-icon' aria-hidden>
          <TrendingUp size={22} />
        </span>
      </div>
      <dl className='allocation-details'>
        <div>
          <dt>Para ti</dt>
          <dd>
            {money(r.personal)} <small>{percent(r.personalPercent)}</small>
          </dd>
        </div>
        <div>
          <dt>Al fondo</dt>
          <dd>
            {wholeMoney(r.savings)} <small>{percent(r.savingsPercent)}</small>
          </dd>
        </div>
        <div>
          <dt>Fondo completo en</dt>
          <dd>{fundTime}</dd>
        </div>
      </dl>
      <Range
        label='Del sobrante, para ti'
        hint='Caprichos, salidas, compras'
        value={s.personalSplit}
        onChange={(v) => setSetting('personalSplit', v)}
        ends={['0 %', '100 %']}
        tone='plum'
      />
      <Range
        label='Del resto, al fondo de emergencia'
        hint='Solo mientras no esté completo'
        value={s.savingsSplit}
        onChange={(v) => setSetting('savingsSplit', v)}
        ends={['Todo a inversión', 'Todo al fondo']}
        tone='sea'
      />
      <Segmented
        label='Redondear fondo e inversión a'
        value={s.roundingStep}
        options={ROUNDING_STEPS.map((step) => [step, `${step} €`])}
        onChange={(v) => setSetting('roundingStep', v)}
      />
      <p className='footnote'>
        Orden de prioridad: tus gastos, tu parte, el fondo de emergencia y el resto a inversión. Lo que sobra o falta al redondear se ajusta en tu parte. El
        ocio que ya registraste está en tus gastos; tu parte es dinero adicional. Es un criterio, no una recomendación financiera personalizada.
      </p>
    </Panel>
  )
}

function Range({
  label,
  hint,
  value,
  onChange,
  ends,
  tone,
}: {
  label: string
  hint: string
  value: number
  onChange: (v: number) => void
  ends: [string, string]
  tone: 'plum' | 'sea'
}) {
  const id = useId()
  return (
    <div className={`range-field tone-${tone}`}>
      <div className='range-heading'>
        <label htmlFor={id}>
          {label}
          <small>{hint}</small>
        </label>
        <output htmlFor={id} className='tabular'>
          {value}
          <small>%</small>
        </output>
      </div>
      <input
        id={id}
        className='range'
        type='range'
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--range': `${value}%` } as React.CSSProperties}
      />
      <div className='range-ends'>
        <span>{ends[0]}</span>
        <span>{ends[1]}</span>
      </div>
    </div>
  )
}
