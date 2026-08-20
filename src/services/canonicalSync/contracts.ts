import type { AnalyticsWindow } from "../analytics/DataStore"
export type { AnalyticsWindow } from "../analytics/DataStore"

export const CANONICAL_SYNC_DB_NAME = "ViewTubeCanonicalAnalyticsDB"
export const CANONICAL_SYNC_DB_VERSION = 5

export const CANONICAL_SYNC_STORE_NAMES = {
 channelRecords: "channel_records",
 videoRecords: "video_records",
 channelWindowSummaries: "channel_window_summaries",
 channelDailySeries: "channel_daily_series",
 trafficRows: "traffic_rows",
 trafficDiagnostics: "traffic_diagnostics",
 audienceSplitRows: "audience_split_rows",
 geographyRows: "geography_rows",
 retentionSeries: "retention_series",
 playlistRecords: "playlist_records",
 playlistWindowSummaries: "playlist_window_summaries",
 syncRuns: "sync_runs",
 rawAudit: "raw_audit",
 shadowDiffs: "shadow_diffs",
 exportViews: "export_views",
} as const

export const CANONICAL_SYNC_ENABLED_KEY = "vt_canonical_sync_enabled"
export const CANONICAL_SYNC_VALIDATION_MODE_KEY =
 "vt_canonical_sync_validation_mode"
export const CANONICAL_SYNC_EXPORT_FORMAT_KEY =
 "vt_canonical_sync_export_format"
export const CANONICAL_SYNC_OWNER_MODE_ENABLED_KEY =
 "vt_canonical_owner_mode_enabled"
export const CANONICAL_SYNC_OWNER_ID_KEY = "vt_canonical_owner_id"

export type CanonicalSyncSource =
 | "data_api"
 | "analytics_api"
 | "reporting_api"
 | "owner_api"
 | "csv"
 | "derived"
export type MetricAvailability =
 | "available"
 | "unsupported"
 | "unavailable"
 | "pending"
export type MetricConfidence = "raw_direct" | "derived_exact" | "estimated"
export type MetricScope =
 | "video"
 | "channel"
 | "playlist"
 | "retention"
 | "owner_only"
 | "audience_split"
export type MergeRule =
 | "identity_locked"
 | "max_total"
 | "api_first"
 | "owner_first"
 | "csv_first"
 | "csv_only"
 | "derived_only"
export type CanonicalCreatorContentType =
 | "SHORTS"
 | "VIDEO_ON_DEMAND"
 | "LIVE_STREAM"
 | "STORY"
 | "UNSPECIFIED"
export type CanonicalSubscribedStatus = "SUBSCRIBED" | "UNSUBSCRIBED"
export type CanonicalRetentionAudienceType =
 | "ORGANIC"
 | "AD_INSTREAM"
 | "AD_INDISPLAY"
export type CanonicalRetentionYouTubeProduct = string
export type CanonicalSyncStage =
 | "channel_bootstrap"
 | "channel_window"
 | "channel_daily"
 | "video_inventory"
 | "video_metrics"
 | "viewer_cohorts"
 | "traffic_sync"
 | "audience_segments"
 | "demographics_sync"
 | "geography_sync"
 | "playlist_sync"
 | "owner_mode"
 | "retention_sync"
 | "shadow_diff"

export type CanonicalMetricValue = {
 value: number | null
 source: CanonicalSyncSource
 availability: MetricAvailability
 reasonCode?: string
 confidence: MetricConfidence
 syncedAt: string
}

export type CanonicalMetricMeta = Omit<CanonicalMetricValue, "value">
export type CanonicalNumericMetricMap = Record<string, number | null>
export type CanonicalMetricMetaMap = Record<string, CanonicalMetricMeta>

export type CanonicalTopicDetails = {
 topicIds: string[]
 topicCategories: string[]
 topicNames: string[]
}

export type CanonicalThumbnail = {
 url: string
 width?: number
 height?: number
}

export type CanonicalThumbnailSet = {
 default?: CanonicalThumbnail
 medium?: CanonicalThumbnail
 high?: CanonicalThumbnail
 maxres?: CanonicalThumbnail
}

export type ChannelPeriod = "current" | "previous"
export type ComparableAnalyticsWindow = Exclude<AnalyticsWindow, "lifetime">

