# VT Sync Playbook

## Target runtime surfaces
- Fetch layer: `src/services/youtube/youtubeAnalyticsFetcher.ts`
- Coordinator: `src/services/SyncCoordinator.ts`
- Diagnostics model: `src/services/productArchitecture.ts`
- Validation UI: `src/views/PerformanceHub.tsx`

## Preflight
1. Confirm requested analytics window and channel connection state.
2. Confirm metric groups for current run (`core_performance`, `engagement`, `impressions_ctr`, `monetization`, `audience_mix`).
3. Confirm target video filter candidates are chunked and URL-safe.

Current VT video metric groups:
- `core_performance`: `views`, `estimatedMinutesWatched`, `averageViewDuration`, `averageViewPercentage`, `subscribersGained`
- `engagement`: `likes`, `comments`, `shares`, `engagedViews`, `subscribersLost`, `dislikes`, `videosAddedToPlaylists`, `videosRemovedFromPlaylists`
- `impressions_ctr`: `videoThumbnailImpressions`, `videoThumbnailImpressionsClickRate`
- `monetization`: `estimatedRevenue`, `estimatedAdRevenue`, `grossRevenue`, `rpm`, `cpm`, `monetizedPlaybacks`, `playbackBasedCpm`, `adImpressions`, `estimatedRedPartnerRevenue`
- `audience_mix`: `annotationClickThroughRate`, `annotationCloseRate`, `redViews`, `cardClickRate`, `cardImpressions`, `cardClicks`

Impressions/CTR runtime rule:
- If `filters=video==...` returns `400` for `videoThumbnailImpressions` or `videoThumbnailImpressionsClickRate`, switch to the top-videos report shape (`dimensions=video` with a channel-scoped `ids` value), then filter the returned rows locally to the target video set.
- Treat this as a request-shape quarantine, not as proof that the metrics are unsupported at video scope.
- Persist the result into `syncDiagnostics.failureReasons` with `requestClass` and `outcome`, and mirror the launch-health summary into `syncRunSummary.analyticsVerification`.
- Probe order for this group: grouped request -> grouped request with minimal paging params -> per-metric requests.
- If all probes fail with `400`, suppress repeated attempts for the same request class in that sync run and keep table output as `-` with CSV import guidance.

## Query-shape rules
- For video filter requests, use `filters=video==...` with bounded chunk size.
- Avoid forcing unrelated metrics into specialized groups (especially `impressions_ctr`).
- Only include dimensions compatible with requested metrics for that query branch.
- For channel-level fallbacks, preserve explicit diagnostics indicating fallback reason.

## Error triage
Classify failures by:
- `status` (400 vs auth vs network)
- `group` and `metrics`
- retriable vs non-retriable

400-specific handling:
- Mark request combo invalid for current run.
- Attempt deterministic split-by-metric fallback where defined.
- Record failure in diagnostics with enough detail to reconstruct the request class.
- For `impressions_ctr`, keep per-metric retries isolated. Do not inject `views` or unrelated long-form metrics into that group.
- For long-form interaction metrics, keep annotation and card semantics separate when validating payloads and mappings.
- Keep `creatorContentType` failures separate from impressions/CTR diagnostics. They should not blur the status of thumbnail metrics.
- Persist `creatorContentType` availability separately in cache so `PerformanceHub` and chart consumers can degrade format-aware behavior without polluting thumbnail metric health.

## Diagnostics contract
Expect fields:
- `attemptedGroups`
- `disabledMetrics`
- `failureReasons`
- `knownInvalidCombos`
- `splitRetries`
- request length telemetry (`maxRequestChars`, `requestCharCounts`)
- per-failure request shape metadata (`attemptedShape`) for troubleshooting.

Do not remove these fields silently; they are needed for PerformanceHub troubleshooting.

## Manual-sync alignment
Default VT expectation: syncing is user-driven after initial connect (or explicit save/sync actions).
When touching sync behavior, preserve user control and API quota awareness.

## AI entitlement interaction (analytics-adjacent)
- Entitlement reads in render paths must be side-effect free.
- Token checks should use state-aware helpers where available.
- Failures from AI queue should not corrupt analytics diagnostics state.
