import type {
 AnalyticsWindow,
 CanonicalRawAuditEntry,
 CanonicalVideoRecord,
} from "./contracts"
import { buildMetricValue, mergeMetricWindows } from "./normalizers/video"
import {
 chunkItems,
 fetchCanonicalAnalyticsReport,
 getWindowRange,
 rowsToObjects,
 toMetricNumber,
} from "./query"

const REVENUE_WINDOWS: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d"]
const REVENUE_METRICS = [
 "estimatedRevenue",
 "estimatedAdRevenue",
 "estimatedRedPartnerRevenue",
 "cpm",
 "playbackBasedCpm",
 "adImpressions",
 "monetizedPlaybacks",
] as const
const CHUNK_SIZE = 75

const REVENUE_METRIC_ALIASES: Record<string, string> = {
 estimatedRedPartnerRevenue: "estimatedYouTubePremiumRevenue",
}

export const syncRevenueMetrics = async (
 channelId: string,
 records: CanonicalVideoRecord[],
 syncRunId: string,
 windows: AnalyticsWindow[] = REVENUE_WINDOWS,
): Promise<{
 records: CanonicalVideoRecord[]
 audit: CanonicalRawAuditEntry[]
}> => {
 if (records.length === 0) return { records, audit: [] }
 const byVideoId = new Map(records.map((record) => [record.videoId, record]))
 const audit: CanonicalRawAuditEntry[] = []

 for (const window of windows) {
  const { startDate, endDate } = getWindowRange(window)
  for (const chunk of chunkItems(records, CHUNK_SIZE)) {
   const ids = chunk.map((record) => record.videoId)
   const payload = await fetchCanonicalAnalyticsReport(
    {
     startDate,
     endDate,
     metrics: [...REVENUE_METRICS],
     dimensions: ["video"],
     filters: [`video==${ids.join(",")}`],
     maxResults: ids.length,
    },
    "Failed to fetch canonical revenue metrics",
   )
   const rows = rowsToObjects(payload)
   rows.forEach((row) => {
    const videoId = String(row.video || row.videoId || "")
    const current = byVideoId.get(videoId)
    if (!current) return
    const metrics = Object.fromEntries(
     REVENUE_METRICS.map((metricKey) => {
      const canonicalKey = REVENUE_METRIC_ALIASES[metricKey] || metricKey
      return [
       canonicalKey,
       buildMetricValue(toMetricNumber(row[metricKey]), "analytics_api"),
      ]
     }),
    )
    byVideoId.set(videoId, mergeMetricWindows(current, window, metrics))
   })
   audit.push({
    id: `${syncRunId}::revenue_metrics::${window}::${ids[0] || "empty"}`,
    channelId,
    syncRunId,
    stage: "video_metrics",
    source: "analytics_api",
    window,
    recordedAt: new Date().toISOString(),
    payload: {
     metricFamily: "revenue_monetization",
     videoCount: ids.length,
     rowCount: rows.length,
     columnHeaders: payload?.columnHeaders || [],
    },
   })
  }
 }

 return { records: Array.from(byVideoId.values()), audit }
}
