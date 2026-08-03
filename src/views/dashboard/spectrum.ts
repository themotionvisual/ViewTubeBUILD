import { VT_SPECTRUM_PALETTE_06, getDashboardWidgetPaletteColors } from "../../styles/toolboxPalette"

export interface DashboardSpectrumTokens {
  position: number
  paletteIndex: number
  headerColor: string
  iconRailColor: string
  foregroundColor: "#000000"
  borderColor: string
  shadowColor: string
}

export const resolveDashboardSpectrum = (position: number): DashboardSpectrumTokens => {
  const safePosition = Number.isFinite(position) ? Math.max(0, Math.trunc(position)) : 0
  const paletteIndex = safePosition % VT_SPECTRUM_PALETTE_06.length
  const { headerColor, iconRailColor } = getDashboardWidgetPaletteColors(safePosition)

  return {
    position: safePosition,
    paletteIndex,
    headerColor,
    iconRailColor,
    foregroundColor: "#000000",
    borderColor: `color-mix(in srgb, ${headerColor} 60%, black)`,
    shadowColor: `color-mix(in srgb, ${headerColor} 50%, transparent)`,
  }
}

export const resolveVisibleWidgetSpectrum = (
  order: readonly string[],
  hidden: ReadonlySet<string>,
): Record<string, DashboardSpectrumTokens> => {
  const result: Record<string, DashboardSpectrumTokens> = {}
  let visiblePosition = 0

  for (const widgetId of order) {
    if (hidden.has(widgetId) || result[widgetId]) continue
    result[widgetId] = resolveDashboardSpectrum(visiblePosition)
    visiblePosition += 1
  }

  return result
}
