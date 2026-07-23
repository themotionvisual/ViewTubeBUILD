import type { TubeExplorerVisualProps } from "../../../components/TubeExplorerVisualModules"
import type { VtSyncSnapshot, VtSyncTrafficRow, VtSyncVideoItem } from "./contracts"
import {
 applyVtSyncPrivacyFilters,
 readVtSyncPrivacyFilters,
 type VtSyncPrivacyFilters,
} from "./privacyPolicy"

type Row = Record<string, unknown>
type AnalyticsWindow = "7d" | "28d" | "90d" | "365d" | "lifetime"
type MetricSource = "api" | "csv_table"
type CanonicalMetricKey =
 | "views"
 | "watchHours"
 | "likes"
 | "dislikes"
 | "comments"
 | "shares"
 | "subscribersGained"
 | "subscribersLost"
 | "subscribersNet"
 | "impressions"
 | "revenue"
 | "cpm"
 | "rpm"
 | "ctr"
 | "newViewers"
 | "returningViewers"
 | "casualViewers"
 | "regularViewers"
 | "uniqueViewers"
 | "avdSeconds"
 | "avp"
 | "engagedViews"
 | "stw"
 | "endScreenClickRate"
 | "endScreenClicks"
 | "endScreenImpressions"
 | "cardClickRate"
 | "cardTeaserClickRate"
 | "cardTeaserClicks"
 | "cardTeaserImpressions"
 | "annotationImpressions"
 | "annotationClickableImpressions"
 | "annotationClosableImpressions"
 | "annotationClicks"
 | "annotationCloses"
 | "redWatchHours"
 | "estimatedAdRevenue"
 | "grossRevenue"
 | "playbackBasedCpm"
 | "adImpressions"
 | "monetizedPlaybacks"
 | "estimatedPremiumRevenue"
 | "endScreenElementClicks"
 | "endScreenElementsShown"
 | "clicksPerEndScreenElementShown"
 | "cardClicks"
 | "cardsShown"
 | "clicksPerCardShown"
 | "hypes"
 | "hypePoints"
 | "remixCount"
 | "remixesOfYourContent"
 | "remixViews"
 | "shortsFunnelPercentWatched"
 | "shortsFunnelSwipeAwayRate"
type MetricCell = {
 value: number | null
 status: "actual" | "unavailable"
 source: MetricSource
 availability: "available" | "unavailable"
 confidence: "raw_direct" | "unavailable"
 reasonCode?: string
 sourceField?: string
 windowScope?: AnalyticsWindow | "multi" | "unknown"
 sourceClass?: "owner_analytics" | "manual_import"
 authMode?: "channel_owner" | "manual" | "unknown"
 officialStatus?: "official" | "imported"
 estimatedStatus?: boolean
 mergedStatus?: "finalized" | "blocked"
 finalizedAt?: number
 availabilityReason?: "available" | "unavailable"
}
type CanonicalVideoRow = TubeExplorerVisualProps["data"][number]
type CanonicalTrafficDatasetKind = "traffic_summary" | "traffic_detail" | "traffic_playback_location"
type TubeExplorerCanonicalContext = {
 trafficRows: Array<Record<string, unknown>>
 geographyRows: Array<Record<string, unknown>>
}
type CanonicalTrafficRow = TubeExplorerCanonicalContext["trafficRows"][number]
type CanonicalGeographyRow = TubeExplorerCanonicalContext["geographyRows"][number]

const canonicalMetricOrder: CanonicalMetricKey[] = [
 "views",
 "watchHours",
 "comments",
 "shares",
 "subscribersGained",
 "subscribersLost",
 "subscribersNet",
 "impressions",
 "revenue",
 "cpm",
 "rpm",
 "ctr",
 "newViewers",
 "returningViewers",
 "casualViewers",
 "regularViewers",
 "uniqueViewers",
 "avdSeconds",
 "stw",
 "endScreenClickRate",
 "endScreenClicks",
 "endScreenImpressions",
 "cardClickRate",
 "cardTeaserClickRate",
 "cardTeaserClicks",
 "cardTeaserImpressions",
 "annotationImpressions",
 "annotationClickableImpressions",
 "annotationClosableImpressions",
 "annotationClicks",
 "annotationCloses",
 "redWatchHours",
 "estimatedAdRevenue",
 "grossRevenue",
 "playbackBasedCpm",
 "adImpressions",
 "monetizedPlaybacks",
 "estimatedPremiumRevenue",
 "endScreenElementClicks",
 "endScreenElementsShown",
 "clicksPerEndScreenElementShown",
 "cardClicks",
 "cardsShown",
 "clicksPerCardShown",
 "hypes",
 "hypePoints",
 "remixCount",
 "remixesOfYourContent",
 "remixViews",
 "shortsFunnelPercentWatched",
 "shortsFunnelSwipeAwayRate",
 "likes",
 "dislikes",
 "avp",
 "engagedViews",
]

