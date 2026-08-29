import type { VtSyncResultNoun } from "../adapters/contracts"

export type VtSyncTrafficDetailFamily = "literal" | "video" | "channel"

export type VtSyncTrafficDetailSourceDefinition = {
 categoryId: string
 sourceType: string
 label: string
 family: VtSyncTrafficDetailFamily
 detailLabel: string
 resultNoun: VtSyncResultNoun
 viewShareLabel: string
 watchShareLabel: string
 legacyField?: string
 requiredCapability?: "youtube_content_owner"
 reportAvailability?: "channel" | "unsupported_channel_report" | "per_video_unvalidated"
}

/** Exact supported insightTrafficSourceDetail contract. Everything user-facing
 * and every query is generated from this registry. */
export const VT_SYNC_TRAFFIC_DETAIL_SOURCES: readonly VtSyncTrafficDetailSourceDefinition[] = [
 { categoryId: "advertising", sourceType: "ADVERTISING", label: "Advertising", family: "literal", detailLabel: "Advertising Types", resultNoun: { singular: "advertising type", plural: "advertising types" }, viewShareLabel: "% of Advertising Views", watchShareLabel: "% of Advertising Watch Time", legacyField: "trafficAdvertising" },
 { categoryId: "ext_websites", sourceType: "EXT_URL", label: "External Websites", family: "literal", detailLabel: "External Websites", resultNoun: { singular: "external website", plural: "external websites" }, viewShareLabel: "% of External Views", watchShareLabel: "% of External Watch Time", legacyField: "extWebsites" },
 { categoryId: "hashtags", sourceType: "HASHTAGS", label: "Hashtags", family: "literal", detailLabel: "Hashtags", resultNoun: { singular: "hashtag", plural: "hashtags" }, viewShareLabel: "% of Hashtag Views", watchShareLabel: "% of Hashtag Watch Time", legacyField: "hashtags" },
 { categoryId: "traffic_notification", sourceType: "NOTIFICATION", label: "Notifications", family: "literal", detailLabel: "Notification Sources", resultNoun: { singular: "notification source", plural: "notification sources" }, viewShareLabel: "% of Notification Views", watchShareLabel: "% of Notification Watch Time", legacyField: "trafficNotification", reportAvailability: "unsupported_channel_report" },
 { categoryId: "traffic_subscribers", sourceType: "SUBSCRIBER", label: "Subscriber Detail", family: "literal", detailLabel: "Subscriber Sources", resultNoun: { singular: "subscriber source", plural: "subscriber sources" }, viewShareLabel: "% of Subscriber Views", watchShareLabel: "% of Subscriber Watch Time", legacyField: "trafficSubscriberData" },
 { categoryId: "other_features", sourceType: "YT_OTHER_PAGE", label: "Other YouTube Pages", family: "literal", detailLabel: "Other YouTube Pages", resultNoun: { singular: "YouTube page", plural: "YouTube pages" }, viewShareLabel: "% of Other Page Views", watchShareLabel: "% of Other Page Watch Time", legacyField: "trafficOtherFeatures" },
 { categoryId: "search_terms", sourceType: "YT_SEARCH", label: "Search Terms", family: "literal", detailLabel: "YouTube Search Terms", resultNoun: { singular: "search term", plural: "search terms" }, viewShareLabel: "% of Search Views", watchShareLabel: "% of Search Watch Time", legacyField: "searchTerms" },
 { categoryId: "traffic_end_screen", sourceType: "END_SCREEN", label: "End Screens", family: "video", detailLabel: "Video", resultNoun: { singular: "video", plural: "videos" }, viewShareLabel: "% of End Screen Views", watchShareLabel: "% of End Screen Watch Time", legacyField: "trafficEndScreen", reportAvailability: "unsupported_channel_report" },
 { categoryId: "suggested_videos", sourceType: "RELATED_VIDEO", label: "Suggested Videos", family: "video", detailLabel: "Video", resultNoun: { singular: "video", plural: "videos" }, viewShareLabel: "% of Suggested Views", watchShareLabel: "% of Suggested Watch Time", legacyField: "suggestedVideos" },
 { categoryId: "sound_pages", sourceType: "SOUND_PAGE", label: "Sound Pages", family: "video", detailLabel: "Video", resultNoun: { singular: "video", plural: "videos" }, viewShareLabel: "% of Sound Page Views", watchShareLabel: "% of Sound Page Watch Time", legacyField: "soundPages" },
 { categoryId: "traffic_video_remixes", sourceType: "VIDEO_REMIXES", label: "Video Remixes", family: "video", detailLabel: "Video", resultNoun: { singular: "video", plural: "videos" }, viewShareLabel: "% of Remix Views", watchShareLabel: "% of Remix Watch Time", reportAvailability: "unsupported_channel_report" },
 { categoryId: "traffic_watch_with", sourceType: "WATCH_WITH", label: "Watch With", family: "video", detailLabel: "Video", resultNoun: { singular: "video", plural: "videos" }, viewShareLabel: "% of Watch With Views", watchShareLabel: "% of Watch With Watch Time", reportAvailability: "per_video_unvalidated" },
 { categoryId: "channel_pages", sourceType: "YT_CHANNEL", label: "Channel Pages", family: "channel", detailLabel: "Channel", resultNoun: { singular: "channel", plural: "channels" }, viewShareLabel: "% of Channel Page Views", watchShareLabel: "% of Channel Page Watch Time", legacyField: "trafficChannelPages" },
 { categoryId: "traffic_campaign_card", sourceType: "CAMPAIGN_CARD", label: "Campaign Cards", family: "video", detailLabel: "Video", resultNoun: { singular: "video", plural: "videos" }, viewShareLabel: "% of Campaign Card Views", watchShareLabel: "% of Campaign Card Watch Time", legacyField: "trafficCampaignCard", requiredCapability: "youtube_content_owner" },
]

/** CMS surfaces stay absent from production bundles until the Partner scope is
 * approved and explicitly enabled. */
export const VT_SYNC_CONTENT_OWNER_REPORTS_ENABLED =
 import.meta.env.VITE_YOUTUBE_CONTENT_OWNER_DISCOVERY_ENABLED === "true"

export const getVtSyncAvailableTrafficDetailSources = () =>
 VT_SYNC_TRAFFIC_DETAIL_SOURCES.filter((source) =>
  (source.reportAvailability === undefined || source.reportAvailability === "channel") &&
  (!source.requiredCapability || VT_SYNC_CONTENT_OWNER_REPORTS_ENABLED),
 )

export const getVtSyncTrafficDetailSourceByCategory = (categoryId: string) =>
 VT_SYNC_TRAFFIC_DETAIL_SOURCES.find((source) => source.categoryId === categoryId)

export const getVtSyncTrafficDetailSourceByType = (sourceType: string) =>
 VT_SYNC_TRAFFIC_DETAIL_SOURCES.find((source) => source.sourceType === sourceType)
