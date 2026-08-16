import { normalizeVideoRecord } from "../canonicalSync/normalizers/video"
import {
 listCanonicalVideoRecords,
 replaceCanonicalVideoInventory,
} from "../canonicalSync/storage"
import type { CanonicalVideoRecord } from "../canonicalSync/contracts"
import {
 readYouTubeAnalyticsCache,
 writeYouTubeAnalyticsCache,
} from "../analytics/DataStore"
import { authorizedGoogleRead } from "../youtube/googleReadTransport"
import type {
 VideoAsset,
 VideoAssetCatalogErrorCode,
} from "./contracts"

export const VIDEO_ASSET_CATALOG_FRESHNESS_KEY = "vt_video_asset_catalog_freshness_v1"
export const VIDEO_INVENTORY_MAX_AGE_MS = 6 * 60 * 60 * 1000

type CatalogFreshness = Record<string, string>

export class VideoAssetCatalogError extends Error {
 code: VideoAssetCatalogErrorCode
 recoverable: boolean

 constructor(code: VideoAssetCatalogErrorCode, message: string, recoverable = true) {
  super(message)
  this.name = "VideoAssetCatalogError"
  this.code = code
  this.recoverable = recoverable
 }
}

const safeFreshness = (): CatalogFreshness => {
 try {
  return JSON.parse(localStorage.getItem(VIDEO_ASSET_CATALOG_FRESHNESS_KEY) || "{}") as CatalogFreshness
 } catch {
  return {}
 }
}

export const getVideoAssetCatalogSyncedAt = (channelId: string): string | null =>
 safeFreshness()[channelId] || null

export const isVideoAssetCatalogStale = (channelId: string): boolean => {
 const value = getVideoAssetCatalogSyncedAt(channelId)
 const timestamp = value ? new Date(value).getTime() : Number.NaN
 return !Number.isFinite(timestamp) || Date.now() - timestamp >= VIDEO_INVENTORY_MAX_AGE_MS
}

const markVideoAssetCatalogFresh = (channelId: string, syncedAt: string): void => {
 try {
  localStorage.setItem(
   VIDEO_ASSET_CATALOG_FRESHNESS_KEY,
   JSON.stringify({ ...safeFreshness(), [channelId]: syncedAt }),
  )
 } catch {
  // IndexedDB remains authoritative when storage metadata is unavailable.
 }
}

const normalizeFormat = (format: unknown, isShort?: boolean): VideoAsset["format"] => {
 if (isShort) return "short"
 const value = String(format || "").toLowerCase()
 if (value.includes("short")) return "short"
 if (value.includes("live")) return "live"
 if (value.includes("long") || value.includes("demand")) return "long"
 return "unknown"
}

export const canonicalRecordToVideoAsset = (record: CanonicalVideoRecord): VideoAsset => ({
 channelId: record.channelId,
 videoId: record.videoId,
 title: record.title || `Untitled video (${record.videoId})`,
 thumbnailUrl: record.thumbnail || `https://img.youtube.com/vi/${record.videoId}/hqdefault.jpg`,
 publishedAt: record.publishedAt || null,
 durationSeconds: Number.isFinite(record.durationSeconds) ? record.durationSeconds : null,
 format: normalizeFormat(record.format, record.isShort),
})

const sortAndDedupe = (items: VideoAsset[]): VideoAsset[] => {
 const byId = new Map<string, VideoAsset>()
 items.forEach((item) => {
  const videoId = item.videoId.trim()
  const channelId = item.channelId.trim()
  if (!videoId || !channelId) return
  byId.set(videoId, { ...item, videoId, channelId })
 })
 return Array.from(byId.values()).sort((left, right) =>
  String(right.publishedAt || "").localeCompare(String(left.publishedAt || "")),
 )
}

const legacyOwnerChannelId = (cache: Record<string, unknown>): string => {
 const profile = (cache.profile || cache.channelBaseline || {}) as Record<string, unknown>
 return String(profile.channelId || profile.id || "").trim()
}

const readLegacyAssets = (channelId: string): VideoAsset[] => {
 const cache = readYouTubeAnalyticsCache()
 const rows = Array.isArray(cache.videos) ? cache.videos : []
 const owner = legacyOwnerChannelId(cache)
 const rowOwners = new Set(
  rows.map((row) => String((row as Record<string, unknown>)?.channelId || "").trim()).filter(Boolean),
 )
 if (owner && owner !== channelId) return []
 if (!owner && (rowOwners.size !== 1 || !rowOwners.has(channelId))) return []

 return sortAndDedupe(
  rows.map((raw) => {
   const row = (raw || {}) as Record<string, unknown>
   const videoId = String(row.videoId || row.id || "").trim()
   return {
    channelId,
    videoId,
    title: String(row.title || `Untitled video (${videoId})`),
    thumbnailUrl: String(
     row.thumbnailUrl || row.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    ),
    publishedAt: String(row.publishedAt || row.uploadDate || "") || null,
    durationSeconds: Number.isFinite(Number(row.durationSeconds)) ? Number(row.durationSeconds) : null,
    format: normalizeFormat(row.format || row.contentType, Boolean(row.isShort)),
   }
  }),
 )
}

export const restoreVideoAssetCatalog = async (
 channelId: string,
): Promise<{ items: VideoAsset[]; source: "canonical_indexeddb" | "legacy_migration" | null }> => {
 try {
  const records = await listCanonicalVideoRecords(channelId)
  const items = sortAndDedupe(records.map(canonicalRecordToVideoAsset))
  if (items.length > 0) return { items, source: "canonical_indexeddb" }
 } catch {
  // Fall through to the channel-owned compatibility projection.
 }
 const legacy = readLegacyAssets(channelId)
 return { items: legacy, source: legacy.length > 0 ? "legacy_migration" : null }
}

