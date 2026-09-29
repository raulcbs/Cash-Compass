import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { ArrowDownRight, ArrowUpRight, Coins, LifeBuoy, Plus, ShieldCheck, TrendingUp, X } from 'lucide-react'
import { useEffect, useState, type ChangeEvent } from 'react'
import { usePlan } from '../../application/use-plan'
import type { Collection, Entry, Plan } from '../../domain/types'
import { exportPlan, readBackup } from '../../infrastructure/backup'
import { EntryForm, NOUN } from '../components/entry-form/entry-form'
import { EntryList } from '../components/entry-list/entry-list'
import { Modal, ModalActions, ModalBody } from '../components/modal/modal'
import { Button, IconButton, TextButton } from '../components/primitives/button'
import { Panel } from '../components/primitives/panel'
import { Footnote } from '../components/primitives/text'
import { Stat, StatGrid } from '../components/primitives/stat'
import { plural } from '../format'
import { AllocationPanel } from '../sections/allocation-panel/allocation-panel'
import { DailySection } from '../sections/daily/daily-section/daily-section'
import { focusQuickAdd } from '../sections/daily/quick-add/quick-add'
import { EmergencyPanel } from '../sections/emergency-panel/emergency-panel'
import { SECTIONS, type SectionId } from '../sections'
import { Method } from '../sections/method/method'
import { MonthPanel } from '../sections/month-panel/month-panel'
import { PortfolioPanel } from '../sections/portfolio-panel/portfolio-panel'
import { ProjectionPanel } from '../sections/projection-panel/projection-panel'
import { SpendingPanel } from '../sections/spending-panel/spending-panel'
import { Header } from '../shell/header/header'
import { Sidebar } from '../shell/sidebar/sidebar'
import { TabBar } from '../shell/tab-bar/tab-bar'
import { cx } from '../cx'
import { MOBILE_QUERY, useMediaQuery } from '../use-media-query'
import styles from './app.module.css'

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
  const mobile = useMediaQuery(MOBILE_QUERY)
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
      <div className={styles.app}>
        {mobile ? <TabBar section={section} onNavigate={navigate} /> : <Sidebar section={section} onNavigate={navigate} />}

        <div className={styles.workspace}>
          <Header
            current={meta.label}
            saveFailed={status === 'error'}
            mobile={mobile}
            methodActive={section === 'method'}
            onHome={() => navigate('overview')}
            onOpenMethod={() => navigate('method')}
            onExport={() => (exportPlan(plan), setNotice('Descarga de la copia de seguridad iniciada.'))}
            onImportFile={importFile}
          />

          <main className={styles.main}>
            <div className={styles.heading}>
              <div>
                <h1>{meta.title}</h1>
                <p>{meta.lead}</p>
              </div>
              {section === 'daily' ? (
                <Button variant='primary' icon={<Plus size={17} aria-hidden />} iconOnPhone onClick={focusQuickAdd}>
                  Anotar gasto
                </Button>
              ) : (
                section !== 'method' && (
                  <Button variant='primary' icon={<Plus size={17} aria-hidden />} iconOnPhone onClick={() => addEntry(primary)}>
                    Añadir {NOUN[primary]}
                  </Button>
                )
              )}
            </div>

            <AnimatePresence>
              {notice && (
                <motion.div
                  className={styles.notice}
                  role='status'
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p>{notice}</p>
                  <IconButton size='sm' aria-label='Cerrar aviso' onClick={() => setNotice('')}>
                    <X size={16} />
                  </IconButton>
                </motion.div>
              )}
            </AnimatePresence>

            {isEmpty && (
              <Panel tone='feature' className={styles.onboarding}>
                <div className={styles.onboardingCopy}>
                  <strong>Tu plan empieza con tus datos</strong>
                  <p>Añade tu salario y tus gastos para conocer tu margen real.</p>
                </div>
                <div className={styles.onboardingActions}>
                  <Button variant='primary' onClick={() => addEntry('incomes')}>
                    Añadir ingreso
                  </Button>
                  <TextButton onClick={() => setModal({ type: 'demo' })}>Explorar con un ejemplo</TextButton>
                </div>
              </Panel>
            )}
            {plan.isDemo && (
              <p className={styles.demoBanner}>
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
                    <StatGrid>
                      <Stat
                        label='Ingresos mensuales'
                        value={r.income}
                        icon={ArrowUpRight}
                        note={plural(plan.incomes.length, 'fuente de ingresos', 'fuentes de ingresos')}
                        tone='primary'
                      />
                      <Stat label='Gastos mensuales' value={r.expenses} icon={ArrowDownRight} note='Fijos y variables' tone='rose' />
                      <Stat label='Margen antes de objetivos' value={r.available} icon={Coins} note='Ingresos menos gastos' tone='saffron' />
                      <Stat label='Valor de tu cartera' value={r.portfolio} icon={TrendingUp} note='Valor actual de tus activos' tone='river' />
                    </StatGrid>
                    <div className={styles.grid}>
                      <MonthPanel store={store} />
                      <AllocationPanel store={store} />
                      <EmergencyPanel store={store} />
                      <ProjectionPanel store={store} compact />
                      <SpendingPanel store={store} onNavigate={() => navigate('budget')} />
                      <PortfolioPanel store={store} compact onNavigate={() => navigate('portfolio')} />
                    </div>
                  </>
                )}
                {section === 'daily' && <DailySection store={store} onAdjustBudget={() => navigate('overview')} />}
                {section === 'budget' && (
                  <>
                    <StatGrid columns={3}>
                      <Stat label='Ingresos netos' value={r.income} icon={ArrowUpRight} note='Equivalente mensual' tone='primary' />
                      <Stat label='Gastos esenciales' value={r.essential} icon={LifeBuoy} note='Base de tu fondo de emergencia' tone='rose' />
                      <Stat label='Balance mensual' value={r.available} icon={Coins} note='Antes de ahorro e inversión' tone='saffron' />
                    </StatGrid>
                    <EntryList collection='incomes' title='Tus ingresos' items={plan.incomes} {...listHandlers('incomes')} />
                    <EntryList collection='expenses' title='Tus gastos' items={plan.expenses} {...listHandlers('expenses')} />
                  </>
                )}
                {section === 'portfolio' && (
                  <>
                    <PortfolioPanel store={store} />
                    <EntryList collection='assets' title='Tus activos' items={plan.assets} {...listHandlers('assets')} />
                    <Footnote>Los valores se introducen manualmente. El fondo de emergencia no forma parte de la cartera de inversión.</Footnote>
                  </>
                )}
                {section === 'projection' && (
                  <div className={cx(styles.grid, styles.wideFirst)}>
                    <ProjectionPanel store={store} />
                    <AllocationPanel store={store} />
                  </div>
                )}
                {section === 'method' && <Method />}
              </motion.div>
            </AnimatePresence>

            <footer className={styles.footer}>
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
            <ModalBody>{modal.type === 'delete' ? `Se eliminará «${modal.entry.name}» de tu plan.` : CONFIRM[modal.type].body}</ModalBody>
            <ModalActions>
              <Button onClick={() => setModal(null)}>Cancelar</Button>
              <Button variant={modal.type === 'delete' || modal.type === 'reset' ? 'danger' : 'primary'} onClick={confirm}>
                {modal.type === 'delete' ? 'Eliminar' : CONFIRM[modal.type].action}
              </Button>
            </ModalActions>
          </Modal>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