export type CanonicalChannelRecord = {
 channelId: string
 handle?: string | null
 title: string
 description: string
 publishedAt?: string | null
 tags: string[]
 url?: string
 thumbnails: CanonicalThumbnailSet
 country?: string | null
 uploadsPlaylistId?: string | null
 unsubscribedTrailer?: string | null
 currentSubscribers: number | null
 publicVideoCount: number | null
 publicViewCount: number | null
 categoryId?: string | null
 categoryName?: string | null
 topicDetails: CanonicalTopicDetails
 defaultLanguage?: string | null
 localized?: Record<string, unknown>
 localizations?: Record<string, unknown>
 status?: Record<string, unknown>
 syncedAt: string
}

export type ChannelWindowSummary = {
 channelId: string
 window: AnalyticsWindow
 period?: ChannelPeriod
 startDate: string
 endDate: string
 coverage?: "complete" | "partial"
 syncedAt: string
 metrics: CanonicalNumericMetricMap
 metricMeta: CanonicalMetricMetaMap
}

export type InitialChannelBootstrapStatus =
 | "restoring"
 | "refreshing"
 | "ready"
 | "partial"
 | "error"

export type InitialChannelBootstrapSnapshot = {
 channelId: string
 status: InitialChannelBootstrapStatus
 channel: CanonicalChannelRecord | null
 videos: CanonicalVideoRecord[]
 periods: ChannelWindowSummary[]
 lastTwoCompleteDaysViews: number | null
 revision: number
 manifestId: string | null
 restoredAt: string | null
 error: {
  code: string
  recoverable: boolean
  message: string
 } | null
}

export type CanonicalVideoMetricsByWindow = Partial<
 Record<AnalyticsWindow, Record<string, number | null>>
>

export type CanonicalVideoMetricMetaByWindow = Partial<
 Record<AnalyticsWindow, Record<string, CanonicalMetricMeta>>
>

export type CanonicalVideoRecord = {
 channelId: string
 videoId: string
 identityKey: string
 title: string
 fullDescription?: string
 description: string
 publishedAt: string
 thumbnail: string
 thumbnails: CanonicalThumbnailSet
 tags: string[]
 categoryId?: string
 categoryName?: string
 defaultLanguage?: string
 defaultAudioLanguage?: string
 localized?: Record<string, unknown>
 localizations?: Record<string, unknown>
 privacyStatus?: string
 uploadStatus?: string
 liveBroadcastContent?: string
 liveStreamingDetails?: Record<string, unknown>
 recordingDetails?: Record<string, unknown>
 player?: Record<string, unknown>
 embeddable?: boolean | null
 license?: string | null
 madeForKids?: boolean | null
 selfDeclaredMadeForKids?: boolean | null
 publicStatsViewable?: boolean | null
 caption?: string | null
 definition?: string
 dimension?: string
 durationRaw?: string
 durationSeconds: number
 creatorContentType?: CanonicalCreatorContentType | null
 format: string
 isShort: boolean
 topicDetails: CanonicalTopicDetails
 metricsByWindow: CanonicalVideoMetricsByWindow
 metricMetaByWindow: CanonicalVideoMetricMetaByWindow
 mergeLedger: CanonicalMergeLedger
 syncedAt: string
}

export type CanonicalMergeLedgerEntry = {
 mergedAt: string
 source: CanonicalSyncSource
 stage: CanonicalSyncStage
 scope: "record" | "metrics" | "overlay"
 metricKeys?: string[]
 note?: string
}

export type CanonicalMergeLedger = {
 identityKey: string
 lockedVideoId: string
 lockedChannelId: string
 lastMergedAt: string
 entries: CanonicalMergeLedgerEntry[]
}

export type CanonicalMetricContract = {
 metricKey: string
 source: CanonicalSyncSource
 scope: MetricScope
 supportedWindows: AnalyticsWindow[]
 preferredWindows?: AnalyticsWindow[]
 mergeRule: MergeRule
 provenanceLabel: string
 ownerModeOnly?: boolean
 note?: string
}

export type CanonicalRawAuditEntry = {
 id: string
 channelId: string
 syncRunId: string
 stage: CanonicalSyncStage
 source: CanonicalSyncSource
 window?: AnalyticsWindow
 recordedAt: string
 payload: unknown
}

