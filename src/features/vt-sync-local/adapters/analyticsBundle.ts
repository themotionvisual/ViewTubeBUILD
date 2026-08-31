import JSZip from "jszip"

import {
 decodeVtSyncDataset,
 encodeVtSyncDataset,
 type VtSyncPackedDatasetManifestV2,
} from "./packedDataset"

export const VT_SYNC_ANALYTICS_BUNDLE_FORMAT = "viewtube-analytics-bundle" as const
export const VT_SYNC_ANALYTICS_BUNDLE_VERSION = 1 as const

export type VtSyncPortableDataset = {
 schemaVersion: number
 rows: Array<Record<string, unknown>>
 rowCount: number
 exportedAt: string
 source?: "api" | "csv" | "imported" | "derived"
 dateRange?: { min?: string; max?: string }
}

export type VtSyncAnalyticsBundleV1 = {
 format: typeof VT_SYNC_ANALYTICS_BUNDLE_FORMAT
 version: typeof VT_SYNC_ANALYTICS_BUNDLE_VERSION
 exportedAt: string
 channel?: { id?: string; title?: string }
 source: {
  authenticatedAtExport: boolean
  appVersion?: string
  buildCommit?: string
 }
 datasets: Record<string, VtSyncPortableDataset>
 uiHints?: { defaultDataset?: string }
}

type VtSyncAnalyticsArchiveManifestV2 = {
 format: "viewtube-analytics-archive"
 version: 2
 exportedAt: string
 channel?: { id?: string; title?: string }
 source: VtSyncAnalyticsBundleV1["source"]
 uiHints?: VtSyncAnalyticsBundleV1["uiHints"]
 datasets: Record<string, {
  rowCount: number
  packedManifest: VtSyncPackedDatasetManifestV2
  schemaPath: string
  chunkPaths: string[]
 }>
}

const SECRET_FIELD = /^(?:access[_-]?token|refresh[_-]?token|api[_-]?key|authorization|cookie|client[_-]?secret|session)$/i

const sanitizePortableValue = (value: unknown): unknown => {
 if (Array.isArray(value)) return value.map(sanitizePortableValue)
 if (!value || typeof value !== "object") return value
 return Object.fromEntries(
  Object.entries(value as Record<string, unknown>)
   .filter(([key]) => !SECRET_FIELD.test(key))
   .map(([key, entry]) => [key, sanitizePortableValue(entry)]),
 )
}

export const createVtSyncAnalyticsBundle = ({
 datasets,
 channel,
 authenticatedAtExport,
 appVersion,
 buildCommit,
 defaultDataset,
 exportedAt = new Date().toISOString(),
}: {
 datasets: Record<string, Array<Record<string, unknown>>>
 channel?: { id?: string; title?: string }
 authenticatedAtExport: boolean
 appVersion?: string
 buildCommit?: string
 defaultDataset?: string
 exportedAt?: string
}): VtSyncAnalyticsBundleV1 => ({
 format: VT_SYNC_ANALYTICS_BUNDLE_FORMAT,
 version: VT_SYNC_ANALYTICS_BUNDLE_VERSION,
 exportedAt,
 channel,
 source: { authenticatedAtExport, appVersion, buildCommit },
 datasets: Object.fromEntries(Object.entries(datasets).map(([key, rows]) => {
  const portableRows = sanitizePortableValue(rows) as Array<Record<string, unknown>>
  return [key, {
   schemaVersion: 1,
   rows: portableRows,
   rowCount: portableRows.length,
   exportedAt,
   source: "imported" as const,
  }]
 })),
 uiHints: defaultDataset ? { defaultDataset } : undefined,
})

export const parseVtSyncAnalyticsBundle = (
 text: string,
 allowedDatasetIds: ReadonlySet<string>,
): VtSyncAnalyticsBundleV1 => {
 let candidate: unknown
 try {
  candidate = JSON.parse(text)
 } catch {
  throw new Error("This file is not valid JSON.")
 }
 if (!candidate || typeof candidate !== "object" || Array.isArray(candidate))
  throw new Error("The analytics bundle must be a JSON object.")
 const bundle = candidate as Partial<VtSyncAnalyticsBundleV1>
 if (bundle.format !== VT_SYNC_ANALYTICS_BUNDLE_FORMAT)
  throw new Error("This is not a ViewTube analytics bundle.")
 if (bundle.version !== VT_SYNC_ANALYTICS_BUNDLE_VERSION)
  throw new Error(`Unsupported analytics bundle version: ${String(bundle.version)}.`)
 if (!bundle.datasets || typeof bundle.datasets !== "object" || Array.isArray(bundle.datasets))
  throw new Error("The analytics bundle has no valid datasets container.")

 for (const [datasetId, dataset] of Object.entries(bundle.datasets)) {
  if (!allowedDatasetIds.has(datasetId))
   throw new Error(`Unknown analytics dataset: ${datasetId}.`)
  if (!dataset || typeof dataset !== "object" || !Array.isArray(dataset.rows))
   throw new Error(`Dataset ${datasetId} has no valid rows array.`)
  if (dataset.schemaVersion !== 1)
   throw new Error(`Dataset ${datasetId} uses an unsupported schema version.`)
  if (dataset.rowCount !== dataset.rows.length)
   throw new Error(`Dataset ${datasetId} row count does not match its rows.`)
  if (dataset.rows.some((row) => !row || typeof row !== "object" || Array.isArray(row)))
   throw new Error(`Dataset ${datasetId} contains an invalid row.`)
 }
 return bundle as VtSyncAnalyticsBundleV1
}

