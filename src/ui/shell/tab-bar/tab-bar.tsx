import { motion } from 'motion/react'
import { cx } from '../../cx'
import { SECTIONS, type SectionId } from '../../sections'
import styles from './tab-bar.module.css'

interface Props {
  section: SectionId
  onNavigate: (id: SectionId) => void
}

/** Phone navigation: a floating pill. Only the current section shows its label. */
export function TabBar({ section, onNavigate }: Props) {
  return (
    <nav aria-label='Principal' className={styles.bar}>
      {SECTIONS.filter((s) => !s.secondary).map(({ id, short, icon: Icon }) => (
        <button
          key={id}
          type='button'
          className={cx(styles.item, section === id && styles.active)}
          aria-current={section === id ? 'page' : undefined}
          aria-label={short}
          onClick={() => onNavigate(id)}
        >
          {section === id && (
            <motion.span layoutId='tab-bar-active' className={styles.highlight} transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
          )}
          <Icon size={20} aria-hidden />
          {section === id && <span>{short}</span>}
        </button>
      ))}
    </nav>
  )
}
