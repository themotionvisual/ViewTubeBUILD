import JSZip from "jszip"
import { buildMasterTableBundle } from "./masterTables"
import type { AnalyticsWindow } from "./analyticsContract"
import type { IngestMode, MasterTableType } from "./productArchitecture"

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

const rowsToCsv = (rows: Record<string, unknown>[]): string => {
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
   "Trust report",
  ],
 }

 const zip = new JSZip()

 zip.file("manifest.json", JSON.stringify(manifest, null, 2))
 zip.file("trust_report.md", buildTrustReport(manifest))

 const ytCacheRaw = localStorage.getItem("yt_analytics_cache") || "{}"
 const ga4CacheRaw = localStorage.getItem("ga4_analytics_cache") || "{}"
 zip.file("raw/yt_analytics_cache.json", ytCacheRaw)
 zip.file("raw/ga4_analytics_cache.json", ga4CacheRaw)

 for (const tableName of Object.keys(bundle.tables) as MasterTableType[]) {
  const rows = bundle.tables[tableName]
  zip.file(`tables/${tableName}.json`, JSON.stringify(rows, null, 2))
  zip.file(`tables/${tableName}.csv`, rowsToCsv(rows))
 }

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
