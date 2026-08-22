import {
 readYouTubeAnalyticsCache,
 writeYouTubeAnalyticsCache,
 type RawAnalyticsCache,
} from "../analytics/DataStore"
import {
 listCanonicalAudienceSplits,
 listCanonicalChannelRecords,
 listCanonicalChannelDailyRows,
 listCanonicalGeographyRows,
 listCanonicalSyncRuns,
 listCanonicalTrafficRows,
 listCanonicalVideoRecords,
 listChannelWindowSummaries,
} from "./storage"
import { selectRowsForWindow } from "./windowing"
import type {
 AnalyticsWindow,
 CanonicalAudienceSplitRow,
 CanonicalChannelDailyRow,
 CanonicalGeographyRow,
 CanonicalTrafficRow,
 ChannelWindowSummary,
} from "./contracts"

const VIDEO_DETAILS_CACHE_KEY = "vt_video_details_cache_v2"
const VIDEO_CATEGORY_TAXONOMY_KEY = "vt_video_category_taxonomy_us"
const VIDEO_DETAILS_CACHE_LIMIT = 200
const WINDOW_ORDER: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d", "7d"]

const sortRunsNewestFirst = <T extends { startedAt: string }>(runs: T[]): T[] =>
 runs.slice().sort((left, right) => right.startedAt.localeCompare(left.startedAt))

type AnalyticsReport = {
 columnHeaders: Array<{ name: string }>
 rows: unknown[][]
}

const getNumber = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return 0
 const parsed = Number(value.replace(/,/g, "").replace(/%/g, "").trim())
 return Number.isFinite(parsed) ? parsed : 0
}

const getOptionalNumber = (value: unknown): number | null => {
 if (value === null || value === undefined || value === "") return null
 const parsed = typeof value === "number"
  ? value
  : Number(String(value).replace(/,/g, "").replace(/%/g, "").trim())
 return Number.isFinite(parsed) ? parsed : null
}

const formatTrafficSourceNickname = (value: string): string => {
 const normalized = String(value || "").trim().toUpperCase()
 switch (normalized) {
  case "YT_SEARCH":
   return "YouTube Search"
  case "EXT_URL":
   return "External Websites"
  case "RELATED_VIDEO":
  case "YT_RELATED":
   return "Suggested Videos"
  case "YT_CHANNEL":
   return "Channel Pages"
  case "PLAYLIST":
   return "Playlists"
  case "NOTIFICATION":
   return "Notifications"
  case "END_SCREEN":
   return "End Screens"
  case "ANNOTATION":
  case "CAMPAIGN_CARD":
   return "Cards & Annotations"
  case "HASHTAGS":
   return "Hashtags"
  case "SOUND_PAGE":
   return "Sound Pages"
  case "SHORTS_CONTENT_LINKS":
  case "RELATED_SHORTS":
   return "Shorts Content Links"
  case "ADVERTISING":
   return "Advertising"
  case "BROWSE":
  case "SUBSCRIBER":
   return "Browse Features"
  default:
   return normalized || "Unknown"
 }
}

const toReport = (
 rows: Array<Record<string, unknown>>,
 preferredHeaders: string[],
): AnalyticsReport => {
 const discovered = Array.from(
  new Set(
   rows.flatMap((row) => Object.keys(row)).filter((key) => !key.startsWith("__")),
  ),
 )
 const headers = [
  ...preferredHeaders.filter((header) => discovered.includes(header)),
  ...discovered.filter((header) => !preferredHeaders.includes(header)),
 ]
 return {
  columnHeaders: headers.map((name) => ({ name })),
  rows: rows.map((row) => headers.map((header) => row[header] ?? "")),
 }
}

