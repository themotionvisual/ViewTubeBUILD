/**
 * Core Lifetime Sync — "Fast Boot" Pipeline
 *
 * Phase 1: Channel stats + Video inventory + Core Analytics (instant dashboard)
 * Phase 2: Deep non-core metrics (background, fail-safe)
 */

import {
  refreshTokenIfExpired,
  proxyFetch,
  ANALYTICS_URL,
  BASE_URL,
} from "./youtubeApiClient"
import { parseDurationSeconds } from "../dataUtils"
import {
 fetchShortsPlaylistIds,
 parseChannelHandleFromApi,
} from "./youtubeDataFetcher"
import { updateCanonicalAnalyticsCache } from "../canonicalAnalyticsStore"

// ============================================================================
// 1. METRIC DEFINITIONS
// ============================================================================

/**
 * Core Metrics: High-priority data for the initial dashboard load.
 * Reliable across most video types — the "Vital Signs".
 */
export const CORE_METRICS = [
  "views",
  "estimatedMinutesWatched",
  "engagedViews",
  "comments",
  "likes",
  "dislikes",
  "shares",
  "averageViewDuration",
  "averageViewPercentage",
  "subscribersGained",
  "subscribersLost",
  "estimatedRevenue",
  "grossRevenue",
  "cpm",
  "monetizedPlaybacks",
] as const

/**
 * Deep Metrics: Non-core statistics for advanced analysis.
 * Fetched in secondary phase — often 400s for Shorts or videos without cards/annotations.
 */
export const DEEP_METRICS = [
  "annotationClickThroughRate",
  "annotationCloseRate",
  "annotationImpressions",
  "annotationClickableImpressions",
  "annotationClosableImpressions",
  "annotationClicks",
  "annotationCloses",
  "cardClickRate",
  "cardTeaserClickRate",
  "cardImpressions",
  "cardTeaserImpressions",
  "cardClicks",
  "cardTeaserClicks",
] as const

export type CoreMetric = (typeof CORE_METRICS)[number]
export type DeepMetric = (typeof DEEP_METRICS)[number]

/** Data API: max 50 IDs per videos?id= call */
const BATCH_SIZE = 50

/** Analytics API: 25 IDs per filter to avoid URI length issues with many metrics + many IDs */
const ANALYTICS_BATCH = 25

// ============================================================================
// 2. TYPES
// ============================================================================

export interface CoreSyncChannelStats {
  viewCount: string
  subscriberCount: string
  videoCount: string
  hiddenSubscriberCount: boolean
}

export interface CoreVideoBaseline {
  videoId: string
  title: string
  publishedAt: string
  thumbnail: string
  duration: number
  durationRaw: string
  format: "shorts" | "long"
  isShort: boolean
  privacyStatus: string
  uploadStatus?: string
  definition?: string
  description?: string
  tags?: string[]
  dataApiStats: {
    views: number
    likes: number
    comments: number
    subscribers: string // Channel-level context
  }
  /** Analytics API row for this video, or null if analytics haven't processed yet */
  analytics: any[] | null
  /** Flag: true if Analytics API returned data for this video */
  hasAnalytics: boolean
  lastSyncedAt: string
  analyticsMetrics?: Partial<Record<CoreMetric, number>>
}

export interface CoreSyncResult {
  channelId: string
  uploadsPlaylistId: string
  channelStats: CoreSyncChannelStats
  videoBaseline: CoreVideoBaseline[]
  analytics: {
    channel: any
    videos: any
  }
  timing: {
    phase1Ms: number
  }
}

// ============================================================================
// 3. UTILITIES
// ============================================================================

/** Robust ISO date string — prevents timezone edge-case API errors */
const getIsoDate = (date: Date) => date.toISOString().split("T")[0]

