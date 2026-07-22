import type { VtSyncSnapshot, VtSyncTableColumnDefinition, VtSyncTableDefinition } from "../../adapters/contracts"
import { normalizeVtSyncTableRows, tableRows } from "../../adapters/tableData"
import type { VtSyncPrivacyFilters } from "../../adapters/privacyPolicy"
import { getVtSyncTableExportHeaders, getVtSyncTableExportRows } from "../../adapters/tableExport"
import {
 formatVtSyncDurationSeconds,
 formatVtSyncTableCellValue,
 getVtSyncLocalMonthIndex,
 getVtSyncLocalTimeSeconds,
 getVtSyncLocalWeekdayIndex,
 parseVtSyncDateValue,
 parseVtSyncDurationSeconds,
 type VtSyncDurationFormat,
} from "../../adapters/tableFormatting"
import { VT_SYNC_VISIBLE_TABLE_DEFINITIONS } from "../../upstream/tableRegistry"

export type VtSyncTableRow = Record<string, unknown>
export type VtSyncSortState = { key: string; direction: "asc" | "desc" }
export type VtSyncImportedRows = Record<string, VtSyncTableRow[]>
export type VtSyncHoverScrollIntent = { direction: -1 | 0 | 1; speed: 1 | 2 }
export type VtSyncTableTotalContext = {
 avatarUrl?: string | null
 channelName?: string | null
 channelDescription?: string | null
 channelCustomUrl?: string | null
}
export type VtSyncTableTotal = { primary: string; secondary?: string; imageUrl?: string; kind?: "context" | "numeric" | "muted" | "image"; badges?: { value: string; count: number }[] }

export const VT_SYNC_ROW_NUMBER_WIDTH = 58
export const VT_SYNC_ROW_BATCH_SIZE = 50
const VT_SYNC_HALF_SIZE_SECONDS_COLUMNS = new Set(["watchTime", "youtubePremiumWatchTime", "estimatedRedMinutesWatched"])
const VT_SYNC_VIDEO_COMPOSITE_HIDDEN_COLUMNS = new Set(["videoId", "publishedDay", "publishedTime"])
export const VT_SYNC_VIDEO_NON_COMPACT_WIDTHS = [91, 325, 97, 68, 132, 82, 92, 238, 79, 69, 80, 68, 68, 78, 79, 65, 79, 82, 73, 68, 72, 68, 75, 74, 69, 81, 68, 72, 68, 78, 68, 76, 68, 68, 68, 69, 68, 64, 78, 68, 68, 72, 82, 89, 82, 74, 81, 74, 73, 68, 68, 73, 68, 68, 91, 85, 85, 78] as const
export const VT_SYNC_SMALL_TABLE_COLORS = ["#40C6E9", "#4FFF5B", "#FFFF61", "#FFB570", "#FF3B30", "#FF83EA", "#579AFF", "#CC00FF"] as const
export const VT_SYNC_SPARK_RANK_PALETTE = ["#40C6E9", "#4FFF5B", "#FFFF61", "#FFB570", "#FF3B30"] as const
export const VT_SYNC_ALPHABETIC_SPECTRUM_PALETTE = [
 "#FA618A", "#FF7F6B", "#FFA85C", "#FFDA47", "#C0F240", "#3FEE56",
 "#4EE4BE", "#36E0F6", "#528FFA", "#A467F4", "#F55EFC", "#FF7AC8",
] as const
export const VT_SYNC_OPPOSITE_COLORS: Record<string, string> = {
 "#FF83EA": "#4FFF5B",
 "#FF8AAF": "#40C6E9",
 "#FFB570": "#579AFF",
 "#FFFF61": "#CC00FF",
 "#4FFF5B": "#FF83EA",
 "#40C6E9": "#FF8AAF",
 "#579AFF": "#FFB570",
 "#CC00FF": "#FFFF61",
 "#FF3B30": "#40C6E9",
}

const VT_SYNC_PRESENTATION_LABELS: Record<string, string> = {
 videos: "Videos",
 playlists: "Playlists",
 creator: "Formats",
 daily: "Daily",
 geography: "Countries",
}

export type VtSyncApiValuePresentation = {
 title: string
 apiValue: string
}

const VT_SYNC_TRAFFIC_SOURCE_LABELS: Record<string, string> = {
 SHORTS: "Shorts Feed",
 SUBSCRIBER: "Subscribers Feed",
 YT_SEARCH: "YouTube Search",
 EXT_URL: "External Websites",
 YT_CHANNEL: "Channel Pages",
 RELATED_VIDEO: "Suggested Videos",
 YT_OTHER_PAGE: "Other YouTube Features",
 PLAYLIST: "YouTube Playlists",
 NO_LINK_OTHER: "Direct / Unknown",
 NOTIFICATION: "Notifications",
 SOUND_PAGE: "Audio Pages",
 SHORTS_CONTENT_LINKS: "Shorts Links",
 END_SCREEN: "End Screens",
 HASHTAGS: "Hashtag Pages",
 ANNOTATION: "Annotations",
 IMMERSIVE_LIVE: "Live Streams",
}

const VT_SYNC_SUBSCRIBER_DETAIL_LABELS: Record<string, string> = {
 // Current Bulk Reporting browse-feature values.
 explore: "Kids: Explore",
 learning: "Kids: Learning",
 music: "Music Feed",
 "my-history": "Watch History",
 "my-subscriptions": "Subscriptions Page",
 "my-uploads": "My Uploads",
 podcasts: "Podcasts Page",
 shows: "Kids: Shows",
 "watch-later": "Watch Later",
 "what-to-watch": "YouTube Home",
 // Legacy Targeted Queries values still present in historical snapshots.
 activity: "Channel Activity Feed",
 blogged: "Blog Links in Subscriptions",
 mychannel: "Likes, History & Watch Later",
 sdig: "Subscription Update Emails",
 uploaded: "New Uploads Feed",
 "/": "YouTube Home",
 "/my_subscriptions": "Subscriptions Page",
 // Observed in the authoritative YouTube Studio export stored with VT-SYNC fixtures.
 pp: "Personalized Playlists",
}

