# YouTube Statistics — Complete Categorized Reference

Every statistic available through the YouTube ecosystem, categorized by **scope** (channel vs. video), **format applicability** (all formats, long-form only, shorts only), with common names, precise formatted titles, API names, and detailed descriptions.

> [!NOTE]
> **Shorts** = vertical video ≤ 180 seconds. **Long-Form** = any duration, horizontal or vertical. **Live** = real-time broadcast.

---

## Legend

| Column | Meaning |
|---|---|
| **Common Name** | What creators typically call it |
| **Formatted Title** | Exact label as shown in YouTube Studio or CSV exports |
| **Analytics API** | camelCase name used in `youtubeanalytics.googleapis.com` requests |
| **CSV / Reporting API** | snake_case column header in bulk `.csv` exports |
| **Core** | ✅ = protected by YouTube deprecation policy; ❌ = may change without notice |

---

# 1. CHANNEL-WIDE STATISTICS

These metrics describe the **entire channel** and cannot be broken down per-video. They come from the **Data API v3** (`youtube.googleapis.com/youtube/v3/channels`) or from **Analytics API** queries without a video filter.

---

## 1.1 Channel Profile & Identity (Data API v3)

| Common Name | Formatted Title | API Field | Description |
|---|---|---|---|
| **Subscriber Count** | Subscribers | `statistics.subscriberCount` | Total current subscribers. Publicly visible unless the creator hides it. This is a **snapshot** (point-in-time), not a delta — for gains/losses over time, use `subscribersGained`/`subscribersLost` from the Analytics API. |
| **Total Views** | Views | `statistics.viewCount` | Lifetime cumulative views across all videos on the channel. This number only goes up. It includes deleted videos' historical views. |
| **Total Videos** | Videos | `statistics.videoCount` | Current count of public + unlisted videos. Deleted and private videos are excluded from this count. |
| **Channel Name** | — | `snippet.title` | Display name of the channel. |
| **Channel ID** | — | `id` | Unique alphanumeric identifier (starts with `UC`). The `UU` prefix variant (replacing `UC`) gives the uploads playlist ID; `UUSH` gives the Shorts playlist. |
| **Profile Picture** | — | `snippet.thumbnails.default.url` | Channel avatar URL. Available in `default` (88px), `medium` (240px), and `high` (800px) sizes. |
| **Uploads Playlist** | — | `contentDetails.relatedPlaylists.uploads` | Hidden system playlist containing all uploads. Starts with `UU`. Querying this via `playlistItems.list` is the **most quota-efficient** way to get a full video list (1 unit vs. 100 for search). |

---

## 1.2 Channel-Level Audience Metrics (Analytics API — No Video Filter)

These metrics are **only available at the channel level**. Requesting them with `dimensions=video` returns a `400 Bad Request`.

| Common Name | Formatted Title | Analytics API | CSV Name | Description |
|---|---|---|---|---|
| **Unique Viewers** | Unique viewers | `uniqueViewers` | `unique_viewers` | Estimated number of distinct individuals who watched content on your channel during the period. Unlike `views` (which counts every playback), this deduplicates by Google account. A person watching 10 videos counts as 1 unique viewer but 10 views. |
| **New Viewers** | New viewers | `newViewers` | `new_viewers` | Viewers who watched your channel for the **first time ever** during this period. Only available at the channel level. |
| **Returning Viewers** | Returning viewers | `returningViewers` | `returning_viewers` | Viewers who have watched your channel **at least once before** this period. The sum of new + returning ≈ unique viewers (with some statistical rounding). |
| **Casual Viewers** | Casual viewers | `casualViewers` | `casual_viewers` | Viewers who watch your channel **occasionally** — not on a regular cadence. YouTube's algorithm determines the classification boundary. |
| **Regular Viewers** | Regular viewers | `regularViewers` | `regular_viewers` | Viewers who watch your channel **consistently**. These are your core audience. Regular viewers drive higher watch time per capita and are more likely to enable notifications. |

