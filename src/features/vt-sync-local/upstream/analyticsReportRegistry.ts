import type { VtSyncSourceApi } from "../adapters/contracts"

export const VT_SYNC_ANALYTICS_REPORT_REGISTRY_VERSION = 1 as const
export const VT_SYNC_FROZEN_VISIBLE_DATASET_COUNT = 34 as const
export const VT_SYNC_VIDEO_ANALYTICS_CONTRACT_BATCH_SIZE = 200 as const
export const VT_SYNC_DETAIL_REPORT_CONTRACT_PAGE_SIZE = 25 as const

export type VtSyncReportScope = "channel" | "selected_video" | "content_owner"
export type VtSyncReportExecution = "direct" | "composite" | "derived"
export type VtSyncReportWindowStrategy =
 | "metadata_freshness"
 | "query_each_window"
 | "derive_from_daily"
 | "native_month"
 | "retention_curve"

export type VtSyncReportPagination =
 | { kind: "single" }
 | { kind: "data_api"; pageSize: 50 }
 | { kind: "analytics"; pageSize: number }
 | { kind: "detail"; pageSize: 25; requiresSort: true }
 | { kind: "video_batch"; batchSize: 200 }

/**
 * Frozen Phase-0 contract for the currently visible VT-SYNC tables.
 *
 * This registry is intentionally descriptive in version 1: the existing sync
 * engine remains the executor until later migration phases move query builders
 * behind this boundary. Keeping the first version side-effect free lets CI
 * detect ownership drift without changing stable data or controller behavior.
 */
export type VtSyncAnalyticsReportDefinition = {
 version: typeof VT_SYNC_ANALYTICS_REPORT_REGISTRY_VERSION
 tableId: string
 datasetId: string
 reportId: string
 matrixDatasetId?: string
 categoryIds: readonly string[]
 syncUnitId?: string
 sourceApis: readonly VtSyncSourceApi[]
 scope: VtSyncReportScope
 execution: VtSyncReportExecution
 dimensions: readonly string[]
 windowStrategy: VtSyncReportWindowStrategy
 pagination: VtSyncReportPagination
 availability: "stable"
}

type ReportInput = Omit<VtSyncAnalyticsReportDefinition, "version" | "availability">

const report = (definition: ReportInput): VtSyncAnalyticsReportDefinition => Object.freeze({
 ...definition,
 version: VT_SYNC_ANALYTICS_REPORT_REGISTRY_VERSION,
 availability: "stable" as const,
 categoryIds: Object.freeze([...definition.categoryIds]),
 sourceApis: Object.freeze([...definition.sourceApis]),
 dimensions: Object.freeze([...definition.dimensions]),
 pagination: Object.freeze({ ...definition.pagination }),
})

const analytics = ["youtube_analytics_v2"] as const
const single = { kind: "single" } as const
const standardPage = { kind: "analytics", pageSize: 200 } as const

