import type { CsvFileWithTag } from "../types"
import { normalizeRow } from "./dataNormalization"
import {
 ANALYTICS_WINDOWS,
 type AnalyticsWindow,
 type CanonicalMetricKey,
 type CanonicalVideoRow,
 type MetricCell,
 type MetricSource,
 buildActualMetricCell,
 buildDerivedMetricCell,
 buildUnavailableMetricCell,
 canonicalMetricOrder,
 emptyMetricCells,
 getMetricByAliases,
 getDisplayLabel,
} from "./analyticsContract"
import {
  getCanonicalAnalyticsCache,
  type RawAnalyticsCache,
} from "./canonicalAnalyticsStore"
import {
 classifyCsvExportKind,
 inferAnalyticsWindowFromName,
 isLikelyTotalCsvRow,
} from "./DataEngine"

export type AnalyticsSourceMode = "api" | "csv" | "hybrid"

type AnalyticsReport = {
 columnHeaders?: Array<{ name?: string }>
 rows?: unknown[]
}

type AnalyticsGroupResult = {
 ok: boolean
 metrics: string[]
 idsTried: string[]
 error?: string
}

type AnalyticsWindowBundle = {
 window: AnalyticsWindow
 startDate: string
 endDate: string
 fetchedAt: number
 report: AnalyticsReport
 groups?: Record<string, AnalyticsGroupResult>
}

type CachedVideo = {
 videoId?: string
 title?: string
 publishedAt?: string
}

type CachedVideoStat = {
 viewCount?: unknown
 likeCount?: unknown
 commentCount?: unknown
 isShort?: boolean
 durationSeconds?: unknown
 durationRaw?: unknown
 contentType?: string
 privacyStatus?: string
 title?: string
 description?: string
 tags?: unknown
}

type AnalyticsCache = RawAnalyticsCache & {
 videos?: CachedVideo[]
 stats?: Record<string, CachedVideoStat>
 analyticsByWindow?: Partial<
  Record<
   AnalyticsWindow,
   {
    startDate?: string
    endDate?: string
    fetchedAt?: number
    report?: any
    syncDiagnostics?: SyncDiagnosticsShape
   }
  >
 >
 availabilityByWindow?: Partial<
  Record<AnalyticsWindow, Partial<Record<CanonicalMetricKey, boolean>>>
 >
 lastSyncedByWindow?: Partial<Record<AnalyticsWindow, number>>
 videoContentType?: Record<string, string>
 analytics?: AnalyticsReport
 channelAnalytics?: AnalyticsReport
 dailyMetrics?: AnalyticsReport
 globalLifetime?: AnalyticsReport
}

type SyncDiagnosticsShape = {
 failureReasons?: Array<{
  group?: string
  metrics?: string[]
  status?: number
  reason?: string
  requestClass?: string
 }>
}

type WindowTotals = {
 views: number
 watchHours: number
 subscribersGained: number
 revenue: number
 impressions: number
 ctr: number | null
}

export interface MetricSummary {
 rowCount: number
 totals: {
  views: number
  watchHours: number
  subscribersGained: number
  revenue: number
 }
 averages: {
  ctr: number | null
  rpm: number | null
  cpm: number | null
  avdSeconds: number | null
  avp: number | null
 }
}

export interface MetricAvailability {
 metricKey: CanonicalMetricKey
 window: AnalyticsWindow
 sourceMode: AnalyticsSourceMode
 actualCount: number
 derivedCount: number
 unavailableCount: number
 availableCount: number
 coveragePct: number
 bySource: {
  api: number
  csv_table: number
  hybrid: number
 }
}

export type VideoStatsVerificationSummary = {
 window: AnalyticsWindow
 reportRowCount: number
 masterRowCount: number
 rawMetricRows: {
  impressions: number
  ctr: number
 }
 mappedMetricRows: {
  impressions: number
  ctr: number
 }
 lastFailure: {
  requestClass?: string
  reason?: string
  status?: number
 } | null
 mappingStatus:
  | "healthy"
  | "request_failure"
  | "missing_upstream"
  | "mapping_failure"
 duplicateShortHeaders: string[]
}

export type MasterTableRow = Record<string, unknown> & {
 _id: string
 _sourceFile: string
 _userTag: string
 __canonical: CanonicalVideoRow
 __metricCells: Record<CanonicalMetricKey, MetricCell>
}

export type TableMetricMappingStatus = {
 syncedMetricsCount: number
 mappedMetricsCount: number
 mappedMetricKeys: CanonicalMetricKey[]
 unmappedMetricKeys: CanonicalMetricKey[]
 duplicateHeaderKeys: string[]
 unavailableByReason: Record<string, number>
}

export type DatasetCoverageSummary = {
 datasetId: string
 requested: number
 fetched: number
 mapped: number
 visible: number
 unavailable: number
 reasons: Record<string, number>
}

const resolveAnalyticsCache = (): AnalyticsCache => {
  return getCanonicalAnalyticsCache() as AnalyticsCache
}

const text = (value: unknown): string => {
 if (typeof value === "string") return value.trim()
 if (typeof value === "number" && Number.isFinite(value)) return String(value)
 if (typeof value === "boolean") return value ? "true" : "false"
 return ""
}

const toNumber = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return null
 const trimmed = value.trim()
 if (!trimmed || trimmed === "-" || trimmed.toLowerCase() === "n/a") return null
 const cleaned = trimmed.replace(/,/g, "").replace(/%/g, "")
 if (!cleaned) return null
 const parsed = Number(cleaned)
 return Number.isFinite(parsed) ? parsed : null
}

const canonicalizeTextKey = (value: string): string =>
 value.toLowerCase().replace(/[^a-z0-9]/g, "")

