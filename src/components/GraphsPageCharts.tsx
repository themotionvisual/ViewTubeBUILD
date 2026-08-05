import React, { useEffect, useId, useMemo, useRef, useState } from "react"
import "./marquee.css"
import {
 AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
 BarChart, Bar, ScatterChart, Scatter, ZAxis, Legend, Cell,
 LineChart, Line, PieChart, Pie, Label, ComposedChart, ReferenceLine, ReferenceArea,
 RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
 Customized,
} from "recharts"
import type { CanonicalVideoRow } from "../services/analytics/DataStore"
import { resolveMetricNumber } from "../services/analytics/MetricRegistry"
import type { CsvFileWithTag } from "../types"
import { UnifiedChartModule } from "./UnifiedChartModule"
import { CustomIcon } from "./CustomIcon"
import { StableChartFrame } from "./StableChartFrame"
import { SubToolboxChartModule, subToolboxChartPresets } from "./SubToolboxChartModule"
import type { ControllerRow } from "./VisualModuleController"
import { InsightMarquee } from "./InsightMarquee"
import {
 VT_SPECTRUM_PALETTE_06,
 VT_NAV_PALETTE_12,
 VT_VISUAL_METRIC_COLORS,
} from "../styles/toolboxPalette"
import { UPLOAD_CACHE_FILES_KEY } from "../services/analytics/SyncPipeline"
import {
  buildKeywordClustersFromMasterRows,
  buildKeywordSelectionSummary,
  buildKeywordCombinationStats,
  getKeywordMetricDefinition,
  formatKeywordMetricValue,
  KEYWORD_VENN_METRIC_OPTIONS,
  buildKeywordVideoRows,
  getKeywordRankValue,
  keywordMetricSupportsTotal,
  type KeywordMetricKey,
  type KeywordRankingMode,
} from "../services/keywordVennAnalysis"
import {
 buildAdaptiveZeroScale,
 buildLinearAreaBubbleRadii,
 buildLogBubbleRadii,
 buildTieAwarePercentiles,
 interpolateThreeStopColor,
} from "./chartScaleModel"

const mv = (row: CanonicalVideoRow, key: string): number =>
 resolveMetricNumber(row, key as any).value || 0

export interface GChartProps {
 data: CanonicalVideoRow[]
 trafficRows?: Array<Record<string, unknown>>
 trafficByDay?: Array<Record<string, unknown>>
 contentTypeRows?: Array<Record<string, unknown>>
 demographicRows?: Array<Record<string, unknown>>
 useVideoTrafficFallback?: boolean
}

const COLORS = ["#FF3399","#00E5FF","#CCFF00","#FF9900","#9933FF","#33FF99","#FF7497","#24D3FF","#FFB158"]
const SHORTS_REVENUE_PALETTE = ["#24BCFF", "#45DDB0", "#66FF8A"] as const
const REVENUE_EFFICIENCY_PALETTE = ["#FF7497", "#B14AED", "#26C7EC"] as const
const MISSING_BUBBLE_COLOR = "#D6D6D6"
const ctrPct = (row: CanonicalVideoRow): number => {
 const raw = mv(row, "ctr")
 if (!Number.isFinite(raw)) return 0
 return raw <= 1 ? raw * 100 : raw
}

type DistributionFormatKey = "videos" | "shorts" | "longform"
type DistributionWindowKey = "7d" | "28d" | "90d" | "365d" | "lifetime"

const DISTRIBUTION_COUNT_VALUES = [5, 10, 15, 20]
const DISTRIBUTION_FORMAT_VALUES: DistributionFormatKey[] = ["videos", "shorts", "longform"]
const DISTRIBUTION_WINDOW_VALUES: Array<{ value: DistributionWindowKey; label: string }> = [
 { value: "7d", label: "7 DAYS" },
 { value: "28d", label: "28 DAYS" },
 { value: "90d", label: "90 DAYS" },
 { value: "365d", label: "365 DAYS" },
 { value: "lifetime", label: "LIFETIME" },
]

const getDistributionFormatLabel = (value: DistributionFormatKey): string => {
 if (value === "shorts") return "SHORTS"
 if (value === "longform") return "LONG FORMAT"
 return "VIDEOS"
}

const cycleDistributionValue = <T,>(values: readonly T[], current: T, dir: 1 | -1): T => {
 const idx = values.indexOf(current)
 const nextIdx = (idx + dir + values.length) % values.length
 return values[nextIdx]
}

const getRowUploadTimestamp = (row: CanonicalVideoRow): number => {
 const uploadValue = String(row.uploadDate || "")
 const parsed = new Date(uploadValue).getTime()
 return Number.isFinite(parsed) ? parsed : 0
}

const isShortDistributionRow = (row: CanonicalVideoRow): boolean => {
 const format = String(row.format || "").toLowerCase()
 return format.includes("short") || parseDurationSeconds((row as any).durationSeconds) <= 180
}

const matchesDistributionFormat = (row: CanonicalVideoRow, format: DistributionFormatKey): boolean => {
 if (format === "videos") return true
 const isShort = isShortDistributionRow(row)
 return format === "shorts" ? isShort : !isShort
}

const matchesDistributionWindow = (row: CanonicalVideoRow, windowKey: DistributionWindowKey): boolean => {
 if (windowKey === "lifetime") return true
 const uploadTs = getRowUploadTimestamp(row)
 if (!uploadTs) return true
 const days = Number(windowKey.replace("d", ""))
 const threshold = Date.now() - days * 24 * 60 * 60 * 1000
 return uploadTs >= threshold
}

const getDistributionWindowLabel = (value: DistributionWindowKey): string =>
 DISTRIBUTION_WINDOW_VALUES.find((option) => option.value === value)?.label || "LIFETIME"

const getTrafficSourceFormatLabel = (value: DistributionFormatKey): string => {
 if (value === "shorts") return "ALL CHANNEL SHORTS"
 if (value === "longform") return "ALL LONGFORM VIDEOS"
 return "ALL CHANNEL VIDEOS"
}

const buildDistributionControllerRows = (config: {
 count: number
 onCountPrev: () => void
 onCountNext: () => void
 leadLabel: string
 leadTone: string
 format: DistributionFormatKey
 onFormatPrev: () => void
 onFormatNext: () => void
 formatTone: string
 window: DistributionWindowKey
 onWindowSelect: (value: DistributionWindowKey) => void
}): ControllerRow[] => [
 {
  type: "custom" as const,
  render: () => (
   <div className="grid h-[52px] w-full grid-cols-[minmax(82px,.86fr)_minmax(104px,1.14fr)] overflow-hidden bg-white">
    <div className="grid grid-cols-[22px_minmax(0,1fr)_22px] items-stretch bg-[#33FF99]">
     <button
      type="button"
      onClick={config.onCountPrev}
      className="grid place-items-center border-0 bg-transparent p-0 text-[18px] font-black leading-none"
      aria-label="Show fewer videos">
      ◀
     </button>
     <strong className="grid min-w-0 place-items-center text-[31px] font-[1000] leading-none tabular-nums">
      {config.count}
     </strong>
     <button
      type="button"
      onClick={config.onCountNext}
      className="grid place-items-center border-0 bg-transparent p-0 text-[18px] font-black leading-none"
      aria-label="Show more videos">
      ▶
     </button>
    </div>
    <div className="grid min-w-0 grid-rows-2 border-l-[4px] border-black">
     <div
      className="grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center overflow-hidden border-b-[4px] border-black bg-black px-1"
      style={{ color: config.leadTone }}>
      <span className="text-[11px] font-black">◀</span>
      <strong className="truncate text-center text-[9px] font-[1000] uppercase leading-none tracking-0">
       {config.leadLabel}
      </strong>
     </div>
     <button
      type="button"
      onClick={config.onFormatNext}
      className="grid min-w-0 grid-cols-[minmax(0,1fr)_16px] items-center overflow-hidden border-0 px-1 text-black"
      style={{ background: config.formatTone }}
      aria-label={`Change format from ${getDistributionFormatLabel(config.format)}`}>
      <strong className="truncate text-center text-[10px] font-[1000] uppercase leading-none tracking-0">
       {getDistributionFormatLabel(config.format).replace("ALL CHANNEL ", "")}
      </strong>
      <span className="text-[11px] font-black">▶</span>
     </button>
    </div>
   </div>
  ),
 },
 {
  type: "dropdown" as const,
  value: config.window,
  labelPrefix: "WINDOW",
  options: DISTRIBUTION_WINDOW_VALUES,
  onSelect: (value) => config.onWindowSelect(value as DistributionWindowKey),
  bgTone: "#FFFFFF",
  fgTone: "#000000",
 },
]

const EngagementKeyItem: React.FC<{ label: string; tone: string }> = ({ label, tone }) => (
 <div className="flex items-center gap-2 min-w-0">
  <div className="relative flex items-center h-5 w-[90px] shrink-0">
   <div className="absolute left-[2px] right-[2px] top-1/2 -translate-y-1/2 h-2" style={{ background: tone }} />
   <div className="flex items-center justify-between w-full relative z-10">
    <div className="w-4 h-4 border-[2px] rounded-full border-black" style={{ background: tone }} />
    <div className="w-4 h-4 border-[2px] rounded-full border-black" style={{ background: tone }} />
    <div className="w-4 h-4 border-[2px] rounded-full border-black" style={{ background: tone }} />
   </div>
  </div>
  <span className="text-[10px] font-black uppercase tracking-[0.08em] whitespace-nowrap" style={{ color: tone }}>
   {label}
  </span>
 </div>
)

const EngagementSelectedDot: React.FC<any> = ({ cx, cy, stroke }) => {
 if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null
 return <circle cx={cx} cy={cy} r={6} fill="#FFFFFF" stroke={stroke} strokeWidth={3} />
}

const EngagementHoverDot: React.FC<any> = ({ cx, cy, stroke, metricIndex = 0 }) => {
 if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null
 return (
  <circle
   cx={cx}
   cy={cy}
   r={6}
   fill="#FFFFFF"
   stroke={stroke}
   strokeWidth={3}
   className="engagement-hover-dot"
   style={{ animationDelay: `${metricIndex * 200}ms` }}
  />
 )
}

const EngagementLeftAxisLabel: React.FC<{ viewBox?: { x: number; y: number; width: number; height: number } }> = ({ viewBox }) => {
 if (!viewBox) return null
 const x = viewBox.x + 2
 const y = viewBox.y + viewBox.height / 2
 return (
  <g transform={`translate(${x},${y}) rotate(-90)`}>
   <text
    textAnchor="middle"
    dominantBaseline="middle"
    style={{ fontWeight: 1000, fontSize: 14, letterSpacing: "0.08em" }}
   >
    <tspan fill="#00E5FF">COMMENTS</tspan>
    <tspan fill="#000000"> • </tspan>
    <tspan fill="#FFE357">SHARES</tspan>
    <tspan fill="#000000"> • </tspan>
    <tspan fill="#CCFF00">SUBSCRIBERS</tspan>
   </text>
  </g>
 )
}

const EngagementRightAxisLabel: React.FC<{ viewBox?: { x: number; y: number; width: number; height: number } }> = ({ viewBox }) => {
 if (!viewBox) return null
 const x = viewBox.x + viewBox.width - 2
 const y = viewBox.y + viewBox.height / 2
 return (
  <g transform={`translate(${x},${y}) rotate(90)`}>
   <text
    textAnchor="middle"
    dominantBaseline="middle"
    style={{ fontWeight: 1000, fontSize: 15, letterSpacing: "0.08em", fill: "#FF7497" }}
   >
    LIKES
   </text>
  </g>
 )
}

