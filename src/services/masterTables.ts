import type { AnalyticsWindow } from "./analyticsContract"
import { getMasterRows } from "./analyticsSelectors"
import { buildDataCoverageInventory, type DataCoverageRow } from "./dataCoverageInventory"
import { readYouTubeAnalyticsCache } from "./canonicalAnalyticsStore"
import {
 type CoverageScope,
 type DomainTableRow,
 type IngestMode,
 type MasterTableBundle,
 type MasterTableType,
 getStoredIngestMode,
} from "./productArchitecture"

const EMPTY_TABLES = (): Record<MasterTableType, DomainTableRow[]> => ({
 master_channel_identity: [],
 master_video_core: [],
 master_audience: [],
 master_geography: [],
 master_traffic: [],
 master_device_playback: [],
 master_retention: [],
 master_monetization: [],
 master_external_signals: [],
 master_formula_metrics: [],
 master_coverage_registry: [],
})

const textValue = (value: unknown): string | number | null => {
 if (value === null || value === undefined) return null
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value === "boolean") return value ? "true" : "false"
 if (typeof value === "string") {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
 }
 return JSON.stringify(value)
}

const fromCoverageRows = (rows: DataCoverageRow[]): DomainTableRow[] => {
 return rows.map((row) => ({
  canonicalKey: row.canonicalKey,
  displayName: row.categoryName,
  source: row.source,
  scope: row.scope as CoverageScope,
  accuracyClass:
   row.source === "history_placeholder"
    ? "unavailable"
    : row.example !== "-"
      ? "exact"
      : "unavailable",
  value: row.example !== "-" ? row.example : row.exampleChannel,
  sampledFrom: row.source,
  sampledAt: new Date().toISOString(),
 }))
}

const parseReportRows = (report: unknown): Record<string, unknown>[] => {
 if (!report || typeof report !== "object") return []
 const payload = report as {
  rows?: unknown[]
  columnHeaders?: Array<{ name?: string }>
 }

 if (!Array.isArray(payload.rows)) return []
 if (!Array.isArray(payload.columnHeaders)) {
  return payload.rows.filter(
   (row): row is Record<string, unknown> => !!row && typeof row === "object" && !Array.isArray(row),
  )
 }

 const headers = payload.columnHeaders.map((header) => String(header.name || ""))
 return payload.rows
  .map((row) => {
   if (!Array.isArray(row)) {
    if (row && typeof row === "object") return row as Record<string, unknown>
    return null
   }
   const out: Record<string, unknown> = {}
   headers.forEach((header, index) => {
    if (header) out[header] = row[index]
   })
   return out
  })
  .filter((row): row is Record<string, unknown> => !!row)
}

const toDomainRows = (
 sourceRows: Record<string, unknown>[],
 source: string,
 scope: CoverageScope,
): DomainTableRow[] => {
 const now = new Date().toISOString()
 if (sourceRows.length === 0) return []

 return sourceRows.map((row, index) => {
  const rowId = `${scope}_${index}`
  
  // Normalize row keys for consistent display
  const normalizedRow: Record<string, unknown> = {}
  Object.entries(row).forEach(([k, v]) => {
   if (k.startsWith('_')) {
    normalizedRow[k] = v
    return
   }
   
   // Map API keys to more readable canonical versions if possible
   let targetKey = k
   if (k === 'insightTrafficSourceType') targetKey = 'Traffic Source'
   if (k === 'ageGroup') targetKey = 'Age Group'
   if (k === 'gender') targetKey = 'Gender'
   if (k === 'viewerPercentage') targetKey = 'Viewer %'
   if (k === 'country') targetKey = 'Country'
   if (k === 'day') targetKey = 'Date'
   
   normalizedRow[targetKey] = v
  })

  // Try to find a descriptive dimension value for the display name
  const dimensionKey = Object.keys(normalizedRow).find(k => 
   k.toLowerCase().includes('source') || 
   k.toLowerCase().includes('group') || 
   k.toLowerCase().includes('gender') || 
   k.toLowerCase().includes('country') ||
   k.toLowerCase().includes('date')
  )
  const dimensionValue = dimensionKey ? String(normalizedRow[dimensionKey]) : null
  const tableLabel = MASTER_TABLE_LABELS[`master_${scope}` as MasterTableType] || scope
  const displaySuffix = dimensionValue ? `: ${dimensionValue}` : ` #${index + 1}`

  // Use the first non-internal/non-dimension value as the primary value for the 'value' column
  const primaryKey = Object.keys(normalizedRow).find(k => 
   !k.startsWith('_') && !k.startsWith('__') && k !== dimensionKey && 
   (typeof normalizedRow[k] === 'number' || (typeof normalizedRow[k] === 'string' && normalizedRow[k].length > 0))
  )
  const primaryValue = primaryKey ? textValue(normalizedRow[primaryKey]) : (dimensionValue || null)

  return {
   ...normalizedRow,
   canonicalKey: rowId,
   displayName: `${tableLabel}${displaySuffix}`,
   source,
   scope,
   accuracyClass: "exact",
   value: primaryValue,
   sampledFrom: source,
   sampledAt: now,
  } as DomainTableRow
 })
}