const looksLikeVideoId = (value: string): boolean =>
 /^[A-Za-z0-9_-]{8,}$/.test(value) && !value.includes(" ")

export const parseDurationSeconds = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value))
  return Math.max(0, value)
 const raw = text(value)
 if (!raw) return 0

 if (/^PT/.test(raw)) {
  const match = raw.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = Number(match[1] || 0)
  const minutes = Number(match[2] || 0)
  const seconds = Number(match[3] || 0)
  return hours * 3600 + minutes * 60 + seconds
 }

 if (raw.includes(":")) {
  const parts = raw.split(":").map((part) => Number(part) || 0)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
 }

 const parsed = toNumber(raw)
 return parsed !== null ? Math.max(0, parsed) : 0
}

const nonNegative = (value: number | null): number =>
 value !== null && Number.isFinite(value) && value > 0 ? value : 0

const hasMetadataShortSignal = (
 title: string,
 description: string,
 tags: string[],
): boolean => {
 const merged = `${title} ${description}`.toLowerCase()
 if (merged.includes("#shorts")) return true
 return tags.some((tag) => tag.toLowerCase().includes("short"))
}

export const resolveCanonicalVideoFormat = (
 contentTypeValue: string,
 durationSeconds: number,
 shortsPlaylistSignal: boolean,
 metadataShortSignal: boolean,
 tagHint: string,
 metadataAspectRatio?: string,
): CanonicalVideoRow["format"] => {
 const normalizedType = contentTypeValue.toLowerCase()
 const normalizedHint = tagHint.toLowerCase()

 if (normalizedType.includes("live")) return "live"
 if (normalizedType.includes("story")) return "story"
 if (normalizedType.includes("short")) return "shorts"
 if (
  normalizedType.includes("long") ||
  normalizedType.includes("video_on_demand") ||
  normalizedType === "video"
 )
  return "long"

 // Definitive duration boundary:
 // Videos over 180s cannot be Shorts.
 if (durationSeconds > 180) return "long"

 // Shorts playlist / API-level signal outranks metadata heuristics.
 if (shortsPlaylistSignal) return "shorts"

 // Aspect ratio is a definitive signal for Shorts
 if (metadataAspectRatio === "9:16") return "shorts"

 // Metadata heuristic (#shorts in title/description/tags).
 if (metadataShortSignal) return "shorts"

 if (normalizedHint.includes("short")) return "shorts"
 if (normalizedHint.includes("long")) return "long"
 if (normalizedHint.includes("live")) return "live"
 if (normalizedHint.includes("story")) return "story"

 // <= 180s without any shorts signal = standard long-form upload.
 // Videos like intros, teasers, and clips are still regular uploads.
 if (durationSeconds > 0) return "long"

 // Duration and all signals missing — cannot classify.
 return "unknown"
}

const percentLikeMetrics = new Set<CanonicalMetricKey>([
 "ctr",
 "avp",
 "stw",
 "endScreenClickRate",
 "cardClickRate",
])

const normalizeMetricValue = (
 metricKey: CanonicalMetricKey,
 value: number,
): number => {
 if (percentLikeMetrics.has(metricKey) && value > 0 && value <= 1) {
  return value * 100
 }
 return value
}

const sourceFromCells = (
 cells: Array<MetricCell | null | undefined>,
): MetricSource => {
 const sources = new Set<MetricSource>()
 cells.forEach((cell) => {
  if (!cell || cell.status === "unavailable") return
  sources.add(cell.source)
 })
 if (sources.size === 0) return "hybrid"
 if (sources.size === 1) return Array.from(sources)[0]
 return "hybrid"
}

export const metricCellValue = (cell: MetricCell | undefined): number | null => {
 if (!cell || cell.status === "unavailable") return null
 return typeof cell.value === "number" && Number.isFinite(cell.value)
  ? cell.value
  : null
}

const enrichDerivedMetricCells = (
 row: CanonicalVideoRow,
 durationSeconds: number,
): CanonicalVideoRow => {
 const next = {
  ...row,
  metrics: { ...row.metrics },
 }

 const viewsCell = next.metrics.views
 const impressionsCell = next.metrics.impressions
 const revenueCell = next.metrics.revenue
 const avdCell = next.metrics.avdSeconds

 const views = metricCellValue(viewsCell)
 const impressions = metricCellValue(impressionsCell)
 const revenue = metricCellValue(revenueCell)
 const avdSeconds = metricCellValue(avdCell)

 if (
  next.metrics.watchHours.status === "unavailable" &&
  views !== null &&
  avdSeconds !== null
 ) {
  const derivedHours = (views * avdSeconds) / 3600
  next.metrics.watchHours = buildDerivedMetricCell(
   Number(derivedHours.toFixed(3)),
   sourceFromCells([viewsCell, avdCell]),
  )
 }

 if (
  next.metrics.ctr.status === "unavailable" &&
  views !== null &&
  impressions !== null &&
  impressions > 0
 ) {
  next.metrics.ctr = buildDerivedMetricCell(
   Number(((views / impressions) * 100).toFixed(3)),
   sourceFromCells([viewsCell, impressionsCell]),
  )
 }

 if (
  next.metrics.rpm.status === "unavailable" &&
  revenue !== null &&
  views !== null &&
  views > 0
 ) {
  next.metrics.rpm = buildDerivedMetricCell(
   Number(((revenue / views) * 1000).toFixed(3)),
   sourceFromCells([revenueCell, viewsCell]),
  )
 }

 if (
  next.metrics.cpm.status === "unavailable" &&
  revenue !== null &&
  impressions !== null &&
  impressions > 0
 ) {
  next.metrics.cpm = buildDerivedMetricCell(
   Number(((revenue / impressions) * 1000).toFixed(3)),
   sourceFromCells([revenueCell, impressionsCell]),
  )
 }

 if (
  next.metrics.avp.status === "unavailable" &&
  avdSeconds !== null &&
  durationSeconds > 0
 ) {
  next.metrics.avp = buildDerivedMetricCell(
   Number(((avdSeconds / durationSeconds) * 100).toFixed(1)),
   sourceFromCells([avdCell]),
  )
 }

 return next
}

