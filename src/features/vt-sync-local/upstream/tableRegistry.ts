import type { VtSyncTableColumnDefinition, VtSyncTableDefinition } from "../adapters/contracts"
import { VT_SYNC_ANALYTICS_METRIC_DESCRIPTORS } from "./analyticsMetricContract"
import { VT_SYNC_CATEGORY_OPTIONS } from "./syncCategoryRegistry"
import { VT_SYNC_SYNC_UNITS } from "./syncUnitRegistry"
import {
 VT_SYNC_TRAFFIC_DETAIL_SOURCES,
 getVtSyncAvailableTrafficDetailSources,
 type VtSyncTrafficDetailFamily,
 type VtSyncTrafficDetailSourceDefinition,
} from "./trafficDetailRegistry"

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
 options: Partial<Pick<VtSyncTableColumnDefinition, "isFormula" | "semanticRole" | "visualization" | "totalMode" | "preferredWidth" | "textSize" | "availabilityNote">> = {},
): VtSyncTableColumnDefinition => ({
 key,
 label,
 group,
 format,
 defaultVisible,
 pinned,
 isFormula: options.isFormula ?? (["engagementRate", "likeRatio", "subRatio", "subRate", "playlistViewShare", "playlistWatchTimeShare"].includes(key) || undefined),
 visibility: "always",
 semanticRole: options.semanticRole ?? (["number", "percent", "currency", "duration", "durationHours", "durationMinutes"].includes(format || "") ? "metric" : "identity"),
 visualization: options.visualization ?? (["number", "percent", "currency", "duration", "durationHours", "durationMinutes"].includes(format || "") ? "metric" : "none"),
 totalMode: options.totalMode,
 preferredWidth: options.preferredWidth,
 textSize: options.textSize,
 availabilityNote: options.availabilityNote,
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
 syncUnitId,
 defaultSort = { key: "views", direction: "desc" as const },
 datasetId = id,
 exportName = `${id}.csv`,
 collapsedGroups = [],
 layoutMode = "auto",
 compactMode = "supported",
 presentationMode = "standard",
 summaryMode = id === "videos" ? "selected-video" : "registry",
 summaryColumns = [],
 summaryPrimaryRow,
 verticalScrollMode,
 horizontalScrollMode,
}: {
 id: string
 label: string
 mainCategoryId: string
 subLabel?: string
 description: string
 snapshotKeys?: string[]
 columns: VtSyncTableColumnDefinition[]
 categoryIds: string[]
 syncUnitId?: string
 defaultSort?: { key: string; direction: "asc" | "desc" }
 datasetId?: string
 exportName?: string
 collapsedGroups?: string[]
 layoutMode?: VtSyncTableDefinition["layoutMode"]
 compactMode?: VtSyncTableDefinition["compactMode"]
 presentationMode?: VtSyncTableDefinition["presentationMode"]
 summaryMode?: VtSyncTableDefinition["summaryMode"]
 summaryColumns?: string[]
 summaryPrimaryRow?: VtSyncTableDefinition["summaryPrimaryRow"]
 verticalScrollMode?: VtSyncTableDefinition["verticalScrollMode"]
 horizontalScrollMode?: VtSyncTableDefinition["horizontalScrollMode"]
}): VtSyncTableDefinition => ({
 id,
 label,
 mainCategoryId,
 subLabel,
 description,
 snapshotKeys,
 performanceHubDatasetId: datasetId,
 categoryIds,
 syncUnitId,
 columns,
 defaultSort,
 pinnedGroups: ["Identity", "Metadata"],
 collapsedGroups,
 exportName,
 layoutMode,
 compactMode,
 presentationMode,
 summaryMode,
 summaryColumns,
 summaryPrimaryRow,
 verticalScrollMode: verticalScrollMode ?? (id === "traffic" || id === "devices" ? "none" : "custom"),
 // Only dense, wide catalog/time tables expose the custom horizontal control.
 // All other tables fit their contract to the available canvas instead of
 // reserving a redundant bottom scrollbar.
 horizontalScrollMode: horizontalScrollMode ?? (
  ["videos", "daily", "weekly", "monthly", "channel_totals", "playlists"].includes(id)
   ? "custom"
   : "none"
 ),
})

/** Each supported detail source has its own visible table while sharing the
 * canonical trafficDetails store. Unsupported source types deliberately have no
 * generated detail table. */
export type { VtSyncTrafficDetailFamily }
export type VtSyncTrafficDetailTable = VtSyncTrafficDetailSourceDefinition

/** Single source of truth for every selectable traffic-detail dataset. */
export const VT_SYNC_TRAFFIC_DETAIL_TABLES: readonly VtSyncTrafficDetailTable[] = getVtSyncAvailableTrafficDetailSources()

export const getVtSyncTrafficDetailTable = (tableId: string): VtSyncTrafficDetailTable | undefined =>
 VT_SYNC_TRAFFIC_DETAIL_TABLES.find((entry) => tableId === `traffic_detail_${entry.categoryId}`)

