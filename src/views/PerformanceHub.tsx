import React, { useEffect, useMemo, useRef, useState } from "react"
import {
 Activity,
 Database,
 ChartColumnBig,
 BrainCircuit,
 Table2,
 Upload,
 Trash2,
 X,
 FileText,
 Clock3,
 ChevronDown,
 RefreshCw,
 ExternalLink,
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
} from "recharts"
import { ToolboxScaffold } from "../components/Toolbox"
import { useBrain } from "../context/GlobalDataContext"
import type { AnalyticsResult, CsvFileWithTag, CsvUploadType } from "../types"
import { analyzeChannelData, hasGeminiKey } from "../services/gemini"
import { SystemStatisticsSubToolbox } from "../components/SystemStatisticsSubToolbox"
import ReportViewer from "../components/ReportViewer"
import {
 buildCsvFilesWithTags,
 expandCsvAndZipFiles,
 getCsvTagColorClass,
} from "../services/csvImportUtils"
import {
 mergeAndDedupeRows,
 normalizeAndEnrichRow,
} from "../services/dataForge"
import {
 buildCsvFromRows,
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
 textFromUnknown,
} from "./performanceHubUtils"
import type { UnifiedRow } from "./performanceHubUtils"
import type { AnalyticsWindow } from "../services/analyticsContract"
import {
 canonicalRowsToMasterTableRows,
 getHeaderMetricCell,
 getMasterRows,
 getMetricSummary,
 type MasterTableRow,
} from "../services/analyticsSelectors"
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

type PerformanceTool =
 | "data-manager"
 | "data-viz"
 | "channel-analysis"
 | "data-tables"
type DataSource = "csv" | "api" | "hybrid"

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

const TABLE_DATASET_CONTRACTS: Record<TableDatasetId, TableDatasetContract> = {
 master: {
  id: "master",
  label: "Master Video Table",
  supportsTagFilter: true,
  columns: [
   "Video title",
   "Video ID",
   "Format",
   "Upload date",
   "Views",
   "Watch Time (Hours)",
   "Revenue",
   "Subs +",
   "Likes",
   "Comments",
   "Shares",
   "Engaged views",
   "Length",
   "AVD (Average View Duration)",
  ],
 },
 daily: {
  id: "daily",
  label: "Daily Metrics",
  supportsTagFilter: false,
  columns: [
   "Date",
   "Views",
   "Watch Time (Hours)",
   "Likes",
   "Comments",
   "Shares",
   "Subscribers Gained",
   "Impressions",
   "Click-Through Rate (CTR)",
   "Revenue",
   "CPM",
   "RPM",
   "Engaged views",
   "Engagement Rate",
   "AVD (Average View Duration)",
   "AVP (%)",
  ],
 },
 traffic: {
  id: "traffic",
  label: "Traffic Sources",
  supportsTagFilter: false,
  columns: [
   "Traffic source",
   "Views",
   "Watch Time (Hours)",
   "Likes",
   "Comments",
   "Shares",
   "Subscribers Gained",
   "Impressions",
   "Click-Through Rate (CTR)",
   "Revenue",
  ],
 },
 audience: {
  id: "audience",
  label: "Audience",
  supportsTagFilter: false,
  columns: [
   "Age Group",
   "Gender",
   "Views",
   "Watch Time (Hours)",
   "New Viewers",
   "Returning Viewers",
   "Casual viewers",
   "Regular viewers",
   "Unique viewers",
   "Engaged views",
   "Engagement Rate",
   "AVD (Average View Duration)",
   "AVP (%)",
  ],
 },
 country: {
  id: "country",
  label: "Geography",
  supportsTagFilter: false,
  columns: [
   "Country",
   "Geography",
   "Viewer percentage",
   "Views",
   "Watch Time (Hours)",
   "Subscribers Gained",
   "Revenue",
  ],
 },
 device: {
  id: "device",
  label: "Audience Devices",
  supportsTagFilter: false,
  columns: [
   "Device type",
   "Viewer percentage",
   "Views",
   "Watch Time (Hours)",
   "Subscribers Gained",
   "Revenue",
  ],
 },
}

const METRIC_APPLICABILITY_RULES: Record<string, MetricApplicabilityRule> = {
 "STW %": "shorts-only",
 "End screen click rate": "long-only",
 "Card click rate": "long-only",
}

const HEADER_LABELS: Record<string, string> = {
 "Video title": "Title",
 videoTitle: "Title",
 "Video ID": "Video ID",
 videoId: "Video ID",
 video: "Video ID",
 Dimension: "Dimension",
 Length: "Length",
 Format: "Format",
 "Upload date": "Upload Date",
 uploadedAt: "Upload Date",
 Date: "Date",
 "Video publish time": "Upload Date",
 day: "Date",
 "Duration (sec)": "Duration",
 durationSeconds: "Duration",
 Type: "Type",
 titleLength: "Title Len",
 Views: "Views",
 viewCount: "Views",
 "Subs +": "Subs +",
 Impressions: "Impressions",
 impressions: "Impressions",
 CPM: "CPM",
 cpm: "CPM",
 "CPM (USD)": "CPM",
 RPM: "RPM",
 rpm: "RPM",
 "RPM (USD)": "RPM",
 "Click-Through Rate (CTR)": "CTR",
 "CTR (%)": "CTR",
 ctr: "CTR",
 "Impressions click-through rate (%)": "CTR",
 impressionClickThroughRate: "CTR",
 clickThroughRate: "CTR",
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
 annotationClickThroughRate: "Card %",
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
 "Engagement Rate": "Eng. Rate",
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
 Subscribers: "Subscribers",
 subscribersGained: "Subs +",
 newViewers: "New",
 returningViewers: "Returning",
 "New Viewers": "New",
 "New viewers": "New",
 "Returning Viewers": "Returning",
 "Returning viewers": "Returning",
 Likes: "Likes",
 likeCount: "Likes",
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
}

const toDisplayHeaderLabel = (header: string): string => {
 const direct = HEADER_LABELS[header]
 if (direct) return direct

 // Safe fallback for unknown keys (camelCase/snake_case/etc.)
 return header
  .replace(/_/g, " ")
  .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  .replace(/\s+/g, " ")
  .trim()
}

const CHART_COLORS = [
 "#00CCFF",
 "#CCFF00",
 "#FF7497",
 "#FFB158",
 "#B366FF",
 "#FFDD00",
]

