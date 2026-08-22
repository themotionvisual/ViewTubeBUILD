import type { VtSyncSnapshot, VtSyncTableDefinition } from "./contracts"
import {
 filterVtSyncVideos,
 readVtSyncPrivacyFilters,
 type VtSyncPrivacyFilters,
} from "./privacyPolicy"
import {
 getVtSyncCountryFlag,
 getVtSyncCountryName,
 getVtSyncDmaName,
 getVtSyncStateName,
 normalizeVtSyncCountryCode,
 normalizeVtSyncDmaCode,
 normalizeVtSyncStateCode,
} from "../upstream/geographyLookup"
import { getVtSyncTrafficDetailTable } from "../upstream/tableRegistry"

type Row = Record<string, unknown>

const isMissing = (value: unknown): boolean => value === null || value === undefined || value === ""

const firstValue = (...values: unknown[]): unknown => values.find((value) => !isMissing(value))

const num = (value: unknown): number | undefined => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value === "string" && value.trim()) {
  const parsed = Number(value.replace(/[$,% ,]/g, ""))
  if (Number.isFinite(parsed)) return parsed
 }
 return undefined
}

const numberOrZero = (value: unknown): number => num(value) ?? 0

const withPlaylistShareColumns = (rows: Row[]): Row[] => {
 const normalized: Row[] = rows.map((row): Row => {
  const pId = String(row.playlistId || row.id || row.playlist || "").trim()
  const thumbnail = String(row.cover || row.thumbnail || "").trim()
  return {
   ...row,
   title: firstValue(row.title, row.playlist),
   watchTime: firstValue(row.watchTime, row.playlistEstimatedMinutesWatched),
   playlistUrl: pId && pId !== "Unknown" && pId !== "-" ? `https://www.youtube.com/playlist?list=${pId}` : "",
   cover: thumbnail,
   thumbnail,
  }
 })
 const viewsTotal = normalized.reduce((sum, row) => sum + Math.max(0, num(row.views) ?? 0), 0)
 const watchTimeTotal = normalized.reduce((sum, row) => sum + Math.max(0, num(row.watchTime) ?? 0), 0)
 return normalized.map((row) => {
  const views = num(row.views)
  const watchTime = num(row.watchTime)
  return {
   ...row,
   playlistViewShare: viewsTotal > 0 && views !== undefined ? (views / viewsTotal) * 100 : undefined,
   playlistWatchTimeShare: watchTimeTotal > 0 && watchTime !== undefined ? (watchTime / watchTimeTotal) * 100 : undefined,
  }
 })
}

const asRecord = (value: unknown): Row => (value && typeof value === "object" ? value as Row : {})

const geographyCountryRow = (row: Row): Row => {
 const countryCode = normalizeVtSyncCountryCode(firstValue(row.countryCode, row.country))
 return {
 ...row,
 countryCode,
  countryName: getVtSyncCountryName(countryCode),
  countryFlag: getVtSyncCountryFlag(countryCode),
 }
}

const geographyStateRow = (row: Row): Row => {
 const provinceCode = normalizeVtSyncStateCode(firstValue(row.provinceCode, row.province))
 return { ...row, provinceCode, stateName: getVtSyncStateName(provinceCode) }
}

const geographyDmaRow = (row: Row): Row => {
 const dmaCode = normalizeVtSyncDmaCode(firstValue(row.dmaCode, row.dma))
 return { ...row, dmaCode, dmaName: getVtSyncDmaName(dmaCode) }
}

export const getVtSyncContentTypeLabel = (value: unknown, row?: Record<string, any>): string => {
 const raw = String(value ?? "").trim()
 const normalized = raw.toLowerCase().replace(/[^a-z0-9]/g, "")
 if (normalized === "short" || normalized === "shorts") return "Shorts"
 if (["videoondemand", "vod", "long", "longformat"].includes(normalized)) return "Long-Format"
 if (["livestream", "live"].includes(normalized)) return "Live Stream"
 if (row) {
  const title = String(row.title ?? row.videoTitle ?? row.name ?? "").toLowerCase()
  if (Boolean(row.isLive) || title.includes("live") || title.includes("stream")) return "Live Stream"
  if (Boolean(row.isShort) || title.includes("#short")) return "Shorts"
  return "Long-Format"
 }
 if (["creatorcontenttypeunspecified", "unspecified", "unknown"].includes(normalized)) return "Unspecified"
 return raw
}

type VtSyncDemographicGender = "male" | "female" | "other"

const VT_SYNC_DEMOGRAPHIC_AGE_ORDER = [
 "age13-17",
 "age18-24",
 "age25-34",
 "age35-44",
 "age45-54",
 "age55-64",
 "age65-",
] as const

