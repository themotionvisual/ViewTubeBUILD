import {
 ANALYTICS_WINDOWS,
 METRIC_CAPABILITY_REGISTRY,
 METRIC_REGISTRY,
  type AnalyticsWindow,
  type CanonicalMetricKey,
} from "./analyticsContract"
import { DATA_COVERAGE_CATALOG } from "./dataCoverageCatalog"
import type { SyncDiagnostics } from "./productArchitecture"

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
 return MASTER_TABLE_METRIC_VISIBILITY[header] || "api_synced"
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
