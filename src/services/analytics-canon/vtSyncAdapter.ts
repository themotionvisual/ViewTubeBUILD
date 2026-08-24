// Pure adapter — reshapes VtSyncSnapshot into the canonical shapes
// consumers expect. Zero React, zero side effects; safe to call from
// tests, workers, or the AI/brain code path.
//
// Design notes:
//  * The adapter is intentionally "boring". It doesn't fetch, doesn't
//    memoize across calls, doesn't cache. Callers memoize as needed
//    (useAnalytics.ts handles the React memoization).
//  * MetricCell factory produces the full CanonicalMetricKey record —
//    every key, filled with "unavailable" defaults where vt-sync has no
//    data yet. Downstream renderers rely on the total record shape
//    being present.
//  * Format inference (long/shorts/live) preserves the legacy heuristic;
//    vt-sync stores a raw hint on the video item that we normalize.

import type {
 VtSyncSnapshot,
 VtSyncVideoItem,
} from "../../features/vt-sync-local/adapters/contracts"
import type {
 AnalyticsWindow,
 CanonicalMetricKey,
 CanonicalVideoRow,
 MetricCell,
 MetricSummary,
 WindowTotals,
} from "./contracts"

// --- Full set of canonical metric keys the adapter emits -----------------
// Kept as a runtime array so the "unavailable-defaults" record can be
// built without redeclaring the union. Must stay in sync with the
// CanonicalMetricKey union in DataStore.ts — if a new metric is added
// there, add it here too (or downstream selectors will crash on
// row.metrics[key] access).
const CANONICAL_METRIC_KEYS: readonly CanonicalMetricKey[] = [
 "views",
 "watchHours",
 "likes",
 "dislikes",
 "comments",
 "shares",
 "saves",
 "subscribersGained",
 "subscribersLost",
 "subscribersNet",
 "impressions",
 "revenue",
 "cpm",
 "rpm",
 "ctr",
 "newViewers",
 "returningViewers",
 "casualViewers",
 "regularViewers",
 "uniqueViewers",
 "avdSeconds",
 "avp",
 "engagedViews",
 "stw",
 "endScreenClickRate",
 "endScreenClicks",
 "endScreenImpressions",
 "cardClickRate",
 "cardTeaserClickRate",
 "cardTeaserClicks",
 "cardTeaserImpressions",
 "annotationImpressions",
 "annotationClickableImpressions",
 "annotationClosableImpressions",
 "annotationClicks",
 "annotationCloses",
 "redWatchHours",
 "estimatedAdRevenue",
 "grossRevenue",
 "playbackBasedCpm",
 "adImpressions",
 "monetizedPlaybacks",
 "estimatedPremiumRevenue",
 "endScreenElementClicks",
 "endScreenElementsShown",
 "clicksPerEndScreenElementShown",
 "cardClicks",
 "cardsShown",
 "clicksPerCardShown",
 "hypes",
 "hypePoints",
 "remixCount",
 "remixesOfYourContent",
 "remixViews",
 "shortsFunnelPercentWatched",
 "shortsFunnelSwipeAwayRate",
] as unknown as readonly CanonicalMetricKey[]

// --- Metric cell construction --------------------------------------------

/** Empty cell — used for every metric key with no vt-sync data. */
const emptyCell = (): MetricCell => ({
 value: null,
 status: "unavailable",
 source: "api",
 availability: "unavailable",
 confidence: "unavailable",
})

/** Cell for a metric that vt-sync provided (or explicitly nulled). */
const valueCell = (value: number | null | undefined): MetricCell => {
 if (value === null || value === undefined || !Number.isFinite(value)) {
  return emptyCell()
 }
 return {
  value,
  status: "actual",
  source: "api",
  availability: "available",
  confidence: "raw_direct",
 }
}

/**
 * Build the full canonical-metric record with unavailable defaults for
 * every key. Returns a fresh object each call so callers can mutate.
 */
const buildEmptyMetricsRecord = (): Record<CanonicalMetricKey, MetricCell> => {
 const out = {} as Record<CanonicalMetricKey, MetricCell>
 for (const key of CANONICAL_METRIC_KEYS) out[key] = emptyCell()
 return out
}

// --- Video format inference ----------------------------------------------

const inferFormat = (video: VtSyncVideoItem): CanonicalVideoRow["format"] => {
 const raw = String(video.format || "").toLowerCase()
 if (raw === "short" || raw === "shorts") return "shorts"
 if (raw === "long" || raw === "regular") return "long"
 if (raw === "live") return "live"
 return "unknown"
}

// --- Row projection ------------------------------------------------------

/**
 * Project one vt-sync video into a canonical row. Atomic operation the
 * higher-level selectors compose. VT Sync's per-video metric names are
 * mapped to canonical keys — where vt-sync uses `watchTime` in minutes,
 * we convert to canonical `watchHours`; where vt-sync uses
 * `avgViewDuration` in seconds, canonical uses `avdSeconds`.
 */
