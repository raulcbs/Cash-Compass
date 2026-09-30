import { SlidersHorizontal } from 'lucide-react'
import { useId, type CSSProperties } from 'react'
import type { PlanStore } from '../../../application/use-plan'
import { ROUNDING_STEPS } from '../../../domain/types'
import { cx } from '../../cx'
import { money, percent, wholeMoney } from '../../format'
import { AnimatedNumber } from '../../components/animated-number/animated-number'
import { Panel } from '../../components/primitives/panel'
import { Pill } from '../../components/primitives/pill'
import { Footnote, Muted } from '../../components/primitives/text'
import { Segmented } from '../../components/segmented/segmented'
import styles from './allocation-panel.module.css'

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
      aside={
        <Pill>
          <SlidersHorizontal size={12} aria-hidden /> Ajustable
        </Pill>
      }
    >
      <Muted>{message}</Muted>
      <div className={styles.result}>
        <div>
          <span className={styles.resultLabel}>Puedes invertir</span>
          <strong className={styles.resultValue}>
            <AnimatedNumber value={r.investment} format={wholeMoney} />
          </strong>
          <span className={styles.resultLabel}>al mes, {percent(r.investmentPercent)} de tus ingresos</span>
        </div>
      </div>
      <dl className={styles.details}>
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
        tone='orange'
      />
      <Range
        label='Del resto, al fondo de emergencia'
        hint='Solo mientras no esté completo'
        value={s.savingsSplit}
        onChange={(v) => setSetting('savingsSplit', v)}
        ends={['Todo a inversión', 'Todo al fondo']}
        tone='rice'
      />
      <Segmented
        label='Redondear fondo e inversión a'
        value={s.roundingStep}
        options={ROUNDING_STEPS.map((step) => [step, `${step} €`])}
        onChange={(v) => setSetting('roundingStep', v)}
      />
      <Footnote>
        Orden de prioridad: tus gastos, tu parte, el fondo de emergencia y el resto a inversión. Lo que sobra o falta al redondear se ajusta en tu parte. El
        ocio que ya registraste está en tus gastos; tu parte es dinero adicional. Es un criterio, no una recomendación financiera personalizada.
      </Footnote>
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
  tone: 'orange' | 'rice'
}) {
  const id = useId()
  return (
    <div className={cx(styles.range, tone === 'rice' && styles.rice)}>
      <div className={styles.rangeHeading}>
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
        className={styles.slider}
        type='range'
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--fill': `${value}%` } as CSSProperties}
      />
      <div className={styles.rangeEnds}>
        <span>{ends[0]}</span>
        <span>{ends[1]}</span>
      </div>
    </div>
  )
}
