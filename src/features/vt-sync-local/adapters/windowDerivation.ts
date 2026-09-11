/**
 * Derive time-window rows from day- or month-grained history.
 *
 * Day-grained datasets (daily metrics, traffic x day, monthly metrics) are
 * stored as lifetime history, so every 7/28/90/365 window they can answer is
 * already sitting in IndexedDB. Deriving those windows locally costs ZERO
 * additional YouTube Analytics requests — the plan's "class A" datasets.
 *
 * Aggregation follows the authoritative metric contract rather than a local
 * guess: "sum" metrics add, "weighted-rate" metrics weight by views (or an
 * explicit weight metric), and "calculated-rate" metrics are recomputed from
 * their numerator and denominator after aggregation, because averaging a rate
 * across days is not the same as the rate over the period.
 *
 * See docs/migration/TIME_WINDOW_IMPLEMENTATION_PLAN_2026-09-11.md §1 and §5.3.
 */

import {
 VT_SYNC_ANALYTICS_METRIC_DESCRIPTORS,
 type VtSyncAnalyticsMetricDescriptor,
} from "../upstream/analyticsMetricContract"
import type { VtSyncAnalyticsWindow } from "./contracts"

export type VtSyncDerivableRow = Record<string, unknown>

const numberOrUndefined = (value: unknown): number | undefined => {
 if (value === null || value === undefined || value === "") return undefined
 const numeric = typeof value === "number" ? value : Number(value)
 return Number.isFinite(numeric) ? numeric : undefined
}

/** Day key on a stored row: daily rows use `date`, raw API rows use `day`. */
export const readRowDateKey = (row: VtSyncDerivableRow): string =>
 String(row.date || row.day || row.month || "")

/**
 * Rows whose date key falls inside [startDate, endDate] inclusive.
 * String comparison is safe and fast for YYYY-MM-DD keys.
 *
 * Month-grained rows (YYYY-MM) are compared on their first 7 characters, so a
 * month is included when it overlaps the window at all. A month-derived window
 * is therefore an approximation and callers should mark it as one.
 */
export const filterRowsToRange = (
 rows: VtSyncDerivableRow[],
 startDate: string,
 endDate: string,
): VtSyncDerivableRow[] =>
 rows.filter((row) => {
  const key = readRowDateKey(row)
  if (!key) return false
  if (key.length === 7) return key >= startDate.slice(0, 7) && key <= endDate.slice(0, 7)
  return key >= startDate && key <= endDate
 })

const sumMetric = (rows: VtSyncDerivableRow[], key: string): number | undefined => {
 const values = rows
  .map((row) => numberOrUndefined(row[key]))
  .filter((value): value is number => value !== undefined)
 return values.length ? values.reduce((sum, value) => sum + value, 0) : undefined
}

const weightedMetric = (
 rows: VtSyncDerivableRow[],
 key: string,
 weightKey = "views",
): number | undefined => {
 let weighted = 0
 let totalWeight = 0
 rows.forEach((row) => {
  const value = numberOrUndefined(row[key])
  const weight = numberOrUndefined(row[weightKey])
  if (value === undefined || weight === undefined || weight <= 0) return
  weighted += value * weight
  totalWeight += weight
 })
 return totalWeight > 0 ? weighted / totalWeight : undefined
}

/**
 * Rates that must be recomputed from aggregated components rather than
 * averaged. Each entry is [resultField, numeratorField, denominatorField,
 * multiplier].
 */
const CALCULATED_RATES: Array<[string, string, string, number]> = [
 ["cpm", "grossRevenue", "adImpressions", 1000],
 ["playbackBasedCpm", "grossRevenue", "monetizedPlaybacks", 1000],
 ["cardClickRate", "cardClicks", "cardImpressions", 100],
 ["cardTeaserClickRate", "cardTeaserClicks", "cardTeaserImpressions", 100],
]

