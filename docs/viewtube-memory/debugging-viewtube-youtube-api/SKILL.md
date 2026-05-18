---
name: debugging-viewtube-youtube-api
description: Debug 400 Bad Request errors and metric/dimension incompatibilities in the YouTube Analytics API.
---

## When to Use
- You see `400 Bad Request` errors in the logs during a YouTube sync.
- Specific metrics (e.g., Impressions, CTR, Creator Content Type) fail to return data.
- You are adding new metrics to `src/services/youtube/` fetchers.

## Procedure

1.  **Check Dimension Compatibility**:
    - Many YouTube Analytics metrics are restricted by the `dimensions` used in the request.
    - **Impressions restricted**: `videoThumbnailImpressions` and `videoThumbnailImpressionsClickRate` often require `dimensions=video` and will FAIL if combined with `dimensions=day`.
    - **Rule**: If a metric causes a 400 error, try isolating it in a request with only `dimensions=video`.

2.  **Avoid Invalid Dimensions**:
    - **Creator Content Type**: Avoid using `creatorContentType` as a dimension in public API requests; it frequently triggers 400 errors for public keys.

3.  **Verify Metric Strings**:
    - Ensure you are using the exact API identifier strings:
      - `estimatedRevenue` (not `revenue`)
      - `monetizedPlaybacks` (not `playbacks`)
      - `averageViewPercentage` (not `avp`)
      - `videoThumbnailImpressions` (not `impressions`)

4.  **Batch and Filter**:
    - When fetching stats for specific videos, use `filters=video==id1,id2...`.
    - **Limit**: YouTube API supports a maximum of 50 video IDs per filter.
    - **Fix**: Use the batching logic in `youtubeDataFetcher.ts` or `youtubeAnalyticsFetcher.ts` to split lists into chunks of 50.

5.  **Use Correct Base URL**:
    - Data API: `https://www.googleapis.com/youtube/v3` (for snippets, channel info).
    - Analytics API: `https://youtubeanalytics.googleapis.com/v2` (for reports, metrics).
    - Logic for these lives in `src/services/youtube/youtubeApiClient.ts`.

## Pitfalls and Fixes
- **400 error on Impressions CTR**:
  - Cause: Requested with `dimensions=day`.
  - **Fix**: Move these metrics to `getVideoAnalytics` where `dimensions=video` is used.
- **Missing Lifetime Data**:
  - Cause: Start date calculated from the 500th video instead of channel creation.
  - **Fix**: Fetch `publishedAt` from the `channels` endpoint to set a true `lifetime` start date.
- **Quota errors**:
  - Check `src/services/youtube/youtubeApiClient.ts` for error code 403 and reason `quotaExceeded`. Use `RequestQueue.ts` to throttle requests.

## Verification
- Check the console logs for "API Request failed" or "YouTubeApiError".
- Successful sync should populate the `yt_analytics_cache` in LocalStorage without errors.
- Run a targeted fetch in the "Internal Analytics" panel and ensure the numbers (e.g., CPM, RPM) appear correctly.
