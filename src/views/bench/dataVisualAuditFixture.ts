import type { CanonicalVideoRow, MetricCell } from "../../services/analytics/DataStore"

/**
 * Deterministic fixture data for the Data Visual mobile audit bench.
 *
 * Every value is derived from a seeded generator and a fixed anchor date, so a
 * screenshot diff between two runs only ever reflects a layout or rendering
 * change — never new data. Nothing here touches the network, the VT-Sync
 * snapshot or `Date.now()`.
 */

const DAY_MS = 86_400_000

/**
 * Fixture time is anchored to the start of the current UTC day rather than a
 * hardcoded date, so the windowed visuals (which compare against the real
 * clock) always receive data inside their selected window. The audit harness
 * pins the browser clock with `clock.setFixedTime`, which makes the anchor —
 * and therefore every screenshot — reproducible across runs.
 */
const ANCHOR = Math.floor(Date.now() / DAY_MS) * DAY_MS

/** Mulberry32: tiny, stable, and identical across Node and the browser. */
const seeded = (seed: number) => {
 let state = seed >>> 0
 return () => {
  state = (state + 0x6d2b79f5) >>> 0
  let t = Math.imul(state ^ (state >>> 15), 1 | state)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
 }
}

const cell = (value: number): MetricCell => ({
 value,
 status: "actual",
 source: "api",
 availability: "available",
 confidence: "raw_direct",
})

const KEYWORDS = [
 "battle", "history", "archive", "documentary", "restored", "footage",
 "campaign", "frontier", "expedition", "chronicle", "dispatch", "legacy",
]

export const DATA_VISUAL_AUDIT_VIDEO_COUNT = 96

export const buildAuditVideoRows = (count = DATA_VISUAL_AUDIT_VIDEO_COUNT): CanonicalVideoRow[] => {
 const random = seeded(20260630)
 return Array.from({ length: count }, (_, index) => {
  const isShort = index % 3 === 0
  // Spread uploads across days *and* hours so the publish clock has a real
  // day x hour distribution instead of a single column.
  const publishedAt = new Date(ANCHOR - (count - index) * DAY_MS * 3 + (index % 24) * 3_600_000)
  const views = Math.round(1_200 + random() * 48_000 * (isShort ? 1.6 : 1))
  const avp = 18 + random() * 62
  const durationSeconds = isShort ? 20 + Math.round(random() * 40) : 240 + Math.round(random() * 900)
  const likes = Math.round(views * (0.01 + random() * 0.05))
  const comments = Math.round(views * (0.001 + random() * 0.006))
  const shares = Math.round(views * (0.0008 + random() * 0.004))
  const revenue = Number((views * (0.0008 + random() * 0.004)).toFixed(2))
  const watchHours = Number(((views * durationSeconds * (avp / 100)) / 3600).toFixed(2))
  const keyword = KEYWORDS[index % KEYWORDS.length]
  const secondKeyword = KEYWORDS[(index * 5 + 3) % KEYWORDS.length]

  return {
   id: `audit-${index}`,
   videoId: `audit-${index}`,
   title: `${keyword} ${secondKeyword} ${String(index + 1).padStart(3, "0")}`,
   uploadDate: publishedAt.toISOString(),
   format: isShort ? "shorts" : "long",
   durationSeconds,
   sourceMode: "api",
   metrics: {
    views: cell(views),
    watchHours: cell(watchHours),
    likes: cell(likes),
    comments: cell(comments),
    shares: cell(shares),
    saves: cell(Math.round(likes * 0.2)),
    subscribersGained: cell(Math.round(views * (0.001 + random() * 0.004))),
    impressions: cell(Math.round(views * (3 + random() * 6))),
    revenue: cell(revenue),
    rpm: cell(Number(((revenue / Math.max(1, views)) * 1000).toFixed(2))),
    ctr: cell(Number((2 + random() * 9).toFixed(2))),
    avp: cell(Number(avp.toFixed(2))),
    avdSeconds: cell(Number((durationSeconds * (avp / 100)).toFixed(1))),
    engagedViews: cell(Math.round(views * (0.3 + random() * 0.4))),
   } as CanonicalVideoRow["metrics"],
  } satisfies CanonicalVideoRow
 })
}

/**
 * Detail labels deliberately avoid repeating their parent source name: the
 * Clock Burst drilldown drops any detail row whose label contains the parent
 * label, so "YouTube search detail 1" would silently produce an empty
 * drilldown and hide the second radial plot from the audit.
 */
