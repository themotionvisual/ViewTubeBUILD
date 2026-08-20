import {
 buildActualMetricCell,
 buildDerivedMetricCell,
 buildUnavailableMetricCell,
 emptyMetricCells,
 type AnalyticsWindow,
 type CanonicalMetricKey,
 type MetricCell,
} from "../analytics/DataStore"
import type {
 CanonicalAudienceSplitRecord,
 CanonicalChannelRecord,
 CanonicalMetricMeta,
 CanonicalPlaylistRecord,
 CanonicalPlaylistWindowSummary,
 CanonicalRetentionSeries,
 CanonicalSyncRun,
 CanonicalVideoRecord,
 ChannelWindowSummary,
 ShadowDiffRecord,
 VideoCatalogExportRow,
 CanonicalTrafficRow,
 CanonicalGeographyRow,
} from "./contracts"
import {
 getCanonicalOwnerModeEnabled,
 listCanonicalAudienceSplits,
 listCanonicalChannelRecords,
 listCanonicalPlaylistRecords,
 listCanonicalPlaylistWindowSummaries,
 listCanonicalRetentionSeries,
 listCanonicalShadowDiffs,
 listCanonicalSyncRuns,
 listCanonicalVideoRecords,
 listChannelWindowSummaries,
 listCanonicalTrafficRows,
 listCanonicalGeographyRows,
} from "./storage"

export type CanonicalBundleFile = {
 path: string
 format: "json" | "csv"
 rowCount?: number
}

export type CanonicalBundleManifest = {
 version: string
 generatedAt: string
 channelId: string
 totalVideoCount: number
 playlistCount: number
 retentionSeriesCount: number
 audienceSplitCount: number
 supportedWindows: AnalyticsWindow[]
 ownerModeEnabled: boolean
 fileInventory: CanonicalBundleFile[]
 syncRuns: Array<{
  id: string
  status: CanonicalSyncRun["status"]
  startedAt: string
  completedAt?: string
 }>
}

export type CanonicalVideoTableRow = VideoCatalogExportRow & {
 channelId: string
 lifetimeWatchHours: number | null
 lifetimeCtr: number | null
 lifetimeImpressions: number | null
 window28dCtr: number | null
 window28dImpressions: number | null
 window28dAverageViewPercentage: number | null
 window28dSubscribersGained: number | null
 retentionStatus: "ready" | "pending"
 ownerModeReachStatus: "owner_mode" | "csv" | "unsupported" | "pending"
 topTrafficSource: string | null
 topGeography: string | null
 topDemographic: string | null
}

export type CanonicalGroupedRow = {
 groupKey: string
 groupLabel: string
 videoCount: number
 lifetimeViews: number
 window28dViews: number
 window28dRevenue: number
 window28dWatchHours: number
 avgLifetimeCtr: number | null
 avgWindow28dCtr: number | null
 avgWindow28dRetention: number | null
}

export type CanonicalComparisonRow = {
 slot: number
 videoId: string
 title: string
 format: string
 lifetimeViews: number | null
 window28dViews: number | null
 window28dRevenue: number | null
 window28dAverageViewPercentage: number | null
 window28dCtr: number | null
 window28dUniqueViewers: number | null
}

export type CanonicalRetentionTableRow = {
 videoId: string
 title: string
 window: AnalyticsWindow
 pointCount: number
 audienceType: string
 subscribedStatus: string
 youtubeProduct: string
 first30PercentDrop: number | null
 midVideoHold: number | null
 endRetention: number | null
 stayedToWatchProxy: number | null
}

export type CanonicalPlaylistTableRow = {
 playlistId: string
 title: string
 itemCount: number | null
 lifetimeViews: number | null
 window28dViews: number | null
 window28dPlaylistViews: number | null
 window28dAverageTimeInPlaylist: number | null
 window28dStarts: number | null
}

export type CanonicalChartRow = {
 videoId: string
 label: string
 format: string
 creatorContentType: string
 publishedAt: string
 views: number
 engagedViews: number
 revenue: number
 watchHours: number
 ctr: number
 averageViewPercentage: number
  uniqueViewers: number
}

export type CanonicalMasterHeatmapRow = Record<string, unknown> & {
 _id: string
 __metricCells: Record<CanonicalMetricKey, MetricCell>
 _coverageState: "api_only"
 _apiPresent: "yes"
 _csvPresent: "no"
 _apiSnapshotTimestamp: number | null
}

export type CanonicalPresentationDataset = {
 meta: {
  generatedAt: string
  channelId: string
  channelTitle: string
  ownerModeEnabled: boolean
  supportedWindows: AnalyticsWindow[]
  totalVideoCount: number
  playlistCount: number
  retentionSeriesCount: number
  audienceSplitCount: number
  lastRunId: string
  lastRunStatus: CanonicalSyncRun["status"] | "idle"
  lastCompletedAt: string
 }
 videoRows: CanonicalVideoTableRow[]
 groupedRows: CanonicalGroupedRow[]
 comparisonRows: CanonicalComparisonRow[]
 retentionRows: CanonicalRetentionTableRow[]
 playlistRows: CanonicalPlaylistTableRow[]
 chartRows: CanonicalChartRow[]
 masterRows: CanonicalMasterHeatmapRow[]
 latestDiff: ShadowDiffRecord | null
}

