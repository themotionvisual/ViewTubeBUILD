// --- BEGIN metricAliasResolver.ts ---
import {
 METRIC_REGISTRY,
 canonicalMetricOrder,
 canonicalizeMetricKey,
 type CanonicalMetricKey,
 type MetricCell,
 getWindowCapabilityReason,
 readYouTubeAnalyticsCache,
 readGA4AnalyticsCache,
 type CanonicalVideoRow,
} from "./DataStore"
import type { MetricAccuracyClass } from "../productArchitecture"
import type { CsvMajorFamily, AnalyticsDatasetFamilyRegistryRow, AnalyticsDatasetSourcePolicy, CsvSubtableId } from "../../types"
import { CSV_MAJOR_FAMILY_STYLES, CSV_FAMILY_DEFINITIONS } from "../csvTaxonomy"
import { ANALYTICS_SYNC_REGISTRY } from "./SyncPipeline"

export type MetricConfidence = "raw_direct" | "derived_exact" | "unavailable"

const toNumber = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return null
 const cleaned = value.replace(/,/g, "").replace(/%/g, "").trim()
 if (!cleaned) return null
 const parsed = Number(cleaned)
 return Number.isFinite(parsed) ? parsed : null
}

const firstNumber = (row: Record<string, unknown>, keys: string[]): number | null => {
 for (const key of keys) {
  const value = toNumber(row[key])
  if (value !== null) return value
 }
 return null
}

export const getViewsRaw = (row: Record<string, unknown>): number | null =>
 firstNumber(row, METRIC_REGISTRY.views.aliases)

export const getImpressionsRaw = (row: Record<string, unknown>): number | null =>
 firstNumber(row, METRIC_REGISTRY.impressions.aliases)

export const getCtrRawPercent = (row: Record<string, unknown>): number | null => {
 const raw = firstNumber(row, METRIC_REGISTRY.ctr.aliases)
 if (raw === null) return null
 return raw > 0 && raw <= 1 ? raw * 100 : raw
}

export const getAvpRawPercent = (row: Record<string, unknown>): number | null => {
 const raw = firstNumber(row, METRIC_REGISTRY.avp.aliases)
 if (raw === null) return null
 return raw > 0 && raw <= 1 ? raw * 100 : raw
}

export const resolveCtrPercent = (
 row: Record<string, unknown>,
): { value: number | null; confidence: MetricConfidence } => {
 const rawCtr = getCtrRawPercent(row)
 if (rawCtr !== null && rawCtr > 0) {
  return { value: rawCtr, confidence: "raw_direct" }
 }

 const views = getViewsRaw(row)
 const impressions = getImpressionsRaw(row)
 if (views !== null && views > 0 && impressions !== null && impressions > 0) {
  return { value: (views / impressions) * 100, confidence: "derived_exact" }
 }

 return { value: null, confidence: "unavailable" }
}

export const resolveImpressions = (
 row: Record<string, unknown>,
): { value: number | null; confidence: MetricConfidence } => {
 const raw = getImpressionsRaw(row)
 if (raw !== null && raw > 0) {
  return { value: raw, confidence: "raw_direct" }
 }

 const views = getViewsRaw(row)
 const ctr = getCtrRawPercent(row)
 if (views !== null && views > 0 && ctr !== null && ctr > 0) {
  return { value: views / (ctr / 100), confidence: "derived_exact" }
 }

 return { value: null, confidence: "unavailable" }
}

// --- END metricAliasResolver.ts ---

// --- BEGIN dataCoverageCatalog.ts ---

export interface DataCoverageCatalogEntry {
 categoryName: string
 canonicalKey: string
 source: DataCoverageSource
 scope: DataCoverageScope
 rawName?: string
}

const mapScope = (scope: string): DataCoverageScope => {
 const normalized = scope.toLowerCase().trim()
 if (normalized === "channel") return "channel"
 if (normalized === "video_shared") return "video_shared"
 if (normalized === "short_only") return "short_only"
 if (normalized === "long_only") return "long_only"
 if (normalized === "geo") return "geo"
 if (normalized === "demographic") return "demographic"
 if (normalized === "traffic") return "traffic"
 if (normalized === "device") return "device"
 if (normalized === "retention") return "retention"
 if (normalized === "monetization") return "monetization"
 if (normalized === "daily") return "daily"
 if (normalized === "history") return "history"
 return "video_shared"
}

const mapSource = (source: string): DataCoverageSource => {
 const normalized = source.toLowerCase().trim()
 if (normalized.includes("ga4")) return "ga4"
 if (normalized.includes("history")) return "history_placeholder"
 return "youtube"
}

