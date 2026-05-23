export type ApiFamily = "youtube_data_v3" | "youtube_analytics_v2" | "youtube_reporting_v1"

export type AccountContext = "creator" | "content_owner" | "unknown"

export type AdapterOutcome = "ok" | "degraded" | "unsupported" | "auth_required"

export type RequestValidationResult =
 | {
    ok: true
    capabilityKey: string
   }
 | {
    ok: false
    capabilityKey: string
    reasonCode: string
    reason: string
    outcome: AdapterOutcome
   }

export type ToolCapabilityStatus = "full" | "partial" | "blocked"

export interface ApiCapabilityDefinition {
 key: string
 family: ApiFamily
 sampleAction: string
 endpointPattern: string
 requiredScopes: string[]
 supportedAccountContexts: AccountContext[]
 tools: string[]
 fallbackBehavior: string
 enabled: boolean
}

export interface ApiCapabilityRegistry {
 version: string
 generatedAt: string
 capabilities: ApiCapabilityDefinition[]
}

const ACCOUNT_ANY: AccountContext[] = ["creator", "content_owner", "unknown"]
const ACCOUNT_CREATOR: AccountContext[] = ["creator", "unknown"]
const ACCOUNT_OWNER: AccountContext[] = ["content_owner"]

export const API_CAPABILITY_REGISTRY: ApiCapabilityRegistry = {
 version: "2026-05-06.v1",
 generatedAt: "2026-05-06T00:00:00.000Z",
 capabilities: [
  {
   key: "data.channel.profile",
   family: "youtube_data_v3",
   sampleAction: "channels.list(mine=true)",
   endpointPattern: "/youtube/v3/channels",
   requiredScopes: ["youtube.readonly"],
   supportedAccountContexts: ACCOUNT_ANY,
   tools: ["settings", "channel-analysis", "performance-hub"],
   fallbackBehavior: "degraded: cached profile",
   enabled: true,
  },
  {
   key: "data.videos.list",
   family: "youtube_data_v3",
   sampleAction: "videos.list",
   endpointPattern: "/youtube/v3/videos",
   requiredScopes: ["youtube.readonly"],
   supportedAccountContexts: ACCOUNT_ANY,
   tools: ["video-manager", "performance-hub", "research-lab"],
   fallbackBehavior: "degraded: reduced columns",
   enabled: true,
  },
  {
   key: "data.playlistItems.list",
   family: "youtube_data_v3",
   sampleAction: "playlistItems.list",
   endpointPattern: "/youtube/v3/playlistItems",
   requiredScopes: ["youtube.readonly"],
   supportedAccountContexts: ACCOUNT_ANY,
   tools: ["video-manager", "performance-hub"],
   fallbackBehavior: "fallback search path",
   enabled: true,
  },
  {
   key: "data.comments.manage",
   family: "youtube_data_v3",
   sampleAction: "comments.insert/update",
   endpointPattern: "/youtube/v3/comments",
   requiredScopes: ["youtube.force-ssl"],
   supportedAccountContexts: ACCOUNT_CREATOR,
   tools: ["video-manager", "engagement-tools"],
   fallbackBehavior: "unsupported: hide comment write actions",
   enabled: true,
  },
  {
   key: "data.uploads.manage",
   family: "youtube_data_v3",
   sampleAction: "videos.insert/thumbnails.set",
   endpointPattern: "/upload/youtube/v3",
   requiredScopes: ["youtube.upload"],
   supportedAccountContexts: ACCOUNT_CREATOR,
   tools: ["video-publisher", "video-manager"],
   fallbackBehavior: "auth_required",
   enabled: true,
  },
  {
   key: "analytics.reports.video",
   family: "youtube_analytics_v2",
   sampleAction: "reports.query(dimensions=video)",
   endpointPattern: "/v2/reports",
   requiredScopes: ["yt-analytics.readonly"],
   supportedAccountContexts: ACCOUNT_ANY,
   tools: ["performance-hub", "analytics-sync"],
   fallbackBehavior: "degraded: partial metric groups",
   enabled: true,
  },
  {
   key: "analytics.reports.channel",
   family: "youtube_analytics_v2",
   sampleAction: "reports.query(dimensions=day)",
   endpointPattern: "/v2/reports",
   requiredScopes: ["yt-analytics.readonly"],
   supportedAccountContexts: ACCOUNT_ANY,
   tools: ["performance-hub", "channel-analysis"],
   fallbackBehavior: "degraded: historical only",
   enabled: true,
  },
  {
   key: "reporting.jobs.manage",
   family: "youtube_reporting_v1",
   sampleAction: "jobs.list/jobs.create/reports.list",
   endpointPattern: "/v1/jobs",
   requiredScopes: ["yt-analytics-monetary.readonly"],
   supportedAccountContexts: ACCOUNT_OWNER,
   tools: ["performance-hub", "data-transparency-center"],
   fallbackBehavior: "unsupported for creator accounts",
   enabled: true,
  },
 ],
}

export const VIDEO_DIMENSION_UNSUPPORTED_METRICS = new Set<string>([
 "uniqueViewers",
 "newViewers",
 "returningViewers",
 "casualViewers",
 "regularViewers",
 "impressions",
 "impressionClickThroughRate",
 "estimatedRevenuePer1000Views",
 "videosAddedToPlaylists",
 "videosRemovedFromPlaylists",
 "annotationClickThroughRate",
 "annotationCloseRate",
 "annotationImpressions",
 "annotationClickableImpressions",
 "annotationClosableImpressions",
 "annotationClicks",
 "annotationCloses",
 "cardClickRate",
 "cardImpressions",
 "cardClicks",
 "cardTeaserImpressions",
 "cardTeaserClicks",
 "cardTeaserClickRate",
 "videoThumbnailImpressions",
 "videoThumbnailImpressionsClickRate",
])

export const validateAnalyticsVideoRequest = (
 metrics: string[],
 capabilityKey = "analytics.reports.video",
): RequestValidationResult => {
 const capability = API_CAPABILITY_REGISTRY.capabilities.find(
  (entry) => entry.key === capabilityKey && entry.enabled,
 )
 if (!capability) {
  return {
   ok: false,
   capabilityKey,
   reasonCode: "capability_disabled",
   reason: "Capability is disabled in registry.",
   outcome: "unsupported",
  }
 }

 const blocked = metrics.filter((metric) =>
  VIDEO_DIMENSION_UNSUPPORTED_METRICS.has(metric),
 )
 if (blocked.length > 0) {
  return {
   ok: false,
   capabilityKey,
   reasonCode: "metric_not_supported_for_video_dimension",
   reason: `Unsupported metrics for video dimension: ${blocked.join(", ")}`,
   outcome: "unsupported",
  }
 }

 return { ok: true, capabilityKey }
}

export const evaluateToolCapabilityStatus = (
 toolId: string,
 accountContext: AccountContext,
): ToolCapabilityStatus => {
 const toolEntries = API_CAPABILITY_REGISTRY.capabilities.filter((capability) =>
  capability.tools.includes(toolId),
 )
 if (toolEntries.length === 0) return "blocked"
 const enabled = toolEntries.filter((capability) => capability.enabled)
 if (enabled.length === 0) return "blocked"

 const supported = enabled.filter((capability) =>
  capability.supportedAccountContexts.includes(accountContext),
 )
 if (supported.length === enabled.length) return "full"
 if (supported.length === 0) return "blocked"
 return "partial"
}

