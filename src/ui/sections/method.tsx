import type { ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'

function Source({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className='source' href={href} target='_blank' rel='noreferrer'>
      {children} <ExternalLink size={12} aria-hidden />
    </a>
  )
}

function Formula({ lines }: { lines: string[] }) {
  return (
    <div className='formula'>
      {lines.map((l) => (
        <code key={l}>{l}</code>
      ))}
    </div>
  )
}

export function Method() {
  return (
    <div className='method'>
      <section className='panel'>
        <h2>El presupuesto determina lo que puedes ahorrar e invertir</h2>
        <p>Usamos tus ingresos netos y todos tus gastos. Un pago anual se convierte en su equivalente mensual dividiéndolo entre 12.</p>
        <Formula
          lines={[
            'Margen mensual = ingresos netos − gastos mensuales',
            'Sobrante = máximo(0, margen)',
            'Para ti = sobrante × % para ti / 100',
            'Resto = sobrante − para ti',
            'Falta del fondo = máximo(0, objetivo del fondo − ahorro líquido)',
            'Ahorro = mínimo(resto × % al fondo / 100, falta del fondo)',
            'Inversión = resto − ahorro',
          ]}
        />
        <p>
          El orden de prioridad es: gastos, tu parte, fondo de emergencia e inversión. Tu parte se reserva siempre, también con el fondo completo. Mientras el
          fondo no esté completo, el resto se reparte según el porcentaje que elijas; cuando se completa, todo el resto va a inversión. Un resultado negativo se
          muestra como déficit. Es un criterio de prioridad: ninguna fórmula determina un porcentaje universal que debas invertir.
        </p>
        <div className='sources'>
          <Source href='https://www.consumerfinance.gov/archive/blog/budgeting-how-to-create-a-budget-and-stick-with-it/'>
            CFPB: elaboración de un presupuesto
          </Source>
          <Source href='https://www.consumerfinance.gov/owning-a-home/prepare/assess-your-spending/'>CFPB: evaluación de gastos</Source>
        </div>
      </section>

      <section className='panel'>
        <h2>Tu fondo de emergencia</h2>
        <Formula lines={['Objetivo = gastos esenciales × meses elegidos', 'Cobertura = ahorro líquido / gastos esenciales mensuales']} />
        <p>
          Si no hay gastos esenciales, la cobertura no se puede calcular. El número de meses es una decisión personal. El ahorro líquido es independiente de tu
          cartera de inversión.
        </p>
        <div className='sources'>
          <Source href='https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/'>CFPB: guía del fondo de emergencia</Source>
        </div>
      </section>

      <section className='panel'>
        <h2>Interés compuesto con aportaciones mensuales</h2>
        <Formula lines={['i = (1 + rentabilidad anual / 100)^(1/12) − 1', 'VF = capital inicial × (1+i)^n + aportación × ((1+i)^n − 1) / i']} />
        <p>
          n es el número de meses y las aportaciones se hacen al final de cada mes. Con rentabilidad cero: VF = capital inicial + aportación × n. Se admiten
          rentabilidades negativas mayores que −100 %. La tasa anual es efectiva; la mensual se obtiene por equivalencia compuesta.
        </p>
        <p>
          Otras calculadoras, como la de Investor.gov, tratan la tasa como nominal y la dividen entre 12. Con la misma cifra, esa convención da un resultado
          algo mayor: 10.000 € más 200 € al mes al 7 % durante 20 años suman unos 140.204 € aquí y unos 144.573 € con tasa nominal. Ambos cálculos son
          correctos; solo cambia el supuesto.
        </p>
        <p>
          Como la aportación sube al completar el fondo de emergencia, la proyección se calcula mes a mes: valor = valor × (1+i) + aportación del mes. Con
          aportación constante coincide con la fórmula anterior. No contempla impuestos, comisiones ni inflación. No es una predicción ni una garantía.
        </p>
        <div className='sources'>
          <Source href='https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator'>
            Investor.gov: calculadora de interés compuesto
          </Source>
          <Source href='https://courseware.cemc.uwaterloo.ca/45/assignments/1214/7'>University of Waterloo: anualidades ordinarias</Source>
        </div>
      </section>

      <section className='panel'>
        <h2>Datos y privacidad</h2>
        <p>
          Los datos se guardan en el almacenamiento local de este navegador y no se sincronizan entre dispositivos. Si borras los datos del navegador, puedes
          perder tu plan: exporta una copia JSON y guárdala en un lugar seguro. Tus datos financieros no se envían a ningún servidor y la aplicación no carga
          recursos externos.
        </p>
      </section>
    </div>
  )
}
