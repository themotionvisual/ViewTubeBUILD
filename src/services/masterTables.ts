import type { AnalyticsWindow } from "./analyticsContract"
import { getMasterRows } from "./analyticsSelectors"
import { buildDataCoverageInventory, type DataCoverageRow } from "./dataCoverageInventory"
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

const safeParse = <T>(raw: string | null, fallback: T): T => {
 if (!raw) return fallback
 try {
  return JSON.parse(raw) as T
 } catch {
  return fallback
 }
}

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
   if (!Array.isArray(row)) return null
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
 const sample = sourceRows[0] || {}
 return Object.keys(sample)
  .filter((key) => key && !key.startsWith("_") && !key.startsWith("__"))
  .map((key) => ({
   canonicalKey: key,
   displayName: key,
   source,
   scope,
   accuracyClass: textValue(sample[key]) === null ? "unavailable" : "exact",
   value: textValue(sample[key]),
   sampledFrom: source,
   sampledAt: now,
  }))
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

 const ytCache = safeParse<Record<string, unknown>>(localStorage.getItem("yt_analytics_cache"), {})
 const profileRows = [ytCache.profile].filter(
  (row): row is Record<string, unknown> => !!row && typeof row === "object",
 )

 tables.master_channel_identity = toDomainRows(profileRows, "youtube", "channel")

 const demographicsRows = parseReportRows(ytCache.demographics)
 tables.master_audience = toDomainRows(demographicsRows, "youtube", "demographic")

 const trafficRows = parseReportRows(ytCache.trafficSources)
 tables.master_traffic = toDomainRows(trafficRows, "youtube", "traffic")

 const geoRows = parseReportRows(ytCache.channelAnalytics).filter((row) =>
  Object.keys(row).some((key) => key.toLowerCase().includes("country") || key.toLowerCase().includes("province")),
 )
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

 const ga4Cache = safeParse<Record<string, unknown>>(localStorage.getItem("ga4_analytics_cache"), {})
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
