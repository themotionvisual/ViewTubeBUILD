import type { CsvFileWithTag, CsvTag, CsvUploadType } from "../types"
import { normalizeRow } from "./dataNormalization"
import {
 buildCsvFilesWithTags,
 classifyCsvExportKind,
 detectContentTagFromRows,
 expandCsvAndZipFiles,
 extractDateRangeFromName,
 inferAnalyticsWindowFromName,
 inferTagFromPath,
 isLikelyTotalCsvRow,
 parseCSV,
} from "./csvPackageIngestion"
import { getCsvTagColorClass } from "./csvTaxonomy"
export { getCsvTagColorClass } from "./csvTaxonomy"
export {
 buildCsvFilesWithTags,
 classifyCsvExportKind,
 detectContentTagFromRows,
 expandCsvAndZipFiles,
 extractDateRangeFromName,
 inferAnalyticsWindowFromName,
 inferTagFromPath,
 isLikelyTotalCsvRow,
 parseCSV,
} from "./csvPackageIngestion"
import { toNumber, toText, hasValue, parseDurationSeconds } from "./dataUtils"

// ==========================================
// TYPES & SCHEMAS
// ==========================================

export type DataForgeRow = Record<string, unknown> & {
 _id?: string
 _sourceFile?: string
 _folderName?: string
 _featureName?: string
 _dateRange?: string
 _userTag?: string
 titleLength?: number
 engagementRate?: number
 adjustedAVP?: number
 thumbnailImpressions?: number
 thumbnailCtr?: number
 premiumViews?: number
 premiumWatchTime?: number
 viewerLoggedInPct?: number
 cardCtr?: number
 adImpressions?: number
 monetizedPlaybacks?: number
 grossRevenue?: number
 adRevenue?: number
 cpm?: number
 relativeRetention?: number
}

