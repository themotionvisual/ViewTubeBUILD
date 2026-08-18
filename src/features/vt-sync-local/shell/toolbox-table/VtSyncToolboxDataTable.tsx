import React, {
 useCallback,
 useEffect,
 useLayoutEffect,
 useMemo,
 useRef,
 useState,
} from "react"
import {
 Activity,
 ChevronDown,
 ChevronLeft,
 ChevronRight,
 ChevronUp,
 Clapperboard,
 Copy,
 DollarSign,
 Download,
 ExternalLink,
 Eye,
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
import { VT_SYNC_CATEGORY_OPTIONS } from "../../upstream/syncCategoryRegistry"
import type {
 VtSyncDatasetTableRowsRecord,
 VtSyncSnapshot,
 VtSyncTableColumnDefinition,
} from "../../adapters/contracts"
import type { VtSyncVideoCatalogCoverage } from "../../adapters/videoCatalogProjection"
import { mergeVtSyncSupplementalTableRows } from "../../adapters/manualImports"
import {
 deleteVtSyncDatasetTableRows,
 listVtSyncDatasetTableRows,
 putVtSyncDatasetTableRows,
} from "../../adapters/localDbRepository"
import { getVtSyncContentTypeLabel, normalizeVtSyncTableRows } from "../../adapters/tableData"
import {
 formatVtSyncDurationSeconds,
 formatVtSyncFullMonthValue,
 formatVtSyncLocalMonthValue,
 formatVtSyncTableCellValue,
 parseVtSyncDurationSeconds,
} from "../../adapters/tableFormatting"
import {
 filterVtSyncVideos,
 readVtSyncPrivacyFilters,
 saveVtSyncPrivacyFilters,
 type VtSyncPrivacyFilters,
} from "../../adapters/privacyPolicy"
import { getVtSyncTrafficDetailTable } from "../../upstream/tableRegistry"
import {
 VT_SYNC_COMPACT_PIN_TABLE_IDS,
 VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS,
 VT_SYNC_DEVICE_TYPE_LABELS,
 VT_SYNC_OPERATING_SYSTEM_LABELS,
 VT_SYNC_ROW_BATCH_SIZE,
 VT_SYNC_ROW_NUMBER_WIDTH,
 VT_SYNC_SMALL_TABLE_COLORS,
 VT_SYNC_TOOLBOX_CATEGORIES,
 buildVtSyncRetentionVisualModel,
 buildVtSyncRetentionVideoGroups,
 buildVtSyncTrafficDayGroups,
 buildVtSyncFormatSubscriberGroups,
 buildVtSyncDeviceOsGroups,
 buildVtSyncAlphabeticSpectrumLibrary,
 buildVtSyncTableViewModel,
 clampVtSyncColumnWidth,
 exportVtSyncTableCsv,
 findVtSyncTable,
 formatVtSyncColumnValue,
 distributeVtSyncSparseColumnWidths,
 getVtSyncCategoryClickState,
 createVtSyncWorkspaceUrlSearch,
 getVtSyncApiValuePresentation,
 getVtSyncAlphabeticSpectrumColors,
 getVtSyncBadgeValues,
 getVtSyncCategoryBadgePresentation,
 getVtSyncColumnSortedValues,
 getVtSyncColumnStateKey,
 getVtSyncCompositeIdentityPresentation,
 getVtSyncCompactMenuLabel,
 getVtSyncAbsolutePercentRatio,
 getVtSyncNumericRank,
 getVtSyncOrderedSpectrumColors,
 getNextVtSyncCompositeSortState,
 getVtSyncCompositeSortLabel,
 getVtSyncPresentationLabel,
 getVtSyncPresentationColumns,
 getVtSyncWorkspaceForTable,
 getVtSyncTableGeometry,
 getVtSyncTableProvenance,
 getVtSyncTrafficOverviewRowHeight,
 getVtSyncVerticalScrollMetrics,
 getVtSyncVideoTitleLayout,
 getVisibleVtSyncColumns,
 getVtSyncHoverScrollIntent,
 getNextVtSyncRowLimit,
 getVtSyncOppositeColor,
 indexVtSyncVideoRowsById,
 importVtSyncCsvFiles,
 isMissingVtSyncValue,
 isVtSyncCompositeSortActive,
 measureVtSyncCompactColumnWidths,
 resolveVtSyncColumnWidth,
 resolveVtSyncWorkspaceUrlState,
 reorderVtSyncColumnsWithinGroup,
 stableSortVtSyncRows,
 splitVtSyncSpecialCharacters,
 getVtSyncSparkColor,
 getVtSyncSparkFillStyle,
 getVtSyncSparkGradient,
 totalVtSyncColumn,
 toVtSyncNumber,
 type VtSyncImportedRows,
 type VtSyncRetentionVisualPoint,
 type VtSyncRetentionVideoGroup,
 type VtSyncSortState,
 type VtSyncFormatSubscriberGroup,
 type VtSyncTrafficDayGroup,
 type VtSyncDeviceOsGroup,
 type VtSyncTableRow,
} from "./vtSyncToolboxTableModel"
import "flag-icons/css/flag-icons.min.css"
import "./VtSyncToolboxDataTable.css"

type Group = {
 id: string
 label: string
 color: string
 columns: VtSyncTableColumnDefinition[]
}
type CssVars = React.CSSProperties & Record<`--${string}`, string | number>

export const resolveAnalyticsTableRows = ({
 tableId,
 snapshot,
 snapshotRows,
 importedRows,
 recoveredRows,
 privacyFilters,
}: {
 tableId: string
 snapshot: VtSyncSnapshot
 snapshotRows: VtSyncTableRow[]
 importedRows?: VtSyncImportedRows[string]
 recoveredRows?: VtSyncImportedRows[string]
 privacyFilters: VtSyncPrivacyFilters
}): VtSyncTableRow[] => {
 if (importedRows?.length) {
  // Fresh CSV imports are additive: keep API/snapshot rows as the base,
  // fill missing fields from the import, and append CSV-only identities.
  return mergeVtSyncSupplementalTableRows<VtSyncTableRow>(
   tableId,
   snapshotRows,
   importedRows,
  )
 }

 const normalizedRecoveredRows = recoveredRows?.length
  ? normalizeVtSyncTableRows(tableId, recoveredRows)
  : []

 const visibleRecoveredRows = tableId === "videos"
  ? filterVtSyncVideos(normalizedRecoveredRows, privacyFilters)
  : normalizedRecoveredRows

 if (visibleRecoveredRows.length) {
  return mergeVtSyncSupplementalTableRows<VtSyncTableRow>(
   tableId,
   snapshotRows,
   visibleRecoveredRows,
  )
 }

 return snapshotRows
}

const GROUP_COLORS = [
 "#FA618A",
 "#FF7F6B",
 "#FFA85C",
 "#FFDA47",
 "#C0F240",
 "#3FEE56",
 "#4EE4BE",
 "#36E0F6",
 "#528FFA",
 "#A467F4",
 "#F55EFC",
 "#FF7AC8",
]

const getOpaqueVtSyncTint = (color: string, amount = 0.22): string => {
 const channels = color
  .replace("#", "")
  .match(/.{1,2}/g)
  ?.map((part) => Number.parseInt(part, 16)) || [213, 242, 250]
 const blend = (channel: number) => Math.round(255 + (channel - 255) * amount)
 return `rgb(${blend(channels[0])}, ${blend(channels[1])}, ${blend(channels[2])})`
}

const DISPLAY_HEADER_LABELS: Record<string, string> = {
 thumbnail: "Cover",
 title: "Video",
 videoId: "ID",
 videoUrl: "URL",
 playlistUrl: "URL",
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

const getColumnDisplayLabel = (tableId: string, column: { key: string; label: string }): string => {
 if (tableId === "playlists" && column.key === "title") return "Playlist"
 return DISPLAY_HEADER_LABELS[column.key] || column.label
}

const COLLAPSED_GROUP_DISPLAY_LABELS: Record<string, string> = {
 "Core Engagement": "core engmnt.",
 Subscribers: "subs",
 Revenue: "revenue",
 Advertisement: "advrtsmt.",
 Premium: "premium",
 "Cards & End Screens": "cards",
}

const numericColumnValue = (
 row: VtSyncTableRow,
 column: VtSyncTableColumnDefinition,
): number | undefined =>
 (
  ["duration", "durationHours", "durationMinutes"].includes(column.format || "")
 ) ?
  parseVtSyncDurationSeconds(
   row[column.key],
   column.format as "duration" | "durationHours" | "durationMinutes",
  )
 : toVtSyncNumber(row[column.key])

const formatRetentionRatio = (value: unknown): string => {
 const ratio = toVtSyncNumber(value)
 if (ratio === undefined) return "-"
 const percentage = ratio * 100
 const precision =
  Math.abs(percentage) >= 100 || Number.isInteger(percentage) ? 0
  : Math.abs(percentage) >= 10 ? 1
  : 2
 return `${percentage.toFixed(precision).replace(/\.?0+$/, "")}%`
}

const retentionPointColor = (
 relativePerformance: number | undefined,
): string => {
 if (relativePerformance === undefined) return "#fff"
 if (relativePerformance >= 0.58) return "#C9F830"
 if (relativePerformance >= 0.52) return "#3FEE56"
 if (relativePerformance >= 0.48) return "#FFE357"
 if (relativePerformance >= 0.42) return "#FFA85C"
 return "#FF7AC8"
}

const retentionPolyline = (
 points: VtSyncRetentionVisualPoint[],
 key: "audienceRatio" | "relativePerformance",
 maxValue: number,
): string =>
 points
  .map((point, index) => {
   const value = point[key]
   const x = 24 + (index / Math.max(1, points.length - 1)) * 852
   const y =
    16 + (1 - Math.min(maxValue, Math.max(0, value ?? 0)) / maxValue) * 148
   return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  .join(" ")

const categoryIcon = (category: string) => {
 const props = { size: 25, strokeWidth: 3 }
  if (category === "time") return <Activity {...props} />
 if (category === "channel") return <Waypoints {...props} />
 if (category === "traffic") return <Route {...props} />
 if (category === "audience") return <UsersRound {...props} />
  if (category === "geographic") return <Globe2 {...props} />
 if (category === "revenue") return <DollarSign {...props} />
 return <Clapperboard {...props} />
}

const groupedColumns = (columns: VtSyncTableColumnDefinition[]): Group[] => {
 const groups: Group[] = []
 columns.forEach((column) => {
  const previous = groups[groups.length - 1]
  if (previous?.label === column.group) previous.columns.push(column)
  else
   groups.push({
    id: `${column.group}-${groups.length}`,
    label: column.group || "Metrics",
    color: GROUP_COLORS[groups.length % GROUP_COLORS.length],
    columns: [column],
   })
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
 if (Math.abs(number) >= 1_000_000)
  return `${(number / 1_000_000).toFixed(1)}M${suffix}`
 if (Math.abs(number) >= 1_000)
  return `${(number / 1_000).toFixed(1)}K${suffix}`
 return `${Math.round(number).toLocaleString()}${suffix}`
}

const moneyCompact = (value: unknown) => {
 const number = toVtSyncNumber(value)
 return number === undefined ? "-" : (
   `$${number.toLocaleString(undefined, { maximumFractionDigits: number >= 1_000 ? 0 : 2 })}`
  )
}

const manualImportId = (tableId: string) => `manual_import::${tableId}`

export const isManualImportNewerThanApi = (
 record: VtSyncDatasetTableRowsRecord,
 snapshot: VtSyncSnapshot,
): boolean => {
 if (
  !VT_SYNC_TOOLBOX_CATEGORIES.some((category) =>
   category.tableIds.includes(record.datasetId),
  )
 )
  return false
 const table = findVtSyncTable(record.datasetId)
 const apiUpdatedAt = [
  table.id,
  table.performanceHubDatasetId,
  ...table.categoryIds,
 ]
  .map((key) => snapshot.datasetFreshness?.[key])
  .filter((entry) => entry?.source !== "manual_import")
  .map((entry) => new Date(entry?.updatedAt || 0).getTime())
  .reduce((latest, value) => Math.max(latest, value), 0)
 return new Date(record.capturedAt).getTime() > apiUpdatedAt
}

const durationCompact = (value: unknown) =>
 formatVtSyncTableCellValue(value, "duration")

const downloadCsv = (name: string, csv: string) => {
 const url = URL.createObjectURL(
  new Blob([csv], { type: "text/csv;charset=utf-8" }),
 )
 const anchor = document.createElement("a")
 anchor.href = url
 anchor.download = name
 document.body.appendChild(anchor)
 anchor.click()
 anchor.remove()
 window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

const Switch = ({
 checked,
 label,
 onChange,
 activeColor = "#3FEE56",
}: {
 checked: boolean
 label: string
 onChange: () => void
 activeColor?: string
}) => (
 <button
  type="button"
  className={`vt-sync-switch ${checked ? "is-on" : ""}`}
  style={{ "--vt-toggle-color": activeColor } as CssVars}
  role="switch"
  aria-checked={checked}
  aria-label={label}
  onClick={onChange}>
  <span />
 </button>
)

const SettingControl = ({
 label,
 children,
 disabled = false,
}: {
 label: string
 children: React.ReactNode
 disabled?: boolean
}) => (
 <div className={`vt-sync-settings-control ${disabled ? "is-disabled" : ""}`}>
  <span>{label}</span>
  {children}
 </div>
)

const BinaryToggle = ({
 label,
 left,
 right,
 leftActive,
 onChange,
 color,
}: {
 label: string
 left: string
 right: string
 leftActive: boolean
 onChange: (left: boolean) => void
 color: string
}) => (
 <div className="vt-sync-binary-setting">
  <span>{label}</span>
  <div
   className="vt-sync-binary-toggle"
   role="group"
   aria-label={label}
   style={{ "--vt-binary-color": color } as CssVars}>
   <button
    type="button"
    className={leftActive ? "active" : ""}
    aria-pressed={leftActive}
    onClick={() => onChange(true)}>
    {left}
   </button>
   <button
    type="button"
    className={!leftActive ? "active" : ""}
    aria-pressed={!leftActive}
    onClick={() => onChange(false)}>
    {right}
   </button>
  </div>
 </div>
)

const TernaryToggle = <T extends string>({
 label,
 options,
 value,
 onChange,
 color,
}: {
 label: string
 options: readonly [T, T, T]
 value: T
 onChange: (v: T) => void
 color: string
}) => (
 <div className="vt-sync-binary-setting">
  <span>{label}</span>
  <div
   className="vt-sync-ternary-toggle"
   role="group"
   aria-label={label}
   style={{ "--vt-binary-color": color } as CssVars}>
   {options.map((opt) => (
    <button
     key={opt}
     type="button"
     className={value === opt ? "active" : ""}
     aria-pressed={value === opt}
     onClick={() => onChange(opt)}>
     {opt}
    </button>
   ))}
  </div>
 </div>
)

const SpectrumBadgeList = ({
 values,
 library,
 kind,
}: {
 values: string[]
 library: string[]
 kind: "tags" | "topics"
}) => (
 <span className={`vt-sync-spectrum-list is-${kind}`} title={values.join(", ")}>
  {values.map((value) => {
   const colors = getVtSyncAlphabeticSpectrumColors(value, library)
   return (
    <span
     className="vt-sync-spectrum-badge"
     style={
      {
       "--vt-badge-stroke": colors.stroke,
       "--vt-badge-fill": colors.fill,
      } as CssVars
     }
     key={value.toLocaleUpperCase()}>
     {value}
    </span>
   )
  })}
 </span>
)

const CategoryBadge = ({ value }: { value: unknown }) => {
 const presentation = getVtSyncCategoryBadgePresentation(value)
 return (
  <span
   className="vt-sync-category-badges"
   title={presentation.label}
   style={
    {
     "--vt-badge-stroke": presentation.colors.stroke,
     "--vt-badge-fill": presentation.colors.fill,
    } as CssVars
   }>
   <span className="vt-sync-category-badge">{presentation.label}</span>
  </span>
 )
}

type VtSyncFormatBadgePresentation = {
 badgeClass: "is-short" | "is-long" | "is-live"
 collapsedLabel: "S" | "L"
 label: "SHORTS" | "LONG-FORMAT" | "LIVE STREAM"
}

export const getVtSyncFormatBadgePresentation = (
 raw: unknown,
 row?: Record<string, any>,
): VtSyncFormatBadgePresentation => {
 const rawStr = String(raw ?? "").toLowerCase().trim()
 const titleLower = String(row?.title ?? row?.videoTitle ?? row?.name ?? "").toLowerCase()
 const isLive = rawStr === "live" || rawStr === "livestream" || rawStr.includes("live") || titleLower.includes("is live") || titleLower.includes("live highlight") || titleLower.includes("live stream")
 const isShort = !isLive && (rawStr === "short" || rawStr === "shorts" || rawStr.includes("short"))
 if (isLive) return { badgeClass: "is-live", collapsedLabel: "L", label: "LIVE STREAM" }
 if (isShort) return { badgeClass: "is-short", collapsedLabel: "S", label: "SHORTS" }
 return { badgeClass: "is-long", collapsedLabel: "L", label: "LONG-FORMAT" }
}

const VtSyncFormatCellBadge = ({ raw, row }: { raw: unknown; row: Record<string, any> }) => {
 const presentation = getVtSyncFormatBadgePresentation(raw, row)
 return (
  <span className={`vt-sync-format-badge ${presentation.badgeClass}`}>
   {presentation.label}
  </span>
 )
}

const FormatBadge = ({ value, label }: { value: unknown; label?: string }) => (
 <span
  className={`vt-sync-format-badge is-inline is-${String(value ?? label ?? "").toLowerCase().replace(/[^a-z0-9]/g, "")}`}>
  {label || getVtSyncContentTypeLabel(value)}
 </span>
)

const WEEKDAY_BADGE_LIBRARY = [
 "Monday",
 "Tuesday",
 "Wednesday",
 "Thursday",
 "Friday",
 "Saturday",
 "Sunday",
]
const MONTH_BADGE_LIBRARY = [
 "Jan",
 "Feb",
 "Mar",
 "Apr",
 "May",
 "Jun",
 "Jul",
 "Aug",
 "Sep",
 "Oct",
 "Nov",
 "Dec",
]
const FULL_MONTH_BADGE_LIBRARY = [
 "January",
 "February",
 "March",
 "April",
 "May",
 "June",
 "July",
 "August",
 "September",
 "October",
 "November",
 "December",
]

const DemographicCohortCell = ({
 row,
 text,
}: {
 row: VtSyncTableRow
 text: string
}) => {
 let formattedText = text
 let g = String(row.gender || "").toLowerCase()
 let a = String(row.ageGroup || "").toLowerCase()

 if (!g && !a && row.cohort) {
  const cohortLower = String(row.cohort).toLowerCase()
  if (cohortLower.includes("female")) g = "female"
  else if (cohortLower.includes("male")) g = "male"
  else if (cohortLower.includes("user_specified")) g = "user_specified"

  const ageMatch = cohortLower.match(/age(\d{2}-\d{2}|\d{2}-)/)
  if (ageMatch) a = ageMatch[0]
 }

 if (g || a) {
  const genderDisplay =
   g === "male" ? "Male"
   : g === "female" ? "Female"
   : g === "user_specified" ? "Other"
   : ""
  const ageDisplay = a ? a.replace("age", "Ages ") : ""
  if (genderDisplay && ageDisplay)
   formattedText = `${genderDisplay} : ${ageDisplay}`
  else formattedText = `${genderDisplay} ${ageDisplay}`.trim()
 }

 if (g) {
  const isFemale = g === "female"
  const isMale = g === "male"
  const colorClass =
   isMale ? "is-male"
   : isFemale ? "is-female"
   : "is-other"
  return (
   <span className={`vt-sync-demographic-badge ${colorClass}`}>
    {formattedText}
   </span>
  )
 }
 return <span className="vt-sync-cell-text">{formattedText}</span>
}

const DemographicAgeCell = ({
 row,
 text,
}: {
 row: VtSyncTableRow
 text: string
}) => (
 <span
  className="vt-sync-demographic-age"
  title={`${text} · all genders combined`}>
  <strong>{text}</strong>
  <small>All genders</small>
 </span>
)

const sumAvailablePercentages = (
 rows: VtSyncTableRow[],
 key: string,
): number | undefined => {
 const values = rows
  .map((row) => toVtSyncNumber(row[key]))
  .filter((value): value is number => value !== undefined)
 return values.length ?
   values.reduce((sum, value) => sum + value, 0)
  : undefined
}

const formatDemographicPercentage = (value: number | undefined): string => {
 if (value === undefined || value === 0) return "–"
 return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}%`
}

const VideoIdentityCell = ({
 row,
 title,
 titleLayout,
 hideMeta,
}: {
 row: VtSyncTableRow
 title: string
 titleLayout?: { fontSize: number; lineCount: number }
 hideMeta?: boolean
}) => {
 const videoId = String(row.videoId || row.term || "-")
 const displayTitle = String(row.title || row.sourceTitle || (title && title !== videoId ? title : "") || videoId)
 return (
  <span className="vt-sync-video-identity" title={`${displayTitle}\n${videoId}`}>
   <strong
    className={`is-two-line ${titleLayout?.lineCount === 2 ? "is-condensed" : ""}`}
    style={titleLayout ? { fontSize: `${titleLayout.fontSize}px` } : undefined}>
    {displayTitle}
   </strong>
   {!hideMeta && (
    <span className="vt-sync-video-identity-meta">
     <small>{videoId}</small>
    </span>
   )}
  </span>
 )
}

const PlaylistIdentityCell = ({
 row,
 title,
 titleLayout,
}: {
 row: VtSyncTableRow
 title: string
 titleLayout?: { fontSize: number; lineCount: number }
}) => {
 const playlistId = String(row.playlistId || row.id || "-")
 return (
  <span className="vt-sync-video-identity" title={`${title}\n${playlistId}`}>
   <strong
    className={`is-two-line ${titleLayout?.lineCount === 2 ? "is-condensed" : ""}`}
    style={titleLayout ? { fontSize: `${titleLayout.fontSize}px` } : undefined}>
    {title}
   </strong>
   <span className="vt-sync-video-identity-meta">
    <small>{playlistId}</small>
   </span>
  </span>
 )
}

const ChannelIdentityCell = ({
 row,
 title,
 titleLayout,
}: {
 row: VtSyncTableRow
 title: string
 titleLayout?: { fontSize: number; lineCount: number }
}) => {
 const channelId = String(row.channelId || row.term || "-")
 const displayTitle = String(row.title || row.channelTitle || row.sourceTitle || (title && title !== channelId ? title : "") || channelId)
 const handle = String(row.handle || "").trim()
 const meta = handle ? `${handle} (${channelId})` : channelId
 return (
  <span className="vt-sync-video-identity" title={`${displayTitle}\n${channelId}`}>
   <strong
    className={`is-two-line ${titleLayout?.lineCount === 2 ? "is-condensed" : ""}`}
    style={titleLayout ? { fontSize: `${titleLayout.fontSize}px` } : undefined}>
    {displayTitle}
   </strong>
   <span className="vt-sync-video-identity-meta">
    <small>{meta}</small>
   </span>
  </span>
 )
}

const TrafficSourceChannelCell = ({ row }: { row: VtSyncTableRow }) => {
 const title = String(row.sourceChannel || row.sourceChannelTitle || row.channelTitle || "Channel unavailable").trim()
 const rawHandle = String(row.sourceChannelHandle || row.channelHandle || "").trim()
 const handle = rawHandle ? (rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`) : ""
 return (
  <span className="vt-sync-video-identity" title={[title, handle].filter(Boolean).join("\n")}>
   <strong className="is-two-line">{title}</strong>
   {handle ? <span className="vt-sync-video-identity-meta"><small>{handle}</small></span> : null}
  </span>
 )
}

const CompositeIdentityCell = ({
 tableId,
 row,
}: {
 tableId: string
 row: VtSyncTableRow
}) => {
 const identity = getVtSyncCompositeIdentityPresentation(tableId, row)
 if (!identity) return null
 return (
  <span
   className={`vt-sync-composite-identity is-${tableId}`}
   title={[identity.title, identity.secondaryLabel, identity.rawId]
    .filter(Boolean)
    .join("\n")}>
   {identity.thumbnail ?
    <img src={identity.thumbnail} alt="" width="72" height="41" />
   : null}
   <span className="vt-sync-composite-identity-copy">
    <strong>{identity.title}</strong>
    {identity.secondaryLabel ? <small>{identity.secondaryLabel}</small> : null}
    {identity.rawId ? <em>{identity.rawId}</em> : null}
   </span>
   {identity.url ?
    <span className="vt-sync-video-identity-links">
     <button
      type="button"
      title={`Copy ${tableId === "chan_page" ? "channel" : "video"} URL`}
      aria-label={`Copy ${identity.title} URL`}
      onClick={(event) => {
       event.stopPropagation()
       void navigator.clipboard?.writeText(identity.url || "")
      }}>
      <Copy />
     </button>
     <a
      href={identity.url}
      target="_blank"
      rel="noreferrer"
      title={`Open ${identity.title}`}
      aria-label={`Open ${identity.title}`}
      onClick={(event) => event.stopPropagation()}>
      <ExternalLink />
     </a>
    </span>
   : null}
  </span>
 )
}

const PublishedMomentCell = ({ row }: { row: VtSyncTableRow }) => {
 const date = formatVtSyncTableCellValue(row.publishedAt, "dateLocal")
 const time = formatVtSyncTableCellValue(
  row.publishedTime || row.publishedAt,
  "timeLocal",
 )
 const weekday = formatVtSyncTableCellValue(
  row.publishedDay || row.publishedAt,
  "weekdayLocal",
 )
 const month = formatVtSyncLocalMonthValue(row.publishedAt)
 const meridiemMatch = time.match(/\s+(AM|PM)$/i)
 const meridiem = meridiemMatch?.[1]?.toUpperCase()
 const clockTime =
  meridiem ? time.slice(0, meridiemMatch?.index ?? time.length).trim() : time
 const weekdayColors = getVtSyncAlphabeticSpectrumColors(
  weekday,
  WEEKDAY_BADGE_LIBRARY,
 )
 const monthColors = getVtSyncAlphabeticSpectrumColors(
  month,
  MONTH_BADGE_LIBRARY,
 )
 return (
  <span
   className="vt-sync-published-moment"
   title={`${date} ${time} — ${weekday}, ${month}`}>
   <strong>
    <span>
     {date} {clockTime}
    </span>
    {meridiem && <em>{meridiem}</em>}
   </strong>
   <span>
    <small
     className="vt-sync-date-badge"
     style={
      {
       "--vt-badge-stroke": weekdayColors.stroke,
       "--vt-badge-fill": weekdayColors.fill,
      } as CssVars
     }>
     {weekday}
    </small>
    <small
     className="vt-sync-date-badge"
     style={
      {
       "--vt-badge-stroke": monthColors.stroke,
       "--vt-badge-fill": monthColors.fill,
      } as CssVars
     }>
     {month}
    </small>
   </span>
  </span>
 )
}

export const VtSyncToolboxDataTable: React.FC<{
 snapshot: VtSyncSnapshot
 privacyFilters?: VtSyncPrivacyFilters
 onPrivacyFiltersChange?: (filters: VtSyncPrivacyFilters) => void
 onManualImportsChange?: (payload?: {
 rowsByTableId: VtSyncImportedRows
 capturedAt: string
}) => void | Promise<void>
 videoCatalogCoverage?: VtSyncVideoCatalogCoverage
 storageStatus?: "loading" | "ready" | "failed"
 storageError?: string
}> = ({ snapshot, privacyFilters, onPrivacyFiltersChange, onManualImportsChange, videoCatalogCoverage, storageStatus = "ready", storageError }) => {
 const initialWorkspaceState = useMemo(
  () => resolveVtSyncWorkspaceUrlState(typeof window === "undefined" ? "" : window.location.search),
  [],
 )
 const initialExpandedIdsRef = useRef(new Set(initialWorkspaceState.expandedIds))
 const [categoryId, setCategoryId] = useState(
  VT_SYNC_TOOLBOX_CATEGORIES.find((item) => item.tableIds.includes(initialWorkspaceState.tableId))?.id
  || VT_SYNC_TOOLBOX_CATEGORIES[0].id,
 )
 const [viewId, setViewId] = useState(initialWorkspaceState.viewId)
 const [tableId, setTableId] = useState(initialWorkspaceState.tableId)
 const table = findVtSyncTable(tableId)
 const category =
  VT_SYNC_TOOLBOX_CATEGORIES.find((item) => item.id === categoryId) ||
  VT_SYNC_TOOLBOX_CATEGORIES[0]
 const syncModuleDescription = useMemo(() => {
  const seen = new Set<string>()
  const parts: string[] = []
  table.categoryIds.forEach((id) => {
   const option = VT_SYNC_CATEGORY_OPTIONS.find((entry) => entry.id === id)
   if (option && !seen.has(option.description)) {
    seen.add(option.description)
    parts.push(option.description)
   }
  })
  return parts.join(" ") || table.description
 }, [table.categoryIds, table.description])
 const [sort, setSort] = useState<VtSyncSortState>(table.defaultSort)
 const [dropdown, setDropdown] = useState<{
  id: string
  left: number
  top: number
  width: number
 } | null>(null)
 const dropdownId = dropdown?.id
 const [settingsOpen, setSettingsOpen] = useState(false)
 const [tableOpen, setTableOpen] = useState(true)
 const [search, setSearch] = useState(initialWorkspaceState.filter)
 const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
  initialWorkspaceState.columnFilters,
 )
 const [filterRows, setFilterRows] = useState(false)
 const [pin, setPin] = useState(false)
 const [compact, setCompact] = useState(false)
 const [dark, setDark] = useState(false)
 const [zebra, setZebra] = useState(false)
 const [formatRows, setFormatRows] = useState(false)
const [formulas, setFormulas] = useState(false)
  const [formatFilter, setFormatFilter] = useState('')
  const [heatmapEnabled, setHeatmapEnabled] = useState(true)
 const [heatmapInverted, setHeatmapInverted] = useState(false)
 const [cellFillEnabled, setCellFillEnabled] = useState(false)
 const [cellFillInverted, setCellFillInverted] = useState(false)
 const [sparklinesEnabled, setSparklinesEnabled] = useState(true)
 const [sparkInverted, setSparkInverted] = useState(true)
 const [sparkStroke, setSparkStroke] = useState(true)
 const [sparkShape, setSparkShape] = useState<"pill" | "bar">("pill")
 const [sparkColorMode, setSparkColorMode] = useState<
  "solid" | "rank" | "spectrum"
 >("rank")
 const [hoverScroll, setHoverScroll] = useState(true)
 const [focus, setFocus] = useState(false)
const [localPrivacyFilters, setLocalPrivacyFilters] =
   useState<VtSyncPrivacyFilters>(() => readVtSyncPrivacyFilters())

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
  Details: true,
  Format: true,
 })
 const [orders, setOrders] = useState<Record<string, string[]>>({})
 const [widths, setWidths] = useState<Record<string, number>>({})
 const [imported, setImported] = useState<VtSyncImportedRows>({})
 const [importedAt, setImportedAt] = useState<Record<string, string>>({})
 const [savedCsvTableIds, setSavedCsvTableIds] = useState<Set<string>>(
  new Set(),
 )
 const [csvPersistenceWarning, setCsvPersistenceWarning] = useState("")
 const [selectedKey, setSelectedKey] = useState<string | null>(null)
 const [dragKey, setDragKey] = useState<string | null>(null)
 const [dragOverKey, setDragOverKey] = useState<string | null>(null)
 const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(
  null,
 )
 const [scrollState, setScrollState] = useState({ left: 0, width: 100 })
 const [rowLimit, setRowLimit] = useState(VT_SYNC_ROW_BATCH_SIZE)
 const [expandedTrafficDays, setExpandedTrafficDays] = useState<Set<string>>(
  new Set(initialWorkspaceState.expandedIds.filter((id) => id.startsWith("traffic:")).map((id) => id.slice(8))),
 )
 const [expandedRetentionVideos, setExpandedRetentionVideos] = useState<
  Set<string>
 >(new Set(initialWorkspaceState.expandedIds.filter((id) => id.startsWith("retention:")).map((id) => id.slice(10))))
 const [retentionInspectorPoints, setRetentionInspectorPoints] = useState<
  Record<string, number>
 >({})
 const [expandedDeviceOsGroups, setExpandedDeviceOsGroups] = useState<
  Set<string>
 >(new Set(initialWorkspaceState.expandedIds.filter((id) => id.startsWith("device:")).map((id) => id.slice(7))))
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
 const previousTableIdRef = useRef(table.id)
 const resizeRef = useRef<{
  key: string
  start: number
  width: number
  pointerId: number
  target: HTMLElement
 } | null>(null)
 const holdRef = useRef<{ delay?: number; repeat?: number }>({})
 const verticalHoldRef = useRef<{ delay?: number; repeat?: number }>({})
 const compositeSortRef = useRef<Record<string, VtSyncSortState>>({})
 const toastTimerRef = useRef<number | undefined>(undefined)
 const hoverRef = useRef({ direction: 0, speed: 1 })
 const hoverFrameRef = useRef<number | undefined>(undefined)
 const hoverLastTimeRef = useRef(0)
 const hoverCurrentSpeedRef = useRef(0)
 const rowLoadPendingRef = useRef(false)
 const verticalThumbRef = useRef<HTMLSpanElement | null>(null)
 const verticalTrackWindowRef = useRef<HTMLSpanElement | null>(null)
 const verticalScrollMetricsRef = useRef(
  getVtSyncVerticalScrollMetrics({
   scrollTop: 0,
   scrollHeight: 0,
   clientHeight: 0,
   trackHeight: 0,
  }),
 )
 const verticalScrollFrameRef = useRef<number | undefined>(undefined)
 const pendingRetentionAnchorRef = useRef<{
  groupId: string
  viewportTop: number
 } | null>(null)
 const pendingTrafficDayAnchorRef = useRef<{
  groupId: string
  viewportTop: number
 } | null>(null)

 const activePrivacyFilters = privacyFilters || localPrivacyFilters

 useEffect(() => {
  // CSV persistence is channel-scoped. Do not re-hydrate (and potentially
  // clear) the active import every time the analytics snapshot changes.
  // A manual import itself triggers a snapshot refresh, which was causing the
  // freshly imported rows to flash briefly and then disappear.
  if (!snapshot.channelId) return

  let cancelled = false
  void listVtSyncDatasetTableRows()
   .then((records) => {
    if (cancelled) return

    const manualRecords = records.filter(
     (record) =>
      record.provenance === "csv" &&
      record.id.startsWith("manual_import::") &&
      record.channelId === snapshot.channelId,
    )

    setSavedCsvTableIds(
     new Set(manualRecords.map((record) => record.datasetId)),
    )

    // Manual CSVs are supplemental data, not replacements for API rows.
    // Keep every saved import for the active channel; the row merge helper
    // preserves API/snapshot values and only fills missing fields / appends
    // CSV-only identities. Do not discard a CSV merely because an API
    // freshness timestamp is newer.
    setImported(
     Object.fromEntries(
      manualRecords.map((record) => [record.datasetId, record.rows]),
     ),
    )
    setImportedAt(
     Object.fromEntries(
      manualRecords.map((record) => [record.datasetId, record.capturedAt]),
     ),
    )
    setCsvPersistenceWarning("")
   })
   .catch(() => {
    if (!cancelled)
     setCsvPersistenceWarning(
      "CSV imports are available for this session but cannot be retained after reload.",
     )
   })

  return () => {
   cancelled = true
  }
 }, [snapshot.channelId])
 const updatePrivacyFilter = (
  key: keyof VtSyncPrivacyFilters,
  value: boolean,
 ) => {
  const next = saveVtSyncPrivacyFilters({
   ...activePrivacyFilters,
   [key]: value,
  })
  setLocalPrivacyFilters(next)
  onPrivacyFiltersChange?.(next)
  setSelectedKey(null)
  setRowLimit(VT_SYNC_ROW_BATCH_SIZE)
 }

 const sourceRows = useMemo(() => {
  // Traffic × Day imports are already merged by the page owner. Other imports
  // are supplemented here for immediate post-import feedback.
  const importedRows = table.id === "traffic_day" ? undefined : imported[table.id]
  const snapshotRows = buildVtSyncTableViewModel(snapshot, table, activePrivacyFilters).rows
  return resolveAnalyticsTableRows({
   tableId: table.id,
   snapshot,
   snapshotRows,
   importedRows,
   privacyFilters: activePrivacyFilters,
  })
 }, [activePrivacyFilters, imported, snapshot, table])
 const trafficDayReference = useMemo(() => {
  const trafficDayTable = findVtSyncTable("traffic_day")
  return {
   columns: trafficDayTable.columns,
   rows:
    buildVtSyncTableViewModel(snapshot, trafficDayTable, activePrivacyFilters)
     .rows,
  }
 }, [activePrivacyFilters, snapshot])
 const spectrumBadgeLibrary = useMemo(
  () =>
   buildVtSyncAlphabeticSpectrumLibrary(
    sourceRows.flatMap((row) => [row.tags, row.topics]),
   ),
  [sourceRows],
 )
 const visibleBase = useMemo(
  () => getVisibleVtSyncColumns(table, sourceRows, formulas, true),
  [formulas, sourceRows, table],
 )
 const orderedColumns = useMemo(() => {
  const order = orders[table.id]
  if (!order) return visibleBase
  const byKey = new Map(visibleBase.map((column) => [column.key, column]))
  return [
   ...order.map((key) => byKey.get(key)).filter(Boolean),
   ...visibleBase.filter((column) => !order.includes(column.key)),
  ] as VtSyncTableColumnDefinition[]
 }, [orders, table.id, visibleBase])
 const presentationColumns = useMemo(
  () => getVtSyncPresentationColumns(table.id, orderedColumns),
  [orderedColumns, table.id],
 )
 const compactEligible =
  VT_SYNC_COMPACT_PIN_TABLE_IDS.has(table.id) &&
  table.compactMode !== "normal-only"
 const effectiveCompact = compact && compactEligible
 const sparkOpposite = sparkInverted
 const tableGeometry = getVtSyncTableGeometry(
  presentationColumns.length,
  effectiveCompact,
  sparklinesEnabled,
  table.layoutMode,
  table.compactMode,
 )
 const trafficDetailFamily = getVtSyncTrafficDetailTable(table.id)?.family
 const pinCount =
  pin && compactEligible && tableGeometry.canPin ?
   Math.min(
    presentationColumns.filter(
     (column) =>
      column.pinned === "left" ||
      ["Identity", "Metadata", "Video"].includes(column.group),
    ).length || 1,
    table.id === "videos" ? 3 : 2,
   )
  : 0
 const pinnedColumns = presentationColumns.slice(0, pinCount)
 const mainColumns = presentationColumns.slice(pinCount)
 const pinnedGroups = groupedColumns(pinnedColumns)
 const mainGroups = groupedColumns(mainColumns)

const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return sourceRows.filter((row) => {
      // If there's a search query, check if the row matches it
      const matchesSearch = !query || orderedColumns.some((column) => {
        const formatted = formatVtSyncColumnValue(row, column).toLowerCase()
        const apiValue = getVtSyncApiValuePresentation(
          table.id,
          column.key,
          row[column.key],
        )
        return (
          formatted.includes(query) ||
          Boolean(
            apiValue &&
            `${apiValue.title} ${apiValue.apiValue}`.toLowerCase().includes(query),
          )
        )
      })

      // If there's a format filter, check if the row's format matches
      const matchesFormat = !formatFilter || String(row.format).toLowerCase() === formatFilter.toLowerCase()

      // If either search or format fails, skip the row
      if (!matchesSearch || !matchesFormat) {
        return false
      }

      // If filterRows is disabled, we only need to match search and format
      if (!filterRows) return true

      // Otherwise, also check the column filters
      return orderedColumns.every((column) => {
        const filter = columnFilters[getVtSyncColumnStateKey(table.id, column.key)]
          ?.trim()
          .toLowerCase()
        if (!filter) return true
        const formatted = formatVtSyncColumnValue(row, column).toLowerCase()
        const apiValue = getVtSyncApiValuePresentation(
          table.id,
          column.key,
          row[column.key],
        )
        return (
          formatted.includes(filter) ||
          Boolean(
            apiValue &&
            `${apiValue.title} ${apiValue.apiValue}`.toLowerCase().includes(filter),
          )
        )
      })
    })
  }, [columnFilters, filterRows, formatFilter, orderedColumns, search, sourceRows, table.id])
 const sortedRows = useMemo(
  () =>
   stableSortVtSyncRows(
    filteredRows,
    sort,
    orderedColumns.find((column) => column.key === sort.key),
   ),
  [filteredRows, orderedColumns, sort],
 )
 const trafficDayGroups = useMemo(
  () =>
   table.presentationMode === "traffic-source-day" ?
    buildVtSyncTrafficDayGroups(sortedRows, orderedColumns)
   : [],
  [orderedColumns, sortedRows, table.presentationMode],
 )
 const sortedTrafficDayGroups = useMemo(() => {
  if (table.presentationMode !== "traffic-source-day") return []
  const sortColumnDefinition = orderedColumns.find(
   (column) => column.key === sort.key,
  )
  const direction = sort.direction === "asc" ? 1 : -1
  const compareValues = (left: unknown, right: unknown): number => {
   const leftNumber =
    sortColumnDefinition ?
     numericColumnValue(
      { value: left },
      { ...sortColumnDefinition, key: "value" },
     )
    : toVtSyncNumber(left)
   const rightNumber =
    sortColumnDefinition ?
     numericColumnValue(
      { value: right },
      { ...sortColumnDefinition, key: "value" },
     )
    : toVtSyncNumber(right)
   if (
    leftNumber !== undefined &&
    rightNumber !== undefined &&
    leftNumber !== rightNumber
   )
    return (leftNumber - rightNumber) * direction
   return String(left ?? "").localeCompare(String(right ?? "")) * direction
  }
  const compareGroups = (
   left: VtSyncTrafficDayGroup,
   right: VtSyncTrafficDayGroup,
  ) => {
   if (sort.key === "day") return (left.sortTime - right.sortTime) * direction
   if (sort.key === "term") return right.sortTime - left.sortTime
   const compared = compareValues(left.totals[sort.key], right.totals[sort.key])
   return compared || right.sortTime - left.sortTime
  }
  const compareSources = (
   left: VtSyncTrafficDayGroup["sources"][number],
   right: VtSyncTrafficDayGroup["sources"][number],
  ) => {
   if (sort.key === "day")
    return (
     (toVtSyncNumber(right.row.views) || 0) -
     (toVtSyncNumber(left.row.views) || 0)
    )
   if (sort.key === "term")
    return left.sourceLabel.localeCompare(right.sourceLabel) * direction
   const compared = compareValues(left.row[sort.key], right.row[sort.key])
   return (
    compared ||
    (toVtSyncNumber(right.row.views) || 0) -
     (toVtSyncNumber(left.row.views) || 0)
   )
  }
  return trafficDayGroups
   .map((group) => ({
    ...group,
    sources: [...group.sources].sort(compareSources),
   }))
   .sort(compareGroups)
 }, [
  orderedColumns,
  sort.direction,
  sort.key,
  table.presentationMode,
 trafficDayGroups,
 ])
 const formatSubscriberGroups = useMemo(
  () =>
   table.presentationMode === "format-subscriber-status" ?
    buildVtSyncFormatSubscriberGroups(sortedRows, orderedColumns)
   : [],
  [orderedColumns, sortedRows, table.presentationMode],
 )
 const sortedFormatSubscriberGroups = useMemo(() => {
  if (table.presentationMode !== "format-subscriber-status") return []
  const sortColumnDefinition = orderedColumns.find(
   (column) => column.key === sort.key,
  )
  const direction = sort.direction === "asc" ? 1 : -1
  const compareValues = (left: unknown, right: unknown): number => {
   const leftNumber =
    sortColumnDefinition ?
     numericColumnValue(
      { value: left },
      { ...sortColumnDefinition, key: "value" },
     )
    : toVtSyncNumber(left)
   const rightNumber =
    sortColumnDefinition ?
     numericColumnValue(
      { value: right },
      { ...sortColumnDefinition, key: "value" },
     )
    : toVtSyncNumber(right)
   if (
    leftNumber !== undefined &&
    rightNumber !== undefined &&
    leftNumber !== rightNumber
   )
    return (leftNumber - rightNumber) * direction
   return String(left ?? "").localeCompare(String(right ?? "")) * direction
  }
  const compareGroups = (
   left: VtSyncFormatSubscriberGroup,
   right: VtSyncFormatSubscriberGroup,
  ) => {
   if (sort.key === "term") return left.formatLabel.localeCompare(right.formatLabel) * direction
   if (sort.key === "status") return (right.statuses.length - left.statuses.length) * direction
   const compared = compareValues(left.totals[sort.key], right.totals[sort.key])
   return compared || left.formatLabel.localeCompare(right.formatLabel)
  }
  const compareStatuses = (
   left: VtSyncFormatSubscriberGroup["statuses"][number],
   right: VtSyncFormatSubscriberGroup["statuses"][number],
  ) => {
   if (sort.key === "term") return 0
   if (sort.key === "status") return left.statusLabel.localeCompare(right.statusLabel) * direction
   const compared = compareValues(left.row[sort.key], right.row[sort.key])
   return (
    compared ||
    (toVtSyncNumber(right.row.views) || 0) -
     (toVtSyncNumber(left.row.views) || 0)
   )
  }
  return formatSubscriberGroups
   .map((group) => ({
    ...group,
    statuses: [...group.statuses].sort(compareStatuses),
   }))
   .sort(compareGroups)
 }, [
  formatSubscriberGroups,
  orderedColumns,
  sort.direction,
  sort.key,
  table.presentationMode,
 ])
 const trafficSourceBadgeColors = useMemo(() => {
  if (table.id !== "traffic" && table.presentationMode !== "traffic-source-day")
   return new Map<string, { stroke: string; fill: string }>()
  const sourceGroups = buildVtSyncTrafficDayGroups(
   trafficDayReference.rows,
   trafficDayReference.columns,
  )
  const newestGroup = sourceGroups[0]
  const rankedSources = new Set<string>()
  const colors = new Map<string, { stroke: string; fill: string }>()
  const assignColor = (source: string, index: number) => {
   const stroke =
    VT_SYNC_SMALL_TABLE_COLORS[index % VT_SYNC_SMALL_TABLE_COLORS.length]
   colors.set(source.toLocaleUpperCase(), {
    stroke,
    fill: getOpaqueVtSyncTint(stroke, 0.24),
   })
  }
  ;[...(newestGroup?.sources || [])]
   .sort(
    (left, right) =>
     (toVtSyncNumber(right.row.views) || 0) -
     (toVtSyncNumber(left.row.views) || 0),
   )
   .forEach((source, index) => {
    rankedSources.add(source.sourceApiValue.toLocaleUpperCase())
    assignColor(source.sourceApiValue, index)
   })

  const remainingTotals = new Map<string, number>()
  sourceGroups.forEach((group) =>
   group.sources.forEach((source) => {
    const key = source.sourceApiValue.toLocaleUpperCase()
    if (rankedSources.has(key)) return
    remainingTotals.set(
     key,
     (remainingTotals.get(key) || 0) + (toVtSyncNumber(source.row.views) || 0),
    )
   }),
  )
  ;[...remainingTotals.entries()]
   .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
   .forEach(([source], index) =>
    assignColor(source, rankedSources.size + index),
   )
 return colors
 }, [table.id, table.presentationMode, trafficDayReference])
 const visibleTrafficDayGroups = sortedTrafficDayGroups.slice(0, rowLimit)
 const visibleFormatSubscriberGroups = sortedFormatSubscriberGroups.slice(0, rowLimit)
 const retentionVideoGroups = useMemo(
  () =>
   table.presentationMode === "retention-video" ?
    buildVtSyncRetentionVideoGroups(sortedRows)
   : [],
  [sortedRows, table.presentationMode],
 )
 const sortedRetentionVideoGroups = useMemo(() => {
  if (table.presentationMode !== "retention-video") return []
  const direction = sort.direction === "asc" ? 1 : -1
  const compare = (
   left: VtSyncRetentionVideoGroup,
   right: VtSyncRetentionVideoGroup,
  ) => {
   if (sort.key === "videoId")
    return left.videoId.localeCompare(right.videoId) * direction
   const leftValue = toVtSyncNumber(left.summary[sort.key])
   const rightValue = toVtSyncNumber(right.summary[sort.key])
   if (
    leftValue !== undefined &&
    rightValue !== undefined &&
    leftValue !== rightValue
   )
    return (leftValue - rightValue) * direction
   if (leftValue === undefined && rightValue !== undefined) return 1
   if (leftValue !== undefined && rightValue === undefined) return -1
   return left.videoId.localeCompare(right.videoId)
  }
  return [...retentionVideoGroups].sort(compare)
 }, [retentionVideoGroups, sort.direction, sort.key, table.presentationMode])
 const visibleRetentionVideoGroups = sortedRetentionVideoGroups
 const shouldRenderVerticalScrollbar =
  table.verticalScrollMode === "custom" &&
  (table.presentationMode === "traffic-source-day" ? visibleTrafficDayGroups.length > 15
   : table.presentationMode === "format-subscriber-status" ? visibleFormatSubscriberGroups.length > 15
   : table.presentationMode === "retention-video" ? visibleRetentionVideoGroups.length > 15
   : sortedRows.length > 15)
 const retentionVideoMetadata = useMemo(() => {
  const importedVideoRows = imported.videos
  const registeredRows = buildVtSyncTableViewModel(
   snapshot,
   findVtSyncTable("videos"),
   activePrivacyFilters,
  ).rows
  const exportedRows = [
   ...(Array.isArray(snapshot.tableExports?.videos) ?
    snapshot.tableExports.videos
   : []),
   ...(Array.isArray(snapshot.tableExports?.["videos.csv"]) ?
    snapshot.tableExports["videos.csv"]
   : []),
  ] as VtSyncTableRow[]
  const videoRows = [
   ...(importedVideoRows ?
    filterVtSyncVideos(importedVideoRows, activePrivacyFilters)
   : []),
   ...registeredRows,
   ...exportedRows,
  ]
  return indexVtSyncVideoRowsById(videoRows)
 }, [activePrivacyFilters, imported.videos, snapshot])
 const demographicSummary = useMemo(() => {
  if (table.id !== "demographics") return undefined
  const genderTotals = [
   {
    key: "male",
    label: "Male",
    color: VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS.maleViewerPercentage,
    value: sumAvailablePercentages(sortedRows, "maleViewerPercentage"),
   },
   {
    key: "female",
    label: "Female",
    color: VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS.femaleViewerPercentage,
    value: sumAvailablePercentages(sortedRows, "femaleViewerPercentage"),
   },
   {
    key: "other",
    label: "Other",
    color: VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS.otherViewerPercentage,
    value: sumAvailablePercentages(sortedRows, "otherViewerPercentage"),
   },
  ]
  return { genderTotals }
 }, [sortedRows, table.id])
 const deviceOsSummary = useMemo(() => {
  if (table.id !== "device_os") return undefined
  const deviceTotals = new Map<string, number>()
  const osTotals = new Map<string, number>()
  let grandTotal = 0
  sortedRows.forEach((row) => {
   const device = String(row.device ?? "Unknown").trim() || "Unknown"
   const os = String(row.operatingSystem ?? "Unknown").trim() || "Unknown"
   const views = toVtSyncNumber(row.views) ?? 0
   deviceTotals.set(device, (deviceTotals.get(device) || 0) + views)
   osTotals.set(os, (osTotals.get(os) || 0) + views)
   grandTotal += views
  })
  const toPct = (views: number): number | undefined =>
   grandTotal > 0 ? (views / grandTotal) * 100 : undefined
  const getDeviceLabel = (key: string) =>
   VT_SYNC_DEVICE_TYPE_LABELS[key.toUpperCase()] || key
  const getOsLabel = (key: string) =>
   VT_SYNC_OPERATING_SYSTEM_LABELS[key.toUpperCase()] || key

  const deviceList = [...deviceTotals.entries()]
   .sort((left, right) => right[1] - left[1])
   .map(([key, views], index) => ({
    key,
    label: getDeviceLabel(key),
    color:
     VT_SYNC_SMALL_TABLE_COLORS[index % VT_SYNC_SMALL_TABLE_COLORS.length],
    pct: toPct(views),
   }))

  const osList = [...osTotals.entries()]
   .sort((left, right) => right[1] - left[1])
   .map(([key, views], index) => ({
    key,
    label: getOsLabel(key),
    color:
     VT_SYNC_SMALL_TABLE_COLORS[index % VT_SYNC_SMALL_TABLE_COLORS.length],
    pct: toPct(views),
   }))

  return { deviceList, osList }
 }, [sortedRows, table.id])
 const deviceOsGroups = useMemo(
  () =>
   table.id === "device_os" ?
    buildVtSyncDeviceOsGroups(sortedRows, orderedColumns)
   : [],
  [orderedColumns, sortedRows, table.id],
 )
 const deviceOsDisplayColumns = useMemo(() => {
  const keys = [
   "views",
   "engagedViews",
   "watchTime",
   "avgDuration",
   "avgPercentageViewed",
  ]
  const byKey = new Map(orderedColumns.map((column) => [column.key, column]))
  return keys
   .map((key) => byKey.get(key))
   .filter(Boolean) as VtSyncTableColumnDefinition[]
 }, [orderedColumns])
 const sortedDeviceOsGroups = useMemo(() => {
  if (table.id !== "device_os") return []
  const sortColumnDefinition = deviceOsDisplayColumns.find(
   (column) => column.key === sort.key,
  )
  const direction = sort.direction === "asc" ? 1 : -1
  const compareValues = (left: unknown, right: unknown): number => {
   const leftNumber =
    sortColumnDefinition ?
     numericColumnValue(
      { value: left },
      { ...sortColumnDefinition, key: "value" },
     )
    : toVtSyncNumber(left)
   const rightNumber =
    sortColumnDefinition ?
     numericColumnValue(
      { value: right },
      { ...sortColumnDefinition, key: "value" },
     )
    : toVtSyncNumber(right)
   if (
    leftNumber !== undefined &&
    rightNumber !== undefined &&
    leftNumber !== rightNumber
   )
    return (leftNumber - rightNumber) * direction
   return String(left ?? "").localeCompare(String(right ?? "")) * direction
  }
  const compareGroups = (
   left: VtSyncDeviceOsGroup,
   right: VtSyncDeviceOsGroup,
  ) => {
   if (sort.key === "operatingSystem")
    return left.osLabel.localeCompare(right.osLabel) * direction
   const compared = compareValues(left.totals[sort.key], right.totals[sort.key])
   return (
    compared ||
    (toVtSyncNumber(right.totals.views) || 0) -
     (toVtSyncNumber(left.totals.views) || 0)
   )
  }
  const compareDevices = (
   left: VtSyncDeviceOsGroup["devices"][number],
   right: VtSyncDeviceOsGroup["devices"][number],
  ) => {
   if (sort.key === "operatingSystem")
    return left.deviceLabel.localeCompare(right.deviceLabel) * direction
   const compared = compareValues(left.row[sort.key], right.row[sort.key])
   return (
    compared ||
    (toVtSyncNumber(right.row.views) || 0) -
     (toVtSyncNumber(left.row.views) || 0)
   )
  }
  return deviceOsGroups
   .map((group) => ({
    ...group,
    devices: [...group.devices].sort(compareDevices),
   }))
   .sort(compareGroups)
 }, [
  deviceOsDisplayColumns,
  deviceOsGroups,
  sort.direction,
  sort.key,
  table.id,
 ])
 const toggleDeviceOsGroup = (groupId: string) => {
  setExpandedDeviceOsGroups((current) => {
   const next = new Set(current)
   if (next.has(groupId)) next.delete(groupId)
   else next.add(groupId)
   return next
  })
 }
 const tableProvenance = useMemo(
  () =>
   getVtSyncTableProvenance(
    snapshot,
    table,
    imported[table.id] ? importedAt[table.id] : undefined,
   ),
  [imported, importedAt, snapshot, table],
 )
 const provenanceTime = useMemo(() => {
  const date = new Date(tableProvenance.updatedAt)
  if (Number.isNaN(date.getTime()))
   return tableProvenance.updatedAt || "Unknown"
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
 const remainingRowSpacerHeight =
  Math.max(0, sortedRows.length - renderedRows.length) * tableGeometry.rowHeight
 const numericSorted = useMemo(
  () =>
   Object.fromEntries(
    presentationColumns.map((column) => [
     column.key,
     getVtSyncColumnSortedValues(sortedRows, column),
    ]),
   ),
  [presentationColumns, sortedRows],
 )
 const totalContext = useMemo(
  () =>
   table.id === "videos" ?
    {
     avatarUrl: snapshot.avatarUrl,
     channelName: snapshot.channelName,
     channelDescription: snapshot.channelDescription,
     channelCustomUrl: snapshot.channelCustomUrl,
     channelId: snapshot.channelId,
     channelPublishedAt: snapshot.channelPublishedAt,
     channelVideoCount: snapshot.channelVideoCount,
     channelLifetime: (snapshot.channelTotals?.lifetime || null) as VtSyncTableRow | null,
    }
   : undefined,
  [
   snapshot.avatarUrl,
   snapshot.channelCustomUrl,
   snapshot.channelDescription,
   snapshot.channelId,
   snapshot.channelName,
   snapshot.channelPublishedAt,
   snapshot.channelTotals?.lifetime,
   snapshot.channelVideoCount,
   table.id,
  ],
 )
 const compactWidths = useMemo(() => {
  if (!effectiveCompact || typeof document === "undefined") return {}
  const context = document.createElement("canvas").getContext("2d")
  return measureVtSyncCompactColumnWidths(
   table,
   sortedRows,
   (value, font) => {
    if (!context) return 0
    context.font = font
    return context.measureText(value).width
   },
   totalContext,
  )
 }, [effectiveCompact, sortedRows, table, totalContext])
 const measureVideoTitle = useMemo(() => {
  if (typeof document === "undefined") return undefined
  const context = document.createElement("canvas").getContext("2d")
  if (!context) return undefined
  context.font = '1000 16px "Century Gothic", "Helvetica Neue", sans-serif'
  return (value: string) => context.measureText(value).width
 }, [])
 const originalColumnIndices = useMemo(
  () => new Map(table.columns.map((column, index) => [column.key, index])),
  [table],
 )
 const widthKey = (column: VtSyncTableColumnDefinition) =>
  getVtSyncColumnStateKey(table.id, column.key)
 const baseColumnWidths = useMemo(
  () =>
   Object.fromEntries(
    presentationColumns.map((column) => {
     const key = getVtSyncColumnStateKey(table.id, column.key)
     return [
      column.key,
      resolveVtSyncColumnWidth({
       tableId: table.id,
       column,
       columnIndex: originalColumnIndices.get(column.key) || 0,
       compact: effectiveCompact,
       sparklines: sparklinesEnabled,
       compactWidths,
       override: widths[key],
      }),
     ]
    }),
   ),
  [
   compactWidths,
   effectiveCompact,
   originalColumnIndices,
   presentationColumns,
   sparklinesEnabled,
   table.id,
   widths,
  ],
 )
 const sparseColumnWidths = useMemo(
  () =>
   tableGeometry.mode === "sparse" ?
    distributeVtSyncSparseColumnWidths(
     presentationColumns.map((column) => ({
      key: column.key,
      width: baseColumnWidths[column.key],
      overridden:
       widths[getVtSyncColumnStateKey(table.id, column.key)] !== undefined ||
       (table.id === "traffic" && column.key === "source") ||
       (table.id === "cities" &&
        ["countryFlag", "city", "countryName"].includes(column.key)),
     })),
     viewportWidth,
     0,
    )
   : {},
  [
   baseColumnWidths,
   presentationColumns,
   table.id,
   tableGeometry.mode,
   viewportWidth,
   widths,
  ],
 )
 const columnWidth = (column: VtSyncTableColumnDefinition) =>
  sparseColumnWidths[column.key] ?? baseColumnWidths[column.key]

 const selected = useMemo(
  () =>
   sortedRows.find(
    (row, index) => String(row.videoId ?? row.id ?? index) === selectedKey,
   ) || sortedRows[0],
  [selectedKey, sortedRows],
 )
 const tableTotalRows = useMemo(() => {
  if (table.summaryMode !== "primary-row" || !table.summaryPrimaryRow)
   return sortedRows
  const primary = sortedRows.filter(
   (row) =>
    String(row[table.summaryPrimaryRow!.key] ?? "") ===
    table.summaryPrimaryRow!.value,
  )
  return primary.length ? primary : sortedRows.slice(0, 1)
 }, [sortedRows, table.summaryMode, table.summaryPrimaryRow])
 const selectedNetSubscribers = useMemo(() => {
  const gained = toVtSyncNumber(selected?.subscribersGained)
  const lost = toVtSyncNumber(selected?.subscribersLost)
  return gained === undefined || lost === undefined ? undefined : gained - lost
 }, [selected])
 const summaryStats = useMemo(
  () =>
   table.summaryMode === "selected-video" ?
    [
     {
      label: "Views",
      value: numberCompact(selected?.views),
      note: "Selected video",
     },
     {
      label: "Eng. Views",
      value: numberCompact(selected?.engagedViews),
      note: "Engaged",
     },
     {
      label: "Watch",
      value: formatVtSyncTableCellValue(selected?.watchTime, "durationHours"),
      note: "Watch time",
     },
     {
      label: "Avg Viewed",
      value:
       selected?.averagePercentageViewed === undefined ?
        "-"
       : `${numberCompact(selected.averagePercentageViewed)}%`,
      note: "Retention signal",
     },
     {
      label: "Avg. View Dur.",
      value: durationCompact(selected?.avgViewDuration),
      note: "Per view",
     },
     {
      label: "All In One",
      value:
       [
        selected?.publishedAt &&
         formatVtSyncTableCellValue(selected.publishedAt, "dateLocal"),
        selected?.duration && durationCompact(selected.duration),
        selected?.format,
       ]
        .filter(Boolean)
        .join(" / ") || "-",
      note: "Info",
     },
     {
      label: "Subs",
      value:
       selectedNetSubscribers === undefined ? "-" : (
        `${selectedNetSubscribers > 0 ? "+" : ""}${selectedNetSubscribers}`
       ),
      note: "Net change",
     },
     { label: "Likes", value: numberCompact(selected?.likes), note: "Total" },
     { label: "Revenue", value: moneyCompact(selected?.revenue), note: "Est." },
     { label: "CPM", value: moneyCompact(selected?.cpm), note: "Playback" },
    ]
   : (() => {
     const byKey = new Map(
      presentationColumns.map((column) => [column.key, column]),
     )
     const registered = (
      table.summaryColumns?.length ?
       table.summaryColumns.map((key) => byKey.get(key)).filter(Boolean)
      : presentationColumns.filter(
        (column) =>
         column.semanticRole === "metric" &&
         tableTotalRows.some((row) => !isMissingVtSyncValue(row[column.key])),
       )) as VtSyncTableColumnDefinition[]
     const metrics = registered.slice(0, 4).map((column) => {
      const total = totalVtSyncColumn(tableTotalRows, column)
      return {
       label: getColumnDisplayLabel(table.id, column),
       value: total.primary || "-",
       note: total.secondary || "Available values",
      }
     })
     // Only surface metrics that actually resolved — never pad the row with
     // empty "Metric / Not available" placeholder cards.
     return [
      {
       label: "Rows",
       value: sortedRows.length.toLocaleString(),
       note: "Visible records",
      },
      ...metrics,
     ]
    })(),
  [
   presentationColumns,
   selected,
   selectedNetSubscribers,
   sortedRows,
   table.summaryColumns,
   table.summaryMode,
   tableTotalRows,
  ],
 )

 const updateVerticalScrollThumb = useCallback((node: HTMLDivElement) => {
  const next = getVtSyncVerticalScrollMetrics({
   scrollTop: node.scrollTop,
   scrollHeight: node.scrollHeight,
   clientHeight: node.clientHeight,
   trackHeight: verticalTrackWindowRef.current?.clientHeight ?? 0,
  })
  verticalScrollMetricsRef.current = next
  if (verticalScrollFrameRef.current !== undefined) return
  verticalScrollFrameRef.current = window.requestAnimationFrame(() => {
   verticalScrollFrameRef.current = undefined
   const thumb = verticalThumbRef.current
   if (!thumb) return
   const metrics = verticalScrollMetricsRef.current
   thumb.style.top = `${metrics.thumbTop}px`
   thumb.style.height = `${metrics.thumbHeight}px`
   thumb.setAttribute("aria-valuemax", String(metrics.maxScroll))
   thumb.setAttribute("aria-valuenow", String(Math.round(node.scrollTop)))
  })
 }, [])

 const updateScrollState = useCallback(() => {
  const node = mainScrollRef.current
  if (!node) return
  if (pinnedScrollRef.current)
   pinnedScrollRef.current.scrollTop = node.scrollTop
  if (rowRailScrollRef.current)
   rowRailScrollRef.current.scrollTop = node.scrollTop
  const usesFlatRowBatches =
   table.presentationMode !== "retention-video" &&
   table.presentationMode !== "traffic-source-day" &&
   table.presentationMode !== "format-subscriber-status"
  const spacer =
   usesFlatRowBatches ?
    node.querySelector<HTMLElement>("[data-vt-row-spacer]")
   : null
  const nextBatchBoundary = spacer?.offsetTop ?? node.scrollHeight
  if (
   usesFlatRowBatches &&
   !rowLoadPendingRef.current &&
   renderedRows.length < sortedRows.length &&
   node.scrollTop + node.clientHeight >=
    nextBatchBoundary - tableGeometry.rowHeight * 2
  ) {
   rowLoadPendingRef.current = true
   setRowLimit((current) => getNextVtSyncRowLimit(current, sortedRows.length))
  }
  // Traffic × Day loads next batch of 50 day groups when the user nears the bottom.
  if (
   (table.presentationMode === "traffic-source-day" ||
    table.presentationMode === "format-subscriber-status") &&
   !rowLoadPendingRef.current &&
   (
    table.presentationMode === "traffic-source-day" ?
     visibleTrafficDayGroups.length < sortedTrafficDayGroups.length
    : visibleFormatSubscriberGroups.length < sortedFormatSubscriberGroups.length
   ) &&
   node.scrollTop + node.clientHeight >= node.scrollHeight - 240
  ) {
   rowLoadPendingRef.current = true
   setRowLimit((current) =>
    getNextVtSyncRowLimit(
     current,
     table.presentationMode === "traffic-source-day" ?
      sortedTrafficDayGroups.length
     : sortedFormatSubscriberGroups.length,
    ),
   )
  }
  const max = Math.max(1, node.scrollWidth - node.clientWidth)
  const nextScrollState = {
   left: Math.min(100, (node.scrollLeft / max) * 100),
   width: Math.min(100, (node.clientWidth / node.scrollWidth) * 100),
  }
  setScrollState((current) =>
   (
    Math.abs(current.left - nextScrollState.left) < 0.01 &&
    Math.abs(current.width - nextScrollState.width) < 0.01
   ) ?
    current
   : nextScrollState,
  )
  updateVerticalScrollThumb(node)
 }, [
  renderedRows.length,
  sortedRows.length,
  sortedFormatSubscriberGroups.length,
  sortedTrafficDayGroups.length,
  table.presentationMode,
  tableGeometry.rowHeight,
  updateVerticalScrollThumb,
  visibleFormatSubscriberGroups.length,
  visibleTrafficDayGroups.length,
 ])

 useEffect(() => {
  const tableChanged = previousTableIdRef.current !== table.id
  previousTableIdRef.current = table.id
  setSort(table.defaultSort)
  setSelectedKey(null)
  if (tableChanged) {
   setExpandedTrafficDays(new Set())
   setExpandedRetentionVideos(new Set())
   setExpandedDeviceOsGroups(new Set())
  }
  setRetentionInspectorPoints({})
  setRowLimit(VT_SYNC_ROW_BATCH_SIZE)
  compositeSortRef.current = {}
  setCollapsed(
   Object.fromEntries(
    table.collapsedGroups.map((group) => [
     group,
     !initialExpandedIdsRef.current.has(`group:${group}`),
    ]),
   ),
  )
  if (mainScrollRef.current) mainScrollRef.current.scrollLeft = 0
 }, [table])

 useEffect(() => {
  if (typeof window === "undefined") return
  const expandedIds = [
   ...expandedTrafficDays,
  ].map((id) =>
   table.presentationMode === "format-subscriber-status" ?
    `format-subscriber:${id}`
   : `traffic:${id}`,
  )
   .concat([...expandedRetentionVideos].map((id) => `retention:${id}`))
   .concat([...expandedDeviceOsGroups].map((id) => `device:${id}`))
   .concat(
    Object.entries(collapsed)
     .filter(([, isCollapsed]) => !isCollapsed)
     .map(([group]) => `group:${group}`),
   )
  const resolvedLocation = getVtSyncWorkspaceForTable(tableId)
  const nextSearch = createVtSyncWorkspaceUrlSearch(window.location.search, {
   workspaceId: resolvedLocation.workspace.id,
   viewId: resolvedLocation.view.id,
   tableId,
   filter: search,
   columnFilters,
   expandedIds,
  })
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`
  window.history.replaceState(window.history.state, "", nextUrl)
 }, [
  collapsed,
  columnFilters,
  expandedDeviceOsGroups,
  expandedRetentionVideos,
  expandedTrafficDays,
  search,
  tableId,
  viewId,
 ])

 useEffect(() => {
  if (table.presentationMode !== "traffic-source-day" && table.presentationMode !== "format-subscriber-status") return
  setExpandedTrafficDays((current) => {
   const groups =
    table.presentationMode === "traffic-source-day" ?
     sortedTrafficDayGroups
    : sortedFormatSubscriberGroups
   const valid = new Set(groups.map((group) => group.id))
   const kept = [...current].filter((id) => valid.has(id))
   if (kept.length) return new Set(kept)
   if (table.presentationMode === "format-subscriber-status") return new Set(groups.map((group) => group.id))
   return groups[0] ?
     new Set([groups[0].id])
    : new Set()
  })
 }, [table.presentationMode, sortedFormatSubscriberGroups, sortedTrafficDayGroups])

 useEffect(() => {
  if (table.presentationMode !== "retention-video") return
  setExpandedRetentionVideos((current) => {
   const valid = new Set(sortedRetentionVideoGroups.map((group) => group.id))
   const kept = [...current].filter((id) => valid.has(id))
   if (kept.length) return new Set(kept)
   return sortedRetentionVideoGroups[0] ?
     new Set([sortedRetentionVideoGroups[0].id])
    : new Set()
  })
 }, [sortedRetentionVideoGroups, table.presentationMode])

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
  if (verticalTrackWindowRef.current)
   observer.observe(verticalTrackWindowRef.current)
  const frame = window.requestAnimationFrame(updateViewport)
  return () => {
   observer.disconnect()
   window.cancelAnimationFrame(frame)
  }
 }, [pinCount, presentationColumns, table.id, updateScrollState])

 useLayoutEffect(() => {
  const pending = pendingRetentionAnchorRef.current
  const node = mainScrollRef.current
  if (!node || table.presentationMode !== "retention-video") return
  if (pending) {
   const anchor = [
    ...node.querySelectorAll<HTMLElement>("[data-retention-group-id]"),
   ].find((candidate) => candidate.dataset.retentionGroupId === pending.groupId)
   if (anchor)
    node.scrollTop += anchor.getBoundingClientRect().top - pending.viewportTop
  }
  pendingRetentionAnchorRef.current = null
  updateVerticalScrollThumb(node)
 }, [
  expandedRetentionVideos,
  table.presentationMode,
  updateVerticalScrollThumb,
 ])

 useLayoutEffect(() => {
  const pending = pendingTrafficDayAnchorRef.current
  const node = mainScrollRef.current
  if (!node || (table.presentationMode !== "traffic-source-day" && table.presentationMode !== "format-subscriber-status")) return
  if (pending) {
   const anchor = [
    ...node.querySelectorAll<HTMLElement>("[data-traffic-day-group-id]"),
   ].find(
    (candidate) => candidate.dataset.trafficDayGroupId === pending.groupId,
   )
   if (anchor)
    node.scrollTop += anchor.getBoundingClientRect().top - pending.viewportTop
  }
  pendingTrafficDayAnchorRef.current = null
  updateVerticalScrollThumb(node)
 }, [expandedTrafficDays, table.presentationMode, updateVerticalScrollThumb])

 useEffect(
  () => () => {
   if (verticalScrollFrameRef.current !== undefined)
    window.cancelAnimationFrame(verticalScrollFrameRef.current)
  },
  [],
 )

 useEffect(() => {
  const close = (event: MouseEvent) => {
   if (
    settingsRef.current &&
    !settingsRef.current.contains(event.target as Node)
   )
    setSettingsOpen(false)
   if (
    dropdownRef.current &&
    !dropdownRef.current.contains(event.target as Node) &&
    categoryRailRef.current &&
    !categoryRailRef.current.contains(event.target as Node)
   )
    setDropdown(null)
  }
  const key = (event: KeyboardEvent) => {
   if (event.key === "Escape") {
    setFocus(false)
    setSettingsOpen(false)
    setDropdown(null)
   }
  }
  document.addEventListener("mousedown", close)
  document.addEventListener("keydown", key)
  return () => {
   document.removeEventListener("mousedown", close)
   document.removeEventListener("keydown", key)
  }
 }, [])

 useEffect(() => {
  if (!dropdownId) return
  const update = () => {
   const button = categoryButtonRefs.current[dropdownId]
   if (!button) return
   const bounds = button.getBoundingClientRect()
   if (bounds.bottom < 0 || bounds.top > window.innerHeight) {
    setDropdown(null)
    return
   }
   const requestedWidth = dropdownId === "all_data" ? Math.max(bounds.width, 360) : bounds.width
   const menuWidth = Math.min(requestedWidth, window.innerWidth - 16)
   setDropdown((current) =>
    current?.id === dropdownId ?
     {
      ...current,
      left: Math.max(
       8,
       Math.min(bounds.left, window.innerWidth - menuWidth - 8),
      ),
      top: bounds.bottom - 3,
      width: menuWidth,
     }
    : current,
   )
  }
  const rail = categoryRailRef.current
  window.addEventListener("resize", update)
  window.addEventListener("scroll", update, true)
  rail?.addEventListener("scroll", update, { passive: true })
  return () => {
   window.removeEventListener("resize", update)
   window.removeEventListener("scroll", update, true)
   rail?.removeEventListener("scroll", update)
  }
 }, [dropdownId])

 useEffect(
  () => () => {
   window.clearTimeout(toastTimerRef.current)
   window.clearTimeout(holdRef.current.delay)
   window.clearInterval(holdRef.current.repeat)
   window.clearTimeout(verticalHoldRef.current.delay)
   window.clearInterval(verticalHoldRef.current.repeat)
   if (hoverFrameRef.current) window.cancelAnimationFrame(hoverFrameRef.current)
  },
  [],
 )

 useEffect(() => {
  const tick = (timestamp: number) => {
   const node = mainScrollRef.current
   if (!hoverLastTimeRef.current) hoverLastTimeRef.current = timestamp
   const elapsed = Math.min(100, timestamp - hoverLastTimeRef.current)
   hoverLastTimeRef.current = timestamp
   if (hoverScroll && node && hoverRef.current.direction) {
    const target =
     hoverRef.current.direction * hoverRef.current.speed * (5.5 / 16.6667)
    hoverCurrentSpeedRef.current +=
     (target - hoverCurrentSpeedRef.current) * 0.18
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
   setWidths((current) => ({
    ...current,
    [resize.key]: clampVtSyncColumnWidth(resize.width + event.clientX - resize.start),
   }))
  }
  const up = () => {
   const resize = resizeRef.current
   if (resize?.target.hasPointerCapture(resize.pointerId))
    resize.target.releasePointerCapture(resize.pointerId)
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

 const selectCategory = (
  nextId: (typeof VT_SYNC_TOOLBOX_CATEGORIES)[number]["id"],
  nextTable = VT_SYNC_TOOLBOX_CATEGORIES.find((item) => item.id === nextId)
   ?.tableIds[0],
 ) => {
  if (!nextTable) return
  const resolved = getVtSyncWorkspaceForTable(nextTable)
  setCategoryId(nextId)
  setViewId(resolved.view.id)
  setTableId(nextTable)
  setDropdown(null)
 }

 const clickCategory = (
  item: (typeof VT_SYNC_TOOLBOX_CATEGORIES)[number],
  button: HTMLButtonElement,
 ) => {
  const next = getVtSyncCategoryClickState(
   { categoryId, tableId, dropdownId: dropdown?.id || null },
   item,
  )
  setCategoryId(next.categoryId as typeof categoryId)
  const resolved = getVtSyncWorkspaceForTable(next.tableId)
  setViewId(resolved.view.id)
  setTableId(next.tableId)
  if (!next.dropdownId) {
   setDropdown(null)
   return
  }
  const bounds = button.getBoundingClientRect()
  const requestedWidth = bounds.width
  const menuWidth = Math.min(requestedWidth, window.innerWidth - 16)
  setDropdown({
   id: next.dropdownId,
   left: Math.max(8, Math.min(bounds.left, window.innerWidth - menuWidth - 8)),
   top: bounds.bottom - 3,
   width: menuWidth,
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
  const reordered = reorderVtSyncColumnsWithinGroup(
   orderedColumns,
   sourceKey,
   targetKey,
  )
  if (reordered === orderedColumns) return
  setOrders((current) => ({
   ...current,
   [table.id]: reordered.map((column) => column.key),
  }))
 }

 const startColumnDrag = (
  event: React.DragEvent<HTMLTableCellElement>,
  column: VtSyncTableColumnDefinition,
  color: string,
 ) => {
  setDragKey(column.key)
  event.dataTransfer.effectAllowed = "move"
  event.dataTransfer.setData("text/plain", column.key)
  const width = columnWidth(column)
  const ghost = document.createElement("div")
  ghost.className = "vt-sync-column-drag-ghost"
  ghost.style.width = `${width}px`
  const header = document.createElement("strong")
  header.textContent = getColumnDisplayLabel(table.id, column)
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
  const groups = Array.from(
   node.querySelectorAll<HTMLElement>("[data-group-start]"),
  )
  const positions = groups.map((item) => item.offsetLeft).sort((a, b) => a - b)
  const current = node.scrollLeft
  const next =
   direction > 0 ?
    positions.find((position) => position > current + 10)
   : [...positions].reverse().find((position) => position < current - 10)
  node.scrollTo({
   left: next ?? (direction > 0 ? node.scrollWidth : 0),
   behavior: "smooth",
  })
 }

 const startHold = (direction: -1 | 1) => {
  groupScroll(direction)
  window.clearTimeout(holdRef.current.delay)
  window.clearInterval(holdRef.current.repeat)
  holdRef.current.delay = window.setTimeout(() => {
   holdRef.current.repeat = window.setInterval(
    () => mainScrollRef.current?.scrollBy({ left: direction * 16 }),
    45,
   )
  }, 360)
 }

 const stopHold = () => {
  window.clearTimeout(holdRef.current.delay)
  window.clearInterval(holdRef.current.repeat)
  holdRef.current = {}
 }

 const scrollRows = (direction: -1 | 1) => {
  mainScrollRef.current?.scrollBy({
   top: direction * tableGeometry.rowHeight * 5,
   behavior: "smooth",
  })
 }

 const startVerticalHold = (direction: -1 | 1) => {
  scrollRows(direction)
  window.clearTimeout(verticalHoldRef.current.delay)
  window.clearInterval(verticalHoldRef.current.repeat)
  verticalHoldRef.current.delay = window.setTimeout(() => {
   verticalHoldRef.current.repeat = window.setInterval(
    () =>
     mainScrollRef.current?.scrollBy({
      top: direction * tableGeometry.rowHeight,
     }),
    55,
   )
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
   const available = Math.max(
    1,
    track.clientWidth * (1 - scrollState.width / 100),
   )
   const max = Math.max(0, node.scrollWidth - node.clientWidth)
   node.scrollLeft = initial + ((next.clientX - start) / available) * max
  }
  const done = () => {
   if (target.hasPointerCapture(pointerId))
    target.releasePointerCapture(pointerId)
   window.removeEventListener("pointermove", move)
   window.removeEventListener("pointerup", done)
   window.removeEventListener("pointercancel", done)
  }
  window.addEventListener("pointermove", move)
  window.addEventListener("pointerup", done)
  window.addEventListener("pointercancel", done)
 }

 const dragVerticalThumb = (event: React.PointerEvent<HTMLSpanElement>) => {
  const track = verticalTrackWindowRef.current
  const node = mainScrollRef.current
  if (!track || !node) return
  const target = event.currentTarget
  const pointerId = event.pointerId
  target.setPointerCapture(pointerId)
  const start = event.clientY
  const initial = node.scrollTop
  const initialMetrics = getVtSyncVerticalScrollMetrics({
   scrollTop: node.scrollTop,
   scrollHeight: node.scrollHeight,
   clientHeight: node.clientHeight,
   trackHeight: track.clientHeight,
  })
  let latestClientY = event.clientY
  let frame: number | undefined
  let finished = false
  const apply = () => {
   frame = undefined
   const nextScrollTop =
    initialMetrics.trackTravel > 0 ?
     initial +
     ((latestClientY - start) / initialMetrics.trackTravel) *
      initialMetrics.maxScroll
    : 0
   node.scrollTop = Math.min(
    initialMetrics.maxScroll,
    Math.max(0, nextScrollTop),
   )
  }
  const move = (next: PointerEvent) => {
   latestClientY = next.clientY
   if (frame === undefined) frame = window.requestAnimationFrame(apply)
  }
  const done = () => {
   if (finished) return
   finished = true
   if (frame !== undefined) {
    window.cancelAnimationFrame(frame)
    apply()
   }
   target.removeEventListener("lostpointercapture", done)
   if (target.hasPointerCapture(pointerId))
    target.releasePointerCapture(pointerId)
   window.removeEventListener("pointermove", move)
   window.removeEventListener("pointerup", done)
   window.removeEventListener("pointercancel", done)
  }
  target.addEventListener("lostpointercapture", done)
  window.addEventListener("pointermove", move)
  window.addEventListener("pointerup", done)
  window.addEventListener("pointercancel", done)
 }

 const pageVerticalTrack = (clientY: number) => {
  const node = mainScrollRef.current
  const track = verticalTrackWindowRef.current
  if (!node || !track) return
  const metrics = verticalScrollMetricsRef.current
  const click = clientY - track.getBoundingClientRect().top
  const direction =
   click < metrics.thumbTop ? -1
   : click > metrics.thumbTop + metrics.thumbHeight ? 1
   : 0
  if (!direction) return
  const reducedMotion = window.matchMedia?.(
   "(prefers-reduced-motion: reduce)",
  ).matches
  node.scrollBy({
   top: direction * node.clientHeight * 0.85,
   behavior: reducedMotion ? "auto" : "smooth",
  })
 }

 const handleVerticalScrollbarKey = (
  event: React.KeyboardEvent<HTMLSpanElement>,
 ) => {
  const node = mainScrollRef.current
  if (!node) return
  if (event.key === "Home" || event.key === "End") {
   event.preventDefault()
   node.scrollTop = event.key === "Home" ? 0 : node.scrollHeight
   return
  }
  const offsets: Partial<Record<string, number>> = {
   ArrowUp: -tableGeometry.rowHeight,
   ArrowDown: tableGeometry.rowHeight,
   PageUp: -node.clientHeight * 0.85,
   PageDown: node.clientHeight * 0.85,
  }
  const offset = offsets[event.key]
  if (offset === undefined) return
  event.preventDefault()
  node.scrollBy({ top: offset })
 }

 const onHoverScroll = (event: React.PointerEvent<HTMLDivElement>) => {
  if (!hoverScroll || !mainScrollRef.current) {
   hoverRef.current = { direction: 0, speed: 1 }
   return
  }
  const bounds = event.currentTarget.getBoundingClientRect()
  const relativeX = event.clientX - bounds.left
  hoverRef.current = getVtSyncHoverScrollIntent(relativeX, bounds.width)
 }

 const renderScrollbar = (position: "top" | "bottom") => (
  <div
   className={`vt-sync-scrollbar ${position}`}
   aria-label={`${position} table scrollbar`}>
   <div className="vt-sync-scroll-controls">
    <button
     type="button"
     aria-label="Previous metric group"
     onPointerDown={() => startHold(-1)}
     onPointerUp={stopHold}
     onPointerLeave={stopHold}>
     <ChevronLeft />
    </button>
    <div
     className="vt-sync-scroll-track"
     onPointerDown={(event) => {
      if (
       (event.target as HTMLElement).classList.contains("vt-sync-scroll-thumb")
      )
       return
      const bounds = event.currentTarget.getBoundingClientRect()
      const node = mainScrollRef.current
      if (node)
       node.scrollLeft =
        ((event.clientX - bounds.left) / bounds.width) *
        (node.scrollWidth - node.clientWidth)
     }}>
     <span className="vt-sync-scroll-track-window">
      <span
       className="vt-sync-scroll-thumb"
       style={{
        left: `${scrollState.left * (1 - scrollState.width / 100)}%`,
        width: `${scrollState.width}%`,
       }}
       onPointerDown={dragThumb}
      />
     </span>
    </div>
    <button
     type="button"
     aria-label="Next metric group"
     onPointerDown={() => startHold(1)}
     onPointerUp={stopHold}
     onPointerLeave={stopHold}>
     <ChevronRight />
    </button>
   </div>
  </div>
 )

 const renderVerticalScrollbar = () => (
  <div
   className="vt-sync-vertical-scrollbar"
   aria-label="Vertical table scrollbar">
   <div className="vt-sync-vertical-scrollbar-header" aria-hidden="true" />
   <button
    type="button"
    aria-label="Scroll up five rows"
    onPointerDown={() => startVerticalHold(-1)}
    onPointerUp={stopVerticalHold}
    onPointerLeave={stopVerticalHold}>
    <ChevronUp />
   </button>
   <div
    className="vt-sync-vertical-scroll-track"
    onPointerDown={(event) => {
     if (
      (event.target as HTMLElement).classList.contains(
       "vt-sync-vertical-scroll-thumb",
      )
     )
      return
     pageVerticalTrack(event.clientY)
    }}>
    <span
     ref={verticalTrackWindowRef}
     className="vt-sync-vertical-scroll-track-window">
     <span
      ref={verticalThumbRef}
      className="vt-sync-vertical-scroll-thumb"
      role="scrollbar"
      aria-label="Table vertical position"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={0}
      aria-valuenow={0}
      tabIndex={0}
      style={{ top: 0, height: 44 }}
      onKeyDown={handleVerticalScrollbarKey}
      onPointerDown={dragVerticalThumb}
     />
    </span>
   </div>
   <button
    type="button"
    aria-label="Scroll down five rows"
    onPointerDown={() => startVerticalHold(1)}
    onPointerUp={stopVerticalHold}
    onPointerLeave={stopVerticalHold}>
    <ChevronDown />
   </button>
  </div>
 )

 const cellStyle = (
  row: VtSyncTableRow,
  column: VtSyncTableColumnDefinition,
  color: string,
 ): { style: React.CSSProperties; className?: string } => {
  if (column.visualization === "none" || column.semanticRole === "identity")
   return { style: {} }
  const raw = row[column.key]
  if (isMissingVtSyncValue(raw)) return { style: {} }
  const value = numericColumnValue(row, column)
  const sortedValues = numericSorted[column.key]
  const colorRgb = (source: string) =>
   source
    .replace("#", "")
    .match(/.{2}/g)
    ?.map((part) => Number.parseInt(part, 16)) || [79, 255, 91]
  const heatColor = heatmapInverted ? getVtSyncOppositeColor(color) : color
  const fillColor = cellFillInverted ? getVtSyncOppositeColor(color) : color
  const rank = getVtSyncNumericRank(value, sortedValues)
  if (!rank) return { style: {} }
  const style: React.CSSProperties = {}
  if (heatmapEnabled)
   style.backgroundColor = `rgba(${colorRgb(heatColor).join(",")},${0.16 + rank * 0.68})`
  if (cellFillEnabled)
   style.backgroundImage = `linear-gradient(90deg, rgba(${colorRgb(fillColor).join(",")},.68) ${Math.round(rank * 100)}%, transparent ${Math.round(rank * 100)}%)`
  return { style, className: heatmapEnabled ? "has-heatmap" : undefined }
 }

 const renderRowRail = () => (
  <table
   className="vt-sync-data-table vt-sync-row-rail-table"
   aria-label="Table row numbers and header labels"
   style={{
    width: VT_SYNC_ROW_NUMBER_WIDTH,
    minWidth: VT_SYNC_ROW_NUMBER_WIDTH,
    maxWidth: VT_SYNC_ROW_NUMBER_WIDTH,
   }}>
   <colgroup>
    <col
     style={{
      width: VT_SYNC_ROW_NUMBER_WIDTH,
      minWidth: VT_SYNC_ROW_NUMBER_WIDTH,
      maxWidth: VT_SYNC_ROW_NUMBER_WIDTH,
     }}
    />
   </colgroup>
   <thead>
    {tableGeometry.useGroups && (
     <tr className="vt-sync-group-row">
      <th className="vt-sync-row-rail-head is-blank" aria-hidden="true" />
     </tr>
    )}
    {table.id !== "demographics" &&
     !["daily", "weekly", "monthly"].includes(table.id) && (
      <tr className="vt-sync-total-row">
       <th className="vt-sync-row-rail-head is-totals">Totals</th>
      </tr>
     )}
    <tr className="vt-sync-column-row">
     <th className="vt-sync-row-rail-head is-stats">Stats</th>
    </tr>
    {filterRows && (
     <tr className="vt-sync-filter-row">
      <th className="vt-sync-row-rail-head is-filter" aria-hidden="true" />
     </tr>
    )}
   </thead>
   <tbody>
    {renderedRows.map((row, index) => {
     const rowKey = String(
      row.videoId ?? row.id ?? row.date ?? row.term ?? index,
     )
     return (
      <tr key={`rail-${rowKey}-${index}`}>
       <td className="vt-sync-row-rail-number">{index + 1}</td>
      </tr>
     )
    })}
    {remainingRowSpacerHeight > 0 && (
     <tr
      className="vt-sync-row-spacer"
      data-vt-row-spacer="true"
      aria-hidden="true">
      <td
       style={
        { "--vt-row-spacer-height": `${remainingRowSpacerHeight}px` } as CssVars
       }
      />
     </tr>
    )}
   </tbody>
  </table>
 )

 const sortColumn = (column: VtSyncTableColumnDefinition) => {
  const cycleKey = `${table.id}|${column.key}`
  const cycleCurrent = compositeSortRef.current[cycleKey] || {
   key: "",
   direction: "desc" as const,
  }
  const compositeSort = getNextVtSyncCompositeSortState(
   table.id,
   column.key,
   cycleCurrent,
  )
  if (compositeSort) {
   compositeSortRef.current[cycleKey] = compositeSort
   setSort(compositeSort)
   return
  }
  setSort((current) => ({
   key: column.key,
   direction:
    current.key === column.key && current.direction === "desc" ? "asc" : "desc",
  }))
 }

 const renderTable = (groups: Group[], isPinned: boolean) => {
  const renderColumns = groups
   .flatMap((group) =>
    tableGeometry.useGroups && collapsed[group.label] ?
     [{ column: group.columns[0], group, isCollapsed: true }]
    : group.columns.map((column) => ({ column, group, isCollapsed: false })),
   )
   .map((entry, index) => ({
    ...entry,
    color:
     table.id === "demographics" ?
      VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS[entry.column.key] ||
      VT_SYNC_SMALL_TABLE_COLORS[index % VT_SYNC_SMALL_TABLE_COLORS.length]
     : tableGeometry.useGroups ? entry.group.color
     : VT_SYNC_SMALL_TABLE_COLORS[index % VT_SYNC_SMALL_TABLE_COLORS.length],
   }))
  const renderWidth = ({
   column,
   isCollapsed,
  }: (typeof renderColumns)[number]) => (isCollapsed ? 40 : columnWidth(column))
  const tableWidth = renderColumns.reduce(
   (sum, entry) => sum + renderWidth(entry),
   0,
  )
  return (
   <table
    className={`vt-sync-data-table ${tableGeometry.mode === "sparse" ? "is-sparse" : ""}`}
    aria-label={`${getVtSyncPresentationLabel(table.id, table.label)}${isPinned ? " pinned columns" : ""}`}
    style={{ width: tableWidth, minWidth: tableWidth, maxWidth: tableWidth }}>
    <colgroup>
     {renderColumns.map((entry) => {
      const width = renderWidth(entry)
      return (
       <col
        key={`${entry.group.id}-${entry.column.key}`}
        style={{ width, minWidth: width, maxWidth: width }}
       />
      )
     })}
    </colgroup>
    <thead>
     {tableGeometry.useGroups && (
      <tr className="vt-sync-group-row">
       {groups.map((group) =>
        collapsed[group.label] ?
         <th
          key={group.id}
          className="is-collapsed"
          colSpan={1}
          style={{ background: group.color }}
          data-group-start="true">
          <button
           type="button"
           onClick={() =>
            setCollapsed((current) => ({ ...current, [group.label]: false }))
           }
           aria-expanded="false"
           aria-label={`Expand ${group.label}`}>
           <Maximize2 />
          </button>
         </th>
        : <th
          key={group.id}
          colSpan={group.columns.length}
          style={{ background: group.color }}
          data-group-start="true">
          <strong>{group.label}</strong>
          <button
           type="button"
           onClick={() =>
            setCollapsed((current) => ({ ...current, [group.label]: true }))
           }
           aria-expanded="true"
           aria-label={`Collapse ${group.label}`}>
           <Minimize2 />
          </button>
         </th>,
       )}
      </tr>
     )}
     {table.id !== "demographics" &&
      !["daily", "weekly", "monthly"].includes(table.id) && (
       <tr className="vt-sync-total-row">
        {renderColumns.map(({ column, group, isCollapsed, color }) => {
         const width = isCollapsed ? 40 : columnWidth(column)
         if (isCollapsed) {
          if (group.label === "Format") {
           const total = totalVtSyncColumn(tableTotalRows, column, totalContext)
           if (total.badges?.length) {
            return (
             <th
              className="is-collapsed"
              key={`${group.id}-${column.key}`}
              style={{
               width,
               minWidth: width,
               maxWidth: width,
               "--vt-total-cell-background": getOpaqueVtSyncTint(color, 0.22),
              }}>
              <div className="vt-sync-collapsed-format-totals">
               {total.badges.map((badge) => {
                const presentation = getVtSyncFormatBadgePresentation(badge.value)
                return (
                 <span key={badge.value} className={presentation.badgeClass}>
                  {presentation.collapsedLabel}
                 </span>
                )
               })}
              </div>
             </th>
            )
           }
          }
          return (
           <th
            className="is-collapsed"
            key={`${group.id}-${column.key}`}
            style={{
             width,
             minWidth: width,
             maxWidth: width,
             "--vt-total-cell-background": getOpaqueVtSyncTint(color, 0.22),
            }}
           />
          )
         }
         const total = totalVtSyncColumn(tableTotalRows, column, totalContext)
         const totalClock = splitVtSyncSpecialCharacters(
          total.primary,
          column.key,
         )
         return (
          <th
           className={`is-${total.kind || "numeric"}`}
           data-column-key={column.key}
           key={`${group.id}-${column.key}`}
           style={{
           width,
           minWidth: width,
           maxWidth: width,
            "--vt-total-cell-background": getOpaqueVtSyncTint(color, 0.22),
           }}>
{total.badges?.length ?
            <div className="vt-sync-total-badges">
             {total.badges.map((badge) => {
              if (column.key === "format") {
               const presentation = getVtSyncFormatBadgePresentation(badge.value)
               return (
                <span
                 key={badge.value}
                 className={`vt-sync-format-badge ${presentation.badgeClass}`}>
                 <span>{presentation.label}</span> <b>{badge.count}</b>
                </span>
               )
              }
              if (column.key === "category") {
               const presentation = getVtSyncCategoryBadgePresentation(
                badge.value,
               )
               return (
                <span
                 key={badge.value}
                 className="vt-sync-category-badges"
                 style={
                  {
                   "--vt-badge-stroke": presentation.colors.stroke,
                   "--vt-badge-fill": presentation.colors.fill,
                  } as CssVars
                 }>
                 <span className="vt-sync-category-badge">
                  <span>{presentation.label}</span>
                 </span>
                </span>
               )
              }
              const colors = getVtSyncAlphabeticSpectrumColors(
               badge.value,
               spectrumBadgeLibrary,
              )
              return (
               <span
                key={badge.value}
                className="vt-sync-spectrum-badge"
                style={
                 {
                  "--vt-badge-stroke": colors.stroke,
                  "--vt-badge-fill": colors.fill,
                 } as CssVars
                }>
                <span>{badge.value}</span>
               </span>
              )
             })}
            </div>
           : column.key === "videoUrl" ?
            <span className="vt-sync-url-buttons">
             <button
              type="button"
              title="Copy URL"
              aria-label="Copy channel URL"
              onClick={(event) => {
               event.stopPropagation()
               void navigator.clipboard?.writeText("https://www.youtube.com/")
              }}>
              <Copy />
             </button>
             <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noreferrer"
              title="Open channel"
              aria-label="Open channel"
              onClick={(event) => event.stopPropagation()}>
              <ExternalLink />
             </a>
            </span>
           : total.imageUrl ?
            <img src={total.imageUrl} alt="Channel thumbnail" />
           : <strong>
             {totalClock.isNegative && "-"}
             {totalClock.prefix && (
              <span className="vt-sync-zero-seconds">{totalClock.prefix}</span>
             )}
             {totalClock.value}
             {totalClock.suffix && (
              <span className="vt-sync-zero-seconds">{totalClock.suffix}</span>
             )}
            </strong>
           }
           {total.secondary && !total.badges?.length && (
            <small>{total.secondary}</small>
           )}
          </th>
         )
        })}
       </tr>
      )}
     <tr className="vt-sync-column-row">
      {renderColumns.map(({ column, group, isCollapsed, color }) => {
       const width = isCollapsed ? 40 : columnWidth(column)
       if (isCollapsed)
        return (
         <th
          className="is-collapsed"
          key={`${group.id}-${column.key}`}
          style={{
           "--vt-header-color": group.color,
           background: group.color,
           width,
           minWidth: width,
           maxWidth: width,
          } as CssVars}>
          <span className="vt-sync-collapsed-group-label">
           {COLLAPSED_GROUP_DISPLAY_LABELS[group.label] || group.label}
          </span>
         </th>
        )
       const demographicHeader =
        table.id === "demographics" && column.key === "viewerPercentage" ?
         "Age Total"
        : undefined
       const [first, second] = splitHeader(
        demographicHeader || getColumnDisplayLabel(table.id, column),
       )
       const source =
        dragKey ?
         orderedColumns.find((candidate) => candidate.key === dragKey)
        : undefined
       const acceptsDrop = !source || source.group === column.group
       const sortActive =
        sort.key === column.key ||
        isVtSyncCompositeSortActive(table.id, column.key, sort)
       return (
        <th
         key={`${group.id}-${column.key}`}
         title={column.availabilityNote}
         data-column-key={column.key}
         data-group-start={tableGeometry.useGroups ? undefined : "true"}
         style={
          {
           "--vt-header-color": color,
           width,
           minWidth: width,
           maxWidth: width,
          } as CssVars
         }
         draggable
         aria-grabbed={dragKey === column.key}
         aria-sort={
          sortActive ?
           sort.direction === "desc" ?
            "descending"
           : "ascending"
          : "none"
         }
         className={`${dragKey === column.key ? "is-dragging" : ""} ${dragOverKey === column.key ? "is-drag-over" : ""}`}
         onDragStart={(event) => startColumnDrag(event, column, color)}
         onDragEnd={() => {
          setDragKey(null)
          setDragOverKey(null)
          hideDragRect()
         }}
         onDragOver={(event) => {
          if (!acceptsDrop) return
          event.preventDefault()
          event.dataTransfer.dropEffect = "move"
          setDragOverKey(column.key)
          updateDragRect(event.currentTarget)
         }}
         onDragLeave={() => {
          if (dragOverKey === column.key) setDragOverKey(null)
         }}
         onDrop={(event) => {
          event.preventDefault()
          if (dragKey && acceptsDrop) reorderColumn(dragKey, column.key)
          setDragKey(null)
          setDragOverKey(null)
          hideDragRect()
         }}
         onKeyDown={(event) => {
          if (event.altKey && event.key === "ArrowLeft") {
           event.preventDefault()
           moveColumn(column.key, -1)
          } else if (event.altKey && event.key === "ArrowRight") {
           event.preventDefault()
           moveColumn(column.key, 1)
          }
         }}
         onClick={() => sortColumn(column)}
         tabIndex={0}>
         <span>
          {first}
          {second && (
           <>
            <br />
            {second}
           </>
          )}
         </span>
         <b className="vt-sync-sort-arrow">
          {sortActive ?
           sort.direction === "desc" ?
            "↓"
           : "↑"
          : ""}
          {sortActive &&
           (() => {
            const label = getVtSyncCompositeSortLabel(
             table.id,
             column.key,
             sort,
            )
            return label ?
              <small className="vt-sync-sort-label">{label}</small>
             : null
           })()}
         </b>
         <i
          className="vt-sync-resize"
          onPointerDown={(event) => {
           event.preventDefault()
           event.stopPropagation()
           event.currentTarget.setPointerCapture(event.pointerId)
           document.body.style.userSelect = "none"
           resizeRef.current = {
            key: widthKey(column),
            start: event.clientX,
            width: columnWidth(column),
            pointerId: event.pointerId,
            target: event.currentTarget,
           }
          }}
         />
        </th>
       )
      })}
     </tr>
     {filterRows && (
      <tr className="vt-sync-filter-row">
       {renderColumns.map(({ column, group, isCollapsed }) => {
        const width = isCollapsed ? 40 : columnWidth(column)
        const filterKey = getVtSyncColumnStateKey(table.id, column.key)
        return isCollapsed ?
          <th
           className="is-collapsed"
           key={`${group.id}-${column.key}`}
           style={{ width, minWidth: width, maxWidth: width }}
          />
         : <th
           key={`${group.id}-${column.key}`}
           style={{ width, minWidth: width, maxWidth: width }}>
           <input
            type="search"
            placeholder="Filter"
            aria-label={`Filter ${column.label}`}
            value={columnFilters[filterKey] || ""}
            onChange={(event) =>
             setColumnFilters((current) => ({
              ...current,
              [filterKey]: event.target.value,
             }))
            }
           />
          </th>
       })}
      </tr>
     )}
    </thead>
    <tbody>
     {renderedRows.map((row, index) => {
      const rowKey = String(
       row.videoId ?? row.id ?? row.date ?? row.term ?? index,
      )
      const selectedRow = rowKey === selectedKey
      return (
       <tr
        key={`${rowKey}-${index}`}
        className={`${zebra && index % 2 ? "is-zebra" : ""} ${selectedRow ? "is-selected" : ""} ${formatRows && row.format ? `format-${String(row.format).toLowerCase()}` : ""}`}
        onClick={() => setSelectedKey(rowKey)}>
        {renderColumns.map(({ column, group, isCollapsed, color }) => {
         const width = isCollapsed ? 40 : columnWidth(column)
         if (isCollapsed) {
          if (group.label === "Format") {
           const raw = row[column.key]
           if (isMissingVtSyncValue(raw))
            return (
             <td
              className="is-collapsed"
              key={`${group.id}-${column.key}`}
              style={{ width, minWidth: width, maxWidth: width }}
             />
            )
           const presentation = getVtSyncFormatBadgePresentation(raw, row)
           return (
            <td
             className="is-collapsed"
             key={`${group.id}-${column.key}`}
             style={{ width, minWidth: width, maxWidth: width }}>
             <span className={`vt-sync-collapsed-format-badge ${presentation.badgeClass}`}>
              {presentation.collapsedLabel}
             </span>
            </td>
           )
          }
          return (
           <td
            className="is-collapsed"
            key={`${group.id}-${column.key}`}
            style={{ width, minWidth: width, maxWidth: width }}
           />
          )
         }
         const raw = row[column.key]
         const text = formatVtSyncColumnValue(row, column)
         const clockText = splitVtSyncSpecialCharacters(text, column.key)
         const badgeValues =
          (
           table.id === "videos" &&
           (column.key === "tags" || column.key === "topics")
          ) ?
           getVtSyncBadgeValues(raw)
          : []
         const apiValuePresentation = getVtSyncApiValuePresentation(
          table.id,
          column.key,
          raw,
         )
         const visualizesMetrics =
          column.visualization !== "none" && column.semanticRole !== "identity"
         const numericValue = numericColumnValue(row, column)
         const rank =
          visualizesMetrics ?
           (table.id === "demographics" && column.format === "percent" ?
            getVtSyncAbsolutePercentRatio(numericValue)
           : getVtSyncNumericRank(numericValue, numericSorted[column.key])) *
           100
          : 0
         const { style, className: heatmapClassName } = cellStyle(
          row,
          column,
          color,
         )
         const titleLayout =
          table.id === "videos" && column.key === "title" ?
           getVtSyncVideoTitleLayout(
            text,
            effectiveCompact,
            measureVideoTitle?.(text),
            Math.max(40, width - 38),
           )
          : undefined
         const tableTextStyle: React.CSSProperties | undefined =
          column.textSize ?
           {
            fontSize: `${column.textSize}px`,
            WebkitLineClamp:
             table.id === "playlists" && column.key === "title" ? 2 : 1,
           }
          : undefined
         const cellFill = cellFillEnabled ? style.backgroundImage : undefined
         const cellFillTextColor =
          color === "#FFDA47" || color === "#3FEE56" ? "#0a0a0a" : "#ffffff"
         const demographicTint =
          table.id === "demographics" ?
           `${color}${index % 2 ? "24" : "3D"}`
          : undefined
         return (
          <td
           key={`${rowKey}-${column.key}`}
           data-column-key={column.key}
           data-format={column.format}
           title={column.availabilityNote}
           aria-label={
            column.availabilityNote && isMissingVtSyncValue(raw) ?
             `${column.label}: unavailable. ${column.availabilityNote}`
            : undefined
           }
           className={`is-${column.semanticRole || "numeric"} ${tableGeometry.mode === "sparse" ? "is-sparse-cell" : ""} ${cellFill ? "is-filled-cell" : ""} ${heatmapClassName || ""}`}
           style={{
            ...style,
            width,
            minWidth: width,
            maxWidth: width,
            backgroundColor:
             table.id === "demographics" ? demographicTint
             : heatmapEnabled ? style.backgroundColor
             : (demographicTint ??
              (tableGeometry.mode === "sparse" ? `${color}11` : undefined)),
            color:
             cellFill && !effectiveCompact && cellFillTextColor ?
              cellFillTextColor
             : undefined,
           }}>
           {table.id === "videos" && column.key === "title" ?
            <VideoIdentityCell
             row={row}
             title={text}
             titleLayout={titleLayout}
            />
           : (table.id === "suggested" || trafficDetailFamily === "video") && column.key === "title" ?
            <VideoIdentityCell
             row={row}
             title={text}
             titleLayout={titleLayout}
            />
           : trafficDetailFamily === "video" && column.key === "sourceChannel" ?
            <TrafficSourceChannelCell row={row} />
           : (table.id === "chan_page" || trafficDetailFamily === "channel") && column.key === "title" ?
            <ChannelIdentityCell
             row={row}
             title={text}
             titleLayout={titleLayout}
            />
           : (table.id === "playlists" || trafficDetailFamily === "playlist") && column.key === "title" ?
            <PlaylistIdentityCell
             row={row}
             title={text}
             titleLayout={titleLayout}
            />
           : table.id === "videos" && column.key === "publishedAt" ?
            <PublishedMomentCell row={row} />
           : table.id === "demographics" && column.key === "ageGroupLabel" ?
            <DemographicAgeCell row={row} text={text} />
           : (
            table.mainCategoryId === "demographics" && column.key === "cohort"
           ) ?
            <DemographicCohortCell row={row} text={text} />
           : column.format === "thumbnail" && !isMissingVtSyncValue(raw) ?
            <img className="vt-sync-thumbnail" src={String(raw)} alt="" />
           : column.format === "flag" && !isMissingVtSyncValue(raw) ?
            <span
             className="vt-sync-flag-thumbnail"
             role="img"
             aria-label={`${String(row.countryName || row.countryCode || "Region")} flag`}>
             <span className={`fi fi-${text}`} aria-hidden="true" />
            </span>
           : (column.key === "videoUrl" || column.key === "playlistUrl" || column.key === "channelUrl") && !isMissingVtSyncValue(raw) ?
            <span className="vt-sync-url-buttons">
             <button
              type="button"
              title={
               column.key === "videoUrl" ? "Copy video URL"
               : column.key === "playlistUrl" ? "Copy playlist URL"
               : "Copy channel URL"
              }
              aria-label={
               column.key === "videoUrl" ? "Copy video URL"
               : column.key === "playlistUrl" ? "Copy playlist URL"
               : "Copy channel URL"
              }
              onClick={(event) => {
               event.stopPropagation()
               void navigator.clipboard?.writeText(String(raw))
              }}>
              <Copy />
             </button>
             <a
              href={String(raw)}
              target="_blank"
              rel="noreferrer"
              title={
               column.key === "videoUrl" ? "Open video"
               : column.key === "playlistUrl" ? "Open playlist"
               : "Open channel"
              }
              aria-label={
               column.key === "videoUrl" ? "Open video"
               : column.key === "playlistUrl" ? "Open playlist"
               : "Open channel"
              }
              onClick={(event) => event.stopPropagation()}>
              <ExternalLink />
             </a>
            </span>
            : (column.key === "format" || (table.id === "creator" && column.key === "term")) ? (
             <VtSyncFormatCellBadge raw={raw} row={row} />
            )
           : column.key === "privacyStatus" && !isMissingVtSyncValue(raw) ?
            <span
             className={`vt-sync-privacy-badge is-${String(raw).toLowerCase()}`}>
             {text}
            </span>
           : (
            table.id === "videos" &&
            column.key === "category" &&
            !isMissingVtSyncValue(raw)
           ) ?
            <CategoryBadge value={raw} />
           : badgeValues.length ?
            <SpectrumBadgeList
             values={badgeValues}
             library={spectrumBadgeLibrary}
             kind={column.key as "tags" | "topics"}
            />
           : table.id === "traffic" && column.key === "source" && !isMissingVtSyncValue(raw) ?
            renderTrafficSourceBadge(
             apiValuePresentation?.title || String(text || raw),
             apiValuePresentation?.apiValue || String(raw),
            )
           : (
            table.id === "monthly" &&
            column.key === "date" &&
           !isMissingVtSyncValue(raw)
           ) ?
            renderMonthBadge(raw)
           : apiValuePresentation ?
            <span className="vt-sync-api-value">
             <strong>{apiValuePresentation.title}</strong>
             <small>{apiValuePresentation.apiValue}</small>
            </span>
           : <span
             className={`vt-sync-cell-text ${titleLayout ? "is-video-title" : ""} ${tableTextStyle ? "is-table-sized-text" : ""}`}
             style={
              titleLayout ?
               {
                fontSize: `${titleLayout.fontSize}px`,
                WebkitLineClamp: titleLayout.lineCount,
               }
              : tableTextStyle
             }>
             {clockText.isNegative && "-"}
             {clockText.prefix && (
              <span className="vt-sync-zero-seconds">{clockText.prefix}</span>
             )}
             {clockText.value}
             {clockText.suffix && (
              <span className="vt-sync-zero-seconds">{clockText.suffix}</span>
             )}
            </span>
           }
           {sparklinesEnabled &&
            visualizesMetrics &&
            rank > 0 &&
            column.format !== "thumbnail" &&
            column.format !== "flag" && (
             <span
              className={`vt-sync-spark color-${sparkColorMode} shape-${sparkShape} ${sparkOpposite ? "is-opposite" : ""} ${sparkStroke ? "" : "no-stroke"}`}>
              <i
               style={getVtSyncSparkFillStyle(
                rank / 100,
                sparkColorMode === "spectrum" ?
                 getVtSyncSparkGradient(sparkOpposite)
                : getVtSyncSparkColor(
                  color,
                  rank / 100,
                  sparkColorMode,
                  sparkOpposite,
                 ),
                sparkColorMode,
               )}
              />
             </span>
            )}
          </td>
         )
        })}
       </tr>
      )
     })}
     {remainingRowSpacerHeight > 0 && (
      <tr
       className="vt-sync-row-spacer"
       data-vt-row-spacer="true"
       aria-hidden="true">
       <td
        colSpan={Math.max(1, renderColumns.length)}
        style={
         {
          "--vt-row-spacer-height": `${remainingRowSpacerHeight}px`,
         } as CssVars
        }
       />
      </tr>
     )}
    </tbody>
   </table>
  )
 }

 const renderDemographicMetric = (
  value: number | undefined,
  color: string,
  emphasis = false,
 ) => (
  <div
   className={`vt-sync-demographic-metric${emphasis ? " is-emphasis" : ""}`}
   style={{ "--vt-demographic-color": color } as CssVars}>
   <strong>{formatDemographicPercentage(value)}</strong>
   <span aria-hidden="true">
    <i style={{ width: `${getVtSyncAbsolutePercentRatio(value) * 100}%` }} />
   </span>
  </div>
 )
 const renderDeviceOsRowPercent = (
  value: number | undefined,
  color: string,
 ) => (
  <div
   className="vt-sync-device-os-row-pct"
   style={{ "--vt-demographic-color": color } as CssVars}>
   <strong>{formatDemographicPercentage(value)}</strong>
   <span aria-hidden="true">
    <i style={{ width: `${getVtSyncAbsolutePercentRatio(value) * 100}%` }} />
   </span>
  </div>
 )

 const renderDemographicTable = () => {
  if (!demographicSummary) return null
  const metricColumns = [
   {
    key: "maleViewerPercentage",
    label: "Male",
    color: VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS.maleViewerPercentage,
   },
   {
    key: "femaleViewerPercentage",
    label: "Female",
    color: VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS.femaleViewerPercentage,
   },
   {
    key: "otherViewerPercentage",
    label: "Other",
    color: VT_SYNC_DEMOGRAPHIC_COLUMN_COLORS.otherViewerPercentage,
   },
  ] as const
  const columnByKey = new Map(
   orderedColumns.map((column) => [column.key, column]),
  )

  return (
   <div className="vt-sync-demographic-board-viewport">
    <section
     className="vt-sync-demographic-board"
     aria-label="Audience demographics overview">
     <section
      className="vt-sync-demographic-section is-gender"
      aria-labelledby="vt-sync-gender-totals">
      <header id="vt-sync-gender-totals">Gender Totals</header>
      <div className="vt-sync-demographic-subhead">All age groups</div>
      <div className="vt-sync-demographic-gender-stack">
       {demographicSummary.genderTotals.map((item) => (
        <article
         key={item.key}
         style={{ "--vt-demographic-color": item.color } as CssVars}>
         <header>{item.label}</header>
         {renderDemographicMetric(item.value, item.color, true)}
        </article>
       ))}
      </div>
     </section>
     <section
      className="vt-sync-demographic-section is-age"
      aria-labelledby="vt-sync-age-groups">
      <header id="vt-sync-age-groups">Age Groups</header>
      <div className="vt-sync-demographic-subhead">All genders</div>
      <div className="vt-sync-demographic-age-stack">
       {renderedRows.map((row) => {
        const ageLabel = String(
         row.ageGroupLabel || row.ageGroup || "Age group",
        )
        const [ageWord, ...rangeParts] = ageLabel.split(" ")
        const ageRange = rangeParts.join(" ")
        return (
         <article key={String(row.ageGroup || row.ageGroupLabel)}>
          {renderDemographicMetric(
           toVtSyncNumber(row.viewerPercentage),
           "#3FEE56",
          )}
          <div className="vt-sync-demographic-age-label">
           <strong>{ageWord}</strong>
           <span>{ageRange || ageWord}</span>
          </div>
         </article>
        )
       })}
      </div>
     </section>
     <section
      className="vt-sync-demographic-section is-matrix"
      aria-labelledby="vt-sync-age-gender-matrix">
      <header id="vt-sync-age-gender-matrix">Age × Gender</header>
      <div className="vt-sync-demographic-matrix-head">
       {metricColumns.map((metric) => {
        const column = columnByKey.get(metric.key)
        const active = sort.key === metric.key
        return (
         <button
          key={metric.key}
          type="button"
          style={{ "--vt-demographic-color": metric.color } as CssVars}
          onClick={() => column && sortColumn(column)}
          aria-label={`Sort by ${metric.label}`}
          aria-pressed={active}>
          {metric.label}
          <span aria-hidden="true">
           {active ?
            sort.direction === "desc" ?
             "↓"
            : "↑"
           : ""}
          </span>
         </button>
        )
       })}
      </div>
      <div className="vt-sync-demographic-matrix-body">
       {renderedRows.map((row) => (
        <div
         className="vt-sync-demographic-matrix-row"
         key={String(row.ageGroup || row.ageGroupLabel)}>
         {metricColumns.map((metric) => (
          <div
           className="vt-sync-demographic-matrix-cell"
           key={metric.key}
           style={{ "--vt-demographic-color": metric.color } as CssVars}>
           {renderDemographicMetric(
            toVtSyncNumber(row[metric.key]),
            metric.color,
           )}
          </div>
         ))}
        </div>
       ))}
      </div>
     </section>
    </section>
   </div>
  )
 }

 const renderDeviceOsCell = (
  row: VtSyncTableRow,
  column: VtSyncTableColumnDefinition,
  keyPrefix: string,
 ) => {
  const text = formatVtSyncColumnValue(row, column)
  const clockText = splitVtSyncSpecialCharacters(text, column.key)
  return (
   <td
    key={`${keyPrefix}-${column.key}`}
    data-column-key={column.key}
    data-format={column.format}>
    <span className="vt-sync-traffic-day-value">
     {clockText.isNegative && "-"}
     {clockText.prefix && (
      <span className="vt-sync-zero-seconds">{clockText.prefix}</span>
     )}
     {clockText.value}
     {clockText.suffix && (
      <span className="vt-sync-zero-seconds">{clockText.suffix}</span>
     )}
    </span>
   </td>
  )
 }

 const renderDeviceOsTable = () => {
  if (!deviceOsSummary) return null
  const boardStyle: CssVars = {
   width: "100%",
   minWidth: 0,
   gridTemplateColumns: "20% 80%",
  }
  const visibleDeviceOsGroups = sortedDeviceOsGroups.slice(0, rowLimit)
  const osStatsByKey = new Map(deviceOsSummary.osList.map((os) => [os.key, os]))
  const sortDeviceOsColumn = (column?: VtSyncTableColumnDefinition) => {
   if (column) sortColumn(column)
  }
  const deviceOsHeaderKeyDown = (
   event: React.KeyboardEvent<HTMLTableCellElement>,
   column?: VtSyncTableColumnDefinition,
  ) => {
   if (event.key !== "Enter" && event.key !== " ") return
   event.preventDefault()
   sortDeviceOsColumn(column)
  }
  const deviceOsSortArrow = (key: string) =>
   sort.key === key ?
    <b className="vt-sync-traffic-sort-arrow">
     {sort.direction === "desc" ? "↓" : "↑"}
    </b>
   : null

  return (
   <div className="vt-sync-demographic-board-viewport">
    <section
     className="vt-sync-demographic-board"
     style={boardStyle}
     aria-label="Device and operating system overview">
     <section
      className="vt-sync-demographic-section"
      aria-labelledby="vt-sync-device-totals">
      <header id="vt-sync-device-totals" style={{ backgroundColor: "#3FEE56" }}>
       Devices
      </header>
      <div className="vt-sync-demographic-subhead">All operating systems</div>
      <div
       className="vt-sync-demographic-gender-stack vt-sync-device-total-stack"
       style={
        {
         gridTemplateRows: `repeat(${deviceOsSummary.deviceList.length || 1}, minmax(0, 1fr))`,
        } as CssVars
       }>
       {deviceOsSummary.deviceList.map((device) => (
        <article
         key={device.key}
         title={device.label}
         style={{ "--vt-demographic-color": device.color } as CssVars}>
         <header>{device.label}</header>
         {renderDemographicMetric(device.pct, device.color, true)}
        </article>
       ))}
      </div>
     </section>
     <section
      className="vt-sync-demographic-section is-matrix"
      aria-labelledby="vt-sync-os-totals">
      <header id="vt-sync-os-totals" style={{ backgroundColor: "#36E0F6" }}>
       Operating Systems
      </header>
      <div className="vt-sync-traffic-day-viewport" style={{ maxHeight: 480 }}>
       <table
        className="vt-sync-traffic-day-table vt-sync-device-os-table"
        aria-label="Operating system by device grouped table">
        <thead>
         <tr>
          <th
           className="is-day-source"
           tabIndex={0}
           role="button"
           aria-sort={
            sort.key === "operatingSystem" ?
             sort.direction === "desc" ?
              "descending"
             : "ascending"
            : "none"
           }
           onClick={() =>
            sortDeviceOsColumn({
             key: "operatingSystem",
            } as VtSyncTableColumnDefinition)
           }
           onKeyDown={(event) =>
            deviceOsHeaderKeyDown(event, {
             key: "operatingSystem",
            } as VtSyncTableColumnDefinition)
           }>
           OS / Device{deviceOsSortArrow("operatingSystem")}
          </th>
          {deviceOsDisplayColumns.map((column, index) => {
           const [first, second] = splitHeader(
            getColumnDisplayLabel(table.id, column),
           )
           return (
            <th
             key={column.key}
             tabIndex={0}
             role="button"
             aria-sort={
              sort.key === column.key ?
               sort.direction === "desc" ?
                "descending"
               : "ascending"
              : "none"
             }
             style={
              {
               "--vt-header-color":
                GROUP_COLORS[(index + 1) % GROUP_COLORS.length],
              } as CssVars
             }
             onClick={() => sortDeviceOsColumn(column)}
             onKeyDown={(event) => deviceOsHeaderKeyDown(event, column)}>
             <span>
              {first}
              {second && (
               <>
                <br />
                {second}
               </>
              )}
             </span>
             {deviceOsSortArrow(column.key)}
            </th>
           )
          })}
         </tr>
        </thead>
        <tbody>
         {visibleDeviceOsGroups.map((group) => {
          const expanded = expandedDeviceOsGroups.has(group.id)
          const osStat = osStatsByKey.get(group.id)
          return (
           <React.Fragment key={group.id}>
            <tr
             className="vt-sync-traffic-day-parent"
             aria-expanded={expanded}
             tabIndex={0}
             onClick={() => toggleDeviceOsGroup(group.id)}
             onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
               event.preventDefault()
               toggleDeviceOsGroup(group.id)
              }
             }}>
             <td className="is-day-source">
              <span className="vt-sync-traffic-day-toggle" aria-hidden="true">
               {expanded ?
                <ChevronDown />
               : <ChevronRight />}
              </span>
              {renderDeviceOsRowPercent(
               osStat?.pct,
               osStat?.color ?? "#36E0F6",
              )}
              <strong>{group.osLabel}</strong>
              <small>{group.devices.length} devices</small>
             </td>
             {deviceOsDisplayColumns.map((column) =>
              renderDeviceOsCell(group.totals, column, group.id),
             )}
            </tr>
            {expanded &&
             group.devices.map((device) => (
              <tr className="vt-sync-traffic-day-child" key={device.id}>
               <td className="is-day-source">{device.deviceLabel}</td>
               {deviceOsDisplayColumns.map((column) =>
                renderDeviceOsCell(device.row, column, device.id),
               )}
              </tr>
             ))}
           </React.Fragment>
          )
         })}
        </tbody>
       </table>
      </div>
     </section>
    </section>
   </div>
  )
 }

 const trafficDayDisplayColumns = useMemo(() => {
  const keys = [
   "views",
   "engagedViews",
   "trafficViewShare",
   "watchTime",
   "trafficWatchTimeShare",
   "avgDuration",
   "avgPercentageViewed",
  ]
  const byKey = new Map(orderedColumns.map((column) => [column.key, column]))
  return keys
   .map((key) => byKey.get(key))
   .filter(Boolean) as VtSyncTableColumnDefinition[]
 }, [orderedColumns])
 const trafficDayNumericSorted = useMemo(() => {
  const metricRows = sortedTrafficDayGroups.flatMap((group) => [
   group.totals,
   ...group.sources.map((source) => source.row),
  ])
  return Object.fromEntries(
   trafficDayDisplayColumns.map((column) => [
    column.key,
    getVtSyncColumnSortedValues(metricRows, column),
   ]),
  )
 }, [sortedTrafficDayGroups, trafficDayDisplayColumns])
 const trafficDayRankByGroup = useMemo(() => {
  const totalDays = sortedTrafficDayGroups.length
  const rankBy = (metricKey: "views" | "watchTime") => {
   const ordered = [...sortedTrafficDayGroups].sort((left, right) => (toVtSyncNumber(right.totals[metricKey]) ?? 0) - (toVtSyncNumber(left.totals[metricKey]) ?? 0))
   return new Map(ordered.map((group, index) => [group.id, index + 1]))
  }
  const viewRanks = rankBy("views")
  const watchRanks = rankBy("watchTime")
 return new Map(
   sortedTrafficDayGroups.map((group) => [
    group.id,
    { viewRank: viewRanks.get(group.id), watchRank: watchRanks.get(group.id), totalDays },
   ]),
  )
 }, [sortedTrafficDayGroups])
 const formatSubscriberDisplayColumns = useMemo(() => {
  const keys = [
   "views",
   "engagedViews",
   "watchTime",
   "avgDuration",
   "avgPercentageViewed",
   "youtubePremiumViews",
   "youtubePremiumWatchTime",
   "channelViewShare",
   "channelWatchTimeShare",
   "channelPremiumViewShare",
   "channelPremiumWatchTimeShare",
  ]
  const byKey = new Map(orderedColumns.map((column) => [column.key, column]))
  return keys
   .map((key) => byKey.get(key))
   .filter(Boolean) as VtSyncTableColumnDefinition[]
 }, [orderedColumns])
 const formatSubscriberNumericSorted = useMemo(() => {
  const metricRows = sortedFormatSubscriberGroups.flatMap((group) => [
   group.totals,
   ...group.statuses.map((status) => status.row),
  ])
  return Object.fromEntries(
   formatSubscriberDisplayColumns.map((column) => [
    column.key,
    getVtSyncColumnSortedValues(metricRows, column),
   ]),
  )
 }, [formatSubscriberDisplayColumns, sortedFormatSubscriberGroups])
 const retentionDisplayColumns = useMemo(() => {
  const keys = ["audienceWatchRatio", "relativeRetentionPerformance"]
  const byKey = new Map(orderedColumns.map((column) => [column.key, column]))
  return keys
   .map((key) => byKey.get(key))
   .filter(Boolean) as VtSyncTableColumnDefinition[]
 }, [orderedColumns])
 const retentionNumericSorted = useMemo(() => {
  const metricRows = sortedRetentionVideoGroups.flatMap((group) => [
   group.summary,
   ...group.points.map((point) => point.row),
  ])
  return Object.fromEntries(
   retentionDisplayColumns.map((column) => [
    column.key,
    getVtSyncColumnSortedValues(metricRows, column),
   ]),
  )
 }, [retentionDisplayColumns, sortedRetentionVideoGroups])
 const toggleTrafficDay = (groupId: string, anchor?: HTMLElement) => {
  if (anchor)
   pendingTrafficDayAnchorRef.current = {
    groupId,
    viewportTop: anchor.getBoundingClientRect().top,
   }
  setExpandedTrafficDays((current) => {
   const next = new Set(current)
   if (next.has(groupId)) next.delete(groupId)
   else next.add(groupId)
   return next
  })
 }

 const toggleRetentionVideo = (groupId: string, anchor?: HTMLElement) => {
  if (anchor)
   pendingRetentionAnchorRef.current = {
    groupId,
    viewportTop: anchor.getBoundingClientRect().top,
   }
  setExpandedRetentionVideos((current) => {
   const next = new Set(current)
   if (next.has(groupId)) next.delete(groupId)
   else next.add(groupId)
   return next
  })
 }

 const renderTrafficDayMetricCell = (
  row: VtSyncTableRow,
  column: VtSyncTableColumnDefinition,
  opts: {
   group?: VtSyncTrafficDayGroup
   parentGroup?: VtSyncTrafficDayGroup
  } = {},
 ) => {
  const { group, parentGroup } = opts
  // Child rows: rewrite the % of Daily columns so every source in a day sums to 100% of that day.
  let effectiveRow = row
  if (
   parentGroup &&
   (column.key === "trafficViewShare" || column.key === "trafficWatchTimeShare")
  ) {
   const parentMetricKey =
    column.key === "trafficViewShare" ? "views" : "watchTime"
   const parentTotal = toVtSyncNumber(parentGroup.totals[parentMetricKey])
   const childValue = toVtSyncNumber(row[parentMetricKey])
   if (
    parentTotal !== undefined &&
    parentTotal > 0 &&
    childValue !== undefined
   ) {
    effectiveRow = { ...row, [column.key]: (childValue / parentTotal) * 100 }
   }
  }
  const text = formatVtSyncColumnValue(effectiveRow, column)
  const clockText = splitVtSyncSpecialCharacters(text, column.key)
  const columnIndex = trafficDayDisplayColumns.findIndex(
   (candidate) => candidate.key === column.key,
  )
  const color = GROUP_COLORS[(columnIndex + 1) % GROUP_COLORS.length]
  const value = numericColumnValue(effectiveRow, column)
  const rank = getVtSyncNumericRank(value, trafficDayNumericSorted[column.key])
  const colorRgb = (source: string) =>
   source
    .replace("#", "")
    .match(/.{2}/g)
    ?.map((part) => Number.parseInt(part, 16)) || [64, 198, 233]
  const heatColor = heatmapInverted ? getVtSyncOppositeColor(color) : color
  const fillColor = cellFillInverted ? getVtSyncOppositeColor(color) : color
  const cellStyle: CssVars = {
   "--vt-traffic-cell": color,
   backgroundColor:
    heatmapEnabled && rank > 0 ?
     `rgba(${colorRgb(heatColor).join(",")},${0.16 + rank * 0.68})`
    : undefined,
   backgroundImage:
    cellFillEnabled && rank > 0 ?
     `linear-gradient(90deg, rgba(${colorRgb(fillColor).join(",")},.58) ${Math.round(rank * 100)}%, transparent ${Math.round(rank * 100)}%)`
    : undefined,
  }
  // Parent rows only: day-vs-all-days rank badge for views and watch time.
  const rankInfo = group ? trafficDayRankByGroup.get(group.id) : undefined
  const dayRank =
   rankInfo &&
   (column.key === "views" ? rankInfo.viewRank
   : column.key === "watchTime" ? rankInfo.watchRank
   : undefined)
  const rankBadge =
   dayRank !== undefined && rankInfo ?
    <span
     className="vt-sync-day-rank-badge"
     aria-label={`Day rank ${dayRank} of ${rankInfo.totalDays}`}>
     {dayRank}/{rankInfo.totalDays}
    </span>
   : null
  return (
   <td
    key={`${group?.id || String(row.day)}-${column.key}`}
    data-column-key={column.key}
    data-format={column.format}
    className={`${heatmapEnabled && rank > 0 ? "has-heatmap" : ""} ${cellFillEnabled && rank > 0 ? "is-filled-cell" : ""}`}
    style={cellStyle}>
    <span className="vt-sync-traffic-day-value">
     {clockText.isNegative && "-"}
     {clockText.prefix && (
      <span className="vt-sync-zero-seconds">{clockText.prefix}</span>
     )}
     {clockText.value}
     {clockText.suffix && (
      <span className="vt-sync-zero-seconds">{clockText.suffix}</span>
     )}
     {rankBadge}
    </span>
    {sparklinesEnabled && rank > 0 && (
     <span
      className={`vt-sync-spark color-${sparkColorMode} shape-${sparkShape} ${sparkOpposite ? "is-opposite" : ""} ${sparkStroke ? "" : "no-stroke"}`}>
      <i
       style={getVtSyncSparkFillStyle(
        rank,
        sparkColorMode === "spectrum" ?
         getVtSyncSparkGradient(sparkOpposite)
        : getVtSyncSparkColor(color, rank, sparkColorMode, sparkOpposite),
        sparkColorMode,
       )}
      />
     </span>
    )}
   </td>
  )
 }

 const renderTrafficSourceBadge = (label: string, apiValue: string) => {
  const colors =
   trafficSourceBadgeColors.get(apiValue.toLocaleUpperCase()) ||
   getVtSyncAlphabeticSpectrumColors(label)
  return (
   <span
    className="vt-sync-traffic-source-badge"
    title={`${label} · ${apiValue}`}
    style={
     {
      "--vt-badge-stroke": colors.stroke,
      "--vt-badge-fill": colors.fill,
     } as CssVars
    }>
    {label}
   </span>
  )
 }

 const renderFormatSubscriberMetricCell = (
  row: VtSyncTableRow,
  column: VtSyncTableColumnDefinition,
  group?: VtSyncFormatSubscriberGroup,
 ) => {
  const text = formatVtSyncColumnValue(row, column)
  const clockText = splitVtSyncSpecialCharacters(text, column.key)
  const columnIndex = formatSubscriberDisplayColumns.findIndex(
   (candidate) => candidate.key === column.key,
  )
  const color = GROUP_COLORS[(columnIndex + 1) % GROUP_COLORS.length]
  const value = numericColumnValue(row, column)
  const rank = getVtSyncNumericRank(value, formatSubscriberNumericSorted[column.key])
  const colorRgb = (source: string) =>
   source
    .replace("#", "")
    .match(/.{2}/g)
    ?.map((part) => Number.parseInt(part, 16)) || [64, 198, 233]
  const heatColor = heatmapInverted ? getVtSyncOppositeColor(color) : color
  const fillColor = cellFillInverted ? getVtSyncOppositeColor(color) : color
  const cellStyle: CssVars = {
   "--vt-traffic-cell": color,
   backgroundColor:
    heatmapEnabled && rank > 0 ?
     `rgba(${colorRgb(heatColor).join(",")},${0.16 + rank * 0.68})`
    : undefined,
   backgroundImage:
    cellFillEnabled && rank > 0 ?
     `linear-gradient(90deg, rgba(${colorRgb(fillColor).join(",")},.58) ${Math.round(rank * 100)}%, transparent ${Math.round(rank * 100)}%)`
    : undefined,
  }
  return (
   <td
    key={`${group?.id || String(row.status)}-${column.key}`}
    data-column-key={column.key}
    data-format={column.format}
    className={`${heatmapEnabled && rank > 0 ? "has-heatmap" : ""} ${cellFillEnabled && rank > 0 ? "is-filled-cell" : ""}`}
    style={cellStyle}>
    <span className="vt-sync-traffic-day-value">
     {clockText.isNegative && "-"}
     {clockText.prefix && (
      <span className="vt-sync-zero-seconds">{clockText.prefix}</span>
     )}
     {clockText.value}
     {clockText.suffix && (
      <span className="vt-sync-zero-seconds">{clockText.suffix}</span>
     )}
    </span>
    {sparklinesEnabled && rank > 0 && (
     <span
      className={`vt-sync-spark color-${sparkColorMode} shape-${sparkShape} ${sparkOpposite ? "is-opposite" : ""} ${sparkStroke ? "" : "no-stroke"}`}>
      <i
       style={getVtSyncSparkFillStyle(
        rank,
        sparkColorMode === "spectrum" ?
         getVtSyncSparkGradient(sparkOpposite)
        : getVtSyncSparkColor(color, rank, sparkColorMode, sparkOpposite),
        sparkColorMode,
       )}
      />
     </span>
    )}
   </td>
  )
 }

 const renderMonthBadge = (value: unknown) => {
  const label = formatVtSyncFullMonthValue(value)
  const colors = getVtSyncOrderedSpectrumColors(label, FULL_MONTH_BADGE_LIBRARY)
  return (
   <span
    className="vt-sync-traffic-source-badge is-month"
    title={`${label} · ${String(value)}`}
    style={
     {
      "--vt-badge-stroke": colors.stroke,
      "--vt-badge-fill": colors.fill,
     } as CssVars
    }>
    {label}
   </span>
  )
 }

 const renderTrafficSourceDayTable = () => {
  const dayColumn = orderedColumns.find((column) => column.key === "day")
  const totalVisibleSourceRows = visibleTrafficDayGroups.reduce(
   (sum, group) =>
    sum + (expandedTrafficDays.has(group.id) ? group.sources.length : 0),
   0,
  )
  const sortTrafficDayColumn = (column?: VtSyncTableColumnDefinition) => {
   if (column) sortColumn(column)
  }
  const trafficDayHeaderKeyDown = (
   event: React.KeyboardEvent<HTMLTableCellElement>,
   column?: VtSyncTableColumnDefinition,
  ) => {
   if (event.key !== "Enter" && event.key !== " ") return
   event.preventDefault()
   sortTrafficDayColumn(column)
  }
  const trafficDaySortArrow = (key: string) =>
   sort.key === key ?
    <b className="vt-sync-traffic-sort-arrow">
     {sort.direction === "desc" ? "↓" : "↑"}
    </b>
   : null
  return (
   <>
    <div className="vt-sync-traffic-day-scroll-shell">
     {shouldRenderVerticalScrollbar && renderVerticalScrollbar()}
     <div
      className="vt-sync-traffic-day-viewport"
      ref={mainScrollRef}
      onScroll={updateScrollState}>
      <table
       className="vt-sync-traffic-day-table"
       aria-label="Traffic source by day grouped table">
       <thead>
        <tr>
         <th
          className="is-day-source"
          tabIndex={0}
          role="button"
          aria-sort={
           sort.key === "day" ?
            sort.direction === "desc" ?
             "descending"
            : "ascending"
           : "none"
          }
          onClick={() => sortTrafficDayColumn(dayColumn)}
          onKeyDown={(event) => trafficDayHeaderKeyDown(event, dayColumn)}>
          Date / Source{trafficDaySortArrow("day")}
         </th>
         {trafficDayDisplayColumns.map((column, index) => {
          const [first, second] = splitHeader(
           getColumnDisplayLabel(table.id, column),
          )
          return (
           <th
            key={column.key}
            tabIndex={0}
            role="button"
            aria-sort={
             sort.key === column.key ?
              sort.direction === "desc" ?
               "descending"
              : "ascending"
             : "none"
            }
            style={
             {
              "--vt-header-color":
               GROUP_COLORS[(index + 1) % GROUP_COLORS.length],
             } as CssVars
            }
            onClick={() => sortTrafficDayColumn(column)}
            onKeyDown={(event) => trafficDayHeaderKeyDown(event, column)}>
            <span>
             {first}
             {second && (
              <>
               <br />
               {second}
              </>
             )}
            </span>
            {trafficDaySortArrow(column.key)}
           </th>
          )
         })}
        </tr>
       </thead>
       <tbody>
        {visibleTrafficDayGroups.map((group) => {
         const expanded = expandedTrafficDays.has(group.id)
         const dayText =
          dayColumn ?
           formatVtSyncColumnValue(group.totals, dayColumn)
          : group.day
         return (
          <React.Fragment key={group.id}>
           <tr
            className="vt-sync-traffic-day-parent"
            data-traffic-day-parent="true"
            data-traffic-day-group-id={group.id}
            aria-expanded={expanded}
            tabIndex={0}
            onClick={(event) => toggleTrafficDay(group.id, event.currentTarget)}
            onKeyDown={(event) => {
             if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              toggleTrafficDay(group.id, event.currentTarget)
             }
            }}>
            <td className="is-day-source">
             <span className="vt-sync-traffic-day-toggle" aria-hidden="true">
              {expanded ?
               <ChevronDown />
              : <ChevronRight />}
             </span>
             <strong>{dayText}</strong>
             <small>{group.sources.length} sources</small>
            </td>
            {trafficDayDisplayColumns.map((column) =>
             renderTrafficDayMetricCell(group.totals, column, { group }),
            )}
           </tr>
           {expanded &&
            group.sources.map((source) => (
             <tr
              className="vt-sync-traffic-day-child"
              data-traffic-day-detail="true"
              key={source.id}>
              <td className="is-day-source">
               {renderTrafficSourceBadge(
                source.sourceLabel,
                source.sourceApiValue,
               )}
              </td>
              {trafficDayDisplayColumns.map((column) =>
               renderTrafficDayMetricCell(source.row, column, {
                parentGroup: group,
               }),
              )}
             </tr>
            ))}
          </React.Fragment>
         )
        })}
       </tbody>
      </table>
     </div>
    </div>
    <div className="vt-sync-traffic-day-counts" role="status">
     <span>{visibleTrafficDayGroups.length.toLocaleString()} visible days</span>
     <span>{totalVisibleSourceRows.toLocaleString()} expanded source rows</span>
     <span>
      {sortedTrafficDayGroups.length.toLocaleString()} total days from{" "}
      {sortedRows.length.toLocaleString()} flat rows
     </span>
    </div>
   </>
  )
 }

 const renderFormatSubscriberTable = () => {
  const formatColumn = orderedColumns.find((column) => column.key === "term")
  const totalVisibleStatusRows = visibleFormatSubscriberGroups.reduce(
   (sum, group) =>
    sum + (expandedTrafficDays.has(group.id) ? group.statuses.length : 0),
   0,
  )
  const sortFormatSubscriberColumn = (column?: VtSyncTableColumnDefinition) => {
   if (column) sortColumn(column)
  }
  const formatSubscriberHeaderKeyDown = (
   event: React.KeyboardEvent<HTMLTableCellElement>,
   column?: VtSyncTableColumnDefinition,
  ) => {
   if (event.key !== "Enter" && event.key !== " ") return
   event.preventDefault()
   sortFormatSubscriberColumn(column)
  }
  const formatSubscriberSortArrow = (key: string) =>
   sort.key === key ?
    <b className="vt-sync-traffic-sort-arrow">
     {sort.direction === "desc" ? "↓" : "↑"}
    </b>
   : null
  return (
   <>
    <div className="vt-sync-traffic-day-scroll-shell">
     {shouldRenderVerticalScrollbar && renderVerticalScrollbar()}
     <div
      className="vt-sync-traffic-day-viewport"
      ref={mainScrollRef}
      onScroll={updateScrollState}>
      <table
       className="vt-sync-traffic-day-table vt-sync-format-subscriber-table"
       aria-label="Formats by subscriber status grouped table">
       <thead>
        <tr>
         <th
          className="is-day-source"
          tabIndex={0}
          role="button"
          aria-sort={
           sort.key === "term" ?
            sort.direction === "desc" ?
             "descending"
            : "ascending"
           : "none"
          }
          onClick={() => sortFormatSubscriberColumn(formatColumn)}
          onKeyDown={(event) => formatSubscriberHeaderKeyDown(event, formatColumn)}>
          Format / Subscriber Status{formatSubscriberSortArrow("term")}
         </th>
         {formatSubscriberDisplayColumns.map((column, index) => {
          const [first, second] = splitHeader(
           getColumnDisplayLabel(table.id, column),
          )
          return (
           <th
            key={column.key}
            tabIndex={0}
            role="button"
            aria-sort={
             sort.key === column.key ?
              sort.direction === "desc" ?
               "descending"
              : "ascending"
             : "none"
            }
            style={
             {
              "--vt-header-color":
               GROUP_COLORS[(index + 1) % GROUP_COLORS.length],
             } as CssVars
            }
            onClick={() => sortFormatSubscriberColumn(column)}
            onKeyDown={(event) => formatSubscriberHeaderKeyDown(event, column)}>
            <span>
             {first}
             {second && (
              <>
               <br />
               {second}
              </>
             )}
            </span>
            {formatSubscriberSortArrow(column.key)}
           </th>
          )
         })}
        </tr>
       </thead>
       <tbody>
        {visibleFormatSubscriberGroups.map((group) => {
         const expanded = expandedTrafficDays.has(group.id)
         return (
          <React.Fragment key={group.id}>
           <tr
            className="vt-sync-traffic-day-parent"
            data-traffic-day-parent="true"
            data-traffic-day-group-id={group.id}
            aria-expanded={expanded}
            tabIndex={0}
            onClick={(event) => toggleTrafficDay(group.id, event.currentTarget)}
            onKeyDown={(event) => {
             if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              toggleTrafficDay(group.id, event.currentTarget)
             }
            }}>
            <td className="is-day-source">
             <span className="vt-sync-traffic-day-toggle" aria-hidden="true">
              {expanded ?
               <ChevronDown />
              : <ChevronRight />}
             </span>
             <strong><FormatBadge value={group.formatCode} label={group.formatLabel} /></strong>
            </td>
            {formatSubscriberDisplayColumns.map((column) =>
             renderFormatSubscriberMetricCell(group.totals, column, group),
            )}
           </tr>
           {expanded &&
            group.statuses.map((status) => (
             <tr
              className="vt-sync-traffic-day-child"
              data-traffic-day-detail="true"
              key={status.id}>
              <td className="is-day-source">
               {renderTrafficSourceBadge(status.statusLabel, status.status)}
              </td>
              {formatSubscriberDisplayColumns.map((column) =>
               renderFormatSubscriberMetricCell(status.row, column),
              )}
             </tr>
            ))}
          </React.Fragment>
         )
        })}
       </tbody>
      </table>
     </div>
    </div>
    <div className="vt-sync-traffic-day-counts" role="status">
     <span>{visibleFormatSubscriberGroups.length.toLocaleString()} visible formats</span>
     <span>{totalVisibleStatusRows.toLocaleString()} expanded status rows</span>
     <span>
      {sortedFormatSubscriberGroups.length.toLocaleString()} total formats from{" "}
      {sortedRows.length.toLocaleString()} flat rows
     </span>
    </div>
   </>
  )
 }

 const renderRetentionMetricCell = (
  row: VtSyncTableRow,
  column: VtSyncTableColumnDefinition,
  keyPrefix: string,
  summary = false,
 ) => {
  const text = formatRetentionRatio(row[column.key])
  const columnIndex = retentionDisplayColumns.findIndex(
   (candidate) => candidate.key === column.key,
  )
  const color = GROUP_COLORS[(columnIndex + 1) % GROUP_COLORS.length]
  const value = numericColumnValue(row, column)
  const rank = getVtSyncNumericRank(value, retentionNumericSorted[column.key])
  const colorRgb = (source: string) =>
   source
    .replace("#", "")
    .match(/.{2}/g)
    ?.map((part) => Number.parseInt(part, 16)) || [64, 198, 233]
  const heatColor = heatmapInverted ? getVtSyncOppositeColor(color) : color
  const fillColor = cellFillInverted ? getVtSyncOppositeColor(color) : color
  const cellStyle: CssVars = {
   "--vt-traffic-cell": color,
   backgroundColor:
    heatmapEnabled && rank > 0 ?
     `rgba(${colorRgb(heatColor).join(",")},${0.16 + rank * 0.68})`
    : undefined,
   backgroundImage:
    cellFillEnabled && rank > 0 ?
     `linear-gradient(90deg, rgba(${colorRgb(fillColor).join(",")},.58) ${Math.round(rank * 100)}%, transparent ${Math.round(rank * 100)}%)`
    : undefined,
  }
  return (
   <td
    key={`${keyPrefix}-${column.key}`}
    data-column-key={column.key}
    data-format={column.format}
    className={`${heatmapEnabled && rank > 0 ? "has-heatmap" : ""} ${cellFillEnabled && rank > 0 ? "is-filled-cell" : ""}`}
    style={cellStyle}>
    <span className="vt-sync-traffic-day-value vt-sync-retention-value">
     {text}
     {summary && <small>Curve average</small>}
    </span>
    {sparklinesEnabled && rank > 0 && (
     <span
      className={`vt-sync-spark color-${sparkColorMode} shape-${sparkShape} ${sparkOpposite ? "is-opposite" : ""} ${sparkStroke ? "" : "no-stroke"}`}>
      <i
       style={getVtSyncSparkFillStyle(
        rank,
        sparkColorMode === "spectrum" ?
         getVtSyncSparkGradient(sparkOpposite)
        : getVtSyncSparkColor(color, rank, sparkColorMode, sparkOpposite),
        sparkColorMode,
       )}
      />
     </span>
    )}
   </td>
  )
 }

 const renderRetentionVisualSuite = (group: VtSyncRetentionVideoGroup) => {
  const metadata =
   retentionVideoMetadata.get(group.videoId.toLocaleLowerCase()) ||
   retentionVideoMetadata.get(group.videoId)
  const metadataTitle = metadata?.title ? String(metadata.title) : ""
  const durationSeconds =
   metadata?.duration ?
    parseVtSyncDurationSeconds(metadata.duration, "duration")
   : undefined
  const visual = buildVtSyncRetentionVisualModel(group, durationSeconds)
  const selectedIndex = Math.min(
   visual.points.length - 1,
   Math.max(0, retentionInspectorPoints[group.id] ?? 28),
  )
  const selectedPoint = visual.points[selectedIndex]
  const maxAudience = Math.max(
   1,
   ...visual.points.map((point) => point.audienceRatio ?? 0),
  )
  const actualPolyline = retentionPolyline(
   visual.points,
   "audienceRatio",
   maxAudience,
  )
  const relativePolyline = retentionPolyline(
   visual.points,
   "relativePerformance",
   1,
  )
  const medianBandTop = 16 + (1 - 0.55) * 148
  const medianBandHeight = (0.55 - 0.45) * 148
  const selectedTimestamp =
   selectedPoint?.timestampSeconds === undefined ?
    undefined
   : formatVtSyncDurationSeconds(selectedPoint.timestampSeconds)
  const selectedChange = selectedPoint?.change
  const selectedRelativeDelta =
   selectedPoint?.relativePerformance === undefined ?
    undefined
   : selectedPoint.relativePerformance - 0.5
  const renderRetentionProgressAxis = () => (
   <div
    className="vt-sync-retention-progress-axis"
    aria-label="Video progress percentiles">
    {[
     { point: "P001", label: "Start", color: "#00D2FF" },
     { point: "P025", label: "25%", color: "#3FEE56" },
     { point: "P050", label: "Midpoint", color: "#FFE357" },
     { point: "P075", label: "75%", color: "#FFA85C" },
     { point: "P100", label: "Finish", color: "#F55EFC" },
    ].map((item) => (
     <span
      key={item.point}
      style={{ "--vt-progress-color": item.color } as CssVars}>
      <b>{item.point}</b>
      <small>{item.label}</small>
     </span>
    ))}
   </div>
  )

  return (
   <tr
    className="vt-sync-retention-visual-row"
    data-retention-visual-suite="true">
    <td colSpan={retentionDisplayColumns.length + 1}>
     <section
      className="vt-sync-retention-visual-suite"
      aria-label={`Audience retention visual systems for ${metadataTitle || group.videoId}`}>
      <header className="vt-sync-retention-suite-heading">
       <div>
        <strong>Audience Retention · 100-Percentile Display System</strong>
        <small>
         Calculated from {visual.points.length} YouTube Analytics retention
         points
        </small>
       </div>
       <span>Video {group.videoId}</span>
      </header>
      <div className="vt-sync-retention-unified-surface">
       <section
        className="vt-sync-retention-visual-band is-curve"
        aria-labelledby={`retention-curve-${group.id}`}>
        <h4 id={`retention-curve-${group.id}`}>
         Retention curve{" "}
         <small>Audience remaining and length-relative performance</small>
        </h4>
        <div className="vt-sync-retention-line-chart">
         <svg
          viewBox="0 0 900 180"
          preserveAspectRatio="none"
          role="img"
          aria-label="Audience ratio and relative retention performance line chart">
          <rect
           x="24"
           y={medianBandTop}
           width="852"
           height={medianBandHeight}
           fill="#dfe7ff"
          />
          {[0, 0.25, 0.5, 0.75, 1].map((value) => (
           <line
            key={value}
            x1="24"
            x2="876"
            y1={16 + (1 - value) * 148}
            y2={16 + (1 - value) * 148}
            stroke="rgba(0,0,0,.14)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
           />
          ))}
          <polyline
           points={relativePolyline}
           fill="none"
           stroke="#528FFA"
           strokeWidth="3"
           strokeDasharray="7 5"
           vectorEffect="non-scaling-stroke"
          />
          <polyline
           points={actualPolyline}
           fill="none"
           stroke="#FF3399"
           strokeWidth="4"
           strokeLinecap="round"
           strokeLinejoin="round"
           vectorEffect="non-scaling-stroke"
          />
         </svg>
         <div className="vt-sync-retention-legend">
          <span>
           <i style={{ background: "#FF3399" }} />
           Audience remaining
          </span>
          <span>
           <i style={{ background: "#528FFA" }} />
           Length-relative index
          </span>
          <span>
           <i style={{ background: "#dfe7ff" }} />
           Median relative band
          </span>
         </div>
        </div>
       </section>

       <section
        className="vt-sync-retention-visual-band is-delta"
        aria-labelledby={`retention-delta-${group.id}`}>
        <h4 id={`retention-delta-${group.id}`}>
         Relative-to-typical delta{" "}
         <small>One bar per elapsed-video percentile</small>
        </h4>
        <div
         className="vt-sync-retention-delta-bars"
         aria-label="Relative retention difference from median">
         {visual.points.map((point) => {
          const delta = (point.relativePerformance ?? 0.5) - 0.5
          return (
           <span
            key={`delta-${point.pointNumber}`}
            className={delta >= 0 ? "is-positive" : "is-negative"}
            title={`P${String(point.pointNumber).padStart(3, "0")} · ${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(1)} points vs median`}>
            <i style={{ height: `${Math.min(50, Math.abs(delta) * 250)}%` }} />
           </span>
          )
         })}
         <div className="vt-sync-retention-delta-key" aria-hidden="true">
          <span>
           <i />
           Above median
          </span>
          <span>
           <i />
           Below median
          </span>
          <small>One bar per elapsed-video percentile</small>
         </div>
        </div>
       </section>

       <section
        className="vt-sync-retention-visual-band is-fingerprint"
        aria-labelledby={`retention-fingerprint-${group.id}`}>
        <h4 id={`retention-fingerprint-${group.id}`}>
         Retention fingerprint <small>Glassy 100-point performance scan</small>
        </h4>
        <div className="vt-sync-retention-fingerprint-frame">
         <div
          className="vt-sync-retention-fingerprint"
          aria-label="100-point relative retention fingerprint">
          {visual.points.map((point) => (
           <span
            key={`fingerprint-${point.pointNumber}`}
            title={`P${String(point.pointNumber).padStart(3, "0")} · ${formatRetentionRatio(point.audienceRatio)} audience · ${formatRetentionRatio(point.relativePerformance)} relative`}
            style={{
             background: retentionPointColor(point.relativePerformance),
            }}
           />
          ))}
         </div>
         {renderRetentionProgressAxis()}
        </div>
        <div className="vt-sync-retention-fingerprint-key">
         <span>
          <i style={{ background: "#C9F830" }} />
          Excellent
         </span>
         <span>
          <i style={{ background: "#3FEE56" }} />
          Above
         </span>
         <span>
          <i style={{ background: "#FFE357" }} />
          Median
         </span>
         <span>
          <i style={{ background: "#FF7AC8" }} />
          Below
         </span>
        </div>
       </section>

       <section
        className="vt-sync-retention-insight-rail"
        aria-labelledby={`retention-inspector-heading-${group.id}`}>
        <div className="vt-sync-retention-inspector">
         <label
          id={`retention-inspector-heading-${group.id}`}
          htmlFor={`retention-inspector-${group.id}`}>
          Percentile inspector{" "}
          <b>P{String(selectedPoint?.pointNumber || 1).padStart(3, "0")}</b>
         </label>
         <input
          id={`retention-inspector-${group.id}`}
          type="range"
          min={1}
          max={Math.max(1, visual.points.length)}
          value={selectedIndex + 1}
          onChange={(event) =>
           setRetentionInspectorPoints((current) => ({
            ...current,
            [group.id]: Number(event.target.value) - 1,
           }))
          }
         />
         <div className="vt-sync-retention-readout">
          <span style={{ "--vt-read-color": "#F55EFC" } as CssVars}>
           <b>{formatRetentionRatio(selectedPoint?.audienceRatio)}</b>
           <small>Audience remaining</small>
          </span>
          <span style={{ "--vt-read-color": "#528FFA" } as CssVars}>
           <b>{formatRetentionRatio(selectedPoint?.relativePerformance)}</b>
           <small>Length-relative score</small>
          </span>
          <span style={{ "--vt-read-color": "#FFE357" } as CssVars}>
           <b>
            {selectedRelativeDelta === undefined ?
             "-"
            : `${selectedRelativeDelta >= 0 ? "+" : ""}${(selectedRelativeDelta * 100).toFixed(1)} pts`
            }
           </b>
           <small>Difference from median</small>
          </span>
          <span style={{ "--vt-read-color": "#00D2FF" } as CssVars}>
           <b>
            {selectedTimestamp ||
             formatRetentionRatio(selectedPoint?.elapsedRatio)}
           </b>
           <small>{selectedTimestamp ? "Timestamp" : "Elapsed position"}</small>
          </span>
          <span style={{ "--vt-read-color": "#C9F830" } as CssVars}>
           <b>P{String(selectedPoint?.pointNumber || 1).padStart(3, "0")}</b>
           <small>Percentile</small>
          </span>
          <span style={{ "--vt-read-color": "#FFA85C" } as CssVars}>
           <b>
            {selectedChange === undefined ?
             "-"
            : `${selectedChange >= 0 ? "+" : ""}${(selectedChange * 100).toFixed(1)} pts`
            }
           </b>
           <small>1-point change</small>
          </span>
         </div>
        </div>
        <div className="vt-sync-retention-story-grid">
         <div className="vt-sync-retention-segments">
          {visual.segments.map((segment, index) => (
           <div className="vt-sync-retention-segment" key={segment.id}>
            <span>
             {segment.label}
             <small>
              P{String(segment.startPoint).padStart(3, "0")}–P
              {String(segment.endPoint).padStart(3, "0")}
             </small>
            </span>
            <i>
             <b
              style={{
               width: `${Math.min(100, Math.max(0, (segment.averageAudienceRatio ?? 0) * 100))}%`,
               background: GROUP_COLORS[index % GROUP_COLORS.length],
              }}
             />
            </i>
            <strong>
             {formatRetentionRatio(segment.averageAudienceRatio)}
            </strong>
           </div>
          ))}
         </div>
         <div className="vt-sync-retention-events">
          {visual.events.map((event) => (
           <div key={event.id}>
            <time>
             {event.timestampSeconds === undefined ?
              `P${String(event.pointNumber).padStart(3, "0")}`
             : formatVtSyncDurationSeconds(event.timestampSeconds)}
            </time>
            <span className={`is-${event.type}`}>
             {event.type === "drop" ? "Drop" : "Replay"}
            </span>
            <p>
             Audience {event.change < 0 ? "falls" : "rises"}{" "}
             {Math.abs(event.change * 100).toFixed(1)} points at P
             {String(event.pointNumber).padStart(3, "0")}.
            </p>
            <strong>
             {event.change >= 0 ? "+" : ""}
             {(event.change * 100).toFixed(1)}
            </strong>
           </div>
          ))}
          {!visual.events.length && (
           <p className="vt-sync-retention-no-events">
            No point-to-point changes are available.
           </p>
          )}
         </div>
        </div>
        <footer>
         Five equal segments and the five largest local changes are computed
         from the retained 100-point report. No chapter labels are inferred.
        </footer>
       </section>
      </div>
     </section>
    </td>
   </tr>
  )
 }

 const renderRetentionVideoTable = () => {
  const videoIdColumn = orderedColumns.find(
   (column) => column.key === "videoId",
  )
  const visiblePointRows = visibleRetentionVideoGroups.reduce(
   (sum, group) =>
    sum + (expandedRetentionVideos.has(group.id) ? group.points.length : 0),
   0,
  )
  const sortRetentionColumn = (column?: VtSyncTableColumnDefinition) => {
   if (column) sortColumn(column)
  }
  const retentionHeaderKeyDown = (
   event: React.KeyboardEvent<HTMLTableCellElement>,
   column?: VtSyncTableColumnDefinition,
  ) => {
   if (event.key !== "Enter" && event.key !== " ") return
   event.preventDefault()
   sortRetentionColumn(column)
  }
  const retentionSortArrow = (key: string) =>
   sort.key === key ?
    <b className="vt-sync-traffic-sort-arrow">
     {sort.direction === "desc" ? "↓" : "↑"}
    </b>
   : null

  return (
   <>
    <div className="vt-sync-retention-scroll-shell">
     {shouldRenderVerticalScrollbar && renderVerticalScrollbar()}
     <div
      className="vt-sync-traffic-day-viewport vt-sync-retention-video-viewport"
      ref={mainScrollRef}
      onScroll={updateScrollState}>
      <table
       className="vt-sync-traffic-day-table vt-sync-retention-video-table"
       aria-label="Audience retention grouped by video table">
       <thead>
        <tr>
         <th
          className="is-day-source"
          tabIndex={0}
          role="button"
          aria-sort={
           sort.key === "videoId" ?
            sort.direction === "desc" ?
             "descending"
            : "ascending"
           : "none"
          }
          onClick={() => sortRetentionColumn(videoIdColumn)}
          onKeyDown={(event) => retentionHeaderKeyDown(event, videoIdColumn)}>
          Video / Retention Point{retentionSortArrow("videoId")}
         </th>
         {retentionDisplayColumns.map((column, index) => {
          const [first, second] = splitHeader(
           getColumnDisplayLabel(table.id, column),
          )
          return (
           <th
            key={column.key}
            tabIndex={0}
            role="button"
            aria-sort={
             sort.key === column.key ?
              sort.direction === "desc" ?
               "descending"
              : "ascending"
             : "none"
            }
            style={
             {
              "--vt-header-color":
               GROUP_COLORS[(index + 1) % GROUP_COLORS.length],
             } as CssVars
            }
            onClick={() => sortRetentionColumn(column)}
            onKeyDown={(event) => retentionHeaderKeyDown(event, column)}>
            <span>
             {first}
             {second && (
              <>
               <br />
               {second}
              </>
             )}
            </span>
            {retentionSortArrow(column.key)}
           </th>
          )
         })}
        </tr>
       </thead>
       <tbody>
        {visibleRetentionVideoGroups.map((group) => {
         const expanded = expandedRetentionVideos.has(group.id)
         const metadata =
          retentionVideoMetadata.get(group.videoId.toLocaleLowerCase()) ||
          retentionVideoMetadata.get(group.videoId)
         const metadataTitle = metadata?.title ? String(metadata.title) : ""
         const metadataThumbnail =
          metadata?.thumbnail || metadata?.thumbnailUrl ?
           String(metadata.thumbnail || metadata.thumbnailUrl)
          : `https://i.ytimg.com/vi/${encodeURIComponent(group.videoId)}/mqdefault.jpg`
         const videoUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(group.videoId)}`
         return (
          <React.Fragment key={group.id}>
           <tr
            className="vt-sync-traffic-day-parent vt-sync-retention-video-parent"
            data-retention-video-parent="true"
            data-retention-group-id={group.id}
            aria-expanded={expanded}
            tabIndex={0}
            onClick={(event) =>
             toggleRetentionVideo(group.id, event.currentTarget)
            }
            onKeyDown={(event) => {
             if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              toggleRetentionVideo(group.id, event.currentTarget)
             }
            }}>
            <td className="is-day-source">
             <span className="vt-sync-traffic-day-toggle" aria-hidden="true">
              {expanded ?
               <ChevronDown />
              : <ChevronRight />}
             </span>
             <span className="vt-sync-retention-video-thumbnail">
              <Clapperboard aria-hidden="true" />
              <img
               src={metadataThumbnail}
               alt=""
               onError={(event) => {
                event.currentTarget.hidden = true
               }}
              />
             </span>
             <span className="vt-sync-retention-video-copy">
              <strong title={metadataTitle || group.videoId}>
               {metadataTitle || "Video metadata unavailable"}
              </strong>
              <small>{group.videoId}</small>
             </span>
             <span className="vt-sync-retention-video-actions">
              <button
               type="button"
               title="Copy video URL"
               aria-label={`Copy link for ${metadataTitle || group.videoId}`}
               onClick={(event) => {
                event.stopPropagation()
                void navigator.clipboard?.writeText(videoUrl)
                showToast("Copied video URL")
               }}>
               <Copy />
              </button>
              <a
               href={videoUrl}
               target="_blank"
               rel="noreferrer"
               title="Open video"
               aria-label={`Open ${metadataTitle || group.videoId} on YouTube`}
               onClick={(event) => event.stopPropagation()}>
               <ExternalLink />
              </a>
             </span>
             <small>{group.points.length} points</small>
            </td>
            {retentionDisplayColumns.map((column) =>
             renderRetentionMetricCell(group.summary, column, group.id, true),
            )}
           </tr>
           {expanded && renderRetentionVisualSuite(group)}
           {expanded &&
            group.points.map((point, index) => (
             <tr
              className="vt-sync-traffic-day-child vt-sync-retention-video-child"
              data-retention-point="true"
              key={point.id}>
              <td className="is-day-source">
               <span className="vt-sync-retention-point-badge">
                Point{" "}
                {String(
                 Math.max(
                  1,
                  Math.min(
                   100,
                   Math.round(
                    (point.elapsed ?? (index + 1) / group.points.length) * 100,
                   ),
                  ),
                 ),
                ).padStart(3, "0")}
               </span>
               <small>{formatRetentionRatio(point.elapsed)} elapsed</small>
              </td>
              {retentionDisplayColumns.map((column) =>
               renderRetentionMetricCell(point.row, column, point.id),
              )}
             </tr>
            ))}
          </React.Fragment>
         )
        })}
       </tbody>
      </table>
     </div>
    </div>
    <div className="vt-sync-traffic-day-counts" role="status">
     <span>
      {visibleRetentionVideoGroups.length.toLocaleString()} visible videos
     </span>
     <span>{visiblePointRows.toLocaleString()} expanded retention points</span>
     <span>
      {sortedRetentionVideoGroups.length.toLocaleString()} videos from{" "}
      {sortedRows.length.toLocaleString()} flat points
     </span>
    </div>
   </>
  )
 }

 const pinnedTableWidth = useMemo(
  () =>
   pinnedColumns.reduce(
    (sum, column) =>
     sum +
     (sparseColumnWidths[column.key] ?? baseColumnWidths[column.key] ?? 0),
    0,
   ),
  [pinnedColumns, sparseColumnWidths, baseColumnWidths],
 )
 const trafficOverviewRowHeight =
  table.id === "traffic" ?
   getVtSyncTrafficOverviewRowHeight(sortedRows.length)
  : tableGeometry.rowHeight

 const rootStyle: CssVars = {
  "--vt-active-icon": category.colors.icon,
  "--vt-active-label": category.colors.label,
  "--vt-active-shadow": category.colors.shadow,
  "--vt-row-height": `${trafficOverviewRowHeight}px`,
  "--vt-group-header-height": `${tableGeometry.useGroups ? 30 : 0}px`,
  "--vt-total-height": `${table.id === "demographics" || ["daily", "weekly", "monthly"].includes(table.id) ? 0 : tableGeometry.totalsHeight}px`,
  "--vt-column-header-height": `${tableGeometry.columnHeaderHeight}px`,
  "--vt-pinned-offset": `${32 + 58 + (pinCount > 0 ? pinnedTableWidth : 0)}px`,
 }

 return (
  <section
   className={`vt-sync-toolbox-table is-${tableGeometry.mode}-table ${focus ? "is-focus" : ""} ${dark ? "is-dark" : ""} ${effectiveCompact ? "is-compact" : ""} ${cellFillEnabled ? "has-cell-fill" : ""} ${sparklinesEnabled ? "" : "no-spark"} ${table.mainCategoryId === "demographics" ? "is-demographics" : ""} ${table.mainCategoryId === "traffic" ? "is-traffic-table" : ""} ${table.id === "traffic" ? "is-traffic-overview" : ""}`}
   style={rootStyle}>
   {toast && (
    <div
     className={`vt-sync-toast ${toast.ok ? "is-ok" : "is-error"}`}
     role="status">
     {toast.message}
    </div>
   )}
   <div
    ref={dragRectRef}
    className="vt-sync-column-drag-rect"
    aria-hidden="true"
   />
   <header className="vt-sync-title-rail">
    <div>{categoryIcon(category.id)}</div>
    <h2>MASTER DATA TABLES</h2>
    <button
     type="button"
     className="vt-sync-collapse-button"
     aria-label={
      tableOpen ? "Collapse master data tables" : "Expand master data tables"
     }
     aria-expanded={tableOpen}
     aria-controls="vt-sync-table-content"
     onClick={() => {
      setTableOpen((open) => !open)
      setSettingsOpen(false)
     }}>
     <AnimatedToggleIcon open={tableOpen} size={44} />
    </button>
   </header>

   <div
    id="vt-sync-table-content"
    className={`vt-sync-toolbox-content ${tableOpen ? "is-open" : "is-closed"}`}
    aria-hidden={!tableOpen}
    inert={!tableOpen}>
    <div className="vt-sync-toolbox-content-inner">
     <nav
     ref={categoryRailRef}
     className="vt-sync-category-rail"
     style={{ "--vt-category-count": VT_SYNC_TOOLBOX_CATEGORIES.length } as CssVars}
     aria-label="Data table categories">
      {VT_SYNC_TOOLBOX_CATEGORIES.map((item) => {
       const isActive = categoryId === item.id
       const hasTables = item.tableIds.length > 1
       const useSplitControl = isActive && hasTables
       const activeTable = isActive ? table : findVtSyncTable(item.tableIds[0])
       const buttonLabel =
        useSplitControl ?
         getVtSyncCompactMenuLabel(
          activeTable.id,
          activeTable.subLabel || activeTable.label,
         )
        : item.label
       return (
        <div
         className="vt-sync-category-wrap"
         key={item.id}
         style={
          {
           "--vt-cat-icon": item.colors.icon,
           "--vt-cat-label": item.colors.label,
           "--vt-cat-shadow": item.colors.shadow,
          } as CssVars
         }>
         <button
          ref={(node) => {
           categoryButtonRefs.current[item.id] = node
          }}
          type="button"
          className={`vt-sync-category-button ${isActive ? "active" : ""} ${useSplitControl ? "is-subset" : ""}`}
          aria-haspopup={hasTables ? "listbox" : undefined}
          aria-expanded={dropdown?.id === item.id}
          aria-pressed={isActive}
          onClick={(event) => clickCategory(item, event.currentTarget)}>
          <span
           className={`vt-sync-category-icon ${useSplitControl ? "is-split" : ""}`}>
           {useSplitControl ?
            <>
             <span className="vt-sync-category-split-label">Set</span>
             <span className="vt-sync-category-split-icon">
              <ChevronDown aria-hidden="true" />
             </span>
            </>
           : <i>{categoryIcon(item.id)}</i>}
          </span>
          <span className="vt-sync-category-label">
           <strong>{buttonLabel}</strong>
          </span>
         </button>
         {dropdown?.id === item.id && (
          <div
           ref={dropdownRef}
           className="vt-sync-subset-menu"
           role="listbox"
           aria-label={`${item.label} data tables`}
           style={{
            left: dropdown.left,
            top: dropdown.top,
            width: dropdown.width,
           }}>
           {item.tableIds.map((id) => {
            const candidate = findVtSyncTable(id)
            const isSelected = id === table.id
            const label = getVtSyncCompactMenuLabel(
             candidate.id,
             candidate.subLabel || candidate.label,
            )
            return (
             <button
              type="button"
              role="option"
              aria-selected={isSelected}
              className={isSelected ? "active" : ""}
              key={id}
              onClick={() => selectCategory(item.id, id)}>
              <i>
               {isSelected ?
                <ChevronDown aria-hidden="true" />
               : categoryIcon(item.id)}
              </i>
              <span>
               <strong>{label}</strong>
              </span>
             </button>
            )
           })}
          </div>
         )}
        </div>
       )
      })}
     </nav>

     <section
      className={`vt-sync-summary-rail ${table.id === "videos" ? "is-video-summary" : ""}`}>
      <article className="vt-sync-summary-card">
       <header>
        <span>
         <Activity size={13} strokeWidth={3} />
        </span>
        <strong>
         {table.id === "videos" ?
          "Selected Video"
         : table.id === "channel_totals" ?
          "Channel Intelligence"
         : getVtSyncPresentationLabel(table.id, table.label)}
        </strong>
       </header>
       <div className="vt-sync-summary-card-body">
        <div className="vt-sync-summary-image">
         {selected?.thumbnail ?
          <img src={String(selected.thumbnail)} alt="" />
         : snapshot.avatarUrl ?
          <img src={snapshot.avatarUrl} alt="" />
         : categoryIcon(category.id)}
        </div>
        <div>
         <h3>
          {String(selected?.title || snapshot.channelName || table.label)}
         </h3>
         <p>
          {table.id === "channel_totals" ?
           "Channel identity · YouTube Data API · Performance totals · YouTube Analytics API"
          : String(selected?.descriptionSnippet || table.description)}
         </p>
        </div>
       </div>
      </article>
      <div className="vt-sync-summary-stats">
       {summaryStats.map((stat, index) => (
        <article key={stat.label}>
         <header
          style={{ background: GROUP_COLORS[index % GROUP_COLORS.length] }}>
          <span
           style={{
            background: GROUP_COLORS[(index + 4) % GROUP_COLORS.length],
           }}>
           <Activity size={11} strokeWidth={3} />
          </span>
          <small>{stat.label}</small>
         </header>
         <div>
          <strong title={String(stat.value)}>{stat.value}</strong>
          <span>{stat.note}</span>
         </div>
        </article>
       ))}
      </div>
     </section>

     <div className="vt-sync-toolbar">
      <div className="vt-sync-search" role="search">
       <span>
        <Search />
       </span>
       <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={(event) => {
         if (event.key === "Escape") setSearch("")
        }}
        placeholder="Search table rows…"
        aria-label="Search table rows"
       />
       <button
        type="button"
        aria-label="Clear search"
        onClick={() => setSearch("")}>
        <X />
       </button>
</div>
        {tableId === "videos" && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              className={`vt-sync-toolbar-action ${formatFilter === 'long' ? 'active' : ''} is-format-filter-long`}
              style={{
                "--vt-action-rail": "#C0F240",
                "--vt-action-label": "#FA618A",
                "--vt-action-shadow": "rgba(192,242,64,.52)",
                marginLeft: 0,
              } as CssVars}
              onClick={() => setFormatFilter((current) => current === "long" ? "" : "long")}
            >
              <span>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    borderWidth: 3,
                    borderStyle: 'solid',
                    borderColor: '#000',
                    backgroundColor: '#E6F7FF',
                    margin: 0,
                    boxShadow: formatFilter === 'long' ? '0 0 0 3px #fff, 0 0 0 5px #000' : 'none'
                  }}
                  title="Longform Only"
                />
              </span>
              <strong>Longform Only</strong>
            </button>
            <button
              type="button"
              className={`vt-sync-toolbar-action ${formatFilter === 'short' ? 'active' : ''} is-format-filter-short`}
              style={{
                "--vt-action-rail": "#3FEE56",
                "--vt-action-label": "#FF7F6B",
                "--vt-action-shadow": "rgba(63,238,86,.52)",
                marginLeft: 8,
              } as CssVars}
              onClick={() => setFormatFilter((current) => current === "short" ? "" : "short")}
            >
              <span>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    borderWidth: 3,
                    borderStyle: 'solid',
                    borderColor: '#000',
                    backgroundColor: '#FFE6F0',
                    margin: 0,
                    boxShadow: formatFilter === 'short' ? '0 0 0 3px #fff, 0 0 0 5px #000' : 'none'
                  }}
                  title="Shorts Only"
                />
              </span>
              <strong>Shorts Only</strong>
            </button>
            {(activePrivacyFilters.excludePrivate || activePrivacyFilters.excludeUnlisted) && (
             <button
              type="button"
              className="vt-sync-toolbar-action"
              style={{
               "--vt-action-rail": "#FFDA47",
               "--vt-action-label": "#FFFFFF",
               "--vt-action-shadow": "rgba(255,218,71,.52)",
               marginLeft: 8,
              } as CssVars}
              onClick={() => {
               const next = saveVtSyncPrivacyFilters({ excludePrivate: false, excludeUnlisted: false })
               setLocalPrivacyFilters(next)
               onPrivacyFiltersChange?.(next)
               setRowLimit(VT_SYNC_ROW_BATCH_SIZE)
              }}>
              <span aria-hidden="true"><Eye /></span>
              <strong>Show All Privacy</strong>
             </button>
            )}
          </div>
        )}
{table.presentationMode === "retention-video" && (
        <>
         <button
          type="button"
          className="vt-sync-toolbar-action is-traffic-day-control"
          style={
           {
            "--vt-action-rail": "#FFDA47",
            "--vt-action-label": "#FFFFFF",
            "--vt-action-shadow": "rgba(255,218,71,.52)",
           } as CssVars
          }
          onClick={() =>
           setExpandedRetentionVideos(
            new Set(visibleRetentionVideoGroups.map((group) => group.id)),
           )
          }>
          <span>
           <ChevronDown />
          </span>
          <strong>Expand visible videos</strong>
         </button>
         <button
          type="button"
          className="vt-sync-toolbar-action is-traffic-day-control"
          style={
           {
            "--vt-action-rail": "#F55EFC",
            "--vt-action-label": "#FFFFFF",
            "--vt-action-shadow": "rgba(245,94,252,.52)",
           } as CssVars
          }
          onClick={() => setExpandedRetentionVideos(new Set())}>
          <span>
           <ChevronRight />
          </span>
          <strong>Collapse all</strong>
         </button>
        </>
       )}
      <button
       type="button"
       className="vt-sync-toolbar-action"
       style={
        {
         "--vt-action-rail": "#4EE4BE",
         "--vt-action-label": "#FFA85C",
         "--vt-action-shadow": "rgba(78,228,190,.52)",
        } as CssVars
       }
       onClick={() => fileRef.current?.click()}>
       <span>
        <Upload />
       </span>
       <strong>Import CSV</strong>
      </button>
      <input
       ref={fileRef}
       hidden
       type="file"
       multiple
       accept=".csv,text/csv"
       onChange={async (event) => {
        if (!event.target.files) return
        try {
         const files = Array.from(event.target.files)
         const importedRows = await importVtSyncCsvFiles(files, table.id)
         const entries = Object.entries(importedRows)
         if (!entries.length || entries.every(([, rows]) => !rows.length))
          showToast("CSV had no recognized data rows", false)
         else {
          const importedTimestamp = new Date().toISOString()
          setImported((current) => ({ ...current, ...importedRows }))
          setImportedAt((current) => ({
           ...current,
           ...Object.fromEntries(
            entries.map(([id]) => [id, importedTimestamp]),
           ),
          }))
          try {
           await Promise.all(
            entries.map(([id, rows]) =>
             putVtSyncDatasetTableRows({
             id: manualImportId(id),
             runId: manualImportId(id),
             channelId: snapshot.channelId || undefined,
              datasetId: id,
              phase: "manual_import",
              capturedAt: importedTimestamp,
              rows,
              provenance: "csv",
              filenames: files.map((file) => file.name),
             }),
            ),
           )
           setSavedCsvTableIds(
            (current) => new Set([...current, ...entries.map(([id]) => id)]),
           )
           setCsvPersistenceWarning("")
          } catch {
           setCsvPersistenceWarning(
            "CSV import is active for this session but could not be retained after reload.",
           )
          }
         // Push the freshly parsed CSV directly to the analytics page.
// Do not make DATA VISUALS wait for IndexedDB/channel recovery.
void onManualImportsChange?.({
 rowsByTableId: importedRows,
 capturedAt: importedTimestamp,
})

setSelectedKey(null)
setSort(table.defaultSort)
          showToast(
           `Imported ${entries.reduce((sum, [, rows]) => sum + rows.length, 0)} rows`,
          )
         }
        } catch (error) {
         console.error("Analytics CSV import failed", error)
         showToast("Import failed — check the CSV format", false)
        } finally {
         event.currentTarget.value = ""
        }
       }}
      />
      <button
       type="button"
       className="vt-sync-toolbar-action"
       style={
        {
         "--vt-action-rail": "#36E0F6",
         "--vt-action-label": "#FFDA47",
         "--vt-action-shadow": "rgba(54,224,246,.52)",
        } as CssVars
       }
       onClick={() => {
        downloadCsv(
         table.exportName,
         exportVtSyncTableCsv(table, sortedRows, orderedColumns),
        )
        showToast(`Exported ${sortedRows.length} ${table.id} rows`)
       }}>
       <span>
        <Download />
       </span>
       <strong>Export CSV</strong>
      </button>
      <div ref={settingsRef} className="vt-sync-toolbar-settings">
       <button
        type="button"
        className="vt-sync-toolbar-action"
        style={
         {
          "--vt-action-rail": "#528FFA",
          "--vt-action-label": "#C0F240",
          "--vt-action-shadow": "rgba(82,143,250,.52)",
         } as CssVars
        }
        aria-label="Table settings"
        aria-haspopup="dialog"
        aria-expanded={settingsOpen}
        onClick={() => setSettingsOpen((open) => !open)}>
        <span>
         <Settings />
        </span>
        <strong>Settings</strong>
       </button>
       {settingsOpen && (
        <div
         className="vt-sync-settings-panel"
         role="dialog"
         aria-label="Table settings">
         <div className="vt-sync-settings-heading">
          <strong>Display Options</strong>
          <button
           type="button"
           aria-label="Close settings"
           onClick={() => setSettingsOpen(false)}>
           <X />
          </button>
         </div>
         <div className="vt-sync-settings-grid">
          <SettingControl label="Dark Mode">
           <Switch
            label="Dark mode"
            checked={dark}
            activeColor="#36E0F6"
            onChange={() => setDark(!dark)}
           />
          </SettingControl>
          <SettingControl label="Compact" disabled={!compactEligible}>
           <Switch
            label="Compact rows"
            checked={effectiveCompact}
            activeColor="#3FEE56"
            onChange={() => setCompact(!compact)}
           />
          </SettingControl>
          <SettingControl
           label="Pin Columns"
           disabled={!compactEligible || !tableGeometry.canPin}>
           <Switch
            label="Pin columns"
            checked={Boolean(pinCount)}
            activeColor="#FA618A"
            onChange={() => setPin(!pin)}
           />
          </SettingControl>
          <SettingControl label="Fullscreen">
           <Switch
            label="Fullscreen"
            checked={focus}
            activeColor="#FFA85C"
            onChange={() => setFocus(!focus)}
           />
          </SettingControl>
          <SettingControl label="Zebra Rows">
           <Switch
            label="Zebra rows"
            checked={zebra}
            activeColor="#FA618A"
            onChange={() => setZebra(!zebra)}
           />
          </SettingControl>
          <SettingControl label="Format Rows">
           <Switch
            label="Format rows"
            checked={formatRows}
            activeColor="#A467F4"
            onChange={() => setFormatRows(!formatRows)}
           />
          </SettingControl>
          <SettingControl label="Formula">
           <Switch
            label="Formula metrics"
            checked={formulas}
            activeColor="#F55EFC"
            onChange={() => setFormulas(!formulas)}
           />
          </SettingControl>
          <SettingControl label="Hover Scroll">
           <Switch
            label="Hover scroll"
            checked={hoverScroll}
            activeColor="#F55EFC"
            onChange={() => setHoverScroll(!hoverScroll)}
           />
          </SettingControl>
          <SettingControl label="Filters">
           <Switch
            label="Column filters"
            checked={filterRows}
            activeColor="#3FEE56"
            onChange={() => setFilterRows(!filterRows)}
           />
          </SettingControl>
          <SettingControl label="Exclude Private">
           <Switch
            label="Exclude private videos"
            checked={activePrivacyFilters.excludePrivate}
            activeColor="#3FEE56"
            onChange={() =>
             updatePrivacyFilter(
              "excludePrivate",
              !activePrivacyFilters.excludePrivate,
             )
            }
           />
          </SettingControl>
          <SettingControl label="Exclude Unlisted">
           <Switch
            label="Exclude unlisted videos"
            checked={activePrivacyFilters.excludeUnlisted}
            activeColor="#3FEE56"
            onChange={() =>
             updatePrivacyFilter(
              "excludeUnlisted",
              !activePrivacyFilters.excludeUnlisted,
             )
            }
           />
          </SettingControl>
         </div>
         <div className="vt-sync-saved-csv-settings">
          <button
           type="button"
           disabled={!savedCsvTableIds.has(table.id)}
           onClick={async () => {
            try {
             await deleteVtSyncDatasetTableRows(manualImportId(table.id))
             setImported((current) => {
              const next = { ...current }
              delete next[table.id]
              return next
             })
             setImportedAt((current) => {
              const next = { ...current }
              delete next[table.id]
              return next
             })
             setSavedCsvTableIds((current) => {
              const next = new Set(current)
              next.delete(table.id)
              return next
             })
             onManualImportsChange?.()
             showToast(
              `Cleared saved CSV for ${getVtSyncPresentationLabel(table.id, table.label)}`,
             )
            } catch {
             showToast("Could not clear the saved CSV", false)
            }
           }}>
           Clear Saved CSV
          </button>
          <span>
           {savedCsvTableIds.has(table.id) ?
            "Latest import retained for this table."
           : "No saved import for this table."}
          </span>
         </div>
         <div className="vt-sync-effect-settings">
          <section style={{ "--vt-effect-color": "#36E0F6" } as CssVars}>
           <strong>Sparklines</strong>
           <BinaryToggle
            label="Sparkline visibility"
            left="On"
            right="Off"
            leftActive={sparklinesEnabled}
            onChange={setSparklinesEnabled}
            color="#36E0F6"
           />
           <BinaryToggle
            label="Sparkline shape"
            left="Pill"
            right="Bar"
            leftActive={sparkShape === "pill"}
            onChange={(pill) => setSparkShape(pill ? "pill" : "bar")}
            color="#FFDA47"
           />
           <TernaryToggle
            label="Sparkline color"
            options={["solid", "rank", "spectrum"] as const}
            value={sparkColorMode}
            onChange={setSparkColorMode}
            color="#3FEE56"
           />
           <BinaryToggle
            label="Sparkline palette"
            left="Color"
            right="Invert"
            leftActive={!sparkInverted}
            onChange={(color) => setSparkInverted(!color)}
            color="#F55EFC"
           />
           <BinaryToggle
            label="Sparkline outline"
            left="Stroke"
            right="Off"
            leftActive={sparkStroke}
            onChange={setSparkStroke}
            color="#FFA85C"
           />
          </section>
          <section style={{ "--vt-effect-color": "#528FFA" } as CssVars}>
           <strong>Heat Map</strong>
           <BinaryToggle
            label="Heat map visibility"
            left="On"
            right="Off"
            leftActive={heatmapEnabled}
            onChange={setHeatmapEnabled}
            color="#528FFA"
           />
           <BinaryToggle
            label="Heat map palette"
            left="Color"
            right="Invert"
            leftActive={!heatmapInverted}
            onChange={(color) => setHeatmapInverted(!color)}
            color="#F55EFC"
           />
          </section>
          <section style={{ "--vt-effect-color": "#A467F4" } as CssVars}>
           <strong>Cell Fill</strong>
           <BinaryToggle
            label="Cell fill visibility"
            left="On"
            right="Off"
            leftActive={cellFillEnabled}
            onChange={setCellFillEnabled}
            color="#A467F4"
           />
           <BinaryToggle
            label="Cell fill palette"
            left="Color"
            right="Invert"
            leftActive={!cellFillInverted}
            onChange={(color) => setCellFillInverted(!color)}
            color="#F55EFC"
           />
          </section>
         </div>
        </div>
       )}
      </div>
     </div>
     {csvPersistenceWarning ?
      <p className="vt-sync-csv-persistence-warning" role="status">
       {csvPersistenceWarning}
      </p>
     : null}

     {table.id === "demographics" ? renderDemographicTable()
     : table.id === "device_os" ? renderDeviceOsTable()
     : table.presentationMode === "traffic-source-day" ? renderTrafficSourceDayTable()
     : table.presentationMode === "format-subscriber-status" ? renderFormatSubscriberTable()
     : table.presentationMode === "retention-video" ? renderRetentionVideoTable()
     : <>
       <div className={`vt-sync-scroll-lattice ${shouldRenderVerticalScrollbar ? "has-vertical-rail" : ""}`}>
        <div
         className={`vt-sync-split-table ${table.id === "traffic" ? "has-toolbar-boundary" : ""}`}>
         {shouldRenderVerticalScrollbar && renderVerticalScrollbar()}
        <div
         className="vt-sync-row-rail-viewport"
         ref={rowRailScrollRef}
         onScroll={(event) => {
          if (
           mainScrollRef.current &&
           mainScrollRef.current.scrollTop !== event.currentTarget.scrollTop
          )
           mainScrollRef.current.scrollTop = event.currentTarget.scrollTop
         }}>
         {renderRowRail()}
        </div>
        {pinCount > 0 && (
         <div className="vt-sync-pinned-viewport" ref={pinnedScrollRef}>
          {renderTable(pinnedGroups, true)}
         </div>
        )}
        <div
         className="vt-sync-main-viewport"
         ref={mainScrollRef}
         onScroll={updateScrollState}
         onPointerMove={onHoverScroll}
         onPointerLeave={() => {
          hoverRef.current = { direction: 0, speed: 1 }
         }}>
         {renderTable(mainGroups, false)}
        </div>
        </div>
        {table.horizontalScrollMode === "custom" && scrollState.width < 99.9 ? (
         <div className="vt-sync-scrollbar-row">
          {renderScrollbar("bottom")}
          {shouldRenderVerticalScrollbar ? <div className="vt-sync-scrollbar-corner" aria-hidden="true" /> : null}
         </div>
        ) : null}
       </div>
      </>
     }
     <footer
      className="vt-sync-table-footer"
      style={{ "--vt-footer-color": category.colors.label } as CssVars}>
      <span className="vt-sync-table-footer-purpose">{syncModuleDescription}</span>
      <span className="vt-sync-table-footer-table">{getVtSyncPresentationLabel(table.id, table.label)}</span>
      <span className="vt-sync-table-footer-coverage">
        {table.presentationMode === "traffic-source-day" ?
         `Showing ${visibleTrafficDayGroups.length.toLocaleString()} of ${trafficDayGroups.length.toLocaleString()} day groups`
        : table.presentationMode === "format-subscriber-status" ?
         `Showing ${visibleFormatSubscriberGroups.length.toLocaleString()} of ${formatSubscriberGroups.length.toLocaleString()} format groups`
        : table.presentationMode === "retention-video" ?
         `Showing ${visibleRetentionVideoGroups.length.toLocaleString()} of ${retentionVideoGroups.length.toLocaleString()} video groups`
        : table.id === "device_os" ?
         `Showing ${sortedDeviceOsGroups.length.toLocaleString()} of ${sortedDeviceOsGroups.length.toLocaleString()} OS groups`
        : table.id === "videos" && videoCatalogCoverage
         ? `Showing ${renderedRows.length.toLocaleString()} of ${sortedRows.length.toLocaleString()} visible · ${videoCatalogCoverage.catalogTotal.toLocaleString()} catalog videos`
         : `Showing ${renderedRows.length.toLocaleString()} of ${sortedRows.length.toLocaleString()} rows`
        }
      </span>
      <span className="vt-sync-table-footer-columns">
        {table.id === "demographics" ?
         "3 sections · 3 gender metrics"
        : table.id === "device_os" ?
         `2 sections · ${deviceOsSummary?.deviceList.length ?? 0} devices per OS row`
        : table.presentationMode === "traffic-source-day" ?
         `${sortedRows.length.toLocaleString()} flat source/day rows · CSV stays flat`
        : table.presentationMode === "format-subscriber-status" ?
         `${sortedRows.length.toLocaleString()} flat format/status rows · CSV stays flat`
        : table.presentationMode === "retention-video" ?
         `${sortedRows.length.toLocaleString()} flat retention points · CSV stays flat`
        : `${presentationColumns.length} visible columns · ${pinCount ? `${pinCount} pinned` : "not pinned"}`
        }
      </span>
      <span className="vt-sync-table-footer-loading">
        {(
         table.presentationMode === "traffic-source-day" ||
         table.presentationMode === "format-subscriber-status" ||
         table.id === "device_os"
        ) ?
         "Grouped on screen"
        : table.presentationMode === "retention-video" ?
         "Grouped on screen"
        : table.id === "videos" && storageStatus === "loading" ?
         `Restoring ${videoCatalogCoverage?.catalogTotal.toLocaleString() || "stored"} catalog rows…`
        : table.id === "videos" && storageStatus === "failed" ?
         `Storage recovery failed${storageError ? ` · ${storageError}` : ""}`
        : renderedRows.length < sortedRows.length ?
         "Loading on scroll · next 50"
        : "All visible rows loaded"}
      </span>
      <span className="vt-sync-table-footer-provenance">
        <b>Source</b> {tableProvenance.sourceLabel}
      </span>
      <span className="vt-sync-table-footer-provenance">
        <b>Updated</b>{" "}
        <time dateTime={tableProvenance.updatedAt}>{provenanceTime}</time>
      </span>
       {tableProvenance.windowLabel && (
        <span className="vt-sync-table-footer-provenance">
         <b>Coverage</b> {tableProvenance.windowLabel}
        </span>
       )}
       <span className="vt-sync-table-footer-provenance">
        <b>Status</b> {tableProvenance.statusLabel}
       </span>
     </footer>
    </div>
   </div>
  </section>
 )
}

/* eslint-disable react-refresh/only-export-components -- compatibility exports are part of the existing VT-SYNC table API */
export {
 buildVtSyncTableViewModel,
 exportVtSyncTableCsv,
 importVtSyncCsvFiles,
} from "./vtSyncToolboxTableModel"
export const VtSyncDataTables = VtSyncToolboxDataTable