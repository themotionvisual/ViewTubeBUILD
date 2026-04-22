import type { CanonicalVideoRow } from "./analyticsContract"

export type SyncSourceMode = "api_analytics" | "uploads" | "both"
export type StorageMode = "sync" | "storage" | "both"

export interface EffectiveAnalyticsRows {
 rows: CanonicalVideoRow[]
 includeOnlyActive: boolean
 includedCount: number
 excludedCount: number
}

export interface RowFilterState {
 excludeByIdentity: Set<string>
 includeOnlyByIdentity: Set<string>
}

export const SYNC_SOURCE_MODE_KEY = "vt_sync_source_mode"
export const STORAGE_MODE_KEY = "vt_storage_mode"
export const UPLOAD_CACHE_FILES_KEY = "vt_uploaded_csv_cache"

export const getStoredSyncSourceMode = (): SyncSourceMode => {
 const raw = localStorage.getItem(SYNC_SOURCE_MODE_KEY)
 if (raw === "api_analytics" || raw === "uploads" || raw === "both") return raw
 return "api_analytics"
}

export const setStoredSyncSourceMode = (mode: SyncSourceMode): void => {
 localStorage.setItem(SYNC_SOURCE_MODE_KEY, mode)
}

export const getStoredStorageMode = (): StorageMode => {
 const raw = localStorage.getItem(STORAGE_MODE_KEY)
 if (raw === "sync" || raw === "storage" || raw === "both") return raw
 if (raw === "cache") {
  localStorage.setItem(STORAGE_MODE_KEY, "sync")
  return "sync"
 }
 return "sync"
}

export const setStoredStorageMode = (mode: StorageMode): void => {
 localStorage.setItem(STORAGE_MODE_KEY, mode)
}

const safeParse = <T>(raw: string | null, fallback: T): T => {
 if (!raw) return fallback
 try {
  return JSON.parse(raw) as T
 } catch {
  return fallback
 }
}

const titleIdentity = (title: string): string => `title:${title.trim().toLowerCase()}`

const rowIdentityCandidates = (row: CanonicalVideoRow): string[] => {
 const candidates: string[] = []
 const idCandidate = row.videoId?.trim()
 if (idCandidate) {
  candidates.push(idCandidate)
  candidates.push(`video:${idCandidate}`)
 }
 const normalizedTitle = row.title?.trim()
 if (normalizedTitle) {
  candidates.push(normalizedTitle)
  candidates.push(normalizedTitle.toLowerCase())
  candidates.push(titleIdentity(normalizedTitle))
 }
 return Array.from(new Set(candidates))
}

const getGlobalVideoFlags = (): Record<
 string,
 { excludeAnalysis?: boolean; includeOnly?: boolean; priorityAnalysis?: boolean }
> => {
 const brain = safeParse<Record<string, unknown>>(
  localStorage.getItem("vt_workspace_brain"),
  {},
 )
 const flags = brain.videoFlags
 if (!flags || typeof flags !== "object") return {}
 return flags as Record<
  string,
  { excludeAnalysis?: boolean; includeOnly?: boolean; priorityAnalysis?: boolean }
 >
}

export const buildRowFilterState = (): RowFilterState => {
 const flags = getGlobalVideoFlags()
 const excludeByIdentity = new Set<string>()
 const includeOnlyByIdentity = new Set<string>()

 for (const [identity, flag] of Object.entries(flags)) {
  if (flag.excludeAnalysis) excludeByIdentity.add(identity)
  if (flag.includeOnly || flag.priorityAnalysis) includeOnlyByIdentity.add(identity)
 }

 return { excludeByIdentity, includeOnlyByIdentity }
}

export const applyGlobalRowFilters = (
 rows: CanonicalVideoRow[],
): EffectiveAnalyticsRows => {
 const { excludeByIdentity, includeOnlyByIdentity } = buildRowFilterState()
 const includeOnlyActive = includeOnlyByIdentity.size > 0

 const filtered = rows.filter((row) => {
  const identities = rowIdentityCandidates(row)
  if (includeOnlyActive)
   return identities.some((identity) => includeOnlyByIdentity.has(identity))
  if (identities.some((identity) => excludeByIdentity.has(identity))) return false
  return true
 })

 return {
  rows: filtered,
  includeOnlyActive,
  includedCount: includeOnlyActive ? includeOnlyByIdentity.size : filtered.length,
  excludedCount: excludeByIdentity.size,
 }
}

export const toStorageIdentity = (videoIdOrFallback: string): string => {
 const trimmed = videoIdOrFallback.trim()
 if (!trimmed) return ""
 return trimmed
}

export const formatLastSync = (isoLike: string | null): string => {
 if (!isoLike) return "Never"
 const date = new Date(isoLike)
 if (Number.isNaN(date.getTime())) return "Never"
 const mm = String(date.getMonth() + 1).padStart(2, "0")
 const dd = String(date.getDate()).padStart(2, "0")
 const yy = String(date.getFullYear()).slice(-2)
 const hh = String(date.getHours()).padStart(2, "0")
 const min = String(date.getMinutes()).padStart(2, "0")
 const sec = String(date.getSeconds()).padStart(2, "0")
 return `${mm}/${dd}/${yy} ${hh}:${min}:${sec}`
}
