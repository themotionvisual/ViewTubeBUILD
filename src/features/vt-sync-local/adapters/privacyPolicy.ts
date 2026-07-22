import type { VtSyncSnapshot, VtSyncVideoItem } from "./contracts"

export const VT_SYNC_PRIVACY_FILTERS_KEY = "vt_sync_privacy_filters" as const

export type VtSyncPrivacyFilters = {
 excludePrivate: boolean
 excludeUnlisted: boolean
}

export const DEFAULT_VT_SYNC_PRIVACY_FILTERS: Readonly<VtSyncPrivacyFilters> = Object.freeze({
 excludePrivate: true,
 excludeUnlisted: true,
})

export const normalizeVtSyncPrivacyStatus = (value: unknown): string =>
 String(value ?? "").trim().toLowerCase()

const readVideoPrivacyStatus = (video: Record<string, unknown>): string => {
 const nestedStatus = video.status && typeof video.status === "object"
  ? (video.status as Record<string, unknown>).privacyStatus
  : video.status
 return normalizeVtSyncPrivacyStatus(video.privacyStatus ?? video.privacy ?? nestedStatus)
}

export const normalizeVtSyncPrivacyFilters = (
 input?: Partial<VtSyncPrivacyFilters> | null,
): VtSyncPrivacyFilters => ({
 excludePrivate: typeof input?.excludePrivate === "boolean"
  ? input.excludePrivate
  : DEFAULT_VT_SYNC_PRIVACY_FILTERS.excludePrivate,
 excludeUnlisted: typeof input?.excludeUnlisted === "boolean"
  ? input.excludeUnlisted
  : DEFAULT_VT_SYNC_PRIVACY_FILTERS.excludeUnlisted,
})

export const readVtSyncPrivacyFilters = (): VtSyncPrivacyFilters => {
 if (typeof localStorage === "undefined") return normalizeVtSyncPrivacyFilters()
 try {
  const raw = localStorage.getItem(VT_SYNC_PRIVACY_FILTERS_KEY)
  return raw ? normalizeVtSyncPrivacyFilters(JSON.parse(raw)) : normalizeVtSyncPrivacyFilters()
 } catch {
  return normalizeVtSyncPrivacyFilters()
 }
}

export const saveVtSyncPrivacyFilters = (
 filters: Partial<VtSyncPrivacyFilters>,
): VtSyncPrivacyFilters => {
 const normalized = normalizeVtSyncPrivacyFilters(filters)
 if (typeof localStorage !== "undefined") {
  try {
   localStorage.setItem(VT_SYNC_PRIVACY_FILTERS_KEY, JSON.stringify(normalized))
  } catch {
   // The in-memory state remains authoritative for this session when storage is unavailable.
  }
 }
 return normalized
}

export const isVtSyncVideoExcluded = (
 video: Pick<VtSyncVideoItem, "privacyStatus"> | Record<string, unknown>,
 filters: VtSyncPrivacyFilters = readVtSyncPrivacyFilters(),
): boolean => {
 const status = readVideoPrivacyStatus(video as Record<string, unknown>)
 return (filters.excludePrivate && status === "private") ||
  (filters.excludeUnlisted && status === "unlisted")
}

export const normalizeVtSyncVideoPrivacyFormat = <T extends Record<string, unknown>>(
 video: T,
): T => {
 const status = readVideoPrivacyStatus(video)
 if (status !== "private" && status !== "unlisted") return video
 return { ...video, format: "unknown" }
}

export const filterVtSyncVideos = <T extends Record<string, unknown>>(
 videos: readonly T[],
 filters: VtSyncPrivacyFilters = readVtSyncPrivacyFilters(),
): T[] => videos
 .map(normalizeVtSyncVideoPrivacyFormat)
 .filter((video) => !isVtSyncVideoExcluded(video, filters))

export const applyVtSyncPrivacyFilters = (
 snapshot: VtSyncSnapshot,
 filters: VtSyncPrivacyFilters = readVtSyncPrivacyFilters(),
): VtSyncSnapshot => ({
 ...snapshot,
 videos: filterVtSyncVideos(
  snapshot.videos as Array<VtSyncVideoItem & Record<string, unknown>>,
  filters,
 ) as VtSyncVideoItem[],
})

export const resolveVtSyncVideoFormat = ({
 privacyStatus,
 isLive,
 isShort,
}: {
 privacyStatus: unknown
 isLive: boolean
 isShort: boolean
}): "short" | "long" | "live" | "unknown" => {
 const status = normalizeVtSyncPrivacyStatus(privacyStatus)
 if (status === "private" || status === "unlisted") return "unknown"
 if (isLive) return "live"
 if (isShort) return "short"
 return "long"
}
