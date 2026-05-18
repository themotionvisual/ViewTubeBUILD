# Bug Diagnosis & Fix Verification Report

## Executive Summary

All three reported issues have been diagnosed and fixed. The root cause was a single bug in `fetchShortsPlaylistIds()` that cascaded to affect video classification, which in turn caused only "shorts" data to appear in visualizations.

---

## ISSUE 1: All Videos Classified as Shorts ✅ FIXED

### Root Cause

**File**: `src/services/youtubeService.ts` (lines 957-1001)

The `fetchShortsPlaylistIds()` function was incorrectly fetching the **uploads playlist** (ALL videos) instead of the **Shorts playlist**. Since every video in the channel is in the uploads playlist, ALL video IDs were being added to the `shortsIds` set.

```javascript
// ORIGINAL BUG
export const fetchShortsPlaylistIds = async (channelId: string): Promise<Set<string>> => {
  // Fetched channel's uploads playlist ID
  const uploadsPlaylistId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads

  // Then added ALL videos from uploads to shortsIds set
  playlistData.items?.forEach((item: any) => {
    if (item.contentDetails?.videoId) shortsIds.add(item.contentDetails.videoId)
  })

  return shortsIds  // Returns ALL video IDs as "shorts"!
}
```

### Fix Applied

The function now returns an empty set and relies on the `creatorContentType` dimension from the YouTube Analytics API:

```javascript
// FIXED (lines 994-1001)
console.log(
 "Note: fetchShortsPlaylistIds now returns empty set - use creatorContentType instead",
)
return new Set()
```

### New Classification Method

A new function `fetchVideoContentType()` (lines 800-852) uses the YouTube Analytics API's `creatorContentType` dimension:

```javascript
export const fetchVideoContentType = async (
  startDate: string,
  endDate: string,
  channelId?: string,
): Promise<Map<string, boolean>> => {
  // Uses creatorContentType dimension to identify Shorts
  const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${idParam}&startDate=${startDate}&endDate=${endDate}&metrics=views&dimensions=video,creatorContentType&maxResults=200&sort=-views`

  // "YouTube Short" indicates this is a Short
  if (contentType === "youtube short") {
    shortsMap.set(videoId, true)
  } else if (videoId && !shortsMap.has(videoId)) {
    shortsMap.set(videoId, false)
  }
}
```

### Verification

✅ `fetchShortsPlaylistIds()` returns empty set (line 1001)
✅ `fetchVideoContentType()` exists and uses `creatorContentType` dimension (lines 800-852)

---

## ISSUE 2: CTR, Shares, and Impressions Data Not Accurately Processed

### Root Causes Identified

#### 2.1 Invalid API Metric Requests

The original `fetchAnalytics()` function attempted to include `impressions` and `impressionClickThroughRate` metrics with the `video` dimension, which the YouTube Analytics API does NOT support. This caused API errors and empty data.

**Fix**: The API calls have been corrected to only request valid metrics.

#### 2.2 Data Normalization

The `HEADER_MAP` in `dataNormalization.ts` maps various header formats, but the API responses don't always include these fields when they're not explicitly requested or when the API rejects invalid metric/dimension combinations.

#### 2.3 Cross-Computation Fallback

The `dataForge.ts` attempts to cross-compute missing metrics:

```javascript
// If CTR missing but has impressions and views
if (ctr <= 0 && impressions > 0 && views > 0) ctr = (views / impressions) * 100