export type CanonicalSyncRun = {
 id: string
 channelId: string
 startedAt: string
 completedAt?: string
 status: "running" | "complete" | "failed"
 videoCount: number
 windows: AnalyticsWindow[]
 stageStatus: Record<string, "pending" | "complete" | "failed">
 error?: string
}

export type CanonicalRetentionFilterSet = {
 audienceType?: CanonicalRetentionAudienceType
 subscribedStatus?: CanonicalSubscribedStatus
 youtubeProduct?: CanonicalRetentionYouTubeProduct
}

export type CanonicalRetentionPoint = {
 elapsedVideoTimeRatio: number
 audienceWatchRatio: CanonicalMetricValue
 relativeRetentionPerformance: CanonicalMetricValue
 startedWatching: CanonicalMetricValue
 stoppedWatching: CanonicalMetricValue
 totalSegmentImpressions: CanonicalMetricValue
}

export type CanonicalRetentionDerived = {
 first30PercentDrop: CanonicalMetricValue
 midVideoHold: CanonicalMetricValue
 endRetention: CanonicalMetricValue
 stayedToWatchProxy: CanonicalMetricValue
}

export type CanonicalRetentionSeries = {
 channelId: string
 videoId: string
 window: AnalyticsWindow
 startDate: string
 endDate: string
 filters: CanonicalRetentionFilterSet
 points: CanonicalRetentionPoint[]
 derived: CanonicalRetentionDerived
 syncedAt: string
}

export type CanonicalPlaylistRecord = {
 channelId: string
 playlistId: string
 title: string
 description: string
 thumbnail: string
 itemCount: number | null
 publishedAt?: string
 syncedAt: string
}

export type CanonicalPlaylistWindowSummary = {
 channelId: string
 playlistId: string
 window: AnalyticsWindow
 startDate: string
 endDate: string
 syncedAt: string
 metrics: Record<string, CanonicalMetricValue>
}

export type CanonicalChannelDailyRow = {
 channelId: string
 date: string
 metrics: CanonicalNumericMetricMap
 metricMeta: CanonicalMetricMetaMap
 syncedAt: string
}

export type CanonicalTrafficRow = {
 channelId: string
 datasetKind: CanonicalTrafficDatasetKind
 source: Extract<
  CanonicalSyncSource,
  "analytics_api" | "reporting_api" | "csv" | "derived"
 >
 entityType: "channel" | "video"
 entityId: string
 window: AnalyticsWindow
 date?: string | null
 trafficSourceType: string
 trafficSourceDetail?: string | null
 sourceLabel?: string | null
 sourceTitle?: string | null
 sourceVideoId?: string | null
 resolvedEntityId?: string | null
 resolvedEntityType?: "channel" | "playlist" | "video" | "url" | "search_term" | null
 resolvedEntityTitle?: string | null
 resolvedEntityHandle?: string | null
 resolvedEntityUrl?: string | null
 resolvedEntitySubtitle?: string | null
 metrics: CanonicalNumericMetricMap
 metricMeta: CanonicalMetricMetaMap
 syncedAt: string
}

export type CanonicalTrafficDatasetKind =
 | "traffic_summary"
 | "traffic_detail"
 | "traffic_daily"
 | "traffic_video"
 | "traffic_reporting_bulk"
 | "traffic_playback_location"
 | "traffic_playback_location_daily"

export type CanonicalTrafficDiagnosticSeverity = "info" | "warning" | "error"

export type CanonicalTrafficDiagnosticEntry = {
 id: string
 channelId: string
 createdAt: string
 source: Extract<
  CanonicalSyncSource,
  "analytics_api" | "reporting_api" | "csv" | "derived"
 >
 syncRunId?: string
 window?: AnalyticsWindow
 datasetKind?: CanonicalTrafficDatasetKind
 code: string
 severity: CanonicalTrafficDiagnosticSeverity
 message: string
 packageName?: string
 fileName?: string
 memberRole?: string
 trafficSourceType?: string
 requestShape?: string
 reason?: string
}

export type CanonicalTrafficDictionary = {
 trafficSourceTypes: Record<string, string>
 trafficSourceDetails: Record<string, string>
 metricKeys: string[]
 provenanceLabels: string[]
}

