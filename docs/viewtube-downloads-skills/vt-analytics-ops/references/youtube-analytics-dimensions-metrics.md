# YouTube Analytics Dimensions and Metrics (VT Condensed)

## Scope
Primary sources:
- `/Users/cwb/Downloads/viewtube/docs/Youtube_Analytics_Reporting_API_DOCS.txt`
- `/Users/cwb/Downloads/viewtube/YOUTUBE_ANALYTICS_API_DOCS.txt`
Cross-check sources:
- `docs/DATA_ANALYTICS/Youtube API + Data/YOUTUBE_METRICS_AND_DIMENSIONS_MASTER_LIST.md`

## Core constraints
- Report shape determined by `startDate`, `endDate`, `metrics`, `dimensions`, `filters`.
- Filters restrict rows to matching dimension values.
- API supports multi-value filters for `video`, `playlist`, `channel` (up to 500 IDs).
- Always map payload by header names, not index assumptions.

## Dimensions used by VT
- Primary: `video`, `day`, `country`, `deviceType`, `insightTrafficSourceType`
- Optional/high-risk: `creatorContentType` combinations
- Notes:
  - `creatorContentType` often fails with `video` in VT request patterns and may need channel-level fallback.
  - `province` requires `country==US`.

## Metrics used by VT video sync groups
- Core performance: `views`, `estimatedMinutesWatched`, `averageViewDuration`, `averageViewPercentage`, `subscribersGained`
- Engagement: `likes`, `comments`, `shares`, `engagedViews`, `subscribersLost`, `dislikes`, `videosAddedToPlaylists`, `videosRemovedFromPlaylists`
- Impressions/CTR: `videoThumbnailImpressions`, `videoThumbnailImpressionsClickRate`
- Monetization: `estimatedRevenue`, `estimatedAdRevenue`, `grossRevenue`, `rpm`, `cpm`, `monetizedPlaybacks`, `playbackBasedCpm`, `adImpressions`, `estimatedRedPartnerRevenue`
- Long-form interaction / secondary video stats: `annotationClickThroughRate`, `annotationCloseRate`, `cardClickRate`, `cardImpressions`, `cardClicks`, `redViews`

## Confirmed runtime notes
- `viewerPercentage` is documented, but it is not part of VT's primary per-video sync path. It belongs to demographic/playback-detail report shapes, not the canonical `dimensions=video` fetch loop.
- `cardClickRate` is a valid long-form video metric and should not be conflated with `annotationClickThroughRate`.
- `annotationClickThroughRate` and `annotationCloseRate` are valid long-form metrics, but they should remain raw interaction stats unless a dedicated canonical field/column is intentionally introduced.

## Known API behavior affecting VT
- Non-core metrics/dimensions can change more freely than core entities.
- Data anonymization thresholds can hide low-volume rows in segmented reports.
- Aggregated totals can differ from segmented totals (deleted items, thresholding).
- Revenue metrics can have lag windows and partial-day incompleteness.

## Operational implication for VT
- A 400 usually means request-shape incompatibility, not necessarily missing auth.
- Treat `impressions_ctr` failures separately and preserve diagnostic detail by metric/group.
- Keep invalid combination memory to avoid retry storms in a single sync session.
