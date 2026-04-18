export type AnalyticsWindow = "7d" | "28d" | "90d" | "365d" | "lifetime"

export const ANALYTICS_WINDOWS: AnalyticsWindow[] = [
 "lifetime",
 "365d",
 "90d",
 "28d",
 "7d",
]

export type MetricStatus = "actual" | "derived" | "unavailable"
export type MetricSource = "api" | "csv_table" | "ga4" | "hybrid"
export type MetricAvailability = "available" | "unavailable"
export type MetricConfidence = "raw_direct" | "derived_exact" | "unavailable"

export type CanonicalMetricKey =
 | "views"
 | "watchHours"
 | "likes"
 | "dislikes"
 | "comments"
 | "shares"
 | "subscribersGained"
 | "impressions"
 | "revenue"
 | "cpm"
 | "rpm"
 | "ctr"
 | "newViewers"
 | "returningViewers"
 | "casualViewers"
 | "regularViewers"
 | "uniqueViewers"
 | "avdSeconds"
 | "avp"
 | "engagedViews"
 | "stw"
 | "endScreenClickRate"
 | "cardClickRate"

export interface MetricCell {
 value: number | null
 status: MetricStatus
 source: MetricSource
 availability: MetricAvailability
 confidence: MetricConfidence
 reasonCode?: string
 sourceField?: string
 windowScope?: AnalyticsWindow | "multi" | "unknown"
}

export interface CanonicalMetricDefinition {
 key: CanonicalMetricKey
 label: string
 unit: "count" | "hours" | "seconds" | "currency" | "rate" | "percent"
 aliases: string[]
 rawPolicy: "raw_preferred" | "derived_ok"
 sourceWindows: {
  api: AnalyticsWindow[]
  csv_table: AnalyticsWindow[]
  ga4: AnalyticsWindow[]
 }
}

export interface CanonicalVideoRow {
 id: string
 videoId: string
 title: string
 thumbnailUrl?: string
 uploadDate: string
 format: "shorts" | "long" | "live" | "story" | "unknown"
 durationSeconds: number
 sourceMode: MetricSource
 metrics: Record<CanonicalMetricKey, MetricCell>
}