const BASE_DATA_COVERAGE_CATALOG: DataCoverageCatalogEntry[] = [
 { categoryName: "Ad Impressions", canonicalKey: "adImpressions", source: mapSource("youtube_analytics_api"), scope: mapScope("monetization"), rawName: "adImpressions" },
 { categoryName: "Ad Type", canonicalKey: "adType", source: mapSource("youtube_analytics_api"), scope: mapScope("monetization"), rawName: "adType" },
 { categoryName: "Adjustment Type", canonicalKey: "adjustment_type", source: mapSource("youtube_reporting_api"), scope: mapScope("monetization"), rawName: "adjustment_type" },
 { categoryName: "Age Group", canonicalKey: "ageGroup", source: mapSource("youtube_analytics_api"), scope: mapScope("demographic"), rawName: "ageGroup" },
 { categoryName: "Annotation Click Through Rate", canonicalKey: "annotationClickThroughRate", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "annotationClickThroughRate" },
 { categoryName: "Annotation Clickable Impressions", canonicalKey: "annotationClickableImpressions", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "annotationClickableImpressions" },
 { categoryName: "Annotation Clicks", canonicalKey: "annotationClicks", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "annotationClicks" },
 { categoryName: "Annotation Closable Impressions", canonicalKey: "annotationClosableImpressions", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "annotationClosableImpressions" },
 { categoryName: "Annotation Close Rate", canonicalKey: "annotationCloseRate", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "annotationCloseRate" },
 { categoryName: "Annotation Closes", canonicalKey: "annotationCloses", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "annotationCloses" },
 { categoryName: "Annotation Impressions", canonicalKey: "annotationImpressions", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "annotationImpressions" },
 { categoryName: "Asset ID", canonicalKey: "asset_id", source: mapSource("youtube_reporting_api"), scope: mapScope("monetization"), rawName: "asset_id" },
 { categoryName: "Asset Policy Block Territories", canonicalKey: "asset_policy_block", source: mapSource("youtube_reporting_api"), scope: mapScope("monetization"), rawName: "asset_policy_block" },
 { categoryName: "Asset Policy Monetize Territories", canonicalKey: "asset_policy_monetize", source: mapSource("youtube_reporting_api"), scope: mapScope("monetization"), rawName: "asset_policy_monetize" },
 { categoryName: "Asset Policy Track Territories", canonicalKey: "asset_policy_track", source: mapSource("youtube_reporting_api"), scope: mapScope("monetization"), rawName: "asset_policy_track" },
 { categoryName: "Auction Ad Revenue", canonicalKey: "estimated_partner_ad_auction_revenue", source: mapSource("youtube_reporting_api"), scope: mapScope("monetization"), rawName: "estimated_partner_ad_auction_revenue" },
 { categoryName: "Audience Type", canonicalKey: "audienceType", source: mapSource("youtube_analytics_api"), scope: mapScope("retention"), rawName: "audienceType" },
 { categoryName: "Audience Watch Ratio", canonicalKey: "audienceWatchRatio", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "audienceWatchRatio" },
 { categoryName: "Average Concurrent Viewers", canonicalKey: "averageConcurrentViewers", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "averageConcurrentViewers" },
 { categoryName: "Average Time in Playlist", canonicalKey: "averageTimeInPlaylist", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "averageTimeInPlaylist" },
 { categoryName: "Average View Duration", canonicalKey: "averageViewDuration", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "averageViewDuration" },
 { categoryName: "Average View Percentage", canonicalKey: "averageViewPercentage", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "averageViewPercentage" },
 { categoryName: "Card Click Rate", canonicalKey: "cardClickRate", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "cardClickRate" },
 { categoryName: "Card Clicks", canonicalKey: "cardClicks", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "cardClicks" },
 { categoryName: "Card Impressions", canonicalKey: "cardImpressions", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "cardImpressions" },
 { categoryName: "Card Teaser Click Rate", canonicalKey: "cardTeaserClickRate", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "cardTeaserClickRate" },
 { categoryName: "Card Teaser Clicks", canonicalKey: "cardTeaserClicks", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "cardTeaserClicks" },
 { categoryName: "Card Teaser Impressions", canonicalKey: "cardTeaserImpressions", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "cardTeaserImpressions" },
 { categoryName: "Casual Viewers", canonicalKey: "casualViewers", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "casualViewers" },
 { categoryName: "Channel ID", canonicalKey: "id", source: mapSource("youtube_data_api_v3"), scope: mapScope("channel"), rawName: "id" },
 { categoryName: "Channel Name", canonicalKey: "snippet.title", source: mapSource("youtube_data_api_v3"), scope: mapScope("channel"), rawName: "snippet.title" },
 { categoryName: "Channel Subscription Events", canonicalKey: "youtubeSubscriptionHistory", source: mapSource("personal_history"), scope: mapScope("history"), rawName: "youtubeSubscriptionHistory" },
 { categoryName: "City", canonicalKey: "city", source: mapSource("youtube_analytics_api"), scope: mapScope("geo"), rawName: "city" },
 { categoryName: "Claim ID", canonicalKey: "claim_id", source: mapSource("youtube_reporting_api"), scope: mapScope("monetization"), rawName: "claim_id" },
 { categoryName: "Claim Status", canonicalKey: "claim_status", source: mapSource("youtube_reporting_api"), scope: mapScope("monetization"), rawName: "claim_status" },
 { categoryName: "Claim Type", canonicalKey: "claim_type", source: mapSource("youtube_reporting_api"), scope: mapScope("monetization"), rawName: "claim_type" },
 { categoryName: "Claimed Status", canonicalKey: "claimedStatus", source: mapSource("youtube_analytics_api"), scope: mapScope("monetization"), rawName: "claimedStatus" },
 { categoryName: "Comment Likes and Dislikes History", canonicalKey: "youtubeCommentLikeHistory", source: mapSource("personal_history"), scope: mapScope("history"), rawName: "youtubeCommentLikeHistory" },
 { categoryName: "Comments", canonicalKey: "comments", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "comments" },
 { categoryName: "Comments (Channel)", canonicalKey: "comments", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "comments" },
 { categoryName: "Comments and Replies History", canonicalKey: "youtubeCommentsRepliesHistory", source: mapSource("personal_history"), scope: mapScope("history"), rawName: "youtubeCommentsRepliesHistory" },
 { categoryName: "Community Post Interactions", canonicalKey: "youtubeCommunityPostHistory", source: mapSource("personal_history"), scope: mapScope("history"), rawName: "youtubeCommunityPostHistory" },
 { categoryName: "Continent", canonicalKey: "continent", source: mapSource("youtube_analytics_api"), scope: mapScope("geo"), rawName: "continent" },
 { categoryName: "Country", canonicalKey: "country", source: mapSource("youtube_analytics_api"), scope: mapScope("geo"), rawName: "country" },
 { categoryName: "CPM", canonicalKey: "cpm", source: mapSource("youtube_analytics_api"), scope: mapScope("monetization"), rawName: "cpm" },
 { categoryName: "Creator Content Type", canonicalKey: "creatorContentType", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "creatorContentType" },
 { categoryName: "Device Type", canonicalKey: "deviceType", source: mapSource("youtube_analytics_api"), scope: mapScope("device"), rawName: "deviceType" },
 { categoryName: "Dislikes", canonicalKey: "dislikes", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "dislikes" },
 { categoryName: "Dislikes (Channel)", canonicalKey: "dislikes", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "dislikes" },
 { categoryName: "Elapsed Video Time Ratio", canonicalKey: "elapsedVideoTimeRatio", source: mapSource("youtube_analytics_api"), scope: mapScope("retention"), rawName: "elapsedVideoTimeRatio" },
 { categoryName: "End Screen Click Rate", canonicalKey: "endScreenClickRate", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "endScreenClickRate" },
 { categoryName: "End Screen Element Clicks", canonicalKey: "endScreenElementClicks", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "endScreenElementClicks" },
 { categoryName: "End Screen Element Impressions", canonicalKey: "endScreenElementImpressions", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "endScreenElementImpressions" },
 { categoryName: "Engaged Views", canonicalKey: "engagedViews", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "engagedViews" },
 { categoryName: "Estimated Ad Revenue", canonicalKey: "estimatedAdRevenue", source: mapSource("youtube_analytics_api"), scope: mapScope("monetization"), rawName: "estimatedAdRevenue" },
 { categoryName: "Estimated Premium Revenue", canonicalKey: "estimatedRedPartnerRevenue", source: mapSource("youtube_analytics_api"), scope: mapScope("monetization"), rawName: "estimatedRedPartnerRevenue" },
 { categoryName: "Estimated Revenue", canonicalKey: "estimatedRevenue", source: mapSource("youtube_analytics_api"), scope: mapScope("monetization"), rawName: "estimatedRevenue" },
 { categoryName: "GA4 Age Groups", canonicalKey: "ga4.demographics.ageGroups", source: mapSource("ga4"), scope: mapScope("demographic"), rawName: "ga4.demographics.ageGroups" },
 { categoryName: "GA4 Avg Session Duration", canonicalKey: "ga4.averageSessionDuration", source: mapSource("ga4"), scope: mapScope("channel"), rawName: "ga4.averageSessionDuration" },
 { categoryName: "GA4 Cities", canonicalKey: "ga4.demographics.cities", source: mapSource("ga4"), scope: mapScope("geo"), rawName: "ga4.demographics.cities" },
 { categoryName: "GA4 Conversions", canonicalKey: "ga4.conversions", source: mapSource("ga4"), scope: mapScope("traffic"), rawName: "ga4.conversions" },
 { categoryName: "GA4 Countries", canonicalKey: "ga4.demographics.countries", source: mapSource("ga4"), scope: mapScope("geo"), rawName: "ga4.demographics.countries" },
 { categoryName: "GA4 Engaged Sessions", canonicalKey: "ga4.engagedSessions", source: mapSource("ga4"), scope: mapScope("channel"), rawName: "ga4.engagedSessions" },
 { categoryName: "GA4 Sessions", canonicalKey: "ga4.sessions", source: mapSource("ga4"), scope: mapScope("channel"), rawName: "ga4.sessions" },
 { categoryName: "GA4 Top Pages", canonicalKey: "ga4.topPages", source: mapSource("ga4"), scope: mapScope("traffic"), rawName: "ga4.topPages" },
 { categoryName: "GA4 Traffic Source", canonicalKey: "ga4.trafficSources", source: mapSource("ga4"), scope: mapScope("traffic"), rawName: "ga4.trafficSources" },
 { categoryName: "GA4 Users", canonicalKey: "ga4.users", source: mapSource("ga4"), scope: mapScope("channel"), rawName: "ga4.users" },
 { categoryName: "Gender", canonicalKey: "gender", source: mapSource("youtube_analytics_api"), scope: mapScope("demographic"), rawName: "gender" },
 { categoryName: "Gross Revenue", canonicalKey: "grossRevenue", source: mapSource("youtube_analytics_api"), scope: mapScope("monetization"), rawName: "grossRevenue" },
 { categoryName: "Insight Playback Location Detail", canonicalKey: "insightPlaybackLocationDetail", source: mapSource("youtube_analytics_api"), scope: mapScope("device"), rawName: "insightPlaybackLocationDetail" },
 { categoryName: "Insight Playback Location Type", canonicalKey: "insightPlaybackLocationType", source: mapSource("youtube_analytics_api"), scope: mapScope("device"), rawName: "insightPlaybackLocationType" },
 { categoryName: "Insight Traffic Source Detail", canonicalKey: "insightTrafficSourceDetail", source: mapSource("youtube_analytics_api"), scope: mapScope("traffic"), rawName: "insightTrafficSourceDetail" },
 { categoryName: "Insight Traffic Source Type", canonicalKey: "insightTrafficSourceType", source: mapSource("youtube_analytics_api"), scope: mapScope("traffic"), rawName: "insightTrafficSourceType" },
 { categoryName: "Likes", canonicalKey: "likes", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "likes" },
 { categoryName: "Likes (Channel)", canonicalKey: "likes", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "likes" },
 { categoryName: "Live Chat Messages History", canonicalKey: "youtubeLiveChatHistory", source: mapSource("personal_history"), scope: mapScope("history"), rawName: "youtubeLiveChatHistory" },
 { categoryName: "Live or On Demand", canonicalKey: "liveOrOnDemand", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "liveOrOnDemand" },
 { categoryName: "Membership Cancellation Survey Responses", canonicalKey: "membershipsCancellationSurveyResponses", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "membershipsCancellationSurveyResponses" },
 { categoryName: "Monetized Playbacks", canonicalKey: "monetizedPlaybacks", source: mapSource("youtube_analytics_api"), scope: mapScope("monetization"), rawName: "monetizedPlaybacks" },
 { categoryName: "New Viewers", canonicalKey: "newViewers", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "newViewers" },
 { categoryName: "Operating System", canonicalKey: "operatingSystem", source: mapSource("youtube_analytics_api"), scope: mapScope("device"), rawName: "operatingSystem" },
 { categoryName: "Partner Revenue", canonicalKey: "partner_revenue", source: mapSource("youtube_reporting_api"), scope: mapScope("monetization"), rawName: "partner_revenue" },
 { categoryName: "Peak Concurrent Viewers", canonicalKey: "peakConcurrentViewers", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "peakConcurrentViewers" },
 { categoryName: "Playback Based CPM", canonicalKey: "playbackBasedCpm", source: mapSource("youtube_analytics_api"), scope: mapScope("monetization"), rawName: "playbackBasedCpm" },
 { categoryName: "Playback Location Detail", canonicalKey: "playbackLocationDetail", source: mapSource("youtube_analytics_api"), scope: mapScope("device"), rawName: "playbackLocationDetail" },
 { categoryName: "Playback Location Type", canonicalKey: "playbackLocationType", source: mapSource("youtube_analytics_api"), scope: mapScope("device"), rawName: "playbackLocationType" },
 { categoryName: "Playlist Average View Duration", canonicalKey: "playlistAverageViewDuration", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "playlistAverageViewDuration" },
 { categoryName: "Playlist Dimension", canonicalKey: "playlist", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "playlist" },
 { categoryName: "Playlist Estimated Minutes Watched", canonicalKey: "playlistEstimatedMinutesWatched", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "playlistEstimatedMinutesWatched" },
 { categoryName: "Playlist Saves Added", canonicalKey: "playlistSavesAdded", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "playlistSaves" },
 { categoryName: "Playlist Saves Removed", canonicalKey: "playlistSavesRemoved", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "playlistSaves" },
 { categoryName: "Playlist Starts", canonicalKey: "playlistStarts", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "playlistStarts" },
 { categoryName: "Playlist Views", canonicalKey: "playlistViews", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "playlistViews" },
 { categoryName: "Playlist Voting Activity", canonicalKey: "youtubePlaylistVotingHistory", source: mapSource("personal_history"), scope: mapScope("history"), rawName: "youtubePlaylistVotingHistory" },
 { categoryName: "Profile Picture URL", canonicalKey: "snippet.thumbnails.default.url", source: mapSource("youtube_data_api_v3"), scope: mapScope("channel"), rawName: "snippet.thumbnails.default.url" },
 { categoryName: "Province", canonicalKey: "province", source: mapSource("youtube_analytics_api"), scope: mapScope("geo"), rawName: "province" },
 { categoryName: "Purchase Activity", canonicalKey: "youtubePurchaseHistory", source: mapSource("personal_history"), scope: mapScope("history"), rawName: "youtubePurchaseHistory" },
 { categoryName: "Regular Viewers", canonicalKey: "regularViewers", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "regularViewers" },
 { categoryName: "Relative Retention Performance", canonicalKey: "relativeRetentionPerformance", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "relativeRetentionPerformance" },
 { categoryName: "Remixes of Your Content", canonicalKey: "shortsRemixCount", source: mapSource("youtube_analytics_api"), scope: mapScope("short_only"), rawName: "shortsRemixCount" },
 { categoryName: "Reserved Ad Revenue", canonicalKey: "estimated_partner_ad_reserved_revenue", source: mapSource("youtube_reporting_api"), scope: mapScope("monetization"), rawName: "estimated_partner_ad_reserved_revenue" },
 { categoryName: "Returning Viewers", canonicalKey: "returningViewers", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "returningViewers" },
 { categoryName: "RPM", canonicalKey: "rpm", source: mapSource("youtube_analytics_api"), scope: mapScope("monetization"), rawName: "rpm" },
 { categoryName: "Shares", canonicalKey: "shares", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "shares" },
 { categoryName: "Shares (Channel)", canonicalKey: "shares", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "shares" },
 { categoryName: "Sharing Activity History", canonicalKey: "youtubeSharingHistory", source: mapSource("personal_history"), scope: mapScope("history"), rawName: "youtubeSharingHistory" },
 { categoryName: "Sharing Service", canonicalKey: "sharingService", source: mapSource("youtube_analytics_api"), scope: mapScope("traffic"), rawName: "sharingService" },
 { categoryName: "Shorts Funnel Percent Watched", canonicalKey: "shortsPercentWatched", source: mapSource("youtube_analytics_api"), scope: mapScope("short_only"), rawName: "shortsPercentWatched" },
 { categoryName: "Shorts Funnel Swipe Away Rate", canonicalKey: "shortsSwipeAwayRate", source: mapSource("youtube_analytics_api"), scope: mapScope("short_only"), rawName: "shortsSwipeAwayRate" },
 { categoryName: "Stayed To Watch Percent", canonicalKey: "stayedToWatch", source: mapSource("youtube_analytics_api"), scope: mapScope("short_only"), rawName: "stayedToWatch" },
 { categoryName: "Sub Continent", canonicalKey: "subContinent", source: mapSource("youtube_analytics_api"), scope: mapScope("geo"), rawName: "subContinent" },
 { categoryName: "Subscribed Status", canonicalKey: "subscribedStatus", source: mapSource("youtube_analytics_api"), scope: mapScope("demographic"), rawName: "subscribedStatus" },
 { categoryName: "Subscriber Count", canonicalKey: "statistics.subscriberCount", source: mapSource("youtube_data_api_v3"), scope: mapScope("channel"), rawName: "statistics.subscriberCount" },
 { categoryName: "Subscribers Gained", canonicalKey: "subscribersGained", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "subscribersGained" },
 { categoryName: "Subscribers Gained (Channel)", canonicalKey: "subscribersGained", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "subscribersGained" },
 { categoryName: "Subscribers Lost", canonicalKey: "subscribersLost", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "subscribersLost" },
 { categoryName: "Subscribers Lost (Channel)", canonicalKey: "subscribersLost", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "subscribersLost" },
 { categoryName: "Total Videos", canonicalKey: "statistics.videoCount", source: mapSource("youtube_data_api_v3"), scope: mapScope("channel"), rawName: "statistics.videoCount" },
 { categoryName: "Total Views", canonicalKey: "statistics.viewCount", source: mapSource("youtube_data_api_v3"), scope: mapScope("channel"), rawName: "statistics.viewCount" },
 { categoryName: "Traffic Source Detail", canonicalKey: "trafficSourceDetail", source: mapSource("youtube_analytics_api"), scope: mapScope("traffic"), rawName: "trafficSourceDetail" },
 { categoryName: "Traffic Source Type", canonicalKey: "trafficSourceType", source: mapSource("youtube_analytics_api"), scope: mapScope("traffic"), rawName: "trafficSourceType" },
 { categoryName: "Traffic: End Screen", canonicalKey: "trafficSourceType.END_SCREEN", source: mapSource("youtube_analytics_api"), scope: mapScope("long_only"), rawName: "END_SCREEN" },
 { categoryName: "Traffic: Shorts Feed", canonicalKey: "trafficSourceType.SHORTS", source: mapSource("youtube_analytics_api"), scope: mapScope("short_only"), rawName: "SHORTS" },
 { categoryName: "Transaction Revenue", canonicalKey: "estimated_partner_transaction_revenue", source: mapSource("youtube_reporting_api"), scope: mapScope("monetization"), rawName: "estimated_partner_transaction_revenue" },
 { categoryName: "Unique Viewers", canonicalKey: "uniqueViewers", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "uniqueViewers" },
 { categoryName: "Uploader Type", canonicalKey: "uploaderType", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "uploaderType" },
 { categoryName: "Uploads Playlist ID", canonicalKey: "contentDetails.relatedPlaylists.uploads", source: mapSource("youtube_data_api_v3"), scope: mapScope("channel"), rawName: "contentDetails.relatedPlaylists.uploads" },
 { categoryName: "User Feedback Not Interested", canonicalKey: "youtubeFeedbackNotInterestedHistory", source: mapSource("personal_history"), scope: mapScope("history"), rawName: "youtubeFeedbackNotInterestedHistory" },
 { categoryName: "Video Likes and Dislikes History", canonicalKey: "youtubeLikeDislikeHistory", source: mapSource("personal_history"), scope: mapScope("history"), rawName: "youtubeLikeDislikeHistory" },
 { categoryName: "Video Thumbnail CTR", canonicalKey: "videoThumbnailImpressionsClickRate", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "videoThumbnailImpressionsClickRate" },
 { categoryName: "Video Thumbnail Impressions", canonicalKey: "videoThumbnailImpressions", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "videoThumbnailImpressions" },
 { categoryName: "Videos Added To Playlists", canonicalKey: "videosAddedToPlaylists", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "videosAddedToPlaylists" },
 { categoryName: "Videos Removed From Playlists", canonicalKey: "videosRemovedFromPlaylists", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "videosRemovedFromPlaylists" },
 { categoryName: "Viewer Percentage", canonicalKey: "viewerPercentage", source: mapSource("youtube_analytics_api"), scope: mapScope("demographic"), rawName: "viewerPercentage" },
 { categoryName: "Views", canonicalKey: "views", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "views" },
 { categoryName: "Views (Channel)", canonicalKey: "views", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "views" },
 { categoryName: "Views Per Playlist Start", canonicalKey: "viewsPerPlaylistStart", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "viewsPerPlaylistStart" },
 { categoryName: "Watch Time Minutes", canonicalKey: "estimatedMinutesWatched", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "estimatedMinutesWatched" },
 { categoryName: "Watch Time Minutes (Channel)", canonicalKey: "estimatedMinutesWatched", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "estimatedMinutesWatched" },
 { categoryName: "Estimated Revenue (Channel)", canonicalKey: "estimatedRevenue", source: mapSource("youtube_analytics_api"), scope: mapScope("channel"), rawName: "estimatedRevenue" },
 { categoryName: "YouTube Product", canonicalKey: "youtubeProduct", source: mapSource("youtube_analytics_api"), scope: mapScope("traffic"), rawName: "youtubeProduct" },
 { categoryName: "YouTube Revenue Split", canonicalKey: "youtube_revenue_split", source: mapSource("youtube_reporting_api"), scope: mapScope("monetization"), rawName: "youtube_revenue_split" },
 { categoryName: "YouTube Search History", canonicalKey: "youtubeSearchHistory", source: mapSource("personal_history"), scope: mapScope("history"), rawName: "youtubeSearchHistory" },
 { categoryName: "YouTube Watch History", canonicalKey: "youtubeWatchHistory", source: mapSource("personal_history"), scope: mapScope("history"), rawName: "youtubeWatchHistory" },
]

