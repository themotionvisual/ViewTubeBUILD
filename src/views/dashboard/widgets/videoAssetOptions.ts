import type { VideoAsset } from "../../../services/videoAssets"

export interface VideoAssetOption {
 key: string
 val: string
 lbl: string
}

export const VIDEO_ASSET_PLACEHOLDER_KEY = "__video_placeholder__"

export const buildVideoAssetOptions = (
 assets: VideoAsset[] | null | undefined,
 query = "",
 limit = 50,
 placeholder = "Select a video...",
): VideoAssetOption[] => {
 const normalizedQuery = query.trim().toLowerCase()
 const byId = new Map<string, VideoAsset>()
 ;(assets || []).forEach((asset) => {
  const videoId = String(asset?.videoId || "").trim()
  if (videoId && !byId.has(videoId)) byId.set(videoId, asset)
 })
 const matches = Array.from(byId.values()).filter((asset) =>
  !normalizedQuery ||
  asset.title.toLowerCase().includes(normalizedQuery) ||
  asset.videoId.toLowerCase().includes(normalizedQuery),
 )
 return [
  { key: VIDEO_ASSET_PLACEHOLDER_KEY, val: "", lbl: placeholder },
  ...matches.slice(0, Math.max(1, limit)).map((asset) => ({
   key: asset.videoId,
   val: asset.videoId,
   lbl: asset.title || asset.videoId,
  })),
 ]
}
