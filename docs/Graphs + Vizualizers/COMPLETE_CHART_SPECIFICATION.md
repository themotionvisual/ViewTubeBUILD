n

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [ViewTube Complete Chart & Graph Specification](#viewtube-complete-chart--graph-specification)
  - [Executive Summary](#executive-summary)
  - [Data Foundation](#data-foundation)
    - [Core YouTube API Metrics Used](#core-youtube-api-metrics-used)
    - [Core YouTube API Dimensions Used](#core-youtube-api-dimensions-used)
  - [CATEGORY 1: GOOGLE API MASTER GRAPH CATALOG (7 Charts)](#category-1-google-api-master-graph-catalog-7-charts)
    - [Chart 1.1: Top Performers Trio](#chart-11-top-performers-trio)
    - [Chart 1.2: Video Value Matrix](#chart-12-video-value-matrix)
    - [Chart 1.3: Discovery Radar](#chart-13-discovery-radar)
    - [Chart 1.4: Algorithm Trigger](#chart-14-algorithm-trigger)
    - [Chart 1.5: Device Immersion](#chart-15-device-immersion)
    - [Chart 1.6: Narrative DNA](#chart-16-narrative-dna)
    - [Chart 1.7: Global Footprint](#chart-17-global-footprint)
  - [CATEGORY 2: RESEARCH LAB GALLERY (34 Charts)](#category-2-research-lab-gallery-34-charts)
    - [Core Performance Charts](#core-performance-charts)
      - [Chart 2.1: Shorts Retention](#chart-21-shorts-retention)
      - [Chart 2.2: Packaging](#chart-22-packaging)
      - [Chart 2.3: Engagement Map](#chart-23-engagement-map)
      - [Chart 2.4: Keyword Engine](#chart-24-keyword-engine)
      - [Chart 2.5: Performance Stack](#chart-25-performance-stack)
      - [Chart 2.6: Viewer Loyalty](#chart-26-viewer-loyalty)
      - [Chart 2.7: Title Stats](#chart-27-title-stats)
      - [Chart 2.8: Audience Geography](#chart-28-audience-geography)
      - [Chart 2.9: Hook-to-Binge Funnel](#chart-29-hook-to-binge-funnel)
    - [Time & Scheduling Charts](#time--scheduling-charts)
      - [Chart 2.10: Best Upload Day](#chart-210-best-upload-day)
      - [Chart 2.11: Duration Sweet Spot](#chart-211-duration-sweet-spot)
      - [Chart 2.12: Revenue Calendar](#chart-212-revenue-calendar)
      - [Chart 2.13: Milestone Progression](#chart-213-milestone-progression)
      - [Chart 2.14: Momentum Tracker](#chart-214-momentum-tracker)
      - [Chart 2.15: Growth Pulse](#chart-215-growth-pulse)
      - [Chart 2.16: Published Momentum](#chart-216-published-momentum)
    - [Revenue & Efficiency Charts](#revenue--efficiency-charts)
      - [Chart 2.17: Revenue Efficiency](#chart-217-revenue-efficiency)
      - [Chart 2.18: Performance Trend](#chart-218-performance-trend)
      - [Chart 2.19: Seasonal RPM Pulse](#chart-219-seasonal-rpm-pulse)
      - [Chart 2.20: Geography of High CPMs](#chart-220-geography-of-high-cpms)
    - [Content Analysis Charts](#content-analysis-charts)
      - [Chart 2.21: Category Volume](#chart-221-category-volume)
      - [Chart 2.22: Series Consistency](#chart-222-series-consistency)
      - [Chart 2.23: Long-Tail Shelf Life](#chart-223-long-tail-shelf-life)
      - [Chart 2.24: Golden Ratio Radar](#chart-224-golden-ratio-radar)
    - [Audience & Device Charts](#audience--device-charts)
      - [Chart 2.25: Audience Growth](#chart-225-audience-growth)
      - [Chart 2.26: OS Revenue Mix](#chart-226-os-revenue-mix)
      - [Chart 2.27: Historical Pulse](#chart-227-historical-pulse)
    - [End Screen & Conversion Charts](#end-screen--conversion-charts)
      - [Chart 2.28: End Screen Funnel](#chart-228-end-screen-funnel)
      - [Chart 2.29: Solo Impressions Funnel](#chart-229-solo-impressions-funnel)
      - [Chart 2.30: Solo End Screen Actions](#chart-230-solo-end-screen-actions)
      - [Chart 2.31: Thumbnail A/B Pulse](#chart-231-thumbnail-ab-pulse)
  - [CATEGORY 3: PERFORMANCE HUB (8 Charts)](#category-3-performance-hub-8-charts)
    - [Chart 3.1: Daily Performance](#chart-31-daily-performance)
    - [Chart 3.2: Views by Format](#chart-32-views-by-format)
    - [Chart 3.3: Views + Revenue](#chart-33-views--revenue)
    - [Chart 3.4: Subscribers + CTR](#chart-34-subscribers--ctr)
    - [Chart 3.5: Top Views Ladder](#chart-35-top-views-ladder)
    - [Chart 3.6: Revenue by Format](#chart-36-revenue-by-format)
    - [Chart 3.7: Format Share](#chart-37-format-share)
    - [Chart 3.8: Engagement Scatter](#chart-38-engagement-scatter)
  - [CATEGORY 4: CHANNELYTICS CHART TOOLBOX (6 Stations)](#category-4-channelytics-chart-toolbox-6-stations)
    - [Chart 4.1: Top Performers Trio](#chart-41-top-performers-trio)
    - [Chart 4.2: Video Value Matrix](#chart-42-video-value-matrix)
    - [Chart 4.3: Algorithm Trigger](#chart-43-algorithm-trigger)
    - [Chart 4.4: Device Immersion](#chart-44-device-immersion)
    - [Chart 4.5: Global Footprint](#chart-45-global-footprint)
    - [Chart 4.6: Narrative DNA](#chart-46-narrative-dna)
  - [CATEGORY 5: DATA VISUALIZATIONS VIEW (4 Custom SVG Charts)](#category-5-data-visualizations-view-4-custom-svg-charts)
    - [Chart 5.1: Custom Scatter/Bubble](#chart-51-custom-scatterbubble)
    - [Chart 5.2: Custom Bar Chart](#chart-52-custom-bar-chart)
    - [Chart 5.3: Top Performers KPI Cards](#chart-53-top-performers-kpi-cards)
    - [Chart 5.4: Chart Container Shell](#chart-54-chart-container-shell)
  - [CATEGORY 6: DATA DASHBOARD COMPONENT (KPI Visualizations)](#category-6-data-dashboard-component-kpi-visualizations)
    - [Chart 6.1: Channel Overview KPI Grid](#chart-61-channel-overview-kpi-grid)
    - [Chart 6.2: Content Breakdown](#chart-62-content-breakdown)
  - [CATEGORY 7: CHANNELYTICS VIEW](#category-7-channelytics-view)
    - [Chart 7.1: MobileLookChart (Viral Trajectory)](#chart-71-mobilelookchart-viral-trajectory)
  - [IMPLEMENTATION PRIORITY](#implementation-priority)
    - [Phase 1: Critical Charts (Week 1)](#phase-1-critical-charts-week-1)
    - [Phase 2: Core Analytics (Week 2)](#phase-2-core-analytics-week-2)
    - [Phase 3: Research Lab (Week 3-4)](#phase-3-research-lab-week-3-4)
    - [Phase 4: Polish & Innovation (Week 5-6)](#phase-4-polish--innovation-week-5-6)
  - [DATA FLOW REQUIREMENTS](#data-flow-requirements)

<!-- /code_chunk_output -->


# ViewTube Complete Chart & Graph Specification

## Executive Summary

This document provides a complete specification of all 62 charts and visualizations in ViewTube, including their types, statistics features, presentation methods, unique insights, and the YouTube API data categories they consume.

---

## Data Foundation

### Core YouTube API Metrics Used

| Metric        | API Name                           | Description           | Charts Using |
| ------------- | ---------------------------------- | --------------------- | ------------ |
| Views         | `views`                            | Total view count      | All charts   |
| Watch Time    | `watch_time_minutes`               | Total minutes watched | 45 charts    |
| Revenue       | `estimated_partner_revenue`        | Estimated earnings    | 28 charts    |
| Subscribers   | `subscribers_gained`               | New subscribers       | 32 charts    |
| CTR           | `impressionClickThroughRate`       | Click-through rate    | 18 charts    |
| Impressions   | `impressions`                      | Thumbnail impressions | 12 charts    |
| Likes         | `likes`                            | Like count            | 15 charts    |
| Comments      | `comments`                         | Comment count         | 8 charts     |
| Shares        | `shares`                           | Share count           | 6 charts     |
| AVD           | `average_view_duration_seconds`    | Avg view duration     | 22 charts    |
| AVP           | `average_view_duration_percentage` | Avg % viewed          | 18 charts    |
| Engaged Views | `engaged_views`                    | Views past intro      | 10 charts    |

### Core YouTube API Dimensions Used

| Dimension      | API Name             | Description         | Charts Using       |
| -------------- | -------------------- | ------------------- | ------------------ |
| Video          | `video`              | Video ID            | All video charts   |
| Date           | `day`                | Daily data          | Time series charts |
| Country        | `country`            | Geographic data     | Geo charts         |
| Device Type    | `deviceType`         | Platform data       | Device charts      |
| Traffic Source | `trafficSourceType`  | Discovery source    | Traffic charts     |
| Content Type   | `creatorContentType` | Shorts vs Long-form | Format charts      |
| Age Group      | `ageGroup`           | Demographic data    | Demo charts        |
| Gender         | `gender`             | Demographic data    | Demo charts        |

---

## CATEGORY 1: GOOGLE API MASTER GRAPH CATALOG (7 Charts)

### Chart 1.1: Top Performers Trio

**Location:** `src/components/ChartEngine.tsx` → `TrioPieCard` component

**Chart Type:** PieChart (Donut style, 3 instances)

**Google Chart Type:** `PieChart` with `pieHole: 0.5`

**Statistics Features:**

- Top 10 videos ranked by Revenue
- Top 10 videos ranked by Watch Hours
- Top 10 videos ranked by Subscribers Gained
- Displays #1 performer prominently with value
- Interactive hover reveals full video title and metric value

**Data Source:**

```typescript
// Input: UnifiedRow[]
// Processing: Sort by metric, take top 10, format for pie chart
moneyMakers: [
 ["Video", "Revenue"],
 ...top10Revenue.map((r) => [r.title, r.revenue]),
]
mostViewed: [
 ["Video", "Watch Hours"],
 ...topWatch.map((r) => [r.title, r.watchHours]),
]
newSubs: [
 ["Video", "Subscribers"],
 ...topSubs.map((r) => [r.title, r.subsGained]),
]
```

**Presentation:**

- Three side-by-side donut charts (400px height each)
- Centered title overlay on each chart
- Neo-brutalist styling with bold borders
- Color palette: #00CCFF, #CCFF00, #FFDD00, #FFB158, #FF7497
- Hover interaction shows video title and value below chart

**Unique Insights:**

- Instantly identifies which single video is driving the most revenue
- Reveals the "heartbeat" of the channel at a glance
- Shows whether the same videos drive revenue, watch time, and subs (diversification) or different videos (specialization)

**YouTube API Metrics Required:**

- `estimatedRevenue` (for money makers)
- `watch_time_minutes` (for most viewed)
- `subscribers_gained` (for new subs)
- `video` dimension (for video identification)

---

### Chart 1.2: Video Value Matrix

**Location:** `src/components/ChannelyticsChartToolbox.tsx` → `valueMatrixChart`

**Chart Type:** BubbleChart

**Google Chart Type:** `BubbleChart`

**Statistics Features:**

- X-axis: CTR % (range 0-12%)
- Y-axis: Retention/AVP % (range 0-200%)
- Bubble size: Total Views (scaled)
- Quadrant classification:
  - **GOLD MINE:** High CTR (>6%), High Retention (>100%)
  - **HIDDEN GEM:** Low CTR (<6%), High Retention (>100%)
  - **CLICK BAIT:** High CTR (>6%), Low Retention (<100%)
  - **GRAVEYARD:** Low CTR (<6%), Low Retention (<100%)
- Color coding by content type (Shorts = #FF7497, Long-form = #00CCFF)

**Data Source:**

```typescript
valueMatrixData = [
 ["", "CTR %", "Retention %", "Type", "Views", { role: "tooltip" }],
 ...selectedRows.map((row) => [
  "",
  getCtr(row),
  getAvp(row),
  getTag(row),
  getViews(row),
  `${title}\nCTR: ${ctr}%\nAVP: ${avp}%\nViews: ${views}`,
 ]),
]
```

**Presentation:**

- Scatter plot with 4 colored quadrants
- Reference lines at CTR=6% and AVP=100%
- Bubble size proportional to views
- Color-coded by content type
- Custom tooltips on hover

**Unique Insights:**

- Reveals which videos have the best packaging-to-content ratio
- Identifies videos that need thumbnail/CTR optimization (Hidden Gems)
- Identifies videos that need retention fixes (Click Bait)
- Shows the overall health of the content library

**YouTube API Metrics Required:**

- `impressionClickThroughRate` (CTR)
- `average_view_duration_percentage` (AVP/Retention)
- `views` (bubble size)
- `creatorContentType` (for Shorts vs Long-form classification)

---

### Chart 1.3: Discovery Radar

**Location:** `src/views/ResearchLab.tsx`

**Chart Type:** SteppedAreaChart or RadarChart

**Google Chart Type:** `SteppedAreaChart` or custom RadarChart

**Statistics Features:**

- Traffic source breakdown: Browse, Search, Suggested, External, End Screens
- Shows discovery flow patterns over time
- Percentage distribution by source
- Trend analysis for each source

**Data Source:**

```typescript
// From traffic source analytics
trafficSources: {
  columnHeaders: ['date', 'traffic_source_type', 'views'],
  rows: [['2024-01-01', 'browse', '5000'], ['2024-01-01', 'search', '3000'], ...]
}
```

**Presentation:**

- Overlapping stepped area chart showing traffic source distribution
- Each source has distinct color
- Time series on X-axis
- View count or percentage on Y-axis

**Unique Insights:**

- Identifies whether channel is algorithmically "blessed" (heavy Browse traffic)
- Shows search-dependency (high Search traffic = evergreen content)
- Reveals content lifecycle phase (new videos = Browse, old videos = Search)
- Indicates external promotion effectiveness

**YouTube API Metrics Required:**

- `views` (by traffic source)
- `trafficSourceType` dimension
- `day` dimension (for time series)

---

### Chart 1.4: Algorithm Trigger

**Location:** `src/components/ChannelyticsChartToolbox.tsx` → `triggerChart`

**Chart Type:** ScatterChart

**Google Chart Type:** `ScatterChart`

**Statistics Features:**

- X-axis: CTR % (range 0-12%)
- Y-axis: Impressions (formatted short)
- Trend line showing correlation
- Identifies viral tipping points where high CTR triggers massive impression delivery

**Data Source:**

```typescript
triggerData = [
 ["CTR %", "Impressions", { role: "tooltip" }],
 ...selectedRows.map((row) => [
  getCtr(row),
  getImpressions(row),
  `${title}\nIMP: ${impressions}\nCTR: ${ctr}%`,
 ]),
]
```

**Presentation:**

- Scatter plot with trend line (linear regression)
- Each point represents a video
- Trend line in black with 30% opacity
- Custom tooltips showing video details

**Unique Insights:**

- Maps the exact CTR threshold where YouTube's algorithm dramatically increases impression delivery
- Identifies "viral trigger points" specific to this channel
- Shows which videos broke through the algorithm barrier
- Reveals the CTR target creators should aim for

**YouTube API Metrics Required:**

- `impressionClickThroughRate` (CTR)
- `impressions` (impression count)
- `views` (for estimated impressions if not available)

---

### Chart 1.5: Device Immersion

**Location:** `src/components/ChannelyticsChartToolbox.tsx` → `deviceChart`

**Chart Type:** PieChart (3D)

**Google Chart Type:** `PieChart` with `is3D: true`

**Statistics Features:**

- Viewership breakdown by device type: Mobile, TV, Desktop, Tablet
- Percentage distribution
- View count by device

**Data Source:**

```typescript
deviceData = [
 ["Device", "Views"],
 ...deviceEntries, // Sorted by views descending
]
// Example: [['Device', 'Views'], ['Mobile', 65000], ['TV', 25000], ['Desktop', 10000]]
```

**Presentation:**

- 3D pie chart with distinct colors per device
- Neo-brutalist styling
- Percentage labels on slices

**Unique Insights:**

- Dictates content formatting decisions:
  - TV dominant → Use larger text, cinematic pacing, wider shots
  - Mobile dominant → Use faster cuts, vertical framing, bold text
- Reveals production quality requirements
- Shows accessibility needs (TV = older audience, Mobile = younger)

**YouTube API Metrics Required:**

- `views` (by device)
- `deviceType` dimension

---

### Chart 1.6: Narrative DNA

**Location:** `src/components/ChannelyticsChartToolbox.tsx` → `narrativeChart`

**Chart Type:** WordTree

**Google Chart Type:** `WordTree`

**Statistics Features:**

- Semantic clustering of keywords from top-performing video titles
- Frequency analysis of words (minimum 4 characters)
- Root word = most common keyword
- Branches = related terms that appear with root

**Data Source:**

```typescript
narrativeWordTreeData = [
 ["Phrases"],
 ...selectedRows.map((row) => [
  getTitle(row)
   .replace(/[^\w\s]/g, " ")
   .trim(),
 ]),
]
// Example: [['Phrases'], ['Napoleon Marshals Battle Strategy'], ['Napoleon Waterloo Defeat']]
```

**Presentation:**

- Tree diagram branching from root word
- Root word at top center
- Related terms branching below
- Line thickness indicates frequency

**Unique Insights:**

- Reveals the exact keyword combinations that trigger clicks
- Shows what topics the algorithm associates with the channel
- Identifies content themes that resonate with the audience
- Guides future video title creation

**YouTube API Metrics Required:**

- `video` dimension (for title extraction)
- Video titles from `videos.list` API

---

### Chart 1.7: Global Footprint

**Location:** `src/components/ChannelyticsChartToolbox.tsx` → `geoChart`

**Chart Type:** GeoChart

**Google Chart Type:** `GeoChart`

**Statistics Features:**

- Views by country/region
- Revenue by geographic region (if available)
- CPM analysis by country
- Top 40 countries by views

**Data Source:**

```typescript
geoData = [
 ["Country", "Views"],
 ...countryEntries, // Sorted by views, top 40
]
// Example: [['Country', 'Views'], ['US', 50000], ['UK', 30000], ['CA', 20000]]
```

**Presentation:**

- World heatmap with 5-color gradient
- Color scale: #00CCFF → #CCFF00 → #FFDD00 → #FFB158 → #FF7497
- Darker/warmer colors = higher values
- Interactive tooltips showing exact values

**Unique Insights:**

- Identifies highest-CPM territories for localization investment
- Reveals untapped geographic markets
- Shows where translation/dubbing would have highest ROI
- Indicates cultural relevance of content

**YouTube API Metrics Required:**

- `views` (by country)
- `estimatedRevenue` (by country, if available)
- `country` dimension

---

## CATEGORY 2: RESEARCH LAB GALLERY (34 Charts)

### Core Performance Charts

#### Chart 2.1: Shorts Retention

**Chart Type:** ScatterChart

**Statistics Features:**

- X-axis: Duration in seconds (0-180s range)
- Y-axis: Average % Viewed (0-100%)
- Color coding by duration range:
  - <60s: #FF6321 (Orange)
  - 60-120s: #00CCFF (Cyan)
  - > 120s: #00FF00 (Green)
- Point size indicates view count

**Data Source:**

```typescript
// Filter for Shorts only (duration < 180s)
shortsData = videoOnlyData.filter((r) => r._userTag === "shorts" && apv > 0)
// Map to: [duration_seconds, avg_percent_viewed, style, tooltip]
```

**Presentation:**

- Scatter plot with custom styled points
- Axis labels: "DURATION (SECONDS)" and "AVG % VIEWED"
- Custom ticks for easy reading

**Unique Insights:**

- Shows optimal Shorts length for maximum retention
- Identifies which Shorts maintain attention vs lose viewers
- Reveals the retention "sweet spot" for Shorts content

**YouTube API Metrics Required:**

- `average_view_duration_percentage` (AVP)
- `average_view_duration_seconds` (for duration)
- `creatorContentType` = 'shorts'

---

#### Chart 2.2: Packaging

**Chart Type:** BubbleChart

**Statistics Features:**

- X-axis: Impressions
- Y-axis: CTR %
- Bubble size: Views
- Color by content type (Shorts vs Long-form)

**Data Source:**

```typescript
topVideos = getTopN(viewsKey, 20)
// Map to: ['', impressions, ctr, type, views, tooltip]
```

**Presentation:**

- Bubble chart with quadrant implications
- Custom tooltips with full details

**Unique Insights:**

- Identifies videos with high impressions but low CTR (packaging problem)
- Identifies videos with low impressions but high CTR (discovery problem)
- Shows packaging effectiveness at a glance

**YouTube API Metrics Required:**

- `impressions`
- `impressionClickThroughRate`
- `views`

---

#### Chart 2.3: Engagement Map

**Chart Type:** LineChart

**Statistics Features:**

- Top 50 recent videos ranked by engagement metrics
- Four metrics: Likes, Comments, Shares, Subscribers
- Dual Y-axes for different metric scales

**Data Source:**

```typescript
engagementData = videoOnlyData
 .sort((a, b) => new Date(b[dateKey]) - new Date(a[dateKey]))
 .slice(0, 50)
// Map to: [title, likes, comments, shares, subs]
```

**Presentation:**

- Multi-line chart with 4 engagement metrics
- Dual axes for metric scaling
- Crosshair for detailed inspection

**Unique Insights:**

- Shows which videos drive the most community interaction
- Reveals engagement patterns beyond just views
- Identifies content that builds community

**YouTube API Metrics Required:**

- `likes`
- `comments`
- `shares`
- `subscribers_gained`

---

#### Chart 2.4: Keyword Engine

**Chart Type:** BarChart (Horizontal)

**Statistics Features:**

- Keywords extracted from video titles
- Sorted by average views per video using that keyword
- Minimum 2 occurrences required
- Top 20 keywords displayed
- Opacity based on performance ratio

**Data Source:**

```typescript
keywordPerformance = extractKeywords(videoOnlyData)
 .filter((k) => k.count >= 2)
 .sort((a, b) => b.avgViews - a.avgViews)
 .slice(0, 20)
```

**Presentation:**

- Horizontal bar chart
- Keyword labels on Y-axis
- Average views on X-axis
- Bar opacity indicates performance ratio

**Unique Insights:**

- Reveals which specific words in titles correlate with higher viewership
- Guides title optimization strategy
- Shows content themes that resonate

**YouTube API Metrics Required:**

- `video` dimension (for title extraction)
- `views` (for performance calculation)

---

#### Chart 2.5: Performance Stack

**Chart Type:** SteppedAreaChart

**Statistics Features:**

- Three stacked components:
  - Views (flowing DOWN, negative values)
  - CTR (anchor in middle)
  - Retention (flowing UP)
- Shows viral DNA composition

**Data Source:**

```typescript
// For each video:
;[title, -views / 1000, ctr * 5, retention]
// Example: ['NAPOLEON BATTLE', -50, 30, 75]
```

**Presentation:**

- Diverging stacked area chart
- Purple (down/views), Green (anchor/CTR), Indigo (up/retention)
- No axis labels (abstract visualization)

**Unique Insights:**

- Shows the balance between click appeal, watch appeal, and raw reach
- Visualizes the "viral DNA" of each video
- Reveals which component is driving performance

**YouTube API Metrics Required:**

- `views`
- `impressionClickThroughRate`
- `average_view_duration_percentage` (retention)

---

#### Chart 2.6: Viewer Loyalty

**Chart Type:** BubbleChart

**Statistics Features:**

- X-axis: New Viewers
- Y-axis: Returning Viewers
- Bubble size: Total Views
- Color by content type

**Data Source:**

```typescript
// If new/returning viewer data available:
;[videoId, newViewers, returningViewers, type, totalViews, tooltip]
// If not available: Estimate based on video age and views
```

**Presentation:**

- Bubble chart with quadrant implications
- Top-right = loyal audience building
- Bottom-left = one-time viewers

**Unique Insights:**

- Identifies videos that build loyal audiences vs one-time viewers
- Shows community-building content
- Reveals subscriber conversion potential

**YouTube API Metrics Required:**

- `views` (total)
- Demographics data for new vs returning (if available)

---

#### Chart 2.7: Title Stats

**Chart Type:** ScatterChart

**Statistics Features:**

- X-axis: Title Length (word count) or Keyword Count
- Y-axis: CTR %
- Shows correlation between title characteristics and CTR

**Data Source:**

```typescript
videoOnlyData.map((v) => [
 titleLength(v), // or keywordCount(v)
 getCtr(v),
 tooltip,
])
```

**Presentation:**

- Scatter plot with trend analysis
- Custom tooltips

**Unique Insights:**

- Reveals optimal title length for maximum CTR
- Shows ideal keyword density
- Guides title creation strategy

**YouTube API Metrics Required:**

- `impressionClickThroughRate`
- Video titles (for analysis)

---

#### Chart 2.8: Audience Geography

**Chart Type:** GeoChart

**Statistics Features:**

- Views by country/region
- Global reach visualization

**Data Source:**

```typescript
geoData = aggregateByCountry(videoOnlyData)
// [['Country', 'Views'], ['US', 100], ['UK', 80], ...]
```

**Presentation:**

- World heatmap
- 5-color gradient

**Unique Insights:**

- Shows global reach and engaged markets
- Identifies expansion opportunities

**YouTube API Metrics Required:**

- `views` (by country)
- `country` dimension

---

#### Chart 2.9: Hook-to-Binge Funnel

**Chart Type:** Sankey Diagram (Custom Implementation)

**Statistics Features:**

- Conversion flow: Views → Watch Time → Subscribers → Shares
- Shows drop-off at each stage
- Percentage conversion rates

**Data Source:**

```typescript
funnelData = [
 { stage: "Views", value: totalViews },
 { stage: "Watch Time", value: engagedViews },
 { stage: "Subscribers", value: subsGained },
 { stage: "Shares", value: shares },
]
```

**Presentation:**

- Flow diagram with connecting paths
- Width proportional to value
- Percentage labels

**Unique Insights:**

- Identifies where in the viewer journey the biggest losses occur
- Shows conversion efficiency at each stage
- Reveals optimization opportunities

**YouTube API Metrics Required:**

- `views`
- `engaged_views`
- `subscribers_gained`
- `shares`

---

### Time & Scheduling Charts

#### Chart 2.10: Best Upload Day

**Chart Type:** ColumnChart

**Statistics Features:**

- Average views by day of week
- 7 columns (Monday-Sunday)
- Shows optimal upload timing

**Data Source:**

```typescript
dayOfWeekData = aggregateByDayOfWeek(videoOnlyData)
// [['Day', 'Avg Views'], ['Mon', 450], ['Tue', 520], ...]
```

**Presentation:**

- Vertical bar chart with 7 columns
- Color-coded by day

**Unique Insights:**

- Reveals optimal upload schedule for maximum initial viewership
- Shows audience activity patterns

**YouTube API Metrics Required:**

- `views`
- `day` dimension

---

#### Chart 2.11: Duration Sweet Spot

**Chart Type:** BarChart (Horizontal)

**Statistics Features:**

- Average views by video length category:
  - 0-5 minutes
  - 5-10 minutes
  - 10-20 minutes
  - 20+ minutes

**Data Source:**

```typescript
durationCategories = {
 "0-5 min": avgViews(videos.filter((v) => v.duration < 300)),
 "5-10 min": avgViews(videos.filter((v) => v.duration < 600)),
 "10-20 min": avgViews(videos.filter((v) => v.duration < 1200)),
 "20+ min": avgViews(videos.filter((v) => v.duration >= 1200)),
}
```

**Presentation:**

- Horizontal bar chart
- Categories on Y-axis, avg views on X-axis

**Unique Insights:**

- Identifies the video length that performs best for this channel
- Guides content planning decisions

**YouTube API Metrics Required:**

- `views`
- Video duration (from `contentDetails.duration`)

---

#### Chart 2.12: Revenue Calendar

**Chart Type:** Calendar Chart

**Statistics Features:**

- Daily revenue highlighted for top 5 days per month
- Shows revenue patterns and seasonality

**Data Source:**

```typescript
calendarData = dailyRevenue
 .filter((d) => d.revenue > 0)
 .map((d) => [d.date, d.revenue])
```

**Presentation:**

- Calendar heatmap
- Color intensity = revenue amount

**Unique Insights:**

- Shows revenue patterns and seasonal trends
- Identifies high-revenue days for analysis

**YouTube API Metrics Required:**

- `estimatedRevenue`
- `day` dimension

---

#### Chart 2.13: Milestone Progression

**Chart Type:** SteppedAreaChart

**Statistics Features:**

- Cumulative views over time
- Shows growth trajectory
- Milestone markers

**Data Source:**

```typescript
cumulativeViews = videoOnlyData
 .sort((a, b) => new Date(a[dateKey]) - new Date(b[dateKey]))
 .reduce((acc, v) => {
  acc.push({
   date: v.date,
   total: acc[acc.length - 1]?.total + v.views || v.views,
  })
  return acc
 }, [])
```

**Presentation:**

- Step area chart
- Time on X-axis, cumulative views on Y-axis

**Unique Insights:**

- Visualizes channel growth milestones and velocity
- Shows acceleration or deceleration of growth

**YouTube API Metrics Required:**

- `views`
- `day` dimension

---

#### Chart 2.14: Momentum Tracker

**Chart Type:** LineChart

**Statistics Features:**

- 30-day rolling average of key metrics
- Multiple metrics on same chart
- Trend direction indicators

**Data Source:**

```typescript
rollingAverage = calculateRollingAvg(dailyMetrics, 30)
// Returns: [{ date, views_avg, watchHours_avg, ... }]
```

**Presentation:**

- Multi-line chart
- Smooth curves
- Legend for each metric

**Unique Insights:**

- Shows whether channel momentum is increasing or decreasing
- Smooths out daily volatility for clearer trends

**YouTube API Metrics Required:**

- `views`
- `watch_time_minutes`
- `day` dimension

---

#### Chart 2.15: Growth Pulse

**Chart Type:** ComboChart

**Statistics Features:**

- Views (bars) vs Subscribers (line) over time
- Shows correlation between metrics

**Data Source:**

```typescript
growthData = dailyMetrics.map((d) => ({
 date: d.date,
 views: d.views,
 subs: d.subscribers,
}))
```

**Presentation:**

- Combined bar and line chart
- Dual Y-axes

**Unique Insights:**

- Shows correlation between viewership spikes and subscriber growth
- Identifies which view spikes convert to subscribers

**YouTube API Metrics Required:**

- `views`
- `subscribers_gained`
- `day` dimension

---

#### Chart 2.16: Published Momentum

**Chart Type:** ScatterChart (Heatmap Grid)

**Statistics Features:**

- Views by hour of day (0-23) and day of week (0-6)
- 24×7 grid heatmap
- Shows optimal publishing times

**Data Source:**

```typescript
heatmapData = videoOnlyData.map((v) => ({
 hour: new Date(v[dateKey]).getHours(),
 day: new Date(v[dateKey]).getDay(),
 views: v.views,
}))
```

**Presentation:**

- 24×7 grid heatmap
- Color intensity = average views

**Unique Insights:**

- Identifies optimal publishing times for maximum initial traction
- Shows when the audience is most active

**YouTube API Metrics Required:**

- `views`
- `day` dimension (for hour extraction)

---

### Revenue & Efficiency Charts

#### Chart 2.17: Revenue Efficiency

**Chart Type:** ScatterChart

**Statistics Features:**

- X-axis: Duration (seconds)
- Y-axis: Revenue
- Shows RPM by video length

**Data Source:**

```typescript
revenueEfficiency = videoOnlyData.map((v) => ({
 duration: v.duration,
 revenue: v.revenue,
 rpm: calculateRPM(v),
}))
```

**Presentation:**

- Scatter plot
- Trend line for RPM

**Unique Insights:**

- Identifies which video lengths generate the most revenue per minute
- Shows revenue efficiency by content length

**YouTube API Metrics Required:**

- `estimatedRevenue`
- Video duration

---

#### Chart 2.18: Performance Trend

**Chart Type:** ComboChart

**Statistics Features:**

- Impressions, Views, and Watch Hours over time
- Three metrics on combined chart

**Data Source:**

```typescript
performanceTrend = dailyMetrics.map((d) => ({
 date: d.date,
 impressions: d.impressions,
 views: d.views,
 watchHours: d.watchHours,
}))
```

**Presentation:**

- Multi-metric combo chart
- Different chart types for each metric

**Unique Insights:**

- Shows how impression delivery translates to actual engagement
- Reveals conversion efficiency from impressions to views

**YouTube API Metrics Required:**

- `impressions`
- `views`
- `watch_time_minutes`
- `day` dimension

---

#### Chart 2.19: Seasonal RPM Pulse

**Chart Type:** ColumnChart

**Statistics Features:**

- Monthly RPM (Revenue Per Mille) trends
- 12 months of data
- Shows seasonal advertising patterns

**Data Source:**

```typescript
monthlyRPM = aggregateByMonth(videoOnlyData).map((m) => ({
 month: m.month,
 rpm: (m.revenue / m.views) * 1000,
}))
```

**Presentation:**

- Vertical bar chart with 12 columns
- RPM values on Y-axis

**Unique Insights:**

- Reveals seasonal advertising patterns affecting revenue
- Shows best monetization months

**YouTube API Metrics Required:**

- `estimatedRevenue`
- `views`
- `day` dimension

---

#### Chart 2.20: Geography of High CPMs

**Chart Type:** GeoChart

**Statistics Features:**

- CPM by country
- Revenue efficiency by geography

**Data Source:**

```typescript
geoCPM = aggregateByCountry(videoOnlyData).map((c) => ({
 country: c.country,
 cpm: (c.revenue / c.views) * 1000,
}))
```

**Presentation:**

- World heatmap with CPM values
- 5-color gradient

**Unique Insights:**

- Identifies which geographic markets pay the most per view
- Guides localization and targeting strategy

**YouTube API Metrics Required:**

- `estimatedRevenue` (by country)
- `views` (by country)
- `country` dimension

---

### Content Analysis Charts

#### Chart 2.21: Category Volume

**Chart Type:** TreeMap

**Statistics Features:**

- Hierarchical view of keywords/categories by reach
- Nested rectangles sized by view count

**Data Source:**

```typescript
categoryVolume = groupByCategory(videoOnlyData).map((c) => ({
 label: c.category,
 size: c.totalViews,
}))
```

**Presentation:**

- Nested rectangles
- Size proportional to views
- Color by category

**Unique Insights:**

- Shows content category dominance
- Reveals topic opportunities

**YouTube API Metrics Required:**

- `views`
- Video category (from `snippet.categoryId`)

---

#### Chart 2.22: Series Consistency

**Chart Type:** CandlestickChart

**Statistics Features:**

- Open/High/Low/Close performance for video series
- Shows performance volatility

**Data Source:**

```typescript
candlestickData = groupBySeries(videoOnlyData).map((s) => ({
 series: s.name,
 open: s.firstVideo.views,
 high: s.bestVideo.views,
 low: s.worstVideo.views,
 close: s.latestVideo.views,
}))
```

**Presentation:**

- Financial-style candlestick chart
- Green for positive, red for negative

**Unique Insights:**

- Shows performance volatility within content series
- Reveals consistency of audience interest

**YouTube API Metrics Required:**

- `views`
- Video grouping (by playlist or keyword)

---

#### Chart 2.23: Long-Tail Shelf Life

**Chart Type:** LineChart

**Statistics Features:**

- Cumulative views normalized to Day 0 for comparison
- Shows view accumulation over time
- Multiple videos compared

**Data Source:**

```typescript
shelfLife = videos.map((v) => ({
 day: daysSincePublish(v),
 cumulativeViews: v.cumulativeViews,
 normalized: true,
}))
```

**Presentation:**

- Multi-line chart
- Each line = one video
- Day 0 aligned

**Unique Insights:**

- Identifies which videos have staying power
- Shows evergreen vs trending content patterns

**YouTube API Metrics Required:**

- `views` (cumulative over time)
- `day` dimension

---

#### Chart 2.24: Golden Ratio Radar

**Chart Type:** ColumnChart

**Statistics Features:**

- Benchmark engagement ratios:
  - Likes/Views
  - Comments/Views
  - Shares/Views
  - Subs/Views
- Comparison to platform benchmarks

**Data Source:**

```typescript
goldenRatio = {
 likesPerView: totalLikes / totalViews,
 commentsPerView: totalComments / totalViews,
 sharesPerView: totalShares / totalViews,
 subsPerView: totalSubs / totalViews,
}
```

**Presentation:**

- Bar chart comparing to benchmarks
- Black bars = channel, colored = benchmark

**Unique Insights:**

- Shows how channel engagement compares to platform averages
- Identifies engagement strengths and weaknesses

**YouTube API Metrics Required:**

- `likes`, `comments`, `shares`, `subscribers_gained`, `views`

---

### Audience & Device Charts

#### Chart 2.25: Audience Growth

**Chart Type:** ScatterChart

**Statistics Features:**

- X-axis: Views
- Y-axis: Subscribers gained
- Shows subscriber conversion rate

**Data Source:**

```typescript
audienceGrowth = videoOnlyData.map((v) => ({
 views: v.views,
 subs: v.subsGained,
}))
```

**Presentation:**

- Scatter plot with correlation line
- Each point = one video

**Unique Insights:**

- Shows subscriber conversion rate
- Identifies which videos drive subscriptions

**YouTube API Metrics Required:**

- `views`
- `subscribers_gained`

---

#### Chart 2.26: OS Revenue Mix

**Chart Type:** PieChart

**Statistics Features:**

- Revenue breakdown by operating system
- iOS, Android, Windows, macOS, etc.

**Data Source:**

```typescript
osRevenue = aggregateByOS(videoOnlyData).map((os) => ({
 os: os.name,
 revenue: os.revenue,
}))
```

**Presentation:**

- Pie chart with percentage breakdown

**Unique Insights:**

- Reveals which platforms generate the most revenue
- Guides platform-specific optimization

**YouTube API Metrics Required:**

- `estimatedRevenue` (by OS)
- `operatingSystem` dimension

---

#### Chart 2.27: Historical Pulse

**Chart Type:** AreaChart

**Statistics Features:**

- Daily reach and view intensity over time
- Filled area showing activity density

**Data Source:**

```typescript
historicalPulse = dailyMetrics.map((d) => ({
 date: d.date,
 reach: d.uniqueViewers,
 views: d.views,
}))
```

**Presentation:**

- Filled area chart
- Time on X-axis

**Unique Insights:**

- Visualizes channel activity patterns
- Shows audience engagement cycles

**YouTube API Metrics Required:**

- `views`
- `viewerPercentage` (for unique viewers estimate)
- `day` dimension

---

### End Screen & Conversion Charts

#### Chart 2.28: End Screen Funnel

**Chart Type:** SteppedAreaChart

**Statistics Features:**

- Retention → End Screen Impressions → End Screen Clicks
- Shows conversion rates at each stage

**Data Source:**

```typescript
endScreenFunnel = [
 {
  stage: "Retention",
  value: totalWatchTime,
 },
 {
  stage: "End Screen Impressions",
  value: endScreenImpressions,
 },
 {
  stage: "End Screen Clicks",
  value: endScreenClicks,
 },
]
```

**Presentation:**

- Funnel visualization
- Percentage labels

**Unique Insights:**

- Shows end screen effectiveness
- Identifies optimization opportunities

**YouTube API Metrics Required:**

- `watch_time_minutes`
- End screen analytics (if available)

---

#### Chart 2.29: Solo Impressions Funnel

**Chart Type:** SteppedAreaChart

**Statistics Features:**

- Single video conversion flow
- Impression → View → Engagement → Conversion

**Data Source:**

```typescript
soloFunnel = [
 {
  stage: "Impressions",
  value: impressions,
 },
 {
  stage: "Views",
  value: views,
 },
 {
  stage: "Engagement",
  value: engagedViews,
 },
]
```

**Presentation:**

- Funnel showing drop-off at each stage

**Unique Insights:**

- Identifies where viewers drop off
- Shows conversion efficiency

**YouTube API Metrics Required:**

- `impressions`
- `views`
- `engaged_views`

---

#### Chart 2.30: Solo End Screen Actions

**Chart Type:** BarChart

**Statistics Features:**

- End screen elements shown vs clicked
- Comparison of effectiveness

**Data Source:**

```typescript
endScreenActions = [
 {
  element: "Video",
  shown: videoShown,
  clicked: videoClicked,
 },
 {
  element: "Playlist",
  shown: playlistShown,
  clicked: playlistClicked,
 },
 {
  element: "Subscribe",
  shown: subscribeShown,
  clicked: subscribeClicked,
 },
]
```

**Presentation:**

- Comparison bar chart
- Grouped bars for shown vs clicked

**Unique Insights:**

- Shows which end screen elements are most effective
- Guides end screen design

**YouTube API Metrics Required:**

- End screen analytics (if available)

---

#### Chart 2.31: Thumbnail A/B Pulse

**Chart Type:** LineChart

**Statistics Features:**

- CTR and Views over time
- Annotations for thumbnail changes
- Shows impact of changes

**Data Source:**

```typescript
thumbnailAB = dailyMetrics.map((d) => ({
 date: d.date,
 ctr: d.ctr,
 views: d.views,
 annotation: d.thumbnailChanged ? "New Thumbnail" : null,
}))
```

**Presentation:**

- Line chart with event markers
- Annotations at change points

**Unique Insights:**

- Shows impact of thumbnail changes on performance
- Validates A/B testing decisions

**YouTube API Metrics Required:**

- `impressionClickThroughRate`
- `views`
- `day` dimension

---

## CATEGORY 3: PERFORMANCE HUB (8 Charts)

### Chart 3.1: Daily Performance

**Chart Type:** LineChart (Recharts)

**Statistics Features:**

- Views and Watch Hours trends over 30 days
- Dual-line comparison
- Smooth curves

**Data Source:**

```typescript
dailySeries = last30Days.map((day) => ({
 label: formatDate(day),
 views: day.views,
 watchHours: day.watchHours,
}))
```

**Presentation:**

- Dual-line chart
- Cyan line = Views, Pink line = Watch Hours
- Custom tooltips

**Unique Insights:**

- Shows daily performance patterns
- Reveals trends and anomalies

**YouTube API Metrics Required:**

- `views`
- `watch_time_minutes`
- `day` dimension

---

### Chart 3.2: Views by Format

**Chart Type:** BarChart (Recharts)

**Statistics Features:**

- Views grouped by content format
- Long-form, Shorts, Live

**Data Source:**

```typescript
formatSeries = [
 {
  format: "Long-form",
  views: longFormViews,
 },
 {
  format: "Shorts",
  views: shortsViews,
 },
 {
  format: "Live",
  views: liveViews,
 },
]
```

**Presentation:**

- Vertical bar chart
- Lime color (#CCFF00)

**Unique Insights:**

- Shows which content formats drive the most viewership
- Guides content mix decisions

**YouTube API Metrics Required:**

- `views`
- `creatorContentType` dimension

---

### Chart 3.3: Views + Revenue

**Chart Type:** AreaChart (Recharts)

**Statistics Features:**

- Dual-area trends for Views and Revenue
- Overlapping areas with transparency

**Data Source:**

```typescript
areaData = dailySeries.map((d) => ({
 label: d.label,
 views: d.views,
 revenue: d.revenue,
}))
```

**Presentation:**

- Overlapping area chart
- Cyan area = Views, Orange area = Revenue

**Unique Insights:**

- Shows correlation between viewership and monetization
- Reveals revenue efficiency over time

**YouTube API Metrics Required:**

- `views`
- `estimatedRevenue`
- `day` dimension

---

### Chart 3.4: Subscribers + CTR

**Chart Type:** LineChart Dual-Axis (Recharts)

**Statistics Features:**

- Subscribers (left axis) and CTR% (right axis) over time
- Dual-axis comparison

**Data Source:**

```typescript
dualAxisData = dailySeries.map((d) => ({
 label: d.label,
 subscribers: d.subscribers,
 ctr: d.ctr,
}))
```

**Presentation:**

- Dual-axis line chart
- Lime line = Subscribers, Pink line = CTR

**Unique Insights:**

- Shows relationship between CTR optimization and subscriber growth
- Reveals whether CTR improvements translate to subs

**YouTube API Metrics Required:**

- `subscribers_gained`
- `impressionClickThroughRate`
- `day` dimension

---

### Chart 3.5: Top Views Ladder

**Chart Type:** BarChart (Recharts)

**Statistics Features:**

- Top 10 videos ranked by views
- Horizontal bars

**Data Source:**

```typescript
topViewsSeries = videoOnlyData
 .sort((a, b) => b.views - a.views)
 .slice(0, 10)
 .map((v, i) => ({ rank: i + 1, title: v.title, views: v.views }))
```

**Presentation:**

- Horizontal bar chart
- Cyan color (#00CCFF)

**Unique Insights:**

- Clear ranking of best-performing content
- Shows view distribution across top videos

**YouTube API Metrics Required:**

- `views`

---

### Chart 3.6: Revenue by Format

**Chart Type:** BarChart (Recharts)

**Statistics Features:**

- Revenue comparison across content formats
- Long-form, Shorts, Live

**Data Source:**

```typescript
revenueByFormat = [
 {
  format: "Long-form",
  revenue: longFormRevenue,
 },
 {
  format: "Shorts",
  revenue: shortsRevenue,
 },
 {
  format: "Live",
  revenue: liveRevenue,
 },
]
```

**Presentation:**

- Vertical bar chart
- Orange color (#FFB158)

**Unique Insights:**

- Shows which formats are most profitable
- Guides monetization strategy

**YouTube API Metrics Required:**

- `estimatedRevenue`
- `creatorContentType` dimension

---

### Chart 3.7: Format Share

**Chart Type:** PieChart Donut (Recharts)

**Statistics Features:**

- Percentage distribution of views by format
- Long-form, Shorts, Live percentages

**Data Source:**

```typescript
formatShare = [
 {
  name: "Long-form",
  value: longFormPercentage,
 },
 {
  name: "Shorts",
  value: shortsPercentage,
 },
 {
  name: "Live",
  value: livePercentage,
 },
]
```

**Presentation:**

- Donut chart with center label
- Total percentage in center

**Unique Insights:**

- Shows content mix at a glance
- Reveals format dominance

**YouTube API Metrics Required:**

- `views`
- `creatorContentType` dimension

---

### Chart 3.8: Engagement Scatter

**Chart Type:** ScatterChart (Recharts)

**Statistics Features:**

- X-axis: Views
- Y-axis: Likes
- Shows engagement quality

**Data Source:**

```typescript
engagementScatter = videoOnlyData.map((v) => ({
 views: v.views,
 likes: v.likes,
}))
```

**Presentation:**

- Scatter plot
- Pink color (#FF7497)

**Unique Insights:**

- Shows engagement quality (like-to-view ratio)
- Identifies highly engaging content

**YouTube API Metrics Required:**

- `views`
- `likes`

---

## CATEGORY 4: CHANNELYTICS CHART TOOLBOX (6 Stations)

_Note: These are the same as the Master Graphs but presented in the Channelytics view with additional filtering capabilities._

### Chart 4.1: Top Performers Trio

- Same as Chart 1.1
- Additional: Format filter (All/Shorts/Long)
- Additional: Time filter (All/30d/90d)

### Chart 4.2: Video Value Matrix

- Same as Chart 1.2
- Additional: Selection mode (All visible/Top 10/Top 25/Top 50)

### Chart 4.3: Algorithm Trigger

- Same as Chart 1.4
- Additional: Trend line toggle

### Chart 4.4: Device Immersion

- Same as Chart 1.5
- Additional: View count display

### Chart 4.5: Global Footprint

- Same as Chart 1.7
- Additional: Top 40 countries filter

### Chart 4.6: Narrative DNA

- Same as Chart 1.6
- Additional: Root word selection

---

## CATEGORY 5: DATA VISUALIZATIONS VIEW (4 Custom SVG Charts)

### Chart 5.1: Custom Scatter/Bubble

- **Type:** SVG
- **Purpose:** Lightweight alternative to Google Charts
- **Charts:** Video Value Matrix, Algorithm Trigger

### Chart 5.2: Custom Bar Chart

- **Type:** SVG (Horizontal)
- **Purpose:** Customizable bar visualizations
- **Charts:** Device Immersion, Global Footprint

### Chart 5.3: Top Performers KPI Cards

- **Type:** Custom Stat Cards
- **Purpose:** At-a-glance performance metrics
- **Metrics:** Total Revenue, Views, Retention

### Chart 5.4: Chart Container Shell

- **Type:** Neo-Brutalist Wrapper
- **Purpose:** Visual consistency across all visualizations
- **Features:** 5px borders, 12px shadows, neon colors

---

## CATEGORY 6: DATA DASHBOARD COMPONENT (KPI Visualizations)

### Chart 6.1: Channel Overview KPI Grid

**Type:** KPI Cards

**Statistics Features:**

- Total Views
- Watch Time (Hours)
- Revenue
- New Subscribers
- Average CTR
- Average RPM
- Average AVD

**Presentation:**

- Grid of metric cards
- Large values with labels
- Neo-brutalist styling

**Unique Insights:**

- Immediate channel health snapshot
- All key metrics at a glance

**YouTube API Metrics Required:**

- All core metrics aggregated

---

### Chart 6.2: Content Breakdown

**Type:** Progress Bars

**Statistics Features:**

- Shorts vs Long-form percentage
- View distribution by format

**Presentation:**

- Horizontal progress bars
- Color-coded by format

**Unique Insights:**

- Content mix visualization
- Format balance at a glance

**YouTube API Metrics Required:**

- `views` by `creatorContentType`

---

## CATEGORY 7: CHANNELYTICS VIEW

### Chart 7.1: MobileLookChart (Viral Trajectory)

**Chart Type:** AreaChart (Recharts)

**Statistics Features:**

- View trends with gradient fill
- Custom tooltips
- Neo-brutalist styling

**Data Source:**

```typescript
viralTrajectory = dailySeries.map((d) => ({
 date: d.label,
 views: d.views,
}))
```

**Presentation:**

- Area chart with gradient fill
- Mobile-optimized design
- Smooth curves

**Unique Insights:**

- Simulated mobile-kit aesthetic
- Clear trend visualization

**YouTube API Metrics Required:**

- `views`
- `day` dimension

---

## IMPLEMENTATION PRIORITY

### Phase 1: Critical Charts (Week 1)

1. Top Performers Trio (1.1)
2. Video Value Matrix (1.2)
3. Algorithm Trigger (1.4)
4. Daily Performance (3.1)

### Phase 2: Core Analytics (Week 2)

5. Discovery Radar (1.3)
6. Device Immersion (1.5)
7. Global Footprint (1.7)
8. Views by Format (3.2)

### Phase 3: Research Lab (Week 3-4)

9-42. All 34 Research Lab charts

### Phase 4: Polish & Innovation (Week 5-6)

43-62. Remaining charts and widgets

---

## DATA FLOW REQUIREMENTS

All charts require data from the unified `UnifiedRow[]` structure:

```typescript
interface UnifiedRow {
 // Identification
 videoId: string
 title: string
 date: string

 // Content Classification
 contentType: "shorts" | "long" | "live" | "story"
 duration: number

 // Performance Metrics
 views: number
 impressions: number
 ctr: number
 engagedViews: number
 watchTimeHours: number
 avd: number
 avp: number

 // Engagement
 subsGained: number
 likes: number
 comments: number
 shares: number

 // Revenue
 revenue: number
 rpm: number

 // Source
 source: "csv" | "api"
}
```

---

_Document Version: 1.0_
_Last Updated: 2026-04-07_
_Total Charts Documented: 62_
