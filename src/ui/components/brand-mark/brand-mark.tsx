import styles from './brand-mark.module.css'

export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <svg className={styles.mark} width={size} height={size} viewBox='0 0 32 32' aria-hidden>
      <circle cx='16' cy='16' r='15' className={styles.disc} />
      <path d='M16 5.5l3.2 10.5h-6.4z' className={styles.north} />
      <path d='M16 26.5l-3.2-10.5h6.4z' className={styles.south} />
    </svg>
  )
}
