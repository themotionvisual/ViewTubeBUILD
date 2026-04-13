import JSZip from "jszip"
import type { CsvFileWithTag, CsvTag, CsvUploadType } from "../types"

// ===============================
// CSV IMPORT + TAGGING UTILITIES
// ===============================

const ZIP_MIME_TYPES = new Set([
 "application/zip",
 "application/x-zip-compressed",
])

const CSV_MIME_TYPES = new Set(["text/csv", "application/vnd.ms-excel"])

const getFilePath = (file: File): string => {
 const webkitPath = (file as File & { webkitRelativePath?: string })
  .webkitRelativePath
 return webkitPath && webkitPath.trim().length > 0 ? webkitPath : file.name
}

export const extractDateRangeFromName = (name: string): string => {
 const lowerName = name.toLowerCase()
 const pastDaysMatch = lowerName.match(/(?:past|last)\s+(\d+)\s+days/)
 if (pastDaysMatch) return `Past ${pastDaysMatch[1]} Days`

 if (lowerName.match(/all[\s_]*time/) || lowerName.includes("lifetime"))
  return "All Time"

 const dateMatch = name.match(
  /(\d{4}[-/]\d{2}[-/]\d{2}).*?(\d{4}[-/]\d{2}[-/]\d{2})/,
 )
 if (dateMatch) return `${dateMatch[1]} to ${dateMatch[2]}`

 const textDateMatch = name.match(
  /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s_]+\d{1,2},?[\s_]+\d{4}.*?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s_]+\d{1,2},?[\s_]+\d{4}/i,
 )
 if (textDateMatch) return `${textDateMatch[1]} to ${textDateMatch[2]}`

 return ""
}

export const parseCSV = (text: string): Record<string, unknown>[] => {
 try {
  const lines = text.split("\n").filter((line) => line.trim())
  if (lines.length < 2) return []

  const parseLine = (line: string): string[] => {
   const result: string[] = []
   let current = ""
   let inQuotes = false

   for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
     inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
     result.push(current)
     current = ""
    } else {
     current += char
    }
   }
   result.push(current)
   return result.map((value) => value.trim().replace(/^"|"$/g, ""))
  }

  const headers = parseLine(lines[0])

  return lines.slice(1).map((line) => {
   const values = parseLine(line)
   const row: Record<string, unknown> = {}
   headers.forEach((header, index) => {
    const rawValue = values[index]
    if (rawValue === undefined) return
    const numericCandidate = rawValue.replace(/%/g, "").replace(/,/g, "")
    if (numericCandidate !== "" && !Number.isNaN(Number(numericCandidate))) {
     row[header] = Number(numericCandidate)
    } else {
     row[header] = rawValue
    }
   })
   return row
  })
 } catch {
  return []
 }
}

const csvToNumber = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return 0
 const cleaned = value.replace(/[^0-9.:-]/g, "")
 const parsed = Number(cleaned)
 return Number.isFinite(parsed) ? parsed : 0
}

const durationToSeconds = (duration: unknown): number => {
 if (typeof duration === "number" && Number.isFinite(duration)) return duration
 const raw = String(duration ?? "").trim()
 if (!raw) return 0

 if (raw.includes(":")) {
  const parts = raw.split(":").map((part) => Number(part) || 0)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
 }

 return csvToNumber(raw)
}

const isLikelyTotalRow = (row: Record<string, unknown>): boolean => {
 const firstKey = Object.keys(row)[0]
 if (!firstKey) return false
 return (
  String(row[firstKey] ?? "")
   .trim()
   .toLowerCase() === "total"
 )
}

export const detectContentTagFromRows = (
 rows: Record<string, unknown>[],
): CsvTag | null => {
 if (rows.length === 0) return null

 const dataRows = rows.filter((row) => !isLikelyTotalRow(row))
 if (dataRows.length === 0) return null

 let shortEvidence = 0
 let longEvidence = 0

 dataRows.forEach((row) => {
  const stayedToWatch = csvToNumber(
   row["Stayed to watch (%)"] ?? row["Stayed to watch at 0:30 (%)"] ?? 0,
  )
  const endScreenShown = csvToNumber(row["End screen elements shown"] ?? 0)
  const shortsFeedViews = csvToNumber(
   row["Views from Shorts feed"] ?? row["Shorts feed views"] ?? 0,
  )
  const durationSec = durationToSeconds(
   row["Average view duration"] ?? row["Duration"] ?? 0,
  )

  if (
   stayedToWatch > 0 ||
   shortsFeedViews > 0 ||
   (durationSec > 0 && durationSec <= 180)
  ) {
   shortEvidence += 1
  }
  if (endScreenShown > 0 || durationSec > 180) {
   longEvidence += 1
  }
 })

 const isSingle = dataRows.length === 1
 if (shortEvidence > 0 && longEvidence > 0) return "mixed"
 if (shortEvidence > 0 && longEvidence === 0)
  return isSingle ? "single_short_video" : "shorts"
 if (longEvidence > 0 && shortEvidence === 0)
  return isSingle ? "single_long_video" : "long"
 return null
}

