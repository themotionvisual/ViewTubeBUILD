/**
 * Project a snapshot onto one analytics window.
 *
 * Data visuals read the FLAT snapshot fields (`geography`, `devices`, …) and the
 * per-video `metrics` map, all of which are lifetime by contract. Rather than
 * teach 49 visual modules about windows, this hands them a snapshot whose flat
 * fields already hold the requested window's rows. Every module then works
 * unchanged, and there is exactly one place where window selection happens.
 *
 * What it must never do is substitute lifetime rows for a window that was not
 * synced. A chart silently redrawing all-time data under a "28d" label is worse
 * than a table doing it — a table at least has a column header to check. So a
 * dataset with no rows for the window is emptied, and the coverage report says
 * which ones, so the UI can say so.
 *
 * See docs/migration/TIME_WINDOW_UI_VISUALS_PLAN_2026-09-17.md §9.
 */

import type { VtSyncAnalyticsWindow, VtSyncSnapshot } from "./contracts"

/**
 * categoryId -> flat snapshot field, mirroring the engine's segmentRuns table.
 * `datasetsByWindow` is keyed by categoryId; the visuals read the field names.
 * A drift test pins this against the engine.
 */
export const VT_SYNC_WINDOW_DATASET_FIELDS: Readonly<Record<string, string>> = Object.freeze({
 audience_demographics: "demographics",
 demographics_age: "demographicsByAge",
 demographics_gender: "demographicsByGender",
 audience_watch_behavior: "audienceWatchBehavior",
 new_returning_viewers: "newReturningViewers",
 creator_content_type: "creatorContentTypes",
 formats_subscriber_status: "formatSubscriberStatuses",
 geography_country: "geography",
 geography_city: "cities",
 geography_province: "provinces",
 geography_dma: "dmaRegions",
 device_type: "devices",
 operating_system: "operatingSystems",
 playback_location: "playbackLocations",
 subscription_status: "subscriptionStatuses",
 ad_type: "adTypes",
 sharing_service: "sharingService",
 playlists_analytics: "playlistsData",
})

export type VtSyncWindowCoverage = {
 window: VtSyncAnalyticsWindow
 /** Datasets carrying real rows for this window. */
 present: string[]
 /** Datasets emptied because this window was never synced for them. */
 missing: string[]
 /** True when the projection changed nothing (lifetime). */
 isLifetime: boolean
}

export type VtSyncWindowProjection = {
 snapshot: VtSyncSnapshot
 coverage: VtSyncWindowCoverage
}

/**
 * Build a snapshot scoped to `window`.
 *
 * Lifetime returns the input untouched — the flat fields already are lifetime,
 * so there is nothing to do and no copy to pay for.
 */
export const projectVtSyncSnapshotToWindow = (
 snapshot: VtSyncSnapshot,
 window: VtSyncAnalyticsWindow,
): VtSyncWindowProjection => {
 if (window === "lifetime") {
  return {
   snapshot,
   coverage: { window, present: [], missing: [], isLifetime: true },
  }
 }

 const byWindow = snapshot.datasetsByWindow?.[window] || {}
 const next = { ...snapshot } as Record<string, unknown>
 const present: string[] = []
 const missing: string[] = []

 Object.entries(VT_SYNC_WINDOW_DATASET_FIELDS).forEach(([categoryId, field]) => {
  const rows = byWindow[categoryId]
  if (Array.isArray(rows) && rows.length) {
   next[field] = rows
   present.push(categoryId)
   return
  }
  // Empty rather than leave lifetime rows wearing this window's label.
  if (Array.isArray((snapshot as Record<string, unknown>)[field])) {
   next[field] = []
   missing.push(categoryId)
  }
 })

 // Per-video metrics live on the video, not in datasetsByWindow.
 const videos = Array.isArray(snapshot.videos) ? snapshot.videos : []
 const windowedVideos = videos
  .filter((video) => video.metricsByWindow?.[window])
  .map((video) => ({ ...video, metrics: video.metricsByWindow?.[window] }))
 if (windowedVideos.length) {
  next.videos = windowedVideos
  present.push("videos_analytics")
 } else if (videos.length) {
  next.videos = []
  missing.push("videos_analytics")
 }

 return {
  snapshot: next as VtSyncSnapshot,
  coverage: { window, present, missing, isLifetime: false },
 }
}

/** True when nothing at all is available for the requested window. */
export const isVtSyncWindowEmpty = (coverage: VtSyncWindowCoverage): boolean =>
 !coverage.isLifetime && coverage.present.length === 0
