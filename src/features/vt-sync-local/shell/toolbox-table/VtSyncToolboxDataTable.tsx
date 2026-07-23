import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
 Activity,
 ChevronDown,
 ChevronLeft,
 ChevronRight,
 ChevronUp,
 Clapperboard,
 Clock3,
 Copy,
 DollarSign,
 Download,
 ExternalLink,
 Globe2,
 Maximize2,
 Minimize2,
 Route,
 Search,
 Settings,
 Upload,
 UsersRound,
 Waypoints,
 X,
} from "lucide-react"
import { AnimatedToggleIcon } from "../../../../components/ToolboxUISystem"
import type { VtSyncSnapshot, VtSyncTableColumnDefinition } from "../../adapters/contracts"
import { formatVtSyncDurationSeconds, formatVtSyncLocalMonthValue, formatVtSyncTableCellValue, parseVtSyncDurationSeconds } from "../../adapters/tableFormatting"
import {
 filterVtSyncVideos,
 readVtSyncPrivacyFilters,
 saveVtSyncPrivacyFilters,
 type VtSyncPrivacyFilters,
} from "../../adapters/privacyPolicy"
import {
 VT_SYNC_COMPACT_PIN_TABLE_IDS,
 VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS,
 VT_SYNC_ROW_BATCH_SIZE,
 VT_SYNC_ROW_NUMBER_WIDTH,
 VT_SYNC_SMALL_TABLE_COLORS,
 VT_SYNC_TOOLBOX_CATEGORIES,
 buildVtSyncAlphabeticSpectrumLibrary,
 buildVtSyncTableViewModel,
 clampVtSyncColumnWidth,
 exportVtSyncTableCsv,
 findVtSyncTable,
 formatVtSyncColumnValue,
 distributeVtSyncSparseColumnWidths,
 getVtSyncCategoryClickState,
 getVtSyncApiValuePresentation,
 getVtSyncAlphabeticSpectrumColors,
 getVtSyncBadgeValues,
 getVtSyncCategoryBadgePresentation,
 getVtSyncColumnSortedValues,
 getVtSyncColumnStateKey,
 getVtSyncAbsolutePercentRatio,
 getVtSyncNumericRank,
 getNextVtSyncCompositeSortState,
 getVtSyncCompositeSortLabel,
 getVtSyncPresentationLabel,
 getVtSyncPresentationColumns,
 getVtSyncTableGeometry,
 getVtSyncTableProvenance,
 getVtSyncVideoTitleLayout,
 getVisibleVtSyncColumns,
 getVtSyncHoverScrollIntent,
 getNextVtSyncRowLimit,
 getVtSyncOppositeColor,
 importVtSyncCsvFiles,
 isMissingVtSyncValue,
 isVtSyncCompositeSortActive,
 measureVtSyncCompactColumnWidths,
 resolveVtSyncColumnWidth,
 reorderVtSyncColumnsWithinGroup,
 stableSortVtSyncRows,
 splitVtSyncSpecialCharacters,
 getVtSyncSparkColor,
 getVtSyncSparkFillStyle,
 getVtSyncSparkGradient,
 totalVtSyncColumn,
 toVtSyncNumber,
 type VtSyncImportedRows,
 type VtSyncSortState,
 type VtSyncTableRow,
} from "./vtSyncToolboxTableModel"
import "flag-icons/css/flag-icons.min.css"
import "./VtSyncToolboxDataTable.css"

type Group = { id: string; label: string; color: string; columns: VtSyncTableColumnDefinition[] }
type CssVars = React.CSSProperties & Record<`--${string}`, string | number>

const GROUP_COLORS = ["#40c6e9", "#4fff5b", "#ffff61", "#ffb570", "#ff8aaf", "#ff83ea", "#cc00ff", "#579aff"]

const DISPLAY_HEADER_LABELS: Record<string, string> = {
 thumbnail: "Cover",
 title: "Video",
 videoId: "ID",
 videoUrl: "URL",
 publishedAt: "Published",
 publishedDay: "Day",
 publishedTime: "Time",
 descriptionSnippet: "Description",
 tags: "Tags",
 topics: "Topics",
 category: "Category",
 titleLength: "Letters",
 format: "Format",
 duration: "Time",
 privacyStatus: "Status",
 definition: "Quality",
 caption: "Captions",
 engagedViews: "Engaged Views",
 engagementRate: "Eng. Rate",
 watchTime: "Watch Time",
 averagePercentageViewed: "Avg. % Viewed",
 avgViewDuration: "Avg. View Dur.",
 videosAddedToPlaylists: "Playlist Saves",
 videosRemovedFromPlaylists: "Playlist Removals",
 subscribersGained: "Subs Gained",
 subscribersLost: "Subs Lost",
 playbackBasedCpm: "Playback CPM",
 monetizedPlaybacks: "Monetized Plays",
}

const COLLAPSED_GROUP_DISPLAY_LABELS: Record<string, string> = {
 "Core Engagement": "core engmnt.",
 Subscribers: "subs",
 Revenue: "revenue",
 Advertisement: "advrtsmt.",
 Premium: "premium",
 "Cards & End Screens": "cards",
}

const numericColumnValue = (row: VtSyncTableRow, column: VtSyncTableColumnDefinition): number | undefined =>
 ["duration", "durationHours", "durationMinutes"].includes(column.format || "")
  ? parseVtSyncDurationSeconds(row[column.key], column.format as "duration" | "durationHours" | "durationMinutes")
  : toVtSyncNumber(row[column.key])

const categoryIcon = (category: string) => {
 const props = { size: 25, strokeWidth: 3 }
 if (category === "daily") return <Clock3 {...props} />
 if (category === "channel") return <Waypoints {...props} />
 if (category === "traffic") return <Route {...props} />
 if (category === "audience") return <UsersRound {...props} />
 if (category === "global") return <Globe2 {...props} />
 if (category === "revenue") return <DollarSign {...props} />
 return <Clapperboard {...props} />
}

const groupedColumns = (columns: VtSyncTableColumnDefinition[]): Group[] => {
 const groups: Group[] = []
 columns.forEach((column) => {
  const previous = groups[groups.length - 1]
  if (previous?.label === column.group) previous.columns.push(column)
  else groups.push({ id: `${column.group}-${groups.length}`, label: column.group || "Metrics", color: GROUP_COLORS[groups.length % GROUP_COLORS.length], columns: [column] })
 })
 return groups
}

const splitHeader = (label: string): [string, string?] => {
 const words = label.trim().split(/\s+/)
 if (words.length < 2 || label.length < 14) return [label]
 const midpoint = Math.ceil(words.length / 2)
 return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")]
}

const numberCompact = (value: unknown, suffix = "") => {
 const number = toVtSyncNumber(value)
 if (number === undefined) return "-"
 if (Math.abs(number) >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}M${suffix}`
 if (Math.abs(number) >= 1_000) return `${(number / 1_000).toFixed(1)}K${suffix}`
 return `${Math.round(number).toLocaleString()}${suffix}`
}

const moneyCompact = (value: unknown) => {
 const number = toVtSyncNumber(value)
 return number === undefined ? "-" : `$${number.toLocaleString(undefined, { maximumFractionDigits: number >= 1_000 ? 0 : 2 })}`
}

const durationCompact = (value: unknown) => formatVtSyncTableCellValue(value, "duration")

const downloadCsv = (name: string, csv: string) => {
 const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
 const anchor = document.createElement("a")
 anchor.href = url
 anchor.download = name
 document.body.appendChild(anchor)
 anchor.click()
 anchor.remove()
 window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

const Switch = ({ checked, label, onChange, activeColor = "#4FFF5B" }: { checked: boolean; label: string; onChange: () => void; activeColor?: string }) => (
 <button type="button" className={`vt-sync-switch ${checked ? "is-on" : ""}`} style={{ "--vt-toggle-color": activeColor } as CssVars} role="switch" aria-checked={checked} aria-label={label} onClick={onChange}><span /></button>
)

const SettingControl = ({ label, children, disabled = false }: { label: string; children: React.ReactNode; disabled?: boolean }) => (
 <div className={`vt-sync-settings-control ${disabled ? "is-disabled" : ""}`}><span>{label}</span>{children}</div>
)

const BinaryToggle = ({ label, left, right, leftActive, onChange, color }: { label: string; left: string; right: string; leftActive: boolean; onChange: (left: boolean) => void; color: string }) => (
 <div className="vt-sync-binary-setting">
  <span>{label}</span>
  <div className="vt-sync-binary-toggle" role="group" aria-label={label} style={{ "--vt-binary-color": color } as CssVars}>
   <button type="button" className={leftActive ? "active" : ""} aria-pressed={leftActive} onClick={() => onChange(true)}>{left}</button>
   <button type="button" className={!leftActive ? "active" : ""} aria-pressed={!leftActive} onClick={() => onChange(false)}>{right}</button>
  </div>
 </div>
)

const TernaryToggle = <T extends string>({ label, options, value, onChange, color }: { label: string; options: readonly [T, T, T]; value: T; onChange: (v: T) => void; color: string }) => (
 <div className="vt-sync-binary-setting">
  <span>{label}</span>
  <div className="vt-sync-ternary-toggle" role="group" aria-label={label} style={{ "--vt-binary-color": color } as CssVars}>
   {options.map((opt) => <button key={opt} type="button" className={value === opt ? "active" : ""} aria-pressed={value === opt} onClick={() => onChange(opt)}>{opt}</button>)}
  </div>
 </div>
)

const SpectrumBadgeList = ({ values, library, kind }: { values: string[]; library: string[]; kind: "tags" | "topics" }) => (
 <span className={`vt-sync-spectrum-list is-${kind}`} title={values.join(", ")}>
  {values.map((value) => {
   const colors = getVtSyncAlphabeticSpectrumColors(value, library)
   return <span className="vt-sync-spectrum-badge" style={{ "--vt-badge-stroke": colors.stroke, "--vt-badge-fill": colors.fill } as CssVars} key={value.toLocaleUpperCase()}>{value}</span>
  })}
 </span>
)

const CategoryBadge = ({ value }: { value: unknown }) => {
 const presentation = getVtSyncCategoryBadgePresentation(value)
 return <span className="vt-sync-category-badges" title={presentation.label} style={{ "--vt-badge-stroke": presentation.colors.stroke, "--vt-badge-fill": presentation.colors.fill } as CssVars}>
  <span className="vt-sync-category-badge">{presentation.label}</span>
 </span>
}

const WEEKDAY_BADGE_LIBRARY = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MONTH_BADGE_LIBRARY = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const DemographicCohortCell = ({ row, text }: { row: VtSyncTableRow; text: string }) => {
 let formattedText = text;
 let g = String(row.gender || "").toLowerCase();
 let a = String(row.ageGroup || "").toLowerCase();

 if (!g && !a && row.cohort) {
   const cohortLower = String(row.cohort).toLowerCase()
   if (cohortLower.includes("female")) g = "female"
   else if (cohortLower.includes("male")) g = "male"
   else if (cohortLower.includes("user_specified")) g = "user_specified"

   const ageMatch = cohortLower.match(/age(\d{2}-\d{2}|\d{2}-)/)
   if (ageMatch) a = ageMatch[0]
 }

 if (g || a) {
   const genderDisplay = g === "male" ? "Male" : g === "female" ? "Female" : g === "user_specified" ? "Other" : ""
   const ageDisplay = a ? a.replace("age", "Ages ") : ""
   if (genderDisplay && ageDisplay) formattedText = `${genderDisplay} : ${ageDisplay}`
   else formattedText = `${genderDisplay} ${ageDisplay}`.trim()
 }

 if (g) {
  const isFemale = g === "female"
  const isMale = g === "male"
  const colorClass = isMale ? "is-male" : isFemale ? "is-female" : "is-other"
  return <span className={`vt-sync-demographic-badge ${colorClass}`}>{formattedText}</span>
 }
 return <span className="vt-sync-cell-text">{formattedText}</span>
}

const DemographicAgeCell = ({ row, text }: { row: VtSyncTableRow; text: string }) => (
 <span className="vt-sync-demographic-age" title={`${text} · all genders combined`}>
  <strong>{text}</strong>
  <small>All genders</small>
 </span>
)

const sumAvailablePercentages = (rows: VtSyncTableRow[], key: string): number | undefined => {
 const values = rows.map((row) => toVtSyncNumber(row[key])).filter((value): value is number => value !== undefined)
 return values.length ? values.reduce((sum, value) => sum + value, 0) : undefined
}

const formatDemographicPercentage = (value: number | undefined): string => {
 if (value === undefined || value === 0) return "–"
 return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}%`
}

