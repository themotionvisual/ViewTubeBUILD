import type {
 AnalyticsWindow,
 CanonicalMetricKey,
 MetricCell,
 MetricSource,
} from "../analytics/DataStore"
import {
 ANALYTICS_WINDOWS,
 buildUnavailableMetricCell,
} from "../analytics/DataStore"

export type MasterMetricSourcePolicy =
 | "api_first"
 | "csv_first"
 | "csv_only"
 | "max_total"
 | "derived_only"
 | "identity_locked"

export type MasterMetricMergeRule =
 | "prefer_api"
 | "prefer_csv"
 | "prefer_max_value"
 | "prefer_recent"
 | "prefer_derived"
 | "prefer_identity"

export type MasterMetricApplicability = "all" | "shorts_only" | "long_only"

export type MasterMetricContract = {
 key: CanonicalMetricKey
 aliases: string[]
 windowSupport: AnalyticsWindow[]
 applicability: MasterMetricApplicability
 sourcePolicy: MasterMetricSourcePolicy
 mergeRule: MasterMetricMergeRule
 capabilityGate: "standard_creator_oauth" | "csv_import" | "reporting_optional"
 requiredForBaseline: boolean
 provenanceLabel: "youtube_api" | "csv_import" | "hybrid" | "derived"
}

export type MasterMetricAuditResult = {
 metricKey: CanonicalMetricKey
 claimedSources: Array<"api" | "csv" | "reporting">
 verifiedSources: Array<"api" | "csv" | "reporting">
 disputed: boolean
 baselineDecision: MasterMetricSourcePolicy
 notes: string
}

export type ChannelBootstrapSnapshot = {
 channelId: string
 handle: string | null
 title: string
 description: string
 tags: string[]
 url: string | null
 thumbnails: Record<string, unknown>
 country: string | null
 uploadsPlaylistId: string | null
 unsubscribedTrailer: string | null
 currentSubscribers: number | null
 publicVideoCount: number | null
 publicViewCount: number | null
 categoryId: string | null
 categoryName: string | null
 topicDetails: Record<string, unknown> | null
}

export type MasterVideoIdentity = {
 videoId: string
 title: string
 descriptionPreview: string
 publishedAt: string
 thumbnails: Record<string, unknown>
 tags: string[]
 durationSeconds: number
 format: "shorts" | "long" | "live" | "story" | "unknown"
 privacyStatus: string
 uploadStatus: string
 categoryId: string
 categoryName: string
 topicDetails: Record<string, unknown> | null
}

export type MasterTableStageStatus = "idle" | "complete" | "partial" | "error"

export type MasterTableStageResult = {
 status: MasterTableStageStatus
 syncedAt: number | null
 capabilities: string[]
 diagnostics: string[]
 provenance: Array<"api" | "csv" | "reporting">
 rowsTouched: number
 fieldsPopulated: string[]
}

export const MASTER_TABLE_METRIC_AUDIT_CACHE_KEY = "vt_master_table_metric_audit"
export const MASTER_TABLE_STAGE_RESULTS_CACHE_KEY =
 "vt_master_table_stage_results"

const ALL_WINDOWS = [...ANALYTICS_WINDOWS]

const metricContract = (
 key: CanonicalMetricKey,
 config: Omit<MasterMetricContract, "key">,
): MasterMetricContract => ({
 key,
 ...config,
})

export const MASTER_METRIC_CONTRACTS: Record<
 CanonicalMetricKey,
 MasterMetricContract