export const createVtSyncAnalyticsArchive = async (
 bundle: VtSyncAnalyticsBundleV1,
): Promise<Blob> => {
 const zip = new JSZip()
 const datasets: VtSyncAnalyticsArchiveManifestV2["datasets"] = {}
 const checksums: Record<string, string> = {}
 const channelId = bundle.channel?.id || "unscoped"

 for (const [datasetId, dataset] of Object.entries(bundle.datasets)) {
  const packed = await encodeVtSyncDataset({
   channelId,
   datasetId,
   rows: dataset.rows,
   capturedAt: dataset.exportedAt,
  })
  const schemaPath = `schemas/${encodeURIComponent(datasetId)}.json`
  zip.file(schemaPath, JSON.stringify(packed.schema))
  const chunkPaths = packed.chunks.map((chunk, index) => {
   const path = `data/${encodeURIComponent(datasetId)}/${String(index).padStart(5, "0")}.bin${chunk.compression === "gzip" ? ".gz" : ""}`
   zip.file(path, chunk.data, { compression: "STORE" })
   checksums[path] = chunk.checksum
   return path
  })
  datasets[datasetId] = {
   rowCount: dataset.rowCount,
   packedManifest: packed.manifest,
   schemaPath,
   chunkPaths,
  }
 }

 const manifest: VtSyncAnalyticsArchiveManifestV2 = {
  format: "viewtube-analytics-archive",
  version: 2,
  exportedAt: bundle.exportedAt,
  channel: bundle.channel,
  source: bundle.source,
  uiHints: bundle.uiHints,
  datasets,
 }
 zip.file("manifest.json", JSON.stringify(manifest))
 zip.file("checksums.json", JSON.stringify(checksums))
 return zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } })
}

export const parseVtSyncAnalyticsArchive = async (
 archive: Blob | Uint8Array | ArrayBuffer,
 allowedDatasetIds: ReadonlySet<string>,
): Promise<VtSyncAnalyticsBundleV1> => {
 const input = archive instanceof Blob ? await archive.arrayBuffer() : archive
 const zip = await JSZip.loadAsync(input)
 const manifestFile = zip.file("manifest.json")
 if (!manifestFile) throw new Error("This analytics archive has no manifest.")
 const manifest = JSON.parse(await manifestFile.async("text")) as VtSyncAnalyticsArchiveManifestV2
 if (manifest.format !== "viewtube-analytics-archive" || manifest.version !== 2)
  throw new Error("Unsupported ViewTube analytics archive.")
 const checksumsFile = zip.file("checksums.json")
 if (!checksumsFile) throw new Error("This analytics archive has no checksum index.")
 const checksums = JSON.parse(await checksumsFile.async("text")) as Record<string, string>
 const datasets: VtSyncAnalyticsBundleV1["datasets"] = {}

 for (const [datasetId, entry] of Object.entries(manifest.datasets)) {
  if (!allowedDatasetIds.has(datasetId)) throw new Error(`Unknown analytics dataset: ${datasetId}.`)
  const schemaFile = zip.file(entry.schemaPath)
  if (!schemaFile) throw new Error(`Dataset ${datasetId} has no schema.`)
  const schema = JSON.parse(await schemaFile.async("text")) as { id: string; columns: string[] }
  const chunks = await Promise.all(entry.chunkPaths.map(async (path, index) => {
   const file = zip.file(path)
   if (!file) throw new Error(`Dataset ${datasetId} is missing chunk ${index}.`)
   const data = await file.async("uint8array")
   const metadata = entry.packedManifest.chunks[index]
   if (!metadata || checksums[path] !== metadata.checksum)
    throw new Error(`Dataset ${datasetId} checksum index is invalid.`)
   return { ...metadata, data }
  }))
  const rows = await decodeVtSyncDataset({ manifest: entry.packedManifest, schema, chunks })
  if (rows.length !== entry.rowCount) throw new Error(`Dataset ${datasetId} row count does not match its manifest.`)
  datasets[datasetId] = {
   schemaVersion: 1,
   rows,
   rowCount: rows.length,
   exportedAt: manifest.exportedAt,
   source: "imported",
  }
 }

 return {
  format: VT_SYNC_ANALYTICS_BUNDLE_FORMAT,
  version: VT_SYNC_ANALYTICS_BUNDLE_VERSION,
  exportedAt: manifest.exportedAt,
  channel: manifest.channel,
  source: manifest.source,
  datasets,
  uiHints: manifest.uiHints,
 }
}
