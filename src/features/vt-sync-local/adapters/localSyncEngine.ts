import { normalizeVtSyncSnapshot, saveVtSyncSnapshot } from "./snapshot"
import { normalizeVtSyncVideoPrivacyFormat, resolveVtSyncVideoFormat } from "./privacyPolicy"
import {
 selectVtSyncRetentionTargets,
 VT_SYNC_RETENTION_CURVE_METRICS,
 VT_SYNC_RETENTION_GRANULAR_METRICS,
 VT_SYNC_RETENTION_METRICS,
} from "./retentionSelection"
import { normalizeVtSyncVideoTableRows } from "./tableData"
import {
 buildVtSyncInventoryId,
 getVtSyncKnownVideoIds,
 getVtSyncChannelIndex,
 listVtSyncVideoInventory,
 putVtSyncChannelIndex,
 putVtSyncInventoryCursor,
 putVtSyncVideoInventoryRecords,
 replaceLatestVtSyncDatasetRawReport,
 replaceLatestVtSyncDatasetTableRows,
 replaceLatestVtSyncSyncRun,
} from "./localDbRepository"
import {
 VT_SYNC_CATEGORY_OPTIONS,
 VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS,
 filterVtSyncVisibleCategoryIds,
} from "../upstream/syncCategoryRegistry"
import {
 VT_SYNC_ANALYTICS_METRIC_DESCRIPTORS,
 VT_SYNC_ANALYTICS_METRIC_BUNDLES,
 VT_SYNC_REQUIRED_ANALYTICS_METRICS,
 mapVtSyncAnalyticsMetricFields,
} from "../upstream/analyticsMetricContract"
import { getVtSyncAvailableTrafficDetailSources } from "../upstream/trafficDetailRegistry"
import {
 GoogleRequestError,
 readGoogleProxyError,
 requestGoogleWithRetry,
} from "../../../services/youtube/googleProxyErrors"
import type {
 VtSyncAnalyticsWindow,
 VtSyncInventorySyncResult,
 VtSyncSnapshot,
 VtSyncSyncManifest,
 VtSyncTrafficByDayRow,
 VtSyncVideoInventoryRecord,
 VtSyncVideoItem,
} from "./contracts"

export const VT_SYNC_SERVER_ACCOUNT_TOKEN = "__viewtube_server_account_session__"
export const VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE = 25
/** Fallback windows remain bounded; direct detail pagination is intentionally unbounded. */
export const VT_SYNC_TRAFFIC_DETAIL_FALLBACK_MAX_WINDOWS = 4
export const VT_SYNC_PAGINATED_REPORT_MAX_PAGES = 4
export const VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE = 200
export const VT_SYNC_ANALYTICS_DATE_WINDOW_DAYS = 500

export type VtSyncLocalSyncPhaseStatus = "pending" | "running" | "complete" | "partial" | "failed" | "skipped"

export type VtSyncLocalSyncPhase = {
 id: string
 label: string
 status: VtSyncLocalSyncPhaseStatus
 rows: number
 startedAt?: string
 completedAt?: string
 message?: string
 error?: string
 failureCode?: string
 retryable?: boolean
 reconnectRequired?: boolean
 requestId?: string
 skippedReason?: string
 currentQueryLabel?: string
 nextQueryLabel?: string
}

export type VtSyncLocalSyncProgress = {
 runId: string
 startedAt: string
 completedAt?: string
 status: "idle" | "running" | "complete" | "partial" | "failed"
 failureCode?: string
 retryable?: boolean
 reconnectRequired?: boolean
 requestId?: string
 requestedCategoryIds: string[]
 phases: VtSyncLocalSyncPhase[]
}

export type VtSyncLocalSyncOptions = {
 token: string
 selectedCategories: string[]
 previousSnapshot: VtSyncSnapshot
 /** Specific video IDs for a manual/deep retention sync. The balanced 5 long + 5 Shorts baseline is used when omitted/empty. */
 retentionVideoIds?: string[]
 /** Explicit operator action; normal catalog runs fetch only missing/incomplete metadata. */
 forceFullVideoMetadata?: boolean
 /** Verified, explicitly selected CMS owner. Never inferred or combined. */
 contentOwnerId?: string
 onProgress?: (progress: VtSyncLocalSyncProgress) => void
 onSnapshotCommit?: (snapshot: VtSyncSnapshot) => void
}

type BundleResult = {
 rows: Record<string, any>[] | null
 columns: string[]
 error?: string
 status?: number
 fallback?: {
  strategy: "traffic_detail_date_windows"
  reason: string
  rowsBefore: number
  rowsAfter: number
 }
 pageDiagnostics?: Array<{
  page: number
  startIndex: number
  maxResults: number
  rows: number
  status: "complete" | "short" | "failed"
  httpStatus?: number
  error?: string
  startDate?: string
  endDate?: string
 }>
}

type PlaylistMetadata = {
 id: string
 title: string
 description: string
 publishedAt: string
 videoCount: number
 privacyStatus: string
 thumbnail?: string
}

type UploadPlaylistItem = {
 videoId: string
 title?: string
 publishedAt?: string
 thumbnail?: string
}

type UploadPlaylistPage = {
 items: UploadPlaylistItem[]
 nextPageToken: string
}

type TrafficEnrichmentType = "video" | "channel" | "playlist"

const YOUTUBE_CATEGORY_NAMES: Record<string, string> = {
 "1": "Film & Animation",
 "2": "Autos & Vehicles",
 "10": "Music",
 "15": "Pets & Animals",
 "17": "Sports",
 "19": "Travel & Events",
 "20": "Gaming",
 "22": "People & Blogs",
 "23": "Comedy",
 "24": "Entertainment",
 "25": "News & Politics",
 "26": "Howto & Style",
 "27": "Education",
 "28": "Science & Technology",
 "29": "Nonprofits & Activism",
}

