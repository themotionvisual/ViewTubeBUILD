import {
 getAccessToken,
 logout,
 loginWithPkcePopup,
 getValidAccessToken,
 isAuthenticated,
 generateRandomString,
 generateCodeChallenge,
} from "./authSession"
import { normalizeRow } from "./dataNormalization"
import type { AnalyticsWindow } from "./analyticsContract"
import { filterSupportedMetrics } from "./analyticsContract"
import type { SyncDiagnostics } from "./productArchitecture"
import { readYouTubeAnalyticsCache } from "./canonicalAnalyticsStore"

/**
 * YouTube Nexus Service
 * Orchestrates Data v3, Analytics, and Reporting APIs.
 */

const BASE_URL = "https://www.googleapis.com/youtube/v3"
const ANALYTICS_URL = "https://youtubeanalytics.googleapis.com/v2"

class YouTubeService {
 private async request(url: string, options: RequestInit = {}) {
  const token = getAccessToken()
  if (!token) throw new Error("Not authenticated")

  const headers = {
   ...options.headers,
   Authorization: `Bearer ${token}`,
   Accept: "application/json",
  }

  const response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
   logout()
   throw new Error("Session expired")
  }

  if (!response.ok) {
   const error = await response.json()
   throw new Error(error.error?.message || "API Request failed")
  }

  return response.json()
 }

 /**
  * Data API: Fetch basic channel statistics
  */
 public async getChannelOverview() {
  const data = await this.request(
   `${BASE_URL}/channels?part=snippet,statistics,brandingSettings&mine=true`,
  )
  const channel = data.items?.[0]

  if (!channel) throw new Error("No channel found")

  return {
   id: channel.id,
   title: channel.snippet.title,
   description: channel.snippet.description,
   customUrl: channel.snippet.customUrl,
   thumbnail: channel.snippet.thumbnails.high.url,
   stats: {
    viewCount: parseInt(channel.statistics.viewCount),
    subscriberCount: parseInt(channel.statistics.subscriberCount),
    videoCount: parseInt(channel.statistics.videoCount),
   },
  }
 }

 /**
  * Data API: Fetch recent videos
  */
 public async getRecentVideos(maxResults = 10) {
  const data = await this.request(
   `${BASE_URL}/search?part=snippet&maxResults=${maxResults}&order=date&type=video&forMine=true`,
  )
  return data.items || []
 }

 /**
  * Analytics API: Fetch metrics for a specific time range
  */
 public async getChannelAnalytics(startDate: string, endDate: string) {
  const metrics = [
   "views",
   "estimatedMinutesWatched",
   "averageViewDuration",
   "subscribersGained",
   "subscribersLost",
   "likes",
   "dislikes",
   "comments",
   "shares",
   "estimatedRevenue",
   "monetizedPlaybacks",
   "adImpressions",
   "cpm",
   "playbackBasedCpm",
  ].join(",")

  const url =
   `${ANALYTICS_URL}/reports?` +
   `ids=channel==MINE&` +
   `startDate=${startDate}&` +
   `endDate=${endDate}&` +
   `metrics=${metrics}&` +
   `dimensions=day&` +
   `sort=day`

  return this.request(url)
 }

 /**
  * Analytics API: Fetch specific video real-time stats
  */
 public async getVideoAnalytics(
  videoIds: string[],
  startDate: string,
  endDate: string,
 ) {
  const metrics =
   "views,estimatedMinutesWatched,averageViewDuration,likes,subscribersGained,estimatedRevenue,videoThumbnailImpressions,videoThumbnailImpressionsClickRate,adImpressions,cpm,monetizedPlaybacks"

  const url =
   `${ANALYTICS_URL}/reports?` +
   `ids=channel==MINE&` +
   `startDate=${startDate}&` +
   `endDate=${endDate}&` +
   `metrics=${metrics}&` +
   `filters=${encodeURIComponent(`video==${videoIds.join(",")}`)}&` +
   `dimensions=video`
  return this.request(url)
 }

 /**
  * Data API: Fetch comprehensive video list with fallback
  */
 public async fetchVideoList(maxResults = 50, query?: string) {
  // If query exists, use search
  if (query) {
   const data = await this.request(
    `${BASE_URL}/search?part=snippet&forMine=true&type=video&order=date&maxResults=${maxResults}&q=${encodeURIComponent(query)}`,
   )
   return (data.items || []).map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    publishedAt: item.snippet.publishedAt,
    thumbnail:
     item.snippet.thumbnails?.high?.url ||
     item.snippet.thumbnails?.default?.url ||
     "",
   }))
  }

  // Default: try search for mine (most reliable for "Recent")
  const data = await this.request(
   `${BASE_URL}/search?part=snippet&type=video&forMine=true&maxResults=${maxResults}&order=date`,
  )
  return (data.items || []).map((item: any) => ({
   videoId: item.id.videoId,
   title: item.snippet.title,
   publishedAt: item.snippet.publishedAt,
   thumbnail:
    item.snippet.thumbnails?.high?.url ||
    item.snippet.thumbnails?.default?.url ||
    "",
  }))
 }

 /**
  * Data API: Fetch specific video stats
  */
 public async fetchVideoStats(videoIds: string[]) {
  const data = await this.request(
   `${BASE_URL}/videos?part=statistics,contentDetails&id=${videoIds.join(",")}`,
  )

  const parseISO8601Duration = (duration: string) => {
   const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
   if (!match) return 0
   const hours = parseInt(match?.[1] || "0")
   const minutes = parseInt(match?.[2] || "0")
   const seconds = parseInt(match?.[3] || "0")
   return hours * 3600 + minutes * 60 + seconds
  }

  return (data.items || []).map((item: any) => ({
   videoId: item.id,
   views: item.statistics.viewCount || "0",
   likes: item.statistics.likeCount || "0",
   comments: item.statistics.commentCount || "0",
   duration: parseISO8601Duration(item.contentDetails.duration).toString(),
  }))
 }

 /**
  * Data API: Fetch full video details
  */
 public async fetchVideoDetails(videoId: string) {
  const data = await this.request(
   `${BASE_URL}/videos?part=snippet,status&id=${videoId}`,
  )
  const item = data.items?.[0]
  if (!item) throw new Error("Video not found")

  return {
   videoId: item.id,
   title: item.snippet.title,
   description: item.snippet.description,
   publishedAt: item.snippet.publishedAt,
   thumbnail:
    item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
   tags: item.snippet.tags || [],
   categoryId: item.snippet.categoryId,
   privacyStatus: item.status.privacyStatus,
  }
 }

 /**
  * Data API: Update video metadata
  */
 public async updateVideo(videoId: string, details: any) {
  const body = {
   id: videoId,
   snippet: {
    title: details.title,
    description: details.description,
    tags: details.tags,
    categoryId: details.categoryId,
   },
   status: {
    privacyStatus: details.privacyStatus,
   },
  }

  return this.request(`${BASE_URL}/videos?part=snippet,status`, {
   method: "PUT",
   body: JSON.stringify(body),
   headers: { "Content-Type": "application/json" },
  })
 }

 /**
  * Data API: Update thumbnail
  */
 public async updateVideoThumbnail(videoId: string, thumbnailFile: File) {
  return this.request(
   `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`,
   {
    method: "POST",
    headers: { "Content-Type": thumbnailFile.type },
    body: thumbnailFile,
   },
  )
 }

 /**
  * Data API: Categories & Playlists
  */
 public async fetchVideoCategories() {
  const data = await this.request(
   `${BASE_URL}/videoCategories?part=snippet&regionCode=US`,
  )
  return (data.items || []).map((item: any) => ({
   id: item.id,
   title: item.snippet.title,
  }))
 }

 public async fetchUserPlaylists() {
  const data = await this.request(
   `${BASE_URL}/playlists?part=snippet&mine=true&maxResults=50`,
  )
  return (data.items || []).map((item: any) => ({
   id: item.id,
   title: item.snippet.title,
  }))
 }

 public async fetchVideoPlaylistMemberships(
  videoId: string,
  playlistIds: string[],
 ) {
  const memberships: any[] = []
  await Promise.all(
   playlistIds.map(async (playlistId) => {
    try {
     const data = await this.request(
      `${BASE_URL}/playlistItems?part=id&playlistId=${playlistId}&videoId=${videoId}`,
     )
     if (data.items && data.items.length > 0) {
      memberships.push({ playlistId, playlistItemId: data.items[0].id })
     }
    } catch (e) {
     /* ignore single playlist errors */
    }
   }),
  )
  return memberships
 }

 public async addToPlaylist(playlistId: string, videoId: string) {
  return this.request(`${BASE_URL}/playlistItems?part=snippet`, {
   method: "POST",
   body: JSON.stringify({
    snippet: {
     playlistId,
     resourceId: { kind: "youtube#video", videoId },
    },
   }),
   headers: { "Content-Type": "application/json" },
  })
 }

 public async removeFromPlaylist(playlistItemId: string) {
  return this.request(`${BASE_URL}/playlistItems?id=${playlistItemId}`, {
   method: "DELETE",
  })
 }

 /**
  * Analytics API: Single video deep dive
  */
 public async fetchSingleVideoAnalytics(videoId: string) {
  const endDate = new Date().toISOString().split("T")[0]
  const startDate = "2000-01-01"
  const metrics =
   "shares,averageViewPercentage,annotationClickThroughRate,estimatedRevenue"

  try {
   const data = await this.request(
    `${ANALYTICS_URL}/reports?ids=channel==MINE&filters=${encodeURIComponent(
     `video==${videoId}`,
    )}&startDate=${startDate}&endDate=${endDate}&metrics=${metrics}`,
   )
   if (data.rows && data.rows.length > 0) {
    const row = data.rows[0]
    return {
     shares: row[0].toString(),
     averageViewPercentage: row[1].toFixed(1),
     clickThroughRate: row[2] ? row[2].toFixed(1) + "%" : "N/A",
     estimatedRevenue: row[3] ? row[3].toFixed(2) : "0.00",
    }
   }
  } catch (e) {
   console.warn("Deep analytics failed", e)
  }
  return null
 }
}

