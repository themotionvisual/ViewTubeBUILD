import type {
 VtSyncDatasetTableRowsRecord,
 VtSyncSnapshot,
 VtSyncVideoItem,
 VtSyncVideoMetric,
} from "./contracts"
import { VT_SYNC_TABLE_DEFINITIONS } from "../upstream/tableRegistry"
import { VT_SYNC_TRAFFIC_DETAIL_SOURCES } from "../upstream/trafficDetailRegistry"
import { listVtSyncDatasetTableRows } from "./localDbRepository"
import { normalizeVtSyncSnapshot } from "./snapshot"
import { buildVtSyncVideoCatalogProjection } from "./videoCatalogProjection"

// A snapshotKey → tableId map lets callers merge the freshest manual-import rows
// (persisted under `manual_import::<tableId>` in IndexedDB) into a VT-SYNC snapshot
// so the DATA VISUALS toolbox can render off CSV imports, not just API syncs.

export const MANUAL_IMPORT_ID_PREFIX = "manual_import::" as const

export type VtSyncManualImportRows = Record<string, unknown[]>
export type VtSyncManualImportTimestamps = Record<string, string>

export type VtSyncManualImportState = {
 rowsByTableId: VtSyncManualImportRows
 capturedAtByTableId: VtSyncManualImportTimestamps
}

export type VtSyncPersistedApiState = VtSyncManualImportState

export const manualImportRecordId = (tableId: string): string =>
 `${MANUAL_IMPORT_ID_PREFIX}${tableId}`

// A few high-traffic tables (like `videos`) merge data from multiple
// categories and don't declare `snapshotKeys` in the registry, so map them
// explicitly to the snapshot field that visualData.ts reads from.
const EXPLICIT_TABLE_TO_SNAPSHOT_KEY: Record<string, string> = {
 videos: "videos",
 monthly: "monthlyMetrics",
 monthly_api: "monthlyMetrics",
}

// Table id → primary snapshot key. Derived once at module load from the
// authoritative table registry so downstream additions get merged automatically.
const buildTableIdToSnapshotKey = (): Map<string, string> => {
 const map = new Map<string, string>()
 for (const [tableId, snapshotKey] of Object.entries(EXPLICIT_TABLE_TO_SNAPSHOT_KEY)) {
  map.set(tableId, snapshotKey)
 }
 for (const table of VT_SYNC_TABLE_DEFINITIONS) {
  const key = table.snapshotKeys?.[0]
  if (!key) continue
  if (!map.has(table.id)) map.set(table.id, key)
 }
 return map
}

const TABLE_ID_TO_SNAPSHOT_KEY = buildTableIdToSnapshotKey()

const isSharedSnapshotDataset = (key: string): boolean => key === "trafficDetails"

// Older persisted detail datasets were keyed by their former table/category
// ids and their rows did not include `sourceType`. The canonical detail store
// is source-scoped, so restore the missing provenance at the persistence
// boundary rather than making each table guess what an untyped row means.
const TRAFFIC_DETAIL_SOURCE_BY_TABLE_ID: Readonly<Record<string, string>> = {
 ...Object.fromEntries(VT_SYNC_TRAFFIC_DETAIL_SOURCES.map((source) => [`traffic_detail_${source.categoryId}`, source.sourceType])),
 traffic_detail_search_terms: "YT_SEARCH",
 traffic_detail_ext_websites: "EXT_URL",
 traffic_detail_suggested_videos: "RELATED_VIDEO",
 traffic_detail_hashtags: "HASHTAGS",
 traffic_detail_sound_pages: "SOUND_PAGE",
 traffic_detail_advertising: "ADVERTISING",
 traffic_detail_channel_pages: "YT_CHANNEL",
 traffic_detail_traffic_subscribers: "SUBSCRIBER",
 traffic_detail_traffic_annotation: "ANNOTATION",
 traffic_detail_traffic_campaign_card: "CAMPAIGN_CARD",
 traffic_detail_traffic_end_screen: "END_SCREEN",
 traffic_detail_traffic_live_redirect: "LIVE_REDIRECT",
 traffic_detail_traffic_product_page: "PRODUCT_PAGE",
 traffic_detail_traffic_playlist: "PLAYLIST",
 traffic_detail_traffic_yt_playlist_page: "YT_PLAYLIST_PAGE",
 traffic_detail_traffic_video_remixes: "VIDEO_REMIXES",
 traffic_detail_traffic_watch_with: "WATCH_WITH",
 traffic_detail_other_features: "YT_OTHER_PAGE",
}