export const inferTagFromPath = (pathLike: string): CsvTag => {
 const path = pathLike.toLowerCase()
 if (path.includes("traffic") || path.includes("source")) return "traffic"
 if (
  path.includes("audience") ||
  path.includes("viewer") ||
  path.includes("subscriber")
 )
  return "audience"
 if (
  path.includes("geography") ||
  path.includes("location") ||
  path.includes("country")
 )
  return "geo"
 if (path.includes("external")) return "external"
 if (path.includes("search term") || path.includes("search")) return "search"
 if (path.includes("daily") || path.includes("date")) return "daily"
 if (path.includes("short")) return "shorts"
 if (path.includes("long") || path.includes("video")) return "long"
 if (path.includes("total") || path.includes("channel") || path.includes("all"))
  return "mixed"
 return "other"
}

export const expandCsvAndZipFiles = async (
 files: File[],
): Promise<{ csvFiles: File[]; extractedDateRange: string }> => {
 const csvFiles: File[] = []
 let extractedDateRange = ""

 for (const file of files) {
  const filePath = getFilePath(file)
  if (!extractedDateRange) {
   extractedDateRange = extractDateRangeFromName(filePath)
  }

  const lowerName = file.name.toLowerCase()
  const isZip = lowerName.endsWith(".zip") || ZIP_MIME_TYPES.has(file.type)
  const isCsv = lowerName.endsWith(".csv") || CSV_MIME_TYPES.has(file.type)

  if (isZip) {
   try {
    const zip = await JSZip.loadAsync(file)
    for (const relativePath in zip.files) {
     const entry = zip.files[relativePath]
     if (entry.dir || !entry.name.toLowerCase().endsWith(".csv")) continue

     if (!extractedDateRange) {
      extractedDateRange = extractDateRangeFromName(entry.name)
     }

     const blob = await entry.async("blob")
     csvFiles.push(
      new File([blob], `${file.name}/${entry.name}`, { type: "text/csv" }),
     )
    }
   } catch (error) {
    console.warn(`Failed to extract zip: ${file.name}`, error)
   }
   continue
  }

  if (isCsv) {
   csvFiles.push(file)
  }
 }

 return { csvFiles, extractedDateRange }
}

export const buildCsvFilesWithTags = async (
 files: File[],
 uploadType: CsvUploadType,
): Promise<CsvFileWithTag[]> => {
 return Promise.all(
  files.map(async (file) => {
   const text = await file.text()
   const data = parseCSV(text)

   let tag: CsvTag
   if (uploadType !== "auto") {
    tag = uploadType
   } else {
    const detected = detectContentTagFromRows(data)
    tag = detected ?? inferTagFromPath(getFilePath(file))
   }

   return {
    id: crypto.randomUUID(),
    name: file.name,
    file,
    data,
    tag,
   }
  }),
 )
}

export const getCsvTagColorClass = (tag: string): string => {
 switch (tag) {
  case "shorts":
   return "bg-[#FF7497] text-white"
  case "long":
   return "bg-[#00CCFF] text-black"
  case "single_long_video":
   return "bg-[#00CCFF] text-black"
  case "single_short_video":
   return "bg-[#FF7497] text-white"
  case "traffic":
   return "bg-[#CCFF00] text-black"
  case "audience":
   return "bg-[#FFB158] text-black"
  case "geo":
   return "bg-[#B14AED] text-white"
  case "mixed":
  case "combined":
   return "bg-[#FFDD00] text-black"
  case "external":
   return "bg-[#24D3FF] text-black"
  case "search":
   return "bg-[#FFE357] text-black"
  case "daily":
   return "bg-[#F8FAFC] text-black"
  default:
   return "bg-white text-black"
 }
}

// ===============================
// NORMALIZATION + UTILS
// ===============================