const FORMULA_DERIVED_CATALOG: DataCoverageCatalogEntry[] = [
 { categoryName: "Formula: Watch Hours", canonicalKey: "watch_hours", source: "formula", scope: "video_shared", rawName: "watch_hours" },
 { categoryName: "Formula: Engagement Rate", canonicalKey: "engagement_rate", source: "formula", scope: "video_shared", rawName: "engagement_rate" },
 { categoryName: "Formula: RPM", canonicalKey: "rpm_formula", source: "formula", scope: "video_shared", rawName: "rpm_formula" },
 { categoryName: "Formula: Subscriber Conversion", canonicalKey: "subscriber_conversion", source: "formula", scope: "video_shared", rawName: "subscriber_conversion" },
 { categoryName: "Formula: CTR Percent", canonicalKey: "ctr_percent_formula", source: "formula", scope: "video_shared", rawName: "ctr_percent_formula" },
 { categoryName: "Formula: Impressions (Derived)", canonicalKey: "impressions_formula", source: "formula", scope: "video_shared", rawName: "impressions_formula" },
 { categoryName: "Formula: Attention / Impression", canonicalKey: "attention_minutes_per_impression", source: "formula", scope: "video_shared", rawName: "attention_minutes_per_impression" },
 { categoryName: "Formula: Like Rate / 1k Views", canonicalKey: "like_rate_per_1k_views", source: "formula", scope: "video_shared", rawName: "like_rate_per_1k_views" },
 { categoryName: "Formula: Comment Rate / 1k Views", canonicalKey: "comment_rate_per_1k_views", source: "formula", scope: "video_shared", rawName: "comment_rate_per_1k_views" },
 { categoryName: "Formula: Share Rate / 1k Views", canonicalKey: "share_rate_per_1k_views", source: "formula", scope: "video_shared", rawName: "share_rate_per_1k_views" },
 { categoryName: "Formula: Watch Time / Video Minute", canonicalKey: "watch_time_per_video_minute", source: "formula", scope: "video_shared", rawName: "watch_time_per_video_minute" },
 { categoryName: "Formula: AVD Lift vs Channel Median", canonicalKey: "relative_lift_vs_channel_median_avd", source: "formula", scope: "channel", rawName: "relative_lift_vs_channel_median_avd" },
 { categoryName: "Formula: APV Lift vs Channel Median", canonicalKey: "relative_lift_vs_channel_median_apv", source: "formula", scope: "channel", rawName: "relative_lift_vs_channel_median_apv" },
 { categoryName: "Formula: CTR Lift vs Channel Median", canonicalKey: "relative_lift_vs_channel_median_ctr", source: "formula", scope: "channel", rawName: "relative_lift_vs_channel_median_ctr" },
 { categoryName: "Formula: RPM Lift vs Channel Median", canonicalKey: "relative_lift_vs_channel_median_rpm", source: "formula", scope: "channel", rawName: "relative_lift_vs_channel_median_rpm" },
 { categoryName: "Formula: Impression CTR", canonicalKey: "ctr", source: "formula", scope: "video_shared", rawName: "impression_ctr_derived" },
 { categoryName: "Formula: Retention Quality Index", canonicalKey: "retentionQualityIndex", source: "formula", scope: "video_shared", rawName: "retention_quality_index" },
 { categoryName: "Formula: Monetization Efficiency", canonicalKey: "monetizationEfficiency", source: "formula", scope: "monetization", rawName: "monetization_efficiency" },
 { categoryName: "Formula: Audience Loyalty Score", canonicalKey: "audienceLoyaltyScore", source: "formula", scope: "channel", rawName: "audience_loyalty_score" },
 { categoryName: "Formula: Shorts Viral Threshold", canonicalKey: "shortsViralThreshold", source: "formula", scope: "short_only", rawName: "shorts_viral_threshold" },
 { categoryName: "Formula: Audience Quality Score", canonicalKey: "audienceQualityScore", source: "formula", scope: "channel", rawName: "audience_quality_score" },
]

export const DATA_COVERAGE_CATALOG: DataCoverageCatalogEntry[] = [
 ...BASE_DATA_COVERAGE_CATALOG,
 ...FORMULA_DERIVED_CATALOG,
]

// --- END dataCoverageCatalog.ts ---

// --- BEGIN dataCoverageInventory.ts ---


export type DataCoverageSource =
 | "youtube"
 | "ga4"
 | "history_placeholder"
 | "formula"
export type DataCoverageScope =
 | "channel"
 | "video_shared"
 | "short_only"
 | "long_only"
 | "geo"
 | "demographic"
 | "traffic"
 | "device"
 | "retention"
 | "monetization"
 | "daily"
 | "history"

export type DataCoverageStatus =
 | "received"
 | "missing"
 | "not_applicable"
 | "not_connected"

export interface DataCoverageRow {
 categoryName: string
 canonicalKey: string
 source: DataCoverageSource
 scope: DataCoverageScope
 status: DataCoverageStatus
 example: string
 exampleChannel: string
 reason: string
 formulaCapable: boolean
}

export interface DataCoverageSummary {
 totalCategories: number
 perScope: Record<DataCoverageScope, number>
 historyNotConnected: number
 receivedCount: number
 connectedSourcesTotal: number
 fullCatalogTotal: number
}

export interface DataCoverageInventory {
 expandedRows: DataCoverageRow[]
 rows: DataCoverageRow[]
 summary: DataCoverageSummary
}

const HISTORY_PLACEHOLDER_CATEGORIES = [
 "googleSearchHistory",
 "youtubeWatchHistory",
 "youtubeSearchHistory",
 "googleDiscoverHistory",
]

const emptyScopeCounts = (): Record<DataCoverageScope, number> => ({
 channel: 0,
 video_shared: 0,
 short_only: 0,
 long_only: 0,
 geo: 0,
 demographic: 0,
 traffic: 0,
 device: 0,
 retention: 0,
 monetization: 0,
 daily: 0,
 history: 0,
})

const safeParse = <T>(raw: string | null, fallback: T): T => {
 if (!raw) return fallback
 try {
  return JSON.parse(raw) as T
 } catch {
  return fallback
 }
}

const isScalar = (value: unknown): boolean =>
 value === null ||
 value === undefined ||
 typeof value === "string" ||
 typeof value === "number" ||
 typeof value === "boolean"

const toDisplay = (value: unknown): string => {
 if (value === null || value === undefined) return "-"
 if (typeof value === "object") return "[Object]"
 const str = String(value).trim()
 return str ? str : "-"
}

const asNumber = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return null
 const cleaned = value.replace(/,/g, "").replace(/%/g, "").trim()
 if (!cleaned) return null
 const parsed = Number(cleaned)
 return Number.isFinite(parsed) ? parsed : null
}

const asDurationSeconds = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return null
 const trimmed = value.trim()
 if (!trimmed) return null
 if (/^\d+:\d{1,2}(?::\d{1,2})?$/.test(trimmed)) {
  const parts = trimmed.split(":").map((part) => Number(part))
  if (parts.some((p) => !Number.isFinite(p))) return null
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
 }
 return asNumber(trimmed)
}

const firstNumeric = (
 row: Record<string, unknown>,
 keys: string[],
): number | null => {
 for (const key of keys) {
  const value = asNumber(row[key])
  if (value !== null) return value
 }
 return null
}

const firstDurationSeconds = (
 row: Record<string, unknown>,
 keys: string[],
): number | null => {
 for (const key of keys) {
  const value = asDurationSeconds(row[key])
  if (value !== null) return value
 }
 return null
}

const toPercent = (value: number | null): number | null => {
 if (value === null) return null
 return value <= 1 ? value * 100 : value
}

const median = (values: number[]): number | null => {
 const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
 if (sorted.length === 0) return null
 const mid = Math.floor(sorted.length / 2)
 if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2
 return sorted[mid]
}

const parseReportRows = (report: unknown): Record<string, unknown>[] => {
 if (!report || typeof report !== "object") return []
 const payload = report as {
  rows?: unknown[]
  columnHeaders?: Array<{ name?: string }>
 }
 if (!Array.isArray(payload.rows)) return []
 if (!Array.isArray(payload.columnHeaders)) {
  return payload.rows.filter(
   (row: unknown): row is Record<string, unknown> =>
    !!row && typeof row === "object" && !Array.isArray(row),
  )
 }
 const headers: string[] = payload.columnHeaders.map((h: { name?: string }) =>
  String(h?.name || ""),
 )
 return payload.rows
  .map((row: unknown) => {
   if (!Array.isArray(row)) {
    if (row && typeof row === "object") return row as Record<string, unknown>
    return null
   }
   const rowValues = row as unknown[]
   const obj: Record<string, unknown> = {}
   headers.forEach((header: string, idx: number) => {
    if (header) obj[header] = rowValues[idx]
   })
   return obj
  })
  .filter(
   (row: Record<string, unknown> | null): row is Record<string, unknown> =>
    !!row,
  )
}

const buildAliasMap = (): Map<string, string> => {
 const map = new Map<string, string>()
 Object.values(METRIC_REGISTRY).forEach((def) => {
  map.set(canonicalizeMetricKey(def.key), def.key)
  map.set(canonicalizeMetricKey(def.label), def.key)
  def.aliases.forEach((alias) => {
   map.set(canonicalizeMetricKey(alias), def.key)
  })
 })
 return map
}