const TRAFFIC_DETAIL_LEGACY_FIELD_BY_SOURCE: Readonly<Record<string, string>> = {
 ...Object.fromEntries(VT_SYNC_TRAFFIC_DETAIL_SOURCES.filter((source) => source.legacyField).map((source) => [source.sourceType, source.legacyField])),
 YT_SEARCH: "searchTerms",
 EXT_URL: "extWebsites",
 RELATED_VIDEO: "suggestedVideos",
 HASHTAGS: "hashtags",
 SOUND_PAGE: "soundPages",
 ADVERTISING: "trafficAdvertising",
 YT_CHANNEL: "trafficChannelPages",
 YT_OTHER_PAGE: "trafficOtherFeatures",
 SUBSCRIBER: "trafficSubscriberData",
 CAMPAIGN_CARD: "trafficCampaignCard",
 END_SCREEN: "trafficEndScreen",
 LIVE_REDIRECT: "trafficLiveRedirect",
 PLAYLIST: "trafficPlaylist",
 YT_PLAYLIST_PAGE: "trafficYtPlaylistPage",
}

const trafficDetailSourceForTable = (tableId: string): string | undefined =>
 TRAFFIC_DETAIL_SOURCE_BY_TABLE_ID[tableId]

const normalizeTrafficDetailRows = (tableId: string, rows: unknown[]): unknown[] => {
 const fallbackSourceType = trafficDetailSourceForTable(tableId)
 if (!fallbackSourceType) return rows
 return rows.map((entry) => {
  if (!entry || typeof entry !== "object") return entry
  const row = entry as Record<string, unknown>
  const sourceType = row.sourceType ?? row.insightTrafficSourceType ?? fallbackSourceType
  const detail = row.detail ?? row.insightTrafficSourceDetail ?? row.term ?? row.title ?? ""
  return { ...row, sourceType, detail }
 })
}

const trafficDetailRowKey = (row: unknown): string => {
 const record = row && typeof row === "object" ? row as Record<string, unknown> : {}
 return `${String(record.sourceType || record.insightTrafficSourceType || "")}::${String(record.detail || record.insightTrafficSourceDetail || record.term || "")}`
}

const mergeSharedSnapshotRows = (previous: unknown, incoming: unknown[]): unknown[] => {
 const rows = Array.isArray(previous) ? previous : []
 const merged = new Map(rows.map((row) => [trafficDetailRowKey(row), row]))
 incoming.forEach((row) => merged.set(trafficDetailRowKey(row), row))
 return [...merged.values()]
}

const mergeTrafficDayImportRows = (previous: unknown, incoming: unknown[]): unknown[] => {
 const rows = Array.isArray(previous) ? previous : []
 const keyOf = (row: unknown) => {
  const record = row && typeof row === "object" ? row as Record<string, unknown> : {}
  return `${String(record.term || record.source || record.sourceType || record.insightTrafficSourceType || "")}::${String(record.day || record.date || "")}`
 }
 const merged = new Map(rows.map((row) => [keyOf(row), row]))
 incoming.forEach((row) => {
  const key = keyOf(row)
  if (!key || key === "::") return
  const current = merged.get(key)
  if (!current || typeof current !== "object" || !row || typeof row !== "object") {
   merged.set(key, row)
   return
  }
  const supplement = row as Record<string, unknown>
  const next = { ...(current as Record<string, unknown>) }
  Object.entries(supplement).forEach(([field, value]) => {
   if ((next[field] === undefined || next[field] === null || next[field] === "") && value !== undefined && value !== null && value !== "") next[field] = value
  })
  merged.set(key, next)
 })
 return [...merged.values()]
}

