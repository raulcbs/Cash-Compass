import { ArrowLeftRight, BookOpen, ChartNoAxesCombined, LayoutDashboard, Receipt, Wallet, type LucideIcon } from 'lucide-react'

export type SectionId = 'overview' | 'daily' | 'budget' | 'portfolio' | 'projection' | 'method'

export interface SectionMeta {
  id: SectionId
  label: string
  short: string
  icon: LucideIcon
  title: string
  lead: string
  /** Reference content: kept out of the phone tab bar (reachable from the top bar). */
  secondary?: boolean
}

export const SECTIONS: SectionMeta[] = [
  {
    id: 'overview',
    label: 'Resumen',
    short: 'Resumen',
    icon: LayoutDashboard,
    title: 'Dale un rumbo a tu dinero',
    lead: 'Encuentra el equilibrio entre vivir hoy y construir tu mañana.',
  },
  {
    id: 'daily',
    label: 'Día a día',
    short: 'Día a día',
    icon: Receipt,
    title: 'Lo tuyo, al día',
    lead: 'Anota lo que gastas en ti y mira cuánto te queda hasta fin de mes.',
  },
  {
    id: 'budget',
    label: 'Ingresos y gastos',
    short: 'Presupuesto',
    icon: ArrowLeftRight,
    title: 'Cada euro tiene su lugar',
    lead: 'Añade importes netos. Los pagos anuales se reparten entre 12 meses.',
  },
  {
    id: 'portfolio',
    label: 'Mi cartera',
    short: 'Cartera',
    icon: Wallet,
    title: 'Tu cartera, en perspectiva',
    lead: 'Registra el valor actual de tus inversiones y lo que aportaste.',
  },
  {
    id: 'projection',
    label: 'Proyección',
    short: 'Proyección',
    icon: ChartNoAxesCombined,
    title: 'Mira más allá de este mes',
    lead: 'Explora un escenario hipotético de aportaciones y rentabilidad.',
  },
  {
    id: 'method',
    label: 'Cómo se calcula',
    short: 'Método',
    icon: BookOpen,
    title: 'Números que puedes entender',
    lead: 'Fórmulas transparentes, supuestos visibles y fuentes consultables.',
    secondary: true,
  },
]
