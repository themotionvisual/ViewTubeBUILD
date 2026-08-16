import type {
 CanonicalChannelRecord,
 CanonicalThumbnailSet,
 CanonicalTopicDetails,
} from "../contracts"

const normalizeTags = (raw: unknown): string[] => {
 if (Array.isArray(raw)) {
  return raw.map((value) => String(value || "").trim()).filter(Boolean)
 }
 if (typeof raw !== "string") return []
 return raw
  .split(/[\s,]+/)
  .map((value) => value.trim())
  .filter(Boolean)
}

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
 topicNames: Array.isArray(raw?.topicNames)
  ? raw.topicNames.map((value: unknown) => String(value || "")).filter(Boolean)
  : [],
})

export const normalizeChannelRecord = (channel: any): CanonicalChannelRecord => {
 const branding = channel?.brandingSettings?.channel || {}
 const handle = String(
  channel?.handle || channel?.snippet?.customUrl || branding?.customUrl || "",
 ).replace(/^@/, "")

 return {
  channelId: String(channel?.id || ""),
  handle: handle || null,
  title: String(channel?.snippet?.title || ""),
  description: String(channel?.snippet?.description || ""),
  publishedAt: String(channel?.snippet?.publishedAt || "") || null,
  tags: normalizeTags(branding?.keywords),
  url: handle
   ? `https://www.youtube.com/@${handle}`
   : channel?.id
    ? `https://www.youtube.com/channel/${String(channel.id)}`
    : undefined,
  thumbnails: normalizeThumbnailSet(channel?.snippet?.thumbnails),
  country: String(channel?.snippet?.country || branding?.country || "") || null,
  uploadsPlaylistId:
   String(channel?.contentDetails?.relatedPlaylists?.uploads || "") || null,
  unsubscribedTrailer:
   String(branding?.unsubscribedTrailer || "") || null,
  currentSubscribers:
   channel?.statistics?.hiddenSubscriberCount || channel?.statistics?.subscriberCount == null
    ? null
    : Number(channel.statistics.subscriberCount),
  publicVideoCount:
   channel?.statistics?.videoCount == null ? null : Number(channel.statistics.videoCount),
  publicViewCount:
   channel?.statistics?.viewCount == null ? null : Number(channel.statistics.viewCount),
  categoryId: null,
  categoryName: null,
  topicDetails: normalizeTopicDetails(channel?.topicDetails),
  defaultLanguage: String(channel?.snippet?.defaultLanguage || "") || null,
  localized:
   channel?.snippet?.localized && typeof channel.snippet.localized === "object"
    ? channel.snippet.localized
    : undefined,
  localizations:
   channel?.localizations && typeof channel.localizations === "object"
    ? channel.localizations
    : undefined,
  status:
   channel?.status && typeof channel.status === "object" ? channel.status : undefined,
  syncedAt: new Date().toISOString(),
 }
}
