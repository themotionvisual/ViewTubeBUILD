# ViewTube Data Processing & Data Flow Report

## Overview

This report documents how YouTube analytics data is collected, processed, cached, and displayed in the data tables throughout the ViewTube application.

---

## 1. Data Collection Layer (`analyticsSync.ts`)

### Entry Point

The `performSync()` function in `src/services/analyticsSync.ts` is responsible for collecting all YouTube analytics data.

### Data Collection Sequence

#### Step 1: Channel Profile

```typescript
const profile = await ytApiQueue.add(() => fetchChannelProfile())
```

- Fetches basic channel information (channel ID, title, uploads playlist ID)
- Stored in cache as `cacheData.profile`

#### Step 2: Video List

```typescript
videos = await ytApiQueue.add(() =>
 fetchVideoList(500, undefined, profile.uploadsPlaylistId),
)
```

- Fetches up to 500 videos from the channel's uploads playlist
- Returns: `videoId`, `title`, `publishedAt` for each video
- Stored in cache as `cacheData.videos`

#### Step 3: Video Statistics

```typescript
const [rawStats, shortsPlaylistIds] = await Promise.all([
 ytApiQueue.add(() => fetchVideoStats(videoIds)),
 ytApiQueue.add(() => fetchShortsPlaylistIds(profile.id)),
])
```

- Fetches public statistics for all videos (views, likes, comments, duration)
- Fetches Shorts playlist IDs to identify Shorts videos
- Stored in cache as `cacheData.stats` with structure:
  ```typescript
  {
    [videoId]: {
      viewCount: number,
      likeCount: number,
      commentCount: number,
      durationSeconds: number,
      durationRaw: string,
      isShort: boolean
    }
  }
  ```

#### Step 4: Video-Level Analytics

```typescript
const analytics = await ytApiQueue.add(() =>
 fetchAnalytics(startDate, endDate, profile.id),
)
```

- Fetches video-level analytics from YouTube Analytics API
- Date range: Last 31 days to 3 days ago
- Metrics collected: `views`, `estimatedMinutesWatched`, `subscribersGained`, `estimatedRevenue`, `likes`, `comments`, `shares`, `impressions`, `impressionClickThroughRate`, `engagedViews`
- Dimension: `video`
- Stored in cache as `cacheData.analytics` with structure:
  ```typescript
  {
    columnHeaders: [{ name: 'video' }, { name: 'views' }, ...],
    rows: [
      ['videoId1', '15000', '45000', ...],
      ['videoId2', '8000', '12000', ...],
    ]
  }
  ```

#### Step 5: Content Type Classification

```typescript
const contentTypeMap = await ytApiQueue.add(() =>
 fetchVideoContentType(startDate, endDate, profile.id),
)
```

- Fetches `creatorContentType` dimension to classify videos
- Possible values: `shorts`, `video_on_demand`, `live_stream`, `story`
- Stored in cache as `cacheData.videoContentType`:
  ```typescript
  {
    [videoId]: 'shorts',
    [videoId2]: 'video_on_demand',
  }
  ```

#### Step 6: Channel-Level Analytics

```typescript
const channelAnalytics = await ytApiQueue.add(() =>
 fetchChannelAnalytics(startDate, endDate, profile.id),
)
```

- Fetches channel-wide analytics (no video dimension)
- Same metrics as video-level but aggregated for the entire channel
- Stored in cache as `cacheData.channelAnalytics`

#### Step 7: Demographic Analytics

```typescript
const demographics = await ytApiQueue.add(() =>
 fetchDemographicAnalytics(startDate, endDate, profile.id),
)
```

- Fetches age and gender breakdown data
- Stored in cache as `cacheData.demographics`

#### Step 8: Traffic Source Analytics

```typescript
const trafficSources = await ytApiQueue.add(() =>
 fetchTrafficSourceAnalytics(startDate, endDate, profile.id),
)
```

- Fetches traffic source breakdown data
- Stored in cache as `cacheData.trafficSources`

#### Step 9: Daily Metrics

```typescript
const dailyMetrics = await ytApiQueue.add(() =>
 fetchDailyAnalytics(startDate, endDate, profile.id),
)
```

- Fetches day-by-day metrics for trend analysis
- Stored in cache as `cacheData.dailyMetrics`

### Cache Storage

After all data is collected, it's stored in `localStorage` under the key `yt_analytics_cache`:

```typescript
localStorage.setItem("yt_analytics_cache", JSON.stringify(cacheData))
```

### Smart Caching

- Cache is valid for 4 hours
- If cache is less than 4 hours old, sync is skipped
- Force sync can bypass the cache check

---

## 2. Cache Structure

The `yt_analytics_cache` in localStorage contains:

```typescript
{
  lastSynced: number,           // Timestamp of last sync
  profile: {
    id: string,                 // Channel ID
    title: string,              // Channel title
    uploadsPlaylistId: string   // Uploads playlist ID
  },
  videos: Array<{
    videoId: string,
    title: string,
    publishedAt: string
  }>,
  stats: Record<string, {
    viewCount: number,
    likeCount: number,
    commentCount: number,
    durationSeconds: number,
    durationRaw: string,
    isShort: boolean,
    contentType?: string
  }>,
  analytics: {
    columnHeaders: Array<{ name: string }>,
    rows: Array<Array<string>>
  },
  videoContentType: Record<string, string>,  // videoId -> 'shorts' | 'video_on_demand' | 'live_stream' | 'story'
  channelAnalytics: {
    columnHeaders: Array<{ name: string }>,
    rows: Array<Array<string>>
  },
  demographics: {
    columnHeaders: Array<{ name: string }>,
    rows: Array<Array<string>>
  },
  trafficSources: {
    columnHeaders: Array<{ name: string }>,
    rows: Array<Array<string>>
  },
  dailyMetrics: {
    columnHeaders: Array<{ name: string }>,
    rows: Array<Array<string>>
  }
}
```

---

## 3. Data Reading Layer (`PerformanceHub.tsx`)

### Main Data Reading Function: `readApiRowsFromCache()`

This function reads the cache and transforms it into `UnifiedRow[]` format for display.

#### Process:

1. **Load Cache**

   ```typescript
   const cacheRaw = localStorage.getItem("yt_analytics_cache")
   const cache = JSON.parse(cacheRaw)
   ```

2. **Build Analytics Map**

   ```typescript
   const analyticsMapById = new Map<string, Record<string, unknown>>()
   const analyticsMapByTitle = new Map<string, Record<string, unknown>>()
   ```

   - Creates lookup maps for fast data retrieval
   - Maps video ID and title to their analytics data

3. **Process Each Video**

   ```typescript
   return (cache.videos || []).map((video, index) => {
    const videoId = textFromUnknown(video.videoId)
    const stat = stats[videoId] ?? {}
    const title = textFromUnknown(video.title)
    const analyticRaw =
     analyticsMapById.get(videoId) ||
     analyticsMapByTitle.get(lookupKey(title)) ||
     {}
    const analytic = normalizeAndEnrichRow(analyticRaw, stat)
    // ... create UnifiedRow
   })
   ```

4. **Normalize and Enrich**
   The `normalizeAndEnrichRow()` function:
   - Converts string values to numbers
   - Calculates derived metrics (AVD, AVP, RPM)
   - Determines content type (Shorts vs Long-form)
   - Handles missing data with fallbacks

### Data Source Modes

The PerformanceHub supports three data source modes:

1. **CSV Only** (`dataSource === "csv"`): Uses only uploaded CSV data
2. **API Only** (`dataSource === "api"`): Uses only YouTube API data from cache
3. **Both/Hybrid** (`dataSource === "both"`): Merges CSV and API data

```typescript
const unifiedRows = useMemo(() => {
 if (dataSource === "csv") return csvRows
 if (dataSource === "api") return apiRows
 if (csvRows.length === 0) return apiRows
 if (apiRows.length === 0) return csvRows
 return mergeAndDedupeRows([...csvRows, ...apiRows]) as UnifiedRow[]
}, [dataSource, csvRows, apiRows])
```

---

## 4. Data Table Components

### RawDataTable (`src/components/RawDataTable.tsx`)

Displays raw video-level analytics data in a table format.

**Data Flow:**

1. Reads from `yt_analytics_cache` directly
2. Combines analytics data with video stats
3. Displays columns: Title, Views, Impressions, CTR, Watch Time, Subs, Likes, Comments, Shares, Revenue

### DataDashboard (`src/components/DataDashboard.tsx`)

Displays channel overview and video performance summary.

**Data Flow:**

1. Reads from `yt_analytics_cache`
2. Calculates channel-wide statistics
3. Shows content type breakdown (Shorts vs Long-form)

### SimpleAnalyticsChart (`src/components/SimpleAnalyticsChart.tsx`)

Direct API fetch component (currently experiencing 403 errors due to API quota).

**Data Flow:**

1. Fetches video list from YouTube Data API
2. Fetches analytics from YouTube Analytics API
3. Combines and displays data

---

## 5. UnifiedRow Structure

The `UnifiedRow` type is the standard format for all video data:

```typescript
interface UnifiedRow {
 // Identification
 videoId: string
 title: string
 date: string

 // Content Classification
 contentType: "shorts" | "long" | "live" | "story"
 titleLength: number
 duration: number

 // Performance Metrics
 views: number
 impressions: number
 ctr: number // Impression click-through rate
 engagedViews: number
 watchTimeHours: number
 watchTimeMinutes: number
 avd: number // Average view duration (seconds)
 avp: number // Average view percentage

 // Engagement
 subsGained: number
 likes: number
 comments: number
 shares: number

 // Revenue
 revenue: number
 rpm: number // Revenue per mille (per 1000 views)
 engagementRate: number

 // Source tracking
 source: "csv" | "api"
}
```

---

## 6. Key Processing Functions

### `normalizeAndEnrichRow()`