type PresentationInputs = {
 channels: CanonicalChannelRecord[]
 channelWindowSummaries: ChannelWindowSummary[]
 videos: CanonicalVideoRecord[]
 audienceSplits: CanonicalAudienceSplitRecord[]
 playlists: CanonicalPlaylistRecord[]
 playlistWindowSummaries: CanonicalPlaylistWindowSummary[]
 retentionSeries: CanonicalRetentionSeries[]
 shadowDiffs: ShadowDiffRecord[]
 syncRuns: CanonicalSyncRun[]
 trafficRows: CanonicalTrafficRow[]
 geographyRows: CanonicalGeographyRow[]
 ownerModeEnabled: boolean
}

const WINDOWS: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d", "7d"]

const getMetricValue = (
 record: CanonicalVideoRecord,
 window: AnalyticsWindow,
 metricKey: string,
): number | null => record.metricsByWindow?.[window]?.[metricKey] ?? null

const getMetricSource = (
 record: CanonicalVideoRecord,
 window: AnalyticsWindow,
 metricKey: string,
): string => record.metricMetaByWindow?.[window]?.[metricKey]?.source || ""

const getMetricMeta = (
 record: CanonicalVideoRecord,
 window: AnalyticsWindow,
 metricKey: string,
): CanonicalMetricMeta | null => record.metricMetaByWindow?.[window]?.[metricKey] || null

const toNumber = (value: number | null | undefined): number | null =>
 typeof value === "number" && Number.isFinite(value) ? value : null

const sum = (values: Array<number | null | undefined>): number =>
 values.reduce((total, value) => total + (toNumber(value) || 0), 0)

const average = (values: Array<number | null | undefined>): number | null => {
 const numeric = values.filter((value): value is number => typeof value === "number")
 if (numeric.length === 0) return null
 return numeric.reduce((total, value) => total + value, 0) / numeric.length
}

const round = (value: number | null, digits = 2): number | null => {
 if (value === null || !Number.isFinite(value)) return null
 const factor = 10 ** digits
 return Math.round(value * factor) / factor
}

const toMetricTimestamp = (meta: CanonicalMetricMeta | null): number | undefined => {
 if (!meta?.syncedAt) return undefined
 const timestamp = new Date(meta.syncedAt).getTime()
 return Number.isFinite(timestamp) ? timestamp : undefined
}

const toMetricSourceClass = (
 source: CanonicalMetricMeta["source"],
): MetricCell["sourceClass"] => {
 switch (source) {
  case "csv":
   return "manual_import"
  case "reporting_api":
   return "reporting_exports"
  case "derived":
   return "derived"
  case "data_api":
   return "public_catalog"
  case "analytics_api":
  case "owner_api":
  default:
   return "owner_analytics"
 }
}

const toMetricAuthMode = (
 source: CanonicalMetricMeta["source"],
): MetricCell["authMode"] => {
 switch (source) {
  case "csv":
   return "manual"
  case "reporting_api":
   return "reporting"
  case "owner_api":
   return "content_owner"
  case "data_api":
  case "analytics_api":
   return "channel_owner"
  case "derived":
  default:
   return "unknown"
 }
}

const toMetricOfficialStatus = (
 source: CanonicalMetricMeta["source"],
): MetricCell["officialStatus"] => {
 switch (source) {
  case "csv":
   return "imported"
  case "derived":
   return "derived"
  default:
   return "official"
 }
}

const toMetricFinalizationStatus = (
 meta: CanonicalMetricMeta | null,
): MetricCell["mergedStatus"] => {
 if (!meta) return "blocked"
 if (meta.source === "derived") return "estimated"
 return meta.availability === "available" ? "finalized" : "blocked"
}

const toMetricAvailabilityReason = (
 meta: CanonicalMetricMeta | null,
): MetricCell["availabilityReason"] => {
 if (!meta) return "unavailable"
 if (meta.availability === "pending") return "not_requested"
 if (meta.availability === "unsupported") return "auth_required"
 if (meta.availability === "available") return "available"
 return "unavailable"
}

