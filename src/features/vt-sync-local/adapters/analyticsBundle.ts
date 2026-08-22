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
