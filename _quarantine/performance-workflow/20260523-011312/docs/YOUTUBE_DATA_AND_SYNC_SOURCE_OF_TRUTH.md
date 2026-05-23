# YouTube Data & Sync: Consolidated Source of Truth

This document serves as the single, definitive source of truth for the ViewTube Creator OS analytics engine. It compiles all metrics mappings, API integration specifications, CSV sniffing heuristics, data pipeline architecture, and Performance Hub requirements.

---

## 1. Executive Summary & Data Pipeline Architecture

### Overview of the ViewTube Multi-Layered Analytics Engine
ViewTube uses a tiered ingestion architecture to reconcile the disparate data profiles of the YouTube ecosystem. YouTube does not expose a single unified analytics schema. Instead, data is spread across four ingestion channels:
1. **YouTube Data API v3**: For real-time public metadata, playlist listings, and lifetime public statistics.
2. **YouTube Analytics API v2**: For owner-authenticated, high-resolution daily metrics, geographic coordinates, and demographic breakdowns.
3. **YouTube Reporting API**: For bulk, system-scheduled financial and Content ID datasets.
4. **YouTube Studio CSV Exports**: For manual uploads of high-fidelity single-video retention curves and other Studio-exclusive metrics.

Normalized records from these sources are compiled by the **Data Forge** (our synchronization and deduplication pipeline) and distributed via React context (`GlobalDataContext`) to the dashboard modules.

```
                  ┌──────────────────────────────────────────────┐
                  │              INGESTION LAYER                 │
                  └──────────────────────┬───────────────────────┘
                                         │
        ┌──────────────────────┬─────────┴─────────┬──────────────────────┐
        ▼                      ▼                   ▼                      ▼
┌──────────────┐       ┌──────────────┐    ┌──────────────┐       ┌──────────────┐
│  Data API    │       │Analytics API │    │Reporting API │       │  Studio CSV  │
│  (Metadata)  │       │(Daily Stats) │    │ (Financial)  │       │ (Retention)  │
└───────┬──────┘       └───────┬──────┘    └───────┬──────┘       └───────┬──────┘
        │                      │                   │                      │
        └──────────────────────┼───────────────────┴──────────────────────┘
                               ▼
                  ┌──────────────────────────────┐
                  │      THE DATA FORGE          │
                  │   - Deduplication            │
                  │   - Composite Keys           │
                  │   - Format Classification    │
                  └────────────┬─────────────────┘
                               │
                               ▼
                  ┌──────────────────────────────┐
                  │    GLOBAL DATA BRAIN         │
                  │   (WorkspaceBrain State)     │
                  └────────────┬─────────────────┘
                               │
        ┌──────────────────────┼───────────────────┐
        ▼                      ▼                   ▼
┌──────────────┐       ┌──────────────┐    ┌──────────────┐
│ Master Table │       │PerformanceHub│       │ Channelytics │
│(League Engine)       │(Recharts Vis)│       │(Scoreboards) │
└──────────────┘       └──────────────┘    └──────────────┘
```

---

## 2. Consolidated YouTube Metrics Catalog

This reference maps metrics across the YouTube Data API, Analytics API, Reporting API (CSV), and ViewTube's internal canonical fields.

### Legend
* **Unit**: `count` (integer), `minutes` / `seconds` (time), `percent` (0-100), `ratio` (0.0-1.0), `USD` (decimal currency).
* **Format Availability**: `All` (VOD, Shorts, Live), `Long` (Long-Form VOD only), `Shorts` (Shorts only), `Channel` (Channel-level only).
* **Core**: `✅` (Stable API metric covered by Google deprecation policy), `❌` (Derived or unstable API metric subject to change).

### 2.1 Complete Metrics Mapping Table

