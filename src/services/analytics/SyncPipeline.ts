// --- BEGIN analyticsSyncRegistry.ts ---
import type { CsvMajorFamily } from "../../types"

export type AnalyticsSyncSpeedClass = "fast" | "medium" | "bulk_delayed" | "manual_csv_only"
export type AnalyticsSyncQuotaCostClass = "low" | "medium" | "high"
export type AnalyticsSyncSource = "youtube_analytics_api" | "youtube_reporting_api" | "youtube_data_api" | "csv_import"
export type AnalyticsSyncAction =
 | "core_video_data"
 | "daily_metrics"
 | "video_metrics"
 | "traffic"
 | "geography"
 | "audience"
 | "surfaces_discovery"
 | "revenue_monetization"
 | "reporting_bulk"
 | "comments"
 | "deep_data"

export type AnalyticsSyncRegistryRow = {
 action: AnalyticsSyncAction
 datasetFamily: CsvMajorFamily | "comments" | "reporting_bulk"
 label: string
 description: string
 source: AnalyticsSyncSource
 grain: string
 speedClass: AnalyticsSyncSpeedClass
 quotaCostClass: AnalyticsSyncQuotaCostClass
 requiresOAuth: boolean
 fallbackToCsv: boolean
 notes: string
 enrichmentMode?: "core" | "video_metrics" | "traffic" | "segments" | "all"
 batchMode?: "initial" | "next"
}

export const ANALYTICS_SYNC_REGISTRY: AnalyticsSyncRegistryRow[] = [
 {
  action: "core_video_data",
  datasetFamily: "video_data",
  label: "Sync Core Video Data",
  description: "Channel profile, videos, and baseline hard-number metrics.",
  source: "youtube_analytics_api",
  grain: "video",
  speedClass: "fast",
  quotaCostClass: "medium",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Best first sync for charts and tables.",
  enrichmentMode: "core",
  batchMode: "initial",
 },
 {
  action: "video_metrics",
  datasetFamily: "video_data",
  label: "Sync More Video Metrics",
  description: "Daily metrics, extra per-video metrics, and format splits.",
  source: "youtube_analytics_api",
  grain: "video,daily",
  speedClass: "medium",
  quotaCostClass: "medium",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Adds richer video columns and daily metrics.",
  enrichmentMode: "video_metrics",
  batchMode: "initial",
 },
 {
  action: "daily_metrics",
  datasetFamily: "daily_metrics",
  label: "Sync Daily Metrics",
  description: "Channel day-by-day analytics window data.",
  source: "youtube_analytics_api",
  grain: "day",
  speedClass: "medium",
  quotaCostClass: "medium",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Currently rides the video-metrics enrichment path.",
  enrichmentMode: "video_metrics",
  batchMode: "initial",
 },
 {
  action: "traffic",
  datasetFamily: "traffic",
  label: "Sync Traffic",
  description: "Traffic source overview, daily, video, and supported detail breakdowns.",
  source: "youtube_analytics_api",
  grain: "source,day,video",
  speedClass: "medium",
  quotaCostClass: "medium",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Uses Analytics API first and keeps diagnostics for unsupported detail shapes.",
  enrichmentMode: "traffic",
  batchMode: "initial",
 },
 {
  action: "geography",
  datasetFamily: "geography",
  label: "Sync Geography",
  description: "Country-level geography plus supported city and province splits.",
  source: "youtube_analytics_api",
  grain: "country,city,province",
  speedClass: "medium",
  quotaCostClass: "medium",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Currently grouped in the deep segments pass.",
  enrichmentMode: "segments",
  batchMode: "initial",
 },
 {
  action: "audience",
  datasetFamily: "audience",
  label: "Sync Audience",
  description: "Age, gender, and subscribed-status audience data.",
  source: "youtube_analytics_api",
  grain: "demographic",
  speedClass: "medium",
  quotaCostClass: "medium",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Currently grouped in the deep segments pass.",
  enrichmentMode: "segments",
  batchMode: "initial",
 },
 {
  action: "surfaces_discovery",
  datasetFamily: "surfaces_discovery",
  label: "Sync Surfaces & Discovery",
  description: "Playback location and other discovery surfaces where supported.",
  source: "youtube_reporting_api",
  grain: "surface",
  speedClass: "bulk_delayed",
  quotaCostClass: "low",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Most of this family is CSV-first or Reporting-first today.",
  enrichmentMode: "all",
  batchMode: "initial",
 },
 {
  action: "revenue_monetization",
  datasetFamily: "revenue_monetization",
  label: "Sync Revenue & Monetization",
  description: "Revenue, ad-type, and monetization-specific statistics.",
  source: "youtube_analytics_api",
  grain: "video,dimension",
  speedClass: "medium",
  quotaCostClass: "high",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Some detail cuts remain CSV-only depending on report shape.",
  enrichmentMode: "all",
  batchMode: "initial",
 },
 {
  action: "reporting_bulk",
  datasetFamily: "reporting_bulk",
  label: "Sync Reporting Bulk",
  description: "Warehouse-style historical report jobs with 48-hour startup delay.",
  source: "youtube_reporting_api",
  grain: "bulk",
  speedClass: "bulk_delayed",
  quotaCostClass: "low",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Use for broad historical coverage, not first-screen readiness.",
 },
 {
  action: "comments",
  datasetFamily: "comments",
  label: "Sync Comments",
  description: "Full comments and replies with pagination and date limits.",
  source: "youtube_data_api",
  grain: "comment",
  speedClass: "medium",
  quotaCostClass: "high",
  requiresOAuth: true,
  fallbackToCsv: false,
  notes: "Later path only; not part of default analytics sync.",
 },
 {
  action: "deep_data",
  datasetFamily: "traffic",
  label: "Sync All Deep Data",
  description: "Manual deep pass across traffic, audience, geography, and current extended metrics.",
  source: "youtube_analytics_api",
  grain: "mixed",
  speedClass: "medium",
  quotaCostClass: "high",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Current catch-all path while the family-specific sync registry is being split out.",
  enrichmentMode: "all",
  batchMode: "initial",
 },
]