const formatCompact = (value: number): string => {
 if (!Number.isFinite(value)) return "0"
 const abs = Math.abs(value)
 if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
 if (abs >= 10_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`
 return Math.round(value).toLocaleString()
}

const parseDurationSeconds = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value)
 if (typeof value !== "string") return 0
 const raw = value.trim()
 if (!raw) return 0
 if (raw.includes(":")) {
  const parts = raw.split(":").map((part) => Number(part) || 0)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
 }
 const parsed = Number(raw)
 return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

const retentionPct = (row: CanonicalVideoRow): number => {
 const aliases = [
  "avp",
  "Average percentage viewed",
  "averageViewPercentage",
  "averagePercentageViewed",
  "AVP %",
  "STW %",
  "Stayed to watch (%)",
  "stayedToWatch",
 ]
 for (const key of aliases) {
  const rawValue = resolveMetricNumber(row, key as any).value
  const raw = typeof rawValue === "number" ? rawValue : 0
  if (!Number.isFinite(raw) || raw <= 0) continue
  if (raw <= 150) return raw
  const normalized = raw / 100
  if (normalized > 0 && normalized <= 150) return normalized
 }
 const views = mv(row, "views")
 const engagedViews = mv(row, "engagedViews")
 if (views > 0 && engagedViews > 0) {
  const derived = (engagedViews / views) * 100
  if (Number.isFinite(derived) && derived > 0 && derived <= 150) return derived
 }
 return 0
}

const isLongFormForValueMatrix = (row: CanonicalVideoRow): boolean => {
 const format = String(row.format || "").toLowerCase()
 if (format.includes("short")) return false
 if (format.includes("long")) return true
 const rowObj = row as unknown as Record<string, unknown>
 const duration = parseDurationSeconds(rowObj.Duration ?? rowObj.Length ?? row.durationSeconds)
 if (duration > 0 && duration <= 70) return false
 return true
}

/* ── Shared tooltip ── */
const ChartTip = ({ active, payload }: any) => {
 if (!active || !payload?.length) return null
 const d = payload[0]?.payload
 return (
  <div className="bg-white border-[3px] border-black p-3 shadow-[4px_4px_0px_0px_black] rounded-xl z-50 max-w-[260px]">
   <p className="font-black text-[11px] uppercase mb-1 border-b-2 border-black/10 pb-1 truncate">
    {d?.title || d?.name || "Data Point"}
   </p>
   {payload.map((e: any, i: number) => (
    <div key={i} className="flex justify-between gap-3 text-[10px] font-bold">
     <span className="uppercase opacity-60" style={{ color: e.color }}>{e.name}:</span>
     <span className="font-black">{typeof e.value === "number" && e.value > 1000 ? e.value.toLocaleString() : e.value}</span>
    </div>
   ))}
  </div>
 )
}

/* ── Chart card shell ── */
const Card: React.FC<{
 title: string; subtitle?: string; headerColor?: string; count?: number; icon?: React.ReactNode; controls?: React.ReactNode; children: React.ReactNode
}> = ({ title, subtitle = "CANONICAL METRIC VIEW", headerColor = "#FFEA00", count, icon = <CustomIcon name="analytics" size={18} />, controls, children }) => (
 <UnifiedChartModule
  title={title}
  subtitle={subtitle}
  headerIcon={icon}
  headerColor={headerColor}
  stats={count !== undefined ? [{ label: "VIDEOS", value: String(count), tone: "white" }] : []}
  controls={controls}
 >
  <div className="mx-auto max-w-[1020px] border-[3px] border-black rounded-[8px] bg-white p-2 h-[332px]">
   <StableChartFrame minHeightClassName="min-h-[320px]">
    {children}
   </StableChartFrame>
  </div>
 </UnifiedChartModule>
)

/* ═══════════════════════════════════════════════
   1. VIDEO VALUE MATRIX
   ═══════════════════════════════════════════════ */
export const VideoValueMatrix: React.FC<GChartProps> = ({ data }) => {
 const [mode, setMode] = useState<"top-performing" | "most-recent">("top-performing")
 const [modeMenuOpen, setModeMenuOpen] = useState(false)
 const [selectedCount, setSelectedCount] = useState(25)
 const [countMenuOpen, setCountMenuOpen] = useState(false)
 const [selectedFormat, setSelectedFormat] = useState("All")
 const [hoveredKey, setHoveredKey] = useState<string | null>(null)

 const COUNT_VALUES = [10, 15, 20, 25, 50, 100]
 const COUNT_OPTIONS = COUNT_VALUES.map((n) => ({ value: String(n), label: `TOP ${n}` }))
 const cycleCount = (dir: 1 | -1) => {
  const idx = COUNT_VALUES.indexOf(selectedCount)
  const nextIdx = (idx + dir + COUNT_VALUES.length) % COUNT_VALUES.length
  setSelectedCount(COUNT_VALUES[nextIdx])
  setHoveredKey(null)
 }

 const matrix = useMemo(() => {
  const missing = new Set<string>()
  const warnings = new Set<string>()
  const allLongRows = data.filter((row) => {
   if (selectedFormat === "Long") return isLongFormForValueMatrix(row)
   // "All" includes both long-form and short-form videos
   return true
  })

  const points = allLongRows
   .map((row, index) => {
    const ctr = ctrPct(row)
    const retention = retentionPct(row)
    const views = mv(row, "views")
    const impressions = mv(row, "impressions")
    const likes = mv(row, "likes")
    const uploadTs = new Date(String(row.uploadDate || "")).getTime() || 0
    const title = row.title || `Untitled ${index + 1}`

    if (!(views > 0)) missing.add("views")
    if (!(ctr > 0)) missing.add("ctr_percent")
    if (!(retention > 0)) missing.add("retention_percent")
    if (!(impressions > 0)) warnings.add("impressions_unavailable")

    return {
     key: `${title}-${uploadTs}-${index}`,
     title,
     ctr,
     retention,
     views,
     impressions,
     likes,
     uploadTs,
    }
   })
   .filter((row) => row.views > 0 && row.ctr > 0 && row.retention > 0)

  const sorted =
   mode === "most-recent"
    ? [...points].sort((a, b) => b.uploadTs - a.uploadTs)
    : [...points].sort((a, b) => b.views - a.views)
  const topN = sorted.slice(0, selectedCount)

  const inRangeCtr = topN.map((point) => point.ctr).filter((value) => value > 0 && value <= 20)
  const ctrCeilCandidate = inRangeCtr.length > 0 ? Math.max(...inRangeCtr) * 1.1 : 10
  const ctrDomainMax = Math.max(10, Math.min(20, Math.ceil(ctrCeilCandidate)))
  const plotted = topN.filter((point) => point.ctr <= ctrDomainMax)
  if (plotted.length < topN.length) warnings.add("ctr_outliers_excluded_from_plot")

  const maxViews = Math.max(1, ...plotted.map((point) => point.views))
  const minViews = Math.max(1, Math.min(...plotted.map((point) => point.views)))
  const bubbleSize = (views: number) => {
   if (maxViews === minViews) return 220
   const t = (views - minViews) / (maxViews - minViews)
   return Math.round(80 + t * 620)
  }

  return {
   points: plotted.map((point) => ({ ...point, bubble: bubbleSize(point.views) })),
   count: topN.length,
   ctrDomainMax,
   retentionDomainMax: 150,
   thresholds: { ctr: 5, retention: 75 },
   validRows: points.length,
   missingMetrics: Array.from(missing).sort(),
   qualityWarnings: Array.from(warnings).sort(),
   totalLongRows: allLongRows.length,
  }
 }, [data, mode, selectedCount, selectedFormat])

 const activePoint = useMemo(() => {
  if (matrix.points.length === 0) return null
  const selected = matrix.points.find((point) => point.key === hoveredKey)
  return selected || matrix.points[0]
 }, [matrix.points, hoveredKey])

 return (
  <SubToolboxChartModule
   header={{
    title: "VIDEO VALUE MATRIX",
    subtitle: `TOP ${selectedCount} ${mode === "most-recent" ? "RECENT" : "PERFORMING"} ${selectedFormat === "All" ? "VIDEOS" : selectedFormat.toUpperCase() + " FORM"}`,
    icon: <CustomIcon name="target" size={18} />,
    headerStyle: "subtoolbox",
   }}
   theme={{
    headerBandBg: "#FFEA00",
    iconBlockBg: "#FF7497",
    shadowColor: "rgba(255,234,0,0.45)",
   }}
   layout={{ moduleMinHeight: "420px", moduleWidth: "100%" }}
   controlBox={{
    count: matrix.count,
    countUnit: "VIDEOS",
    countLabel: matrix.totalLongRows <= selectedCount ? "ALL" : "TOP",
    onCountPrev: () => cycleCount(-1),
    onCountNext: () => cycleCount(1),
    dropdown: {
      value: String(selectedCount),
      isOpen: countMenuOpen,
      onToggle: () => setCountMenuOpen((prev) => !prev),
      onSelect: (value) => {
       setSelectedCount(Number(value))
       setCountMenuOpen(false)
       setHoveredKey(null)
      },
      options: COUNT_OPTIONS,
    },
    dropdown2:
     matrix.totalLongRows > selectedCount
      ? {
          value: mode,
          isOpen: modeMenuOpen,
          onToggle: () => setModeMenuOpen((prev) => !prev),
          onSelect: (value) => {
           setMode(value as "top-performing" | "most-recent")
           setModeMenuOpen(false)
           setHoveredKey(null)
          },
          options: [
           { value: "top-performing", label: "BEST" },
           { value: "most-recent", label: "LAST" },
          ],
         }
      : undefined,
   }}
   activeContext={{
    title: activePoint?.title?.toUpperCase().slice(0, 42) || "HOVER OVER A BUBBLE",
    stats: activePoint
     ? [
        { label: "CTR", value: `${activePoint.ctr.toFixed(2)}%`, tone: "cyan" },
        { label: "RET", value: `${activePoint.retention.toFixed(1)}%`, tone: "pink" },
        { label: "VIEWS", value: activePoint.views.toLocaleString(), tone: "yellow" },
        { label: "LIKES", value: activePoint.likes.toLocaleString(), tone: "pink" },
       ]
     : [],
   }}
   legendLayout={{
    center: (
     <div className="justify-self-center flex items-center gap-3">
      <span className="text-black font-[1000] text-[16px] leading-none">◀</span>
      <span className="uppercase tracking-[0.1em] text-black font-[1000] text-[14px]">
       CTR %
      </span>
      <span className="text-black font-[1000] text-[16px] leading-none">▶</span>
     </div>
    ),
    right: (
     <div className="flex items-center gap-2 justify-self-start">
      <div className="flex items-center gap-2">
       <div className="flex items-center justify-between w-[115px]">
        <span className="w-2 aspect-square shrink-0 box-border rounded-full bg-[#00CCFF] opacity-[0.75]" />
        <span className="w-3 aspect-square shrink-0 box-border rounded-full bg-[#00CCFF] opacity-[0.75]" />
        <span className="w-4 aspect-square shrink-0 box-border rounded-full bg-[#00CCFF] opacity-[0.75]" />
        <span className="w-5 aspect-square shrink-0 box-border rounded-full bg-[#00CCFF] opacity-[0.75]" />
        <span className="w-6 aspect-square shrink-0 box-border rounded-full bg-[#00CCFF] opacity-[0.75]" />
       </div>
       <span className="text-[14px] font-[1000] uppercase tracking-[0.05em] text-black">Views</span>
      </div>
     </div>
    ),
   }}
  footer={
    <InsightMarquee
     mode="insight-lock"
     segments={[
      { badge: "Chart Insight", text: "Video Value Matrix segments your content into four performance quadrants.", badgeTone: "cyan" },
      {
       badge: "Personal Insight",
       text:
        matrix.points.length > 0
         ? "Focus on Hidden Gems (top-left) and fix Clickbait (bottom-right) with tighter title-thumbnail-content alignment."
         : "Value Matrix needs valid CTR, retention, and views.",
       badgeTone: "lime",
      },
     ]}
   />
  }
   disableActiveContextBottomBorder
  >
   <div className="p-4 h-[420px] relative">
    <div className="h-[320px] relative">
     <StableChartFrame minHeightClassName="min-h-[320px]">
       <ScatterChart margin={{ top: 10, right: 8, bottom: 8, left: 8 }}>
        <ReferenceArea x1={0} x2={matrix.thresholds.ctr} y1={matrix.thresholds.retention} y2={matrix.retentionDomainMax} fill="#dbeafe" fillOpacity={0.16} />
        <ReferenceArea x1={matrix.thresholds.ctr} x2={matrix.ctrDomainMax} y1={matrix.thresholds.retention} y2={matrix.retentionDomainMax} fill="#dcfce7" fillOpacity={0.16} />
        <ReferenceArea x1={0} x2={matrix.thresholds.ctr} y1={0} y2={matrix.thresholds.retention} fill="#fee2e2" fillOpacity={0.16} />
        <ReferenceArea x1={matrix.thresholds.ctr} x2={matrix.ctrDomainMax} y1={0} y2={matrix.thresholds.retention} fill="#fef3c7" fillOpacity={0.16} />
        <CartesianGrid stroke="rgba(0,0,0,0.12)" strokeDasharray="3 3" />
        <XAxis
         type="number"
         dataKey="ctr"
         name="CTR"
         unit="%"
         domain={[0, matrix.ctrDomainMax]}
         tick={{ fontWeight: 1000, fontSize: 11, fill: "#000" }}
         tickLine={false}
         axisLine={{ stroke: "#000", strokeWidth: 3 }}
         label={{ value: "CTR %", position: "insideBottom", offset: -4, style: { fontSize: 12, fontWeight: 1000 } }}
        />
        <YAxis
         type="number"
         dataKey="retention"
         name="Retention"
         unit="%"
         domain={[0, matrix.retentionDomainMax]}
         tick={{ fontWeight: 1000, fontSize: 11, fill: "#000" }}
         tickLine={false}
         axisLine={{ stroke: "#000", strokeWidth: 3 }}
         label={{ value: "RETENTION %", angle: -90, position: "insideLeft", style: { fontSize: 12, fontWeight: 1000 } }}
        />
        <ZAxis type="number" dataKey="bubble" range={[80, 700]} />
        <ReferenceLine x={matrix.thresholds.ctr} stroke="#111827" strokeOpacity={0.75} strokeWidth={1.5} />
        <ReferenceLine y={matrix.thresholds.retention} stroke="#111827" strokeOpacity={0.75} strokeWidth={1.5} />
        <Tooltip content={<ChartTip />} />
        <Scatter
         name="Long-form"
         data={matrix.points}
         fill="#00CCFF"
         fillOpacity={0.85}
         stroke="#ffffff"
         strokeWidth={1}
         onMouseEnter={(point: any) => setHoveredKey(point?.key || null)}
         onMouseLeave={() => setHoveredKey(null)}
         isAnimationActive
         animationDuration={900}
        />
       </ScatterChart>
     </StableChartFrame>
    </div>
    {matrix.points.length === 0 && (
     <div className="absolute inset-0 p-6 flex items-center justify-center pointer-events-none">
      <div className="max-w-[620px] w-full border-[3px] border-black rounded-xl bg-white/95 p-5 text-center shadow-[6px_6px_0px_0px_black]">
       <p className="text-[11px] font-black uppercase tracking-[0.18em] text-black/55">Data missing for this chart</p>
       <p className="text-2xl font-[1000] uppercase tracking-tight mt-2">Value Matrix needs valid CTR, retention, and views</p>
       <p className="text-[11px] font-black uppercase tracking-[0.14em] text-black/55 mt-3">Valid rows: {matrix.validRows}</p>
       <p className="text-[10px] font-black uppercase tracking-[0.14em] text-black/45 mt-2">
        Missing metrics: {matrix.missingMetrics.length > 0 ? matrix.missingMetrics.join(", ") : "none"}
       </p>
       {matrix.qualityWarnings.length > 0 && (
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-black/45 mt-1">
         Quality warnings: {matrix.qualityWarnings.join(", ")}
        </p>
       )}
      </div>
     </div>
    )}
    <div className="absolute left-8 top-8 text-[10px] font-black uppercase tracking-[0.18em] text-black/30 pointer-events-none">Hidden Gems</div>
    <div className="absolute right-8 top-8 text-[10px] font-black uppercase tracking-[0.18em] text-black/30 pointer-events-none">Gold Mine</div>
    <div className="absolute left-8 bottom-[58px] text-[10px] font-black uppercase tracking-[0.18em] text-black/30 pointer-events-none">Need Work</div>
    <div className="absolute right-8 bottom-[58px] text-[10px] font-black uppercase tracking-[0.18em] text-black/30 pointer-events-none">Clickbait</div>
   </div>
  </SubToolboxChartModule>
 )
}
type AgeGenderAudienceDatum = {
 cohort: string
 male: number
 female: number
 other: number
 total: number
}

const demographicNumber = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value)
 if (typeof value === "string") {
  const parsed = Number(value.replace(/[$,% ,]/g, ""))
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
 }
 return 0
}

const demographicLabel = (row: Record<string, unknown>): string =>
 String(row.ageGroupLabel || row.cohort || row.ageGroup || "Unknown")

const buildAgeGenderAudienceData = (rows: Array<Record<string, unknown>> = []): AgeGenderAudienceDatum[] => {
 const byCohort = new Map<string, AgeGenderAudienceDatum>()
 rows.forEach((row) => {
  const cohort = demographicLabel(row)
  if (!cohort || cohort === "Unknown") return
  const existing = byCohort.get(cohort) || { cohort, male: 0, female: 0, other: 0, total: 0 }
  const gender = String(row.gender || "").toLowerCase()
  const directMale = demographicNumber(row.maleViewerPercentage)
  const directFemale = demographicNumber(row.femaleViewerPercentage)
  const directOther = demographicNumber(row.otherViewerPercentage)
  if (directMale || directFemale || directOther) {
   existing.male += directMale
   existing.female += directFemale
   existing.other += directOther
  } else if (gender.includes("female")) {
   existing.female += demographicNumber(row.viewerPercentage ?? row.viewsPct)
  } else if (gender.includes("male")) {
   existing.male += demographicNumber(row.viewerPercentage ?? row.viewsPct)
  } else {
   existing.other += demographicNumber(row.viewerPercentage ?? row.viewsPct)
  }
  existing.total = existing.male + existing.female + existing.other
  byCohort.set(cohort, existing)
 })
 return [...byCohort.values()].filter((row) => row.total > 0).slice(0, 7)
}

/* 2. Revenue Distribution */
export const RevenueDistribution: React.FC<GChartProps> = ({ data }) => {
 const [selectedCount, setSelectedCount] = useState(10)
 const [selectedFormat, setSelectedFormat] = useState<DistributionFormatKey>("videos")
 const [selectedWindow, setSelectedWindow] = useState<DistributionWindowKey>("lifetime")
 const cycleCount = (dir: 1 | -1) => {
  setSelectedCount(cycleDistributionValue(DISTRIBUTION_COUNT_VALUES, selectedCount, dir))
 }
 const cycleFormat = (dir: 1 | -1) => {
  setSelectedFormat(cycleDistributionValue(DISTRIBUTION_FORMAT_VALUES, selectedFormat, dir))
 }
 const filtered = useMemo(() => data.filter((row) => matchesDistributionFormat(row, selectedFormat) && matchesDistributionWindow(row, selectedWindow) && mv(row, "revenue") > 0), [data, selectedFormat, selectedWindow])
 const cd = useMemo(() => [...filtered].sort((a,b) => mv(b,"revenue")-mv(a,"revenue")).slice(0,selectedCount)
  .map(r => ({ name: r.title.substring(0,25), value: +mv(r,"revenue").toFixed(2) })).filter(d=>d.value>0), [filtered, selectedCount])
 const total = useMemo(() => cd.reduce((s, d) => s + d.value, 0), [cd])
 const controllerRows = buildDistributionControllerRows({
  count: cd.length,
  onCountPrev: () => cycleCount(-1),
  onCountNext: () => cycleCount(1),
  leadLabel: "HIGHEST EARNING",
  leadTone: "#CCFF00",
  format: selectedFormat,
  onFormatPrev: () => cycleFormat(-1),
  onFormatNext: () => cycleFormat(1),
  formatTone: "#FF7497",
  window: selectedWindow,
  onWindowSelect: (value) => setSelectedWindow(value),
 })
 return (
  <SubToolboxChartModule
   header={{
   title: "REVENUE DISTRIBUTION",
    subtitle: `TOP ${cd.length} • ${getDistributionFormatLabel(selectedFormat)} • ${getDistributionWindowLabel(selectedWindow)}`,
    icon: <CustomIcon name="analytics" size={18} />,
    headerStyle: "subtoolbox",
    titleClassName: "text-[clamp(18px,2vw,30px)] leading-[.9]",
   }}
   theme={{
    headerBandBg: "#CCFF00",
    iconBlockBg: "#00E5FF",
    shadowColor: "rgba(204,255,0,0.45)",
   }}
   layout={{ moduleMinHeight: "250px", moduleWidth: "100%" }}
   controllerWidth={210}
   controllerRows={controllerRows}
   activeContext={{
    title: cd[0]?.name?.toUpperCase() || "NO DATA",
    stats: [
     { label: "TOP", value: `$${cd[0]?.value?.toFixed(2) ?? 0}`, tone: "lime" },
     { label: "TOTAL", value: `$${total.toFixed(2)}`, tone: "cyan" },
    ],
   }}
   footer={
    <InsightMarquee
     mode="insight-lock"
     segments={[
      { badge: "Revenue", text: "Revenue distribution shows which videos generate the most income - focus on creating more of your top earners.", badgeTone: "lime" },
     ]}
    />
   }
  >
   <div className="h-[250px] px-3 pb-3 pt-1">
    <StableChartFrame minHeightClassName="min-h-[220px]">
     <PieChart>
      <Pie data={cd} innerRadius="30%" outerRadius="90%" dataKey="value" stroke="#fff" strokeWidth={2} label={({value})=>`$${value}`}>
       <Label value="REVENUE" position="center" style={{ fontSize: "11px", fontWeight: 1000, fill: "#000000" }} />
       {cd.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
      </Pie>
      <Tooltip content={<ChartTip/>}/>
     </PieChart>
    </StableChartFrame>
   </div>
  </SubToolboxChartModule>
 )
}

/* 2b. Age x Gender Audience — Interactive Sunburst */
const SUNBURST_GRADIENT = [
 "#FF3399", "#FF6633", "#FFAA00", "#CCFF00", "#00E5FF", "#3366FF", "#9933FF",
] as const

const sunburstColor = (t: number): string => {
 const palette = SUNBURST_GRADIENT
 const scaled = t * (palette.length - 1)
 const lo = Math.floor(Math.min(scaled, palette.length - 2))
 const hi = lo + 1
 const frac = scaled - lo
 const parse = (hex: string) => [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]
 const [r1,g1,b1] = parse(palette[lo])
 const [r2,g2,b2] = parse(palette[hi])
 return `rgb(${Math.round(r1+(r2-r1)*frac)},${Math.round(g1+(g2-g1)*frac)},${Math.round(b1+(b2-b1)*frac)})`
}

const polarToCart = (cx: number, cy: number, r: number, angle: number) => ({
 x: cx + r * Math.cos(angle),
 y: cy + r * Math.sin(angle),
})

const arcPath = (cx: number, cy: number, r1: number, r2: number, startAngle: number, endAngle: number): string => {
 const s1 = polarToCart(cx, cy, r1, startAngle)
 const s2 = polarToCart(cx, cy, r2, startAngle)
 const e1 = polarToCart(cx, cy, r1, endAngle)
 const e2 = polarToCart(cx, cy, r2, endAngle)
 const large = endAngle - startAngle > Math.PI ? 1 : 0
 return `M${s1.x},${s1.y} A${r1},${r1} 0 ${large} 1 ${e1.x},${e1.y} L${e2.x},${e2.y} A${r2},${r2} 0 ${large} 0 ${s2.x},${s2.y} Z`
}

export const AgeGenderAudienceModule: React.FC<GChartProps> = ({ demographicRows }) => {
 const cd = useMemo(() => buildAgeGenderAudienceData(demographicRows), [demographicRows])
 const leader = useMemo(() => [...cd].sort((a, b) => b.total - a.total)[0], [cd])
 const total = useMemo(() => cd.reduce((sum, row) => sum + row.total, 0), [cd])
 const [hovered, setHovered] = useState<string | null>(null)

 // Build sunburst data — inner ring = age cohorts, outer ring = gender splits
 const sunData = useMemo(() => {
 const AGE_GROUPS = cd.map((row, i) => {
 const start = i / cd.length
 const end = (i + 1) / cd.length
 return {
 label: row.cohort,
 pct: row.total,
 colorT: cd.length <= 1 ? 0.5 : i / (cd.length - 1),
 arcStart: start,
 arcEnd: end,
 male: row.male,
 female: row.female,
 other: row.other,
 }
 })
 // Outer ring: gender per age group
 const OUTER: Array<{ label: string; pct: number; colorT: number; arcStart: number; arcEnd: number; parentLabel: string }> = []
 AGE_GROUPS.forEach((ag) => {
 const segments = [
 { label: "Male", val: ag.male },
 { label: "Female", val: ag.female },
 { label: "Other", val: ag.other },
 ].filter(s => s.val > 0)
 const segTotal = segments.reduce((s, x) => s + x.val, 0) || 1
 const span = ag.arcEnd - ag.arcStart
 let offset = 0
 segments.forEach((seg, si) => {
 const frac = seg.val / segTotal
 OUTER.push({
 label: seg.label,
 pct: seg.val,
 colorT: ag.colorT + (si - 1) * 0.05,
 arcStart: ag.arcStart + offset * span,
 arcEnd: ag.arcStart + (offset + frac) * span,
 parentLabel: ag.label,
 })
 offset += frac
 })
 })
 return { inner: AGE_GROUPS, outer: OUTER }
 }, [cd])

 const CX = 160
 const CY = 155
 const R_IN1 = 50, R_IN2 = 110, R_OUT1 = 115, R_OUT2 = 155
 const toAngle = (t: number) => t * 2 * Math.PI - Math.PI / 2

 const hoveredInner = sunData.inner.find(d => d.label === hovered)
 const hoveredOuter = sunData.outer.find(d => `${d.parentLabel}-${d.label}` === hovered)
 const hoveredLabel = hoveredInner ? hoveredInner.label : hoveredOuter ? `${hoveredOuter.parentLabel} / ${hoveredOuter.label}` : null
 const hoveredPct = hoveredInner ? hoveredInner.pct : hoveredOuter ? hoveredOuter.pct : null

 return (
 <SubToolboxChartModule
 header={{
 title: "AGE × GENDER",
 subtitle: "VIEWER % SUNBURST · INNER=AGE · OUTER=GENDER",
 icon: <CustomIcon name="analytics" size={18} />,
 headerStyle: "subtoolbox",
 titleClassName: "text-[clamp(18px,2vw,30px)] leading-[.9]",
 }}
 theme={{
 headerBandBg: "#CCFF00",
 iconBlockBg: "#F55EFC",
 shadowColor: "rgba(204,255,0,0.45)",
 }}
 layout={{ moduleMinHeight: "320px", moduleWidth: "100%" }}
 activeContext={{
 title: hoveredLabel ? hoveredLabel.toUpperCase() : (leader?.cohort?.toUpperCase() || "NO DATA"),
 stats: [
 { label: "PCT", value: hoveredPct != null ? `${hoveredPct.toFixed(1)}%` : `${leader?.total.toFixed(1) ?? "0.0"}%`, tone: "lime" },
 { label: "TOTAL", value: `${total.toFixed(1)}%`, tone: "pink" },
 ],
 }}
 footer={
 <InsightMarquee
 mode="insight-lock"
 segments={[{ badge: "Audience", text: "Inner ring = age groups · outer ring = gender split per age · hover to inspect.", badgeTone: "lime" }]}
 />
 }
 >
 <div className="flex items-center gap-4 px-3 pb-3 pt-1" style={{ background: "#0a0b18" }}>
 <svg viewBox="0 0 320 310" width={320} height={310} style={{ flexShrink: 0, background: "#0a0b18" }}>
 {/* Inner ring — age groups */}
 {sunData.inner.map((seg) => {
 const key = seg.label
 const isHov = hovered === key
 const col = sunburstColor(seg.colorT)
 const sa = toAngle(seg.arcStart)
 const ea = toAngle(seg.arcEnd)
 const gap = 0.01
 return (
 <g key={key}
 onMouseEnter={() => setHovered(key)}
 onMouseLeave={() => setHovered(null)}
 style={{ cursor: "pointer" }}
 >
 <path
 d={arcPath(CX, CY, R_IN1, isHov ? R_IN2 + 6 : R_IN2, sa + gap, ea - gap)}
 fill={col}
 fillOpacity={isHov ? 1 : 0.82}
 stroke="#0a0b18"
 strokeWidth={2}
 style={{ transition: "all 200ms cubic-bezier(0.34,1.56,0.64,1)", filter: isHov ? `drop-shadow(0 0 6px ${col})` : undefined }}
 />
 {(ea - sa) > 0.18 && (
 <text
 x={polarToCart(CX, CY, (R_IN1 + R_IN2) / 2, (sa + ea) / 2).x}
 y={polarToCart(CX, CY, (R_IN1 + R_IN2) / 2, (sa + ea) / 2).y + 3}
 textAnchor="middle"
 fontSize={isHov ? 9 : 8}
 fontWeight={1000}
 fill="#000"
 style={{ pointerEvents: "none", textTransform: "uppercase" }}
 >
 {seg.label.replace(/age_/i, "")}
 </text>
 )}
 </g>
 )
 })}
 {/* Outer ring — gender per age */}
 {sunData.outer.map((seg) => {
 const key = `${seg.parentLabel}-${seg.label}`
 const isHov = hovered === key
 const col = seg.label === "Male" ? "#36E0F6" : seg.label === "Female" ? "#FF7AC8" : "#CCFF00"
 const sa = toAngle(seg.arcStart)
 const ea = toAngle(seg.arcEnd)
 const gap = 0.006
 return (
 <g key={key}
 onMouseEnter={() => setHovered(key)}
 onMouseLeave={() => setHovered(null)}
 style={{ cursor: "pointer" }}
 >
 <path
 d={arcPath(CX, CY, R_OUT1, isHov ? R_OUT2 + 8 : R_OUT2, sa + gap, ea - gap)}
 fill={col}
 fillOpacity={isHov ? 1 : 0.85}
 stroke="#0a0b18"
 strokeWidth={1.5}
 style={{ transition: "all 180ms cubic-bezier(0.34,1.56,0.64,1)", filter: isHov ? `drop-shadow(0 0 5px ${col})` : undefined }}
 />
 </g>
 )
 })}
 {/* Centre label */}
 <text x={CX} y={CY - 8} textAnchor="middle" fontSize={11} fontWeight={1000} fill="#fff">AGE</text>
 <text x={CX} y={CY + 6} textAnchor="middle" fontSize={9} fontWeight={800} fill="rgba(255,255,255,0.6)" style={{ textTransform: "uppercase" }}>× GENDER</text>
 </svg>
 {/* Legend */}
 <div className="flex flex-col gap-2 min-w-0">
 <div className="text-[9px] font-black uppercase tracking-[0.1em] text-white/60 mb-1">AGE GROUPS</div>
 {cd.map((row, i) => (
 <div key={row.cohort} className="flex items-center gap-2">
 <span className="w-3 h-3 rounded-sm shrink-0 border border-black/20" style={{ background: sunburstColor(cd.length <= 1 ? 0.5 : i / (cd.length - 1)) }} />
 <span className="text-[10px] font-black uppercase text-white">{row.cohort}</span>
 <span className="text-[10px] font-[900] text-white/70 ml-auto">{row.total.toFixed(1)}%</span>
 </div>
 ))}
 <div className="text-[9px] font-black uppercase tracking-[0.1em] text-white/60 mt-2 mb-1">GENDER (outer)</div>
 {[
 { label: "Male", color: "#36E0F6" },
 { label: "Female", color: "#FF7AC8" },
 { label: "Other", color: "#CCFF00" },
 ].map(g => (
 <div key={g.label} className="flex items-center gap-2">
 <span className="w-3 h-3 rounded-sm shrink-0 border border-black/20" style={{ background: g.color }} />
 <span className="text-[10px] font-black uppercase text-white">{g.label}</span>
 </div>
 ))}
 </div>
 </div>
 </SubToolboxChartModule>
 )
}

/* 3. Watch Time Distribution */
export const WatchTimeDistribution: React.FC<GChartProps> = ({ data }) => {
 const [selectedCount, setSelectedCount] = useState(10)
 const [selectedFormat, setSelectedFormat] = useState<DistributionFormatKey>("videos")
 const [selectedWindow, setSelectedWindow] = useState<DistributionWindowKey>("lifetime")
 const cycleCount = (dir: 1 | -1) => {
  setSelectedCount(cycleDistributionValue(DISTRIBUTION_COUNT_VALUES, selectedCount, dir))
 }
 const cycleFormat = (dir: 1 | -1) => {
  setSelectedFormat(cycleDistributionValue(DISTRIBUTION_FORMAT_VALUES, selectedFormat, dir))
 }
 const filtered = useMemo(() => data.filter((row) => matchesDistributionFormat(row, selectedFormat) && matchesDistributionWindow(row, selectedWindow) && mv(row, "watchHours") > 0), [data, selectedFormat, selectedWindow])
 const cd = useMemo(() => [...filtered].sort((a,b) => mv(b,"watchHours")-mv(a,"watchHours")).slice(0,selectedCount)
  .map(r => ({ name: r.title.substring(0,25), value: +mv(r,"watchHours").toFixed(1) })).filter(d=>d.value>0), [filtered, selectedCount])
 const total = useMemo(() => cd.reduce((s, d) => s + d.value, 0), [cd])
 const controllerRows = buildDistributionControllerRows({
  count: cd.length,
  onCountPrev: () => cycleCount(-1),
  onCountNext: () => cycleCount(1),
  leadLabel: "HIGHEST WATCH TIME",
  leadTone: "#FFEA00",
  format: selectedFormat,
  onFormatPrev: () => cycleFormat(-1),
  onFormatNext: () => cycleFormat(1),
  formatTone: "#00E5FF",
  window: selectedWindow,
  onWindowSelect: (value) => setSelectedWindow(value),
 })
 return (
  <SubToolboxChartModule
   header={{
   title: "WATCH TIME DISTRIBUTION",
    subtitle: `TOP ${cd.length} • ${getDistributionFormatLabel(selectedFormat)} • ${getDistributionWindowLabel(selectedWindow)}`,
    icon: <CustomIcon name="calendar" size={18} />,
    headerStyle: "subtoolbox",
    titleClassName: "text-[clamp(18px,2vw,30px)] leading-[.9]",
   }}
   theme={{
    headerBandBg: "#FFEA00",
    iconBlockBg: "#FF7497",
    shadowColor: "rgba(255,234,0,0.45)",
   }}
   layout={{ moduleMinHeight: "250px", moduleWidth: "100%" }}
   controllerWidth={210}
   controllerRows={controllerRows}
   activeContext={{
    title: cd[0]?.name?.toUpperCase() || "NO DATA",
    stats: [
     { label: "TOP", value: `${cd[0]?.value ?? 0}h`, tone: "pink" },
     { label: "TOTAL", value: `${total.toFixed(1)}h`, tone: "yellow" },
    ],
   }}
   footer={
    <InsightMarquee
     mode="insight-lock"
     segments={[
      { badge: "Watch Time", text: "Watch time distribution reveals which videos keep viewers engaged longest — a key factor in algorithmic promotion.", badgeTone: "lime" },
     ]}
    />
   }
  >
   <div className="h-[250px] px-3 pb-3 pt-1">
    <StableChartFrame minHeightClassName="min-h-[220px]">
     <PieChart>
      <Pie data={cd} innerRadius="20%" outerRadius="90%" dataKey="value" stroke="#fff" strokeWidth={2}>
       <Label value="WATCH TIME" position="center" style={{ fontSize: "11px", fontWeight: 1000, fill: "#000000" }} />
       {cd.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
      </Pie>
      <Tooltip content={<ChartTip/>}/>
     </PieChart>
    </StableChartFrame>
   </div>
  </SubToolboxChartModule>
 )
}

/* 4. Subscribers Gained */
export const SubscribersGained: React.FC<GChartProps> = ({ data }) => {
 const [selectedCount, setSelectedCount] = useState(10)
 const [selectedFormat, setSelectedFormat] = useState<DistributionFormatKey>("videos")
 const [selectedWindow, setSelectedWindow] = useState<DistributionWindowKey>("lifetime")
 const cycleCount = (dir: 1 | -1) => {
  setSelectedCount(cycleDistributionValue(DISTRIBUTION_COUNT_VALUES, selectedCount, dir))
 }
 const cycleFormat = (dir: 1 | -1) => {
  setSelectedFormat(cycleDistributionValue(DISTRIBUTION_FORMAT_VALUES, selectedFormat, dir))
 }
 const filtered = useMemo(() => data.filter((row) => matchesDistributionFormat(row, selectedFormat) && matchesDistributionWindow(row, selectedWindow) && mv(row, "subscribersGained") > 0), [data, selectedFormat, selectedWindow])
 const cd = useMemo(() => [...filtered]
  .sort((a, b) => mv(b, "subscribersGained") - mv(a, "subscribersGained"))
  .slice(0, selectedCount)
  .map((r) => ({ name: r.title.substring(0, 18), value: mv(r, "subscribersGained") }))
  .filter((d) => d.value > 0), [filtered, selectedCount])
 const controllerRows = buildDistributionControllerRows({
  count: cd.length,
  onCountPrev: () => cycleCount(-1),
  onCountNext: () => cycleCount(1),
   leadLabel: "HIGHEST SUBSCRIBERS",
  leadTone: "#00E5FF",
  format: selectedFormat,
  onFormatPrev: () => cycleFormat(-1),
  onFormatNext: () => cycleFormat(1),
  formatTone: "#FF7497",
  window: selectedWindow,
  onWindowSelect: (value) => setSelectedWindow(value),
 })
 return (
  <SubToolboxChartModule
   header={{
   title: "SUBSCRIBERS GAINED",
    subtitle: `TOP ${cd.length} • ${getDistributionFormatLabel(selectedFormat)} • ${getDistributionWindowLabel(selectedWindow)}`,
    icon: <CustomIcon name="analytics" size={18} />,
    headerStyle: "subtoolbox",
    titleClassName: "text-[clamp(18px,2vw,30px)] leading-[.9]",
   }}
   theme={{
    headerBandBg: "#FFEA00",
    iconBlockBg: "#00E5FF",
    shadowColor: "rgba(255,234,0,0.45)",
   }}
   layout={{ moduleMinHeight: "250px", moduleWidth: "100%" }}
   controllerWidth={210}
   controllerRows={controllerRows}
   activeContext={{
    title: cd[0]?.name?.toUpperCase() || "NO DATA",
    stats: [
     { label: "#1", value: String(cd[0]?.value ?? 0), tone: "cyan" },
     { label: "TOTAL", value: String(cd.reduce((s, d) => s + d.value, 0)), tone: "lime" },
    ],
   }}
   footer={
    <InsightMarquee
     mode="insight-lock"
     segments={[
      { badge: "Growth", text: "Subscriber acquisition reveals which videos convert viewers into fans — double down on these formats.", badgeTone: "cyan" },
     ]}
    />
   }
  >
   <div className="h-[250px] px-3 pb-3 pt-1">
    <StableChartFrame minHeightClassName="min-h-[220px]">
     <BarChart data={cd} margin={{top:10,right:10,left:-20,bottom:40}}>
      <CartesianGrid strokeDasharray="3 3" vertical={false}/>
      <XAxis dataKey="name" tick={{fontSize:8,fontWeight:900}} interval={0} angle={-45} textAnchor="end" axisLine={{ stroke: '#000', strokeWidth: 3 }}/>
      <YAxis tick={{fontSize:10,fontWeight:900}} axisLine={{ stroke: '#000', strokeWidth: 3 }}/>
      <Tooltip content={<ChartTip/>}/>
      <Bar dataKey="value" fill="#00E5FF" radius={[4,4,0,0]}/>
     </BarChart>
    </StableChartFrame>
   </div>
  </SubToolboxChartModule>
 )
}

/* 4b. Top Performers Trio (spec) */
export const TopPerformersTrio: React.FC<GChartProps> = ({ data }) => {
 const buildTop = (metric: "revenue" | "watchHours" | "subscribersGained", label: string) => {
  const rows = [...data]
   .filter((r) => mv(r, metric) > 0)
   .sort((a, b) => mv(b, metric) - mv(a, metric))
   .slice(0, 10)
   .map((r) => ({ name: r.title.slice(0, 22), value: mv(r, metric) }))
  return { label, rows, top: rows[0] }
 }

 const trio = useMemo(
  () => [
   buildTop("revenue", "Revenue"),
   buildTop("watchHours", "Watch Hrs"),
   buildTop("subscribersGained", "Subscribers"),
  ],
  [data],
 )

 return (
  <UnifiedChartModule
   title="TOP PERFORMERS TRIO"
   subtitle="REVENUE • WATCH HOURS • SUBSCRIBERS"
   headerIcon={<CustomIcon name="analytics" size={18} />}
   headerColor="#FF7497"
   stats={[{ label: "VIDEOS", value: "10", tone: "white" }]}
  >
   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {trio.map((card, idx) => (
     <div key={card.label} className="border-[3px] border-black rounded-xl bg-white p-2 flex flex-col min-w-0">
      <div className="text-[11px] font-[1000] uppercase tracking-[0.12em] mb-1 whitespace-nowrap overflow-hidden text-ellipsis text-black">{card.label}</div>
      <div className="h-[200px] border-[2px] border-black rounded-lg bg-[#F4F4F5] p-1">
       <StableChartFrame minHeightClassName="min-h-[160px]">
        <PieChart>
         <Pie data={card.rows} dataKey="value" nameKey="name" innerRadius={40} outerRadius={72} stroke="#111827" strokeWidth={1} isAnimationActive animationDuration={700} animationBegin={idx * 120}>
          <Label value={card.label.toUpperCase()} position="center" style={{ fontSize: "10px", fontWeight: 1000, fill: "#000000" }} />
          {card.rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
         </Pie>
        </PieChart>
       </StableChartFrame>
      </div>
      <div className="mt-2 h-10 border-[2px] border-black rounded-md bg-[#00CCFF] text-black px-2 flex items-center justify-between min-w-0">
       <span className="text-[9px] font-[1000] uppercase tracking-[0.1em] shrink-0">#1</span>
       <span className="text-[10px] font-[1000] truncate ml-1">{card.top?.name || "N/A"}</span>
      </div>
     </div>
    ))}
   </div>
  </UnifiedChartModule>
 )
}
/* 5. Shorts Retention */
export const ShortsRetention: React.FC<GChartProps> = ({ data }) => {
 const [mode, setMode] = useState<"top-performing" | "most-recent">("top-performing")
 const [hoveredKey, setHoveredKey] = useState<string | null>(null)
 const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
 const [selectedCount, setSelectedCount] = useState(100)
 const [formatFilter, setFormatFilter] = useState<"All" | "Shorts" | "Long">("All")
 const cd = useMemo(() => {
  const isShortRow = (r: CanonicalVideoRow) =>
   String(r.format || "").toLowerCase().includes("short") ||
   (r.durationSeconds > 0 && r.durationSeconds <= 180)
  const isLongRow = (r: CanonicalVideoRow) => !isShortRow(r)
  const filteredByFormat = formatFilter === "Shorts"
   ? data.filter(isShortRow)
   : formatFilter === "Long"
   ? data.filter(isLongRow)
   : data
  const shorts = filteredByFormat
   .map((r) => {
    const views = mv(r, "views")
    const revenue = resolveMetricNumber(r, "revenue")
    const rpm = resolveMetricNumber(r, "rpm")
    const revenueFromRpm = rpm.value === null ? 0 : (rpm.value * Math.max(0, views)) / 1000
    return {
     title: r.title,
     dur: r.durationSeconds,
     avd: (retentionPct(r) / 100) * r.durationSeconds,
     views,
     estIncome: Math.max(revenue.value ?? 0, revenueFromRpm),
     revenueAvailable: revenue.value !== null || rpm.value !== null,
     uploadTs: new Date(String(r.uploadDate || "")).getTime() || 0,
    }
   })
   .filter((d) => d.dur > 0 && d.avd > 0)

  const ranked = mode === "most-recent"
   ? [...shorts].sort((a, b) => b.uploadTs - a.uploadTs)
   : [...shorts].sort((a, b) => b.views - a.views)

  const top100 = ranked.slice(0, selectedCount)
  const durationScale = buildAdaptiveZeroScale(top100.map((d) => d.dur), { fallbackMax: 180, hardMax: 180 })
  const avdScale = buildAdaptiveZeroScale(top100.map((d) => d.avd), { fallbackMax: 300 })
  const revenuePercentiles = buildTieAwarePercentiles(
   top100.map((d) => d.revenueAvailable ? d.estIncome : null),
  )
  const viewRadii = buildLogBubbleRadii(top100.map((d) => d.views), {
   minRadius: 3,
   maxRadius: 32,
  })

  // Exponential outlier formula: compress middle, push 7% extremes to palette edges
  const expPosition = (t: number | null): number | null => {
   if (t === null) return null
   const OUTLIER_THRESHOLD = 0.07
   if (t <= OUTLIER_THRESHOLD) return t / OUTLIER_THRESHOLD * 0.07
   if (t >= 1 - OUTLIER_THRESHOLD) return 0.93 + ((t - (1 - OUTLIER_THRESHOLD)) / OUTLIER_THRESHOLD) * 0.07
   // Exponential compression of middle 86%
   const mid = (t - OUTLIER_THRESHOLD) / (1 - 2 * OUTLIER_THRESHOLD)
   return 0.07 + Math.pow(mid, 1.6) * 0.86
  }

  const points = top100.map((d, index) => {
   const key = `${d.title}-${d.uploadTs}-${d.views}`
   const revenuePosition = revenuePercentiles[index]
   const scaledPos = expPosition(revenuePosition)
   return {
    ...d,
    key,
    radius: viewRadii[index],
    color: scaledPos === null
     ? MISSING_BUBBLE_COLOR
     : interpolateThreeStopColor(scaledPos, SHORTS_REVENUE_PALETTE),
   }
  })

  return {
   points: [...points].sort((a, b) => b.radius - a.radius),
   durationScale,
   avdScale,
  }
 }, [data, mode, selectedCount, formatFilter])

 const bubbleShape = (props: any) => {
  const { cx, cy, payload } = props
  const isHover = hoveredKey === payload.key
  const scale = isHover ? 1.25 : 1
  return (
   <circle
    cx={cx}
    cy={cy}
    r={payload.radius * scale}
    fill={payload.color}
    fillOpacity={isHover ? 0.72 : 0.55}
    stroke={payload.color}
    strokeWidth={isHover ? 2.5 : 1.5}
    strokeOpacity={1}
    style={{
      transformBox: "fill-box",
      transformOrigin: "center",
      shapeRendering: "geometricPrecision",
      mixBlendMode: "screen",
      transitionProperty: "r, fill-opacity, stroke-width",
      transitionDuration: isHover ? "750ms" : "350ms",
      transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      cursor: "pointer",
    }}
    onMouseEnter={() => setHoveredKey(payload.key)}
    onMouseLeave={() => setHoveredKey(null)}
   />
  )
 }

 return (
  <div className="bg-white border-[4px] border-black rounded-[8px] shadow-[8px_8px_0px_0px_black] overflow-hidden flex flex-col">
   <div className="border-b-[4px] border-black px-4 py-2 flex justify-between items-center gap-2 bg-[#CCFF00]">
    <div>
     <span className="font-[900] text-base uppercase tracking-tight">SHORTS RETENTION</span>
     <span className="block text-[9px] font-bold opacity-60 uppercase">AVD (s) × Duration</span>
    </div>
    <div className="flex items-center gap-2">
     <select
      value={mode}
      onChange={(e) => setMode(e.target.value as "top-performing" | "most-recent")}
      className="h-7 px-2 bg-white border-[2px] border-black rounded-[4px] text-[9px] font-black uppercase">
      <option value="top-performing">Top Performing</option>
      <option value="most-recent">Most Recent</option>
     </select>
     <select
      value={selectedCount}
      onChange={(e) => setSelectedCount(Number(e.target.value))}
      className="h-7 px-2 bg-white border-[2px] border-black rounded-[4px] text-[9px] font-black uppercase">
      {[25, 50, 75, 100, 200, 400].map((n) => (
       <option key={n} value={n}>TOP {n}</option>
      ))}
     </select>
     <select
      value={formatFilter}
      onChange={(e) => setFormatFilter(e.target.value as "All" | "Shorts" | "Long")}
      className="h-7 px-2 bg-white border-[2px] border-black rounded-[4px] text-[9px] font-black uppercase">
      {["All", "Shorts", "Long"].map((f) => (
       <option key={f} value={f}>{f.toUpperCase()}</option>
      ))}
     </select>
     <span className="text-[10px] font-black uppercase">TOP AVD (s) {cd.avdScale.domain[1]}</span>
     <span className="text-[10px] font-black">{cd.points.length} SHOWN</span>
    </div>
   </div>
   <div className="flex-1 p-2 min-h-[300px]">
    <ResponsiveContainer width="100%" height={280} minWidth={1} minHeight={1}>
     <ScatterChart
      margin={{top:10,right:10,bottom:10,left:-10}}
      onMouseMove={(state: any) => {
       if (typeof state?.chartX === "number" && typeof state?.chartY === "number") {
        setMousePos({ x: state.chartX, y: state.chartY })
       }
      }}
      onMouseLeave={() => setMousePos(null)}>
      <CartesianGrid stroke="rgba(107,114,128,0.28)" strokeDasharray="4 4"/>
      <XAxis
       type="number"
       dataKey="dur"
       name="Duration (s)"
       domain={cd.durationScale.domain}
       ticks={cd.durationScale.ticks}
       tickFormatter={(value) => `${value}s`}
       tick={{fontWeight:900,fontSize:10}}
      />
      <YAxis
       type="number"
       dataKey="avd"
       name="AVD (s)"
       domain={cd.avdScale.domain}
       ticks={cd.avdScale.ticks}
       tickFormatter={(value) => value === 0 ? "" : `${value}s`}
       tick={{fontWeight:900,fontSize:10}}
      />
      <Tooltip
       content={<ChartTip/>}
       isAnimationActive={false}
       cursor={false}
      />
      <Scatter data={cd.points} shape={bubbleShape} name="Income Gradient"/>
      <Customized component={({ offset, width }: any) => {
       if (!mousePos || !offset) return null
       const left = offset.left
       const top = offset.top
       const right = offset.left + offset.width
       const bottom = offset.top + offset.height
       if (mousePos.x < left || mousePos.x > right || mousePos.y < top || mousePos.y > bottom) return null
       const snappedX = Math.round(mousePos.x) + 0.5
       const snappedY = Math.round(mousePos.y) + 0.5
       return (
        <g pointerEvents="none">
         <line
          x1={left}
          y1={snappedY}
          x2={right}
          y2={snappedY}
          stroke="rgba(255, 51, 153, 0.28)"
          strokeWidth={1}
          strokeDasharray="4 4"
          shapeRendering="crispEdges"
         />
         <line
          x1={snappedX}
          y1={top}
          x2={snappedX}
          y2={bottom}
          stroke="rgba(255, 51, 153, 0.28)"
          strokeWidth={1}
          strokeDasharray="4 4"
          shapeRendering="crispEdges"
         />
        </g>
       )
      }} />
     </ScatterChart>
    </ResponsiveContainer>
   </div>
   <div className="px-5 pb-3 text-[10px] font-black uppercase opacity-70">Bubble size = Views · Color = Estimated Income (Blue → Green)</div>
  </div>
 )
}

/* 5b. Shorts Retention Widget Module */
const SHORTS_RETENTION_COUNT_VALUES = [10, 25, 50, 75, 100, 150, 200]
type ShortsFormatFilter = "all" | "shorts" | "longform"

export const ShortsRetentionWidgetModule: React.FC<GChartProps> = ({ data }) => {
 const [mode, setMode] = useState<"top-performing" | "most-recent">("top-performing")
 const [sortMetric, setSortMetric] = useState<"avd" | "estIncome" | "dur" | "views">("avd")
 const [modeMenuOpen, setModeMenuOpen] = useState(false)
 const [activeKey, setActiveKey] = useState<string | null>(null)
 const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
 const [selectedCount, setSelectedCount] = useState(100)
 const rafMouseRef = useRef<number | null>(null)
 const pendingMouseRef = useRef<{ x: number; y: number } | null>(null)
 const cycleCount = (dir: 1 | -1) => {
  const idx = SHORTS_RETENTION_COUNT_VALUES.indexOf(selectedCount)
  const nextIdx = (idx + dir + SHORTS_RETENTION_COUNT_VALUES.length) % SHORTS_RETENTION_COUNT_VALUES.length
  setSelectedCount(SHORTS_RETENTION_COUNT_VALUES[nextIdx])
 }

 const cd = useMemo(() => {
  const isShortRow = (r: CanonicalVideoRow) =>
   String(r.format || "").toLowerCase().includes("short") ||
   (r.durationSeconds > 0 && r.durationSeconds <= 180)
  const baseRows = data.filter(isShortRow)
  const mapped = baseRows
   .map((r) => {
    const views = mv(r, "views")
    const revenue = resolveMetricNumber(r, "revenue")
    const rpm = resolveMetricNumber(r, "rpm")
    const revenueFromRpm = rpm.value === null ? 0 : (rpm.value * Math.max(0, views)) / 1000
    return {
     title: r.title,
     dur: r.durationSeconds,
     avd: (retentionPct(r) / 100) * r.durationSeconds,
     views,
     estIncome: Math.max(revenue.value ?? 0, revenueFromRpm),
     revenueAvailable: revenue.value !== null || rpm.value !== null,
     uploadTs: new Date(String(r.uploadDate || "")).getTime() || 0,
    }
   })
   .filter((d) => d.dur > 0 && d.avd > 0)

  const ranked = mode === "most-recent"
   ? [...mapped].sort((a, b) => b.uploadTs - a.uploadTs)
   : [...mapped].sort((a, b) => b[sortMetric] - a[sortMetric])

  const top = ranked.slice(0, selectedCount)
  const durationScale = buildAdaptiveZeroScale(top.map((d) => d.dur), { fallbackMax: 180, hardMax: 180 })
  const avdScale = buildAdaptiveZeroScale(top.map((d) => d.avd), { fallbackMax: 300 })
  const revenuePercentiles = buildTieAwarePercentiles(
   top.map((d) => d.revenueAvailable ? d.estIncome : null),
  )
  const viewRadii = buildLinearAreaBubbleRadii(top.map((d) => d.views), { minRadius: 4, maxRadius: 36 })

  // Exponential outlier: top/bottom 7% occupy the palette edges alone
  const expPos = (t: number | null): number | null => {
   if (t === null) return null
   const THRESH = 0.07
   if (t <= THRESH) return (t / THRESH) * THRESH
   if (t >= 1 - THRESH) return 1 - THRESH + ((t - (1 - THRESH)) / THRESH) * THRESH
   const mid = (t - THRESH) / (1 - 2 * THRESH)
   return THRESH + Math.pow(mid, 1.6) * (1 - 2 * THRESH)
  }

  const points = top.map((d, index) => {
   const key = `${d.title}-${d.uploadTs}-${d.views}`
   const scaledPos = expPos(revenuePercentiles[index])
   return {
    ...d,
    key,
    radius: viewRadii[index],
    color: scaledPos === null
     ? MISSING_BUBBLE_COLOR
     : interpolateThreeStopColor(scaledPos, SHORTS_REVENUE_PALETTE),
   }
  })

  return {
   points: [...points].sort((a, b) => b.radius - a.radius),
   durationScale,
   avdScale,
  }
 }, [data, mode, sortMetric, selectedCount])

 useEffect(() => {
  if (cd.points.length === 0) { setActiveKey(null); return }
  if (!activeKey || !cd.points.some((p) => p.key === activeKey)) setActiveKey(cd.points[0].key)
 }, [cd.points, activeKey])

 const activePoint = useMemo(
  () => cd.points.find((p) => p.key === activeKey) || cd.points[0] || null,
  [cd.points, activeKey],
 )

 const shortsInsight = useMemo(() => {
  if (cd.points.length === 0) return "No retention data yet. Sync to unlock insights."
  const best = [...cd.points].sort((a, b) => b.avd - a.avd)[0]
  const longHold = cd.points.filter((p) => p.dur >= 90 && p.avd >= (55/100*p.dur)).length
  return `Strongest hold: ${best.avd.toFixed(1)}s at ${Math.round(best.dur)}s length. ${longHold} videos sustain 55%+ attention past 90s.`
 }, [cd.points])

 const generalInsight = "Bubble = views · color = revenue (blue→green) · position = length vs avg view duration. Outliers (7%) lock to palette edges."

 const bubbleShape = (props: any) => {
  const { cx, cy, payload } = props
  const isActive = activeKey === payload.key
  const scale = isActive ? 1.25 : 1
  return (
   <circle
    cx={cx}
    cy={cy}
    r={payload.radius * scale}
    fill={payload.color}
    fillOpacity={isActive ? 0.72 : 0.55}
    stroke={payload.color}
    strokeWidth={isActive ? 2.5 : 1.5}
    strokeOpacity={1}
    onMouseEnter={() => setActiveKey(payload.key)}
    style={{
      shapeRendering: "geometricPrecision",
      mixBlendMode: "normal" as any,
      transitionProperty: "r, stroke-width, fill-opacity",
      transitionDuration: isActive ? "750ms" : "350ms",
      transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      cursor: "pointer",
    }}
   />
  )
 }

 return (
  <SubToolboxChartModule
   header={{
    ...subToolboxChartPresets.shortsRetentionPreset.header,
    icon: <CustomIcon name="!!!A:B-TESTING" size={18} />,
   }}
   theme={{
    headerBandBg: "#FF82B0",
    iconBlockBg: "#26C7EC",
    shadowColor: "rgba(255,130,176,0.45)",
   }}
   layout={{ moduleMinHeight: "420px", moduleWidth: "100%" }}
   controlBox={{
    count: cd.points.length,
    countUnit: "VIDEOS",
    onCountPrev: () => cycleCount(-1),
    onCountNext: () => cycleCount(1),
    dropdown: {
      value: mode,
      isOpen: modeMenuOpen,
      onToggle: () => setModeMenuOpen((prev) => !prev),
      onSelect: (value) => {
        setMode(value as "top-performing" | "most-recent")
        setModeMenuOpen(false)
      },
      options: [
        { value: "top-performing", label: sortMetric === "avd" ? "BEST BY AVD" : sortMetric === "estIncome" ? "BEST BY REVENUE" : sortMetric === "dur" ? "BEST BY LENGTH" : "BEST BY VIEWS" },
        { value: "most-recent", label: "LATEST PUBLISHED" },
      ],
    },
   }}
   activeContext={{
     title: activePoint?.title?.toUpperCase() || "NO VIDEO SELECTED",
     stats: [
      { label: "AVD", value: activePoint ? `${activePoint.avd.toFixed(1)}s` : "0s", tone: "lime", onClick: () => setSortMetric("avd"), isActive: sortMetric === "avd" },
      { label: "REV", value: `$${activePoint ? activePoint.estIncome.toFixed(2) : "0.00"}`, tone: "cyan", onClick: () => setSortMetric("estIncome"), isActive: sortMetric === "estIncome" },
      { label: "LENGTH", value: `${activePoint ? Math.round(activePoint.dur) : 0}s`, tone: "yellow", onClick: () => setSortMetric("dur"), isActive: sortMetric === "dur" },
      { label: "VIEWS", value: activePoint ? Math.round(activePoint.views).toLocaleString() : "0", tone: "white", onClick: () => setSortMetric("views"), isActive: sortMetric === "views" },
     ],
   }}
   metricBadges={[
    { label: "AVD", tone: "lime" },
    { label: "REV", tone: "cyan" },
    { label: "VIEWS", tone: "white" },
   ]}
   footer={
    <InsightMarquee
     mode="insight-lock"
     segments={[
      { badge: "Chart Insight", text: generalInsight, badgeTone: "cyan" },
      { badge: "Personal Insight", text: shortsInsight, badgeTone: "lime" },
     ]}
    />
   }
  >
   <div className="min-h-[400px] w-full border-[0px] border-black rounded-none bg-white p-0 overflow-hidden flex flex-col">
    <div className="h-[400px] relative">
     <StableChartFrame minHeightClassName="min-h-[400px]">
      <ScatterChart
       className="[&_svg]:outline-none [&_*:focus]:outline-none [&_*:focus-visible]:outline-none"
       margin={{ top: 20, right: 30, bottom: 28, left: 10 }}
       onMouseMove={(state: any) => {
        if (typeof state?.chartX !== "number" || typeof state?.chartY !== "number") return
        pendingMouseRef.current = { x: state.chartX, y: state.chartY }
        if (rafMouseRef.current !== null) return
        rafMouseRef.current = requestAnimationFrame(() => {
         rafMouseRef.current = null
         if (pendingMouseRef.current) setMousePos(pendingMouseRef.current)
        })
       }}
       onMouseLeave={() => {
        setMousePos(null)
        pendingMouseRef.current = null
        if (rafMouseRef.current !== null) { cancelAnimationFrame(rafMouseRef.current); rafMouseRef.current = null }
       }}>
       <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={true} />
       <XAxis
        type="number"
        dataKey="dur"
        domain={cd.durationScale.domain}
        ticks={cd.durationScale.ticks}
        tickFormatter={(value) => `${value}s`}
        axisLine={{ stroke: '#000', strokeWidth: 3 }}
        tickLine={false}
        tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }}
       />
       <YAxis
        type="number"
        dataKey="avd"
        domain={cd.avdScale.domain}
        ticks={cd.avdScale.ticks}
        axisLine={{ stroke: '#000', strokeWidth: 3 }}
        tickLine={false}
        tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }}
        tickFormatter={(value) => value === 0 ? '' : `${value}s`}
        label={{ value: "AVD (SECONDS)", angle: -90, position: "insideLeft", offset: 15, style: { fontWeight: 1000, fontSize: 14, fill: '#000', letterSpacing: '0.1em', textAnchor: 'middle' } }}
       />
       <Scatter data={cd.points} shape={bubbleShape} name="Income Gradient" />
       <Customized component={({ offset, width }: any) => {
         if (!mousePos || !offset) return null
         const left = offset.left; const top = offset.top
         const right = offset.left + offset.width; const bottom = offset.top + offset.height
         if (mousePos.x < left || mousePos.x > right || mousePos.y < top || mousePos.y > bottom) return null
         const snappedX = Math.round(mousePos.x) + 0.5; const snappedY = Math.round(mousePos.y) + 0.5
         return (
           <g pointerEvents="none">
            <line x1={left} y1={top} x2={left} y2={0} stroke="#000" strokeWidth={3} shapeRendering="crispEdges" />
            <line x1={right} y1={bottom} x2={width} y2={bottom} stroke="#000" strokeWidth={3} shapeRendering="crispEdges" />
            <line x1={left} y1={snappedY} x2={right} y2={snappedY} stroke="rgba(0,0,0,0.15)" strokeWidth={1} shapeRendering="crispEdges" />
            <line x1={snappedX} y1={top} x2={snappedX} y2={bottom} stroke="rgba(0,0,0,0.15)" strokeWidth={1} shapeRendering="crispEdges" />
           </g>
         )
        }} />
      </ScatterChart>
     </StableChartFrame>
     <div className="absolute bottom-[0px] left-[14px] right-[14px] grid grid-cols-3 items-center pointer-events-none">
      <div className="flex items-center gap-2 justify-self-end">
        <span className="text-[14px] font-[1000] uppercase tracking-[0.05em] text-black">Revenue</span>
        <div className="w-[155px] h-6 border-[2px] border-black rounded-[2px] bg-gradient-to-r from-[#24BCFF] via-[#45DDB0] to-[#66FF8A]" />
      </div>
      <div className="justify-self-center flex items-center gap-3">
        <span className="text-black font-[1000] text-[16px] leading-none">◀</span>
        <span className="uppercase tracking-[0.1em] text-black" style={{ fontWeight: 1000, fontSize: 14 }}>Duration</span>
        <span className="text-black font-[1000] text-[16px] leading-none">▶</span>
      </div>
      <div className="flex items-center gap-2 justify-self-start">
        <div className="flex items-center justify-between w-[115px]">
          <span className="w-2 aspect-square shrink-0 rounded-full bg-[#24BCFF] opacity-[0.75]" />
          <span className="w-3 aspect-square shrink-0 rounded-full bg-[#2FC8EF] opacity-[0.75]" />
          <span className="w-4 aspect-square shrink-0 rounded-full bg-[#3AD4DF] opacity-[0.75]" />
          <span className="w-5 aspect-square shrink-0 rounded-full bg-[#45DDB0] opacity-[0.75]" />
          <span className="w-6 aspect-square shrink-0 rounded-full bg-[#66FF8A] opacity-[0.75]" />
        </div>
        <span className="text-[14px] font-[1000] uppercase tracking-[0.05em] text-black">Views</span>
      </div>
     </div>
    </div>
   </div>
  </SubToolboxChartModule>
 )
}

/* 5c. Algorithm Trigger Module (CTR × Impressions - SubToolbox) */
const ALGORITHM_TRIGGER_COUNT_VALUES = [25, 50, 75, 100]

export const AlgorithmTriggerModule: React.FC<GChartProps> = ({ data }) => {
 const [mode, setMode] = useState<"top-performing" | "most-recent">("top-performing")
 const [sortMetric, setSortMetric] = useState<"ctr" | "impressions" | "views">("impressions")
 const [modeMenuOpen, setModeMenuOpen] = useState(false)
 const [hoveredKey, setHoveredKey] = useState<string | null>(null)
 const [selectedCount, setSelectedCount] = useState(50)
 const cycleCount = (dir: 1 | -1) => {
  const idx = ALGORITHM_TRIGGER_COUNT_VALUES.indexOf(selectedCount)
  const nextIdx = (idx + dir + ALGORITHM_TRIGGER_COUNT_VALUES.length) % ALGORITHM_TRIGGER_COUNT_VALUES.length
  setSelectedCount(ALGORITHM_TRIGGER_COUNT_VALUES[nextIdx])
 }

 const cd = useMemo(() => {
  const all = data
   .filter((r) => r.format !== "shorts")
   .map((r) => ({
    title: r.title,
    ctrRaw: +ctrPct(r).toFixed(2),
    impressions: Math.max(0, mv(r, "impressions")),
    views: mv(r, "views"),
    format: r.format,
    uploadTs: new Date(String(r.uploadDate || "")).getTime() || 0,
   }))
   .map((d) => {
    const derivedCtr =
     d.ctrRaw > 0
      ? d.ctrRaw
      : d.impressions > 0 && d.views > 0
       ? (d.views / d.impressions) * 100
       : 0
    return {
     ...d,
     ctr: +Math.max(0, Math.min(25, derivedCtr)).toFixed(2),
    }
   })
   .filter((d) => d.impressions > 0 && d.views > 0)

  const ranked = mode === "most-recent"
   ? [...all].sort((a, b) => b.uploadTs - a.uploadTs)
   : [...all].sort((a, b) => b[sortMetric] - a[sortMetric])

  const top50 = ranked.slice(0, selectedCount)
  const maxImp = Math.max(1, ...top50.map((d) => d.impressions))
  const minImp = Math.min(...top50.map((d) => d.impressions))
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  return top50.map((d) => {
   const key = `${d.title}-${d.uploadTs}-${d.impressions}`
   const impT = maxImp > minImp ? (d.impressions - minImp) / (maxImp - minImp) : 0.5
   const radius = lerp(4, 22, Math.pow(impT, 0.5))
   const color = d.format === "shorts" ? "#00CCFF" : "#FF3399"
   return { ...d, key, radius, color }
  })
 }, [data, mode, sortMetric, selectedCount])

 const bubbleShape = (props: any) => {
  const { cx, cy, payload } = props
  const isActive = hoveredKey === payload.key
  const scale = isActive ? 1.25 : 1
  return (
   <circle
    cx={cx}
    cy={cy}
    r={payload.radius * scale}
    fill={payload.color}
    fillOpacity={0.75}
    stroke={payload.color}
    strokeWidth={isActive ? 2 : 0}
    onMouseEnter={() => setHoveredKey(payload.key)}
    style={{
     shapeRendering: "geometricPrecision",
     transitionProperty: "r, stroke-width, fill-opacity",
     transitionDuration: isActive ? "750ms" : "350ms",
     transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
     cursor: "pointer",
    }}
   />
  )
 }

 const activePoint = cd.find((p) => p.key === hoveredKey) || cd[0]

 return (
  <SubToolboxChartModule
   header={{
    title: "ALGORITHM TRIGGER",
    subtitle: `TOP ${selectedCount} ${mode === "most-recent" ? "RECENT" : "PERFORMING"} BY ${sortMetric.toUpperCase()}`,
    icon: <CustomIcon name="analytics" size={18} />,
    headerStyle: "subtoolbox",
   }}
   theme={{
    headerBandBg: "#B14AED",
    iconBlockBg: "#CCFF00",
    shadowColor: "rgba(177,74,237,0.45)",
   }}
   layout={{ moduleMinHeight: "420px", moduleWidth: "100%" }}
   controlBox={{
    count: cd.length,
    countUnit: "VIDEOS",
    onCountPrev: () => cycleCount(-1),
    onCountNext: () => cycleCount(1),
    dropdown: {
     value: mode,
     isOpen: modeMenuOpen,
     onToggle: () => setModeMenuOpen((prev) => !prev),
     onSelect: (value) => {
      setMode(value as any)
      setModeMenuOpen(false)
     },
     options: [
      { value: "top-performing", label: "BEST" },
      { value: "most-recent", label: "LAST" },
     ],
    },
   }}
   activeContext={{
    title: activePoint?.title?.toUpperCase() || "SELECT DATA POINT",
    stats: [
     { label: "CTR", value: `${activePoint?.ctr ?? 0}%`, tone: "lime", onClick: () => setSortMetric("ctr"), isActive: sortMetric === "ctr" },
     { label: "IMPRSNS", value: activePoint ? (activePoint.impressions >= 1000000 ? `${(activePoint.impressions / 1000000).toFixed(1)}M` : activePoint.impressions >= 1000 ? `${(activePoint.impressions / 1000).toFixed(0)}K` : String(activePoint.impressions)) : "0", tone: "purple", onClick: () => setSortMetric("impressions"), isActive: sortMetric === "impressions" },
     { label: "VIEWS", value: activePoint ? Math.round(activePoint.views).toLocaleString() : "0", tone: "white", onClick: () => setSortMetric("views"), isActive: sortMetric === "views" },
    ],
   }}
   metricBadges={[
    { label: "CTR%", tone: "lime" },
    { label: "IMP", tone: "purple" },
    { label: "VIEWS", tone: "white" },
   ]}
   footer={
    <InsightMarquee
     mode="insight-lock"
     segments={[
      { badge: "Chart Insight", text: "Algorithm Trigger maps CTR against total impressions to reveal which thumbnails and titles earn the most algorithmic distribution.", badgeTone: "cyan" },
      { badge: "Personal Insight", text: cd.length > 0 ? `Your top-impression video hit ${cd[0]?.impressions >= 1000000 ? `${(cd[0].impressions / 1000000).toFixed(1)}M` : `${(cd[0].impressions / 1000).toFixed(0)}K`} impressions at ${cd[0]?.ctr}% CTR — that's your packaging blueprint.` : "Sync data to unlock trigger insights.", badgeTone: "lime" },
     ]}
    />
   }
  >
   <div className="min-h-[400px] w-full border-[0px] border-black rounded-none bg-white p-0 overflow-hidden flex flex-col">
    <div className="h-[400px] relative">
     <StableChartFrame minHeightClassName="min-h-[400px]">
       <ScatterChart
        className="[&_svg]:outline-none [&_*:focus]:outline-none [&_*:focus-visible]:outline-none"
        margin={{ top: 20, right: 30, bottom: 28, left: 10 }}
        onMouseLeave={() => setHoveredKey(null)}
       >
        <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={true} />
        <XAxis
         type="number"
         dataKey="ctr"
         name="CTR %"
         domain={[0, 25]}
         tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }}
         axisLine={{ stroke: '#000', strokeWidth: 3 }}
         tickLine={false}
         tickFormatter={(v) => `${v}%`}
        />
        <YAxis
         type="number"
         dataKey="impressions"
         name="Impressions"
         tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }}
         axisLine={{ stroke: '#000', strokeWidth: 3 }}
         tickLine={false}
         tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
         label={{
          value: 'IMPRESSIONS',
          angle: -90,
          position: 'insideLeft',
          offset: 15,
          style: { fontWeight: 1000, fontSize: 14, fill: '#000', letterSpacing: '0.1em', textAnchor: 'middle' },
         }}
        />
        <Tooltip content={<ChartTip />} />
        <Scatter data={cd} shape={bubbleShape} />
        <Customized component={({ offset, width }: any) => {
         if (!offset) return null
         const left = offset.left
         const right = offset.left + offset.width
         const top = offset.top
         const bottom = offset.top + offset.height
         return (
          <g pointerEvents="none">
           <line x1={left} y1={top} x2={left} y2={0} stroke="#000" strokeWidth={3} shapeRendering="crispEdges" />
           <line x1={right} y1={bottom} x2={width} y2={bottom} stroke="#000" strokeWidth={3} shapeRendering="crispEdges" />
          </g>
         )
        }} />
       </ScatterChart>
     </StableChartFrame>
     <div className="absolute bottom-[0px] left-[14px] right-[14px] grid grid-cols-3 items-center pointer-events-none">
      <div className="flex items-center gap-2 justify-self-end">
       <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded-full bg-[#FF3399] border-[2px] border-black" />
        <span className="text-[14px] font-[1000] uppercase tracking-[0.05em] text-black">Long</span>
       </div>
      </div>
      <div className="justify-self-center flex items-center gap-3">
       <span className="text-black font-[1000] text-[16px] leading-none">◀</span>
       <span className="uppercase tracking-[0.1em] text-black" style={{ fontWeight: 1000, fontSize: 14, letterSpacing: "0.1em" }}>
        Click-Through Rate
       </span>
       <span className="text-black font-[1000] text-[16px] leading-none">▶</span>
      </div>
      <div />
     </div>
    </div>
   </div>
  </SubToolboxChartModule>
 )
}

