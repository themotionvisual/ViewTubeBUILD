import type {
 AnalyticsWindow,
 CanonicalGeographyRow,
 CanonicalRawAuditEntry,
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

const GEOGRAPHY_WINDOWS: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d"]
const GEOGRAPHY_METRICS = [
 "views",
 "estimatedMinutesWatched",
 "averageViewDuration",
 "averageViewPercentage",
]
const VIDEO_CHUNK_SIZE = 75

const buildGeographyRow = (
 row: Record<string, unknown>,
 channelId: string,
 window: AnalyticsWindow,
 entityType: "channel" | "video",
 entityId: string,
): CanonicalGeographyRow | null => {
 const country = String(row.country || "")
 if (!country) return null
 const metrics = Object.fromEntries(
  GEOGRAPHY_METRICS.map((metricKey) => {
   const metric = buildMetricValue(
    toMetricNumber(row[metricKey]),
    "analytics_api",
    metricKey in row ? "available" : "unsupported",
    metricKey in row ? undefined : "metric_not_supported_in_geography_report",
   )
   return [metricKey, metric.value]
  }),
 )
 const metricMeta = Object.fromEntries(
  GEOGRAPHY_METRICS.map((metricKey) => {
   const metric = buildMetricValue(
    toMetricNumber(row[metricKey]),
    "analytics_api",
    metricKey in row ? "available" : "unsupported",
    metricKey in row ? undefined : "metric_not_supported_in_geography_report",
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
  country,
  province: row.province ? String(row.province) : null,
  city: row.city ? String(row.city) : null,
  metrics,
  metricMeta,
  syncedAt: new Date().toISOString(),
 }
}

export const syncGeographyRows = async (
 channelId: string,
 records: CanonicalVideoRecord[],
 syncRunId: string,
 windows: AnalyticsWindow[] = GEOGRAPHY_WINDOWS,
): Promise<{
 rows: CanonicalGeographyRow[]
 audit: CanonicalRawAuditEntry[]
}> => {
 const geographyRows: CanonicalGeographyRow[] = []
 const audit: CanonicalRawAuditEntry[] = []
 for (const window of windows) {
  const { startDate, endDate } = getWindowRange(window)
  try {
   const payload = await fetchCanonicalAnalyticsReport(
    {
     startDate,
     endDate,
     metrics: GEOGRAPHY_METRICS,
     dimensions: ["country"],
     sort: ["-views"],
     maxResults: 300,
    },
    "Failed to fetch channel geography analytics",
   )
   rowsToObjects(payload).forEach((row) => {
    const geographyRow = buildGeographyRow(row, channelId, window, "channel", channelId)
    if (geographyRow) geographyRows.push(geographyRow)
   })
   audit.push({
    id: `${syncRunId}::geography_sync::channel::${window}`,
    channelId,
    syncRunId,
    stage: "geography_sync",
    source: "analytics_api",
    window,
    recordedAt: new Date().toISOString(),
    payload: {
     dimensionMode: "country",
     rowCount: Array.isArray(payload?.rows) ? payload.rows.length : 0,
     columnHeaders: payload?.columnHeaders || [],
    },
   })
  } catch (error) {
   audit.push({
    id: `${syncRunId}::geography_sync::channel::${window}`,
    channelId,
    syncRunId,
    stage: "geography_sync",
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
      metrics: GEOGRAPHY_METRICS,
      dimensions: ["video", "country"],
      filters: [`video==${videoIds.join(",")}`],
      maxResults: videoIds.length * 15,
     },
     "Failed to fetch per-video geography analytics",
    )
    rowsToObjects(payload).forEach((row) => {
      const videoId = String(row.video || row.videoId || "")
      if (!videoId) return
      const geographyRow = buildGeographyRow(row, channelId, window, "video", videoId)
      if (geographyRow) geographyRows.push(geographyRow)
    })
    audit.push({
     id: `${syncRunId}::geography_sync::video::${window}::${videoIds[0]}`,
     channelId,
     syncRunId,
     stage: "geography_sync",
     source: "analytics_api",
     window,
     recordedAt: new Date().toISOString(),
     payload: {
      dimensionMode: "video+country",
      videoCount: videoIds.length,
      rowCount: Array.isArray(payload?.rows) ? payload.rows.length : 0,
     },
    })
   } catch (error) {
    audit.push({
     id: `${syncRunId}::geography_sync::video::${window}::${videoIds[0]}`,
     channelId,
     syncRunId,
     stage: "geography_sync",
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
 return { rows: geographyRows, audit }
}