export const projectVtSyncVideoToCanonicalRow = (
 video: VtSyncVideoItem,
): CanonicalVideoRow => {
 const metrics = (video.metrics || {}) as Record<string, number | null | undefined>
 const durationSeconds = Number(
  (video as unknown as { durationSec?: number }).durationSec ?? 0,
 )

 const cells = buildEmptyMetricsRecord()

 // Populate the metric keys vt-sync currently emits per video.
 cells.views = valueCell(metrics.views)
 cells.watchHours = valueCell(
  typeof metrics.watchTime === "number" ? metrics.watchTime / 60 : null,
 )
 cells.revenue = valueCell(metrics.revenue)
 cells.subscribersGained = valueCell(metrics.subscribersGained)
 cells.subscribersLost = valueCell(metrics.subscribersLost)
 cells.ctr = valueCell(metrics.ctr)
 cells.impressions = valueCell(metrics.impressions)
 cells.avdSeconds = valueCell(metrics.avgViewDuration)
 cells.avp = valueCell(metrics.averagePercentageViewed)
 cells.likes = valueCell(metrics.likes)
 cells.dislikes = valueCell(metrics.dislikes)
 cells.comments = valueCell(metrics.comments)
 cells.shares = valueCell(metrics.shares)
 cells.cpm = valueCell(metrics.cpm)
 cells.rpm = valueCell(metrics.rpm)
 cells.adImpressions = valueCell(metrics.adImpressions)
 cells.engagedViews = valueCell(metrics.engagedViews)

 const row: CanonicalVideoRow = {
  id: String(video.id),
  videoId: String(video.id),
  title: String(video.title || ""),
  thumbnailUrl: video.thumbnail || undefined,
  uploadDate: String(video.publishedAt || ""),
  format: inferFormat(video),
  durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 0,
  sourceMode: "api",
  apiPresent: true,
  csvPresent: false,
  metrics: cells,
  originalData: video as unknown as Record<string, unknown>,
 }

 return row
}

// --- Window filtering ----------------------------------------------------

const WINDOW_TO_DAYS: Record<AnalyticsWindow, number | null> = {
 "7d": 7,
 "28d": 28,
 "90d": 90,
 "365d": 365,
 lifetime: null,
}

export const filterCanonicalRowsByWindow = (
 rows: CanonicalVideoRow[],
 window: AnalyticsWindow,
): CanonicalVideoRow[] => {
 const days = WINDOW_TO_DAYS[window]
 if (days === null) return rows
 const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
 return rows.filter((row) => {
  const ts = new Date(row.uploadDate || "").getTime()
  if (!Number.isFinite(ts)) return false
  return ts >= cutoff
 })
}

// --- Top-level selectors -------------------------------------------------

export const getCanonicalRowsFromVtSync = (
 snapshot: VtSyncSnapshot | null | undefined,
 window: AnalyticsWindow,
): CanonicalVideoRow[] => {
 if (!snapshot || !Array.isArray(snapshot.videos)) return []
 const all = snapshot.videos.map(projectVtSyncVideoToCanonicalRow)
 return filterCanonicalRowsByWindow(all, window)
}

// --- Metric aggregation --------------------------------------------------

const cellValue = (row: CanonicalVideoRow, key: CanonicalMetricKey): number => {
 const c = row.metrics[key]
 return typeof c?.value === "number" && Number.isFinite(c.value) ? c.value : 0
}

const cellAverage = (
 rows: CanonicalVideoRow[],
 key: CanonicalMetricKey,
): number | null => {
 const values = rows
  .map((row) => row.metrics[key]?.value)
  .filter((v): v is number => typeof v === "number" && Number.isFinite(v))
 if (values.length === 0) return null
 return values.reduce((a, b) => a + b, 0) / values.length
}

/**
 * Aggregate rows into a MetricSummary — matches the legacy
 * getMetricSummary() shape field-for-field.
 */
export const summarizeCanonicalRows = (
 rows: CanonicalVideoRow[],
): MetricSummary => {
 return {
  rowCount: rows.length,
  totals: {
   views: rows.reduce((acc, r) => acc + cellValue(r, "views"), 0),
   watchHours: rows.reduce((acc, r) => acc + cellValue(r, "watchHours"), 0),
   subscribersGained: rows.reduce(
    (acc, r) => acc + cellValue(r, "subscribersGained"),
    0,
   ),
   revenue: rows.reduce((acc, r) => acc + cellValue(r, "revenue"), 0),
  },
  averages: {
   ctr: cellAverage(rows, "ctr"),
   rpm: cellAverage(rows, "rpm"),
   cpm: cellAverage(rows, "cpm"),
   avdSeconds: cellAverage(rows, "avdSeconds"),
   avp: cellAverage(rows, "avp"),
  },
 }
}

export const getMetricSummaryFromVtSync = (
 snapshot: VtSyncSnapshot | null | undefined,
 window: AnalyticsWindow,
): MetricSummary => summarizeCanonicalRows(getCanonicalRowsFromVtSync(snapshot, window))

/**
 * Thinner WindowTotals shape — used by hero blocks and stat cards.
 * Impressions aggregated from row cells (unlike averages which use
 * cellAverage), because it's a count.
 */
export const getWindowTotalsFromVtSync = (
 snapshot: VtSyncSnapshot | null | undefined,
 window: AnalyticsWindow,
): WindowTotals => {
 const rows = getCanonicalRowsFromVtSync(snapshot, window)
 const summary = summarizeCanonicalRows(rows)
 return {
  views: summary.totals.views,
  watchHours: summary.totals.watchHours,
  subscribersGained: summary.totals.subscribersGained,
  revenue: summary.totals.revenue,
  impressions: rows.reduce((acc, r) => acc + cellValue(r, "impressions"), 0),
  ctr: summary.averages.ctr,
 }
}
