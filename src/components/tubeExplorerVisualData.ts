import type { CanonicalVideoRow } from "../services/analytics/DataStore"
import { resolveMetricNumber } from "../services/analytics/MetricRegistry"
import type { CsvDetectedCategory, CsvFileWithTag } from "../types"

export interface TubeExplorerVideoPoint {
 id: string
 videoId: string
 title: string
 uploadDate: string
 monthKey: string
 dayKey: string
 format: "shorts" | "long" | "live" | "story" | "unknown"
 durationSec: number
 views: number
 watchHours: number
 likes: number
 dislikes: number
 comments: number
 shares: number
 /** YouTube Playlist Saves, surfaced by Analytics as videosAddedToPlaylists. */
 saves: number
 subscribersGained: number
 subscribersLost: number
 subscribersNet: number
 revenue: number
 rpm: number
 cpm: number
 impressions: number
 ctr: number
 avdSeconds: number
 avp: number
 engagedViews: number
 redWatchHours: number
 engagementRate: number
 likeRate: number
 valueScore: number
 retentionScore: number
 keywordText: string
}

export interface TubeExplorerKeywordPoint {
 keyword: string
 views: number
 videos: number
 watchHours: number
 revenue: number
 engagement: number
 source: "title" | "csv"
}

export interface TubeExplorerTrafficPoint {
 sourceType: string
 sourceDetail: string
 sourceTitle: string
 views: number
 watchHours: number
 engagedViews: number
 avp: number
 impressions: number
 ctr: number
 rowCount: number
 sourceOrigin: "csv" | "cache"
}

export interface TubeExplorerGeoPoint {
 label: string
 regionType: "country" | "city" | "state" | "unknown"
 views: number
 watchHours: number
 engagedViews: number
 subscribersGained: number
 revenue: number
 rowCount: number
 sourceOrigin: "csv" | "cache"
}

export interface TubeExplorerMonthlyPoint {
 month: string
 videos: number
 views: number
 watchHours: number
 revenue: number
 subscribersGained: number
 engagement: number
 shorts: number
 long: number
}

export interface TubeExplorerVisualDataset {
 videos: TubeExplorerVideoPoint[]
 shorts: TubeExplorerVideoPoint[]
 longform: TubeExplorerVideoPoint[]
 keywords: TubeExplorerKeywordPoint[]
 traffic: TubeExplorerTrafficPoint[]
 geography: TubeExplorerGeoPoint[]
 monthly: TubeExplorerMonthlyPoint[]
 totals: {
 videos: number
 views: number
 watchHours: number
 revenue: number
 engagedViews: number
 subscribersGained: number
 likes: number
 comments: number
 shares: number
 impressions: number
 }
 coverage: {
 hasVideos: boolean
 hasTraffic: boolean
 hasGeography: boolean
 hasKeywords: boolean
 csvTrafficFiles: number
 csvGeoFiles: number
 }
}

const STOP_WORDS = new Set([
 "the", "and", "for", "with", "from", "this", "that", "you", "your", "are", "was", "were", "part", "pt", "into", "all", "how", "why", "what", "when", "where", "video", "videos", "short", "shorts", "full", "new",
])

const TRAFFIC_CATEGORIES = new Set<CsvDetectedCategory>([
 "traffic_report",
 "traffic_overview",
 "traffic_youtube_search",
 "traffic_external",
 "traffic_youtube_features",
 "traffic_suggested_videos",
 "traffic_shorts_feed",
 "youtube_search_terms",
 "suggested_videos_related",
 "external_sources",
 "shorts_content_links",
])

const GEO_CATEGORIES = new Set<CsvDetectedCategory>([
 "geography",
 "geography_country",
 "geography_city",
])

const SEARCH_CATEGORIES = new Set<CsvDetectedCategory>([
 "traffic_youtube_search",
 "youtube_search_terms",
])

const numeric = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return 0
 const cleaned = value.replace(/[$,%]/g, "").replace(/,/g, "").trim()
 if (!cleaned || cleaned === "-" || cleaned === "==") return 0
 const parsed = Number(cleaned)
 return Number.isFinite(parsed) ? parsed : 0
}

