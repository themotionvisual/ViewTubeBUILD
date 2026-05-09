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
 | "end_screen"

export type AnalyticsGroupFetchResult = {
 ok: boolean
 metrics: string[]
 idsTried: string[]
 error?: string
 warnings?: string[]
 rowCount?: number
}

type AnalyticsRequestClass =
 | "video_filter_chunk"
 | "video_top_videos_channel_filter"
 | "channel_creator_content_type"

export type VideoContentTypeSyncStatus = {
 status: "available" | "quarantined"
 requestClass: "channel_creator_content_type"
 idsTried: string[]
 disabledForSession: boolean
 rowCount: number
 reason?: string
 fetchedAt: number
}

export type VideoContentTypeFetchResult = {
 map: Map<string, string>
 status: VideoContentTypeSyncStatus
}

const ANALYTICS_VIDEO_PAGE_SIZE = 200
const MAX_ANALYTICS_VIDEO_PAGES = 50
const MAX_VIDEO_IDS_PER_FILTER = 25

const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
 if (chunkSize <= 0) return [items]
 const chunks: T[][] = []
 for (let index = 0; index < items.length; index += chunkSize) {
  chunks.push(items.slice(index, index + chunkSize))
 }
 return chunks
}

const unsupportedVideoAnalyticsMetrics = new Set<string>()
const disabledAnalyticsGroups = new Set<AnalyticsMetricGroupName>()
let creatorContentTypeFetchDisabled = false
const metricCapabilityByMetric = new Map<
 string,
 {
  status:
   | "available"
   | "unsupported_for_dimension"
   | "missing_scope"
   | "temporarily_blocked"
   | "api_request_failed"
  reasonCode?: string
 }
>()

const VIDEO_METRIC_GROUPS: Record<AnalyticsMetricGroupName, string[]> = {
 core_performance: [
  "views",
  "estimatedMinutesWatched",
  "averageViewDuration",
  "averageViewPercentage",
  "subscribersGained",
  "estimatedRedMinutesWatched",
 ],
 engagement: [
  "likes",
  "comments",
  "shares",
  "engagedViews",
  "subscribersLost",
  "dislikes",
  "videosAddedToPlaylists",
  "videosRemovedFromPlaylists",
 ],
 impressions_ctr: [
  "videoThumbnailImpressions",
  "videoThumbnailImpressionsClickRate",
 ],
 monetization: [
  "estimatedRevenue",
  "estimatedAdRevenue",
  "grossRevenue",
  "rpm",
  "cpm",
  "monetizedPlaybacks",
  "playbackBasedCpm",
  "adImpressions",
  "estimatedRedPartnerRevenue",
 ],
 audience_mix: [
  "annotationClickThroughRate",
  "annotationCloseRate",
  "annotationImpressions",
  "annotationClickableImpressions",
  "annotationClosableImpressions",
  "annotationClicks",
  "annotationCloses",
  "cardClickRate",
  "cardImpressions",
  "cardClicks",
  "cardTeaserImpressions",
  "cardTeaserClicks",
  "cardTeaserClickRate",
 ],
 end_screen: [
 ],
}

export const buildScopedVideoMetricGroups = (): Record<
 AnalyticsMetricGroupName,
 string[]
> => ({
 core_performance: filterSupportedMetrics(
  VIDEO_METRIC_GROUPS.core_performance,
  "youtube_analytics_v2",
  "video",
 ),
 engagement: filterSupportedMetrics(
  VIDEO_METRIC_GROUPS.engagement,
  "youtube_analytics_v2",
  "video",
 ),
 impressions_ctr: filterSupportedMetrics(
  VIDEO_METRIC_GROUPS.impressions_ctr,
  "youtube_analytics_v2",
  "video",
 ),
 monetization: filterSupportedMetrics(
  VIDEO_METRIC_GROUPS.monetization,
  "youtube_analytics_v2",
  "video",
 ),
 audience_mix: filterSupportedMetrics(
  VIDEO_METRIC_GROUPS.audience_mix,
  "youtube_analytics_v2",
  "video",
 ),
 end_screen: filterSupportedMetrics(
  VIDEO_METRIC_GROUPS.end_screen,
  "youtube_analytics_v2",
  "video",
 ),
})

