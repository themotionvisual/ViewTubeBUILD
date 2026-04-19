import {
 connectChannel,
 disconnectChannel,
 isChannelConnected,
 refreshTokenIfExpired,
} from "./youtube/youtubeApiClient"

import {
 getChannelOverview,
 getRecentVideos,
 fetchVideoList,
 fetchVideoStats,
 fetchVideoDetails,
 updateVideo,
 updateVideoThumbnail,
 fetchVideoCategories,
 fetchUserPlaylists,
 fetchVideoPlaylistMemberships,
 addToPlaylist,
 removeFromPlaylist,
 fetchVideoComments,
} from "./youtube/youtubeDataFetcher"

import {
 getChannelAnalytics,
 getVideoAnalytics,
 fetchSingleVideoAnalytics,
} from "./youtube/youtubeAnalyticsFetcher"

/**
 * YouTube Nexus Service (Facade)
 * Re-exports functionality from modularized YouTube services.
 * Maintained for backward compatibility.
 */

class YouTubeService {
 public getChannelOverview = getChannelOverview
 public getRecentVideos = getRecentVideos
 public getChannelAnalytics = getChannelAnalytics
 public getVideoAnalytics = getVideoAnalytics
 public fetchVideoList = fetchVideoList
 public fetchVideoStats = fetchVideoStats
 public fetchVideoDetails = fetchVideoDetails
 public updateVideo = updateVideo
 public updateVideoThumbnail = updateVideoThumbnail
 public fetchVideoCategories = fetchVideoCategories
 public fetchUserPlaylists = fetchUserPlaylists
 public fetchVideoPlaylistMemberships = fetchVideoPlaylistMemberships
 public addToPlaylist = addToPlaylist
 public removeFromPlaylist = removeFromPlaylist
 public fetchVideoComments = fetchVideoComments
 public fetchSingleVideoAnalytics = fetchSingleVideoAnalytics
 
 // The legacy request method is now internal to YouTubeApiClient
 // but we can expose it via the instance if needed by legacy code.
 private async request(url: string, options: RequestInit = {}) {
  const token = await refreshTokenIfExpired()
  if (!token) throw new Error("Not authenticated")

  const headers = {
   ...options.headers,
   Authorization: `Bearer ${token}`,
   Accept: "application/json",
  }

  const response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
   disconnectChannel()
   throw new Error("Session expired")
  }

  if (!response.ok) {
   const error = await response.json()
   throw new Error(error.error?.message || "API Request failed")
  }

  return response.json()
 }
}

export const youtubeService = new YouTubeService()

// --- Re-exports for named imports ---
export * from "./youtube/youtubeApiClient"
export * from "./youtube/youtubeDataFetcher"
export * from "./youtube/youtubeAnalyticsFetcher"
