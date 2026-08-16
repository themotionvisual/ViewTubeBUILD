export type VtSyncAnalyticsMetricFamily = "watch" | "engagement" | "cards" | "revenue"
export type VtSyncAnalyticsMetricAggregation = "sum" | "weighted-rate" | "calculated-rate"
export type VtSyncAnalyticsMetricFormat = "number" | "percent" | "currency" | "duration" | "durationHours"

export type VtSyncAnalyticsMetricDescriptor = {
 apiName: string
 normalizedField: string
 label: string
 group: "Watch" | "Engagement" | "Cards" | "Revenue"
 family: VtSyncAnalyticsMetricFamily
 format: VtSyncAnalyticsMetricFormat
 aggregation: VtSyncAnalyticsMetricAggregation
 requiresMonetaryScope?: boolean
 transform?: "minutes-to-hours"
}

const metric = (
 apiName: string,
 normalizedField: string,
 label: string,
 group: VtSyncAnalyticsMetricDescriptor["group"],
 family: VtSyncAnalyticsMetricFamily,
 format: VtSyncAnalyticsMetricFormat,
 aggregation: VtSyncAnalyticsMetricAggregation,
 options: Pick<VtSyncAnalyticsMetricDescriptor, "requiresMonetaryScope" | "transform"> = {},
): VtSyncAnalyticsMetricDescriptor => ({
 apiName,
 normalizedField,
 label,
 group,
 family,
 format,
 aggregation,
 ...options,
})

/**
 * Authoritative VT-SYNC Analytics contract. Existing dataset-specific aliases and
 * additional metrics remain supported, but every covered report requests these
 * 29 API metrics through the generated family bundles below.
 */
export const VT_SYNC_ANALYTICS_METRIC_DESCRIPTORS = [
 metric("engagedViews", "engagedViews", "Engaged Views", "Watch", "watch", "number", "sum"),
 metric("views", "views", "Views", "Watch", "watch", "number", "sum"),
 metric("redViews", "youtubePremiumViews", "Premium Views", "Watch", "watch", "number", "sum"),
 metric("estimatedMinutesWatched", "watchTime", "Watch Time", "Watch", "watch", "durationHours", "sum", { transform: "minutes-to-hours" }),
 metric("estimatedRedMinutesWatched", "youtubePremiumWatchTime", "Premium Watch Time", "Watch", "watch", "durationHours", "sum", { transform: "minutes-to-hours" }),
 metric("averageViewDuration", "avgViewDuration", "Average View Duration", "Watch", "watch", "duration", "weighted-rate"),
 metric("averageViewPercentage", "averagePercentageViewed", "Average Percentage Viewed", "Watch", "watch", "percent", "weighted-rate"),

 metric("comments", "comments", "Comments", "Engagement", "engagement", "number", "sum"),
 metric("likes", "likes", "Likes", "Engagement", "engagement", "number", "sum"),
 metric("dislikes", "dislikes", "Dislikes", "Engagement", "engagement", "number", "sum"),
 metric("videosAddedToPlaylists", "videosAddedToPlaylists", "Playlist Adds", "Engagement", "engagement", "number", "sum"),
 metric("videosRemovedFromPlaylists", "videosRemovedFromPlaylists", "Playlist Removes", "Engagement", "engagement", "number", "sum"),
 metric("shares", "shares", "Shares", "Engagement", "engagement", "number", "sum"),
 metric("subscribersGained", "subscribersGained", "Subscribers Gained", "Engagement", "engagement", "number", "sum"),
 metric("subscribersLost", "subscribersLost", "Subscribers Lost", "Engagement", "engagement", "number", "sum"),

 metric("estimatedRevenue", "revenue", "Estimated Revenue", "Revenue", "revenue", "currency", "sum", { requiresMonetaryScope: true }),
 metric("estimatedAdRevenue", "estimatedAdRevenue", "Estimated Ad Revenue", "Revenue", "revenue", "currency", "sum", { requiresMonetaryScope: true }),
 metric("grossRevenue", "grossRevenue", "Gross Revenue", "Revenue", "revenue", "currency", "sum", { requiresMonetaryScope: true }),
 metric("estimatedRedPartnerRevenue", "youtubePremiumRevenue", "Premium Revenue", "Revenue", "revenue", "currency", "sum", { requiresMonetaryScope: true }),
 metric("monetizedPlaybacks", "monetizedPlaybacks", "Monetized Playbacks", "Revenue", "revenue", "number", "sum", { requiresMonetaryScope: true }),
 metric("playbackBasedCpm", "playbackBasedCpm", "Playback CPM", "Revenue", "revenue", "currency", "calculated-rate", { requiresMonetaryScope: true }),
 metric("adImpressions", "adImpressions", "Ad Impressions", "Revenue", "revenue", "number", "sum", { requiresMonetaryScope: true }),
 metric("cpm", "cpm", "CPM", "Revenue", "revenue", "currency", "calculated-rate", { requiresMonetaryScope: true }),

 metric("cardClickRate", "cardClickRate", "Card Click Rate", "Cards", "cards", "percent", "calculated-rate"),
 metric("cardTeaserClickRate", "cardTeaserClickRate", "Teaser Click Rate", "Cards", "cards", "percent", "calculated-rate"),
 metric("cardImpressions", "cardImpressions", "Card Impressions", "Cards", "cards", "number", "sum"),
 metric("cardTeaserImpressions", "cardTeaserImpressions", "Teaser Impressions", "Cards", "cards", "number", "sum"),
 metric("cardClicks", "cardClicks", "Card Clicks", "Cards", "cards", "number", "sum"),
 metric("cardTeaserClicks", "cardTeaserClicks", "Teaser Clicks", "Cards", "cards", "number", "sum"),
] as const satisfies readonly VtSyncAnalyticsMetricDescriptor[]

export const VT_SYNC_REQUIRED_ANALYTICS_METRICS = VT_SYNC_ANALYTICS_METRIC_DESCRIPTORS.map(
 (descriptor) => descriptor.apiName,
)

export const VT_SYNC_ANALYTICS_METRIC_BUNDLES = (["watch", "engagement", "cards", "revenue"] as const).map(
 (family) => ({
  id: family,
  metrics: VT_SYNC_ANALYTICS_METRIC_DESCRIPTORS
   .filter((descriptor) => descriptor.family === family)
   .map((descriptor) => descriptor.apiName),
 }),
)

const finiteNumber = (value: unknown): number | undefined => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value === "string" && value.trim()) {
  const parsed = Number(value.replace(/[$,% ,]/g, ""))
  return Number.isFinite(parsed) ? parsed : undefined
 }
 return undefined
}

/** Maps only defined API values so a partial bundle can never erase stored data. */
export const mapVtSyncAnalyticsMetricFields = (row: Record<string, unknown>) => {
 const mapped: Record<string, number> = {}
 VT_SYNC_ANALYTICS_METRIC_DESCRIPTORS.forEach((descriptor) => {
  const value = finiteNumber(row[descriptor.apiName])
  if (value === undefined) return
  mapped[descriptor.normalizedField] = descriptor.transform === "minutes-to-hours" ? value / 60 : value
 })
 return mapped
}

export const getVtSyncAnalyticsMetricDescriptor = (apiName: string) =>
 VT_SYNC_ANALYTICS_METRIC_DESCRIPTORS.find((descriptor) => descriptor.apiName === apiName)
