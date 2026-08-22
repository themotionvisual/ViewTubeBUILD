import {
 refreshTokenIfExpired,
 proxyFetch,
 handleYouTubeApiError,
 YouTubeApiError,
 ChannelProfile,
 VideoSnippet,
 VideoStats,
 BASE_URL,
} from "./youtubeApiClient"
import { parseDurationSeconds } from "../dataUtils"
import { getCanonicalAnalyticsCache } from "../analytics/DataStore"
import {
 isUnifiedYouTubeWriteTransportEnabled,
 addUnifiedPlaylistItem,
 postUnifiedCommentReply,
 postUnifiedTopLevelComment,
 removeUnifiedPlaylistItem,
 updateUnifiedThumbnail,
 updateUnifiedComment,
 updateUnifiedVideo,
 uploadUnifiedVideo,
} from "./youtubeWriteTransport"

/**
 * YouTube Data Fetcher
 * Handles fetching video and channel metadata from YouTube Data API v3.
 */

const normalizeHandle = (raw: unknown): string | null => {
 const value = String(raw || "").trim()
 if (!value) return null
 return value.replace(/^@/, "")
}

export const parseChannelHandleFromApi = (channel: any): string | null => {
 return (
  normalizeHandle(channel?.handle) ||
  normalizeHandle(channel?.snippet?.customUrl) ||
  normalizeHandle(channel?.brandingSettings?.channel?.customUrl) ||
  null
 )
}

/**
 * Resolves a YouTube handle or custom URL to a Channel ID.
 * Required for components that allow searching by handle.
 */
export const resolveChannelHandle = async (handle: string): Promise<string | null> => {
  const token = await refreshTokenIfExpired();
  if (!token) return null;

  // Clean the handle string (strip @ if present)
  const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;

  try {
    const url = `${BASE_URL}/channels?forHandle=${encodeURIComponent(cleanHandle)}&part=id`;
    const res = await proxyFetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].id;
    }
    return null;
  } catch (error) {
    console.error("[youtubeDataFetcher] resolveChannelHandle failed:", error);
    return null;
  }
};

const youtubeDataAccessWarnings = new Set<string>()

const warnYouTubeDataAccessOnce = (key: string, message: string) => {
 if (youtubeDataAccessWarnings.has(key)) return
 youtubeDataAccessWarnings.add(key)
 console.warn(message)
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
  "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,brandingSettings&mine=true",
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
 const channelHandle = parseChannelHandleFromApi(channel)

 return {
  id: channel.id,
  name: channel.snippet.title,
  channelHandle,
  subscriberCount: channel.statistics.subscriberCount,
  totalViews: channel.statistics.viewCount,
  totalVideos: channel.statistics.videoCount,
  profilePictureUrl: channel.snippet.thumbnails.default.url,
  publishedAt: channel.snippet.publishedAt,
  uploadsPlaylistId:
   channel.contentDetails?.relatedPlaylists?.uploads || undefined,
 }
}

/** Channel-branding values that can safely seed a new upload. */
export type ChannelPublishingDefaults = {
 description: string
 tags: string[]
}

