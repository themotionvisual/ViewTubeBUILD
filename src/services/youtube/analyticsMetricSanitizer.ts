export type AnalyticsQueryScope = "channel" | "video" | "content-owner"

export interface AnalyticsMetricContext {
  scope: AnalyticsQueryScope
  dimensions?: readonly string[] | string
}

export interface SkippedAnalyticsMetric {
  metric: string
  reason: "requires_video_dimension"
}

export interface SanitizedAnalyticsMetrics {
  allowed: string[]
  skipped: SkippedAnalyticsMetric[]
}

const VIDEO_DIMENSION_METRICS = new Set([
  "videoThumbnailImpressions",
  "videoThumbnailImpressionsClickRate",
])

const normalizeDimensions = (dimensions: AnalyticsMetricContext["dimensions"]): Set<string> => {
  const values = typeof dimensions === "string" ? dimensions.split(",") : dimensions ?? []
  return new Set(values.map((dimension) => dimension.trim()).filter(Boolean))
}

export const sanitizeAnalyticsMetrics = (
  metrics: readonly string[],
  context: AnalyticsMetricContext,
): SanitizedAnalyticsMetrics => {
  const dimensions = normalizeDimensions(context.dimensions)
  const allowed: string[] = []
  const skipped: SkippedAnalyticsMetric[] = []

  for (const rawMetric of metrics) {
    const metric = String(rawMetric || "").trim()
    if (!metric || allowed.includes(metric) || skipped.some((entry) => entry.metric === metric)) continue
    if (VIDEO_DIMENSION_METRICS.has(metric) && !dimensions.has("video")) {
      skipped.push({ metric, reason: "requires_video_dimension" })
      continue
    }
    allowed.push(metric)
  }

  return { allowed, skipped }
}

export const resolveAnalyticsQueryScope = (ids = "channel==MINE"): AnalyticsQueryScope =>
  ids.startsWith("contentOwner==") ? "content-owner" : "channel"
