import {
 fetchChannelProfile,
 fetchVideoList,
 fetchVideoStats,
 fetchAnalytics,
 fetchChannelAnalytics,
 fetchShortsPlaylistIds,
 fetchVideoContentType,
 fetchDemographicAnalytics,
 fetchDailyAnalytics,
 fetchGeographyAnalytics,
 fetchGlobalLifetimeAnalytics,
 fetchDeviceOsAnalytics,
 fetchTrafficByDayAnalytics,
 fetchAdTypeAnalytics,
 fetchSharingServiceAnalytics,
 fetchSubscriptionStatusAnalytics,
 fetchSubscriptionSourceAnalytics,
 fetchSubscriberDetailAnalytics,
 fetchCreatorContentTypeAnalytics,
 fetchPlaylistAnalytics,
 fetchRetentionAnalyticsReport,
 resetYouTubeApiCallCounts,
 getYouTubeApiCallCounts,
 isChannelConnected,
 disconnectChannel,
} from "./youtubeService"
import type { SegmentAnalyticsReport } from "./youtube/youtubeAnalyticsFetcher"
import {
  syncCoreLifetimeData,
  CHANNEL_LIFETIME_METRICS,
  type CoreSyncResult,
} from "./youtube/coreLifetimeSync"
import { syncTrafficAnalytics } from "./youtube/trafficAnalyticsSync"
import { SyncMachine } from "./SyncMachine";
import { googleSearchConsoleService } from "./googleSearchConsoleService"
import { ga4Service, type GA4Property } from "./ga4Service"
import { upsertLedgerEntry, type LedgerEntry } from "./analytics/DataStore"
import { parseDurationSeconds } from "./dataUtils"
import { ytApiQueue } from "../utils/RequestQueue"
import {
 ANALYTICS_WINDOWS,
 type AnalyticsWindow,
 canonicalMetricOrder,
 getMetricByAliases,
 readYouTubeAnalyticsCache,
 writeYouTubeAnalyticsCache,
} from "./analytics/DataStore"
import {
 buildSearchConsoleSearchRows,
 buildTrafficSearchRows,
} from "./searchIntelligence"
import {
 MASTER_METRIC_AUDIT_RESULTS,
 MASTER_TABLE_METRIC_AUDIT_CACHE_KEY,
 MASTER_TABLE_STAGE_RESULTS_CACHE_KEY,
} from "./masterTable/contracts"
import type { ChannelAnalysisSyncStatus, VideoSyncBatchState } from "../types"

const YT_ANALYTICS_CACHE_KEY = "yt_analytics_cache"
const GA4_STORAGE_KEY = "ga4_properties_cache"
const GA4_DATA_KEY = "ga4_analytics_cache"
const ANALYTICS_SCHEMA_VERSION_KEY = "vt_analytics_schema_version"
const ANALYTICS_SCHEMA_VERSION = 5
const VIDEO_SYNC_BATCH_STATE_KEY = "vt_video_sync_batch_state"
const SYNC_MERGE_POLICY_KEY = "vt_sync_merge_policy"
const OPTIONAL_VIDEO_METRICS_STORAGE_KEY = "vt_optional_video_metrics_enabled"
const INITIAL_SYNC_VIDEO_LIMIT = Number.POSITIVE_INFINITY

export type YouTubeSyncEnrichmentMode =
 | "core"
 | "video_metrics"
 | "traffic"
 | "segments"
 | "all"

export type YouTubeSyncAction =
 | "core_video_data"
 | "daily_metrics"
 | "google_search"
 | "video_metrics"
 | "traffic"
 | "geography"
 | "audience"
 | "surfaces_discovery"
 | "revenue_monetization"
 | "reporting_bulk"
 | "comments"
 | "deep_data"

/**
 * Channel-level segment datasets ported from the VT-SYNC controller. Each id maps
 * to an exact YouTube Analytics query fetched during the deep-segments pass and can
 * also be requested individually from the sync controller.
 */
export type SegmentDatasetId =
 | "device_os"
 | "traffic_day"
 | "ad_type"
 | "sharing_service"
 | "subscription_status"
 | "subscription_source"
 | "subscriber_detail"
 | "content_type"
 | "playlists"
 | "retention"

export const SEGMENT_DATASET_IDS: SegmentDatasetId[] = [
 "device_os",
 "traffic_day",
 "ad_type",
 "sharing_service",
 "subscription_status",
 "subscription_source",
 "subscriber_detail",
 "content_type",
 "playlists",
 "retention",
]

export type YouTubeSyncOptions = {
 batchMode?: "initial" | "next"
 enrichmentMode?: YouTubeSyncEnrichmentMode
 syncAction?: YouTubeSyncAction
 /**
  * When present, only these segment datasets are refreshed (used by the
  * per-dataset controls in the sync controller). Empty/undefined falls back to
  * the enrichment-mode default (all segment datasets during a segments pass).
  */
 segmentDatasets?: SegmentDatasetId[]
}

const DEFAULT_VIDEO_SYNC_BATCH_STATE: VideoSyncBatchState = {
 initialLimit: INITIAL_SYNC_VIDEO_LIMIT,
 incrementSize: 50,
 cursor: 0,
 hasMore: true,
 lastBatchCount: 0,
}

const WINDOW_DAY_LOOKBACK: Record<
 Exclude<AnalyticsWindow, "lifetime">,
 number
> = {
 "7d": 7,
 "28d": 28,
 "90d": 90,
 "365d": 365,
}

type SyncMergePolicy = "merge" | "latest_only"

export interface GA4AnalyticsData {
 overview: any
 trafficSources: any[]
 topPages: any[]
 demographics: {
  ageGroups: any[]
  countries: any[]
  cities: any[]
 }
 conversions: any[]
}

export interface GA4SyncState {
 connected: boolean
 properties: GA4Property[]
 selectedProperty: string | null
 lastSynced: number | null
 data: GA4AnalyticsData
}

export class SyncCoordinator {
 private static instance: SyncCoordinator
 private syncInterval: any = null
 private youtubeSyncPromise: Promise<void> | null = null
 private syncMachine: SyncMachine;

 private constructor() {
  this.syncMachine = new SyncMachine();
 }

 public triggerAutoLoginSync() {
  return this.syncMachine.startPhase1();
 }

 public triggerManualToolboxSync() {
  return Promise.all([this.syncMachine.startPhase2(), this.syncMachine.startPhase3()]);
 }

 public static getInstance(): SyncCoordinator {
  if (!SyncCoordinator.instance) {
   SyncCoordinator.instance = new SyncCoordinator()
  }
  return SyncCoordinator.instance
 }

 private toIsoDate(date: Date): string {
  return date.toISOString().split("T")[0]
 }

 private byteLength(value: string): number {
  try {
   return new TextEncoder().encode(value).length
  } catch {
   return value.length
  }
 }

