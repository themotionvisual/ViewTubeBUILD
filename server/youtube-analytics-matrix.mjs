export const ANALYTICS_REPORT_MATRIX = Object.freeze({
  core: {
    dimensions: new Set([
      "day","month","country","province","video","playlist","group","subscribedStatus",
      "youtubeProduct","liveOrOnDemand","creatorContentType","sharingService",
      "insightPlaybackLocationType","insightPlaybackLocationDetail",
      "insightTrafficSourceType","insightTrafficSourceDetail","deviceType","operatingSystem",
    ]),
    metrics: new Set([
      "views","redViews","estimatedMinutesWatched","estimatedRedMinutesWatched",
      "averageViewDuration","averageViewPercentage","comments","likes","dislikes","shares",
      "subscribersGained","subscribersLost","videosAddedToPlaylists","videosRemovedFromPlaylists",
      "estimatedRevenue","estimatedAdRevenue","grossRevenue","estimatedRedPartnerRevenue",
      "monetizedPlaybacks","playbackBasedCpm","cpm","adImpressions",
    ]),
  },
  demographics: {
    dimensions: new Set(["ageGroup","gender","video","group"]),
    metrics: new Set(["viewerPercentage"]),
  },
  playlist: {
    dimensions: new Set(["playlist","group","day","month","country","province","video"]),
    metrics: new Set([
      "views","estimatedMinutesWatched","averageViewDuration","playlistStarts",
      "viewsPerPlaylistStart","averageTimeInPlaylist",
    ]),
  },
  retention: {
    dimensions: new Set(["elapsedVideoTimeRatio","video","group"]),
    metrics: new Set(["audienceWatchRatio","relativeRetentionPerformance"]),
  },
  interaction: {
    dimensions: new Set(["video","group","day","month"]),
    metrics: new Set([
      "annotationImpressions","annotationClickableImpressions","annotationClicks",
      "annotationClickThroughRate","annotationClosableImpressions","annotationCloses",
      "annotationCloseRate","cardImpressions","cardClicks","cardClickRate",
      "cardTeaserImpressions","cardTeaserClicks","cardTeaserClickRate",
      "endScreenElementImpressions","endScreenElementClicks","endScreenElementClickRate",
    ]),
  },
});

export const MONETARY_METRICS = new Set([
  "estimatedRevenue","estimatedAdRevenue","grossRevenue","estimatedRedPartnerRevenue",
  "monetizedPlaybacks","playbackBasedCpm","cpm","adImpressions",
]);

export const validateAnalyticsShape = (dimensions, metrics) => {
  const candidates = Object.entries(ANALYTICS_REPORT_MATRIX).filter(([, family]) =>
    dimensions.every((dimension) => family.dimensions.has(dimension)) &&
    metrics.every((metric) => family.metrics.has(metric)),
  );
  if (candidates.length) {
    return {
      ok: true,
      family: candidates[0][0],
      monetary: metrics.some((metric) => MONETARY_METRICS.has(metric)),
    };
  }

  const knownDimensions = new Set(Object.values(ANALYTICS_REPORT_MATRIX).flatMap((family) => [...family.dimensions]));
  const unknownDimension = dimensions.find((dimension) => !knownDimensions.has(dimension));
  if (unknownDimension) {
    return { ok: false, code: "UNSUPPORTED_DIMENSION", message: `Unsupported Analytics dimension: ${unknownDimension}` };
  }

  const knownMetrics = new Set(Object.values(ANALYTICS_REPORT_MATRIX).flatMap((family) => [...family.metrics]));
  const unknownMetric = metrics.find((metric) => !knownMetrics.has(metric));
  if (unknownMetric) {
    return { ok: false, code: "UNSUPPORTED_METRIC", message: `Unsupported Analytics metric: ${unknownMetric}` };
  }

  return {
    ok: false,
    code: "MIXED_REPORT_FAMILIES",
    message: "Dimensions and metrics must come from one YouTube Analytics report family.",
  };
};