export const fetchChannelPublishingDefaults = async (): Promise<ChannelPublishingDefaults> => {
 const token = await refreshTokenIfExpired()
 if (!token) {
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )
 }

 const response = await proxyFetch(
  "https://www.googleapis.com/youtube/v3/channels?part=brandingSettings&mine=true",
  { headers: { Authorization: `Bearer ${token}` } },
 )

 if (!response.ok) await handleYouTubeApiError(response, "Failed to fetch channel publishing defaults")
 const data = await response.json()
 const branding = data.items?.[0]?.brandingSettings?.channel || {}
 const rawKeywords = String(branding.keywords || "")
 const tags = (rawKeywords.match(/"([^"]+)"|'([^']+)'|[^,\s]+/g) || [])
  .map((tag) => tag.trim().replace(/^['"]|['"]$/g, "").trim())
  .filter(Boolean)

 return {
  description: String(branding.description || "").trim(),
  tags: Array.from(new Set(tags)),
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
   const parsed = getCanonicalAnalyticsCache() as Record<string, any>
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
   `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,status,player&id=${batch.join(",")}`,
   {
    headers: { Authorization: `Bearer ${token}` },
   },
  )

  if (!response.ok) {
   await handleYouTubeApiError(response, "Failed to fetch video stats")
  }
  const data = await response.json()

  ;(data.items || []).forEach((item: any) => {
   const rawDuration = item.contentDetails?.duration || ""
   const durationSec = parseDurationSeconds(rawDuration)

   let isVertical = false
   const embedHtml = item.player?.embedHtml || ""
   const widthMatch = embedHtml.match(/width="(\d+)"/)
   const heightMatch = embedHtml.match(/height="(\d+)"/)
   if (widthMatch && heightMatch) {
    const w = parseInt(widthMatch[1], 10)
    const h = parseInt(heightMatch[1], 10)
    isVertical = h > w
   }

   stats.push({
    videoId: item.id,
    views: item.statistics?.viewCount || "0",
    likes: item.statistics?.likeCount || "0",
    comments: item.statistics?.commentCount || "0",
    duration: rawDuration,
    durationSeconds: durationSec,
    durationRaw: rawDuration,
    privacyStatus: item.status?.privacyStatus || "",
    isShort: isVertical && durationSec <= 180,
   })
  })
 }
 return stats
}

type VideoDetailsCacheEntry = {
  title: string
  thumbnail: string
  description: string
  tags: string[]
  categoryId?: string
  categoryName?: string
  defaultLanguage?: string
  defaultAudioLanguage?: string
  authScopeUsed?: "public" | "channel_owner" | "content_owner"
  fetchedAt: number
}
const VIDEO_DETAILS_CACHE_KEY = "vt_video_details_cache_v2"
const VIDEO_CATEGORY_TAXONOMY_KEY = "vt_video_category_taxonomy_us"
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
  options: { signal?: AbortSignal } = {},
): Promise<
  Record<
    string,
    {
      title: string
      thumbnail: string
      description: string
      tags: string[]
      categoryId?: string
      categoryName?: string
      defaultLanguage?: string
      defaultAudioLanguage?: string
      authScopeUsed?: "public" | "channel_owner" | "content_owner"
    }
  >
> => {
 const token = await refreshTokenIfExpired()
 if (!token) return {}

 const cache = loadVideoDetailsCache()
  const out: Record<
    string,
    {
      title: string
      thumbnail: string
      description: string
      tags: string[]
      categoryId?: string
      categoryName?: string
      defaultLanguage?: string
      defaultAudioLanguage?: string
      authScopeUsed?: "public" | "channel_owner" | "content_owner"
    }
  > = {}

 let categoryTaxonomy: Record<string, string> = {}
 try {
  categoryTaxonomy = JSON.parse(localStorage.getItem(VIDEO_CATEGORY_TAXONOMY_KEY) || "{}") as Record<string, string>
 } catch {
  categoryTaxonomy = {}
 }

 const needed = Array.from(
  new Set(videoIds.map((id) => String(id || "").trim()).filter(Boolean)),
 ).filter((id) => {
  const cached = cache[id]
  if (!cached) return true
  return Date.now() - cached.fetchedAt > 14 * 24 * 60 * 60 * 1000
 })

 videoIds.forEach((id) => {
  const key = String(id || "").trim()
  if (!key) return
  const cached = cache[key]
  if (cached) {
   out[key] = {
    title: cached.title,
    thumbnail: cached.thumbnail,
    description: cached.description,
    tags: cached.tags,
    categoryId: cached.categoryId,
    categoryName: cached.categoryName,
    defaultLanguage: cached.defaultLanguage,
    defaultAudioLanguage: cached.defaultAudioLanguage,
    authScopeUsed: cached.authScopeUsed || "channel_owner",
   }
  }
 })

 for (let i = 0; i < needed.length; i += 50) {
  const batch = needed.slice(i, i + 50)
  const response = await proxyFetch(
   `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${batch.join(",")}`,
   { headers: { Authorization: `Bearer ${token}` }, signal: options.signal },
  )

  if (!response.ok) {
   continue
  }

  const data = await response.json()
  ;(data.items || []).forEach((item: any) => {
   const id = String(item.id || "")
   if (!id) return
   const title = String(item.snippet?.title || "")
   const thumbnail = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
   const description = String(item.snippet?.description || "")
   const categoryId = String(item.snippet?.categoryId || "")
   const tags =
    Array.isArray(item.snippet?.tags) ?
     item.snippet.tags.map((t: any) => String(t || "")).filter(Boolean)
    : []

   out[id] = {
    title,
    thumbnail,
    description,
    tags,
    categoryId,
    categoryName: categoryTaxonomy[categoryId] || undefined,
    defaultLanguage: item.snippet?.defaultLanguage || undefined,
    defaultAudioLanguage: item.snippet?.defaultAudioLanguage || undefined,
    authScopeUsed: "channel_owner",
   }
   cache[id] = {
    title,
    thumbnail,
    description,
    tags,
    categoryId,
    categoryName: categoryTaxonomy[categoryId] || undefined,
    defaultLanguage: item.snippet?.defaultLanguage || undefined,
    defaultAudioLanguage: item.snippet?.defaultAudioLanguage || undefined,
    authScopeUsed: "channel_owner",
    fetchedAt: Date.now(),
   }
  })
 }

 saveVideoDetailsCache(cache)
 return out
}

