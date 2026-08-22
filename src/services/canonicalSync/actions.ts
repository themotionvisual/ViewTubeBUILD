import type { CanonicalSyncOverview } from "./contracts"
import type { CanonicalOperatorPhaseId } from "./operatorPhases"
import {
 runCanonicalPhaseOneSync,
 runCanonicalPhaseTwoSync,
 runCanonicalPhaseThreeSync,
 runCanonicalAudienceSync,
 runCanonicalDailyMetricsSync,
 runCanonicalDefaultSync,
 runCanonicalDemographicsSync,
 runCanonicalGeographySync,
 getCanonicalSyncOverview,
 runCanonicalPlaylistSync,
 runCanonicalRetentionSync,
 runCanonicalRevenueSync,
 runCanonicalTestSync,
 runCanonicalTrafficSync,
 runCanonicalVideoMetricsSync,
 runCanonicalViewerCohortSync,
} from "./repository"

export type CanonicalOperatorActionId = "phase_1" | "phase_2" | "phase_3"

export const CANONICAL_OPERATOR_ACTION_META: Record<
 CanonicalOperatorActionId,
 {
  label: string
  operatorPhase: CanonicalOperatorPhaseId
  stages: string[]
 }
> = {
 phase_1: {
  label: "Phase 1 · Identity & Lifetime",
  operatorPhase: "identity_lifetime",
  stages: ["channel_bootstrap", "channel_window", "channel_daily"],
 },
 phase_2: {
  label: "Phase 2 · Video Inventory & Base Metrics",
  operatorPhase: "video_inventory",
  stages: ["video_inventory", "video_metrics"],
 },
 phase_3: {
  label: "Phase 3 · Deep Enrichment",
  operatorPhase: "deep_enrichment",
  stages: [
   "viewer_cohorts",
   "traffic_sync",
   "audience_segments",
   "demographics_sync",
   "geography_sync",
   "playlist_sync",
   "owner_mode",
   "retention_sync",
   "shadow_diff",
  ],
 },
}

export type CanonicalActionId =
 | "default_sync"
 | "video_metrics"
 | "daily_metrics"
 | "traffic"
 | "audience"
 | "demographics"
 | "geography"
 | "revenue_monetization"
 | "viewer_cohorts"
 | "playlists"
 | "retention"
 | "test_sync"

export type CanonicalActionQuotaProfile = "low" | "medium" | "high"
export type CanonicalActionReadiness = "ready" | "partial" | "blocked" | "not_built"
export type CanonicalActionDropdownOption =
 | "traffic_overview"
 | "traffic_detail"
 | "search_console"
 | "retention_recent"

export type CanonicalActionDefinition = {
 id: CanonicalActionId
 label: string
 description: string
 quotaProfile: CanonicalActionQuotaProfile
 readiness: CanonicalActionReadiness
 helperText: string
 scope: "full_history" | "family_only" | "validation_only" | "targeted"
 dropdownOptions?: Array<{
  id: CanonicalActionDropdownOption
  label: string
  readiness: CanonicalActionReadiness
 }>
}

const hasChannelContext = (overview: CanonicalSyncOverview | null): boolean =>
 Number(overview?.channelCount || 0) > 0

const hasVideoContext = (overview: CanonicalSyncOverview | null): boolean =>
 Number(overview?.videoCount || 0) > 0

const readVideoMetricReadiness = (
 overview: CanonicalSyncOverview | null,
): CanonicalActionReadiness => {
 if (Number(overview?.metricCoverage.videoMetricsCount || 0) > 0) return "ready"
 return hasChannelContext(overview) ? "partial" : "blocked"
}

const readRevenueReadiness = (
 overview: CanonicalSyncOverview | null,
): CanonicalActionReadiness => {
 if (Number(overview?.metricCoverage.revenueMetricsCount || 0) > 0) return "ready"
 return hasVideoContext(overview) ? "partial" : "blocked"
}

const readViewerCohortReadiness = (
 overview: CanonicalSyncOverview | null,
): CanonicalActionReadiness => {
 if (Number(overview?.metricCoverage.viewerCohortsCount || 0) > 0) return "ready"
 return hasVideoContext(overview) ? "partial" : "blocked"
}

