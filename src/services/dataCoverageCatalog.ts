import type { DataCoverageScope, DataCoverageSource } from "./dataCoverageInventory"

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
 { categoryName: "Comments and Replies History", canonicalKey: "youtubeCommentsRepliesHistory", source: mapSource("personal_history"), scope: mapScope("history"), rawName: "youtubeCommentsRepliesHistory" },
 { categoryName: "Community Post Interactions", canonicalKey: "youtubeCommunityPostHistory", source: mapSource("personal_history"), scope: mapScope("history"), rawName: "youtubeCommunityPostHistory" },
 { categoryName: "Continent", canonicalKey: "continent", source: mapSource("youtube_analytics_api"), scope: mapScope("geo"), rawName: "continent" },
 { categoryName: "Country", canonicalKey: "country", source: mapSource("youtube_analytics_api"), scope: mapScope("geo"), rawName: "country" },
 { categoryName: "CPM", canonicalKey: "cpm", source: mapSource("youtube_analytics_api"), scope: mapScope("monetization"), rawName: "cpm" },
 { categoryName: "Creator Content Type", canonicalKey: "creatorContentType", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "creatorContentType" },
 { categoryName: "Device Type", canonicalKey: "deviceType", source: mapSource("youtube_analytics_api"), scope: mapScope("device"), rawName: "deviceType" },
 { categoryName: "Dislikes", canonicalKey: "dislikes", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "dislikes" },
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
 { categoryName: "Sharing Activity History", canonicalKey: "youtubeSharingHistory", source: mapSource("personal_history"), scope: mapScope("history"), rawName: "youtubeSharingHistory" },
 { categoryName: "Sharing Service", canonicalKey: "sharingService", source: mapSource("youtube_analytics_api"), scope: mapScope("traffic"), rawName: "sharingService" },
 { categoryName: "Shorts Funnel Percent Watched", canonicalKey: "shortsPercentWatched", source: mapSource("youtube_analytics_api"), scope: mapScope("short_only"), rawName: "shortsPercentWatched" },
 { categoryName: "Shorts Funnel Swipe Away Rate", canonicalKey: "shortsSwipeAwayRate", source: mapSource("youtube_analytics_api"), scope: mapScope("short_only"), rawName: "shortsSwipeAwayRate" },
 { categoryName: "Stayed To Watch Percent", canonicalKey: "stayedToWatch", source: mapSource("youtube_analytics_api"), scope: mapScope("short_only"), rawName: "stayedToWatch" },
 { categoryName: "Sub Continent", canonicalKey: "subContinent", source: mapSource("youtube_analytics_api"), scope: mapScope("geo"), rawName: "subContinent" },
 { categoryName: "Subscribed Status", canonicalKey: "subscribedStatus", source: mapSource("youtube_analytics_api"), scope: mapScope("demographic"), rawName: "subscribedStatus" },
 { categoryName: "Subscriber Count", canonicalKey: "statistics.subscriberCount", source: mapSource("youtube_data_api_v3"), scope: mapScope("channel"), rawName: "statistics.subscriberCount" },
 { categoryName: "Subscribers Gained", canonicalKey: "subscribersGained", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "subscribersGained" },
 { categoryName: "Subscribers Lost", canonicalKey: "subscribersLost", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "subscribersLost" },
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
 { categoryName: "Views Per Playlist Start", canonicalKey: "viewsPerPlaylistStart", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "viewsPerPlaylistStart" },
 { categoryName: "Watch Time Minutes", canonicalKey: "estimatedMinutesWatched", source: mapSource("youtube_analytics_api"), scope: mapScope("video_shared"), rawName: "estimatedMinutesWatched" },
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
]

export const DATA_COVERAGE_CATALOG: DataCoverageCatalogEntry[] = [
 ...BASE_DATA_COVERAGE_CATALOG,
 ...FORMULA_DERIVED_CATALOG,
]