const sumTotalsFromReport = (
 report: AnalyticsReport | undefined,
): WindowTotals => {
 const objects = reportRowsToObjects(report).map(toNormalizedRow)
 if (objects.length === 0) {
  return {
   views: 0,
   watchHours: 0,
   subscribersGained: 0,
   revenue: 0,
   impressions: 0,
   ctr: null,
  }
 }

 let views = 0
 let watchHours = 0
 let subscribersGained = 0
 let revenue = 0
 let impressions = 0
 const ctrValues: number[] = []

 objects.forEach((row) => {
  views += nonNegative(getMetricByAliases(row, "views").value)
  const watchCell = getMetricByAliases(row, "watchHours").value
  const watchMinutes = toNumber(
   (row as Record<string, unknown>).estimatedMinutesWatched,
  )
  watchHours +=
   nonNegative(watchCell) +
   (watchCell === null && watchMinutes ? watchMinutes / 60 : 0)
  subscribersGained += nonNegative(
   getMetricByAliases(row, "subscribersGained").value,
  )
  revenue += nonNegative(getMetricByAliases(row, "revenue").value)
  impressions += nonNegative(getMetricByAliases(row, "impressions").value)
  const ctr = getMetricByAliases(row, "ctr").value
  if (ctr !== null && Number.isFinite(ctr) && ctr > 0) {
   ctrValues.push(normalizeMetricValue("ctr", ctr))
  }
 })

 const ctr =
  impressions > 0 && views > 0
   ? (views / impressions) * 100
   : ctrValues.length > 0
     ? ctrValues.reduce((sum, value) => sum + value, 0) / ctrValues.length
     : null

 return { views, watchHours, subscribersGained, revenue, impressions, ctr }
}

const resolveWindowTotals = (
 cache: AnalyticsCache,
 window: AnalyticsWindow,
): WindowTotals => {
 const ledger = cache.ledger || {}

 // 1. Try Ledger for Window-Specific Channel Totals (e.g. lifetime, 28days)
 const windowLedgerKey = `youtube_analytics_v2::channel::::${window}`
 const windowLedgerEntry = ledger[windowLedgerKey]
 const windowReport = windowLedgerEntry?.payload

 if (windowReport) {
  const fromWindow = sumTotalsFromReport(windowReport)
  if (
   fromWindow.views > 0 ||
   fromWindow.watchHours > 0 ||
   fromWindow.revenue > 0
  ) {
   return fromWindow
  }
 }

 // 2. Try Window Report (getBundleForWindow handles legacy fallback)
 const bundle = getBundleForWindow(cache, window)
 if (bundle?.report) {
  const fromBundle = sumTotalsFromReport(bundle.report)
  if (
   fromBundle.views > 0 ||
   fromBundle.watchHours > 0 ||
   fromBundle.revenue > 0
  ) {
   return fromBundle
  }
 }

 // 3. Try Daily Metrics Ledger
 const dailyLedgerKey = `youtube_analytics_v2::channel::day::lifetime`
 const dailyLedgerEntry = ledger[dailyLedgerKey]
 const dailyReport = dailyLedgerEntry?.payload || cache.dailyMetrics

 const fromDaily = sumTotalsFromReport(dailyReport)
 if (fromDaily.views > 0 || fromDaily.watchHours > 0 || fromDaily.revenue > 0) {
  return fromDaily
 }

 // 4. Final Fallback: Legacy Channel Analytics
 const fromChannel = sumTotalsFromReport(cache.channelAnalytics)
 return fromChannel
}

const metricPriority = (cell: MetricCell): number => {
 if (cell.status === "actual") return 3
 if (cell.status === "derived") return 2
 return 1
}

const chooseBetterMetricCell = (
 existing: MetricCell,
 incoming: MetricCell,
): MetricCell => {
 const existingPriority = metricPriority(existing)
 const incomingPriority = metricPriority(incoming)

 if (incomingPriority > existingPriority) return incoming
 if (incomingPriority < existingPriority) return existing

 if (existing.status === "unavailable") return incoming
 if (incoming.status === "unavailable") return existing

 const existingValue = metricCellValue(existing)
 const incomingValue = metricCellValue(incoming)

 if (existingValue === null && incomingValue !== null) return incoming
 if (incomingValue === null) return existing
 if (existingValue === 0 && incomingValue !== 0) return incoming
 if (incoming.source === "api" && existing.source !== "api") return incoming

 return existing
}

const mergeCanonicalRowMetrics = (
 existing: CanonicalVideoRow,
 incoming: CanonicalVideoRow,
): CanonicalVideoRow => {
 const merged: CanonicalVideoRow = {
  ...existing,
  title: existing.title || incoming.title,
  uploadDate: existing.uploadDate || incoming.uploadDate,
  durationSeconds: existing.durationSeconds || incoming.durationSeconds,
  format: existing.format !== "unknown" ? existing.format : incoming.format,
  sourceMode:
   existing.sourceMode === incoming.sourceMode ? existing.sourceMode : "hybrid",
  metrics: { ...existing.metrics },
 }

 canonicalMetricOrder.forEach((metricKey) => {
  merged.metrics[metricKey] = chooseBetterMetricCell(
   existing.metrics[metricKey],
   incoming.metrics[metricKey],
  )
 })

 return merged
}