export const buildCanonicalActionDefinitions = (
 overview: CanonicalSyncOverview | null,
): CanonicalActionDefinition[] => [
 {
  id: "default_sync",
  label: "Sync Data",
  description:
   "Run the default SSS-style YouTube sync: bootstrap, video statistics, daily/window summaries, traffic, audience, geography, monetization, playlists, and targeted retention.",
  quotaProfile: "high",
  readiness: hasChannelContext(overview) ? "ready" : "partial",
  helperText:
   Number(overview?.videoCount || 0) > 0
    ? "Default full canonical sink is ready for manual Sync Data runs"
    : "Bootstrap runs first, then the full default sink fills table families",
  scope: "full_history",
 },
 {
  id: "video_metrics",
  label: "Sync Video Metrics",
  description:
   "Sync the full channel video catalog plus all supported per-video metrics across canonical windows.",
  quotaProfile: "high",
  readiness: readVideoMetricReadiness(overview),
  helperText:
   Number(overview?.videoCount || 0) > 0
    ? `${Number(overview?.videoCount || 0).toLocaleString()} videos in canonical inventory`
    : "Bootstrap runs automatically before full video sync",
  scope: "full_history",
 },
 {
  id: "daily_metrics",
  label: "Sync Daily Metrics",
  description:
   "Sync the entire channel history of daily analytics into the canonical day-series store.",
  quotaProfile: "medium",
  readiness:
   Number(overview?.channelDailyRowCount || 0) > 0
    ? "ready"
    : hasChannelContext(overview)
     ? "partial"
     : "blocked",
  helperText:
   Number(overview?.channelDailyRowCount || 0) > 0
    ? `${Number(overview?.channelDailyRowCount || 0).toLocaleString()} canonical daily rows stored`
    : "Full channel-history daily sync",
  scope: "full_history",
 },
 {
  id: "traffic",
  label: "Sync Traffic",
  description:
   "Sync canonical traffic overview and detail paths. Search Console stays a separate lane inside this family.",
  quotaProfile: "medium",
  readiness:
   Number(overview?.trafficRowCount || 0) > 0
    ? "ready"
    : hasVideoContext(overview)
     ? "partial"
     : "blocked",
  helperText:
   Number(overview?.trafficRowCount || 0) > 0
    ? `${Number(overview?.trafficRowCount || 0).toLocaleString()} canonical traffic rows stored`
    : "Traffic overview and detail lanes share one canonical sink",
  scope: "family_only",
  dropdownOptions: [
   { id: "traffic_overview", label: "Traffic Overview", readiness: "ready" },
   { id: "traffic_detail", label: "Traffic Detail", readiness: "ready" },
   { id: "search_console", label: "Search Console", readiness: "not_built" },
  ],
 },
 {
  id: "audience",
  label: "Sync Audience",
  description:
   "Sync audience segment rows only, including subscribed-status and channel/video audience splits.",
  quotaProfile: "medium",
  readiness:
   Number(overview?.audienceSplitCount || 0) > 0
    ? "ready"
    : hasVideoContext(overview)
     ? "partial"
     : "blocked",
  helperText:
   Number(overview?.audienceSplitCount || 0) > 0
    ? `${Number(overview?.audienceSplitCount || 0).toLocaleString()} audience split rows stored`
    : "Audience sync is now separate from geography",
  scope: "family_only",
 },
 {
  id: "demographics",
  label: "Sync Demographics",
  description:
   "Sync demographic rows for age and gender, then feed demographics, age-only, and gender-only table views.",
  quotaProfile: "medium",
  readiness:
   Number(overview?.audienceSplitCount || 0) > 0
    ? "ready"
    : hasVideoContext(overview)
     ? "partial"
     : "blocked",
  helperText:
   Number(overview?.audienceSplitCount || 0) > 0
    ? `${Number(overview?.audienceSplitCount || 0).toLocaleString()} audience/demographic split rows stored`
    : "Demographics run independently from subscriber-status audience splits",
  scope: "family_only",
 },
 {
  id: "geography",
  label: "Sync Geography",
  description:
   "Sync country and supported per-video geography rows without mixing in audience-family data.",
  quotaProfile: "medium",
  readiness:
   Number(overview?.geographyRowCount || 0) > 0
    ? "ready"
    : hasVideoContext(overview)
     ? "partial"
     : "blocked",
  helperText:
   Number(overview?.geographyRowCount || 0) > 0
    ? `${Number(overview?.geographyRowCount || 0).toLocaleString()} geography rows stored`
    : "Geography sync is now separate from audience",
  scope: "family_only",
 },
 {
  id: "revenue_monetization",
  label: "Sync Revenue & Monetization",
  description:
   "Sync monetization-heavy video metrics only: revenue, ad revenue, CPM, monetized playbacks, and ad impressions.",
  quotaProfile: "high",
  readiness: readRevenueReadiness(overview),
  helperText:
   Number(overview?.metricCoverage.revenueMetricsCount || 0) > 0
    ? `${Number(overview?.metricCoverage.revenueMetricsCount || 0).toLocaleString()} videos already have canonical revenue metrics`
    : "Revenue sync runs separately from the broad all-video pass",
  scope: "family_only",
 },
 {
  id: "viewer_cohorts",
  label: "Sync Viewer Cohorts",
  description:
   "Sync thresholded per-video cohort metrics like unique viewers, new viewers, casual viewers, and regular viewers.",
  quotaProfile: "medium",
  readiness: readViewerCohortReadiness(overview),
  helperText:
   Number(overview?.metricCoverage.viewerCohortsCount || 0) > 0
    ? `${Number(overview?.metricCoverage.viewerCohortsCount || 0).toLocaleString()} videos already have cohort metrics`
    : "Cohort sync stays separate from the audience segment sink",
  scope: "family_only",
 },
 {
  id: "playlists",
  label: "Sync Playlists",
  description:
   "Sync canonical playlist records and playlist window summaries for owned-playlist metrics.",
  quotaProfile: "low",
  readiness:
   Number(overview?.playlistCount || 0) > 0
    ? "ready"
    : hasChannelContext(overview)
     ? "partial"
     : "blocked",
  helperText:
   Number(overview?.playlistCount || 0) > 0
    ? `${Number(overview?.playlistCount || 0).toLocaleString()} canonical playlists stored`
    : "Playlist branch is cheap enough to include in validation passes",
  scope: "family_only",
 },
 {
  id: "retention",
  label: "Sync Retention",
  description:
   "Run the narrow retention sink for a small recent target set instead of a whole-channel retention sweep.",
  quotaProfile: "high",
  readiness:
   Number(overview?.retentionSeriesCount || 0) > 0
    ? "ready"
    : hasVideoContext(overview)
     ? "partial"
     : "blocked",
  helperText:
   Number(overview?.retentionSeriesCount || 0) > 0
    ? `${Number(overview?.retentionSeriesCount || 0).toLocaleString()} retention series stored`
    : "Retention stays intentionally targeted to keep quota usage controlled",
  scope: "targeted",
  dropdownOptions: [
   { id: "retention_recent", label: "Recent + Top Format Set", readiness: "ready" },
  ],
 },
 {
  id: "test_sync",
  label: "Run Canonical Test Sync",
  description:
   "Run a low-quota validation pass across the canonical families without doing a full deep sync.",
  quotaProfile: "low",
  readiness: "ready",
  helperText:
   "Uses bootstrap, daily, a small recent video cohort, traffic overview, audience, geography, and playlists.",
  scope: "validation_only",
 },
]

