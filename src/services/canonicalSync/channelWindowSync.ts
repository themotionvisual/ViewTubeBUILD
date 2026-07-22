import type {
 AnalyticsWindow,
 CanonicalMetricMetaMap,
 CanonicalMetricValue,
 CanonicalNumericMetricMap,
 CanonicalRawAuditEntry,
 ChannelPeriod,
 ChannelWindowSummary,
 ComparableAnalyticsWindow,
} from "./contracts"
import {
 fetchCanonicalAnalyticsReport,
 isoDate,
 toMetricNumber,
} from "./query"
import { buildMetricValue } from "./normalizers/video"

const CURRENT_WINDOWS: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d", "7d"]
const COMPARABLE_WINDOWS: ComparableAnalyticsWindow[] = ["365d", "90d", "28d", "7d"]
const DAY_COUNTS: Record<ComparableAnalyticsWindow, number> = {
 "7d": 7,
 "28d": 28,
 "90d": 90,
 "365d": 365,
}

type MetricBundle = {
 id: string
 metrics: string[]
 fallbackMetrics?: string[]
}

const METRIC_BUNDLES: MetricBundle[] = [
 {
  id: "core",
  metrics: [
   "views",
   "estimatedMinutesWatched",
   "averageViewDuration",
   "averageViewPercentage",
   "subscribersGained",
   "subscribersLost",
  ],
 },
 { id: "engaged_views", metrics: ["engagedViews"] },
 { id: "engagement", metrics: ["likes", "comments", "shares"] },
 {
  id: "reach",
  metrics: ["videoThumbnailImpressions", "videoThumbnailImpressionsClickRate"],
 },
 {
  id: "monetization",
  metrics: [
   "estimatedRevenue",
   "estimatedAdRevenue",
   "estimatedRedPartnerRevenue",
   "adImpressions",
  ],
  fallbackMetrics: ["estimatedRevenue"],
 },
]

const toValidDate = (value?: string | null): Date | null => {
 if (!value) return null
 const parsed = new Date(`${value.slice(0, 10)}T00:00:00Z`)
 return Number.isNaN(parsed.getTime()) ? null : parsed
}

const addUtcDays = (value: Date, days: number): Date => {
 const next = new Date(value)
 next.setUTCDate(next.getUTCDate() + days)
 return next
}

export const latestCompleteAnalyticsDate = (now = new Date()): Date => {
 const value = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
 return addUtcDays(value, -1)
}

export const resolveChannelPeriodRange = (input: {
 window: AnalyticsWindow
 period: ChannelPeriod
 channelPublishedAt?: string | null
 endDate?: Date
}): { startDate: string; endDate: string; coverage: "complete" | "partial" } => {
 const end = input.endDate || latestCompleteAnalyticsDate()
 const published = toValidDate(input.channelPublishedAt)
 let requestedStart: Date
 let requestedEnd = end

 if (input.window === "lifetime") {
  requestedStart = published || new Date("2005-04-23T00:00:00Z")
 } else {
  const days = DAY_COUNTS[input.window]
  if (input.period === "previous") {
   requestedEnd = addUtcDays(end, -days)
   requestedStart = addUtcDays(requestedEnd, -(days - 1))
  } else {
   requestedStart = addUtcDays(end, -(days - 1))
  }
 }

 const clampedStart = published && requestedStart < published ? published : requestedStart
 return {
  startDate: isoDate(clampedStart),
  endDate: isoDate(requestedEnd),
  coverage: clampedStart.getTime() === requestedStart.getTime() ? "complete" : "partial",
 }
}

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

const metricAliases: Record<string, string> = {
 estimatedRevenue: "revenue",
 estimatedRedPartnerRevenue: "youtubePremiumRevenue",
 videoThumbnailImpressions: "impressions",
 videoThumbnailImpressionsClickRate: "ctr",
}

const readPayloadMetrics = (
 payload: any,
 attemptedMetrics: string[],
 reasonCode: string,
): Record<string, CanonicalMetricValue> => {
 const headers = Array.isArray(payload?.columnHeaders)
  ? payload.columnHeaders.map((header: any) => String(header?.name || ""))
  : []
 const firstRow = Array.isArray(payload?.rows) && Array.isArray(payload.rows[0])
  ? payload.rows[0]
  : []
 return Object.fromEntries(attemptedMetrics.map((metricKey) => {
  const targetKey = metricAliases[metricKey] || metricKey
  const index = headers.indexOf(metricKey)
  const value = index >= 0 ? toMetricNumber(firstRow[index]) : null
  return [
   targetKey,
   buildMetricValue(
    value,
    "analytics_api",
    index >= 0 ? "available" : "unsupported",
    index >= 0 ? undefined : reasonCode,
   ),
  ]
 }))
}

const compactAuditPayload = (input: {
 bundleId: string
 attemptedMetrics: string[]
 fallbackMetrics?: string[]
 payload?: any
 error?: unknown
}) => ({
 bundleId: input.bundleId,
 metricsAttempted: input.attemptedMetrics,
 fallbackMetrics: input.fallbackMetrics || [],
 columnHeaders: Array.isArray(input.payload?.columnHeaders) ? input.payload.columnHeaders : [],
 rowCount: Array.isArray(input.payload?.rows) ? input.payload.rows.length : 0,
 firstRow: Array.isArray(input.payload?.rows?.[0]) ? input.payload.rows[0] : [],
 error: input.error instanceof Error ? input.error.message : input.error ? String(input.error) : null,
})