const meaningfulIdentity = (value: unknown): string =>
 value === undefined || value === null || value === "" ? "" : String(value).trim()

const firstIdentity = (row: Record<string, unknown>, keys: string[]): string => {
 for (const key of keys) {
  const value = meaningfulIdentity(row[key])
  if (value) return value
 }
 return ""
}

const trafficIdentityFromUrl = (row: Record<string, unknown>): string => {
 const rawUrl = firstIdentity(row, ["videoUrl", "channelUrl", "playlistUrl", "url"])
 if (!rawUrl) return ""
 try {
  const parsed = new URL(rawUrl)
  const videoId = parsed.searchParams.get("v")
  if (videoId) return videoId
  const playlistId = parsed.searchParams.get("list")
  if (playlistId) return playlistId
  const pathIdentity = parsed.pathname.match(/^\/(?:channel\/|@)([^/]+)/)?.[1]
  return pathIdentity ? decodeURIComponent(pathIdentity) : rawUrl
 } catch {
  return rawUrl
 }
}

/**
 * Stable row identity for every non-video canonical table. The table registry
 * owns table selection; this adapter owns additive import semantics so no UI,
 * visual, or export path can let a short CSV replace a larger API dataset.
 */
const supplementalRowKey = (tableId: string, value: unknown, index: number): string => {
 const row = value && typeof value === "object" ? value as Record<string, unknown> : {}
 const tuple = (...parts: string[]) => parts.filter(Boolean).join("::")
 if (tableId.startsWith("traffic_detail_")) {
  const detailIdentity = firstIdentity(row, ["detail", "insightTrafficSourceDetail", "videoId", "channelId", "playlistId", "id", "term"])
   || trafficIdentityFromUrl(row)
  return detailIdentity ? tuple(
   "traffic-detail",
   detailIdentity,
  ) : `${tableId}::unresolved::${index}`
 }
 switch (tableId) {
  case "videos":
   return tuple("video", firstIdentity(row, ["videoId", "id", "video"]))
  case "daily":
   return tuple("time", firstIdentity(row, ["date", "day", "week"]))
  case "weekly":
   return tuple("week", firstIdentity(row, ["dateRange", "week", "date", "day"]))
  case "monthly":
  case "monthly_api":
   return tuple("time", firstIdentity(row, ["date", "month"]))
  case "channel_totals":
   return tuple("window", firstIdentity(row, ["window", "timeWindow", "dateRange"]))
  case "traffic":
   return tuple("source", firstIdentity(row, ["source", "term", "sourceType", "insightTrafficSourceType"]))
  case "demographics":
   return tuple("demographic", firstIdentity(row, ["ageGroup", "cohort"]), firstIdentity(row, ["gender"]))
  case "formats":
   return tuple("format", firstIdentity(row, ["creatorContentType", "format", "term"]))
  case "formats_subscribers":
   return tuple("format-subscriber", firstIdentity(row, ["creatorContentType", "format", "term"]), firstIdentity(row, ["subscribedStatus", "status"]))
  case "shares":
   return tuple("share", firstIdentity(row, ["sharingService", "service", "term"]))
  case "playback":
   return tuple("playback", firstIdentity(row, ["insightPlaybackLocationType", "location", "term"]))
  case "subs":
   return tuple("subscription", firstIdentity(row, ["subscribedStatus", "status", "term"]))
  case "geography":
   return tuple("country", firstIdentity(row, ["countryCode", "country"]))
  case "cities":
   return tuple("city", firstIdentity(row, ["countryCode", "country"]), firstIdentity(row, ["city"]))
  case "provinces":
   return tuple("province", firstIdentity(row, ["countryCode", "country"]), firstIdentity(row, ["province", "state"]))
  case "dma":
   return tuple("dma", firstIdentity(row, ["dma", "dmaCode", "name"]))
  case "continents":
   return tuple("continent", firstIdentity(row, ["continent", "name"]))
  case "devices":
   return tuple("device", firstIdentity(row, ["deviceType", "device", "term"]))
  case "os":
   return tuple("os", firstIdentity(row, ["operatingSystem", "os", "term"]))
  case "device_os":
   return tuple("device-os", firstIdentity(row, ["deviceType", "device"]), firstIdentity(row, ["operatingSystem", "os"]))
  case "playlists":
   return tuple("playlist", firstIdentity(row, ["playlistId", "id"]))
  case "revenue":
   return tuple("revenue", firstIdentity(row, ["day", "date"]), firstIdentity(row, ["source", "revenueSource", "term"]))
  case "ads":
   return tuple("ad", firstIdentity(row, ["adType", "term"]))
  case "retentions":
   return tuple("retention", firstIdentity(row, ["videoId", "video", "id"]), firstIdentity(row, ["elapsedVideoTimeRatio", "elapsedRatio"]))
  default: {
   const definition = VT_SYNC_TABLE_DEFINITIONS.find((table) => table.id === tableId)
   const identityColumn = definition?.columns.find((column) =>
    column.semanticRole === "identity" && !["thumbnail", "json"].includes(column.format || ""),
   )
   const identity = identityColumn ? meaningfulIdentity(row[identityColumn.key]) : ""
   return identity ? tuple(tableId, identity) : `${tableId}::unresolved::${index}`
  }
 }
}