const WEIGHT_OVERRIDES: Record<string, string> = {
 cardClickRate: "cardImpressions",
 cardTeaserClickRate: "cardTeaserImpressions",
 cpm: "adImpressions",
 playbackBasedCpm: "monetizedPlaybacks",
}

/**
 * Aggregate one set of same-window rows into a single row, following each
 * metric's declared aggregation rule.
 */
export const aggregateRowsForWindow = (
 rows: VtSyncDerivableRow[],
 descriptors: readonly VtSyncAnalyticsMetricDescriptor[] = VT_SYNC_ANALYTICS_METRIC_DESCRIPTORS,
): Record<string, number | undefined> => {
 const out: Record<string, number | undefined> = {}
 if (!rows.length) return out

 descriptors.forEach((descriptor) => {
  const field = descriptor.normalizedField
  if (descriptor.aggregation === "sum") {
   out[field] = sumMetric(rows, field)
  } else if (descriptor.aggregation === "weighted-rate") {
   out[field] = weightedMetric(rows, field, WEIGHT_OVERRIDES[field] || "views")
  }
  // "calculated-rate" is handled below, once its components are aggregated.
 })

 CALCULATED_RATES.forEach(([field, numeratorKey, denominatorKey, multiplier]) => {
  const numerator = out[numeratorKey] ?? sumMetric(rows, numeratorKey)
  const denominator = out[denominatorKey] ?? sumMetric(rows, denominatorKey)
  if (
   numerator !== undefined &&
   denominator !== undefined &&
   denominator > 0
  ) {
   out[field] = (numerator / denominator) * multiplier
   return
  }
  // No usable components — fall back to weighting the stored rate, and leave
  // it undefined rather than zero if that is not possible either.
  const fallback = weightedMetric(rows, field, WEIGHT_OVERRIDES[field] || "views")
  if (fallback !== undefined) out[field] = fallback
 })

 // Average view duration is derivable from the two aggregated components and
 // is more accurate that way than as a weighted average of daily averages.
 const views = out.views
 const watchTime = out.watchTime
 if (views !== undefined && views > 0 && watchTime !== undefined) {
  out.avgViewDuration = (watchTime * 3600) / views
 }

 const gained = out.subscribersGained
 const lost = out.subscribersLost
 if (gained !== undefined && lost !== undefined) {
  out.netSubscribers = gained - lost
  out.subscribers = gained - lost
 }

 return out
}

export type DerivedWindowRow = Record<string, unknown> & {
 window: VtSyncAnalyticsWindow
 /** How many source rows the aggregate covers — 0 means no coverage. */
 sourceRowCount: number
}

/**
 * Derive one aggregate row per group for a window, from day-grained history.
 *
 * `groupBy` produces windowed dimension rows (traffic source, country, ...)
 * from a day x dimension dataset. Omit it for an undimensioned total.
 *
 * Returns [] when no source row falls inside the range: an empty window is
 * missing coverage, not a zero, and callers must not render it as zero.
 */
export const deriveVtSyncWindowRows = (input: {
 rows: VtSyncDerivableRow[]
 window: VtSyncAnalyticsWindow
 startDate: string
 endDate: string
 groupBy?: string
 descriptors?: readonly VtSyncAnalyticsMetricDescriptor[]
}): DerivedWindowRow[] => {
 const inRange = filterRowsToRange(input.rows, input.startDate, input.endDate)
 if (!inRange.length) return []

 if (!input.groupBy) {
  return [{
   ...aggregateRowsForWindow(inRange, input.descriptors),
   window: input.window,
   sourceRowCount: inRange.length,
  }]
 }

 const grouped = new Map<string, VtSyncDerivableRow[]>()
 inRange.forEach((row) => {
  const key = String(row[input.groupBy as string] ?? "").trim()
  if (!key) return
  grouped.set(key, [...(grouped.get(key) || []), row])
 })

 return [...grouped.entries()].map(([key, groupRows]) => ({
  [input.groupBy as string]: key,
  ...aggregateRowsForWindow(groupRows, input.descriptors),
  window: input.window,
  sourceRowCount: groupRows.length,
 }))
}
