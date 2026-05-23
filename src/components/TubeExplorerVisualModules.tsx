import React, { useMemo, useState } from "react"
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
import {
 buildTubeExplorerVisualData,
 type TubeExplorerVisualDataset,
 type TubeExplorerVideoPoint,
} from "./tubeExplorerVisualData"

export interface TubeExplorerVisualProps {
 data: CanonicalVideoRow[]
 csvFiles?: CsvFileWithTag[]
}

export interface TubeExplorerVisualModuleEntry {
 id: string
 title: string
 render: (props: TubeExplorerVisualProps) => React.ReactNode
}

const COLORS = ["#FF7497", "#00CCFF", "#CCFF00", "#FFB158", "#B14AED", "#42FF68", "#FFE35A", "#FF4FCE"]
const EXPLORER_BG = "#0a0a1a"
const EXPLORER_SURFACE = "#0b0b12"
const EXPLORER_GRID = "rgba(255,255,255,0.08)"
const TRAFFIC_COLORS = ["#FF83EA", "#FF8AAF", "#FFB570", "#FFFF61", "#4FFF5B", "#40C6E9", "#579AFF", "#B14AED"]

const compact = (value: number): string => {
 if (!Number.isFinite(value)) return "0"
 const abs = Math.abs(value)
 if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
 if (abs >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`
 return Math.round(value).toLocaleString()
}

const useExplorerData = (props: TubeExplorerVisualProps): TubeExplorerVisualDataset =>
 useMemo(
  () => buildTubeExplorerVisualData(props.data, props.csvFiles || []),
  [props.data, props.csvFiles],
 )

const ModuleFrame: React.FC<{
 title: string
 subtitle: string
 count: number | string
 icon?: string
 color?: string
 badges?: { label: string; tone?: "pink" | "cyan" | "lime" | "yellow" | "purple" | "orange" | "white" }[]
 insight?: string
 height?: number
 flushShell?: boolean
 children: React.ReactNode
}> = ({ title, subtitle, count, icon = "analytics", color = "#C9FF18", badges = [], insight, height = 320, flushShell = false, children }) => (
 <SubToolboxChartModule
  header={{
   title,
   subtitle,
   icon: <CustomIcon name={icon as any} size={34} />,
  }}
  controlBox={{ count, countLabel: "ROWS", countUnit: "REAL" }}
  layout={{ chartHeight: height }}
  theme={{ headerBandBg: color, iconBlockBg: "#20D4F7" }}
  metricBadges={badges}
  footer={insight ? <span className="font-black uppercase tracking-[0.08em]">{insight}</span> : undefined}
 >
  <div
   className={flushShell ? "mx-auto h-full w-full max-w-[1080px]" : "mx-auto w-full max-w-[1080px] border-[3px] border-black bg-white p-2"}
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
 children: React.ReactNode
}> = ({ legend, footerLeft, footerRight, legendWidthClassName = "w-[210px]" , children }) => (
 <div className="flex h-full flex-col overflow-hidden border-[3px] border-black bg-[#f4f1eb]">
  <div className={`flex min-h-0 flex-1 items-stretch gap-0 bg-[#0a0a1a] p-3 ${footerLeft || footerRight ? "border-b-[3px] border-black" : ""}`}>
   <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
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

const topVideos = (dataset: TubeExplorerVisualDataset, metric: keyof TubeExplorerVideoPoint = "views", limit = 18) =>
 [...dataset.videos].sort((a, b) => Number(b[metric]) - Number(a[metric])).slice(0, limit)

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
   <XAxis dataKey={x as string} name={String(x)} tickFormatter={compact} tick={{ fontSize: 10, fontWeight: 900 }} />
   <YAxis dataKey={y as string} name={String(y)} tickFormatter={compact} tick={{ fontSize: 10, fontWeight: 900 }} />
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
 const rows = dataset.geography.slice(0, 16)
 if (rows.length === 0) return <Empty label="Import geography/cities CSV data to populate this module" />
 return <VideoBars rows={rows.map((row, index) => ({ ...topVideos(dataset)[0], videoId: String(index + 1), title: row.label, views: row.views, watchHours: row.watchHours, subscribersGained: row.subscribersGained, revenue: row.revenue } as TubeExplorerVideoPoint))} metric="views" color="#B14AED" />
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

const isAggregateTrafficLabel = (label: string): boolean => {
 const normalized = label.trim().toLowerCase()
 return normalized === "total" || normalized === "totals" || normalized === "overall total"
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
 x: number
 y: number
}

type WordEdge = {
 source: number
 target: number
 weight: number
}

const buildWordNetwork = (videos: TubeExplorerVideoPoint[]) => {
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
  .slice(0, 38)
  .map(([id, totalViews]) => ({ id, totalViews, videoCount: wordVideos[id] || 0 }))

 const indexByWord = new Map(topWords.map((word, index) => [word.id, index]))
 const edges: WordEdge[] = []
 for (const [key, count] of coOccurrence.entries()) {
  const [a, b] = key.split(":::")
  const source = indexByWord.get(a)
  const target = indexByWord.get(b)
  if (source === undefined || target === undefined) continue
  edges.push({ source, target, weight: Math.sqrt(count) })
 }

 const width = 860
 const height = 340
 const nodes: WordNode[] = topWords.map((word, index) => {
  const angle = (index / Math.max(topWords.length, 1)) * Math.PI * 2
  const radius = 90 + (index % 6) * 18
  return {
   ...word,
   x: width / 2 + Math.cos(angle) * radius,
   y: height / 2 + Math.sin(angle) * radius,
  }
 })

 for (let iteration = 0; iteration < 140; iteration += 1) {
  for (let a = 0; a < nodes.length; a += 1) {
   let fx = 0
   let fy = 0
   for (let b = 0; b < nodes.length; b += 1) {
    if (a === b) continue
    const dx = nodes[a].x - nodes[b].x
    const dy = nodes[a].y - nodes[b].y
    const distSq = Math.max(dx * dx + dy * dy, 36)
    fx += (dx / distSq) * 180
    fy += (dy / distSq) * 180
   }
   for (const edge of edges) {
    if (edge.source !== a && edge.target !== a) continue
    const other = edge.source === a ? nodes[edge.target] : nodes[edge.source]
    const dx = other.x - nodes[a].x
    const dy = other.y - nodes[a].y
    fx += dx * 0.0015 * edge.weight
    fy += dy * 0.0015 * edge.weight
   }
   fx += (width / 2 - nodes[a].x) * 0.002
   fy += (height / 2 - nodes[a].y) * 0.002
   nodes[a].x = Math.min(width - 24, Math.max(24, nodes[a].x + fx))
   nodes[a].y = Math.min(height - 24, Math.max(24, nodes[a].y + fy))
  }
 }

 return { nodes, edges }
}

const ClockRadialBurstRenderer: React.FC<{ dataset: TubeExplorerVisualDataset }> = ({ dataset }) => {
 const [hovered, setHovered] = useState<string | null>(null)
 const slices = useMemo(() => {
  const rows = dataset.traffic
   .filter(
    (row) =>
     row.views > 0 &&
     !isAggregateTrafficLabel(row.sourceTitle) &&
     !isAggregateTrafficLabel(row.sourceType) &&
     !isAggregateTrafficLabel(row.sourceDetail),
   )
   .slice(0, 8)
  const totalViews = rows.reduce((sum, row) => sum + row.views, 0) || 1
  let angle = -Math.PI / 2
  return rows.map((row, index) => {
   const fraction = row.views / totalViews
   const startAngle = angle
   const endAngle = angle + fraction * Math.PI * 2
   angle = endAngle
   return {
    ...row,
    label: formatTrafficLabel(row.sourceTitle || row.sourceType),
    fraction,
    startAngle,
    endAngle,
    color: TRAFFIC_COLORS[index % TRAFFIC_COLORS.length],
   }
  })
 }, [dataset.traffic])

 if (slices.length === 0) return <Empty label="Sync or import traffic source rows to render the clock distribution." />

 const width = 500
 const height = 280
 const cx = 210
 const cy = 140
 const innerRadius = 52
 const outerRadius = 118
 const current = slices.find((slice) => slice.label === hovered) || null

 return (
  <div className="flex h-full flex-col overflow-hidden border-[0px] border-black bg-[#f4f1eb]">
   <div className="flex min-h-0 flex-1 items-stretch gap-0 bg-[#0a0a1a] p-2">
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full max-h-[500px] w-full max-w-[500px]" style={{ background: EXPLORER_BG }}>
     {[0.33, 0.66, 1].map((factor) => (
      <circle key={factor} cx={cx} cy={cy} r={innerRadius + (outerRadius - innerRadius) * factor} fill="none" stroke={EXPLORER_GRID} strokeWidth="1" strokeDasharray="3 5" />
     ))}
     {Array.from({ length: 12 }, (_, index) => {
      const angle = (index / 12) * Math.PI * 2 - Math.PI / 2
      const p1 = polar(cx, cy, angle, outerRadius + 8)
      const p2 = polar(cx, cy, angle, outerRadius + 16)
      return <line key={index} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#2e3240" strokeWidth={index % 3 === 0 ? 2 : 1} />
     })}
     {slices.map((slice) => {
      const isHovered = hovered === slice.label
      const path = ringArcPath(cx, cy, slice.startAngle + 0.02, slice.endAngle - 0.02, innerRadius, outerRadius + (isHovered ? 10 : 0))
      const mid = (slice.startAngle + slice.endAngle) / 2
      const labelPoint = polar(cx, cy, mid, outerRadius + 30)
      return (
       <g
        key={slice.label}
        onMouseEnter={() => setHovered(slice.label)}
        onMouseLeave={() => setHovered(null)}
        style={{ cursor: "pointer" }}>
        <path d={path} fill={slice.color} stroke={isHovered ? "#ffffff" : slice.color} strokeWidth={isHovered ? 2 : 0.75} opacity={isHovered ? 1 : 0.9} />
        {slice.fraction > 0.05 ? (
         <>
          <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" style={{ fill: slice.color, fontSize: 9, fontFamily: "monospace", fontWeight: 900 }}>
           {slice.label.slice(0, 11)}
          </text>
          <text x={labelPoint.x} y={labelPoint.y + 12} textAnchor="middle" style={{ fill: "#98a0c2", fontSize: 7, fontFamily: "monospace" }}>
           {(slice.fraction * 100).toFixed(0)}%
          </text>
         </>
        ) : null}
       </g>
      )
     })}
     <circle cx={cx} cy={cy} r={innerRadius - 6} fill={EXPLORER_SURFACE} stroke="#22283a" strokeWidth="2" />
     <text x={cx} y={cy - 12} textAnchor="middle" style={{ fill: "#a5abc7", fontSize: 8, fontFamily: "monospace", fontWeight: 900 }}>
      {current ? compact(current.views) : "VIEWS"}
     </text>
     <text x={cx} y={cy + 4} textAnchor="middle" style={{ fill: "#ffffff", fontSize: 10, fontFamily: "monospace", fontWeight: 900 }}>
      {current ? current.label : "TRAFFIC"}
     </text>
     <text x={cx} y={cy + 18} textAnchor="middle" style={{ fill: "#6f7899", fontSize: 8, fontFamily: "monospace" }}>
      CLOCK
     </text>
    </svg>
    <div className="space-y-3 pt-2">
     {slices.map((slice) => (
      <div key={slice.label} className="flex items-start gap-3 text-white/90">
       <span className="mt-1 h-3 w-3 shrink-0" style={{ background: slice.color }} />
       <div className="min-w-0">
        <div className="truncate text-[11px] font-black uppercase tracking-[0.08em]">{slice.label}</div>
        <div className="text-[10px] font-mono text-white/55">{compact(slice.views)} views • {(slice.fraction * 100).toFixed(1)}%</div>
       </div>
      </div>
     ))}
    </div>
   </div>
  </div>
 )
}

const SankeyRiverDeltaRenderer: React.FC<{ dataset: TubeExplorerVisualDataset }> = ({ dataset }) => {
 const [hovered, setHovered] = useState<string | null>(null)
 const model = useMemo(() => {
  const sourceRows = dataset.traffic.filter((row) => row.views > 0).slice(0, 6)
  const geoRows = dataset.geography.filter((row) => row.views > 100).slice(0, 7)
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

  sourceNodes.forEach((source) => {
   const sourceFraction = source.views / totalSourceViews
   let cursor = source.x
   destNodes.forEach((dest) => {
    const flowViews = sourceFraction * dest.views
    const flowWidth = Math.max(0.8, (flowViews / totalGeoViews) * usableWidth * 0.82)
    flows.push({
     srcX: cursor,
     srcW: flowWidth,
     dstX: dest.x + (dest.w * (source.x - pad)) / usableWidth,
     dstW: flowWidth,
     color: source.color,
     srcLabel: source.label,
     dstLabel: dest.label,
     views: flowViews,
    })
    cursor += flowWidth
   })
  })

  return { sourceNodes, destNodes, flows }
 }, [dataset.geography, dataset.traffic])

 if (!model) return <Empty label="Traffic source rows and geography rows are both required for the river delta." />

 const width = 900
 const height = 320
 const sourceY = 28
 const destY = height - 28
 const barHeight = 16
 const controlY = height / 2

 return (
  <ExplorerCanvas
   footerLeft={
    <>
     <InsightBadge label="Personal Insight" />
     <span className="text-[11px] font-medium leading-5 text-white/85">
      Stream width maps view volume from traffic sources into top geography rows. The internal SVG owns its own geometry so outer chart defaults cannot flatten it into bars.
     </span>
    </>
   }
   footerRight={
    <>
     <InsightBadge label="Action" tone="#00ccff" />
     <span className="text-[11px] font-medium leading-5 text-white/85">
      The widest river marks the traffic-to-geography path with the most leverage.
     </span>
    </>
   }>
   <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" style={{ background: "#0a0a0f" }}>
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
      <rect x={node.x} y={sourceY} width={node.w} height={barHeight} fill={node.color} stroke="#000" strokeWidth={hovered === node.label ? 2 : 1} opacity={hovered === node.label ? 1 : 0.88} />
      {node.w > 52 ? (
       <text x={node.x + node.w / 2} y={sourceY + 11} textAnchor="middle" style={{ fill: "#000", fontSize: 7, fontFamily: "monospace", fontWeight: 900 }}>
        {node.label.slice(0, 12)}
       </text>
      ) : null}
     </g>
    ))}
    {model.destNodes.map((node) => (
     <g key={node.label}>
      <rect x={node.x} y={destY - barHeight} width={node.w} height={barHeight} fill={node.color} stroke="#000" strokeWidth="1" opacity="0.9" />
      {node.w > 28 ? (
       <text x={node.x + node.w / 2} y={destY - 5} textAnchor="middle" style={{ fill: "#000", fontSize: 7, fontFamily: "monospace", fontWeight: 900 }}>
        {node.label.slice(0, 10)}
       </text>
      ) : null}
     </g>
    ))}
    <text x="40" y={sourceY - 8} style={{ fill: "#6c738f", fontSize: 8, fontFamily: "monospace", fontWeight: 900 }}>
     ← TRAFFIC SOURCES
    </text>
    <text x="40" y={destY + 14} style={{ fill: "#6c738f", fontSize: 8, fontFamily: "monospace", fontWeight: 900 }}>
     ← TOP GEOGRAPHY
    </text>
   </svg>
  </ExplorerCanvas>
 )
}