| Metric Group | Common Name | Analytics API Name (camelCase) | Reporting API / CSV Name (snake_case) | Unit | Format | Core | Notes / Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Views & Reach** | Views | `views` | `views` | count | All | ✅ | Total playbacks. Post-2025 Shorts views count on loops/plays, driving massive view counts but lower engagement. |
| **Views & Reach** | Engaged Views | `engagedViews` | `engaged_views` | count | All | ✅ | Views past the initial few seconds (~2s). Crucial for filtering drive-by Shorts swipes. |
| **Views & Reach** | Premium Views | `redViews` | `red_views` | count | All | ❌ | Playbacks by YouTube Premium subscribers. |
| **Views & Reach** | Viewer % | `viewerPercentage` | `views_percentage` | percent | All | ✅ | Percentage of viewers logged in during playback. |
| **Views & Reach** | Impressions | `videoThumbnailImpressions` | `video_thumbnail_impressions` / `impressions` | count | Long | ❌ | Thumbnail shown >1s with ≥50% pixels on screen. Horizontal discovery only. |
| **Views & Reach** | CTR | `videoThumbnailImpressionsClickRate` | `video_thumbnail_impressions_ctr` / `ctr` | percent | Long | ❌ | Clicks per thumbnail impression. High CTR + low AVD indicates a clickbait mismatch. |
| **Watch & Retention**| Watch Time | `estimatedMinutesWatched` | `watch_time_minutes` | minutes | All | ✅ | Aggregate watch time. Displayed as Hours (minutes ÷ 60) in creator UI. |
| **Watch & Retention**| Premium Watch | `estimatedRedMinutesWatched` | `red_watch_time_minutes` | minutes | All | ❌ | Watch time from YouTube Premium subscribers. |
| **Watch & Retention**| AVD | `averageViewDuration` | `average_view_duration_seconds` | seconds | All | ✅ | Average watch duration per playback. Excludes looping clips. |
| **Watch & Retention**| AVP | `averageViewPercentage` | `average_view_duration_percentage` / `avp` | percent | All | ❌ | Average percentage of video watched. Can exceed 100% due to rewinds. |
| **Watch & Retention**| Retention Curve| `audienceWatchRatio` | `audience_watch_ratio` | ratio | Long | ❌ | Timeline of viewers remaining at elapsed ratios (0.01 - 1.00). |
| **Watch & Retention**| Relative Ret. | `relativeRetentionPerformance` | `relative_retention_performance` | ratio | Long | ❌ | Benchmarks retention curve against videos of similar length. 0.5 is median. |
| **Engagement** | Likes | `likes` | `likes` | count | All | ✅ | Positive ratings. |
| **Engagement** | Dislikes | `dislikes` | `dislikes` | count | All | ✅ | Negative ratings. Hidden publicly, but available via API to channel owner. |
| **Engagement** | Comments | `comments` | `comments` / `comments_added` | count | All | ✅ | Total user comments. |
| **Engagement** | Shares | `shares` | `shares` | count | All | ✅ | Native "Share" button clicks. |
| **Engagement** | Subs Gained | `subscribersGained` | `subscribers_gained` | count | All | ✅ | New subscribers gained from a specific video/context. |
| **Engagement** | Subs Lost | `subscribersLost` | `subscribers_lost` | count | All | ✅ | Cancellations of subscriptions originating from the video. |
| **Monetization** | Est. Revenue | `estimatedRevenue` | `estimated_partner_revenue` | USD | All | ✅ | Creator net revenue from ads and YouTube Premium subscriptions. |
| **Monetization** | Ad Revenue | `estimatedAdRevenue` | `estimated_partner_ad_revenue` | USD | All | — | Net revenue strictly from Google-sold ads. |
| **Monetization** | Premium Revenue| `estimatedRedPartnerRevenue` | `estimated_partner_red_revenue` | USD | All | — | Net revenue from YouTube Premium subscription pool. |
| **Monetization** | Gross Revenue | `grossRevenue` | `gross_revenue` | USD | All | — | Gross ad revenue before Google/creator split. |
| **Monetization** | CPM | `cpm` | `cpm` | USD | All | — | Cost per 1,000 ad impressions (gross). |
| **Monetization** | Playback CPM | `playbackBasedCpm` | `playback_based_cpm` | USD | All | — | Gross revenue per 1,000 monetized views. |
| **Monetization** | Ad Impressions | `adImpressions` | `ad_impressions` | count | All | — | Total ads served. Single playbacks can serve multiple ads. |
| **Monetization** | Monetized Plays | `monetizedPlaybacks` | `monetized_playbacks` | count | All | — | Views where at least one ad was shown. |
| **Monetization** | RPM (Derived) | — | — | USD | All | ❌ | Derived metric: `(estimatedRevenue ÷ views) × 1000`. |
| **Cards & Screens** | Card Imp. | `cardImpressions` | `card_impressions` | count | Long | ❌ | Times an interactive card panel was opened. |
| **Cards & Screens** | Card Clicks | `cardClicks` | `card_clicks` | count | Long | ❌ | Click-through events on card panels. |
| **Cards & Screens** | Card CTR (Der.)| — | — | percent | Long | ❌ | Derived: `(cardClicks ÷ cardImpressions) × 100`. |
| **Cards & Screens** | End Screen Imp.| `endScreenElementImpressions` | `end_screen_element_impressions` | count | Long | ❌ | Interactive tiles displayed in the final 5–20s. |
| **Cards & Screens** | End Screen Clks| `endScreenElementClicks` | `end_screen_element_clicks` | count | Long | ❌ | Clicks on end screen elements. |
| **Cards & Screens** | End Screen CTR | `endScreenElementClickRate` | — | percent | Long | ❌ | Derived or direct end-screen element CTR. |
| **Legacy Cards** | Annotation CTR | `annotationClickThroughRate` | `annotation_click_through_rate` | percent | Long | ❌ | Sunset January 2019. Legacy historical data only. |
| **Legacy Cards** | Annotation Close| `annotationCloseRate` | `annotation_close_rate` | percent | Long | ❌ | Dismissal rate for legacy annotations. Sunset Jan 2019. |
| **Playlists** | Playlist Views | `playlistViews` | `playlist_views` | count | All | ❌ | Views occurring within a playlist context. |
| **Playlists** | Playlist Starts| `playlistStarts` | `playlist_starts` | count | All | ❌ | Playlist playback session initiations (web only). |
| **Playlists** | Playlist Saves | `playlistSaves` / `videosAddedToPlaylists` | `playlist_saves_added` | count | All | ❌ | Times a video was added to a user playlist. |
| **Playlists** | Playlist Removes| `videosRemovedFromPlaylists` | `playlist_saves_removed` | count | All | ❌ | Times a video was removed from a user playlist. |
| **Audience Dem.** | Unique Viewers | `uniqueViewers` | `unique_viewers` | count | Channel| ❌ | Distinct individuals watching content. Deduplicated. |
| **Audience Dem.** | New Viewers | `newViewers` | `new_viewers` | count | Channel| ❌ | First-time viewers of the channel. |
| **Audience Dem.** | Returning View | `returningViewers` | `returning_viewers` | count | Channel| ❌ | Viewers with historical views on the channel. |
| **Audience Dem.** | Casual Viewers | `casualViewers` | `casual_viewers` | count | Channel| ❌ | Occasional viewers (algorithmically classified). |
| **Audience Dem.** | Regular Viewers| `regularViewers` | `regular_viewers` | count | Channel| ❌ | Consistent core audience viewers. |
| **Audience Dem.** | Stayed to Watch | `stayedToWatch` / `stw` | `Stayed to watch (%)` | percent | Shorts| ❌ | Percentage of viewers remaining at 0:30 (CSV export only). |