 private isQuotaExceededError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false
  const message =
   "message" in error &&
   typeof (error as { message?: unknown }).message === "string"
    ? String((error as { message?: unknown }).message)
    : ""
  return message.toLowerCase().includes("exceeded the quota")
 }

 private buildWindowRanges(
  endDate: Date,
  lifetimeStart: Date,
 ): Record<AnalyticsWindow, { startDate: string; endDate: string }> {
  const ranges = {} as Record<
   AnalyticsWindow,
   { startDate: string; endDate: string }
  >
  const end = this.toIsoDate(endDate)

  ANALYTICS_WINDOWS.forEach((window) => {
   if (window === "lifetime") {
    ranges[window] = { startDate: this.toIsoDate(lifetimeStart), endDate: end }
    return
   }

   const days = WINDOW_DAY_LOOKBACK[window]
   const start = new Date(endDate)
   start.setDate(start.getDate() - (days - 1))
   ranges[window] = { startDate: this.toIsoDate(start), endDate: end }
  })

  return ranges
 }

 private loadVideoSyncBatchState(): VideoSyncBatchState {
  try {
   const raw = localStorage.getItem(VIDEO_SYNC_BATCH_STATE_KEY)
   if (!raw) return { ...DEFAULT_VIDEO_SYNC_BATCH_STATE }
   const parsed = JSON.parse(raw) as Partial<VideoSyncBatchState>
   const parsedInitialLimit =
    typeof parsed.initialLimit === "number" && parsed.initialLimit > 500
     ? parsed.initialLimit
     : DEFAULT_VIDEO_SYNC_BATCH_STATE.initialLimit
   return {
    initialLimit: parsedInitialLimit,
    incrementSize:
     typeof parsed.incrementSize === "number"
      ? parsed.incrementSize
      : DEFAULT_VIDEO_SYNC_BATCH_STATE.incrementSize,
    cursor:
     typeof parsed.cursor === "number"
      ? parsed.cursor
      : DEFAULT_VIDEO_SYNC_BATCH_STATE.cursor,
    hasMore:
     typeof parsed.hasMore === "boolean"
      ? parsed.hasMore
      : DEFAULT_VIDEO_SYNC_BATCH_STATE.hasMore,
    lastBatchCount:
     typeof parsed.lastBatchCount === "number"
      ? parsed.lastBatchCount
      : DEFAULT_VIDEO_SYNC_BATCH_STATE.lastBatchCount,
   }
  } catch {
   return { ...DEFAULT_VIDEO_SYNC_BATCH_STATE }
  }
 }

 private persistVideoSyncBatchState(state: VideoSyncBatchState): void {
  try {
   localStorage.setItem(VIDEO_SYNC_BATCH_STATE_KEY, JSON.stringify(state))
  } catch {
   // no-op
  }
 }

 private emitSyncStatus(status: ChannelAnalysisSyncStatus): void {
  window.dispatchEvent(
   new CustomEvent("vt_channel_sync_status", { detail: status }),
  )
 }

 private ensureCanonicalSchemaVersion(): void {
  try {
   const raw = localStorage.getItem(ANALYTICS_SCHEMA_VERSION_KEY)
   const current = Number(raw || 0)
   if (current === ANALYTICS_SCHEMA_VERSION) return
   localStorage.removeItem(YT_ANALYTICS_CACHE_KEY)
   localStorage.setItem(
    ANALYTICS_SCHEMA_VERSION_KEY,
    String(ANALYTICS_SCHEMA_VERSION),
   )
  } catch {
   // no-op
  }
 }

 private reportRowsToObjects(report: any): Record<string, unknown>[] {
  if (!report || !Array.isArray(report.rows)) return []
  if (!Array.isArray(report.columnHeaders)) {
   return report.rows.filter(
    (row: unknown): row is Record<string, unknown> =>
     !!row && typeof row === "object" && !Array.isArray(row),
   )
  }

  const headers = report.columnHeaders.map(
   (header: { name?: string }, _index: number) => String(header?.name || ""),
  )

  return report.rows
   .map((row: unknown, _rowIndex: number) => {
    if (Array.isArray(row)) {
     const obj: Record<string, unknown> = {}
     headers.forEach((header: string, index: number) => {
      if (!header) return
      obj[header] = row[index]
     })
     return obj
    }

    if (row && typeof row === "object") {
     return row as Record<string, unknown>
    }

    return null
   })
   .filter(
   (row: Record<string, unknown> | null): row is Record<string, unknown> =>
    !!row,
   )
 }

 private firstMetricRowToMap(report: any): Record<string, number> {
  if (!report || !Array.isArray(report.columnHeaders) || !Array.isArray(report.rows)) {
   return {}
  }
  const firstRow = report.rows[0]
  if (!Array.isArray(firstRow)) return {}
  return report.columnHeaders.reduce<Record<string, number>>((acc, header: any, index: number) => {
   const name = String(header?.name || "")
   if (!name) return acc
   const value = Number(firstRow[index])
   if (Number.isFinite(value)) acc[name] = value
   return acc
  }, {})
 }

 private buildChannelLifetimeSummary(profile: any, analyticsReport: any): Record<string, unknown> {
  const metricMap = this.firstMetricRowToMap(analyticsReport)
  const statistics = profile?.statistics || {}
  const currentSubscribers = Number(statistics.subscriberCount || 0) || 0
  const publicVideoCount = Number(statistics.videoCount || 0) || 0
  const publicViewCount = Number(statistics.viewCount || 0) || 0
  const lifetimeWatchMinutes = Number(metricMap.estimatedMinutesWatched || 0) || 0
  return {
   channelId: profile?.id || profile?.channelId || null,
   currentSubscribers,
   publicVideoCount,
   publicViewCount,
   lifetimeViews: Number(metricMap.views || 0) || 0,
   lifetimeWatchMinutes,
   lifetimeWatchHours: lifetimeWatchMinutes / 60,
   lifetimeRevenue: Number(metricMap.estimatedRevenue || 0) || 0,
   lifetimeLikes: Number(metricMap.likes || 0) || 0,
   lifetimeComments: Number(metricMap.comments || 0) || 0,
   lifetimeShares: Number(metricMap.shares || 0) || 0,
   lifetimeEngagedViews: Number(metricMap.engagedViews || 0) || 0,
   lifetimeSubscribersGained: Number(metricMap.subscribersGained || 0) || 0,
   lifetimeSubscribersLost: Number(metricMap.subscribersLost || 0) || 0,
   averageViewDuration: Number(metricMap.averageViewDuration || 0) || 0,
   averageViewPercentage: Number(metricMap.averageViewPercentage || 0) || 0,
   syncedAt: new Date().toISOString(),
  }
 }

 private computeMetricAvailability(
  report: any,
 ): Partial<Record<(typeof canonicalMetricOrder)[number], boolean>> {
  const rows = this.reportRowsToObjects(report)
  const availability: Partial<
   Record<(typeof canonicalMetricOrder)[number], boolean>
  > = {}

  canonicalMetricOrder.forEach((metricKey) => {
   availability[metricKey] = rows.some((row) => {
    const match = getMetricByAliases(row, metricKey)
    return match.found
   })
  })

  return availability
 }

 private buildAnalyticsVerificationSnapshot(cacheData: any) {
  const lifetimeWindow = cacheData.analyticsByWindow?.lifetime || {}
  const diagnostics = lifetimeWindow.syncDiagnostics || {
   failureReasons: [],
   knownInvalidCombos: [],
  }
  const lifetimeAvailability = cacheData.availabilityByWindow?.lifetime || {}
  const thumbnailFailures = (diagnostics.failureReasons || []).filter(
   (failure: any) =>
    failure?.group === "impressions_ctr" ||
    (failure?.metrics || []).some((metric: string) =>
     metric === "videoThumbnailImpressions" ||
     metric === "videoThumbnailImpressionsClickRate",
    ),
  )
  const quarantinedFailures = thumbnailFailures.filter(
   (failure: any) => failure?.outcome === "quarantined",
  ).length
  const suppressedRetries = thumbnailFailures.filter(
   (failure: any) => failure?.outcome === "suppressed",
  ).length
  const requestShapeHealthy = !thumbnailFailures.some(
   (failure: any) =>
    failure?.requestClass === "video_top_videos_channel_filter" &&
    (failure?.status === 400 || failure?.outcome === "quarantined"),
  )

  return {
   window: "lifetime" as const,
   thumbnailMetrics: {
    impressionsAvailable: lifetimeAvailability.impressions === true,
    ctrAvailable: lifetimeAvailability.ctr === true,
    requestShapeHealthy,
    failureEvents: thumbnailFailures.length,
    quarantinedFailures,
    suppressedRetries,
   },
   creatorContentType: {
    status: cacheData.videoContentTypeStatus?.status || "quarantined",
    disabledForSession:
     cacheData.videoContentTypeStatus?.disabledForSession === true,
    rowCount: Number(cacheData.videoContentTypeStatus?.rowCount || 0),
    reason: cacheData.videoContentTypeStatus?.reason,
   },
  }
 }

 /**
  * Fetches the requested channel-level segment datasets (device x OS, traffic
  * source x day, ad type, sharing service, subscription status, subscription
  * source, subscriber detail, content type/format, playlist analytics, and
  * video retention) using the exact VT-SYNC queries, commits each raw report to
  * the canonical ledger, and stores it on cacheData for the master tables.
  */
 private async syncSegmentDatasets(
  cacheData: Record<string, any>,
  profileId: string | undefined,
  startDate: string,
  endDate: string,
  targetVideoIds: string[],
  selected: SegmentDatasetId[],
 ): Promise<void> {
  const wanted = new Set(selected)

  const commitReport = (
   cacheKey: string,
   context: LedgerEntry["context"],
   dimensions: string[],
   report: SegmentAnalyticsReport | null | undefined,
  ) => {
   if (!report || !Array.isArray(report.rows)) return
   upsertLedgerEntry({
    source: "youtube_analytics_v2",
    context,
    dimensions,
    metrics: (report.columnHeaders || []).map((header: any) => header.name),
    payload: report,
    window: "lifetime",
   })
   cacheData[cacheKey] = report
  }

  const run = async (
   id: SegmentDatasetId,
   cacheKey: string,
   context: LedgerEntry["context"],
   dimensions: string[],
   fetcher: () => Promise<SegmentAnalyticsReport>,
  ) => {
   if (!wanted.has(id)) return
   try {
    const report = await ytApiQueue.add(() => fetcher())
    commitReport(cacheKey, context, dimensions, report)
   } catch (e: any) {
    console.error(`Segment dataset "${id}" sync failed:`, e?.message || e)
   }
  }

  await run("device_os", "deviceOs", "device_os", ["deviceType", "operatingSystem"], () =>
   fetchDeviceOsAnalytics(startDate, endDate, profileId),
  )
  await run("traffic_day", "trafficDay", "traffic_daily", ["insightTrafficSourceType", "day"], () =>
   fetchTrafficByDayAnalytics(startDate, endDate, profileId),
  )
  await run("ad_type", "adTypes", "ad_type", ["adType"], () =>
   fetchAdTypeAnalytics(startDate, endDate, profileId),
  )
  await run("sharing_service", "sharingService", "sharing_service", ["sharingService"], () =>
   fetchSharingServiceAnalytics(startDate, endDate, profileId),
  )
  await run(
   "subscription_status",
   "subscriptionStatus",
   "subscription_status",
   ["subscribedStatus"],
   () => fetchSubscriptionStatusAnalytics(startDate, endDate, profileId),
  )
  await run(
   "subscription_source",
   "subscriptionSource",
   "subscription_source",
   ["insightTrafficSourceType"],
   () => fetchSubscriptionSourceAnalytics(startDate, endDate, profileId),
  )
  await run(
   "subscriber_detail",
   "subscriberDetail",
   "subscriber_detail",
   ["insightTrafficSourceDetail"],
   () => fetchSubscriberDetailAnalytics(startDate, endDate, profileId),
  )
  await run(
   "content_type",
   "creatorContentTypes",
   "creator_content_type",
   ["creatorContentType"],
   () => fetchCreatorContentTypeAnalytics(startDate, endDate, profileId),
  )
  await run("playlists", "playlistAnalytics", "playlist", ["playlist"], () =>
   fetchPlaylistAnalytics(startDate, endDate, profileId),
  )
  if (wanted.has("retention") && targetVideoIds.length > 0) {
   try {
    const report = await ytApiQueue.add(() =>
     fetchRetentionAnalyticsReport(targetVideoIds, startDate, endDate, 25),
    )
    commitReport(
     "retentions",
     "retention",
     ["video", "elapsedVideoTimeRatio"],
     report,
    )
   } catch (e: any) {
    console.error("Segment dataset \"retention\" sync failed:", e?.message || e)
   }
  }

  cacheData.segmentDatasetsStatus = {
   status: "complete",
   datasets: selected,
   fetchedAt: Date.now(),
  }
 }

 private getStoredSyncMergePolicy(): SyncMergePolicy {
  try {
   const raw = localStorage.getItem(SYNC_MERGE_POLICY_KEY)
   if (raw === "latest_only") return "latest_only"
  } catch {
   // no-op
  }
  return "merge"
 }

 private isOptionalVideoMetricsEnabled(): boolean {
  try {
   const raw = localStorage.getItem(OPTIONAL_VIDEO_METRICS_STORAGE_KEY)
   if (raw == null) return true
   return raw === "1" || raw === "true"
  } catch {
   return true
  }
 }

 public async syncYouTube(
  force = false,
  options: YouTubeSyncOptions = {},
): Promise<void> {
  if (this.youtubeSyncPromise) {
   console.log("YouTube sync already in progress. Reusing active run.")
   return this.youtubeSyncPromise
  }

  this.youtubeSyncPromise = this.runYouTubeSync(force, options)
  try {
   await this.youtubeSyncPromise
  } finally {
   this.youtubeSyncPromise = null
  }
 }

 private async runYouTubeSync(
  force = false,
  options: YouTubeSyncOptions = {},
): Promise<void> {
  console.log(
   "syncYouTube called, force:",
   force,
   "isConnected:",
   isChannelConnected(),
  )
  if (!isChannelConnected()) {
   console.log("YouTube Channel not connected. Returning early.")
   return
  }
  this.ensureCanonicalSchemaVersion()

  const syncStatusBase: Omit<
   ChannelAnalysisSyncStatus,
   "phase" | "completedAt" | "lastError"
  > = {
   startedAt: new Date().toISOString(),
   stages: ["Preparing YouTube sync run"],
  }
  this.emitSyncStatus({
   ...syncStatusBase,
   phase: "syncing",
   completedAt: null,
   lastError: null,
  })

  // Yield to main thread to allow React to paint the loading state
  // before we block the thread with the massive JSON parse.
  await new Promise((r) => setTimeout(r, 10))

   let prevCache: Record<string, any> = {}
   try {
    prevCache = readYouTubeAnalyticsCache()
   } catch (error) {
    console.warn("YouTube Sync: Corrupt yt_analytics_cache, resetting.", error)
    prevCache = {}
   }

  const mergePolicy = this.getStoredSyncMergePolicy()
  if (
   !force &&
   prevCache.lastSynced &&
   Date.now() - prevCache.lastSynced < 4 * 60 * 60 * 1000
  ) {
   console.log("YouTube Sync: Using fresh cache (less than 4 hours old).")
   this.emitSyncStatus({
    ...syncStatusBase,
    phase: "complete",
    completedAt: new Date().toISOString(),
    lastError: null,
    stages: ["YouTube cache fresh, sync skipped"],
   })
   return
  }

   const shouldStartFresh = mergePolicy === "latest_only"
   let cacheData: Record<string, any> = {
    ...prevCache,
    lastSynced: prevCache.lastSynced || null,
   }

  try {
   resetYouTubeApiCallCounts()

   // ── Core Lifetime Sync (Fast Boot) ──────────────────────────────
   // Runs the 3-phase pipeline: channel stats → video inventory → core analytics.
   // Each phase emits progressive CustomEvents so the UI renders incrementally.
   this.emitSyncStatus({
    ...syncStatusBase,
    phase: "syncing",
    completedAt: null,
    lastError: null,
    stages: ["Running Core Lifetime Sync (Fast Boot)"],
   })

   const batchState = this.loadVideoSyncBatchState()
   const isNextBatch = options.batchMode === "next"
   const enrichmentMode = options.enrichmentMode || "core"
   const requestedAction = options.syncAction || null
   const shouldSyncSearch = requestedAction === "google_search" || requestedAction === "traffic"
   const shouldSyncVideoMetrics =
    enrichmentMode === "video_metrics" || enrichmentMode === "all"
   const shouldSyncTraffic =
    shouldSyncSearch ||
    enrichmentMode === "traffic" ||
    enrichmentMode === "segments" ||
    enrichmentMode === "all"
   const shouldSyncSegments =
    enrichmentMode === "segments" || enrichmentMode === "all"
   const requestedSegments = Array.isArray(options.segmentDatasets)
    ? options.segmentDatasets.filter((id): id is SegmentDatasetId =>
       SEGMENT_DATASET_IDS.includes(id),
      )
    : []
   const hasRequestedSegments = requestedSegments.length > 0
   const shouldSyncSegmentDatasets = hasRequestedSegments || shouldSyncSegments
   const segmentSelection: SegmentDatasetId[] = hasRequestedSegments
    ? requestedSegments
    : [...SEGMENT_DATASET_IDS]
   const maxVideos = isNextBatch
    ? batchState.cursor + batchState.incrementSize
    : batchState.initialLimit

   let coreSyncResult: CoreSyncResult | null = null
   try {
    coreSyncResult = await syncCoreLifetimeData(maxVideos, {
     includeVideoAnalytics: false,
    })
   } catch (coreSyncError: any) {
    console.warn("Core Lifetime Sync failed, falling back to legacy sync:", coreSyncError?.message || coreSyncError)
   }

   // ── Populate cacheData from core sync results ──────────────────
   let profile: any
   let videos: any[] = []
   let stats: Record<string, any> =
    !shouldStartFresh && cacheData.stats && typeof cacheData.stats === "object"
     ? (cacheData.stats as Record<string, any>)
     : {}

  if (coreSyncResult) {
   // Core sync succeeded — build profile from core sync fields + previous cache
   profile = {
     ...(prevCache.profile || {}),
     ...(coreSyncResult.channelBaseline || {}),
     id: coreSyncResult.channelId,
     channelId: coreSyncResult.channelId,
     statistics: coreSyncResult.channelStats,
     uploadsPlaylistId: coreSyncResult.uploadsPlaylistId,
    }
    cacheData.profile = profile
    cacheData.channelBaseline = profile
    cacheData.playlistsBaseline = coreSyncResult.playlistsBaseline
    cacheData.videoCategoryTaxonomy = coreSyncResult.categoryTaxonomy
    cacheData.channelLifetimeSummary = coreSyncResult.channelLifetimeSummary

    if (coreSyncResult.windowedAnalytics) {
      for (const [window, report] of Object.entries(coreSyncResult.windowedAnalytics)) {
        cacheData[`youtube_analytics_v2::channel::::${window}`] = {
          source: "youtube_analytics_v2",
          context: "channel",
          dimensions: [],
          metrics: [...CHANNEL_LIFETIME_METRICS],
          window,
          payload: report,
          syncedAt: new Date().toISOString()
        }
      }
    }

    // Convert CoreVideoBaseline to the existing cache format
    const existingVideos =
     Array.isArray(prevCache.videos) ? prevCache.videos : []
    const coreVideos = coreSyncResult.videoBaseline.map((v) => ({
     videoId: v.videoId,
     title: v.title,
     description: v.description,
     publishedAt: v.publishedAt,
     thumbnail: v.thumbnail,
     thumbnailUrl: v.thumbnail,
     thumbnails: v.thumbnails,
     tags: v.tags,
     channelId: v.channelId,
     channelTitle: v.channelTitle,
     categoryId: v.categoryId,
     categoryName: v.categoryName,
     defaultLanguage: v.defaultLanguage,
     localized: v.localized,
     localizations: v.localizations,
     topicDetails: v.topicDetails,
     privacyStatus: v.privacyStatus,
     uploadStatus: v.uploadStatus,
     embeddable: v.embeddable,
     license: v.license,
     publicStatsViewable: v.publicStatsViewable,
     madeForKids: v.madeForKids,
     selfDeclaredMadeForKids: v.selfDeclaredMadeForKids,
     definition: v.definition,
     dimension: v.dimension,
     caption: v.caption,
     licensedContent: v.licensedContent,
     projection: v.projection,
     durationSeconds: v.duration,
     durationRaw: v.durationRaw,
     format: v.format,
     isShort: v.isShort,
     aspectRatioBucket: v.aspectRatioBucket,
     aspectRatioWidth: v.aspectRatioWidth,
     aspectRatioHeight: v.aspectRatioHeight,
     aspectRatioSource: v.aspectRatioSource,
     viewCount: String(v.dataApiStats.views),
     likeCount: String(v.dataApiStats.likes),
     commentCount: String(v.dataApiStats.comments),
     subscriberCount: v.dataApiStats.subscribers,
     analyticsMetrics: v.analyticsMetrics || undefined,
    }))

    // Merge with existing videos (preserve any not in current fetch)
    if (existingVideos.length > 0 && coreVideos.length > 0) {
     const byId = new Map<string, any>()
     existingVideos.forEach((v: any) => {
      const id = String(v?.videoId || "").trim()
      if (id) byId.set(id, v)
     })
     coreVideos.forEach((v: any) => {
      const id = String(v?.videoId || "").trim()
      if (!id) return
      const prev = byId.get(id) || {}
      byId.set(id, { ...prev, ...v })
     })
     const fetchedIds = new Set<string>(
      coreVideos.map((v: any) => String(v?.videoId || "").trim()).filter(Boolean),
     )
     const merged: any[] = []
     coreVideos.forEach((v: any) => {
      const id = String(v?.videoId || "").trim()
      if (!id) return
      merged.push(byId.get(id))
     })
     existingVideos.forEach((v: any) => {
      const id = String(v?.videoId || "").trim()
      if (!id || fetchedIds.has(id)) return
      merged.push(v)
     })
     videos = merged
    } else if (coreVideos.length > 0) {
     videos = coreVideos
    } else {
     videos = existingVideos
    }

    if (videos.length > 0) cacheData.videos = videos

    // Populate stats map from core sync unified records
    coreSyncResult.videoBaseline.forEach((v) => {
     const existing = stats[v.videoId] || {}
     stats[v.videoId] = {
      ...existing,
     viewCount: String(v.dataApiStats.views),
     likeCount: String(v.dataApiStats.likes),
     commentCount: String(v.dataApiStats.comments),
     title: v.title,
      description: v.description,
      publishedAt: v.publishedAt,
      thumbnail: v.thumbnail,
      thumbnailUrl: v.thumbnail,
      thumbnails: v.thumbnails,
      tags: v.tags,
      channelId: v.channelId,
      channelTitle: v.channelTitle,
      categoryId: v.categoryId,
      categoryName: v.categoryName,
      defaultLanguage: v.defaultLanguage,
      localized: v.localized,
      localizations: v.localizations,
      topicDetails: v.topicDetails,
      durationSeconds: v.duration,
      durationRaw: v.durationRaw,
      privacyStatus: v.privacyStatus,
      uploadStatus: v.uploadStatus || "",
      embeddable: v.embeddable,
      license: v.license,
      publicStatsViewable: v.publicStatsViewable,
      madeForKids: v.madeForKids,
      selfDeclaredMadeForKids: v.selfDeclaredMadeForKids,
      definition: v.definition || "",
      dimension: v.dimension || "",
      caption: v.caption || "",
      licensedContent: v.licensedContent,
      projection: v.projection || "",
      isShort: v.isShort,
      format: v.format,
      aspectRatioBucket: v.aspectRatioBucket,
      aspectRatioWidth: v.aspectRatioWidth,
      aspectRatioHeight: v.aspectRatioHeight,
      aspectRatioSource: v.aspectRatioSource,
      subscriberCount: v.dataApiStats.subscribers,
      ...(v.analyticsMetrics || {}),
     }
    })
    if (Object.keys(stats).length > 0) cacheData.stats = stats

    // Commit core analytics to the canonical ledger
    if (coreSyncResult.analytics.videos?.rows?.length > 0) {
     cacheData = upsertLedgerEntry(cacheData, {
      source: "youtube_analytics_v2",
      context: "video",
      dimensions: ["video"],
      metrics: (coreSyncResult.analytics.videos.columnHeaders || []).map((h: any) => h.name),
      payload: coreSyncResult.analytics.videos,
      window: "lifetime",
     })
    }
    if (coreSyncResult.analytics.channel?.rows?.length > 0) {
     cacheData = upsertLedgerEntry(cacheData, {
      source: "youtube_analytics_v2",
      context: "channel",
      dimensions: [],
      metrics: (coreSyncResult.analytics.channel.columnHeaders || []).map((h: any) => h.name),
      payload: coreSyncResult.analytics.channel,
      window: "lifetime",
     })
     cacheData.globalLifetime = coreSyncResult.analytics.channel
     cacheData.channelLifetimeSummary = this.buildChannelLifetimeSummary(
      profile,
      coreSyncResult.analytics.channel,
     )
    }

    // Update batch state
    const nextBatchState: VideoSyncBatchState = {
     ...batchState,
     cursor: videos.length,
     lastBatchCount: Math.max(0, coreSyncResult.videoBaseline.length),
     hasMore: coreSyncResult.inventoryHasMore,
    }
    this.persistVideoSyncBatchState(nextBatchState)
    cacheData.videoSyncBatch = nextBatchState
    cacheData.coreSyncTiming = coreSyncResult.timing
    cacheData.lastSynced = Date.now()
    cacheData[MASTER_TABLE_METRIC_AUDIT_CACHE_KEY] = MASTER_METRIC_AUDIT_RESULTS
    cacheData[MASTER_TABLE_STAGE_RESULTS_CACHE_KEY] = {
     channel_bootstrap: {
      status: "complete",
      syncedAt: Date.now(),
      capabilities: ["youtube_data_v3", "youtube_analytics_v2"],
      diagnostics: [],
      provenance: ["api"],
      rowsTouched: 1,
      fieldsPopulated: [
       "channelBaseline",
       "channelLifetimeSummary",
       "videoCategoryTaxonomy",
      ],
     },
     video_inventory: {
      status: "complete",
      syncedAt: Date.now(),
      capabilities: ["youtube_data_v3"],
      diagnostics: [],
      provenance: ["api"],
      rowsTouched: coreSyncResult.videoBaseline.length,
      fieldsPopulated: [
       "videoId",
       "title",
       "publishedAt",
       "durationSeconds",
       "categoryId",
       "privacyStatus",
      ],
     },
     analytics_enrichment: {
      status: "partial",
      syncedAt: Date.now(),
      capabilities: ["youtube_analytics_v2"],
      diagnostics: [
       enrichmentMode === "core"
        ? "Core-only baseline cached; CSV-owned and optional enrichments remain deferred."
        : `Enrichment mode ${enrichmentMode} continues after baseline cache.`,
      ],
      provenance: ["api"],
      rowsTouched: coreSyncResult.analytics.videos?.rows?.length || 0,
      fieldsPopulated: (coreSyncResult.analytics.videos?.columnHeaders || [])
       .map((header: any) => String(header?.name || ""))
       .filter(Boolean),
     },
    }

    try {
     writeYouTubeAnalyticsCache(cacheData)
     localStorage.setItem("yt_analytics_last_sync", new Date().toISOString())
     window.dispatchEvent(new CustomEvent("vt_local_data_changed"))
     window.dispatchEvent(
      new CustomEvent("yt_analytics_synced", { detail: cacheData }),
     )
    } catch (e) {
     console.warn("Core sync cache checkpoint failed:", e)
    }

    this.emitSyncStatus({
     ...syncStatusBase,
     phase: "partial",
     completedAt: null,
     lastError: null,
     stages: [
      `Core-ready baseline cached (${coreSyncResult.timing.phase1Ms}ms)`,
      enrichmentMode === "core"
       ? "Optional enrichment deferred until manually requested"
       : requestedAction === "daily_metrics"
         ? "Daily metrics enrichment starting"
         : "Manual analytics enrichment starting",
     ],
    })
   } else {
    // Fallback: core sync failed, use legacy fetch path
    profile = await ytApiQueue.add(() => fetchChannelProfile())
    cacheData.profile = profile

    try {
     const existingVideos =
      Array.isArray(prevCache.videos) ? prevCache.videos : []
     const batchLimit = isNextBatch
      ? batchState.cursor + batchState.incrementSize
      : Infinity
     const incrementalMax =
      existingVideos.length > 0
       ? Math.max(batchLimit, existingVideos.length)
       : batchLimit
     this.emitSyncStatus({
      ...syncStatusBase,
      phase: "syncing",
      completedAt: null,
      lastError: null,
      stages: [
       "Fetching profile (legacy fallback)",
       `Fetching videos (${isNextBatch ? "next +250" : "all available"})`,
      ],
     })
     const fetchedVideos = await ytApiQueue.add(() =>
      fetchVideoList(incrementalMax, undefined, profile.uploadsPlaylistId, {
       allowSearchFallback: false,
      }),
     )

     if (existingVideos.length > 0 && fetchedVideos.length === 0) {
      videos = existingVideos
     } else if (existingVideos.length > 0 && fetchedVideos.length > 0) {
      const byId = new Map<string, any>()
      existingVideos.forEach((v: any) => {
       const id = String(v?.videoId || "").trim()
       if (id) byId.set(id, v)
      })
      fetchedVideos.forEach((v: any) => {
       const id = String(v?.videoId || "").trim()
       if (!id) return
       const prev = byId.get(id) || {}
       byId.set(id, { ...prev, ...v })
      })
      const fetchedIds = new Set<string>(
       fetchedVideos
        .map((v: any) => String(v?.videoId || "").trim())
        .filter(Boolean),
      )
      const merged: any[] = []
      fetchedVideos.forEach((v: any) => {
       const id = String(v?.videoId || "").trim()
       if (!id) return
       merged.push(byId.get(id))
      })
      existingVideos.forEach((v: any) => {
       const id = String(v?.videoId || "").trim()
       if (!id || fetchedIds.has(id)) return
       merged.push(v)
      })
      videos = merged
     } else {
      videos = fetchedVideos
     }

     const nextBatchState: VideoSyncBatchState = {
      ...batchState,
      cursor: videos.length,
      lastBatchCount: Math.max(0, videos.length - existingVideos.length),
      hasMore: fetchedVideos.length >= incrementalMax,
     }
     this.persistVideoSyncBatchState(nextBatchState)
     cacheData.videoSyncBatch = nextBatchState

     if (videos.length > 0) cacheData.videos = videos

     const videoIds = videos.map((v) => v.videoId)
     if (videoIds.length > 0) {
      const missingIds = videoIds.filter((id: string) => !stats?.[id])
      const recentCutoff = new Date()
      recentCutoff.setDate(recentCutoff.getDate() - 30)
      const recentIds = videos
       .filter((v) => {
        const publishedAt = new Date(v?.publishedAt || "")
        if (Number.isNaN(publishedAt.getTime())) return false
        return publishedAt >= recentCutoff
       })
       .map((v) => v.videoId)

      const idsToFetch = Array.from(
       new Set<string>([...missingIds, ...recentIds].filter(Boolean)),
      )
      const [rawStats, shortsPlaylistIds] = await Promise.all([
       ytApiQueue.add(() =>
        idsToFetch.length > 0 ? fetchVideoStats(idsToFetch) : Promise.resolve([]),
       ),
       ytApiQueue.add(() => fetchShortsPlaylistIds(profile.id)),
      ])

      const fetchedAt = new Date()
      const fetchedAtIso = fetchedAt.toISOString()
      const fetchedAtLocal = fetchedAt.toLocaleString(undefined, {
       dateStyle: "medium",
       timeStyle: "short",
      } as Intl.DateTimeFormatOptions)
      rawStats.forEach((s) => {
       const existing = stats[s.videoId] || {}
       const durationSeconds = parseDurationSeconds(s.duration)
       stats[s.videoId] = {
        ...existing,
        viewCount: s.views,
        likeCount: s.likes,
        commentCount: s.comments,
        durationSeconds: durationSeconds,
        durationRaw: s.duration,
        privacyStatus: s.privacyStatus || "",
        isShort: shortsPlaylistIds.has(s.videoId) || s.isShort === true,
        dataApiFetchedAt: fetchedAtIso,
        dataApiFetchedAtLocal: fetchedAtLocal,
       }
      })
      if (Object.keys(stats).length > 0) cacheData.stats = stats
     }
    } catch (e) {
     console.warn("Video list or public stats fetch failed:", e)
    }
   }

   const now = new Date()
   const analyticsEndDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

   const earliestVideoDate = videos
    .map((video) => new Date(video?.publishedAt || ""))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())[0]

   const channelPublishedDate = new Date(profile?.publishedAt || "")
   const hasChannelPublishedDate = !Number.isNaN(channelPublishedDate.getTime())
   const youtubeEpoch = new Date("2005-02-14T00:00:00.000Z")
   const lifetimeStart =
    (hasChannelPublishedDate ? channelPublishedDate : null) ||
    earliestVideoDate ||
    youtubeEpoch
   const windowRanges = this.buildWindowRanges(analyticsEndDate, lifetimeStart)
   const targetVideoIds = videos
    .map((video) => String(video?.videoId || "").trim())
    .filter(Boolean)

   cacheData.analyticsByWindow = { ...(cacheData.analyticsByWindow || {}) }
   cacheData.availabilityByWindow = {
       ...(cacheData.availabilityByWindow || {}),
      }
   cacheData.metricCapabilitiesByWindow = {
       ...(cacheData.metricCapabilitiesByWindow || {}),
      }
   cacheData.lastSyncedByWindow = {
       ...(cacheData.lastSyncedByWindow || {}),
      }

   const optionalMetricsEnabled = this.isOptionalVideoMetricsEnabled()

   if (shouldSyncVideoMetrics) {
    for (const window of ANALYTICS_WINDOWS) {
     const range = windowRanges[window]
     try {
      this.emitSyncStatus({
       ...syncStatusBase,
       phase: "syncing",
       completedAt: null,
       lastError: null,
       stages: ["Fetching video analytics", `Window ${window.toUpperCase()}`],
      })
      const analytics = await ytApiQueue.add(() =>
       fetchAnalytics(range.startDate, range.endDate, profile.id, {
        window,
        targetVideoIds,
        optionalMetricsEnabled,
        batchMode: "next",
       }),
      )

      if (analytics?.report) {
       cacheData = upsertLedgerEntry(cacheData, {
        source: "youtube_analytics_v2",
        context: "video",
        dimensions: ["video"],
        metrics: (analytics.report.columnHeaders || []).map((h: any) => h.name),
        payload: analytics.report,
        window: window,
       })
      }

      if (window === "lifetime" || window === "28d" || window === "90d") {
       try {
        const globalStats = await ytApiQueue.add(() =>
         fetchGlobalLifetimeAnalytics(range.startDate, range.endDate, profile.id),
        )
        if (globalStats) {
         cacheData = upsertLedgerEntry(cacheData, {
          source: "youtube_analytics_v2",
          context: "channel",
          dimensions: [],
          metrics: (globalStats.columnHeaders || []).map((h: any) => h.name),
          payload: globalStats,
          window: window,
         })
         if (window === "lifetime") {
          cacheData.globalLifetime = globalStats
          cacheData.channelLifetimeSummary = this.buildChannelLifetimeSummary(
           profile,
           globalStats,
          )
         }
        }
       } catch (e) {
        console.warn(`Channel analytics fetch failed for window ${window}:`, e)
       }
      }

      const report = analytics?.report || analytics
      cacheData.analyticsByWindow[window] = {
       window,
       startDate: range.startDate,
       endDate: range.endDate,
       fetchedAt: Date.now(),
       report,
       groups: analytics?.groups || {},
       metricCapabilities: analytics?.metricCapabilities || [],
       syncDiagnostics: analytics?.syncDiagnostics || {
        attemptedGroups: {},
        disabledMetrics: [],
        failureReasons: [],
        knownInvalidCombos: [],
        splitRetries: 0,
        maxRequestChars: 0,
        requestCharCounts: [],
       },
      }
      cacheData.availabilityByWindow[window] = this.computeMetricAvailability(report)
      cacheData.metricCapabilitiesByWindow[window] = Array.isArray(
       analytics?.metricCapabilities,
      )
       ? analytics.metricCapabilities
       : []
      cacheData.lastSyncedByWindow[window] = Date.now()

      if (window === "lifetime") {
       cacheData.analytics = report
      }
     } catch (e: any) {
      console.error(
       `Video-level Analytics API ERROR (${window}):`,
       e?.message || e,
      )
     }
    }
    cacheData.videoMetricEnrichmentStatus = {
     status: "complete",
     mode: enrichmentMode,
     fetchedAt: Date.now(),
    }
   } else {
    cacheData.videoMetricEnrichmentStatus = {
     status: "deferred",
     mode: enrichmentMode,
     reason: "Core sync keeps optional video analytics out of the initial table-ready path.",
     fetchedAt: Date.now(),
    }
   }

   const overviewRange = windowRanges["lifetime"]
   const startDate = overviewRange.startDate
   const endDate = overviewRange.endDate

   if (shouldSyncVideoMetrics) {
    try {
     const contentTypeRange = windowRanges["lifetime"]
     const contentTypeResult = await ytApiQueue.add(() =>
      fetchVideoContentType(
       contentTypeRange.startDate,
       contentTypeRange.endDate,
       profile.id,
      ),
     )
     cacheData.videoContentTypeStatus = contentTypeResult.status
     if (contentTypeResult.map.size > 0) {
      cacheData.videoContentType = Object.fromEntries(contentTypeResult.map)
     }
    } catch (e: any) {
     console.warn("Video content type detection failed:", e?.message || e)
     cacheData.videoContentTypeStatus = {
      status: "quarantined",
      requestClass: "channel_creator_content_type",
      idsTried: profile?.id ? [`channel==${profile.id}`, "channel==MINE"] : ["channel==MINE"],
      disabledForSession: true,
      rowCount: 0,
      reason: e?.message || String(e),
      fetchedAt: Date.now(),
     }
    }
   }

   if (shouldSyncVideoMetrics) {
    try {
     this.emitSyncStatus({
      ...syncStatusBase,
      phase: "syncing",
      completedAt: null,
      lastError: null,
      stages: ["Fetching channel-level analytics"],
     })
     const channelAnalytics = await ytApiQueue.add(() =>
      fetchChannelAnalytics(startDate, endDate, profile.id),
     )
     if (channelAnalytics) {
      cacheData = upsertLedgerEntry(cacheData, {
       source: "youtube_analytics_v2",
       context: "channel",
       dimensions: ["day"],
       metrics: (channelAnalytics.columnHeaders || []).map((h: any) => h.name),
       payload: channelAnalytics,
       window: "lifetime",
      })
      cacheData.channelAnalytics = channelAnalytics
     }
    } catch (e: any) {
     console.error("Channel-level Analytics API ERROR:", e?.message || e)
    }
   }

   if (shouldSyncSegments) {
    try {
     this.emitSyncStatus({
      ...syncStatusBase,
      phase: "syncing",
      completedAt: null,
      lastError: null,
      stages: ["Fetching demographics"],
     })
     const demographics = await ytApiQueue.add(() =>
      fetchDemographicAnalytics(startDate, endDate, profile.id),
     )
     if (demographics) {
      cacheData = upsertLedgerEntry(cacheData, {
       source: "youtube_analytics_v2",
       context: "demographics",
       dimensions: ["ageGroup", "gender"],
       metrics: (demographics.columnHeaders || []).map((h: any) => h.name),
       payload: demographics,
       window: "lifetime",
      })
      cacheData.demographics = demographics
     }
    } catch (e: any) {
     console.error("Demographic Analytics API ERROR:", e?.message || e)
    }

    if (shouldSyncTraffic) try {
     this.emitSyncStatus({
      ...syncStatusBase,
      phase: "syncing",
      completedAt: null,
      lastError: null,
      stages: ["Fetching full traffic analytics"],
     })
     const trafficResult = await ytApiQueue.add(() =>
      syncTrafficAnalytics({
       startDate,
       endDate,
       channelId: profile.id,
       targetVideoIds: videos
        .map((video: any) => String(video?.videoId || "").trim())
        .filter(Boolean)
        .slice(0, 50),
       includeReporting: false,
       reportingMode: "diagnose",
      }),
     )
     if (trafficResult) {
      cacheData = upsertLedgerEntry(cacheData, {
       source: "youtube_analytics_v2",
       context: "traffic_source",
       dimensions: ["insightTrafficSourceType"],
       metrics: (trafficResult.rawReports.overview?.columnHeaders || []).map((h: any) => h.name),
       payload: trafficResult.rawReports.overview,
       window: "lifetime",
      })
      if (trafficResult.rawReports.dailyByType) {
       cacheData = upsertLedgerEntry(cacheData, {
        source: "youtube_analytics_v2",
        context: "traffic_daily",
        dimensions: ["day", "insightTrafficSourceType"],
        metrics: (trafficResult.rawReports.dailyByType.columnHeaders || []).map((h: any) => h.name),
        payload: trafficResult.rawReports.dailyByType,
        window: "lifetime",
       })
      }
      if (trafficResult.rawReports.videoByType) {
       cacheData = upsertLedgerEntry(cacheData, {
        source: "youtube_analytics_v2",
        context: "traffic_video",
        dimensions: ["video", "insightTrafficSourceType"],
        metrics: Array.isArray(trafficResult.rawReports.videoByType)
         ? ["views", "estimatedMinutesWatched", "averageViewDuration"]
         : (trafficResult.rawReports.videoByType.columnHeaders || []).map((h: any) => h.name),
        payload: trafficResult.rawReports.videoByType,
        window: "lifetime",
       })
      }
      cacheData.trafficSources = trafficResult.rawReports.overview
     cacheData.trafficOverview = trafficResult.trafficOverview
     cacheData.trafficDailyByType = trafficResult.trafficDailyByType
     cacheData.trafficVideoByType = trafficResult.trafficVideoByType
     cacheData.trafficDetailByType = trafficResult.trafficDetailByType
     cacheData.trafficReportingBulk = trafficResult.trafficReportingBulk
     cacheData.trafficDiagnostics = trafficResult.trafficDiagnostics

      const videoTitleById = Array.isArray(videos)
       ? videos.reduce<Record<string, string>>((acc, video: any) => {
          const videoId = String(video?.videoId || "").trim()
          if (!videoId) return acc
          acc[videoId] = String(video?.title || "").trim()
          return acc
         }, {})
       : {}
      const trafficSearchRows = buildTrafficSearchRows(
       trafficResult.trafficDetailByType,
       videoTitleById,
      )
      const previousSearchRows = Array.isArray(cacheData.searchIntelligenceRows)
       ? cacheData.searchIntelligenceRows.filter(
          (row: any) => row?.sourceLane === "google_search_console",
         )
       : []
      cacheData.searchIntelligenceRows = [...previousSearchRows, ...trafficSearchRows]
      cacheData.searchIntelligenceStatus = {
       status: "complete",
       fetchedAt: Date.now(),
       boundSiteUrl:
        typeof cacheData.searchConsoleBinding?.siteUrl === "string"
         ? cacheData.searchConsoleBinding.siteUrl
         : undefined,
       searchConsoleRowCount: previousSearchRows.length,
       youtubeSearchRowCount: trafficSearchRows.filter(
        (row) => row.sourceLane === "youtube_search_keyword",
       ).length,
       googleReferralRowCount: trafficSearchRows.filter(
        (row) => row.referralClass === "google_search_referral",
       ).length,
       externalReferralRowCount: trafficSearchRows.filter(
        (row) => row.referralClass === "external_referral",
       ).length,
      }
     }
    } catch (e: any) {
     console.error("Traffic Source Analytics API ERROR:", e?.message || e)
    }

    if (shouldSyncSearch) {
     const storedBinding = googleSearchConsoleService.getStoredBinding()
     if (!storedBinding?.siteUrl) {
      cacheData.searchConsoleStatus = {
       status: "property_missing",
       fetchedAt: Date.now(),
       reason: "Bind a Search Console property in Settings before running Google Search sync.",
      }
      cacheData.searchIntelligenceStatus = {
       status: "property_missing",
       fetchedAt: Date.now(),
       searchConsoleRowCount: 0,
       youtubeSearchRowCount: Array.isArray(cacheData.searchIntelligenceRows)
        ? cacheData.searchIntelligenceRows.filter(
           (row: any) => row?.sourceLane === "youtube_search_keyword",
          ).length
        : 0,
       googleReferralRowCount: Array.isArray(cacheData.searchIntelligenceRows)
        ? cacheData.searchIntelligenceRows.filter(
           (row: any) => row?.referralClass === "google_search_referral",
          ).length
        : 0,
       externalReferralRowCount: Array.isArray(cacheData.searchIntelligenceRows)
        ? cacheData.searchIntelligenceRows.filter(
           (row: any) => row?.referralClass === "external_referral",
          ).length
        : 0,
       reason: "No Search Console property is currently bound.",
      }
     } else {
      try {
       this.emitSyncStatus({
        ...syncStatusBase,
        phase: "syncing",
        completedAt: null,
        lastError: null,
        stages: ["Fetching Google Search Console queries"],
       })
       cacheData.searchConsoleStatus = {
        status: "syncing",
        fetchedAt: Date.now(),
       }
       const searchAppearanceOptions = await ytApiQueue.add(() =>
        googleSearchConsoleService.fetchSearchAppearanceOptions(
         storedBinding.siteUrl,
         startDate,
         endDate,
        ),
       )
       const searchConsoleRows = await ytApiQueue.add(() =>
        googleSearchConsoleService.fetchQueryRows(
         storedBinding.siteUrl,
         startDate,
         endDate,
        ),
       )
       const normalizedRows = buildSearchConsoleSearchRows(searchConsoleRows)
       const trafficRows = Array.isArray(cacheData.searchIntelligenceRows)
        ? cacheData.searchIntelligenceRows.filter(
           (row: any) => row?.sourceLane !== "google_search_console",
          )
        : []
       cacheData.searchConsoleBinding = {
        ...storedBinding,
        lastSyncedAt: new Date().toISOString(),
       }
       googleSearchConsoleService.setStoredBinding(cacheData.searchConsoleBinding)
       cacheData.searchConsoleProperties = [
        {
         siteUrl: storedBinding.siteUrl,
         permissionLevel: storedBinding.permissionLevel,
        },
       ]
       cacheData.searchConsoleAppearanceOptions = searchAppearanceOptions
       cacheData.searchIntelligenceRows = [...normalizedRows, ...trafficRows]
       cacheData.searchConsoleStatus = {
        status: "complete",
        fetchedAt: Date.now(),
        rowCount: normalizedRows.length,
       }
       cacheData.searchIntelligenceStatus = {
        status: "complete",
        fetchedAt: Date.now(),
        boundSiteUrl: storedBinding.siteUrl,
        searchConsoleRowCount: normalizedRows.length,
        youtubeSearchRowCount: trafficRows.filter(
         (row: any) => row?.sourceLane === "youtube_search_keyword",
        ).length,
        googleReferralRowCount: trafficRows.filter(
         (row: any) => row?.referralClass === "google_search_referral",
        ).length,
        externalReferralRowCount: trafficRows.filter(
         (row: any) => row?.referralClass === "external_referral",
        ).length,
       }
       cacheData = upsertLedgerEntry(cacheData, {
        source: "google_search_console",
        context: "search_console",
        dimensions: ["query", "page", "date", "device", "country", "searchAppearance"],
        metrics: ["clicks", "impressions", "ctr", "position"],
        payload: searchConsoleRows,
        window: "lifetime",
       })
      } catch (e: any) {
       cacheData.searchConsoleStatus = {
        status: "error",
        fetchedAt: Date.now(),
        reason: e?.message || String(e),
       }
       cacheData.searchIntelligenceStatus = {
        status: "error",
        fetchedAt: Date.now(),
        boundSiteUrl: storedBinding.siteUrl,
        searchConsoleRowCount: 0,
        youtubeSearchRowCount: Array.isArray(cacheData.searchIntelligenceRows)
         ? cacheData.searchIntelligenceRows.filter(
            (row: any) => row?.sourceLane === "youtube_search_keyword",
           ).length
         : 0,
        googleReferralRowCount: Array.isArray(cacheData.searchIntelligenceRows)
         ? cacheData.searchIntelligenceRows.filter(
            (row: any) => row?.referralClass === "google_search_referral",
           ).length
         : 0,
        externalReferralRowCount: Array.isArray(cacheData.searchIntelligenceRows)
         ? cacheData.searchIntelligenceRows.filter(
            (row: any) => row?.referralClass === "external_referral",
           ).length
         : 0,
        reason: e?.message || String(e),
       }
       console.error("Search Console sync ERROR:", e?.message || e)
      }
     }
    }

    try {
     this.emitSyncStatus({
      ...syncStatusBase,
      phase: "syncing",
      completedAt: null,
      lastError: null,
      stages: ["Fetching geography analytics"],
     })
     const geography = await ytApiQueue.add(() =>
      fetchGeographyAnalytics(startDate, endDate, profile.id),
     )
     if (geography) {
      cacheData = upsertLedgerEntry(cacheData, {
       source: "youtube_analytics_v2",
       context: "geography",
       dimensions: ["country"],
       metrics: (geography.columnHeaders || []).map((h: any) => h.name),
       payload: geography,
       window: "lifetime",
      })
      cacheData.geography = geography
     }
    } catch (e: any) {
     console.error("Geography Analytics API ERROR:", e?.message || e)
    }
    cacheData.deepSegmentsStatus = {
     status: "complete",
     mode: enrichmentMode,
     fetchedAt: Date.now(),
    }
   } else {
    cacheData.deepSegmentsStatus = {
     status: "deferred",
     mode: enrichmentMode,
     reason: "Traffic, audience, and geography are manual enrichment passes.",
     fetchedAt: Date.now(),
    }
   }

   if (shouldSyncSegmentDatasets) {
    try {
     this.emitSyncStatus({
      ...syncStatusBase,
      phase: "syncing",
      completedAt: null,
      lastError: null,
      stages: [
       "Fetching segment datasets",
       segmentSelection.join(", "),
      ],
     })
     await this.syncSegmentDatasets(
      cacheData,
      profile.id,
      startDate,
      endDate,
      targetVideoIds,
      segmentSelection,
     )
    } catch (e: any) {
     console.error("Segment datasets sync ERROR:", e?.message || e)
    }
   }

   if (shouldSyncVideoMetrics) {
    try {
     this.emitSyncStatus({
      ...syncStatusBase,
      phase: "syncing",
      completedAt: null,
      lastError: null,
      stages: ["Fetching daily metrics"],
     })
     const dailyMetrics = await ytApiQueue.add(() =>
      fetchDailyAnalytics(startDate, endDate, profile.id),
     )
     if (dailyMetrics) {
      cacheData = upsertLedgerEntry(cacheData, {
       source: "youtube_analytics_v2",
       context: "channel",
       dimensions: ["day"],
       metrics: (dailyMetrics.columnHeaders || []).map((h: any) => h.name),
       payload: dailyMetrics,
       window: "lifetime",
      })
      cacheData.dailyMetrics = dailyMetrics
      cacheData.dailyMetricsStatus = {
       status: "complete",
       requestedAction: requestedAction || "video_metrics",
       enrichmentMode,
       fetchedAt: Date.now(),
       rowCount: Array.isArray(dailyMetrics.rows) ? dailyMetrics.rows.length : 0,
       columnCount: Array.isArray(dailyMetrics.columnHeaders)
        ? dailyMetrics.columnHeaders.length
        : 0,
      }
      window.dispatchEvent(
       new CustomEvent("yt_daily_metrics_synced", {
        detail: cacheData.dailyMetricsStatus,
       }),
      )
     }
    } catch (e: any) {
     console.error("Daily Metrics API ERROR:", e?.message || e)
     cacheData.dailyMetricsStatus = {
      status: "error",
      requestedAction: requestedAction || "video_metrics",
      enrichmentMode,
      fetchedAt: Date.now(),
      rowCount: 0,
      columnCount: 0,
      reason: e?.message || String(e),
     }
    }
   } else if (requestedAction === "daily_metrics") {
    cacheData.dailyMetricsStatus = {
     status: "deferred",
     requestedAction,
     enrichmentMode,
     fetchedAt: Date.now(),
     rowCount: Array.isArray(cacheData.dailyMetrics?.rows)
      ? cacheData.dailyMetrics.rows.length
      : 0,
     columnCount: Array.isArray(cacheData.dailyMetrics?.columnHeaders)
      ? cacheData.dailyMetrics.columnHeaders.length
      : 0,
     reason: "Daily metrics currently run through the shared video-metrics enrichment path.",
    }
   }

   if (cacheData.videoContentType) {
    const statsMap: Record<string, any> = cacheData.stats || {}
    Object.keys(statsMap).forEach((videoId) => {
     const contentType = cacheData.videoContentType[videoId]
     if (contentType) {
      statsMap[videoId].contentType = contentType
      const durationSeconds = Number(statsMap[videoId].durationSeconds || 0)
      const hadShortSignal = statsMap[videoId].isShort === true
      const normalizedContentType = String(contentType).toLowerCase()
      statsMap[videoId].isShort =
       durationSeconds > 180 ? false : normalizedContentType.includes("short") || hadShortSignal
     }
    })
    cacheData.stats = statsMap
   }

   cacheData.lastSynced = Date.now()

   const summary = {
    runAt: new Date().toISOString(),
    cacheBytesBefore: 0,
    cacheBytesAfter: 0,
    videoCount: Array.isArray(cacheData.videos) ? cacheData.videos.length : 0,
    statsCount:
     cacheData.stats && typeof cacheData.stats === "object"
      ? Object.keys(cacheData.stats).length
      : 0,
   dataApiCallCounts: getYouTubeApiCallCounts(),
   warning: undefined as string | undefined,
   analyticsVerification: this.buildAnalyticsVerificationSnapshot(cacheData),
  }

   try {
    const nextRaw = JSON.stringify(cacheData)
    summary.cacheBytesAfter = this.byteLength(nextRaw)
    cacheData.syncRunSummary = summary
   } catch {
    // Ignore
   }

   try {
    writeYouTubeAnalyticsCache(cacheData)
    localStorage.setItem("yt_analytics_last_sync", new Date().toISOString())
   } catch (e) {
    console.error("Failed to write final sync cache:", e)
   }

   window.dispatchEvent(
    new CustomEvent("yt_analytics_synced", { detail: cacheData }),
   )
   this.emitSyncStatus({
    ...syncStatusBase,
    phase: "complete",
    completedAt: new Date().toISOString(),
    lastError: null,
    stages: ["YouTube sync complete"],
   })
  } catch (error: any) {
   console.error("Failed to sync YouTube analytics:", error)

   const isAuthError =
    error?.message?.includes("session has expired") ||
    error?.message?.includes("invalid") ||
    error?.code === 401

   if (isAuthError) {
    disconnectChannel()
   }
   this.emitSyncStatus({
    ...syncStatusBase,
    phase: "error",
    completedAt: new Date().toISOString(),
    lastError: isAuthError
     ? "Your YouTube connection needs to be reconnected before this sync can continue."
     : error?.message || "Something interrupted the sync before it could finish.",
    stages: ["YouTube sync failed"],
   })
   throw error
  }
 }

 public async syncGA4(startDate: string, endDate: string): Promise<boolean> {
  const cached = localStorage.getItem(GA4_STORAGE_KEY)
  let ga4State: GA4SyncState = {
   connected: false,
   properties: [],
   selectedProperty: null,
   lastSynced: null,
   data: {
    overview: null,
    trafficSources: [],
    topPages: [],
    demographics: {
     ageGroups: [],
     countries: [],
     cities: [],
    },
    conversions: [],
   },
  }

  if (cached) {
   try {
    const parsed = JSON.parse(cached)
    ga4State = { ...ga4State, ...parsed }
   } catch (e) {
    console.warn("GA4 Sync: Corrupt ga4_properties_cache", e)
   }
  }

  if (!ga4State.selectedProperty) {
   console.warn("No GA4 property selected")
   return false
  }

  const syncStatusBase: Omit<
   ChannelAnalysisSyncStatus,
   "phase" | "completedAt" | "lastError"
  > = {
   startedAt: new Date().toISOString(),
   stages: ["Preparing GA4 sync run"],
  }
  this.emitSyncStatus({
   ...syncStatusBase,
   phase: "syncing",
   completedAt: null,
   lastError: null,
  })

  try {
   const propertyId = ga4State.selectedProperty

   const [overview, trafficSources, topPages, demographics, conversions] = await Promise.all([
    ga4Service.getWebsiteOverview(propertyId, startDate, endDate),
    ga4Service.getTrafficSources(propertyId, startDate, endDate),
    ga4Service.getTopPages(propertyId, startDate, endDate),
    ga4Service.getUserDemographics(propertyId, startDate, endDate),
    ga4Service.getConversions(propertyId, startDate, endDate),
   ])

   if (overview) {
    const analyticsCache = upsertLedgerEntry(readYouTubeAnalyticsCache(), {
     source: "ga4",
     context: "channel",
     dimensions: ["day"],
     metrics: (overview.columnHeaders || []).map((h: any) => h.name),
     payload: overview,
    })
    writeYouTubeAnalyticsCache(analyticsCache)
   }

   ga4State.data = {
    overview,
    trafficSources,
    topPages,
    demographics,
    conversions,
   }

   ga4State.lastSynced = Date.now()
   localStorage.setItem(GA4_DATA_KEY, JSON.stringify(ga4State.data))
   localStorage.setItem(GA4_STORAGE_KEY, JSON.stringify({
    connected: ga4State.connected,
    properties: ga4State.properties,
    selectedProperty: ga4State.selectedProperty,
    lastSynced: ga4State.lastSynced,
   }))

   window.dispatchEvent(new CustomEvent("ga4_data_synced", {
    detail: ga4State.data
   }))

   this.emitSyncStatus({
    ...syncStatusBase,
    phase: "complete",
    completedAt: new Date().toISOString(),
    lastError: null,
    stages: ["GA4 sync complete"],
   })

   return true
  } catch (error: any) {
   console.error("GA4 sync failed:", error)
   this.emitSyncStatus({
    ...syncStatusBase,
    phase: "error",
    completedAt: new Date().toISOString(),
    lastError: error?.message || "Unknown GA4 sync error",
    stages: ["GA4 sync failed"],
   })
   return false
  }
 }

 public async syncAll(force = false) {
  const now = new Date()
  const endDate = this.toIsoDate(now)
  const start = new Date(now)
  start.setDate(start.getDate() - 90)
  const startDate = this.toIsoDate(start)

  await Promise.allSettled([
   this.syncYouTube(force),
   this.syncGA4(startDate, endDate),
  ])
 }

 public startAutoSync(intervalMinutes = 30) {
  const isAutoSyncEnabled = () => localStorage.getItem("vt_auto_sync_enabled") === "true"
  if (!isAutoSyncEnabled()) return
  if (this.syncInterval) return

  this.syncAll()

  this.syncInterval = window.setInterval(
   () => {
    this.syncAll(true)
   },
   intervalMinutes * 60 * 1000,
  )
 }

 public stopAutoSync() {
  if (this.syncInterval) {
   clearInterval(this.syncInterval)
   this.syncInterval = null
  }
 }
}

export const syncCoordinator = SyncCoordinator.getInstance()
