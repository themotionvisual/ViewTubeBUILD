export type AnalyticsReportFamily =
 | "core"
 | "demographics"
 | "playlist"
 | "retention"
 | "interaction"

export const ANALYTICS_REPORT_MATRIX = Object.freeze({
 core: {
  dimensions: [
   "day","month","country","province","video","playlist","group","subscribedStatus",
   "youtubeProduct","liveOrOnDemand","creatorContentType","sharingService",
   "insightPlaybackLocationType","insightPlaybackLocationDetail",
   "insightTrafficSourceType","insightTrafficSourceDetail","deviceType","operatingSystem",
  ],
  metrics: [
   "views","redViews","estimatedMinutesWatched","estimatedRedMinutesWatched",
   "averageViewDuration","averageViewPercentage","comments","likes","dislikes","shares",
   "subscribersGained","subscribersLost","videosAddedToPlaylists","videosRemovedFromPlaylists",
   "estimatedRevenue","estimatedAdRevenue","grossRevenue","estimatedRedPartnerRevenue",
   "monetizedPlaybacks","playbackBasedCpm","cpm","adImpressions",
  ],
 },
 demographics: {
  dimensions: ["ageGroup","gender","video","group"],
  metrics: ["viewerPercentage"],
 },
 playlist: {
  dimensions: ["playlist","group","day","month","country","province","video"],
  metrics: [
   "views","estimatedMinutesWatched","averageViewDuration","playlistStarts",
   "viewsPerPlaylistStart","averageTimeInPlaylist",
  ],
 },
 retention: {
  dimensions: ["elapsedVideoTimeRatio","video","group"],
  metrics: ["audienceWatchRatio","relativeRetentionPerformance"],
 },
 interaction: {
  dimensions: ["video","group","day","month"],
  metrics: [
   "annotationImpressions","annotationClickableImpressions","annotationClicks",
   "annotationClickThroughRate","annotationClosableImpressions","annotationCloses",
   "annotationCloseRate","cardImpressions","cardClicks","cardClickRate",
   "cardTeaserImpressions","cardTeaserClicks","cardTeaserClickRate",
   "endScreenElementImpressions","endScreenElementClicks","endScreenElementClickRate",
  ],
 },
} satisfies Record<AnalyticsReportFamily, { dimensions: readonly string[]; metrics: readonly string[] }>)

export const MONETARY_ANALYTICS_METRICS = new Set([
 "estimatedRevenue","estimatedAdRevenue","grossRevenue","estimatedRedPartnerRevenue",
 "monetizedPlaybacks","playbackBasedCpm","cpm","adImpressions",
])

export type AnalyticsValidationResult =
 | { ok: true; family: AnalyticsReportFamily; monetary: boolean }
 | { ok: false; code: "mixed_report_families" | "unsupported_dimension" | "unsupported_metric"; message: string }

export const validateAnalyticsReportShape = (
 dimensions: readonly string[],
 metrics: readonly string[],
): AnalyticsValidationResult => {
 const matching = (Object.entries(ANALYTICS_REPORT_MATRIX) as Array<
  [AnalyticsReportFamily, { dimensions: readonly string[]; metrics: readonly string[] }]
 >).filter(([, family]) =>
  dimensions.every((dimension) => family.dimensions.includes(dimension))
  && metrics.every((metric) => family.metrics.includes(metric)),
 )

 if (matching.length > 0) {
  return {
   ok: true,
   family: matching[0][0],
   monetary: metrics.some((metric) => MONETARY_ANALYTICS_METRICS.has(metric)),
  }
 }

 const knownDimensions = new Set(Object.values(ANALYTICS_REPORT_MATRIX).flatMap((family) => family.dimensions))
 const unknownDimension = dimensions.find((dimension) => !knownDimensions.has(dimension))
 if (unknownDimension) {
  return { ok: false, code: "unsupported_dimension", message: `Unsupported Analytics dimension: ${unknownDimension}` }
 }

 const knownMetrics = new Set(Object.values(ANALYTICS_REPORT_MATRIX).flatMap((family) => family.metrics))
 const unknownMetric = metrics.find((metric) => !knownMetrics.has(metric))
 if (unknownMetric) {
  return { ok: false, code: "unsupported_metric", message: `Unsupported Analytics metric: ${unknownMetric}` }
 }

 return {
  ok: false,
  code: "mixed_report_families",
  message: "Dimensions and metrics must come from one YouTube Analytics report family.",
 }
}