const normalizeCanonicalFormatLabel = (record: CanonicalVideoRecord): string => {
 const creatorType = String(record.creatorContentType || "").toUpperCase()
 if (creatorType === "VIDEO_ON_DEMAND") return "long"
 if (creatorType === "SHORTS") return "shorts"
 if (creatorType === "LIVE_STREAM") return "live"
 if (creatorType === "STORY") return "story"
 if (record.isShort === true) return "shorts"
 const mergedMetadata = `${record.title} ${record.description}`.toLowerCase()
 const metadataShortSignal =
  mergedMetadata.includes("#shorts") ||
  record.tags.some((tag) => String(tag).toLowerCase().includes("short"))
 const hasAnyMetric = (metricKeys: string[]): boolean =>
  ["lifetime", "365d", "90d", "28d", "7d"].some((window) =>
   metricKeys.some((metricKey) => {
    const value = record.metricsByWindow?.[window as AnalyticsWindow]?.[metricKey]
    return typeof value === "number" && Number.isFinite(value) && value > 0
   }),
  )
 const hasLongSignals = hasAnyMetric([
  "cardClicks",
  "cardsShown",
  "endScreenElementClicks",
  "endScreenElementsShown",
 ])
 const hasReachSignals = hasAnyMetric([
  "videoThumbnailImpressions",
  "videoThumbnailImpressionsClickRate",
 ])
 if (record.durationSeconds > 0 && record.durationSeconds <= 180 && metadataShortSignal) {
  return "shorts"
 }
 const format = String(record.format || "").trim().toLowerCase()
 if (
  record.durationSeconds > 0 &&
  record.durationSeconds <= 180 &&
  !hasLongSignals &&
  !hasReachSignals &&
  format !== "live" &&
  format !== "story"
 ) {
  return "shorts"
 }
 if (format === "video_on_demand" || format === "video" || format === "long-form") {
  return "long"
 }
 return format || "unknown"
}

const createActualCell = (
 value: number | null,
 sourceField: string,
 meta: CanonicalMetricMeta | null,
 window: AnalyticsWindow,
): MetricCell => {
 if (value === null || !Number.isFinite(value)) {
  return buildUnavailableMetricCell("api", "canonical_metric_missing", {
   sourceClass: meta ? toMetricSourceClass(meta.source) : "owner_analytics",
   authMode: meta ? toMetricAuthMode(meta.source) : "channel_owner",
   officialStatus: meta ? toMetricOfficialStatus(meta.source) : "official",
   estimatedStatus: false,
   mergedStatus: toMetricFinalizationStatus(meta),
   finalizedAt: toMetricTimestamp(meta),
   fetchedAt: toMetricTimestamp(meta),
   availabilityReason: toMetricAvailabilityReason(meta),
  })
 }
 return buildActualMetricCell(value, "api", {
  sourceField,
  windowScope: window,
  sourceClass: meta ? toMetricSourceClass(meta.source) : "owner_analytics",
  authMode: meta ? toMetricAuthMode(meta.source) : "channel_owner",
  officialStatus: meta ? toMetricOfficialStatus(meta.source) : "official",
  estimatedStatus: false,
  mergedStatus: toMetricFinalizationStatus(meta),
  finalizedAt: toMetricTimestamp(meta),
  fetchedAt: toMetricTimestamp(meta),
  availabilityReason: toMetricAvailabilityReason(meta),
 })
}

const createDerivedCell = (
 value: number | null,
 sourceField: string,
 inputs: CanonicalMetricMeta[],
 window: AnalyticsWindow,
): MetricCell => {
 if (value === null || !Number.isFinite(value)) {
  return buildUnavailableMetricCell("api", "canonical_derived_metric_missing", {
   sourceClass: "derived",
   authMode: "channel_owner",
   officialStatus: "derived",
   estimatedStatus: true,
   mergedStatus: "blocked",
   availabilityReason: "unavailable",
  })
 }
 const latest = inputs
  .map((meta) => toMetricTimestamp(meta))
  .filter((value): value is number => typeof value === "number")
  .sort((left, right) => right - left)[0]
 return buildDerivedMetricCell(value, "api", {
  sourceField,
  windowScope: window,
  sourceClass: "derived",
  authMode: "channel_owner",
  officialStatus: "derived",
  estimatedStatus: true,
  mergedStatus: "estimated",
  finalizedAt: latest,
  derivedAt: latest,
  availabilityReason: "available",
 })
}

const resolvePreferredWindow = (
 record: CanonicalVideoRecord,
 metricKey: string,
 preferred: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d", "7d"],
): AnalyticsWindow | null =>
 preferred.find((window) => getMetricValue(record, window, metricKey) !== null) || null

const getMetricWithMeta = (
 record: CanonicalVideoRecord,
 metricKey: string,
 preferred: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d", "7d"],
): { value: number | null; meta: CanonicalMetricMeta | null; window: AnalyticsWindow } => {
 const window = resolvePreferredWindow(record, metricKey, preferred) || preferred[0] || "lifetime"
 return {
  value: getMetricValue(record, window, metricKey),
  meta: getMetricMeta(record, window, metricKey),
  window,
 }
}