/* 5d. Engagement Lines Module (Comments/Likes/Shares/Subs - SubToolbox) */
const ENGAGEMENT_METRICS = [
 { key: "comments", label: "COMMENTS", color: VT_VISUAL_METRIC_COLORS.comments, tone: "cyan" as const },
 { key: "subscribersGained", label: "SUBSCRIBERS", color: VT_VISUAL_METRIC_COLORS.subscribers, tone: "lime" as const },
 { key: "shares", label: "SHARES", color: VT_VISUAL_METRIC_COLORS.shares, tone: "yellow" as const },
 { key: "likes", label: "LIKES", color: VT_VISUAL_METRIC_COLORS.likes, tone: "pink" as const },
] as const

const ENGAGEMENT_PULSE_COUNT_OPTIONS = [10, 15, 20, 25, 50]

export const EngagementLinesModule: React.FC<GChartProps> = ({ data }) => {
 const [sortMetric, setSortMetric] = useState<string>("likes")
 const [mode, setMode] = useState<"top-performing" | "most-recent">("most-recent")
 const [format, setFormat] = useState<"shorts" | "longform" | "combined">("combined")
 const [selectedCount, setSelectedCount] = useState(25)
 const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
 const [animKey, setAnimKey] = useState(0)
 const [rankMenuOpen, setRankMenuOpen] = useState(false)

 const cycleCount = (dir: 1 | -1) => {
  const idx = ENGAGEMENT_PULSE_COUNT_OPTIONS.indexOf(selectedCount)
  const nextIdx = (idx + dir + ENGAGEMENT_PULSE_COUNT_OPTIONS.length) % ENGAGEMENT_PULSE_COUNT_OPTIONS.length
  setSelectedCount(ENGAGEMENT_PULSE_COUNT_OPTIONS[nextIdx])
  setAnimKey((k) => k + 1)
 }

 const cd = useMemo(() => {
  const filteredByFormat = data.filter((r) => {
   if (format === "shorts") return r.format === "shorts"
   if (format === "longform") return r.format !== "shorts"
   return true
  })
  const mapped = filteredByFormat.map((r) => ({
   title: r.title,
   comments: mv(r, "comments"),
   likes: mv(r, "likes"),
   shares: mv(r, "shares"),
   subscribersGained: mv(r, "subscribersGained"),
   uploadTs: new Date(String(r.uploadDate || "")).getTime() || 0,
  }))

  const sortedByMetric = (rows: typeof mapped) =>
   [...rows].sort((a, b) => (b as any)[sortMetric] - (a as any)[sortMetric])

  const sorted =
   mode === "most-recent"
    ? sortedByMetric([...mapped].sort((a, b) => b.uploadTs - a.uploadTs).slice(0, selectedCount))
    : sortedByMetric(mapped)

  return sorted.slice(0, selectedCount).map((d, i) => ({
   ...d,
   idx: i,
   name: String(i + 1),
  }))
 }, [data, sortMetric, mode, format, selectedCount])

 // Fixed dual-axis: LEFT = comments/shares/subs, RIGHT = likes (always)
 const { leftMax, rightMax } = useMemo(() => {
  const leftKeys = ["comments", "shares", "subscribersGained"]
  const leftVals = cd.flatMap((d) => leftKeys.map((k) => (d as any)[k] as number))
  const rightVals = cd.map((d) => d.likes)
  const ceilNice = (v: number) => {
   if (v <= 0) return 10
   const mag = Math.pow(10, Math.floor(Math.log10(v)))
   return Math.ceil(v / mag) * mag || 10
  }
  return {
   leftMax: ceilNice(Math.max(1, ...leftVals)),
   rightMax: ceilNice(Math.max(1, ...rightVals)),
  }
 }, [cd])

 const handleSortChange = (key: string) => {
  setSortMetric(key)
  setAnimKey((k) => k + 1)
 }

 const handleModeChange = (value: string) => {
  setMode(value as any)
  setAnimKey((k) => k + 1)
 }

 const cycleFormat = () => {
  setFormat((prev) => (prev === "combined" ? "shorts" : prev === "shorts" ? "longform" : "combined"))
 }

 const toggleMode = () => {
  handleModeChange(mode === "most-recent" ? "top-performing" : "most-recent")
 }

 const sortLabel = ENGAGEMENT_METRICS.find((m) => m.key === sortMetric)?.label || "LIKES"
 const modeLabel = mode === "most-recent" ? "NEWEST" : "TOP PERFORMING"
 const formatLabel = format === "shorts" ? "SHORTS" : format === "longform" ? "LONGFORMAT" : "VIDEOS"
 const activeRow = hoveredIdx !== null ? cd[hoveredIdx] : cd[0]
 const renderOrder = useMemo(() => {
  const preferredOrder = ["comments", "subscribersGained", "shares", "likes"]
  const remaining = preferredOrder.filter((key) => key !== sortMetric)
  return [sortMetric, ...remaining]
 }, [sortMetric])

 const animationMetaByMetric = useMemo(() => {
  const map: Record<string, { beginMs: number; durationMs: number; phase: "primary" | "secondary" }> = {}
  renderOrder.forEach((metricKey, idx) => {
   if (idx === 0) {
    map[metricKey] = { beginMs: 0, durationMs: 3000, phase: "primary" }
    return
   }
   map[metricKey] = {
    beginMs: 3000 + (idx - 1) * 1000,
    durationMs: 1000,
    phase: "secondary",
   }
  })
  return map
 }, [renderOrder])

 return (
  <SubToolboxChartModule
   header={{
    title: "ENGAGEMENT PULSE",
    subtitle: `TOP ${cd.length} ${mode === "most-recent" ? "RECENT" : "PERFORMING"} BY ${sortLabel}`,
    icon: <CustomIcon name="analytics" size={18} />,
    headerStyle: "subtoolbox",
   }}
   theme={{
    headerBandBg: "#FFB158",
    iconBlockBg: "#FF7497",
    shadowColor: "rgba(255,177,88,0.45)",
   }}
   layout={{ moduleMinHeight: "420px", moduleWidth: "100%" }}
   activeContext={{
    title: activeRow?.title?.toUpperCase().slice(0, 40) || "SELECT VIDEO",
    stats: [
     { label: "LIKES", value: String(activeRow?.likes ?? 0), tone: "pink", onClick: () => handleSortChange("likes"), isActive: sortMetric === "likes" },
     { label: "COMMENTS", value: String(activeRow?.comments ?? 0), tone: "cyan", onClick: () => handleSortChange("comments"), isActive: sortMetric === "comments" },
     { label: "SHARES", value: String(activeRow?.shares ?? 0), tone: "yellow", onClick: () => handleSortChange("shares"), isActive: sortMetric === "shares" },
     { label: "SUBSCRIBERS", value: String(activeRow?.subscribersGained ?? 0), tone: "lime", onClick: () => handleSortChange("subscribersGained"), isActive: sortMetric === "subscribersGained" },
    ],
   }}
   controllerRows={[{
    type: "custom",
    render: () => (
     <div className="grid h-full w-full grid-cols-2 grid-rows-[1fr_1fr_28px] bg-white">
      <button
       type="button"
       aria-label="Show fewer videos"
       onClick={() => cycleCount(-1)}
       className="row-span-2 flex min-w-0 items-center border-0 border-r-[4px] border-black bg-[#33FF99] px-1"
      >
       <span className="text-[20px] font-black leading-none">◀</span>
       <span className="min-w-0 flex-1 text-center text-[38px] font-[1000] leading-none">{selectedCount}</span>
      </button>
      <button
       type="button"
       aria-label="Change ranking scope"
       onClick={toggleMode}
       className="flex min-w-0 items-center border-0 border-b-[4px] border-black bg-[#FF7497] px-1"
      >
       <span className="min-w-0 flex-1 truncate text-[11px] font-black uppercase">{modeLabel}</span>
       <span className="text-[16px] font-black leading-none">▶</span>
      </button>
      <button
       type="button"
       aria-label="Change video format"
       onClick={cycleFormat}
       className="flex min-w-0 items-center border-0 bg-[#B14AED] px-1"
      >
       <span className="min-w-0 flex-1 truncate text-[11px] font-black uppercase">{formatLabel}</span>
       <span className="text-[16px] font-black leading-none">▶</span>
      </button>
      <label className="col-span-2 flex min-w-0 items-stretch border-t-[4px] border-black bg-black">
       <span className="flex w-[42px] items-center justify-center text-[12px] font-black uppercase text-[#B14AED]">BY</span>
       <select
        aria-label="Rank engagement pulse by metric"
        value={sortMetric}
        onChange={(event) => handleSortChange(event.target.value)}
        className="min-w-0 flex-1 appearance-none border-0 border-l-[4px] border-black bg-[#B14AED] px-2 text-center text-[12px] font-black uppercase text-black"
       >
        {ENGAGEMENT_METRICS.map((metric) => (
         <option key={metric.key} value={metric.key}>{metric.label}</option>
        ))}
       </select>
      </label>
     </div>
    ),
   }]}
   footerBorderless
   footer={
    <div className="bg-black text-white">
     <div className="flex items-stretch gap-3 px-4 py-2">
      <div className="flex flex-1 items-center justify-between gap-4">
       <EngagementKeyItem label="LIKES" tone="#FF7497" />
       <EngagementKeyItem label="COMMENTS" tone="#00E5FF" />
      </div>
      <div className="flex flex-1 items-center justify-between gap-4">
       <EngagementKeyItem label="SHARES" tone="#FFE357" />
       <EngagementKeyItem label="SUBSCRIBERS" tone="#CCFF00" />
      </div>
     </div>
     <InsightMarquee
      mode="insight-lock"
      segments={[
       { badge: "Chart Insight", text: "Engagement Pulse reveals how each video drives different interaction types — spot which content triggers comments vs. passive likes.", badgeTone: "cyan" },
       { badge: "Personal Insight", text: cd.length > 0 ? `Sorted by ${sortLabel.toLowerCase()}: your #1 video pulled ${(activeRow as any)?.[sortMetric] ?? 0} ${sortLabel.toLowerCase()}. Switch metric chips to rearrange the full ranking.` : "Sync data to unlock engagement insights.", badgeTone: "lime" },
      ]}
     />
    </div>
   }
  >
   <div className="min-h-[400px] w-full bg-white p-0 overflow-hidden flex flex-col">
    <div className="h-[400px] relative">
     <StableChartFrame minHeightClassName="min-h-[400px]">
       <LineChart
        data={cd}
        margin={{ top: 20, right: 60, bottom: 20, left: 20 }}
        onMouseMove={(state: any) => {
         if (state?.activeTooltipIndex !== undefined) setHoveredIdx(state.activeTooltipIndex)
        }}
        onMouseLeave={() => setHoveredIdx(null)}
       >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
        <XAxis
         dataKey="name"
         tick={false}
         axisLine={{ stroke: '#000', strokeWidth: 3 }}
         tickLine={false}
         height={8}
        />
        <YAxis
         yAxisId="left"
         domain={[0, leftMax]}
         tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }}
         axisLine={{ stroke: '#000', strokeWidth: 3 }}
         tickLine={false}
         label={{
          content: (props: any) => <EngagementLeftAxisLabel {...props} />,
         }}
        />
        <YAxis
         yAxisId="right"
         orientation="right"
         domain={[0, rightMax]}
         tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }}
         axisLine={{ stroke: '#000', strokeWidth: 3 }}
         tickLine={false}
         label={{
          content: (props: any) => <EngagementRightAxisLabel {...props} />,
         }}
        />
        <g key={animKey}>
         {ENGAGEMENT_METRICS.map((m, i) => (
          <Line
           key={`${m.key}-${animKey}`}
           yAxisId={m.key === "likes" ? "right" : "left"}
           type="monotone"
           dataKey={m.key}
           name={m.label}
           stroke={m.color}
           strokeWidth={m.key === sortMetric ? 5 : 3}
           dot={m.key === sortMetric
            ? (props: any) => <EngagementSelectedDot {...props} stroke={m.color} />
            : false}
           activeDot={(props: any) => (
            <EngagementHoverDot {...props} stroke={m.color} metricIndex={i} />
           )}
           isAnimationActive
           animationBegin={animationMetaByMetric[m.key]?.beginMs ?? 0}
           animationDuration={animationMetaByMetric[m.key]?.durationMs ?? 1000}
           animationEasing="ease-out"
           className={`engagement-line-reveal engagement-line-order-${i} ${animationMetaByMetric[m.key]?.phase === "primary" ? "engagement-line-primary" : "engagement-line-secondary"}`}
           style={{
            animationDelay: `${animationMetaByMetric[m.key]?.beginMs ?? 0}ms`,
            animationDuration: `${animationMetaByMetric[m.key]?.durationMs ?? 1000}ms`,
           }}
          />
         ))}
        </g>
        <Customized component={({ offset, width }: any) => {
         if (!offset) return null
         const left = offset.left
         const right = offset.left + offset.width
         const top = offset.top
         const bottom = offset.top + offset.height
         return (
          <g pointerEvents="none">
           <line x1={left} y1={top} x2={left} y2={0} stroke="#000" strokeWidth={3} shapeRendering="crispEdges" />
           <line x1={right} y1={bottom} x2={width} y2={bottom} stroke="#000" strokeWidth={3} shapeRendering="crispEdges" />
          </g>
         )
        }} />
       </LineChart>
     </StableChartFrame>
    </div>
   </div>
  </SubToolboxChartModule>
 )
}