const TitleWordNetworkRenderer: React.FC<{ dataset: TubeExplorerVisualDataset }> = ({ dataset }) => {
 const [hovered, setHovered] = useState<string | null>(null)
 const graph = useMemo(() => buildWordNetwork(dataset.videos.filter((video) => video.views > 0)), [dataset.videos])
 if (graph.nodes.length === 0) return <Empty label="Need multiple video titles with real views to build the title word network." />
 const maxViews = Math.max(...graph.nodes.map((node) => node.totalViews), 1)
 const width = 860
 const height = 340
 return (
  <ExplorerCanvas
   footerLeft={
    <>
     <InsightBadge label="Personal Insight" />
     <span className="text-[11px] font-medium leading-5 text-white/85">
      Words that frequently appear together are pulled into clusters. Node size represents the total view volume associated with titles containing that word.
     </span>
    </>
   }>
   <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" style={{ background: "#050810" }}>
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
        stroke={isHovered ? "#00ccff" : "#ffffff"}
        strokeWidth={isHovered ? 1.5 : 0.4}
        opacity={isHovered ? 0.62 : 0.1}
       />
      )
     })}
    {graph.nodes.map((node, index) => {
     const radius = 5 + (node.totalViews / maxViews) * 20
     const color = TRAFFIC_COLORS[index % TRAFFIC_COLORS.length]
     const isHovered = hovered === node.id
     return (
      <g
       key={node.id}
       onMouseEnter={() => setHovered(node.id)}
       onMouseLeave={() => setHovered(null)}
       style={{ cursor: "pointer" }}>
       <circle cx={node.x} cy={node.y} r={radius * 2} fill={color} opacity="0.08" filter="url(#node-glow)" />
       <circle cx={node.x} cy={node.y} r={isHovered ? radius * 1.35 : radius} fill={color} stroke={isHovered ? "#ffffff" : "rgba(0,0,0,0.35)"} strokeWidth={isHovered ? 2 : 1} opacity="0.92" />
       <text
        x={node.x}
        y={node.y - radius - 5}
        textAnchor="middle"
        style={{
         fill: isHovered ? "#ffffff" : color,
         fontSize: Math.max(7, Math.min(11, radius * 0.7)),
         fontWeight: 900,
         fontFamily: "monospace",
         opacity: isHovered ? 1 : 0.88,
        }}>
        {node.id}
       </text>
      </g>
     )
    })}
   </svg>
  </ExplorerCanvas>
 )
}

