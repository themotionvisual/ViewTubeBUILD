import {
 handleYouTubeApiError,
 proxyFetch,
 refreshTokenIfExpired,
} from "../youtube/youtubeApiClient"
import type { AnalyticsWindow, AnalyticsPeriod } from "./contracts"
import { isoDate, resolveWindowRange } from "../analytics/windows"
import { reportDiagnostic } from "../diagnostics"
import {
 sanitizeAnalyticsMetrics,
 resolveAnalyticsQueryScope,
} from "../youtube/analyticsMetricSanitizer"

type AnalyticsQueryParams = {
 ids?: string
 startDate: string
 endDate: string
 metrics: string[]
 dimensions?: string[]
 filters?: string[]
 sort?: string | string[]
 maxResults?: number
 startIndex?: number
}

export { isoDate }

/**
 * Resolve a canonical window to an Analytics date range.
 *
 * Delegates to the shared resolver so every dataset ends its window on the
 * last COMPLETE analytics day. This previously ended at `new Date()`, which
 * always included today's partial row — a rounding error at 365d, but up to a
 * 14% understatement at 7d, and it made these datasets disagree with the
 * channel window summaries that already resolved the range correctly.
 *
 * Pass `channelPublishedAt` where the caller has it so lifetime starts at the
 * channel's first day and short windows on a young channel report
 * `coverage: "partial"` instead of silently covering less time than their name.
 */
export const getWindowRange = (
 window: AnalyticsWindow,
 options: {
  period?: AnalyticsPeriod
  channelPublishedAt?: string | null
  endDate?: Date
 } = {},
): { startDate: string; endDate: string; coverage: "complete" | "partial" } =>
 resolveWindowRange({ window, ...options })

const buildAnalyticsUrl = ({
 ids = "channel==MINE",
 startDate,
 endDate,
 metrics,
 dimensions = [],
 filters = [],
 sort,
 maxResults,
 startIndex,
}: AnalyticsQueryParams): string => {
 const params = new URLSearchParams({
  ids,
  startDate,
  endDate,
  metrics: metrics.join(","),
 })
 if (dimensions.length > 0) params.set("dimensions", dimensions.join(","))
 if (filters.length > 0) params.set("filters", filters.join(";"))
 if (sort) params.set("sort", Array.isArray(sort) ? sort.join(",") : sort)
 if (typeof maxResults === "number" && maxResults > 0) {
  params.set("maxResults", String(maxResults))
 }
 if (typeof startIndex === "number" && startIndex > 0) {
  params.set("startIndex", String(startIndex))
 }
 return `https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`
}

export const fetchCanonicalAnalyticsReport = async (
 params: AnalyticsQueryParams,
 failureContext: string,
): Promise<any> => {
 const sanitized = sanitizeAnalyticsMetrics(params.metrics, {
  scope: resolveAnalyticsQueryScope(params.ids),
  dimensions: params.dimensions,
 })
 if (sanitized.skipped.length) {
  reportDiagnostic({
   area: "youtube-analytics",
   event: "metrics_sanitized",
   level: "warn",
   whatHappened: "Unsupported metrics were removed before a YouTube Analytics request.",
   whatItMeans: "Video-level reach metrics cannot be requested in a dimensionless channel summary.",
   whatToCheck: ["Requested dimensions", "Metric source layer", "Video report shape"],
   debugData: {
    scope: resolveAnalyticsQueryScope(params.ids),
    dimensions: params.dimensions || [],
    skipped: sanitized.skipped,
   },
  })
 }
 if (!sanitized.allowed.length) {
  return {
   columnHeaders: [],
   rows: [],
   skippedMetrics: sanitized.skipped,
  }
 }
 const token = await refreshTokenIfExpired()
 if (!token) {
  throw new Error("Missing valid YouTube token for canonical analytics query.")
 }
 const response = await proxyFetch(buildAnalyticsUrl({ ...params, metrics: sanitized.allowed }), {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok) {
  await handleYouTubeApiError(response, failureContext)
 }
 return response.json()
}

export const rowsToObjects = (payload: any): Record<string, unknown>[] => {
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
  .filter((row: Record<string, unknown> | null): row is Record<string, unknown> => !!row)
}

export const toMetricNumber = (value: unknown): number | null => {
 if (value === null || value === undefined || value === "") return null
 const numeric = typeof value === "number" ? value : Number(value)
 return Number.isFinite(numeric) ? numeric : null
}

export const chunkItems = <T>(items: T[], size: number): T[][] => {
 const chunks: T[][] = []
 for (let index = 0; index < items.length; index += size) {
  chunks.push(items.slice(index, index + size))
 }
 return chunks
}