export const HEADER_MAP: Record<string, string> = {
 // Dimensions
 "Video title": "Dimension",
 Title: "Dimension",
 Video: "Dimension",
 Geography: "Dimension",
 "Traffic source": "Dimension",
 "Device type": "Dimension",
 "Subscription status": "Dimension",
 "Viewer age": "Dimension",
 "Viewer gender": "Dimension",
 Date: "Date",

 // Core Metrics
 Views: "Views",
 "View count": "Views",
 "Watch time (hours)": "Watch Time (Hours)",
 "Watch Time (Hours)": "Watch Time (Hours)",
 "Estimated revenue": "Revenue",
 "Estimated revenue (USD)": "Revenue",
 "Estimated revenue (Local)": "Revenue",
 estimatedRevenue: "Revenue",
 Revenue: "Revenue",
 "Your estimated revenue (USD)": "Revenue",
 RPM: "RPM",
 "RPM (USD)": "RPM",
 CPM: "CPM",
 "CPM (USD)": "CPM",
 Subscribers: "Subscribers Gained",
 "Subscribers gained": "Subscribers Gained",
 subscribersGained: "Subscribers Gained",

 // Engagement
 Impressions: "Impressions",
 "Impressions click-through rate (%)": "CTR (%)",
 impressionClickThroughRate: "CTR (%)",
 "CTR (%)": "CTR (%)",
 "Average view duration": "AVD (Sec)",
 averageViewDuration: "AVD (Sec)",
 "Average view percentage (%)": "AVP (%)",
 averageViewPercentage: "AVP (%)",
 "AVP (%)": "AVP (%)",
 estimatedMinutesWatched: "Watch Time (Hours)",
 Likes: "Likes",
 Dislikes: "Dislikes",
 Comments: "Comments",
 "Comments added": "Comments",
 Shares: "Shares",
 Hypes: "Hypes",
 "Hype points": "Hype Points",

 // Audience
 "Unique viewers": "Unique Viewers",
 "New viewers": "New Viewers",
 "Returning viewers": "Returning Viewers",
 "Casual viewers": "Casual Viewers",
 "Regular viewers": "Regular Viewers",
 "Average views per viewer": "Avg Views Per Viewer",

 // Membership & Shopping
 "Members gained": "Members Gained",
 "Members lost": "Members Lost",
 "Total members": "Total Members",
 "Product clicks": "Product Clicks",
 Orders: "Orders",
}

export const normalizeRow = (row: Record<string, any>): Record<string, any> => {
 const normalized: Record<string, any> = {}

 const lowerHeaderMap = Object.keys(HEADER_MAP).reduce(
  (acc, key) => {
   acc[key.toLowerCase()] = HEADER_MAP[key]
   return acc
  },
  {} as Record<string, string>,
 )

 Object.keys(row).forEach((key) => {
  const val = row[key]
  const lowerKey = key.toLowerCase()
  const standardKey = lowerHeaderMap[lowerKey]

  if (standardKey) {
   if (standardKey === "Dimension" && typeof val === "string") {
    normalized["titleLength"] = val.length
   }
   if (
    typeof val === "string" &&
    standardKey !== "Dimension" &&
    standardKey !== "Date"
   ) {
    // Handle empty or whitespace-only strings
    if (val.trim() === "") {
     normalized[standardKey] = 0
    } else {
     // Clean the string but preserve valid numeric formats
     const cleaned = val.replace(/[^0-9.-]/g, "")
     // Check if the cleaned string is a valid number
     if (cleaned === "" || isNaN(Number(cleaned))) {
      normalized[standardKey] = 0
     } else {
      normalized[standardKey] = Number(cleaned)
     }
    }
   } else {
    normalized[standardKey] = val
   }
   if (lowerKey === "estimatedminuteswatched") {
    normalized[standardKey] = (Number(normalized[standardKey]) || 0) / 60
   }
  } else if (key.startsWith("_")) {
   normalized[key] = val
  } else {
   normalized[key] = val
  }
 })

 return normalized
}

export const getStandardKey = (rawKey: string): string => {
 return HEADER_MAP[rawKey] || rawKey
}

export const METRIC_COLORS: Record<string, string> = {
 Views: "#FF7497",
 Revenue: "#CCFF00",
 "Subscribers Gained": "#00CCFF",
 "Watch Time (Hours)": "#FFDD00",
 "CTR (%)": "#FF00FF",
 "AVP (%)": "#00FFCC",
}