const normalizeDemographicGender = (value: unknown): VtSyncDemographicGender | undefined => {
 const normalized = String(value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_")
 if (!normalized) return undefined
 if (normalized === "male") return "male"
 if (normalized === "female") return "female"
 return "other"
}

const normalizeDemographicAge = (value: unknown): { key: string; label: string; order: number } | undefined => {
 const raw = String(value ?? "").trim()
 if (!raw) return undefined
 const normalized = raw.toLowerCase().replace(/[–—]/g, "-")
 const match = normalized.match(/(\d{1,2})\s*-\s*(\d{1,2})|(?:age|ages)?\s*(\d{1,2})\s*(?:\+|-\s*)$/)
 if (!match) return { key: normalized.replace(/\s+/g, "_"), label: raw, order: VT_SYNC_DEMOGRAPHIC_AGE_ORDER.length }
 const start = match[1] || match[3]
 const end = match[2]
 const key = `age${start}-${end || ""}`
 const knownOrder = VT_SYNC_DEMOGRAPHIC_AGE_ORDER.indexOf(key as (typeof VT_SYNC_DEMOGRAPHIC_AGE_ORDER)[number])
 return {
  key,
  label: end ? `Ages ${start}–${end}` : `Ages ${start}+`,
  order: knownOrder >= 0 ? knownOrder : VT_SYNC_DEMOGRAPHIC_AGE_ORDER.length,
 }
}

const sumAvailable = (values: Array<number | undefined>): number | undefined => {
 const available = values.filter((value): value is number => value !== undefined)
 return available.length ? available.reduce((sum, value) => sum + value, 0) : undefined
}

/**
 * Converts one authoritative ageGroup × gender viewerPercentage report into a
 * compact matrix. The body rows are age totals, the three interior columns are
 * intersections, and column totals are the gender-only rollups.
 */
export const buildVtSyncDemographicOverviewRows = (rows: Row[]): Row[] => {
 const containsMatrixRows = rows.some((row) => [
  row.maleViewerPercentage,
  row.femaleViewerPercentage,
  row.otherViewerPercentage,
 ].some((value) => num(value) !== undefined))

 if (containsMatrixRows) {
  return rows.flatMap<Row>((row) => {
   const age = normalizeDemographicAge(firstValue(row.ageGroup, row.ageGroupLabel, row.cohort))
   if (!age) return []
   const maleViewerPercentage = num(row.maleViewerPercentage)
   const femaleViewerPercentage = num(row.femaleViewerPercentage)
   const otherViewerPercentage = num(row.otherViewerPercentage)
   return [{
    ...row,
    ageGroup: age.key,
    ageGroupLabel: age.label,
    cohort: age.label,
    ageOrder: age.order,
    maleViewerPercentage,
    femaleViewerPercentage,
    otherViewerPercentage,
    viewerPercentage: num(row.viewerPercentage) ?? sumAvailable([maleViewerPercentage, femaleViewerPercentage, otherViewerPercentage]),
   }]
  }).sort((left, right) => Number(left.ageOrder) - Number(right.ageOrder) || String(left.ageGroupLabel).localeCompare(String(right.ageGroupLabel)))
 }

 const byAge = new Map<string, {
  key: string
  label: string
  order: number
  values: Partial<Record<VtSyncDemographicGender, number>>
 }>()
 rows.forEach((row) => {
  const age = normalizeDemographicAge(firstValue(row.ageGroup, row.ageGroupLabel))
  const gender = normalizeDemographicGender(row.gender)
  const percentage = num(firstValue(row.viewerPercentage, row.viewsPct))
  if (!age || !gender || percentage === undefined || percentage < 0) return
  const bucket = byAge.get(age.key) || { ...age, values: {} }
  bucket.values[gender] = (bucket.values[gender] ?? 0) + percentage
  byAge.set(age.key, bucket)
 })

 return [...byAge.values()]
  .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label))
  .map(({ key, label, order, values }) => ({
   ageGroup: key,
   ageGroupLabel: label,
   cohort: label,
   ageOrder: order,
   maleViewerPercentage: values.male,
   femaleViewerPercentage: values.female,
   otherViewerPercentage: values.other,
   viewerPercentage: sumAvailable([values.male, values.female, values.other]),
  }))
}

const deriveVtSyncDemographicsByAge = (rows: Row[]): Row[] =>
 buildVtSyncDemographicOverviewRows(rows).map((row) => ({
  ...row,
  cohort: row.ageGroupLabel,
  viewsPct: row.viewerPercentage,
 }))

const deriveVtSyncDemographicsByGender = (rows: Row[]): Row[] => {
 const matrix = buildVtSyncDemographicOverviewRows(rows)
 const definitions: Array<{ key: VtSyncDemographicGender; column: string; label: string }> = [
  { key: "male", column: "maleViewerPercentage", label: "Male" },
  { key: "female", column: "femaleViewerPercentage", label: "Female" },
  { key: "other", column: "otherViewerPercentage", label: "Other" },
 ]
 return definitions.flatMap(({ key, column, label }) => {
  const viewsPct = sumAvailable(matrix.map((row) => num(row[column])))
  return viewsPct === undefined ? [] : [{ cohort: label, gender: key, viewsPct, viewerPercentage: viewsPct }]
 })
}

const uploadPlaceholderVideos = (snapshot: VtSyncSnapshot): Row[] => {
 const uploadRows = snapshot.tableExports?.uploads_playlist || []
 if (!Array.isArray(uploadRows)) return []
 return uploadRows.map((row) => {
  const record = typeof row === "object" && row ? row as Row : { videoId: row }
  const id = String(firstValue(record.videoId, record.id, record.video, "") || "")
  return {
   id,
   videoId: id,
   title: "Metadata pending",
   thumbnail: "",
   publishedAt: "",
   format: "unknown",
   category: "Metadata pending",
   privacyStatus: "Metadata pending",
   duration: "",
   definition: "",
   caption: "",
   tags: [],
   topics: [],
   descriptionSnippet: `Upload playlist ID captured for ${id}. Video metadata has not been synced into this snapshot yet.`,
   vtSyncPlaceholder: true,
  }
 }).filter((row) => row.videoId)
}