const buildUnavailableMetricCell = (
 source: MetricSource,
 reasonCode?: string,
 meta?: Partial<MetricCell>,
): MetricCell => ({
 value: null,
 status: "unavailable",
 source,
 availability: "unavailable",
 confidence: "unavailable",
 reasonCode,
 windowScope: "unknown",
 authMode: meta?.authMode || "unknown",
 estimatedStatus: meta?.estimatedStatus || false,
 mergedStatus: meta?.mergedStatus || "blocked",
 sourceClass: meta?.sourceClass,
 officialStatus: meta?.officialStatus,
 finalizedAt: meta?.finalizedAt,
 availabilityReason: meta?.availabilityReason || "unavailable",
})

const buildActualMetricCell = (
 value: number,
 source: MetricSource,
 meta?: Partial<MetricCell>,
): MetricCell => ({
 value,
 status: "actual",
 source,
 availability: "available",
 confidence: "raw_direct",
 sourceField: meta?.sourceField,
 windowScope: meta?.windowScope || "unknown",
 sourceClass: meta?.sourceClass,
 authMode: meta?.authMode || "unknown",
 officialStatus: meta?.officialStatus,
 estimatedStatus: meta?.estimatedStatus || false,
 mergedStatus: meta?.mergedStatus,
 finalizedAt: meta?.finalizedAt,
 availabilityReason: meta?.availabilityReason || "available",
})

const emptyMetricCells = (source: MetricSource): Record<CanonicalMetricKey, MetricCell> =>
 canonicalMetricOrder.reduce(
  (acc, key) => {
   acc[key] = buildUnavailableMetricCell(source)
   return acc
  },
  {} as Record<CanonicalMetricKey, MetricCell>,
 )

export type VtSyncVisualPropsData = {
 rows: CanonicalVideoRow[]
 csvFiles: []
 canonicalContext: TubeExplorerCanonicalContext
 diagnostics: {
  videos: number
  trafficRows: number
  geographyRows: number
  source: VtSyncSnapshot["source"]
 }
}

const isMissing = (value: unknown): boolean =>
 value === null || value === undefined || value === ""

const firstValue = (...values: unknown[]): unknown =>
 values.find((value) => !isMissing(value))

const numberOrNull = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value === "string" && value.trim()) {
  const parsed = Number(value.replace(/[$,% ,]/g, ""))
  if (Number.isFinite(parsed)) return parsed
 }
 return null
}

const text = (value: unknown, fallback = ""): string => {
 if (typeof value === "string") return value
 if (typeof value === "number" && Number.isFinite(value)) return String(value)
 return fallback
}

const visualMetricSource = (snapshot: VtSyncSnapshot): MetricSource =>
 snapshot.source === "manual" ? "csv_table" : "api"

const sourceClassFor = (snapshot: VtSyncSnapshot) =>
 snapshot.source === "manual" ? "manual_import" : "owner_analytics"

const authModeFor = (snapshot: VtSyncSnapshot) =>
 snapshot.source === "manual" ? "manual" : "channel_owner"

const parseDurationSeconds = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value)
 if (typeof value !== "string") return 0
 const raw = value.trim()
 if (!raw) return 0

 const iso = raw.match(/^P(?:T)?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i)
 if (iso) {
  return (
   (Number(iso[1] || 0) * 3600) +
   (Number(iso[2] || 0) * 60) +
   Number(iso[3] || 0)
  )
 }

 if (raw.includes(":")) {
  const parts = raw.split(":").map((part) => Number(part) || 0)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
 }

 const parsed = Number(raw)
 return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

const normalizeFormat = (value: unknown): CanonicalVideoRow["format"] => {
 const raw = text(value).toLowerCase()
 if (raw.includes("short")) return "shorts"
 if (raw.includes("live")) return "live"
 if (raw.includes("story")) return "story"
 if (raw.includes("long") || raw.includes("video")) return "long"
 return "unknown"
}

