import { VT_SYNC_RETENTION_METRICS } from "./retentionSelection"
import { tableRows } from "./tableData"
import { normalizeVtSyncTableRows } from "./tableData"
import type { VtSyncPrivacyFilters } from "./privacyPolicy"
import { filterVtSyncVideos } from "./privacyPolicy"
import { mergeVtSyncSupplementalTableRows } from "./manualImports"
import type { VtSyncSnapshot, VtSyncTableDefinition } from "./contracts"
import { VT_SYNC_VISIBLE_TABLE_DEFINITIONS } from "../upstream/tableRegistry"

export const RESOLVED_ANALYTICS_BUNDLE_VERSION = "vt-sync-resolved-v2" as const

export type ResolvedAnalyticsSource =
 | "youtube_data_v3"
 | "youtube_analytics_v2"
 | "youtube_reporting_v1"
 | "manual_import"
 | "previous_snapshot"
 | "derived"
 | "unknown"

export type ResolvedAnalyticsRow = Record<string, unknown>

export const resolveAnalyticsTableRows = ({
 tableId,
 snapshotRows,
 importedRows,
 recoveredRows,
 privacyFilters,
}: {
 tableId: string
 snapshot?: VtSyncSnapshot
 snapshotRows: ResolvedAnalyticsRow[]
 importedRows?: ResolvedAnalyticsRow[]
 recoveredRows?: ResolvedAnalyticsRow[]
 privacyFilters: VtSyncPrivacyFilters
}): ResolvedAnalyticsRow[] => {
 if (importedRows?.length) {
  return mergeVtSyncSupplementalTableRows<ResolvedAnalyticsRow>(tableId, snapshotRows, importedRows)
 }
 const normalizedRecoveredRows = recoveredRows?.length
  ? normalizeVtSyncTableRows(tableId, recoveredRows)
  : []
 const visibleRecoveredRows = tableId === "videos"
  ? filterVtSyncVideos(normalizedRecoveredRows, privacyFilters)
  : normalizedRecoveredRows
 return visibleRecoveredRows.length
  ? mergeVtSyncSupplementalTableRows<ResolvedAnalyticsRow>(tableId, snapshotRows, visibleRecoveredRows)
  : snapshotRows
}

export type ResolvedAnalyticsRowProvenance = {
 evidenceId: string
 rowIdentity: string
 datasetId: string
 datasetVersion: string
 channelId: string | null
 snapshotId: string
 window: string
 privacyFingerprint: string
 sources: ResolvedAnalyticsSource[]
 capturedAt: string
}

export type ResolvedAnalyticsDataset = {
 id: string
 label: string
 description: string
 datasetVersion: string
 status: "available" | "partial" | "stale" | "failed" | "unavailable"
 updatedAt: string
 rowCount: number
 sources: ResolvedAnalyticsSource[]
 missingMetrics: string[]
 rows: ResolvedAnalyticsRow[]
 rowProvenance: ResolvedAnalyticsRowProvenance[]
}

export type ResolvedAnalyticsDatasetBundleV2 = {
 version: typeof RESOLVED_ANALYTICS_BUNDLE_VERSION
 channelId: string | null
 channelName: string | null
 snapshotId: string
 capturedAt: string
 selectedWindow: string
 privacyFingerprint: string
 bundleFingerprint: string
 datasets: Record<string, ResolvedAnalyticsDataset>
 datasetOrder: string[]
}

const stableHash = (value: string): string => {
 let hash = 2166136261
 for (let index = 0; index < value.length; index += 1) {
  hash ^= value.charCodeAt(index)
  hash = Math.imul(hash, 16777619)
 }
 return (hash >>> 0).toString(36)
}