const metricBase = (row: Row): Row => ({
 views: firstValue(row.views, row.playlistViews),
 engagedViews: firstValue(row.engagedViews),
 watchTime: firstValue(row.watchTime, num(row.estimatedMinutesWatched) !== undefined ? numberOrZero(row.estimatedMinutesWatched) / 60 : undefined, row.playlistEstimatedMinutesWatched),
 avgDuration: firstValue(row.avgDuration, row.averageViewDuration, row.avgViewDuration),
 avgPercentageViewed: firstValue(row.avgPercentageViewed, row.averageViewPercentage, row.averagePercentageViewed),
 revenue: firstValue(row.revenue, row.estimatedRevenue),
 estimatedAdRevenue: firstValue(row.estimatedAdRevenue),
 youtubePremiumRevenue: firstValue(row.youtubePremiumRevenue, row.estimatedRedPartnerRevenue, row.redRevenue),
 youtubePremiumViews: firstValue(row.youtubePremiumViews, row.redViews),
 youtubePremiumWatchTime: firstValue(
  row.youtubePremiumWatchTime,
  num(row.estimatedRedMinutesWatched) !== undefined ? numberOrZero(row.estimatedRedMinutesWatched) / 60 : undefined,
 ),
 redViews: firstValue(row.redViews),
 estimatedRedMinutesWatched: firstValue(row.estimatedRedMinutesWatched),
 shares: firstValue(row.shares),
 subscribersGained: firstValue(row.subscribersGained),
 subscribersLost: firstValue(row.subscribersLost),
 likes: firstValue(row.likes),
 dislikes: firstValue(row.dislikes),
 comments: firstValue(row.comments),
 cpm: firstValue(row.cpm),
 grossRevenue: firstValue(row.grossRevenue),
 monetizedPlaybacks: firstValue(row.monetizedPlaybacks),
 playbackBasedCpm: firstValue(row.playbackBasedCpm),
 adImpressions: firstValue(row.adImpressions, row.impressions),
 impressions: firstValue(row.impressions, row.adImpressions),
})

const dailyBase = (row: Row): Row => ({
 ...metricBase(row),
 date: row.date || row.day,
 watchTime: firstValue(row.watchTime, num(row.estimatedMinutesWatched) !== undefined ? numberOrZero(row.estimatedMinutesWatched) / 60 : undefined),
 avgViewDuration: firstValue(row.avgViewDuration, row.averageViewDuration),
 averagePercentageViewed: firstValue(row.averagePercentageViewed, row.averageViewPercentage, row.avgPercentageViewed),
 estimatedAdRevenue: firstValue(row.estimatedAdRevenue),
 youtubePremiumRevenue: firstValue(row.youtubePremiumRevenue, row.estimatedRedPartnerRevenue),
 youtubePremiumViews: firstValue(row.youtubePremiumViews, row.redViews),
 youtubePremiumWatchTime: firstValue(
  row.youtubePremiumWatchTime,
  num(row.estimatedRedMinutesWatched) !== undefined ? numberOrZero(row.estimatedRedMinutesWatched) / 60 : undefined,
 ),
 redViews: firstValue(row.redViews),
 estimatedRedMinutesWatched: firstValue(row.estimatedRedMinutesWatched),
 cardClicks: firstValue(row.cardClicks),
 cardImpressions: firstValue(row.cardImpressions),
 cardClickRate: firstValue(row.cardClickRate),
 cardTeaserClicks: firstValue(row.cardTeaserClicks),
 cardTeaserImpressions: firstValue(row.cardTeaserImpressions),
 cardTeaserClickRate: firstValue(row.cardTeaserClickRate),
 annotationClicks: firstValue(row.annotationClicks),
 annotationImpressions: firstValue(row.annotationImpressions),
 annotationClickThroughRate: firstValue(row.annotationClickThroughRate),
 playlistViews: firstValue(row.playlistViews),
 playlistStarts: firstValue(row.playlistStarts),
 viewsPerPlaylistStart: firstValue(row.viewsPerPlaylistStart),
 videosAddedToPlaylists: firstValue(row.videosAddedToPlaylists),
 videosRemovedFromPlaylists: firstValue(row.videosRemovedFromPlaylists),
})

/** Canonical Videos-table row adapter. Live snapshots, IndexedDB recovery,
 * imports, and exports must all pass through this function. */
export const normalizeVtSyncVideoTableRows = (
 rows: Row[],
 privacyFilters?: VtSyncPrivacyFilters,
): Row[] => {
 const sourceVideos = privacyFilters ? filterVtSyncVideos(rows, privacyFilters) : rows
 return sourceVideos.map((video) => {
 const metrics = asRecord(video.metrics)
 const videoId = firstValue(video.id, video.videoId)
 const views = num(firstValue(metrics.views, video.views))
 const engagedViews = num(metrics.engagedViews)
 const likes = num(metrics.likes)
 const dislikes = num(metrics.dislikes)
 const gained = num(metrics.subscribersGained)
 const lost = num(metrics.subscribersLost)
const revenue = num(

 firstValue(

  metrics.revenue,

  metrics.estimatedRevenue,

  video.revenue,

  video.estimatedRevenue,

 )
)
  const comments = num(metrics.comments)
  const shares = num(metrics.shares)
  const saves = num(metrics.saves)
  return {
  ...video,
  ...metrics,
  videoId,
  videoUrl: videoId ? `https://www.youtube.com/watch?v=${String(videoId)}` : firstValue(video.videoUrl, video.url),
  publishedDay: firstValue(video.publishedDay, video.publishedAt),

publishedTime: firstValue(
 video.publishedTime,
 video.publishedAt,
),
  title: firstValue(video.title, "Metadata pending"),
  titleLength: String(firstValue(video.title, "") || "").length,
revenue: firstValue(
 metrics.revenue,
 (metrics as Row).estimatedRevenue,
 video.revenue,
 video.estimatedRevenue,),
  youtubePremiumRevenue: firstValue((metrics as Row).youtubePremiumRevenue, (metrics as Row).estimatedRedPartnerRevenue),
  youtubePremiumWatchTime: firstValue((metrics as Row).youtubePremiumWatchTime, num((metrics as Row).estimatedRedMinutesWatched) !== undefined ? numberOrZero((metrics as Row).estimatedRedMinutesWatched) / 60 : undefined),
  cardsShown: firstValue((metrics as Row).cardsShown, (metrics as Row).cardImpressions),
  clicksPerCardShown: firstValue((metrics as Row).clicksPerCardShown, (metrics as Row).cardClickRate),
  cardTeasersShown: firstValue((metrics as Row).cardTeasersShown, (metrics as Row).cardTeaserImpressions),
teaserClicksPerCardTeaserShown: firstValue((metrics as Row).teaserClicksPerCardTeaserShown, (metrics as Row).cardTeaserClickRate),
engagementRate: firstValue((metrics as Row).engagementRate, views !== undefined && views > 0 && engagedViews !== undefined ? (engagedViews / views) * 100 : undefined),
    likeRatio: firstValue((metrics as Row).likeRatio, likes !== undefined && dislikes !== undefined && likes + dislikes > 0 ? (likes / (likes + dislikes)) * 100 : undefined),
    likeRate: firstValue((metrics as Row).likeRate, views !== undefined && views > 0 && likes !== undefined ? (likes / views) * 100 : undefined),
    netSubscribers: firstValue((metrics as Row).netSubscribers, gained !== undefined && lost !== undefined ? gained - lost : undefined),
   subRatio: firstValue((metrics as Row).subRatio, views !== undefined && views > 0 && gained !== undefined ? (gained / views) * 1000 : undefined),
   subRate: firstValue((metrics as Row).subRate, views !== undefined && views > 0 && gained !== undefined ? (gained / views) * 100 : undefined),
rpm: firstValue(
 (metrics as Row).rpm,
 video.rpm,
 views !== undefined && views > 0 && revenue !== undefined
  ? (revenue / views) * 1000
  : undefined,
),
   commentRate: firstValue((metrics as Row).commentRate, views !== undefined && views > 0 && comments !== undefined ? (comments / views) * 100 : undefined),
   shareRate: firstValue((metrics as Row).shareRate, views !== undefined && views > 0 && shares !== undefined ? (shares / views) * 100 : undefined),
   saveRate: firstValue((metrics as Row).saveRate, views !== undefined && views > 0 && saves !== undefined ? (saves / views) * 100 : undefined),
   revenuePer100Views: firstValue((metrics as Row).revenuePer100Views, views !== undefined && views > 0 && revenue !== undefined ? (revenue / views) * 100 : undefined),
 }
 })
}