const metricCell = (
 snapshot: VtSyncSnapshot,
 key: CanonicalMetricKey,
 value: unknown,
 sourceField: string,
) => {
 const numeric = numberOrNull(value)
 if (numeric === null) {
  return buildUnavailableMetricCell(visualMetricSource(snapshot), "vt_sync_metric_missing", {
   sourceClass: sourceClassFor(snapshot),
   authMode: authModeFor(snapshot),
   officialStatus: snapshot.source === "manual" ? "imported" : "official",
   mergedStatus: "blocked",
   finalizedAt: Date.now(),
   availabilityReason: "unavailable",
  })
 }

 return buildActualMetricCell(numeric, visualMetricSource(snapshot), {
  sourceField,
  windowScope: "lifetime",
  sourceClass: sourceClassFor(snapshot),
  authMode: authModeFor(snapshot),
  officialStatus: snapshot.source === "manual" ? "imported" : "official",
  estimatedStatus:
   key === "revenue" ||
   key === "estimatedAdRevenue" ||
   key === "estimatedPremiumRevenue" ||
   key === "rpm" ||
   key === "cpm" ||
   key === "playbackBasedCpm",
  mergedStatus: "finalized",
  finalizedAt: Date.now(),
  availabilityReason: "available",
 })
}

const setMetric = (
 snapshot: VtSyncSnapshot,
 metrics: CanonicalVideoRow["metrics"],
 key: CanonicalMetricKey,
 value: unknown,
 sourceField: string,
) => {
 metrics[key] = metricCell(snapshot, key, value, sourceField)
}

const buildVideoMetrics = (
 snapshot: VtSyncSnapshot,
 video: VtSyncVideoItem,
): CanonicalVideoRow["metrics"] => {
 const metricSource = visualMetricSource(snapshot)
 const metrics = emptyMetricCells(metricSource)
 const raw = video.metrics || {}
 const metricInputs: Partial<Record<CanonicalMetricKey, [unknown, string]>> = {
  views: [raw.views, "metrics.views"],
  watchHours: [raw.watchTime, "metrics.watchTime"],
  likes: [raw.likes, "metrics.likes"],
  dislikes: [raw.dislikes, "metrics.dislikes"],
  comments: [raw.comments, "metrics.comments"],
  shares: [raw.shares, "metrics.shares"],
  subscribersGained: [raw.subscribersGained, "metrics.subscribersGained"],
  subscribersLost: [raw.subscribersLost, "metrics.subscribersLost"],
  impressions: [firstValue(raw.impressions, raw.adImpressions), "metrics.impressions"],
  revenue: [firstValue(raw.revenue, raw.estimatedRevenue), "metrics.revenue"],
  cpm: [raw.cpm, "metrics.cpm"],
  rpm: [raw.rpm, "metrics.rpm"],
  ctr: [raw.ctr, "metrics.ctr"],
  avdSeconds: [raw.avgViewDuration, "metrics.avgViewDuration"],
  avp: [raw.averagePercentageViewed, "metrics.averagePercentageViewed"],
  engagedViews: [raw.engagedViews, "metrics.engagedViews"],
  redWatchHours: [raw.youtubePremiumWatchTime, "metrics.youtubePremiumWatchTime"],
  estimatedAdRevenue: [raw.estimatedAdRevenue, "metrics.estimatedAdRevenue"],
  estimatedPremiumRevenue: [raw.youtubePremiumRevenue, "metrics.youtubePremiumRevenue"],
  grossRevenue: [raw.grossRevenue, "metrics.grossRevenue"],
  playbackBasedCpm: [raw.playbackBasedCpm, "metrics.playbackBasedCpm"],
  adImpressions: [raw.adImpressions, "metrics.adImpressions"],
  monetizedPlaybacks: [raw.monetizedPlaybacks, "metrics.monetizedPlaybacks"],
  cardClicks: [raw.cardClicks, "metrics.cardClicks"],
  cardsShown: [raw.cardsShown, "metrics.cardsShown"],
  clicksPerCardShown: [raw.clicksPerCardShown, "metrics.clicksPerCardShown"],
  cardClickRate: [firstValue(raw.cardClickRate, raw.clicksPerCardShown), "metrics.cardClickRate"],
  cardTeaserClicks: [raw.cardTeaserClicks, "metrics.cardTeaserClicks"],
  cardTeaserImpressions: [firstValue(raw.cardTeaserImpressions, raw.cardTeasersShown), "metrics.cardTeaserImpressions"],
  cardTeaserClickRate: [firstValue(raw.cardTeaserClickRate, raw.teaserClicksPerCardTeaserShown), "metrics.cardTeaserClickRate"],
  endScreenElementClicks: [raw.endScreenElementClicks, "metrics.endScreenElementClicks"],
  endScreenElementsShown: [raw.endScreenElementsShown, "metrics.endScreenElementsShown"],
  clicksPerEndScreenElementShown: [raw.clicksPerEndScreenElementShown, "metrics.clicksPerEndScreenElementShown"],
 }

 canonicalMetricOrder.forEach((key) => {
  const input = metricInputs[key]
  if (!input) return
  setMetric(snapshot, metrics, key, input[0], input[1])
 })

 const gained = numberOrNull(raw.subscribersGained)
 const lost = numberOrNull(raw.subscribersLost)
 if (gained !== null || lost !== null) {
  setMetric(snapshot, metrics, "subscribersNet", (gained || 0) - (lost || 0), "metrics.subscribersNet")
 }

 return metrics
}