export interface DataForgeIngestResult {
 rows: DataForgeRow[]
 totalBeforeDedupe: number
 dedupeRemoved: number
 sourceCounts: {
  csv: number
  analytics: number
  manual: number
 }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

const firstDefinedNumber = (
 row: Record<string, unknown>,
 keys: string[],
): number | undefined => {
 for (const key of keys) {
  if (!hasValue(row[key])) continue
  return toNumber(row[key])
 }
 return undefined
}

const firstNumber = (row: Record<string, unknown>, keys: string[]): number => {
 for (const key of keys) {
  const value = toNumber(row[key])
  if (value !== 0) return value
 }
 return 0
}

const firstText = (row: Record<string, unknown>, keys: string[]): string => {
 for (const key of keys) {
  const value = toText(row[key]).trim()
  if (value) return value
 }
 return ""
}

// ==========================================
// CSV PARSING & PROCESSING
// ==========================================

// ==========================================
// NORMALIZATION & ENRICHMENT
// ==========================================

export const normalizeAndEnrichRow = (
 rawRow: Record<string, unknown>,
): DataForgeRow => {
 const normalized = normalizeRow(rawRow as Record<string, any>) as Record<
  string,
  unknown
 >
 const base = { ...rawRow, ...normalized } as DataForgeRow

 let views =
  firstDefinedNumber(base, [
   "Views",
   "View count",
   "Engaged views",
   "Engaged Views",
  ]) ?? 0
 if (views <= 0) {
  const uniqueViewers =
   firstDefinedNumber(base, [
    "Unique viewers",
    "Unique Viewers",
    "uniqueViewers",
   ]) ?? 0
  const avgViewsPerViewer =
   firstDefinedNumber(base, [
    "Average views per viewer",
    "averageViewsPerViewer",
   ]) ?? 0
  if (uniqueViewers > 0 && avgViewsPerViewer > 0) {
   views = uniqueViewers * avgViewsPerViewer
  }
 }
 const likes = firstDefinedNumber(base, ["Likes", "likeCount"]) ?? 0
 const comments =
  firstDefinedNumber(base, ["Comments", "commentCount", "Comments added"]) ?? 0
 const subscribers =
  firstDefinedNumber(base, [
   "Subscribers Gained",
   "Subscribers gained",
   "Subscribers",
   "subscribersGained",
  ]) ?? 0

 let watchHours =
  firstDefinedNumber(base, [
   "Watch Time (Hours)",
   "Watch time (hours)",
   "Watch Hours",
   "Watch time",
  ]) ?? 0
 if (watchHours <= 0) {
  const watchMinutes =
   firstDefinedNumber(base, [
    "Estimated minutes watched",
    "estimatedMinutesWatched",
   ]) ?? 0
  if (watchMinutes > 0) watchHours = watchMinutes / 60
 }

 let avdSeconds =
  firstDefinedNumber(base, [
   "AVD (Sec)",
   "Average view duration",
   "averageViewDuration",
  ]) ?? 0
 if (avdSeconds <= 0 && watchHours > 0 && views > 0) {
  avdSeconds = (watchHours * 3600) / views
 }
 if (watchHours <= 0 && avdSeconds > 0 && views > 0) {
  watchHours = (avdSeconds * views) / 3600
 }

 const durationSeconds = parseDurationSeconds(
  firstText(base, ["Duration", "Duration (sec)", "durationRaw"]) ||
   (firstDefinedNumber(base, ["durationSeconds", "Duration Seconds"]) ?? 0),
 )

 let rawAvp =
  firstDefinedNumber(base, [
   "AVP (%)",
   "averageViewPercentage",
   "Average percentage viewed (%)",
  ]) ?? 0
 if (rawAvp > 0 && rawAvp <= 1) rawAvp *= 100
 if (rawAvp <= 0 && avdSeconds > 0 && durationSeconds > 0) {
  rawAvp = (avdSeconds / durationSeconds) * 100
 }
 const adjustedAVP = Math.min(Math.max(0, rawAvp), 200)

 let ctr =
  firstDefinedNumber(base, [
   "CTR (%)",
   "Impressions click-through rate (%)",
   "impressionClickThroughRate",
  ]) ?? 0
 if (ctr > 0 && ctr <= 1) ctr *= 100

 let impressions = firstDefinedNumber(base, ["Impressions", "impressions"]) ?? 0

 // Cross-compute exact impressions if one metric exists
 if (ctr <= 0 && impressions > 0 && views > 0) ctr = (views / impressions) * 100
 if (impressions <= 0 && ctr > 0 && views > 0) impressions = views / (ctr / 100)

 let shares = firstDefinedNumber(base, ["Shares", "shareCount"]) ?? 0

 let revenue =
  firstDefinedNumber(base, [
   "Revenue",
   "Estimated revenue",
   "Estimated revenue (USD)",
   "Your estimated revenue (USD)",
   "estimatedRevenue",
  ]) ?? 0
 let rpm =
  firstDefinedNumber(base, [
   "RPM",
   "RPM (USD)",
   "Estimated RPM",
   "Revenue per mille (RPM)",
  ]) ?? 0
 if (rpm <= 0 && revenue > 0 && views > 0) rpm = (revenue / views) * 1000
 if (revenue <= 0 && rpm > 0 && views > 0) revenue = (rpm * views) / 1000

 const engagementRate =
  views > 0 ?
   Number(Math.max(0, ((likes + comments + shares) / views) * 100).toFixed(1))
  : 0

 const engagedViews =
  firstDefinedNumber(base, ["Engaged views", "Engaged Views"]) ?? 0
 const dislikes = firstDefinedNumber(base, ["Dislikes", "dislikes"]) ?? 0
 const stw = views > 0 ? (engagedViews / views) * 100 : 0

 const title = firstText(base, ["Video title", "Video", "Dimension"])
 const titleLength = title.length

 // Advanced Reach & Context
 const thumbnailImpressions =
  firstDefinedNumber(base, [
   "videoThumbnailImpressions",
   "Thumbnail impressions",
  ]) ?? 0
 const thumbnailCtr =
  firstDefinedNumber(base, [
   "videoThumbnailImpressionsClickRate",
   "Thumbnail CTR (%)",
  ]) ?? 0
 const viewerLoggedInPct =
  firstDefinedNumber(base, ["viewerPercentage", "Logged-in viewers %"]) ?? 0

 // Playlists & Premium
 const playlistAdds =
  firstDefinedNumber(base, ["videosAddedToPlaylists", "Playlist adds"]) ?? 0
 const playlistRemoves =
  firstDefinedNumber(base, [
   "videosRemovedFromPlaylists",
   "Playlist removes",
  ]) ?? 0
 const premiumViews =
  firstDefinedNumber(base, ["redViews", "Premium views"]) ?? 0
 const premiumWatchTime =
  firstDefinedNumber(base, [
   "estimatedRedMinutesWatched",
   "Premium watch time (min)",
  ]) ?? 0

 // Cards & Engagement
 const cardCtr =
  firstDefinedNumber(base, ["cardClickRate", "Card CTR (%)"]) ?? 0
 const annotationCtr =
  firstDefinedNumber(base, [
   "annotationClickThroughRate",
   "Annotation CTR (%)",
  ]) ?? 0

 // Ad Performance & Deep Revenue
 const adImpressions =
  firstDefinedNumber(base, ["adImpressions", "Ad impressions"]) ?? 0
 const monetizedPlaybacks =
  firstDefinedNumber(base, ["monetizedPlaybacks", "Monetized playbacks"]) ?? 0
 const grossRevenue =
  firstDefinedNumber(base, ["grossRevenue", "Gross revenue (USD)"]) ?? 0
 const adRevenue =
  firstDefinedNumber(base, ["estimatedAdRevenue", "Ad revenue (USD)"]) ?? 0
 const cpm = firstDefinedNumber(base, ["cpm", "CPM (USD)"]) ?? 0

 // Retention Intelligence
 const relativeRetention =
  firstDefinedNumber(base, [
   "relativeRetentionPerformance",
   "Relative retention score",
  ]) ?? 0

 return {
  ...base,
  Views: views,
  Likes: likes,
  Comments: comments,
  Shares: shares,
  Impressions: impressions,
  "Watch Time (Hours)": watchHours,
  "Watch time (hours)": watchHours,
  "Estimated minutes watched": watchHours > 0 ? watchHours * 60 : 0,
  "Subscribers Gained": subscribers,
  Subscribers: subscribers,
  "AVD (Sec)": avdSeconds,
  "Average view duration": avdSeconds,
  "AVP (%)": adjustedAVP,
  "Average percentage viewed (%)": adjustedAVP,
  "CTR (%)": ctr,
  "Impressions click-through rate (%)": ctr,
  Revenue: revenue,
  "Estimated revenue": revenue,
  "Your estimated revenue (USD)": revenue,
  RPM: rpm,
  adjustedAVP,
  thumbnailImpressions,
  thumbnailCtr,
  premiumViews,
  premiumWatchTime,
  viewerLoggedInPct,
  cardCtr,
  annotationCtr,
  adImpressions,
  monetizedPlaybacks,
  grossRevenue,
  adRevenue,
  cpm,
  relativeRetention,
  playlistAdds,
  playlistRemoves,
  engagementRate,
  engagedViews,
  dislikes,
  stw,
  titleLength,
 }
}

// ==========================================
// MERGING & DEDUPLICATION
// ==========================================

const compositeKey = (row: Record<string, unknown>): string => {
 const videoId = firstText(row, ["Video ID", "videoId", "Dimension", "Video"])
 const date = firstText(row, ["Date", "Video publish time", "publishedAt"])
 if (videoId && date) return `${videoId}|${date}`
 const fallbackTitle = firstText(row, ["Video title", "Video", "Dimension"])
 return `${videoId || fallbackTitle}|${date || "nodate"}`
}

const isLikelyVideoId = (value: unknown): boolean => {
 const text = toText(value).trim()
 return /^[A-Za-z0-9_-]{8,}$/.test(text) && !text.includes(" ")
}

const rowCompletenessScore = (row: Record<string, unknown>): number => {
 let score = 0
 if (firstNumber(row, ["Views", "View count", "Engaged views"]) > 0) score += 2
 if (firstNumber(row, ["Impressions", "impressions"]) > 0) score += 1
 if (
  firstNumber(row, [
   "Watch Time (Hours)",
   "Watch time (hours)",
   "Estimated minutes watched",
  ]) > 0
 )
  score += 1
 if (
  firstNumber(row, [
   "AVD (Sec)",
   "Average view duration",
   "averageViewDuration",
  ]) > 0
 )
  score += 1
 if (
  firstNumber(row, [
   "AVP (%)",
   "Average percentage viewed (%)",
   "averageViewPercentage",
  ]) > 0
 )
  score += 1
 if (
  firstNumber(row, [
   "CTR (%)",
   "Impressions click-through rate (%)",
   "impressionClickThroughRate",
  ]) > 0
 )
  score += 1
 if (
  firstNumber(row, [
   "Revenue",
   "Estimated revenue",
   "Your estimated revenue (USD)",
   "estimatedRevenue",
  ]) > 0
 )
  score += 1
 if (firstNumber(row, ["RPM", "RPM (USD)", "Estimated RPM"]) > 0) score += 1
 if (firstNumber(row, ["Likes", "Comments", "Shares"]) > 0) score += 1
 if (
  firstNumber(row, [
   "Subscribers Gained",
   "Subscribers gained",
   "Subscribers",
  ]) > 0
 )
  score += 1
 if (isLikelyVideoId(firstText(row, ["Video ID", "videoId", "Dimension"])))
  score += 1
 return score
}

const shouldTakeSecondaryValue = (
 key: string,
 primary: unknown,
 secondary: unknown,
): boolean => {
 if (!hasValue(primary) && hasValue(secondary)) return true
 if (!hasValue(secondary)) return false

 if (key === "Video ID" || key === "videoId") {
  return !isLikelyVideoId(primary) && isLikelyVideoId(secondary)
 }
 if (key === "Dimension") {
  if (!isLikelyVideoId(primary) && isLikelyVideoId(secondary)) return true
 }

 const numericLike = (value: unknown): boolean => {
  if (typeof value === "number") return Number.isFinite(value)
  if (typeof value !== "string") return false
  const text = value.trim()
  if (!text) return false
  return /[0-9]/.test(text)
 }

 if (numericLike(primary) && numericLike(secondary)) {
  const primaryNum = toNumber(primary)
  const secondaryNum = toNumber(secondary)
  if (primaryNum === 0 && secondaryNum !== 0) return true
  return false
 }

 const primaryText = toText(primary).trim()
 const secondaryText = toText(secondary).trim()
 if (!primaryText && !!secondaryText) return true
 if (
  key === "_sourceFile" &&
  primaryText &&
  secondaryText &&
  primaryText !== secondaryText
 )
  return true
 return false
}

const mergeDuplicateRows = (
 existing: Record<string, unknown>,
 incoming: Record<string, unknown>,
): Record<string, unknown> => {
 const existingScore = rowCompletenessScore(existing)
 const incomingScore = rowCompletenessScore(incoming)

 let primary = existing
 let secondary = incoming

 if (incomingScore > existingScore) {
  primary = incoming
  secondary = existing
 } else if (
  incomingScore === existingScore &&
  toNumber(incoming.Views ?? 0) > toNumber(existing.Views ?? 0)
 ) {
  primary = incoming
  secondary = existing
 }

 const merged: Record<string, unknown> = { ...primary }
 Object.keys(secondary).forEach((key) => {
  const primaryValue = merged[key]
  const secondaryValue = secondary[key]
  if (shouldTakeSecondaryValue(key, primaryValue, secondaryValue)) {
   merged[key] = secondaryValue
  }
 })

 const primarySource = toText(primary._sourceFile).trim()
 const secondarySource = toText(secondary._sourceFile).trim()
 if (primarySource && secondarySource && primarySource !== secondarySource) {
  merged._sourceFile = `${primarySource} + ${secondarySource}`
 }

 return normalizeAndEnrichRow(merged)
}

export const dedupeByVideoDate = <T extends Record<string, unknown>>(
 rows: T[],
): T[] => {
 const map = new Map<string, T>()

 rows.forEach((row) => {
  const key = compositeKey(row)
  const existing = map.get(key)
  if (!existing) {
   map.set(key, row)
   return
  }

  const merged = mergeDuplicateRows(existing, row) as T
  map.set(key, merged)
 })

 return Array.from(map.values())
}

// ==========================================
// UNIFIED INGESTION ENGINE
// ==========================================

export const buildUnifiedRowsFromCsvFiles = (
 files: CsvFileWithTag[],
): DataForgeRow[] => {
 const rows: DataForgeRow[] = []
 files.forEach((file) => {
  ;(file.data ?? []).forEach((row, index) => {
   const enriched = normalizeAndEnrichRow(row)
   rows.push({
    ...enriched,
    _id: `${file.id}-${index}`,
    _sourceFile: file.name || "CSV Upload",
    _userTag: file.tag || "unknown",
   })
  })
 })
 return dedupeByVideoDate(rows)
}

export const mergeAndDedupeRows = (rows: DataForgeRow[]): DataForgeRow[] => {
 return dedupeByVideoDate(rows.map((row) => normalizeAndEnrichRow(row)))
}

export const ingestUnifiedRows = (params: {
 csvFiles?: CsvFileWithTag[]
 analyticsRows?: Record<string, unknown>[]
 manualRows?: Record<string, unknown>[]
}): DataForgeIngestResult => {
 const csvRows =
  params.csvFiles ? buildUnifiedRowsFromCsvFiles(params.csvFiles) : []
 const analyticsRows = (params.analyticsRows || []).map((row, index) => ({
  ...normalizeAndEnrichRow(row),
  _id: `analytics-${index}`,
  _sourceFile: "YouTube API",
 }))
 const manualRows = (params.manualRows || []).map((row, index) => ({
  ...normalizeAndEnrichRow(row),
  _id: `manual-${index}`,
  _sourceFile: "Manual Input",
 }))

 const merged = [...csvRows, ...analyticsRows, ...manualRows]
 const rows = dedupeByVideoDate(merged)
 const totalBeforeDedupe = merged.length

 return {
  rows,
  totalBeforeDedupe,
  dedupeRemoved: totalBeforeDedupe - rows.length,
  sourceCounts: {
   csv: csvRows.length,
   analytics: analyticsRows.length,
   manual: manualRows.length,
  },
 }
}

export const buildCsvFromRows = (rows: DataForgeRow[]): string => {
 if (!rows.length) return ""
 const headers = Object.keys(rows[0])
 const lines = [
  headers.join(","),
  ...rows.map((row) =>
   headers.map((header) => JSON.stringify(row[header] ?? "")).join(","),
  ),
 ]
 return lines.join("\n")
}