---

## 3. API Integrations & Synchronization Engine

ViewTube uses a decoupled sync system. The APIs are split based on data capability, quota costs, and latency profiles.

### 3.1 YouTube Data API v3 (`youtube.googleapis.com`)
* **Primary Scope**: Channel details, video uploads metadata, and playlist hierarchies.
* **Quota Management**: Standard project quota is 10,000 units/day.
  * `playlistItems.list` on uploads playlist prefix (`UU` or `UUSH` variants): **1 unit**. This is the primary channel upload parsing route.
  * `videos.list` with `snippet,contentDetails,statistics`: **1 unit** per batch of up to 50 videos.
  * `search.list`: **100 units** (Avoid this; use playlist parsing instead).
* **Sync Frequency**: Daily.
* **Idempotency Rule**: Video metadata updates are performed via composite keys on `(videoId + snapshotDate)`.

### 3.2 YouTube Analytics API v2 (`youtubeanalytics.googleapis.com`)
* **Primary Scope**: Owners-only statistics broken down by day, country, traffic source, device, and demographic.
* **Query shape constraint**: Queries must supply `ids=channel==MINE`, `startDate`, `endDate`, `metrics`, and optional `dimensions`/`filters`.
* **Important Dimension Compatibility**:
  * **Video Metrics**: Incompatible with dimensionless channel calls.
  * **Viewer Percentage**: Requires demographic dimensions (`ageGroup` or `gender`). Calling this with standard video dimensions returns an `HTTP 400`.
  * **Thumbnail Impressions**: Incompatible with combined filters. Under heavy loads, the API might reject filters `video==[IDS]`. If this occurs, ViewTube falls back to a channel-wide top-videos report shape and performs local filtering.