const CANONICAL_SCOPE_OVERRIDES: Partial<Record<string, DataCoverageScope>> = {
 stw: "short_only",
 cardClickRate: "long_only",
 endScreenClickRate: "long_only",
}

const resolveScopeFromPresence = (
 canonicalKey: string,
 inShort: boolean,
 inLong: boolean,
): DataCoverageScope => {
 const forced = CANONICAL_SCOPE_OVERRIDES[canonicalKey]
 if (forced) return forced
 if (inShort && inLong) return "video_shared"
 if (inShort) return "short_only"
 if (inLong) return "long_only"
 return "video_shared"
}

const extractObjectKeys = (
 obj: Record<string, unknown> | null | undefined,
): string[] => {
 if (!obj) return []
 return Object.keys(obj).filter(
  (key) => key && key !== "_originalData" && !key.startsWith("__"),
 )
}

const normalizeKey = (
 rawKey: string,
 aliasMap: Map<string, string>,
 fallbackMap: Map<string, string>,
): string => {
 const normalized = canonicalizeMetricKey(rawKey)
 return fallbackMap.get(normalized) || aliasMap.get(normalized) || rawKey
}

const resolveValueFromRows = (
 rows: Array<Record<string, unknown>>,
 keyCandidates: string[],
): string => {
 for (const row of rows) {
  const originalData =
   row._originalData && typeof row._originalData === "object"
    ? (row._originalData as Record<string, unknown>)
    : {}
  const merged = { ...row, ...originalData } as Record<string, unknown>
  const keys = Object.keys(merged)

  for (const candidate of keyCandidates) {
   // Try exact match first
   if (merged[candidate] !== undefined) {
    const display = toDisplay(merged[candidate])
    if (display !== "-") return display
   }

   // Try case-insensitive match
   const lowerCandidate = candidate.toLowerCase()
   const match = keys.find((k) => k.toLowerCase() === lowerCandidate)
   if (match) {
    const display = toDisplay(merged[match])
    if (display !== "-") return display
   }
  }
 }
 return "-"
}

const resolveValueFromObjects = (
 objects: Array<Record<string, unknown>>,
 keyCandidates: string[],
): string => {
 for (const obj of objects) {
  const keys = Object.keys(obj)
  for (const candidate of keyCandidates) {
   // Try exact match first
   if (obj[candidate] !== undefined) {
    const display = toDisplay(obj[candidate])
    if (display !== "-") return display
   }

   // Try case-insensitive match
   const lowerCandidate = candidate.toLowerCase()
   const match = keys.find((k) => k.toLowerCase() === lowerCandidate)
   if (match) {
    const display = toDisplay(obj[match])
    if (display !== "-") return display
   }
  }
 }
 return "-"
}

type KeyShape = {
 rawNames: Set<string>
 canonicalKey: string
 source: DataCoverageSource
 scope: DataCoverageScope
}

const upsertShape = (
 map: Map<string, KeyShape>,
 canonicalKey: string,
 rawName: string,
 source: DataCoverageSource,
 scope: DataCoverageScope,
) => {
 const key = `${source}::${scope}::${canonicalKey}`
 const existing = map.get(key)
 if (existing) {
  existing.rawNames.add(rawName)
  return
 }
 map.set(key, {
  rawNames: new Set([rawName]),
  canonicalKey,
  source,
  scope,
 })
}

const extractScalarKeysFromRows = (
 rows: Array<Record<string, unknown>>,
): Set<string> => {
 const keys = new Set<string>()
 rows.forEach((row) => {
  const originalData =
   row._originalData && typeof row._originalData === "object"
    ? (row._originalData as Record<string, unknown>)
    : {}
  const merged = { ...row, ...originalData } as Record<string, unknown>
  Object.entries(merged).forEach(([key, value]) => {
   if (!key || key.startsWith("__") || key === "_originalData") return
   if (isScalar(value)) keys.add(key)
  })
 })
 return keys
}

const isLikelyShort = (row: Record<string, unknown>): boolean => {
 const candidates = [
  row?.Format,
  row?.format,
  row?.contentType,
  row?.videoType,
  row?.type,
  row?.creatorContentType,
 ].filter((v) => typeof v === "string") as string[]
 return candidates.some((v) => v.toLowerCase().includes("short"))
}

const isLikelyLong = (row: Record<string, unknown>): boolean => {
 const candidates = [
  row?.Format,
  row?.format,
  row?.contentType,
  row?.videoType,
  row?.type,
  row?.creatorContentType,
 ].filter((v) => typeof v === "string") as string[]
 return candidates.some((v) => {
  const low = v.toLowerCase()
  return low.includes("long") || low.includes("video") || low.includes("vod")
 })
}

const rowFormat = (row: Record<string, unknown>): string => {
 const canonical = row.__canonical as { format?: string } | undefined
 const fromCanonical = String(canonical?.format || "").toLowerCase()
 if (fromCanonical) return fromCanonical
 return String(row.Format || row.format || row.contentType || "").toLowerCase()
}

const rowMatchesScope = (
 row: Record<string, unknown>,
 scope: DataCoverageScope,
): boolean => {
 const format = rowFormat(row)
 if (scope === "short_only") return format.includes("short")
 if (scope === "long_only")
  return format.includes("long") || format.includes("video")
 if (scope === "video_shared") return true
 return true
}

const canonicalCellForScope = (
 rows: Array<Record<string, unknown>>,
 metricKey: CanonicalMetricKey,
 scope: DataCoverageScope,
): MetricCell | null => {
 let unavailable: MetricCell | null = null
 for (const row of rows) {
  if (!rowMatchesScope(row, scope)) continue
  const cells = row.__metricCells as Record<string, MetricCell> | undefined
  const cell = cells?.[metricKey]
  if (!cell) continue
  if (cell.status !== "unavailable") return cell
  unavailable = unavailable || cell
 }
 return unavailable
}

