import type {
 AnalyticsWindow,
 CanonicalAudienceSplitRow,
 CanonicalRawAuditEntry,
 CanonicalSubscribedStatus,
 CanonicalVideoRecord,
} from "./contracts"
import {
 chunkItems,
 fetchCanonicalAnalyticsReport,
 getWindowRange,
 rowsToObjects,
 toMetricNumber,
} from "./query"
import { buildMetricValue } from "./normalizers/video"

const AUDIENCE_WINDOWS: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d", "7d"]
const AUDIENCE_METRICS = [
 "views",
 "estimatedMinutesWatched",
 "averageViewDuration",
 "averageViewPercentage",
 "engagedViews",
]
const VIDEO_CHUNK_SIZE = 75

const toSubscribedStatus = (
 raw: unknown,
): CanonicalSubscribedStatus | null => {
 const value = String(raw || "").toUpperCase()
 if (value === "SUBSCRIBED" || value === "UNSUBSCRIBED") {
  return value as CanonicalSubscribedStatus
 }
 return null
}

const buildSplitRow = (
 row: Record<string, unknown>,
 channelId: string,
 window: AnalyticsWindow,
 entityType: "channel" | "video",
 entityId: string,
): CanonicalAudienceSplitRow | null => {
 const splitKey = toSubscribedStatus(row.subscribedStatus)
 if (!splitKey) return null
 const metrics = Object.fromEntries(
  AUDIENCE_METRICS.map((metricKey) => {
   const metric = buildMetricValue(
    toMetricNumber(row[metricKey]),
    "analytics_api",
    metricKey in row ? "available" : "unsupported",
    metricKey in row ? undefined : "metric_not_supported_in_audience_split_report",
   )
   return [metricKey, metric.value]
  }),
 )
 const metricMeta = Object.fromEntries(
  AUDIENCE_METRICS.map((metricKey) => {
   const metric = buildMetricValue(
    toMetricNumber(row[metricKey]),
    "analytics_api",
    metricKey in row ? "available" : "unsupported",
    metricKey in row ? undefined : "metric_not_supported_in_audience_split_report",
   )
   return [
    metricKey,
    {
     source: metric.source,
     availability: metric.availability,
     reasonCode: metric.reasonCode,
     confidence: metric.confidence,
     syncedAt: metric.syncedAt,
    },
   ]
  }),
 )
 return {
  channelId,
  entityType,
  entityId,
  window,
  splitDimension: "subscribedStatus",
  splitKey,
  metrics,
  metricMeta,
  syncedAt: new Date().toISOString(),
 }
}

export const syncAudienceSegmentRows = async (
 channelId: string,
 records: CanonicalVideoRecord[],
 syncRunId: string,
 windows: AnalyticsWindow[] = AUDIENCE_WINDOWS,
): Promise<{
 rows: CanonicalAudienceSplitRow[]
 audit: CanonicalRawAuditEntry[]
}> => {
 const audienceRows: CanonicalAudienceSplitRow[] = []
 const audit: CanonicalRawAuditEntry[] = []
 for (const window of windows) {
  const { startDate, endDate } = getWindowRange(window)
  try {
   const payload = await fetchCanonicalAnalyticsReport(
    {
     startDate,
     endDate,
     metrics: AUDIENCE_METRICS,
     dimensions: ["subscribedStatus"],
    },
    "Failed to fetch channel audience split analytics",
   )
   rowsToObjects(payload).forEach((row) => {
    const audienceRow = buildSplitRow(row, channelId, window, "channel", channelId)
    if (audienceRow) audienceRows.push(audienceRow)
   })
   audit.push({
    id: `${syncRunId}::audience_segments::channel::${window}`,
    channelId,
    syncRunId,
    stage: "audience_segments",
    source: "analytics_api",
    window,
    recordedAt: new Date().toISOString(),
    payload: {
     dimensionMode: "subscribedStatus",
     rowCount: Array.isArray(payload?.rows) ? payload.rows.length : 0,
     columnHeaders: payload?.columnHeaders || [],
    },
   })
  } catch (error) {
   audit.push({
    id: `${syncRunId}::audience_segments::channel::${window}`,
    channelId,
    syncRunId,
    stage: "audience_segments",
    source: "analytics_api",
    window,
    recordedAt: new Date().toISOString(),
    payload: {
     status: "failed",
     entityType: "channel",
     error: error instanceof Error ? error.message : String(error),
    },
   })
  }

  for (const chunk of chunkItems(records, VIDEO_CHUNK_SIZE)) {
    const videoIds = chunk.map((record) => record.videoId)
    try {
     const payload = await fetchCanonicalAnalyticsReport(
      {
       startDate,
       endDate,
       metrics: AUDIENCE_METRICS,
       dimensions: ["video", "subscribedStatus"],
       filters: [`video==${videoIds.join(",")}`],
       maxResults: videoIds.length * 2,
      },
      "Failed to fetch per-video audience split analytics",
     )
     rowsToObjects(payload).forEach((row) => {
      const videoId = String(row.video || row.videoId || "")
      if (!videoId) return
      const audienceRow = buildSplitRow(row, channelId, window, "video", videoId)
      if (audienceRow) audienceRows.push(audienceRow)
     })
     audit.push({
      id: `${syncRunId}::audience_segments::video::${window}::${videoIds[0]}`,
      channelId,
      syncRunId,
      stage: "audience_segments",
      source: "analytics_api",
      window,
      recordedAt: new Date().toISOString(),
      payload: {
       dimensionMode: "video+subscribedStatus",
       videoCount: videoIds.length,
       rowCount: Array.isArray(payload?.rows) ? payload.rows.length : 0,
      },
     })
    } catch (error) {
     audit.push({
      id: `${syncRunId}::audience_segments::video::${window}::${videoIds[0]}`,
      channelId,
      syncRunId,
      stage: "audience_segments",
      source: "analytics_api",
      window,
      recordedAt: new Date().toISOString(),
      payload: {
       status: "failed",
       entityType: "video",
       videoCount: videoIds.length,
       error: error instanceof Error ? error.message : String(error),
      },
     })
    }
  }
 }
 return { rows: audienceRows, audit }
}
