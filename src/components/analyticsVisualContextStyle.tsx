import type { SubToolboxChartModuleProps, SubToolboxStat } from "./SubToolboxChartModule"

type ActiveContext = NonNullable<SubToolboxChartModuleProps["activeContext"]>

const DARK_CONTEXT_TONE = "#080816"
const DARK_VALUE_TONE = "#F3F4F6"

const darkenStats = (stats: SubToolboxStat[] | undefined): SubToolboxStat[] | undefined =>
  stats?.map((stat) => ({
    ...stat,
    backgroundTone: stat.backgroundTone ?? DARK_CONTEXT_TONE,
    valueTone: stat.valueTone ?? DARK_VALUE_TONE,
  }))

/**
 * Return the active-context payload the visual should render, given its
 * title and the caller's raw active context. Behaves as the identity
 * function today; the name is preserved so the intended per-visual
 * normalization can slot in without touching call sites.
 */
export function normalizeHeatMatrixContext(
  _title: string,
  activeContext: ActiveContext | null | undefined,
): ActiveContext | null | undefined {
  if (!activeContext) return activeContext
  return {
    ...activeContext,
    bgTone: activeContext.bgTone ?? DARK_CONTEXT_TONE,
    stats: darkenStats(activeContext.stats),
    leftStats: darkenStats(activeContext.leftStats),
    rightStats: darkenStats(activeContext.rightStats),
  }
}
