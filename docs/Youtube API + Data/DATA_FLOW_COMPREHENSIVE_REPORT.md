# ViewTUBE Data Flow Comprehensive Report

## Executive Summary

ViewTUBE is a sophisticated YouTube analytics and content creation platform that processes data through multiple interconnected systems. Data flows from external APIs (YouTube Data API v3, YouTube Analytics API), CSV uploads, and AI services (Google Gemini) through normalization, transformation, storage, and visualization layers.

---

## 1. DATA INGESTION SOURCES

### 1.1 YouTube API Integration (`src/services/youtubeService.ts`)

The application connects to YouTube through multiple API endpoints:

#### Channel Profile Data

- **Function**: `fetchChannelProfile()`
- **API**: YouTube Data API v3 - `channels.list(part=snippet,statistics,contentDetails&mine=true)`
- **Data Retrieved**:
  - Channel ID, name, subscriber count, total views, total videos
  - Profile picture URL
  - Uploads playlist ID (for fetching videos)

#### Video List

- **Function**: `fetchVideoList(maxResults, query, uploadsIdFromProfile)`
- **API**: YouTube Data API v3 - `playlistItems.list()` or `search.list()`
- **Data Retrieved**:
  - Video IDs, titles, publish dates, thumbnails
  - Up to 500 videos per sync

#### Video Statistics

- **Function**: `fetchVideoStats(videoIds)`
- **API**: YouTube Data API v3 - `videos.list(part=statistics,contentDetails)`
- **Data Retrieved**:
  - View count, like count, comment count
  - Duration (ISO 8601 format, parsed to seconds)
  - Duration raw format for classification

#### Video Content Type (Shorts Detection)

- **Function**: `fetchVideoContentType(startDate, endDate)`
- **API**: YouTube Analytics API - `reports.query(dimensions=video,creatorContentType)`
- **Data Retrieved**:
  - Maps video IDs to `isShort` boolean
  - Uses `creatorContentType` dimension ("YouTube Short" vs other)
  - Most reliable method for Shorts detection

#### Video-Level Analytics

- **Function**: `fetchAnalytics(startDate, endDate, channelId)`
- **API**: YouTube Analytics API v2 - `reports.query()`
- **Metrics**: views, estimatedMinutesWatched, subscribersGained, estimatedRevenue, likes, comments, shares
- **Dimensions**: video
- **Data Retrieved**: Per-video performance metrics

#### Channel-Level Analytics

- **Function**: `fetchChannelAnalytics(startDate, endDate)`
- **API**: YouTube Analytics API v2
- **Metrics**: views, estimatedMinutesWatched, subscribersGained, likes, comments, shares, estimatedRevenue
- **Dimensions**: day
- **Data Retrieved**: Daily aggregated channel metrics

#### Demographic Analytics

- **Function**: `fetchDemographicAnalytics(startDate, endDate)`
- **API**: YouTube Analytics API v2
- **Metrics**: viewerPercentage
- **Dimensions**: ageGroup, gender
- **Data Retrieved**: Audience age and gender distribution

#### Traffic Source Analytics

- **Function**: `fetchTrafficSourceAnalytics(startDate, endDate)`
- **API**: YouTube Analytics API v2
- **Metrics**: views
- **Dimensions**: insightTrafficSourceType
- **Data Retrieved**: Views by traffic source

#### Daily Metrics

- **Function**: `fetchDailyAnalytics(startDate, endDate)`
- **API**: YouTube Analytics API v2
- **Metrics**: views, estimatedMinutesWatched, subscribersGained, estimatedRevenue, likes, comments, shares
- **Dimensions**: day
- **Data Retrieved**: Complete daily time series data

### 1.2 CSV File Uploads (`src/services/csvImportUtils.ts`)

#### Supported File Types

- CSV files (`.csv`)
- ZIP archives containing CSVs (`.zip`)
- Folder uploads (recursive extraction)

#### CSV Parsing