export const mergeVtSyncSupplementalTableRows = <T = unknown>(tableId: string, previous: unknown, incoming: unknown[]): T[] => {
 const rows = Array.isArray(previous) ? previous : []
 const merged = new Map(rows.map((row, index) => [supplementalRowKey(tableId, row, index), row]))
 incoming.forEach((row, index) => {
  const key = supplementalRowKey(tableId, row, rows.length + index)
  const current = merged.get(key)
  if (!current || typeof current !== "object" || !row || typeof row !== "object") {
   merged.set(key, row)
   return
  }
  const next = { ...(current as Record<string, unknown>) }
  Object.entries(row as Record<string, unknown>).forEach(([field, value]) => {
   if ((next[field] === undefined || next[field] === null || next[field] === "") && value !== undefined && value !== null && value !== "") next[field] = value
  })
  merged.set(key, next)
 })
 return [...merged.values()] as T[]
}

const hasSourceType = (rows: unknown, sourceType: string | undefined): boolean =>
 Boolean(sourceType && Array.isArray(rows) && rows.some((row) =>
  trafficDetailRowKey(row).startsWith(`${sourceType}::`),
 ))

// Sync phases persist under category ids (for example `traffic_overview`),
// while the UI addresses the canonical table id (`traffic`). Keep that bridge
// beside the snapshot-key bridge so IndexedDB recovery uses the same contract.
const buildDatasetIdToTableId = (): Map<string, string> => {
 const map = new Map<string, string>()
 for (const table of VT_SYNC_TABLE_DEFINITIONS) {
  map.set(table.id, table.id)
  // A category can be shared by a summary table and a derived view. Preserve
  // the first registry owner, which is the source table that originally
  // persisted the legacy dataset id; do not silently reroute its rows.
  if (!map.has(table.performanceHubDatasetId)) {
   map.set(table.performanceHubDatasetId, table.id)
  }
  table.categoryIds.forEach((categoryId) => {
   if (!map.has(categoryId)) map.set(categoryId, table.id)
  })
 }
 return map
}

const DATASET_ID_TO_TABLE_ID = buildDatasetIdToTableId()

export const getVtSyncSnapshotKeyForTable = (tableId: string): string | undefined =>
 TABLE_ID_TO_SNAPSHOT_KEY.get(tableId)

export const getVtSyncTableIdForDataset = (datasetId: string): string | undefined =>
 DATASET_ID_TO_TABLE_ID.get(datasetId)

