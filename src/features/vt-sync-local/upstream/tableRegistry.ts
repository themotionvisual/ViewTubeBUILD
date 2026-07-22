import type { VtSyncTableColumnDefinition, VtSyncTableDefinition } from "../adapters/contracts"

export type VtSyncTableCategoryDefinition = {
 id: string
 label: string
 tabs: Array<{ id: string; label: string }>
}

const col = (
 key: string,
 label: string,
 group = "Metrics",
 format: VtSyncTableColumnDefinition["format"] = "text",
 defaultVisible = true,
 pinned?: "left" | "right",
 options: Partial<Pick<VtSyncTableColumnDefinition, "semanticRole" | "visualization" | "preferredWidth" | "textSize">> = {},
): VtSyncTableColumnDefinition => ({
 key,
 label,
 group,
 format,
 defaultVisible,
 pinned,
 isFormula: ["engagementRate", "likeRatio", "subRatio", "subRate"].includes(key) || undefined,
 visibility: "always",
 semanticRole: options.semanticRole ?? (["number", "percent", "currency", "duration", "durationHours", "durationMinutes"].includes(format || "") ? "metric" : "identity"),
 visualization: options.visualization ?? (["number", "percent", "currency", "duration", "durationHours", "durationMinutes"].includes(format || "") ? "metric" : "none"),
 preferredWidth: options.preferredWidth,
 textSize: options.textSize,
})

const table = ({
 id,
 label,
 mainCategoryId,
 subLabel,
 description,
 snapshotKeys,
 columns,
 categoryIds,
 defaultSort = { key: "views", direction: "desc" as const },
 datasetId = id,
 exportName = `${id}.csv`,
 collapsedGroups = [],
 layoutMode = "auto",
 compactMode = "supported",
}: {
 id: string
 label: string
 mainCategoryId: string
 subLabel?: string
 description: string
 snapshotKeys?: string[]
 columns: VtSyncTableColumnDefinition[]
 categoryIds: string[]
 defaultSort?: { key: string; direction: "asc" | "desc" }
 datasetId?: string
 exportName?: string
 collapsedGroups?: string[]
 layoutMode?: VtSyncTableDefinition["layoutMode"]
 compactMode?: VtSyncTableDefinition["compactMode"]
}): VtSyncTableDefinition => ({
 id,
 label,
 mainCategoryId,
 subLabel,
 description,
 snapshotKeys,
 performanceHubDatasetId: datasetId,
 categoryIds,
 columns,
 defaultSort,
 pinnedGroups: ["Identity", "Metadata"],
 collapsedGroups,
 exportName,
 layoutMode,
 compactMode,
})

export const VT_SYNC_TABLE_CATEGORIES: VtSyncTableCategoryDefinition[] = [
 { id: "videos", label: "Videos", tabs: [{ id: "videos", label: "Video Metadata & Metrics" }] },
 { id: "daily", label: "Daily Traffic", tabs: [{ id: "daily", label: "Daily Overview" }, { id: "weekly", label: "Weekly" }, { id: "monthly", label: "Monthly" }] },
 { id: "channel_totals", label: "Channel Totals", tabs: [{ id: "channel_totals", label: "Channel Totals" }] },
 { id: "traffic", label: "Traffic Sources", tabs: [
  { id: "traffic", label: "Overview" },
  { id: "search", label: "Search Terms" },
  { id: "ext_web", label: "External Websites" },
  { id: "suggested", label: "Suggested Videos" },
  { id: "hashtags", label: "Hashtags" },
  { id: "sound", label: "Sound Pages" },
  { id: "chan_page", label: "Channel Pages" },
  { id: "traffic_shorts", label: "Shorts Feed" },
  { id: "traffic_browse_features", label: "Browse Features" },
  { id: "traffic_shorts_content_link", label: "Shorts Content Links" },
  { id: "traffic_campaign_card", label: "Campaign Cards" },
  { id: "traffic_card", label: "Info Cards" },
  { id: "traffic_end_screen", label: "End Screens" },
  { id: "traffic_live_redirect", label: "Live Redirects" },
  { id: "traffic_notification", label: "Notifications" },
  { id: "traffic_no_link_embedded", label: "Embedded Players" },
  { id: "traffic_no_link_other", label: "Direct/Unknown" },
  { id: "traffic_playlist", label: "Playlist Traffic" },
  { id: "traffic_yt_playlist_page", label: "YT Playlist Pages" },
  { id: "other_feat", label: "Other Features" },
  { id: "adv", label: "Advertising" },
  { id: "traffic_subscribers", label: "Subscriber Detail" },
  { id: "locations", label: "Playback Locations" },
 ] },
 { id: "demographics", label: "Demographics", tabs: [
  { id: "demographics", label: "Overview" },
  { id: "demog_age", label: "Age Group" },
  { id: "demog_gender", label: "Gender" },
  { id: "audience", label: "Audience Behavior" },
  { id: "new_returning", label: "New vs Returning" },
  { id: "subs", label: "Subscription Status" },
 ] },
 { id: "geography", label: "Geography", tabs: [
  { id: "geography", label: "Overview" },
  { id: "cities", label: "Cities" },
  { id: "provinces", label: "US States" },
  { id: "dma", label: "Regions (DMA)" },
  { id: "continents", label: "Continents & Sub-regions" },
 ] },
 { id: "devices", label: "Devices & OS", tabs: [{ id: "devices", label: "Devices" }, { id: "os", label: "Operating Systems" }] },
 { id: "content", label: "Content Performance", tabs: [{ id: "creator", label: "Content Type" }, { id: "retentions", label: "Retentions" }, { id: "shares", label: "Sharing Services" }] },
 { id: "playlists", label: "Playlists Data", tabs: [{ id: "playlists", label: "Playlist Statistics" }] },
 { id: "revenue", label: "Revenue", tabs: [{ id: "revenue", label: "Overview" }, { id: "ads", label: "Ad Types" }] },
]