- **Function**: `parseCSV(text)`
- **Features**:
  - Handles quoted fields with commas
  - Auto-detects numeric vs text values
  - Removes percentage signs and commas from numbers
  - Filters empty lines

#### Auto-Detection of Content Type

- **Function**: `detectContentTagFromRows(rows)`
- **Detection Logic**:
  - **Shorts Evidence**: "Stayed to watch" metric, "Shorts feed views", duration ≤ 180s
  - **Long Evidence**: "End screen elements shown", duration > 180s
  - **Mixed**: Both evidence types present
  - **Single Video**: Only one data row

#### Tag Inference from File Path

- **Function**: `inferTagFromPath(path)`
- **Path Keywords**:
  - `traffic`, `source` → `traffic`
  - `audience`, `viewer`, `subscriber` → `audience`
  - `geography`, `location`, `country` → `geo`
  - `short` → `shorts`
  - `long`, `video` → `long`
  - `daily`, `date` → `daily`
  - `search` → `search`

#### Date Range Extraction

- **Function**: `extractDateRangeFromName(name)`
- **Patterns Recognized**:
  - "Past N Days"
  - "All Time" / "Lifetime"
  - "YYYY-MM-DD to YYYY-MM-DD"
  - "Month DD, YYYY to Month DD, YYYY"

---

## 2. DATA NORMALIZATION (`src/services/dataNormalization.ts`)

### 2.1 Header Mapping

The `HEADER_MAP` standardizes polymorphic CSV/API headers to a canonical schema:

| Canonical Key        | Source Headers                                                                    |
| -------------------- | --------------------------------------------------------------------------------- |
| `Dimension`          | Video title, Title, Video, Geography, Traffic source, Device type                 |
| `Views`              | Views, View count                                                                 |
| `Watch Time (Hours)` | Watch time (hours), Watch Time (Hours), estimatedMinutesWatched                   |
| `Revenue`            | Estimated revenue, Estimated revenue (USD), Revenue, Your estimated revenue (USD) |
| `Subscribers Gained` | Subscribers, Subscribers gained, subscribersGained                                |
| `CTR (%)`            | Impressions click-through rate (%), impressionClickThroughRate, CTR (%)           |
| `AVD (Sec)`          | Average view duration, averageViewDuration, AVD (Sec)                             |
| `AVP (%)`            | Average view percentage (%), averageViewPercentage                                |
| `Likes`              | Likes                                                                             |
| `Comments`           | Comments, Comments added                                                          |
| `Shares`             | Shares                                                                            |

### 2.2 Normalization Process

**Function**: `normalizeRow(row)`

1. **Case-Insensitive Matching**: Converts all header keys to lowercase for matching
2. **Numeric Cleaning**: Removes non-numeric characters (except `-` and `.`)
3. **Type Conversion**: Converts string numbers to actual numbers
4. **Special Handling**:
   - `estimatedMinutesWatched` → divided by 60 to get hours
   - `Dimension` fields → calculates `titleLength`
   - Preserves `_` prefixed internal fields

---

## 3. DATA TRANSFORMATION & ENRICHMENT (`src/services/dataForge.ts`)

### 3.1 Row Enrichment

**Function**: `normalizeAndEnrichRow(rawRow)`

Transforms normalized data into enriched rows with computed metrics:

#### Computed Metrics

| Metric           | Formula                                                   |
| ---------------- | --------------------------------------------------------- |
| `engagementRate` | `(likes + comments + shares) / views * 100`               |
| `adjustedAVP`    | `Math.min(Math.max(0, avp), 200)`                         |
| `RPM`            | `revenue / views * 1000` (if not provided)                |
| `Impressions`    | `views / (ctr / 100)` (cross-computed if missing)         |
| `CTR`            | `views / impressions * 100` (cross-computed if missing)   |
| `AVD`            | `watchHours * 3600 / views` (derived if missing)          |
| `Watch Hours`    | `avdSeconds * views / 3600` (derived if missing)          |
| `AVP`            | `avdSeconds / durationSeconds * 100` (derived if missing) |