export const VT_SYNC_TABLE_CATEGORIES: VtSyncTableCategoryDefinition[] = [
 { id: "videos", label: "Videos", tabs: [{ id: "videos", label: "Video Metadata & Metrics" }] },
 { id: "daily", label: "Time", tabs: [{ id: "daily", label: "Daily Stats" }, { id: "weekly", label: "Weekly Stats" }, { id: "monthly", label: "Monthly Stats" }, { id: "traffic_day", label: "Traffic × Day" }] },
 { id: "channel_totals", label: "Channel", tabs: [{ id: "channel_totals", label: "Channel Totals" }, { id: "subs", label: "Subscriber Status" }] },
 { id: "traffic", label: "Traffic Sources", tabs: [
  { id: "traffic", label: "Overview" },
  { id: "traffic_details", label: "Traffic Details" },
  ...VT_SYNC_TRAFFIC_DETAIL_TABLES.map(({ categoryId, label }) => ({ id: `traffic_detail_${categoryId}`, label })),
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
  { id: "demographics", label: "Age × Gender" },
  { id: "demog_age", label: "Age Group" },
  { id: "demog_gender", label: "Gender" },
  { id: "audience", label: "Audience Behavior" },
  { id: "new_returning", label: "New vs Returning" },
 ] },
 { id: "geography", label: "Geography", tabs: [
  { id: "geography", label: "Overview" },
  { id: "cities", label: "Cities" },
  { id: "provinces", label: "US States" },
  { id: "dma", label: "Regions (DMA)" },
  { id: "continents", label: "Continents & Sub-regions" },
 ] },
 { id: "devices", label: "Devices & OS", tabs: [{ id: "devices", label: "Devices" }, { id: "os", label: "Operating Systems" }, { id: "device_os", label: "Device x OS" }] },
 { id: "content", label: "Content Performance", tabs: [{ id: "creator", label: "Content Type" }, { id: "formats_subscribers", label: "Formats x Subscribers" }, { id: "retentions", label: "Retentions" }, { id: "shares", label: "Sharing Services" }] },
 { id: "playlists", label: "Playlists Data", tabs: [{ id: "playlists", label: "Playlist Statistics" }] },
 { id: "revenue", label: "Revenue", tabs: [{ id: "revenue", label: "Overview" }, { id: "ads", label: "Ad Types" }] },
]

const videoColumns = [
 col("thumbnail", "Thumbnail", "Video", "thumbnail", true, "left", { preferredWidth: 112 }),
 col("title", "Video Title", "Video", "text", true, "left", { preferredWidth: 360 }),
 col("videoId", "Video ID", "Video", "text", true, "left"),
 col("videoUrl", "Video URL", "Video", "text", true, undefined, { preferredWidth: 44 }),
 col("publishedAt", "Upload Date", "Video", "dateLocal"),
 col("publishedDay", "Upload Day", "Video", "weekdayLocal"),
 col("publishedTime", "Upload Time", "Video", "timeLocal"),
 col("descriptionSnippet", "Description Preview", "Details"),
 col("tags", "Tags", "Details", "json"),
 col("topics", "Topics", "Details", "json"),
 col("category", "Category", "Details"),
 col("titleLength", "Title Length", "Details", "number"),
 col("format", "Format", "Format", "text", true, undefined, { preferredWidth: 148 }),
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

  // Per 100 Views metrics group
  col("subRatio", "Sub Ratio", "Per 100 Views", "number"),
  col("subRate", "Sub Rate", "Per 100 Views", "percent"),
  col("likeRate", "Like Rate", "Per 100 Views", "percent"),
  col("commentRate", "Comment Rate", "Per 100 Views", "percent"),
  col("shareRate", "Share Rate", "Per 100 Views", "percent"),
  col("saveRate", "Save Rate", "Per 100 Views", "percent"),
  col("revenuePer100Views", "Revenue per 100 Views", "Per 100 Views", "currency"),

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
 isFormula: ["engagementRate", "likeRatio", "subRatio", "subRate", "commentRate", "shareRate", "saveRate", "revenuePer100Views", "likeRate"].includes(column.key) || undefined,
 visibility: ["Revenue", "Advertising", "Premium"].includes(column.group)
  ? "whenMeaningful" as const
  : "always" as const,
}))

const completeAnalyticsMetricColumns = VT_SYNC_ANALYTICS_METRIC_DESCRIPTORS.map((descriptor) => col(
 descriptor.normalizedField,
 descriptor.label,
 descriptor.group,
 descriptor.format,
 true,
 undefined,
 {
  totalMode: descriptor.aggregation === "sum"
   ? "sum"
   : descriptor.aggregation === "weighted-rate"
    ? "average"
    : "none",
 },
))

const dailyMetricColumns = [
 ...completeAnalyticsMetricColumns,
 col("playlistViews", "Playlist Views", "Playlists", "number"),
 col("playlistStarts", "Playlist Starts", "Playlists", "number"),
 col("viewsPerPlaylistStart", "Views per Playlist Start", "Playlists", "number"),
 col("annotationClicks", "Annotation Clicks", "Annotations", "number"),
]

const trafficMetricColumns = [
 col("views", "Views", "Metrics", "number"),
 col("engagedViews", "Engaged Views", "Metrics", "number"),
 col("trafficViewShare", "% of Traffic Views", "Traffic Share", "percent"),
 col("watchTime", "Watch Time", "Metrics", "durationHours"),
 col("trafficWatchTimeShare", "% of Traffic Watch Time", "Traffic Share", "percent"),
 col("avgDuration", "Average View Duration", "Metrics", "duration"),
 col("avgPercentageViewed", "Average Percentage Viewed (%)", "Metrics", "percent"),
]

const trafficMetricColumnsWithoutShares = trafficMetricColumns.filter(
 (column) => column.key !== "trafficViewShare" && column.key !== "trafficWatchTimeShare",
)

const searchMetricColumns = trafficMetricColumns.map((column) =>
 column.key === "trafficViewShare" ? { ...column, label: "% of Search Traffic" }
 : column.key === "trafficWatchTimeShare" ? { ...column, label: "% of Search Watch Time" }
 : column,
)

const sourceDetailMetrics = (definition: VtSyncTrafficDetailTable) => [
 col("views", "Views", "Metrics", "number"),
 col("trafficViewShare", definition.viewShareLabel, "Metrics", "percent"),
 col("watchTime", "Watch Time", "Metrics", "durationHours"),
 col("trafficWatchTimeShare", definition.watchShareLabel, "Metrics", "percent"),
 col("avgDuration", "Average View Duration", "Metrics", "duration"),
 col("avgPercentageViewed", "Average % Viewed", "Metrics", "percent"),
]