export const youtubeService = new YouTubeService()

// --- Legacy-style named exports (VideoManager + other tools expect these) ---
export const getChannelOverview = () => youtubeService.getChannelOverview()
export const getRecentVideos = (maxResults = 10) =>
 youtubeService.getRecentVideos(maxResults)
export const fetchVideoDetails = (videoId: string) =>
 youtubeService.fetchVideoDetails(videoId)
export const updateVideo = (videoId: string, details: any) =>
 youtubeService.updateVideo(videoId, details)
export const updateVideoThumbnail = (videoId: string, thumbnailFile: File) =>
 youtubeService.updateVideoThumbnail(videoId, thumbnailFile)
export const fetchVideoCategories = () => youtubeService.fetchVideoCategories()
export const fetchUserPlaylists = () => youtubeService.fetchUserPlaylists()
export const fetchVideoPlaylistMemberships = (
 videoId: string,
 playlistIds: string[],
) => youtubeService.fetchVideoPlaylistMemberships(videoId, playlistIds)
export const addToPlaylist = (playlistId: string, videoId: string) =>
 youtubeService.addToPlaylist(playlistId, videoId)
export const removeFromPlaylist = (playlistItemId: string) =>
 youtubeService.removeFromPlaylist(playlistItemId)
export const fetchSingleVideoAnalytics = (videoId: string) =>
 youtubeService.fetchSingleVideoAnalytics(videoId)

// --- Unified YouTube Auth + API Surface (formerly youtubeAuth + youtubeApi) ---

export { generateRandomString, generateCodeChallenge }

export const connectChannel = async (): Promise<void> => {
 await loginWithPkcePopup()
}

export const refreshTokenIfExpired = async (): Promise<string | null> => {
 return getValidAccessToken()
}

export const disconnectChannel = () => {
 logout()
}

export const isChannelConnected = (): boolean => {
 return isAuthenticated()
}

export class YouTubeApiError extends Error {
 code?: number
 reason?: string
 constructor(message: string, code?: number, reason?: string) {
  super(message)
  this.name = "YouTubeApiError"
  this.code = code
  this.reason = reason
 }
}

export const handleYouTubeApiError = async (
 response: Response,
 defaultMessage: string,
) => {
 let errorMessage = response.statusText || defaultMessage
 let code: number | undefined = response.status
 let reason: string | undefined

 try {
  const errorData = await response.json()
  if (errorData.error) {
   const apiError = errorData.error
   errorMessage = apiError.message || errorMessage
   code = apiError.code || code

   if (apiError.errors && apiError.errors.length > 0) {
    reason = apiError.errors[0].reason
   }
  }
 } catch (e) {
  // Ignore JSON parse error
 }

 if (code === 401 || reason === "authError") {
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   code,
   reason,
  )
 } else if (
  code === 403 &&
  (reason === "quotaExceeded" || reason === "rateLimitExceeded")
 ) {
  throw new YouTubeApiError(
   "YouTube API quota exceeded. Please try again later or check your Google Cloud Console billing/quotas.",
   code,
   reason,
  )
 } else if (
  code === 403 &&
  (reason === "forbidden" || reason === "insufficientPermissions")
 ) {
  throw new YouTubeApiError(
   "Access forbidden. Ensure your API key is valid, has the YouTube Data API v3 enabled, and your account has sufficient permissions.",
   code,
   reason,
  )
 } else if (code === 400 && reason === "keyInvalid") {
  throw new YouTubeApiError(
   "Invalid YouTube API key. Please check your API key in Settings or environment variables.",
   code,
   reason,
  )
 }

 throw new YouTubeApiError(
  `${defaultMessage} (${code}): ${errorMessage}`,
  code,
  reason,
 )
}

const normalizeReportData = (data: any) => {
 if (!data.rows || !data.columnHeaders) return data

 const headers = data.columnHeaders.map((h: any) => h.name)

 data.rows = data.rows.map((row: any[]) => {
  const rowObj: Record<string, any> = {}
  headers.forEach((h: string, i: number) => {
   rowObj[h] = row[i]
  })

  // Return the normalized object with standardized keys
  return normalizeRow(rowObj)
 })

 return data
}

export interface ChannelProfile {
 id: string
 name: string
 subscriberCount: string
 totalViews: string
 totalVideos: string
 profilePictureUrl: string
 publishedAt: string
 uploadsPlaylistId?: string
}

export interface VideoDetails {
 videoId: string
 title: string
 description: string
 publishedAt: string
 thumbnail: string
 tags: string[]
 categoryId: string
 privacyStatus: string
}

export interface VideoSnippet {
 videoId: string
 title: string
 publishedAt: string
 thumbnail: string
}

export interface VideoStats {
 videoId: string
 views: string
 likes: string
 comments: string
 duration: string
 durationSeconds?: number
 durationRaw?: string
 isShort?: boolean
 privacyStatus?: string
 title?: string
 description?: string
 tags?: string[]
}

export interface SingleVideoAnalytics {
 shares: string
 averageViewPercentage: string
 clickThroughRate: string
 estimatedRevenue: string
}