const mergeReportPayloads = (
  payloads: any[],
): { columnHeaders: any[]; rows: any[][] } => {
  let headers: any[] = []
  const allRows: any[][] = []

  payloads.forEach((payload) => {
    if (
      !payload ||
      !Array.isArray(payload.columnHeaders) ||
      !Array.isArray(payload.rows)
    ) {
      return
    }
    if (headers.length === 0) {
      headers = payload.columnHeaders.map((h: any) => ({
        name: String(h?.name || ""),
      }))
    }
    payload.rows.forEach((row: any) => {
      if (Array.isArray(row)) allRows.push(row)
    })
  })

  return { columnHeaders: headers, rows: allRows }
}

// ============================================================================
// 4. PHASE 1: CORE LIFETIME SYNC
// ============================================================================

/**
 * syncAuthoritativeMetadata
 * Fetches the official YouTube Channel API statistics.
 * This is the "Ground Truth" for subscriber count and video count.
 * Dispatches a custom event for immediate UI updates.
 */
export const syncAuthoritativeMetadata = async (): Promise<any> => {
  const token = await refreshTokenIfExpired()
  if (!token) throw new Error("Unauthorized")

  console.log("🎯 SYNCING AUTHORITATIVE CHANNEL METADATA...")

  const channelRes = await proxyFetch(
    `${BASE_URL}/channels?part=snippet,statistics,brandingSettings,contentDetails&mine=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!channelRes.ok) {
    throw new Error(`Failed to fetch channel profile: ${channelRes.status}`)
  }

  const data = await channelRes.json()
  if (!data.items || data.items.length === 0) {
    throw new Error("No channel found for this user.")
  }

  const channel = data.items[0]
  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads || ""
  
  const officialStats = {
    channelId: channel.id,
    uploadsPlaylistId,
    title: channel.snippet.title,
    customUrl: parseChannelHandleFromApi(channel),
    thumbnail: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.default?.url,
    statistics: {
      viewCount: channel.statistics.viewCount,
      subscriberCount: channel.statistics.subscriberCount,
      videoCount: channel.statistics.videoCount,
      hiddenSubscriberCount: channel.statistics.hiddenSubscriberCount,
    },
    isAuthoritative: true,
    syncedAt: new Date().toISOString(),
  }

  // Update local canonical store immediately
  await updateCanonicalAnalyticsCache({
    profile: officialStats as any
  })

  // Dispatch to the rest of the app for fast-boot UI updates
  window.dispatchEvent(
    new CustomEvent("yt_channel_metadata_synced", {
      detail: officialStats,
    })
  )

  console.log(`✅ Authoritative metadata synced: ${officialStats.statistics.subscriberCount} subs.`)
  return officialStats
}

/**
 * syncFastAnalyticsTotals
 * Performs Step 1.5 of the Fast Boot pipeline.
 * Fetches high-priority financial totals (Lifetime) and Subscriber growth (28d)
 * immediately after metadata sync, before the full video inventory scan.
 */
export const syncFastAnalyticsTotals = async (): Promise<any> => {
  const token = await refreshTokenIfExpired()
  if (!token) throw new Error("Unauthorized")

  console.log("⚡ PHASE 1.5: FETCHING FAST ANALYTICS TOTALS...")

  // Robust date handling
  const safeDate = new Date()
  safeDate.setDate(safeDate.getDate() - 1)
  const yesterday = getIsoDate(safeDate)
  
  const d28 = new Date()
  d28.setDate(d28.getDate() - 29)
  const start28d = getIsoDate(d28)

  const epoch = "2005-02-14"

  // Parallel fetches for Lifetime Totals and 28D Subscribers
  const [lifetimeRes, d28Res] = await Promise.all([
    proxyFetch(
      `${ANALYTICS_URL}/reports?ids=channel==MINE&startDate=${epoch}&endDate=${yesterday}&metrics=estimatedRevenue,estimatedMinutesWatched,views`,
      { headers: { Authorization: `Bearer ${token}` } }
    ),
    proxyFetch(
      `${ANALYTICS_URL}/reports?ids=channel==MINE&startDate=${start28d}&endDate=${yesterday}&metrics=subscribersGained`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
  ])

  const fastData = {
    lifetimeRevenue: 0,
    lifetimeWatchMinutes: 0,
    lifetimeViews: 0,
    subscribers28d: 0,
    lastSyncedAt: new Date().toISOString()
  }

  if (lifetimeRes.ok) {
    const data = await lifetimeRes.json()
    if (data.rows?.[0]) {
      fastData.lifetimeRevenue = Number(data.rows[0][0]) || 0
      fastData.lifetimeWatchMinutes = Number(data.rows[0][1]) || 0
      fastData.lifetimeViews = Number(data.rows[0][2]) || 0
    }
  }

  if (d28Res.ok) {
    const data = await d28Res.json()
    if (data.rows?.[0]) {
      fastData.subscribers28d = Number(data.rows[0][0]) || 0
    }
  }

  // Dispatch event for GlobalDataContext to pick up
  window.dispatchEvent(
    new CustomEvent("yt_fast_analytics_synced", {
      detail: fastData,
    })
  )

  console.log("✅ Phase 1.5 Complete: Revenue/WatchTime/SubGrowth loaded.")
  return fastData
}

/**
 * syncRecentVideoSnapshot
 * Performs Step 1.7 of the Fast Boot pipeline.
 * Fetches the 50 most recent videos with full metadata (views, likes, duration, etc.)
 * immediately after totals sync. This ensures the dashboard video list isn't empty
 * while the full inventory sync (Step 2/3) is running in the background.
 */
export const syncRecentVideoSnapshot = async (uploadsPlaylistId: string): Promise<CoreVideoBaseline[]> => {
  const token = await refreshTokenIfExpired()
  if (!token) throw new Error("Unauthorized")

  console.log("🎬 PHASE 1.7: FETCHING RECENT VIDEO SNAPSHOT...")

  // 1. Get first 50 video IDs from uploads playlist
  const playlistRes = await proxyFetch(
    `${BASE_URL}/playlistItems?part=contentDetails&maxResults=50&playlistId=${uploadsPlaylistId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!playlistRes.ok) throw new Error("Failed to fetch recent playlist items")
  
  const playlistData = await playlistRes.json()
  const videoIds = (playlistData.items || []).map((item: any) => item.contentDetails?.videoId).filter(Boolean)

  if (videoIds.length === 0) return []

  // 2. Fetch full stats/metadata for these 50 videos
  const videosRes = await proxyFetch(
    `${BASE_URL}/videos?part=statistics,contentDetails,snippet,status,player&id=${videoIds.join(",")}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!videosRes.ok) throw new Error("Failed to fetch recent video details")

  const videosData = await videosRes.json()
  const snapshot: CoreVideoBaseline[] = (videosData.items || []).map((v: any) => {
    const duration = parseDurationSeconds(v.contentDetails?.duration || "")
    
    // Vertical check
    let isVertical = false
    const embedHtml = v.player?.embedHtml || ""
    const w = parseInt(embedHtml.match(/width="(\d+)"/)?.[1] || "0", 10)
    const h = parseInt(embedHtml.match(/height="(\d+)"/)?.[1] || "0", 10)
    if (w && h) isVertical = h > w

    return {
      videoId: v.id,
      title: v.snippet?.title || "",
      description: v.snippet?.description || "",
      tags: v.snippet?.tags || [],
      publishedAt: v.snippet?.publishedAt || "",
      thumbnail: v.snippet?.thumbnails?.high?.url || v.snippet?.thumbnails?.default?.url || "",
      duration,
      durationRaw: v.contentDetails?.duration || "",
      format: duration <= 180 ? "shorts" : "long",
      isShort: duration <= 180 && isVertical,
      privacyStatus: v.status?.privacyStatus || "",
      uploadStatus: v.status?.uploadStatus || "",
      definition: v.contentDetails?.definition || "sd",
      dataApiStats: {
        views: parseInt(v.statistics?.viewCount || "0", 10),
        likes: parseInt(v.statistics?.likeCount || "0", 10),
        comments: parseInt(v.statistics?.commentCount || "0", 10),
        subscribers: "0"
      },
      analytics: null,
      hasAnalytics: false,
      lastSyncedAt: new Date().toISOString()
    }
  })

  // Dispatch for GlobalDataContext to populate the brain immediately
  window.dispatchEvent(
    new CustomEvent("yt_recent_videos_synced", {
      detail: snapshot,
    })
  )

  console.log(`✅ Phase 1.7 Complete: ${snapshot.length} recent videos loaded into state.`)
  return snapshot
}

/**
 * syncCoreLifetimeData
 * 1. Gathers Channel Lifetime Totals
 * 2. Maps every video in the channel with Format (Short/Long) and Baseline Stats
 * 3. Fetches Core Analytics for Channel & Videos
 * 4. Enriches each video with analytics row (or null fallback for new videos)
 */
export const syncCoreLifetimeData = async (maxVideos: number = Infinity): Promise<CoreSyncResult> => {
  const token = await refreshTokenIfExpired()
  if (!token) throw new Error("Unauthorized")

  // Robust date handling — use 1 day ago as safe endDate to prevent 400 errors
  const safeDate = new Date()
  safeDate.setDate(safeDate.getDate() - 1)
  const endDateStr = getIsoDate(safeDate)
  const epoch = "2005-02-14" // YouTube's birthday for lifetime coverage

  const t0 = performance.now()
  console.log(`🚀 STARTING PHASE 1: CORE LIFETIME SYNC (limit: ${maxVideos === Infinity ? "UNLIMITED" : maxVideos})...`)

  // ── STEP 1: Channel Profile & Uploads Playlist ID ─────────────────
  // We use the authoritative metadata if already synced, or fetch it now.
  const authMetadata = await syncAuthoritativeMetadata()
  
  const channelRes = await proxyFetch(
    `${BASE_URL}/channels?part=contentDetails&mine=true`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!channelRes.ok) throw new Error(`Channel contentDetails fetch failed: ${channelRes.status}`)
  const channelData = await channelRes.json()

  if (!channelData.items || channelData.items.length === 0) {
    throw new Error("No channel details found for this user.")
  }

  const profile = channelData.items[0]
  const channelId = authMetadata.channelId
  const uploadsPlaylistId = profile.contentDetails.relatedPlaylists.uploads
  const channelStats: CoreSyncChannelStats = authMetadata.statistics

  console.log(
    `[CoreSync] Step 1: Channel ${channelId} | ${channelStats.videoCount} videos | ${channelStats.subscriberCount} subs`,
  )

  // ── STEP 2: Fetch Video IDs from Uploads Playlist (up to maxVideos) ──
  const allVideoIds: string[] = []
  let nextPageToken = ""

  console.log(`📂 Fetching video inventory${maxVideos === Infinity ? " (ALL videos)" : ` (max ${maxVideos})`}...`)
  do {
    const playlistUrl =
      `${BASE_URL}/playlistItems?part=contentDetails&maxResults=50&playlistId=${uploadsPlaylistId}` +
      (nextPageToken ? `&pageToken=${nextPageToken}` : "")

    const playlistRes = await proxyFetch(playlistUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!playlistRes.ok) break

    const playlistData = await playlistRes.json()
    const items = playlistData.items || []
    items.forEach((item: any) => {
      const vid = item?.contentDetails?.videoId
      if (vid && allVideoIds.length < maxVideos) allVideoIds.push(vid)
    })

    nextPageToken = playlistData.nextPageToken || ""
  } while (nextPageToken && allVideoIds.length < maxVideos)

  console.log(`📹 Inventory: ${allVideoIds.length} videos fetched${maxVideos === Infinity ? " (unlimited)" : ` (cap: ${maxVideos})`}.`)

  // ── STEP 3: Video stats + format classification (batches of 50) ───
  const videoBaseMap = new Map<string, CoreVideoBaseline>()

  // Fetch UUSH Shorts playlist IDs in parallel with video stats
  const shortsPlaylistIdsPromise = fetchShortsPlaylistIds(channelId)

  for (let i = 0; i < allVideoIds.length; i += BATCH_SIZE) {
    const batch = allVideoIds.slice(i, i + BATCH_SIZE)
    const videosRes = await proxyFetch(
      `${BASE_URL}/videos?part=statistics,contentDetails,snippet,status,player&id=${batch.join(",")}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (!videosRes.ok) {
      console.warn(`[CoreSync] Video stats batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${videosRes.status}`)
      continue
    }

    const videosData = await videosRes.json()
    ;(videosData.items || []).forEach((v: any) => {
      const duration = parseDurationSeconds(v.contentDetails?.duration || "")
      const durationRaw = v.contentDetails?.duration || ""

      // Vertical aspect ratio detection from player embed dimensions
      let isVertical = false
      const embedHtml = v.player?.embedHtml || ""
      const widthMatch = embedHtml.match(/width="(\d+)"/)
      const heightMatch = embedHtml.match(/height="(\d+)"/)
      if (widthMatch && heightMatch) {
        const w = parseInt(widthMatch[1], 10)

        const h = parseInt(heightMatch[1], 10)
        isVertical = h > w
      }

      videoBaseMap.set(v.id, {
        videoId: v.id,
        title: v.snippet?.title || "",
        publishedAt: v.snippet?.publishedAt || "",
        thumbnail:
          v.snippet?.thumbnails?.high?.url ||
          v.snippet?.thumbnails?.default?.url ||
          `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`,
        duration,
        durationRaw,
        format: duration <= 180 ? "shorts" : "long",
        isShort: duration <= 180 && isVertical, // Preliminary: duration + aspect ratio
        privacyStatus: v.status?.privacyStatus || "",
        dataApiStats: {
          views: parseInt(v.statistics?.viewCount || "0", 10),
          likes: parseInt(v.statistics?.likeCount || "0", 10),
          comments: parseInt(v.statistics?.commentCount || "0", 10),
          subscribers: channelStats.subscriberCount, // Channel-level context
        },
        analytics: null,
        hasAnalytics: false,
      })
    })
  }

  // Refine Shorts classification with UUSH playlist cross-reference
  // Three signals: 1) duration <= 180s  2) vertical aspect ratio  3) UUSH playlist membership
  try {
    const shortsPlaylistIds = await shortsPlaylistIdsPromise
    videoBaseMap.forEach((video, videoId) => {
      const isInShortsPlaylist = shortsPlaylistIds.has(videoId)
      // Videos > 180s are always Long.
      // Videos <= 180s are Short if in UUSH playlist OR if aspect ratio says vertical.
      video.isShort =
        video.duration > 180
          ? false
          : isInShortsPlaylist || video.isShort
    })
  } catch (e) {
    console.warn("[CoreSync] Shorts playlist cross-ref failed, using duration+aspect only:", e)
  }

  const shortsCount = Array.from(videoBaseMap.values()).filter((v) => v.isShort).length
  console.log(
    `[CoreSync] Step 3: ${videoBaseMap.size} videos classified (${shortsCount} Shorts, ${videoBaseMap.size - shortsCount} Long)`,
  )

  // ── STEP 4: Core Analytics for channel==MINE (lifetime totals) ────
  const coreChannelUrl =
    `${ANALYTICS_URL}/reports?ids=channel==MINE` +
    `&startDate=${epoch}&endDate=${endDateStr}` +
    `&metrics=${CORE_METRICS.join(",")}`

  let coreChannelAnalytics: any = null
  try {
    const coreChannelRes = await proxyFetch(coreChannelUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (coreChannelRes.ok) {
      coreChannelAnalytics = await coreChannelRes.json()
    } else {
      console.warn(`[CoreSync] Step 4 channel analytics failed: ${coreChannelRes.status}`)
    }
  } catch (e) {
    console.warn("[CoreSync] Step 4 channel analytics error:", e)
  }

  // ── STEP 5: Core Analytics per-video (batches of 25) ──────────────
  // Uses 25-ID batches for Analytics API to avoid URI length issues
  // with many metrics + many video IDs in the filter parameter
  const allVideoReportPayloads: any[] = []
  let allVideoAnalyticsRows: any[][] = []

  for (let i = 0; i < allVideoIds.length; i += ANALYTICS_BATCH) {
    const batch = allVideoIds.slice(i, i + ANALYTICS_BATCH)
    const filterValue = `video==${batch.join(",")}`
    const videoAnalyticsUrl =
      `${ANALYTICS_URL}/reports?ids=channel==MINE` +
      `&startDate=${epoch}&endDate=${endDateStr}` +
      `&metrics=${CORE_METRICS.join(",")}` +
      `&dimensions=video` +
      `&filters=${encodeURIComponent(filterValue)}`

    try {
      const videoRes = await proxyFetch(videoAnalyticsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!videoRes.ok) {
        console.warn(`[CoreSync] Step 5 video analytics batch ${Math.floor(i / ANALYTICS_BATCH) + 1} failed: ${videoRes.status}`)
        continue
      }

      const payload = await videoRes.json()
      if (payload && Array.isArray(payload.rows)) {
        allVideoReportPayloads.push(payload)
        allVideoAnalyticsRows = [...allVideoAnalyticsRows, ...payload.rows]
      }
    } catch (e: any) {
      console.warn(`[CoreSync] Step 5 video analytics batch error:`, e?.message || e)
    }
  }

  // ── STEP 6: Enrich videos with analytics (fallback for new videos) ─
  // If Analytics API hasn't processed a video yet (24-48h lag for new uploads),
  // analytics will be null — UI should fall back to video.dataApiStats
  const columnHeaders =
    allVideoReportPayloads.length > 0
      ? (allVideoReportPayloads[0].columnHeaders || []).map((h: any) => String(h?.name || ""))
      : []
  const videoColIdx = columnHeaders.indexOf("video")

  videoBaseMap.forEach((video, videoId) => {
    const analyticsRow = allVideoAnalyticsRows.find(
      (row) => videoColIdx >= 0 && String(row[videoColIdx]) === videoId,
    )

    if (analyticsRow) {
      video.analytics = analyticsRow
      video.hasAnalytics = true

      // Also parse into typed metrics map for easy access
      const metrics: Partial<Record<CoreMetric, number>> = {}
      columnHeaders.forEach((header: string, idx: number) => {
        if (header === "video") return
        const value = Number(analyticsRow[idx])
        if (Number.isFinite(value)) {
          metrics[header as CoreMetric] = value
        }
      })
      video.analyticsMetrics = metrics
    }
    
    // Set sync timestamp for all videos (even if lacking analytics)
    ;(video as any).lastSyncedAt = new Date().toISOString()
  })

  // Merge all report payloads into a single unified report
  const mergedVideoReport = mergeReportPayloads(allVideoReportPayloads)

  const phase1Ms = Math.round(performance.now() - t0)
  console.log(`✅ PHASE 1 COMPLETE! Dashboard ready in ${phase1Ms}ms.`)

  // ── PHASE 4: Deep Segments (Audience/Traffic/Geo) ───────────────
  try {
    await syncDeepSegments(channelId, epoch, endDateStr)
  } catch (deepErr) {
    console.warn("⚠️ Phase 4 (Deep Segments) failed but continuing...", deepErr)
  }

  return {
    channelId,
    uploadsPlaylistId,
    channelStats,
    videoBaseline: Array.from(videoBaseMap.values()),
    analytics: {
      channel: coreChannelAnalytics,
      videos: mergedVideoReport,
    },
    timing: { phase1Ms },
  }
}

// ============================================================================
// 5. PHASE 2: DEEP NON-CORE SYNC (Background)
// ============================================================================

/**
 * syncDeepVideoData
 * Fetches cards, annotations, and other specialized metrics.
 * Called in background or when user clicks 'Deep Sync'.
 * Often 400s for Shorts or videos without cards/annotations — this is normal.
 */
export const syncDeepVideoData = async (
  videoIds: string[],
): Promise<any[] | null> => {
  const token = await refreshTokenIfExpired()
  if (!token) throw new Error("Unauthorized")

  const safeDate = new Date()
  safeDate.setDate(safeDate.getDate() - 1)
  const endDateStr = getIsoDate(safeDate)
  const epoch = "2005-02-14"

  console.log("🕵️‍♂️ STARTING PHASE 2: DEEP ANALYTICS SYNC...")

  let results: any[] = []

  for (let i = 0; i < videoIds.length; i += ANALYTICS_BATCH) {
    const batch = videoIds.slice(i, i + ANALYTICS_BATCH)
    const filterValue = `video==${batch.join(",")}`

    try {
      const deepUrl =
        `${ANALYTICS_URL}/reports?ids=channel==MINE` +
        `&startDate=${epoch}&endDate=${endDateStr}` +
        `&metrics=${DEEP_METRICS.join(",")}` +
        `&dimensions=video` +
        `&filters=${encodeURIComponent(filterValue)}`

      const deepRes = await proxyFetch(deepUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!deepRes.ok) {
        console.warn(
          `[DeepSync] Batch ${Math.floor(i / ANALYTICS_BATCH) + 1} failed (${deepRes.status}). Often occurs if batch contains only Shorts.`,
        )
        continue
      }

      const data = await deepRes.json()
      if (data.rows) results = [...results, ...data.rows]
    } catch (err: any) {
      console.error("[DeepSync] Batch error:", err?.message || err)
    }
  }

  if (results.length === 0) {
    console.warn("⚠️ PHASE 2: No deep metrics available.")
    return null
  }

  console.log(`✅ PHASE 2 COMPLETE! ${results.length} video rows with deep metrics.`)
  return results
}

/**
 * syncDeepSegments
 * Performs Phase 4 of the sync pipeline.
 * Fetches Demographics (Audience), Traffic Sources (Discovery), and Geography.
 */
export const syncDeepSegments = async (channelId: string, startDate: string, endDate: string): Promise<any> => {
  const { 
    fetchDemographicAnalytics, 
    fetchTrafficSourceAnalytics, 
    fetchGeographyAnalytics 
  } = await import("./youtubeAnalyticsFetcher")

  console.log("👥 PHASE 4: FETCHING AUDIENCE, TRAFFIC & GEOGRAPHY...")

  try {
    const [demographics, traffic, geography] = await Promise.all([
      fetchDemographicAnalytics(startDate, endDate, channelId),
      fetchTrafficSourceAnalytics(startDate, endDate, channelId),
      fetchGeographyAnalytics(startDate, endDate, channelId)
    ])

    const segments = {
      demographics,
      traffic,
      geography,
      lastSyncedAt: new Date().toISOString()
    }

    // Dispatch for GlobalDataContext to store in brain
    window.dispatchEvent(
      new CustomEvent("yt_deep_segments_synced", {
        detail: segments,
      })
    )

    console.log("✅ Phase 4 Complete: Audience Segments Synced.")
    return segments
  } catch (err) {
    console.error("❌ Phase 4 Failed:", err)
    throw err
  }
}
