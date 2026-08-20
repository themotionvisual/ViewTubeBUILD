import type {
 AnalyticsWindow,
 CanonicalAudienceSplitRow,
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

const DEMO_WINDOWS: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d", "7d"]
const DEMO_METRICS = [
 "viewerPercentage",
 "views",
 "engagedViews",
 "estimatedMinutesWatched",
 "averageViewDuration",
 "averageViewPercentage",
]
const DEMO_FALLBACK_METRICS = ["viewerPercentage"]
const VIDEO_CHUNK_SIZE = 75

const fetchDemographicReportWithFallback = async (
 request: Parameters<typeof fetchCanonicalAnalyticsReport>[0],
 context: string,
): Promise<{
 payload: Awaited<ReturnType<typeof fetchCanonicalAnalyticsReport>>
 metrics: string[]
 fallbackUsed: boolean
}> => {
 try {
  return {
   payload: await fetchCanonicalAnalyticsReport(request, context),
   metrics: DEMO_METRICS,
   fallbackUsed: false,
  }
 } catch (error) {
  const fallbackRequest = {
   ...request,
   metrics: DEMO_FALLBACK_METRICS,
  }
  return {
   payload: await fetchCanonicalAnalyticsReport(fallbackRequest, `${context} (viewerPercentage fallback)`),
   metrics: DEMO_FALLBACK_METRICS,
   fallbackUsed: true,
  }
 }
}

const buildDemoRow = (
 row: Record<string, unknown>,
 channelId: string,
 window: AnalyticsWindow,
 entityType: "channel" | "video",
 entityId: string,
 metricKeys: string[],
): CanonicalAudienceSplitRow | null => {
 const ageGroup = String(row.ageGroup || "")
 const gender = String(row.gender || "")
 if (!ageGroup && !gender) return null

 const splitKey = `${ageGroup}_${gender}`
 const metrics = Object.fromEntries(
  metricKeys.map((metricKey) => {
   const metric = buildMetricValue(
    toMetricNumber(row[metricKey]),
    "analytics_api",
    metricKey in row ? "available" : "unsupported",
    metricKey in row ? undefined : "metric_not_supported_in_demo_report",
   )
   return [metricKey, metric.value]
  }),
 )
 const metricMeta = Object.fromEntries(
  metricKeys.map((metricKey) => {
   const metric = buildMetricValue(
    toMetricNumber(row[metricKey]),
    "analytics_api",
    metricKey in row ? "available" : "unsupported",
    metricKey in row ? undefined : "metric_not_supported_in_demo_report",
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
  splitDimension: "demographic",
  splitKey,
  metrics,
  metricMeta,
  syncedAt: new Date().toISOString(),
 }
}

export const syncDemographicRows = async (
 channelId: string,
 records: CanonicalVideoRecord[],
 syncRunId: string,
 windows: AnalyticsWindow[] = DEMO_WINDOWS,
): Promise<{
 rows: CanonicalAudienceSplitRow[]
 audit: CanonicalRawAuditEntry[]
}> => {
 const demoRows: CanonicalAudienceSplitRow[] = []
 const audit: CanonicalRawAuditEntry[] = []
 for (const window of windows) {
  const { startDate, endDate } = getWindowRange(window)
  try {
   const result = await fetchDemographicReportWithFallback(
    {
     startDate,
     endDate,
     metrics: DEMO_METRICS,
     dimensions: ["ageGroup", "gender"],
    },
    "Failed to fetch channel demographic analytics",
   )
   const payload = result.payload
   rowsToObjects(payload).forEach((row) => {
    const demoRow = buildDemoRow(row, channelId, window, "channel", channelId, result.metrics)
    if (demoRow) demoRows.push(demoRow)
   })
   audit.push({
    id: `${syncRunId}::demographic::channel::${window}`,
    channelId,
    syncRunId,
    stage: "demographics_sync",
    source: "analytics_api",
    window,
    recordedAt: new Date().toISOString(),
     payload: {
     dimensionMode: "ageGroup+gender",
     metrics: result.metrics,
     fallbackUsed: result.fallbackUsed,
     rowCount: Array.isArray(payload?.rows) ? payload.rows.length : 0,
    },
   })
  } catch (error) {
   audit.push({
    id: `${syncRunId}::demographic::channel::${window}`,
    channelId,
    syncRunId,
    stage: "demographics_sync",
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
     const result = await fetchDemographicReportWithFallback(
      {
       startDate,
       endDate,
       metrics: DEMO_METRICS,
       dimensions: ["video", "ageGroup", "gender"],
       filters: [`video==${videoIds.join(",")}`],
       maxResults: videoIds.length * 5,
      },
      "Failed to fetch per-video demographic analytics",
     )
     const payload = result.payload
     rowsToObjects(payload).forEach((row) => {
      const videoId = String(row.video || row.videoId || "")
      if (!videoId) return
      const demoRow = buildDemoRow(row, channelId, window, "video", videoId, result.metrics)
      if (demoRow) demoRows.push(demoRow)
     })
     audit.push({
      id: `${syncRunId}::demographic::video::${window}::${videoIds[0]}`,
      channelId,
      syncRunId,
      stage: "demographics_sync",
      source: "analytics_api",
      window,
      recordedAt: new Date().toISOString(),
      payload: {
       dimensionMode: "video+ageGroup+gender",
       metrics: result.metrics,
       fallbackUsed: result.fallbackUsed,
       videoCount: videoIds.length,
       rowCount: Array.isArray(payload?.rows) ? payload.rows.length : 0,
      },
     })
    } catch (error) {
     audit.push({
      id: `${syncRunId}::demographic::video::${window}::${videoIds[0]}`,
      channelId,
      syncRunId,
      stage: "demographics_sync",
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
 return { rows: demoRows, audit }
}
