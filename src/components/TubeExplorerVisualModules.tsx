import React, { useEffect, useMemo, useRef, useState } from "react"
import {
 Area,
 AreaChart,
 Bar,
 BarChart,
 CartesianGrid,
 Cell,
 ComposedChart,
 Line,
 Pie,
 PieChart,
 PolarAngleAxis,
 PolarGrid,
 Radar,
 RadarChart,
 ResponsiveContainer,
 Scatter,
 ScatterChart,
 Tooltip,
 XAxis,
 YAxis,
} from "recharts"
import type { CanonicalVideoRow } from "../services/analytics/DataStore"
import type { CsvFileWithTag } from "../types"
import { CustomIcon } from "./CustomIcon"
import { StableChartFrame } from "./StableChartFrame"
import { SubToolboxChartModule } from "./SubToolboxChartModule"
import { VT_NAV_PALETTE_12, VT_SPECTRUM_PALETTE_06 } from "../styles/toolboxPalette"
import {
 buildTubeExplorerVisualData,
 type TubeExplorerVisualDataset,
 type TubeExplorerVideoPoint,
} from "./tubeExplorerVisualData"

export interface TubeExplorerVisualProps {
  data: CanonicalVideoRow[]
  csvFiles?: CsvFileWithTag[]
  trafficRows?: any[]
  trafficByDay?: any[]
  geographyRows?: any[]
  collapsible?: boolean
  isOpenInitial?: boolean
}

export interface TubeExplorerVisualModuleEntry {
 id: string
 title: string
 render: (props: TubeExplorerVisualProps) => React.ReactNode
}

const COLORS = VT_NAV_PALETTE_12
const EXPLORER_BG = "#0a0a1a"
const EXPLORER_SURFACE = "#0b0b12"
const EXPLORER_GRID = "rgba(255,255,255,0.08)"
const TRAFFIC_COLORS = VT_NAV_PALETTE_12
const compact = (value: number): string => {
 if (!Number.isFinite(value)) return "0"
 const abs = Math.abs(value)
 if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
 if (abs >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`
 return Math.round(value).toLocaleString()
}

const numericValue = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return 0
 const parsed = Number(value.replace(/[$,%]/g, "").replace(/,/g, "").trim())
 return Number.isFinite(parsed) ? parsed : 0
}

const paddedDomain = (values: number[], floorAtZero = true): [number, number] => {
 const finite = values.filter((value) => Number.isFinite(value))
 if (finite.length === 0) return [0, 1]
 const min = Math.min(...finite)
 const max = Math.max(...finite)
 if (min === max) {
  const pad = Math.max(Math.abs(max) * 0.12, 1)
  return [floorAtZero ? Math.max(0, min - pad) : min - pad, max + pad]
 }
 const pad = (max - min) * 0.12
 return [floorAtZero ? Math.max(0, min - pad) : min - pad, max + pad]
}

const scaleBetween = (value: number, min: number, max: number, outMin: number, outMax: number): number => {
 if (!Number.isFinite(value) || max === min) return (outMin + outMax) / 2
 const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)))
 return outMin + ratio * (outMax - outMin)
}

const useExplorerData = (props: TubeExplorerVisualProps): TubeExplorerVisualDataset =>
 useMemo(
  () => buildTubeExplorerVisualData(props.data, props.csvFiles || [], props.trafficRows || [], props.geographyRows || []),
  [props.data, props.csvFiles, props.trafficRows, props.geographyRows],
 )

const ModuleFrame: React.FC<{
 title: string
 subtitle: string
 count: number | string
 icon?: string
 color?: string
 badges?: { label: string; tone?: "pink" | "cyan" | "lime" | "yellow" | "purple" | "orange" | "white" }[]
 activeContext?: React.ComponentProps<typeof SubToolboxChartModule>["activeContext"]
 controllerRows?: React.ComponentProps<typeof SubToolboxChartModule>["controllerRows"]
 insight?: string
 height?: number
 flushShell?: boolean
 collapsible?: boolean
 isOpenInitial?: boolean
 children: React.ReactNode
}> = ({ title, subtitle, count, icon = "analytics", color = "#C9FF18", badges = [], activeContext, controllerRows, insight, height = 320, flushShell = false, collapsible = false, isOpenInitial = true, children }) => (
 <SubToolboxChartModule
  collapsible={collapsible}
  isOpenInitial={isOpenInitial}
  header={{
   title,
   subtitle,
   icon: <CustomIcon name={icon as any} size={34} />,
  }}
  activeContext={activeContext}
  controllerRows={controllerRows ?? [
    { type: "number", value: count, bgTone: color, fgTone: "#000000", isBig: false },
    { type: "label", value: "VIDEOS", bgTone: color, fgTone: "#000000" }
  ]}
  layout={{ chartHeight: height }}
  theme={{ headerBandBg: color, iconBlockBg: "#20D4F7" }}
  metricBadges={badges}
  footer={insight ? <span className="font-black uppercase tracking-[0.08em]">{insight}</span> : undefined}
 >
  <div
   className={flushShell ? "mx-auto h-full w-full max-w-none" : "mx-auto w-full max-w-[1080px] border-[3px] border-black bg-white p-2"}
   style={{ height }}>
   <StableChartFrame minHeightClassName="min-h-[300px]">{children}</StableChartFrame>
  </div>
 </SubToolboxChartModule>
)

const ExplorerCanvas: React.FC<{
 legend?: React.ReactNode
 footerLeft?: React.ReactNode
 footerRight?: React.ReactNode
 legendWidthClassName?: string
 flushContent?: boolean
 children: React.ReactNode
}> = ({ legend, footerLeft, footerRight, legendWidthClassName = "w-[210px]", flushContent = false, children }) => (
 <div className={`flex h-full flex-col overflow-hidden border-[3px] border-black ${flushContent ? 'bg-[#0a0a1a]' : 'bg-[#f4f1eb]'}`}>
  <div className={`flex min-h-0 flex-1 items-stretch gap-0 bg-[#0a0a1a] ${flushContent ? 'p-0' : 'p-3'} ${footerLeft || footerRight ? "border-b-[3px] border-black" : ""}`}>
   <div className="min-h-0 flex-1 overflow-hidden relative">{children}</div>
   {legend ? <div className={`ml-4 shrink-0 overflow-hidden border-l border-white/10 pl-4 ${legendWidthClassName}`}>{legend}</div> : null}
  </div>
  {(footerLeft || footerRight) ? (
   <div className="flex items-stretch border-t-[3px] border-black bg-[#111] text-white">
    {footerLeft ? (
     <div className="flex min-h-[56px] flex-1 items-center gap-3 border-r border-white/10 px-4 py-3">
      {footerLeft}
     </div>
    ) : null}
    {footerRight ? (
     <div className="flex min-h-[56px] flex-1 items-center gap-3 px-4 py-3">
      {footerRight}
     </div>
    ) : null}
   </div>
  ) : null}
 </div>
)

const InsightBadge: React.FC<{ label: string; tone?: string }> = ({ label, tone = "#ccff00" }) => (
 <span
  className="shrink-0 border border-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black"
  style={{ background: tone }}>
  {label}
 </span>
)

const Empty: React.FC<{ label: string }> = ({ label }) => (
 <div className="flex h-full min-h-[292px] items-center justify-center rounded-lg border-[3px] border-dashed border-black bg-white text-center text-[13px] font-black uppercase tracking-[0.12em] text-black/35">
  {label}
 </div>
)

const Tip = ({ active, payload }: any) => {
 if (!active || !payload?.length) return null
 const row = payload[0]?.payload || {}
 return (
  <div className="max-w-[260px] rounded-xl border-[3px] border-black bg-white p-3 text-[11px] font-black shadow-[4px_4px_0px_black]">
   <div className="mb-1 truncate uppercase">{row.title || row.keyword || row.sourceTitle || row.label || row.month || row.name || "row"}</div>
   {payload.map((entry: any, index: number) => (
    <div key={index} className="flex justify-between gap-4 uppercase">
     <span style={{ color: entry.color }}>{entry.name}</span>
     <span>{typeof entry.value === "number" ? compact(entry.value) : entry.value}</span>
    </div>
   ))}
  </div>
 )
}

const topVideos = (
 dataset: TubeExplorerVisualDataset,
 metric: keyof TubeExplorerVideoPoint = "views",
 limit = 18,
 signed = false,
) =>
 [...dataset.videos]
  .filter((row) => signed ? Number(row[metric]) !== 0 : Number(row[metric]) > 0)
  .sort((a, b) => signed
   ? Math.abs(Number(b[metric])) - Math.abs(Number(a[metric]))
   : Number(b[metric]) - Number(a[metric]))
  .slice(0, limit)

const VideoBars: React.FC<{ rows: TubeExplorerVideoPoint[]; metric: keyof TubeExplorerVideoPoint; color?: string }> = ({ rows, metric, color = "#FF7497" }) => (
 rows.length === 0 ? <Empty label="No video rows available" /> :
 <ResponsiveContainer width="100%" height="100%">
  <BarChart data={rows} margin={{ top: 8, right: 16, bottom: 20, left: 0 }}>
   <CartesianGrid strokeDasharray="4 4" stroke="#000" opacity={0.16} />
   <XAxis dataKey="videoId" tick={{ fontSize: 9, fontWeight: 900 }} interval={0} angle={-28} textAnchor="end" height={54} />
   <YAxis tickFormatter={compact} tick={{ fontSize: 10, fontWeight: 900 }} />
   <Tooltip content={<Tip />} />
   <Bar dataKey={metric as string} name={String(metric)} fill={color} stroke="#000" strokeWidth={2} />
  </BarChart>
 </ResponsiveContainer>
)

const VideoScatter: React.FC<{
 rows: TubeExplorerVideoPoint[]
 x: keyof TubeExplorerVideoPoint
 y: keyof TubeExplorerVideoPoint
 z?: keyof TubeExplorerVideoPoint
 color?: string
}> = ({ rows, x, y, z = "views", color = "#00CCFF" }) => (
 rows.length === 0 ? <Empty label="No video rows available" /> :
 <ResponsiveContainer width="100%" height="100%">
  <ScatterChart margin={{ top: 12, right: 24, bottom: 22, left: 0 }}>
   <CartesianGrid strokeDasharray="4 4" stroke="#000" opacity={0.18} />
   <XAxis dataKey={x as string} name={String(x)} domain={paddedDomain(rows.map((row) => Number(row[x])))} tickFormatter={compact} tick={{ fontSize: 10, fontWeight: 900 }} />
   <YAxis dataKey={y as string} name={String(y)} domain={paddedDomain(rows.map((row) => Number(row[y])))} tickFormatter={compact} tick={{ fontSize: 10, fontWeight: 900 }} />
   <Tooltip content={<Tip />} />
   <Scatter data={rows} fill={color} stroke="#000" strokeWidth={2}>
    {rows.map((row, index) => <Cell key={row.videoId} fill={COLORS[index % COLORS.length]} />)}
   </Scatter>
  </ScatterChart>
 </ResponsiveContainer>
)

const MonthlyArea: React.FC<{ dataset: TubeExplorerVisualDataset; a?: string; b?: string }> = ({ dataset, a = "views", b = "revenue" }) => (
 dataset.monthly.length === 0 ? <Empty label="No dated rows available" /> :
 <ResponsiveContainer width="100%" height="100%">
  <ComposedChart data={dataset.monthly} margin={{ top: 10, right: 18, bottom: 22, left: 0 }}>
   <CartesianGrid strokeDasharray="4 4" stroke="#000" opacity={0.16} />
   <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 900 }} />
   <YAxis tickFormatter={compact} tick={{ fontSize: 10, fontWeight: 900 }} />
   <Tooltip content={<Tip />} />
   <Area type="monotone" dataKey={a} fill="#00CCFF" stroke="#000" strokeWidth={2} fillOpacity={0.45} />
   <Line type="monotone" dataKey={b} stroke="#FF7497" strokeWidth={4} dot={{ stroke: "#000", strokeWidth: 2 }} />
  </ComposedChart>
 </ResponsiveContainer>
)

const KeywordBlocks: React.FC<{ dataset: TubeExplorerVisualDataset }> = ({ dataset }) => {
 const rows = dataset.keywords.slice(0, 28)
 if (rows.length === 0) return <Empty label="No keyword tokens or search CSV rows available" />
 const max = Math.max(...rows.map((row) => row.views), 1)
 return (
  <div className="grid h-full grid-cols-4 gap-2 overflow-hidden p-1">
   {rows.map((row, index) => (
    <div
     key={`${row.keyword}-${index}`}
     className="flex min-h-0 flex-col justify-between border-[3px] border-black p-2 font-black uppercase"
     style={{ background: COLORS[index % COLORS.length], opacity: 0.78 + (row.views / max) * 0.22 }}
    >
     <span className="truncate text-[13px]">{row.keyword}</span>
     <span className="text-[22px] leading-none">{compact(row.views || row.videos)}</span>
     <span className="text-[9px] tracking-[0.1em]">{row.source}</span>
    </div>
   ))}
  </div>
 )
}

const Donut: React.FC<{ rows: { name: string; value: number }[] }> = ({ rows }) => (
 rows.every((row) => row.value <= 0) ? <Empty label="No split values available" /> :
 <ResponsiveContainer width="100%" height="100%">
  <PieChart>
   <Tooltip content={<Tip />} />
   <Pie data={rows} dataKey="value" nameKey="name" innerRadius={70} outerRadius={120} stroke="#000" strokeWidth={3} label>
    {rows.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
   </Pie>
  </PieChart>
 </ResponsiveContainer>
)

const HeatGrid: React.FC<{ cells: { label: string; value: number }[]; empty: string }> = ({ cells, empty }) => {
 if (cells.length === 0 || cells.every((cell) => cell.value <= 0)) return <Empty label={empty} />
 const max = Math.max(...cells.map((cell) => cell.value), 1)
 return (
  <div className="grid h-full grid-cols-7 gap-2 p-2">
   {cells.map((cell, index) => (
    <div key={`${cell.label}-${index}`} className="flex flex-col items-center justify-center border-[3px] border-black text-center font-black uppercase" style={{ background: `rgba(255, 116, 151, ${0.18 + (cell.value / max) * 0.82})` }}>
     <span className="text-[11px]">{cell.label}</span>
     <span className="text-[20px]">{compact(cell.value)}</span>
    </div>
   ))}
  </div>
 )
}

const TrafficBars: React.FC<{ dataset: TubeExplorerVisualDataset }> = ({ dataset }) => {
 const rows = dataset.traffic.slice(0, 16)
 if (rows.length === 0) return <Empty label="Sync/import traffic CSV data to populate this module" />
 return (
  <ResponsiveContainer width="100%" height="100%">
   <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 20, bottom: 8, left: 116 }}>
    <CartesianGrid strokeDasharray="4 4" stroke="#000" opacity={0.16} />
    <XAxis type="number" tickFormatter={compact} tick={{ fontSize: 10, fontWeight: 900 }} />
    <YAxis type="category" dataKey="sourceTitle" width={110} tick={{ fontSize: 9, fontWeight: 900 }} />
    <Tooltip content={<Tip />} />
    <Bar dataKey="views" fill="#CCFF00" stroke="#000" strokeWidth={2} />
   </BarChart>
  </ResponsiveContainer>
 )
}

const GeoBars: React.FC<{ dataset: TubeExplorerVisualDataset }> = ({ dataset }) => {
 const rows = dataset.geography.filter((row) => row.views > 0).slice(0, 16)
 if (rows.length === 0) return <Empty label="Sync or import geography rows to populate this module" />
 return (
  <ResponsiveContainer width="100%" height="100%">
   <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 20, bottom: 8, left: 116 }}>
    <CartesianGrid strokeDasharray="4 4" stroke="#000" opacity={0.16} />
    <XAxis type="number" tickFormatter={compact} tick={{ fontSize: 10, fontWeight: 900 }} />
    <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 9, fontWeight: 900 }} />
    <Tooltip content={<Tip />} />
    <Bar dataKey="views" fill="#B14AED" stroke="#000" strokeWidth={2} />
   </BarChart>
  </ResponsiveContainer>
 )
}

const FunnelStages: React.FC<{ dataset: TubeExplorerVisualDataset }> = ({ dataset }) => {
 const stages = [
  { label: "Impressions", value: dataset.totals.impressions, color: "#579AFF" },
  { label: "Views", value: dataset.totals.views, color: "#40C6E9" },
  { label: "Engaged", value: dataset.totals.engagedViews, color: "#4FFF5B" },
  { label: "Subscribers", value: dataset.totals.subscribersGained, color: "#FF83EA" },
 ].filter((stage) => stage.value > 0)
 if (stages.length === 0) return <Empty label="No conversion-stage metrics are available" />
 const max = Math.max(...stages.map((stage) => stage.value), 1)
 return (
  <div className="flex h-full flex-col justify-center gap-3 p-4">
   {stages.map((stage) => (
    <div key={stage.label} className="mx-auto flex h-14 items-center justify-between border-[3px] border-black px-4 font-black uppercase"
     style={{ width: `${Math.max(28, (stage.value / max) * 100)}%`, background: stage.color }}>
     <span className="truncate text-[12px]">{stage.label}</span>
     <span className="ml-3 text-[18px]">{compact(stage.value)}</span>
    </div>
   ))}
  </div>
 )
}

const BarcodeFingerprintRenderer: React.FC<{ dataset: TubeExplorerVisualDataset }> = ({ dataset }) => {
 const rows = topVideos(dataset, "valueScore", 42)
 if (rows.length === 0) return <Empty label="No non-zero video value metrics are available" />
 const max = Math.max(...rows.map((row) => row.valueScore), 1)
 return (
  <div className="flex h-full items-stretch gap-1 overflow-hidden bg-white p-4" role="img" aria-label="Video value barcode fingerprint">
   {rows.map((row, index) => {
    const ratio = row.valueScore / max
    return (
     <div key={row.videoId} className="group relative flex min-w-0 flex-1 items-end" title={`${row.title}: ${compact(row.valueScore)}`}>
      <div
       className="w-full border-x border-black"
       style={{
        height: `${Math.max(8, ratio * 100)}%`,
        background: TRAFFIC_COLORS[index % TRAFFIC_COLORS.length],
        opacity: 0.42 + ratio * 0.58,
       }}
      />
      <span className="pointer-events-none absolute bottom-1 left-1/2 hidden -translate-x-1/2 whitespace-nowrap border-2 border-black bg-white px-2 py-1 text-[9px] font-black uppercase group-hover:block">
       {row.videoId}
      </span>
     </div>
    )
   })}
  </div>
 )
}

const SvgRadial: React.FC<{ rows: TubeExplorerVideoPoint[]; metric: keyof TubeExplorerVideoPoint }> = ({ rows, metric }) => {
 if (rows.length === 0) return <Empty label="No video rows available" />
 const max = Math.max(...rows.map((row) => Number(row[metric])), 1)
 const points = rows.slice(0, 28)
 return (
  <svg viewBox="0 0 680 300" className="h-full w-full">
   <rect x="8" y="8" width="664" height="284" fill="#fff" stroke="#000" strokeWidth="3" />
   {points.map((row, index) => {
    const angle = (Math.PI * 2 * index) / points.length
    const radius = 34 + (Number(row[metric]) / max) * 112
    const x = 340 + Math.cos(angle) * radius
    const y = 150 + Math.sin(angle) * radius
    return <g key={row.videoId}><line x1="340" y1="150" x2={x} y2={y} stroke="#000" strokeWidth="2" opacity="0.28" /><circle cx={x} cy={y} r={6 + (Number(row.views) / Math.max(max, row.views || 1)) * 8} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth="3" /></g>
   })}
   <circle cx="340" cy="150" r="28" fill="#CCFF00" stroke="#000" strokeWidth="4" />
   <text x="340" y="155" textAnchor="middle" fontSize="13" fontWeight="1000">VT</text>
  </svg>
 )
}

const titleTokens = (title: string): string[] =>
 title
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, " ")
  .split(/\s+/)
  .map((token) => token.trim())
  .filter((token) => token.length >= 3 && !["the", "and", "with", "from", "this", "that", "video", "shorts", "full", "part"].includes(token))

const formatTrafficLabel = (label: string): string =>
 label
  .replace(/browse features/i, "Browse")
  .replace(/youtube search/i, "YT Search")
  .replace(/shorts feed/i, "Shorts feed")

const formatDonutSourceLabel = (label: string): string =>
 label
  .replace(/com\.google\.android\.apps\.messaging/gi, "Android Texts")
  .replace(/com\.google\.android\.apps\.messages/gi, "Android Texts")
  .replace(/com\.google\.android\.apps\.messagges/gi, "Android Texts")
  .replace(/\.com\b/gi, "")

const splitDonutCenterLabel = (label: string): string[] => {
 const words = label.toUpperCase().trim().split(/\s+/).filter(Boolean)
 if (words.length <= 1) return words.length === 0 ? [""] : [words[0].length > 16 ? `${words[0].slice(0, 15)}…` : words[0]]
 if (words.join(" ").length <= 13) return [words.join(" ")]

 let bestSplit = 1
 let bestScore = Number.POSITIVE_INFINITY
 for (let index = 1; index < words.length; index += 1) {
  const first = words.slice(0, index).join(" ")
  const second = words.slice(index).join(" ")
  const score = Math.max(first.length, second.length) + Math.abs(first.length - second.length) * 0.35
  if (score < bestScore) {
   bestScore = score
   bestSplit = index
  }
 }

 return [
  words.slice(0, bestSplit).join(" "),
  words.slice(bestSplit).join(" "),
 ].map((line) => line.length > 16 ? `${line.slice(0, 15)}…` : line)
}

const normalizeTrafficText = (value: string): string =>
 value
  .trim()
  .toLowerCase()
  .replace(/[_-]+/g, " ")
  .replace(/\s+/g, " ")

const TRAFFIC_DETAIL_SOURCE_TOKEN_EXCLUSIONS = new Set([
 "advertising",
 "browse",
 "browse features",
 "external",
 "external website",
 "external websites",
 "ext url",
 "hashtags",
 "related video",
 "shorts",
 "shorts feed",
 "sound page",
 "subscriber",
 "subscribers",
 "summary",
 "watch",
 "what to watch",
 "yt channel",
 "yt other page",
 "yt search",
 "youtube search",
])

const trafficKindSourceLabel = (kind: TrafficFocusKind): string => {
 const label = trafficFocusLabel(kind)
 return normalizeTrafficText(label)
}

const trafficDetailExclusions = (kind: TrafficFocusKind): string[] => {
 switch (kind) {
  case "search":
   return ["search terms", "youtube search", "yt search", "yt_search", "google search", "google.com"]
  case "external":
   return ["external websites", "external", "ext url", "ext_url", "website", "websites"]
  case "shorts_feed":
   return ["shorts feed", "shorts_feed"]
  case "shorts":
   return ["shorts"]
  case "watch":
   return ["watch"]
  case "subscriber":
   return ["subscriber", "subscribers"]
  case "suggested":
   return ["suggested", "suggested videos"]
  default:
   return []
 }
}

const isAggregateTrafficLabel = (label: string): boolean => {
 const normalized = label.trim().toLowerCase()
 return normalized === "total" || normalized === "totals" || normalized === "overall total"
}

type TrafficFocusKind =
 "search"
 | "external"
 | "shorts_feed"
 | "shorts"
 | "watch"
 | "subscriber"
 | "suggested"
 | "other"

type TrafficFocusSlice = {
 kind: TrafficFocusKind
 label: string
 views: number
 color: string
 }

const TRAFFIC_FOCUS_META: Record<TrafficFocusKind, { label: string; tone: string }> = {
 search: { label: "SEARCH TERMS", tone: "#FF83EA" },
 external: { label: "EXTERNAL WEBSITES", tone: "#FFB570" },
 shorts_feed: { label: "SHORTS FEED", tone: "#FF7497" },
 shorts: { label: "SHORTS", tone: "#FF8AAF" },
 watch: { label: "WATCH", tone: "#4FFF5B" },
 subscriber: { label: "SUBSCRIBER", tone: "#FFFF61" },
 suggested: { label: "SUGGESTED", tone: "#579AFF" },
 other: { label: "OTHER", tone: "#B14AED" },
}

const trafficFocusLabel = (kind: TrafficFocusKind): string => TRAFFIC_FOCUS_META[kind].label

const classifyTrafficFocus = (row: TubeExplorerTrafficPoint): TrafficFocusKind => {
 const haystack = `${row.sourceType} ${row.sourceTitle} ${row.sourceDetail}`.toLowerCase()
 if (haystack.includes("search")) return "search"
 if (haystack.includes("external") || haystack.includes("website") || haystack.includes("ext_url")) return "external"
 if (haystack.includes("shorts feed")) return "shorts_feed"
 if (haystack.includes("shorts")) return "shorts"
 if (haystack.includes("subscriber")) return "subscriber"
 if (haystack.includes("suggest")) return "suggested"
 if (haystack.includes("watch")) return "watch"
 return "other"
}

const summarizeTrafficSlices = (rows: TubeExplorerTrafficPoint[]): TrafficFocusSlice[] => {
 const map = new Map<TrafficFocusKind, number>()
 for (const row of rows) {
  if (!(row.views > 0)) continue
  const kind = classifyTrafficFocus(row)
  map.set(kind, (map.get(kind) || 0) + row.views)
 }
 return [...map.entries()]
  .map(([kind, views]) => ({
   kind,
   label: trafficFocusLabel(kind),
   views,
   color: TRAFFIC_FOCUS_META[kind].tone,
  }))
  .sort((a, b) => b.views - a.views)
}

const buildTrafficSourceSlices = (rows: TubeExplorerTrafficPoint[]): TrafficFocusSlice[] => {
 const grouped = new Map<string, { label: string; kind: TrafficFocusKind; views: number }>()
 rows
  .filter((row) => row.views > 0 && !isAggregateTrafficLabel(row.sourceTitle) && !isAggregateTrafficLabel(row.sourceType) && !isAggregateTrafficLabel(row.sourceDetail))
  .forEach((row) => {
   const label = formatTrafficLabel(String(row.sourceTitle || row.sourceType || "Other"))
   const key = normalizeTrafficText(label)
   const existing = grouped.get(key) || { label, kind: classifyTrafficFocus(row), views: 0 }
   existing.views += row.views
   grouped.set(key, existing)
  })
 return [...grouped.values()]
  .sort((a, b) => b.views - a.views)
  .slice(0, 10)
  .map((entry, index) => ({ ...entry, color: TRAFFIC_COLORS[index % TRAFFIC_COLORS.length] }))
}

const buildTrafficDetailRows = (rows: TubeExplorerTrafficPoint[], kind: TrafficFocusKind): Array<{ label: string; views: number; watchHours: number; engagedViews: number; color: string }> => {
 const parentLabel = trafficKindSourceLabel(kind)
 const exclusions = [parentLabel, ...trafficDetailExclusions(kind), "summary"].map(normalizeTrafficText)
 const isExcludedDetailCandidate = (candidate: string): boolean => {
  const normalized = normalizeTrafficText(candidate)
  return TRAFFIC_DETAIL_SOURCE_TOKEN_EXCLUSIONS.has(normalized) || exclusions.some((term) => normalized.includes(term))
 }
 const grouped = new Map<string, { label: string; views: number; watchHours: number; engagedViews: number }>()
 rows
  .filter((row) => row.views > 0 && classifyTrafficFocus(row) === kind)
  .forEach((row) => {
   const candidates = [row.sourceDetail, row.sourceTitle, row.sourceType]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
   const label = candidates.find((candidate) => !isExcludedDetailCandidate(candidate)) || candidates[0] || "Unknown"
   if (isExcludedDetailCandidate(label)) return
   const existing = grouped.get(label) || { label, views: 0, watchHours: 0, engagedViews: 0 }
   existing.views += row.views
   existing.watchHours += row.watchHours
   existing.engagedViews += row.engagedViews
   grouped.set(label, existing)
  })
 return [...grouped.values()]
  .sort((a, b) => b.views - a.views)
  .slice(0, 10)
  .map((entry, index) => ({
   ...entry,
   color: TRAFFIC_COLORS[index % TRAFFIC_COLORS.length],
  }))
}