* **Data Latency**: 48 to 72 hours. Daily sync operations query with a 3-day lookback window.

### 3.3 YouTube Reporting API (`youtubereports.googleapis.com`)
* **Primary Scope**: Bulk, daily-aggregated files and financial datasets.
* **System-Managed Financial Fields**:
  * `asset_id`: Content ID asset identifier.
  * `claim_id`: Content ID claim identifier.
  * `youtube_revenue_split`: Gross revenue before platform split.
  * `partner_revenue`: Net paid earnings in USD.
  * `adjustment_type`: Explains adjustments (e.g., `Backpay`, `Conflict Resolution`, `Spam Adjustment`, `Revenue Correction`).
  * `asset_policy_monetize` / `asset_policy_block` / `asset_policy_track`: Geographic policy sets.
* **Cleanup Rule**: Reporting API files are cached on Google servers and expire strictly after **60 days**. The ViewTube warehouse must ingest and store these daily.

### 3.4 Google Takeout & Personal History
* **Scope**: Personal viewer data (watch history, comment logs, search trends).
* **Mechanism**: Users request their data from Google Takeout and import the `watch-history.json` or interaction logs.
* **Structure**: Enforces JSON parser mapping containing `header`, `title`, `titleUrl`, `time`, and `products`.

---

## 4. CSV Schema Ecosystem & Detection Rules

When APIs are delayed or restrict access, ViewTube parses local CSV files exported from YouTube Studio. The parser automatically sniffs, classifies, and maps columns.

### 4.1 Sniffing and Content Tag Classification
When a CSV is uploaded, `csvImportUtils.detectContentTagFromRows` scans headers to classify the file:
* **Shorts Video Table**: Identifies headers containing `"Stayed to watch (%)"`, `"Stayed to watch at 0:30 (%)"`, `"Views from Shorts feed"`, or `"Shorts feed views"`.
* **Long-Form Video Table**: Identifies headers containing `"End screen elements shown"` or `"End screen element impressions"`.
* **Traffic Sources Table**: Identifies headers containing `"Traffic source"` or `"Traffic source detail"`.
* **Audience / Demographics**: Identifies headers containing `"Viewer age"`, `"Viewer gender"`, or `"Subscription status"`.
* **Geography**: Identifies headers containing `"Geography"`.
* **Daily Chart Export**: Identifies headers containing `"Date"` or `"Day"` with no `"Video title"` or `"Video ID"`.

### 4.2 File Name Keyword Inference
If headers are ambiguous, `inferTagFromPath` uses filename keywords:

| Filename Keyword | Resolved Tag Type |
| :--- | :--- |
| `traffic`, `source` | `traffic` |
| `audience`, `viewer`, `subscriber` | `audience` |
| `geography`, `location`, `country` | `geo` |
| `external` | `external` |
| `search term`, `search` | `search` |
| `daily`, `date` | `daily` |
| `short` | `shorts` |
| `long`, `video` | `long` |
| `total`, `channel`, `all` | `mixed` |

### 4.3 Normalized Header Mapping (`dataNormalization.ts`)
The table below maps the exact CSV column headers exported by YouTube Studio into ViewTube's internal data contracts:

```typescript
export const HEADER_MAP: Record<string, string> = {
  // Dimension Headers
  "Video title": "Dimension",
  "Title": "Dimension",
  "Video": "Dimension",
  "Geography": "Dimension",
  "Traffic source": "Dimension",
  "Device type": "Dimension",
  "Subscription status": "Dimension",
  "Viewer age": "Dimension",
  "Viewer gender": "Dimension",
  "Date": "Date",

  // Core Performance
  "Views": "Views",
  "View count": "Views",
  "Watch time (hours)": "Watch Time (Hours)",
  "Watch Time (Hours)": "Watch Time (Hours)",
  "estimatedMinutesWatched": "Watch Time (Hours)", // converted to hours (val / 60)

  // Engagement
  "Likes": "Likes",
  "likes": "Likes",
  "Dislikes": "Dislikes",
  "dislikes": "Dislikes",
  "Comments": "Comments",
  "comments": "Comments",
  "Comments added": "Comments",
  "Shares": "Shares",
  "shares": "Shares",
  "Subscribers": "Subscribers Gained",
  "Subscribers gained": "Subscribers Gained",
  "subscribersGained": "Subscribers Gained",
  "Subscribers lost": "Subscribers Lost",
  "subscribersLost": "Subscribers Lost",
  "Hypes": "Hypes",
  "Hype points": "Hype Points",

  // Reach & Conversion
  "Impressions": "Impressions",
  "impressions": "Impressions",
  "videoThumbnailImpressions": "Impressions",
  "Impressions click-through rate (%)": "CTR (%)",
  "impressionClickThroughRate": "CTR (%)",
  "videoThumbnailImpressionsClickRate": "CTR (%)",
  "CTR (%)": "CTR (%)",
  "Average view duration": "AVD (Sec)",
  "averageViewDuration": "AVD (Sec)",
  "Average view percentage (%)": "AVP (%)",
  "averageViewPercentage": "AVP (%)",
  "AVP (%)": "AVP (%)",

  // Monetization
  "Estimated revenue": "Revenue",
  "Estimated revenue (USD)": "Revenue",
  "Estimated revenue (Local)": "Revenue",
  "estimatedRevenue": "Revenue",
  "Revenue": "Revenue",
  "Your estimated revenue (USD)": "Revenue",
  "RPM": "RPM",
  "RPM (USD)": "RPM",
  "CPM": "CPM",
  "CPM (USD)": "CPM",

  // Audience Retention / CSV Studio Exclusives
  "Stayed to watch (%)": "STW %",
  "Stayed to watch at 0:30 (%)": "STW %",
  "Clicks per end screen element shown (%)": "End screen click rate",
  "End screen click rate": "End screen click rate",
  "Card click rate": "Card click rate",
  "Engaged views": "Engaged views",
  "Engaged Views": "Engaged views",
  "engagedViews": "Engaged views",
  "Views from Shorts feed": "Shorts feed views",
  "Shorts feed views": "Shorts feed views",

  // Demographics & Channel
  "Unique viewers": "Unique Viewers",
  "New viewers": "New Viewers",
  "Returning viewers": "Returning Viewers",
  "Casual viewers": "Casual Viewers",
  "Regular viewers": "Regular Viewers",
  "Average views per viewer": "Avg Views Per Viewer",
  "Members gained": "Members Gained",
  "Members lost": "Members Lost",
  "Total members": "Total Members",
  "Product clicks": "Product Clicks",
  "Orders": "Orders"
};
```

---

## 5. Performance Hub & Data Tables Functional Specs

The frontend ecosystem turns these normalized datasets into visual interfaces.

### 5.1 The Global Data Brain (`WorkspaceBrain`)
* **State Management**: Acts as the reactive core utilizing React Context.
* **Key State Objects**:
  * `normalizedVideos`: Master collection of ingested datasets.
  * `selectedVideoIds`: Array of selected video IDs. Selection triggers re-calculation across all charts.
  * `dateRange`: Active date filter.
  * `searchQuery`: Search criteria.