/* 6. Packaging */
const CHART_SELECT_CLASS = "h-7 px-2 bg-white border-[2px] border-black rounded-[4px] text-[9px] font-black uppercase"

export const Packaging: React.FC<GChartProps> = ({ data }) => {
 const [selectedCount, setSelectedCount] = useState(20)
 const [selectedFormat, setSelectedFormat] = useState<"All" | "Shorts" | "Long">("All")
 const cd = useMemo(() => {
  const filtered = data.filter((r) => {
   if (selectedFormat === "Shorts") return r.format === "shorts"
   if (selectedFormat === "Long") return r.format !== "shorts"
   return true
  })
  return [...filtered].slice(0, selectedCount).map(r => ({
   title: r.title, imp: mv(r,"impressions"), ctr: +mv(r,"ctr").toFixed(1), views: mv(r,"views"),
   format: r.format
  })).filter(d=>d.imp>0&&d.ctr>0)
 }, [data, selectedCount, selectedFormat])
 return (
  <Card
   title="PACKAGING"
   subtitle="CTR × Impressions"
   headerColor="#FFEA00"
   count={cd.length}
   controls={
    <div className="flex items-center gap-2">
     <select
      value={selectedCount}
      onChange={(e) => setSelectedCount(Number(e.target.value))}
      className={CHART_SELECT_CLASS}
     >
      {[10, 15, 20, 25, 50].map((n) => (
       <option key={n} value={n}>TOP {n}</option>
      ))}
     </select>
     <select
      value={selectedFormat}
      onChange={(e) => setSelectedFormat(e.target.value as "All" | "Shorts" | "Long")}
      className={CHART_SELECT_CLASS}
     >
      {["All", "Shorts", "Long"].map((f) => (
       <option key={f} value={f}>{f.toUpperCase()}</option>
      ))}
     </select>
    </div>
   }
  >
   <ScatterChart margin={{top:10,right:10,bottom:10,left:-10}}>
    <CartesianGrid strokeDasharray="3 3"/><XAxis type="number" dataKey="imp" name="Impressions" tick={{fontWeight:900,fontSize:10}} tickFormatter={v=>v>1000?`${(v/1000).toFixed(0)}K`:v}/>
    <YAxis type="number" dataKey="ctr" name="CTR %" tick={{fontWeight:900,fontSize:10}}/>
    <ZAxis type="number" dataKey="views" range={[100,1500]}/>
    <Tooltip content={<ChartTip/>}/>
    <Scatter data={cd.filter(d=>d.format==="shorts")} fill="#FF7497" name="Shorts"/>
    <Scatter data={cd.filter(d=>d.format!=="shorts")} fill="#00E5FF" name="Long"/>
   </ScatterChart>
  </Card>
 )
}

/* 7. Engagement Map */
export const EngagementMap: React.FC<GChartProps> = ({ data }) => {
 const [selectedCount, setSelectedCount] = useState(15)
 const [selectedFormat, setSelectedFormat] = useState<"All" | "Shorts" | "Long">("All")
 const [sortBy, setSortBy] = useState<"best" | "newest">("best")
 const cd = useMemo(() => {
  const filtered = data.filter((r) => {
   if (selectedFormat === "Shorts") return r.format === "shorts"
   if (selectedFormat === "Long") return r.format !== "shorts"
   return true
  })
  const sorted =
   sortBy === "newest"
    ? [...filtered].sort((a, b) => new Date(String(b.uploadDate || "")).getTime() - new Date(String(a.uploadDate || "")).getTime())
    : [...filtered].sort((a, b) => mv(b, "likes") - mv(a, "likes"))
  return sorted.slice(0, selectedCount).map((r) => ({
   name: r.title.substring(0, 28),
   likes: mv(r, "likes"),
   comments: mv(r, "comments"),
   shares: mv(r, "shares"),
  }))
 }, [data, selectedCount, selectedFormat, sortBy])
 const top = cd[0]
 return (
  <UnifiedChartModule
   title="ENGAGEMENT MAP"
   subtitle="TOP 50 RECENT BY COMMENTS"
   headerColor="#FF9900"
   keys={[
    { label: "LIKES", tone: "pink" },
    { label: "COMMENTS", tone: "cyan" },
    { label: "SHARES", tone: "lime" },
   ]}
   stats={[
    { label: "LATEST", value: String(cd.length), tone: "orange" },
    {
     label: "COMMENTS PEAK",
     value: String(Math.max(0, ...cd.map((d) => d.comments))),
     tone: "cyan",
    },
   ]}
   activeVideo={{
    title: top?.name || "No video selected",
    stats: [
     { label: "LIKES", value: String(top?.likes || 0), tone: "pink" },
     { label: "COMMENTS", value: String(top?.comments || 0), tone: "cyan" },
     { label: "SHARES", value: String(top?.shares || 0), tone: "lime" },
    ],
   }}
   insight="Compares social interaction signatures across recent top-comment videos."
   controls={
    <div className="flex items-center gap-2">
     <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value as "best" | "newest")}
      className={CHART_SELECT_CLASS}
     >
      <option value="best">Best</option>
      <option value="newest">Newest</option>
     </select>
     <select
      value={selectedCount}
      onChange={(e) => setSelectedCount(Number(e.target.value))}
      className={CHART_SELECT_CLASS}
     >
      {[10, 15, 20, 25, 50].map((n) => (
       <option key={n} value={n}>TOP {n}</option>
      ))}
     </select>
     <select
      value={selectedFormat}
      onChange={(e) => setSelectedFormat(e.target.value as "All" | "Shorts" | "Long")}
      className={CHART_SELECT_CLASS}
     >
      {["All", "Shorts", "Long"].map((f) => (
       <option key={f} value={f}>{f.toUpperCase()}</option>
      ))}
     </select>
    </div>
   }
  >
   <ResponsiveContainer width="100%" height={300} minWidth={1} minHeight={1}>
    <BarChart data={cd} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
     <CartesianGrid strokeDasharray="3 3" vertical={false} />
     <XAxis
      dataKey="name"
      tick={{ fontSize: 8, fontWeight: 900 }}
      interval={0}
      angle={-45}
      textAnchor="end"
     />
     <YAxis tick={{ fontSize: 10, fontWeight: 900 }} />
     <Tooltip content={<ChartTip />} />
     <Legend
      wrapperStyle={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}
     />
     <Bar dataKey="likes" name="Likes" fill="#FF7497" radius={[4, 4, 0, 0]} />
     <Bar dataKey="comments" name="Comments" fill="#00E5FF" radius={[4, 4, 0, 0]} />
     <Bar dataKey="shares" name="Shares" fill="#CCFF00" radius={[4, 4, 0, 0]} />
    </BarChart>
   </ResponsiveContainer>
  </UnifiedChartModule>
 )
}

/* 8. Performance Trend */
export const PerformanceTrend: React.FC<GChartProps> = ({ data }) => {
 const cd = useMemo(() => [...data].sort((a,b) => new Date(a.uploadDate).getTime()-new Date(b.uploadDate).getTime())
  .map(r => ({ title: r.title.substring(0,20), date: new Date(r.uploadDate).toLocaleDateString(undefined,{month:"short",day:"numeric"}),
   views: mv(r,"views"), subs: mv(r,"subscribersGained") })), [data])
 return (
  <Card title="PERFORMANCE TREND" subtitle="Views vs. Subscriber Trends" headerColor="#FFEA00">
   <ComposedChart data={cd} margin={{top:10,right:10,left:-10,bottom:0}}>
    <CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date" tick={{fontSize:9,fontWeight:900}}/>
    <YAxis yAxisId="l" tick={{fontSize:10,fontWeight:900}}/><YAxis yAxisId="r" orientation="right" tick={{fontSize:10,fontWeight:900}}/>
    <Tooltip content={<ChartTip/>}/>
    <Area yAxisId="l" type="monotone" dataKey="views" fill="#FF749730" stroke="#FF7497" strokeWidth={2} name="Views"/>
    <Line yAxisId="r" type="monotone" dataKey="subs" stroke="#00E5FF" strokeWidth={3} dot={false} name="Subscribers"/>
   </ComposedChart>
  </Card>
 )
}

/* 9. Duration Sweet Spot */
export const DurationSweetSpot: React.FC<GChartProps> = ({ data }) => {
 const cd = useMemo(() => data.map(r => ({
  title: r.title, dur: +(r.durationSeconds/60).toFixed(1), views: mv(r,"views"), avp: mv(r,"avp")
 })).filter(d=>d.dur>0&&d.views>0), [data])
 return (
  <Card title="DURATION SWEET SPOT" subtitle="Video Length × Avg Views" headerColor="#CCFF00">
   <ScatterChart margin={{top:10,right:10,bottom:10,left:-10}}>
    <CartesianGrid strokeDasharray="3 3"/><XAxis type="number" dataKey="dur" name="Duration (min)" tick={{fontWeight:900,fontSize:10}}/>
    <YAxis type="number" dataKey="views" name="Views" tick={{fontWeight:900,fontSize:10}} tickFormatter={v=>v>1000?`${(v/1000).toFixed(0)}K`:v}/>
    <ZAxis type="number" dataKey="avp" range={[30,300]}/>
    <Tooltip content={<ChartTip/>}/><Scatter data={cd} fill="#FF7497" stroke="#000" strokeWidth={1}/></ScatterChart>
  </Card>
 )
}


/* 11. Audience Growth */
export const AudienceGrowth: React.FC<GChartProps> = ({ data }) => {
 const cd = useMemo(() => [...data].sort((a,b) => new Date(a.uploadDate).getTime()-new Date(b.uploadDate).getTime())
  .map(r => ({ title: r.title.substring(0,20), date: new Date(r.uploadDate).toLocaleDateString(undefined,{month:"short",day:"numeric"}),
   subs: mv(r,"subscribersGained") })), [data])
 return (
  <Card title="AUDIENCE GROWTH" subtitle="Discovery vs. Community" headerColor="#FF9900">
   <AreaChart data={cd} margin={{top:10,right:10,left:-10,bottom:0}}>
    <CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date" tick={{fontSize:9,fontWeight:900}}/><YAxis tick={{fontSize:10,fontWeight:900}}/>
    <Tooltip content={<ChartTip/>}/><Area type="monotone" dataKey="subs" fill="#CCFF00" stroke="#000" strokeWidth={2} name="Subscribers Gained"/></AreaChart>
  </Card>
 )
}

/* 12. Golden Ratio Radar */
export const GoldenRatioRadar: React.FC<GChartProps> = ({ data }) => {
 const rd = useMemo(() => {
  const avg = (k:string) => { const vals = data.map(r=>mv(r,k)).filter(v=>v>0); return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0 }
  return [
   { subject:"CTR", A: +avg("ctr").toFixed(1), max: 15 },
   { subject:"AVP", A: +avg("avp").toFixed(1), max: 100 },
   { subject:"Likes/View", A: +(avg("likes")/(avg("views")||1)*100).toFixed(2), max: 10 },
   { subject:"Comments", A: +avg("comments").toFixed(0), max: 200 },
   { subject:"Shares", A: +avg("shares").toFixed(0), max: 100 },
   { subject:"Subscribers", A: +avg("subscribersGained").toFixed(0), max: 50 },
  ]
 }, [data])
 return (
  <div className="bg-[#1a1a1a] border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] overflow-hidden">
   <div className="border-b-[4px] border-black px-5 py-3 flex justify-between items-center bg-black">
    <span className="font-[900] text-lg uppercase text-[#00E5FF]">GOLDEN RATIO RADAR</span>
   </div>
   <div className="p-4 h-[360px]">
    <StableChartFrame minHeightClassName="min-h-[260px]">
     <RadarChart cx="50%" cy="50%" outerRadius="80%" data={rd}>
      <PolarGrid stroke="#444"/><PolarAngleAxis dataKey="subject" tick={{fill:"#fff",fontSize:10,fontWeight:900}}/>
      <PolarRadiusAxis tick={{fill:"#666"}}/><Radar name="Avg" dataKey="A" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.5}/>
     </RadarChart>
    </StableChartFrame>
   </div>
  </div>
 )
}

/* 13. Hook Effectiveness (30s retention) */
export const HookEffectiveness: React.FC<GChartProps> = ({ data }) => {
 const [selectedCount, setSelectedCount] = useState(10)
 const cycleCount = (dir: 1 | -1) => {
  setSelectedCount(cycleDistributionValue(DISTRIBUTION_COUNT_VALUES, selectedCount, dir))
 }
 const cd = useMemo(() => [...data].sort((a,b)=>mv(b,"avp")-mv(a,"avp")).slice(0,selectedCount)
  .map(r => ({ name: r.title.substring(0,20), avp: +mv(r,"avp").toFixed(1) })).filter(d=>d.avp>0), [data, selectedCount])
 return (
  <SubToolboxChartModule
   header={{
    title: "HOOK EFFECTIVENESS",
    subtitle: "30-SECOND RETENTION",
    icon: <CustomIcon name="analytics" size={18} />,
    headerStyle: "subtoolbox",
   }}
   theme={{
    headerBandBg: "#CCFF00",
    iconBlockBg: "#33FF99",
    shadowColor: "rgba(204,255,0,0.45)",
   }}
   layout={{ moduleMinHeight: "340px", moduleWidth: "100%" }}
   controlBox={{ count: cd.length, countUnit: "VIDEOS", onCountPrev: () => cycleCount(-1), onCountNext: () => cycleCount(1) }}
   activeContext={{
    title: cd[0]?.name?.toUpperCase() || "NO DATA",
    stats: [
     { label: "BEST", value: `${cd[0]?.avp ?? 0}%`, tone: "lime" },
     { label: "AVG", value: `${cd.length > 0 ? (cd.reduce((s, d) => s + d.avp, 0) / cd.length).toFixed(1) : 0}%`, tone: "cyan" },
    ],
   }}
   footer={
    <InsightMarquee
     mode="insight-lock"
     segments={[
      { badge: "Hook", text: "Hook effectiveness measures how well your first 30 seconds retain viewers — the #1 factor for Shorts virality.", badgeTone: "lime" },
     ]}
    />
   }
  >
   <div className="h-[340px] p-4">
    <StableChartFrame minHeightClassName="min-h-[300px]">
     <BarChart data={cd} layout="vertical" margin={{top:10,right:30,left:10,bottom:5}}>
      <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
      <XAxis type="number" domain={[0,100]} unit="%" tick={{fontWeight:900,fontSize:11}} axisLine={{ stroke: '#000', strokeWidth: 3 }}/>
      <YAxis dataKey="name" type="category" tick={{fontWeight:900,fontSize:9}} width={120} axisLine={{ stroke: '#000', strokeWidth: 3 }}/>
      <Tooltip content={<ChartTip/>}/>
      <Bar dataKey="avp" fill="#33FF99" name="AVP %" radius={[0,4,4,0]}/>
     </BarChart>
    </StableChartFrame>
   </div>
  </SubToolboxChartModule>
 )
}

/* 14. Growth Pulse */
export const GrowthPulse: React.FC<GChartProps> = ({ data }) => {
 const METRIC_OPTIONS = [
  { value: "subscribersGained", label: "SUBSCRIBERS", tone: "lime" as const, isRevenue: false },
  { value: "revenue", label: "REVENUE", tone: "yellow" as const, isRevenue: true },
  { value: "videoCount", label: "VIDEO COUNT", tone: "white" as const, isRevenue: false },
  { value: "views", label: "VIEWS", tone: "pink" as const, isRevenue: false },
  { value: "watchHours", label: "WATCH HRS", tone: "cyan" as const, isRevenue: false },
 ] as const
 const TIME_RANGE_OPTIONS = [
  { value: "2y", label: "TWO YEARS", months: 24 },
  { value: "1y", label: "ONE YEAR", months: 12 },
  { value: "6m", label: "SIX MONTHS", months: 6 },
  { value: "3m", label: "THREE MONTHS", months: 3 },
 ] as const

 const [metric, setMetric] = useState<(typeof METRIC_OPTIONS)[number]["value"]>("views")
 const [timeRange, setTimeRange] = useState<(typeof TIME_RANGE_OPTIONS)[number]["value"]>("1y")
 const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

 const activeMetric = METRIC_OPTIONS.find((o) => o.value === metric) || METRIC_OPTIONS[3]
 const activeTimeRange = TIME_RANGE_OPTIONS.find((o) => o.value === timeRange) || TIME_RANGE_OPTIONS[1]

 const formatMetricValue = (key: (typeof METRIC_OPTIONS)[number]["value"], value: number) => {
  if (key === "revenue") return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  if (key === "watchHours") return `${formatCompact(value)}h`
  if (key === "videoCount") return formatCompact(value)
  return formatCompact(value)
 }

 const formatRange = (start: Date, end: Date) =>
  `${start.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "2-digit" })} - ${end.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "2-digit" })}`

 const scopedRows = useMemo(() => {
  const now = new Date()
  const rangeStart = new Date(now)
  rangeStart.setMonth(rangeStart.getMonth() - activeTimeRange.months)
  return data.filter((r) => {
   const d = new Date(String(r.uploadDate || ""))
   return d >= rangeStart && d <= now
  })
 }, [data, activeTimeRange.months])

 const chartData = useMemo(() => {
  const now = new Date()
  const rangeStart = new Date(now)
  rangeStart.setMonth(rangeStart.getMonth() - activeTimeRange.months)

  const bucketCount = 24
  const bucketMs = Math.max(1, (now.getTime() - rangeStart.getTime()) / bucketCount)
  const buckets = Array.from({ length: bucketCount }, (_, i) => {
   const start = new Date(rangeStart.getTime() + i * bucketMs)
   const end = new Date(rangeStart.getTime() + (i + 1) * bucketMs)
   return {
    start,
    end,
    name: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    periodAmount: 0,
    totalProgress: 0,
   }
  })

  scopedRows.forEach((r) => {
   const d = new Date(String(r.uploadDate || ""))
   const diff = d.getTime() - rangeStart.getTime()
   const idx = Math.min(bucketCount - 1, Math.max(0, Math.floor(diff / bucketMs)))
   if (idx >= 0 && idx < bucketCount) {
    buckets[idx].periodAmount += metric === "videoCount" ? 1 : mv(r, metric)
   }
  })

  let runningTotal = 0
  return buckets.map((b) => {
   runningTotal += b.periodAmount
   return { ...b, totalProgress: runningTotal }
  })
 }, [activeTimeRange.months, metric, scopedRows])

 const selectedWindowStats = useMemo(
  () => METRIC_OPTIONS.map((option) => {
   const total = scopedRows.reduce((sum, row) => sum + (option.value === "videoCount" ? 1 : mv(row, option.value)), 0)
   return {
    label: option.label,
    value: formatMetricValue(option.value, total),
    tone: option.tone,
    lockTone: true,
    compact: true,
   }
  }),
  [scopedRows],
 )

 const hoveredPeriod = hoveredIdx !== null ? chartData[hoveredIdx] ?? null : null
 const hoveredStats = hoveredPeriod ? [
  {
   label: activeMetric.label,
   value: formatMetricValue(activeMetric.value, hoveredPeriod.periodAmount),
   tone: activeMetric.tone,
   lockTone: true,
   compact: true,
  },
  {
   label: "AREA",
   value: formatMetricValue(activeMetric.value, hoveredPeriod.totalProgress),
   tone: "cyan" as const,
   lockTone: true,
   compact: true,
  },
 ] : null

 const periodRangeLabel = useMemo(() => {
  if (chartData.length === 0) return "NO PERIOD RANGE"
  const start = chartData[0]?.start
  const end = chartData[chartData.length - 1]?.end
  if (!(start instanceof Date) || !(end instanceof Date)) return "NO PERIOD RANGE"
  return formatRange(start, end)
 }, [chartData])

 const activeContextStats = hoveredStats || selectedWindowStats

 return (
  <SubToolboxChartModule
   header={{
    title: "GROWTH PULSE",
    subtitle: "PERIOD AMOUNT • RUNNING TOTAL",
    icon: <CustomIcon name="analytics" size={18} />,
   }}
   theme={{
    headerBandBg: "#FF82B0",
    iconBlockBg: "#26C7EC",
    shadowColor: "rgba(255,130,176,0.45)",
   }}
   controllerRows={[
    {
      type: "label",
      value: "CHANNEL TOTALS FOR",
      bgTone: "#000000",
      fgTone: "#CCFF00",
    },
    {
      type: "dropdown",
      value: metric,
      options: METRIC_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
      onSelect: (v) => setMetric(v as (typeof METRIC_OPTIONS)[number]["value"]),
      bgTone: "#FF7497",
      fgTone: "#000000",
    },
    {
      type: "text",
      value: TIME_RANGE_OPTIONS.find((o) => o.value === timeRange)?.label || timeRange,
      onPrev: () => {
       const idx = TIME_RANGE_OPTIONS.findIndex((o) => o.value === timeRange)
       setTimeRange(TIME_RANGE_OPTIONS[(idx - 1 + TIME_RANGE_OPTIONS.length) % TIME_RANGE_OPTIONS.length].value)
      },
      onNext: () => {
       const idx = TIME_RANGE_OPTIONS.findIndex((o) => o.value === timeRange)
       setTimeRange(TIME_RANGE_OPTIONS[(idx + 1) % TIME_RANGE_OPTIONS.length].value)
      },
      bgTone: "#FFEA00",
      fgTone: "#000000",
    },
   ]}
   activeContext={{
    title: hoveredPeriod ? formatRange(hoveredPeriod.start, hoveredPeriod.end) : periodRangeLabel,
    stats: activeContextStats,
   }}
   footer={
    <InsightMarquee
     chartInsight="Cumulative growth tracking identifies the long-term compound value of your content periods."
     personalInsight="Watch for periods where Period Delta (Cyan) remains consistent while Total (Pink) curves up."
    />
   }
  >
   <div className="p-4 h-[360px]">
    <StableChartFrame minHeightClassName="min-h-[260px]">
     <LineChart
      data={chartData}
      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
      onMouseMove={(state: any) => {
       if (typeof state?.activeTooltipIndex === "number") {
        setHoveredIdx(state.activeTooltipIndex)
       }
      }}
      onMouseLeave={() => setHoveredIdx(null)}
     >
      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
      <XAxis dataKey="title" tick={{ fill: "#666", fontSize: 8, fontWeight: 900 }} />
      <YAxis tick={{ fill: "#666", fontSize: 10 }} />
      <Tooltip content={<ChartTip />} />
      <Line type="monotone" dataKey="views" stroke="#FF7497" strokeWidth={3} dot={false} name="Views" />
      <Line type="monotone" dataKey="subs" stroke="#00E5FF" strokeWidth={3} dot={false} name="Subscribers" />
      <Line type="monotone" dataKey="rev" stroke="#FFEA00" strokeWidth={3} dot={false} name="Revenue" />
      <Line type="monotone" dataKey="shares" stroke="#CCFF00" strokeWidth={3} dot={false} name="Shares" />
      <Legend wrapperStyle={{ fontSize: "10px", fontWeight: 900 }} />
     </LineChart>
    </StableChartFrame>
   </div>
  </SubToolboxChartModule>
 )
}

export const StackedEngagementPulse = EngagementLinesModule

/* 16. Format Comparison Donuts */
export const FormatComparisonDonuts: React.FC<GChartProps> = ({ data, contentTypeRows }) => {
 const [localWindow, setLocalWindow] = useState<"28d" | "90d" | "lifetime">("lifetime")
 const [aggregationMode, setAggregationMode] = useState<"total" | "average">("total")

 const filteredData = useMemo(() => {
  if (localWindow === "lifetime") return data
  const now = new Date().getTime()
  const days = localWindow === "28d" ? 28 : 90
  const threshold = now - (days * 24 * 60 * 60 * 1000)
  return data.filter((r) => new Date(r.uploadDate || 0).getTime() > threshold)
 }, [data, localWindow])

 // Content Type dataset (creatorContentTypes) authoritatively splits Views and Watch Time by format.
 // We only honor it in "lifetime" mode because the Analytics API rows aren't windowed by upload date.
 const contentTypeTotals = useMemo(() => {
  if (localWindow !== "lifetime" || !contentTypeRows || contentTypeRows.length === 0) return null
  const isShorts = (value: unknown) => {
   const label = String(value ?? "").toLowerCase()
   return label === "shorts" || label === "short" || label.includes("short")
  }
  const readNumber = (value: unknown): number => {
   if (typeof value === "number" && Number.isFinite(value)) return value
   const parsed = Number(String(value ?? "").replace(/[$,%\s,]/g, ""))
   return Number.isFinite(parsed) ? parsed : 0
  }
  const totals = { longViews: 0, shortsViews: 0, longWatchMinutes: 0, shortsWatchMinutes: 0 }
  contentTypeRows.forEach((row) => {
   const label = row.creatorContentType ?? row.contentType ?? row.term
   const views = readNumber(row.views)
   const watchMinutes = readNumber(row.estimatedMinutesWatched ?? row.watchTime)
   if (isShorts(label)) {
    totals.shortsViews += views
    totals.shortsWatchMinutes += watchMinutes
   } else {
    totals.longViews += views
    totals.longWatchMinutes += watchMinutes
   }
  })
  return {
   views: { long: totals.longViews, shorts: totals.shortsViews },
   watchHours: { long: totals.longWatchMinutes / 60, shorts: totals.shortsWatchMinutes / 60 },
  }
 }, [contentTypeRows, localWindow])

 const cd = useMemo(() => {
  const metrics = [
   { key: "watchHours", label: "Watch Hours" },
   { key: "revenue", label: "Revenue" },
   { key: "subscribersGained", label: "Subscribers" },
   { key: "views", label: "Views" },
  ]

  return metrics.map((m) => {
   let longTotal: number
   let shortsTotal: number
   if (aggregationMode === "total" && contentTypeTotals && (m.key === "views" || m.key === "watchHours")) {
    const bucket = contentTypeTotals[m.key]
    longTotal = bucket.long
    shortsTotal = bucket.shorts
   } else {
    longTotal = filteredData
     .filter((r) => r.format === "long" || r.format === "unknown")
     .reduce((acc, r) => acc + mv(r, m.key), 0)
    shortsTotal = filteredData
     .filter((r) => r.format === "shorts")
     .reduce((acc, r) => acc + mv(r, m.key), 0)
   }
   if (aggregationMode === "average") {
    const longCount = filteredData.filter((r) => r.format === "long" || r.format === "unknown").length
    const shortsCount = filteredData.filter((r) => r.format === "shorts").length
    longTotal = longCount > 0 ? longTotal / longCount : 0
    shortsTotal = shortsCount > 0 ? shortsTotal / shortsCount : 0
   }

   const total = longTotal + shortsTotal
   const longRatio = total > 0 ? longTotal / total : 0.5
   const startAngle = 90 + (longRatio * 360) / 2

   return {
    label: m.label,
    key: m.key,
    startAngle,
    data: [
     { name: "Longform", value: longTotal, fill: "#00E5FF" },
     { name: "Shorts", value: shortsTotal, fill: "#FF7497" },
    ],
    total,
   }
  })
 }, [filteredData, contentTypeTotals, aggregationMode])

 const longStats = cd.map(m => ({ label: m.label.toUpperCase(), value: Math.round(m.data[0].value).toLocaleString(), tone: "cyan" as const, lockTone: true }))
 const shortsStats = cd.map(m => ({ label: m.label.toUpperCase(), value: Math.round(m.data[1].value).toLocaleString(), tone: "pink" as const, lockTone: true }))

 return (
  <SubToolboxChartModule
   header={{
    title: "FORMAT DOMINANCE",
    subtitle: "HOW EACH FORMAT DRIVES CORE METRICS",
    headerStyle: "subtoolbox",
    icon: <CustomIcon name="layers" size={18} />,
   }}
   theme={{
    headerBandBg: "#CCFF00",
    iconBlockBg: "#00E5FF",
    shadowColor: "rgba(204, 255, 0, 0.4)",
   }}
   layout={{ moduleMinHeight: "360px", moduleWidth: "100%" }}
   activeContext={{
    leftTitle: "LONGFORM",
    leftStats: longStats,
    title: (
     <div className="w-full h-full flex items-center justify-center">
      <div className="flex items-center gap-8">
       <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded-full bg-[#00E5FF] border-[2px] border-black" />
        <span className="text-[12px] font-[1000] uppercase tracking-[0.05em] text-black">Long</span>
       </div>
       <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded-full bg-[#FF7497] border-[2px] border-black" />
        <span className="text-[12px] font-[1000] uppercase tracking-[0.05em] text-black">Shorts</span>
       </div>
      </div>
     </div>
    ),
    rightTitle: "SHORTS",
    rightStats: shortsStats
   }}
   controllerRows={[
    { type: "number", value: filteredData.length, bgTone: "#00E5FF" },
    { type: "label", value: "LONG + SHORTS", bgTone: "#FF7497", fgTone: "#000000" },
    {
     type: "custom",
     bgTone: "#FFFFFF",
     render: () => (
      <div className="grid h-[26px] min-h-[26px] w-full grid-cols-[1fr_1.25fr] items-stretch text-[11px] font-[1000] uppercase">
       <label className="relative min-w-0 border-r-[4px] border-black bg-[#FFEA00]">
        <span className="pointer-events-none absolute inset-y-0 left-1 flex items-center">Window</span>
        <select
         aria-label="Format dominance time window"
         value={localWindow}
         onChange={(event) => setLocalWindow(event.target.value as "28d" | "90d" | "lifetime")}
         className="h-full w-full cursor-pointer appearance-none border-0 bg-transparent pl-[48px] pr-4 text-right text-[11px] font-[1000] uppercase outline-none"
        >
         <option value="28d">28 Days</option>
         <option value="90d">90 Days</option>
         <option value="lifetime">Lifetime</option>
        </select>
       </label>
       <div className="grid grid-cols-2">
        <button type="button" onClick={() => setAggregationMode("total")} className="border-0 border-r-[2px] border-black text-[11px] font-[1000] uppercase" style={{ background: aggregationMode === "total" ? "#CCFF00" : "#FFFFFF" }}>Total</button>
        <button type="button" onClick={() => setAggregationMode("average")} className="border-0 border-l-[2px] border-black text-[11px] font-[1000] uppercase" style={{ background: aggregationMode === "average" ? "#CCFF00" : "#FFFFFF" }}>Average</button>
       </div>
      </div>
     ),
    },
   ]}
   footer={
    <InsightMarquee 
      chartInsight="Compares longform and shorts contribution across watch hours, revenue, subscribers, and views."
      personalInsight="Track where one format controls more than half the metric so you can set format-specific publishing targets."
     />
   }
   footerBorderless
  >
   <div className="flex flex-row items-stretch justify-center gap-0 p-0 bg-white h-[352px] overflow-hidden">
    {cd.map((metric) => (
     <div key={metric.key} className="flex-1 h-full min-w-0 relative bg-white flex flex-col">
      <div className="flex-1 min-h-0 relative">
       <StableChartFrame minHeightClassName="min-h-[300px]">
         <PieChart>
          <Pie
           data={metric.data}
           dataKey="value"
           nameKey="name"
           cx="50%"
           cy="50%"
           innerRadius="52%"
           outerRadius="98%"
           stroke="none"
           startAngle={metric.startAngle}
           endAngle={metric.startAngle - 360}
           isAnimationActive
           labelLine={false}
           label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
            const RADIAN = Math.PI / 180
            const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5
            const angle = Number(midAngle ?? 0)
            const x = Number(cx) + radius * Math.cos(-angle * RADIAN)
            const y = Number(cy) + radius * Math.sin(-angle * RADIAN)
            return (
             <text
              x={x}
              y={y}
              fill="white"
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[32px] font-[1000] tabular-nums"
             >
              {Math.round(value).toLocaleString()}
             </text>
            )
           }}
          >
           {metric.data.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
           ))}
          </Pie>
          <Tooltip content={<ChartTip />} />
          <text x="50%" y={metric.key === "watchHours" ? "47%" : "50%"} textAnchor="middle" dominantBaseline="middle" fill="#000" className="text-[14px] font-[1000] uppercase">
           {metric.key === "watchHours" ? "WATCH" : metric.label.toUpperCase()}
          </text>
          {metric.key === "watchHours" ? (
           <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fill="#000" className="text-[14px] font-[1000] uppercase">HOURS</text>
          ) : null}
         </PieChart>
       </StableChartFrame>
      </div>
     </div>
    ))}
   </div>
  </SubToolboxChartModule>
 )
}

