import { BookOpen, Download, Droplet, TriangleAlert, Upload } from 'lucide-react'
import { useRef, type ChangeEvent } from 'react'
import { BrandMark } from '../../components/brand-mark/brand-mark'
import { IconButton } from '../../components/primitives/button'
import { ThemeControl } from '../../components/theme-control/theme-control'
import { toDateKey } from '../../../domain/dates'
import { cx } from '../../cx'
import { dayName } from '../../format'
import styles from './header.module.css'

interface Props {
  /** Label of the current section. */
  current: string
  saveFailed: boolean
  /** Phones show the brand and the "how it is calculated" shortcut instead of the sidebar entries. */
  mobile: boolean
  methodActive: boolean
  onHome: () => void
  onOpenMethod: () => void
  onExport: () => void
  onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
}

export function Header({ current, saveFailed, mobile, methodActive, onHome, onOpenMethod, onExport, onImportFile }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <header className={styles.header}>
      {mobile ? (
        <a href='#overview' className={styles.brand} onClick={onHome} aria-label='Cash Compass, ir al resumen'>
          <BrandMark size={30} />
          <span>Cash Compass</span>
        </a>
      ) : (
        <span className={styles.crumb}>
          <span className='sr-only'>{current}, </span>
          <strong>{dayName(toDateKey(new Date()))}</strong>
        </span>
      )}
      <div className={styles.actions}>
        <span className={cx(styles.status, saveFailed && styles.failed)} role='status'>
          {saveFailed ? <TriangleAlert size={15} aria-hidden /> : <Droplet size={15} aria-hidden />}
          <span className={styles.statusText}>{saveFailed ? 'Sin guardar' : 'Guardado en este dispositivo'}</span>
        </span>
        {mobile && (
          <IconButton
            size='sm'
            title='Cómo se calcula'
            aria-label='Cómo se calcula'
            aria-current={methodActive ? 'page' : undefined}
            active={methodActive}
            onClick={onOpenMethod}
          >
            <BookOpen size={18} />
          </IconButton>
        )}
        <IconButton size='sm' title='Exportar copia' aria-label='Exportar copia de seguridad' onClick={onExport}>
          <Download size={18} />
        </IconButton>
        <IconButton size='sm' title='Importar copia' aria-label='Importar copia de seguridad' onClick={() => fileRef.current?.click()}>
          <Upload size={18} />
        </IconButton>
        <ThemeControl />
        <input hidden ref={fileRef} type='file' accept='.json,application/json' onChange={onImportFile} />
      </div>
    </header>
  )
}
