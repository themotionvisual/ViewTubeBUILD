import type {
 AnalyticsWindow,
 CanonicalRawAuditEntry,
 CanonicalRetentionFilterSet,
 CanonicalRetentionSeries,
} from "./contracts"
import { buildMetricValue } from "./normalizers/video"
import {
 fetchCanonicalAnalyticsReport,
 getWindowRange,
 rowsToObjects,
 toMetricNumber,
} from "./query"

const RETENTION_METRICS = [
 "audienceWatchRatio",
 "relativeRetentionPerformance",
 "startedWatching",
 "stoppedWatching",
 "totalSegmentImpressions",
]

export const buildRetentionVideoFilter = (videoId: string): string => {
 const normalized = videoId.trim()
 if (!normalized || normalized.includes(",")) {
  throw new Error("Retention requests must specify exactly one video ID.")
 }
 return `video==${normalized}`
}

const computeDerivedRetention = (
 points: CanonicalRetentionSeries["points"],
) => {
 const firstPoint = points[0]
 const thirtyPercentPoint =
  points.find((point) => point.elapsedVideoTimeRatio >= 0.3) || firstPoint
 const middlePoint =
  points.find((point) => point.elapsedVideoTimeRatio >= 0.5) || firstPoint
 const endPoint = points[points.length - 1] || firstPoint
 const firstValue = firstPoint?.audienceWatchRatio.value ?? null
 const thirtyValue = thirtyPercentPoint?.audienceWatchRatio.value ?? null
 const midValue = middlePoint?.audienceWatchRatio.value ?? null
 const endValue = endPoint?.audienceWatchRatio.value ?? null

 return {
  first30PercentDrop: buildMetricValue(
   firstValue === null || thirtyValue === null ? null : firstValue - thirtyValue,
   "derived",
   firstValue === null || thirtyValue === null ? "unavailable" : "available",
   firstValue === null || thirtyValue === null ? "missing_retention_points" : undefined,
  ),
  midVideoHold: buildMetricValue(
   midValue,
   "derived",
   midValue === null ? "unavailable" : "available",
   midValue === null ? "missing_retention_points" : undefined,
  ),
  endRetention: buildMetricValue(
   endValue,
   "derived",
   endValue === null ? "unavailable" : "available",
   endValue === null ? "missing_retention_points" : undefined,
  ),
  stayedToWatchProxy: buildMetricValue(
   endValue,
   "derived",
   endValue === null ? "unavailable" : "available",
   endValue === null ? "missing_retention_points" : undefined,
  ),
 }
}

const buildRetentionFilters = (filters: CanonicalRetentionFilterSet): string[] => {
 const clauses: string[] = []
 if (filters.audienceType) clauses.push(`audienceType==${filters.audienceType}`)
 if (filters.subscribedStatus) {
  clauses.push(`subscribedStatus==${filters.subscribedStatus}`)
 }
 if (filters.youtubeProduct) clauses.push(`youtubeProduct==${filters.youtubeProduct}`)
 return clauses
}

export const syncRetentionSeries = async (
 channelId: string,
 videoIds: string[],
 syncRunId: string,
 opts: {
  window?: AnalyticsWindow
  filters?: CanonicalRetentionFilterSet
 } = {},
): Promise<{
 series: CanonicalRetentionSeries[]
 audit: CanonicalRawAuditEntry[]
}> => {
 const window = opts.window || "lifetime"
 const filters = opts.filters || {}
 const { startDate, endDate } = getWindowRange(window)
 const series: CanonicalRetentionSeries[] = []
 const audit: CanonicalRawAuditEntry[] = []

 for (const videoId of videoIds) {
  const filterSet = [buildRetentionVideoFilter(videoId), ...buildRetentionFilters(filters)]
  try {
   const payload = await fetchCanonicalAnalyticsReport(
    {
     startDate,
     endDate,
     metrics: RETENTION_METRICS,
     dimensions: ["elapsedVideoTimeRatio"],
     filters: filterSet,
     sort: "elapsedVideoTimeRatio",
     maxResults: 100,
    },
    "Failed to fetch canonical video retention analytics",
   )
   const points = rowsToObjects(payload).map((row) => ({
    elapsedVideoTimeRatio: Number(row.elapsedVideoTimeRatio || 0),
    audienceWatchRatio: buildMetricValue(
     toMetricNumber(row.audienceWatchRatio),
     "analytics_api",
    ),
    relativeRetentionPerformance: buildMetricValue(
     toMetricNumber(row.relativeRetentionPerformance),
     "analytics_api",
    ),
    startedWatching: buildMetricValue(
     toMetricNumber(row.startedWatching),
     "analytics_api",
    ),
    stoppedWatching: buildMetricValue(
     toMetricNumber(row.stoppedWatching),
     "analytics_api",
    ),
    totalSegmentImpressions: buildMetricValue(
     toMetricNumber(row.totalSegmentImpressions),
     "analytics_api",
    ),
   }))
   series.push({
    channelId,
    videoId,
    window,
    startDate,
    endDate,
    filters,
    points,
    derived: computeDerivedRetention(points),
    syncedAt: new Date().toISOString(),
   })
   audit.push({
    id: `${syncRunId}::retention_sync::${window}::${videoId}`,
    channelId,
    syncRunId,
    stage: "retention_sync",
    source: "analytics_api",
    window,
    recordedAt: new Date().toISOString(),
    payload: {
     videoId,
     pointCount: points.length,
     filters,
    },
   })
  } catch (error) {
   audit.push({
    id: `${syncRunId}::retention_sync::${window}::${videoId}`,
    channelId,
    syncRunId,
    stage: "retention_sync",
    source: "analytics_api",
    window,
    recordedAt: new Date().toISOString(),
    payload: {
     videoId,
     status: "failed",
     filters,
     reason: error instanceof Error ? error.message : String(error),
    },
   })
  }
 }

 return { series, audit }
}