/* ═══════════════════════════════════════════════
   14b. REVENUE EFFICIENCY (UPGRADED BUBBLE)
   ═══════════════════════════════════════════════ */
const REVENUE_EFFICIENCY_COUNT_VALUES = [25, 50, 75, 100]

export const RevenueEfficiency: React.FC<GChartProps> = ({ data }) => {
  const [mode, setMode] = useState<"top-performing" | "most-recent">("top-performing")
  const [modeMenuOpen, setModeMenuOpen] = useState(false)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [selectedCount, setSelectedCount] = useState(50)
  const cycleCount = (dir: 1 | -1) => {
    const idx = REVENUE_EFFICIENCY_COUNT_VALUES.indexOf(selectedCount)
    const nextIdx = (idx + dir + REVENUE_EFFICIENCY_COUNT_VALUES.length) % REVENUE_EFFICIENCY_COUNT_VALUES.length
    setSelectedCount(REVENUE_EFFICIENCY_COUNT_VALUES[nextIdx])
  }

  const cd = useMemo(() => {
    const raw = data
      .map(r => {
        const revenue = resolveMetricNumber(r, "revenue")
        const views = mv(r, "views")
        return {
          title: r.title,
          wh: +mv(r, "watchHours").toFixed(1),
          rpm: +((revenue.value ?? 0) / (views / 1000 || 1)).toFixed(2),
          views,
          rev: revenue.value ?? 0,
          revenueAvailable: revenue.value !== null,
          uploadTs: new Date(String(r.uploadDate || "")).getTime() || 0,
        }
      })
      .filter(d => d.wh > 0 && d.rpm > 0)

    const points = mode === "most-recent"
      ? [...raw].sort((a, b) => b.uploadTs - a.uploadTs).slice(0, selectedCount)
      : [...raw].sort((a, b) => b.rev - a.rev).slice(0, selectedCount)

    const revenuePercentiles = buildTieAwarePercentiles(
      points.map((point) => point.revenueAvailable ? point.rev : null),
    )
    const viewRadii = buildLogBubbleRadii(points.map((point) => point.views), {
      minRadius: 4,
      maxRadius: 25,
    })
    const watchHoursScale = buildAdaptiveZeroScale(points.map((point) => point.wh), {
      fallbackMax: 100,
    })
    const revScale = buildAdaptiveZeroScale(points.map((point) => point.rev), {
      fallbackMax: 100,
    })
    const chartPoints = points.map((d, index) => {
      const key = `${d.title}-${d.uploadTs}-${d.rev}`
      const revenuePosition = revenuePercentiles[index]
      return {
        ...d,
        key,
        radius: viewRadii[index],
        color: revenuePosition === null
          ? MISSING_BUBBLE_COLOR
          : interpolateThreeStopColor(revenuePosition, REVENUE_EFFICIENCY_PALETTE),
      }
    })

    return {
      points: [...chartPoints].sort((a, b) => b.radius - a.radius),
      watchHoursScale,
      revScale,
    }
  }, [data, mode, selectedCount])

  const bubbleShape = (props: any) => {
    const { cx, cy, payload } = props
    const isActive = hoveredKey === payload.key
    const scale = isActive ? 1.25 : 1
    return (
      <circle
        cx={cx}
        cy={cy}
        r={payload.radius * scale}
        fill={payload.color}
        fillOpacity={0.75}
        stroke={payload.color}
        strokeWidth={isActive ? 2 : 0}
        onMouseEnter={() => setHoveredKey(payload.key)}
        style={{
          shapeRendering: "geometricPrecision",
          transitionProperty: "r, stroke-width, fill-opacity",
          transitionDuration: isActive ? "750ms" : "350ms",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          cursor: "pointer",
        }}
      />
    )
  }

  const activePoint = cd.points.find(p => p.key === hoveredKey) || cd.points[0]

  return (
    <SubToolboxChartModule
      header={{
        title: "REVENUE EFFICIENCY",
        subtitle: "WATCH HOURS × EST. REVENUE",
        headerStyle: "subtoolbox",
        icon: <CustomIcon name="analytics" size={18} />,
      }}
      theme={{
        headerBandBg: "#FFD700",
        iconBlockBg: "#CCFF00",
        shadowColor: "rgba(255, 215, 0, 0.45)",
      }}
      layout={{ moduleMinHeight: "420px", moduleWidth: "100%" }}
      controlBox={{
        count: cd.points.length,
        countUnit: "VIDEOS",
        onCountPrev: () => cycleCount(-1),
        onCountNext: () => cycleCount(1),
        dropdown: {
          value: mode,
          isOpen: modeMenuOpen,
          onToggle: () => setModeMenuOpen((prev) => !prev),
          onSelect: (val) => {
            setMode(val as any)
            setModeMenuOpen(false)
          },
          options: [
            { value: "top-performing", label: "BEST BY EST. REVENUE" },
            { value: "most-recent", label: "LATEST PUBLISHED" }
          ]
        }
      }}
      activeContext={{
        title: activePoint?.title?.toUpperCase() || "SELECT DATA POINT",
        stats: [
          { label: "EST REV", value: `$${activePoint?.rev.toFixed(2)}`, tone: "lime" },
          { label: "WATCH HRS", value: activePoint?.wh.toLocaleString(), tone: "cyan" },
          { label: "RPM", value: `$${activePoint?.rpm.toFixed(2)}`, tone: "yellow" }
        ]
      }}
      footer={
        <InsightMarquee 
          chartInsight="Efficiency measures how effectively watch time converts into revenue based on your niche RPM."
          personalInsight="Target high-RPM niches (Yellow) with high-retention topics to maximize your earnings per hour."
        />
      }
    >
      <div className="min-h-[400px] w-full border-[0px] border-black rounded-none bg-white p-0 overflow-hidden flex flex-col">
        <div className="h-[400px] relative">
          <StableChartFrame minHeightClassName="min-h-[400px]">
              <ScatterChart 
                margin={{ top: 20, right: 30, bottom: 28, left: 10 }}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={true} />
                <XAxis 
                  type="number" 
                  dataKey="wh" 
                  name="Watch Hours" 
                  domain={cd.watchHoursScale.domain}
                  ticks={cd.watchHoursScale.ticks}
                  tickFormatter={(value) => `${formatCompact(value)}h`}
                  tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }}
                  axisLine={{ stroke: '#000', strokeWidth: 3 }}
                  tickLine={false}
                />
                <YAxis 
                  type="number" 
                  dataKey="rev"
                  name="Est. Revenue"
                  domain={cd.revScale.domain}
                  ticks={cd.revScale.ticks}
                  tickFormatter={(value) => `$${formatCompact(value)}`}
                  tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }}
                  axisLine={{ stroke: '#000', strokeWidth: 3 }}
                  tickLine={false}
                  label={{ 
                    value: 'EST. REVENUE ($)',
                    angle: -90, 
                    position: 'insideLeft', 
                    offset: 15, 
                    style: { fontWeight: 1000, fontSize: 14, fill: '#000', letterSpacing: '0.1em', textAnchor: 'middle' } 
                  }}
                />
                <Tooltip content={<ChartTip />} />
                <Scatter data={cd.points} shape={bubbleShape} />
                <Customized component={({ offset, width, height }: any) => {
                  if (!offset) return null
                  const left = offset.left
                  const top = offset.top
                  const right = offset.left + offset.width
                  const bottom = offset.top + offset.height
                  return (
                    <g pointerEvents="none">
                      <line x1={left} y1={top} x2={left} y2={0} stroke="#000" strokeWidth={3} shapeRendering="crispEdges" />
                      <line x1={right} y1={bottom} x2={width} y2={bottom} stroke="#000" strokeWidth={3} shapeRendering="crispEdges" />
                    </g>
                  )
                }} />
              </ScatterChart>
          </StableChartFrame>
          
          <div className="absolute bottom-[0px] left-[14px] right-[14px] grid grid-cols-3 items-center pointer-events-none">
            <div className="flex items-center gap-2 justify-self-end">
              <span className="text-[14px] font-[1000] uppercase tracking-[0.05em] text-black">Revenue</span>
              <div
                className="w-36 h-6 border-[2px] border-black rounded-[2px]"
                style={{ background: "linear-gradient(90deg, #FF7497 0%, #B14AED 50%, #26C7EC 100%)" }}
              />
            </div>
            <div className="justify-self-center flex items-center gap-3">
              <span className="text-black font-[1000] text-[16px] leading-none">◀</span>
              <span className="uppercase tracking-[0.1em] text-black" style={{ fontWeight: 1000, fontSize: 14, letterSpacing: "0.1em" }}>
                Watch Hours
              </span>
              <span className="text-black font-[1000] text-[16px] leading-none">▶</span>
            </div>
            <div className="flex items-center gap-2 justify-self-start">
              <div className="flex items-center gap-2">
                {[2, 3, 4, 5, 6].map((size, index) => (
                  <span
                    key={size}
                    className="aspect-square shrink-0 box-border rounded-full border border-black/30"
                    style={{
                      width: `${size * 4}px`,
                      backgroundColor: interpolateThreeStopColor(
                        index / 4,
                        REVENUE_EFFICIENCY_PALETTE,
                      ),
                    }}
                  />
                ))}
                <span className="text-[14px] font-[1000] uppercase tracking-[0.05em] text-black">Views</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SubToolboxChartModule>
  )
}

/* ═══════════════════════════════════════════════
   15. COMBO CHANNEL PROGRESS
   ═══════════════════════════════════════════════ */
export const ComboChannelProgress: React.FC<GChartProps> = ({ data }) => {
  const [metric, setMetric] = useState<string>("views")
  const [timeRange, setTimeRange] = useState<"2y" | "1y" | "6m" | "3m">("1y")
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const METRIC_OPTIONS = [
    { value: "subscribersGained", label: "SUBSCRIBERS", tone: "lime" as const, isRevenue: false },
    { value: "revenue", label: "REVENUE", tone: "yellow" as const, isRevenue: true },
    { value: "videoCount", label: "VIDEO COUNT", tone: "white" as const, isRevenue: false },
    { value: "views", label: "VIEWS", tone: "pink" as const, isRevenue: false },
    { value: "watchHours", label: "WATCH HRS", tone: "cyan" as const, isRevenue: false },
  ]
  const TIME_RANGE_OPTIONS = [
    { value: "2y", label: "TWO YEARS", months: 24 },
    { value: "1y", label: "ONE YEAR", months: 12 },
    { value: "6m", label: "SIX MONTHS", months: 6 },
    { value: "3m", label: "THREE MONTHS", months: 3 },
  ] as const
  const activeMetric = METRIC_OPTIONS.find((o) => o.value === metric) || METRIC_OPTIONS[0]
  const activeTimeRange = TIME_RANGE_OPTIONS.find((o) => o.value === timeRange) || TIME_RANGE_OPTIONS[1]

  const formatMetricValue = (key: (typeof METRIC_OPTIONS)[number]["value"], val: number) => {
    const option = METRIC_OPTIONS.find((o) => o.value === key) || activeMetric
    if (option.isRevenue) {
      if (!Number.isFinite(val)) return "$0.00"
      return `$${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    }
    if (option.value === "watchHours") return `${formatCompact(val)}h`
    return formatCompact(val)
  }

  const formatRange = (start: Date, end: Date) =>
    `${start.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "2-digit" })} - ${end.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "2-digit" })}`

  const scopedRows = useMemo(() => {
    const now = new Date()
    const rangeStart = new Date(now)
    rangeStart.setMonth(rangeStart.getMonth() - activeTimeRange.months)
    return data.filter((r) => {
      const d = new Date(String(r.uploadDate || ""))
      return d >= rangeStart && d <= now
    })
  }, [data, activeTimeRange.months])

  const chartData = useMemo(() => {
    const now = new Date()
    const rangeStart = new Date(now)
    rangeStart.setMonth(rangeStart.getMonth() - activeTimeRange.months)

    // Always render 24 buckets, regardless of chosen window.
    const bucketCount = 24
    const bucketMs = Math.max(1, (now.getTime() - rangeStart.getTime()) / bucketCount)
    const buckets = Array.from({ length: bucketCount }, (_, i) => {
      const start = new Date(rangeStart.getTime() + i * bucketMs)
      const end = new Date(rangeStart.getTime() + (i + 1) * bucketMs)
      return {
        start,
        end,
        name: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        periodAmount: 0,
        totalProgress: 0
      }
    })

    scopedRows.forEach(r => {
      const d = new Date(String(r.uploadDate || ""))
      const diff = d.getTime() - rangeStart.getTime()
      const idx = Math.min(bucketCount - 1, Math.max(0, Math.floor(diff / bucketMs)))
      if (idx >= 0 && idx < bucketCount) {
        buckets[idx].periodAmount += metric === "videoCount" ? 1 : mv(r, metric)
      }
    })

    let runningTotal = 0
    return buckets.map(b => {
      runningTotal += b.periodAmount
      return { ...b, totalProgress: runningTotal }
    })
  }, [metric, scopedRows, activeTimeRange.months])

  const selectedWindowStats = useMemo(
    () =>
      METRIC_OPTIONS.map((option) => {
        const total = scopedRows.reduce(
          (sum, row) => sum + (option.value === "videoCount" ? 1 : mv(row, option.value)),
          0,
        )
        return {
          label: option.label,
          value: formatMetricValue(option.value, total),
          tone: option.tone,
          lockTone: true,
          compact: true,
        }
      }),
    [scopedRows, metric],
  )

  const periodRangeLabel = useMemo(() => {
    if (chartData.length === 0) return "NO PERIOD RANGE"
    const start = chartData[0]?.start
    const end = chartData[chartData.length - 1]?.end
    if (!(start instanceof Date) || !(end instanceof Date)) return "NO PERIOD RANGE"
    return formatRange(start, end)
  }, [chartData])

  const periodAverage = useMemo(() => {
    if (chartData.length === 0) return 0
    const total = chartData.reduce((acc, curr) => acc + curr.periodAmount, 0)
    return total / chartData.length
  }, [chartData])

  const hoveredPeriod = hoveredIdx !== null ? chartData[hoveredIdx] ?? null : null
  const hoveredStats = hoveredPeriod
    ? [
        {
          label: activeMetric.label,
          value: formatMetricValue(activeMetric.value, hoveredPeriod.periodAmount),
          tone: activeMetric.tone,
          lockTone: true,
          compact: true,
        },
        {
          label: "TOTAL",
          value: formatMetricValue(activeMetric.value, hoveredPeriod.totalProgress),
          tone: "pink" as const,
          lockTone: true,
          compact: true,
        },
        {
          label: "AVG",
          value: formatMetricValue(activeMetric.value, periodAverage),
          tone: "cyan" as const,
          lockTone: true,
          compact: true,
        },
      ]
    : null
  const activePeriodLabel = hoveredPeriod ? formatRange(hoveredPeriod.start, hoveredPeriod.end) : periodRangeLabel

  return (
      <SubToolboxChartModule
      header={{
        title: "CHANNEL PROGRESS",
        subtitle: "PERIOD AMOUNT • RUNNING TOTAL",
        icon: <CustomIcon name="analytics" size={18} />,
      }}
      theme={{
        headerBandBg: "#FF82B0",
        iconBlockBg: "#26C7EC",
        shadowColor: "rgba(255,130,176,0.45)",
      }}
      controllerRows={[
        {
          type: "label",
          value: "CHANNEL TOTALS FOR",
          bgTone: "#000000",
          fgTone: "#CCFF00",
        },
        {
          type: "dropdown",
          value: metric,
          options: METRIC_OPTIONS,
          onSelect: (v) => setMetric(v),
          bgTone: "#FF7497"
        },
        {
          type: "text",
          value: TIME_RANGE_OPTIONS.find(o => o.value === timeRange)?.label || timeRange,
          onPrev: () => {
             const idx = TIME_RANGE_OPTIONS.findIndex(o => o.value === timeRange)
             setTimeRange(TIME_RANGE_OPTIONS[(idx - 1 + TIME_RANGE_OPTIONS.length) % TIME_RANGE_OPTIONS.length].value as "2y" | "1y" | "6m" | "3m")
          },
          onNext: () => {
             const idx = TIME_RANGE_OPTIONS.findIndex(o => o.value === timeRange)
             setTimeRange(TIME_RANGE_OPTIONS[(idx + 1) % TIME_RANGE_OPTIONS.length].value as "2y" | "1y" | "6m" | "3m")
          },
          bgTone: "#FFEA00"
        }
      ]}
      activeContext={{
        title: activePeriodLabel,
        stats: hoveredStats || selectedWindowStats,
      }}
      footer={
        <InsightMarquee 
          chartInsight="Cumulative growth tracking identifies the long-term compound value of your content periods."
          personalInsight="Watch for periods where Period Delta (Cyan) remains consistent while Total (Pink) curves up."
        />
      }
    >
      <div className="p-4 h-[400px] relative">
        <StableChartFrame minHeightClassName="min-h-[360px]">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 10, bottom: 40, left: 10 }}
            onMouseMove={(state: any) => {
              if (typeof state?.activeTooltipIndex === "number") {
                setHoveredIdx(state.activeTooltipIndex)
              }
            }}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="name" tick={{ fontWeight: 900, fontSize: 10 }} axisLine={{ stroke: '#000', strokeWidth: 3 }} />
            <YAxis yAxisId="left" tick={{ fontWeight: 900, fontSize: 10 }} tickFormatter={(v) => formatMetricValue(activeMetric.value, Number(v || 0))} axisLine={{ stroke: '#000', strokeWidth: 3 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontWeight: 900, fontSize: 10 }} tickFormatter={(v) => formatMetricValue(activeMetric.value, Number(v || 0))} axisLine={{ stroke: '#000', strokeWidth: 3 }} label={{ value: `${activeMetric.label} PROGRESS`, angle: 90, position: 'insideRight', offset: 15, style: { fontWeight: 1000, fontSize: 12, fill: '#000' } }} />
            <Tooltip content={<ChartTip />} />
            <Bar yAxisId="left" dataKey="periodAmount" fill="#00E5FF" radius={[2, 2, 0, 0]} stroke="#000" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="totalProgress" stroke="#FF7497" strokeWidth={5} dot={{ r: 5, fill: "#FF7497", stroke: "#000", strokeWidth: 2 }} activeDot={{ r: 7, stroke: "#000", strokeWidth: 3 }} />
          </ComposedChart>
        </StableChartFrame>

        <div className="absolute bottom-[0px] left-[14px] right-[14px] flex flex-col pointer-events-none">
          <div className="grid grid-cols-3 items-center h-8">
            <div className="flex items-center gap-2 justify-self-end">
              <span className="font-[1000] text-[14px] tracking-tight uppercase">TIME</span>
              <div className="w-[155px] h-6 bg-[#00E5FF] rounded-[2px] border-[2px] border-black" />
            </div>
            <div className="justify-self-center flex items-center gap-3">
              <span className="text-black font-[1000] text-[16px] leading-none">◀</span>
              <span className="uppercase tracking-[0.1em] text-black font-[1000] text-[14px]">
                Channel Growth
              </span>
              <span className="text-black font-[1000] text-[16px] leading-none">▶</span>
            </div>
            <div className="flex items-center gap-2 justify-self-start">
              <div className="relative flex items-center h-6 w-[115px]">
                <div className="absolute left-[2px] right-[2px] top-1/2 -translate-y-1/2 h-2 bg-[#FF7497]" />
                <div className="flex items-center justify-between w-full relative z-10">
                  <div className="w-5 h-5 bg-[#FF7497] border-[3px] rounded-full border-black" />
                  <div className="w-5 h-5 bg-[#FF7497] border-[3px] rounded-full border-black" />
                  <div className="w-5 h-5 bg-[#FF7497] border-[3px] rounded-full border-black" />
                </div>
              </div>
              <span className="font-[1000] text-[14px] tracking-tight uppercase">TOTAL</span>
            </div>
          </div>
        </div>
      </div>
    </SubToolboxChartModule>
  )
}

type TrafficTimelinePoint = {
 bucket: string
 timestamp: number
 totalViews: number
 shares: Record<string, number>
}

type KeywordNode = { keyword: string; value: number }
type HeatmapBin = { dow: number; hour: number; value: number; count: number }
type FunnelStage = { name: string; value: number; tone: "cyan" | "lime" | "yellow" | "pink" | "white" }
type GaugeTuple = { label: string; value: number; target: number; tone: string }
type LissajousPoint = { t: number; x: number; y: number; label: string; value: number }
type OrbitalPoint = { name: string; orbit: number; angle: number; x: number; y: number; value: number; tone: string }

type ExpansionDatasets = {
 trafficTimeline: TrafficTimelinePoint[]
 keywordNodes: KeywordNode[]
 heatmapBins: HeatmapBin[]
 funnelStages: FunnelStage[]
 gauges: GaugeTuple[]
 lissajous: LissajousPoint[]
 orbital: OrbitalPoint[]
 diagnostics: { rows: number; trafficRows: number; missing: string[] }
}

const parseCsvRows = (): Record<string, unknown>[] => {
 try {
  const files = JSON.parse(localStorage.getItem(UPLOAD_CACHE_FILES_KEY) || "[]") as CsvFileWithTag[]
  if (!Array.isArray(files)) return []
  return files.flatMap((f) => (Array.isArray(f?.data) ? (f.data as Record<string, unknown>[]) : []))
 } catch {
  return []
 }
}

const toNum = (v: unknown): number => {
 if (typeof v === "number" && Number.isFinite(v)) return v
 if (typeof v !== "string") return 0
 const cleaned = v.replace(/[$,%\s,]/g, "")
 const n = Number(cleaned)
 return Number.isFinite(n) ? n : 0
}

const csvSourceGroup = (sourceRaw: string): string => {
 const sourceLabels: Record<string, string> = {
  SHORTS: "Shorts Feed",
  SUBSCRIBER: "Subscribers Feed",
  YT_SEARCH: "YouTube Search",
  EXT_URL: "External Websites",
  YT_CHANNEL: "Channel Pages",
  RELATED_VIDEO: "Suggested Videos",
  YT_OTHER_PAGE: "YouTube Features",
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
 const s = sourceRaw.toUpperCase()
 if (s.startsWith("EXT_URL.")) return sourceLabels.EXT_URL
 if (s.startsWith("YT_SEARCH.")) return sourceLabels.YT_SEARCH
 if (s.startsWith("YT_RELATED.")) return sourceLabels.RELATED_VIDEO
 if (s.startsWith("SHORTS_CONTENT_LINKS.")) return sourceLabels.SHORTS_CONTENT_LINKS
 if (sourceLabels[s]) return sourceLabels[s]
 return sourceRaw || "Other"
}

const normalizeTrafficSourceKey = (source: string): string => {
 const prefix = String(source || "").trim().toUpperCase().split(".")[0] || "UNKNOWN"
 return TRAFFIC_SOURCE_ALIASES[prefix] || prefix
}

const trafficSourceDisplayName = (value: string): string => {
 const raw = String(value || "").trim()
 if (!raw) return "Unknown"
 const prefix = normalizeTrafficSourceKey(raw)
 const sourceLabels: Record<string, string> = {
  SHORTS: "Shorts Feed",
  SUBSCRIBER: "Subscribers Feed",
  YT_SEARCH: "YouTube Search",
  EXT_URL: "External Websites",
  YT_CHANNEL: "Channel Pages",
  RELATED_VIDEO: "Suggested Videos",
  YT_OTHER_PAGE: "YouTube Features",
  PLAYLIST: "YouTube Playlists",
  NO_LINK_OTHER: "Direct / Unknown",
  NOTIFICATION: "Notifications",
  SOUND_PAGE: "Audio Pages",
  SHORTS_CONTENT_LINKS: "Shorts Links",
  END_SCREEN: "End Screens",
  HASHTAGS: "Hashtag Pages",
  ADVERTISING: "Advertising",
  LIVE_REDIRECT: "Live Streams",
  BROWSE: "Browse Features",
  CAMPAIGN_CARD: "Campaign Card",
  CARD: "Cards",
  YT_PLAYLIST_PAGE: "Playlist Page",
  NO_LINK_EMBEDDED: "Embedded / Unknown",
  ANNOTATION: "Annotations",
 }
 return sourceLabels[prefix] || raw
}

const TRAFFIC_SOURCE_ALIASES: Record<string, string> = {
 SHORTS_CONTENT_LINK: "SHORTS_CONTENT_LINKS",
 SHORTS_CONTENT_LINKS: "SHORTS_CONTENT_LINKS",
 LIVE_REDIRECT: "LIVE_REDIRECT",
 IMMERSIVE_LIVE: "LIVE_REDIRECT",
 ADVERTISING: "ADVERTISING",
 BROWSE: "BROWSE",
 CAMPAIGN_CARD: "CAMPAIGN_CARD",
 CARD: "CARD",
 YT_PLAYLIST_PAGE: "YT_PLAYLIST_PAGE",
 NO_LINK_EMBEDDED: "NO_LINK_EMBEDDED",
}

const TRAFFIC_SOURCE_ORDER = [
 "SHORTS",
 "SUBSCRIBER",
 "YT_SEARCH",
 "EXT_URL",
 "YT_CHANNEL",
 "RELATED_VIDEO",
 "YT_OTHER_PAGE",
 "PLAYLIST",
 "NO_LINK_OTHER",
 "NOTIFICATION",
 "SOUND_PAGE",
 "SHORTS_CONTENT_LINKS",
 "END_SCREEN",
 "HASHTAGS",
 "ADVERTISING",
 "LIVE_REDIRECT",
 "BROWSE",
 "CAMPAIGN_CARD",
 "CARD",
 "YT_PLAYLIST_PAGE",
 "NO_LINK_EMBEDDED",
] as const

const TRAFFIC_SOURCE_TONES: Record<string, string> = TRAFFIC_SOURCE_ORDER.reduce((acc, key, index) => {
 acc[key] = VT_SPECTRUM_PALETTE_06[index % VT_SPECTRUM_PALETTE_06.length]
 return acc
}, {} as Record<string, string>)

const TRAFFIC_SOURCE_SHORT_LABELS: Record<string, string> = {
 SHORTS: "SHORTS FEED",
 SUBSCRIBER: "SUBSCRIBERS",
 YT_SEARCH: "SEARCH",
 EXT_URL: "EXT. SITES",
 YT_CHANNEL: "CHANNEL",
 RELATED_VIDEO: "SUGGESTED",
 YT_OTHER_PAGE: "OTHER",
 PLAYLIST: "PLAYLISTS",
 NO_LINK_OTHER: "DIRECT",
 NOTIFICATION: "NOTIFICATIONS",
 SOUND_PAGE: "AUDIO",
 SHORTS_CONTENT_LINKS: "SHORTS LINKS",
 END_SCREEN: "END SCREEN",
 HASHTAGS: "HASHTAGS",
 ADVERTISING: "ADVERTISING",
 LIVE_REDIRECT: "LIVE",
 BROWSE: "BROWSE",
 CAMPAIGN_CARD: "CAMPAIGN",
 CARD: "CARDS",
 YT_PLAYLIST_PAGE: "PLAYLIST PAGE",
 NO_LINK_EMBEDDED: "EMBEDDED",
 ANNOTATION: "ANNOTATIONS",
}

const trafficSourceTone = (source: string, fallbackIndex: number): string => {
 const normalized = normalizeTrafficSourceKey(source)
 return TRAFFIC_SOURCE_TONES[normalized] || VT_SPECTRUM_PALETTE_06[fallbackIndex % VT_SPECTRUM_PALETTE_06.length]
}

const trafficSourceSubtitleLabel = (source: string): string => {
 const normalized = normalizeTrafficSourceKey(source)
 return TRAFFIC_SOURCE_SHORT_LABELS[normalized] || trafficSourceDisplayName(source).toUpperCase()
}

const trafficSourceLegendLabel = (source: string): string => {
 const normalized = normalizeTrafficSourceKey(source)
 if (normalized === "YT_OTHER_PAGE") return "YouTube Features"
 return trafficSourceDisplayName(source)
}

const trafficSourceLegendLines = (label: string): string[] => {
 const words = label.trim().split(/\s+/).filter(Boolean)
 if (words.length <= 1) return words
 const splitAt = Math.ceil(words.length / 2)
 return [words.slice(0, splitAt).join(" "), words.slice(splitAt).join(" ")]
}

/**
 * Every traffic source the evolution legend lists, whether or not the current
 * window actually charts it. Order is fixed so a source keeps the same swatch
 * colour and legend slot as the window/format selection changes.
 */
const TRAFFIC_SOURCE_LEGEND_KEYS: readonly string[] = [
 "SHORTS",
 "SUBSCRIBER",
 "YT_SEARCH",
 "YT_CHANNEL",
 "EXT_URL",
 "YT_OTHER_PAGE",
 "RELATED_VIDEO",
 "NOTIFICATION",
 "PLAYLIST",
 "SOUND_PAGE",
 "NO_LINK_OTHER",
 "SHORTS_CONTENT_LINKS",
 "END_SCREEN",
 "HASHTAGS",
 "ANNOTATION",
 "ADVERTISING",
 "LIVE_REDIRECT",
]

/**
 * Timeline rows carry display names ("Shorts Feed"), not registry keys ("SHORTS"),
 * so the canonical lookup has to go through the display label as well.
 */
const TRAFFIC_SOURCE_CANONICAL_BY_DISPLAY: Record<string, string> = TRAFFIC_SOURCE_LEGEND_KEYS.reduce(
 (acc, key) => {
  acc[trafficSourceDisplayName(key).toUpperCase()] = key
  return acc
 },
 {} as Record<string, string>,
)

const trafficSourceCanonicalKey = (source: string): string => {
 const raw = String(source || "").trim().toUpperCase()
 return TRAFFIC_SOURCE_CANONICAL_BY_DISPLAY[raw] || normalizeTrafficSourceKey(source)
}

/** Stack rank drives the colour: rose is the largest/bottom band, then coral, orange, and on down the spectrum. */
const trafficRankTone = (rank: number): string =>
 VT_SPECTRUM_PALETTE_06[rank % VT_SPECTRUM_PALETTE_06.length]

type TrafficPlotOffset = { top?: number; left?: number; width?: number; height?: number }

/**
 * Publishes a rounded clip rect matching the plot area, which `.tse-plot .recharts-area`
 * consumes so the stacked block gets soft corners. Always emits a shape - an unresolved
 * clip-path reference would blank the areas out.
 */
const TrafficPlotClipDefs: React.FC<{ offset?: TrafficPlotOffset }> = ({ offset }) => {
 const width = offset?.width ?? 0
 const height = offset?.height ?? 0
 const measured = width > 0 && height > 0
 return (
  <defs>
   <clipPath id="tse-plot-clip">
    {measured
     ? <rect x={offset?.left ?? 0} y={offset?.top ?? 0} width={width} height={height} rx={7} ry={7} />
     : <rect x={0} y={0} width={100000} height={100000} />}
   </clipPath>
  </defs>
 )
}

const monthBucket = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`