#### Duration Parsing

Supports multiple formats:

- ISO 8601: `PT1H2M3S`
- Time format: `1:02:03`
- Seconds: `3723`

### 3.2 Deduplication

**Function**: `dedupeByVideoDate(rows)`

- **Composite Key**: `videoId|date`
- **Merge Strategy**:
  - Scores rows by completeness (views, impressions, watch time, AVD, AVP, CTR, revenue, RPM, engagement, video ID validity)
  - Higher-scored row becomes primary
  - Merges complementary data from secondary row
  - Combines source file names: `"API + CSV Upload"`

### 3.3 Unified Row Structure

```typescript
interface UnifiedRow {
 // Identity
 _id: string // Unique identifier
 _sourceFile: string // Origin (API, CSV filename)
 _userTag: string // Content type (shorts, long, traffic, etc.)

 // Video Metadata
 "Video title": string
 "Video ID": string
 Dimension: string
 Date: string
 "Duration (sec)": number
 Type: string // "Short" or "Long"
 titleLength: number

 // Performance Metrics
 Views: number
 "Watch Time (Hours)": number
 Revenue: number
 "Subscribers Gained": number
 "AVD (Sec)": number
 "AVP (%)": number
 "CTR (%)": number
 Impressions: number
 RPM: number

 // Engagement
 Likes: number
 Comments: number
 Shares: number
 engagementRate: number
}
```

---

## 4. DATA STORAGE

### 4.1 LocalStorage Keys

| Key                   | Purpose                  | Data Structure                                                |
| --------------------- | ------------------------ | ------------------------------------------------------------- |
| `yt_analytics_cache`  | Main analytics cache     | Complex object with profile, videos, stats, analytics reports |
| `vt_workspace_brain`  | Global application state | WorkspaceBrain object                                         |
| `vt_auth_state`       | Authentication state     | AuthState object                                              |
| `yt_api_key`          | Gemini API key           | String                                                        |
| `yt_model_preference` | AI model selection       | "pro" \| "flash"                                              |

### 4.2 Analytics Cache Structure

```typescript
interface AnalyticsCache {
  lastSynced: number;

  // Channel Identity
  profile: {
    id: string;
    name: string;
    subscriberCount: string;
    totalViews: string;
    totalVideos: string;
    profilePictureUrl: string;
    uploadsPlaylistId: string;
  };

  // Video Inventory
  videos: Array<{
    videoId: string;
    title: string;
    publishedAt: string;
    thumbnail: string;
  }>;

  // Video Statistics
  stats: Record<string, {
    viewCount: number;
    likeCount: number;
    commentCount: number;
    durationSeconds: number;
    durationRaw: string;
    isShort: boolean;
  }>;

  // Content Type Classification (Shorts Detection)
  videoContentType: Record<string, boolean>; // videoId -> isShort

  // Analytics Reports
  analytics: {
    columnHeaders: Array<{ name: string }>;
    rows: unknown[][];
  };
  channelAnalytics: { ... };
  dailyMetrics: { ... };
  trafficSources: { ... };
  demographics: { ... };
}
```

### 4.3 Global State (WorkspaceBrain)

```typescript
interface WorkspaceBrain {
 activeProviders: AppTool[]
 coreConcept: string
 targetNiche: string

 // SEO State
 seoState: {
  winningTitle: string | null
  winningKeywords: string[]
  descriptionDraft: string
  results: SeoResult[]
 }

 // Storyboard State
 storyboardState: {
  scenes: Scene[]
  estimatedDuration: number
  pacingHealth: "Warning" | "Healthy"
 }

 // Thumbnail State
 thumbnailState: {
  selectedStyle: string
  activeImageUrl: string | null
  prompt: string
 }

 // Analytical Constraints
 analyticalConstraints: {
  provenFormats: string[]
  forbiddenTopics: string[]
 }

 // Projects
 projects: Project[]

 // Calendar
 calendarState: {
  dayTasks: Record<string, Task[]>
 }

 // Channel Hub
 channelHub: {
  toDos: ToDoItem[]
  goals: GoalItem[]
 }

 // Channelytics State (Performance Hub)
 channelyticsState: {
  csvFiles: CsvFileWithTag[]
  allData: UnifiedRow[]
  analyticsResult: AnalyticsResult | null
 }

 // Research Lab State
 researchLabState: {
  csvFiles: CsvFileWithTag[]
  allData: UnifiedRow[]
  analyticsResult: AnalyticsResult | null
 }

 // Video Flags (for analysis exclusion/priority)
 videoFlags: Record<
  string,
  {
   excludeAnalysis?: boolean
   priorityAnalysis?: boolean
  }
 >
}
```