const activeRuns = new Set<string>();

export const runCanonicalOperatorAction = async (
 actionId: CanonicalOperatorActionId,
): Promise<CanonicalSyncOverview> => {
 if (activeRuns.has(actionId)) {
  throw new Error(`Sync phase ${actionId} already running.`)
 }
 activeRuns.add(actionId)
 try {
  switch (actionId) {
   case "phase_1":
    return await runCanonicalPhaseOneSync()
   case "phase_2":
    return await runCanonicalPhaseTwoSync()
   case "phase_3":
    return await runCanonicalPhaseThreeSync()
   default:
    throw new Error(`Unknown canonical operator action: ${actionId}`)
  }
 } finally {
  activeRuns.delete(actionId)
 }
}

export const runCanonicalAction = async (
 actionId: CanonicalActionId,
 dropdownOption?: CanonicalActionDropdownOption,
): Promise<CanonicalSyncOverview> => {
 if (activeRuns.has(actionId)) {
  throw new Error(`Sync family ${actionId} already running.`)
 }
 activeRuns.add(actionId)
  try {
  switch (actionId) {
   case "default_sync":
    return await runCanonicalDefaultSync()
   case "video_metrics":
    return await runCanonicalVideoMetricsSync()
   case "daily_metrics":
    return await runCanonicalDailyMetricsSync()
   case "traffic":
    if (dropdownOption === "search_console") {
     throw new Error("Canonical Search Console sync is not built yet.")
    }
    await runCanonicalTrafficSync()
    return await getCanonicalSyncOverview()
   case "audience":
    return await runCanonicalAudienceSync()
   case "demographics":
    return await runCanonicalDemographicsSync()
   case "geography":
    return await runCanonicalGeographySync()
   case "revenue_monetization":
    return await runCanonicalRevenueSync()
   case "viewer_cohorts":
    return await runCanonicalViewerCohortSync()
   case "playlists":
    return await runCanonicalPlaylistSync()
   case "retention":
    return await runCanonicalRetentionSync()
   case "test_sync":
    return await runCanonicalTestSync()
   default:
    throw new Error(`Unknown canonical action: ${actionId}`)
  }
 } finally {
  activeRuns.delete(actionId)
 }
}