// --- END analyticsSyncRegistry.ts ---

// --- BEGIN analyticsRuntime.ts ---
import type { CanonicalVideoRow } from "./DataStore"

export type SyncSourceMode = "api_analytics" | "uploads" | "both"
export type StorageMode = "sync" | "storage" | "both"

export interface EffectiveAnalyticsRows {
 rows: CanonicalVideoRow[]
 includeOnlyActive: boolean
 includedCount: number
 excludedCount: number
}

export interface RowFilterState {
 excludeByIdentity: Set<string>
 includeOnlyByIdentity: Set<string>
}

export const SYNC_SOURCE_MODE_KEY = "vt_sync_source_mode"
export const STORAGE_MODE_KEY = "vt_storage_mode"
export const UPLOAD_CACHE_FILES_KEY = "vt_uploaded_csv_cache"

export const getStoredSyncSourceMode = (): SyncSourceMode => {
 const raw = localStorage.getItem(SYNC_SOURCE_MODE_KEY)
 if (raw === "api_analytics" || raw === "uploads" || raw === "both") return raw
 return "api_analytics"
}

export const setStoredSyncSourceMode = (mode: SyncSourceMode): void => {
 localStorage.setItem(SYNC_SOURCE_MODE_KEY, mode)
}

export const getStoredStorageMode = (): StorageMode => {
 const raw = localStorage.getItem(STORAGE_MODE_KEY)
 if (raw === "sync" || raw === "storage" || raw === "both") return raw
 if (raw === "cache") {
  localStorage.setItem(STORAGE_MODE_KEY, "sync")
  return "sync"
 }
 return "sync"
}

export const setStoredStorageMode = (mode: StorageMode): void => {
 localStorage.setItem(STORAGE_MODE_KEY, mode)
}

const safeParse = <T>(raw: string | null, fallback: T): T => {
 if (!raw) return fallback
 try {
  return JSON.parse(raw) as T
 } catch {
  return fallback
 }
}

const titleIdentity = (title: string): string => `title:${title.trim().toLowerCase()}`

const rowIdentityCandidates = (row: CanonicalVideoRow): string[] => {
 const candidates: string[] = []
 const idCandidate = row.videoId?.trim()
 if (idCandidate) {
  candidates.push(idCandidate)
  candidates.push(`video:${idCandidate}`)
 }
 const normalizedTitle = row.title?.trim()
 if (normalizedTitle) {
  candidates.push(normalizedTitle)
  candidates.push(normalizedTitle.toLowerCase())
  candidates.push(titleIdentity(normalizedTitle))
 }
 return Array.from(new Set(candidates))
}