const createModule = (
 title: string,
 subtitle: string,
 render: (dataset: TubeExplorerVisualDataset) => React.ReactNode,
 options: { color?: string; icon?: string; badges?: { label: string; tone?: any }[]; insight?: string; height?: number; flushShell?: boolean } = {},
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
   insight={options.insight}
   height={options.height}
   flushShell={options.flushShell}
  >
   {render(dataset)}
  </ModuleFrame>
 )
}

export const TubeExplorerKeywordTreemap = createModule("KEYWORD TREEMAP", "TITLE TOKENS + SEARCH CSV", (d) => <KeywordBlocks dataset={d} />, { color: "#CCFF00", badges: [{ label: "KEYWORDS", tone: "lime" }] })
export const TubeExplorerChannelHealthRadar = createModule("CHANNEL HEALTH RADAR", "REAL METRIC BALANCE", (d) => {
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
export const TubeExplorerRevenueForecast = createModule("REVENUE FORECAST", "MONTHLY REVENUE TRAJECTORY", (d) => <MonthlyArea dataset={d} a="revenue" b="views" />, { color: "#FF7497" })
export const TubeExplorerTrafficEvolution = createModule("TRAFFIC EVOLUTION", "CSV/API TRAFFIC SOURCES", (d) => <TrafficBars dataset={d} />, { color: "#00CCFF" })
export const TubeExplorerVideoValueMatrix = createModule("VIDEO VALUE MATRIX", "VIEWS VS REVENUE", (d) => <VideoScatter rows={topVideos(d, "valueScore", 80)} x="views" y="revenue" />, { color: "#CCFF00" })
export const TubeExplorerSubNetFlow = createModule("SUB NET FLOW", "SUBSCRIBER GAIN/LOSS", (d) => <VideoBars rows={topVideos(d, "subscribersGained")} metric="subscribersGained" color="#CCFF00" />, { color: "#FFEA00" })
export const TubeExplorerContentDonut = createModule("CONTENT DONUT", "FORMAT SPLIT", (d) => <Donut rows={[{ name: "Shorts", value: d.shorts.length }, { name: "Long", value: d.longform.length }, { name: "Other", value: d.videos.length - d.shorts.length - d.longform.length }]} />, { color: "#FFB158" })
export const TubeExplorerPerformanceGauges = createModule("PERFORMANCE GAUGES", "TOP CORE METRIC BARS", (d) => <VideoBars rows={topVideos(d, "views", 12)} metric="views" color="#00CCFF" />, { color: "#B14AED" })
export const TubeExplorerRevenueWaterfall = createModule("REVENUE WATERFALL", "MONTHLY REVENUE STEPS", (d) => <MonthlyArea dataset={d} a="revenue" b="watchHours" />, { color: "#42FF68" })
export const TubeExplorerConversionFunnel = createModule("CONVERSION FUNNEL", "IMPRESSIONS TO SUBS", (d) => <Donut rows={[{ name: "Impressions", value: d.totals.impressions }, { name: "Views", value: d.totals.views }, { name: "Engaged", value: d.totals.engagedViews }, { name: "Subs", value: d.totals.subscribersGained }]} />, { color: "#00CCFF" })
export const TubeExplorerUploadHeatmap = createModule("UPLOAD HEATMAP", "UPLOAD DAY VIEW DENSITY", (d) => <HeatGrid cells={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => ({ label, value: d.videos.filter((v) => v.dayKey === label).reduce((sum, v) => sum + v.views, 0) }))} empty="No dated rows available" />, { color: "#FF7497" })

export const TubeExplorerECGVitalsMonitor = createModule("ECG VITALS", "MONTHLY WATCH SIGNAL", (d) => <MonthlyArea dataset={d} a="watchHours" b="engagement" />, { color: "#FF7497" })
export const TubeExplorerChronoSpiral = createModule("CHRONO SPIRAL", "DATED VIDEO ORBITS", (d) => <SvgRadial rows={topVideos(d, "views", 32)} metric="views" />, { color: "#CCFF00" })
export const TubeExplorerContentDNAGel = createModule("CONTENT DNA GEL", "KEYWORD INTENSITY STRIPS", (d) => <KeywordBlocks dataset={d} />, { color: "#B14AED" })
export const TubeExplorerPerformanceWaveform = createModule("PERFORMANCE WAVEFORM", "MONTHLY VIEWS WAVE", (d) => <MonthlyArea dataset={d} a="views" b="engagement" />, { color: "#00CCFF" })
export const TubeExplorerOrbitalSystem = createModule("ORBITAL SYSTEM", "VALUE SCORE ORBITS", (d) => <SvgRadial rows={topVideos(d, "valueScore", 34)} metric="valueScore" />, { color: "#FFB158" })
export const TubeExplorerLissajousWeb = createModule("LISSAJOUS WEB", "RETENTION VS ENGAGEMENT", (d) => <VideoScatter rows={topVideos(d, "views", 90)} x="retentionScore" y="engagementRate" />, { color: "#42FF68" })
export const TubeExplorerKeywordVennChart = createModule("KEYWORD VENN", "OVERLAPPING TITLE TERMS", (d) => <KeywordBlocks dataset={d} />, { color: "#FFE35A" })

export const TubeExplorerBarcodeFingerprint = createModule("BARCODE FINGERPRINT", "VIDEO VALUE BARS", (d) => <VideoBars rows={topVideos(d, "valueScore", 28)} metric="valueScore" color="#000" />, { color: "#CCFF00" })
export const TubeExplorerThermalHeatmapGrid = createModule("THERMAL HEATMAP", "MONTHLY VIEW HEAT", (d) => <HeatGrid cells={d.monthly.map((m) => ({ label: m.month, value: m.views }))} empty="No monthly rows available" />, { color: "#FF7497" })
export const TubeExplorerEmissionSpectrum = createModule("EMISSION SPECTRUM", "GEOGRAPHY SPECTRUM", (d) => <GeoBars dataset={d} />, { color: "#B14AED" })
export const TubeExplorerStalactiteDrip = createModule("STALACTITE DRIP", "WATCH HOURS DROP LINES", (d) => <VideoBars rows={topVideos(d, "watchHours", 22)} metric="watchHours" color="#00CCFF" />, { color: "#00CCFF" })
export const TubeExplorerSankeyRiverDelta = createModule("SANKEY RIVER DELTA", "TRAFFIC SOURCE RIVER", (d) => <SankeyRiverDeltaRenderer dataset={d} />, { color: "#42FF68", height: 420 })
export const TubeExplorerContourDensityMap = createModule("CONTOUR DENSITY", "VIEWS VS RETENTION", (d) => <VideoScatter rows={topVideos(d, "views", 120)} x="views" y="retentionScore" />, { color: "#FFB158" })
export const TubeExplorerClockRadialBurst = createModule("CLOCK RADIAL BURST", "UPLOAD DAY BURST", (d) => <ClockRadialBurstRenderer dataset={d} />, { color: "#FFE35A", height: 400, flushShell: true })
export const TubeExplorerRetentionMosaic = createModule("RETENTION MOSAIC", "AVP/STW TILE MAP", (d) => <HeatGrid cells={topVideos(d, "retentionScore", 28).map((v) => ({ label: v.videoId.slice(0, 5), value: v.retentionScore }))} empty="No retention metrics available" />, { color: "#FF7497" })

export const TubeExplorerPerfectionQuadrant = createModule("PERFECTION QUADRANT", "RETENTION VS REVENUE", (d) => <VideoScatter rows={topVideos(d, "valueScore", 90)} x="retentionScore" y="revenue" />, { color: "#CCFF00" })
export const TubeExplorerSubscriberWaterfall = createModule("SUBSCRIBER WATERFALL", "MONTHLY SUB GAINS", (d) => <MonthlyArea dataset={d} a="subscribersGained" b="videos" />, { color: "#00CCFF" })
export const TubeExplorerDurationRetentionScatter = createModule("DURATION RETENTION", "LENGTH VS RETENTION", (d) => <VideoScatter rows={topVideos(d, "views", 120)} x="durationSec" y="retentionScore" />, { color: "#FFB158" })
export const TubeExplorerBeeswarmLikeRate = createModule("BEESWARM LIKE RATE", "LIKE RATE CLUSTERS", (d) => <VideoScatter rows={topVideos(d, "likes", 120)} x="views" y="likeRate" />, { color: "#B14AED" })
export const TubeExplorerCalendarHeatSignature = createModule("CALENDAR HEAT", "MONTHLY UPLOAD SIGNATURE", (d) => <HeatGrid cells={d.monthly.map((m) => ({ label: m.month, value: m.videos }))} empty="No monthly upload rows available" />, { color: "#42FF68" })
export const TubeExplorerSearchBubbleUniverse = createModule("SEARCH BUBBLE", "SEARCH KEYWORD UNIVERSE", (d) => <KeywordBlocks dataset={d} />, { color: "#00CCFF" })
export const TubeExplorerUSStateDotMap = createModule("US STATE DOT MAP", "STATE/CITY GEO DOTS", (d) => <GeoBars dataset={d} />, { color: "#FF7497" })
export const TubeExplorerTitleWordNetwork = createModule("TITLE WORD NETWORK", "TITLE TOKEN NETWORK", (d) => <TitleWordNetworkRenderer dataset={d} />, { color: "#CCFF00", height: 420 })

export const TUBE_EXPLORER_VISUAL_MODULES: TubeExplorerVisualModuleEntry[] = [
 { id: "tube-explorer-keyword-treemap", title: "Keyword Treemap", render: (props) => <TubeExplorerKeywordTreemap {...props} /> },
 { id: "tube-explorer-channel-health-radar", title: "Channel Health Radar", render: (props) => <TubeExplorerChannelHealthRadar {...props} /> },
 { id: "tube-explorer-revenue-forecast", title: "Revenue Forecast", render: (props) => <TubeExplorerRevenueForecast {...props} /> },
 { id: "tube-explorer-traffic-evolution", title: "Traffic Evolution", render: (props) => <TubeExplorerTrafficEvolution {...props} /> },
 { id: "tube-explorer-video-value-matrix", title: "Video Value Matrix", render: (props) => <TubeExplorerVideoValueMatrix {...props} /> },
 { id: "tube-explorer-sub-net-flow", title: "Sub Net Flow", render: (props) => <TubeExplorerSubNetFlow {...props} /> },
 { id: "tube-explorer-content-donut", title: "Content Donut", render: (props) => <TubeExplorerContentDonut {...props} /> },
 { id: "tube-explorer-performance-gauges", title: "Performance Gauges", render: (props) => <TubeExplorerPerformanceGauges {...props} /> },
 { id: "tube-explorer-revenue-waterfall", title: "Revenue Waterfall", render: (props) => <TubeExplorerRevenueWaterfall {...props} /> },
 { id: "tube-explorer-conversion-funnel", title: "Conversion Funnel", render: (props) => <TubeExplorerConversionFunnel {...props} /> },
 { id: "tube-explorer-upload-heatmap", title: "Upload Heatmap", render: (props) => <TubeExplorerUploadHeatmap {...props} /> },
 { id: "tube-explorer-ecg-vitals-monitor", title: "ECG Vitals Monitor", render: (props) => <TubeExplorerECGVitalsMonitor {...props} /> },
 { id: "tube-explorer-chrono-spiral", title: "Chrono Spiral", render: (props) => <TubeExplorerChronoSpiral {...props} /> },
 { id: "tube-explorer-content-dna-gel", title: "Content DNA Gel", render: (props) => <TubeExplorerContentDNAGel {...props} /> },
 { id: "tube-explorer-performance-waveform", title: "Performance Waveform", render: (props) => <TubeExplorerPerformanceWaveform {...props} /> },
 { id: "tube-explorer-orbital-system", title: "Orbital System", render: (props) => <TubeExplorerOrbitalSystem {...props} /> },
 { id: "tube-explorer-lissajous-web", title: "Lissajous Web", render: (props) => <TubeExplorerLissajousWeb {...props} /> },
 { id: "tube-explorer-keyword-venn-chart", title: "Keyword Venn Chart", render: (props) => <TubeExplorerKeywordVennChart {...props} /> },
 { id: "tube-explorer-barcode-fingerprint", title: "Barcode Fingerprint", render: (props) => <TubeExplorerBarcodeFingerprint {...props} /> },
 { id: "tube-explorer-thermal-heatmap-grid", title: "Thermal Heatmap Grid", render: (props) => <TubeExplorerThermalHeatmapGrid {...props} /> },
 { id: "tube-explorer-emission-spectrum", title: "Emission Spectrum", render: (props) => <TubeExplorerEmissionSpectrum {...props} /> },
 { id: "tube-explorer-stalactite-drip", title: "Stalactite Drip", render: (props) => <TubeExplorerStalactiteDrip {...props} /> },
 { id: "tube-explorer-sankey-river-delta", title: "Sankey River Delta", render: (props) => <TubeExplorerSankeyRiverDelta {...props} /> },
 { id: "tube-explorer-contour-density-map", title: "Contour Density Map", render: (props) => <TubeExplorerContourDensityMap {...props} /> },
 { id: "tube-explorer-clock-radial-burst", title: "Clock Radial Burst", render: (props) => <TubeExplorerClockRadialBurst {...props} /> },
 { id: "tube-explorer-retention-mosaic", title: "Retention Mosaic", render: (props) => <TubeExplorerRetentionMosaic {...props} /> },
 { id: "tube-explorer-perfection-quadrant", title: "Perfection Quadrant", render: (props) => <TubeExplorerPerfectionQuadrant {...props} /> },
 { id: "tube-explorer-subscriber-waterfall", title: "Subscriber Waterfall", render: (props) => <TubeExplorerSubscriberWaterfall {...props} /> },
 { id: "tube-explorer-duration-retention-scatter", title: "Duration Retention Scatter", render: (props) => <TubeExplorerDurationRetentionScatter {...props} /> },
 { id: "tube-explorer-beeswarm-like-rate", title: "Beeswarm Like Rate", render: (props) => <TubeExplorerBeeswarmLikeRate {...props} /> },
 { id: "tube-explorer-calendar-heat-signature", title: "Calendar Heat Signature", render: (props) => <TubeExplorerCalendarHeatSignature {...props} /> },
 { id: "tube-explorer-search-bubble-universe", title: "Search Bubble Universe", render: (props) => <TubeExplorerSearchBubbleUniverse {...props} /> },
 { id: "tube-explorer-us-state-dot-map", title: "US State Dot Map", render: (props) => <TubeExplorerUSStateDotMap {...props} /> },
 { id: "tube-explorer-title-word-network", title: "Title Word Network", render: (props) => <TubeExplorerTitleWordNetwork {...props} /> },
]
