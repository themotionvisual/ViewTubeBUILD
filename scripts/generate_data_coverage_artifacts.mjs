import fs from 'fs'
import path from 'path'

const outDir = path.resolve('docs/Youtube API + Data')
const csvPath = path.join(outDir, 'YOUTUBE_DATA_COVERAGE_COMPLETE.csv')
const mdPath = path.join(outDir, 'YOUTUBE_DATA_COVERAGE_COMPLETE.md')
const backlogPath = path.join(outDir, 'SITE_IMPROVEMENT_INTELLIGENCE_BACKLOG.md')

const DOCS = {
  exhaustive: 'docs/Youtube API + Data/YOUTUBE_STATISTICS_EXHAUSTIVE_REFERENCE.md',
  categories: 'docs/Youtube API + Data/Youtube Analytics Data Categories List.txt',
  categoriesRtf: 'docs/Youtube API + Data/YoutubeDataCatagoriesLIST.MD',
  processing: 'docs/Youtube API + Data/DATA_PROCESSING_REPORT.md',
  flow: 'docs/Youtube API + Data/DATA_FLOW_COMPREHENSIVE_REPORT.md',
  videoType: 'docs/Youtube API + Data/VIDEO_TYPE_AND_DATA_ANALYSIS_REPORT.md',
  personal: 'docs/Youtube API + Data/Personal Data Analytics (Comments:Posts:Watchhistory etc.).txt',
  ecosystem: 'docs/Youtube API + Data/analytics_ecosystem_spec.md',
  compiled: 'docs/Youtube API + Data/COMPILED_STATS.txt',
  formulasPdf: 'docs/Youtube API + Data/YouTube Analytics Formulas.pdf',
  reportingPdf: 'docs/Youtube API + Data/YouTube API Data Reporting Overview.pdf',
  dataListPdf: 'docs/Youtube API + Data/YouTube Analytics API Data List - Google Docs.pdf',
}

