import type { CsvFileWithTag } from "../types"
import {
 buildUnifiedRowsFromCsvFiles,
 type DataForgeRow,
} from "../services/DataEngine"
import {
 resolveCtrPercent,
 resolveImpressions,
} from "../services/metricAliasResolver"
import { METRIC_REGISTRY, canonicalizeMetricKey } from "../services/analyticsContract"

export type UnifiedRow = DataForgeRow & {
 _id: string
 _sourceFile: string
 _userTag: string
}

export type SourceSummary = {
 views: number
 watchHours: number
 subscribers: number
 revenue: number
 ctrAverage: number
}

export const numberFromUnknown = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return 0
 const cleaned = value.replace(/,/g, "").replace(/%/g, "").trim()
 const parsed = Number(cleaned)
 return Number.isFinite(parsed) ? parsed : 0
}

export const textFromUnknown = (value: unknown): string => {
 if (typeof value === "string") return value
 if (typeof value === "number") return String(value)
 if (value == null) return ""
 return String(value)
}

export const canonicalKey = (value: string): string =>
 canonicalizeMetricKey(value)

const canonicalDisplayKey = (value: string): string =>
 textFromUnknown(value)
  .toLowerCase()
  .replace(/_/g, " ")
  .replace(/\s+/g, " ")
  .trim()

export const lookupKey = (value: unknown): string =>
 canonicalizeMetricKey(textFromUnknown(value))

export const looksLikeVideoId = (value: unknown): boolean =>
 /^[a-zA-Z0-9_-]{8,}$/.test(textFromUnknown(value).trim())

export const positiveMetric = (value: unknown): number => {
 const parsed = numberFromUnknown(value)
 return parsed > 0 ? parsed : 0
}

export const MASTER_HEADER_ALIASES: Record<string, string[]> = {
 "Video title": ["videotitle", "video", "dimension", "title", "content"],
 "Video ID": ["videoid", "id"],
 Length: ["length", "durationsec", "durationseconds", "duration"],
 Format: ["format", "type", "contenttype", "creatorcontenttype"],
 Date: [
  "date",
  "day",
  "publishdate",
  "publishedat",
  "uploaddate",
  "videopublishtime",
 ],
 "Traffic source": ["insighttrafficsourcetype", "trafficsource"],
 Country: ["country"],
 "Device type": ["devicetype", "device"],
}

Object.values(METRIC_REGISTRY).forEach((def) => {
 const header = def.displayVariants.tableHeader
 if (!MASTER_HEADER_ALIASES[header]) {
  MASTER_HEADER_ALIASES[header] = []
 }
 const normalizedHeader = canonicalizeMetricKey(header)
 if (!MASTER_HEADER_ALIASES[header].includes(normalizedHeader)) {
  MASTER_HEADER_ALIASES[header].push(normalizedHeader)
 }
 def.aliases.forEach((alias) => {
  const norm = canonicalizeMetricKey(alias)
  if (!MASTER_HEADER_ALIASES[header].includes(norm)) {
   MASTER_HEADER_ALIASES[header].push(norm)
  }
 })
 const normKey = canonicalizeMetricKey(def.key)
 if (!MASTER_HEADER_ALIASES[header].includes(normKey)) {
  MASTER_HEADER_ALIASES[header].push(normKey)
 }
})