export interface VideoCategory {
 id: string
 title: string
}

export interface Playlist {
 id: string
 title: string
}

export interface PlaylistMembership {
 playlistId: string
 playlistItemId: string
}

export type YouTubeApiCallCounts = {
 youtubeDataV3: {
  channels: number
  playlistItems: number
  videos: number
  search: number
  other: number
 }
 youtubeAnalyticsV2: {
  reports: number
  other: number
 }
 total: number
}

let apiCallCounts: YouTubeApiCallCounts = {
 youtubeDataV3: {
  channels: 0,
  playlistItems: 0,
  videos: 0,
  search: 0,
  other: 0,
 },
 youtubeAnalyticsV2: {
  reports: 0,
  other: 0,
 },
 total: 0,
}

export const resetYouTubeApiCallCounts = () => {
 apiCallCounts = {
  youtubeDataV3: {
   channels: 0,
   playlistItems: 0,
   videos: 0,
   search: 0,
   other: 0,
  },
  youtubeAnalyticsV2: {
   reports: 0,
   other: 0,
  },
  total: 0,
 }
}

export const getYouTubeApiCallCounts = (): YouTubeApiCallCounts => {
 // Return a defensive copy to prevent accidental mutation.
 return JSON.parse(JSON.stringify(apiCallCounts)) as YouTubeApiCallCounts
}

const trackApiCall = (url: string) => {
 apiCallCounts.total += 1
 try {
  const parsed = new URL(url)
  const host = parsed.hostname
  const path = parsed.pathname

  if (host === "youtubeanalytics.googleapis.com") {
   if (path.includes("/v2/reports"))
    apiCallCounts.youtubeAnalyticsV2.reports += 1
   else apiCallCounts.youtubeAnalyticsV2.other += 1
   return
  }

  // YouTube Data API v3 calls will typically be on www.googleapis.com.
  if (host === "www.googleapis.com") {
   if (path.includes("/youtube/v3/channels"))
    apiCallCounts.youtubeDataV3.channels += 1
   else if (path.includes("/youtube/v3/playlistItems"))
    apiCallCounts.youtubeDataV3.playlistItems += 1
   else if (path.includes("/youtube/v3/videos"))
    apiCallCounts.youtubeDataV3.videos += 1
   else if (path.includes("/youtube/v3/search"))
    apiCallCounts.youtubeDataV3.search += 1
   else apiCallCounts.youtubeDataV3.other += 1
   return
  }
 } catch {
  // Ignore tracking failures; never block fetch.
 }
}

const proxyFetch = async (url: string, options: RequestInit = {}) => {
 trackApiCall(url)
 return fetch(url, options)
}

type AnalyticsMetricGroupName =
 | "core_performance"
 | "engagement"
 | "impressions_ctr"
 | "monetization"
 | "audience_mix"

type AnalyticsGroupFetchResult = {
 ok: boolean
 metrics: string[]
 idsTried: string[]
 error?: string
 warnings?: string[]
 rowCount?: number
}

const ANALYTICS_VIDEO_PAGE_SIZE = 200
const MAX_ANALYTICS_VIDEO_PAGES = 50

const unsupportedVideoAnalyticsMetrics = new Set<string>()
const disabledAnalyticsGroups = new Set<AnalyticsMetricGroupName>()
let creatorContentTypeFetchDisabled = false
const metricCapabilityByMetric = new Map<
 string,
 { status: "available" | "unsupported"; reasonCode?: string }
>()

const getErrorStatus = (error: unknown): number | undefined => {
 if (typeof error !== "object" || error === null) return undefined
 if (!("status" in error)) return undefined
 const status = Number((error as { status?: unknown }).status)
 return Number.isFinite(status) ? status : undefined
}

export const fetchChannelProfile = async (): Promise<ChannelProfile> => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )

 const response = await proxyFetch(
  "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true",
  {
   headers: { Authorization: `Bearer ${token}` },
  },
 )

 if (!response.ok) {
  await handleYouTubeApiError(response, "Failed to fetch channel profile")
 }
 const data = await response.json()

 if (!data.items || data.items.length === 0) {
  throw new Error("No channel found for this user.")
 }

 const channel = data.items[0]

 return {
  id: channel.id,
  name: channel.snippet.title,
  subscriberCount: channel.statistics.subscriberCount,
  totalViews: channel.statistics.viewCount,
  totalVideos: channel.statistics.videoCount,
  profilePictureUrl: channel.snippet.thumbnails.default.url,
  publishedAt: channel.snippet.publishedAt,
  uploadsPlaylistId:
   channel.contentDetails?.relatedPlaylists?.uploads || undefined,
 }
}

export const fetchVideoList = async (
 maxResults = 50,
 query?: string,
 uploadsIdFromProfile?: string,
 options: { allowSearchFallback?: boolean } = {},
): Promise<VideoSnippet[]> => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )

 if (query) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=${maxResults}&q=${encodeURIComponent(query)}`
  const response = await proxyFetch(url, {
   headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok)
   await handleYouTubeApiError(response, "Failed to fetch video search results")
  const data = await response.json()
  return (data.items || []).map((item: any) => ({
   videoId: item.id.videoId,
   title: item.snippet.title,
   publishedAt: item.snippet.publishedAt,
   thumbnail:
    item.snippet.thumbnails?.high?.url ||
    item.snippet.thumbnails?.default?.url ||
    "",
  }))
 }

 let uploadsId = uploadsIdFromProfile || ""

 if (!uploadsId) {
  try {
   const parsed = readYouTubeAnalyticsCache() as Record<string, any>
   if (parsed.profile?.uploadsPlaylistId)
    uploadsId = parsed.profile.uploadsPlaylistId
  } catch (e) {}
 }

 if (!uploadsId) {
  try {
   const profileReq = await proxyFetch(
    "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true",
    {
     headers: { Authorization: `Bearer ${token}` },
    },
   )
   if (profileReq.ok) {
    const pData = await profileReq.json()
    if (pData.items && pData.items.length > 0) {
     uploadsId = pData.items[0].contentDetails?.relatedPlaylists?.uploads || ""
    }
   }
  } catch (e) {}
 }

 if (uploadsId) {
  try {
   let items: any[] = []
   let nextPageToken = ""
   let fetched = 0

   while (fetched < maxResults) {
    const fetchCount = Math.min(50, maxResults - fetched)
    let playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsId}&maxResults=${fetchCount}`
    if (nextPageToken) playlistUrl += `&pageToken=${nextPageToken}`

    const response = await proxyFetch(playlistUrl, {
     headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Playlist items fetch failed")

    const data = await response.json()
    const newItems = data.items || []
    items = items.concat(newItems)
    fetched += newItems.length
    nextPageToken = data.nextPageToken
    if (!nextPageToken || newItems.length === 0) break
   }

   return items.map((item: any) => ({
    videoId: item.contentDetails?.videoId || item.snippet.resourceId.videoId,
    title: item.snippet.title,
    publishedAt: item.snippet.publishedAt,
    thumbnail:
     item.snippet.thumbnails?.high?.url ||
     item.snippet.thumbnails?.default?.url ||
     "",
   }))
  } catch (e) {
   if (options.allowSearchFallback === true) {
    console.warn("Playlist items fetch failed, falling back to search:", e)
   } else {
    console.warn("Playlist items fetch failed; search fallback disabled.", e)
    return []
   }
  }
 }

 if (options.allowSearchFallback !== true) {
  return []
 }

 const response = await proxyFetch(
  `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&maxResults=${maxResults}`,
  {
   headers: { Authorization: `Bearer ${token}` },
  },
 )
 if (!response.ok)
  await handleYouTubeApiError(
   response,
   "Failed to fetch video list (all methods failed)",
  )
 const data = await response.json()
 return (data.items || []).map((item: any) => ({
  videoId: item.id.videoId,
  title: item.snippet.title,
  publishedAt: item.snippet.publishedAt,
  thumbnail:
   item.snippet.thumbnails?.high?.url ||
   item.snippet.thumbnails?.default?.url ||
   "",
 }))
}

