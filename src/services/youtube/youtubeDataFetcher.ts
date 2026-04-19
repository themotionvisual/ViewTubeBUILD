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
import { readYouTubeAnalyticsCache } from "../canonicalAnalyticsStore"

/**
 * YouTube Data Fetcher
 * Handles fetching video and channel metadata from YouTube Data API v3.
 */

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
  return Date.now() - cached.fetchedAt > 14 * 24 * 60 * 60 * 1000
 })

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

// --- Additional Data Methods from YouTubeService ---

export const getChannelOverview = async () => {
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(
  `${BASE_URL}/channels?part=snippet,statistics,brandingSettings&mine=true`,
  {
   headers: token ? { Authorization: `Bearer ${token}` } : {},
  },
 )
 if (!response.ok) await handleYouTubeApiError(response, "Failed to fetch channel overview")
 const data = await response.json()
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

export const getRecentVideos = async (maxResults = 10) => {
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(
  `${BASE_URL}/search?part=snippet&maxResults=${maxResults}&order=date&type=video&forMine=true`,
  {
   headers: token ? { Authorization: `Bearer ${token}` } : {},
  },
 )
 if (!response.ok) await handleYouTubeApiError(response, "Failed to fetch recent videos")
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
 if (!response.ok) await handleYouTubeApiError(response, "Failed to fetch video details")
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
 if (!response.ok) await handleYouTubeApiError(response, "Failed to update video")
 return response.json()
}

export const updateVideoThumbnail = async (videoId: string, thumbnailFile: File) => {
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
 if (!response.ok) await handleYouTubeApiError(response, "Failed to update thumbnail")
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
 if (!response.ok) await handleYouTubeApiError(response, "Failed to fetch categories")
 const data = await response.json()
 return (data.items || []).map((item: any) => ({
  id: item.id,
  title: item.snippet.title,
 }))
}

export const fetchUserPlaylists = async () => {
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(
  `${BASE_URL}/playlists?part=snippet&mine=true&maxResults=50`,
  {
   headers: token ? { Authorization: `Bearer ${token}` } : {},
  },
 )
 if (!response.ok) await handleYouTubeApiError(response, "Failed to fetch playlists")
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
 if (!response.ok) await handleYouTubeApiError(response, "Failed to add to playlist")
 return response.json()
}

export const removeFromPlaylist = async (playlistItemId: string) => {
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(`${BASE_URL}/playlistItems?id=${playlistItemId}`, {
  method: "DELETE",
  headers: token ? { Authorization: `Bearer ${token}` } : {},
 })
 if (!response.ok) await handleYouTubeApiError(response, "Failed to remove from playlist")
 return response.status === 204 ? { success: true } : response.json()
}

export const fetchVideoComments = async (videoId: string, maxResults = 5) => {
 const token = await refreshTokenIfExpired()
 const url = `${BASE_URL}/commentThreads?part=snippet,replies&videoId=${videoId}&maxResults=${maxResults}&order=time`
 const response = await proxyFetch(url, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
 })
 if (!response.ok) await handleYouTubeApiError(response, "Failed to fetch comments")
 const data = await response.json()
 return (data.items || []).map((item: any) => ({
  id: item.id,
  text: item.snippet.topLevelComment.snippet.textDisplay,
  author: item.snippet.topLevelComment.snippet.authorDisplayName,
  publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
 }))
}