const getGlobalVideoFlags = (): Record<
 string,
 { excludeAnalysis?: boolean; includeOnly?: boolean; priorityAnalysis?: boolean }
> => {
 const brain = safeParse<Record<string, unknown>>(
  localStorage.getItem("vt_workspace_brain"),
  {},
 )
 const flags = brain.videoFlags
 if (!flags || typeof flags !== "object") return {}
 return flags as Record<
  string,
  { excludeAnalysis?: boolean; includeOnly?: boolean; priorityAnalysis?: boolean }
 >
}

export const buildRowFilterState = (): RowFilterState => {
 const flags = getGlobalVideoFlags()
 const excludeByIdentity = new Set<string>()
 const includeOnlyByIdentity = new Set<string>()

 for (const [identity, flag] of Object.entries(flags)) {
  if (flag.excludeAnalysis) excludeByIdentity.add(identity)
  if (flag.includeOnly || flag.priorityAnalysis) includeOnlyByIdentity.add(identity)
 }

 return { excludeByIdentity, includeOnlyByIdentity }
}

export const applyGlobalRowFilters = (
 rows: CanonicalVideoRow[],
): EffectiveAnalyticsRows => {
 const { excludeByIdentity, includeOnlyByIdentity } = buildRowFilterState()
 const includeOnlyActive = includeOnlyByIdentity.size > 0

 const filtered = rows.filter((row) => {
  const identities = rowIdentityCandidates(row)
  if (includeOnlyActive)
   return identities.some((identity) => includeOnlyByIdentity.has(identity))
  if (identities.some((identity) => excludeByIdentity.has(identity))) return false
  return true
 })

 return {
  rows: filtered,
  includeOnlyActive,
  includedCount: includeOnlyActive ? includeOnlyByIdentity.size : filtered.length,
  excludedCount: excludeByIdentity.size,
 }
}

export const toStorageIdentity = (videoIdOrFallback: string): string => {
 const trimmed = videoIdOrFallback.trim()
 if (!trimmed) return ""
 return trimmed
}

export const formatLastSync = (isoLike: string | null): string => {
 if (!isoLike) return "Never"
 const date = new Date(isoLike)
 if (Number.isNaN(date.getTime())) return "Never"
 const mm = String(date.getMonth() + 1).padStart(2, "0")
 const dd = String(date.getDate()).padStart(2, "0")
 const yy = String(date.getFullYear()).slice(-2)
 const hh = String(date.getHours()).padStart(2, "0")
 const min = String(date.getMinutes()).padStart(2, "0")
 const sec = String(date.getSeconds()).padStart(2, "0")
 return `${mm}/${dd}/${yy} ${hh}:${min}:${sec}`
}

// --- END analyticsRuntime.ts ---

// --- BEGIN analyticsCapabilityMatrix.ts ---
import {
 ANALYTICS_WINDOWS,
 METRIC_CAPABILITY_REGISTRY,
 METRIC_REGISTRY,
  type AnalyticsWindow,
  type CanonicalMetricKey,
} from "./DataStore"
import { DATA_COVERAGE_CATALOG } from "./MetricRegistry"
import type { SyncDiagnostics } from "../productArchitecture"
import { getMasterVideoColumnDefinition } from "../performanceHubTableRegistry"

export type CapabilityScope =
 | "video_shared"
 | "short_only"
 | "long_only"
 | "channel"
 | "geo"
 | "demographic"
 | "traffic"
 | "device"
 | "monetization"
 | "daily"
 | "history"

export type SourceCapability = "api" | "csv_only" | "derived" | "unsupported"

export type CapabilityRow = {
 metric: string
 scope: CapabilityScope
 windowSupport: AnalyticsWindow[]
 sourceCapability: SourceCapability
 reasonCode: string
}

export type MissingMetricBacklogItem = {
 metric: string
 scope: CapabilityScope
 status: "missing_from_active_sync" | "active_sync"
 nextAction: string
 requiredEndpoint: "youtube_analytics_v2"
 requiredDimensions: string[]
 grain: "video" | "channel" | "daily"
 fallbackBehavior: "mark_unavailable" | "derive_if_inputs_exist"
}

