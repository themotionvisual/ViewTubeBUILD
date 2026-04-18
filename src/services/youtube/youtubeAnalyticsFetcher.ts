import {
 refreshTokenIfExpired,
 proxyFetch,
 handleYouTubeApiError,
 YouTubeApiError,
 ANALYTICS_URL,
} from "./youtubeApiClient"
import { logout } from "../authSession"
import { filterSupportedMetrics, AnalyticsWindow } from "../analyticsContract"
import type { SyncDiagnostics } from "../productArchitecture"

/**
 * YouTube Analytics Fetcher
 * Handles complex reporting and analytics queries from YouTube Analytics API v2.
 */

export type AnalyticsMetricGroupName =
 | "core_performance"
 | "engagement"
 | "impressions_ctr"
 | "monetization"
 | "audience_mix"

export type AnalyticsGroupFetchResult = {
 ok: boolean
 metrics: string[]
 idsTried: string[]
 error?: string
 warnings?: string[]
 rowCount?: number
}

const ANALYTICS_VIDEO_PAGE_SIZE = 200
const MAX_ANALYTICS_VIDEO_PAGES = 50

const unsupportedVideoAnalyticsMetrics = new Set<string>()
const disabledAnalyticsGroups = new Set<AnalyticsMetricGroupName>()
let creatorContentTypeFetchDisabled = false
const metricCapabilityByMetric = new Map<
 string,
 { status: "available" | "unsupported"; reasonCode?: string }
>()

const getErrorStatus = (error: unknown): number | undefined => {
 if (typeof error !== "object" || error === null) return undefined
 if (!("status" in error)) return undefined
 const status = Number((error as { status?: unknown }).status)
 return Number.isFinite(status) ? status : undefined
}

