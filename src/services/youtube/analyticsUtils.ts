import { YouTubeReportHeader, YouTubeReportPayload, AnalyticsRequestClass, AnalyticsMetricGroupName } from "./analyticsTypes";
import { filterSupportedMetrics } from "../analyticsContract";
import { VIDEO_METRIC_GROUPS, ANALYTICS_VIDEO_PAGE_SIZE } from "./analyticsRegistry";

export const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
  if (chunkSize <= 0) return [items]
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize))
  }
  return chunks
}

export const flattenReportPayloads = (payloadList: any[]): YouTubeReportPayload => {
  const rowsOut: any[] = []
  let headersOut: YouTubeReportHeader[] = []
  payloadList.forEach((payload) => {
    if (!payload || !Array.isArray(payload.rows) || !Array.isArray(payload.columnHeaders)) return
    if (headersOut.length === 0) {
      headersOut = payload.columnHeaders.map((header: any) => ({
        name: String(header?.name || ""),
      }))
    }
    payload.rows.forEach((row: any) => {
      if (Array.isArray(row)) rowsOut.push(row)
    })
  })
  return { columnHeaders: headersOut, rows: rowsOut }
}

export const filterPayloadToTargetVideos = (payload: any, targetVideoIdSet: Set<string>): any => {
  if (targetVideoIdSet.size === 0) return payload
  if (!payload || !Array.isArray(payload.columnHeaders) || !Array.isArray(payload.rows)) return payload
  const headers = payload.columnHeaders.map((header: any) => String(header?.name || "").toLowerCase())
  const videoIdx = headers.findIndex((header: string) => header === "video" || header === "videoid")
  if (videoIdx < 0) return payload
  return {
    ...payload,
    rows: payload.rows.filter((row: any) => {
      if (!Array.isArray(row)) return false
      const videoId = String(row[videoIdx] || "")
      return targetVideoIdSet.has(videoId)
    }),
  }
}

export const parseVideoFilterIds = (filter: string): string[] | null => {
  if (!filter.startsWith("video==")) return null
  const ids = filter.slice("video==".length).split(",").map(id => id.trim()).filter(Boolean)
  return ids.length > 0 ? ids : null
}

export const buildVideoFilterCandidates = (
  videoIds: string[],
  urlIdsForFiltered: string,
  startDate: string,
  endDate: string,
  maxMetricsString: string,
  maxRequestChars: number
): string[] => {
  if (videoIds.length === 0) return []
  const basePrefix = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${urlIdsForFiltered}&startDate=${startDate}&endDate=${endDate}&metrics=${maxMetricsString}&dimensions=video&filters=`
  const baseSuffix = `&maxResults=${ANALYTICS_VIDEO_PAGE_SIZE}`
  const candidates: string[] = []
  let current: string[] = []
  const flush = () => {
    if (current.length === 0) return
    candidates.push(`video==${current.join(",")}`)
    current = []
  }
  for (const videoId of videoIds) {
    if (current.length >= 25) flush()
    current.push(videoId)
    const filterValue = `video==${current.join(",")}`
    const encoded = encodeURIComponent(filterValue)
    const nextUrlLen = basePrefix.length + encoded.length + baseSuffix.length
    if (nextUrlLen > maxRequestChars && current.length > 1) {
      current.pop()
      flush()
      current.push(videoId)
    }
  }
  flush()
  return candidates
}

export const buildScopedVideoMetricGroups = (): Record<AnalyticsMetricGroupName, string[]> => ({
  core_performance: filterSupportedMetrics(VIDEO_METRIC_GROUPS.core_performance, "youtube_analytics_v2", "video"),
  engagement: filterSupportedMetrics(VIDEO_METRIC_GROUPS.engagement, "youtube_analytics_v2", "video"),
  impressions_ctr: filterSupportedMetrics(VIDEO_METRIC_GROUPS.impressions_ctr, "youtube_analytics_v2", "video"),
  monetization: filterSupportedMetrics(VIDEO_METRIC_GROUPS.monetization, "youtube_analytics_v2", "video"),
  audience_mix: filterSupportedMetrics(VIDEO_METRIC_GROUPS.audience_mix, "youtube_analytics_v2", "video"),
  end_screen: filterSupportedMetrics(VIDEO_METRIC_GROUPS.end_screen, "youtube_analytics_v2", "video"),
})

export const getAnalyticsRequestClass = (ids: string, metrics: string[]): AnalyticsRequestClass => {
  if (metrics.includes("creatorContentType")) return "channel_creator_content_type"
  return ids.startsWith("video==") ? "video_filter_chunk" : "video_top_videos_channel_filter"
}

export const buildChannelScopedVideoIdCandidates = (channelId?: string): string[] =>
  Array.from(new Set(channelId ? ["channel==MINE", `channel==${channelId}`] : ["channel==MINE"]))

const THUMBNAIL_VIDEO_METRICS = new Set<string>(["videoThumbnailImpressions", "videoThumbnailImpressionsClickRate"])

export const shouldForceViewsMetric = (ids: string, metrics: string[], includeContentType: boolean): boolean => {
  if (includeContentType || ids.startsWith("video==") || metrics.length === 0) return false
  return !metrics.every(m => THUMBNAIL_VIDEO_METRICS.has(m))
}

export const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null) return undefined
  if (!("status" in error)) return undefined
  const status = Number((error as any).status)
  return Number.isFinite(status) ? status : undefined
}