export const generateFileId = (name: string) =>
 `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export const parseCSVLine = (line: string) => {
 const result = []
 let current = ""
 let inQuotes = false
 for (let i = 0; i < line.length; i++) {
  const char = line[i]
  if (char === '"') {
   inQuotes = !inQuotes
  } else if (char === "," && !inQuotes) {
   result.push(current.trim().replace(/^"|"$/g, ""))
   current = ""
  } else {
   current += char
  }
 }
 result.push(current.trim().replace(/^"|"$/g, ""))
 return result
}

export const extractMetadataFromPath = (
 fileName: string,
 folderName: string = "",
) => {
 let featureName = ""
 let dateRange = ""
 const folderParts = folderName.split("/")
 const lastFolder = folderParts[folderParts.length - 1] || fileName

 const dateMatch = lastFolder.match(/(\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2})/)
 if (dateMatch) {
  dateRange = dateMatch[1]
  featureName = lastFolder.split(dateRange)[0].trim()
 } else {
  const match = lastFolder.match(
   /^(.*?)\s*(\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2})?$/,
  )
  if (match) {
   featureName = match[1].trim()
   dateRange = match[2] || ""
  }
 }
 return { featureName, dateRange }
}

export const cleanCSVValue = (val: any) => {
 if (val === "" || val === null || val === undefined) return null

 if (typeof val === "string" && val.includes(":")) {
  const parts = val.split(":").map(Number)
  if (
   parts.length === 3 &&
   !isNaN(parts[0]) &&
   !isNaN(parts[1]) &&
   !isNaN(parts[2])
  ) {
   return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
   return parts[0] * 60 + parts[1]
  }
 }

 const cleanVal = typeof val === "string" ? val.replace(/[$,\s]/g, "") : val
 if (cleanVal !== "" && !isNaN(Number(cleanVal))) {
  return Number(cleanVal)
 }
 return val
}

export const processCSVText = (
 text: string,
 fileName: string,
 folderName: string = "",
 fileId: string = "",
) => {
 if (!text || text.trim().length === 0) return []
 const lines = text.split("\n").filter((l) => l.trim() !== "")
 if (lines.length < 2) return []

 const headers = parseCSVLine(lines[0])
 const data: any[] = []

 for (let i = 1; i < lines.length; i++) {
  const values = parseCSVLine(lines[i])
  const rowObj: any = {}
  let isEmptyRow = true

  for (let j = 0; j < headers.length; j++) {
   const h = headers[j]
   const val = values[j]

   if (val !== undefined && val !== "") {
    rowObj[h] = cleanCSVValue(val)
    if (rowObj[h] !== null) {
     isEmptyRow = false
    }
   } else {
    rowObj[h] = null
   }
  }

  if (!isEmptyRow) {
   const firstColKey = Object.keys(rowObj)[0]
   const firstColVal = String(rowObj[firstColKey] || "").toLowerCase()
   if (
    firstColVal !== "total" &&
    firstColVal !== "totals" &&
    firstColVal !== "grand total"
   ) {
    const metadata = extractMetadataFromPath(fileName, folderName)
    const normalizedRow = normalizeRow(rowObj)

    data.push({
     ...normalizedRow,
     _sourceFile: fileName,
     _folderName: folderName,
     _featureName: metadata.featureName,
     _dateRange: metadata.dateRange,
     _id: `${fileId}-${i}`,
    })
   }
  }
 }
 return data
}

// ===============================
// DATA FORGE (DEDUP + ENRICH)
// ===============================

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

export const mergeAndDedupeRows = (
 rows: DataForgeRow[],
): DataForgeIngestResult => {
 const map = new Map<string, DataForgeRow>()

 rows.forEach((row) => {
  const key = compositeKey(row)
  const existing = map.get(key)
  if (!existing) {
   map.set(key, row)
   return
  }

  const existingViews = toNumber(existing.Views ?? 0)
  const newViews = toNumber(row.Views ?? 0)
  if (newViews > existingViews) {
   map.set(key, row)
  }
 })

 const deduped = Array.from(map.values())

 const sourceCounts = rows.reduce(
  (acc, row) => {
   const tag = (row._userTag || row._sourceFile || "").toLowerCase()
   if (tag.includes("csv")) acc.csv += 1
   else if (tag.includes("api") || tag.includes("analytics")) acc.analytics += 1
   else acc.manual += 1
   return acc
  },
  { csv: 0, analytics: 0, manual: 0 } as {
   csv: number
   analytics: number
   manual: number
  },
 )

 return {
  rows: deduped,
  totalBeforeDedupe: rows.length,
  dedupeRemoved: rows.length - deduped.length,
  sourceCounts,
 }
}

export const buildUnifiedRowsFromCsvFiles = (
 files: CsvFileWithTag[],
): DataForgeRow[] => {
 const rows: DataForgeRow[] = []
 files.forEach((file) => {
  ;(file.data ?? []).forEach((row) => {
   const enriched = normalizeAndEnrichRow(row)
   enriched._sourceFile = file.name
   enriched._userTag = file.tag
   rows.push(enriched)
  })
 })
 return rows
}

export const dedupeByVideoDate = (rows: DataForgeRow[]): DataForgeRow[] => {
 return mergeAndDedupeRows(rows).rows
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