const rowIdentityKey = (
 row: Pick<CanonicalVideoRow, "videoId" | "title">,
): string => {
 const videoId = text(row.videoId)
 if (videoId) return `id:${videoId}`
 return `title:${canonicalizeTextKey(text(row.title))}`
}

const dedupeCanonicalRows = (
 rows: CanonicalVideoRow[],
): CanonicalVideoRow[] => {
 const map = new Map<string, CanonicalVideoRow>()

 rows.forEach((row) => {
  const key = rowIdentityKey(row)
  const existing = map.get(key)
  if (!existing) {
   map.set(key, row)
   return
  }
  map.set(key, mergeCanonicalRowMetrics(existing, row))
 })

 return Array.from(map.values())
}

const reportRowsToObjects = (
 report?: AnalyticsReport | null,
): Record<string, unknown>[] => {
 if (!report || !Array.isArray(report.rows) || report.rows.length === 0)
  return []

 const headerNames = (report.columnHeaders || []).map((header) =>
  String(header?.name || ""),
 )

 return report.rows
  .map((row) => {
   if (Array.isArray(row)) {
    const rowObj: Record<string, unknown> = {}
    headerNames.forEach((header, index) => {
     if (!header) return
     rowObj[header] = row[index]
    })
    return rowObj
   }

   if (row && typeof row === "object") {
    const input = row as Record<string, unknown>
    const byHeader = headerNames.reduce(
     (acc, header) => {
      if (!header) return acc
      if (acc[header] === undefined && input[header] !== undefined) {
       acc[header] = input[header]
      }
      return acc
     },
     {} as Record<string, unknown>,
    )

    return {
     ...input,
     ...byHeader,
    }
   }

   return null
  })
  .filter((row): row is Record<string, unknown> => !!row)
}

const getBundleForWindow = (
 cache: AnalyticsCache,
 window: AnalyticsWindow,
): AnalyticsWindowBundle | null => {
 // 1. Try Ledger FIRST (the new standard)
 const ledger = cache.ledger || {}
 const ledgerKey = `youtube_analytics_v2::video::video::${window}`
 const ledgerEntry = ledger[ledgerKey]
 if (ledgerEntry && ledgerEntry.payload) {
  return {
   window,
   startDate: "",
   endDate: "",
   fetchedAt: ledgerEntry.syncedAt,
   report: ledgerEntry.payload as AnalyticsReport,
  }
 }

 // 2. Fallback to legacy analyticsByWindow
 const bundle = cache.analyticsByWindow?.[window]
 if (bundle && bundle.report) return bundle

 // 3. Fallback to global analytics if lifetime
 if (window === "lifetime" && cache.analytics) {
  return {
   window,
   startDate: "",
   endDate: "",
   fetchedAt: Date.now(),
   report: cache.analytics,
  }
 }

 return null
}

const extractVideoIdCandidates = (row: Record<string, unknown>): string[] => {
 const candidates = [
  text(row.Content),
  text(row.content),
  text(row.video),
  text(row.videoId),
  text(row["Video ID"]),
  text(row.Dimension),
  text(row.dimension),
 ]

 return candidates.filter((candidate) => looksLikeVideoId(candidate))
}

const extractTitleCandidates = (row: Record<string, unknown>): string[] => {
 const candidates = [
  text(row["Video title"]),
  text(row.title),
  text(row.Video),
  text(row.Dimension),
  text(row.video),
 ]

 return candidates.filter(
  (candidate) => !!candidate && !looksLikeVideoId(candidate),
 )
}

const toNormalizedRow = (
 input: Record<string, unknown>,
): Record<string, unknown> => {
 const normalized = normalizeRow(input as Record<string, any>)
 return {
  ...input,
  ...normalized,
 }
}

const inferMetricCellsFromRow = (
 row: Record<string, unknown>,
 source: MetricSource,
): Record<CanonicalMetricKey, MetricCell> => {
 const metrics = emptyMetricCells(source)

 canonicalMetricOrder.forEach((metricKey) => {
  const match = getMetricByAliases(row, metricKey)
  if (!match.found || match.value === null) {
   metrics[metricKey] = buildUnavailableMetricCell(source)
   return
  }

  metrics[metricKey] = buildActualMetricCell(
   normalizeMetricValue(metricKey, match.value),
   source,
  )
 })

 return metrics
}

const applyStatsFallback = (
 row: CanonicalVideoRow,
 stats: CachedVideoStat,
): CanonicalVideoRow => {
 const next = {
  ...row,
  metrics: { ...row.metrics },
 }

 const statViews = toNumber(stats.viewCount)
 const statLikes = toNumber(stats.likeCount)
 const statComments = toNumber(stats.commentCount)

 if (next.metrics.views.status === "unavailable" && statViews !== null) {
  next.metrics.views = buildActualMetricCell(statViews, "api")
 }
 if (next.metrics.likes.status === "unavailable" && statLikes !== null) {
  next.metrics.likes = buildActualMetricCell(statLikes, "api")
 }
 if (next.metrics.comments.status === "unavailable" && statComments !== null) {
  next.metrics.comments = buildActualMetricCell(statComments, "api")
 }

 return next
}