export const buildDataCoverageInventory = (
 masterTableRows: Array<Record<string, unknown>>,
): DataCoverageInventory => {
 const aliasMap = buildAliasMap()
 const fallbackMap = new Map<string, string>([
  ["viewerpercentage", "viewerPercentage"],
  ["viewspercentage", "viewerPercentage"],
  ["videothumbnailimpressions", "impressions"],
  ["videothumbnailimpressionsclickrate", "ctr"],
 ])

 const ytCache = readYouTubeAnalyticsCache() as Record<string, unknown>
 const ga4Cache = readGA4AnalyticsCache()

 const shortRows = masterTableRows.filter(
  (r) =>
   r?.Format === "Shorts" || r?.Format === "SHORTS" || r?.format === "shorts",
 )
 const longRows = masterTableRows.filter(
  (r) =>
   r?.Format === "Video" ||
   r?.Format === "VIDEO" ||
   r?.Format === "VIDEO_ON_DEMAND" ||
   r?.format === "video",
 )

 const cachedVideoRows = [
  ...(Array.isArray(ytCache.videos) ? ytCache.videos : []),
  ...(Array.isArray(ytCache.stats) ? ytCache.stats : []),
 ]
 const cachedShortRows = cachedVideoRows.filter((row) => isLikelyShort(row))
 const cachedLongRows = cachedVideoRows.filter(
  (row) => isLikelyLong(row) && !isLikelyShort(row),
 )
 const cachedUnscopedVideoRows = cachedVideoRows.filter(
  (row) => !isLikelyShort(row) && !isLikelyLong(row),
 )

 const analyticsByWindowRows: Record<string, unknown>[] = []
 if (
  ytCache.analyticsByWindow &&
  typeof ytCache.analyticsByWindow === "object"
 ) {
  Object.values(ytCache.analyticsByWindow as Record<string, unknown>).forEach(
   (reportObj: any) => {
    const payload = reportObj?.report || reportObj
    analyticsByWindowRows.push(...parseReportRows(payload))
   },
  )
 }

 const shortVideoPool = [...shortRows, ...cachedShortRows]
 const longVideoPool = [...longRows, ...cachedLongRows]
 const sharedVideoPool = [
  ...shortRows,
  ...longRows,
  ...cachedVideoRows,
  ...analyticsByWindowRows,
 ]

 const shapes = new Map<string, KeyShape>()
 const catalogLabelByShapeKey = new Map<string, string>()

 // Full research catalog baseline: every known category should appear even
 // when the current sync payload is partial or unsupported for some metrics.
 DATA_COVERAGE_CATALOG.forEach((entry) => {
  const normalizedCanonicalKey = normalizeKey(
   entry.canonicalKey,
   aliasMap,
   fallbackMap,
  )
  const shapeKey = `${entry.source}::${entry.scope}::${normalizedCanonicalKey}`
  catalogLabelByShapeKey.set(
   shapeKey,
   entry.categoryName || entry.rawName || entry.canonicalKey,
  )
  upsertShape(
   shapes,
   normalizedCanonicalKey,
   entry.rawName || entry.canonicalKey,
   entry.source,
   entry.scope,
  )
 })

 // Channel-level (profile + channel analytics + daily rollups)
 const profile = (ytCache.profile || {}) as Record<string, unknown>
 extractObjectKeys(profile).forEach((raw) => {
  upsertShape(
   shapes,
   normalizeKey(raw, aliasMap, fallbackMap),
   raw,
   "youtube",
   "channel",
  )
 })

 const channelRows = parseReportRows(ytCache.channelAnalytics)
 channelRows.forEach((row) => {
  extractObjectKeys(row).forEach((raw) => {
   upsertShape(
    shapes,
    normalizeKey(raw, aliasMap, fallbackMap),
    raw,
    "youtube",
    "channel",
   )
  })
 })

 const dailyRows = parseReportRows(ytCache.dailyMetrics)
 dailyRows.forEach((row) => {
  extractObjectKeys(row).forEach((raw) => {
   upsertShape(
    shapes,
    normalizeKey(raw, aliasMap, fallbackMap),
    raw,
    "youtube",
    "daily",
   )
  })
 })

 // Ledger-based inventory (The dominant source)
 const ledger = (ytCache.ledger || {}) as Record<string, any>
 const ledgerExampleObjects: Record<string, unknown>[] = []
 Object.values(ledger).forEach((entry) => {
  const payloadRows = parseReportRows(entry.payload)
  ledgerExampleObjects.push(...payloadRows)
  payloadRows.forEach((row) => {
   extractObjectKeys(row).forEach((raw) => {
    const scope: DataCoverageScope =
     entry.context === "channel"
      ? "channel"
      : entry.context === "traffic_source"
        ? "traffic"
        : entry.context === "geography"
          ? "geo"
          : entry.context === "demographics"
            ? "demographic"
            : "video_shared"
    upsertShape(
     shapes,
     normalizeKey(raw, aliasMap, fallbackMap),
     raw,
     entry.source === "ga4" ? "ga4" : "youtube",
     scope,
    )
   })
  })
 })

 const demographicRows = parseReportRows(ytCache.demographics)
 demographicRows.forEach((row) => {
  extractObjectKeys(row).forEach((raw) => {
   const normalized = canonicalizeMetricKey(raw)
   const scope: DataCoverageScope =
    normalized.includes("country") ||
    normalized.includes("city") ||
    normalized.includes("province")
     ? "geo"
     : "demographic"
   upsertShape(
    shapes,
    normalizeKey(raw, aliasMap, fallbackMap),
    raw,
    "youtube",
    scope,
   )
  })
 })
 const trafficRows = parseReportRows(ytCache.trafficSources)
 trafficRows.forEach((row) => {
  extractObjectKeys(row).forEach((raw) => {
   upsertShape(
    shapes,
    normalizeKey(raw, aliasMap, fallbackMap),
    raw,
    "youtube",
    "traffic",
   )
  })
 })

 const geographyRows = parseReportRows(ytCache.geography)
 geographyRows.forEach((row) => {
  extractObjectKeys(row).forEach((raw) => {
   upsertShape(
    shapes,
    normalizeKey(raw, aliasMap, fallbackMap),
    raw,
    "youtube",
    "geo",
   )
  })
 })

 // GA4 inventory
 // Video/shared metrics from master rows with shorts-vs-long applicability
 const shortKeys = extractScalarKeysFromRows(shortVideoPool)
 const longKeys = extractScalarKeysFromRows(longVideoPool)
 const unknownVideoKeys = extractScalarKeysFromRows([
  ...cachedUnscopedVideoRows,
  ...analyticsByWindowRows,
 ])
 const unionVideoKeys = new Set<string>([...shortKeys, ...longKeys])
 unknownVideoKeys.forEach((key) => unionVideoKeys.add(key))
 unionVideoKeys.forEach((raw) => {
  const inShort = shortKeys.has(raw)
  const inLong = longKeys.has(raw)
  const canonicalKey = normalizeKey(raw, aliasMap, fallbackMap)
  const scope = resolveScopeFromPresence(canonicalKey, inShort, inLong)
  upsertShape(shapes, canonicalKey, raw, "youtube", scope)
 })

 // Keep canonical contract keys visible only when they are explicitly observed in
 // payloads, preserving catalog-first truth without injecting hidden baselines.
 Object.values(METRIC_REGISTRY).forEach((def) => {
  const appearsInShort = Array.from(shortKeys).some(
   (raw) => normalizeKey(raw, aliasMap, fallbackMap) === def.key,
  )
  const appearsInLong = Array.from(longKeys).some(
   (raw) => normalizeKey(raw, aliasMap, fallbackMap) === def.key,
  )
  const appearsInUnknown = Array.from(unknownVideoKeys).some(
   (raw) => normalizeKey(raw, aliasMap, fallbackMap) === def.key,
  )
  if (!appearsInShort && !appearsInLong && !appearsInUnknown) return
  const scope = resolveScopeFromPresence(def.key, appearsInShort, appearsInLong)
  upsertShape(shapes, def.key, def.label, "youtube", scope)
 })

 // GA4 inventory
 if (ga4Cache && typeof ga4Cache === "object") {
  const overview = (ga4Cache.overview || {}) as Record<string, unknown>
  extractObjectKeys(overview).forEach((raw) => {
   upsertShape(
    shapes,
    normalizeKey(raw, aliasMap, fallbackMap),
    raw,
    "ga4",
    "channel",
   )
  })
  ;["trafficSources", "topPages", "conversions"].forEach((bucket) => {
   const rows = Array.isArray(ga4Cache[bucket]) ? ga4Cache[bucket] : []
   rows.forEach((row: Record<string, unknown>) => {
    extractObjectKeys(row).forEach((raw) => {
     upsertShape(
      shapes,
      normalizeKey(raw, aliasMap, fallbackMap),
      raw,
      "ga4",
      "traffic",
     )
    })
   })
  })

  const demographics = (ga4Cache.demographics || {}) as Record<string, unknown>
  ;["ageGroups", "countries", "cities"].forEach((bucket) => {
   const rows = Array.isArray(demographics[bucket]) ? demographics[bucket] : []
   rows.forEach((row: Record<string, unknown>) => {
    extractObjectKeys(row).forEach((raw) => {
     const scope: DataCoverageScope =
      bucket === "countries" || bucket === "cities" ? "geo" : "demographic"
     upsertShape(
      shapes,
      normalizeKey(raw, aliasMap, fallbackMap),
      raw,
      "ga4",
      scope,
     )
    })
   })
  })
 }

 // Personal Google history placeholders (plan stub in this pass)
 HISTORY_PLACEHOLDER_CATEGORIES.forEach((key) => {
  upsertShape(shapes, key, key, "history_placeholder", "history")
 })

 const channelExampleObjects: Record<string, unknown>[] = [
  profile,
  ...(channelRows as Record<string, unknown>[]),
  ...(dailyRows as Record<string, unknown>[]),
  ...(demographicRows as Record<string, unknown>[]),
  ...(trafficRows as Record<string, unknown>[]),
  ...(geographyRows as Record<string, unknown>[]),
  ...ledgerExampleObjects,
  ...((ga4Cache.overview && typeof ga4Cache.overview === "object"
   ? [ga4Cache.overview as Record<string, unknown>]
   : []) as Record<string, unknown>[]),
 ]
 const mergedSharedRows = [
  ...sharedVideoPool.map((row) => {
   const originalData =
    row._originalData && typeof row._originalData === "object"
     ? (row._originalData as Record<string, unknown>)
     : {}
   return { ...row, ...originalData } as Record<string, unknown>
  }),
  ...ledgerExampleObjects,
 ]

 const metricKeys = {
  views: ["Views", "views"],
  likes: ["Likes +", "Likes"],
  comments: ["Comments", "comments"],
  shares: ["Shares", "shares"],
  subsGained: ["Subs +", "Subscribers Gained", "subscribersGained"],
  impressions: ["Impressions", "videoThumbnailImpressions"],
  ctr: ["CTR %", "CTR", "videoThumbnailImpressionsClickRate"],
  revenue: ["Revenue", "Estimated Revenue", "estimatedRevenue"],
  watchMinutes: ["Watch Hrs", "Watch Time (Hours)", "estimatedMinutesWatched"],
  avd: ["AVD", "AVD (Average View Duration)", "averageViewDuration"],
  apv: ["AVP %", "AVP (%)", "averageViewPercentage"],
  duration: ["Duration", "videoLengthSeconds"],
  cpm: ["CPM", "CPM (USD)"],
  rpm: ["RPM", "Estimated RPM"],
  engagedViews: ["Engaged", "Engaged Views"],
  redWatchHours: ["Red Hrs", "YouTube Premium Watch Time"],
  endScreenClickRate: ["End Screen %", "End Screen Click Rate"],
  cardClickRate: ["Card %", "Card Click Rate"],
  cardTeaserClickRate: ["Teaser %", "Card Teaser Click Rate"],
 }

 const ctrValues = mergedSharedRows
  .map((row) => toPercent(firstNumeric(row, metricKeys.ctr)))
  .filter((value): value is number => value !== null)
 const avdValues = mergedSharedRows
  .map((row) => firstNumeric(row, metricKeys.avd))
  .filter((value): value is number => value !== null)
 const apvValues = mergedSharedRows
  .map((row) => firstNumeric(row, metricKeys.apv))
  .filter((value): value is number => value !== null)
 const rpmValues = mergedSharedRows
  .map((row) => {
   const views = firstNumeric(row, metricKeys.views)
   const revenue = firstNumeric(row, metricKeys.revenue)
   if (views === null || views <= 0 || revenue === null) return null
   return (revenue / views) * 1000
  })
  .filter((value): value is number => value !== null)

 const medians = {
  avd: median(avdValues),
  apv: median(apvValues),
  ctr: median(ctrValues),
  rpm: median(rpmValues),
 }

 const formatFormulaValue = (value: number, canonicalKey: string): string => {
  if (
   canonicalKey.includes("rpm") ||
   canonicalKey.includes("revenue") ||
   canonicalKey.includes("revenue_split")
  ) {
   return `$${value.toFixed(2)}`
  }
  if (
   canonicalKey.includes("rate") ||
   canonicalKey.includes("percent") ||
   canonicalKey.includes("conversion") ||
   canonicalKey.includes("_lift_")
  ) {
   return `${value.toFixed(2)}%`
  }
  if (canonicalKey.includes("rpm") || canonicalKey.includes("revenue")) {
   return `$${value.toFixed(2)}`
  }
  return value.toFixed(3)
 }

 const computeFormulaValue = (
  row: Record<string, unknown>,
  canonicalKey: string,
 ): number | null => {
  const views = firstNumeric(row, metricKeys.views)
  const likes = firstNumeric(row, metricKeys.likes)
  const comments = firstNumeric(row, metricKeys.comments)
  const shares = firstNumeric(row, metricKeys.shares)
  const subsGained = firstNumeric(row, metricKeys.subsGained)
  const impressionsRaw = firstNumeric(row, metricKeys.impressions)
  const ctrRaw = toPercent(firstNumeric(row, metricKeys.ctr))
  const revenue = firstNumeric(row, metricKeys.revenue)
  const watchMinutes = firstNumeric(row, metricKeys.watchMinutes)
  const avd = firstNumeric(row, metricKeys.avd)
  const apv = firstNumeric(row, metricKeys.apv)
  const durationSeconds = firstDurationSeconds(row, metricKeys.duration)

  const uniqueViewers = firstNumeric(row, [
   "uniqueViewers",
   "Unique Viewers",
   "unique_viewers",
  ])
  const returningViewers = firstNumeric(row, [
   "returningViewers",
   "Returning Viewers",
   "returning_viewers",
  ])
  const cpm = firstNumeric(row, ["cpm", "CPM", "CPM (USD)"])
  const authenticatedViewers = firstNumeric(row, [
   "authenticatedViewers",
   "Authenticated Viewers",
   "authenticated_viewers",
  ]) // Approximation or placeholder if not directly available

  if (canonicalKey === "watch_hours") {
   if (watchMinutes === null) return null
   return watchMinutes / 60
  }
  if (canonicalKey === "engagement_rate") {
   if (views === null || views <= 0) return null
   return (((likes ?? 0) + (comments ?? 0) + (shares ?? 0)) / views) * 100
  }
  if (canonicalKey === "rpm_formula") {
   if (views === null || views <= 0 || revenue === null) return null
   return (revenue / views) * 1000
  }
  if (canonicalKey === "subscriber_conversion") {
   if (views === null || views <= 0 || subsGained === null) return null
   return (subsGained / views) * 100
  }
  if (canonicalKey === "ctr_percent_formula") {
   if (ctrRaw !== null) return ctrRaw
   if (views === null || impressionsRaw === null || impressionsRaw <= 0)
    return null
   return (views / impressionsRaw) * 100
  }
  if (canonicalKey === "impressions_formula") {
   if (impressionsRaw !== null) return impressionsRaw
   if (views === null || ctrRaw === null || ctrRaw <= 0) return null
   return views / (ctrRaw / 100)
  }
  if (canonicalKey === "attention_minutes_per_impression") {
   const impressions =
    impressionsRaw !== null
     ? impressionsRaw
     : views !== null && ctrRaw !== null && ctrRaw > 0
       ? views / (ctrRaw / 100)
       : null
   if (watchMinutes === null || impressions === null || impressions <= 0)
    return null
   return watchMinutes / impressions
  }
  if (canonicalKey === "like_rate_per_1k_views") {
   if (views === null || views <= 0 || likes === null) return null
   return (likes / views) * 1000
  }
  if (canonicalKey === "comment_rate_per_1k_views") {
   if (views === null || views <= 0 || comments === null) return null
   return (comments / views) * 1000
  }
  if (canonicalKey === "share_rate_per_1k_views") {
   if (views === null || views <= 0 || shares === null) return null
   return (shares / views) * 1000
  }
  if (canonicalKey === "watch_time_per_video_minute") {
   if (avd === null || durationSeconds === null || durationSeconds <= 0)
    return null
   return avd / durationSeconds
  }
  if (canonicalKey === "relative_lift_vs_channel_median_avd") {
   if (avd === null || medians.avd === null || medians.avd <= 0) return null
   return ((avd - medians.avd) / medians.avd) * 100
  }
  if (canonicalKey === "relative_lift_vs_channel_median_apv") {
   if (apv === null || medians.apv === null || medians.apv <= 0) return null
   return ((apv - medians.apv) / medians.apv) * 100
  }
  if (canonicalKey === "relative_lift_vs_channel_median_ctr") {
   if (ctrRaw === null || medians.ctr === null || medians.ctr <= 0) return null
   return ((ctrRaw - medians.ctr) / medians.ctr) * 100
  }
  if (canonicalKey === "relative_lift_vs_channel_median_rpm") {
   if (
    views === null ||
    views <= 0 ||
    revenue === null ||
    medians.rpm === null ||
    medians.rpm <= 0
   )
    return null
   const rpm = (revenue / views) * 1000
   return ((rpm - medians.rpm) / medians.rpm) * 100
  }

  // --- NEW FORMULAS ---
  if (canonicalKey === "impression_ctr_derived") {
   const clicks = firstNumeric(row, [
    "clicks",
    "annotationClicks",
    "cardClicks",
   ]) // Approximate clicks if CTR isn't directly available
   if (clicks === null || impressionsRaw === null || impressionsRaw <= 0)
    return null
   return (clicks / impressionsRaw) * 100
  }
  if (canonicalKey === "retention_quality_index") {
   if (apv === null || durationSeconds === null || durationSeconds <= 0)
    return null
   return apv / (durationSeconds / 60)
  }
  if (canonicalKey === "monetization_efficiency") {
   if (
    views === null ||
    views <= 0 ||
    revenue === null ||
    cpm === null ||
    cpm <= 0
   )
    return null
   const rpm = (revenue / views) * 1000
   return (rpm / cpm) * 100
  }
  if (canonicalKey === "audience_loyalty_score") {
   if (
    returningViewers === null ||
    uniqueViewers === null ||
    uniqueViewers <= 0
   )
    return null
   return (returningViewers / uniqueViewers) * 100
  }
  if (canonicalKey === "shorts_viral_threshold") {
   if (ctrRaw === null || apv === null) return null
   return (ctrRaw * apv) / 100
  }
  if (canonicalKey === "audience_quality_score") {
   if (authenticatedViewers === null || views === null || views <= 0)
    return null
   return (authenticatedViewers / views) * 100
  }
  return null
 }

 const resolveFormulaExample = (canonicalKey: string): string => {
  for (const row of mergedSharedRows) {
   const value = computeFormulaValue(row, canonicalKey)
   if (value !== null) return formatFormulaValue(value, canonicalKey)
  }
  return "-"
 }

 const expandedRows: DataCoverageRow[] = Array.from(shapes.values()).map(
  (shape) => {
   const shapeKey = `${shape.source}::${shape.scope}::${shape.canonicalKey}`
   const preferredLabel = catalogLabelByShapeKey.get(shapeKey)
   const keyCandidates = Array.from(shape.rawNames)
   if (!keyCandidates.includes(shape.canonicalKey))
    keyCandidates.unshift(shape.canonicalKey)

   const isHistory =
    shape.scope === "history" || shape.source === "history_placeholder"
   const canonicalMetricKey = canonicalMetricOrder.find(
    (key) => key === shape.canonicalKey,
   ) as CanonicalMetricKey | undefined
   const scopedCanonicalCell = canonicalMetricKey
    ? canonicalCellForScope(masterTableRows, canonicalMetricKey, shape.scope)
    : null

   const example =
    shape.source === "formula"
     ? resolveFormulaExample(shape.canonicalKey)
     : shape.scope === "short_only"
       ? resolveValueFromRows(shortVideoPool, keyCandidates)
       : shape.scope === "long_only"
         ? resolveValueFromRows(longVideoPool, keyCandidates)
         : shape.scope === "video_shared"
           ? (() => {
              const fromShort = resolveValueFromRows(
               shortVideoPool,
               keyCandidates,
              )
              if (fromShort !== "-") return fromShort
              const fromLong = resolveValueFromRows(
               longVideoPool,
               keyCandidates,
              )
              if (fromLong !== "-") return fromLong
              return resolveValueFromRows(sharedVideoPool, keyCandidates)
             })()
           : shape.scope === "history"
             ? "Not Connected"
             : resolveValueFromObjects(channelExampleObjects, keyCandidates)

   const exampleChannel = isHistory
    ? "Not Connected"
    : resolveValueFromObjects(channelExampleObjects, keyCandidates)

   const shortPoolAvailable = shortVideoPool.length > 0
   const longPoolAvailable = longVideoPool.length > 0
   const capabilityReason =
    getWindowCapabilityReason(
     ytCache as any,
     "lifetime",
     keyCandidates[0] || shape.canonicalKey,
    ) ||
    getWindowCapabilityReason(ytCache as any, "lifetime", shape.canonicalKey)
   const status: DataCoverageStatus = isHistory
    ? "not_connected"
    : shape.scope === "short_only" && !shortPoolAvailable
      ? "not_applicable"
      : shape.scope === "long_only" && !longPoolAvailable
        ? "not_applicable"
        : scopedCanonicalCell && scopedCanonicalCell.status !== "unavailable"
          ? "received"
          : example !== "-" || exampleChannel !== "-"
            ? "received"
            : capabilityReason
              ? "missing"
              : "missing"

   const reason =
    status === "not_connected"
     ? "Connector not connected."
     : status === "not_applicable"
       ? shape.scope === "short_only"
         ? "No Shorts rows available in current dataset."
         : "No Long-form rows available in current dataset."
       : status === "received"
         ? scopedCanonicalCell && scopedCanonicalCell.status !== "unavailable"
           ? scopedCanonicalCell.confidence === "raw_direct"
             ? "Value detected from canonical raw metric cell."
             : "Value detected from canonical derived metric cell."
           : example !== "-"
             ? "Value detected in scoped rows."
             : "Value detected at channel/source level."
         : scopedCanonicalCell?.reasonCode
           ? scopedCanonicalCell.reasonCode
           : capabilityReason
             ? capabilityReason
             : shape.source === "formula"
               ? "Formula category tracked but required operands were missing in current rows."
               : shape.source === "ga4"
                 ? "Key tracked but GA4 cache has no value for current window."
                 : "Key tracked but no value found in current rows/cache."

   return {
    categoryName: preferredLabel || keyCandidates[0] || shape.canonicalKey,
    canonicalKey: shape.canonicalKey,
    source: shape.source,
    scope: shape.scope,
    status,
    example,
    exampleChannel,
    reason,
    formulaCapable: shape.source === "formula",
   }
  },
 )

 const statusPriority: Record<DataCoverageStatus, number> = {
  received: 4,
  missing: 3,
  not_applicable: 2,
  not_connected: 1,
 }
 const sourcePriority: Record<DataCoverageSource, number> = {
  formula: 4,
  youtube: 3,
  ga4: 2,
  history_placeholder: 1,
 }

 // Canonical contract truth: one row per canonical key + scope combination.
 // Keep the strongest evidence row when duplicates emerge from mixed buckets/sources.
 const collapsedByCanonical = new Map<string, DataCoverageRow>()
 expandedRows.forEach((row) => {
  const key = `${row.canonicalKey}::${row.scope}`
  const existing = collapsedByCanonical.get(key)
  if (!existing) {
   collapsedByCanonical.set(key, row)
   return
  }

  const existingScore =
   statusPriority[existing.status] * 10 + sourcePriority[existing.source]
  const nextScore = statusPriority[row.status] * 10 + sourcePriority[row.source]
  if (nextScore > existingScore) {
   collapsedByCanonical.set(key, row)
   return
  }

  if (existing.example === "-" && row.example !== "-") {
   collapsedByCanonical.set(key, { ...existing, example: row.example })
  }
 })

 const rows = Array.from(collapsedByCanonical.values())

 // Sort both collections alphabetically by category name to fulfill user preference.
 const sortAlphabetical = (r: DataCoverageRow[]) => {
  r.sort((a, b) =>
   a.categoryName.localeCompare(b.categoryName, undefined, {
    sensitivity: "base",
   }),
  )
 }

 sortAlphabetical(rows)
 sortAlphabetical(expandedRows)

 const perScope = emptyScopeCounts()
 rows.forEach((row) => {
  perScope[row.scope] += 1
 })

 const receivedCount = rows.filter((row) => row.status === "received").length
 const connectedSourcesTotal = rows.filter(
  (row) =>
   row.source === "youtube" ||
   (row.source === "ga4" && ga4Cache && Object.keys(ga4Cache).length > 0) ||
   row.source === "formula",
 ).length
 const fullCatalogTotal = DATA_COVERAGE_CATALOG.length

 const summary: DataCoverageSummary = {
  totalCategories: rows.length,
  perScope,
  historyNotConnected: rows.filter((row) => row.scope === "history").length,
  receivedCount,
  connectedSourcesTotal,
  fullCatalogTotal,
 }

 return { expandedRows, rows, summary }
}

