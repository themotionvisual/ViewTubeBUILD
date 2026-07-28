import { saveVtSyncSnapshot } from "./snapshot"
import { normalizeVtSyncVideoPrivacyFormat, resolveVtSyncVideoFormat } from "./privacyPolicy"
import {
 buildVtSyncInventoryId,
 getVtSyncKnownVideoIds,
 getVtSyncChannelIndex,
 listVtSyncVideoInventory,
 putVtSyncChannelIndex,
 putVtSyncDatasetRawReport,
 putVtSyncDatasetTableRows,
 putVtSyncInventoryCursor,
 putVtSyncSyncRun,
 putVtSyncVideoInventoryRecords,
} from "./localDbRepository"
import {
 VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS,
 filterVtSyncVisibleCategoryIds,
} from "../upstream/syncCategoryRegistry"
import type {
 VtSyncAnalyticsWindow,
 VtSyncInventorySyncResult,
 VtSyncSnapshot,
 VtSyncSyncManifest,
 VtSyncVideoInventoryRecord,
 VtSyncVideoItem,
} from "./contracts"

export const VT_SYNC_SERVER_ACCOUNT_TOKEN = "__viewtube_server_account_session__"
export const VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE = 25
export const VT_SYNC_TRAFFIC_DETAIL_MAX_PAGES = 4
export const VT_SYNC_TRAFFIC_DETAIL_MAX_ROWS = VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE * VT_SYNC_TRAFFIC_DETAIL_MAX_PAGES
export const VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE = 200

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
}

export type VtSyncLocalSyncProgress = {
 runId: string
 startedAt: string
 completedAt?: string
 status: "idle" | "running" | "complete" | "partial" | "failed"
 requestedCategoryIds: string[]
 phases: VtSyncLocalSyncPhase[]
}

