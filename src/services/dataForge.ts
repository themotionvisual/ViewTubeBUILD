import type { CsvFileWithTag } from "../types"
import { normalizeRow } from "./dataNormalization"

export type DataForgeRow = Record<string, unknown> & {
 _id?: string
 _sourceFile?: string
 _userTag?: string
 titleLength?: number
 engagementRate?: number
 adjustedAVP?: number
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

const toNumber = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return 0
 const cleaned = value.replace(/[^0-9.-]/g, "")
 const parsed = Number(cleaned)
 return Number.isFinite(parsed) ? parsed : 0
}

const hasValue = (value: unknown): boolean => {
 if (value == null) return false
 if (typeof value === "string") return value.trim() !== ""
 if (typeof value === "number") return Number.isFinite(value)
 return true
}

const toText = (value: unknown): string => {
 if (typeof value === "string") return value
 if (typeof value === "number") return String(value)
 if (value == null) return ""
 return String(value)
}

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

const parseDurationSeconds = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 const raw = toText(value)
 if (!raw) return 0

 if (/^PT/.test(raw)) {
  const match = raw.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = Number(match[1] || 0)
  const minutes = Number(match[2] || 0)
  const seconds = Number(match[3] || 0)
  return hours * 3600 + minutes * 60 + seconds
 }

 if (raw.includes(":")) {
  const parts = raw.split(":").map((p) => Number(p) || 0)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
 }

 return toNumber(raw)
}

export const normalizeAndEnrichRow = (
 rawRow: Record<string, unknown>,
): DataForgeRow => {
 const normalized = normalizeRow(rawRow as Record<string, any>) as Record<
  string,
  unknown
 >
 const base = { ...rawRow, ...normalized } as DataForgeRow

 const views =
  firstDefinedNumber(base, [
   "Views",
   "View count",
   "Engaged views",
   "Engaged Views",
  ]) ?? 0
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
 // No cross-calculation: keep raw values only
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
  views > 0
   ? Number(Math.max(0, ((likes + comments + shares) / views) * 100).toFixed(1))
   : 0

 const title = firstText(base, ["Video title", "Video", "Dimension"])
 const titleLength = title.length

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
  engagementRate,
  titleLength,
 }
}

const compositeKey = (row: Record<string, unknown>): string => {
 const videoId = firstText(row, ["Video ID", "videoId", "Dimension", "Video"])
 const date = firstText(row, ["Date", "Video publish time", "publishedAt"])
 if (videoId && date) return `${videoId}|${date}`
 const fallbackTitle = firstText(row, ["Video title", "Video", "Dimension"])
 return `${videoId || fallbackTitle}|${date || "nodate"}`
}

const rowViews = (row: Record<string, unknown>): number => {
 return firstNumber(row, ["Views", "View count", "Engaged views"])
}

const numericLike = (value: unknown): boolean => {
 if (typeof value === "number") return Number.isFinite(value)
 if (typeof value !== "string") return false
 const text = value.trim()
 if (!text) return false
 return /[0-9]/.test(text)
}

const isLikelyVideoId = (value: unknown): boolean => {
 const text = toText(value).trim()
 return /^[A-Za-z0-9_-]{8,}$/.test(text) && !text.includes(" ")
}

const rowCompletenessScore = (row: Record<string, unknown>): number => {
 let score = 0
 if (rowViews(row) > 0) score += 2
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
  rowViews(incoming) > rowViews(existing)
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

export const buildUnifiedRowsFromCsvFiles = (
 files: CsvFileWithTag[],
): DataForgeRow[] => {
 const rows: DataForgeRow[] = []

 files.forEach((file) => {
  const fileRows = Array.isArray(file.data) ? file.data : []
  fileRows.forEach((row, index) => {
   const normalized = normalizeAndEnrichRow(row as Record<string, unknown>)
   rows.push({
    ...normalized,
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
 const csvRows = params.csvFiles
  ? buildUnifiedRowsFromCsvFiles(params.csvFiles)
  : []
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