export const toVtSyncManualImportState = (
 records: VtSyncDatasetTableRowsRecord[],
 channelId?: string | null,
): VtSyncManualImportState => {
 const state: VtSyncManualImportState = { rowsByTableId: {}, capturedAtByTableId: {} }
 for (const record of records) {
  if (record.provenance !== "csv") continue
  if (!record.id.startsWith(MANUAL_IMPORT_ID_PREFIX)) continue
  if (channelId && record.channelId !== channelId) continue
  const rows = Array.isArray(record.rows) ? (record.rows as unknown[]) : []
  if (!rows.length) continue
  // Imports saved by older sync/table flows use a category id (for example
  // `traffic_overview`) rather than the current UI table id (`traffic`).
  // Normalize at the persistence boundary so tables and visuals consume the
  // same user-selected replacement rows.
  const tableId = getVtSyncTableIdForDataset(record.datasetId) || record.datasetId
  const previousCapturedAt = state.capturedAtByTableId[tableId]
  // An old alias record must never overwrite a newer import for the same
  // canonical table simply because IndexedDB returned it later.
  if (previousCapturedAt && record.capturedAt < previousCapturedAt) continue
  state.rowsByTableId[tableId] = rows
  state.capturedAtByTableId[tableId] = record.capturedAt
 }
 return state
}

export const loadVtSyncManualImports = async (channelId?: string | null): Promise<VtSyncManualImportState> => {
 try {
  const records = await listVtSyncDatasetTableRows()

  // Mobile boot can restore IndexedDB before account/channel hydration finishes.
  // A temporary null channelId must not make already-persisted local CSV data
  // disappear. When a channel is known, keep the normal channel filter. While
  // it is unknown, recover the local manual-import records and reconcile them
  // once channel identity arrives.
  return toVtSyncManualImportState(records, channelId || undefined)
 } catch {
  return { rowsByTableId: {}, capturedAtByTableId: {} }
 }
}

export const toVtSyncPersistedApiState = (
 records: VtSyncDatasetTableRowsRecord[],
 channelId?: string | null,
): VtSyncPersistedApiState => {
 const state: VtSyncPersistedApiState = { rowsByTableId: {}, capturedAtByTableId: {} }
 for (const record of records) {
  if (record.provenance !== "api" || !Array.isArray(record.rows) || !record.rows.length) continue
  if (channelId && record.channelId !== channelId) continue
  const tableId = getVtSyncTableIdForDataset(record.datasetId)
  if (!tableId) continue
  const previousCapturedAt = state.capturedAtByTableId[tableId]
  if (previousCapturedAt && record.capturedAt < previousCapturedAt) continue
  state.rowsByTableId[tableId] = record.rows
  state.capturedAtByTableId[tableId] = record.capturedAt
 }
 return state
}

export const loadVtSyncPersistedApiRows = async (channelId?: string | null): Promise<VtSyncPersistedApiState> => {
 if (!channelId) return { rowsByTableId: {}, capturedAtByTableId: {} }
 try {
  return toVtSyncPersistedApiState(await listVtSyncDatasetTableRows(), channelId)
 } catch {
  return { rowsByTableId: {}, capturedAtByTableId: {} }
 }
}

// CSV rows for the "videos" table are flat records (top-level views, watchTime,
// etc.), but the visuals adapter reads video metrics from a nested `metrics`
// bag on `VtSyncVideoItem`. Reshape imports into video items so metrics land
// where `buildVideoMetrics` looks.
const METRIC_ONLY_KEYS = new Set([
 "views",
 "watchTime",
 "revenue",
 "grossRevenue",
 "estimatedRevenue",
 "estimatedAdRevenue",
 "playbackBasedCpm",
 "adImpressions",
 "monetizedPlaybacks",
 "youtubePremiumRevenue",
 "youtubePremiumWatchTime",
 "subscribers",
 "subscribersGained",
 "subscribersLost",
 "ctr",
 "impressions",
 "avgViewDuration",
 "averageViewDuration",
 "averageViewPercentage",
 "avgPercentageViewed",
 "averagePercentageViewed",
 "likes",
 "dislikes",
 "comments",
 "shares",
 "cpm",
 "rpm",
 "engagedViews",
 "cardClicks",
 "cardsShown",
 "clicksPerCardShown",
 "cardClickRate",
 "cardTeaserClicks",
 "cardTeaserImpressions",
 "cardTeaserClickRate",
 "teaserClicksPerCardTeaserShown",
 "endScreenElementClicks",
 "endScreenElementsShown",
 "clicksPerEndScreenElementShown",
])

