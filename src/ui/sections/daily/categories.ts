import { Bus, Gift, Shapes, ShoppingBag, Ticket, UtensilsCrossed, type LucideIcon } from 'lucide-react'

interface CategoryStyle {
  icon: LucideIcon
  /** Fill colour for bars and legends. */
  color: string
  /** Darker variant for icons and text on a tint of `color`. */
  ink: string
}

/*
 * Day-to-day purchases all come out of the "Para ti" terrace, so they share its orange;
 * the icon tells categories apart, the colour tells you whose money it is.
 */
const ORANGE = { color: 'var(--orange)', ink: 'var(--orange-ink)' }

const STYLES: Record<string, CategoryStyle> = {
  'Comer fuera': { icon: UtensilsCrossed, ...ORANGE },
  Compras: { icon: ShoppingBag, ...ORANGE },
  Ocio: { icon: Ticket, ...ORANGE },
  Caprichos: { icon: Gift, ...ORANGE },
  Transporte: { icon: Bus, ...ORANGE },
  Otros: { icon: Shapes, color: 'var(--muted)', ink: 'var(--ink-soft)' },
}

/** Imported plans may carry categories outside the default list. */
export const categoryStyle = (category: string) => STYLES[category] ?? STYLES.Otros!
