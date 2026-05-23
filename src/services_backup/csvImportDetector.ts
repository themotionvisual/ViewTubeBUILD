import type {
 CsvDetectedCategory,
 CsvFileWithTag,
 CsvMergeKeyStrategy,
 CsvMergeTargetDataset,
 CsvPackageMemberRole,
 CsvTag,
 CsvUploadType,
} from "../types"
import {
 getCsvFamilyDefinition,
 getUploadTypeMajorFamily,
 uploadTypeToCsvTag,
} from "./csvTaxonomy"

export type CsvDetectionConfidence = "high" | "medium" | "low"

export type CsvImportDetection = {
 detectedCategory: CsvDetectedCategory
 confidence: CsvDetectionConfidence
 signatureId: string
 dateWindow?: "7d" | "28d" | "90d" | "365d" | "lifetime"
 sourceGroup: string
 mergeTargetDataset: CsvMergeTargetDataset
 mergeKeyStrategy: CsvMergeKeyStrategy
 warnings: string[]
 packageName: string
 packageFingerprint: string
 packageVariant?: string
 channelLabel?: string
 packageMemberRole: CsvPackageMemberRole
}

type HeaderSet = {
 raw: string[]
 normalized: Set<string>
}

const normalizeHeader = (value: string): string =>
 value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()

const hasHeader = (headers: HeaderSet, header: string): boolean =>
 headers.normalized.has(normalizeHeader(header))

const hasAnyHeader = (headers: HeaderSet, names: string[]): boolean =>
 names.some((name) => hasHeader(headers, name))

const rowTextSample = (rows: Record<string, unknown>[]): string =>
 rows
  .slice(0, 40)
  .flatMap((row) => Object.values(row).map((value) => String(value ?? "")))
  .join(" ")
  .toLowerCase()

const cleanPath = (filePath: string): string => filePath.replace(/\\/g, "/")

const pathGroup = (filePath: string): string => {
 const clean = cleanPath(filePath)
 const parts = clean.split("/")
 if (parts.length <= 1) return clean
 return parts.slice(0, -1).join("/")
}

const stripExtension = (name: string): string => name.replace(/\.csv$/i, "")

const extractPackageMeta = (filePath: string) => {
 const clean = cleanPath(filePath)
 const parts = clean.split("/").filter(Boolean)
 const fileName = parts[parts.length - 1] || filePath
 const folderName = parts.length >= 2 ? parts[parts.length - 2] : stripExtension(fileName)
 const packageName = /table data|chart data|totals|\.csv$/i.test(fileName)
  ? folderName
  : stripExtension(fileName)
 const variantMatch = packageName.match(/\s*(\((\d+)\)|copy)\s*$/i)
 const packageVariant = variantMatch?.[1]
 const normalizedPackageName = packageName.replace(/\s*(\((\d+)\)|copy)\s*$/i, "").trim()
 const dateMatch = normalizedPackageName.match(
  /(\d{4}[-/]\d{2}[-/]\d{2}.*?\d{4}[-/]\d{2}[-/]\d{2}|lifetime|all time|all_time)/i,
 )
 const rawBaseTitle = dateMatch
  ? normalizedPackageName.slice(0, dateMatch.index).trim().replace(/[\-_]+$/g, "").trim()
  : normalizedPackageName
 const baseTitle = rawBaseTitle
  .replace(/^table\s+data\s*[-:]\s*/i, "")
  .replace(/^chart\s+data\s*[-:]\s*/i, "")
  .replace(/^totals?\s*[-:]\s*/i, "")
  .trim()
 const channelLabel = dateMatch
  ? normalizedPackageName
     .slice((dateMatch.index || 0) + dateMatch[0].length)
     .replace(/^[\s\-–—]+/, "")
     .trim() || undefined
  : undefined
 return {
  fileName,
  packageName: normalizedPackageName,
  packageVariant,
  folderName,
  baseTitle: baseTitle || rawBaseTitle || normalizedPackageName,
  channelLabel,
  sourceGroup: pathGroup(filePath),
 }
}