const shapeVideoRowsForSnapshot = (rows: unknown[]): VtSyncVideoItem[] =>
 rows
  .map((entry, index) => {
   if (!entry || typeof entry !== "object") return null
   const row = entry as Record<string, unknown>
   const metricsSeed = (row.metrics && typeof row.metrics === "object") ? { ...(row.metrics as VtSyncVideoMetric) } : {}
   const metrics: VtSyncVideoMetric = metricsSeed as VtSyncVideoMetric
   for (const [key, value] of Object.entries(row)) {
    if (!METRIC_ONLY_KEYS.has(key)) continue
    if (metrics[key] !== undefined && metrics[key] !== null) continue
    if (value === null || value === undefined || value === "") continue
    const numeric = typeof value === "number" ? value
     : typeof value === "string" ? Number(value.replace(/[$,% ]/g, ""))
     : Number.NaN
    if (Number.isFinite(numeric)) metrics[key] = numeric
   }
   const idValue = row.id ?? row.videoId ?? row.video ?? row.videoID ?? ""
   const id = typeof idValue === "string" ? idValue : String(idValue || "")
   const rawTitle = row.title ?? row.videoTitle ?? row.name ?? ""
   const title = typeof rawTitle === "string" ? rawTitle : String(rawTitle || "")
   const rawFormat = row.format ?? row.contentType ?? row.videoType ?? ""
   const format = typeof rawFormat === "string" ? rawFormat : String(rawFormat || "")
   return {
    ...(row as Record<string, unknown>),
    id: id || `vt-sync-import-video-${index + 1}`,
    title: title || "Metadata pending",
    thumbnail: typeof row.thumbnail === "string" ? row.thumbnail : "",
    publishedAt: typeof row.publishedAt === "string" ? row.publishedAt : "",
    format,
    metrics,
   } as VtSyncVideoItem
  })
  .filter((value): value is VtSyncVideoItem => value !== null)

const shouldRestoreCompactedDataset = (
 snapshot: VtSyncSnapshot,
 key: string,
 persistedRows: unknown[],
): boolean => {
 const current = snapshot[key as keyof VtSyncSnapshot]
 const currentCount = Array.isArray(current) ? current.length : 0
 if (currentCount === 0) return true
 if (!snapshot.storageMetadata?.isCompacted) return false
 // Legacy compact previews did not always record fullRowCountByField. The
 // newest same-channel IndexedDB API record is the durable table authority;
 // a larger durable set must restore any compact preview uniformly.
 return persistedRows.length > currentCount
}