export type VideoMetricRuntimeStatus =
 | "active_sync"
 | "temporarily_unavailable_due_to_request_shape"
 | "unsupported_at_video_scope"
 | "blocked_by_missing_video_ids"
 | "missing_from_active_sync"

export const ACTIVE_VIDEO_SYNC_METRICS = [
 "views",
 "estimatedMinutesWatched",
 "averageViewDuration",
 "averageViewPercentage",
 "subscribersGained",
 "likes",
 "comments",
 "shares",
 "engagedViews",
 "subscribersLost",
 "dislikes",
 "cardImpressions",
 "cardClicks",
 "cardClickRate",
 "videoThumbnailImpressions",
 "videoThumbnailImpressionsClickRate",
 "estimatedRevenue",
 "estimatedAdRevenue",
 "grossRevenue",
 "rpm",
 "cpm",
 "monetizedPlaybacks",
 "playbackBasedCpm",
 "adImpressions",
 "videosAddedToPlaylists",
 "videosRemovedFromPlaylists",
 "annotationClickThroughRate",
 "annotationCloseRate",
 "redViews",
 "estimatedRedPartnerRevenue",
] as const

const VIDEO_SCOPES = new Set<CapabilityScope>(["video_shared", "short_only", "long_only"])

const UNSYNCABLE_VIDEO_METRICS = new Set(["casualViewers", "regularViewers", "newViewers", "returningViewers", "uniqueViewers"])

const API_VIDEO_DIMENSIONS_BY_SCOPE: Record<string, string[]> = {
 video_shared: ["video"],
 short_only: ["video", "creatorContentType=SHORTS"],
 long_only: ["video", "creatorContentType=VIDEO"],
}

export const MASTER_TABLE_METRIC_VISIBILITY: Record<string, "api_synced" | "import_only" | "unsupported"> = {
 "New Viewers": "import_only",
 "Returning Viewers": "import_only",
 "Casual viewers": "import_only",
 "Regular viewers": "import_only",
 "Unique viewers": "import_only",
}

const inferScope = (rawScope: string): CapabilityScope => {
 if (rawScope === "video_shared" || rawScope === "short_only" || rawScope === "long_only") {
  return rawScope
 }
 if (rawScope === "channel" || rawScope === "geo" || rawScope === "demographic" || rawScope === "traffic" || rawScope === "device" || rawScope === "monetization" || rawScope === "daily" || rawScope === "history") {
  return rawScope
 }
 return "channel"
}

const inferSourceCapability = (metric: string, scope: CapabilityScope): SourceCapability => {
 if (!VIDEO_SCOPES.has(scope)) return "api"
 if (UNSYNCABLE_VIDEO_METRICS.has(metric)) return "csv_only"
 if (ACTIVE_VIDEO_SYNC_METRICS.includes(metric as (typeof ACTIVE_VIDEO_SYNC_METRICS)[number])) return "api"
 const capability = METRIC_CAPABILITY_REGISTRY[metric]
 if (
  capability?.enabled &&
  capability.source === "youtube_analytics_v2" &&
  capability.allowedDimensions.includes("video")
 ) {
  return "api"
 }
 if (metric.includes("formula") || metric.includes("derived")) return "derived"
 return "unsupported"
}

const inferWindowSupport = (metric: string, sourceCapability: SourceCapability): AnalyticsWindow[] => {
 if (sourceCapability === "unsupported") return []
 const canonical = METRIC_REGISTRY[metric as CanonicalMetricKey]
 if (!canonical) return [...ANALYTICS_WINDOWS]
 if (sourceCapability === "csv_only") return canonical.sourceWindows.csv_table
 if (sourceCapability === "derived") return ANALYTICS_WINDOWS
 return canonical.sourceWindows.api
}

const inferReasonCode = (sourceCapability: SourceCapability, scope: CapabilityScope): string => {
 if (sourceCapability === "api") return "api_supported"
 if (sourceCapability === "csv_only") return "csv_or_sheet_only"
 if (sourceCapability === "derived") return "formula_derived"
 if (scope === "long_only") return "not_in_active_longform_sync"
 if (scope === "short_only") return "not_in_active_shorts_sync"
 return "not_in_active_sync"
}

