import { Coins } from 'lucide-react'
import styles from './empty.module.css'

export function Empty({ text }: { text: string }) {
  return (
    <div className={styles.empty}>
      <Coins size={24} aria-hidden />
      <p>{text}</p>
    </div>
  )
}