const videoRows = (
 snapshot: VtSyncSnapshot,
 privacyFilters: VtSyncPrivacyFilters,
): Row[] => normalizeVtSyncVideoTableRows(
 snapshot.videos.length ? snapshot.videos as Array<Row> : uploadPlaceholderVideos(snapshot),
 privacyFilters,
)

const windowEntry = (label: string, value: Row | undefined): Row => {
 const gained = num(value?.subscribersGained)
 const lost = num(value?.subscribersLost)
 return {
  ...value,
  window: label,
  views: value?.views,
  engagedViews: value?.engagedViews,
  watchTime: value?.watchTime,
  revenue: firstValue(value?.revenue, value?.estimatedRevenue),
  subscribers: firstValue(value?.subscribers, value?.subscribersGained),
  subscribersGained: value?.subscribersGained,
  subscribersLost: value?.subscribersLost,
  netSubscribers: firstValue(value?.netSubscribers, gained !== undefined && lost !== undefined ? gained - lost : undefined),
  impressions: firstValue(value?.impressions, value?.adImpressions),
 }
}

const channelTotalRows = (snapshot: VtSyncSnapshot): Row[] => {
 const totals = (snapshot.channelTotals || {}) as Row
 const rows = [
  windowEntry("Lifetime (All Time)", firstValue(totals.lifetime) as Row | undefined),
  windowEntry("Last 365 Days (365d)", firstValue(totals.last365, totals["365d"]) as Row | undefined),
  windowEntry("Last 90 Days (90d)", firstValue(totals.last90, totals["90d"]) as Row | undefined),
  windowEntry("Last 28 Days (28d)", firstValue(totals.last28, totals["28d"]) as Row | undefined),
  windowEntry("Last 7 Days (7d)", firstValue(totals.last7, totals["7d"]) as Row | undefined),
  windowEntry("Previous 365 Days", totals.prev365 as Row | undefined),
  windowEntry("Previous 90 Days", totals.prev90 as Row | undefined),
  windowEntry("Previous 28 Days", totals.prev28 as Row | undefined),
  windowEntry("Previous 7 Days", totals.prev7 as Row | undefined),
 ]
 return rows.filter((row) => Object.values(row).some((value, index) => index > 0 && !isMissing(value)))
}

const normalizeTrafficRows = (rows: Row[], identityKey: string, tableId?: string): Row[] => rows.map((row) => {
 const id = String(firstValue(row.term, row.insightTrafficSourceDetail, row.insightTrafficSourceType, row.source, "Unknown"))
 let defaultTitle = undefined
 if (id && id !== "Unknown" && id !== "-") {
  if (tableId === "suggested") defaultTitle = `Suggested Video ${id}`
  else if (tableId === "chan_page") defaultTitle = `Channel ${id}`
 }
 return {
  ...row,
  ...metricBase(row),
  source: firstValue(row.source, row.insightTrafficSourceType, row.term),
  term: id,
  title: firstValue(row.title, row.videoTitle, row.channelTitle, row.playlistTitle, defaultTitle),
  handle: firstValue(row.handle, row.channelHandle),
  sourceChannel: firstValue(row.sourceChannelTitle, row.channelTitle),
  sourceChannelHandle: firstValue(row.sourceChannelHandle, row.channelHandle, row.handle),
  [identityKey]: firstValue(row[identityKey], id),
 }
})

const withTrafficShareColumns = (rows: Row[]): Row[] => {
 const totalViews = rows.reduce((sum, row) => sum + numberOrZero(firstValue(row.views, row.metrics && asRecord(row.metrics).views)), 0)
 const totalWatchTime = rows.reduce((sum, row) => sum + numberOrZero(firstValue(row.watchTime, row.metrics && asRecord(row.metrics).watchTime, row.estimatedMinutesWatched)), 0)
 return rows.map((row) => {
  const views = numberOrZero(firstValue(row.views, row.metrics && asRecord(row.metrics).views))
  const watchTime = numberOrZero(firstValue(row.watchTime, row.metrics && asRecord(row.metrics).watchTime, row.estimatedMinutesWatched))
  return {
   ...row,
   trafficViewShare: totalViews > 0 ? views / totalViews * 100 : undefined,
   trafficWatchTimeShare: totalWatchTime > 0 ? watchTime / totalWatchTime * 100 : undefined,
  }
 })
}

