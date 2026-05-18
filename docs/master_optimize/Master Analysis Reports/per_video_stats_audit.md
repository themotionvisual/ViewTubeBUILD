# per_video_stats_audit.md - Consolidated

> [!NOTE]
> This file consolidates 2 version(s) from different conversations.
> Latest version appears at the bottom.

---

## Version 1 (from artifacts)

**Metadata:**
- artifactType: ARTIFACT_TYPE_OTHER
- summary: Full audit comparing currently-synced per-video YouTube analytics metrics against all available metrics across 3 YouTube APIs (Data API v3, Analytics API v2, Reporting API). Includes workarounds for impressions, CTR, stayed-to-watch, and other missing metrics using Content Owner reports, traffic source reports, and the Bulk Reporting API.
- updatedAt: 2026-04-29T06:34:18.068927Z
- requestFeedback: True


## The 3 YouTube APIs

| API | Endpoint | Purpose |
|---|---|---|
| **Data API v3** | `youtube.googleapis.com/youtube/v3` | Video metadata, thumbnails, public counts |
| **Analytics API v2** | `youtubeanalytics.googleapis.com/v2/reports` | Targeted real-time queries, per-video metrics |
| **Reporting API** (Bulk) | `youtubereporting.googleapis.com/v1` | Pre-generated bulk CSV reports, full historical data |

---

## Currently Synced Per-Video Metrics

From `analyticsByWindow` → `report.rows` (keyed by videoId), using **Analytics API v2** with `channel==MINE`:

| # | Metric | Group |
|---|---|---|
| 1 | `views` | View |
| 2 | `estimatedMinutesWatched` | Watch Time |
| 3 | `averageViewDuration` | Watch Time |
| 4 | `averageViewPercentage` | Watch Time |
| 5 | `subscribersGained` | Engagement |
| 6 | `subscribersLost` | Engagement |
| 7 | `likes` | Engagement |
| 8 | `dislikes` | Engagement |
| 9 | `comments` | Engagement |
| 10 | `shares` | Engagement |
| 11 | `engagedViews` | View |
| 12 | `videosAddedToPlaylists` | Engagement |
| 13 | `videosRemovedFromPlaylists` | Engagement |
| 14 | `estimatedRevenue` | Revenue 💰 |
| 15 | `estimatedAdRevenue` | Revenue 💰 |
| 16 | `grossRevenue` | Revenue 💰 |
| 17 | `cpm` | Ad Performance 💰 |
| 18 | `monetizedPlaybacks` | Ad Performance 💰 |
| 19 | `playbackBasedCpm` | Ad Performance 💰 |
| 20 | `adImpressions` | Ad Performance 💰 |
| 21 | `estimatedRedPartnerRevenue` | Revenue 💰 |
| 22 | `annotationClickThroughRate` | Annotations |
| 23 | `annotationCloseRate` | Annotations |
| 24 | `redViews` | View |
| 25 | `cardClickRate` | Cards |
| 26 | `cardImpressions` | Cards |
| 27 | `cardClicks` | Cards |

**Total currently synced: 27 metrics**

---

## NOT Synced — Marked `false` in `availabilityByWindow`

| Metric Key | Display Name | Why It Fails |
|---|---|---|
| `impressions` | Thumbnail Impressions | `videoThumbnailImpressions` unsupported w/ `video` dim + `channel==MINE` |
| `ctr` | Impressions Click-Through Rate | `videoThumbnailImpressionsClickRate` same reason |
| `stw` | Stayed to Watch | Not in YT Analytics API at all |
| `rpm` | Revenue Per Mille | Not available per-video |
| `newViewers` | New Viewers | Not in API |
| `returningViewers` | Returning Viewers | Not in API |
| `casualViewers` | Casual Viewers | Not in API |
| `regularViewers` | Regular Viewers | Not in API |
| `uniqueViewers` | Unique Viewers | Not in API |
| `endScreenClickRate` | End Screen CTR | Not fetched (but fetchable — see below) |

---

## Full Universe of Per-Video Metrics Across All 3 APIs

### ✅ = Currently syncing | 🔶 = Available but NOT synced | ❌ = Not available per-video