const polar = (cx: number, cy: number, angle: number, radius: number) => ({
 x: cx + radius * Math.cos(angle),
 y: cy + radius * Math.sin(angle),
})

const ringArcPath = (
 cx: number,
 cy: number,
 startAngle: number,
 endAngle: number,
 innerRadius: number,
 outerRadius: number,
): string => {
 const startOuter = polar(cx, cy, startAngle, outerRadius)
 const endOuter = polar(cx, cy, endAngle, outerRadius)
 const startInner = polar(cx, cy, startAngle, innerRadius)
 const endInner = polar(cx, cy, endAngle, innerRadius)
 const large = endAngle - startAngle > Math.PI ? 1 : 0
 return [
  `M ${startOuter.x} ${startOuter.y}`,
  `A ${outerRadius} ${outerRadius} 0 ${large} 1 ${endOuter.x} ${endOuter.y}`,
  `L ${endInner.x} ${endInner.y}`,
  `A ${innerRadius} ${innerRadius} 0 ${large} 0 ${startInner.x} ${startInner.y}`,
  "Z",
 ].join(" ")
}

type WordNode = {
 id: string
 totalViews: number
 videoCount: number
 rank: number
 x: number
 y: number
}

type WordEdge = {
 source: number
 target: number
 weight: number
 sharedVideos: number
}

const buildWordNetwork = (videos: TubeExplorerVideoPoint[], limit = 38) => {
 const wordViews: Record<string, number> = {}
 const wordVideos: Record<string, number> = {}
 const coOccurrence = new Map<string, number>()

 for (const video of videos) {
  const words = [...new Set(titleTokens(video.title))]
  for (const word of words) {
   wordViews[word] = (wordViews[word] || 0) + video.views
   wordVideos[word] = (wordVideos[word] || 0) + 1
  }
  for (let i = 0; i < words.length; i += 1) {
   for (let j = i + 1; j < words.length; j += 1) {
    const [a, b] = [words[i], words[j]].sort()
    const key = `${a}:::${b}`
    coOccurrence.set(key, (coOccurrence.get(key) || 0) + 1)
   }
  }
 }

 const topWords = Object.entries(wordViews)
  .filter(([word]) => (wordVideos[word] || 0) >= 2)
  .sort((a, b) => b[1] - a[1])
  .slice(0, limit)
  .map(([id, totalViews]) => ({ id, totalViews, videoCount: wordVideos[id] || 0 }))

 const indexByWord = new Map(topWords.map((word, index) => [word.id, index]))
 const edges: WordEdge[] = []
 for (const [key, count] of coOccurrence.entries()) {
  const [a, b] = key.split(":::")
  const source = indexByWord.get(a)
  const target = indexByWord.get(b)
  if (source === undefined || target === undefined) continue
  edges.push({ source, target, weight: Math.sqrt(count), sharedVideos: count })
 }

 const width = 860
 const height = 340
 const lastIndex = Math.max(topWords.length - 1, 1)
 // Placement is rank-driven, not decorative: the most-viewed word starts nearest the
 // center, later ranks spiral outward. The per-node center-pull below (stronger for
 // top ranks) keeps that meaning intact once the repulsion/attraction forces settle.
 const maxRadius = Math.min(width, height) / 2 - 40
 const nodes: WordNode[] = topWords.map((word, index) => {
  const rankFraction = index / lastIndex
  const angle = rankFraction * Math.PI * 2 * 2.4
  const radius = 16 + rankFraction * maxRadius
  return {
   ...word,
   rank: index,
   x: width / 2 + Math.cos(angle) * radius,
   y: height / 2 + Math.sin(angle) * radius,
  }
 })

 const boundsMargin = 32
 for (let iteration = 0; iteration < 140; iteration += 1) {
  for (let a = 0; a < nodes.length; a += 1) {
   let fx = 0
   let fy = 0
   for (let b = 0; b < nodes.length; b += 1) {
    if (a === b) continue
    const dx = nodes[a].x - nodes[b].x
    const dy = nodes[a].y - nodes[b].y
    const distSq = Math.max(dx * dx + dy * dy, 36)
    fx += (dx / distSq) * 150
    fy += (dy / distSq) * 150
   }
   for (const edge of edges) {
    if (edge.source !== a && edge.target !== a) continue
    const other = edge.source === a ? nodes[edge.target] : nodes[edge.source]
    const dx = other.x - nodes[a].x
    const dy = other.y - nodes[a].y
    fx += dx * 0.002 * edge.weight
    fy += dy * 0.002 * edge.weight
   }
   // Higher-ranked (more-viewed) words get pulled toward center much harder, so rank
   // reads as "distance from center" instead of every node fighting to the same spot.
   const centerPull = 0.0012 + 0.007 * (1 - nodes[a].rank / lastIndex)
   fx += (width / 2 - nodes[a].x) * centerPull
   fy += (height / 2 - nodes[a].y) * centerPull
   nodes[a].x = Math.min(width - boundsMargin, Math.max(boundsMargin, nodes[a].x + fx))
   nodes[a].y = Math.min(height - boundsMargin, Math.max(boundsMargin, nodes[a].y + fy))
  }
 }

 return { nodes, edges }
}

type ExplorerMetricKey = "views" | "shares" | "comments" | "subscribersGained" | "revenue" | "avp" | "avdSeconds" | "likes"

const EXPLORER_METRIC_OPTIONS: Array<{ key: ExplorerMetricKey; label: string; format: (value: number) => string }> = [
 { key: "views", label: "Views", format: compact },
 { key: "shares", label: "Shares", format: compact },
 { key: "comments", label: "Comments", format: compact },
 { key: "subscribersGained", label: "Subs", format: compact },
 { key: "revenue", label: "Revenue", format: (value) => `$${value.toFixed(value >= 100 ? 0 : 2)}` },
 { key: "avp", label: "AVP", format: (value) => `${value.toFixed(1)}%` },
 { key: "avdSeconds", label: "AVD", format: (value) => `${Math.round(value)}s` },
 { key: "likes", label: "Likes", format: compact },
]

const metricOptionFor = (metric: ExplorerMetricKey) => EXPLORER_METRIC_OPTIONS.find((option) => option.key === metric) || EXPLORER_METRIC_OPTIONS[0]

const metricValue = (video: TubeExplorerVideoPoint, metric: ExplorerMetricKey): number => Number(video[metric]) || 0

type VideoPlotMetricKey =
 | "views"
 | "watchHours"
 | "revenue"
 | "rpm"
 | "avp"
 | "avdSeconds"
 | "likes"
 | "comments"
 | "shares"
 | "subscribersGained"
 | "engagedViews"
 | "likeRate"
 | "engagementRate"
 | "retentionScore"

const VIDEO_PLOT_METRIC_OPTIONS: Array<{ key: VideoPlotMetricKey; label: string; format: (value: number) => string; average?: boolean }> = [
 { key: "views", label: "Views", format: compact },
 { key: "watchHours", label: "Watch Time", format: (value) => `${compact(value)}h` },
 { key: "revenue", label: "Revenue", format: (value) => `$${value.toFixed(value >= 100 ? 0 : 2)}` },
 { key: "rpm", label: "RPM", format: (value) => `$${value.toFixed(2)}`, average: true },
 { key: "avp", label: "AVP", format: (value) => `${value.toFixed(1)}%`, average: true },
 { key: "avdSeconds", label: "AVD", format: (value) => {
  if (!Number.isFinite(value) || value <= 0) return "0:00"
  const mins = Math.floor(value / 60)
  const secs = Math.round(value % 60)
  return `${mins}:${String(secs).padStart(2, "0")}`
 }, average: true },
 { key: "likes", label: "Likes", format: compact },
 { key: "comments", label: "Comments", format: compact },
 { key: "shares", label: "Shares", format: compact },
 { key: "subscribersGained", label: "Subs", format: compact },
 { key: "engagedViews", label: "Engaged", format: compact },
 { key: "likeRate", label: "Like Rate", format: (value) => `${value.toFixed(2)}%`, average: true },
 { key: "engagementRate", label: "Engagement", format: (value) => `${value.toFixed(2)}%`, average: true },
 { key: "retentionScore", label: "Retention", format: (value) => `${value.toFixed(1)}%`, average: true },
]

const plotMetricOptionFor = (metric: VideoPlotMetricKey) =>
 VIDEO_PLOT_METRIC_OPTIONS.find((option) => option.key === metric) || VIDEO_PLOT_METRIC_OPTIONS[0]

const plotMetricValue = (video: TubeExplorerVideoPoint, metric: VideoPlotMetricKey): number => Number(video[metric]) || 0

const filterVideosByFormat = (videos: TubeExplorerVideoPoint[], format: string): TubeExplorerVideoPoint[] =>
 videos.filter((video) => {
  if (format === "shorts") return video.format === "shorts"
  if (format === "long") return video.format === "long"
  return true
 })

const topVideosByPlotMetric = (
 videos: TubeExplorerVideoPoint[],
 metric: VideoPlotMetricKey,
 limit: number,
) =>
 [...videos]
  .filter((video) => plotMetricValue(video, metric) > 0)
  .sort((a, b) => plotMetricValue(b, metric) - plotMetricValue(a, metric))
  .slice(0, limit)

type SquarifiedRect<T> = T & { x: number; y: number; w: number; h: number }

/**
 * Squarified treemap (Bruls, Huizing & van Wijk). Tiles the full rectangle with
 * zero gaps or overlaps while keeping each cell close to square, instead of the
 * slivers a naive slice-and-dice produces.
 */
const squarifyTreemap = <T extends { value: number }>(
 items: T[],
 width: number,
 height: number,
): SquarifiedRect<T>[] => {
 const out: SquarifiedRect<T>[] = []
 const total = items.reduce((sum, item) => sum + item.value, 0)
 if (total <= 0 || width <= 0 || height <= 0) return out

 const queue = items.map((item) => ({ item, area: (item.value / total) * width * height }))
 let cx = 0
 let cy = 0
 let cw = width
 let ch = height

 const worst = (row: typeof queue, len: number): number => {
  if (!row.length || len <= 0) return Infinity
  const sum = row.reduce((acc, entry) => acc + entry.area, 0)
  if (sum <= 0) return Infinity
  const max = Math.max(...row.map((entry) => entry.area))
  const min = Math.min(...row.map((entry) => entry.area))
  return Math.max((len * len * max) / (sum * sum), (sum * sum) / (len * len * min))
 }

 while (queue.length) {
  const vertical = cw >= ch
  const len = vertical ? ch : cw
  const row: typeof queue = []
  while (queue.length) {
   const candidate = [...row, queue[0]]
   if (row.length && worst(candidate, len) > worst(row, len)) break
   row.push(queue.shift()!)
  }
  const rowArea = row.reduce((acc, entry) => acc + entry.area, 0)
  const thick = len > 0 ? rowArea / len : 0
  let offset = vertical ? cy : cx
  row.forEach((entry) => {
   const seg = thick > 0 ? entry.area / thick : 0
   out.push(vertical
    ? { ...entry.item, x: cx, y: offset, w: thick, h: seg }
    : { ...entry.item, x: offset, y: cy, w: seg, h: thick })
   offset += seg
  })
  if (vertical) { cx += thick; cw -= thick } else { cy += thick; ch -= thick }
  if (cw < 0.5 || ch < 0.5) break
 }
 return out
}

const weightedAverage = <T,>(rows: T[], value: (row: T) => number, weight: (row: T) => number): number => {
 const totalWeight = rows.reduce((sum, row) => sum + Math.max(0, weight(row)), 0)
 if (totalWeight <= 0) return 0
 return rows.reduce((sum, row) => sum + value(row) * Math.max(0, weight(row)), 0) / totalWeight
}

const formatDurationSeconds = (seconds: number): string => {
 if (!Number.isFinite(seconds) || seconds <= 0) return "0:00"
 const mins = Math.floor(seconds / 60)
 const secs = Math.round(seconds % 60)
 return `${mins}:${String(secs).padStart(2, "0")}`
}


const videoShortTitle = (title: string, max = 34): string => title.length > max ? `${title.slice(0, max - 1)}…` : title

const BarcodeFingerprintAdvancedRenderer: React.FC<{
 rows: TubeExplorerVideoPoint[]
 metric: ExplorerMetricKey
 orderLabel: string
 onHover?: (row: TubeExplorerVideoPoint | null) => void
}> = ({ rows, metric, orderLabel, onHover }) => {
 const option = metricOptionFor(metric)
 const max = Math.max(...rows.map((row) => metricValue(row, metric)), 1)
 if (rows.length === 0) return <Empty label={`No ${option.label} values available for barcode`} />
 const slot = 920 / rows.length
 // Percentile rank spreads the ramp across the set, so a long tail still reads as a gradient.
 const ordered = [...rows].map((row) => metricValue(row, metric)).sort((a, b) => a - b)
 const rankOf = (value: number) =>
  ordered.length > 1 ? ordered.findIndex((entry) => entry >= value) / (ordered.length - 1) : 1
 return (
  <div className="flex h-full flex-col overflow-hidden bg-[#0a0a1a] text-white">
   <svg viewBox="0 0 980 300" className="min-h-0 flex-1" role="img" aria-label={`Barcode fingerprint aligned around center by ${option.label}`}>
    <rect x="0" y="0" width="980" height="300" fill={EXPLORER_BG} />
    <line x1="24" y1="150" x2="956" y2="150" stroke="#ffffff" strokeWidth="2" opacity="0.24" />
    {rows.map((row, index) => {
     const value = metricValue(row, metric)
     const h = Math.max(12, (value / max) * 248)
     const w = Math.max(4, slot - 2)
     const x = 30 + index * slot
     const y = 150 - h / 2
     return (
      <rect
       key={row.videoId}
       x={x}
       y={y}
       width={w}
       height={h}
       rx="2"
       fill={heatColor(rankOf(value))}
       stroke="#000"
       strokeWidth="1.5"
       onMouseEnter={() => onHover?.(row)}
       onMouseLeave={() => onHover?.(null)}
      >
       <title>{`${row.title} · ${option.format(value)}`}</title>
      </rect>
     )
    })}
    <text x="30" y="34" fill="#ffffff" fontSize="12" fontWeight="1000" letterSpacing="2">{orderLabel} BY {option.label.toUpperCase()}</text>
    <text x="950" y="280" fill="#ffffff" textAnchor="end" fontSize="10" fontWeight="1000" opacity="0.46">BAR MIDPOINTS SHARE ONE HORIZONTAL CENTERLINE</text>
   </svg>
   <div className="flex shrink-0 items-center justify-center gap-3 px-4 py-2">
    <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.12em] text-white/35">COLD</span>
    <div
     className="h-6 w-[155px] shrink-0 rounded-[2px] border-[1px] border-white/90"
     style={{
      background: HEAT_GRADIENT,
      boxShadow: "0 0 6px rgba(250,97,138,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
     }}
    />
    <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.12em] text-white/35">HOT</span>
    <span className="ml-3 shrink-0 text-[9px] font-black uppercase tracking-[0.12em] text-white/18">RANK RELATIVE</span>
   </div>
  </div>
 )
}


const ViewsSubsGrowthQuadrantRenderer: React.FC<{ dataset: TubeExplorerVisualDataset }> = ({ dataset }) => {
 const rows = topVideos(dataset, "views", 90).filter((video) => video.views > 0 || video.subscribersGained > 0)
 if (rows.length === 0) return <Empty label="No video views or subscriber data available" />
 const [xMin, xMax] = paddedDomain(rows.map((row) => row.views))
 const [yMin, yMax] = paddedDomain(rows.map((row) => row.subscribersGained))
 const xMid = weightedAverage(rows, (row) => row.views, (row) => 1)
 const yMid = weightedAverage(rows, (row) => row.subscribersGained, (row) => Math.max(row.views, 1))
 return (
  <svg viewBox="0 0 900 360" className="h-full w-full bg-[#0a0a1a]" role="img" aria-label="Views by subscriber growth quadrant">
   <rect x="0" y="0" width="900" height="360" fill={EXPLORER_BG} />
   <line x1={scaleBetween(xMid, xMin, xMax, 70, 850)} y1="30" x2={scaleBetween(xMid, xMin, xMax, 70, 850)} y2="304" stroke="#ffffff" strokeWidth="2" opacity="0.3" />
   <line x1="70" y1={scaleBetween(yMid, yMin, yMax, 304, 34)} x2="850" y2={scaleBetween(yMid, yMin, yMax, 304, 34)} stroke="#ffffff" strokeWidth="2" opacity="0.3" />
   {["HIGH SUBS / LOW VIEWS", "HIGH SUBS / HIGH VIEWS", "LOW SUBS / LOW VIEWS", "LOW SUBS / HIGH VIEWS"].map((label, index) => (
    <text key={label} x={index % 2 ? 614 : 86} y={index > 1 ? 286 : 54} fill="#ffffff" opacity="0.38" fontSize="11" fontWeight="1000" letterSpacing="1.4">{label}</text>
   ))}
   {rows.map((row, index) => {
    const x = scaleBetween(row.views, xMin, xMax, 70, 850)
    const y = scaleBetween(row.subscribersGained, yMin, yMax, 304, 34)
    const radius = 5 + Math.sqrt(Math.max(row.watchHours, 0)) * 0.18
    return (
     <circle key={row.videoId} cx={x} cy={y} r={Math.min(22, radius)} fill={TRAFFIC_COLORS[index % TRAFFIC_COLORS.length]} stroke="#000" strokeWidth="3">
      <title>{`${row.title} · ${compact(row.views)} views · ${compact(row.subscribersGained)} subs`}</title>
     </circle>
    )
   })}
   <text x="70" y="334" fill="#00e5ff" fontSize="11" fontWeight="1000">VIEWS {compact(xMin)} → {compact(xMax)}</text>
   <text x="24" y="36" fill="#ccff00" fontSize="11" fontWeight="1000" transform="rotate(-90 24 36)">SUBS {compact(yMin)} → {compact(yMax)}</text>
  </svg>
 )
}

/**
 * One bar per video for subscribers gained, in upload order, with the cumulative
 * subscriber journey traced over the top. Bars are coloured by format so a spike
 * immediately reads as Shorts or long-form.
 */
const SubscriberWaterfallRenderer: React.FC<{
 rows: TubeExplorerVideoPoint[]
 onHover?: (row: { video: TubeExplorerVideoPoint; cumulative: number } | null) => void
}> = ({ rows, onHover }) => {
 if (rows.length === 0) return <Empty label="No subscriber gain rows available for waterfall" />

 const W = 1080
 const H = 380
 const padL = 48
 const padR = 20
 const padT = 26
 const padB = 40
 const plotW = W - padL - padR
 const plotH = H - padT - padB

 // Running total built by scan instead of a mutable accumulator captured in map.
 const points = rows.reduce<Array<{ video: TubeExplorerVideoPoint; cumulative: number }>>((acc, video) => {
  const previous = acc.length ? acc[acc.length - 1].cumulative : 0
  acc.push({ video, cumulative: previous + video.subscribersGained })
  return acc
 }, [])
 const running = points.length ? points[points.length - 1].cumulative : 0

 const barMax = Math.max(...rows.map((r) => Math.abs(r.subscribersGained)), 1)
 const cumMax = Math.max(...points.map((p) => p.cumulative), 1)
 const slot = plotW / Math.max(points.length, 1)
 const barW = Math.max(1.5, Math.min(14, slot - 1.5))
 const baseY = padT + plotH
 const yBar = (v: number) => baseY - (Math.abs(v) / barMax) * plotH * 0.62
 const yCum = (v: number) => baseY - (v / cumMax) * plotH * 0.92

 const linePath = points
  .map((p, i) => `${i === 0 ? "M" : "L"}${(padL + i * slot + slot / 2).toFixed(1)},${yCum(p.cumulative).toFixed(1)}`)
  .join(" ")

 const ticks = [0, 0.25, 0.5, 0.75, 1]

 return (
  <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-full w-full" role="img" aria-label="Subscriber waterfall per video with cumulative line">
   <rect width={W} height={H} fill={EXPLORER_BG} />
   {ticks.map((t) => {
    const y = baseY - t * plotH * 0.92
    return (
     <g key={t}>
      <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#ffffff" strokeWidth="1" opacity="0.08" />
      <text x={padL - 7} y={y + 3} textAnchor="end" fill="#ffffff" fontSize="9" fontWeight="1000" opacity="0.45">
       {compact(cumMax * t)}
      </text>
     </g>
    )
   })}

   {points.map((p, i) => {
    const x = padL + i * slot + (slot - barW) / 2
    const top = yBar(p.video.subscribersGained)
    return (
     <rect
      key={p.video.videoId}
      x={x}
      y={top}
      width={barW}
      height={Math.max(1, baseY - top)}
      fill={p.video.format === "shorts" ? SHORTS_TONE : LONGS_TONE}
      opacity="0.95"
      onMouseEnter={() => onHover?.(p)}
      onMouseLeave={() => onHover?.(null)}
     >
      <title>{`${p.video.title} · +${p.video.subscribersGained} subs`}</title>
     </rect>
    )
   })}

   <path d={linePath} fill="none" stroke="#C0F240" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
   <line x1={padL} y1={baseY} x2={W - padR} y2={baseY} stroke="#ffffff" strokeWidth="1" opacity="0.3" />

   <text x={W - padR} y={padT - 8} textAnchor="end" fill="#C0F240" fontSize="11" fontWeight="1000" letterSpacing="1">
    CUMULATIVE: +{compact(running)} SUBS
   </text>
   <text x={padL} y={H - 12} fill="#ffffff" fontSize="9" fontWeight="1000" opacity="0.42" letterSpacing="1">OLDEST</text>
   <text x={W / 2} y={H - 12} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="1000" opacity="0.42" letterSpacing="1">
    PINK = SHORTS · CYAN = LONG-FORM · {points.length} VIDEOS
   </text>
   <text x={W - padR} y={H - 12} textAnchor="end" fill="#ffffff" fontSize="9" fontWeight="1000" opacity="0.42" letterSpacing="1">LATEST</text>
  </svg>
 )
}

const SHORTS_TONE = "#FF2E93"
const LONGS_TONE = "#2ED2E6"

const DUEL_METRICS = [
 { key: "views", label: "VIEWS", format: compact },
 { key: "watchHours", label: "WATCH TIME", format: (v: number) => `${compact(v)}h` },
 { key: "likes", label: "LIKES", format: compact },
 { key: "comments", label: "COMMENTS", format: compact },
 { key: "shares", label: "SHARES", format: compact },
 { key: "subscribersGained", label: "SUBS", format: compact },
 { key: "revenue", label: "REVENUE", format: (v: number) => `$${v.toFixed(2)}` },
] as const

/**
 * Head-to-head duel: every metric is one row with both formats growing outward
 * from a shared centre line. Each row is scaled to its own larger side so the
 * comparison stays readable when magnitudes differ wildly between metrics.
 */