const withFormatSubscriberChannelShareColumns = (rows: Row[]): Row[] => {
 const normalized = rows.map<Row>((row) => {
  const youtubePremiumViews = firstValue(row.youtubePremiumViews, row.redViews)
  const youtubePremiumWatchTime = firstValue(
   row.youtubePremiumWatchTime,
   typeof row.estimatedRedMinutesWatched === "number" ? row.estimatedRedMinutesWatched / 60 : undefined,
  )
  return { ...row, youtubePremiumViews, youtubePremiumWatchTime }
 })
 const totalViews = normalized.reduce((sum, row) => sum + numberOrZero(row.views), 0)
 const totalWatchTime = normalized.reduce((sum, row) => sum + numberOrZero(row.watchTime), 0)
 const totalPremiumViews = normalized.reduce((sum, row) => sum + numberOrZero(row.youtubePremiumViews), 0)
 const totalPremiumWatchTime = normalized.reduce((sum, row) => sum + numberOrZero(row.youtubePremiumWatchTime), 0)
 return normalized.map((row) => {
  const views = numberOrZero(row.views)
  const watchTime = numberOrZero(row.watchTime)
  const premiumViews = numberOrZero(row.youtubePremiumViews)
  const premiumWatchTime = numberOrZero(row.youtubePremiumWatchTime)
  return {
   ...row,
   channelViewShare: totalViews > 0 ? views / totalViews * 100 : undefined,
   channelWatchTimeShare: totalWatchTime > 0 ? watchTime / totalWatchTime * 100 : undefined,
   channelPremiumViewShare: totalPremiumViews > 0 ? premiumViews / totalPremiumViews * 100 : undefined,
   channelPremiumWatchTimeShare: totalPremiumWatchTime > 0 ? premiumWatchTime / totalPremiumWatchTime * 100 : undefined,
  }
 })
}

export const withVtSyncFormatShareColumns = (rows: Row[]): Row[] => {
 const totals = {
  views: rows.reduce((sum, row) => sum + numberOrZero(row.views), 0),
  engagedViews: rows.reduce((sum, row) => sum + numberOrZero(row.engagedViews), 0),
  watchTime: rows.reduce((sum, row) => sum + numberOrZero(row.watchTime), 0),
 }
 return rows.map((row) => {
  const views = num(row.views)
  const engagedViews = num(row.engagedViews)
  const watchTime = num(row.watchTime)
  return {
   ...row,
   formatViewShare: views !== undefined && totals.views > 0 ? views / totals.views * 100 : undefined,
   formatEngagedViewShare: engagedViews !== undefined && totals.engagedViews > 0 ? engagedViews / totals.engagedViews * 100 : undefined,
   formatWatchTimeShare: watchTime !== undefined && totals.watchTime > 0 ? watchTime / totals.watchTime * 100 : undefined,
  }
 })
}

const formatMetricValue = (row: Row, ...keys: string[]): number | undefined =>
 num(firstValue(...keys.map((key) => row[key])))

const sumFormatMetric = (rows: Row[], ...keys: string[]): number | undefined =>
 sumAvailable(rows.map((row) => formatMetricValue(row, ...keys)))

const averageFormatMetric = (rows: Row[], ...keys: string[]): number | undefined => {
 const values = rows
  .map((row) => formatMetricValue(row, ...keys))
  .filter((value): value is number => value !== undefined)
 return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined
}

const formatDurationSeconds = (row: Row): number | undefined => {
 const numeric = formatMetricValue(row, "durationSeconds")
 if (numeric !== undefined) return numeric
 const raw = String(firstValue(row.duration, "") || "").trim()
 if (!raw) return undefined
 if (/^PT/i.test(raw)) {
  const match = raw.match(/^PT(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?$/i)
  if (!match) return undefined
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0)
 }
 const parts = raw.split(":").map(Number)
 if (parts.some((part) => !Number.isFinite(part))) return undefined
 if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
 if (parts.length === 2) return parts[0] * 60 + parts[1]
 return parts.length === 1 && parts[0] >= 0 ? parts[0] : undefined
}

const weightedFormatAverage = (
 rows: Row[],
 valueKeys: string[],
 weightKeys: string[] = ["views"],
): number | undefined => {
 const pairs = rows.flatMap((row) => {
  const value = formatMetricValue(row, ...valueKeys)
  const weight = formatMetricValue(row, ...weightKeys)
  return value === undefined || weight === undefined || weight <= 0 ? [] : [{ value, weight }]
 })
 const totalWeight = pairs.reduce((sum, pair) => sum + pair.weight, 0)
 if (totalWeight > 0) return pairs.reduce((sum, pair) => sum + pair.value * pair.weight, 0) / totalWeight
 const values = rows.map((row) => formatMetricValue(row, ...valueKeys)).filter((value): value is number => value !== undefined)
 return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined
}

const netSubscribersForFormatRow = (row: Row): number | undefined => {
 const net = formatMetricValue(row, "netSubscribers", "subscribers")
 if (net !== undefined) return net
 const gained = formatMetricValue(row, "subscribersGained")
 const lost = formatMetricValue(row, "subscribersLost")
 return gained !== undefined && lost !== undefined ? gained - lost : undefined
}

/**
 * Builds a second, explicitly video-derived metric group for the Formats table.
 * The content-type report stays authoritative for its existing columns; these
 * values summarize the visible video rows by the same normalized format label.
 */
