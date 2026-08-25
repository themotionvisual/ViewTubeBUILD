import { DEFAULT_VT_SYNC_PRIVACY_FILTERS } from "../../features/vt-sync-local/adapters/privacyPolicy"
import { tableRows } from "../../features/vt-sync-local/adapters/tableData"
import type {
 VtSyncDatasetFreshness,
 VtSyncSnapshot,
 VtSyncSourceApi,
 VtSyncTableDefinition,
} from "../../features/vt-sync-local/adapters/contracts"
import { VT_SYNC_CATEGORY_OPTIONS } from "../../features/vt-sync-local/upstream/syncCategoryRegistry"
import { VT_SYNC_VISIBLE_TABLE_DEFINITIONS } from "../../features/vt-sync-local/upstream/tableRegistry"
import type {
 CanonicalIntelligenceDatasetManifest,
 CanonicalIntelligenceDatasetStatus,
 CanonicalIntelligenceEvidenceBundle,
 CanonicalIntelligenceMetricSummary,
 CanonicalIntelligenceSource,
 IntelligenceDatasetCoverage,
 IntelligenceEvidenceRequest,
} from "./contracts"

export const CANONICAL_INTELLIGENCE_DATASET_COUNT = 34 as const
export const CANONICAL_INTELLIGENCE_EVIDENCE_VERSION = "vt-intelligence-evidence-v1" as const

const DEFAULT_MAXIMUM_ROWS = 8
const DEFAULT_MAXIMUM_CHARACTERS = 24_000

export const INTELLIGENCE_SECTION_DATASETS: Readonly<Record<string, readonly string[]>> = {
 "executive-summary": ["videos", "daily", "weekly", "monthly", "channel_totals"],
 "algorithm-diagnosis": [
  "traffic",
  "traffic_day",
  "traffic_detail_advertising",
  "traffic_detail_ext_websites",
  "traffic_detail_hashtags",
  "traffic_detail_traffic_subscribers",
  "traffic_detail_other_features",
  "traffic_detail_search_terms",
  "traffic_detail_suggested_videos",
  "traffic_detail_sound_pages",
  "traffic_detail_channel_pages",
 ],
 "strategy-engine": ["videos", "daily", "weekly", "monthly", "channel_totals", "traffic", "retentions", "revenue"],
 "sculpting-engine": ["videos", "creator", "formats_subscribers", "retentions"],
 "channel-pulse": ["demographics", "subs", "geography", "cities", "provinces", "dma", "continents", "devices", "os", "device_os"],
 "comparative-analysis": ["daily", "weekly", "monthly", "creator", "formats_subscribers"],
 "keyword-matrix": ["traffic_detail_search_terms", "traffic_detail_hashtags", "traffic_detail_suggested_videos", "traffic_detail_ext_websites"],
 "engagement-matrix": ["videos", "shares", "playlists"],
 "retention-burnout": ["videos", "retentions", "creator", "formats_subscribers"],
 "revenue-dynamics": ["videos", "revenue", "ads"],
 "risk-guardrails": [],
 "execution-queue": [],
}

const assertDatasetRegistry = (): void => {
 const ids = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((definition) => definition.id)
 if (ids.length !== CANONICAL_INTELLIGENCE_DATASET_COUNT || new Set(ids).size !== ids.length) {
  throw new Error(
   `[analytics-canon] Expected ${CANONICAL_INTELLIGENCE_DATASET_COUNT} unique intelligence datasets; received ${ids.length}.`,
  )
 }
}

const sourceForCategory = (source: VtSyncSourceApi): CanonicalIntelligenceSource => {
 if (source === "youtube_data_v3") return "youtube_data_v3"
 if (source === "youtube_analytics_v2") return "youtube_analytics_v2"
 if (source === "local_import") return "manual_import"
 if (source === "derived") return "derived"
 if (source === "google_workspace") return "google_workspace"
 return "unknown"
}

const freshnessCandidates = (table: VtSyncTableDefinition): string[] => [
 table.id,
 table.performanceHubDatasetId,
 table.syncUnitId || "",
 ...(table.snapshotKeys || []),
 ...table.categoryIds,
].filter(Boolean)

const resolveFreshness = (
 freshness: VtSyncDatasetFreshness | undefined,
 table: VtSyncTableDefinition,
) => {
 for (const key of freshnessCandidates(table)) {
  if (freshness?.[key]) return freshness[key]
 }
 return undefined
}