const inferDateWindow = (
 filePath: string,
): CsvImportDetection["dateWindow"] | undefined => {
 const lower = filePath.toLowerCase()
 if (lower.includes("lifetime") || lower.includes("all time")) return "lifetime"
 const match = filePath.match(
  /(\d{4})[-/](\d{2})[-/](\d{2}).*?(\d{4})[-/](\d{2})[-/](\d{2})/,
 )
 if (!match) return undefined
 const [, y1, m1, d1, y2, m2, d2] = match
 const start = new Date(`${y1}-${m1}-${d1}T00:00:00Z`)
 const end = new Date(`${y2}-${m2}-${d2}T00:00:00Z`)
 const diffMs = end.getTime() - start.getTime()
 if (!Number.isFinite(diffMs) || diffMs < 0) return undefined
 const spanDays = Math.round(diffMs / 86400000) + 1
 if (spanDays >= 6 && spanDays <= 9) return "7d"
 if (spanDays >= 25 && spanDays <= 35) return "28d"
 if (spanDays >= 85 && spanDays <= 96) return "90d"
 if (spanDays >= 330 && spanDays <= 390) return "365d"
 return undefined
}

const inferPackageMemberRole = (filePath: string, baseTitle: string): CsvPackageMemberRole => {
 const lowerPath = filePath.toLowerCase()
 const lowerBase = baseTitle.toLowerCase()
 if (lowerPath.endsWith("totals.csv")) return "totals"
 if (lowerPath.endsWith("chart data.csv")) return "chart_data"
 if (lowerPath.endsWith("table data.csv")) return "table_data"
 if (lowerBase.includes("audience retention")) return "retention_member"
 if (lowerPath.endsWith(".csv")) return "loose_table_data"
 return "unknown"
}

const buildResult = (
 filePath: string,
 detectedCategory: CsvDetectedCategory,
 confidence: CsvDetectionConfidence,
 signatureId: string,
 warnings: string[] = [],
): CsvImportDetection => {
 const meta = extractPackageMeta(filePath)
 const family = getCsvFamilyDefinition(detectedCategory)
 return {
  detectedCategory,
  confidence,
  signatureId,
  dateWindow: inferDateWindow(filePath),
  sourceGroup: meta.sourceGroup,
  mergeTargetDataset: family.mergeTargetDataset,
  mergeKeyStrategy: family.mergeKeyStrategy,
  warnings,
  packageName: meta.packageName,
  packageFingerprint: [meta.packageName.toLowerCase(), family.majorFamily, family.subtableId].join("::"),
  packageVariant: meta.packageVariant,
  channelLabel: meta.channelLabel,
  packageMemberRole: inferPackageMemberRole(filePath, meta.baseTitle),
 }
}

const hasTotalsLikeShape = (rows: Record<string, unknown>[]): boolean => {
 if (rows.length === 0) return false
 return rows.every((row) => {
  const firstKey = Object.keys(row)[0]
  if (!firstKey) return false
  const value = String(row[firstKey] ?? "").trim().toLowerCase()
  return value === "total" || value === "totals"
 })
}

const detectTrafficCategory = (
 sample: string,
 headers: HeaderSet,
): CsvDetectedCategory => {
 const sourceTypeIndex = [
  "yt_search.",
  "ext_url.",
  "yt_related.",
  "shorts_content_links.",
  "subscriber.",
 ]
 const haystack = [sample, ...sourceTypeIndex].join(" ")
 if (haystack.includes("yt_search.")) return "traffic_youtube_search"
 if (haystack.includes("ext_url.")) return "traffic_external"
 if (haystack.includes("yt_related.") || haystack.includes("related_video.")) {
  return "traffic_suggested_videos"
 }
 if (haystack.includes("shorts_content_links.") || haystack.includes("shorts feed")) {
  return "traffic_shorts_feed"
 }
 if (
  haystack.includes("subscriber.") ||
  haystack.includes("browse features") ||
  haystack.includes("channel pages") ||
  haystack.includes("other youtube features") ||
  hasAnyHeader(headers, ["Source type", "Source title"])
 ) {
  return "traffic_youtube_features"
 }
 return "traffic_overview"
}