const VT_SYNC_PLAYBACK_LOCATION_LABELS: Record<string, string> = {
 BROWSE: "Browsing Features",
 CHANNEL: "Channel Pages",
 EMBEDDED: "Embedded Players",
 EXTERNAL_APP: "External Apps",
 MOBILE: "Mobile Website / Legacy Apps",
 SEARCH: "YouTube Search Results",
 WATCH: "YouTube Watch Page / Official Apps",
 YT_OTHER: "Other YouTube Locations",
}

const VT_SYNC_AD_TYPE_LABELS: Record<string, string> = {
 auctiontrueviewinstream: "Auction Skippable Ad",
 auctioninstream: "Auction Non-Skippable Ad",
 auctionbumperinstream: "Auction Bumper Ad",
 auctiondisplay: "Auction Display Ad",
 reservedinstream: "Reserved Non-Skippable Ad",
 reservedinstreamselect: "Reserved Skippable Ad",
 reservedbumperinstream: "Reserved Bumper Ad",
 reserveddisplay: "Reserved Display Ad",
 unknown: "Unknown Ad Type",
}

/**
 * Adds human-readable UI copy for opaque YouTube API dimension values without
 * changing the registry-backed value used by snapshots, sorting, or exports.
 */
export const getVtSyncApiValuePresentation = (
 tableId: string,
 columnKey: string,
 value: unknown,
): VtSyncApiValuePresentation | null => {
 if (isMissingVtSyncValue(value)) return null
 const apiValue = String(value).trim()
 let title: string | undefined

 if (tableId === "traffic" && columnKey === "source") {
  title = VT_SYNC_TRAFFIC_SOURCE_LABELS[apiValue.toUpperCase()]
 } else if (tableId === "traffic_subscribers" && columnKey === "term") {
  const detailValue = apiValue.replace(/^SUBSCRIBER\./i, "").toLowerCase()
  title = VT_SYNC_SUBSCRIBER_DETAIL_LABELS[detailValue]
 } else if (tableId === "locations" && columnKey === "location") {
  title = VT_SYNC_PLAYBACK_LOCATION_LABELS[apiValue.toUpperCase()]
 } else if (tableId === "ads" && columnKey === "adType") {
  title = VT_SYNC_AD_TYPE_LABELS[apiValue.toLowerCase()]
 }

 return title ? { title, apiValue } : null
}

export const getVtSyncPresentationLabel = (tableId: string, fallback: string): string =>
 VT_SYNC_PRESENTATION_LABELS[tableId] || fallback

export const getVtSyncRowHeight = (compact: boolean, sparklines: boolean): number =>
 compact ? (sparklines ? 31 : 19) : 48

export const getNextVtSyncRowLimit = (
 currentLimit: number,
 totalRows: number,
 batchSize = VT_SYNC_ROW_BATCH_SIZE,
): number => Math.min(
 Math.max(0, totalRows),
 Math.max(batchSize, currentLimit + batchSize),
)

export const getVtSyncCompactThumbnailWidth = (sparklines: boolean): number =>
 Math.round((getVtSyncRowHeight(true, sparklines) - 2) * (16 / 9))

export const getVtSyncOppositeColor = (color: string): string =>
 VT_SYNC_OPPOSITE_COLORS[color.toUpperCase()] || color

const mixVtSyncHex = (start: string, end: string, amount: number): string => {
 const parse = (color: string) => color.replace("#", "").match(/.{1,2}/g)?.map((part) => Number.parseInt(part, 16)) || [0, 0, 0]
 const [startRed, startGreen, startBlue] = parse(start)
 const [endRed, endGreen, endBlue] = parse(end)
 const channel = (from: number, to: number) => Math.round(from + (to - from) * amount).toString(16).padStart(2, "0")
 return `#${channel(startRed, endRed)}${channel(startGreen, endGreen)}${channel(startBlue, endBlue)}`.toUpperCase()
}