export type CanonicalTrafficCoverageSummary = {
 totalRows: number
 summaryRows: number
 detailRows: number
 dailyRows: number
 videoRows: number
 reportingRows: number
 playbackLocationRows: number
 diagnosticCount: number
 skippedCsvMembers: number
 sources: Record<string, number>
 windows: Record<string, number>
}

export type CanonicalTrafficSyncResult = {
 rowCount: number
 diagnosticCount: number
 coverage: CanonicalTrafficCoverageSummary
 rows: CanonicalTrafficRow[]
 diagnostics: CanonicalTrafficDiagnosticEntry[]
}

export type CanonicalTrafficBackfillResult = CanonicalTrafficSyncResult & {
 reportingJobDiscovered: boolean
}

export type CanonicalTrafficMergeResult = {
 acceptedFiles: string[]
 skippedFiles: string[]
 rowCount: number
 diagnosticCount: number
 rows: CanonicalTrafficRow[]
 diagnostics: CanonicalTrafficDiagnosticEntry[]
}

export type CanonicalTrafficDataset = {
 rows: CanonicalTrafficRow[]
 summaryRows: CanonicalTrafficRow[]
 detailRows: CanonicalTrafficRow[]
 dailyRows: CanonicalTrafficRow[]
 videoRows: CanonicalTrafficRow[]
 reportingRows: CanonicalTrafficRow[]
 playbackLocationRows: CanonicalTrafficRow[]
 diagnostics: CanonicalTrafficDiagnosticEntry[]
 dictionary: CanonicalTrafficDictionary
 coverage: CanonicalTrafficCoverageSummary
}

export type CanonicalTrafficVisualDataset = {
 sourceMix: Array<{
  trafficSourceType: string
  label: string
  views: number
  watchHours: number
 }>
 dailySeries: Array<{
  date: string
  trafficSourceType: string
  label: string
  views: number
  watchHours: number
 }>
 comparison: Array<{
  trafficSourceType: string
  analyticsViews: number
  reportingViews: number
  csvViews: number
 }>
}

export type CanonicalAudienceSplitDimension = "subscribedStatus" | "ageGroup" | "gender" | "demographic"

export type CanonicalAudienceSplitRow = {
 channelId: string
 entityType: "channel" | "video"
 entityId: string
 window: AnalyticsWindow
 splitDimension: CanonicalAudienceSplitDimension
 splitKey: string
 metrics: CanonicalNumericMetricMap
 metricMeta: CanonicalMetricMetaMap
 syncedAt: string
}

export type CanonicalGeographyRow = {
 channelId: string
 entityType: "channel" | "video"
 entityId: string
 window: AnalyticsWindow
 country: string
 province?: string | null
 city?: string | null
 metrics: CanonicalNumericMetricMap
 metricMeta: CanonicalMetricMetaMap
 syncedAt: string
}

export type CanonicalAudienceSplitRecord = CanonicalAudienceSplitRow

export type ShadowMismatch = {
 key: string
 legacyValue: number | string | null
 canonicalValue: number | string | null
}

export type ShadowDiffRecord = {
 id: string
 channelId: string
 createdAt: string
 legacyVideoCount: number
 canonicalVideoCount: number
 missingInCanonical: string[]
 missingInLegacy: string[]
 mismatchedFields: ShadowMismatch[]
}

export type CanonicalSyncOverview = {
 enabled: boolean
 ownerModeEnabled: boolean
 channelCount: number
 videoCount: number
 playlistCount: number
 channelDailyRowCount: number
 trafficRowCount: number
 trafficDiagnosticCount: number
 retentionSeriesCount: number
 audienceSplitCount: number
 geographyRowCount: number
 metricCoverage: {
  videoMetricsCount: number
  revenueMetricsCount: number
  viewerCohortsCount: number
  ownerReachCount: number
 }
 lastRun: CanonicalSyncRun | null
 latestDiff: ShadowDiffRecord | null
 channels: CanonicalChannelRecord[]
}

