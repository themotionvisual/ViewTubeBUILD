export type VtSyncAnalyticsWindow = "7d" | "28d" | "90d" | "365d" | "lifetime"

export const VT_SYNC_LOCAL_ANALYTICS_FLAG = "VITE_USE_VT_SYNC_LOCAL_ANALYTICS" as const
export const VT_SYNC_DISABLE_PERFORMANCE_HUB_API_SYNC_FLAG = "VITE_DISABLE_PERFORMANCE_HUB_API_SYNC" as const
export const VT_SYNC_DISABLE_PERFORMANCE_HUB_API_SYNC_KEY = "vt_disable_performance_hub_api_sync" as const
export const VT_SYNC_LOCAL_SNAPSHOT_KEY = "vt_sync_local_snapshot" as const
export const VT_SYNC_LOCAL_DB_NAME = "ViewTubeVtSyncLocalDB" as const
export const VT_SYNC_LOCAL_DB_VERSION = 1 as const
export const VT_SYNC_LOCAL_STORE_NAMES = {
 channelIndex: "channel_index",
 videoInventory: "video_inventory",
 syncRuns: "sync_runs",
 syncCursors: "sync_cursors",
 datasetRawReports: "dataset_raw_reports",
 datasetTableRows: "dataset_table_rows",
} as const
export const ANALYTICS_LOCAL_SNAPSHOT_KEY = VT_SYNC_LOCAL_SNAPSHOT_KEY
export const ANALYTICS_LOCAL_DB_NAME = VT_SYNC_LOCAL_DB_NAME
export const ANALYTICS_LOCAL_DB_VERSION = VT_SYNC_LOCAL_DB_VERSION
export const ANALYTICS_LOCAL_STORE_NAMES = VT_SYNC_LOCAL_STORE_NAMES
export const VT_SYNC_UPSTREAM_REPO_PATH = "/Users/cwb/Downloads/viewtube/VT-SYNC" as const

export type VtSyncCategoryGroup =
 | "channel"
 | "time"
 | "videos"
 | "traffic"
 | "audience"
 | "geography"
 | "device"
 | "revenue"
 | "playlists"
 | "retention"
 | "workspace"

export type VtSyncSourceApi =
 | "youtube_data_v3"
 | "youtube_analytics_v2"
 | "google_workspace"
 | "derived"
 | "local_import"

export type VtSyncQuotaClass = "free_cached" | "low" | "medium" | "high" | "workspace"

export type VtSyncCategoryDefinition = {
 id: string
 label: string
 description: string
 isCore: boolean
 syncStatus?: "stable" | "disabled_unvalidated"
 disabledReason?: string
 group: VtSyncCategoryGroup
 phase: string
 runtimePhaseId: string
 sourceApi: VtSyncSourceApi
 quotaClass: VtSyncQuotaClass
 defaultEnabled: boolean
 dependsOn?: string[]
 canonicalTargets: string[]
}

export type VtSyncTableColumnDefinition = {
 key: string
 label: string
 group: string
 pinned?: "left" | "right"
 defaultVisible?: boolean
 isFormula?: boolean
 visibility?: "always" | "whenMeaningful"
 format?: "text" | "number" | "percent" | "currency" | "duration" | "durationHours" | "durationMinutes" | "date" | "dateRange" | "dateLocal" | "weekdayLocal" | "timeLocal" | "thumbnail" | "flag" | "json"
 semanticRole?: "identity" | "metric"
 visualization?: "none" | "metric"
 totalMode?: "sum" | "average" | "none"
 preferredWidth?: number
 textSize?: number
 availabilityNote?: string
}