export const VT_SYNC_ACTIVE_TABLE_IDS = new Set([
 "ads",
 "adv",
 "chan_page",
 "channel_totals",
 "cities",
 "creator",
 "daily",
 "demographics",
 "devices",
 "dma",
 "ext_web",
 "geography",
 "hashtags",
 "locations",
 "monthly",
 "os",
 "other_feat",
 "playlists",
 "provinces",
 "search",
 "sound",
 "subs",
 "suggested",
 "traffic",
 "videos",
 "weekly",
])

const activeTabs = (tabs: VtSyncTableCategoryDefinition["tabs"]) =>
 tabs.filter((tab) => VT_SYNC_ACTIVE_TABLE_IDS.has(tab.id))

export const VT_SYNC_VISIBLE_TABLE_CATEGORIES: VtSyncTableCategoryDefinition[] =
 VT_SYNC_TABLE_CATEGORIES
  .map((category) => ({ ...category, tabs: activeTabs(category.tabs) }))
  .filter((category) => category.tabs.length > 0)

const videoColumns = [
 col("thumbnail", "Thumbnail", "Video", "thumbnail", true, "left"),
 col("title", "Video Title", "Video", "text", true, "left"),
 col("videoId", "Video ID", "Video", "text", true, "left"),
 col("videoUrl", "Video URL", "Video", "text", true, undefined, { preferredWidth: 36 }),
 col("publishedAt", "Upload Date", "Video", "dateLocal"),
 col("publishedDay", "Upload Day", "Video", "weekdayLocal"),
 col("publishedTime", "Upload Time", "Video", "timeLocal"),
 col("descriptionSnippet", "Description Preview", "Details"),
 col("tags", "Tags", "Details", "json"),
 col("topics", "Topics", "Details", "json"),
 col("category", "Category", "Details"),
 col("titleLength", "Title Length", "Details", "number"),
 col("format", "Format", "Format"),
 col("duration", "Duration", "Format", "duration"),
 col("privacyStatus", "Privacy Status", "Format"),
 col("definition", "Definition", "Format"),
 col("caption", "Captions", "Format"),
 col("views", "Views", "Core Stats", "number"),
 col("engagedViews", "Engaged Views", "Core Stats", "number"),
 col("engagementRate", "Eng. Rate", "Core Stats", "percent"),
 col("watchTime", "Watch Time", "Core Stats", "durationHours"),
 col("averagePercentageViewed", "Avg. % Viewed", "Core Stats", "percent"),
 col("avgViewDuration", "Avg. View Dur.", "Core Stats", "duration"),

 col("comments", "Comments", "Engagement", "number"),
 col("shares", "Shares", "Engagement", "number"),
 col("likes", "Likes", "Engagement", "number"),
 col("dislikes", "Dislikes", "Engagement", "number"),
 col("likeRatio", "Like Ratio", "Engagement", "percent"),
 col("videosAddedToPlaylists", "Added to Playlists", "Engagement", "number"),
 col("videosRemovedFromPlaylists", "Removed from Playlists", "Engagement", "number"),
 col("subscribersGained", "Subs Gained", "Subscribers", "number"),
 col("subscribersLost", "Subs Lost", "Subscribers", "number"),
 col("netSubscribers", "Net Subs", "Subscribers", "number"),
 col("subRatio", "Sub Ratio", "Subscribers", "number"),
 col("subRate", "Sub Rate", "Subscribers", "percent"),
 col("revenue", "Est. Revenue", "Revenue", "currency"),
 col("grossRevenue", "Gross Revenue", "Revenue", "currency"),
 col("rpm", "RPM", "Revenue", "currency"),
 col("cpm", "CPM", "Revenue", "currency"),
 col("playbackBasedCpm", "Playback CPM", "Revenue", "currency"),
 col("monetizedPlaybacks", "Monetized Plays", "Advertising", "number"),
 col("adImpressions", "Ad Impressions", "Advertising", "number"),
 col("estimatedAdRevenue", "Ad Revenue", "Advertising", "currency"),
 col("youtubePremiumViews", "Premium Views", "Premium", "number"),
 col("youtubePremiumWatchTime", "Premium Watch", "Premium", "durationHours"),
 col("youtubePremiumRevenue", "Premium Revenue", "Premium", "currency"),
 col("cardsShown", "Cards Shown", "Card Links", "number"),
 col("cardClicks", "Card Clicks", "Card Links", "number"),
 col("clicksPerCardShown", "Card Click %", "Card Links", "percent"),
 col("cardTeasersShown", "Teasers Shown", "Card Links", "number"),
 col("cardTeaserClicks", "Teaser Clicks", "Card Links", "number"),
 col("teaserClicksPerCardTeaserShown", "Teaser Click %", "Card Links", "percent"),

].map((column) => ({
 ...column,
 isFormula: ["engagementRate", "likeRatio", "subRatio", "subRate"].includes(column.key) || undefined,
 visibility: ["Revenue", "Advertising", "Premium", "Card Links"].includes(column.group)
  ? "whenMeaningful" as const
  : "always" as const,
}))

