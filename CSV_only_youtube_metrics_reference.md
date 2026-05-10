# YouTube Analytics Metrics — Complete Reference

Every metric your app can encounter, organized by what the YouTube Analytics API actually calls it, what the Reporting API CSV calls it, and the common nickname creators use.

---

## View & Reach Metrics

| YouTube Analytics API Name | Reporting API (CSV) Name | Common Name / Nickname | Unit | Core? | Notes |
|---|---|---|---|---|---|
| `views` | `views` | **Views** | count | ✅ | Total times a video was viewed |
| `engagedViews` | `engaged_views` | **Engaged Views** | count | ✅ | Views past the first few seconds. Vital for Shorts where a "view" counts on loop/play start |
| `redViews` | `red_views` | **Premium Views** | count | ❌ | Playbacks by YouTube Premium subscribers |
| `viewerPercentage` | `views_percentage` | **Viewer %** | percent | ✅ | % of audience logged into a Google account during playback |
| `videoThumbnailImpressions` | `video_thumbnail_impressions` | **Impressions** | count | ❌ | Thumbnail visible >1 sec with ≥50% pixels on screen |
| `videoThumbnailImpressionsClickRate` | `video_thumbnail_impressions_ctr` | **CTR** / **Click-Through Rate** | percent | ❌ | Clicks ÷ valid thumbnail impressions |

---

## Watch Time & Retention Metrics

| YouTube Analytics API Name | Reporting API (CSV) Name | Common Name / Nickname | Unit | Core? | Notes |
|---|---|---|---|---|---|
| `estimatedMinutesWatched` | `watch_time_minutes` | **Watch Time** / **Watch Hours** (÷60) | minutes | ✅ | Total aggregate watch time in minutes |
| `estimatedRedMinutesWatched` | `red_watch_time_minutes` | **Premium Watch Time** | minutes | ❌ | Watch time from Premium members only |
| `averageViewDuration` | `average_view_duration_seconds` | **AVD** | seconds | ✅ | Mean playback length. Excludes looping clips |
| `averageViewPercentage` | `average_view_duration_percentage` | **AVP** / **Avg % Viewed** | percent | ❌ | Average % of the video watched per playback |
| `audienceWatchRatio` | `audience_watch_ratio` | **Retention Curve** | ratio | ❌ | Ratio of viewers at each time point. Can exceed 1.0 if users rewind |
| `relativeRetentionPerformance` | `relative_retention_performance` | **Relative Retention** | 0–1 scale | ❌ | How retention compares to all YouTube videos of similar length (0.5 = median) |

---

## Engagement & Interaction Metrics

| YouTube Analytics API Name | Reporting API (CSV) Name | Common Name / Nickname | Unit | Core? | Notes |
|---|---|---|---|---|---|
| `likes` | `likes` | **Likes** | count | ✅ | Positive ratings |
| `dislikes` | `dislikes` | **Dislikes** | count | ✅ | Negative ratings. Hidden from public UI but still available to content owner via API |
| `comments` | `comments` | **Comments** | count | ✅ | Total user comments |
| `shares` | `shares` | **Shares** | count | ✅ | Native "Share" button clicks |
| `subscribersGained` | `subscribers_gained` | **Subs Gained** / **Subs +** | count | ✅ | New subscribers. When filtered by video, isolates subs from that watch page |
| `subscribersLost` | `subscribers_lost` | **Subs Lost** / **Subs −** | count | ✅ | Subscription cancellations |

---

## Card & Annotation Metrics (Legacy)

| YouTube Analytics API Name | Reporting API (CSV) Name | Common Name / Nickname | Unit | Notes |
|---|---|---|---|---|
| `cardImpressions` | `card_impressions` | **Card Impressions** | count | Times the card panel was opened by a viewer |
| `cardClicks` | `card_clicks` | **Card Clicks** | count | Clicks on interactive cards |
| `annotationClickThroughRate` | `annotation_click_through_rate` | **Card Click Rate** (legacy: Annotation CTR) | percent | Legacy metric — annotations sunset 2019, but still returns data historically |
| `annotationCloseRate` | `annotation_close_rate` | **Annotation Close Rate** | percent | Legacy — how often annotations were dismissed |

---

## Playlist Metrics