---

## 1.3 Channel-Level Demographics (Analytics API)

Queried with `dimensions=ageGroup` or `dimensions=gender` **without** a video filter. Subject to **privacy thresholds** — if a demographic bucket has too few viewers, YouTube omits it entirely.

| Common Name | Formatted Title | Analytics API Dimension | CSV Dimension | Description |
|---|---|---|---|---|
| **Age Group** | Age | `ageGroup` | `age_group` | Viewer age brackets: `age13-17`, `age18-24`, `age25-34`, `age35-44`, `age45-54`, `age55-64`, `age65-`. As of March 2026, includes users algorithmically estimated to be under 18. |
| **Gender** | Gender | `gender` | `gender` | Viewer gender classification: `male`, `female`, `user_specified`. Only logged-in viewers are counted — anonymous playbacks are excluded entirely. |
| **Viewer %** | Viewer percentage | `viewerPercentage` | `views_percentage` | The metric returned alongside demographics — represents what **percentage** of your *identifiable* audience falls into each age/gender bucket. Does **not** sum to 100% because anonymous viewers are excluded. |

---

# 2. INDIVIDUAL VIDEO STATISTICS — ALL FORMATS

These metrics apply to **any video** regardless of whether it's a Short, long-form VOD, or live stream. Available via the Analytics API with `dimensions=video` or via `filters=video=={VIDEO_ID}`.

---

## 2.1 Views & Reach

| Common Name | Formatted Title | Analytics API | CSV Name | Core | Description |
|---|---|---|---|---|---|
| **Views** | Views | `views` | `views` | ✅ | Total number of times the video was played. For **Shorts** (post-2025 update), a view is counted when the Short **starts to play or loops** — meaning a single user scrolling through the feed can generate multiple views on the same Short without watching more than a fraction of a second. For **long-form**, YouTube's bot-detection algorithms validate each view before counting it. This is the single most-used metric on the platform. |
| **Engaged Views** | Engaged views | `engagedViews` | `engaged_views` | ✅ | Views where the viewer watched **past the initial few seconds**. Introduced to preserve historical data integrity after the 2025 Shorts view-counting change. For long-form, engaged views ≈ views (since bot-scrubbing already filters trivial plays). For **Shorts, this is the more meaningful "real views" number** — it strips out accidental feed scrolls and auto-plays that lasted under ~2 seconds. |
| **Impressions** | Impressions | `videoThumbnailImpressions` | `video_thumbnail_impressions` | ❌ | Counted when a video's thumbnail is visible on a viewer's screen for **more than 1 second** with **≥50% of pixels rendered**. Only counts impressions on YouTube surfaces (home feed, search results, suggested, subscriptions, trending) — does **not** count external embeds, end screen overlays, or notifications. This is your **top-of-funnel reach** metric. |
| **CTR** | Impressions click-through rate (%) | `videoThumbnailImpressionsClickRate` | `video_thumbnail_impressions_ctr` | ❌ | `Clicks ÷ Impressions × 100`. Measures how effective your thumbnail + title combo is at converting a scroll into a click. A "good" CTR varies wildly by niche — 2–10% is typical. High impressions + low CTR = your packaging needs work. Low impressions + high CTR = YouTube isn't showing you but people who see you click. |

---

## 2.2 Watch Time & Retention

