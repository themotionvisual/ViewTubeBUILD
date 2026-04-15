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
 resetYouTubeApiCallCounts,
 getYouTubeApiCallCounts,
 isChannelConnected,
 disconnectChannel,
} from "./youtubeService"
import { ytApiQueue } from "../utils/RequestQueue"
import {
 ANALYTICS_WINDOWS,
 type AnalyticsWindow,
 canonicalMetricOrder,
 getMetricByAliases,
} from "./analyticsContract"
import type {
 ChannelAnalysisSyncStatus,
 VideoSyncBatchState,
} from "../types"

let syncInterval: number | null = null

const isAutoSyncEnabled = (): boolean =>
 localStorage.getItem("vt_auto_sync_enabled") === "true"

const OPTIONAL_VIDEO_METRICS_STORAGE_KEY = "vt_optional_video_metrics_enabled"
const SYNC_MERGE_POLICY_KEY = "vt_sync_merge_policy"
const VIDEO_SYNC_BATCH_STATE_KEY = "vt_video_sync_batch_state"
const ANALYTICS_SCHEMA_VERSION_KEY = "vt_analytics_schema_version"
const ANALYTICS_SCHEMA_VERSION = 2

const DEFAULT_VIDEO_SYNC_BATCH_STATE: VideoSyncBatchState = {
 initialLimit: 500,
 incrementSize: 250,
 cursor: 0,
 hasMore: true,
 lastBatchCount: 0,
}

type SyncMergePolicy = "merge" | "latest_only"

const getStoredSyncMergePolicy = (): SyncMergePolicy => {
 try {
  const raw = localStorage.getItem(SYNC_MERGE_POLICY_KEY)
  if (raw === "latest_only") return "latest_only"
 } catch {
  // no-op
 }
 return "merge"
}

const isOptionalVideoMetricsEnabled = (): boolean => {
 try {
  const raw = localStorage.getItem(OPTIONAL_VIDEO_METRICS_STORAGE_KEY)
  // Default ON so CTR/impression-dependent charts (value matrix, trigger charts)
  // receive the required video-level metrics without extra user setup.
  if (raw == null) return true
  return raw === "1" || raw === "true"
 } catch {
  return true
 }
}

const WINDOW_DAY_LOOKBACK: Record<Exclude<AnalyticsWindow, "lifetime">, number> = {
 "7d": 7,
 "28d": 28,
 "90d": 90,
 "365d": 365,
}

const toIsoDate = (date: Date): string => date.toISOString().split("T")[0]

const byteLength = (value: string): number => {
 try {
  return new TextEncoder().encode(value).length
 } catch {
  // Fallback; not exact for non-ascii, but good enough for diagnostics.
  return value.length
 }
}

type SyncRunSummary = {
 runAt: string
 cacheBytesBefore: number
 cacheBytesAfter: number
 videoCount: number
 statsCount: number
 dataApiCallCounts: ReturnType<typeof getYouTubeApiCallCounts>
 warning?: string
}

const isQuotaExceededError = (error: unknown): boolean => {
 if (typeof error !== "object" || error === null) return false
 const message =
  "message" in error && typeof (error as { message?: unknown }).message === "string"
   ? String((error as { message?: unknown }).message)
   : ""
 return message.toLowerCase().includes("exceeded the quota")
}

const buildWindowRanges = (
 endDate: Date,
 lifetimeStart: Date,
): Record<AnalyticsWindow, { startDate: string; endDate: string }> => {
 const ranges = {} as Record<AnalyticsWindow, { startDate: string; endDate: string }>
 const end = toIsoDate(endDate)

 ANALYTICS_WINDOWS.forEach((window) => {
  if (window === "lifetime") {
   ranges[window] = { startDate: toIsoDate(lifetimeStart), endDate: end }
   return
  }

  const days = WINDOW_DAY_LOOKBACK[window]
  const start = new Date(endDate)
  start.setDate(start.getDate() - (days - 1))
  ranges[window] = { startDate: toIsoDate(start), endDate: end }
 })

 return ranges
}