### 4.4 Persistence Strategy

- **Auto-Save**: GlobalDataContext persists brain state on every change
- **Smart Caching**: Analytics sync checks cache age (4-hour TTL)
- **Selective Persistence**: CSV file data not persisted (only metadata)
- **Auth State**: Separate storage key for authentication

---

## 5. DATA SYNC PROCESS (`src/services/analyticsSync.ts`)

### 5.1 Sync Trigger

- **Manual**: "Sync Now" button in Performance Hub
- **Automatic**: Every 30 minutes when authenticated
- **Smart Skip**: Skips if cache is less than 4 hours old

### 5.2 Sync Sequence

1. **Check Authentication** → `isChannelConnected()`
2. **Check Cache Age** → Skip if fresh (< 4 hours)
3. **Fetch Channel Profile** → Get channel ID and uploads playlist
4. **Fetch Video List** → Get all videos (up to 500)
5. **Fetch Video Stats** → Get views, likes, comments, duration
6. **Fetch Shorts Playlist IDs** → Identify Shorts (deprecated, returns empty)
7. **Fetch Video Content Type** → Use `creatorContentType` for accurate Shorts detection
8. **Fetch Video-Level Analytics** → Get per-video performance metrics
9. **Fetch Channel-Level Analytics** → Get daily aggregated data
10. **Fetch Demographic Analytics** → Get audience demographics
11. **Fetch Traffic Source Analytics** → Get traffic sources
12. **Fetch Daily Metrics** → Get complete time series
13. **Update Cache** → Save all data to localStorage
14. **Dispatch Event** → `yt_analytics_synced` custom event

### 5.3 Request Queueing

Uses `ytApiQueue` (RequestQueue.ts) to:

- Serialize API calls (avoid rate limiting)
- Implement exponential backoff
- Handle quota errors gracefully

---

## 6. AI ANALYSIS INTEGRATION (`src/services/gemini.ts`)

### 6.1 Supported AI Operations

| Operation           | Model                 | Input                         | Output                                           |
| ------------------- | --------------------- | ----------------------------- | ------------------------------------------------ |
| SEO Generation      | Gemini Pro            | Concept, niche, script, stats | Title sets, description, tags, thumbnail prompts |
| Keyword Analysis    | Gemini Flash          | Concept, niche                | LSI keywords, search intent, trend data          |
| Thumbnail Concept   | Gemini Flash          | SEO result or prompt          | Visual prompt, aspect ratio                      |
| Data Analysis       | Gemini Flash          | CSV data                      | AnalyticsResult with insights                    |
| Thumbnail Rating    | Gemini Pro/Image      | Image file                    | Score, analysis, fixes                           |
| Strategy Chat       | Gemini Pro + Thinking | Chat history                  | Strategic recommendations                        |
| Image Generation    | Gemini Image          | Text prompt                   | Base64 image                                     |
| Video Generation    | VEO                   | Text prompt                   | Video URL                                        |
| Speech Generation   | Gemini TTS            | Text                          | Base64 audio                                     |
| Audio Transcription | Gemini Flash          | Audio data                    | Transcribed text                                 |

### 6.2 Analysis Pipeline

**Function**: `analyzeChannelData(csvContent)`

