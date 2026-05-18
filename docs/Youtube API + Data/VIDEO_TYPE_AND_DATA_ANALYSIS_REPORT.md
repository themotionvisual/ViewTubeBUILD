# ViewTube Video Type and Data Analysis Report

## Executive Summary

This report analyzes how ViewTube determines video types (Long vs Short), handles data collection from YouTube APIs, and processes metrics like subscribers, shares, RPM, CTR, revenue, impressions, AVD, and AVP. It also explains why tables show different data and clarifies the time periods represented.

## 1. Video Type Classification (Long vs Short)

### Current Implementation

**Primary Method: Duration-Based Classification**

- Videos ≤ 60 seconds = **Shorts**
- Videos > 180 seconds = **Long-form**
- Videos 61-180 seconds = **Long-form** (default)

### Code Location

`src/services/youtubeService.ts` lines 800-859

```typescript
// Duration-based detection since creatorContentType is not a valid API dimension
// Videos <= 60 seconds are classified as Shorts, > 180 seconds as Long-form
export const fetchVideoContentType = async (
 startDate: string,
 endDate: string,
 channelId?: string,
): Promise<Map<string, boolean>> => {
 // Return empty map - classification will be done via duration in the calling code
 // The creatorContentType dimension is not valid in YouTube Analytics API v2
 console.log(
  "Using duration-based video classification (creatorContentType not available in API)",
 )
 return new Map()
}
```

### Why Duration-Based Classification?

1. **API Limitation**: The `creatorContentType` dimension was removed from YouTube Analytics API v2
2. **Reliability**: Duration is a consistent, reliable metric available in all data sources
3. **Simplicity**: Clear thresholds make classification deterministic

### Data Sources for Duration

1. **YouTube Data API v3**: Provides exact video duration in ISO 8601 format
2. **CSV Uploads**: Duration can be in various formats (seconds, MM:SS, HH:MM:SS)
3. **Analytics API**: May include duration in some reports

## 2. Data Collection and Processing

### Data Sources

ViewTube supports three primary data sources:

1. **YouTube Analytics API v2** (Live Data)
2. **CSV Uploads** (Historical/Exported Data)
3. **Manual Input** (Custom Data)

### Data Flow Architecture

```
Raw Data Sources → Normalization → Enrichment → Deduplication → Unified Data Store
```

### Key Processing Steps

#### A. Data Normalization (`src/services/dataNormalization.ts`)

**Header Mapping**: Maps 50+ different CSV header variations to standard names:

```typescript
export const HEADER_MAP: Record<string, string> = {
 // Core Metrics
 Views: "Views",
 "View count": "Views",
 "Watch time (hours)": "Watch Time (Hours)",
 "Estimated revenue": "Revenue",
 "Estimated revenue (USD)": "Revenue",
 RPM: "RPM",
 "RPM (USD)": "RPM",
 CPM: "CPM",
 "CPM (USD)": "CPM",
 Subscribers: "Subscribers Gained",
 "Subscribers gained": "Subscribers Gained",

 // Engagement
 Impressions: "Impressions",
 "Impressions click-through rate (%)": "CTR (%)",
 "Average view duration": "AVD (Sec)",
 "Average view percentage (%)": "AVP (%)",
 Likes: "Likes",
 Dislikes: "Dislikes",
 Comments: "Comments",
 Shares: "Shares",
}
```

#### B. Data Enrichment (`src/services/dataForge.ts`)

**Metric Calculation**: Automatically calculates missing metrics:

```typescript
// Engagement Rate Calculation
const engagementRate =
 views > 0
  ? Number(Math.max(0, ((likes + comments + shares) / views) * 100).toFixed(1))
  : 0

// RPM Calculation
if (rpm <= 0 && revenue > 0 && views > 0) rpm = (revenue / views) * 1000
if (revenue <= 0 && rpm > 0 && views > 0) revenue = (rpm * views) / 1000

// CTR Calculation
if (ctr <= 0 && impressions > 0 && views > 0) ctr = (views / impressions) * 100
if (impressions <= 0 && ctr > 0 && views > 0) impressions = views / (ctr / 100)
```

#### C. Data Deduplication

**Composite Key Strategy**: Uses video ID + date for deduplication:

```typescript
const compositeKey = (row: Record<string, unknown>): string => {
 const videoId = firstText(row, ["Video ID", "videoId", "Dimension", "Video"])
 const date = firstText(row, ["Date", "Video publish time", "publishedAt"])
 if (videoId && date) return `${videoId}|${date}`
 const fallbackTitle = firstText(row, ["Video title", "Video", "Dimension"])
 return `${videoId || fallbackTitle}|${date || "nodate"}`
}
```

## 3. Metric Processing Details

### A. Subscriber Data

**Collection Sources**:

- YouTube Analytics API: `subscribersGained` metric
- CSV uploads: Various header names ("Subscribers Gained", "Subscribers gained", etc.)
- Channel overview API: Total subscriber count

**Processing**:

```typescript
export const getSubscribers = (row: Record<string, unknown>): number => {
 // Try abbreviated name first (from normalized data)
 const abbr = getMetric(row, ["Subs +", "subs+"])
 if (abbr > 0) return abbr

 return getMetricByPattern(
  row,
  [
   "Subscribers Gained",
   "Subscribers gained",
   "Subscribers",
   "subscribersGained",
  ],
  ["subscriber"],
 )
}
```

### B. Share Data

**Collection Sources**:

- YouTube Analytics API: `shares` metric
- CSV uploads: Various header names ("Shares", "shareCount", etc.)

**Processing**:

```typescript
export const getShares = (row: Record<string, unknown>): number => {
 // Try various column name variations including abbreviated names
 const shares = getMetric(row, [
  "Shares",
  "shareCount",
  "Shares count",
  "shares",
 ])
 if (shares > 0) return shares
 return getMetricByPattern(row, [], ["share"])
}
```

### C. RPM (Revenue Per Mille)

**Calculation Logic**:

```typescript
export const getRpm = (row: Record<string, unknown>): number =>
 getMetricByPattern(
  row,
  ["RPM", "RPM (USD)", "Estimated RPM", "Revenue per mille (RPM)"],
  ["rpm"],
 )

// Auto-calculation if missing
if (rpm <= 0 && revenue > 0 && views > 0) rpm = (revenue / views) * 1000
if (revenue <= 0 && rpm > 0 && views > 0) revenue = (rpm * views) / 1000
```

### D. CTR (Click-Through Rate)

**Collection and Calculation**:

```typescript
export const getCtr = (row: Record<string, unknown>): number => {
 // Try various column name variations
 const raw = getMetric(row, [
  "CTR (%)",
  "CTR",
  "ctr",
  "Impressions click-through rate (%)",
  "impressionClickThroughRate",
  "clickThroughRate",
 ])
 if (raw > 0) return raw <= 1 ? raw * 100 : raw

 // Try to calculate from impressions and views
 const impressions = getImpressions(row)
 const views = getViews(row)
 if (impressions > 0 && views > 0) return (views / impressions) * 100
 return 0
}
```

### E. Revenue and RPM

**Currency Handling**: Supports USD and local currencies
**Auto-conversion**: If one metric is missing, calculates from the other

### F. AVD (Average View Duration) and AVP (Average View Percentage)

**Duration Processing**:

```typescript
const parseDurationSeconds = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 const raw = toText(value)
 if (!raw) return 0

 if (/^PT/.test(raw)) {
  // ISO 8601 format (PT1M30S)
  const match = raw.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = Number(match[1] || 0)
  const minutes = Number(match[2] || 0)
  const seconds = Number(match[3] || 0)
  return hours * 3600 + minutes * 60 + seconds
 }

 if (raw.includes(":")) {
  // Time format (MM:SS or HH:MM:SS)
  const parts = raw.split(":").map((p) => Number(p) || 0)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
 }

 return toNumber(raw)
}
```

**AVP Calculation**:

```typescript
let rawAvp =
 firstDefinedNumber(row, [
  "AVP (%)",
  "averageViewPercentage",
  "Average percentage viewed (%)",
 ]) ?? 0
if (rawAvp > 0 && rawAvp <= 1) rawAvp *= 100
if (rawAvp <= 0 && avdSeconds > 0 && durationSeconds > 0) {
 rawAvp = (avdSeconds / durationSeconds) * 100
}
const adjustedAVP = Math.min(Math.max(0, rawAvp), 200)
```

## 4. Why Tables Show Different Data

### A. Data Source Differences

1. **API Data**: Real-time, may have different aggregation periods
2. **CSV Data**: Historical snapshots, may be exported at different times
3. **Manual Data**: User-entered, potentially different calculation methods

### B. Normalization Effects

1. **Header Mapping**: Different source headers map to same standard names
2. **Metric Calculation**: Missing metrics auto-calculated from available data
3. **Unit Conversion**: Different sources use different units (hours vs minutes vs seconds)

### C. Time Period Differences

1. **API Data**: Typically daily, weekly, or monthly aggregates
2. **CSV Data**: Can be any custom time period
3. **Combined Data**: May show overlapping or non-overlapping periods

### D. Data Quality Issues

1. **Missing Values**: Some sources may not provide all metrics
2. **Rounding Differences**: Different precision in different sources
3. **Update Frequency**: Real-time vs batch updates

## 5. Data Time Periods

### A. Default Time Windows

Based on the interface, ViewTube supports:

1. **Custom Date Range**: User-selectable (currently showing Sep 5, 2025 - Mar 14, 2026)
2. **CSV Data**: Depends on the uploaded file's date range
3. **API Data**: Configurable, typically last 30-90 days

### B. Data Aggregation Levels

1. **Daily**: Individual day-level data
2. **Video-Level**: Per-video metrics
3. **Channel-Level**: Overall channel performance
4. **Traffic Source**: Performance by traffic source
5. **Geographic**: Performance by country/region

### C. Data Freshness

1. **YouTube Analytics API**: Typically 48-72 hours behind real-time
2. **YouTube Data API**: Near real-time for basic metrics
3. **CSV Uploads**: As recent as the export date

## 6. Recommendations

### A. For Consistent Data

1. **Standardize Upload Format**: Use consistent CSV headers
2. **Regular API Syncs**: Schedule regular data pulls from YouTube APIs
3. **Data Validation**: Implement validation rules for uploaded data

### B. For Better Video Classification

1. **Consider Aspect Ratio**: Use video dimensions to improve Shorts detection
2. **Hashtag Analysis**: Check for #shorts in video descriptions
3. **Playlist Analysis**: Identify Shorts playlist membership

### C. For Data Quality

1. **Implement Data Auditing**: Track data source and quality metrics
2. **Add Data Lineage**: Track which source each metric came from
3. **Improve Error Handling**: Better handling of malformed or missing data

## Conclusion

ViewTube has a sophisticated data processing pipeline that handles multiple data sources, normalizes diverse formats, and provides comprehensive metrics. The duration-based video classification is a practical solution given API limitations. The different data in tables reflects the complexity of aggregating data from multiple sources with different update frequencies and calculation methods.

The system's strength lies in its flexibility to handle various data formats while providing consistent, normalized output for analysis and visualization.