const sourceDetailColumns = (definition: VtSyncTrafficDetailTable): VtSyncTableColumnDefinition[] => {
 const metrics = sourceDetailMetrics(definition)
 if (definition.family === "literal") {
  return [col("detail", definition.detailLabel, "Identity", "text", true, "left", { preferredWidth: 360 }), ...metrics]
 }
 if (definition.family === "video") {
  return [
   col("cover", "Thumbnail", "Identity", "thumbnail", true, "left", { preferredWidth: 112 }),
   col("title", "Video Title", "Identity", "text", true, "left", { preferredWidth: 360 }),
   col("sourceChannel", "Channel", "Identity", "text", true, "left", { preferredWidth: 220 }),
   col("videoUrl", "URL", "Identity", "text", true, undefined, { preferredWidth: 44 }),
   ...metrics,
  ]
 }
 if (definition.family === "channel") {
  return [
   col("cover", "Profile Picture", "Identity", "thumbnail", true, "left", { preferredWidth: 88 }),
   col("title", "Channel Title", "Identity", "text", true, "left", { preferredWidth: 360 }),
   col("channelUrl", "URL", "Identity", "text", true, undefined, { preferredWidth: 44 }),
   ...metrics,
  ]
 }
 return [
  col("cover", "Cover", "Identity", "thumbnail", true, "left", { preferredWidth: 112 }),
  col("title", "Playlist Title", "Identity", "text", true, "left", { preferredWidth: 360 }),
  col("playlistUrl", "URL", "Identity", "text", true, undefined, { preferredWidth: 44 }),
  ...metrics,
 ]
}

const channelTrafficShareColumns = [
 col("trafficViewShare", "% of Channel Views", "Channel Share", "percent"),
 col("trafficWatchTimeShare", "% of Channel Watch Time", "Channel Share", "percent"),
]

const trafficDayMetricColumns = [
 ...trafficMetricColumns,
 col("subscribersGained", "Subscribers Gained", "Engagement", "number"),
 col("shares", "Shares", "Engagement", "number"),
 col("likes", "Likes", "Engagement", "number"),
]

const trafficShareColumns = [
 col("trafficViewShare", "% of Traffic Views", "Traffic Share", "percent"),
 col("trafficWatchTimeShare", "% of Traffic Watch Time", "Traffic Share", "percent"),
]

const geographyFullColumns = [
 ...completeAnalyticsMetricColumns,
 col("netSubscribers", "Net Subs", "Engagement", "number"),
]

const shortMetricColumns = [
 col("views", "Views", "Metrics", "number"),
 col("engagedViews", "Engaged Views", "Metrics", "number"),
 col("watchTime", "Watch Time", "Metrics", "durationHours"),
 col("avgDuration", "Avg Duration", "Metrics", "duration"),
 col("avgPercentageViewed", "Avg % Viewed", "Metrics", "percent"),
]

const subscriberStatusMetricColumns = [
 ...shortMetricColumns,
 col("youtubePremiumViews", "Premium Views", "Premium", "number"),
 col("youtubePremiumWatchTime", "Premium Watch Time", "Premium", "durationHours"),
]

const formatSubscriberShareColumns = [
 col("channelViewShare", "% of Channel Views", "Channel Share", "percent", true, undefined, { totalMode: "sum" }),
 col("channelWatchTimeShare", "% of Channel Watch Time", "Channel Share", "percent", true, undefined, { totalMode: "sum" }),
 col("channelPremiumViewShare", "% of Channel Premium Views", "Premium Share", "percent", true, undefined, { totalMode: "sum" }),
 col("channelPremiumWatchTimeShare", "% of Channel Premium Watch Time", "Premium Share", "percent", true, undefined, { totalMode: "sum" }),
]

const demographicOverviewColumns = [
 col("ageGroupLabel", "Age Group", "Audience Demographics", "text", true, "left", { preferredWidth: 260 }),
 col("maleViewerPercentage", "Male", "Audience Demographics", "percent", true, undefined, { totalMode: "sum", preferredWidth: 180 }),
 col("femaleViewerPercentage", "Female", "Audience Demographics", "percent", true, undefined, { totalMode: "sum", preferredWidth: 180 }),
 col("otherViewerPercentage", "Other", "Audience Demographics", "percent", true, undefined, { totalMode: "sum", preferredWidth: 180 }),
 col("viewerPercentage", "All Viewers", "Audience Demographics", "percent", true, undefined, { totalMode: "sum", preferredWidth: 200 }),
]