const buildCanonicalMasterHeatmapRows = (
 videos: CanonicalVideoRecord[],
): CanonicalMasterHeatmapRow[] =>
 videos
  .map((record) => {
   const views = getMetricWithMeta(record, "views")
   const minutesWatched = getMetricWithMeta(record, "estimatedMinutesWatched")
   const averageViewDuration = getMetricWithMeta(record, "averageViewDuration")
   const averageViewPercentage = getMetricWithMeta(record, "averageViewPercentage")
   const subscribersGained = getMetricWithMeta(record, "subscribersGained")
   const subscribersLost = getMetricWithMeta(record, "subscribersLost")
   const revenue = getMetricWithMeta(record, "estimatedRevenue")
   const engagedViews = getMetricWithMeta(record, "engagedViews")
   const shares = getMetricWithMeta(record, "shares")
   const comments = getMetricWithMeta(record, "comments")
   const saves = getMetricWithMeta(record, "videosAddedToPlaylists")
   const likes = getMetricWithMeta(record, "likes")
   const dislikes = getMetricWithMeta(record, "dislikes")

   const watchHoursValue =
    typeof minutesWatched.value === "number"
     ? Number((minutesWatched.value / 60).toFixed(2))
     : null
   const rpmValue =
    typeof revenue.value === "number" &&
    typeof views.value === "number" &&
    views.value > 0
     ? Number(((revenue.value / views.value) * 1000).toFixed(3))
     : null
   const cpm = getMetricWithMeta(record, "cpm")
   const grossRevenue = getMetricWithMeta(record, "grossRevenue")
   const playbackBasedCpm = getMetricWithMeta(record, "playbackBasedCpm")
   const adImpressions = getMetricWithMeta(record, "adImpressions")
   const monetizedPlaybacks = getMetricWithMeta(record, "monetizedPlaybacks")
   const endScreenElementClicks = getMetricWithMeta(record, "endScreenElementClicks")
   const endScreenElementsShown = getMetricWithMeta(record, "endScreenElementsShown")
   const cardClicks = getMetricWithMeta(record, "cardClicks")
   const cardsShown = getMetricWithMeta(record, "cardsShown")
   const likePercentageValue =
    typeof likes.value === "number" &&
    typeof dislikes.value === "number" &&
    likes.value + dislikes.value > 0
     ? Number(((likes.value / (likes.value + dislikes.value)) * 100).toFixed(2))
     : null
   const endScreenCtrValue =
    typeof endScreenElementClicks.value === "number" &&
    typeof endScreenElementsShown.value === "number" &&
    endScreenElementsShown.value > 0
     ? Number(
        ((endScreenElementClicks.value / endScreenElementsShown.value) * 100).toFixed(2),
       )
     : null
   const cardCtrValue =
    typeof cardClicks.value === "number" &&
    typeof cardsShown.value === "number" &&
    cardsShown.value > 0
     ? Number(((cardClicks.value / cardsShown.value) * 100).toFixed(2))
     : null
   const subscribersNetValue =
    typeof subscribersGained.value === "number" &&
    typeof subscribersLost.value === "number"
     ? Number((subscribersGained.value - subscribersLost.value).toFixed(0))
     : null

   const metricCells = emptyMetricCells("api")
   metricCells.views = createActualCell(views.value, "views", views.meta, views.window)
   metricCells.watchHours = createDerivedCell(
    watchHoursValue,
    "estimatedMinutesWatched/60",
    minutesWatched.meta ? [minutesWatched.meta] : [],
    minutesWatched.window,
   )
   metricCells.avdSeconds = createActualCell(
    averageViewDuration.value,
    "averageViewDuration",
    averageViewDuration.meta,
    averageViewDuration.window,
   )
   metricCells.avp = createActualCell(
    averageViewPercentage.value,
    "averageViewPercentage",
    averageViewPercentage.meta,
    averageViewPercentage.window,
   )
   metricCells.subscribersGained = createActualCell(
    subscribersGained.value,
    "subscribersGained",
    subscribersGained.meta,
    subscribersGained.window,
   )
   metricCells.revenue = createActualCell(
    revenue.value,
    "estimatedRevenue",
    revenue.meta,
    revenue.window,
   )
   metricCells.rpm = createDerivedCell(
    rpmValue,
    "estimatedRevenue/views*1000",
    [revenue.meta, views.meta].filter(Boolean) as CanonicalMetricMeta[],
    revenue.window,
   )
   metricCells.cpm = createActualCell(cpm.value, "cpm", cpm.meta, cpm.window)
   metricCells.grossRevenue = createActualCell(
    grossRevenue.value,
    "grossRevenue",
    grossRevenue.meta,
    grossRevenue.window,
   )
   metricCells.engagedViews = createActualCell(
    engagedViews.value,
    "engagedViews",
    engagedViews.meta,
    engagedViews.window,
   )
   metricCells.shares = createActualCell(shares.value, "shares", shares.meta, shares.window)
   metricCells.comments = createActualCell(
    comments.value,
    "comments",
    comments.meta,
    comments.window,
   )
   metricCells.saves = createActualCell(
    saves.value,
    "videosAddedToPlaylists",
    saves.meta,
    saves.window,
   )
   metricCells.likes = createActualCell(likes.value, "likes", likes.meta, likes.window)
   metricCells.dislikes = createActualCell(
    dislikes.value,
    "dislikes",
    dislikes.meta,
    dislikes.window,
   )
   metricCells.adImpressions = createActualCell(
    adImpressions.value,
    "adImpressions",
    adImpressions.meta,
    adImpressions.window,
   )
   metricCells.playbackBasedCpm = createActualCell(
    playbackBasedCpm.value,
    "playbackBasedCpm",
    playbackBasedCpm.meta,
    playbackBasedCpm.window,
   )
   metricCells.monetizedPlaybacks = createActualCell(
    monetizedPlaybacks.value,
    "monetizedPlaybacks",
    monetizedPlaybacks.meta,
    monetizedPlaybacks.window,
   )
   metricCells.endScreenElementClicks = createActualCell(
    endScreenElementClicks.value,
    "endScreenElementClicks",
    endScreenElementClicks.meta,
    endScreenElementClicks.window,
   )
   metricCells.endScreenElementsShown = createActualCell(
    endScreenElementsShown.value,
    "endScreenElementsShown",
    endScreenElementsShown.meta,
    endScreenElementsShown.window,
   )
   metricCells.cardClicks = createActualCell(
    cardClicks.value,
    "cardClicks",
    cardClicks.meta,
    cardClicks.window,
   )
   metricCells.cardsShown = createActualCell(
    cardsShown.value,
    "cardsShown",
    cardsShown.meta,
    cardsShown.window,
   )
   metricCells.clicksPerEndScreenElementShown = createDerivedCell(
    endScreenCtrValue,
    "endScreenElementClicks/endScreenElementsShown*100",
    [endScreenElementClicks.meta, endScreenElementsShown.meta].filter(Boolean) as CanonicalMetricMeta[],
    endScreenElementClicks.window,
   )
   metricCells.clicksPerCardShown = createDerivedCell(
    cardCtrValue,
    "cardClicks/cardsShown*100",
    [cardClicks.meta, cardsShown.meta].filter(Boolean) as CanonicalMetricMeta[],
    cardClicks.window,
   )
   ;(metricCells as Record<string, MetricCell>).likesVsDislikesPercent = createDerivedCell(
    likePercentageValue,
    "likes/(likes+dislikes)*100",
    [likes.meta, dislikes.meta].filter(Boolean) as CanonicalMetricMeta[],
    likes.window,
   )
   metricCells.subscribersNet = createDerivedCell(
    subscribersNetValue,
    "subscribersGained-subscribersLost",
    [subscribersGained.meta, subscribersLost.meta].filter(Boolean) as CanonicalMetricMeta[],
    subscribersGained.window,
   )
   metricCells.subscribersLost = createActualCell(
    subscribersLost.value,
    "subscribersLost",
    subscribersLost.meta,
    subscribersLost.window,
   )

   const snapshotTimestamp = [
    views.meta,
    minutesWatched.meta,
    averageViewDuration.meta,
    averageViewPercentage.meta,
    subscribersGained.meta,
    subscribersLost.meta,
    revenue.meta,
    engagedViews.meta,
    shares.meta,
    comments.meta,
    saves.meta,
    likes.meta,
    dislikes.meta,
   ]
    .map((meta) => toMetricTimestamp(meta))
    .filter((value): value is number => typeof value === "number")
    .sort((left, right) => right - left)[0] || null

   return {
    _id: `canonical-master-${record.videoId}`,
    _coverageState: "api_only" as const,
    _apiPresent: "yes" as const,
    _csvPresent: "no" as const,
    _apiSnapshotTimestamp: snapshotTimestamp,
    __metricCells: metricCells,
    "Video ID": record.videoId,
    "Upload date": record.publishedAt,
    Format: normalizeCanonicalFormatLabel(record),
    "Video category": record.categoryName || record.categoryId || "N/A",
    Length: record.durationSeconds > 0 ? record.durationSeconds : null,
    "Video title": record.title,
    Views: views.value,
    "Watch time (hours)": watchHoursValue,
    "Average view duration": averageViewDuration.value,
    "Average percentage viewed (%)": averageViewPercentage.value,
    "Subscribers gained": subscribersGained.value,
    "Estimated revenue (USD)": revenue.value,
    "Gross Revenue": grossRevenue.value,
    "RPM (USD)": rpmValue,
    "CPM (USD)": cpm.value,
    "Engaged views": engagedViews.value,
    Shares: shares.value,
    "Comments added": comments.value,
    "Videos added to playlists": saves.value,
    "Likes (vs. dislikes) (%)": likePercentageValue,
    Dislikes: dislikes.value,
    "Subscribers net": subscribersNetValue,
    "Subscribers lost": subscribersLost.value,
    "Ad impressions": adImpressions.value,
    "Playback-based CPM (USD)": playbackBasedCpm.value,
    "Estimated monetized playbacks": monetizedPlaybacks.value,
    "End screen element clicks": endScreenElementClicks.value,
    "End screen elements shown": endScreenElementsShown.value,
    "Clicks per end screen element shown (%)": endScreenCtrValue,
    "Card clicks": cardClicks.value,
    "Cards shown": cardsShown.value,
    "Clicks per card shown (%)": cardCtrValue,
    Thumbnail: record.thumbnail,
   }
  })
  .sort(
   (left, right) =>
    (Number(right.Views) || 0) - (Number(left.Views) || 0),
  )

