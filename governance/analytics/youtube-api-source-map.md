# YouTube API Source Map For ViewTube

Last reviewed: 2026-05-19

## Why this exists
YouTube does not expose one unified analytics schema. ViewTube has to merge three official Google APIs plus Studio CSV exports:

1. `YouTube Data API v3`
2. `YouTube Analytics API`
3. `YouTube Reporting API`
4. `YouTube Studio CSV exports` for gaps, brittle cuts, and single-video retention packages

This file is the source-of-truth summary for which API provides which kind of data, which fields are realistically syncable, and which areas should stay CSV-first.

## 1. YouTube Data API v3
Use this for public or owner-authenticated resource metadata and lifetime aggregate resource statistics.

### Best use cases
- Channel metadata and counts
- Video metadata and lifetime public stats
- Playlist metadata and item counts
- On-demand comment retrieval

### Stable channel statistics
- `statistics.viewCount`
- `statistics.subscriberCount`
- `statistics.videoCount`

Notes:
- `statistics.subscriberCount` is rounded by YouTube.
- Channel `commentCount` is deprecated and should not be treated as a primary metric.
- As of March 31, 2025, Shorts playback starts/replays are included in Data API `viewCount` behavior.

### Stable video statistics
- `statistics.viewCount`
- `statistics.likeCount`
- `statistics.commentCount`
- `statistics.dislikeCount` only for authenticated owner requests

### Stable playlist statistics
- `contentDetails.itemCount`

### Identifiers, not analytics dimensions
The Data API is resource-oriented. Use these as keys, not as analytical breakdown dimensions:
- `channelId`
- `videoId`
- `playlistId`
- `commentId`

## 2. YouTube Analytics API
Use this for targeted reports, channel-owner OAuth queries, and fast custom syncs.

### Required auth scopes
- `yt-analytics.readonly`
- `yt-analytics-monetary.readonly` for revenue

### Query shape rules
Every request is governed by:
- `startDate`
- `endDate`
- `metrics`
- `dimensions`
- `filters`
- `sort`
- `maxResults`

Never assume a metric is missing until the exact `metrics + dimensions + filters` shape is validated.

### Primary dimension families
#### Resources
- `video`
- `playlist`
- `channel` (content-owner contexts)
- `group` (filter only)

#### Time
- `day`
- `month`

#### Geography
- `country`
- `province`
- `city`
- `dma`
- `continent` (filter only)
- `subContinent` (filter only)

Important:
- `province` requires `country==US`
- `city` data is available only for supported dates and can be sparse/anonymized

#### Content / playback context
- `creatorContentType`
- `liveOrOnDemand`
- `subscribedStatus`
- `playbackLocationType`
- `playbackLocationDetail`
- `deviceType`
- `operatingSystem`

#### Demographics
- `ageGroup`
- `gender`

#### Discovery / traffic
- `insightTrafficSourceType`
- `insightTrafficSourceDetail`
- `sharingService`

### Core metrics ViewTube should care about
#### Watch and reach
- `views`
- `engagedViews`
- `estimatedMinutesWatched`
- `averageViewDuration`
- `averageViewPercentage`
- `viewerPercentage`

#### Engagement
- `likes`
- `dislikes`
- `comments`
- `shares`
- `subscribersGained`
- `subscribersLost`

#### Playlist metrics
- `playlistViews`
- `viewsPerPlaylistStart`
- `averageTimeInPlaylist`
- `playlistSaves`
- `playlistRemovals`

#### Cards / end screens / annotation-era interaction
- `cardImpressions`
- `cardClicks`
- `cardClickRate`
- `cardTeaserImpressions`
- `cardTeaserClicks`
- `cardTeaserClickRate`
- `endScreenElementImpressions`
- `endScreenElementClicks`
- `endScreenElementClickRate`
- `annotationImpressions`
- `annotationClickableImpressions`
- `annotationClosableImpressions`
- `annotationClicks`
- `annotationCloses`
- `annotationClickThroughRate`
- `annotationCloseRate`

#### Monetization
- `estimatedRevenue`
- `estimatedAdRevenue`
- `grossRevenue`
- `cpm`
- `playbackBasedCpm`
- `adImpressions`
- `monetizedPlaybacks`
- `estimatedRedPartnerRevenue`
- `redViews`

#### Live-only / special cases
- `concurrentViewers`

