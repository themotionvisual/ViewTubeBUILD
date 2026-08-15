import type { VtSyncSnapshot, VtSyncVideoItem } from "./contracts"

export const VT_SYNC_PRIVACY_FILTERS_KEY = "vt_sync_privacy_filters" as const
export const VT_SYNC_PRIVACY_FILTERS_VERSION = 2 as const

export type VtSyncPrivacyFilters = {
 excludePrivate: boolean
 excludeUnlisted: boolean
}

type StoredVtSyncPrivacyFilters = VtSyncPrivacyFilters & { version: number }

export const DEFAULT_VT_SYNC_PRIVACY_FILTERS: Readonly<VtSyncPrivacyFilters> = Object.freeze({
 excludePrivate: false,
 excludeUnlisted: false,
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
  if (!raw) return normalizeVtSyncPrivacyFilters()
  const stored = JSON.parse(raw) as Partial<StoredVtSyncPrivacyFilters>
  // Version-one values were implicit hide-by-default settings. Reset them once
  // so existing creators see the complete authenticated catalog.
  if (stored.version !== VT_SYNC_PRIVACY_FILTERS_VERSION) {
   const migrated = normalizeVtSyncPrivacyFilters()
   localStorage.setItem(VT_SYNC_PRIVACY_FILTERS_KEY, JSON.stringify({
    ...migrated,
    version: VT_SYNC_PRIVACY_FILTERS_VERSION,
   }))
   return migrated
  }
  return normalizeVtSyncPrivacyFilters(stored)
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
   localStorage.setItem(VT_SYNC_PRIVACY_FILTERS_KEY, JSON.stringify({
    ...normalized,
    version: VT_SYNC_PRIVACY_FILTERS_VERSION,
   }))
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
): T => video

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
 durationSeconds,
 title,
}: {
 privacyStatus?: unknown
 isLive?: boolean
 isShort?: boolean
 durationSeconds?: number
 title?: string
}): "short" | "long" | "live" => {
 const titleStr = String(title || "").toLowerCase()
 if (isLive || titleStr.includes("live stream") || titleStr.includes("is live") || titleStr.includes("live highlight")) return "live"
 if (durationSeconds !== undefined && durationSeconds > 180) return "long"
 if (isShort) return "short"
 return "long"
}