const deriveVideoExportRow = (record: CanonicalVideoRecord): VideoCatalogExportRow => ({
 videoId: record.videoId,
 title: record.title,
 description: record.description,
 publishedAt: record.publishedAt,
 thumbnail: record.thumbnail,
 mediumThumbnail: record.thumbnails.medium?.url || "",
 maxresThumbnail: record.thumbnails.maxres?.url || "",
 tags: record.tags.join(" | "),
 categoryId: record.categoryId || "",
 categoryName: record.categoryName || "",
 defaultLanguage: record.defaultLanguage || "",
 privacyStatus: record.privacyStatus || "",
 uploadStatus: record.uploadStatus || "",
 definition: record.definition || "",
 dimension: record.dimension || "",
 durationSeconds: record.durationSeconds,
 creatorContentType: record.creatorContentType || "",
 format: record.format,
 isShort: record.isShort,
 lifetimeViews: getMetricValue(record, "lifetime", "views"),
 lifetimeLikes: getMetricValue(record, "lifetime", "likes"),
 lifetimeComments: getMetricValue(record, "lifetime", "comments"),
 lifetimeRevenue: getMetricValue(record, "lifetime", "estimatedRevenue"),
 window365dViews: getMetricValue(record, "365d", "views"),
 window90dViews: getMetricValue(record, "90d", "views"),
 window28dViews: getMetricValue(record, "28d", "views"),
 window28dUniqueViewers: getMetricValue(record, "28d", "uniqueViewers"),
 window90dUniqueViewers: getMetricValue(record, "90d", "uniqueViewers"),
 window28dWatchHours: round(
  getMetricValue(record, "28d", "estimatedMinutesWatched") === null
   ? null
   : (getMetricValue(record, "28d", "estimatedMinutesWatched") || 0) / 60,
 ),
 window28dRevenue: getMetricValue(record, "28d", "estimatedRevenue"),
 window28dEngagedViews: getMetricValue(record, "28d", "engagedViews"),
})