* **Filter Reactivity Rules**:
  * Action components (e.g., `[Select All]`) must respect the active search/filter. Selecting all under a search filters only those items, not the entire catalog.
  * Deep `useMemo` hooks wrap filtered arrays to prevent DOM lag on catalogs exceeding 900+ rows.

### 5.2 The Master Data Vault (League Engine Tables)
* **Performance Design**: Max container height restricted to `500px` with sticky table headers to maintain readability during fast scrolling.
* **Sort Heuristic**: Strict default sort by **Highest RPM (Descending)**.
* **Derived Columns**:
  * **Engagement Rate**: `((Likes + Comments + Shares) ÷ Views) × 100` (guarded against division by zero).
  * **Content Archetype**: Inferred format classification:
    * `Short-Form`: Duration ≤ 180 seconds.
    * `Long-Form Documentary`: Duration > 1200 seconds.
    * `Explainer / List`: Evaluates title keywords (e.g., "list", "why", "how").
  * **Adjusted AVP**: Capped strictly at `200%` to prevent outliers from distorting scatter visualizations.
* **Momentum indicators**: Visual glyph signals (`↗️` / `↘️`) indicating positive/negative velocity.

### 5.3 Performance Hub Visualization (Recharts Engine)
The hub implements 8 core charts utilizing React-Google-Charts, Recharts, and custom SVG styling:
1. **Daily Performance**: Line chart displaying Views and Watch Hours trends (30 days).
2. **Views by Format**: Bar chart grouping views by archetype (Shorts vs Long vs Explainers).
3. **Views + Revenue**: Dual area chart demonstrating correlation trends.
4. **Subscribers + CTR**: Dual-axis line chart matching Subscriber count (left axis) against CTR percentage (right axis).
5. **Top Views Ladder**: Ranked horizontal bar chart displaying the top 10 videos.
6. **Revenue by Format**: Bar chart comparing monetization across archetypes.
7. **Format Share**: Donut style pie chart illustrating catalog format percentage distribution.
8. **Engagement Scatter**: Scatter plot mapping views (X-axis) against likes (Y-axis).

### 5.4 Neo-Brutalist Visual Identity Tokens (v2.2)
All components and charts apply a unified design:
* **Borders**: Containers apply `border-[5px] border-black`. Subcomponents and items apply `border-[4px] border-black`.
* **Shadows**: Strong shadows without blur: `shadow-[12px_12px_0px_0px_black]`. Inner cards use `shadow-[6px_6px_0px_0px_black]`.
* **Border Radius**: Rounding accents: `rounded-[48px]` for layout wrappers, `rounded-3xl` for buttons/cards.
* **Palette**: High-saturation neon highlights:
  * Hot Pink: `#ff3399`
  * Lime Accent: `#ccff00`
  * Cyan Accent: `#00ccff`
  * Bright Yellow: `#ffdd00`
  * Orange Highlight: `#ffb158`
  * Deep Purple: `#b14aed`
* **Typography**: Heavy, condensed headers: `font-[1000] uppercase tracking-tighter italic`.
* **Layout Rule**: Flush headers with negative margins (`-m-6 mb-6 p-4`) stretching to card boundaries.

### 5.5 AI Strategy Integrations (Analysis Oracle & strategyChat)
* **Strategy Chat Context**: Integrates Gemini (`gemini.ts`) using the compiled metrics catalog. The prompt engine parses data and structures it into 5 distinct categories:
  1. **Channel Pulse**: Executive summary.
  2. **Green Flags**: Positive performing formats.
  3. **Red Flags**: Metric drop-offs.
  4. **Tactical Mandates**: 30-day priorities.
  5. **Hidden Stories**: Inter-metric correlations (e.g., CPM variations vs viewer retention).
* **Weak Hook Flag**: If `adjustedAVP` is below `15%`, the Oracle flags the video as having a weak hook and generates proposed optimization scripts.
* **Honesty Scale Plot**: Coordinates CTR (X) against AVP (Y). High CTR and low AVP is flagged in the Clickbait quadrant, triggering an AI prompt warning to re-evaluate packaging thumbnails.
