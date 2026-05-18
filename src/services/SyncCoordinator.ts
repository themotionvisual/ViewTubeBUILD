import {
 fetchChannelProfile,
 fetchVideoList,
 fetchVideoStats,
 fetchAnalytics,
 fetchChannelAnalytics,
 fetchShortsPlaylistIds,
 fetchVideoContentType,
 fetchDemographicAnalytics,
 fetchTrafficSourceAnalytics,
 fetchDailyAnalytics,
 fetchGeographyAnalytics,
 fetchGlobalLifetimeAnalytics,
 resetYouTubeApiCallCounts,
 getYouTubeApiCallCounts,
 isChannelConnected,
 disconnectChannel,
} from "./youtubeService"
import {
  syncCoreLifetimeData,
  syncDeepVideoData,
  CORE_METRICS,
  type CoreSyncResult,
} from "./youtube/coreLifetimeSync"
import { ga4Service, type GA4Property } from "./ga4Service"
import { commitToLedger } from "./canonicalAnalyticsStore"
import { parseDurationSeconds } from "./dataUtils"
import { ytApiQueue } from "../utils/RequestQueue"
import {
 ANALYTICS_WINDOWS,
 type AnalyticsWindow,
 canonicalMetricOrder,
 getMetricByAliases,
} from "./analyticsContract"
import type { ChannelAnalysisSyncStatus, VideoSyncBatchState } from "../types"

const YT_ANALYTICS_CACHE_KEY = "yt_analytics_cache"
const GA4_STORAGE_KEY = "ga4_properties_cache"
const GA4_DATA_KEY = "ga4_analytics_cache"
const ANALYTICS_SCHEMA_VERSION_KEY = "vt_analytics_schema_version"
const ANALYTICS_SCHEMA_VERSION = 4
const VIDEO_SYNC_BATCH_STATE_KEY = "vt_video_sync_batch_state"
const SYNC_MERGE_POLICY_KEY = "vt_sync_merge_policy"
const OPTIONAL_VIDEO_METRICS_STORAGE_KEY = "vt_optional_video_metrics_enabled"

