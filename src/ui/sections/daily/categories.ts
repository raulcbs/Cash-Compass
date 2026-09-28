import { Bus, Gift, Shapes, ShoppingBag, Ticket, UtensilsCrossed, type LucideIcon } from 'lucide-react'

interface CategoryStyle {
  icon: LucideIcon
  color: string
}

const STYLES: Record<string, CategoryStyle> = {
  'Comer fuera': { icon: UtensilsCrossed, color: 'var(--brass)' },
  Compras: { icon: ShoppingBag, color: 'var(--blue)' },
  Ocio: { icon: Ticket, color: 'var(--plum)' },
  Caprichos: { icon: Gift, color: 'var(--rust)' },
  Transporte: { icon: Bus, color: 'var(--sea)' },
  Otros: { icon: Shapes, color: 'var(--slate)' },
}

/** Imported plans may carry categories outside the default list. */
export const categoryStyle = (category: string) => STYLES[category] ?? STYLES.Otros!