const ShortsLongsRenderer: React.FC<{
 shorts: TubeExplorerVideoPoint[]
 longs: TubeExplorerVideoPoint[]
 average: boolean
 onHover?: (row: { label: string; shorts: number; longs: number; format: (v: number) => string } | null) => void
}> = ({ shorts, longs, average, onHover }) => {
 if (shorts.length === 0 && longs.length === 0) return <Empty label="No Shorts or long-form rows available" />

 const agg = (rows: TubeExplorerVideoPoint[], key: (typeof DUEL_METRICS)[number]["key"]) => {
  const sum = rows.reduce((total, row) => total + (Number(row[key]) || 0), 0)
  return average ? (rows.length ? sum / rows.length : 0) : sum
 }

 const W = 1000
 const rowH = 46
 const H = 44 + DUEL_METRICS.length * rowH + 16
 const mid = W / 2
 const halfMax = mid - 96

 return (
  <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-full w-full" role="img" aria-label="Shorts versus long-form head to head">
   <rect width={W} height={H} fill={EXPLORER_BG} />
   <text x={mid - 14} y="22" textAnchor="end" fill={SHORTS_TONE} fontSize="12" fontWeight="1000" letterSpacing="1">
    ◀ SHORTS ({shorts.length})
   </text>
   <text x={mid + 14} y="22" fill={LONGS_TONE} fontSize="12" fontWeight="1000" letterSpacing="1">
    LONGS ({longs.length}) ▶
   </text>

   {DUEL_METRICS.map((metric, index) => {
    const s = agg(shorts, metric.key)
    const l = agg(longs, metric.key)
    const peak = Math.max(s, l, 1)
    const sw = (s / peak) * halfMax
    const lw = (l / peak) * halfMax
    const y = 44 + index * rowH
    const barH = rowH - 16
    return (
     <g
      key={metric.key}
      onMouseEnter={() => onHover?.({ label: metric.label, shorts: s, longs: l, format: metric.format })}
      onMouseLeave={() => onHover?.(null)}
     >
      <rect x="0" y={y - 4} width={W} height={rowH} fill="transparent" />
      <rect x={mid - sw} y={y} width={sw} height={barH} rx="4" fill={SHORTS_TONE} stroke="#000" strokeWidth="2" />
      <rect x={mid} y={y} width={lw} height={barH} rx="4" fill={LONGS_TONE} stroke="#000" strokeWidth="2" />
      <text x={mid - sw - 8} y={y + barH / 2 + 4} textAnchor="end" fill={SHORTS_TONE} fontSize="11" fontWeight="1000">
       {metric.format(s)}
      </text>
      <text x={mid + lw + 8} y={y + barH / 2 + 4} fill={LONGS_TONE} fontSize="11" fontWeight="1000">
       {metric.format(l)}
      </text>
      <text x={mid} y={y + barH / 2 + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="1000" opacity="0.92" style={{ paintOrder: "stroke" }} stroke="#000" strokeWidth="3">
       {metric.label}
      </text>
     </g>
    )
   })}
   <line x1={mid} y1="30" x2={mid} y2={H - 12} stroke="#ffffff" strokeWidth="1" opacity="0.5" />
  </svg>
 )
}

/** Axes for the per-video radar. CTR and retention are deliberately excluded. */
const RADAR_AXES = [
 { key: "views", label: "VIEWS", read: (v: TubeExplorerVideoPoint) => v.views, format: compact },
 { key: "watch", label: "WATCH", read: (v: TubeExplorerVideoPoint) => v.watchHours, format: (n: number) => `${compact(n)}h` },
 { key: "revenue", label: "REVENUE", read: (v: TubeExplorerVideoPoint) => v.revenue, format: (n: number) => `$${n.toFixed(2)}` },
 { key: "likeRate", label: "LIKE RATE", read: (v: TubeExplorerVideoPoint) => v.likeRate, format: (n: number) => `${n.toFixed(2)}%` },
 { key: "subs1k", label: "SUBS/1K", read: (v: TubeExplorerVideoPoint) => (v.views > 0 ? (v.subscribersGained / v.views) * 1000 : 0), format: (n: number) => n.toFixed(2) },
 { key: "comments", label: "COMMENTS", read: (v: TubeExplorerVideoPoint) => v.comments, format: compact },
] as const

/**
 * One polygon per video across shared axes. Every axis is normalised against the
 * best value in the current selection, so the shape shows where each video wins
 * relative to its peers rather than in absolute units.
 */
const EngagementRadarRenderer: React.FC<{
 videos: TubeExplorerVideoPoint[]
 colors: string[]
 hoveredId: string | null
 onHover?: (video: TubeExplorerVideoPoint | null) => void
}> = ({ videos, colors, hoveredId, onHover }) => {
 if (videos.length === 0) return <Empty label="No videos available for the engagement radar" />

 const size = 380
 const cx = size / 2
 const cy = size / 2
 const radius = size / 2 - 46
 const axisMax = RADAR_AXES.map((axis) => Math.max(...videos.map((v) => axis.read(v)), 1e-9))

 const pointAt = (axisIndex: number, ratio: number) => {
  const angle = (Math.PI * 2 * axisIndex) / RADAR_AXES.length - Math.PI / 2
  return [cx + Math.cos(angle) * radius * ratio, cy + Math.sin(angle) * radius * ratio]
 }

 return (
  <div className="flex h-full w-full items-stretch gap-2 bg-[#0a0a1a] p-2">
   <div className="relative min-w-0 flex-1">
    <svg viewBox={`0 0 ${size} ${size}`} className="block h-full w-full" role="img" aria-label="Engagement radar comparing top videos">
     {[0.25, 0.5, 0.75, 1].map((ring) => (
      <polygon
       key={ring}
       points={RADAR_AXES.map((_, i) => pointAt(i, ring).join(",")).join(" ")}
       fill="none"
       stroke="#ffffff"
       strokeWidth="1"
       opacity={ring === 1 ? 0.28 : 0.12}
      />
     ))}
     {RADAR_AXES.map((axis, i) => {
      const [x, y] = pointAt(i, 1)
      const [lx, ly] = pointAt(i, 1.17)
      return (
       <g key={axis.key}>
        <line x1={cx} y1={cy} x2={x} y2={y} stroke="#ffffff" strokeWidth="1" opacity="0.14" />
        <text x={lx} y={ly + 3} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="1000" opacity="0.62" letterSpacing="0.5">
         {axis.label}
        </text>
       </g>
      )
     })}
     {videos.map((video, index) => {
      const dim = hoveredId !== null && hoveredId !== video.videoId
      const pts = RADAR_AXES.map((axis, i) => pointAt(i, Math.max(0, Math.min(1, axis.read(video) / axisMax[i]))).join(",")).join(" ")
      return (
       <polygon
        key={video.videoId}
        points={pts}
        fill={colors[index % colors.length]}
        fillOpacity={dim ? 0.03 : hoveredId === video.videoId ? 0.3 : 0.1}
        stroke={colors[index % colors.length]}
        strokeWidth={hoveredId === video.videoId ? 3 : 1.5}
        opacity={dim ? 0.22 : 1}
        style={{ transition: "opacity .15s, fill-opacity .15s" }}
        onMouseEnter={() => onHover?.(video)}
        onMouseLeave={() => onHover?.(null)}
       />
      )
     })}
    </svg>
   </div>
   <div className="w-[230px] shrink-0 overflow-auto rounded-[8px] bg-black/40 p-2">
    <div className="mb-1 text-[8px] font-black uppercase tracking-[0.14em] text-white/40">
     TOP {videos.length} BY VIEWS
    </div>
    {videos.map((video, index) => (
     <button
      key={video.videoId}
      type="button"
      className="mb-1 flex w-full items-start gap-2 rounded-[6px] border-0 bg-transparent p-1 text-left"
      style={{ opacity: hoveredId !== null && hoveredId !== video.videoId ? 0.4 : 1 }}
      onMouseEnter={() => onHover?.(video)}
      onMouseLeave={() => onHover?.(null)}
     >
      <span className="mt-[2px] h-3 w-3 shrink-0 rounded-[2px]" style={{ background: colors[index % colors.length] }} />
      <span className="min-w-0 flex-1">
       <span className="block truncate text-[9.5px] font-[1000] uppercase leading-tight text-white">
        {videoShortTitle(video.title, 30)}
       </span>
       <span className="block text-[8px] font-black uppercase tracking-[0.06em] text-white/45">
        {compact(video.views)} views · {video.format === "shorts" ? "S" : "L"}
       </span>
      </span>
     </button>
    ))}
   </div>
  </div>
 )
}

type TrafficDayPoint = {
 day: string
 source: string
 views: number
 watchHours: number
 engagedViews: number
}

const trafficDayPoint = (row: Record<string, unknown>): TrafficDayPoint => ({
 day: String(row.day || row.Day || row.date || row.Date || ""),
 source: String(row.term || row.source || row["Traffic Source"] || row.trafficSourceType || "Unknown"),
 views: numericValue(row.views || row.Views),
 watchHours: numericValue(row.watchTime || row.watchHours || row["Watch Time"] || row["Watch time"]),
 engagedViews: numericValue(row.engagedViews || row["Engaged Views"]),
})

/**
 * Bipartite flow map: traffic sources are a proportional bar across the top, the
 * last fourteen days are a proportional bar across the bottom, and every
 * source-day pair with views becomes a ribbon whose width is that pair's share.
 * Each block therefore emits and receives many overlapping flows.
 */
type RiverHighlight = { kind: "source" | "day" | "flow"; source?: string; day?: string } | null

type RiverGrain = "day" | "week" | "month"

const RIVER_GRAINS: Array<{ value: RiverGrain; label: string; count: number; axis: string }> = [
 { value: "day", label: "14 DAYS", count: 14, axis: "LAST 14 DAYS" },
 { value: "week", label: "12 WEEKS", count: 12, axis: "LAST 12 WEEKS" },
 { value: "month", label: "12 MONTHS", count: 12, axis: "LAST 12 MONTHS" },
]

/**
 * "YYYY-MM-DD" parses as UTC midnight while getDay()/getDate() read local time, so
 * west-of-UTC clocks would land a row on the previous day and split a week across
 * two buckets. Build the date from parts to keep bucketing in local time.
 */
const parseLocalDay = (day: string): Date | null => {
 const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(day).trim())
 if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
 const fallback = new Date(day)
 return Number.isNaN(fallback.getTime()) ? null : fallback
}

/** Collapses a daily row onto the bucket that owns it, so one bottom block can be a day, a week, or a month. */
const riverBucket = (day: string, grain: RiverGrain): { key: string; label: string; ts: number } => {
 const parsed = parseLocalDay(day)
 if (!parsed) return { key: day, label: day, ts: 0 }
 if (grain === "month") {
  const start = new Date(parsed.getFullYear(), parsed.getMonth(), 1)
  return {
   key: `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`,
   label: start.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
   ts: start.getTime(),
  }
 }
 if (grain === "week") {
  const start = new Date(parsed)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)) // week begins Monday
  start.setHours(0, 0, 0, 0)
  return {
   key: `W${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()}`,
   label: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
   ts: start.getTime(),
  }
 }
 const midnight = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
 return {
  key: day,
  label: midnight.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  ts: midnight.getTime(),
 }
}

const TrafficDayRiverDeltaRenderer: React.FC<{
 rows: any[]
 sourceLimit: number
 grain: RiverGrain
 highlight: RiverHighlight
 onHighlight?: (next: RiverHighlight) => void
 onHover?: (info: { label: string; views: number; sub: string } | null) => void
}> = ({ rows, sourceLimit, grain, highlight, onHighlight, onHover }) => {
 const points = useMemo(() => rows.map((row) => trafficDayPoint(row)).filter((row) => row.day && row.views > 0), [rows])
 if (points.length === 0) return <Empty label="Sync Traffic Source x Day to populate the 14-day river delta" />

 const grainSpec = RIVER_GRAINS.find((entry) => entry.value === grain) || RIVER_GRAINS[0]
 const bucketed = points.map((row) => ({ ...row, bucket: riverBucket(row.day, grain) }))
 const bucketMeta = new Map<string, { label: string; ts: number }>()
 bucketed.forEach((row) => bucketMeta.set(row.bucket.key, { label: row.bucket.label, ts: row.bucket.ts }))
 const days = [...bucketMeta.entries()]
  .sort((a, b) => b[1].ts - a[1].ts)
  .slice(0, grainSpec.count)
  .reverse()
  .map(([key]) => key)
 const daySet = new Set(days)
 const inWindow = bucketed
  .filter((row) => daySet.has(row.bucket.key))
  .map((row) => ({ ...row, day: row.bucket.key }))
 const bucketLabel = (key: string) => bucketMeta.get(key)?.label || key

 const sourceTotals = new Map<string, number>()
 inWindow.forEach((r) => sourceTotals.set(r.source, (sourceTotals.get(r.source) || 0) + r.views))
 const sources = [...sourceTotals.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, sourceLimit)
  .map(([source]) => source)
 const sourceSet = new Set(sources)
 const scoped = inWindow.filter((r) => sourceSet.has(r.source))
 if (scoped.length === 0) return <Empty label={`No traffic rows in the ${grainSpec.label.toLowerCase()}`} />

 const dayTotals = new Map<string, number>()
 scoped.forEach((r) => dayTotals.set(r.day, (dayTotals.get(r.day) || 0) + r.views))
 const grandTotal = scoped.reduce((sum, r) => sum + r.views, 0) || 1

 const W = 1000
 const H = 430
 const padX = 26
 const barH = 26
 const topY = 34
 const botY = H - 62
 const usable = W - padX * 2
 const gap = 2

 // Proportional node bars. Offsets are derived from a running scan rather than a
 // mutable cursor so nothing is reassigned across the render pass.
 const laneWidths = (totals: number[], count: number) =>
  totals.map((total) => Math.max(3, (total / grandTotal) * (usable - gap * Math.max(count - 1, 0))))
 const offsetsFrom = (widths: number[]) =>
  widths.map((_, index) => padX + widths.slice(0, index).reduce((sum, width) => sum + width + gap, 0))

 const srcTotalsList = sources.map((source) => sourceTotals.get(source) || 0)
 const srcWidths = laneWidths(srcTotalsList, sources.length)
 const srcXs = offsetsFrom(srcWidths)
 const srcNodes = sources.map((source, index) => ({
  source,
  x: srcXs[index],
  w: srcWidths[index],
  total: srcTotalsList[index],
  color: TRAFFIC_COLORS[index % TRAFFIC_COLORS.length],
 }))

 const dayTotalsList = days.map((day) => dayTotals.get(day) || 0)
 const dayWidths = laneWidths(dayTotalsList, days.length)
 const dayXs = offsetsFrom(dayWidths)
 const dayNodes = days.map((day, index) => ({
  day,
  x: dayXs[index],
  w: dayWidths[index],
  total: dayTotalsList[index],
 }))

 const srcOffset = new Map(srcNodes.map((n) => [n.source, n.x]))
 const dayOffset = new Map(dayNodes.map((n) => [n.day, n.x]))

 // Ribbons, biggest first so small flows draw on top and stay clickable
 /**
  * Hovering a source lights every flow leaving it, hovering a day lights every
  * flow arriving at it, and hovering a ribbon lights just that pair. Passing
  * `undefined` for one side asks "does this node participate at all".
  */
 const pairKeys = new Set(scoped.map((r) => `${r.source}|${r.day}`)) // one entry per source->bucket pair
 const isLit = (source?: string, day?: string): boolean => {
  if (!highlight) return true
  if (highlight.kind === "source") {
   if (source !== undefined) return source === highlight.source
   // A day node stays lit only if this source actually reaches it.
   return day !== undefined && pairKeys.has(`${highlight.source}|${day}`)
  }
  if (highlight.kind === "day") {
   if (day !== undefined) return day === highlight.day
   return source !== undefined && pairKeys.has(`${source}|${highlight.day}`)
  }
  return (source === undefined || source === highlight.source) && (day === undefined || day === highlight.day)
 }

 // One ribbon per source->bucket pair. Week and month buckets absorb many daily
 // rows, so without this collapse each underlying day drew its own river.
 const flowTotals = new Map<string, { source: string; day: string; views: number }>()
 scoped.forEach((row) => {
  const key = `${row.source}|${row.day}`
  const existing = flowTotals.get(key)
  if (existing) existing.views += row.views
  else flowTotals.set(key, { source: row.source, day: row.day, views: row.views })
 })

 const ribbons = [...flowTotals.values()]
  .sort((a, b) => b.views - a.views)
  .map((row) => {
   const src = srcNodes.find((n) => n.source === row.source)!
   const day = dayNodes.find((n) => n.day === row.day)!
   const sw = (row.views / Math.max(src.total, 1)) * src.w
   const dw = (row.views / Math.max(day.total, 1)) * day.w
   const sx = srcOffset.get(row.source)!
   const dx = dayOffset.get(row.day)!
   srcOffset.set(row.source, sx + sw)
   dayOffset.set(row.day, dx + dw)
   const y1 = topY + barH
   const y2 = botY
   const cy = (y1 + y2) / 2
   const path = `M${sx},${y1} C${sx},${cy} ${dx},${cy} ${dx},${y2} L${dx + dw},${y2} C${dx + dw},${cy} ${sx + sw},${cy} ${sx + sw},${y1} Z`
   return { row, path, color: src.color, width: Math.min(sw, dw) }
  })

 return (
  <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-full w-full" role="img" aria-label="Traffic source to day river delta">
   <rect width={W} height={H} fill={EXPLORER_BG} />

   {ribbons.map((ribbon, i) => {
    const lit = isLit(ribbon.row.source, ribbon.row.day)
    return (
    <path
     key={`${ribbon.row.source}-${ribbon.row.day}-${i}`}
     d={ribbon.path}
     fill={ribbon.color}
     opacity={highlight ? (lit ? 0.88 : 0.07) : 0.34}
     style={{ transition: "opacity .12s" }}
     onMouseEnter={() => {
      onHighlight?.({ kind: "flow", source: ribbon.row.source, day: ribbon.row.day })
      onHover?.({
       label: `${formatTrafficLabel(ribbon.row.source)} → ${bucketLabel(ribbon.row.day)}`,
       views: ribbon.row.views,
       sub: bucketLabel(ribbon.row.day),
      })
     }}
     onMouseLeave={() => { onHighlight?.(null); onHover?.(null) }}
    >
     <title>{`${formatTrafficLabel(ribbon.row.source)} · ${bucketLabel(ribbon.row.day)} · ${compact(ribbon.row.views)} views`}</title>
    </path>
    )
   })}

   {srcNodes.map((node) => (
    <g
     key={node.source}
     style={{ cursor: "pointer" }}
     onMouseEnter={() => {
      onHighlight?.({ kind: "source", source: node.source })
      onHover?.({ label: formatTrafficLabel(node.source), views: node.total, sub: "ALL DAYS" })
     }}
     onMouseLeave={() => { onHighlight?.(null); onHover?.(null) }}
    >
     <rect
      x={node.x}
      y={topY}
      width={node.w}
      height={barH}
      rx="4"
      fill={node.color}
      stroke={highlight?.kind === "source" && highlight.source === node.source ? "#fff" : "#000"}
      strokeWidth={highlight?.kind === "source" && highlight.source === node.source ? 3 : 2}
      opacity={highlight && !isLit(node.source, undefined) ? 0.35 : 1}
     />
     {node.w > 46 && (
      <text x={node.x + node.w / 2} y={topY + barH / 2 + 4} textAnchor="middle" fill="#000" fontSize="9" fontWeight="1000">
       {formatTrafficLabel(node.source).toUpperCase().slice(0, Math.floor(node.w / 6))}
      </text>
     )}
    </g>
   ))}

   {dayNodes.map((node) => (
    <g
     key={node.day}
     style={{ cursor: "pointer" }}
     onMouseEnter={() => {
      onHighlight?.({ kind: "day", day: node.day })
      onHover?.({ label: bucketLabel(node.day), views: node.total, sub: "ALL SOURCES" })
     }}
     onMouseLeave={() => { onHighlight?.(null); onHover?.(null) }}
    >
     <rect
      x={node.x}
      y={botY}
      width={node.w}
      height={barH}
      rx="4"
      fill="#E5E7EB"
      stroke={highlight?.kind === "day" && highlight.day === node.day ? "#fff" : "#000"}
      strokeWidth={highlight?.kind === "day" && highlight.day === node.day ? 3 : 2}
      opacity={highlight && !isLit(undefined, node.day) ? 0.35 : 1}
     />
     <text
      x={node.x + node.w / 2}
      y={botY + barH + 15}
      textAnchor="middle"
      fill="#ffffff"
      fontSize="8.5"
      fontWeight="1000"
      opacity="0.62"
     >
      {bucketLabel(node.day)}
     </text>
    </g>
   ))}

   <text x={padX} y={topY - 10} fill="#6c738f" fontSize="9" fontWeight="1000" letterSpacing="1">↑ TRAFFIC SOURCES</text>
   <text x={padX} y={H - 8} fill="#6c738f" fontSize="9" fontWeight="1000" letterSpacing="1">↓ {grainSpec.axis}</text>
  </svg>
 )
}


const RevenueEfficiencyMapRenderer: React.FC<{
 dataset: TubeExplorerVisualDataset
 xMetric: VideoPlotMetricKey
 yMetric: VideoPlotMetricKey
 sizeMetric: VideoPlotMetricKey
 formatMode: string
 limit: number
}> = ({ dataset, xMetric, yMetric, sizeMetric, formatMode, limit }) => {
 const scoped = filterVideosByFormat(dataset.videos, formatMode)
 const rows = topVideosByPlotMetric(scoped, sizeMetric, limit).filter((video) => plotMetricValue(video, xMetric) > 0 || plotMetricValue(video, yMetric) > 0)
 if (rows.length === 0) return <Empty label="No revenue rows available for efficiency map" />
 const xOption = plotMetricOptionFor(xMetric)
 const yOption = plotMetricOptionFor(yMetric)
 const sizeOption = plotMetricOptionFor(sizeMetric)
 const [xMin, xMax] = paddedDomain(rows.map((row) => plotMetricValue(row, xMetric)))
 const [yMin, yMax] = paddedDomain(rows.map((row) => plotMetricValue(row, yMetric)))
 const maxSize = Math.max(...rows.map((row) => plotMetricValue(row, sizeMetric)), 1)
 return (
  <svg viewBox="0 0 920 360" className="h-full w-full bg-[#0a0a1a]" role="img" aria-label={`Revenue efficiency map plotting ${xOption.label} against ${yOption.label}`}>
   <rect width="920" height="360" fill={EXPLORER_BG} />
   {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
    const x = 56 + tick * 808
    const y = 306 - tick * 270
    return <g key={tick}><line x1={x} y1="36" x2={x} y2="306" stroke="#ffffff" opacity="0.08" /><line x1="56" y1={y} x2="864" y2={y} stroke="#ffffff" opacity="0.08" /></g>
   })}
   {rows.map((row, index) => {
    const xValue = plotMetricValue(row, xMetric)
    const yValue = plotMetricValue(row, yMetric)
    const sizeValue = plotMetricValue(row, sizeMetric)
    const x = scaleBetween(xValue, xMin, xMax, 56, 864)
    const y = scaleBetween(yValue, yMin, yMax, 306, 36)
    const radius = 7 + Math.sqrt(Math.max(sizeValue, 0) / maxSize) * 28
    return (
     <circle key={row.videoId} cx={x} cy={y} r={Math.min(36, radius)} fill={TRAFFIC_COLORS[index % TRAFFIC_COLORS.length]} stroke="#000" strokeWidth="3" opacity="0.88">
      <title>{`${row.title} · ${xOption.label}: ${xOption.format(xValue)} · ${yOption.label}: ${yOption.format(yValue)} · ${sizeOption.label}: ${sizeOption.format(sizeValue)}`}</title>
     </circle>
    )
   })}
   <text x="58" y="28" fill="#00e5ff" fontSize="11" fontWeight="1000">X = {xOption.label.toUpperCase()} · Y = {yOption.label.toUpperCase()} · SIZE = {sizeOption.label.toUpperCase()}</text>
   <text x="58" y="334" fill="#ffffff" fontSize="10" fontWeight="1000" opacity="0.52">AXES SCALE TO THE SELECTED VIDEOS SO POINTS DO NOT COLLAPSE TO ONE EDGE</text>
  </svg>
 )
}

const LikeRateWaveformRenderer: React.FC<{
 dataset: TubeExplorerVisualDataset
 metric: VideoPlotMetricKey
 formatMode: string
 order: "recent" | "top"
 limit: number
}> = ({ dataset, metric, formatMode, order, limit }) => {
 const metricOption = plotMetricOptionFor(metric)
 const scoped = filterVideosByFormat(dataset.videos, formatMode).filter((video) => plotMetricValue(video, metric) > 0)
 const rows = (order === "recent"
  ? [...scoped].sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()).slice(-limit)
  : topVideosByPlotMetric(scoped, metric, limit))
 if (rows.length === 0) return <Empty label="No rows available for waveform" />
 const domain = paddedDomain(rows.map((row) => plotMetricValue(row, metric)))
 const points = rows.map((row, index) => {
  const x = 34 + index * (900 / Math.max(rows.length - 1, 1))
  const y = scaleBetween(plotMetricValue(row, metric), domain[0], domain[1], 284, 42)
  return `${x},${y}`
 }).join(" ")
 return (
  <svg viewBox="0 0 970 330" className="h-full w-full bg-[#0a0a1a]" role="img" aria-label={`${metricOption.label} waveform`}>
   <rect width="970" height="330" fill={EXPLORER_BG} />
   <line x1="34" y1="163" x2="934" y2="163" stroke="#ffffff" strokeWidth="2" opacity="0.18" />
   <polyline points={points} fill="none" stroke="#ff83ea" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
   {rows.map((row, index) => {
    if (index % Math.max(1, Math.floor(rows.length / 24)) !== 0) return null
    const x = 34 + index * (900 / Math.max(rows.length - 1, 1))
    const value = plotMetricValue(row, metric)
    const y = scaleBetween(value, domain[0], domain[1], 284, 42)
    return <circle key={row.videoId} cx={x} cy={y} r="6" fill={TRAFFIC_COLORS[index % TRAFFIC_COLORS.length]} stroke="#000" strokeWidth="2"><title>{`${row.title} · ${metricOption.label}: ${metricOption.format(value)}`}</title></circle>
   })}
   <text x="34" y="24" fill="#ffffff" fontSize="11" fontWeight="1000">{metricOption.label.toUpperCase()} RANGE {metricOption.format(domain[0])} → {metricOption.format(domain[1])}</text>
  </svg>
 )
}

const SeasonalityRadarRenderer: React.FC<{
 dataset: TubeExplorerVisualDataset
 metric: VideoPlotMetricKey
 formatMode: string
}> = ({ dataset, metric, formatMode }) => {
 const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
 const metricOption = plotMetricOptionFor(metric)
 const scoped = filterVideosByFormat(dataset.videos, formatMode)
 const rows = weekdays.map((day) => {
  const videos = scoped.filter((video) => video.dayKey === day)
  const value = metricOption.average
   ? weightedAverage(videos, (video) => plotMetricValue(video, metric), (video) => Math.max(video.views, 1))
   : videos.reduce((sum, video) => sum + plotMetricValue(video, metric), 0)
  return { day, value, formatted: metricOption.format(value), uploads: videos.length }
 })
 const max = Math.max(...rows.map((row) => row.value), 1)
 return (
  <ResponsiveContainer width="100%" height="100%">
   <RadarChart data={rows.map((row) => ({ ...row, score: (row.value / max) * 100 }))}>
    <PolarGrid stroke="#ffffff" opacity={0.28} />
    <PolarAngleAxis dataKey="day" tick={{ fill: "#fff", fontSize: 12, fontWeight: 900 }} />
    <Radar dataKey="score" fill="#ffff61" fillOpacity={0.45} stroke="#00e5ff" strokeWidth={3} />
    <Tooltip content={<Tip />} />
   </RadarChart>
  </ResponsiveContainer>
 )
}

const BubbleUniverseRenderer: React.FC<{
 dataset: TubeExplorerVisualDataset
 xMetric: VideoPlotMetricKey
 yMetric: VideoPlotMetricKey
 sizeMetric: VideoPlotMetricKey
 formatMode: string
 limit: number
}> = ({ dataset, xMetric, yMetric, sizeMetric, formatMode, limit }) => {
 const scoped = filterVideosByFormat(dataset.videos, formatMode)
 const rows = topVideosByPlotMetric(scoped, sizeMetric, limit)
 if (rows.length === 0) return <Empty label="No video rows available for bubble universe" />
 const xOption = plotMetricOptionFor(xMetric)
 const yOption = plotMetricOptionFor(yMetric)
 const sizeOption = plotMetricOptionFor(sizeMetric)
 const [xMin, xMax] = paddedDomain(rows.map((row) => plotMetricValue(row, xMetric)))
 const [yMin, yMax] = paddedDomain(rows.map((row) => plotMetricValue(row, yMetric)))
 const maxSize = Math.max(...rows.map((row) => plotMetricValue(row, sizeMetric)), 1)
 return (
  <svg viewBox="0 0 920 360" className="h-full w-full bg-[#0a0a1a]" role="img" aria-label={`Bubble universe plotting ${xOption.label} against ${yOption.label}`}>
   <rect width="920" height="360" fill={EXPLORER_BG} />
   {rows.map((row, index) => {
    const xValue = plotMetricValue(row, xMetric)
    const yValue = plotMetricValue(row, yMetric)
    const sizeValue = plotMetricValue(row, sizeMetric)
    const x = scaleBetween(xValue, xMin, xMax, 52, 870)
    const y = scaleBetween(yValue, yMin, yMax, 306, 34)
    const radius = 7 + Math.sqrt(Math.max(sizeValue, 0) / maxSize) * 30
    return (
     <circle key={row.videoId} cx={x} cy={y} r={Math.min(38, radius)} fill={TRAFFIC_COLORS[index % TRAFFIC_COLORS.length]} stroke="#000" strokeWidth="3" opacity="0.86">
      <title>{`${row.title} · ${xOption.label}: ${xOption.format(xValue)} · ${yOption.label}: ${yOption.format(yValue)} · ${sizeOption.label}: ${sizeOption.format(sizeValue)}`}</title>
     </circle>
    )
   })}
   <text x="54" y="28" fill="#00e5ff" fontSize="11" fontWeight="1000">X = {xOption.label.toUpperCase()} · Y = {yOption.label.toUpperCase()} · SIZE = {sizeOption.label.toUpperCase()}</text>
  </svg>
 )
}