const getErrorStatus = (error: unknown): number | undefined => {
 if (typeof error !== "object" || error === null) return undefined
 if (!("status" in error)) return undefined
 const status = Number((error as { status?: unknown }).status)
 return Number.isFinite(status) ? status : undefined
}

export const getAnalyticsRequestClass = (
 ids: string,
 metrics: string[],
): AnalyticsRequestClass => {
 if (metrics.includes("creatorContentType")) {
  return "channel_creator_content_type"
 }
 return ids.startsWith("video==")
  ? "video_filter_chunk"
  : "video_top_videos_channel_filter"
}

export const buildChannelScopedVideoIdCandidates = (
 channelId?: string,
): string[] =>
 Array.from(
  new Set(
   channelId ? ["channel==MINE", `channel==${channelId}`] : ["channel==MINE"],
  ),
 )

const THUMBNAIL_VIDEO_METRICS = new Set<string>([
 "videoThumbnailImpressions",
 "videoThumbnailImpressionsClickRate",
])
const SESSION_KNOWN_INVALID_COMBOS = new Set<string>()

export const shouldForceViewsMetric = (
 ids: string,
 metrics: string[],
 includeContentType: boolean,
): boolean => {
 if (includeContentType) return false
 if (ids.startsWith("video==")) return false
 if (metrics.length === 0) return false
 return !metrics.every((metric) => THUMBNAIL_VIDEO_METRICS.has(metric))
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
   status:
    | "available"
    | "unsupported_for_dimension"
    | "missing_scope"
    | "temporarily_blocked"
    | "api_request_failed"
   reasonCode?: string
   source: "api"
  }
 >()
 const knownInvalidCombos = new Set<string>(SESSION_KNOWN_INVALID_COMBOS)
 let suppressedInvalidComboCount = 0
 const diagnosticsFailures: SyncDiagnostics["failureReasons"] = []
 // Impressions + CTR are now required for video sync attempts.
 // Keep option parsing for compatibility, but do not skip the group.
 const optionalMetricsEnabled = true

 const requestCharCounts: number[] = []
 const maxRequestChars = 1900
 let splitRetries = 0
 const loggedFailureDedup = new Set<string>()
 const impressionsProbeCache = new Map<
  string,
  { groupedSupported: boolean; minimalPagingSupported: boolean }
 >()

 const targetVideoIdSet = new Set(
  Array.isArray(options.targetVideoIds)
   ? options.targetVideoIds.filter((videoId): videoId is string => !!videoId)
   : [],
 )
 const channelIdCandidates = buildChannelScopedVideoIdCandidates(channelId)

 const scopedMetricGroups = buildScopedVideoMetricGroups()

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
  end_screen: scopedMetricGroups.end_screen.filter(
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

 const urlIdsForFiltered = channelId ? `channel==${channelId}` : "channel==MINE"
 const maxMetricsString = (
  Object.values(filteredMetricGroups) as string[][]
 ).reduce((currentMax, metrics) => {
  const safeMetrics = Array.from(new Set(metrics))
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
   if (current.length >= MAX_VIDEO_IDS_PER_FILTER) {
    flush()
   }
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

 const filteredIdCandidates =
  targetVideoIdSet.size > 0
   ? buildVideoFilterCandidates(Array.from(targetVideoIdSet))
   : []
 const idCandidates =
  filteredIdCandidates.length > 0 ? filteredIdCandidates : [...channelIdCandidates]

 const fetchVideoReportPage = async (
  ids: string,
  metrics: string[],
  startIndex = 1,
  opts: {
   includeSort?: boolean
   includeStartIndex?: boolean
   includeMaxResults?: boolean
  } = {},
 ): Promise<any> => {
  const isVideoFilter = ids.startsWith("video==")
  const includeContentType = metrics.includes("creatorContentType")
  const includeSort = opts.includeSort ?? !isVideoFilter
  const includeStartIndex = opts.includeStartIndex ?? !isVideoFilter
  const includeMaxResults = opts.includeMaxResults ?? true
  const safeMetrics = Array.from(
   new Set(metrics.filter((metric) => metric !== "creatorContentType")),
  )
  if (
   shouldForceViewsMetric(ids, safeMetrics, includeContentType) &&
   !safeMetrics.includes("views")
  ) {
   safeMetrics.unshift("views")
  }
  if (safeMetrics.length === 0) {
   safeMetrics.push("views")
  }
  const urlIds = isVideoFilter ? urlIdsForFiltered : ids
  const filters = isVideoFilter ? `&filters=${encodeURIComponent(ids)}` : ""
  const dims = includeContentType ? "video,creatorContentType" : "video"
  const maxResultsParam = includeMaxResults
   ? `&maxResults=${ANALYTICS_VIDEO_PAGE_SIZE}`
   : ""
  const startIndexParam = !isVideoFilter && includeStartIndex ? `&startIndex=${startIndex}` : ""
  const sortParam = !isVideoFilter && includeSort ? "&sort=-views" : ""
  const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${urlIds}&startDate=${startDate}&endDate=${endDate}&metrics=${safeMetrics.join(",")}&dimensions=${dims}${filters}${maxResultsParam}${startIndexParam}${sortParam}`
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

 const filterPayloadToTargetVideos = (payload: any): any => {
  if (targetVideoIdSet.size === 0) return payload
  if (
   !payload ||
   !Array.isArray(payload.columnHeaders) ||
   !Array.isArray(payload.rows)
  ) {
   return payload
  }
  const headers = payload.columnHeaders.map((header: any) =>
   String(header?.name || "").toLowerCase(),
  )
  const videoIdx = headers.findIndex(
   (header: string) => header === "video" || header === "videoid",
  )
  if (videoIdx < 0) return payload
  return {
   ...payload,
   rows: payload.rows.filter((row: unknown) => {
    if (!Array.isArray(row)) return false
    const videoId = String(row[videoIdx] || "")
    return targetVideoIdSet.has(videoId)
   }),
  }
 }

 const recordFailure = (failure: SyncDiagnostics["failureReasons"][number]) => {
  const dedupKey = [
   options.window || "lifetime",
   failure.group,
   failure.ids,
   failure.requestClass || "na",
   (failure.metrics || []).join(","),
   failure.status || "na",
   failure.outcome || "na",
   failure.reason,
  ].join("::")
  if (loggedFailureDedup.has(dedupKey)) return
  loggedFailureDedup.add(dedupKey)
  diagnosticsFailures.push(failure)
 }

 const fetchVideoReport = async (
  ids: string,
  metrics: string[],
  requestOptions?: {
   includeSort?: boolean
   includeStartIndex?: boolean
   includeMaxResults?: boolean
  },
 ): Promise<any> => {
  const isVideoFilter = ids.startsWith("video==")
  if (isVideoFilter) {
   const payload = await fetchVideoReportPage(ids, metrics, 1, requestOptions)
   return flattenReportPayloads([payload])
  }
  const payloadPages: any[] = []
  let startIndex = 1
  const remainingTargets = new Set(targetVideoIdSet)
  const maxPages = MAX_ANALYTICS_VIDEO_PAGES
  for (let page = 0; page < maxPages; page += 1) {
   let payload: any
   try {
    payload = await fetchVideoReportPage(ids, metrics, startIndex, requestOptions)
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
  requestOptions?: {
   includeSort?: boolean
   includeStartIndex?: boolean
   includeMaxResults?: boolean
  },
 ): Promise<any> => {
  try {
   return await fetchVideoReport(ids, metrics, requestOptions)
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
    recordFailure({
     group: "split_retry",
     ids,
     metrics,
     status,
     reason: "Split retry triggered for invalid filtered video request.",
     requestClass: getAnalyticsRequestClass(ids, metrics),
     outcome: "split_retry",
    })
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
       requestOptions,
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
       requestOptions,
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
  end_screen: {
   ok: false,
   metrics: filteredMetricGroups.end_screen,
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
   groupResults[groupName].warnings = disabledAnalyticsGroups.has(groupName)
    ? [
       "Skipped: metric group disabled for this session due to repeated API errors.",
      ]
    : groupName === "impressions_ctr"
      ? [
         "Required thumbnail impressions/CTR metrics unavailable for this sync context.",
        ]
      : ["No supported metrics for youtube_analytics_v2 + video scope."]
   continue
  }
  const groupIdCandidates =
   groupName === "impressions_ctr"
    ? channelIdCandidates
    : idCandidates
  if (groupName === "impressions_ctr" && groupIdCandidates.length === 0) {
   groupResults[groupName].ok = true
   groupResults[groupName].warnings = [
    "Skipped: No video IDs provided for chunking impression metrics.",
   ]
   filteredMetricGroups.impressions_ctr.forEach((metric) => {
    runMetricCapabilities.set(metric, {
     metric,
     status: "temporarily_blocked",
     reasonCode: "blocked_by_missing_video_ids",
     source: "api",
    })
   })
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
    const shapeKey = `${options.window || "lifetime"}::${groupName}::${ids}`
    const comboKey = `${shapeKey}::${activeMetrics.join(",")}`
    const cachedShape = impressionsProbeCache.get(shapeKey)
    const baseAttemptShape = {
     dimensions: "video",
     includesSort: false,
     includesStartIndex: false,
     includesMaxResults: true,
     includeContentType: false,
    }
    
    let groupStatus: number | undefined = undefined;
    let groupError: any = null;
    let payload: any = null;
    let skippedGroupedRequest = false;

    if (knownInvalidCombos.has(comboKey)) {
      suppressedInvalidComboCount += 1
      skippedGroupedRequest = true;
      groupStatus = 400;
    } else {
      try {
        payload = await fetchVideoReportWithSplitRetries(
         ids,
         activeMetrics,
         0,
         false,
         {
          includeSort: false,
          includeStartIndex: false,
          includeMaxResults: true,
         },
        )
        impressionsProbeCache.set(shapeKey, {
         groupedSupported: true,
         minimalPagingSupported: true,
        })
        aggregatedPayloads.push(filterPayloadToTargetVideos(payload))
        activeMetrics.forEach((metric) => {
         metricCapabilityByMetric.set(metric, { status: "available" })
         runMetricCapabilities.set(metric, {
          metric,
          status: "available",
          source: "api",
         })
        })
        groupResults[groupName].ok = true
      } catch (err) {
        groupError = err;
        const groupErrorMessage =
         groupError instanceof Error ? groupError.message : String(groupError)
        groupStatus = getErrorStatus(groupError)
        recordFailure({
         group: groupName,
         ids,
         metrics: activeMetrics,
         status: groupStatus,
         reason: groupErrorMessage,
         requestClass: "video_top_videos_channel_filter",
         outcome: groupStatus === 400 ? "quarantined" : "failed",
         attemptedShape: baseAttemptShape,
        })
      }
    }

    if (!groupResults[groupName].ok) {
      if (groupStatus === 400 && !skippedGroupedRequest) {
       SESSION_KNOWN_INVALID_COMBOS.add(comboKey)
       impressionsProbeCache.set(shapeKey, {
        groupedSupported: false,
        minimalPagingSupported: false,
       })
      }

      let groupedMinimalPayload: any | null = null
      if (groupStatus === 400 && !skippedGroupedRequest) {
       try {
        groupedMinimalPayload = await fetchVideoReportWithSplitRetries(
         ids,
         activeMetrics,
         0,
         false,
         {
          includeSort: false,
          includeStartIndex: false,
          includeMaxResults: false,
         },
        )
        impressionsProbeCache.set(shapeKey, {
         groupedSupported: true,
         minimalPagingSupported: true,
        })
       } catch (minimalError) {
        const minimalErrorMessage =
         minimalError instanceof Error ? minimalError.message : String(minimalError)
        const minimalStatus = getErrorStatus(minimalError)
        recordFailure({
         group: groupName,
         ids,
         metrics: activeMetrics,
         status: minimalStatus,
         reason: minimalErrorMessage,
         requestClass: "video_top_videos_channel_filter",
         outcome: minimalStatus === 400 ? "quarantined" : "failed",
         attemptedShape: {
          dimensions: "video",
          includesSort: false,
          includesStartIndex: false,
          includesMaxResults: false,
          includeContentType: false,
         },
        })
        if (minimalStatus === 400) {
         SESSION_KNOWN_INVALID_COMBOS.add(comboKey)
         impressionsProbeCache.set(shapeKey, {
          groupedSupported: false,
          minimalPagingSupported: false,
         })
        }
       }
      }

      if (groupedMinimalPayload) {
       aggregatedPayloads.push(filterPayloadToTargetVideos(groupedMinimalPayload))
       activeMetrics.forEach((metric) => {
        metricCapabilityByMetric.set(metric, { status: "available" })
        runMetricCapabilities.set(metric, {
         metric,
         status: "available",
         source: "api",
        })
       })
       groupResults[groupName].ok = true
       continue
      }

      const metricPayloads: any[] = []
      const metricWarnings: string[] = []
      const shouldTryPerMetric =
       !cachedShape || cachedShape.groupedSupported === false
      for (const metric of activeMetrics) {
       if (!shouldTryPerMetric) continue
       const metricComboKey = `${groupName}::${ids}::${metric}`
      if (knownInvalidCombos.has(metricComboKey)) {
       suppressedInvalidComboCount += 1
       recordFailure({
        group: groupName,
        ids,
        metrics: [metric],
        status: 400,
        reason:
         "Suppressed known-invalid impressions/CTR metric request for this sync.",
        requestClass: "video_top_videos_channel_filter",
        outcome: "suppressed",
       })
       continue
      }
       try {
        const metricPayload = await fetchVideoReportWithSplitRetries(
         ids,
         [metric],
         0,
         false,
         {
          includeSort: false,
          includeStartIndex: false,
          includeMaxResults: true,
         },
        )
        metricPayloads.push(filterPayloadToTargetVideos(metricPayload))
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
       metricWarnings.push(`${metric}: ${metricErrorMessage}`)
        recordFailure({
         group: groupName,
         ids,
         metrics: [metric],
         status: metricStatus,
         reason: metricErrorMessage,
         requestClass: "video_top_videos_channel_filter",
         outcome: metricStatus === 400 ? "quarantined" : "failed",
         attemptedShape: baseAttemptShape,
        })
       metricCapabilityByMetric.set(metric, {
        status:
         metricStatus === 400
          ? "temporarily_blocked"
          : metricStatus === 403
           ? "missing_scope"
           : "api_request_failed",
        reasonCode:
         metricStatus === 400
          ? "temporarily_blocked"
          : metricStatus === 403
           ? "missing_scope"
          : "api_request_failed",
       })
       runMetricCapabilities.set(metric, {
        metric,
        status:
         metricStatus === 400
          ? "temporarily_blocked"
          : metricStatus === 403
           ? "missing_scope"
           : "api_request_failed",
        reasonCode:
         metricStatus === 400
          ? "temporarily_blocked"
          : metricStatus === 403
           ? "missing_scope"
          : "api_request_failed",
        source: "api",
       })
       if (metricStatus === 400) {
       knownInvalidCombos.add(metricComboKey)
        SESSION_KNOWN_INVALID_COMBOS.add(metricComboKey)
       }
      }
     }

      if (metricPayloads.length > 0) {
        aggregatedPayloads.push(flattenReportPayloads(metricPayloads))
        groupResults[groupName].ok = true
        impressionsProbeCache.set(shapeKey, {
         groupedSupported: false,
         minimalPagingSupported: true,
        })
        recordFailure({
       group: groupName,
       ids,
       metrics: activeMetrics,
       status: groupStatus,
       reason:
        "Recovered impressions/CTR with per-metric top-videos fallback after grouped request failed.",
       requestClass: "video_top_videos_channel_filter",
       outcome: "fallback_succeeded",
      })
     } else {
      groupResults[groupName].ok = false
     if (groupStatus === 400) {
      knownInvalidCombos.add(comboKey)
      SESSION_KNOWN_INVALID_COMBOS.add(comboKey)
      }
     }
     if (metricWarnings.length > 0) {
      aggregatedWarnings.push(...metricWarnings)
     }
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
    recordFailure({
     group: groupName,
     ids,
     metrics: activeMetrics,
     status,
     reason: combinedError,
     requestClass: getAnalyticsRequestClass(ids, activeMetrics),
     outcome: "failed",
    })
    if (status === 400) {
     knownInvalidCombos.add(comboKey)
     SESSION_KNOWN_INVALID_COMBOS.add(comboKey)
    }
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
      recordFailure({
       group: groupName,
       ids,
       metrics: [metric],
       status: metricStatus,
       reason: metricErrorMessage,
       requestClass: getAnalyticsRequestClass(ids, [metric]),
       outcome: metricStatus === 400 ? "quarantined" : "failed",
      })
      if (metricStatus === 400) {
       unsupportedVideoAnalyticsMetrics.add(metric)
       runDisabledMetrics.add(metric)
       metricCapabilityByMetric.set(metric, {
        status: "unsupported_for_dimension",
        reasonCode: "unsupported_for_dimension",
       })
       runMetricCapabilities.set(metric, {
        metric,
        status: "unsupported_for_dimension",
        reasonCode: "unsupported_for_dimension",
        source: "api",
       })
       knownInvalidCombos.add(`${groupName}::${ids}::${metric}`)
       SESSION_KNOWN_INVALID_COMBOS.add(`${groupName}::${ids}::${metric}`)
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
 if (suppressedInvalidComboCount > 0) {
  const note = `Suppressed ${suppressedInvalidComboCount} known-invalid YouTube Analytics combinations in this sync.`
  const existing = groupResults.impressions_ctr.warnings || []
  groupResults.impressions_ctr.warnings = existing.includes(note)
   ? existing
   : [...existing, note]
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
): Promise<VideoContentTypeFetchResult> => {
 const idCandidates = channelId
  ? [`channel==${channelId}`, "channel==MINE"]
  : ["channel==MINE"]
 if (creatorContentTypeFetchDisabled) {
  return {
   map: new Map(),
   status: {
    status: "quarantined",
    requestClass: "channel_creator_content_type",
    idsTried: idCandidates,
    disabledForSession: true,
    rowCount: 0,
    reason: "creatorContentType fetch already disabled for this session.",
    fetchedAt: Date.now(),
   },
  }
 }
 const token = await refreshTokenIfExpired()
 if (!token) {
  return {
   map: new Map(),
   status: {
    status: "quarantined",
    requestClass: "channel_creator_content_type",
    idsTried: idCandidates,
    disabledForSession: false,
    rowCount: 0,
    reason: "Missing valid YouTube token for creatorContentType fetch.",
    fetchedAt: Date.now(),
   },
  }
 }
 try {
  let data: any = null
  let lastFailureReason = "Creator content type report returned no rows."
  for (const idParam of idCandidates) {
   const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}&metrics=views&dimensions=creatorContentType&maxResults=200&sort=-views`
   const response = await proxyFetch(url, {
    headers: { Authorization: `Bearer ${token}` },
   })
   if (!response.ok) {
    lastFailureReason = `HTTP ${response.status} for ${idParam}`
    continue
   }
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
   return {
    map: new Map(),
    status: {
     status: "quarantined",
     requestClass: "channel_creator_content_type",
     idsTried: idCandidates,
     disabledForSession: true,
     rowCount: 0,
     reason: lastFailureReason,
     fetchedAt: Date.now(),
    },
   }
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
  return {
   map: contentTypeMap,
   status: {
    status: "available",
    requestClass: "channel_creator_content_type",
    idsTried: idCandidates,
    disabledForSession: false,
    rowCount: contentTypeMap.size,
    fetchedAt: Date.now(),
   },
  }
 } catch (error) {
  creatorContentTypeFetchDisabled = true
  console.warn(
   "Error fetching creatorContentType; disabling for this session:",
   error,
  )
  return {
   map: new Map(),
   status: {
    status: "quarantined",
    requestClass: "channel_creator_content_type",
    idsTried: idCandidates,
    disabledForSession: true,
    rowCount: 0,
    reason: error instanceof Error ? error.message : String(error),
    fetchedAt: Date.now(),
   },
  }
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
  "views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost,likes,comments,shares,estimatedRevenue"
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
  "views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost,estimatedRevenue,likes,comments,shares"
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
 const metricGroups = [
  ["views", "estimatedMinutesWatched", "averageViewDuration", "averageViewPercentage"],
  ["engagedViews", "likes", "dislikes", "comments", "shares"],
  ["subscribersGained", "subscribersLost"],
  ["estimatedRevenue", "estimatedAdRevenue", "grossRevenue"],
  ["adImpressions", "monetizedPlaybacks", "cpm", "playbackBasedCpm"],
 ] as const

 const mergedHeaders: Array<{ name: string }> = [{ name: "country" }]
 const headerNameSet = new Set(["country"])
 const rowByCountry = new Map<string, Record<string, number | string>>()

 const ensureCountryRow = (country: string) => {
  if (!rowByCountry.has(country)) {
   rowByCountry.set(country, { country })
  }
  return rowByCountry.get(country) as Record<string, number | string>
 }

 let successCount = 0
 for (const metrics of metricGroups) {
  const url =
   `${ANALYTICS_URL}/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}` +
   `&metrics=${metrics.join(",")}&dimensions=country`
  const response = await proxyFetch(url, {
   headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
   continue
  }
  const payload = (await response.json()) as {
   columnHeaders?: Array<{ name?: string }>
   rows?: Array<Array<string | number>>
  }
  const headers = payload.columnHeaders || []
  const rows = payload.rows || []
  const countryIdx = headers.findIndex((header) => header?.name === "country")
  if (countryIdx < 0) continue
  successCount += 1

  headers.forEach((header) => {
   const name = header?.name || ""
   if (!name || headerNameSet.has(name)) return
   headerNameSet.add(name)
   mergedHeaders.push({ name })
  })

  rows.forEach((row) => {
   const country = String(row[countryIdx] ?? "").trim()
   if (!country) return
   const target = ensureCountryRow(country)
   headers.forEach((header, index) => {
    const name = header?.name || ""
    if (!name || name === "country") return
    const value = row[index]
    const numeric = Number(value)
    target[name] = Number.isFinite(numeric) ? numeric : String(value ?? "")
   })
  })
 }

 if (successCount === 0) {
  throw new YouTubeApiError("Failed to fetch geography analytics", 400, "badRequest")
 }

 const headerIndex = new Map(mergedHeaders.map((header, index) => [header.name, index]))
 const resultRows: Array<Array<string | number>> = []
 rowByCountry.forEach((row) => {
  const out = new Array<string | number>(mergedHeaders.length).fill(0)
  out[0] = String(row.country || "")
  Object.entries(row).forEach(([key, value]) => {
   if (key === "country") return
   const idx = headerIndex.get(key)
   if (idx === undefined) return
   out[idx] = value as string | number
  })
  resultRows.push(out)
 })

 return {
  columnHeaders: mergedHeaders,
  rows: resultRows,
 }
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

 const chunks = chunkArray(videoIds, 250);
 const results = await Promise.all(
  chunks.map(async (chunk) => {
   const url =
    `${ANALYTICS_URL}/reports?` +
    `ids=channel==MINE&` +
    `startDate=${startDate}&` +
    `endDate=${endDate}&` +
    `metrics=${metrics}&` +
    `filters=${encodeURIComponent(`video==${chunk.join(",")}`)}&` +
    `dimensions=video`;

   const token = await refreshTokenIfExpired();
   const response = await proxyFetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
   });
   if (!response.ok) await handleYouTubeApiError(response, "Failed to fetch video analytics");
   return response.json();
  })
 );

 const aggregatedRows = results.flatMap((res) => res.rows || []);
 return { rows: aggregatedRows };
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

export const createReportingJob = async (
 reportTypeId: string,
 name: string,
) => {
 const token = await refreshTokenIfExpired()
 if (!token) throw new Error("Missing YouTube token")
 
 const url = `${ANALYTICS_URL}/jobs?ids=channel==MINE`
 const response = await proxyFetch(url, {
  method: 'POST',
  headers: { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
   reportTypeId,
   name,
  }),
 })
 if (!response.ok) await handleYouTubeApiError(response, "Failed to create reporting job")
 return response.json()
}

export const listReportingJobs = async () => {
 const token = await refreshTokenIfExpired()
 if (!token) throw new Error("Missing YouTube token")

 const url = `${ANALYTICS_URL}/jobs?ids=channel==MINE`
 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok) await handleYouTubeApiError(response, "Failed to list reporting jobs")
 return response.json()
}

export const listReports = async (jobId: string) => {
 const token = await refreshTokenIfExpired()
 if (!token) throw new Error("Missing YouTube token")

 const url = `${ANALYTICS_URL}/jobs/${encodeURIComponent(jobId)}/reports?ids=channel==MINE`
 const response = await proxyFetch(url, {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok) await handleYouTubeApiError(response, "Failed to list reporting reports")
 return response.json()
}
