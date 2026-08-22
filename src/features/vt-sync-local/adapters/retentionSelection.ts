import type { VtSyncVideoItem } from "./contracts"

export const VT_SYNC_BASE_RETENTION_PROFILE = Object.freeze({
 selectionMode: "top_by_views_by_format" as const,
 longFormLimit: 5,
 shortsLimit: 5,
 maximumVideos: 10,
})

export const VT_SYNC_RETENTION_CURVE_METRICS = [
 "audienceWatchRatio",
 "relativeRetentionPerformance",
] as const

export const VT_SYNC_RETENTION_GRANULAR_METRICS = [
 "startedWatching",
 "stoppedWatching",
 "totalSegmentImpressions",
] as const

export const VT_SYNC_RETENTION_METRICS = [
 ...VT_SYNC_RETENTION_CURVE_METRICS,
 ...VT_SYNC_RETENTION_GRANULAR_METRICS,
] as const

export type VtSyncRetentionFormat = "long" | "short"

export type VtSyncBaseRetentionSelection = {
 profile: typeof VT_SYNC_BASE_RETENTION_PROFILE
 selectedVideoIds: string[]
 selectedVideos: VtSyncVideoItem[]
 eligibleCounts: Record<VtSyncRetentionFormat, number>
 selectedCounts: Record<VtSyncRetentionFormat, number>
 shortages: Record<VtSyncRetentionFormat, number>
 estimatedRequests: number
}

export type VtSyncRetentionTargetSelection = {
 selectionMode: "explicit_manual" | "top_by_views_by_format"
 targetVideoIds: string[]
 baseline: VtSyncBaseRetentionSelection
}

const numberOrZero = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value === "string" && value.trim()) {
  const parsed = Number(value.replace(/[$,% ,]/g, ""))
  return Number.isFinite(parsed) ? parsed : 0
 }
 return 0
}

const publishedTime = (value: unknown): number => {
 const parsed = new Date(String(value || "")).getTime()
 return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Resolve only formats already established by the canonical video catalog.
 * Retention selection must not guess from a title, thumbnail, or duration.
 */
export const resolveVtSyncStoredVideoFormat = (video: Pick<VtSyncVideoItem, "format">): VtSyncRetentionFormat | null => {
 const format = String(video.format || "").trim().toLowerCase().replace(/[\s_-]/g, "")
 if (format === "short" || format === "shorts") return "short"
 if (format === "long" || format === "longform" || format === "video" || format === "videoondemand" || format === "vod") return "long"
 return null
}

const isRetentionEligible = (video: VtSyncVideoItem): boolean => {
 if (!String(video.id || "").trim()) return false
 if (!resolveVtSyncStoredVideoFormat(video)) return false
 const status = String(video.privacyStatus || "").trim().toLowerCase()
 if (["deleted", "unavailable", "rejected", "failed", "metadata pending"].includes(status)) return false
 return String(video.title || "").trim().toLowerCase() !== "metadata pending"
}

const compareRetentionCandidates = (left: VtSyncVideoItem, right: VtSyncVideoItem): number =>
 numberOrZero(right.metrics?.views) - numberOrZero(left.metrics?.views) ||
 publishedTime(right.publishedAt) - publishedTime(left.publishedAt) ||
 left.id.localeCompare(right.id)

export const selectVtSyncBaseRetentionVideos = (
 videos: readonly VtSyncVideoItem[],
): VtSyncBaseRetentionSelection => {
 const uniqueEligible = new Map<string, VtSyncVideoItem>()
 videos.forEach((video) => {
  if (isRetentionEligible(video) && !uniqueEligible.has(video.id)) uniqueEligible.set(video.id, video)
 })

 const long = [...uniqueEligible.values()]
  .filter((video) => resolveVtSyncStoredVideoFormat(video) === "long")
  .sort(compareRetentionCandidates)
 const short = [...uniqueEligible.values()]
  .filter((video) => resolveVtSyncStoredVideoFormat(video) === "short")
  .sort(compareRetentionCandidates)
 const selectedLong = long.slice(0, VT_SYNC_BASE_RETENTION_PROFILE.longFormLimit)
 const selectedShort = short.slice(0, VT_SYNC_BASE_RETENTION_PROFILE.shortsLimit)
 const selectedVideos = [...selectedLong, ...selectedShort]
 const selectedCounts = { long: selectedLong.length, short: selectedShort.length }

 return {
  profile: VT_SYNC_BASE_RETENTION_PROFILE,
  selectedVideoIds: selectedVideos.map((video) => video.id),
  selectedVideos,
  eligibleCounts: { long: long.length, short: short.length },
  selectedCounts,
  shortages: {
   long: VT_SYNC_BASE_RETENTION_PROFILE.longFormLimit - selectedCounts.long,
   short: VT_SYNC_BASE_RETENTION_PROFILE.shortsLimit - selectedCounts.short,
  },
  estimatedRequests: Math.min(selectedVideos.length, VT_SYNC_BASE_RETENTION_PROFILE.maximumVideos),
 }
}

export const selectVtSyncRetentionTargets = (
 videos: readonly VtSyncVideoItem[],
 explicitVideoIds: readonly string[] = [],
): VtSyncRetentionTargetSelection => {
 const baseline = selectVtSyncBaseRetentionVideos(videos)
 const knownVideoIds = new Set(videos.map((video) => video.id))
 const manualIds = [...new Set(explicitVideoIds.filter((id) => knownVideoIds.has(id)))]
 return manualIds.length > 0
  ? { selectionMode: "explicit_manual", targetVideoIds: manualIds, baseline }
  : { selectionMode: baseline.profile.selectionMode, targetVideoIds: baseline.selectedVideoIds, baseline }
}