const buildExpansionDatasets = (rows: CanonicalVideoRow[]): ExpansionDatasets => {
 const csvRows = parseCsvRows()
 const missing = new Set<string>()
 if (!rows.length) missing.add("rows")

 const trafficAgg = new Map<string, Map<string, number>>()
 for (const r of csvRows) {
  const source = String(r["Traffic source"] || r["source"] || "").trim()
  if (!source) continue
  const group = csvSourceGroup(source)
  const monthText = String(r["Month"] || r["Date"] || "")
  const ts = monthText ? new Date(monthText) : new Date()
  const bucket = monthBucket(ts)
  const views = toNum(r["Views"])
  if (!trafficAgg.has(bucket)) trafficAgg.set(bucket, new Map())
  const b = trafficAgg.get(bucket)!
  b.set(group, (b.get(group) || 0) + views)
 }

 const fallbackTraffic = new Map<string, Map<string, number>>()
 for (const row of rows) {
  const d = new Date(String(row.uploadDate || ""))
  if (!Number.isFinite(d.getTime())) continue
  const bucket = monthBucket(d)
  const group = String((row as any).insightTrafficSourceType || "All Traffic")
  if (!fallbackTraffic.has(bucket)) fallbackTraffic.set(bucket, new Map())
  const b = fallbackTraffic.get(bucket)!
  b.set(group, (b.get(group) || 0) + mv(row, "views"))
 }

 const trafficSource = trafficAgg.size > 0 ? trafficAgg : fallbackTraffic
 const trafficTimeline: TrafficTimelinePoint[] = Array.from(trafficSource.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([bucket, map]) => {
   const shares: Record<string, number> = {}
   let totalViews = 0
   for (const [k, v] of map.entries()) {
    shares[k] = v
    totalViews += v
   }
   return { bucket, timestamp: new Date(`${bucket}-01`).getTime(), shares, totalViews }
  })

 const keywordNodes = buildKeywordClustersFromMasterRows(rows as unknown as Record<string, unknown>[], "views", {
  minSupport: 2,
  maxKeywords: 24,
 }).map((entry) => ({
  keyword: entry.word,
  value: entry.metrics.views,
 }))

 const heat = new Map<string, HeatmapBin>()
 for (const r of rows) {
  const d = new Date(String(r.uploadDate || ""))
  if (!Number.isFinite(d.getTime())) continue
  const dow = d.getDay()
  const hour = d.getHours()
  const key = `${dow}-${hour}`
  const value = mv(r, "views")
  const prev = heat.get(key) || { dow, hour, value: 0, count: 0 }
  prev.value += value
  prev.count += 1
  heat.set(key, prev)
 }
 const heatmapBins = Array.from(heat.values())

 const totals = rows.reduce(
  (acc, r) => {
   acc.impressions += mv(r, "impressions")
   acc.views += mv(r, "views")
   acc.engaged += mv(r, "engagedViews")
   acc.watch += mv(r, "watchHours")
   acc.subs += mv(r, "subscribersGained")
   return acc
  },
  { impressions: 0, views: 0, engaged: 0, watch: 0, subs: 0 },
 )
 const funnelStages: FunnelStage[] = [
  { name: "Impressions", value: totals.impressions, tone: "cyan" },
  { name: "Views", value: totals.views, tone: "lime" },
  { name: "Engaged", value: totals.engaged, tone: "yellow" },
  { name: "Watch Hrs", value: totals.watch, tone: "pink" },
  { name: "Subscribers", value: totals.subs, tone: "white" },
 ]

 const ctrValues = rows.map((r) => ctrPct(r)).filter((n) => n > 0)
 const avpValues = rows.map((r) => retentionPct(r)).filter((n) => n > 0)
 const gauges: GaugeTuple[] = [
  { label: "CTR", value: ctrValues.length ? ctrValues.reduce((a, b) => a + b, 0) / ctrValues.length : 0, target: 5, tone: "#00E5FF" },
  { label: "RET", value: avpValues.length ? avpValues.reduce((a, b) => a + b, 0) / avpValues.length : 0, target: 75, tone: "#FF7497" },
  { label: "RPM", value: rows.length ? rows.reduce((a, r) => a + mv(r, "rpm"), 0) / rows.length : 0, target: 2, tone: "#CCFF00" },
  { label: "AVD(s)", value: rows.length ? rows.reduce((a, r) => a + mv(r, "avd"), 0) / rows.length : 0, target: 45, tone: "#FFB158" },
 ]

 const lissajous: LissajousPoint[] = rows.slice(0, 120).map((r, i) => {
  const v = mv(r, "views")
  const watch = mv(r, "watchHours")
  const t = i / 10
  return {
   t,
   x: Math.sin(t * 2) * (ctrPct(r) || 1),
   y: Math.cos(t * 3) * (retentionPct(r) || 1),
   label: String(r.title || `Video ${i + 1}`),
   value: v + watch * 100,
  }
 })

 const orbital = keywordNodes.slice(0, 18).map((k, i) => {
  const orbit = 35 + (i % 6) * 22
  const angle = (i / 18) * Math.PI * 2
  return {
   name: k.keyword,
   orbit,
   angle,
   x: Math.cos(angle) * orbit,
   y: Math.sin(angle) * orbit,
   value: k.value,
   tone: COLORS[i % COLORS.length],
  }
 })

 if (trafficTimeline.length === 0) missing.add("traffic_sources")
 if (keywordNodes.length === 0) missing.add("keywords")
 if (heatmapBins.length === 0) missing.add("upload_date")
 if (funnelStages.every((s) => s.value <= 0)) missing.add("funnel_metrics")

 return {
  trafficTimeline,
  keywordNodes,
  heatmapBins,
  funnelStages,
  gauges,
  lissajous,
  orbital,
  diagnostics: { rows: rows.length, trafficRows: csvRows.length, missing: Array.from(missing) },
 }
}

const EmptyState: React.FC<{ missing: string[]; rows: number }> = ({ missing, rows }) => (
 <div className="h-[320px] flex items-center justify-center">
  <div className="border-[3px] border-black rounded-xl bg-white px-5 py-4 shadow-[6px_6px_0px_0px_black] max-w-[520px]">
   <p className="text-[11px] font-black uppercase tracking-[0.15em] text-black/55">Chart diagnostics</p>
   <p className="text-[18px] font-[1000] uppercase mt-1">Missing prerequisites</p>
   <p className="text-[11px] font-black uppercase tracking-[0.1em] text-black/60 mt-2">
    Rows: {rows} · Missing: {missing.join(", ") || "none"}
   </p>
  </div>
 </div>
)

const canonicalTrafficMetric = (row: Record<string, unknown>, key: string): number => {
 const metrics = row.metrics
 if (!metrics || typeof metrics !== "object") return 0
 const raw = (metrics as Record<string, unknown>)[key]
 const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>).value : raw
 return typeof value === "number" && Number.isFinite(value) ? value : 0
}

const canonicalTrafficTimeline = (rows: Array<Record<string, unknown>>) => {
 const summaryRows = rows.filter((row) => row.datasetKind === "traffic_summary")
 const detailRows = rows.filter((row) => row.datasetKind === "traffic_detail")
 const comparableRows = summaryRows.length > 0
  ? summaryRows
  : detailRows.length > 0
   ? detailRows
   : rows.filter((row) => row.datasetKind !== "traffic_playback_location")
 const buckets = new Map<string, Record<string, number>>()
  comparableRows.forEach((row) => {
  const rawDate = String(row.syncedAt || "")
  const bucket = /^\d{4}-\d{2}/.test(rawDate) ? rawDate.slice(0, 7) : "Current"
  const source = trafficSourceDisplayName(
   String(
    row.sourceTitle ||
    row.sourceLabel ||
    row.trafficSourceDetail ||
    row.trafficSourceType ||
    "Unknown",
   ),
  )
  const views = canonicalTrafficMetric(row, "views")
  if (views <= 0) return
  const shares = buckets.get(bucket) || {}
  shares[source] = (shares[source] || 0) + views
  buckets.set(bucket, shares)
 })
 return [...buckets.entries()]
 .sort(([a], [b]) => a.localeCompare(b))
  .map(([bucket, shares]) => ({ bucket, shares }))
}

type TrafficDayPoint = {
 bucket: string
 bucketLabel: string
 timestamp: number
 source: string
 views: number
 engagedViews: number
 watchTime: number
 avgDuration: number
 avgPercentageViewed: number
}

const parseTrafficDayTimestamp = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return 0
 const raw = value.trim()
 if (!raw) return 0
 const direct = new Date(raw).getTime()
 if (Number.isFinite(direct)) return direct
 const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
 if (!m) return 0
 const month = Number(m[1]) - 1
 const day = Number(m[2])
 const year = Number(m[3].length === 2 ? `20${m[3]}` : m[3])
 const ts = new Date(year, month, day).getTime()
 return Number.isFinite(ts) ? ts : 0
}