// --- END dataCoverageInventory.ts ---

// --- BEGIN formulaRegistry.ts ---


export interface FormulaSpec {
 id: string
 label: string
 outputCanonicalKey: string
 inputs: string[]
 unit: string
 description: string
 expectedScope:
  | "channel"
  | "video_shared"
  | "short_only"
  | "long_only"
  | "geo"
  | "demographic"
  | "traffic"
  | "device"
  | "retention"
  | "monetization"
}

export interface FormulaValidationResult {
 formulaId: string
 passed: boolean
 issues: string[]
 accuracyClass: MetricAccuracyClass
}

export interface FormulaEvaluationResult {
 formulaId: string
 value: number | null
 validation: FormulaValidationResult
}

export const FORMULA_REGISTRY: FormulaSpec[] = [
 {
  id: "watch_hours_from_minutes",
  label: "Watch Hours",
  outputCanonicalKey: "watchHours",
  inputs: ["estimatedMinutesWatched"],
  unit: "hours",
  description: "Converts estimated minutes watched to hours.",
  expectedScope: "video_shared",
 },
 {
  id: "engagement_rate_basic",
  label: "Engagement Rate",
  outputCanonicalKey: "engagementRate",
  inputs: ["likes", "comments", "shares", "views"],
  unit: "percent",
  description: "(likes + comments + shares) / views * 100",
  expectedScope: "video_shared",
 },
 {
  id: "rpm_from_revenue_and_views",
  label: "RPM",
  outputCanonicalKey: "rpm",
  inputs: ["estimatedRevenue", "views"],
  unit: "currency_per_thousand_views",
  description: "estimatedRevenue / views * 1000",
  expectedScope: "video_shared",
 },
 {
  id: "subscriber_conversion_rate",
  label: "Subscriber Conversion Rate",
  outputCanonicalKey: "subscriberConversionRate",
  inputs: ["subscribersGained", "views"],
  unit: "percent",
  description: "subscribersGained / views * 100",
  expectedScope: "video_shared",
 },
 {
  id: "impression_ctr_derived",
  label: "Impression Click-Through Rate",
  outputCanonicalKey: "ctr",
  inputs: ["clicks", "impressions"],
  unit: "percent",
  description: "clicks / impressions * 100",
  expectedScope: "video_shared",
 },
 {
  id: "retention_quality_index",
  label: "Retention Quality Index",
  outputCanonicalKey: "retentionQualityIndex",
  inputs: ["avp", "durationSeconds"],
  unit: "index",
  description: "avp / (durationSeconds / 60)",
  expectedScope: "video_shared",
 },
 {
  id: "monetization_efficiency",
  label: "Monetization Efficiency",
  outputCanonicalKey: "monetizationEfficiency",
  inputs: ["rpm", "cpm"],
  unit: "percent",
  description: "(rpm / cpm) * 100",
  expectedScope: "monetization",
 },
 {
  id: "audience_loyalty_score",
  label: "Audience Loyalty Score",
  outputCanonicalKey: "audienceLoyaltyScore",
  inputs: ["returningViewers", "uniqueViewers"],
  unit: "percent",
  description: "(returningViewers / uniqueViewers) * 100",
  expectedScope: "channel",
 },
 {
  id: "shorts_viral_threshold",
  label: "Shorts Viral Threshold",
  outputCanonicalKey: "shortsViralThreshold",
  inputs: ["ctr", "avp"],
  unit: "index",
  description: "(ctr * avp) / 100",
  expectedScope: "short_only",
 },
 {
  id: "audience_quality_score",
  label: "Audience Quality Score",
  outputCanonicalKey: "audienceQualityScore",
  inputs: ["authenticatedViewers", "views"],
  unit: "percent",
  description: "(authenticatedViewers / views) * 100",
  expectedScope: "channel",
 },
]

const finiteNumber = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value === "string") {
  const parsed = Number(value.replace(/,/g, "").trim())
  return Number.isFinite(parsed) ? parsed : null
 }
 return null
}

export const validateFormulaInputs = (
 formula: FormulaSpec,
 values: Record<string, unknown>,
): FormulaValidationResult => {
 const issues: string[] = []
 for (const input of formula.inputs) {
  const rawValue = values[input]
  const num = finiteNumber(rawValue)
  if (num === null) {
   issues.push(`Missing numeric input: ${input}`)
  } else if (num < 0) {
   issues.push(`Negative value not allowed for ${input}`)
  }
 }

 const passed = issues.length === 0
 return {
  formulaId: formula.id,
  passed,
  issues,
  accuracyClass: passed ? "derived_exact" : "unavailable",
 }
}