export const METRIC_REGISTRY: Record<CanonicalMetricKey, CanonicalMetricDefinition> = {
  views: {
   key: "views",
   label: "Views",
   unit: "count",
   aliases: ["Views", "View count", "views", "viewCount", "screenPageViews"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  watchHours: {
   key: "watchHours",
   label: "Watch Time (Hours)",
   unit: "hours",
   aliases: [
    "Watch Time (Hours)",
    "Watch time (hours)",
    "Watch Hrs",
    "watchHrs",
    "estimatedMinutesWatched",
    "Estimated minutes watched",
    "Watch Min",
    "averageSessionDuration",
   ],
   rawPolicy: "derived_ok",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  likes: {
   key: "likes",
   label: "Likes",
   unit: "count",
   aliases: ["Likes", "likes", "likeCount"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  dislikes: {
   key: "dislikes",
   label: "Dislikes",
   unit: "count",
   aliases: ["Dislikes", "dislikes", "dislikeCount"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  comments: {
   key: "comments",
   label: "Comments",
   unit: "count",
   aliases: ["Comments", "comments", "commentCount", "Comments added"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  shares: {
   key: "shares",
   label: "Shares",
   unit: "count",
   aliases: ["Shares", "shares", "shareCount"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  subscribersGained: {
   key: "subscribersGained",
   label: "Subscribers Gained",
   unit: "count",
   aliases: [
    "Subscribers Gained",
    "Subscribers gained",
    "Subscribers",
    "subscribersGained",
    "Subs +",
    "activeUsers",
   ],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  impressions: {
   key: "impressions",
   label: "Impressions",
   unit: "count",
   aliases: ["Impressions", "videoThumbnailImpressions", "sessions"],
   rawPolicy: "derived_ok",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  revenue: {
   key: "revenue",
   label: "Revenue",
   unit: "currency",
   aliases: [
    "Revenue",
    "Estimated revenue",
    "Your estimated revenue (USD)",
    "estimatedRevenue",
    "Estimated revenue (USD)",
   ],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  cpm: {
   key: "cpm",
   label: "CPM",
   unit: "currency",
   aliases: ["CPM", "CPM (USD)", "cpm"],
   rawPolicy: "derived_ok",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  rpm: {
   key: "rpm",
   label: "RPM",
   unit: "currency",
   aliases: [
    "RPM",
    "RPM (USD)",
    "Estimated RPM",
    "estimatedRevenuePer1000Views",
    "rpm",
   ],
   rawPolicy: "derived_ok",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  ctr: {
   key: "ctr",
   label: "Click-Through Rate (CTR)",
   unit: "percent",
   aliases: [
    "CTR (%)",
    "CTR",
    "ctr",
    "Impressions click-through rate (%)",
    "videoThumbnailImpressionsClickRate",
    "Click-Through Rate (CTR)",
    "clickThroughRate",
    "engagementRate",
   ],
   rawPolicy: "derived_ok",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  newViewers: {
   key: "newViewers",
   label: "New Viewers",
   unit: "count",
   aliases: ["New Viewers", "New viewers", "newViewers"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  returningViewers: {
   key: "returningViewers",
   label: "Returning Viewers",
   unit: "count",
   aliases: ["Returning Viewers", "Returning viewers", "returningViewers"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  casualViewers: {
   key: "casualViewers",
   label: "Casual viewers",
   unit: "count",
   aliases: ["Casual viewers", "Casual Viewers", "casualViewers"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  regularViewers: {
   key: "regularViewers",
   label: "Regular viewers",
   unit: "count",
   aliases: ["Regular viewers", "Regular Viewers", "regularViewers"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  uniqueViewers: {
   key: "uniqueViewers",
   label: "Unique viewers",
   unit: "count",
   aliases: ["Unique viewers", "Unique Viewers", "uniqueViewers", "Unique viewers"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  avdSeconds: {
   key: "avdSeconds",
   label: "AVD (Average View Duration)",
   unit: "seconds",
   aliases: [
    "AVD (Sec)",
    "AVD (Average View Duration)",
    "Average view duration",
    "averageViewDuration",
   ],
   rawPolicy: "derived_ok",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  avp: {
   key: "avp",
   label: "AVP (%)",
   unit: "percent",
   aliases: [
    "AVP (%)",
    "Average percentage viewed (%)",
    "averageViewPercentage",
    "adjustedAVP",
   ],
   rawPolicy: "derived_ok",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  engagedViews: {
   key: "engagedViews",
   label: "Engaged views",
   unit: "count",
   aliases: ["Engaged views", "Engaged Views", "engagedViews"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  stw: {
   key: "stw",
   label: "STW %",
   unit: "percent",
   aliases: ["STW %", "Stayed to watch (%)", "stayedToWatch", "stayedToWatch0:30"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  endScreenClickRate: {
   key: "endScreenClickRate",
   label: "End screen click rate",
   unit: "percent",
   aliases: [
    "End screen click rate",
    "Clicks per end screen element shown (%)",
    "clicksPerEndScreenElementShown",
   ],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  cardClickRate: {
   key: "cardClickRate",
   label: "Card click rate",
   unit: "percent",
   aliases: ["Card click rate", "annotationClickThroughRate", "cardClickRate"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
}

export const canonicalMetricOrder: CanonicalMetricKey[] = [
 "views",
 "watchHours",
 "comments",
 "shares",
 "subscribersGained",
 "impressions",
 "revenue",
 "cpm",
 "rpm",
 "ctr",
 "newViewers",
 "returningViewers",
 "casualViewers",
 "regularViewers",
 "uniqueViewers",
 "avdSeconds",
 "stw",
 "endScreenClickRate",
 "cardClickRate",
 "likes",
 "dislikes",
 "avp",
 "engagedViews",
]

export const canonicalizeMetricKey = (value: string): string =>
 value.toLowerCase().replace(/[^a-z0-9]/g, "")

const metricAliasMap = Object.entries(METRIC_REGISTRY).reduce(
 (acc, [key, def]) => {
  acc[key] = key as CanonicalMetricKey
  def.aliases.forEach((alias) => {
   acc[canonicalizeMetricKey(alias)] = key as CanonicalMetricKey
  })
  return acc
 },
 {} as Record<string, CanonicalMetricKey>,
)

const asNumber = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return null
 const trimmed = value.trim()
 if (!trimmed || trimmed === "-" || trimmed.toLowerCase() === "n/a") return null
 const cleaned = trimmed.replace(/,/g, "").replace(/%/g, "")
 if (!cleaned) return null
 const parsed = Number(cleaned)
 return Number.isFinite(parsed) ? parsed : null
}

const valueExists = (value: unknown): boolean => {
 if (value === null || value === undefined) return false
 if (typeof value === "string") {
  const trimmed = value.trim()
  return trimmed !== "" && trimmed !== "-" && trimmed.toLowerCase() !== "n/a"
 }
 return true
}

export const getMetricByAliases = (
 row: Record<string, unknown>,
 metricKey: CanonicalMetricKey,
): { value: number | null; found: boolean } => {
 const def = METRIC_REGISTRY[metricKey]
 const rowEntries = Object.entries(row)

 for (const alias of def.aliases) {
  if (Object.prototype.hasOwnProperty.call(row, alias)) {
   const raw = row[alias]
   if (valueExists(raw)) {
    const parsed = asNumber(raw)
    if (parsed !== null) return { value: parsed, found: true }
   }
  }
 }
 for (const [rawKey, rawValue] of rowEntries) {
  const normalized = canonicalizeMetricKey(rawKey)
  if (metricAliasMap[normalized] !== metricKey) continue
  if (valueExists(rawValue)) {
   const parsed = asNumber(rawValue)
   if (parsed !== null) return { value: parsed, found: true }
  }
 }

 return { value: null, found: false }
}

export const buildUnavailableMetricCell = (
 source: MetricSource,
 reasonCode?: string,
): MetricCell => ({
 value: null,
 status: "unavailable",
 source,
 availability: "unavailable",
 confidence: "unavailable",
 reasonCode,
 windowScope: "unknown",
})

export const buildActualMetricCell = (
 value: number,
 source: MetricSource,
 meta?: Pick<MetricCell, "sourceField" | "windowScope">,
): MetricCell => ({
 value,
 status: "actual",
 source,
 availability: "available",
 confidence: "raw_direct",
 sourceField: meta?.sourceField,
 windowScope: meta?.windowScope ?? "unknown",
})

export const buildDerivedMetricCell = (
 value: number,
 source: MetricSource,
 meta?: Pick<MetricCell, "sourceField" | "windowScope" | "reasonCode">,
): MetricCell => ({
 value,
 status: "derived",
 source,
 availability: "available",
 confidence: "derived_exact",
 sourceField: meta?.sourceField,
 windowScope: meta?.windowScope ?? "unknown",
 reasonCode: meta?.reasonCode,
})

export const emptyMetricCells = (source: MetricSource): Record<CanonicalMetricKey, MetricCell> =>
 canonicalMetricOrder.reduce(
  (acc, key) => {
   acc[key] = buildUnavailableMetricCell(source)
   return acc
  },
  {} as Record<CanonicalMetricKey, MetricCell>,
 )

export const toMetricSource = (value: "api" | "csv" | "ga4" | "hybrid"): MetricSource => {
 if (value === "csv") return "csv_table"
 if (value === "ga4") return "ga4"
 if (value === "hybrid") return "hybrid"
 return "api"
}

export type IngestSourceContract =
 | "youtube_data_v3"
 | "youtube_analytics_v2"
 | "youtube_reporting"
 | "google_search_console"
 | "csv"
 | "google_sheets"

export type MetricApplicability = "shared" | "shorts_only" | "long_only" | "channel_only"

export interface MetricCapability {
 metric: string
 source: IngestSourceContract
 allowedDimensions: Array<"video" | "day" | "channel" | "country" | "trafficSource">
 applicability: MetricApplicability
 enabled: boolean
}

export type MetricCapabilityRegistry = Record<string, MetricCapability>

export const METRIC_CAPABILITY_REGISTRY: MetricCapabilityRegistry = {
 views: {
  metric: "views",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel", "country", "trafficSource"],
  applicability: "shared",
  enabled: true,
 },
 estimatedMinutesWatched: {
  metric: "estimatedMinutesWatched",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel", "country", "trafficSource"],
  applicability: "shared",
  enabled: true,
 },
 averageViewDuration: {
  metric: "averageViewDuration",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 averageViewPercentage: {
  metric: "averageViewPercentage",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 subscribersGained: {
  metric: "subscribersGained",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 likes: {
  metric: "likes",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 comments: {
  metric: "comments",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 shares: {
  metric: "shares",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 engagedViews: {
  metric: "engagedViews",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 subscribersLost: {
  metric: "subscribersLost",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 dislikes: {
  metric: "dislikes",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 cardImpressions: {
  metric: "cardImpressions",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 cardClicks: {
  metric: "cardClicks",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 videoThumbnailImpressions: {
  metric: "videoThumbnailImpressions",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 videoThumbnailImpressionsClickRate: {
  metric: "videoThumbnailImpressionsClickRate",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 estimatedRevenue: {
  metric: "estimatedRevenue",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 estimatedAdRevenue: {
  metric: "estimatedAdRevenue",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 cpm: {
  metric: "cpm",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 monetizedPlaybacks: {
  metric: "monetizedPlaybacks",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 playbackBasedCpm: {
  metric: "playbackBasedCpm",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 adImpressions: {
  metric: "adImpressions",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 annotationClickThroughRate: {
  metric: "annotationClickThroughRate",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: false,
 },
 annotationCloseRate: {
  metric: "annotationCloseRate",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: false,
 },
 redViews: {
  metric: "redViews",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: false,
 },
 estimatedRedPartnerRevenue: {
  metric: "estimatedRedPartnerRevenue",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: false,
 },
}

export const isMetricSupportedForScope = (
 metric: string,
 source: IngestSourceContract,
 dimension: "video" | "day" | "channel" | "country" | "trafficSource",
): boolean => {
 const capability = METRIC_CAPABILITY_REGISTRY[metric]
 if (!capability) return false
 if (!capability.enabled) return false
 if (capability.source !== source) return false
 return capability.allowedDimensions.includes(dimension)
}

export const filterSupportedMetrics = (
 metrics: string[],
 source: IngestSourceContract,
 dimension: "video" | "day" | "channel" | "country" | "trafficSource",
): string[] =>
 metrics.filter((metric) => isMetricSupportedForScope(metric, source, dimension))