const pick = (row: Record<string, unknown>, aliases: string[]): unknown => {
 for (const alias of aliases) {
  if (row[alias] !== undefined) return row[alias]
 }
 const normalized = Object.fromEntries(
  Object.entries(row).map(([key, value]) => [normalizeKey(key), value]),
 )
 for (const alias of aliases) {
  const value = normalized[normalizeKey(alias)]
  if (value !== undefined) return value
 }
 return undefined
}

const normalizeKey = (value: string): string =>
 value
  .toLowerCase()
  .replace(/\ufeff/g, "")
  .replace(/[%()]/g, "")
  .replace(/[_-]/g, " ")
  .replace(/\s+/g, " ")
  .trim()

const metric = (row: CanonicalVideoRow, key: string): number =>
 resolveMetricNumber(row, key as any).value || 0

const playlistSaves = (row: CanonicalVideoRow): number => {
 const metricCell = (row.metrics as unknown as Record<string, { value?: unknown } | number | undefined>)
  .videosAddedToPlaylists
 if (typeof metricCell === "number") return metricCell
 if (metricCell && typeof metricCell === "object" && metricCell.value !== null && metricCell.value !== undefined) {
  return numeric(metricCell.value)
 }

 // Older imports and visual fixtures used the display-facing Playlist Saves
 // names before normalization. Keep them readable without changing exports or
 // the canonical YouTube Analytics metric key.
 const originalMetrics = row.originalData && typeof row.originalData.metrics === "object"
  ? row.originalData.metrics as Record<string, unknown>
  : {}
 return numeric(pick(
  {
   ...(row as unknown as Record<string, unknown>),
   ...(row.originalData || {}),
   ...originalMetrics,
   ...(row.supplementalData || {}),
  },
  ["videosAddedToPlaylists", "playlistSaves", "playlistSavesAdded", "Playlist Saves", "saves"],
 ))
}

const canonicalMetric = (row: Record<string, any>, key: string): number => {
 const raw = row.metrics?.[key]
 if (raw && typeof raw === "object" && "value" in raw) return numeric(raw.value)
 return numeric(raw)
}

const normalizePercent = (value: number): number => {
 if (!Number.isFinite(value) || value <= 0) return 0
 return value <= 1 ? value * 100 : value
}