| Common Name | Formatted Title | Analytics API | CSV Name | Core | Description |
|---|---|---|---|---|---|
| **Watch Time** | Watch time (hours) | `estimatedMinutesWatched` | `watch_time_minutes` | ✅ | Total aggregate minutes watched. Despite the API name saying "minutes," YouTube Studio displays this as **hours** (÷60). This is the **#1 metric YouTube's recommendation algorithm uses** to decide whether to promote your content. More watch time → more suggested placements → more views → flywheel effect. |
| **Premium Watch Time** | YouTube Premium watch time (hours) | `estimatedRedMinutesWatched` | `red_watch_time_minutes` | ❌ | Watch time from **YouTube Premium subscribers only**. Premium members generate revenue even without watching ads (they contribute from their subscription pool instead). |
| **AVD** | Average view duration | `averageViewDuration` | `average_view_duration_seconds` | ✅ | Mean length of a single playback in **seconds**. Algorithmically **excludes looping clips** to prevent distortion. For a 10-minute video with 60-second AVD, viewers are leaving after 10% — a red flag. For a 30-second Short with 25-second AVD, that's excellent. Always interpret relative to video length. |
| **AVP** | Average percentage viewed (%) | `averageViewPercentage` | `average_view_duration_percentage` | ❌ | `AVD ÷ Video Duration × 100`. What percentage of your video the average viewer actually watches. Unlike AVD, this **normalizes across different video lengths**, making it the better metric for comparing retention between a 2-minute video and a 20-minute video. Can exceed 100% if viewers rewind and re-watch segments. |

---

## 2.3 Engagement & Interaction

| Common Name | Formatted Title | Analytics API | CSV Name | Core | Description |
|---|---|---|---|---|---|
| **Likes** | Likes | `likes` | `likes` | ✅ | Positive ratings from authenticated users. Unlike views, likes require intentional user action and are a strong signal of content quality to the algorithm. |
| **Dislikes** | Dislikes | `dislikes` | `dislikes` | ✅ | Negative ratings. YouTube **hid the public dislike count** in Nov 2021, but the exact number is still accessible to the content owner through the API. Dislikes still influence the recommendation algorithm and are important for content quality evaluation. |
| **Comments** | Comments | `comments` | `comments` | ✅ | Total user comments on the video. Includes replies to other comments. Deleted comments are subtracted from the count. High comment count relative to views indicates strong community engagement and is a positive algorithm signal. |
| **Shares** | Shares | `shares` | `shares` | ✅ | Times the native **"Share" button** was used. Only counts platform-mediated shares (copy link, share to Twitter, etc.) — does **not** count manual URL pastes or screenshot sharing. |
| **Subs Gained** | Subscribers gained | `subscribersGained` | `subscribers_gained` | ✅ | New subscriptions triggered **from this video's watch page**. When queried at the channel level, it includes all sources (homepage, search, etc.). When filtered by `video_id`, it isolates subs from that specific video — crucial for identifying which content drives channel growth. |
| **Subs Lost** | Subscribers lost | `subscribersLost` | `subscribers_lost` | ✅ | Subscription cancellations attributed to this video's watch page. If a viewer unsubscribes while watching your video, it counts here. A high subs-lost on a specific video may indicate off-brand content that alienates your core audience. |

---

## 2.4 Monetization & Ads

Requires the `yt-analytics-monetary.readonly` OAuth scope. Without it, these return `403 Forbidden`.