export const VT_SYNC_ANALYTICS_REPORT_DEFINITIONS: readonly VtSyncAnalyticsReportDefinition[] = Object.freeze([
 report({ tableId: "videos", datasetId: "videos", reportId: "video_catalog_and_analytics", matrixDatasetId: "video_catalog", categoryIds: ["uploads_playlist", "video_metadata", "videos_analytics"], syncUnitId: "video_catalog", sourceApis: ["youtube_data_v3", "youtube_analytics_v2"], scope: "channel", execution: "composite", dimensions: ["playlistItems.list", "videos.list", "video"], windowStrategy: "metadata_freshness", pagination: { kind: "video_batch", batchSize: VT_SYNC_VIDEO_ANALYTICS_CONTRACT_BATCH_SIZE } }),
 report({ tableId: "daily", datasetId: "daily", reportId: "daily_metrics", matrixDatasetId: "daily_metrics", categoryIds: ["daily_metrics"], syncUnitId: "daily_stats", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["day"], windowStrategy: "derive_from_daily", pagination: standardPage }),
 report({ tableId: "weekly", datasetId: "weekly", reportId: "weekly_metrics", matrixDatasetId: "daily_metrics", categoryIds: ["daily_metrics"], sourceApis: ["derived"], scope: "channel", execution: "derived", dimensions: ["day"], windowStrategy: "derive_from_daily", pagination: single }),
 report({ tableId: "monthly", datasetId: "monthly_api", reportId: "monthly_metrics", matrixDatasetId: "monthly_metrics", categoryIds: ["monthly_metrics"], syncUnitId: "monthly_stats", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["month"], windowStrategy: "native_month", pagination: standardPage }),
 report({ tableId: "channel_totals", datasetId: "channel_totals", reportId: "channel_overview_windows", matrixDatasetId: "channel_totals", categoryIds: ["channel_totals"], syncUnitId: "channel_overview_windows", sourceApis: analytics, scope: "channel", execution: "composite", dimensions: [], windowStrategy: "query_each_window", pagination: single }),
 report({ tableId: "traffic", datasetId: "traffic", reportId: "traffic_overview", matrixDatasetId: "traffic_overview", categoryIds: ["traffic_overview"], syncUnitId: "traffic_overview", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["insightTrafficSourceType"], windowStrategy: "query_each_window", pagination: standardPage }),
 ...([
  ["traffic_detail_advertising", "advertising"],
  ["traffic_detail_ext_websites", "ext_websites"],
  ["traffic_detail_hashtags", "hashtags"],
  ["traffic_detail_traffic_subscribers", "traffic_subscribers"],
  ["traffic_detail_other_features", "other_features"],
  ["traffic_detail_search_terms", "search_terms"],
  ["traffic_detail_suggested_videos", "suggested_videos"],
  ["traffic_detail_sound_pages", "sound_pages"],
  ["traffic_detail_channel_pages", "channel_pages"],
 ] as const).map(([tableId, categoryId]) => report({
  tableId,
  datasetId: tableId,
  reportId: tableId,
  matrixDatasetId: "traffic_detail_stable",
  categoryIds: [categoryId],
  syncUnitId: tableId,
  sourceApis: analytics,
  scope: "channel",
  execution: "direct",
  dimensions: ["insightTrafficSourceDetail"],
  windowStrategy: "query_each_window",
  pagination: { kind: "detail", pageSize: VT_SYNC_DETAIL_REPORT_CONTRACT_PAGE_SIZE, requiresSort: true },
 })),
 report({ tableId: "traffic_day", datasetId: "traffic_day", reportId: "traffic_by_day", matrixDatasetId: "traffic_overview", categoryIds: ["traffic_day"], syncUnitId: "traffic_by_day", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["insightTrafficSourceType", "day"], windowStrategy: "derive_from_daily", pagination: standardPage }),
 report({ tableId: "locations", datasetId: "locations", reportId: "playback_locations", matrixDatasetId: "playback_location_type", categoryIds: ["playback_location"], syncUnitId: "playback_locations", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["insightPlaybackLocationType"], windowStrategy: "query_each_window", pagination: standardPage }),
 report({ tableId: "demographics", datasetId: "demographics", reportId: "audience_demographics", categoryIds: ["audience_demographics"], syncUnitId: "audience_demographics", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["ageGroup", "gender"], windowStrategy: "query_each_window", pagination: standardPage }),
 report({ tableId: "subs", datasetId: "subs", reportId: "subscription_status", matrixDatasetId: "playback_subscribed_status", categoryIds: ["subscription_status"], syncUnitId: "subscription_status", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["subscribedStatus"], windowStrategy: "query_each_window", pagination: standardPage }),
 report({ tableId: "geography", datasetId: "geography", reportId: "geography_country", categoryIds: ["geography_country"], syncUnitId: "geography_country", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["country"], windowStrategy: "query_each_window", pagination: standardPage }),
 report({ tableId: "cities", datasetId: "cities", reportId: "geography_city", categoryIds: ["geography_city"], syncUnitId: "geography_city", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["country", "city"], windowStrategy: "query_each_window", pagination: standardPage }),
 report({ tableId: "provinces", datasetId: "provinces", reportId: "geography_province", categoryIds: ["geography_province"], syncUnitId: "geography_province", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["province"], windowStrategy: "query_each_window", pagination: standardPage }),
 report({ tableId: "dma", datasetId: "dma", reportId: "geography_dma", categoryIds: ["geography_dma"], syncUnitId: "geography_dma", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["dma"], windowStrategy: "query_each_window", pagination: standardPage }),
 report({ tableId: "continents", datasetId: "continents", reportId: "geography_continents", categoryIds: ["geography_country"], sourceApis: ["derived"], scope: "channel", execution: "derived", dimensions: ["country"], windowStrategy: "query_each_window", pagination: single }),
 report({ tableId: "devices", datasetId: "devices", reportId: "device_type", categoryIds: ["device_type"], syncUnitId: "device_type", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["deviceType"], windowStrategy: "query_each_window", pagination: standardPage }),
 report({ tableId: "os", datasetId: "os", reportId: "operating_system", categoryIds: ["operating_system"], syncUnitId: "operating_system", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["operatingSystem"], windowStrategy: "query_each_window", pagination: standardPage }),
 report({ tableId: "device_os", datasetId: "device_os", reportId: "device_os", categoryIds: ["device_os"], syncUnitId: "device_os", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["deviceType", "operatingSystem"], windowStrategy: "query_each_window", pagination: standardPage }),
 report({ tableId: "creator", datasetId: "creator", reportId: "content_type", matrixDatasetId: "playback_content_type", categoryIds: ["creator_content_type"], syncUnitId: "content_type", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["month", "creatorContentType"], windowStrategy: "query_each_window", pagination: standardPage }),
 report({ tableId: "formats_subscribers", datasetId: "formats_subscribers", reportId: "formats_subscriber_status", matrixDatasetId: "playback_content_subscribed", categoryIds: ["formats_subscriber_status"], syncUnitId: "formats_subscriber_status", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["creatorContentType", "subscribedStatus"], windowStrategy: "query_each_window", pagination: standardPage }),
 report({ tableId: "retentions", datasetId: "retentions", reportId: "retention", matrixDatasetId: "video_deep_retention", categoryIds: ["retention"], syncUnitId: "retention", sourceApis: analytics, scope: "selected_video", execution: "direct", dimensions: ["elapsedVideoTimeRatio"], windowStrategy: "retention_curve", pagination: standardPage }),
 report({ tableId: "shares", datasetId: "shares", reportId: "sharing_services", categoryIds: ["sharing_service"], syncUnitId: "sharing_services", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["sharingService"], windowStrategy: "query_each_window", pagination: { kind: "detail", pageSize: VT_SYNC_DETAIL_REPORT_CONTRACT_PAGE_SIZE, requiresSort: true } }),
 report({ tableId: "playlists", datasetId: "playlists", reportId: "playlists", categoryIds: ["playlists_analytics"], syncUnitId: "playlists", sourceApis: ["youtube_data_v3", "youtube_analytics_v2"], scope: "channel", execution: "composite", dimensions: ["playlist"], windowStrategy: "query_each_window", pagination: standardPage }),
 report({ tableId: "revenue", datasetId: "revenue", reportId: "revenue_source", categoryIds: ["revenue_source"], syncUnitId: "revenue_source", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["day"], windowStrategy: "derive_from_daily", pagination: standardPage }),
 report({ tableId: "ads", datasetId: "ads", reportId: "ad_type", categoryIds: ["ad_type"], syncUnitId: "ad_type", sourceApis: analytics, scope: "channel", execution: "direct", dimensions: ["adType"], windowStrategy: "query_each_window", pagination: { kind: "analytics", pageSize: 50 } }),
])