#### View Metrics
| Metric | Status | Available Via |
|---|---|---|
| `views` | ✅ | Analytics API |
| `engagedViews` | ✅ | Analytics API |
| `redViews` | ✅ | Analytics API |
| `uniqueViewers` / `uniques` | 🔶 | **Content Owner reports** (time-based, line 357 of docs) |

#### Reach / Impressions Metrics
| Metric | Status | Available Via |
|---|---|---|
| `videoThumbnailImpressions` | 🔶 | **Content Owner** basic stats (line 333), top videos (line 703), traffic source (line 581), device type (line 616) |
| `videoThumbnailImpressionsClickRate` | 🔶 | Same reports as above |

> [!IMPORTANT]
> **These ARE available per-video — but only via Content Owner reports** (`ids=contentOwner==OWNER_NAME`), NOT via `channel==MINE`. Your current code uses `channel==MINE` which is why it fails. Switching to Content Owner mode unlocks impressions + CTR.

#### Watch Time Metrics
| Metric | Status | Available Via |
|---|---|---|
| `estimatedMinutesWatched` | ✅ | Analytics API |
| `averageViewDuration` | ✅ | Analytics API |
| `averageViewPercentage` | ✅ | Analytics API |
| `estimatedRedMinutesWatched` | 🔶 | Analytics API (just not requested) |

#### Engagement Metrics
| Metric | Status | Available Via |
|---|---|---|
| `comments` | ✅ | Analytics API |
| `likes` | ✅ | Analytics API |
| `dislikes` | ✅ | Analytics API |
| `shares` | ✅ | Analytics API |
| `subscribersGained` | ✅ | Analytics API |
| `subscribersLost` | ✅ | Analytics API |
| `videosAddedToPlaylists` | ✅ | Analytics API |
| `videosRemovedFromPlaylists` | ✅ | Analytics API |

#### Annotation Metrics
| Metric | Status | Available Via |
|---|---|---|
| `annotationClickThroughRate` | ✅ | Analytics API |
| `annotationCloseRate` | ✅ | Analytics API |
| `annotationImpressions` | 🔶 | Analytics API (just not requested) |
| `annotationClickableImpressions` | 🔶 | Analytics API (just not requested) |
| `annotationClosableImpressions` | 🔶 | Analytics API (just not requested) |
| `annotationClicks` | 🔶 | Analytics API (just not requested) |
| `annotationCloses` | 🔶 | Analytics API (just not requested) |

#### Card Metrics
| Metric | Status | Available Via |
|---|---|---|
| `cardClickRate` | ✅ | Analytics API |
| `cardImpressions` | ✅ | Analytics API |
| `cardClicks` | ✅ | Analytics API |
| `cardTeaserImpressions` | 🔶 | Analytics API (just not requested) |
| `cardTeaserClicks` | 🔶 | Analytics API (just not requested) |
| `cardTeaserClickRate` | 🔶 | Analytics API (just not requested) |

#### Revenue / Ad Performance Metrics (💰 requires monetary scope)
| Metric | Status | Available Via |
|---|---|---|
| `estimatedRevenue` | ✅ | Analytics API |
| `estimatedAdRevenue` | ✅ | Analytics API |
| `grossRevenue` | ✅ | Analytics API |
| `cpm` | ✅ | Analytics API |
| `monetizedPlaybacks` | ✅ | Analytics API |
| `playbackBasedCpm` | ✅ | Analytics API |
| `adImpressions` | ✅ | Analytics API |
| `estimatedRedPartnerRevenue` | ✅ | Analytics API |

#### Audience Retention Metrics (per-video, single-video filter only)
| Metric | Status | Available Via |
|---|---|---|
| `audienceWatchRatio` | 🔶 | Analytics API — requires `elapsedVideoTimeRatio` dimension, single `video` filter |
| `relativeRetentionPerformance` | 🔶 | Same as above |
| `startedWatching` | 🔶 | Same |
| `stoppedWatching` | 🔶 | Same |
| `totalSegmentImpressions` | 🔶 | Same |

> [!NOTE]
> Retention metrics require a **separate API call per video** — cannot batch. Use `dimensions=elapsedVideoTimeRatio` + `filters=video==VIDEO_ID`.

#### Demographics (per-video)
| Metric | Status | Available Via |
|---|---|---|
| `viewerPercentage` (by ageGroup/gender) | 🔶 | Analytics API — `dimensions=ageGroup,gender` + `filters=video==VIDEO_ID` |