const buildDailyReportRows = (
 rows: CanonicalChannelDailyRow[],
): Array<Record<string, unknown>> =>
 rows
  .slice()
  .sort((left, right) => left.date.localeCompare(right.date))
  .map((row) => ({
   Date: row.date,
   Day: row.date,
   Views: getOptionalNumber(row.metrics?.views),
   Likes: getOptionalNumber(row.metrics?.likes),
   Comments: getOptionalNumber(row.metrics?.comments),
   Shares: getOptionalNumber(row.metrics?.shares),
   "Watch time (hours)": getOptionalNumber(row.metrics?.watchHours),
   "Watch Hrs": getOptionalNumber(row.metrics?.watchHours),
   "Subscribers gained": getOptionalNumber(row.metrics?.subscribersGained),
   "Subscribers lost": getOptionalNumber(row.metrics?.subscribersLost),
   Impressions: getOptionalNumber(row.metrics?.impressions),
   "Impressions click-through rate (%)": getOptionalNumber(row.metrics?.ctr),
   "Estimated revenue (USD)": getOptionalNumber(row.metrics?.revenue),
   "CPM (USD)": getOptionalNumber(row.metrics?.cpm),
  }))

const buildWindowBundleReport = (
 summaries: ChannelWindowSummary[],
 window: AnalyticsWindow,
): AnalyticsReport | null => {
 const summary = summaries.find((entry) => entry.window === window && (entry.period || "current") === "current")
 if (!summary) return null
 return toReport(
  [
   {
    Window: window,
    Views: getOptionalNumber(summary.metrics?.views),
    "Watch time (hours)": getOptionalNumber(summary.metrics?.watchHours),
    "Subscribers gained": getOptionalNumber(summary.metrics?.subscribersGained),
    Impressions: getOptionalNumber(summary.metrics?.impressions),
    "Impressions click-through rate (%)": getOptionalNumber(summary.metrics?.ctr),
    "Estimated revenue (USD)": getOptionalNumber(summary.metrics?.revenue),
    "CPM (USD)": getOptionalNumber(summary.metrics?.cpm),
   },
  ],
  [
   "Window",
   "Views",
   "Watch time (hours)",
   "Subscribers gained",
   "Impressions",
   "Impressions click-through rate (%)",
   "Estimated revenue (USD)",
   "CPM (USD)",
  ],
 )
}

const buildTrafficDisplayTitle = (row: CanonicalTrafficRow): string => {
 const title = String(row.resolvedEntityTitle || row.sourceTitle || "").trim()
 const detail = String(
  row.trafficSourceDetail || row.sourceVideoId || row.resolvedEntityId || "",
 ).trim()
 if (title && detail && detail !== title) return `${title} · ${detail}`
 return title || detail || formatTrafficSourceNickname(row.sourceLabel || row.trafficSourceType || "")
}

const buildTrafficReportRows = (
 rows: CanonicalTrafficRow[],
): Array<Record<string, unknown>> => {
 const grouped = new Map<string, Record<string, unknown>>()
 rows
  .filter((row) => row.entityType === "channel")
  .forEach((row) => {
   const trafficSource = formatTrafficSourceNickname(
    row.sourceLabel || row.trafficSourceType || "",
   )
   const sourceTitle = buildTrafficDisplayTitle(row)
   const key = [
    String(row.date || ""),
    trafficSource,
    String(row.trafficSourceType || ""),
    sourceTitle,
   ].join("::")
   const current = grouped.get(key) || {
    Date: row.date || "",
    "Traffic source": trafficSource,
    "Source type": row.trafficSourceType || "",
    "Source title": sourceTitle,
    Views: 0,
    "Watch time (hours)": 0,
    "Engaged views": 0,
    "Average percentage viewed (%)": 0,
    Impressions: 0,
    "Impressions click-through rate (%)": 0,
   }
   current.Views = getNumber(current.Views) + getNumber(row.metrics?.views)
   current["Watch time (hours)"] =
    getNumber(current["Watch time (hours)"]) + getNumber(row.metrics?.watchHours)
   current["Engaged views"] =
    getNumber(current["Engaged views"]) + getNumber(row.metrics?.engagedViews)
   current["Average percentage viewed (%)"] = Math.max(
    getNumber(current["Average percentage viewed (%)"]),
    getNumber(row.metrics?.averagePercentageViewed),
   )
   current.Impressions =
    getNumber(current.Impressions) + getNumber(row.metrics?.impressions)
   grouped.set(key, current)
  })

 return Array.from(grouped.values())
  .map((row: Record<string, unknown>): Record<string, unknown> => {
   const views = getNumber(row.Views)
   const impressions = getNumber(row.Impressions)
   return {
    ...row,
    "Impressions click-through rate (%)":
     impressions > 0
      ? (views / impressions) * 100
      : getNumber(row["Impressions click-through rate (%)"]),
   }
  })
  .sort((left, right) => getNumber(right.Views) - getNumber(left.Views))
}