> = {
 views: metricContract("views", {
  aliases: ["Views", "views"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "max_total",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: true,
  provenanceLabel: "hybrid",
 }),
 watchHours: metricContract("watchHours", {
  aliases: ["Watch time (hours)", "estimatedMinutesWatched"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "max_total",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: true,
  provenanceLabel: "hybrid",
 }),
 likes: metricContract("likes", {
  aliases: ["Likes", "likes"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "max_total",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: true,
  provenanceLabel: "hybrid",
 }),
 dislikes: metricContract("dislikes", {
  aliases: ["Dislikes", "dislikes"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "max_total",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: true,
  provenanceLabel: "hybrid",
 }),
 comments: metricContract("comments", {
  aliases: ["Comments", "comments"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "max_total",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "hybrid",
 }),
 shares: metricContract("shares", {
  aliases: ["Shares", "shares"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "max_total",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "hybrid",
 }),
 saves: metricContract("saves", {
  aliases: ["Saves", "videosAddedToPlaylists"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 subscribersGained: metricContract("subscribersGained", {
  aliases: ["Subscribers gained", "subscribersGained"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "max_total",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "hybrid",
 }),
 subscribersLost: metricContract("subscribersLost", {
  aliases: ["Subscribers lost", "subscribersLost"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "max_total",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "hybrid",
 }),
 subscribersNet: metricContract("subscribersNet", {
  aliases: ["Subscribers net", "subscribersNet"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "derived_only",
  mergeRule: "prefer_recent",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "derived",
 }),
 impressions: metricContract("impressions", {
  aliases: ["Impressions", "videoThumbnailImpressions"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "hybrid",
 }),
 revenue: metricContract("revenue", {
  aliases: ["Estimated revenue (USD)", "estimatedRevenue"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "max_total",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: true,
  provenanceLabel: "hybrid",
 }),
 cpm: metricContract("cpm", {
  aliases: ["CPM (USD)", "cpm"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "derived_only",
  mergeRule: "prefer_recent",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "derived",
 }),
 rpm: metricContract("rpm", {
  aliases: ["RPM (USD)", "rpm"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "derived_only",
  mergeRule: "prefer_recent",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "derived",
 }),
 ctr: metricContract("ctr", {
  aliases: ["CTR", "videoThumbnailImpressionsClickRate"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "api_first",
  mergeRule: "prefer_recent",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "hybrid",
 }),
 newViewers: metricContract("newViewers", {
  aliases: ["New viewers", "newViewers"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "csv_only",
  mergeRule: "prefer_csv",
  capabilityGate: "csv_import",
  requiredForBaseline: false,
  provenanceLabel: "csv_import",
 }),
 returningViewers: metricContract("returningViewers", {
  aliases: ["Returning viewers", "returningViewers"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "csv_only",
  mergeRule: "prefer_csv",
  capabilityGate: "csv_import",
  requiredForBaseline: false,
  provenanceLabel: "csv_import",
 }),
 casualViewers: metricContract("casualViewers", {
  aliases: ["Casual viewers", "casualViewers"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "csv_only",
  mergeRule: "prefer_csv",
  capabilityGate: "csv_import",
  requiredForBaseline: false,
  provenanceLabel: "csv_import",
 }),
 regularViewers: metricContract("regularViewers", {
  aliases: ["Regular viewers", "regularViewers"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "csv_only",
  mergeRule: "prefer_csv",
  capabilityGate: "csv_import",
  requiredForBaseline: false,
  provenanceLabel: "csv_import",
 }),
 uniqueViewers: metricContract("uniqueViewers", {
  aliases: ["Unique viewers", "uniqueViewers"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "csv_only",
  mergeRule: "prefer_csv",
  capabilityGate: "csv_import",
  requiredForBaseline: false,
  provenanceLabel: "csv_import",
 }),
 avdSeconds: metricContract("avdSeconds", {
  aliases: ["Average view duration", "averageViewDuration"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "api_first",
  mergeRule: "prefer_recent",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 avp: metricContract("avp", {
  aliases: ["Average percentage viewed (%)", "averageViewPercentage"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "api_first",
  mergeRule: "prefer_recent",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 engagedViews: metricContract("engagedViews", {
  aliases: ["Engaged views", "engagedViews"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "max_total",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "hybrid",
 }),
 stw: metricContract("stw", {
  aliases: ["Stayed to watch (%)", "stayedToWatch"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "csv_only",
  mergeRule: "prefer_recent",
  capabilityGate: "csv_import",
  requiredForBaseline: false,
  provenanceLabel: "csv_import",
 }),
 endScreenClickRate: metricContract("endScreenClickRate", {
  aliases: ["endScreenClickRate", "clicksPerEndScreenElementShown"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_recent",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 endScreenClicks: metricContract("endScreenClicks", {
  aliases: ["endScreenClicks", "endScreenElementClicks"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 endScreenImpressions: metricContract("endScreenImpressions", {
  aliases: ["endScreenImpressions", "endScreenElementsShown"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 cardClickRate: metricContract("cardClickRate", {
  aliases: ["cardClickRate", "clicksPerCardShown"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_recent",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 cardTeaserClickRate: metricContract("cardTeaserClickRate", {
  aliases: ["cardTeaserClickRate"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_recent",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 cardTeaserClicks: metricContract("cardTeaserClicks", {
  aliases: ["cardTeaserClicks"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 cardTeaserImpressions: metricContract("cardTeaserImpressions", {
  aliases: ["cardTeaserImpressions"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 annotationImpressions: metricContract("annotationImpressions", {
  aliases: ["annotationImpressions"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 annotationClickableImpressions: metricContract("annotationClickableImpressions", {
  aliases: ["annotationClickableImpressions"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 annotationClosableImpressions: metricContract("annotationClosableImpressions", {
  aliases: ["annotationClosableImpressions"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 annotationClicks: metricContract("annotationClicks", {
  aliases: ["annotationClicks"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 annotationCloses: metricContract("annotationCloses", {
  aliases: ["annotationCloses"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 redWatchHours: metricContract("redWatchHours", {
  aliases: ["YouTube Premium watch time (hours)", "estimatedRedMinutesWatched"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 estimatedAdRevenue: metricContract("estimatedAdRevenue", {
  aliases: ["YouTube ad revenue (USD)", "estimatedAdRevenue"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "max_total",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "hybrid",
 }),
 grossRevenue: metricContract("grossRevenue", {
  aliases: ["grossRevenue"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "max_total",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "hybrid",
 }),
 playbackBasedCpm: metricContract("playbackBasedCpm", {
  aliases: ["Playback-based CPM (USD)", "playbackBasedCpm"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "api_first",
  mergeRule: "prefer_recent",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 adImpressions: metricContract("adImpressions", {
  aliases: ["Ad impressions", "adImpressions"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "max_total",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "hybrid",
 }),
 monetizedPlaybacks: metricContract("monetizedPlaybacks", {
  aliases: ["Estimated monetized playbacks", "monetizedPlaybacks"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "max_total",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "hybrid",
 }),
 estimatedPremiumRevenue: metricContract("estimatedPremiumRevenue", {
  aliases: ["YouTube Premium (USD)", "estimatedRedPartnerRevenue"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "max_total",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "hybrid",
 }),
 endScreenElementClicks: metricContract("endScreenElementClicks", {
  aliases: ["End screen element clicks", "endScreenElementClicks"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 endScreenElementsShown: metricContract("endScreenElementsShown", {
  aliases: ["End screen elements shown", "endScreenElementsShown"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 clicksPerEndScreenElementShown: metricContract("clicksPerEndScreenElementShown", {
  aliases: ["Clicks per end screen element shown (%)", "clicksPerEndScreenElementShown"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_recent",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 cardClicks: metricContract("cardClicks", {
  aliases: ["Card clicks", "cardClicks"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 cardsShown: metricContract("cardsShown", {
  aliases: ["Cards shown", "cardImpressions"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 clicksPerCardShown: metricContract("clicksPerCardShown", {
  aliases: ["Clicks per card shown (%)", "cardClickRate"],
  windowSupport: ALL_WINDOWS,
  applicability: "long_only",
  sourcePolicy: "api_first",
  mergeRule: "prefer_recent",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 hypes: metricContract("hypes", {
  aliases: ["Hypes", "hypes"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 hypePoints: metricContract("hypePoints", {
  aliases: ["Hype points", "hypePoints"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 remixCount: metricContract("remixCount", {
  aliases: ["Remix count", "remixCount"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 remixesOfYourContent: metricContract("remixesOfYourContent", {
  aliases: ["remixesOfYourContent"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 remixViews: metricContract("remixViews", {
  aliases: ["Remix views", "remixViews"],
  windowSupport: ALL_WINDOWS,
  applicability: "all",
  sourcePolicy: "api_first",
  mergeRule: "prefer_max_value",
  capabilityGate: "standard_creator_oauth",
  requiredForBaseline: false,
  provenanceLabel: "youtube_api",
 }),
 shortsFunnelPercentWatched: metricContract("shortsFunnelPercentWatched", {
  aliases: ["shortsFunnelPercentWatched"],
  windowSupport: ALL_WINDOWS,
  applicability: "shorts_only",
  sourcePolicy: "csv_only",
  mergeRule: "prefer_csv",
  capabilityGate: "csv_import",
  requiredForBaseline: false,
  provenanceLabel: "csv_import",
 }),
 shortsFunnelSwipeAwayRate: metricContract("shortsFunnelSwipeAwayRate", {
  aliases: ["shortsFunnelSwipeAwayRate"],
  windowSupport: ALL_WINDOWS,
  applicability: "shorts_only",
  sourcePolicy: "csv_only",
  mergeRule: "prefer_csv",
  capabilityGate: "csv_import",
  requiredForBaseline: false,
  provenanceLabel: "csv_import",
 }),
}

export const MASTER_METRIC_AUDIT_RESULTS: MasterMetricAuditResult[] = [
 {
  metricKey: "impressions",
  claimedSources: ["api", "csv", "reporting"],
  verifiedSources: ["api", "csv"],
  disputed: false,
  baselineDecision: "api_first",
  notes:
   "Thumbnail impressions API fetch unlocked.",
 },
 {
  metricKey: "ctr",
  claimedSources: ["api", "csv", "reporting"],
  verifiedSources: ["api", "csv"],
  disputed: false,
  baselineDecision: "api_first",
  notes:
   "CTR API fetch unlocked.",
 },
 {
  metricKey: "uniqueViewers",
  claimedSources: ["api", "csv", "reporting"],
  verifiedSources: ["csv"],
  disputed: true,
  baselineDecision: "csv_only",
  notes:
   "Unique-viewer style audience metrics stay import-only in the master table until a creator-safe video-scope source is proven.",
 },
 {
  metricKey: "newViewers",
  claimedSources: ["api", "csv"],
  verifiedSources: ["csv"],
  disputed: true,
  baselineDecision: "csv_only",
  notes: "Audience lifecycle viewer segments are CSV-only in the current master-table contract.",
 },
 {
  metricKey: "casualViewers",
  claimedSources: ["api", "csv"],
  verifiedSources: ["csv"],
  disputed: true,
  baselineDecision: "csv_only",
  notes: "Audience lifecycle viewer segments are CSV-only in the current master-table contract.",
 },
 {
  metricKey: "returningViewers",
  claimedSources: ["api", "csv"],
  verifiedSources: ["csv"],
  disputed: true,
  baselineDecision: "csv_only",
  notes: "Audience lifecycle viewer segments are CSV-only in the current master-table contract.",
 },
 {
  metricKey: "regularViewers",
  claimedSources: ["api", "csv"],
  verifiedSources: ["csv"],
  disputed: true,
  baselineDecision: "csv_only",
  notes: "Audience lifecycle viewer segments are CSV-only in the current master-table contract.",
 },
 {
  metricKey: "revenue",
  claimedSources: ["api", "csv", "reporting"],
  verifiedSources: ["api", "csv"],
  disputed: true,
  baselineDecision: "max_total",
  notes:
   "Revenue is cumulative in the master-table lifetime view, so the merge rule prefers the higher valid total while preserving provenance.",
 },
]

const metricValue = (cell: MetricCell | undefined): number | null => {
 if (!cell || cell.status === "unavailable") return null
 return typeof cell.value === "number" && Number.isFinite(cell.value)
  ? cell.value
  : null
}

const metricTimestamp = (cell: MetricCell | undefined): number | null => {
 if (!cell || cell.status === "unavailable") return null
 const candidateTimestamps = [
  cell.finalizedAt,
  cell.derivedAt,
  cell.fetchedAt,
  cell.importedAt,
 ].filter((value): value is number => typeof value === "number" && Number.isFinite(value))
 if (candidateTimestamps.length === 0) return null
 return Math.max(...candidateTimestamps)
}

const metricPriority = (cell: MetricCell): number => {
 if (cell.status === "actual") return 3
 if (cell.status === "derived") return 2
 return 1
}

const choosePreferredAvailableCell = (
 preferredSource: MetricSource,
 existing: MetricCell,
 incoming: MetricCell,
): MetricCell | null => {
 const preferredExisting =
  existing.source === preferredSource && existing.status !== "unavailable"
   ? existing
   : null
 const preferredIncoming =
  incoming.source === preferredSource && incoming.status !== "unavailable"
   ? incoming
   : null
 if (preferredExisting) return preferredExisting
 if (preferredIncoming) return preferredIncoming
 return null
}

const chooseFallbackAvailableCell = (
 existing: MetricCell,
 incoming: MetricCell,
): MetricCell => {
 const existingPriority = metricPriority(existing)
 const incomingPriority = metricPriority(incoming)
 if (incomingPriority > existingPriority) return incoming
 if (incomingPriority < existingPriority) return existing

 const existingValue = metricValue(existing)
 const incomingValue = metricValue(incoming)
 if (existingValue === null && incomingValue !== null) return incoming
 if (incomingValue === null) return existing
 if (existingValue === 0 && incomingValue !== 0) return incoming
 if (incoming.source === "api" && existing.source !== "api") return incoming
 return existing
}

const chooseMostRecentAvailableCell = (
 existing: MetricCell,
 incoming: MetricCell,
): MetricCell => {
 const existingTimestamp = metricTimestamp(existing)
 const incomingTimestamp = metricTimestamp(incoming)
 if (existingTimestamp === null && incomingTimestamp === null) {
  return chooseFallbackAvailableCell(existing, incoming)
 }
 if (existingTimestamp === null) return incoming
 if (incomingTimestamp === null) return existing
 if (incomingTimestamp > existingTimestamp) return incoming
 if (existingTimestamp > incomingTimestamp) return existing
 return chooseFallbackAvailableCell(existing, incoming)
}

const chooseMostRecentMatchingCell = (
 matches: (cell: MetricCell) => boolean,
 existing: MetricCell,
 incoming: MetricCell,
): MetricCell | null => {
 const preferredExisting =
  matches(existing) && existing.status !== "unavailable" ? existing : null
 const preferredIncoming =
  matches(incoming) && incoming.status !== "unavailable" ? incoming : null
 if (preferredExisting && preferredIncoming) {
  return chooseMostRecentAvailableCell(preferredExisting, preferredIncoming)
 }
 if (preferredExisting) return preferredExisting
 if (preferredIncoming) return preferredIncoming
 return null
}

export const getMasterMetricContract = (
 metricKey: CanonicalMetricKey,
): MasterMetricContract => MASTER_METRIC_CONTRACTS[metricKey]

export const getMasterMetricAuditResult = (
 metricKey: CanonicalMetricKey,
): MasterMetricAuditResult | undefined =>
 MASTER_METRIC_AUDIT_RESULTS.find((entry) => entry.metricKey === metricKey)

export const isMasterMetricCsvOnly = (metricKey: CanonicalMetricKey): boolean =>
 getMasterMetricContract(metricKey).sourcePolicy === "csv_only"

export const isMasterMetricApiApproved = (
 metricKey: CanonicalMetricKey,
): boolean => !isMasterMetricCsvOnly(metricKey)

export const buildMasterMetricUnavailableCell = (
 metricKey: CanonicalMetricKey,
 source: MetricSource,
): MetricCell => {
 const contract = getMasterMetricContract(metricKey)
 const reasonCode =
  contract.sourcePolicy === "csv_only"
   ? "csv_only_metric_requires_import"
   : contract.sourcePolicy === "derived_only"
     ? "derived_metric_requires_formula_inputs"
     : "master_metric_unavailable"
 return buildUnavailableMetricCell(source, reasonCode)
}

export const shouldAcceptMasterMetricFromSource = (
 metricKey: CanonicalMetricKey,
 source: MetricSource,
): boolean => {
 const contract = getMasterMetricContract(metricKey)
 if (contract.sourcePolicy === "csv_only") {
  return source === "csv_table" || source === "hybrid"
 }
 if (contract.sourcePolicy === "derived_only") return false
 return true
}

export const mergeMasterMetricCell = (
 metricKey: CanonicalMetricKey,
 existing: MetricCell,
 incoming: MetricCell,
): MetricCell => {
 const contract = getMasterMetricContract(metricKey)
 const existingValue = metricValue(existing)
 const incomingValue = metricValue(incoming)

 switch (contract.mergeRule) {
  case "prefer_csv": {
   const preferred = choosePreferredAvailableCell(
    "csv_table",
    existing,
    incoming,
   )
   if (preferred) return preferred
   if (contract.sourcePolicy === "csv_only") {
    return buildMasterMetricUnavailableCell(metricKey, "csv_table")
   }
   return chooseFallbackAvailableCell(existing, incoming)
  }
  case "prefer_api": {
   const preferred = choosePreferredAvailableCell("api", existing, incoming)
   if (preferred) return preferred
   return chooseFallbackAvailableCell(existing, incoming)
  }
 case "prefer_max_value": {
  if (existingValue === null && incomingValue === null) {
   return chooseFallbackAvailableCell(existing, incoming)
  }
  if (existingValue === null) return incoming
   if (incomingValue === null) return existing
  if (incomingValue > existingValue) return incoming
  if (existingValue > incomingValue) return existing
  return chooseFallbackAvailableCell(existing, incoming)
 }
  case "prefer_recent":
   if (contract.sourcePolicy === "csv_only") {
    const preferred = chooseMostRecentMatchingCell(
     (cell) => cell.source === "csv_table" || cell.source === "hybrid",
     existing,
     incoming,
    )
    if (preferred) return preferred
    return buildMasterMetricUnavailableCell(metricKey, "csv_table")
   }
   if (contract.sourcePolicy === "derived_only") {
    const preferred = chooseMostRecentMatchingCell(
     (cell) => cell.status === "derived",
     existing,
     incoming,
    )
    if (preferred) return preferred
    return buildMasterMetricUnavailableCell(metricKey, "api")
   }
   return chooseMostRecentAvailableCell(existing, incoming)
  case "prefer_derived": {
   if (existing.status === "derived" && existing.status !== "unavailable") {
    return existing
   }
   if (incoming.status === "derived" && incoming.status !== "unavailable") {
    return incoming
   }
   return chooseFallbackAvailableCell(existing, incoming)
  }
  case "prefer_identity":
  default:
   return chooseFallbackAvailableCell(existing, incoming)
 }
}
