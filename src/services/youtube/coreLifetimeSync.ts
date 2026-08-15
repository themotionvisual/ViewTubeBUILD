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
import { getAccessToken } from "../auth/authSession"
import { parseDurationSeconds, getFirstThreeSentences } from "../dataUtils"
import {
 fetchShortsPlaylistIds,
 fetchVideoCategories,
 parseChannelHandleFromApi,
} from "./youtubeDataFetcher"
import {
  readYouTubeAnalyticsCache,
  updateCanonicalAnalyticsCache,
} from "../analytics/DataStore"
import { loadVideoMetaCache, saveVideoMetaCache } from "./videoMetaCache"
import { reportSyncError } from "../analytics/AnalyticsErrorReporter"
import {
  getVideoImpressionsAnalytics,
  fetchDemographicAnalytics,
  fetchTrafficSourceAnalytics,
  fetchGeographyAnalytics,
} from "./youtubeAnalyticsFetcher"

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
  "videosAddedToPlaylists",
  "averageViewDuration",
  "averageViewPercentage",
  "subscribersGained",
  "subscribersLost",
  "estimatedRevenue",
] as const

/**
 * Legacy optional-core lane retained for future non-baseline experiments.
 * The current login baseline explicitly requests dislikes and estimatedRevenue
 * in the primary analytics call so the master table can derive Like % and RPM.
 */
export const CORE_OPTIONAL_METRICS = [] as const

export const CHANNEL_LIFETIME_METRICS = [
  ...CORE_METRICS,
  "cardImpressions",
  "cardTeaserImpressions",
  "cardClickRate",
  "cardTeaserClickRate",
  "cpm",
  "estimatedRedPartnerRevenue",
  "estimatedAdRevenue",
  "adImpressions",
  "playbackBasedCpm",
  "estimatedMonetizedPlaybacks",
  "redViews",
  "redEstimatedMinutesWatched",
  "playlistEstimatedMinutesWatched",
  "playlistViews",
  "playlistStarts"
] as const

const EXPERIMENTAL_CHANNEL_METRICS = [
  "estimatedAdSenseRevenue",
] as const

/**
 * Deep Metrics: Non-core statistics for advanced analysis.
 * Fetched in secondary phase — often 400s for Shorts or videos without long-form interactive features.
 */
export const DEEP_METRICS = [
  "cardClickRate",
  "cardTeaserClickRate",
  "cardImpressions",
  "cardTeaserImpressions",
  "cardClicks",
  "cardTeaserClicks",
  "cpm",
  "estimatedRedPartnerRevenue",
  "estimatedAdRevenue",
  "adImpressions",
  "playbackBasedCpm",
  "estimatedMonetizedPlaybacks",
  "redViews",
  "redEstimatedMinutesWatched",
  "playlistEstimatedMinutesWatched",
  "playlistViews",
  "playlistStarts"
] as const

export type CoreMetric =
  | (typeof CORE_METRICS)[number]
  | (typeof CORE_OPTIONAL_METRICS)[number]
export type DeepMetric = (typeof DEEP_METRICS)[number]

/** Data API: max 50 IDs per videos?id= call */
const BATCH_SIZE = 50

/** Analytics API: 50 IDs per filter to align with the initial sync batching target. */
const ANALYTICS_BATCH = 50

const RECENT_SNAPSHOT_LIMIT = Number.MAX_SAFE_INTEGER

const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
  if (chunkSize <= 0) return [items]
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize))
  }
  return chunks
}

const joinUniqueAnalyticsMetrics = (metrics: readonly string[]): string =>
  Array.from(new Set(metrics.filter(Boolean))).join(",")

type AspectRatioBucket = "portrait" | "square" | "landscape" | "unknown"
type AspectRatioSource = "playerEmbed" | "contentDetails" | "unknown"
type ThumbnailMap = Record<
  string,
  {
    url: string
    width?: number
    height?: number
  }
>

const aspectEvidenceFromEmbedHtml = (
  embedHtml: string,
): {
  isPortrait: boolean
  bucket: AspectRatioBucket
  width?: number
  height?: number
  source: AspectRatioSource
} => {
  const widthMatch = embedHtml.match(/width="(\d+)"/)
  const heightMatch = embedHtml.match(/height="(\d+)"/)
  const width = parseInt(widthMatch?.[1] || "0", 10)
  const height = parseInt(heightMatch?.[1] || "0", 10)
  if (!width || !height) {
    return { isPortrait: false, bucket: "unknown", source: "unknown" }
  }
  const ratio = width / height
  const bucket: AspectRatioBucket =
    Math.abs(ratio - 1) <= 0.03
      ? "square"
      : height > width
        ? "portrait"
        : "landscape"
  return {
    isPortrait: bucket === "portrait",
    bucket,
    width,
    height,
    source: "playerEmbed",
  }
}

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
  description?: string
  publishedAt: string
  thumbnail: string
  thumbnails?: ThumbnailMap
  duration: number
  durationRaw: string
  format: "shorts" | "long"
  isShort: boolean
  aspectRatioBucket?: AspectRatioBucket
  aspectRatioWidth?: number
  aspectRatioHeight?: number
  aspectRatioSource?: AspectRatioSource
  privacyStatus: string
  embeddable?: boolean
  license?: string
  publicStatsViewable?: boolean
  madeForKids?: boolean
  selfDeclaredMadeForKids?: boolean
  uploadStatus?: string
  definition?: string
  dimension?: string
  caption?: string
  licensedContent?: boolean
  projection?: string
  categoryId?: string
  categoryName?: string
  defaultLanguage?: string
  localized?: {
    title?: string
    description?: string
  }
  localizations?: Record<
    string,
    {
      title?: string
      description?: string
    }
  >
  topicDetails?: {
    topicIds?: string[]
    topicCategories?: string[]
    topicNames?: string[]
  }
  tags?: string[]
  dataApiStats: {
    views: number
    likes: number
    comments: number
    subscribers: string // Channel-level context
  }
  /** Analytics API row for this video, or null if analytics haven't processed yet */
  analytics: any[] | null
  analyticsMetrics?: Partial<Record<CoreMetric, number>>

}

export interface CoreSyncResult {
  channelId: string
  uploadsPlaylistId: string
  channelStats: CoreSyncChannelStats
  channelBaseline: Record<string, unknown>
  playlistsBaseline: Array<Record<string, unknown>>
  categoryTaxonomy: Record<string, string>
  channelLifetimeSummary: Record<string, unknown>
  inventoryCount: number
  inventoryHasMore: boolean
  videoBaseline: CoreVideoBaseline[]
  windowedAnalytics?: Record<string, any>
  analytics: {
    channel: any
    videos: any
  }
  timing: {
    phase1Ms: number
  }
}

export interface CoreLifetimeSyncOptions {
  includeVideoAnalytics?: boolean
}

// ============================================================================
// 3. UTILITIES
// ============================================================================

/** Robust ISO date string — prevents timezone edge-case API errors */
const getIsoDate = (date: Date) => date.toISOString().split("T")[0]