1. Receives CSV-formatted unified data
2. Sends to Gemini with `DATA_ANALYSIS_SYSTEM_PROMPT`
3. Returns structured `AnalyticsResult`:
   - Executive summary
   - Performance analysis
   - Recommendations
   - Charts configuration

### 6.3 JSON Repair System

**Function**: `selfCorrectJson(brokenJson, schema)`

- Detects truncated/malformed JSON
- Uses AI to repair with schema guidance
- Handles unterminated strings, unclosed braces
- Extracts valid JSON from markdown code blocks

---

## 7. DATA VISUALIZATION

### 7.1 Chart Types Supported

#### Recharts Components

- LineChart, BarChart, AreaChart
- PieChart, ScatterChart, BubbleChart
- ResponsiveContainer for adaptive sizing

#### Google Charts

- GeoChart (geographic data)
- PieChart, ColumnChart, BarChart
- ComboChart, TreeMap
- Custom: TopPerformersTrio, GeographySplitView, ContentTypeDistribution

### 7.2 Data Filtering for Charts

**Function**: `getChartData(chart, data)`

- **Duration Filtering**: Filter by `_userTag` (shorts/long)
- **Sorting**: Recent, alphabetical, highest-rated
- **Aggregation**: Weekly/monthly frequency analysis
- **Outlier Handling**: Smart clipping at 10x median
- **Video Limit**: Configurable (default 30, radar 15)

### 7.3 Universal Data Table

**Component**: `UniversalDataTable`

- Overlay triggered by Database icon in tool headers
- Displays all unified rows with filtering
- Supports global vs local filter scoping
- Interactive: clicking rows filters all charts

---

## 8. DATA EXPORT

### 8.1 CSV Export

**Function**: `buildCsvFromRows(rows)`

- Converts UnifiedRow[] to CSV string
- Includes all canonical headers
- Proper escaping of special characters

### 8.2 Report Export

**Component**: `ReportViewer`

- Displays AI-generated analysis
- Markdown rendering
- Structured sections with charts

---

## 9. CROSS-COMPONENT DATA SHARING

### 9.1 Global Context (`useBrain()`)

All components access shared state through:

```typescript
const { brain, updateBrain, setResearchLabState, videoFlags, setVideoFlags } =
 useBrain()
```

### 9.2 Event System

| Event                 | Payload        | Listeners                                       |
| --------------------- | -------------- | ----------------------------------------------- |
| `yt_analytics_synced` | AnalyticsCache | PerformanceHub, ResearchLab, DataVizualizations |

### 9.3 State Synchronization

- **PerformanceHub** → Reads API cache, merges with CSV uploads
- **ResearchLab** → Uses `researchLabState` for separate analysis
- **DataVizualizations** → Consumes unified rows from either source
- **UniversalDataTable** → Shows combined data from all sources

---

## 10. DATA ADJUSTMENT & MANIPULATION

### 10.1 User Controls

#### Video Flags

- **Exclude from Analysis**: Checkbox in data tables
- **Priority Analysis Object**: Mark videos for focused AI analysis
- Stored in `brain.videoFlags[videoId]`

#### Tag Filtering

- Filter by content type (shorts, long, traffic, etc.)
- Applied in charts and tables
- Set during CSV upload or auto-detected

#### Data Source Selection

- CSV Only
- Analytics Only (API)
- Both (Hybrid with deduplication)

### 10.2 Computed Adjustments

| Adjustment             | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `adjustedAVP`          | Clamp AVP to 0-200% range                     |
| `engagementRate`       | Normalize engagement across view counts       |
| Cross-computed metrics | Fill gaps using mathematical relationships    |
| Outlier clipping       | Prevent extreme values from distorting charts |

---

## 11. DATA REPRESENTATION

### 11.1 Metric Color Coding

| Metric      | Color             |
| ----------- | ----------------- |
| Views       | #FF7497 (Pink)    |
| Revenue     | #CCFF00 (Lime)    |
| Subscribers | #00CCFF (Cyan)    |
| Watch Time  | #FFDD00 (Yellow)  |
| CTR         | #FF00FF (Magenta) |
| AVP         | #00FFCC (Teal)    |

