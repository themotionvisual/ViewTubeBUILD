export type ChannelProgressMetricKey =
 | "subscribersGained"
 | "revenue"
 | "videoCount"
 | "views"
 | "watchHours"

export type ChannelProgressBucket = {
 startMs: number
 endMs: number
 periodAmount: number
 hasData: boolean
}

export const buildChannelProgressBuckets = (
 entries: ReadonlyArray<{ timestamp: number; value: number }>,
 startMs: number,
 endMs: number,
 bucketCount = 24,
): ChannelProgressBucket[] => {
 const count = Math.max(1, Math.floor(bucketCount))
 const safeStart = Number.isFinite(startMs) ? startMs : 0
 const safeEnd = Number.isFinite(endMs) && endMs > safeStart ? endMs : safeStart + count
 const span = safeEnd - safeStart
 const buckets = Array.from({ length: count }, (_, index) => ({
  startMs: safeStart + (span * index) / count,
  endMs: safeStart + (span * (index + 1)) / count,
  periodAmount: 0,
  hasData: false,
 }))

 entries.forEach(({ timestamp, value }) => {
  if (!Number.isFinite(timestamp) || !Number.isFinite(value) || timestamp < safeStart || timestamp > safeEnd) return
  const position = span <= 0 ? 0 : (timestamp - safeStart) / span
  const index = Math.min(count - 1, Math.max(0, Math.floor(position * count)))
  buckets[index].periodAmount += value
  buckets[index].hasData = true
 })

 return buckets
}

/**
 * Convert one selected Channel Progress window into a relative 3-100 scale.
 * Raw period amounts remain authoritative elsewhere; this scale only ensures
 * all 24 comparison bars stay legible when one period dominates the window.
 */
export const buildRelativeChannelProgressHeights = (
 values: readonly number[],
 minimumVisiblePercent = 3,
): number[] => {
 const floor = Math.min(5, Math.max(0, minimumVisiblePercent))
 const finiteValues = values.map((value) => Number.isFinite(value) ? Math.max(0, value) : 0)
 if (finiteValues.length === 0) return []

 const minimum = Math.min(...finiteValues)
 const maximum = Math.max(...finiteValues)
 if (maximum <= 0) return finiteValues.map(() => floor)
 if (maximum === minimum) return finiteValues.map(() => 100)

 const span = maximum - minimum
 return finiteValues.map((value) => floor + ((value - minimum) / span) * (100 - floor))
}

export type RelativeChannelProgressSeriesPoint = {
 rawPeriod: number
 rawCumulative: number
 barPercent: number
 linePercent: number
}

/**
 * Build the paired encodings used by Channel Progress. Bars compare the 24
 * period amounts while lines compare cumulative progress. Both are normalized
 * independently so metrics with different units can share one honest visual
 * scale; raw values remain available for tooltips and exports.
 */
export const buildRelativeChannelProgressSeries = (
 values: readonly number[],
 minimumVisiblePercent = 3,
): RelativeChannelProgressSeriesPoint[] => {
 const rawPeriods = values.map((value) => Number.isFinite(value) ? value : 0)
 let runningTotal = 0
 const rawCumulative = rawPeriods.map((value) => {
  runningTotal += value
  return runningTotal
 })
 // Presentation geometry cannot extend below the chart baseline, but the raw
 // values and cumulative totals must retain valid negative adjustments.
 const barPercents = buildRelativeChannelProgressHeights(
  rawPeriods.map((value) => Math.max(0, value)),
  minimumVisiblePercent,
 )
 const linePercents = buildRelativeChannelProgressHeights(
  rawCumulative.map((value) => Math.max(0, value)),
  minimumVisiblePercent,
 )
 return rawPeriods.map((rawPeriod, index) => ({
  rawPeriod,
  rawCumulative: rawCumulative[index],
  barPercent: barPercents[index],
  linePercent: linePercents[index],
 }))
}

export type FormatDominanceMetricKey = "views" | "watchHours" | "revenue" | "subscribersGained"

export type FormatDominanceTotals = Record<
 FormatDominanceMetricKey,
 { long?: number; shorts?: number }
>

const readOptionalNumber = (value: unknown): number | undefined => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 const parsed = Number(String(value ?? "").replace(/[$,%\s,]/g, ""))
 return value !== null && value !== undefined && value !== "" && Number.isFinite(parsed)
  ? parsed
  : undefined
}

export const resolveChannelProgressDailyMetricValue = (
 row: Record<string, unknown>,
 key: ChannelProgressMetricKey,
): number | undefined => {
 if (key === "videoCount") return undefined
 if (key === "watchHours") {
  const normalizedHours = readOptionalNumber(row.watchTime)
  if (normalizedHours !== undefined) return normalizedHours
  const minutes = readOptionalNumber(row.estimatedMinutesWatched)
  return minutes === undefined ? undefined : minutes / 60
 }
 if (key === "revenue") return readOptionalNumber(row.revenue ?? row.estimatedRevenue)
 return readOptionalNumber(row[key])
}

export const buildFormatDominanceContentTypeTotals = (
 rows: Array<Record<string, unknown>>,
): FormatDominanceTotals => {
 const totals: FormatDominanceTotals = {
  views: {},
  watchHours: {},
  revenue: {},
  subscribersGained: {},
 }
 const add = (
  key: FormatDominanceMetricKey,
  format: "long" | "shorts",
  value: number | undefined,
 ) => {
  if (value === undefined) return
  totals[key][format] = (totals[key][format] ?? 0) + value
 }

 rows.forEach((row) => {
  const label = String(row.creatorContentType ?? row.contentType ?? row.term ?? "").toLowerCase()
  const format = label.includes("short") ? "shorts" : "long"
  add("views", format, readOptionalNumber(row.views))
  const normalizedHours = readOptionalNumber(row.watchTime)
  const minutes = readOptionalNumber(row.estimatedMinutesWatched)
  add("watchHours", format, normalizedHours ?? (minutes === undefined ? undefined : minutes / 60))
  add("revenue", format, readOptionalNumber(row.revenue ?? row.estimatedRevenue))
  add("subscribersGained", format, readOptionalNumber(row.subscribersGained))
 })

 return totals
}