| Common Name | Formatted Title | Analytics API | CSV Name | Description |
|---|---|---|---|---|
| **Revenue** | Your estimated revenue (USD) | `estimatedRevenue` | `estimated_partner_revenue` | Total **net** revenue earned from Google-sold ads **plus** non-ad sources (YouTube Premium payouts, Super Chats, channel memberships). This is your bottom line. "Estimated" because final reconciliation happens at month-end. |
| **Ad Revenue** | Estimated ad revenue (USD) | `estimatedAdRevenue` | `estimated_partner_ad_revenue` | Revenue **strictly from Google-sold ads**. Excludes Premium payouts, Super Chats, and memberships. `estimatedRevenue - estimatedAdRevenue ≈ non-ad revenue`. |
| **Premium Revenue** | YouTube Premium revenue (USD) | `estimatedRedPartnerRevenue` | `estimated_partner_red_revenue` | Revenue from the **YouTube Premium subscription pool**. Premium members don't see ads; instead, a portion of their subscription fee is distributed to creators based on watch time. This metric isolates that stream. |
| **Gross Revenue** | Gross revenue (USD) | `grossRevenue` | `gross_revenue` | Estimated gross ad revenue **before** YouTube takes its 45% cut. `grossRevenue × 0.55 ≈ estimatedAdRevenue` (for standard partnerships). Useful for understanding total ad value. |
| **CPM** | CPM (USD) | `cpm` | `cpm` | "Cost Per Mille" — gross revenue per **1,000 ad impressions**. Calculated as `grossRevenue ÷ adImpressions × 1000`. Reflects advertiser demand, not creator earnings. Higher CPM = advertisers are paying more to reach your audience. Finance and tech niches typically have CPMs 5–10× higher than gaming or entertainment. |
| **Playback CPM** | Playback-based CPM (USD) | `playbackBasedCpm` | `playback_based_cpm` | Gross revenue per **1,000 monetized playbacks**. Unlike standard CPM (which counts per ad impression), this counts per video view that had at least one ad. More intuitive for creators because it relates revenue to views rather than ad slots. |
| **RPM** | Revenue per mille (USD) | *(derived)* | *(derived)* | **Not a raw API metric.** Calculated as `estimatedRevenue ÷ views × 1000`. Represents your actual take-home revenue per 1,000 views, across all revenue sources. This is the **most meaningful financial metric for creators** because it includes everything (ads, Premium, memberships) and reflects the YouTube revenue split. |
| **Ad Impressions** | Ad impressions | `adImpressions` | `ad_impressions` | Total number of verified advertisements served to viewers. A single video view can generate multiple ad impressions (pre-roll, mid-roll, post-roll, overlay). |
| **Monetized Playbacks** | Monetized playbacks | `monetizedPlaybacks` | `monetized_playbacks` | Video views where **at least one ad** was successfully displayed. `monetizedPlaybacks ÷ views` gives your **monetization rate** — what percentage of views actually generated ad revenue. Ad blockers, Premium members, and non-monetized geographies reduce this. |

---

## 2.5 Traffic Sources (Dimension Breakdown)

Queried with `dimensions=trafficSourceType` (optionally + `trafficSourceDetail`). These are **dimensions**, not metrics — they segment your view/watch-time metrics by *how viewers found your video*.

| Common Name | Formatted Title | Analytics API Dimension | CSV Dimension | Description |
|---|---|---|---|---|
| **Traffic Source Type** | Traffic source | `trafficSourceType` | `traffic_source_type` | The high-level category of where the view originated. In Analytics API, returned as string identifiers. In Reporting API CSV, returned as **integers** that must be mapped (see below). |
| **Traffic Source Detail** | Traffic source detail | `trafficSourceDetail` | `traffic_source_detail` | The specific referrer within the type — e.g., the exact search term, the exact external URL, or the specific video that referred viewers. |

### Traffic Source Type Values

| CSV Integer | Analytics API String | Common Name | Description |
|---|---|---|---|
| 0 | `ANNOTATION` | **Annotations** | Legacy — clicks from in-video annotations (deprecated 2019) |
| 1 | `ADVERTISING` | **YouTube Ads** | Views from paid promotions (TrueView, bumpers, display ads). Paid impressions, not organic. |
| 3 | `SUBSCRIBER` | **Browse Features** | Views from the Home feed, Subscriptions feed, and other browsing surfaces. This is YouTube's algorithmic recommendation engine at work. High browse traffic = the algorithm likes your content. |
| 4 | `YT_CHANNEL` | **Channel Pages** | Views from your channel page directly — someone navigated to your channel and clicked a video. |
| 5 | `YT_SEARCH` | **YouTube Search** | Views from YouTube's internal search. The `trafficSourceDetail` gives the exact search query used. Valuable for SEO analysis. |
| 7 | `RELATED_VIDEO` | **Suggested Videos** | Views from the "Up Next" sidebar or auto-play after another video finishes. This is often the **largest traffic source** for established channels. |
| 8 | `YT_PLAYLIST_PAGE` | **Playlists** | Views from within playlist contexts. |
| 9 | `EXT_URL` | **External** | Views from websites, apps, or social media that embedded or linked to your video. `trafficSourceDetail` gives the referring domain. |
| 11 | `NO_LINK_OTHER` | **Other YouTube Features** | Catch-all for views from YouTube features not covered by other categories (notifications, cast, etc.). |
| 14 | `NOTIFICATION` | **Notifications** | Views from push notifications or bell icon alerts. Directly measures subscriber engagement with notification preferences. |
| 17 | `YT_OTHER_PAGE` | **Other YouTube Pages** | Views from YouTube pages that don't fit other categories (help pages, creator studio, etc.). |
| 18 | `SHORTS` | **Shorts Feed** | Views originating from the **Shorts shelf/feed**. This is the primary discovery surface for Shorts. Only meaningful for Short-form content. |
| 20 | `END_SCREEN` | **End Screens** | Views driven by end screen elements on other videos. Measures how effectively your end screens convert viewers to watch another video. |