const TRAFFIC_SOURCES = [
 { sourceType: "YT_SEARCH", sourceTitle: "YouTube search", details: ["restored archive", "1805 campaign", "northbridge", "expedition log"] },
 { sourceType: "RELATED_VIDEO", sourceTitle: "Suggested videos", details: ["frontier chronicle", "dispatch reel", "legacy cut", "field footage"] },
 { sourceType: "SHORTS_FEED", sourceTitle: "Shorts feed", details: ["quick cut", "cold open", "map flyover", "closing line"] },
 { sourceType: "EXT_URL", sourceTitle: "External", details: ["history forum", "newsletter", "partner blog", "wiki citation"] },
 { sourceType: "PLAYLIST", sourceTitle: "Playlists", details: ["campaign order", "by decade", "restorations", "long reads"] },
 { sourceType: "YT_CHANNEL", sourceTitle: "Channel pages", details: ["home tab", "videos tab", "community", "about"] },
 { sourceType: "NOTIFICATION", sourceTitle: "Notifications", details: ["bell alert", "subscription", "premiere", "reminder"] },
 { sourceType: "BROWSE", sourceTitle: "Browse features", details: ["home ranking", "explore", "trending", "topic row"] },
]

/**
 * Traffic rows in the shape `buildTubeExplorerVisualData` consumes:
 * `trafficSourceType` / `trafficSourceDetail` / `datasetKind` plus canonical
 * metric cells. Both the summary (overview) and detail tiers are supplied so
 * the Clock Burst drilldown has something to drill into.
 */
export const buildAuditTrafficRows = () => {
 const random = seeded(772_026)
 const trafficRow = (
  source: (typeof TRAFFIC_SOURCES)[number],
  datasetKind: "traffic_summary" | "traffic_detail",
  sourceDetail: string,
  sourceTitle: string,
  views: number,
 ) => ({
  trafficSourceType: source.sourceType,
  trafficSourceDetail: sourceDetail,
  datasetKind,
  sourceTitle,
  metrics: {
   views: cell(views),
   watchHours: cell(Math.round(views * 0.02)),
   engagedViews: cell(Math.round(views * 0.55)),
   impressions: cell(Math.round(views * 5)),
   averagePercentageViewed: cell(Number((30 + random() * 40).toFixed(1))),
   ctr: cell(Number((3 + random() * 6).toFixed(2))),
  },
 })

 return TRAFFIC_SOURCES.flatMap((source, index) => {
  const views = Math.round(120_000 / (index + 1) + random() * 8_000)
  return [
   trafficRow(source, "traffic_summary", "", source.sourceTitle, views),
   ...source.details.map((label, detailIndex) =>
    trafficRow(source, "traffic_detail", label, label, Math.round(views / (detailIndex + 2)))),
  ]
 })
}

export const buildAuditTrafficByDay = (days = 180) => {
 const random = seeded(31_2026)
 return Array.from({ length: days }, (_, dayIndex) => {
  const date = new Date(ANCHOR - (days - dayIndex) * DAY_MS)
  return TRAFFIC_SOURCES.slice(0, 6).map((source) => ({
   date: date.toISOString().slice(0, 10),
   day: date.toISOString().slice(0, 10),
   sourceType: source.sourceType,
   sourceTitle: source.sourceTitle,
   views: Math.round(400 + random() * 2_400),
   watchHours: Math.round(20 + random() * 120),
   format: "videos",
  }))
 }).flat()
}

export const buildAuditDailyMetrics = (days = 180) => {
 const random = seeded(19_2026)
 return Array.from({ length: days }, (_, dayIndex) => {
  const date = new Date(ANCHOR - (days - dayIndex) * DAY_MS)
  const views = Math.round(3_000 + dayIndex * 12 + random() * 1_800)
  return {
   date: date.toISOString().slice(0, 10),
   views,
   watchHours: Math.round(views * 0.03),
   likes: Math.round(views * 0.03),
   comments: Math.round(views * 0.004),
   shares: Math.round(views * 0.002),
   subscribersGained: Math.round(views * 0.002),
   revenue: Number((views * 0.002).toFixed(2)),
  }
 })
}

export const buildAuditGeographyRows = () =>
 [
  { country: "US", countryName: "United States", views: 412_000 },
  { country: "GB", countryName: "United Kingdom", views: 128_400 },
  { country: "CA", countryName: "Canada", views: 86_200 },
  { country: "AU", countryName: "Australia", views: 61_900 },
  { country: "DE", countryName: "Germany", views: 44_100 },
  { country: "FR", countryName: "France", views: 31_700 },
  { country: "IN", countryName: "India", views: 22_300 },
 ].map((row) => ({ ...row, watchHours: Math.round(row.views * 0.02), engagedViews: Math.round(row.views * 0.5) }))

export const buildDataVisualAuditProps = () => ({
 data: buildAuditVideoRows(),
 csvFiles: [],
 trafficRows: buildAuditTrafficRows(),
 trafficByDay: buildAuditTrafficByDay(),
 dailyMetrics: buildAuditDailyMetrics(),
 monthlyMetrics: [],
 geographyRows: buildAuditGeographyRows(),
})