const RetentionCurveAtlasRenderer: React.FC<{
 dataset: TubeExplorerVisualDataset
 sortMetric: VideoPlotMetricKey
 formatMode: string
 limit: number
}> = ({ dataset, sortMetric, formatMode, limit }) => {
 const rows = topVideosByPlotMetric(filterVideosByFormat(dataset.videos, formatMode), sortMetric, limit).filter((video) => video.avp > 0 || video.retentionScore > 0)
 if (rows.length === 0) return <Empty label="No average view percentage rows available for retention atlas" />
 const sortOption = plotMetricOptionFor(sortMetric)
 const steps = [0, 10, 25, 40, 55, 70, 85, 100]
 return (
  <svg viewBox="0 0 960 360" className="h-full w-full bg-[#0a0a1a]" role="img" aria-label="Retention curve atlas">
   <rect width="960" height="360" fill={EXPLORER_BG} />
   {[0, 25, 50, 75, 100].map((line) => {
    const y = scaleBetween(line, 0, 100, 304, 44)
    return <g key={line}><line x1="52" y1={y} x2="910" y2={y} stroke="#ffffff" opacity="0.1" /><text x="36" y={y + 4} fill="#ffffff" fontSize="9" fontWeight="1000" opacity="0.44">{line}%</text></g>
   })}
   {rows.map((row, index) => {
    const end = Math.max(8, Math.min(92, row.avp || row.retentionScore))
    const curve = steps.map((step) => {
     const x = scaleBetween(step, 0, 100, 58, 900)
     const expected = 100 - (100 - end) * Math.pow(step / 100, 0.72 + index * 0.03)
     const y = scaleBetween(expected, 0, 100, 304, 44)
     return `${x},${y}`
    }).join(" ")
    return (
     <g key={row.videoId}>
      <polyline points={curve} fill="none" stroke={TRAFFIC_COLORS[index % TRAFFIC_COLORS.length]} strokeWidth={index === 0 ? 5 : 3} opacity={index === 0 ? 1 : 0.62} />
      <title>{`${row.title} · ${row.avp.toFixed(1)}% AVP`}</title>
     </g>
   )
  })}
   <text x="58" y="334" fill="#ffffff" fontSize="10" fontWeight="1000" opacity="0.56">SORTED BY {sortOption.label.toUpperCase()} · CURVES USE AVAILABLE AVP AS A RETENTION SHAPE PROXY UNTIL FULL RETENTION POINTS ARE SYNCED</text>
  </svg>
 )
}

const PUBLISH_CLOCK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const
const PUBLISH_CLOCK_HOURS = Array.from({ length: 24 }, (_, hour) => hour)

type PublishClockMetricKey = "views" | "watchHours" | "subscribersGained" | "likes" | "revenue" | "avp" | "uploads"

/**
 * Every metric except the raw upload count is a per-video average, so a slot with
 * many uploads cannot outrank a slot that genuinely performs better per video.
 */
const PUBLISH_CLOCK_METRICS: Array<{
 key: PublishClockMetricKey
 label: string
 format: (value: number) => string
 average: boolean
}> = [
 { key: "views", label: "AVG VIEWS", format: compact, average: true },
 { key: "watchHours", label: "AVG WATCH", format: (value) => `${compact(value)}h`, average: true },
 { key: "subscribersGained", label: "AVG SUBS", format: (value) => value.toFixed(1), average: true },
 { key: "likes", label: "AVG LIKES", format: (value) => value.toFixed(1), average: true },
 { key: "revenue", label: "AVG REV", format: (value) => `$${value.toFixed(2)}`, average: true },
 { key: "avp", label: "AVP %", format: (value) => `${value.toFixed(1)}%`, average: true },
 { key: "uploads", label: "UPLOADS", format: (value) => `${Math.round(value)}`, average: false },
]

const formatClockHour = (hour: number): string =>
 `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? "AM" : "PM"}`

type PublishClockCell = {
 dayIndex: number
 hour: number
 value: number
 uploads: number
 views: number
 subs: number
 comments: number
 likes: number
 revenue: number
 /** Percentile position among populated cells, which is what drives the colour ramp. */
 rank: number
}

const publishClockCellKey = (cell: PublishClockCell): string => `${cell.dayIndex}-${cell.hour}`

const PublishOptimalClockRenderer: React.FC<{
 cells: PublishClockCell[]
 metricLabel: string
 formatValue: (value: number) => string
 hoveredKey: string | null
 onHover?: (cell: PublishClockCell | null) => void
}> = ({ cells, metricLabel, formatValue, hoveredKey, onHover }) => {
 if (cells.every((cell) => cell.uploads === 0)) return <Empty label="No upload dates available for publish clock" />
 return (
  <div className="flex h-full flex-col overflow-hidden bg-[#080810] p-2 text-white">
   <div className="grid min-h-0 flex-1 grid-cols-[46px_minmax(0,1fr)] grid-rows-[20px_minmax(0,1fr)] gap-x-1">
    <div />
    <div className="grid text-center text-[8px] font-black uppercase leading-none text-white/55" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
     {PUBLISH_CLOCK_HOURS.map((hour) => <span key={hour} className="self-center">{hour}</span>)}
    </div>
    <div className="grid pr-2 text-right text-[10px] font-black uppercase text-white/70" style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}>
     {PUBLISH_CLOCK_DAYS.map((day) => <span key={day} className="flex items-center justify-end">{day}</span>)}
    </div>
    <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))", gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}>
     {cells.map((cell) => {
      const isHovered = hoveredKey === publishClockCellKey(cell)
      return (
       <div
        key={publishClockCellKey(cell)}
        className="flex min-h-[14px] flex-col items-center justify-center overflow-hidden leading-none"
        style={{
         background: cell.uploads > 0 ? publishClockColor(cell.rank) : "rgba(255,255,255,0.04)",
         border: isHovered ? "2px solid #fff" : "1px solid rgba(255,255,255,0.08)",
         borderRadius: 2,
         boxSizing: "border-box",
         transition: "border-color 80ms",
        }}
        title={`${PUBLISH_CLOCK_DAYS[cell.dayIndex]} ${cell.hour}:00 · ${formatValue(cell.value)} ${metricLabel.toLowerCase()} · ${cell.uploads} uploads`}
        onMouseEnter={() => onHover?.(cell)}
        onMouseLeave={() => onHover?.(null)}
       >
        {isHovered ? (
         <span className="flex flex-col items-center gap-[1px] text-[16px] font-black uppercase tracking-[0.04em]" style={{ color: "#0B1020" }}>
          <span>{PUBLISH_CLOCK_DAYS[cell.dayIndex]}</span>
          <span>{formatClockHour(cell.hour)}</span>
         </span>
        ) : null}
       </div>
      )
     })}
    </div>
   </div>
   <div className="mt-2 flex shrink-0 items-center justify-center gap-3 px-4 py-2">
    <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.12em] text-white/35">COLD</span>
    <div
     className="h-6 w-[155px] shrink-0 rounded-[2px] border-[1px] border-white/90"
     style={{
      background: PUBLISH_CLOCK_GRADIENT,
      boxShadow: "0 0 6px rgba(255,79,163,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
     }}
    />
    <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.12em] text-white/35">HOT</span>
    <span className="ml-3 shrink-0 text-[9px] font-black uppercase tracking-[0.12em] text-white/18">RANK RELATIVE</span>
   </div>
  </div>
 )
}

const ClockRadialBurstRenderer: React.FC<{ dataset: TubeExplorerVisualDataset }> = ({ dataset }) => {
 const [selectedKind, setSelectedKind] = useState<TrafficFocusKind>("search")
 const [hoveredDonutSliceKey, setHoveredDonutSliceKey] = useState<string | null>(null)
 const [hoveredDonutSlice, setHoveredDonutSlice] = useState<{ label: string; views: number; color: string; share: number; scope: string } | null>(null)

 const overviewSlices = useMemo(() => buildTrafficSourceSlices(dataset.traffic), [dataset.traffic])

 const activeKind = useMemo(() => {
  if (overviewSlices.some((slice) => slice.kind === selectedKind)) return selectedKind
  return overviewSlices[0]?.kind || "other"
 }, [overviewSlices, selectedKind])

 useEffect(() => {
  if (overviewSlices.length === 0) return
  if (!overviewSlices.some((slice) => slice.kind === selectedKind)) {
   setSelectedKind(overviewSlices[0].kind)
  }
 }, [overviewSlices, selectedKind])

 const activeSlice = overviewSlices.find((slice) => slice.kind === activeKind) || overviewSlices[0] || null
 const detailRows = useMemo(() => buildTrafficDetailRows(dataset.traffic, activeKind), [dataset.traffic, activeKind])
 const detailRowsVisible = detailRows.slice(0, 10)
 const detailSlices = detailRowsVisible.map((row) => ({
  label: formatDonutSourceLabel(row.label),
  views: row.views,
  color: row.color,
 }))
 const detailTotal = detailRowsVisible.reduce((sum, row) => sum + row.views, 0) || 1
 const totalViews = overviewSlices.reduce((sum, slice) => sum + slice.views, 0) || 1
 const activeDetail = detailRowsVisible[0] || null
 const detailLabel = trafficFocusLabel(activeKind)
 const selectedShare = activeSlice ? (activeSlice.views / totalViews) * 100 : 0
	 const renderDonut = (params: {
	  width: number
	  height: number
	  cx: number
	  cy: number
	  innerRadius: number
	  outerRadius: number
	  slices: Array<{ label: string; views: number; color: string; kind?: TrafficFocusKind }>
	  onPick?: (kind: TrafficFocusKind) => void
	  hoverScope: string
	  centerLabelTop: string
	  centerLabelMain: string
	  centerLabelBottom: string
	 }) => {
  const { width, height, cx, cy, innerRadius, outerRadius, slices, onPick, hoverScope, centerLabelTop, centerLabelMain, centerLabelBottom } = params
  const total = slices.reduce((sum, slice) => sum + slice.views, 0) || 1
  const visualTotal = slices.reduce((sum, slice) => sum + Math.max(slice.views / total, 0.02), 0) || 1
  const scopedHoveredSlice = hoveredDonutSlice?.scope === hoverScope ? hoveredDonutSlice : null
  const hoveredCenter = scopedHoveredSlice
   ? {
     top: scopedHoveredSlice.label,
     main: `${scopedHoveredSlice.share.toFixed(1)}%`,
     bottom: `OF ${hoverScope}`,
     color: scopedHoveredSlice.color,
    }
   : null
  let angle = -Math.PI / 2
  return (
   <svg viewBox={`0 0 ${width} ${height}`} className="block h-full w-full" style={{ background: EXPLORER_BG }}>
    {slices.map((slice, index) => {
     const fraction = slice.views / total
     // Preserve the reported percentage while giving sub-2% wedges enough area to inspect.
     const visualFraction = Math.max(fraction, 0.02) / visualTotal
     const startAngle = angle
     const endAngle = angle + visualFraction * Math.PI * 2
     angle = endAngle
     const isActive = activeKind === slice.kind
     const sliceKey = `${hoverScope}-${slice.kind || "detail"}-${slice.label}-${index}`
     const isHovered = hoveredDonutSliceKey === sliceKey
     const path = ringArcPath(cx, cy, startAngle + 0.02, endAngle - 0.02, innerRadius, outerRadius + (isHovered ? 12 : 0))
     const mid = (startAngle + endAngle) / 2
     const percentagePoint = polar(cx, cy, mid, innerRadius + (outerRadius - innerRadius) * 0.48)
     const displayLabel = formatDonutSourceLabel(slice.label)
     const percentLabelSize = visualFraction < 0.04 ? 7 : visualFraction < 0.08 ? 9 : 12
     return (
      <g
       key={sliceKey}
       onMouseEnter={() => {
        setHoveredDonutSliceKey(sliceKey)
        setHoveredDonutSlice({ label: displayLabel, views: slice.views, color: slice.color, share: fraction * 100, scope: hoverScope })
       }}
       onMouseLeave={() => {
        setHoveredDonutSliceKey(null)
        setHoveredDonutSlice(null)
       }}
       onClick={() => slice.kind && onPick?.(slice.kind)}
       style={{ cursor: slice.kind ? "pointer" : "default" }}>
       <path d={path} fill={slice.color} stroke={isActive ? "#ffffff" : slice.color} strokeWidth={isActive || isHovered ? 2 : 0.75} opacity={isActive ? 1 : 0.9} />
       <text x={percentagePoint.x} y={percentagePoint.y + 5} textAnchor="middle" style={{ fill: "#000000", fontSize: percentLabelSize, fontFamily: "inherit", fontWeight: 1000, pointerEvents: "none" }}>
        {(fraction * 100).toFixed(0)}%
       </text>
      </g>
     )
    })}
    <circle cx={cx} cy={cy} r={innerRadius - 6} fill={EXPLORER_SURFACE} stroke={hoveredCenter?.color || "#22283a"} strokeWidth={hoveredCenter ? 3 : 2} />
    {hoveredCenter ? (() => {
     const titleLines = splitDonutCenterLabel(hoveredCenter.top)
     const titleFontSize = titleLines.some((line) => line.length > 13) ? 8 : 9
     return <>
      {titleLines.map((line, index) => (
       <text key={`${line}-${index}`} x={cx} y={titleLines.length === 1 ? cy - 16 : cy - 23 + index * 11} textAnchor="middle" style={{ fill: hoveredCenter.color, fontSize: titleFontSize, fontFamily: "inherit", fontWeight: 1000, letterSpacing: "0.03em" }}>{line}</text>
      ))}
     </>
    })() : <text x={cx} y={cy - 14} textAnchor="middle" style={{ fill: "#a5abc7", fontSize: 9, fontFamily: "inherit", fontWeight: 1000, letterSpacing: "0.04em" }}>{centerLabelTop.toUpperCase()}</text>}
    <text x={cx} y={cy + 6} textAnchor="middle" style={{ fill: hoveredCenter?.color || "#ffffff", fontSize: 13, fontFamily: "inherit", fontWeight: 1000, letterSpacing: "0.03em" }}>
     {(hoveredCenter?.main || centerLabelMain).toUpperCase()}
    </text>
    <text x={cx} y={cy + 22} textAnchor="middle" style={{ fill: "#6f7899", fontSize: 9, fontFamily: "inherit", fontWeight: 1000, letterSpacing: "0.04em" }}>
     {(hoveredCenter?.bottom || centerLabelBottom).toUpperCase()}
    </text>
   </svg>
  )
 }

 if (overviewSlices.length === 0) return <Empty label="Sync or import traffic source rows to render the clock distribution." />

 return (
  <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#090b16] text-white">
   <div className="grid min-h-0 flex-1 grid-cols-[0.67fr_1.47fr_1.47fr_0.67fr] gap-0 bg-[#090b16] p-0">
    <div className="min-h-0 overflow-hidden rounded-[14px] border-[3px] border-black bg-[#0a0a1a] p-1.5">
     <div className="mb-1 flex items-center">
      <div className="min-w-0 flex-1">
       <div className="truncate text-[14px] font-black uppercase tracking-[0.04em] text-white">Traffic sources</div>
      </div>
     </div>
     <div className="space-y-1 overflow-hidden">
      {overviewSlices.slice(0, 10).map((slice) => {
       const share = (slice.views / totalViews) * 100
       return (
        <div key={slice.kind} className="flex w-full items-stretch overflow-hidden rounded-[9px] border-[2px] border-black text-left shadow-[2px_2px_0px_0px_rgba(0,0,0,0.22)]">
         <span className="w-[14px] shrink-0" style={{ background: slice.color }} />
         <span className="flex-1 bg-[#111321] px-2 py-1 text-black">
          <span className="block truncate text-[10px] font-black uppercase leading-tight" style={{ color: slice.color }}>{slice.label}</span>
          <span className="block text-[8px] font-black uppercase tracking-[0.1em] text-white">
           {compact(slice.views)} views • {share.toFixed(1)}%
          </span>
         </span>
        </div>
       )
      })}
     </div>
    </div>

    <div className="min-h-0 overflow-hidden rounded-[14px] border-[3px] border-black bg-[#0a0a1a] p-0">
     <div className="h-full min-h-0 overflow-hidden rounded-[12px] border-[2px] border-black bg-[#050814] p-0">
      {renderDonut({
       width: 420,
       height: 360,
       cx: 210,
       cy: 180,
       innerRadius: 70,
       outerRadius: 166,
       slices: overviewSlices,
       onPick: setSelectedKind,
       hoverScope: "TRAFFIC",
       centerLabelTop: "VIEWS",
       centerLabelMain: detailLabel,
       centerLabelBottom: "BURST",
      })}
     </div>
    </div>

    <div className="min-h-0 overflow-hidden rounded-[14px] border-[3px] border-black bg-[#0a0a1a] p-0">
     <div className="h-full min-h-0 overflow-hidden rounded-[12px] border-[2px] border-black bg-[#050814] p-0">
      {detailSlices.length > 0 ? (
       renderDonut({
        width: 420,
        height: 360,
        cx: 210,
        cy: 180,
        innerRadius: 70,
        outerRadius: 166,
        slices: detailSlices,
        hoverScope: detailLabel,
        centerLabelTop: activeKind === "search" ? "SEARCH" : activeKind === "external" ? "EXTERNAL" : "DETAIL",
        centerLabelMain: compact(detailTotal),
        centerLabelBottom: "TOP 10",
       })
      ) : (
       <div className="flex h-full items-center justify-center text-[11px] font-black uppercase tracking-[0.12em] text-white/45">
        No detail rows available
       </div>
      )}
     </div>
    </div>

    <div className="min-h-0 overflow-hidden rounded-[14px] border-[3px] border-black bg-[#0a0a1a] p-1.5">
     <div className="mb-1 flex items-center">
      <div className="min-w-0 flex-1">
       <div className="truncate text-[14px] font-black uppercase tracking-[0.04em] text-white">{detailLabel}</div>
      </div>
     </div>
     <div className="space-y-1 overflow-hidden">
      {detailRowsVisible.map((row, index) => {
       const share = (row.views / detailTotal) * 100
       const label = formatDonutSourceLabel(row.label)
       return (
        <div
         key={`${row.label}-${index}`}
         className="flex w-full items-stretch overflow-hidden rounded-[9px] border-[2px] border-black text-left shadow-[2px_2px_0px_0px_rgba(0,0,0,0.22)]">
         <span className="w-[14px] shrink-0" style={{ background: row.color }} />
         <span className="flex-1 bg-[#111321] px-2 py-1 text-black">
          <span className="block truncate text-[10px] font-black uppercase leading-tight" style={{ color: row.color }}>{label}</span>
          <span className="block text-[8px] font-black uppercase tracking-[0.1em] text-white">
           {compact(row.views)} views • {share.toFixed(1)}%
          </span>
         </span>
        </div>
       )
      })}
      {detailRowsVisible.length === 0 ? (
       <div className="rounded-[9px] border-[2px] border-black bg-[#111321] px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-white/70">
        No matching detail rows found for this traffic mode.
       </div>
      ) : null}
     </div>
    </div>
   </div>
  </div>
 )
}

const SankeyRiverDeltaRenderer: React.FC<{
 dataset: TubeExplorerVisualDataset
 sourceLimit?: number
 geoLimit?: number
 minGeoViews?: number
}> = ({ dataset, sourceLimit = 6, geoLimit = 7, minGeoViews = 100 }) => {
 const [hovered, setHovered] = useState<string | null>(null)
 const model = useMemo(() => {
  const sourceRows = dataset.traffic.filter((row) => row.views > 0).slice(0, sourceLimit)
  const geoRows = dataset.geography.filter((row) => row.views >= minGeoViews).slice(0, geoLimit)
  if (sourceRows.length === 0 || geoRows.length === 0) return null
  const width = 900
  const pad = 36
  const usableWidth = width - pad * 2
  const totalSourceViews = sourceRows.reduce((sum, row) => sum + row.views, 0) || 1
  const totalGeoViews = geoRows.reduce((sum, row) => sum + row.views, 0) || 1

  let sourceX = pad
  const sourceNodes = sourceRows.map((row, index) => {
   const nodeWidth = (row.views / totalSourceViews) * usableWidth
   const node = { label: formatTrafficLabel(row.sourceTitle || row.sourceType), views: row.views, x: sourceX, w: nodeWidth, color: TRAFFIC_COLORS[index % TRAFFIC_COLORS.length] }
   sourceX += nodeWidth
   return node
  })

  let geoX = pad
  const destNodes = geoRows.map((row, index) => {
   const nodeWidth = (row.views / totalGeoViews) * usableWidth
   const node = { label: row.label, views: row.views, x: geoX, w: nodeWidth, color: TRAFFIC_COLORS[(index + 1) % TRAFFIC_COLORS.length] }
   geoX += nodeWidth
   return node
  })

  const flows: Array<{
   srcX: number
   srcW: number
   dstX: number
   dstW: number
   color: string
   srcLabel: string
   dstLabel: string
   views: number
  }> = []

  sourceNodes.slice(0, Math.min(sourceNodes.length, destNodes.length)).forEach((source, index) => {
   const dest = destNodes[index]
   const flowWidth = Math.max(0.8, Math.min(source.w, dest.w) * 0.82)
   flows.push({
    srcX: source.x + (source.w - flowWidth) / 2,
    srcW: flowWidth,
    dstX: dest.x + (dest.w - flowWidth) / 2,
    dstW: flowWidth,
    color: source.color,
    srcLabel: source.label,
    dstLabel: dest.label,
    views: Math.min(source.views, dest.views),
   })
  })

  return { sourceNodes, destNodes, flows }
 }, [dataset.geography, dataset.traffic, geoLimit, minGeoViews, sourceLimit])

 if (!model) return <Empty label="Traffic source rows and geography rows are both required for the river delta." />

 const width = 900
 const height = 440
 const sourceY = 24
 const destY = height - 74
 const barHeight = 54
 const controlY = height / 2

 return (
  <svg
   viewBox={`0 0 ${width} ${height}`}
   preserveAspectRatio="none"
   className="block h-full w-full"
   style={{ background: "#0a0a0f" }}
  >
    <defs>
     {model.flows.map((flow, index) => (
      <linearGradient key={index} id={`river-grad-${index}`} x1="0" y1="0" x2="0" y2="1">
       <stop offset="0%" stopColor={flow.color} stopOpacity="0.58" />
       <stop offset="100%" stopColor={flow.color} stopOpacity="0.16" />
      </linearGradient>
     ))}
    </defs>
    {model.flows.map((flow, index) => {
     const isHovered = hovered === flow.srcLabel
     const path = [
      `M ${flow.srcX} ${sourceY + barHeight}`,
      `C ${flow.srcX} ${controlY}, ${flow.dstX} ${controlY}, ${flow.dstX} ${destY - barHeight}`,
      `L ${flow.dstX + flow.dstW} ${destY - barHeight}`,
      `C ${flow.dstX + flow.dstW} ${controlY}, ${flow.srcX + flow.srcW} ${controlY}, ${flow.srcX + flow.srcW} ${sourceY + barHeight}`,
      "Z",
     ].join(" ")
     return (
      <path
       key={index}
       d={path}
       fill={isHovered ? flow.color : `url(#river-grad-${index})`}
       opacity={isHovered ? 0.64 : 0.24}
       stroke={isHovered ? flow.color : "none"}
       strokeWidth="0.5"
      />
     )
    })}
    {model.sourceNodes.map((node) => (
     <g
      key={node.label}
      onMouseEnter={() => setHovered(node.label)}
      onMouseLeave={() => setHovered(null)}
      style={{ cursor: "pointer" }}>
      <rect x={node.x} y={sourceY} width={node.w} height={barHeight} fill={node.color} stroke="#000" strokeWidth={hovered === node.label ? 2 : 1.5} opacity={hovered === node.label ? 1 : 0.92} />
      {node.w > 60 ? (
       <text x={node.x + node.w / 2} y={sourceY + 34} textAnchor="middle" style={{ fill: "#000", fontSize: 24, fontFamily: "inherit", fontWeight: 1000, letterSpacing: "0.03em" }}>
        {node.label.toUpperCase().slice(0, 13)}
        </text>
      ) : null}
     </g>
    ))}
    {model.destNodes.map((node) => (
     <g key={node.label}>
      <rect x={node.x} y={destY - barHeight} width={node.w} height={barHeight} fill={node.color} stroke="#000" strokeWidth="1.5" opacity="0.9" />
      {node.w > 36 ? (
       <text x={node.x + node.w / 2} y={destY - 10} textAnchor="middle" style={{ fill: "#000", fontSize: 24, fontFamily: "inherit", fontWeight: 1000, letterSpacing: "0.03em" }}>
        {node.label.toUpperCase().slice(0, 12)}
        </text>
      ) : null}
     </g>
    ))}
    <text x="40" y={sourceY - 6} style={{ fill: "#6c738f", fontSize: 8, fontFamily: "monospace", fontWeight: 900 }}>
     ← TRAFFIC SOURCES
    </text>
    <text x="40" y={destY + 18} style={{ fill: "#6c738f", fontSize: 8, fontFamily: "monospace", fontWeight: 900 }}>
     ← TOP GEOGRAPHY
    </text>
   </svg>
 )
}

const TITLE_NETWORK_MIN_WORDS = 5
const TITLE_NETWORK_MAX_WORDS = 25

const TitleWordNetworkCanvas: React.FC<{
 graph: { nodes: WordNode[]; edges: WordEdge[] }
 hovered: string | null
 onHover: (id: string | null) => void
}> = ({ graph, hovered, onHover }) => {
 const maxViews = Math.max(...graph.nodes.map((node) => node.totalViews), 1)
 const width = 860
 const height = 340
 const getNodeColor = (nodeIdx: number): string => {
  const node = graph.nodes[nodeIdx]
  if (!node) return "#FF1493"
  const cx = width / 2
  const cy = height / 2
  const angle = Math.atan2(node.y - cy, node.x - cx)
  const hue = ((angle + Math.PI) / (Math.PI * 2)) * 360
  return `hsl(${hue.toFixed(0)}, 100%, 60%)`
 }
 return (
  <div className="relative h-full w-full p-8" style={{ background: "#050810" }}>
   <svg viewBox={`0 0 ${width} ${height}`} className="block h-full w-full">
    <defs>
     <filter id="node-glow">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
       <feMergeNode in="blur" />
       <feMergeNode in="SourceGraphic" />
      </feMerge>
     </filter>
    </defs>
    {graph.edges.map((edge, index) => {
      const source = graph.nodes[edge.source]
      const target = graph.nodes[edge.target]
      if (!source || !target) return null
      const isHovered = hovered === source.id || hovered === target.id
      return (
       <line
        key={index}
        x1={source.x}
        y1={source.y}
        x2={target.x}
        y2={target.y}
        stroke={isHovered ? "#ffffff" : "#ffffff"}
        strokeWidth={Math.max(0.5, edge.sharedVideos * 0.5)}
        opacity={isHovered ? 0.62 : 0.1}
       />
      )
     })}
    {graph.nodes.map((node, index) => {
     const radius = 5 + (node.totalViews / maxViews) * 20
     const color = getNodeColor(index)
     const isHovered = hovered === node.id
     return (
      <g
       key={node.id}
       onMouseEnter={() => onHover(node.id)}
       onMouseLeave={() => onHover(null)}
       style={{ cursor: "pointer" }}>
       <circle cx={node.x} cy={node.y} r={radius * 2} fill={color} opacity="0.08" filter="url(#node-glow)" />
       <circle cx={node.x} cy={node.y} r={isHovered ? radius * 1.35 : radius} fill={color} stroke={isHovered ? "#ffffff" : "rgba(0,0,0,0.35)"} strokeWidth={isHovered ? 2 : 1} opacity="0.92" />
       <text
        x={node.x}
        y={node.y - radius - 5}
        textAnchor="middle"
        style={{
         fill: isHovered ? "#ffffff" : color,
         fontSize: Math.max(8, Math.min(12, radius * 0.72)),
         fontWeight: 1000,
         fontFamily: "inherit",
         letterSpacing: "0.04em",
         opacity: isHovered ? 1 : 0.92,
        }}>
        {node.id.toUpperCase()}
       </text>
      </g>
     )
    })}
   </svg>
   <div className="pointer-events-none absolute bottom-2 left-2 text-[9px] font-black uppercase tracking-[0.08em] text-white/40">
    Size = views · Color = layout position · Position = rank pull, center = top word · Lines = shared title words · Hover for stats
   </div>
  </div>
 )
}