---

## 2.6 Geography (Dimension Breakdown)

Queried with geographic dimensions. Subject to **privacy thresholds** — small audiences from specific locations are omitted entirely. Summing views across all countries will typically be **less** than total views due to this anonymization.

| Common Name | Formatted Title | Analytics API Dimension | CSV Dimension | Granularity | Description |
|---|---|---|---|---|---|
| **Country** | Geography | `country` | `country_code` | National | ISO 3166-1 alpha-2 codes (US, GB, IN, BR, etc.). The most commonly used geographic dimension. |
| **Continent** | Continent | `continent` | `continent_code` | Continental | Broad continental regions (Americas, Europe, Asia, etc.). |
| **Sub-Continent** | Sub-continent | `subContinent` | `sub_continent_code` | Sub-continental | More specific than continent — e.g., Northern America, Southern Asia, Western Europe. |
| **Province/State** | Province | `province` | `province_code` | State/Province | US states, Canadian provinces, etc. Critical for **localized ad targeting** and regional content strategy. |
| **City** | City | `city` | `city_id` | City | Most granular geographic dimension. Returns numeric **city IDs** that require a separate lookup table to map to human-readable city names. Most susceptible to privacy thresholds — only populated for cities with significant viewership. |

---

## 2.7 Device & Playback Context (Dimension Breakdown)

| Common Name | Formatted Title | Analytics API Dimension | CSV Dimension | Description |
|---|---|---|---|---|
| **Device Type** | Device type | `deviceType` | `device_type` | Hardware platform: `DESKTOP`, `MOBILE`, `TABLET`, `TV`, `GAME_CONSOLE`, `UNKNOWN`. Mobile typically dominates (60–75% for most channels). TV is growing rapidly and correlates with longer watch sessions. |
| **Operating System** | Operating system | `operatingSystem` | `operating_system` | Software platform: `ANDROID`, `IOS`, `WINDOWS`, `MACINTOSH`, `LINUX`, `CHROMECAST`, `PLAYSTATION`, `XBOX`, etc. Useful for app-specific optimization decisions. |
| **Playback Location** | Playback location | `playbackLocationType` | `playback_location_type` | Where the video was physically played: `WATCH` (YouTube watch page), `CHANNEL` (channel page), `EMBEDDED` (external site), `BROWSE` (home/feed), `SEARCH` (search results page), `SHORTS` (Shorts player). |
| **Playback Location Detail** | Playback location detail | `playbackLocationDetail` | `playback_location_detail` | When embedded externally, this gives the **exact domain** where the embed occurred (e.g., `reddit.com`, `mysite.com`). Null for native YouTube playbacks. |
| **Live vs. On-Demand** | Live or on-demand | `liveOrOnDemand` | `live_or_on_demand` | Whether the view happened during a **live broadcast** or as an **archived VOD replay**. Critical for live streamers to separate real-time engagement from post-stream discovery. |
| **Subscriber Status** | Subscribed status | `subscribedStatus` | `subscribed_status` | Whether the viewer was a **subscriber** at the moment of the view: `SUBSCRIBED` or `UNSUBSCRIBED`. Reveals how much of your audience is loyal versus new/drive-by. If >80% of views come from non-subscribers, the algorithm is doing the heavy lifting, not your subscriber base. |

