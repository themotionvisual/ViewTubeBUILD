import JSZip from "jszip"
import { buildMasterTableBundle } from "./masterTables"
import { getMasterRows } from "./analyticsSelectors"
import type { AnalyticsWindow } from "./analyticsContract"
import type { IngestMode, MasterTableType } from "./productArchitecture"
import type { CsvFileWithTag } from "../types"
import {
 buildUnifiedLedger,
 buildYouTubeStyleProjection,
 selectAuthoritativeOwnerRows,
} from "./unifiedSourceOfTruth"

export interface ExportManifest {
 version: string
 generatedAt: string
 ingestMode: IngestMode
 analyticsWindow: AnalyticsWindow
 tables: Array<{
  table: MasterTableType
  rowCount: number
 }>
 includes: string[]
}

const csvEscape = (value: unknown): string => {
 if (value === null || value === undefined) return ""
 const text = String(value)
 if (text.includes(",") || text.includes("\n") || text.includes('"')) {
  return `"${text.replace(/"/g, '""')}"`
 }
 return text
}

export const rowsToCsv = (rows: Record<string, unknown>[]): string => {
 if (rows.length === 0) return ""
 const headers = Array.from(
  rows.reduce((set, row) => {
   Object.keys(row).forEach((key) => set.add(key))
   return set
  }, new Set<string>()),
 )

 const lines: string[] = []
 lines.push(headers.join(","))
 for (const row of rows) {
  lines.push(headers.map((header) => csvEscape(row[header])).join(","))
 }
 return lines.join("\n")
}

const UPLOAD_CACHE_FILES_KEY = "vt_uploaded_csv_cache"

const readUploadedCsvFiles = (): CsvFileWithTag[] => {
 try {
  const parsed = JSON.parse(localStorage.getItem(UPLOAD_CACHE_FILES_KEY) || "[]") as CsvFileWithTag[]
  return Array.isArray(parsed) ? parsed : []
 } catch {
  return []
 }
}

const buildTrustReport = (manifest: ExportManifest): string => {
 const tableLines = manifest.tables
  .map((entry) => `- ${entry.table}: ${entry.rowCount} rows`)
  .join("\n")

 return [
  "# ViewTube Trust Report",
  "",
  `Generated at: ${manifest.generatedAt}`,
  `Ingest mode: ${manifest.ingestMode}`,
  `Analytics window: ${manifest.analyticsWindow}`,
  "",
  "## What this bundle contains",
  ...manifest.includes.map((item) => `- ${item}`),
  "",
  "## Canonical tables",
  tableLines,
  "",
  "## Accuracy classes",
  "- exact: direct source data",
  "- derived_exact: deterministic formula from exact inputs",
  "- estimated: modeled or extrapolated",
  "- unavailable: not accessible in current mode",
  "",
  "## Sync Diagnostics",
  "- Includes run-level attempted groups, disabled metrics, bounded failures, and suppressed retry combos.",
 ].join("\n")
}

export const createExportBundle = async (
 ingestMode: IngestMode,
 analyticsWindow: AnalyticsWindow = "lifetime",
): Promise<{ blob: Blob; filename: string; manifest: ExportManifest }> => {
 const bundle = buildMasterTableBundle(analyticsWindow, ingestMode)

 const manifest: ExportManifest = {
  version: "1.0.0",
  generatedAt: bundle.generatedAt,
  ingestMode,
  analyticsWindow,
  tables: (Object.keys(bundle.tables) as MasterTableType[]).map((tableName) => ({
   table: tableName,
   rowCount: bundle.tables[tableName].length,
  })),
  includes: [
   "Raw local analytics cache snapshot",
   "Canonical domain master tables (CSV + JSON)",
   "Coverage registry snapshot",
   "Window sync diagnostics",
   "Trust report",
   "YouTube-style projection tables (Table/Chart/Totals)",
   "Unified source-of-truth reconciliation artifacts",
  ],
 }

 const zip = new JSZip()

 zip.file("manifest.json", JSON.stringify(manifest, null, 2))
 zip.file("trust_report.md", buildTrustReport(manifest))

 const ytCacheRaw = localStorage.getItem("yt_analytics_cache") || "{}"
 const ga4CacheRaw = localStorage.getItem("ga4_analytics_cache") || "{}"
 const ytCache = JSON.parse(ytCacheRaw || "{}") as {
  analyticsByWindow?: Record<string, { syncDiagnostics?: unknown }>
 }
 zip.file("raw/yt_analytics_cache.json", ytCacheRaw)
 zip.file("raw/ga4_analytics_cache.json", ga4CacheRaw)
 zip.file(
  "raw/sync_diagnostics.json",
  JSON.stringify(
   Object.fromEntries(
    Object.entries(ytCache.analyticsByWindow || {}).map(([window, payload]) => [
     window,
     payload?.syncDiagnostics || null,
    ]),
   ),
   null,
   2,
  ),
 )

 for (const tableName of Object.keys(bundle.tables) as MasterTableType[]) {
  const rows = bundle.tables[tableName]
  zip.file(`tables/${tableName}.json`, JSON.stringify(rows, null, 2))
  zip.file(`tables/${tableName}.csv`, rowsToCsv(rows))
 }

 const uploadedCsvFiles = readUploadedCsvFiles()
 const apiRows = getMasterRows(analyticsWindow, "api")
 const ownerRows = getMasterRows(analyticsWindow, "csv", uploadedCsvFiles)
 const authoritativeOwnerRows = selectAuthoritativeOwnerRows(ownerRows)
 const channelId = ((JSON.parse(ytCacheRaw) as { profile?: { id?: string } }).profile?.id ||
  "channel_unknown") as string
 const unifiedLedger = buildUnifiedLedger({
  channelId,
  window: analyticsWindow,
  apiRows,
  ownerRows: authoritativeOwnerRows,
 })
 const sourceMode = ingestMode === "import" ? "csv" : ingestMode === "hybrid" ? "hybrid" : "api"
 const projectionRows = getMasterRows(analyticsWindow, sourceMode, uploadedCsvFiles)
 const projection = buildYouTubeStyleProjection(projectionRows, "engagedViews")

 zip.file("projections/Table data.csv", rowsToCsv(projection.tableRows))
 zip.file("projections/Chart data.csv", rowsToCsv(projection.chartRows))
 zip.file("projections/Totals.csv", rowsToCsv(projection.totalsRows as Record<string, unknown>[]))
 zip.file("unified/facts.json", JSON.stringify(unifiedLedger.facts, null, 2))
 zip.file("unified/conflicts.json", JSON.stringify(unifiedLedger.conflicts, null, 2))

 const blob = await zip.generateAsync({ type: "blob" })
 const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
 const filename = `viewtube_export_${timestamp}.zip`

 return { blob, filename, manifest }
}

export const downloadExportBundle = async (
 ingestMode: IngestMode,
 analyticsWindow: AnalyticsWindow = "lifetime",
): Promise<ExportManifest> => {
 const { blob, filename, manifest } = await createExportBundle(ingestMode, analyticsWindow)
 const url = URL.createObjectURL(blob)
 const anchor = document.createElement("a")
 anchor.href = url
 anchor.download = filename
 document.body.appendChild(anchor)
 anchor.click()
 anchor.remove()
 URL.revokeObjectURL(url)
 return manifest
}
