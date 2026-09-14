/**
 * Request-cost estimation and degradation for windowed syncs.
 *
 * Aggregate datasets cost one Analytics request family PER WINDOW, so selecting
 * five windows multiplies the run. The YouTube Analytics API's own quota is
 * generous and hard to exhaust; the binding constraints are request COUNT and
 * wall-clock time, since the engine paces itself with 75-300ms sleeps between
 * bundles.
 *
 * This module is the single cost model. The controller shows the user a number
 * before the run and the engine enforces the same number during it — if they
 * disagree, the estimate is a lie.
 *
 * See docs/migration/TIME_WINDOW_COMPLETION_AND_DATA_BASIN_PLAN_2026-09-14.md §3.4.
 */

import type { VtSyncAnalyticsWindow } from "./contracts"
import {
 VT_SYNC_DERIVED_WINDOW_CATEGORY_IDS,
 VT_SYNC_UNWINDOWED_CATEGORY_IDS,
 vtSyncCategoryIsWindowFetchable,
} from "./windowDerivation"

/** Mirrors localSyncEngine's batching and bundle constants. */
export const VT_SYNC_COST_MODEL = {
 videoBatchSize: 200,
 /** watch / engagement / cards / revenue */
 metricBundles: 4,
 /** the four above plus annotations */
 dailyMetricBundles: 5,
 /** categories fetched with the full 4-bundle contract rather than one call */
 completeContractCategoryIds: new Set(["creator_content_type", "geography_country"]),
 /** sharing_service and traffic details paginate */
 paginatedMaxPages: 4,
 paginatedCategoryIds: new Set([
  "sharing_service",
  "traffic_overview",
  "advertising",
  "ext_websites",
  "hashtags",
  "traffic_notification",
  "traffic_subscribers",
  "other_features",
  "search_terms",
  "traffic_end_screen",
  "sound_pages",
  "traffic_video_remixes",
  "traffic_campaign_card",
 ]),
 /**
  * Traffic details whose rows name a video or channel trigger an extra Data API
  * lookup to resolve titles, so they cost more than their pages alone.
  */
 enrichedCategoryIds: new Set(["suggested_videos", "channel_pages", "traffic_watch_with"]),
 enrichmentRequests: 2,
 /** Playlist analytics paginates deeply (200/page, up to 50 pages). */
 playlistMaxPages: 6,
} as const

/**
 * Default ceiling for ONE run's windowed requests, excluding the lifetime pass
 * the engine would have made anyway. Chosen so a full five-window selection on
 * a typical catalog degrades rather than running for many minutes; it is a
 * pacing guard, not a quota limit.
 */
export const VT_SYNC_DEFAULT_WINDOW_REQUEST_BUDGET = 400

/**
 * Order windows are kept in when a run must be trimmed.
 *
 * Lifetime first because every stored dataset keys off it. Then the short
 * windows, which go stale fastest and are cheapest to refresh; the long windows
 * move slowly and lose the least by waiting for the next run.
 */
export const VT_SYNC_WINDOW_PRIORITY: VtSyncAnalyticsWindow[] = [
 "lifetime",
 "28d",
 "7d",
 "90d",
 "365d",
]

/** Requests one category costs for ONE window. */
export const vtSyncCategoryRequestCost = (
 categoryId: string,
 videoCount: number,
): number => {
 if (categoryId === "videos_analytics") {
  const batches = Math.max(1, Math.ceil(videoCount / VT_SYNC_COST_MODEL.videoBatchSize))
  return batches * VT_SYNC_COST_MODEL.dailyMetricBundles
 }
 if (categoryId === "channel_totals") return VT_SYNC_COST_MODEL.metricBundles
 if (VT_SYNC_COST_MODEL.completeContractCategoryIds.has(categoryId)) {
  return VT_SYNC_COST_MODEL.metricBundles
 }
 if (categoryId === "playlists_analytics") return VT_SYNC_COST_MODEL.playlistMaxPages
 if (VT_SYNC_COST_MODEL.enrichedCategoryIds.has(categoryId)) {
  return VT_SYNC_COST_MODEL.paginatedMaxPages + VT_SYNC_COST_MODEL.enrichmentRequests
 }
 if (VT_SYNC_COST_MODEL.paginatedCategoryIds.has(categoryId)) {
  return VT_SYNC_COST_MODEL.paginatedMaxPages
 }
 return 1
}