| YouTube Analytics API Name | Reporting API (CSV) Name | Common Name / Nickname | Unit | Notes |
|---|---|---|---|---|
| `playlistViews` | `playlist_views` | **Playlist Views** | count | Views occurring within playlist context |
| `playlistStarts` | `playlist_starts` | **Playlist Starts** | count | Times a playlist playback session was initiated (web only) |
| `playlistSaves` / `videosAddedToPlaylists` | `playlist_saves_added` | **Playlist Saves** / **Added to Playlist** | count | Times a video/playlist was saved |
| `videosRemovedFromPlaylists` | `playlist_saves_removed` | **Removed from Playlist** | count | Times a video was removed from user playlists |

---

## Monetization & Ad Metrics

| YouTube Analytics API Name | Reporting API (CSV) Name | Common Name / Nickname | Unit | Core? | Notes |
|---|---|---|---|---|---|
| `estimatedRevenue` | `estimated_partner_revenue` | **Revenue** / **Est. Revenue** | USD | ✅ | Net revenue from ads + non-ad sources (Premium payouts) |
| `estimatedAdRevenue` | `estimated_partner_ad_revenue` | **Ad Revenue** | USD | — | Revenue strictly from Google-sold ads |
| `estimatedRedPartnerRevenue` | `estimated_partner_red_revenue` | **Premium Revenue** | USD | — | Revenue from YouTube Premium subscription pool |
| `grossRevenue` | `gross_revenue` | **Gross Revenue** | USD | — | Gross ad revenue *before* the creator/platform split |
| `cpm` | `cpm` | **CPM** | USD | — | Gross revenue per 1,000 ad impressions |
| `playbackBasedCpm` | `playback_based_cpm` | **Playback CPM** | USD | — | Gross revenue per 1,000 monetized playbacks |
| `adImpressions` | `ad_impressions` | **Ad Impressions** | count | — | Total verified ads served |
| `monetizedPlaybacks` | `monetized_playbacks` | **Monetized Playbacks** | count | — | Views where at least one ad impression was displayed |

> **RPM** (Revenue Per Mille) is **derived, not a raw API metric**: `RPM = (estimatedRevenue ÷ views) × 1000`

---

## Audience Metrics (CSV/Studio Only)

These metrics appear in YouTube Studio and CSV exports but are **not valid** with `dimensions=video` in the Analytics API:

| CSV / Studio Name | Common Name / Nickname | Unit | Notes |
|---|---|---|---|
| `uniqueViewers` | **Unique Viewers** / **Uniques** | count | Distinct viewers (channel-level only) |
| `newViewers` | **New Viewers** | count | First-time viewers |
| `returningViewers` | **Returning Viewers** | count | Viewers who've watched before |
| `casualViewers` | **Casual Viewers** | count | Occasional viewers |
| `regularViewers` | **Regular Viewers** | count | Consistent viewers |

---

## Metrics Used Only in CSV Exports (Not in Analytics API)

| CSV Studio Header | Common Name / Nickname | Unit | Notes |
|---|---|---|---|
| Stayed to watch (%) | **STW** / **Stayed to Watch** | percent | Not a real Analytics API metric — CSV export only |
| Clicks per end screen element shown (%) | **End Screen Click Rate** | percent | Not valid with `dimensions=video` in API |

---

## What ViewTube Currently Requests from the API

These are the **5 metric groups** sent to `youtubeanalytics.googleapis.com/v2/reports` with `dimensions=video`:

| Group | Metrics Requested |
|---|---|
| **core_performance** | `views`, `estimatedMinutesWatched`, `averageViewDuration`, `averageViewPercentage`, `subscribersGained` |
| **engagement** | `likes`, `comments`, `shares`, `engagedViews`, `subscribersLost`, `dislikes`, `cardImpressions`, `cardClicks` |
| **impressions_ctr** | `videoThumbnailImpressions`, `videoThumbnailImpressionsClickRate` |
| **monetization** | `estimatedRevenue`, `estimatedAdRevenue`, `cpm`, `monetizedPlaybacks`, `playbackBasedCpm`, `adImpressions` |
| **audience_mix** | `annotationClickThroughRate`, `annotationCloseRate`, `redViews`, `estimatedRedPartnerRevenue` |