export const buildVtSyncVideoFormatTotals = (rows: Row[]): Row[] => {
 const buckets = new Map<string, Row[]>()
 rows.forEach((row) => {
  const label = getVtSyncContentTypeLabel(firstValue(row.format, row.contentType, row.creatorContentType)).trim()
  if (!label) return
  buckets.set(label, [...(buckets.get(label) || []), row])
 })

 return [...buckets.entries()].map(([term, bucket]) => {
  const videoFormatViews = sumFormatMetric(bucket, "views")
  const pairedWatchRows = bucket.filter((row) =>
   formatMetricValue(row, "views") !== undefined && formatMetricValue(row, "watchTime") !== undefined)
  const pairedViews = sumFormatMetric(pairedWatchRows, "views")
  const pairedWatchTime = sumFormatMetric(pairedWatchRows, "watchTime")
  const videoFormatAvgViewDuration = pairedViews !== undefined && pairedViews > 0 && pairedWatchTime !== undefined
   ? pairedWatchTime * 3600 / pairedViews
   : weightedFormatAverage(bucket, ["avgViewDuration", "averageViewDuration", "avgDuration"])
  const videoFormatGrossRevenue = sumFormatMetric(bucket, "grossRevenue")
  const videoFormatAdImpressions = sumFormatMetric(bucket, "adImpressions")
  const videoFormatAverageCpm = videoFormatGrossRevenue !== undefined
   && videoFormatAdImpressions !== undefined
   && videoFormatAdImpressions > 0
   ? (videoFormatGrossRevenue / videoFormatAdImpressions) * 1000
   : weightedFormatAverage(bucket, ["cpm"], ["adImpressions"])
  const durationValues = bucket
   .map(formatDurationSeconds)
   .filter((value): value is number => value !== undefined)

  return {
   term,
   contentTypeCode: term,
   videoFormatVideoCount: bucket.length,
   videoFormatAverageDuration: durationValues.length
    ? durationValues.reduce((sum, value) => sum + value, 0) / durationValues.length
    : undefined,
   videoFormatAverageViews: averageFormatMetric(bucket, "views"),
   videoFormatAverageWatchTime: averageFormatMetric(bucket, "watchTime"),
   videoFormatAverageLikes: averageFormatMetric(bucket, "likes"),
   videoFormatAverageSubscribers: averageFormatMetric(bucket, "netSubscribers", "subscribers"),
   videoFormatAverageComments: averageFormatMetric(bucket, "comments"),
   videoFormatAverageShares: averageFormatMetric(bucket, "shares"),
   videoFormatAverageCpm,
   videoFormatAverageEstimatedRevenue: averageFormatMetric(bucket, "revenue", "estimatedRevenue"),
   videoFormatAverageGrossRevenue: averageFormatMetric(bucket, "grossRevenue"),
   videoFormatViews,
   videoFormatEngagedViews: sumFormatMetric(bucket, "engagedViews"),
   videoFormatWatchTime: sumFormatMetric(bucket, "watchTime"),
   videoFormatAvgViewDuration,
   videoFormatAvgPercentageViewed: weightedFormatAverage(bucket, ["averagePercentageViewed", "avgPercentageViewed"]),
   videoFormatRevenue: sumFormatMetric(bucket, "revenue", "estimatedRevenue"),
   videoFormatLikes: sumFormatMetric(bucket, "likes"),
   videoFormatSubscribers: sumAvailable(bucket.map(netSubscribersForFormatRow)),
   videoFormatComments: sumFormatMetric(bucket, "comments"),
   videoFormatSaves: sumFormatMetric(bucket, "videosAddedToPlaylists", "playlistSaves", "saves"),
   videoFormatShares: sumFormatMetric(bucket, "shares"),
  }
 })
}

const mergeVtSyncVideoFormatTotals = (
 formatRows: Row[],
 videoTotals: Row[],
 backfillBaseMetrics: boolean,
): Row[] => {
 const totalsByLabel = new Map(videoTotals.map((row) => [getVtSyncContentTypeLabel(row.term), row]))
 const merged = formatRows.map((row) => {
  const label = getVtSyncContentTypeLabel(row.term)
  const derived = totalsByLabel.get(label)
  totalsByLabel.delete(label)
  return derived
   ? { ...row, ...derived, term: label, contentTypeCode: firstValue(row.contentTypeCode, derived.contentTypeCode) }
   : row
 })

 totalsByLabel.forEach((derived, label) => {
  merged.push({
   ...derived,
   term: label,
   contentTypeCode: derived.contentTypeCode,
   ...(backfillBaseMetrics ? {
    views: derived.videoFormatViews,
    engagedViews: derived.videoFormatEngagedViews,
    watchTime: derived.videoFormatWatchTime,
    avgDuration: derived.videoFormatAvgViewDuration,
    avgPercentageViewed: derived.videoFormatAvgPercentageViewed,
   } : {}),
  })
 })
 return merged
}

const withSharedLinkShareColumn = (rows: Row[]): Row[] => {
 const totalShares = rows.reduce((sum, row) => sum + numberOrZero(firstValue(row.shares, row.metrics && asRecord(row.metrics).shares)), 0)
 return rows.map((row) => {
  const shares = numberOrZero(firstValue(row.shares, row.metrics && asRecord(row.metrics).shares))
  return {
   ...row,
   shareLinkShare: totalShares > 0 ? shares / totalShares * 100 : undefined,
  }
 })
}

const normalizeRows = (rows: Row[], identity: Record<string, string>): Row[] => rows.map((row) => ({
 ...row,
 ...metricBase(row),
 ...Object.fromEntries(Object.entries(identity).map(([target, source]) => [target, firstValue(row[target], row[source], row.term, row.source)])),
 cohort: firstValue(row.cohort, `${row.gender || ""} ${row.ageGroup || ""}`.trim(), row.ageGroup, row.gender),
 viewsPct: firstValue(row.viewsPct, row.viewerPercentage),
 watchTimePct: row.watchTimePct,
}))