#### Traffic Source Metrics (per-video)
| Metric | Status | Available Via |
|---|---|---|
| Traffic by `insightTrafficSourceType` | 🔶 | Analytics API — `dimensions=insightTrafficSourceType` + `filters=video==VIDEO_ID` |
| Traffic detail by `insightTrafficSourceDetail` | 🔶 | Analytics API — top 25 referrers per source type |
| `videoThumbnailImpressions` by traffic source | 🔶 | **Content Owner** traffic source report (line 581) |
| `videoThumbnailImpressionsClickRate` by traffic source | 🔶 | Same |

#### Device / OS Metrics (per-video)
| Metric | Status | Available Via |
|---|---|---|
| Views by `deviceType` | 🔶 | Analytics API |
| Views by `operatingSystem` | 🔶 | Analytics API |
| Impressions by device/OS | 🔶 | **Content Owner** device reports (lines 616-646) |

#### Playback Location (per-video)
| Metric | Status | Available Via |
|---|---|---|
| Views by `insightPlaybackLocationType` | 🔶 | Analytics API |
| Top embedded players | 🔶 | Analytics API (top 25) |

#### Geography (per-video)
| Metric | Status | Available Via |
|---|---|---|
| Views/watchtime by `country` | 🔶 | Analytics API |
| Views by `province` (US) | 🔶 | Analytics API |
| Views by `city` (top 250) | 🔶 | Analytics API |

#### Livestream Metrics (per-video, live content only)
| Metric | Status | Available Via |
|---|---|---|
| `averageConcurrentViewers` | 🔶 | Analytics API |
| `peakConcurrentViewers` | 🔶 | Analytics API |

---

## Workarounds for the Big 3 Missing Metrics

### 1. Impressions + CTR → **Content Owner Reports**

> [!IMPORTANT]
> This is the primary workaround. Your docs (lines 333, 357, 703) confirm `videoThumbnailImpressions` and `videoThumbnailImpressionsClickRate` **ARE supported** in Content Owner reports.

**Current (broken):**
```
ids=channel==MINE
dimensions=video
metrics=...,videoThumbnailImpressions,videoThumbnailImpressionsClickRate
```

**Fix — switch to Content Owner:**
```
ids=contentOwner==YOUR_CONTENT_OWNER_ID
dimensions=video     (or day + filters=video==ID)
metrics=videoThumbnailImpressions,videoThumbnailImpressionsClickRate
filters=uploaderType==self   (or channel==YOUR_CHANNEL_ID)
```

**Available report types with impressions:**
- **Basic stats** (no time dim): `filters=video==ID` → aggregate impressions/CTR
- **Time-based** (`dimensions=day`): `filters=video==ID` → daily impressions/CTR
- **Top videos** (`dimensions=video`): `filters=channel==ID` → ranked by impressions
- **Traffic source** (`dimensions=insightTrafficSourceType`): impressions by source
- **Device type** (`dimensions=deviceType`): impressions by device

**Scope required:** `https://www.googleapis.com/auth/youtubepartner`

### 2. Stayed to Watch (STW) → **Not in any official API**

> [!WARNING]
> "Stayed to watch" is a YouTube Studio-only metric. No official API exposes it.

**Workarounds:**
- **Approximate from retention data**: Fetch `audienceWatchRatio` at `elapsedVideoTimeRatio` ≈ 0.01-0.03 (first 1-3% of video). Viewers still present at that point ~= "stayed to watch." Not exact but close proxy.
- **YouTube Studio internal API** (undocumented): Session-cookie authenticated calls to `https://studio.youtube.com/youtubei/v1/analytics_data/...` — fragile, may break anytime, but gives exact STW.
- **Calculate from impressions + views**: `STW ≈ views / impressions × CTR adjustment`. Rough but derivable once impressions are syncing.

### 3. RPM → **Derivable**

```
RPM = (estimatedRevenue / views) × 1000
```

You already sync both `estimatedRevenue` and `views`. Just compute RPM client-side. No API call needed.

### 4. Unique/New/Returning Viewers → **Bulk Reporting API**

> [!NOTE]
> The YouTube Reporting API (bulk) generates pre-built CSV reports that include viewer type breakdowns not available in the Analytics API.