export const MASTER_TABLE_SHORT_LABELS: Record<string, string> = {
 "Video title": "Title",
 "Video ID": "Video ID",
 Format: "Format",
 Date: "Date",
 Views: "Views",
 "Watch Time (Hours)": "Watch Hrs",
 "Watch Hrs": "Watch Hrs",
 Revenue: "Revenue",
 "Subs +": "Subs +",
 "Subs -": "Subs -",
 "Likes +": "Likes +",
 "Likes -": "Likes -",
 Comments: "CMNTS",
 Shares: "Shares",
 "Engaged views": "Engaged",
 Engaged: "Engaged",
 CPM: "CPM",
 RPM: "RPM",
 Length: "Length",
 "AVD (Average View Duration)": "AVD",
 "AVD (Sec)": "AVD",
 AVD: "AVD",
 "AVP (%)": "AVP %",
 "Click-Through Rate (CTR)": "CTR %",
 "CTR (%)": "CTR %",
 CTR: "CTR %",
 "CTR %": "CTR %",
 "Impressions click-through rate (%)": "CTR %",
 Impressions: "Impressions",
 "Engagement Rate": "Eng Rate",
 "STW %": "STW %",
 "End screen click rate": "End Screen %",
 "End Screen %": "End Screen %",
 "End screen clicks": "ES Clicks",
 "ES Clicks": "ES Clicks",
 "End screen impressions": "ES Impr",
 "ES Impr": "ES Impr",
 "Card click rate": "Card %",
 "Card %": "Card %",
 "Card teaser click rate": "Teaser %",
 "Teaser %": "Teaser %",
 "Card teaser clicks": "Teaser Clicks",
 "Teaser Clicks": "Teaser Clicks",
 "Card teaser impressions": "Teaser Impr",
 "Teaser Impr": "Teaser Impr",
 "Annotation impressions": "Ann Impr",
 "Ann Impr": "Ann Impr",
 "Annotation clickable impressions": "Ann Click Impr",
 "Ann Click Impr": "Ann Click Impr",
 "Annotation closable impressions": "Ann Close Impr",
 "Ann Close Impr": "Ann Close Impr",
 "Annotation clicks": "Ann Clicks",
 "Ann Clicks": "Ann Clicks",
 "Annotation closes": "Ann Closes",
 "Ann Closes": "Ann Closes",
 "YouTube Premium Watch Time": "Red Hrs",
 "Red Hrs": "Red Hrs",
 Duration: "Length",
 "Viewer percentage": "Viewer %",
 "Data Provenance": "Data Src",
}

export const MASTER_VIDEO_TABLE_HEADERS: string[] = [
 "Views",
 "Subs +",
 "Subs -",
 "Likes +",
 "Likes -",
 "Shares",
 "Comments",
 "Watch Hrs",
 "Revenue",
 "RPM",
 "AVD",
 "AVP %",
 "Engaged",
 "Estimated Ad Revenue",
 "Gross Revenue",
 "Impressions",
 "CPM",
 "STW %",
 "CTR %",
 "Unique",
 "New",
 "Casual",
 "Returning",
 "Regular",
 "Red Hrs",
 "End screen elements shown",
 "End Screen %",
 "Estimated Premium Revenue",
 "Playback Based CPM",
 "Ad Impressions",
 "Monetized Playbacks",
 "End screen element clicks",
 "Card clicks",
 "Cards shown",
 "Clicks per card shown (%)",
 "Card %",
 "Teaser Clicks",
 "Teaser Impr",
 "Teaser %",
 "Hypes",
 "Hype points",
 "Remix count",
 "Remixes of Your Content",
 "Remix views",
 "Shorts Funnel Percent Watched",
 "Shorts Funnel Swipe Away Rate",
]

const MASTER_HEADER_ALIAS_LOOKUP = (() => {
 const map = new Map<string, string>()
 Object.entries(MASTER_HEADER_ALIASES).forEach(([canonical, aliases]) => {
  map.set(canonicalDisplayKey(canonical), canonical)
  aliases.forEach((alias) => map.set(canonicalDisplayKey(alias), canonical))
 })
 return map
})()

export const getCanonicalMasterHeader = (header: string): string => {
 if (MASTER_HEADER_ALIASES[header]) return header
 const strict = MASTER_HEADER_ALIAS_LOOKUP.get(canonicalDisplayKey(header))
 if (strict) return strict
 const normalized = canonicalKey(header)
 for (const [canonical, aliases] of Object.entries(MASTER_HEADER_ALIASES)) {
  if (aliases.includes(normalized)) return canonical
 }
 return header
}

