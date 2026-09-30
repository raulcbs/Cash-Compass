import { motion } from 'motion/react'
import type { PlanStore } from '../../../application/use-plan'
import { plural, wholeMoney } from '../../format'
import { AnimatedNumber } from '../../components/animated-number/animated-number'
import { NumberField } from '../../components/number-field/number-field'
import { FormRow } from '../../components/primitives/field'
import { Panel } from '../../components/primitives/panel'
import { Pill } from '../../components/primitives/pill'
import { Footnote } from '../../components/primitives/text'
import styles from './emergency-panel.module.css'

/** Month marks on the reservoir wall; beyond this many they would crowd, so only the ends are labelled. */
const MAX_LABELLED_MONTHS = 8

export function EmergencyPanel({ store }: { store: PlanStore }) {
  const { summary: r, plan, setSetting } = store
  const s = plan.settings
  const progress = r.emergencyTarget > 0 ? Math.min(100, (s.liquidSavings / r.emergencyTarget) * 100) : 0
  const months = s.emergencyMonths
  const marks = Array.from({ length: months - 1 }, (_, i) => i + 1)
  const status =
    r.emergencyTarget === 0
      ? 'Añade gastos esenciales para calcular la cobertura'
      : r.emergencyGap === 0
        ? 'Tu colchón está completo'
        : `Faltan ${wholeMoney(r.emergencyGap)}${r.monthsToFund ? `, unos ${plural(r.monthsToFund, 'mes', 'meses')} al ritmo actual` : ''}`

  return (
    <Panel title='Tu colchón de seguridad' accent='rice' aside={<Pill tone='rice'>Fondo de emergencia</Pill>}>
      <div className={styles.layout}>
        {/* The fund as a reservoir: filled to the share of the target, marked by months of essential expenses. */}
        <div
          className={styles.reservoir}
          role='progressbar'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label='Progreso del fondo de emergencia'
        >
          <motion.span
            className={styles.level}
            initial={false}
            animate={{ height: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 90, damping: 20 }}
          />
          {marks.map((m) => (
            <span key={m} className={styles.mark} style={{ bottom: `${(m / months) * 100}%` }} aria-hidden>
              {months <= MAX_LABELLED_MONTHS && <small>{m}</small>}
            </span>
          ))}
          <span className={styles.percent} aria-hidden>
            {Math.round(progress)} %
          </span>
        </div>

        <div className={styles.facts}>
          <div className={styles.amount}>
            <strong>
              <AnimatedNumber value={s.liquidSavings} />
            </strong>
            <span>de {wholeMoney(r.emergencyTarget)} de objetivo</span>
          </div>
          <dl className={styles.coverage}>
            <div>
              <dt>Cubierto</dt>
              <dd className='tabular'>{r.coverage === null ? '—' : `${r.coverage.toFixed(1).replace('.', ',')} de ${months} meses`}</dd>
            </div>
          </dl>
          <p className={styles.status}>{status}</p>
        </div>
      </div>
      <FormRow>
        <NumberField label='Ahorro líquido actual' suffix='€' value={s.liquidSavings} onChange={(v) => setSetting('liquidSavings', v)} />
        <NumberField label='Meses de cobertura' value={months} min={1} max={24} integer onChange={(v) => setSetting('emergencyMonths', v)} />
      </FormRow>
      <Footnote>
        Objetivo = gastos esenciales × meses elegidos. No hay una cifra universal: elige los meses según tu situación. Solo cuenta el dinero líquido.
      </Footnote>
    </Panel>
  )
}
