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

const hasRenderableValue = (value: unknown): boolean => {
 if (value === null || value === undefined) return false
 if (typeof value === "string") return value.trim() !== ""
 if (typeof value === "number") return Number.isFinite(value)
 return true
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
  columns: ["Video title", "Video ID", "Upload date", "Length", "Format"],
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
  requiredColumns: ["Video title", "Video ID", "Views", "Watch Hrs", "Impressions"],
  dedupeAliases: {
   "Watch time (hours)": "Watch Hrs",
   "Impressions click-through rate (%)": "CTR",
   "Average view duration": "AVD",
   "Average percentage viewed (%)": "AVP %",
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