const toLocalDateKey = (date: Date) =>
 `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
const daysAgo = (days: number) => {
 const date = new Date()
 date.setDate(date.getDate() - days)
 return toLocalDateKey(date)
}
const parseDateKey = (dateKey: string) => {
 const [year, month, day] = dateKey.split("-").map(Number)
 return new Date(year || 2000, (month || 1) - 1, day || 1)
}
const addDaysToDateKey = (dateKey: string, days: number) => {
 const date = parseDateKey(dateKey)
 date.setDate(date.getDate() + days)
 return toLocalDateKey(date)
}
const daysBetweenInclusive = (startDate: string, endDate: string) =>
 Math.max(1, Math.floor((parseDateKey(endDate).getTime() - parseDateKey(startDate).getTime()) / 86_400_000) + 1)
// YouTube Analytics data for "today" is usually incomplete; report through yesterday instead.
const reportEndDate = () => daysAgo(1)
// Fallback lifetime start date for calls made before the channel's actual sign-up date
// (snapshot.channelPublishedAt) is known, e.g. if channel_metadata wasn't synced this run.
const VT_SYNC_LIFETIME_START_DATE = "2000-01-01"
export const buildVtSyncAnalyticsMonthRange = (startDate: string, endDate: string) => ({
 startDate: `${String(startDate || VT_SYNC_LIFETIME_START_DATE).slice(0, 7)}-01`,
 endDate: `${String(endDate || reportEndDate()).slice(0, 7)}-01`,
})

export const buildVtSyncAnalyticsMonthWindows = (
 startDate: string,
 endDate: string,
 monthsPerWindow = 120,
) => {
 const range = buildVtSyncAnalyticsMonthRange(startDate, endDate)
 const first = parseDateKey(range.startDate)
 const final = parseDateKey(range.endDate)
 const windows: Array<{ startDate: string; endDate: string }> = []
 const safeWindowMonths = Math.max(1, monthsPerWindow)
 for (let cursor = new Date(first); cursor.getTime() <= final.getTime();) {
  const windowStart = toLocalDateKey(cursor)
  const candidateEnd = new Date(cursor.getFullYear(), cursor.getMonth() + safeWindowMonths, 0)
  const windowEnd = candidateEnd.getTime() > final.getTime() ? range.endDate : toLocalDateKey(candidateEnd)
  windows.push({ startDate: windowStart, endDate: windowEnd })
  cursor = new Date(candidateEnd.getFullYear(), candidateEnd.getMonth() + 1, 1)
 }
 return windows
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const shouldSync = (selected: Set<string>, id: string) => selected.has(id)

const ANNOTATION_ANALYTICS_METRICS = [
 "annotationClicks",
 "annotationImpressions",
 "annotationClickThroughRate",
 ] as const

const FULL_ANALYTICS_METRICS = [
 ...VT_SYNC_REQUIRED_ANALYTICS_METRICS,
 ...ANNOTATION_ANALYTICS_METRICS,
]

const FALLBACK_BLOCKED_METRICS = new Set([
 "estimatedRevenue",
 "cpm",
 "grossRevenue",
 "monetizedPlaybacks",
 "playbackBasedCpm",
 "adImpressions",
 "estimatedAdRevenue",
 "estimatedRedPartnerRevenue",
 "redViews",
 "estimatedRedMinutesWatched",
 "cardClicks",
 "cardImpressions",
 "cardClickRate",
 "cardTeaserClicks",
 "cardTeaserImpressions",
 "cardTeaserClickRate",
 "annotationClicks",
 "annotationImpressions",
 "annotationClickThroughRate",
])

const DAILY_ANALYTICS_METRIC_BUNDLES = [
 ...VT_SYNC_ANALYTICS_METRIC_BUNDLES,
 {
  id: "annotations",
  metrics: [...ANNOTATION_ANALYTICS_METRICS],
 },
] as const

const LONG_FORMAT_METRICS = [
 "cardImpressions",
 "cardClicks",
 "cardClickRate",
 "cardTeaserImpressions",
 "cardTeaserClicks",
 "cardTeaserClickRate",
]

const mapAnalyticsTimeMetricRow = (
 row: Record<string, any>,
 dimension: "day" | "month",
): Record<string, unknown> => ({
 ...row,
 date: row[dimension],
 ...mapVtSyncAnalyticsMetricFields(row),
 annotationClicks: numberOrUndefined(row.annotationClicks),
 annotationImpressions: numberOrUndefined(row.annotationImpressions),
 annotationClickThroughRate: numberOrUndefined(row.annotationClickThroughRate),
})

export const GEOGRAPHY_PROVINCE_SAFE_METRICS = [
 "engagedViews",
 "views",
 "redViews",
 "estimatedMinutesWatched",
 "estimatedRedMinutesWatched",
 "averageViewDuration",
 "averageViewPercentage",
 "cardClickRate",
 "cardTeaserClickRate",
 "cardImpressions",
 "cardTeaserImpressions",
 "cardClicks",
 "cardTeaserClicks",
] as const

const numberOrZero = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value === "string") {
  const parsed = Number(value.replace(/[$,% ,]/g, ""))
  return Number.isFinite(parsed) ? parsed : 0
 }
 return 0
}

const numberOrUndefined = (value: unknown): number | undefined => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value === "string" && value.trim()) {
  const parsed = Number(value.replace(/[$,% ,]/g, ""))
  return Number.isFinite(parsed) ? parsed : undefined
 }
 return undefined
}

const parseDurationSeconds = (duration: unknown): number => {
 if (typeof duration === "number" && Number.isFinite(duration)) return duration
 const raw = typeof duration === "string" ? duration : ""
 const iso = raw.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i)
 if (iso) return Number(iso[1] || 0) * 3600 + Number(iso[2] || 0) * 60 + Number(iso[3] || 0)
 return 0
}

const fetchWithBackoff = async (url: string, token: string, maxRetries = 3): Promise<Response> => {
 const request = () => token === VT_SYNC_SERVER_ACCOUNT_TOKEN
  ? fetch("/api/account/google-proxy", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  })
  : fetch(url, { headers: { Authorization: `Bearer ${token}` } })
 let operation = "google-read"
 try { operation = new URL(url).pathname } catch {
  // Keep the generic operation label for malformed or relative diagnostic URLs.
 }
 return requestGoogleWithRetry(request, { maxAttempts: maxRetries, operation })
}

/**
 * The Analytics API rejects any sort key that isn't also selected as a metric or
 * dimension. Reports are fetched as per-family metric bundles (watch, engagement,
 * cards, revenue) that all sort by -views, but only the "watch" bundle actually
 * lists `views` — so engagement/cards/revenue used to return 400 "-views is not
 * selected in 'metrics' or 'dimensions'". A sort key is always a metric or a
 * dimension; when it isn't the report's dimension, add it back to the metrics so
 * every bundle sorts consistently and the request is accepted.
 */
export const ensureSortMetricSelected = (
 metrics: string[],
 sort: string | undefined,
 dimensions: string | undefined,
): string[] => {
 const sortKey = sort ? sort.replace(/^-/, "").trim() : ""
 if (!sortKey) return metrics
 const dimensionKeys = dimensions ? dimensions.split(",").map((entry) => entry.trim()) : []
 if (dimensionKeys.includes(sortKey) || metrics.includes(sortKey)) return metrics
 return [sortKey, ...metrics]
}

const runAnalyticsBundle = async ({
 token,
 id,
 metrics,
 dimensions,
 sort = "-views",
 maxResults = 50,
 filters = "",
 startDate = VT_SYNC_LIFETIME_START_DATE,
 endDate = reportEndDate(),
 startIndex = 1,
 allowFallback = true,
 ids = "channel==MINE",
}: {
 token: string
 id: string
 metrics: string[]
 dimensions?: string
 sort?: string
 maxResults?: number
 filters?: string
 startDate?: string
 endDate?: string
 startIndex?: number
 allowFallback?: boolean
 ids?: string
}): Promise<BundleResult> => {
 const request = async (activeMetrics: string[]) => {
  const params = new URLSearchParams({
   ids,
   startDate,
   endDate,
   metrics: ensureSortMetricSelected(activeMetrics, sort, dimensions).join(","),
  })
  if (dimensions) params.set("dimensions", dimensions)
  if (sort) params.set("sort", sort)
  if (maxResults > 0) params.set("maxResults", String(maxResults))
  if (filters) params.set("filters", filters)
  if (startIndex > 1) params.set("startIndex", String(startIndex))
  return fetchWithBackoff(`https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`, token)
 }

 let activeMetrics = metrics
 let res = await request(activeMetrics)
 let firstError = ""
 let firstFailureCode = ""
 if (!res.ok) {
  firstFailureCode = (await readGoogleProxyError(res))?.code || ""
  firstError = await res.text().catch(() => "")
 }
 const blocksMetricFallback = firstFailureCode === "GOOGLE_SCOPE_REQUIRED"
  || firstFailureCode === "GOOGLE_QUOTA_EXHAUSTED"
  || firstFailureCode === "AUTH_REQUIRED"
  || firstFailureCode === "GOOGLE_RECONNECT_REQUIRED"
 if (!res.ok && !blocksMetricFallback && allowFallback && (res.status === 400 || res.status === 401 || res.status === 403)) {
  const coreMetrics = metrics.filter((metric) => !FALLBACK_BLOCKED_METRICS.has(metric))
  if (coreMetrics.length > 0 && coreMetrics.length !== metrics.length) {
   activeMetrics = coreMetrics
   res = await request(activeMetrics)
  }
 }
 if (!res.ok) {
  const error = firstError || await res.text().catch(() => "")
  return { rows: null, columns: [], status: res.status, error: `${id}: ${res.status} ${error}` }
 }
 const data = await res.json()
 const columns = (data.columnHeaders || []).map((header: any) => String(header.name || ""))
 const rows = (data.rows || []).map((row: any[]) => {
  const out: Record<string, any> = {}
  columns.forEach((column: string, index: number) => {
   out[column] = row[index]
  })
  return out
 })
 return { rows, columns }
}

// Pages through runAnalyticsBundle in fixed-size chunks via start-index, stopping once a page
// comes back short (no more rows). Used for reports like
// insightTrafficSourceDetail whose maxResults is capped well below what a single call can return.
const runPaginatedAnalyticsBundle = async (
 options: Parameters<typeof runAnalyticsBundle>[0] & { pageSize: number; maxPages?: number },
): Promise<BundleResult> => {
 const { pageSize, maxPages, ...base } = options
 const rows: Record<string, any>[] = []
 let columns: string[] = []
 let firstFailure: BundleResult | undefined
 const pageDiagnostics: NonNullable<BundleResult["pageDiagnostics"]> = []
 const seenPageSignatures = new Set<string>()
 for (let page = 0; maxPages === undefined || page < maxPages; page += 1) {
  const startIndex = page * pageSize + 1
  const result = await runAnalyticsBundle({ ...base, maxResults: pageSize, startIndex })
  if (!result.rows) {
   pageDiagnostics.push({
    page: page + 1,
    startIndex,
    maxResults: pageSize,
    rows: 0,
    status: "failed",
    httpStatus: result.status,
    error: result.error,
   })
   if (page === 0) firstFailure = result
   else {
    return {
     rows,
     columns,
     status: result.status,
     error: `${base.id}: partial pagination stopped at startIndex ${startIndex}; ${result.error || "YouTube Analytics returned no page."}`,
     pageDiagnostics,
    }
   }
   break
  }
  columns = result.columns
  const pageSignature = JSON.stringify(result.rows)
  if (seenPageSignatures.has(pageSignature)) {
   pageDiagnostics.push({ page: page + 1, startIndex, maxResults: pageSize, rows: result.rows.length, status: "failed", error: "Repeated Analytics page detected." })
   return { rows, columns, error: `${base.id}: partial pagination stopped after a repeated page.`, pageDiagnostics }
  }
  seenPageSignatures.add(pageSignature)
  rows.push(...result.rows)
  pageDiagnostics.push({
   page: page + 1,
   startIndex,
   maxResults: pageSize,
   rows: result.rows.length,
   status: result.rows.length < pageSize ? "short" : "complete",
  })
  if (result.rows.length < pageSize) break
  if (maxPages === undefined || page < maxPages - 1) await sleep(150)
 }
 if (!rows.length && firstFailure) return { ...firstFailure, pageDiagnostics }
 return { rows, columns, pageDiagnostics }
}

const buildEvenDateWindows = (startDate: string, endDate: string, maxWindows: number) => {
 const totalDays = daysBetweenInclusive(startDate, endDate)
 const windowCount = Math.min(Math.max(1, maxWindows), totalDays)
 const windowSize = Math.ceil(totalDays / windowCount)
 const windows: Array<{ startDate: string; endDate: string }> = []
 for (let index = 0; index < windowCount; index += 1) {
  const windowStart = addDaysToDateKey(startDate, index * windowSize)
  if (parseDateKey(windowStart).getTime() > parseDateKey(endDate).getTime()) break
  const windowEnd = parseDateKey(addDaysToDateKey(windowStart, windowSize - 1)).getTime() > parseDateKey(endDate).getTime()
   ? endDate
   : addDaysToDateKey(windowStart, windowSize - 1)
  windows.push({ startDate: windowStart, endDate: windowEnd })
 }
 return windows
}

export const buildVtSyncAnalyticsDateWindows = (
 startDate: string,
 endDate: string,
 windowDays = VT_SYNC_ANALYTICS_DATE_WINDOW_DAYS,
) => {
 const windows: Array<{ startDate: string; endDate: string }> = []
 if (parseDateKey(startDate).getTime() > parseDateKey(endDate).getTime()) return windows
 for (let windowStart = startDate; parseDateKey(windowStart).getTime() <= parseDateKey(endDate).getTime();) {
  const candidateEnd = addDaysToDateKey(windowStart, Math.max(1, windowDays) - 1)
  const windowEnd = parseDateKey(candidateEnd).getTime() > parseDateKey(endDate).getTime() ? endDate : candidateEnd
  windows.push({ startDate: windowStart, endDate: windowEnd })
  windowStart = addDaysToDateKey(windowEnd, 1)
 }
 return windows
}

const mergeRowsByKey = (
 primaryRows: Record<string, any>[],
 supplementalRows: Record<string, any>[],
 keyOf: (row: Record<string, any>) => string,
) => {
 const merged = new Map(primaryRows.map((row) => [keyOf(row), { ...row }]))
 supplementalRows.forEach((row) => {
  const key = keyOf(row)
  if (!key) return
  merged.set(key, mergeVtSyncDefinedFields(merged.get(key), row))
 })
 return [...merged.values()]
}

export const mergeVtSyncDefinedFields = (
 existing: Record<string, any> | undefined,
 incoming: Record<string, any> | undefined,
) => {
 const merged = { ...(existing || {}) }
 Object.entries(incoming || {}).forEach(([key, value]) => {
  if (value !== undefined && value !== null) merged[key] = value
 })
 return merged
}

export const mergeVtSyncRowsPreservingDefined = (
 existingRows: Record<string, any>[],
 incomingRows: Record<string, any>[],
 keyOf: (row: Record<string, any>) => string,
) => {
 const merged = new Map(existingRows.map((row) => [keyOf(row), { ...row }]))
 incomingRows.forEach((row) => {
  const key = keyOf(row)
  if (!key) return
  merged.set(key, mergeVtSyncDefinedFields(merged.get(key), row))
 })
 return [...merged.values()]
}

const mergeVtSyncRowsPreservingExactIncomingFields = (
 existingRows: Record<string, unknown>[],
 incomingRows: Record<string, unknown>[],
 keyOf: (row: Record<string, unknown>) => string,
) => {
 const merged = new Map(existingRows.map((row) => [keyOf(row), { ...row }]))
 incomingRows.forEach((row) => {
  const key = keyOf(row)
  if (!key) return
  // Unlike the general supplemental merge, a retention response owns every
  // field it actually returned, including null and zero. Omitted fields remain
  // cached but are hidden by retentionMetricAvailability in the table view.
  merged.set(key, { ...(merged.get(key) || {}), ...row })
 })
 return [...merged.values()]
}

/**
 * Segment queries can have more than one dimension. Preserve the complete
 * dimension tuple so male 18-24 and male 25-34 never replace each other.
 */
export const vtSyncSegmentRowKey = (row: Record<string, any>) => [
 row.country,
 row.countryCode,
 row.city,
 row.province,
 row.dma,
 row.ageGroup,
 row.gender,
 row.creatorContentType,
 row.audienceType,
 row.deviceType,
 row.operatingSystem,
 row.insightPlaybackLocationType,
 row.subscribedStatus,
 row.term,
].filter((value) => value !== undefined && value !== null && value !== "").map(String).join("|")

const metricRowKey = (row: Record<string, any>, dimensions?: string) => {
 if (!dimensions) return "__total__"
 return dimensions.split(",").map((dimension) => String(row[dimension] ?? "")).join("|")
}

const runAnalyticsBundleWithMetricSplit = async (
 options: Parameters<typeof runAnalyticsBundle>[0],
): Promise<BundleResult> => {
 const combined = await runAnalyticsBundle({ ...options, allowFallback: false })
 if (combined.rows || options.metrics.length <= 1) return combined
 const results: BundleResult[] = []
 for (let index = 0; index < options.metrics.length; index += 1) {
  const metric = options.metrics[index]
  results.push(await runAnalyticsBundle({
   ...options,
   id: `${options.id}_${metric}`,
   metrics: [metric],
   allowFallback: false,
  }))
  if (index < options.metrics.length - 1) await sleep(75)
 }
 const successful = results.filter((result) => result.rows)
 const rows = successful.reduce(
  (merged, result) => mergeRowsByKey(
   merged,
   result.rows || [],
   (row) => metricRowKey(row, options.dimensions),
  ),
  [] as Record<string, any>[],
 )
 const errors = results.filter((result) => !result.rows).map((result) => result.error).filter(Boolean)
 return {
  rows: rows.length || successful.length ? rows : null,
  columns: [...new Set(successful.flatMap((result) => result.columns))],
  error: errors.length ? `${options.id}: ${errors.length} metric request(s) unavailable. ${errors.join(" | ")}` : undefined,
  status: results.find((result) => !result.rows)?.status || combined.status,
 }
}

type RetentionFallbackRequest = {
 id: string
 requestedMetrics: string[]
 returnedHeaders: string[]
 rows: number
 status?: number
 error?: string
}

type RetentionBundleResult = BundleResult & {
 requestedMetrics: string[]
 returnedHeaders: string[]
 fallbackRequests: RetentionFallbackRequest[]
}

/**
 * Fetch the canonical five-column retention report first. YouTube documents the
 * curve and granular metrics as one compatible report, but some channels return
 * only one metric family. In that case request only the missing family and
 * merge the exact response fields by elapsed point.
 */
const runRetentionAnalyticsBundle = async (
 options: Omit<Parameters<typeof runAnalyticsBundle>[0], "metrics" | "allowFallback">,
): Promise<RetentionBundleResult> => {
 const requestedMetrics = [...VT_SYNC_RETENTION_METRICS]
 const combined = await runAnalyticsBundle({
  ...options,
  metrics: requestedMetrics,
  allowFallback: false,
 })
 const returnedHeaders = new Set(combined.columns)
 const fallbackRequests: RetentionFallbackRequest[] = []
 let rows = combined.rows ? combined.rows.map((row) => ({ ...row })) : []
 const errors: string[] = combined.rows ? [] : [combined.error || `${options.id}: combined retention report failed`]
 let failureStatus = combined.rows ? undefined : combined.status

 const mergeExactRows = (incoming: Record<string, unknown>[]) => {
  const byPoint = new Map(rows.map((row) => [String(row.elapsedVideoTimeRatio ?? ""), row]))
  incoming.forEach((row) => {
   const key = String(row.elapsedVideoTimeRatio ?? "")
   if (!key) return
   byPoint.set(key, { ...(byPoint.get(key) || {}), ...row })
  })
  rows = [...byPoint.values()]
 }

 for (const [familyId, familyMetrics] of [
  ["curve", VT_SYNC_RETENTION_CURVE_METRICS],
  ["granular", VT_SYNC_RETENTION_GRANULAR_METRICS],
 ] as const) {
  const missingMetrics = familyMetrics.filter((metric) => !returnedHeaders.has(metric))
  if (!missingMetrics.length) continue
  const fallback = await runAnalyticsBundle({
   ...options,
   id: `${options.id}_${familyId}`,
   metrics: [...missingMetrics],
   allowFallback: false,
  })
  fallback.columns.forEach((column) => returnedHeaders.add(column))
  if (fallback.rows) mergeExactRows(fallback.rows)
  else {
   errors.push(fallback.error || `${options.id}: ${familyId} retention report failed`)
   failureStatus ||= fallback.status
  }
  fallbackRequests.push({
   id: familyId,
   requestedMetrics: [...missingMetrics],
   returnedHeaders: fallback.columns,
   rows: fallback.rows?.length || 0,
   status: fallback.status,
   error: fallback.error,
  })
 }

 const hasSuccessfulResponse = Boolean(combined.rows) || fallbackRequests.some((request) => !request.error)
 return {
  rows: hasSuccessfulResponse ? rows : null,
  columns: [...returnedHeaders],
  returnedHeaders: [...returnedHeaders],
  requestedMetrics,
  fallbackRequests,
  status: failureStatus,
  error: errors.length ? errors.join(" | ") : undefined,
 }
}

const runLifetimeDateWindowBundle = async (
 options: Parameters<typeof runAnalyticsBundle>[0] & { splitOnFailure?: boolean },
): Promise<BundleResult> => {
 const { splitOnFailure = false, ...bundleOptions } = options
 const windows = buildVtSyncAnalyticsDateWindows(
  bundleOptions.startDate || VT_SYNC_LIFETIME_START_DATE,
  bundleOptions.endDate || reportEndDate(),
 )
 const rows: Record<string, any>[] = []
 const columns = new Set<string>()
 const pageDiagnostics: NonNullable<BundleResult["pageDiagnostics"]> = []
 const errors: string[] = []
 for (let index = 0; index < windows.length; index += 1) {
  const window = windows[index]
  const requestOptions = {
   ...bundleOptions,
   id: `${bundleOptions.id}_${window.startDate}_${window.endDate}`,
   startDate: window.startDate,
   endDate: window.endDate,
   maxResults: VT_SYNC_ANALYTICS_DATE_WINDOW_DAYS,
   startIndex: 1,
  }
  const result = splitOnFailure
   ? await runAnalyticsBundleWithMetricSplit(requestOptions)
   : await runAnalyticsBundle(requestOptions)
  result.columns.forEach((column) => columns.add(column))
  if (result.rows) rows.push(...result.rows)
  if (!result.rows || result.error) errors.push(result.error || `${bundleOptions.id}: no rows returned for ${window.startDate} through ${window.endDate}`)
  pageDiagnostics.push({
   page: index + 1,
   startIndex: 1,
   maxResults: VT_SYNC_ANALYTICS_DATE_WINDOW_DAYS,
   rows: result.rows?.length || 0,
   status: !result.rows ? "failed" : result.rows.length < VT_SYNC_ANALYTICS_DATE_WINDOW_DAYS ? "short" : "complete",
   httpStatus: result.status,
   error: result.error,
   startDate: window.startDate,
   endDate: window.endDate,
  })
  if (index < windows.length - 1) await sleep(150)
 }
 const deduplicatedRows = mergeRowsByKey([], rows, (row) => String(row.day || row.date || ""))
  .sort((a, b) => String(b.day || b.date || "").localeCompare(String(a.day || a.date || "")))
 return {
  rows: deduplicatedRows.length || !errors.length ? deduplicatedRows : null,
  columns: [...columns],
  error: errors.length ? `${bundleOptions.id}: ${errors.length} of ${windows.length} lifetime window(s) were partial or failed. ${errors.join(" | ")}` : undefined,
  pageDiagnostics,
 }
}

const runLifetimeMonthWindowBundle = async (
 options: Parameters<typeof runAnalyticsBundle>[0] & { splitOnFailure?: boolean },
): Promise<BundleResult> => {
 const { splitOnFailure = false, ...bundleOptions } = options
 const dimensions = String(bundleOptions.dimensions || "month")
 const windows = buildVtSyncAnalyticsMonthWindows(
  bundleOptions.startDate || VT_SYNC_LIFETIME_START_DATE,
  bundleOptions.endDate || reportEndDate(),
 )
 const results: BundleResult[] = []
 for (let index = 0; index < windows.length; index += 1) {
  const window = windows[index]
  const request = {
   ...bundleOptions,
   id: `${bundleOptions.id}_${window.startDate}_${window.endDate}`,
   startDate: window.startDate,
   endDate: window.endDate,
   maxResults: 500,
   startIndex: 1,
  }
  results.push(splitOnFailure
   ? await runAnalyticsBundleWithMetricSplit(request)
   : await runAnalyticsBundle(request))
  if (index < windows.length - 1) await sleep(150)
 }
 const rows = results.reduce(
  (merged, result) => mergeRowsByKey(
   merged,
   result.rows || [],
   (row) => metricRowKey(row, dimensions),
  ),
  [] as Record<string, any>[],
 )
 const errors = results.map((result) => result.error).filter(Boolean)
 return {
  rows: rows.length || !errors.length ? rows : null,
  columns: [...new Set(results.flatMap((result) => result.columns))],
  error: errors.length
   ? `${bundleOptions.id}: ${errors.length} of ${windows.length} lifetime month window(s) were partial or failed. ${errors.join(" | ")}`
   : undefined,
  status: results.find((result) => !result.rows)?.status,
  pageDiagnostics: results.flatMap((result, index) => {
   const window = windows[index]
   return [{
    page: index + 1,
    startIndex: 1,
    maxResults: 500,
    rows: result.rows?.length || 0,
    status: !result.rows ? "failed" as const : result.error ? "short" as const : "complete" as const,
    httpStatus: result.status,
    error: result.error,
    startDate: window.startDate,
    endDate: window.endDate,
   }]
  }),
 }
}

export const preserveVtSyncRowsForFailedDateWindows = (
 fetchedRows: Record<string, any>[],
 previousRows: Record<string, any>[],
 diagnostics: BundleResult["pageDiagnostics"],
 fetchedDateKey: string,
 previousDateKey: string,
) => {
 const failedWindows = (diagnostics || []).filter((entry) =>
  (entry.status === "failed" || !!entry.error) && entry.startDate && entry.endDate,
 )
 const fetchedDates = new Set(fetchedRows.map((row) => String(row[fetchedDateKey] || row[previousDateKey] || "")))
 const preserved = previousRows.filter((row) => {
  const date = String(row[previousDateKey] || "")
  const inFailedWindow = failedWindows.some((window) => date >= String(window.startDate) && date <= String(window.endDate))
  const notFetched = !fetchedDates.has(date)
  return inFailedWindow || notFetched
 })
 return mergeRowsByKey(preserved, fetchedRows, (row) => String(row[fetchedDateKey] || row[previousDateKey] || ""))
  .sort((a, b) => String(b[fetchedDateKey] || b[previousDateKey] || "").localeCompare(String(a[fetchedDateKey] || a[previousDateKey] || "")))
}

const mergeTrafficDetailRows = (rows: Record<string, any>[], detailKey = "insightTrafficSourceDetail") => {
 const merged = new Map<string, {
  row: Record<string, any>
  averageViewDurationWeighted: number
  averageViewPercentageWeighted: number
  weight: number
 }>()
 rows.forEach((row) => {
  const key = String(row[detailKey] || row.insightTrafficSourceDetail || row.source || row.term || "").trim()
  if (!key) return
  const views = numberOrZero(row.views)
  const minutesWatched = numberOrZero(row.estimatedMinutesWatched)
  const engagedViews = numberOrZero(row.engagedViews)
  const existing = merged.get(key)
  if (existing) {
   existing.row.views = numberOrZero(existing.row.views) + views
   existing.row.estimatedMinutesWatched = numberOrZero(existing.row.estimatedMinutesWatched) + minutesWatched
   existing.row.engagedViews = numberOrZero(existing.row.engagedViews) + engagedViews
   existing.averageViewDurationWeighted += numberOrZero(row.averageViewDuration) * views
   existing.averageViewPercentageWeighted += numberOrZero(row.averageViewPercentage) * views
   existing.weight += views
  } else {
   merged.set(key, {
    row: { ...row, [detailKey]: key, insightTrafficSourceDetail: key },
    averageViewDurationWeighted: numberOrZero(row.averageViewDuration) * views,
    averageViewPercentageWeighted: numberOrZero(row.averageViewPercentage) * views,
    weight: views,
   })
  }
 })
 return [...merged.values()]
  .map((entry): Record<string, any> => ({
   ...entry.row,
   averageViewDuration: entry.weight > 0 ? entry.averageViewDurationWeighted / entry.weight : numberOrZero(entry.row.averageViewDuration),
   averageViewPercentage: entry.weight > 0 ? entry.averageViewPercentageWeighted / entry.weight : numberOrZero(entry.row.averageViewPercentage),
  }))
  .sort((a, b) => numberOrZero(b.views) - numberOrZero(a.views))
}

const runWindowedTrafficDetailFallback = async (
 options: Parameters<typeof runAnalyticsBundle>[0] & { pageSize: number; maxWindows: number; reason: string },
): Promise<BundleResult> => {
 const { pageSize, maxWindows, reason, ...base } = options
 const windows = buildEvenDateWindows(base.startDate || VT_SYNC_LIFETIME_START_DATE, base.endDate || reportEndDate(), maxWindows)
 const rows: Record<string, any>[] = []
 let columns: string[] = []
 const errors: string[] = []
 const pageDiagnostics: NonNullable<BundleResult["pageDiagnostics"]> = []
 for (let index = 0; index < windows.length; index += 1) {
  const window = windows[index]
  const result = await runPaginatedAnalyticsBundle({
   ...base,
   startDate: window.startDate,
   endDate: window.endDate,
   pageSize,
  })
  pageDiagnostics.push(...(result.pageDiagnostics || []).map((entry) => ({
   ...entry,
   startDate: window.startDate,
   endDate: window.endDate,
  })))
  if (result.rows) {
   columns = result.columns
   rows.push(...result.rows)
  }
  if (result.error) errors.push(`${window.startDate}..${window.endDate}: ${result.error}`)
  if (!result.rows && !(result.pageDiagnostics || []).length) {
   pageDiagnostics.push({
    page: index + 1,
    startIndex: 1,
    maxResults: pageSize,
    rows: 0,
    status: "failed",
    httpStatus: result.status,
    error: result.error,
    startDate: window.startDate,
    endDate: window.endDate,
   })
  }
  if (index < windows.length - 1) await sleep(150)
 }
 const mergedRows = mergeTrafficDetailRows(rows)
  return {
  rows: mergedRows,
  columns,
  error: errors.length ? `Traffic-detail fallback was partial. ${errors.join(" ")}` : undefined,
  fallback: {
   strategy: "traffic_detail_date_windows",
   reason,
   rowsBefore: rows.length,
   rowsAfter: mergedRows.length,
  },
  pageDiagnostics,
 }
}

const runTrafficDetailAnalyticsBundle = async (
 options: Parameters<typeof runAnalyticsBundle>[0] & { pageSize: number; fallbackMaxWindows?: number },
): Promise<BundleResult> => {
 const paginated = await runPaginatedAnalyticsBundle(options)
 if (!paginated.error || !paginated.rows?.length) return paginated

 const fallback = await runWindowedTrafficDetailFallback({
  ...options,
  maxWindows: options.fallbackMaxWindows || VT_SYNC_TRAFFIC_DETAIL_FALLBACK_MAX_WINDOWS,
  reason: paginated.error,
 })
 if ((fallback.rows?.length || 0) > paginated.rows.length) {
  return {
   ...fallback,
   pageDiagnostics: [
    ...(paginated.pageDiagnostics || []),
    ...(fallback.pageDiagnostics || []),
   ],
  }
 }
 return paginated
}

const updatePhase = (
 progress: VtSyncLocalSyncProgress,
 phaseId: string,
 patch: Partial<VtSyncLocalSyncPhase>,
 onProgress?: (progress: VtSyncLocalSyncProgress) => void,
) => {
 progress.phases = progress.phases.map((phase) => phase.id === phaseId ? { ...phase, ...patch } : phase)
 onProgress?.({ ...progress, phases: [...progress.phases] })
}

const addManifestResult = (
 manifest: VtSyncSyncManifest,
 id: string,
 success: boolean,
 rows: number,
 attempted: string[],
 error?: string,
 succeeded?: string[],
) => {
 const succeededMetrics = success ? (succeeded || attempted) : []
 const entry = {
  bundle_id: id,
  family: id,
  metrics_attempted: attempted,
  metrics_succeeded: succeededMetrics,
  metrics_failed: success ? attempted.filter((metric) => !succeededMetrics.includes(metric)) : attempted,
  rows_written: rows,
  success,
  error_reason: error,
 }
 if (success) manifest.bundles_completed = [...(manifest.bundles_completed || []), entry]
 else manifest.bundles_failed = [...(manifest.bundles_failed || []), entry]
}

const persistDatasetRows = async ({
 runId,
 channelId,
 datasetId,
 phase,
 rawRows,
 tableRows,
 columns,
 source = "youtube_analytics_v2",
}: {
 runId: string
 channelId?: string
 datasetId: string
 phase: string
 rawRows?: Array<Record<string, unknown>> | null
 tableRows?: Array<Record<string, unknown>> | null
 columns?: string[]
 source?: "youtube_data_v3" | "youtube_analytics_v2" | "local_import" | "derived"
}): Promise<{ ok: true } | { ok: false; error: string }> => {
 const capturedAt = new Date().toISOString()
 try {
  if (rawRows) {
   await replaceLatestVtSyncDatasetRawReport({
    runId,
    channelId,
    datasetId,
    phase,
    capturedAt,
    columns: columns || [],
    rows: rawRows,
    source,
   })
  }
  if (tableRows) {
   await replaceLatestVtSyncDatasetTableRows({
    runId,
    channelId,
    datasetId,
    phase,
    capturedAt,
    rows: tableRows,
   })
  }
  return { ok: true }
 } catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.warn(`VT-SYNC IndexedDB dataset persistence failed for ${datasetId}; snapshot remains available.`, error)
  return { ok: false, error: message }
 }
}

const getChannelMetadata = async (token: string) => {
 const res = await fetchWithBackoff("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true", token)
 if (!res.ok) throw new Error(`Channel metadata failed: ${res.status} ${await res.text().catch(() => "")}`)
 const data = await res.json()
 const channel = data.items?.[0]
 if (!channel) throw new Error("No YouTube channel returned for this account.")
 return channel
}

const getUploadsPlaylistPage = async (
 token: string,
 uploadsPlaylistId: string,
 pageToken = "",
): Promise<UploadPlaylistPage> => {
 const params = new URLSearchParams({ part: "snippet", maxResults: "50", playlistId: uploadsPlaylistId })
 if (pageToken) params.set("pageToken", pageToken)
 const res = await fetchWithBackoff(`https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`, token)
 if (!res.ok) throw new Error(`Uploads playlist failed: ${res.status} ${await res.text().catch(() => "")}`)
 const data = await res.json()
 return {
  items: (data.items || []).map((item: any) => ({
   videoId: String(item.snippet?.resourceId?.videoId || ""),
   title: item.snippet?.title || "",
   publishedAt: item.snippet?.publishedAt || "",
   thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || "",
  })).filter((item: UploadPlaylistItem) => item.videoId),
  nextPageToken: data.nextPageToken || "",
 }
}

const getUploadsVideoIds = async (token: string, uploadsPlaylistId: string): Promise<string[]> => {
 const ids: string[] = []
 let pageToken = ""
 do {
  const page = await getUploadsPlaylistPage(token, uploadsPlaylistId, pageToken)
  page.items.forEach((item) => ids.push(item.videoId))
  pageToken = page.nextPageToken
 } while (pageToken)
 return Array.from(new Set(ids))
}

export const syncUploadsInventory = async ({
 token,
 channelId,
 uploadsPlaylistId,
 runId,
 channelTitle,
 channelHandle,
 publicVideoCount,
 now = new Date().toISOString(),
}: {
 token: string
 channelId: string
 uploadsPlaylistId: string
 runId: string
 channelTitle?: string | null
 channelHandle?: string | null
 publicVideoCount?: number | null
 now?: string
}): Promise<VtSyncInventorySyncResult> => {
 try {
  const knownIds = await getVtSyncKnownVideoIds(channelId)
  const existing = await listVtSyncVideoInventory(channelId)
  const existingByVideoId = new Map(existing.map((record) => [record.videoId, record]))
  const isInitialInventory = knownIds.size === 0
  const seenItems = new Map<string, UploadPlaylistItem & { pageNumber: number; pageIndex: number }>()
  const newVideoIds: string[] = []
  const knownVideoIds: string[] = []
  let pageToken = ""
  let pagesRead = 0
  let consecutiveKnownPages = 0
  let knownIdsAfterNewestNew = 0
  let sawNewItem = false
  let stopReason: VtSyncInventorySyncResult["stopReason"] = "playlist_exhausted"

  do {
   const page = await getUploadsPlaylistPage(token, uploadsPlaylistId, pageToken)
   pagesRead += 1
   let pageNewCount = 0
   let pageKnownCount = 0
   page.items.forEach((item, pageIndex) => {
    if (!seenItems.has(item.videoId)) seenItems.set(item.videoId, { ...item, pageNumber: pagesRead, pageIndex })
    if (knownIds.has(item.videoId)) {
     pageKnownCount += 1
     knownVideoIds.push(item.videoId)
     if (sawNewItem) knownIdsAfterNewestNew += 1
     return
    }
    pageNewCount += 1
    sawNewItem = true
    newVideoIds.push(item.videoId)
   })
   consecutiveKnownPages = !isInitialInventory && pageKnownCount > 0 && pageNewCount === 0 ? consecutiveKnownPages + 1 : 0
   pageToken = page.nextPageToken
   if (!isInitialInventory && (consecutiveKnownPages >= 2 || knownIdsAfterNewestNew >= 10)) {
    stopReason = "known_inventory_overlap"
    break
   }
  } while (pageToken)

  if (isInitialInventory) stopReason = "initial_full_inventory"
  const records: VtSyncVideoInventoryRecord[] = Array.from(seenItems.values()).map((item) => {
   const previous = existingByVideoId.get(item.videoId)
   return {
    id: buildVtSyncInventoryId(channelId, item.videoId),
    channelId,
    videoId: item.videoId,
    uploadsPlaylistId,
    firstSeenAt: previous?.firstSeenAt || now,
    lastSeenAt: now,
    firstInventoryRunId: previous?.firstInventoryRunId || runId,
    lastInventoryRunId: runId,
    pageNumber: item.pageNumber,
    pageIndex: item.pageIndex,
    publishedAt: item.publishedAt || previous?.publishedAt,
    title: item.title || previous?.title,
    thumbnail: item.thumbnail || previous?.thumbnail,
    status: previous?.status || "metadata_pending",
   }
  })
  await putVtSyncVideoInventoryRecords(records)
  const fullInventory = await listVtSyncVideoInventory(channelId)
  const fullVideoIds = fullInventory.map((record) => record.videoId)
  const needsFullInventoryReconcile =
   typeof publicVideoCount === "number" && publicVideoCount > 0 && fullVideoIds.length < publicVideoCount && stopReason !== "initial_full_inventory"
  const previousChannel = await getVtSyncChannelIndex(channelId)
  await putVtSyncChannelIndex({
   id: channelId,
   channelId,
   uploadsPlaylistId,
   title: channelTitle || previousChannel?.title || null,
   handle: channelHandle || previousChannel?.handle || null,
   publicVideoCount: publicVideoCount ?? previousChannel?.publicVideoCount ?? null,
   firstSyncedAt: previousChannel?.firstSyncedAt || now,
   lastInventorySyncedAt: now,
   knownVideoCount: fullVideoIds.length,
   needsFullInventoryReconcile,
   lastInventoryRunId: runId,
  })
  await putVtSyncInventoryCursor({
   id: channelId,
   channelId,
   uploadsPlaylistId,
   lastRunId: runId,
   lastSyncedAt: now,
   newestKnownVideoId: fullVideoIds[0],
   overlapPages: 2,
   consecutiveKnownPages,
   knownIdsAfterNewestNew,
   needsFullInventoryReconcile,
  })
  await replaceLatestVtSyncSyncRun({
   id: runId,
   channelId,
   startedAt: now,
   completedAt: new Date().toISOString(),
   phase: "uploads_inventory",
   status: needsFullInventoryReconcile ? "partial" : "complete",
   rowsRead: seenItems.size,
   rowsWritten: records.length,
   newVideoCount: Array.from(new Set(newVideoIds)).length,
   knownVideoCount: fullVideoIds.length,
   stopReason,
   diagnostics: needsFullInventoryReconcile ? [{ reason: "public_video_count_exceeds_local_inventory", publicVideoCount, knownVideoCount: fullVideoIds.length }] : [],
  })
  return {
   channelId,
   uploadsPlaylistId,
   runId,
   videoIds: Array.from(new Set(fullVideoIds)),
   newVideoIds: Array.from(new Set(newVideoIds)),
   knownVideoIds: Array.from(new Set(knownVideoIds)),
   pagesRead,
   stopReason,
   needsFullInventoryReconcile,
  }
 } catch (error) {
  console.warn("VT-SYNC IndexedDB inventory unavailable; falling back to full uploads playlist snapshot.", error)
  const videoIds = await getUploadsVideoIds(token, uploadsPlaylistId)
  return {
   channelId,
   uploadsPlaylistId,
   runId,
   videoIds,
   newVideoIds: videoIds,
   knownVideoIds: [],
   pagesRead: Math.ceil(videoIds.length / 50),
   stopReason: "indexeddb_unavailable",
  }
 }
}

const getPlaylistMetadata = async (token: string): Promise<PlaylistMetadata[]> => {
 const playlists: PlaylistMetadata[] = []
 let pageToken = ""
 do {
  const params = new URLSearchParams({ part: "snippet,contentDetails,status", mine: "true", maxResults: "50" })
  if (pageToken) params.set("pageToken", pageToken)
  const res = await fetchWithBackoff(`https://www.googleapis.com/youtube/v3/playlists?${params.toString()}`, token)
  if (!res.ok) break
  const data = await res.json()
  ;(data.items || []).forEach((item: any) => {
   playlists.push({
    id: String(item.id || ""),
    title: item.snippet?.title || item.snippet?.localized?.title || item.id || "Untitled playlist",
    description: item.snippet?.description || "No description provided.",
    publishedAt: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt).toLocaleDateString() : "-",
    videoCount: numberOrZero(item.contentDetails?.itemCount),
    privacyStatus: item.status?.privacyStatus || "public",
    thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
   })
  })
  pageToken = data.nextPageToken || ""
 } while (pageToken)
 return playlists.filter((playlist) => playlist.id)
}