export type VtSyncTableDefinition = {
 id: string
 label: string
 mainCategoryId?: string
 subLabel?: string
 description: string
 performanceHubDatasetId: string
 categoryIds: string[]
 /** Controller ownership. Tables in one top-level category share a sync unit. */
 syncUnitId?: string
 snapshotKeys?: string[]
 columns: VtSyncTableColumnDefinition[]
 defaultSort: { key: string; direction: "asc" | "desc" }
 pinnedGroups: string[]
 collapsedGroups: string[]
 exportName: string
 layoutMode?: "auto" | "sparse-full"
 compactMode?: "supported" | "normal-only"
 presentationMode?: "standard" | "traffic-source-day" | "format-subscriber-status" | "retention-video"
 verticalScrollMode?: "custom" | "none"
 horizontalScrollMode?: "custom" | "none"
 summaryMode?: "selected-video" | "registry" | "primary-row"
 summaryColumns?: string[]
 summaryPrimaryRow?: { key: string; value: string }
}

export type VtSyncVideoMetric = Record<string, number | null | undefined> & {
 views?: number
 watchTime?: number
 revenue?: number
 subscribers?: number
 subscribersGained?: number
 subscribersLost?: number
 ctr?: number
 impressions?: number
 avgViewDuration?: number
 averagePercentageViewed?: number
 likes?: number
 dislikes?: number
 comments?: number
 shares?: number
 cpm?: number
 rpm?: number
 adImpressions?: number
 engagedViews?: number
}

export type VtSyncVideoItem = {
 id: string
 title: string
 thumbnail?: string
 publishedAt?: string
 format?: "short" | "long" | "live" | string
 category?: string
 tags?: string[]
 topics?: string[]
 privacyStatus?: string
 duration?: string
 definition?: string
 caption?: string
 descriptionSnippet?: string
 metrics?: VtSyncVideoMetric
 /** Per-field source of the currently displayed metric value. */
 metricProvenance?: Record<string, "youtube_data_v3" | "youtube_analytics_v2">
}

export type VtSyncDailyMetricRow = Record<string, unknown> & {
 date: string
 views?: number
 watchTime?: number
 revenue?: number
 subscribersGained?: number
 subscribersLost?: number
 impressions?: number
 adImpressions?: number
 engagedViews?: number
}

/** A traffic-source-by-day fact. This is intentionally not assignable to the
 * channel-wide Daily Stats row contract. */
export type VtSyncTrafficByDayRow = Record<string, unknown> & {
 day: string
 term: string
 views?: number
 watchTime?: number
 avgDuration?: number
 avgPercentageViewed?: number
 engagedViews?: number
}

export type VtSyncTrafficRow = Record<string, unknown> & {
 source?: string
 term?: string
 views?: number
 watchTime?: number
 avgDuration?: number
 avgPercentageViewed?: number
 engagedViews?: number
 title?: string
 handle?: string
 thumbnail?: string
 videoId?: string
 videoUrl?: string
 channelUrl?: string
}

/** A source-scoped YouTube Analytics traffic detail row. */
export type VtSyncTrafficDetailRow = VtSyncTrafficRow & {
 sourceType: string
 detail: string
 /** The raw Analytics value is retained even when a title/handle is resolved. */
 insightTrafficSourceDetail?: string
 coverageStatus?: "complete" | "partial" | "unavailable" | "unsupported"
}

export type VtSyncSyncUnitDefinition = {
 id: string
 label: string
 description: string
 group: VtSyncCategoryGroup
 /** Exact visible table this controller unit owns. */
 tableId: string
 /** The top-level data-table category this user-facing switch owns. */
 tableCategoryId: string
 categoryIds: string[]
 defaultEnabled: boolean
 refreshPolicy: "each_run" | "daily_incremental" | "on_demand"
}

export type VtSyncChannelTotals = Partial<Record<
 VtSyncAnalyticsWindow | "prev7" | "prev28" | "prev90" | "prev365",
 Record<string, number | null>
>> & Record<string, unknown>

