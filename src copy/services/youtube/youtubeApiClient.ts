import {
 getAccessToken,
 logout,
 loginWithPkcePopup,
 getValidAccessToken,
 isAuthenticated,
 generateRandomString,
 generateCodeChallenge,
} from "../authSession"
import { clearAnalyticsStateForFreshSync } from "../localDataReset"
import { GoogleService } from "../googleService"
import { YouTubeUploadService } from "./youtubeUploadService"

export const BASE_URL = "https://www.googleapis.com/youtube/v3"
export const ANALYTICS_URL = "https://youtubeanalytics.googleapis.com/v2"
export const REPORTING_URL = "https://youtubereporting.googleapis.com/v1"

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
 return JSON.parse(JSON.stringify(apiCallCounts)) as YouTubeApiCallCounts
}

export const trackApiCall = (url: string) => {
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
  // Ignore tracking failures
 }
}

export const proxyFetch = async (url: string, options: RequestInit = {}) => {
 trackApiCall(url)
 return fetch(url, options)
}

export const connectChannel = async (): Promise<void> => {
 await loginWithPkcePopup()
 await clearAnalyticsStateForFreshSync()
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

export { generateRandomString, generateCodeChallenge }

export class YouTubeApiClient extends GoogleService {
 public async requestYouTube(endpoint: string, options: RequestInit = {}) {
  return this.request(BASE_URL, endpoint, options)
 }

 public async requestAnalytics(endpoint: string, options: RequestInit = {}) {
  return this.request(ANALYTICS_URL, endpoint, options)
 }

 public async fetchCommentThreads(options: { videoId?: string; allThreads?: boolean } = {}) {
  const params = new URLSearchParams({
   part: "snippet,replies",
   maxResults: "50",
  });
  if (options.videoId) params.append("videoId", options.videoId);
  else if (options.allThreads) params.append("allThreadsRelatedToChannelId", "");

  return this.requestYouTube(`/commentThreads?${params.toString()}`);
 }

 public async searchVideos(query: string, options: { location?: string; locationRadius?: string } = {}) {
  const params = new URLSearchParams({
   part: "snippet",
   q: query,
   type: "video",
   maxResults: "25",
  });
  if (options.location) params.append("location", options.location);
  if (options.locationRadius) params.append("locationRadius", options.locationRadius);

  return this.requestYouTube(`/search?${params.toString()}`);
 }

 public async insertComment(parentId: string, text: string) {
  return this.requestYouTube("/comments?part=snippet", {
   method: "POST",
   body: JSON.stringify({
    snippet: {
     parentId: parentId,
     textOriginal: text
    }
   })
  });
 }

 public async uploadVideo(file: Blob, metadata: { title: string; description: string; privacyStatus?: "public" | "private" | "unlisted" }, onProgress?: (p: number) => void) {
  return YouTubeUploadService.uploadVideo(file, metadata, onProgress);
 }
}

export const youtubeApiClient = new YouTubeApiClient()

// --- Core Types ---
export interface ChannelProfile {
 id: string
 name: string
 channelHandle?: string | null
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