export const VT_SYNC_TABLE_DEFINITIONS: VtSyncTableDefinition[] = [
 table({ id: "videos", mainCategoryId: "videos", label: "Video Catalog Analytics", description: "Video metadata from YouTube Data API with performance from YouTube Analytics API.", categoryIds: ["uploads_playlist", "video_metadata", "videos_analytics"], columns: videoColumns, datasetId: "videos", defaultSort: { key: "publishedAt", direction: "desc" }, collapsedGroups: ["Details", "Format"] }),
 table({ id: "daily", mainCategoryId: "daily", label: "Daily Stats", description: "Day-by-day channel statistics.", snapshotKeys: ["dailyMetrics"], categoryIds: ["daily_metrics"], columns: [col("date", "Date", "Time", "date", true, "left", { preferredWidth: 220 }), ...dailyMetricColumns], defaultSort: { key: "date", direction: "desc" }, datasetId: "daily" }),
 table({ id: "weekly", mainCategoryId: "daily", label: "Weekly Stats", description: "Weekly statistics derived from daily canonical rows.", snapshotKeys: ["dailyMetrics"], categoryIds: ["daily_metrics"], columns: [col("dateRange", "Week / Date Range", "Time", "dateRange", true, "left", { preferredWidth: 240 }), ...dailyMetricColumns], defaultSort: { key: "dateRange", direction: "desc" }, datasetId: "weekly" }),
 table({ id: "monthly", mainCategoryId: "daily", label: "Monthly Stats", description: "Calendar-month statistics queried directly from YouTube Analytics.", snapshotKeys: ["monthlyMetrics"], categoryIds: ["monthly_metrics"], columns: [col("date", "Month", "Time", "date", true, "left", { preferredWidth: 240 }), ...dailyMetricColumns], defaultSort: { key: "date", direction: "desc" }, datasetId: "monthly_api" }),
 table({ id: "channel_totals", mainCategoryId: "channel_totals", label: "Channel Totals", description: "Channel total windows.", categoryIds: ["channel_totals"], columns: [
  // Keep each metric group contiguous so netSubscribers/impressions merge into
  // their own groups instead of forming duplicate Engagement/Revenue blocks on
  // the right, and place Revenue to the left of Cards.
  col("window", "Time Window", "Time", "text", true, "left"),
  ...completeAnalyticsMetricColumns.filter((column) => column.group === "Watch"),
  ...completeAnalyticsMetricColumns.filter((column) => column.group === "Engagement"),
  col("netSubscribers", "Net Subscribers", "Engagement", "number"),
  ...completeAnalyticsMetricColumns.filter((column) => column.group === "Revenue"),
  col("impressions", "Impressions", "Revenue", "number"),
  ...completeAnalyticsMetricColumns.filter((column) => column.group === "Cards"),
 ], datasetId: "channel_totals", summaryMode: "primary-row", summaryPrimaryRow: { key: "window", value: "Lifetime (All Time)" } }),
 table({ id: "traffic", mainCategoryId: "traffic", label: "Overview", description: "Traffic source overview.", snapshotKeys: ["trafficSources"], categoryIds: ["traffic_overview"], syncUnitId: "traffic_overview", columns: [col("source", "Source", "Identity", "text", true, "left", { preferredWidth: 300 }), ...shortMetricColumns, ...trafficShareColumns], datasetId: "traffic", layoutMode: "sparse-full" }),
 table({ id: "traffic_details", mainCategoryId: "traffic", label: "Traffic Details", description: "Source-filtered detail rows returned by YouTube Analytics. Unsupported traffic sources remain overview-only.", snapshotKeys: ["trafficDetails"], categoryIds: ["traffic_details"], syncUnitId: "traffic_details", columns: [col("sourceType", "Traffic Source", "Identity", "text", true, "left", { preferredWidth: 180 }), col("title", "Resolved Title", "Identity", "text", true, "left", { preferredWidth: 300 }), col("handle", "Handle", "Identity", "text", true, "left", { preferredWidth: 180 }), col("detail", "Source Detail", "Identity", "text", true, "left", { preferredWidth: 300 }), ...trafficMetricColumns], datasetId: "traffic_details" }),
 ...VT_SYNC_TRAFFIC_DETAIL_TABLES.map((definition) => table({
  id: `traffic_detail_${definition.categoryId}`,
  mainCategoryId: "traffic",
  label: definition.label,
  description: `${definition.sourceType} traffic-detail rows.`,
  snapshotKeys: ["trafficDetails"],
  categoryIds: [definition.categoryId],
  syncUnitId: `traffic_detail_${definition.categoryId}`,
  columns: sourceDetailColumns(definition),
  datasetId: `traffic_detail_${definition.categoryId}`,
  layoutMode: "sparse-full",
  horizontalScrollMode: "none",
  verticalScrollMode: "none",
 })),
 table({ id: "search", mainCategoryId: "traffic", label: "Search Terms", description: "YouTube search terms.", snapshotKeys: ["searchTerms"], categoryIds: ["search_terms"], columns: [col("term", "Search Term", "Identity", "text", true, "left"), ...searchMetricColumns], datasetId: "search" }),
 table({ id: "ext_web", mainCategoryId: "traffic", label: "External Websites", description: "External website traffic.", snapshotKeys: ["extWebsites"], categoryIds: ["ext_websites"], columns: [col("term", "External Website", "Identity", "text", true, "left"), ...trafficMetricColumns], datasetId: "ext_web" }), table({ id: "suggested", mainCategoryId: "traffic", label: "Suggested Videos", description: "Suggested video traffic enriched with YouTube Data API metadata when available.", snapshotKeys: ["suggestedVideos"], categoryIds: ["suggested_videos"], columns: [
  col("cover", "Cover", "Identity", "thumbnail", true, "left", { preferredWidth: 112 }),
  col("title", "Video Title", "Identity", "text", true, "left", { preferredWidth: 360 }),
  col("term", "Suggested Video", "Identity", "text", true, "left", { preferredWidth: 360 }),
  col("videoUrl", "Video URL", "Identity", "text", true, undefined, { preferredWidth: 44 }),
  ...trafficMetricColumnsWithoutShares
 ], datasetId: "suggested" }),
 table({ id: "hashtags", mainCategoryId: "traffic", label: "Hashtags", description: "Hashtag traffic.", snapshotKeys: ["hashtags"], categoryIds: ["hashtags"], columns: [col("term", "Hashtag", "Identity", "text", true, "left"), ...trafficMetricColumns], datasetId: "hashtags" }),
 table({ id: "sound", mainCategoryId: "traffic", label: "Sound Pages", description: "Sound page traffic.", snapshotKeys: ["soundPages"], categoryIds: ["sound_pages"], columns: [col("term", "Sound Page", "Identity", "text", true, "left"), ...trafficMetricColumns], datasetId: "sound" }),
 table({ id: "adv", mainCategoryId: "traffic", label: "Advertising", description: "Advertising traffic.", snapshotKeys: ["trafficAdvertising"], categoryIds: ["advertising"], columns: [col("term", "Advertising", "Identity", "text", true, "left"), ...trafficMetricColumns], datasetId: "adv" }),
 table({ id: "traffic_subscribers", mainCategoryId: "traffic", label: "Subscriber Detail", description: "Subscriber traffic detail.", snapshotKeys: ["trafficSubscriberData"], categoryIds: ["traffic_subscribers"], columns: [col("term", "Subscriber Source", "Identity", "text", true, "left"), ...trafficMetricColumns], datasetId: "traffic_subscribers" }),
 table({ id: "traffic_day", mainCategoryId: "daily", label: "Traffic × Day", description: "Daily performance split by traffic source; separate from channel-wide Daily Stats.", snapshotKeys: ["trafficByDay"], categoryIds: ["traffic_day"], columns: [col("term", "Traffic Source", "Identity", "text", true, "left"), col("day", "Day", "Identity", "date", true, "left"), ...trafficDayMetricColumns], defaultSort: { key: "day", direction: "desc" }, datasetId: "traffic_day", presentationMode: "traffic-source-day", verticalScrollMode: "custom" }),
 table({ id: "chan_page", mainCategoryId: "traffic", label: "Channel Pages", description: "Channel page traffic enriched with YouTube Data API metadata when available.", snapshotKeys: ["trafficChannelPages"], categoryIds: ["channel_pages"], columns: [
  col("cover", "Cover", "Identity", "thumbnail", true, "left", { preferredWidth: 112 }),
  col("title", "Channel Title", "Identity", "text", true, "left", { preferredWidth: 360 }),
  col("term", "Channel Page", "Identity", "text", true, "left", { preferredWidth: 360 }),
  col("channelUrl", "Channel URL", "Identity", "text", true, undefined, { preferredWidth: 44 }),
  ...trafficMetricColumnsWithoutShares
 ], datasetId: "chan_page" }),
 ...(["traffic_shorts", "traffic_browse_features", "traffic_shorts_content_link", "traffic_campaign_card", "traffic_notification", "traffic_no_link_embedded", "traffic_no_link_other"] as const).map((id) => table({ id, mainCategoryId: "traffic", label: VT_SYNC_TABLE_CATEGORIES[3].tabs.find((tab) => tab.id === id)?.label || id, description: `${id} traffic detail.`, snapshotKeys: ({ traffic_shorts: ["trafficShorts"], traffic_browse_features: ["trafficBrowseFeatures"], traffic_shorts_content_link: ["trafficShortsContentLink"], traffic_campaign_card: ["trafficCampaignCard"], traffic_notification: ["trafficNotification"], traffic_no_link_embedded: ["trafficNoLinkEmbedded"], traffic_no_link_other: ["trafficNoLinkOther"] } as Record<typeof id, string[]>)[id], categoryIds: [id], columns: [col("term", "Source Detail", "Identity", "text", true, "left"), ...trafficMetricColumns], datasetId: id })),
 table({ id: "traffic_card", mainCategoryId: "traffic", label: "Info Cards", description: "Info card traffic.", snapshotKeys: ["trafficCard"], categoryIds: ["traffic_card"], columns: [col("term", "Info Card (ID)", "Identity", "text", true, "left"), col("title", "Title", "Identity"), ...trafficMetricColumns], datasetId: "traffic_card" }),
 table({ id: "traffic_end_screen", mainCategoryId: "traffic", label: "End Screens", description: "End screen traffic.", snapshotKeys: ["trafficEndScreen"], categoryIds: ["traffic_end_screen"], columns: [col("term", "Video (ID)", "Identity", "text", true, "left"), col("title", "Video Title", "Identity"), ...trafficMetricColumns], datasetId: "traffic_end_screen" }),
 table({ id: "traffic_live_redirect", mainCategoryId: "traffic", label: "Live Redirects", description: "Live redirect traffic.", snapshotKeys: ["trafficLiveRedirect"], categoryIds: ["traffic_live_redirect"], columns: [col("term", "Video (ID)", "Identity", "text", true, "left"), col("title", "Video Title", "Identity"), ...trafficMetricColumns], datasetId: "traffic_live_redirect" }),
 table({ id: "traffic_playlist", mainCategoryId: "traffic", label: "Playlist Traffic", description: "Playlist traffic.", snapshotKeys: ["trafficPlaylist"], categoryIds: ["traffic_playlist"], columns: [col("term", "Playlist (ID)", "Identity", "text", true, "left"), col("title", "Playlist Title", "Identity"), ...trafficMetricColumns], datasetId: "traffic_playlist" }),
 table({ id: "traffic_yt_playlist_page", mainCategoryId: "traffic", label: "YT Playlist Pages", description: "YouTube playlist page traffic.", snapshotKeys: ["trafficYtPlaylistPage"], categoryIds: ["traffic_yt_playlist_page"], columns: [col("term", "Playlist (ID)", "Identity", "text", true, "left"), col("title", "Playlist Title", "Identity"), ...trafficMetricColumns], datasetId: "traffic_yt_playlist_page" }),
 table({ id: "other_feat", mainCategoryId: "traffic", label: "Other Features", description: "Other feature traffic.", snapshotKeys: ["trafficOtherFeatures"], categoryIds: ["other_features"], columns: [col("term", "Other Feature", "Identity", "text", true, "left"), ...trafficMetricColumns], datasetId: "other_feat" }),
 table({ id: "locations", mainCategoryId: "traffic", label: "Playback Locations", description: "Playback location traffic and its share of the complete channel playback-location report.", snapshotKeys: ["playbackLocations"], categoryIds: ["playback_location"], columns: [col("location", "Playback Location", "Identity", "text", true, "left"), ...shortMetricColumns, ...channelTrafficShareColumns], datasetId: "locations" }),
 table({ id: "demographics", mainCategoryId: "demographics", label: "Age × Gender", description: "Age, gender, and age × gender viewer percentages derived from one combined demographic report.", snapshotKeys: ["demographics"], categoryIds: ["audience_demographics"], columns: demographicOverviewColumns, defaultSort: { key: "ageOrder", direction: "asc" }, datasetId: "demographics", layoutMode: "sparse-full" }),
 table({ id: "demog_age", mainCategoryId: "demographics", label: "Age Group", description: "Demographics by age.", snapshotKeys: ["demographicsByAge"], categoryIds: ["demographics_age"], columns: [col("cohort", "Age Group", "Identity", "text", true, "left"), col("viewsPct", "Views (%)", "Audience", "percent")], defaultSort: { key: "viewsPct", direction: "desc" }, datasetId: "demog_age" }),
 table({ id: "demog_gender", mainCategoryId: "demographics", label: "Gender", description: "Demographics by gender.", snapshotKeys: ["demographicsByGender"], categoryIds: ["demographics_gender"], columns: [col("cohort", "Gender", "Identity", "text", true, "left"), col("viewsPct", "Views (%)", "Audience", "percent")], defaultSort: { key: "viewsPct", direction: "desc" }, datasetId: "demog_gender" }),
 table({ id: "audience", mainCategoryId: "demographics", label: "Audience Behavior", description: "Audience behavior rows.", snapshotKeys: ["audienceWatchBehavior"], categoryIds: ["audience_watch_behavior"], columns: [col("term", "Audience Behavior", "Identity", "text", true, "left"), col("views", "Views", "Metrics", "number"), col("engagedViews", "Engaged Views", "Metrics", "number"), col("watchTime", "Watch Time", "Metrics", "durationHours"), col("avgDuration", "Average View Duration", "Metrics", "duration")], datasetId: "audience" }),
 table({ id: "new_returning", mainCategoryId: "demographics", label: "New vs Returning", description: "New and returning viewers.", snapshotKeys: ["newReturningViewers"], categoryIds: ["new_returning_viewers"], columns: [col("term", "New/Returning", "Identity", "text", true, "left"), col("views", "Views", "Metrics", "number"), col("engagedViews", "Engaged Views", "Metrics", "number"), col("watchTime", "Watch Time", "Metrics", "durationHours")], datasetId: "new_returning" }),
 table({ id: "subs", mainCategoryId: "channel_totals", label: "Subscriber Status", description: "Subscribed status rows with standard and YouTube Premium watch metrics.", snapshotKeys: ["subscriptionStatuses"], categoryIds: ["subscription_status"], columns: [col("status", "Subscriber Status", "Identity", "text", true, "left"), ...subscriberStatusMetricColumns], datasetId: "subs" }),
 table({ id: "geography", mainCategoryId: "geography", label: "Overview", description: "Country geography rows.", snapshotKeys: ["geography"], categoryIds: ["geography_country"], columns: [
  col("countryFlag", "Flag", "Identity", "flag", true, "left", { preferredWidth: 66 }),
  col("countryCode", "Country Code", "Identity", "text", true, "left", { preferredWidth: 42 }),
  col("countryName", "Country Name", "Identity", "text", true, "left", { preferredWidth: 110 }),
  ...geographyFullColumns,
 ], datasetId: "geography" }),
 table({ id: "cities", mainCategoryId: "geography", label: "Cities", description: "City geography rows.", snapshotKeys: ["cities"], categoryIds: ["geography_city"], columns: [
  col("countryFlag", "Flag", "Identity", "flag", true, "left", { preferredWidth: 66 }),
  col("city", "City", "Identity", "text", true, "left", { preferredWidth: 150 }),
  col("countryName", "Country", "Identity", "text", true, "left", { preferredWidth: 180 }),
  ...shortMetricColumns,
 ], datasetId: "cities", layoutMode: "sparse-full" }),
 table({ id: "provinces", mainCategoryId: "geography", label: "US States", description: "US state rows.", snapshotKeys: ["provinces"], categoryIds: ["geography_province"], columns: [
   col("provinceCode", "State Code", "Identity", "text", true, "left", { preferredWidth: 112 }),
   col("stateName", "State Name", "Identity", "text", true, "left", { preferredWidth: 180 }),
   ...shortMetricColumns,
   col("youtubePremiumViews", "Premium Views", "Premium", "number"),
   col("youtubePremiumWatchTime", "Premium Watch", "Premium", "durationHours"),
   col("cardClickRate", "Card Click Rate", "Cards", "percent"),
   col("cardTeaserClickRate", "Teaser Click Rate", "Cards", "percent"),
   col("cardImpressions", "Card Impressions", "Cards", "number"),
   col("cardTeaserImpressions", "Teaser Impressions", "Cards", "number"),
   col("cardClicks", "Card Clicks", "Cards", "number"),
   col("cardTeaserClicks", "Teaser Clicks", "Cards", "number"),
  ], datasetId: "provinces", layoutMode: "sparse-full", compactMode: "normal-only" }),
 table({ id: "dma", mainCategoryId: "geography", label: "Regions (DMA)", description: "DMA geography rows.", snapshotKeys: ["dmaRegions"], categoryIds: ["geography_dma"], columns: [
  col("dmaCode", "DMA Code", "Identity", "text", true, "left", { preferredWidth: 112 }),
  col("dmaName", "DMA Area", "Identity", "text", true, "left", { preferredWidth: 260 }),
  ...shortMetricColumns,
 ], datasetId: "dma", layoutMode: "sparse-full", compactMode: "normal-only" }),
 table({ id: "continents", mainCategoryId: "geography", label: "Continents & Sub-regions", description: "Continent and sub-continent rows.", snapshotKeys: ["continentsData"], categoryIds: ["geography_country"], columns: [col("region", "Region", "Identity", "text", true, "left"), col("type", "Type", "Identity"), ...shortMetricColumns], datasetId: "continents" }),
 table({ id: "devices", mainCategoryId: "devices", label: "Devices", description: "Device type rows.", snapshotKeys: ["devices"], categoryIds: ["device_type"], columns: [col("device", "Device", "Identity", "text", true, "left"), ...shortMetricColumns], datasetId: "devices" }),
 table({ id: "os", mainCategoryId: "devices", label: "Operating Systems", description: "Operating system rows.", snapshotKeys: ["operatingSystems"], categoryIds: ["operating_system"], columns: [col("operatingSystem", "Operating System", "Identity", "text", true, "left"), ...shortMetricColumns], datasetId: "os" }),
 table({ id: "device_os", mainCategoryId: "devices", label: "Device x OS", description: "Devices, operating systems, and device × OS viewer percentages derived from one combined report.", snapshotKeys: ["deviceOs"], categoryIds: ["device_os"], columns: [col("device", "Device", "Identity", "text", true, "left"), col("operatingSystem", "Operating System", "Identity", "text", true, "left"), col("views", "Views", "Metrics", "number"), col("engagedViews", "Engaged Views", "Metrics", "number"), col("watchTime", "Watch Time", "Metrics", "durationHours"), col("avgDuration", "Average View Duration", "Metrics", "duration"), col("avgPercentageViewed", "Average Percentage Viewed (%)", "Metrics", "percent")], datasetId: "device_os", layoutMode: "sparse-full" }),
 table({ id: "creator", mainCategoryId: "content", label: "Content Type", description: "Creator content type rows.", snapshotKeys: ["creatorContentTypes"], categoryIds: ["creator_content_type"], columns: [
  col("term", "Content Type", "Identity", "text", true, "left", { preferredWidth: 160 }),
  ...completeAnalyticsMetricColumns.filter(
   (col) => col.key !== "videosAddedToPlaylists" && col.key !== "videosRemovedFromPlaylists",
  ),
  col("formatViewShare", "% of Views", "Format Share", "percent", true, undefined, { totalMode: "sum" }),
  col("formatEngagedViewShare", "% of Engaged Views", "Format Share", "percent", true, undefined, { totalMode: "sum" }),
  col("formatWatchTimeShare", "% of Watch Time", "Format Share", "percent", true, undefined, { totalMode: "sum" }),
  col("videoFormatVideoCount", "Video Count", "Format Averages", "number", true, undefined, { isFormula: true, totalMode: "sum" }),
  col("videoFormatAverageDuration", "Average Duration", "Format Averages", "duration", true, undefined, { isFormula: true, totalMode: "average" }),
  col("videoFormatAverageViews", "Average Views", "Format Averages", "number", true, undefined, { isFormula: true, totalMode: "average" }),
  col("videoFormatAverageWatchTime", "Average Watch Time", "Format Averages", "durationHours", true, undefined, { isFormula: true, totalMode: "average" }),
  col("videoFormatAverageLikes", "Average Likes", "Format Averages", "number", true, undefined, { isFormula: true, totalMode: "average" }),
  col("videoFormatAverageSubscribers", "Average Subscribers", "Format Averages", "number", true, undefined, { isFormula: true, totalMode: "average" }),
  col("videoFormatAverageComments", "Average Comments", "Format Averages", "number", true, undefined, { isFormula: true, totalMode: "average" }),
  col("videoFormatAverageShares", "Average Shares", "Format Averages", "number", true, undefined, { isFormula: true, totalMode: "average" }),
  col("videoFormatAverageCpm", "Average CPM", "Format Averages", "currency", true, undefined, { isFormula: true, totalMode: "average" }),
  col("videoFormatAverageEstimatedRevenue", "Average Est. Revenue", "Format Averages", "currency", true, undefined, { isFormula: true, totalMode: "average" }),
  col("videoFormatAverageGrossRevenue", "Average Gross Revenue", "Format Averages", "currency", true, undefined, { isFormula: true, totalMode: "average" }),
  col("videoFormatViews", "Video Views", "Video Table Totals", "number"),
  col("videoFormatWatchTime", "Video Watch Time", "Video Table Totals", "durationHours"),
  col("videoFormatAvgViewDuration", "AVD Average", "Video Table Totals", "duration", true, undefined, { totalMode: "average" }),
  col("videoFormatAvgPercentageViewed", "AVP Average", "Video Table Totals", "percent", true, undefined, { totalMode: "average" }),
  col("videoFormatRevenue", "Revenue", "Video Table Totals", "currency"),
  col("videoFormatLikes", "Likes", "Video Table Totals", "number"),
  col("videoFormatSubscribers", "Subs", "Video Table Totals", "number"),
  col("videoFormatComments", "Comments", "Video Table Totals", "number"),
  col("videoFormatShares", "Shares", "Video Table Totals", "number"),
 ], datasetId: "creator", summaryColumns: ["views", "watchTime", "formatViewShare", "formatWatchTimeShare"] }),
 table({ id: "formats_subscribers", mainCategoryId: "content", label: "Formats x Subscriber Status", description: "Creator content type rows grouped by subscriber status.", snapshotKeys: ["formatSubscriberStatuses"], categoryIds: ["formats_subscriber_status"], columns: [
  col("term", "Format", "Identity", "text", true, "left", { preferredWidth: 180 }),
  col("status", "Subscriber Status", "Identity", "text", true, "left", { preferredWidth: 220 }),
  ...subscriberStatusMetricColumns,
  ...formatSubscriberShareColumns,
 ], defaultSort: { key: "views", direction: "desc" }, datasetId: "formats_subscribers", presentationMode: "format-subscriber-status", verticalScrollMode: "custom" }),
 table({ id: "retentions", mainCategoryId: "content", label: "Retentions", description: "100-point audience-retention curves grouped by video.", snapshotKeys: ["retentions"], categoryIds: ["retention"], columns: [col("videoId", "Video ID", "Identity", "text", true, "left"), col("elapsedVideoTimeRatio", "Elapsed Video Time Ratio", "Retention", "percent"), col("audienceWatchRatio", "Audience Watch Ratio", "Retention", "percent"), col("relativeRetentionPerformance", "Relative Retention Performance", "Retention", "percent")], defaultSort: { key: "videoId", direction: "asc" }, datasetId: "retentions", presentationMode: "retention-video" }),
 table({ id: "shares", mainCategoryId: "content", label: "Sharing Services", description: "Sharing service rows.", snapshotKeys: ["sharingService"], categoryIds: ["sharing_service"], columns: [col("term", "Sharing Service", "Identity", "text", true, "left"), col("shares", "Shares", "Engagement", "number"), col("shareLinkShare", "% of Shared Links", "Engagement", "percent", true, undefined, { totalMode: "sum" })], defaultSort: { key: "shares", direction: "desc" }, datasetId: "shares" }),
 table({ id: "playlists", mainCategoryId: "playlists", label: "Playlist Statistics", description: "Playlist statistics rows.", snapshotKeys: ["playlistsData"], categoryIds: ["playlists_analytics"], columns: [
  col("cover", "Cover", "Playlist", "thumbnail", true, "left", { preferredWidth: 112 }),
  col("title", "Playlist", "Playlist", "text", true, "left", { preferredWidth: 360, textSize: 13 }),
  col("playlistId", "Playlist ID", "Playlist", "text", true, "left", { preferredWidth: 190, textSize: 10 }),
  col("playlistUrl", "Playlist URL", "Playlist", "text", true, undefined, { preferredWidth: 44 }),
  col("description", "Description", "Metadata", "text", true, "left", { preferredWidth: 280 }),
  col("publishedAt", "Published", "Metadata", "date"),
  col("videoCount", "Video Count", "Metadata", "number"),
  col("views", "Views", "Metrics", "number"),
  col("playlistViewShare", "% of Playlist Views", "Playlist Share", "percent", true, undefined, { totalMode: "sum" }),
  col("watchTime", "Watch Time", "Metrics", "durationMinutes"),
  col("playlistWatchTimeShare", "% of Playlist Watch Time", "Playlist Share", "percent", true, undefined, { totalMode: "sum" }),
  col("playlistStarts", "Playlist Starts", "Metrics", "number"),
  col("playlistSaves", "Playlist Saves (Net)", "Metrics", "number"),
  col("averageTimeInPlaylist", "Avg Time in Playlist", "Metrics", "duration"),
  col("viewsPerPlaylistStart", "Views per Playlist Start", "Metrics", "number"),
  col("privacyStatus", "Privacy Status", "Metadata")
 ], datasetId: "playlists", layoutMode: "sparse-full", horizontalScrollMode: "none" }),
 table({ id: "revenue", mainCategoryId: "revenue", label: "Overview", description: "Revenue source rows.", snapshotKeys: ["revenueSource"], categoryIds: ["revenue_source"], columns: [col("day", "Date", "Time", "date", true, "left"), col("revenue", "Total Revenue", "Revenue", "currency"), col("adRevenue", "Ad Revenue", "Revenue", "currency"), col("redRevenue", "Premium Revenue", "Revenue", "currency")], defaultSort: { key: "day", direction: "desc" }, datasetId: "revenue" }),
 table({ id: "ads", mainCategoryId: "revenue", label: "Ad Types", description: "Ad type rows.", snapshotKeys: ["adTypes"], categoryIds: ["ad_type"], columns: [col("adType", "Ad Type", "Identity", "text", true, "left"), col("grossRevenue", "Gross Revenue (USD)", "Revenue", "currency"), col("cpm", "CPM (USD)", "Revenue", "currency"), col("adImpressions", "Ad Impressions", "Revenue", "number")], defaultSort: { key: "grossRevenue", direction: "desc" }, datasetId: "ads" }),
]

