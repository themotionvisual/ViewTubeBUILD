# YOUTUBE DATA COVERAGE COMPLETE

Generated from the current documentation corpus and ViewTube ingestion model references.

## Internal Contracts

```ts
type CoverageStatus = "yes" | "partial" | "no" | "unknown"
type DataCoverageRow = {
  category_name: string
  canonical_key: string
  kind: "metric" | "dimension" | "field"
  source_system: "youtube_data_api_v3" | "youtube_analytics_api" | "youtube_reporting_api" | "ga4" | "personal_history"
  scope: "channel" | "video_shared" | "short_only" | "long_only" | "geo" | "demographic" | "traffic" | "device" | "retention" | "monetization" | "history"
  api_name_camel: string
  api_name_snake: string
  where_documented: string
  received_now: CoverageStatus
  evidence_of_receipt: string
  how_to_receive_if_missing: string
  constraints: string
}
type AcquisitionPath = Pick<DataCoverageRow, "how_to_receive_if_missing" | "constraints">
```

## Coverage Summary

- Total canonical rows: **135**
- Status counts: **yes=42**, **partial=15**, **no=78**, **unknown=0**
- Source counts: **ga4=10**, **personal_history=12**, **youtube_analytics_api=93**, **youtube_data_api_v3=7**, **youtube_reporting_api=13**
- Scope counts: **channel=18**, **demographic=5**, **device=6**, **geo=7**, **history=12**, **long_only=21**, **monetization=24**, **retention=2**, **short_only=5**, **traffic=9**, **video_shared=26**

## Conflict Ledger

| Conflict Topic | Conflict | Resolution Applied |
|---|---|---|
| Shorts views semantics | Docs describe post-2025 auto-play/loop behavior while historical rows may have old semantics. | Keep `views` canonical; annotate interpretation by date window and pair with `engagedViews`. |
| `viewerPercentage` naming | Appears as `viewerPercentage` and `views_percentage`. | Canonical key = `viewerPercentage`; snake retained in `api_name_snake`. |
| `creatorContentType` compatibility | Docs define it as preferred, current runtime shows 400 for some query combinations. | Marked `partial`; acquisition path requires compatible dimension/metric combinations and fallback heuristics. |
| RPM availability | Appears as creator KPI but is not stable raw API metric in all docs. | Kept as derived canonical metric (`estimatedRevenue / views * 1000`). |
| Personal history categories | Valuable analytics categories but not in standard YouTube Analytics API. | Included under `personal_history` with explicit Takeout/manual ingestion path. |
| Reporting API financial fields | Mentioned in docs but not in current sync pipeline. | Marked `no`; require Reporting API jobs and warehouse ingestion. |

## Full Canonical Table