const rgbaFromVtSyncHex = (color: string, alpha: number): string => {
 const channels = color.replace("#", "").match(/.{1,2}/g)?.map((part) => Number.parseInt(part, 16)) || [0, 0, 0]
 return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`
}

const stableAlphabeticPosition = (value: string): number => {
 const letters = value.normalize("NFKD").toUpperCase().replace(/[^A-Z]/g, "")
 if (!letters) return 0
 const digits = [0, 1, 2].map((index) => Math.max(0, Math.min(25, (letters.charCodeAt(index) || 65) - 65)))
 const coordinate = digits[0] + digits[1] / 26 + digits[2] / (26 * 26)
 return coordinate / (25 + 25 / 26 + 25 / (26 * 26))
}

export const getVtSyncAlphabeticSpectrumColors = (
 value: unknown,
 library: string[] = [],
): { stroke: string; fill: string } => {
 const key = String(value ?? "").trim().toUpperCase()
 const sortedLibrary = [...new Set(library.map((entry) => String(entry).trim().toUpperCase()).filter(Boolean))]
  .sort((left, right) => left.localeCompare(right))
 const index = sortedLibrary.indexOf(key)
 const position = index >= 0 && sortedLibrary.length > 1
  ? index / (sortedLibrary.length - 1)
  : stableAlphabeticPosition(key)
 const scaled = Math.max(0, Math.min(1, position)) * (VT_SYNC_ALPHABETIC_SPECTRUM_PALETTE.length - 1)
 const lower = Math.floor(scaled)
 const upper = Math.min(VT_SYNC_ALPHABETIC_SPECTRUM_PALETTE.length - 1, Math.ceil(scaled))
 const stroke = mixVtSyncHex(VT_SYNC_ALPHABETIC_SPECTRUM_PALETTE[lower], VT_SYNC_ALPHABETIC_SPECTRUM_PALETTE[upper], scaled - lower)
 return { stroke, fill: rgbaFromVtSyncHex(stroke, .35) }
}

export const getVtSyncBadgeValues = (value: unknown): string[] => {
 const collect = (entry: unknown): string[] => {
  if (entry === null || entry === undefined || entry === "") return []
  if (Array.isArray(entry)) return entry.flatMap(collect)
  if (typeof entry === "object") return Object.values(entry).flatMap(collect)
  const text = String(entry).trim()
  if (!text) return []
  if (/^[\[{]/.test(text)) {
   try { return collect(JSON.parse(text)) } catch { /* use the delimited fallback */ }
  }
  return text.split(/\s*[|,]\s*/).map((part) => part.trim()).filter(Boolean)
 }

 const seen = new Set<string>()
 return collect(value).filter((entry) => {
  const key = entry.toLocaleUpperCase()
  if (seen.has(key)) return false
  seen.add(key)
  return true
 })
}

export const buildVtSyncAlphabeticSpectrumLibrary = (values: unknown[]): string[] =>
 [...new Set(values.flatMap(getVtSyncBadgeValues).map((value) => value.toLocaleUpperCase()))]
  .sort((left, right) => left.localeCompare(right))

export type VtSyncCategoryBadgePresentation = {
 label: string
 colors: { stroke: string; fill: string }
}

export const getVtSyncCategoryBadgePresentation = (value: unknown): VtSyncCategoryBadgePresentation => {
 const label = String(value ?? "").trim().replace(/\bHowto\b/gi, "How to") || "Unknown"
 return {
  label,
  colors: getVtSyncAlphabeticSpectrumColors(label),
 }
}

export const getVtSyncRankColor = (strength: number, opposite = false): string => {
 const colors = opposite ? [...VT_SYNC_SPARK_RANK_PALETTE].reverse() : [...VT_SYNC_SPARK_RANK_PALETTE]
 const clamped = Math.max(0, Math.min(1, Number(strength) || 0))
 const scaled = clamped * (colors.length - 1)
 const index = Math.min(colors.length - 2, Math.floor(scaled))
 return mixVtSyncHex(colors[index], colors[index + 1], scaled - index)
}

export const getVtSyncSparkGradient = (opposite = false): string => {
 const colors = opposite ? [...VT_SYNC_SPARK_RANK_PALETTE].reverse() : [...VT_SYNC_SPARK_RANK_PALETTE]
 return `linear-gradient(90deg, ${colors[0]} 0%, ${colors[1]} 27%, ${colors[2]} 50%, ${colors[3]} 75%, ${colors[4]} 100%)`
}

export type VtSyncSparkFillStyle = {
 width: string
 background: string
 backgroundPosition?: string
 backgroundRepeat?: string
 backgroundSize?: string
}

export const getVtSyncSparkFillStyle = (
 strength: number,
 background: string,
 mode: "solid" | "rank" | "spectrum",
): VtSyncSparkFillStyle => {
 const clamped = Math.max(0, Math.min(1, Number(strength) || 0))
 const style: VtSyncSparkFillStyle = {
  width: `${Number((clamped * 100).toFixed(4))}%`,
  background,
 }
 if (mode !== "spectrum" || clamped === 0) return style

 // The fill clips a gradient sized to the complete track. A partial bar therefore
 // reveals only the corresponding left portion instead of compressing the full
 // blue-to-red spectrum into every non-zero value.
 return {
  ...style,
  backgroundPosition: "left center",
  backgroundRepeat: "no-repeat",
  backgroundSize: `${Number((100 / clamped).toFixed(4))}% 100%`,
 }
}

export const getVtSyncSparkColor = (
 baseColor: string,
 strength: number,
 mode: "solid" | "rank" | "spectrum",
 opposite = false,
): string => mode === "rank"
 ? getVtSyncRankColor(strength, opposite)
 : opposite ? getVtSyncOppositeColor(baseColor) : baseColor

export type VtSyncTableGeometry = {
 mode: "sparse" | "grouped" | "large"
 useGroups: boolean
 canPin: boolean
 rowHeight: number
 totalsHeight: number
 columnHeaderHeight: number
}

export const getVtSyncTableGeometry = (
 columnCount: number,
 compact: boolean,
 sparklines: boolean,
 layoutMode: VtSyncTableDefinition["layoutMode"] = "auto",
 compactMode: VtSyncTableDefinition["compactMode"] = "supported",
): VtSyncTableGeometry => {
 const effectiveCompact = compact && compactMode !== "normal-only"
 const forceSparse = layoutMode === "sparse-full"
 const useGroups = !forceSparse && columnCount > 8
 const rowHeight = effectiveCompact ? getVtSyncRowHeight(true, sparklines) : useGroups ? 48 : 64
 return {
  mode: forceSparse || columnCount <= 8 ? "sparse" : columnCount <= 9 ? "grouped" : "large",
  useGroups,
  canPin: !forceSparse && columnCount > 9,
  rowHeight,
  totalsHeight: effectiveCompact ? 16 : useGroups ? 48 : 64,
  columnHeaderHeight: effectiveCompact ? 84 : useGroups ? 82 : 64,
 }
}

export type VtSyncSparseColumnWidth = {
 key: string
 width: number
 overridden?: boolean
}

export const distributeVtSyncSparseColumnWidths = (
 columns: VtSyncSparseColumnWidth[],
 viewportWidth: number,
 rowRailWidth = VT_SYNC_ROW_NUMBER_WIDTH,
): Record<string, number> => {
 const resolved = Object.fromEntries(columns.map((column) => [column.key, column.width]))
 const availableWidth = Math.max(0, Math.floor(viewportWidth - rowRailWidth))
 const baseWidth = columns.reduce((sum, column) => sum + column.width, 0)
 const flexible = columns.filter((column) => !column.overridden)
 if (availableWidth <= baseWidth || !flexible.length) return resolved

 const surplus = availableWidth - baseWidth
 const flexibleBase = flexible.reduce((sum, column) => sum + column.width, 0) || flexible.length
 let assigned = 0
 flexible.forEach((column, index) => {
  const addition = index === flexible.length - 1
   ? surplus - assigned
   : Math.floor(surplus * (column.width / flexibleBase))
  assigned += addition
  resolved[column.key] = column.width + addition
 })
 return resolved
}

export type VtSyncVideoTitleLayout = { fontSize: number; lineCount: 1 | 2 }

export const getVtSyncVideoTitleLayout = (
 value: unknown,
 compact: boolean,
 measuredWidth?: number,
 availableWidth = 287,
): VtSyncVideoTitleLayout => {
 if (compact) return { fontSize: 10, lineCount: 1 }
 const text = String(value ?? "").trim()
 const resolvedWidth = measuredWidth ?? text.length * 8.25
 return resolvedWidth <= availableWidth
  ? { fontSize: 16, lineCount: 1 }
  : { fontSize: 10, lineCount: 2 }
}

export const clampVtSyncColumnWidth = (width: number): number =>
 Math.round(Math.max(40, Math.min(520, width)))

export const getVtSyncColumnStateKey = (tableId: string, columnKey: string): string =>
 `${tableId}|${columnKey}`

export const reorderVtSyncColumnsWithinGroup = (
 columns: VtSyncTableColumnDefinition[],
 sourceKey: string,
 targetKey: string,
): VtSyncTableColumnDefinition[] => {
 const source = columns.findIndex((column) => column.key === sourceKey)
 const target = columns.findIndex((column) => column.key === targetKey)
 if (source < 0 || target < 0 || source === target || columns[source].group !== columns[target].group) return columns
 const reordered = [...columns]
 const [moved] = reordered.splice(source, 1)
 reordered.splice(target, 0, moved)
 return reordered
}

export type VtSyncColumnWidthOptions = {
 tableId: string
 column: VtSyncTableColumnDefinition
 columnIndex: number
 compact: boolean
 sparklines: boolean
 compactWidths?: Record<string, number>
 override?: number
}

export const resolveVtSyncColumnWidth = ({
 tableId,
 column,
 columnIndex,
 compact,
 sparklines,
 compactWidths = {},
 override,
}: VtSyncColumnWidthOptions): number => {
 if (override !== undefined) return clampVtSyncColumnWidth(override)
 if (column.preferredWidth !== undefined) return clampVtSyncColumnWidth(column.preferredWidth)
 if (tableId === "videos" && column.key === "publishedAt") return compact ? 112 : 132
 if (tableId === "videos" && !compact) return VT_SYNC_VIDEO_NON_COMPACT_WIDTHS[columnIndex] || 90
 if (tableId === "videos" && compact && columnIndex === 0) return getVtSyncCompactThumbnailWidth(sparklines)
 if (tableId === "videos" && compact && columnIndex === 1) return 120
 if (compact) return compactWidths[column.key] ?? 54
 return column.format === "text" || column.format === "json" ? 112 : 72
}

export type VtSyncCategoryClickState = {
 categoryId: string
 tableId: string
 dropdownId: string | null
}

export const getVtSyncCategoryClickState = (
 current: VtSyncCategoryClickState,
 category: VtSyncToolboxCategory,
): VtSyncCategoryClickState => {
 const hasSubsets = category.tableIds.length > 1
 if (!hasSubsets) return { categoryId: category.id, tableId: category.tableIds[0], dropdownId: null }
 if (current.categoryId !== category.id) {
  return { categoryId: category.id, tableId: category.tableIds[0], dropdownId: category.id }
 }
 return {
  categoryId: category.id,
  tableId: category.tableIds.includes(current.tableId) ? current.tableId : category.tableIds[0],
  dropdownId: current.dropdownId === category.id ? null : category.id,
 }
}

export type VtSyncToolboxCategory = {
 id: "content" | "daily" | "channel" | "traffic" | "audience" | "global" | "revenue"
 label: string
 tableIds: string[]
 colors: { icon: string; label: string; shadow: string }
}

export const VT_SYNC_TOOLBOX_CATEGORIES: VtSyncToolboxCategory[] = [
 { id: "content", label: "Content", tableIds: ["videos", "playlists", "creator", "locations"], colors: { icon: "#ff83ea", label: "#40c6e9", shadow: "rgba(64,198,233,.52)" } },
 { id: "daily", label: "Daily", tableIds: ["daily", "weekly", "monthly"], colors: { icon: "#40c6e9", label: "#4fff5b", shadow: "rgba(79,255,91,.52)" } },
 { id: "channel", label: "Channel", tableIds: ["channel_totals"], colors: { icon: "#ffb570", label: "#579aff", shadow: "rgba(87,154,255,.52)" } },
 { id: "traffic", label: "Traffic", tableIds: ["traffic", "search", "ext_web", "suggested", "chan_page", "hashtags", "sound", "adv", "other_feat"], colors: { icon: "#ffff61", label: "#4fff5b", shadow: "rgba(79,255,91,.52)" } },
 { id: "audience", label: "Audience", tableIds: ["demographics", "subs", "devices", "os"], colors: { icon: "#cc00ff", label: "#ffff61", shadow: "rgba(255,255,97,.52)" } },
 { id: "global", label: "Global", tableIds: ["geography", "cities", "provinces", "dma"], colors: { icon: "#4fff5b", label: "#ff83ea", shadow: "rgba(255,131,234,.52)" } },
 { id: "revenue", label: "Revenue", tableIds: ["ads"], colors: { icon: "#579aff", label: "#ff83ea", shadow: "rgba(255,131,234,.52)" } },
]

export const VT_SYNC_COMPACT_PIN_TABLE_IDS = new Set(["videos", "playlists", "daily", "weekly", "monthly", "channel_totals", "geography"])

export const findVtSyncTable = (id: string): VtSyncTableDefinition =>
 VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((table) => table.id === id) || VT_SYNC_VISIBLE_TABLE_DEFINITIONS[0]

export const buildVtSyncTableViewModel = (
 snapshot: VtSyncSnapshot,
 table: VtSyncTableDefinition,
 privacyFilters?: VtSyncPrivacyFilters,
) => ({
 table,
 rows: tableRows(snapshot, table, privacyFilters),
 columns: table.columns,
})

export const isMissingVtSyncValue = (value: unknown): boolean => value === null || value === undefined || value === ""

export const getVtSyncHoverScrollIntent = (relativeX: number, viewportWidth: number): VtSyncHoverScrollIntent => {
 if (viewportWidth <= 0 || relativeX < 0 || relativeX > viewportWidth) return { direction: 0, speed: 1 }
 const fastBand = viewportWidth * .075
 const normalBand = viewportWidth * .15
 if (relativeX >= viewportWidth - fastBand) return { direction: 1, speed: 2 }
 if (relativeX >= viewportWidth - normalBand) return { direction: 1, speed: 1 }
 if (relativeX <= fastBand) return { direction: -1, speed: 2 }
 if (relativeX <= normalBand) return { direction: -1, speed: 1 }
 return { direction: 0, speed: 1 }
}

export const toVtSyncNumber = (value: unknown): number | undefined => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string" || !value.trim()) return undefined
 const parsed = Number(value.replace(/[$,% ,]/g, ""))
 return Number.isFinite(parsed) ? parsed : undefined
}

export const toVtSyncDurationSeconds = (value: unknown): number | undefined =>
 parseVtSyncDurationSeconds(value, "duration")

export const splitVtSyncSpecialCharacters = (
 text: string,
 columnKey: string,
): { value: string; prefix?: string; suffix?: string; isNegative?: boolean } => {
 let prefix = undefined
 let suffix = undefined
 let value = text
 let isNegative = false

 if (value.startsWith("-")) {
  isNegative = true
  value = value.slice(1)
 }

 if (value.startsWith("$")) {
  prefix = "$"
  value = value.slice(1)
 }

 if (value.endsWith("%")) {
  suffix = "%"
  value = value.slice(0, -1)
 } else if (VT_SYNC_HALF_SIZE_SECONDS_COLUMNS.has(columnKey) && value.endsWith(":00")) {
  suffix = ":00"
  value = value.slice(0, -3)
 }

 return { value, prefix, suffix, isNegative }
}

const isVtSyncDurationFormat = (format: VtSyncTableColumnDefinition["format"]): format is VtSyncDurationFormat =>
 ["duration", "durationHours", "durationMinutes"].includes(format || "")

const getVtSyncColumnDurationSeconds = (value: unknown, column: VtSyncTableColumnDefinition): number | undefined =>
 isVtSyncDurationFormat(column.format) ? parseVtSyncDurationSeconds(value, column.format) : undefined

export const isMeaningfulVtSyncNumericValue = (value: number | undefined): value is number =>
 value !== undefined && value !== 0

export const getVtSyncNumericRank = (value: number | undefined, sortedValues: number[] | undefined): number => {
 if (!isMeaningfulVtSyncNumericValue(value) || !sortedValues || sortedValues.length === 0) return 0
 const index = sortedValues.lastIndexOf(value)
 return index === -1 ? 0 : (index + 1) / sortedValues.length
}

export const getVtSyncColumnSortedValues = (
 rows: VtSyncTableRow[],
 column: VtSyncTableColumnDefinition,
): number[] => {
 if (column.visualization === "none" || column.semanticRole === "identity") return []
 const values = rows
  .map((row) => isVtSyncDurationFormat(column.format) ? getVtSyncColumnDurationSeconds(row[column.key], column) : toVtSyncNumber(row[column.key]))
  .filter(isMeaningfulVtSyncNumericValue)
 return values.sort((a, b) => a - b)
}

export const isMeaningfulVtSyncValue = (value: unknown): boolean => {
 if (isMissingVtSyncValue(value)) return false
 const numeric = toVtSyncNumber(value)
 if (numeric !== undefined) return numeric !== 0
 if (Array.isArray(value)) return value.length > 0
 if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0
 return String(value).trim().length > 0
}

export const getVisibleVtSyncColumns = (
 table: VtSyncTableDefinition,
 rows: VtSyncTableRow[],
 showFormulas: boolean,
 showAllColumns: boolean,
): VtSyncTableColumnDefinition[] => {
 const meaningfulGroups = new Set(
  table.columns
   .filter((column) => column.visibility === "whenMeaningful" && rows.some((row) => isMeaningfulVtSyncValue(row[column.key])))
   .map((column) => column.group),
 )
 return table.columns.filter((column) => {
  if (!showFormulas && column.isFormula) return false
  if (!showAllColumns && column.defaultVisible === false) return false
  if (column.visibility === "whenMeaningful" && !meaningfulGroups.has(column.group)) return false
  return true
 })
}

export const getVtSyncPresentationColumns = (
 tableId: string,
 columns: VtSyncTableColumnDefinition[],
): VtSyncTableColumnDefinition[] => tableId === "videos"
 ? columns.filter((column) => !VT_SYNC_VIDEO_COMPOSITE_HIDDEN_COLUMNS.has(column.key))
 : columns

const VT_SYNC_VIDEO_SORT_SEQUENCE: readonly VtSyncSortState[] = [
 { key: "title", direction: "asc" },
 { key: "videoId", direction: "asc" },
 { key: "title", direction: "desc" },
 { key: "videoId", direction: "desc" },
]

const VT_SYNC_PUBLISHED_SORT_SEQUENCE: readonly VtSyncSortState[] = [
 { key: "publishedAt", direction: "desc" },
 { key: "publishedTime", direction: "asc" },
 { key: "publishedDay", direction: "asc" },
 { key: "publishedAt", direction: "asc" },
 { key: "publishedTime", direction: "desc" },
 { key: "publishedDay", direction: "desc" },
]

const getVtSyncCompositeSortSequence = (tableId: string, columnKey: string): readonly VtSyncSortState[] | undefined => {
 if (tableId !== "videos") return undefined
 if (columnKey === "title") return VT_SYNC_VIDEO_SORT_SEQUENCE
 if (columnKey === "publishedAt") return VT_SYNC_PUBLISHED_SORT_SEQUENCE
 return undefined
}

export const getNextVtSyncCompositeSortState = (
 tableId: string,
 columnKey: string,
 current: VtSyncSortState,
): VtSyncSortState | undefined => {
 const sequence = getVtSyncCompositeSortSequence(tableId, columnKey)
 if (!sequence) return undefined
 const index = sequence.findIndex((entry) => entry.key === current.key && entry.direction === current.direction)
 return sequence[(index + 1) % sequence.length]
}

export const isVtSyncCompositeSortActive = (
 tableId: string,
 columnKey: string,
 sort: VtSyncSortState,
): boolean => Boolean(getVtSyncCompositeSortSequence(tableId, columnKey)?.some((entry) => entry.key === sort.key && entry.direction === sort.direction))

const VT_SYNC_COMPOSITE_SORT_LABELS: Record<string, string> = {
 title: "Title",
 videoId: "Video ID",
 publishedAt: "Date",
 publishedTime: "Time",
 publishedDay: "Weekday",
}

export const getVtSyncCompositeSortLabel = (
 tableId: string,
 columnKey: string,
 sort: VtSyncSortState,
): string | undefined => {
 const sequence = getVtSyncCompositeSortSequence(tableId, columnKey)
 if (!sequence) return undefined
 return VT_SYNC_COMPOSITE_SORT_LABELS[sort.key] || sort.key
}

const getVtSyncSortNumber = (
 value: unknown,
 column?: VtSyncTableColumnDefinition,
 sortKey?: string,
): number | undefined => {
 if (sortKey === "publishedMonth") return getVtSyncLocalMonthIndex(value)
 if (isVtSyncDurationFormat(column?.format)) return parseVtSyncDurationSeconds(value, column.format)
 if (column?.format === "weekdayLocal") return getVtSyncLocalWeekdayIndex(value)
 if (column?.format === "timeLocal") return getVtSyncLocalTimeSeconds(value)
 if (column?.format === "date" || column?.format === "dateLocal") return parseVtSyncDateValue(value)
 if (column?.format === "dateRange") return parseVtSyncDateValue(String(value ?? "").split(/\s+-\s+/)[0])
 return toVtSyncNumber(value)
}

export const stableSortVtSyncRows = (
 rows: VtSyncTableRow[],
 sort: VtSyncSortState,
 column?: VtSyncTableColumnDefinition,
): VtSyncTableRow[] =>
 rows.map((row, index) => ({ row, index })).sort((left, right) => {
  const a = sort.key === "publishedMonth" ? left.row.publishedAt : left.row[sort.key]
  const b = sort.key === "publishedMonth" ? right.row.publishedAt : right.row[sort.key]
  const an = getVtSyncSortNumber(a, column, sort.key)
  const bn = getVtSyncSortNumber(b, column, sort.key)
  let comparison: number
  if (an !== undefined && bn !== undefined) comparison = an - bn
  else {
   const ad = typeof a === "string" ? Date.parse(a) : Number.NaN
   const bd = typeof b === "string" ? Date.parse(b) : Number.NaN
   comparison = Number.isFinite(ad) && Number.isFinite(bd) ? ad - bd : String(a ?? "").localeCompare(String(b ?? ""))
  }
  if (comparison === 0) return left.index - right.index
  return sort.direction === "desc" ? -comparison : comparison
 }).map(({ row }) => row)

const csvEscape = (value: string): string => /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

export const exportVtSyncTableCsv = (
 table: VtSyncTableDefinition,
 rows: VtSyncTableRow[],
 columns: VtSyncTableColumnDefinition[] = table.columns,
): string => {
 const visibleTable = { ...table, columns }
 return [
  getVtSyncTableExportHeaders(visibleTable).map(csvEscape).join(","),
  ...getVtSyncTableExportRows(visibleTable, rows).map((row) => row.map(csvEscape).join(",")),
 ].join("\n")
}

const parseCsvMatrix = (text: string): string[][] => {
 const rows: string[][] = []
 let row: string[] = []
 let value = ""
 let quoted = false
 const source = text.replace(/^\uFEFF/, "")
 for (let index = 0; index < source.length; index += 1) {
  const character = source[index]
  if (character === '"' && quoted && source[index + 1] === '"') { value += '"'; index += 1 }
  else if (character === '"') quoted = !quoted
  else if (character === "," && !quoted) { row.push(value); value = "" }
  else if ((character === "\n" || character === "\r") && !quoted) {
   if (character === "\r" && source[index + 1] === "\n") index += 1
   row.push(value)
   if (row.some((cell) => cell.trim())) rows.push(row)
   row = []
   value = ""
  } else value += character
 }
 row.push(value)
 if (row.some((cell) => cell.trim())) rows.push(row)
 return rows
}

export const parseVtSyncCsvText = (text: string): VtSyncTableRow[] => {
 const [headers = [], ...rows] = parseCsvMatrix(text)
 return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header.trim(), row[index] ?? ""])))
}

const normalizeCsvHeader = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, "")

const CSV_COLUMN_ALIASES: Record<string, string[]> = {
 thumbnail: ["cover", "thumbnail url", "image"],
 title: ["video title"],
 videoId: ["id", "video id"],
 videoUrl: ["link", "url", "video url"],
 publishedAt: ["date", "upload date", "published at"],
 publishedDay: ["day", "upload day", "day of week"],
 publishedTime: ["time", "upload time", "time of day"],
 descriptionSnippet: ["description", "description preview"],
 privacyStatus: ["status", "privacy"],
 duration: ["time", "video duration"],
 definition: ["quality"],
 caption: ["captions"],
 averagePercentageViewed: ["avg % viewed", "average view percentage", "average percentage viewed"],
 avgViewDuration: ["avg. view dur.", "average view duration"],
 impressions: ["thumb impressions", "thumbnail impressions"],
 ctr: ["thumb ctr", "thumbnail ctr"],
 videosAddedToPlaylists: ["playlist saves", "added to playlists"],
 videosRemovedFromPlaylists: ["playlist removals", "removed from playlists"],
 subscribersGained: ["subs gained"],
 subscribersLost: ["subs lost"],
 revenue: ["est. revenue", "estimated revenue"],
 playbackBasedCpm: ["playback cpm"],
 monetizedPlaybacks: ["monetized plays"],
 estimatedAdRevenue: ["ad revenue"],
 youtubePremiumWatchTime: ["premium watch", "youtube premium watch time"],
 youtubePremiumRevenue: ["premium revenue"],
 clicksPerCardShown: ["card click %"],
 cardTeasersShown: ["teasers shown"],
 cardTeaserClicks: ["teaser clicks"],
 teaserClicksPerCardTeaserShown: ["teaser click %"],
 endScreenElementsShown: ["end screens shown"],
 endScreenElementClicks: ["end screen clicks"],
 clicksPerEndScreenElementShown: ["end screen click %"],
 stayedToWatch: ["stayed to watch %"],
 countryCode: ["country", "country code"],
 countryName: ["country name"],
 countryFlag: ["flag"],
 provinceCode: ["province", "state code", "us states"],
 stateName: ["state", "state name"],
 dmaCode: ["dma", "dma region", "dma code"],
 dmaName: ["dma area", "dma name"],
}

const parseImportedValue = (value: unknown, column: VtSyncTableColumnDefinition): unknown => {
 if (value === null || value === undefined) return undefined
 const trimmed = String(value).trim()
 if (!trimmed) return undefined
 if (["number", "currency", "percent"].includes(column.format || "")) {
  const parsed = Number(trimmed.replace(/[$,%\s,]/g, ""))
  return Number.isFinite(parsed) ? parsed : undefined
 }
 if (isVtSyncDurationFormat(column.format)) {
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed)
  const seconds = parseVtSyncDurationSeconds(trimmed, "duration")
  if (seconds === undefined) return undefined
  if (column.format === "durationHours") return seconds / 3600
  if (column.format === "durationMinutes") return seconds / 60
  return seconds
 }
 if (column.format === "json") {
  if (/^[[{]/.test(trimmed)) {
   try { return JSON.parse(trimmed) } catch { /* fall through to delimited text */ }
  }
  return trimmed.split(/[|,]/).map((entry) => entry.trim()).filter(Boolean)
 }
 if (column.key === "caption") return /^(true|yes|on|1)$/i.test(trimmed) ? "true" : /^(false|no|off|0)$/i.test(trimmed) ? "false" : trimmed
 return trimmed
}

export const mapVtSyncCsvRowsToTable = (
 table: VtSyncTableDefinition,
 rows: VtSyncTableRow[],
): VtSyncTableRow[] => {
 const keyByHeader = new Map<string, VtSyncTableColumnDefinition>()
 table.columns.forEach((column) => {
  ;[column.key, column.label, ...(CSV_COLUMN_ALIASES[column.key] || [])].forEach((alias) => keyByHeader.set(normalizeCsvHeader(alias), column))
 })
 const mappedRows = rows.map((row) => {
  const mapped: VtSyncTableRow = {}
  Object.entries(row).forEach(([header, value]) => {
   const column = keyByHeader.get(normalizeCsvHeader(header))
   if (!column) return
   const parsed = parseImportedValue(value, column)
   if (parsed !== undefined) mapped[column.key] = parsed
  })
  return mapped
 }).filter((row) => Object.keys(row).length > 0)
 return normalizeVtSyncTableRows(table.id, mappedRows)
}

const tableForCsv = (fileName: string, rows: VtSyncTableRow[], fallbackTableId?: string): VtSyncTableDefinition | undefined => {
 const normalizedName = fileName.replace(/\.csv$/i, "").replace(/^viewtube-/i, "").replace(/-\d{4}-\d{2}-\d{2}$/i, "")
 const byName = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((item) => item.id === normalizedName || item.exportName === fileName)
 if (byName) return byName
 const headers = Object.keys(rows[0] || {}).map(normalizeCsvHeader)
 const scored = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => ({
  table,
  score: table.columns.reduce((score, column) => score + (headers.some((header) =>
   [column.key, column.label, ...(CSV_COLUMN_ALIASES[column.key] || [])].map(normalizeCsvHeader).includes(header),
  ) ? 1 : 0), 0),
 })).sort((left, right) => right.score - left.score)
 if (scored[0]?.score >= 2 && scored[0].score > (scored[1]?.score || 0)) return scored[0].table
 return fallbackTableId ? findVtSyncTable(fallbackTableId) : undefined
}

export const importVtSyncCsvFiles = async (
 files: FileList | File[],
 fallbackTableId?: string,
): Promise<VtSyncImportedRows> => {
 const imported: VtSyncImportedRows = {}
 for (const file of Array.from(files)) {
  const parsed = parseVtSyncCsvText(await file.text())
  const table = tableForCsv(file.name, parsed, fallbackTableId)
  if (table) imported[table.id] = mapVtSyncCsvRowsToTable(table, parsed)
 }
 return imported
}

export const formatVtSyncColumnValue = (row: VtSyncTableRow, column: VtSyncTableColumnDefinition): string => {
 const value = row[column.key]
 if (isVtSyncDurationFormat(column.format)) {
  const seconds = parseVtSyncDurationSeconds(value, column.format)
  return seconds === 0 ? "" : formatVtSyncTableCellValue(value, column.format)
 }
 if (column.key === "privacyStatus" && !isMissingVtSyncValue(value)) {
  const text = String(value)
  return `${text.charAt(0).toUpperCase()}${text.slice(1).toLowerCase()}`
 }
 if (column.key === "definition" && !isMissingVtSyncValue(value)) {
  const definition = String(value).toLowerCase()
  if (definition === "hd") return "1080p"
  if (definition === "sd") return "480p"
 }
 if (column.key === "caption" && !isMissingVtSyncValue(value)) {
  if (/^(true|yes|1)$/i.test(String(value))) return "Yes"
  if (/^(false|no|0)$/i.test(String(value))) return "No"
 }
 if (["number", "currency", "percent"].includes(column.format || "") && toVtSyncNumber(value) === 0) return ""
 return formatVtSyncTableCellValue(value, column.format)
}

const mode = (values: unknown[]): string => {
 const counts = new Map<string, number>()
 values.flatMap((value) => Array.isArray(value) ? value : [value]).forEach((value) => {
  if (isMissingVtSyncValue(value)) return
  const text = String(value).trim()
  if (text) counts.set(text, (counts.get(text) || 0) + 1)
 })
 return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] || "-"
}

const topValues = (values: unknown[], limit = 3): string => {
 const counts = new Map<string, number>()
 values.flatMap((value) => Array.isArray(value) ? value : String(value ?? "").split(",")).forEach((value) => {
  const text = String(value).trim()
  if (text) counts.set(text, (counts.get(text) || 0) + 1)
 })
 return [...counts.entries()].sort((left, right) => right[1] - left[1]).slice(0, limit).map(([value, count]) => `${value} (${count})`).join(", ") || "-"
}

const topBadges = (values: unknown[], limit = 3): { value: string; count: number }[] => {
 const counts = new Map<string, number>()
 values.flatMap((value) => Array.isArray(value) ? value : String(value ?? "").split(",")).forEach((value) => {
  const text = String(value).trim()
  if (text) counts.set(text, (counts.get(text) || 0) + 1)
 })
 return [...counts.entries()].sort((left, right) => right[1] - left[1]).slice(0, limit).map(([value, count]) => ({ value, count }))
}

export const totalVtSyncColumn = (
 rows: VtSyncTableRow[],
 column: VtSyncTableColumnDefinition,
 context?: VtSyncTableTotalContext,
): VtSyncTableTotal => {
 if (context) {
  if (column.key === "thumbnail") return { primary: context.avatarUrl ? "" : "-", imageUrl: context.avatarUrl || undefined, kind: "image" }
  if (column.key === "title") return { primary: context.channelName || "Channel", secondary: "Channel title", kind: "context" }
  if (column.key === "videoId") return { primary: `${rows.length.toLocaleString()} videos`, secondary: "Library size", kind: "context" }
  if (column.key === "videoUrl") return { primary: context.channelCustomUrl || "-", secondary: "Channel link", kind: "context" }
  if (column.key === "publishedAt") {
   const years = rows.map((row) => new Date(String(row.publishedAt || "")).getFullYear()).filter(Number.isFinite)
   return { primary: years.length ? `Since ${Math.min(...years)}` : "-", secondary: "First upload", kind: "context" }
  }
  if (column.key === "descriptionSnippet") return { primary: context.channelDescription || "-", secondary: "Channel description", kind: "context" }
  if (column.key === "tags") return { primary: "", badges: topBadges(rows.map((row) => row.tags)), secondary: "Top tags", kind: "context" }
  if (column.key === "topics") return { primary: "", badges: topBadges(rows.map((row) => row.topics)), secondary: "Top topics", kind: "context" }
  if (column.key === "category") return { primary: "", badges: topBadges(rows.map((row) => row.category)), secondary: "Top categories", kind: "context" }
  if (column.key === "format") {
   const formats = rows.map((row) => String(row.format || "").toLowerCase())
   const shorts = formats.filter((value) => value === "short").length
   const live = formats.filter((value) => value === "live").length
   const long = formats.filter((value) => value === "long").length
   const badges = []
   if (long > 0) badges.push({ value: "long", count: long })
   if (shorts > 0) badges.push({ value: "short", count: shorts })
   if (live > 0) badges.push({ value: "live", count: live })
   badges.sort((a, b) => b.count - a.count)
   return { primary: "", badges: badges.slice(0, 3), secondary: "Formats", kind: "context" }
  }
  if (["privacyStatus", "definition", "caption"].includes(column.key)) return { primary: mode(rows.map((row) => formatVtSyncColumnValue(row, column))), secondary: "Most common", kind: "context" }
  if (isVtSyncDurationFormat(column.format)) {
   const durations = rows.map((row) => parseVtSyncDurationSeconds(row[column.key], column.format)).filter((v) => v > 0)
   return { primary: durations.length ? formatVtSyncDurationSeconds(durations.reduce((sum, value) => sum + value, 0) / durations.length) : "", secondary: "Avg duration", kind: "context" }
  }
 }
 if (column.visualization === "none" || column.semanticRole === "identity") return { primary: "", kind: "muted" }
 const values = rows.map((row) => toVtSyncNumber(row[column.key])).filter(isMeaningfulVtSyncNumericValue)
 if (!values.length) return { primary: "", kind: "muted" }
 const sum = values.reduce((total, value) => total + value, 0)
 const mean = sum / values.length
 const average = column.format === "percent" || /avg|average|ratio|rate|cpm|rpm|per /i.test(column.label)
 return average
  ? { primary: formatVtSyncTableCellValue(mean, column.format), secondary: "Mean avg", kind: "numeric" }
  : { primary: formatVtSyncTableCellValue(sum, column.format), secondary: `Avg ${formatVtSyncTableCellValue(mean, column.format)}`, kind: "numeric" }
}

export type VtSyncTextMeasurer = (value: string, font: string) => number

export const measureVtSyncCompactColumnWidths = (
 table: VtSyncTableDefinition,
 rows: VtSyncTableRow[],
 measureText: VtSyncTextMeasurer,
 context?: VtSyncTableTotalContext,
): Record<string, number> => {
 const sampleRows = rows.length > 400 ? rows.slice(0, 400) : rows
 const cellFont = "1000 11px 'Inter', sans-serif"
 const secondaryFont = "700 8px 'Inter', sans-serif"

 return Object.fromEntries(table.columns.map((column) => {
  let maxContentWidth = 0
  let numericCount = 0
  let textCount = 0

  sampleRows.forEach((row) => {
   const raw = row[column.key]
   if (typeof raw === "number") numericCount += 1
   else if (!isMissingVtSyncValue(raw)) textCount += 1
   const displayed = formatVtSyncColumnValue(row, column)
   maxContentWidth = Math.max(maxContentWidth, measureText(displayed, cellFont))
  })

  const total = totalVtSyncColumn(rows, column, context)
  maxContentWidth = Math.max(maxContentWidth, measureText(total.primary, cellFont))
  if (total.secondary) maxContentWidth = Math.max(maxContentWidth, measureText(total.secondary, secondaryFont))

  const maximum = column.key === "descriptionSnippet"
   ? 150
   : numericCount >= textCount || column.format === "date" ? 90 : 72
  return [column.key, Math.round(Math.max(54, Math.min(maximum, maxContentWidth + 12)))]
 }))
}