const statusFor = (
 rowCount: number,
 freshness: ReturnType<typeof resolveFreshness>,
): CanonicalIntelligenceDatasetStatus => {
 if (freshness?.status === "failed") return "failed"
 if (freshness?.status === "stale") return "stale"
 if (freshness?.status === "partial" || (freshness?.missingMetrics?.length || 0) > 0) return "partial"
 if (rowCount > 0) return "available"
 return "unavailable"
}

const safeCell = (value: unknown): string | number | boolean | null => {
 if (value === null || value === undefined || value === "") return null
 if (typeof value === "number") return Number.isFinite(value) ? value : null
 if (typeof value === "boolean") return value
 if (typeof value === "string") return value.slice(0, 280)
 if (Array.isArray(value)) return value.slice(0, 8).map(String).join(", ").slice(0, 280)
 return JSON.stringify(value).slice(0, 280)
}

const numericValue = (value: unknown): number | undefined => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string" || !value.trim()) return undefined
 const parsed = Number(value.replace(/[$,% ,]/g, ""))
 return Number.isFinite(parsed) ? parsed : undefined
}

const summarizeMetrics = (
 rows: Array<Record<string, unknown>>,
 table: VtSyncTableDefinition,
): Record<string, CanonicalIntelligenceMetricSummary> => {
 const summaries: Record<string, CanonicalIntelligenceMetricSummary> = {}
 table.columns.forEach((column) => {
  if (["text", "date", "dateRange", "dateLocal", "weekdayLocal", "timeLocal", "thumbnail", "flag", "json"].includes(column.format || "text")) return
  const values = rows
   .map((row) => numericValue(row[column.key]))
   .filter((value): value is number => value !== undefined)
  if (!values.length) return
  const sum = values.reduce((total, value) => total + value, 0)
  summaries[column.key] = {
   count: values.length,
   sum,
   average: sum / values.length,
   minimum: Math.min(...values),
   maximum: Math.max(...values),
  }
 })
 return summaries
}

const datasetSources = (
 table: VtSyncTableDefinition,
 freshness: ReturnType<typeof resolveFreshness>,
): CanonicalIntelligenceSource[] => {
 const sources = new Set<CanonicalIntelligenceSource>()
 table.categoryIds.forEach((id) => {
  const category = VT_SYNC_CATEGORY_OPTIONS.find((entry) => entry.id === id)
  if (category) sources.add(sourceForCategory(category.sourceApi))
 })
 if (freshness?.source === "manual_import") sources.add("manual_import")
 if (!sources.size) sources.add("unknown")
 return [...sources]
}

export const getCanonicalIntelligenceDatasetCatalog = (
 snapshot: VtSyncSnapshot,
 maximumRowsPerDataset = DEFAULT_MAXIMUM_ROWS,
): CanonicalIntelligenceDatasetManifest[] => {
 assertDatasetRegistry()
 const privacyFilters = DEFAULT_VT_SYNC_PRIVACY_FILTERS
 return VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => {
  const rows = tableRows(snapshot, table, privacyFilters)
  const freshness = resolveFreshness(snapshot.datasetFreshness, table)
  const recordedRowCounts = freshnessCandidates(table)
   .map((key) => snapshot.storageMetadata?.fullRowCountByField?.[key])
   .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
  const rowCount = Math.max(rows.length, freshness?.rows || 0, ...recordedRowCounts, 0)
  const sampleRows = rows.slice(0, Math.max(0, maximumRowsPerDataset)).map((row) =>
   Object.fromEntries(table.columns.map((column) => [column.key, safeCell(row[column.key])])),
  )
  return {
   id: table.id,
   label: table.label,
   description: table.description,
   categoryIds: [...table.categoryIds],
   status: statusFor(rowCount, freshness),
   rowCount,
   updatedAt: freshness?.updatedAt || snapshot.capturedAt,
   sources: datasetSources(table, freshness),
   missingMetrics: [...(freshness?.missingMetrics || [])],
   columns: table.columns.map((column) => ({ key: column.key, label: column.label, format: column.format })),
   evidenceRefs: sampleRows.map((_, index) => `${snapshot.snapshotId}:${table.id}:${index + 1}`),
   metrics: summarizeMetrics(rows, table),
   sampleRows,
  }
 })
}

const buildCoverage = (datasets: CanonicalIntelligenceDatasetManifest[]): IntelligenceDatasetCoverage => ({
 total: datasets.length,
 available: datasets.filter((dataset) => dataset.status === "available").length,
 partial: datasets.filter((dataset) => dataset.status === "partial").length,
 stale: datasets.filter((dataset) => dataset.status === "stale").length,
 failed: datasets.filter((dataset) => dataset.status === "failed").length,
 unavailable: datasets.filter((dataset) => dataset.status === "unavailable").length,
 represented: datasets.length,
})