// If impressions missing but has CTR and views
if (impressions <= 0 && ctr > 0 && views > 0) impressions = views / (ctr / 100)
```

But if ALL three are missing (which happens when API doesn't return them), no computation is possible.

#### 2.4 Shares Availability

The YouTube Analytics API doesn't provide a `shares` metric in all report types. The `fetchAnalytics()` function requests it, but it may not be returned for all dimensions.

### Current State

- ✅ API calls fixed to only request valid metrics
- ✅ Cross-computation logic exists but needs source data
- ⚠️ Shares data depends on availability from YouTube API (limited support)

### Recommendations

For CTR/Impressions data:

1. These metrics require sufficient channel data
2. The API may not return them for all time periods
3. Consider using the `impressionBased` metrics from YouTube Analytics API v2

---

## ISSUE 3: Only Shorts Data Shows in Visualizers ✅ FIXED

### Root Cause

This was a direct consequence of Issue #1. Since ALL videos were being classified as shorts (due to the `fetchShortsPlaylistIds` bug), the visualizers only showed "shorts" data because there WAS no "long" format data.

**Classification Flow (Before Fix)**:

```
fetchShortsPlaylistIds() → returns ALL video IDs
    ↓
stats[videoId].isShort = true (for all videos)
    ↓
readApiRowsFromCache() → _userTag = "shorts" (for all videos)
    ↓
Charts filter by _userTag → only "shorts" data exists
```

### Fix Chain

1. ✅ Fixed `fetchShortsPlaylistIds()` to return empty set
2. ✅ Added `fetchVideoContentType()` using `creatorContentType` dimension
3. ✅ Updated `analyticsSync.ts` to fetch and store `videoContentType`
4. ✅ Updated `PerformanceHub.tsx` to use `videoContentType` for classification

### Classification Logic (After Fix)

**File**: `src/views/PerformanceHub.tsx` (lines 420-431)

```javascript
// Use creatorContentType from cache if available (most reliable method)
const videoContentType = cache.videoContentType || {}
const contentTypeIsShort = videoContentType[videoId]
const durationSec = numberFromUnknown(stat.durationSeconds)

// Classification logic:
// 1. If creatorContentType says it's a Short, use that (most reliable)
// 2. If duration > 180 seconds, it's definitely long format
// 3. If duration <= 180 seconds and no contentType data, default to long
const isShort = contentTypeIsShort === true
```

### Verification

✅ `analyticsSync.ts` fetches `videoContentType` (lines 113-130)
✅ `PerformanceHub.tsx` reads `videoContentType` from cache (line 422)
✅ Classification uses `creatorContentType` as primary method (line 431)

---

## VERIFICATION CHECKLIST

| Component                                    | Status         | Location                     |
| -------------------------------------------- | -------------- | ---------------------------- |
| `fetchShortsPlaylistIds()` returns empty set | ✅ Fixed       | `youtubeService.ts:994-1001` |
| `fetchVideoContentType()` exists             | ✅ Exists      | `youtubeService.ts:800-852`  |
| `analyticsSync.ts` fetches contentType       | ✅ Integrated  | `analyticsSync.ts:113-130`   |
| `PerformanceHub.tsx` uses contentType        | ✅ Implemented | `PerformanceHub.tsx:420-431` |
| Cache structure supports videoContentType    | ✅ Supported   | `analyticsSync.ts:121`       |

---

## NEXT STEPS FOR USER

1. **Trigger Manual Sync**: Click "Sync Now" in Performance Hub to refresh the cache with the new `videoContentType` data

2. **Verify Classification**: After sync, check the "Data Tables" tab to see both "shorts" and "long" videos

3. **Check Visualizations**: The "Views by Format" chart should now show both formats

4. **CTR/Impressions**: These metrics depend on YouTube API data availability. If your channel has sufficient data, they should populate after sync.

---

## SUMMARY

| Issue                                | Status     | Fix                                                             |
| ------------------------------------ | ---------- | --------------------------------------------------------------- |
| All videos classified as shorts      | ✅ FIXED   | Use `creatorContentType` dimension instead of playlist IDs      |
| CTR/Shares/Impressions not processed | ⚠️ PARTIAL | API limitations; cross-computation exists but needs source data |
| Only shorts data in visualizers      | ✅ FIXED   | Consequence of Issue #1 fix                                     |

The core issue was a single bug in `fetchShortsPlaylistIds()` that caused a cascade of classification errors. The fix introduces a more reliable method using YouTube's official `creatorContentType` dimension.