const rows = [
  // Data API v3 - channel identity and totals
  row('Subscriber Count', 'statistics.subscriberCount', 'field', 'youtube_data_api_v3', 'channel', 'statistics.subscriberCount', '', 'yes', 'yt_analytics_cache.profile.statistics.subscriberCount', '', 'snapshot value; hides if public subscriber count disabled', [DOCS.exhaustive, DOCS.processing]),
  row('Total Views', 'statistics.viewCount', 'field', 'youtube_data_api_v3', 'channel', 'statistics.viewCount', '', 'yes', 'yt_analytics_cache.profile.statistics.viewCount', '', 'lifetime cumulative counter', [DOCS.exhaustive, DOCS.processing]),
  row('Total Videos', 'statistics.videoCount', 'field', 'youtube_data_api_v3', 'channel', 'statistics.videoCount', '', 'yes', 'yt_analytics_cache.profile.statistics.videoCount', '', 'public+unlisted count only', [DOCS.exhaustive, DOCS.processing]),
  row('Channel Name', 'snippet.title', 'field', 'youtube_data_api_v3', 'channel', 'snippet.title', '', 'yes', 'yt_analytics_cache.profile.snippet.title', '', '', [DOCS.exhaustive, DOCS.processing]),
  row('Channel ID', 'id', 'field', 'youtube_data_api_v3', 'channel', 'id', '', 'yes', 'yt_analytics_cache.profile.id', '', '', [DOCS.exhaustive, DOCS.processing]),
  row('Profile Picture URL', 'snippet.thumbnails.default.url', 'field', 'youtube_data_api_v3', 'channel', 'snippet.thumbnails.default.url', '', 'yes', 'yt_analytics_cache.profile.snippet.thumbnails', '', '', [DOCS.exhaustive, DOCS.processing]),
  row('Uploads Playlist ID', 'contentDetails.relatedPlaylists.uploads', 'field', 'youtube_data_api_v3', 'channel', 'contentDetails.relatedPlaylists.uploads', '', 'yes', 'yt_analytics_cache.profile.contentDetails.relatedPlaylists.uploads', '', '', [DOCS.exhaustive, DOCS.processing]),

  // Core/channel audience metrics
  row('Unique Viewers', 'uniqueViewers', 'metric', 'youtube_analytics_api', 'channel', 'uniqueViewers', 'unique_viewers', 'yes', 'yt_analytics_cache.channelAnalytics rows', '', 'channel-level only', [DOCS.exhaustive, DOCS.processing]),
  row('New Viewers', 'newViewers', 'metric', 'youtube_analytics_api', 'channel', 'newViewers', 'new_viewers', 'yes', 'yt_analytics_cache.channelAnalytics rows', '', 'channel-level only', [DOCS.exhaustive, DOCS.processing]),
  row('Returning Viewers', 'returningViewers', 'metric', 'youtube_analytics_api', 'channel', 'returningViewers', 'returning_viewers', 'yes', 'yt_analytics_cache.channelAnalytics rows', '', 'channel-level only', [DOCS.exhaustive, DOCS.processing]),
  row('Casual Viewers', 'casualViewers', 'metric', 'youtube_analytics_api', 'channel', 'casualViewers', 'casual_viewers', 'yes', 'yt_analytics_cache.channelAnalytics rows', '', 'channel-level only', [DOCS.exhaustive, DOCS.processing]),
  row('Regular Viewers', 'regularViewers', 'metric', 'youtube_analytics_api', 'channel', 'regularViewers', 'regular_viewers', 'yes', 'yt_analytics_cache.channelAnalytics rows', '', 'channel-level only', [DOCS.exhaustive, DOCS.processing]),

  // Demographics dimensions/metric
  row('Age Group', 'ageGroup', 'dimension', 'youtube_analytics_api', 'demographic', 'ageGroup', 'age_group', 'yes', 'yt_analytics_cache.demographics rows', '', 'privacy-threshold omissions', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),
  row('Gender', 'gender', 'dimension', 'youtube_analytics_api', 'demographic', 'gender', 'gender', 'yes', 'yt_analytics_cache.demographics rows', '', 'privacy-threshold omissions', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),
  row('Viewer Percentage', 'viewerPercentage', 'metric', 'youtube_analytics_api', 'demographic', 'viewerPercentage', 'views_percentage', 'yes', 'yt_analytics_cache.demographics rows', '', 'anonymous viewers excluded', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),

  // Core all-format video metrics
  row('Views', 'views', 'metric', 'youtube_analytics_api', 'video_shared', 'views', 'views', 'yes', 'yt_analytics_cache.analyticsByWindow + master rows', '', '', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),
  row('Engaged Views', 'engagedViews', 'metric', 'youtube_analytics_api', 'video_shared', 'engagedViews', 'engaged_views', 'yes', 'yt_analytics_cache.analyticsByWindow + master rows', '', '', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),
  row('Watch Time Minutes', 'estimatedMinutesWatched', 'metric', 'youtube_analytics_api', 'video_shared', 'estimatedMinutesWatched', 'watch_time_minutes', 'yes', 'yt_analytics_cache.analyticsByWindow + master rows', '', '', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),
  row('Average View Duration', 'averageViewDuration', 'metric', 'youtube_analytics_api', 'video_shared', 'averageViewDuration', 'average_view_duration_seconds', 'yes', 'derived/enriched in unified row + API source', '', '', [DOCS.exhaustive, DOCS.categories, DOCS.videoType, DOCS.processing]),
  row('Average View Percentage', 'averageViewPercentage', 'metric', 'youtube_analytics_api', 'video_shared', 'averageViewPercentage', 'average_view_duration_percentage', 'yes', 'derived/enriched in unified row + API source', '', '', [DOCS.exhaustive, DOCS.categories, DOCS.videoType, DOCS.processing]),
  row('Likes', 'likes', 'metric', 'youtube_analytics_api', 'video_shared', 'likes', 'likes', 'yes', 'yt_analytics_cache.stats + master rows', '', '', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),
  row('Dislikes', 'dislikes', 'metric', 'youtube_analytics_api', 'video_shared', 'dislikes', 'dislikes', 'partial', 'documented in references; may be sparse/deprecated in current pipeline outputs', 'request metric where available and retain nullable handling', 'public UI hidden since 2021, creator-access may vary', [DOCS.exhaustive, DOCS.categories]),
  row('Comments', 'comments', 'metric', 'youtube_analytics_api', 'video_shared', 'comments', 'comments', 'yes', 'yt_analytics_cache.stats + master rows', '', '', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),
  row('Shares', 'shares', 'metric', 'youtube_analytics_api', 'video_shared', 'shares', 'shares', 'yes', 'yt_analytics_cache.analyticsByWindow + master rows', '', '', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),
  row('Subscribers Gained', 'subscribersGained', 'metric', 'youtube_analytics_api', 'video_shared', 'subscribersGained', 'subscribers_gained', 'yes', 'yt_analytics_cache.analyticsByWindow + master rows', '', '', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),
  row('Subscribers Lost', 'subscribersLost', 'metric', 'youtube_analytics_api', 'video_shared', 'subscribersLost', 'subscribers_lost', 'yes', 'yt_analytics_cache.analyticsByWindow + master rows', '', '', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),

  // Reach / impressions set
  row('Video Thumbnail Impressions', 'videoThumbnailImpressions', 'metric', 'youtube_analytics_api', 'video_shared', 'videoThumbnailImpressions', 'video_thumbnail_impressions', 'partial', 'console shows repeated 400 on dimensions=video for this metric in some windows; fallback sometimes returns rows', 'query reports endpoint by window; fallback to channel-level + per-video retries; persist unsupported combination cache', 'metric availability varies by report/dimension/content type', [DOCS.exhaustive, DOCS.categories, DOCS.processing, DOCS.flow]),
  row('Video Thumbnail CTR', 'videoThumbnailImpressionsClickRate', 'metric', 'youtube_analytics_api', 'video_shared', 'videoThumbnailImpressionsClickRate', 'video_thumbnail_impressions_ctr', 'partial', 'current sync logs 400 for several combinations; occasionally available', 'query as standalone metric group; fallback to calculated ctr when clicks/impressions available', 'non-core metric and short-feed behavior mismatch', [DOCS.exhaustive, DOCS.categories, DOCS.processing, DOCS.flow]),

  // Monetization/ad metrics
  row('Estimated Revenue', 'estimatedRevenue', 'metric', 'youtube_analytics_api', 'monetization', 'estimatedRevenue', 'estimated_partner_revenue', 'yes', 'yt_analytics_cache.analyticsByWindow + merged rows', '', 'requires yt-analytics-monetary.readonly', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),
  row('Estimated Ad Revenue', 'estimatedAdRevenue', 'metric', 'youtube_analytics_api', 'monetization', 'estimatedAdRevenue', 'estimated_partner_ad_revenue', 'partial', 'documented but not guaranteed in all current windows/rows', 'request metric with monetary scope and nullable handling', 'requires monetization scope and eligible channel', [DOCS.exhaustive, DOCS.categories]),
  row('Estimated Premium Revenue', 'estimatedRedPartnerRevenue', 'metric', 'youtube_analytics_api', 'monetization', 'estimatedRedPartnerRevenue', 'estimated_partner_red_revenue', 'partial', 'documented; may be sparse by format/window', 'query with monetary scope; include fallback nulls', 'requires monetization scope', [DOCS.exhaustive, DOCS.categories]),
  row('Gross Revenue', 'grossRevenue', 'metric', 'youtube_analytics_api', 'monetization', 'grossRevenue', 'gross_revenue', 'partial', 'documented; not consistently surfaced in current master rows', 'add explicit metric group for grossRevenue', 'requires monetization scope', [DOCS.exhaustive, DOCS.categories]),
  row('CPM', 'cpm', 'metric', 'youtube_analytics_api', 'monetization', 'cpm', 'cpm', 'partial', 'partially present/derived in current pipeline', 'query cpm directly and retain derivation fallback', 'requires monetization scope', [DOCS.exhaustive, DOCS.categories, DOCS.videoType]),
  row('Playback Based CPM', 'playbackBasedCpm', 'metric', 'youtube_analytics_api', 'monetization', 'playbackBasedCpm', 'playback_based_cpm', 'partial', 'documented but not always in active rows', 'request metric in monetization group', 'requires monetization scope', [DOCS.exhaustive, DOCS.categories]),
  row('Monetized Playbacks', 'monetizedPlaybacks', 'metric', 'youtube_analytics_api', 'monetization', 'monetizedPlaybacks', 'monetized_playbacks', 'partial', 'documented but not always populated in current output', 'add explicit query + nullable fallback', 'requires monetization scope', [DOCS.exhaustive, DOCS.categories]),
  row('Ad Impressions', 'adImpressions', 'metric', 'youtube_analytics_api', 'monetization', 'adImpressions', 'ad_impressions', 'partial', 'documented but sparse in current rows', 'add dedicated monetization metric group and cache', 'requires monetization scope', [DOCS.exhaustive, DOCS.categories]),
  row('RPM', 'rpm', 'metric', 'youtube_analytics_api', 'monetization', '', '', 'yes', 'derived in dataForge/unified rows as revenue per 1000 views', 'if missing, compute from estimatedRevenue and views', 'derived metric, not raw API field', [DOCS.exhaustive, DOCS.videoType, DOCS.processing]),

  // Traffic dimensions
  row('Traffic Source Type', 'trafficSourceType', 'dimension', 'youtube_analytics_api', 'traffic', 'trafficSourceType', 'traffic_source_type', 'yes', 'yt_analytics_cache.trafficSources rows', '', '', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),
  row('Traffic Source Detail', 'trafficSourceDetail', 'dimension', 'youtube_analytics_api', 'traffic', 'trafficSourceDetail', 'traffic_source_detail', 'yes', 'yt_analytics_cache.trafficSources rows', '', 'detail granularity depends on source type', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),
  row('Traffic: Shorts Feed', 'trafficSourceType.SHORTS', 'dimension', 'youtube_analytics_api', 'short_only', 'SHORTS', '18', 'partial', 'only present for shorts-heavy rows/content', 'query trafficSourceType with contentType/format segmentation', 'not meaningful for long-form', [DOCS.exhaustive]),
  row('Traffic: End Screen', 'trafficSourceType.END_SCREEN', 'dimension', 'youtube_analytics_api', 'long_only', 'END_SCREEN', '20', 'partial', 'only relevant where end screens exist', 'query traffic dimensions + long-form filter', 'long-form feature only', [DOCS.exhaustive]),

  // Geographic dimensions
  row('Country', 'country', 'dimension', 'youtube_analytics_api', 'geo', 'country', 'country_code', 'yes', 'yt_analytics_cache.demographics/geo breakdown', '', 'privacy-threshold omissions', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),
  row('Continent', 'continent', 'dimension', 'youtube_analytics_api', 'geo', 'continent', 'continent_code', 'no', 'not observed in current cache buckets', 'query reports with dimensions=continent and supported metric sets', 'may be omitted by API/report variant', [DOCS.exhaustive]),
  row('Sub Continent', 'subContinent', 'dimension', 'youtube_analytics_api', 'geo', 'subContinent', 'sub_continent_code', 'no', 'not observed in current cache buckets', 'query reports with dimensions=subContinent', 'report support varies', [DOCS.exhaustive]),
  row('Province', 'province', 'dimension', 'youtube_analytics_api', 'geo', 'province', 'province_code', 'no', 'not observed in current cache buckets', 'query reports with dimensions=province and geo-eligible metrics', 'privacy thresholds can suppress', [DOCS.exhaustive, DOCS.categories]),
  row('City', 'city', 'dimension', 'youtube_analytics_api', 'geo', 'city', 'city_id', 'no', 'not observed in current cache buckets', 'query dimensions=city and maintain city-id lookup mapping', 'heavy privacy suppression', [DOCS.exhaustive]),

  // Device/playback dimensions
  row('Device Type', 'deviceType', 'dimension', 'youtube_analytics_api', 'device', 'deviceType', 'device_type', 'no', 'not observed in current cache buckets', 'query reports with dimensions=deviceType', 'additional row explosion and privacy thresholds', [DOCS.exhaustive, DOCS.categories]),
  row('Operating System', 'operatingSystem', 'dimension', 'youtube_analytics_api', 'device', 'operatingSystem', 'operating_system', 'no', 'not observed in current cache buckets', 'query reports with dimensions=operatingSystem', 'support depends on report context', [DOCS.exhaustive, DOCS.categories]),
  row('Playback Location Type', 'playbackLocationType', 'dimension', 'youtube_analytics_api', 'device', 'playbackLocationType', 'playback_location_type', 'no', 'not observed in current cache buckets', 'query reports with dimensions=playbackLocationType', '', [DOCS.exhaustive, DOCS.categories]),
  row('Playback Location Detail', 'playbackLocationDetail', 'dimension', 'youtube_analytics_api', 'device', 'playbackLocationDetail', 'playback_location_detail', 'no', 'not observed in current cache buckets', 'query reports with dimensions=playbackLocationDetail', 'detail mostly available for embedded contexts', [DOCS.exhaustive, DOCS.categories]),
  row('Live or On Demand', 'liveOrOnDemand', 'dimension', 'youtube_analytics_api', 'video_shared', 'liveOrOnDemand', 'live_or_on_demand', 'no', 'not observed in current cache buckets', 'query reports with dimensions=liveOrOnDemand', '', [DOCS.exhaustive, DOCS.categories]),
  row('Subscribed Status', 'subscribedStatus', 'dimension', 'youtube_analytics_api', 'demographic', 'subscribedStatus', 'subscribed_status', 'no', 'not observed in current cache buckets', 'query reports with dimensions=subscribedStatus', '', [DOCS.exhaustive, DOCS.categories]),
  row('Creator Content Type', 'creatorContentType', 'dimension', 'youtube_analytics_api', 'video_shared', 'creatorContentType', 'creator_content_type', 'partial', 'current fetchVideoContentType attempts return 400 in logs; fallback to duration/format heuristics', 'query views by dimensions=video,creatorContentType OR use creatorContentType-only reports + join by video id where possible', 'dimension compatibility is limited; API may reject certain combinations', [DOCS.exhaustive, DOCS.categories, DOCS.processing]),

  // Long-form retention and cards/end screens
  row('Audience Watch Ratio', 'audienceWatchRatio', 'metric', 'youtube_analytics_api', 'long_only', 'audienceWatchRatio', 'audience_watch_ratio', 'no', 'not observed in current cache buckets', 'query with dimensions=elapsedVideoTimeRatio and long-form video filter', 'not meaningful/available for shorts', [DOCS.exhaustive, DOCS.categories]),
  row('Relative Retention Performance', 'relativeRetentionPerformance', 'metric', 'youtube_analytics_api', 'long_only', 'relativeRetentionPerformance', 'relative_retention_performance', 'no', 'not observed in current cache buckets', 'query with elapsedVideoTimeRatio for long-form', 'retention-only context', [DOCS.exhaustive, DOCS.categories]),
  row('Elapsed Video Time Ratio', 'elapsedVideoTimeRatio', 'dimension', 'youtube_analytics_api', 'retention', 'elapsedVideoTimeRatio', '', 'no', 'not observed in current cache buckets', 'add retention endpoint pass with dimensions=elapsedVideoTimeRatio', 'only meaningful for long-form retention', [DOCS.exhaustive, DOCS.categories]),
  row('Card Impressions', 'cardImpressions', 'metric', 'youtube_analytics_api', 'long_only', 'cardImpressions', 'card_impressions', 'no', 'not observed in current cache buckets', 'query long-form metrics for cards', 'long-form feature only', [DOCS.exhaustive, DOCS.categories]),
  row('Card Clicks', 'cardClicks', 'metric', 'youtube_analytics_api', 'long_only', 'cardClicks', 'card_clicks', 'no', 'not observed in current cache buckets', 'query long-form card metrics', 'long-form feature only', [DOCS.exhaustive, DOCS.categories]),
  row('Card Click Rate', 'cardClickRate', 'metric', 'youtube_analytics_api', 'long_only', 'cardClickRate', 'card_click_rate', 'no', 'not observed in current cache buckets', 'query directly or derive cardClicks/cardImpressions', 'long-form feature only', [DOCS.exhaustive, DOCS.categories]),
  row('Card Teaser Impressions', 'cardTeaserImpressions', 'metric', 'youtube_analytics_api', 'long_only', 'cardTeaserImpressions', '', 'no', 'not observed in current cache buckets', 'query long-form card teaser metrics', 'long-form feature only', [DOCS.categories]),
  row('Card Teaser Clicks', 'cardTeaserClicks', 'metric', 'youtube_analytics_api', 'long_only', 'cardTeaserClicks', '', 'no', 'not observed in current cache buckets', 'query long-form card teaser metrics', 'long-form feature only', [DOCS.categories]),
  row('Card Teaser Click Rate', 'cardTeaserClickRate', 'metric', 'youtube_analytics_api', 'long_only', 'cardTeaserClickRate', '', 'no', 'not observed in current cache buckets', 'query directly where supported', 'long-form feature only', [DOCS.categories]),
  row('End Screen Element Impressions', 'endScreenElementImpressions', 'metric', 'youtube_analytics_api', 'long_only', 'endScreenElementImpressions', 'end_screen_element_impressions', 'yes', 'canonical metric in app contract (endScreenClickRate computed from impressions+clicks where available)', 'ensure explicit ingestion in analytics query group', 'long-form feature only', [DOCS.exhaustive, DOCS.processing]),
  row('End Screen Element Clicks', 'endScreenElementClicks', 'metric', 'youtube_analytics_api', 'long_only', 'endScreenElementClicks', 'end_screen_element_clicks', 'partial', 'used for derived endScreenClickRate; not always present in current rows', 'add explicit metric collection and fallback derivation', 'long-form feature only', [DOCS.exhaustive, DOCS.processing]),
  row('End Screen Click Rate', 'endScreenClickRate', 'metric', 'youtube_analytics_api', 'long_only', 'endScreenClickRate', '', 'yes', 'derived in canonical metric registry', 'derive from clicks/impressions if raw missing', 'long-form feature only', [DOCS.exhaustive, DOCS.processing]),

  // Annotation legacy set
  row('Annotation Click Through Rate', 'annotationClickThroughRate', 'metric', 'youtube_analytics_api', 'long_only', 'annotationClickThroughRate', 'annotation_click_through_rate', 'no', 'not observed in current cache buckets', 'query legacy annotation metrics only for historical windows', 'annotations sunset in 2019', [DOCS.exhaustive, DOCS.categories]),
  row('Annotation Close Rate', 'annotationCloseRate', 'metric', 'youtube_analytics_api', 'long_only', 'annotationCloseRate', 'annotation_close_rate', 'no', 'not observed in current cache buckets', 'query legacy annotation metrics only for historical windows', 'annotations sunset in 2019', [DOCS.exhaustive, DOCS.categories]),
  row('Annotation Clickable Impressions', 'annotationClickableImpressions', 'metric', 'youtube_analytics_api', 'long_only', 'annotationClickableImpressions', 'annotation_clickable_impressions', 'no', 'not observed in current cache buckets', 'query legacy annotation metrics only for historical windows', 'annotations sunset in 2019', [DOCS.categories]),
  row('Annotation Clicks', 'annotationClicks', 'metric', 'youtube_analytics_api', 'long_only', 'annotationClicks', 'annotation_clicks', 'no', 'not observed in current cache buckets', 'query legacy annotation metrics only for historical windows', 'annotations sunset in 2019', [DOCS.categories]),
  row('Annotation Closable Impressions', 'annotationClosableImpressions', 'metric', 'youtube_analytics_api', 'long_only', 'annotationClosableImpressions', 'annotation_closable_impressions', 'no', 'not observed in current cache buckets', 'query legacy annotation metrics only for historical windows', 'annotations sunset in 2019', [DOCS.categories]),
  row('Annotation Closes', 'annotationCloses', 'metric', 'youtube_analytics_api', 'long_only', 'annotationCloses', 'annotation_closes', 'no', 'not observed in current cache buckets', 'query legacy annotation metrics only for historical windows', 'annotations sunset in 2019', [DOCS.categories]),
  row('Annotation Impressions', 'annotationImpressions', 'metric', 'youtube_analytics_api', 'long_only', 'annotationImpressions', 'annotation_impressions', 'no', 'not observed in current cache buckets', 'query legacy annotation metrics only for historical windows', 'annotations sunset in 2019', [DOCS.categories]),

  // Playlist + engagement metrics
  row('Playlist Views', 'playlistViews', 'metric', 'youtube_analytics_api', 'video_shared', 'playlistViews', '', 'no', 'not observed in current cache buckets', 'query reports with playlist dimensions and metric playlistViews', 'playlist dimension required', [DOCS.categories]),
  row('Average Time in Playlist', 'averageTimeInPlaylist', 'metric', 'youtube_analytics_api', 'video_shared', 'averageTimeInPlaylist', '', 'no', 'not observed in current cache buckets', 'query playlist report family', 'playlist context only', [DOCS.categories]),
  row('Playlist Average View Duration', 'playlistAverageViewDuration', 'metric', 'youtube_analytics_api', 'video_shared', 'playlistAverageViewDuration', '', 'no', 'not observed in current cache buckets', 'query playlist report family', 'playlist context only', [DOCS.categories]),
  row('Playlist Estimated Minutes Watched', 'playlistEstimatedMinutesWatched', 'metric', 'youtube_analytics_api', 'video_shared', 'playlistEstimatedMinutesWatched', '', 'no', 'not observed in current cache buckets', 'query playlist report family', 'playlist context only', [DOCS.categories]),
  row('Playlist Saves Added', 'playlistSavesAdded', 'metric', 'youtube_analytics_api', 'video_shared', 'playlistSaves', 'playlist_saves_added', 'no', 'not observed in current cache buckets', 'query playlist metric set and split added/removed', 'playlist context only', [DOCS.categories]),
  row('Playlist Saves Removed', 'playlistSavesRemoved', 'metric', 'youtube_analytics_api', 'video_shared', 'playlistSaves', 'playlist_saves_removed', 'no', 'not observed in current cache buckets', 'query playlist metric set and split added/removed', 'playlist context only', [DOCS.categories]),
  row('Playlist Starts', 'playlistStarts', 'metric', 'youtube_analytics_api', 'video_shared', 'playlistStarts', 'playlist_starts', 'no', 'not observed in current cache buckets', 'query playlist report family', 'playlist context only', [DOCS.categories]),
  row('Videos Added To Playlists', 'videosAddedToPlaylists', 'metric', 'youtube_analytics_api', 'video_shared', 'videosAddedToPlaylists', '', 'no', 'not observed in current cache buckets', 'query engagement report for playlist actions', '', [DOCS.categories]),
  row('Videos Removed From Playlists', 'videosRemovedFromPlaylists', 'metric', 'youtube_analytics_api', 'video_shared', 'videosRemovedFromPlaylists', '', 'no', 'not observed in current cache buckets', 'query engagement report for playlist actions', '', [DOCS.categories]),
  row('Views Per Playlist Start', 'viewsPerPlaylistStart', 'metric', 'youtube_analytics_api', 'video_shared', 'viewsPerPlaylistStart', '', 'no', 'not observed in current cache buckets', 'query playlist report family', 'playlist context only', [DOCS.categories]),
  row('Membership Cancellation Survey Responses', 'membershipsCancellationSurveyResponses', 'metric', 'youtube_analytics_api', 'channel', 'membershipsCancellationSurveyResponses', '', 'no', 'not observed in current cache buckets', 'query channel-level membership metrics where supported', 'channel membership eligibility required', [DOCS.categories]),

  // Livestream metrics
  row('Average Concurrent Viewers', 'averageConcurrentViewers', 'metric', 'youtube_analytics_api', 'long_only', 'averageConcurrentViewers', '', 'no', 'not observed in current cache buckets', 'query live stream metric set', 'live-only availability', [DOCS.categories]),
  row('Peak Concurrent Viewers', 'peakConcurrentViewers', 'metric', 'youtube_analytics_api', 'long_only', 'peakConcurrentViewers', '', 'no', 'not observed in current cache buckets', 'query live stream metric set', 'live-only availability', [DOCS.categories]),

  // Additional dimensions from category list
  row('Ad Type', 'adType', 'dimension', 'youtube_analytics_api', 'monetization', 'adType', '', 'no', 'not observed in current cache buckets', 'query monetization reports with dimensions=adType', 'monetization scope required', [DOCS.categories]),
  row('Audience Type', 'audienceType', 'dimension', 'youtube_analytics_api', 'retention', 'audienceType', 'audience_retention_type', 'no', 'not observed in current cache buckets', 'query retention reports with dimensions=audienceType', '', [DOCS.categories]),
  row('Claimed Status', 'claimedStatus', 'dimension', 'youtube_analytics_api', 'monetization', 'claimedStatus', 'claimed_status', 'no', 'not observed in current cache buckets', 'query content-owner style reports where supported', 'often content-owner context', [DOCS.categories]),
  row('Insight Playback Location Type', 'insightPlaybackLocationType', 'dimension', 'youtube_analytics_api', 'device', 'insightPlaybackLocationType', '', 'no', 'not observed in current cache buckets', 'query insight dimensions where still supported', 'legacy/compatibility risk', [DOCS.categories]),
  row('Insight Playback Location Detail', 'insightPlaybackLocationDetail', 'dimension', 'youtube_analytics_api', 'device', 'insightPlaybackLocationDetail', '', 'no', 'not observed in current cache buckets', 'query insight dimensions where still supported', 'legacy/compatibility risk', [DOCS.categories]),
  row('Insight Traffic Source Type', 'insightTrafficSourceType', 'dimension', 'youtube_analytics_api', 'traffic', 'insightTrafficSourceType', '', 'no', 'not observed in current cache buckets', 'query insight dimensions where still supported', 'legacy/compatibility risk', [DOCS.categories]),
  row('Insight Traffic Source Detail', 'insightTrafficSourceDetail', 'dimension', 'youtube_analytics_api', 'traffic', 'insightTrafficSourceDetail', '', 'no', 'not observed in current cache buckets', 'query insight dimensions where still supported', 'legacy/compatibility risk', [DOCS.categories]),
  row('Playlist Dimension', 'playlist', 'dimension', 'youtube_analytics_api', 'video_shared', 'playlist', 'playlist_id', 'no', 'not observed in current cache buckets', 'query dimensions=playlist for playlist-focused reports', '', [DOCS.categories]),
  row('Uploader Type', 'uploaderType', 'dimension', 'youtube_analytics_api', 'channel', 'uploaderType', 'uploader_type', 'no', 'not observed in current cache buckets', 'query dimensions=uploaderType for eligible reports', '', [DOCS.categories]),
  row('Sharing Service', 'sharingService', 'dimension', 'youtube_analytics_api', 'traffic', 'sharingService', 'sharing_service', 'no', 'not observed in current cache buckets', 'query share-service breakdown reports', '', [DOCS.categories]),
  row('YouTube Product', 'youtubeProduct', 'dimension', 'youtube_analytics_api', 'traffic', 'youtubeProduct', '', 'no', 'not observed in current cache buckets', 'query dimensions=youtubeProduct where supported', 'dimension support varies by report', [DOCS.categories]),

  // Reporting API only financial fields
  row('Asset ID', 'asset_id', 'field', 'youtube_reporting_api', 'monetization', '', 'asset_id', 'no', 'not ingested in current ViewTube sync', 'create/reporting jobs endpoint + daily CSV ingest + warehouse parser', 'reporting API job required; monetized/content-owner contexts', [DOCS.exhaustive, DOCS.reportingPdf]),
  row('Claim ID', 'claim_id', 'field', 'youtube_reporting_api', 'monetization', '', 'claim_id', 'no', 'not ingested in current ViewTube sync', 'create/reporting jobs endpoint + daily CSV ingest + warehouse parser', 'reporting API job required; content-owner contexts', [DOCS.exhaustive, DOCS.reportingPdf]),
  row('YouTube Revenue Split', 'youtube_revenue_split', 'field', 'youtube_reporting_api', 'monetization', '', 'youtube_revenue_split', 'no', 'not ingested in current ViewTube sync', 'ingest system-managed financial CSV reports', 'reporting API financial report only; auto-delete window', [DOCS.exhaustive, DOCS.reportingPdf]),
  row('Partner Revenue', 'partner_revenue', 'field', 'youtube_reporting_api', 'monetization', '', 'partner_revenue', 'no', 'not ingested in current ViewTube sync', 'ingest system-managed financial CSV reports', 'reporting API financial report only', [DOCS.exhaustive, DOCS.reportingPdf]),
  row('Adjustment Type', 'adjustment_type', 'field', 'youtube_reporting_api', 'monetization', '', 'adjustment_type', 'no', 'not ingested in current ViewTube sync', 'ingest system-managed financial CSV reports', 'reporting API financial report only', [DOCS.exhaustive, DOCS.reportingPdf]),
  row('Asset Policy Monetize Territories', 'asset_policy_monetize', 'field', 'youtube_reporting_api', 'monetization', '', 'asset_policy_monetize', 'no', 'not ingested in current ViewTube sync', 'ingest system-managed financial CSV reports', 'reporting API financial report only', [DOCS.exhaustive, DOCS.reportingPdf]),
  row('Asset Policy Block Territories', 'asset_policy_block', 'field', 'youtube_reporting_api', 'monetization', '', 'asset_policy_block', 'no', 'not ingested in current ViewTube sync', 'ingest system-managed financial CSV reports', 'reporting API financial report only', [DOCS.exhaustive, DOCS.reportingPdf]),
  row('Asset Policy Track Territories', 'asset_policy_track', 'field', 'youtube_reporting_api', 'monetization', '', 'asset_policy_track', 'no', 'not ingested in current ViewTube sync', 'ingest system-managed financial CSV reports', 'reporting API financial report only', [DOCS.exhaustive, DOCS.reportingPdf]),
  row('Claim Type', 'claim_type', 'field', 'youtube_reporting_api', 'monetization', '', 'claim_type', 'no', 'not ingested in current ViewTube sync', 'ingest system-managed financial CSV reports', 'reporting API financial report only', [DOCS.exhaustive, DOCS.reportingPdf]),
  row('Claim Status', 'claim_status', 'field', 'youtube_reporting_api', 'monetization', '', 'claim_status', 'no', 'not ingested in current ViewTube sync', 'ingest system-managed financial CSV reports', 'reporting API financial report only', [DOCS.exhaustive, DOCS.reportingPdf]),
  row('Auction Ad Revenue', 'estimated_partner_ad_auction_revenue', 'field', 'youtube_reporting_api', 'monetization', '', 'estimated_partner_ad_auction_revenue', 'no', 'not ingested in current ViewTube sync', 'ingest reporting financial datasets', 'reporting API only', [DOCS.categories, DOCS.reportingPdf]),
  row('Reserved Ad Revenue', 'estimated_partner_ad_reserved_revenue', 'field', 'youtube_reporting_api', 'monetization', '', 'estimated_partner_ad_reserved_revenue', 'no', 'not ingested in current ViewTube sync', 'ingest reporting financial datasets', 'reporting API only', [DOCS.categories, DOCS.reportingPdf]),
  row('Transaction Revenue', 'estimated_partner_transaction_revenue', 'field', 'youtube_reporting_api', 'monetization', '', 'estimated_partner_transaction_revenue', 'no', 'not ingested in current ViewTube sync', 'ingest reporting financial datasets', 'reporting API only', [DOCS.categories, DOCS.reportingPdf]),

  // Shorts unique / currently unavailable via public API
  row('Stayed To Watch Percent', 'stayedToWatch', 'metric', 'youtube_analytics_api', 'short_only', 'stayedToWatch', '', 'partial', 'canonical metric exists in app contract but often unavailable in API payloads', 'if unavailable via API, keep nullable and ingest from export/manual studio snapshot if provided', 'shorts-specific studio availability varies by endpoint', [DOCS.exhaustive, DOCS.videoType, DOCS.ecosystem]),
  row('Shorts Funnel Swipe Away Rate', 'shortsSwipeAwayRate', 'metric', 'youtube_analytics_api', 'short_only', '', '', 'no', 'not in current cache and documented as unavailable via public API', 'only obtainable from YouTube Studio UI exports/manual capture', 'not available via public analytics endpoint', [DOCS.exhaustive, DOCS.ecosystem]),
  row('Shorts Funnel Percent Watched', 'shortsPercentWatched', 'metric', 'youtube_analytics_api', 'short_only', '', '', 'no', 'not in current cache and documented as unavailable via public API', 'only obtainable from YouTube Studio UI exports/manual capture', 'not available via public analytics endpoint', [DOCS.exhaustive, DOCS.ecosystem]),
  row('Remixes of Your Content', 'shortsRemixCount', 'metric', 'youtube_analytics_api', 'short_only', '', '', 'no', 'not in current cache and documented as unavailable via public API', 'track manually from Studio until API support exists', 'not available via public API', [DOCS.exhaustive, DOCS.ecosystem]),

  // GA4 coverage categories
  row('GA4 Users', 'ga4.users', 'metric', 'ga4', 'channel', '', '', 'yes', 'ga4_analytics_cache.overview', '', 'depends on GA4 property linkage', [DOCS.flow, DOCS.ecosystem]),
  row('GA4 Sessions', 'ga4.sessions', 'metric', 'ga4', 'channel', '', '', 'yes', 'ga4_analytics_cache.overview', '', '', [DOCS.flow, DOCS.ecosystem]),
  row('GA4 Engaged Sessions', 'ga4.engagedSessions', 'metric', 'ga4', 'channel', '', '', 'yes', 'ga4_analytics_cache.overview', '', '', [DOCS.flow, DOCS.ecosystem]),
  row('GA4 Avg Session Duration', 'ga4.averageSessionDuration', 'metric', 'ga4', 'channel', '', '', 'yes', 'ga4_analytics_cache.overview', '', '', [DOCS.flow, DOCS.ecosystem]),
  row('GA4 Traffic Source', 'ga4.trafficSources', 'dimension', 'ga4', 'traffic', '', '', 'yes', 'ga4_analytics_cache.trafficSources', '', '', [DOCS.flow, DOCS.ecosystem]),
  row('GA4 Top Pages', 'ga4.topPages', 'dimension', 'ga4', 'traffic', '', '', 'yes', 'ga4_analytics_cache.topPages', '', '', [DOCS.flow, DOCS.ecosystem]),
  row('GA4 Conversions', 'ga4.conversions', 'metric', 'ga4', 'traffic', '', '', 'yes', 'ga4_analytics_cache.conversions', '', '', [DOCS.flow, DOCS.ecosystem]),
  row('GA4 Age Groups', 'ga4.demographics.ageGroups', 'dimension', 'ga4', 'demographic', '', '', 'yes', 'ga4_analytics_cache.demographics.ageGroups', '', '', [DOCS.flow, DOCS.ecosystem]),
  row('GA4 Countries', 'ga4.demographics.countries', 'dimension', 'ga4', 'geo', '', '', 'yes', 'ga4_analytics_cache.demographics.countries', '', '', [DOCS.flow, DOCS.ecosystem]),
  row('GA4 Cities', 'ga4.demographics.cities', 'dimension', 'ga4', 'geo', '', '', 'yes', 'ga4_analytics_cache.demographics.cities', '', '', [DOCS.flow, DOCS.ecosystem]),

  // Personal history placeholders
  row('YouTube Search History', 'youtubeSearchHistory', 'field', 'personal_history', 'history', '', '', 'no', 'not connected in current app state', 'ingest via user-provided Google Takeout exports + local parser and consented storage', 'no public YouTube API endpoint for full personal search history extraction', [DOCS.personal]),
  row('YouTube Watch History', 'youtubeWatchHistory', 'field', 'personal_history', 'history', '', '', 'no', 'not connected in current app state', 'ingest via Google Takeout watch-history export + parser', 'no public endpoint for full personal watch history extraction', [DOCS.personal]),
  row('Video Likes and Dislikes History', 'youtubeLikeDislikeHistory', 'field', 'personal_history', 'history', '', '', 'no', 'not connected in current app state', 'ingest via Google Takeout interaction exports', 'privacy/consent required; no direct public API for full historical interaction log', [DOCS.personal]),
  row('Comment Likes and Dislikes History', 'youtubeCommentLikeHistory', 'field', 'personal_history', 'history', '', '', 'no', 'not connected in current app state', 'ingest via Google Takeout interaction exports', 'privacy/consent required', [DOCS.personal]),
  row('Comments and Replies History', 'youtubeCommentsRepliesHistory', 'field', 'personal_history', 'history', '', '', 'no', 'not connected in current app state', 'ingest via Google Takeout interaction exports', 'privacy/consent required', [DOCS.personal]),
  row('Live Chat Messages History', 'youtubeLiveChatHistory', 'field', 'personal_history', 'history', '', '', 'no', 'not connected in current app state', 'ingest via Google Takeout interaction exports', 'privacy/consent required', [DOCS.personal]),
  row('Channel Subscription Events', 'youtubeSubscriptionHistory', 'field', 'personal_history', 'history', '', '', 'no', 'not connected in current app state', 'ingest via Google Takeout interaction exports', 'privacy/consent required', [DOCS.personal]),
  row('Community Post Interactions', 'youtubeCommunityPostHistory', 'field', 'personal_history', 'history', '', '', 'no', 'not connected in current app state', 'ingest via Google Takeout interaction exports', 'privacy/consent required', [DOCS.personal]),
  row('Sharing Activity History', 'youtubeSharingHistory', 'field', 'personal_history', 'history', '', '', 'no', 'not connected in current app state', 'ingest via Google Takeout interaction exports', 'privacy/consent required', [DOCS.personal]),
  row('Purchase Activity', 'youtubePurchaseHistory', 'field', 'personal_history', 'history', '', '', 'no', 'not connected in current app state', 'ingest via account export/payment records with explicit consent', 'privacy/financial sensitivity', [DOCS.personal]),
  row('Playlist Voting Activity', 'youtubePlaylistVotingHistory', 'field', 'personal_history', 'history', '', '', 'no', 'not connected in current app state', 'ingest via interaction export files', 'privacy/consent required', [DOCS.personal]),
  row('User Feedback Not Interested', 'youtubeFeedbackNotInterestedHistory', 'field', 'personal_history', 'history', '', '', 'no', 'not connected in current app state', 'ingest via exported activity files where available', 'privacy/consent required', [DOCS.personal]),
]