const createModule = (
 title: string,
 subtitle: string,
 render: (dataset: TubeExplorerVisualDataset) => React.ReactNode,
 options: { color?: string; icon?: string; badges?: { label: string; tone?: any }[]; insight?: string; height?: number; flushShell?: boolean; activeContext?: (dataset: TubeExplorerVisualDataset) => React.ComponentProps<typeof SubToolboxChartModule>["activeContext"] } = {},
): React.FC<TubeExplorerVisualProps> => (props) => {
 const dataset = useExplorerData(props)
 return (
  <ModuleFrame
   title={title}
   subtitle={subtitle}
   count={dataset.totals.videos || dataset.traffic.length || dataset.geography.length || dataset.keywords.length}
   color={options.color}
   icon={options.icon}
   badges={options.badges}
   activeContext={options.activeContext?.(dataset)}
   insight={options.insight}
   height={options.height}
   flushShell={options.flushShell}
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
  >
   {render(dataset)}
  </ModuleFrame>
 )
}

export const TubeExplorerKeywordTreemap = createModule("TOKEN FOREST", "Title words and search terms sized by channel reach.", (d) => <KeywordBlocks dataset={d} />, { color: "#CCFF00", badges: [{ label: "KEYWORDS", tone: "lime" }] })
export const TubeExplorerChannelHealthRadar = createModule("SIGNAL DIAL", "A balance check across views, retention, revenue, subscribers, and engagement.", (d) => {
 const rows = [
  { metric: "Views", value: d.totals.views },
  { metric: "Engaged", value: d.totals.engagedViews },
  { metric: "Revenue", value: d.totals.revenue * 1000 },
  { metric: "Subs", value: d.totals.subscribersGained * 100 },
  { metric: "Likes", value: d.totals.likes },
  { metric: "Shares", value: d.totals.shares * 12 },
 ]
 return <ResponsiveContainer width="100%" height="100%"><RadarChart data={rows}><PolarGrid stroke="#000" /><PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fontWeight: 900 }} /><Radar dataKey="value" fill="#00CCFF" fillOpacity={0.45} stroke="#000" strokeWidth={3} /></RadarChart></ResponsiveContainer>
}, { color: "#FFB158", badges: [{ label: "HEALTH", tone: "orange" }] })
export const TubeExplorerRevenueForecast = createModule("COHORT CURVE", "Revenue and views stacked by publish month.", (d) => <MonthlyArea dataset={d} a="revenue" b="views" />, { color: "#FF7497" })
export const TubeExplorerTrafficEvolution = createModule("TRAFFIC MIX", "Current traffic sources in the active VT-SYNC window.", (d) => <TrafficBars dataset={d} />, { color: "#00CCFF" })
export const TubeExplorerVideoValueMatrix = createModule("VALUE MAP", "Views versus revenue across the strongest videos.", (d) => <VideoScatter rows={topVideos(d, "valueScore", 80)} x="views" y="revenue" />, { color: "#CCFF00" })
export const TubeExplorerSubNetFlow = createModule("NET SUBS", "Subscribers gained minus lost for each video.", (d) => <VideoBars rows={topVideos(d, "subscribersNet", 18, true)} metric="subscribersNet" color="#CCFF00" />, { color: "#FFEA00" })
export const TubeExplorerContentDonut = createModule("FORMAT SPLIT", "How the channel breaks across Shorts, long-form, and everything else.", (d) => <Donut rows={[{ name: "Shorts", value: d.shorts.length }, { name: "Long", value: d.longform.length }, { name: "Other", value: d.videos.length - d.shorts.length - d.longform.length }]} />, { color: "#FFB158" })
export const TubeExplorerPerformanceGauges = createModule("TOP VIEWS", "Ranked bars for the channel's highest-viewed videos.", (d) => <VideoBars rows={topVideos(d, "views", 12)} metric="views" color="#00CCFF" />, { color: "#B14AED" })
export const TubeExplorerRevenueWaterfall = createModule("REVENUE TIDE", "Revenue and watch hours rising with publish month.", (d) => <MonthlyArea dataset={d} a="revenue" b="watchHours" />, { color: "#42FF68" })
export const TubeExplorerConversionFunnel = createModule("FUNNEL FLOW", "Impressions, views, engagement, watch hours, and subs in order.", (d) => <FunnelStages dataset={d} />, { color: "#00CCFF" })
export const TubeExplorerUploadHeatmap = createModule("UPLOAD GRID", "Views by day of week across the upload schedule.", (d) => <HeatGrid cells={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => ({ label, value: d.videos.filter((v) => v.dayKey === label).reduce((sum, v) => sum + v.views, 0) }))} empty="No dated rows available" />, { color: "#FF7497" })

export const TubeExplorerECGVitalsMonitor = createModule("WATCH PULSE", "Watch hours tracked by publish month.", (d) => <MonthlyArea dataset={d} a="watchHours" b="engagement" />, { color: "#FF7497" })
export const TubeExplorerChronoSpiral = createModule("TIME ORBIT", "Video ranks wrapped into date-based radial motion.", (d) => <SvgRadial rows={topVideos(d, "views", 32)} metric="views" />, { color: "#CCFF00" })
export const TubeExplorerContentDNAGel = createModule("TOKEN GEL", "Keyword intensity strips across the channel.", (d) => <KeywordBlocks dataset={d} />, { color: "#B14AED" })
export const TubeExplorerPerformanceWaveform = createModule("VIEW WAVE", "Views rising by publish month.", (d) => <MonthlyArea dataset={d} a="views" b="engagement" />, { color: "#00CCFF" })
export const TubeExplorerOrbitalSystem = createModule("ORBIT SCORE", "Value-score rings arranged as a planetary system.", (d) => <SvgRadial rows={topVideos(d, "valueScore", 34)} metric="valueScore" />, { color: "#FFB158" })
export const TubeExplorerLissajousWeb = createModule("RETENTION WEB", "Retention plotted against engagement rate.", (d) => <VideoScatter rows={topVideos(d, "views", 90)} x="retentionScore" y="engagementRate" />, { color: "#42FF68" })
export const TubeExplorerKeywordVennChart = createModule("OVERLAP BLOCKS", "Shared title and search terms arranged by reach.", (d) => <KeywordBlocks dataset={d} />, { color: "#FFE35A" })

/* ─── THERMAL IMAGING ──────────────────────────────────────────────────────── */

const THERMAL_METRICS = [
 { key: "views",              label: "VIEWS",       fmt: (v: number) => compact(v) },
 { key: "watchHours",         label: "WATCH TIME",  fmt: (v: number) => `${compact(v)}h` },
 { key: "avp",                label: "AVD %",       fmt: (v: number) => `${v.toFixed(1)}%` },
 { key: "averageViewDuration",label: "AVP %",       fmt: (v: number) => `${v.toFixed(1)}%` },
 { key: "subscribersGained",  label: "SUBS",        fmt: (v: number) => compact(v) },
 { key: "likes",              label: "LIKES",       fmt: (v: number) => compact(v) },
 { key: "comments",           label: "COMMENTS",    fmt: (v: number) => compact(v) },
 { key: "shares",             label: "SHARES",      fmt: (v: number) => compact(v) },
 { key: "saves",              label: "SAVES",       fmt: (v: number) => compact(v) },
 { key: "revenue",            label: "REVENUE",     fmt: (v: number) => `$${v.toFixed(2)}` },
 { key: "rpm",                label: "RPM",         fmt: (v: number) => `$${v.toFixed(2)}` },
] as const

type ThermalMetricKey = (typeof THERMAL_METRICS)[number]["key"]

/** Heat ramp: 75% cold (near-black → blue), 25% warm (green → yellow → orange → coral → rose)
 * Warm-zone colors are exact nav-button palette values. Lower 50% stays very dark. */
const HEAT_STOPS: [number, string][] = [
 [0.00, "#020710"],  // near-black         — coldest
 [0.15, "#050F26"],  // very dark navy      — lower 50% stays dark
 [0.30, "#08173F"],  // dark navy
 [0.50, "#0C2160"],  // medium dark navy    — 50th percentile
 [0.63, "#1840A8"],  // medium blue
 [0.75, "#528FFA"],  // Royal blue ← nav   — 75th percentile (end of cold)
 [0.78, "#3FEE56"],  // Green      ← nav   — warm starts (3% bridge)
 [0.85, "#FFDA47"],  // Yellow     ← nav
 [0.91, "#FFA85C"],  // Orange     ← nav
 [0.96, "#FF7F6B"],  // Coral      ← nav
 [1.00, "#FA618A"],  // Rose/Red   ← nav   — hottest
]

const hexToRgb = (hex: string): [number, number, number] => {
 const h = hex.replace("#", "")
 return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]
}

/** Linear interpolation across an ordered [position, hex] ramp. */
const rampColor = (stops: [number, string][], t: number): string => {
 const clamped = Math.max(0, Math.min(1, t))
 if (clamped <= stops[0][0]) return stops[0][1]
 if (clamped >= stops[stops.length - 1][0]) return stops[stops.length - 1][1]
 for (let i = 0; i < stops.length - 1; i++) {
  const [t0, c0] = stops[i]
  const [t1, c1] = stops[i + 1]
  if (clamped >= t0 && clamped <= t1) {
   const s = t1 === t0 ? 0 : (clamped - t0) / (t1 - t0)
   const [r0,g0,b0] = hexToRgb(c0)
   const [r1,g1,b1] = hexToRgb(c1)
   return `rgb(${Math.round(r0 + s * (r1 - r0))},${Math.round(g0 + s * (g1 - g0))},${Math.round(b0 + s * (b1 - b0))})`
  }
 }
 return stops[stops.length - 1][1]
}

const heatColor = (t: number): string => rampColor(HEAT_STOPS, t)

/** Publish clock ramp: dark blue → blue over the first 60%, on to pink by 85%, then pink → white across the top 15%. */
const PUBLISH_CLOCK_STOPS: [number, string][] = [
 [0.00, "#04122E"],
 [0.60, "#2F6BFF"],
 [0.85, "#FF4FA3"],
 [1.00, "#FFFFFF"],
]

const publishClockColor = (t: number): string => rampColor(PUBLISH_CLOCK_STOPS, t)

const PUBLISH_CLOCK_GRADIENT = `linear-gradient(to right, ${PUBLISH_CLOCK_STOPS.map(([t, c]) => `${c} ${(t * 100).toFixed(0)}%`).join(", ")})`

const heatLabel = (t: number) => {
 if (t < 0.75) return "COLD"
 if (t < 0.85) return "WARM"
 if (t < 0.96) return "HOT"
 return "WHITE-HOT"
}

// Pre-built CSS gradient string from HEAT_STOPS (used in legend bar)
const HEAT_GRADIENT = `linear-gradient(to right, ${HEAT_STOPS.map(([t, c]) => `${c} ${(t * 100).toFixed(0)}%`).join(", ")})`

const formatShortDate = (raw: string | undefined): string => {
 if (!raw) return "—"
 const d = new Date(raw)
 if (isNaN(d.getTime())) return raw
 const mm = String(d.getMonth() + 1).padStart(2, "0")
 const dd = String(d.getDate()).padStart(2, "0")
 const yy = String(d.getFullYear()).slice(-2)
 return `${mm}/${dd}/${yy}`
}

const formatDuration = (seconds: number): string => {
 if (!Number.isFinite(seconds) || seconds <= 0) return "0:00"
 const m = Math.floor(seconds / 60)
 const s = Math.floor(seconds % 60)
 return `${m}:${s.toString().padStart(2, "0")}`
}

const ThermalImagingModuleInner: React.FC<{
 displayVideos: any[]
 rows: 5 | 8
 hoveredIdx: number | null
 lockedIdx: number | null
 onMouseEnterTile: (idx: number) => void
 onMouseLeaveTile: () => void
 onClickTile: (idx: number) => void
 heatColor: (t: number) => string
}> = ({ displayVideos, rows, hoveredIdx, lockedIdx, onMouseEnterTile, onMouseLeaveTile, onClickTile, heatColor }) => {
 const containerRef = useRef<HTMLDivElement>(null)
 const ROWS = rows
 const cols = Math.ceil(displayVideos.length / ROWS)
 // 5-row mode scales tiles up so total grid height matches the 8-row layout (8×36+7×2=302px)
 const TILE = rows === 5 ? 58 : 36
 const GAP = 2

 if (displayVideos.length === 0) return <Empty label="No videos match the selected filters" />

 return (
  // Fixed 440px locks height identically for both 5-row and 8-row modes
  <div className="flex flex-col overflow-hidden" style={{ background: "#080810", height: 440, minHeight: 440 }}>
   {/* Grid container — flex-1 absorbs any leftover space when tile count changes */}
   <div className="flex flex-1 min-h-0 overflow-hidden">
    <div className="vt-thermal-scrollbar flex-1 overflow-x-auto overflow-y-hidden p-4" ref={containerRef}>
     <div
      style={{
       display: "grid",
       gridAutoFlow: "column",
       gridTemplateRows: `repeat(${ROWS}, ${TILE}px)`,
       gridAutoColumns: `${TILE}px`,
       gap: GAP,
       width: cols * TILE + (cols - 1) * GAP,
       height: ROWS * TILE + (ROWS - 1) * GAP,
      }}
     >
      {displayVideos.map((v, i) => {
       const t = v._t
       const bg = heatColor(t)
       const isLocked = lockedIdx === i
       const isHovered = hoveredIdx === i
       return (
        <div
         key={v.videoId || i}
         title={v.title}
         onMouseEnter={() => onMouseEnterTile(i)}
         onMouseLeave={onMouseLeaveTile}
         onClick={() => onClickTile(i)}
         style={{
          background: bg,
          width: TILE,
          height: TILE,
          border: isLocked
           ? "2px solid #FFD400"
           : isHovered
            ? "2px solid #fff"
            : "1px solid rgba(255,255,255,0.08)",
          borderRadius: 2,
          cursor: "pointer",
          transition: "border-color 80ms",
          boxSizing: "border-box",
         }}
        />
       )
      })}
     </div>
    </div>
   </div>

   {/* Legend — gradient bar */}
   <div className="flex items-center justify-center gap-3 border-t-[2px] border-white/10 px-4 py-2 bg-[#0d0d1f] shrink-0">
   <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35 shrink-0">COLD</span>
   <div
     className="w-[155px] h-6 rounded-[2px] border-[1px] border-white/90"
     style={{
      background: HEAT_GRADIENT,
      boxShadow: "0 0 6px rgba(250,97,138,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
     }}
    />
    <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35 shrink-0">HOT</span>
    <span className="ml-3 text-[9px] font-black uppercase tracking-[0.12em] text-white/18 shrink-0">RANK RELATIVE</span>
   </div>

   {/* Insight section */}
   <div className="border-t-[2px] border-white/10 px-4 py-3 bg-[#090910] shrink-0">
    <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-white/30 leading-relaxed">
     <span className="text-white/50 font-black">HOW TO READ:</span>{" "}
     Each pixel = one video. Color = performance rank vs. channel average—not raw numbers.
     Bottom <span className="text-[#528FFA]">75%</span> are cold blue; only the top{" "}
     <span className="text-[#FA618A]">25%</span> earn warm colors.
     Switch the metric dropdown to re-rank all pixels instantly.
     Click any pixel to lock its stats for 5 seconds.
    </p>
   </div>
  </div>
 )
}

export const TubeExplorerThermalImaging: React.FC<TubeExplorerVisualProps> = (props) => {
 const dataset = useExplorerData(props)

 const [metric, setMetric] = useState<ThermalMetricKey>("views")
 const [formatFilter, setFormatFilter] = useState<"all" | "shorts" | "long">("all")
 const [orderMode, setOrderMode] = useState<"chrono" | "rank">("chrono")
 const [rowCount, setRowCount] = useState<5 | 8>(8)

 const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
 const [lockedIdx, setLockedIdx] = useState<number | null>(null)
 const lockTimerRef = useRef<NodeJS.Timeout | null>(null)

 // Clear timer on unmount
 useEffect(() => {
  return () => {
   if (lockTimerRef.current) clearTimeout(lockTimerRef.current)
  }
 }, [])

 // Reset selection when settings change
 useEffect(() => {
  if (lockTimerRef.current) clearTimeout(lockTimerRef.current)
  setLockedIdx(null)
  setHoveredIdx(null)
 }, [metric, formatFilter, orderMode])

 const handleTileClick = (idx: number) => {
  if (lockTimerRef.current) clearTimeout(lockTimerRef.current)
  setLockedIdx(idx)
  setHoveredIdx(idx)

  lockTimerRef.current = setTimeout(() => {
   setLockedIdx(null)
   setHoveredIdx(null)
  }, 5000)
 }

 const handleTileMouseEnter = (idx: number) => {
  if (lockTimerRef.current) {
   clearTimeout(lockTimerRef.current)
   lockTimerRef.current = null
  }
  setLockedIdx(null)
  setHoveredIdx(idx)
 }

 const handleTileMouseLeave = () => {
  if (lockedIdx === null) {
   setHoveredIdx(null)
  }
 }

 const filteredVideos = useMemo(() => {
  if (formatFilter === "shorts") return dataset.shorts
  if (formatFilter === "long") return dataset.longform
  return dataset.videos
 }, [dataset, formatFilter])

 // Normalise values based on rank percentile
 const scored = useMemo(() => {
  const vals = filteredVideos.map((v) => Math.max(0, Number((v as any)[metric]) || 0))
  const order = [...vals.keys()].sort((a, b) => vals[a] - vals[b])
  const ranks = new Array<number>(vals.length)
  order.forEach((originalIdx, rank) => {
   ranks[originalIdx] = rank
  })
  const maxRank = Math.max(1, vals.length - 1)
  return filteredVideos.map((v, i) => ({
   ...v,
   _metricVal: vals[i],
   _t: ranks[i] / maxRank,
  }))
 }, [filteredVideos, metric])

 // Sort display videos based on mode
 const displayVideos = useMemo(() => {
  if (orderMode === "chrono") {
   return [...scored].sort((a, b) => {
    const ta = new Date(a.uploadDate || "").getTime() || 0
    const tb = new Date(b.uploadDate || "").getTime() || 0
    return tb - ta
   })
  } else {
   return [...scored].sort((a, b) => b._metricVal - a._metricVal)
  }
 }, [scored, orderMode])

 // Calculate channel totals for non-hovered state
 const totals = useMemo(() => {
  const totalViews = filteredVideos.reduce((sum, v) => sum + v.views, 0)
  const totalWatchHours = filteredVideos.reduce((sum, v) => sum + v.watchHours, 0)
  const totalRevenue = filteredVideos.reduce((sum, v) => sum + v.revenue, 0)
  const totalSubs = filteredVideos.reduce((sum, v) => sum + v.subscribersGained, 0)
  const totalLikes = filteredVideos.reduce((sum, v) => sum + v.likes, 0)
  const totalShares = filteredVideos.reduce((sum, v) => sum + v.shares, 0)
  const totalComments = filteredVideos.reduce((sum, v) => sum + v.comments, 0)
  const totalSaves = filteredVideos.reduce((sum, v) => sum + (v.saves || 0), 0)

  const avgDuration = filteredVideos.length > 0
    ? filteredVideos.reduce((sum, v) => sum + v.durationSec, 0) / filteredVideos.length
    : 0
  const avgAvp = filteredVideos.length > 0
    ? filteredVideos.reduce((sum, v) => sum + v.avp, 0) / filteredVideos.length
    : 0
  const avgRpm = totalViews > 0 ? (totalRevenue / totalViews) * 1000 : 0

  return {
   views: totalViews,
   watchHours: totalWatchHours,
   avd: avgDuration * (avgAvp / 100),
   avp: avgAvp,
   subscribersGained: totalSubs,
   likes: totalLikes,
   shares: totalShares,
   comments: totalComments,
   saves: totalSaves,
   revenue: totalRevenue,
   rpm: avgRpm
  }
 }, [filteredVideos])

 const hovered = hoveredIdx !== null ? displayVideos[hoveredIdx] : null

 // Active context statistics
 const activeStats = useMemo(() => {
  const target = hovered || totals
  const pubDate = hovered ? formatShortDate(hovered.uploadDate) : (filteredVideos.length > 0 ? formatShortDate(filteredVideos.sort((a: any, b: any) => new Date(b.uploadDate || "").getTime() - new Date(a.uploadDate || "").getTime())[0]?.uploadDate) : "—")
  return [
   { label: "PUBLISHED", value: pubDate, tone: "white" as const, lockTone: true, compact: true },
   { label: metric === "views" ? "► VIEWS" : "VIEWS", value: compact(target.views), tone: "yellow" as const, lockTone: true, compact: true },
   { label: metric === "watchHours" ? "► WATCH" : "WATCH", value: `${compact(target.watchHours)}h`, tone: "purple" as const, lockTone: true, compact: true },
   { label: metric === "avdSeconds" || metric === "avd" ? "► AVD" : "AVD", value: formatDuration(hovered ? (hovered.durationSec * (hovered.avp / 100)) : totals.avd), tone: "cyan" as const, lockTone: true, compact: true },
   { label: metric === "avp" ? "► AVP" : "AVP", value: `${(target.avp || 0).toFixed(1)}%`, tone: "pink" as const, lockTone: true, compact: true },
   { label: metric === "subscribersGained" ? "► SUBS" : "SUBS", value: compact(target.subscribersGained), tone: "lime" as const, lockTone: true, compact: true },
   { label: metric === "likes" ? "► LIKES" : "LIKES", value: compact(target.likes), tone: "pink" as const, lockTone: true, compact: true },
   { label: metric === "shares" ? "► SHARES" : "SHARES", value: compact(target.shares), tone: "cyan" as const, lockTone: true, compact: true },
   { label: metric === "comments" ? "► CMTS" : "CMTS", value: compact(target.comments), tone: "yellow" as const, lockTone: true, compact: true },
   { label: metric === "saves" ? "► SAVES" : "SAVES", value: compact(target.saves || 0), tone: "purple" as const, lockTone: true, compact: true },
   { label: metric === "revenue" ? "► REV" : "REV", value: `$${target.revenue.toFixed(2)}`, tone: "lime" as const, lockTone: true, compact: true },
   { label: metric === "rpm" ? "► RPM" : "RPM", value: `$${target.rpm.toFixed(2)}`, tone: "orange" as const, lockTone: true, compact: true },
  ]
 }, [hovered, totals, metric, filteredVideos])

 const METRIC_OPTIONS = THERMAL_METRICS.map(m => ({ label: m.label, value: m.key }))

 return (
  <SubToolboxChartModule
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
   header={{
    title: "HEAT MATRIX",
    subtitle: "Ranks each video as a pixel by the selected metric and format.",
    icon: <CustomIcon name="analytics" size={34} />,
   }}
   theme={{ headerBandBg: "#FFB158", iconBlockBg: "#20D4F7", shadowColor: "rgba(255,177,88,0.45)" }}
   activeContext={{
    title: hovered
     ? `${hovered.title.toUpperCase()}${lockedIdx !== null ? " 🔒" : ""}`
     : `CHANNEL TOTALS (${formatFilter.toUpperCase()})`,
    stats: activeStats,
   }}
   controllerRows={[
    {
     type: "dropdown",
     value: metric,
     options: METRIC_OPTIONS,
     onSelect: (val) => setMetric(val as ThermalMetricKey),
     bgTone: "#FFEA00"
    },
    {
     type: "dropdown",
     value: formatFilter,
     options: [
      { label: "ALL FORMATS", value: "all" },
      { label: "SHORTS ONLY", value: "shorts" },
      { label: "LONG ONLY", value: "long" },
     ],
     onSelect: (val) => setFormatFilter(val as any),
     bgTone: "#FF7497"
    },
    {
     type: "dropdown",
     value: orderMode,
     options: [
      { label: "CHRONO ORDER", value: "chrono" },
      { label: "BY RANK", value: "rank" },
     ],
     onSelect: (val) => setOrderMode(val as any),
     bgTone: "#00CCFF"
    },
    {
     type: "dropdown",
     value: String(rowCount),
     options: [
      { label: "8 ROWS", value: "8" },
      { label: "5 ROWS", value: "5" },
     ],
     onSelect: (val) => setRowCount(Number(val) as 5 | 8),
     bgTone: "#B14AED"
    },
    {
     type: "label",
     value: `${displayVideos.length} VIDEOS`,
     bgTone: "#FFFFFF"
    }
   ]}
   layout={{ moduleMinHeight: "480px" }}
   >
    <ThermalImagingModuleInner
     displayVideos={displayVideos}
     rows={rowCount}
     hoveredIdx={hoveredIdx}
     lockedIdx={lockedIdx}
     onMouseEnterTile={handleTileMouseEnter}
     onMouseLeaveTile={handleTileMouseLeave}
     onClickTile={handleTileClick}
     heatColor={heatColor}
    />
   </SubToolboxChartModule>
  )
}

type VitalMetricKey = "views" | "watchHours" | "subscribersGained" | "likes" | "comments" | "shares" | "saves" | "revenue"

/** Track colours come straight off the shared spectrum so the monitor matches the other modules. */
// Ordered top-to-bottom. The headline metrics sit at the bottom of the stack:
// views on the last row, watch time above it, then likes.
const CHANNEL_VITAL_METRICS: Array<{ key: VitalMetricKey; label: string; color: string; format: (value: number) => string }> = [
 { key: "subscribersGained", label: "SUBS", format: compact },
 { key: "comments", label: "COMMENTS", format: compact },
 { key: "shares", label: "SHARES", format: compact },
 { key: "saves", label: "SAVES", format: compact },
 { key: "revenue", label: "REVENUE", format: (value) => `$${value.toFixed(2)}` },
 { key: "likes", label: "LIKES", format: compact },
 { key: "watchHours", label: "WATCH", format: (value) => `${compact(value)}H` },
 { key: "views", label: "VIEWS", format: compact },
].map((entry, index) => ({ ...entry, color: VT_SPECTRUM_PALETTE_06[index % VT_SPECTRUM_PALETTE_06.length] }))

/** 0 means "all rows". */
const VITAL_ROW_COUNTS = [5, 10, 15, 25, 50, 100, 150, 200, 250, 0] as const

const VITAL_FORMAT_MODES = [
 { value: "all" as const, label: "CHANNEL VIDEOS" },
 { value: "shorts" as const, label: "CHANNEL SHORTS" },
 { value: "long" as const, label: "LONGFORM VIDEOS" },
]

const sortVitalRows = (rows: TubeExplorerVideoPoint[]) =>
 [...rows].sort((a, b) => {
  const aTime = new Date(a.uploadDate).getTime()
  const bTime = new Date(b.uploadDate).getTime()
  if (!Number.isFinite(aTime) || !Number.isFinite(bTime)) return a.uploadDate.localeCompare(b.uploadDate)
  return aTime - bTime
 })

