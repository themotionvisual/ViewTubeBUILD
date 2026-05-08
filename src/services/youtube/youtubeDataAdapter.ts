import {
 fetchChannelProfile,
 fetchVideoList,
 fetchVideoStats,
 fetchVideoDetails,
 fetchVideoComments,
 fetchUserPlaylists,
 fetchVideoCategories,
 updateVideo,
 updateVideoThumbnail,
 uploadVideo,
} from "./youtubeDataFetcher"
import type { AdapterOutcome } from "./apiCapabilityRegistry"

export type DataAdapterResult<T> = {
 outcome: AdapterOutcome
 data: T | null
 reason?: string
}

const ok = <T>(data: T): DataAdapterResult<T> => ({
 outcome: "ok",
 data,
})

const degraded = <T>(reason: string, data: T | null = null): DataAdapterResult<T> => ({
 outcome: "degraded",
 data,
 reason,
})

export const youtubeDataAdapter = {
 async getChannelProfile(): Promise<DataAdapterResult<Awaited<ReturnType<typeof fetchChannelProfile>>>> {
  try {
   return ok(await fetchChannelProfile())
  } catch (error: any) {
   return degraded(error?.message || "Failed to fetch channel profile.")
  }
 },

 async getVideoList(maxResults = 50) {
  try {
   return ok(await fetchVideoList(maxResults))
  } catch (error: any) {
   return degraded(error?.message || "Failed to fetch video list.")
  }
 },

 async getVideoStats(videoIds: string[]) {
  try {
   return ok(await fetchVideoStats(videoIds))
  } catch (error: any) {
   return degraded(error?.message || "Failed to fetch video stats.")
  }
 },

 async getVideoDetails(videoId: string) {
  try {
   return ok(await fetchVideoDetails(videoId))
  } catch (error: any) {
   return degraded(error?.message || "Failed to fetch video details.")
  }
 },

 async getVideoComments(videoId: string, maxResults = 100) {
  try {
   return ok(await fetchVideoComments(videoId, maxResults))
  } catch (error: any) {
   return degraded(error?.message || "Failed to fetch video comments.")
  }
 },

 async getPlaylists() {
  try {
   return ok(await fetchUserPlaylists())
  } catch (error: any) {
   return degraded(error?.message || "Failed to fetch user playlists.")
  }
 },

 async getCategories() {
  try {
   return ok(await fetchVideoCategories())
  } catch (error: any) {
   return degraded(error?.message || "Failed to fetch category taxonomy.")
  }
 },

 async patchVideo(videoId: string, updates: Parameters<typeof updateVideo>[1]) {
  try {
   return ok(await updateVideo(videoId, updates))
  } catch (error: any) {
   return degraded(error?.message || "Failed to update video.")
  }
 },

 async patchThumbnail(videoId: string, file: File) {
  try {
   return ok(await updateVideoThumbnail(videoId, file))
  } catch (error: any) {
   return degraded(error?.message || "Failed to update thumbnail.")
  }
 },

 async createUpload(file: File, metadata: Parameters<typeof uploadVideo>[1]) {
  try {
   return ok(await uploadVideo(file, metadata))
  } catch (error: any) {
   return degraded(error?.message || "Failed to upload video.")
  }
 },
}