const splitDemographicKey = (
 splitKey: string,
): { ageGroup: string; gender: string } => {
 const parts = splitKey.split("_")
 if (parts.length <= 1) return { ageGroup: splitKey || "Unknown", gender: "Unknown" }
 return {
  ageGroup: parts.slice(0, -1).join("_") || "Unknown",
  gender: parts[parts.length - 1] || "Unknown",
 }
}

const buildDemographicReportRows = (
 rows: CanonicalAudienceSplitRow[],
): Array<Record<string, unknown>> =>
 rows
  .filter((row) => row.entityType === "channel" && row.splitDimension === "demographic")
  .map((row) => {
   const { ageGroup, gender } = splitDemographicKey(row.splitKey)
   return {
    "Viewer age": ageGroup,
    "Viewer gender": gender,
    "Viewer percentage (%)": getNumber(row.metrics?.viewerPercentage),
    Views: getNumber(row.metrics?.views),
    "Watch time (hours)": getNumber(row.metrics?.estimatedMinutesWatched) / 60,
   }
  })
  .sort(
   (left, right) =>
    getNumber(right["Viewer percentage (%)"]) -
    getNumber(left["Viewer percentage (%)"]),
  )

const buildGeographyReportRows = (
 rows: CanonicalGeographyRow[],
): Array<Record<string, unknown>> =>
 rows
  .filter((row) => row.entityType === "channel" && !!row.country)
  .map((row) => ({
   Country: row.country,
   Geography: row.country,
   City: row.city || "",
   Province: row.province || "",
   Views: getNumber(row.metrics?.views),
   "Watch time (hours)": getNumber(row.metrics?.estimatedMinutesWatched) / 60,
   "Average view duration": getNumber(row.metrics?.averageViewDuration),
   "Average percentage viewed (%)": getNumber(row.metrics?.averageViewPercentage),
   "Estimated revenue (USD)": getNumber(row.metrics?.revenue),
  }))
  .sort((left, right) => getNumber(right.Views) - getNumber(left.Views))

const projectChannelProfile = (
 channel: Awaited<ReturnType<typeof listCanonicalChannelRecords>>[number],
) => ({
 id: channel.channelId,
 channelId: channel.channelId,
 title: channel.title,
 customUrl: channel.handle || "",
 thumbnail:
  channel.thumbnails.maxres?.url ||
  channel.thumbnails.medium?.url ||
  "",
 statistics: {
  subscriberCount: channel.currentSubscribers,
  viewCount: channel.publicViewCount,
  videoCount: channel.publicVideoCount,
 },
 syncedAt: channel.syncedAt,
})

const writeVideoCaches = (
 videos: Awaited<ReturnType<typeof listCanonicalVideoRecords>>,
): void => {
 const detailsCache: Record<string, Record<string, unknown>> = {}
 const categoryTaxonomy = Object.fromEntries(
  videos
   .filter((video) => video.categoryId && video.categoryName)
   .map((video) => [String(video.categoryId), String(video.categoryName)]),
 )
 videos
  .slice()
  .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
  .slice(0, VIDEO_DETAILS_CACHE_LIMIT)
  .forEach((video) => {
  detailsCache[video.videoId] = {
   title: video.title,
   thumbnail: video.thumbnail,
   description: video.description,
   tags: video.tags,
   categoryId: video.categoryId || "",
   categoryName: video.categoryName || "",
   defaultLanguage: video.defaultLanguage || "",
   defaultAudioLanguage: video.defaultLanguage || "",
   authScopeUsed: "channel_owner",
   fetchedAt: Date.now(),
  }
  })
 localStorage.setItem(VIDEO_DETAILS_CACHE_KEY, JSON.stringify(detailsCache))
 localStorage.setItem(VIDEO_CATEGORY_TAXONOMY_KEY, JSON.stringify(categoryTaxonomy))
}

