import { fetchAnalytics } from "../youtubeService"
import type {
 AnalyticsWindow,
 CanonicalRawAuditEntry,
 CanonicalVideoRecord,
} from "./contracts"
import { buildMetricValue, mergeMetricWindows } from "./normalizers/video"

const supportedWindows: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d"]
const DEPRECATED_ANNOTATION_METRICS = new Set([
 "annotationClickThroughRate",
 "annotationCloseRate",
 "annotationImpressions",
 "annotationClickableImpressions",
 "annotationClosableImpressions",
 "annotationClicks",
 "annotationCloses",
])

export const shouldPersistCanonicalAnalyticsMetric = (metricKey: string): boolean =>
 !DEPRECATED_ANNOTATION_METRICS.has(metricKey)

const isoDate = (date: Date): string => date.toISOString().split("T")[0]

const VIDEO_METRIC_KEY_ALIASES: Record<string, string> = {
 estimatedRedPartnerRevenue: "estimatedYouTubePremiumRevenue",
}

const getWindowRange = (
 window: AnalyticsWindow,
 records: CanonicalVideoRecord[],
): { startDate: string; endDate: string } => {
 const endDate = new Date()
 if (window === "lifetime") {
  const earliestPublishedAt = records
   .map((record) => new Date(record.publishedAt))
   .filter((date) => !Number.isNaN(date.getTime()))
   .sort((left, right) => left.getTime() - right.getTime())[0]
  return {
   startDate: isoDate(earliestPublishedAt || new Date("2000-01-01T00:00:00Z")),
   endDate: isoDate(endDate),
  }
 }
 const lookback =
  window === "365d" ? 365 : window === "90d" ? 90 : window === "28d" ? 28 : 7
 const startDate = new Date(endDate)
 startDate.setDate(startDate.getDate() - (lookback - 1))
 return { startDate: isoDate(startDate), endDate: isoDate(endDate) }
}

const rowsToObjects = (payload: any): Record<string, unknown>[] => {
 if (!Array.isArray(payload?.rows) || !Array.isArray(payload?.columnHeaders)) {
  return []
 }
 const headers = payload.columnHeaders.map((header: any) =>
  String(header?.name || ""),
 )
 return payload.rows
  .map((row: unknown) => {
   if (!Array.isArray(row)) return null
   const out: Record<string, unknown> = {}
   headers.forEach((header: string, index: number) => {
    if (header) out[header] = row[index]
   })
   return out
  })
  .filter((row): row is Record<string, unknown> => !!row)
}

const toMetricNumber = (value: unknown): number | null => {
 if (value === null || value === undefined || value === "") return null
 const numeric = typeof value === "number" ? value : Number(value)
 return Number.isFinite(numeric) ? numeric : null
}

export const syncVideoMetrics = async (
 channelId: string,
 records: CanonicalVideoRecord[],
 syncRunId: string,
 windows: AnalyticsWindow[] = supportedWindows,
): Promise<{
 records: CanonicalVideoRecord[]
 audit: CanonicalRawAuditEntry[]
}> => {
 if (records.length === 0) return { records, audit: [] }
 const byVideoId = new Map(records.map((record) => [record.videoId, record]))
 const audit: CanonicalRawAuditEntry[] = []

 for (const window of windows) {
  const { startDate, endDate } = getWindowRange(window, records)
  const payload = await fetchAnalytics(startDate, endDate, channelId, {
   window,
   targetVideoIds: records.map((record) => record.videoId),
  })
  rowsToObjects(payload).forEach((row) => {
   const videoId = String(row.video || row.videoId || "")
   const current = byVideoId.get(videoId)
   if (!current) return
   const metrics = Object.fromEntries(
    Object.entries(row)
     .filter(
      ([key]) =>
       key !== "video" &&
       key !== "videoId" &&
       shouldPersistCanonicalAnalyticsMetric(key),
     )
     .map(([key, value]) => [
      VIDEO_METRIC_KEY_ALIASES[key] || key,
      buildMetricValue(toMetricNumber(value), "analytics_api"),
     ]),
   )
   byVideoId.set(videoId, mergeMetricWindows(current, window, metrics))
  })
  audit.push({
   id: `${syncRunId}::video_metrics::${window}`,
   channelId,
   syncRunId,
   stage: "video_metrics",
   source: "analytics_api",
   window,
   recordedAt: new Date().toISOString(),
   payload: {
    columnHeaders: payload?.columnHeaders || [],
    rowCount: Array.isArray(payload?.rows) ? payload.rows.length : 0,
    syncDiagnostics: payload?.syncDiagnostics || null,
   },
  })
 }
 return { records: Array.from(byVideoId.values()), audit }
}