These require:
1. Create a reporting job via `POST /v1/jobs`
2. Poll for generated reports via `GET /v1/jobs/{jobId}/reports`
3. Download CSV from provided URL

Report types that include viewer segmentation:
- `channel_basic_a2` — channel-level basics
- `channel_demographics_a1` — demographics
- Content owner equivalents

### 5. End Screen Click Rate → **Analytics API (just add it)**

Already available, just not in current metric list:

```
endScreenImpressions
endScreenClicks  
endScreenClickRate
```

Not listed in your docs file but available in newer API versions. Check with a test query.

---

## Summary: Effort to Unlock Missing Metrics

| Metric | Effort | Method |
|---|---|---|
| **Impressions** | 🟢 Low | Switch `ids` to `contentOwner==X` |
| **CTR** | 🟢 Low | Same — comes with impressions |
| **RPM** | 🟢 Low | Client-side calc (revenue/views×1000) |
| **estimatedRedMinutesWatched** | 🟢 Low | Add to existing metric list |
| **Annotation detail metrics** (5) | 🟢 Low | Add to existing metric list |
| **Card teaser metrics** (3) | 🟢 Low | Add to existing metric list |
| **End Screen metrics** | 🟡 Medium | Test availability, add to list |
| **Audience retention** | 🟡 Medium | Per-video calls, needs batching strategy |
| **Demographics** | 🟡 Medium | Per-video calls |
| **Traffic sources** | 🟡 Medium | Per-video calls |
| **Geography** | 🟡 Medium | Per-video calls |
| **Device/OS breakdown** | 🟡 Medium | Per-video calls |
| **Unique viewers** | 🟡 Medium | Content Owner time-based report (`uniques` metric, line 357) |
| **Stayed to Watch** | 🔴 Hard | Approximate from retention or use Studio internal API |
| **New/Returning Viewers** | 🔴 Hard | Bulk Reporting API or Studio internal |

---

## Recommended Priority

1. **Impressions + CTR** — Switch to Content Owner auth. Biggest bang, easiest fix.
2. **RPM** — Compute client-side. Zero API cost.
3. **Easy metric additions** — Add `estimatedRedMinutesWatched`, annotation details, card teasers to existing query.
4. **Unique viewers** — Add `uniques` to Content Owner time-based report.
5. **Audience retention** — Build per-video fetcher with batching/caching.
6. **STW approximation** — Derive from retention data once #5 is built.

> [!CAUTION]
> Content Owner auth requires `youtubepartner` scope and your Content Owner ID. Confirm you have this access before implementation.


---

## Version 2 (from artifacts)


## The 3 YouTube APIs

| API | Endpoint | Purpose |
|---|---|---|
| **Data API v3** | `youtube.googleapis.com/youtube/v3` | Video metadata, thumbnails, public counts |
| **Analytics API v2** | `youtubeanalytics.googleapis.com/v2/reports` | Targeted real-time queries, per-video metrics |
| **Reporting API** (Bulk) | `youtubereporting.googleapis.com/v1` | Pre-generated bulk CSV reports, full historical data |

---

## Currently Synced Per-Video Metrics

From `analyticsByWindow` → `report.rows` (keyed by videoId), using **Analytics API v2** with `channel==MINE`:

| # | Metric | Group |
|---|---|---|
| 1 | `views` | View |
| 2 | `estimatedMinutesWatched` | Watch Time |
| 3 | `averageViewDuration` | Watch Time |
| 4 | `averageViewPercentage` | Watch Time |
| 5 | `subscribersGained` | Engagement |
| 6 | `subscribersLost` | Engagement |
| 7 | `likes` | Engagement |
| 8 | `dislikes` | Engagement |
| 9 | `comments` | Engagement |
| 10 | `shares` | Engagement |
| 11 | `engagedViews` | View |
| 12 | `videosAddedToPlaylists` | Engagement |
| 13 | `videosRemovedFromPlaylists` | Engagement |
| 14 | `estimatedRevenue` | Revenue 💰 |
| 15 | `estimatedAdRevenue` | Revenue 💰 |
| 16 | `grossRevenue` | Revenue 💰 |
| 17 | `cpm` | Ad Performance 💰 |
| 18 | `monetizedPlaybacks` | Ad Performance 💰 |
| 19 | `playbackBasedCpm` | Ad Performance 💰 |
| 20 | `adImpressions` | Ad Performance 💰 |
| 21 | `estimatedRedPartnerRevenue` | Revenue 💰 |
| 22 | `annotationClickThroughRate` | Annotations |
| 23 | `annotationCloseRate` | Annotations |
| 24 | `redViews` | View |
| 25 | `cardClickRate` | Cards |
| 26 | `cardImpressions` | Cards |
| 27 | `cardClicks` | Cards |