const apiRowsForWindow = (
 cache: AnalyticsCache,
 window: AnalyticsWindow,
): CanonicalVideoRow[] => {
 const bundle = getBundleForWindow(cache, window)
 const report = bundle?.report
 const reportRows = reportRowsToObjects(report).map(toNormalizedRow)

 const ledger = cache.ledger || {}
 const analyticsById = new Map<string, Record<string, unknown>>()
 const analyticsByTitle = new Map<string, Record<string, unknown>>()

 reportRows.forEach((row) => {
  extractVideoIdCandidates(row).forEach((videoId) => {
   analyticsById.set(videoId, row)
  })
  extractTitleCandidates(row).forEach((titleCandidate) => {
   analyticsByTitle.set(canonicalizeTextKey(titleCandidate), row)
  })
 })

 // 1. Gather Video Metadata (Ledger FIRST, then legacy cache.videos/stats)
 const videos = Array.isArray(cache.videos) ? cache.videos : []
 const stats = cache.stats || {}
 const contentTypeMap = cache.videoContentType || {}

 // Create a unified map of video metadata from all sources
 const metadataByVideoId = new Map<string, CachedVideo & CachedVideoStat>()

 // a) Seed with legacy videos/stats
 videos.forEach((v) => {
  const vid = text(v.videoId)
  if (!vid) return
  metadataByVideoId.set(vid, { ...v, ...(stats[vid] || {}) })
 })

 // b) Overlay with Ledger entries (youtube_data_v3::video::id)
 Object.entries(ledger).forEach(([key, entry]) => {
  if (entry.source === "youtube_data_v3" && entry.context === "video") {
   // Assuming dimensions[0] is videoId for this context
   const videoId = entry.dimensions[0]
   if (videoId && entry.payload) {
    const existing = metadataByVideoId.get(videoId) || {}
    metadataByVideoId.set(videoId, { ...existing, ...entry.payload })
   }
  }
 })

 const canonicalRows: CanonicalVideoRow[] = []

 // Process videos we have metadata for
 metadataByVideoId.forEach((meta, videoId) => {
  const title = text(meta.title) || `Video ${videoId}`
  const uploadDate = text(meta.publishedAt)

  const analyticsRow =
   analyticsById.get(videoId) ||
   analyticsByTitle.get(canonicalizeTextKey(title)) ||
   {}

  const metricCells = inferMetricCellsFromRow(analyticsRow, "api")
  const durationSeconds = parseDurationSeconds(
   meta.durationSeconds ??
    meta.durationRaw ??
    analyticsRow["Duration (sec)"] ??
    analyticsRow.Duration,
  )

  const contentType = text(contentTypeMap[videoId] ?? meta.contentType)
  const isShortSignal = meta.isShort === true
  const metadataTags = Array.isArray(meta.tags)
   ? meta.tags.map((tag) => text(tag)).filter(Boolean)
   : []
  const metadataShortSignal = hasMetadataShortSignal(
   text(meta.title) || title,
   text(meta.description),
   metadataTags,
  )

  let row: CanonicalVideoRow = {
   id: `api-${videoId}`,
   videoId,
   title,
   uploadDate,
   format: resolveCanonicalVideoFormat(
    contentType,
    durationSeconds,
    isShortSignal,
    metadataShortSignal,
    "",
   ),
   durationSeconds,
   sourceMode: "api",
   metrics: metricCells,
  }
  row.originalData = analyticsRow

  row = applyStatsFallback(row, meta)
  row = enrichDerivedMetricCells(row, durationSeconds)

  canonicalRows.push(row)
 })

 // 2. Include rows that exist in Analytics report but were NOT in metadata lists
 reportRows.forEach((rawRow, index) => {
  const candidateVideoId = extractVideoIdCandidates(rawRow)[0] || ""
  const titleCandidate =
   extractTitleCandidates(rawRow)[0] ||
   (candidateVideoId
    ? `Unknown Title (${candidateVideoId})`
    : `Analytics Row ${index + 1}`)

  const key = candidateVideoId || canonicalizeTextKey(titleCandidate)
  const alreadyIncluded = canonicalRows.some((row) =>
   candidateVideoId
    ? row.videoId === candidateVideoId
    : canonicalizeTextKey(row.title) === key,
  )
  if (alreadyIncluded) return

  const durationSeconds = parseDurationSeconds(
   rawRow["Duration (sec)"] ?? rawRow.Duration ?? rawRow.duration,
  )

  let row: CanonicalVideoRow = {
   id: `api-report-${candidateVideoId || key}`,
   videoId: candidateVideoId,
   title: titleCandidate,
   uploadDate: text(rawRow.Date || rawRow.day || rawRow["Upload date"]),
   format: resolveCanonicalVideoFormat(
    text(rawRow.creatorContentType),
    durationSeconds,
    false,
    hasMetadataShortSignal(
     text(rawRow["Video title"] ?? rawRow.title),
     text(rawRow.description),
     Array.isArray(rawRow.tags)
      ? rawRow.tags.map((tag) => text(tag)).filter(Boolean)
      : [],
    ),
    "",
   ),
   durationSeconds,
   sourceMode: "api",
   metrics: inferMetricCellsFromRow(rawRow, "api"),
  }
  row.originalData = rawRow

  row = enrichDerivedMetricCells(row, durationSeconds)
  canonicalRows.push(row)
 })

 const deduped = dedupeCanonicalRows(canonicalRows)
 return deduped.map((row) => enrichDerivedMetricCells(row, row.durationSeconds))
}

const resolveCsvFileWindow = (file: CsvFileWithTag): AnalyticsWindow | null => {
 const explicit = (
  file as CsvFileWithTag & { analyticsWindow?: AnalyticsWindow }
 ).analyticsWindow
 if (explicit && ANALYTICS_WINDOWS.includes(explicit)) return explicit
 return inferAnalyticsWindowFromName(file.name || "")
}

const shouldIncludeCsvFileForWindow = (
 fileWindow: AnalyticsWindow | null,
 selectedWindow: AnalyticsWindow,
): boolean => {
 if (selectedWindow === "lifetime") {
  return fileWindow === null || fileWindow === "lifetime"
 }
 return fileWindow === selectedWindow
}