export const buildMetricCapabilityMatrix = (): CapabilityRow[] => {
 const rows = DATA_COVERAGE_CATALOG.map((entry) => {
  const scope = inferScope(entry.scope)
  const sourceCapability = inferSourceCapability(entry.canonicalKey, scope)
  return {
   metric: entry.canonicalKey,
   scope,
   windowSupport: inferWindowSupport(entry.canonicalKey, sourceCapability),
   sourceCapability,
   reasonCode: inferReasonCode(sourceCapability, scope),
  } satisfies CapabilityRow
 })

 const unique = new Map<string, CapabilityRow>()
 rows.forEach((row) => {
  const key = `${row.metric}::${row.scope}`
  if (!unique.has(key)) unique.set(key, row)
 })
 return Array.from(unique.values())
}

export const buildMissingVideoMetricBacklog = (): MissingMetricBacklogItem[] => {
 const rows = buildMetricCapabilityMatrix().filter((row) => VIDEO_SCOPES.has(row.scope))

 return rows.map((row) => {
  const isActive = ACTIVE_VIDEO_SYNC_METRICS.includes(
   row.metric as (typeof ACTIVE_VIDEO_SYNC_METRICS)[number],
  )
  const requiredDimensions = API_VIDEO_DIMENSIONS_BY_SCOPE[row.scope] || ["video"]
  const fallbackBehavior =
   row.sourceCapability === "derived"
    ? "derive_if_inputs_exist"
    : "mark_unavailable"

  return {
   metric: row.metric,
   scope: row.scope,
   status: isActive ? "active_sync" : "missing_from_active_sync",
   nextAction: isActive
    ? "keep_in_current_sync"
    : row.sourceCapability === "csv_only"
      ? "keep_import_only_and_label_provenance"
      : "add_metric_group_or_compat_fetch",
   requiredEndpoint: "youtube_analytics_v2",
   requiredDimensions,
   grain: "video",
   fallbackBehavior,
  }
 })
}

export const getMasterColumnVisibilityRule = (
 header: string,
): "api_synced" | "import_only" | "unsupported" => {
 const column = getMasterVideoColumnDefinition(header)
 if (!column) return MASTER_TABLE_METRIC_VISIBILITY[header] || "api_synced"
 if (column.sourceCapability === "csv_only") return "import_only"
 return "api_synced"
}

export const getVideoMetricRuntimeStatus = (
 metric: string,
 diagnostics: SyncDiagnostics | null | undefined,
 options: {
  hasTargetVideoIds?: boolean
 } = {},
): VideoMetricRuntimeStatus => {
 const hasTargetVideoIds = options.hasTargetVideoIds !== false
 const isActive = ACTIVE_VIDEO_SYNC_METRICS.includes(
  metric as (typeof ACTIVE_VIDEO_SYNC_METRICS)[number],
 )
 const capability = METRIC_CAPABILITY_REGISTRY[metric]

 if (!isActive) return "missing_from_active_sync"
 if (
  capability &&
  (!capability.enabled || !capability.allowedDimensions.includes("video"))
 ) {
  return "unsupported_at_video_scope"
 }
 if (!hasTargetVideoIds) return "blocked_by_missing_video_ids"
 if (!diagnostics) return "active_sync"

 const disabled = new Set(diagnostics.disabledMetrics || [])
 if (disabled.has(metric)) {
  const blockedFailure = (diagnostics.failureReasons || []).find((failure) =>
   (failure.metrics || []).includes(metric),
  )
  if (blockedFailure?.reason?.includes("No video IDs")) {
    return "blocked_by_missing_video_ids"
  }
  return "unsupported_at_video_scope"
 }

 const requestShapeFailure = (diagnostics.failureReasons || []).find(
  (failure) =>
   (failure.metrics || []).includes(metric) &&
   failure.requestClass === "video_top_videos_channel_filter" &&
   (failure.status === 400 ||
    failure.outcome === "quarantined" ||
    failure.reason.toLowerCase().includes("invalid")),
 )
 if (requestShapeFailure) {
  return "temporarily_unavailable_due_to_request_shape"
 }

 return "active_sync"
}

// --- END analyticsCapabilityMatrix.ts ---