const stableJson = (value: unknown): string => {
 if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`
 if (value && typeof value === "object") {
  return `{${Object.entries(value as Record<string, unknown>)
   .sort(([left], [right]) => left.localeCompare(right))
   .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
   .join(",")}}`
 }
 return JSON.stringify(value) ?? "null"
}

export const fingerprintVtSyncPrivacyFilters = (filters: VtSyncPrivacyFilters): string =>
 `privacy-${stableHash(stableJson(filters))}`

const normalizeRetentionRows = (rows: ResolvedAnalyticsRow[]): ResolvedAnalyticsRow[] => rows.map((row) => {
 if (!Array.isArray(row.retentionMetricAvailability)) return row
 const available = new Set(row.retentionMetricAvailability.map(String))
 const visible = { ...row }
 VT_SYNC_RETENTION_METRICS.forEach((metric) => {
  if (!available.has(metric)) delete visible[metric]
 })
 return visible
})

const sourceForTable = (
 snapshot: VtSyncSnapshot,
 table: VtSyncTableDefinition,
): ResolvedAnalyticsSource[] => {
 const freshness = snapshot.datasetFreshness?.[table.id]
 const sources = new Set<ResolvedAnalyticsSource>()
 if (freshness?.source === "manual_import") sources.add("manual_import")
 if (freshness?.source === "previous_snapshot") sources.add("previous_snapshot")
 table.categoryIds.forEach((categoryId) => {
  if (/report/i.test(categoryId)) sources.add("youtube_reporting_v1")
  else if (/metadata|playlist|comment|channel/i.test(categoryId)) sources.add("youtube_data_v3")
  else sources.add("youtube_analytics_v2")
 })
 if (!sources.size) sources.add("unknown")
 return [...sources]
}

const datasetStatus = (
 rowCount: number,
 freshness: NonNullable<VtSyncSnapshot["datasetFreshness"]>[string] | undefined,
): ResolvedAnalyticsDataset["status"] => {
 if (freshness?.status === "failed") return "failed"
 if (freshness?.status === "stale") return "stale"
 if (freshness?.status === "partial" || freshness?.missingMetrics?.length) return "partial"
 return rowCount > 0 ? "available" : "unavailable"
}

const rowIdentity = (row: ResolvedAnalyticsRow, index: number): string => {
 const preferred = [
  row.videoId,
  row.id,
  row.date,
  row.day,
  row.month,
  row.term,
  row.countryCode,
  row.title,
 ].filter((value) => value !== undefined && value !== null && String(value).trim()).map(String)
 return preferred.length ? preferred.join("|") : `row-${index + 1}-${stableHash(stableJson(row))}`
}

export const buildResolvedAnalyticsDatasetBundle = (
 snapshot: VtSyncSnapshot,
 privacyFilters: VtSyncPrivacyFilters,
): ResolvedAnalyticsDatasetBundleV2 => {
 const privacyFingerprint = fingerprintVtSyncPrivacyFilters(privacyFilters)
 const selectedWindow = snapshot.selectedTimeWindow || "28d"
 const datasets = Object.fromEntries(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => {
  const rawRows = tableRows(snapshot, table, privacyFilters) as ResolvedAnalyticsRow[]
  const rows = table.id === "retentions" ? normalizeRetentionRows(rawRows) : rawRows
  const freshness = snapshot.datasetFreshness?.[table.id]
  const sources = sourceForTable(snapshot, table)
  const datasetVersion = [
   RESOLVED_ANALYTICS_BUNDLE_VERSION,
   snapshot.channelId || "anonymous",
   snapshot.snapshotId,
   selectedWindow,
   privacyFingerprint,
   table.id,
   freshness?.updatedAt || snapshot.capturedAt,
   rows.length,
   stableHash(stableJson(rows)),
  ].join(":")
  const rowProvenance = rows.map((row, index) => {
   const identity = rowIdentity(row, index)
   return {
    evidenceId: `vt:${snapshot.channelId || "anonymous"}:${snapshot.snapshotId}:${table.id}:${stableHash(`${datasetVersion}:${identity}`)}`,
    rowIdentity: identity,
    datasetId: table.id,
    datasetVersion,
    channelId: snapshot.channelId || null,
    snapshotId: snapshot.snapshotId,
    window: selectedWindow,
    privacyFingerprint,
    sources,
    capturedAt: freshness?.updatedAt || snapshot.capturedAt,
   }
  })
  const dataset: ResolvedAnalyticsDataset = {
   id: table.id,
   label: table.label,
   description: table.description,
   datasetVersion,
   status: datasetStatus(rows.length, freshness),
   updatedAt: freshness?.updatedAt || snapshot.capturedAt,
   rowCount: rows.length,
   sources,
   missingMetrics: [...(freshness?.missingMetrics || [])],
   rows,
   rowProvenance,
  }
  return [table.id, dataset]
 }))
 const datasetOrder = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)
 const bundleFingerprint = `bundle-${stableHash(datasetOrder.map((id) => datasets[id].datasetVersion).join("|"))}`
 return {
  version: RESOLVED_ANALYTICS_BUNDLE_VERSION,
  channelId: snapshot.channelId || null,
  channelName: snapshot.channelName || null,
  snapshotId: snapshot.snapshotId,
  capturedAt: snapshot.capturedAt,
  selectedWindow,
  privacyFingerprint,
  bundleFingerprint,
  datasets,
  datasetOrder,
 }
}