const csvRowsForWindow = (
 csvFiles: CsvFileWithTag[],
 window: AnalyticsWindow,
): CanonicalVideoRow[] => {
 if (!Array.isArray(csvFiles) || csvFiles.length === 0) return []

 const filesWithRows = csvFiles.filter(
  (file) => Array.isArray(file.data) && file.data.length > 0,
 )

 const scopedFiles = filesWithRows.filter((file) =>
  shouldIncludeCsvFileForWindow(resolveCsvFileWindow(file), window),
 )

 if (scopedFiles.length === 0) return []

 const categorized = scopedFiles.map((file) => {
  const rows = (file.data || []) as Record<string, unknown>[]
  const kind = classifyCsvExportKind(file.name || "", rows)
  return { file, kind, rows }
 })

 const hasTableData = categorized.some((entry) => entry.kind === "table_data")

 const filesToUse = categorized.filter((entry) => {
  if (entry.kind === "totals" || entry.kind === "chart") return false
  if (hasTableData) return entry.kind === "table_data"
  return entry.kind === "unknown" || entry.kind === "table_data"
 })

 const out: CanonicalVideoRow[] = []

 filesToUse.forEach(({ file, rows }) => {
  rows.forEach((rawRow, index) => {
   if (!rawRow || typeof rawRow !== "object") return
   if (isLikelyTotalCsvRow(rawRow)) return

   const normalized = toNormalizedRow(rawRow)
   const videoId = extractVideoIdCandidates(normalized)[0] || ""
   const title =
    extractTitleCandidates(normalized)[0] ||
    text(normalized.Dimension) ||
    text(normalized.Video)

   if (!videoId && !title) return

   const durationSeconds = parseDurationSeconds(
    normalized["Duration (sec)"] ?? normalized.Duration ?? normalized.Length,
   )

   const formatFromTag = text(file.tag)
   const formatFromRow = text(
    normalized.Format ??
     normalized.Type ??
     normalized.contentType ??
     normalized.creatorContentType,
   )

   let row: CanonicalVideoRow = {
    id: `csv-${file.id}-${index}`,
    videoId,
    title: title || `CSV Row ${index + 1}`,
    uploadDate: text(
     normalized["Upload date"] ||
      normalized.Date ||
      normalized["Video publish time"],
    ),
    format: resolveCanonicalVideoFormat(
     formatFromRow,
     durationSeconds,
     false,
     false,
     formatFromTag,
    ),
    durationSeconds,
    sourceMode: "csv_table",
    metrics: inferMetricCellsFromRow(normalized, "csv_table"),
   }
   row.originalData = rawRow

   row = enrichDerivedMetricCells(row, durationSeconds)
   out.push(row)
  })
 })

 return dedupeCanonicalRows(out)
}

const mergeRowsForHybrid = (
 apiRows: CanonicalVideoRow[],
 csvRows: CanonicalVideoRow[],
): CanonicalVideoRow[] => {
 if (apiRows.length === 0) return csvRows
 if (csvRows.length === 0) return apiRows

 const mergedMap = new Map<string, CanonicalVideoRow>()

 apiRows.forEach((row) => {
  mergedMap.set(rowIdentityKey(row), row)
 })

 csvRows.forEach((csvRow) => {
  const key = rowIdentityKey(csvRow)
  const existing = mergedMap.get(key)
  if (!existing) {
   mergedMap.set(key, csvRow)
   return
  }
  mergedMap.set(key, mergeCanonicalRowMetrics(existing, csvRow))
 })

 return Array.from(mergedMap.values()).map((row) => ({
  ...row,
  sourceMode: "hybrid",
 }))
}

export const getMasterRows = (
 window: AnalyticsWindow = "lifetime",
 sourceMode: AnalyticsSourceMode = "api",
 csvFiles: CsvFileWithTag[] = [],
): CanonicalVideoRow[] => {
 const cache = resolveAnalyticsCache()
 const apiRows = sourceMode !== "csv" ? apiRowsForWindow(cache, window) : []
 const csvRows = sourceMode !== "api" ? csvRowsForWindow(csvFiles, window) : []

 if (sourceMode === "api") return apiRows
 if (sourceMode === "csv") return csvRows
 return mergeRowsForHybrid(apiRows, csvRows)
}

export const getMetricSummary = (
 window: AnalyticsWindow = "lifetime",
 sourceMode: AnalyticsSourceMode = "api",
 csvFiles: CsvFileWithTag[] = [],
): MetricSummary => {
 const rows = getMasterRows(window, sourceMode, csvFiles)
 const cache = resolveAnalyticsCache()
 const totalsFallback = resolveWindowTotals(cache, window)

 let views = 0
 let watchHours = 0
 let subscribersGained = 0
 let revenue = 0

 const ctrValues: number[] = []
 const rpmValues: number[] = []
 const cpmValues: number[] = []
 const avdValues: number[] = []
 const avpValues: number[] = []

 rows.forEach((row) => {
  const viewsValue = metricCellValue(row.metrics.views)
  const watchHoursValue = metricCellValue(row.metrics.watchHours)
  const subsValue = metricCellValue(row.metrics.subscribersGained)
  const revenueValue = metricCellValue(row.metrics.revenue)

  if (viewsValue !== null) views += viewsValue
  if (watchHoursValue !== null) watchHours += watchHoursValue
  if (subsValue !== null) subscribersGained += subsValue
  if (revenueValue !== null) revenue += revenueValue

  const ctr = metricCellValue(row.metrics.ctr)
  const rpm = metricCellValue(row.metrics.rpm)
  const cpm = metricCellValue(row.metrics.cpm)
  const avd = metricCellValue(row.metrics.avdSeconds)
  const avp = metricCellValue(row.metrics.avp)

  if (ctr !== null) ctrValues.push(ctr)
  if (rpm !== null) rpmValues.push(rpm)
  if (cpm !== null) cpmValues.push(cpm)
  if (avd !== null) avdValues.push(avd)
  if (avp !== null) avpValues.push(avp)
 })

 const avg = (values: number[]): number | null => {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
 }

 const resolvedTotals = {
  views: views > 0 ? views : totalsFallback.views,
  watchHours: watchHours > 0 ? watchHours : totalsFallback.watchHours,
  subscribersGained:
   subscribersGained > 0 ? subscribersGained : totalsFallback.subscribersGained,
  revenue: revenue > 0 ? revenue : totalsFallback.revenue,
 }

 return {
  rowCount: rows.length,
  totals: resolvedTotals,
  averages: {
   ctr: avg(ctrValues),
   rpm: avg(rpmValues),
   cpm: avg(cpmValues),
   avdSeconds: avg(avdValues),
   avp: avg(avpValues),
  },
 }
}

