import fs from "fs"
import path from "path"

const DEFAULT_BUNDLE_PATH =
 "/Users/cwb/Downloads/viewtube_canonical_bundle_2026-06-02T11-03-52-372Z"

const bundlePath = process.argv[2] || DEFAULT_BUNDLE_PATH

const outputRoot = path.join(
 process.cwd(),
 "docs/html_hub/data/csv_test_fixtures/viewtube_sync_table_data_2026-06-02T11-03-52-372Z",
)

fs.rmSync(outputRoot, { recursive: true, force: true })

const safeReadJson = (filePath) =>
 JSON.parse(fs.readFileSync(filePath, "utf8"))

const ensureDir = (dirPath) => {
 fs.mkdirSync(dirPath, { recursive: true })
}

const parseCsv = (text) => {
 const rows = []
 let row = []
 let cell = ""
 let inQuotes = false

 for (let i = 0; i < text.length; i += 1) {
  const char = text[i]
  const next = text[i + 1]

  if (char === '"') {
   if (inQuotes && next === '"') {
    cell += '"'
    i += 1
   } else {
    inQuotes = !inQuotes
   }
   continue
  }

  if (!inQuotes && char === ",") {
   row.push(cell)
   cell = ""
   continue
  }

  if (!inQuotes && (char === "\n" || char === "\r")) {
   if (char === "\r" && next === "\n") i += 1
   row.push(cell)
   if (row.some((value) => value.length > 0)) rows.push(row)
   row = []
   cell = ""
   continue
  }

  cell += char
 }

 row.push(cell)
 if (row.some((value) => value.length > 0)) rows.push(row)

 if (!rows.length) return []
 const [headers, ...dataRows] = rows
 return dataRows.map((values) =>
  Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
 )
}

const csvEscape = (value) => {
 if (value === null || value === undefined) return ""
 const text = String(value)
 if (text.includes(",") || text.includes("\n") || text.includes('"')) {
  return `"${text.replace(/"/g, '""')}"`
 }
 return text
}

const rowsToCsv = (headers, rows) =>
 [
  headers.join(","),
  ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
 ].join("\n")

const toNumber = (value) => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return 0
 const normalized = value.replace(/[$,%]/g, "").replace(/,/g, "").trim()
 if (!normalized || normalized.toLowerCase() === "n/a") return 0
 const parsed = Number(normalized)
 return Number.isFinite(parsed) ? parsed : 0
}

const sumBy = (rows, key) => rows.reduce((acc, row) => acc + toNumber(row[key]), 0)

const weightedAverage = (rows, valueKey, weightKey) => {
 let totalWeight = 0
 let totalValue = 0
 rows.forEach((row) => {
  const weight = toNumber(row[weightKey])
  const value = toNumber(row[valueKey])
  if (weight <= 0) return
  totalWeight += weight
  totalValue += value * weight
 })
 return totalWeight > 0 ? totalValue / totalWeight : 0
}

