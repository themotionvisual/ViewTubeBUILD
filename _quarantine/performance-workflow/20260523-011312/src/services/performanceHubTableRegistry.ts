import type { CanonicalMetricKey } from "./analyticsContract"

export type PerformanceHubTableDatasetId =
 | "master"
 | "daily"
 | "traffic"
 | "audience"
 | "country"
 | "device"

export type PerformanceHubTableContract = {
 id: PerformanceHubTableDatasetId
 label: string
 supportsTagFilter: boolean
 columns: string[]
 useCompactHeaderLabels?: boolean
}

export type PerformanceHubDatasetProfile = {
 allowedColumns: string[]
 requiredColumns: string[]
 dedupeAliases?: Record<string, string>
 defaultSort?: { column: string; dir: "asc" | "desc" }
 totalsBehavior: "sum" | "weighted" | "none" | "compact"
 sparseLayout: boolean
}

export type DailyMetricSourceType = "current_sync" | "syncable" | "csv_first" | "derived"

export type DailyMetricColumnDefinition = {
 header: string
 aliases: string[]
 sourceType: DailyMetricSourceType
 apiSyncable: boolean
 reportingSyncable: boolean
 csvOnly: boolean
 derived: boolean
 defaultVisible: boolean
}

export type MasterVideoColumnSourceCapability =
 | "sync_only"
 | "csv_only"
 | "both"
 | "derived"

export type MasterVideoColumnApplicability =
 | "all"
 | "shorts_only"
 | "long_only"

export type MasterVideoColumnDefinition = {
 header: string
 shortLabel: string
 aliases: string[]
 canonicalMetricKey?: CanonicalMetricKey
 sourceCapability: MasterVideoColumnSourceCapability
 apiSyncable: boolean
 reportingSyncable: boolean
 csvSupported: boolean
 applicability: MasterVideoColumnApplicability
 defaultVisible: boolean
 preserveWhenEmpty?: boolean
}

const hasRenderableValue = (value: unknown): boolean => {
 if (value === null || value === undefined) return false
 if (typeof value === "string") return value.trim() !== ""
 if (typeof value === "number") return Number.isFinite(value)
 return true
}

const masterMetric = (
 header: string,
 shortLabel: string,
 aliases: string[],
 options: {
  canonicalMetricKey?: CanonicalMetricKey
  sourceCapability: MasterVideoColumnSourceCapability
  apiSyncable: boolean
  reportingSyncable: boolean
  csvSupported: boolean
  applicability?: MasterVideoColumnApplicability
  preserveWhenEmpty?: boolean
 },
): MasterVideoColumnDefinition => ({
 header,
 shortLabel,
 aliases,
 canonicalMetricKey: options.canonicalMetricKey,
 sourceCapability: options.sourceCapability,
 apiSyncable: options.apiSyncable,
 reportingSyncable: options.reportingSyncable,
 csvSupported: options.csvSupported,
 applicability: options.applicability || "all",
 defaultVisible: true,
 preserveWhenEmpty: options.preserveWhenEmpty,
})