### 11.2 Content Type Colors

| Type           | Color            |
| -------------- | ---------------- |
| Shorts         | #FF7497 (Pink)   |
| Long           | #00CCFF (Cyan)   |
| Traffic        | #CCFF00 (Lime)   |
| Audience       | #FFB158 (Orange) |
| Geography      | #B14AED (Purple) |
| Mixed/Combined | #FFDD00 (Yellow) |

---

## 12. COMPLETE DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA INGESTION                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐    ┌──────────────────────┐    ┌────────────────┐ │
│  │   YouTube APIs       │    │   CSV Uploads        │    │   AI Services  │ │
│  │                      │    │                      │    │                │ │
│  │ • Channel Profile    │    │ • CSV Files          │    │ • Gemini AI    │ │
│  │ • Video List         │    │ • ZIP Archives       │    │ • Analysis     │ │
│  │ • Video Stats        │    │ • Folder Uploads     │    │ • Generation   │ │
│  │ • Analytics Reports  │    │                      │    │                │ │
│  │ • Demographics       │    │                      │    │                │ │
│  │ • Traffic Sources    │    │                      │    │                │ │
│  └──────────────────────┘    └──────────────────────┘    └────────────────┘ │
│            │                            │                          │        │
│            ▼                            ▼                          ▼        │
│  ┌──────────────────────────────────────────────────────────────────────────┤
│  │                        RAW DATA LAYER                                     │
│  │                                                                           │
│  │  • API Responses (JSON)                                                   │
│  │  • CSV Rows (parsed objects)                                              │
│  │  • AI Generated Content                                                   │
│  └──────────────────────────────────────────────────────────────────────────┤
│            │                            │                                    │
│            ▼                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┤
│  │                    NORMALIZATION LAYER (dataNormalization.ts)             │
│  │                                                                           │
│  │  • Header Mapping (HEADER_MAP)                                            │
│  │  • Numeric Cleaning                                                       │
│  │  • Type Conversion                                                        │
│  │  • Special Field Handling                                                 │
│  └──────────────────────────────────────────────────────────────────────────┤
│            │                                                                  │
│            ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┤
│  │                    TRANSFORMATION LAYER (dataForge.ts)                    │
│  │                                                                           │
│  │  • Row Enrichment (normalizeAndEnrichRow)                                 │
│  │  • Computed Metrics (engagementRate, adjustedAVP, RPM, etc.)              │
│  │  • Cross-Computation (derive missing metrics)                             │
│  │  • Deduplication (dedupeByVideoDate)                                      │
│  │  • Merge Strategy (completeness scoring)                                  │
│  └──────────────────────────────────────────────────────────────────────────┤
│            │                                                                  │
│            ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┤
│  │                        UNIFIED ROW FORMAT                                 │
│  │                                                                           │
│  │  • _id, _sourceFile, _userTag                                             │
│  │  • Video Metadata (title, ID, date, duration, type)                       │
│  │  • Performance Metrics (views, watch time, revenue, subs)                 │
│  │  • Engagement (likes, comments, shares, engagementRate)                   │
│  │  • Derived Metrics (CTR, AVD, AVP, RPM, Impressions)                      │
│  └──────────────────────────────────────────────────────────────────────────┤
│            │                                                                  │
│            ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┤
│  │                        STORAGE LAYER                                      │
│  │                                                                           │
│  │  ┌─────────────────────┐    ┌─────────────────────┐                       │
│  │  │  localStorage       │    │  Global Context     │                       │
│  │  │                     │    │                     │                       │
│  │  │ • yt_analytics_cache│    │ • WorkspaceBrain    │                       │
│  │  │ • vt_workspace_brain│    │ • useBrain()        │                       │
│  │  │ • vt_auth_state     │    │ • State Updates     │                       │
│  │  │ • API keys          │    │ • Event Dispatch    │                       │
│  │  └─────────────────────┘    └─────────────────────┘                       │
│  └──────────────────────────────────────────────────────────────────────────┤
│            │                                                                  │
│            ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┤
│  │                      VISUALIZATION LAYER                                  │
│  │                                                                           │
│  │  ┌─────────────────────┐    ┌─────────────────────┐                       │
│  │  │  Recharts           │    │  Google Charts      │                       │
│  │  │                     │    │                     │                       │
│  │  │ • LineChart         │    │ • GeoChart          │                       │
│  │  │ • BarChart          │    │ • PieChart          │                       │
│  │  │ • PieChart          │    │ • ColumnChart       │                       │
│  │  │ • ScatterChart      │    │ • ComboChart        │                       │
│  │  │ • AreaChart         │    │ • TreeMap           │                       │
│  │  └─────────────────────┘    └─────────────────────┘                       │
│  │                                                                           │
│  │  ┌─────────────────────┐    ┌─────────────────────┐                       │
│  │  │  Custom Charts      │    │  Data Tables        │                       │
│  │  │                     │    │                     │                       │
│  │  │ • TopPerformersTrio │    │ • UniversalDataTable│                       │
│  │  │ • GeographySplitView│    │ • Master Video Table│                       │
│  │  │ • EngagementRanker  │    │ • Filtered Views    │                       │
│  │  └─────────────────────┘    └─────────────────────┘                       │
│  └──────────────────────────────────────────────────────────────────────────┤
│            │                                                                  │
│            ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┤
│  │                        AI ANALYSIS LAYER                                  │
│  │                                                                           │
│  │  • Channel Data Analysis (analyzeChannelData)                             │
│  │  • SEO Generation (generateSeoData)                                       │
│  │  • Keyword Research (generateKeywordAnalysis)                             │
│  │  • Strategy Recommendations (generateStrategyResponse)                    │
│  │  • Thumbnail Rating (rateThumbnail)                                       │
│  │  • Content Generation (images, video, audio)                              │
│  └──────────────────────────────────────────────────────────────────────────┤
│            │                                                                  │
│            ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┤
│  │                        EXPORT LAYER                                       │
│  │                                                                           │
│  │  • CSV Export (buildCsvFromRows)                                          │
│  │  • Report Viewer (ReportViewer component)                                 │
│  │  • Chart Data Export                                                      │
│  └──────────────────────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. KEY FILES REFERENCE