export const fetchVideoMetadata = async (
 videoIds: string[],
): Promise<Map<string, { duration: number; aspectRatio: string }>> => {
 const token = await refreshTokenIfExpired()
 if (!token) return new Map()

 const batches: string[][] = []
 for (let i = 0; i < videoIds.length; i += 50) {
  batches.push(videoIds.slice(i, i + 50))
 }

 const metadataMap = new Map<
  string,
  { duration: number; aspectRatio: string }
 >()

 for (const batch of batches) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${batch.join(",")}`

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
     const duration = parseDurationSeconds(item.contentDetails.duration)
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

function calculateAspectRatio(contentDetails: any): string {
 if (!contentDetails || !contentDetails.width || !contentDetails.height) {
  return "unknown"
 }

 const width = contentDetails.width
 const height = contentDetails.height
 const ratio = width / height

 if (Math.abs(ratio - 9 / 16) < 0.01) return "9:16"
 if (Math.abs(ratio - 1) < 0.01) return "1:1"
 if (Math.abs(ratio - 16 / 9) < 0.01) return "16:9"
 if (Math.abs(ratio - 4 / 3) < 0.01) return "4:3"

 return `${width}:${height}`
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
 const shortsPlaylistId =
  channelId.startsWith("UC") ? `UUSH${channelId.substring(2)}` : channelId

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

// --- Additional Data Methods from YouTubeService ---

export const getChannelOverview = async () => {
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(
  `${BASE_URL}/channels?part=snippet,statistics,brandingSettings&mine=true`,
  {
   headers: token ? { Authorization: `Bearer ${token}` } : {},
  },
 )
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to fetch channel overview")
 const data = await response.json()
 const channel = data.items?.[0]

 if (!channel) throw new Error("No channel found")

 return {
  id: channel.id,
  title: channel.snippet.title,
  description: channel.snippet.description,
  customUrl: parseChannelHandleFromApi(channel),
  thumbnail: channel.snippet.thumbnails.high.url,
  stats: {
   viewCount: parseInt(channel.statistics.viewCount),
   subscriberCount: parseInt(channel.statistics.subscriberCount),
   videoCount: parseInt(channel.statistics.videoCount),
  },
 }
}

export const getRecentVideos = async (maxResults = 10) => {
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(
  `${BASE_URL}/search?part=snippet&maxResults=${maxResults}&order=date&type=video&forMine=true`,
  {
   headers: token ? { Authorization: `Bearer ${token}` } : {},
  },
 )
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to fetch recent videos")
 const data = await response.json()
 return data.items || []
}

export const fetchVideoDetails = async (videoId: string) => {
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(
  `${BASE_URL}/videos?part=snippet,status&id=${videoId}`,
  {
   headers: token ? { Authorization: `Bearer ${token}` } : {},
  },
 )
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to fetch video details")
 const data = await response.json()
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

export const updateVideo = async (videoId: string, details: any) => {
 if (isUnifiedYouTubeWriteTransportEnabled()) return updateUnifiedVideo(videoId, details)
 const token = await refreshTokenIfExpired()
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

 const response = await proxyFetch(`${BASE_URL}/videos?part=snippet,status`, {
  method: "PUT",
  body: JSON.stringify(body),
  headers: {
   "Content-Type": "application/json",
   ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
 })
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to update video")
 return response.json()
}

export const updateVideoThumbnail = async (
 videoId: string,
 thumbnailFile: File,
) => {
 if (isUnifiedYouTubeWriteTransportEnabled()) return updateUnifiedThumbnail(videoId, thumbnailFile)
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(
  `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`,
  {
   method: "POST",
   headers: {
    "Content-Type": thumbnailFile.type,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
   },
   body: thumbnailFile,
  },
 )
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to update thumbnail")
 return response.json()
}

export const uploadVideo = async (file: File, details: any) => {
 if (isUnifiedYouTubeWriteTransportEnabled()) {
  return uploadUnifiedVideo(file, {
   title: details.title || "Untitled Video", description: details.description || "", categoryId: details.categoryId || "22",
   tags: details.tags || [], privacyStatus: details.privacyStatus || "private",
  })
 }
 const token = await refreshTokenIfExpired()
 if (!token) throw new Error("Unauthorized to upload video")

 const metadata = {
  snippet: {
   title: details.title || "Untitled Video",
   description: details.description || "",
   tags: details.tags || [],
   categoryId: details.categoryId || "22", // Default to People & Blogs
   defaultLanguage: details.defaultLanguage || "en",
   defaultAudioLanguage: details.defaultAudioLanguage || "en",
  },
  status: {
   privacyStatus: details.privacyStatus || "private",
   madeForKids: details.madeForKids || false,
   embeddable: details.embeddable !== false,
   publicStatsViewable: details.publicStatsViewable !== false,
   license: details.license || "youtube",
  },
  recordingDetails: {
   recordingDate: details.recordingDate || undefined,
   locationDescription: details.locationDescription || undefined,
  }
 }

 const boundary = "-------314159265358979323846"
 const delimiter = "\r\n--" + boundary + "\r\n"
 const close_delim = "\r\n--" + boundary + "--"

 const multipartRequestBody =
  delimiter +
  "Content-Type: application/json\r\n\r\n" +
  JSON.stringify(metadata) +
  delimiter +
  "Content-Type: " + file.type + "\r\n\r\n"

 // Note: For very large files in the browser, a Resumable Upload is preferred. 
 // We use multipart here assuming moderate file sizes for the Upload Scheduler UI scope.
 const blob = new Blob([multipartRequestBody, file, close_delim], { type: 'multipart/related; boundary=' + boundary })

 const response = await proxyFetch(
  "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status,recordingDetails",
  {
   method: "POST",
   headers: {
    "Content-Type": "multipart/related; boundary=" + boundary,
    Authorization: `Bearer ${token}`,
   },
   body: blob,
  }
 )

 if (!response.ok) {
  await handleYouTubeApiError(response, "Failed to upload video")
 }
 return response.json()
}

export const fetchVideoCategories = async () => {
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(
  `${BASE_URL}/videoCategories?part=snippet&regionCode=US`,
  {
   headers: token ? { Authorization: `Bearer ${token}` } : {},
  },
 )
 if (!response.ok) {
  if (response.status === 403) {
   warnYouTubeDataAccessOnce(
    "videoCategories403",
    "[YouTube Data] videoCategories denied (403). Continuing in degraded mode.",
   )
   return []
  }
  await handleYouTubeApiError(response, "Failed to fetch categories")
 }
 const data = await response.json()
 const categories = (data.items || []).map((item: any) => ({
  id: item.id,
  title: item.snippet.title,
 }))
 try {
  const categoryMap = Object.fromEntries(
   categories.map((item: { id: string; title: string }) => [String(item.id), String(item.title)]),
  )
  localStorage.setItem(VIDEO_CATEGORY_TAXONOMY_KEY, JSON.stringify(categoryMap))
 } catch {
  // Keep app resilient if storage is unavailable.
 }
 return categories
}

export const fetchUserPlaylists = async () => {
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(
  `${BASE_URL}/playlists?part=snippet&mine=true&maxResults=50`,
  {
   headers: token ? { Authorization: `Bearer ${token}` } : {},
  },
 )
 if (!response.ok) {
  if (response.status === 403) {
   warnYouTubeDataAccessOnce(
    "userPlaylists403",
    "[YouTube Data] playlists.mine denied (403). Continuing in degraded mode.",
   )
   return []
  }
  await handleYouTubeApiError(response, "Failed to fetch playlists")
 }
 const data = await response.json()
 return (data.items || []).map((item: any) => ({
  id: item.id,
  title: item.snippet.title,
 }))
}

export const fetchVideoPlaylistMemberships = async (
 videoId: string,
 playlistIds: string[],
) => {
 const token = await refreshTokenIfExpired()
 const memberships: any[] = []
 await Promise.all(
  playlistIds.map(async (playlistId) => {
   try {
    const response = await proxyFetch(
     `${BASE_URL}/playlistItems?part=id&playlistId=${playlistId}&videoId=${videoId}`,
     {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
     },
    )
    if (!response.ok) return
    const data = await response.json()
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

export const addToPlaylist = async (playlistId: string, videoId: string) => {
 if (isUnifiedYouTubeWriteTransportEnabled()) return addUnifiedPlaylistItem(playlistId, videoId)
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(`${BASE_URL}/playlistItems?part=snippet`, {
  method: "POST",
  body: JSON.stringify({
   snippet: {
    playlistId,
    resourceId: { kind: "youtube#video", videoId },
   },
  }),
  headers: {
   "Content-Type": "application/json",
   ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
 })
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to add to playlist")
 return response.json()
}

export const removeFromPlaylist = async (playlistItemId: string) => {
 if (isUnifiedYouTubeWriteTransportEnabled()) return removeUnifiedPlaylistItem(playlistItemId)
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(
  `${BASE_URL}/playlistItems?id=${playlistItemId}`,
  {
   method: "DELETE",
   headers: token ? { Authorization: `Bearer ${token}` } : {},
  },
 )
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to remove from playlist")
 return response.status === 204 ? { success: true } : response.json()
}

let commentThreadsForbiddenForSession = false

export const fetchVideoComments = async (videoId: string, maxResults = 5) => {
 if (commentThreadsForbiddenForSession) return []
 const token = await refreshTokenIfExpired()
 if (!token) return []
 const url = `${BASE_URL}/commentThreads?part=snippet,replies&videoId=${videoId}&maxResults=${maxResults}&order=time`
 const response = await proxyFetch(url, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
 })

 if (response.status === 403) {
  commentThreadsForbiddenForSession = true
  return []
 }

 if (response.status === 404) {
  return []
 }

 if (!response.ok) {
  await handleYouTubeApiError(response, "Failed to fetch comments")
 }
 const data = await response.json()
 return (data.items || []).map((item: any) => ({
  id: item.id,
  text: item.snippet.topLevelComment.snippet.textDisplay,
  author: item.snippet.topLevelComment.snippet.authorDisplayName,
  publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
 }))
}

/**
 * Universal Analytics Fetcher
 * Targets all core, ad, and reach metrics defined in documentation.
 */
export const fetchComprehensiveChannelAnalytics = async (
 startDate: string,
 endDate: string,
 dimensions: string[] = ["day"],
) => {
 const token = await refreshTokenIfExpired()
 if (!token) throw new Error("Unauthorized to access YouTube Analytics.")

 const metrics = [
  "views",
  "comments",
  "likes",
  "dislikes",
  "shares",
  "subscribersGained",
  "subscribersLost",
  "estimatedMinutesWatched",
  "averageViewDuration",
  "averageViewPercentage",
  "videoThumbnailImpressions",
  "videoThumbnailImpressionsClickRate",
  "redViews",
  "estimatedRedMinutesWatched",
  "viewerPercentage",
  "cardClickRate",
  "adImpressions",
  "monetizedPlaybacks",
  "cpm",
  "grossRevenue",
  "estimatedAdRevenue",
  "estimatedRevenue",
  "videosAddedToPlaylists",
  "videosRemovedFromPlaylists",
 ]

 const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=${metrics.join(",")}&dimensions=${dimensions.join(",")}`

 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })

 if (!response.ok) {
  await handleYouTubeApiError(response, "Comprehensive analytics sync failed")
 }

 return response.json()
}