**Total currently synced: 27 metrics**

---

## NOT Synced — Marked `false` in `availabilityByWindow`

| Metric Key | Display Name | Why It Fails |
|---|---|---|
| `impressions` | Thumbnail Impressions | `videoThumbnailImpressions` unsupported w/ `video` dim + `channel==MINE` |
| `ctr` | Impressions Click-Through Rate | `videoThumbnailImpressionsClickRate` same reason |
| `stw` | Stayed to Watch | Not in YT Analytics API at all |
| `rpm` | Revenue Per Mille | Not available per-video |
| `newViewers` | New Viewers | Not in API |
| `returningViewers` | Returning Viewers | Not in API |
| `casualViewers` | Casual Viewers | Not in API |
| `regularViewers` | Regular Viewers | Not in API |
| `uniqueViewers` | Unique Viewers | Not in API |
| `endScreenClickRate` | End Screen CTR | Not fetched (but fetchable — see below) |

---

## Full Universe of Per-Video Metrics Across All 3 APIs

### ✅ = Currently syncing | 🔶 = Available but NOT synced | ❌ = Not available per-video

#### View Metrics
| Metric | Status | Available Via |
|---|---|---|
| `views` | ✅ | Analytics API |
| `engagedViews` | ✅ | Analytics API |
| `redViews` | ✅ | Analytics API |
| `uniqueViewers` / `uniques` | 🔶 | **Content Owner reports** (time-based, line 357 of docs) |

#### Reach / Impressions Metrics
| Metric | Status | Available Via |
|---|---|---|
| `videoThumbnailImpressions` | 🔶 | **Content Owner** basic stats (line 333), top videos (line 703), traffic source (line 581), device type (line 616) |
| `videoThumbnailImpressionsClickRate` | 🔶 | Same reports as above |

> [!IMPORTANT]
> **These ARE available per-video — but only via Content Owner reports** (`ids=contentOwner==OWNER_NAME`), NOT via `channel==MINE`. Your current code uses `channel==MINE` which is why it fails. Switching to Content Owner mode unlocks impressions + CTR.

#### Watch Time Metrics
| Metric | Status | Available Via |
|---|---|---|
| `estimatedMinutesWatched` | ✅ | Analytics API |
| `averageViewDuration` | ✅ | Analytics API |
| `averageViewPercentage` | ✅ | Analytics API |
| `estimatedRedMinutesWatched` | 🔶 | Analytics API (just not requested) |

#### Engagement Metrics
| Metric | Status | Available Via |
|---|---|---|
| `comments` | ✅ | Analytics API |
| `likes` | ✅ | Analytics API |
| `dislikes` | ✅ | Analytics API |
| `shares` | ✅ | Analytics API |
| `subscribersGained` | ✅ | Analytics API |
| `subscribersLost` | ✅ | Analytics API |
| `videosAddedToPlaylists` | ✅ | Analytics API |
| `videosRemovedFromPlaylists` | ✅ | Analytics API |

#### Annotation Metrics
| Metric | Status | Available Via |
|---|---|---|
| `annotationClickThroughRate` | ✅ | Analytics API |
| `annotationCloseRate` | ✅ | Analytics API |
| `annotationImpressions` | 🔶 | Analytics API (just not requested) |
| `annotationClickableImpressions` | 🔶 | Analytics API (just not requested) |
| `annotationClosableImpressions` | 🔶 | Analytics API (just not requested) |
| `annotationClicks` | 🔶 | Analytics API (just not requested) |
| `annotationCloses` | 🔶 | Analytics API (just not requested) |