export type VideoCatalogExportRow = {
 videoId: string
 title: string
 description: string
 publishedAt: string
 thumbnail: string
 mediumThumbnail: string
 maxresThumbnail: string
 tags: string
 categoryId: string
 categoryName: string
 defaultLanguage: string
 privacyStatus: string
 uploadStatus: string
 definition: string
 dimension: string
 durationSeconds: number
 creatorContentType: string
 format: string
 isShort: boolean
 lifetimeViews: number | null
 lifetimeLikes: number | null
 lifetimeComments: number | null
 lifetimeRevenue: number | null
 window365dViews: number | null
 window90dViews: number | null
 window28dViews: number | null
 window28dUniqueViewers: number | null
 window90dUniqueViewers: number | null
 window28dWatchHours: number | null
 window28dRevenue: number | null
 window28dEngagedViews: number | null
}

const metric = (
 metricKey: string,
 source: CanonicalSyncSource,
 scope: MetricScope,
 supportedWindows: AnalyticsWindow[],
 mergeRule: MergeRule,
 provenanceLabel: string,
 opts: {
  preferredWindows?: AnalyticsWindow[]
  ownerModeOnly?: boolean
  note?: string
 } = {},
): CanonicalMetricContract => ({
 metricKey,
 source,
 scope,
 supportedWindows,
 mergeRule,
 provenanceLabel,
 preferredWindows: opts.preferredWindows,
 ownerModeOnly: opts.ownerModeOnly,
 note: opts.note,
})

const STANDARD_WINDOWS: AnalyticsWindow[] = [
 "lifetime",
 "365d",
 "90d",
 "28d",
 "7d",
]
const COHORT_WINDOWS: AnalyticsWindow[] = ["7d", "28d", "90d"]