const toCanonicalVideoRow = (
 snapshot: VtSyncSnapshot,
 video: VtSyncVideoItem,
 index: number,
): CanonicalVideoRow => {
 const videoId = text(firstValue(video.id, (video as Row).videoId), `vt-sync-video-${index + 1}`)
 const durationSeconds = parseDurationSeconds(firstValue(video.duration, (video as Row).durationSeconds))
 const format = normalizeFormat(video.format)
 return {
  id: videoId,
  videoId,
  title: text(video.title, "Metadata pending"),
  thumbnailUrl: text(video.thumbnail),
  uploadDate: text(video.publishedAt),
  format,
  durationSeconds,
  formatDiagnostics: {
   durationSeconds,
   contentType: text(video.format),
   shortsPlaylistSignal: format === "shorts",
   metadataShortSignal: format === "shorts",
   aspectRatioBucket: "unknown",
   finalFormat: format,
  },
  coverageState: snapshot.source === "manual" ? "csv_only" : "api_only",
  apiPresent: snapshot.source !== "manual",
  csvPresent: snapshot.source === "manual",
  sourceMode: visualMetricSource(snapshot),
  metrics: buildVideoMetrics(snapshot, video),
  originalData: video as unknown as Record<string, unknown>,
  supplementalData: {
   vtSyncSource: snapshot.source,
   vtSyncSnapshotId: snapshot.snapshotId,
   categoryName: text(video.category),
   privacyStatus: text(video.privacyStatus),
   tags: video.tags || [],
   topics: video.topics || [],
   definition: video.definition,
   caption: video.caption,
   descriptionSnippet: video.descriptionSnippet,
  },
 }
}

const contextMetricCell = (
 snapshot: VtSyncSnapshot,
 value: unknown,
 sourceField: string,
): MetricCell => {
 const numeric = numberOrNull(value)
 if (numeric === null) {
  return buildUnavailableMetricCell(visualMetricSource(snapshot), "vt_sync_metric_missing", {
   sourceClass: sourceClassFor(snapshot),
   authMode: authModeFor(snapshot),
   officialStatus: snapshot.source === "manual" ? "imported" : "official",
  })
 }
 return buildActualMetricCell(numeric, visualMetricSource(snapshot), {
  sourceField,
  windowScope: (snapshot.selectedTimeWindow || "lifetime") as AnalyticsWindow,
  sourceClass: sourceClassFor(snapshot),
  authMode: authModeFor(snapshot),
  officialStatus: snapshot.source === "manual" ? "imported" : "official",
  mergedStatus: "finalized",
  finalizedAt: Date.now(),
 })
}

const metricMap = (snapshot: VtSyncSnapshot, row: Row): Record<string, MetricCell> => ({
 views: contextMetricCell(snapshot, firstValue(row.views, row.playlistViews), "views"),
 watchHours: contextMetricCell(snapshot, row.watchTime, "watchTime"),
 engagedViews: contextMetricCell(snapshot, row.engagedViews, "engagedViews"),
 averageViewDuration: contextMetricCell(snapshot, firstValue(row.avgDuration, row.avgViewDuration, row.averageViewDuration), "averageViewDuration"),
 averagePercentageViewed: contextMetricCell(snapshot, firstValue(row.avgPercentageViewed, row.averagePercentageViewed, row.averageViewPercentage), "averagePercentageViewed"),
 impressions: contextMetricCell(snapshot, firstValue(row.impressions, row.adImpressions), "impressions"),
 ctr: contextMetricCell(snapshot, row.ctr, "ctr"),
 revenue: contextMetricCell(snapshot, firstValue(row.revenue, row.estimatedRevenue), "revenue"),
 subscribersGained: contextMetricCell(snapshot, row.subscribersGained, "subscribersGained"),
})