const enrichTrafficDetailRows = async (
 token: string,
 rows: Record<string, any>[],
 type?: TrafficEnrichmentType,
 idField = "term",
): Promise<Record<string, any>[]> => {
 if (!type || rows.length === 0) return rows
 const ids = Array.from(new Set(rows.map((row) => String(row[idField] || "")).filter((id) => id && id !== "Unknown" && id !== "-")))
 if (ids.length === 0) return rows
 const endpoint = type === "video" ? "videos" : type === "channel" ? "channels" : "playlists"
 const titleById: Record<string, string> = {}
 const handleById: Record<string, string> = {}
 const thumbnailById: Record<string, string> = {}
 const sourceChannelIdByVideoId: Record<string, string> = {}
 const sourceChannelTitleByVideoId: Record<string, string> = {}
 const sourceChannelHandleById: Record<string, string> = {}
 for (let index = 0; index < ids.length; index += 50) {
  const chunk = ids.slice(index, index + 50)
  const params = new URLSearchParams({ part: "snippet", id: chunk.join(",") })
  const res = await fetchWithBackoff(`https://www.googleapis.com/youtube/v3/${endpoint}?${params.toString()}`, token)
  if (res.ok) {
   const data = await res.json()
   ;(data.items || []).forEach((item: any) => {
    titleById[item.id] = item.snippet?.title || item.snippet?.localized?.title || ""
    if (type === "channel") handleById[item.id] = item.snippet?.customUrl || ""
    if (type === "video" || type === "channel") {
     const thumbnails = item.snippet?.thumbnails || {}
     thumbnailById[item.id] = thumbnails.maxres?.url || thumbnails.standard?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || ""
    }
    if (type === "video") {
     sourceChannelIdByVideoId[item.id] = item.snippet?.channelId || ""
     sourceChannelTitleByVideoId[item.id] = item.snippet?.channelTitle || ""
    }
   })
  }
  if (index + 50 < ids.length) await sleep(150)
 }
 if (type === "video") {
  const sourceChannelIds = Array.from(new Set(Object.values(sourceChannelIdByVideoId).filter(Boolean)))
  for (let index = 0; index < sourceChannelIds.length; index += 50) {
   const chunk = sourceChannelIds.slice(index, index + 50)
   const params = new URLSearchParams({ part: "snippet", id: chunk.join(",") })
   const res = await fetchWithBackoff(`https://www.googleapis.com/youtube/v3/channels?${params.toString()}`, token)
   if (res.ok) {
    const data = await res.json()
    ;(data.items || []).forEach((item: any) => {
     sourceChannelHandleById[item.id] = item.snippet?.customUrl || ""
    })
   }
   if (index + 50 < sourceChannelIds.length) await sleep(150)
  }
 }
 return rows.map((row) => {
  const id = String(row[idField] || "")
  const hasMeaningfulId = Boolean(id && id !== "Unknown" && id !== "-")
  return {
   ...row,
   title: titleById[id] || row.title,
   handle: handleById[id] || row.handle,
   thumbnail: thumbnailById[id] || row.thumbnail,
   sourceChannelTitle: type === "video" ? sourceChannelTitleByVideoId[id] || row.sourceChannelTitle : row.sourceChannelTitle,
   sourceChannelHandle: type === "video"
    ? sourceChannelHandleById[sourceChannelIdByVideoId[id]] || row.sourceChannelHandle
    : row.sourceChannelHandle,
   videoId: type === "video" && hasMeaningfulId ? id : row.videoId,
   videoUrl: type === "video" && hasMeaningfulId ? `https://www.youtube.com/watch?v=${id}` : row.videoUrl,
   channelUrl: type === "channel" && hasMeaningfulId
    ? (handleById[id] ? `https://www.youtube.com/${handleById[id].startsWith("@") ? handleById[id] : `@${handleById[id]}`}` : `https://www.youtube.com/channel/${id}`)
    : row.channelUrl,
  }
 })
}

const getShortsIds = async (token: string, channelId: string): Promise<Set<string>> => {
 const shortsPlaylistId = channelId.startsWith("UC") ? `UUSH${channelId.slice(2)}` : ""
 const ids = new Set<string>()
 if (!shortsPlaylistId) return ids
 let pageToken = ""
 try {
  do {
   const params = new URLSearchParams({ part: "snippet", maxResults: "50", playlistId: shortsPlaylistId })
   if (pageToken) params.set("pageToken", pageToken)
   const res = await fetchWithBackoff(`https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`, token)
   if (!res.ok) break
   const data = await res.json()
   ;(data.items || []).forEach((item: any) => {
    const videoId = item.snippet?.resourceId?.videoId
    if (videoId) ids.add(videoId)
   })
   pageToken = data.nextPageToken || ""
  } while (pageToken)
 } catch {
  return ids
 }
 return ids
}

const getVideoMetadata = async (token: string, videoIds: string[], shortsIds: Set<string>): Promise<VtSyncVideoItem[]> => {
 const videos: VtSyncVideoItem[] = []
 for (let index = 0; index < videoIds.length; index += 50) {
  const chunk = videoIds.slice(index, index + 50)
  const params = new URLSearchParams({ part: "snippet,contentDetails,statistics,status,topicDetails", id: chunk.join(",") })
  const res = await fetchWithBackoff(`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`, token)
  if (!res.ok) throw new Error(`Video metadata failed: ${res.status} ${await res.text().catch(() => "")}`)
  const data = await res.json()
  ;(data.items || []).forEach((item: any) => {
   const durationSeconds = parseDurationSeconds(item.contentDetails?.duration)
   const title = item.snippet?.title || ""
   const titleLower = title.toLowerCase()
   const isLive = item.snippet?.liveBroadcastContent === "live" || item.snippet?.liveBroadcastContent === "upcoming" || titleLower.includes("live stream") || titleLower.includes("is live") || titleLower.includes("live highlight")
   const isShort = !isLive && durationSeconds <= 180 && (shortsIds.has(item.id) || titleLower.includes("#short"))
   const privacyStatus = item.status?.privacyStatus || "public"
   videos.push({
    id: item.id,
    title,
    thumbnail: item.snippet?.thumbnails?.maxres?.url || item.snippet?.thumbnails?.standard?.url || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
    publishedAt: item.snippet?.publishedAt || "",
    format: resolveVtSyncVideoFormat({ privacyStatus, isLive, isShort, durationSeconds, title }),
    category: YOUTUBE_CATEGORY_NAMES[item.snippet?.categoryId] || item.snippet?.categoryId || "Unknown",
    tags: item.snippet?.tags || [],
    topics: (item.topicDetails?.topicCategories || []).map((url: string) => url.split("/").pop()?.replace(/_/g, " ") || url),
    privacyStatus,
    duration: item.contentDetails?.duration || "",
    definition: item.contentDetails?.definition || "",
    caption: item.contentDetails?.caption === "true" ? "Yes" : "No",
    descriptionSnippet: String(item.snippet?.description || "").split(/[.!?]/).filter(Boolean).slice(0, 3).join(". ").slice(0, 220),
    metrics: {
     views: numberOrUndefined(item.statistics?.viewCount),
     likes: numberOrUndefined(item.statistics?.likeCount),
     comments: numberOrUndefined(item.statistics?.commentCount),
    },
    metricProvenance: Object.fromEntries([
     ["views", item.statistics?.viewCount],
     ["likes", item.statistics?.likeCount],
     ["comments", item.statistics?.commentCount],
    ].filter(([, value]) => numberOrUndefined(value) !== undefined).map(([key]) => [key, "youtube_data_v3"])),
   })
  })
  if (index + 50 < videoIds.length) await sleep(250)
 }
 return videos
}