// sort for stability
rows.sort((a, b) => a.canonical_key.localeCompare(b.canonical_key))

const deduped = dedupe(rows)

writeCsv(deduped, csvPath)
writeCoverageMarkdown(deduped, mdPath)
writeBacklogMarkdown(deduped, backlogPath)

console.log(`Wrote ${deduped.length} rows:`)
console.log(`- ${csvPath}`)
console.log(`- ${mdPath}`)
console.log(`- ${backlogPath}`)

function row(category_name, canonical_key, kind, source_system, scope, api_name_camel, api_name_snake, received_now, evidence_of_receipt, how_to_receive_if_missing, constraints, where_documented) {
  return {
    category_name,
    canonical_key,
    kind,
    source_system,
    scope,
    api_name_camel,
    api_name_snake,
    where_documented: Array.from(new Set(where_documented)).join('; '),
    received_now,
    evidence_of_receipt,
    how_to_receive_if_missing,
    constraints,
  }
}

function dedupe(input) {
  const map = new Map()
  for (const r of input) {
    const key = `${r.canonical_key}::${r.source_system}`
    if (!map.has(key)) {
      map.set(key, r)
      continue
    }
    const prev = map.get(key)
    const merged = { ...prev }
    merged.where_documented = mergeStr(prev.where_documented, r.where_documented, '; ')
    merged.evidence_of_receipt = chooseLonger(prev.evidence_of_receipt, r.evidence_of_receipt)
    merged.how_to_receive_if_missing = chooseLonger(prev.how_to_receive_if_missing, r.how_to_receive_if_missing)
    merged.constraints = chooseLonger(prev.constraints, r.constraints)
    merged.received_now = preferStatus(prev.received_now, r.received_now)
    map.set(key, merged)
  }
  return Array.from(map.values())
}