const formatTrafficDayBucketKey = (timestamp: number): string => {
 const date = new Date(timestamp)
 return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

const formatTrafficDayAxisLabel = (bucket: string | number): string => {
 const parsed = typeof bucket === "number" ? new Date(bucket) : new Date(bucket)
 if (!Number.isFinite(parsed.getTime())) return String(bucket)
 return `${parsed.getMonth() + 1}/${parsed.getDate()}`
}

const TRAFFIC_MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

/** Long-range windows get month sections with week-1..4 subdivisions instead of a dense day scale. */
const TRAFFIC_SECTIONED_AXIS_WINDOWS = new Set<DistributionWindowKey>(["90d", "365d", "lifetime"])

/** Week 1 starts on the 1st (shown as the month dash); weeks 2-4 get the shorter dashes. */
const TRAFFIC_WEEK_START_DAYS = [8, 15, 22]

type TrafficAxisTickKind = "month" | "week" | null

const trafficAxisTickKind = (bucket: string): TrafficAxisTickKind => {
 const parsed = new Date(bucket)
 if (!Number.isFinite(parsed.getTime())) return null
 const day = parsed.getDate()
 if (day === 1) return "month"
 return TRAFFIC_WEEK_START_DAYS.includes(day) ? "week" : null
}

const TrafficSectionedAxisTick: React.FC<{
 x?: number
 y?: number
 payload?: { value?: string }
 index?: number
}> = ({ x = 0, y = 0, payload, index = 0 }) => {
 const bucket = String(payload?.value ?? "")
 const kind = trafficAxisTickKind(bucket)
 // The first visible month sits against the Y axis even when it is not the
 // first data bucket, so use both the tick index and plot position.
 if (!kind || index === 0 || x <= 76) return <g />
 const parsed = new Date(bucket)
 const isMonth = kind === "month"
 return (
  <g transform={`translate(${x},${y})`}>
   {isMonth ? (
    <text x={0} y={-13} textAnchor="middle" fill="#000000" fontSize={13} fontWeight={1000}>
     {TRAFFIC_MONTH_LABELS[parsed.getMonth()]}
    </text>
   ) : null}
  </g>
 )
}

const TrafficPercentAxisTick: React.FC<{
 x?: number
 y?: number
 payload?: { value?: number }
}> = ({ x = 0, y = 0, payload }) => {
 const value = Number(payload?.value)
 if (![25, 50, 75].includes(value)) return <g />
 return (
  <g transform={`translate(${x},${y})`}>
   <text x={8} y={4} textAnchor="start" fill="#000000" fontSize={10} fontWeight={1000}>
    {value}
   </text>
  </g>
 )
}

const normalizeTrafficDayRows = (rows: Array<Record<string, unknown>>): TrafficDayPoint[] =>
 rows
  .map((row) => {
   const timestamp = parseTrafficDayTimestamp(row.day || row.Day || row.date || row.bucket || row.syncedAt)
   if (!timestamp) return null
  const source = trafficSourceDisplayName(
    String(
      row["Traffic Source"] ||
      row.term ||
      row.sourceTitle ||
      row.sourceLabel ||
      row.trafficSourceType ||
      row.insightTrafficSourceType ||
      "Unknown",
    ),
   )
   const views = Number(row.views || row.Views || row.viewCount || row.metricValue || 0)
   if (!Number.isFinite(views) || views <= 0) return null
   return {
    bucket: formatTrafficDayBucketKey(timestamp),
    bucketLabel: formatTrafficDayAxisLabel(timestamp),
    timestamp,
    source,
    views,
    engagedViews: Number(row["Engaged Views"] || row.engagedViews || row.engagedViewCount || 0) || 0,
    watchTime: Number(row["Watch Time"] || row.watchTime || row.estimatedMinutesWatched || 0) || 0,
    avgDuration: Number(row["Average View Duration"] || row.avgDuration || row.averageViewDuration || 0) || 0,
    avgPercentageViewed: Number(row["Average Percentage Viewed (%)"] || row.avgPercentageViewed || row.averageViewPercentage || 0) || 0,
   }
  })
  .filter((row): row is TrafficDayPoint => Boolean(row))

const trafficFormatMatches = (source: string, format: DistributionFormatKey): boolean => {
 if (format === "videos") return true
 const isShort = source.toUpperCase().includes("SHORT")
 return format === "shorts" ? isShort : !isShort
}

const trafficWindowThreshold = (windowKey: DistributionWindowKey): number => {
 if (windowKey === "lifetime") return 0
 const days = Number(windowKey.replace("d", ""))
 return Number.isFinite(days) && days > 0 ? Date.now() - days * 24 * 60 * 60 * 1000 : 0
}

export const TrafficSourceEvolutionModule: React.FC<GChartProps> = ({
 data,
 trafficRows,
 trafficByDay,
 useVideoTrafficFallback = true,
}) => {
 const ds = useMemo(() => buildExpansionDatasets(data), [data])
 const [selectedFormat, setSelectedFormat] = useState<DistributionFormatKey>("videos")
 const [selectedWindow, setSelectedWindow] = useState<DistributionWindowKey>("365d")
 const [hoveredBucketKey, setHoveredBucketKey] = useState<string | null>(null)
 const hoverHostRef = useRef<HTMLDivElement | null>(null)
 const hoverLineRef = useRef<HTMLDivElement | null>(null)
 const hoverLabelRef = useRef<HTMLDivElement | null>(null)
 const hoverFrameRef = useRef<number | null>(null)
 const pendingBucketRef = useRef<string | null>(null)
 const [hoveredSourceKey, setHoveredSourceKey] = useState<string | null>(null)
 useEffect(() => () => {
  if (hoverFrameRef.current !== null) cancelAnimationFrame(hoverFrameRef.current)
 }, [])
 const csvTrafficDayRows = useMemo(() => normalizeTrafficDayRows(parseCsvRows()), [])
 const dayPoints = useMemo(() => normalizeTrafficDayRows(trafficByDay || []), [trafficByDay])
 const trafficDayPoints = dayPoints.length > 0 ? dayPoints : csvTrafficDayRows
 const canonicalTimeline = useMemo(
  () => canonicalTrafficTimeline(trafficRows || []),
  [trafficRows],
 )
 const trafficTimeline = useMemo(() => {
  if (trafficDayPoints.length > 0) {
   const threshold = trafficWindowThreshold(selectedWindow)
   const windowed = trafficDayPoints.filter((row) => !threshold || row.timestamp >= threshold)
   const formatFiltered = windowed.filter((row) => trafficFormatMatches(row.source, selectedFormat))
   const buckets = new Map<string, Record<string, number>>()
   formatFiltered.forEach((row) => {
    const bucket = row.bucket
    const shares = buckets.get(bucket) || {}
    shares[row.source] = (shares[row.source] || 0) + row.views
    buckets.set(bucket, shares)
   })
   return [...buckets.entries()]
   .sort(([a], [b]) => a.localeCompare(b))
    .map(([bucket, shares]) => ({ bucket, shares }))
  }

  if (canonicalTimeline.length > 0) return canonicalTimeline
  return useVideoTrafficFallback ? ds.trafficTimeline : []
 }, [canonicalTimeline, ds.trafficTimeline, selectedFormat, selectedWindow, trafficDayPoints, useVideoTrafficFallback])

 const keys = Array.from(new Set(trafficTimeline.flatMap((t) => Object.keys(t.shares))))
  .map((key) => ({
   key,
   total: trafficTimeline.reduce((sum, bucket) => sum + (bucket.shares[key] || 0), 0),
  }))
 .sort((a, b) => b.total - a.total || a.key.localeCompare(b.key))
  .filter((entry) => entry.total > 0)
  .map((entry) => entry.key)
 const controllerRows = [
  {
   type: "label" as const,
   value: "TRAFFIC SOURCES FOR",
   bgTone: "#000000",
   fgTone: "#CCFF00",
  },
  {
   type: "dropdown" as const,
   value: selectedFormat,
   options: DISTRIBUTION_FORMAT_VALUES.map((value) => ({ value, label: getTrafficSourceFormatLabel(value) })),
   onSelect: (value: string) => setSelectedFormat(value as DistributionFormatKey),
   bgTone: "#FF7497",
   fgTone: "#000000",
  },
  {
   type: "dropdown" as const,
   value: selectedWindow,
   options: DISTRIBUTION_WINDOW_VALUES,
   onSelect: (value: string) =>
    DISTRIBUTION_WINDOW_VALUES.some((option) => option.value === value)
     && setSelectedWindow(value as DistributionWindowKey),
   bgTone: "#FFEA00",
   fgTone: "#000000",
  },
 ]

 const areaData = trafficTimeline.map((t) => {
  const total = Math.max(1, Object.values(t.shares).reduce((a, b) => a + b, 0))
  const out: Record<string, string | number> = { bucket: t.bucket }
  keys.forEach((k) => {
   out[k] = ((t.shares[k] || 0) / total) * 100
  })
  return out
 })
 const windowTotals = trafficTimeline.reduce((acc, bucket) => {
  keys.forEach((key) => {
   acc[key] = (acc[key] || 0) + (bucket.shares[key] || 0)
  })
  return acc
 }, {} as Record<string, number>)
 const visibleKeys = keys.filter((key) => (windowTotals[key] || 0) > 0)
 const visibleSourceMeta = visibleKeys.map((key, index) => ({
  key,
  tone: trafficRankTone(index),
  subtitleLabel: trafficSourceSubtitleLabel(key),
  legendLabel: trafficSourceLegendLabel(key),
 }))
 const useSectionedAxis = TRAFFIC_SECTIONED_AXIS_WINDOWS.has(selectedWindow)
 // The legend is a fixed roster: charted sources first in stack order so swatch
 // colours line up with the bands, then whatever this window did not chart.
 const chartedCanonicalKeys = new Set(visibleKeys.map(trafficSourceCanonicalKey))
 const legendSourceMeta = [
  ...visibleSourceMeta.map((entry) => ({
   key: entry.key,
   tone: entry.tone,
   legendLabel: entry.legendLabel,
   charted: true,
  })),
  ...TRAFFIC_SOURCE_LEGEND_KEYS
   .filter((key) => !chartedCanonicalKeys.has(key))
   .map((key, index) => ({
    key,
    tone: trafficRankTone(visibleSourceMeta.length + index),
    legendLabel: trafficSourceLegendLabel(key),
    charted: false,
   })),
 ]
 const hoveredDateLabel = (bucket: string): string => {
  const parsed = new Date(bucket)
  if (!Number.isFinite(parsed.getTime())) return bucket
  return `${TRAFFIC_MONTH_LABELS[parsed.getMonth()]} ${parsed.getDate()}, ${parsed.getFullYear()}`
 }
 const hoveredBucket = hoveredBucketKey ? trafficTimeline.find((bucket) => bucket.bucket === hoveredBucketKey) || null : null
 const activeSourceTotals = hoveredBucket?.shares || windowTotals
 const activeSourceTotal = Math.max(1, Object.values(activeSourceTotals).reduce((sum, value) => sum + value, 0))
 const activeContextStats = [
  {
   label: hoveredBucket ? "DAY TOTAL" : "WINDOW TOTAL",
   value: formatCompact(activeSourceTotal),
   tone: "white" as any,
   valueTone: "#000000",
   backgroundTone: "#E5E7EB",
   labelText: hoveredBucket ? "DAY TOTAL" : "WINDOW TOTAL",
   lockTone: true,
   compact: true,
  },
  ...visibleSourceMeta.map((entry) => ({
   label: entry.subtitleLabel,
   value: `${(((activeSourceTotals[entry.key] || 0) / activeSourceTotal) * 100).toFixed(0)}%`,
   tone: entry.tone as any,
   valueTone: "#000000",
   backgroundTone: "#E5E7EB",
   labelText: trafficSourceLegendLines(entry.legendLabel).join("\n"),
   labelClassName: "whitespace-pre-line text-center text-[8px] leading-[8px] tracking-[0.03em]",
   minWidth: 84,
   lockTone: true,
   compact: true,
  })),
 ]
 const activeContextTitle = hoveredBucket
  ? `${formatTrafficDayAxisLabel(hoveredBucket.bucket)} • DAY VIEW`
  : `${getDistributionWindowLabel(selectedWindow)} • ${getTrafficSourceFormatLabel(selectedFormat)}`

 /**
  * The indicator is written straight to the DOM rather than re-rendered: a React
  * pass over 17 stacked areas plus the stat strip cannot keep up with the pointer,
  * which is what made the old tooltip cursor lag behind the cursor.
  */
 const moveHoverIndicator = (event: React.MouseEvent<HTMLDivElement>) => {
  const host = hoverHostRef.current
  const line = hoverLineRef.current
  const label = hoverLabelRef.current
  if (!host || !line || !label || areaData.length === 0) return
  const plot = host.querySelector(".recharts-cartesian-grid")
  if (!plot) return
  const hostRect = host.getBoundingClientRect()
  const plotRect = plot.getBoundingClientRect()
  if (plotRect.width <= 0) return

  const pointerX = Math.min(Math.max(event.clientX, plotRect.left), plotRect.right)
  const lineX = pointerX - hostRect.left
  const ratio = (pointerX - plotRect.left) / plotRect.width
  const index = Math.min(areaData.length - 1, Math.max(0, Math.round(ratio * (areaData.length - 1))))
  const bucket = String(areaData[index]?.bucket ?? "")

  line.style.opacity = "1"
  line.style.height = `${plotRect.height}px`
  line.style.top = `${plotRect.top - hostRect.top}px`
  line.style.transform = `translateX(${lineX}px)`

  label.textContent = hoveredDateLabel(bucket)
  label.style.opacity = "1"
  label.style.top = `${plotRect.top - hostRect.top - 14}px`
  const halfLabel = label.offsetWidth / 2
  const labelX = Math.min(Math.max(lineX, halfLabel), Math.max(halfLabel, hostRect.width - halfLabel))
  label.style.transform = `translateX(${labelX}px) translateX(-50%)`

  if (pendingBucketRef.current === bucket) return
  pendingBucketRef.current = bucket
  if (hoverFrameRef.current !== null) return
  hoverFrameRef.current = window.requestAnimationFrame(() => {
   hoverFrameRef.current = null
   setHoveredBucketKey(pendingBucketRef.current)
  })
 }

 const clearHoverIndicator = () => {
  if (hoverLineRef.current) hoverLineRef.current.style.opacity = "0"
  if (hoverLabelRef.current) hoverLabelRef.current.style.opacity = "0"
  if (hoverFrameRef.current !== null) {
   cancelAnimationFrame(hoverFrameRef.current)
   hoverFrameRef.current = null
  }
  pendingBucketRef.current = null
  setHoveredBucketKey(null)
 }

 return (
  <SubToolboxChartModule
   header={{ title: "TRAFFIC SOURCE EVOLUTION", subtitle: "SOURCE MIX OVER TIME", icon: <CustomIcon name="analytics" size={18} />, headerStyle: "subtoolbox" }}
   theme={{ headerBandBg: "#B8FF2C", iconBlockBg: "#24D3FF", shadowColor: "rgba(184,255,44,0.45)" }}
   layout={{ moduleMinHeight: "470px", moduleWidth: "100%" }}
  controllerRows={controllerRows}
   activeContext={{
    title: activeContextTitle,
    stats: activeContextStats,
    bgTone: "#E5E7EB",
    minHeight: 48,
   }}
  >
   <div className="h-full min-h-[470px] w-full overflow-hidden bg-[#090b16]">
    {visibleKeys.length === 0 ? <EmptyState missing={ds.diagnostics.missing} rows={ds.diagnostics.rows} /> : (
     <div className="flex h-full flex-col justify-center gap-2">
      <div className="flex h-[462px] flex-col overflow-hidden bg-[#050814]">
       <div
        ref={hoverHostRef}
        className="relative min-h-0 w-full flex-1"
        onMouseMove={moveHoverIndicator}
        onMouseLeave={clearHoverIndicator}
       >
       <StableChartFrame minHeightClassName="min-h-0">
          <AreaChart
          className="tse-plot"
          data={areaData}
          margin={{ top: 18, right: 0, left: 0, bottom: 0 }}
         >
          <Customized component={TrafficPlotClipDefs} />
          <CartesianGrid
           horizontal
           vertical={false}
           stroke="#000000"
           strokeDasharray=""
          />
          {useSectionedAxis ? (
           <XAxis
            dataKey="bucket"
            interval={0}
            height={30}
            tick={<TrafficSectionedAxisTick />}
            tickLine={false}
            axisLine={false}
           />
          ) : (
           <XAxis
            dataKey="bucket"
            height={30}
            tickFormatter={formatTrafficDayAxisLabel}
            tick={{ fontSize: 10, fontWeight: 1000, fill: "#000000", dy: -8 }}
            axisLine={false}
            tickLine={false}
           />
          )}
          <YAxis
           width={44}
           tickMargin={0}
           tick={<TrafficPercentAxisTick />}
           domain={[0, 100]}
           ticks={[25, 50, 75]}
           allowDataOverflow
           axisLine={false}
           tickLine={false}
          />
          {visibleKeys.map((k, i) => {
           const tone = trafficRankTone(i)
           const isHov = hoveredSourceKey === k
           const anyHov = hoveredSourceKey !== null
           return (
           <Area
            key={k}
            type="monotone"
            dataKey={k}
            stackId="1"
            stroke={tone}
            strokeWidth={isHov ? 2.5 : 1.25}
            fill={tone}
            fillOpacity={anyHov ? (isHov ? 0.99 : 0.52) : 0.94}
            strokeLinejoin="round"
            strokeLinecap="round"
           isAnimationActive={false}
           dot={false}
           activeDot={false}
           style={{
            filter: isHov ? `drop-shadow(0 0 6px ${tone}) drop-shadow(0 0 14px ${tone}99)` : undefined,
            transition: "fill-opacity 180ms ease, stroke-width 180ms ease",
           }}
           onMouseEnter={() => setHoveredSourceKey(k)}
           onMouseLeave={() => setHoveredSourceKey(null)}
           />
           )
          })}
         </AreaChart>
       </StableChartFrame>
        <div
         ref={hoverLineRef}
         aria-hidden="true"
         className="pointer-events-none absolute left-0 top-0 w-px bg-black/50 opacity-0"
        />
        <div
         ref={hoverLabelRef}
         aria-hidden="true"
         className="pointer-events-none absolute left-0 top-0 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.08em] text-white opacity-0"
        />
       </div>
       <div className="shrink-0 select-none bg-black px-2 py-1.5 overflow-x-auto">
        <div className="flex flex-row flex-nowrap items-center justify-between gap-2 min-w-full">
         {legendSourceMeta.map((entry) => (
          <div key={entry.key} className="flex shrink-0 items-center gap-1">
           <span
            className="h-[14px] w-[14px] shrink-0 rounded-[1px] border border-black"
            style={{ background: entry.tone, opacity: entry.charted ? 1 : 0.35 }}
           />
           <span
            className="flex flex-col text-left text-[8px] font-black uppercase leading-[9px] tracking-[0.03em] whitespace-nowrap"
            style={{ color: entry.tone, opacity: entry.charted ? 1 : 0.45 }}
           >
            {trafficSourceLegendLines(entry.legendLabel).map((line, lineIndex) => (
             <span key={`${line}-${lineIndex}`} className="block">{line}</span>
            ))}
           </span>
          </div>
         ))}
        </div>
       </div>
      </div>
     </div>
    )}
   </div>
  </SubToolboxChartModule>
 )
}

export const KeywordTreemapModule: React.FC<GChartProps> = ({ data }) => {
 const ds = useMemo(() => buildExpansionDatasets(data), [data])
 return (
  <SubToolboxChartModule header={{ title: "KEYWORD TREEMAP", subtitle: "TITLE TOKEN REACH WEIGHTING", icon: <CustomIcon name="target" size={18} /> }} theme={{ headerBandBg: "#00E5FF", iconBlockBg: "#FF7497", shadowColor: "rgba(0,229,255,0.45)" }}>
   <div className="min-h-[400px] w-full bg-white p-4 overflow-hidden flex flex-col">{ds.keywordNodes.length === 0 ? <EmptyState missing={ds.diagnostics.missing} rows={ds.diagnostics.rows} /> : (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 h-[340px] overflow-auto border-[3px] border-black rounded-xl p-2 bg-[#f7f7f7]">
     {ds.keywordNodes.map((k, i) => <div key={k.keyword} className="border-[3px] border-black rounded-lg p-2" style={{ background: COLORS[i % COLORS.length], opacity: 0.9 }}><p className="text-[11px] font-black uppercase">{k.keyword}</p><p className="text-[13px] font-[1000]">{formatCompact(k.value)}</p></div>)}
    </div>
   )}</div>
  </SubToolboxChartModule>
 )
}

const KEYWORD_VENN_COLORS = ["#F28CB2", "#73FFFF", "#FFFF80"]
const KEYWORD_VENN_STROKES = [
 "rgba(218, 100, 184, 0.78)",
 "rgba(110, 172, 232, 0.78)",
 "rgba(225, 221, 92, 0.78)",
]
const KEYWORD_VENN_FILLS = ["#F28CB2", "#73FFFF", "#FFFF80"]
const KEYWORD_VENN_OVERLAPS = {
 purple: "#C97DFF",
 orange: "#FFCC8C",
 green: "#CCFF99",
 white: "#FFFFFF",
}

const keywordVennStatTone = (metricKey: KeywordMetricKey): "pink" | "cyan" | "lime" | "yellow" | "white" => {
 if (metricKey === "revenue" || metricKey === "rpm") return "cyan"
 if (metricKey === "averageViewDuration" || metricKey === "averageViewPercentage") return "yellow"
 if (metricKey === "subscribersGained") return "lime"
 if (metricKey === "engagedViews") return "pink"
 return "white"
}

const keywordMetricBadgeLabel = (metricKey: KeywordMetricKey): string => {
 if (metricKey === "averageViewDuration") return "AVG DUR"
 if (metricKey === "averageViewPercentage") return "AVP %"
 if (metricKey === "subscribersGained") return "SUBSCRIBERS"
 if (metricKey === "engagedViews") return "ENGAGED"
 if (metricKey === "impressions") return "IMPRSNS"
 if (metricKey === "revenue") return "REV"
 return getKeywordMetricDefinition(metricKey).label
}

const keywordBadgeStyle = (index: number, active: boolean): React.CSSProperties => ({
 backgroundColor: active ? KEYWORD_VENN_COLORS[index % KEYWORD_VENN_COLORS.length] : "#fff",
 boxShadow: active ? "2px 2px 0 0 #000" : "1px 1px 0 0 rgba(0,0,0,0.18)",
})

const keywordColorIndexForSelection = (selected: string[], keyword: string, fallback = 0): number => {
 const selectedIndex = selected.indexOf(keyword)
 return selectedIndex >= 0 ? selectedIndex : fallback
}

const keywordVennBadge = (label: string, index: number) => (
 <span
  key={`${label}-${index}`}
  className="inline-flex items-center h-5 px-2 border-[2px] border-black rounded-md text-[9px] font-black uppercase tracking-[0.08em]"
  style={{ backgroundColor: KEYWORD_VENN_COLORS[index % KEYWORD_VENN_COLORS.length] }}
 >
  {label}
 </span>
)

const VennDiagramIcon: React.FC<{ width?: number; height?: number; fill?: string; className?: string }> = ({
 width = 16,
 height = 16,
 fill = "currentColor",
 className = "",
}) => (
 <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
  <circle cx="9" cy="12" r="6" fill={fill} fillOpacity="0.5" stroke={fill} strokeWidth="1.5" />
  <circle cx="15" cy="12" r="6" fill={fill} fillOpacity="0.5" stroke={fill} strokeWidth="1.5" />
 </svg>
)

const MenuIcon: React.FC<{ width?: number; height?: number; className?: string }> = ({
 width = 16,
 height = 16,
 className = "",
}) => (
 <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
  <line x1="4" x2="20" y1="12" y2="12" />
  <line x1="4" x2="20" y1="6" y2="6" />
  <line x1="4" x2="20" y1="18" y2="18" />
 </svg>
)

const VennValueLabel: React.FC<{
  x: number
  y: number
  title?: string
  count: number
  metricValue: number
  metricKey: KeywordMetricKey
  small?: boolean
  intersection?: boolean
  opacity?: number
  transition?: string
  colorIndex?: number
}> = ({ x, y, title, count, metricValue, metricKey, small = false, intersection = false, opacity = 1, transition, colorIndex = 0 }) => (
 <g className="venn-label" style={{ transform: `translate(${x}px, ${y}px)`, opacity, transition }}>
  {title ? (
   <foreignObject x={-160} y={small ? -72 : -80} width={320} height={70}>
    <div className="flex h-full w-full items-end justify-center overflow-visible">
     <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      className="pointer-events-none inline-flex items-center h-7 px-3 border-[2px] border-black rounded-md text-[11px] font-black uppercase tracking-[0.06em] whitespace-nowrap"
      style={{ ...keywordBadgeStyle(colorIndex, true), scale: "2", transformOrigin: "center bottom" }}
     >
      {title.length > 18 ? `${title.slice(0, 17)}…` : title}
     </button>
    </div>
   </foreignObject>
  ) : null}
  <text
   x={0}
   y={intersection ? -4 : small ? 10 : 8}
   textAnchor="middle"
   style={{ fontWeight: 1000, fill: "#000" }}
  >
   <tspan style={{ fontSize: small ? 22 : 34 }}>{count}</tspan>
   {intersection ? null : (
    <tspan dx={5} style={{ fontSize: small ? 11 : 15, fontWeight: 800 }}>VIDEOS</tspan>
   )}
  </text>
  <text
   x={0}
   y={intersection ? 18 : small ? 30 : 34}
   textAnchor="middle"
   style={{ fontSize: small ? 12 : 15, fontWeight: 800, fill: "rgba(0,0,0,0.68)" }}
  >
   {intersection
    ? formatKeywordMetricValue(metricKey, metricValue)
    : `${getKeywordMetricDefinition(metricKey).label}: ${formatKeywordMetricValue(metricKey, metricValue)}`}
  </text>
 </g>
)


export const KeywordVennModule: React.FC<GChartProps> = ({ data }) => {
 const vennId = useId()
 const [slots, setSlots] = useState<(string | null)[]>([null, null, null])
 const [replaceIndex, setReplaceIndex] = useState(0)
 const selected = useMemo(() => slots.filter((s): s is string => s !== null), [slots])
 const [pulses, setPulses] = useState<[number, number, number]>([0, 0, 0])
 const prevSlotsRef = useRef<(string | null)[]>([null, null, null])
 useEffect(() => {
  const prev = prevSlotsRef.current
  let changed = false
  const next: [number, number, number] = [...pulses]
  for (let i = 0; i < 3; i++) {
   if (prev[i] !== null && slots[i] !== null && prev[i] !== slots[i]) {
    next[i] += 1
    changed = true
   }
  }
  if (changed) setPulses(next)
  prevSlotsRef.current = slots
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [slots])
 const [metricMode, setMetricMode] = useState<KeywordMetricKey>("views")
 const [rankedByMode, setRankedByMode] = useState<KeywordRankingMode>("average")
 const supportsTotal = keywordMetricSupportsTotal(metricMode)
 useEffect(() => {
  if (!supportsTotal && rankedByMode !== "average") setRankedByMode("average")
 }, [rankedByMode, supportsTotal])

 const ranked = useMemo(
  () =>
   buildKeywordClustersFromMasterRows(
    data as unknown as Record<string, unknown>[],
    metricMode,
    { minSupport: 2, maxKeywords: 50, rankingMode: rankedByMode },
   ),
  [data, metricMode, rankedByMode],
 )
 const summary = useMemo(
  () =>
   buildKeywordSelectionSummary(
    data as unknown as Record<string, unknown>[],
    selected,
    metricMode,
   ),
  [data, selected, metricMode],
 )
 const combinationRows = useMemo(
  () =>
   buildKeywordCombinationStats(
    data as unknown as Record<string, unknown>[],
    selected,
    metricMode,
   ),
  [data, selected, metricMode],
 )
 const topKeywords = ranked.slice(0, 15)
 const rankedKeywords = ranked.slice(0, 10)
 const leaderSignature = `${rankedByMode}:${metricMode}:${ranked.slice(0, 3).map((item) => item.word).join("|")}`
 const leaderSignatureRef = useRef("")
 useEffect(() => {
  if (ranked.length === 0 || leaderSignatureRef.current === leaderSignature) return
  leaderSignatureRef.current = leaderSignature
  setSlots([ranked[0]?.word ?? null, ranked[1]?.word ?? null, ranked[2]?.word ?? null])
  setReplaceIndex(0)
 }, [leaderSignature, ranked])
 const RANKED_BY_COLS = 1
 const rankedByRows = Math.ceil(rankedKeywords.length / RANKED_BY_COLS)
 const rankedByCellBorder = (i: number): string => {
  const col = i % RANKED_BY_COLS
  const row = Math.floor(i / RANKED_BY_COLS)
  return [
   col !== RANKED_BY_COLS - 1 && i !== rankedKeywords.length - 1 ? "border-r-[2px] border-black" : "",
   row !== rankedByRows - 1 ? "border-b-[2px] border-black" : "",
  ].filter(Boolean).join(" ")
 }
 const selectedMetric = getKeywordMetricDefinition(metricMode)
 const a = slots[0] || ""
 const b = slots[1] || ""
 const c = slots[2] || ""
 const singles = combinationRows.filter((item) => item.keywords.length === 1)
 const pairs = combinationRows.filter((item) => item.keywords.length === 2)
 const triple = combinationRows.find((item) => item.keywords.length === 3) || null
 const getPair = (k1: string, k2: string) => k1 && k2 ? pairs.find(item => item.keywords.includes(k1) && item.keywords.includes(k2)) || null : null
 const pairAB = getPair(a, b)
 const pairAC = getPair(a, c)
 const pairBC = getPair(b, c)
 const singleA = a ? singles.find((item) => item.keywords[0] === a) || null : null
 const singleB = b ? singles.find((item) => item.keywords[0] === b) || null : null
 const singleC = c ? singles.find((item) => item.keywords[0] === c) || null : null
 const rankedMax = Math.max(
  1,
  ...rankedKeywords.map((item) => getKeywordRankValue(item, metricMode, rankedByMode)),
 )
 const activeSlots = slots.map((k, i) => k !== null ? i : null).filter(i => i !== null) as number[]
 const activeCount = activeSlots.length
 const vennBox = { w: 760, h: 600 }
 const vennIdleCenter = { x: 380, y: 300 }
 const slotGeom = [
  { cx: vennIdleCenter.x, cy: vennIdleCenter.y, r: 0, opacity: 0, lx: vennIdleCenter.x, ly: vennIdleCenter.y, small: false },
  { cx: vennIdleCenter.x, cy: vennIdleCenter.y, r: 0, opacity: 0, lx: vennIdleCenter.x, ly: vennIdleCenter.y, small: false },
  { cx: vennIdleCenter.x, cy: vennIdleCenter.y, r: 0, opacity: 0, lx: vennIdleCenter.x, ly: vennIdleCenter.y, small: false },
 ]
 if (activeCount === 1) {
  slotGeom[activeSlots[0]] = { cx: 380, cy: 315, r: 245, opacity: 1, lx: 380, ly: 145, small: false }
 } else if (activeCount === 2) {
  slotGeom[activeSlots[0]] = { cx: 222, cy: 300, r: 210, opacity: 1, lx: 120, ly: 480, small: true }
  slotGeom[activeSlots[1]] = { cx: 538, cy: 300, r: 210, opacity: 1, lx: 640, ly: 480, small: true }
 } else if (activeCount === 3) {
  slotGeom[0] = { cx: 380, cy: 205, r: 178, opacity: slots[0] ? 1 : 0, lx: 380, ly: 65, small: true }
  slotGeom[1] = { cx: 255, cy: 405, r: 178, opacity: slots[1] ? 1 : 0, lx: 145, ly: 525, small: true }
  slotGeom[2] = { cx: 505, cy: 405, r: 178, opacity: slots[2] ? 1 : 0, lx: 615, ly: 525, small: true }
 }
 const g0 = slotGeom[0]
 const g1 = slotGeom[1]
 const g2 = slotGeom[2]
 const vennTransition = "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
 const totalBreakdownRow = useMemo(() => {
  if (selected.length === 0) return null
  const selectedSingles = selected
   .map((keyword) => singles.find((item) => item.keywords[0] === keyword) || null)
   .filter(Boolean) as typeof singles
  if (selectedSingles.length === 0) return null
  const aggregation = selectedMetric.aggregation
  const totalMetricValue =
   aggregation === "sum"
    ? selectedSingles.reduce((sum, item) => sum + item.metricValue, 0)
    : selectedSingles.reduce((sum, item) => sum + item.metricValue, 0) / selectedSingles.length
  return {
   keywords: [...selected],
   videoCount: selectedSingles.reduce((sum, item) => sum + item.videoCount, 0),
   metricValue: totalMetricValue,
  }
 }, [selected, singles, selectedMetric.aggregation])
 const breakdownRows = useMemo(() => {
  const sortedPairs = [...pairs].sort((left, right) => {
   const leftLength = left.keywords.join("").length
   const rightLength = right.keywords.join("").length
   if (rightLength !== leftLength) return rightLength - leftLength
   return left.keywords.join("|").localeCompare(right.keywords.join("|"))
  })
  const sortedSingles = [...singles].sort((left, right) => {
   const leftWord = left.keywords[0] || ""
   const rightWord = right.keywords[0] || ""
   if (rightWord.length !== leftWord.length) return rightWord.length - leftWord.length
   return leftWord.localeCompare(rightWord)
  })
  return [
   ...(totalBreakdownRow ? [{ kind: "total" as const, key: `total:${selected.join("|")}`, ...totalBreakdownRow }] : []),
   ...(triple ? [{ kind: "triple" as const, key: `triple:${triple.keywords.join("|")}`, ...triple }] : []),
   ...sortedPairs.map((row) => ({ kind: "pair" as const, key: `pair:${row.keywords.join("|")}`, ...row })),
   ...sortedSingles.map((row) => ({ kind: "single" as const, key: `single:${row.keywords.join("|")}`, ...row })),
  ]
 }, [pairs, singles, totalBreakdownRow, triple])
 const visibleBreakdownRows = selected.length > 0 ? breakdownRows : []
 const breakdownSelectionKey = selected.length > 0 ? selected.join("|") : "empty"
 const toggle = (keyword: string) => {
  const index = slots.indexOf(keyword)
  if (index !== -1) {
   const next = [...slots]
   next[index] = null
   setSlots(next)
  } else {
   const emptyIndex = slots.indexOf(null)
   if (emptyIndex !== -1) {
    const next = [...slots]
    next[emptyIndex] = keyword
    setSlots(next)
    setReplaceIndex((emptyIndex + 1) % 3)
   } else {
    const next = [...slots]
    next[replaceIndex] = keyword
    setSlots(next)
    setReplaceIndex((replaceIndex + 1) % 3)
   }
  }
 }

 const top10Videos = useMemo(() => {
  if (selected.length === 0) return []
  const allVideos = buildKeywordVideoRows(data as unknown as Record<string, unknown>[])
  const matched = allVideos.filter(v => selected.every(k => v.keywords.includes(k)))
  return matched.sort((a, b) => b.metrics[metricMode] - a.metrics[metricMode]).slice(0, 10)
 }, [data, selected, metricMode])

 const RANKED_STAT_DEFS: [KeywordMetricKey, string][] = [
  ["views", "VIEWS"],
  ["engagedViews", "ENG"],
  ["subscribersGained", "SUBSCRIBERS"],
  ["likes", "LIKES"],
  ["comments", "CMNTS"],
  ["shares", "SHARE"],
  ["revenue", "REV"],
  ["averageViewDuration", "AVD"],
  ["averageViewPercentage", "AVP"],
  ["rpm", "RPM"],
 ]

 const renderRankedItem = (item: (typeof ranked)[number], extraClassName = "") => {
  const activeIndex = selected.indexOf(item.word)
  const active = activeIndex >= 0
  const badgeColorIndex = keywordColorIndexForSelection(selected, item.word, item.rank - 1)
  const activeColor = KEYWORD_VENN_COLORS[badgeColorIndex % KEYWORD_VENN_COLORS.length]

  const cellBorder = (i: number) =>
   [
    i % 5 !== 4 ? "border-r-[2px] border-black" : "",
    Math.floor(i / 5) < 1 ? "border-b-[2px] border-black" : "",
   ].filter(Boolean).join(" ")

  const formatRankedStatValue = (key: KeywordMetricKey, value: number): string => {
   if (key === "averageViewPercentage") {
    return `${Math.round(Number.isFinite(value) ? value : 0)}%`
   }
   const base = formatKeywordMetricValue(key, value)
   if (key === "revenue" || key === "rpm") {
    return base.replace(/^\$0\./, "$.")
   }
   return base
  }

  return (
   <div
    key={item.word}
    className={`self-start p-1 flex flex-col gap-1 ${extraClassName}`}
    style={{ background: active ? `${activeColor}30` : "#fff" }}
   >
    <button
     type="button"
     onClick={() => toggle(item.word)}
     title={`${item.videoCount} videos · ${item.coveragePct.toFixed(1)}% coverage`}
     className="flex min-h-7 items-center justify-between gap-2 border-[2px] border-black rounded-md px-2 text-left"
     style={{ background: active ? activeColor : "#F6F6F6" }}
    >
     <span className="min-w-0 truncate text-[14px] font-[1000] uppercase text-black">{item.word}</span>
     <span className="shrink-0 text-[11px] font-[1000] uppercase text-black/70">{item.videoCount} {item.videoCount === 1 ? "VIDEO" : "VIDEOS"}</span>
    </button>
    <div className="grid grid-cols-5 border-[2px] border-black rounded-md overflow-hidden bg-white">
     {RANKED_STAT_DEFS.map(([key, label], i) => (
      <div key={key} className={`flex min-w-0 flex-col items-center justify-center px-1 py-0.5 ${cellBorder(i)}`}>
       <span className="text-[7px] font-black uppercase opacity-50">{label}</span>
       <span className="max-w-full truncate text-[10px] font-[1000]">
        {formatRankedStatValue(key, getKeywordRankValue(item, key, rankedByMode))}
       </span>
      </div>
     ))}
    </div>

    <div className="h-3 rounded-full border border-black bg-black/10 overflow-hidden">
     <div
      className="h-full"
      style={{
       width: `${(getKeywordRankValue(item, metricMode, rankedByMode) / rankedMax) * 100}%`,
       background: active ? activeColor : "#000",
      }}
     />
    </div>
   </div>
  )
 }

 return (
  <SubToolboxChartModule
   header={{
    title: "KEYWORD VENN",
    subtitle: "MASTER TABLE TITLE OVERLAP × LIVE PERFORMANCE STATS",
    icon: <CustomIcon name="analytics" size={18} />,
    headerStyle: "subtoolbox",
   }}
   theme={{
    headerBandBg: "#CCFF00",
    iconBlockBg: "#FF7497",
    shadowColor: "rgba(204,255,0,0.45)",
   }}
   layout={{ moduleMinHeight: "820px", moduleWidth: "100%" }}
   controllerRows={[
    { type: "label", value: "TOP PERFORMING", bgTone: "#FF7497" },
    { type: "label", value: "TITLE KEYWORDS", bgTone: "#FFFFFF" },
    {
     type: "custom",
     render: () => (
      <div className="grid h-full grid-cols-[44px_1fr_1fr_minmax(112px,1.35fr)] bg-white">
       <span className="flex items-center justify-center border-r-[3px] border-black bg-black text-[10px] font-black uppercase text-white">
        By
       </span>
       <button
        type="button"
        aria-pressed={rankedByMode === "average"}
        onClick={() => setRankedByMode("average")}
        className={`border-0 border-r-[3px] border-black text-[10px] font-black uppercase ${rankedByMode === "average" ? "bg-[#CCFF00]" : "bg-white"}`}
       >
        Average
       </button>
       <button
        type="button"
        aria-pressed={rankedByMode === "total"}
        aria-disabled={!supportsTotal}
        disabled={!supportsTotal}
        onClick={() => setRankedByMode("total")}
        className={`border-0 border-r-[3px] border-black text-[10px] font-black uppercase disabled:cursor-not-allowed disabled:bg-[#E5E5E5] disabled:text-black/40 ${rankedByMode === "total" ? "bg-[#CCFF00]" : "bg-white"}`}
       >
        Total
       </button>
       <select
        aria-label="Rank title keywords by metric"
        value={metricMode}
        onChange={(event) => setMetricMode(event.target.value as KeywordMetricKey)}
        className="min-w-0 appearance-none border-0 bg-[#FFE357] px-2 text-center text-[10px] font-black uppercase"
       >
        {KEYWORD_VENN_METRIC_OPTIONS.map((option) => (
         <option key={option} value={option}>{getKeywordMetricDefinition(option).label}</option>
        ))}
       </select>
      </div>
     ),
    },
   ]}
   activeContext={{
    title:
     selected.length > 0
      ? `${selected.join(" + ").toUpperCase()}`
      : "SELECT UP TO 3 KEYWORDS FROM THE MASTER VIDEO TABLE",
    stats: summary
     ? [
        { label: "Videos", value: String(summary.videoCount), tone: "white" },
        {
         label: keywordMetricBadgeLabel(metricMode),
         value: formatKeywordMetricValue(metricMode, summary.metricValue),
         tone: keywordVennStatTone(metricMode),
        },
       ]
     : [
        { label: "Videos", value: String(data.filter((row) => String(row.title || "").trim()).length), tone: "white" },
       ],
   }}
   footer={
    <InsightMarquee
     mode="insight-lock"
     segments={[
      {
       badge: "Chart",
       text: "Keyword venn pulls only from titles in the loaded master video table and updates live with the selected statistic.",
       badgeTone: "cyan",
      },
      {
       badge: "Action",
       text:
        selected.length > 0 && summary
         ? `${selected.join(" + ")} maps to ${summary.videoCount} videos and ${selectedMetric.label.toLowerCase()} ${formatKeywordMetricValue(metricMode, summary.metricValue)}.`
         : "Select up to 3 recurring title keywords to compare individual and overlap performance.",
       badgeTone: "lime",
      },
     ]}
    />
   }
  >
   <div className="w-full bg-white p-2 flex flex-col">
    {topKeywords.length === 0 ? (
     <EmptyState missing={["keywords", "title_rows"]} rows={data.length} />
    ) : (
     <div className="flex flex-col gap-2">
     <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_430px] gap-2 items-stretch">
      <div className="flex min-w-0 flex-col gap-2">

      {/* 1. VENN CIRCLE + TOP KEYWORDS FOOTER */}
      <div className="border-[3px] border-black rounded-xl bg-[#FAFAFA] overflow-hidden flex flex-col flex-1 min-h-[320px]">
       <div className="flex items-center justify-center flex-1 min-h-[300px]">
       <svg
        viewBox={`0 0 ${vennBox.w} ${vennBox.h}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        className="block h-auto w-full max-w-[760px]"
        style={{ aspectRatio: `${vennBox.w} / ${vennBox.h}`, minHeight: "280px" }}
       >
        <style>{`
         @keyframes kvPulseRing {
          0% { opacity: 0.85; transform: scale(0.88); }
          100% { opacity: 0; transform: scale(1.2); }
         }
        `}</style>
        <defs>
         <clipPath id={`${vennId}-clip-0`}>
          <circle cx={g0.cx} cy={g0.cy} r={g0.r} style={{ transition: vennTransition }} />
         </clipPath>
         <clipPath id={`${vennId}-clip-1`}>
          <circle cx={g1.cx} cy={g1.cy} r={g1.r} style={{ transition: vennTransition }} />
         </clipPath>
         <clipPath id={`${vennId}-clip-2`}>
          <circle cx={g2.cx} cy={g2.cy} r={g2.r} style={{ transition: vennTransition }} />
         </clipPath>
        </defs>
        {selected.length === 0 ? (
         <>
          <text x="380" y="290" textAnchor="middle" style={{ fontWeight: 1000, fontSize: 30, fill: "rgba(0,0,0,0.28)" }}>
           SELECT UP TO 3 KEYWORDS
          </text>
          <text x="380" y="326" textAnchor="middle" style={{ fontWeight: 800, fontSize: 14, fill: "rgba(0,0,0,0.34)" }}>
           Data is derived from titles in the loaded master video table.
          </text>
        </>
        ) : null}

        {/* Base Circles */}
        <circle cx={g0.cx} cy={g0.cy} r={g0.r} fill={KEYWORD_VENN_FILLS[0]} stroke={KEYWORD_VENN_STROKES[0]} strokeWidth={g0.r > 0 ? 5 : 0} opacity={g0.opacity} style={{ transition: vennTransition }} />
        <circle cx={g1.cx} cy={g1.cy} r={g1.r} fill={KEYWORD_VENN_FILLS[1]} stroke={KEYWORD_VENN_STROKES[1]} strokeWidth={g1.r > 0 ? 5 : 0} opacity={g1.opacity} style={{ transition: vennTransition }} />
        <circle cx={g2.cx} cy={g2.cy} r={g2.r} fill={KEYWORD_VENN_FILLS[2]} stroke={KEYWORD_VENN_STROKES[2]} strokeWidth={g2.r > 0 ? 5 : 0} opacity={g2.opacity} style={{ transition: vennTransition }} />

        {/* Overlaps */}
        <g clipPath={`url(#${vennId}-clip-0)`} opacity={Math.min(g0.opacity, g1.opacity)} style={{ transition: vennTransition }}>
          <circle cx={g1.cx} cy={g1.cy} r={g1.r} fill={KEYWORD_VENN_OVERLAPS.purple} style={{ transition: vennTransition }} />
        </g>
        <g clipPath={`url(#${vennId}-clip-0)`} opacity={Math.min(g0.opacity, g2.opacity)} style={{ transition: vennTransition }}>
          <circle cx={g2.cx} cy={g2.cy} r={g2.r} fill={KEYWORD_VENN_OVERLAPS.orange} style={{ transition: vennTransition }} />
        </g>
        <g clipPath={`url(#${vennId}-clip-1)`} opacity={Math.min(g1.opacity, g2.opacity)} style={{ transition: vennTransition }}>
          <circle cx={g2.cx} cy={g2.cy} r={g2.r} fill={KEYWORD_VENN_OVERLAPS.green} style={{ transition: vennTransition }} />
        </g>
        <g clipPath={`url(#${vennId}-clip-0)`} opacity={Math.min(g0.opacity, g1.opacity, g2.opacity)} style={{ transition: vennTransition }}>
          <g clipPath={`url(#${vennId}-clip-1)`}>
            <circle cx={g2.cx} cy={g2.cy} r={g2.r} fill={KEYWORD_VENN_OVERLAPS.white} style={{ transition: vennTransition }} />
          </g>
        </g>

        {/* Borders overlay so intersections don't hide the strokes */}
        <circle cx={g0.cx} cy={g0.cy} r={g0.r} fill="none" stroke={KEYWORD_VENN_STROKES[0]} strokeWidth={g0.r > 0 ? 5 : 0} opacity={g0.opacity} style={{ transition: vennTransition }} />
        <circle cx={g1.cx} cy={g1.cy} r={g1.r} fill="none" stroke={KEYWORD_VENN_STROKES[1]} strokeWidth={g1.r > 0 ? 5 : 0} opacity={g1.opacity} style={{ transition: vennTransition }} />
        <circle cx={g2.cx} cy={g2.cy} r={g2.r} fill="none" stroke={KEYWORD_VENN_STROKES[2]} strokeWidth={g2.r > 0 ? 5 : 0} opacity={g2.opacity} style={{ transition: vennTransition }} />

        {/* Swap pulse rings — flash when a slot's keyword changes while the circle stays in place */}
        <circle
         key={`pulse-0-${pulses[0]}`}
         cx={g0.cx}
         cy={g0.cy}
         r={g0.r}
         fill="none"
         stroke="#ffffff"
         strokeWidth={10}
         style={{
          transformBox: "fill-box",
          transformOrigin: "center",
          opacity: pulses[0] > 0 ? undefined : 0,
          animation: pulses[0] > 0 ? "kvPulseRing 0.5s ease-out forwards" : undefined,
         }}
        />
        <circle
         key={`pulse-1-${pulses[1]}`}
         cx={g1.cx}
         cy={g1.cy}
         r={g1.r}
         fill="none"
         stroke="#ffffff"
         strokeWidth={10}
         style={{
          transformBox: "fill-box",
          transformOrigin: "center",
          opacity: pulses[1] > 0 ? undefined : 0,
          animation: pulses[1] > 0 ? "kvPulseRing 0.5s ease-out forwards" : undefined,
         }}
        />
        <circle
         key={`pulse-2-${pulses[2]}`}
         cx={g2.cx}
         cy={g2.cy}
         r={g2.r}
         fill="none"
         stroke="#ffffff"
         strokeWidth={10}
         style={{
          transformBox: "fill-box",
          transformOrigin: "center",
          opacity: pulses[2] > 0 ? undefined : 0,
          animation: pulses[2] > 0 ? "kvPulseRing 0.5s ease-out forwards" : undefined,
         }}
        />

        {/* Single labels */}
        {singleA ? <VennValueLabel x={g0.lx} y={g0.ly} title={a.toUpperCase()} count={singleA.videoCount} metricValue={singleA.metricValue} metricKey={metricMode} small={g0.small} opacity={g0.opacity} transition={vennTransition} colorIndex={0} /> : null}
        {singleB ? <VennValueLabel x={g1.lx} y={g1.ly} title={b.toUpperCase()} count={singleB.videoCount} metricValue={singleB.metricValue} metricKey={metricMode} small={g1.small} opacity={g1.opacity} transition={vennTransition} colorIndex={1} /> : null}
        {singleC ? <VennValueLabel x={g2.lx} y={g2.ly} title={c.toUpperCase()} count={singleC.videoCount} metricValue={singleC.metricValue} metricKey={metricMode} small={g2.small} opacity={g2.opacity} transition={vennTransition} colorIndex={2} /> : null}

        {/* Pair labels */}
        {pairAB ? (
         <VennValueLabel
          x={(g0.cx + g1.cx) / 2}
          y={(g0.cy + g1.cy) / 2}
          count={pairAB.videoCount}
          metricValue={pairAB.metricValue}
          metricKey={metricMode}
          small
          intersection
          opacity={Math.min(g0.opacity, g1.opacity)}
          transition={vennTransition}
         />
        ) : null}
        {pairAC ? (
         <VennValueLabel
          x={(g0.cx + g2.cx) / 2}
          y={(g0.cy + g2.cy) / 2}
          count={pairAC.videoCount}
          metricValue={pairAC.metricValue}
          metricKey={metricMode}
          small
          intersection
          opacity={Math.min(g0.opacity, g2.opacity)}
          transition={vennTransition}
         />
        ) : null}
        {pairBC ? (
         <VennValueLabel
          x={(g1.cx + g2.cx) / 2}
          y={(g1.cy + g2.cy) / 2}
          count={pairBC.videoCount}
          metricValue={pairBC.metricValue}
          metricKey={metricMode}
          small
          intersection
          opacity={Math.min(g1.opacity, g2.opacity)}
          transition={vennTransition}
         />
        ) : null}
        {triple ? (
         <VennValueLabel
          x={(g0.cx + g1.cx + g2.cx) / 3}
          y={(g0.cy + g1.cy + g2.cy) / 3}
          count={triple.videoCount}
          metricValue={triple.metricValue}
          metricKey={metricMode}
          small
          intersection
          opacity={Math.min(g0.opacity, g1.opacity, g2.opacity)}
          transition={vennTransition}
         />
        ) : null}
       </svg>
       </div>

       {/* Top Keywords footer row, attached to the canvas */}
       <div className="border-t-[3px] border-black bg-white px-3 py-2 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5">
         <span className="text-[10px] font-black uppercase tracking-[0.12em] mr-1 shrink-0">
          Top Keywords - Click To Select
         </span>
         {topKeywords.map((item) => {
          const activeIndex = selected.indexOf(item.word)
          const active = activeIndex >= 0
         return (
           <button
            key={item.word}
            onClick={() => toggle(item.word)}
            className="inline-flex items-center h-7 px-3 border-[2px] border-black rounded-md text-[11px] font-black uppercase tracking-[0.06em]"
            style={keywordBadgeStyle(keywordColorIndexForSelection(selected, item.word, item.rank - 1), active)}
           >
            {item.word}
           </button>
          )
         })}
         <button
          onClick={() => setSlots([null, null, null])}
          className="h-6 px-2.5 border-[2px] border-black rounded-md bg-white text-[10px] font-black uppercase tracking-[0.12em] ml-auto shrink-0"
         >
          Clear
         </button>
        </div>
       </div>
      </div>

      {/* Combination Breakdown + Top 10 Videos */}
      <div className="grid min-w-0 grid-cols-1 gap-2 md:grid-cols-2">

      {/* Combination Breakdown */}
      <div className="shrink-0">
       <div className="border-[3px] border-black rounded-xl overflow-hidden bg-white flex flex-col">
        <div className="bg-[#E9FF93] text-black px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] border-b-[3px] border-black shrink-0">
         Combination Breakdown
        </div>
        <div key={breakdownSelectionKey} className="divide-y-[1.5px] divide-black bg-white">
         {visibleBreakdownRows.length === 0 ? (
          <div className="px-3 py-2 text-[10px] font-black uppercase opacity-60">
           Select up to 3 keywords to see single and overlap performance.
          </div>
         ) : (
          visibleBreakdownRows.map((row) => {
           const badgeItems: Array<{ key: string; node: React.ReactNode }> =
            row.kind === "total"
             ? [
                { key: "total-pill", node: (
                   <span className="inline-flex items-center h-5 px-2 border-[2px] border-black rounded-md text-[9px] font-black uppercase tracking-[0.08em] bg-white">
                    Total
                   </span>
                  ) },
                ...row.keywords.map((keyword, index) => ({
                 key: `kw-${keyword}`,
                 node: keywordVennBadge(keyword.toUpperCase(), keywordColorIndexForSelection(selected, keyword, index)),
                })),
               ]
             : row.keywords.map((keyword, index) => ({
                key: `kw-${keyword}`,
                node: keywordVennBadge(keyword.toUpperCase(), keywordColorIndexForSelection(selected, keyword, index)),
               }))
           const splitAt = Math.ceil(badgeItems.length / 2)
           const badgeRow1 = badgeItems.slice(0, splitAt)
           const badgeRow2 = badgeItems.slice(splitAt)

           return (
           <div
            key={row.key}
            className="px-3 py-2 flex items-start justify-between gap-2"
            style={{
             background:
              row.kind === "total"
               ? "rgba(255,216,230,0.5)"
               :
              row.keywords.length === 1
               ? "rgba(255,255,255,1)"
               : row.keywords.length === 2
               ? "rgba(0,0,0,0.04)"
               : "rgba(177,74,237,0.12)",
            }}
           >
            <div className="flex flex-col gap-1 min-w-0 flex-1">
             <div className="flex items-center gap-1 min-h-[20px]">{badgeRow1.map((b) => <React.Fragment key={b.key}>{b.node}</React.Fragment>)}</div>
             <div className="flex items-center gap-1 min-h-[20px]">{badgeRow2.map((b) => <React.Fragment key={b.key}>{b.node}</React.Fragment>)}</div>
            </div>
            <div className="shrink-0 flex flex-col gap-0.5 justify-center text-right whitespace-nowrap">
             <div className="text-[10px] font-black uppercase">{row.videoCount} videos</div>
             <div className="text-[10px] font-black uppercase">
              {row.kind === "total" ? "Total" : selectedMetric.label}: {formatKeywordMetricValue(metricMode, row.metricValue)}
             </div>
            </div>
           </div>
           )
          })
         )}
        </div>
       </div>

      </div>

      {/* Top 10 Videos */}
      <div className="border-[3px] border-black rounded-xl overflow-hidden bg-white flex flex-col flex-1">
       <div className="bg-[#FFD8E6] text-black px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] border-b-[3px] border-black shrink-0 truncate">
        Top 10 Videos {selected.length > 0 ? `Matching: ${selected.join(" + ").toUpperCase()}` : ""} — Ranked By {selectedMetric.label}
       </div>
       <div className="flex flex-col divide-y-[1.5px] divide-black flex-1">
        {top10Videos.length === 0 ? (
         <div className="px-3 py-4 text-[10px] font-black uppercase opacity-60 text-center">
          {selected.length === 0 ? "Select keywords to view top videos" : "No videos found for this combination"}
         </div>
        ) : (
         top10Videos.map((video, idx) => (
          <div key={video.rowId} title={video.title} className="px-3 py-1.5 flex items-center gap-2 bg-white">
           <div className="w-5 h-5 shrink-0 rounded-full border-[2px] border-black bg-[#CCFF00] flex items-center justify-center text-[9px] font-black">
            {idx + 1}
           </div>
           <div className="flex-1 min-w-0 overflow-hidden whitespace-nowrap text-ellipsis text-[10px] font-black uppercase tracking-[0.03em] text-black leading-normal">
            {(() => {
             if (selected.length === 0) return video.title;
             const sorted = [...selected].sort((a, b) => b.length - a.length);
             const regex = new RegExp(`\\b(${sorted.map(k => k.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')).join("|")})\\b`, 'gi');
             const parts = video.title.split(regex);
             return parts.map((part, i) => {
              const lower = part.toLowerCase();
              const matchIndex = selected.indexOf(lower);
              if (matchIndex >= 0) {
               const badgeColorIndex = keywordColorIndexForSelection(selected, lower, matchIndex);
               return (
                <span
                 key={i}
                 className="inline-flex items-center mx-0.5 align-middle h-[15px] px-1.5 rounded text-[9.5px] font-black uppercase tracking-[0.03em]"
                 style={{ background: KEYWORD_VENN_COLORS[badgeColorIndex % KEYWORD_VENN_COLORS.length] }}
                >
                 {part.toUpperCase()}
                </span>
               );
              }
              return <span key={i}>{part}</span>;
             });
            })()}
           </div>
           <div className="shrink-0 text-right whitespace-nowrap leading-tight">
            <p className="text-[12px] font-[1000]">{formatKeywordMetricValue(metricMode, video.metrics[metricMode])}</p>
            <p className="text-[8px] font-black uppercase opacity-60">{selectedMetric.label}</p>
           </div>
          </div>
         ))
        )}
       </div>
      </div>

      </div>
      </div>

     {/* RANKED BY — full-height right rail */}
     <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border-[3px] border-black bg-white">
      <div className="flex items-center justify-between border-b-[3px] border-black bg-[#FFD8E6] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black">
       <span>Ranked By {rankedByMode} {selectedMetric.label}</span>
       <span>{rankedKeywords.length} leaders</span>
      </div>
      <div className="grid grid-cols-1 auto-rows-max content-start items-start">
       {rankedKeywords.map((item, i) => renderRankedItem(item, rankedByCellBorder(i)))}
      </div>
     </div>

     </div>

     </div>
    )}
   </div>
  </SubToolboxChartModule>
 )
}

export const UploadTimeHeatmapModule: React.FC<GChartProps> = ({ data }) => {
 const ds = useMemo(() => buildExpansionDatasets(data), [data])
 const max = Math.max(1, ...ds.heatmapBins.map((bin) => bin.value))

 return (
  <SubToolboxChartModule
   header={{ title: "UPLOAD TIME HEATMAP", subtitle: "WEEKDAY × HOUR DENSITY", icon: <CustomIcon name="calendar" size={18} /> }}
   theme={{ headerBandBg: "#FFEA00", iconBlockBg: "#24D3FF", shadowColor: "rgba(255,234,0,0.45)" }}>
   <div className="min-h-[400px] w-full bg-white p-4 overflow-hidden flex flex-col">
    {ds.heatmapBins.length === 0 ? (
     <EmptyState missing={ds.diagnostics.missing} rows={ds.diagnostics.rows} />
    ) : (
     <div className="grid grid-cols-24 gap-1 border-[3px] border-black rounded-xl p-2 bg-[#f7f7f7] h-[340px] overflow-auto">
      {Array.from({ length: 7 * 24 }).map((_, index) => {
       const dow = Math.floor(index / 24)
       const hour = index % 24
       const cell = ds.heatmapBins.find((bin) => bin.dow === dow && bin.hour === hour)
       const value = cell?.value || 0
       const alpha = value / max

       return (
        <div
         key={index}
         className="h-4 border border-black/20 rounded-[2px]"
         title={`D${dow} ${hour}:00 — ${formatCompact(value)}`}
         style={{ background: `rgba(0,229,255,${Math.max(0.08, alpha)})` }}
        />
       )
      })}
     </div>
    )}
   </div>
  </SubToolboxChartModule>
 )
}

export const ConversionFunnelModule: React.FC<GChartProps> = ({ data }) => {
 const ds = useMemo(() => buildExpansionDatasets(data), [data])

 return (
  <SubToolboxChartModule
   header={{ title: "CONVERSION FUNNEL", subtitle: "IMPRESSIONS TO SUBSCRIBERS", icon: <CustomIcon name="target" size={18} /> }}
   theme={{ headerBandBg: "#CCFF00", iconBlockBg: "#FF82B0", shadowColor: "rgba(204,255,0,0.45)" }}>
   <div className="min-h-[400px] w-full bg-white p-4 overflow-hidden flex flex-col">
    {ds.funnelStages.every((stage) => stage.value <= 0) ? (
     <EmptyState missing={ds.diagnostics.missing} rows={ds.diagnostics.rows} />
    ) : (
     <div className="h-[340px] border-[3px] border-black rounded-xl bg-[#f5f5f0] p-2 overflow-hidden">
      <StableChartFrame minHeightClassName="min-h-[300px]">
        <BarChart data={ds.funnelStages} layout="vertical" margin={{ left: 20, right: 20 }}>
         <CartesianGrid strokeDasharray="3 3" />
         <XAxis type="number" tick={{ fontWeight: 900, fontSize: 10 }} />
         <YAxis type="category" dataKey="name" tick={{ fontWeight: 900, fontSize: 10 }} width={92} />
         <Tooltip content={<ChartTip />} />
         <Bar dataKey="value">
          {ds.funnelStages.map((stage, index) => <Cell key={stage.name} fill={COLORS[index % COLORS.length]} />)}
         </Bar>
        </BarChart>
      </StableChartFrame>
     </div>
    )}
   </div>
  </SubToolboxChartModule>
 )
}

export const PerformanceGaugesModule: React.FC<GChartProps> = ({ data }) => {
 const ds = useMemo(() => buildExpansionDatasets(data), [data])

 return (
  <SubToolboxChartModule
   header={{ title: "PERFORMANCE GAUGES", subtitle: "CORE HEALTH SNAPSHOT", icon: <CustomIcon name="analytics" size={18} /> }}
   theme={{ headerBandBg: "#F5E44D", iconBlockBg: "#F06D98", shadowColor: "rgba(245,228,77,0.45)" }}>
   <div className="min-h-[400px] w-full bg-white p-4 overflow-hidden flex flex-col">
    {ds.gauges.length === 0 ? (
     <EmptyState missing={ds.diagnostics.missing} rows={ds.diagnostics.rows} />
    ) : (
     <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {ds.gauges.map((gauge) => {
       const percentage = Math.max(0, Math.min(100, (gauge.value / Math.max(gauge.target, 1)) * 100))

       return (
        <div key={gauge.label} className="border-[3px] border-black rounded-xl p-3 bg-white">
         <p className="text-[11px] font-black uppercase">{gauge.label}</p>
         <div className="h-3 border-[2px] border-black rounded-full mt-3 overflow-hidden">
          <div className="h-full" style={{ width: `${percentage}%`, backgroundColor: gauge.tone }} />
         </div>
         <p className="text-xl font-[1000] mt-2">{gauge.value.toFixed(2)}</p>
        </div>
       )
      })}
     </div>
    )}
   </div>
  </SubToolboxChartModule>
 )
}

export const LissajousWebModule: React.FC<GChartProps> = ({ data }) => {
 const ds = useMemo(() => buildExpansionDatasets(data), [data])

 return (
  <SubToolboxChartModule
   header={{ title: "LISSAJOUS WEB", subtitle: "CTR × AVP PERFORMANCE SIGNATURE", icon: <CustomIcon name="analytics" size={18} /> }}
   theme={{ headerBandBg: "#B14AED", iconBlockBg: "#24D3FF", shadowColor: "rgba(180,74,237,0.45)" }}>
   <div className="min-h-[400px] w-full bg-white p-4 overflow-hidden flex flex-col">
    {ds.lissajous.length === 0 ? (
     <EmptyState missing={ds.diagnostics.missing} rows={ds.diagnostics.rows} />
    ) : (
     <div className="h-[340px] border-[3px] border-black rounded-xl bg-[#060A24] p-2 overflow-hidden">
      <StableChartFrame minHeightClassName="min-h-[300px]">
        <ScatterChart margin={{ top: 24, right: 24, left: 8, bottom: 8 }}>
         <CartesianGrid stroke="rgba(255,255,255,0.12)" />
         <XAxis type="number" dataKey="x" tick={{ fontWeight: 900, fontSize: 10, fill: "#9ca3af" }} />
         <YAxis type="number" dataKey="y" tick={{ fontWeight: 900, fontSize: 10, fill: "#9ca3af" }} />
         <Tooltip content={<ChartTip />} />
         <Scatter data={ds.lissajous} fill="#00E5FF" fillOpacity={0.85} />
        </ScatterChart>
      </StableChartFrame>
     </div>
    )}
   </div>
  </SubToolboxChartModule>
 )
}

export const OrbitalModule: React.FC<GChartProps> = ({ data }) => {
 const ds = useMemo(() => buildExpansionDatasets(data), [data])

 return (
  <SubToolboxChartModule
   header={{ title: "ORBITAL", subtitle: "CONTENT CATEGORIES AS PLANETARY ORBITS", icon: <CustomIcon name="target" size={18} /> }}
   theme={{ headerBandBg: "#FF9900", iconBlockBg: "#B14AED", shadowColor: "rgba(180,74,237,0.45)" }}>
   <div className="min-h-[400px] w-full bg-white p-4 overflow-hidden flex flex-col">
    {ds.orbital.length === 0 ? (
     <EmptyState missing={ds.diagnostics.missing} rows={ds.diagnostics.rows} />
    ) : (
     <div className="h-[390px] border-[3px] border-black rounded-xl bg-[#020617] relative overflow-hidden">
      {[80, 110, 140].map((radius) => (
       <div
        key={radius}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
        style={{ width: `${radius * 2}px`, height: `${radius * 2}px` }}
       />
      ))}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFE857] shadow-[0_0_24px_8px_rgba(255,232,87,0.6)]" />
      {ds.orbital.map((planet, index) => (
       <div
        key={`${planet.name}-${index}`}
        className="absolute text-[9px] font-black uppercase px-2 py-1 rounded-full border-[2px] border-white text-white"
        style={{
         left: `calc(50% + ${planet.x}px)`,
         top: `calc(50% + ${planet.y}px)`,
         background: "rgba(2,6,23,0.8)",
         boxShadow: `0 0 0 2px ${planet.tone}`,
        }}
        title={`${planet.name}: ${formatCompact(planet.value)}`}>
        {planet.name}
       </div>
      ))}
     </div>
    )}
   </div>
  </SubToolboxChartModule>
 )
}

/* ═══════════════════════════════════════════════
   CUSTOM SCATTER MODULE — 4-dropdown generic bubble plot
   ═══════════════════════════════════════════════ */
const CUSTOM_SCATTER_METRICS = [
 { key: "views", label: "VIEWS" },
 { key: "watchHours", label: "WATCH HRS" },
 { key: "revenue", label: "REVENUE" },
 { key: "rpm", label: "RPM" },
 { key: "likes", label: "LIKES" },
 { key: "comments", label: "COMMENTS" },
 { key: "subscribersGained", label: "SUBS GAINED" },
 { key: "shares", label: "SHARES" },
] as const
type CustomScatterMetricKey = typeof CUSTOM_SCATTER_METRICS[number]["key"]
const CUSTOM_SCATTER_PALETTE = ["#CCFF00", "#FFCC00", "#FF8C00"] as const
const CUSTOM_SCATTER_COUNTS = [10, 25, 50, 75, 100, 200] as const
type CustomScatterFormat = "all" | "shorts" | "longform"

const scatterMv = (r: CanonicalVideoRow, key: string): number => {
 if (key === "revenue") {
  const rev = resolveMetricNumber(r, "revenue")
  return rev.value ?? 0
 }
 return mv(r, key)
}

export const CustomScatterModule: React.FC<GChartProps> = ({ data }) => {
 const [xMetric, setXMetric] = useState<CustomScatterMetricKey>("views")
 const [yMetric, setYMetric] = useState<CustomScatterMetricKey>("watchHours")
 const [sizeMetric, setSizeMetric] = useState<CustomScatterMetricKey>("likes")
 const [colorMetric, setColorMetric] = useState<CustomScatterMetricKey>("revenue")
 const [count, setCount] = useState<number>(50)
 const [format, setFormat] = useState<CustomScatterFormat>("all")
 const [hovered, setHovered] = useState<string | null>(null)
 const [countMenuOpen, setCountMenuOpen] = useState(false)
 const [formatMenuOpen, setFormatMenuOpen] = useState(false)

 const cycleCount = (dir: 1 | -1) => {
  const idx = CUSTOM_SCATTER_COUNTS.indexOf(count as any)
  const next = (idx + dir + CUSTOM_SCATTER_COUNTS.length) % CUSTOM_SCATTER_COUNTS.length
  setCount(CUSTOM_SCATTER_COUNTS[next])
 }
 const cycleFormat = (dir: 1 | -1) => {
  const opts: CustomScatterFormat[] = ["all", "shorts", "longform"]
  const idx = opts.indexOf(format)
  setFormat(opts[(idx + dir + opts.length) % opts.length])
 }

 const isShort = (r: CanonicalVideoRow) =>
  String(r.format || "").toLowerCase().includes("short") || (r.durationSeconds > 0 && r.durationSeconds <= 180)

 const cd = useMemo(() => {
  const filtered = format === "shorts" ? data.filter(isShort)
   : format === "longform" ? data.filter((r) => !isShort(r))
   : data
  const mapped = filtered.map((r) => ({
   title: String(r.title || ""),
   x: scatterMv(r, xMetric),
   y: scatterMv(r, yMetric),
   size: scatterMv(r, sizeMetric),
   colorVal: scatterMv(r, colorMetric),
   key: `${r.title}-${r.uploadDate}`,
  })).filter((d) => d.x >= 0 && d.y >= 0)
  const sorted = [...mapped].sort((a, b) => b.colorVal - a.colorVal).slice(0, count)
  const colorPercentiles = buildTieAwarePercentiles(sorted.map((d) => d.colorVal))
  const radii = buildLinearAreaBubbleRadii(sorted.map((d) => d.size), { minRadius: 4, maxRadius: 36 })
  const expPos = (t: number | null) => {
   if (t === null) return null
   const TH = 0.07
   if (t <= TH) return (t / TH) * TH
   if (t >= 1 - TH) return 1 - TH + ((t - (1 - TH)) / TH) * TH
   return TH + Math.pow((t - TH) / (1 - 2 * TH), 1.6) * (1 - 2 * TH)
  }
  const points = sorted.map((d, i) => ({
   ...d,
   radius: radii[i],
   color: colorPercentiles[i] === null
    ? "#888"
    : interpolateThreeStopColor(expPos(colorPercentiles[i])!, CUSTOM_SCATTER_PALETTE),
  }))
  const xScale = buildAdaptiveZeroScale(points.map((p) => p.x), { fallbackMax: 100 })
  const yScale = buildAdaptiveZeroScale(points.map((p) => p.y), { fallbackMax: 100 })
  return { points: [...points].sort((a, b) => b.radius - a.radius), xScale, yScale }
 }, [data, xMetric, yMetric, sizeMetric, colorMetric, count, format])

 const metricLabel = (k: CustomScatterMetricKey) => CUSTOM_SCATTER_METRICS.find((m) => m.key === k)?.label ?? k

 const bubbleShape = (props: any) => {
  const { cx, cy, payload } = props
  const isHov = hovered === payload.key
  const scale = isHov ? 1.25 : 1
  return (
   <circle
    cx={cx}
    cy={cy}
    r={payload.radius * scale}
    fill={payload.color}
    fillOpacity={isHov ? 0.72 : 0.55}
    stroke={payload.color}
    strokeWidth={isHov ? 2.5 : 1.5}
    strokeOpacity={1}
    onMouseEnter={() => setHovered(payload.key)}
    onMouseLeave={() => setHovered(null)}
    style={{
     shapeRendering: "geometricPrecision",
     mixBlendMode: "screen" as any,
     transitionProperty: "r, fill-opacity, stroke-width",
     transitionDuration: "250ms",
     transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
     cursor: "pointer",
    }}
   />
  )
 }

 const hoveredPoint = cd.points.find((p) => p.key === hovered) || cd.points[0] || null

 return (
  <SubToolboxChartModule
   header={{ title: "CUSTOM SCATTER", subtitle: "FULLY CONFIGURABLE BUBBLE PLOT · 4 AXES", icon: <CustomIcon name="analytics" size={18} /> }}
   theme={{ headerBandBg: "#CCFF00", iconBlockBg: "#FF9900", shadowColor: "rgba(204,255,0,0.45)" }}
   layout={{ moduleMinHeight: "480px", moduleWidth: "100%" }}
   controlBox={{
    count: cd.points.length,
    countUnit: "VIDEOS",
    onCountPrev: () => cycleCount(-1),
    onCountNext: () => cycleCount(1),
    dropdown: {
     value: format,
     isOpen: countMenuOpen,
     onToggle: () => setCountMenuOpen((p) => !p),
     onSelect: (v) => { setFormat(v as CustomScatterFormat); setCountMenuOpen(false) },
     options: [
      { value: "all", label: "ALL FORMATS" },
      { value: "shorts", label: "SHORTS ONLY" },
      { value: "longform", label: "LONG-FORM ONLY" },
     ],
    },
   }}
   controllerRows={[
    {
     type: "dropdown" as const,
     value: xMetric,
     labelPrefix: "X",
     options: CUSTOM_SCATTER_METRICS.map((m) => ({ label: m.label, value: m.key })),
     onSelect: (v: string) => setXMetric(v as CustomScatterMetricKey),
     bgTone: "#CCFF00",
     fgTone: "#000000",
    },
    {
     type: "dropdown" as const,
     value: yMetric,
     labelPrefix: "Y",
     options: CUSTOM_SCATTER_METRICS.map((m) => ({ label: m.label, value: m.key })),
     onSelect: (v: string) => setYMetric(v as CustomScatterMetricKey),
     bgTone: "#00E5FF",
     fgTone: "#000000",
    },
    {
     type: "dropdown" as const,
     value: sizeMetric,
     labelPrefix: "SIZE",
     options: CUSTOM_SCATTER_METRICS.map((m) => ({ label: m.label, value: m.key })),
     onSelect: (v: string) => setSizeMetric(v as CustomScatterMetricKey),
     bgTone: "#FF9900",
     fgTone: "#000000",
    },
    {
     type: "dropdown" as const,
     value: colorMetric,
     labelPrefix: "COLOR",
     options: CUSTOM_SCATTER_METRICS.map((m) => ({ label: m.label, value: m.key })),
     onSelect: (v: string) => setColorMetric(v as CustomScatterMetricKey),
     bgTone: "#FF82B0",
     fgTone: "#000000",
    },
   ]}
   activeContext={{
    title: hoveredPoint?.title?.toUpperCase() || "HOVER A BUBBLE",
    stats: [
     { label: metricLabel(xMetric), value: hoveredPoint ? formatCompact(hoveredPoint.x) : "—", tone: "lime" },
     { label: metricLabel(yMetric), value: hoveredPoint ? formatCompact(hoveredPoint.y) : "—", tone: "cyan" },
     { label: metricLabel(sizeMetric), value: hoveredPoint ? formatCompact(hoveredPoint.size) : "—", tone: "yellow" },
     { label: metricLabel(colorMetric), value: hoveredPoint ? formatCompact(hoveredPoint.colorVal) : "—", tone: "pink" },
    ],
   }}
   footer={
    <InsightMarquee
     mode="insight-lock"
     segments={[{
      badge: "Scatter",
      text: `X=${metricLabel(xMetric)} · Y=${metricLabel(yMetric)} · Bubble=${metricLabel(sizeMetric)} · Color=${metricLabel(colorMetric)} · Gradient: Lime → Yellow → Orange`,
      badgeTone: "lime",
     }]}
    />
   }
  >
   <div className="h-[420px] w-full bg-white relative overflow-hidden">
    <StableChartFrame minHeightClassName="min-h-[420px]">
     <ScatterChart margin={{ top: 20, right: 24, left: 10, bottom: 28 }}>
      <CartesianGrid stroke="rgba(0,0,0,0.06)" />
      <XAxis
       type="number"
       dataKey="x"
       domain={cd.xScale.domain}
       ticks={cd.xScale.ticks}
       tickFormatter={formatCompact}
       axisLine={{ stroke: "#000", strokeWidth: 3 }}
       tickLine={false}
       tick={{ fontWeight: 1000, fontSize: 10, fill: "#000" }}
       label={{ value: metricLabel(xMetric), position: "insideBottom", offset: -10, style: { fontWeight: 1000, fontSize: 12, fill: "#000" } }}
      />
      <YAxis
       type="number"
       dataKey="y"
       domain={cd.yScale.domain}
       ticks={cd.yScale.ticks}
       tickFormatter={formatCompact}
       axisLine={{ stroke: "#000", strokeWidth: 3 }}
       tickLine={false}
       tick={{ fontWeight: 1000, fontSize: 10, fill: "#000" }}
       label={{ value: metricLabel(yMetric), angle: -90, position: "insideLeft", offset: 12, style: { fontWeight: 1000, fontSize: 12, fill: "#000", textAnchor: "middle" } }}
      />
      <Scatter data={cd.points} shape={bubbleShape} />
     </ScatterChart>
    </StableChartFrame>
    <div className="absolute bottom-2 right-4 flex items-center gap-2 pointer-events-none">
     <span className="text-[11px] font-black uppercase text-black">{metricLabel(colorMetric)}</span>
     <div className="w-[120px] h-5 border-[2px] border-black rounded-[2px] bg-gradient-to-r from-[#CCFF00] via-[#FFCC00] to-[#FF8C00]" />
    </div>
   </div>
  </SubToolboxChartModule>
 )
}

/* ═══════════════════════════════════════════════
   SIGNAL MATRIX MODULE — keyword × metric heatmap
   ═══════════════════════════════════════════════ */
const SIGNAL_MATRIX_METRICS = [
 { key: "views", label: "VIEWS", fmt: formatCompact },
 { key: "revenue", label: "REV", fmt: (v: number) => `$${formatCompact(v)}` },
 { key: "rpm", label: "RPM", fmt: (v: number) => `$${v.toFixed(2)}` },
 { key: "ctr", label: "CTR", fmt: (v: number) => `${v.toFixed(1)}%` },
 { key: "likes", label: "LIKES", fmt: formatCompact },
 { key: "comments", label: "CMNT", fmt: formatCompact },
 { key: "impressions", label: "IMPR", fmt: formatCompact },
] as const
type SignalMatrixMetricKey = typeof SIGNAL_MATRIX_METRICS[number]["key"]

const signalMatrixHeatColor = (t: number): string =>
 interpolateThreeStopColor(t, ["#0a1628", "#2563eb", "#CCFF00"] as const)

export const SignalMatrixModule: React.FC<GChartProps> = ({ data }) => {
 const [sortBy, setSortBy] = useState<SignalMatrixMetricKey>("views")
 const [topN, setTopN] = useState(15)
 const [hovered, setHovered] = useState<{ keyword: string; metric: SignalMatrixMetricKey } | null>(null)

 const matrix = useMemo(() => {
  const wordMap = new Map<string, CanonicalVideoRow[]>()
  data.forEach((row) => {
   const words = String(row.title || "")
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length >= 4)
   const seen = new Set<string>()
   words.forEach((word) => {
    if (seen.has(word)) return
    seen.add(word)
    if (!wordMap.has(word)) wordMap.set(word, [])
    wordMap.get(word)!.push(row)
   })
  })
  const rows = Array.from(wordMap.entries())
   .filter(([, videos]) => videos.length >= 2)
   .map(([keyword, videos]) => {
    const avg = (key: string) => {
     const vals = videos.map((v) => mv(v, key)).filter((n) => n > 0)
     return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
    }
    return {
     keyword, count: videos.length,
     views: avg("views"), revenue: avg("revenue"), rpm: avg("rpm"),
     ctr: avg("ctr"), likes: avg("likes"), comments: avg("comments"), impressions: avg("impressions"),
    }
   })
   .sort((a, b) => b[sortBy] - a[sortBy])
   .slice(0, topN)
  const colMax: Record<string, number> = {}
  SIGNAL_MATRIX_METRICS.forEach(({ key }) => {
   colMax[key] = Math.max(...rows.map((r) => (r as any)[key]), 1)
  })
  return { rows, colMax }
 }, [data, sortBy, topN])

 return (
  <SubToolboxChartModule
   header={{ title: "SIGNAL MATRIX", subtitle: "KEYWORD × METRIC HEATMAP · CLICK COLUMN TO SORT", icon: <CustomIcon name="analytics" size={18} /> }}
   theme={{ headerBandBg: "#0A1628", iconBlockBg: "#2563eb", shadowColor: "rgba(37,99,235,0.5)" }}
   layout={{ moduleMinHeight: "500px", moduleWidth: "100%" }}
   controllerRows={[{
    type: "custom",
    render: () => (
     <div className="flex h-full items-center gap-2 px-3 bg-[#0a1628]">
      <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white/60">Top</span>
      {[10, 15, 20, 25, 30].map((n) => (
       <button key={n} type="button" onClick={() => setTopN(n)}
        className="h-6 px-2.5 rounded-md text-[10px] font-black uppercase border-[2px] transition-colors"
        style={{
         borderColor: topN === n ? "#CCFF00" : "rgba(255,255,255,0.25)",
         color: topN === n ? "#CCFF00" : "rgba(255,255,255,0.6)",
         background: topN === n ? "rgba(204,255,0,0.08)" : "transparent",
        }}>{n}</button>
      ))}
      <span className="ml-auto text-[9px] font-black uppercase text-white/40">KEYWORDS</span>
     </div>
    ),
   }]}
   activeContext={{
    title: hovered ? `${hovered.keyword.toUpperCase()} · ${hovered.metric.toUpperCase()}` : `SIGNAL MATRIX · ${topN} KEYWORDS`,
    stats: hovered
     ? (() => {
        const row = matrix.rows.find((r) => r.keyword === hovered.keyword)
        if (!row) return []
        return SIGNAL_MATRIX_METRICS.map((m) => ({
         label: m.label,
         value: m.fmt((row as any)[m.key]),
         tone: m.key === sortBy ? "lime" as const : "white" as const,
        }))
       })()
     : [{ label: "SORT BY", value: sortBy.toUpperCase(), tone: "lime" as const }],
   }}
   footer={
    <InsightMarquee
     mode="insight-lock"
     segments={[{ badge: "Signal", text: "Each cell = avg metric for all videos containing that title keyword. Brightest = highest. Click column to sort.", badgeTone: "cyan" }]}
    />
   }
  >
   <div className="overflow-auto w-full" style={{ background: "#060e1e" }}>
    {matrix.rows.length === 0 ? (
     <div className="flex items-center justify-center h-40 text-white/40 text-sm font-black uppercase">No keyword data — load master table</div>
    ) : (
     <table className="w-full border-collapse text-[11px] font-black uppercase">
      <thead>
       <tr className="border-b-[3px] border-white/20">
        <th className="sticky left-0 bg-[#060e1e] px-3 py-2 text-left text-[9px] text-white/50 tracking-[0.12em] w-[140px]">KEYWORD</th>
        <th className="px-2 py-2 text-center text-[9px] text-white/50">VIDS</th>
        {SIGNAL_MATRIX_METRICS.map((m) => (
         <th key={m.key} className="px-2 py-2 text-center tracking-[0.1em] cursor-pointer select-none hover:text-[#CCFF00] transition-colors"
          style={{ color: sortBy === m.key ? "#CCFF00" : "rgba(255,255,255,0.6)" }}
          onClick={() => setSortBy(m.key)}>
          {m.label}{sortBy === m.key && <span className="ml-1">▼</span>}
         </th>
        ))}
       </tr>
      </thead>
      <tbody>
       {matrix.rows.map((row, ri) => (
        <tr key={row.keyword} className="border-b border-white/10" style={{ background: ri % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
         <td className="sticky left-0 px-3 py-1.5 font-black text-white text-[10px] tracking-[0.06em]" style={{ background: ri % 2 === 0 ? "#070f1f" : "#060e1e" }}>
          {row.keyword}
         </td>
         <td className="px-2 py-1.5 text-center text-white/50">{row.count}</td>
         {SIGNAL_MATRIX_METRICS.map((m) => {
          const val = (row as any)[m.key] as number
          const t = val / (matrix.colMax[m.key] || 1)
          const isHov = hovered?.keyword === row.keyword && hovered?.metric === m.key
          return (
           <td key={m.key}
            className="px-2 py-1.5 text-center cursor-pointer transition-all"
            style={{
             background: signalMatrixHeatColor(Math.pow(t, 0.55)),
             color: t > 0.45 ? "#000" : "#fff",
             fontWeight: 1000, fontSize: 10,
             outline: isHov ? "2px solid #CCFF00" : undefined,
             outlineOffset: "-2px",
            }}
            onMouseEnter={() => setHovered({ keyword: row.keyword, metric: m.key })}
            onMouseLeave={() => setHovered(null)}
           >
            {val > 0 ? m.fmt(val) : "—"}
           </td>
          )
         })}
        </tr>
       ))}
      </tbody>
     </table>
    )}
   </div>
  </SubToolboxChartModule>
 )
}