const monthKey = (date: string): string => {
 const parsed = new Date(date)
 if (Number.isNaN(parsed.getTime())) return "Unknown"
 return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`
}

const dayKey = (date: string): string => {
 const parsed = new Date(date)
 if (Number.isNaN(parsed.getTime())) return "Unknown"
 return parsed.toLocaleDateString(undefined, { weekday: "short" })
}

const tokenizeTitle = (title: string): string[] =>
 title
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, " ")
  .split(/\s+/)
  .map((token) => token.trim())
  .filter((token) => token.length >= 3 && !STOP_WORDS.has(token))

const toVideoPoint = (row: CanonicalVideoRow): TubeExplorerVideoPoint => {
 const views = metric(row, "views")
 const watchHours = metric(row, "watchHours")
 const likes = metric(row, "likes")
 const comments = metric(row, "comments")
 const shares = metric(row, "shares")
 const engagedViews = metric(row, "engagedViews")
 const revenue = metric(row, "revenue")
 const impressions = metric(row, "impressions")
 const avp = normalizePercent(metric(row, "avp") || metric(row, "stw"))
 const ctr = normalizePercent(metric(row, "ctr"))
 const engagement = likes + comments + shares
 const durationSec = row.durationSeconds || 0
 return {
  id: row.id,
  videoId: row.videoId,
  title: row.title,
  uploadDate: row.uploadDate,
  monthKey: monthKey(row.uploadDate),
  dayKey: dayKey(row.uploadDate),
  format: row.format,
  durationSec,
  views,
  watchHours,
  likes,
  dislikes: metric(row, "dislikes"),
  comments,
  shares,
  saves: playlistSaves(row),
  subscribersGained: metric(row, "subscribersGained"),
  subscribersLost: metric(row, "subscribersLost"),
  subscribersNet: metric(row, "subscribersGained") - metric(row, "subscribersLost"),
  revenue,
  rpm: metric(row, "rpm"),
  cpm: metric(row, "cpm"),
  impressions,
  ctr,
  avdSeconds: metric(row, "avdSeconds"),
  avp,
  engagedViews,
  redWatchHours: metric(row, "redWatchHours"),
  engagementRate: views > 0 ? (engagement / views) * 100 : 0,
  likeRate: views > 0 ? (likes / views) * 100 : 0,
  valueScore: views + watchHours * 120 + revenue * 250 + engagedViews * 0.8,
  retentionScore: avp || (views > 0 ? (engagedViews / views) * 100 : 0),
  keywordText: tokenizeTitle(row.title).join(" "),
 }
}

const mergeTraffic = (
 map: Map<string, TubeExplorerTrafficPoint>,
 key: string,
 patch: Omit<TubeExplorerTrafficPoint, "rowCount">,
): void => {
 const existing = map.get(key)
 if (!existing) {
  map.set(key, { ...patch, rowCount: 1 })
  return
 }
 existing.views += patch.views
 existing.watchHours += patch.watchHours
 existing.engagedViews += patch.engagedViews
 existing.avp = Math.max(existing.avp, patch.avp)
 existing.impressions += patch.impressions
 existing.ctr = Math.max(existing.ctr, patch.ctr)
 existing.rowCount += 1
}

const buildTrafficRows = (csvFiles: CsvFileWithTag[]): TubeExplorerTrafficPoint[] => {
 const map = new Map<string, TubeExplorerTrafficPoint>()
 for (const file of csvFiles) {
  if (!file.detectedCategory || !TRAFFIC_CATEGORIES.has(file.detectedCategory)) continue
  for (const raw of file.data || []) {
   const row = raw as Record<string, unknown>
   const sourceType = String(pick(row, ["Traffic source", "Traffic source type", "Source", "source", "trafficSourceType"]) || file.detectedCategory)
   const sourceDetail = String(pick(row, ["Traffic source detail", "Source detail", "External source", "Search term", "Suggested video", "sourceDetail", "Keyword"]) || "")
   const sourceTitle = String(pick(row, ["Source title", "Title", "Video title", "Traffic source", "Source"]) || sourceDetail || sourceType)
   const views = numeric(pick(row, ["Views", "views"]))
   const watchHours = numeric(pick(row, ["Watch time (hours)", "Watch Hrs", "watchHours", "Watch time"]));
   const key = `${sourceType}::${sourceDetail || sourceTitle}`
   mergeTraffic(map, key, {
    sourceType,
    sourceDetail,
    sourceTitle,
    views,
    watchHours,
    engagedViews: numeric(pick(row, ["Engaged views", "engagedViews"])),
    avp: normalizePercent(numeric(pick(row, ["Average percentage viewed (%)", "AVP %", "Average percentage viewed", "avgPercentageViewed"]))),
    impressions: numeric(pick(row, ["Impressions", "impressions"])),
    ctr: normalizePercent(numeric(pick(row, ["Impressions click-through rate (%)", "CTR %", "ctr"])),
    ),
    sourceOrigin: "csv",
   })
  }
 }
 return [...map.values()].sort((a, b) => b.views - a.views)
}

const buildGeoRows = (csvFiles: CsvFileWithTag[]): TubeExplorerGeoPoint[] => {
 const map = new Map<string, TubeExplorerGeoPoint>()
 for (const file of csvFiles) {
  if (!file.detectedCategory || !GEO_CATEGORIES.has(file.detectedCategory)) continue
  const regionType = file.detectedCategory === "geography_city" ? "city" : "country"
  for (const raw of file.data || []) {
   const row = raw as Record<string, unknown>
   const label = String(pick(row, ["Country", "Geography", "City", "City name", "State", "Region", "country", "city"]) || "Unknown")
   const existing = map.get(label)
   const next = {
    label,
    regionType: regionType as TubeExplorerGeoPoint["regionType"],
    views: numeric(pick(row, ["Views", "views"])),
    watchHours: numeric(pick(row, ["Watch time (hours)", "Watch Hrs", "watchHours"])),
    engagedViews: numeric(pick(row, ["Engaged views", "engagedViews"])),
    subscribersGained: numeric(pick(row, ["Subscribers gained", "Subscribers +", "subscribersGained"])),
    revenue: numeric(pick(row, ["Estimated revenue (USD)", "Revenue", "revenue"])),
    rowCount: 1,
    sourceOrigin: "csv" as const,
   }
   if (!existing) map.set(label, next)
   else {
    existing.views += next.views
    existing.watchHours += next.watchHours
    existing.engagedViews += next.engagedViews
    existing.subscribersGained += next.subscribersGained
    existing.revenue += next.revenue
    existing.rowCount += 1
   }
  }
 }
 return [...map.values()].sort((a, b) => b.views - a.views)
}

const buildKeywords = (
 videos: TubeExplorerVideoPoint[],
 csvFiles: CsvFileWithTag[],
): TubeExplorerKeywordPoint[] => {
 const map = new Map<string, TubeExplorerKeywordPoint>()
 for (const video of videos) {
  for (const keyword of tokenizeTitle(video.title)) {
   const existing = map.get(keyword) || {
    keyword,
    views: 0,
    videos: 0,
    watchHours: 0,
    revenue: 0,
    engagement: 0,
    source: "title" as const,
   }
   existing.views += video.views
   existing.videos += 1
   existing.watchHours += video.watchHours
   existing.revenue += video.revenue
   existing.engagement += video.likes + video.comments + video.shares
   map.set(keyword, existing)
  }
 }
 for (const file of csvFiles) {
  if (!file.detectedCategory || !SEARCH_CATEGORIES.has(file.detectedCategory)) continue
  for (const raw of file.data || []) {
   const row = raw as Record<string, unknown>
   const keyword = String(pick(row, ["Search term", "Keyword", "Traffic source detail", "query"]) || "").trim().toLowerCase()
   if (!keyword) continue
   const existing = map.get(keyword) || {
    keyword,
    views: 0,
    videos: 0,
    watchHours: 0,
    revenue: 0,
    engagement: 0,
    source: "csv" as const,
   }
   existing.views += numeric(pick(row, ["Views", "views"]))
   existing.watchHours += numeric(pick(row, ["Watch time (hours)", "Watch Hrs", "watchHours"]))
   existing.engagement += numeric(pick(row, ["Engaged views", "engagedViews"]))
   existing.videos += 1
   existing.source = existing.source === "title" ? "title" : "csv"
   map.set(keyword, existing)
  }
 }
 return [...map.values()]
  .filter((item) => item.views > 0 || item.videos > 1)
  .sort((a, b) => b.views - a.views)
  .slice(0, 80)
}

const buildMonthly = (videos: TubeExplorerVideoPoint[]): TubeExplorerMonthlyPoint[] => {
 const map = new Map<string, TubeExplorerMonthlyPoint>()
 for (const video of videos) {
  const existing = map.get(video.monthKey) || {
   month: video.monthKey,
   videos: 0,
   views: 0,
   watchHours: 0,
   revenue: 0,
   subscribersGained: 0,
   engagement: 0,
   shorts: 0,
   long: 0,
  }
  existing.videos += 1
  existing.views += video.views
  existing.watchHours += video.watchHours
  existing.revenue += video.revenue
  existing.subscribersGained += video.subscribersGained
  existing.engagement += video.likes + video.comments + video.shares
  if (video.format === "shorts") existing.shorts += 1
  if (video.format === "long") existing.long += 1
  map.set(video.monthKey, existing)
 }
 return [...map.values()].sort((a, b) => a.month.localeCompare(b.month))
}

export const buildTubeExplorerVisualData = (
 rows: CanonicalVideoRow[],
 csvFiles: CsvFileWithTag[] = [],
 trafficRows: any[] = [],
 geographyRows: any[] = []
): TubeExplorerVisualDataset => {
 const videos = rows.map(toVideoPoint)
 const trafficMap = new Map<string, TubeExplorerTrafficPoint>()
 const traffic = buildTrafficRows(csvFiles)
 for (const r of traffic) {
   trafficMap.set(r.sourceType + "::" + (r.sourceDetail || r.sourceTitle), r)
 }
 for (const r of trafficRows) {
   const st = String(r.trafficSourceType || "Unknown")
   const sd = String(r.trafficSourceDetail || "")
   const key = st + "::" + sd
   const existing = trafficMap.get(key)
   if (existing) {
     existing.views += canonicalMetric(r, "views")
     existing.watchHours += canonicalMetric(r, "watchHours")
     existing.engagedViews += canonicalMetric(r, "engagedViews")
     existing.impressions += canonicalMetric(r, "impressions")
     existing.avp = Math.max(existing.avp, normalizePercent(canonicalMetric(r, "averagePercentageViewed")))
     existing.ctr = Math.max(existing.ctr, normalizePercent(canonicalMetric(r, "ctr")))
   } else {
     trafficMap.set(key, {
       sourceType: st,
       sourceDetail: sd,
       sourceTitle: String(r.sourceTitle || r.sourceLabel || sd || st),
       views: canonicalMetric(r, "views"),
       watchHours: canonicalMetric(r, "watchHours"),
       engagedViews: canonicalMetric(r, "engagedViews"),
       avp: normalizePercent(canonicalMetric(r, "averagePercentageViewed")),
       impressions: canonicalMetric(r, "impressions"),
       ctr: normalizePercent(canonicalMetric(r, "ctr")),
       rowCount: 1, sourceOrigin: "cache"
     })
   }
 }
 const finalTraffic = [...trafficMap.values()].sort((a,b) => b.views - a.views)

 const geoMap = new Map<string, TubeExplorerGeoPoint>()
 const geography = buildGeoRows(csvFiles)
 for (const r of geography) {
   geoMap.set(r.label, r)
 }
 for (const r of geographyRows) {
   const label = String(r.geographyLabel || r.city || r.province || r.country || r.geography || "Unknown")
   const existing = geoMap.get(label)
   if (existing) {
     existing.views += canonicalMetric(r, "views")
     existing.watchHours += canonicalMetric(r, "watchHours")
     existing.engagedViews += canonicalMetric(r, "engagedViews")
     existing.subscribersGained += canonicalMetric(r, "subscribersGained")
     existing.revenue += canonicalMetric(r, "revenue")
   } else {
     geoMap.set(label, {
       label,
       regionType: r.geographyType === "city" || r.city ? "city" : r.geographyType === "province" || r.geographyType === "dma" || r.province ? "state" : "country",
       views: canonicalMetric(r, "views"),
       watchHours: canonicalMetric(r, "watchHours"),
       engagedViews: canonicalMetric(r, "engagedViews"),
       subscribersGained: canonicalMetric(r, "subscribersGained"),
       revenue: canonicalMetric(r, "revenue"),
       rowCount: 1, sourceOrigin: "cache"
     })
   }
 }
 const finalGeography = [...geoMap.values()].sort((a,b) => b.views - a.views)
 const keywords = buildKeywords(videos, csvFiles)
 const monthly = buildMonthly(videos)
 const totals = videos.reduce(
  (acc, video) => {
   acc.videos += 1
   acc.views += video.views
   acc.watchHours += video.watchHours
   acc.revenue += video.revenue
   acc.engagedViews += video.engagedViews
   acc.subscribersGained += video.subscribersGained
   acc.likes += video.likes
   acc.comments += video.comments
   acc.shares += video.shares
   acc.impressions += video.impressions
   return acc
  },
  {
   videos: 0,
   views: 0,
   watchHours: 0,
   revenue: 0,
   engagedViews: 0,
   subscribersGained: 0,
   likes: 0,
   comments: 0,
   shares: 0,
   impressions: 0,
  },
 )
 return {
  videos,
  shorts: videos.filter((video) => video.format === "shorts"),
  longform: videos.filter((video) => video.format === "long"),
  keywords,
  traffic: finalTraffic,
  geography: finalGeography,
  monthly,
  totals,
  coverage: {
   hasVideos: videos.length > 0,
   hasTraffic: finalTraffic.length > 0,
   hasGeography: finalGeography.length > 0,
   hasKeywords: keywords.length > 0,
   csvTrafficFiles: csvFiles.filter((file) => file.detectedCategory && TRAFFIC_CATEGORIES.has(file.detectedCategory)).length,
   csvGeoFiles: csvFiles.filter((file) => file.detectedCategory && GEO_CATEGORIES.has(file.detectedCategory)).length,
  },
 }
}