export type VtSyncLocalSyncOptions = {
 token: string
 selectedCategories: string[]
 previousSnapshot: VtSyncSnapshot
 /** Specific video IDs to sync retention for. Falls back to the top 25 videos by views when omitted/empty. */
 retentionVideoIds?: string[]
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const shouldSync = (selected: Set<string>, id: string) => selected.has(id)

const FULL_ANALYTICS_METRICS = [
 "views",
 "estimatedMinutesWatched",
 "averageViewDuration",
 "averageViewPercentage",
 "shares",
 "subscribersGained",
 "subscribersLost",
 "likes",
 "dislikes",
 "comments",
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
 "engagedViews",
 "videosAddedToPlaylists",
 "videosRemovedFromPlaylists",
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

const LONG_FORMAT_METRICS = [
 "cardImpressions",
 "cardClicks",
 "cardClickRate",
 "cardTeaserImpressions",
 "cardTeaserClicks",
 "cardTeaserClickRate",
]

export const GEOGRAPHY_PROVINCE_SAFE_METRICS = [
 "views",
 "engagedViews",
 "estimatedMinutesWatched",
 "averageViewDuration",
 "averageViewPercentage",
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
 let delayMs = 800
 let lastResponse: Response | null = null
 for (let attempt = 0; attempt < maxRetries; attempt += 1) {
  const res = await request()
  lastResponse = res
  if (res.ok || (res.status !== 429 && res.status < 500)) return res
  if (attempt < maxRetries - 1) await sleep(delayMs)
  delayMs *= 2
 }
 return lastResponse || request()
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
}): Promise<BundleResult> => {
 const request = async (activeMetrics: string[]) => {
  const params = new URLSearchParams({
   ids: "channel==MINE",
   startDate,
   endDate,
   metrics: activeMetrics.join(","),
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
 if (!res.ok) firstError = await res.text().catch(() => "")
 if (!res.ok && allowFallback && (res.status === 400 || res.status === 401 || res.status === 403)) {
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
// comes back short (no more rows) or the page cap is hit. Used for reports like
// insightTrafficSourceDetail whose maxResults is capped well below what a single call can return.
const runPaginatedAnalyticsBundle = async (
 options: Parameters<typeof runAnalyticsBundle>[0] & { pageSize: number; maxPages: number },
): Promise<BundleResult> => {
 const { pageSize, maxPages, ...base } = options
 const rows: Record<string, any>[] = []
 let columns: string[] = []
 let firstFailure: BundleResult | undefined
 const pageDiagnostics: NonNullable<BundleResult["pageDiagnostics"]> = []
 for (let page = 0; page < maxPages; page += 1) {
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
  rows.push(...result.rows)
  pageDiagnostics.push({
   page: page + 1,
   startIndex,
   maxResults: pageSize,
   rows: result.rows.length,
   status: result.rows.length < pageSize ? "short" : "complete",
  })
  if (result.rows.length < pageSize) break
  if (page < maxPages - 1) await sleep(150)
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
 options: Parameters<typeof runAnalyticsBundle>[0] & { pageSize: number; maxWindows: number; maxRows: number; reason: string },
): Promise<BundleResult> => {
 const { pageSize, maxWindows, maxRows, reason, ...base } = options
 const windows = buildEvenDateWindows(base.startDate || VT_SYNC_LIFETIME_START_DATE, base.endDate || reportEndDate(), maxWindows)
 const rows: Record<string, any>[] = []
 let columns: string[] = []
 const pageDiagnostics: NonNullable<BundleResult["pageDiagnostics"]> = []
 for (let index = 0; index < windows.length; index += 1) {
  const window = windows[index]
  const result = await runAnalyticsBundle({
   ...base,
   startDate: window.startDate,
   endDate: window.endDate,
   maxResults: pageSize,
   startIndex: 1,
  })
  if (result.rows) {
   columns = result.columns
   rows.push(...result.rows)
   pageDiagnostics.push({
    page: index + 1,
    startIndex: 1,
    maxResults: pageSize,
    rows: result.rows.length,
    status: result.rows.length < pageSize ? "short" : "complete",
    startDate: window.startDate,
    endDate: window.endDate,
   })
  } else {
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
 const mergedRows = mergeTrafficDetailRows(rows).slice(0, maxRows)
 return {
  rows: mergedRows,
  columns,
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
 options: Parameters<typeof runAnalyticsBundle>[0] & { pageSize: number; maxPages: number; maxRows: number },
): Promise<BundleResult> => {
 const paginated = await runPaginatedAnalyticsBundle(options)
 if (!paginated.error || !paginated.rows?.length) return paginated

 const fallback = await runWindowedTrafficDetailFallback({
  ...options,
  maxWindows: options.maxPages,
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
 datasetId,
 phase,
 rawRows,
 tableRows,
 columns,
 source = "youtube_analytics_v2",
}: {
 runId: string
 datasetId: string
 phase: string
 rawRows?: Array<Record<string, unknown>> | null
 tableRows?: Array<Record<string, unknown>> | null
 columns?: string[]
 source?: "youtube_data_v3" | "youtube_analytics_v2" | "local_import" | "derived"
}) => {
 const capturedAt = new Date().toISOString()
 try {
  if (rawRows) {
   await putVtSyncDatasetRawReport({
    id: `${runId}::${datasetId}::raw`,
    runId,
    datasetId,
    phase,
    capturedAt,
    columns: columns || [],
    rows: rawRows,
    source,
   })
  }
  if (tableRows) {
   await putVtSyncDatasetTableRows({
    id: `${runId}::${datasetId}::table`,
    runId,
    datasetId,
    phase,
    capturedAt,
    rows: tableRows,
    provenance: "api",
   })
  }
 } catch (error) {
  console.warn(`VT-SYNC IndexedDB dataset persistence failed for ${datasetId}; snapshot remains available.`, error)
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
  await putVtSyncSyncRun({
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
 for (let index = 0; index < ids.length; index += 50) {
  const chunk = ids.slice(index, index + 50)
  const params = new URLSearchParams({ part: "snippet", id: chunk.join(",") })
  const res = await fetchWithBackoff(`https://www.googleapis.com/youtube/v3/${endpoint}?${params.toString()}`, token)
  if (res.ok) {
   const data = await res.json()
   ;(data.items || []).forEach((item: any) => {
    titleById[item.id] = item.snippet?.title || item.snippet?.localized?.title || ""
    if (type === "channel") handleById[item.id] = item.snippet?.customUrl || ""
   })
  }
  if (index + 50 < ids.length) await sleep(150)
 }
 return rows.map((row) => {
  const id = String(row[idField] || "")
  return {
   ...row,
   title: titleById[id] || row.title,
   handle: handleById[id] || row.handle,
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
   const isShort = shortsIds.has(item.id)
   const isLive = item.snippet?.liveBroadcastContent === "live" || item.snippet?.liveBroadcastContent === "upcoming"
   const privacyStatus = item.status?.privacyStatus || "public"
   videos.push({
    id: item.id,
    title: item.snippet?.title || `Video ${item.id}`,
    thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.high?.url || "",
    publishedAt: item.snippet?.publishedAt || "",
    format: resolveVtSyncVideoFormat({ privacyStatus, isLive, isShort }),
    category: YOUTUBE_CATEGORY_NAMES[item.snippet?.categoryId] || item.snippet?.categoryId || "Unknown",
    tags: item.snippet?.tags || [],
    topics: (item.topicDetails?.topicCategories || []).map((url: string) => url.split("/").pop()?.replace(/_/g, " ") || url),
    privacyStatus,
    duration: item.contentDetails?.duration || "",
    definition: item.contentDetails?.definition || "",
    caption: item.contentDetails?.caption === "true" ? "Yes" : "No",
    descriptionSnippet: String(item.snippet?.description || "").split(/[.!?]/).filter(Boolean).slice(0, 3).join(". ").slice(0, 220),
    metrics: {
     views: numberOrZero(item.statistics?.viewCount),
     likes: numberOrZero(item.statistics?.likeCount),
     comments: numberOrZero(item.statistics?.commentCount),
    },
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
 const metadataById = new Map(metadataVideos.map((video) => [video.id, video]))
 const existingIds = new Set(existingVideos.map((video) => video.id))
 const merged = existingVideos.map((video) => {
  const metadata = metadataById.get(video.id)
  if (!metadata) return video
  return {
   ...video,
   ...metadata,
   metrics: {
    ...(video.metrics || {}),
    ...(metadata.metrics || {}),
   },
  }
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
  return {
   ...video,
   metrics: mergeMetricAssignments(
    video.metrics,
    stats,
    family === "long_format_cards"
     ? LONG_FORMAT_CARD_METRIC_ASSIGNMENTS
     : FULL_VIDEO_METRIC_ASSIGNMENTS,
   ),
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
 [identityKey]: row[identityKey],
 term: row.term || row[identityKey] || row.audienceType || row.creatorContentType || row.insightTrafficSourceType,
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

const channelTotalsForWindow = async (token: string, window: VtSyncAnalyticsWindow, lifetimeStartDate: string) => {
 const startDate = window === "lifetime" ? lifetimeStartDate : daysAgo(Number(window.replace("d", "")))
 const result = await runAnalyticsBundle({
  token,
  id: `channel_totals_${window}`,
  metrics: ["views", "estimatedMinutesWatched", "subscribersGained", "subscribersLost", "estimatedRevenue", "adImpressions", "engagedViews"],
  startDate,
  endDate: reportEndDate(),
  sort: "",
  maxResults: 0,
 })
 const row = result.rows?.[0] || {}
 return {
  views: numberOrZero(row.views),
  watchTime: numberOrZero(row.estimatedMinutesWatched) / 60,
  revenue: numberOrZero(row.estimatedRevenue),
  subscribers: numberOrZero(row.subscribersGained) - numberOrZero(row.subscribersLost),
  impressions: numberOrZero(row.adImpressions),
  engagedViews: numberOrZero(row.engagedViews),
 }
}

export const runVtSyncLocalSync = async ({ token, selectedCategories, previousSnapshot, retentionVideoIds, onProgress, onSnapshotCommit }: VtSyncLocalSyncOptions): Promise<VtSyncSnapshot> => {
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
   snapshot = {
    ...snapshot,
    channelId: channel.id,
    channelName: channel.snippet?.title || null,
    channelDescription: channel.snippet?.description || null,
    channelCustomUrl: channel.snippet?.customUrl || null,
    avatarUrl: channel.snippet?.thumbnails?.default?.url || channel.snippet?.thumbnails?.medium?.url || null,
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
   snapshot = {
    ...snapshot,
    videos: placeholderVideos,
    tableExports: { ...(snapshot.tableExports || {}), uploads_playlist: videoIds.map((id) => ({ videoId: id, channelId: channel.id })) },
   }
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

  if (channel && videoIds.length > 0 && shouldSync(selected, "video_metadata")) {
   updatePhase(progress, "video_metadata", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const shortsIds = await getShortsIds(token, channel.id)
   const videos = await getVideoMetadata(token, videoIds, shortsIds)
   snapshot = { ...snapshot, videos: mergeVideoMetadataById(snapshot.videos, videos) }
   addManifestResult(manifest, "video_metadata", true, videos.length, ["snippet", "contentDetails", "statistics"])
   markFreshness(["videos"], "video_metadata", snapshot.videos.length, "partial", ["youtubeAnalytics"])
   updatePhase(progress, "video_metadata", { status: "complete", rows: videos.length, completedAt: new Date().toISOString() }, onProgress)
   commitSnapshot()
  }

  if (shouldSync(selected, "videos_analytics") && snapshot.videos.length > 0) {
   updatePhase(progress, "videos_analytics", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const analyticsMap: Record<string, Record<string, any>> = {}
   let rowsWritten = 0
   let failures = 0
   const result = await runAnalyticsBundle({
    token,
    id: "video_stats",
    metrics: FULL_ANALYTICS_METRICS,
    dimensions: "video",
    sort: "-views",
    maxResults: 200,
    startDate: "2000-01-01",
   })
   if (result.rows) {
    result.rows.forEach((row) => {
     analyticsMap[String(row.video)] = row
    })
    rowsWritten += result.rows.length
   snapshot = { ...snapshot, videos: mergeVideoAnalytics(snapshot.videos, Object.values(analyticsMap)) }
   addManifestResult(manifest, "video_stats", true, result.rows.length, ["video", ...FULL_ANALYTICS_METRICS], undefined, result.columns)
    await persistDatasetRows({ runId, datasetId: "videos", phase: "videos_analytics", rawRows: result.rows, tableRows: snapshot.videos as unknown as Array<Record<string, unknown>>, columns: result.columns })
    commitSnapshot()
   } else {
    failures += 1
    addManifestResult(manifest, "video_stats", false, 0, ["video", ...FULL_ANALYTICS_METRICS], result.error)
   }

   const missingVideoIds = snapshot.videos.filter((video) => !analyticsMap[video.id]).map((video) => video.id)
   for (let index = 0; index < missingVideoIds.length; index += VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE) {
    const chunk = missingVideoIds.slice(index, index + VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE)
    const batchIndex = index / VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE
    const chunkResult = await runAnalyticsBundle({
     token,
     id: `video_stats_recent_${batchIndex}`,
     metrics: FULL_ANALYTICS_METRICS,
     dimensions: "video",
     sort: "",
     maxResults: 0,
     filters: `video==${chunk.join(",")}`,
     startDate: "2000-01-01",
    })
    if (chunkResult.rows) {
     chunkResult.rows.forEach((row) => {
      analyticsMap[String(row.video)] = row
     })
     rowsWritten += chunkResult.rows.length
     snapshot = { ...snapshot, videos: mergeVideoAnalytics(snapshot.videos, Object.values(analyticsMap)) }
     addManifestResult(manifest, `video_stats_recent_${batchIndex}`, true, chunkResult.rows.length, ["video", ...FULL_ANALYTICS_METRICS], undefined, chunkResult.columns)
     updatePhase(progress, "videos_analytics", { status: "running", rows: rowsWritten, message: `Backfilled ${Math.min(index + VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE, missingVideoIds.length)} of ${missingVideoIds.length} missing video analytics rows.` }, onProgress)
     commitSnapshot()
    } else {
     failures += 1
     addManifestResult(manifest, `video_stats_recent_${batchIndex}`, false, 0, ["video", ...FULL_ANALYTICS_METRICS], chunkResult.error)
    }
    if (index + VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE < missingVideoIds.length) await sleep(300)
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
   markFreshness(["videos"], "videos_analytics", snapshot.videos.length, failures ? "partial" : "synced", failures ? ["someVideoAnalyticsBundles"] : [])
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
   const windows: VtSyncAnalyticsWindow[] = ["7d", "28d", "90d", "365d", "lifetime"]
   const totalsEntries = await Promise.all(windows.map(async (window) => [window, await channelTotalsForWindow(token, window, channelStartDate)] as const))
   const totalsObject = Object.fromEntries(totalsEntries) as any
   snapshot = {
    ...snapshot,
    channelTotals: {
     ...totalsObject,
     last7: totalsObject["7d"],
     last28: totalsObject["28d"],
     last90: totalsObject["90d"],
     last365: totalsObject["365d"],
    },
   }
   addManifestResult(manifest, "channel_totals", true, totalsEntries.length, ["views", "estimatedMinutesWatched", "subscribersGained", "estimatedRevenue"])
   markFreshness(["channel_totals"], "channel_totals", totalsEntries.length)
   updatePhase(progress, "channel_totals", { status: "complete", rows: totalsEntries.length, completedAt: new Date().toISOString() }, onProgress)
   commitSnapshot()
  }

  if (shouldSync(selected, "daily_metrics")) {
   updatePhase(progress, "daily_metrics", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const result = await runAnalyticsBundle({ token, id: "daily_history", metrics: FULL_ANALYTICS_METRICS, dimensions: "day", sort: "-day", maxResults: 500, startDate: channelStartDate })
   const dailyAttemptedColumns = ["day", ...FULL_ANALYTICS_METRICS]
   const dailyMissingMetrics = dailyAttemptedColumns.filter((metric) => !result.columns.includes(metric))
   snapshot = {
    ...snapshot,
    dailyMetrics: (result.rows || []).map((row) => ({
     date: row.day,
     views: numberOrZero(row.views),
     watchTime: numberOrZero(row.estimatedMinutesWatched) / 60,
     revenue: numberOrUndefined(row.estimatedRevenue),
     avgViewDuration: numberOrUndefined(row.averageViewDuration),
     averagePercentageViewed: numberOrUndefined(row.averageViewPercentage),
     estimatedAdRevenue: numberOrUndefined(row.estimatedAdRevenue),
     youtubePremiumRevenue: numberOrUndefined(row.estimatedRedPartnerRevenue),
     subscribersGained: numberOrUndefined(row.subscribersGained),
     subscribersLost: numberOrUndefined(row.subscribersLost),
     adImpressions: numberOrUndefined(row.adImpressions),
     engagedViews: numberOrUndefined(row.engagedViews),
     likes: numberOrUndefined(row.likes),
     dislikes: numberOrUndefined(row.dislikes),
     comments: numberOrUndefined(row.comments),
     shares: numberOrUndefined(row.shares),
     cpm: numberOrUndefined(row.cpm),
     grossRevenue: numberOrUndefined(row.grossRevenue),
     monetizedPlaybacks: numberOrUndefined(row.monetizedPlaybacks),
     playbackBasedCpm: numberOrUndefined(row.playbackBasedCpm),
     redViews: numberOrUndefined(row.redViews),
     estimatedRedMinutesWatched: numberOrUndefined(row.estimatedRedMinutesWatched),
     cardClicks: numberOrUndefined(row.cardClicks),
     cardImpressions: numberOrUndefined(row.cardImpressions),
     cardClickRate: numberOrUndefined(row.cardClickRate),
     cardTeaserClicks: numberOrUndefined(row.cardTeaserClicks),
     cardTeaserImpressions: numberOrUndefined(row.cardTeaserImpressions),
     cardTeaserClickRate: numberOrUndefined(row.cardTeaserClickRate),
     annotationClicks: numberOrUndefined(row.annotationClicks),
     annotationImpressions: numberOrUndefined(row.annotationImpressions),
     annotationClickThroughRate: numberOrUndefined(row.annotationClickThroughRate),
     videosAddedToPlaylists: numberOrUndefined(row.videosAddedToPlaylists),
     videosRemovedFromPlaylists: numberOrUndefined(row.videosRemovedFromPlaylists),
   })),
   }
   if (result.rows) await persistDatasetRows({ runId, datasetId: "daily", phase: "daily_metrics", rawRows: result.rows, tableRows: snapshot.dailyMetrics as unknown as Array<Record<string, unknown>>, columns: result.columns })
   addManifestResult(manifest, "daily_history", !!result.rows, result.rows?.length || 0, dailyAttemptedColumns, result.error, result.columns)
   markFreshness(["daily", "weekly", "monthly"], "daily_metrics", result.rows?.length || 0, result.rows ? (dailyMissingMetrics.length ? "partial" : "synced") : "failed", dailyMissingMetrics)
   updatePhase(progress, "daily_metrics", {
    status: result.rows ? (dailyMissingMetrics.length ? "partial" : "complete") : "failed",
    rows: result.rows?.length || 0,
    error: result.error || (dailyMissingMetrics.length ? `Missing returned metrics: ${dailyMissingMetrics.join(", ")}` : undefined),
    completedAt: new Date().toISOString(),
   }, onProgress)
   commitSnapshot()
  }

  const trafficCategoryMap: Array<[string, keyof VtSyncSnapshot, string, TrafficEnrichmentType?]> = [
   ["traffic_overview", "trafficSources", ""],
   ["search_terms", "searchTerms", "YT_SEARCH"],
   ["ext_websites", "extWebsites", "EXT_URL"],
   ["traffic_subscribers", "trafficSubscriberData", "SUBSCRIBER"],
   ["suggested_videos", "suggestedVideos", "RELATED_VIDEO", "video"],
   ["hashtags", "hashtags", "HASHTAGS"],
   ["sound_pages", "soundPages", "SOUND_PAGE"],
   ["advertising", "trafficAdvertising", "ADVERTISING"],
   ["channel_pages", "trafficChannelPages", "YT_CHANNEL", "channel"],
   ["other_features", "trafficOtherFeatures", "YT_OTHER_PAGE"],
   ["traffic_shorts", "trafficShorts", "SHORTS"],
   ["traffic_browse_features", "trafficBrowseFeatures", "BROWSE"],
   ["traffic_shorts_content_link", "trafficShortsContentLink", "SHORTS_CONTENT_LINK"],
   ["traffic_campaign_card", "trafficCampaignCard", "CAMPAIGN_CARD"],
   ["traffic_card", "trafficCard", "CARD", "video"],
   ["traffic_end_screen", "trafficEndScreen", "END_SCREEN", "video"],
   ["traffic_live_redirect", "trafficLiveRedirect", "LIVE_REDIRECT", "video"],
   ["traffic_notification", "trafficNotification", "NOTIFICATION"],
   ["traffic_no_link_embedded", "trafficNoLinkEmbedded", "NO_LINK_EMBEDDED"],
   ["traffic_no_link_other", "trafficNoLinkOther", "NO_LINK_OTHER"],
   ["traffic_playlist", "trafficPlaylist", "PLAYLIST", "playlist"],
   ["traffic_yt_playlist_page", "trafficYtPlaylistPage", "YT_PLAYLIST_PAGE", "playlist"],
  ]
  const selectedTraffic = trafficCategoryMap.filter(([id]) => shouldSync(selected, id))
  if (selectedTraffic.length > 0) {
   updatePhase(progress, "traffic", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   let rowsWritten = 0
   let trafficPartial = false
   for (const [categoryId, field, sourceType, enrichType] of selectedTraffic) {
    // insightTrafficSourceDetail rejects maxResults values above ~25 with a garbled 500
    // (FIELD_UNKNOWN_VALUE on max-results) instead of a clean error, so page through it in
    // chunks of 25 (up to 4 pages / 100 rows) instead of requesting a larger page directly.
    const result = sourceType
     ? await runTrafficDetailAnalyticsBundle({
       token,
       id: categoryId,
       metrics: ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"],
       dimensions: "insightTrafficSourceDetail",
       filters: `insightTrafficSourceType==${sourceType}`,
       sort: "-views",
       startDate: channelStartDate,
       pageSize: VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE,
       maxPages: VT_SYNC_TRAFFIC_DETAIL_MAX_PAGES,
       maxRows: VT_SYNC_TRAFFIC_DETAIL_MAX_ROWS,
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
    ;(snapshot as any)[field] = mappedRows
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
       requestedRows: sourceType ? VT_SYNC_TRAFFIC_DETAIL_MAX_ROWS : result.rows?.length || 0,
       returnedRows: result.rows?.length || 0,
       pagination: result.pageDiagnostics,
       fallback: result.fallback,
       status: result.error ? "partial" : result.fallback ? "fallback_windowed" : "inspected",
       error: result.error,
      },
     ]
    }
    addManifestResult(manifest, categoryId, categoryComplete, result.rows?.length || 0, result.columns, result.error)
    if (result.rows) await persistDatasetRows({ runId, datasetId: categoryId, phase: "traffic_sync", rawRows: result.rows, tableRows: mappedRows, columns: result.columns })
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
   updatePhase(progress, "traffic", { status: trafficPartial ? "partial" : "complete", rows: rowsWritten, completedAt: new Date().toISOString() }, onProgress)
   commitSnapshot()
  }

  if (["audience_demographics", "demographics_age", "demographics_gender", "audience_watch_behavior", "new_returning_viewers", "subscription_source", "creator_content_type", "device_type", "operating_system", "playback_location", "subscription_status", "geography_country", "geography_city", "geography_province", "geography_dma"].some((id) => shouldSync(selected, id))) {
   updatePhase(progress, "segments", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   let rowsWritten = 0
   const segmentRuns: Array<[string, keyof VtSyncSnapshot, string, readonly string[], string, string?, number?]> = [
    ["audience_demographics", "demographics", "ageGroup,gender", ["viewerPercentage"], "gender,ageGroup"],
    ["demographics_age", "demographicsByAge", "ageGroup", ["viewerPercentage"], ""],
    ["demographics_gender", "demographicsByGender", "gender", ["viewerPercentage"], ""],
    ["audience_watch_behavior", "audienceWatchBehavior", "audienceType", ["views", "estimatedMinutesWatched", "averageViewDuration"], "-views"],
    ["new_returning_viewers", "newReturningViewers", "audienceType", ["views", "estimatedMinutesWatched"], "-views"],
    ["subscription_source", "subscriptionSource", "insightTrafficSourceType", ["subscribersGained", "subscribersLost"], "-subscribersGained", "", 50],
    ["creator_content_type", "creatorContentTypes", "creatorContentType", ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"], "-views"],
    ["geography_country", "geography", "country", ["engagedViews", "views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "shares", "subscribersGained", "subscribersLost", "likes", "dislikes", "comments", "estimatedRevenue", "estimatedAdRevenue", "estimatedRedPartnerRevenue"], "-views"],
    ["geography_city", "cities", "country,city", ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"], "-views"],
    ["geography_province", "provinces", "province", GEOGRAPHY_PROVINCE_SAFE_METRICS, "-views", "country==US", 50],
    ["geography_dma", "dmaRegions", "dma", ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"], "-views"],
    ["device_type", "devices", "deviceType", ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"], "-views"],
    ["operating_system", "operatingSystems", "operatingSystem", ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"], "-views"],
    ["playback_location", "playbackLocations", "insightPlaybackLocationType", ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"], "-views"],
    ["subscription_status", "subscriptionStatuses", "subscribedStatus", ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"], "-views"],
   ]
   for (const [categoryId, field, dimensions, metrics, sort, filters = "", maxResults = 200] of segmentRuns) {
    if (!shouldSync(selected, categoryId)) continue
    const result = await runAnalyticsBundle({ token, id: categoryId, metrics: [...metrics], dimensions, sort, maxResults, filters, startDate: channelStartDate })
    const mappedRows = mapSegmentRows(result.rows, dimensions.split(",").pop() || dimensions)
    ;(snapshot as any)[field] = mappedRows
    rowsWritten += result.rows?.length || 0
    addManifestResult(manifest, categoryId, !!result.rows, result.rows?.length || 0, result.columns, result.error)
    if (result.rows) await persistDatasetRows({ runId, datasetId: categoryId, phase: "segments", rawRows: result.rows, tableRows: mappedRows, columns: result.columns })
    markFreshness([categoryId], categoryId, result.rows?.length || 0, result.rows ? "synced" : "failed")
    commitSnapshot()
    await sleep(150)
   }
   updatePhase(progress, "segments", { status: "complete", rows: rowsWritten, completedAt: new Date().toISOString() }, onProgress)
   commitSnapshot()
  }

  if (["ad_type", "revenue_source", "sharing_service"].some((id) => shouldSync(selected, id))) {
   updatePhase(progress, "segments", { status: "running", startedAt: new Date().toISOString(), message: "Running revenue and sharing segments." }, onProgress)
   let rowsWritten = 0
   let segmentPartial = false
   if (shouldSync(selected, "ad_type")) {
    const result = await runAnalyticsBundle({ token, id: "ad_type", metrics: ["grossRevenue", "cpm", "adImpressions"], dimensions: "adType", sort: "-grossRevenue", maxResults: 50, startDate: channelStartDate })
    if (!result.rows || result.error) segmentPartial = true
    snapshot = { ...snapshot, adTypes: result.rows || [] }
    rowsWritten += result.rows?.length || 0
    addManifestResult(manifest, "ad_type", !!result.rows, result.rows?.length || 0, result.columns, result.error)
    if (result.rows) await persistDatasetRows({ runId, datasetId: "ads", phase: "ad_type", rawRows: result.rows, tableRows: result.rows, columns: result.columns })
    markFreshness(["ad_type"], "ad_type", result.rows?.length || 0, result.rows ? "synced" : "failed")
    commitSnapshot()
   }
   if (shouldSync(selected, "revenue_source")) {
    const result = await runAnalyticsBundle({ token, id: "revenue_source", metrics: ["estimatedRevenue", "estimatedAdRevenue", "estimatedRedPartnerRevenue"], dimensions: "day", sort: "-day", maxResults: 365, startDate: channelStartDate })
    if (!result.rows || result.error) segmentPartial = true
    snapshot = {
     ...snapshot,
     revenueSource: (result.rows || []).map((row) => ({
      day: row.day,
      revenue: numberOrZero(row.estimatedRevenue),
      adRevenue: numberOrZero(row.estimatedAdRevenue),
      redRevenue: numberOrZero(row.estimatedRedPartnerRevenue),
      estimatedRevenue: numberOrZero(row.estimatedRevenue),
      estimatedAdRevenue: numberOrZero(row.estimatedAdRevenue),
      estimatedRedPartnerRevenue: numberOrZero(row.estimatedRedPartnerRevenue),
    })),
    }
    rowsWritten += result.rows?.length || 0
    addManifestResult(manifest, "revenue_source", !!result.rows, result.rows?.length || 0, result.columns, result.error)
    if (result.rows) await persistDatasetRows({ runId, datasetId: "revenue", phase: "revenue_source", rawRows: result.rows, tableRows: snapshot.revenueSource as Array<Record<string, unknown>>, columns: result.columns })
    markFreshness(["revenue"], "revenue_source", result.rows?.length || 0, result.rows ? "synced" : "failed")
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
     maxPages: VT_SYNC_TRAFFIC_DETAIL_MAX_PAGES,
    })
    if (!result.rows || result.error) segmentPartial = true
    snapshot = {
     ...snapshot,
     sharingService: (result.rows || []).map((row) => ({
      sharingService: row.sharingService,
      term: row.sharingService,
      shares: numberOrZero(row.shares),
    })),
    }
    rowsWritten += result.rows?.length || 0
    if (result.pageDiagnostics?.length) {
     manifest.diagnostics = [
      ...(manifest.diagnostics || []),
      {
       phase: "sharing_service",
       categoryId: "sharing_service",
       requestedRows: VT_SYNC_TRAFFIC_DETAIL_MAX_ROWS,
       returnedRows: result.rows?.length || 0,
       pagination: result.pageDiagnostics,
       status: result.error ? "partial" : "inspected",
       error: result.error,
      },
     ]
    }
    addManifestResult(manifest, "sharing_service", !!result.rows, result.rows?.length || 0, result.columns, result.error)
    if (result.rows) await persistDatasetRows({ runId, datasetId: "shares", phase: "sharing_service", rawRows: result.rows, tableRows: snapshot.sharingService as Array<Record<string, unknown>>, columns: result.columns })
    markFreshness(["shares"], "sharing_service", result.rows?.length || 0, result.rows ? (result.error ? "partial" : "synced") : "failed", result.error ? [result.error] : [])
    commitSnapshot()
   }
   updatePhase(progress, "segments", { status: segmentPartial ? "partial" : "complete", rows: rowsWritten, completedAt: new Date().toISOString() }, onProgress)
   commitSnapshot()
  }

  if (shouldSync(selected, "device_os")) {
   updatePhase(progress, "device_os", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const result = await runAnalyticsBundle({ token, id: "device_os", metrics: ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage"], dimensions: "deviceType,operatingSystem", sort: "-views", maxResults: 200, startDate: channelStartDate })
   snapshot = {
    ...snapshot,
    deviceOs: (result.rows || []).map((row) => ({
     device: row.deviceType,
     operatingSystem: row.operatingSystem,
     views: numberOrZero(row.views),
     watchTime: numberOrZero(row.estimatedMinutesWatched) / 60,
     avgDuration: numberOrZero(row.averageViewDuration),
     avgPercentageViewed: numberOrZero(row.averageViewPercentage),
    })),
   }
   addManifestResult(manifest, "device_os", !!result.rows, result.rows?.length || 0, result.columns, result.error)
   if (result.rows) await persistDatasetRows({ runId, datasetId: "device_os", phase: "device_os", rawRows: result.rows, tableRows: snapshot.deviceOs as Array<Record<string, unknown>>, columns: result.columns })
   markFreshness(["device_os"], "device_os", result.rows?.length || 0, result.rows ? "synced" : "failed")
   updatePhase(progress, "device_os", { status: result.rows ? "complete" : "failed", rows: result.rows?.length || 0, error: result.error, completedAt: new Date().toISOString() }, onProgress)
   commitSnapshot()
  }

  if (shouldSync(selected, "traffic_day")) {
   updatePhase(progress, "traffic_day", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const result = await runAnalyticsBundle({ token, id: "traffic_day", metrics: ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage", "engagedViews"], dimensions: "insightTrafficSourceType,day", sort: "-day", maxResults: 0, startDate: channelStartDate })
   snapshot = {
    ...snapshot,
    trafficByDay: (result.rows || []).map((row) => ({
     term: row.insightTrafficSourceType,
     day: row.day,
     views: numberOrZero(row.views),
     watchTime: numberOrZero(row.estimatedMinutesWatched) / 60,
     avgDuration: numberOrZero(row.averageViewDuration),
     avgPercentageViewed: numberOrZero(row.averageViewPercentage),
     engagedViews: numberOrZero(row.engagedViews),
    })),
   }
   addManifestResult(manifest, "traffic_day", !!result.rows, result.rows?.length || 0, result.columns, result.error)
   if (result.rows) await persistDatasetRows({ runId, datasetId: "traffic_day", phase: "traffic_day", rawRows: result.rows, tableRows: snapshot.trafficByDay as Array<Record<string, unknown>>, columns: result.columns })
   markFreshness(["traffic_day"], "traffic_day", result.rows?.length || 0, result.rows ? "synced" : "failed")
   updatePhase(progress, "traffic_day", { status: result.rows ? "complete" : "failed", rows: result.rows?.length || 0, error: result.error, completedAt: new Date().toISOString() }, onProgress)
   commitSnapshot()
  }

  if (shouldSync(selected, "playlists_analytics")) {
   updatePhase(progress, "playlists_analytics", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const playlistMetadata = await getPlaylistMetadata(token)
   const playlistMetadataById = new Map(playlistMetadata.map((playlist) => [playlist.id, playlist]))
   addManifestResult(manifest, "playlists_metadata", true, playlistMetadata.length, ["snippet", "contentDetails", "status"])
   const result = await runAnalyticsBundle({ token, id: "playlists_analytics", metrics: ["playlistViews", "playlistEstimatedMinutesWatched", "playlistStarts", "averageTimeInPlaylist", "playlistSaves"], dimensions: "playlist", sort: "-playlistViews", maxResults: 50, startDate: channelStartDate })
   snapshot = {
    ...snapshot,
    playlistsData: (result.rows || []).map((row) => ({
     playlistId: row.playlist,
     playlist: playlistMetadataById.get(String(row.playlist))?.title || `Playlist ${row.playlist}`,
     title: playlistMetadataById.get(String(row.playlist))?.title || `Playlist ${row.playlist}`,
     description: playlistMetadataById.get(String(row.playlist))?.description || "Playlist metadata not returned by Data API.",
     publishedAt: playlistMetadataById.get(String(row.playlist))?.publishedAt || "-",
     videoCount: playlistMetadataById.get(String(row.playlist))?.videoCount ?? 0,
     privacyStatus: playlistMetadataById.get(String(row.playlist))?.privacyStatus || "unknown",
     views: numberOrZero(row.playlistViews),
     watchTime: numberOrZero(row.playlistEstimatedMinutesWatched),
     playlistStarts: numberOrZero(row.playlistStarts),
     playlistSaves: numberOrZero(row.playlistSaves),
     averageTimeInPlaylist: numberOrZero(row.averageTimeInPlaylist),
     viewsPerPlaylistStart: numberOrZero(row.playlistStarts) > 0 ? numberOrZero(row.playlistViews) / numberOrZero(row.playlistStarts) : 0,
    })),
   }
   addManifestResult(manifest, "playlists_analytics", !!result.rows, result.rows?.length || 0, result.columns, result.error)
   if (result.rows) await persistDatasetRows({ runId, datasetId: "playlists", phase: "playlists_analytics", rawRows: result.rows, tableRows: snapshot.playlistsData as Array<Record<string, unknown>>, columns: result.columns })
   markFreshness(["playlists"], "playlists_analytics", result.rows?.length || 0, result.rows ? "synced" : "failed")
   updatePhase(progress, "playlists_analytics", { status: result.rows ? "complete" : "failed", rows: result.rows?.length || 0, error: result.error, completedAt: new Date().toISOString() }, onProgress)
   commitSnapshot()
  }

  if (shouldSync(selected, "retention")) {
   updatePhase(progress, "retention", { status: "running", startedAt: new Date().toISOString() }, onProgress)
   const knownVideoIds = new Set(snapshot.videos.map((video) => video.id))
   const selectedVideoIds = (retentionVideoIds || []).filter((id) => knownVideoIds.has(id))
   const topVideoIds = selectedVideoIds.length > 0
    ? selectedVideoIds
    : [...snapshot.videos]
     .sort((a, b) => numberOrZero(b.metrics?.views) - numberOrZero(a.metrics?.views))
     .slice(0, 25)
     .map((video) => video.id)
     .filter(Boolean)
   const retentionRows: Array<Record<string, unknown>> = []
   let retentionFailures = 0
   for (const videoId of topVideoIds) {
    const result = await runAnalyticsBundle({
     token,
     id: `retention_${videoId}`,
     metrics: ["audienceWatchRatio", "relativeRetentionPerformance"],
     dimensions: "elapsedVideoTimeRatio",
     sort: "elapsedVideoTimeRatio",
     maxResults: 500,
     filters: `video==${videoId}`,
     startDate: channelStartDate,
    })
    if (result.rows) {
     retentionRows.push(...result.rows.map((row) => ({
      videoId,
      elapsedVideoTimeRatio: numberOrZero(row.elapsedVideoTimeRatio),
      audienceWatchRatio: numberOrZero(row.audienceWatchRatio),
      relativeRetentionPerformance: numberOrZero(row.relativeRetentionPerformance),
     })))
    } else {
     retentionFailures += 1
    }
   }
   snapshot = { ...snapshot, retentions: retentionRows }
   addManifestResult(manifest, "retention", retentionRows.length > 0, retentionRows.length, ["audienceWatchRatio", "relativeRetentionPerformance"], retentionFailures > 0 ? `${retentionFailures} of ${topVideoIds.length} video retention requests failed` : undefined)
   if (retentionRows.length) await persistDatasetRows({ runId, datasetId: "retentions", phase: "retention", rawRows: retentionRows, tableRows: retentionRows, columns: ["videoId", "elapsedVideoTimeRatio", "audienceWatchRatio", "relativeRetentionPerformance"] })
   markFreshness(["retentions"], "retention", retentionRows.length, retentionRows.length > 0 ? (retentionFailures > 0 ? "partial" : "synced") : "failed")
   updatePhase(progress, "retention", { status: retentionRows.length > 0 ? (retentionFailures > 0 ? "partial" : "complete") : "failed", rows: retentionRows.length, error: retentionFailures > 0 ? `${retentionFailures} of ${topVideoIds.length} video retention requests failed` : undefined, completedAt: new Date().toISOString() }, onProgress)
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
  manifest.completed_at = completedAt
  manifest.stop_reason = "failed"
  manifest.bundles_failed = [...(manifest.bundles_failed || []), {
   bundle_id: "fatal_error",
   family: "vt_sync_local",
   metrics_attempted: [],
   metrics_succeeded: [],
   metrics_failed: [],
   rows_written: 0,
   success: false,
   error_reason: error instanceof Error ? error.message : String(error),
  }]
  snapshot = { ...snapshot, capturedAt: completedAt, syncManifest: manifest }
  commitSnapshot()
  progress.status = "failed"
  progress.completedAt = completedAt
  onProgress?.({ ...progress, phases: [...progress.phases] })
  throw error
 }
}