const VideoIdentityCell = ({ row, title, titleLayout }: { row: VtSyncTableRow; title: string; titleLayout?: { fontSize: number; lineCount: number } }) => {
 const videoId = String(row.videoId || "-")
 const videoUrl = String(row.videoUrl || (videoId !== "-" ? `https://www.youtube.com/watch?v=${videoId}` : ""))
 return <span className="vt-sync-video-identity" title={`${title}\n${videoId}`}>
  <strong className={`is-two-line ${titleLayout?.lineCount === 2 ? "is-condensed" : ""}`} style={titleLayout ? { fontSize: `${titleLayout.fontSize}px` } : undefined}>{title}</strong>
  <span className="vt-sync-video-identity-meta"><small>{videoId}</small></span>
 </span>
}

const PublishedMomentCell = ({ row }: { row: VtSyncTableRow }) => {
 const date = formatVtSyncTableCellValue(row.publishedAt, "dateLocal")
 const time = formatVtSyncTableCellValue(row.publishedTime || row.publishedAt, "timeLocal")
 const weekday = formatVtSyncTableCellValue(row.publishedDay || row.publishedAt, "weekdayLocal")
 const month = formatVtSyncLocalMonthValue(row.publishedAt)
 const meridiemMatch = time.match(/\s+(AM|PM)$/i)
 const meridiem = meridiemMatch?.[1]?.toUpperCase()
 const clockTime = meridiem ? time.slice(0, meridiemMatch?.index ?? time.length).trim() : time
 const weekdayColors = getVtSyncAlphabeticSpectrumColors(weekday, WEEKDAY_BADGE_LIBRARY)
 const monthColors = getVtSyncAlphabeticSpectrumColors(month, MONTH_BADGE_LIBRARY)
 return <span className="vt-sync-published-moment" title={`${date} ${time} — ${weekday}, ${month}`}>
  <strong><span>{date} {clockTime}</span>{meridiem && <em>{meridiem}</em>}</strong>
  <span><small className="vt-sync-date-badge" style={{ "--vt-badge-stroke": weekdayColors.stroke, "--vt-badge-fill": weekdayColors.fill } as CssVars}>{weekday}</small><small className="vt-sync-date-badge" style={{ "--vt-badge-stroke": monthColors.stroke, "--vt-badge-fill": monthColors.fill } as CssVars}>{month}</small></span>
 </span>
}