const loadVideoSyncBatchState = (): VideoSyncBatchState => {
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

const persistVideoSyncBatchState = (state: VideoSyncBatchState): void => {
 try {
  localStorage.setItem(VIDEO_SYNC_BATCH_STATE_KEY, JSON.stringify(state))
 } catch {
  // no-op
 }
}

const emitSyncStatus = (
 status: ChannelAnalysisSyncStatus,
): void => {
 window.dispatchEvent(new CustomEvent("vt_channel_sync_status", { detail: status }))
}

const ensureCanonicalSchemaVersion = (): void => {
 try {
  const raw = localStorage.getItem(ANALYTICS_SCHEMA_VERSION_KEY)
  const current = Number(raw || 0)
  if (current === ANALYTICS_SCHEMA_VERSION) return
  localStorage.removeItem("yt_analytics_cache")
  localStorage.setItem(
   ANALYTICS_SCHEMA_VERSION_KEY,
   String(ANALYTICS_SCHEMA_VERSION),
  )
 } catch {
  // no-op
 }
}

const reportRowsToObjects = (report: any): Record<string, unknown>[] => {
 if (!report || !Array.isArray(report.rows)) return []
 if (!Array.isArray(report.columnHeaders)) {
  return report.rows.filter(
   (row: unknown): row is Record<string, unknown> =>
    !!row && typeof row === "object" && !Array.isArray(row),
  )
 }

 const headers = report.columnHeaders.map(
  (header: { name?: string }, _index: number) =>
   String(header?.name || ""),
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

const computeMetricAvailability = (
 report: any,
): Partial<Record<(typeof canonicalMetricOrder)[number], boolean>> => {
 const rows = reportRowsToObjects(report)
 const availability: Partial<Record<(typeof canonicalMetricOrder)[number], boolean>> = {}

 canonicalMetricOrder.forEach((metricKey) => {
  availability[metricKey] = rows.some((row) => {
   const match = getMetricByAliases(row, metricKey)
   return match.found
  })
 })

 return availability
}

export const performSync = async (
 force = false,
 options: { batchMode?: "initial" | "next" } = {},
) => {
 if (!isChannelConnected()) return
 ensureCanonicalSchemaVersion()

 const syncStatusBase: Omit<ChannelAnalysisSyncStatus, "phase" | "completedAt" | "lastError"> =
  {
   startedAt: new Date().toISOString(),
   stages: ["Preparing sync run"],
  }
 emitSyncStatus({
  ...syncStatusBase,
  phase: "syncing",
  completedAt: null,
  lastError: null,
 })

 // Smart Cache Check
 let prevCache: Record<string, any> = {}
 let prevCacheRaw = "{}"
 try {
  prevCacheRaw = localStorage.getItem("yt_analytics_cache") || "{}"
  prevCache = JSON.parse(prevCacheRaw)
 } catch (error) {
  console.warn("Analytics Sync: Corrupt yt_analytics_cache, resetting.", error)
  prevCache = {}
  localStorage.removeItem("yt_analytics_cache")
 }

 const mergePolicy = getStoredSyncMergePolicy()
 if (
  !force &&
  prevCache.lastSynced &&
  Date.now() - prevCache.lastSynced < 4 * 60 * 60 * 1000
 ) {
  console.log("Analytics Sync: Using fresh cache (less than 4 hours old).")
  emitSyncStatus({
   ...syncStatusBase,
   phase: "complete",
   completedAt: new Date().toISOString(),
   lastError: null,
   stages: ["Cache fresh, sync skipped"],
  })
  return
 }

 const shouldStartFresh = mergePolicy === "latest_only"
 let cacheData: Record<string, any> = shouldStartFresh
  ? { lastSynced: null }
  : {
     ...prevCache,
     lastSynced: prevCache.lastSynced || null,
    }

 try {
  resetYouTubeApiCallCounts()
  const profile = await ytApiQueue.add(() => fetchChannelProfile())
  cacheData.profile = profile

  let videos: any[] = []
  let stats: Record<string, any> =
   !shouldStartFresh && cacheData.stats && typeof cacheData.stats === "object"
    ? (cacheData.stats as Record<string, any>)
    : {}

  try {
   const batchState = loadVideoSyncBatchState()
   const isNextBatch = options.batchMode === "next"
   const existingVideos =
    !shouldStartFresh && Array.isArray(prevCache.videos) ? prevCache.videos : []
   const batchLimit = isNextBatch
    ? batchState.cursor + batchState.incrementSize
    : batchState.initialLimit
   const incrementalMax =
    existingVideos.length > 0
     ? Math.max(batchLimit, existingVideos.length)
     : batchLimit
   emitSyncStatus({
    ...syncStatusBase,
    phase: "syncing",
    completedAt: null,
    lastError: null,
    stages: [
     "Fetching profile",
     `Fetching videos (${isNextBatch ? "next +250" : "initial 500"})`,
    ],
   })
   const fetchedVideos = await ytApiQueue.add(() =>
    fetchVideoList(incrementalMax, undefined, profile.uploadsPlaylistId, {
     allowSearchFallback: false,
    }),
   )

   if (existingVideos.length > 0 && fetchedVideos.length === 0) {
    // Keep existing cached list if incremental fetch fails/returns nothing.
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

    const fetchedIds = new Set<string>(fetchedVideos.map((v: any) => String(v?.videoId || "").trim()).filter(Boolean))
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
   persistVideoSyncBatchState(nextBatchState)
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

    const idsToFetch = Array.from(new Set<string>([...missingIds, ...recentIds].filter(Boolean)))
    const [rawStats, shortsPlaylistIds] = await Promise.all([
     ytApiQueue.add(() => (idsToFetch.length > 0 ? fetchVideoStats(idsToFetch) : Promise.resolve([]))),
     ytApiQueue.add(() => fetchShortsPlaylistIds(profile.id)),
    ])

    rawStats.forEach((s) => {
     let durationSeconds = 0
     if (s.duration.startsWith("PT")) {
      const match = s.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (match) {
       durationSeconds =
        parseInt(match[1] || "0") * 3600 +
        parseInt(match[2] || "0") * 60 +
        parseInt(match[3] || "0")
      }
     } else {
      durationSeconds = parseInt(s.duration) || 0
     }

     const existing = stats[s.videoId] || {}
     stats[s.videoId] = {
      ...existing,
      viewCount: parseInt(s.views),
      likeCount: parseInt(s.likes),
      commentCount: parseInt(s.comments),
      durationSeconds: durationSeconds,
      durationRaw: s.duration,
      privacyStatus: s.privacyStatus || "",
      // Signal-only short detection at ingest time.
      // Duration > 180 is definitively long, but duration <= 180 is not automatically short.
      isShort:
       durationSeconds > 180 ? false : shortsPlaylistIds.has(s.videoId),
      // contentType will be populated from videoContentType cache after fetch
     }
    })
    if (Object.keys(stats).length > 0) cacheData.stats = stats
   }
  } catch (e) {
   console.warn("Video list or public stats fetch failed:", e)
  }

  const now = new Date()
  const analyticsEndDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

  const earliestVideoDate = videos
   .map((video) => new Date(video?.publishedAt || ""))
   .filter((date) => !Number.isNaN(date.getTime()))
   .sort((a, b) => a.getTime() - b.getTime())[0]

  const channelPublishedDate = new Date((profile as { publishedAt?: string })?.publishedAt || "")
  const hasChannelPublishedDate = !Number.isNaN(channelPublishedDate.getTime())
  const youtubeEpoch = new Date("2005-02-14T00:00:00.000Z")
  const lifetimeStart =
   (hasChannelPublishedDate ? channelPublishedDate : null) ||
   earliestVideoDate ||
   youtubeEpoch
  const windowRanges = buildWindowRanges(analyticsEndDate, lifetimeStart)
  const targetVideoIds = videos
   .map((video) => String(video?.videoId || "").trim())
   .filter(Boolean)

  cacheData.analyticsByWindow = shouldStartFresh ? {} : { ...(cacheData.analyticsByWindow || {}) }
  cacheData.availabilityByWindow = shouldStartFresh
   ? {}
   : {
      ...(cacheData.availabilityByWindow || {}),
     }
  cacheData.metricCapabilitiesByWindow = shouldStartFresh
   ? {}
   : {
      ...(cacheData.metricCapabilitiesByWindow || {}),
     }
  cacheData.lastSyncedByWindow = shouldStartFresh
   ? {}
   : {
      ...(cacheData.lastSyncedByWindow || {}),
     }

	  const optionalMetricsEnabled = isOptionalVideoMetricsEnabled()

  for (const window of ANALYTICS_WINDOWS) {
	   const range = windowRanges[window]
   try {
    emitSyncStatus({
     ...syncStatusBase,
     phase: "syncing",
     completedAt: null,
     lastError: null,
     stages: [
      "Fetching video analytics",
      `Window ${window.toUpperCase()}`,
     ],
    })
    const analytics = await ytApiQueue.add(() =>
	     fetchAnalytics(range.startDate, range.endDate, profile.id, {
	      window,
	      targetVideoIds,
	      optionalMetricsEnabled,
	     }),
	    )

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
    cacheData.availabilityByWindow[window] = computeMetricAvailability(report)
    cacheData.metricCapabilitiesByWindow[window] = Array.isArray(
     analytics?.metricCapabilities,
    )
     ? analytics.metricCapabilities
     : []
    cacheData.lastSyncedByWindow[window] = Date.now()

    if (window === "lifetime") {
     // Compatibility bridge for existing readers during migration.
     cacheData.analytics = report
    }

    console.log(
     `Video-level analytics (${window}): SUCCESS -`,
     report?.rows?.length || 0,
     "rows",
    )
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

  // Fetch creatorContentType to identify Shorts vs Long videos
  // This is the most reliable method since videos <180s could be either format
  try {
   const contentTypeRange = windowRanges["lifetime"]
   const contentTypeMap = await ytApiQueue.add(() =>
    fetchVideoContentType(
     contentTypeRange.startDate,
     contentTypeRange.endDate,
     profile.id,
    ),
   )
   if (contentTypeMap.size > 0) {
    // Store the contentType map in cache for use in PerformanceHub
    cacheData.videoContentType = Object.fromEntries(contentTypeMap)
    console.log(
     "Video content type detection: SUCCESS -",
     contentTypeMap.size,
     "videos classified",
    )
   }
  } catch (e: any) {
   console.warn("Video content type detection failed:", e?.message || e)
  }

  // Channel-level analytics
  try {
   emitSyncStatus({
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
    cacheData.channelAnalytics = channelAnalytics
    console.log(
     "Channel-level analytics: SUCCESS -",
     channelAnalytics.rows?.length || 0,
     "rows",
    )
   } else {
    console.warn("Channel-level analytics: returned empty data")
   }
  } catch (e: any) {
   console.error("Channel-level Analytics API ERROR:", e?.message || e)
  }

  // Demographic analytics
  try {
   emitSyncStatus({
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
    cacheData.demographics = demographics
    console.log(
     "Demographic analytics: SUCCESS -",
     demographics.rows?.length || 0,
     "rows",
    )
   } else {
    console.warn("Demographic analytics: returned empty data")
   }
  } catch (e: any) {
   console.error("Demographic Analytics API ERROR:", e?.message || e)
  }

  // Traffic Source analytics
  try {
   emitSyncStatus({
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
    cacheData.trafficSources = trafficSources
    console.log(
     "Traffic Source analytics: SUCCESS -",
     trafficSources.rows?.length || 0,
     "rows",
    )
   } else {
    console.warn("Traffic Source analytics: returned empty data")
   }
  } catch (e: any) {
   console.error("Traffic Source Analytics API ERROR:", e?.message || e)
  }

  // Daily metrics
  try {
   emitSyncStatus({
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
    cacheData.dailyMetrics = dailyMetrics
    console.log(
     "Daily metrics: SUCCESS -",
     dailyMetrics.rows?.length || 0,
     "rows",
    )
   } else {
    console.warn("Daily metrics: returned empty data")
   }
  } catch (e: any) {
   console.error("Daily Analytics API ERROR:", e?.message || e)
  }

  // Enrich stats with contentType from videoContentType map
  if (cacheData.videoContentType) {
   const statsMap: Record<string, any> = cacheData.stats || {}
   Object.keys(statsMap).forEach((videoId) => {
    const contentType = cacheData.videoContentType[videoId]
    if (contentType) {
     statsMap[videoId].contentType = contentType
     const durationSeconds = Number(
      statsMap[videoId].durationSeconds || 0,
     )
     const hadShortSignal = statsMap[videoId].isShort === true
     // Definitive/explicit rule:
     // >180s => long
     // <=180s => short only when explicit short signal exists
     statsMap[videoId].isShort =
      durationSeconds > 180
       ? false
       : contentType === "shorts" || hadShortSignal
    }
   })
   cacheData.stats = statsMap
  }

  cacheData.lastSynced = Date.now()

  const summary: SyncRunSummary = {
   runAt: new Date().toISOString(),
   cacheBytesBefore: byteLength(prevCacheRaw),
   cacheBytesAfter: 0,
   videoCount: Array.isArray(cacheData.videos) ? cacheData.videos.length : 0,
   statsCount: cacheData.stats && typeof cacheData.stats === "object" ? Object.keys(cacheData.stats).length : 0,
   dataApiCallCounts: getYouTubeApiCallCounts(),
  }

  let nextRaw = ""
  try {
   nextRaw = JSON.stringify(cacheData)
   summary.cacheBytesAfter = byteLength(nextRaw)
   cacheData.syncRunSummary = summary
  } catch {
   // Ignore; writer below will throw if it can't stringify.
  }

  try {
   if (!nextRaw) nextRaw = JSON.stringify(cacheData)
   localStorage.setItem("yt_analytics_cache", nextRaw)
   localStorage.setItem("yt_analytics_last_sync", new Date().toISOString())
  } catch (e) {
   if (!isQuotaExceededError(e)) throw e

   summary.warning =
    "Cache too large for localStorage; storing minimal snapshot (profile/videos/lastSynced only)."

   const minimalCache = {
    profile: cacheData.profile,
    videos: cacheData.videos,
    lastSynced: cacheData.lastSynced,
    lastSyncedByWindow: cacheData.lastSyncedByWindow,
    syncRunSummary: summary,
   }

   try {
    localStorage.setItem("yt_analytics_cache", JSON.stringify(minimalCache))
    localStorage.setItem("yt_analytics_last_sync", new Date().toISOString())
   } catch (e2) {
    // If even the minimal snapshot cannot be written, surface the failure but don't loop.
    console.warn("Failed to write minimal yt_analytics_cache snapshot:", e2)
   }
  }

  // Log sync summary to console
  console.log("YouTube Analytics Sync Complete:", {
   hasProfile: !!cacheData.profile,
   videoCount: cacheData.videos?.length || 0,
   statsCount: Object.keys(cacheData.stats || {}).length,
   hasAnalytics: !!cacheData.analyticsByWindow?.lifetime?.report,
   windowsSynced: Object.keys(cacheData.analyticsByWindow || {}).length,
   hasChannelAnalytics: !!cacheData.channelAnalytics,
   hasDailyMetrics: !!cacheData.dailyMetrics,
   hasTrafficSources: !!cacheData.trafficSources,
   hasDemographics: !!cacheData.demographics,
   dailyMetricsRows: cacheData.dailyMetrics?.rows?.length || 0,
   channelAnalyticsRows: cacheData.channelAnalytics?.rows?.length || 0,
  })

  window.dispatchEvent(
   new CustomEvent("yt_analytics_synced", { detail: cacheData }),
  )
  emitSyncStatus({
   ...syncStatusBase,
   phase: "complete",
   completedAt: new Date().toISOString(),
   lastError: null,
   stages: ["Sync complete"],
  })
 } catch (error: any) {
  console.error("Failed to sync YouTube analytics:", error)
  window.dispatchEvent(
   new CustomEvent("yt_analytics_synced", { detail: cacheData }),
  )
  if (error?.message?.includes("session has expired") || error?.code === 401) {
   disconnectChannel()
  }
  emitSyncStatus({
   ...syncStatusBase,
   phase: "error",
   completedAt: new Date().toISOString(),
   lastError: error?.message || "Unknown sync error",
   stages: ["Sync failed"],
  })
  throw error
 }
}

export const startAutoSync = (intervalMinutes = 30) => {
 if (!isAutoSyncEnabled()) return
 if (syncInterval) return

 if (isChannelConnected()) {
  performSync() // Initial sync
 }

 syncInterval = window.setInterval(
  () => {
   if (isChannelConnected()) {
    performSync(true) // Force sync on interval
   } else {
    stopAutoSync()
   }
  },
  intervalMinutes * 60 * 1000,
 )
}

export const stopAutoSync = () => {
 if (syncInterval) {
  clearInterval(syncInterval)
  syncInterval = null
 }
}