export const getShortMasterHeader = (header: string): string => {
 const canonical = getCanonicalMasterHeader(header)
 return MASTER_TABLE_SHORT_LABELS[canonical] || MASTER_TABLE_SHORT_LABELS[header] || canonical
}

export const findDuplicateShortHeaders = (headers: string[]): string[] => {
 const counts = new Map<string, number>()
 headers.forEach((header) => {
  const short = getShortMasterHeader(header)
  counts.set(short, (counts.get(short) || 0) + 1)
 })
 return Array.from(counts.entries())
  .filter(([, count]) => count > 1)
  .map(([label]) => label)
}

export const firstDefined = (
 row: Record<string, unknown>,
 keys: string[],
): unknown => {
 for (const key of keys) {
  if (
   row[key] !== undefined &&
   row[key] !== null &&
   textFromUnknown(row[key]).trim() !== ""
  ) {
   return row[key]
  }
 }
 return undefined
}

export const getMetric = (
 row: Record<string, unknown>,
 keys: string[],
): number => numberFromUnknown(firstDefined(row, keys))

export const getMetricByPattern = (
 row: Record<string, unknown>,
 exactKeys: string[],
 containsAny: string[],
): number => {
 const exact = getMetric(row, exactKeys)
 if (exact > 0) return exact

 const match = Object.entries(row).find(([key]) => {
  const lower = key.toLowerCase()
  return containsAny.some((pattern) => lower.includes(pattern))
 })

 return match ? numberFromUnknown(match[1]) : 0
}

export const getViews = (row: Record<string, unknown>): number =>
 getMetricByPattern(
  row,
  ["Views", "View count", "Engaged views", "Engaged Views"],
  ["view"],
 )

export const getWatchHours = (row: Record<string, unknown>): number => {
 // Try abbreviated names first (from normalized data)
 const abbrHours = getMetric(row, ["Watch Hrs", "watchHrs"])
 if (abbrHours > 0) return abbrHours

 const abbrMinutes = getMetric(row, ["Watch Min", "watchMin"])
 if (abbrMinutes > 0) return abbrMinutes / 60

 // Try full names
 const hours = getMetric(row, [
  "Watch Time (Hours)",
  "Watch time (hours)",
  "Watch Hours",
  "Watch time",
  "Watch Time",
 ])
 if (hours > 0) return hours

 const minutes = getMetric(row, [
  "Watch time (minutes)",
  "Estimated minutes watched",
  "estimatedMinutesWatched",
 ])
 if (minutes > 0) return minutes / 60

 const seconds = getMetric(row, [
  "Watch Time (Seconds)",
  "Watch time (seconds)",
  "Estimated watch time (seconds)",
  "averageViewDuration",
 ])
 return seconds > 0 ? seconds / 3600 : 0
}

export const getSubscribers = (row: Record<string, unknown>): number => {
 // Try abbreviated name first (from normalized data)
 const abbr = getMetric(row, ["Subs +", "subs+"])
 if (abbr > 0) return abbr

 return getMetricByPattern(
  row,
  [
   "Subscribers Gained",
   "Subscribers gained",
   "Subscribers",
   "subscribersGained",
  ],
  ["subscriber"],
 )
}

export const getRevenue = (row: Record<string, unknown>): number =>
 getMetricByPattern(
  row,
  [
   "Revenue",
   "Estimated revenue",
   "Estimated revenue (USD)",
   "Your estimated revenue (USD)",
   "estimatedRevenue",
  ],
  ["revenue"],
 )

export const getRpm = (row: Record<string, unknown>): number =>
 getMetricByPattern(
  row,
  ["RPM", "RPM (USD)", "Estimated RPM", "Revenue per mille (RPM)"],
  ["rpm"],
 )