/**
 * Retention Intelligence Fetcher
 * Pulls moment-by-moment retention and relative benchmark performance.
 */
export const fetchRetentionAnalytics = async (videoId: string) => {
 const token = await refreshTokenIfExpired()
 if (!token) throw new Error("Unauthorized")

 const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&metrics=audienceWatchRatio,relativeRetentionPerformance&dimensions=elapsedVideoTimeRatio&filters=video==${videoId}`

 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok)
  await handleYouTubeApiError(response, "Retention sync failed")
 return response.json()
}

const fetchCompleteCommentReplies = async (parentId: string, token: string, signal?: AbortSignal) => {
 const replies: any[] = []
 let pageToken = ""

 do {
  const params = new URLSearchParams({ part: "snippet", parentId, maxResults: "100" })
  if (pageToken) params.set("pageToken", pageToken)
  const response = await proxyFetch(`${BASE_URL}/comments?${params.toString()}`, {
   headers: { Authorization: `Bearer ${token}` },
   signal,
  })
  if (!response.ok) throw new Error("Failed to fetch complete comment replies")
  const page = await response.json()
  replies.push(...(page.items || []))
  pageToken = page.nextPageToken || ""
 } while (pageToken)

 return replies
}

export interface CommentThreadFetchOptions {
 initialNewCount?: number
 onInitialResults?: (threads: any[]) => void | Promise<void>
 signal?: AbortSignal
}

export const fetchAllCommentThreads = async (
 maxResults = 20,
 channelId?: string,
 options: CommentThreadFetchOptions = {},
) => {
 const token = await refreshTokenIfExpired()
 if (!token) return []

 // Resolve channel ID — the API requires an actual ID, not "mine"
 let resolvedChannelId = channelId || ""
 if (!resolvedChannelId) {
  try {
   const cached = getCanonicalAnalyticsCache() as Record<string, any>
   resolvedChannelId = cached?.profile?.id || ""
  } catch {}
 }
 if (!resolvedChannelId) {
  try {
   const profileReq = await proxyFetch(
    `${BASE_URL}/channels?part=id&mine=true`,
    { headers: { Authorization: `Bearer ${token}` } },
   )
   if (profileReq.ok) {
    const pData = await profileReq.json()
    resolvedChannelId = pData.items?.[0]?.id || ""
   }
  } catch {}
 }
 if (!resolvedChannelId) {
  console.warn("fetchAllCommentThreads: No channel ID resolved")
  return []
 }

 const threads: any[] = []
 let pageToken = ""
 let initialResultsPublished = false
 const initialNewCount = options.onInitialResults
  ? Math.max(0, options.initialNewCount || 0)
  : 0
 const hydrateThreads = (pageThreads: any[]) => Promise.all(pageThreads.map(async (thread: any) => {
  const includedReplies = thread.replies?.comments || []
  const totalReplyCount = thread.snippet?.totalReplyCount || 0
  const parentId = thread.snippet?.topLevelComment?.id
  if (!parentId || includedReplies.length >= totalReplyCount) return thread

  try {
   const replies = await fetchCompleteCommentReplies(parentId, token, options.signal)
   return { ...thread, replies: { ...thread.replies, comments: replies } }
  } catch (error) {
   console.warn("Unable to load every reply for comment thread", error)
   return { ...thread, repliesComplete: false }
  }
 }))

 do {
  const pageSize = !initialResultsPublished && initialNewCount > 0
   ? initialNewCount
   : Math.min(maxResults, 100)
  const params = new URLSearchParams({
   part: "snippet,replies",
   allThreadsRelatedToChannelId: resolvedChannelId,
   maxResults: String(pageSize),
   order: "time",
  })
  if (pageToken) params.set("pageToken", pageToken)
  const response = await proxyFetch(
   `${BASE_URL}/commentThreads?${params.toString()}`,
   { headers: { Authorization: `Bearer ${token}` }, signal: options.signal },
  )
  if (!response.ok) {
   if (response.status === 403) {
    warnYouTubeDataAccessOnce(
     "comments403",
     "[YouTube Data] Comments denied (403). Continuing in degraded mode.",
   )
   return []
   }
   await handleYouTubeApiError(response, "Failed to fetch comment threads")
  }
  const page = await response.json()
  const hydratedPage = await hydrateThreads(page.items || [])
  threads.push(...hydratedPage)
  pageToken = page.nextPageToken || ""

  if (!initialResultsPublished && initialNewCount > 0 && options.onInitialResults) {
   const initialThreads = threads.filter((thread: any) => {
    if (thread.repliesComplete === false) return false
    const replies = thread.replies?.comments || []
    return !replies.some((reply: any) => reply.snippet?.authorChannelId?.value === resolvedChannelId)
   }).slice(0, initialNewCount)

   if (initialThreads.length >= initialNewCount || !pageToken) {
    initialResultsPublished = true
    await options.onInitialResults(initialThreads)
   }
  }
 } while (pageToken)

 return threads
}

export const postCommentReply = async (parentId: string, text: string) => {
 if (isUnifiedYouTubeWriteTransportEnabled()) return postUnifiedCommentReply(parentId, text)
 const token = await refreshTokenIfExpired()
 if (!token) throw new Error("Unauthorized")
 const response = await proxyFetch(`${BASE_URL}/comments?part=snippet`, {
  method: "POST",
  headers: {
   Authorization: `Bearer ${token}`,
   "Content-Type": "application/json",
  },
  body: JSON.stringify({
   snippet: {
    parentId: parentId,
    textOriginal: text,
   },
  }),
 })
 if (!response.ok) await handleYouTubeApiError(response, "Failed to post reply")
 return response.json()
}

export const postVideoTopLevelComment = async (videoId: string, text: string) => {
 if (isUnifiedYouTubeWriteTransportEnabled()) return postUnifiedTopLevelComment(videoId, text)
 const token = await refreshTokenIfExpired()
 if (!token) throw new Error("Unauthorized")
 const response = await proxyFetch(`${BASE_URL}/commentThreads?part=snippet`, {
  method: "POST",
  headers: {
   Authorization: `Bearer ${token}`,
   "Content-Type": "application/json",
  },
  body: JSON.stringify({
   snippet: {
    videoId,
    topLevelComment: { snippet: { textOriginal: text } },
   },
  }),
 })
 if (!response.ok) await handleYouTubeApiError(response, "Failed to post top-level comment")
 return response.json()
}

export const updateCommentText = async (commentId: string, text: string) => {
 if (isUnifiedYouTubeWriteTransportEnabled()) return updateUnifiedComment(commentId, text)
 const token = await refreshTokenIfExpired()
 if (!token) throw new Error("Unauthorized")
 const response = await proxyFetch(`${BASE_URL}/comments?part=snippet`, {
  method: "PUT",
  headers: {
   Authorization: `Bearer ${token}`,
   "Content-Type": "application/json",
  },
  body: JSON.stringify({
   id: commentId,
   snippet: {
    textOriginal: text,
   },
  }),
 })
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to update comment")
 return response.json()
}

// ============================================================================
// COMMUNITY POST / ACTIVITIES API
// ============================================================================

export interface CommunityPostContent {
 type: "text" | "poll" | "image" | "video"
 text: string
 pollOptions?: string[]
 imageUrl?: string
 videoId?: string
}

export interface ScheduledCommunityPost {
 id: string
 content: CommunityPostContent
 scheduledAt: string
 status: "scheduled" | "posted" | "failed" | "cancelled"
 createdAt: string
 postedAt?: string
 error?: string
}

// Local storage key for scheduled posts
const SCHEDULED_POSTS_KEY = "vt_scheduled_community_posts"

/**
 * Get all scheduled community posts from local storage
 */
export const getScheduledPosts = (): ScheduledCommunityPost[] => {
 try {
  const stored = localStorage.getItem(SCHEDULED_POSTS_KEY)
  if (!stored) return []
  return JSON.parse(stored)
 } catch {
  return []
 }
}

/**
 * Save scheduled posts to local storage
 */
const saveScheduledPosts = (posts: ScheduledCommunityPost[]) => {
 localStorage.setItem(SCHEDULED_POSTS_KEY, JSON.stringify(posts))
}

/**
 * Schedule a community post for later
 */
export const scheduleCommunityPost = (
 content: CommunityPostContent,
 scheduledAt: string
): ScheduledCommunityPost => {
 const post: ScheduledCommunityPost = {
  id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  content,
  scheduledAt,
  status: "scheduled",
  createdAt: new Date().toISOString(),
 }
 
 const posts = getScheduledPosts()
 posts.push(post)
 saveScheduledPosts(posts)
 
 return post
}

/**
 * Update a scheduled post
 */
export const updateScheduledPost = (
 postId: string,
 updates: Partial<Pick<ScheduledCommunityPost, "content" | "scheduledAt" | "status">>
): ScheduledCommunityPost | null => {
 const posts = getScheduledPosts()
 const idx = posts.findIndex(p => p.id === postId)
 if (idx === -1) return null
 
 posts[idx] = { ...posts[idx], ...updates }
 saveScheduledPosts(posts)
 
 return posts[idx]
}

/**
 * Cancel a scheduled post
 */
export const cancelScheduledPost = (postId: string): boolean => {
 const posts = getScheduledPosts()
 const idx = posts.findIndex(p => p.id === postId)
 if (idx === -1) return false
 
 posts[idx].status = "cancelled"
 saveScheduledPosts(posts)
 
 return true
}

/**
 * Delete a scheduled post
 */
export const deleteScheduledPost = (postId: string): boolean => {
 const posts = getScheduledPosts()
 const filtered = posts.filter(p => p.id !== postId)
 if (filtered.length === posts.length) return false
 
 saveScheduledPosts(filtered)
 return true
}

/**
 * Post a community post to YouTube
 * Note: YouTube's Community Posts API (activities.insert) has limited support
 * and may require specific permissions. This implementation provides the
 * structure for when full API access is available.
 * 
 * Current workaround: Opens YouTube Studio in a new tab with pre-filled content
 */
export const postCommunityPost = async (
 content: CommunityPostContent,
 channelId?: string
): Promise<{ success: boolean; method: "api" | "redirect"; url?: string; error?: string }> => {
 const token = await refreshTokenIfExpired()
 
 // Check if we have API access for community posts
 // YouTube's activities.insert endpoint is deprecated/limited for community posts
 // Most implementations redirect to YouTube Studio
 
 // Build YouTube Studio URL with pre-populated content
 const studioUrl = new URL("https://studio.youtube.com/channel/community")
 
 // Unfortunately, YouTube Studio doesn't support deep linking with pre-filled content
 // The best we can do is open the community tab
 
 // Try the activities API first (may not work for community posts)
 if (token) {
  try {
   // Note: This endpoint is limited and may not work for community posts
   // YouTube deprecated direct community post creation via API
   const response = await proxyFetch(`${BASE_URL}/activities?part=snippet,contentDetails`, {
    method: "POST",
    headers: {
     Authorization: `Bearer ${token}`,
     "Content-Type": "application/json",
    },
    body: JSON.stringify({
     snippet: {
      description: content.text,
     },
     contentDetails: {
      bulletin: {
       resourceId: content.videoId ? {
        kind: "youtube#video",
        videoId: content.videoId,
       } : undefined,
      },
     },
    }),
   })
   
   if (response.ok) {
    const result = await response.json()
    return { success: true, method: "api" }
   }
  } catch (e) {
   console.warn("[CommunityPost] API method failed, falling back to redirect", e)
  }
 }
 
 // Fallback: Copy content to clipboard and open YouTube Studio
 try {
  await navigator.clipboard.writeText(content.text)
 } catch {
  // Clipboard access may fail in some contexts
 }
 
 return {
  success: true,
  method: "redirect",
  url: "https://studio.youtube.com/channel/community",
 }
}

/**
 * Process scheduled posts that are due
 */
export const processScheduledPosts = async (): Promise<{
 processed: string[]
 failed: string[]
}> => {
 const posts = getScheduledPosts()
 const now = new Date()
 const processed: string[] = []
 const failed: string[] = []
 
 for (const post of posts) {
  if (post.status !== "scheduled") continue
  
  const scheduledTime = new Date(post.scheduledAt)
  if (scheduledTime > now) continue
  
  try {
   const result = await postCommunityPost(post.content)
   
   if (result.success) {
    post.status = "posted"
    post.postedAt = now.toISOString()
    processed.push(post.id)
    
    // If redirect method, open the URL
    if (result.method === "redirect" && result.url) {
     window.open(result.url, "_blank")
    }
   } else {
    post.status = "failed"
    post.error = result.error || "Unknown error"
    failed.push(post.id)
   }
  } catch (e: any) {
   post.status = "failed"
   post.error = e.message || "Post failed"
   failed.push(post.id)
  }
 }
 
 saveScheduledPosts(posts)
 
 return { processed, failed }
}
