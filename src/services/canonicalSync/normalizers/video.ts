import { getFirstThreeSentences, parseDurationSeconds } from "../../dataUtils"
import type {
 AnalyticsWindow,
 CanonicalCreatorContentType,
 CanonicalMergeLedger,
 CanonicalMetricMeta,
 CanonicalMetricValue,
 CanonicalThumbnailSet,
 CanonicalTopicDetails,
  CanonicalVideoRecord,
  CanonicalSyncSource,
  MetricAvailability,
} from "../contracts"
import {
 buildMergeLedger,
 buildVideoIdentityKey,
 mergeMetricWindowIntoVideoRecord,
} from "../mergeEngine"

const normalizeThumbnailSet = (raw: any): CanonicalThumbnailSet => ({
 default: raw?.default?.url
  ? {
     url: String(raw.default.url),
     width: Number(raw.default.width || 0) || undefined,
     height: Number(raw.default.height || 0) || undefined,
    }
  : undefined,
 medium: raw?.medium?.url
  ? {
     url: String(raw.medium.url),
     width: Number(raw.medium.width || 0) || undefined,
     height: Number(raw.medium.height || 0) || undefined,
    }
  : undefined,
 high: raw?.high?.url
  ? {
     url: String(raw.high.url),
     width: Number(raw.high.width || 0) || undefined,
     height: Number(raw.high.height || 0) || undefined,
    }
  : undefined,
 maxres: raw?.maxres?.url
  ? {
     url: String(raw.maxres.url),
     width: Number(raw.maxres.width || 0) || undefined,
     height: Number(raw.maxres.height || 0) || undefined,
    }
  : undefined,
})

const normalizeTopicDetails = (raw: any): CanonicalTopicDetails => ({
 topicIds: Array.isArray(raw?.topicIds)
  ? raw.topicIds.map((value: unknown) => String(value || "")).filter(Boolean)
  : [],
 topicCategories: Array.isArray(raw?.topicCategories)
  ? raw.topicCategories
     .map((value: unknown) => String(value || ""))
     .filter(Boolean)
  : [],
 topicNames: [],
})

export const inferVideoFormat = (
 durationSeconds: number,
 dimension?: string,
): { format: string; isShort: boolean } => {
 if (dimension === "3d") return { format: "3d", isShort: false }
 return { format: "long", isShort: false }
}

export const inferFormatFromCreatorContentType = (
 creatorContentType: CanonicalCreatorContentType | null | undefined,
 fallbackDurationSeconds: number,
 fallbackDimension?: string,
): { format: string; isShort: boolean } => {
 switch (creatorContentType) {
  case "SHORTS":
   return { format: "shorts", isShort: true }
  case "LIVE_STREAM":
   return { format: "live", isShort: false }
  case "STORY":
   return { format: "story", isShort: true }
  case "VIDEO_ON_DEMAND":
   return { format: "long", isShort: false }
  default:
   return inferVideoFormat(fallbackDurationSeconds, fallbackDimension)
 }
}

export const buildMetricValue = (
 value: number | null,
 source: CanonicalSyncSource,
 availability: MetricAvailability = value === null ? "unavailable" : "available",
 reasonCode?: string,
 syncedAt = new Date().toISOString(),
): CanonicalMetricValue => ({
 value,
 source,
 availability,
 reasonCode,
 confidence: "raw_direct",
 syncedAt,
})

const toMetricMeta = ({
 value: _value,
 ...meta
}: CanonicalMetricValue): CanonicalMetricMeta => meta

const splitMetricMap = (
 metrics: Record<string, CanonicalMetricValue>,
): {
 values: Record<string, number | null>
 meta: Record<string, CanonicalMetricMeta>
} => {
 const values: Record<string, number | null> = {}
 const meta: Record<string, CanonicalMetricMeta> = {}
 Object.entries(metrics).forEach(([metricKey, metricValue]) => {
  values[metricKey] = metricValue.value
  meta[metricKey] = toMetricMeta(metricValue)
 })
 return { values, meta }
}