export const getImpressions = (row: Record<string, unknown>): number => {
 const resolved = resolveImpressions(row)
 if (resolved.value !== null && resolved.value > 0) return resolved.value
 // Last-chance alias pattern matching for odd CSV headers.
 return getMetricByPattern(row, [], ["impression"])
}

export const getCtr = (row: Record<string, unknown>): number => {
 const resolved = resolveCtrPercent(row)
 if (resolved.value !== null && resolved.value > 0) return resolved.value
 return 0
}

export const getLikes = (row: Record<string, unknown>): number => {
 const likes = getMetric(row, ["Likes", "likeCount", "Likes count"])
 if (likes > 0) return likes
 return getMetricByPattern(row, [], ["like"])
}

export const getDislikes = (row: Record<string, unknown>): number => {
 const dislikes = getMetric(row, ["Dislikes", "dislikeCount", "Dislikes count"])
 if (dislikes > 0) return dislikes
 return getMetricByPattern(row, [], ["dislike"])
}

export const getComments = (row: Record<string, unknown>): number => {
 const comments = getMetric(row, ["Comments", "commentCount", "Comments count"])
 if (comments > 0) return comments
 return getMetricByPattern(row, [], ["comment"])
}

export const getShares = (row: Record<string, unknown>): number => {
 // Try various column name variations including abbreviated names
 const shares = getMetric(row, [
  "Shares",
  "shareCount",
  "Shares count",
  "shares",
 ])
 if (shares > 0) return shares
 return getMetricByPattern(row, [], ["share"])
}

export const getAvdSeconds = (row: Record<string, unknown>): number =>
 getMetricByPattern(
  row,
  ["AVD (Sec)", "Average view duration", "averageViewDuration"],
  ["view duration"],
 )

export const getAvpPercent = (row: Record<string, unknown>): number => {
 const raw = getMetricByPattern(
  row,
  ["AVP (%)", "Average percentage viewed (%)", "averageViewPercentage"],
  ["averageviewpercentage", "percentage viewed", "avp"],
 )
 return raw > 0 && raw <= 1 ? raw * 100 : raw
}

export const getDateLabel = (row: Record<string, unknown>): string =>
 textFromUnknown(
  firstDefined(row, ["Date", "Day", "Publish Date", "publishedAt"]),
 ).trim()

export const getTitle = (row: Record<string, unknown>, index: number): string =>
 textFromUnknown(
  firstDefined(row, ["Video title", "Dimension", "Title", "Video", "Content"]),
 ) || `Row ${index + 1}`

export const parseDate = (value: string): Date | null => {
 const trimmed = value.trim()
 if (!trimmed) return null

 // Handle various date formats
 let dateStr = trimmed

 // If it looks like a simple date (YYYY-MM-DD), use it directly
 if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
  dateStr = trimmed
 } else if (trimmed.includes("T")) {
  // ISO format - use first 10 chars
  dateStr = trimmed.substring(0, 10)
 } else {
  // Try to extract a date pattern
  const match = trimmed.match(/(\d{4}-\d{2}-\d{2})/)
  if (match) {
   dateStr = match[1]
  } else {
   // Try using the whole string
   dateStr = trimmed
  }
 }

 const next = new Date(dateStr)
 if (Number.isNaN(next.getTime())) return null

 // Validate the date is reasonable (not before 2000 or after 2100)
 const year = next.getFullYear()
 if (year < 2000 || year > 2100) return null

 return next
}

export const formatDateWindow = (dates: Date[]): string => {
 if (dates.length === 0) return "No date range available"
 const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime())
 const start = sorted[0]
 const end = sorted[sorted.length - 1]
 const format = (date: Date) =>
  date.toLocaleDateString(undefined, {
   month: "short",
   day: "numeric",
   year: "numeric",
  })

 if (start.toDateString() === end.toDateString()) return format(start)
 return `${format(start)} - ${format(end)}`
}