const detectCategoryFromPackageTitle = (
 baseTitle: string,
 sample: string,
 headers: HeaderSet,
): CsvDetectedCategory | null => {
 const title = baseTitle.toLowerCase()
 if (title.startsWith("traffic source")) return detectTrafficCategory(sample, headers)
 if (title.startsWith("cities")) return "geography_city"
 if (title.startsWith("geography")) return "geography_country"
 if (title.startsWith("viewer age") && title.includes("viewer gender")) return "audience_age_gender"
 if (title.startsWith("viewer age")) return "audience_age"
 if (title.startsWith("viewer gender")) return "audience_gender"
 if (title.startsWith("audience size and growth")) return "audience_size_growth"
 if (title.startsWith("new and returning viewers")) return "audience_new_returning"
 if (title.startsWith("audience by watch behavior")) return "audience_watch_behavior"
 if (title.startsWith("device type")) return "audience_devices"
 if (title.startsWith("audience retention")) return "audience_retention_curve"
 if (title.startsWith("content type")) return "video_content_type"
 if (title.startsWith("content")) return "video_content_all"
 if (title.startsWith("date")) return "daily_channel_metrics"
 if (title.startsWith("playback location")) return "surface_playback_location"
 if (title.startsWith("subscription status")) return "surface_subscription_status"
 if (title.startsWith("subscription source")) return "surface_subscription_source"
 if (title.startsWith("sharing service")) return "surface_sharing_service"
 if (title.startsWith("playlist")) return "surface_playlist"
 if (title.startsWith("post")) return "surface_post"
 if (title.startsWith("card type")) return "surface_card_type"
 if (title.startsWith("card")) return "surface_card"
 if (title.startsWith("end screen element type")) return "surface_end_screen_type"
 if (title.startsWith("end screen element")) return "surface_end_screen"
 if (title.startsWith("subtitles and cc")) return "surface_subtitles_cc"
 if (title.startsWith("translation use")) return "surface_translation_use"
 if (title.startsWith("video info language")) return "surface_video_info_language"
 if (title.startsWith("revenue source")) return "monetization_revenue_source"
 if (title.startsWith("ad type")) return "monetization_ad_type"
 return null
}