### Operational cautions for ViewTube
- `viewerPercentage` is valid, but it is not part of the canonical `dimensions=video` sync path. Treat it as a demographic or playback-detail metric.
- `annotationClickThroughRate` and `cardClickRate` are different interaction systems. Do not alias them.
- Thumbnail impression metrics are request-shape sensitive. Prefer channel-scoped top-video pulls plus local filtering when per-video `filters=video==...` fails.
- Revenue metrics can lag and can be partially incomplete for the latest window.
- Low-volume segmented rows can be anonymized or missing.

## 3. YouTube Reporting API
Use this for warehouse-style daily bulk CSV delivery, not for instant interactive sync.

### Core properties
- Reports are daily CSVs.
- Each file covers one 24-hour Pacific-time day.
- Files are usually available within a couple of days after job creation for historical backfill.
- Non-historical files remain downloadable for 60 days.
- Historical backfill files remain downloadable for 30 days.
- Rows with no metrics are omitted.
- Totals are not included; totals must be summed.
- Low-volume rows can be anonymized or removed.

### Runtime rule
Do not hardcode report IDs from stale notes alone. Use `reportTypes.list` at runtime as the authoritative registry because Google documentation can mix `a2` and `a3` generations across pages.

### High-value channel report families
These are the families ViewTube should understand even if runtime chooses the exact current report ID dynamically:
- `channel_basic_*`
- `channel_province_*`
- `channel_playback_location_*`
- `channel_traffic_source_*`
- `channel_device_os_*`
- `channel_demographics_*`
- `channel_sharing_service_*`
- `channel_cards_*`
- `channel_end_screens_*`
- `channel_subtitles_*`
- `channel_combined_*`
- `channel_reach_basic_*`
- `channel_reach_combined_*`

### High-value playlist report families
- `playlist_basic_*`
- `playlist_province_*`
- `playlist_playback_location_*`
- `playlist_traffic_source_*`
- `playlist_device_os_*`
- `playlist_combined_*`

### Verified current examples from official docs
Documented on the Google channel reports page:
- `channel_basic_a3`
- `channel_province_a3`
- `channel_playback_location_a3`
- `playlist_basic_a2`
- `playlist_province_a2`

Important:
- Do not assume all channel families are `a3` or all playlist families are `a2` forever.
- The correct production behavior is to discover available report types dynamically and then map them into ViewTube dataset families.

## 4. What should stay CSV-first or CSV-only
Use Studio CSVs as the preferred source for these when API support is weak, delayed, or shape-brittle:
- Single-video audience retention packages
- New / casual / regular / returning viewer breakdowns
- Community post analytics
- Some translation and video-language cuts
- Some revenue-source / ad-type breakdowns
- Some traffic-detail views where Studio exports are richer than the live API path

## 5. Recommended ViewTube sync strategy
### Fast sync
Use YouTube Analytics API for:
- Core video metrics
- Daily channel metrics
- Traffic source overview and supported detail cuts
- Country geography
- Audience demographics
- Devices and playback-location cuts where supported

### Bulk sync
Use YouTube Reporting API for:
- Historical warehousing
- Low-quota daily backfills
- Wide matrix joins across day/video/source/country/device families

### Metadata sync
Use YouTube Data API for:
- Channel metadata
- Video metadata
- Playlist metadata
- Comment fetches on demand

### Manual import
Use CSVs for:
- Retention packages
- Studio-only or delayed metric cuts
- Any dataset whose API request shape is unstable or operationally expensive

## 6. Implementation rules for ViewTube
- Treat APIs as separate source layers, not one flat schema.
- Maintain explicit provenance per metric or row: `data_api`, `analytics_api`, `reporting_api`, `csv`.
- Do not assume the latest docs page and the runtime `reportTypes.list` response match perfectly.
- Keep comments sync separate from default analytics sync because quota cost is materially different.
- Use CSV imports to improve coverage, not to overwrite stronger API identities without provenance.

## Official references
- Analytics metrics: https://developers.google.com/youtube/analytics/metrics
- Analytics dimensions: https://developers.google.com/youtube/analytics/dimensions
- Reporting overview: https://developers.google.com/youtube/reporting/v1/reports/
- Reporting channel reports: https://developers.google.com/youtube/reporting/v1/reports/channel_reports
- Data API channels: https://developers.google.com/youtube/v3/docs/channels
- Data API videos: https://developers.google.com/youtube/v3/docs/videos
- Data API playlists: https://developers.google.com/youtube/v3/docs/playlists
