# YouTube Sync Issues Diagnostic Report

## 1. API 400 Bad Requests (YouTube Analytics API)
- **Problem:** `videoThumbnailImpressions` and `videoThumbnailImpressionsClickRate` are requested with `dimensions=video`.
- **Status:** Partially fixed (content type dimension handled).
- **Remaining Task:** Need to audit `youtubeAnalyticsFetcher.ts` to ensure all permutations of this combination are caught. The logs indicate these are still appearing in multiple request paths.

## 2. API 403 Forbidden Errors (YouTube Data API v3)
- **Problem:** Access denied for:
  - `videoCategories`
  - `playlists.mine`
  - `commentThreads`
- **Likely Cause:** 
  - Insufficient OAuth scopes (missing required scopes for these resources).
  - Account permission issues (channel owner vs. manager).
  - API quota limitations or restricted key usage.

## 3. API 404 Not Found (Static/Media Assets)
- **Problem:** `hqdefault.jpg` fails to load.
- **Likely Cause:** Requesting non-existent video thumbnails or cached links to deleted/unavailable content.

## 4. API 403 Forbidden Errors (Third-party Assets)
- **Problem:** `assets3.lottiefiles.com` requests failing.
- **Likely Cause:** Misconfigured CORS, expired token for the assets service, or regional blocking.

---

# Remediation Plan

## Phase 1: Analytics API (400 Errors)
1. **Auditing Fetcher:** Examine `youtubeAnalyticsFetcher.ts` to identify why metrics are still being bundled when `dimensions=video`.
2. **Dynamic Filtering:** Implement a more robust filtering mechanism that strips forbidden metrics *after* determining the final dimensions for any API call.

## Phase 2: Data API Scopes (403 Errors)
1. **Check Scopes:** Inspect the OAuth flow configuration to ensure `https://www.googleapis.com/auth/youtube.readonly` or equivalent scopes are requested.
2. **Validate Permissions:** Check the Google Cloud Console for the project to ensure the Data API and required scopes are enabled for the authenticated user.

## Phase 3: Media Asset Handling (404/403 Errors)
1. **Graceful Fallbacks:** Ensure the components (like `VTLottie.tsx` and thumbnail renderers) have robust `onError` handlers that display placeholders instead of breaking the UI.
2. **Thumbnail Validation:** Before calling `hqdefault.jpg`, verify the video is live and public.