export const detectCsvImportProfile = (
 rows: Record<string, unknown>[],
 filePath: string,
): CsvImportDetection => {
 if (rows.length === 0) {
  return buildResult(filePath, "unknown", "low", "empty_rows", ["No rows parsed from CSV."])
 }

 const rawHeaders = Object.keys(rows[0])
 const headers: HeaderSet = {
  raw: rawHeaders,
  normalized: new Set(rawHeaders.map(normalizeHeader)),
 }
 const sample = rowTextSample(rows)
 const meta = extractPackageMeta(filePath)
 const role = inferPackageMemberRole(filePath, meta.baseTitle)
 const warnings: string[] = []
 if (role === "chart_data" || role === "totals") {
  warnings.push("Auxiliary Studio export file; upload the full folder or ZIP for best merge coverage.")
 }
 if (hasTotalsLikeShape(rows)) {
  warnings.push("Totals-only rows detected; treated as package metadata unless paired with table data.")
 }

 const categoryFromPackage = detectCategoryFromPackageTitle(meta.baseTitle, sample, headers)
 if (categoryFromPackage) {
  return buildResult(filePath, categoryFromPackage, role === "loose_table_data" ? "medium" : "high", `package_title_${categoryFromPackage}`, warnings)
 }

 if (
  hasHeader(headers, "Viewer age") &&
  hasHeader(headers, "Viewer gender") &&
  hasHeader(headers, "Views (%)")
 ) {
  return buildResult(filePath, "audience_age_gender", "high", "audience_age_gender_headers", warnings)
 }

 if (hasHeader(headers, "Viewer age") && hasHeader(headers, "Views (%)")) {
  return buildResult(filePath, "audience_age", "high", "audience_age_headers", warnings)
 }

 if (hasHeader(headers, "Viewer gender") && hasHeader(headers, "Views (%)")) {
  return buildResult(filePath, "audience_gender", "high", "audience_gender_headers", warnings)
 }

 if (hasHeader(headers, "Video position (%)")) {
  const detailedActivity = hasAnyHeader(headers, [
   "Started watching",
   "Stopped watching",
   "Number of times each moment was seen",
  ])
  return buildResult(
   filePath,
   detailedActivity ? "audience_retention_activity" : "audience_retention_curve",
   "high",
   detailedActivity ? "retention_activity_headers" : "retention_curve_headers",
   warnings,
  )
 }

 if (
  hasAnyHeader(headers, [
   "Monthly audience",
   "28-day new viewers",
   "28-day casual viewers",
   "28-day regular viewers",
   "Subscribers",
  ]) &&
  hasHeader(headers, "Date")
 ) {
  return buildResult(filePath, "audience_size_growth", "high", "audience_growth_date_metrics", warnings)
 }

 if (
  hasHeader(headers, "Date") &&
  hasAnyHeader(headers, ["Views", "Watch time (hours)", "Engaged views"])
 ) {
  return buildResult(filePath, "daily_channel_metrics", "high", "daily_metrics_date_headers", warnings)
 }

 if (hasHeader(headers, "Cities") || hasHeader(headers, "City name")) {
  return buildResult(filePath, "geography_city", "high", "city_headers", warnings)
 }

 if (hasHeader(headers, "Geography")) {
  return buildResult(filePath, "geography_country", "high", "geography_headers", warnings)
 }

 if (hasHeader(headers, "Traffic source")) {
  const category = detectTrafficCategory(sample, headers)
  return buildResult(filePath, category, "high", `traffic_${category}`, warnings)
 }

 if (hasHeader(headers, "Device type") || hasHeader(headers, "Operating system")) {
  return buildResult(filePath, "audience_devices", "high", "device_headers", warnings)
 }

 if (hasHeader(headers, "Audience by watch behavior")) {
  return buildResult(filePath, "audience_watch_behavior", "high", "audience_watch_behavior_headers", warnings)
 }

 if (hasHeader(headers, "New and Returning Viewers")) {
  return buildResult(filePath, "audience_new_returning", "high", "audience_new_returning_headers", warnings)
 }

 if (hasHeader(headers, "Content type")) {
  return buildResult(filePath, "video_content_type", "high", "content_type_headers", warnings)
 }

 if (hasHeader(headers, "Content") || hasHeader(headers, "Video title")) {
  const hasShortsSignal = hasHeader(headers, "Stayed to watch (%)")
  const hasLongformSignal = hasAnyHeader(headers, [
   "End screen element clicks",
   "End screen element click rate (%)",
   "End screen element impressions",
   "End screen elements shown",
   "Card clicks",
   "Card click rate (%)",
   "Card impressions",
   "Cards shown",
   "Clicks per card shown (%)",
  ])
  if (hasShortsSignal && !hasLongformSignal) {
   return buildResult(filePath, "video_content_shorts", "high", "content_shorts_stw", warnings)
  }
  if (hasLongformSignal && !hasShortsSignal) {
   return buildResult(filePath, "video_content_longform", "high", "content_longform_cards_end_screens", warnings)
  }
  return buildResult(filePath, "video_content_all", "high", "content_channel_headers", warnings)
 }

 return buildResult(filePath, "unknown", "low", "no_matching_import_profile", [
  ...warnings,
  "No supported YouTube Studio export profile matched this CSV.",
 ])
}

export const csvCategoryToTag = (
 category: CsvDetectedCategory,
 uploadType: CsvUploadType,
 fallback: CsvTag,
): CsvTag => {
 const manualTag = uploadTypeToCsvTag(uploadType)
 if (manualTag) return manualTag
 const family = getCsvFamilyDefinition(category)
 if (family.defaultTag) return family.defaultTag
 const majorFamily = getUploadTypeMajorFamily(family.uploadHint)
 if (majorFamily === "traffic") return "traffic"
 if (majorFamily === "geography") return "geo"
 if (majorFamily === "audience") return "audience"
 if (majorFamily === "daily_metrics") return "daily"
 if (majorFamily === "video_data") return "mixed"
 return fallback
}

export const isCsvCategoryRecognized = (category: CsvDetectedCategory | undefined): boolean => {
 return Boolean(category && category !== "unknown")
}

export const enrichCsvFileWithDetection = (
 file: CsvFileWithTag,
): CsvFileWithTag => {
 const family = getCsvFamilyDefinition(file.detectedCategory)
 return {
  ...file,
  majorFamily: family.majorFamily,
  subtableId: family.subtableId,
  capabilitySources: family.capabilitySources,
  freshnessClass: family.freshnessClass,
 }
}