const readGoogleError = async (response: Response): Promise<VideoAssetCatalogError> => {
 const payload = await response.json().catch(() => null) as any
 const reason = String(payload?.error?.errors?.[0]?.reason || payload?.reason || "")
 const message = String(payload?.error?.message || payload?.error || `YouTube request failed (${response.status}).`)
 if (response.status === 401) return new VideoAssetCatalogError("auth", "Reconnect your YouTube channel to reload assets.")
 if (reason === "quotaExceeded" || reason === "rateLimitExceeded" || response.status === 429) {
  return new VideoAssetCatalogError("quota", "YouTube quota is temporarily unavailable. Cached assets remain available.")
 }
 if (reason === "insufficientPermissions") {
  return new VideoAssetCatalogError("scope", "YouTube read permission is missing. Reconnect the channel and approve access.")
 }
 if (response.status === 403) return new VideoAssetCatalogError("forbidden", message)
 if (response.status >= 500) return new VideoAssetCatalogError("network", "YouTube is temporarily unavailable. Try again shortly.")
 return new VideoAssetCatalogError("unknown", message)
}

const readJson = async <T>(url: string, signal?: AbortSignal): Promise<T> => {
 let response: Response
 try {
  response = await authorizedGoogleRead(url, { signal })
 } catch (error) {
  if (error instanceof DOMException && error.name === "AbortError") throw error
  throw new VideoAssetCatalogError("network", "ViewTube could not reach YouTube. Cached assets remain available.")
 }
 if (!response.ok) throw await readGoogleError(response)
 return response.json() as Promise<T>
}

const fetchUploadsPlaylistId = async (channelId: string, signal?: AbortSignal): Promise<string> => {
 const payload = await readJson<any>(
  `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(channelId)}`,
  signal,
 )
 const uploads = String(payload?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || "")
 if (!uploads) throw new VideoAssetCatalogError("forbidden", "The connected account did not return an uploads playlist.")
 return uploads
}

const fetchAllUploadIds = async (playlistId: string, signal?: AbortSignal): Promise<string[]> => {
 const ids: string[] = []
 let nextPageToken = ""
 do {
  const query = new URLSearchParams({
   part: "contentDetails",
   playlistId,
   maxResults: "50",
  })
  if (nextPageToken) query.set("pageToken", nextPageToken)
  const payload = await readJson<any>(
   `https://www.googleapis.com/youtube/v3/playlistItems?${query.toString()}`,
   signal,
  )
  ;(Array.isArray(payload?.items) ? payload.items : []).forEach((item: any) => {
   const videoId = String(item?.contentDetails?.videoId || "").trim()
   if (videoId) ids.push(videoId)
  })
  nextPageToken = String(payload?.nextPageToken || "")
 } while (nextPageToken)
 return Array.from(new Set(ids))
}

const batch = <T>(items: T[], size: number): T[][] => {
 const result: T[][] = []
 for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size))
 return result
}

const fetchVideoRecords = async (
 channelId: string,
 videoIds: string[],
 signal?: AbortSignal,
): Promise<CanonicalVideoRecord[]> => {
 const records: CanonicalVideoRecord[] = []
 for (const ids of batch(videoIds, 50)) {
  const query = new URLSearchParams({
   part: "snippet,statistics,contentDetails,status,topicDetails",
   id: ids.join(","),
  })
  const payload = await readJson<any>(
   `https://www.googleapis.com/youtube/v3/videos?${query.toString()}`,
   signal,
  )
  ;(Array.isArray(payload?.items) ? payload.items : []).forEach((item: any) => {
   const record = normalizeVideoRecord(channelId, item, {})
   if (record.videoId) records.push(record)
  })
 }
 return records
}

const projectAssetsToLegacyCache = (channelId: string, assets: VideoAsset[]): void => {
 const cache = readYouTubeAnalyticsCache()
 const owner = legacyOwnerChannelId(cache)
 if (owner && owner !== channelId) return
 writeYouTubeAnalyticsCache({
  ...cache,
  videos: assets.map((asset) => ({
   videoId: asset.videoId,
   channelId: asset.channelId,
   title: asset.title,
   thumbnail: asset.thumbnailUrl,
   thumbnailUrl: asset.thumbnailUrl,
   publishedAt: asset.publishedAt || "",
   durationSeconds: asset.durationSeconds,
   format: asset.format,
   isShort: asset.format === "short",
  })),
 })
}

export const refreshVideoAssetCatalog = async (
 channelId: string,
 signal?: AbortSignal,
): Promise<{ items: VideoAsset[]; syncedAt: string }> => {
 const uploadsPlaylistId = await fetchUploadsPlaylistId(channelId, signal)
 const videoIds = await fetchAllUploadIds(uploadsPlaylistId, signal)
 const records = await fetchVideoRecords(channelId, videoIds, signal)
 await replaceCanonicalVideoInventory(channelId, records)
 const items = sortAndDedupe(records.map(canonicalRecordToVideoAsset))
 const syncedAt = new Date().toISOString()
 markVideoAssetCatalogFresh(channelId, syncedAt)
 projectAssetsToLegacyCache(channelId, items)
 window.dispatchEvent(new CustomEvent("vt_video_asset_catalog_updated", {
  detail: { channelId, count: items.length, syncedAt },
 }))
 return { items, syncedAt }
}