export type VtSyncRunCostEstimate = {
 /** Requests attributable to the non-lifetime windows only. */
 extraRequests: number
 /** Categories that cost per window. */
 fetchedCategoryCount: number
 /** Categories whose windows derive from stored history at no request cost. */
 derivedCategoryCount: number
 /** Categories with no windowed form at all. */
 unwindowedCategoryCount: number
 extraWindowCount: number
 exceedsBudget: boolean
 budget: number
}

export const estimateVtSyncRunCost = (input: {
 categoryIds: string[]
 windows: VtSyncAnalyticsWindow[]
 videoCount?: number
 budget?: number
}): VtSyncRunCostEstimate => {
 const budget = input.budget ?? VT_SYNC_DEFAULT_WINDOW_REQUEST_BUDGET
 const videoCount = input.videoCount ?? 0
 const unique = [...new Set(input.categoryIds)]

 const fetched = unique.filter(vtSyncCategoryIsWindowFetchable)
 const derived = unique.filter((id) => VT_SYNC_DERIVED_WINDOW_CATEGORY_IDS.has(id))
 const unwindowed = unique.filter((id) => VT_SYNC_UNWINDOWED_CATEGORY_IDS.has(id))
 const extraWindows = [...new Set(input.windows)].filter((w) => w !== "lifetime")

 const perWindow = fetched.reduce(
  (sum, id) => sum + vtSyncCategoryRequestCost(id, videoCount),
  0,
 )
 const extraRequests = perWindow * extraWindows.length

 return {
  extraRequests,
  fetchedCategoryCount: fetched.length,
  derivedCategoryCount: derived.length,
  unwindowedCategoryCount: unwindowed.length,
  extraWindowCount: extraWindows.length,
  exceedsBudget: extraRequests > budget,
  budget,
 }
}

export type VtSyncWindowPlan = {
 /** Windows the run will actually sync, in execution order. */
 windows: VtSyncAnalyticsWindow[]
 /** Windows dropped for budget, to be reported as pending rather than failed. */
 deferred: VtSyncAnalyticsWindow[]
 estimate: VtSyncRunCostEstimate
}

/**
 * Decide which windows a run can afford.
 *
 * Degrades rather than failing: partial coverage is already a first-class state
 * in the freshness model, and a creator who asked for five windows is better
 * served by three plus an honest "pending" than by an error. Lifetime is never
 * deferred — the flat snapshot fields and stored dataset rows key off it.
 */
export const planVtSyncWindows = (input: {
 categoryIds: string[]
 windows: VtSyncAnalyticsWindow[]
 videoCount?: number
 budget?: number
}): VtSyncWindowPlan => {
 const requested = [...new Set(input.windows)]
 const ordered = VT_SYNC_WINDOW_PRIORITY.filter((w) => requested.includes(w))
 // Anything outside the known priority list still runs, after the known ones.
 const extras = requested.filter((w) => !VT_SYNC_WINDOW_PRIORITY.includes(w))
 const candidates = [...ordered, ...extras]

 const accepted: VtSyncAnalyticsWindow[] = []
 const deferred: VtSyncAnalyticsWindow[] = []

 for (const window of candidates) {
  if (window === "lifetime") {
   accepted.push(window)
   continue
  }
  const trial = estimateVtSyncRunCost({ ...input, windows: [...accepted, window] })
  if (trial.exceedsBudget && accepted.some((w) => w !== "lifetime")) {
   deferred.push(window)
   continue
  }
  // The first non-lifetime window is always attempted, even if it alone exceeds
  // the budget: refusing every window would make the feature unusable on a
  // large catalog, and the engine's own pacing still applies.
  accepted.push(window)
 }

 return {
  windows: accepted.length ? accepted : ["lifetime"],
  deferred,
  estimate: estimateVtSyncRunCost({ ...input, windows: accepted }),
 }
}