| File                                    | Purpose                               |
| --------------------------------------- | ------------------------------------- |
| `src/context/GlobalDataContext.tsx`     | Central state management, persistence |
| `src/services/analyticsSync.ts`         | YouTube API sync orchestration        |
| `src/services/youtubeService.ts`        | YouTube API client functions          |
| `src/services/dataNormalization.ts`     | Header mapping and normalization      |
| `src/services/dataForge.ts`             | Row enrichment and deduplication      |
| `src/services/csvImportUtils.ts`        | CSV parsing and tag detection         |
| `src/services/gemini.ts`                | AI analysis and generation            |
| `src/views/PerformanceHub.tsx`          | Main analytics dashboard              |
| `src/views/ResearchLab.tsx`             | Advanced chart visualizations         |
| `src/views/DataVizualizations.tsx`      | Chart rendering engine                |
| `src/components/UniversalDataTable.tsx` | Interactive data table                |
| `src/components/ReportViewer.tsx`       | AI report display                     |

---

## 14. SUMMARY

ViewTUBE implements a sophisticated multi-layered data architecture:

1. **Ingestion**: Multiple sources (YouTube APIs, CSVs, AI) feed raw data
2. **Normalization**: Standardizes polymorphic headers to canonical schema
3. **Transformation**: Enriches data with computed metrics and cross-computations
4. **Storage**: Dual persistence (localStorage cache + React context)
5. **Visualization**: Multiple charting libraries with interactive filtering
6. **AI Integration**: Gemini-powered analysis, generation, and recommendations
7. **Export**: CSV and report formats for data portability

The system is designed for reliability with request queueing, smart caching, automatic retry, and graceful degradation when APIs fail.