export const getMetricAvailability = (
 metricKey: CanonicalMetricKey,
 window: AnalyticsWindow = "lifetime",
 sourceMode: AnalyticsSourceMode = "api",
 csvFiles: CsvFileWithTag[] = [],
): MetricAvailability => {
 const rows = getMasterRows(window, sourceMode, csvFiles)

 let actualCount = 0
 let derivedCount = 0
 let unavailableCount = 0
 let apiCount = 0
 let csvCount = 0
 let hybridCount = 0

 rows.forEach((row) => {
  const cell = row.metrics[metricKey]
  if (cell.status === "actual") actualCount += 1
  else if (cell.status === "derived") derivedCount += 1
  else unavailableCount += 1

  if (cell.status !== "unavailable") {
   if (cell.source === "api") apiCount += 1
   else if (cell.source === "csv_table") csvCount += 1
   else hybridCount += 1
  }
 })

 const availableCount = actualCount + derivedCount
 const coveragePct = rows.length > 0 ? (availableCount / rows.length) * 100 : 0

 return {
  metricKey,
  window,
  sourceMode,
  actualCount,
  derivedCount,
  unavailableCount,
  availableCount,
  coveragePct,
  bySource: {
   api: apiCount,
   csv_table: csvCount,
   hybrid: hybridCount,
  },
 }
}

export const MASTER_TABLE_HEADER_TO_METRIC_KEY: Record<
 string,
 CanonicalMetricKey
> = canonicalMetricOrder.reduce(
 (acc, metricKey) => {
  const header = getDisplayLabel(metricKey, "tableHeader")
  if (header) acc[header] = metricKey
  return acc
 },
 {} as Record<string, CanonicalMetricKey>,
)

const metricToRowValue = (cell: MetricCell): number | null => {
 if (cell.status === "unavailable") return null
 return cell.value
}

export const canonicalRowsToMasterTableRows = (
 rows: CanonicalVideoRow[],
): MasterTableRow[] => {
 return rows.map((row, index) => {
  const base: MasterTableRow = {
   _id: row.id || `canonical-${index}`,
   _sourceFile:
    row.sourceMode === "api"
     ? "YouTube API"
     : row.sourceMode === "csv_table"
       ? "CSV Upload"
       : "YouTube API + CSV",
   _userTag: row.format,
   "Video title": row.title,
   "Video ID": row.videoId,
   "Upload date": row.uploadDate,
   Date: row.uploadDate,
   Format: row.format,
   Length: row.durationSeconds > 0 ? row.durationSeconds : null,
   "Duration (sec)": row.durationSeconds > 0 ? row.durationSeconds : null,
   titleLength: row.title.length,
   __canonical: row,
   __metricCells: row.metrics,
   _originalData: (row as any).originalData || {},
  }

  canonicalMetricOrder.forEach((metricKey) => {
   const header = getDisplayLabel(metricKey, "tableHeader")
   if (!header) return
   base[header] = metricToRowValue(row.metrics[metricKey])
  })

  // Keep legacy aliases used by existing rendering/helpers.
  base["Watch Time (Hours)"] = base["Watch Hrs"]
  base["Watch time (hours)"] = base["Watch Hrs"]
  base["AVD (Average View Duration)"] = base.AVD
  base["AVD (Sec)"] = base.AVD
  base["AVP (%)"] = base["AVP %"]
  base["Click-Through Rate (CTR)"] = base.CTR
  base["CTR (%)"] = base.CTR
  base["Impressions click-through rate (%)"] = base.CTR
  base["Engaged views"] = base.Engaged
  base["End screen click rate"] = base["End Screen %"]
  base["Card click rate"] = base["Card %"]
  base["Viewer percentage"] = base["Viewer %"]
  base["Data Provenance"] = base["Data Src"]
  base["Estimated revenue"] = base.Revenue

  return base
 })
}