const trafficRow = (
 snapshot: VtSyncSnapshot,
 row: VtSyncTrafficRow,
 datasetKind: CanonicalTrafficDatasetKind,
 sourceType: string,
 index: number,
): CanonicalTrafficRow => {
 const record = row as Row
 const detail = text(firstValue(record.term, record.source, record.insightTrafficSourceDetail, record.title))
 const title = text(firstValue(record.title, record.videoTitle, record.channelTitle, record.playlistTitle, detail, sourceType))
 const syncedAt = snapshot.capturedAt
 return {
  channelId: text(snapshot.channelId, "vt-sync-local"),
  datasetKind,
  source: snapshot.source === "manual" ? "csv" : "analytics_api",
  entityType: "channel",
  entityId: text(snapshot.channelId, "vt-sync-local"),
  window: (snapshot.selectedTimeWindow || "lifetime") as AnalyticsWindow,
  trafficSourceType: sourceType,
  trafficSourceDetail: detail || null,
  sourceLabel: text(firstValue(record.source, sourceType)),
  sourceTitle: title,
  sourceVideoId: text(record.videoId) || null,
  resolvedEntityId: detail || `vt-sync-traffic-${index}`,
  resolvedEntityTitle: title,
  resolvedEntityHandle: text(firstValue(record.handle, record.channelHandle)) || null,
  metrics: metricMap(snapshot, record),
  metricMeta: {},
  syncedAt,
 }
}

const addTrafficRows = (
 snapshot: VtSyncSnapshot,
 rows: CanonicalTrafficRow[],
 sourceRows: VtSyncTrafficRow[],
 datasetKind: CanonicalTrafficDatasetKind,
 sourceType: string,
) => {
 sourceRows.forEach((row, index) => {
  rows.push(trafficRow(snapshot, row, datasetKind, sourceType, rows.length + index))
 })
}

const geographyMetricMap = (snapshot: VtSyncSnapshot, row: Row): Record<string, MetricCell> => ({
 views: contextMetricCell(snapshot, row.views, "views"),
 watchHours: contextMetricCell(snapshot, row.watchTime, "watchTime"),
 estimatedMinutesWatched: contextMetricCell(
  snapshot,
  numberOrNull(row.estimatedMinutesWatched) ??
   (numberOrNull(row.watchTime) !== null ? (numberOrNull(row.watchTime) || 0) * 60 : null),
  "estimatedMinutesWatched",
 ),
 engagedViews: contextMetricCell(snapshot, row.engagedViews, "engagedViews"),
 subscribersGained: contextMetricCell(snapshot, row.subscribersGained, "subscribersGained"),
 revenue: contextMetricCell(snapshot, firstValue(row.revenue, row.estimatedRevenue), "revenue"),
})

const toGeographyRow = (
 snapshot: VtSyncSnapshot,
 row: Row,
 type: "country" | "city" | "province" | "dma" | "continent",
 index: number,
): CanonicalGeographyRow => {
 const labelValue =
  type === "city" ? firstValue(row.city, row.region, row.country) :
  type === "province" ? firstValue(row.province, row.region, row.country) :
  type === "dma" ? firstValue(row.dma, row.region, row.province, row.country) :
  type === "continent" ? firstValue(row.subContinent, row.continent, row.region) :
  firstValue(row.country, row.region)
 const label = text(labelValue, `Unknown ${type} ${index + 1}`)
 return {
  channelId: text(snapshot.channelId, "vt-sync-local"),
  entityType: "channel",
  entityId: text(snapshot.channelId, "vt-sync-local"),
  window: (snapshot.selectedTimeWindow || "lifetime") as AnalyticsWindow,
  geographyLabel: label,
  geographyType: type,
  country: type === "country" ? label : text(firstValue(row.country, "Unknown")),
  province: type === "province" || type === "dma" ? label : null,
  city: type === "city" ? label : null,
  metrics: geographyMetricMap(snapshot, row),
  metricMeta: {},
  syncedAt: snapshot.capturedAt,
 }
}