function mergeStr(a, b, sep) {
  const vals = [...String(a || '').split(sep).map(s => s.trim()).filter(Boolean), ...String(b || '').split(sep).map(s => s.trim()).filter(Boolean)]
  return Array.from(new Set(vals)).join(sep + ' ')
}

function chooseLonger(a, b) {
  return String(b || '').length > String(a || '').length ? b : a
}

function preferStatus(a, b) {
  const rank = { yes: 4, partial: 3, unknown: 2, no: 1 }
  return rank[b] > rank[a] ? b : a
}

function writeCsv(data, target) {
  const headers = [
    'category_name',
    'canonical_key',
    'kind',
    'source_system',
    'scope',
    'api_name_camel',
    'api_name_snake',
    'where_documented',
    'received_now',
    'evidence_of_receipt',
    'how_to_receive_if_missing',
    'constraints',
  ]
  const lines = [headers.join(',')]
  for (const r of data) {
    lines.push(headers.map(h => csvEscape(r[h])).join(','))
  }
  fs.writeFileSync(target, lines.join('\n') + '\n', 'utf8')
}

function csvEscape(v) {
  const s = String(v ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replaceAll('"', '""') + '"'
  }
  return s
}

function writeCoverageMarkdown(data, target) {
  const byStatus = countBy(data, 'received_now')
  const bySource = countBy(data, 'source_system')
  const byScope = countBy(data, 'scope')

  const missingFeasible = data.filter(r => ['no', 'partial', 'unknown'].includes(r.received_now) && !isBlocked(r))
  const blocked = data.filter(r => isBlocked(r))

  const out = []
  out.push('# YOUTUBE DATA COVERAGE COMPLETE')
  out.push('')
  out.push('Generated from the current documentation corpus and ViewTube ingestion model references.')
  out.push('')
  out.push('## Internal Contracts')
  out.push('')
  out.push('```ts')
  out.push('type CoverageStatus = "yes" | "partial" | "no" | "unknown"')
  out.push('type DataCoverageRow = {')
  out.push('  category_name: string')
  out.push('  canonical_key: string')
  out.push('  kind: "metric" | "dimension" | "field"')
  out.push('  source_system: "youtube_data_api_v3" | "youtube_analytics_api" | "youtube_reporting_api" | "ga4" | "personal_history"')
  out.push('  scope: "channel" | "video_shared" | "short_only" | "long_only" | "geo" | "demographic" | "traffic" | "device" | "retention" | "monetization" | "history"')
  out.push('  api_name_camel: string')
  out.push('  api_name_snake: string')
  out.push('  where_documented: string')
  out.push('  received_now: CoverageStatus')
  out.push('  evidence_of_receipt: string')
  out.push('  how_to_receive_if_missing: string')
  out.push('  constraints: string')
  out.push('}')
  out.push('type AcquisitionPath = Pick<DataCoverageRow, "how_to_receive_if_missing" | "constraints">')
  out.push('```')
  out.push('')
  out.push('## Coverage Summary')
  out.push('')
  out.push(`- Total canonical rows: **${data.length}**`)
  out.push(`- Status counts: **yes=${byStatus.yes || 0}**, **partial=${byStatus.partial || 0}**, **no=${byStatus.no || 0}**, **unknown=${byStatus.unknown || 0}**`)
  out.push(`- Source counts: ${fmtMap(bySource)}`)
  out.push(`- Scope counts: ${fmtMap(byScope)}`)
  out.push('')
  out.push('## Conflict Ledger')
  out.push('')
  out.push('| Conflict Topic | Conflict | Resolution Applied |')
  out.push('|---|---|---|')
  out.push('| Shorts views semantics | Docs describe post-2025 auto-play/loop behavior while historical rows may have old semantics. | Keep `views` canonical; annotate interpretation by date window and pair with `engagedViews`. |')
  out.push('| `viewerPercentage` naming | Appears as `viewerPercentage` and `views_percentage`. | Canonical key = `viewerPercentage`; snake retained in `api_name_snake`. |')
  out.push('| `creatorContentType` compatibility | Docs define it as preferred, current runtime shows 400 for some query combinations. | Marked `partial`; acquisition path requires compatible dimension/metric combinations and fallback heuristics. |')
  out.push('| RPM availability | Appears as creator KPI but is not stable raw API metric in all docs. | Kept as derived canonical metric (`estimatedRevenue / views * 1000`). |')
  out.push('| Personal history categories | Valuable analytics categories but not in standard YouTube Analytics API. | Included under `personal_history` with explicit Takeout/manual ingestion path. |')
  out.push('| Reporting API financial fields | Mentioned in docs but not in current sync pipeline. | Marked `no`; require Reporting API jobs and warehouse ingestion. |')
  out.push('')
  out.push('## Full Canonical Table')
  out.push('')
  out.push('| Category | Canonical Key | Kind | Source | Scope | Camel | Snake | Received | Evidence | Acquisition Path if Missing | Constraints |')
  out.push('|---|---|---|---|---|---|---|---|---|---|---|')
  for (const r of data) {
    out.push(`| ${md(r.category_name)} | ${md(r.canonical_key)} | ${md(r.kind)} | ${md(r.source_system)} | ${md(r.scope)} | ${md(r.api_name_camel || '-')} | ${md(r.api_name_snake || '-')} | ${md(r.received_now)} | ${md(r.evidence_of_receipt || '-')} | ${md(r.how_to_receive_if_missing || '-')} | ${md(r.constraints || '-')} |`)
  }
  out.push('')
  out.push('## Missing But Feasible Now')
  out.push('')
  out.push(`Rows: **${missingFeasible.length}**`)
  out.push('')
  out.push('| Canonical Key | Source | Scope | Next Acquisition Step |')
  out.push('|---|---|---|---|')
  for (const r of missingFeasible.slice(0, 80)) {
    out.push(`| ${md(r.canonical_key)} | ${md(r.source_system)} | ${md(r.scope)} | ${md(r.how_to_receive_if_missing || 'Define endpoint+params and implement fetch pass')} |`)
  }
  out.push('')
  out.push('## Blocked or Not Currently Feasible')
  out.push('')
  out.push(`Rows: **${blocked.length}**`)
  out.push('')
  out.push('| Canonical Key | Source | Why Blocked |')
  out.push('|---|---|---|')
  for (const r of blocked) {
    out.push(`| ${md(r.canonical_key)} | ${md(r.source_system)} | ${md(r.constraints || 'no direct public endpoint')} |`)
  }
  out.push('')
  out.push('## Source Files Used')
  out.push('')
  const sources = Array.from(new Set(data.flatMap(r => r.where_documented.split(';').map(s => s.trim()).filter(Boolean))))
  for (const s of sources) out.push(`- ${s}`)
  out.push('')
  out.push('## Notes On PDF Inputs')
  out.push('')
  out.push('- PDF claims were reconciled at file-level references in this pass where line-level extraction was unavailable in the current environment.')

  fs.writeFileSync(target, out.join('\n') + '\n', 'utf8')
}

