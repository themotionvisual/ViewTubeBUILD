export interface VideoAsset {
 channelId: string
 videoId: string
 title: string
 thumbnailUrl: string
 publishedAt: string | null
 durationSeconds: number | null
 format: "short" | "long" | "live" | "unknown"
}

export type VideoAssetCatalogStatus =
 | "idle"
 | "restoring"
 | "refreshing"
 | "ready"
 | "confirmed_empty"
 | "error"

export type VideoAssetCatalogErrorCode =
 | "auth"
 | "scope"
 | "quota"
 | "forbidden"
 | "network"
 | "unknown"

export interface VideoAssetCatalogSnapshot {
 channelId: string | null
 status: VideoAssetCatalogStatus
 items: VideoAsset[]
 revision: number
 source: "canonical_indexeddb" | "legacy_migration" | "data_api" | null
 lastSyncedAt: string | null
 stale: boolean
 error: {
  code: VideoAssetCatalogErrorCode
  message: string
  recoverable: boolean
 } | null
}

export const EMPTY_VIDEO_ASSET_CATALOG: VideoAssetCatalogSnapshot = {
 channelId: null,
 status: "idle",
 items: [],
 revision: 0,
 source: null,
 lastSyncedAt: null,
 stale: true,
 error: null,
}
