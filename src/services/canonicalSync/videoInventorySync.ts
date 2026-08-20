import {
 handleYouTubeApiError,
 proxyFetch,
 refreshTokenIfExpired,
} from "../youtube/youtubeApiClient"
import {
 fetchChannelProfile,
 fetchShortsPlaylistIds,
 fetchVideoCategories,
} from "../youtubeService"
import type { CanonicalRawAuditEntry, CanonicalVideoRecord } from "./contracts"
import { normalizeVideoRecord } from "./normalizers/video"

const batch = <T>(items: T[], size: number): T[][] => {
 const chunks: T[][] = []
 for (let index = 0; index < items.length; index += size) {
  chunks.push(items.slice(index, index + size))
 }
 return chunks
}

const fetchAllVideoIds = async (uploadsPlaylistId: string): Promise<{
 videoIds: string[]
 pages: unknown[]
}> => {
 const token = await refreshTokenIfExpired()
 const videoIds: string[] = []
 const pages: unknown[] = []
 let nextPageToken = ""
 do {
  const response = await proxyFetch(
   `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50${
    nextPageToken ? `&pageToken=${nextPageToken}` : ""
   }`,
   {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
   },
  )
  if (!response.ok) {
   await handleYouTubeApiError(response, "Failed to fetch canonical video inventory IDs")
  }
  const data = await response.json()
  pages.push(data)
  ;(data?.items || []).forEach((item: any) => {
   const videoId = String(item?.contentDetails?.videoId || "")
   if (videoId) videoIds.push(videoId)
  })
  nextPageToken = String(data?.nextPageToken || "")
 } while (nextPageToken)
 return { videoIds: Array.from(new Set(videoIds)), pages }
}

const fetchVideoBatchDetails = async (videoIds: string[]): Promise<{
 items: any[]
 payload: unknown
}> => {
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(
  `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,status,topicDetails,liveStreamingDetails,localizations,player,recordingDetails&id=${videoIds.join(",")}`,
  {
   headers: token ? { Authorization: `Bearer ${token}` } : {},
  },
 )
 if (!response.ok) {
  await handleYouTubeApiError(response, "Failed to fetch canonical video details")
 }
 const data = await response.json()
 return {
  items: Array.isArray(data?.items) ? data.items : [],
  payload: data,
 }
}

export const syncVideoInventory = async (
 channelId: string,
 syncRunId: string,
 uploadsPlaylistIdOverride?: string | null,
): Promise<{
 records: CanonicalVideoRecord[]
 audit: CanonicalRawAuditEntry[]
}> => {
 const profile = uploadsPlaylistIdOverride ? null : await fetchChannelProfile()
 const uploadsPlaylistId = String(uploadsPlaylistIdOverride || profile?.uploadsPlaylistId || "")
 if (!uploadsPlaylistId) {
  return { records: [], audit: [] }
 }
 const [inventory, categoryList, shortsIds] = await Promise.all([
  fetchAllVideoIds(uploadsPlaylistId),
  fetchVideoCategories(),
  fetchShortsPlaylistIds(channelId).catch(() => new Set<string>()),
 ])
 const videoIds = inventory.videoIds
 const categoryMap = Object.fromEntries(
  categoryList.map((entry: { id: string; title: string }) => [
   String(entry.id),
   String(entry.title),
  ]),
 )
 const records: CanonicalVideoRecord[] = []
 const audit: CanonicalRawAuditEntry[] = [{
  id: `${syncRunId}::uploads_inventory`,
  channelId,
  syncRunId,
  stage: "video_inventory",
  source: "data_api",
  recordedAt: new Date().toISOString(),
  payload: inventory.pages,
 }]
 for (const ids of batch(videoIds, 50)) {
  const detailBatch = await fetchVideoBatchDetails(ids)
  detailBatch.items.forEach((item) => {
   const record = normalizeVideoRecord(channelId, item, categoryMap)
   records.push(
    shortsIds.has(record.videoId) && record.privacyStatus === "public"
     ? { ...record, format: "shorts", isShort: true }
     : record,
   )
  })
  audit.push({
   id: `${syncRunId}::video_inventory::${ids[0] || "empty"}`,
   channelId,
   syncRunId,
   stage: "video_inventory",
   source: "data_api",
   recordedAt: new Date().toISOString(),
   payload: {
    videoIds: ids,
    response: detailBatch.payload,
   },
  })
 }
 return { records, audit }
}