const normalizeThumbnailMap = (thumbnails: any): ThumbnailMap => {
  if (!thumbnails || typeof thumbnails !== "object") return {}
  return Object.entries(thumbnails).reduce<ThumbnailMap>((acc, [key, value]) => {
    if (!value || typeof value !== "object") return acc
    const url = String((value as { url?: unknown }).url || "").trim()
    if (!url) return acc
    const width = Number((value as { width?: unknown }).width)
    const height = Number((value as { height?: unknown }).height)
    acc[String(key)] = {
      url,
      width: Number.isFinite(width) ? width : undefined,
      height: Number.isFinite(height) ? height : undefined,
    }
    return acc
  }, {})
}

const pickBestThumbnailUrl = (
  thumbnails: any,
  fallback = "",
): string => {
  const normalized = normalizeThumbnailMap(thumbnails)
  return (
    normalized.maxres?.url ||
    normalized.standard?.url ||
    normalized.high?.url ||
    normalized.medium?.url ||
    normalized.default?.url ||
    fallback
  )
}

const normalizeLocalizationMap = (localizations: any): Record<string, { title?: string; description?: string }> => {
  if (!localizations || typeof localizations !== "object") return {}
  return Object.entries(localizations).reduce<Record<string, { title?: string; description?: string }>>(
    (acc, [locale, value]) => {
      if (!value || typeof value !== "object") return acc
      const title = String((value as { title?: unknown }).title || "").trim()
      const description = String((value as { description?: unknown }).description || "").trim().slice(0, 150)
      if (!title && !description) return acc
      acc[String(locale)] = {
        title: title || undefined,
        description: description || undefined,
      }
      return acc
    },
    {},
  )
}

const reportHeaders = (report: any): string[] =>
  Array.isArray(report?.columnHeaders)
    ? report.columnHeaders.map((header: any) => String(header?.name || ""))
    : []

const firstMetricRowToMap = (report: any): Record<string, number> => {
  const headers = reportHeaders(report)
  const firstRow = Array.isArray(report?.rows) ? report.rows[0] : null
  if (!Array.isArray(firstRow) || headers.length === 0) return {}
  return headers.reduce<Record<string, number>>((acc, header, index) => {
    if (!header) return acc
    const value = Number(firstRow[index])
    if (Number.isFinite(value)) acc[header] = value
    return acc
  }, {})
}