export const fetchVideoStats = async (
 videoIds: string[],
): Promise<VideoStats[]> => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )

 const stats: VideoStats[] = []
 for (let i = 0; i < videoIds.length; i += 50) {
  const batch = videoIds.slice(i, i + 50)
  const response = await proxyFetch(
   // Keep this thin: do not request snippet (title/description/tags) during sync,
   // to reduce both API quota usage and localStorage footprint.
   `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,status&id=${batch.join(",")}`,
   {
    headers: { Authorization: `Bearer ${token}` },
   },
  )

  if (!response.ok) {
   await handleYouTubeApiError(response, "Failed to fetch video stats")
  }
  const data = await response.json()

  const parseISO8601Duration = (duration: string) => {
   const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
   if (!match) return 0
   const hours = parseInt(match?.[1] || "0", 10)
   const minutes = parseInt(match?.[2] || "0", 10)
   const seconds = parseInt(match?.[3] || "0", 10)
   return hours * 3600 + minutes * 60 + seconds
  }

  ;(data.items || []).forEach((item: any) => {
   const rawDuration = item.contentDetails?.duration || ""
   const durationSec = parseISO8601Duration(rawDuration)
   stats.push({
    videoId: item.id,
    views: item.statistics.viewCount || "0",
    likes: item.statistics.likeCount || "0",
    comments: item.statistics.commentCount || "0",
    duration: rawDuration, // Store raw ISO 8601 format for analyticsSync parsing
    durationSeconds: durationSec,
    durationRaw: rawDuration,
    privacyStatus: item.status?.privacyStatus || "",
   })
  })
 }
 return stats
}

type VideoDetailsCacheEntry = {
 description: string
 tags: string[]
 fetchedAt: number
}
const VIDEO_DETAILS_CACHE_KEY = "vt_video_details_cache_v1"
const VIDEO_DETAILS_CACHE_LIMIT = 200

const safeParseJson = <T>(raw: string | null, fallback: T): T => {
 if (!raw) return fallback
 try {
  return JSON.parse(raw) as T
 } catch {
  return fallback
 }
}

const loadVideoDetailsCache = (): Record<string, VideoDetailsCacheEntry> =>
 safeParseJson<Record<string, VideoDetailsCacheEntry>>(
  localStorage.getItem(VIDEO_DETAILS_CACHE_KEY),
  {},
 )

const saveVideoDetailsCache = (
 cache: Record<string, VideoDetailsCacheEntry>,
) => {
 try {
  const entries = Object.entries(cache)
  if (entries.length > VIDEO_DETAILS_CACHE_LIMIT) {
   // Keep the newest N entries by fetchedAt.
   entries.sort((a, b) => (b[1]?.fetchedAt || 0) - (a[1]?.fetchedAt || 0))
   const trimmed = Object.fromEntries(
    entries.slice(0, VIDEO_DETAILS_CACHE_LIMIT),
   )
   localStorage.setItem(VIDEO_DETAILS_CACHE_KEY, JSON.stringify(trimmed))
   return
  }
  localStorage.setItem(VIDEO_DETAILS_CACHE_KEY, JSON.stringify(cache))
 } catch {
  // Never let this break normal app operation.
 }
}

export const fetchVideoSnippetDetails = async (
 videoIds: string[],
): Promise<Record<string, { description: string; tags: string[] }>> => {
 const token = await refreshTokenIfExpired()
 if (!token) return {}

 const cache = loadVideoDetailsCache()
 const out: Record<string, { description: string; tags: string[] }> = {}

 const needed = Array.from(
  new Set(videoIds.map((id) => String(id || "").trim()).filter(Boolean)),
 ).filter((id) => {
  const cached = cache[id]
  if (!cached) return true
  // Cache for up to 14 days; details rarely change, but this prevents unbounded staleness.
  return Date.now() - cached.fetchedAt > 14 * 24 * 60 * 60 * 1000
 })

 // Serve cache hits immediately.
 videoIds.forEach((id) => {
  const key = String(id || "").trim()
  if (!key) return
  const cached = cache[key]
  if (cached) out[key] = { description: cached.description, tags: cached.tags }
 })

 for (let i = 0; i < needed.length; i += 50) {
  const batch = needed.slice(i, i + 50)
  const response = await proxyFetch(
   `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${batch.join(",")}`,
   { headers: { Authorization: `Bearer ${token}` } },
  )

  if (!response.ok) {
   // Soft-fail; tools can still operate without details.
   continue
  }

  const data = await response.json()
  ;(data.items || []).forEach((item: any) => {
   const id = String(item.id || "")
   if (!id) return
   const description = String(item.snippet?.description || "")
   const tags = Array.isArray(item.snippet?.tags)
    ? item.snippet.tags.map((t: any) => String(t || "")).filter(Boolean)
    : []

   out[id] = { description, tags }
   cache[id] = { description, tags, fetchedAt: Date.now() }
  })
 }

 saveVideoDetailsCache(cache)
 return out
}