---

## 2.8 Content Format Dimension

| Common Name | Formatted Title | Analytics API Dimension | CSV Dimension | Description |
|---|---|---|---|---|
| **Content Type** | Creator content type | `creatorContentType` | `creator_content_type` | The **official, definitive** way to segment data by video format. Possible values: `VIDEO_ON_DEMAND` (standard long-form), `SHORTS` (vertical ≤180s), `LIVE_STREAM` (real-time broadcast), `STORY` (ephemeral), `UNSPECIFIED` (uncategorized). This is the only method that works reliably across historical data without metadata inference. |

---

# 3. INDIVIDUAL VIDEO STATISTICS — LONG-FORM ONLY

These metrics are **only meaningful or only available** for standard long-form videos (VOD). They either don't apply to Shorts, return empty data for Shorts, or measure features that don't exist on Shorts.

---

## 3.1 Retention Curves (Long-Form Exclusive)

Queried using the `elapsedVideoTimeRatio` dimension (float values from `0.01` to `1.0`, representing 1%–100% of the video's runtime).

| Common Name | Formatted Title | Analytics API | CSV Name | Description |
|---|---|---|---|---|
| **Retention Curve** | Audience retention | `audienceWatchRatio` | `audience_watch_ratio` | The **absolute ratio** of viewers still watching at each point in the video. A value of `0.6` at the `0.5` elapsed ratio means 60% of viewers are still watching at the halfway point. Values can **exceed 1.0** if viewers rewind and re-watch segments — a sign of highly engaging or confusing content at that timestamp. Not available for Shorts because they're too short for meaningful retention analysis. |
| **Relative Retention** | Relative audience retention | `relativeRetentionPerformance` | `relative_retention_performance` | A **0 to 1 scale** comparing your video's retention curve against **all YouTube videos of similar length**. A value of `0.5` = median performance. Above `0.5` = your video retains viewers better than average for its length. Below `0.5` = worse. This is the best way to benchmark retention because it normalizes for video length. |

---

## 3.2 Card & End Screen Metrics (Long-Form Features)

Cards and end screens are **interactive elements only available on long-form videos**. Shorts don't support them.

| Common Name | Formatted Title | Analytics API | CSV Name | Description |
|---|---|---|---|---|
| **Card Impressions** | Card impressions | `cardImpressions` | `card_impressions` | Number of times the interactive **card panel was opened** by a viewer (clicking the "i" icon). Each card show = 1 impression. Measures proactive viewer engagement with supplementary content. |
| **Card Clicks** | Card clicks | `cardClicks` | `card_clicks` | Number of times viewers **clicked a card link** (to another video, playlist, channel, or external site). `cardClicks ÷ cardImpressions` = card click rate. |
| **Card CTR** | Card click rate | *(derived)* | *(derived)* | `cardClicks ÷ cardImpressions × 100`. Not a raw API metric — calculated from the two above. |
| **End Screen Element Impressions** | End screen element impressions | `endScreenElementImpressions` | `end_screen_element_impressions` | Times an end screen element was shown. End screens are the interactive tiles in the last 5–20 seconds of a long-form video. |
| **End Screen Clicks** | End screen element clicks | `endScreenElementClicks` | `end_screen_element_clicks` | Clicks on end screen elements. High end-screen clicks indicate strong calls-to-action and good viewer retention through the end of the video. |
| **End Screen CTR** | Clicks per end screen element shown (%) | *(derived)* | *(derived)* | `endScreenElementClicks ÷ endScreenElementImpressions × 100`. Measures end screen effectiveness. |
| **Annotation CTR** | Annotation click-through rate (%) | `annotationClickThroughRate` | `annotation_click_through_rate` | **Legacy metric.** Annotations were sunset by YouTube in January 2019. This metric returns historical data for videos that had annotations but will be `0` or `null` for anything posted after 2019. |
| **Annotation Close Rate** | Annotation close rate (%) | `annotationCloseRate` | `annotation_close_rate` | **Legacy metric.** How often viewers dismissed annotations. Same sunset caveat as above. |

---

## 3.3 Long-Form Monetization Details

These metrics are most meaningful for long-form because Shorts use a different monetization structure (Shorts Revenue Sharing Program pool vs. traditional per-ad auction model).

| Common Name | Formatted Title | Analytics API | CSV Name | Description |
|---|---|---|---|---|
| **Monetized Playbacks** | Monetized playbacks | `monetizedPlaybacks` | `monetized_playbacks` | Views where ≥1 ad was shown. For long-form, this directly measures ad fill rate. For Shorts, monetization works via a pooled revenue model rather than per-video ad insertion, making this metric less meaningful. |
| **Playback CPM** | Playback-based CPM (USD) | `playbackBasedCpm` | `playback_based_cpm` | Revenue per 1,000 monetized views. Most meaningful for long-form where each view can have multiple ad breaks (pre-roll, mid-rolls, post-roll). Shorts typically have fewer/no traditional ad breaks. |
| **Ad Impressions** | Ad impressions | `adImpressions` | `ad_impressions` | Total ads served. A single 20-minute video with a pre-roll, 2 mid-rolls, and a post-roll generates **4 ad impressions** per monetized view. Shorts may get 0–1 per view. |

---

## 3.4 Long-Form Premium Metrics

| Common Name | Formatted Title | Analytics API | CSV Name | Description |
|---|---|---|---|---|
| **Premium Views** | YouTube Premium views | `redViews` | `red_views` | Playbacks by YouTube Premium subscribers specifically. These viewers don't see ads but still generate revenue through the subscription pool. For long-form, Premium views tend to have **higher AVD** because there are no ad interruptions. |
| **Premium Watch Time** | YouTube Premium watch time (hours) | `estimatedRedMinutesWatched` | `red_watch_time_minutes` | Watch time from Premium members. Combined with `redViews`, this gives Premium AVD, which is typically higher than ad-supported AVD. |
| **Premium Revenue** | YouTube Premium revenue (USD) | `estimatedRedPartnerRevenue` | `estimated_partner_red_revenue` | Revenue from the Premium subscription pool allocated to this video based on watch time share. |

---

# 4. INDIVIDUAL VIDEO STATISTICS — SHORTS ONLY

These metrics, behaviors, or interpretations are **unique to or fundamentally different for Shorts** (vertical ≤180 seconds).

---

## 4.1 Shorts-Specific View Mechanics

| Common Name | Description |
|---|---|
| **Views (Shorts)** | Since the 2025 algorithm update, a Shorts "view" counts when the **Short starts to play or loops** in the feed. This means a viewer rapidly scrolling generates views on Shorts they barely saw. This is why Shorts often show **massive view counts with low engagement rates** — the view threshold is much lower than long-form. |
| **Engaged Views (Shorts)** | **The more meaningful metric for Shorts.** Filters out accidental scrolls and auto-plays under ~2 seconds. `engagedViews ÷ views` on a Short reveals what percentage of feed impressions became actual watches. A ratio of 0.4 means 60% of "views" were drive-by scrolls. |
| **Impressions (Shorts)** | Thumbnail impressions (`videoThumbnailImpressions`) are counted when a Short's thumbnail is visible in the **Shorts shelf on the Home feed** or in search results — NOT within the Shorts player itself. Inside the vertical scrolling feed, there are no thumbnails — the video auto-plays. So impressions measure the **horizontal discovery surface**, while the traffic source `SHORTS` measures the **vertical feed**. |
| **CTR (Shorts)** | CTR on Shorts measures clicks from the thumbnail on the Home feed shelf or search results. Since most Shorts views come from the **vertical scroll feed** (where there's no click — it just auto-plays), Shorts typically have very few impressions relative to views, and CTR may appear artificially high or be statistically insignificant. |

---

## 4.2 Shorts Discovery & Traffic

| Source | Description |
|---|---|
| **Shorts Feed** (`SHORTS` / traffic source integer `18`) | The primary discovery engine for Shorts. This is the vertical scrolling feed where Shorts auto-play. This traffic source will dominate (often 70–95%) for successful Shorts. Long-form videos will show `0` from this source. |
| **Remixed Content** | When another creator remixes your Short (using the Remix button), views on their remix do **not** count as views on your original. However, a "View original" link may drive traffic back to yours, showing up as `RELATED_VIDEO` or `OTHER`. |

---

## 4.3 Shorts Monetization Model

| Aspect | Description |
|---|---|
| **Revenue Model** | Shorts use the **Shorts Revenue Sharing Program** (launched Feb 2023). Revenue comes from ads that play *between* Shorts in the feed, not from ads on your specific Short. The total Shorts ad pool is divided among creators based on their share of total Shorts **views** across the platform. |
| **Revenue Attribution** | `estimatedRevenue` for a Short reflects your **allocated share** from the pool, not direct per-video ad revenue. This makes per-Short revenue comparisons less meaningful than for long-form, where each video has its own ad inventory. |
| **CPM for Shorts** | CPM on Shorts is typically **much lower** than long-form ($0.01–$0.10 vs. $2–$15+ for long-form) because the pooled model dilutes individual video revenue. |
| **Music Licensing Deduction** | If your Short uses licensed music, the music publisher's share is **deducted before** your revenue split. A Short using a popular song may keep as little as 50% of the already-small allocated revenue. |

---

## 4.4 Shorts-Specific Features Not Available via API

| Feature | Notes |
|---|---|
| **Remixes of Your Content** | No API metric tracks how many times your content was remixed. Only visible in YouTube Studio. |
| **Shorts Funnel Metrics** | YouTube Studio shows Shorts-specific funnel data (swipe away rate, % watched) that is **not available via any public API endpoint**. |
| **Vertical vs. Horizontal Classification** | No `isShort` boolean exists in the Data API. Must be inferred via `creatorContentType` dimension (Analytics API), the `UUSH` playlist prefix hack, duration parsing, or HTTP 303 redirect testing (see Methods 1–4 in the API architecture document). |

---

# 5. REPORTING API — SYSTEM-MANAGED FINANCIAL FIELDS

These fields appear exclusively in **system-managed financial reports** (automatically generated for monetized partners). They cannot be queried via the Analytics API. Reports are auto-deleted after **2 months**.

| Field | Common Name | Description |
|---|---|---|
| `asset_id` | **Asset ID** | Content ID asset identifier for claimed content. |
| `claim_id` | **Claim ID** | Specific Content ID claim instance. |
| `youtube_revenue_split` | **YouTube Revenue Split** | Total revenue generated **before** the platform/creator split. |
| `partner_revenue` | **Partner Revenue** | Final revenue paid to the partner in **USD**. |
| `adjustment_type` | **Adjustment Type** | Why this revenue row exists: `Backpay` (withheld funds released after ownership validation), `Conflict Resolution` (funds released after ownership dispute), `Spam Adjustment` (deductions for bot/invalid activity), `Revenue Correction` (credits/deductions for technical bugs). |
| `asset_policy_monetize` | **Monetize Territories** | ISO 3166-1 alpha-2 country codes where the content owner has chosen to **monetize** the asset. |
| `asset_policy_block` | **Blocked Territories** | Countries where the asset is **geo-blocked** by the content owner. |
| `asset_policy_track` | **Tracked Territories** | Countries where the asset is allowed to play but the owner only **tracks analytics** without monetizing. |
| `claim_type` | **Claim Type** | How the claim was made: `Audio` (audio fingerprint match), `Visual` (visual fingerprint match), `AudioVisual` (both). |
| `claim_status` | **Claim Status** | Current state: `ACTIVE`, `INACTIVE`, `APPEALED`, `DISPUTE_IN_PROGRESS`. |