export const MASTER_VIDEO_COLUMNS: MasterVideoColumnDefinition[] = [
 masterMetric("Video title", "Title", ["Video title", "title", "Title"], {
  sourceCapability: "derived",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
  preserveWhenEmpty: true,
 }),
 masterMetric("Video ID", "Video ID", ["Video ID", "videoId", "Content"], {
  sourceCapability: "derived",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
  preserveWhenEmpty: true,
 }),
 masterMetric("Upload date", "Date", ["Upload date", "Video publish time", "Date", "day"], {
  sourceCapability: "derived",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
  preserveWhenEmpty: true,
 }),
 masterMetric("Length", "Length", ["Length", "Duration", "Duration (sec)", "durationSeconds"], {
  sourceCapability: "derived",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
  preserveWhenEmpty: true,
 }),
 masterMetric("Format", "Format", ["Format", "Type", "type", "creatorContentType", "contentType"], {
  sourceCapability: "derived",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
  preserveWhenEmpty: true,
 }),
 masterMetric("Views", "Views", ["Views", "views"], {
  canonicalMetricKey: "views",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
 }),
 masterMetric("Subscribers gained", "Subs +", ["Subscribers gained", "Subscribers Gained", "Subs +", "subscribersGained"], {
  canonicalMetricKey: "subscribersGained",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
 }),
 masterMetric("Subscribers lost", "Subs -", ["Subscribers lost", "Subscribers Lost", "Subs -", "subscribersLost"], {
  canonicalMetricKey: "subscribersLost",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
 }),
 masterMetric("Likes", "Likes +", ["Likes", "Likes +", "likes"], {
  canonicalMetricKey: "likes",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
 }),
 masterMetric("Dislikes", "Likes -", ["Dislikes", "Likes -", "dislikes"], {
  canonicalMetricKey: "dislikes",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
 }),
 masterMetric("Likes (vs. dislikes) (%)", "Like %", ["Likes (vs. dislikes) (%)"], {
  sourceCapability: "csv_only",
  apiSyncable: false,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Shares", "Shares", ["Shares", "shares"], {
  canonicalMetricKey: "shares",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
 }),
 masterMetric("Watch time (hours)", "Watch Hrs", ["Watch time (hours)", "Watch Time (Hours)", "Watch Hrs", "estimatedMinutesWatched"], {
  canonicalMetricKey: "watchHours",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
 }),
 masterMetric("Engaged views", "Engaged", ["Engaged views", "Engaged", "engagedViews"], {
  canonicalMetricKey: "engagedViews",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Comments added", "CMNTS", ["Comments added", "Comments", "comments"], {
  canonicalMetricKey: "comments",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
 }),
 masterMetric("Average view duration", "AVD", ["Average view duration", "AVD", "AVD (Sec)", "AVD (Average View Duration)", "averageViewDuration"], {
  canonicalMetricKey: "avdSeconds",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
 }),
 masterMetric("Average percentage viewed (%)", "AVP %", ["Average percentage viewed (%)", "AVP %", "AVP (%)", "averageViewPercentage"], {
  canonicalMetricKey: "avp",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
 }),
 masterMetric("RPM (USD)", "RPM", ["RPM (USD)", "RPM", "rpm"], {
  canonicalMetricKey: "rpm",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("CPM (USD)", "CPM", ["CPM (USD)", "CPM", "cpm"], {
  canonicalMetricKey: "cpm",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("YouTube ad revenue (USD)", "Ad Revenue", ["YouTube ad revenue (USD)", "Estimated Ad Revenue", "Ad Revenue", "estimatedAdRevenue"], {
  canonicalMetricKey: "estimatedAdRevenue",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("YouTube Premium (USD)", "Premium Revenue", ["YouTube Premium (USD)", "Estimated Premium Revenue", "Premium Revenue", "estimatedRedPartnerRevenue"], {
  canonicalMetricKey: "estimatedPremiumRevenue",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Estimated revenue (USD)", "Revenue", ["Estimated revenue (USD)", "Estimated revenue", "Revenue", "estimatedRevenue"], {
  canonicalMetricKey: "revenue",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
 }),
 masterMetric("Impressions", "Impressions", ["Impressions", "videoThumbnailImpressions"], {
  canonicalMetricKey: "impressions",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
  applicability: "long_only",
 }),
 masterMetric("Stayed to watch (%)", "STW %", ["Stayed to watch (%)", "STW %", "stayedToWatch"], {
  canonicalMetricKey: "stw",
  sourceCapability: "csv_only",
  apiSyncable: false,
  reportingSyncable: false,
  csvSupported: true,
  applicability: "shorts_only",
 }),
 masterMetric("Impressions click-through rate (%)", "CTR %", ["Impressions click-through rate (%)", "CTR %", "CTR", "CTR (%)", "Click-Through Rate (CTR)", "videoThumbnailImpressionsClickRate"], {
  canonicalMetricKey: "ctr",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
  applicability: "long_only",
 }),
 masterMetric("Unique viewers", "Unique", ["Unique viewers", "Unique Viewers", "Unique", "uniqueViewers"], {
  canonicalMetricKey: "uniqueViewers",
  sourceCapability: "csv_only",
  apiSyncable: false,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Average views per viewer", "Avg/View", ["Average views per viewer", "averageViewsPerViewer"], {
  sourceCapability: "csv_only",
  apiSyncable: false,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Unique reach", "Reach", ["Unique reach", "uniqueReach"], {
  sourceCapability: "csv_only",
  apiSyncable: false,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("New viewers", "New", ["New viewers", "New Viewers", "newViewers"], {
  canonicalMetricKey: "newViewers",
  sourceCapability: "csv_only",
  apiSyncable: false,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Casual viewers", "Casual", ["Casual viewers", "Casual Viewers", "casualViewers"], {
  canonicalMetricKey: "casualViewers",
  sourceCapability: "csv_only",
  apiSyncable: false,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Returning viewers", "Returning", ["Returning viewers", "Returning Viewers", "returningViewers"], {
  canonicalMetricKey: "returningViewers",
  sourceCapability: "csv_only",
  apiSyncable: false,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Regular viewers", "Regular", ["Regular viewers", "Regular Viewers", "regularViewers"], {
  canonicalMetricKey: "regularViewers",
  sourceCapability: "csv_only",
  apiSyncable: false,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("YouTube Premium watch time (hours)", "Red Hrs", ["YouTube Premium watch time (hours)", "YouTube Premium Watch Time", "Red Hrs", "redWatchHours", "estimatedRedMinutesWatched"], {
  canonicalMetricKey: "redWatchHours",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
 }),
 masterMetric("Transaction revenue (USD)", "Txn Rev", ["Transaction revenue (USD)", "Transaction Revenue", "transactionRevenue"], {
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Transactions", "Txns", ["Transactions"], {
  sourceCapability: "csv_only",
  apiSyncable: false,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Revenue per transaction (USD)", "Rev/Txn", ["Revenue per transaction (USD)"], {
  sourceCapability: "csv_only",
  apiSyncable: false,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Watch Page ads (USD)", "Watch Ads", ["Watch Page ads (USD)"], {
  sourceCapability: "csv_only",
  apiSyncable: false,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Estimated DoubleClick revenue (USD)", "DoubleClick", ["Estimated DoubleClick revenue (USD)"], {
  sourceCapability: "csv_only",
  apiSyncable: false,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Estimated AdSense revenue (USD)", "AdSense", ["Estimated AdSense revenue (USD)"], {
  sourceCapability: "csv_only",
  apiSyncable: false,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Ad impressions", "Ad Impr", ["Ad impressions", "Ad Impressions", "adImpressions"], {
  canonicalMetricKey: "adImpressions",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Playback-based CPM (USD)", "Playback CPM", ["Playback-based CPM (USD)", "Playback Based CPM", "playbackBasedCpm"], {
  canonicalMetricKey: "playbackBasedCpm",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Estimated monetized playbacks", "Monetized", ["Estimated monetized playbacks", "Monetized Playbacks", "monetizedPlaybacks"], {
  canonicalMetricKey: "monetizedPlaybacks",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("YouTube Premium views", "Premium Views", ["YouTube Premium views"], {
  sourceCapability: "both",
  apiSyncable: false,
  reportingSyncable: true,
  csvSupported: true,
 }),
 masterMetric("Playlist watch time (hours)", "Playlist Hrs", ["Playlist watch time (hours)"], {
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
 }),
 masterMetric("Views from playlist", "Playlist Views", ["Views from playlist"], {
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
 }),
 masterMetric("End screen element clicks", "ES Clicks", ["End screen element clicks", "endScreenElementClicks", "endScreenClicks"], {
  canonicalMetricKey: "endScreenElementClicks",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
  applicability: "long_only",
 }),
 masterMetric("End screen elements shown", "ES Impr", ["End screen elements shown", "endScreenElementsShown", "endScreenImpressions"], {
  canonicalMetricKey: "endScreenElementsShown",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
  applicability: "long_only",
 }),
 masterMetric("Clicks per end screen element shown (%)", "End Screen %", ["Clicks per end screen element shown (%)", "End screen click rate", "End Screen %", "clicksPerEndScreenElementShown"], {
  canonicalMetricKey: "clicksPerEndScreenElementShown",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
  applicability: "long_only",
 }),
 masterMetric("Card clicks", "Card Clicks", ["Card clicks", "cardClicks"], {
  canonicalMetricKey: "cardClicks",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
  applicability: "long_only",
 }),
 masterMetric("Cards shown", "Cards Shown", ["Cards shown", "cardsShown", "cardImpressions"], {
  canonicalMetricKey: "cardsShown",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
  applicability: "long_only",
 }),
 masterMetric("Clicks per card shown (%)", "Card %", ["Clicks per card shown (%)", "Card click rate", "Card %", "clicksPerCardShown", "cardClickRate"], {
  canonicalMetricKey: "clicksPerCardShown",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: true,
  csvSupported: true,
  applicability: "long_only",
 }),
 masterMetric("Card teaser clicks", "Teaser Clicks", ["Card teaser clicks", "Teaser Clicks", "cardTeaserClicks"], {
  canonicalMetricKey: "cardTeaserClicks",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: true,
  applicability: "long_only",
 }),
 masterMetric("Card teasers shown", "Teaser Impr", ["Card teasers shown", "Card teaser impressions", "Teaser Impr", "cardTeaserImpressions"], {
  canonicalMetricKey: "cardTeaserImpressions",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: true,
  applicability: "long_only",
 }),
 masterMetric("Teaser clicks per card teaser shown (%)", "Teaser %", ["Teaser clicks per card teaser shown (%)", "Card teaser click rate", "Teaser %", "cardTeaserClickRate"], {
  canonicalMetricKey: "cardTeaserClickRate",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: true,
  applicability: "long_only",
 }),
 masterMetric("Rubies", "Rubies", ["Rubies"], {
  sourceCapability: "csv_only",
  apiSyncable: false,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Hypes", "Hypes", ["Hypes", "hypes"], {
  canonicalMetricKey: "hypes",
  sourceCapability: "sync_only",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: false,
 }),
 masterMetric("Hype points", "Hype Pts", ["Hype points", "hypePoints"], {
  canonicalMetricKey: "hypePoints",
  sourceCapability: "sync_only",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: false,
 }),
 masterMetric("Remix count", "Remix count", ["Remix count", "remixCount"], {
  canonicalMetricKey: "remixCount",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Remixes of Your Content", "Remixes", ["Remixes of Your Content", "shortsRemixCount"], {
  canonicalMetricKey: "remixesOfYourContent",
  sourceCapability: "sync_only",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: false,
  applicability: "shorts_only",
 }),
 masterMetric("Remix views", "Remix views", ["Remix views", "remixViews"], {
  canonicalMetricKey: "remixViews",
  sourceCapability: "both",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: true,
 }),
 masterMetric("Shorts Funnel Percent Watched", "Shorts Watched %", ["Shorts Funnel Percent Watched", "shortsPercentWatched"], {
  canonicalMetricKey: "shortsFunnelPercentWatched",
  sourceCapability: "sync_only",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: false,
  applicability: "shorts_only",
 }),
 masterMetric("Shorts Funnel Swipe Away Rate", "Shorts Swipe %", ["Shorts Funnel Swipe Away Rate", "shortsSwipeAwayRate"], {
  canonicalMetricKey: "shortsFunnelSwipeAwayRate",
  sourceCapability: "sync_only",
  apiSyncable: true,
  reportingSyncable: false,
  csvSupported: false,
  applicability: "shorts_only",
 }),
]

const MASTER_VIDEO_COLUMN_BY_HEADER = new Map(
 MASTER_VIDEO_COLUMNS.map((column) => [column.header, column]),
)

const MASTER_VIDEO_COLUMN_ALIAS_LOOKUP = (() => {
 const lookup = new Map<string, string>()
 MASTER_VIDEO_COLUMNS.forEach((column) => {
  const tokens = [column.header, column.shortLabel, ...column.aliases]
  tokens.forEach((token) => {
   const normalized = token.toLowerCase().replace(/[^a-z0-9]/g, "")
   if (normalized) lookup.set(normalized, column.header)
  })
 })
 return lookup
})()

export const getMasterVideoColumnDefinition = (
 header: string,
): MasterVideoColumnDefinition | null => {
 const direct = MASTER_VIDEO_COLUMN_BY_HEADER.get(header)
 if (direct) return direct
 const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, "")
 const resolvedHeader = MASTER_VIDEO_COLUMN_ALIAS_LOOKUP.get(normalized)
 return resolvedHeader ? MASTER_VIDEO_COLUMN_BY_HEADER.get(resolvedHeader) || null : null
}

export const getMasterVideoColumnHeaders = (): string[] =>
 MASTER_VIDEO_COLUMNS.map((column) => column.header)

export const getMasterVideoIdentityHeaders = (): string[] =>
 MASTER_VIDEO_COLUMNS.filter((column) => column.preserveWhenEmpty).map(
  (column) => column.header,
 )

export const getMasterVideoShortLabel = (header: string): string =>
 getMasterVideoColumnDefinition(header)?.shortLabel || header

export const getMasterVideoDedupeKey = (header: string): string => {
 const column = getMasterVideoColumnDefinition(header)
 return column?.canonicalMetricKey || column?.header || header
}

export const DAILY_METRIC_COLUMNS: DailyMetricColumnDefinition[] = [
 { header: "Date", aliases: ["Date", "day", "Day"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Engaged views", aliases: ["Engaged views", "engagedViews"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Subscribers", aliases: ["Subscribers", "subscribers"], sourceType: "derived", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: true, defaultVisible: true },
 { header: "Average percentage viewed (%)", aliases: ["Average percentage viewed (%)", "averageViewPercentage"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Videos added", aliases: ["Videos added"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Videos published", aliases: ["Videos published"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Impressions", aliases: ["Impressions", "videoThumbnailImpressions"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Impressions click-through rate (%)", aliases: ["Impressions click-through rate (%)", "videoThumbnailImpressionsClickRate"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Unique viewers", aliases: ["Unique viewers", "uniqueViewers"], sourceType: "syncable", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Stayed to watch (%)", aliases: ["Stayed to watch (%)", "STW %", "stayedToWatch"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Average views per viewer", aliases: ["Average views per viewer", "averageViewsPerViewer"], sourceType: "syncable", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Unique reach", aliases: ["Unique reach", "uniqueReach"], sourceType: "syncable", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "New viewers", aliases: ["New viewers", "newViewers", "new_viewers"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Casual viewers", aliases: ["Casual viewers", "casualViewers", "casual_viewers"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Returning viewers", aliases: ["Returning viewers", "returningViewers"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Regular viewers", aliases: ["Regular viewers", "regularViewers", "regular_viewers"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Hypes", aliases: ["Hypes", "hypes"], sourceType: "syncable", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Hype points", aliases: ["Hype points", "hypePoints"], sourceType: "syncable", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Subscribers lost", aliases: ["Subscribers lost", "subscribersLost"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Subscribers gained", aliases: ["Subscribers gained", "subscribersGained"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Likes", aliases: ["Likes", "likes"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Dislikes", aliases: ["Dislikes", "dislikes"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Likes (vs. dislikes) (%)", aliases: ["Likes (vs. dislikes) (%)"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Shares", aliases: ["Shares", "shares"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Comments added", aliases: ["Comments added", "Comments", "comments"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Transaction revenue (USD)", aliases: ["Transaction revenue (USD)", "Transaction Revenue", "transactionRevenue"], sourceType: "syncable", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Transactions", aliases: ["Transactions"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Revenue per transaction (USD)", aliases: ["Revenue per transaction (USD)"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "YouTube Premium (USD)", aliases: ["YouTube Premium (USD)", "Estimated Premium Revenue", "estimatedRedPartnerRevenue"], sourceType: "syncable", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Watch Page ads (USD)", aliases: ["Watch Page ads (USD)"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Estimated DoubleClick revenue (USD)", aliases: ["Estimated DoubleClick revenue (USD)"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Estimated AdSense revenue (USD)", aliases: ["Estimated AdSense revenue (USD)"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "YouTube ad revenue (USD)", aliases: ["YouTube ad revenue (USD)", "Estimated Ad Revenue", "estimatedAdRevenue"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Ad impressions", aliases: ["Ad impressions", "Ad Impressions", "adImpressions"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Playback-based CPM (USD)", aliases: ["Playback-based CPM (USD)", "Playback Based CPM", "playbackBasedCpm"], sourceType: "syncable", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: false, defaultVisible: true },
 { header: "CPM (USD)", aliases: ["CPM (USD)", "CPM", "cpm"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: true, defaultVisible: true },
 { header: "Estimated monetized playbacks", aliases: ["Estimated monetized playbacks", "Monetized Playbacks", "monetizedPlaybacks"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: false, defaultVisible: true },
 { header: "RPM (USD)", aliases: ["RPM (USD)", "RPM", "rpm"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: true, defaultVisible: true },
 { header: "Rubies", aliases: ["Rubies"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Total members", aliases: ["Total members"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Active members", aliases: ["Active members"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Members gained", aliases: ["Members gained"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Members lost", aliases: ["Members lost"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Canceled memberships", aliases: ["Canceled memberships"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Exit surveys", aliases: ["Exit surveys"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Average membership tenure (days)", aliases: ["Average membership tenure (days)"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Churn rate (%)", aliases: ["Churn rate (%)"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Product clicks", aliases: ["Product clicks"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Product impressions", aliases: ["Product impressions"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Total sales (USD)", aliases: ["Total sales (USD)"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Orders", aliases: ["Orders"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Approved commissions (USD)", aliases: ["Approved commissions (USD)"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Pending commissions (USD)", aliases: ["Pending commissions (USD)"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Removed commission (USD)", aliases: ["Removed commission (USD)"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "YouTube Premium views", aliases: ["YouTube Premium views"], sourceType: "syncable", apiSyncable: false, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "YouTube Premium watch time (hours)", aliases: ["YouTube Premium watch time (hours)", "redWatchHours", "estimatedRedMinutesWatched"], sourceType: "syncable", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: true, defaultVisible: true },
 { header: "Playlist watch time (hours)", aliases: ["Playlist watch time (hours)"], sourceType: "syncable", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Views from playlist", aliases: ["Views from playlist"], sourceType: "syncable", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Views per playlist start", aliases: ["Views per playlist start"], sourceType: "syncable", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Hours streamed", aliases: ["Hours streamed"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Reminders set", aliases: ["Reminders set"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Chat messages", aliases: ["Chat messages"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Reactions", aliases: ["Reactions"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Post impressions", aliases: ["Post impressions"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Post likes", aliases: ["Post likes"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Post like rate (%)", aliases: ["Post like rate (%)"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Post responses", aliases: ["Post responses"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Post response rate (%)", aliases: ["Post response rate (%)"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Post subscribers", aliases: ["Post subscribers"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Remix count", aliases: ["Remix count", "remixCount"], sourceType: "syncable", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Remix views", aliases: ["Remix views", "remixViews"], sourceType: "syncable", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Community clip views", aliases: ["Community clip views"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Watch time from community clips (hours)", aliases: ["Watch time from community clips (hours)"], sourceType: "csv_first", apiSyncable: false, reportingSyncable: false, csvOnly: true, derived: false, defaultVisible: true },
 { header: "Card clicks", aliases: ["Card clicks", "cardClicks"], sourceType: "syncable", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Clicks per card shown (%)", aliases: ["Clicks per card shown (%)", "cardClickRate", "clicksPerCardShown"], sourceType: "syncable", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Cards shown", aliases: ["Cards shown", "cardImpressions", "cardsShown"], sourceType: "syncable", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Card teaser clicks", aliases: ["Card teaser clicks", "cardTeaserClicks"], sourceType: "syncable", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Card teasers shown", aliases: ["Card teasers shown", "cardTeaserImpressions", "Card teaser impressions"], sourceType: "syncable", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Teaser clicks per card teaser shown (%)", aliases: ["Teaser clicks per card teaser shown (%)", "cardTeaserClickRate", "Card teaser click rate"], sourceType: "syncable", apiSyncable: true, reportingSyncable: false, csvOnly: false, derived: false, defaultVisible: true },
 { header: "End screen element clicks", aliases: ["End screen element clicks", "endScreenElementClicks", "endScreenClicks"], sourceType: "syncable", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "End screen elements shown", aliases: ["End screen elements shown", "endScreenElementsShown", "endScreenImpressions"], sourceType: "syncable", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Clicks per end screen element shown (%)", aliases: ["Clicks per end screen element shown (%)", "clicksPerEndScreenElementShown"], sourceType: "syncable", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Views", aliases: ["Views", "views"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
 { header: "Watch time (hours)", aliases: ["Watch time (hours)", "estimatedMinutesWatched"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: true, defaultVisible: true },
 { header: "Average view duration", aliases: ["Average view duration", "averageViewDuration"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: true, defaultVisible: true },
 { header: "Estimated revenue (USD)", aliases: ["Estimated revenue (USD)", "estimatedRevenue"], sourceType: "current_sync", apiSyncable: true, reportingSyncable: true, csvOnly: false, derived: false, defaultVisible: true },
]

export const PERFORMANCE_HUB_TABLE_DATASET_CONTRACTS: Record<
 PerformanceHubTableDatasetId,
 PerformanceHubTableContract
> = {
 master: {
  id: "master",
  label: "Master Video Table",
  supportsTagFilter: true,
  useCompactHeaderLabels: true,
  columns: getMasterVideoColumnHeaders(),
 },
 daily: {
  id: "daily",
  label: "Daily Metrics",
  supportsTagFilter: false,
  useCompactHeaderLabels: false,
  columns: DAILY_METRIC_COLUMNS.map((column) => column.header),
 },
 traffic: {
  id: "traffic",
  label: "Traffic Sources",
  supportsTagFilter: false,
  useCompactHeaderLabels: true,
  columns: [
   "Traffic group",
   "Data source",
   "Traffic source",
   "Source type",
   "Source title",
   "Viewer %",
   "Views",
   "Watch Hrs",
   "Watch time (hours)",
   "Engaged views",
   "Average view duration",
   "Average percentage viewed (%)",
   "Impressions",
   "Impressions click-through rate (%)",
   "Playlist watch time (hours)",
   "Views from playlist",
   "Views per playlist start",
   "YouTube Premium views",
   "YouTube Premium watch time (hours)",
  ],
 },
 audience: {
  id: "audience",
  label: "Audience",
  supportsTagFilter: false,
  useCompactHeaderLabels: true,
  columns: ["Viewer age", "Viewer gender", "Views (%)", "Watch time (hours) (%)"],
 },
 country: {
  id: "country",
  label: "Geography",
  supportsTagFilter: false,
  useCompactHeaderLabels: true,
  columns: [
   "Country",
   "Viewer %",
   "Views",
   "Watch Hrs",
   "Engaged views",
   "Average view duration",
   "Average percentage viewed (%)",
   "Stayed to watch (%)",
   "Subscribers gained",
   "Subscribers lost",
   "Subscribers",
   "Likes",
   "Dislikes",
   "Shares",
   "Comments added",
   "Estimated revenue (USD)",
  ],
 },
 device: {
  id: "device",
  label: "Audience Devices",
  supportsTagFilter: false,
  useCompactHeaderLabels: true,
  columns: ["Device type", "Viewer %", "Views", "Watch Hrs", "Subscribers Gained", "Revenue"],
 },
}

export const PERFORMANCE_HUB_DATASET_PROFILES: Record<
 PerformanceHubTableDatasetId,
 PerformanceHubDatasetProfile
> = {
 master: {
  allowedColumns: PERFORMANCE_HUB_TABLE_DATASET_CONTRACTS.master.columns,
  requiredColumns: ["Video title", "Video ID", "Upload date", "Length", "Format", "Views"],
  dedupeAliases: {
   "Watch time (hours)": "Watch Hrs",
   "Impressions click-through rate (%)": "CTR %",
   "Average view duration": "AVD",
   "Average percentage viewed (%)": "AVP %",
   "YouTube ad revenue (USD)": "Ad Revenue",
   "YouTube Premium (USD)": "Premium Revenue",
   "Estimated revenue (USD)": "Revenue",
   "YouTube Premium watch time (hours)": "Red Hrs",
   "Clicks per end screen element shown (%)": "End Screen %",
   "Clicks per card shown (%)": "Card %",
   "Teaser clicks per card teaser shown (%)": "Teaser %",
  },
  defaultSort: { column: "Views", dir: "desc" },
  totalsBehavior: "compact",
  sparseLayout: false,
 },
 daily: {
  allowedColumns: PERFORMANCE_HUB_TABLE_DATASET_CONTRACTS.daily.columns,
  requiredColumns: ["Date", "Views", "Watch time (hours)", "Estimated revenue (USD)"],
  dedupeAliases: {
   "Watch time (hours)": "Watch Hrs",
   "Impressions click-through rate (%)": "CTR",
   "Average percentage viewed (%)": "AVP %",
  },
  defaultSort: { column: "Date", dir: "desc" },
  totalsBehavior: "sum",
  sparseLayout: false,
 },
 traffic: {
  allowedColumns: PERFORMANCE_HUB_TABLE_DATASET_CONTRACTS.traffic.columns,
  requiredColumns: ["Traffic source", "Traffic group", "Data source", "Views", "Watch Hrs", "Impressions"],
  dedupeAliases: {
   "Watch time (hours)": "Watch Hrs",
   "Impressions click-through rate (%)": "CTR",
   "Average percentage viewed (%)": "AVP %",
  },
  defaultSort: { column: "Views", dir: "desc" },
  totalsBehavior: "weighted",
  sparseLayout: false,
 },
 audience: {
  allowedColumns: PERFORMANCE_HUB_TABLE_DATASET_CONTRACTS.audience.columns,
  requiredColumns: ["Viewer age", "Viewer gender", "Views (%)", "Watch time (hours) (%)"],
  totalsBehavior: "none",
  sparseLayout: true,
 },
 country: {
  allowedColumns: PERFORMANCE_HUB_TABLE_DATASET_CONTRACTS.country.columns,
  requiredColumns: ["Country", "Viewer %", "Views", "Watch Hrs"],
  dedupeAliases: {
   "Average percentage viewed (%)": "AVP %",
   "Average view duration": "AVD",
  },
  defaultSort: { column: "Views", dir: "desc" },
  totalsBehavior: "sum",
  sparseLayout: true,
 },
 device: {
  allowedColumns: PERFORMANCE_HUB_TABLE_DATASET_CONTRACTS.device.columns,
  requiredColumns: ["Device type", "Viewer %", "Views", "Watch Hrs"],
  defaultSort: { column: "Views", dir: "desc" },
  totalsBehavior: "sum",
  sparseLayout: true,
 },
}

export const shouldUseCompactHeaderLabels = (
 datasetId: PerformanceHubTableDatasetId,
): boolean => PERFORMANCE_HUB_TABLE_DATASET_CONTRACTS[datasetId].useCompactHeaderLabels !== false

export const projectDailyMetricColumns = (
 source: Record<string, unknown>,
): Record<string, unknown> => {
 const projected: Record<string, unknown> = {}
 DAILY_METRIC_COLUMNS.forEach((column) => {
  const match = column.aliases.find((alias) => hasRenderableValue(source[alias]))
  if (match) {
   projected[column.header] = source[match]
  }
 })
 return projected
}

export const buildProjectedDailyMetricFields = (
 apiSource: Record<string, unknown>,
 csvSource: Record<string, unknown> = {},
): Record<string, unknown> =>
 projectDailyMetricColumns({
  ...apiSource,
  ...csvSource,
 })