const createPlaceholderVideos = (videoIds: string[], runId: string): VtSyncVideoItem[] =>
 Array.from(new Set(videoIds.filter(Boolean))).map((id) => ({
  id,
  title: "Metadata pending",
  thumbnail: "",
  publishedAt: "",
  format: "unknown",
  category: "Metadata pending",
  tags: [],
  topics: [],
  privacyStatus: "Metadata pending",
  duration: "",
  definition: "",
  caption: "",
  descriptionSnippet: `Upload playlist ID captured for ${id}. Video metadata has not been synced yet.`,
  metrics: {},
  vtSyncPlaceholder: true,
  vtSyncPlaceholderReason: "uploads_playlist_only",
  vtSyncRunId: runId,
 } as VtSyncVideoItem))

const mergeVideoMetadataById = (existingVideos: VtSyncVideoItem[], metadataVideos: VtSyncVideoItem[]): VtSyncVideoItem[] => {
 const mergeMeaningfulMetadata = (existing: VtSyncVideoItem, incoming: VtSyncVideoItem): VtSyncVideoItem => {
  const merged: Record<string, unknown> = { ...existing }
  Object.entries(incoming).forEach(([key, value]) => {
   // Data API omissions and empty-string fallbacks must never make an already
   // rendered catalog row lose its title, thumbnail, or metadata during sync.
   if (value === undefined || value === null || (typeof value === "string" && !value.trim())) return
   merged[key] = value
  })
  return {
   ...merged,
   metrics: mergeVtSyncDefinedFields(existing.metrics || {}, incoming.metrics || {}),
   metricProvenance: {
    ...(existing.metricProvenance || {}),
    ...(incoming.metricProvenance || {}),
   },
  } as VtSyncVideoItem
 }
 const metadataById = new Map(metadataVideos.map((video) => [video.id, video]))
 const existingIds = new Set(existingVideos.map((video) => video.id))
 const merged = existingVideos.map((video) => {
  const metadata = metadataById.get(video.id)
  if (!metadata) return video
  return mergeMeaningfulMetadata(video, metadata)
 })
 metadataVideos.forEach((video) => {
  if (!existingIds.has(video.id)) merged.push(video)
 })
 return merged
}

type VideoMetricAssignment = {
 source: string | readonly string[]
 target: string
 transform?: (value: number) => number
}

const FULL_VIDEO_METRIC_ASSIGNMENTS: readonly VideoMetricAssignment[] = [
 { source: "views", target: "views" },
 { source: "estimatedMinutesWatched", target: "watchTime", transform: (value) => value / 60 },
 { source: "estimatedRevenue", target: "revenue" },
 { source: "averageViewDuration", target: "avgViewDuration" },
 { source: "averageViewPercentage", target: "averagePercentageViewed" },
 { source: "shares", target: "shares" },
 { source: "subscribersGained", target: "subscribersGained" },
 { source: "subscribersLost", target: "subscribersLost" },
 { source: "likes", target: "likes" },
 { source: "dislikes", target: "dislikes" },
 { source: "comments", target: "comments" },
 { source: "adImpressions", target: "adImpressions" },
 { source: ["impressions", "adImpressions"], target: "impressions" },
 { source: "estimatedAdRevenue", target: "estimatedAdRevenue" },
 { source: "estimatedRedPartnerRevenue", target: "youtubePremiumRevenue" },
 { source: "redViews", target: "youtubePremiumViews" },
 { source: "estimatedRedMinutesWatched", target: "youtubePremiumWatchTime", transform: (value) => value / 60 },
 { source: "grossRevenue", target: "grossRevenue" },
 { source: "monetizedPlaybacks", target: "monetizedPlaybacks" },
 { source: "playbackBasedCpm", target: "playbackBasedCpm" },
 { source: "annotationImpressions", target: "endScreenElementsShown" },
 { source: "annotationClicks", target: "endScreenElementClicks" },
 { source: "annotationClickThroughRate", target: "clicksPerEndScreenElementShown" },
 { source: "cardClicks", target: "cardClicks" },
 { source: "cardImpressions", target: "cardImpressions" },
 { source: "cardClickRate", target: "cardClickRate" },
 { source: "cardTeaserClicks", target: "cardTeaserClicks" },
 { source: "cardTeaserImpressions", target: "cardTeaserImpressions" },
 { source: "cardTeaserClickRate", target: "cardTeaserClickRate" },
 { source: "cardImpressions", target: "cardsShown" },
 { source: "cardClickRate", target: "clicksPerCardShown" },
 { source: "cardTeaserImpressions", target: "cardTeasersShown" },
 { source: "cardTeaserClickRate", target: "teaserClicksPerCardTeaserShown" },
 { source: "videosAddedToPlaylists", target: "videosAddedToPlaylists" },
 { source: "videosRemovedFromPlaylists", target: "videosRemovedFromPlaylists" },
 { source: "cpm", target: "cpm" },
 { source: "engagedViews", target: "engagedViews" },
] as const

const LONG_FORMAT_CARD_METRIC_ASSIGNMENTS = FULL_VIDEO_METRIC_ASSIGNMENTS.filter((assignment) =>
 [
  "cardClicks",
  "cardImpressions",
  "cardClickRate",
  "cardTeaserClicks",
  "cardTeaserImpressions",
  "cardTeaserClickRate",
 ].includes(Array.isArray(assignment.source) ? assignment.source[0] : assignment.source),
)

const readIncomingMetric = (
 row: Record<string, any>,
 source: string | readonly string[],
): number | undefined => {
 const candidates = typeof source === "string" ? [source] : source
 for (const key of candidates) {
  if (!Object.prototype.hasOwnProperty.call(row, key)) continue
  const value = numberOrUndefined(row[key])
  if (value !== undefined) return value
 }
 return undefined
}

const mergeMetricAssignments = (
 previous: VtSyncVideoItem["metrics"],
 row: Record<string, any>,
 assignments: readonly VideoMetricAssignment[],
): NonNullable<VtSyncVideoItem["metrics"]> => {
 const next = { ...(previous || {}) }
 assignments.forEach((assignment) => {
  const value = readIncomingMetric(row, assignment.source)
  if (value === undefined) return
  next[assignment.target] = assignment.transform ? assignment.transform(value) : value
 })

 if (
  Object.prototype.hasOwnProperty.call(row, "views") &&
  Object.prototype.hasOwnProperty.call(row, "estimatedRevenue")
 ) {
  const views = numberOrUndefined(row.views)
  const revenue = numberOrUndefined(row.estimatedRevenue)
  if (views !== undefined && revenue !== undefined) next.rpm = views > 0 ? (revenue / views) * 1000 : 0
 }

 return next
}

export const mergeVideoAnalyticsRows = (
 videos: VtSyncVideoItem[],
 analyticsRows: Record<string, any>[],
 family: "full" | "long_format_cards" = "full",
): VtSyncVideoItem[] => {
 const byId = new Map(analyticsRows.map((row) => [String(row.video || row.videoId || ""), row]))
 return videos.map((video) => {
  const stats = byId.get(video.id)
 if (!stats) return video
  const assignments = family === "long_format_cards"
   ? LONG_FORMAT_CARD_METRIC_ASSIGNMENTS
   : FULL_VIDEO_METRIC_ASSIGNMENTS
  const analyticsProvenance: Record<string, "youtube_analytics_v2" | "youtube_data_v3"> = Object.fromEntries(assignments.flatMap((assignment) => {
   const value = readIncomingMetric(stats, assignment.source)
   return value === undefined ? [] : [[assignment.target, "youtube_analytics_v2"]]
  }))
  return {
   ...video,
   metrics: mergeMetricAssignments(
    video.metrics,
    stats,
    assignments,
   ),
   metricProvenance: { ...(video.metricProvenance || {}), ...analyticsProvenance },
  }
 })
}

const mergeVideoAnalytics = (videos: VtSyncVideoItem[], analyticsRows: Record<string, any>[]) =>
 mergeVideoAnalyticsRows(videos, analyticsRows, "full")

const mergeLongFormatCardMetrics = (videos: VtSyncVideoItem[], analyticsRows: Record<string, any>[]) =>
 mergeVideoAnalyticsRows(videos, analyticsRows, "long_format_cards")

const mapTraffic = (rows: Record<string, any>[] | null, detailKey = "source") => (rows || []).map((row) => ({
 source: row.insightTrafficSourceType || row[detailKey] || row.insightTrafficSourceDetail || row.source || row.term || "Unknown",
 term: row.insightTrafficSourceDetail || row.term || row.insightTrafficSourceType || row.source || "Unknown",
 views: numberOrZero(row.views),
 watchTime: numberOrZero(row.estimatedMinutesWatched) / 60,
 avgDuration: numberOrZero(row.averageViewDuration),
 avgPercentageViewed: numberOrZero(row.averageViewPercentage),
 engagedViews: numberOrZero(row.engagedViews),
}))

const mapSegmentRows = (rows: Record<string, any>[] | null, identityKey: string) => (rows || []).map((row) => ({
 ...row,
 ...mapVtSyncAnalyticsMetricFields(row),
 [identityKey]: row[identityKey],
 term: row.term || row[identityKey] || row.audienceType || row.creatorContentType || row.insightTrafficSourceType,
 formatCode: row.formatCode || row.creatorContentType,
 cohort: row.cohort || `${row.gender || ""} ${row.ageGroup || ""}`.trim() || row.ageGroup || row.gender,
 viewsPct: numberOrZero(row.viewsPct ?? row.viewerPercentage),
 watchTimePct: numberOrUndefined(row.watchTimePct),
 device: row.device || row.deviceType,
 location: row.location || row.insightPlaybackLocationType,
 status: row.status || row.subscribedStatus,
 views: numberOrUndefined(row.views),
 watchTime: numberOrUndefined(row.estimatedMinutesWatched) !== undefined ? numberOrZero(row.estimatedMinutesWatched) / 60 : undefined,
 avgDuration: numberOrUndefined(row.averageViewDuration),
 avgPercentageViewed: numberOrUndefined(row.averageViewPercentage),
 averagePercentageViewed: numberOrUndefined(row.averageViewPercentage),
 engagedViews: numberOrUndefined(row.engagedViews),
 revenue: numberOrUndefined(row.estimatedRevenue),
 estimatedAdRevenue: numberOrUndefined(row.estimatedAdRevenue),
 youtubePremiumRevenue: numberOrUndefined(row.estimatedRedPartnerRevenue),
 shares: numberOrUndefined(row.shares),
 subscribersGained: numberOrUndefined(row.subscribersGained),
 subscribersLost: numberOrUndefined(row.subscribersLost),
 likes: numberOrUndefined(row.likes),
 dislikes: numberOrUndefined(row.dislikes),
 comments: numberOrUndefined(row.comments),
 cpm: numberOrUndefined(row.cpm),
 grossRevenue: numberOrUndefined(row.grossRevenue),
 monetizedPlaybacks: numberOrUndefined(row.monetizedPlaybacks),
 playbackBasedCpm: numberOrUndefined(row.playbackBasedCpm),
 adImpressions: numberOrUndefined(row.adImpressions),
}))

const CHANNEL_TOTAL_METRICS = [...VT_SYNC_REQUIRED_ANALYTICS_METRICS] as const

const analyticsBundleDiagnostic = ({
 phase,
 categoryId,
 bundleId,
 requestedMetrics,
 result,
 context = {},
}: {
 phase: string
 categoryId: string
 bundleId: string
 requestedMetrics: readonly string[]
 result: BundleResult
 context?: Record<string, unknown>
}) => ({
 phase,
 categoryId,
 bundle: bundleId,
 requestedMetrics: [...requestedMetrics],
 returnedHeaders: result.columns,
 missingHeaders: requestedMetrics.filter((metric) => !result.columns.includes(metric)),
 rowCount: result.rows?.length || 0,
 permissionState: bundleId === "revenue" && !result.rows
  ? "permission_or_report_unavailable"
  : "available",
 mergeStatus: result.rows ? (result.error ? "partial" : "merged") : "unavailable",
 error: result.error,
 ...context,
})

const channelTotalsForWindow = async (token: string, window: VtSyncAnalyticsWindow, lifetimeStartDate: string) => {
 const startDate = window === "lifetime" ? lifetimeStartDate : daysAgo(Number(window.replace("d", "")))
 const bundles = VT_SYNC_ANALYTICS_METRIC_BUNDLES
 const results: BundleResult[] = []
 for (const bundle of bundles) {
  results.push(await runAnalyticsBundleWithMetricSplit({
   token,
   id: `channel_totals_${window}_${bundle.id}`,
   metrics: [...bundle.metrics],
   startDate,
   endDate: reportEndDate(),
   sort: "",
   maxResults: 0,
   allowFallback: false,
  }))
  if (bundle !== bundles[bundles.length - 1]) await sleep(100)
 }
 const row = Object.assign({}, ...results.map((result) => result.rows?.[0] || {}))
 const subscribersGained = numberOrUndefined(row.subscribersGained)
 const subscribersLost = numberOrUndefined(row.subscribersLost)
 const estimatedRevenue = numberOrUndefined(row.estimatedRevenue)
 const adImpressions = numberOrUndefined(row.adImpressions)
 return {
  row: {
   ...mapVtSyncAnalyticsMetricFields(row),
   subscribersGained,
   subscribersLost,
   netSubscribers: subscribersGained !== undefined && subscribersLost !== undefined ? subscribersGained - subscribersLost : undefined,
   subscribers: subscribersGained !== undefined && subscribersLost !== undefined ? subscribersGained - subscribersLost : undefined,
   revenue: estimatedRevenue,
   estimatedRevenue,
   adImpressions,
   impressions: adImpressions,
  },
  columns: [...new Set(results.flatMap((result) => result.columns))],
  error: results.map((result) => result.error).filter(Boolean).join(" | ") || undefined,
  coreAvailable: !!results[0].rows,
  diagnostics: results.map((result, index) => analyticsBundleDiagnostic({
   phase: "channel_totals",
   categoryId: "channel_totals",
   bundleId: bundles[index].id,
   requestedMetrics: bundles[index].metrics,
   result,
   context: { window },
  })),
 }
}

const sumAvailableMetric = (rows: Array<Record<string, any>>, key: string): number | undefined => {
 const values = rows.map((row) => numberOrUndefined(row[key])).filter((value): value is number => value !== undefined)
 return values.length ? values.reduce((sum, value) => sum + value, 0) : undefined
}

const weightedAvailableMetric = (
 rows: Array<Record<string, any>>,
 valueKey: string,
 weightKey = "views",
): number | undefined => {
 let weighted = 0
 let totalWeight = 0
 rows.forEach((row) => {
  const value = numberOrUndefined(row[valueKey])
  const weight = numberOrUndefined(row[weightKey])
  if (value === undefined || weight === undefined || weight <= 0) return
  weighted += value * weight
  totalWeight += weight
 })
 return totalWeight > 0 ? weighted / totalWeight : undefined
}

/** Lifetime creator-content-type rows aggregated from native month reports. */
export const aggregateVtSyncCreatorContentTypeRows = (rows: Array<Record<string, any>>) => {
 const grouped = new Map<string, Array<Record<string, any>>>()
 rows.forEach((row) => {
  const key = String(row.creatorContentType || row.term || "").trim()
  if (!key) return
  grouped.set(key, [...(grouped.get(key) || []), row])
 })
 return [...grouped.entries()].map(([creatorContentType, monthlyRows]) => {
  const normalizedRows = monthlyRows.map((row) => ({ ...row, ...mapVtSyncAnalyticsMetricFields(row) }))
  const aggregated: Record<string, unknown> = { creatorContentType, term: creatorContentType }
  VT_SYNC_ANALYTICS_METRIC_DESCRIPTORS.forEach((descriptor) => {
   if (descriptor.aggregation === "sum") {
    aggregated[descriptor.normalizedField] = sumAvailableMetric(normalizedRows, descriptor.normalizedField)
   } else if (descriptor.aggregation === "weighted-rate") {
    aggregated[descriptor.normalizedField] = weightedAvailableMetric(normalizedRows, descriptor.normalizedField)
   }
  })
  const views = numberOrUndefined(aggregated.views)
  const watchHours = numberOrUndefined(aggregated.watchTime)
  if (views !== undefined && views > 0 && watchHours !== undefined) aggregated.avgViewDuration = watchHours * 3600 / views
  const cardClicks = numberOrUndefined(aggregated.cardClicks)
  const cardImpressions = numberOrUndefined(aggregated.cardImpressions)
  aggregated.cardClickRate = cardClicks !== undefined && cardImpressions !== undefined && cardImpressions > 0
   ? cardClicks / cardImpressions * 100
   : weightedAvailableMetric(normalizedRows, "cardClickRate", "cardImpressions")
  const teaserClicks = numberOrUndefined(aggregated.cardTeaserClicks)
  const teaserImpressions = numberOrUndefined(aggregated.cardTeaserImpressions)
  aggregated.cardTeaserClickRate = teaserClicks !== undefined && teaserImpressions !== undefined && teaserImpressions > 0
   ? teaserClicks / teaserImpressions * 100
   : weightedAvailableMetric(normalizedRows, "cardTeaserClickRate", "cardTeaserImpressions")
  const grossRevenue = numberOrUndefined(aggregated.grossRevenue)
  const adImpressions = numberOrUndefined(aggregated.adImpressions)
  aggregated.cpm = grossRevenue !== undefined && adImpressions !== undefined && adImpressions > 0
   ? grossRevenue / adImpressions * 1000
   : weightedAvailableMetric(normalizedRows, "cpm", "adImpressions")
  const monetizedPlaybacks = numberOrUndefined(aggregated.monetizedPlaybacks)
  aggregated.playbackBasedCpm = grossRevenue !== undefined && monetizedPlaybacks !== undefined && monetizedPlaybacks > 0
   ? grossRevenue / monetizedPlaybacks * 1000
   : weightedAvailableMetric(normalizedRows, "playbackBasedCpm", "monetizedPlaybacks")
  return aggregated
 })
}

