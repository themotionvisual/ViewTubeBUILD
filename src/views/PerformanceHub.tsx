import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
 import {
  Activity,
  Database,
  ChartColumnBig,
  BrainCircuit,
  Table2,
  Zap,
  Upload,
  Trash2,
  X,
  FileText,
  Clock3,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  Check,
  ShieldCheck,
 } from "lucide-react"
import {
 LineChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 BarChart,
 Bar,
 AreaChart,
 Area,
 PieChart,
 Pie,
 Cell,
 ScatterChart,
  Scatter,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  ZAxis,
 } from "recharts"
 import { SubToolbox, ToolboxScaffold } from "../components/Toolbox"
 import { useBrain } from "../context/useBrain"
 import type { AnalyticsResult, CsvFileWithTag, CsvUploadType } from "../types"
 import { hasGeminiKey } from "../services/gemini"
import {
 buildCsvFilesWithTags,
 expandCsvAndZipFiles,
 getCsvTagColorClass,
} from "../services/DataEngine"
import {
 mergeAndDedupeRows,
 normalizeAndEnrichRow,
} from "../services/DataEngine"
import {
 buildCsvFromRows,
 findDuplicateShortHeaders,
 firstDefined,
 flattenCsvRows,
 formatDateWindow,
 getAvdSeconds,
 getAvpPercent,
 getCanonicalMasterHeader,
 getComments,
 getCtr,
 getDateLabel,
 getImpressions,
 getLikes,
 getMetric,
 getRevenue,
 getRpm,
 getShares,
 getSubscribers,
 getTitle,
 getViews,
 getWatchHours,
 looksLikeVideoId,
 numberFromUnknown,
 parseDate,
 reportToRows,
 getShortMasterHeader,
 MASTER_VIDEO_TABLE_HEADERS,
 textFromUnknown,
} from "./performanceHubUtils"
import type { UnifiedRow } from "./performanceHubUtils"
import {
 getAvpRawPercent,
 resolveCtrPercent,
 resolveImpressions,
} from "../services/metricAliasResolver"
import { formatTrafficSourceNickname } from "../services/dataUtils"
import type { AnalyticsWindow } from "../services/analyticsContract"
import type { CanonicalMetricKey, MetricCell } from "../services/analyticsContract"
import {
 buildDatasetCoverageSummary,
 buildTableMetricMappingStatus,
 buildVideoStatsVerificationSummary,
 canonicalRowsToMasterTableRows,
 getHeaderMetricCell,
 getMasterRows,
 getMetricSummary,
 type MasterTableRow,
 type TableMetricMappingStatus,
 type VideoStatsVerificationSummary,
} from "../services/analyticsSelectors"
import {
 readYouTubeAnalyticsCache,
 writeYouTubeAnalyticsCache,
} from "../services/canonicalAnalyticsStore"
import {
 UPLOAD_CACHE_FILES_KEY,
 applyGlobalRowFilters,
 formatLastSync,
 getStoredStorageMode,
 getStoredSyncSourceMode,
 setStoredStorageMode,
 setStoredSyncSourceMode,
 toStorageIdentity,
 type StorageMode,
 type SyncSourceMode,
} from "../services/analyticsRuntime"
import {
 getMasterColumnVisibilityRule,
 getVideoMetricRuntimeStatus,
} from "../services/analyticsCapabilityMatrix"
import {
 evaluateToolCapabilityStatus,
} from "../services/youtube/apiCapabilityRegistry"
import { PerformanceHubChartRollout } from "./performanceHub40/PerformanceHubChartRollout"
import IntelligenceHub from "../components/IntelligenceHub/IntelligenceHub"

type PerformanceTool =
 | "intelligence-lab"
 | "master-tables"
 | "channel"
type DataSource = "csv" | "api" | "hybrid"
type TrafficDatasetMode =
 | "all"
 | "youtube_traffic"
 | "external"
 | "suggested_videos"
 | "youtube_search"

type DailyPoint = {
 label: string
 views: number
 watchHours: number
 subscribers: number
 revenue: number
 ctr: number
 likes: number
}

type FormatPoint = {
 format: string
 views: number
}

type TopRow = {
 title: string
 views: number
 likes: number
 tag: string
}

type EngagementMapPoint = {
 index: number
 label: string
 videoId: string
 title: string
 views: number
 ctr: number
 retention: number
 format: "shorts" | "long-form"
 likes: number
 comments: number
 shares: number
 subscribers: number
}

type EngagementSortMetric = "comments" | "subscribers" | "shares" | "likes"
const ENGAGEMENT_METRICS: EngagementSortMetric[] = [
 "comments",
 "subscribers",
 "shares",
 "likes",
]

type EngagementHoverState = {
 index: number
 videoId: string
 title: string
 comments: number
 subscribers: number
 shares: number
 likes: number
}

type ValueMatrixThresholds = {
 ctr: number
 retention: number
}

type RailTransitionState = {
 current: EngagementHoverState | null
 previous: EngagementHoverState | null
 fading: boolean
}

type FormatMetricDistribution = {
 id: string
 label: string
 total: number
 shorts: number
 longForm: number
 unit: "number" | "hours" | "currency"
}

type TopPerformerDonut = {
 id: string
 label: string
 unit: "number" | "hours" | "currency"
 slices: Array<{
  label: string
  fullTitle: string
  value: number
 }>
 highestTitle: string
 highestValue: number
}

type TableDatasetId =
 | "master"
 | "daily"
 | "traffic"
 | "audience"
 | "country"
 | "device"
type TableRow = UnifiedRow | MasterTableRow

type MetricApplicabilityRule = "all" | "shorts-only" | "long-only"

type TableDatasetContract = {
 id: TableDatasetId
 label: string
 supportsTagFilter: boolean
 columns: string[]
}

const ULTIMATE_REPORT_EVENT = "vt_generate_ultimate_report"

const TABLE_DATASET_CONTRACTS: Record<TableDatasetId, TableDatasetContract> = {
 master: {
  id: "master",
  label: "Master Video Table",
  supportsTagFilter: true,
  columns: [
   "Video title",
   "Video ID",
   "Upload date",
   "Length",
   "Format",
   ...MASTER_VIDEO_TABLE_HEADERS,
  ],
 },
 daily: {
  id: "daily",
  label: "Daily Metrics",
  supportsTagFilter: false,
  columns: [
   "Date",
   "Views",
   "Watch time (hours)",
   "Average view duration",
   "Average percentage viewed (%)",
   "Engaged views",
   "Impressions",
   "Impressions click-through rate (%)",
   "Likes",
   "Comments",
   "Shares",
   "Subscribers gained",
   "Subscribers lost",
   "Estimated revenue (USD)",
   "Ad Impressions",
   "Monetized Playbacks",
   "CPM",
   "RPM",
  ],
 },
 traffic: {
  id: "traffic",
  label: "Traffic Sources",
  supportsTagFilter: false,
  columns: [
   "Traffic source",
   "Source type",
   "Source title",
   "Viewer %",
   "Views",
   "Watch Hrs",
   "Watch time (hours)",
   "Engaged views",
   "Average view duration",
   "Average percentage viewed (%)",
   "Impressions",
   "Impressions click-through rate (%)",
   "Playlist watch time (hours)",
   "Views from playlist",
   "Views per playlist start",
   "YouTube Premium views",
   "YouTube Premium watch time (hours)",
  ],
 },
 audience: {
  id: "audience",
  label: "Audience",
  supportsTagFilter: false,
  columns: [
   "Viewer age",
   "Viewer gender",
   "Views (%)",
   "Watch time (hours) (%)",
  ],
 },
 country: {
  id: "country",
  label: "Geography",
  supportsTagFilter: false,
  columns: [
   "Country",
   "Viewer %",
   "Views",
   "Watch Hrs",
   "Engaged views",
   "Average view duration",
   "Average percentage viewed (%)",
   "Stayed to watch (%)",
   "Subscribers gained",
   "Subscribers lost",
   "Subscribers",
   "Likes",
   "Dislikes",
   "Shares",
   "Comments added",
   "Estimated revenue (USD)",
  ],
 },
 device: {
  id: "device",
  label: "Audience Devices",
  supportsTagFilter: false,
  columns: [
   "Device type",
   "Viewer %",
   "Views",
   "Watch Hrs",
   "Subscribers Gained",
   "Revenue",
  ],
 },
}

const MASTER_HEADER_TO_CANONICAL: Partial<Record<string, CanonicalMetricKey>> = {
 Views: "views",
 "Watch Hrs": "watchHours",
 Revenue: "revenue",
 "Subs +": "subscribersGained",
 "Subs -": "subscribersLost",
 "Likes +": "likes",
 "Likes -": "dislikes",
 Comments: "comments",
 Shares: "shares",
 Engaged: "engagedViews",
 CPM: "cpm",
 RPM: "rpm",
 AVD: "avdSeconds",
 "AVP %": "avp",
 CTR: "ctr",
 "CTR %": "ctr",
 Impressions: "impressions",
 "STW %": "stw",
 "End Screen %": "endScreenClickRate",
 "ES Clicks": "endScreenClicks",
 "ES Impr": "endScreenImpressions",
 "Card %": "cardClickRate",
 "Teaser %": "cardTeaserClickRate",
 "Teaser Clicks": "cardTeaserClicks",
 "Teaser Impr": "cardTeaserImpressions",
 "Ann Impr": "annotationImpressions",
 "Ann Click Impr": "annotationClickableImpressions",
 "Ann Close Impr": "annotationClosableImpressions",
 "Ann Clicks": "annotationClicks",
 "Ann Closes": "annotationCloses",
 "Red Hrs": "redWatchHours",
 "Estimated Ad Revenue": "estimatedAdRevenue",
 "Gross Revenue": "grossRevenue",
 "Playback Based CPM": "playbackBasedCpm",
 "Ad Impressions": "adImpressions",
 "Monetized Playbacks": "monetizedPlaybacks",
 "Estimated Premium Revenue": "estimatedPremiumRevenue",
 "End screen element clicks": "endScreenElementClicks",
 "End screen elements shown": "endScreenElementsShown",
 "Clicks per end screen element shown (%)": "clicksPerEndScreenElementShown",
 "Card clicks": "cardClicks",
 "Cards shown": "cardsShown",
 "Clicks per card shown (%)": "clicksPerCardShown",
 Hypes: "hypes",
 "Hype points": "hypePoints",
 "Remix count": "remixCount",
 "Remixes of Your Content": "remixesOfYourContent",
 "Remix views": "remixViews",
 "Shorts Funnel Percent Watched": "shortsFunnelPercentWatched",
 "Shorts Funnel Swipe Away Rate": "shortsFunnelSwipeAwayRate",
}

const metricCellToProvenance = (
 cell: MetricCell | undefined,
): "API" | "CSV" | "Derived" | "Unavailable" => {
 if (!cell || cell.status === "unavailable") return "Unavailable"
 if (cell.status === "derived") return "Derived"
 if (cell.source === "csv_table") return "CSV"
 if (cell.source === "api") return "API"
 if (cell.source === "hybrid") return "Derived"
 return "Unavailable"
}

const METRIC_APPLICABILITY_RULES: Record<string, MetricApplicabilityRule> = {
 "STW %": "shorts-only",
 "End Screen %": "long-only",
 "Card %": "long-only",
}

const MASTER_ALWAYS_VISIBLE_HEADERS = new Set<string>([
 "Impressions",
 "CTR %",
 "STW %",
])

const HEADER_LABELS: Record<string, string> = {
 "Video title": "Title",
 videoTitle: "Title",
 "Video ID": "Video ID",
 videoId: "Video ID",
 video: "Video ID",
 Dimension: "Dimension",
 Length: "Length",
 Format: "Format",
 "Upload date": "Date",
 uploadedAt: "Date",
 Date: "Date",
 "Video publish time": "Date",
 day: "Date",
 "Duration (sec)": "Length",
 durationSeconds: "Length",
 Type: "Type",
 titleLength: "Title Len",
 Views: "Views",
 viewCount: "Views",
 "Subs +": "Subs +",
 "Subs -": "Subs -",
 Impressions: "Impressions",
 impressions: "Impressions",
 CPM: "CPM",
 cpm: "CPM",
 "CPM (USD)": "CPM",
 RPM: "RPM",
 rpm: "RPM",
 "RPM (USD)": "RPM",
 "Click-Through Rate (CTR)": "CTR %",
 "CTR (%)": "CTR %",
 "CTR %": "CTR %",
 ctr: "CTR %",
 "Impressions click-through rate (%)": "CTR %",
 impressionClickThroughRate: "CTR %",
 clickThroughRate: "CTR %",
 "AVD (Average View Duration)": "AVD",
 "Average view duration": "AVD",
 averageViewDuration: "AVD",
 "STW %": "STW %",
 "Stayed to watch (%)": "STW %",
 stayedToWatch: "STW %",
 "End screen click rate": "End Screen %",
 "Clicks per end screen element shown (%)": "End Screen %",
 clicksPerEndScreenElementShown: "End Screen %",
 "Card click rate": "Card %",
 cardClickRate: "Card %",
 "Casual viewers": "Casual",
 "Casual Viewers": "Casual",
 casualViewers: "Casual",
 "Regular viewers": "Regular",
 "Regular Viewers": "Regular",
 regularViewers: "Regular",
 "Unique viewers": "Unique",
 "Unique Viewers": "Unique",
 uniqueViewers: "Unique",
 "Engaged views": "Engaged",
 engagedViews: "Engaged",
 "Engagement Rate": "Eng Rate",
 "Watch Time (Hours)": "Watch Hrs",
 "Watch time (hours)": "Watch Hrs",
 estimatedMinutesWatched: "Watch Hrs",
 "Estimated minutes watched": "Watch Min",
 "AVD (Sec)": "AVD",
 "AVP (%)": "AVP %",
 "Average percentage viewed (%)": "AVP %",
 averageViewPercentage: "AVP %",
 adjustedAVP: "Adj AVP",
 "Subscribers Gained": "Subs +",
 "Subscribers Lost": "Subs -",
 Subscribers: "Subscribers",
 subscribersGained: "Subs +",
 subscribersLost: "Subs -",
 newViewers: "New",
 returningViewers: "Returning",
 "New Viewers": "New",
 "New viewers": "New",
 "Returning Viewers": "Returning",
 "Returning viewers": "Returning",
 Likes: "Likes +",
 likeCount: "Likes +",
 Dislikes: "Likes -",
 dislikeCount: "Likes -",
 Comments: "Comments",
 commentCount: "Comments",
 Shares: "Shares",
 shareCount: "Shares",
 Revenue: "Revenue",
 "Estimated revenue": "Revenue",
 "Estimated revenue (USD)": "Revenue",
 "Your estimated revenue (USD)": "Revenue",
 estimatedRevenue: "Revenue",
 estimatedRevenuePer1000Views: "RPM",
 "Traffic source": "Traffic",
 insightTrafficSourceType: "Traffic",
 Country: "Country",
 "Device type": "Device",
 "Viewer percentage": "Viewer %",
 viewerPercentage: "Viewer %",
 ageGroup: "Age Group",
 gender: "Gender",
 "Data Provenance": "Data Src",
}

const IMPRESSIONS_CTR_METRICS = new Set([
 "videoThumbnailImpressions",
 "videoThumbnailImpressionsClickRate",
])

const toDisplayHeaderLabel = (header: string): string => {
 const short = getShortMasterHeader(header)
 if (short && short !== header) return short
 const direct = HEADER_LABELS[header]
 if (direct) return direct

 // Safe fallback for unknown keys (camelCase/snake_case/etc.)
 return header
  .replace(/_/g, " ")
  .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  .replace(/\s+/g, " ")
  .trim()
}

const verificationStatusLabel = (
 status: VideoStatsVerificationSummary["mappingStatus"],
): string => {
 if (status === "healthy") return "Healthy"
 if (status === "request_failure") return "Request Fail"
 if (status === "mapping_failure") return "Mapping Fail"
 return "Missing Upstream"
}

const CHART_COLORS = [
 "#00CCFF",
 "#CCFF00",
 "#FF7497",
 "#FFB158",
 "#B366FF",
 "#FFDD00",
]

const EXTENDED_CHART_COLORS = [
 "#00CCFF",
 "#CCFF00",
 "#FF7497",
 "#FFB158",
 "#FFDD00",
 "#B366FF",
 "#6BD8FF",
 "#E6FF75",
 "#FF95B1",
 "#FFC884",
]

const formatMetricDisplay = (
 value: number,
 unit: "number" | "hours" | "currency",
): string => {
 if (unit === "currency") return `$${value.toFixed(value >= 100 ? 0 : 2)}`
 if (unit === "hours") {
  if (value >= 1000) return `${Math.round(value).toLocaleString()}h`
  return `${value.toFixed(1)}h`
 }
 return Math.round(value).toLocaleString()
}

const formatDateAsMmDdYy = (value: unknown): string => {
 const raw = textFromUnknown(value)
 if (!raw || raw === "-") return raw || "-"
 const parsed = new Date(raw)
 if (Number.isNaN(parsed.getTime())) return raw
 const mm = String(parsed.getMonth() + 1).padStart(2, "0")
 const dd = String(parsed.getDate()).padStart(2, "0")
 const yy = String(parsed.getFullYear()).slice(-2)
 return `${mm}/${dd}/${yy}`
}

const formatNumberMax2 = (value: number): string => {
 if (!Number.isFinite(value)) return "-"
 if (Number.isInteger(value)) return value.toLocaleString()
 return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

const pickCtrPercent = (row: Record<string, unknown>): number => {
 const resolved = resolveCtrPercent(row)
 return resolved.value && Number.isFinite(resolved.value) ? resolved.value : 0
}

const pickRetentionPercent = (row: Record<string, unknown>): number => {
 const rawDirect = getAvpRawPercent(row)
 if (rawDirect && Number.isFinite(rawDirect) && rawDirect > 0) {
  return rawDirect
 }

 const direct = getAvpPercent(row)
 if (direct > 0 && Number.isFinite(direct)) return direct

 const aliases = [
  "AVP (%)",
  "AVP %",
  "Average percentage viewed",
  "averageViewPercentage",
  "averagePercentageViewed",
  "STW %",
  "Stayed to watch (%)",
  "stayedToWatch",
  "Retention",
  "retention",
 ]
 for (const key of aliases) {
  const raw = numberFromUnknown(row[key])
  if (Number.isFinite(raw) && raw > 0) return raw
 }
 return 0
}

const parseDurationSecondsFromUnknown = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value)
 const raw = textFromUnknown(value).trim()
 if (!raw) return 0
 if (raw.includes(":")) {
  const parts = raw.split(":").map((part) => Number(part) || 0)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
 }
 const parsed = Number(raw)
 return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

const inferValueMatrixFormat = (row: Record<string, unknown>): "shorts" | "long-form" => {
 const hints = [
  textFromUnknown(row["Format"] || ""),
  textFromUnknown(row["Type"] || ""),
  textFromUnknown(row["type"] || ""),
  textFromUnknown(row._userTag || ""),
 ].join(" ").toLowerCase()
 if (hints.includes("short")) return "shorts"
 if (hints.includes("long") || hints.includes("live") || hints.includes("story")) {
  return "long-form"
 }

 const durationSeconds = parseDurationSecondsFromUnknown(
  row["Duration"] || row["Length"] || row["Duration (sec)"] || row.durationSeconds,
 )
 if (durationSeconds > 0 && durationSeconds <= 70) return "shorts"
 return "long-form"
}

const VALUE_MATRIX_THRESHOLDS: ValueMatrixThresholds = {
 ctr: 5,
 retention: 75,
}

const UPLOAD_TYPE_OPTIONS: Array<{
 value: CsvUploadType
 label: string
 menuClass: string
}> = [
  { value: "auto", label: "Auto Detect", menuClass: "bg-white text-black" },
  { value: "long", label: "Long Format (Content)", menuClass: "bg-[#00CCFF] text-black" },
  { value: "traffic", label: "Traffic", menuClass: "bg-[#CCFF00] text-black" },
  { value: "combined", label: "Combined", menuClass: "bg-[#FFDD00] text-black" },
  { value: "audience", label: "Audience", menuClass: "bg-[#FFB158] text-black" },
  { value: "shorts", label: "Shorts (Content)", menuClass: "bg-[#FF7497] text-black" },
 { value: "geo", label: "Geo", menuClass: "bg-[#B14AED] text-white" },
 {
  value: "single_long_video",
  label: "Long Single",
  menuClass: "bg-[#00CCFF] text-black",
 },
 { value: "daily", label: "Daily", menuClass: "bg-[#CCFF00] text-black" },
 { value: "search", label: "Search", menuClass: "bg-[#FFDD00] text-black" },
 { value: "other", label: "Other", menuClass: "bg-[#FFB158] text-black" },
 {
  value: "single_short_video",
  label: "Short Single",
  menuClass: "bg-[#FF7497] text-black",
 },
]