| Category | Canonical Key | Kind | Source | Scope | Camel | Snake | Received | Evidence | Acquisition Path if Missing | Constraints |
|---|---|---|---|---|---|---|---|---|---|---|
| Ad Impressions | adImpressions | metric | youtube_analytics_api | monetization | adImpressions | ad_impressions | partial | documented but sparse in current rows | add dedicated monetization metric group and cache | requires monetization scope |
| Adjustment Type | adjustment_type | field | youtube_reporting_api | monetization | - | adjustment_type | no | not ingested in current ViewTube sync | ingest system-managed financial CSV reports | reporting API financial report only |
| Ad Type | adType | dimension | youtube_analytics_api | monetization | adType | - | no | not observed in current cache buckets | query monetization reports with dimensions=adType | monetization scope required |
| Age Group | ageGroup | dimension | youtube_analytics_api | demographic | ageGroup | age_group | yes | yt_analytics_cache.demographics rows | - | privacy-threshold omissions |
| Annotation Clickable Impressions | annotationClickableImpressions | metric | youtube_analytics_api | long_only | annotationClickableImpressions | annotation_clickable_impressions | no | not observed in current cache buckets | query legacy annotation metrics only for historical windows | annotations sunset in 2019 |
| Annotation Clicks | annotationClicks | metric | youtube_analytics_api | long_only | annotationClicks | annotation_clicks | no | not observed in current cache buckets | query legacy annotation metrics only for historical windows | annotations sunset in 2019 |
| Annotation Click Through Rate | annotationClickThroughRate | metric | youtube_analytics_api | long_only | annotationClickThroughRate | annotation_click_through_rate | no | not observed in current cache buckets | query legacy annotation metrics only for historical windows | annotations sunset in 2019 |
| Annotation Closable Impressions | annotationClosableImpressions | metric | youtube_analytics_api | long_only | annotationClosableImpressions | annotation_closable_impressions | no | not observed in current cache buckets | query legacy annotation metrics only for historical windows | annotations sunset in 2019 |
| Annotation Close Rate | annotationCloseRate | metric | youtube_analytics_api | long_only | annotationCloseRate | annotation_close_rate | no | not observed in current cache buckets | query legacy annotation metrics only for historical windows | annotations sunset in 2019 |
| Annotation Closes | annotationCloses | metric | youtube_analytics_api | long_only | annotationCloses | annotation_closes | no | not observed in current cache buckets | query legacy annotation metrics only for historical windows | annotations sunset in 2019 |
| Annotation Impressions | annotationImpressions | metric | youtube_analytics_api | long_only | annotationImpressions | annotation_impressions | no | not observed in current cache buckets | query legacy annotation metrics only for historical windows | annotations sunset in 2019 |
| Asset ID | asset_id | field | youtube_reporting_api | monetization | - | asset_id | no | not ingested in current ViewTube sync | create/reporting jobs endpoint + daily CSV ingest + warehouse parser | reporting API job required; monetized/content-owner contexts |
| Asset Policy Block Territories | asset_policy_block | field | youtube_reporting_api | monetization | - | asset_policy_block | no | not ingested in current ViewTube sync | ingest system-managed financial CSV reports | reporting API financial report only |
| Asset Policy Monetize Territories | asset_policy_monetize | field | youtube_reporting_api | monetization | - | asset_policy_monetize | no | not ingested in current ViewTube sync | ingest system-managed financial CSV reports | reporting API financial report only |
| Asset Policy Track Territories | asset_policy_track | field | youtube_reporting_api | monetization | - | asset_policy_track | no | not ingested in current ViewTube sync | ingest system-managed financial CSV reports | reporting API financial report only |
| Audience Type | audienceType | dimension | youtube_analytics_api | retention | audienceType | audience_retention_type | no | not observed in current cache buckets | query retention reports with dimensions=audienceType | - |
| Audience Watch Ratio | audienceWatchRatio | metric | youtube_analytics_api | long_only | audienceWatchRatio | audience_watch_ratio | no | not observed in current cache buckets | query with dimensions=elapsedVideoTimeRatio and long-form video filter | not meaningful/available for shorts |
| Average Concurrent Viewers | averageConcurrentViewers | metric | youtube_analytics_api | long_only | averageConcurrentViewers | - | no | not observed in current cache buckets | query live stream metric set | live-only availability |
| Average Time in Playlist | averageTimeInPlaylist | metric | youtube_analytics_api | video_shared | averageTimeInPlaylist | - | no | not observed in current cache buckets | query playlist report family | playlist context only |
| Average View Duration | averageViewDuration | metric | youtube_analytics_api | video_shared | averageViewDuration | average_view_duration_seconds | yes | derived/enriched in unified row + API source | - | - |
| Average View Percentage | averageViewPercentage | metric | youtube_analytics_api | video_shared | averageViewPercentage | average_view_duration_percentage | yes | derived/enriched in unified row + API source | - | - |
| Card Click Rate | cardClickRate | metric | youtube_analytics_api | long_only | cardClickRate | card_click_rate | no | not observed in current cache buckets | query directly or derive cardClicks/cardImpressions | long-form feature only |
| Card Clicks | cardClicks | metric | youtube_analytics_api | long_only | cardClicks | card_clicks | no | not observed in current cache buckets | query long-form card metrics | long-form feature only |
| Card Impressions | cardImpressions | metric | youtube_analytics_api | long_only | cardImpressions | card_impressions | no | not observed in current cache buckets | query long-form metrics for cards | long-form feature only |
| Card Teaser Click Rate | cardTeaserClickRate | metric | youtube_analytics_api | long_only | cardTeaserClickRate | - | no | not observed in current cache buckets | query directly where supported | long-form feature only |
| Card Teaser Clicks | cardTeaserClicks | metric | youtube_analytics_api | long_only | cardTeaserClicks | - | no | not observed in current cache buckets | query long-form card teaser metrics | long-form feature only |
| Card Teaser Impressions | cardTeaserImpressions | metric | youtube_analytics_api | long_only | cardTeaserImpressions | - | no | not observed in current cache buckets | query long-form card teaser metrics | long-form feature only |
| Casual Viewers | casualViewers | metric | youtube_analytics_api | channel | casualViewers | casual_viewers | yes | yt_analytics_cache.channelAnalytics rows | - | channel-level only |
| City | city | dimension | youtube_analytics_api | geo | city | city_id | no | not observed in current cache buckets | query dimensions=city and maintain city-id lookup mapping | heavy privacy suppression |
| Claim ID | claim_id | field | youtube_reporting_api | monetization | - | claim_id | no | not ingested in current ViewTube sync | create/reporting jobs endpoint + daily CSV ingest + warehouse parser | reporting API job required; content-owner contexts |
| Claim Status | claim_status | field | youtube_reporting_api | monetization | - | claim_status | no | not ingested in current ViewTube sync | ingest system-managed financial CSV reports | reporting API financial report only |
| Claim Type | claim_type | field | youtube_reporting_api | monetization | - | claim_type | no | not ingested in current ViewTube sync | ingest system-managed financial CSV reports | reporting API financial report only |
| Claimed Status | claimedStatus | dimension | youtube_analytics_api | monetization | claimedStatus | claimed_status | no | not observed in current cache buckets | query content-owner style reports where supported | often content-owner context |
| Comments | comments | metric | youtube_analytics_api | video_shared | comments | comments | yes | yt_analytics_cache.stats + master rows | - | - |
| Uploads Playlist ID | contentDetails.relatedPlaylists.uploads | field | youtube_data_api_v3 | channel | contentDetails.relatedPlaylists.uploads | - | yes | yt_analytics_cache.profile.contentDetails.relatedPlaylists.uploads | - | - |
| Continent | continent | dimension | youtube_analytics_api | geo | continent | continent_code | no | not observed in current cache buckets | query reports with dimensions=continent and supported metric sets | may be omitted by API/report variant |
| Country | country | dimension | youtube_analytics_api | geo | country | country_code | yes | yt_analytics_cache.demographics/geo breakdown | - | privacy-threshold omissions |
| CPM | cpm | metric | youtube_analytics_api | monetization | cpm | cpm | partial | partially present/derived in current pipeline | query cpm directly and retain derivation fallback | requires monetization scope |
| Creator Content Type | creatorContentType | dimension | youtube_analytics_api | video_shared | creatorContentType | creator_content_type | partial | current fetchVideoContentType attempts return 400 in logs; fallback to duration/format heuristics | query views by dimensions=video,creatorContentType OR use creatorContentType-only reports + join by video id where possible | dimension compatibility is limited; API may reject certain combinations |
| Device Type | deviceType | dimension | youtube_analytics_api | device | deviceType | device_type | no | not observed in current cache buckets | query reports with dimensions=deviceType | additional row explosion and privacy thresholds |
| Dislikes | dislikes | metric | youtube_analytics_api | video_shared | dislikes | dislikes | partial | documented in references; may be sparse/deprecated in current pipeline outputs | request metric where available and retain nullable handling | public UI hidden since 2021, creator-access may vary |
| Elapsed Video Time Ratio | elapsedVideoTimeRatio | dimension | youtube_analytics_api | retention | elapsedVideoTimeRatio | - | no | not observed in current cache buckets | add retention endpoint pass with dimensions=elapsedVideoTimeRatio | only meaningful for long-form retention |
| End Screen Click Rate | endScreenClickRate | metric | youtube_analytics_api | long_only | endScreenClickRate | - | yes | derived in canonical metric registry | derive from clicks/impressions if raw missing | long-form feature only |
| End Screen Element Clicks | endScreenElementClicks | metric | youtube_analytics_api | long_only | endScreenElementClicks | end_screen_element_clicks | partial | used for derived endScreenClickRate; not always present in current rows | add explicit metric collection and fallback derivation | long-form feature only |
| End Screen Element Impressions | endScreenElementImpressions | metric | youtube_analytics_api | long_only | endScreenElementImpressions | end_screen_element_impressions | yes | canonical metric in app contract (endScreenClickRate computed from impressions+clicks where available) | ensure explicit ingestion in analytics query group | long-form feature only |
| Engaged Views | engagedViews | metric | youtube_analytics_api | video_shared | engagedViews | engaged_views | yes | yt_analytics_cache.analyticsByWindow + master rows | - | - |
| Auction Ad Revenue | estimated_partner_ad_auction_revenue | field | youtube_reporting_api | monetization | - | estimated_partner_ad_auction_revenue | no | not ingested in current ViewTube sync | ingest reporting financial datasets | reporting API only |
| Reserved Ad Revenue | estimated_partner_ad_reserved_revenue | field | youtube_reporting_api | monetization | - | estimated_partner_ad_reserved_revenue | no | not ingested in current ViewTube sync | ingest reporting financial datasets | reporting API only |
| Transaction Revenue | estimated_partner_transaction_revenue | field | youtube_reporting_api | monetization | - | estimated_partner_transaction_revenue | no | not ingested in current ViewTube sync | ingest reporting financial datasets | reporting API only |
| Estimated Ad Revenue | estimatedAdRevenue | metric | youtube_analytics_api | monetization | estimatedAdRevenue | estimated_partner_ad_revenue | partial | documented but not guaranteed in all current windows/rows | request metric with monetary scope and nullable handling | requires monetization scope and eligible channel |
| Watch Time Minutes | estimatedMinutesWatched | metric | youtube_analytics_api | video_shared | estimatedMinutesWatched | watch_time_minutes | yes | yt_analytics_cache.analyticsByWindow + master rows | - | - |
| Estimated Premium Revenue | estimatedRedPartnerRevenue | metric | youtube_analytics_api | monetization | estimatedRedPartnerRevenue | estimated_partner_red_revenue | partial | documented; may be sparse by format/window | query with monetary scope; include fallback nulls | requires monetization scope |
| Estimated Revenue | estimatedRevenue | metric | youtube_analytics_api | monetization | estimatedRevenue | estimated_partner_revenue | yes | yt_analytics_cache.analyticsByWindow + merged rows | - | requires yt-analytics-monetary.readonly |
| GA4 Avg Session Duration | ga4.averageSessionDuration | metric | ga4 | channel | - | - | yes | ga4_analytics_cache.overview | - | - |
| GA4 Conversions | ga4.conversions | metric | ga4 | traffic | - | - | yes | ga4_analytics_cache.conversions | - | - |
| GA4 Age Groups | ga4.demographics.ageGroups | dimension | ga4 | demographic | - | - | yes | ga4_analytics_cache.demographics.ageGroups | - | - |
| GA4 Cities | ga4.demographics.cities | dimension | ga4 | geo | - | - | yes | ga4_analytics_cache.demographics.cities | - | - |
| GA4 Countries | ga4.demographics.countries | dimension | ga4 | geo | - | - | yes | ga4_analytics_cache.demographics.countries | - | - |
| GA4 Engaged Sessions | ga4.engagedSessions | metric | ga4 | channel | - | - | yes | ga4_analytics_cache.overview | - | - |
| GA4 Sessions | ga4.sessions | metric | ga4 | channel | - | - | yes | ga4_analytics_cache.overview | - | - |
| GA4 Top Pages | ga4.topPages | dimension | ga4 | traffic | - | - | yes | ga4_analytics_cache.topPages | - | - |
| GA4 Traffic Source | ga4.trafficSources | dimension | ga4 | traffic | - | - | yes | ga4_analytics_cache.trafficSources | - | - |
| GA4 Users | ga4.users | metric | ga4 | channel | - | - | yes | ga4_analytics_cache.overview | - | depends on GA4 property linkage |
| Gender | gender | dimension | youtube_analytics_api | demographic | gender | gender | yes | yt_analytics_cache.demographics rows | - | privacy-threshold omissions |
| Gross Revenue | grossRevenue | metric | youtube_analytics_api | monetization | grossRevenue | gross_revenue | partial | documented; not consistently surfaced in current master rows | add explicit metric group for grossRevenue | requires monetization scope |
| Channel ID | id | field | youtube_data_api_v3 | channel | id | - | yes | yt_analytics_cache.profile.id | - | - |
| Insight Playback Location Detail | insightPlaybackLocationDetail | dimension | youtube_analytics_api | device | insightPlaybackLocationDetail | - | no | not observed in current cache buckets | query insight dimensions where still supported | legacy/compatibility risk |
| Insight Playback Location Type | insightPlaybackLocationType | dimension | youtube_analytics_api | device | insightPlaybackLocationType | - | no | not observed in current cache buckets | query insight dimensions where still supported | legacy/compatibility risk |
| Insight Traffic Source Detail | insightTrafficSourceDetail | dimension | youtube_analytics_api | traffic | insightTrafficSourceDetail | - | no | not observed in current cache buckets | query insight dimensions where still supported | legacy/compatibility risk |
| Insight Traffic Source Type | insightTrafficSourceType | dimension | youtube_analytics_api | traffic | insightTrafficSourceType | - | no | not observed in current cache buckets | query insight dimensions where still supported | legacy/compatibility risk |
| Likes | likes | metric | youtube_analytics_api | video_shared | likes | likes | yes | yt_analytics_cache.stats + master rows | - | - |
| Live or On Demand | liveOrOnDemand | dimension | youtube_analytics_api | video_shared | liveOrOnDemand | live_or_on_demand | no | not observed in current cache buckets | query reports with dimensions=liveOrOnDemand | - |
| Membership Cancellation Survey Responses | membershipsCancellationSurveyResponses | metric | youtube_analytics_api | channel | membershipsCancellationSurveyResponses | - | no | not observed in current cache buckets | query channel-level membership metrics where supported | channel membership eligibility required |
| Monetized Playbacks | monetizedPlaybacks | metric | youtube_analytics_api | monetization | monetizedPlaybacks | monetized_playbacks | partial | documented but not always populated in current output | add explicit query + nullable fallback | requires monetization scope |
| New Viewers | newViewers | metric | youtube_analytics_api | channel | newViewers | new_viewers | yes | yt_analytics_cache.channelAnalytics rows | - | channel-level only |
| Operating System | operatingSystem | dimension | youtube_analytics_api | device | operatingSystem | operating_system | no | not observed in current cache buckets | query reports with dimensions=operatingSystem | support depends on report context |
| Partner Revenue | partner_revenue | field | youtube_reporting_api | monetization | - | partner_revenue | no | not ingested in current ViewTube sync | ingest system-managed financial CSV reports | reporting API financial report only |
| Peak Concurrent Viewers | peakConcurrentViewers | metric | youtube_analytics_api | long_only | peakConcurrentViewers | - | no | not observed in current cache buckets | query live stream metric set | live-only availability |
| Playback Based CPM | playbackBasedCpm | metric | youtube_analytics_api | monetization | playbackBasedCpm | playback_based_cpm | partial | documented but not always in active rows | request metric in monetization group | requires monetization scope |
| Playback Location Detail | playbackLocationDetail | dimension | youtube_analytics_api | device | playbackLocationDetail | playback_location_detail | no | not observed in current cache buckets | query reports with dimensions=playbackLocationDetail | detail mostly available for embedded contexts |
| Playback Location Type | playbackLocationType | dimension | youtube_analytics_api | device | playbackLocationType | playback_location_type | no | not observed in current cache buckets | query reports with dimensions=playbackLocationType | - |
| Playlist Dimension | playlist | dimension | youtube_analytics_api | video_shared | playlist | playlist_id | no | not observed in current cache buckets | query dimensions=playlist for playlist-focused reports | - |
| Playlist Average View Duration | playlistAverageViewDuration | metric | youtube_analytics_api | video_shared | playlistAverageViewDuration | - | no | not observed in current cache buckets | query playlist report family | playlist context only |
| Playlist Estimated Minutes Watched | playlistEstimatedMinutesWatched | metric | youtube_analytics_api | video_shared | playlistEstimatedMinutesWatched | - | no | not observed in current cache buckets | query playlist report family | playlist context only |
| Playlist Saves Added | playlistSavesAdded | metric | youtube_analytics_api | video_shared | playlistSaves | playlist_saves_added | no | not observed in current cache buckets | query playlist metric set and split added/removed | playlist context only |
| Playlist Saves Removed | playlistSavesRemoved | metric | youtube_analytics_api | video_shared | playlistSaves | playlist_saves_removed | no | not observed in current cache buckets | query playlist metric set and split added/removed | playlist context only |
| Playlist Starts | playlistStarts | metric | youtube_analytics_api | video_shared | playlistStarts | playlist_starts | no | not observed in current cache buckets | query playlist report family | playlist context only |
| Playlist Views | playlistViews | metric | youtube_analytics_api | video_shared | playlistViews | - | no | not observed in current cache buckets | query reports with playlist dimensions and metric playlistViews | playlist dimension required |
| Province | province | dimension | youtube_analytics_api | geo | province | province_code | no | not observed in current cache buckets | query reports with dimensions=province and geo-eligible metrics | privacy thresholds can suppress |
| Regular Viewers | regularViewers | metric | youtube_analytics_api | channel | regularViewers | regular_viewers | yes | yt_analytics_cache.channelAnalytics rows | - | channel-level only |
| Relative Retention Performance | relativeRetentionPerformance | metric | youtube_analytics_api | long_only | relativeRetentionPerformance | relative_retention_performance | no | not observed in current cache buckets | query with elapsedVideoTimeRatio for long-form | retention-only context |
| Returning Viewers | returningViewers | metric | youtube_analytics_api | channel | returningViewers | returning_viewers | yes | yt_analytics_cache.channelAnalytics rows | - | channel-level only |
| RPM | rpm | metric | youtube_analytics_api | monetization | - | - | yes | derived in dataForge/unified rows as revenue per 1000 views | if missing, compute from estimatedRevenue and views | derived metric, not raw API field |
| Shares | shares | metric | youtube_analytics_api | video_shared | shares | shares | yes | yt_analytics_cache.analyticsByWindow + master rows | - | - |
| Sharing Service | sharingService | dimension | youtube_analytics_api | traffic | sharingService | sharing_service | no | not observed in current cache buckets | query share-service breakdown reports | - |
| Shorts Funnel Percent Watched | shortsPercentWatched | metric | youtube_analytics_api | short_only | - | - | no | not in current cache and documented as unavailable via public API | only obtainable from YouTube Studio UI exports/manual capture | not available via public analytics endpoint |
| Remixes of Your Content | shortsRemixCount | metric | youtube_analytics_api | short_only | - | - | no | not in current cache and documented as unavailable via public API | track manually from Studio until API support exists | not available via public API |
| Shorts Funnel Swipe Away Rate | shortsSwipeAwayRate | metric | youtube_analytics_api | short_only | - | - | no | not in current cache and documented as unavailable via public API | only obtainable from YouTube Studio UI exports/manual capture | not available via public analytics endpoint |
| Profile Picture URL | snippet.thumbnails.default.url | field | youtube_data_api_v3 | channel | snippet.thumbnails.default.url | - | yes | yt_analytics_cache.profile.snippet.thumbnails | - | - |
| Channel Name | snippet.title | field | youtube_data_api_v3 | channel | snippet.title | - | yes | yt_analytics_cache.profile.snippet.title | - | - |
| Subscriber Count | statistics.subscriberCount | field | youtube_data_api_v3 | channel | statistics.subscriberCount | - | yes | yt_analytics_cache.profile.statistics.subscriberCount | - | snapshot value; hides if public subscriber count disabled |
| Total Videos | statistics.videoCount | field | youtube_data_api_v3 | channel | statistics.videoCount | - | yes | yt_analytics_cache.profile.statistics.videoCount | - | public+unlisted count only |
| Total Views | statistics.viewCount | field | youtube_data_api_v3 | channel | statistics.viewCount | - | yes | yt_analytics_cache.profile.statistics.viewCount | - | lifetime cumulative counter |
| Stayed To Watch Percent | stayedToWatch | metric | youtube_analytics_api | short_only | stayedToWatch | - | partial | canonical metric exists in app contract but often unavailable in API payloads | if unavailable via API, keep nullable and ingest from export/manual studio snapshot if provided | shorts-specific studio availability varies by endpoint |
| Sub Continent | subContinent | dimension | youtube_analytics_api | geo | subContinent | sub_continent_code | no | not observed in current cache buckets | query reports with dimensions=subContinent | report support varies |
| Subscribed Status | subscribedStatus | dimension | youtube_analytics_api | demographic | subscribedStatus | subscribed_status | no | not observed in current cache buckets | query reports with dimensions=subscribedStatus | - |
| Subscribers Gained | subscribersGained | metric | youtube_analytics_api | video_shared | subscribersGained | subscribers_gained | yes | yt_analytics_cache.analyticsByWindow + master rows | - | - |
| Subscribers Lost | subscribersLost | metric | youtube_analytics_api | video_shared | subscribersLost | subscribers_lost | yes | yt_analytics_cache.analyticsByWindow + master rows | - | - |
| Traffic Source Detail | trafficSourceDetail | dimension | youtube_analytics_api | traffic | trafficSourceDetail | traffic_source_detail | yes | yt_analytics_cache.trafficSources rows | - | detail granularity depends on source type |
| Traffic Source Type | trafficSourceType | dimension | youtube_analytics_api | traffic | trafficSourceType | traffic_source_type | yes | yt_analytics_cache.trafficSources rows | - | - |
| Traffic: End Screen | trafficSourceType.END_SCREEN | dimension | youtube_analytics_api | long_only | END_SCREEN | 20 | partial | only relevant where end screens exist | query traffic dimensions + long-form filter | long-form feature only |
| Traffic: Shorts Feed | trafficSourceType.SHORTS | dimension | youtube_analytics_api | short_only | SHORTS | 18 | partial | only present for shorts-heavy rows/content | query trafficSourceType with contentType/format segmentation | not meaningful for long-form |
| Unique Viewers | uniqueViewers | metric | youtube_analytics_api | channel | uniqueViewers | unique_viewers | yes | yt_analytics_cache.channelAnalytics rows | - | channel-level only |
| Uploader Type | uploaderType | dimension | youtube_analytics_api | channel | uploaderType | uploader_type | no | not observed in current cache buckets | query dimensions=uploaderType for eligible reports | - |
| Videos Added To Playlists | videosAddedToPlaylists | metric | youtube_analytics_api | video_shared | videosAddedToPlaylists | - | no | not observed in current cache buckets | query engagement report for playlist actions | - |
| Videos Removed From Playlists | videosRemovedFromPlaylists | metric | youtube_analytics_api | video_shared | videosRemovedFromPlaylists | - | no | not observed in current cache buckets | query engagement report for playlist actions | - |
| Video Thumbnail Impressions | videoThumbnailImpressions | metric | youtube_analytics_api | video_shared | videoThumbnailImpressions | video_thumbnail_impressions | partial | console shows repeated 400 on dimensions=video for this metric in some windows; fallback sometimes returns rows | query reports endpoint by window; fallback to channel-level + per-video retries; persist unsupported combination cache | metric availability varies by report/dimension/content type |
| Video Thumbnail CTR | videoThumbnailImpressionsClickRate | metric | youtube_analytics_api | video_shared | videoThumbnailImpressionsClickRate | video_thumbnail_impressions_ctr | partial | current sync logs 400 for several combinations; occasionally available | query as standalone metric group; fallback to calculated ctr when clicks/impressions available | non-core metric and short-feed behavior mismatch |
| Viewer Percentage | viewerPercentage | metric | youtube_analytics_api | demographic | viewerPercentage | views_percentage | yes | yt_analytics_cache.demographics rows | - | anonymous viewers excluded |
| Views | views | metric | youtube_analytics_api | video_shared | views | views | yes | yt_analytics_cache.analyticsByWindow + master rows | - | - |
| Views Per Playlist Start | viewsPerPlaylistStart | metric | youtube_analytics_api | video_shared | viewsPerPlaylistStart | - | no | not observed in current cache buckets | query playlist report family | playlist context only |
| YouTube Revenue Split | youtube_revenue_split | field | youtube_reporting_api | monetization | - | youtube_revenue_split | no | not ingested in current ViewTube sync | ingest system-managed financial CSV reports | reporting API financial report only; auto-delete window |
| Comment Likes and Dislikes History | youtubeCommentLikeHistory | field | personal_history | history | - | - | no | not connected in current app state | ingest via Google Takeout interaction exports | privacy/consent required |
| Comments and Replies History | youtubeCommentsRepliesHistory | field | personal_history | history | - | - | no | not connected in current app state | ingest via Google Takeout interaction exports | privacy/consent required |
| Community Post Interactions | youtubeCommunityPostHistory | field | personal_history | history | - | - | no | not connected in current app state | ingest via Google Takeout interaction exports | privacy/consent required |
| User Feedback Not Interested | youtubeFeedbackNotInterestedHistory | field | personal_history | history | - | - | no | not connected in current app state | ingest via exported activity files where available | privacy/consent required |
| Video Likes and Dislikes History | youtubeLikeDislikeHistory | field | personal_history | history | - | - | no | not connected in current app state | ingest via Google Takeout interaction exports | privacy/consent required; no direct public API for full historical interaction log |
| Live Chat Messages History | youtubeLiveChatHistory | field | personal_history | history | - | - | no | not connected in current app state | ingest via Google Takeout interaction exports | privacy/consent required |
| Playlist Voting Activity | youtubePlaylistVotingHistory | field | personal_history | history | - | - | no | not connected in current app state | ingest via interaction export files | privacy/consent required |
| YouTube Product | youtubeProduct | dimension | youtube_analytics_api | traffic | youtubeProduct | - | no | not observed in current cache buckets | query dimensions=youtubeProduct where supported | dimension support varies by report |
| Purchase Activity | youtubePurchaseHistory | field | personal_history | history | - | - | no | not connected in current app state | ingest via account export/payment records with explicit consent | privacy/financial sensitivity |
| YouTube Search History | youtubeSearchHistory | field | personal_history | history | - | - | no | not connected in current app state | ingest via user-provided Google Takeout exports + local parser and consented storage | no public YouTube API endpoint for full personal search history extraction |
| Sharing Activity History | youtubeSharingHistory | field | personal_history | history | - | - | no | not connected in current app state | ingest via Google Takeout interaction exports | privacy/consent required |
| Channel Subscription Events | youtubeSubscriptionHistory | field | personal_history | history | - | - | no | not connected in current app state | ingest via Google Takeout interaction exports | privacy/consent required |
| YouTube Watch History | youtubeWatchHistory | field | personal_history | history | - | - | no | not connected in current app state | ingest via Google Takeout watch-history export + parser | no public endpoint for full personal watch history extraction |

