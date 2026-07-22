import {
 getAccessToken,
 logout,
 getValidAccessToken,
 isAuthenticated,
 generateRandomString,
 generateCodeChallenge,
} from "../auth/authSession"
import { GoogleService } from "../googleService"
import { YouTubeUploadService } from "./youtubeUploadService"
import { isUnifiedAccountServerEnabled } from "../account/accountCoordinator"
import {
 authorizedGoogleRead,
 SERVER_ACCOUNT_SESSION_TOKEN,
} from "./googleReadTransport"

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

export const broadcastChannelAuthInvalidated = (detail?: {
 code?: number
 reason?: string
 message?: string
}) => {
 if (typeof window === "undefined") return
 window.dispatchEvent(
  new CustomEvent("vt_channel_auth_invalidated", {
   detail: detail || null,
  }),
 )
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
  logout()
  broadcastChannelAuthInvalidated({
   code,
   reason,
   message:
    "Your YouTube connection is no longer active. Connect your channel again, then run the sync again.",
  })
  throw new YouTubeApiError(
   "Your YouTube connection is no longer active. Connect your channel again, then run the sync again.",
   code,
   reason,
  )
 } else if (code === 400 && reason === "keyInvalid") {
  throw new YouTubeApiError(
   "The saved YouTube API key is invalid. Update the key in Settings, then retry the request.",
   code,
   reason,
  )
 } else if (code === 400) {
  throw new YouTubeApiError(
   "YouTube rejected this request because that report shape is not allowed for the selected metrics or breakdown. Try a different sync, use CSV import for this dataset, or retry after narrowing the request.",
   code,
   reason,
  )
 } else if (code === 402) {
  throw new YouTubeApiError(
   "This request could not continue because billing or quota access is not available for the current account or project. Check your billing and quota settings, then try again.",
   code,
   reason,
  )
 } else if (
  code === 403 &&
  (reason === "quotaExceeded" || reason === "rateLimitExceeded")
 ) {
  throw new YouTubeApiError(
   "YouTube is temporarily refusing more requests from this project because the daily quota or rate limit has been hit. Wait and try again later, or review your Google Cloud quota settings.",
   code,
   reason,
  )
 } else if (
  code === 403 &&
  (reason === "forbidden" || reason === "insufficientPermissions")
 ) {
  throw new YouTubeApiError(
   "This channel or Google project does not have permission for that YouTube request. Check the connected account, enabled APIs, and access scopes, then try again.",
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
 const method = String(options.method || "GET").toUpperCase()
 if (isUnifiedAccountServerEnabled() && method === "GET") {
  return authorizedGoogleRead(url, { signal: options.signal || undefined })
 }
 return fetch(url, options)
}

export const connectChannel = async (): Promise<void> => {
 throw new YouTubeApiError(
  "AUTH_REQUIRED: Start channel authorization through the unified account coordinator.",
  401,
  "AUTH_REQUIRED",
 )
}

export const refreshTokenIfExpired = async (): Promise<string | null> => {
 if (isUnifiedAccountServerEnabled()) return SERVER_ACCOUNT_SESSION_TOKEN
 const token = await getValidAccessToken()
 if (!token && isAuthenticated()) {
  logout()
  broadcastChannelAuthInvalidated({
   code: 401,
   reason: "authError",
   message:
    "Your YouTube connection is no longer active. Connect your channel again, then run the sync again.",
  })
 }
 return token
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