const dailyMetricColumns = [
 col("views", "Views", "Reach", "number"),
 col("engagedViews", "Engaged Views", "Reach", "number"),
 col("watchTime", "Watch Time", "Watch Quality", "durationHours"),
 col("revenue", "Revenue", "Revenue", "currency"),
 col("estimatedAdRevenue", "Estimated Ad Revenue", "Revenue", "currency"),
 col("youtubePremiumRevenue", "YouTube Premium Revenue", "Revenue", "currency"),
 col("avgViewDuration", "Avg View Duration", "Watch Quality", "duration"),
 col("averagePercentageViewed", "Avg % Viewed", "Watch Quality", "percent"),
 col("shares", "Shares", "Engagement", "number"),
 col("subscribersGained", "Subs Gained", "Subscribers", "number"),
 col("subscribersLost", "Subs Lost", "Subscribers", "number"),
 col("likes", "Likes", "Engagement", "number"),
 col("dislikes", "Dislikes", "Engagement", "number"),
 col("comments", "Comments", "Engagement", "number"),
 col("cpm", "CPM", "Revenue", "currency"),
 col("grossRevenue", "Gross Revenue", "Revenue", "currency"),
 col("monetizedPlaybacks", "Monetized Playbacks", "Revenue", "number"),
 col("playbackBasedCpm", "Playback CPM", "Revenue", "currency"),
 col("adImpressions", "Ad Impressions", "Revenue", "number"),
 col("playlistViews", "Playlist Views", "Playlists", "number"),
 col("playlistStarts", "Playlist Starts", "Playlists", "number"),
 col("viewsPerPlaylistStart", "Views per PL Start", "Playlists", "number"),
 col("redViews", "YouTube Premium Views", "Revenue", "number"),
 col("estimatedRedMinutesWatched", "YouTube Premium Watch Time", "Revenue", "durationMinutes"),
 col("cardClicks", "Card Clicks", "Cards / End Screens", "number"),
 col("cardImpressions", "Card Impressions", "Cards / End Screens", "number"),
 col("cardClickRate", "Clicks per Card Shown (%)", "Cards / End Screens", "percent"),
 col("cardTeaserClicks", "Card Teaser Clicks", "Cards / End Screens", "number"),
 col("cardTeaserImpressions", "Card Teaser Impressions", "Cards / End Screens", "number"),
 col("cardTeaserClickRate", "Teaser Clicks per Card Teaser Shown (%)", "Cards / End Screens", "percent"),
 col("annotationClicks", "Annotation Clicks", "Cards / End Screens", "number"),
 col("annotationImpressions", "Annotation Impressions", "Cards / End Screens", "number"),
 col("annotationClickThroughRate", "Clicks per Annotation Shown (%)", "Cards / End Screens", "percent"),
 col("videosAddedToPlaylists", "Videos Added to Playlists", "Playlists", "number"),
 col("videosRemovedFromPlaylists", "Videos Removed from Playlists", "Playlists", "number"),
]

