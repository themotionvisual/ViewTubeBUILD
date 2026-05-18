---
name: fix-viewtube-lifetime-sync
description: Fix "Lifetime" data truncation by using channel creation date and separating global totals from video-level batches.
---

## When to Use
- User reports that "Lifetime" statistics (Subscribers, Revenue, Views) only show a few months of data or don't match the true channel totals.
- The "Lifetime" window start date appears to be anchored to the 500th video instead of the channel's birth.
- Global totals are missing or incorrect because they are being rolled up from a limited subset of videos.

## Procedure

1.  **Anchor to Channel Birthdate**:
    - Ensure the `ChannelProfile` interface in `src/services/youtubeService.ts` includes `publishedAt: string`.
    - In `fetchChannelProfile`, extract and return `channel.snippet.publishedAt`.
    - In `src/services/analyticsSync.ts`, update the `lifetimeStart` calculation to prioritize `profile.publishedAt`:
      ```typescript
      const channelPublishedDate = new Date(profile?.publishedAt || "")
      const hasChannelPublishedDate = !Number.isNaN(channelPublishedDate.getTime())
      const lifetimeStart = (hasChannelPublishedDate ? channelPublishedDate : null) || earliestVideoDate || youtubeEpoch
      ```

2.  **Separate Global vs. Video Queries**:
    - To get true lifetime totals, perform a "dimensionless" query. If you include `dimensions=video`, the API only returns data for videos with activity in that window, often missing deleted or legacy data.
    - Implement `fetchGlobalLifetimeAnalytics` in `youtubeService.ts` without the `video` dimension:
      ```typescript
      // No dimensions = true lifetime summary for the entire channel entity.
      const url = `...&metrics=views,estimatedRevenue,...` // NO dimensions=video
      ```
    - Call this function during the `lifetime` window sync in `performSync`.

3.  **Prioritize Global Totals in Selectors**:
    - In `src/services/analyticsSelectors.ts`, update `resolveWindowTotals` to check for `globalLifetime` cache first:
      ```typescript
      if (window === "lifetime" && cache.globalLifetime) {
        const fromGlobal = sumTotalsFromReport(cache.globalLifetime)
        if (fromGlobal.views > 0 || fromGlobal.watchHours > 0) return fromGlobal
      }
      ```

## Pitfalls and Fixes
- **400 Bad Request (Invalid Combination)**: Some metrics (like `videoThumbnailImpressions`) are incompatible with certain dimensions or filters.
  - **Symptom**: Sync fails with 400 error when fetching impressions for the channel.
  - **Fix**: Move incompatible metrics to the "Global" (dimensionless) fetch or ensure they are only requested with `dimensions=video` and a specific video filter.
- **URL Too Long**: Batching too many video IDs in a filter can exceed the ~2000 character limit.
  - **Fix**: Split video ID lists into smaller chunks (e.g., 50-100 IDs) and perform multiple fetches.

## Verification
- Check the browser console for: `Global lifetime analytics: SUCCESS - X rows (True Channel Totals)`.
- Compare the "Lifetime" start date in the sync logs with the actual channel creation date.
- Verify that top-level dashboard widgets match the true YouTube Analytics totals, even if only 500 videos are synced.