export const fetchAnalytics = async (
 startDate: string,
 endDate: string,
 channelId?: string,
 options: {
  window?: AnalyticsWindow
  targetVideoIds?: string[]
  optionalMetricsEnabled?: boolean
 } = {},
) => {
 const runDisabledMetrics = new Set<string>()
 const runMetricCapabilities = new Map<
  string,
  {
   metric: string
   status: "available" | "unsupported"
   reasonCode?: string
   source: "api"
  }
 >()
 const knownInvalidCombos = new Set<string>()
 const diagnosticsFailures: SyncDiagnostics["failureReasons"] = []
 const optionalMetricsEnabled = options.optionalMetricsEnabled !== false

 const requestCharCounts: number[] = []
 const maxRequestChars = 1900
 let splitRetries = 0

 const targetVideoIdSet = new Set(
  Array.isArray(options.targetVideoIds)
   ? options.targetVideoIds.filter((videoId): videoId is string => !!videoId)
   : [],
 )

 const metricGroups: Record<AnalyticsMetricGroupName, string[]> = {
  core_performance: [
   "views",
   "estimatedMinutesWatched",
   "averageViewDuration",
   "averageViewPercentage",
   "subscribersGained",
  ],
  engagement: [
   "likes",
   "comments",
   "shares",
   "engagedViews",
   "subscribersLost",
   "dislikes",
   "cardImpressions",
   "cardClicks",
  ],
  impressions_ctr: [
   "videoThumbnailImpressions",
   "videoThumbnailImpressionsClickRate",
  ],
  monetization: [
   "estimatedRevenue",
   "estimatedAdRevenue",
   "rpm",
   "cpm",
   "monetizedPlaybacks",
   "playbackBasedCpm",
   "adImpressions",
  ],
  audience_mix: [
   "annotationClickThroughRate",
   "annotationCloseRate",
   "redViews",
   "estimatedRedPartnerRevenue",
  ],
 }

 const scopedMetricGroups: Record<AnalyticsMetricGroupName, string[]> = {
  core_performance: filterSupportedMetrics(
   metricGroups.core_performance,
   "youtube_analytics_v2",
   "video",
  ),
  engagement: filterSupportedMetrics(
   metricGroups.engagement,
   "youtube_analytics_v2",
   "video",
  ),
  impressions_ctr: [...metricGroups.impressions_ctr],
  monetization: filterSupportedMetrics(
   metricGroups.monetization,
   "youtube_analytics_v2",
   "video",
  ),
  audience_mix: filterSupportedMetrics(
   metricGroups.audience_mix,
   "youtube_analytics_v2",
   "video",
  ),
 }

 const filteredMetricGroups: Record<AnalyticsMetricGroupName, string[]> = {
  core_performance: scopedMetricGroups.core_performance.filter(
   (metric) =>
    !unsupportedVideoAnalyticsMetrics.has(metric) &&
    !runDisabledMetrics.has(metric),
  ),
  engagement: scopedMetricGroups.engagement.filter(
   (metric) =>
    !unsupportedVideoAnalyticsMetrics.has(metric) &&
    !runDisabledMetrics.has(metric),
  ),
  impressions_ctr: scopedMetricGroups.impressions_ctr.filter(
   (metric) =>
    !unsupportedVideoAnalyticsMetrics.has(metric) &&
    !runDisabledMetrics.has(metric),
  ),
  monetization: scopedMetricGroups.monetization.filter(
   (metric) =>
    !unsupportedVideoAnalyticsMetrics.has(metric) &&
    !runDisabledMetrics.has(metric),
  ),
  audience_mix: scopedMetricGroups.audience_mix.filter(
   (metric) =>
    !unsupportedVideoAnalyticsMetrics.has(metric) &&
    !runDisabledMetrics.has(metric),
  ),
 }

 if (disabledAnalyticsGroups.size > 0) {
  ;(Object.keys(filteredMetricGroups) as AnalyticsMetricGroupName[]).forEach(
   (groupName) => {
    if (disabledAnalyticsGroups.has(groupName)) {
     filteredMetricGroups[groupName] = []
    }
   },
  )
 }

 if (!optionalMetricsEnabled) {
  filteredMetricGroups.impressions_ctr = []
  metricGroups.impressions_ctr.forEach((metric) =>
   runDisabledMetrics.add(metric),
  )
 }

 const urlIdsForFiltered = channelId ? `channel==${channelId}` : "channel==MINE"
 const maxMetricsString = (
  Object.values(filteredMetricGroups) as string[][]
 ).reduce((currentMax, metrics) => {
  const safeMetrics = Array.from(new Set(["views", ...metrics]))
  const asString = safeMetrics.join(",")
  return asString.length > currentMax.length ? asString : currentMax
 }, "views")

 const buildVideoFilterCandidates = (videoIds: string[]): string[] => {
  if (videoIds.length === 0) return []
  const basePrefix = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${urlIdsForFiltered}&startDate=${startDate}&endDate=${endDate}&metrics=${maxMetricsString}&dimensions=video&filters=`
  const baseSuffix = `&maxResults=${ANALYTICS_VIDEO_PAGE_SIZE}`
  const candidates: string[] = []
  let current: string[] = []
  const flush = () => {
   if (current.length === 0) return
   candidates.push(`video==${current.join(",")}`)
   current = []
  }
  for (const videoId of videoIds) {
   const next = current.length === 0 ? [videoId] : [...current, videoId]
   const filterValue = `video==${next.join(",")}`
   const encoded = encodeURIComponent(filterValue)
   const nextUrlLen = basePrefix.length + encoded.length + baseSuffix.length
   if (nextUrlLen > maxRequestChars && current.length > 0) {
    flush()
    current = [videoId]
    continue
   }
   current = next
  }
  flush()
  return candidates
 }

 const idCandidates: string[] = []
 if (targetVideoIdSet.size > 0) {
  idCandidates.push(...buildVideoFilterCandidates(Array.from(targetVideoIdSet)))
 } else {
  idCandidates.push(channelId ? `channel==${channelId}` : "channel==MINE")
 }

 const fetchVideoReportPage = async (
  ids: string,
  metrics: string[],
  startIndex = 1,
 ): Promise<any> => {
  const safeMetrics = Array.from(
   new Set(["views", ...metrics.filter((m) => m !== "creatorContentType")]),
  )
  const isVideoFilter = ids.startsWith("video==")
  const urlIds = isVideoFilter ? urlIdsForFiltered : ids
  const filters = isVideoFilter ? `&filters=${encodeURIComponent(ids)}` : ""
  const includeContentType =
   isVideoFilter && metrics.includes("creatorContentType")
  const dims = includeContentType ? "video,creatorContentType" : "video"
  const baseUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${urlIds}&startDate=${startDate}&endDate=${endDate}&metrics=${safeMetrics.join(",")}&dimensions=${dims}${filters}&maxResults=${ANALYTICS_VIDEO_PAGE_SIZE}`
  const url = isVideoFilter
   ? baseUrl
   : `${baseUrl}&startIndex=${startIndex}&sort=-views`
  requestCharCounts.push(url.length)
  const token = await refreshTokenIfExpired()
  const response = await proxyFetch(url, {
   headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
   let message = `HTTP ${response.status}`
   try {
    const errorData = await response.json()
    message =
     errorData?.error?.message ||
     errorData?.error_description ||
     response.statusText ||
     message
   } catch {
    message = response.statusText || message
   }
   const error = new Error(message) as Error & { status?: number }
   error.status = response.status
   throw error
  }
  const payload = await response.json()
  if (
   !payload ||
   !Array.isArray(payload.columnHeaders) ||
   !Array.isArray(payload.rows)
  ) {
   return { columnHeaders: [], rows: [] }
  }
  return payload
 }

 const flattenReportPayloads = (payloadList: any[]): any => {
  const rowsOut: unknown[][] = []
  let headersOut: Array<{ name: string }> = []
  payloadList.forEach((payload) => {
   if (
    !payload ||
    !Array.isArray(payload.rows) ||
    !Array.isArray(payload.columnHeaders)
   ) {
    return
   }
   if (headersOut.length === 0) {
    headersOut = payload.columnHeaders.map((header: any) => ({
     name: String(header?.name || ""),
    }))
   }
   payload.rows.forEach((row: unknown) => {
    if (Array.isArray(row)) rowsOut.push(row)
   })
  })
  return { columnHeaders: headersOut, rows: rowsOut }
 }

 const fetchVideoReport = async (
  ids: string,
  metrics: string[],
 ): Promise<any> => {
  const isVideoFilter = ids.startsWith("video==")
  if (isVideoFilter) {
   const payload = await fetchVideoReportPage(ids, metrics, 1)
   return flattenReportPayloads([payload])
  }
  const payloadPages: any[] = []
  let startIndex = 1
  const remainingTargets = new Set(targetVideoIdSet)
  const maxPages = MAX_ANALYTICS_VIDEO_PAGES
  for (let page = 0; page < maxPages; page += 1) {
   let payload: any
   try {
    payload = await fetchVideoReportPage(ids, metrics, startIndex)
   } catch (error) {
    const status = getErrorStatus(error)
    if (page > 0 && status === 400) break
    throw error
   }
   payloadPages.push(payload)
   if (remainingTargets.size > 0) {
    const headers = (payload?.columnHeaders || []).map((header: any) =>
     String(header?.name || "").toLowerCase(),
    )
    const videoIdx = headers.findIndex(
     (header: string) => header === "video" || header === "videoid",
    )
    if (videoIdx >= 0 && Array.isArray(payload?.rows)) {
     payload.rows.forEach((row: unknown) => {
      if (!Array.isArray(row)) return
      const rowVideoId = String(row[videoIdx] || "")
      if (!rowVideoId) return
      remainingTargets.delete(rowVideoId)
     })
    }
   }
   const rowCount = Array.isArray(payload?.rows) ? payload.rows.length : 0
   if (
    rowCount <= 0 ||
    rowCount < ANALYTICS_VIDEO_PAGE_SIZE ||
    remainingTargets.size === 0
   ) {
    break
   }
   startIndex += rowCount
  }
  return flattenReportPayloads(payloadPages)
 }

 const parseVideoFilterIds = (filter: string): string[] | null => {
  if (!filter.startsWith("video==")) return null
  const raw = filter.slice("video==".length)
  const ids = raw
   .split(",")
   .map((id) => id.trim())
   .filter(Boolean)
  return ids.length > 0 ? ids : null
 }

 const fetchVideoReportWithSplitRetries = async (
  ids: string,
  metrics: string[],
  depth = 0,
  allowSplitOn400 = true,
 ): Promise<any> => {
  const hasImpressionMetrics = metrics.some(
   (m) =>
    m.includes("Impressions") ||
    m.includes("clickThroughRate") ||
    m.includes("ClickRate"),
  )
  if (hasImpressionMetrics && ids === "channel==MINE") {
   const error: any = new Error(
    "Invalid dimension/metric combination with channel==MINE",
   )
   error.status = 400
   throw error
  }
  try {
   return await fetchVideoReport(ids, metrics)
  } catch (error) {
   const status = getErrorStatus(error)
   if (status === 401) {
    console.warn("YouTube API returned 401 Unauthorized. Session is invalid.")
    try {
     logout()
    } catch {}
    throw new Error(
     "Your YouTube session has expired. Please reconnect in Settings.",
    )
   }
   const filterIds = parseVideoFilterIds(ids)
   if (
    allowSplitOn400 &&
    status === 400 &&
    filterIds &&
    filterIds.length > 1 &&
    depth < 10
   ) {
    splitRetries += 1
    const mid = Math.ceil(filterIds.length / 2)
    const left = `video==${filterIds.slice(0, mid).join(",")}`
    const right = `video==${filterIds.slice(mid).join(",")}`
    const payloads: any[] = []
    let lastError: unknown = error
    try {
     payloads.push(
      await fetchVideoReportWithSplitRetries(
       left,
       metrics,
       depth + 1,
       allowSplitOn400,
      ),
     )
    } catch (leftError) {
     lastError = leftError
    }
    try {
     payloads.push(
      await fetchVideoReportWithSplitRetries(
       right,
       metrics,
       depth + 1,
       allowSplitOn400,
      ),
     )
    } catch (rightError) {
     lastError = rightError
    }
    if (payloads.length > 0) {
     return flattenReportPayloads(payloads)
    }
    throw lastError
   }
   throw error
  }
 }

 const groupResults: Record<
  AnalyticsMetricGroupName,
  AnalyticsGroupFetchResult
 > = {
  core_performance: {
   ok: false,
   metrics: filteredMetricGroups.core_performance,
   idsTried: [],
  },
  engagement: {
   ok: false,
   metrics: filteredMetricGroups.engagement,
   idsTried: [],
  },
  impressions_ctr: {
   ok: false,
   metrics: filteredMetricGroups.impressions_ctr,
   idsTried: [],
  },
  monetization: {
   ok: false,
   metrics: filteredMetricGroups.monetization,
   idsTried: [],
  },
  audience_mix: {
   ok: false,
   metrics: filteredMetricGroups.audience_mix,
   idsTried: [],
  },
 }

 const payloads: Partial<Record<AnalyticsMetricGroupName, any[]>> = {}
 const groupNames = Object.keys(
  filteredMetricGroups,
 ) as AnalyticsMetricGroupName[]
 for (const groupName of groupNames) {
  const metrics = filteredMetricGroups[groupName]
  const errors: string[] = []
  const aggregatedPayloads: any[] = []
  const aggregatedWarnings: string[] = []
  if (metrics.length === 0) {
   groupResults[groupName].ok = true
   if (groupName === "impressions_ctr" && !optionalMetricsEnabled) {
    groupResults[groupName].warnings = [
     "Skipped: optional thumbnail impressions/CTR metrics are disabled (opt-in only).",
    ]
   } else {
    groupResults[groupName].warnings = disabledAnalyticsGroups.has(groupName)
     ? [
        "Skipped: metric group disabled for this session due to repeated API errors.",
       ]
     : ["No supported metrics for youtube_analytics_v2 + video scope."]
   }
   continue
  }
  const groupIdCandidates =
   groupName === "impressions_ctr"
    ? idCandidates.filter((c) => c.startsWith("video=="))
    : idCandidates
  if (groupName === "impressions_ctr" && groupIdCandidates.length === 0) {
   groupResults[groupName].ok = true
   groupResults[groupName].warnings = [
    "Skipped: No video IDs provided for chunking impression metrics.",
   ]
   continue
  }
  for (const ids of groupIdCandidates) {
   const activeMetrics = metrics.filter(
    (metric) =>
     !unsupportedVideoAnalyticsMetrics.has(metric) &&
     !runDisabledMetrics.has(metric),
   )
   if (activeMetrics.length === 0) {
    groupResults[groupName].ok = true
    if (aggregatedWarnings.length === 0) {
     aggregatedWarnings.push(
      "All metrics in this group were marked unsupported for this sync.",
     )
    }
    break
   }
   groupResults[groupName].idsTried.push(ids)
   if (groupName === "impressions_ctr") {
    const metricPayloads: any[] = []
    const metricWarnings: string[] = []
    const metricsToTry = Array.from(new Set(activeMetrics))
    for (const metric of metricsToTry) {
     const knownCapability = metricCapabilityByMetric.get(metric)
     if (knownCapability?.status === "unsupported") {
      runMetricCapabilities.set(metric, {
       metric,
       status: "unsupported",
       reasonCode: knownCapability.reasonCode || "api_unsupported",
       source: "api",
      })
      continue
     }
     try {
      const payload = await fetchVideoReportWithSplitRetries(
       ids,
       [metric],
       0,
       false,
      )
      metricPayloads.push(payload)
      metricCapabilityByMetric.set(metric, { status: "available" })
      runMetricCapabilities.set(metric, {
       metric,
       status: "available",
       source: "api",
      })
     } catch (metricError) {
      const metricErrorMessage =
       metricError instanceof Error ? metricError.message : String(metricError)
      const metricStatus = getErrorStatus(metricError)
      diagnosticsFailures.push({
       group: groupName,
       ids,
       metrics: [metric],
       status: metricStatus,
       reason: metricErrorMessage,
      })
      const reasonCode =
       metricStatus === 400 ? "api_unsupported" : "api_request_failed"
      metricWarnings.push(`${metric}: ${metricErrorMessage}`)
      metricCapabilityByMetric.set(metric, {
       status: "unsupported",
       reasonCode,
      })
      runMetricCapabilities.set(metric, {
       metric,
       status: "unsupported",
       reasonCode,
       source: "api",
      })
      if (metricStatus === 400) {
       unsupportedVideoAnalyticsMetrics.add(metric)
       runDisabledMetrics.add(metric)
      }
     }
    }
    if (metricPayloads.length > 0) {
     aggregatedPayloads.push(flattenReportPayloads(metricPayloads))
     groupResults[groupName].ok = true
    } else {
     groupResults[groupName].ok = false
    }
    if (metricWarnings.length > 0) {
     aggregatedWarnings.push(...metricWarnings)
    }
    continue
   }
   const comboKey = `${groupName}::${ids}::${activeMetrics.join(",")}`
   if (knownInvalidCombos.has(comboKey)) continue
   try {
    const payload = await fetchVideoReportWithSplitRetries(
     ids,
     activeMetrics,
     0,
     true,
    )
    aggregatedPayloads.push(payload)
    groupResults[groupName].ok = true
    continue
   } catch (error) {
    const combinedError = error instanceof Error ? error.message : String(error)
    errors.push(combinedError)
    const status = getErrorStatus(error)
    diagnosticsFailures.push({
     group: groupName,
     ids,
     metrics: activeMetrics,
     status,
     reason: combinedError,
    })
    if (status === 400) knownInvalidCombos.add(comboKey)
    if (activeMetrics.length <= 1) {
     if (status === 400)
      activeMetrics.forEach((metric) => runDisabledMetrics.add(metric))
     continue
    }
    const metricPayloads: any[] = []
    const metricWarnings: string[] = []
    for (const metric of activeMetrics) {
     try {
      const metricPayload = await fetchVideoReportWithSplitRetries(
       ids,
       [metric],
       0,
       true,
      )
      metricPayloads.push(metricPayload)
     } catch (metricError) {
      const metricErrorMessage =
       metricError instanceof Error ? metricError.message : String(metricError)
      metricWarnings.push(`${metric}: ${metricErrorMessage}`)
      const metricStatus = getErrorStatus(metricError)
      diagnosticsFailures.push({
       group: groupName,
       ids,
       metrics: [metric],
       status: metricStatus,
       reason: metricErrorMessage,
      })
      if (metricStatus === 400) {
       unsupportedVideoAnalyticsMetrics.add(metric)
       runDisabledMetrics.add(metric)
       metricCapabilityByMetric.set(metric, {
        status: "unsupported",
        reasonCode: "api_unsupported",
       })
       runMetricCapabilities.set(metric, {
        metric,
        status: "unsupported",
        reasonCode: "api_unsupported",
        source: "api",
       })
       knownInvalidCombos.add(`${groupName}::${ids}::${metric}`)
      }
     }
    }
    if (metricPayloads.length > 0) {
     aggregatedPayloads.push(flattenReportPayloads(metricPayloads))
     groupResults[groupName].ok = true
     if (metricWarnings.length > 0) aggregatedWarnings.push(...metricWarnings)
     continue
    }
    if (metricWarnings.length > 0) errors.push(...metricWarnings)
   }
  }
  if (aggregatedPayloads.length > 0) {
   payloads[groupName] = aggregatedPayloads
   groupResults[groupName].rowCount = aggregatedPayloads.reduce(
    (sum, payload) => {
     const count = Array.isArray(payload?.rows) ? payload.rows.length : 0
     return sum + count
    },
    0,
   )
  }
  if (aggregatedWarnings.length > 0)
   groupResults[groupName].warnings = aggregatedWarnings
  if (!groupResults[groupName].ok)
   groupResults[groupName].error =
    errors[errors.length - 1] || "No successful response"
 }

 const byVideo = new Map<string, Record<string, unknown>>()
 const mergePayloadIntoRows = (payload: any) => {
  if (
   !payload ||
   !Array.isArray(payload.columnHeaders) ||
   !Array.isArray(payload.rows)
  )
   return
  const headers = payload.columnHeaders.map((header: any) =>
   String(header?.name || ""),
  )
  const normalizedHeaders = headers.map((header: string) =>
   header.toLowerCase(),
  )
  const videoIdx = normalizedHeaders.findIndex(
   (header: string) => header === "video" || header === "videoid",
  )
  if (videoIdx < 0) return
  payload.rows.forEach((rowValues: unknown) => {
   if (!Array.isArray(rowValues)) return
   const videoId = String(rowValues[videoIdx] || "")
   if (!videoId) return
   const existing = byVideo.get(videoId) || { video: videoId }
   headers.forEach((header: string, idx: number) => {
    if (!header) return
    existing[header] = rowValues[idx]
   })
   byVideo.set(videoId, existing)
  })
 }

 groupNames.forEach((groupName) => {
  const groupPayloads = payloads[groupName] || []
  groupPayloads.forEach((payload) => mergePayloadIntoRows(payload))
 })

 const rowObjects = Array.from(byVideo.values())
 const discoveredHeaders = new Set<string>(["video"])
 rowObjects.forEach((row) => {
  Object.keys(row).forEach((header) => {
   if (header) discoveredHeaders.add(header)
  })
 })
 const orderedHeaders = Array.from(discoveredHeaders)
 const columnHeaders = orderedHeaders.map((name) => ({ name }))
 const rows = rowObjects.map((row) =>
  orderedHeaders.map((header) => row[header] ?? null),
 )
 const viewsIndex = orderedHeaders.findIndex(
  (header) => header.toLowerCase() === "views",
 )
 if (viewsIndex >= 0) {
  rows.sort((a, b) => Number(b[viewsIndex] || 0) - Number(a[viewsIndex] || 0))
 }

 const report = { columnHeaders, rows }
 const window = options.window || "lifetime"
 const diagnostics: SyncDiagnostics = {
  attemptedGroups: Object.fromEntries(
   groupNames.map((groupName) => [
    groupName,
    {
     metricsAttempted: groupResults[groupName].metrics,
     idsTried: groupResults[groupName].idsTried.length,
     failedAttempts: diagnosticsFailures.filter(
      (failure) => failure.group === groupName,
     ).length,
     rowsReturned: groupResults[groupName].rowCount || 0,
    },
   ]),
  ),
  disabledMetrics: Array.from(
   new Set([...runDisabledMetrics, ...unsupportedVideoAnalyticsMetrics]),
  ),
  failureReasons: diagnosticsFailures,
  knownInvalidCombos: Array.from(knownInvalidCombos),
  splitRetries,
  maxRequestChars,
  requestCharCounts,
 }

 return {
  window,
  startDate,
  endDate,
  groups: groupResults,
  syncDiagnostics: diagnostics,
  metricCapabilities: Array.from(runMetricCapabilities.values()),
  report,
  columnHeaders: report.columnHeaders,
  rows: report.rows,
 }
}

export const fetchVideoContentType = async (
 startDate: string,
 endDate: string,
 channelId?: string,
): Promise<Map<string, string>> => {
 if (creatorContentTypeFetchDisabled) return new Map()
 const token = await refreshTokenIfExpired()
 if (!token) return new Map()
 const idCandidates = channelId
  ? [`channel==${channelId}`, "channel==MINE"]
  : ["channel==MINE"]
 try {
  let data: any = null
  for (const idParam of idCandidates) {
   const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}&metrics=views&dimensions=video,creatorContentType&maxResults=200&sort=-views`
   const response = await proxyFetch(url, {
    headers: { Authorization: `Bearer ${token}` },
   })
   if (!response.ok) continue
   const payload = await response.json()
   if (payload?.rows?.length) {
    data = payload
    break
   }
  }
  if (!data) {
   creatorContentTypeFetchDisabled = true
   console.warn(
    "Failed to fetch creatorContentType from Analytics API; disabling for this session.",
   )
   return new Map()
  }
  const contentTypeMap = new Map<string, string>()
  if (Array.isArray(data.rows)) {
   const headers = (data.columnHeaders || []).map((h: any) =>
    String(h.name || "").toLowerCase(),
   )
   const videoIdx = headers.findIndex(
    (h: string) => h === "video" || h === "videoid",
   )
   const contentTypeIdx = headers.findIndex(
    (h: string) => h === "creatorcontenttype",
   )
   if (videoIdx >= 0 && contentTypeIdx >= 0) {
    data.rows.forEach((row: any[]) => {
     const videoId = String(row[videoIdx] || "")
     const contentType = String(row[contentTypeIdx] || "").toLowerCase()
     if (videoId) contentTypeMap.set(videoId, contentType)
    })
   }
  }
  return contentTypeMap
 } catch (error) {
  creatorContentTypeFetchDisabled = true
  console.warn(
   "Error fetching creatorContentType; disabling for this session:",
   error,
  )
  return new Map()
 }
}

export const fetchChannelAnalytics = async (
 startDate: string,
 endDate: string,
 channelId?: string,
) => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )
 const idParam = channelId ? `channel==${channelId}` : "channel==MINE"
 const metrics =
  "views,estimatedMinutesWatched,subscribersGained,likes,comments,shares,estimatedRevenue,adImpressions,cpm,monetizedPlaybacks,playbackBasedCpm"
 const url = `${ANALYTICS_URL}/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}&metrics=${metrics}&dimensions=day`
 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to fetch channel analytics")
 return response.json()
}

export const fetchDemographicAnalytics = async (
 startDate: string,
 endDate: string,
 channelId?: string,
) => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )
 const idParam = channelId ? `channel==${channelId}` : "channel==MINE"
 const url = `${ANALYTICS_URL}/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}&metrics=viewerPercentage&dimensions=ageGroup,gender`
 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to fetch demographic analytics")
 return response.json()
}

export const fetchTrafficSourceAnalytics = async (
 startDate: string,
 endDate: string,
 channelId?: string,
) => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )
 const idParam = channelId ? `channel==${channelId}` : "channel==MINE"
 const url = `${ANALYTICS_URL}/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}&metrics=views&dimensions=insightTrafficSourceType`
 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok)
  await handleYouTubeApiError(
   response,
   "Failed to fetch traffic source analytics",
  )
 return response.json()
}

export const fetchDailyAnalytics = async (
 startDate: string,
 endDate: string,
 channelId?: string,
) => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )
 const idParam = channelId ? `channel==${channelId}` : "channel==MINE"
 const metrics =
  "views,estimatedMinutesWatched,subscribersGained,estimatedRevenue,likes,comments,shares,adImpressions,cpm,monetizedPlaybacks"
 const url = `${ANALYTICS_URL}/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}&metrics=${metrics}&dimensions=day`
 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to fetch daily analytics")
 return response.json()
}

export const fetchGlobalLifetimeAnalytics = async (
 startDate: string,
 endDate: string,
 channelId?: string,
) => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )
 const idParam = channelId ? `channel==${channelId}` : "channel==MINE"
 const url = `${ANALYTICS_URL}/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,subscribersGained,subscribersLost,likes,comments,shares,estimatedRevenue`
 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok)
  await handleYouTubeApiError(
   response,
   "Failed to fetch global lifetime analytics",
  )
 return response.json()
}

export const fetchGeographyAnalytics = async (
 startDate: string,
 endDate: string,
 channelId?: string,
) => {
 const token = await refreshTokenIfExpired()
 if (!token)
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )
 const idParam = channelId ? `channel==${channelId}` : "channel==MINE"
 const url = `${ANALYTICS_URL}/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewDuration&dimensions=country`
 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok)
  await handleYouTubeApiError(response, "Failed to fetch geography analytics")
 return response.json()
}

// --- Additional Analytics Methods from YouTubeService ---

export const getChannelAnalytics = async (startDate: string, endDate: string) => {
 const metrics = [
  "views",
  "estimatedMinutesWatched",
  "averageViewDuration",
  "subscribersGained",
  "subscribersLost",
  "likes",
  "dislikes",
  "comments",
  "shares",
  "estimatedRevenue",
  "monetizedPlaybacks",
  "adImpressions",
  "cpm",
  "playbackBasedCpm",
 ].join(",")

 const url =
  `${ANALYTICS_URL}/reports?` +
  `ids=channel==MINE&` +
  `startDate=${startDate}&` +
  `endDate=${endDate}&` +
  `metrics=${metrics}&` +
  `dimensions=day&` +
  `sort=day`

 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(url, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
 })
 if (!response.ok) await handleYouTubeApiError(response, "Failed to fetch channel analytics")
 return response.json()
}

export const getVideoAnalytics = async (
 videoIds: string[],
 startDate: string,
 endDate: string,
) => {
 const metrics =
  "views,estimatedMinutesWatched,averageViewDuration,likes,subscribersGained,estimatedRevenue,videoThumbnailImpressions,videoThumbnailImpressionsClickRate,adImpressions,cpm,monetizedPlaybacks"

 const url =
  `${ANALYTICS_URL}/reports?` +
  `ids=channel==MINE&` +
  `startDate=${startDate}&` +
  `endDate=${endDate}&` +
  `metrics=${metrics}&` +
  `filters=${encodeURIComponent(`video==${videoIds.join(",")}`)}&` +
  `dimensions=video`
 
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(url, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
 })
 if (!response.ok) await handleYouTubeApiError(response, "Failed to fetch video analytics")
 return response.json()
}

export const fetchSingleVideoAnalytics = async (videoId: string) => {
 const endDate = new Date().toISOString().split("T")[0]
 const startDate = "2000-01-01"
 const metrics =
  "shares,averageViewPercentage,annotationClickThroughRate,estimatedRevenue"

 try {
  const url = `${ANALYTICS_URL}/reports?ids=channel==MINE&filters=${encodeURIComponent(
   `video==${videoId}`,
  )}&startDate=${startDate}&endDate=${endDate}&metrics=${metrics}`
  
  const token = await refreshTokenIfExpired()
  const response = await proxyFetch(url, {
   headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  
  if (!response.ok) return null
  const data = await response.json()
  
  if (data.rows && data.rows.length > 0) {
   const row = data.rows[0]
   return {
    shares: row[0].toString(),
    averageViewPercentage: row[1].toFixed(1),
    clickThroughRate: row[2] ? row[2].toFixed(1) + "%" : "N/A",
    estimatedRevenue: row[3] ? row[3].toFixed(2) : "0.00",
   }
  }
 } catch (e) {
  console.warn("Deep analytics failed", e)
 }
 return null
}
