import type {
 VtSyncVideoInventoryRecord,
 VtSyncVideoItem,
 VtSyncVideoMetric,
} from "./contracts"

type Row = Record<string, unknown>
export type VtSyncCatalogVideoRow = VtSyncVideoItem & {
 catalogProvenance?: "inventory" | "api" | "import_only"
}

export type VtSyncVideoCatalogCoverage = {
 catalogTotal: number
 metadataAvailable: number
 analyticsAvailable: number
 importOnly: number
 unresolvedImports: number
}

const METRIC_KEYS = new Set([
 "views", "engagedViews", "watchTime", "revenue", "subscribers",
 "subscribersGained", "subscribersLost", "ctr", "impressions",
 "avgViewDuration", "averagePercentageViewed", "likes", "dislikes",
 "comments", "shares", "cpm", "rpm", "adImpressions",
])

const isMeaningful = (value: unknown): boolean => {
 if (value === null || value === undefined) return false
 if (typeof value === "string") {
  const normalized = value.trim().toLowerCase()
  return normalized !== "" && normalized !== "-" && normalized !== "metadata pending"
 }
 return true
}

export const normalizeVtSyncCatalogVideoId = (row: Row): string => {
 const raw = row.id ?? row.videoId ?? row.video ?? row.videoID
 const value = String(raw ?? "").trim()
 if (!value || value === "-" || /^https?:\/\//i.test(value) || value.startsWith("vt-sync-import-video-")) return ""
 return value
}

const numericMetric = (value: unknown): number | undefined => {
 if (typeof value === "number") return Number.isFinite(value) ? value : undefined
 if (typeof value !== "string") return undefined
 const parsed = Number(value.replace(/[$,%\s,]/g, ""))
 return Number.isFinite(parsed) ? parsed : undefined
}

const toVideoItem = (source: Row): VtSyncCatalogVideoRow | null => {
 const id = normalizeVtSyncCatalogVideoId(source)
 if (!id) return null
 const metrics: VtSyncVideoMetric = source.metrics && typeof source.metrics === "object"
  ? { ...(source.metrics as VtSyncVideoMetric) }
  : {}
 for (const [key, value] of Object.entries(source)) {
  if (!METRIC_KEYS.has(key) || isMeaningful(metrics[key])) continue
  const parsed = numericMetric(value)
  if (parsed !== undefined) metrics[key] = parsed
 }
 const rawTitle = source.title ?? source.videoTitle ?? source.name
 return {
  ...source,
  id,
  title: isMeaningful(rawTitle) ? String(rawTitle) : "Metadata pending",
  metrics,
 } as VtSyncCatalogVideoRow
}

const mergeDefined = (
 current: VtSyncCatalogVideoRow,
 incoming: VtSyncCatalogVideoRow,
 mode: "replace" | "supplement",
): VtSyncCatalogVideoRow => {
 const next = { ...current } as Row
 for (const [key, value] of Object.entries(incoming)) {
  if (key === "id" || key === "metrics" || key === "metricProvenance" || !isMeaningful(value)) continue
  if (mode === "replace" || !isMeaningful(next[key])) next[key] = value
 }
 const currentMetrics = current.metrics || {}
 const incomingMetrics = incoming.metrics || {}
 const metrics = { ...currentMetrics }
 for (const [key, value] of Object.entries(incomingMetrics)) {
  if (!isMeaningful(value)) continue
  if (mode === "replace" || !isMeaningful(metrics[key])) metrics[key] = value
 }
 return {
  ...(next as VtSyncCatalogVideoRow),
  id: current.id,
  metrics,
  metricProvenance: {
   ...(current.metricProvenance || {}),
   ...(mode === "replace" ? incoming.metricProvenance || {} : {}),
  },
 }
}

const inventoryVideo = (record: VtSyncVideoInventoryRecord): VtSyncCatalogVideoRow => ({
 id: record.videoId,
 title: record.title || "Metadata pending",
 thumbnail: record.thumbnail,
 publishedAt: record.publishedAt,
 privacyStatus: record.status === "private" || record.status === "unlisted" ? record.status : undefined,
 metrics: {},
 catalogProvenance: "inventory",
})

export const buildVtSyncVideoCatalogProjection = ({
 inventoryRows,
 persistedRows,
 liveRows,
 importedRows,
}: {
 inventoryRows: VtSyncVideoInventoryRecord[]
 persistedRows: Row[]
 liveRows: Array<VtSyncVideoItem | Row>
 importedRows: Row[]
}): { rows: VtSyncCatalogVideoRow[]; coverage: VtSyncVideoCatalogCoverage } => {
 const order: string[] = []
 const rowsById = new Map<string, VtSyncCatalogVideoRow>()
 const upsert = (row: VtSyncCatalogVideoRow, mode: "replace" | "supplement") => {
  const existing = rowsById.get(row.id)
  if (!existing) {
   order.push(row.id)
   rowsById.set(row.id, row)
   return
  }
  rowsById.set(row.id, mergeDefined(existing, row, mode))
 }

 inventoryRows.forEach((record) => upsert(inventoryVideo(record), "replace"))
 persistedRows.map(toVideoItem).filter(Boolean).forEach((row) => upsert(row!, "replace"))
 liveRows.map((row) => toVideoItem(row as Row)).filter(Boolean).forEach((row) => upsert(row!, "replace"))

 let importOnly = 0
 let unresolvedImports = 0
 importedRows.forEach((source) => {
  const row = toVideoItem(source)
  if (!row) {
   unresolvedImports += 1
   return
  }
  if (!rowsById.has(row.id)) {
   importOnly += 1
   row.catalogProvenance = "import_only"
  }
  upsert(row, "supplement")
 })

 const rows = order.map((id) => rowsById.get(id)!).filter(Boolean)
 const catalogRows = rows.filter((row) => row.catalogProvenance !== "import_only")
 const metadataAvailable = catalogRows.filter((row) => row.title !== "Metadata pending").length
 const analyticsAvailable = catalogRows.filter((row) =>
  Object.values(row.metricProvenance || {}).includes("youtube_analytics_v2"),
 ).length
 return {
  rows,
  coverage: {
   catalogTotal: catalogRows.length,
   metadataAvailable,
   analyticsAvailable,
   importOnly,
   unresolvedImports,
  },
 }
}