const DEFAULT_VIDEO_SYNC_BATCH_STATE: VideoSyncBatchState = {
 initialLimit: Infinity,
 incrementSize: 250,
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

 private constructor() {}

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
   return {
    initialLimit:
     typeof parsed.initialLimit === "number"
      ? parsed.initialLimit
      : DEFAULT_VIDEO_SYNC_BATCH_STATE.initialLimit,
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
  options: { batchMode?: "initial" | "next" } = {},
 ) {
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
  let prevCacheRaw = "{}"
  try {
   prevCacheRaw = localStorage.getItem(YT_ANALYTICS_CACHE_KEY) || "{}"
   prevCache = JSON.parse(prevCacheRaw)
  } catch (error) {
   console.warn("YouTube Sync: Corrupt yt_analytics_cache, resetting.", error)
   prevCache = {}
   localStorage.removeItem(YT_ANALYTICS_CACHE_KEY)
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
   const maxVideos = isNextBatch
    ? batchState.cursor + batchState.incrementSize
    : Infinity

   let coreSyncResult: CoreSyncResult | null = null
   try {
    coreSyncResult = await syncCoreLifetimeData(maxVideos)
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
     id: coreSyncResult.channelId,
     statistics: coreSyncResult.channelStats,
     uploadsPlaylistId: coreSyncResult.uploadsPlaylistId,
     ...(prevCache.profile || {}),
    }
    cacheData.profile = profile

    // Convert CoreVideoBaseline to the existing cache format
    const existingVideos =
     Array.isArray(prevCache.videos) ? prevCache.videos : []
    const coreVideos = coreSyncResult.videoBaseline.map((v) => ({
     videoId: v.videoId,
     title: v.title,
     publishedAt: v.publishedAt,
     thumbnail: v.thumbnail,
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
      durationSeconds: v.duration,
      durationRaw: v.durationRaw,
      privacyStatus: v.privacyStatus,
      isShort: v.isShort,
      format: v.format,
      hasAnalytics: v.hasAnalytics,
      subscriberCount: v.dataApiStats.subscribers,
      ...(v.analyticsMetrics || {}),
     }
    })
    if (Object.keys(stats).length > 0) cacheData.stats = stats

    // Commit core analytics to the canonical ledger
    if (coreSyncResult.analytics.videos?.rows?.length > 0) {
     commitToLedger({
      source: "youtube_analytics_v2",
      context: "video",
      dimensions: ["video"],
      metrics: (coreSyncResult.analytics.videos.columnHeaders || []).map((h: any) => h.name),
      payload: coreSyncResult.analytics.videos,
      window: "lifetime",
     })
    }
    if (coreSyncResult.analytics.channel?.rows?.length > 0) {
     commitToLedger({
      source: "youtube_analytics_v2",
      context: "channel",
      dimensions: [],
      metrics: (coreSyncResult.analytics.channel.columnHeaders || []).map((h: any) => h.name),
      payload: coreSyncResult.analytics.channel,
      window: "lifetime",
     })
     cacheData.globalLifetime = coreSyncResult.analytics.channel
    }

    // Update batch state
    const nextBatchState: VideoSyncBatchState = {
     ...batchState,
     cursor: videos.length,
     lastBatchCount: Math.max(0, coreSyncResult.videoBaseline.length),
     hasMore: coreSyncResult.videoBaseline.length >= maxVideos,
    }
    this.persistVideoSyncBatchState(nextBatchState)
    cacheData.videoSyncBatch = nextBatchState
    cacheData.coreSyncTiming = coreSyncResult.timing

    this.emitSyncStatus({
     ...syncStatusBase,
     phase: "syncing",
     completedAt: null,
     lastError: null,
     stages: [
      `Core sync complete (${coreSyncResult.timing.phase1Ms}ms)`,
      "Proceeding to window-based analytics",
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
      }),
     )

     if (analytics?.report) {
      commitToLedger({
       source: "youtube_analytics_v2",
       context: "video",
       dimensions: ["video"],
       metrics: (analytics.report.columnHeaders || []).map((h: any) => h.name),
       payload: analytics.report,
       window: window,
      })
     }

     if (window === "lifetime") {
      try {
       const globalLifetime = await ytApiQueue.add(() =>
        fetchGlobalLifetimeAnalytics(range.startDate, range.endDate, profile.id),
       )
       if (globalLifetime) {
        commitToLedger({
         source: "youtube_analytics_v2",
         context: "channel",
         dimensions: [],
         metrics: (globalLifetime.columnHeaders || []).map((h: any) => h.name),
         payload: globalLifetime,
         window: "lifetime",
        })
        cacheData.globalLifetime = globalLifetime
       }
      } catch (e) {
       console.warn("Global lifetime analytics fetch failed:", e)
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

   const overviewRange = windowRanges["lifetime"]
   const startDate = overviewRange.startDate
   const endDate = overviewRange.endDate

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
     commitToLedger({
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
     commitToLedger({
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

   try {
    this.emitSyncStatus({
     ...syncStatusBase,
     phase: "syncing",
     completedAt: null,
     lastError: null,
     stages: ["Fetching traffic sources"],
    })
    const trafficSources = await ytApiQueue.add(() =>
     fetchTrafficSourceAnalytics(startDate, endDate, profile.id),
    )
    if (trafficSources) {
     commitToLedger({
      source: "youtube_analytics_v2",
      context: "traffic_source",
      dimensions: ["insightTrafficSourceType"],
      metrics: (trafficSources.columnHeaders || []).map((h: any) => h.name),
      payload: trafficSources,
      window: "lifetime",
     })
     cacheData.trafficSources = trafficSources
    }
   } catch (e: any) {
    console.error("Traffic Source Analytics API ERROR:", e?.message || e)
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
     commitToLedger({
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
     commitToLedger({
      source: "youtube_analytics_v2",
      context: "channel",
      dimensions: ["day"],
      metrics: (dailyMetrics.columnHeaders || []).map((h: any) => h.name),
      payload: dailyMetrics,
      window: "lifetime",
     })
     cacheData.dailyMetrics = dailyMetrics
    }
   } catch (e: any) {
    console.error("Daily Metrics API ERROR:", e?.message || e)
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
    cacheBytesBefore: this.byteLength(prevCacheRaw),
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

   let nextRaw = ""
   try {
    nextRaw = JSON.stringify(cacheData)
    summary.cacheBytesAfter = this.byteLength(nextRaw)
    cacheData.syncRunSummary = summary
   } catch {
    // Ignore
   }

   try {
    if (!nextRaw) nextRaw = JSON.stringify(cacheData)
    localStorage.setItem(YT_ANALYTICS_CACHE_KEY, nextRaw)
    localStorage.setItem("yt_analytics_last_sync", new Date().toISOString())
   } catch (e) {
    if (!this.isQuotaExceededError(e)) throw e

    summary.warning =
     "Cache too large for localStorage; storing minimal snapshot (profile/videos/lastSynced only)."

    const minimalCache = {
     profile: cacheData.profile,
     videos: cacheData.videos,
     lastSynced: cacheData.lastSynced,
     lastSyncedByWindow: cacheData.lastSyncedByWindow,
     videoContentTypeStatus: cacheData.videoContentTypeStatus,
     syncRunSummary: summary,
    }

    try {
     localStorage.setItem(YT_ANALYTICS_CACHE_KEY, JSON.stringify(minimalCache))
     localStorage.setItem("yt_analytics_last_sync", new Date().toISOString())
    } catch (e2) {
     console.warn("Failed to write minimal yt_analytics_cache snapshot:", e2)
    }
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
     ? "Authentication required: Please reconnect your channel."
     : error?.message || "Unknown sync error",
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
    commitToLedger({
     source: "ga4",
     context: "channel",
     dimensions: ["day"],
     metrics: (overview.columnHeaders || []).map((h: any) => h.name),
     payload: overview,
    })
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