const calc = (formulaId: string, values: Record<string, number>): number | null => {
 if (formulaId === "watch_hours_from_minutes") {
  return values.estimatedMinutesWatched / 60
 }

 if (formulaId === "engagement_rate_basic") {
  if (values.views <= 0) return null
  return ((values.likes + values.comments + values.shares) / values.views) * 100
 }

 if (formulaId === "rpm_from_revenue_and_views") {
  if (values.views <= 0) return null
  return (values.estimatedRevenue / values.views) * 1000
 }

 if (formulaId === "subscriber_conversion_rate") {
  if (values.views <= 0) return null
  return (values.subscribersGained / values.views) * 100
 }

 if (formulaId === "impression_ctr_derived") {
  if (values.impressions <= 0) return null
  return (values.clicks / values.impressions) * 100
 }

 if (formulaId === "retention_quality_index") {
  if (values.durationSeconds <= 0) return null
  return values.avp / (values.durationSeconds / 60)
 }

 if (formulaId === "monetization_efficiency") {
  if (values.cpm <= 0) return null
  return (values.rpm / values.cpm) * 100
 }

 if (formulaId === "audience_loyalty_score") {
  if (values.uniqueViewers <= 0) return null
  return (values.returningViewers / values.uniqueViewers) * 100
 }

 if (formulaId === "shorts_viral_threshold") {
  return (values.ctr * values.avp) / 100
 }

 if (formulaId === "audience_quality_score") {
  if (values.views <= 0) return null
  return (values.authenticatedViewers / values.views) * 100
 }

 return null
}

export const evaluateFormula = (
 formulaId: string,
 values: Record<string, unknown>,
): FormulaEvaluationResult => {
 const formula = FORMULA_REGISTRY.find((item) => item.id === formulaId)
 if (!formula) {
  return {
   formulaId,
   value: null,
   validation: {
    formulaId,
    passed: false,
    issues: ["Unknown formula"],
    accuracyClass: "unavailable",
   },
  }
 }

 const validation = validateFormulaInputs(formula, values)
 if (!validation.passed) {
  return { formulaId, value: null, validation }
 }

 const numericValues: Record<string, number> = {}
 for (const input of formula.inputs) {
  numericValues[input] = finiteNumber(values[input]) as number
 }

 const output = calc(formula.id, numericValues)
 if (output === null || !Number.isFinite(output)) {
  return {
   formulaId,
   value: null,
   validation: {
    formulaId,
    passed: false,
    issues: ["Formula preconditions were not met (likely zero denominator)."],
    accuracyClass: "unavailable",
   },
  }
 }

 return {
  formulaId,
  value: output,
  validation,
 }
}

// --- END formulaRegistry.ts ---

// --- BEGIN channelDataGuideRegistry.ts ---


export type ChannelDataSourceGuideRow = {
 id: string
 title: string
 bestFor: string
 needsLogin: "Yes" | "No" | "Optional"
 speed: "Fast" | "Medium" | "Delayed" | "Manual"
 adds: string
 whenToUse: string
}

export type ChannelDataGuideAvailability =
 | "api"
 | "public"
 | "reporting"
 | "csv_only"

export type ChannelDataGuideEntry = {
 id: string
 title: string
 majorFamily: CsvMajorFamily
 breakdownLabel: string
 recommendedDateWindows: string[]
 metrics: string[]
 availability: ChannelDataGuideAvailability[]
 uploadRecommendation: "Upload ZIP" | "Upload folder" | "Single CSV works, but weaker detection"
 needsCsv: boolean
 notes: string
 children?: ChannelDataGuideEntry[]
}

export type ChannelDataGuideFamily = {
 id: string
 title: string
 majorFamily: CsvMajorFamily
 rows: ChannelDataGuideEntry[]
}

export const ANALYTICS_DATASET_SOURCE_POLICIES: AnalyticsDatasetSourcePolicy[] = [
 {
  id: "youtube_analytics_api",
  label: "Fast API Sync",
  sourceType: "youtube_analytics_api",
  speedClass: "fast",
  requiresOAuth: true,
  bestFor: "Core video metrics, daily metrics, traffic, audience, geography, and supported monetization rows.",
  guidance: "Use first for connected, interactive channel analytics.",
 },
 {
  id: "youtube_data_api",
  label: "Public Channel / Video Data",
  sourceType: "youtube_data_api",
  speedClass: "fast",
  requiresOAuth: false,
  bestFor: "Video metadata, titles, thumbnails, identifiers, and public lifetime counts.",
  guidance: "Use for metadata and public resource totals, not detailed breakdown tables.",
 },
 {
  id: "youtube_reporting_api",
  label: "Reporting / Bulk History",
  sourceType: "youtube_reporting_api",
  speedClass: "bulk_delayed",
  requiresOAuth: true,
  bestFor: "Historical bulk warehousing and slower reporting-backed families.",
  guidance: "Use for broader delayed coverage, not first-screen readiness.",
 },
 {
  id: "studio_csv",
  label: "CSV Uploads",
  sourceType: "studio_csv",
  speedClass: "manual_csv_only",
  requiresOAuth: false,
  bestFor: "Studio-only metrics, upload verification, exact breakdown exports, and retention packages.",
  guidance: "Use when the API path cannot expose the exact YouTube Studio table shape.",
 },
]

export const CHANNEL_DATA_SOURCE_GUIDE: ChannelDataSourceGuideRow[] =
 ANALYTICS_DATASET_SOURCE_POLICIES.map((policy) => ({
  id: policy.id,
  title: policy.label,
  bestFor: policy.bestFor,
  needsLogin: policy.requiresOAuth
   ? "Yes"
   : policy.sourceType === "studio_csv"
    ? "Optional"
    : "No",
  speed:
   policy.speedClass === "fast"
    ? "Fast"
    : policy.speedClass === "medium"
     ? "Medium"
     : policy.speedClass === "bulk_delayed"
      ? "Delayed"
      : "Manual",
  adds: policy.guidance,
  whenToUse: policy.guidance,
 }))

export const CHANNEL_DATA_DOWNLOAD_STEPS: string[] = [
 "Open YouTube Studio.",
 "Go to Analytics.",
 "Switch to Advanced mode.",
 "Choose the date range first.",
 "Choose the breakdown type you want to export.",
 "Choose or confirm the metrics shown in the table.",
 "Download the CSV or Google Sheets export from the top right.",
 "Prefer uploading the ZIP or full extracted folder into ViewTube.",
]

export const CHANNEL_DATA_MISSING_REASON_NOTES: string[] = [
 "Impressions, click-through rate, and stayed-to-watch percentages often require CSV uploads.",
 "New, casual, regular, and returning viewer stats are limited by YouTube's retention window.",
 "Some traffic source detail tables are not available from the fast API sync path and may need CSV or reporting exports.",
]

