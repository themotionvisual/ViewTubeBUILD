import { AnalyticsMetricGroupName } from "./analyticsTypes";

export const VIDEO_METRIC_GROUPS: Record<AnalyticsMetricGroupName, string[]> = {
 core_performance: [
  "views",
  "estimatedMinutesWatched",
  "averageViewDuration",
  "averageViewPercentage",
  "subscribersGained",
  "estimatedRedMinutesWatched",
 ],
 engagement: [
  "likes",
  "comments",
  "shares",
  "engagedViews",
  "subscribersLost",
  "dislikes",
  "videosAddedToPlaylists",
  "videosRemovedFromPlaylists",
 ],
 impressions_ctr: [
  "videoThumbnailImpressions",
  "videoThumbnailImpressionsClickRate",
 ],
 monetization: [
  "estimatedRevenue",
  "estimatedAdRevenue",
  "grossRevenue",
  "rpm",
  "cpm",
  "monetizedPlaybacks",
  "playbackBasedCpm",
  "adImpressions",
  "estimatedRedPartnerRevenue",
 ],
 audience_mix: [
  "annotationClickThroughRate",
  "annotationCloseRate",
  "annotationImpressions",
  "annotationClickableImpressions",
  "annotationClosableImpressions",
  "annotationClicks",
  "annotationCloses",
  "cardClickRate",
  "cardImpressions",
  "cardClicks",
  "cardTeaserImpressions",
  "cardTeaserClicks",
  "cardTeaserClickRate",
 ],
 end_screen: [
  "endScreenElementImpressions",
  "endScreenElementClicks",
  "endScreenElementClickRate"
 ],
}

export const disabledAnalyticsGroups = new Set<AnalyticsMetricGroupName>()
export const unsupportedVideoAnalyticsMetrics = new Set<string>()
export const SESSION_KNOWN_INVALID_COMBOS = new Set<string>()
export const IMPRESSIONS_PROBE_CACHE = new Map<string, { groupedSupported: boolean; minimalPagingSupported: boolean }>()
export const METRIC_CAPABILITY_BY_METRIC = new Map<string, { status: string; reasonCode?: string }>()

export const ANALYTICS_VIDEO_PAGE_SIZE = 200
export const MAX_ANALYTICS_VIDEO_PAGES = 50
export const MAX_VIDEO_IDS_PER_FILTER = 25