export const buildVideoStatsVerificationSummary = ({
 window,
 reportRows,
 masterRows,
 diagnostics,
 duplicateShortHeaders = [],
}: {
 window: AnalyticsWindow
 reportRows: Record<string, unknown>[]
 masterRows: CanonicalVideoRow[]
 diagnostics?: SyncDiagnosticsShape | null
 duplicateShortHeaders?: string[]
}): VideoStatsVerificationSummary => {
 const rawImpressions = reportRows.filter(
  (row) => getMetricByAliases(row, "impressions").found,
 ).length
 const rawCtr = reportRows.filter((row) => getMetricByAliases(row, "ctr").found).length
 const mappedImpressions = masterRows.filter((row) => {
  const cell = row.metrics.impressions
  return cell.status !== "unavailable" && cell.value !== null
 }).length
 const mappedCtr = masterRows.filter((row) => {
  const cell = row.metrics.ctr
  return cell.status !== "unavailable" && cell.value !== null
 }).length

 const lastFailure =
  (diagnostics?.failureReasons || [])
   .filter(
    (failure) =>
     failure?.group === "impressions_ctr" ||
     (failure?.metrics || []).some(
      (metric) =>
       metric === "videoThumbnailImpressions" ||
       metric === "videoThumbnailImpressionsClickRate",
     ),
   )
   .slice(-1)[0] || null

 let mappingStatus: VideoStatsVerificationSummary["mappingStatus"] = "healthy"
 if (lastFailure && rawImpressions === 0 && rawCtr === 0) {
  mappingStatus = "request_failure"
 } else if (rawImpressions === 0 && rawCtr === 0) {
  mappingStatus = "missing_upstream"
 } else if (
  (rawImpressions > 0 && mappedImpressions === 0) ||
  (rawCtr > 0 && mappedCtr === 0)
 ) {
  mappingStatus = "mapping_failure"
 }

 return {
  window,
  reportRowCount: reportRows.length,
  masterRowCount: masterRows.length,
  rawMetricRows: {
   impressions: rawImpressions,
   ctr: rawCtr,
  },
  mappedMetricRows: {
   impressions: mappedImpressions,
   ctr: mappedCtr,
  },
  lastFailure: lastFailure
   ? {
      requestClass: lastFailure.requestClass,
      reason: lastFailure.reason,
      status: lastFailure.status,
     }
   : null,
  mappingStatus,
  duplicateShortHeaders,
 }
}

export const getVideoStatsVerificationSummary = (
 window: AnalyticsWindow,
 duplicateShortHeaders: string[] = [],
): VideoStatsVerificationSummary => {
 const cache = resolveAnalyticsCache()
 const bundle = getBundleForWindow(cache, window)
 const reportRows = reportRowsToObjects(bundle?.report).map(toNormalizedRow)
 const masterRows = getMasterRows(window, "api")
 const diagnostics = cache.analyticsByWindow?.[window]?.syncDiagnostics || null
 return buildVideoStatsVerificationSummary({
  window,
  reportRows,
  masterRows,
  diagnostics,
  duplicateShortHeaders,
 })
}

export const getHeaderMetricCell = (
 row: Record<string, unknown>,
 header: string,
): MetricCell | null => {
 const masterRow = row as Partial<MasterTableRow>
 if (!masterRow.__metricCells) return null

 const metricKey = MASTER_TABLE_HEADER_TO_METRIC_KEY[header]
 if (!metricKey) return null

 return masterRow.__metricCells[metricKey] || null
}

export const buildTableMetricMappingStatus = ({
 masterRows,
 visibleHeaders,
 duplicateHeaderKeys = [],
}: {
 masterRows: CanonicalVideoRow[]
 visibleHeaders: string[]
 duplicateHeaderKeys?: string[]
}): TableMetricMappingStatus => {
 const syncedMetricKeys = canonicalMetricOrder.filter((metricKey) =>
  masterRows.some((row) => row.metrics[metricKey]?.status !== "unavailable"),
 )
 const mappedMetricKeys = visibleHeaders
  .map((header) => MASTER_TABLE_HEADER_TO_METRIC_KEY[header])
  .filter((metricKey): metricKey is CanonicalMetricKey => Boolean(metricKey))
 const mappedKeySet = new Set<CanonicalMetricKey>(mappedMetricKeys)
 const syncedKeySet = new Set<CanonicalMetricKey>(syncedMetricKeys)
 const unmappedMetricKeys = Array.from(syncedKeySet).filter(
  (metricKey) => !mappedKeySet.has(metricKey),
 )

 const unavailableByReason: Record<string, number> = {}
 masterRows.forEach((row) => {
  canonicalMetricOrder.forEach((metricKey) => {
   const cell = row.metrics[metricKey]
   if (cell.status !== "unavailable") return
   const reason = (cell.reasonCode || "unavailable_unknown").trim()
   unavailableByReason[reason] = (unavailableByReason[reason] || 0) + 1
  })
 })

 return {
  syncedMetricsCount: syncedKeySet.size,
  mappedMetricsCount: mappedKeySet.size,
  mappedMetricKeys: Array.from(mappedKeySet),
  unmappedMetricKeys,
  duplicateHeaderKeys,
  unavailableByReason,
 }
}

export const buildDatasetCoverageSummary = ({
 datasetId,
 requestedHeaders,
 visibleHeaders,
 rows,
}: {
 datasetId: string
 requestedHeaders: string[]
 visibleHeaders: string[]
 rows: Array<Record<string, unknown>>
}): DatasetCoverageSummary => {
 const requested = requestedHeaders.length
 const visible = visibleHeaders.length
 const mapped = visibleHeaders.length

 let fetched = 0
 visibleHeaders.forEach((header) => {
  const hasData = rows.some((row) => {
   const raw = row[header]
   if (raw !== undefined && raw !== null && text(raw) !== "") return true
   const metricCell = getHeaderMetricCell(row, header)
   return !!(metricCell && metricCell.value !== null)
  })
  if (hasData) fetched += 1
 })

 const reasons: Record<string, number> = {}
 rows.forEach((row) => {
  visibleHeaders.forEach((header) => {
   const metricCell = getHeaderMetricCell(row, header)
   if (!metricCell || metricCell.status !== "unavailable") return
   const reason = (metricCell.reasonCode || "unavailable_unknown").trim()
   reasons[reason] = (reasons[reason] || 0) + 1
  })
 })

 const unavailable = Math.max(0, requested - fetched)
 return {
  datasetId,
  requested,
  fetched,
  mapped,
  visible,
  unavailable,
  reasons,
 }
}