const formatVitalPublishedDate = (value: string): string => {
 const date = new Date(value)
 if (!Number.isFinite(date.getTime())) return "—"
 return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${String(date.getUTCFullYear()).slice(-2)}`
}

export const TubeExplorerChannelVitalSigns: React.FC<TubeExplorerVisualProps> = (props) => {
 const dataset = useExplorerData(props)
 const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
 const [countIndex, setCountIndex] = useState<number>(0)
 const [formatIndex, setFormatIndex] = useState<number>(0)
 const rowCount = VITAL_ROW_COUNTS[countIndex]
 const formatFilter = VITAL_FORMAT_MODES[formatIndex]
 const rows = useMemo(() => {
  const scoped = dataset.videos.filter((video) => (
   formatFilter.value === "all" ? true : formatFilter.value === "shorts" ? video.format === "shorts" : video.format === "long"
  ))
  const sorted = sortVitalRows(scoped)
  return rowCount === 0 ? sorted : sorted.slice(-rowCount)
 }, [dataset.videos, formatFilter, rowCount])
 const hovered = hoveredIndex === null ? null : rows[hoveredIndex] || null

 // Legend doubles as the visibility control; hiding a metric drops its whole lane.
 const [hiddenMetrics, setHiddenMetrics] = useState<Set<VitalMetricKey>>(() => new Set())
 const toggleMetric = (key: VitalMetricKey) => {
  setHiddenMetrics((current) => {
   const next = new Set(current)
   if (next.has(key)) next.delete(key)
   else next.add(key)
   // Never let the operator blank the chart entirely.
   return next.size >= CHANNEL_VITAL_METRICS.length ? current : next
  })
 }
 const visibleMetrics = CHANNEL_VITAL_METRICS.filter((metric) => !hiddenMetrics.has(metric.key))

 const stepCount = (direction: 1 | -1) => {
  setCountIndex((current) => (current + direction + VITAL_ROW_COUNTS.length) % VITAL_ROW_COUNTS.length)
  setHoveredIndex(null)
 }
 const stepFormat = (direction: 1 | -1) => {
  setFormatIndex((current) => (current + direction + VITAL_FORMAT_MODES.length) % VITAL_FORMAT_MODES.length)
  setHoveredIndex(null)
 }

 const controllerRows: React.ComponentProps<typeof SubToolboxChartModule>["controllerRows"] = [
  {
   type: "number",
   // Falls back to the real total whenever the channel has fewer videos than the step.
   value: rowCount === 0 || rows.length < rowCount ? String(rows.length) : String(rowCount),
   onPrev: () => stepCount(-1),
   onNext: () => stepCount(1),
   bgTone: "#FFEA00",
   fgTone: "#000000",
  },
  {
   type: "text",
   value: formatFilter.label,
   onPrev: () => stepFormat(-1),
   onNext: () => stepFormat(1),
   bgTone: "#FF7497",
   fgTone: "#000000",
  },
  { type: "label", value: "LIFETIME TOTALS", bgTone: "#000000", fgTone: "#FFFFFF" },
 ]

 const activeContext = useMemo(() => {
  const target = hovered || rows[rows.length - 1]
  return {
   title: target ? target.title.toUpperCase() : "CHANNEL VITALS",
   stats: [
    {
     label: "PUBLISHED",
     value: target ? formatVitalPublishedDate(target.uploadDate) : "—",
     tone: "white" as const,
     valueTone: "#000000",
     lockTone: true,
     compact: true,
    },
    ...CHANNEL_VITAL_METRICS.map((metric) => ({
     label: metric.label,
     value: metric.format(target ? Number(target[metric.key]) || 0 : 0),
     tone: metric.color,
     lockTone: true,
     compact: true,
    })),
   ],
  }
 }, [hovered, rows])

 if (rows.length === 0) {
  return (
   <ModuleFrame
    title="CHANNEL VITAL SIGNS"
    subtitle="Independent channel metrics traced across upload order."
    count={0}
    color="#FF7497"
    activeContext={activeContext}
    controllerRows={controllerRows}
    collapsible={props.collapsible}
    isOpenInitial={props.isOpenInitial}
    height={460}
   >
    <Empty label="Need dated video rows with metrics to draw the vital signs monitor." />
   </ModuleFrame>
  )
 }

 const W = 1160
 const H = 420
 const PAD_L = 76
 const PAD_R = 12
 // Top padding is headroom for the 3x peaks: the top track overshoots its lane by
 // (amplitude - 1) x trackHeight, and without this the tallest traces clip off-canvas.
 const PAD_T = 60
 const PAD_B = 24
 const trackGap = 5
 const trackHeight = (H - PAD_T - PAD_B - trackGap * (visibleMetrics.length - 1)) / visibleMetrics.length
 const plotWidth = W - PAD_L - PAD_R
 const xFor = (index: number) => PAD_L + (index / Math.max(rows.length - 1, 1)) * plotWidth
 // Peaks reach 3x the track so traces cross into neighbouring lanes; each track keeps
 // its own baseline and scale, so overlapping never changes another trace's shape.
 const VITAL_PEAK_AMPLITUDE = 0.84 * 3
 const yFor = (metric: (typeof CHANNEL_VITAL_METRICS)[number], value: number, trackIndex: number) => {
  const top = PAD_T + trackIndex * (trackHeight + trackGap)
  const values = rows.map((row) => Number(row[metric.key]) || 0)
  const max = Math.max(...values.map((item) => Math.abs(item)), 1)
  const ratio = 1 - Math.max(0, Math.min(1, value / max)) * VITAL_PEAK_AMPLITUDE
  return top + ratio * trackHeight
 }
 const hoverX = hoveredIndex === null ? null : xFor(hoveredIndex)

 return (
  <ModuleFrame
   title="CHANNEL VITAL SIGNS"
   subtitle="Oscilloscope monitor for subs, comments, shares, saves, revenue, likes, watch time, and views."
   count={rows.length}
   color="#FF7497"
   activeContext={activeContext}
   controllerRows={controllerRows}
   insight="Each trace is normalized to its own observed range across upload order. Compare timing and shape, not raw height: aligned spikes reveal videos that performed broadly across the channel."
   height={460}
   flushShell
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
  >
   <div className="flex h-full flex-col bg-[#090914]">
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 px-2 py-1.5">
     {CHANNEL_VITAL_METRICS.map((metric) => {
      const isOn = !hiddenMetrics.has(metric.key)
      return (
       <button
        key={metric.key}
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-label={`Toggle ${metric.label} trace`}
        onClick={() => toggleMetric(metric.key)}
        className="flex items-center gap-1.5 border-none bg-transparent p-0 text-[9px] font-black uppercase tracking-[0.1em] leading-none"
        style={{ color: metric.color, opacity: isOn ? 1 : 0.4, cursor: "pointer" }}
       >
        <span
         className="h-3.5 w-3.5 shrink-0 rounded-[2px] border-[2px]"
         style={{
          background: isOn ? metric.color : "transparent",
          borderColor: metric.color,
         }}
        />
        {metric.label}
       </button>
      )
     })}
    </div>
    <svg
     viewBox={`0 0 ${W} ${H}`}
     preserveAspectRatio="none"
     className="block min-h-0 w-full flex-1"
     role="img"
     aria-label="Channel vital signs oscilloscope showing eight metrics across upload order"
     onMouseMove={(event) => {
      // preserveAspectRatio="none" makes viewBox x map linearly onto element width,
      // so this stays accurate edge to edge rather than only at the centre.
      const bounds = event.currentTarget.getBoundingClientRect()
      const ratio = (event.clientX - bounds.left) / Math.max(bounds.width, 1)
      const index = Math.max(0, Math.min(rows.length - 1, Math.round((ratio * W - PAD_L) / plotWidth * Math.max(rows.length - 1, 1))))
      setHoveredIndex(index)
     }}
     onMouseLeave={() => setHoveredIndex(null)}
    >
     <defs>
      {visibleMetrics.map((metric) => (
       <filter key={metric.key} id={`vital-glow-${metric.key}`} x="-20%" y="-40%" width="140%" height="180%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
       </filter>
      ))}
     </defs>
     {/* Lanes first, traces second: peaks reach into neighbouring lanes, and a later
         lane's background would otherwise paint over the trace above it. */}
     {visibleMetrics.map((metric, trackIndex) => {
      const top = PAD_T + trackIndex * (trackHeight + trackGap)
      const baseline = top + trackHeight
      return (
       <g key={`lane-${metric.key}`}>
        <rect x={PAD_L} y={top} width={plotWidth} height={trackHeight} fill="#05050c" stroke="#ffffff" strokeOpacity="0.09" strokeWidth="1" />
        <line x1={PAD_L} y1={baseline} x2={W - PAD_R} y2={baseline} stroke={metric.color} strokeOpacity="0.32" strokeWidth="1" />
        <text x={PAD_L - 8} y={top + trackHeight / 2 + 3} textAnchor="end" style={{ fill: metric.color, fontSize: 9, fontWeight: 1000, letterSpacing: "0.04em" }}>
         {metric.label}
        </text>
       </g>
      )
     })}
     {visibleMetrics.map((metric, trackIndex) => (
      <polyline
       key={`trace-${metric.key}`}
       points={rows.map((row, index) => `${xFor(index)},${yFor(metric, Number(row[metric.key]) || 0, trackIndex)}`).join(" ")}
       fill="none"
       stroke={metric.color}
       strokeWidth="1.5"
       strokeLinejoin="round"
       strokeLinecap="round"
       filter={`url(#vital-glow-${metric.key})`}
      />
     ))}
     {hoverX !== null ? (
      <line
       pointerEvents="none"
       x1={hoverX}
       y1={PAD_T}
       x2={hoverX}
       y2={H - PAD_B}
       stroke="#FFFFFF"
       strokeWidth="1"
       opacity="0.5"
      />
     ) : null}
     <text x={PAD_L} y={H - 8} style={{ fill: "#FFFFFF", opacity: 0.38, fontSize: 9, fontWeight: 900, letterSpacing: "0.1em" }}>OLDER UPLOADS</text>
     <text x={W - PAD_R} y={H - 8} textAnchor="end" style={{ fill: "#FFFFFF", opacity: 0.38, fontSize: 9, fontWeight: 900, letterSpacing: "0.1em" }}>LATEST UPLOADS</text>
    </svg>
   </div>
  </ModuleFrame>
 )
}



const BARCODE_BAR_COUNTS = [40, 80, 120, 200] as const

export const TubeExplorerBarcodeFingerprint: React.FC<TubeExplorerVisualProps> = (props) => {
 const dataset = useExplorerData(props)
 const [metric, setMetric] = useState<ExplorerMetricKey>("views")
 const [formatFilter, setFormatFilter] = useState<"all" | "shorts" | "long">("all")
 const [orderMode, setOrderMode] = useState<"top" | "recent">("top")
 const [barCount, setBarCount] = useState<number>(80)
 const [hovered, setHovered] = useState<TubeExplorerVideoPoint | null>(null)

 const rows = useMemo(() => {
  const scoped = dataset.videos.filter((video) => (
   formatFilter === "all" ? true : formatFilter === "shorts" ? video.format === "shorts" : video.format === "long"
  ))
  const withValue = scoped.filter((video) => metricValue(video, metric) > 0)
  const ordered = orderMode === "top"
   ? [...withValue].sort((a, b) => metricValue(b, metric) - metricValue(a, metric))
   : [...withValue].sort((a, b) => new Date(b.uploadDate || "").getTime() - new Date(a.uploadDate || "").getTime())
  return ordered.slice(0, barCount)
 }, [barCount, dataset.videos, formatFilter, metric, orderMode])

 const option = metricOptionFor(metric)
 const orderLabel = orderMode === "top" ? "TOP VIDEOS" : "MOST RECENT"
 const peak = rows.reduce<TubeExplorerVideoPoint | null>(
  (best, row) => (!best || metricValue(row, metric) > metricValue(best, metric) ? row : best),
  null,
 )

 // One fixed set of uniquely-labelled chips. The strip must not change shape between
 // hover states, and duplicate labels would collide as React keys.
 const totals = rows.reduce(
  (acc, row) => ({
   views: acc.views + row.views,
   likes: acc.likes + row.likes,
   comments: acc.comments + row.comments,
   shares: acc.shares + row.shares,
   subs: acc.subs + row.subscribersGained,
   revenue: acc.revenue + row.revenue,
  }),
  { views: 0, likes: 0, comments: 0, shares: 0, subs: 0, revenue: 0 },
 )
 const marked = (label: string, key: ExplorerMetricKey) => (metric === key ? `► ${label}` : label)
 const stats = [
  {
   label: "PUBLISHED",
   value: hovered ? formatShortDate(hovered.uploadDate) : `${rows.length} SHOWN`,
   tone: "white" as const, lockTone: true, compact: true,
  },
  { label: marked("VIEWS", "views"), value: compact(hovered ? hovered.views : totals.views), tone: "yellow" as const, lockTone: true, compact: true },
  { label: marked("LIKES", "likes"), value: compact(hovered ? hovered.likes : totals.likes), tone: "pink" as const, lockTone: true, compact: true },
  { label: marked("CMTS", "comments"), value: compact(hovered ? hovered.comments : totals.comments), tone: "cyan" as const, lockTone: true, compact: true },
  { label: marked("SHARES", "shares"), value: compact(hovered ? hovered.shares : totals.shares), tone: "lime" as const, lockTone: true, compact: true },
  { label: marked("SUBS", "subscribersGained"), value: compact(hovered ? hovered.subscribersGained : totals.subs), tone: "lime" as const, lockTone: true, compact: true },
  { label: marked("REV", "revenue"), value: `$${(hovered ? hovered.revenue : totals.revenue).toFixed(2)}`, tone: "orange" as const, lockTone: true, compact: true },
  { label: marked("AVP", "avp"), value: `${(hovered ? hovered.avp : weightedAverage(rows, (row) => row.avp, (row) => Math.max(row.views, 1))).toFixed(1)}%`, tone: "purple" as const, lockTone: true, compact: true },
  { label: marked("AVD", "avdSeconds"), value: formatDuration(hovered ? hovered.avdSeconds : weightedAverage(rows, (row) => row.avdSeconds, (row) => Math.max(row.views, 1))), tone: "cyan" as const, lockTone: true, compact: true },
  { label: "PEAK", value: peak ? option.format(metricValue(peak, metric)) : "—", tone: "pink" as const, lockTone: true, compact: true },
  { label: "FORMAT", value: hovered ? hovered.format.toUpperCase() : formatFilter.toUpperCase(), tone: "white" as const, lockTone: true, compact: true },
 ]

 return (
  <ModuleFrame
   title="BARCODE FINGERPRINT"
   subtitle="Ranked video bars centered on one horizontal spine."
   count={rows.length}
   color="#CCFF00"
   height={420}
   flushShell
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
   activeContext={{
    title: hovered ? videoShortTitle(hovered.title, 52).toUpperCase() : `VIDEO BARCODE (${formatFilter.toUpperCase()})`,
    stats,
   }}
   controllerRows={[
    {
     type: "dropdown",
     value: metric,
     options: EXPLORER_METRIC_OPTIONS.map((entry) => ({ label: entry.label.toUpperCase(), value: entry.key })),
     onSelect: (value) => setMetric(value as ExplorerMetricKey),
     bgTone: "#FFEA00",
    },
    {
     type: "dropdown",
     value: formatFilter,
     options: [
      { label: "ALL VIDEOS", value: "all" },
      { label: "SHORTS ONLY", value: "shorts" },
      { label: "LONGFORM ONLY", value: "long" },
     ],
     onSelect: (value) => setFormatFilter(value as "all" | "shorts" | "long"),
     bgTone: "#FF7497",
    },
    {
     type: "dropdown",
     value: orderMode,
     options: [
      { label: "TOP PERFORMING", value: "top" },
      { label: "MOST RECENT", value: "recent" },
     ],
     onSelect: (value) => setOrderMode(value as "top" | "recent"),
     bgTone: "#00CCFF",
    },
    {
     type: "dropdown",
     value: String(barCount),
     options: BARCODE_BAR_COUNTS.map((entry) => ({ label: `${entry} VIDEOS`, value: String(entry) })),
     onSelect: (value) => setBarCount(Number(value)),
     bgTone: "#B14AED",
    },
    { type: "label", value: `${rows.length} VIDEOS`, bgTone: "#FFFFFF" },
   ]}
  >
   <BarcodeFingerprintAdvancedRenderer rows={rows} metric={metric} orderLabel={orderLabel} onHover={setHovered} />
  </ModuleFrame>
 )
}
export const TubeExplorerViewsSubsGrowthQuadrant = createModule("VIEWS × SUBS GROWTH QUADRANT", "Videos plotted by reach and subscriber conversion.", (d) => <ViewsSubsGrowthQuadrantRenderer dataset={d} />, {
 color: "#00E5FF",
 height: 420,
 flushShell: true,
 activeContext: (dataset) => ({
  title: "GROWTH QUADRANT",
  stats: [
   { label: "VIDEOS", value: compact(dataset.videos.length), tone: "#00E5FF", lockTone: true, compact: true },
   { label: "VIEWS", value: compact(dataset.totals.views), tone: "#42FF68", lockTone: true, compact: true },
   { label: "SUBS GAINED", value: compact(dataset.totals.subscribersGained), tone: "#FF83EA", lockTone: true, compact: true },
  ],
 }),
})
const WATERFALL_COUNTS = [50, 100, 200, 400, 0] as const

export const TubeExplorerSubscriberWaterfall: React.FC<TubeExplorerVisualProps> = (props) => {
 const dataset = useExplorerData(props)
 const [countIndex, setCountIndex] = useState(2)
 const [orderIndex, setOrderIndex] = useState(0)
 const [formatIndex, setFormatIndex] = useState(0)
 const [hovered, setHovered] = useState<{ video: TubeExplorerVideoPoint; cumulative: number } | null>(null)

 const limit = WATERFALL_COUNTS[countIndex]
 const chrono = orderIndex === 0
 const formatMode = VITAL_FORMAT_MODES[formatIndex]

 const rows = useMemo(() => {
  const scoped = dataset.videos.filter((video) => {
   if (!video.uploadDate) return false
   if (formatMode.value === "shorts") return video.format === "shorts"
   if (formatMode.value === "long") return video.format === "long"
   return true
  })
  // Always take the most recent slice, then order it for display.
  const byDate = [...scoped].sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime())
  const windowed = limit === 0 ? byDate : byDate.slice(-limit)
  return chrono ? windowed : [...windowed].sort((a, b) => b.subscribersGained - a.subscribersGained)
 }, [chrono, dataset.videos, formatMode, limit])

 const netSubs = rows.reduce((sum, row) => sum + row.subscribersGained, 0)
 const best = rows.reduce<TubeExplorerVideoPoint | null>(
  (top, row) => (!top || row.subscribersGained > top.subscribersGained ? row : top),
  null,
 )

 return (
  <ModuleFrame
   title="SUBSCRIBER WATERFALL"
   subtitle="Per-video subscriber gains with the cumulative growth line."
   count={rows.length}
   color="#42FF68"
   height={420}
   flushShell
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
   activeContext={{
    title: hovered ? videoShortTitle(hovered.video.title, 54).toUpperCase() : `SUBSCRIBER JOURNEY (${formatMode.label})`,
    stats: hovered
     ? [
      { label: "PUBLISHED", value: formatShortDate(hovered.video.uploadDate), tone: "white" as const, valueTone: "#000000", lockTone: true, compact: true },
      { label: "SUBS", value: `+${compact(hovered.video.subscribersGained)}`, tone: "lime" as const, lockTone: true, compact: true },
      { label: "RUNNING", value: `+${compact(hovered.cumulative)}`, tone: "yellow" as const, lockTone: true, compact: true },
      { label: "VIEWS", value: compact(hovered.video.views), tone: "cyan" as const, lockTone: true, compact: true },
      { label: "FORMAT", value: hovered.video.format.toUpperCase(), tone: "pink" as const, lockTone: true, compact: true },
     ]
     : [
      { label: "NET SUBS", value: `+${compact(netSubs)}`, tone: "lime" as const, lockTone: true, compact: true },
      { label: "VIDEOS", value: compact(rows.length), tone: "cyan" as const, lockTone: true, compact: true },
      { label: "BEST", value: best ? `+${compact(best.subscribersGained)}` : "—", tone: "yellow" as const, lockTone: true, compact: true },
      { label: "AVG", value: rows.length ? (netSubs / rows.length).toFixed(1) : "0", tone: "pink" as const, lockTone: true, compact: true },
     ],
   }}
   controllerRows={[
    {
     type: "number",
     value: limit === 0 || rows.length < limit ? String(rows.length) : String(limit),
     onPrev: () => { setCountIndex((i) => (i + WATERFALL_COUNTS.length - 1) % WATERFALL_COUNTS.length); setHovered(null) },
     onNext: () => { setCountIndex((i) => (i + 1) % WATERFALL_COUNTS.length); setHovered(null) },
     bgTone: "#FFEA00",
     fgTone: "#000000",
    },
    {
     type: "text",
     value: chrono ? "CHRONO" : "BY GAIN",
     onPrev: () => setOrderIndex((i) => (i + 1) % 2),
     onNext: () => setOrderIndex((i) => (i + 1) % 2),
     bgTone: "#00CCFF",
     fgTone: "#000000",
    },
    {
     type: "text",
     value: formatMode.label,
     onPrev: () => { setFormatIndex((i) => (i + VITAL_FORMAT_MODES.length - 1) % VITAL_FORMAT_MODES.length); setHovered(null) },
     onNext: () => { setFormatIndex((i) => (i + 1) % VITAL_FORMAT_MODES.length); setHovered(null) },
     bgTone: "#FF7497",
     fgTone: "#000000",
    },
   ]}
  >
   <div className="h-full w-full bg-[#0a0a1a]">
    <SubscriberWaterfallRenderer rows={rows} onHover={setHovered} />
   </div>
  </ModuleFrame>
 )
}
export const TubeExplorerShortsVsLongs: React.FC<TubeExplorerVisualProps> = (props) => {
 const dataset = useExplorerData(props)
 const [average, setAverage] = useState(true)
 const [hovered, setHovered] = useState<{ label: string; shorts: number; longs: number; format: (v: number) => string } | null>(null)

 const shorts = dataset.shorts
 const longs = dataset.longform
 const mode = average ? "PER VIDEO AVG" : "FORMAT TOTALS"

 const winner = hovered
  ? (hovered.shorts === hovered.longs ? "TIED" : hovered.shorts > hovered.longs ? "SHORTS" : "LONGS")
  : null

 return (
  <ModuleFrame
   title="SHORTS vs LONGS"
   subtitle="Head-to-head duel · bars extend from centre · no CTR or retention."
   count={shorts.length + longs.length}
   color="#FF83EA"
   height={420}
   flushShell
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
   activeContext={{
    title: hovered ? `${hovered.label} — ${winner} WIN` : `FORMAT DUEL (${mode})`,
    stats: hovered
     ? [
      { label: "SHORTS", value: hovered.format(hovered.shorts), tone: SHORTS_TONE, lockTone: true, compact: true },
      { label: "LONGS", value: hovered.format(hovered.longs), tone: LONGS_TONE, lockTone: true, compact: true },
      { label: "GAP", value: `${(Math.abs(hovered.shorts - hovered.longs) / Math.max(hovered.shorts, hovered.longs, 1) * 100).toFixed(0)}%`, tone: "#CCFF00", lockTone: true, compact: true },
     ]
     : [
      { label: "SHORTS", value: compact(shorts.length), tone: SHORTS_TONE, lockTone: true, compact: true },
      { label: "LONGS", value: compact(longs.length), tone: LONGS_TONE, lockTone: true, compact: true },
      { label: "TOTAL VIEWS", value: compact(dataset.totals.views), tone: "#CCFF00", lockTone: true, compact: true },
     ],
   }}
   controllerRows={[
    { type: "number", value: String(shorts.length + longs.length), bgTone: "#FFEA00", fgTone: "#000000" },
    {
     type: "text",
     value: mode,
     onPrev: () => setAverage((current) => !current),
     onNext: () => setAverage((current) => !current),
     bgTone: "#FF7497",
     fgTone: "#000000",
    },
    { type: "label", value: "HEAD TO HEAD", bgTone: "#000000", fgTone: "#FFFFFF" },
   ]}
  >
   <div className="h-full w-full bg-[#0a0a1a]">
    <ShortsLongsRenderer shorts={shorts} longs={longs} average={average} onHover={setHovered} />
   </div>
  </ModuleFrame>
 )
}
type TreemapMetricKey = "views" | "watchHours" | "revenue"

const TREEMAP_METRICS: Array<{ key: TreemapMetricKey; label: string; format: (value: number) => string }> = [
 { key: "views", label: "VIEWS", format: compact },
 { key: "watchHours", label: "WATCH TIME", format: (value) => `${compact(value)}h` },
 { key: "revenue", label: "REVENUE", format: (value) => `$${value.toFixed(2)}` },
]

type TreemapPillar = {
 word: string
 value: number
 views: number
 color: string
 videos: TubeExplorerVideoPoint[]
}

/**
 * Groups videos into keyword pillars: each video is assigned to whichever of its
 * title tokens carries the most channel-wide weight, so a pillar is that word's
 * whole body of work rather than an arbitrary first match.
 */
const buildTreemapPillars = (
 videos: TubeExplorerVideoPoint[],
 metric: TreemapMetricKey,
): TreemapPillar[] => {
 const weightOf = (video: TubeExplorerVideoPoint) => Number(video[metric]) || 0

 // A video joins every pillar whose keyword appears in its title, so a title like
 // "Napoleon 1805: Battle of Austerlitz" is counted under NAPOLEON, BATTLE and
 // AUSTERLITZ alike. Pillars therefore overlap and their areas measure keyword
 // reach rather than a partition of the channel.
 const grouped = new Map<string, TubeExplorerVideoPoint[]>()
 videos.forEach((video) => {
  new Set(String(video.keywordText || "").split(/\s+/).filter((token) => token.length > 2)).forEach((token) => {
   const bucket = grouped.get(token) || []
   bucket.push(video)
   grouped.set(token, bucket)
  })
 })

 return [...grouped.entries()]
  .map(([word, members]) => ({
   word: word.toUpperCase(),
   value: members.reduce((sum, video) => sum + weightOf(video), 0),
   views: members.reduce((sum, video) => sum + video.views, 0),
   videos: [...members].sort((a, b) => weightOf(b) - weightOf(a)),
   color: "",
  }))
  .filter((pillar) => pillar.value > 0)
  .sort((a, b) => b.value - a.value)
  .map((pillar, index) => ({ ...pillar, color: VT_SPECTRUM_PALETTE_06[index % VT_SPECTRUM_PALETTE_06.length] }))
}

const TREEMAP_PILLAR_COUNTS = [8, 12, 16, 24, 0] as const
/** Explicit stage height: h-full cannot resolve reliably inside StableChartFrame's ResponsiveContainer. */
const TREEMAP_STAGE_HEIGHT = 452