const formatDurationSeconds = (value) => {
 const seconds = Math.max(0, Math.round(toNumber(value)))
 const hours = Math.floor(seconds / 3600)
 const minutes = Math.floor((seconds % 3600) / 60)
 const secs = seconds % 60
 if (hours > 0) {
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
 }
 return `0:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

const formatDecimal = (value, places = 4) => Number(toNumber(value).toFixed(places))

const buildRow = (headers, values) =>
 Object.fromEntries(headers.map((header) => [header, values[header] ?? ""]))

const writeFixture = (folderName, headers, rows, description) => {
 const dirPath = path.join(outputRoot, folderName)
 ensureDir(dirPath)
 fs.writeFileSync(path.join(dirPath, "Table data.csv"), rowsToCsv(headers, rows), "utf8")
 return { folderName, rowCount: rows.length, description }
}

const manifest = safeReadJson(path.join(bundlePath, "manifest/summary.json"))
const channelRecords = safeReadJson(path.join(bundlePath, "channel/channel_records.json"))
const channelDailyJson = safeReadJson(
 path.join(bundlePath, "channel/channel_daily_series.json"),
)
const trafficSummaryJson = safeReadJson(
 path.join(bundlePath, "traffic/traffic_summary.json"),
)
const geographyRowsJson = safeReadJson(
 path.join(bundlePath, "geography/geography_rows.json"),
)
const audienceRowsJson = safeReadJson(
 path.join(bundlePath, "audience/audience_split_rows.json"),
)
const videoCatalogCsv = parseCsv(
 fs.readFileSync(path.join(bundlePath, "videos/video_catalog.csv"), "utf8"),
)
const lifetimeMetricsCsv = parseCsv(
 fs.readFileSync(path.join(bundlePath, "videos/video_metrics_lifetime.csv"), "utf8"),
)

const channelRecord = Array.isArray(channelRecords) ? channelRecords[0] || {} : channelRecords || {}
const channelLabel =
 channelRecord.title ||
 channelRecord.channelTitle ||
 channelRecord.name ||
 "The Motion Visual History"

const catalogByVideoId = new Map(videoCatalogCsv.map((row) => [row.videoId, row]))
const lifetimeMetricsRows = lifetimeMetricsCsv.map((metricRow) => ({
 ...catalogByVideoId.get(metricRow.videoId),
 ...metricRow,
}))

const CONTENT_HEADERS = [
 "Content",
 "Video title",
 "Video publish time",
 "Duration",
 "Engaged views",
 "Average percentage viewed (%)",
 "Stayed to watch (%)",
 "Unique viewers",
 "Average views per viewer",
 "Unique reach",
 "New viewers",
 "Returning viewers",
 "Casual viewers",
 "Regular viewers",
 "Hypes",
 "Hype points",
 "Subscribers gained",
 "Subscribers lost",
 "Likes",
 "Dislikes",
 "Likes (vs. dislikes) (%)",
 "Shares",
 "Comments added",
 "Transaction revenue (USD)",
 "Transactions",
 "Revenue per transaction (USD)",
 "YouTube Premium (USD)",
 "Watch Page ads (USD)",
 "Estimated DoubleClick revenue (USD)",
 "Estimated AdSense revenue (USD)",
 "YouTube ad revenue (USD)",
 "Ad impressions",
 "Playback-based CPM (USD)",
 "CPM (USD)",
 "Estimated monetized playbacks",
 "RPM (USD)",
 "Rubies",
 "YouTube Premium views",
 "YouTube Premium watch time (hours)",
 "Playlist watch time (hours)",
 "Views from playlist",
 "End screen element clicks",
 "End screen elements shown",
 "Clicks per end screen element shown (%)",
 "Card clicks",
 "Cards shown",
 "Clicks per card shown (%)",
 "Card teaser clicks",
 "Card teasers shown",
 "Teaser clicks per card teaser shown (%)",
 "Remix count",
 "Remix views",
 "Views",
 "Watch time (hours)",
 "Subscribers",
 "Estimated revenue (USD)",
 "Average view duration",
 "Impressions",
 "Impressions click-through rate (%)",
]

const OVERVIEW_REACH_HEADERS = [
 "Content",
 "Video title",
 "Video publish time",
 "Duration",
 "Engaged views",
 "Average view duration",
 "Average percentage viewed (%)",
 "Stayed to watch (%)",
 "Unique viewers",
 "Average views per viewer",
 "New viewers",
 "Returning viewers",
 "Casual viewers",
 "Regular viewers",
 "Views",
 "Watch time (hours)",
 "Subscribers",
 "Impressions",
 "Impressions click-through rate (%)",
]

const REVENUE_HEADERS = [
 "Content",
 "Video title",
 "Video publish time",
 "Duration",
 "Hypes",
 "Hype points",
 "Subscribers lost",
 "Subscribers gained",
 "Likes",
 "Dislikes",
 "Likes (vs. dislikes) (%)",
 "Shares",
 "Comments added",
 "Transaction revenue (USD)",
 "Transactions",
 "Revenue per transaction (USD)",
 "YouTube Premium (USD)",
 "Watch Page ads (USD)",
 "Estimated DoubleClick revenue (USD)",
 "Estimated AdSense revenue (USD)",
 "YouTube ad revenue (USD)",
 "Ad impressions",
 "Rubies",
 "RPM (USD)",
 "Playback-based CPM (USD)",
 "Estimated monetized playbacks",
 "CPM (USD)",
 "Estimated revenue (USD)",
]

const DATE_HEADERS = [
 "Date",
 "Engaged views",
 "Subscribers",
 "Average percentage viewed (%)",
 "Videos added",
 "Videos published",
 "Impressions",
 "Impressions click-through rate (%)",
 "Unique viewers",
 "Stayed to watch (%)",
 "Average views per viewer",
 "Unique reach",
 "New viewers",
 "Casual viewers",
 "Returning viewers",
 "Regular viewers",
 "Hypes",
 "Hype points",
 "Subscribers lost",
 "Subscribers gained",
 "Likes",
 "Dislikes",
 "Likes (vs. dislikes) (%)",
 "Shares",
 "Comments added",
 "Transaction revenue (USD)",
 "Transactions",
 "Revenue per transaction (USD)",
 "YouTube Premium (USD)",
 "Watch Page ads (USD)",
 "Estimated DoubleClick revenue (USD)",
 "Estimated AdSense revenue (USD)",
 "YouTube ad revenue (USD)",
 "Ad impressions",
 "Playback-based CPM (USD)",
 "CPM (USD)",
 "Estimated monetized playbacks",
 "RPM (USD)",
 "Rubies",
 "Total members",
 "Active members",
 "Members gained",
 "Members lost",
 "Canceled memberships",
 "Exit surveys",
 "Average membership tenure (days)",
 "Churn rate (%)",
 "Product clicks",
 "Product impressions",
 "Total sales (USD)",
 "Orders",
 "Approved commissions (USD)",
 "Pending commissions (USD)",
 "Removed commission (USD)",
 "YouTube Premium views",
 "YouTube Premium watch time (hours)",
 "Playlist watch time (hours)",
 "Views from playlist",
 "Views per playlist start",
 "Hours streamed",
 "Reminders set",
 "Chat messages",
 "Reactions",
 "Post impressions",
 "Post likes",
 "Post like rate (%)",
 "Post responses",
 "Post response rate (%)",
 "Post subscribers",
 "Remix count",
 "Remix views",
 "Community clip views",
 "Watch time from community clips (hours)",
 "Card clicks",
 "Clicks per card shown (%)",
 "Cards shown",
 "Card teaser clicks",
 "Card teasers shown",
 "Teaser clicks per card teaser shown (%)",
 "End screen element clicks",
 "End screen elements shown",
 "Clicks per end screen element shown (%)",
 "Views",
 "Watch time (hours)",
 "Average view duration",
 "Estimated revenue (USD)",
]

const TRAFFIC_HEADERS = [
 "Traffic source",
 "Engaged views",
 "Average percentage viewed (%)",
 "Hypes",
 "Hype points",
 "YouTube Premium views",
 "YouTube Premium watch time (hours)",
 "Playlist watch time (hours)",
 "Views from playlist",
 "Views per playlist start",
 "Views",
 "Watch time (hours)",
 "Average view duration",
 "Impressions",
 "Impressions click-through rate (%)",
]

const AUDIENCE_HEADERS = [
 "Audience by watch behavior",
 "Engaged views",
 "Average percentage viewed (%)",
 "Comments added",
 "YouTube Premium views",
 "YouTube Premium watch time (hours)",
 "Hypes",
 "Hype points",
 "Impressions",
 "Impressions click-through rate (%)",
 "Views",
 "Watch time (hours)",
 "Average view duration",
]

const GEO_HEADERS = [
 "Geography",
 "Engaged views",
 "Subscribers",
 "Average percentage viewed (%)",
 "Stayed to watch (%)",
 "Comments added",
 "Likes (vs. dislikes) (%)",
 "Shares",
 "Dislikes",
 "Likes",
 "Subscribers lost",
 "Subscribers gained",
 "YouTube Premium views",
 "YouTube Premium watch time (hours)",
 "Playlist watch time (hours)",
 "Views from playlist",
 "Post subscribers",
 "End screen element clicks",
 "Clicks per end screen element shown (%)",
 "End screen elements shown",
 "Card clicks",
 "Cards shown",
 "Clicks per card shown (%)",
 "Card teaser clicks",
 "Card teasers shown",
 "Teaser clicks per card teaser shown (%)",
 "Watch time from community clips (hours)",
 "Community clip views",
 "Views",
 "Watch time (hours)",
 "Average view duration",
]

const baseContentRows = lifetimeMetricsRows.map((row) => {
 const subscribersNet = toNumber(row.netSubscribers)
 return {
  Content: row.videoId || "",
  "Video title": row.title || "",
  "Video publish time": row.publishedAt || "",
  Duration: formatDurationSeconds(row.durationSeconds),
  "Engaged views": toNumber(row.engagedViews),
  "Average percentage viewed (%)": formatDecimal(row.averageViewPercentage, 2),
  "Stayed to watch (%)": 0,
  "Unique viewers": 0,
  "Average views per viewer": 0,
  "Unique reach": 0,
  "New viewers": 0,
  "Returning viewers": 0,
  "Casual viewers": 0,
  "Regular viewers": 0,
  Hypes: toNumber(row.hypes),
  "Hype points": toNumber(row.hypePoints),
  "Subscribers gained": toNumber(row.subscribersGained),
  "Subscribers lost": toNumber(row.subscribersLost),
  Likes: toNumber(row.likes),
  Dislikes: toNumber(row.dislikes),
  "Likes (vs. dislikes) (%)": formatDecimal(row.likesVsDislikesPercent, 2),
  Shares: toNumber(row.shares),
  "Comments added": toNumber(row.comments),
  "Transaction revenue (USD)": formatDecimal(row.transactionRevenue, 3),
  Transactions: 0,
  "Revenue per transaction (USD)": 0,
  "YouTube Premium (USD)": formatDecimal(row.estimatedYouTubePremiumRevenue, 3),
  "Watch Page ads (USD)": formatDecimal(row.estimatedAdRevenue, 3),
  "Estimated DoubleClick revenue (USD)": 0,
  "Estimated AdSense revenue (USD)": formatDecimal(row.estimatedAdRevenue, 3),
  "YouTube ad revenue (USD)": formatDecimal(row.estimatedAdRevenue, 3),
  "Ad impressions": toNumber(row.adImpressions),
  "Playback-based CPM (USD)": formatDecimal(row.playbackBasedCpm, 3),
  "CPM (USD)": formatDecimal(row.cpm, 3),
  "Estimated monetized playbacks": toNumber(row.monetizedPlaybacks),
  "RPM (USD)": formatDecimal(row.rpm, 3),
  Rubies: 0,
  "YouTube Premium views": toNumber(row.redViews),
  "YouTube Premium watch time (hours)": formatDecimal(row.youtubePremiumWatchHours, 4),
  "Playlist watch time (hours)": 0,
  "Views from playlist": 0,
  "End screen element clicks": toNumber(row.endScreenElementClicks),
  "End screen elements shown": toNumber(row.endScreenElementImpressions),
  "Clicks per end screen element shown (%)": formatDecimal(
   row.endScreenElementClickRate,
   2,
  ),
  "Card clicks": toNumber(row.cardClicks),
  "Cards shown": toNumber(row.cardImpressions),
  "Clicks per card shown (%)": formatDecimal(row.cardClickRate, 2),
  "Card teaser clicks": toNumber(row.cardTeaserClicks),
  "Card teasers shown": toNumber(row.cardTeaserImpressions),
  "Teaser clicks per card teaser shown (%)": formatDecimal(
   row.cardTeaserClickRate,
   2,
  ),
  "Remix count": toNumber(row.remixCount),
  "Remix views": toNumber(row.remixViews),
  Views: toNumber(row.views),
  "Watch time (hours)": formatDecimal(row.watchHours, 4),
  Subscribers: subscribersNet,
  "Estimated revenue (USD)": formatDecimal(row.estimatedRevenue, 3),
  "Average view duration": formatDurationSeconds(row.averageViewDuration),
  Impressions: toNumber(row.videoThumbnailImpressions),
  "Impressions click-through rate (%)": formatDecimal(
   row.videoThumbnailImpressionsClickRate,
   2,
  ),
 }
})

const contentTotal = buildRow(CONTENT_HEADERS, {
 Content: "Total",
 Views: sumBy(baseContentRows, "Views"),
 "Watch time (hours)": formatDecimal(sumBy(baseContentRows, "Watch time (hours)"), 4),
 "Estimated revenue (USD)": formatDecimal(sumBy(baseContentRows, "Estimated revenue (USD)"), 3),
 "Average view duration": formatDurationSeconds(
  weightedAverage(baseContentRows, "Average view duration", "Views"),
 ),
 "Average percentage viewed (%)": formatDecimal(
  weightedAverage(baseContentRows, "Average percentage viewed (%)", "Views"),
  2,
 ),
 "Engaged views": sumBy(baseContentRows, "Engaged views"),
 "Subscribers gained": sumBy(baseContentRows, "Subscribers gained"),
 "Subscribers lost": sumBy(baseContentRows, "Subscribers lost"),
 Likes: sumBy(baseContentRows, "Likes"),
 Dislikes: sumBy(baseContentRows, "Dislikes"),
 "Likes (vs. dislikes) (%)": formatDecimal(
  weightedAverage(baseContentRows, "Likes (vs. dislikes) (%)", "Likes"),
  2,
 ),
 Shares: sumBy(baseContentRows, "Shares"),
 "Comments added": sumBy(baseContentRows, "Comments added"),
 "Transaction revenue (USD)": formatDecimal(
  sumBy(baseContentRows, "Transaction revenue (USD)"),
  3,
 ),
 "YouTube Premium (USD)": formatDecimal(sumBy(baseContentRows, "YouTube Premium (USD)"), 3),
 "Watch Page ads (USD)": formatDecimal(sumBy(baseContentRows, "Watch Page ads (USD)"), 3),
 "Estimated DoubleClick revenue (USD)": formatDecimal(
  sumBy(baseContentRows, "Estimated DoubleClick revenue (USD)"),
  3,
 ),
 "Estimated AdSense revenue (USD)": formatDecimal(
  sumBy(baseContentRows, "Estimated AdSense revenue (USD)"),
  3,
 ),
 "YouTube ad revenue (USD)": formatDecimal(
  sumBy(baseContentRows, "YouTube ad revenue (USD)"),
  3,
 ),
 "Ad impressions": sumBy(baseContentRows, "Ad impressions"),
 "Playback-based CPM (USD)": formatDecimal(
  weightedAverage(baseContentRows, "Playback-based CPM (USD)", "Ad impressions"),
  3,
 ),
 "CPM (USD)": formatDecimal(weightedAverage(baseContentRows, "CPM (USD)", "Impressions"), 3),
 "Estimated monetized playbacks": sumBy(baseContentRows, "Estimated monetized playbacks"),
 "RPM (USD)": formatDecimal(
  ((sumBy(baseContentRows, "Estimated revenue (USD)") / Math.max(1, sumBy(baseContentRows, "Views"))) *
   1000),
  3,
 ),
 "YouTube Premium views": sumBy(baseContentRows, "YouTube Premium views"),
 "YouTube Premium watch time (hours)": formatDecimal(
  sumBy(baseContentRows, "YouTube Premium watch time (hours)"),
  4,
 ),
 "Playlist watch time (hours)": formatDecimal(
  sumBy(baseContentRows, "Playlist watch time (hours)"),
  4,
 ),
 "Views from playlist": sumBy(baseContentRows, "Views from playlist"),
 "End screen element clicks": sumBy(baseContentRows, "End screen element clicks"),
 "End screen elements shown": sumBy(baseContentRows, "End screen elements shown"),
 "Clicks per end screen element shown (%)": formatDecimal(
  weightedAverage(
   baseContentRows,
   "Clicks per end screen element shown (%)",
   "End screen elements shown",
  ),
  2,
 ),
 "Card clicks": sumBy(baseContentRows, "Card clicks"),
 "Cards shown": sumBy(baseContentRows, "Cards shown"),
 "Clicks per card shown (%)": formatDecimal(
  weightedAverage(baseContentRows, "Clicks per card shown (%)", "Cards shown"),
  2,
 ),
 "Card teaser clicks": sumBy(baseContentRows, "Card teaser clicks"),
 "Card teasers shown": sumBy(baseContentRows, "Card teasers shown"),
 "Teaser clicks per card teaser shown (%)": formatDecimal(
  weightedAverage(
   baseContentRows,
   "Teaser clicks per card teaser shown (%)",
   "Card teasers shown",
  ),
  2,
 ),
 "Remix count": sumBy(baseContentRows, "Remix count"),
 "Remix views": sumBy(baseContentRows, "Remix views"),
 Subscribers: sumBy(baseContentRows, "Subscribers"),
 Impressions: sumBy(baseContentRows, "Impressions"),
 "Impressions click-through rate (%)": formatDecimal(
  weightedAverage(baseContentRows, "Impressions click-through rate (%)", "Impressions"),
  2,
 ),
})

const contentRows = [
 contentTotal,
 ...baseContentRows.map((row) => buildRow(CONTENT_HEADERS, row)),
]

const overviewReachTotal = buildRow(OVERVIEW_REACH_HEADERS, contentTotal)
const overviewReachRows = [
 overviewReachTotal,
 ...baseContentRows.map((row) => buildRow(OVERVIEW_REACH_HEADERS, row)),
]

const revenueTotal = buildRow(REVENUE_HEADERS, contentTotal)
const revenueRows = [
 revenueTotal,
 ...baseContentRows.map((row) => buildRow(REVENUE_HEADERS, row)),
]

const publishedDates = new Set(
 lifetimeMetricsRows.map((row) => String(row.publishedAt || "").slice(0, 10)).filter(Boolean),
)

const dailyBaseRows = channelDailyJson.map((row) => ({
 Date: row.date,
 "Engaged views": 0,
 Subscribers:
  toNumber(row.metrics?.subscribersGained) - toNumber(row.metrics?.subscribersLost),
 "Average percentage viewed (%)": formatDecimal(row.metrics?.averageViewPercentage, 2),
 "Videos added": 0,
 "Videos published": publishedDates.has(row.date) ? 1 : 0,
 Impressions: 0,
 "Impressions click-through rate (%)": 0,
 "Unique viewers": 0,
 "Stayed to watch (%)": 0,
 "Average views per viewer": 0,
 "Unique reach": 0,
 "New viewers": 0,
 "Casual viewers": 0,
 "Returning viewers": 0,
 "Regular viewers": 0,
 Hypes: 0,
 "Hype points": 0,
 "Subscribers lost": toNumber(row.metrics?.subscribersLost),
 "Subscribers gained": toNumber(row.metrics?.subscribersGained),
 Likes: toNumber(row.metrics?.likes),
 Dislikes: 0,
 "Likes (vs. dislikes) (%)": 0,
 Shares: toNumber(row.metrics?.shares),
 "Comments added": toNumber(row.metrics?.comments),
 "Transaction revenue (USD)": 0,
 Transactions: 0,
 "Revenue per transaction (USD)": 0,
 "YouTube Premium (USD)": 0,
 "Watch Page ads (USD)": 0,
 "Estimated DoubleClick revenue (USD)": 0,
 "Estimated AdSense revenue (USD)": 0,
 "YouTube ad revenue (USD)": 0,
 "Ad impressions": 0,
 "Playback-based CPM (USD)": 0,
 "CPM (USD)": 0,
 "Estimated monetized playbacks": 0,
 "RPM (USD)": formatDecimal(
  ((toNumber(row.metrics?.revenue) / Math.max(1, toNumber(row.metrics?.views))) * 1000),
  3,
 ),
 Rubies: 0,
 "Total members": -1,
 "Active members": -1,
 "Members gained": 0,
 "Members lost": 0,
 "Canceled memberships": 0,
 "Exit surveys": 0,
 "Average membership tenure (days)": 0,
 "Churn rate (%)": 0,
 "Product clicks": 0,
 "Product impressions": 0,
 "Total sales (USD)": 0,
 Orders: 0,
 "Approved commissions (USD)": 0,
 "Pending commissions (USD)": 0,
 "Removed commission (USD)": 0,
 "YouTube Premium views": 0,
 "YouTube Premium watch time (hours)": 0,
 "Playlist watch time (hours)": 0,
 "Views from playlist": 0,
 "Views per playlist start": 0,
 "Hours streamed": 0,
 "Reminders set": 0,
 "Chat messages": 0,
 Reactions: 0,
 "Post impressions": 0,
 "Post likes": 0,
 "Post like rate (%)": 0,
 "Post responses": 0,
 "Post response rate (%)": 0,
 "Post subscribers": 0,
 "Remix count": 0,
 "Remix views": 0,
 "Community clip views": 0,
 "Watch time from community clips (hours)": 0,
 "Card clicks": 0,
 "Clicks per card shown (%)": 0,
 "Cards shown": 0,
 "Card teaser clicks": 0,
 "Card teasers shown": 0,
 "Teaser clicks per card teaser shown (%)": 0,
 "End screen element clicks": 0,
 "End screen elements shown": 0,
 "Clicks per end screen element shown (%)": 0,
 Views: toNumber(row.metrics?.views),
 "Watch time (hours)": formatDecimal(row.metrics?.watchHours, 4),
 "Average view duration": formatDurationSeconds(row.metrics?.averageViewDuration),
 "Estimated revenue (USD)": formatDecimal(row.metrics?.revenue, 3),
}))

const dailyTotal = buildRow(DATE_HEADERS, {
 Date: "Total",
 "Engaged views": sumBy(dailyBaseRows, "Engaged views"),
 Subscribers: sumBy(dailyBaseRows, "Subscribers"),
 "Average percentage viewed (%)": formatDecimal(
  weightedAverage(dailyBaseRows, "Average percentage viewed (%)", "Views"),
  2,
 ),
 "Videos added": sumBy(dailyBaseRows, "Videos added"),
 "Videos published": sumBy(dailyBaseRows, "Videos published"),
 Impressions: sumBy(dailyBaseRows, "Impressions"),
 "Impressions click-through rate (%)": formatDecimal(
  weightedAverage(dailyBaseRows, "Impressions click-through rate (%)", "Impressions"),
  2,
 ),
 "Subscribers lost": sumBy(dailyBaseRows, "Subscribers lost"),
 "Subscribers gained": sumBy(dailyBaseRows, "Subscribers gained"),
 Likes: sumBy(dailyBaseRows, "Likes"),
 Shares: sumBy(dailyBaseRows, "Shares"),
 "Comments added": sumBy(dailyBaseRows, "Comments added"),
 "Estimated revenue (USD)": formatDecimal(sumBy(dailyBaseRows, "Estimated revenue (USD)"), 3),
 "RPM (USD)": formatDecimal(
  ((sumBy(dailyBaseRows, "Estimated revenue (USD)") / Math.max(1, sumBy(dailyBaseRows, "Views"))) *
   1000),
  3,
 ),
 Views: sumBy(dailyBaseRows, "Views"),
 "Watch time (hours)": formatDecimal(sumBy(dailyBaseRows, "Watch time (hours)"), 4),
 "Average view duration": formatDurationSeconds(
  weightedAverage(dailyBaseRows, "Average view duration", "Views"),
 ),
})

const dailyRows = [dailyTotal, ...dailyBaseRows.map((row) => buildRow(DATE_HEADERS, row))]

const trafficBaseRows = trafficSummaryJson
 .filter((row) => row.entityType === "channel")
 .map((row) => ({
  "Traffic source": row.sourceLabel || row.trafficSourceType || "Unknown",
  "Engaged views": toNumber(row.metrics?.engagedViews),
  "Average percentage viewed (%)": formatDecimal(
   row.metrics?.averagePercentageViewed,
   2,
  ),
  Hypes: 0,
  "Hype points": 0,
  "YouTube Premium views": toNumber(row.metrics?.premiumViews),
  "YouTube Premium watch time (hours)": formatDecimal(
   row.metrics?.premiumWatchHours,
   4,
  ),
  "Playlist watch time (hours)": formatDecimal(
   row.metrics?.playlistWatchHours,
   4,
  ),
  "Views from playlist": toNumber(row.metrics?.viewsFromPlaylist),
  "Views per playlist start": formatDecimal(row.metrics?.viewsPerPlaylistStart, 4),
  Views: toNumber(row.metrics?.views),
  "Watch time (hours)": formatDecimal(row.metrics?.watchHours, 4),
  "Average view duration": formatDurationSeconds(row.metrics?.averageViewDuration),
  Impressions: toNumber(row.metrics?.impressions),
  "Impressions click-through rate (%)": formatDecimal(row.metrics?.ctr, 2),
 }))

const trafficTotal = buildRow(TRAFFIC_HEADERS, {
 "Traffic source": "Total",
 "Engaged views": sumBy(trafficBaseRows, "Engaged views"),
 "Average percentage viewed (%)": formatDecimal(
  weightedAverage(trafficBaseRows, "Average percentage viewed (%)", "Views"),
  2,
 ),
 "YouTube Premium views": sumBy(trafficBaseRows, "YouTube Premium views"),
 "YouTube Premium watch time (hours)": formatDecimal(
  sumBy(trafficBaseRows, "YouTube Premium watch time (hours)"),
  4,
 ),
 "Playlist watch time (hours)": formatDecimal(
  sumBy(trafficBaseRows, "Playlist watch time (hours)"),
  4,
 ),
 "Views from playlist": sumBy(trafficBaseRows, "Views from playlist"),
 "Views per playlist start": formatDecimal(
  weightedAverage(trafficBaseRows, "Views per playlist start", "Views from playlist"),
  4,
 ),
 Views: sumBy(trafficBaseRows, "Views"),
 "Watch time (hours)": formatDecimal(sumBy(trafficBaseRows, "Watch time (hours)"), 4),
 "Average view duration": formatDurationSeconds(
  weightedAverage(trafficBaseRows, "Average view duration", "Views"),
 ),
 Impressions: sumBy(trafficBaseRows, "Impressions"),
 "Impressions click-through rate (%)": formatDecimal(
  weightedAverage(trafficBaseRows, "Impressions click-through rate (%)", "Impressions"),
  2,
 ),
})

const trafficRows = [trafficTotal, ...trafficBaseRows.map((row) => buildRow(TRAFFIC_HEADERS, row))]

const audienceBaseRows = audienceRowsJson
 .filter((row) => row.entityType === "channel")
 .map((row) => ({
  "Audience by watch behavior": String(row.splitKey || "Unknown")
   .replace(/_/g, " ")
   .toLowerCase()
   .replace(/\b\w/g, (char) => char.toUpperCase()),
  "Engaged views": toNumber(row.metrics?.engagedViews),
  "Average percentage viewed (%)": formatDecimal(
   row.metrics?.averageViewPercentage,
   2,
  ),
  "Comments added": 0,
  "YouTube Premium views": 0,
  "YouTube Premium watch time (hours)": 0,
  Hypes: 0,
  "Hype points": 0,
  Impressions: 0,
  "Impressions click-through rate (%)": 0,
  Views: toNumber(row.metrics?.views),
  "Watch time (hours)": formatDecimal(
   toNumber(row.metrics?.estimatedMinutesWatched) / 60,
   4,
  ),
  "Average view duration": formatDurationSeconds(row.metrics?.averageViewDuration),
 }))

const audienceTotal = buildRow(AUDIENCE_HEADERS, {
 "Audience by watch behavior": "Total",
 "Engaged views": sumBy(audienceBaseRows, "Engaged views"),
 "Average percentage viewed (%)": formatDecimal(
  weightedAverage(audienceBaseRows, "Average percentage viewed (%)", "Views"),
  2,
 ),
 Views: sumBy(audienceBaseRows, "Views"),
 "Watch time (hours)": formatDecimal(sumBy(audienceBaseRows, "Watch time (hours)"), 4),
 "Average view duration": formatDurationSeconds(
  weightedAverage(audienceBaseRows, "Average view duration", "Views"),
 ),
})

const audienceRows = [
 audienceTotal,
 ...audienceBaseRows.map((row) => buildRow(AUDIENCE_HEADERS, row)),
]

const geoBaseRows = geographyRowsJson
 .filter((row) => row.entityType === "channel")
 .map((row) => ({
  Geography: row.country || "Unknown",
  "Engaged views": 0,
  Subscribers: 0,
  "Average percentage viewed (%)": formatDecimal(
   row.metrics?.averageViewPercentage,
   2,
  ),
  "Stayed to watch (%)": 0,
  "Comments added": 0,
  "Likes (vs. dislikes) (%)": 0,
  Shares: 0,
  Dislikes: 0,
  Likes: 0,
  "Subscribers lost": 0,
  "Subscribers gained": 0,
  "YouTube Premium views": 0,
  "YouTube Premium watch time (hours)": 0,
  "Playlist watch time (hours)": 0,
  "Views from playlist": 0,
  "Post subscribers": 0,
  "End screen element clicks": 0,
  "Clicks per end screen element shown (%)": 0,
  "End screen elements shown": 0,
  "Card clicks": 0,
  "Cards shown": 0,
  "Clicks per card shown (%)": 0,
  "Card teaser clicks": 0,
  "Card teasers shown": 0,
  "Teaser clicks per card teaser shown (%)": 0,
  "Watch time from community clips (hours)": 0,
  "Community clip views": 0,
  Views: toNumber(row.metrics?.views),
  "Watch time (hours)": formatDecimal(
   toNumber(row.metrics?.estimatedMinutesWatched) / 60,
   4,
  ),
  "Average view duration": formatDurationSeconds(row.metrics?.averageViewDuration),
 }))

const geoTotal = buildRow(GEO_HEADERS, {
 Geography: "Total",
 Views: sumBy(geoBaseRows, "Views"),
 "Watch time (hours)": formatDecimal(sumBy(geoBaseRows, "Watch time (hours)"), 4),
 "Average percentage viewed (%)": formatDecimal(
  weightedAverage(geoBaseRows, "Average percentage viewed (%)", "Views"),
  2,
 ),
 "Average view duration": formatDurationSeconds(
  weightedAverage(geoBaseRows, "Average view duration", "Views"),
 ),
})

const geoRows = [geoTotal, ...geoBaseRows.map((row) => buildRow(GEO_HEADERS, row))]

ensureDir(outputRoot)

const outputs = [
 writeFixture(
  "Content 2022-05-06_2026-05-15 The Motion Visual History (3)",
  CONTENT_HEADERS,
  contentRows,
  "Core content table fixture using the exact archive-style package title from the local YouTube export ZIP set.",
 ),
 writeFixture(
  "Date 2022-05-06_2026-05-19 The Motion Visual History",
  DATE_HEADERS,
  dailyRows,
  "Daily metrics table fixture using the exact archive-style package title from the local YouTube export ZIP set.",
 ),
 writeFixture(
  "Traffic source 2022-05-06_2026-05-15 The Motion Visual History",
  TRAFFIC_HEADERS,
  trafficRows,
  "Traffic source table fixture using the exact archive-style package title from the local YouTube export ZIP set.",
 ),
 writeFixture(
  "Audience by watch behavior 2022-05-06_2026-05-19 The Motion Visual History",
  AUDIENCE_HEADERS,
  audienceRows,
  "Audience watch-behavior table fixture using the exact archive-style package title from the local YouTube export ZIP set.",
 ),
 writeFixture(
  "Geography 2022-05-06_2026-05-17 The Motion Visual History",
  GEO_HEADERS,
  geoRows,
  "Geography table fixture using the exact archive-style package title from the local YouTube export ZIP set.",
 ),
]

const readme = [
 "# Sync-derived Table Data CSV fixtures",
 "",
 `Source bundle: ${bundlePath}`,
 `Generated at: ${new Date().toISOString()}`,
 `Channel label: ${channelLabel}`,
 "",
"These folders contain only `Table data.csv` files intended for Performance Hub upload testing.",
"The headers and column order mirror real YouTube Analytics exports already present in the local workspace.",
 "",
 "## Generated fixtures",
 ...outputs.map(
  (entry) => `- ${entry.folderName}/Table data.csv: ${entry.rowCount} rows. ${entry.description}`,
 ),
 "",
 "## Notes",
"- Content uses lifetime sync rows from the canonical bundle video metrics CSV plus video catalog metadata.",
"- Date uses canonical channel daily rows.",
"- Traffic, audience, and geography use the current 28d canonical family rows.",
 "- Unsupported metrics are intentionally zero-filled instead of omitted so the uploads still exercise the intended table columns.",
 `- Bundle manifest video count: ${manifest.totalVideoCount}`,
 `- Bundle manifest daily rows: ${
  manifest.fileInventory.find((entry) => entry.path === "channel/channel_daily_series.csv")?.rowCount || 0
 }`,
].join("\n")

fs.writeFileSync(path.join(outputRoot, "README.md"), readme, "utf8")

console.log(`Generated ${outputs.length} Table data.csv fixtures in ${outputRoot}`)
outputs.forEach((entry) => {
 console.log(`- ${entry.folderName}/Table data.csv (${entry.rowCount} rows)`)
})