Converts raw API data into normalized format:

- Parses string numbers to floats
- Calculates AVD (Average View Duration)
- Calculates AVP (Average View Percentage)
- Calculates RPM (Revenue Per Mille)
- Determines content type

### `canonicalKey()`

Normalizes column header names for consistent lookup:

- `video` → `video`
- `views` → `views`
- `impressionClickThroughRate` → `ctr`
- etc.

### `mergeAndDedupeRows()`

Merges CSV and API data:

- Prioritizes CSV data when both exist
- Deduplicates by video ID
- Combines metrics from both sources

---

## 7. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    YouTube APIs                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐│
│  │ Data API    │ │ Analytics   │ │ Analytics                   ││
│  │ (videos,    │ │ API         │ │ API                         ││
│  │ stats)      │ │ (video)     │ │ (channel, demo, traffic)    ││
│  └──────┬──────┘ └──────┬──────┘ └──────────────┬──────────────┘│
│         │                │                       │                │
│         └────────────────┴───────────────────────┘                │
│                              │                                    │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │              analyticsSync.ts - performSync()                ││
│  │  1. Fetch channel profile                                    ││
│  │  2. Fetch video list                                         ││
│  │  3. Fetch video stats                                        ││
│  │  4. Fetch video-level analytics                              ││
│  │  5. Fetch content type classification                        ││
│  │  6. Fetch channel-level analytics                            ││
│  │  7. Fetch demographics                                       ││
│  │  8. Fetch traffic sources                                    ││
│  │  9. Fetch daily metrics                                      ││
│  │ 10. Enrich stats with contentType                            ││
│  │ 11. Store in localStorage                                    ││
│  └───────────────────────────┬──────────────────────────────────┘│
│                              │                                    │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │              localStorage: yt_analytics_cache                ││
│  │  { profile, videos, stats, analytics, videoContentType,     ││
│  │    channelAnalytics, demographics, trafficSources,          ││
│  │    dailyMetrics, lastSynced }                               ││
│  └───────────────────────────┬──────────────────────────────────┘│
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    PerformanceHub.tsx                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           readApiRowsFromCache()                           │ │
│  │  1. Load cache from localStorage                           │ │
│  │  2. Build analytics map by video ID                        │ │
│  │  3. Build analytics map by title                           │ │
│  │  4. For each video in cache.videos:                        │ │
│  │     - Get stats from cache.stats                           │ │
│  │     - Get analytics from maps                              │ │
│  │     - Normalize and enrich data                            │ │
│  │     - Create UnifiedRow                                    │ │
│  │  5. Return UnifiedRow[]                                    │ │
│  └─────────────────────────┬──────────────────────────────────┘ │
│                            │                                    │
│                            ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              unifiedRows (UnifiedRow[])                    │ │
│  │  Merged with CSV data if in "both" mode                    │ │
│  └─────────────────────────┬──────────────────────────────────┘ │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Data Table Components                          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   RawDataTable  │ │  DataDashboard  │ │ SimpleAnalytics │   │
│  │                 │ │                 │ │     Chart       │   │
│  │ Displays raw    │ │ Channel overview│ │ Direct API      │   │
│  │ video data in   │ │ and video       │ │ fetch (403      │   │
│  │ table format    │ │ performance     │ │ errors)         │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. Current Issues

### 403 Forbidden Errors

The `SimpleAnalyticsChart`, `DataDashboard`, and `RawDataTable` components are experiencing 403 errors when trying to fetch data directly from the YouTube Data API:

```
GET https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&maxResults=50&order=date 403 (Forbidden)
```

**Cause:** YouTube API quota exceeded or missing scopes.

**Solution:** These components should read from the `yt_analytics_cache` instead of making new API calls. The `readApiRowsFromCache()` function in PerformanceHub already does this correctly.

---

## 9. Viewing Data in Console

To view the cached analytics data:

```javascript
// View entire cache
JSON.parse(localStorage.getItem("yt_analytics_cache"))

// View video-level analytics
const cache = JSON.parse(localStorage.getItem("yt_analytics_cache"))
const headers = cache.analytics?.columnHeaders?.map((h) => h.name) || []
cache.analytics?.rows?.forEach((row) => {
 console.log(
  `${row[headers.indexOf("video")]}: Views=${row[headers.indexOf("views")]}`,
 )
})

// View content type classification
console.log(cache.videoContentType)

// View channel analytics
console.log(cache.channelAnalytics)
```

---

## 10. Summary

1. **Data Collection**: `analyticsSync.ts` collects data from multiple YouTube APIs
2. **Caching**: All data is stored in `yt_analytics_cache` in localStorage
3. **Cache Validity**: 4 hours before refresh
4. **Data Reading**: `readApiRowsFromCache()` transforms cache into `UnifiedRow[]`
5. **Display**: Data tables read from `unifiedRows` or directly from cache
6. **Data Sources**: Supports CSV, API, or hybrid modes
7. **Content Classification**: Uses `creatorContentType` dimension for accurate Shorts detection
