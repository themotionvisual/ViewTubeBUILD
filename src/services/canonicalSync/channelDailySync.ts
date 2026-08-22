import type {
 CanonicalChannelDailyRow,
 CanonicalMetricMetaMap,
 CanonicalMetricValue,
 CanonicalNumericMetricMap,
 CanonicalRawAuditEntry,
} from "./contracts"
import {
 fetchCanonicalAnalyticsReport,
 isoDate,
 rowsToObjects,
 toMetricNumber,
} from "./query"
import { buildMetricValue } from "./normalizers/video"

const DAILY_METRICS = [
 "views",
 "estimatedMinutesWatched",
 "averageViewDuration",
 "averageViewPercentage",
 "engagedViews",
 "subscribersGained",
 "subscribersLost",
 "likes",
 "dislikes",
 "comments",
 "shares",
 "videosAddedToPlaylists",
 "estimatedRevenue",
]

const splitMetricMap = (
 metrics: Record<string, CanonicalMetricValue>,
): { values: CanonicalNumericMetricMap; meta: CanonicalMetricMetaMap } => {
 const values: CanonicalNumericMetricMap = {}
 const meta: CanonicalMetricMetaMap = {}
 Object.entries(metrics).forEach(([metricKey, metricValue]) => {
  values[metricKey] = metricValue.value
  meta[metricKey] = {
   source: metricValue.source,
   availability: metricValue.availability,
   reasonCode: metricValue.reasonCode,
   confidence: metricValue.confidence,
   syncedAt: metricValue.syncedAt,
  }
 })
 return { values, meta }
}

const toValidDate = (value?: string | null): Date | null => {
 if (!value) return null
 const parsed = new Date(value)
 return Number.isNaN(parsed.getTime()) ? null : parsed
}

const resolveDailyRange = (channelPublishedAt?: string | null) => {
 const end = new Date()
 end.setUTCDate(end.getUTCDate() - 1)
 const endDate = isoDate(end)
 const publishedDate = toValidDate(channelPublishedAt)
 return {
  startDate: publishedDate ? isoDate(publishedDate) : "2000-01-01",
  endDate,
 }
}

export const sumLastTwoCompleteDaysViews = (
 rows: CanonicalChannelDailyRow[],
): number | null => {
 const values = rows
  .filter((row) => row.date)
  .slice()
  .sort((left, right) => right.date.localeCompare(left.date))
  .slice(0, 2)
  .map((row) => row.metrics.views)
 if (values.length < 2 || values.some((value) => value === null || value === undefined)) {
  return null
 }
 return values.reduce<number>((sum, value) => sum + Number(value), 0)
}

export const syncRecentCompleteDailyViews = async (
 channelId: string,
 syncRunId: string,
 days = 8,
): Promise<{ rows: CanonicalChannelDailyRow[]; audit: CanonicalRawAuditEntry }> => {
 const end = new Date()
 end.setUTCDate(end.getUTCDate() - 1)
 const start = new Date(end)
 start.setUTCDate(start.getUTCDate() - Math.max(1, days - 1))
 const payload = await fetchCanonicalAnalyticsReport({
  startDate: isoDate(start),
  endDate: isoDate(end),
  metrics: ["views"],
  dimensions: ["day"],
  sort: ["day"],
  maxResults: days,
 }, "Failed to fetch recent complete daily views")
 const rows = rowsToObjects(payload).map((row) => {
  const viewMetric = buildMetricValue(toMetricNumber(row.views), "analytics_api")
  return {
   channelId,
   date: String(row.day || ""),
   metrics: { views: viewMetric.value },
   metricMeta: { views: {
    source: viewMetric.source,
    availability: viewMetric.availability,
    reasonCode: viewMetric.reasonCode,
    confidence: viewMetric.confidence,
    syncedAt: viewMetric.syncedAt,
   } },
   syncedAt: new Date().toISOString(),
  }
 })
 return {
  rows,
  audit: {
   id: `${syncRunId}::channel_daily::recent_complete`,
   channelId,
   syncRunId,
   stage: "channel_daily",
   source: "analytics_api",
   window: "7d",
   recordedAt: new Date().toISOString(),
   payload: compactAuditPayload(payload),
  },
 }
}

const buildDailyMetricMap = (row: Record<string, unknown>) => {
 const metrics = Object.fromEntries(
  DAILY_METRICS.map((metricKey) => [
   metricKey,
   buildMetricValue(
    toMetricNumber(row[metricKey]),
    "analytics_api",
    metricKey in row ? "available" : "unsupported",
    metricKey in row ? undefined : "metric_not_supported_in_day_report",
   ),
  ]),
 )
 const minutes = metrics.estimatedMinutesWatched?.value ?? null
 metrics.watchMinutes = buildMetricValue(minutes, "analytics_api")
 metrics.watchHours = buildMetricValue(
  minutes === null ? null : minutes / 60,
  "analytics_api",
 )
 metrics.subscribers = buildMetricValue(
  (metrics.subscribersGained?.value ?? 0) - (metrics.subscribersLost?.value ?? 0),
  "derived",
 )
 metrics.revenue = metrics.estimatedRevenue
 delete metrics.estimatedRevenue
 return splitMetricMap(metrics)
}

const compactAuditPayload = (payload: any) => ({
 kind: payload?.kind || "",
 columnHeaders: Array.isArray(payload?.columnHeaders) ? payload.columnHeaders : [],
 rowCount: Array.isArray(payload?.rows) ? payload.rows.length : 0,
 firstDate:
  Array.isArray(payload?.rows) && Array.isArray(payload.rows[0])
   ? payload.rows[0][0]
   : null,
 lastDate:
  Array.isArray(payload?.rows) && Array.isArray(payload.rows[payload.rows.length - 1])
   ? payload.rows[payload.rows.length - 1][0]
   : null,
})

export const syncChannelDailySeries = async (
 channelId: string,
 syncRunId: string,
 channelPublishedAt?: string | null,
): Promise<{
 rows: CanonicalChannelDailyRow[]
 audit: CanonicalRawAuditEntry[]
}> => {
 const { startDate, endDate } = resolveDailyRange(channelPublishedAt)
  const payload = await fetchCanonicalAnalyticsReport(
   {
    startDate,
    endDate,
    metrics: DAILY_METRICS,
    dimensions: ["day"],
    sort: ["day"],
    maxResults: 5000,
   },
   "Failed to fetch canonical channel daily metrics",
  )
 const rows = rowsToObjects(payload).map((row) => {
  const { values, meta } = buildDailyMetricMap(row)
  return {
   channelId,
   date: String(row.day || ""),
   metrics: values,
   metricMeta: meta,
   syncedAt: new Date().toISOString(),
  }
 })
 return {
  rows,
  audit: [
   {
    id: `${syncRunId}::channel_daily::lifetime`,
    channelId,
    syncRunId,
    stage: "channel_daily",
    source: "analytics_api",
    window: "lifetime",
    recordedAt: new Date().toISOString(),
    payload: compactAuditPayload(payload),
   },
  ],
 }
}