/** Persisted URLs and imports may still use these IDs, but only canonical targets
 * are selectable. Keep this mapping at the registry boundary, not in UI code. */
export const VT_SYNC_LEGACY_TABLE_REDIRECTS: Readonly<Record<string, string>> = {
 channel_overview: "videos",
 monthly_api: "monthly",
 search: "traffic_detail_search_terms",
 ext_web: "traffic_detail_ext_websites",
 suggested: "traffic_detail_suggested_videos",
 hashtags: "traffic_detail_hashtags",
 sound: "traffic_detail_sound_pages",
 adv: "traffic_detail_advertising",
 chan_page: "traffic_detail_channel_pages",
 other_feat: "traffic_detail_other_features",
 traffic_subscribers: "traffic_detail_traffic_subscribers",
 traffic_campaign_card: "traffic_detail_traffic_campaign_card",
 traffic_notification: "traffic_detail_traffic_notification",
 traffic_end_screen: "traffic_detail_traffic_end_screen",
 traffic_live_redirect: "traffic_detail_traffic_live_redirect",
 traffic_playlist: "traffic_detail_traffic_playlist",
 traffic_yt_playlist_page: "traffic_detail_traffic_yt_playlist_page",
}

export const resolveVtSyncCanonicalTableId = (tableId: string): string =>
 VT_SYNC_LEGACY_TABLE_REDIRECTS[tableId] || tableId