const buildVideoRows = (
 videos: CanonicalVideoRecord[],
 retentionSeries: CanonicalRetentionSeries[],
 trafficRows: CanonicalTrafficRow[],
 audienceSplits: CanonicalAudienceSplitRecord[],
 geographyRows: CanonicalGeographyRow[],
): CanonicalVideoTableRow[] => {
 const retentionReady = new Set(retentionSeries.map((entry) => entry.videoId))
 const topTraffic = new Map<string, string>()
 const topGeo = new Map<string, string>()
 const topDemo = new Map<string, string>()

 trafficRows.filter(r => r.entityType === "video" && r.window === "28d" && r.trafficSourceType !== "total").forEach(row => {
  const currentBest = topTraffic.get(row.entityId)
  if (!currentBest) topTraffic.set(row.entityId, row.trafficSourceType)
 })
 audienceSplits.filter(r => r.entityType === "video" && r.window === "28d" && r.splitDimension === "demographic").forEach(row => {
  const currentBest = topDemo.get(row.entityId)
  if (!currentBest) topDemo.set(row.entityId, row.splitKey)
 })
 geographyRows.filter(r => r.entityType === "video" && r.window === "28d").forEach(row => {
  const currentBest = topGeo.get(row.entityId)
  if (!currentBest) topGeo.set(row.entityId, row.country)
 })

 return videos
  .map((record) => {
   const exportRow = deriveVideoExportRow(record)
   const lifetimeImpressions = getMetricValue(record, "lifetime", "videoThumbnailImpressions")
   const window28dImpressions = getMetricValue(record, "28d", "videoThumbnailImpressions")
   const lifetimeCtr = getMetricValue(
    record,
    "lifetime",
    "videoThumbnailImpressionsClickRate",
   )
   const window28dCtr = getMetricValue(
    record,
    "28d",
    "videoThumbnailImpressionsClickRate",
   )
   const reachSource =
    getMetricSource(record, "28d", "videoThumbnailImpressions") ||
    getMetricSource(record, "28d", "videoThumbnailImpressionsClickRate") ||
    getMetricSource(record, "lifetime", "videoThumbnailImpressions")
     ||
    getMetricSource(record, "lifetime", "videoThumbnailImpressionsClickRate")
   return {
    ...exportRow,
    channelId: record.channelId,
    lifetimeWatchHours: round(
     getMetricValue(record, "lifetime", "estimatedMinutesWatched") === null
      ? null
      : (getMetricValue(record, "lifetime", "estimatedMinutesWatched") || 0) / 60,
    ),
    lifetimeCtr,
    lifetimeImpressions,
    window28dCtr,
    window28dImpressions,
    window28dAverageViewPercentage: getMetricValue(
     record,
     "28d",
     "averageViewPercentage",
    ),
    window28dSubscribersGained: getMetricValue(
     record,
     "28d",
     "subscribersGained",
    ),
    retentionStatus: retentionReady.has(record.videoId) ? "ready" : "pending",
    ownerModeReachStatus:
     reachSource === "owner_api"
      ? "owner_mode"
      : reachSource === "csv"
       ? "csv"
       : window28dImpressions !== null || lifetimeImpressions !== null
        ? "owner_mode"
        : "unsupported",
    topTrafficSource: topTraffic.get(record.videoId) || null,
    topGeography: topGeo.get(record.videoId) || null,
    topDemographic: topDemo.get(record.videoId) || null,
   }
  })
  .sort(
   (left, right) =>
    (right.window28dViews || right.lifetimeViews || 0) -
    (left.window28dViews || left.lifetimeViews || 0),
  )
}