const contentRows: ChannelDataGuideEntry[] = [
 {
  id: "content_all",
  title: "All Videos",
  majorFamily: "video_data",
  breakdownLabel: "Content",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Engaged views", "Watch time", "Revenue", "Subscribers", "Average view duration"],
  availability: ["api", "public", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Best baseline export for matching uploaded content rows to synced channel video data.",
 },
 {
  id: "content_shorts",
  title: "Shorts",
  majorFamily: "video_data",
  breakdownLabel: "Content",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Engaged views", "Stayed to watch", "Watch time", "Subscribers"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: true,
  notes: "Stayed-to-watch percentages are commonly CSV-enriched.",
 },
 {
  id: "content_long_form",
  title: "Long-form",
  majorFamily: "video_data",
  breakdownLabel: "Content",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Impressions", "CTR", "Watch time", "End screen rates", "Card rates"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: true,
  notes: "Impressions and CTR often need CSV uploads to match Studio output.",
 },
 {
  id: "content_type",
  title: "Content type",
  majorFamily: "video_data",
  breakdownLabel: "Content type",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Engaged views", "Views", "Watch time", "Average view duration", "Subscribers"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Useful for Shorts vs videos vs other high-level format splits.",
 },
]

const dailyRows: ChannelDataGuideEntry[] = [
 {
  id: "daily_channel_metrics",
  title: "Daily Channel Metrics",
  majorFamily: "daily_metrics",
  breakdownLabel: "Date",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days", "Custom"],
  metrics: ["Views", "Engaged views", "Watch time", "Revenue", "Subscribers", "Average view duration"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Use date-based exports when you need the exact daily table shape from YouTube Studio or want to verify the synced day-by-day channel history.",
 },
]

const trafficRows: ChannelDataGuideEntry[] = [
 {
  id: "traffic_overview",
  title: "Overview",
  majorFamily: "traffic",
  breakdownLabel: "Traffic source",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Watch time", "Average view duration", "Impressions", "CTR"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: true,
  notes: "Best traffic export for impressions, CTR, and source totals.",
 },
 {
  id: "traffic_search",
  title: "YouTube Search",
  majorFamily: "traffic",
  breakdownLabel: "Traffic source",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Search terms", "Views", "Watch time", "Average view duration"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Search-term detail is often easiest to preserve through the CSV package.",
 },
 {
  id: "traffic_external",
  title: "External",
  majorFamily: "traffic",
  breakdownLabel: "Traffic source",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["External source title", "Views", "Watch time", "Average view duration"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Good for exact referring domains and external source tables.",
 },
 {
  id: "traffic_suggested",
  title: "Suggested Videos",
  majorFamily: "traffic",
  breakdownLabel: "Traffic source",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Suggested video title", "Views", "Watch time", "Average view duration"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Useful when you need title-level suggested source detail.",
 },
 {
  id: "traffic_shorts_feed",
  title: "Shorts Feed",
  majorFamily: "traffic",
  breakdownLabel: "Traffic source",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Shorts content link", "Views", "Watch time", "Average view duration"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Often needed for Shorts-linked traffic detail.",
 },
 {
  id: "traffic_youtube_features",
  title: "YouTube Features / Pages",
  majorFamily: "traffic",
  breakdownLabel: "Traffic source",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Browse features", "Channel pages", "Other YouTube features", "Views", "Watch time"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Good for page-level and browse traffic comparisons.",
 },
]

const geographyRows: ChannelDataGuideEntry[] = [
 {
  id: "geography_countries",
  title: "Countries",
  majorFamily: "geography",
  breakdownLabel: "Geography",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Watch time", "Average view duration", "Revenue"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Country-level geography is one of the main synced hard-number views.",
 },
 {
  id: "geography_cities",
  title: "Cities",
  majorFamily: "geography",
  breakdownLabel: "Cities",
  recommendedDateWindows: ["365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Watch time", "Average view duration"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "City exports are more specific and useful for deeper geography drilldowns.",
 },
]

const audienceRows: ChannelDataGuideEntry[] = [
 {
  id: "audience_age",
  title: "Age",
  majorFamily: "audience",
  breakdownLabel: "Audience",
  recommendedDateWindows: ["90 days", "28 days", "7 days"],
  metrics: ["Views %", "Watch time %", "Average view duration"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Age splits are often easier to verify from CSV exports.",
 },
 {
  id: "audience_gender",
  title: "Gender",
  majorFamily: "audience",
  breakdownLabel: "Audience",
  recommendedDateWindows: ["90 days", "28 days", "7 days"],
  metrics: ["Views %", "Watch time %", "Average view duration"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Gender exports usually mirror the age export format.",
 },
 {
  id: "audience_age_gender",
  title: "Age × Gender",
  majorFamily: "audience",
  breakdownLabel: "Audience",
  recommendedDateWindows: ["90 days", "28 days", "7 days"],
  metrics: ["Views %", "Watch time %", "Average view duration"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Combined demographic splits are most reliable when preserved from CSV.",
 },
 {
  id: "audience_new_returning",
  title: "New / Returning",
  majorFamily: "audience",
  breakdownLabel: "Audience",
  recommendedDateWindows: ["90 days"],
  metrics: ["New viewers", "Returning viewers", "Casual viewers", "Regular viewers"],
  availability: ["csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: true,
  notes: "These viewer classifications are limited by YouTube's shorter rolling retention windows.",
 },
 {
  id: "audience_watch_behavior",
  title: "Watch behavior",
  majorFamily: "audience",
  breakdownLabel: "Audience",
  recommendedDateWindows: ["90 days", "28 days", "7 days"],
  metrics: ["Subscribers", "Non-subscribers", "Organic", "Paid", "Watch time"],
  availability: ["csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: true,
  notes: "Behavior-based audience exports are primarily upload-driven.",
 },
 {
  id: "audience_devices",
  title: "Devices",
  majorFamily: "audience",
  breakdownLabel: "Device type",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Watch time", "Average view duration"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Device and operating-system splits can come from API or reporting, but CSV keeps Studio parity.",
 },
 {
  id: "audience_retention",
  title: "Retention",
  majorFamily: "audience",
  breakdownLabel: "Audience retention",
  recommendedDateWindows: ["Lifetime", "90 days", "28 days", "7 days"],
  metrics: ["Absolute audience retention", "Relative retention", "Started watching", "Stopped watching"],
  availability: ["csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: true,
  notes: "Single-video and segment retention exports remain CSV-first.",
 },
]

const surfacesRows: ChannelDataGuideEntry[] = [
 {
  id: "surface_playback_location",
  title: "Playback location",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Playback location",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Watch time", "Average view duration"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: false,
  notes: "Good for watch page vs embedded playback comparisons.",
 },
 {
  id: "surface_subscription_status",
  title: "Subscription status",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Audience",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Subscribers", "Views", "Watch time"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: false,
  notes: "Useful for subscriber vs non-subscriber performance breakdowns.",
 },
 {
  id: "surface_subscription_source",
  title: "Subscription source",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Audience",
  recommendedDateWindows: ["365 days", "90 days", "28 days"],
  metrics: ["Subscribers gained", "Subscribers lost"],
  availability: ["csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: true,
  notes: "Often only preserved through Studio exports.",
 },
 {
  id: "surface_sharing_service",
  title: "Sharing service",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Sharing service",
  recommendedDateWindows: ["365 days", "90 days", "28 days", "7 days"],
  metrics: ["Shares", "Views", "Watch time"],
  availability: ["reporting", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: true,
  notes: "Good for social/share destination breakdowns.",
 },
 {
  id: "surface_playlists",
  title: "Playlists",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Playlist",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Playlist views", "Playlist watch time", "Views per playlist start"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: false,
  notes: "Playlist performance can enrich both discovery and revenue interpretation.",
 },
 {
  id: "surface_posts",
  title: "Posts",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Post",
  recommendedDateWindows: ["90 days", "28 days", "7 days"],
  metrics: ["Views", "Clicks", "Engagement"],
  availability: ["csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: true,
  notes: "Community-post analytics are Studio-first today.",
 },
 {
  id: "surface_cards",
  title: "Cards",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Cards",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Card impressions", "Card clicks", "Card click-through rate"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: false,
  notes: "Card-type detail is often easier to preserve from CSV or reporting.",
 },
 {
  id: "surface_end_screens",
  title: "End screens",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "End screens",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["End screen impressions", "End screen clicks", "End screen click-through rate"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: false,
  notes: "Useful for long-form CTA performance.",
 },
 {
  id: "surface_subtitles_cc",
  title: "Subtitles / CC",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Subtitles / CC",
  recommendedDateWindows: ["365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Watch time", "Language usage"],
  availability: ["reporting", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: true,
  notes: "Subtitle and translation usage remain specialized exports.",
 },
 {
  id: "surface_translation_language",
  title: "Translation / language",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Language",
  recommendedDateWindows: ["365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Watch time", "Language-specific usage"],
  availability: ["csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: true,
  notes: "Video language and translated metadata are best captured from Studio CSVs.",
 },
]

const revenueRows: ChannelDataGuideEntry[] = [
 {
  id: "revenue_source",
  title: "Revenue source",
  majorFamily: "revenue_monetization",
  breakdownLabel: "Revenue source",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Estimated revenue", "Estimated ad revenue", "Premium revenue", "RPM"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Revenue source splits are best used after core metrics are already synced.",
 },
 {
  id: "ad_type",
  title: "Ad type",
  majorFamily: "revenue_monetization",
  breakdownLabel: "Ad type",
  recommendedDateWindows: ["365 days", "90 days", "28 days", "7 days"],
  metrics: ["Ad impressions", "Playback-based CPM", "Estimated ad revenue"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: false,
  notes: "Some ad-type detail remains easier to validate through CSV exports.",
 },
]

export const CHANNEL_DATA_GUIDE_FAMILIES: ChannelDataGuideFamily[] = [
 { id: "content", title: CSV_MAJOR_FAMILY_STYLES["video_data"]?.label ?? "Video Data", majorFamily: "video_data", rows: contentRows },
 { id: "daily_metrics", title: CSV_MAJOR_FAMILY_STYLES["daily_metrics"]?.label ?? "Daily Metrics", majorFamily: "daily_metrics", rows: dailyRows },
 { id: "traffic", title: CSV_MAJOR_FAMILY_STYLES["traffic"]?.label ?? "Traffic", majorFamily: "traffic", rows: trafficRows },
 { id: "geography", title: CSV_MAJOR_FAMILY_STYLES["geography"]?.label ?? "Geography", majorFamily: "geography", rows: geographyRows },
 { id: "audience", title: CSV_MAJOR_FAMILY_STYLES["audience"]?.label ?? "Audience", majorFamily: "audience", rows: audienceRows },
 {
  id: "surfaces_discovery",
  title: CSV_MAJOR_FAMILY_STYLES["surfaces_discovery"]?.label ?? "Surfaces & Discovery",
  majorFamily: "surfaces_discovery",
  rows: surfacesRows,
 },
 {
  id: "revenue_monetization",
  title: CSV_MAJOR_FAMILY_STYLES["revenue_monetization"]?.label ?? "Revenue & Monetization",
  majorFamily: "revenue_monetization",
  rows: revenueRows,
 },
]

export const getChannelDataFamilyStyle = (majorFamily: CsvMajorFamily) =>
 CSV_MAJOR_FAMILY_STYLES[majorFamily]

// --- END channelDataGuideRegistry.ts ---

// --- BEGIN canonicalMetricResolver.ts ---


export type CoverageRowStatus =
 | "received"
 | "missing"
 | "not_applicable"
 | "not_connected"

export interface ResolvedMetricValue {
 value: number | null
 status: CoverageRowStatus
 reason: "actual" | "derived" | "fallback" | "missing"
}



const numeric = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value === "string") {
  const cleaned = value.replace(/,/g, "").replace(/%/g, "").trim()
  if (!cleaned) return null
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
 }
 return null
}

const normalizeAliasKey = (value: string): string =>
 value
  .toLowerCase()
  .replace(/\ufeff/g, "")
  .replace(/[%()]/g, "")
  .replace(/[_-]/g, " ")
  .replace(/\s+/g, " ")
  .trim()

const normalizedRowValue = (
 row: Record<string, unknown>,
 aliases: string[],
): number | null => {
 const direct = aliases
  .map((key) => numeric(row[key]))
  .find((value): value is number => value !== null)
 if (direct !== undefined) return direct

 const aliasSet = new Set(aliases.map(normalizeAliasKey))
 for (const [key, value] of Object.entries(row)) {
  if (!aliasSet.has(normalizeAliasKey(key))) continue
  const parsed = numeric(value)
  if (parsed !== null) return parsed
 }
 return null
}

const derive = (row: CanonicalVideoRow, metricKey: CanonicalMetricKey): number | null => {
 if (metricKey === "watchHours") {
  const avdCell = row.metrics.avdSeconds
  const viewsCell = row.metrics.views
  if (
   avdCell &&
   avdCell.status !== "unavailable" &&
   viewsCell &&
   viewsCell.status !== "unavailable" &&
   avdCell.value !== null &&
   viewsCell.value !== null
  ) {
   return (avdCell.value * viewsCell.value) / 3600
  }
 }
 if (metricKey === "rpm") {
  const revenue = row.metrics.revenue
  const views = row.metrics.views
  if (
   revenue &&
   revenue.status !== "unavailable" &&
   views &&
   views.status !== "unavailable" &&
   revenue.value !== null &&
   views.value !== null &&
   views.value > 0
  ) {
   return (revenue.value / views.value) * 1000
  }
 }
 return null
}

export const resolveMetricNumber = (
 row: CanonicalVideoRow,
 metricKey: CanonicalMetricKey,
): ResolvedMetricValue => {
 const metricCell = row.metrics[metricKey]
 if (metricCell && metricCell.status !== "unavailable" && metricCell.value !== null) {
  return {
   value: metricCell.value,
   status: "received",
   reason: metricCell.status === "derived" ? "derived" : "actual",
  }
 }

 const fallbackFromRow = normalizedRowValue(
  row as unknown as Record<string, unknown>,
  METRIC_REGISTRY[metricKey]?.aliases || [],
 )
 if (fallbackFromRow !== undefined) {
  if (metricKey === "watchHours") {
   const looksLikeMinutes = fallbackFromRow > 24 * 365
   return {
    value: looksLikeMinutes ? fallbackFromRow / 60 : fallbackFromRow,
    status: "received",
    reason: "fallback",
   }
  }
  return { value: fallbackFromRow, status: "received", reason: "fallback" }
 }

 const derived = derive(row, metricKey)
 if (derived !== null && Number.isFinite(derived)) {
  return { value: derived, status: "received", reason: "derived" }
 }

 return { value: null, status: "missing", reason: "missing" }
}

// --- END canonicalMetricResolver.ts ---

// --- BEGIN analyticsDatasetRegistry.ts ---




const prioritizeSources = (majorFamily: CsvMajorFamily): AnalyticsDatasetSourcePolicy["sourceType"][] => {
 switch (majorFamily) {
  case "video_data":
   return ["youtube_analytics_api", "youtube_data_api", "studio_csv"]
  case "daily_metrics":
   return ["youtube_analytics_api", "studio_csv", "youtube_reporting_api"]
  case "traffic":
   return ["youtube_analytics_api", "studio_csv", "youtube_reporting_api"]
  case "geography":
   return ["youtube_analytics_api", "studio_csv", "youtube_reporting_api"]
  case "audience":
   return ["youtube_analytics_api", "studio_csv", "youtube_reporting_api"]
  case "surfaces_discovery":
   return ["studio_csv", "youtube_reporting_api", "youtube_analytics_api"]
  case "revenue_monetization":
   return ["youtube_analytics_api", "studio_csv", "youtube_reporting_api"]
  default:
   return ["studio_csv"]
 }
}

const csvOnlyGapLabels = (majorFamily: CsvMajorFamily): string[] => {
 switch (majorFamily) {
  case "video_data":
   return ["Impressions", "CTR", "Stayed to watch (%)"]
  case "daily_metrics":
   return [
    "Stayed to watch (%)",
    "New viewers",
    "Casual viewers",
    "Returning viewers",
    "Regular viewers",
   ]
  case "audience":
   return ["Retention packages", "New / returning viewer windows"]
  case "surfaces_discovery":
   return ["Some cards, end-screen, subtitle, post, and translation exports"]
  case "revenue_monetization":
   return ["Revenue source and ad-type Studio cuts"]
  default:
   return []
 }
}

export const ANALYTICS_DATASET_FAMILY_REGISTRY: AnalyticsDatasetFamilyRegistryRow[] = (
 Object.keys(CSV_MAJOR_FAMILY_STYLES) as CsvMajorFamily[]
)
 .filter((majorFamily) => majorFamily !== "unknown")
 .map((majorFamily) => {
  const familyDefs = Object.values(CSV_FAMILY_DEFINITIONS).filter(
   (definition) => definition.majorFamily === majorFamily,
  )
  const subtableIds = Array.from(
   new Set(familyDefs.map((definition) => definition.subtableId)),
  ) as CsvSubtableId[]
  const syncActionLabels = ANALYTICS_SYNC_REGISTRY.filter(
   (row) => row.datasetFamily === majorFamily,
  ).map((row) => row.label)

  return {
   majorFamily,
   label: CSV_MAJOR_FAMILY_STYLES[majorFamily].label,
   subtableIds,
   syncActionLabels,
   sourcePriority: prioritizeSources(majorFamily),
   csvOnlyGaps: csvOnlyGapLabels(majorFamily),
  }
 })

export const getAnalyticsDatasetFamilyRegistryRow = (
 majorFamily: CsvMajorFamily,
): AnalyticsDatasetFamilyRegistryRow => {
 return (
  ANALYTICS_DATASET_FAMILY_REGISTRY.find((row) => row.majorFamily === majorFamily) || {
   majorFamily,
   label: CSV_MAJOR_FAMILY_STYLES[majorFamily]?.label || majorFamily,
   subtableIds: [],
   syncActionLabels: [],
   sourcePriority: ["studio_csv"],
   csvOnlyGaps: [],
  }
 )
}

// --- END analyticsDatasetRegistry.ts ---
