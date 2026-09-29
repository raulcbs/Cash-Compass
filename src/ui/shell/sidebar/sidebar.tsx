import { motion } from 'motion/react'
import { ShieldCheck } from 'lucide-react'
import { BrandMark } from '../../components/brand-mark/brand-mark'
import { cx } from '../../cx'
import { SECTIONS, type SectionId } from '../../sections'
import styles from './sidebar.module.css'

interface Props {
  section: SectionId
  onNavigate: (id: SectionId) => void
}

/** Desktop navigation; collapses to an icon rail on tablets. */
export function Sidebar({ section, onNavigate }: Props) {
  return (
    <aside className={styles.sidebar}>
      <a href='#overview' className={styles.brand} onClick={() => onNavigate('overview')}>
        <BrandMark />
        <span className={styles.brandText}>
          Cash Compass
          <small>Tu dinero, con rumbo</small>
        </span>
      </a>
      <nav aria-label='Principal' className={styles.nav}>
        {SECTIONS.map(({ id, label, short, icon: Icon, secondary }) => (
          <button
            key={id}
            type='button'
            className={cx(styles.item, secondary && styles.secondary, section === id && styles.active)}
            aria-current={section === id ? 'page' : undefined}
            onClick={() => onNavigate(id)}
          >
            {section === id && (
              <motion.span layoutId='sidebar-active' className={styles.highlight} transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
            )}
            <Icon size={19} aria-hidden />
            <span className={styles.label}>{label}</span>
            <span className={styles.short}>{short}</span>
          </button>
        ))}
      </nav>
      <div className={styles.privacy}>
        <ShieldCheck size={20} aria-hidden />
        <p>
          <strong>Tus datos son tuyos</strong>
          Guardados en este navegador, sin conexión con tu banco.
        </p>
      </div>
    </aside>
  )
}
