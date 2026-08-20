import type { VtSyncCategoryDefinition } from "../adapters/contracts"

const disabledUnvalidated = (reason: string): Pick<VtSyncCategoryDefinition, "syncStatus" | "disabledReason" | "defaultEnabled"> => ({
 syncStatus: "disabled_unvalidated",
 disabledReason: reason,
 defaultEnabled: false,
})

const STABLE_CATEGORY_IDS = new Set([
 "channel_metadata",
 "uploads_playlist",
 "video_metadata",
 "videos_analytics",
 "channel_totals",
 "revenue_source",
 "daily_metrics",
 "monthly_metrics",
 "traffic_overview",
 "search_terms",
 "ext_websites",
 "suggested_videos",
 "hashtags",
 "sound_pages",
 "advertising",
 "channel_pages",
 "other_features",
 "audience_demographics",
 "creator_content_type",
 "formats_subscriber_status",
 "geography_country",
 "geography_city",
 "geography_province",
 "geography_dma",
 "device_type",
 "operating_system",
 "ad_type",
 "playback_location",
 "subscription_status",
 "playlists_analytics",
 "sharing_service",
 "traffic_subscribers",
 "retention",
 "device_os",
 "traffic_day",
 "traffic_campaign_card",
])

export const VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_IDS = new Set([
 "traffic_shorts",
 "traffic_browse_features",
 "traffic_shorts_content_link",
 "traffic_card",
 "traffic_no_link_embedded",
 "traffic_no_link_other",
 "audience_watch_behavior",
 "new_returning_viewers",
 "demographics_age",
 "demographics_gender",
 "traffic_annotation",
 "traffic_live_redirect",
 "traffic_product_page",
 "traffic_playlist",
 "traffic_yt_playlist_page",
 "traffic_notification",
 "traffic_end_screen",
 "traffic_video_remixes",
 "traffic_watch_with",
])

const normalizeCategory = (category: VtSyncCategoryDefinition): VtSyncCategoryDefinition => {
 if (STABLE_CATEGORY_IDS.has(category.id)) return { ...category, syncStatus: "stable" }
 return {
  ...category,
  ...disabledUnvalidated("Hidden from the active VT Sync controller until this YouTube Analytics query shape is validated."),
 }
}

const runtimePhaseIdForCategory = (category: Omit<VtSyncCategoryDefinition, "runtimePhaseId">): string => {
 if (category.id === "channel_metadata") return "channel_metadata"
 if (category.id === "uploads_playlist") return "uploads_playlist"
 if (category.id === "video_metadata") return "video_metadata"
 if (category.id === "videos_analytics") return "videos_analytics"
 if (category.id === "channel_totals") return "channel_totals"
 if (category.id === "daily_metrics") return "daily_metrics"
 if (category.id === "monthly_metrics") return "monthly_metrics"
 if (category.id === "device_os") return "device_os"
 if (category.id === "traffic_day") return "traffic_day"
 if (category.id === "playlists_analytics") return "playlists_analytics"
 if (category.id === "retention") return "retention"
 if (category.phase === "traffic_sync") return "traffic"
 return "segments"
}

