import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { ArrowDownRight, ArrowUpRight, Coins, Download, LifeBuoy, Plus, ShieldCheck, TrendingUp, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { usePlan } from '../application/use-plan'
import type { Collection, Entry, Plan } from '../domain/types'
import { exportPlan, readBackup } from '../infrastructure/backup'
import { EntryForm, NOUN } from './components/entry-form'
import { EntryList } from './components/entry-list'
import { Modal } from './components/modal'
import { Metric } from './components/primitives'
import { plural } from './format'
import { AllocationPanel } from './sections/allocation-panel'
import { EmergencyPanel } from './sections/emergency-panel'
import { SECTIONS, type SectionId } from './sections'
import { Method } from './sections/method'
import { MonthPanel } from './sections/month-panel'
import { PortfolioPanel } from './sections/portfolio-panel'
import { ProjectionPanel } from './sections/projection-panel'
import { SpendingPanel } from './sections/spending-panel'

type ModalState =
  | { type: 'entry'; collection: Collection; entry?: Entry<Collection> }
  | { type: 'delete'; collection: Collection; entry: Entry<Collection> }
  | { type: 'demo' }
  | { type: 'reset' }
  | { type: 'import'; plan: Plan }

const CONFIRM = {
  demo: {
    title: 'Cargar datos de ejemplo',
    body: 'Se sustituirá tu plan por un ejemplo ficticio. Puedes modificarlo o empezar de cero después.',
    action: 'Cargar ejemplo',
  },
  reset: { title: 'Empezar de cero', body: 'Se eliminarán los datos de este plan. Exporta antes una copia si quieres conservarlos.', action: 'Borrar plan' },
  import: {
    title: 'Importar copia de seguridad',
    body: 'El archivo es válido. Su contenido sustituirá tu plan actual. Exporta primero si quieres conservar tus datos actuales.',
    action: 'Importar datos',
  },
} as const

const sectionFromHash = (): SectionId => {
  const id = window.location.hash.slice(1)
  return SECTIONS.some((s) => s.id === id) ? (id as SectionId) : 'overview'
}

export function App() {
  const store = usePlan()
  const { plan, summary: r, status, notice, setNotice } = store
  const [section, setSection] = useState<SectionId>(sectionFromHash)
  const [modal, setModal] = useState<ModalState | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const meta = SECTIONS.find((s) => s.id === section)!

  useEffect(() => {
    const onHash = () => setSection(sectionFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = (id: SectionId) => {
    if (id !== section) window.location.hash = id
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const addEntry = (collection: Collection) => setModal({ type: 'entry', collection })
  const listHandlers = <C extends Collection>(collection: C) => ({
    onAdd: () => addEntry(collection),
    onEdit: (entry: Entry<C>) => setModal({ type: 'entry', collection, entry }),
    onDelete: (entry: Entry<C>) => setModal({ type: 'delete', collection, entry }),
  })

  async function importFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      setModal({ type: 'import', plan: await readBackup(file) })
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'No se pudo leer el archivo.')
    }
  }

  function confirm() {
    if (!modal) return
    if (modal.type === 'delete') store.removeEntry(modal.collection, modal.entry.id)
    if (modal.type === 'demo') store.loadDemo()
    if (modal.type === 'reset') store.reset()
    if (modal.type === 'import') {
      store.replace(modal.plan)
      setNotice('Copia importada y guardada.')
    }
    setModal(null)
  }

  const primary: Collection = section === 'portfolio' ? 'assets' : 'expenses'
  const isEmpty = !plan.incomes.length && !plan.expenses.length

  return (
    <MotionConfig reducedMotion='user'>
      <div className='app'>
        <aside className='sidebar'>
          <a href='#overview' className='brand' onClick={() => navigate('overview')}>
            <BrandMark />
            <span>
              Cash Compass
              <small>Tu dinero, con rumbo</small>
            </span>
          </a>
          <nav aria-label='Principal' className='nav'>
            {SECTIONS.map(({ id, label, short, icon: Icon }) => (
              <button
                key={id}
                className={section === id ? 'nav-item active' : 'nav-item'}
                aria-current={section === id ? 'page' : undefined}
                onClick={() => navigate(id)}
              >
                {section === id && <motion.span layoutId='nav-active' className='nav-highlight' transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                <Icon size={19} aria-hidden />
                <span className='nav-label'>{label}</span>
                <span className='nav-short'>{short}</span>
              </button>
            ))}
          </nav>
          <div className='privacy'>
            <ShieldCheck size={20} aria-hidden />
            <p>
              <strong>Tus datos son tuyos</strong>
              Guardados en este navegador, sin conexión con tu banco.
            </p>
          </div>
        </aside>

        <div className='workspace'>
          <header className='topbar'>
            <a href='#overview' className='brand compact' onClick={() => navigate('overview')} aria-label='Cash Compass, ir al resumen'>
              <BrandMark />
              <span>Cash Compass</span>
            </a>
            <span className='crumb'>
              Mi planificación <span aria-hidden>/</span> <strong>{meta.label}</strong>
            </span>
            <div className='top-actions'>
              <span className={status === 'error' ? 'save-status error' : 'save-status'} role='status'>
                <i aria-hidden />
                <span>{status === 'error' ? 'Sin guardar' : 'Guardado en este dispositivo'}</span>
              </span>
              <button
                className='icon-button'
                title='Exportar copia'
                aria-label='Exportar copia de seguridad'
                onClick={() => (exportPlan(plan), setNotice('Descarga de la copia de seguridad iniciada.'))}
              >
                <Download size={18} />
              </button>
              <button className='icon-button' title='Importar copia' aria-label='Importar copia de seguridad' onClick={() => fileRef.current?.click()}>
                <Upload size={18} />
              </button>
              <input hidden ref={fileRef} type='file' accept='.json,application/json' onChange={importFile} />
            </div>
          </header>

          <main>
            <div className='page-heading'>
              <div>
                <h1>{meta.title}</h1>
                <p>{meta.lead}</p>
              </div>
              {section !== 'method' && (
                <button className='button primary add-button' onClick={() => addEntry(primary)}>
                  <Plus size={17} /> <span>Añadir {NOUN[primary]}</span>
                </button>
              )}
            </div>

            <AnimatePresence>
              {notice && (
                <motion.div
                  className='notice'
                  role='status'
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p>{notice}</p>
                  <button className='icon-button' aria-label='Cerrar aviso' onClick={() => setNotice('')}>
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {isEmpty && (
              <div className='onboarding'>
                <div>
                  <strong>Tu plan empieza con tus datos</strong>
                  <p>Añade tu salario y tus gastos para conocer tu margen real.</p>
                </div>
                <div className='onboarding-actions'>
                  <button className='button primary' onClick={() => addEntry('incomes')}>
                    Añadir ingreso
                  </button>
                  <button className='text-button' onClick={() => setModal({ type: 'demo' })}>
                    Explorar con un ejemplo
                  </button>
                </div>
              </div>
            )}
            {plan.isDemo && (
              <p className='demo-banner'>
                Estás viendo datos de ejemplo. Sustitúyelos por tus importes o <button onClick={() => setModal({ type: 'reset' })}>empieza de cero</button>.
              </p>
            )}

            <AnimatePresence mode='wait' initial={false}>
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {section === 'overview' && (
                  <>
                    <div className='metrics'>
                      <Metric
                        label='Ingresos mensuales'
                        value={r.income}
                        icon={ArrowUpRight}
                        note={plural(plan.incomes.length, 'fuente de ingresos', 'fuentes de ingresos')}
                        tone='blue'
                      />
                      <Metric label='Gastos mensuales' value={r.expenses} icon={ArrowDownRight} note='Fijos y variables' tone='brass' />
                      <Metric label='Margen antes de objetivos' value={r.available} icon={Coins} note='Ingresos menos gastos' tone='sea' />
                      <Metric label='Valor de tu cartera' value={r.portfolio} icon={TrendingUp} note='Valor actual de tus activos' tone='plum' />
                    </div>
                    <div className='grid-2'>
                      <MonthPanel store={store} />
                      <AllocationPanel store={store} />
                      <EmergencyPanel store={store} />
                      <ProjectionPanel store={store} compact />
                      <SpendingPanel store={store} onNavigate={() => navigate('budget')} />
                      <PortfolioPanel store={store} compact onNavigate={() => navigate('portfolio')} />
                    </div>
                  </>
                )}
                {section === 'budget' && (
                  <>
                    <div className='metrics three'>
                      <Metric label='Ingresos netos' value={r.income} icon={ArrowUpRight} note='Equivalente mensual' tone='blue' />
                      <Metric label='Gastos esenciales' value={r.essential} icon={LifeBuoy} note='Base de tu fondo de emergencia' tone='sea' />
                      <Metric label='Balance mensual' value={r.available} icon={Coins} note='Antes de ahorro e inversión' tone='brass' />
                    </div>
                    <EntryList collection='incomes' title='Tus ingresos' items={plan.incomes} {...listHandlers('incomes')} />
                    <EntryList collection='expenses' title='Tus gastos' items={plan.expenses} {...listHandlers('expenses')} />
                  </>
                )}
                {section === 'portfolio' && (
                  <>
                    <PortfolioPanel store={store} />
                    <EntryList collection='assets' title='Tus activos' items={plan.assets} {...listHandlers('assets')} />
                    <p className='footnote'>Los valores se introducen manualmente. El fondo de emergencia no forma parte de la cartera de inversión.</p>
                  </>
                )}
                {section === 'projection' && (
                  <div className='grid-2 wide-first'>
                    <ProjectionPanel store={store} />
                    <AllocationPanel store={store} />
                  </div>
                )}
                {section === 'method' && <Method />}
              </motion.div>
            </AnimatePresence>

            <footer>
              <span>
                <ShieldCheck size={14} aria-hidden /> Privado por diseño, con persistencia local
              </span>
              <span>Cash Compass</span>
            </footer>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {modal?.type === 'entry' && (
          <Modal key='entry' title={`${modal.entry ? 'Editar' : 'Añadir'} ${NOUN[modal.collection]}`} onClose={() => setModal(null)}>
            <EntryForm
              collection={modal.collection}
              entry={modal.entry}
              onCancel={() => setModal(null)}
              onSave={(entry) => {
                store.saveEntry(modal.collection, entry)
                setModal(null)
              }}
            />
          </Modal>
        )}
        {modal && modal.type !== 'entry' && (
          <Modal key={modal.type} title={modal.type === 'delete' ? 'Eliminar entrada' : CONFIRM[modal.type].title} onClose={() => setModal(null)}>
            <p className='modal-body'>{modal.type === 'delete' ? `Se eliminará «${modal.entry.name}» de tu plan.` : CONFIRM[modal.type].body}</p>
            <div className='modal-actions'>
              <button className='button' onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button className={modal.type === 'delete' || modal.type === 'reset' ? 'button danger' : 'button primary'} onClick={confirm}>
                {modal.type === 'delete' ? 'Eliminar' : CONFIRM[modal.type].action}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}

function BrandMark() {
  return (
    <svg className='brand-mark' viewBox='0 0 32 32' aria-hidden>
      <circle cx='16' cy='16' r='14.5' />
      <path d='M16 5l3.2 11h-6.4z' className='north' />
      <path d='M16 27l-3.2-11h6.4z' className='south' />
    </svg>
  )
}
