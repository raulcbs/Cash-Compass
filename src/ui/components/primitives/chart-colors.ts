/**
 * Ordered categorical colours for charts and legends, read as CSS variables so they follow the theme.
 * The portfolio is all investment, so its ramp stays in the crop family and steps in lightness.
 */
export const CHART_COLORS = [
  'var(--crop)',
  'color-mix(in srgb, var(--crop) 55%, var(--ink))',
  'color-mix(in srgb, var(--crop) 50%, var(--surface))',
  'color-mix(in srgb, var(--crop) 45%, var(--rice))',
  'var(--muted)',
]