const fillMissingChannelTotalsFromDaily = (
 totals: VtSyncSnapshot["channelTotals"],
 dailyRows: Array<Record<string, any>>,
 lifetimeStartDate: string,
) => {
 if (!totals || !dailyRows.length) return totals
 const endDate = reportEndDate()
 const windows: VtSyncAnalyticsWindow[] = ["7d", "28d", "90d", "365d", "lifetime"]
 const next = { ...(totals as Record<string, any>) }
 // The undimensioned channel-totals query does not reliably aggregate card and
 // playlist-save metrics (YouTube returns them missing or as 0), so the
 // day-dimensioned daily rows are authoritative for these — prefer the daily
 // sum unless the channel query actually produced a positive value.
 const dailyAuthoritativeKeys = new Set([
  "videosAddedToPlaylists",
  "videosRemovedFromPlaylists",
  "cardImpressions",
  "cardTeaserImpressions",
  "cardClicks",
  "cardTeaserClicks",
 ])
 windows.forEach((window) => {
  const startDate = window === "lifetime" ? lifetimeStartDate : daysAgo(Number(window.replace("d", "")))
  const rows = dailyRows.filter((row) => {
   const date = String(row.date || row.day || "")
   return date >= startDate && date <= endDate
  })
  if (!rows.length) return
  const direct = { ...(next[window] || {}) }
  const subscribersGained = sumAvailableMetric(rows, "subscribersGained")
  const subscribersLost = sumAvailableMetric(rows, "subscribersLost")
  const estimatedRevenue = sumAvailableMetric(rows, "revenue")
  const adImpressions = sumAvailableMetric(rows, "adImpressions")
  const fallback: Record<string, number | undefined> = {
   views: sumAvailableMetric(rows, "views"),
   engagedViews: sumAvailableMetric(rows, "engagedViews"),
   watchTime: sumAvailableMetric(rows, "watchTime"),
   likes: sumAvailableMetric(rows, "likes"),
   dislikes: sumAvailableMetric(rows, "dislikes"),
   comments: sumAvailableMetric(rows, "comments"),
   shares: sumAvailableMetric(rows, "shares"),
   videosAddedToPlaylists: sumAvailableMetric(rows, "videosAddedToPlaylists"),
   videosRemovedFromPlaylists: sumAvailableMetric(rows, "videosRemovedFromPlaylists"),
   cardImpressions: sumAvailableMetric(rows, "cardImpressions"),
   cardTeaserImpressions: sumAvailableMetric(rows, "cardTeaserImpressions"),
   cardClicks: sumAvailableMetric(rows, "cardClicks"),
   cardTeaserClicks: sumAvailableMetric(rows, "cardTeaserClicks"),
   subscribersGained,
   subscribersLost,
   netSubscribers: subscribersGained !== undefined && subscribersLost !== undefined ? subscribersGained - subscribersLost : undefined,
   subscribers: subscribersGained !== undefined && subscribersLost !== undefined ? subscribersGained - subscribersLost : undefined,
   revenue: estimatedRevenue,
   estimatedRevenue,
   estimatedAdRevenue: sumAvailableMetric(rows, "estimatedAdRevenue"),
   youtubePremiumRevenue: sumAvailableMetric(rows, "youtubePremiumRevenue"),
   grossRevenue: sumAvailableMetric(rows, "grossRevenue"),
   monetizedPlaybacks: sumAvailableMetric(rows, "monetizedPlaybacks"),
   adImpressions,
   impressions: adImpressions,
   youtubePremiumViews: sumAvailableMetric(rows, "youtubePremiumViews") ?? sumAvailableMetric(rows, "redViews"),
   youtubePremiumWatchTime: (() => {
    const hours = sumAvailableMetric(rows, "youtubePremiumWatchTime")
    if (hours !== undefined) return hours
    const minutes = sumAvailableMetric(rows, "estimatedRedMinutesWatched")
    return minutes === undefined ? undefined : minutes / 60
   })(),
  }
  Object.entries(fallback).forEach(([key, value]) => {
   if (value === undefined) return
   const channelNumber = numberOrUndefined(direct[key])
   const channelHasPositive = channelNumber !== undefined && channelNumber > 0
   const preferDaily = dailyAuthoritativeKeys.has(key)
    ? !channelHasPositive
    : direct[key] === undefined
   if (preferDaily) direct[key] = value
  })
  if (direct.avgViewDuration === undefined && direct.views > 0 && direct.watchTime !== undefined) {
   direct.avgViewDuration = direct.watchTime * 3600 / direct.views
  }
  if (direct.cpm === undefined && direct.grossRevenue !== undefined && direct.adImpressions > 0) {
   direct.cpm = direct.grossRevenue / direct.adImpressions * 1000
  }
  if (direct.playbackBasedCpm === undefined && direct.grossRevenue !== undefined && direct.monetizedPlaybacks > 0) {
   direct.playbackBasedCpm = direct.grossRevenue / direct.monetizedPlaybacks * 1000
  }
  if (direct.cardClicks !== undefined && direct.cardImpressions > 0) {
   direct.cardClickRate = direct.cardClicks / direct.cardImpressions * 100
  }
  if (direct.cardTeaserClicks !== undefined && direct.cardTeaserImpressions > 0) {
   direct.cardTeaserClickRate = direct.cardTeaserClicks / direct.cardTeaserImpressions * 100
  }
  if (direct.averagePercentageViewed === undefined) {
   direct.averagePercentageViewed = weightedAvailableMetric(rows, "averagePercentageViewed")
    ?? weightedAvailableMetric(rows, "averageViewPercentage")
  }
  next[window] = direct
 })
 next.last7 = next["7d"]
 next.last28 = next["28d"]
 next.last90 = next["90d"]
 next.last365 = next["365d"]
 return next as VtSyncSnapshot["channelTotals"]
}