export const VtSyncToolboxDataTable: React.FC<{
 snapshot: VtSyncSnapshot
 privacyFilters?: VtSyncPrivacyFilters
 onPrivacyFiltersChange?: (filters: VtSyncPrivacyFilters) => void
}> = ({ snapshot, privacyFilters, onPrivacyFiltersChange }) => {
 const [categoryId, setCategoryId] = useState("content")
 const [tableId, setTableId] = useState("videos")
 const table = findVtSyncTable(tableId)
 const category = VT_SYNC_TOOLBOX_CATEGORIES.find((item) => item.id === categoryId) || VT_SYNC_TOOLBOX_CATEGORIES[0]
 const [sort, setSort] = useState<VtSyncSortState>(table.defaultSort)
 const [dropdown, setDropdown] = useState<{ id: string; left: number; top: number; width: number } | null>(null)
 const dropdownId = dropdown?.id
 const [settingsOpen, setSettingsOpen] = useState(false)
 const [tableOpen, setTableOpen] = useState(true)
 const [search, setSearch] = useState("")
 const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
 const [filterRows, setFilterRows] = useState(false)
 const [pin, setPin] = useState(false)
 const [compact, setCompact] = useState(false)
 const [dark, setDark] = useState(false)
 const [zebra, setZebra] = useState(false)
 const [formatRows, setFormatRows] = useState(false)
 const [formulas, setFormulas] = useState(false)
 const [heatmapEnabled, setHeatmapEnabled] = useState(true)
 const [heatmapInverted, setHeatmapInverted] = useState(false)
 const [cellFillEnabled, setCellFillEnabled] = useState(false)
 const [cellFillInverted, setCellFillInverted] = useState(false)
 const [sparklinesEnabled, setSparklinesEnabled] = useState(true)
 const [sparkInverted, setSparkInverted] = useState(true)
 const [sparkStroke, setSparkStroke] = useState(true)
 const [sparkShape, setSparkShape] = useState<"pill" | "bar">("pill")
 const [sparkColorMode, setSparkColorMode] = useState<"solid" | "rank" | "spectrum">("rank")
 const [hoverScroll, setHoverScroll] = useState(true)
 const [focus, setFocus] = useState(false)
 const [localPrivacyFilters, setLocalPrivacyFilters] = useState<VtSyncPrivacyFilters>(() => readVtSyncPrivacyFilters())
 const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ Details: true, Format: true })
 const [orders, setOrders] = useState<Record<string, string[]>>({})
 const [widths, setWidths] = useState<Record<string, number>>({})
 const [imported, setImported] = useState<VtSyncImportedRows>({})
 const [importedAt, setImportedAt] = useState<Record<string, string>>({})
 const [selectedKey, setSelectedKey] = useState<string | null>(null)
 const [dragKey, setDragKey] = useState<string | null>(null)
 const [dragOverKey, setDragOverKey] = useState<string | null>(null)
 const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null)
 const [scrollState, setScrollState] = useState({ left: 0, width: 100 })
 const [verticalScrollState, setVerticalScrollState] = useState({ top: 0, height: 100 })
 const [rowLimit, setRowLimit] = useState(VT_SYNC_ROW_BATCH_SIZE)
 const [viewportWidth, setViewportWidth] = useState(0)
 const mainScrollRef = useRef<HTMLDivElement | null>(null)
 const pinnedScrollRef = useRef<HTMLDivElement | null>(null)
 const rowRailScrollRef = useRef<HTMLDivElement | null>(null)
 const settingsRef = useRef<HTMLDivElement | null>(null)
 const categoryRailRef = useRef<HTMLElement | null>(null)
 const dropdownRef = useRef<HTMLDivElement | null>(null)
 const categoryButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
 const dragRectRef = useRef<HTMLDivElement | null>(null)
 const fileRef = useRef<HTMLInputElement | null>(null)
 const resizeRef = useRef<{ key: string; start: number; width: number; pointerId: number; target: HTMLElement } | null>(null)
 const holdRef = useRef<{ delay?: number; repeat?: number }>({})
 const verticalHoldRef = useRef<{ delay?: number; repeat?: number }>({})
 const compositeSortRef = useRef<Record<string, VtSyncSortState>>({})
 const toastTimerRef = useRef<number | undefined>(undefined)
 const hoverRef = useRef({ direction: 0, speed: 1 })
 const hoverFrameRef = useRef<number | undefined>(undefined)
 const hoverLastTimeRef = useRef(0)
 const hoverCurrentSpeedRef = useRef(0)
 const rowLoadPendingRef = useRef(false)

 const activePrivacyFilters = privacyFilters || localPrivacyFilters
 const updatePrivacyFilter = (key: keyof VtSyncPrivacyFilters, value: boolean) => {
  const next = saveVtSyncPrivacyFilters({ ...activePrivacyFilters, [key]: value })
  setLocalPrivacyFilters(next)
  onPrivacyFiltersChange?.(next)
  setSelectedKey(null)
  setRowLimit(VT_SYNC_ROW_BATCH_SIZE)
 }

 const sourceRows = useMemo(() => {
  const importedRows = imported[table.id]
  if (importedRows) {
   return table.id === "videos"
    ? filterVtSyncVideos(importedRows, activePrivacyFilters)
    : importedRows
  }
  return buildVtSyncTableViewModel(snapshot, table, activePrivacyFilters).rows
 }, [activePrivacyFilters, imported, snapshot, table])
 const spectrumBadgeLibrary = useMemo(() => buildVtSyncAlphabeticSpectrumLibrary(
  sourceRows.flatMap((row) => [row.tags, row.topics]),
 ), [sourceRows])
 const visibleBase = useMemo(() => getVisibleVtSyncColumns(table, sourceRows, formulas, true), [formulas, sourceRows, table])
 const orderedColumns = useMemo(() => {
  const order = orders[table.id]
  if (!order) return visibleBase
  const byKey = new Map(visibleBase.map((column) => [column.key, column]))
  return [...order.map((key) => byKey.get(key)).filter(Boolean), ...visibleBase.filter((column) => !order.includes(column.key))] as VtSyncTableColumnDefinition[]
 }, [orders, table.id, visibleBase])
 const presentationColumns = useMemo(() => getVtSyncPresentationColumns(table.id, orderedColumns), [orderedColumns, table.id])
 const compactEligible = VT_SYNC_COMPACT_PIN_TABLE_IDS.has(table.id) && table.compactMode !== "normal-only"
 const effectiveCompact = compact && compactEligible
 const sparkOpposite = sparkInverted
 const tableGeometry = getVtSyncTableGeometry(presentationColumns.length, effectiveCompact, sparklinesEnabled, table.layoutMode, table.compactMode)
 const pinCount = pin && compactEligible && tableGeometry.canPin
  ? Math.min(presentationColumns.filter((column) => column.pinned === "left" || ["Identity", "Metadata", "Video"].includes(column.group)).length || 1, table.id === "videos" ? 3 : 2)
  : 0
 const pinnedColumns = presentationColumns.slice(0, pinCount)
 const mainColumns = presentationColumns.slice(pinCount)
 const pinnedGroups = groupedColumns(pinnedColumns)
 const mainGroups = groupedColumns(mainColumns)

 const filteredRows = useMemo(() => {
  const query = search.trim().toLowerCase()
  return sourceRows.filter((row) => {
   if (query && !orderedColumns.some((column) => formatVtSyncColumnValue(row, column).toLowerCase().includes(query))) return false
   if (!filterRows) return true
   return orderedColumns.every((column) => {
    const filter = columnFilters[getVtSyncColumnStateKey(table.id, column.key)]?.trim().toLowerCase()
    return !filter || formatVtSyncColumnValue(row, column).toLowerCase().includes(filter)
   })
  })
 }, [columnFilters, filterRows, orderedColumns, search, sourceRows, table.id])
 const sortedRows = useMemo(() => stableSortVtSyncRows(filteredRows, sort, orderedColumns.find((column) => column.key === sort.key)), [filteredRows, orderedColumns, sort])
 const demographicSummary = useMemo(() => {
  if (table.id !== "demographics") return undefined
  const genderTotals = [
   { key: "male", label: "Male", color: VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS.maleViewerPercentage, value: sumAvailablePercentages(sortedRows, "maleViewerPercentage") },
   { key: "female", label: "Female", color: VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS.femaleViewerPercentage, value: sumAvailablePercentages(sortedRows, "femaleViewerPercentage") },
   { key: "other", label: "Other", color: VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS.otherViewerPercentage, value: sumAvailablePercentages(sortedRows, "otherViewerPercentage") },
  ]
  return { genderTotals }
 }, [sortedRows, table.id])
 const tableProvenance = useMemo(
  () => getVtSyncTableProvenance(snapshot, table, imported[table.id] ? importedAt[table.id] : undefined),
  [imported, importedAt, snapshot, table],
 )
 const provenanceTime = useMemo(() => {
  const date = new Date(tableProvenance.updatedAt)
  if (Number.isNaN(date.getTime())) return tableProvenance.updatedAt || "Unknown"
  return new Intl.DateTimeFormat(undefined, {
   year: "numeric",
   month: "short",
   day: "numeric",
   hour: "numeric",
   minute: "2-digit",
   timeZoneName: "short",
  }).format(date)
 }, [tableProvenance.updatedAt])
 const renderedRows = sortedRows.slice(0, rowLimit)
 const numericSorted = useMemo(() => Object.fromEntries(presentationColumns.map((column) => [column.key, getVtSyncColumnSortedValues(sortedRows, column)])), [presentationColumns, sortedRows])
 const totalContext = useMemo(() => table.id === "videos" ? {
  avatarUrl: snapshot.avatarUrl,
  channelName: snapshot.channelName,
  channelDescription: snapshot.channelDescription,
  channelCustomUrl: snapshot.channelCustomUrl,
 } : undefined, [snapshot.avatarUrl, snapshot.channelCustomUrl, snapshot.channelDescription, snapshot.channelName, table.id])
 const compactWidths = useMemo(() => {
  if (!effectiveCompact || typeof document === "undefined") return {}
  const context = document.createElement("canvas").getContext("2d")
  return measureVtSyncCompactColumnWidths(table, sortedRows, (value, font) => {
   if (!context) return 0
   context.font = font
   return context.measureText(value).width
  }, totalContext)
 }, [effectiveCompact, sortedRows, table, totalContext])
 const measureVideoTitle = useMemo(() => {
  if (typeof document === "undefined") return undefined
  const context = document.createElement("canvas").getContext("2d")
  if (!context) return undefined
  context.font = '1000 16px "Century Gothic", "Helvetica Neue", sans-serif'
  return (value: string) => context.measureText(value).width
 }, [])
 const originalColumnIndices = useMemo(() => new Map(table.columns.map((column, index) => [column.key, index])), [table])
 const widthKey = (column: VtSyncTableColumnDefinition) => getVtSyncColumnStateKey(table.id, column.key)
 const baseColumnWidths = useMemo(() => Object.fromEntries(presentationColumns.map((column) => {
  const key = getVtSyncColumnStateKey(table.id, column.key)
  return [column.key, resolveVtSyncColumnWidth({
   tableId: table.id,
   column,
   columnIndex: originalColumnIndices.get(column.key) || 0,
   compact: effectiveCompact,
   sparklines: sparklinesEnabled,
   compactWidths,
   override: widths[key],
  })]
 })), [compactWidths, effectiveCompact, originalColumnIndices, presentationColumns, sparklinesEnabled, table.id, widths])
 const sparseColumnWidths = useMemo(() => tableGeometry.mode === "sparse"
  ? distributeVtSyncSparseColumnWidths(presentationColumns.map((column) => ({
   key: column.key,
   width: baseColumnWidths[column.key],
   overridden: widths[getVtSyncColumnStateKey(table.id, column.key)] !== undefined,
  })), viewportWidth, 0)
  : {}, [baseColumnWidths, presentationColumns, table.id, tableGeometry.mode, viewportWidth, widths])
 const columnWidth = (column: VtSyncTableColumnDefinition) => sparseColumnWidths[column.key] ?? baseColumnWidths[column.key]

 const selected = useMemo(() => sortedRows.find((row, index) => String(row.videoId ?? row.id ?? index) === selectedKey) || sortedRows[0], [selectedKey, sortedRows])
 const selectedNetSubscribers = useMemo(() => {
  const gained = toVtSyncNumber(selected?.subscribersGained)
  const lost = toVtSyncNumber(selected?.subscribersLost)
  return gained === undefined || lost === undefined ? undefined : gained - lost
 }, [selected])
 const summaryStats = useMemo(() => table.id === "videos" ? [
  { label: "Views", value: numberCompact(selected?.views), note: "Selected video" },
  { label: "Eng. Views", value: numberCompact(selected?.engagedViews), note: "Engaged" },
  { label: "Watch", value: formatVtSyncTableCellValue(selected?.watchTime, "durationHours"), note: "Watch time" },
  { label: "Avg Viewed", value: selected?.averagePercentageViewed === undefined ? "-" : `${numberCompact(selected.averagePercentageViewed)}%`, note: "Retention signal" },
  { label: "Avg. View Dur.", value: durationCompact(selected?.avgViewDuration), note: "Per view" },
  { label: "All In One", value: [selected?.publishedAt && formatVtSyncTableCellValue(selected.publishedAt, "dateLocal"), selected?.duration && durationCompact(selected.duration), selected?.format].filter(Boolean).join(" / ") || "-", note: "Info" },
  { label: "Subs", value: selectedNetSubscribers === undefined ? "-" : `${selectedNetSubscribers > 0 ? "+" : ""}${selectedNetSubscribers}`, note: "Net change" },
  { label: "Likes", value: numberCompact(selected?.likes), note: "Total" },
  { label: "Revenue", value: moneyCompact(selected?.revenue), note: "Est." },
  { label: "CPM", value: moneyCompact(selected?.cpm), note: "Playback" },
 ] : [
  { label: "Rows", value: sortedRows.length.toLocaleString(), note: "Visible records" },
  { label: "Views", value: numberCompact(sortedRows.reduce((sum, row) => sum + (toVtSyncNumber(row.views) || 0), 0)), note: "Total" },
  { label: "Watch", value: formatVtSyncTableCellValue(sortedRows.reduce((sum, row) => sum + (toVtSyncNumber(row.watchTime) || 0), 0), "durationHours"), note: "Total hours" },
  { label: "Revenue", value: moneyCompact(sortedRows.reduce((sum, row) => sum + (toVtSyncNumber(row.revenue) || 0), 0)), note: "Available values" },
  { label: "Source", value: snapshot.source || "local", note: "Snapshot" },
 ], [selected, selectedNetSubscribers, snapshot.source, sortedRows, table.id])

 const updateScrollState = useCallback(() => {
  const node = mainScrollRef.current
  if (!node) return
  if (pinnedScrollRef.current) pinnedScrollRef.current.scrollTop = node.scrollTop
  if (rowRailScrollRef.current) rowRailScrollRef.current.scrollTop = node.scrollTop
  if (!rowLoadPendingRef.current && node.scrollTop + node.clientHeight >= node.scrollHeight - 1) {
   rowLoadPendingRef.current = true
   setRowLimit((current) => getNextVtSyncRowLimit(current, sortedRows.length))
  }
  const max = Math.max(1, node.scrollWidth - node.clientWidth)
  setScrollState({ left: Math.min(100, (node.scrollLeft / max) * 100), width: Math.min(100, (node.clientWidth / node.scrollWidth) * 100) })
  const verticalMax = Math.max(1, node.scrollHeight - node.clientHeight)
  setVerticalScrollState({ top: Math.min(100, (node.scrollTop / verticalMax) * 100), height: Math.min(100, (node.clientHeight / node.scrollHeight) * 100) })
 }, [sortedRows.length, tableGeometry.rowHeight])

 useEffect(() => {
  setSort(table.defaultSort)
  setSearch("")
  setSelectedKey(null)
  setRowLimit(VT_SYNC_ROW_BATCH_SIZE)
  compositeSortRef.current = {}
  setCollapsed(Object.fromEntries(table.collapsedGroups.map((group) => [group, true])))
  if (mainScrollRef.current) mainScrollRef.current.scrollLeft = 0
 }, [table])

 useEffect(() => {
  setRowLimit(VT_SYNC_ROW_BATCH_SIZE)
  rowLoadPendingRef.current = false
  if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0
  if (pinnedScrollRef.current) pinnedScrollRef.current.scrollTop = 0
  if (rowRailScrollRef.current) rowRailScrollRef.current.scrollTop = 0
 }, [columnFilters, filterRows, search, sort.direction, sort.key, table.id])

 useEffect(() => {
  rowLoadPendingRef.current = false
  const frame = window.requestAnimationFrame(updateScrollState)
  return () => window.cancelAnimationFrame(frame)
 }, [rowLimit, updateScrollState])

 useEffect(() => {
  const node = mainScrollRef.current
  if (!node || typeof ResizeObserver === "undefined") return
  const updateViewport = () => {
   setViewportWidth(node.clientWidth)
   updateScrollState()
  }
  const observer = new ResizeObserver(updateViewport)
  observer.observe(node)
  const frame = window.requestAnimationFrame(updateViewport)
  return () => { observer.disconnect(); window.cancelAnimationFrame(frame) }
 }, [pinCount, presentationColumns, table.id, updateScrollState])

 useEffect(() => {
  const close = (event: MouseEvent) => {
   if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) setSettingsOpen(false)
   if (
    dropdownRef.current &&
    !dropdownRef.current.contains(event.target as Node) &&
    categoryRailRef.current &&
    !categoryRailRef.current.contains(event.target as Node)
   ) setDropdown(null)
  }
  const key = (event: KeyboardEvent) => { if (event.key === "Escape") { setFocus(false); setSettingsOpen(false); setDropdown(null) } }
  document.addEventListener("mousedown", close)
  document.addEventListener("keydown", key)
  return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", key) }
 }, [])

 useEffect(() => {
  if (!dropdownId) return
  const update = () => {
   const button = categoryButtonRefs.current[dropdownId]
   if (!button) return
   const bounds = button.getBoundingClientRect()
   setDropdown((current) => current?.id === dropdownId ? {
    ...current,
    left: Math.max(8, Math.min(bounds.left, window.innerWidth - bounds.width - 8)),
    top: bounds.bottom + 8,
    width: bounds.width,
   } : current)
  }
  const rail = categoryRailRef.current
  window.addEventListener("resize", update)
  rail?.addEventListener("scroll", update, { passive: true })
  return () => {
   window.removeEventListener("resize", update)
   rail?.removeEventListener("scroll", update)
  }
 }, [dropdownId])

 useEffect(() => () => {
  window.clearTimeout(toastTimerRef.current)
  window.clearTimeout(holdRef.current.delay)
  window.clearInterval(holdRef.current.repeat)
  window.clearTimeout(verticalHoldRef.current.delay)
  window.clearInterval(verticalHoldRef.current.repeat)
  if (hoverFrameRef.current) window.cancelAnimationFrame(hoverFrameRef.current)
 }, [])

 useEffect(() => {
  const tick = (timestamp: number) => {
   const node = mainScrollRef.current
   if (!hoverLastTimeRef.current) hoverLastTimeRef.current = timestamp
   const elapsed = Math.min(100, timestamp - hoverLastTimeRef.current)
   hoverLastTimeRef.current = timestamp
   if (hoverScroll && node && hoverRef.current.direction) {
    const target = hoverRef.current.direction * hoverRef.current.speed * (5.5 / 16.6667)
    hoverCurrentSpeedRef.current += (target - hoverCurrentSpeedRef.current) * .18
    node.scrollLeft += hoverCurrentSpeedRef.current * elapsed
   } else hoverCurrentSpeedRef.current = 0
   hoverFrameRef.current = window.requestAnimationFrame(tick)
  }
  hoverFrameRef.current = window.requestAnimationFrame(tick)
  return () => {
   hoverLastTimeRef.current = 0
   hoverCurrentSpeedRef.current = 0
   if (hoverFrameRef.current) window.cancelAnimationFrame(hoverFrameRef.current)
  }
 }, [hoverScroll])

 const showToast = (message: string, ok = true) => {
  window.clearTimeout(toastTimerRef.current)
  setToast({ message, ok })
  toastTimerRef.current = window.setTimeout(() => setToast(null), 2_800)
 }

 useEffect(() => {
  const move = (event: PointerEvent) => {
   const resize = resizeRef.current
   if (!resize) return
   setWidths((current) => ({ ...current, [resize.key]: clampVtSyncColumnWidth(resize.width + event.clientX - resize.start) }))
  }
  const up = () => {
   const resize = resizeRef.current
   if (resize?.target.hasPointerCapture(resize.pointerId)) resize.target.releasePointerCapture(resize.pointerId)
   resizeRef.current = null
   document.body.style.removeProperty("user-select")
  }
  window.addEventListener("pointermove", move)
  window.addEventListener("pointerup", up)
  window.addEventListener("pointercancel", up)
  return () => {
   window.removeEventListener("pointermove", move)
   window.removeEventListener("pointerup", up)
   window.removeEventListener("pointercancel", up)
   document.body.style.removeProperty("user-select")
  }
 }, [])

 const selectCategory = (nextId: string, nextTable = VT_SYNC_TOOLBOX_CATEGORIES.find((item) => item.id === nextId)?.tableIds[0]) => {
  if (!nextTable) return
  setCategoryId(nextId)
  setTableId(nextTable)
  setDropdown(null)
 }

 const clickCategory = (item: (typeof VT_SYNC_TOOLBOX_CATEGORIES)[number], button: HTMLButtonElement) => {
  const next = getVtSyncCategoryClickState({ categoryId, tableId, dropdownId: dropdown?.id || null }, item)
  setCategoryId(next.categoryId)
  setTableId(next.tableId)
  if (!next.dropdownId) { setDropdown(null); return }
  const bounds = button.getBoundingClientRect()
  setDropdown({
   id: next.dropdownId,
   left: Math.max(8, Math.min(bounds.left, window.innerWidth - bounds.width - 8)),
   top: bounds.bottom + 8,
   width: bounds.width,
  })
 }

 const moveColumn = (key: string, direction: -1 | 1) => {
  const keys = orderedColumns.map((column) => column.key)
  const index = keys.indexOf(key)
  const target = index + direction
  if (target < 0 || target >= keys.length) return
  if (orderedColumns[index].group !== orderedColumns[target].group) return
  ;[keys[index], keys[target]] = [keys[target], keys[index]]
  setOrders((current) => ({ ...current, [table.id]: keys }))
 }

 const reorderColumn = (sourceKey: string, targetKey: string) => {
  const reordered = reorderVtSyncColumnsWithinGroup(orderedColumns, sourceKey, targetKey)
  if (reordered === orderedColumns) return
  setOrders((current) => ({ ...current, [table.id]: reordered.map((column) => column.key) }))
 }

 const startColumnDrag = (event: React.DragEvent<HTMLTableCellElement>, column: VtSyncTableColumnDefinition, color: string) => {
  setDragKey(column.key)
  event.dataTransfer.effectAllowed = "move"
  event.dataTransfer.setData("text/plain", column.key)
  const width = columnWidth(column)
  const ghost = document.createElement("div")
  ghost.className = "vt-sync-column-drag-ghost"
  ghost.style.width = `${width}px`
  const header = document.createElement("strong")
  header.textContent = DISPLAY_HEADER_LABELS[column.key] || column.label
  header.style.background = color
  ghost.appendChild(header)
  renderedRows.slice(0, 8).forEach((row) => {
   const cell = document.createElement("span")
   cell.textContent = formatVtSyncColumnValue(row, column).slice(0, 30)
   ghost.appendChild(cell)
  })
  document.body.appendChild(ghost)
  event.dataTransfer.setDragImage(ghost, Math.floor(width / 2), 16)
  window.setTimeout(() => ghost.remove(), 100)
 }

 const updateDragRect = (header: HTMLTableCellElement) => {
  const rect = dragRectRef.current
  const stage = header.closest(".vt-sync-split-table")?.getBoundingClientRect()
  if (!rect || !stage) return
  const bounds = header.getBoundingClientRect()
  rect.style.display = "block"
  rect.style.left = `${bounds.left}px`
  rect.style.top = `${stage.top}px`
  rect.style.width = `${bounds.width}px`
  rect.style.height = `${stage.height}px`
 }

 const hideDragRect = () => {
  if (dragRectRef.current) dragRectRef.current.style.display = "none"
 }

 const groupScroll = (direction: -1 | 1) => {
  const node = mainScrollRef.current
  if (!node) return
  const groups = Array.from(node.querySelectorAll<HTMLElement>("[data-group-start]"))
  const positions = groups.map((item) => item.offsetLeft).sort((a, b) => a - b)
  const current = node.scrollLeft
  const next = direction > 0 ? positions.find((position) => position > current + 10) : [...positions].reverse().find((position) => position < current - 10)
  node.scrollTo({ left: next ?? (direction > 0 ? node.scrollWidth : 0), behavior: "smooth" })
 }

 const startHold = (direction: -1 | 1) => {
  groupScroll(direction)
  window.clearTimeout(holdRef.current.delay)
  window.clearInterval(holdRef.current.repeat)
  holdRef.current.delay = window.setTimeout(() => {
   holdRef.current.repeat = window.setInterval(() => mainScrollRef.current?.scrollBy({ left: direction * 16 }), 45)
  }, 360)
 }

 const stopHold = () => {
  window.clearTimeout(holdRef.current.delay)
  window.clearInterval(holdRef.current.repeat)
  holdRef.current = {}
 }

 const scrollRows = (direction: -1 | 1) => {
  mainScrollRef.current?.scrollBy({ top: direction * tableGeometry.rowHeight * 5, behavior: "smooth" })
 }

 const startVerticalHold = (direction: -1 | 1) => {
  scrollRows(direction)
  window.clearTimeout(verticalHoldRef.current.delay)
  window.clearInterval(verticalHoldRef.current.repeat)
  verticalHoldRef.current.delay = window.setTimeout(() => {
   verticalHoldRef.current.repeat = window.setInterval(() => mainScrollRef.current?.scrollBy({ top: direction * tableGeometry.rowHeight }), 55)
  }, 360)
 }

 const stopVerticalHold = () => {
  window.clearTimeout(verticalHoldRef.current.delay)
  window.clearInterval(verticalHoldRef.current.repeat)
  verticalHoldRef.current = {}
 }

 const dragThumb = (event: React.PointerEvent<HTMLSpanElement>) => {
  const track = event.currentTarget.parentElement
  const node = mainScrollRef.current
  if (!track || !node) return
  const target = event.currentTarget
  const pointerId = event.pointerId
  target.setPointerCapture(pointerId)
  const start = event.clientX
  const initial = node.scrollLeft
  const move = (next: PointerEvent) => {
   const available = Math.max(1, track.clientWidth * (1 - scrollState.width / 100))
   const max = Math.max(0, node.scrollWidth - node.clientWidth)
   node.scrollLeft = initial + ((next.clientX - start) / available) * max
  }
  const done = () => {
   if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId)
   window.removeEventListener("pointermove", move)
   window.removeEventListener("pointerup", done)
   window.removeEventListener("pointercancel", done)
  }
  window.addEventListener("pointermove", move)
  window.addEventListener("pointerup", done)
  window.addEventListener("pointercancel", done)
 }

 const dragVerticalThumb = (event: React.PointerEvent<HTMLSpanElement>) => {
  const track = event.currentTarget.parentElement
  const node = mainScrollRef.current
  if (!track || !node) return
  const target = event.currentTarget
  const pointerId = event.pointerId
  target.setPointerCapture(pointerId)
  const start = event.clientY
  const initial = node.scrollTop
  const move = (next: PointerEvent) => {
   const available = Math.max(1, track.clientHeight * (1 - verticalScrollState.height / 100))
   const max = Math.max(0, node.scrollHeight - node.clientHeight)
   node.scrollTop = initial + ((next.clientY - start) / available) * max
  }
  const done = () => {
   if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId)
   window.removeEventListener("pointermove", move)
   window.removeEventListener("pointerup", done)
   window.removeEventListener("pointercancel", done)
  }
  window.addEventListener("pointermove", move)
  window.addEventListener("pointerup", done)
  window.addEventListener("pointercancel", done)
 }

 const onHoverScroll = (event: React.PointerEvent<HTMLDivElement>) => {
  if (!hoverScroll || !mainScrollRef.current) { hoverRef.current = { direction: 0, speed: 1 }; return }
  const bounds = event.currentTarget.getBoundingClientRect()
  const relativeX = event.clientX - bounds.left
  hoverRef.current = getVtSyncHoverScrollIntent(relativeX, bounds.width)
 }

 const renderScrollbar = (position: "top" | "bottom") => (
  <div className={`vt-sync-scrollbar ${position}`} aria-label={`${position} table scrollbar`}>
   <div className="vt-sync-scroll-gutter" aria-hidden="true" />
   <div className="vt-sync-scroll-controls">
    <button type="button" aria-label="Previous metric group" onPointerDown={() => startHold(-1)} onPointerUp={stopHold} onPointerLeave={stopHold}><ChevronLeft /></button>
    <div className="vt-sync-scroll-track" onPointerDown={(event) => {
     if ((event.target as HTMLElement).classList.contains("vt-sync-scroll-thumb")) return
     const bounds = event.currentTarget.getBoundingClientRect()
     const node = mainScrollRef.current
     if (node) node.scrollLeft = ((event.clientX - bounds.left) / bounds.width) * (node.scrollWidth - node.clientWidth)
    }}>
     <span className="vt-sync-scroll-track-window"><span className="vt-sync-scroll-thumb" style={{ left: `${scrollState.left * (1 - scrollState.width / 100)}%`, width: `${scrollState.width}%` }} onPointerDown={dragThumb} /></span>
    </div>
    <button type="button" aria-label="Next metric group" onPointerDown={() => startHold(1)} onPointerUp={stopHold} onPointerLeave={stopHold}><ChevronRight /></button>
   </div>
  </div>
 )

 const renderVerticalScrollbar = () => (
  <div className="vt-sync-vertical-scrollbar" aria-label="Vertical table scrollbar">
   <div className="vt-sync-vertical-scrollbar-header" aria-hidden="true" />
   <button type="button" aria-label="Scroll up five rows" onPointerDown={() => startVerticalHold(-1)} onPointerUp={stopVerticalHold} onPointerLeave={stopVerticalHold}><ChevronUp /></button>
   <div className="vt-sync-vertical-scroll-track" onPointerDown={(event) => {
    if ((event.target as HTMLElement).classList.contains("vt-sync-vertical-scroll-thumb")) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const node = mainScrollRef.current
    if (node) node.scrollTop = ((event.clientY - bounds.top) / bounds.height) * (node.scrollHeight - node.clientHeight)
   }}>
    <span className="vt-sync-vertical-scroll-window"><span className="vt-sync-vertical-scroll-thumb" style={{ top: `${verticalScrollState.top * (1 - verticalScrollState.height / 100)}%`, height: `${verticalScrollState.height}%` }} onPointerDown={dragVerticalThumb} /></span>
   </div>
   <button type="button" aria-label="Scroll down five rows" onPointerDown={() => startVerticalHold(1)} onPointerUp={stopVerticalHold} onPointerLeave={stopVerticalHold}><ChevronDown /></button>
  </div>
 )

 const cellStyle = (row: VtSyncTableRow, column: VtSyncTableColumnDefinition, color: string): { style: React.CSSProperties, className?: string } => {
  if (column.visualization === "none" || column.semanticRole === "identity") return { style: {} }
  const raw = row[column.key]
  if (isMissingVtSyncValue(raw)) return { style: {} }
  const value = numericColumnValue(row, column)
  const sortedValues = numericSorted[column.key]
  const colorRgb = (source: string) => source.replace("#", "").match(/.{2}/g)?.map((part) => Number.parseInt(part, 16)) || [79, 255, 91]
  const heatColor = heatmapInverted ? getVtSyncOppositeColor(color) : color
  const fillColor = cellFillInverted ? getVtSyncOppositeColor(color) : color
  const rank = getVtSyncNumericRank(value, sortedValues)
  if (!rank) return { style: {} }
  const style: React.CSSProperties = {}
  if (heatmapEnabled) style.backgroundColor = `rgba(${colorRgb(heatColor).join(",")},${.16 + rank * .68})`
  if (cellFillEnabled) style.backgroundImage = `linear-gradient(90deg, rgba(${colorRgb(fillColor).join(",")},.68) ${Math.round(rank * 100)}%, transparent ${Math.round(rank * 100)}%)`
  return { style, className: heatmapEnabled ? "has-heatmap" : undefined }
 }

 const renderRowRail = () => <table className="vt-sync-data-table vt-sync-row-rail-table" aria-label="Table row numbers and header labels" style={{ width: VT_SYNC_ROW_NUMBER_WIDTH, minWidth: VT_SYNC_ROW_NUMBER_WIDTH, maxWidth: VT_SYNC_ROW_NUMBER_WIDTH }}>
  <colgroup><col style={{ width: VT_SYNC_ROW_NUMBER_WIDTH, minWidth: VT_SYNC_ROW_NUMBER_WIDTH, maxWidth: VT_SYNC_ROW_NUMBER_WIDTH }} /></colgroup>
  <thead>
   {tableGeometry.useGroups && <tr className="vt-sync-group-row"><th className="vt-sync-row-rail-head is-blank" aria-hidden="true" /></tr>}
   {table.id !== "demographics" && <tr className="vt-sync-total-row">
    <th className="vt-sync-row-rail-head is-totals">Totals</th>
   </tr>}
   <tr className="vt-sync-column-row"><th className="vt-sync-row-rail-head is-stats">Stats</th></tr>
   {filterRows && <tr className="vt-sync-filter-row"><th className="vt-sync-row-rail-head is-filter" aria-hidden="true" /></tr>}
  </thead>
  <tbody>{renderedRows.map((row, index) => {
   const rowKey = String(row.videoId ?? row.id ?? row.date ?? row.term ?? index)
   return <tr key={`rail-${rowKey}-${index}`}><td className="vt-sync-row-rail-number">{index + 1}</td></tr>
  })}</tbody>
 </table>

 const sortColumn = (column: VtSyncTableColumnDefinition) => {
  const cycleKey = `${table.id}|${column.key}`
  const cycleCurrent = compositeSortRef.current[cycleKey] || { key: "", direction: "desc" as const }
  const compositeSort = getNextVtSyncCompositeSortState(table.id, column.key, cycleCurrent)
  if (compositeSort) {
   compositeSortRef.current[cycleKey] = compositeSort
   setSort(compositeSort)
   return
  }
  setSort((current) => ({ key: column.key, direction: current.key === column.key && current.direction === "desc" ? "asc" : "desc" }))
 }

 const renderTable = (groups: Group[], isPinned: boolean) => {
  const renderColumns = groups.flatMap((group) => tableGeometry.useGroups && collapsed[group.label]
   ? [{ column: group.columns[0], group, isCollapsed: true }]
   : group.columns.map((column) => ({ column, group, isCollapsed: false })))
   .map((entry, index) => ({
    ...entry,
    color: table.id === "demographics"
     ? VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS[entry.column.key] || VT_SYNC_SMALL_TABLE_COLORS[index % VT_SYNC_SMALL_TABLE_COLORS.length]
     : tableGeometry.useGroups ? entry.group.color : VT_SYNC_SMALL_TABLE_COLORS[index % VT_SYNC_SMALL_TABLE_COLORS.length],
   }))
  const renderWidth = ({ column, isCollapsed }: (typeof renderColumns)[number]) => isCollapsed ? 40 : columnWidth(column)
  const tableWidth = renderColumns.reduce((sum, entry) => sum + renderWidth(entry), 0)
  return <table className={`vt-sync-data-table ${tableGeometry.mode === "sparse" ? "is-sparse" : ""}`} aria-label={`${getVtSyncPresentationLabel(table.id, table.label)}${isPinned ? " pinned columns" : ""}`} style={{ width: tableWidth, minWidth: tableWidth, maxWidth: tableWidth }}>
   <colgroup>{renderColumns.map((entry) => { const width = renderWidth(entry); return <col key={`${entry.group.id}-${entry.column.key}`} style={{ width, minWidth: width, maxWidth: width }} /> })}</colgroup>
   <thead>
    {tableGeometry.useGroups && <tr className="vt-sync-group-row">
     {groups.map((group) => collapsed[group.label] ? <th key={group.id} className="is-collapsed" colSpan={1} style={{ background: group.color }} data-group-start="true">
      <button type="button" onClick={() => setCollapsed((current) => ({ ...current, [group.label]: false }))} aria-expanded="false" aria-label={`Expand ${group.label}`}><Maximize2 /></button>
     </th> : <th key={group.id} colSpan={group.columns.length} style={{ background: group.color }} data-group-start="true">
      <strong>{group.label}</strong><button type="button" onClick={() => setCollapsed((current) => ({ ...current, [group.label]: true }))} aria-expanded="true" aria-label={`Collapse ${group.label}`}><Minimize2 /></button>
     </th>)}
    </tr>}
    {table.id !== "demographics" && <tr className="vt-sync-total-row">{renderColumns.map(({ column, group, isCollapsed, color }) => {
     const width = isCollapsed ? 40 : columnWidth(column)
     if (isCollapsed) {
      if (group.label === "Format") {
       const total = totalVtSyncColumn(sortedRows, column, totalContext)
       if (total.badges?.length) {
        return <th className="is-collapsed" key={`${group.id}-${column.key}`} style={{ width, minWidth: width, maxWidth: width, background: group.color }}>
         <div className="vt-sync-collapsed-format-totals">
          {total.badges.map((badge) => {
           const val = badge.value.toLowerCase()
           const letter = val === "short" ? "S" : val === "live" ? "L" : "L"
           const badgeClass = val === "short" ? "is-short" : val === "live" ? "is-live" : "is-long"
           return <span key={badge.value} className={badgeClass}>{letter}</span>
          })}
         </div>
        </th>
       }
      }
      return <th className="is-collapsed" key={`${group.id}-${column.key}`} style={{ width, minWidth: width, maxWidth: width, background: group.color }} />
     }
     const total = totalVtSyncColumn(sortedRows, column, totalContext)
     const totalClock = splitVtSyncSpecialCharacters(total.primary, column.key)
     return <th className={`is-${total.kind || "numeric"}`} data-column-key={column.key} key={`${group.id}-${column.key}`} style={{ width, minWidth: width, maxWidth: width, backgroundColor: tableGeometry.mode === "sparse" ? `${color}33` : undefined }}>
      {total.badges?.length ? (
       <div className="vt-sync-total-badges">
        {total.badges.map((badge) => {
         if (column.key === "format") {
          const val = badge.value.toLowerCase()
          const letter = val === "short" ? "S" : val === "live" ? "L" : "L"
          return <span key={badge.value} className={`vt-sync-format-badge is-${val}`}><span>{letter}</span> <b>{badge.count}</b></span>
         }
         if (column.key === "category") {
          const presentation = getVtSyncCategoryBadgePresentation(badge.value)
          return <span key={badge.value} className="vt-sync-category-badges" style={{ "--vt-badge-stroke": presentation.colors.stroke, "--vt-badge-fill": presentation.colors.fill } as CssVars}>
           <span className="vt-sync-category-badge"><span>{presentation.label}</span></span>
          </span>
         }
         const colors = getVtSyncAlphabeticSpectrumColors(badge.value, spectrumBadgeLibrary)
         return <span key={badge.value} className="vt-sync-spectrum-badge" style={{ "--vt-badge-stroke": colors.stroke, "--vt-badge-fill": colors.fill } as CssVars}>
          <span>{badge.value}</span>
         </span>
        })}
       </div>
      ) : column.key === "videoUrl" ? <span className="vt-sync-url-buttons"><button type="button" title="Copy URL" aria-label="Copy channel URL" onClick={(event) => { event.stopPropagation(); void navigator.clipboard?.writeText("https://www.youtube.com/") }}><Copy /></button><a href="https://www.youtube.com/" target="_blank" rel="noreferrer" title="Open channel" aria-label="Open channel" onClick={(event) => event.stopPropagation()}><ExternalLink /></a></span> : total.imageUrl ? <img src={total.imageUrl} alt="Channel thumbnail" /> : <strong>{totalClock.isNegative && "-"}{totalClock.prefix && <span className="vt-sync-zero-seconds">{totalClock.prefix}</span>}{totalClock.value}{totalClock.suffix && <span className="vt-sync-zero-seconds">{totalClock.suffix}</span>}</strong>}
      {total.secondary && !total.badges?.length && <small>{total.secondary}</small>}
     </th>
    })}</tr>}
    <tr className="vt-sync-column-row">{renderColumns.map(({ column, group, isCollapsed, color }) => {
     const width = isCollapsed ? 40 : columnWidth(column)
     if (isCollapsed) return <th className="is-collapsed" key={`${group.id}-${column.key}`} style={{ background: group.color, width, minWidth: width, maxWidth: width }}>
      <span className="vt-sync-collapsed-group-label" style={{ color: group.color === "#ffff61" || group.color === "#4fff5b" ? "#0a0a0a" : "#0a0a0a" }}>{COLLAPSED_GROUP_DISPLAY_LABELS[group.label] || group.label}</span>
     </th>
     const demographicHeader = table.id === "demographics" && column.key === "viewerPercentage" ? "Age Total" : undefined
     const [first, second] = splitHeader(demographicHeader || DISPLAY_HEADER_LABELS[column.key] || column.label)
     const source = dragKey ? orderedColumns.find((candidate) => candidate.key === dragKey) : undefined
     const acceptsDrop = !source || source.group === column.group
     const sortActive = sort.key === column.key || isVtSyncCompositeSortActive(table.id, column.key, sort)
     return <th key={`${group.id}-${column.key}`} data-column-key={column.key} data-group-start={tableGeometry.useGroups ? undefined : "true"} style={{ "--vt-header-color": color, width, minWidth: width, maxWidth: width } as CssVars} draggable aria-grabbed={dragKey === column.key} aria-sort={sortActive ? (sort.direction === "desc" ? "descending" : "ascending") : "none"} className={`${dragKey === column.key ? "is-dragging" : ""} ${dragOverKey === column.key ? "is-drag-over" : ""}`} onDragStart={(event) => startColumnDrag(event, column, color)} onDragEnd={() => { setDragKey(null); setDragOverKey(null); hideDragRect() }} onDragOver={(event) => { if (!acceptsDrop) return; event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDragOverKey(column.key); updateDragRect(event.currentTarget) }} onDragLeave={() => { if (dragOverKey === column.key) setDragOverKey(null) }} onDrop={(event) => { event.preventDefault(); if (dragKey && acceptsDrop) reorderColumn(dragKey, column.key); setDragKey(null); setDragOverKey(null); hideDragRect() }} onKeyDown={(event) => { if (event.altKey && event.key === "ArrowLeft") { event.preventDefault(); moveColumn(column.key, -1) } else if (event.altKey && event.key === "ArrowRight") { event.preventDefault(); moveColumn(column.key, 1) } }} onClick={() => sortColumn(column)} tabIndex={0}>
      <span>{first}{second && <><br />{second}</>}</span><b className="vt-sync-sort-arrow">{sortActive ? (sort.direction === "desc" ? "↓" : "↑") : ""}{sortActive && (() => { const label = getVtSyncCompositeSortLabel(table.id, column.key, sort); return label ? <small className="vt-sync-sort-label">{label}</small> : null })()}</b>
      <i className="vt-sync-resize" onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); document.body.style.userSelect = "none"; resizeRef.current = { key: widthKey(column), start: event.clientX, width: columnWidth(column), pointerId: event.pointerId, target: event.currentTarget } }} />
     </th>
    })}</tr>
    {filterRows && <tr className="vt-sync-filter-row">{renderColumns.map(({ column, group, isCollapsed }) => { const width = isCollapsed ? 40 : columnWidth(column); const filterKey = getVtSyncColumnStateKey(table.id, column.key); return isCollapsed ? <th className="is-collapsed" key={`${group.id}-${column.key}`} style={{ width, minWidth: width, maxWidth: width }} /> : <th key={`${group.id}-${column.key}`} style={{ width, minWidth: width, maxWidth: width }}><input type="search" placeholder="Filter" aria-label={`Filter ${column.label}`} value={columnFilters[filterKey] || ""} onChange={(event) => setColumnFilters((current) => ({ ...current, [filterKey]: event.target.value }))} /></th> })}</tr>}
   </thead>
   <tbody>{renderedRows.map((row, index) => {
    const rowKey = String(row.videoId ?? row.id ?? row.date ?? row.term ?? index)
    const selectedRow = rowKey === selectedKey
    return <tr key={`${rowKey}-${index}`} className={`${zebra && index % 2 ? "is-zebra" : ""} ${selectedRow ? "is-selected" : ""} ${formatRows && row.format ? `format-${String(row.format).toLowerCase()}` : ""}`} onClick={() => setSelectedKey(rowKey)}>
     {renderColumns.map(({ column, group, isCollapsed, color }) => {
      const width = isCollapsed ? 40 : columnWidth(column)
       if (isCollapsed) {
        if (group.label === "Format") {
         const raw = row[column.key]
         if (isMissingVtSyncValue(raw)) return <td className="is-collapsed" key={`${group.id}-${column.key}`} style={{ width, minWidth: width, maxWidth: width }} />
         const fmt = String(raw).toLowerCase()
         const letter = fmt === "short" ? "S" : fmt === "live" ? "L" : "L"
         const badgeClass = fmt === "short" ? "is-short" : fmt === "live" ? "is-live" : "is-long"
         return <td className="is-collapsed" key={`${group.id}-${column.key}`} style={{ width, minWidth: width, maxWidth: width }}>
          <span className={`vt-sync-collapsed-format-badge ${badgeClass}`}>{letter}</span>
         </td>
        }
        return <td className="is-collapsed" key={`${group.id}-${column.key}`} style={{ width, minWidth: width, maxWidth: width }} />
       }
      const raw = row[column.key]
      const text = formatVtSyncColumnValue(row, column)
      const clockText = splitVtSyncSpecialCharacters(text, column.key)
      const badgeValues = table.id === "videos" && (column.key === "tags" || column.key === "topics") ? getVtSyncBadgeValues(raw) : []
      const apiValuePresentation = getVtSyncApiValuePresentation(table.id, column.key, raw)
      const visualizesMetrics = column.visualization !== "none" && column.semanticRole !== "identity"
      const numericValue = numericColumnValue(row, column)
      const rank = visualizesMetrics
       ? (table.id === "demographics" && column.format === "percent"
        ? getVtSyncAbsolutePercentRatio(numericValue)
        : getVtSyncNumericRank(numericValue, numericSorted[column.key])) * 100
       : 0
      const { style, className: heatmapClassName } = cellStyle(row, column, color)
      const titleLayout = table.id === "videos" && column.key === "title"
       ? getVtSyncVideoTitleLayout(text, effectiveCompact, measureVideoTitle?.(text), Math.max(40, width - 38))
       : undefined
      const tableTextStyle: React.CSSProperties | undefined = column.textSize ? { fontSize: `${column.textSize}px`, WebkitLineClamp: table.id === "playlists" && column.key === "title" ? 2 : 1 } : undefined
      const cellFill = cellFillEnabled ? style.backgroundImage : undefined
      const cellFillTextColor = (color === "#ffff61" || color === "#4fff5b") ? "#0a0a0a" : "#ffffff"
      const demographicTint = table.id === "demographics" ? `${color}${index % 2 ? "24" : "3D"}` : undefined
      return (
       <td
        key={`${rowKey}-${column.key}`}
        data-column-key={column.key}
        data-format={column.format}
        className={`is-${column.semanticRole || "numeric"} ${tableGeometry.mode === "sparse" ? "is-sparse-cell" : ""} ${cellFill ? "is-filled-cell" : ""} ${heatmapClassName || ""}`}
        style={{
         ...style,
         width,
         minWidth: width,
         maxWidth: width,
         backgroundColor: table.id === "demographics"
          ? demographicTint
          : heatmapEnabled ? style.backgroundColor : demographicTint ?? (tableGeometry.mode === "sparse" ? `${color}11` : undefined),
         color: cellFill && !effectiveCompact && cellFillTextColor ? cellFillTextColor : undefined,
        }}
       >
       {table.id === "videos" && column.key === "title" ? <VideoIdentityCell row={row} title={text} titleLayout={titleLayout} /> : table.id === "videos" && column.key === "publishedAt" ? <PublishedMomentCell row={row} /> : table.id === "demographics" && column.key === "ageGroupLabel" ? <DemographicAgeCell row={row} text={text} /> : table.mainCategoryId === "demographics" && column.key === "cohort" ? <DemographicCohortCell row={row} text={text} /> : column.format === "thumbnail" && !isMissingVtSyncValue(raw) ? <img className="vt-sync-thumbnail" src={String(raw)} alt="" /> : column.format === "flag" && !isMissingVtSyncValue(raw) ? <span className="vt-sync-flag-thumbnail" role="img" aria-label={`${String(row.countryName || row.countryCode || "Region")} flag`}><span className={`fi fi-${text}`} aria-hidden="true" /></span> : column.key === "videoUrl" && !isMissingVtSyncValue(raw) ? <span className="vt-sync-url-buttons"><button type="button" title="Copy URL" aria-label="Copy video URL" onClick={(event) => { event.stopPropagation(); void navigator.clipboard?.writeText(String(raw)) }}><Copy /></button><a href={String(raw)} target="_blank" rel="noreferrer" title="Open video" aria-label="Open video" onClick={(event) => event.stopPropagation()}><ExternalLink /></a></span> : column.key === "format" && !isMissingVtSyncValue(raw) ? <span className={`vt-sync-format-badge is-${String(raw).toLowerCase()}`}>{text}</span> : table.id === "videos" && column.key === "category" && !isMissingVtSyncValue(raw) ? <CategoryBadge value={raw} /> : badgeValues.length ? <SpectrumBadgeList values={badgeValues} library={spectrumBadgeLibrary} kind={column.key as "tags" | "topics"} /> : apiValuePresentation ? <span className="vt-sync-api-value"><strong>{apiValuePresentation.title}</strong><small>{apiValuePresentation.apiValue}</small></span> : <span className={`vt-sync-cell-text ${titleLayout ? "is-video-title" : ""} ${tableTextStyle ? "is-table-sized-text" : ""}`} style={titleLayout ? { fontSize: `${titleLayout.fontSize}px`, WebkitLineClamp: titleLayout.lineCount } : tableTextStyle}>{clockText.isNegative && "-"}{clockText.prefix && <span className="vt-sync-zero-seconds">{clockText.prefix}</span>}{clockText.value}{clockText.suffix && <span className="vt-sync-zero-seconds">{clockText.suffix}</span>}</span>}
       {sparklinesEnabled && visualizesMetrics && rank > 0 && column.format !== "thumbnail" && column.format !== "flag" && <span className={`vt-sync-spark color-${sparkColorMode} shape-${sparkShape} ${sparkOpposite ? "is-opposite" : ""} ${sparkStroke ? "" : "no-stroke"}`}><i style={getVtSyncSparkFillStyle(rank / 100, sparkColorMode === "spectrum" ? getVtSyncSparkGradient(sparkOpposite) : getVtSyncSparkColor(color, rank / 100, sparkColorMode, sparkOpposite), sparkColorMode)} /></span>}
       </td>
      )
     })}
    </tr>
   })}</tbody>
  </table>
 }

 const renderDemographicMetric = (value: number | undefined, color: string, emphasis = false) => (
  <div className={`vt-sync-demographic-metric${emphasis ? " is-emphasis" : ""}`} style={{ "--vt-demographic-color": color } as CssVars}>
   <strong>{formatDemographicPercentage(value)}</strong>
   <span aria-hidden="true"><i style={{ width: `${getVtSyncAbsolutePercentRatio(value) * 100}%` }} /></span>
  </div>
 )

 const renderDemographicTable = () => {
  if (!demographicSummary) return null
  const metricColumns = [
   { key: "maleViewerPercentage", label: "Male", color: VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS.maleViewerPercentage },
   { key: "femaleViewerPercentage", label: "Female", color: VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS.femaleViewerPercentage },
   { key: "otherViewerPercentage", label: "Other", color: VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS.otherViewerPercentage },
  ] as const
  const columnByKey = new Map(orderedColumns.map((column) => [column.key, column]))

  return <div className="vt-sync-demographic-board-viewport">
   <section className="vt-sync-demographic-board" aria-label="Audience demographics overview">
    <section className="vt-sync-demographic-section is-gender" aria-labelledby="vt-sync-gender-totals">
     <header id="vt-sync-gender-totals">Gender Totals</header>
     <div className="vt-sync-demographic-subhead">All age groups</div>
     <div className="vt-sync-demographic-gender-stack">
      {demographicSummary.genderTotals.map((item) => <article key={item.key} style={{ "--vt-demographic-color": item.color } as CssVars}>
       <header>{item.label}</header>
       {renderDemographicMetric(item.value, item.color, true)}
      </article>)}
     </div>
    </section>
    <section className="vt-sync-demographic-section is-age" aria-labelledby="vt-sync-age-groups">
     <header id="vt-sync-age-groups">Age Groups</header>
     <div className="vt-sync-demographic-subhead">All genders</div>
     <div className="vt-sync-demographic-age-stack">
      {renderedRows.map((row) => <article key={String(row.ageGroup || row.ageGroupLabel)}>
       <div><strong>{String(row.ageGroupLabel || row.ageGroup || "Age group")}</strong><small>All genders</small></div>
       {renderDemographicMetric(toVtSyncNumber(row.viewerPercentage), "#4fff5b")}
      </article>)}
     </div>
    </section>
    <section className="vt-sync-demographic-section is-matrix" aria-labelledby="vt-sync-age-gender-matrix">
     <header id="vt-sync-age-gender-matrix">Age × Gender</header>
     <div className="vt-sync-demographic-matrix-head">
      {metricColumns.map((metric) => {
       const column = columnByKey.get(metric.key)
       const active = sort.key === metric.key
       return <button key={metric.key} type="button" style={{ "--vt-demographic-color": metric.color } as CssVars} onClick={() => column && sortColumn(column)} aria-label={`Sort by ${metric.label}`} aria-pressed={active}>
        {metric.label}<span aria-hidden="true">{active ? (sort.direction === "desc" ? "↓" : "↑") : ""}</span>
       </button>
      })}
     </div>
     <div className="vt-sync-demographic-matrix-body">
      {renderedRows.map((row) => <div className="vt-sync-demographic-matrix-row" key={String(row.ageGroup || row.ageGroupLabel)}>
       {metricColumns.map((metric) => <div className="vt-sync-demographic-matrix-cell" key={metric.key} style={{ "--vt-demographic-color": metric.color } as CssVars}>
        {renderDemographicMetric(toVtSyncNumber(row[metric.key]), metric.color)}
       </div>)}
      </div>)}
     </div>
    </section>
   </section>
  </div>
 }

 const pinnedTableWidth = useMemo(() => pinnedColumns.reduce((sum, column) => sum + (sparseColumnWidths[column.key] ?? baseColumnWidths[column.key] ?? 0), 0), [pinnedColumns, sparseColumnWidths, baseColumnWidths])

 const rootStyle: CssVars = {
  "--vt-active-icon": category.colors.icon,
  "--vt-active-label": category.colors.label,
  "--vt-active-shadow": category.colors.shadow,
  "--vt-row-height": `${tableGeometry.rowHeight}px`,
  "--vt-group-header-height": `${tableGeometry.useGroups ? 30 : 0}px`,
  "--vt-total-height": `${table.id === "demographics" ? 0 : tableGeometry.totalsHeight}px`,
  "--vt-column-header-height": `${tableGeometry.columnHeaderHeight}px`,
  "--vt-pinned-offset": `${32 + 58 + (pinCount > 0 ? pinnedTableWidth : 0)}px`,
 }

 return <section className={`vt-sync-toolbox-table is-${tableGeometry.mode}-table ${focus ? "is-focus" : ""} ${dark ? "is-dark" : ""} ${effectiveCompact ? "is-compact" : ""} ${cellFillEnabled ? "has-cell-fill" : ""} ${sparklinesEnabled ? "" : "no-spark"} ${table.mainCategoryId === "demographics" ? "is-demographics" : ""}`} style={rootStyle}>
  {toast && <div className={`vt-sync-toast ${toast.ok ? "is-ok" : "is-error"}`} role="status">{toast.message}</div>}
  <div ref={dragRectRef} className="vt-sync-column-drag-rect" aria-hidden="true" />
  <header className="vt-sync-title-rail"><div>{categoryIcon(category.id)}</div><h2>MASTER DATA TABLES</h2><button type="button" className="vt-sync-collapse-button" aria-label={tableOpen ? "Collapse master data tables" : "Expand master data tables"} aria-expanded={tableOpen} aria-controls="vt-sync-table-content" onClick={() => { setTableOpen((open) => !open); setSettingsOpen(false) }}><AnimatedToggleIcon open={tableOpen} size={44} /></button></header>

  <div id="vt-sync-table-content" className={`vt-sync-toolbox-content ${tableOpen ? "is-open" : "is-closed"}`} aria-hidden={!tableOpen} inert={!tableOpen}><div className="vt-sync-toolbox-content-inner">

  <nav ref={categoryRailRef} className="vt-sync-category-rail" aria-label="Data table categories">
   {VT_SYNC_TOOLBOX_CATEGORIES.map((item) => { const isActive = categoryId === item.id; const selectedLabel = isActive && item.tableIds.length > 1 ? getVtSyncPresentationLabel(table.id, table.subLabel || table.label) : item.label; return <div className="vt-sync-category-wrap" key={item.id} style={{ "--vt-cat-icon": item.colors.icon, "--vt-cat-label": item.colors.label, "--vt-cat-shadow": item.colors.shadow } as CssVars}>
     <button ref={(node) => { categoryButtonRefs.current[item.id] = node }} type="button" className={`vt-sync-category-button ${isActive ? "active" : ""} ${isActive && item.tableIds.length > 1 ? "is-subset" : ""}`} aria-haspopup={item.tableIds.length > 1 ? "listbox" : undefined} aria-expanded={dropdown?.id === item.id} aria-pressed={isActive} onClick={(event) => clickCategory(item, event.currentTarget)}>
     <span className="vt-sync-category-icon">{isActive && item.tableIds.length > 1 ? <><small>Set</small><ChevronDown size={16} /></> : categoryIcon(item.id)}</span><span>{selectedLabel}</span>
    </button>
    {dropdown?.id === item.id && <div ref={dropdownRef} className="vt-sync-subset-menu" role="listbox" style={{ left: dropdown.left, top: dropdown.top, width: dropdown.width }}>{item.tableIds.map((id) => { const candidate = findVtSyncTable(id); return <button type="button" role="option" aria-selected={id === table.id} className={id === table.id ? "active" : ""} key={id} onClick={() => selectCategory(item.id, id)}><i>{categoryIcon(item.id)}</i><span>{getVtSyncPresentationLabel(candidate.id, candidate.label)}</span></button> })}</div>}
   </div> })}
  </nav>

  <section className={`vt-sync-summary-rail ${table.id === "videos" ? "is-video-summary" : ""}`}>
   <article className="vt-sync-summary-card">
    <header><span><Activity size={13} strokeWidth={3} /></span><strong>{table.id === "videos" ? "Selected Video" : getVtSyncPresentationLabel(table.id, table.label)}</strong></header>
    <div className="vt-sync-summary-card-body"><div className="vt-sync-summary-image">{selected?.thumbnail ? <img src={String(selected.thumbnail)} alt="" /> : snapshot.avatarUrl ? <img src={snapshot.avatarUrl} alt="" /> : categoryIcon(category.id)}</div>
    <div><h3>{String(selected?.title || snapshot.channelName || table.label)}</h3><p>{String(selected?.descriptionSnippet || table.description)}</p></div></div>
   </article>
   <div className="vt-sync-summary-stats">
    {summaryStats.map((stat, index) => <article key={stat.label}><header style={{ background: GROUP_COLORS[index % GROUP_COLORS.length] }}><span style={{ background: GROUP_COLORS[(index + 4) % GROUP_COLORS.length] }}><Activity size={11} strokeWidth={3} /></span><small>{stat.label}</small></header><div><strong title={String(stat.value)}>{stat.value}</strong><span>{stat.note}</span></div></article>)}
   </div>
  </section>

  <div className="vt-sync-toolbar">
   <div className="vt-sync-search" role="search"><span><Search /></span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setSearch("") }} placeholder="Search table rows…" aria-label="Search table rows" /><button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X /></button></div>
   <button type="button" className="vt-sync-toolbar-action" style={{ "--vt-action-rail": "#4FFF5B", "--vt-action-label": "#FFFF61", "--vt-action-shadow": "rgba(79,255,91,.52)" } as CssVars} onClick={() => fileRef.current?.click()}><span><Upload /></span><strong>Import CSV</strong></button><input ref={fileRef} hidden type="file" multiple accept=".csv,text/csv" onChange={async (event) => {
    if (!event.target.files) return
    try {
     const importedRows = await importVtSyncCsvFiles(event.target.files, table.id)
     const entries = Object.entries(importedRows)
     if (!entries.length || entries.every(([, rows]) => !rows.length)) showToast("CSV had no recognized data rows", false)
     else {
     setImported((current) => ({ ...current, ...importedRows }))
      const importedTimestamp = new Date().toISOString()
      setImportedAt((current) => ({ ...current, ...Object.fromEntries(entries.map(([id]) => [id, importedTimestamp])) }))
      setSelectedKey(null)
      setSort(table.defaultSort)
      showToast(`Imported ${entries.reduce((sum, [, rows]) => sum + rows.length, 0)} rows`)
     }
    } catch (error) {
     console.error("VT-SYNC CSV import failed", error)
     showToast("Import failed — check the CSV format", false)
    } finally { event.currentTarget.value = "" }
   }} />
   <button type="button" className="vt-sync-toolbar-action" style={{ "--vt-action-rail": "#579AFF", "--vt-action-label": "#40C6E9", "--vt-action-shadow": "rgba(87,154,255,.52)" } as CssVars} onClick={() => { downloadCsv(table.exportName, exportVtSyncTableCsv(table, sortedRows, orderedColumns)); showToast(`Exported ${sortedRows.length} ${table.id} rows`) }}><span><Download /></span><strong>Export CSV</strong></button>
   <div ref={settingsRef} className="vt-sync-toolbar-settings">
    <button type="button" className="vt-sync-toolbar-action" style={{ "--vt-action-rail": "#FF83EA", "--vt-action-label": "#FFFF61", "--vt-action-shadow": "rgba(255,131,234,.52)" } as CssVars} aria-label="Table settings" aria-haspopup="dialog" aria-expanded={settingsOpen} onClick={() => setSettingsOpen((open) => !open)}><span><Settings /></span><strong>Settings</strong></button>
    {settingsOpen && <div className="vt-sync-settings-panel" role="dialog" aria-label="Table settings">
     <div className="vt-sync-settings-heading"><strong>Display Options</strong><button type="button" aria-label="Close settings" onClick={() => setSettingsOpen(false)}><X /></button></div>
     <div className="vt-sync-settings-grid">
      <SettingControl label="Dark Mode"><Switch label="Dark mode" checked={dark} activeColor="#40C6E9" onChange={() => setDark(!dark)} /></SettingControl>
      <SettingControl label="Compact" disabled={!compactEligible}><Switch label="Compact rows" checked={effectiveCompact} activeColor="#4FFF5B" onChange={() => setCompact(!compact)} /></SettingControl>
      <SettingControl label="Pin Columns" disabled={!compactEligible || !tableGeometry.canPin}><Switch label="Pin columns" checked={Boolean(pinCount)} activeColor="#FF3B30" onChange={() => setPin(!pin)} /></SettingControl>
      <SettingControl label="Fullscreen"><Switch label="Fullscreen" checked={focus} activeColor="#FFB570" onChange={() => setFocus(!focus)} /></SettingControl>
      <SettingControl label="Zebra Rows"><Switch label="Zebra rows" checked={zebra} activeColor="#FF3B30" onChange={() => setZebra(!zebra)} /></SettingControl>
      <SettingControl label="Format Rows"><Switch label="Format rows" checked={formatRows} activeColor="#CC00FF" onChange={() => setFormatRows(!formatRows)} /></SettingControl>
      <SettingControl label="Formula"><Switch label="Formula metrics" checked={formulas} activeColor="#FF83EA" onChange={() => setFormulas(!formulas)} /></SettingControl>
      <SettingControl label="Hover Scroll"><Switch label="Hover scroll" checked={hoverScroll} activeColor="#FF83EA" onChange={() => setHoverScroll(!hoverScroll)} /></SettingControl>
      <SettingControl label="Filters"><Switch label="Column filters" checked={filterRows} activeColor="#4FFF5B" onChange={() => setFilterRows(!filterRows)} /></SettingControl>
      <SettingControl label="Exclude Private"><Switch label="Exclude private videos" checked={activePrivacyFilters.excludePrivate} activeColor="#4FFF5B" onChange={() => updatePrivacyFilter("excludePrivate", !activePrivacyFilters.excludePrivate)} /></SettingControl>
      <SettingControl label="Exclude Unlisted"><Switch label="Exclude unlisted videos" checked={activePrivacyFilters.excludeUnlisted} activeColor="#4FFF5B" onChange={() => updatePrivacyFilter("excludeUnlisted", !activePrivacyFilters.excludeUnlisted)} /></SettingControl>
     </div>
     <div className="vt-sync-effect-settings">
      <section style={{ "--vt-effect-color": "#40C6E9" } as CssVars}>
       <strong>Sparklines</strong>
       <BinaryToggle label="Sparkline visibility" left="On" right="Off" leftActive={sparklinesEnabled} onChange={setSparklinesEnabled} color="#40C6E9" />
       <BinaryToggle label="Sparkline shape" left="Pill" right="Bar" leftActive={sparkShape === "pill"} onChange={(pill) => setSparkShape(pill ? "pill" : "bar")} color="#FFFF61" />
       <TernaryToggle label="Sparkline color" options={["solid", "rank", "spectrum"] as const} value={sparkColorMode} onChange={setSparkColorMode} color="#4FFF5B" />
       <BinaryToggle label="Sparkline palette" left="Color" right="Invert" leftActive={!sparkInverted} onChange={(color) => setSparkInverted(!color)} color="#FF83EA" />
       <BinaryToggle label="Sparkline outline" left="Stroke" right="Off" leftActive={sparkStroke} onChange={setSparkStroke} color="#FFB570" />
      </section>
      <section style={{ "--vt-effect-color": "#579AFF" } as CssVars}>
       <strong>Heat Map</strong>
       <BinaryToggle label="Heat map visibility" left="On" right="Off" leftActive={heatmapEnabled} onChange={setHeatmapEnabled} color="#579AFF" />
       <BinaryToggle label="Heat map palette" left="Color" right="Invert" leftActive={!heatmapInverted} onChange={(color) => setHeatmapInverted(!color)} color="#FF83EA" />
      </section>
      <section style={{ "--vt-effect-color": "#CC00FF" } as CssVars}>
       <strong>Cell Fill</strong>
       <BinaryToggle label="Cell fill visibility" left="On" right="Off" leftActive={cellFillEnabled} onChange={setCellFillEnabled} color="#CC00FF" />
       <BinaryToggle label="Cell fill palette" left="Color" right="Invert" leftActive={!cellFillInverted} onChange={(color) => setCellFillInverted(!color)} color="#FF83EA" />
      </section>
     </div>
    </div>}
   </div>
  </div>

  {table.id === "demographics" ? renderDemographicTable() : <>
   {renderScrollbar("top")}
   <div className="vt-sync-split-table">
    {renderVerticalScrollbar()}
    <div className="vt-sync-row-rail-viewport" ref={rowRailScrollRef} onScroll={(event) => { if (mainScrollRef.current && mainScrollRef.current.scrollTop !== event.currentTarget.scrollTop) mainScrollRef.current.scrollTop = event.currentTarget.scrollTop }}>{renderRowRail()}</div>
    {pinCount > 0 && <div className="vt-sync-pinned-viewport" ref={pinnedScrollRef}>{renderTable(pinnedGroups, true)}</div>}
    <div className="vt-sync-main-viewport" ref={mainScrollRef} onScroll={updateScrollState} onPointerMove={onHoverScroll} onPointerLeave={() => { hoverRef.current = { direction: 0, speed: 1 } }}>{renderTable(mainGroups, false)}</div>
   </div>
   {renderScrollbar("bottom")}
  </>}
  <footer className="vt-sync-table-footer">
   <div className="vt-sync-table-footer-status"><span>{getVtSyncPresentationLabel(table.id, table.label)}</span><span>Showing {renderedRows.length.toLocaleString()} of {sortedRows.length.toLocaleString()} rows</span><span>{table.id === "demographics" ? "3 sections · 3 gender metrics" : `${presentationColumns.length} columns · ${pinCount ? `${pinCount} pinned` : "not pinned"}`}</span><span>{renderedRows.length < sortedRows.length ? "Scroll for the next 50 rows" : "Complete visible dataset"}</span></div>
   <div className="vt-sync-table-footer-provenance"><span><b>Source</b> {tableProvenance.sourceLabel}</span><span><b>Updated</b> <time dateTime={tableProvenance.updatedAt}>{provenanceTime}</time></span>{tableProvenance.windowLabel && <span><b>Coverage</b> {tableProvenance.windowLabel}</span>}<span><b>Status</b> {tableProvenance.statusLabel}</span></div>
  </footer>
  </div></div>
 </section>
}

/* eslint-disable react-refresh/only-export-components -- compatibility exports are part of the existing VT-SYNC table API */
export { buildVtSyncTableViewModel, exportVtSyncTableCsv, importVtSyncCsvFiles } from "./vtSyncToolboxTableModel"
export const VtSyncDataTables = VtSyncToolboxDataTable