const trafficMetricColumns = [
 col("views", "Views", "Metrics", "number"),
 col("engagedViews", "Engaged Views", "Metrics", "number"),
 col("watchTime", "Watch Time", "Metrics", "durationHours"),
 col("avgDuration", "Average View Duration", "Metrics", "duration"),
 col("avgPercentageViewed", "Average Percentage Viewed (%)", "Metrics", "percent"),
]

const geographyFullColumns = [
 col("views", "Views", "Metrics", "number"),
 col("engagedViews", "Engaged Views", "Metrics", "number"),
 col("watchTime", "Watch Time", "Metrics", "durationHours"),
 col("revenue", "Revenue", "Revenue", "currency"),
 col("estimatedAdRevenue", "Estimated Ad Revenue", "Revenue", "currency"),
 col("youtubePremiumRevenue", "YouTube Premium Revenue", "Revenue", "currency"),
 col("avgDuration", "Avg View Duration", "Metrics", "duration"),
 col("avgPercentageViewed", "Avg % Viewed", "Metrics", "percent"),
 col("shares", "Shares", "Engagement", "number"),
 col("subscribersGained", "Subs Gained", "Subscribers", "number"),
 col("subscribersLost", "Subs Lost", "Subscribers", "number"),
 col("likes", "Likes", "Engagement", "number"),
 col("dislikes", "Dislikes", "Engagement", "number"),
 col("comments", "Comments", "Engagement", "number"),
]

const shortMetricColumns = [
 col("views", "Views", "Metrics", "number"),
 col("engagedViews", "Engaged Views", "Metrics", "number"),
 col("watchTime", "Watch Time", "Metrics", "durationHours"),
 col("avgDuration", "Avg Duration", "Metrics", "duration"),
 col("avgPercentageViewed", "Avg % Viewed", "Metrics", "percent"),
]

const audienceShareColumns = [
 col("cohort", "Viewers - gender & age", "Audience", "text", true, "left"),
 col("viewsPct", "Views (%)", "Audience", "percent"),
 col("watchTimePct", "Watch Time (%)", "Audience", "percent"),
]

