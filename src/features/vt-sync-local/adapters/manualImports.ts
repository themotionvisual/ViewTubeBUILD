import type { VtSyncSnapshot, VtSyncVideoItem, VtSyncVideoMetric } from "./contracts"
import { VT_SYNC_TABLE_DEFINITIONS } from "../upstream/tableRegistry"
import { listVtSyncDatasetTableRows } from "./localDbRepository"
import { normalizeVtSyncSnapshot } from "./snapshot"

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

export const manualImportRecordId = (tableId: string): string =>
 `${MANUAL_IMPORT_ID_PREFIX}${tableId}`

export const loadVtSyncManualImports = async (): Promise<VtSyncManualImportState> => {
 try {
  const records = await listVtSyncDatasetTableRows()
  const state: VtSyncManualImportState = { rowsByTableId: {}, capturedAtByTableId: {} }
  for (const record of records) {
   if (record.provenance !== "csv") continue
   if (!record.id.startsWith(MANUAL_IMPORT_ID_PREFIX)) continue
   const rows = Array.isArray(record.rows) ? (record.rows as unknown[]) : []
   if (!rows.length) continue
   state.rowsByTableId[record.datasetId] = rows
   if (record.capturedAt) state.capturedAtByTableId[record.datasetId] = record.capturedAt
  }
  return state
 } catch {
  return { rowsByTableId: {}, capturedAtByTableId: {} }
 }
}

// A few high-traffic tables (like `videos`) merge data from multiple
// categories and don't declare `snapshotKeys` in the registry, so map them
// explicitly to the snapshot field that visualData.ts reads from.
const EXPLICIT_TABLE_TO_SNAPSHOT_KEY: Record<string, string> = {
 videos: "videos",
 monthly_api: "dailyMetrics",
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

export const getVtSyncSnapshotKeyForTable = (tableId: string): string | undefined =>
 TABLE_ID_TO_SNAPSHOT_KEY.get(tableId)

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

const shapeManualVideoRows = (rows: unknown[]): VtSyncVideoItem[] =>
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
  const key = getVtSyncSnapshotKeyForTable(tableId)
  if (!key) continue
  overrides[key] = key === "videos" ? shapeManualVideoRows(rows) : rows
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