// Merge CSV rows into the corresponding snapshot arrays. Manual imports always
// win over the base snapshot for that dataset (matching the toolbox table's
// `imported[tableId] || sourceRows` semantics) so what the user sees on the
// tables matches what the visuals render.
export const mergeVtSyncManualImportsIntoSnapshot = (
 snapshot: VtSyncSnapshot,
 imports: VtSyncManualImportState,
): VtSyncSnapshot => {
 const overrides: Record<string, unknown> = {}
 let hadOverride = false
 let latestCapturedAt: string | undefined
 for (const [tableId, rows] of Object.entries(imports.rowsByTableId)) {
 if (!rows || !rows.length) continue
  // Weekly Stats is derived from canonical Daily Stats and has no independent
  // snapshot store. Keep its CSV record readable for the table import UI, but
  // never inject weekly aggregates into dailyMetrics or daily-based visuals.
  if (tableId === "weekly") continue
  const key = getVtSyncSnapshotKeyForTable(tableId)
  if (!key) continue
  if (key === "videos") {
   overrides[key] = buildVtSyncVideoCatalogProjection({
    inventoryRows: [],
    persistedRows: [],
    liveRows: snapshot.videos,
    importedRows: rows as Array<Record<string, unknown>>,
   }).rows
   hadOverride = true
   const timestamp = imports.capturedAtByTableId[tableId]
   if (timestamp && (!latestCapturedAt || timestamp > latestCapturedAt)) latestCapturedAt = timestamp
   continue
  }
  const normalizedRows = key === "videos"
   ? shapeVideoRowsForSnapshot(rows)
   : isSharedSnapshotDataset(key)
    ? normalizeTrafficDetailRows(tableId, rows)
    : rows
  overrides[key] = isSharedSnapshotDataset(key)
   ? mergeSharedSnapshotRows(overrides[key] ?? snapshot[key as keyof VtSyncSnapshot], normalizedRows)
   : key === "trafficByDay"
    ? mergeTrafficDayImportRows(overrides[key] ?? snapshot.trafficByDay, normalizedRows)
    : mergeVtSyncSupplementalTableRows(tableId, overrides[key] ?? snapshot[key as keyof VtSyncSnapshot], normalizedRows)
  const legacyField = TRAFFIC_DETAIL_LEGACY_FIELD_BY_SOURCE[trafficDetailSourceForTable(tableId) || ""]
  if (legacyField) overrides[legacyField] = normalizedRows
  hadOverride = true
  const timestamp = imports.capturedAtByTableId[tableId]
  if (timestamp && (!latestCapturedAt || timestamp > latestCapturedAt)) {
   latestCapturedAt = timestamp
  }
 }
 if (!hadOverride) return snapshot
 const nextSource = snapshot.source === "empty" ? "manual" : snapshot.source
 const merged = normalizeVtSyncSnapshot({
  ...snapshot,
  ...overrides,
  source: nextSource,
  capturedAt: latestCapturedAt || snapshot.capturedAt,
 })
 return merged
}

// localStorage intentionally stores compact boot previews. Restore complete
// same-channel IndexedDB rows when a field is empty or its storage metadata
// proves that it is truncated. A full in-memory/live snapshot always remains
// authoritative, so recovery cannot replace an active sync with older rows.
export const mergeVtSyncPersistedApiRowsIntoSnapshot = (
 snapshot: VtSyncSnapshot,
 persisted: VtSyncPersistedApiState,
): VtSyncSnapshot => {
 const overrides: Record<string, unknown> = {}
 const source = snapshot as unknown as Record<string, unknown>
 for (const [tableId, rows] of Object.entries(persisted.rowsByTableId)) {
 const key = getVtSyncSnapshotKeyForTable(tableId)
  if (!key || !rows.length) continue
  const sourceType = trafficDetailSourceForTable(tableId)
  if (isSharedSnapshotDataset(key)
   ? hasSourceType(source[key], sourceType)
   : !shouldRestoreCompactedDataset(snapshot, key, rows)) continue
  const normalizedRows = key === "videos"
   ? shapeVideoRowsForSnapshot(rows)
   : isSharedSnapshotDataset(key)
    ? normalizeTrafficDetailRows(tableId, rows)
    : rows
  overrides[key] = isSharedSnapshotDataset(key)
   ? mergeSharedSnapshotRows(overrides[key] ?? source[key], normalizedRows)
   : normalizedRows
  const legacyField = TRAFFIC_DETAIL_LEGACY_FIELD_BY_SOURCE[sourceType || ""]
  if (legacyField && !(Array.isArray(source[legacyField]) && source[legacyField].length > 0)) {
   overrides[legacyField] = normalizedRows
  }
 }
 return Object.keys(overrides).length
  ? normalizeVtSyncSnapshot({ ...snapshot, ...overrides })
  : snapshot
}