export const getVtSyncAnalyticsReportDefinition = (tableId: string): VtSyncAnalyticsReportDefinition | undefined =>
 VT_SYNC_ANALYTICS_REPORT_DEFINITIONS.find((definition) => definition.tableId === tableId)

export type VtSyncCapabilityProbeOutcome = "supported" | "unsupported" | "scope_required" | "inconclusive"

export type VtSyncCapabilityProbeRecord = {
 registryVersion: typeof VT_SYNC_ANALYTICS_REPORT_REGISTRY_VERSION
 reportId: string
 outcome: VtSyncCapabilityProbeOutcome
 observedAt: string
 requestId?: string
 upstreamStatus?: number
 channelFingerprint?: string
}

/** Store only contract results. Tokens, cookies, URLs, filters, and raw Google
 * responses are deliberately absent from the accepted input and output type. */
export const createVtSyncCapabilityProbeRecord = (
 input: Omit<VtSyncCapabilityProbeRecord, "registryVersion">,
): VtSyncCapabilityProbeRecord => Object.freeze({
 registryVersion: VT_SYNC_ANALYTICS_REPORT_REGISTRY_VERSION,
 reportId: input.reportId,
 outcome: input.outcome,
 observedAt: input.observedAt,
 ...(input.requestId ? { requestId: input.requestId } : {}),
 ...(Number.isFinite(input.upstreamStatus) ? { upstreamStatus: input.upstreamStatus } : {}),
 ...(input.channelFingerprint ? { channelFingerprint: input.channelFingerprint } : {}),
})