export const TubeExplorerContentTreemap: React.FC<TubeExplorerVisualProps> = (props) => {
 const dataset = useExplorerData(props)
 const [metricIndex, setMetricIndex] = useState(0)
 const [formatIndex, setFormatIndex] = useState(0)
 const [countIndex, setCountIndex] = useState(1)
 const [drillWord, setDrillWord] = useState<string | null>(null)
 const [hovered, setHovered] = useState<{ label: string; value: number; sub: string } | null>(null)
 const [box, setBox] = useState({ width: 0, height: TREEMAP_STAGE_HEIGHT })
 const stageRef = useRef<HTMLDivElement | null>(null)

 const metric = TREEMAP_METRICS[metricIndex]
 const formatMode = VITAL_FORMAT_MODES[formatIndex]
 const pillarLimit = TREEMAP_PILLAR_COUNTS[countIndex]

 /**
  * The stage sits inside StableChartFrame, which mounts children only after it
  * has measured itself. A one-shot measurement can therefore land while the node
  * is still 0-wide and never correct itself, so keep retrying on animation frames
  * until a real width arrives, then hand over to the observer.
  */
 useEffect(() => {
  let frame = 0
  let observer: ResizeObserver | null = null
  const measure = () => {
   const node = stageRef.current
   if (node) {
    const width = node.clientWidth
    const height = node.clientHeight || TREEMAP_STAGE_HEIGHT
    if (width > 0) {
     setBox((current) => (current.width === width && current.height === height ? current : { width, height }))
     if (!observer && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measure)
      observer.observe(node)
     }
     return
    }
   }
   frame = requestAnimationFrame(measure)
  }
  measure()
  return () => {
   if (frame) cancelAnimationFrame(frame)
   observer?.disconnect()
  }
 }, [])

 const scoped = useMemo(() => dataset.videos.filter((video) => (
  formatMode.value === "all" ? true : formatMode.value === "shorts" ? video.format === "shorts" : video.format === "long"
 )), [dataset.videos, formatMode])

 const pillars = useMemo(() => {
  const all = buildTreemapPillars(scoped, metric.key)
  return pillarLimit === 0 ? all : all.slice(0, pillarLimit)
 }, [metric.key, pillarLimit, scoped])

 const drilled = drillWord ? pillars.find((pillar) => pillar.word === drillWord) || null : null

 const rects = useMemo(() => {
  const width = Math.max(0, box.width)
  const height = Math.max(0, box.height)
  if (width <= 0 || height <= 0) return []
  if (drilled) {
   return squarifyTreemap(
    drilled.videos
     .map((video) => ({ video, value: Number(video[metric.key]) || 0 }))
     .filter((entry) => entry.value > 0),
    width,
    height,
   ).map((rect) => ({
    key: rect.video.videoId,
    label: videoShortTitle(rect.video.title, 60),
    sub: `${compact(rect.video.views)} views · ${rect.video.format}`,
    color: drilled.color,
    value: rect.value,
    x: rect.x, y: rect.y, w: rect.w, h: rect.h,
   }))
  }
  return squarifyTreemap(pillars, width, height).map((rect) => ({
   key: rect.word,
   label: rect.word,
   sub: `${metric.format(rect.value)} · ${rect.videos.length} vids`,
   color: rect.color,
   value: rect.value,
   x: rect.x, y: rect.y, w: rect.w, h: rect.h,
  }))
 }, [box.height, box.width, drilled, metric, pillars])

 // Pillars overlap, so summing them would over-count. Share is measured against the
 // channel total, which keeps each pillar's percentage honest.
 const total = scoped.reduce((sum, video) => sum + (Number(video[metric.key]) || 0), 0) || 1
 const peak = rects[0]?.value || 1
 const scopeTotal = drilled ? drilled.value : total

 const stats = hovered
  ? [
   { label: metric.label, value: metric.format(hovered.value), tone: "lime" as const, lockTone: true, compact: true },
   { label: drilled ? "FORMAT" : "VIDEOS", value: hovered.sub, tone: "cyan" as const, lockTone: true, compact: true },
   { label: "SHARE", value: `${((hovered.value / scopeTotal) * 100).toFixed(1)}%`, tone: "pink" as const, lockTone: true, compact: true },
  ]
  : [
   { label: "PILLARS", value: String(pillars.length), tone: "lime" as const, lockTone: true, compact: true },
   { label: "VIDEOS", value: compact(drilled ? drilled.videos.length : scoped.length), tone: "cyan" as const, lockTone: true, compact: true },
   { label: metric.label, value: metric.format(scopeTotal), tone: "yellow" as const, lockTone: true, compact: true },
  ]

 return (
  <ModuleFrame
   title="CONTENT TREEMAP"
   subtitle="Pillar area map · area = selected metric · click a pillar to zoom in."
   count={scoped.length}
   color="#FFB570"
   height={480}
   flushShell
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
   activeContext={{
    title: hovered ? hovered.label.toUpperCase() : drilled ? `${drilled.word} — ${drilled.videos.length} VIDEOS` : `ALL PILLARS (${formatMode.label})`,
    stats,
   }}
   controllerRows={[
    {
     type: "number",
     value: drilled ? String(drilled.videos.length) : pillarLimit === 0 ? String(pillars.length) : String(Math.min(pillarLimit, pillars.length)),
     onPrev: () => { setCountIndex((i) => (i + TREEMAP_PILLAR_COUNTS.length - 1) % TREEMAP_PILLAR_COUNTS.length); setDrillWord(null) },
     onNext: () => { setCountIndex((i) => (i + 1) % TREEMAP_PILLAR_COUNTS.length); setDrillWord(null) },
     bgTone: "#FFEA00",
     fgTone: "#000000",
    },
    {
     type: "text",
     value: metric.label,
     onPrev: () => setMetricIndex((i) => (i + TREEMAP_METRICS.length - 1) % TREEMAP_METRICS.length),
     onNext: () => setMetricIndex((i) => (i + 1) % TREEMAP_METRICS.length),
     bgTone: "#FF7497",
     fgTone: "#000000",
    },
    {
     type: "text",
     value: formatMode.label,
     onPrev: () => { setFormatIndex((i) => (i + VITAL_FORMAT_MODES.length - 1) % VITAL_FORMAT_MODES.length); setDrillWord(null) },
     onNext: () => { setFormatIndex((i) => (i + 1) % VITAL_FORMAT_MODES.length); setDrillWord(null) },
     bgTone: "#00CCFF",
     fgTone: "#000000",
    },
   ]}
  >
   <div className="relative w-full overflow-hidden bg-[#0a0a1a] p-2" style={{ height: TREEMAP_STAGE_HEIGHT }}>
    <div ref={stageRef} className="relative h-full w-full">
     {rects.length === 0 ? <Empty label="No keyword pillars available for the current filters." /> : rects.map((rect) => {
      const tiny = rect.w < 52 || rect.h < 30
      const small = rect.w < 118 || rect.h < 58
      return (
       <button
        key={rect.key}
        type="button"
        className="absolute flex flex-col justify-between overflow-hidden rounded-[9px] border-2 border-black text-left text-black transition-transform duration-150 hover:z-10 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:brightness-110 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        style={{
         left: rect.x,
         top: rect.y,
         width: Math.max(0, rect.w - 3),
         height: Math.max(0, rect.h - 3),
         background: rect.color,
         opacity: 0.62 + 0.38 * (rect.value / peak),
         padding: tiny ? "2px 3px" : small ? "4px 5px" : "7px 8px",
        }}
        onClick={() => { if (!drilled) { setDrillWord(rect.key); setHovered(null) } }}
        onMouseEnter={() => setHovered({ label: rect.label, value: rect.value, sub: rect.sub })}
        onMouseLeave={() => setHovered(null)}
        title={`${rect.label} · ${rect.sub}`}
       >
        <span
         className="overflow-hidden font-[1000] uppercase leading-none tracking-[-0.02em]"
         style={{ fontSize: tiny ? 8 : small ? 10 : 15 }}
        >
         {rect.label}
        </span>
        {!tiny && (
         <span className="font-[1000] uppercase leading-tight tracking-[0.04em] opacity-85" style={{ fontSize: small ? 8 : 10 }}>
          {rect.sub}
         </span>
        )}
       </button>
      )
     })}
    </div>
    {drilled && (
     <button
      type="button"
      className="absolute left-3 top-3 z-20 rounded-[6px] border-2 border-black bg-[#FFDA47] px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] shadow-[3px_3px_0_rgba(0,0,0,0.6)]"
      onClick={() => { setDrillWord(null); setHovered(null) }}
     >
      ◀ All pillars
     </button>
    )}
   </div>
  </ModuleFrame>
 )
}
const RADAR_COUNTS = [4, 6, 8, 12] as const

export const TubeExplorerEngagementRadar: React.FC<TubeExplorerVisualProps> = (props) => {
 const dataset = useExplorerData(props)
 const [countIndex, setCountIndex] = useState(2)
 const [formatIndex, setFormatIndex] = useState(0)
 const [hovered, setHovered] = useState<TubeExplorerVideoPoint | null>(null)

 const count = RADAR_COUNTS[countIndex]
 const formatMode = VITAL_FORMAT_MODES[formatIndex]

 const videos = useMemo(() => {
  const scoped = dataset.videos.filter((video) => (
   formatMode.value === "all" ? true : formatMode.value === "shorts" ? video.format === "shorts" : video.format === "long"
  ))
  return [...scoped].sort((a, b) => b.views - a.views).slice(0, count)
 }, [count, dataset.videos, formatMode])

 const colors = VT_SPECTRUM_PALETTE_06

 return (
  <ModuleFrame
   title="ENGAGEMENT RADAR"
   subtitle="One polygon per video · axes normalised against the current selection."
   count={videos.length}
   color="#B14AED"
   height={420}
   flushShell
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
   activeContext={{
    title: hovered ? videoShortTitle(hovered.title, 54).toUpperCase() : `TOP ${videos.length} BY VIEWS (${formatMode.label})`,
    stats: hovered
     ? RADAR_AXES.map((axis, index) => ({
      label: axis.label,
      value: axis.format(axis.read(hovered)),
      tone: colors[index % colors.length],
      lockTone: true,
      compact: true,
     }))
     : [
      { label: "VIDEOS", value: String(videos.length), tone: "#C0F240", lockTone: true, compact: true },
      { label: "AXES", value: String(RADAR_AXES.length), tone: "#36E0F6", lockTone: true, compact: true },
      { label: "TOP VIEWS", value: compact(videos[0]?.views || 0), tone: "#FFDA47", lockTone: true, compact: true },
     ],
   }}
   controllerRows={[
    {
     type: "number",
     value: String(videos.length),
     onPrev: () => { setCountIndex((i) => (i + RADAR_COUNTS.length - 1) % RADAR_COUNTS.length); setHovered(null) },
     onNext: () => { setCountIndex((i) => (i + 1) % RADAR_COUNTS.length); setHovered(null) },
     bgTone: "#FFEA00",
     fgTone: "#000000",
    },
    {
     type: "text",
     value: formatMode.label,
     onPrev: () => { setFormatIndex((i) => (i + VITAL_FORMAT_MODES.length - 1) % VITAL_FORMAT_MODES.length); setHovered(null) },
     onNext: () => { setFormatIndex((i) => (i + 1) % VITAL_FORMAT_MODES.length); setHovered(null) },
     bgTone: "#FF7497",
     fgTone: "#000000",
    },
    { type: "label", value: "RANK RELATIVE", bgTone: "#000000", fgTone: "#FFFFFF" },
   ]}
  >
   <EngagementRadarRenderer
    videos={videos}
    colors={colors}
    hoveredId={hovered?.videoId ?? null}
    onHover={setHovered}
   />
  </ModuleFrame>
 )
}
const PLOT_LIMIT_OPTIONS = [30, 60, 90, 120, 200] as const
const WAVEFORM_LIMIT_OPTIONS = [48, 96, 150, 200] as const
const RETENTION_ATLAS_LIMIT_OPTIONS = [6, 10, 16, 24] as const
const PLOT_METRIC_SELECT_OPTIONS = VIDEO_PLOT_METRIC_OPTIONS.map((option) => ({ label: option.label.toUpperCase(), value: option.key }))

export const TubeExplorerRevenueEfficiencyMap: React.FC<TubeExplorerVisualProps> = (props) => {
 const dataset = useExplorerData(props)
 const [xMetric, setXMetric] = useState<VideoPlotMetricKey>("views")
 const [yMetric, setYMetric] = useState<VideoPlotMetricKey>("rpm")
 const [sizeMetric, setSizeMetric] = useState<VideoPlotMetricKey>("revenue")
 const [formatIndex, setFormatIndex] = useState(0)
 const [limitIndex, setLimitIndex] = useState(2)
 const formatMode = VITAL_FORMAT_MODES[formatIndex]
 const limit = PLOT_LIMIT_OPTIONS[limitIndex]
 const scoped = filterVideosByFormat(dataset.videos, formatMode.value)
 const rows = topVideosByPlotMetric(scoped, sizeMetric, limit)
 const sizeOption = plotMetricOptionFor(sizeMetric)

 return (
  <ModuleFrame
   title="REVENUE EFFICIENCY MAP"
   subtitle="Video points plotted by selected business metrics with responsive axis ranges."
   count={rows.length}
   color="#42FF68"
   height={420}
   flushShell
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
   activeContext={{
    title: `${plotMetricOptionFor(xMetric).label.toUpperCase()} × ${plotMetricOptionFor(yMetric).label.toUpperCase()}`,
    stats: [
     { label: "VIDEOS", value: compact(rows.length), tone: "#42FF68", lockTone: true, compact: true },
     { label: sizeOption.label.toUpperCase(), value: sizeOption.format(rows.reduce((sum, video) => sum + plotMetricValue(video, sizeMetric), 0)), tone: "#FF83EA", lockTone: true, compact: true },
     { label: "FORMAT", value: formatMode.label, tone: "#00E5FF", lockTone: true, compact: true },
    ],
   }}
   controllerRows={[
    { type: "dropdown", labelPrefix: "X", value: xMetric, options: PLOT_METRIC_SELECT_OPTIONS, onSelect: (value) => setXMetric(value as VideoPlotMetricKey), bgTone: "#00E5FF" },
    { type: "dropdown", labelPrefix: "Y", value: yMetric, options: PLOT_METRIC_SELECT_OPTIONS, onSelect: (value) => setYMetric(value as VideoPlotMetricKey), bgTone: "#FF83EA" },
    { type: "dropdown", labelPrefix: "SIZE", value: sizeMetric, options: PLOT_METRIC_SELECT_OPTIONS, onSelect: (value) => setSizeMetric(value as VideoPlotMetricKey), bgTone: "#FFFF61" },
    {
     type: "text",
     value: formatMode.label,
     onPrev: () => setFormatIndex((i) => (i + VITAL_FORMAT_MODES.length - 1) % VITAL_FORMAT_MODES.length),
     onNext: () => setFormatIndex((i) => (i + 1) % VITAL_FORMAT_MODES.length),
     bgTone: "#FFB570",
    },
    {
     type: "number",
     value: rows.length,
     onPrev: () => setLimitIndex((i) => (i + PLOT_LIMIT_OPTIONS.length - 1) % PLOT_LIMIT_OPTIONS.length),
     onNext: () => setLimitIndex((i) => (i + 1) % PLOT_LIMIT_OPTIONS.length),
     bgTone: "#42FF68",
     isBig: false,
    },
   ]}
  >
   <RevenueEfficiencyMapRenderer dataset={dataset} xMetric={xMetric} yMetric={yMetric} sizeMetric={sizeMetric} formatMode={formatMode.value} limit={limit} />
  </ModuleFrame>
 )
}

export const TubeExplorerLikeRateWaveform: React.FC<TubeExplorerVisualProps> = (props) => {
 const dataset = useExplorerData(props)
 const [metric, setMetric] = useState<VideoPlotMetricKey>("likeRate")
 const [formatIndex, setFormatIndex] = useState(0)
 const [order, setOrder] = useState<"recent" | "top">("recent")
 const [limitIndex, setLimitIndex] = useState(1)
 const formatMode = VITAL_FORMAT_MODES[formatIndex]
 const limit = WAVEFORM_LIMIT_OPTIONS[limitIndex]
 const scoped = filterVideosByFormat(dataset.videos, formatMode.value)
 const rows = order === "recent" ? scoped.slice(-limit) : topVideosByPlotMetric(scoped, metric, limit)
 const metricOption = plotMetricOptionFor(metric)

 return (
  <ModuleFrame
   title="LIKE RATE WAVEFORM"
   subtitle="Upload-order signal line for like rate, engagement, comments, shares, or other creator response metrics."
   count={rows.length}
   color="#FF83EA"
   height={400}
   flushShell
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
   activeContext={{
    title: `${metricOption.label.toUpperCase()} SIGNAL`,
    stats: [
     { label: "VIDEOS", value: compact(rows.length), tone: "#00E5FF", lockTone: true, compact: true },
     { label: "AVG", value: metricOption.format(weightedAverage(rows, (row) => plotMetricValue(row, metric), (row) => Math.max(row.views, 1))), tone: "#FF83EA", lockTone: true, compact: true },
     { label: "ORDER", value: order === "recent" ? "RECENT" : "TOP", tone: "#FFFF61", lockTone: true, compact: true },
    ],
   }}
   controllerRows={[
    { type: "dropdown", labelPrefix: "METRIC", value: metric, options: PLOT_METRIC_SELECT_OPTIONS, onSelect: (value) => setMetric(value as VideoPlotMetricKey), bgTone: "#FF83EA" },
    {
     type: "text",
     value: formatMode.label,
     onPrev: () => setFormatIndex((i) => (i + VITAL_FORMAT_MODES.length - 1) % VITAL_FORMAT_MODES.length),
     onNext: () => setFormatIndex((i) => (i + 1) % VITAL_FORMAT_MODES.length),
     bgTone: "#00E5FF",
    },
    {
     type: "text",
     value: order === "recent" ? "RECENT" : "TOP",
     onPrev: () => setOrder((current) => current === "recent" ? "top" : "recent"),
     onNext: () => setOrder((current) => current === "recent" ? "top" : "recent"),
     bgTone: "#FFFF61",
    },
    {
     type: "number",
     value: rows.length,
     onPrev: () => setLimitIndex((i) => (i + WAVEFORM_LIMIT_OPTIONS.length - 1) % WAVEFORM_LIMIT_OPTIONS.length),
     onNext: () => setLimitIndex((i) => (i + 1) % WAVEFORM_LIMIT_OPTIONS.length),
     bgTone: "#42FF68",
     isBig: false,
    },
   ]}
  >
   <LikeRateWaveformRenderer dataset={dataset} metric={metric} formatMode={formatMode.value} order={order} limit={limit} />
  </ModuleFrame>
 )
}

export const TubeExplorerSeasonalityRadar: React.FC<TubeExplorerVisualProps> = (props) => {
 const dataset = useExplorerData(props)
 const [metric, setMetric] = useState<VideoPlotMetricKey>("views")
 const [formatIndex, setFormatIndex] = useState(0)
 const formatMode = VITAL_FORMAT_MODES[formatIndex]
 const scoped = filterVideosByFormat(dataset.videos, formatMode.value)
 const metricOption = plotMetricOptionFor(metric)

 return (
  <ModuleFrame
   title="SEASONALITY RADAR"
   subtitle="Upload weekday shape for the selected metric and format."
   count={scoped.length}
   color="#FFFF61"
   height={420}
   flushShell
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
   activeContext={{
    title: `${metricOption.label.toUpperCase()} BY WEEKDAY`,
    stats: [
     { label: "UPLOADS", value: compact(scoped.length), tone: "#FFFF61", lockTone: true, compact: true },
     { label: "METRIC", value: metricOption.label.toUpperCase(), tone: "#42FF68", lockTone: true, compact: true },
     { label: "FORMAT", value: formatMode.label, tone: "#00E5FF", lockTone: true, compact: true },
    ],
   }}
   controllerRows={[
    { type: "dropdown", labelPrefix: "METRIC", value: metric, options: PLOT_METRIC_SELECT_OPTIONS, onSelect: (value) => setMetric(value as VideoPlotMetricKey), bgTone: "#FFFF61" },
    {
     type: "text",
     value: formatMode.label,
     onPrev: () => setFormatIndex((i) => (i + VITAL_FORMAT_MODES.length - 1) % VITAL_FORMAT_MODES.length),
     onNext: () => setFormatIndex((i) => (i + 1) % VITAL_FORMAT_MODES.length),
     bgTone: "#00E5FF",
    },
    { type: "label", value: "7 WEEKDAYS", bgTone: "#000000", fgTone: "#FFFFFF" },
   ]}
  >
   <div className="h-full bg-[#0a0a1a]">
    <SeasonalityRadarRenderer dataset={dataset} metric={metric} formatMode={formatMode.value} />
   </div>
  </ModuleFrame>
 )
}

export const TubeExplorerSearchBubbleUniverse: React.FC<TubeExplorerVisualProps> = (props) => {
 const dataset = useExplorerData(props)
 const [xMetric, setXMetric] = useState<VideoPlotMetricKey>("views")
 const [yMetric, setYMetric] = useState<VideoPlotMetricKey>("watchHours")
 const [sizeMetric, setSizeMetric] = useState<VideoPlotMetricKey>("revenue")
 const [formatIndex, setFormatIndex] = useState(0)
 const [limitIndex, setLimitIndex] = useState(3)
 const formatMode = VITAL_FORMAT_MODES[formatIndex]
 const limit = PLOT_LIMIT_OPTIONS[limitIndex]
 const rows = topVideosByPlotMetric(filterVideosByFormat(dataset.videos, formatMode.value), sizeMetric, limit)
 const sizeOption = plotMetricOptionFor(sizeMetric)

 return (
  <ModuleFrame
   title="BUBBLE UNIVERSE"
   subtitle="Video universe with custom X, Y, and bubble-size metrics."
   count={rows.length}
   color="#00E5FF"
   height={420}
   flushShell
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
   activeContext={{
    title: `${plotMetricOptionFor(xMetric).label.toUpperCase()} × ${plotMetricOptionFor(yMetric).label.toUpperCase()}`,
    stats: [
     { label: "VIDEOS", value: compact(rows.length), tone: "#00E5FF", lockTone: true, compact: true },
     { label: "SIZE", value: sizeOption.label.toUpperCase(), tone: "#FF83EA", lockTone: true, compact: true },
     { label: "FORMAT", value: formatMode.label, tone: "#42FF68", lockTone: true, compact: true },
    ],
   }}
   controllerRows={[
    { type: "dropdown", labelPrefix: "X", value: xMetric, options: PLOT_METRIC_SELECT_OPTIONS, onSelect: (value) => setXMetric(value as VideoPlotMetricKey), bgTone: "#00E5FF" },
    { type: "dropdown", labelPrefix: "Y", value: yMetric, options: PLOT_METRIC_SELECT_OPTIONS, onSelect: (value) => setYMetric(value as VideoPlotMetricKey), bgTone: "#579AFF" },
    { type: "dropdown", labelPrefix: "SIZE", value: sizeMetric, options: PLOT_METRIC_SELECT_OPTIONS, onSelect: (value) => setSizeMetric(value as VideoPlotMetricKey), bgTone: "#FF83EA" },
    {
     type: "text",
     value: formatMode.label,
     onPrev: () => setFormatIndex((i) => (i + VITAL_FORMAT_MODES.length - 1) % VITAL_FORMAT_MODES.length),
     onNext: () => setFormatIndex((i) => (i + 1) % VITAL_FORMAT_MODES.length),
     bgTone: "#42FF68",
    },
    {
     type: "number",
     value: rows.length,
     onPrev: () => setLimitIndex((i) => (i + PLOT_LIMIT_OPTIONS.length - 1) % PLOT_LIMIT_OPTIONS.length),
     onNext: () => setLimitIndex((i) => (i + 1) % PLOT_LIMIT_OPTIONS.length),
     bgTone: "#FFFF61",
     isBig: false,
    },
   ]}
  >
   <BubbleUniverseRenderer dataset={dataset} xMetric={xMetric} yMetric={yMetric} sizeMetric={sizeMetric} formatMode={formatMode.value} limit={limit} />
  </ModuleFrame>
 )
}

const RETENTION_SORT_OPTIONS: Array<{ label: string; value: VideoPlotMetricKey }> = [
 { label: "VIEWS", value: "views" },
 { label: "AVP", value: "avp" },
 { label: "WATCH", value: "watchHours" },
 { label: "RETENTION", value: "retentionScore" },
]

export const TubeExplorerRetentionCurveAtlas: React.FC<TubeExplorerVisualProps> = (props) => {
 const dataset = useExplorerData(props)
 const [sortMetric, setSortMetric] = useState<VideoPlotMetricKey>("views")
 const [formatIndex, setFormatIndex] = useState(0)
 const [limitIndex, setLimitIndex] = useState(1)
 const formatMode = VITAL_FORMAT_MODES[formatIndex]
 const limit = RETENTION_ATLAS_LIMIT_OPTIONS[limitIndex]
 const rows = topVideosByPlotMetric(filterVideosByFormat(dataset.videos, formatMode.value), sortMetric, limit).filter((video) => video.avp > 0 || video.retentionScore > 0)

 return (
  <ModuleFrame
   title="RETENTION CURVE ATLAS"
   subtitle="Mock curve atlas from available average-view percentage until full point-by-point retention is synced."
   count={rows.length}
   color="#579AFF"
   height={420}
   flushShell
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
   activeContext={{
    title: `RETENTION ATLAS (${formatMode.label})`,
    stats: [
     { label: "VIDEOS", value: compact(rows.length), tone: "#579AFF", lockTone: true, compact: true },
     { label: "AVG AVP", value: `${weightedAverage(rows, (row) => row.avp, (row) => Math.max(row.views, 1)).toFixed(1)}%`, tone: "#CCFF00", lockTone: true, compact: true },
     { label: "SORT", value: plotMetricOptionFor(sortMetric).label.toUpperCase(), tone: "#FF83EA", lockTone: true, compact: true },
    ],
   }}
   controllerRows={[
    { type: "dropdown", labelPrefix: "SORT", value: sortMetric, options: RETENTION_SORT_OPTIONS, onSelect: (value) => setSortMetric(value as VideoPlotMetricKey), bgTone: "#579AFF" },
    {
     type: "text",
     value: formatMode.label,
     onPrev: () => setFormatIndex((i) => (i + VITAL_FORMAT_MODES.length - 1) % VITAL_FORMAT_MODES.length),
     onNext: () => setFormatIndex((i) => (i + 1) % VITAL_FORMAT_MODES.length),
     bgTone: "#FF83EA",
    },
    {
     type: "number",
     value: rows.length,
     onPrev: () => setLimitIndex((i) => (i + RETENTION_ATLAS_LIMIT_OPTIONS.length - 1) % RETENTION_ATLAS_LIMIT_OPTIONS.length),
     onNext: () => setLimitIndex((i) => (i + 1) % RETENTION_ATLAS_LIMIT_OPTIONS.length),
     bgTone: "#FFFF61",
     isBig: false,
    },
   ]}
  >
   <RetentionCurveAtlasRenderer dataset={dataset} sortMetric={sortMetric} formatMode={formatMode.value} limit={limit} />
  </ModuleFrame>
 )
}
export const TubeExplorerPublishOptimalClock: React.FC<TubeExplorerVisualProps> = (props) => {
 const dataset = useExplorerData(props)
 const [metric, setMetric] = useState<PublishClockMetricKey>("views")
 const [formatFilter, setFormatFilter] = useState<"all" | "shorts" | "long">("all")
 const [hovered, setHovered] = useState<PublishClockCell | null>(null)

 const option = PUBLISH_CLOCK_METRICS.find((entry) => entry.key === metric) || PUBLISH_CLOCK_METRICS[0]

 const { cells, scopedCount } = useMemo(() => {
  const scoped = dataset.videos.filter((video) => {
   if (!video.uploadDate) return false
   if (formatFilter === "shorts") return video.format === "shorts"
   if (formatFilter === "long") return video.format === "long"
   return true
  })

  const buckets = PUBLISH_CLOCK_DAYS.map(() => PUBLISH_CLOCK_HOURS.map(() => ({
   total: 0, uploads: 0, views: 0, subs: 0, comments: 0, likes: 0, revenue: 0,
  })))
  scoped.forEach((video) => {
   const date = new Date(video.uploadDate)
   if (Number.isNaN(date.getTime())) return
   const bucket = buckets[date.getDay()]?.[date.getHours()]
   if (!bucket) return
   bucket.total += metric === "uploads" ? 1 : Number(video[metric as keyof TubeExplorerVideoPoint]) || 0
   bucket.uploads += 1
   bucket.views += video.views
   bucket.subs += video.subscribersGained
   bucket.comments += video.comments
   bucket.likes += video.likes
   bucket.revenue += video.revenue
  })

  const flat: PublishClockCell[] = buckets.flatMap((hoursRow, dayIndex) => hoursRow.map((bucket, hour) => ({
   dayIndex,
   hour,
   value: option.average && bucket.uploads > 0 ? bucket.total / bucket.uploads : bucket.total,
   uploads: bucket.uploads,
   views: bucket.views,
   subs: bucket.subs,
   comments: bucket.comments,
   likes: bucket.likes,
   revenue: bucket.revenue,
   rank: 0,
  })))

  // Rank against populated cells only, so a handful of busy slots cannot flatten the rest.
  const populated = flat.filter((cell) => cell.uploads > 0).sort((a, b) => a.value - b.value)
  const rankByKey = new Map<string, number>()
  populated.forEach((cell, index) => {
   rankByKey.set(publishClockCellKey(cell), populated.length > 1 ? index / (populated.length - 1) : 1)
  })

  return {
   cells: flat.map((cell) => ({ ...cell, rank: rankByKey.get(publishClockCellKey(cell)) ?? 0 })),
   scopedCount: scoped.length,
  }
 }, [dataset.videos, formatFilter, metric, option])

 const best = cells.reduce<PublishClockCell | null>(
  (top, cell) => (cell.uploads > 0 && (!top || cell.value > top.value) ? cell : top),
  null,
 )
 const activeCell = hovered || best
 const slotLabel = (cell: PublishClockCell | null) =>
  cell ? `${PUBLISH_CLOCK_DAYS[cell.dayIndex]} ${String(cell.hour).padStart(2, "0")}:00` : "—"

 // Window rollups back the strip when nothing is hovered, so it always reads as a summary.
 const windowTotals = cells.reduce(
  (acc, cell) => ({
   uploads: acc.uploads + cell.uploads,
   views: acc.views + cell.views,
   subs: acc.subs + cell.subs,
   comments: acc.comments + cell.comments,
   likes: acc.likes + cell.likes,
   revenue: acc.revenue + cell.revenue,
  }),
  { uploads: 0, views: 0, subs: 0, comments: 0, likes: 0, revenue: 0 },
 )
 const summary = hovered ?? windowTotals
 const summaryUploads = hovered ? hovered.uploads : windowTotals.uploads
 // Per-video averages throughout, matching how the grid itself now ranks slots.
 const per = (total: number) => (summaryUploads > 0 ? total / summaryUploads : 0)
 const marked = (label: string, key: PublishClockMetricKey) => (metric === key ? `► ${label}` : label)

 return (
  <ModuleFrame
   title="PUBLISH OPTIMAL CLOCK"
   subtitle="Day and time cells for upload performance."
   count={scopedCount}
   color="#CCFF00"
   height={420}
   flushShell
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
   activeContext={{
    title: hovered ? `${slotLabel(hovered)} • SLOT` : `PUBLISH GRID (${formatFilter.toUpperCase()})`,
    stats: [
     { label: "SLOT", value: slotLabel(activeCell), tone: "white" as const, lockTone: true, compact: true },
     { label: marked("AVG VIEWS", "views"), value: compact(per(summary.views)), tone: "yellow" as const, lockTone: true, compact: true },
     { label: marked("AVG SUBS", "subscribersGained"), value: per(summary.subs).toFixed(1), tone: "lime" as const, lockTone: true, compact: true },
     { label: "AVG CMTS", value: per(summary.comments).toFixed(1), tone: "cyan" as const, lockTone: true, compact: true },
     { label: marked("AVG LIKES", "likes"), value: per(summary.likes).toFixed(1), tone: "pink" as const, lockTone: true, compact: true },
     { label: marked("AVG REV", "revenue"), value: `$${per(summary.revenue).toFixed(2)}`, tone: "orange" as const, lockTone: true, compact: true },
     { label: marked("UPLOADS", "uploads"), value: `${summaryUploads}`, tone: "purple" as const, lockTone: true, compact: true },
     { label: "TOP SLOT", value: slotLabel(best), tone: "white" as const, lockTone: true, compact: true },
    ],
   }}
   controllerRows={[
    {
     type: "dropdown",
     value: metric,
     options: PUBLISH_CLOCK_METRICS.map((entry) => ({ label: entry.label, value: entry.key })),
     onSelect: (value) => setMetric(value as PublishClockMetricKey),
     bgTone: "#FFEA00",
    },
    {
     type: "dropdown",
     value: formatFilter,
     options: [
      { label: "ALL VIDEOS", value: "all" },
      { label: "SHORTS ONLY", value: "shorts" },
      { label: "LONGFORM ONLY", value: "long" },
     ],
     onSelect: (value) => setFormatFilter(value as "all" | "shorts" | "long"),
     bgTone: "#FF7497",
    },
    { type: "label", value: `${scopedCount} VIDEOS`, bgTone: "#FFFFFF" },
   ]}
  >
   <PublishOptimalClockRenderer
    cells={cells}
    metricLabel={option.label}
    formatValue={option.format}
    hoveredKey={hovered ? publishClockCellKey(hovered) : null}
    onHover={setHovered}
   />
  </ModuleFrame>
 )
}
const RIVER_SOURCE_LIMITS = [6, 8, 10, 14] as const

