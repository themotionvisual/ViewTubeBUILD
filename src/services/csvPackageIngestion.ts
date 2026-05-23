import JSZip from "jszip"
import type { AnalyticsWindow } from "./analytics/DataStore"
import { getCanonicalAnalyticsCache, updateCanonicalAnalyticsCache } from "./analytics/DataStore"
import type {
 CsvExportKind,
 CsvFileWithTag,
 CsvImportPackage,
 CsvMergeDirective,
 CsvPackageMember,
 CsvTag,
 CsvUploadType,
} from "../types"
import {
 csvCategoryToTag,
 detectCsvImportProfile,
 enrichCsvFileWithDetection,
} from "./csvImportDetector"

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

const normalizeHeader = (value: string): string =>
 value.toLowerCase().replace(/[^a-z0-9]/g, "")

const hasHeaderAny = (headers: string[], aliases: string[]): boolean => {
 const normalized = headers.map(normalizeHeader)
 return aliases.some((alias) => normalized.includes(normalizeHeader(alias)))
}

const hasRenderableValue = (value: unknown): boolean => {
 if (value === null || value === undefined) return false
 if (typeof value === "string") return value.trim() !== ""
 if (typeof value === "number") return Number.isFinite(value)
 return true
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

 const parsed = Number(raw.replace(/[^0-9.-]/g, ""))
 return Number.isFinite(parsed) ? parsed : 0
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

export const isLikelyTotalCsvRow = (row: Record<string, unknown>): boolean => {
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

 const dataRows = rows.filter((row) => !isLikelyTotalCsvRow(row))
 if (dataRows.length === 0) return null

 let shortEvidence = 0
 let longEvidence = 0

 dataRows.forEach((row) => {
  const stayedToWatch =
   typeof row["Stayed to watch (%)"] === "number"
    ? row["Stayed to watch (%)"]
    : Number(row["Stayed to watch (%)"] ?? row["Stayed to watch at 0:30 (%)"] ?? 0)
  const endScreenShown =
   typeof row["End screen elements shown"] === "number"
    ? row["End screen elements shown"]
    : Number(row["End screen elements shown"] ?? 0)
  const shortsFeedViews =
   typeof row["Views from Shorts feed"] === "number"
    ? row["Views from Shorts feed"]
    : Number(row["Views from Shorts feed"] ?? row["Shorts feed views"] ?? 0)
  const durationSec = durationToSeconds(
   row["Average view duration"] ?? row["Duration"] ?? 0,
  )

  if (stayedToWatch > 0 || shortsFeedViews > 0) shortEvidence += 1
  if (endScreenShown > 0 || durationSec > 180) longEvidence += 1
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

export const inferAnalyticsWindowFromName = (
 name: string,
): AnalyticsWindow | null => {
 const lower = name.toLowerCase()
 if (
  lower.includes("lifetime") ||
  lower.includes("all time") ||
  lower.includes("all_time")
 ) {
  return "lifetime"
 }

 const daysMatch = lower.match(
  /(?:past|last|previous)?\s*(7|28|30|90|365)\s*(?:day|days)/,
 )
 if (daysMatch) {
  const days = Number(daysMatch[1])
  if (days === 7) return "7d"
  if (days === 28 || days === 30) return "28d"
  if (days === 90) return "90d"
  if (days === 365) return "365d"
 }

 if (lower.includes("7d")) return "7d"
 if (lower.includes("28d") || lower.includes("30d")) return "28d"
 if (lower.includes("90d")) return "90d"
 if (lower.includes("365d") || lower.includes("1y") || lower.includes("1yr"))
  return "365d"

 const explicitDateRange = name.match(
  /(\d{4})[-/](\d{2})[-/](\d{2}).*?(\d{4})[-/](\d{2})[-/](\d{2})/,
 )
 if (explicitDateRange) {
  const [, y1, m1, d1, y2, m2, d2] = explicitDateRange
  const start = new Date(`${y1}-${m1}-${d1}T00:00:00Z`)
  const end = new Date(`${y2}-${m2}-${d2}T00:00:00Z`)
  const diffMs = end.getTime() - start.getTime()
  if (Number.isFinite(diffMs) && diffMs >= 0) {
   const spanDays = Math.round(diffMs / 86400000) + 1
   if (spanDays >= 85 && spanDays <= 96) return "90d"
   if (spanDays >= 25 && spanDays <= 35) return "28d"
   if (spanDays >= 6 && spanDays <= 9) return "7d"
   if (spanDays >= 330 && spanDays <= 390) return "365d"
  }
 }

 return null
}

export const classifyCsvExportKind = (
 fileName: string,
 rows: Record<string, unknown>[],
): CsvExportKind => {
 const headers = rows.length > 0 ? Object.keys(rows[0]) : []
 if (headers.length === 0) return "unknown"

 const lowerFile = fileName.toLowerCase()
 const rowCount = rows.length
 const hasVideoDimension = hasHeaderAny(headers, [
  "Video title",
  "Video ID",
  "video",
  "Dimension",
 ])
 const hasDateDimension = hasHeaderAny(headers, ["Date", "Day"])
 const hasCoreMetrics = hasHeaderAny(headers, [
  "Views",
  "Watch Time (Hours)",
  "Watch time (hours)",
  "Likes",
  "Comments",
  "Engaged views",
 ])
 const hasOnlyTotalsHint =
  lowerFile.includes("total") ||
  lowerFile.includes("summary") ||
  lowerFile.includes("overview") ||
  rows.every(isLikelyTotalCsvRow)

 if (
  hasOnlyTotalsHint ||
  (rowCount <= 2 && !hasVideoDimension && hasCoreMetrics)
 ) {
  return "totals"
 }

 if (
  lowerFile.includes("chart data") ||
  (hasDateDimension && !hasVideoDimension && hasCoreMetrics)
 ) {
  return "chart"
 }

 if (hasVideoDimension && hasCoreMetrics) return "table_data"

 return "unknown"
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

  if (isCsv) csvFiles.push(file)
 }

 return { csvFiles, extractedDateRange }
}

const buildMergeDirective = (file: CsvFileWithTag): CsvMergeDirective => {
 const memberRole = file.packageMemberRole || "unknown"
 const sourcePriority =
  memberRole === "table_data"
   ? "primary"
   : memberRole === "chart_data" || memberRole === "totals" || memberRole === "retention_member"
    ? "auxiliary"
    : "fallback"

 return {
  packageId: file.packageId || file.packageFingerprint || file.id,
  packageFingerprint: file.packageFingerprint || file.packageId || file.id,
  majorFamily: file.majorFamily || "unknown",
  subtableId: file.subtableId || "unknown",
  mergeTargetDataset: file.mergeTargetDataset || "ignore",
  mergeKeyStrategy: file.mergeKeyStrategy || "none",
  memberRole,
  capabilitySources: file.capabilitySources || ["csv_only"],
  freshnessClass: file.freshnessClass || "manual_only",
  sourcePriority,
  isPrimaryMergeSource: sourcePriority === "primary",
  isAuxiliaryMember: sourcePriority === "auxiliary",
 }
}

export const buildCsvImportPackages = (
 files: CsvFileWithTag[],
): CsvImportPackage[] => {
 const packages = new Map<string, CsvImportPackage>()

 files.forEach((file) => {
  const packageKey = [
   file.sourceGroup || file.packageName || "root",
   file.packageFingerprint || file.packageId || file.id,
  ].join("::")

  const member: CsvPackageMember = {
   fileName: file.name,
   relativePath: file.file ? getFilePath(file.file) : file.name,
   exportKind: file.exportKind || "unknown",
   role: file.packageMemberRole || "unknown",
   category: file.detectedCategory || "unknown",
  }

  const existing = packages.get(packageKey)
  if (existing) {
   existing.members.push(member)
   if (
    member.role === "table_data" &&
    existing.memberRole !== "table_data"
   ) {
    existing.memberRole = "table_data"
   }
   return
  }

  packages.set(packageKey, {
   packageId: packageKey,
   packageName: file.packageName || file.name,
   packageFingerprint: file.packageFingerprint || packageKey,
   sourceGroup: file.sourceGroup || "root",
   category: file.detectedCategory || "unknown",
   majorFamily: file.majorFamily || "unknown",
   mergeTargetDataset: file.mergeTargetDataset || "ignore",
   mergeKeyStrategy: file.mergeKeyStrategy || "none",
   memberRole: file.packageMemberRole || "unknown",
   members: [member],
   capabilitySources: file.capabilitySources || ["csv_only"],
   freshnessClass: file.freshnessClass || "manual_only",
   channelLabel: file.channelLabel,
   dateRange: file.dateRange,
  })
 })

 return Array.from(packages.values())
}

export const enrichCsvFilesWithPackages = (
 files: CsvFileWithTag[],
): CsvFileWithTag[] => {
 const packageCatalog = buildCsvImportPackages(files)
 const packageByFingerprint = new Map(
  packageCatalog.map((pkg) => [pkg.packageFingerprint, pkg] as const),
 )

 return files.map((file) => {
  const pkg = packageByFingerprint.get(file.packageFingerprint || "")
  const mergeDirective = buildMergeDirective(file)
  return {
   ...file,
   packageId: pkg?.packageId || file.packageId || file.packageFingerprint,
   mergeDirective,
   packageMemberCount: pkg?.members.length || 1,
   packageHasPrimaryTableData: Boolean(
    pkg?.members.some((member) => member.role === "table_data"),
   ),
   packageHasAuxiliaryMembers: Boolean(
    pkg?.members.some((member) =>
     member.role === "chart_data" ||
     member.role === "totals" ||
     member.role === "retention_member",
    ),
   ),
  }
 })
}

export const buildCsvFilesWithTags = async (
 files: File[],
 uploadType: CsvUploadType,
): Promise<CsvFileWithTag[]> => {
 const detectedFiles = await Promise.all(
  files.map(async (file) => {
   const text = await file.text()
   const data = parseCSV(text)

   const filePath = getFilePath(file)
   const inferredWindow = inferAnalyticsWindowFromName(filePath)
   const exportKind = classifyCsvExportKind(filePath, data)
   const detection = detectCsvImportProfile(data, filePath)
   const fallbackTag = detectContentTagFromRows(data) ?? inferTagFromPath(filePath)
   const tag = csvCategoryToTag(detection.detectedCategory, uploadType, fallbackTag)

   const baseFile: CsvFileWithTag = {
    id: crypto.randomUUID(),
    name: file.name,
    file,
    byteSize: file.size,
    data,
    tag,
    detectedCategory: detection.detectedCategory,
    detectionConfidence: detection.confidence,
    signatureId: detection.signatureId,
    detectionWarnings: detection.warnings,
    sourceGroup: detection.sourceGroup,
    mergeTargetDataset: detection.mergeTargetDataset,
    mergeKeyStrategy: detection.mergeKeyStrategy,
    packageId: detection.packageFingerprint,
    packageName: detection.packageName,
    packageFingerprint: detection.packageFingerprint,
    channelLabel: detection.channelLabel,
    packageVariant: detection.packageVariant,
    packageMemberRole: detection.packageMemberRole,
    analyticsWindow: inferredWindow ?? undefined,
    exportKind,
   }

   // Permanently link video ID to the shorts format if "Stayed to watch (%)" is present
   const cache = getCanonicalAnalyticsCache()
   const updates: Record<string, string> = { ...cache.videoContentType }
   let hasUpdates = false

   data.forEach((row) => {
    const videoId = String(row["Video"] ?? row["Video title"] ?? row["Video ID"] ?? "")
    if (!videoId || videoId.toLowerCase() === "total" || videoId.length < 8) return

    const stayedToWatch =
     typeof row["Stayed to watch (%)"] === "number"
      ? row["Stayed to watch (%)"]
      : Number(row["Stayed to watch (%)"] ?? row["Stayed to watch at 0:30 (%)"] ?? 0)

    if (stayedToWatch > 0) {
     updates[videoId] = "shorts"
     hasUpdates = true
    }
   })

   if (hasUpdates) {
    updateCanonicalAnalyticsCache({ videoContentType: updates }).catch((err) => {
     console.error("[CSV Ingestion] Failed to update video format cache:", err)
    })
   }

   return enrichCsvFileWithDetection(baseFile)
  }),
 )

 return enrichCsvFilesWithPackages(detectedFiles)
}