export const applySummaryFallbackToRows = (
 rows: UnifiedRow[],
 summary: SourceSummary,
): UnifiedRow[] => {
 if (rows.length === 0) return rows

 const totalViews = rows.reduce((sum, row) => sum + getViews(row), 0)
 if (totalViews <= 0) return rows

 const totalWatch = rows.reduce((sum, row) => sum + getWatchHours(row), 0)
 const totalSubscribers = rows.reduce(
  (sum, row) => sum + getSubscribers(row),
  0,
 )
 const totalRevenue = rows.reduce((sum, row) => sum + getRevenue(row), 0)
 const totalCtr = rows.reduce((sum, row) => sum + getCtr(row), 0)
 const totalRpm = rows.reduce((sum, row) => sum + getRpm(row), 0)
 const totalImpressions = rows.reduce(
  (sum, row) => sum + getImpressions(row),
  0,
 )
 const totalAvd = rows.reduce((sum, row) => sum + getAvdSeconds(row), 0)
 const totalAvp = rows.reduce((sum, row) => sum + getAvpPercent(row), 0)

 const needsWatchBackfill = totalWatch <= 0 && summary.watchHours > 0
 const needsSubscriberBackfill =
  totalSubscribers <= 0 && summary.subscribers > 0
 const needsRevenueBackfill = totalRevenue <= 0 && summary.revenue > 0
 const needsCtrBackfill = false
 const needsRpmBackfill =
  totalRpm <= 0 && summary.views > 0 && summary.revenue > 0
 const needsImpressionsBackfill = false
 const needsAvdBackfill =
  totalAvd <= 0 && summary.watchHours > 0 && summary.views > 0
 const needsAvpBackfill = totalAvp <= 0
 const summaryRpm =
  summary.views > 0 ? (summary.revenue / summary.views) * 1000 : 0
 const summaryCtr = 0
 const summaryAvdSeconds =
  summary.views > 0 ? (summary.watchHours * 3600) / summary.views : 0

 if (
  !needsWatchBackfill &&
  !needsSubscriberBackfill &&
  !needsRevenueBackfill &&
  !needsCtrBackfill &&
  !needsRpmBackfill &&
  !needsImpressionsBackfill &&
  !needsAvdBackfill &&
  !needsAvpBackfill
 ) {
  return rows
 }

 return rows.map((row) => {
  const rowViews = getViews(row)
  const share = totalViews > 0 ? rowViews / totalViews : 0
  const currentWatch = getWatchHours(row)
  const currentSubscribers = getSubscribers(row)
  const currentRevenue = getRevenue(row)
  const currentCtr = getCtr(row)
  const currentRpm = getRpm(row)
  const currentImpressions = getImpressions(row)
  const currentAvd = getAvdSeconds(row)
  const currentAvp = getAvpPercent(row)
  const finalCtr = currentCtr > 0 || !needsCtrBackfill ? currentCtr : 0
  const finalWatchHours =
   currentWatch > 0 || !needsWatchBackfill
    ? currentWatch
    : Number((summary.watchHours * share).toFixed(3))
  const finalAvd =
   currentAvd > 0 || !needsAvdBackfill
    ? currentAvd
    : finalWatchHours > 0 && rowViews > 0
      ? (finalWatchHours * 3600) / rowViews
      : summaryAvdSeconds
  const finalImpressions =
   currentImpressions > 0 || !needsImpressionsBackfill ? currentImpressions : 0
  const finalAvp =
   currentAvp > 0 || !needsAvpBackfill
    ? currentAvp
    : finalAvd > 0
      ? Math.min(
         100,
         Math.max(
          0,
          (finalAvd / Math.max(finalAvd, summaryAvdSeconds || finalAvd)) * 100,
         ),
        )
      : 0

  return {
   ...row,
   "Watch Time (Hours)": finalWatchHours,
   "Watch time (hours)": finalWatchHours,
   "Estimated minutes watched":
    finalWatchHours > 0 ? Number((finalWatchHours * 60).toFixed(3)) : 0,
   "Subscribers Gained":
    currentSubscribers > 0 || !needsSubscriberBackfill
     ? currentSubscribers
     : Number((summary.subscribers * share).toFixed(3)),
   Subscribers:
    currentSubscribers > 0 || !needsSubscriberBackfill
     ? currentSubscribers
     : Number((summary.subscribers * share).toFixed(3)),
   Revenue:
    currentRevenue > 0 || !needsRevenueBackfill
     ? currentRevenue
     : Number((summary.revenue * share).toFixed(3)),
   "Estimated revenue":
    currentRevenue > 0 || !needsRevenueBackfill
     ? currentRevenue
     : Number((summary.revenue * share).toFixed(3)),
   "Your estimated revenue (USD)":
    currentRevenue > 0 || !needsRevenueBackfill
     ? currentRevenue
     : Number((summary.revenue * share).toFixed(3)),
   Impressions: finalImpressions > 0 ? Number(finalImpressions.toFixed(0)) : 0,
   "CTR (%)": finalCtr,
   "Impressions click-through rate (%)": finalCtr,
   "AVD (Sec)": finalAvd > 0 ? Number(finalAvd.toFixed(3)) : 0,
   "Average view duration": finalAvd > 0 ? Number(finalAvd.toFixed(3)) : 0,
   "AVP (%)": finalAvp > 0 ? Number(finalAvp.toFixed(3)) : 0,
   "Average percentage viewed (%)":
    finalAvp > 0 ? Number(finalAvp.toFixed(3)) : 0,
   RPM:
    currentRpm > 0 || !needsRpmBackfill
     ? currentRpm
     : Number(summaryRpm.toFixed(3)),
  }
 })
}