const weekKey = (dateString: string) => {
 const date = new Date(`${dateString}T00:00:00`)
 if (Number.isNaN(date.getTime())) return dateString
 const first = new Date(date.getFullYear(), 0, 1)
 const week = Math.ceil((((date.getTime() - first.getTime()) / 86400000) + first.getDay() + 1) / 7)
 return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`
}

export const aggregateVtSyncTimeRows = (rows: Row[], mode: "weekly" | "monthly"): Row[] => {
 const buckets = new Map<string, Row[]>()
 rows.forEach((row) => {
  const date = String(firstValue(row.date, row.day, "") || "")
  const key = mode === "monthly" ? date.slice(0, 7) : weekKey(date)
  if (!key) return
  buckets.set(key, [...(buckets.get(key) || []), dailyBase(row)])
 })
 return Array.from(buckets.entries()).map(([key, bucket]) => {
  const out: Row = { date: key }
  if (mode === "weekly") {
   const dates = bucket.map((row) => String(row.date)).sort()
   out.dateRange = dates.length ? `${dates[0]} - ${dates[dates.length - 1]}` : key
  }
  const keys = new Set(bucket.flatMap((row) => Object.keys(row)))
  keys.forEach((field) => {
   if (["date", "dateRange"].includes(field)) return
   const values = bucket.map((row) => num(row[field])).filter((value): value is number => value !== undefined)
   if (!values.length) return
   if (["avgViewDuration", "averagePercentageViewed", "avgDuration", "avgPercentageViewed", "cpm", "playbackBasedCpm", "cardClickRate", "cardTeaserClickRate", "annotationClickThroughRate", "viewsPerPlaylistStart"].includes(field)) {
    out[field] = values.reduce((sum, value) => sum + value, 0) / values.length
   } else {
    out[field] = values.reduce((sum, value) => sum + value, 0)
   }
  })
  const views = num(out.views)
  const watchTimeHours = num(out.watchTime)
  const cardClicks = num(out.cardClicks)
  const cardImpressions = num(out.cardImpressions)
  const teaserClicks = num(out.cardTeaserClicks)
  const teaserImpressions = num(out.cardTeaserImpressions)
  const grossRevenue = num(out.grossRevenue)
  const adImpressions = num(out.adImpressions)
  const monetizedPlaybacks = num(out.monetizedPlaybacks)
  const weightedAverage = (field: string) => {
   const weighted = bucket.reduce<{ sum: number; weight: number }>((state, row) => {
    const value = num(row[field])
    const weight = num(row.views)
    return value === undefined || weight === undefined
     ? state
     : { sum: state.sum + value * weight, weight: state.weight + weight }
   }, { sum: 0, weight: 0 })
   return weighted.weight > 0 ? weighted.sum / weighted.weight : undefined
  }
  out.avgViewDuration = views !== undefined && views > 0 && watchTimeHours !== undefined
   ? (watchTimeHours * 3600) / views
   : weightedAverage("avgViewDuration")
  out.averagePercentageViewed = weightedAverage("averagePercentageViewed")
  out.cardClickRate = cardImpressions !== undefined && cardImpressions > 0 && cardClicks !== undefined
   ? (cardClicks / cardImpressions) * 100
   : weightedAverage("cardClickRate")
  out.cardTeaserClickRate = teaserImpressions !== undefined && teaserImpressions > 0 && teaserClicks !== undefined
   ? (teaserClicks / teaserImpressions) * 100
   : weightedAverage("cardTeaserClickRate")
  out.cpm = adImpressions !== undefined && adImpressions > 0 && grossRevenue !== undefined
   ? (grossRevenue / adImpressions) * 1000
   : weightedAverage("cpm")
  out.playbackBasedCpm = monetizedPlaybacks !== undefined && monetizedPlaybacks > 0 && grossRevenue !== undefined
   ? (grossRevenue / monetizedPlaybacks) * 1000
   : weightedAverage("playbackBasedCpm")
  return out
 })
}

const sourceRows = (
 snapshot: VtSyncSnapshot,
 table: VtSyncTableDefinition,
 privacyFilters: VtSyncPrivacyFilters,
): Row[] => {
 if (table.id === "videos") return videoRows(snapshot, privacyFilters)
 if (table.id === "channel_totals") return channelTotalRows(snapshot)
 if (table.id === "daily") return snapshot.dailyMetrics.map((row) => dailyBase(row as Row))
 if (table.id === "weekly") return aggregateVtSyncTimeRows(snapshot.dailyMetrics as Row[], "weekly")
 if (table.id === "demog_age" && snapshot.demographics.length) return snapshot.demographics as Row[]
 if (table.id === "demog_gender" && snapshot.demographics.length) return snapshot.demographics as Row[]
 const exportedRows = table.id === "traffic"
  ? snapshot.tableExports?.traffic || (
   snapshot.trafficSources.length === 0 ? snapshot.tableExports?.traffic_overview : undefined
  )
  : snapshot.tableExports?.[table.id] || snapshot.tableExports?.[table.exportName]
 if (Array.isArray(exportedRows) && exportedRows.length) return exportedRows as Row[]
 if (!table.snapshotKeys?.length) return []
 return table.snapshotKeys.flatMap((key) => {
  const rows = (snapshot as unknown as Record<string, unknown>)[key]
  return Array.isArray(rows) ? rows as Row[] : []
 })
}

export const normalizeVtSyncTableRows = (tableId: string, rows: Row[]): Row[] => {
 if (tableId.startsWith("traffic_detail_")) {
  const definition = getVtSyncTrafficDetailTable(tableId)
  if (!definition) return []
  return withTrafficShareColumns(normalizeTrafficRows(rows.filter((row) => String(row.sourceType || row.insightTrafficSourceType || "") === definition.sourceType), "detail").map((row) => ({
   ...row,
   sourceType: definition.sourceType,
   detail: firstValue(row.detail, row.insightTrafficSourceDetail, row.term),
   cover: definition.family === "channel" ? firstValue(row.thumbnail, row.avatarUrl) : row.thumbnail,
  })))
 }
 switch (tableId) {
  case "videos": return normalizeVtSyncVideoTableRows(rows)
  case "traffic": return withTrafficShareColumns(normalizeRows(rows, { source: "insightTrafficSourceType" }))
  case "traffic_details": return withTrafficShareColumns(normalizeTrafficRows(rows, "detail").map((row) => ({
   ...row,
   sourceType: firstValue(row.sourceType, row.insightTrafficSourceType, "Unknown"),
   detail: firstValue(row.detail, row.insightTrafficSourceDetail, row.term),
  })))
  case "search":
  case "ext_web":
  case "hashtags":
  case "sound":
  case "adv":
  case "traffic_subscribers":
  case "traffic_shorts":
  case "traffic_browse_features":
  case "traffic_shorts_content_link":
  case "traffic_campaign_card":
  case "traffic_notification":
  case "traffic_no_link_embedded":
  case "traffic_no_link_other":
  case "traffic_day":
  case "other_feat": return withTrafficShareColumns(normalizeTrafficRows(rows, "term"))
  case "suggested": return withTrafficShareColumns(normalizeTrafficRows(rows, "term", "suggested").map((row) => ({ ...row, cover: row.thumbnail })))
  case "chan_page": return withTrafficShareColumns(normalizeTrafficRows(rows, "term", "chan_page").map((row) => ({ ...row, cover: row.thumbnail || row.avatarUrl })))
  case "traffic_card":
  case "traffic_end_screen":
  case "traffic_live_redirect":
  case "traffic_playlist":
  case "traffic_yt_playlist_page": return withTrafficShareColumns(normalizeTrafficRows(rows, "term"))
  case "locations": return withTrafficShareColumns(normalizeRows(rows, { location: "insightPlaybackLocationType" }))
  case "subs": return normalizeRows(rows, { status: "subscribedStatus" })
  case "devices": return normalizeRows(rows, { device: "deviceType" })
  case "os": return normalizeRows(rows, { operatingSystem: "operatingSystem" })
  case "device_os": return normalizeRows(rows, { device: "deviceType", operatingSystem: "operatingSystem" })
  case "geography": return normalizeRows(rows, { country: "country" }).map(geographyCountryRow)
  case "cities": return normalizeRows(rows, { city: "city" }).map(geographyCountryRow)
  case "provinces": return normalizeRows(rows, { province: "province" }).map(geographyStateRow)
  case "dma": return normalizeRows(rows, { dma: "dma" }).map(geographyDmaRow)
  case "continents": return normalizeRows(rows, { region: "region" })
  case "demographics": return buildVtSyncDemographicOverviewRows(rows)
  case "demog_age": return rows.some((row) => row.ageGroup && row.gender || row.maleViewerPercentage !== undefined)
   ? deriveVtSyncDemographicsByAge(rows)
   : normalizeRows(rows, { cohort: "cohort" })
  case "demog_gender": return rows.some((row) => row.ageGroup && row.gender || row.maleViewerPercentage !== undefined)
   ? deriveVtSyncDemographicsByGender(rows)
   : normalizeRows(rows, { cohort: "cohort" })
  case "audience":
  case "new_returning": return normalizeRows(rows, { term: "audienceType" })
  case "formats_subscribers": return withFormatSubscriberChannelShareColumns(normalizeRows(rows, { status: "subscribedStatus" }).map((row) => {
   const contentTypeCode = firstValue(row.formatCode, row.contentTypeCode, row.term, row.creatorContentType)
   return {
    ...row,
    formatCode: contentTypeCode,
    term: getVtSyncContentTypeLabel(contentTypeCode),
    status: firstValue(row.status, row.subscribedStatus, "Unknown"),
    youtubePremiumViews: firstValue(row.youtubePremiumViews, row.redViews),
    youtubePremiumWatchTime: typeof row.youtubePremiumWatchTime === "number" ?
     row.youtubePremiumWatchTime
    : typeof row.estimatedRedMinutesWatched === "number" ?
     row.estimatedRedMinutesWatched / 60
    : row.youtubePremiumWatchTime,
   }
  }))
  case "creator": return withVtSyncFormatShareColumns(normalizeRows(rows, { term: "audienceType" }).map((row) => {
   const contentTypeCode = firstValue(row.contentTypeCode, row.term, row.creatorContentType)
   return { ...row, contentTypeCode, term: getVtSyncContentTypeLabel(contentTypeCode) }
  }))
  case "shares": return withSharedLinkShareColumn(normalizeRows(rows, { term: "sharingService" }))
  case "playlists": return withPlaylistShareColumns(rows)
  case "revenue": return rows.map((row) => ({ ...row, day: firstValue(row.day, row.date), revenue: firstValue(row.revenue, row.estimatedRevenue), adRevenue: firstValue(row.adRevenue, row.estimatedAdRevenue), redRevenue: firstValue(row.redRevenue, row.estimatedRedPartnerRevenue) }))
  default: return rows
 }
}

export const tableRows = (
 snapshot: VtSyncSnapshot,
 table: VtSyncTableDefinition,
 privacyFilters: VtSyncPrivacyFilters = readVtSyncPrivacyFilters(),
): Row[] => {
 const rows = normalizeVtSyncTableRows(table.id, sourceRows(snapshot, table, privacyFilters))
 if (table.id !== "creator") return rows
 const videoTotals = buildVtSyncVideoFormatTotals(videoRows(snapshot, privacyFilters))
 const mergedRows = mergeVtSyncVideoFormatTotals(rows, videoTotals, rows.length === 0)
 return rows.length ? mergedRows : withVtSyncFormatShareColumns(mergedRows)
}
