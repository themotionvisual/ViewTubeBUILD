import {
 handleYouTubeApiError,
 proxyFetch,
 refreshTokenIfExpired,
} from "../youtube/youtubeApiClient"
import type { AnalyticsWindow } from "./contracts"

type AnalyticsQueryParams = {
 ids?: string
 startDate: string
 endDate: string
 metrics: string[]
 dimensions?: string[]
 filters?: string[]
 sort?: string[]
 maxResults?: number
 startIndex?: number
}

export const isoDate = (date: Date): string => date.toISOString().split("T")[0]

export const getWindowRange = (
 window: AnalyticsWindow,
): { startDate: string; endDate: string } => {
 const endDate = new Date()
 if (window === "lifetime") {
  return { startDate: "2000-01-01", endDate: isoDate(endDate) }
 }
 const lookback =
  window === "365d" ? 365 : window === "90d" ? 90 : window === "28d" ? 28 : 7
 const startDate = new Date(endDate)
 startDate.setDate(startDate.getDate() - (lookback - 1))
 return { startDate: isoDate(startDate), endDate: isoDate(endDate) }
}

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
 if (sort) params.set("sort", sort)
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
 const token = await refreshTokenIfExpired()
 if (!token) {
  throw new Error("Missing valid YouTube token for canonical analytics query.")
 }
 const response = await proxyFetch(buildAnalyticsUrl(params), {
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
  .filter((row): row is Record<string, unknown> => !!row)
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