export const CANONICAL_METRIC_CONTRACTS: CanonicalMetricContract[] = [
 metric(
  "views",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "engagedViews",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "redViews",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "likes",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "comments",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "shares",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "subscribersGained",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "subscribersLost",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "estimatedMinutesWatched",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "averageViewDuration",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "api_first",
  "youtube_analytics_api",
 ),
 metric(
  "averageViewPercentage",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "api_first",
  "youtube_analytics_api",
 ),
 metric(
  "estimatedRevenue",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "transactionRevenue",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "estimatedAdRevenue",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "estimatedRedMinutesWatched",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "estimatedYouTubePremiumRevenue",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "playbackBasedCpm",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "api_first",
  "youtube_analytics_api",
 ),
 metric(
  "cpm",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "api_first",
  "youtube_analytics_api",
 ),
 metric(
  "rpm",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "api_first",
  "youtube_analytics_api",
 ),
 metric(
  "adImpressions",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "monetizedPlaybacks",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "videosAddedToPlaylists",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
  { note: "Canonical backing metric for UI label saves when available." },
 ),
 metric(
  "videosRemovedFromPlaylists",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "hypes",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "hypePoints",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "remixCount",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "remixViews",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "dislikes",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "cardImpressions",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "cardClicks",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "cardClickRate",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "api_first",
  "youtube_analytics_api",
 ),
 metric(
  "cardTeaserImpressions",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "cardTeaserClicks",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "cardTeaserClickRate",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "api_first",
  "youtube_analytics_api",
 ),
 metric(
  "endScreenElementImpressions",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "endScreenElementClicks",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_api",
 ),
 metric(
  "endScreenElementClickRate",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "api_first",
  "youtube_analytics_api",
 ),
 metric(
  "videoThumbnailImpressions",
  "owner_api",
  "owner_only",
  ["lifetime", "365d", "90d", "28d"],
  "owner_first",
  "youtube_analytics_content_owner",
  {
   ownerModeOnly: true,
   note:
    "Owner-mode reach metric. Falls back to CSV or unsupported state under channel-only auth.",
  },
 ),
 metric(
  "videoThumbnailImpressionsClickRate",
  "owner_api",
  "owner_only",
  ["lifetime", "365d", "90d", "28d"],
  "owner_first",
  "youtube_analytics_content_owner",
  {
   ownerModeOnly: true,
   note:
    "Owner-mode reach metric. Falls back to CSV or unsupported state under channel-only auth.",
  },
 ),
 metric(
  "uniqueViewers",
  "analytics_api",
  "video",
  COHORT_WINDOWS,
  "api_first",
  "youtube_analytics_api_thresholded",
  {
   preferredWindows: ["28d", "90d"],
   note:
    "Thresholded per-video metric. Availability depends on privacy filters and traffic volume.",
  },
 ),
 metric(
  "averageViewsPerViewer",
  "analytics_api",
  "video",
  COHORT_WINDOWS,
  "api_first",
  "youtube_analytics_api_thresholded",
  {
   preferredWindows: ["28d", "90d"],
   note:
    "Viewer-family metric. Treat as a shorter-window metric and avoid lifetime assumptions.",
  },
 ),
 metric(
  "uniqueReach",
  "analytics_api",
  "video",
  COHORT_WINDOWS,
  "api_first",
  "youtube_analytics_api_thresholded",
  {
   preferredWindows: ["28d", "90d"],
   note:
    "Viewer-family metric. Treat as a shorter-window metric and avoid lifetime assumptions.",
  },
 ),
 metric(
  "newViewers",
  "analytics_api",
  "video",
  COHORT_WINDOWS,
  "api_first",
  "youtube_analytics_api_thresholded",
  {
   preferredWindows: ["28d", "90d"],
   note:
    "Thresholded per-video metric. Availability depends on privacy filters and traffic volume.",
  },
 ),
 metric(
  "returningViewers",
  "analytics_api",
  "video",
  COHORT_WINDOWS,
  "api_first",
  "youtube_analytics_api_thresholded",
  {
   preferredWindows: ["28d", "90d"],
   note:
    "Thresholded per-video metric. Availability depends on privacy filters and traffic volume.",
  },
 ),
 metric(
  "casualViewers",
  "analytics_api",
  "video",
  COHORT_WINDOWS,
  "api_first",
  "youtube_analytics_api_thresholded",
  {
   preferredWindows: ["28d", "90d"],
   note:
    "Thresholded per-video metric. Availability depends on privacy filters and traffic volume.",
  },
 ),
 metric(
  "regularViewers",
  "analytics_api",
  "video",
  COHORT_WINDOWS,
  "api_first",
  "youtube_analytics_api_thresholded",
  {
   preferredWindows: ["28d", "90d"],
   note:
    "Thresholded per-video metric. Availability depends on privacy filters and traffic volume.",
  },
 ),
 metric(
  "creatorContentType",
  "analytics_api",
  "video",
  STANDARD_WINDOWS,
  "identity_locked",
  "youtube_analytics_creator_content_type",
 ),
 metric(
  "subscribedStatus",
  "analytics_api",
  "audience_split",
  STANDARD_WINDOWS,
  "identity_locked",
  "youtube_analytics_subscribed_status",
 ),
 metric(
  "audienceWatchRatio",
  "analytics_api",
  "retention",
  STANDARD_WINDOWS,
  "api_first",
  "youtube_analytics_retention",
 ),
 metric(
  "relativeRetentionPerformance",
  "analytics_api",
  "retention",
  STANDARD_WINDOWS,
  "api_first",
  "youtube_analytics_retention",
 ),
 metric(
  "startedWatching",
  "analytics_api",
  "retention",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_retention",
 ),
 metric(
  "stoppedWatching",
  "analytics_api",
  "retention",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_retention",
 ),
 metric(
  "totalSegmentImpressions",
  "analytics_api",
  "retention",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_retention",
 ),
 metric(
  "playlistViews",
  "analytics_api",
  "playlist",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_playlist",
 ),
 metric(
  "playlistEstimatedMinutesWatched",
  "analytics_api",
  "playlist",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_playlist",
 ),
 metric(
  "playlistAverageViewDuration",
  "analytics_api",
  "playlist",
  STANDARD_WINDOWS,
  "api_first",
  "youtube_analytics_playlist",
 ),
 metric(
  "playlistSaves",
  "analytics_api",
  "playlist",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_playlist",
 ),
 metric(
  "playlistStarts",
  "analytics_api",
  "playlist",
  STANDARD_WINDOWS,
  "max_total",
  "youtube_analytics_playlist",
 ),
 metric(
  "viewsPerPlaylistStart",
  "analytics_api",
  "playlist",
  STANDARD_WINDOWS,
  "api_first",
  "youtube_analytics_playlist",
 ),
 metric(
  "averageTimeInPlaylist",
  "analytics_api",
  "playlist",
  STANDARD_WINDOWS,
  "api_first",
  "youtube_analytics_playlist",
 ),
]