export const fetchAnalytics = async (
 startDate: string,
 endDate: string,
 channelId?: string,
 options: {
  window?: AnalyticsWindow
  targetVideoIds?: string[]
  optionalMetricsEnabled?: boolean
 } = {},
) => {
 const runDisabledMetrics = new Set<string>()
 const runMetricCapabilities = new Map<
  string,
  {
   metric: string
   status: "available" | "unsupported"
   reasonCode?: string
   source: "api"
  }
 >()
 const knownInvalidCombos = new Set<string>()
 const diagnosticsFailures: SyncDiagnostics["failureReasons"] = []
 const optionalMetricsEnabled = options.optionalMetricsEnabled !== false

 const requestCharCounts: number[] = []
 const maxRequestChars = 1900
 let splitRetries = 0

 const targetVideoIdSet = new Set(
  Array.isArray(options.targetVideoIds)
   ? options.targetVideoIds.filter((videoId): videoId is string => !!videoId)
   : [],
 )

 const metricGroups: Record<AnalyticsMetricGroupName, string[]> = {
  core_performance: [
   "views",
   "estimatedMinutesWatched",
   "averageViewDuration",
   "averageViewPercentage",
   "subscribersGained",
  ],
  engagement: [
   "likes",
   "comments",
   "shares",
   "engagedViews",
   "subscribersLost",
   "dislikes",
   "cardImpressions",
   "cardClicks",
  ],
  // Use canonical YouTube Analytics V2 metric names.
  // 'impressions' is not a valid metric; 'videoThumbnailImpressions' is the correct name.
  impressions_ctr: [
   "videoThumbnailImpressions",
   "videoThumbnailImpressionsClickRate",
  ],
  monetization: [
   "estimatedRevenue",
   "estimatedAdRevenue",
   "cpm",
   "monetizedPlaybacks",
   "playbackBasedCpm",
   "adImpressions",
  ],
  audience_mix: [
   "annotationClickThroughRate",
   "annotationCloseRate",
   "redViews",
   "estimatedRedPartnerRevenue",
  ],
 }

 const scopedMetricGroups: Record<AnalyticsMetricGroupName, string[]> = {
  core_performance: filterSupportedMetrics(
   metricGroups.core_performance,
   "youtube_analytics_v2",
   "video",
  ),
  engagement: filterSupportedMetrics(
   metricGroups.engagement,
   "youtube_analytics_v2",
   "video",
  ),
  // Keep full candidate list for impressions/CTR and let API/runtime fallback decide.
  // Static compatibility maps can lag here and incorrectly strip valid CTR fields.
  impressions_ctr: [...metricGroups.impressions_ctr],
  monetization: filterSupportedMetrics(
   metricGroups.monetization,
   "youtube_analytics_v2",
   "video",
  ),
  audience_mix: filterSupportedMetrics(
   metricGroups.audience_mix,
   "youtube_analytics_v2",
   "video",
  ),
 }

 const filteredMetricGroups: Record<AnalyticsMetricGroupName, string[]> = {
  core_performance: scopedMetricGroups.core_performance.filter(
   (metric) =>
    !unsupportedVideoAnalyticsMetrics.has(metric) &&
    !runDisabledMetrics.has(metric),
  ),
  engagement: scopedMetricGroups.engagement.filter(
   (metric) =>
    !unsupportedVideoAnalyticsMetrics.has(metric) &&
    !runDisabledMetrics.has(metric),
  ),
  impressions_ctr: scopedMetricGroups.impressions_ctr.filter(
   (metric) =>
    !unsupportedVideoAnalyticsMetrics.has(metric) &&
    !runDisabledMetrics.has(metric),
  ),
  monetization: scopedMetricGroups.monetization.filter(
   (metric) =>
    !unsupportedVideoAnalyticsMetrics.has(metric) &&
    !runDisabledMetrics.has(metric),
  ),
  audience_mix: scopedMetricGroups.audience_mix.filter(
   (metric) =>
    !unsupportedVideoAnalyticsMetrics.has(metric) &&
    !runDisabledMetrics.has(metric),
  ),
 }

 if (disabledAnalyticsGroups.size > 0) {
  ;(Object.keys(filteredMetricGroups) as AnalyticsMetricGroupName[]).forEach(
   (groupName) => {
    if (disabledAnalyticsGroups.has(groupName)) {
     filteredMetricGroups[groupName] = []
    }
   },
  )
 }

 if (!optionalMetricsEnabled) {
  // Gate A: make fragile thumbnail impressions/CTR opt-in only.
  filteredMetricGroups.impressions_ctr = []
  metricGroups.impressions_ctr.forEach((metric) =>
   runDisabledMetrics.add(metric),
  )
 }

 const urlIdsForFiltered = channelId ? `channel==${channelId}` : "channel==MINE"
 const maxMetricsString = (
  Object.values(filteredMetricGroups) as string[][]
 ).reduce((currentMax, metrics) => {
  const safeMetrics = Array.from(new Set(["views", ...metrics]))
  const asString = safeMetrics.join(",")
  return asString.length > currentMax.length ? asString : currentMax
 }, "views")

 const buildVideoFilterCandidates = (videoIds: string[]): string[] => {
  if (videoIds.length === 0) return []

  // Filtered queries are always single-page and omit sort/pagination.
  const basePrefix = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${urlIdsForFiltered}&startDate=${startDate}&endDate=${endDate}&metrics=${maxMetricsString}&dimensions=video&filters=`
  const baseSuffix = `&maxResults=${ANALYTICS_VIDEO_PAGE_SIZE}`

  const candidates: string[] = []
  let current: string[] = []

  const flush = () => {
   if (current.length === 0) return
   candidates.push(`video==${current.join(",")}`)
   current = []
  }

  for (const videoId of videoIds) {
   const next = current.length === 0 ? [videoId] : [...current, videoId]
   const filterValue = `video==${next.join(",")}`
   const encoded = encodeURIComponent(filterValue)
   const nextUrlLen = basePrefix.length + encoded.length + baseSuffix.length

   if (nextUrlLen > maxRequestChars && current.length > 0) {
    flush()
    current = [videoId]
    continue
   }

   current = next
  }

  flush()
  return candidates
 }

 const idCandidates: string[] = []
 if (targetVideoIdSet.size > 0) {
  idCandidates.push(...buildVideoFilterCandidates(Array.from(targetVideoIdSet)))
 } else {
  idCandidates.push(channelId ? `channel==${channelId}` : "channel==MINE")
 }

 const fetchVideoReportPage = async (
  ids: string,
  metrics: string[],
  startIndex = 1,
 ): Promise<any> => {
  const safeMetrics = Array.from(
   new Set(["views", ...metrics.filter((m) => m !== "creatorContentType")]),
  )
  const isVideoFilter = ids.startsWith("video==")
  const urlIds = isVideoFilter ? urlIdsForFiltered : ids
  const filters = isVideoFilter ? `&filters=${encodeURIComponent(ids)}` : ""

  // Do not include creatorContentType as a dimension for channel-wide video reports.
  // It's only supported as a dimension when filtering by specific videos.
  // Also include it if it was specifically requested in the original metrics array.
  const includeContentType =
   isVideoFilter && metrics.includes("creatorContentType")
  const dims = includeContentType ? "video,creatorContentType" : "video"

  // Gate A: filtered queries are treated as "unsafe" when combined with pagination/sort.
  // We always do a single request for filtered chunks.
  const baseUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${urlIds}&startDate=${startDate}&endDate=${endDate}&metrics=${safeMetrics.join(",")}&dimensions=${dims}${filters}&maxResults=${ANALYTICS_VIDEO_PAGE_SIZE}`
  const url = isVideoFilter
   ? baseUrl
   : `${baseUrl}&startIndex=${startIndex}&sort=-views`

  requestCharCounts.push(url.length)
  const token = await refreshTokenIfExpired()
  const response = await proxyFetch(url, {
   headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
   let message = `HTTP ${response.status}`
   try {
    const errorData = await response.json()
    message =
     errorData?.error?.message ||
     errorData?.error_description ||
     response.statusText ||
     message
   } catch {
    message = response.statusText || message
   }
   const error = new Error(message) as Error & { status?: number }
   error.status = response.status
   throw error
  }

  const payload = await response.json()
  if (
   !payload ||
   !Array.isArray(payload.columnHeaders) ||
   !Array.isArray(payload.rows)
  ) {
   return { columnHeaders: [], rows: [] }
  }
  return payload
 }

 const flattenReportPayloads = (payloadList: any[]): any => {
  const rowsOut: unknown[][] = []
  let headersOut: Array<{ name: string }> = []

  payloadList.forEach((payload) => {
   if (
    !payload ||
    !Array.isArray(payload.rows) ||
    !Array.isArray(payload.columnHeaders)
   ) {
    return
   }

   if (headersOut.length === 0) {
    headersOut = payload.columnHeaders.map((header: any) => ({
     name: String(header?.name || ""),
    }))
   }

   payload.rows.forEach((row: unknown) => {
    if (Array.isArray(row)) rowsOut.push(row)
   })
  })

  return { columnHeaders: headersOut, rows: rowsOut }
 }

 const fetchVideoReport = async (
  ids: string,
  metrics: string[],
 ): Promise<any> => {
  const isVideoFilter = ids.startsWith("video==")
  if (isVideoFilter) {
   // Gate A: filtered requests are single-page only (no pagination/sort).
   const payload = await fetchVideoReportPage(ids, metrics, 1)
   return flattenReportPayloads([payload])
  }

  const payloadPages: any[] = []
  let startIndex = 1
  const remainingTargets = new Set(targetVideoIdSet)

  // Try pagination for all query styles; some channels/report combos allow it.
  // If a given combo rejects pagination, we already break on HTTP 400 after page 1.
  const maxPages = MAX_ANALYTICS_VIDEO_PAGES

  for (let page = 0; page < maxPages; page += 1) {
   let payload: any
   try {
    payload = await fetchVideoReportPage(ids, metrics, startIndex)
   } catch (error) {
    const status =
     typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: unknown }).status)
      : undefined

    // Some channels return HTTP 400 when paginating past available rows.
    // Treat that as end-of-pages after at least one successful page.
    if (page > 0 && status === 400) break
    throw error
   }
   payloadPages.push(payload)

   if (remainingTargets.size > 0) {
    const headers = (payload?.columnHeaders || []).map((header: any) =>
     String(header?.name || "").toLowerCase(),
    )
    const videoIdx = headers.findIndex(
     (header: string) => header === "video" || header === "videoid",
    )
    if (videoIdx >= 0 && Array.isArray(payload?.rows)) {
     payload.rows.forEach((row: unknown) => {
      if (!Array.isArray(row)) return
      const rowVideoId = String(row[videoIdx] || "")
      if (!rowVideoId) return
      remainingTargets.delete(rowVideoId)
     })
    }
   }

   const rowCount = Array.isArray(payload?.rows) ? payload.rows.length : 0
   if (
    rowCount <= 0 ||
    rowCount < ANALYTICS_VIDEO_PAGE_SIZE ||
    remainingTargets.size === 0
   ) {
    break
   }
   startIndex += rowCount
  }

  return flattenReportPayloads(payloadPages)
 }

 const parseVideoFilterIds = (filter: string): string[] | null => {
  if (!filter.startsWith("video==")) return null
  const raw = filter.slice("video==".length)
  const ids = raw
   .split(",")
   .map((id) => id.trim())
   .filter(Boolean)
  return ids.length > 0 ? ids : null
 }

 const fetchVideoReportWithSplitRetries = async (
  ids: string,
  metrics: string[],
  depth = 0,
  allowSplitOn400 = true,
 ): Promise<any> => {
  // Pre-emptive check: Don't request impressions_ctr metrics with video dimensions using `channel==MINE`.
  // The YouTube Analytics API requires `channel==<CHANNEL_ID>` for impressions/CTR when grouping by video.
  const hasImpressionMetrics = metrics.some(
   (m) =>
    m.includes("Impressions") ||
    m.includes("clickThroughRate") ||
    m.includes("ClickRate"),
  )
  if (hasImpressionMetrics && ids === "channel==MINE") {
   const error: any = new Error(
    "Invalid dimension/metric combination with channel==MINE",
   )
   error.status = 400
   throw error
  }

  try {
   return await fetchVideoReport(ids, metrics)
  } catch (error) {
   const status = getErrorStatus(error)

   // Handle 401 Unauthorized errors by attempting to refresh the token
   if (status === 401) {
    console.warn("YouTube API returned 401 Unauthorized. Session is invalid.")
    try {
     // Clear local bad state. Implicit flow requires user reconnection.
     logout()
    } catch {}
    throw new Error(
     "Your YouTube session has expired. Please reconnect in Settings.",
    )
   }

   const filterIds = parseVideoFilterIds(ids)

   // Gate A: on HTTP 400 for filtered chunks, split the chunk and retry (bounded).
   if (
    allowSplitOn400 &&
    status === 400 &&
    filterIds &&
    filterIds.length > 1 &&
    depth < 10
   ) {
    splitRetries += 1
    const mid = Math.ceil(filterIds.length / 2)
    const left = `video==${filterIds.slice(0, mid).join(",")}`
    const right = `video==${filterIds.slice(mid).join(",")}`

    const payloads: any[] = []
    let lastError: unknown = error

    try {
     payloads.push(
      await fetchVideoReportWithSplitRetries(
       left,
       metrics,
       depth + 1,
       allowSplitOn400,
      ),
     )
    } catch (leftError) {
     lastError = leftError
    }

    try {
     payloads.push(
      await fetchVideoReportWithSplitRetries(
       right,
       metrics,
       depth + 1,
       allowSplitOn400,
      ),
     )
    } catch (rightError) {
     lastError = rightError
    }

    if (payloads.length > 0) {
     return flattenReportPayloads(payloads)
    }

    throw lastError
   }

   throw error
  }
 }

 const groupResults: Record<
  AnalyticsMetricGroupName,
  AnalyticsGroupFetchResult
 > = {
  core_performance: {
   ok: false,
   metrics: filteredMetricGroups.core_performance,
   idsTried: [],
  },
  engagement: {
   ok: false,
   metrics: filteredMetricGroups.engagement,
   idsTried: [],
  },
  impressions_ctr: {
   ok: false,
   metrics: filteredMetricGroups.impressions_ctr,
   idsTried: [],
  },
  monetization: {
   ok: false,
   metrics: filteredMetricGroups.monetization,
   idsTried: [],
  },
  audience_mix: {
   ok: false,
   metrics: filteredMetricGroups.audience_mix,
   idsTried: [],
  },
 }

 const payloads: Partial<Record<AnalyticsMetricGroupName, any[]>> = {}

 const groupNames = Object.keys(
  filteredMetricGroups,
 ) as AnalyticsMetricGroupName[]
 for (const groupName of groupNames) {
  const metrics = filteredMetricGroups[groupName]
  const errors: string[] = []
  const aggregatedPayloads: any[] = []
  const aggregatedWarnings: string[] = []
  let abortGroup = false

  if (metrics.length === 0) {
   groupResults[groupName].ok = true
   if (groupName === "impressions_ctr" && !optionalMetricsEnabled) {
    groupResults[groupName].warnings = [
     "Skipped: optional thumbnail impressions/CTR metrics are disabled (opt-in only).",
    ]
   } else {
    groupResults[groupName].warnings = disabledAnalyticsGroups.has(groupName)
     ? [
        "Skipped: metric group disabled for this session due to repeated API errors.",
       ]
     : ["No supported metrics for youtube_analytics_v2 + video scope."]
   }
   continue
  }

  const groupIdCandidates =
   groupName === "impressions_ctr"
    ? idCandidates.filter((c) => c.startsWith("video==")) // Impressions MUST be chunked by video ID
    : idCandidates

  if (groupName === "impressions_ctr" && groupIdCandidates.length === 0) {
   groupResults[groupName].ok = true
   groupResults[groupName].warnings = [
    "Skipped: No video IDs provided for chunking impression metrics.",
   ]
   continue
  }

  for (const ids of groupIdCandidates) {
   if (abortGroup) break
   const activeMetrics = metrics.filter(
    (metric) =>
     !unsupportedVideoAnalyticsMetrics.has(metric) &&
     !runDisabledMetrics.has(metric),
   )
   if (activeMetrics.length === 0) {
    groupResults[groupName].ok = true
    if (aggregatedWarnings.length === 0) {
     aggregatedWarnings.push(
      "All metrics in this group were marked unsupported for this sync.",
     )
    }
    break
   }

   groupResults[groupName].idsTried.push(ids)

   if (groupName === "impressions_ctr") {
    const metricPayloads: any[] = []
    const metricWarnings: string[] = []
    const metricsToTry = Array.from(new Set(activeMetrics))
    for (const metric of metricsToTry) {
     const knownCapability = metricCapabilityByMetric.get(metric)
     if (knownCapability?.status === "unsupported") {
      runMetricCapabilities.set(metric, {
       metric,
       status: "unsupported",
       reasonCode: knownCapability.reasonCode || "api_unsupported",
       source: "api",
      })
      continue
     }
     try {
      const payload = await fetchVideoReportWithSplitRetries(
       ids,
       [metric],
       0,
       false,
      )
      metricPayloads.push(payload)
      metricCapabilityByMetric.set(metric, { status: "available" })
      runMetricCapabilities.set(metric, {
       metric,
       status: "available",
       source: "api",
      })
     } catch (metricError) {
      const metricErrorMessage =
       metricError instanceof Error ? metricError.message : String(metricError)
      const metricStatus = getErrorStatus(metricError)
      diagnosticsFailures.push({
       group: groupName,
       ids,
       metrics: [metric],
       status: metricStatus,
       reason: metricErrorMessage,
      })
      const reasonCode =
       metricStatus === 400 ? "api_unsupported" : "api_request_failed"
      metricWarnings.push(`${metric}: ${metricErrorMessage}`)
      metricCapabilityByMetric.set(metric, {
       status: "unsupported",
       reasonCode,
      })
      runMetricCapabilities.set(metric, {
       metric,
       status: "unsupported",
       reasonCode,
       source: "api",
      })
      if (metricStatus === 400) {
       unsupportedVideoAnalyticsMetrics.add(metric)
       runDisabledMetrics.add(metric)
      }
     }
    }

    if (metricPayloads.length > 0) {
     aggregatedPayloads.push(flattenReportPayloads(metricPayloads))
     groupResults[groupName].ok = true
    } else {
     groupResults[groupName].ok = false
    }
    if (metricWarnings.length > 0) {
     aggregatedWarnings.push(...metricWarnings)
    }
    continue
   }

   const comboKey = `${groupName}::${ids}::${activeMetrics.join(",")}`
   if (knownInvalidCombos.has(comboKey)) {
    continue
   }
   try {
    const payload = await fetchVideoReportWithSplitRetries(
     ids,
     activeMetrics,
     0,
     true,
    )
    aggregatedPayloads.push(payload)
    groupResults[groupName].ok = true
    continue
   } catch (error) {
    const combinedError = error instanceof Error ? error.message : String(error)
    errors.push(combinedError)
    const status = getErrorStatus(error)
    diagnosticsFailures.push({
     group: groupName,
     ids,
     metrics: activeMetrics,
     status,
     reason: combinedError,
    })

    if (status === 400) {
     knownInvalidCombos.add(comboKey)
    }

    if (activeMetrics.length <= 1) {
     if (status === 400)
      activeMetrics.forEach((metric) => runDisabledMetrics.add(metric))
     continue
    }

    const metricPayloads: any[] = []
    const metricWarnings: string[] = []

    for (const metric of activeMetrics) {
     try {
      const metricPayload = await fetchVideoReportWithSplitRetries(
       ids,
       [metric],
       0,
       true,
      )
      metricPayloads.push(metricPayload)
     } catch (metricError) {
      const metricErrorMessage =
       metricError instanceof Error ? metricError.message : String(metricError)
      metricWarnings.push(`${metric}: ${metricErrorMessage}`)
      const metricStatus = getErrorStatus(metricError)
      diagnosticsFailures.push({
       group: groupName,
       ids,
       metrics: [metric],
       status: metricStatus,
       reason: metricErrorMessage,
      })
      if (metricStatus === 400) {
       unsupportedVideoAnalyticsMetrics.add(metric)
       runDisabledMetrics.add(metric)
       metricCapabilityByMetric.set(metric, {
        status: "unsupported",
        reasonCode: "api_unsupported",
       })
       runMetricCapabilities.set(metric, {
        metric,
        status: "unsupported",
        reasonCode: "api_unsupported",
        source: "api",
       })
       knownInvalidCombos.add(`${groupName}::${ids}::${metric}`)
      }
     }
    }

    if (metricPayloads.length > 0) {
     aggregatedPayloads.push(flattenReportPayloads(metricPayloads))
     groupResults[groupName].ok = true
     if (metricWarnings.length > 0) {
      aggregatedWarnings.push(...metricWarnings)
     }
     continue
    }

    if (metricWarnings.length > 0) {
     errors.push(...metricWarnings)
    }
   }
  }

  if (aggregatedPayloads.length > 0) {
   payloads[groupName] = aggregatedPayloads
   groupResults[groupName].rowCount = aggregatedPayloads.reduce(
    (sum, payload) => {
     const count = Array.isArray(payload?.rows) ? payload.rows.length : 0
     return sum + count
    },
    0,
   )
  }
  if (aggregatedWarnings.length > 0) {
   groupResults[groupName].warnings = aggregatedWarnings
  }

  if (!groupResults[groupName].ok) {
   groupResults[groupName].error =
    errors[errors.length - 1] || "No successful response"
  }
 }

 const byVideo = new Map<string, Record<string, unknown>>()

 const mergePayloadIntoRows = (payload: any) => {
  if (
   !payload ||
   !Array.isArray(payload.columnHeaders) ||
   !Array.isArray(payload.rows)
  ) {
   return
  }

  const headers = payload.columnHeaders.map((header: any) =>
   String(header?.name || ""),
  )
  const normalizedHeaders = headers.map((header: string) =>
   header.toLowerCase(),
  )
  const videoIdx = normalizedHeaders.findIndex(
   (header: string) => header === "video" || header === "videoid",
  )
  if (videoIdx < 0) return

  payload.rows.forEach((rowValues: unknown) => {
   if (!Array.isArray(rowValues)) return
   const videoId = String(rowValues[videoIdx] || "")
   if (!videoId) return

   const existing = byVideo.get(videoId) || { video: videoId }
   headers.forEach((header: string, idx: number) => {
    if (!header) return
    existing[header] = rowValues[idx]
   })
   byVideo.set(videoId, existing)
  })
 }

 groupNames.forEach((groupName) => {
  const groupPayloads = payloads[groupName] || []
  groupPayloads.forEach((payload) => {
   mergePayloadIntoRows(payload)
  })
 })

 const rowObjects = Array.from(byVideo.values())
 const discoveredHeaders = new Set<string>(["video"])
 rowObjects.forEach((row) => {
  Object.keys(row).forEach((header) => {
   if (header) discoveredHeaders.add(header)
  })
 })

 const orderedHeaders = Array.from(discoveredHeaders)
 const columnHeaders = orderedHeaders.map((name) => ({ name }))
 const rows = rowObjects.map((row) =>
  orderedHeaders.map((header) => row[header] ?? null),
 )

 const viewsIndex = orderedHeaders.findIndex(
  (header) => header.toLowerCase() === "views",
 )
 if (viewsIndex >= 0) {
  rows.sort((a, b) => Number(b[viewsIndex] || 0) - Number(a[viewsIndex] || 0))
 }

 const normalizedReport = normalizeReportData({ columnHeaders, rows })
 const window = options.window || "lifetime"
 const diagnostics: SyncDiagnostics = {
  attemptedGroups: Object.fromEntries(
   groupNames.map((groupName) => [
    groupName,
    {
     metricsAttempted: groupResults[groupName].metrics,
     idsTried: groupResults[groupName].idsTried.length,
     failedAttempts: diagnosticsFailures.filter(
      (failure) => failure.group === groupName,
     ).length,
     rowsReturned: groupResults[groupName].rowCount || 0,
    },
   ]),
  ),
  disabledMetrics: Array.from(
   new Set([...runDisabledMetrics, ...unsupportedVideoAnalyticsMetrics]),
  ),
  failureReasons: diagnosticsFailures,
  knownInvalidCombos: Array.from(knownInvalidCombos),
  splitRetries,
  maxRequestChars,
  requestCharCounts,
 }

 return {
  window,
  startDate,
  endDate,
  groups: groupResults,
  syncDiagnostics: diagnostics,
  metricCapabilities: Array.from(runMetricCapabilities.values()),
  report: normalizedReport,
  columnHeaders: normalizedReport.columnHeaders,
  rows: normalizedReport.rows,
 }
}