export type VtSyncChannelIdentity = {
 channelId?: string | null
 channelName?: string | null
 channelDescription?: string | null
 channelCustomUrl?: string | null
 avatarUrl?: string | null
 subscriberCount?: number | null
 channelVideoCount?: number | null
 channelViewCount?: number | null
 /** The channel's YouTube sign-up date (RFC 3339). Used as the lifetime start date for analytics queries. */
 channelPublishedAt?: string | null
}

export type VtSyncSyncManifest = {
 run_id?: string
 started_at?: string
 completed_at?: string | null
 stop_reason?: string | null
 bundles_completed?: Array<Record<string, unknown>>
 bundles_failed?: Array<Record<string, unknown>>
 diagnostics?: Array<Record<string, unknown>>
}

export type VtSyncLocalDbStoreName =
 (typeof VT_SYNC_LOCAL_STORE_NAMES)[keyof typeof VT_SYNC_LOCAL_STORE_NAMES]

export type VtSyncChannelIndexRecord = {
 id: string
 channelId: string
 uploadsPlaylistId: string
 title?: string | null
 handle?: string | null
 publicVideoCount?: number | null
 firstSyncedAt: string
 lastInventorySyncedAt: string
 knownVideoCount: number
 needsFullInventoryReconcile?: boolean
 lastInventoryRunId?: string
}

export type VtSyncVideoInventoryRecord = {
 id: string
 channelId: string
 videoId: string
 uploadsPlaylistId: string
 firstSeenAt: string
 lastSeenAt: string
 firstInventoryRunId: string
 lastInventoryRunId: string
 pageNumber?: number
 pageIndex?: number
 publishedAt?: string
 title?: string
 thumbnail?: string
 status?: "active" | "metadata_pending" | "deleted_or_unavailable" | "private" | "unlisted"
}

export type VtSyncSyncRunRecord = {
 id: string
 channelId: string
 startedAt: string
 completedAt?: string
 phase: string
 status: "running" | "complete" | "partial" | "failed"
 rowsRead: number
 rowsWritten: number
 newVideoCount?: number
 knownVideoCount?: number
 stopReason?: string
 diagnostics?: Array<Record<string, unknown>>
}

export type VtSyncInventoryCursorRecord = {
 id: string
 channelId: string
 uploadsPlaylistId: string
 lastRunId: string
 lastSyncedAt: string
 newestKnownVideoId?: string
 overlapPages: number
 consecutiveKnownPages: number
 knownIdsAfterNewestNew: number
 needsFullInventoryReconcile?: boolean
}

export type VtSyncDatasetRawReportRecord = {
 id: string
 runId: string
 /** The connected channel that owns this diagnostic report. */
 channelId?: string
 datasetId: string
 phase: string
 capturedAt: string
 columns: string[]
 rows: Array<Record<string, unknown>>
 source: "youtube_data_v3" | "youtube_analytics_v2" | "local_import" | "derived"
}

export type VtSyncDatasetTableRowsRecord = {
 id: string
 runId: string
 /** The connected channel that owns these rows. Required for safe recovery. */
 channelId?: string
 datasetId: string
 phase: string
 capturedAt: string
 rows: Array<Record<string, unknown>>
 provenance: "api" | "csv" | "computed" | "previous_snapshot" | "placeholder"
 filenames?: string[]
}

export type VtSyncInventorySyncResult = {
 channelId: string
 uploadsPlaylistId: string
 runId: string
 videoIds: string[]
 newVideoIds: string[]
 knownVideoIds: string[]
 pagesRead: number
 stopReason: "initial_full_inventory" | "known_inventory_overlap" | "playlist_exhausted" | "indexeddb_unavailable"
 needsFullInventoryReconcile?: boolean
}

export type VtSyncDatasetFreshness = Record<string, {
 runId?: string
 phase?: string
 source?: "current_run" | "previous_snapshot" | "manual_import" | "placeholder" | "unknown"
 status?: "synced" | "partial" | "placeholder" | "stale" | "failed"
 rows?: number
 updatedAt?: string
 missingMetrics?: string[]
}>