const TOOLBOXES: Array<{
 id: PerformanceTool
 title: string
 headerColor: string
 iconBoxColor: string
 icon: React.ComponentType<{ size?: number; className?: string }>
}> = [
 {
  id: "data-manager",
  title: "DATA & STATISTICS ASSET MANAGER",
  headerColor: "bg-[#00CCFF]",
  iconBoxColor: "bg-[#CC99FF]",
  icon: Database,
 },
 {
  id: "data-viz",
  title: "DATA VISUALIZATIONS",
  headerColor: "bg-[#CCFF00]",
  iconBoxColor: "bg-[#00CCFF]",
  icon: ChartColumnBig,
 },
 {
  id: "channel-analysis",
  title: "CHANNEL ANALYSIS REPORT",
  headerColor: "bg-[#FFDD00]",
  iconBoxColor: "bg-[#CCFF00]",
  icon: BrainCircuit,
 },
 {
  id: "data-tables",
  title: "DATA TABLES",
  headerColor: "bg-[#FFB158]",
  iconBoxColor: "bg-[#FFDD00]",
  icon: Table2,
 },
]

const UPLOAD_TYPE_OPTIONS: Array<{
 value: CsvUploadType
 label: string
 menuClass: string
}> = [
 { value: "auto", label: "Auto Detect", menuClass: "bg-[#00CCFF] text-black" },
 { value: "long", label: "Long", menuClass: "bg-[#00CCFF] text-black" },
 { value: "traffic", label: "Traffic", menuClass: "bg-[#CCFF00] text-black" },
 { value: "combined", label: "Combined", menuClass: "bg-[#FFDD00] text-black" },
 { value: "audience", label: "Audience", menuClass: "bg-[#FFB158] text-black" },
 { value: "shorts", label: "Shorts", menuClass: "bg-[#FF7497] text-black" },
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
 const { brain, updateBrain, setResearchLabState, videoFlags, setVideoFlags, globalSyncData, isSyncing, lastSyncComplete } =
  brainContext

 const [openTools, setOpenTools] = useState<Set<PerformanceTool>>(
  () => new Set<PerformanceTool>(["data-manager"]),
 )
 const [analysisLoading, setAnalysisLoading] = useState(false)
 const [syncSourceMode, setSyncSourceMode] = useState<SyncSourceMode>(
  getStoredSyncSourceMode(),
 )
 const [storageMode, setStorageMode] = useState<StorageMode>(getStoredStorageMode())
 const [analyticsWindow, setAnalyticsWindow] = useState<AnalyticsWindow>("lifetime")
 const [preUploadType, setPreUploadType] = useState<CsvUploadType>("auto")
 const [tableSearch, setTableSearch] = useState("")
 const [tableTag, setTableTag] = useState("all")
 const [tableDataset, setTableDataset] = useState<TableDatasetId>("master")
 const [tableLimit, setTableLimit] = useState(200)
 const [sortColumn, setSortColumn] = useState<string | null>(null)
 const [sortDir, setSortDir] = useState<"desc" | "asc">("desc")
 const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(
  () => new Set(),
 )
 const [vizRenderTick, setVizRenderTick] = useState(0)
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
  if (storageMode === "cache") return cachedUploadFiles
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
  const allowed = new Set(
   effectiveCanonicalRows.map((row) => toStorageIdentity(row.videoId || row.title)),
  )
  return unifiedRows.filter((row, index) => {
   const identity = toStorageIdentity(
    textFromUnknown(
     row["Video ID"] || row.videoId || row.Dimension || getTitle(row, index),
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
  try {
   const cacheRaw = localStorage.getItem("yt_analytics_cache")
   if (!cacheRaw) return []
   const cache = JSON.parse(cacheRaw) as {
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
  } catch {
   return []
  }
 }, [lastSyncComplete, analyticsWindow])

 useEffect(() => {
  setTableLimit(200)
 }, [tableSearch, tableTag, tableDataset, analyticsWindow])

 useEffect(() => {
  if (!openTools.has("data-viz")) return
  const timeoutId = window.setTimeout(() => {
   setVizRenderTick((value) => value + 1)
  }, 120)
  return () => window.clearTimeout(timeoutId)
 }, [openTools])

 useEffect(() => {
  if (!openTools.has("data-viz")) return

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
   if (storageMode === "cache" || storageMode === "both") {
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

 const runAnalysis = async () => {
  if (filteredUnifiedRows.length === 0) return
  if (!hasGeminiKey()) {
   alert(
    "Gemini key missing. Open System -> Key Vault and save your Gemini API key.",
   )
   return
  }
  setAnalysisLoading(true)
  try {
   const csvContent = buildCsvFromRows(filteredUnifiedRows)
   const result = await analyzeChannelData(csvContent, undefined, (partial) => {
    const merged = {
     ...(brain.channelyticsState.analyticsResult || {}),
     ...(partial || {}),
    } as AnalyticsResult
    setUnifiedAnalysisResult(merged)
   })
   setUnifiedAnalysisResult(result)
   setOpenTools((previous) => {
    const next = new Set(previous)
    next.add("channel-analysis")
    return next
   })
  } catch (error) {
   console.error("Channel analysis failed", error)
   alert("Channel analysis failed.")
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
   const cacheRaw = localStorage.getItem("yt_analytics_cache")
   if (!cacheRaw) return []
   const cache = JSON.parse(cacheRaw) as {
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
  const rowDates = filteredUnifiedRows
   .map((row) => parseDate(getDateLabel(row)))
   .filter((value): value is Date => value instanceof Date)

  if (rowDates.length > 0) return formatDateWindow(rowDates)

  const seriesDates = dailySeries
   .map((point) => parseDate(point.label))
   .filter((value): value is Date => value instanceof Date)

  return formatDateWindow(seriesDates)
 }, [filteredUnifiedRows, dailySeries])

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
  if (header === "Watch Time (Hours)") return getWatchHours(row)
  if (header === "Revenue") return getRevenue(row)
  if (header === "Subs +") return getSubscribers(row)
  if (header === "Likes") return getLikes(row)
  if (header === "Comments") return getComments(row)
  if (header === "Shares") return getShares(row)
  if (header === "Length") return numberFromUnknown(row["Length"] || row["Duration (sec)"] || row["durationSeconds"])
  if (header === "AVD (Average View Duration)") return getAvdSeconds(row)
  
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
  const applicability = METRIC_APPLICABILITY_RULES[header] || "all"
  if (datasetId === "master") {
   if (applicability === "shorts-only" && !isShortFormat) return "N/A"
   if (applicability === "long-only" && isShortFormat) return "N/A"
  }

  const metricCell = getHeaderMetricCell(row as Record<string, unknown>, header)
  if (metricCell) {
   if (metricCell.status === "unavailable" || metricCell.value === null) {
    return "-"
   }

   const value = metricCell.value
   const percentHeaders = new Set([
    "Click-Through Rate (CTR)",
    "CTR (%)",
    "Impressions click-through rate (%)",
    "AVP (%)",
    "STW %",
    "End screen click rate",
    "Card click rate",
   ])
   if (percentHeaders.has(header)) return `${value.toFixed(2)}%`

   if (header === "Revenue" || header === "Estimated revenue") {
    return `$${value.toFixed(2)}`
   }
   if (header === "CPM" || header === "RPM") {
    return `$${value.toFixed(2)}`
   }
   if (
    header === "Watch Time (Hours)" ||
    header === "Watch time (hours)"
   ) {
    return value.toFixed(2)
   }
   if (
    header === "AVD (Average View Duration)" ||
    header === "AVD (Sec)"
   ) {
    const totalSec = Math.round(value)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    return h > 0
     ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
     : `0:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
   }

   return Number.isInteger(value)
    ? value.toLocaleString()
    : value.toLocaleString(undefined, { maximumFractionDigits: 3 })
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
  if (header === "Length") {
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
   if (val !== "-") {
    const rawDate = new Date(val)
    if (!isNaN(rawDate.getTime())) {
     return `${String(rawDate.getMonth() + 1).padStart(2, "0")}/${String(rawDate.getDate()).padStart(2, "0")}/${String(rawDate.getFullYear()).slice(-2)}`
    }
   }
   return val
  }
  if (header === "Date" || header === "Video publish time")
   return getDateLabel(row)
  if (header === "Views") return getViews(row).toLocaleString()
  if (header === "Impressions") return getImpressions(row).toLocaleString()
  if (header === "Engaged views")
   return getMetric(row, ["Engaged views", "Engaged Views"]).toLocaleString()
  if (header === "Likes") return getLikes(row).toLocaleString()
  if (header === "Comments") return getComments(row).toLocaleString()
  if (header === "Shares") return getShares(row).toLocaleString()
  if (header === "Subs +")
   return getMetric(row, ["Subs +", "Subscribers Gained", "Subscribers"]).toLocaleString()
  if (header === "CPM")
   return getMetric(row, ["CPM", "CPM (USD)"]).toLocaleString(undefined, {
    maximumFractionDigits: 3,
   })
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
  if (header === "Watch Time (Hours)" || header === "Watch time (hours)")
   return getWatchHours(row).toFixed(2)
  if (header === "Estimated minutes watched")
   return (getWatchHours(row) * 60).toLocaleString(undefined, {
    maximumFractionDigits: 1,
   })
  if (header === "AVD (Sec)" || header === "Average view duration") {
   const totalSec = Math.round(getAvdSeconds(row))
   const h = Math.floor(totalSec / 3600)
   const m = Math.floor((totalSec % 3600) / 60)
   const s = totalSec % 60
   return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`
  }
  if (header === "AVP (%)" || header === "Average percentage viewed (%)")
   return getAvpPercent(row).toLocaleString(undefined, {
    maximumFractionDigits: 2,
   })
  if (header === "Subscribers Gained" || header === "Subscribers")
   return getSubscribers(row).toLocaleString(undefined, {
    maximumFractionDigits: 3,
   })
  if (header === "CTR (%)" || header === "Impressions click-through rate (%)")
   return getCtr(row).toLocaleString(undefined, { maximumFractionDigits: 3 })
  if (header === "Click-Through Rate (CTR)")
   return getCtr(row).toLocaleString(undefined, { maximumFractionDigits: 3 })
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
  if (header === "End screen click rate") {
   const endRate = getMetric(row, [
    "End screen click rate",
    "Clicks per end screen element shown (%)",
   ])
   return endRate > 0 ? `${endRate.toFixed(2)}%` : "-"
  }
  if (header === "Card click rate") {
   const cardRate = getMetric(row, [
    "Card click rate",
    "annotationClickThroughRate",
   ])
   return cardRate > 0 ? `${cardRate.toFixed(2)}%` : "-"
  }
  if (
   header === "Revenue" ||
   header === "Estimated revenue" ||
   header === "Your estimated revenue (USD)"
  )
   return `$${getRevenue(row).toFixed(2)}`
  if (header === "RPM")
   return getRpm(row).toLocaleString(undefined, { maximumFractionDigits: 3 })

  const raw = textFromUnknown(row[header])
  return raw === "" ? "-" : raw
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
  let cache: any = null
  try {
   const cacheRaw = localStorage.getItem("yt_analytics_cache")
   cache = cacheRaw ? JSON.parse(cacheRaw) : null
  } catch {
   cache = null
  }

  const normalizedReportRows = (
   report: any,
   prefix: string,
   label: string,
  ): UnifiedRow[] =>
   reportToRows(report, prefix, label).map((row) =>
    normalizeAndEnrichRow(row as Record<string, unknown>),
   ) as UnifiedRow[]

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

    return {
     ...row,
     Date:
      textFromUnknown(
       row["Date"] || row["day"] || row["Day"] || row["Upload date"],
      ) || `Day ${index + 1}`,
     Views: views,
     Likes: getLikes(row),
     Comments: getComments(row),
     Shares: getShares(row),
     "Watch Time (Hours)": watchHours,
     "Subscribers Gained": subscribers,
     "Subs +": subscribers,
     Impressions: impressions,
     Revenue: revenue,
     RPM: rpm > 0 ? rpm : views > 0 && revenue > 0 ? (revenue / views) * 1000 : 0,
     CPM: cpm,
     "Click-Through Rate (CTR)": ctr,
    } as UnifiedRow
   },
  )

  const trafficRows = normalizedReportRows(
   cache?.trafficSources,
   "traffic",
   "Traffic Sources",
  ).map((row, index) => ({
   ...row,
   "Traffic source":
    textFromUnknown(
     row["Traffic source"] ||
      row["insightTrafficSourceType"] ||
      row["trafficSource"] ||
      row["Dimension"],
    ) || `Source ${index + 1}`,
   Views: getViews(row),
   Likes: getLikes(row),
   Comments: getComments(row),
   Shares: getShares(row),
   "Watch Time (Hours)": getWatchHours(row),
   "Subscribers Gained": getSubscribers(row),
   Revenue: getRevenue(row),
   Impressions: getImpressions(row),
   "Click-Through Rate (CTR)": getCtr(row),
  })) as UnifiedRow[]

  const geographyReport =
   cache?.geography ||
   cache?.countryAnalytics ||
   cache?.audienceByCountry ||
   cache?.demographics
  let countryRows = normalizedReportRows(geographyReport, "country", "Geography").map(
   (row, index) => {
    const countryLabel =
     textFromUnknown(
      row["Country"] || row["country"] || row["Geography"] || row["Dimension"],
     ) ||
     [textFromUnknown(row["ageGroup"]), textFromUnknown(row["gender"])]
      .filter(Boolean)
      .join(" · ") ||
     `Segment ${index + 1}`

    return {
     ...row,
     Country: countryLabel,
     Geography: countryLabel,
     "Viewer percentage": numberFromUnknown(
      row["Viewer percentage"] ||
       row["viewerPercentage"] ||
       row["viewer_percentage"] ||
       row["Views"],
     ),
     Views: getViews(row),
     "Watch Time (Hours)": getWatchHours(row),
     Revenue: getRevenue(row),
     "Subscribers Gained": getSubscribers(row),
    } as UnifiedRow
   },
  )

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
    Country: segment.toUpperCase(),
    Geography: segment.toUpperCase(),
    Views: views,
    "Viewer percentage": totalViews > 0 ? (views / totalViews) * 100 : 0,
   })) as UnifiedRow[]
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
   "Viewer percentage": numberFromUnknown(
    row["Viewer percentage"] || row["viewerPercentage"] || row["Views"],
   ),
  })) as UnifiedRow[]

  const audienceRows = normalizedReportRows(
   cache?.audienceMetrics || cache?.demographics || cache?.audienceSegments,
   "audience",
   "Audience",
  ).map((row, index) => ({
   ...row,
   "Age Group":
    textFromUnknown(row["Age Group"] || row["ageGroup"]) || `Age Segment ${index + 1}`,
   Gender: textFromUnknown(row["Gender"] || row["gender"]) || "Unknown",
   Views: getViews(row),
   "Watch Time (Hours)": getWatchHours(row),
   "New Viewers": getMetric(row, ["New Viewers", "newViewers"]),
   "Returning Viewers": getMetric(row, ["Returning Viewers", "returningViewers"]),
   "Casual viewers": getMetric(row, ["Casual viewers", "casualViewers"]),
   "Regular viewers": getMetric(row, ["Regular viewers", "regularViewers"]),
   "Unique viewers": getMetric(row, ["Unique viewers", "uniqueViewers"]),
   "Engaged views": getMetric(row, ["Engaged views", "engagedViews"]),
   "Engagement Rate": getMetric(row, ["Engagement Rate", "engagementRate"]),
   "AVD (Average View Duration)": getAvdSeconds(row),
   "AVP (%)": getAvpPercent(row),
  })) as UnifiedRow[]

  return [
   {
    id: TABLE_DATASET_CONTRACTS.master.id,
    label: TABLE_DATASET_CONTRACTS.master.label,
    rows: masterTableRows,
    supportsTagFilter: TABLE_DATASET_CONTRACTS.master.supportsTagFilter,
    columns: TABLE_DATASET_CONTRACTS.master.columns,
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
 }, [masterTableRows, filteredUnifiedRows, lastSyncComplete])

 const activeTableDataset =
  tableDatasets.find((dataset) => dataset.id === tableDataset) ||
  tableDatasets[0]

 const tableHeaders = useMemo(() => {
  if (activeTableDataset.id === "master") {
   return activeTableDataset.columns.map((header) => getCanonicalMasterHeader(header))
  }
  return activeTableDataset.columns
 }, [activeTableDataset])

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
   if (!search) return true
   return tableHeaders.some((header) =>
    getTableCellValue(row, header, 0, activeTableDataset.id)
     .toLowerCase()
     .includes(search),
   )
  })
 }, [activeTableDataset, tableHeaders, tableSearch, tableTag])

 const sortedTableRows = useMemo(() => {
  if (!sortColumn) return filteredTableRows
  const textColumns = new Set(["Video title", "Video ID", "Format", "Upload date", "Date", "Type", "Dimension"])
  const isText = textColumns.has(sortColumn)
  const sorted = [...filteredTableRows].sort((a, b) => {
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

 const renderDataManager = () => (
  <div className="space-y-5">
   <div className="w-full border-[4px] border-black rounded-2xl bg-[#FFDD00] px-3 py-3 flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-2">
     {(
      [
       { id: "api_analytics", label: "API Analytics" },
       { id: "uploads", label: "Uploads" },
       { id: "both", label: "Both" },
      ] as Array<{ id: SyncSourceMode; label: string }>
     ).map((mode) => (
      <button
       key={mode.id}
       onClick={() => {
        setSyncSourceMode(mode.id)
        setStoredSyncSourceMode(mode.id)
       }}
       className={`px-4 py-2 rounded-full border-[3px] border-black text-[10px] font-black uppercase tracking-wider transition-all ${
        syncSourceMode === mode.id ? "bg-black text-white" : "bg-white text-black"
       }`}>
       {mode.label}
      </button>
     ))}
    </div>
    <div className="flex flex-wrap items-center gap-2">
     {(
      [
       { id: "cache", label: "Cache" },
       { id: "storage", label: "Storage" },
       { id: "both", label: "Both" },
      ] as Array<{ id: StorageMode; label: string }>
     ).map((mode) => (
      <button
       key={mode.id}
       onClick={() => {
        setStorageMode(mode.id)
        setStoredStorageMode(mode.id)
       }}
       className={`px-4 py-2 rounded-full border-[3px] border-black text-[10px] font-black uppercase tracking-wider transition-all ${
        storageMode === mode.id ? "bg-black text-white" : "bg-white text-black"
       }`}>
       {mode.label}
      </button>
     ))}
    </div>
    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/60">
     Sync Source controls reads. Storage controls where uploaded analytics files are kept.
    </p>
   </div>

   <div className="border-[4px] border-black rounded-2xl bg-white overflow-hidden shadow-[8px_8px_0px_0px_black]">
    <div className="bg-[#EA73E8] border-b-[4px] border-black px-4 py-3 flex items-center justify-between gap-4">
     <div className="flex items-center gap-3">
      <span className="px-3 py-1 rounded-lg bg-black text-white border-[3px] border-black text-[10px] font-black uppercase tracking-widest">
       Channel Data
      </span>
      <h3 className="text-3xl md:text-4xl font-[1000] uppercase tracking-tight">
       Channel Intelligence Lab
      </h3>
     </div>
     <span className="text-3xl font-black leading-none">-</span>
    </div>

    <div className="p-4 md:p-5 space-y-4">
     <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
      <button
       onClick={globalSyncData}
       disabled={isSyncing}
       className={`flex items-center gap-2 px-6 py-3 font-[1000] uppercase tracking-tighter rounded-xl border-[4px] border-black transition-all shadow-[4px_4px_0px_0px_black] bg-[#ccff00] text-black ${
        isSyncing
         ? "opacity-50 cursor-not-allowed translate-x-1 translate-y-1 shadow-none"
         : "hover:bg-white active:translate-x-1 active:translate-y-1 active:shadow-none"
       }`}
      >
       {isSyncing ? (
        <RefreshCw size={20} className="animate-spin" />
       ) : (
        <RefreshCw size={20} />
       )}
       Sync Now
      </button>

      <div className="space-y-2">
       <div className="relative text-black" ref={uploadMenuRef}>
        <button
         type="button"
         onClick={() => setUploadMenuOpen((open) => !open)}
         className={`w-full h-[48px] px-4 border-[4px] border-black rounded-xl text-[11px] font-black uppercase tracking-[0.11em] outline-none shadow-[4px_4px_0px_0px_black] cursor-pointer flex items-center justify-between hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_black] transition-all ${selectedUploadType.menuClass}`}
         aria-haspopup="listbox"
         aria-expanded={uploadMenuOpen}>
         <span>{selectedUploadType.label}</span>
         <span className="inline-flex items-center justify-center h-6 w-6 bg-white border-[2px] border-black rounded-md">
          <ChevronDown
           size={14}
           strokeWidth={4}
           className={`transition-transform ${uploadMenuOpen ? "rotate-180" : ""}`}
          />
         </span>
        </button>
        {uploadMenuOpen && (
         <div className="absolute top-full left-0 mt-2 w-full bg-white border-[4px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden z-40 max-h-[320px] overflow-y-auto">
          {UPLOAD_TYPE_OPTIONS.map((option, index) => (
           <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={option.value === preUploadType}
            onClick={() => {
             setPreUploadType(option.value)
             setUploadMenuOpen(false)
            }}
            className={`w-full h-[44px] px-4 text-left font-black uppercase text-[11px] tracking-[0.1em] hover:brightness-95 transition-colors ${option.menuClass} ${
             index < UPLOAD_TYPE_OPTIONS.length - 1
              ? "border-b-[3px] border-black/15"
              : ""
            }`}>
            {option.label}
           </button>
          ))}
         </div>
        )}
       </div>
       <div className="text-[9px] font-black uppercase tracking-[0.18em] text-black/40">
        Upload Type
       </div>
       <button
        onClick={() => {
         setUploadMenuOpen(false)
         fileInputRef.current?.click()
        }}
        className="w-full h-[38px] bg-[#00CCFF] text-black border-[4px] border-black rounded-xl text-[10px] font-black uppercase tracking-[0.12em] shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2">
        <Upload size={14} />
        Upload CSV/ZIP/Folder
       </button>
      </div>

      <button
       onClick={runAnalysis}
       disabled={analysisLoading || filteredUnifiedRows.length === 0}
       className="bg-[#F0E08B] text-black px-5 py-4 rounded-xl border-[4px] border-black font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
       {analysisLoading ? (
        <Activity size={16} className="animate-spin" />
       ) : (
        <BrainCircuit size={16} />
       )}
       Generate Report
      </button>
     </div>

     <div className="border-[3px] border-black/20 rounded-xl bg-[#F7F7F7] p-3">
      <div className="flex flex-wrap items-center gap-2">
       {csvFiles.length === 0 ? (
        <p className="text-[10px] font-black uppercase tracking-widest text-black/35">
         No uploaded data sources yet
        </p>
       ) : (
        csvFiles.map((file) => (
         <div
          key={file.id}
          className={`inline-flex items-center gap-2 border-[3px] border-black rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider ${getCsvTagColorClass(file.tag)}`}>
          <FileText size={13} />
          <span className="max-w-[220px] truncate">{file.name}</span>
          <button
           onClick={() => removeFile(file.id)}
           className="opacity-80 hover:opacity-100">
           <X size={13} />
          </button>
         </div>
        ))
       )}
       <button
        onClick={clearFiles}
        className="ml-auto px-3 py-2 bg-white border-[3px] border-black rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
        <Trash2 size={12} />
        Clear All
       </button>
      </div>
     </div>

     <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      <div className="col-span-2 lg:col-span-6 flex flex-wrap items-center justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-black/55">
       <span>
        Data Window: {selectedWindowLabel}
        {dataWindowLabel ? ` (${dataWindowLabel})` : ""}
       </span>
      <span>
        Source Mode:{" "}
        {syncSourceMode === "uploads"
         ? "Uploads"
         : syncSourceMode === "api_analytics"
          ? "API Analytics"
          : "Both"}
       </span>
       <span>
        Storage:{" "}
        {storageMode === "both"
         ? "Cache + Storage"
         : storageMode === "cache"
          ? "Cache"
          : "Storage"}
       </span>
      </div>
      {analyticsGroupStatus.length > 0 && (
       <div className="col-span-2 lg:col-span-6 border-[3px] border-black/20 rounded-xl bg-white p-2 flex flex-wrap gap-2">
        {analyticsGroupStatus.map((group) => (
         <span
          key={group.key}
          title={
           group.ok
            ? `${group.key}: OK (${group.metrics.join(", ")})`
            : `${group.key}: failed (${group.error || "unknown error"})`
          }
          className={`px-2 py-1 rounded-lg border-[2px] border-black text-[9px] font-black uppercase tracking-wider ${
           group.ok ? "bg-[#CCFF00] text-black" : "bg-[#FF7497] text-black"
          }`}>
          {group.key.replace(/_/g, " ")}: {group.ok ? "ok" : "failed"}
         </span>
        ))}
       </div>
      )}
      <div className="border-[3px] border-black rounded-xl bg-white p-3">
       <p className="text-[9px] font-black uppercase tracking-wider text-black/45">
        01 Views
       </p>
       <p className="text-2xl font-[1000] tracking-tight">
        {stats.views.toLocaleString()}
       </p>
      </div>
      <div className="border-[3px] border-black rounded-xl bg-white p-3">
       <p className="text-[9px] font-black uppercase tracking-wider text-black/45">
        02 Watchtime
       </p>
       <p className="text-2xl font-[1000] tracking-tight">
        {stats.watchHours.toLocaleString()}
       </p>
      </div>
      <div className="border-[3px] border-black rounded-xl bg-white p-3">
       <p className="text-[9px] font-black uppercase tracking-wider text-black/45">
        03 Revenue
       </p>
       <p className="text-2xl font-[1000] tracking-tight">
        ${stats.revenue.toLocaleString()}
       </p>
      </div>
      <div className="border-[3px] border-black rounded-xl bg-white p-3">
       <p className="text-[9px] font-black uppercase tracking-wider text-black/45">
        04 Subscribers
       </p>
       <p className="text-2xl font-[1000] tracking-tight">
        {stats.subscribers.toLocaleString()}
       </p>
      </div>
      <div className="border-[3px] border-black rounded-xl bg-white p-3">
       <p className="text-[9px] font-black uppercase tracking-wider text-black/45">
        05 RPM
       </p>
       <p className="text-2xl font-[1000] tracking-tight">
        ${stats.rpmAverage.toFixed(2)}
       </p>
      </div>
      <div className="border-[3px] border-black rounded-xl bg-white p-3">
       <p className="text-[9px] font-black uppercase tracking-wider text-black/45">
        06 CTR
       </p>
       <p className="text-2xl font-[1000] tracking-tight">
        {stats.ctrAverage.toFixed(2)}%
       </p>
      </div>
     </div>

      <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest text-black/50">
       <Clock3 size={13} />
       <span>Last Sync: {formatLastSync(lastSyncComplete)}</span>
      </div>
    </div>
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

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
     <div
      key={`line-${vizRenderTick}`}
      ref={lineChartRef}
      className="xl:col-span-2 bg-white border-[4px] border-black rounded-xl p-4 h-[340px]">
      <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-3">
       Views Over Time
      </p>
      {lineChartSize.width > 0 && lineChartSize.height > 0 ? (
       <LineChart
        width={lineChartSize.width}
        height={lineChartSize.height}
        data={dailySeries}>
        <CartesianGrid stroke="#d1d5db" strokeOpacity={0.72} />
        <XAxis dataKey="label" hide />
        <YAxis stroke="#000" tick={{ fontSize: 11, fontWeight: 900 }} />
        <Tooltip
         contentStyle={{
          border: "3px solid black",
          borderRadius: "12px",
          fontWeight: 900,
         }}
        />
        <Line
         type="monotone"
         dataKey="views"
         stroke="#00CCFF"
         strokeWidth={4}
         dot={false}
        />
        <Line
         type="monotone"
         dataKey="watchHours"
         stroke="#FF3399"
         strokeWidth={3}
         dot={false}
        />
       </LineChart>
      ) : (
       <div className="h-[250px] border-2 border-black/20 rounded-lg" />
      )}
     </div>

     <div
      key={`bar-${vizRenderTick}`}
      ref={barChartRef}
      className="bg-white border-[4px] border-black rounded-xl p-4 h-[340px]">
      <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-3">
       Views by Format
      </p>
      {barChartSize.width > 0 && barChartSize.height > 0 ? (
       <BarChart
        width={barChartSize.width}
        height={barChartSize.height}
        data={formatSeries}>
        <CartesianGrid stroke="#d1d5db" strokeOpacity={0.72} />
        <XAxis
         dataKey="format"
         stroke="#000"
         tick={{ fontSize: 11, fontWeight: 900 }}
        />
        <YAxis stroke="#000" tick={{ fontSize: 11, fontWeight: 900 }} />
        <Tooltip
         contentStyle={{
          border: "3px solid black",
          borderRadius: "12px",
          fontWeight: 900,
         }}
        />
        <Bar
         dataKey="views"
         fill="#CCFF00"
         stroke="#000"
         strokeWidth={2}
         radius={[8, 8, 0, 0]}
        />
       </BarChart>
      ) : (
       <div className="h-[250px] border-2 border-black/20 rounded-lg" />
      )}
     </div>
    </div>

    {lineChartSize.width > 0 && barChartSize.width > 0 ? (
     <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div className="bg-white border-[4px] border-black rounded-xl p-4 h-[320px]">
       <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-3">
        Views + Revenue Trend
       </p>
       <div className="h-[250px]">
        <ResponsiveContainer
         width="100%"
         height="100%"
         minWidth={1}
         minHeight={1}>
         <AreaChart data={dailySeries}>
          <CartesianGrid stroke="#d1d5db" strokeOpacity={0.72} />
          <XAxis dataKey="label" hide />
          <YAxis stroke="#000" tick={{ fontSize: 11, fontWeight: 900 }} />
          <Tooltip
           contentStyle={{
            border: "3px solid black",
            borderRadius: "12px",
            fontWeight: 900,
           }}
          />
          <Area
           type="monotone"
           dataKey="views"
           stroke="#00CCFF"
           fill="#00CCFF55"
           strokeWidth={3}
          />
          <Area
           type="monotone"
           dataKey="revenue"
           stroke="#FFB158"
           fill="#FFB15855"
           strokeWidth={3}
          />
         </AreaChart>
        </ResponsiveContainer>
       </div>
      </div>

      <div className="bg-white border-[4px] border-black rounded-xl p-4 h-[320px]">
       <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-3">
        Subscribers + CTR Trend
       </p>
       <div className="h-[250px]">
        <ResponsiveContainer
         width="100%"
         height="100%"
         minWidth={1}
         minHeight={1}>
         <LineChart data={dailySeries}>
          <CartesianGrid stroke="#d1d5db" strokeOpacity={0.72} />
          <XAxis dataKey="label" hide />
          <YAxis
           yAxisId="left"
           stroke="#000"
           tick={{ fontSize: 11, fontWeight: 900 }}
          />
          <YAxis
           yAxisId="right"
           orientation="right"
           stroke="#000"
           tick={{ fontSize: 11, fontWeight: 900 }}
          />
          <Tooltip
           contentStyle={{
            border: "3px solid black",
            borderRadius: "12px",
            fontWeight: 900,
           }}
          />
          <Line
           yAxisId="left"
           type="monotone"
           dataKey="subscribers"
           stroke="#CCFF00"
           strokeWidth={3}
           dot={false}
          />
          <Line
           yAxisId="right"
           type="monotone"
           dataKey="ctr"
           stroke="#FF7497"
           strokeWidth={3}
           dot={false}
          />
         </LineChart>
        </ResponsiveContainer>
       </div>
      </div>

      <div className="bg-white border-[4px] border-black rounded-xl p-4 h-[320px]">
       <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-3">
        Top Views Ladder
       </p>
       <div className="h-[250px]">
        <ResponsiveContainer
         width="100%"
         height="100%"
         minWidth={1}
         minHeight={1}>
         <BarChart data={topViewsSeries}>
          <CartesianGrid stroke="#d1d5db" strokeOpacity={0.72} />
          <XAxis
           dataKey="rank"
           stroke="#000"
           tick={{ fontSize: 11, fontWeight: 900 }}
          />
          <YAxis stroke="#000" tick={{ fontSize: 11, fontWeight: 900 }} />
          <Tooltip
           contentStyle={{
            border: "3px solid black",
            borderRadius: "12px",
            fontWeight: 900,
           }}
          />
          <Bar
           dataKey="views"
           fill="#00CCFF"
           stroke="#000"
           strokeWidth={2}
           radius={[8, 8, 0, 0]}
          />
         </BarChart>
        </ResponsiveContainer>
       </div>
      </div>

      <div className="bg-white border-[4px] border-black rounded-xl p-4 h-[320px]">
       <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-3">
        Revenue by Format
       </p>
       <div className="h-[250px]">
        <ResponsiveContainer
         width="100%"
         height="100%"
         minWidth={1}
         minHeight={1}>
         <BarChart data={revenueByFormatSeries}>
          <CartesianGrid stroke="#d1d5db" strokeOpacity={0.72} />
          <XAxis
           dataKey="format"
           stroke="#000"
           tick={{ fontSize: 11, fontWeight: 900 }}
          />
          <YAxis stroke="#000" tick={{ fontSize: 11, fontWeight: 900 }} />
          <Tooltip
           contentStyle={{
            border: "3px solid black",
            borderRadius: "12px",
            fontWeight: 900,
           }}
          />
          <Bar
           dataKey="revenue"
           fill="#FFB158"
           stroke="#000"
           strokeWidth={2}
           radius={[8, 8, 0, 0]}
          />
         </BarChart>
        </ResponsiveContainer>
       </div>
      </div>

      <div className="bg-white border-[4px] border-black rounded-xl p-4 h-[320px]">
       <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-3">
        Format Share
       </p>
       <div className="h-[250px]">
        <ResponsiveContainer
         width="100%"
         height="100%"
         minWidth={1}
         minHeight={1}>
         <PieChart>
          <Tooltip
           contentStyle={{
            border: "3px solid black",
            borderRadius: "12px",
            fontWeight: 900,
           }}
          />
          <Pie
           data={formatSeries}
           dataKey="views"
           nameKey="format"
           outerRadius={86}
           innerRadius={42}
           stroke="#000"
           strokeWidth={2}>
           {formatSeries.map((_, index) => (
            <Cell
             key={`format-pie-${index}`}
             fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
           ))}
          </Pie>
         </PieChart>
        </ResponsiveContainer>
       </div>
      </div>

      <div className="bg-white border-[4px] border-black rounded-xl p-4 h-[320px]">
       <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-3">
        Likes vs Views Scatter
       </p>
       <div className="h-[250px]">
        <ResponsiveContainer
         width="100%"
         height="100%"
         minWidth={1}
         minHeight={1}>
         <ScatterChart>
          <CartesianGrid stroke="#d1d5db" strokeOpacity={0.72} />
          <XAxis
           type="number"
           dataKey="views"
           stroke="#000"
           tick={{ fontSize: 11, fontWeight: 900 }}
          />
          <YAxis
           type="number"
           dataKey="likes"
           stroke="#000"
           tick={{ fontSize: 11, fontWeight: 900 }}
          />
          <Tooltip
           cursor={{ stroke: "#d1d5db", strokeOpacity: 0.7, strokeWidth: 1 }}
           contentStyle={{
            border: "3px solid black",
            borderRadius: "12px",
            fontWeight: 900,
           }}
          />
          <Scatter
           data={engagementScatterSeries}
           fill="#FF7497"
           stroke="#000"
           strokeWidth={1}
          />
         </ScatterChart>
        </ResponsiveContainer>
       </div>
      </div>
     </div>
    ) : (
     <div className="border-[4px] border-black rounded-xl bg-white p-8 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
       Visualizer Stations
      </p>
      <p className="text-xl font-[1000] uppercase tracking-tight mt-2">
       Preparing chart stations...
      </p>
     </div>
    )}

    <div className="bg-white border-[4px] border-black rounded-xl p-4 overflow-x-auto">
     <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-3">
      Top Videos
     </p>
     <table className="w-full border-collapse">
      <thead>
       <tr className="text-left">
        <th className="p-2 text-[10px] font-black uppercase border-b-[3px] border-black">
         Title
        </th>
        <th className="p-2 text-[10px] font-black uppercase border-b-[3px] border-black">
         Views
        </th>
        <th className="p-2 text-[10px] font-black uppercase border-b-[3px] border-black">
         Likes
        </th>
        <th className="p-2 text-[10px] font-black uppercase border-b-[3px] border-black">
         Tag
        </th>
       </tr>
      </thead>
      <tbody>
       {topRows.slice(0, 12).map((row, index) => (
        <tr key={`${row.title}-${row.views}-${index}`}>
         <td className="p-2 text-xs font-bold border-b border-black/10">
          {row.title}
         </td>
         <td className="p-2 text-xs font-black border-b border-black/10">
          {row.views.toLocaleString()}
         </td>
         <td className="p-2 text-xs font-black border-b border-black/10">
          {row.likes.toLocaleString()}
         </td>
         <td className="p-2 text-xs font-black border-b border-black/10 uppercase">
          {row.tag}
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </div>
  )
 }

 const renderAnalysis = () => {
  if (!analyticsResult) {
   return (
    <div className="border-[4px] border-black rounded-xl bg-white p-10 text-center">
     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
      Channel Analysis
     </p>
     <p className="text-2xl font-[1000] uppercase tracking-tight mt-2">
      No report generated yet
     </p>
     <button
      onClick={runAnalysis}
      disabled={analysisLoading || filteredUnifiedRows.length === 0}
      className="mt-6 bg-black text-[#FFDD00] px-5 py-3 rounded-xl border-[3px] border-black font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_#FFB158] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50">
      {analysisLoading ? "Generating..." : "Generate Full Report"}
     </button>
    </div>
   )
  }

  return (
   <div className="border-[4px] border-black rounded-xl overflow-hidden">
    <ReportViewer result={analyticsResult} data={filteredUnifiedRows} />
   </div>
  )
 }

 const renderDataTables = () => (
  <div className="space-y-4">
   <div className="bg-white border-[4px] border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_black]">
    <div className="bg-[#EA73E8] border-b-[4px] border-black px-4 py-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
     <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg border-[3px] border-black bg-black text-white flex items-center justify-center">
       <Table2 size={15} />
      </div>
      <h3 className="text-2xl font-[1000] uppercase tracking-tight">
       Data Tables Toolbox
      </h3>
     </div>
     <div className="flex w-full lg:w-auto items-center gap-2">
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
    </div>

    <div className="bg-white border-b-[4px] border-black px-4 py-2 flex flex-wrap items-center gap-2">
     {tableDatasets.map((dataset) => (
      <button
       key={dataset.id}
       onClick={() => {
        setTableDataset(dataset.id)
        setSelectedRowIds(new Set())
       }}
       className={`px-3 py-2 border-[3px] border-black rounded-lg text-[10px] font-black uppercase tracking-wider ${
        tableDataset === dataset.id
         ? "bg-black text-white"
         : "bg-white text-black"
       }`}>
       {dataset.label}
      </button>
     ))}
    </div>

    <div className="bg-[#CCFF00] border-b-[4px] border-black px-4 py-2 text-center text-[12px] font-black uppercase tracking-[0.14em]">
     {activeTableDataset.label}
    </div>

    <div className="overflow-auto max-h-[620px]">
     {tableHeaders.length === 0 ? (
      <div className="p-8 text-center text-sm font-black uppercase tracking-wider text-black/35">
       No table data available for {activeTableDataset.label}
      </div>
     ) : (
      <table className="w-full border-collapse whitespace-nowrap">
       <thead className="sticky top-0 bg-[#EDEDED] text-black z-10">
        <tr>
         <th className="p-2 border-b-[3px] border-black border-r border-black/20 w-12 text-center">
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
          className="p-2 border-b-[3px] border-black border-r border-black/20 w-8 text-center"
          title="Exclude from Analytics">
          <span className="text-[10px] font-black uppercase text-black">
           EX
          </span>
         </th>
         <th
          className="p-2 border-b-[3px] border-black border-r border-black/20 w-8 text-center"
          title="Include Only (Global Whitelist)">
          <span className="text-[10px] font-black uppercase text-[#00CCFF]">
           IN
          </span>
         </th>

          {tableHeaders.map((header) => {
           const isSorted = sortColumn === header
           const arrow = isSorted ? (sortDir === "desc" ? " ▼" : " ▲") : ""
           return (
            <th
             key={header}
             title={`Sort by ${header}`}
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
             className={`p-2 text-[10px] font-black uppercase tracking-widest border-b-[3px] border-black border-r border-black/20 align-middle cursor-pointer select-none transition-colors hover:bg-[#CCFF00]/30 ${
              isSorted ? "bg-[#CCFF00]/50" : ""
             }`}>
             <span className="block max-w-[120px] truncate">
              {toDisplayHeaderLabel(header)}
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
           {tableHeaders.map((header) => {
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
              className={`p-2 text-xs font-bold border-r border-black/10 border-b border-black/10 ${!isTextColumn ? "text-right pr-4" : "text-left pl-2"} ${cellValue === "-" ? "bg-[#111111] text-[#444444]" : ""}`}>
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
                <span className="block truncate max-w-[290px]">
                 {cellValue}
                </span>
               </div>
              ) : (
               <span
                className={`block truncate ${isTitle ? "max-w-[320px]" : "max-w-[110px]"}`}>
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
         Math.min(value + 200, filteredTableRows.length),
        )
       }
       disabled={tableRows.length >= filteredTableRows.length}
       className="px-3 py-2 border-[3px] border-black rounded-lg bg-[#CCFF00] text-[10px] font-black uppercase tracking-wider disabled:opacity-50">
       Load 200 More
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
    <div className="mt-8">
     <SystemStatisticsSubToolbox masterTableRows={masterTableRows} />
    </div>
   </div>
  </div>
 )

 const renderTool = (toolId: PerformanceTool) => {
  if (toolId === "data-manager") return renderDataManager()
  if (toolId === "data-viz") return renderDataViz()
  if (toolId === "channel-analysis") return renderAnalysis()
  return renderDataTables()
 }

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

   <div className="w-full space-y-6">
    {TOOLBOXES.map((toolbox) => {
     const isOpen = openTools.has(toolbox.id)
     const ToolIcon = toolbox.icon
     return (
      <ToolboxScaffold
       key={toolbox.id}
       title={toolbox.title}
       icon={<ToolIcon size={42} className="text-black" />}
       headerColor={toolbox.headerColor}
       iconBoxColor={toolbox.iconBoxColor}
       collapsible
       isOpen={isOpen}
       onToggle={() =>
        setOpenTools((previous) => {
         const next = new Set(previous)
         if (next.has(toolbox.id)) next.delete(toolbox.id)
         else next.add(toolbox.id)
         return next
        })
       }
       disableCollapseAnimation
       contentClassName="bg-white p-4 md:p-6 lg:p-8 min-h-[620px]">
       {isOpen && renderTool(toolbox.id)}
      </ToolboxScaffold>
     )
    })}
   </div>

   <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-black/35">
    <ChartColumnBig size={14} />
    <span>
     Flattened architecture: data manager, data visualizations, channel
     analysis, data tables
    </span>
   </div>
  </div>
 )
}

export default PerformanceHub