// Fetch video content type to identify Shorts vs Long videos
// Uses creatorContentType dimension from YouTube Analytics API v2
// This is the official, forward-compatible method for format classification
export const fetchVideoContentType = async (
 startDate: string,
 endDate: string,
 channelId?: string,
): Promise<Map<string, string>> => {
 // The YouTube Analytics API does not support requesting 'creatorContentType' alongside 'video'
 // dimensions for bulk channel queries (e.g., `channel==MINE` or `channel==[CHANNEL_ID]`).
 // Attempting this guarantees a 400 Bad Request.
 // We immediately return an empty map and rely on the fallback logic (e.g., video length <= 60s)
 // in the normalization pipeline to identify Shorts.
 return new Map()
}

// Alternative method: Fetch video metadata from YouTube Data API v3
// This provides duration and aspect ratio for heuristic classification
export const fetchVideoMetadata = async (
 videoIds: string[],
): Promise<Map<string, { duration: number; aspectRatio: string }>> => {
 const token = await refreshTokenIfExpired()
 if (!token) return new Map()

 // Group video IDs into batches of 50 (API limit)
 const batches: string[][] = []
 for (let i = 0; i < videoIds.length; i += 50) {
  batches.push(videoIds.slice(i, i + 50))
 }

 const metadataMap = new Map<
  string,
  { duration: number; aspectRatio: string }
 >()

 for (const batch of batches) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${batch.join(",")}&key=${process.env.YOUTUBE_API_KEY}`

  try {
   const response = await proxyFetch(url, {
    headers: { Authorization: `Bearer ${token}` },
   })

   if (!response.ok) {
    console.warn("Failed to fetch video metadata from Data API")
    continue
   }

   const data = await response.json()

   if (data.items && Array.isArray(data.items)) {
    data.items.forEach((item: any) => {
     const videoId = item.id
     const duration = parseISO8601Duration(item.contentDetails.duration)
     const aspectRatio = calculateAspectRatio(item.contentDetails)

     if (videoId) {
      metadataMap.set(videoId, { duration, aspectRatio })
     }
    })
   }
  } catch (e) {
   console.warn("Error fetching video metadata:", e)
  }
 }

 return metadataMap
}

// Parse ISO 8601 duration format (e.g., "PT1M30S" = 90 seconds)
function parseISO8601Duration(duration: string): number {
 if (!duration || typeof duration !== "string") return 0

 const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
 if (!match) return 0

 const hours = parseInt(match[1] || "0", 10)
 const minutes = parseInt(match[2] || "0", 10)
 const seconds = parseInt(match[3] || "0", 10)

 return hours * 3600 + minutes * 60 + seconds
}

// Calculate aspect ratio from video dimensions
function calculateAspectRatio(contentDetails: any): string {
 if (!contentDetails || !contentDetails.width || !contentDetails.height) {
  return "unknown"
 }

 const width = contentDetails.width
 const height = contentDetails.height
 const ratio = width / height

 // Return common aspect ratios
 if (Math.abs(ratio - 9 / 16) < 0.01) return "9:16" // Shorts
 if (Math.abs(ratio - 1) < 0.01) return "1:1" // Square
 if (Math.abs(ratio - 16 / 9) < 0.01) return "16:9" // Standard widescreen
 if (Math.abs(ratio - 4 / 3) < 0.01) return "4:3" // Standard fullscreen

 return `${width}:${height}`
}

export const fetchChannelAnalytics = async (
 startDate: string,
 endDate: string,
 channelId?: string,
) => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )

 const idParam = channelId ? `channel==${channelId}` : "channel==MINE"
 // Expanded metric list to match Data Coverage Catalog requirements
 const metrics =
  "views,estimatedMinutesWatched,subscribersGained,likes,comments,shares,estimatedRevenue,adImpressions,cpm,monetizedPlaybacks,playbackBasedCpm"

 const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}&metrics=${metrics}&dimensions=day`
 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to fetch channel analytics")
 const data = await response.json()
 return normalizeReportData(data)
}