const ALL_VT_SYNC_CATEGORY_OPTION_DEFINITIONS = [
 { id: "channel_metadata", label: "Channel Overview", description: "Channel name, avatar, public counts, handle, description, and uploads playlist identity.", isCore: true, group: "channel", phase: "channel_bootstrap", sourceApi: "youtube_data_v3", quotaClass: "low", defaultEnabled: true, canonicalTargets: ["window_statistics"] },
 { id: "uploads_playlist", label: "Uploads Playlist", description: "Full list of uploaded video IDs from the channel uploads playlist.", isCore: true, group: "videos", phase: "video_inventory", sourceApi: "youtube_data_v3", quotaClass: "medium", defaultEnabled: true, dependsOn: ["channel_metadata"], canonicalTargets: ["master"] },
 { id: "video_metadata", label: "Video Metadata", description: "Titles, descriptions, durations, thumbnails, tags, categories, privacy, captions, and public stats.", isCore: true, group: "videos", phase: "video_inventory", sourceApi: "youtube_data_v3", quotaClass: "medium", defaultEnabled: true, dependsOn: ["uploads_playlist"], canonicalTargets: ["master", "video_statistics"] },
 { id: "videos_analytics", label: "Video Analytics", description: "Per-video views, watch time, subscribers, revenue, cards, end screens, and engagement metrics.", isCore: true, group: "videos", phase: "video_metrics", sourceApi: "youtube_analytics_v2", quotaClass: "high", defaultEnabled: true, dependsOn: ["video_metadata"], canonicalTargets: ["video_statistics", "extended_video_metrics"] },
 { id: "channel_totals", label: "Channel Totals", description: "Lifetime, 365, 90, 28, 7 day and comparison rollups for KPI widgets.", isCore: true, group: "channel", phase: "channel_window", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: true, canonicalTargets: ["window_statistics"] },
 { id: "daily_metrics", label: "Daily Stats", description: "Day-by-day channel-wide views, watch hours, revenue, subscribers, and engagement metrics.", isCore: true, group: "time", phase: "channel_daily", sourceApi: "youtube_analytics_v2", quotaClass: "high", defaultEnabled: true, canonicalTargets: ["daily", "daily_statistics"] },
 { id: "monthly_metrics", label: "Monthly Stats", description: "API-native calendar-month channel-wide views, watch hours, revenue, subscribers, and engagement metrics.", isCore: false, group: "time", phase: "channel_monthly", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, dependsOn: ["channel_metadata"], canonicalTargets: ["monthly"] },
 { id: "traffic_overview", label: "Traffic Sources Overview", description: "High-level traffic source distribution for charts and source modules.", isCore: true, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: true, canonicalTargets: ["traffic", "traffic_sources"] },
 { id: "search_terms", label: "Search Terms", description: "YouTube search queries driving traffic.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_youtube_search_terms", "search_intelligence"] },
 { id: "ext_websites", label: "External Websites", description: "External sites and apps driving traffic.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_external_websites"] },
 { id: "suggested_videos", label: "Suggested Videos", description: "Traffic from other videos' suggested feeds with optional title enrichment.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "high", defaultEnabled: false, canonicalTargets: ["traffic_suggested_videos"] },
 { id: "hashtags", label: "Hashtags", description: "Traffic driven by hashtags.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_hashtags"] },
 { id: "sound_pages", label: "Sound Pages", description: "Traffic from YouTube Shorts sound pages.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_sound_pages"] },
 { id: "advertising", label: "Advertising", description: "Traffic from YouTube ads.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_advertising"] },
 { id: "channel_pages", label: "Channel Pages", description: "Traffic from other YouTube channel pages with optional handle enrichment.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "high", defaultEnabled: false, canonicalTargets: ["traffic_channel_pages"] },
 { id: "other_features", label: "Other Features", description: "Traffic from other YouTube features.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_other_features"] },
 { id: "traffic_shorts", label: "Shorts Feed", description: "Traffic from the YouTube Shorts vertical feed.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_shorts_links"] },
 { id: "traffic_browse_features", label: "Browse Features", description: "Traffic from home screen and subscriptions feed.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_browse_features"] },
 { id: "traffic_annotation", label: "Annotations", description: "Traffic from annotations in other videos.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_details"] },
 { id: "traffic_campaign_card", label: "Campaign Cards", description: "Content-owner traffic from claimed promotional videos.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_details"] },
 { id: "traffic_card", label: "Info Cards", description: "Traffic from Info Cards.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_cards_annotations"] },
 { id: "traffic_end_screen", label: "End Screens", description: "Traffic from End Screens.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_details"] },
 { id: "traffic_live_redirect", label: "Live Redirects", description: "Traffic from live stream redirects.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_details"] },
 { id: "traffic_notification", label: "Notifications", description: "Traffic from YouTube notifications.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_notifications"] },
 { id: "traffic_no_link_embedded", label: "Embedded Players", description: "Traffic from embedded players without explicit links.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["playback_location"] },
 { id: "traffic_no_link_other", label: "Direct/Unknown", description: "Direct traffic or unknown no-link sources.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_other_features"] },
 { id: "traffic_product_page", label: "Product Pages", description: "Traffic from YouTube product pages.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_details"] },
 { id: "traffic_playlist", label: "Playlist Traffic", description: "Traffic from playlists.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_details"] },
 { id: "traffic_yt_playlist_page", label: "YouTube Playlist Pages", description: "Traffic from YouTube playlist pages.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_details"] },
 { id: "traffic_subscribers", label: "Subscriber Traffic Detail", description: "Deep dive into views from subscriber traffic paths.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["top_videos_by_subscriber_status"] },
 { id: "traffic_video_remixes", label: "Video Remixes", description: "Traffic from videos remixed from another video.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_details"] },
 { id: "traffic_watch_with", label: "Watch With", description: "Traffic from Creator Commentary streams.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_details"] },
 { id: "traffic_shorts_content_link", label: "Shorts Content Links", description: "Traffic from Shorts content-link surfaces; tracked as diagnostics if no local table exists.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_shorts_links"] },
 { id: "audience_watch_behavior", label: "Audience Watch Behavior", description: "Views and watch time by audience behavior type.", isCore: false, group: "audience", phase: "audience_segments", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["audience_watch_behavior"] },
 { id: "new_returning_viewers", label: "New vs Returning Viewers", description: "Comparison of new and returning viewers.", isCore: false, group: "audience", phase: "audience_segments", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["audience_new_returning"] },
 { id: "audience_demographics", label: "Audience Demographics", description: "Overall audience age and gender breakdown.", isCore: true, group: "audience", phase: "demographics_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: true, canonicalTargets: ["demographics"] },
 { id: "demographics_age", label: "Demographics by Age", description: "Deep dive into viewer age groups.", isCore: false, group: "audience", phase: "demographics_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, dependsOn: ["audience_demographics"], canonicalTargets: ["demographics_by_age"] },
 { id: "demographics_gender", label: "Demographics by Gender", description: "Deep dive into viewer gender.", isCore: false, group: "audience", phase: "demographics_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, dependsOn: ["audience_demographics"], canonicalTargets: ["demographics_by_gender"] },
 { id: "creator_content_type", label: "Creator Content Type", description: "Performance by content type such as VOD, Shorts, and Live.", isCore: false, group: "audience", phase: "audience_segments", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["audience"] },
 { id: "formats_subscriber_status", label: "Formats x Subscriber Status", description: "Performance by creator content type split by subscribed versus unsubscribed viewers.", isCore: false, group: "channel", phase: "audience_segments", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["formats_subscriber_status"] },
 { id: "geography_country", label: "Geography: Country", description: "Traffic breakdown by country.", isCore: true, group: "geography", phase: "geography_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: true, canonicalTargets: ["country", "geography"] },
 { id: "geography_city", label: "Geography: City", description: "Traffic breakdown by city.", isCore: false, group: "geography", phase: "geography_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["geography_city"] },
 { id: "geography_province", label: "Geography: US States", description: "Traffic breakdown by US state.", isCore: false, group: "geography", phase: "geography_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["geography_province_us"] },
 { id: "geography_dma", label: "Geography: US DMA", description: "Traffic breakdown by US designated market area.", isCore: false, group: "geography", phase: "geography_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["geography"] },
 { id: "device_type", label: "Device Type", description: "Traffic by device type.", isCore: false, group: "device", phase: "audience_segments", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["device", "device_type"] },
 { id: "operating_system", label: "Operating System", description: "Traffic by operating system.", isCore: false, group: "device", phase: "audience_segments", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["operating_system"] },
 { id: "device_os", label: "Device x OS", description: "Combined device type and operating system breakdown.", isCore: false, group: "device", phase: "audience_segments", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["device_os"] },
 { id: "ad_type", label: "Ad Type", description: "Performance by ad type.", isCore: false, group: "revenue", phase: "owner_mode", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["ad_type", "daily_ad_type_performance"] },
 { id: "playback_location", label: "Playback Location", description: "Where videos are being played.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["playback_location", "playback_location"] },
 { id: "traffic_day", label: "Traffic × Day", description: "Daily views and watch time split by traffic source type.", isCore: false, group: "time", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "high", defaultEnabled: false, canonicalTargets: ["traffic_day"] },
 { id: "subscription_status", label: "Subscriber Status", description: "Performance split by subscribed vs non-subscribed viewers.", isCore: false, group: "channel", phase: "audience_segments", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["subscription_status"] },
 { id: "playlists_analytics", label: "Playlists Analytics", description: "Full playlist performance rows, watch time, starts, and saves.", isCore: false, group: "playlists", phase: "playlist_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["playlists_ranked"] },
 { id: "sharing_service", label: "Sharing Service", description: "Where viewers are sharing videos.", isCore: false, group: "traffic", phase: "traffic_sync", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["traffic_other_features"] },
 { id: "revenue_source", label: "Revenue Source", description: "Breakdown of estimated revenue sources.", isCore: false, group: "revenue", phase: "owner_mode", sourceApi: "youtube_analytics_v2", quotaClass: "medium", defaultEnabled: false, canonicalTargets: ["revenue_source"] },
 { id: "retention", label: "Audience Retention", description: "Watch ratios and relative retention performance.", isCore: false, group: "retention", phase: "retention_sync", sourceApi: "youtube_analytics_v2", quotaClass: "high", defaultEnabled: false, dependsOn: ["video_metadata"], canonicalTargets: ["retention_curves"] },
] satisfies Array<Omit<VtSyncCategoryDefinition, "runtimePhaseId">>

const ALL_VT_SYNC_CATEGORY_OPTIONS: VtSyncCategoryDefinition[] = ALL_VT_SYNC_CATEGORY_OPTION_DEFINITIONS
 .map((category) => ({ ...category, runtimePhaseId: runtimePhaseIdForCategory(category) }))
 .map(normalizeCategory)

export const VT_SYNC_CATEGORY_OPTIONS: VtSyncCategoryDefinition[] =
 ALL_VT_SYNC_CATEGORY_OPTIONS.filter((category) => category.syncStatus !== "disabled_unvalidated")

export const VT_SYNC_ALL_CATEGORY_OPTIONS: VtSyncCategoryDefinition[] = ALL_VT_SYNC_CATEGORY_OPTIONS

export const VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS: VtSyncCategoryDefinition[] =
 ALL_VT_SYNC_CATEGORY_OPTIONS.filter((category) => category.syncStatus === "disabled_unvalidated")

export const getVtSyncVisibleCategoryIds = (): string[] =>
 VT_SYNC_CATEGORY_OPTIONS.map((category) => category.id)

export const getVtSyncCoreCategoryIds = (): string[] =>
 VT_SYNC_CATEGORY_OPTIONS.filter((category) => category.isCore).map((category) => category.id)

export const getVtSyncDefaultCategoryIds = (): string[] =>
 VT_SYNC_CATEGORY_OPTIONS.filter((category) => category.defaultEnabled).map((category) => category.id)

export const filterVtSyncVisibleCategoryIds = (categoryIds: string[]): string[] => {
 const visibleIds = new Set(getVtSyncVisibleCategoryIds())
 return categoryIds.filter((id) => visibleIds.has(id))
}

export const expandVtSyncCategoryDependencies = (categoryIds: string[]): string[] => {
 const byId = new Map(VT_SYNC_CATEGORY_OPTIONS.map((category) => [category.id, category]))
 const ordered: string[] = []
 const visited = new Set<string>()
 const visiting = new Set<string>()
 const visit = (id: string) => {
  if (visited.has(id) || visiting.has(id)) return
  const category = byId.get(id)
  if (!category) return
  visiting.add(id)
  category.dependsOn?.forEach(visit)
  visiting.delete(id)
  visited.add(id)
  ordered.push(id)
 }
 categoryIds.forEach(visit)
 return ordered
}