const visibleSyncCategoryIds = new Set(VT_SYNC_CATEGORY_OPTIONS.map((category) => category.id))
const syncUnitTableIds = new Set(VT_SYNC_SYNC_UNITS.map((unit) => unit.tableId))

/** A table is selectable when it is owned by a visible sync unit or represents a
 * stable visible category (for example derived weekly stats or Traffic × Day). */
export const VT_SYNC_ACTIVE_TABLE_IDS = new Set(
 VT_SYNC_TABLE_DEFINITIONS
  .filter((tableDefinition) =>
   !Object.prototype.hasOwnProperty.call(VT_SYNC_LEGACY_TABLE_REDIRECTS, tableDefinition.id) &&
   (syncUnitTableIds.has(tableDefinition.id) || tableDefinition.categoryIds.some((id) => visibleSyncCategoryIds.has(id))),
  )
  .map((tableDefinition) => tableDefinition.id),
)

export const VT_SYNC_VISIBLE_TABLE_DEFINITIONS: VtSyncTableDefinition[] =
 VT_SYNC_TABLE_DEFINITIONS.filter((tableDefinition) => VT_SYNC_ACTIVE_TABLE_IDS.has(tableDefinition.id))

const activeTabs = (tabs: VtSyncTableCategoryDefinition["tabs"]) =>
 tabs.filter((tab) => VT_SYNC_ACTIVE_TABLE_IDS.has(tab.id))

export const VT_SYNC_VISIBLE_TABLE_CATEGORIES: VtSyncTableCategoryDefinition[] =
 VT_SYNC_TABLE_CATEGORIES
  .map((category) => ({ ...category, tabs: activeTabs(category.tabs) }))
  .filter((category) => category.tabs.length > 0)

export const getVtSyncTablesForCategory = (categoryId: string): VtSyncTableDefinition[] =>
 VT_SYNC_VISIBLE_TABLE_DEFINITIONS.filter((item) => item.categoryIds.includes(categoryId))