export const buildChannelLifetimeSummary = (
  channelBaseline: Record<string, any>,
  analyticsReport: any,
): Record<string, unknown> => {
  const metricMap = firstMetricRowToMap(analyticsReport)
  const statistics = channelBaseline.statistics || {}
  const currentSubscribers = Number(statistics.subscriberCount || 0) || 0
  const publicVideoCount = Number(statistics.videoCount || 0) || 0
  const publicViewCount = Number(statistics.viewCount || 0) || 0
  const lifetimeWatchMinutes = Number(metricMap.estimatedMinutesWatched || 0) || 0
  return {
    channelId: channelBaseline.id || channelBaseline.channelId || null,
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

const buildChannelBaseline = (channel: any): Record<string, unknown> => {
  const thumbnails = normalizeThumbnailMap(channel?.snippet?.thumbnails)
  const localizations = normalizeLocalizationMap(channel?.localizations)
  return {
    id: channel?.id || "",
    channelId: channel?.id || "",
    etag: channel?.etag || "",
    title: channel?.snippet?.title || "",
    description: channel?.snippet?.description || "",
    customUrl: parseChannelHandleFromApi(channel),
    publishedAt: channel?.snippet?.publishedAt || "",
    thumbnails,
    thumbnail: pickBestThumbnailUrl(channel?.snippet?.thumbnails),
    defaultLanguage:
      channel?.snippet?.defaultLanguage ||
      channel?.brandingSettings?.channel?.defaultLanguage ||
      "",
    localized: channel?.snippet?.localized
      ? {
          title: channel.snippet.localized.title || undefined,
          description: channel.snippet.localized.description || undefined,
        }
      : undefined,
    localizations,
    country:
      channel?.snippet?.country ||
      channel?.brandingSettings?.channel?.country ||
      "",
    statistics: {
      viewCount: channel?.statistics?.viewCount || "0",
      subscriberCount: channel?.statistics?.subscriberCount || "0",
      videoCount: channel?.statistics?.videoCount || "0",
      hiddenSubscriberCount: Boolean(channel?.statistics?.hiddenSubscriberCount),
    },
    brandingSettings: {
      title: channel?.brandingSettings?.channel?.title || "",
      description: channel?.brandingSettings?.channel?.description || "",
      keywords: channel?.brandingSettings?.channel?.keywords || "",
      unsubscribedTrailer:
        channel?.brandingSettings?.channel?.unsubscribedTrailer || "",
      defaultLanguage:
        channel?.brandingSettings?.channel?.defaultLanguage || "",
      country: channel?.brandingSettings?.channel?.country || "",
    },
    contentDetails: {
      relatedPlaylists: {
        uploads: channel?.contentDetails?.relatedPlaylists?.uploads || "",
        likes: channel?.contentDetails?.relatedPlaylists?.likes || "",
      },
    },
    uploadsPlaylistId: channel?.contentDetails?.relatedPlaylists?.uploads || "",
    likesPlaylistId: channel?.contentDetails?.relatedPlaylists?.likes || "",
    status: {
      privacyStatus: channel?.status?.privacyStatus || "",
      isLinked: Boolean(channel?.status?.isLinked),
      longUploadsStatus: channel?.status?.longUploadsStatus || "",
      madeForKids: Boolean(channel?.status?.madeForKids),
      selfDeclaredMadeForKids: Boolean(channel?.status?.selfDeclaredMadeForKids),
    },
    topicDetails: {
      topicIds: Array.isArray(channel?.topicDetails?.topicIds)
        ? channel.topicDetails.topicIds
        : [],
      topicCategories: Array.isArray(channel?.topicDetails?.topicCategories)
        ? channel.topicDetails.topicCategories
        : [],
    },
    isAuthoritative: true,
    syncedAt: new Date().toISOString(),
  }
}

const normalizePlaylistBaseline = (playlist: any): Record<string, unknown> => ({
  id: playlist?.id || "",
  title: playlist?.snippet?.title || "",
  description: playlist?.snippet?.description || "",
  publishedAt: playlist?.snippet?.publishedAt || "",
  channelId: playlist?.snippet?.channelId || "",
  channelTitle: playlist?.snippet?.channelTitle || "",
  thumbnails: normalizeThumbnailMap(playlist?.snippet?.thumbnails),
  privacyStatus: playlist?.status?.privacyStatus || "",
  itemCount: Number(playlist?.contentDetails?.itemCount || 0) || 0,
  defaultLanguage: playlist?.snippet?.defaultLanguage || "",
  localized: playlist?.snippet?.localized
    ? {
        title: playlist.snippet.localized.title || undefined,
        description: playlist.snippet.localized.description || undefined,
      }
    : undefined,
  localizations: normalizeLocalizationMap(playlist?.localizations),
})

const fetchOwnedPlaylistsBaseline = async (
  token: string,
): Promise<Array<Record<string, unknown>>> => {
  const response = await proxyFetch(
    `${BASE_URL}/playlists?part=snippet,contentDetails,status,localizations&mine=true&maxResults=50`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  assertAuthorizedResponse(response, "owned playlists baseline fetch")
  if (!response.ok) {
    console.warn(
      `[CoreSync] Owned playlists baseline unavailable (${response.status}). Continuing without playlist inventory.`,
    )
    return []
  }
  const data = await response.json()
  return Array.isArray(data?.items)
    ? data.items.map(normalizePlaylistBaseline)
    : []
}

const buildVideoBaseline = (
  video: any,
  channelStats: CoreSyncChannelStats,
  categoryTaxonomy: Record<string, string>,
): CoreVideoBaseline => {
  const fetchedAt = new Date()
  const duration = parseDurationSeconds(video?.contentDetails?.duration || "")
  const durationRaw = video?.contentDetails?.duration || ""
  const aspect = aspectEvidenceFromEmbedHtml(video?.player?.embedHtml || "")
  const isShort = (duration > 0 && duration <= 180) || aspect.isPortrait
  const categoryId = String(video?.snippet?.categoryId || "").trim()

  return {
    videoId: video?.id || "",
    title: video?.snippet?.title || "",
    description: getFirstThreeSentences(video?.snippet?.description || ""),
    publishedAt: video?.snippet?.publishedAt || "",
    thumbnail: pickBestThumbnailUrl(
      video?.snippet?.thumbnails,
      `https://img.youtube.com/vi/${video?.id}/hqdefault.jpg`,
    ),
    thumbnails: normalizeThumbnailMap(video?.snippet?.thumbnails),
    duration,
    durationRaw,
    format: isShort ? "shorts" : "long",
    isShort,
    aspectRatioBucket: aspect.bucket,
    aspectRatioWidth: aspect.width,
    aspectRatioHeight: aspect.height,
    aspectRatioSource: aspect.source,
    privacyStatus: video?.status?.privacyStatus || "",
    embeddable:
      typeof video?.status?.embeddable === "boolean"
        ? video.status.embeddable
        : undefined,
    license: video?.status?.license || "",
    publicStatsViewable:
      typeof video?.status?.publicStatsViewable === "boolean"
        ? video.status.publicStatsViewable
        : undefined,
    madeForKids:
      typeof video?.status?.madeForKids === "boolean"
        ? video.status.madeForKids
        : undefined,
    selfDeclaredMadeForKids:
      typeof video?.status?.selfDeclaredMadeForKids === "boolean"
        ? video.status.selfDeclaredMadeForKids
        : undefined,
    uploadStatus: video?.status?.uploadStatus || "",
    definition: video?.contentDetails?.definition || "sd",
    dimension: video?.contentDetails?.dimension || "",
    caption: video?.contentDetails?.caption || "",
    licensedContent:
      typeof video?.contentDetails?.licensedContent === "boolean"
        ? video.contentDetails.licensedContent
        : undefined,
    projection: video?.contentDetails?.projection || "",
    categoryId: categoryId ? String(categoryId) : undefined,
    categoryName: categoryId ? categoryTaxonomy[String(categoryId)] || String(categoryId) : undefined,
    defaultLanguage: video?.snippet?.defaultLanguage || "",
    localized: video?.snippet?.localized
      ? {
          title: video.snippet.localized.title || undefined,
        }
      : undefined,
    localizations: normalizeLocalizationMap(video?.localizations),
    topicDetails: {
      topicIds: Array.isArray(video?.topicDetails?.topicIds)
        ? video.topicDetails.topicIds
        : [],
      topicCategories: Array.isArray(video?.topicDetails?.topicCategories)
        ? video.topicDetails.topicCategories
        : [],
      topicNames: Array.isArray(video?.topicDetails?.topicCategories)
        ? video.topicDetails.topicCategories
            .map((url: string) => {
              try {
                const decoded = decodeURIComponent(url)
                const segment = decoded.substring(decoded.lastIndexOf("/") + 1)
                return segment.replace(/_/g, " ")
              } catch {
                return ""
              }
            })
            .filter(Boolean)
        : [],
    },
    tags: Array.isArray(video?.snippet?.tags) ? video.snippet.tags : [],
    dataApiStats: {
      views: parseInt(video?.statistics?.viewCount || "0", 10),
      likes: parseInt(video?.statistics?.likeCount || "0", 10),
      comments: parseInt(video?.statistics?.commentCount || "0", 10),
      subscribers: channelStats.subscriberCount,
    },
    analytics: null,
  }
}

const buildUnauthorizedSyncError = (
  stage: string,
  status: number = 401,
): Error & { code: number; stage: string } =>
  Object.assign(
    new Error(
      `YouTube authorization expired during ${stage}. Please reconnect your channel and try the sync again.`,
    ),
    { code: status, stage },
  )

const assertAuthorizedResponse = (response: Response, stage: string) => {
  if (response.status === 401) {
    throw buildUnauthorizedSyncError(stage, 401)
  }
}

function formatNaturalLocalTimestamp(value: Date | string | number): string {
  const date =
    value instanceof Date ? value : typeof value === "number" ? new Date(value) : new Date(String(value || ""))
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

const mergeVideoMetricPayloads = (
  payloads: any[],
): { columnHeaders: any[]; rows: any[][] } => {
  const metricNames: string[] = []
  const metricNameSet = new Set<string>()
  const rowsByVideo = new Map<string, Record<string, unknown>>()

  payloads.forEach((payload) => {
    if (
      !payload ||
      !Array.isArray(payload.columnHeaders) ||
      !Array.isArray(payload.rows)
    ) {
      return
    }

    const headers = payload.columnHeaders.map((h: any) =>
      String(h?.name || ""),
    )
    const videoIdx = headers.indexOf("video")
    if (videoIdx < 0) return

    headers.forEach((name: string) => {
      if (!name || name === "video" || metricNameSet.has(name)) return
      metricNameSet.add(name)
      metricNames.push(name)
    })

    payload.rows.forEach((row: any) => {
      if (!Array.isArray(row)) return
      const videoId = String(row[videoIdx] || "")
      if (!videoId) return

      const merged = rowsByVideo.get(videoId) || { video: videoId }
      headers.forEach((name: string, idx: number) => {
        if (!name || name === "video") return
        if (row[idx] !== null && row[idx] !== undefined) {
          merged[name] = row[idx]
        }
      })
      rowsByVideo.set(videoId, merged)
    })
  })

  const headerNames = ["video", ...metricNames]
  return {
    columnHeaders: headerNames.map((name) => ({ name })),
    rows: Array.from(rowsByVideo.values()).map((row) =>
      headerNames.map((name) => row[name]),
    ),
    }
    }

    /**
    * mergeChannelMetricPayloads
    * Merges multiple Analytics API report payloads for the same channel scope.
    * Assumes a single-row result (no dimensions).
    */
    const mergeChannelMetricPayloads = (
    payloads: any[],
    ): { columnHeaders: any[]; rows: any[][] } => {
    const metricNames: string[] = []
    const metricNameSet = new Set<string>()
    const mergedRow: Record<string, unknown> = {}

    payloads.forEach((payload) => {
    if (
      !payload ||
      !Array.isArray(payload.columnHeaders) ||
      !Array.isArray(payload.rows)
    ) {
      return
    }

    const headers = payload.columnHeaders.map((h: any) => String(h?.name || ""))

    headers.forEach((name: string) => {
      if (!name || metricNameSet.has(name)) return
      metricNameSet.add(name)
      metricNames.push(name)
    })

    const firstRow = payload.rows[0]
    if (Array.isArray(firstRow)) {
      headers.forEach((name: string, idx: number) => {
        if (!name) return
        if (firstRow[idx] !== null && firstRow[idx] !== undefined) {
          mergedRow[name] = firstRow[idx]
        }
      })
    }
    })

    return {
    columnHeaders: metricNames.map((name) => ({ name })),
    rows: [metricNames.map((name) => mergedRow[name])],
    }
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
  const token = (await refreshTokenIfExpired()) || getAccessToken()
  if (!token) {
    throw buildUnauthorizedSyncError("authoritative channel metadata fetch", 401)
  }

  console.log("🎯 SYNCING AUTHORITATIVE CHANNEL METADATA...")

  const channelRes = await proxyFetch(
    `${BASE_URL}/channels?part=snippet,statistics,brandingSettings,contentDetails,status,topicDetails,localizations&mine=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  assertAuthorizedResponse(channelRes, "authoritative channel metadata fetch")
  if (!channelRes.ok) {
    throw new Error(`Failed to fetch channel profile: ${channelRes.status}`)
  }

  const data = await channelRes.json()
  if (!data.items || data.items.length === 0) {
    throw new Error("No channel found for this user.")
  }

  const channel = data.items[0]
  const officialStats = buildChannelBaseline(channel)

  // Update local canonical store immediately
  await updateCanonicalAnalyticsCache({
    profile: officialStats as any,
    channelBaseline: officialStats as any,
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

  const epoch = "2006-01-01" // Cap at 2006 to prevent 400 invalidCombinations with revenue metrics

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

  assertAuthorizedResponse(lifetimeRes, "fast analytics lifetime totals")
  assertAuthorizedResponse(d28Res, "fast analytics 28 day subscribers")

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

export const syncFastChannelLifetimeSummary = async (
 channelBaseline: Record<string, any>,
): Promise<Record<string, unknown>> => {
  const token = await refreshTokenIfExpired()
  if (!token) throw new Error("Unauthorized")

  const safeDate = new Date()
  safeDate.setDate(safeDate.getDate() - 1)
  const endDate = getIsoDate(safeDate)
  const epoch = "2006-01-01" // Cap at 2006 to prevent 400 invalidCombinations with revenue metrics

  const reportRes = await proxyFetch(
    `${ANALYTICS_URL}/reports?ids=channel==MINE&startDate=${epoch}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,engagedViews,comments,likes,shares,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,estimatedRevenue`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  assertAuthorizedResponse(reportRes, "fast channel lifetime summary")
  if (!reportRes.ok) {
    throw new Error(`Failed to fetch channel lifetime summary: ${reportRes.status}`)
  }

  const report = await reportRes.json()
  const summary = buildChannelLifetimeSummary(channelBaseline, report)

  await updateCanonicalAnalyticsCache({
    channelLifetimeSummary: summary as any,
  })

  window.dispatchEvent(
    new CustomEvent("yt_channel_lifetime_summary_synced", {
      detail: summary,
    }),
  )

  return summary
}

/**
 * syncRecentVideoSnapshot
 * Performs Step 1.7 of the Fast Boot pipeline.
 * Fetches the recent videos with full metadata (views, likes, duration, etc.)
 * immediately after totals sync. This ensures the dashboard video list isn't empty
 * while the full inventory sync (Step 2/3) is running in the background.
 */
export const syncRecentVideoSnapshot = async (uploadsPlaylistId: string): Promise<CoreVideoBaseline[]> => {
  const token = await refreshTokenIfExpired()
  if (!token) throw new Error("Unauthorized")
  const analyticsEndDate = getIsoDate(new Date(Date.now() - 24 * 60 * 60 * 1000))
  const analyticsStartDate = "2005-02-14"

  console.log("🎬 PHASE 1.7: FETCHING RECENT VIDEO SNAPSHOT...")

  // 1. Page through the uploads playlist in batches of 50 until the playlist is exhausted.
  const videoIds: string[] = []
  let nextPageToken = ""
  while (videoIds.length < RECENT_SNAPSHOT_LIMIT) {
    const pageSize = Math.min(BATCH_SIZE, RECENT_SNAPSHOT_LIMIT - videoIds.length)
    const playlistUrl =
      `${BASE_URL}/playlistItems?part=contentDetails` +
      `&maxResults=${pageSize}&playlistId=${uploadsPlaylistId}` +
      (nextPageToken ? `&pageToken=${encodeURIComponent(nextPageToken)}` : "")

    const playlistRes = await proxyFetch(playlistUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
    assertAuthorizedResponse(playlistRes, "recent video snapshot playlist fetch")
    if (!playlistRes.ok) throw new Error("Failed to fetch recent playlist items")

    const playlistData = await playlistRes.json()
    const pageIds = (playlistData.items || [])
      .map((item: any) => item.contentDetails?.videoId)
      .filter(Boolean)
    videoIds.push(...pageIds)
    nextPageToken = String(playlistData.nextPageToken || "")
    if (!nextPageToken || pageIds.length === 0) break
  }

  if (videoIds.length === 0) return []

  // 2. Fetch full stats/metadata in 50-video Data API batches
  let categoryTaxonomy: Record<string, string> = {}
  try {
    categoryTaxonomy = JSON.parse(localStorage.getItem("vt_video_category_taxonomy_us") || "{}") as Record<string, string>
  } catch {
    categoryTaxonomy = {}
  }

  if (Object.keys(categoryTaxonomy).length === 0) {
    try {
      const cats = await fetchVideoCategories()
      categoryTaxonomy = Object.fromEntries(cats.map((c) => [String(c.id), String(c.title)]))
      localStorage.setItem("vt_video_category_taxonomy_us", JSON.stringify(categoryTaxonomy))
    } catch (e) {
      console.warn("[CoreSync] Failed to fetch categories for snapshot:", e)
    }
  }

  const snapshot: CoreVideoBaseline[] = []
  for (const batch of chunkArray(videoIds, BATCH_SIZE)) {
    const videosRes = await proxyFetch(
      `${BASE_URL}/videos?part=statistics,contentDetails,snippet,status,player,topicDetails&id=${batch.join(",")}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    assertAuthorizedResponse(videosRes, "recent video snapshot detail fetch")
    if (!videosRes.ok) throw new Error("Failed to fetch recent video details")

    const videosData = await videosRes.json()
    snapshot.push(
      ...(videosData.items || []).map((v: any) =>
        buildVideoBaseline(
          v,
          {
            viewCount: "0",
            subscriberCount: "0",
            videoCount: "0",
            hiddenSubscriberCount: false,
          },
          categoryTaxonomy,
        ),
      ),
    )
  }

  // Populate video meta cache with titles + thumbnails from this snapshot
  try {
    const metaCache = loadVideoMetaCache()
    snapshot.forEach((v) => {
      if (v.videoId) {
        metaCache[v.videoId] = {
          title: v.title || metaCache[v.videoId]?.title || "",
          thumbnail: v.thumbnail || metaCache[v.videoId]?.thumbnail || "",
        }
      }
    })
    saveVideoMetaCache(metaCache)
    console.log(`📋 Phase 1.7: Video meta cache updated with ${snapshot.length} entries.`)
  } catch (e) {
    reportSyncError(`Phase 1.7 meta cache update failed: ${(e as Error)?.message || e}`)
  }

  const snapshotAnalyticsPayloads: any[] = []
  for (let i = 0; i < videoIds.length; i += ANALYTICS_BATCH) {
    const batch = videoIds.slice(i, i + ANALYTICS_BATCH)
    const batchNumber = Math.floor(i / ANALYTICS_BATCH) + 1
    const filterValue = `video==${batch.join(",")}`

    const requiredUrl =
      `${ANALYTICS_URL}/reports?ids=channel==MINE` +
      `&startDate=${analyticsStartDate}&endDate=${analyticsEndDate}` +
      `&metrics=${joinUniqueAnalyticsMetrics(CORE_METRICS)}` +
      `&dimensions=video` +
      `&filters=${encodeURIComponent(filterValue)}`

    const requiredRes = await proxyFetch(requiredUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
    assertAuthorizedResponse(
      requiredRes,
      `recent video snapshot required analytics batch ${batchNumber}`,
    )
    if (requiredRes.ok) {
      const payload = await requiredRes.json()
      if (payload?.rows?.length) snapshotAnalyticsPayloads.push(payload)
    }

    for (const optionalMetric of CORE_OPTIONAL_METRICS) {
      const optionalUrl =
        `${ANALYTICS_URL}/reports?ids=channel==MINE` +
        `&startDate=${analyticsStartDate}&endDate=${analyticsEndDate}` +
        `&metrics=${optionalMetric}` +
        `&dimensions=video` +
        `&filters=${encodeURIComponent(filterValue)}`

      const optionalRes = await proxyFetch(optionalUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      assertAuthorizedResponse(
        optionalRes,
        `recent video snapshot optional analytics batch ${batchNumber} (${optionalMetric})`,
      )
      if (!optionalRes.ok) continue
      const payload = await optionalRes.json()
      if (payload?.rows?.length) snapshotAnalyticsPayloads.push(payload)
    }
  }

  const mergedSnapshotAnalytics = mergeVideoMetricPayloads(snapshotAnalyticsPayloads)
  const analyticsHeaders = (mergedSnapshotAnalytics.columnHeaders || []).map((h: any) =>
    String(h?.name || ""),
  )
  const analyticsVideoIndex = analyticsHeaders.indexOf("video")
  const analyticsByVideoId = new Map<string, any[]>()
  ;(mergedSnapshotAnalytics.rows || []).forEach((row: any) => {
    if (!Array.isArray(row) || analyticsVideoIndex < 0) return
    const videoId = String(row[analyticsVideoIndex] || "")
    if (!videoId) return
    analyticsByVideoId.set(videoId, row)
  })

  snapshot.forEach((video) => {
    const analyticsRow = analyticsByVideoId.get(video.videoId) || null
    if (!analyticsRow) return

    video.analytics = analyticsRow
    // video.hasAnalytics is removed
    video.analyticsFetchedAt = new Date().toISOString()
    video.analyticsFetchedAtLocal = formatNaturalLocalTimestamp(video.analyticsFetchedAt)

    const metrics: Partial<Record<CoreMetric, number>> = {}
    analyticsHeaders.forEach((header, idx) => {
      if (!header || header === "video") return
      const value = Number(analyticsRow[idx])
      if (Number.isFinite(value)) {
        metrics[header as CoreMetric] = value
      }
    })
    video.analyticsMetrics = metrics
  })

  try {
    const cache = readYouTubeAnalyticsCache()
    const existingVideos = Array.isArray(cache.videos) ? cache.videos : []
    const nextVideoMap = new Map<string, any>()

    existingVideos.forEach((video: any) => {
      const id = String(video?.videoId || "").trim()
      if (id) nextVideoMap.set(id, video)
    })

    snapshot.forEach((video) => {
      const prev = nextVideoMap.get(video.videoId) || {}
      nextVideoMap.set(video.videoId, {
        ...prev,
        videoId: video.videoId,
        title: video.title,
        description: video.description,
        publishedAt: video.publishedAt,
        thumbnail: video.thumbnail,
        thumbnailUrl: video.thumbnail,
        thumbnails: video.thumbnails,
        tags: video.tags,
        channelId: video.channelId,
        channelTitle: video.channelTitle,
        categoryId: video.categoryId,
        categoryName: video.categoryName,
        defaultLanguage: video.defaultLanguage,
        localized: video.localized,
        localizations: video.localizations,
        topicDetails: video.topicDetails,
        privacyStatus: video.privacyStatus,
        uploadStatus: video.uploadStatus,
        embeddable: video.embeddable,
        license: video.license,
        publicStatsViewable: video.publicStatsViewable,
        madeForKids: video.madeForKids,
        selfDeclaredMadeForKids: video.selfDeclaredMadeForKids,
        definition: video.definition,
        dimension: video.dimension,
        caption: video.caption,
        licensedContent: video.licensedContent,
        projection: video.projection,
        durationSeconds: video.duration,
        durationRaw: video.durationRaw,
        format: video.format,
        isShort: video.isShort,
        aspectRatioBucket: video.aspectRatioBucket,
        aspectRatioWidth: video.aspectRatioWidth,
        aspectRatioHeight: video.aspectRatioHeight,
        aspectRatioSource: video.aspectRatioSource,
        viewCount: String(video.dataApiStats.views),
        likeCount: String(video.dataApiStats.likes),
        commentCount: String(video.dataApiStats.comments),
        subscriberCount: video.dataApiStats.subscribers,
        analyticsMetrics: video.analyticsMetrics || prev.analyticsMetrics,
      })
    })

    const nextStats: Record<string, any> = {
      ...(cache.stats || {}),
    }

    snapshot.forEach((video) => {
      const prev = nextStats[video.videoId] || {}
      nextStats[video.videoId] = {
        ...prev,
        viewCount: String(video.dataApiStats.views),
        likeCount: String(video.dataApiStats.likes),
        commentCount: String(video.dataApiStats.comments),
        title: video.title,
        publishedAt: video.publishedAt,
        thumbnail: video.thumbnail,
        thumbnailUrl: video.thumbnail,
        thumbnails: video.thumbnails,
        description: video.description,
        tags: video.tags,
        categoryId: video.categoryId,
        categoryName: video.categoryName,
        defaultLanguage: video.defaultLanguage,
        localized: video.localized,
        localizations: video.localizations,
        topicDetails: video.topicDetails,
        durationSeconds: video.duration,
        privacyStatus: video.privacyStatus,
        uploadStatus: video.uploadStatus || "",
        embeddable: video.embeddable,
        license: video.license,
        publicStatsViewable: video.publicStatsViewable,
        format: video.format,
        aspectRatioBucket: video.aspectRatioBucket,
        aspectRatioWidth: video.aspectRatioWidth,
        aspectRatioHeight: video.aspectRatioHeight,
        aspectRatioSource: video.aspectRatioSource,
        subscriberCount: video.dataApiStats.subscribers,
        ...(video.analyticsMetrics || {}),
      }
    })

    await updateCanonicalAnalyticsCache({
      videos: Array.from(nextVideoMap.values()),
      stats: nextStats,
      analytics: mergedSnapshotAnalytics.rows?.length
        ? mergedSnapshotAnalytics
        : cache.analytics,
      analyticsByWindow: {
        ...(cache.analyticsByWindow || {}),
        lifetime: mergedSnapshotAnalytics.rows?.length
          ? {
              ...(cache.analyticsByWindow?.lifetime || {}),
              window: "lifetime",
              startDate: analyticsStartDate,
              endDate: analyticsEndDate,
              fetchedAt: Date.now(),
              report: mergedSnapshotAnalytics,
            }
          : cache.analyticsByWindow?.lifetime,
      },
      lastSynced: Date.now(),
    } as any)

    localStorage.setItem("yt_analytics_last_sync", new Date().toISOString())
    window.dispatchEvent(new CustomEvent("vt_local_data_changed"))
    window.dispatchEvent(
      new CustomEvent("yt_analytics_synced", {
        detail: readYouTubeAnalyticsCache(),
      }),
    )
  } catch (error) {
    console.warn(
      "[CoreSync] Failed to persist recent snapshot analytics into canonical cache:",
      error,
    )
  }

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
export const syncCoreLifetimeData = async (
  maxVideos: number = Infinity,
  options: CoreLifetimeSyncOptions = {},
): Promise<CoreSyncResult> => {
  const token = await refreshTokenIfExpired()
  if (!token) throw new Error("Unauthorized")

  // Robust date handling — use 1 day ago as safe endDate to prevent 400 errors
  const safeDate = new Date()
  safeDate.setDate(safeDate.getDate() - 1)
  const endDateStr = getIsoDate(safeDate)
  const epoch = "2006-01-01" // Cap at 2006 to prevent 400 invalidCombinations with revenue metrics // YouTube's birthday for lifetime coverage

  const t0 = performance.now()
  console.log(`🚀 STARTING PHASE 1: CORE LIFETIME SYNC (limit: ${maxVideos === Infinity ? "UNLIMITED" : maxVideos})...`)

  // ── STEP 1: Channel Profile & Uploads Playlist ID ─────────────────
  // We use the authoritative metadata if already synced, or fetch it now.
  const authMetadata = await syncAuthoritativeMetadata()
  const channelId = String(authMetadata.id || authMetadata.channelId || "").trim()
  const uploadsPlaylistId = String(authMetadata.uploadsPlaylistId || "").trim()
  const channelStats: CoreSyncChannelStats = authMetadata.statistics
  if (!channelId || !uploadsPlaylistId) {
    throw new Error("No authoritative uploads playlist was found for this channel.")
  }

  const [playlistsBaseline, categories] = await Promise.all([
    fetchOwnedPlaylistsBaseline(token).catch((error) => {
      console.warn("[CoreSync] Playlist baseline fetch failed:", error)
      return [] as Array<Record<string, unknown>>
    }),
    fetchVideoCategories().catch((error) => {
      console.warn("[CoreSync] Video category taxonomy fetch failed:", error)
      return [] as Array<{ id: string; title: string }>
    }),
  ])
  const categoryTaxonomy = Object.fromEntries(
    categories.map((entry: { id: string; title: string }) => [
      String(entry.id),
      String(entry.title),
    ]),
  )
  try {
    localStorage.setItem("vt_video_category_taxonomy_us", JSON.stringify(categoryTaxonomy))
  } catch (e) {
    // Ignore
  }

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
    assertAuthorizedResponse(playlistRes, "core lifetime uploads playlist fetch")
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

  // ── STEP 2.5: Pre-populate video meta cache (titles + thumbnails) ──
  // Load existing cache; will be updated with fresh Data API data in Step 3.
  const videoMetaCache = loadVideoMetaCache()
  console.log(`📋 Video meta cache: ${Object.keys(videoMetaCache).length} entries loaded.`)

  // ── STEP 3: Video stats + format classification (batches of 50) ───
  const videoBaseMap = new Map<string, CoreVideoBaseline>()

  // Fetch UUSH Shorts playlist IDs in parallel with video stats
  const shortsPlaylistIdsPromise = fetchShortsPlaylistIds(channelId)

  for (let i = 0; i < allVideoIds.length; i += BATCH_SIZE) {
    const batch = allVideoIds.slice(i, i + BATCH_SIZE)
    const videosRes = await proxyFetch(
      `${BASE_URL}/videos?part=statistics,contentDetails,snippet,status,player,topicDetails&id=${batch.join(",")}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    assertAuthorizedResponse(
      videosRes,
      `core lifetime video metadata batch ${Math.floor(i / BATCH_SIZE) + 1}`,
    )
    if (!videosRes.ok) {
      console.warn(`[CoreSync] Video stats batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${videosRes.status}`)
      continue
    }

    const videosData = await videosRes.json()
    ;(videosData.items || []).forEach((v: any) => {
      videoBaseMap.set(v.id, buildVideoBaseline(v, channelStats, categoryTaxonomy))
      // Update meta cache with fresh title + thumbnail from Data API
      if (v.id) {
        videoMetaCache[v.id] = {
          title: v.snippet?.title || videoMetaCache[v.id]?.title || "",
          thumbnail:
            pickBestThumbnailUrl(v.snippet?.thumbnails) ||
            videoMetaCache[v.id]?.thumbnail ||
            `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`,
        }
      }
    })
  }

  // Refine Shorts classification with UUSH playlist cross-reference
  // Three signals: 1) duration <= 180s  2) vertical aspect ratio  3) UUSH playlist membership
  try {
    const shortsPlaylistIds = await shortsPlaylistIdsPromise
    videoBaseMap.forEach((video, videoId) => {
      const isInShortsPlaylist = shortsPlaylistIds.has(videoId)
      // Videos > 180s are always Long.
      // Videos <= 180s are Short if duration <= 180s, in UUSH playlist, OR if aspect ratio says vertical.
      video.isShort =
        video.duration > 180
          ? false
          : (video.duration > 0 && video.duration <= 180) || isInShortsPlaylist || video.isShort
      video.format = video.isShort ? "short" : "long"
    })
  } catch (e) {
    console.warn("[CoreSync] Shorts playlist cross-ref failed, using duration+aspect only:", e)
  }

  const shortsCount = Array.from(videoBaseMap.values()).filter((v) => v.isShort).length
  console.log(
    `[CoreSync] Step 3: ${videoBaseMap.size} videos classified (${shortsCount} Shorts, ${videoBaseMap.size - shortsCount} Long)`,
  )

  // Persist updated video meta cache after Step 3 enrichment
  try {
    saveVideoMetaCache(videoMetaCache)
    console.log(`💾 Video meta cache persisted: ${Object.keys(videoMetaCache).length} entries.`)
  } catch (e) {
    reportSyncError(`Failed to persist video meta cache: ${(e as Error)?.message || e}`)
    console.warn("[CoreSync] Video meta cache persist failed:", e)
  }

  // ── STEP 4: Core Analytics for channel==MINE (lifetime totals) ────
  // We split the large CHANNEL_LIFETIME_METRICS set into strict isolated groups
  // to prevent HTTP 400 errors from incompatible metric combinations (like cards + monetization).
  const metricGroups = [
    {
      name: "core_performance",
      metrics: ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage"]
    },
    {
      name: "engagement",
      metrics: ["likes", "comments", "shares", "dislikes", "subscribersGained", "subscribersLost", "engagedViews", "videosAddedToPlaylists"]
    },
    {
      name: "monetization",
      metrics: ["estimatedRevenue", "estimatedAdRevenue", "adImpressions", "cpm", "playbackBasedCpm", "estimatedMonetizedPlaybacks"]
    },
    {
      name: "premium",
      metrics: ["redViews", "redEstimatedMinutesWatched", "estimatedRedPartnerRevenue"]
    },
    {
      name: "cards",
      metrics: ["cardImpressions", "cardTeaserImpressions", "cardClickRate", "cardTeaserClickRate"]
    },
    {
      name: "playlists",
      metrics: ["playlistEstimatedMinutesWatched", "playlistViews", "playlistStarts"]
    },
    {
      name: "experimental",
      metrics: ["estimatedAdSenseRevenue"]
    }
  ];

  let coreChannelAnalytics: any = null;
  const windowedAnalytics: Record<string, any> = {};
  const successfulMetricsSet = new Set<string>();

  try {
    for (const group of metricGroups) {
      const url = `${ANALYTICS_URL}/reports?ids=channel==MINE&startDate=${epoch}&endDate=${endDateStr}&metrics=${group.metrics.join(",")}`;
      try {
        const res = await proxyFetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        assertAuthorizedResponse(res, `core lifetime channel analytics (${group.name})`);

        if (res.ok) {
          const data = await res.json();
          if (coreChannelAnalytics) {
            coreChannelAnalytics = mergeChannelMetricPayloads([coreChannelAnalytics, data]);
          } else {
            coreChannelAnalytics = data;
          }
          group.metrics.forEach(m => successfulMetricsSet.add(m));
          console.info(`[CoreSync] Metric group accepted: ${group.name}`);
        } else {
          console.warn(`[CoreSync] Metric group rejected (${res.status}): ${group.name}`);
        }
      } catch (err) {
        if ((err as { code?: number })?.code === 401) throw err;
        console.warn(`[CoreSync] Metric group fetch failed: ${group.name}`, err);
      }
    }

    if (!coreChannelAnalytics || !coreChannelAnalytics.rows || coreChannelAnalytics.rows.length === 0) {
      console.warn("[CoreSync] Step 4 essential channel analytics yielded no data.");
    }

    if (coreChannelAnalytics) {
      const successfulMetrics = Array.from(successfulMetricsSet).join(",");

      const windows = {
        day28: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        day90: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        day365: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      }
      await Promise.all(
        Object.entries(windows).map(async ([window, start]) => {
          const url = `${ANALYTICS_URL}/reports?ids=channel==MINE&startDate=${start}&endDate=${endDateStr}&metrics=${successfulMetrics}`
          const res = await proxyFetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          })
          assertAuthorizedResponse(res, `windowed channel analytics (${window})`)
          if (res.ok) {
            windowedAnalytics[window] = await res.json()
          }
        }),
      )
    }
  } catch (e) {
    if ((e as { code?: number })?.code === 401) {
      throw e
    }
    console.warn("[CoreSync] Step 4 channel analytics error:", e)
  }

  const LONG_FORM_ONLY_METRICS = [
    "playlistStarts",
    "playlistViews",
    "viewsPerPlaylistStart",
    "averageTimeInPlaylist",
    "playlistEstimatedMinutesWatched",
    "cardImpressions",
    "cardTeaserImpressions",
    "cardClicks",
    "cardTeaserClicks",
    "cardClickRate",
    "cardTeaserClickRate",
    "endScreenElementImpressions",
    "endScreenElementClicks",
    "endScreenElementClickRate",
  ] as const

  // ── STEP 5: Core Analytics per-video (batches of 25) ──────────────
  // Uses 25-ID batches for Analytics API to avoid URI length issues
  // with many metrics + many video IDs in the filter parameter
  const allVideoReportPayloads: any[] = []
  const disabledOptionalVideoMetrics = new Set<string>()
  const disabledLongFormMetrics = new Set<string>()

  const fetchVideoMetricPayload = async (
    batch: string[],
    metrics: readonly string[],
    batchNumber: number,
    label: "required" | "optional" | "long_form",
  ): Promise<any | null> => {
    const filterValue = `video==${batch.join(",")}`
    const videoAnalyticsUrl =
      `${ANALYTICS_URL}/reports?ids=channel==MINE` +
      `&startDate=${epoch}&endDate=${endDateStr}` +
      `&metrics=${joinUniqueAnalyticsMetrics(metrics)}` +
      `&dimensions=video` +
      `&filters=${encodeURIComponent(filterValue)}`

    try {
      const videoRes = await proxyFetch(videoAnalyticsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      assertAuthorizedResponse(
        videoRes,
        `core lifetime ${label} video analytics batch ${batchNumber}`,
      )
      if (!videoRes.ok) {
        const metricLabel = joinUniqueAnalyticsMetrics(metrics)
        if (label === "required") {
          console.warn(
            `[CoreSync] Step 5 required video analytics batch ${batchNumber} failed (${videoRes.status}) for metrics: ${metricLabel}`,
          )
        } else {
          console.warn(
            `[CoreSync] Step 5 ${label} video analytics metric unavailable (${videoRes.status}): ${metricLabel}`,
          )
          if (label === "long_form") {
            metrics.forEach((metric) => disabledLongFormMetrics.add(metric))
          } else {
            metrics.forEach((metric) => disabledOptionalVideoMetrics.add(metric))
          }
        }
        return null
      }

      const payload = await videoRes.json()
      return payload && Array.isArray(payload.rows) ? payload : null
    } catch (e: any) {
      if (e?.code === 401) {
        throw e
      }
      const metricLabel = joinUniqueAnalyticsMetrics(metrics)
      console.warn(
        `[CoreSync] Step 5 ${label} video analytics batch ${batchNumber} error for metrics ${metricLabel}:`,
        e?.message || e,
      )
      if (label === "long_form") {
        metrics.forEach((metric) => disabledLongFormMetrics.add(metric))
      } else if (label === "optional") {
        metrics.forEach((metric) => disabledOptionalVideoMetrics.add(metric))
      }
      return null
    }
  }

  if (options.includeVideoAnalytics === false) {
    console.log("[CoreSync] Step 5 deferred: initial sync will use Data API baseline while analytics enriches in background.")
  } else {
    for (let i = 0; i < allVideoIds.length; i += ANALYTICS_BATCH) {
      const batch = allVideoIds.slice(i, i + ANALYTICS_BATCH)
      const batchNumber = Math.floor(i / ANALYTICS_BATCH) + 1

      const requiredPayload = await fetchVideoMetricPayload(
        batch,
        CORE_METRICS,
        batchNumber,
        "required",
      )
      if (requiredPayload) {
        allVideoReportPayloads.push(requiredPayload)
      }

      for (const optionalMetric of CORE_OPTIONAL_METRICS) {
        if (disabledOptionalVideoMetrics.has(optionalMetric)) {
          continue
        }
        const optionalPayload = await fetchVideoMetricPayload(
          batch,
          [optionalMetric],
          batchNumber,
          "optional",
        )
        if (optionalPayload) {
          allVideoReportPayloads.push(optionalPayload)
        }
      }

      // Fetch thumbnail impressions/CTR after core analytics so request-shape
      // failures cannot break the baseline all-video metric sync.
      const reachPayload = await getVideoImpressionsAnalytics(
        batch,
        epoch,
        endDateStr,
        { chunkSize: 25, splitOn400: true },
      )
      if (reachPayload.rows.length > 0) {
        allVideoReportPayloads.push(reachPayload)
      }
      if (reachPayload.warnings.length > 0) {
        console.warn(
          `[CoreSync] Step 5 reach analytics partial for batch ${batchNumber}: ${reachPayload.warnings.join(" | ")}`,
        )
      }

      // Fetch Long-Form ONLY metrics
      const longFormBatch = batch.filter((id) => {
        const v = videoBaseMap.get(id)
        return v && !v.isShort
      })

      if (longFormBatch.length > 0) {
        // Group long form metrics to avoid URI too long, but let's try chunks of 8 metrics at a time
        // since Analytics API might reject too many metrics in one call
        const longMetricChunks = [
          [
            "playlistStarts",
            "playlistViews",
            "viewsPerPlaylistStart",
            "averageTimeInPlaylist",
            "playlistEstimatedMinutesWatched",
          ],
          [
            "cardImpressions",
            "cardTeaserImpressions",
            "cardClicks",
            "cardTeaserClicks",
            "cardClickRate",
            "cardTeaserClickRate",
          ],
          [
            "endScreenElementImpressions",
            "endScreenElementClicks",
            "endScreenElementClickRate",
          ]
        ]

        for (const metricChunk of longMetricChunks) {
          const enabledChunk = metricChunk.filter(m => !disabledLongFormMetrics.has(m))
          if (enabledChunk.length === 0) continue

          const longPayload = await fetchVideoMetricPayload(
            longFormBatch,
            enabledChunk,
            batchNumber,
            "long_form",
          )
          if (longPayload) {
            allVideoReportPayloads.push(longPayload)
          }
        }
      }
    }
  }

  if (allVideoIds.length > 0 && videoBaseMap.size === 0) {
    throw new Error(
      "Core lifetime sync fetched a video inventory but could not load any video metadata baselines.",
    )
  }

  if (options.includeVideoAnalytics !== false && !coreChannelAnalytics && allVideoIds.length > 0) {
    throw new Error(
      "Core lifetime sync did not load channel analytics for the requested sync window.",
    )
  }

  // Merge separate metric reports into one row per video. This keeps title/date/
  // thumbnail Data API baselines intact even when optional Analytics metrics fail.
  const mergedVideoReport = mergeVideoMetricPayloads(allVideoReportPayloads)
  const allVideoAnalyticsRows = mergedVideoReport.rows

  // ── STEP 6: Enrich videos with analytics (fallback for new videos) ─
  // If Analytics API hasn't processed a video yet (24-48h lag for new uploads),
  // analytics will be null — UI should fall back to video.dataApiStats
  const columnHeaders =
    mergedVideoReport.columnHeaders.map((h: any) => String(h?.name || ""))
  const videoColIdx = columnHeaders.indexOf("video")

  videoBaseMap.forEach((video, videoId) => {
    const analyticsRow = allVideoAnalyticsRows.find(
      (row) => videoColIdx >= 0 && String(row[videoColIdx]) === videoId,
    )

    if (analyticsRow) {
      video.analytics = analyticsRow
      // video.hasAnalytics is removed

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

  const phase1Ms = Math.round(performance.now() - t0)
  const channelLifetimeSummary = buildChannelLifetimeSummary(
    authMetadata,
    coreChannelAnalytics,
  )
  console.log(`✅ PHASE 1 COMPLETE! Dashboard ready in ${phase1Ms}ms.`)

  return {
    channelId,
    uploadsPlaylistId,
    channelStats,
    channelBaseline: authMetadata,
    playlistsBaseline,
    categoryTaxonomy,
    channelLifetimeSummary,
    windowedAnalytics,
    inventoryCount: allVideoIds.length,
    inventoryHasMore: Boolean(nextPageToken),
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
 * Fetches cards, end screens, and other specialized long-form metrics.
 * Called in background or when user clicks 'Deep Sync'.
 * Often 400s for Shorts or videos without long-form interactive features — this is normal.
 */
export const syncDeepVideoData = async (
  videoIds: string[],
): Promise<any[] | null> => {
  const token = await refreshTokenIfExpired()
  if (!token) throw new Error("Unauthorized")

  const safeDate = new Date()
  safeDate.setDate(safeDate.getDate() - 1)
  const endDateStr = getIsoDate(safeDate)
  const epoch = "2006-01-01" // Cap at 2006 to prevent 400 invalidCombinations with revenue metrics

  console.log("🕵️‍♂️ STARTING PHASE 2: DEEP ANALYTICS SYNC...")

  const allBatchPayloads: any[] = []

  for (let i = 0; i < videoIds.length; i += ANALYTICS_BATCH) {
    const batch = videoIds.slice(i, i + ANALYTICS_BATCH)
    const filterValue = `video==${batch.join(",")}`

    // Chunk metrics to avoid 400 errors from incompatible combinations or too many metrics
    const metricChunks = chunkArray([...DEEP_METRICS], 10)

    for (const chunk of metricChunks) {
      try {
        const deepUrl =
          `${ANALYTICS_URL}/reports?ids=channel==MINE` +
          `&startDate=${epoch}&endDate=${endDateStr}` +
          `&metrics=${joinUniqueAnalyticsMetrics(chunk)}` +
          `&dimensions=video` +
          `&filters=${encodeURIComponent(filterValue)}`

        const deepRes = await proxyFetch(deepUrl, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!deepRes.ok) {
          console.warn(
            `[DeepSync] Batch ${Math.floor(i / ANALYTICS_BATCH) + 1} metric chunk failed (${deepRes.status}). Often occurs if batch contains only Shorts or metrics are unavailable.`,
          )
          continue
        }

        const data = await deepRes.json()
        if (data && Array.isArray(data.rows)) {
          allBatchPayloads.push(data)
        }
      } catch (err: any) {
        console.error("[DeepSync] Batch chunk error:", err?.message || err)
      }
    }
  }

  if (allBatchPayloads.length === 0) {
    console.warn("⚠️ PHASE 2: No deep metrics available.")
    return null
  }

  const mergedReport = mergeVideoMetricPayloads(allBatchPayloads)
  console.log(
    `✅ PHASE 2 COMPLETE! ${mergedReport.rows.length} video rows with deep metrics.`,
  )
  return mergedReport.rows
}

/**
 * syncDeepSegments
 * Performs Phase 4 of the sync pipeline.
 * Fetches Demographics (Audience), Traffic Sources (Discovery), and Geography.
 */
export const syncDeepSegments = async (channelId: string, startDate: string, endDate: string): Promise<any> => {
  // Note: previously a dynamic import here, but the same module is imported
  // statically at the top of this file, so Rollup was warning that the
  // dynamic import couldn't split the module out. Reusing the static bindings
  // silences the warning and avoids a redundant chunk resolution.

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
