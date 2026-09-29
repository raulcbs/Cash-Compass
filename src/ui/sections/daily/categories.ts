import { Bus, Gift, Shapes, ShoppingBag, Ticket, UtensilsCrossed, type LucideIcon } from 'lucide-react'

interface CategoryStyle {
  icon: LucideIcon
  /** Fill color for bars and legends. */
  color: string
  /** Darker variant for icons and text on a tint of `color`. */
  ink: string
}

const STYLES: Record<string, CategoryStyle> = {
  'Comer fuera': { icon: UtensilsCrossed, color: 'var(--saffron)', ink: 'var(--saffron-ink)' },
  Compras: { icon: ShoppingBag, color: 'var(--river)', ink: 'var(--river-ink)' },
  Ocio: { icon: Ticket, color: 'var(--primary)', ink: 'var(--primary)' },
  Caprichos: { icon: Gift, color: 'var(--rose)', ink: 'var(--rose-ink)' },
  Transporte: {
    icon: Bus,
    color: 'color-mix(in srgb, var(--primary) 50%, var(--river))',
    ink: 'color-mix(in srgb, var(--primary) 50%, var(--river-ink))',
  },
  Otros: { icon: Shapes, color: 'var(--muted)', ink: 'var(--ink-soft)' },
}

/** Imported plans may carry categories outside the default list. */
export const categoryStyle = (category: string) => STYLES[category] ?? STYLES.Otros!