export const VT_SYNC_TABLE_DEFINITIONS: VtSyncTableDefinition[] = [
 table({ id: "videos", mainCategoryId: "videos", label: "Video Metadata & Metrics", description: "AI Studio video metadata and analytics table.", categoryIds: ["uploads_playlist", "video_metadata", "videos_analytics"], columns: videoColumns, datasetId: "videos", defaultSort: { key: "publishedAt", direction: "desc" }, collapsedGroups: ["Details", "Format", "Revenue", "Advertising", "Premium", "Card Links"] }),
 table({ id: "daily", mainCategoryId: "daily", label: "Daily Overview", description: "Day-by-day channel analytics.", snapshotKeys: ["dailyMetrics"], categoryIds: ["daily_metrics"], columns: [col("date", "Date", "Time", "date", true, "left"), ...dailyMetricColumns], defaultSort: { key: "date", direction: "desc" }, datasetId: "daily" }),
 table({ id: "weekly", mainCategoryId: "daily", label: "Weekly", description: "Weekly rollup derived from daily metrics.", snapshotKeys: ["dailyMetrics"], categoryIds: ["daily_metrics"], columns: [col("date", "Week", "Time", "date", true, "left"), col("dateRange", "Date Range", "Time", "dateRange"), ...dailyMetricColumns], defaultSort: { key: "date", direction: "desc" }, datasetId: "weekly" }),
 table({ id: "monthly", mainCategoryId: "daily", label: "Monthly", description: "Monthly rollup derived from daily metrics.", snapshotKeys: ["dailyMetrics"], categoryIds: ["daily_metrics"], columns: [col("date", "Month", "Time", "date", true, "left"), ...dailyMetricColumns], defaultSort: { key: "date", direction: "desc" }, datasetId: "monthly" }),
 table({ id: "channel_totals", mainCategoryId: "channel_totals", label: "Channel Totals", description: "Channel total windows.", categoryIds: ["channel_totals"], columns: [col("window", "Time Window", "Time", "text", true, "left"), col("views", "Views", "Core Metrics", "number"), col("engagedViews", "Engaged Views", "Core Metrics", "number"), col("watchTime", "Watch Time", "Core Metrics", "durationHours"), col("avgViewDuration", "Avg. View Dur.", "Core Metrics", "duration"), col("averagePercentageViewed", "Avg. % Viewed", "Core Metrics", "percent"), col("impressions", "Impressions", "Reach", "number"), col("adImpressions", "Ad Impressions", "Reach", "number"), col("likes", "Likes", "Viewer Engagement", "number"), col("dislikes", "Dislikes", "Viewer Engagement", "number"), col("comments", "Comments", "Viewer Engagement", "number"), col("shares", "Shares", "Viewer Engagement", "number"), col("subscribersGained", "Subs Gained", "Subscriptions", "number"), col("subscribersLost", "Subs Lost", "Subscriptions", "number"), col("netSubscribers", "Net Subs", "Subscriptions", "number"), col("revenue", "Est. Revenue", "Revenue Insight", "currency"), col("estimatedAdRevenue", "Est. Ad Revenue", "Revenue Insight", "currency"), col("grossRevenue", "Gross Revenue", "Revenue Insight", "currency"), col("cpm", "CPM", "Revenue Insight", "currency"), col("playbackBasedCpm", "Playback CPM", "Revenue Insight", "currency"), col("monetizedPlaybacks", "Monetized Plays", "Advertising Info", "number"), col("youtubePremiumViews", "Premium Views", "Premium Metrics", "number"), col("youtubePremiumWatchTime", "Premium Watch", "Premium Metrics", "durationHours"), col("youtubePremiumRevenue", "Premium Revenue", "Premium Metrics", "currency")], datasetId: "channel_totals" }),
 table({ id: "traffic", mainCategoryId: "traffic", label: "Overview", description: "Traffic source overview.", snapshotKeys: ["trafficSources"], categoryIds: ["traffic_overview"], columns: [col("source", "Source", "Identity", "text", true, "left"), ...shortMetricColumns], datasetId: "traffic" }),
 table({ id: "search", mainCategoryId: "traffic", label: "Search Terms", description: "YouTube search terms.", snapshotKeys: ["searchTerms"], categoryIds: ["search_terms"], columns: [col("term", "Search Term", "Identity", "text", true, "left"), ...trafficMetricColumns], datasetId: "search" }),
 table({ id: "ext_web", mainCategoryId: "traffic", label: "External Websites", description: "External website traffic.", snapshotKeys: ["extWebsites"], categoryIds: ["ext_websites"], columns: [col("term", "External Website", "Identity", "text", true, "left"), ...trafficMetricColumns], datasetId: "ext_web" }),
 table({ id: "suggested", mainCategoryId: "traffic", label: "Suggested Videos", description: "Suggested video traffic.", snapshotKeys: ["suggestedVideos"], categoryIds: ["suggested_videos"], columns: [col("term", "Suggested Video (ID)", "Identity", "text", true, "left"), col("title", "Video Title", "Identity"), ...trafficMetricColumns], datasetId: "suggested" }),
 table({ id: "hashtags", mainCategoryId: "traffic", label: "Hashtags", description: "Hashtag traffic.", snapshotKeys: ["hashtags"], categoryIds: ["hashtags"], columns: [col("term", "Hashtag", "Identity", "text", true, "left"), ...trafficMetricColumns], datasetId: "hashtags" }),
 table({ id: "sound", mainCategoryId: "traffic", label: "Sound Pages", description: "Sound page traffic.", snapshotKeys: ["soundPages"], categoryIds: ["sound_pages"], columns: [col("term", "Sound Page", "Identity", "text", true, "left"), ...trafficMetricColumns], datasetId: "sound" }),
 table({ id: "adv", mainCategoryId: "traffic", label: "Advertising", description: "Advertising traffic.", snapshotKeys: ["trafficAdvertising"], categoryIds: ["advertising"], columns: [col("term", "Advertising", "Identity", "text", true, "left"), ...trafficMetricColumns], datasetId: "adv" }),
 table({ id: "traffic_subscribers", mainCategoryId: "traffic", label: "Subscriber Detail", description: "Subscriber traffic detail.", snapshotKeys: ["trafficSubscriberData"], categoryIds: ["traffic_subscribers"], columns: [col("term", "Subscriber Source", "Identity", "text", true, "left"), ...trafficMetricColumns], datasetId: "traffic_subscribers" }),
 table({ id: "chan_page", mainCategoryId: "traffic", label: "Channel Pages", description: "Channel page traffic.", snapshotKeys: ["trafficChannelPages"], categoryIds: ["channel_pages"], columns: [col("term", "Channel Page ID", "Identity", "text", true, "left"), col("title", "Channel Title", "Identity"), col("handle", "Handle", "Identity"), ...trafficMetricColumns], datasetId: "chan_page" }),
 ...(["traffic_shorts", "traffic_browse_features", "traffic_shorts_content_link", "traffic_campaign_card", "traffic_notification", "traffic_no_link_embedded", "traffic_no_link_other"] as const).map((id) => table({ id, mainCategoryId: "traffic", label: VT_SYNC_TABLE_CATEGORIES[3].tabs.find((tab) => tab.id === id)?.label || id, description: `${id} traffic detail.`, snapshotKeys: ({ traffic_shorts: ["trafficShorts"], traffic_browse_features: ["trafficBrowseFeatures"], traffic_shorts_content_link: ["trafficShortsContentLink"], traffic_campaign_card: ["trafficCampaignCard"], traffic_notification: ["trafficNotification"], traffic_no_link_embedded: ["trafficNoLinkEmbedded"], traffic_no_link_other: ["trafficNoLinkOther"] } as Record<typeof id, string[]>)[id], categoryIds: [id], columns: [col("term", "Source Detail", "Identity", "text", true, "left"), ...trafficMetricColumns], datasetId: id })),
 table({ id: "traffic_card", mainCategoryId: "traffic", label: "Info Cards", description: "Info card traffic.", snapshotKeys: ["trafficCard"], categoryIds: ["traffic_card"], columns: [col("term", "Info Card (ID)", "Identity", "text", true, "left"), col("title", "Title", "Identity"), ...trafficMetricColumns], datasetId: "traffic_card" }),
 table({ id: "traffic_end_screen", mainCategoryId: "traffic", label: "End Screens", description: "End screen traffic.", snapshotKeys: ["trafficEndScreen"], categoryIds: ["traffic_end_screen"], columns: [col("term", "Video (ID)", "Identity", "text", true, "left"), col("title", "Video Title", "Identity"), ...trafficMetricColumns], datasetId: "traffic_end_screen" }),
 table({ id: "traffic_live_redirect", mainCategoryId: "traffic", label: "Live Redirects", description: "Live redirect traffic.", snapshotKeys: ["trafficLiveRedirect"], categoryIds: ["traffic_live_redirect"], columns: [col("term", "Video (ID)", "Identity", "text", true, "left"), col("title", "Video Title", "Identity"), ...trafficMetricColumns], datasetId: "traffic_live_redirect" }),
 table({ id: "traffic_playlist", mainCategoryId: "traffic", label: "Playlist Traffic", description: "Playlist traffic.", snapshotKeys: ["trafficPlaylist"], categoryIds: ["traffic_playlist"], columns: [col("term", "Playlist (ID)", "Identity", "text", true, "left"), col("title", "Playlist Title", "Identity"), ...trafficMetricColumns], datasetId: "traffic_playlist" }),
 table({ id: "traffic_yt_playlist_page", mainCategoryId: "traffic", label: "YT Playlist Pages", description: "YouTube playlist page traffic.", snapshotKeys: ["trafficYtPlaylistPage"], categoryIds: ["traffic_yt_playlist_page"], columns: [col("term", "Playlist (ID)", "Identity", "text", true, "left"), col("title", "Playlist Title", "Identity"), ...trafficMetricColumns], datasetId: "traffic_yt_playlist_page" }),
 table({ id: "other_feat", mainCategoryId: "traffic", label: "Other Features", description: "Other feature traffic.", snapshotKeys: ["trafficOtherFeatures"], categoryIds: ["other_features"], columns: [col("term", "Other Feature", "Identity", "text", true, "left"), ...trafficMetricColumns], datasetId: "other_feat" }),
 table({ id: "locations", mainCategoryId: "traffic", label: "Playback Locations", description: "Playback location traffic.", snapshotKeys: ["playbackLocations"], categoryIds: ["playback_location"], columns: [col("location", "Playback Location", "Identity", "text", true, "left"), ...shortMetricColumns], datasetId: "locations" }),
 table({ id: "demographics", mainCategoryId: "demographics", label: "Overview", description: "Audience demographic overview.", snapshotKeys: ["demographics"], categoryIds: ["audience_demographics"], columns: audienceShareColumns, defaultSort: { key: "viewsPct", direction: "desc" }, datasetId: "demographics" }),
 table({ id: "demog_age", mainCategoryId: "demographics", label: "Age Group", description: "Demographics by age.", snapshotKeys: ["demographicsByAge"], categoryIds: ["demographics_age"], columns: [col("cohort", "Age Group", "Identity", "text", true, "left"), col("viewsPct", "Views (%)", "Audience", "percent")], defaultSort: { key: "viewsPct", direction: "desc" }, datasetId: "demog_age" }),
 table({ id: "demog_gender", mainCategoryId: "demographics", label: "Gender", description: "Demographics by gender.", snapshotKeys: ["demographicsByGender"], categoryIds: ["demographics_gender"], columns: [col("cohort", "Gender", "Identity", "text", true, "left"), col("viewsPct", "Views (%)", "Audience", "percent")], defaultSort: { key: "viewsPct", direction: "desc" }, datasetId: "demog_gender" }),
 table({ id: "audience", mainCategoryId: "demographics", label: "Audience Behavior", description: "Audience behavior rows.", snapshotKeys: ["audienceWatchBehavior"], categoryIds: ["audience_watch_behavior"], columns: [col("term", "Audience Behavior", "Identity", "text", true, "left"), col("views", "Views", "Metrics", "number"), col("engagedViews", "Engaged Views", "Metrics", "number"), col("watchTime", "Watch Time", "Metrics", "durationHours"), col("avgDuration", "Average View Duration", "Metrics", "duration")], datasetId: "audience" }),
 table({ id: "new_returning", mainCategoryId: "demographics", label: "New vs Returning", description: "New and returning viewers.", snapshotKeys: ["newReturningViewers"], categoryIds: ["new_returning_viewers"], columns: [col("term", "New/Returning", "Identity", "text", true, "left"), col("views", "Views", "Metrics", "number"), col("engagedViews", "Engaged Views", "Metrics", "number"), col("watchTime", "Watch Time", "Metrics", "durationHours")], datasetId: "new_returning" }),
 table({ id: "subs", mainCategoryId: "demographics", label: "Subscription Status", description: "Subscribed status rows.", snapshotKeys: ["subscriptionStatuses"], categoryIds: ["subscription_status"], columns: [col("status", "Subscription Status", "Identity", "text", true, "left"), ...shortMetricColumns], datasetId: "subs" }),
 table({ id: "geography", mainCategoryId: "geography", label: "Overview", description: "Country geography rows.", snapshotKeys: ["geography"], categoryIds: ["geography_country"], columns: [
  col("countryFlag", "Flag", "Identity", "flag", true, "left", { preferredWidth: 96 }),
  col("countryCode", "Country Code", "Identity", "text", true, "left", { preferredWidth: 92 }),
  col("countryName", "Country Name", "Identity", "text", true, "left", { preferredWidth: 180 }),
  ...geographyFullColumns,
 ], datasetId: "geography" }),
 table({ id: "cities", mainCategoryId: "geography", label: "Cities", description: "City geography rows.", snapshotKeys: ["cities"], categoryIds: ["geography_city"], columns: [
  col("countryFlag", "Flag", "Identity", "flag", true, "left", { preferredWidth: 96 }),
  col("city", "City", "Identity", "text", true, "left", { preferredWidth: 180 }),
  col("countryName", "Country", "Identity", "text", true, "left", { preferredWidth: 180 }),
  ...shortMetricColumns,
 ], datasetId: "cities", layoutMode: "sparse-full" }),
 table({ id: "provinces", mainCategoryId: "geography", label: "US States", description: "US state rows.", snapshotKeys: ["provinces"], categoryIds: ["geography_province"], columns: [
  col("provinceCode", "State Code", "Identity", "text", true, "left", { preferredWidth: 112 }),
  col("stateName", "State Name", "Identity", "text", true, "left", { preferredWidth: 180 }),
  ...shortMetricColumns,
 ], datasetId: "provinces", layoutMode: "sparse-full", compactMode: "normal-only" }),
 table({ id: "dma", mainCategoryId: "geography", label: "Regions (DMA)", description: "DMA geography rows.", snapshotKeys: ["dmaRegions"], categoryIds: ["geography_dma"], columns: [
  col("dmaCode", "DMA Code", "Identity", "text", true, "left", { preferredWidth: 112 }),
  col("dmaName", "DMA Area", "Identity", "text", true, "left", { preferredWidth: 260 }),
  ...shortMetricColumns,
 ], datasetId: "dma", layoutMode: "sparse-full", compactMode: "normal-only" }),
 table({ id: "continents", mainCategoryId: "geography", label: "Continents & Sub-regions", description: "Continent and sub-continent rows.", snapshotKeys: ["continentsData"], categoryIds: ["geography_country"], columns: [col("region", "Region", "Identity", "text", true, "left"), col("type", "Type", "Identity"), ...shortMetricColumns], datasetId: "continents" }),
 table({ id: "devices", mainCategoryId: "devices", label: "Devices", description: "Device type rows.", snapshotKeys: ["devices"], categoryIds: ["device_type"], columns: [col("device", "Device", "Identity", "text", true, "left"), ...shortMetricColumns], datasetId: "devices" }),
 table({ id: "os", mainCategoryId: "devices", label: "Operating Systems", description: "Operating system rows.", snapshotKeys: ["operatingSystems"], categoryIds: ["operating_system"], columns: [col("operatingSystem", "Operating System", "Identity", "text", true, "left"), ...shortMetricColumns], datasetId: "os" }),
 table({ id: "creator", mainCategoryId: "content", label: "Content Type", description: "Creator content type rows.", snapshotKeys: ["creatorContentTypes"], categoryIds: ["creator_content_type"], columns: [col("term", "Content Type", "Identity", "text", true, "left"), ...shortMetricColumns], datasetId: "creator" }),
 table({ id: "retentions", mainCategoryId: "content", label: "Retentions", description: "Retention rows.", snapshotKeys: ["retentions"], categoryIds: ["retention"], columns: [col("videoId", "Video ID", "Identity", "text", true, "left"), col("elapsedVideoTimeRatio", "Elapsed Video Time Ratio", "Retention", "percent"), col("audienceWatchRatio", "Audience Watch Ratio", "Retention", "percent"), col("relativeRetentionPerformance", "Relative Retention Performance", "Retention", "percent")], defaultSort: { key: "videoId", direction: "asc" }, datasetId: "retentions" }),
 table({ id: "shares", mainCategoryId: "content", label: "Sharing Services", description: "Sharing service rows.", snapshotKeys: ["sharingService"], categoryIds: ["sharing_service"], columns: [col("term", "Sharing Service", "Identity", "text", true, "left"), col("shares", "Shares", "Engagement", "number")], defaultSort: { key: "shares", direction: "desc" }, datasetId: "shares" }),
 table({ id: "playlists", mainCategoryId: "playlists", label: "Playlist Statistics", description: "Playlist statistics rows.", snapshotKeys: ["playlistsData"], categoryIds: ["playlists_analytics"], columns: [col("playlistId", "Playlist ID", "Identity", "text", true, "left", { preferredWidth: 190, textSize: 10 }), col("title", "Title", "Identity", "text", true, undefined, { preferredWidth: 240, textSize: 13 }), col("description", "Description", "Metadata"), col("publishedAt", "Published", "Metadata", "date"), col("videoCount", "Video Count", "Metadata", "number"), col("views", "Views", "Metrics", "number"), col("engagedViews", "Engaged Views", "Metrics", "number"), col("watchTime", "Watch Time", "Metrics", "durationMinutes"), col("playlistStarts", "Playlist Starts", "Metrics", "number"), col("playlistSaves", "Saves", "Metrics", "number"), col("averageTimeInPlaylist", "Avg Time in Playlist", "Metrics", "duration"), col("viewsPerPlaylistStart", "Views per Playlist Start", "Metrics", "number"), col("privacyStatus", "Privacy Status", "Metadata")], datasetId: "playlists" }),
 table({ id: "revenue", mainCategoryId: "revenue", label: "Overview", description: "Revenue source rows.", snapshotKeys: ["revenueSource"], categoryIds: ["revenue_source"], columns: [col("day", "Date", "Time", "date", true, "left"), col("revenue", "Total Revenue", "Revenue", "currency"), col("adRevenue", "Ad Revenue", "Revenue", "currency"), col("redRevenue", "Premium Revenue", "Revenue", "currency")], defaultSort: { key: "day", direction: "desc" }, datasetId: "revenue" }),
 table({ id: "ads", mainCategoryId: "revenue", label: "Ad Types", description: "Ad type rows.", snapshotKeys: ["adTypes"], categoryIds: ["ad_type"], columns: [col("adType", "Ad Type", "Identity", "text", true, "left"), col("grossRevenue", "Gross Revenue (USD)", "Revenue", "currency"), col("cpm", "CPM (USD)", "Revenue", "currency"), col("adImpressions", "Ad Impressions", "Revenue", "number")], defaultSort: { key: "grossRevenue", direction: "desc" }, datasetId: "ads" }),
]

export const VT_SYNC_VISIBLE_TABLE_DEFINITIONS: VtSyncTableDefinition[] =
 VT_SYNC_TABLE_DEFINITIONS.filter((tableDefinition) => VT_SYNC_ACTIVE_TABLE_IDS.has(tableDefinition.id))

export const getVtSyncTablesForCategory = (categoryId: string): VtSyncTableDefinition[] =>
 VT_SYNC_VISIBLE_TABLE_DEFINITIONS.filter((item) => item.categoryIds.includes(categoryId))