const selectedDatasetIds = (sectionIds: string[]): Set<string> => {
 if (!sectionIds.length) return new Set(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((definition) => definition.id))
 const ids = new Set<string>()
 sectionIds.forEach((sectionId) => {
  const dependencies = INTELLIGENCE_SECTION_DATASETS[sectionId] || []
  if (!dependencies.length) {
   VT_SYNC_VISIBLE_TABLE_DEFINITIONS.forEach((definition) => ids.add(definition.id))
  } else {
   dependencies.forEach((id) => ids.add(id))
  }
 })
 return ids
}

const datasetHeaderContext = (dataset: CanonicalIntelligenceDatasetManifest): string => [
 `DATASET ${dataset.id} (${dataset.label})`,
 `status=${dataset.status}; rows=${dataset.rowCount}; sources=${dataset.sources.join(",")}; updated=${dataset.updatedAt || "unknown"}`,
 dataset.missingMetrics.length ? `missingMetrics=${dataset.missingMetrics.join(",")}` : "",
].filter(Boolean).join("\n")

const datasetDetailLines = (dataset: CanonicalIntelligenceDatasetManifest): string[] => {
 const metricLines = Object.entries(dataset.metrics).slice(0, 12).map(([key, value]) =>
  `${key}: n=${value.count}; sum=${value.sum}; avg=${value.average}; min=${value.minimum}; max=${value.maximum}`,
 )
 const rowLines = dataset.sampleRows.map((row, index) =>
  `${dataset.evidenceRefs[index]} ${JSON.stringify(row)}`,
 )
 return [...metricLines, ...rowLines]
}

export const buildCanonicalIntelligenceEvidence = (
 snapshot: VtSyncSnapshot,
 request: IntelligenceEvidenceRequest = {},
): CanonicalIntelligenceEvidenceBundle => {
 const maximumRowsPerDataset = request.maximumRowsPerDataset ?? DEFAULT_MAXIMUM_ROWS
 const maximumCharacters = request.maximumCharacters ?? DEFAULT_MAXIMUM_CHARACTERS
 const requestedSectionIds = [...(request.sectionIds || [])]
 const selectedIds = selectedDatasetIds(requestedSectionIds)
 const datasets = getCanonicalIntelligenceDatasetCatalog(snapshot, maximumRowsPerDataset)
 const selectedDatasets = datasets.filter((dataset) => selectedIds.has(dataset.id))
 const contextParts: string[] = []
 const omittedDatasetIds: string[] = []
 const separatorsLength = Math.max(0, selectedDatasets.length - 1) * 2
 const headerCharacters = selectedDatasets.reduce(
  (total, dataset) => total + datasetHeaderContext(dataset).length,
  0,
 )

 if (headerCharacters + separatorsLength <= maximumCharacters) {
  selectedDatasets.forEach((dataset) => contextParts.push(datasetHeaderContext(dataset)))
  const detailQueues = selectedDatasets.map((dataset) => datasetDetailLines(dataset))
  let remainingCharacters = maximumCharacters - headerCharacters - separatorsLength
  let hasPendingDetails = true
  while (hasPendingDetails && remainingCharacters > 1) {
   hasPendingDetails = false
   detailQueues.forEach((queue, index) => {
    const line = queue.shift()
    if (line === undefined) return
    hasPendingDetails = true
    const addition = `\n${line}`
    if (addition.length > remainingCharacters) return
    contextParts[index] += addition
    remainingCharacters -= addition.length
   })
  }
 } else {
  let usedCharacters = 0
  selectedDatasets.forEach((dataset) => {
   const header = datasetHeaderContext(dataset)
   const separatorLength = contextParts.length ? 2 : 0
   if (usedCharacters + separatorLength + header.length > maximumCharacters) {
    omittedDatasetIds.push(dataset.id)
    return
   }
   contextParts.push(header)
   usedCharacters += separatorLength + header.length
  })
 }

 return {
  version: CANONICAL_INTELLIGENCE_EVIDENCE_VERSION,
  snapshotId: snapshot.snapshotId,
  channelId: snapshot.channelId || null,
  channelName: snapshot.channelName || null,
  capturedAt: snapshot.capturedAt,
  selectedWindow: request.window || snapshot.selectedTimeWindow || "28d",
  generatedAt: new Date().toISOString(),
  coverage: buildCoverage(datasets),
  datasets,
  requestedSectionIds,
  omittedDatasetIds,
  contextText: contextParts.join("\n\n"),
 }
}