const ingestModeToSourceMode = (mode: IngestMode): "api" | "csv" | "hybrid" => {
 if (mode === "import") return "csv"
 if (mode === "hybrid") return "hybrid"
 return "api"
}

export const buildMasterTableBundle = (
 window: AnalyticsWindow = "lifetime",
 ingestMode: IngestMode = getStoredIngestMode(),
): MasterTableBundle => {
 const tables = EMPTY_TABLES()
 const sourceMode = ingestModeToSourceMode(ingestMode)

 const masterRows = getMasterRows(window, sourceMode)
 const normalizedMasterRows = masterRows.map((row) => ({
  ...row,
  Format: row.format,
  "Video title": row.title,
  "Video ID": row.videoId,
  "Upload date": row.uploadDate,
 }))

 tables.master_video_core = normalizedMasterRows.flatMap((row) => {
  const sampledAt = new Date().toISOString()
  return [
   {
    canonicalKey: "videoTitle",
    displayName: "Video title",
    source: row.sourceMode,
    scope: "video_shared",
    accuracyClass: row.title ? "exact" : "unavailable",
    value: textValue(row.title),
    sampledFrom: row.videoId,
    sampledAt,
   },
   {
    canonicalKey: "views",
    displayName: "Views",
    source: row.sourceMode,
    scope: "video_shared",
    accuracyClass:
     row.metrics.views.status === "unavailable"
      ? "unavailable"
      : row.metrics.views.status === "derived"
        ? "derived_exact"
        : "exact",
    value: textValue(row.metrics.views.value),
    sampledFrom: row.videoId,
    sampledAt,
   },
   {
    canonicalKey: "videoFormat",
    displayName: "Video format",
    source: row.sourceMode,
    scope:
     row.format === "shorts"
      ? "short_only"
      : row.format === "long"
        ? "long_only"
        : "video_shared",
    accuracyClass: row.format === "unknown" ? "unavailable" : "exact",
    value: row.format,
    sampledFrom: row.videoId,
    sampledAt,
   },
  ]
 })

 const ytCache = readYouTubeAnalyticsCache() as Record<string, unknown>
 const profileRows = [ytCache.profile].filter(
  (row): row is Record<string, unknown> => !!row && typeof row === "object",
 )

 tables.master_channel_identity = toDomainRows(profileRows, "youtube", "channel")

 const demographicsRows = parseReportRows(ytCache.demographics)
 tables.master_audience = toDomainRows(demographicsRows, "youtube", "demographic")

 const trafficRows = parseReportRows(ytCache.trafficSources)
 tables.master_traffic = toDomainRows(trafficRows, "youtube", "traffic")

 const geoRows = parseReportRows(ytCache.geography)
 tables.master_geography = toDomainRows(geoRows, "youtube", "geo")

 const dailyRows = parseReportRows(ytCache.dailyMetrics)
 tables.master_retention = toDomainRows(
  dailyRows.filter((row) =>
   Object.keys(row).some((key) => key.toLowerCase().includes("duration") || key.toLowerCase().includes("retention")),
  ),
  "youtube",
  "retention",
 )

 tables.master_monetization = toDomainRows(
  dailyRows.filter((row) =>
   Object.keys(row).some((key) => key.toLowerCase().includes("revenue") || key.toLowerCase().includes("cpm") || key.toLowerCase().includes("rpm")),
  ),
  "youtube",
  "monetization",
 )

 tables.master_device_playback = toDomainRows(
  parseReportRows(ytCache.channelAnalytics).filter((row) =>
   Object.keys(row).some((key) => key.toLowerCase().includes("device") || key.toLowerCase().includes("playback")),
  ),
  "youtube",
  "device",
 )

 let ga4Cache: Record<string, unknown> = {}
 try {
  ga4Cache = JSON.parse(localStorage.getItem("ga4_analytics_cache") || "{}") as Record<string, unknown>
 } catch {
  ga4Cache = {}
 }
 const ga4Rows = parseReportRows(ga4Cache.channelAnalytics)
 tables.master_external_signals = toDomainRows(ga4Rows, "ga4", "traffic")

 tables.master_formula_metrics = [
  {
   canonicalKey: "engagementRate",
   displayName: "Engagement Rate",
   source: "derived",
   scope: "video_shared",
   accuracyClass: "derived_exact",
   value: null,
   sampledFrom: "formula_registry",
   sampledAt: new Date().toISOString(),
  },
 ]

 const coverageInventory = buildDataCoverageInventory(normalizedMasterRows)
 tables.master_coverage_registry = fromCoverageRows(coverageInventory.rows)

 return {
  generatedAt: new Date().toISOString(),
  ingestMode,
  tables,
 }
}