export type VtSyncSnapshotStorageMetadata = {
 storageMode: "full" | "compact_preview" | "memory_only" | "unknown"
 isCompacted: boolean
 manifestOnly?: boolean
 fullRowCountByField?: Record<string, number>
 visiblePreviewRowCountByField?: Record<string, number>
 warning?: string
}

export type VtSyncSnapshot = VtSyncChannelIdentity & {
 source: "vt-sync" | "viewtubex-cache" | "manual" | "empty"
 snapshotId: string
 capturedAt: string
 selectedTimeWindow?: VtSyncAnalyticsWindow
 channelTotals?: VtSyncChannelTotals | null
 videos: VtSyncVideoItem[]
 dailyMetrics: VtSyncDailyMetricRow[]
 monthlyMetrics: VtSyncDailyMetricRow[]
 trafficSources: VtSyncTrafficRow[]
 trafficDetails: VtSyncTrafficDetailRow[]
 searchTerms: VtSyncTrafficRow[]
 demographics: Array<Record<string, unknown>>
 geography: Array<Record<string, unknown>>
 devices: Array<Record<string, unknown>>
 operatingSystems: Array<Record<string, unknown>>
 deviceOs: Array<Record<string, unknown>>
 trafficByDay: VtSyncTrafficByDayRow[]
 playbackLocations: Array<Record<string, unknown>>
 subscriptionStatuses: Array<Record<string, unknown>>
 formatSubscriberStatuses: Array<Record<string, unknown>>
 playlistsData: Array<Record<string, unknown>>
 adTypes: Array<Record<string, unknown>>
 cities: Array<Record<string, unknown>>
 provinces: Array<Record<string, unknown>>
 dmaRegions: Array<Record<string, unknown>>
 continentsData: Array<Record<string, unknown>>
 extWebsites: VtSyncTrafficRow[]
 suggestedVideos: VtSyncTrafficRow[]
 hashtags: VtSyncTrafficRow[]
 soundPages: VtSyncTrafficRow[]
 creatorContentTypes: Array<Record<string, unknown>>
 demographicsByAge: Array<Record<string, unknown>>
 demographicsByGender: Array<Record<string, unknown>>
 trafficAdvertising: VtSyncTrafficRow[]
 audienceWatchBehavior: Array<Record<string, unknown>>
 sharingService: Array<Record<string, unknown>>
 newReturningViewers: Array<Record<string, unknown>>
 revenueSource: Array<Record<string, unknown>>
 subscriptionSource: Array<Record<string, unknown>>
 trafficChannelPages: VtSyncTrafficRow[]
 trafficOtherFeatures: VtSyncTrafficRow[]
 trafficSubscriberData: VtSyncTrafficRow[]
 trafficShorts: VtSyncTrafficRow[]
 trafficShortsContentLink: VtSyncTrafficRow[]
 trafficBrowseFeatures: VtSyncTrafficRow[]
 trafficCampaignCard: VtSyncTrafficRow[]
 trafficCard: VtSyncTrafficRow[]
 trafficEndScreen: VtSyncTrafficRow[]
 trafficLiveRedirect: VtSyncTrafficRow[]
 trafficNotification: VtSyncTrafficRow[]
 trafficNoLinkEmbedded: VtSyncTrafficRow[]
 trafficNoLinkOther: VtSyncTrafficRow[]
 trafficPlaylist: VtSyncTrafficRow[]
 trafficYtPlaylistPage: VtSyncTrafficRow[]
 retentions: Array<Record<string, unknown>>
 syncManifest?: VtSyncSyncManifest | null
 tableExports?: Record<string, unknown[]>
 datasetFreshness?: VtSyncDatasetFreshness
 storageMetadata?: VtSyncSnapshotStorageMetadata
}


export type VtSyncBrainContext = {
 title: string
 summary: string
 promptPrefix: string
 facts: Record<string, unknown>
 recommendedResponseFormat: string[]
 warnings: string[]
}