## Missing But Feasible Now

Rows: **80**

| Canonical Key | Source | Scope | Next Acquisition Step |
|---|---|---|---|
| adImpressions | youtube_analytics_api | monetization | add dedicated monetization metric group and cache |
| adjustment_type | youtube_reporting_api | monetization | ingest system-managed financial CSV reports |
| adType | youtube_analytics_api | monetization | query monetization reports with dimensions=adType |
| annotationClickableImpressions | youtube_analytics_api | long_only | query legacy annotation metrics only for historical windows |
| annotationClicks | youtube_analytics_api | long_only | query legacy annotation metrics only for historical windows |
| annotationClickThroughRate | youtube_analytics_api | long_only | query legacy annotation metrics only for historical windows |
| annotationClosableImpressions | youtube_analytics_api | long_only | query legacy annotation metrics only for historical windows |
| annotationCloseRate | youtube_analytics_api | long_only | query legacy annotation metrics only for historical windows |
| annotationCloses | youtube_analytics_api | long_only | query legacy annotation metrics only for historical windows |
| annotationImpressions | youtube_analytics_api | long_only | query legacy annotation metrics only for historical windows |
| asset_id | youtube_reporting_api | monetization | create/reporting jobs endpoint + daily CSV ingest + warehouse parser |
| asset_policy_block | youtube_reporting_api | monetization | ingest system-managed financial CSV reports |
| asset_policy_monetize | youtube_reporting_api | monetization | ingest system-managed financial CSV reports |
| asset_policy_track | youtube_reporting_api | monetization | ingest system-managed financial CSV reports |
| audienceType | youtube_analytics_api | retention | query retention reports with dimensions=audienceType |
| audienceWatchRatio | youtube_analytics_api | long_only | query with dimensions=elapsedVideoTimeRatio and long-form video filter |
| averageConcurrentViewers | youtube_analytics_api | long_only | query live stream metric set |
| averageTimeInPlaylist | youtube_analytics_api | video_shared | query playlist report family |
| cardClickRate | youtube_analytics_api | long_only | query directly or derive cardClicks/cardImpressions |
| cardClicks | youtube_analytics_api | long_only | query long-form card metrics |
| cardImpressions | youtube_analytics_api | long_only | query long-form metrics for cards |
| cardTeaserClickRate | youtube_analytics_api | long_only | query directly where supported |
| cardTeaserClicks | youtube_analytics_api | long_only | query long-form card teaser metrics |
| cardTeaserImpressions | youtube_analytics_api | long_only | query long-form card teaser metrics |
| city | youtube_analytics_api | geo | query dimensions=city and maintain city-id lookup mapping |
| claim_id | youtube_reporting_api | monetization | create/reporting jobs endpoint + daily CSV ingest + warehouse parser |
| claim_status | youtube_reporting_api | monetization | ingest system-managed financial CSV reports |
| claim_type | youtube_reporting_api | monetization | ingest system-managed financial CSV reports |
| claimedStatus | youtube_analytics_api | monetization | query content-owner style reports where supported |
| continent | youtube_analytics_api | geo | query reports with dimensions=continent and supported metric sets |
| cpm | youtube_analytics_api | monetization | query cpm directly and retain derivation fallback |
| creatorContentType | youtube_analytics_api | video_shared | query views by dimensions=video,creatorContentType OR use creatorContentType-only reports + join by video id where possible |
| deviceType | youtube_analytics_api | device | query reports with dimensions=deviceType |
| dislikes | youtube_analytics_api | video_shared | request metric where available and retain nullable handling |
| elapsedVideoTimeRatio | youtube_analytics_api | retention | add retention endpoint pass with dimensions=elapsedVideoTimeRatio |
| endScreenElementClicks | youtube_analytics_api | long_only | add explicit metric collection and fallback derivation |
| estimated_partner_ad_auction_revenue | youtube_reporting_api | monetization | ingest reporting financial datasets |
| estimated_partner_ad_reserved_revenue | youtube_reporting_api | monetization | ingest reporting financial datasets |
| estimated_partner_transaction_revenue | youtube_reporting_api | monetization | ingest reporting financial datasets |
| estimatedAdRevenue | youtube_analytics_api | monetization | request metric with monetary scope and nullable handling |
| estimatedRedPartnerRevenue | youtube_analytics_api | monetization | query with monetary scope; include fallback nulls |
| grossRevenue | youtube_analytics_api | monetization | add explicit metric group for grossRevenue |
| insightPlaybackLocationDetail | youtube_analytics_api | device | query insight dimensions where still supported |
| insightPlaybackLocationType | youtube_analytics_api | device | query insight dimensions where still supported |
| insightTrafficSourceDetail | youtube_analytics_api | traffic | query insight dimensions where still supported |
| insightTrafficSourceType | youtube_analytics_api | traffic | query insight dimensions where still supported |
| liveOrOnDemand | youtube_analytics_api | video_shared | query reports with dimensions=liveOrOnDemand |
| membershipsCancellationSurveyResponses | youtube_analytics_api | channel | query channel-level membership metrics where supported |
| monetizedPlaybacks | youtube_analytics_api | monetization | add explicit query + nullable fallback |
| operatingSystem | youtube_analytics_api | device | query reports with dimensions=operatingSystem |
| partner_revenue | youtube_reporting_api | monetization | ingest system-managed financial CSV reports |
| peakConcurrentViewers | youtube_analytics_api | long_only | query live stream metric set |
| playbackBasedCpm | youtube_analytics_api | monetization | request metric in monetization group |
| playbackLocationDetail | youtube_analytics_api | device | query reports with dimensions=playbackLocationDetail |
| playbackLocationType | youtube_analytics_api | device | query reports with dimensions=playbackLocationType |
| playlist | youtube_analytics_api | video_shared | query dimensions=playlist for playlist-focused reports |
| playlistAverageViewDuration | youtube_analytics_api | video_shared | query playlist report family |
| playlistEstimatedMinutesWatched | youtube_analytics_api | video_shared | query playlist report family |
| playlistSavesAdded | youtube_analytics_api | video_shared | query playlist metric set and split added/removed |
| playlistSavesRemoved | youtube_analytics_api | video_shared | query playlist metric set and split added/removed |
| playlistStarts | youtube_analytics_api | video_shared | query playlist report family |
| playlistViews | youtube_analytics_api | video_shared | query reports with playlist dimensions and metric playlistViews |
| province | youtube_analytics_api | geo | query reports with dimensions=province and geo-eligible metrics |
| relativeRetentionPerformance | youtube_analytics_api | long_only | query with elapsedVideoTimeRatio for long-form |
| sharingService | youtube_analytics_api | traffic | query share-service breakdown reports |
| shortsPercentWatched | youtube_analytics_api | short_only | only obtainable from YouTube Studio UI exports/manual capture |
| shortsSwipeAwayRate | youtube_analytics_api | short_only | only obtainable from YouTube Studio UI exports/manual capture |
| stayedToWatch | youtube_analytics_api | short_only | if unavailable via API, keep nullable and ingest from export/manual studio snapshot if provided |
| subContinent | youtube_analytics_api | geo | query reports with dimensions=subContinent |
| subscribedStatus | youtube_analytics_api | demographic | query reports with dimensions=subscribedStatus |
| trafficSourceType.END_SCREEN | youtube_analytics_api | long_only | query traffic dimensions + long-form filter |
| trafficSourceType.SHORTS | youtube_analytics_api | short_only | query trafficSourceType with contentType/format segmentation |
| uploaderType | youtube_analytics_api | channel | query dimensions=uploaderType for eligible reports |
| videosAddedToPlaylists | youtube_analytics_api | video_shared | query engagement report for playlist actions |
| videosRemovedFromPlaylists | youtube_analytics_api | video_shared | query engagement report for playlist actions |
| videoThumbnailImpressions | youtube_analytics_api | video_shared | query reports endpoint by window; fallback to channel-level + per-video retries; persist unsupported combination cache |
| videoThumbnailImpressionsClickRate | youtube_analytics_api | video_shared | query as standalone metric group; fallback to calculated ctr when clicks/impressions available |
| viewsPerPlaylistStart | youtube_analytics_api | video_shared | query playlist report family |
| youtube_revenue_split | youtube_reporting_api | monetization | ingest system-managed financial CSV reports |
| youtubeProduct | youtube_analytics_api | traffic | query dimensions=youtubeProduct where supported |