function writeBacklogMarkdown(data, target) {
  const out = []
  out.push('# SITE IMPROVEMENT INTELLIGENCE BACKLOG')
  out.push('')
  out.push('Prioritized execution backlog generated from documentation synthesis + current data coverage status.')
  out.push('')
  out.push('## Top High-Value Insights')
  out.push('')
  out.push('- Shorts and long-form need explicit semantic separation for interpretation (especially `views`, CTR, and monetization).')
  out.push('- The current sync gets strong channel/video baseline coverage but misses most advanced segmentation dimensions (device, geo depth, retention curves).')
  out.push('- Monetization and Reporting API financial fields are incomplete; this limits revenue diagnostics and reconciliation workflows.')
  out.push('- Personal history signals are product-valuable but need a consented ingestion path (e.g., Takeout import) rather than direct API assumptions.')
  out.push('- Query compatibility and 400 handling must be made first-class (metric grouping + adaptive fallback + unsupported-metric memory).')
  out.push('')

  out.push('## P0 Backlog (Stabilize and Unblock)')
  out.push('')
  out.push('### P0-1: Build query compatibility matrix and adaptive fetch scheduler')
  out.push('- User value / business impact: eliminates noisy 400s and increases trust in “received vs missing” state.')
  out.push('- Data dependencies: `videoThumbnailImpressions`, `videoThumbnailImpressionsClickRate`, `creatorContentType`, monetization metrics.')
  out.push('- UI/module target: analytics sync service + Data Coverage table status confidence.')
  out.push('- Implementation notes: store `(dimension set + metric set)` compatibility cache; preflight known-bad combinations; degrade to scalar or channel rollup.')
  out.push('- Acceptance criteria: repeated 400 loops eliminated; failed combinations logged once with reason; coverage rows show deterministic status.')
  out.push('- Risk/constraint flags: YouTube API behavior varies by channel eligibility and window.')
  out.push('')

  out.push('### P0-2: Complete canonical ingestion map for current API-only stack')
  out.push('- User value / business impact: “every category” table reflects true ingest reality and prevents phantom fields.')
  out.push('- Data dependencies: all `yes/partial/no` rows in `YOUTUBE_DATA_COVERAGE_COMPLETE.csv`.')
  out.push('- UI/module target: data coverage inventory builder + performance data manager table.')
  out.push('- Implementation notes: map each canonical key to source bucket and transform rule; enforce one canonical key and alias collapse.')
  out.push('- Acceptance criteria: no duplicate canonical keys in UI; each row has stable evidence source label.')
  out.push('- Risk/constraint flags: legacy aliases and non-core metric naming drift.')
  out.push('')

  out.push('### P0-3: Add confidence metadata for each category in UI')
  out.push('- User value / business impact: clarifies whether a category is missing due to API limits vs implementation gaps.')
  out.push('- Data dependencies: `received_now`, `constraints`, `how_to_receive_if_missing`.')
  out.push('- UI/module target: Data Coverage table chips/legend + filtering.')
  out.push('- Implementation notes: render confidence badges (`ingested`, `partial`, `blocked`, `planned`).')
  out.push('- Acceptance criteria: users can filter to “feasible missing now” and “blocked by API/policy”.')
  out.push('- Risk/constraint flags: requires ongoing curation as YouTube API evolves.')
  out.push('')

  out.push('## P1 Backlog (High-Value Expansion)')
  out.push('')
  out.push('### P1-1: Add retention analytics pass (long-form)')
  out.push('- User value / business impact: unlocks hook/drop-off intelligence and stronger content optimization recommendations.')
  out.push('- Data dependencies: `elapsedVideoTimeRatio`, `audienceWatchRatio`, `relativeRetentionPerformance`.')
  out.push('- UI/module target: Performance Hub retention panel and insight cards.')
  out.push('- Implementation notes: separate retention endpoint pass; store sampled curve points for performant rendering.')
  out.push('- Acceptance criteria: at least one retention chart with exportable points per long-form video.')
  out.push('- Risk/constraint flags: not meaningful for Shorts; window/row size expansion.')
  out.push('')

  out.push('### P1-2: Add device/playback segmentation pass')
  out.push('- User value / business impact: actionable packaging decisions by platform (mobile vs TV vs desktop).')
  out.push('- Data dependencies: `deviceType`, `operatingSystem`, `playbackLocationType`, `playbackLocationDetail`.')
  out.push('- UI/module target: audience context widgets and comparison charts.')
  out.push('- Implementation notes: introduce scoped fetch jobs and aggregated storage for segment pivots.')
  out.push('- Acceptance criteria: per-window breakdown tables render without affecting existing sync reliability.')
  out.push('- Risk/constraint flags: privacy thresholds and row cardinality growth.')
  out.push('')

  out.push('### P1-3: Add advanced geography depth')
  out.push('- User value / business impact: better targeting by region and market-level strategy.')
  out.push('- Data dependencies: `continent`, `subContinent`, `province`, `city` + `country` baseline.')
  out.push('- UI/module target: Global Footprint graph family.')
  out.push('- Implementation notes: city-id lookup mapping and suppression handling for sparse buckets.')
  out.push('- Acceptance criteria: geo drill-down works from country to available lower-level granularity.')
  out.push('- Risk/constraint flags: city/province often omitted under privacy thresholds.')
  out.push('')

  out.push('## P2 Backlog (Strategic Systems)')
  out.push('')
  out.push('### P2-1: Reporting API warehouse ingestion for financial reconciliation')
  out.push('- User value / business impact: enterprise-grade revenue traceability and adjustments analysis.')
  out.push('- Data dependencies: reporting-only fields (`asset_id`, `claim_id`, `partner_revenue`, adjustment/policy fields).')
  out.push('- UI/module target: finance/reconciliation station + policy impact audit.')
  out.push('- Implementation notes: scheduled Reporting API jobs, file retrieval, parser, and durable storage.')
  out.push('- Acceptance criteria: financial CSV datasets ingested and queryable with channel/date filters.')
  out.push('- Risk/constraint flags: monetization eligibility, report retention windows, content-owner constraints.')
  out.push('')

  out.push('### P2-2: Consent-driven personal history import pipeline')
  out.push('- User value / business impact: deeper personalization and creator behavior analytics.')
  out.push('- Data dependencies: `personal_history` rows in coverage catalog.')
  out.push('- UI/module target: optional personal analytics module and import wizard.')
  out.push('- Implementation notes: Google Takeout import format support, local parsing, explicit user consent controls.')
  out.push('- Acceptance criteria: user can import, review, and delete personal-history datasets from UI.')
  out.push('- Risk/constraint flags: privacy/legal compliance, encryption, retention policy.')
  out.push('')

  out.push('### P2-3: Insight quality engine (cross-metric diagnostics)')
  out.push('- User value / business impact: converts raw metrics into high-value strategic recommendations.')
  out.push('- Data dependencies: merged canonical metrics across views, engagement, retention, traffic, monetization.')
  out.push('- UI/module target: recommendation cards and weekly action reports.')
  out.push('- Implementation notes: rules + threshold framework, later upgrade to model-based scoring.')
  out.push('- Acceptance criteria: each recommendation references explicit metrics and confidence reasoning.')
  out.push('- Risk/constraint flags: false positives if upstream data completeness is low.')
  out.push('')

  out.push('## Execution QA Gates')
  out.push('')
  out.push('1. Canonical key uniqueness and alias collapse validated against coverage CSV.')
  out.push('2. Each backlog item references at least one canonical row from coverage artifact.')
  out.push('3. No P0 item depends on Reporting API or personal-history ingestion to be successful.')
  out.push('4. UI changes preserve existing route stability and do not regress sync baseline.')

  fs.writeFileSync(target, out.join('\n') + '\n', 'utf8')
}

function countBy(items, key) {
  const out = {}
  for (const it of items) {
    out[it[key]] = (out[it[key]] || 0) + 1
  }
  return out
}

function fmtMap(obj) {
  return Object.entries(obj)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `**${k}=${v}**`)
    .join(', ')
}

function isBlocked(r) {
  const c = String(r.constraints || '').toLowerCase()
  return c.includes('not available via public api') || r.source_system === 'personal_history'
}

function md(v) {
  return String(v ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ').trim()
}