const syncOnePeriod = async (input: {
 channelId: string
 syncRunId: string
 window: AnalyticsWindow
 period: ChannelPeriod
 channelPublishedAt?: string | null
}): Promise<{ summary: ChannelWindowSummary; audit: CanonicalRawAuditEntry[]; partial: boolean }> => {
 const range = resolveChannelPeriodRange(input)
 const rawMetrics: Record<string, CanonicalMetricValue> = {}
 const audit: CanonicalRawAuditEntry[] = []
 let partial = range.coverage === "partial"

 if (range.startDate > range.endDate) {
  for (const bundle of METRIC_BUNDLES) {
   Object.assign(rawMetrics, readPayloadMetrics(null, bundle.metrics, "period_predates_channel"))
  }
  const metricMap = splitMetricMap(rawMetrics)
  return {
   summary: {
    channelId: input.channelId,
    window: input.window,
    period: input.period,
    startDate: range.startDate,
    endDate: range.endDate,
    coverage: "partial",
    syncedAt: new Date().toISOString(),
    metrics: metricMap.values,
    metricMeta: metricMap.meta,
   },
   audit,
   partial: true,
  }
 }

 for (const bundle of METRIC_BUNDLES) {
  let payload: any = null
  let attemptedMetrics = bundle.metrics
  let error: unknown = null
  try {
   payload = await fetchCanonicalAnalyticsReport({
    startDate: range.startDate,
    endDate: range.endDate,
    metrics: attemptedMetrics,
   }, `Failed to fetch ${bundle.id} channel ${input.window} ${input.period} summary`)
  } catch (bundleError) {
   error = bundleError
   if (bundle.fallbackMetrics?.length) {
    try {
     attemptedMetrics = bundle.fallbackMetrics
     payload = await fetchCanonicalAnalyticsReport({
      startDate: range.startDate,
      endDate: range.endDate,
      metrics: attemptedMetrics,
     }, `Failed to fetch ${bundle.id} fallback channel summary`)
     error = null
    } catch (fallbackError) {
     error = fallbackError
    }
   }
  }

  Object.assign(
   rawMetrics,
   readPayloadMetrics(
    payload,
    bundle.metrics,
    error ? `${bundle.id}_bundle_failed` : `${bundle.id}_metric_unavailable`,
   ),
  )
  if (error) partial = true
  audit.push({
   id: `${input.syncRunId}::channel_window::${input.period}::${input.window}::${bundle.id}`,
   channelId: input.channelId,
   syncRunId: input.syncRunId,
   stage: "channel_window",
   source: "analytics_api",
   window: input.window,
   recordedAt: new Date().toISOString(),
   payload: compactAuditPayload({
    bundleId: bundle.id,
    attemptedMetrics: bundle.metrics,
    fallbackMetrics: attemptedMetrics === bundle.metrics ? [] : attemptedMetrics,
    payload,
    error,
   }),
  })
 }

 const minutes = rawMetrics.estimatedMinutesWatched?.value ?? null
 rawMetrics.watchMinutes = buildMetricValue(minutes, "analytics_api")
 rawMetrics.watchHours = buildMetricValue(minutes === null ? null : minutes / 60, "analytics_api")
 const gained = rawMetrics.subscribersGained?.value
 const lost = rawMetrics.subscribersLost?.value
 rawMetrics.netSubscribers = buildMetricValue(
  gained === null || gained === undefined || lost === null || lost === undefined
   ? null
   : gained - lost,
  "derived",
 )
 delete rawMetrics.estimatedMinutesWatched
 const metricMap = splitMetricMap(rawMetrics)
 return {
  summary: {
   channelId: input.channelId,
   window: input.window,
   period: input.period,
   startDate: range.startDate,
   endDate: range.endDate,
   coverage: partial ? "partial" : "complete",
   syncedAt: new Date().toISOString(),
   metrics: metricMap.values,
   metricMeta: metricMap.meta,
  },
  audit,
  partial,
 }
}

export const syncChannelPeriodSummaries = async (
 channelId: string,
 syncRunId: string,
 channelPublishedAt?: string | null,
 options: {
  currentWindows?: AnalyticsWindow[]
  previousWindows?: ComparableAnalyticsWindow[]
 } = {},
): Promise<{
 summaries: ChannelWindowSummary[]
 audit: CanonicalRawAuditEntry[]
 partial: boolean
}> => {
 const requests = [
  ...(options.currentWindows || CURRENT_WINDOWS).map((window) => ({ window, period: "current" as const })),
  ...(options.previousWindows || COMPARABLE_WINDOWS).map((window) => ({ window, period: "previous" as const })),
 ]
 const results = [] as Awaited<ReturnType<typeof syncOnePeriod>>[]
 for (const request of requests) {
  results.push(await syncOnePeriod({
   channelId,
   syncRunId,
   channelPublishedAt,
   ...request,
  }))
 }
 return {
  summaries: results.map((result) => result.summary),
  audit: results.flatMap((result) => result.audit),
  partial: results.some((result) => result.partial),
 }
}

export const syncChannelWindowSummaries = async (
 channelId: string,
 syncRunId: string,
 channelPublishedAt?: string | null,
): Promise<{ summaries: ChannelWindowSummary[]; audit: CanonicalRawAuditEntry[] }> => {
 const result = await syncChannelPeriodSummaries(channelId, syncRunId, channelPublishedAt, {
  previousWindows: [],
 })
 return { summaries: result.summaries, audit: result.audit }
}