## Blocked or Not Currently Feasible

Rows: **13**

| Canonical Key | Source | Why Blocked |
|---|---|---|
| shortsRemixCount | youtube_analytics_api | not available via public API |
| youtubeCommentLikeHistory | personal_history | privacy/consent required |
| youtubeCommentsRepliesHistory | personal_history | privacy/consent required |
| youtubeCommunityPostHistory | personal_history | privacy/consent required |
| youtubeFeedbackNotInterestedHistory | personal_history | privacy/consent required |
| youtubeLikeDislikeHistory | personal_history | privacy/consent required; no direct public API for full historical interaction log |
| youtubeLiveChatHistory | personal_history | privacy/consent required |
| youtubePlaylistVotingHistory | personal_history | privacy/consent required |
| youtubePurchaseHistory | personal_history | privacy/financial sensitivity |
| youtubeSearchHistory | personal_history | no public YouTube API endpoint for full personal search history extraction |
| youtubeSharingHistory | personal_history | privacy/consent required |
| youtubeSubscriptionHistory | personal_history | privacy/consent required |
| youtubeWatchHistory | personal_history | no public endpoint for full personal watch history extraction |

## Source Files Used

- docs/Youtube API + Data/YOUTUBE_STATISTICS_EXHAUSTIVE_REFERENCE.md
- docs/Youtube API + Data/Youtube Analytics Data Categories List.txt
- docs/Youtube API + Data/YouTube API Data Reporting Overview.pdf
- docs/Youtube API + Data/DATA_PROCESSING_REPORT.md
- docs/Youtube API + Data/VIDEO_TYPE_AND_DATA_ANALYSIS_REPORT.md
- docs/Youtube API + Data/DATA_FLOW_COMPREHENSIVE_REPORT.md
- docs/Youtube API + Data/analytics_ecosystem_spec.md
- docs/Youtube API + Data/Personal Data Analytics (Comments:Posts:Watchhistory etc.).txt

## Notes On PDF Inputs

- PDF claims were reconciled at file-level references in this pass where line-level extraction was unavailable in the current environment.