export const reportToRows = (
 report:
  | { columnHeaders?: Array<{ name?: string }>; rows?: unknown[][] }
  | null
  | undefined,
 prefix: string,
 sourceLabel: string,
): UnifiedRow[] => {
 if (
  !report ||
  !Array.isArray(report.columnHeaders) ||
  !Array.isArray(report.rows)
 )
  return []
 const headers = report.columnHeaders.map((item, index) =>
  String(item?.name ?? `col_${index}`),
 )
 if (headers.length === 0 || report.rows.length === 0) return []

 return report.rows.map((rowValues: any, index) => {
  const rowObj: Record<string, unknown> = {}
  if (Array.isArray(rowValues)) {
   headers.forEach((header, headerIndex) => {
    rowObj[header] = rowValues[headerIndex]
   })
  } else if (rowValues && typeof rowValues === "object") {
   headers.forEach((header) => {
    rowObj[header] = (rowValues as Record<string, unknown>)[header]
   })
   Object.assign(rowObj, rowValues as Record<string, unknown>)
  }
  return {
   ...rowObj,
   _id: `${prefix}-${index}`,
   _sourceFile: sourceLabel,
   _userTag: "analytics",
  } as UnifiedRow
 })
}

export const flattenCsvRows = (files: CsvFileWithTag[]): UnifiedRow[] =>
 buildUnifiedRowsFromCsvFiles(files) as UnifiedRow[]

export const buildCsvFromRows = (rows: UnifiedRow[]): string => {
 if (rows.length === 0) return ""
 const headers = Array.from(
  new Set(
   rows.flatMap((row) =>
    Object.keys(row).filter((key) => !key.startsWith("_")),
   ),
  ),
 )

 const lines = [headers.join(",")]
 rows.forEach((row) => {
  const line = headers
   .map((header) => {
    const raw = row[header as keyof UnifiedRow]
    if (raw == null) return '""'
    const text = textFromUnknown(raw).replace(/"/g, '""')
    return `"${text}"`
   })
   .join(",")
  lines.push(line)
 })

 return lines.join("\n")
}