export const fetchDemographicAnalytics = async (
 startDate: string,
 endDate: string,
 channelId?: string,
) => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )

 const idParam = channelId ? `channel==${channelId}` : "channel==MINE"
 const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}&metrics=viewerPercentage&dimensions=ageGroup,gender`
 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to fetch demographic analytics")
 const data = await response.json()
 return normalizeReportData(data)
}

export const fetchTrafficSourceAnalytics = async (
 startDate: string,
 endDate: string,
 channelId?: string,
) => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )

 const idParam = channelId ? `channel==${channelId}` : "channel==MINE"
 // Added subscribersGained and estimatedRevenue to traffic source analysis
 const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}&metrics=views,subscribersGained,estimatedRevenue&dimensions=insightTrafficSourceType`
 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok)
  await handleYouTubeApiError(
   response,
   "Failed to fetch traffic source analytics",
  )
 const data = await response.json()
 return normalizeReportData(data)
}

export const fetchDailyAnalytics = async (
 startDate: string,
 endDate: string,
 channelId?: string,
) => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )

 const idParam = channelId ? `channel==${channelId}` : "channel==MINE"
 // Added monetization depth to daily metrics
 const metrics =
  "views,estimatedMinutesWatched,subscribersGained,estimatedRevenue,likes,comments,shares,adImpressions,cpm,monetizedPlaybacks"

 const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}&metrics=${metrics}&dimensions=day`
 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to fetch daily analytics")
 const data = await response.json()
 return normalizeReportData(data)
}

export const fetchShortsPlaylistIds = async (
 channelId: string,
): Promise<Set<string>> => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )

 const shortsIds = new Set<string>()
 const shortsPlaylistId = channelId.startsWith("UC")
  ? `UUSH${channelId.substring(2)}`
  : channelId

 try {
  let nextPageToken = ""
  do {
   const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${shortsPlaylistId}&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`
   const response = await proxyFetch(url, {
    headers: { Authorization: `Bearer ${token}` },
   })

   if (!response.ok) break
   const data = await response.json()

   ;(data.items || []).forEach((item: any) => {
    const videoId = item?.contentDetails?.videoId
    if (videoId) shortsIds.add(String(videoId))
   })

   nextPageToken = data.nextPageToken || ""
  } while (nextPageToken)
 } catch (error) {
  console.warn("Failed to fetch hidden Shorts playlist IDs", error)
 }

 return shortsIds
}

/**
 * Global Summary: Fetch lifetime totals without dimensions to avoid video-level truncation.
 */
export const fetchGlobalLifetimeAnalytics = async (
 startDate: string,
 endDate: string,
 channelId?: string,
) => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )

 const idParam = channelId ? `channel==${channelId}` : "channel==MINE"
 // No dimensions = true lifetime summary for the entire channel entity.
 const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,subscribersGained,subscribersLost,likes,comments,shares,estimatedRevenue`
 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok)
  await handleYouTubeApiError(
   response,
   "Failed to fetch global lifetime analytics",
  )
 const data = await response.json()
 return normalizeReportData(data)
}

export const fetchGeographyAnalytics = async (
 startDate: string,
 endDate: string,
 channelId?: string,
) => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )

 const idParam = channelId ? `channel==${channelId}` : "channel==MINE"
 const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewDuration&dimensions=country`
 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to fetch geography analytics")
 const data = await response.json()
 return normalizeReportData(data)
}