const buildGroupedRows = (videoRows: CanonicalVideoTableRow[]): CanonicalGroupedRow[] => {
 const groups = new Map<string, CanonicalVideoTableRow[]>()
 videoRows.forEach((row) => {
  const groupKey = row.creatorContentType || row.categoryName || row.format || "uncategorized"
  const current = groups.get(groupKey) || []
  current.push(row)
  groups.set(groupKey, current)
 })
 return Array.from(groups.entries())
  .map(([groupKey, rows]) => ({
   groupKey,
   groupLabel: groupKey.replace(/_/g, " "),
   videoCount: rows.length,
   lifetimeViews: sum(rows.map((row) => row.lifetimeViews)),
   window28dViews: sum(rows.map((row) => row.window28dViews)),
   window28dRevenue: sum(rows.map((row) => row.window28dRevenue)),
   window28dWatchHours: sum(rows.map((row) => row.window28dWatchHours)),
   avgLifetimeCtr: round(average(rows.map((row) => row.lifetimeCtr))),
   avgWindow28dCtr: round(average(rows.map((row) => row.window28dCtr))),
   avgWindow28dRetention: round(
    average(rows.map((row) => row.window28dAverageViewPercentage)),
   ),
  }))
  .sort((left, right) => right.window28dViews - left.window28dViews)
}

const buildComparisonRows = (
 videoRows: CanonicalVideoTableRow[],
): CanonicalComparisonRow[] =>
 videoRows.slice(0, 3).map((row, index) => ({
  slot: index + 1,
  videoId: row.videoId,
  title: row.title,
  format: row.format,
  lifetimeViews: row.lifetimeViews,
  window28dViews: row.window28dViews,
  window28dRevenue: row.window28dRevenue,
  window28dAverageViewPercentage: row.window28dAverageViewPercentage,
  window28dCtr: row.window28dCtr,
  window28dUniqueViewers: row.window28dUniqueViewers,
 }))

const buildRetentionRows = (
 videos: CanonicalVideoRecord[],
 retentionSeries: CanonicalRetentionSeries[],
): CanonicalRetentionTableRow[] => {
 const titleByVideoId = new Map(videos.map((video) => [video.videoId, video.title]))
 return retentionSeries
  .map((entry) => ({
   videoId: entry.videoId,
   title: titleByVideoId.get(entry.videoId) || entry.videoId,
   window: entry.window,
   pointCount: entry.points.length,
   audienceType: entry.filters.audienceType || "ALL",
   subscribedStatus: entry.filters.subscribedStatus || "ALL",
   youtubeProduct: entry.filters.youtubeProduct || "ALL",
   first30PercentDrop: entry.derived.first30PercentDrop.value,
   midVideoHold: entry.derived.midVideoHold.value,
   endRetention: entry.derived.endRetention.value,
   stayedToWatchProxy: entry.derived.stayedToWatchProxy.value,
  }))
  .sort((left, right) => right.pointCount - left.pointCount)
}

const buildPlaylistRows = (
 playlists: CanonicalPlaylistRecord[],
 playlistWindowSummaries: CanonicalPlaylistWindowSummary[],
): CanonicalPlaylistTableRow[] => {
 const summaryMap = new Map<string, CanonicalPlaylistWindowSummary>()
 playlistWindowSummaries.forEach((summary) => {
  summaryMap.set(`${summary.playlistId}::${summary.window}`, summary)
 })
 return playlists
  .map((playlist) => {
   const lifetime = summaryMap.get(`${playlist.playlistId}::lifetime`)
   const window28d = summaryMap.get(`${playlist.playlistId}::28d`)
   return {
    playlistId: playlist.playlistId,
    title: playlist.title,
    itemCount: playlist.itemCount,
    lifetimeViews: lifetime?.metrics.views?.value ?? null,
    window28dViews: window28d?.metrics.views?.value ?? null,
    window28dPlaylistViews: window28d?.metrics.playlistViews?.value ?? null,
    window28dAverageTimeInPlaylist:
     window28d?.metrics.averageTimeInPlaylist?.value ?? null,
    window28dStarts: window28d?.metrics.playlistStarts?.value ?? null,
   }
  })
  .sort((left, right) => (right.window28dViews || 0) - (left.window28dViews || 0))
}