export const runVtSyncLocalSync = async ({ token, selectedCategories, previousSnapshot, retentionVideoIds, forceFullVideoMetadata = false, contentOwnerId, onProgress, onSnapshotCommit }: VtSyncLocalSyncOptions): Promise<VtSyncSnapshot> => {
 const visibleSelectedCategories = filterVtSyncVisibleCategoryIds(selectedCategories)
 const hiddenRequestedCategories = selectedCategories.filter((categoryId) => !visibleSelectedCategories.includes(categoryId))
 const selected = new Set(visibleSelectedCategories)
 const runId = `vt-sync-local-${Date.now()}`
 const startedAt = new Date().toISOString()
 const phaseIds = [
  ["channel_metadata", "Channel Metadata"],
  ["uploads_playlist", "Uploads Playlist"],
  ["video_metadata", "Video Metadata"],
  ["videos_analytics", "Video Analytics"],
  ["channel_totals", "Channel Totals"],
  ["daily_metrics", "Daily Metrics"],
  ["monthly_metrics", "Monthly Metrics"],
  ["traffic", "Traffic Details"],
  ["segments", "Audience Segments"],
  ["device_os", "Device x OS"],
  ["traffic_day", "Traffic Source x Day"],
  ["playlists_analytics", "Playlist Analytics"],
  ["retention", "Retention"],
 ] as const
 const progress: VtSyncLocalSyncProgress = {
  runId,
  startedAt,
  status: "running",
  requestedCategoryIds: visibleSelectedCategories,
  phases: phaseIds.map(([id, label]) => ({ id, label, status: "pending", rows: 0 })),
 }
 onProgress?.(progress)

 const manifest: VtSyncSyncManifest = {
  run_id: runId,
  started_at: startedAt,
  completed_at: null,
  stop_reason: null,
  failure_code: null,
  retryable: false,
  reconnect_required: false,
  request_id: null,
  bundles_completed: [],
  bundles_failed: [],
  diagnostics: [],
 }
 if (hiddenRequestedCategories.length) {
  manifest.diagnostics = hiddenRequestedCategories.map((categoryId) => ({
   phase: "category_visibility_guard",
   categoryId,
   status: "disabled_unvalidated",
   reason: VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS.find((category) => category.id === categoryId)?.disabledReason || "Hidden from the successful-only VT Sync pass.",
  }))
 }
 let snapshot: VtSyncSnapshot = {
  ...previousSnapshot,
  videos: previousSnapshot.videos.map((video) =>
   normalizeVtSyncVideoPrivacyFormat(video as VtSyncVideoItem & Record<string, unknown>),
  ),
  source: "vt-sync",
  snapshotId: runId,
  capturedAt: startedAt,
  syncManifest: manifest,
 }
 const markFreshness = (
  tableIds: string[],
  phase: string,
  rows: number,
  status: "synced" | "partial" | "placeholder" | "stale" | "failed" = "synced",
  missingMetrics: string[] = [],
 ) => {
  const updatedAt = new Date().toISOString()
  snapshot = {
   ...snapshot,
   datasetFreshness: {
    ...(snapshot.datasetFreshness || {}),
    ...Object.fromEntries(tableIds.map((tableId) => [tableId, {
     runId,
     phase,
     source: status === "placeholder" ? "placeholder" : "current_run",
     status,
     rows,
     updatedAt,
     missingMetrics,
    }])),
   },
  }
 }
 const commitSnapshot = () => {
  snapshot = { ...snapshot, capturedAt: new Date().toISOString(), syncManifest: manifest }
  saveVtSyncSnapshot(snapshot)
  onSnapshotCommit?.(snapshot)
 }

 try {
  let channel: any = null
  if (shouldSync(selected, "channel_metadata") || selected.size > 0) {
   updatePhase(progress, "channel_metadata", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   channel = await getChannelMetadata(token)
   if (previousSnapshot.channelId && previousSnapshot.channelId !== channel.id) {
    // Snapshot arrays are channel-owned. Keep the prior channel's durable rows
    // in IndexedDB, but never carry them into the newly authenticated channel.
    snapshot = normalizeVtSyncSnapshot({
     source: "vt-sync",
     snapshotId: runId,
     capturedAt: startedAt,
     channelId: channel.id,
     selectedTimeWindow: previousSnapshot.selectedTimeWindow,
     syncManifest: manifest,
    })
   }
   snapshot = {
    ...snapshot,
    channelId: channel.id,
    channelName: channel.snippet?.title || null,
    channelDescription: channel.snippet?.description || null,
    channelCustomUrl: channel.snippet?.customUrl || null,
    avatarUrl: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.medium?.url || channel.snippet?.thumbnails?.default?.url || null,
   subscriberCount: numberOrZero(channel.statistics?.subscriberCount),
   channelVideoCount: numberOrZero(channel.statistics?.videoCount),
   channelViewCount: numberOrZero(channel.statistics?.viewCount),
   channelPublishedAt: channel.snippet?.publishedAt || null,
   }
   addManifestResult(manifest, "channel_metadata", true, 1, ["snippet", "statistics", "contentDetails"])
   markFreshness(["channel_metadata"], "channel_metadata", 1)
   updatePhase(progress, "channel_metadata", { status: "complete", rows: 1, completedAt: new Date().toISOString() }, onProgress)
   commitSnapshot()
  }

  const channelStartDate = snapshot.channelPublishedAt?.slice(0, 10) || VT_SYNC_LIFETIME_START_DATE

  let videoIds = snapshot.videos.map((video) => video.id).filter(Boolean)
  let metadataCandidateIds = videoIds.filter((id) => {
   const video = snapshot.videos.find((entry) => entry.id === id)
   return !video || video.title === "Metadata pending" || !video.publishedAt || !video.duration
  })
  if (channel && shouldSync(selected, "uploads_playlist")) {
   updatePhase(progress, "uploads_playlist", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const inventory = await syncUploadsInventory({
    token,
    channelId: channel.id,
    uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads,
    runId,
    channelTitle: channel.snippet?.title || null,
    channelHandle: channel.snippet?.customUrl || null,
    publicVideoCount: numberOrZero(channel.statistics?.videoCount),
   })
   videoIds = inventory.videoIds
   const existingById = new Map(snapshot.videos.map((video) => [video.id, video]))
   const placeholderVideos = createPlaceholderVideos(videoIds, runId).map((placeholder) => existingById.get(placeholder.id) || placeholder)
   // An uploads page is an observation, not a deletion authority. Keep rows from
   // earlier complete/partial inventory passes until the creator explicitly
   // removes the local dataset; matching IDs are refreshed in place.
   const mergedInventoryVideos = mergeVtSyncRowsPreservingDefined(
    snapshot.videos as unknown as Array<Record<string, any>>,
    placeholderVideos as unknown as Array<Record<string, any>>,
    (row) => String(row.id || row.videoId || ""),
   ) as unknown as VtSyncSnapshot["videos"]
   const previousUploadRows = (snapshot.tableExports?.uploads_playlist || []) as Array<Record<string, any>>
   const mergedUploadRows = mergeVtSyncRowsPreservingDefined(
    previousUploadRows,
    videoIds.map((id) => ({ videoId: id, channelId: channel.id })),
    (row) => String(row.videoId || ""),
   )
   snapshot = {
    ...snapshot,
    videos: mergedInventoryVideos,
    tableExports: { ...(snapshot.tableExports || {}), uploads_playlist: mergedUploadRows },
   }
   metadataCandidateIds = [...new Set([
    ...inventory.newVideoIds,
    ...snapshot.videos.filter((video) => video.title === "Metadata pending" || !video.publishedAt || !video.duration).map((video) => video.id),
   ])]
   addManifestResult(manifest, "uploads_playlist", true, videoIds.length, ["channelId", "videoId"])
   manifest.diagnostics = [
    ...(manifest.diagnostics || []),
    {
     phase: "uploads_playlist",
     stopReason: inventory.stopReason,
     pagesRead: inventory.pagesRead,
     newVideoCount: inventory.newVideoIds.length,
     knownVideoCount: inventory.videoIds.length,
     needsFullInventoryReconcile: inventory.needsFullInventoryReconcile || false,
    },
   ]
   markFreshness(["uploads_playlist"], "uploads_playlist", videoIds.length)
   markFreshness(["videos"], "uploads_playlist", placeholderVideos.length, "placeholder", ["snippet", "contentDetails", "statistics", "youtubeAnalytics"])
   updatePhase(progress, "uploads_playlist", {
    status: inventory.needsFullInventoryReconcile ? "partial" : "complete",
    rows: videoIds.length,
    message: `${inventory.stopReason}; ${inventory.newVideoIds.length.toLocaleString()} new IDs across ${inventory.pagesRead.toLocaleString()} page(s).`,
    completedAt: new Date().toISOString(),
   }, onProgress)
   commitSnapshot()
  }

  if (forceFullVideoMetadata && shouldSync(selected, "video_metadata")) metadataCandidateIds = [...new Set(videoIds)]

  if (channel && metadataCandidateIds.length > 0 && shouldSync(selected, "video_metadata")) {
   updatePhase(progress, "video_metadata", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const shortsIds = await getShortsIds(token, channel.id)
   const videos = await getVideoMetadata(token, metadataCandidateIds, shortsIds)
   snapshot = { ...snapshot, videos: mergeVideoMetadataById(snapshot.videos, videos) }
   const returnedIds = new Set(videos.map((video) => video.id))
   const unresolvedCount = metadataCandidateIds.filter((id) => !returnedIds.has(id)).length
   const metadataIssue = unresolvedCount
    ? `${videos.length.toLocaleString()} of ${metadataCandidateIds.length.toLocaleString()} metadata records returned; ${unresolvedCount.toLocaleString()} remain unresolved.`
    : undefined
   addManifestResult(manifest, "video_metadata", unresolvedCount === 0, videos.length, ["snippet", "contentDetails", "statistics"], metadataIssue)
   markFreshness(["video_metadata", "videos"], "video_metadata", snapshot.videos.length, unresolvedCount ? "partial" : "synced", unresolvedCount ? ["metadataRecordsMissing"] : [])
   updatePhase(progress, "video_metadata", { status: unresolvedCount ? "partial" : "complete", rows: videos.length, message: metadataIssue || (forceFullVideoMetadata ? `${metadataCandidateIds.length.toLocaleString()} catalog record(s) fully refreshed.` : `${metadataCandidateIds.length.toLocaleString()} new, pending, or incomplete video record(s) checked.`), error: metadataIssue, completedAt: new Date().toISOString() }, onProgress)
   const tableReadyVideoRows = normalizeVtSyncVideoTableRows(snapshot.videos as unknown as Array<Record<string, unknown>>)
   const metadataPersistence = await persistDatasetRows({
    runId,
    channelId: snapshot.channelId || undefined,
    datasetId: "videos",
    phase: "video_metadata",
    tableRows: tableReadyVideoRows,
    columns: Array.from(new Set(tableReadyVideoRows.flatMap((video) => Object.keys(video)))),
    source: "youtube_data_v3",
   })
   if (!metadataPersistence.ok) {
    const persistenceIssue = `Video metadata was received but durable storage failed: ${metadataPersistence.error}`
    addManifestResult(manifest, "video_metadata_persistence", false, 0, ["videos"], persistenceIssue)
    markFreshness(["video_metadata", "videos"], "video_metadata", snapshot.videos.length, "partial", ["durableStorage"])
    updatePhase(progress, "video_metadata", {
     status: "partial",
     rows: videos.length,
     error: [metadataIssue, persistenceIssue].filter(Boolean).join(" "),
     message: persistenceIssue,
     completedAt: new Date().toISOString(),
    }, onProgress)
   }
   commitSnapshot()
   // Publish the complete Data API catalog before the first per-video Analytics
   // request begins. Yielding a task lets React paint titles/thumbnails while
   // the longer Analytics phase continues in the background.
   await sleep(0)
  }
  if (channel && metadataCandidateIds.length === 0 && shouldSync(selected, "video_metadata")) {
   addManifestResult(manifest, "video_metadata", true, 0, ["snippet", "contentDetails", "statistics"])
   markFreshness(["video_metadata", "videos"], "video_metadata", snapshot.videos.length, "synced")
   updatePhase(progress, "video_metadata", { status: "complete", rows: 0, message: "Catalog metadata is complete; no records needed refreshing.", completedAt: new Date().toISOString() }, onProgress)
   commitSnapshot()
   await sleep(0)
  }

  if (shouldSync(selected, "videos_analytics") && snapshot.videos.length > 0) {
   updatePhase(progress, "videos_analytics", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const analyticsMap: Record<string, Record<string, any>> = {}
   let rowsWritten = 0
   let failures = 0
   const videoAnalyticsIds = snapshot.videos.map((video) => video.id).filter(Boolean)
   const videoColumns = new Set<string>()
   const videoBundleDiagnostics: Array<Record<string, unknown>> = []
   for (let index = 0; index < videoAnalyticsIds.length; index += VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE) {
    const chunk = videoAnalyticsIds.slice(index, index + VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE)
    const batchIndex = index / VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE
    const batchRows: Record<string, any>[] = []
    for (const bundle of DAILY_ANALYTICS_METRIC_BUNDLES) {
     const bundleResult = await runAnalyticsBundleWithMetricSplit({
      token,
      id: `video_stats_${batchIndex}_${bundle.id}`,
      metrics: [...bundle.metrics],
      dimensions: "video",
      sort: "",
      maxResults: 0,
      filters: `video==${chunk.join(",")}`,
      startDate: "2000-01-01",
      allowFallback: false,
     })
     bundleResult.columns.forEach((column) => videoColumns.add(column))
     if (bundleResult.rows) batchRows.push(...bundleResult.rows)
     if (!bundleResult.rows || bundleResult.error) failures += 1
     addManifestResult(
      manifest,
      `video_stats_${batchIndex}_${bundle.id}`,
      !!bundleResult.rows,
      bundleResult.rows?.length || 0,
      ["video", ...bundle.metrics],
      bundleResult.error,
      bundleResult.columns,
     )
     videoBundleDiagnostics.push(analyticsBundleDiagnostic({
      phase: "videos_analytics",
      categoryId: "videos_analytics",
      bundleId: bundle.id,
      requestedMetrics: bundle.metrics,
      result: bundleResult,
      context: { batch: batchIndex },
     }))
     if (bundle !== DAILY_ANALYTICS_METRIC_BUNDLES[DAILY_ANALYTICS_METRIC_BUNDLES.length - 1]) await sleep(75)
    }
    const mergedBatchRows = mergeRowsByKey(
     [],
     batchRows,
     (candidate) => String(candidate.video || ""),
    )
    if (mergedBatchRows.length) {
     mergedBatchRows.forEach((row) => {
      const videoId = String(row.video || "")
      if (!videoId) return
      analyticsMap[videoId] = mergeVtSyncDefinedFields(analyticsMap[videoId], row)
     })
     rowsWritten = Object.keys(analyticsMap).length
     snapshot = { ...snapshot, videos: mergeVideoAnalytics(snapshot.videos, Object.values(analyticsMap)) }
     updatePhase(progress, "videos_analytics", { status: "running", rows: rowsWritten, message: `Merged ${Math.min(index + VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE, videoAnalyticsIds.length)} of ${videoAnalyticsIds.length} video analytics rows.` }, onProgress)
     commitSnapshot()
    }
    if (index + VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE < videoAnalyticsIds.length) await sleep(300)
   }
   manifest.diagnostics = [...(manifest.diagnostics || []), ...videoBundleDiagnostics]
   if (Object.keys(analyticsMap).length) {
    await persistDatasetRows({
     runId,
     channelId: snapshot.channelId || undefined,
     datasetId: "videos",
     phase: "videos_analytics",
     rawRows: Object.values(analyticsMap),
     tableRows: normalizeVtSyncVideoTableRows(snapshot.videos as unknown as Array<Record<string, unknown>>),
     columns: [...videoColumns],
    })
   }

   const longIds = snapshot.videos.filter((video) => video.format === "long").map((video) => video.id)
   const longRows: Record<string, any>[] = []
   for (let index = 0; index < longIds.length; index += VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE) {
    const chunk = longIds.slice(index, index + VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE)
    const batchIndex = index / VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE
    const longResult = await runAnalyticsBundle({
     token,
     id: `video_long_only_metrics_${batchIndex}`,
     metrics: LONG_FORMAT_METRICS,
     dimensions: "video",
     sort: "",
     maxResults: 0,
     filters: `video==${chunk.join(",")}`,
     startDate: "2000-01-01",
    })
    if (longResult.rows) {
     longRows.push(...longResult.rows)
     addManifestResult(manifest, `video_long_only_metrics_${batchIndex}`, true, longResult.rows.length, ["video", ...LONG_FORMAT_METRICS], undefined, longResult.columns)
    } else {
     failures += 1
     addManifestResult(manifest, `video_long_only_metrics_${batchIndex}`, false, 0, ["video", ...LONG_FORMAT_METRICS], longResult.error)
    }
    if (index + VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE < longIds.length) await sleep(300)
   }
   if (longRows.length) snapshot = { ...snapshot, videos: mergeLongFormatCardMetrics(snapshot.videos, longRows) }
   markFreshness(["videos_analytics", "videos"], "videos_analytics", snapshot.videos.length, failures ? "partial" : "synced", failures ? ["someVideoAnalyticsBundles"] : [])
   commitSnapshot()
   updatePhase(progress, "videos_analytics", {
    status: failures ? "partial" : "complete",
    rows: rowsWritten,
    error: failures ? `${failures} video analytics bundle(s) failed; metadata rows remain visible.` : undefined,
    completedAt: new Date().toISOString(),
   }, onProgress)
  }

  if (shouldSync(selected, "channel_totals")) {
   updatePhase(progress, "channel_totals", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const previousChannelTotals = snapshot.channelTotals as Record<string, any> | null
   const windows: VtSyncAnalyticsWindow[] = ["7d", "28d", "90d", "365d", "lifetime"]
   const totalsEntries: Array<readonly [VtSyncAnalyticsWindow, Awaited<ReturnType<typeof channelTotalsForWindow>>]> = []
   for (const window of windows) {
    totalsEntries.push([window, await channelTotalsForWindow(token, window, channelStartDate)] as const)
    if (window !== windows[windows.length - 1]) await sleep(150)
   }
   const previousWindowAliases: Partial<Record<VtSyncAnalyticsWindow, string>> = {
    "7d": "last7",
    "28d": "last28",
    "90d": "last90",
    "365d": "last365",
   }
   const totalsObject = Object.fromEntries(totalsEntries.map(([window, result]) => [
    window,
    mergeVtSyncDefinedFields(
     previousChannelTotals?.[window] || previousChannelTotals?.[previousWindowAliases[window] || ""],
     result.row,
    ),
   ])) as any
   const totalsColumns = [...new Set(totalsEntries.flatMap(([, result]) => result.columns))]
   const totalsErrors = totalsEntries.map(([, result]) => result.error).filter(Boolean) as string[]
   const coreWindows = totalsEntries.filter(([, result]) => result.coreAvailable).length
   const mergedChannelTotals = fillMissingChannelTotalsFromDaily(
    {
     ...totalsObject,
     last7: totalsObject["7d"],
     last28: totalsObject["28d"],
     last90: totalsObject["90d"],
     last365: totalsObject["365d"],
    } as VtSyncSnapshot["channelTotals"],
    snapshot.dailyMetrics as unknown as Array<Record<string, any>>,
    channelStartDate,
   )
   snapshot = { ...snapshot, channelTotals: mergedChannelTotals }
   manifest.diagnostics = [
    ...(manifest.diagnostics || []),
    ...totalsEntries.flatMap(([, result]) => result.diagnostics),
   ]
   addManifestResult(manifest, "channel_totals", coreWindows > 0, totalsEntries.length, [...CHANNEL_TOTAL_METRICS], totalsErrors.join(" | ") || undefined, totalsColumns)
   const missingChannelTotalMetrics = CHANNEL_TOTAL_METRICS.filter((metric) => !totalsColumns.includes(metric))
   const totalsStatus = coreWindows === 0 ? "failed" : totalsErrors.length || missingChannelTotalMetrics.length ? "partial" : "synced"
   if (coreWindows > 0) {
    await persistDatasetRows({
     runId,
     channelId: snapshot.channelId || undefined,
     datasetId: "channel_totals",
     phase: "channel_totals",
     rawRows: totalsEntries.flatMap(([, result]) => result.row ? [result.row] : []),
     tableRows: windows.map((window) => ({ window, ...(mergedChannelTotals?.[window] || {}) })),
     columns: ["window", ...totalsColumns],
    })
   }
   markFreshness(["channel_totals"], "channel_totals", totalsEntries.length, totalsStatus, missingChannelTotalMetrics)
   updatePhase(progress, "channel_totals", {
    status: coreWindows === 0 ? "failed" : totalsErrors.length || missingChannelTotalMetrics.length ? "partial" : "complete",
    rows: totalsEntries.length,
    error: totalsErrors.join(" | ") || (missingChannelTotalMetrics.length ? `Missing returned metrics: ${missingChannelTotalMetrics.join(", ")}` : undefined),
    completedAt: new Date().toISOString(),
   }, onProgress)
   commitSnapshot()
   // Channel totals are a complete dashboard checkpoint. Give subscribers a
   // render opportunity before daily/monthly or other selected queries begin.
   await sleep(0)
  }

  if (shouldSync(selected, "daily_metrics")) {
   updatePhase(progress, "daily_metrics", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const previousDailyMetrics = snapshot.dailyMetrics as unknown as Array<Record<string, any>>
   const dailyBundleResults: BundleResult[] = []
   for (const bundle of DAILY_ANALYTICS_METRIC_BUNDLES) {
    dailyBundleResults.push(await runLifetimeDateWindowBundle({
     token,
     id: `daily_history_${bundle.id}`,
     metrics: [...bundle.metrics],
     dimensions: "day",
     sort: "-day",
     startDate: channelStartDate,
     allowFallback: false,
     splitOnFailure: true,
    }))
    if (bundle !== DAILY_ANALYTICS_METRIC_BUNDLES[DAILY_ANALYTICS_METRIC_BUNDLES.length - 1]) await sleep(100)
   }
   const dailyRows = dailyBundleResults.reduce(
    (rows, bundle) => mergeRowsByKey(rows, bundle.rows || [], (row) => String(row.day || "")),
    [] as Record<string, any>[],
   ).sort((a, b) => String(b.day || "").localeCompare(String(a.day || "")))
   const dailyErrors = dailyBundleResults.map((bundle) => bundle.error).filter(Boolean)
   manifest.diagnostics = [
    ...(manifest.diagnostics || []),
    ...dailyBundleResults.map((bundleResult, index) => analyticsBundleDiagnostic({
     phase: "daily_metrics",
     categoryId: "daily_metrics",
     bundleId: DAILY_ANALYTICS_METRIC_BUNDLES[index].id,
     requestedMetrics: DAILY_ANALYTICS_METRIC_BUNDLES[index].metrics,
     result: bundleResult,
    })),
   ]
   const result: BundleResult = {
    rows: dailyRows.length || dailyBundleResults.some((bundle) => bundle.rows) ? dailyRows : null,
    columns: [...new Set(dailyBundleResults.flatMap((bundle) => bundle.columns))],
    error: dailyErrors.length ? dailyErrors.join(" | ") : undefined,
    pageDiagnostics: dailyBundleResults.flatMap((bundle) => bundle.pageDiagnostics || []),
   }
   const dailyAttemptedColumns = ["day", ...FULL_ANALYTICS_METRICS]
   const dailyMissingMetrics = dailyAttemptedColumns.filter((metric) => !result.columns.includes(metric))
   const mappedDailyMetrics = (result.rows || []).map((row) => mapAnalyticsTimeMetricRow(row, "day"))
   const retainedDailyMetrics = preserveVtSyncRowsForFailedDateWindows(
    mappedDailyMetrics,
    previousDailyMetrics,
    result.pageDiagnostics,
    "date",
    "date",
   )
   const previousDailyByDate = new Map(previousDailyMetrics.map((row) => [String(row.date || row.day || ""), row]))
   const completeDailyMetrics = retainedDailyMetrics.map((row) =>
    mergeVtSyncDefinedFields(previousDailyByDate.get(String(row.date || row.day || "")), row),
   )
   snapshot = {
    ...snapshot,
    dailyMetrics: completeDailyMetrics as unknown as VtSyncSnapshot["dailyMetrics"],
   }
   if (snapshot.channelTotals) {
    snapshot = {
     ...snapshot,
     channelTotals: fillMissingChannelTotalsFromDaily(
      snapshot.channelTotals,
      completeDailyMetrics,
      channelStartDate,
     ),
    }
   }
   if (result.pageDiagnostics?.length) {
    manifest.diagnostics = [
     ...(manifest.diagnostics || []),
     {
      phase: "daily_metrics",
      categoryId: "daily_metrics",
      requestedRows: result.pageDiagnostics.length * VT_SYNC_ANALYTICS_DATE_WINDOW_DAYS,
      returnedRows: result.rows?.length || 0,
      pagination: result.pageDiagnostics,
      status: result.error ? "partial" : "complete",
      error: result.error,
     },
    ]
   }
   if (result.rows) await persistDatasetRows({ runId, channelId: snapshot.channelId || undefined, datasetId: "daily", phase: "daily_metrics", rawRows: result.rows, tableRows: snapshot.dailyMetrics as unknown as Array<Record<string, unknown>>, columns: result.columns })
   addManifestResult(manifest, "daily_history", !!result.rows, result.rows?.length || 0, dailyAttemptedColumns, result.error, result.columns)
   const dailyPartial = !!result.error || dailyMissingMetrics.length > 0
   markFreshness(["daily", "weekly", "monthly"], "daily_metrics", completeDailyMetrics.length, result.rows ? (dailyPartial ? "partial" : "synced") : "failed", dailyMissingMetrics)
   updatePhase(progress, "daily_metrics", {
    status: result.rows ? (dailyPartial ? "partial" : "complete") : "failed",
    rows: completeDailyMetrics.length,
    error: result.error || (dailyMissingMetrics.length ? `Missing returned metrics: ${dailyMissingMetrics.join(", ")}` : undefined),
    completedAt: new Date().toISOString(),
   }, onProgress)
   commitSnapshot()
  }

  if (shouldSync(selected, "monthly_metrics")) {
   updatePhase(progress, "monthly_metrics", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const previousMonthlyMetrics = snapshot.monthlyMetrics as unknown as Array<Record<string, any>>
   const monthRange = buildVtSyncAnalyticsMonthRange(channelStartDate, reportEndDate())
   const monthlyBundleResults: BundleResult[] = []
   for (const bundle of DAILY_ANALYTICS_METRIC_BUNDLES) {
    monthlyBundleResults.push(await runAnalyticsBundleWithMetricSplit({
     token,
     id: `monthly_history_${bundle.id}`,
     metrics: [...bundle.metrics],
     dimensions: "month",
     sort: "-month",
     startDate: monthRange.startDate,
     endDate: monthRange.endDate,
     maxResults: 500,
     allowFallback: false,
    }))
    if (bundle !== DAILY_ANALYTICS_METRIC_BUNDLES[DAILY_ANALYTICS_METRIC_BUNDLES.length - 1]) await sleep(100)
   }
   const monthlyRows = monthlyBundleResults.reduce(
    (rows, bundle) => mergeRowsByKey(rows, bundle.rows || [], (row) => String(row.month || "")),
    [] as Record<string, any>[],
   ).sort((a, b) => String(b.month || "").localeCompare(String(a.month || "")))
   const monthlyColumns = [...new Set(monthlyBundleResults.flatMap((bundle) => bundle.columns))]
   const monthlyErrors = monthlyBundleResults.map((bundle) => bundle.error).filter(Boolean)
   manifest.diagnostics = [
    ...(manifest.diagnostics || []),
    ...monthlyBundleResults.map((bundleResult, index) => analyticsBundleDiagnostic({
     phase: "monthly_metrics",
     categoryId: "monthly_metrics",
     bundleId: DAILY_ANALYTICS_METRIC_BUNDLES[index].id,
     requestedMetrics: DAILY_ANALYTICS_METRIC_BUNDLES[index].metrics,
     result: bundleResult,
    })),
   ]
   const monthlyAttemptedColumns = ["month", ...FULL_ANALYTICS_METRICS]
   const monthlyMissingMetrics = monthlyAttemptedColumns.filter((metric) => !monthlyColumns.includes(metric))
   const mappedMonthlyMetrics = monthlyRows.map((row) => mapAnalyticsTimeMetricRow(row, "month"))
   const completeMonthlyMetrics = monthlyRows.length
    ? mergeVtSyncRowsPreservingDefined(
       previousMonthlyMetrics,
       mappedMonthlyMetrics,
       (row) => String(row.date || ""),
      )
    : previousMonthlyMetrics
   snapshot = {
    ...snapshot,
    monthlyMetrics: completeMonthlyMetrics as unknown as VtSyncSnapshot["monthlyMetrics"],
    tableExports: {
     ...(snapshot.tableExports || {}),
     monthly_api: completeMonthlyMetrics,
    },
   }
   const monthlyError = monthlyErrors.length ? monthlyErrors.join(" | ") : undefined
   if (monthlyRows.length) await persistDatasetRows({
    runId, channelId: snapshot.channelId || undefined,
    datasetId: "monthly_api",
    phase: "monthly_metrics",
    rawRows: monthlyRows,
    tableRows: completeMonthlyMetrics,
    columns: monthlyColumns,
   })
   addManifestResult(manifest, "monthly_history", monthlyRows.length > 0, monthlyRows.length, monthlyAttemptedColumns, monthlyError, monthlyColumns)
   const monthlyPartial = !!monthlyError || monthlyMissingMetrics.length > 0
   markFreshness(["monthly", "monthly_api"], "monthly_metrics", completeMonthlyMetrics.length, monthlyRows.length ? (monthlyPartial ? "partial" : "synced") : "failed", monthlyMissingMetrics)
   updatePhase(progress, "monthly_metrics", {
    status: monthlyRows.length ? (monthlyPartial ? "partial" : "complete") : "failed",
    rows: completeMonthlyMetrics.length,
    error: monthlyError || (monthlyMissingMetrics.length ? `Missing returned metrics: ${monthlyMissingMetrics.join(", ")}` : undefined),
    completedAt: new Date().toISOString(),
   }, onProgress)
   commitSnapshot()
  }

  const trafficCategoryMap: Array<{ id: string; field?: keyof VtSyncSnapshot; sourceType: string; enrichType?: TrafficEnrichmentType }> = [
   { id: "traffic_overview", field: "trafficSources", sourceType: "" },
   ...getVtSyncAvailableTrafficDetailSources().map((source) => ({
    id: source.categoryId,
    field: source.legacyField as keyof VtSyncSnapshot | undefined,
    sourceType: source.sourceType,
    enrichType: source.family === "video" || source.family === "channel" ? source.family : undefined,
   })),
  ]
  const selectedTraffic = trafficCategoryMap.filter(({ id }) => shouldSync(selected, id))
  if (selectedTraffic.length > 0) {
   updatePhase(progress, "traffic", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   let rowsWritten = 0
   let trafficPartial = false
   const completeDetailSourceTypes = new Set<string>()
   for (const [trafficIndex, { id: categoryId, field, sourceType, enrichType }] of selectedTraffic.entries()) {
    const currentQueryLabel = VT_SYNC_CATEGORY_OPTIONS.find((category) => category.id === categoryId)?.label || categoryId.replace(/_/g, " ")
    const nextCategoryId = selectedTraffic[trafficIndex + 1]?.id
    const nextQueryLabel = nextCategoryId
     ? VT_SYNC_CATEGORY_OPTIONS.find((category) => category.id === nextCategoryId)?.label || nextCategoryId.replace(/_/g, " ")
     : undefined
    updatePhase(progress, "traffic", {
     currentQueryLabel,
     nextQueryLabel,
     message: `Syncing ${currentQueryLabel}.`,
    }, onProgress)
    // insightTrafficSourceDetail rejects maxResults values above ~25 with a garbled 500
    // (FIELD_UNKNOWN_VALUE on max-results) instead of a clean error, so page through it in
    // chunks of 25 until YouTube returns the final short/empty page instead of requesting a larger page directly.
    const result = sourceType
     ? categoryId === "traffic_campaign_card" && !contentOwnerId
      ? { rows: null, columns: [], status: 403, error: "Campaign Cards require a verified and selected YouTube Content Owner." }
      : await runTrafficDetailAnalyticsBundle({
       token,
       id: categoryId,
       metrics: ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"],
       dimensions: "insightTrafficSourceDetail",
       ids: categoryId === "traffic_campaign_card" && contentOwnerId ? `contentOwner==${contentOwnerId}` : "channel==MINE",
       filters: categoryId === "traffic_campaign_card" && contentOwnerId
        ? `channel==${snapshot.channelId};insightTrafficSourceType==${sourceType}`
        : `insightTrafficSourceType==${sourceType}`,
       sort: "-views",
       startDate: channelStartDate,
       pageSize: VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE,
      })
     : await runAnalyticsBundle({
       token,
       id: categoryId,
       metrics: ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"],
       dimensions: "insightTrafficSourceType",
       sort: "-views",
       maxResults: 200,
       startDate: channelStartDate,
      })
    const mappedRows = await enrichTrafficDetailRows(token, mapTraffic(result.rows, sourceType ? "insightTrafficSourceDetail" : "insightTrafficSourceType"), enrichType)
    const detailRows = sourceType ? mappedRows.map((row) => ({
     ...row,
     sourceType,
     detail: String(row.insightTrafficSourceDetail || row.term || row.source || ""),
     coverageStatus: result.error ? "partial" : "complete" as const,
    })) : []
    if (sourceType) {
     const previousDetails = snapshot.trafficDetails.filter((row) => row.sourceType !== sourceType)
     // A complete response is authoritative for this source only. Partial data is additive.
     snapshot.trafficDetails = result.error
      ? mergeVtSyncRowsPreservingDefined(snapshot.trafficDetails as Array<Record<string, any>>, detailRows, (row) => `${row.sourceType || ""}::${row.detail || row.insightTrafficSourceDetail || ""}`) as VtSyncSnapshot["trafficDetails"]
      : [...previousDetails, ...detailRows] as VtSyncSnapshot["trafficDetails"]
     if (!result.error && result.rows) completeDetailSourceTypes.add(sourceType)
    }
    if (field) {
     const previousRows = Array.isArray((snapshot as any)[field]) ? (snapshot as any)[field] as Record<string, any>[] : []
     ;(snapshot as any)[field] = sourceType && !result.error && result.rows
      ? mappedRows
      : mergeVtSyncRowsPreservingDefined(
       previousRows,
       mappedRows,
       (row) => metricRowKey(row, sourceType ? "insightTrafficSourceDetail" : "insightTrafficSourceType"),
      )
    }
    rowsWritten += mappedRows.length
    const categoryComplete = !!result.rows && !result.error
    if (!categoryComplete) trafficPartial = true
    if (result.pageDiagnostics?.length) {
     manifest.diagnostics = [
      ...(manifest.diagnostics || []),
      {
       phase: "traffic_sync",
       categoryId,
       sourceType: sourceType || "overview",
       requestedRows: result.rows?.length || 0,
       returnedRows: result.rows?.length || 0,
       pagination: result.pageDiagnostics,
       fallback: result.fallback,
       status: result.error ? "partial" : result.fallback ? "fallback_windowed" : "inspected",
       error: result.error,
      },
     ]
    }
    addManifestResult(manifest, categoryId, categoryComplete, result.rows?.length || 0, result.columns, result.error)
    if (result.rows) await persistDatasetRows({ runId, channelId: snapshot.channelId || undefined, datasetId: categoryId, phase: "traffic_sync", rawRows: result.rows, tableRows: sourceType ? detailRows : mappedRows, columns: result.columns })
    markFreshness(
     [categoryId],
     categoryId,
     mappedRows.length,
     result.rows ? (result.error || mappedRows.length === 0 ? "partial" : "synced") : "failed",
     result.error
      ? [result.error]
      : result.rows && mappedRows.length === 0
       ? [`No ${sourceType || "traffic overview"} rows returned by YouTube Analytics.`]
       : [],
    )
    commitSnapshot()
    await sleep(150)
   }
   updatePhase(progress, "traffic", { status: trafficPartial ? "partial" : "complete", rows: rowsWritten, currentQueryLabel: undefined, nextQueryLabel: undefined, message: undefined, completedAt: new Date().toISOString() }, onProgress)
   // Compatibility projection for existing table tabs and visual consumers. The canonical
   // trafficDetails dataset remains the write authority.
   const legacyDetailFields: Record<string, keyof VtSyncSnapshot> = {
    YT_SEARCH: "searchTerms",
    EXT_URL: "extWebsites",
    SUBSCRIBER: "trafficSubscriberData",
    RELATED_VIDEO: "suggestedVideos",
    HASHTAGS: "hashtags",
    SOUND_PAGE: "soundPages",
    ADVERTISING: "trafficAdvertising",
    YT_CHANNEL: "trafficChannelPages",
    YT_OTHER_PAGE: "trafficOtherFeatures",
    CAMPAIGN_CARD: "trafficCampaignCard",
    END_SCREEN: "trafficEndScreen",
    LIVE_REDIRECT: "trafficLiveRedirect",
    PLAYLIST: "trafficPlaylist",
    YT_PLAYLIST_PAGE: "trafficYtPlaylistPage",
   }
   Object.entries(legacyDetailFields).forEach(([sourceType, legacyField]) => {
    const rows = snapshot.trafficDetails.filter((row) => row.sourceType === sourceType)
    if (rows.length || completeDetailSourceTypes.has(sourceType)) (snapshot as any)[legacyField] = rows
   })
   commitSnapshot()
  }

  if (["audience_demographics", "demographics_age", "demographics_gender", "audience_watch_behavior", "new_returning_viewers", "creator_content_type", "formats_subscriber_status", "device_type", "operating_system", "playback_location", "subscription_status", "geography_country", "geography_city", "geography_province", "geography_dma"].some((id) => shouldSync(selected, id))) {
   updatePhase(progress, "segments", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   let rowsWritten = 0
   let segmentsPartial = false
   const segmentRuns: Array<[string, keyof VtSyncSnapshot, string, readonly string[], string, string?, number?]> = [
    ["audience_demographics", "demographics", "ageGroup,gender", ["viewerPercentage"], ""],
    ["demographics_age", "demographicsByAge", "ageGroup", ["viewerPercentage"], ""],
    ["demographics_gender", "demographicsByGender", "gender", ["viewerPercentage"], ""],
    ["audience_watch_behavior", "audienceWatchBehavior", "audienceType", ["views", "estimatedMinutesWatched", "averageViewDuration"], "-views"],
    ["new_returning_viewers", "newReturningViewers", "audienceType", ["views", "estimatedMinutesWatched"], "-views"],
    ["creator_content_type", "creatorContentTypes", "month,creatorContentType", VT_SYNC_REQUIRED_ANALYTICS_METRICS, "-month"],
    ["formats_subscriber_status", "formatSubscriberStatuses", "creatorContentType,subscribedStatus", ["views", "redViews", "estimatedMinutesWatched", "estimatedRedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"], "-views"],
    ["geography_country", "geography", "country", VT_SYNC_REQUIRED_ANALYTICS_METRICS, "-views"],
    ["geography_city", "cities", "country,city", ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"], "-views"],
    ["geography_province", "provinces", "province", GEOGRAPHY_PROVINCE_SAFE_METRICS, "-views", "country==US", 50],
    ["geography_dma", "dmaRegions", "dma", ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"], "-views"],
    ["device_type", "devices", "deviceType", ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"], "-views"],
    ["operating_system", "operatingSystems", "operatingSystem", ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"], "-views"],
    ["playback_location", "playbackLocations", "insightPlaybackLocationType", ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"], "-views"],
    ["subscription_status", "subscriptionStatuses", "subscribedStatus", ["views", "redViews", "estimatedMinutesWatched", "estimatedRedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"], "-views"],
   ]
   for (const [categoryId, field, dimensions, metrics, sort, filters = "", maxResults = 200] of segmentRuns) {
    if (!shouldSync(selected, categoryId)) continue
    const usesCompleteContract = categoryId === "creator_content_type" || categoryId === "geography_country"
    let result: BundleResult
    if (usesCompleteContract) {
    const bundleResults: BundleResult[] = []
    for (const bundle of VT_SYNC_ANALYTICS_METRIC_BUNDLES) {
      const bundleMetrics = categoryId === "creator_content_type"
       ? bundle.metrics.filter((m) => m !== "videosAddedToPlaylists" && m !== "videosRemovedFromPlaylists")
       : [...bundle.metrics]
      if (bundleMetrics.length === 0) continue
      const bundleResult = categoryId === "creator_content_type"
       ? await runLifetimeMonthWindowBundle({
        token,
        id: `${categoryId}_${bundle.id}`,
        metrics: bundleMetrics,
        dimensions,
        sort,
        maxResults: 500,
        filters,
        startDate: channelStartDate,
        allowFallback: false,
        splitOnFailure: true,
       })
       : await runAnalyticsBundleWithMetricSplit({
       token,
       id: `${categoryId}_${bundle.id}`,
       metrics: [...bundle.metrics],
       dimensions,
       sort,
       maxResults,
       filters,
       startDate: channelStartDate,
       allowFallback: false,
      })
      bundleResults.push(bundleResult)
      manifest.diagnostics = [
       ...(manifest.diagnostics || []),
       analyticsBundleDiagnostic({
        phase: "segments",
        categoryId,
        bundleId: bundle.id,
        requestedMetrics: bundleMetrics,
        result: bundleResult,
       }),
      ]
      if (bundle !== VT_SYNC_ANALYTICS_METRIC_BUNDLES[VT_SYNC_ANALYTICS_METRIC_BUNDLES.length - 1]) await sleep(100)
     }
     result = {
      rows: bundleResults.reduce(
       (rows, bundle) => mergeRowsByKey(rows, bundle.rows || [], (row) => metricRowKey(row, dimensions)),
       [] as Record<string, any>[],
      ),
      columns: [...new Set(bundleResults.flatMap((bundle) => bundle.columns))],
      error: bundleResults.map((bundle) => bundle.error).filter(Boolean).join(" | ") || undefined,
      status: bundleResults.find((bundle) => bundle.status)?.status,
     }
     if (!result.rows?.length && bundleResults.every((bundle) => !bundle.rows)) result.rows = null
    } else {
     result = await runAnalyticsBundle({ token, id: `${categoryId}_core`, metrics: [...metrics], dimensions, sort, maxResults, filters, startDate: channelStartDate, allowFallback: false })
    }
    if (!result.rows || result.error) segmentsPartial = true
    const attemptedMetrics = categoryId === "creator_content_type"
     ? VT_SYNC_REQUIRED_ANALYTICS_METRICS.filter((m) => m !== "videosAddedToPlaylists" && m !== "videosRemovedFromPlaylists")
     : usesCompleteContract ? [...VT_SYNC_REQUIRED_ANALYTICS_METRICS] : [...metrics]
    const missingMetrics = attemptedMetrics.filter((metric) => !result.columns.includes(metric))
    if (missingMetrics.length) segmentsPartial = true
    const rawRows = result.rows || []
    const mappedRows = categoryId === "creator_content_type"
     ? aggregateVtSyncCreatorContentTypeRows(rawRows)
     : mapSegmentRows(result.rows, dimensions.split(",").pop() || dimensions)
    const previousRows = Array.isArray((snapshot as any)[field]) ? (snapshot as any)[field] as Record<string, any>[] : []
    const completedRows = mergeVtSyncRowsPreservingDefined(
     previousRows,
     mappedRows,
     vtSyncSegmentRowKey,
    )
    ;(snapshot as any)[field] = completedRows
    rowsWritten += result.rows?.length || 0
    addManifestResult(
     manifest,
     categoryId,
     !!result.rows && !result.error && !missingMetrics.length,
     result.rows?.length || 0,
     [dimensions, ...attemptedMetrics],
     result.error,
     result.columns,
    )
    if (result.rows) await persistDatasetRows({ runId, channelId: snapshot.channelId || undefined, datasetId: categoryId, phase: "segments", rawRows, tableRows: completedRows, columns: result.columns })
    markFreshness([categoryId], categoryId, completedRows.length, result.rows ? (result.error || missingMetrics.length ? "partial" : "synced") : "failed", missingMetrics)
    commitSnapshot()
    await sleep(150)
   }
   updatePhase(progress, "segments", { status: segmentsPartial ? "partial" : "complete", rows: rowsWritten, completedAt: new Date().toISOString() }, onProgress)
   commitSnapshot()
  }

  if (["ad_type", "revenue_source", "sharing_service"].some((id) => shouldSync(selected, id))) {
   updatePhase(progress, "segments", { status: "running", startedAt: new Date().toISOString(), message: "Running revenue and sharing segments." }, onProgress)
   let rowsWritten = 0
   let segmentPartial = false
   if (shouldSync(selected, "ad_type")) {
    const result = await runAnalyticsBundle({ token, id: "ad_type", metrics: ["grossRevenue", "cpm", "adImpressions"], dimensions: "adType", sort: "-grossRevenue", maxResults: 50, startDate: channelStartDate })
    if (!result.rows || result.error) segmentPartial = true
    snapshot = {
     ...snapshot,
     adTypes: mergeVtSyncRowsPreservingDefined(
      snapshot.adTypes as Array<Record<string, any>>,
      result.rows || [],
      (row) => String(row.adType || row.term || ""),
     ) as VtSyncSnapshot["adTypes"],
    }
    rowsWritten += result.rows?.length || 0
    addManifestResult(manifest, "ad_type", !!result.rows, result.rows?.length || 0, result.columns, result.error)
    if (result.rows) await persistDatasetRows({ runId, channelId: snapshot.channelId || undefined, datasetId: "ads", phase: "ad_type", rawRows: result.rows, tableRows: result.rows, columns: result.columns })
    markFreshness(["ad_type"], "ad_type", result.rows?.length || 0, result.rows ? "synced" : "failed")
    commitSnapshot()
   }
   if (shouldSync(selected, "revenue_source")) {
    const previousRevenueRows = snapshot.revenueSource as Array<Record<string, any>>
    const result = await runLifetimeDateWindowBundle({ token, id: "revenue_source", metrics: ["estimatedRevenue", "estimatedAdRevenue", "estimatedRedPartnerRevenue"], dimensions: "day", sort: "-day", startDate: channelStartDate, allowFallback: false, splitOnFailure: true })
    if (!result.rows || result.error) segmentPartial = true
    const mappedRevenueRows = (result.rows || []).map((row) => ({
     day: row.day,
     revenue: numberOrUndefined(row.estimatedRevenue),
     adRevenue: numberOrUndefined(row.estimatedAdRevenue),
     redRevenue: numberOrUndefined(row.estimatedRedPartnerRevenue),
     estimatedRevenue: numberOrUndefined(row.estimatedRevenue),
     estimatedAdRevenue: numberOrUndefined(row.estimatedAdRevenue),
     estimatedRedPartnerRevenue: numberOrUndefined(row.estimatedRedPartnerRevenue),
    }))
    const retainedRevenueRows = preserveVtSyncRowsForFailedDateWindows(
     mappedRevenueRows,
     previousRevenueRows,
     result.pageDiagnostics,
     "day",
     "day",
    )
    const previousRevenueByDay = new Map(previousRevenueRows.map((row) => [String(row.day || ""), row]))
    const completeRevenueRows = retainedRevenueRows.map((row) =>
     mergeVtSyncDefinedFields(previousRevenueByDay.get(String(row.day || "")), row),
    )
    snapshot = {
     ...snapshot,
     revenueSource: completeRevenueRows,
    }
    if (result.pageDiagnostics?.length) {
     manifest.diagnostics = [
      ...(manifest.diagnostics || []),
      {
       phase: "revenue_source",
       categoryId: "revenue_source",
       requestedRows: result.pageDiagnostics.length * VT_SYNC_ANALYTICS_DATE_WINDOW_DAYS,
       returnedRows: result.rows?.length || 0,
       pagination: result.pageDiagnostics,
       status: result.error ? "partial" : "complete",
       error: result.error,
      },
     ]
    }
    rowsWritten += completeRevenueRows.length
    addManifestResult(manifest, "revenue_source", !!result.rows, result.rows?.length || 0, result.columns, result.error)
    if (result.rows) await persistDatasetRows({ runId, channelId: snapshot.channelId || undefined, datasetId: "revenue", phase: "revenue_source", rawRows: result.rows, tableRows: snapshot.revenueSource as Array<Record<string, unknown>>, columns: result.columns })
    const revenueMissingMetrics = ["estimatedRevenue", "estimatedAdRevenue", "estimatedRedPartnerRevenue"].filter((metric) => !result.columns.includes(metric))
    markFreshness(["revenue"], "revenue_source", completeRevenueRows.length, result.rows ? (result.error || revenueMissingMetrics.length ? "partial" : "synced") : "failed", revenueMissingMetrics)
    commitSnapshot()
   }
   if (shouldSync(selected, "sharing_service")) {
    const result = await runPaginatedAnalyticsBundle({
     token,
     id: "sharing_service",
     metrics: ["shares"],
     dimensions: "sharingService",
     sort: "-shares",
     startDate: channelStartDate,
     pageSize: VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE,
     maxPages: VT_SYNC_PAGINATED_REPORT_MAX_PAGES,
    })
    if (!result.rows || result.error) segmentPartial = true
    const mappedSharingRows = (result.rows || []).map((row) => ({
      sharingService: row.sharingService,
      term: row.sharingService,
      shares: numberOrZero(row.shares),
    }))
    snapshot = {
     ...snapshot,
     sharingService: mergeVtSyncRowsPreservingDefined(
      snapshot.sharingService as Array<Record<string, any>>,
      mappedSharingRows,
      (row) => String(row.sharingService || row.term || ""),
     ) as VtSyncSnapshot["sharingService"],
    }
    rowsWritten += result.rows?.length || 0
    if (result.pageDiagnostics?.length) {
     manifest.diagnostics = [
      ...(manifest.diagnostics || []),
      {
       phase: "sharing_service",
       categoryId: "sharing_service",
       requestedRows: result.rows?.length || 0,
       returnedRows: result.rows?.length || 0,
       pagination: result.pageDiagnostics,
       status: result.error ? "partial" : "inspected",
       error: result.error,
      },
     ]
    }
    addManifestResult(manifest, "sharing_service", !!result.rows, result.rows?.length || 0, result.columns, result.error)
    if (result.rows) await persistDatasetRows({ runId, channelId: snapshot.channelId || undefined, datasetId: "shares", phase: "sharing_service", rawRows: result.rows, tableRows: snapshot.sharingService as Array<Record<string, unknown>>, columns: result.columns })
    markFreshness(["shares"], "sharing_service", result.rows?.length || 0, result.rows ? (result.error ? "partial" : "synced") : "failed", result.error ? [result.error] : [])
    commitSnapshot()
   }
   updatePhase(progress, "segments", { status: segmentPartial ? "partial" : "complete", rows: rowsWritten, completedAt: new Date().toISOString() }, onProgress)
   commitSnapshot()
  }

  if (shouldSync(selected, "device_os")) {
   updatePhase(progress, "device_os", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const deviceOsMetrics = ["views", "engagedViews", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage"]
   const result = await runAnalyticsBundle({ token, id: "device_os", metrics: deviceOsMetrics, dimensions: "deviceType,operatingSystem", sort: "-views", maxResults: 200, startDate: channelStartDate })
   const missingDeviceOsMetrics = deviceOsMetrics.filter((metric) => !result.columns.includes(metric))
   const mappedDeviceOsRows = (result.rows || []).map((row) => ({
    device: row.deviceType,
    operatingSystem: row.operatingSystem,
    views: numberOrUndefined(row.views),
    engagedViews: numberOrUndefined(row.engagedViews),
    watchTime: numberOrUndefined(row.estimatedMinutesWatched) !== undefined ? numberOrZero(row.estimatedMinutesWatched) / 60 : undefined,
    avgDuration: numberOrUndefined(row.averageViewDuration),
    avgPercentageViewed: numberOrUndefined(row.averageViewPercentage),
   }))
   const completeDeviceOsRows = mergeVtSyncRowsPreservingDefined(
    Array.isArray(snapshot.deviceOs) ? snapshot.deviceOs as Array<Record<string, any>> : [],
    mappedDeviceOsRows,
    (row) => `${String(row.device || row.deviceType || "")}|${String(row.operatingSystem || "")}`,
   )
   snapshot = {
    ...snapshot,
    deviceOs: completeDeviceOsRows,
   }
   addManifestResult(manifest, "device_os", !!result.rows, result.rows?.length || 0, result.columns, result.error)
   if (result.rows) await persistDatasetRows({ runId, channelId: snapshot.channelId || undefined, datasetId: "device_os", phase: "device_os", rawRows: result.rows, tableRows: completeDeviceOsRows, columns: result.columns })
   markFreshness(["device_os"], "device_os", completeDeviceOsRows.length, result.rows ? (missingDeviceOsMetrics.length ? "partial" : "synced") : "failed", missingDeviceOsMetrics)
   updatePhase(progress, "device_os", { status: result.rows ? (missingDeviceOsMetrics.length ? "partial" : "complete") : "failed", rows: result.rows?.length || 0, error: result.error || (missingDeviceOsMetrics.length ? `Missing returned metrics: ${missingDeviceOsMetrics.join(", ")}` : undefined), completedAt: new Date().toISOString() }, onProgress)
   commitSnapshot()
  }

  if (shouldSync(selected, "traffic_day")) {
   updatePhase(progress, "traffic_day", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const trafficDayCoreMetrics = ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"]
   const trafficDaySupplementalMetrics: string[] = []
   const combined = await runPaginatedAnalyticsBundle({
    token,
    id: "traffic_day_combined",
    metrics: [...trafficDayCoreMetrics, ...trafficDaySupplementalMetrics],
    dimensions: "insightTrafficSourceType,day",
    sort: "-day",
    pageSize: 200,
    startDate: channelStartDate,
    allowFallback: false,
   })
   let result = combined
   if (!combined.rows) {
    const core = await runPaginatedAnalyticsBundle({ token, id: "traffic_day_core", metrics: trafficDayCoreMetrics, dimensions: "insightTrafficSourceType,day", sort: "-day", pageSize: 200, startDate: channelStartDate, allowFallback: false })
    const supplemental: BundleResult = core.rows
     ? await runAnalyticsBundleWithMetricSplit({ token, id: "traffic_day_engagement", metrics: trafficDaySupplementalMetrics, dimensions: "insightTrafficSourceType,day", sort: "-day", maxResults: 0, startDate: channelStartDate, allowFallback: false })
     : { rows: null, columns: [], error: core.error, status: core.status }
    result = {
     rows: core.rows
      ? mergeRowsByKey(core.rows, supplemental.rows || [], (row) => `${String(row.insightTrafficSourceType || "")}|${String(row.day || "")}`)
      : null,
     columns: [...new Set([...core.columns, ...supplemental.columns])],
     error: supplemental.error || core.error || combined.error,
     status: supplemental.status || core.status || combined.status,
    }
   }
   const missingTrafficDayMetrics = [...trafficDayCoreMetrics, ...trafficDaySupplementalMetrics].filter((metric) => !result.columns.includes(metric))
   const mappedTrafficDayRows: VtSyncTrafficByDayRow[] = (result.rows || []).map((row) => ({
     term: String(row.insightTrafficSourceType || ""),
     day: String(row.day || ""),
     views: numberOrUndefined(row.views),
     watchTime: numberOrUndefined(row.estimatedMinutesWatched) !== undefined ? numberOrZero(row.estimatedMinutesWatched) / 60 : undefined,
     avgDuration: numberOrUndefined(row.averageViewDuration),
     avgPercentageViewed: numberOrUndefined(row.averageViewPercentage),
     engagedViews: numberOrUndefined(row.engagedViews),
     subscribersGained: numberOrUndefined(row.subscribersGained),
     shares: numberOrUndefined(row.shares),
     likes: numberOrUndefined(row.likes),
    }))
   const trafficDayIsAuthoritative = Boolean(result.rows && !result.error && missingTrafficDayMetrics.length === 0)
   const completeTrafficDayRows = trafficDayIsAuthoritative
    ? mappedTrafficDayRows
    : mergeVtSyncRowsPreservingDefined(
     Array.isArray(snapshot.trafficByDay) ? snapshot.trafficByDay as Array<Record<string, any>> : [],
     mappedTrafficDayRows,
     (row) => `${String(row.term || row.insightTrafficSourceType || "")}|${String(row.day || "")}`,
    ) as VtSyncTrafficByDayRow[]
   snapshot = {
    ...snapshot,
    trafficByDay: completeTrafficDayRows,
   }
   addManifestResult(manifest, "traffic_day", !!result.rows, result.rows?.length || 0, result.columns, result.error)
   if (result.rows) await persistDatasetRows({ runId, channelId: snapshot.channelId || undefined, datasetId: "traffic_day", phase: "traffic_day", rawRows: result.rows, tableRows: completeTrafficDayRows, columns: result.columns })
   markFreshness(["traffic_day"], "traffic_day", completeTrafficDayRows.length, result.rows ? (result.error || missingTrafficDayMetrics.length ? "partial" : "synced") : "failed", missingTrafficDayMetrics)
   updatePhase(progress, "traffic_day", { status: result.rows ? (result.error || missingTrafficDayMetrics.length ? "partial" : "complete") : "failed", rows: result.rows?.length || 0, error: result.error || (missingTrafficDayMetrics.length ? `Missing returned metrics: ${missingTrafficDayMetrics.join(", ")}` : undefined), completedAt: new Date().toISOString() }, onProgress)
   commitSnapshot()
  }

  if (shouldSync(selected, "playlists_analytics")) {
   updatePhase(progress, "playlists_analytics", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const playlistMetadata = await getPlaylistMetadata(token)
   const playlistMetadataById = new Map(playlistMetadata.map((playlist) => [playlist.id, playlist]))
   addManifestResult(manifest, "playlists_metadata", true, playlistMetadata.length, ["snippet", "contentDetails", "status"])
   const result = await runPaginatedAnalyticsBundle({
    token,
    id: "playlists_analytics",
    metrics: ["playlistViews", "playlistEstimatedMinutesWatched", "playlistStarts", "averageTimeInPlaylist", "playlistSaves"],
    dimensions: "playlist",
    sort: "-playlistViews",
    startDate: channelStartDate,
    pageSize: 200,
    maxPages: 50,
   })
   const mappedPlaylists = (result.rows || []).map((row) => {
     const pId = String(row.playlist || "").trim()
     const meta = playlistMetadataById.get(pId)
     return {
      playlistId: pId,
      playlist: meta?.title || `Playlist ${pId}`,
      title: meta?.title || `Playlist ${pId}`,
      description: meta?.description || "Playlist metadata not returned by Data API.",
      publishedAt: meta?.publishedAt || "-",
      videoCount: meta?.videoCount ?? 0,
      privacyStatus: meta?.privacyStatus || "unknown",
      cover: meta?.thumbnail || "",
      thumbnail: meta?.thumbnail || "",
      playlistUrl: pId && pId !== "Unknown" && pId !== "-" ? `https://www.youtube.com/playlist?list=${pId}` : "",
      views: numberOrZero(row.playlistViews),
      watchTime: numberOrZero(row.playlistEstimatedMinutesWatched),
      playlistStarts: numberOrZero(row.playlistStarts),
      playlistSaves: numberOrZero(row.playlistSaves),
      averageTimeInPlaylist: numberOrZero(row.averageTimeInPlaylist),
      viewsPerPlaylistStart: numberOrZero(row.playlistStarts) > 0 ? numberOrZero(row.playlistViews) / numberOrZero(row.playlistStarts) : 0,
     }
    })
   snapshot = {
    ...snapshot,
    playlistsData: mergeVtSyncRowsPreservingDefined(
     snapshot.playlistsData as Array<Record<string, any>>,
     mappedPlaylists,
     (row) => String(row.playlistId || row.playlist || ""),
    ) as VtSyncSnapshot["playlistsData"],
   }
   addManifestResult(manifest, "playlists_analytics", !!result.rows, result.rows?.length || 0, result.columns, result.error)
   if (result.rows) await persistDatasetRows({ runId, channelId: snapshot.channelId || undefined, datasetId: "playlists", phase: "playlists_analytics", rawRows: result.rows, tableRows: snapshot.playlistsData as Array<Record<string, unknown>>, columns: result.columns })
   markFreshness(["playlists"], "playlists_analytics", result.rows?.length || 0, result.rows ? "synced" : "failed")
   updatePhase(progress, "playlists_analytics", { status: result.rows ? (result.error ? "partial" : "complete") : "failed", rows: result.rows?.length || 0, error: result.error, completedAt: new Date().toISOString() }, onProgress)
   commitSnapshot()
  }

  if (shouldSync(selected, "retention")) {
   updatePhase(progress, "retention", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const targetSelection = selectVtSyncRetentionTargets(snapshot.videos, retentionVideoIds)
   const { baseline: baselineSelection, selectionMode, targetVideoIds } = targetSelection
   const selectionMessage = selectionMode === "explicit_manual"
    ? `${targetVideoIds.length} manually selected video${targetVideoIds.length === 1 ? "" : "s"}`
    : `${baselineSelection.selectedCounts.long} long-form + ${baselineSelection.selectedCounts.short} Shorts`
   manifest.diagnostics = [
    ...(manifest.diagnostics || []),
    {
     phase: "retention_selection",
     selectionMode,
     profile: baselineSelection.profile,
     selectedVideoIds: targetVideoIds,
     eligibleCounts: baselineSelection.eligibleCounts,
     selectedCounts: selectionMode === "explicit_manual" ? undefined : baselineSelection.selectedCounts,
     shortages: selectionMode === "explicit_manual" ? undefined : baselineSelection.shortages,
     estimatedRequests: targetVideoIds.length,
     message: selectionMessage,
    },
   ]
   updatePhase(progress, "retention", {
    message: selectionMessage,
    currentQueryLabel: `Retention · ${selectionMessage}`,
   }, onProgress)
   const retentionRows: Array<Record<string, unknown>> = []
   const retentionAttemptedAt = new Date().toISOString()
   const succeededMetrics = new Set<string>()
   const failedVideoIds = new Set<string>()
   const failureCodeByVideoId = new Map<string, string>()
   let partialVideos = 0
   let retentionFailures = 0
   for (const [videoIndex, videoId] of targetVideoIds.entries()) {
    updatePhase(progress, "retention", {
     currentQueryLabel: `Retention ${videoIndex + 1}/${targetVideoIds.length} · ${videoId}`,
     nextQueryLabel: targetVideoIds[videoIndex + 1] ? `Retention ${videoIndex + 2}/${targetVideoIds.length} · ${targetVideoIds[videoIndex + 1]}` : undefined,
    }, onProgress)
    const result = await runRetentionAnalyticsBundle({
     token,
     id: `retention_${videoId}`,
     dimensions: "elapsedVideoTimeRatio",
     sort: "elapsedVideoTimeRatio",
     maxResults: 500,
     filters: `video==${videoId}`,
     startDate: channelStartDate,
    })
    if (result.rows) {
     const availableMetrics = VT_SYNC_RETENTION_METRICS.filter((metric) => result.columns.includes(metric))
     availableMetrics.forEach((metric) => succeededMetrics.add(metric))
     const retentionStatus = availableMetrics.length === VT_SYNC_RETENTION_METRICS.length ? "complete" : "partial"
     if (retentionStatus === "partial") partialVideos += 1
     retentionRows.push(...result.rows.map((row) => {
      const pointAvailability = VT_SYNC_RETENTION_METRICS.filter((metric) => Object.hasOwn(row, metric))
      return {
       ...row,
       videoId,
       retentionStatus,
       retentionSource: "youtube_analytics_v2",
       retentionLastAttemptAt: retentionAttemptedAt,
       retentionFailureCode: "",
       retentionMetricAvailability: pointAvailability,
      }
     }))
     manifest.diagnostics = [...(manifest.diagnostics || []), {
      phase: "retention_video",
      videoId,
      status: retentionStatus,
      source: "youtube_analytics_v2",
      lastAttemptAt: retentionAttemptedAt,
      metricAvailability: availableMetrics,
      requestedMetrics: result.requestedMetrics,
      returnedHeaders: result.returnedHeaders,
      fallbackRequests: result.fallbackRequests,
      rows: result.rows.length,
      error: result.error,
     }]
    } else {
     retentionFailures += 1
     failedVideoIds.add(videoId)
     const failureCode = result.status === 429
      ? "quota_exhausted"
      : result.status === 401 || result.status === 403
       ? "auth_or_permission"
       : (result.status || 0) >= 500
        ? "upstream_unavailable"
        : "request_failed"
     failureCodeByVideoId.set(videoId, failureCode)
     manifest.diagnostics = [...(manifest.diagnostics || []), {
      phase: "retention_video",
      videoId,
      status: "failed",
      source: "youtube_analytics_v2",
      lastAttemptAt: retentionAttemptedAt,
      failureCode,
      httpStatus: result.status,
      metricAvailability: [],
      error: result.error,
     }]
    }
   }
   const cachedRowsWithAttemptStatus = snapshot.retentions.map((row) =>
    failedVideoIds.has(String(row.videoId || ""))
     ? {
       ...row,
       retentionStatus: "failed",
       retentionSource: row.retentionSource || "youtube_analytics_v2",
       retentionLastAttemptAt: retentionAttemptedAt,
       retentionFailureCode: failureCodeByVideoId.get(String(row.videoId || "")) || "request_failed",
       retentionMetricAvailability: [],
      }
     : row,
   )
   snapshot = {
    ...snapshot,
    retentions: mergeVtSyncRowsPreservingExactIncomingFields(
     cachedRowsWithAttemptStatus,
     retentionRows,
     (row) => `${String(row.videoId || "")}|${String(row.elapsedVideoTimeRatio || "")}`,
    ) as VtSyncSnapshot["retentions"],
   }
   const retentionIssue = retentionFailures > 0
    ? `${retentionFailures} of ${targetVideoIds.length} video retention requests failed`
    : partialVideos > 0
     ? `${partialVideos} of ${targetVideoIds.length} videos returned partial retention metrics`
     : undefined
   const retentionHadTargets = targetVideoIds.length > 0
   addManifestResult(manifest, "retention", !retentionHadTargets || retentionRows.length > 0, retentionRows.length, retentionHadTargets ? [...VT_SYNC_RETENTION_METRICS] : [], retentionIssue, [...succeededMetrics])
   if (retentionRows.length) await persistDatasetRows({
    runId,
    channelId: snapshot.channelId || undefined,
    datasetId: "retentions",
    phase: "retention",
    rawRows: retentionRows,
    tableRows: snapshot.retentions as Array<Record<string, unknown>>,
    columns: ["videoId", "elapsedVideoTimeRatio", ...VT_SYNC_RETENTION_METRICS],
   })
   const retentionIsPartial = retentionFailures > 0 || partialVideos > 0
   markFreshness(["retentions"], "retention", snapshot.retentions.length, !retentionHadTargets ? "stale" : retentionRows.length > 0 ? (retentionIsPartial ? "partial" : "synced") : "failed", VT_SYNC_RETENTION_METRICS.filter((metric) => !succeededMetrics.has(metric)))
   updatePhase(progress, "retention", {
    status: !retentionHadTargets ? "skipped" : retentionRows.length > 0 ? (retentionIsPartial ? "partial" : "complete") : "failed",
    rows: retentionRows.length,
    message: selectionMessage,
    currentQueryLabel: `Retention · ${selectionMessage}`,
    nextQueryLabel: undefined,
    error: retentionIssue,
    skippedReason: !retentionHadTargets ? "No eligible long-form videos or Shorts were available for retention sync." : undefined,
    completedAt: new Date().toISOString(),
   }, onProgress)
   commitSnapshot()
  }

  const completedAt = new Date().toISOString()
  manifest.completed_at = completedAt
  manifest.stop_reason = manifest.bundles_failed?.length ? "partial" : "completed"
  snapshot = { ...snapshot, capturedAt: completedAt, syncManifest: manifest }
  commitSnapshot()
  progress.status = manifest.bundles_failed?.length ? "partial" : "complete"
  progress.completedAt = completedAt
  onProgress?.({ ...progress, phases: [...progress.phases] })
  return snapshot
 } catch (error) {
  const completedAt = new Date().toISOString()
  const googleFailure = error instanceof GoogleRequestError ? error.details : null
  manifest.completed_at = completedAt
  manifest.stop_reason = googleFailure?.reconnectRequired ? "reconnect_required" : "failed"
  manifest.failure_code = googleFailure?.code || "SYNC_FAILED"
  manifest.retryable = googleFailure?.retryable || false
  manifest.reconnect_required = googleFailure?.reconnectRequired || false
  manifest.request_id = googleFailure?.requestId || null
  manifest.bundles_failed = [...(manifest.bundles_failed || []), {
   bundle_id: "fatal_error",
   family: "vt_sync_local",
   metrics_attempted: [],
   metrics_succeeded: [],
   metrics_failed: [],
   rows_written: 0,
   success: false,
   error_reason: error instanceof Error ? error.message : String(error),
   failure_code: googleFailure?.code || "SYNC_FAILED",
   retryable: googleFailure?.retryable || false,
   reconnect_required: googleFailure?.reconnectRequired || false,
   request_id: googleFailure?.requestId || null,
  }]
  snapshot = { ...snapshot, capturedAt: completedAt, syncManifest: manifest }
  commitSnapshot()
  progress.status = "failed"
  progress.completedAt = completedAt
  progress.failureCode = googleFailure?.code || "SYNC_FAILED"
  progress.retryable = googleFailure?.retryable || false
  progress.reconnectRequired = googleFailure?.reconnectRequired || false
  progress.requestId = googleFailure?.requestId
  progress.phases = progress.phases.map((phase) => phase.status === "pending" || phase.status === "running"
   ? {
     ...phase,
     status: "skipped",
     completedAt,
     failureCode: googleFailure?.code || "SYNC_FAILED",
     retryable: googleFailure?.retryable || false,
     reconnectRequired: googleFailure?.reconnectRequired || false,
     requestId: googleFailure?.requestId,
     skippedReason: googleFailure?.reconnectRequired
      ? "Reconnect Google before this phase can run."
      : "This phase was skipped after the sync stopped.",
    }
   : phase)
  onProgress?.({ ...progress, phases: [...progress.phases] })
  throw error
 }
}