const PerformanceHub: React.FC = () => {
 const brainContext = useBrain() as ReturnType<typeof useBrain> & {
  videoFlags?: Record<
   string,
   { excludeAnalysis?: boolean; includeOnly?: boolean; priorityAnalysis?: boolean }
  >
  setVideoFlags?: (
   videoId: string,
   patch: { excludeAnalysis?: boolean; includeOnly?: boolean; priorityAnalysis?: boolean },
  ) => void
 }
 const {
  brain,
  updateBrain,
  setResearchLabState,
  videoFlags,
  setVideoFlags,
  globalSyncData,
  isSyncing,
  lastSyncComplete,
  syncStatus,
  syncBatch,
 } = brainContext

 const [openTools, setOpenTools] = useState<Set<PerformanceTool>>(
  () => new Set<PerformanceTool>(["intelligence-lab", "master-tables"]),
 )
 const [analysisLoading, setAnalysisLoading] = useState(false)
 const [pipelineLogTick, setPipelineLogTick] = useState(0)
 const [syncSourceMode, setSyncSourceMode] = useState<SyncSourceMode>(
  getStoredSyncSourceMode(),
 )
 const [storageMode, setStorageMode] = useState<StorageMode>(getStoredStorageMode())
 const [analyticsWindow, setAnalyticsWindow] = useState<AnalyticsWindow>("lifetime")
 const [preUploadType, setPreUploadType] = useState<CsvUploadType>("auto")
 const [tableSearch, setTableSearch] = useState("")
 const [tableTag, setTableTag] = useState("all")
 const [tableDataset, setTableDataset] = useState<TableDatasetId>("master")
 const [trafficDatasetMode, setTrafficDatasetMode] =
  useState<TrafficDatasetMode>("all")
 const [tableColumnOrder, setTableColumnOrder] = useState<string[]>([])
 const [tableLimit, setTableLimit] = useState(500)
 const [sortColumn, setSortColumn] = useState<string | null>(null)
 const [sortDir, setSortDir] = useState<"desc" | "asc">("desc")
 const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(
  () => new Set(),
 )
 const [engagementSortMetric, setEngagementSortMetric] =
  useState<EngagementSortMetric>("comments")
 const [engagementVisibleMetrics, setEngagementVisibleMetrics] = useState<
  EngagementSortMetric[]
 >(["comments", "subscribers", "shares", "likes"])
 const [engagementHoverIndex, setEngagementHoverIndex] = useState(0)
 const [valueMatrixHoverVideoId, setValueMatrixHoverVideoId] = useState("")
 const [railTransition, setRailTransition] = useState<RailTransitionState>({
  current: null,
  previous: null,
  fading: false,
 })
 const [vizRenderTick, setVizRenderTick] = useState(0)
 const [dataVizAutoOpenTick, setDataVizAutoOpenTick] = useState(0)
 const [lineChartSize, setLineChartSize] = useState({ width: 0, height: 0 })
 const [barChartSize, setBarChartSize] = useState({ width: 0, height: 0 })
 const [uploadMenuOpen, setUploadMenuOpen] = useState(false)

 const fileInputRef = useRef<HTMLInputElement>(null)
 const lineChartRef = useRef<HTMLDivElement>(null)
 const barChartRef = useRef<HTMLDivElement>(null)
 const uploadMenuRef = useRef<HTMLDivElement>(null)

 const persistCachedUploadFiles = (nextFiles: CsvFileWithTag[]) => {
  localStorage.setItem(UPLOAD_CACHE_FILES_KEY, JSON.stringify(nextFiles))
  window.dispatchEvent(new Event("vt_upload_cache_updated"))
 }

 const storedCsvFiles = brain.channelyticsState.csvFiles || []
 const cachedUploadFiles = useMemo(() => {
  try {
   const parsed = JSON.parse(
    localStorage.getItem(UPLOAD_CACHE_FILES_KEY) || "[]",
   ) as CsvFileWithTag[]
   return Array.isArray(parsed) ? parsed : []
  } catch {
   return []
  }
 }, [lastSyncComplete])

 const csvFiles = useMemo(() => {
  if (storageMode === "sync") return cachedUploadFiles
  if (storageMode === "storage") return storedCsvFiles
  const seen = new Set<string>()
  return [...storedCsvFiles, ...cachedUploadFiles].filter((file) => {
   const key = `${file.id}-${file.name}`
   if (seen.has(key)) return false
   seen.add(key)
   return true
  })
 }, [storageMode, storedCsvFiles, cachedUploadFiles])

 const dataSource: DataSource =
  syncSourceMode === "api_analytics"
   ? "api"
   : syncSourceMode === "uploads"
    ? "csv"
    : "hybrid"
 const csvRows = useMemo(() => flattenCsvRows(csvFiles), [csvFiles])

 const canonicalApiRows = useMemo(
  () => getMasterRows(analyticsWindow, "api"),
  [lastSyncComplete, analyticsWindow],
 )
 const canonicalMasterRows = useMemo(
  () => getMasterRows(analyticsWindow, dataSource, csvFiles),
  [lastSyncComplete, analyticsWindow, dataSource, csvFiles],
 )
 const effectiveCanonicalRows = useMemo(
  () => applyGlobalRowFilters(canonicalMasterRows).rows,
  [canonicalMasterRows],
 )
 const masterTableRows = useMemo(
  () => canonicalRowsToMasterTableRows(canonicalMasterRows),
  [canonicalMasterRows],
 )
 const selectedMetricSummary = useMemo(
  () => getMetricSummary(analyticsWindow, dataSource, csvFiles),
  [lastSyncComplete, analyticsWindow, dataSource, csvFiles],
 )
 const apiRows = useMemo(() => {
  const canonicalRows = canonicalRowsToMasterTableRows(canonicalApiRows)
  return canonicalRows as unknown as UnifiedRow[]
 }, [canonicalApiRows])

 const unifiedRows = useMemo(() => {
  if (dataSource === "csv") return csvRows
  if (dataSource === "api") return apiRows
  // "hybrid" / "both" mode: if no CSVs, just use API data
  if (csvRows.length === 0) return apiRows
  if (apiRows.length === 0) return csvRows
  return mergeAndDedupeRows([...csvRows, ...apiRows]) as UnifiedRow[]
 }, [dataSource, csvRows, apiRows])
 const filteredUnifiedRows = useMemo(() => {
  if (effectiveCanonicalRows.length === 0) return unifiedRows
  const allowed = new Set<string>()
  effectiveCanonicalRows.forEach((row) => {
   const idKey = toStorageIdentity(row.videoId || "")
   const titleKey = toStorageIdentity(row.title || "")
   if (idKey) allowed.add(idKey)
   if (titleKey) allowed.add(titleKey)
  })
  return unifiedRows.filter((row, index) => {
   const identity = toStorageIdentity(
    textFromUnknown(
     row["Video ID"] ||
      row.videoId ||
      row.Content ||
      row.content ||
      row.Dimension ||
      getTitle(row, index),
    ),
   )
   if (!identity) return true
   return allowed.has(identity)
  })
 }, [unifiedRows, effectiveCanonicalRows])

 const analyticsResult = brain.channelyticsState.analyticsResult
 const selectedUploadType =
  UPLOAD_TYPE_OPTIONS.find((option) => option.value === preUploadType) ||
  UPLOAD_TYPE_OPTIONS[0]
 const selectedWindowLabel =
  analyticsWindow === "lifetime" ? "Lifetime" : analyticsWindow.toUpperCase()

 const analyticsGroupStatus = useMemo<
  Array<{ key: string; ok: boolean; metrics: string[]; error?: string }>
 >(() => {
  const cache = readYouTubeAnalyticsCache() as {
   analyticsByWindow?: Record<
    AnalyticsWindow,
    { groups?: Record<string, { ok?: boolean; metrics?: string[]; error?: string }> }
   >
  }
  const groups = cache.analyticsByWindow?.[analyticsWindow]?.groups || {}
  return Object.entries(groups).map(([key, group]) => ({
   key,
   ok: group?.ok === true,
   metrics: Array.isArray(group?.metrics) ? group.metrics : [],
   error: group?.error,
  }))
 }, [lastSyncComplete, analyticsWindow, pipelineLogTick, readYouTubeAnalyticsCache])

 const analyticsSyncDiagnostics = useMemo(() => {
  const cache = readYouTubeAnalyticsCache() as {
   analyticsByWindow?: Record<
    AnalyticsWindow,
    {
     syncDiagnostics?: {
      disabledMetrics?: string[]
      failureReasons?: Array<{
       group?: string
       metrics?: string[]
       status?: number
       reason?: string
       requestClass?: string
       attemptedShape?: {
        dimensions?: string
        includesSort?: boolean
        includesStartIndex?: boolean
        includesMaxResults?: boolean
        includeContentType?: boolean
       }
       outcome?:
        | "failed"
        | "split_retry"
        | "suppressed"
        | "quarantined"
        | "fallback_succeeded"
      }>
      knownInvalidCombos?: string[]
     }
    }
   >
  }
 return cache.analyticsByWindow?.[analyticsWindow]?.syncDiagnostics || null
 }, [lastSyncComplete, analyticsWindow, pipelineLogTick, readYouTubeAnalyticsCache])

 const ultimateAutoContext = useMemo(() => {
  const topRows = effectiveCanonicalRows.slice(0, 12)
  const rowSummary = topRows
   .map((row, index) => {
    const title = textFromUnknown(row.title || row.videoId || `video-${index + 1}`)
    const views = getViews(row as unknown as UnifiedRow)
    const ctr = getCtr(row as unknown as UnifiedRow)
    const avp = getAvpPercent(row as unknown as UnifiedRow)
    return `${index + 1}. ${title} | views=${Math.round(views)} | ctr=${ctr.toFixed(2)} | avp=${avp.toFixed(2)}`
   })
   .join("\n")
  const metricSummary = selectedMetricSummary
   ? JSON.stringify(selectedMetricSummary).slice(0, 1800)
   : "none"
  const diagnosticsSummary = analyticsSyncDiagnostics
   ? JSON.stringify(analyticsSyncDiagnostics).slice(0, 1800)
   : "none"
  return [
   `Window: ${analyticsWindow}`,
   `Data source mode: ${dataSource}`,
   `Canonical rows: ${effectiveCanonicalRows.length}`,
   `CSV files: ${csvFiles.length}`,
   `Top canonical rows:\n${rowSummary}`,
   `Metric summary:\n${metricSummary}`,
   `Sync diagnostics:\n${diagnosticsSummary}`,
   "Generate a complete 14-block creator-focused channel analysis report with actionable recommendations.",
  ].join("\n\n")
 }, [
  effectiveCanonicalRows,
  selectedMetricSummary,
  analyticsSyncDiagnostics,
  analyticsWindow,
  dataSource,
  csvFiles.length,
 ])
 const ultimateDataSources = useMemo(() => {
  const sources = ["youtube-analytics-cache", "canonical-master-rows", "ultimate-report-engine"]
  if (csvFiles.length > 0) sources.push("csv-uploads")
  if (syncSourceMode === "api_analytics" || syncSourceMode === "both") sources.push("youtube-api")
  return sources
 }, [csvFiles.length, syncSourceMode])

 const creatorContentTypeDiagnostic = useMemo(() => {
  const cache = readYouTubeAnalyticsCache() as {
   videoContentTypeStatus?: {
    status?: "available" | "quarantined"
    disabledForSession?: boolean
    rowCount?: number
    reason?: string
   }
  }
  const status = cache.videoContentTypeStatus
  if (!status) return null
  if (status.status === "available" && Number(status.rowCount || 0) > 0) {
   return {
    status: "ok" as const,
    label: `Format Mapping: OK · ${Number(status.rowCount || 0)} videos tagged`,
   }
  }
  const reason =
   textFromUnknown(status.reason || "").slice(0, 140) ||
   "creatorContentType unavailable"
  return {
   status: "error" as const,
   label: `Format Mapping: Degraded · ${reason}`,
  }
 }, [lastSyncComplete, pipelineLogTick, readYouTubeAnalyticsCache])

const impressionsCtrDiagnostic = useMemo(() => {
 if (!analyticsSyncDiagnostics) return null
  const impressionsStatus = getVideoMetricRuntimeStatus(
   "videoThumbnailImpressions",
   analyticsSyncDiagnostics,
   {
    hasTargetVideoIds: effectiveCanonicalRows.length > 0,
   },
  )
  const ctrStatus = getVideoMetricRuntimeStatus(
   "videoThumbnailImpressionsClickRate",
   analyticsSyncDiagnostics,
   {
    hasTargetVideoIds: effectiveCanonicalRows.length > 0,
   },
  )
  const failures = (analyticsSyncDiagnostics.failureReasons || []).filter(
   (failure) =>
    failure?.group === "impressions_ctr" ||
    (failure?.metrics || []).some((metric) =>
     IMPRESSIONS_CTR_METRICS.has(metric),
    ),
  )
  if (failures.length === 0) {
   return {
    status: "ok" as const,
    label: "Impressions/CTR Sync: OK",
   }
  }
  if (
   impressionsStatus === "temporarily_unavailable_due_to_request_shape" ||
   ctrStatus === "temporarily_unavailable_due_to_request_shape"
  ) {
   return {
    status: "error" as const,
    label: "Impressions/CTR Sync: Temporarily unavailable due to top-videos request shape.",
   }
  }
  const last = failures[failures.length - 1]
  const code = last?.status ? `HTTP ${last.status}` : "API Error"
  const reason =
   textFromUnknown(last?.reason || "").slice(0, 180) || "Unknown error"
  return {
   status: "error" as const,
   label: `Impressions/CTR Sync: ${code} · ${reason}`,
 }
}, [analyticsSyncDiagnostics, effectiveCanonicalRows.length])

 const toolCapabilityHealth = useMemo(() => {
  const accountContext = "creator" as const
  const tools = [
   "performance-hub",
   "analytics-sync",
   "video-manager",
   "video-publisher",
   "channel",
  ]
  return tools.map((toolId) => ({
   toolId,
   status: evaluateToolCapabilityStatus(toolId, accountContext),
  }))
 }, [])

 useEffect(() => {
  setTableLimit(500)
 }, [tableSearch, tableTag, tableDataset, analyticsWindow])

 useEffect(() => {
  if (!openTools.has("channel-analysis")) return
  const timeoutId = window.setTimeout(() => {
   setVizRenderTick((value) => value + 1)
  }, 120)
  return () => window.clearTimeout(timeoutId)
 }, [openTools])

 useEffect(() => {
  if (!openTools.has("channel-analysis")) return

  const syncSize = (
   element: HTMLDivElement | null,
   setSize: React.Dispatch<
    React.SetStateAction<{ width: number; height: number }>
   >,
  ) => {
   if (!element) return () => undefined
   const update = () => {
    const nextWidth = Math.max(0, element.clientWidth - 8)
    const nextHeight = Math.max(0, element.clientHeight - 38)
    setSize({ width: nextWidth, height: nextHeight })
   }
   update()

   let observer: ResizeObserver | null = null
   if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(update)
    observer.observe(element)
   }
   window.addEventListener("resize", update)

   return () => {
    if (observer) observer.disconnect()
    window.removeEventListener("resize", update)
   }
  }

  const cleanupLine = syncSize(lineChartRef.current, setLineChartSize)
  const cleanupBar = syncSize(barChartRef.current, setBarChartSize)
  return () => {
   cleanupLine()
   cleanupBar()
  }
 }, [openTools, vizRenderTick])

 useEffect(() => {
  const handleSyncComplete = () => {
   setOpenTools(() => new Set<PerformanceTool>(["channel-analysis"]))
   setDataVizAutoOpenTick((value) => value + 1)
   setVizRenderTick((value) => value + 1)
  }
  window.addEventListener("yt_analytics_synced", handleSyncComplete as EventListener)
  return () =>
   window.removeEventListener(
    "yt_analytics_synced",
    handleSyncComplete as EventListener,
   )
 }, [])

 useEffect(() => {
  if (!uploadMenuOpen) return

  const handlePointerDown = (event: MouseEvent | TouchEvent) => {
   if (
    uploadMenuRef.current &&
    !uploadMenuRef.current.contains(event.target as Node)
   ) {
    setUploadMenuOpen(false)
   }
  }
  const handleEscape = (event: KeyboardEvent) => {
   if (event.key === "Escape") setUploadMenuOpen(false)
  }

  document.addEventListener("mousedown", handlePointerDown)
  document.addEventListener("touchstart", handlePointerDown)
  window.addEventListener("keydown", handleEscape)
  return () => {
   document.removeEventListener("mousedown", handlePointerDown)
   document.removeEventListener("touchstart", handlePointerDown)
   window.removeEventListener("keydown", handleEscape)
  }
 }, [uploadMenuOpen])

 const setUnifiedCsvFiles = (nextFiles: CsvFileWithTag[]) => {
  updateBrain({
   channelyticsState: {
    ...brain.channelyticsState,
    csvFiles: nextFiles,
   },
  })
  setResearchLabState({ csvFiles: nextFiles })
 }

 const setUnifiedAnalysisResult = (nextResult: AnalyticsResult | null) => {
  updateBrain({
   channelyticsState: {
    ...brain.channelyticsState,
    analyticsResult: nextResult,
   },
  })
  setResearchLabState({ analyticsResult: nextResult })
 }

 const handleFileUpload = async (
  event: React.ChangeEvent<HTMLInputElement>,
 ) => {
  const files = event.target.files
  if (!files) return

  try {
   const { csvFiles: expanded } = await expandCsvAndZipFiles(Array.from(files))
   if (expanded.length === 0) return

   const tagged = await buildCsvFilesWithTags(expanded, preUploadType)
   if (storageMode === "storage" || storageMode === "both") {
    setUnifiedCsvFiles([...(brain.channelyticsState.csvFiles || []), ...tagged])
   }
  if (storageMode === "sync" || storageMode === "both") {
    persistCachedUploadFiles([...(cachedUploadFiles || []), ...tagged])
   }
  } finally {
   if (fileInputRef.current) fileInputRef.current.value = ""
  }
 }

 const clearFiles = () => {
  setUnifiedCsvFiles([])
  persistCachedUploadFiles([])
  setSelectedRowIds(new Set())
 }

 const removeFile = (id: string) => {
  const next = (brain.channelyticsState.csvFiles || []).filter(
   (file) => file.id !== id,
  )
  setUnifiedCsvFiles(next)
  persistCachedUploadFiles((cachedUploadFiles || []).filter((file) => file.id !== id))
 }

 const clearPipelineLogs = () => {
  const cache = readYouTubeAnalyticsCache() as any
  if (cache?.analyticsByWindow?.[analyticsWindow]) {
   if (cache.analyticsByWindow[analyticsWindow].groups) {
    delete cache.analyticsByWindow[analyticsWindow].groups
   }
   if (cache.analyticsByWindow[analyticsWindow].syncDiagnostics) {
    // Keep disabledMetrics as "truth", but drop noisy run events.
    cache.analyticsByWindow[analyticsWindow].syncDiagnostics.failureReasons = []
    cache.analyticsByWindow[analyticsWindow].syncDiagnostics.knownInvalidCombos = []
   }
  }
  writeYouTubeAnalyticsCache(cache)
  setPipelineLogTick((value) => value + 1)
 }

 const runAnalysis = async () => {
  if (!hasGeminiKey()) {
   alert("Gemini key missing. Open System -> Key Vault and save your Gemini API key.")
   return
  }
  setAnalysisLoading(true)
  try {
   setOpenTools((previous) => {
    const next = new Set(previous)
    next.add("intelligence-lab")
    return next
   })
   window.dispatchEvent(new Event(ULTIMATE_REPORT_EVENT))
  } finally {
   setAnalysisLoading(false)
  }
 }

 const stats = useMemo(() => {
  const averages = selectedMetricSummary.averages

  const views = Math.max(
   0,
   effectiveCanonicalRows.reduce((sum, row) => {
    const metric = row.metrics.views
    return sum + (metric.status === "unavailable" ? 0 : (metric.value || 0))
   }, 0),
  )
  const watchHours = Math.max(
   0,
   effectiveCanonicalRows.reduce((sum, row) => {
    const metric = row.metrics.watchHours
    return sum + (metric.status === "unavailable" ? 0 : (metric.value || 0))
   }, 0),
  )
  const subscribers = Math.max(
   0,
   effectiveCanonicalRows.reduce((sum, row) => {
    const metric = row.metrics.subscribersGained
    return sum + (metric.status === "unavailable" ? 0 : (metric.value || 0))
   }, 0),
  )
  const revenue = Math.max(
   0,
   effectiveCanonicalRows.reduce((sum, row) => {
    const metric = row.metrics.revenue
    return sum + (metric.status === "unavailable" ? 0 : (metric.value || 0))
   }, 0),
  )
  const rpmAverage =
   averages.rpm ??
   (views > 0 && revenue > 0 ? (revenue / views) * 1000 : 0)
  const ctrAverage = averages.ctr ?? 0

  return {
   views,
   watchHours,
   subscribers,
   revenue,
   rpmAverage,
   ctrAverage,
  }
 }, [selectedMetricSummary, effectiveCanonicalRows])

 const dailySeries = useMemo<DailyPoint[]>(() => {
  const map = new Map<
   string,
   DailyPoint & { ctrSum: number; ctrCount: number }
  >()

  filteredUnifiedRows.forEach((row) => {
   const dateText = getDateLabel(row)
   if (!dateText) return

   const key = dateText.slice(0, 10)
   const current = map.get(key) || {
    label: key,
    views: 0,
    watchHours: 0,
    subscribers: 0,
    revenue: 0,
    ctr: 0,
    likes: 0,
    ctrSum: 0,
    ctrCount: 0,
   }
   current.views += getViews(row)
   current.watchHours += getWatchHours(row)
   current.subscribers += getSubscribers(row)
   current.revenue += getRevenue(row)
   current.likes += getLikes(row)
   const ctr = getCtr(row)
   if (ctr > 0) {
    current.ctrSum += ctr
    current.ctrCount += 1
   }
   map.set(key, current)
  })

  if (map.size > 0) {
   return Array.from(map.values())
    .map((point) => ({
     label: point.label,
     views: point.views,
     watchHours: point.watchHours,
     subscribers: point.subscribers,
     revenue: point.revenue,
     ctr: point.ctrCount > 0 ? point.ctrSum / point.ctrCount : 0,
     likes: point.likes,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(-30)
  }

  if (dataSource === "csv") return []

  try {
   const cache = readYouTubeAnalyticsCache() as {
    dailyMetrics?: {
     columnHeaders?: Array<{ name?: string }>
     rows?: unknown[][]
    }
   }
   const headers = (cache.dailyMetrics?.columnHeaders || []).map((item) =>
    String(item.name ?? "").toLowerCase(),
   )
   const rows = cache.dailyMetrics?.rows || []
   if (!Array.isArray(rows) || rows.length === 0 || headers.length === 0)
    return []

   const dayIdx = headers.findIndex((h) => h === "day" || h === "date")
   const viewsIdx = headers.findIndex((h) => h === "views")
   const watchIdx = headers.findIndex(
    (h) => h === "estimatedminuteswatched" || h.includes("watch"),
   )
   const subsIdx = headers.findIndex((h) => h.includes("subscriber"))
   const revIdx = headers.findIndex((h) => h.includes("revenue"))
   const ctrIdx = headers.findIndex(
    (h) => h.includes("averageviewpercentage") || h.includes("clickthrough"),
   )

   return rows.map((rowValues, index) => {
    const getByIndex = (idx: number): unknown => {
     if (idx < 0) return undefined
     if (Array.isArray(rowValues)) return rowValues[idx]
     if (rowValues && typeof rowValues === "object") {
      const headerName = String(
       cache.dailyMetrics?.columnHeaders?.[idx]?.name || "",
      )
      return (rowValues as Record<string, unknown>)[headerName]
     }
     return undefined
    }
    const day = dayIdx >= 0 ? textFromUnknown(getByIndex(dayIdx)) : `P${index + 1}`
    const watchRaw = watchIdx >= 0 ? numberFromUnknown(getByIndex(watchIdx)) : 0
    const watchHours =
     headers[watchIdx] === "estimatedminuteswatched" ? watchRaw / 60 : watchRaw
    return {
     label: day || `P${index + 1}`,
     views: viewsIdx >= 0 ? numberFromUnknown(getByIndex(viewsIdx)) : 0,
     watchHours,
     subscribers: subsIdx >= 0 ? numberFromUnknown(getByIndex(subsIdx)) : 0,
     revenue: revIdx >= 0 ? numberFromUnknown(getByIndex(revIdx)) : 0,
     ctr: ctrIdx >= 0 ? numberFromUnknown(getByIndex(ctrIdx)) : 0,
     likes: 0,
    }
   })
  } catch {
   return []
  }
 }, [filteredUnifiedRows, dataSource])

 const dataWindowLabel = useMemo(() => {
  if (analyticsWindow === "lifetime") return ""

  const rowDates = filteredUnifiedRows
   .map((row) => parseDate(getDateLabel(row)))
   .filter((value): value is Date => value instanceof Date)

  if (rowDates.length > 0) return formatDateWindow(rowDates)

  const seriesDates = dailySeries
   .map((point) => parseDate(point.label))
   .filter((value): value is Date => value instanceof Date)

  return formatDateWindow(seriesDates)
 }, [analyticsWindow, filteredUnifiedRows, dailySeries])

 const formatSeries = useMemo<FormatPoint[]>(() => {
  const map = new Map<string, number>()
  filteredUnifiedRows.forEach((row) => {
   const tag = textFromUnknown(row._userTag || "unknown").toLowerCase()
   const label = tag || "unknown"
   map.set(label, (map.get(label) || 0) + getViews(row))
  })
  return Array.from(map.entries()).map(([format, views]) => ({ format, views }))
 }, [filteredUnifiedRows])

 const topRows = useMemo<TopRow[]>(() => {
  return filteredUnifiedRows
   .map((row, index) => ({
    title: getTitle(row, index),
    views: getViews(row),
    likes: getLikes(row),
    tag: textFromUnknown(row._userTag || "unknown"),
   }))
   .sort((a, b) => b.views - a.views)
   .slice(0, 20)
 }, [filteredUnifiedRows])

 const engagementMapSeries = useMemo<EngagementMapPoint[]>(() => {
  const recent = [...filteredUnifiedRows]
   .sort((a, b) => {
    const aTs = parseDate(getDateLabel(a))?.getTime() || 0
    const bTs = parseDate(getDateLabel(b))?.getTime() || 0
    return bTs - aTs
   })
   .slice(0, 50)
   .map((row, index) => {
    const formatValue = textFromUnknown(
     row["Format"] || row["Type"] || row["type"] || row._userTag || "",
    ).toLowerCase()
    return {
     index,
     label: `${index + 1}`,
     videoId: toStorageIdentity(
      textFromUnknown(row["Video ID"] || row.videoId || row.Dimension || getTitle(row, index)),
     ),
     title: getTitle(row, index),
     views: getViews(row),
     ctr: pickCtrPercent(row),
     retention: pickRetentionPercent(row),
     format: formatValue.includes("short") ? "shorts" : "long-form",
     likes: getLikes(row),
     comments: getComments(row),
     shares: getShares(row),
     subscribers: Math.max(0, Math.round(getSubscribers(row))),
    } satisfies EngagementMapPoint
   })

  const sorted = [...recent].sort(
   (a, b) => b[engagementSortMetric] - a[engagementSortMetric],
  )
  return sorted.map((row, index) => ({
   ...row,
   index,
   label: `${index + 1}`,
  }))
 }, [filteredUnifiedRows, engagementSortMetric])

 const activeEngagementPoint = useMemo<EngagementMapPoint | null>(() => {
  if (engagementMapSeries.length === 0) return null
  const safeIndex = Math.max(
   0,
   Math.min(engagementHoverIndex, engagementMapSeries.length - 1),
  )
  return engagementMapSeries[safeIndex] || engagementMapSeries[0]
 }, [engagementMapSeries, engagementHoverIndex])

 const engagementHoverState = useMemo<EngagementHoverState | null>(() => {
  if (!activeEngagementPoint) return null
  return {
   index: activeEngagementPoint.index,
   videoId: activeEngagementPoint.videoId,
   title: activeEngagementPoint.title,
   comments: activeEngagementPoint.comments,
   subscribers: activeEngagementPoint.subscribers,
   shares: activeEngagementPoint.shares,
   likes: activeEngagementPoint.likes,
  }
 }, [activeEngagementPoint])

 const valueMatrixSeries = useMemo(
  () =>
   filteredUnifiedRows
    .map((row, index) => {
     const ctr = pickCtrPercent(row)
     const retention = pickRetentionPercent(row)
     const views = getViews(row)
     return {
      index,
      label: `${index + 1}`,
      videoId: toStorageIdentity(
       textFromUnknown(
        row["Video ID"] ||
         row.videoId ||
         row.Content ||
         row.content ||
         row.Dimension ||
         getTitle(row, index),
       ),
      ),
      title: getTitle(row, index),
      ctr: Number.isFinite(ctr) ? Math.max(0, Math.min(10, ctr)) : 0,
      retention: Number.isFinite(retention)
       ? Math.max(0, Math.min(150, retention))
       : 0,
      views: Number.isFinite(views) ? Math.max(0, Math.round(views)) : 0,
      format: inferValueMatrixFormat(row),
      likes: getLikes(row),
      comments: getComments(row),
      shares: getShares(row),
      subscribers: Math.max(0, Math.round(getSubscribers(row))),
     } satisfies EngagementMapPoint
    })
    // Exact-only gate for matrix: must have all core metrics.
    .filter((row) => row.ctr > 0 && row.retention > 0 && row.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 300),
  [filteredUnifiedRows],
 )

 const valueMatrixMissingSummary = useMemo(() => {
  const missing = new Set<string>()
  let validRows = 0
  filteredUnifiedRows.forEach((row) => {
   const views = getViews(row)
   const ctrResolved = resolveCtrPercent(row)
   const retention = pickRetentionPercent(row)
   const impressionsResolved = resolveImpressions(row)
   if (views > 0 && ctrResolved.value && ctrResolved.value > 0 && retention > 0) {
    validRows += 1
   } else {
    if (!(views > 0)) missing.add("views")
    if (!(ctrResolved.value && ctrResolved.value > 0)) missing.add("ctr_percent")
    if (!(retention > 0)) missing.add("retention_percent")
   }

   if (!(impressionsResolved.value && impressionsResolved.value > 0)) {
    missing.add("impressions")
   }
  })
  return {
    validRows,
    missingMetrics: Array.from(missing).sort(),
  }
 }, [filteredUnifiedRows])

 const activeValueMatrixPoint = useMemo(() => {
  if (valueMatrixSeries.length === 0) return null
  const selected = valueMatrixSeries.find(
   (row) => row.videoId === valueMatrixHoverVideoId,
  )
  return selected || valueMatrixSeries[0]
 }, [valueMatrixSeries, valueMatrixHoverVideoId])

 useEffect(() => {
  if (valueMatrixSeries.length === 0) return
  setValueMatrixHoverVideoId((previous) => {
   if (previous && valueMatrixSeries.some((row) => row.videoId === previous)) {
    return previous
   }
   return valueMatrixSeries[0].videoId
  })
 }, [valueMatrixSeries])

 useEffect(() => {
  if (engagementMapSeries.length === 0) return
  setEngagementHoverIndex((previous) =>
   Math.max(0, Math.min(previous, engagementMapSeries.length - 1)),
  )
 }, [engagementMapSeries])

 useEffect(() => {
  if (engagementMapSeries.length === 0) {
   setEngagementVisibleMetrics(ENGAGEMENT_METRICS)
   return
  }

  const timeouts: number[] = []
  const selected = engagementSortMetric
  const leftMost = engagementMapSeries[0]
  const revealQueue = ENGAGEMENT_METRICS.filter((metric) => metric !== selected).sort(
   (a, b) => {
    const aValue = leftMost?.[a] ?? 0
    const bValue = leftMost?.[b] ?? 0
    return aValue - bValue
   },
  )

  setEngagementVisibleMetrics([selected])

  timeouts.push(
   window.setTimeout(() => {
    setEngagementVisibleMetrics([selected, revealQueue[0]].filter(Boolean) as EngagementSortMetric[])
   }, 4000),
  )
  timeouts.push(
   window.setTimeout(() => {
    setEngagementVisibleMetrics(
     [selected, revealQueue[0], revealQueue[1]].filter(Boolean) as EngagementSortMetric[],
    )
   }, 5000),
  )
  timeouts.push(
   window.setTimeout(() => {
    setEngagementVisibleMetrics(
     [selected, revealQueue[0], revealQueue[1], revealQueue[2]].filter(Boolean) as EngagementSortMetric[],
    )
   }, 6000),
  )

  return () => {
   timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId))
  }
 }, [engagementMapSeries, engagementSortMetric])

 useEffect(() => {
  if (!engagementHoverState) return
  setRailTransition((previous) => {
   const isSame =
    previous.current?.videoId &&
    engagementHoverState.videoId &&
    previous.current.videoId === engagementHoverState.videoId
   if (isSame) {
    return {
     ...previous,
     current: engagementHoverState,
     previous: null,
     fading: false,
    }
   }
   return {
    current: engagementHoverState,
    previous: previous.current,
    fading: true,
   }
  })
  const timeoutId = window.setTimeout(() => {
   setRailTransition((previous) => ({
    ...previous,
    previous: null,
    fading: false,
   }))
  }, 220)
  return () => window.clearTimeout(timeoutId)
 }, [engagementHoverState])

 const latestTrendsDistributions = useMemo<FormatMetricDistribution[]>(() => {
  const seed: Record<
   string,
   Omit<FormatMetricDistribution, "id" | "label" | "unit">
  > = {
   views: { total: 0, shorts: 0, longForm: 0 },
   watchHours: { total: 0, shorts: 0, longForm: 0 },
   revenue: { total: 0, shorts: 0, longForm: 0 },
   subscribers: { total: 0, shorts: 0, longForm: 0 },
   likes: { total: 0, shorts: 0, longForm: 0 },
   comments: { total: 0, shorts: 0, longForm: 0 },
   shares: { total: 0, shorts: 0, longForm: 0 },
  }

  filteredUnifiedRows.forEach((row) => {
   const format = textFromUnknown(
    row["Format"] || row["Type"] || row["type"] || row._userTag || "",
   ).toLowerCase()
   const isShort = format.includes("short")
   const bucket = isShort ? "shorts" : "longForm"

   const metrics = {
    views: getViews(row),
    watchHours: getWatchHours(row),
    revenue: getRevenue(row),
    subscribers: Math.max(0, getSubscribers(row)),
    likes: getLikes(row),
    comments: getComments(row),
    shares: getShares(row),
   } as const

   ;(Object.keys(metrics) as Array<keyof typeof metrics>).forEach((metricKey) => {
    const value = Math.max(0, metrics[metricKey])
    seed[metricKey].total += value
    seed[metricKey][bucket] += value
   })
  })

  return [
   {
    id: "views",
    label: "Views",
    unit: "number",
    ...seed.views,
   },
   {
    id: "watchHours",
    label: "Watch Time",
    unit: "hours",
    ...seed.watchHours,
   },
   {
    id: "revenue",
    label: "Revenue",
    unit: "currency",
    ...seed.revenue,
   },
   {
    id: "subscribers",
    label: "Subs",
    unit: "number",
    ...seed.subscribers,
   },
   {
    id: "likes",
    label: "Likes",
    unit: "number",
    ...seed.likes,
   },
   {
    id: "comments",
    label: "Comments",
    unit: "number",
    ...seed.comments,
   },
   {
    id: "shares",
    label: "Shares",
    unit: "number",
    ...seed.shares,
   },
  ]
 }, [filteredUnifiedRows])

 const topPerformersTrio = useMemo<TopPerformerDonut[]>(() => {
  const formatTitle = (title: string) =>
   title.length > 34 ? `${title.slice(0, 34)}...` : title

  const buildDonut = (
   id: string,
   label: string,
   unit: TopPerformerDonut["unit"],
   getter: (row: UnifiedRow) => number,
  ): TopPerformerDonut => {
   const ranked = [...filteredUnifiedRows]
    .map((row, index) => ({
     fullTitle: getTitle(row, index),
     value: Math.max(0, getter(row)),
    }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

   const slices = ranked.map((entry) => ({
    label: formatTitle(entry.fullTitle),
    fullTitle: entry.fullTitle,
    value: entry.value,
   }))

   const leader = ranked[0]
   return {
    id,
    label,
    unit,
    slices,
    highestTitle: leader?.fullTitle || "No data yet",
    highestValue: leader?.value || 0,
   }
  }

 return [
  buildDonut("revenue", "Revenue", "currency", (row) => getRevenue(row)),
  buildDonut("watchHours", "Watch Hours", "hours", (row) => getWatchHours(row)),
  buildDonut("subscribers", "Subs", "number", (row) => getSubscribers(row)),
 ]
}, [filteredUnifiedRows])

 const algorithmTriggerSeries = useMemo(
  () =>
   filteredUnifiedRows
    .map((row, index) => {
     const views = getViews(row)
     const impressions = getImpressions(row)
     const ctr = getCtr(row)
     const trigger = impressions > 0 ? (views / impressions) * 100 : ctr
     return {
      title: getTitle(row, index),
      trigger: Number.isFinite(trigger) ? trigger : 0,
      ctr,
      views,
     }
    })
    .filter((row) => row.views > 0)
    .slice(0, 100),
  [filteredUnifiedRows],
 )

 const titleLengthCtrSeries = useMemo(
  () =>
   filteredUnifiedRows
    .map((row, index) => {
     const title = getTitle(row, index)
     return {
      title,
      titleLength: title.length,
      ctr: getCtr(row),
      views: getViews(row),
     }
    })
    .filter((row) => row.titleLength > 0 && row.ctr > 0)
    .slice(0, 120),
  [filteredUnifiedRows],
 )

 const viewerLoyaltySeries = useMemo(
  () =>
   dailySeries.map((point, index) => {
    const previous = dailySeries[index - 1]
    const returning = previous ? Math.max(0, previous.views * 0.42) : point.views * 0.35
    const newViewers = Math.max(0, point.views - returning)
    const avd = point.views > 0 ? (point.watchHours * 3600) / point.views : 0
    return {
     ...point,
     returning,
     newViewers,
     avd,
    }
   }),
  [dailySeries],
 )

 const publishTimeMomentumGrid = useMemo(() => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const buckets = ["0-3", "4-7", "8-11", "12-15", "16-19", "20-23"]
  const cellMap = new Map<string, { score: number; count: number }>()

  filteredUnifiedRows.forEach((row) => {
   const date = parseDate(getDateLabel(row))
   if (!date) return
   const day = date.getDay()
   const hour = date.getHours()
   const bucket = Math.floor(hour / 4)
   const key = `${day}-${bucket}`
   const score = getViews(row) * 0.6 + getLikes(row) * 3 + getComments(row) * 6
   const current = cellMap.get(key) || { score: 0, count: 0 }
   current.score += score
   current.count += 1
   cellMap.set(key, current)
  })

  const values: number[] = []
  const cells = days.flatMap((dayLabel, dayIdx) =>
   buckets.map((bucketLabel, bucketIdx) => {
    const key = `${dayIdx}-${bucketIdx}`
    const source = cellMap.get(key)
    const value = source && source.count > 0 ? source.score / source.count : 0
    values.push(value)
    return {
     day: dayLabel,
     bucket: bucketLabel,
     value,
    }
   }),
  )
  const max = Math.max(1, ...values)
  return { cells, max, days, buckets }
 }, [filteredUnifiedRows])

 const sourceSpecificRetentionSeries = useMemo(() => {
  const sourceMap = new Map<string, { retention: number; ctr: number; count: number }>()
  filteredUnifiedRows.forEach((row) => {
   const source = textFromUnknown(
    row["Traffic source"] || row.insightTrafficSourceType || row["Source mode"] || "Other",
   )
   const key = source || "Other"
   const current = sourceMap.get(key) || { retention: 0, ctr: 0, count: 0 }
   current.retention += Math.max(0, getAvpPercent(row))
   current.ctr += Math.max(0, getCtr(row))
   current.count += 1
   sourceMap.set(key, current)
  })
  return Array.from(sourceMap.entries())
   .map(([source, stats]) => ({
    source,
    retention: stats.count > 0 ? stats.retention / stats.count : 0,
    ctr: stats.count > 0 ? stats.ctr / stats.count : 0,
   }))
   .sort((a, b) => b.retention - a.retention)
   .slice(0, 6)
 }, [filteredUnifiedRows])

 const interactionDensitySeries = useMemo(() => {
  return topRows.slice(0, 12).map((row) => {
   const source = filteredUnifiedRows.find((r, idx) => getTitle(r, idx) === row.title)
   const views = Math.max(1, source ? getViews(source) : row.views)
   const likesPer1K = ((source ? getLikes(source) : row.likes) / views) * 1000
   const commentsPer1K = (source ? getComments(source) / views : 0) * 1000
   const subsPer1K = (source ? getSubscribers(source) / views : 0) * 1000
   return {
    title: row.title.length > 20 ? `${row.title.slice(0, 20)}...` : row.title,
    likesPer1K,
    commentsPer1K,
    subsPer1K,
   }
  })
 }, [topRows, filteredUnifiedRows])

 const topViewsSeries = useMemo(
  () =>
   topRows.slice(0, 10).map((row, index) => ({
    rank: `#${index + 1}`,
    title: row.title.length > 24 ? `${row.title.slice(0, 24)}...` : row.title,
    views: row.views,
   })),
  [topRows],
 )

 const revenueByFormatSeries = useMemo(
  () =>
   formatSeries.map((series) => {
    const rowsForFormat = filteredUnifiedRows.filter(
     (row) =>
      textFromUnknown(row._userTag || "unknown").toLowerCase() ===
      series.format.toLowerCase(),
    )
    const revenue = rowsForFormat.reduce((sum, row) => sum + getRevenue(row), 0)
    const subscribers = rowsForFormat.reduce(
     (sum, row) => sum + getSubscribers(row),
     0,
    )
    return {
     format: series.format,
     revenue,
     subscribers,
     views: series.views,
    }
   }),
  [formatSeries, filteredUnifiedRows],
 )

 const engagementScatterSeries = useMemo(
  () =>
   filteredUnifiedRows
    .slice(0, 150)
    .map((row, index) => ({
     title: getTitle(row, index),
     views: getViews(row),
     likes: getLikes(row),
    }))
    .filter((row) => row.views > 0 || row.likes > 0),
  [filteredUnifiedRows],
 )

 const getNumericValue = (row: TableRow, header: string): number => {
  const metricCell = getHeaderMetricCell(row as Record<string, unknown>, header)
  if (metricCell?.value !== undefined && metricCell.value !== null) return metricCell.value
  
 if (header === "Views") return getViews(row)
 if (header === "Watch Hrs") return getWatchHours(row)
 if (header === "Revenue") return getRevenue(row)
 if (header === "Subs +") return getSubscribers(row)
 if (header === "Likes" || header === "Likes +") return getLikes(row)
 if (header === "Comments") return getComments(row)
 if (header === "Shares") return getShares(row)
 if (header === "Length" || header === "Duration")
  return numberFromUnknown(
   row["Length"] || row["Duration (sec)"] || row["durationSeconds"],
  )
  if (header === "AVD") return getAvdSeconds(row)
  
  return 0
 }

 const getTableCellValue = (
  row: TableRow,
  header: string,
  index: number,
  datasetId: TableDatasetId,
 ): string => {
 const formatValue = textFromUnknown(
  row["Format"] || row["Type"] || row["type"],
 ).toLowerCase()
 const isShortFormat = formatValue.includes("short")
 const hasCsvAnalytics = csvFiles.length > 0
 const applicability = METRIC_APPLICABILITY_RULES[header] || "all"
 if (datasetId === "master") {
  if (applicability === "shorts-only" && !isShortFormat) return "=="
  if (applicability === "long-only" && isShortFormat) return "=="
 }

 if (datasetId === "master" && header === "Impressions") {
  if (!hasCsvAnalytics) return "-"
  if (isShortFormat) return "=="
  const impressions = getImpressions(row)
  return impressions > 0 ? impressions.toLocaleString() : "-"
 }

 if (datasetId === "master" && (header === "CTR %" || header === "CTR")) {
  if (!hasCsvAnalytics) return "-"
  if (isShortFormat) return "=="
  const ctr = getCtr(row)
  return ctr > 0 ? `${ctr.toFixed(2)}%` : "-"
 }

 if (datasetId === "master" && header === "STW %") {
  if (!isShortFormat) return "=="
  const stw = getMetric(row, ["STW %", "Stayed to watch (%)"])
  return stw > 0 ? `${stw.toFixed(2)}%` : "-"
 }

  const metricCell = getHeaderMetricCell(row as Record<string, unknown>, header)
  if (metricCell) {
   if (metricCell.status === "unavailable" || metricCell.value === null) {
    return "-"
   }

   const value = metricCell.value
   const percentHeaders = new Set([
    "CTR %",
    "STW %",
    "End Screen %",
    "Card %",
    "Teaser %",
   ])
   if (percentHeaders.has(header)) return `${value.toFixed(2)}%`
   if (header === "AVP %") return `${Math.round(value)}%`

   if (header === "Revenue" || header === "Estimated revenue") {
    return `$${value.toFixed(2)}`
   }
   if (header === "CPM" || header === "RPM") {
    if (header === "CPM" && isShortFormat) return "-"
    return `$${value.toFixed(2)}`
   }
   if (
    header === "Watch Hrs" ||
    header === "Watch Time (Hours)" ||
    header === "Watch time (hours)"
   ) {
    return value.toFixed(2)
   }
   if (header === "Subs +" || header === "Subs -") {
    return Math.round(value).toLocaleString()
   }
   if (
    header === "AVD" ||
    header === "AVD (Average View Duration)" ||
    header === "AVD (Sec)"
   ) {
    const totalSec = Math.round(value)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    if (h > 0) {
     return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    }
    return `${m}:${String(s).padStart(2, "0")}`
   }

   return formatNumberMax2(value)
  }

  if (
   header === "Video title" ||
   header === "Video" ||
   header === "Dimension" ||
   header === "Title"
  )
   return getTitle(row, index)
  if (header === "Video ID")
   return textFromUnknown(
    firstDefined(row, ["Video ID", "Dimension", "videoId"]),
   )
  if (header === "Length" || header === "Duration") {
   const length = numberFromUnknown(
    row["Length"] || row["Duration (sec)"] || row["durationSeconds"],
   )
   if (length <= 0) return "-"
   const h = Math.floor(length / 3600)
   const m = Math.floor((length % 3600) / 60)
   const s = Math.round(length % 60)
   return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`
  }
  if (header === "Format")
   return textFromUnknown(row["Format"] || row["Type"] || row["type"] || "-")
  if (header === "Upload date") {
   const val = textFromUnknown(row["Upload date"] || row["Video publish time"] || row["Date"] || "-")
   return formatDateAsMmDdYy(val)
  }
  if (header === "Date" || header === "Day" || header === "Video publish time")
   return formatDateAsMmDdYy(getDateLabel(row))
  if (header === "Views") return getViews(row).toLocaleString()
  if (header === "Impressions") return getImpressions(row).toLocaleString()
  if (header === "Engaged" || header === "Engaged views")
   return getMetric(row, ["Engaged views", "Engaged Views"]).toLocaleString()
  if (header === "Likes" || header === "Likes +") return getLikes(row).toLocaleString()
  if (header === "Comments") return getComments(row).toLocaleString()
  if (header === "Shares") return getShares(row).toLocaleString()
  if (header === "Subs +")
   return Math.round(
    getMetric(row, ["Subs +", "Subscribers Gained", "Subscribers"]),
   ).toLocaleString()
  if (header === "CPM")
   return formatNumberMax2(getMetric(row, ["CPM", "CPM (USD)"]))
  if (header === "Duration (sec)") {
   const duration = numberFromUnknown(
    row["Duration (sec)"] || row["durationSeconds"] || row["Duration"],
   )
   return duration > 0 ? duration.toString() : "-"
  }
  if (header === "Type")
   return textFromUnknown(row["Type"] || row["type"] || "Unknown")
  if (header === "titleLength") {
   const title = getTitle(row, index)
   return title.length.toString()
  }
  if (header === "Engagement Rate") {
   const engagementRate = numberFromUnknown(
    row["Engagement Rate"] || row["engagementRate"],
   )
   return engagementRate > 0 ? engagementRate.toFixed(1) : "-"
  }
  if (header === "Engaged views" || header === "Engaged") {
   const engaged = numberFromUnknown(
    row["Engaged views"] || row["Engaged"] || row["engagedViews"],
   )
   return engaged > 0 ? engaged.toLocaleString() : "-"
  }
  if (header === "Watch Hrs" || header === "Watch Time (Hours)" || header === "Watch time (hours)")
   return getWatchHours(row).toFixed(2)
  if (header === "Estimated minutes watched")
   return (getWatchHours(row) * 60).toLocaleString(undefined, {
    maximumFractionDigits: 1,
   })
  if (header === "AVD" || header === "AVD (Sec)" || header === "Average view duration") {
   const totalSec = Math.round(getAvdSeconds(row))
   const h = Math.floor(totalSec / 3600)
   const m = Math.floor((totalSec % 3600) / 60)
   const s = totalSec % 60
   return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`
  }
  if (header === "AVP %" || header === "AVP (%)" || header === "Average percentage viewed (%)")
   return getAvpPercent(row).toLocaleString(undefined, {
    maximumFractionDigits: 2,
   })
  if (header === "Subscribers Gained" || header === "Subscribers")
   return formatNumberMax2(getSubscribers(row))
  if (
   header === "CTR %" ||
   header === "CTR" ||
   header === "CTR (%)" ||
   header === "Impressions click-through rate (%)" ||
   header === "Click-Through Rate (CTR)"
  )
   return formatNumberMax2(getCtr(row))
  if ((header === "Data Provenance" || header === "Data Src") && datasetId === "master") {
   const cells = (row as Partial<MasterTableRow>).__metricCells
   if (!cells) return "Unavailable"
   const probeHeaders = [
    "Views",
    "Watch Hrs",
    "Revenue",
    "CTR %",
   ] as const
   for (const probe of probeHeaders) {
    const key = MASTER_HEADER_TO_CANONICAL[probe]
    if (!key) continue
    const provenance = metricCellToProvenance(cells[key])
    if (provenance !== "Unavailable") return provenance
   }
   return "Unavailable"
  }
  if (header === "New Viewers")
   return getMetric(row, ["New Viewers"]).toLocaleString()
  if (header === "Returning Viewers")
   return getMetric(row, ["Returning Viewers"]).toLocaleString()
  if (header === "Casual viewers")
   return getMetric(row, ["Casual viewers", "Casual Viewers"]).toLocaleString()
  if (header === "Regular viewers")
   return getMetric(row, ["Regular viewers", "Regular Viewers"]).toLocaleString()
  if (header === "Unique viewers")
   return getMetric(row, ["Unique viewers", "Unique Viewers"]).toLocaleString()
  if (header === "AVD (Average View Duration)") {
   const totalSec = Math.round(getAvdSeconds(row))
   const h = Math.floor(totalSec / 3600)
   const m = Math.floor((totalSec % 3600) / 60)
   const s = totalSec % 60
   return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`
  }
  if (header === "STW %") {
   const stw = getMetric(row, ["STW %", "Stayed to watch (%)"])
   return stw > 0 ? `${stw.toFixed(2)}%` : "-"
  }
  if (header === "End Screen %" || header === "End screen click rate") {
   const endRate = getMetric(row, [
    "End screen click rate",
    "Clicks per end screen element shown (%)",
   ])
   return endRate > 0 ? `${endRate.toFixed(2)}%` : "-"
  }
  if (header === "Card %" || header === "Card click rate") {
   const cardRate = getMetric(row, [
    "Card click rate",
    "cardClickRate",
   ])
   return cardRate > 0 ? `${cardRate.toFixed(2)}%` : "-"
  }
  if (header === "Teaser %") {
   const teaserRate = getMetric(row, [
    "Teaser %",
    "Card teaser click rate",
    "cardTeaserClickRate",
   ])
   return teaserRate > 0 ? `${teaserRate.toFixed(2)}%` : "-"
  }
  if (header === "Teaser Clicks") {
   const teaserClicks = getMetric(row, [
    "Teaser Clicks",
    "Card teaser clicks",
    "cardTeaserClicks",
   ])
   return teaserClicks > 0 ? teaserClicks.toLocaleString() : "-"
  }
  if (header === "Teaser Impr") {
   const teaserImpr = getMetric(row, [
    "Teaser Impr",
    "Card teaser impressions",
    "cardTeaserImpressions",
   ])
   return teaserImpr > 0 ? teaserImpr.toLocaleString() : "-"
  }
  if (header === "ES Clicks") {
   const esClicks = getMetric(row, [
    "ES Clicks",
    "End screen clicks",
    "endScreenClicks",
    "endScreenElementClicks",
   ])
   return esClicks > 0 ? esClicks.toLocaleString() : "-"
  }
  if (header === "ES Impr") {
   const esImpr = getMetric(row, [
    "ES Impr",
    "End screen impressions",
    "endScreenImpressions",
    "endScreenElementImpressions",
   ])
   return esImpr > 0 ? esImpr.toLocaleString() : "-"
  }
  if (header === "Ann Impr" || header === "Ann Click Impr" || header === "Ann Close Impr" || header === "Ann Clicks" || header === "Ann Closes") {
   const aliasMap: Record<string, string[]> = {
    "Ann Impr": ["Ann Impr", "annotationImpressions", "Annotation impressions"],
    "Ann Click Impr": [
     "Ann Click Impr",
     "annotationClickableImpressions",
     "Annotation clickable impressions",
    ],
    "Ann Close Impr": [
     "Ann Close Impr",
     "annotationClosableImpressions",
     "Annotation closable impressions",
    ],
    "Ann Clicks": ["Ann Clicks", "annotationClicks", "Annotation clicks"],
    "Ann Closes": ["Ann Closes", "annotationCloses", "Annotation closes"],
   }
   const ann = getMetric(row, aliasMap[header] || [header])
   return ann > 0 ? ann.toLocaleString() : "-"
  }
  if (header === "Red Hrs") {
   const redHours = getMetric(row, [
    "Red Hrs",
    "estimatedRedMinutesWatched",
    "redWatchHours",
   ])
   if (redHours > 0 && redHours > 100) return redHours.toFixed(1)
   if (redHours > 0) return redHours.toFixed(2)
   return "-"
  }
  if (
   header === "Revenue" ||
   header === "Estimated revenue" ||
   header === "Your estimated revenue (USD)"
  )
   return `$${getRevenue(row).toFixed(2)}`
 if (header === "RPM")
   return formatNumberMax2(getRpm(row))

  const raw = textFromUnknown(row[header])
  if (raw === "") return "-"
  const numericRaw = Number(raw.replace(/,/g, ""))
  if (Number.isFinite(numericRaw) && /^-?[\d,.]+(\.\d+)?$/.test(raw.trim())) {
   return formatNumberMax2(numericRaw)
  }
  return raw
 }

const normalizeCountryKey = (value: unknown): string =>
  textFromUnknown(value).trim().toUpperCase()

const COUNTRY_CODE_ALIASES: Record<string, string> = {
 UK: "GB",
 USA: "US",
}

const countryDisplayNames =
 typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function"
  ? new Intl.DisplayNames(["en"], { type: "region" })
  : null

const toCountryFullName = (value: unknown): string => {
 const raw = textFromUnknown(value).trim()
 if (!raw) return ""
 const clean = raw.replace(/\s+/g, " ").trim()
 const upper = clean.toUpperCase()
 const alias = COUNTRY_CODE_ALIASES[upper] || upper
 if (/^[A-Z]{2}$/.test(alias)) {
  const fromCode = countryDisplayNames?.of(alias)
  if (fromCode) return fromCode
 }
 return clean
}

const isTotalLikeLabel = (value: unknown): boolean => {
 const normalized = textFromUnknown(value).trim().toLowerCase()
 return (
  normalized === "total" ||
  normalized === "totals" ||
  normalized === "all" ||
  normalized === "all countries"
 )
}

const normalizeDateKey = (value: unknown): string => {
  const text = textFromUnknown(value).trim()
  if (!text) return ""
  const direct = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (direct) return direct[0]
  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return text
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
 }

 const normalizeSourceText = (value: unknown): string =>
  textFromUnknown(value).trim().toLowerCase()

const classifyTrafficCategory = (
 sourceType: unknown,
 sourceTitle: unknown,
 trafficSource: unknown,
): TrafficDatasetMode | "other" => {
 const sourceTypeText = normalizeSourceText(sourceType)
 const sourceTitleText = normalizeSourceText(sourceTitle)
 const trafficSourceText = normalizeSourceText(trafficSource)
 const haystack = [sourceTypeText, sourceTitleText, trafficSourceText].join(" ")

 if (
  trafficSourceText.startsWith("yt_related.") ||
  sourceTypeText === "content" ||
  haystack.includes("suggested videos")
 ) {
  return "suggested_videos"
 }

 if (
  trafficSourceText.startsWith("yt_search.") ||
  haystack.includes("youtube search") ||
  haystack.includes("search terms") ||
  haystack.includes("search term")
 ) {
  return "youtube_search"
 }
 if (
  trafficSourceText.startsWith("ext_url.") ||
  haystack.includes("external") ||
  haystack.includes("website") ||
  haystack.includes("app")
 ) {
  return "external"
 }
 if (
  haystack.includes("shorts feed") ||
  haystack.includes("browse features") ||
  haystack.includes("channel pages") ||
  haystack.includes("other youtube features") ||
  haystack.includes("notifications") ||
  haystack.includes("playlists") ||
  haystack.includes("direct or unknown")
 ) {
  return "youtube_traffic"
 }
 return "other"
}

 type GeographyCsvRow = {
  countryKey: string
  row: Record<string, unknown>
 }

type AudienceGrowthCsvRow = {
 dateKey: string
 row: Record<string, unknown>
}

type AudienceDemographicsCsvRow = {
 row: Record<string, unknown>
}

 type CsvSignatureRule = {
  id: string
  requiredHeaders: string[]
  family: "traffic" | "geography" | "growth" | "retention"
 }

 const tableDatasets = useMemo<
  Array<{
   id: TableDatasetId
   label: string
   rows: TableRow[]
   supportsTagFilter: boolean
   columns: string[]
  }>
 >(() => {
  const cache = readYouTubeAnalyticsCache()

  const normalizedReportRows = (
   report: any,
   prefix: string,
   label: string,
  ): UnifiedRow[] =>
   reportToRows(report, prefix, label).map((row) =>
    normalizeAndEnrichRow(row as Record<string, unknown>),
   ) as UnifiedRow[]

  const geographyCsvRows: GeographyCsvRow[] = []
  const growthCsvRows: AudienceGrowthCsvRow[] = []
  const audienceDemographicsCsvRows: AudienceDemographicsCsvRow[] = []
  const audienceRetentionRows: UnifiedRow[] = []
  const csvSignatureRules: CsvSignatureRule[] = [
   { id: "traffic_legacy_5", family: "traffic", requiredHeaders: ["Traffic source", "Views", "Watch time (hours)", "Impressions", "Impressions click-through rate (%)"] },
   { id: "traffic_enriched_13", family: "traffic", requiredHeaders: ["Traffic source", "Engaged views", "Average view duration", "Average percentage viewed (%)", "Views", "Watch time (hours)", "Impressions", "Impressions click-through rate (%)"] },
   { id: "traffic_detail_12", family: "traffic", requiredHeaders: ["Traffic source", "Source type", "Source title", "Views", "Watch time (hours)", "Impressions", "Impressions click-through rate (%)"] },
   { id: "traffic_detail_10", family: "traffic", requiredHeaders: ["Traffic source", "Source type", "Source title", "Views", "Watch time (hours)"] },
   { id: "traffic_compact_7", family: "traffic", requiredHeaders: ["Traffic source", "Source type", "Source title", "Views", "Watch time (hours)", "Impressions", "Impressions click-through rate (%)"] },
  ]

  csvFiles.forEach((file) => {
   const rows = Array.isArray(file.data) ? (file.data as Record<string, unknown>[]) : []
   if (rows.length === 0) return
   const headers = new Set(Object.keys(rows[0]))

   const isGeographyCsv =
    headers.has("Geography") &&
    (headers.has("Views") || headers.has("Watch time (hours)"))
   if (isGeographyCsv) {
    rows.forEach((row) => {
      const country = row["Geography"] || row["Country"] || row["country"]
      const countryKey = normalizeCountryKey(country)
      if (!countryKey || countryKey === "TOTAL") return
      geographyCsvRows.push({ countryKey, row })
    })
    return
   }

   const isDateGrowthCsv = headers.has("Date")
   if (isDateGrowthCsv) {
    rows.forEach((row) => {
      const dateKey = normalizeDateKey(row["Date"])
      if (!dateKey) return
      growthCsvRows.push({ dateKey, row })
    })
    return
   }

   const isAudienceDemographicsCsv =
    headers.has("Viewer age") &&
    headers.has("Viewer gender") &&
    headers.has("Views (%)") &&
    headers.has("Watch time (hours) (%)")
   if (isAudienceDemographicsCsv) {
    rows.forEach((row) => {
     const age = textFromUnknown(row["Viewer age"])
     const gender = textFromUnknown(row["Viewer gender"])
     if (!age && !gender) return
     audienceDemographicsCsvRows.push({ row })
    })
    return
   }

   const isRetentionCsv =
    headers.has("Video position (%)") &&
    (headers.has("Absolute audience retention (%)") ||
     headers.has("Number of times each moment was seen"))
   if (isRetentionCsv) {
    rows.forEach((row, index) => {
      const position = numberFromUnknown(row["Video position (%)"])
      const retention = numberFromUnknown(row["Absolute audience retention (%)"])
      const audienceType =
       textFromUnknown(
        row["Audience by watch behavior"] ||
         row["New and Returning Viewers"] ||
         row["Subscription status"] ||
         row["Audience type"],
       ) || "All"
      audienceRetentionRows.push({
       ...normalizeAndEnrichRow(row),
       _id: `${file.id}-retention-${index}`,
       _sourceFile: file.name,
       _userTag: file.tag,
       Date: `${position}%`,
       "Video position (%)": position,
       "Absolute audience retention (%)": retention,
       "Compared to other videos (%)": numberFromUnknown(row["Compared to other videos (%)"]),
       "Started watching": numberFromUnknown(row["Started watching"]),
       "Stopped watching": numberFromUnknown(row["Stopped watching"]),
       "Number of times each moment was seen": numberFromUnknown(row["Number of times each moment was seen"]),
       "Audience by watch behavior": textFromUnknown(row["Audience by watch behavior"]),
       "New and Returning Viewers": textFromUnknown(row["New and Returning Viewers"]),
       "Subscription status": textFromUnknown(row["Subscription status"]),
       "Audience Type": audienceType,
      } as UnifiedRow)
    })
   }
  })

  const geographyCsvByCountry = new Map<string, Record<string, unknown>>()
  geographyCsvRows.forEach(({ countryKey, row }) => {
   geographyCsvByCountry.set(countryKey, row)
  })
  const growthCsvByDate = new Map<string, Record<string, unknown>>()
  growthCsvRows.forEach(({ dateKey, row }) => {
   const existing = growthCsvByDate.get(dateKey) || {}
   growthCsvByDate.set(dateKey, { ...existing, ...row })
  })

  const dailyRows = normalizedReportRows(cache?.dailyMetrics, "daily", "Daily Metrics").map(
   (row, index) => {
    const views = getViews(row)
    const watchHours = getWatchHours(row)
    const subscribers = getSubscribers(row)
    const impressions = getImpressions(row)
    const revenue = getRevenue(row)
    const ctr = getCtr(row)
    const rpm = getRpm(row)
    const cpm = impressions > 0 && revenue > 0 ? (revenue / impressions) * 1000 : 0
    const dateKey = normalizeDateKey(
     row["Date"] || row["day"] || row["Day"] || row["Upload date"],
    )
    const growthRow = growthCsvByDate.get(dateKey) || {}

    return {
     ...row,
     Date:
      textFromUnknown(
       row["Date"] || row["day"] || row["Day"] || row["Upload date"],
      ) || `Day ${index + 1}`,
     Day: textFromUnknown(row["Day"] || row["day"] || ""),
     Views: views,
     Likes: getLikes(row),
     Dislikes: getMetric(row, ["Dislikes", "dislikes"]),
     Comments: getComments(row),
     Shares: getShares(row),
     "Watch Hrs": watchHours,
     "Watch time (hours)": watchHours,
     "Watch Time Minutes": watchHours * 60,
     "Average view duration": getAvdSeconds(row),
     "Average percentage viewed (%)": getAvpPercent(row),
     "Engaged views": getMetric(row, ["Engaged views", "engagedViews"]),
     "Subscribers Gained": subscribers,
     "Subscribers gained": subscribers,
     "Subscribers lost": getMetric(row, ["Subscribers lost", "subscribersLost"]),
     "Subs +": subscribers,
     Impressions: impressions,
     "Impressions click-through rate (%)": ctr,
     Revenue: revenue,
     "Estimated revenue (USD)": revenue,
     "Estimated Revenue": revenue,
     "Estimated Ad Revenue": getMetric(row, ["Estimated Ad Revenue", "estimatedAdRevenue"]),
     "Gross Revenue": getMetric(row, ["Gross Revenue", "grossRevenue"]),
     "Ad Impressions": getMetric(row, ["Ad Impressions", "adImpressions"]),
     "Monetized Playbacks": getMetric(row, ["Monetized Playbacks", "monetizedPlaybacks"]),
     RPM:
      rpm > 0 ? rpm : views > 0 && revenue > 0 ? (revenue / views) * 1000 : 0,
     CPM: cpm,
     CTR: ctr,
     "Peak Concurrent Viewers": getMetric(row, ["Peak Concurrent Viewers", "peakConcurrentViewers"]),
     "Average Concurrent Viewers": getMetric(row, ["Average Concurrent Viewers", "averageConcurrentViewers"]),
     "Transaction Revenue": getMetric(row, ["Transaction Revenue", "transactionRevenue"]),
     "Reserved Ad Revenue": getMetric(row, ["Reserved Ad Revenue", "reservedAdRevenue"]),
     "Auction Ad Revenue": getMetric(row, ["Auction Ad Revenue", "auctionAdRevenue"]),
     new_viewers: getMetric(row, ["new_viewers", "newViewers"]),
     casual_viewers: getMetric(row, ["casual_viewers", "casualViewers"]),
     regular_viewers: getMetric(row, ["regular_viewers", "regularViewers"]),
     subscribers: getMetric(row, ["subscribers", "subscribersGained"]),
     "Monthly audience": numberFromUnknown(growthRow["Monthly audience"]),
     "28-day new viewers": numberFromUnknown(growthRow["28-day new viewers"]),
     "28-day casual viewers": numberFromUnknown(growthRow["28-day casual viewers"]),
     "28-day regular viewers": numberFromUnknown(growthRow["28-day regular viewers"]),
     Subscribers:
      numberFromUnknown(growthRow["Subscribers"]) ||
      numberFromUnknown(growthRow["subscribers"]) ||
      getMetric(row, ["subscribers", "Subscribers"]),
    } as UnifiedRow
   },
  ).reverse()

  const apiTrafficRows = normalizedReportRows(
   cache?.trafficSources,
   "traffic",
   "Traffic Sources",
  ).map((row, index) => ({
   ...row,
   "Traffic source":
    formatTrafficSourceNickname(
     textFromUnknown(
      row["Traffic source"] ||
       row["insightTrafficSourceType"] ||
       row["trafficSource"] ||
       row["Dimension"],
     ) || `Source ${index + 1}`,
    ),
   "Source type": textFromUnknown(row["Source type"] || row["sourceType"]),
   "Source title": textFromUnknown(row["Source title"] || row["sourceTitle"]),
   Views: getViews(row),
   "Watch Hrs": getWatchHours(row),
   "Watch time (hours)": getWatchHours(row),
   "Engaged views": getMetric(row, ["Engaged views", "engagedViews"]),
   "Average view duration":
    row["Average view duration"] || row["averageViewDuration"] || "-",
   "Average percentage viewed (%)":
    getMetric(row, ["Average percentage viewed (%)", "averageViewPercentage"]),
   Impressions: getImpressions(row),
   "Impressions click-through rate (%)": getCtr(row),
   "Playlist watch time (hours)": getMetric(row, ["Playlist watch time (hours)"]),
   "Views from playlist": getMetric(row, ["Views from playlist"]),
   "Views per playlist start": getMetric(row, ["Views per playlist start"]),
   "YouTube Premium views": getMetric(row, ["YouTube Premium views"]),
   "YouTube Premium watch time (hours)": getMetric(row, ["YouTube Premium watch time (hours)"]),
   __trafficCategory: "other",
  })) as (UnifiedRow & { __trafficCategory?: string })[]

  const trafficCsvRows = csvFiles.flatMap((file) => {
   const rows = Array.isArray(file.data) ? (file.data as Record<string, unknown>[]) : []
   if (rows.length === 0) return []
   const first = rows[0] || {}
   const headerList = Object.keys(first)
   const matchedTrafficSignature = csvSignatureRules.find(
    (signature) =>
     signature.family === "traffic" &&
     signature.requiredHeaders.every((header) => headerList.includes(header)),
   )
   if (!matchedTrafficSignature) return []

   return rows
    .filter((row) => normalizeSourceText(row["Traffic source"]) !== "total")
    .map((row, index) => {
     const trafficSource = textFromUnknown(row["Traffic source"])
     const sourceType = textFromUnknown(row["Source type"])
     const sourceTitle = textFromUnknown(row["Source title"])
     const signatureCategory: TrafficDatasetMode | null =
      matchedTrafficSignature.id === "traffic_enriched_13" ? "youtube_traffic"
      : matchedTrafficSignature.id === "traffic_detail_12" ? "external"
      : matchedTrafficSignature.id === "traffic_detail_10" ? "suggested_videos"
      : matchedTrafficSignature.id === "traffic_compact_7" ? "youtube_search"
      : null
     const category =
      signatureCategory ||
      classifyTrafficCategory(sourceType, sourceTitle, trafficSource)
     return {
      ...normalizeAndEnrichRow(row),
      _id: `${file.id}-traffic-${index}`,
      _sourceFile: file.name,
      _userTag: "traffic",
      _window: file.analyticsWindow || "unknown",
      "Traffic source": trafficSource || `Source ${index + 1}`,
      "Source type": sourceType,
      "Source title": sourceTitle,
      Views: numberFromUnknown(row["Views"]),
      "Watch Hrs": numberFromUnknown(row["Watch time (hours)"]),
      "Watch time (hours)": numberFromUnknown(row["Watch time (hours)"]),
      "Engaged views": numberFromUnknown(row["Engaged views"]),
      "Average view duration": row["Average view duration"] || "-",
      "Average percentage viewed (%)": numberFromUnknown(row["Average percentage viewed (%)"]),
      Impressions: numberFromUnknown(row["Impressions"]),
      "Impressions click-through rate (%)": numberFromUnknown(row["Impressions click-through rate (%)"]),
      "Playlist watch time (hours)": numberFromUnknown(row["Playlist watch time (hours)"]),
      "Views from playlist": numberFromUnknown(row["Views from playlist"]),
      "Views per playlist start": numberFromUnknown(row["Views per playlist start"]),
      "YouTube Premium views": numberFromUnknown(row["YouTube Premium views"]),
      "YouTube Premium watch time (hours)": numberFromUnknown(row["YouTube Premium watch time (hours)"]),
      __trafficCategory: category,
     } as UnifiedRow & { __trafficCategory?: string; _window?: string }
    })
  })

  const mergedTrafficByKey = new Map<string, UnifiedRow & { __trafficCategory?: string }>()
  const stableTrafficKey = (row: Record<string, unknown>) =>
   [
    textFromUnknown(row["_window"] || "unknown"),
    normalizeSourceText(row["Traffic source"]),
    normalizeSourceText(row["Source type"]),
    normalizeSourceText(row["Source title"]),
   ].join("|")

  ;[...apiTrafficRows, ...trafficCsvRows].forEach((row) => {
   const sourceCategory = classifyTrafficCategory(
    row["Source type"],
    row["Source title"],
    row["Traffic source"],
   )
   const key = stableTrafficKey(row)
   const existing = mergedTrafficByKey.get(key)
   if (!existing) {
    mergedTrafficByKey.set(key, {
     ...row,
     __trafficCategory:
      textFromUnknown(row.__trafficCategory) || sourceCategory || "other",
    })
    return
   }
   const merged = { ...row, ...existing } as UnifiedRow & { __trafficCategory?: string }
   const numericFields = [
    "Views",
    "Watch Hrs",
    "Watch time (hours)",
    "Engaged views",
    "Impressions",
    "Impressions click-through rate (%)",
   ] as const
   numericFields.forEach((field) => {
    const existingValue = numberFromUnknown(existing[field])
    const rowValue = numberFromUnknown(row[field])
    merged[field] = existingValue > 0 ? existingValue : rowValue
   })
   merged.__trafficCategory =
    textFromUnknown(existing.__trafficCategory) ||
    textFromUnknown(row.__trafficCategory) ||
    sourceCategory ||
    "other"
   mergedTrafficByKey.set(key, merged)
  })

  const trafficRowsRaw = Array.from(mergedTrafficByKey.values())
  const trafficTotalViews = trafficRowsRaw.reduce(
   (sum, row) => sum + (numberFromUnknown(row["Views"]) || 0),
   0,
  )
  const trafficRows = trafficRowsRaw
   .map((row) => ({
    ...row,
    "Viewer %":
     trafficTotalViews > 0
      ? (numberFromUnknown(row["Views"]) / trafficTotalViews) * 100
      : 0,
   }))
   .sort((a, b) => numberFromUnknown(b["Views"]) - numberFromUnknown(a["Views"]))

  const geographyReport =
   cache?.geography ||
   cache?.countryAnalytics ||
   cache?.audienceByCountry ||
   cache?.demographics
  let countryRows = normalizedReportRows(geographyReport, "country", "Geography")
   .map((row, index) => {
    const countryLabelRaw =
     textFromUnknown(
      row["Country"] || row["country"] || row["Geography"] || row["Dimension"],
     ) ||
     [textFromUnknown(row["ageGroup"]), textFromUnknown(row["gender"])]
      .filter(Boolean)
      .join(" · ") ||
     `Segment ${index + 1}`
    if (isTotalLikeLabel(countryLabelRaw)) return null
    const countryLabel = toCountryFullName(countryLabelRaw)

    const csvGeo = geographyCsvByCountry.get(normalizeCountryKey(countryLabel)) || {}
    return {
     ...row,
     ...csvGeo,
     Country: countryLabel,
     Geography: countryLabel,
     "Viewer %": numberFromUnknown(
      row["Viewer percentage"] || row["viewerPercentage"] || row["viewer_percentage"],
     ),
     Views: getViews(row),
     "Watch Hrs": getWatchHours(row),
     Revenue: getRevenue(row),
     "Subscribers Gained": getSubscribers(row),
     "Engaged views":
      numberFromUnknown(row["Engaged views"]) ||
      numberFromUnknown(csvGeo["Engaged views"]),
     "Average view duration":
      row["Average view duration"] || csvGeo["Average view duration"] || "-",
     "Average percentage viewed (%)":
      numberFromUnknown(row["Average percentage viewed (%)"]) ||
      numberFromUnknown(csvGeo["Average percentage viewed (%)"]),
     "Stayed to watch (%)":
      numberFromUnknown(row["Stayed to watch (%)"]) ||
      numberFromUnknown(csvGeo["Stayed to watch (%)"]),
     "Subscribers gained":
      numberFromUnknown(row["Subscribers gained"]) ||
      numberFromUnknown(csvGeo["Subscribers gained"]),
     "Subscribers lost":
      numberFromUnknown(row["Subscribers lost"]) ||
      numberFromUnknown(csvGeo["Subscribers lost"]),
     "Comments added":
      numberFromUnknown(row["Comments added"]) ||
      numberFromUnknown(csvGeo["Comments added"]),
     "Estimated revenue (USD)":
      numberFromUnknown(row["Estimated revenue (USD)"]) ||
      numberFromUnknown(csvGeo["Estimated revenue (USD)"]),
     Subscribers:
      numberFromUnknown(row["Subscribers"]) ||
      numberFromUnknown(csvGeo["Subscribers"]),
    } as UnifiedRow
   })
   .filter(Boolean) as UnifiedRow[]

  if (countryRows.length === 0 && geographyCsvRows.length > 0) {
   countryRows = geographyCsvRows
    .filter(({ row, countryKey }) => {
     const rawLabel = row["Geography"] || row["Country"] || countryKey
     return !isTotalLikeLabel(rawLabel)
    })
    .map(({ countryKey, row }, index) => ({
    ...normalizeAndEnrichRow(row),
    _id: `country-csv-${index}`,
    _sourceFile: "Geography CSV",
    _userTag: "geo",
    Country: toCountryFullName(row["Geography"] || row["Country"] || countryKey),
    Geography: toCountryFullName(row["Geography"] || row["Country"] || countryKey),
    "Viewer %": numberFromUnknown(
     row["Viewer percentage"] || row["viewerPercentage"] || row["viewer_percentage"],
    ),
    Views: numberFromUnknown(row["Views"]),
    "Watch Hrs": numberFromUnknown(row["Watch time (hours)"]),
    "Subscribers Gained": numberFromUnknown(row["Subscribers gained"]),
    Revenue: numberFromUnknown(row["Estimated revenue (USD)"]),
   })) as UnifiedRow[]
  }

  if (countryRows.length === 0 && filteredUnifiedRows.length > 0) {
   const formatTotals = filteredUnifiedRows.reduce(
    (acc, row) => {
     const key = textFromUnknown(row._userTag || "unknown").toLowerCase() || "unknown"
     acc[key] = (acc[key] || 0) + getViews(row)
     return acc
    },
    {} as Record<string, number>,
   )
   const totalViews = Object.values(formatTotals).reduce((sum, value) => sum + value, 0)
   countryRows = Object.entries(formatTotals).map(([segment, views], index) => ({
    _id: `country-fallback-${index}`,
    _sourceFile: "Derived Geography",
    _userTag: "analytics",
    Country: toCountryFullName(segment),
    Geography: toCountryFullName(segment),
    Views: views,
    "Viewer %": totalViews > 0 ? (views / totalViews) * 100 : 0,
   })) as UnifiedRow[]
  }

  if (countryRows.length > 0) {
   const totalViews = countryRows.reduce(
    (sum, row) => sum + Math.max(0, numberFromUnknown(row["Views"])),
    0,
   )
   countryRows = countryRows
    .map((row) => {
     const currentViewerPct = numberFromUnknown(row["Viewer %"])
     const views = Math.max(0, numberFromUnknown(row["Views"]))
     const normalizedViewerPct =
      totalViews > 0 &&
      (!Number.isFinite(currentViewerPct) || currentViewerPct <= 0 || currentViewerPct > 100)
       ? (views / totalViews) * 100
       : currentViewerPct
     return {
      ...row,
     "Viewer %": normalizedViewerPct,
     }
    })
    .filter((row) => {
     const statsToCheck = [
      "Views",
      "Watch Hrs",
      "Engaged views",
      "Average view duration",
      "Average percentage viewed (%)",
      "Shares",
      "Likes",
      "Dislikes",
      "Estimated revenue (USD)",
      "Viewer %",
     ] as const
     return statsToCheck.some((metric) => {
      const raw = row[metric]
      if (typeof raw === "string") return textFromUnknown(raw).trim() !== "" && raw !== "-"
      const numeric = numberFromUnknown(raw)
      return Number.isFinite(numeric) && Math.abs(numeric) > 0
     })
    })
    .sort((a, b) => numberFromUnknown(b["Views"]) - numberFromUnknown(a["Views"]))
  }

  const deviceRows = normalizedReportRows(
   cache?.deviceAnalytics || cache?.deviceTypes || cache?.demographicsDevice,
   "device",
   "Audience Devices",
  ).map((row, index) => ({
   ...row,
   "Device type":
    textFromUnknown(
     row["Device type"] || row["deviceType"] || row["Dimension"],
    ) || `Device ${index + 1}`,
   "Viewer %": numberFromUnknown(
    row["Viewer percentage"] || row["viewerPercentage"] || row["Views"],
   ),
  })) as UnifiedRow[]

  let audienceRows = normalizedReportRows(
   cache?.audienceMetrics || cache?.demographics || cache?.audienceSegments,
   "audience",
   "Audience",
  ).map((row, index) => ({
   ...row,
   Date: textFromUnknown(row["Date"] || row["day"] || row["Day"] || ""),
   "Age Group":
    textFromUnknown(row["Age Group"] || row["ageGroup"]) || `Age Segment ${index + 1}`,
   Gender: textFromUnknown(row["Gender"] || row["gender"]) || "Unknown",
   "Audience Type": textFromUnknown(row["Audience Type"] || row["audienceType"]),
   "Viewer Percentage": getMetric(row, ["Viewer Percentage", "viewerPercentage"]),
   "Subscribed Status": textFromUnknown(row["Subscribed Status"] || row["subscribedStatus"]),
   "Unique viewers": getMetric(row, ["Unique viewers", "uniqueViewers"]),
   "New viewers": getMetric(row, ["New viewers", "newViewers"]),
   "Casual viewers": getMetric(row, ["Casual viewers", "casualViewers"]),
   "Regular viewers": getMetric(row, ["Regular viewers", "regularViewers"]),
   "Returning viewers": getMetric(row, ["Returning viewers", "returningViewers"]),
   "Audience Watch Ratio": getMetric(row, ["Audience Watch Ratio", "audienceWatchRatio"]),
   "GA4 Age Groups": textFromUnknown(row["GA4 Age Groups"]),
   "GA4 Users": getMetric(row, ["GA4 Users"]),
   "GA4 Sessions": getMetric(row, ["GA4 Sessions"]),
   "GA4 Engaged Sessions": getMetric(row, ["GA4 Engaged Sessions"]),
   "GA4 Avg Session Duration": getMetric(row, ["GA4 Avg Session Duration"]),
   "Comment Likes and Dislikes History": textFromUnknown(row["Comment Likes and Dislikes History"]),
   "Comments and Replies History": textFromUnknown(row["Comments and Replies History"]),
   "Community Post Interactions": textFromUnknown(row["Community Post Interactions"]),
   "User Feedback Not Interested": textFromUnknown(row["User Feedback Not Interested"]),
   "Video Likes and Dislikes History": textFromUnknown(row["Video Likes and Dislikes History"]),
   Views: getViews(row),
   "Watch Hrs": getWatchHours(row),
   Engaged: getMetric(row, ["Engaged views", "engagedViews"]),
   "Eng Rate": getMetric(row, ["Engagement Rate", "engagementRate"]),
   AVD: getAvdSeconds(row),
   "AVP %": getAvpPercent(row),
  })) as UnifiedRow[]

  audienceRows = audienceRows.map((row) => {
   const growthRow = growthCsvByDate.get(normalizeDateKey(row["Date"])) || {}
   return {
    ...row,
    "Monthly audience": numberFromUnknown(growthRow["Monthly audience"]),
    "28-day new viewers": numberFromUnknown(growthRow["28-day new viewers"]),
    "28-day casual viewers": numberFromUnknown(growthRow["28-day casual viewers"]),
    "28-day regular viewers": numberFromUnknown(growthRow["28-day regular viewers"]),
    Subscribers:
     numberFromUnknown(growthRow["Subscribers"]) ||
     numberFromUnknown(growthRow["subscribers"]) ||
     numberFromUnknown(row["Subscribers"]),
   } as UnifiedRow
  })

  if (audienceRows.length === 0 && audienceRetentionRows.length > 0) {
   audienceRows = audienceRetentionRows
  } else if (audienceRetentionRows.length > 0) {
   audienceRows = [...audienceRows, ...audienceRetentionRows]
  }

  if (audienceDemographicsCsvRows.length > 0) {
   audienceRows = audienceDemographicsCsvRows.map(({ row }, index) => ({
    ...normalizeAndEnrichRow(row),
    _id: `audience-demographics-csv-${index}`,
    _sourceFile: "Audience demographics CSV",
    _userTag: "audience",
    "Viewer age": textFromUnknown(row["Viewer age"]),
    "Viewer gender": textFromUnknown(row["Viewer gender"]),
    "Views (%)": numberFromUnknown(row["Views (%)"]),
    "Watch time (hours) (%)": numberFromUnknown(row["Watch time (hours) (%)"]),
   })) as UnifiedRow[]
  }

  if (audienceRows.length > 0) {
   audienceRows = audienceRows.map((row, index) => ({
    ...row,
    "Viewer age":
     textFromUnknown(
      row["Viewer age"] || row["Age Group"] || row["ageGroup"] || row["Dimension"],
     ) || `Age Segment ${index + 1}`,
    "Viewer gender": textFromUnknown(row["Viewer gender"] || row["Gender"] || row["gender"]),
    "Views (%)":
     numberFromUnknown(row["Views (%)"]) ||
     numberFromUnknown(row["Viewer Percentage"]) ||
     numberFromUnknown(row["viewerPercentage"]),
    "Watch time (hours) (%)":
     numberFromUnknown(row["Watch time (hours) (%)"]) ||
     numberFromUnknown(row["Watch time percentage"]) ||
     numberFromUnknown(row["watchTimePercentage"]),
   })) as UnifiedRow[]
  }

  return [
   {
    id: TABLE_DATASET_CONTRACTS.master.id,
    label: TABLE_DATASET_CONTRACTS.master.label,
    rows: masterTableRows,
    supportsTagFilter: TABLE_DATASET_CONTRACTS.master.supportsTagFilter,
    columns: TABLE_DATASET_CONTRACTS.master.columns.filter(
     (column) => getMasterColumnVisibilityRule(column) !== "import_only",
    ),
   },
   {
    id: TABLE_DATASET_CONTRACTS.daily.id,
    label: TABLE_DATASET_CONTRACTS.daily.label,
    rows: dailyRows,
    supportsTagFilter: TABLE_DATASET_CONTRACTS.daily.supportsTagFilter,
    columns: TABLE_DATASET_CONTRACTS.daily.columns,
   },
   {
    id: TABLE_DATASET_CONTRACTS.traffic.id,
    label: TABLE_DATASET_CONTRACTS.traffic.label,
    rows: trafficRows,
    supportsTagFilter: TABLE_DATASET_CONTRACTS.traffic.supportsTagFilter,
    columns: TABLE_DATASET_CONTRACTS.traffic.columns,
   },
   {
    id: TABLE_DATASET_CONTRACTS.audience.id,
    label: TABLE_DATASET_CONTRACTS.audience.label,
    rows: audienceRows,
    supportsTagFilter: TABLE_DATASET_CONTRACTS.audience.supportsTagFilter,
    columns: TABLE_DATASET_CONTRACTS.audience.columns,
   },
   {
    id: TABLE_DATASET_CONTRACTS.country.id,
    label: TABLE_DATASET_CONTRACTS.country.label,
    rows: countryRows,
    supportsTagFilter: TABLE_DATASET_CONTRACTS.country.supportsTagFilter,
    columns: TABLE_DATASET_CONTRACTS.country.columns,
   },
   {
    id: TABLE_DATASET_CONTRACTS.device.id,
    label: TABLE_DATASET_CONTRACTS.device.label,
    rows: deviceRows,
    supportsTagFilter: TABLE_DATASET_CONTRACTS.device.supportsTagFilter,
    columns: TABLE_DATASET_CONTRACTS.device.columns,
   },
  ]
 }, [masterTableRows, filteredUnifiedRows, lastSyncComplete, csvFiles])

 const activeTableDataset =
  tableDatasets.find((dataset) => dataset.id === tableDataset) ||
  tableDatasets[0]

 const duplicateShortHeaders = useMemo(
  () =>
   activeTableDataset.id === "master"
    ? findDuplicateShortHeaders(activeTableDataset.columns)
    : [],
  [activeTableDataset],
 )

 const tableHeaders = useMemo(() => {
  if (activeTableDataset.id === "master") {
   const canonical = activeTableDataset.columns.map((header) =>
    getCanonicalMasterHeader(header),
   )
   const unique = Array.from(new Set(canonical))
   const identityHeaders = new Set([
    "Video title",
    "Video ID",
    "Upload date",
    "Length",
    "Format",
    "Date",
   ])
   return unique.filter((header) => {
   if (identityHeaders.has(header)) return true
    if (MASTER_ALWAYS_VISIBLE_HEADERS.has(header)) return true
    return activeTableDataset.rows.some((row) => {
     const raw = (row as Record<string, unknown>)[header]
     if (raw !== undefined && raw !== null && textFromUnknown(raw).trim() !== "") {
      return true
     }
     const cell = getHeaderMetricCell(row as Record<string, unknown>, header)
     return !!(
      cell &&
      cell.value !== null &&
      cell.value !== undefined &&
      Number.isFinite(Number(cell.value))
     )
    })
   })
  }
  if (activeTableDataset.id === "daily") {
   const unique = Array.from(new Set(activeTableDataset.columns))
   return unique.filter((header) => {
    return activeTableDataset.rows.some((row, rowIndex) => {
     const raw = (row as Record<string, unknown>)[header]
     if (raw !== undefined && raw !== null && textFromUnknown(raw).trim() !== "") {
      return true
     }
     const rendered = getTableCellValue(row, header, rowIndex, "daily")
     return rendered !== "" && rendered !== "-" && rendered !== "=="
    })
   })
  }
  if (activeTableDataset.id === "country") {
   const unique = Array.from(new Set(activeTableDataset.columns))
   const geographyRequireNonZero = new Set([
    "Stayed to watch (%)",
    "Subscribers gained",
    "Subscribers lost",
    "Subscribers",
    "Comments added",
   ])
   return unique.filter((header) => {
    if (geographyRequireNonZero.has(header)) {
     const hasSignal = activeTableDataset.rows.some((row) => {
      const numeric = numberFromUnknown((row as Record<string, unknown>)[header])
      return Number.isFinite(numeric) && Math.abs(numeric) > 0
     })
     if (!hasSignal) return false
    }
    return activeTableDataset.rows.some((row, rowIndex) => {
     const raw = (row as Record<string, unknown>)[header]
     if (raw !== undefined && raw !== null && textFromUnknown(raw).trim() !== "") {
      return true
     }
     const rendered = getTableCellValue(row, header, rowIndex, "country")
     return rendered !== "" && rendered !== "-" && rendered !== "=="
    })
   })
  }
  return activeTableDataset.columns
}, [activeTableDataset])

 useEffect(() => {
  setTableColumnOrder((prev) => {
   if (!prev.length) return [...tableHeaders]
   const kept = prev.filter((header) => tableHeaders.includes(header))
   const missing = tableHeaders.filter((header) => !kept.includes(header))
   return [...kept, ...missing]
  })
 }, [tableHeaders])

 const orderedTableHeaders = useMemo(() => {
  if (!tableColumnOrder.length) return tableHeaders
  const kept = tableColumnOrder.filter((header) => tableHeaders.includes(header))
  const missing = tableHeaders.filter((header) => !kept.includes(header))
  return [...kept, ...missing]
 }, [tableColumnOrder, tableHeaders])

 const videoStatsVerification = useMemo(() => {
  const cache = readYouTubeAnalyticsCache() as {
   analyticsByWindow?: Record<
    AnalyticsWindow,
    {
     report?: unknown
     syncDiagnostics?: {
      failureReasons?: Array<{
       group?: string
       metrics?: string[]
       status?: number
       reason?: string
       requestClass?: string
       attemptedShape?: {
        dimensions?: string
        includesSort?: boolean
        includesStartIndex?: boolean
        includesMaxResults?: boolean
        includeContentType?: boolean
       }
      }>
     }
    }
   >
  }
  const report = cache.analyticsByWindow?.[analyticsWindow]?.report
  const reportRows = report
   ? (reportToRows(report, "verification", "Video Stats Verification") as Record<
      string,
      unknown
     >[])
   : []
  return buildVideoStatsVerificationSummary({
   window: analyticsWindow,
   reportRows,
   masterRows: canonicalApiRows,
   diagnostics: cache.analyticsByWindow?.[analyticsWindow]?.syncDiagnostics || null,
   duplicateShortHeaders,
  })
 }, [
  analyticsWindow,
  canonicalApiRows,
  duplicateShortHeaders,
  lastSyncComplete,
  pipelineLogTick,
 ])

const tableMetricMappingStatus = useMemo<TableMetricMappingStatus>(
  () =>
   buildTableMetricMappingStatus({
    masterRows: canonicalApiRows,
    visibleHeaders: tableHeaders,
    duplicateHeaderKeys: duplicateShortHeaders,
   }),
 [canonicalApiRows, tableHeaders, duplicateShortHeaders],
)

 const datasetCoverageSummaries = useMemo(() => {
  const visibleByDataset = new Map<TableDatasetId, string[]>()
  visibleByDataset.set(activeTableDataset.id, tableHeaders)
  return tableDatasets.map((dataset) =>
   buildDatasetCoverageSummary({
    datasetId: dataset.id,
    requestedHeaders: dataset.columns,
    visibleHeaders: visibleByDataset.get(dataset.id) || dataset.columns,
    rows: dataset.rows as Array<Record<string, unknown>>,
   }),
  )
 }, [tableDatasets, activeTableDataset.id, tableHeaders])

const activeDatasetCoverageSummary = useMemo(
  () =>
   datasetCoverageSummaries.find(
    (summary) => summary.datasetId === activeTableDataset.id,
   ) || datasetCoverageSummaries[0],
  [datasetCoverageSummaries, activeTableDataset.id],
 )

 const coverageManifest = useMemo(
  () => ({
   generatedAt: new Date().toISOString(),
   window: analyticsWindow,
   dataset: activeTableDataset.id,
   summaries: datasetCoverageSummaries,
  }),
  [analyticsWindow, activeTableDataset.id, datasetCoverageSummaries],
 )

 useEffect(() => {
  console.groupCollapsed(
   `[PerformanceHub] Video stats verification · ${analyticsWindow}`,
  )
  console.table({
   "Report Rows": videoStatsVerification.reportRowCount,
   "Master Rows": videoStatsVerification.masterRowCount,
   "Raw Impressions Rows": videoStatsVerification.rawMetricRows.impressions,
   "Raw CTR Rows": videoStatsVerification.rawMetricRows.ctr,
   "Mapped Impressions Rows": videoStatsVerification.mappedMetricRows.impressions,
   "Mapped CTR Rows": videoStatsVerification.mappedMetricRows.ctr,
   "Mapping Status": verificationStatusLabel(videoStatsVerification.mappingStatus),
   "Duplicate Short Headers":
    videoStatsVerification.duplicateShortHeaders.join(", ") || "None",
   "Last Failure Request Class":
    videoStatsVerification.lastFailure?.requestClass || "None",
  })
  if (videoStatsVerification.lastFailure) {
   console.log("Last video-stats failure:", videoStatsVerification.lastFailure)
  }
  console.table({
   "Synced Metrics": tableMetricMappingStatus.syncedMetricsCount,
   "Mapped Metrics": tableMetricMappingStatus.mappedMetricsCount,
   "Unmapped Metrics":
    tableMetricMappingStatus.unmappedMetricKeys.join(", ") || "None",
   "Duplicate Header Keys":
    tableMetricMappingStatus.duplicateHeaderKeys.join(", ") || "None",
  })
  console.log(
   "Unavailable-by-reason:",
   tableMetricMappingStatus.unavailableByReason,
  )
  console.groupEnd()
 }, [analyticsWindow, videoStatsVerification, tableMetricMappingStatus])

 const filteredTableRows = useMemo(() => {
  const search = tableSearch.trim().toLowerCase()
  return activeTableDataset.rows.filter((row) => {
   if (
    activeTableDataset.supportsTagFilter &&
    tableTag !== "all" &&
    textFromUnknown(row._userTag).toLowerCase() !== tableTag.toLowerCase()
   ) {
    return false
   }
   if (activeTableDataset.id === "traffic" && trafficDatasetMode !== "all") {
    const category = textFromUnknown((row as Record<string, unknown>).__trafficCategory).toLowerCase()
    if (category !== trafficDatasetMode) return false
   }
   if (!search) return true
   return tableHeaders.some((header) =>
    getTableCellValue(row, header, 0, activeTableDataset.id)
     .toLowerCase()
     .includes(search),
   )
  })
 }, [activeTableDataset, tableHeaders, tableSearch, tableTag, trafficDatasetMode])

 const sortedTableRows = useMemo(() => {
  if (!sortColumn) return filteredTableRows
  const isDateColumn =
   sortColumn === "Date" ||
   sortColumn === "Upload date" ||
   sortColumn === "Video publish time"
  const textColumns = new Set(["Video title", "Video ID", "Format", "Upload date", "Date", "Type", "Dimension"])
  const isText = textColumns.has(sortColumn)
  const sorted = [...filteredTableRows].sort((a, b) => {
   if (isDateColumn) {
    const aVal = getTableCellValue(a, sortColumn, 0, activeTableDataset.id)
    const bVal = getTableCellValue(b, sortColumn, 0, activeTableDataset.id)
    const aTs = parseDate(aVal)?.getTime() || 0
    const bTs = parseDate(bVal)?.getTime() || 0
    return sortDir === "asc" ? aTs - bTs : bTs - aTs
   }
   if (isText) {
    const aVal = getTableCellValue(a, sortColumn, 0, activeTableDataset.id).toLowerCase()
    const bVal = getTableCellValue(b, sortColumn, 0, activeTableDataset.id).toLowerCase()
    return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
   }
   const aNum = getNumericValue(a, sortColumn)
   const bNum = getNumericValue(b, sortColumn)
   return sortDir === "asc" ? aNum - bNum : bNum - aNum
  })
  return sorted
 }, [filteredTableRows, sortColumn, sortDir, activeTableDataset])

 useEffect(() => {
  if (tableDataset === "daily" && !sortColumn) {
   setSortColumn("Date")
   setSortDir("desc")
  }
  if (tableDataset === "country" && !sortColumn) {
   setSortColumn("Views")
   setSortDir("desc")
  }
 }, [tableDataset, sortColumn])

 const tableRows = useMemo(
  () => sortedTableRows.slice(0, tableLimit),
  [sortedTableRows, tableLimit],
 )

 const distinctTags = useMemo(() => {
  return Array.from(
   new Set(
    filteredUnifiedRows.map((row) => textFromUnknown(row._userTag || "unknown")),
   ),
  ).filter(Boolean)
 }, [filteredUnifiedRows])

 const visibleRowIds = useMemo(
  () => tableRows.map((row) => row._id),
  [tableRows],
 )
 const visibleVideoIdentities = useMemo(
  () =>
   tableRows.map((row, index) =>
    toStorageIdentity(
     textFromUnknown(
      row["Video ID"] || row.Dimension || row.videoId || getTitle(row, index),
     ),
    ),
   ),
  [tableRows],
 )
 const selectedVisibleCount = useMemo(
  () => visibleRowIds.filter((id) => selectedRowIds.has(id)).length,
  [visibleRowIds, selectedRowIds],
 )
 const allVisibleSelected =
  visibleRowIds.length > 0 && selectedVisibleCount === visibleRowIds.length

 const toggleRowSelection = (id: string) => {
  setSelectedRowIds((previous) => {
   const next = new Set(previous)
   if (next.has(id)) next.delete(id)
   else next.add(id)
   return next
  })
 }

 const selectAllVisible = () => {
  setSelectedRowIds((previous) => {
   const next = new Set(previous)
   visibleRowIds.forEach((id) => next.add(id))
   return next
  })
 }

 const unselectAllVisible = () => {
  setSelectedRowIds((previous) => {
   const next = new Set(previous)
   visibleRowIds.forEach((id) => next.delete(id))
   return next
  })
 }

 const applySelectedToExclude = () => {
  tableRows.forEach((row, index) => {
   if (!selectedRowIds.has(row._id)) return
   const identity = toStorageIdentity(
    textFromUnknown(
     row["Video ID"] || row.Dimension || row.videoId || getTitle(row, index),
    ),
   )
   if (!identity) return
   setVideoFlags?.(identity, { excludeAnalysis: true, includeOnly: false })
  })
 }

 const applySelectedToIncludeOnly = () => {
  tableRows.forEach((row, index) => {
   if (!selectedRowIds.has(row._id)) return
   const identity = toStorageIdentity(
    textFromUnknown(
     row["Video ID"] || row.Dimension || row.videoId || getTitle(row, index),
    ),
   )
   if (!identity) return
   setVideoFlags?.(identity, { includeOnly: true, excludeAnalysis: false })
  })
 }

 const clearFlagsOnVisible = () => {
  visibleVideoIdentities.forEach((identity) => {
   if (!identity) return
   setVideoFlags?.(identity, {
    excludeAnalysis: false,
    includeOnly: false,
    priorityAnalysis: false,
   })
  })
 }

 type CapsuleOption<T extends string> = { id: T; label: string }

 const CapsuleToggle = <T extends string,>({
  value,
  options,
  onChange,
  ariaLabel,
 }: {
  value: T
  options: Array<CapsuleOption<T>>
  onChange: (next: T) => void
  ariaLabel: string
 }) => (
  <div
   role="group"
   aria-label={ariaLabel}
   className="inline-flex h-[40px] p-[3px] border-[4px] border-black rounded-[14px] bg-white items-center gap-1 shadow-[2px_2px_0px_0px_black]">
   {options.map((opt) => {
    const active = opt.id === value
    return (
     <button
      key={opt.id}
      type="button"
      onClick={(event) => {
       event.stopPropagation()
       onChange(opt.id)
      }}
      className={`h-full px-4 rounded-[10px] text-[10px] font-black uppercase tracking-wide transition-all border-[2px] ${
       active
        ? "bg-black text-white border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.65)]"
        : "bg-white text-black/35 border-transparent"
      }`}
      aria-pressed={active}>
      {opt.label}
     </button>
)
   })}
  </div>
 )

 const renderDataManager = () => {
  const stats = selectedMetricSummary
  return (
   <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
     <div className="space-y-3 flex flex-col">
      <button
       onClick={() => globalSyncData({ batchMode: "initial" })}
       disabled={isSyncing}
       className={`flex-1 min-h-[48px] border-[3px] border-black rounded-xl bg-[#4FFF5B] shadow-[4px_4px_0px_0px_black] font-[1000] uppercase tracking-tight text-[13px] flex items-center justify-center gap-2 transition-all ${
        isSyncing
         ? "opacity-50 cursor-not-allowed translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_0px_black]"
         : "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_black] hover:-translate-y-0.5"
       }`}>
       {isSyncing ? (
        <RefreshCw size={18} strokeWidth={3} className="animate-spin" />
       ) : (
        <RefreshCw size={18} strokeWidth={3} />
       )}
       Full Sync
      </button>
      <button
       onClick={() => globalSyncData({ batchMode: "append" })}
       disabled={isSyncing}
       className={`flex-1 min-h-[48px] border-[3px] border-black rounded-xl bg-[#CCFF00] shadow-[4px_4px_0px_0px_black] font-[1000] uppercase tracking-tight text-[13px] flex items-center justify-center gap-2 transition-all ${
        isSyncing
         ? "opacity-50 cursor-not-allowed translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_0px_black]"
         : "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_black] hover:-translate-y-0.5"
       }`}>
       <Database size={16} strokeWidth={3} />
       Load Next 250
      </button>
     </div>
     <div className="space-y-3 flex flex-col">
      <div className="relative text-black flex-1 min-h-[48px]" ref={uploadMenuRef}>
       <button
        type="button"
        onClick={() => setUploadMenuOpen((open) => !open)}
        className="w-full h-full bg-[#24D3FF] border-[3px] border-black rounded-xl px-4 shadow-[4px_4px_0px_0px_black] flex items-center justify-between font-black uppercase text-[12px] tracking-wide hover:-translate-y-0.5 transition-all">
        <span>{selectedUploadType.label}</span>
        <ChevronDown
         size={14}
         strokeWidth={4}
         className={uploadMenuOpen ? "rotate-180" : ""}
        />
       </button>
       {uploadMenuOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border-[4px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden z-40 max-h-[280px] overflow-y-auto">
         {UPLOAD_TYPE_OPTIONS.map((option) => (
          <button
           key={option.value}
           onClick={() => {
            setPreUploadType(option.value)
            setUploadMenuOpen(false)
           }}
           className={`w-full h-6 px-4 text-left font-black uppercase text-[10px] tracking-widest border-b-[2px] border-black/10 last:border-b-0 hover:bg-gray-50 transition-colors ${option.menuClass}`}>
           {option.label}
          </button>
         ))}
        </div>
       )}
      </div>
      <button
       onClick={() => fileInputRef.current?.click()}
       className="flex-1 min-h-[48px] bg-[#24D3FF] border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_black] font-black uppercase text-[12px] tracking-widest flex items-center justify-center gap-3 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_black] transition-all">
       <Upload size={18} strokeWidth={3} />
       Upload CSV/ZIP/FOLDER
      </button>
     </div>
     <div className="flex flex-col">
      <button
       onClick={runAnalysis}
       disabled={analysisLoading || filteredUnifiedRows.length === 0}
       className={`w-full h-full min-h-[108px] border-[3px] border-black rounded-xl bg-[#FFE357] shadow-[4px_4px_0px_0px_black] font-[1000] uppercase tracking-tighter text-[18px] flex items-center justify-center gap-4 transition-all ${
        analysisLoading || filteredUnifiedRows.length === 0
         ? "opacity-50 cursor-not-allowed translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_0px_black]"
         : "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_black] hover:-translate-y-1"
       }`}>
       {analysisLoading ? (
        <Activity size={24} strokeWidth={3.5} className="animate-spin" />
       ) : (
        <Zap size={24} strokeWidth={3.5} />
       )}
       Generate Report
      </button>
     </div>
    </div>

    <div className="border-[3px] border-black rounded-xl p-3 bg-white min-h-[50px] flex items-center justify-between">
     {csvFiles.length === 0 ? (
      <p className="text-[11px] font-black uppercase tracking-widest text-black/30">
       NO UPLOADED DATA SOURCES YET
      </p>
     ) : (
      <div className="flex flex-wrap gap-2 flex-1">
       {csvFiles.map((file) => (
        <div
         key={file.id}
         className={`inline-flex items-center gap-2 border-[2px] border-black rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider ${getCsvTagColorClass(
          file.tag,
         )}`}>
         <span className="max-w-[150px] truncate">{file.name}</span>
         <button
          onClick={() => removeFile(file.id)}
          className="hover:scale-125 transition-transform">
          <X size={12} strokeWidth={3} />
         </button>
        </div>
       ))}
      </div>
     )}
     <button
      onClick={clearFiles}
      className="px-3 py-1.5 border-[2px] border-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 flex items-center gap-1 shrink-0 ml-4">
      <Trash2 size={12} strokeWidth={3} /> Clear All
     </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 text-[9px] font-black uppercase tracking-widest text-black/40 px-2 mt-2">
     <p>Data Window: {selectedWindowLabel}</p>
     <p className="md:text-center">
      Source Mode: {syncSourceMode.split("_").join(" ")}
     </p>
     <p className="md:text-right">
      Write Target: {storageMode === "both" ? "Sync + Storage" : storageMode}
     </p>
     <p>Sync Status: {syncStatus.phase.toUpperCase()}</p>
     <p className="md:col-span-2 md:text-right">
      Video Cursor: {syncBatch.cursor.toLocaleString()} · Last Batch:{" "}
      {syncBatch.lastBatchCount}
     </p>
    </div>

    <div className="border-[3px] border-black rounded-xl p-4 bg-white space-y-3">
     <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-[2px] border-black pb-2 gap-2">
      <h4 className="text-[11px] font-[1000] uppercase tracking-widest text-black/60">
       Pipeline Integrity Checks
      </h4>
      <button
       onClick={clearPipelineLogs}
       className="text-[9px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 flex items-center gap-1">
       <Trash2 size={10} strokeWidth={3} /> Clear Logs
      </button>
     </div>

     <div className="flex flex-wrap gap-2">
      {analyticsGroupStatus.length === 0 ? (
       <span className="text-[10px] font-black uppercase tracking-widest text-black/30 italic">
        No checks performed
       </span>
      ) : (
       analyticsGroupStatus.map((group) => (
        <div
         key={group.key}
         className={`px-3 py-1.5 rounded-lg border-[2px] border-black text-[9px] font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_0px_black] ${
          group.ok ? "bg-[#C9F830]" : "bg-[#FF3399] text-white"
         }`}>
         {group.ok ? (
          <Check size={12} strokeWidth={4} />
         ) : (
          <X size={12} strokeWidth={4} />
         )}
         {group.key.split("_").join(" ")}
        </div>
      ))
      )}
     </div>

     <div className="flex flex-wrap gap-2 pt-2 border-t border-black/10">
      {toolCapabilityHealth.map((entry) => (
       <div
        key={entry.toolId}
        className={`px-2 py-1 rounded border-2 border-black text-[8px] font-black uppercase tracking-wider ${
         entry.status === "full"
          ? "bg-[#C9F830]"
          : entry.status === "partial"
           ? "bg-[#FFE066]"
           : "bg-[#FF3399] text-white"
        }`}>
        {entry.toolId}: {entry.status}
       </div>
      ))}
     </div>

     <div className="mt-4 pt-4 border-t-2 border-black/5">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#FF3399]">
       import YouTube studio analytics CSV file to add impressions and click
       through rates statistics
      </p>
     </div>
    </div>

    <div className="flex justify-end pt-1">
     <p className="text-[9px] font-black uppercase tracking-widest text-black/40 flex items-center gap-1">
      <Clock3 size={10} strokeWidth={3} />
      LAST SYNC:{" "}
      {analyticsResult?.meta?.generatedAt
       ? new Date(analyticsResult.meta.generatedAt).toLocaleString()
       : "NOT SYNCED YET"}
     </p>
    </div>
   </div>
  )
 }

const renderDataViz = () => {
  if (filteredUnifiedRows.length === 0 && dailySeries.length === 0) {
   return (
    <div className="border-[4px] border-black rounded-xl bg-white p-10 text-center">
     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
      Data Visualizations
     </p>
     <p className="text-2xl font-[1000] uppercase tracking-tight mt-2">
      No statistics to visualize yet
     </p>
    </div>
   )
  }
 
  const railPrimary = railTransition.current || engagementHoverState

  return (
   <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-black/55">
     <span>
      Data Window: {selectedWindowLabel}
      {dataWindowLabel ? ` (${dataWindowLabel})` : ""}
     </span>
     <span>Visualizer Stations: Expanded Set</span>
    </div>

    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
     <div className="bg-white border-[4px] border-black rounded-xl p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
       Total Views
      </p>
      <p className="text-3xl font-[1000] tracking-tight">
       {stats.views.toLocaleString()}
      </p>
     </div>
     <div className="bg-white border-[4px] border-black rounded-xl p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
       Watch Hours
      </p>
      <p className="text-3xl font-[1000] tracking-tight">
       {stats.watchHours.toLocaleString()}
      </p>
     </div>
     <div className="bg-white border-[4px] border-black rounded-xl p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
       Subscribers
      </p>
      <p className="text-3xl font-[1000] tracking-tight">
       {stats.subscribers.toLocaleString()}
      </p>
     </div>
     <div className="bg-white border-[4px] border-black rounded-xl p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
       Revenue
      </p>
      <p className="text-3xl font-[1000] tracking-tight">
       ${stats.revenue.toLocaleString()}
      </p>
     </div>
    </div>

    <div className="bg-white border-[4px] border-black rounded-2xl overflow-hidden">
     <div className="h-[32px] border-b-[4px] border-black bg-[#FF9D1A] px-4 flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-[0.24em] text-black/75">
       Top 50 Recent by {engagementSortMetric}
      </span>
      <span className="h-[22px] px-3 rounded-[8px] border-[3px] border-black bg-black text-[#CCFF00] text-[10px] font-black uppercase tracking-wider inline-flex items-center">
       Highest
      </span>
     </div>
     <div className="h-[56px] border-b-[4px] border-black bg-white px-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
       <span className="h-4 w-4 rounded-full border-[2px] border-black bg-[#00CCFF]" />
       <div className="relative min-w-0 h-[36px] flex items-center">
         <span
          key={railPrimary?.videoId || "empty-title"}
          className={`text-[34px] font-[1000] uppercase tracking-tight leading-none truncate transition-opacity duration-200 ${
           railTransition.fading ? "opacity-75" : "opacity-100"
          }`}>
          {railPrimary?.title || "No video selected"}
         </span>
        </div>
      </div>
      <div className="flex items-center gap-5">
       <div className="text-center min-w-[54px]">
        <p key={`likes-${railPrimary?.videoId || "none"}`} className={`text-[24px] font-[1000] leading-none transition-opacity duration-200 ${railTransition.fading ? "opacity-75" : "opacity-100"}`}>{railPrimary?.likes || 0}</p>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/55">Likes</p>
       </div>
       <div className="text-center min-w-[54px]">
        <p key={`comments-${railPrimary?.videoId || "none"}`} className={`text-[24px] font-[1000] leading-none transition-opacity duration-200 ${railTransition.fading ? "opacity-75" : "opacity-100"}`}>{railPrimary?.comments || 0}</p>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/55">Comments</p>
       </div>
       <div className="text-center min-w-[54px]">
        <p key={`shares-${railPrimary?.videoId || "none"}`} className={`text-[24px] font-[1000] leading-none transition-opacity duration-200 ${railTransition.fading ? "opacity-75" : "opacity-100"}`}>{railPrimary?.shares || 0}</p>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/55">Shares</p>
       </div>
       <div className="text-center min-w-[54px]">
        <p key={`subs-${railPrimary?.videoId || "none"}`} className={`text-[24px] font-[1000] leading-none transition-opacity duration-200 ${railTransition.fading ? "opacity-75" : "opacity-100"}`}>{railPrimary?.subscribers || 0}</p>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/55">Subs</p>
       </div>
      </div>
     </div>

     <div className="p-4 pt-5">
     <div className="relative h-[340px]">
       {engagementMapSeries.length > 0 && (
        <div className="absolute inset-x-0 top-0 bottom-[42px] pointer-events-none z-0">
         <div
          className="h-full w-full"
          style={{
           display: "grid",
           gridTemplateColumns: `repeat(${engagementMapSeries.length}, minmax(0, 1fr))`,
          }}>
          {engagementMapSeries.map((point, idx) => (
           <div
            key={`eng-zone-highlight-${point.videoId || point.label}`}
            className="h-full transition-opacity duration-200 ease-out"
            style={{
             opacity: idx === engagementHoverIndex ? 1 : 0,
             background: "rgba(156, 163, 175, 0.16)",
            }}
           />
          ))}
         </div>
        </div>
       )}

       <div className="relative z-10 h-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
         <LineChart
          data={engagementMapSeries}
          margin={{ top: 8, right: 22, left: 10, bottom: 20 }}>
          <CartesianGrid stroke="#d1d5db" strokeOpacity={0.7} />
          <XAxis
           dataKey="label"
           stroke="#000"
           tick={false}
           axisLine={false}
           tickLine={false}
           label={{ value: "VIDEOS (SORTED)", position: "insideBottom", dy: 14, style: { fontSize: 11, fontWeight: 900, fontStyle: "italic" } }}
          />
          <YAxis
           yAxisId="engagement"
           stroke="#000"
           tick={{ fontSize: 11, fontWeight: 900, fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}
           label={{ value: "ENGAGEMENT METRICS", angle: -90, position: "insideLeft", style: { fontSize: 11, fontWeight: 900, fontStyle: "italic" } }}
          />
          <YAxis
           yAxisId="likes"
           orientation="right"
           stroke="#000"
           tick={{ fontSize: 11, fontWeight: 900, fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}
           label={{ value: "LIKES", angle: 90, position: "insideRight", style: { fontSize: 11, fontWeight: 900, fontStyle: "italic" } }}
          />
          {engagementVisibleMetrics.includes("comments") && (
           <Line
            key={`line-comments-${engagementSortMetric}`}
            type="monotone"
            yAxisId="engagement"
            dataKey="comments"
            stroke="#00CCFF"
            strokeWidth={2.5}
            dot={(props: any) =>
             props?.index === engagementHoverIndex ? (
              <circle cx={props.cx} cy={props.cy} r={5} fill="#00CCFF" stroke="#000" strokeWidth={1.5} />
             ) : (
              <g />
             )
            }
            isAnimationActive
            animationDuration={engagementSortMetric === "comments" ? 3000 : 1000}
           />
          )}
          {engagementVisibleMetrics.includes("subscribers") && (
           <Line
            key={`line-subscribers-${engagementSortMetric}`}
            type="monotone"
            yAxisId="engagement"
            dataKey="subscribers"
            stroke="#B5E81C"
            strokeWidth={2.5}
            dot={(props: any) =>
             props?.index === engagementHoverIndex ? (
              <circle cx={props.cx} cy={props.cy} r={5} fill="#B5E81C" stroke="#000" strokeWidth={1.5} />
             ) : (
              <g />
             )
            }
            isAnimationActive
            animationDuration={engagementSortMetric === "subscribers" ? 3000 : 1000}
           />
          )}
          {engagementVisibleMetrics.includes("shares") && (
           <Line
            key={`line-shares-${engagementSortMetric}`}
            type="monotone"
            yAxisId="engagement"
            dataKey="shares"
            stroke="#FFD400"
            strokeWidth={2.5}
            dot={(props: any) =>
             props?.index === engagementHoverIndex ? (
              <circle cx={props.cx} cy={props.cy} r={5} fill="#FFD400" stroke="#000" strokeWidth={1.5} />
             ) : (
              <g />
             )
            }
            isAnimationActive
            animationDuration={engagementSortMetric === "shares" ? 3000 : 1000}
           />
          )}
          {engagementVisibleMetrics.includes("likes") && (
           <Line
            key={`line-likes-${engagementSortMetric}`}
            type="monotone"
            yAxisId="likes"
            dataKey="likes"
            stroke="#FF7497"
            strokeWidth={2.5}
            dot={(props: any) =>
             props?.index === engagementHoverIndex ? (
              <circle cx={props.cx} cy={props.cy} r={5} fill="#FF7497" stroke="#000" strokeWidth={1.5} />
             ) : (
              <g />
             )
            }
            isAnimationActive
            animationDuration={engagementSortMetric === "likes" ? 3000 : 1000}
           />
          )}
         </LineChart>
        </ResponsiveContainer>
       </div>

       {engagementMapSeries.length > 0 && (
        <div className="absolute inset-x-0 top-0 bottom-[42px] grid pointer-events-auto">
         <div
          className="h-full w-full"
          style={{
           display: "grid",
           gridTemplateColumns: `repeat(${engagementMapSeries.length}, minmax(0, 1fr))`,
          }}>
          {engagementMapSeries.map((point, idx) => (
           <button
            key={`eng-zone-${point.videoId || point.label}`}
            type="button"
            onMouseEnter={() => setEngagementHoverIndex(idx)}
            className="h-full w-full bg-transparent border-0 p-0 m-0"
            aria-label={`Engagement zone ${idx + 1}`}
           />
          ))}
         </div>
        </div>
       )}
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
       {(
        [
         { key: "comments", label: "Comments", color: "#00CCFF" },
         { key: "subscribers", label: "Subscribers", color: "#B5E81C" },
         { key: "shares", label: "Shares", color: "#FFD400" },
         { key: "likes", label: "Likes", color: "#FF7497" },
        ] as const
       ).map((metric) => (
        <button
         key={metric.key}
         type="button"
         onClick={() => setEngagementSortMetric(metric.key)}
         className={`h-8 px-3 rounded-[12px] border-[3px] border-black text-[10px] font-black uppercase tracking-wide inline-flex items-center gap-2 transition-all ${
          engagementSortMetric === metric.key
           ? "bg-black text-white"
           : "bg-white text-black"
         }`}>
         <span
          className="h-3 w-3 rounded-full border border-black"
          style={{ backgroundColor: metric.color }}
         />
         {metric.label}
        </button>
       ))}
      </div>
     </div>
    </div>

    <div className="bg-white border-[4px] border-black rounded-2xl overflow-hidden">
     <div className="h-[52px] border-b-[4px] border-black bg-[#C9F830] px-4 flex items-center justify-between">
      <span className="text-[30px] font-[1000] uppercase tracking-tight leading-none">
       Video Value Matrix
      </span>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/60">
       CTR × Retention × Views
      </span>
     </div>
     <div className="h-[42px] border-b-[3px] border-black px-4 flex items-center justify-between">
      <div className="text-[20px] font-[1000] uppercase tracking-tight truncate">
       {activeValueMatrixPoint?.title || "Hover over a bubble"}
      </div>
      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider">
       <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-[#FF7497] border border-black/20" />Shorts</span>
       <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-[#00CCFF] border border-black/20" />Long-Form</span>
       <span>CTR {activeValueMatrixPoint?.ctr.toFixed(2) || "0.00"}%</span>
       <span>RET {activeValueMatrixPoint?.retention.toFixed(1) || "0.0"}%</span>
       <span>VIEWS {(activeValueMatrixPoint?.views || 0).toLocaleString()}</span>
      </div>
     </div>
     <div className="p-4 relative">
     <div className="h-[290px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <ScatterChart
         margin={{ top: 8, right: 20, bottom: 8, left: 8 }}
         onMouseMove={(state: { activePayload?: Array<{ payload?: EngagementMapPoint }> }) => {
          const point = state.activePayload?.[0]?.payload
          const nextId =
           point?.videoId ||
           (point?.title ? toStorageIdentity(point.title) : "")
          if (nextId) setValueMatrixHoverVideoId(nextId)
         }}>
         <CartesianGrid stroke="#d1d5db" strokeOpacity={0.72} />
         <XAxis type="number" dataKey="ctr" stroke="#000" domain={[0, 10]} tick={{ fontSize: 11, fontWeight: 900 }} label={{ value: "CTR %", position: "insideBottom", offset: -4, style: { fontSize: 12, fontWeight: 900 } }} />
         <YAxis type="number" dataKey="retention" stroke="#000" domain={[0, 150]} tick={{ fontSize: 11, fontWeight: 900 }} label={{ value: "RETENTION %", angle: -90, position: "insideLeft", style: { fontSize: 12, fontWeight: 900 } }} />
         <ZAxis dataKey="views" range={[60, 900]} />
         <ReferenceArea x1={0} x2={VALUE_MATRIX_THRESHOLDS.ctr} y1={VALUE_MATRIX_THRESHOLDS.retention} y2={150} fill="#dbeafe" fillOpacity={0.16} />
         <ReferenceArea x1={VALUE_MATRIX_THRESHOLDS.ctr} x2={10} y1={VALUE_MATRIX_THRESHOLDS.retention} y2={150} fill="#dcfce7" fillOpacity={0.16} />
         <ReferenceArea x1={0} x2={VALUE_MATRIX_THRESHOLDS.ctr} y1={0} y2={VALUE_MATRIX_THRESHOLDS.retention} fill="#fee2e2" fillOpacity={0.16} />
         <ReferenceArea x1={VALUE_MATRIX_THRESHOLDS.ctr} x2={10} y1={0} y2={VALUE_MATRIX_THRESHOLDS.retention} fill="#fef3c7" fillOpacity={0.16} />
         <ReferenceLine x={VALUE_MATRIX_THRESHOLDS.ctr} stroke="#111827" strokeOpacity={0.7} strokeWidth={1.5} />
         <ReferenceLine y={VALUE_MATRIX_THRESHOLDS.retention} stroke="#111827" strokeOpacity={0.7} strokeWidth={1.5} />
         <Tooltip
          cursor={{ stroke: "#111827", strokeOpacity: 0.38, strokeWidth: 1 }}
          contentStyle={{ border: "3px solid black", borderRadius: "12px", fontWeight: 900 }}
          labelFormatter={(_label: unknown, payload: Array<{ payload?: EngagementMapPoint }>) =>
           payload?.[0]?.payload?.title || ""
          }
          formatter={(value: unknown, key: unknown) => {
           const keyText = String(key)
           if (keyText === "views") return [Number(value || 0).toLocaleString(), "Views"]
           if (keyText === "retention") return [`${Number(value || 0).toFixed(1)}%`, "Retention"]
           if (keyText === "ctr") return [`${Number(value || 0).toFixed(2)}%`, "CTR"]
           return [Number(value || 0), keyText]
          }}
         />
         <Scatter data={valueMatrixSeries}>
          {valueMatrixSeries.map((entry) => (
           <Cell
            key={`value-matrix-${entry.videoId || entry.title}`}
            fill={entry.format === "shorts" ? "#FF7497" : "#00CCFF"}
            fillOpacity={0.8}
            stroke="none"
           />
          ))}
         </Scatter>
       </ScatterChart>
      </ResponsiveContainer>
     </div>
      {valueMatrixSeries.length === 0 && (
       <div className="absolute inset-0 p-6 flex items-center justify-center pointer-events-none">
        <div className="max-w-[560px] w-full border-[3px] border-black rounded-xl bg-white/95 p-5 text-center shadow-[6px_6px_0px_0px_black]">
         <p className="text-[11px] font-black uppercase tracking-[0.18em] text-black/55">
          Data missing for this chart
         </p>
         <p className="text-2xl font-[1000] uppercase tracking-tight mt-2">
          Value Matrix needs valid CTR, retention, and views
         </p>
         <p className="text-[11px] font-black uppercase tracking-[0.14em] text-black/55 mt-3">
          Valid rows: {valueMatrixMissingSummary.validRows}
         </p>
         <p className="text-[10px] font-black uppercase tracking-[0.14em] text-black/45 mt-2">
          Missing metrics:{" "}
          {valueMatrixMissingSummary.missingMetrics.length > 0
           ? valueMatrixMissingSummary.missingMetrics.join(", ")
           : "none"}
         </p>
        </div>
       </div>
      )}
      <div className="absolute left-8 top-8 text-[10px] font-black uppercase tracking-[0.18em] text-black/30">Hidden Gems</div>
      <div className="absolute right-8 top-8 text-[10px] font-black uppercase tracking-[0.18em] text-black/30">Gold Mine</div>
      <div className="absolute left-8 bottom-8 text-[10px] font-black uppercase tracking-[0.18em] text-black/30">Need Work</div>
      <div className="absolute right-8 bottom-8 text-[10px] font-black uppercase tracking-[0.18em] text-black/30">Clickbait</div>
     </div>
    </div>
   </div>
  )
 }

 const renderAnalysis = () => {
  return (
   <div className="border-[4px] border-black rounded-xl bg-white p-8 text-center">
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
     Unified Report Pipeline
    </p>
    <p className="text-2xl font-[1000] uppercase tracking-tight mt-2">
     Ultimate report authority is now consolidated on /performance.
    </p>
    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-black/55">
     Use the Performance Ultimate Report toolbox above to generate the full report.
    </p>
   </div>
  )
 }

 const renderDataTables = () => (
  <div className="space-y-4">


    <div className="bg-[#CCFF00] border-b-[4px] border-black px-4 py-2 flex flex-wrap items-center gap-2">
     {tableDatasets.map((dataset) => (
      <div key={dataset.id} className="inline-flex items-center gap-2">
       <button
       onClick={() => {
       setTableDataset(dataset.id)
       setSelectedRowIds(new Set())
       if (dataset.id === "daily") {
         setSortColumn("Date")
         setSortDir("desc")
        } else if (dataset.id === "country") {
         setSortColumn("Views")
         setSortDir("desc")
        }
       }}
        className={`px-3 py-2 border-[3px] border-black rounded-lg text-[10px] font-black uppercase tracking-wider ${
         tableDataset === dataset.id
          ? "bg-black text-white"
          : "bg-white text-black"
        }`}>
        {dataset.label}
       </button>
       {dataset.id === "traffic" && tableDataset === "traffic" && (
        <select
         value={trafficDatasetMode}
         onChange={(event) =>
          setTrafficDatasetMode(event.target.value as TrafficDatasetMode)
         }
         className="px-2 py-2 border-[3px] border-[#0055CC] rounded-lg bg-white text-[10px] font-black uppercase tracking-[0.08em]">
         <option value="all">All Traffic Sources</option>
         <option value="youtube_traffic">YouTube Traffic</option>
         <option value="external">External Traffic Sources</option>
         <option value="suggested_videos">Suggested Videos</option>
         <option value="youtube_search">YouTube Search</option>
        </select>
       )}
      </div>
     ))}
    </div>

    <div className="overflow-auto max-h-[620px]">
     {tableHeaders.length === 0 ? (
      <div className="p-8 text-center text-sm font-black uppercase tracking-wider text-black/35">
       No table data available for {activeTableDataset.label}
      </div>
     ) : (
      <table className="w-max border-collapse whitespace-nowrap">
       <thead className="sticky top-0 bg-[#EDEDED] text-black z-10">
        <tr>
         <th className="p-2 border-b-[3px] border-black border-r border-black/20 w-12 text-center bg-[#EDEDED]">
          <input
           type="checkbox"
           checked={allVisibleSelected}
           onChange={() =>
            allVisibleSelected ? unselectAllVisible() : selectAllVisible()
           }
           className="h-4 w-4 border-[2px] border-black accent-black"
          />
         </th>
         <th
          className="p-2 border-b-[3px] border-black border-r border-black/20 w-8 text-center bg-[#EDEDED]"
          title="Exclude from Analytics">
          <span className="text-[10px] font-black uppercase text-black">
           EX
          </span>
         </th>
         <th
          className="p-2 border-b-[3px] border-black border-r border-black/20 w-8 text-center bg-[#EDEDED]"
          title="Include Only (Global Whitelist)">
          <span className="text-[10px] font-black uppercase text-[#00CCFF]">
           IN
          </span>
         </th>

          {orderedTableHeaders.map((header) => {
           const isSorted = sortColumn === header
           const arrow = isSorted ? (sortDir === "desc" ? " ▼" : " ▲") : ""
           const headerLabel = toDisplayHeaderLabel(header)
           const headerWords = headerLabel.split(/\s+/).filter(Boolean)
           const hasMultipleWords = headerWords.length >= 2
           const midpoint = Math.ceil(headerWords.length / 2)
           const headerLine1 = hasMultipleWords ? headerWords.slice(0, midpoint).join(" ") : headerLabel
           const headerLine2 = hasMultipleWords ? headerWords.slice(midpoint).join(" ") : ""
           return (
            <th
             key={header}
             draggable
             title={`Sort by ${header}`}
             onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", header)
              event.dataTransfer.effectAllowed = "move"
             }}
             onDragOver={(event) => {
              event.preventDefault()
              event.dataTransfer.dropEffect = "move"
             }}
             onDrop={(event) => {
              event.preventDefault()
              const draggedHeader = event.dataTransfer.getData("text/plain")
              if (!draggedHeader || draggedHeader === header) return
              setTableColumnOrder((prev) => {
               const base = prev.length ? [...prev] : [...orderedTableHeaders]
               const from = base.indexOf(draggedHeader)
               const to = base.indexOf(header)
               if (from < 0 || to < 0) return base
               const [moved] = base.splice(from, 1)
               base.splice(to, 0, moved)
               return base
              })
             }}
             onClick={() => {
              if (sortColumn === header) {
               if (sortDir === "desc") setSortDir("asc")
               else {
                setSortColumn(null)
                setSortDir("desc")
               }
              } else {
               setSortColumn(header)
               setSortDir("desc")
              }
             }}
             className={`p-2 text-[10px] font-black uppercase tracking-widest border-b-[3px] border-black border-r border-black/20 align-middle cursor-move select-none transition-colors bg-[#EDEDED] hover:bg-[#CCFF00]/30 ${
              isSorted ? "bg-[#CCFF00]/50" : ""
             }`}>
             <span className="block leading-tight text-center whitespace-normal break-words mx-auto">
              {headerLine1}
              {headerLine2 ? <><br />{headerLine2}</> : null}
              {arrow}
             </span>
            </th>
           )
          })}
         </tr>
        </thead>
       <tbody>
        {tableRows.map((row, rowIndex) => {
         const isSelected = selectedRowIds.has(row._id)
         const videoIdentity = toStorageIdentity(
          textFromUnknown(
           row["Video ID"] || row.Dimension || row.videoId || getTitle(row, rowIndex),
          ),
         )
         return (
          <tr
           key={row._id}
           className={
            isSelected ? "bg-[#FFF2A8]" : "odd:bg-white even:bg-gray-50"
           }>
           <td className="p-2 border-r border-black/10 border-b border-black/10 text-center">
            <input
             type="checkbox"
             checked={isSelected}
             onChange={() => toggleRowSelection(row._id)}
             className="h-4 w-4 border-[2px] border-black accent-black cursor-pointer"
            />
           </td>
           <td className="p-2 border-r border-black/10 border-b border-black/10 text-center">
           <input
             type="checkbox"
             title="Exclude from Analytics"
             checked={videoFlags?.[videoIdentity]?.excludeAnalysis || false}
             onChange={(e) =>
              setVideoFlags?.(videoIdentity, {
               excludeAnalysis: e.target.checked,
               includeOnly: false,
              })
             }
             className="h-4 w-4 border-[2px] border-black accent-black cursor-pointer"
            />
           </td>
           <td className="p-2 border-r border-black/10 border-b border-black/10 text-center">
            <input
             type="checkbox"
             title="Include Only (Global)"
             checked={
              videoFlags?.[videoIdentity]?.includeOnly ||
              videoFlags?.[videoIdentity]?.priorityAnalysis ||
              false
             }
             onChange={(e) =>
              setVideoFlags?.(videoIdentity, {
               includeOnly: e.target.checked,
               priorityAnalysis: e.target.checked,
               excludeAnalysis: false,
              })
             }
             className="h-4 w-4 border-[2px] border-black accent-[#00CCFF] cursor-pointer"
            />
           </td>
           {orderedTableHeaders.map((header) => {
            const cellValue = getTableCellValue(
             row,
             header,
             rowIndex,
             activeTableDataset.id,
            )
            const isTitle = header === "Video title" || header === "Video"
            const isTextColumn = ["Video title", "Video", "Video ID", "Format", "Upload date", "Date", "Type", "Dimension", "Title"].includes(header)

            return (
             <td
              key={`${row._id}-${header}`}
              title={cellValue}
              className={`p-2 text-xs font-bold border-r border-black/10 border-b border-black/10 ${!isTextColumn ? "text-right pr-4" : "text-left pl-2"}`}>
              {isTitle && videoIdentity && looksLikeVideoId(videoIdentity) ? (
               <div className="flex items-center gap-2">
                <a
                 href={`https://www.youtube.com/watch?v=${videoIdentity}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex-shrink-0 inline-flex items-center justify-center h-5 w-5 border-[2px] border-black rounded bg-white text-black hover:bg-black hover:text-[#CCFF00] hover:scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                 title="Open video on YouTube">
                 <ExternalLink size={10} strokeWidth={3} className="-mt-0.5 ml-0.5" />
                </a>
                <span className="block">
                 {cellValue}
                </span>
               </div>
              ) : (
               <span
                className="block">
                {cellValue}
               </span>
              )}
             </td>
            )
           })}
          </tr>
         )
        })}
       </tbody>
      </table>
     )}
    </div>

    <div className="border-t-[4px] border-black px-4 py-3 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 bg-white">
     <div className="text-[10px] font-black uppercase tracking-widest text-black/60">
      Showing {tableRows.length} / {filteredTableRows.length} rows
      <span className="mx-2 text-black/30">|</span>
      Selected {selectedRowIds.size}
     </div>
     <div className="flex flex-wrap items-center gap-2">
      <button
       onClick={() =>
        setTableLimit((value) =>
         Math.min(value + 500, filteredTableRows.length),
        )
       }
       disabled={tableRows.length >= filteredTableRows.length}
       className="px-3 py-2 border-[3px] border-black rounded-lg bg-[#CCFF00] text-[10px] font-black uppercase tracking-wider disabled:opacity-50">
       Load 500 More
      </button>
      <button
       onClick={selectAllVisible}
       className="px-3 py-2 border-[3px] border-black rounded-lg bg-white text-[10px] font-black uppercase tracking-wider">
       Select Visible
      </button>
      <button
       onClick={unselectAllVisible}
       className="px-3 py-2 border-[3px] border-black rounded-lg bg-white text-[10px] font-black uppercase tracking-wider">
       Clear Visible
      </button>
      <button
       onClick={() => setSelectedRowIds(new Set())}
       className="px-3 py-2 border-[3px] border-black rounded-lg bg-white text-[10px] font-black uppercase tracking-wider">
       Clear Selection
      </button>
      <button
       onClick={applySelectedToExclude}
       disabled={selectedRowIds.size === 0}
       className="px-3 py-2 border-[3px] border-black rounded-lg bg-[#FF7497] text-[10px] font-black uppercase tracking-wider disabled:opacity-50">
       Apply Selected → Exclude
      </button>
      <button
       onClick={applySelectedToIncludeOnly}
       disabled={selectedRowIds.size === 0}
       className="px-3 py-2 border-[3px] border-black rounded-lg bg-[#00CCFF] text-[10px] font-black uppercase tracking-wider disabled:opacity-50">
       Apply Selected → Include Only
      </button>
      <button
       onClick={clearFlagsOnVisible}
       className="px-3 py-2 border-[3px] border-black rounded-lg bg-[#E5E7EB] text-[10px] font-black uppercase tracking-wider">
       Clear Visible Flags
      </button>
     </div>
     <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-wider text-black/65">
      <span className="inline-flex items-center gap-2">
       <span className="h-3 w-3 border border-black bg-[#FF7497]" />
       Shorts Format
      </span>
      <span className="inline-flex items-center gap-2">
       <span className="h-3 w-3 border border-black bg-[#00CCFF]" />
       Long-Form Format
      </span>
     </div>
    </div>
   </div>
  )

 const renderChannelAnalysisToolbox = () => (
  <div className="space-y-6">
   {renderDataManager()}
   {renderDataTables()}
  </div>
 )

 const renderChannelToolbox = () => (
  <div className="space-y-6">
   <SubToolbox
    title="CHART ROLLOUT 40"
    icon={<ChartColumnBig size={22} strokeWidth={3} className="text-black" />}
    headerColor="bg-[#00CCFF]"
    collapsible
    isOpenInitial
    unmountOnClose
   >
    <PerformanceHubChartRollout />
   </SubToolbox>
   <SubToolbox
    key={`data-viz-${dataVizAutoOpenTick}`}
    title="DATA VISUALIZATIONS"
    icon={<ChartColumnBig size={22} strokeWidth={3} className="text-black" />}
    headerColor="bg-[#CCFF00]"
    collapsible
    isOpenInitial
    unmountOnClose
   >
    {renderDataViz()}
   </SubToolbox>
  </div>
 )

 return (
  <div className="flex flex-col space-y-6 max-w-[1500px] mx-auto pb-24">
   <div className="mt-4 px-2 flex flex-col items-center gap-5">
    <h2 className="text-6xl md:text-7xl font-[1000] uppercase tracking-[calc(-0.06em)] leading-none text-black text-center">
     PERFORMANCE <span className="text-[#00CCFF]">HUB</span>
    </h2>
    <div className="flex flex-wrap items-center justify-center gap-4">
     <p className="text-[10px] font-black uppercase tracking-[0.35em] text-black/30">
      Post-Publish Intelligence
     </p>
     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/50">
      <Clock3 size={14} />
      <span>Last sync: {formatLastSync(lastSyncComplete)}</span>
     </div>
    </div>
  </div>

  <div className="w-full space-y-8">
    <ToolboxScaffold
     title="PERFORMANCE ULTIMATE REPORT / CHANNEL INTELLIGENCE LAB"
     icon={<Zap size={42} className="text-black" />}
     headerColor="bg-[#FF3399]"
     textColor="text-black"
     iconBoxColor="bg-[#FFDD00]"
     collapsible
     isOpen={openTools.has("intelligence-lab")}
     onToggle={() =>
      setOpenTools((previous) => {
       const next = new Set(previous)
       if (next.has("intelligence-lab")) next.delete("intelligence-lab")
       else next.add("intelligence-lab")
       return next
      })
     }
     headerActions={
      <div className="hidden lg:flex items-center gap-4">
       <CapsuleToggle
        value={syncSourceMode}
        options={[
         { id: "api_analytics", label: "API ANALYTICS" },
         { id: "uploads", label: "UPLOADS" },
         { id: "both", label: "BOTH" },
        ]}
        onChange={(next) => { setSyncSourceMode(next); setStoredSyncSourceMode(next); }}
        ariaLabel="Sync Source"
       />
       <CapsuleToggle
        value={storageMode}
        options={[
         { id: "sync", label: "SYNC" },
         { id: "storage", label: "STORAGE" },
         { id: "both", label: "BOTH" },
        ]}
        onChange={(next) => { setStorageMode(next); setStoredStorageMode(next); }}
        ariaLabel="Write Target"
       />
      </div>
     }
     disableCollapseAnimation
     contentClassName="bg-white p-4 md:p-6 lg:p-8">
     {openTools.has("intelligence-lab") && (
      <div className="space-y-8">
       <IntelligenceHub
        mode="ultimate"
        autoContext={ultimateAutoContext}
        dataSources={ultimateDataSources}
       />
       {renderDataManager()}
      </div>
     )}
    </ToolboxScaffold>

    <ToolboxScaffold
     title="MASTER DATA TABLES"
     icon={<Table2 size={42} className="text-black" />}
     headerColor="bg-[#EA73E8]"
     iconBoxColor="bg-[#CCFF00]"
     collapsible
     isOpen={openTools.has("master-tables")}
     onToggle={() =>
      setOpenTools((previous) => {
       const next = new Set(previous)
       if (next.has("master-tables")) next.delete("master-tables")
       else next.add("master-tables")
       return next
      })
     }
     headerActions={
      <div className="hidden lg:flex items-center gap-2">
       <select
        value={analyticsWindow}
        onChange={(event) =>
         setAnalyticsWindow(event.target.value as AnalyticsWindow)
        }
        className="h-10 px-3 border-[3px] border-black rounded-xl text-[10px] font-black uppercase tracking-wider bg-white">
        <option value="lifetime">Lifetime</option>
        <option value="365d">365D</option>
        <option value="90d">90D</option>
        <option value="28d">28D</option>
        <option value="7d">7D</option>
       </select>
       {activeTableDataset.supportsTagFilter && (
        <select
         value={tableTag}
         onChange={(event) => setTableTag(event.target.value)}
         className="h-10 px-3 border-[3px] border-black rounded-xl text-[10px] font-black uppercase tracking-wider bg-white">
         <option value="all">All Tags</option>
         {distinctTags.map((tag) => (
          <option key={tag} value={tag}>
           {tag}
          </option>
         ))}
        </select>
       )}
       <input
        value={tableSearch}
        onChange={(event) => setTableSearch(event.target.value)}
        placeholder="Search Data Tables..."
        className="h-10 w-full lg:w-[280px] px-3 border-[3px] border-black rounded-xl font-black text-xs tracking-wide"
       />
      </div>
     }
     disableCollapseAnimation
     embedded
     contentClassName="bg-white">
     {openTools.has("master-tables") && renderDataTables()}
    </ToolboxScaffold>

    <ToolboxScaffold
     title="CHANNEL"
     icon={<Activity size={42} className="text-black" />}
     headerColor="bg-[#FFDD00]"
     iconBoxColor="bg-[#CCFF00]"
     collapsible
     isOpen={openTools.has("channel")}
     onToggle={() =>
      setOpenTools((previous) => {
       const next = new Set(previous)
       if (next.has("channel")) next.delete("channel")
       else next.add("channel")
       return next
      })
     }
     disableCollapseAnimation
     contentClassName="bg-white p-4 md:p-6 lg:p-8 min-h-[620px]">
     {openTools.has("channel") && renderChannelToolbox()}
    </ToolboxScaffold>
   </div>

   <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-black/35">
    <ChartColumnBig size={14} />
   <span>
     Canonical channel analysis: sync manager, visualizations, tables, oracle report
    </span>
   </div>
   <input
    ref={fileInputRef}
    type="file"
    multiple
    accept=".csv,.zip"
    onChange={handleFileUpload}
    className="hidden"
   />
  </div>
 )
}

export default PerformanceHub