export const normalizeVideoRecord = (
 channelId: string,
 item: any,
 categoryMap: Record<string, string>,
 syncedAt = new Date().toISOString(),
): CanonicalVideoRecord => {
 const snippet = item?.snippet || {}
 const statistics = item?.statistics || {}
 const contentDetails = item?.contentDetails || {}
 const status = item?.status || {}
 const durationSeconds =
  Number(contentDetails?.durationSeconds || item?.durationSeconds || 0) ||
  parseDurationSeconds(String(contentDetails?.duration || ""))
 const privacyStatus = String(status?.privacyStatus || "")
 const baseFormatInfo = inferVideoFormat(
  durationSeconds,
  String(contentDetails?.dimension || ""),
 )
 const isLive = ["live", "upcoming"].includes(String(snippet?.liveBroadcastContent || "").toLowerCase()) ||
  Boolean(item?.liveStreamingDetails?.actualStartTime)
 const formatInfo = privacyStatus === "private" || privacyStatus === "unlisted"
  ? { format: "unknown", isShort: false }
  : isLive
   ? { format: "live", isShort: false }
   : baseFormatInfo
 const categoryId = String(snippet?.categoryId || item?.categoryId || "")
 const numberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
 }
 const lifetimeMetrics = splitMetricMap({
  views: buildMetricValue(
   numberOrNull(statistics?.viewCount),
   "data_api",
  ),
  likes: buildMetricValue(
   numberOrNull(statistics?.likeCount),
   "data_api",
  ),
  comments: buildMetricValue(
   numberOrNull(statistics?.commentCount),
   "data_api",
  ),
  favoriteCount: buildMetricValue(
   numberOrNull(statistics?.favoriteCount),
   "data_api",
  ),
 })
  return {
  channelId,
  videoId: String(item?.id || item?.videoId || ""),
  identityKey: buildVideoIdentityKey(channelId, String(item?.id || item?.videoId || "")),
  title: String(snippet?.title || item?.title || ""),
  fullDescription: String(snippet?.description || item?.description || ""),
  description: getFirstThreeSentences(String(snippet?.description || item?.description || "")),
  publishedAt: String(snippet?.publishedAt || ""),
  thumbnail:
   String(
    snippet?.thumbnails?.maxres?.url ||
     snippet?.thumbnails?.high?.url ||
     snippet?.thumbnails?.medium?.url ||
     snippet?.thumbnails?.default?.url ||
     "",
   ),
  thumbnails: normalizeThumbnailSet(snippet?.thumbnails),
  tags: Array.isArray(snippet?.tags)
   ? snippet.tags.map((value: unknown) => String(value || "")).filter(Boolean)
   : [],
  categoryId,
  categoryName: categoryMap[categoryId] || "",
  defaultLanguage: String(
   snippet?.defaultLanguage || snippet?.defaultAudioLanguage || "",
  ),
  defaultAudioLanguage: String(snippet?.defaultAudioLanguage || ""),
  localized: snippet?.localized && typeof snippet.localized === "object" ? snippet.localized : undefined,
  localizations: item?.localizations && typeof item.localizations === "object" ? item.localizations : undefined,
  privacyStatus,
 uploadStatus: String(status?.uploadStatus || ""),
 liveBroadcastContent: String(snippet?.liveBroadcastContent || ""),
 liveStreamingDetails: item?.liveStreamingDetails && typeof item.liveStreamingDetails === "object" ? item.liveStreamingDetails : undefined,
 recordingDetails: item?.recordingDetails && typeof item.recordingDetails === "object" ? item.recordingDetails : undefined,
 player: item?.player && typeof item.player === "object" ? item.player : undefined,
 embeddable: typeof status?.embeddable === "boolean" ? status.embeddable : null,
 license: status?.license ? String(status.license) : null,
 madeForKids: typeof status?.madeForKids === "boolean" ? status.madeForKids : null,
 selfDeclaredMadeForKids: typeof status?.selfDeclaredMadeForKids === "boolean" ? status.selfDeclaredMadeForKids : null,
 publicStatsViewable: typeof status?.publicStatsViewable === "boolean" ? status.publicStatsViewable : null,
 caption: contentDetails?.caption != null ? String(contentDetails.caption) : null,
 definition: String(contentDetails?.definition || ""),
 dimension: String(contentDetails?.dimension || ""),
 durationRaw: String(contentDetails?.duration || ""),
 durationSeconds,
 creatorContentType: null,
 format: formatInfo.format,
 isShort: formatInfo.isShort,
 topicDetails: normalizeTopicDetails(item?.topicDetails),
  metricsByWindow: {
   lifetime: lifetimeMetrics.values,
  },
  metricMetaByWindow: {
   lifetime: lifetimeMetrics.meta,
  },
  mergeLedger: buildMergeLedger(channelId, String(item?.id || ""), {
   source: "data_api",
   stage: "video_inventory",
   scope: "record",
  }),
  syncedAt,
 }
}

export const applyCreatorContentType = (
 record: CanonicalVideoRecord,
 creatorContentType: CanonicalCreatorContentType | null | undefined,
): CanonicalVideoRecord => {
 if (!creatorContentType) return record
 const formatInfo = inferFormatFromCreatorContentType(
  creatorContentType,
  record.durationSeconds,
  record.dimension,
 )
 return {
  ...record,
  creatorContentType,
  format: formatInfo.format,
  isShort: formatInfo.isShort,
  syncedAt: new Date().toISOString(),
 }
}

export const mergeMetricWindows = (
 existing: CanonicalVideoRecord,
 window: AnalyticsWindow,
 metrics: Record<string, CanonicalMetricValue>,
): CanonicalVideoRecord => {
 return mergeMetricWindowIntoVideoRecord(
  existing,
  window,
  metrics,
  "video_metrics",
  "analytics_api",
 )
}