const buildChartRows = (videos: CanonicalVideoRecord[]): CanonicalChartRow[] =>
 videos
  .map((record) => ({
   videoId: record.videoId,
   label: record.title,
   format: record.format,
   creatorContentType: record.creatorContentType || "UNSPECIFIED",
   publishedAt: record.publishedAt,
   views: getMetricValue(record, "28d", "views") || getMetricValue(record, "lifetime", "views") || 0,
   engagedViews:
    getMetricValue(record, "28d", "engagedViews") ||
    getMetricValue(record, "lifetime", "engagedViews") ||
    0,
   revenue:
    getMetricValue(record, "28d", "estimatedRevenue") ||
    getMetricValue(record, "lifetime", "estimatedRevenue") ||
    0,
   watchHours: round(
    ((getMetricValue(record, "28d", "estimatedMinutesWatched") ||
     getMetricValue(record, "lifetime", "estimatedMinutesWatched") ||
     0) as number) / 60,
   ) || 0,
   ctr:
    getMetricValue(record, "28d", "videoThumbnailImpressionsClickRate") ||
    getMetricValue(record, "lifetime", "videoThumbnailImpressionsClickRate") ||
    0,
   averageViewPercentage:
    getMetricValue(record, "28d", "averageViewPercentage") ||
    getMetricValue(record, "lifetime", "averageViewPercentage") ||
    0,
   uniqueViewers:
    getMetricValue(record, "28d", "uniqueViewers") ||
    getMetricValue(record, "90d", "uniqueViewers") ||
    0,
  }))
  .sort((left, right) => right.views - left.views)
  .slice(0, 20)

const collectSupportedWindows = (
 videos: CanonicalVideoRecord[],
 channelWindowSummaries: ChannelWindowSummary[],
): AnalyticsWindow[] => {
 const set = new Set<AnalyticsWindow>()
 videos.forEach((video) => {
  WINDOWS.forEach((window) => {
   if (video.metricsByWindow?.[window]) set.add(window)
  })
 })
 channelWindowSummaries.forEach((summary) => set.add(summary.window))
 return WINDOWS.filter((window) => set.has(window))
}

export const buildCanonicalPresentationDatasetFromRecords = ({
 channels,
 channelWindowSummaries,
 videos,
 audienceSplits,
 playlists,
 playlistWindowSummaries,
 retentionSeries,
 shadowDiffs,
 syncRuns,
 trafficRows,
 geographyRows,
 ownerModeEnabled,
}: PresentationInputs): CanonicalPresentationDataset => {
 const channel = channels[0]
 const lastRun = syncRuns
  .slice()
  .sort((left, right) => right.startedAt.localeCompare(left.startedAt))[0]
 const latestDiff =
  shadowDiffs.slice().sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0] ||
  null
 const videoRows = buildVideoRows(videos, retentionSeries, trafficRows, audienceSplits, geographyRows)
 return {
  meta: {
   generatedAt: new Date().toISOString(),
   channelId: channel?.channelId || "",
   channelTitle: channel?.title || "Canonical Channel Dataset",
   ownerModeEnabled,
   supportedWindows: collectSupportedWindows(videos, channelWindowSummaries),
   totalVideoCount: videos.length,
  playlistCount: playlists.length,
  retentionSeriesCount: retentionSeries.length,
  audienceSplitCount: audienceSplits.length,
   lastRunId: lastRun?.id || "",
   lastRunStatus: lastRun?.status || "idle",
   lastCompletedAt: lastRun?.completedAt || "",
  },
  videoRows,
  groupedRows: buildGroupedRows(videoRows),
  comparisonRows: buildComparisonRows(videoRows),
  retentionRows: buildRetentionRows(videos, retentionSeries),
  playlistRows: buildPlaylistRows(playlists, playlistWindowSummaries),
  chartRows: buildChartRows(videos),
  masterRows: buildCanonicalMasterHeatmapRows(videos),
  latestDiff,
 }
}

export const buildCanonicalPresentationDataset = async (
 channelId?: string,
): Promise<CanonicalPresentationDataset> => {
 const results = await Promise.allSettled([
  listCanonicalChannelRecords(),
  listChannelWindowSummaries(channelId),
  listCanonicalVideoRecords(channelId),
  listCanonicalAudienceSplits(channelId),
  listCanonicalPlaylistRecords(channelId),
  listCanonicalPlaylistWindowSummaries(channelId),
  listCanonicalRetentionSeries(channelId),
  listCanonicalShadowDiffs(channelId),
  listCanonicalSyncRuns(),
  listCanonicalTrafficRows(channelId),
  listCanonicalGeographyRows(channelId),
 ])
 const settled = <T,>(result: PromiseSettledResult<T[]>): T[] =>
  result.status === "fulfilled" ? result.value : []
 const channels = settled(results[0])
 const channelWindowSummaries = settled(results[1])
 const videos = settled(results[2])
 const audienceSplits = settled(results[3])
 const playlists = settled(results[4])
 const playlistWindowSummaries = settled(results[5])
 const retentionSeries = settled(results[6])
 const shadowDiffs = settled(results[7])
 const syncRuns = settled(results[8])
 const trafficRows = settled(results[9])
 const geographyRows = settled(results[10])
 return buildCanonicalPresentationDatasetFromRecords({
  channels: channelId
   ? channels.filter((channel) => channel.channelId === channelId)
   : channels,
  channelWindowSummaries,
  videos,
  audienceSplits,
  playlists,
  playlistWindowSummaries,
  retentionSeries,
  shadowDiffs,
  syncRuns,
  trafficRows,
  geographyRows,
  ownerModeEnabled: getCanonicalOwnerModeEnabled(),
 })
}