#### Card Metrics
| Metric | Status | Available Via |
|---|---|---|
| `cardClickRate` | ✅ | Analytics API |
| `cardImpressions` | ✅ | Analytics API |
| `cardClicks` | ✅ | Analytics API |
| `cardTeaserImpressions` | 🔶 | Analytics API (just not requested) |
| `cardTeaserClicks` | 🔶 | Analytics API (just not requested) |
| `cardTeaserClickRate` | 🔶 | Analytics API (just not requested) |

#### Revenue / Ad Performance Metrics (💰 requires monetary scope)
| Metric | Status | Available Via |
|---|---|---|
| `estimatedRevenue` | ✅ | Analytics API |
| `estimatedAdRevenue` | ✅ | Analytics API |
| `grossRevenue` | ✅ | Analytics API |
| `cpm` | ✅ | Analytics API |
| `monetizedPlaybacks` | ✅ | Analytics API |
| `playbackBasedCpm` | ✅ | Analytics API |
| `adImpressions` | ✅ | Analytics API |
| `estimatedRedPartnerRevenue` | ✅ | Analytics API |

#### Audience Retention Metrics (per-video, single-video filter only)
| Metric | Status | Available Via |
|---|---|---|
| `audienceWatchRatio` | 🔶 | Analytics API — requires `elapsedVideoTimeRatio` dimension, single `video` filter |
| `relativeRetentionPerformance` | 🔶 | Same as above |
| `startedWatching` | 🔶 | Same |
| `stoppedWatching` | 🔶 | Same |
| `totalSegmentImpressions` | 🔶 | Same |

> [!NOTE]
> Retention metrics require a **separate API call per video** — cannot batch. Use `dimensions=elapsedVideoTimeRatio` + `filters=video==VIDEO_ID`.

#### Demographics (per-video)
| Metric | Status | Available Via |
|---|---|---|
| `viewerPercentage` (by ageGroup/gender) | 🔶 | Analytics API — `dimensions=ageGroup,gender` + `filters=video==VIDEO_ID` |

#### Traffic Source Metrics (per-video)
| Metric | Status | Available Via |
|---|---|---|
| Traffic by `insightTrafficSourceType` | 🔶 | Analytics API — `dimensions=insightTrafficSourceType` + `filters=video==VIDEO_ID` |
| Traffic detail by `insightTrafficSourceDetail` | 🔶 | Analytics API — top 25 referrers per source type |
| `videoThumbnailImpressions` by traffic source | 🔶 | **Content Owner** traffic source report (line 581) |
| `videoThumbnailImpressionsClickRate` by traffic source | 🔶 | Same |

#### Device / OS Metrics (per-video)
| Metric | Status | Available Via |
|---|---|---|
| Views by `deviceType` | 🔶 | Analytics API |
| Views by `operatingSystem` | 🔶 | Analytics API |
| Impressions by device/OS | 🔶 | **Content Owner** device reports (lines 616-646) |

#### Playback Location (per-video)
| Metric | Status | Available Via |
|---|---|---|
| Views by `insightPlaybackLocationType` | 🔶 | Analytics API |
| Top embedded players | 🔶 | Analytics API (top 25) |

#### Geography (per-video)
| Metric | Status | Available Via |
|---|---|---|
| Views/watchtime by `country` | 🔶 | Analytics API |
| Views by `province` (US) | 🔶 | Analytics API |
| Views by `city` (top 250) | 🔶 | Analytics API |

#### Livestream Metrics (per-video, live content only)
| Metric | Status | Available Via |
|---|---|---|
| `averageConcurrentViewers` | 🔶 | Analytics API |
| `peakConcurrentViewers` | 🔶 | Analytics API |

---

## Workarounds for the Big 3 Missing Metrics

### 1. Impressions + CTR → **Content Owner Reports**

> [!IMPORTANT]
> This is the primary workaround. Your docs (lines 333, 357, 703) confirm `videoThumbnailImpressions` and `videoThumbnailImpressionsClickRate` **ARE supported** in Content Owner reports.

**Current (broken):**
```
ids=channel==MINE
dimensions=video
metrics=...,videoThumbnailImpressions,videoThumbnailImpressionsClickRate
```

**Fix — switch to Content Owner:**
```
ids=contentOwner==YOUR_CONTENT_OWNER_ID
dimensions=video     (or day + filters=video==ID)
metrics=videoThumbnailImpressions,videoThumbnailImpressionsClickRate
filters=uploaderType==self   (or channel==YOUR_CHANNEL_ID)
```