export const TubeExplorerTrafficDayRiverDelta: React.FC<TubeExplorerVisualProps> = (props) => {
 const rows = Array.isArray(props.trafficByDay) ? props.trafficByDay : []
 const dataset = useExplorerData(props)
 const [limitIndex, setLimitIndex] = useState(1)
 const [grainIndex, setGrainIndex] = useState(0)
 const [hovered, setHovered] = useState<{ label: string; views: number; sub: string } | null>(null)
 const [highlight, setHighlight] = useState<RiverHighlight>(null)
 const grainSpec = RIVER_GRAINS[grainIndex]

 const sourceLimit = RIVER_SOURCE_LIMITS[limitIndex]
 const parsed = rows.map((row) => trafficDayPoint(row as Record<string, unknown>)).filter((row) => row.day && row.views > 0)
 const totalViews = parsed.reduce((sum, row) => sum + row.views, 0)
 const sourceCount = new Set(parsed.map((row) => row.source)).size

 return (
  <ModuleFrame
   title="RIVER DELTA"
   subtitle="Traffic source flow · sources on top, the selected time buckets below."
   count={rows.length || dataset.traffic.length}
   color="#42FF68"
   icon="analytics"
   height={460}
   flushShell
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
   activeContext={{
    title: hovered ? hovered.label.toUpperCase() : "TRAFFIC x DAY",
    stats: hovered
     ? [
      { label: "FLOW VIEWS", value: compact(hovered.views), tone: "#42FF68", lockTone: true, compact: true },
      { label: "DAY", value: hovered.sub, tone: "#00E5FF", lockTone: true, compact: true },
      { label: "SHARE", value: `${((hovered.views / Math.max(totalViews, 1)) * 100).toFixed(1)}%`, tone: "#FF83EA", lockTone: true, compact: true },
     ]
     : [
      { label: "ROWS", value: compact(rows.length), tone: "#42FF68", lockTone: true, compact: true },
      { label: "SOURCES", value: compact(sourceCount), tone: "#00E5FF", lockTone: true, compact: true },
      { label: "VIEWS", value: compact(totalViews), tone: "#FF83EA", lockTone: true, compact: true },
     ],
   }}
   controllerRows={[
    {
     type: "number",
     value: String(Math.min(sourceLimit, sourceCount || sourceLimit)),
     onPrev: () => { setLimitIndex((i) => (i + RIVER_SOURCE_LIMITS.length - 1) % RIVER_SOURCE_LIMITS.length); setHovered(null) },
     onNext: () => { setLimitIndex((i) => (i + 1) % RIVER_SOURCE_LIMITS.length); setHovered(null) },
     bgTone: "#FFEA00",
     fgTone: "#000000",
    },
    { type: "label", value: "TOP SOURCES", bgTone: "#00CCFF", fgTone: "#000000" },
    {
     type: "text",
     value: grainSpec.label,
     onPrev: () => { setGrainIndex((i) => (i + RIVER_GRAINS.length - 1) % RIVER_GRAINS.length); setHighlight(null); setHovered(null) },
     onNext: () => { setGrainIndex((i) => (i + 1) % RIVER_GRAINS.length); setHighlight(null); setHovered(null) },
     bgTone: "#000000",
     fgTone: "#FFFFFF",
    },
   ]}
  >
   <div className="h-full w-full bg-[#0a0a1a]">
    <TrafficDayRiverDeltaRenderer
     rows={rows}
     sourceLimit={sourceLimit}
     grain={grainSpec.value}
     highlight={highlight}
     onHighlight={setHighlight}
     onHover={setHovered}
    />
   </div>
  </ModuleFrame>
 )
}
export const TubeExplorerThermalHeatmapGrid = createModule("MONTH HEAT", "Monthly video count as a heat grid.", (d) => <HeatGrid cells={d.monthly.map((m) => ({ label: m.month, value: m.views }))} empty="No monthly rows available" />, { color: "#FF7497" })
export const TubeExplorerEmissionSpectrum = createModule("GEO SPECTRUM", "Geography ranked as a color band.", (d) => <GeoBars dataset={d} />, { color: "#B14AED" })
export const TubeExplorerStalactiteDrip = createModule("WATCH DRIPS", "Watch hours falling by video rank.", (d) => <VideoBars rows={topVideos(d, "watchHours", 22)} metric="watchHours" color="#00CCFF" />, { color: "#00CCFF" })
const GEO_RIVER_SOURCE_LIMITS = [4, 6, 8, 10] as const
const GEO_RIVER_DEST_LIMITS = [4, 7, 10, 14] as const
const GEO_RIVER_MIN_VIEW_OPTIONS = [
 { label: "ALL GEO", value: "0" },
 { label: "50+ VIEWS", value: "50" },
 { label: "100+ VIEWS", value: "100" },
 { label: "500+ VIEWS", value: "500" },
]

export const TubeExplorerSankeyRiverDelta: React.FC<TubeExplorerVisualProps> = (props) => {
 const dataset = useExplorerData(props)
 const [sourceIndex, setSourceIndex] = useState(1)
 const [geoIndex, setGeoIndex] = useState(1)
 const [minGeoViews, setMinGeoViews] = useState(100)
 const sourceLimit = GEO_RIVER_SOURCE_LIMITS[sourceIndex]
 const geoLimit = GEO_RIVER_DEST_LIMITS[geoIndex]
 const sourceRows = dataset.traffic.filter((row) => row.views > 0).slice(0, sourceLimit)
 const geoRows = dataset.geography.filter((row) => row.views >= minGeoViews).slice(0, geoLimit)
 const leadSource = sourceRows[0]
 const leadGeo = geoRows[0]
 const totalViews = sourceRows.reduce((sum, row) => sum + row.views, 0) || 1

 return (
  <ModuleFrame
   title="RIVER DELTA"
   subtitle="Traffic sources flowing into top geography ranks."
   count={sourceRows.length + geoRows.length}
   color="#42FF68"
   height={460}
   flushShell
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
   activeContext={{
    title: "SOURCE TO GEO FLOW",
    stats: [
     { label: "TOTAL VIEWS", value: compact(totalViews), tone: leadSource ? TRAFFIC_COLORS[0] : "#00E5FF", lockTone: true, compact: true },
     { label: "TOP SOURCE", value: leadSource ? formatTrafficLabel(leadSource.sourceTitle || leadSource.sourceType) : "—", tone: leadSource ? TRAFFIC_COLORS[0] : "#FF7497", lockTone: true, compact: true },
     { label: "TOP GEO", value: leadGeo ? String(leadGeo.label) : "—", tone: leadGeo ? TRAFFIC_COLORS[1] : "#FFB158", lockTone: true, compact: true },
    ],
   }}
   controllerRows={[
    {
     type: "number",
     value: sourceRows.length,
     onPrev: () => setSourceIndex((i) => (i + GEO_RIVER_SOURCE_LIMITS.length - 1) % GEO_RIVER_SOURCE_LIMITS.length),
     onNext: () => setSourceIndex((i) => (i + 1) % GEO_RIVER_SOURCE_LIMITS.length),
     bgTone: "#42FF68",
     fgTone: "#000000",
     isBig: false,
    },
    {
     type: "number",
     value: geoRows.length,
     onPrev: () => setGeoIndex((i) => (i + GEO_RIVER_DEST_LIMITS.length - 1) % GEO_RIVER_DEST_LIMITS.length),
     onNext: () => setGeoIndex((i) => (i + 1) % GEO_RIVER_DEST_LIMITS.length),
     bgTone: "#00E5FF",
     fgTone: "#000000",
     isBig: false,
    },
    {
     type: "dropdown",
     labelPrefix: "GEO",
     value: String(minGeoViews),
     options: GEO_RIVER_MIN_VIEW_OPTIONS,
     onSelect: (value) => setMinGeoViews(Number(value)),
     bgTone: "#FFFF61",
    },
   ]}
  >
   <SankeyRiverDeltaRenderer dataset={dataset} sourceLimit={sourceLimit} geoLimit={geoLimit} minGeoViews={minGeoViews} />
  </ModuleFrame>
 )
}
export const TubeExplorerContourDensityMap = createModule("RETENTION SCATTER", "Views against average percentage viewed.", (d) => <VideoScatter rows={topVideos(d, "views", 120)} x="views" y="retentionScore" />, { color: "#FFB158" })
export const TubeExplorerClockRadialBurst = createModule(
 "CLOCK BURST",
 "Traffic sources arranged as a radial ring with drilldown detail.",
 (d) => <ClockRadialBurstRenderer dataset={d} />,
 {
  color: "#FFE35A",
  height: 460,
  flushShell: true,
  activeContext: (dataset) => {
   const slices = summarizeTrafficSlices(dataset.traffic.filter((row) => row.views > 0 && !isAggregateTrafficLabel(row.sourceTitle) && !isAggregateTrafficLabel(row.sourceType) && !isAggregateTrafficLabel(row.sourceDetail)))
   const leadSlice = slices[0] || null
   const totalViews = slices.reduce((sum, slice) => sum + slice.views, 0) || 1
   const detailRows = leadSlice ? buildTrafficDetailRows(dataset.traffic, leadSlice.kind) : []
   return {
    title: leadSlice ? `${trafficFocusLabel(leadSlice.kind)} • SOURCE DETAIL` : "CLOCK RADIAL BURST",
    stats: [
     { label: "TOTAL VIEWS", value: compact(totalViews), tone: leadSlice?.color || "#00E5FF", lockTone: true, compact: true },
     { label: "TOP SOURCE", value: leadSlice ? leadSlice.label : "—", tone: leadSlice?.color || "#FF7497", lockTone: true, compact: true },
     { label: "DETAIL ROWS", value: compact(detailRows.length), tone: "#00E5FF", lockTone: true, compact: true },
    ],
   }
  },
 }
)
export const TubeExplorerRetentionMosaic = createModule("RETENTION TILES", "AVP and STW spread across a compact tile field.", (d) => <HeatGrid cells={topVideos(d, "retentionScore", 28).map((v) => ({ label: v.videoId.slice(0, 5), value: v.retentionScore }))} empty="No retention metrics available" />, { color: "#FF7497" })

export const TubeExplorerPerfectionQuadrant = createModule("PERFECT MIX", "Retention and revenue plotted together.", (d) => <VideoScatter rows={topVideos(d, "valueScore", 90)} x="retentionScore" y="revenue" />, { color: "#CCFF00" })
export const TubeExplorerDurationRetentionScatter = createModule("LENGTH CURVE", "Video length versus retention.", (d) => <VideoScatter rows={topVideos(d, "views", 120)} x="durationSec" y="retentionScore" />, { color: "#FFB158" })
export const TubeExplorerBeeswarmLikeRate = createModule("LIKE CLOUD", "Like-rate clusters across the channel.", (d) => <VideoScatter rows={topVideos(d, "likes", 120)} x="views" y="likeRate" />, { color: "#B14AED" })
export const TubeExplorerCalendarHeatSignature = createModule("CALENDAR HEAT", "Monthly uploads arranged as a calendar signature.", (d) => <HeatGrid cells={d.monthly.map((m) => ({ label: m.month, value: m.videos }))} empty="No monthly upload rows available" />, { color: "#42FF68" })
export const TubeExplorerUSStateDotMap = createModule("GEO RANK", "Country, region, and city views sorted by reach.", (d) => <GeoBars dataset={d} />, { color: "#FF7497" })
export const TubeExplorerTitleWordNetwork: React.FC<TubeExplorerVisualProps> = (props) => {
 const dataset = useExplorerData(props)
 const [wordLimit, setWordLimit] = useState(15)
 const [hovered, setHovered] = useState<string | null>(null)

 const graph = useMemo(
  () => buildWordNetwork(dataset.videos.filter((video) => video.views > 0), wordLimit),
  [dataset.videos, wordLimit],
 )

 const topNode = graph.nodes.reduce<WordNode | null>((best, node) => (!best || node.totalViews > best.totalViews ? node : best), null)
 const totalKeywordViews = graph.nodes.reduce((sum, node) => sum + node.totalViews, 0)

 const hoveredNode = hovered ? graph.nodes.find((node) => node.id === hovered) || null : null
 const hoveredConnections = hoveredNode
  ? graph.edges.filter((edge) => graph.nodes[edge.source]?.id === hoveredNode.id || graph.nodes[edge.target]?.id === hoveredNode.id).length
  : 0

 const activeStats = hoveredNode ? [
  { label: "WORD", value: hoveredNode.id.toUpperCase(), tone: "lime" as const, lockTone: true },
  { label: "VIDEOS", value: String(hoveredNode.videoCount), tone: "cyan" as const, lockTone: true },
  { label: "VIEWS", value: compact(hoveredNode.totalViews), tone: "pink" as const, lockTone: true },
  { label: "CO-WORDS", value: String(hoveredConnections), tone: "yellow" as const, lockTone: true },
  { label: "SHARE OF TRACKED", value: `${((hoveredNode.totalViews / Math.max(totalKeywordViews, 1)) * 100).toFixed(1)}%`, tone: "purple" as const, lockTone: true },
 ] : [
  { label: "KEYWORDS", value: String(graph.nodes.length), tone: "lime" as const, lockTone: true },
  { label: "LINKS", value: String(graph.edges.length), tone: "cyan" as const, lockTone: true },
  { label: "TOP WORD", value: topNode ? topNode.id.toUpperCase() : "—", tone: "yellow" as const, lockTone: true },
  { label: "TOP VIEWS", value: topNode ? compact(topNode.totalViews) : "0", tone: "pink" as const, lockTone: true },
  { label: "TRACKED VIEWS", value: compact(totalKeywordViews), tone: "purple" as const, lockTone: true },
 ]

 return (
  <SubToolboxChartModule
   collapsible={props.collapsible}
   isOpenInitial={props.isOpenInitial}
   header={{
    title: "TITLE WORD NETWORK",
    subtitle: "CO-OCCURRENCE GRAPH · NODE SIZE = VIEWS · COLOR = POSITION · VIEWS · RANK VS OTHERS · CONNECTED TO · AVG RET% · AVG DURATION · VIDEOS",
    icon: <CustomIcon name="analytics" size={34} />,
   }}
   theme={{ headerBandBg: "#CCFF00", iconBlockBg: "#20D4F7" }}
   activeContext={{
    title: hovered ? `"${hovered.toUpperCase()}" CLUSTER` : "NETWORK OVERVIEW",
    stats: activeStats,
   }}
   controllerRows={[
    {
     type: "number",
     value: wordLimit,
     onPrev: () => setWordLimit((n) => Math.max(TITLE_NETWORK_MIN_WORDS, n - 1)),
     onNext: () => setWordLimit((n) => Math.min(TITLE_NETWORK_MAX_WORDS, n + 1)),
     bgTone: "#FFFFFF",
    },
    { type: "label", value: "WORDS SHOWN", bgTone: "#FFFFFF" },
   ]}
   layout={{ moduleMinHeight: "420px" }}
   footer={
    <div className="flex items-center gap-3 px-4 py-2.5">
     <InsightBadge label="Personal Insight" />
     <span className="text-[11px] font-medium leading-5 text-white/85">
      Each bubble is a word from your video titles. Size is total views of titles containing it, color follows layout position across the spectrum, and position is view rank — the most-viewed words sit nearest the center, less-viewed words further out. A line connects two words whenever they appear in the same title. Hover any word to see its own stats above.
     </span>
    </div>
   }
  >
   {graph.nodes.length === 0 ? (
    <Empty label="Need multiple video titles with real views to build the title word network." />
   ) : (
    <div className="h-[420px] w-full">
     <TitleWordNetworkCanvas graph={graph} hovered={hovered} onHover={setHovered} />
    </div>
   )}
  </SubToolboxChartModule>
 )
}

export const TUBE_EXPLORER_VISUAL_MODULES: TubeExplorerVisualModuleEntry[] = [
 { id: "tube-explorer-clock-radial-burst", title: "Clock Radial Burst", render: (props) => <TubeExplorerClockRadialBurst {...props} /> },
 { id: "tube-explorer-barcode-fingerprint", title: "Barcode Fingerprint", render: (props) => <TubeExplorerBarcodeFingerprint {...props} /> },
 { id: "tube-explorer-views-subs-growth-quadrant", title: "Views x Subs Growth Quadrant", render: (props) => <TubeExplorerViewsSubsGrowthQuadrant {...props} /> },
 { id: "tube-explorer-subscriber-waterfall", title: "Subscriber Waterfall", render: (props) => <TubeExplorerSubscriberWaterfall {...props} /> },
 { id: "tube-explorer-shorts-vs-longs", title: "Shorts vs Longs", render: (props) => <TubeExplorerShortsVsLongs {...props} /> },
 { id: "tube-explorer-content-treemap", title: "Content Treemap", render: (props) => <TubeExplorerContentTreemap {...props} /> },
 { id: "tube-explorer-engagement-radar", title: "Engagement Radar", render: (props) => <TubeExplorerEngagementRadar {...props} /> },
 { id: "tube-explorer-traffic-day-river-delta", title: "Traffic x Day River Delta", render: (props) => <TubeExplorerTrafficDayRiverDelta {...props} /> },
 { id: "tube-explorer-revenue-efficiency-map", title: "Revenue Efficiency Map", render: (props) => <TubeExplorerRevenueEfficiencyMap {...props} /> },
 { id: "tube-explorer-like-rate-waveform", title: "Like Rate Waveform", render: (props) => <TubeExplorerLikeRateWaveform {...props} /> },
 { id: "tube-explorer-seasonality-radar", title: "Seasonality Radar", render: (props) => <TubeExplorerSeasonalityRadar {...props} /> },
 { id: "tube-explorer-bubble-universe", title: "Bubble Universe", render: (props) => <TubeExplorerSearchBubbleUniverse {...props} /> },
 { id: "tube-explorer-retention-curve-atlas", title: "Retention Curve Atlas", render: (props) => <TubeExplorerRetentionCurveAtlas {...props} /> },
 { id: "tube-explorer-publish-optimal-clock", title: "Publish Optimal Clock", render: (props) => <TubeExplorerPublishOptimalClock {...props} /> },
 { id: "tube-explorer-sankey-river-delta", title: "Sankey River Delta", render: (props) => <TubeExplorerSankeyRiverDelta {...props} /> },
 { id: "tube-explorer-title-word-network", title: "Title Word Network", render: (props) => <TubeExplorerTitleWordNetwork {...props} /> },
 { id: "tube-explorer-channel-vital-signs", title: "Channel Vital Signs", render: (props) => <TubeExplorerChannelVitalSigns {...props} /> },
 { id: "tube-explorer-thermal-imaging", title: "Thermal Imaging", render: (props) => <TubeExplorerThermalImaging {...props} /> },
 { id: "tube-explorer-keyword-treemap", title: "Keyword Treemap", render: (props) => <TubeExplorerKeywordTreemap {...props} /> },
 { id: "tube-explorer-channel-health-radar", title: "Channel Health Radar", render: (props) => <TubeExplorerChannelHealthRadar {...props} /> },
 { id: "tube-explorer-revenue-forecast", title: "Revenue by Upload Cohort", render: (props) => <TubeExplorerRevenueForecast {...props} /> },
 { id: "tube-explorer-traffic-evolution", title: "Traffic Source Mix", render: (props) => <TubeExplorerTrafficEvolution {...props} /> },
 { id: "tube-explorer-video-value-matrix", title: "Video Value Matrix", render: (props) => <TubeExplorerVideoValueMatrix {...props} /> },
 { id: "tube-explorer-sub-net-flow", title: "Subscriber Net Flow", render: (props) => <TubeExplorerSubNetFlow {...props} /> },
 { id: "tube-explorer-content-donut", title: "Content Donut", render: (props) => <TubeExplorerContentDonut {...props} /> },
 { id: "tube-explorer-performance-gauges", title: "Top Video Views", render: (props) => <TubeExplorerPerformanceGauges {...props} /> },
 { id: "tube-explorer-revenue-waterfall", title: "Revenue Cohort Area", render: (props) => <TubeExplorerRevenueWaterfall {...props} /> },
 { id: "tube-explorer-conversion-funnel", title: "Conversion Funnel", render: (props) => <TubeExplorerConversionFunnel {...props} /> },
 { id: "tube-explorer-upload-heatmap", title: "Upload Heatmap", render: (props) => <TubeExplorerUploadHeatmap {...props} /> },
 { id: "tube-explorer-ecg-vitals-monitor", title: "Watch by Upload Cohort", render: (props) => <TubeExplorerECGVitalsMonitor {...props} /> },
 { id: "tube-explorer-chrono-spiral", title: "Chrono Spiral", render: (props) => <TubeExplorerChronoSpiral {...props} /> },
 { id: "tube-explorer-content-dna-gel", title: "Content DNA Gel", render: (props) => <TubeExplorerContentDNAGel {...props} /> },
 { id: "tube-explorer-performance-waveform", title: "Views by Upload Cohort", render: (props) => <TubeExplorerPerformanceWaveform {...props} /> },
 { id: "tube-explorer-orbital-system", title: "Orbital System", render: (props) => <TubeExplorerOrbitalSystem {...props} /> },
 { id: "tube-explorer-lissajous-web", title: "Lissajous Web", render: (props) => <TubeExplorerLissajousWeb {...props} /> },
 { id: "tube-explorer-keyword-venn-chart", title: "Keyword Overlap Blocks", render: (props) => <TubeExplorerKeywordVennChart {...props} /> },
 { id: "tube-explorer-thermal-heatmap-grid", title: "Thermal Heatmap Grid", render: (props) => <TubeExplorerThermalHeatmapGrid {...props} /> },
 { id: "tube-explorer-emission-spectrum", title: "Emission Spectrum", render: (props) => <TubeExplorerEmissionSpectrum {...props} /> },
 { id: "tube-explorer-stalactite-drip", title: "Stalactite Drip", render: (props) => <TubeExplorerStalactiteDrip {...props} /> },
 { id: "tube-explorer-contour-density-map", title: "Retention Scatter", render: (props) => <TubeExplorerContourDensityMap {...props} /> },
 { id: "tube-explorer-retention-mosaic", title: "Retention Mosaic", render: (props) => <TubeExplorerRetentionMosaic {...props} /> },
 { id: "tube-explorer-perfection-quadrant", title: "Perfection Quadrant", render: (props) => <TubeExplorerPerfectionQuadrant {...props} /> },
 { id: "tube-explorer-duration-retention-scatter", title: "Duration Retention Scatter", render: (props) => <TubeExplorerDurationRetentionScatter {...props} /> },
 { id: "tube-explorer-beeswarm-like-rate", title: "Beeswarm Like Rate", render: (props) => <TubeExplorerBeeswarmLikeRate {...props} /> },
 { id: "tube-explorer-calendar-heat-signature", title: "Calendar Heat Signature", render: (props) => <TubeExplorerCalendarHeatSignature {...props} /> },
 { id: "tube-explorer-us-state-dot-map", title: "Region Ranking", render: (props) => <TubeExplorerUSStateDotMap {...props} /> },
]