export const buildVtSyncVisualPropsData = (
 inputSnapshot: VtSyncSnapshot,
 privacyFilters: VtSyncPrivacyFilters = readVtSyncPrivacyFilters(),
): VtSyncVisualPropsData => {
 const snapshot = applyVtSyncPrivacyFilters(inputSnapshot, privacyFilters)
 const rows = snapshot.videos.map((video, index) => toCanonicalVideoRow(snapshot, video, index))
 const trafficRows: CanonicalTrafficRow[] = []
 addTrafficRows(snapshot, trafficRows, snapshot.trafficSources, "traffic_summary", "SUMMARY")
 addTrafficRows(snapshot, trafficRows, snapshot.searchTerms, "traffic_detail", "YT_SEARCH")
 addTrafficRows(snapshot, trafficRows, snapshot.extWebsites, "traffic_detail", "EXT_URL")
 addTrafficRows(snapshot, trafficRows, snapshot.suggestedVideos, "traffic_detail", "RELATED_VIDEO")
 addTrafficRows(snapshot, trafficRows, snapshot.hashtags, "traffic_detail", "HASHTAGS")
 addTrafficRows(snapshot, trafficRows, snapshot.soundPages, "traffic_detail", "SOUND_PAGE")
 addTrafficRows(snapshot, trafficRows, snapshot.trafficAdvertising, "traffic_detail", "ADVERTISING")
 addTrafficRows(snapshot, trafficRows, snapshot.trafficChannelPages, "traffic_detail", "YT_CHANNEL")
 addTrafficRows(snapshot, trafficRows, snapshot.trafficOtherFeatures, "traffic_detail", "YT_OTHER_PAGE")
 addTrafficRows(snapshot, trafficRows, snapshot.trafficSubscriberData, "traffic_detail", "SUBSCRIBER")
 addTrafficRows(snapshot, trafficRows, snapshot.trafficShorts, "traffic_detail", "SHORTS")
 addTrafficRows(snapshot, trafficRows, snapshot.trafficBrowseFeatures, "traffic_detail", "BROWSE")
 addTrafficRows(snapshot, trafficRows, snapshot.trafficCampaignCard, "traffic_detail", "CAMPAIGN_CARD")
 addTrafficRows(snapshot, trafficRows, snapshot.trafficCard, "traffic_detail", "CARD")
 addTrafficRows(snapshot, trafficRows, snapshot.trafficEndScreen, "traffic_detail", "END_SCREEN")
 addTrafficRows(snapshot, trafficRows, snapshot.trafficLiveRedirect, "traffic_detail", "LIVE_REDIRECT")
 addTrafficRows(snapshot, trafficRows, snapshot.trafficNotification, "traffic_detail", "NOTIFICATION")
 addTrafficRows(snapshot, trafficRows, snapshot.trafficNoLinkEmbedded, "traffic_detail", "NO_LINK_EMBEDDED")
 addTrafficRows(snapshot, trafficRows, snapshot.trafficNoLinkOther, "traffic_detail", "NO_LINK_OTHER")
 addTrafficRows(snapshot, trafficRows, snapshot.trafficPlaylist, "traffic_detail", "PLAYLIST")
 addTrafficRows(snapshot, trafficRows, snapshot.trafficYtPlaylistPage, "traffic_detail", "YT_PLAYLIST_PAGE")
 addTrafficRows(snapshot, trafficRows, snapshot.playbackLocations as VtSyncTrafficRow[], "traffic_playback_location", "PLAYBACK_LOCATION")

 const geographyRows = [
  ...snapshot.geography.map((row, index) => toGeographyRow(snapshot, row, "country", index)),
  ...snapshot.cities.map((row, index) => toGeographyRow(snapshot, row, "city", index)),
  ...snapshot.provinces.map((row, index) => toGeographyRow(snapshot, row, "province", index)),
  ...snapshot.dmaRegions.map((row, index) => toGeographyRow(snapshot, row, "dma", index)),
  ...snapshot.continentsData.map((row, index) => toGeographyRow(snapshot, row, "continent", index)),
 ]

 return {
  rows,
  csvFiles: [],
  canonicalContext: {
   trafficRows,
   geographyRows,
  },
  diagnostics: {
   videos: rows.length,
   trafficRows: trafficRows.length,
   geographyRows: geographyRows.length,
   source: snapshot.source,
  },
 }
}
