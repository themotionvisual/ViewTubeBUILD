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

let syncInterval: number | null = null

const isAutoSyncEnabled = (): boolean =>
 localStorage.getItem("vt_auto_sync_enabled") === "true"

const WINDOW_DAY_LOOKBACK: Record<Exclude<AnalyticsWindow, "lifetime">, number> = {
 "7d": 7,
 "28d": 28,
 "90d": 90,
 "365d": 365,
}

const toIsoDate = (date: Date): string => date.toISOString().split("T")[0]

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

export const performSync = async (force = false) => {
 if (!isChannelConnected()) return

 // Smart Cache Check
 let prevCache: Record<string, any> = {}
 try {
  prevCache = JSON.parse(localStorage.getItem("yt_analytics_cache") || "{}")
 } catch (error) {
  console.warn("Analytics Sync: Corrupt yt_analytics_cache, resetting.", error)
  prevCache = {}
  localStorage.removeItem("yt_analytics_cache")
 }
 if (
  !force &&
  prevCache.lastSynced &&
  Date.now() - prevCache.lastSynced < 4 * 60 * 60 * 1000
 ) {
  console.log("Analytics Sync: Using fresh cache (less than 4 hours old).")
  return
 }

 let cacheData: Record<string, any> = {
  ...prevCache,
  lastSynced: prevCache.lastSynced || null,
 }

 try {
  const profile = await ytApiQueue.add(() => fetchChannelProfile())
  cacheData.profile = profile

  let videos: any[] = []
  let stats: Record<string, any> = {}

  try {
   videos = await ytApiQueue.add(() =>
    fetchVideoList(5000, undefined, profile.uploadsPlaylistId),
   )
   if (videos.length > 0) cacheData.videos = videos

   const videoIds = videos.map((v) => v.videoId)
   if (videoIds.length > 0) {
    const [rawStats, shortsPlaylistIds] = await Promise.all([
     ytApiQueue.add(() => fetchVideoStats(videoIds)),
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

     stats[s.videoId] = {
      viewCount: parseInt(s.views),
      likeCount: parseInt(s.likes),
      commentCount: parseInt(s.comments),
      durationSeconds: durationSeconds,
      durationRaw: s.duration,
      privacyStatus: s.privacyStatus || "",
      title: s.title || "",
      description: s.description || "",
      tags: Array.isArray(s.tags) ? s.tags : [],
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

  const fallbackLifetimeStart = new Date(analyticsEndDate)
  fallbackLifetimeStart.setFullYear(fallbackLifetimeStart.getFullYear() - 10)

  const lifetimeStart = earliestVideoDate || fallbackLifetimeStart
  const windowRanges = buildWindowRanges(analyticsEndDate, lifetimeStart)
  const targetVideoIds = videos
   .map((video) => String(video?.videoId || "").trim())
   .filter(Boolean)

  cacheData.analyticsByWindow = {
   ...(cacheData.analyticsByWindow || {}),
  }
  cacheData.availabilityByWindow = {
   ...(cacheData.availabilityByWindow || {}),
  }
  cacheData.lastSyncedByWindow = {
   ...(cacheData.lastSyncedByWindow || {}),
  }

  for (const window of ANALYTICS_WINDOWS) {
   const range = windowRanges[window]
   try {
    const analytics = await ytApiQueue.add(() =>
     fetchAnalytics(range.startDate, range.endDate, profile.id, {
      window,
      targetVideoIds,
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
    }
    cacheData.availabilityByWindow[window] = computeMetricAvailability(report)
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
  localStorage.setItem("yt_analytics_cache", JSON.stringify(cacheData))
  localStorage.setItem("yt_analytics_last_sync", new Date().toISOString())

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
 } catch (error: any) {
  console.error("Failed to sync YouTube analytics:", error)
  window.dispatchEvent(
   new CustomEvent("yt_analytics_synced", { detail: cacheData }),
  )
  if (error?.message?.includes("session has expired") || error?.code === 401) {
   disconnectChannel()
  }
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