**Available report types with impressions:**
- **Basic stats** (no time dim): `filters=video==ID` → aggregate impressions/CTR
- **Time-based** (`dimensions=day`): `filters=video==ID` → daily impressions/CTR
- **Top videos** (`dimensions=video`): `filters=channel==ID` → ranked by impressions
- **Traffic source** (`dimensions=insightTrafficSourceType`): impressions by source
- **Device type** (`dimensions=deviceType`): impressions by device

**Scope required:** `https://www.googleapis.com/auth/youtubepartner`

### 2. Stayed to Watch (STW) → **Not in any official API**

> [!WARNING]
> "Stayed to watch" is a YouTube Studio-only metric. No official API exposes it.

**Workarounds:**
- **Approximate from retention data**: Fetch `audienceWatchRatio` at `elapsedVideoTimeRatio` ≈ 0.01-0.03 (first 1-3% of video). Viewers still present at that point ~= "stayed to watch." Not exact but close proxy.
- **YouTube Studio internal API** (undocumented): Session-cookie authenticated calls to `https://studio.youtube.com/youtubei/v1/analytics_data/...` — fragile, may break anytime, but gives exact STW.
- **Calculate from impressions + views**: `STW ≈ views / impressions × CTR adjustment`. Rough but derivable once impressions are syncing.

### 3. RPM → **Derivable**

```
RPM = (estimatedRevenue / views) × 1000
```

You already sync both `estimatedRevenue` and `views`. Just compute RPM client-side. No API call needed.

### 4. Unique/New/Returning Viewers → **Bulk Reporting API**

> [!NOTE]
> The YouTube Reporting API (bulk) generates pre-built CSV reports that include viewer type breakdowns not available in the Analytics API.

These require:
1. Create a reporting job via `POST /v1/jobs`
2. Poll for generated reports via `GET /v1/jobs/{jobId}/reports`
3. Download CSV from provided URL

Report types that include viewer segmentation:
- `channel_basic_a2` — channel-level basics
- `channel_demographics_a1` — demographics
- Content owner equivalents

### 5. End Screen Click Rate → **Analytics API (just add it)**

Already available, just not in current metric list:

```
endScreenImpressions
endScreenClicks  
endScreenClickRate
```

Not listed in your docs file but available in newer API versions. Check with a test query.

---

## Summary: Effort to Unlock Missing Metrics

| Metric | Effort | Method |
|---|---|---|
| **Impressions** | 🟢 Low | Switch `ids` to `contentOwner==X` |
| **CTR** | 🟢 Low | Same — comes with impressions |
| **RPM** | 🟢 Low | Client-side calc (revenue/views×1000) |
| **estimatedRedMinutesWatched** | 🟢 Low | Add to existing metric list |
| **Annotation detail metrics** (5) | 🟢 Low | Add to existing metric list |
| **Card teaser metrics** (3) | 🟢 Low | Add to existing metric list |
| **End Screen metrics** | 🟡 Medium | Test availability, add to list |
| **Audience retention** | 🟡 Medium | Per-video calls, needs batching strategy |
| **Demographics** | 🟡 Medium | Per-video calls |
| **Traffic sources** | 🟡 Medium | Per-video calls |
| **Geography** | 🟡 Medium | Per-video calls |
| **Device/OS breakdown** | 🟡 Medium | Per-video calls |
| **Unique viewers** | 🟡 Medium | Content Owner time-based report (`uniques` metric, line 357) |
| **Stayed to Watch** | 🔴 Hard | Approximate from retention or use Studio internal API |
| **New/Returning Viewers** | 🔴 Hard | Bulk Reporting API or Studio internal |

---

## Recommended Priority

1. **Impressions + CTR** — Switch to Content Owner auth. Biggest bang, easiest fix.
2. **RPM** — Compute client-side. Zero API cost.
3. **Easy metric additions** — Add `estimatedRedMinutesWatched`, annotation details, card teasers to existing query.
4. **Unique viewers** — Add `uniques` to Content Owner time-based report.
5. **Audience retention** — Build per-video fetcher with batching/caching.
6. **STW approximation** — Derive from retention data once #5 is built.

> [!CAUTION]
> Content Owner auth requires `youtubepartner` scope and your Content Owner ID. Confirm you have this access before implementation.


---