export const syncLegacyAnalyticsCacheFromCanonical = async (
 channelId?: string,
): Promise<RawAnalyticsCache | null> => {
 const [
  channels,
  videos,
  runs,
  channelDailyRows,
  trafficRows,
  geographyRows,
  audienceSplits,
 ] = await Promise.all([
  listCanonicalChannelRecords(),
  listCanonicalVideoRecords(channelId),
  listCanonicalSyncRuns(),
  listCanonicalChannelDailyRows(channelId),
  listCanonicalTrafficRows(channelId, "channel"),
  listCanonicalGeographyRows(channelId, "channel"),
  listCanonicalAudienceSplits(channelId, "channel"),
 ])
 const channel =
  (channelId
   ? channels.find((entry) => entry.channelId === channelId)
   : channels[0]) || null
 if (!channel) return null

 const windows = await listChannelWindowSummaries(channel.channelId)
 const nextCache = readYouTubeAnalyticsCache()
 const lastRun = sortRunsNewestFirst(runs)[0]
 const projectedVideos = videos.map((video) => ({
  videoId: video.videoId,
  title: video.title,
  description: video.description,
  publishedAt: video.publishedAt,
  uploadDate: video.publishedAt,
  thumbnail: video.thumbnail,
  thumbnailUrl: video.thumbnail,
  tags: video.tags,
  categoryId: video.categoryId || "",
  categoryName: video.categoryName || "",
  defaultLanguage: video.defaultLanguage || "",
  privacyStatus: video.privacyStatus || "",
  uploadStatus: video.uploadStatus || "",
  definition: video.definition || "",
  dimension: video.dimension || "",
  durationSeconds: video.durationSeconds,
  creatorContentType: video.creatorContentType || "",
  contentType: video.creatorContentType || "",
  format: video.format,
  isShort: video.isShort,
  metricsByWindow: video.metricsByWindow,
  metricMetaByWindow: video.metricMetaByWindow,
  syncedAt: video.syncedAt,
 }))
 const videoContentType = Object.fromEntries(
  projectedVideos
   .filter((video) => String(video.creatorContentType || "").trim().length > 0)
   .map((video) => [video.videoId, String(video.creatorContentType).toLowerCase()]),
 )
 const videoCategoryTaxonomy = Object.fromEntries(
  projectedVideos
   .filter((video) => video.categoryId && video.categoryName)
   .map((video) => [String(video.categoryId), String(video.categoryName)]),
 )
 const lifetime = windows.find((window) => window.window === "lifetime") || null
 const canonicalLastSyncedAt =
  lastRun?.completedAt || lastRun?.startedAt || new Date().toISOString()
 const dailyReportRows = buildDailyReportRows(channelDailyRows)
 const dailyMetrics = toReport(dailyReportRows, [
  "Date",
  "Day",
  "Views",
  "Likes",
  "Comments",
  "Shares",
  "Watch time (hours)",
  "Subscribers gained",
  "Subscribers lost",
  "Impressions",
  "Impressions click-through rate (%)",
  "Estimated revenue (USD)",
  "CPM (USD)",
 ])
 const trafficSelection = selectRowsForWindow(trafficRows, "lifetime")
 const geographySelection = selectRowsForWindow(geographyRows, "lifetime")
 const audienceSelection = selectRowsForWindow(audienceSplits, "28d")
 const trafficSources = toReport(buildTrafficReportRows(trafficSelection.rows), [
  "Date",
  "Traffic source",
  "Source type",
  "Source title",
  "Views",
  "Watch time (hours)",
  "Engaged views",
  "Average percentage viewed (%)",
  "Impressions",
  "Impressions click-through rate (%)",
 ])
 const geographyReport = toReport(buildGeographyReportRows(geographySelection.rows), [
  "Country",
  "Geography",
  "City",
  "Province",
  "Views",
  "Watch time (hours)",
  "Average view duration",
  "Average percentage viewed (%)",
  "Estimated revenue (USD)",
 ])
 const demographicsReport = toReport(
  buildDemographicReportRows(audienceSelection.rows),
  [
   "Viewer age",
   "Viewer gender",
   "Viewer percentage (%)",
   "Views",
   "Watch time (hours)",
  ],
 )
 const analyticsByWindow = Object.fromEntries(
  WINDOW_ORDER.map((window) => {
   const report = buildWindowBundleReport(windows, window)
   return [
    window,
    report
     ? {
        startDate: "",
        endDate: "",
        fetchedAt: Date.parse(canonicalLastSyncedAt),
        report,
       }
     : undefined,
   ]
  }).filter(([, value]) => Boolean(value)),
 )
 const lastSyncedByWindow = Object.fromEntries(
  windows.filter((window) => (window.period || "current") === "current").map((window) => [
   window.window,
   Date.parse(window.syncedAt || canonicalLastSyncedAt),
  ]),
 )

 const mergedCache: RawAnalyticsCache = {
  ...nextCache,
  profile: projectChannelProfile(channel),
  channelBaseline: {
   channelId: channel.channelId,
   title: channel.title,
   handle: channel.handle || "",
   thumbnail:
    channel.thumbnails.maxres?.url ||
    channel.thumbnails.medium?.url ||
    "",
   currentSubscribers: channel.currentSubscribers,
   publicViewCount: channel.publicViewCount,
   publicVideoCount: channel.publicVideoCount,
   syncedAt: channel.syncedAt,
  },
  channelLifetimeSummary: lifetime
   ? {
      channelId: channel.channelId,
      currentSubscribers: channel.currentSubscribers,
      lifetimeViews: lifetime.metrics.views || channel.publicViewCount || 0,
  lifetimeWatchMinutes:
   lifetime.metrics.watchMinutes ??
   (lifetime.metrics.watchHours == null ? 0 : lifetime.metrics.watchHours * 60),
  lifetimeRevenue: lifetime.metrics.revenue ?? 0,
      publicVideoCount: channel.publicVideoCount,
      syncedAt: lifetime.syncedAt,
     }
   : nextCache.channelLifetimeSummary,
  videos: projectedVideos,
  dailyMetrics,
  trafficSources,
  geography: geographyReport,
  demographics: demographicsReport,
  analyticsByWindow: {
   ...(nextCache.analyticsByWindow || {}),
   ...analyticsByWindow,
  },
  lastSyncedByWindow: {
   ...(nextCache.lastSyncedByWindow || {}),
   ...lastSyncedByWindow,
  },
  videoCategoryTaxonomy,
  videoContentType,
  videoContentTypeStatus: {
   status: Object.keys(videoContentType).length > 0 ? "available" : "quarantined",
   requestClass: "channel_creator_content_type",
   idsTried: [channel.channelId, "canonical_bridge"],
   disabledForSession: false,
   rowCount: Object.keys(videoContentType).length,
   fetchedAt: Date.now(),
   reason:
    Object.keys(videoContentType).length > 0
     ? undefined
     : "Canonical bridge found no creatorContentType rows yet.",
  },
  lastSynced: Date.parse(canonicalLastSyncedAt),
  syncRunSummary: lastRun
  ? {
      ...(nextCache.syncRunSummary || {}),
      runAt: lastRun.completedAt || lastRun.startedAt,
      videoCount: projectedVideos.length,
      statsCount: projectedVideos.length,
      cacheBytesBefore: 0,
      cacheBytesAfter: 0,
      dataApiCallCounts:
       nextCache.syncRunSummary?.dataApiCallCounts || { source: "canonical_bridge" },
     }
   : nextCache.syncRunSummary,
 }

 try {
  localStorage.setItem("yt_analytics_last_sync", canonicalLastSyncedAt)
 } catch {
  // ignore storage failures
 }
 writeYouTubeAnalyticsCache(mergedCache)
 writeVideoCaches(videos)
 return mergedCache
}
