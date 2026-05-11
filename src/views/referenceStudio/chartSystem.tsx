import React from "react"
import {
 LineChart,
 Line,
 AreaChart,
 Area,
 BarChart,
 Bar,
 ScatterChart,
 Scatter,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 PieChart,
 Pie,
 Cell,
 ComposedChart,
 Treemap,
} from "recharts"
import type { CanonicalAnalyticsView } from "./useCanonicalAnalytics"
import { StableChartFrame } from "../../components/StableChartFrame"

export type ChartCardSize = "full" | "half" | "third"

export type ChartClassKey =
 | "annotation"
 | "area"
 | "bar"
 | "bubble"
 | "calendar"
 | "candlestick"
 | "column"
 | "combo"
 | "diff"
 | "donut"
 | "gantt"
 | "gauge"
 | "geo"
 | "histogram"
 | "intervals"
 | "line"
 | "maps"
 | "org"
 | "pie"
 | "sankey"
 | "scatter"
 | "steppedArea"
 | "table"
 | "timelines"
 | "treemap"
 | "trendlines"
 | "vega"
 | "waterfall"
 | "wordtree"

export type ChartRendererKey = ChartClassKey

export interface ChartCardDefinition {
 key: ChartClassKey
 title: string
 size: ChartCardSize
 renderer: ChartRendererKey
 note?: string
}

export interface ChartVariantDefinition {
 id: string
 label: string
 base: ChartClassKey
 renderer: ChartRendererKey
 size: ChartCardSize
 readiness: "exploratory" | "candidate" | "canonical"
}

const SOLID_GRID = "#d1d5db"
const AXIS = "#6b7280"
const TOOLTIP_STYLE = {
 border: "2px solid #000",
 borderRadius: "8px",
 background: "#fff",
 color: "#000",
 fontWeight: 800,
}

const COLORS = ["#24D3FF", "#CCFF00", "#FFE357", "#FFB158", "#FF7497", "#B14AED"]

const SafeResponsiveContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 return <StableChartFrame minHeightClassName="min-h-[240px]">{children}</StableChartFrame>
}

type ChartRenderContext = {
 timeline: Array<{
  date: string
  views: number
  watchHours: number
  revenue: number
  subscribers: number
  likes?: number
  dislikes?: number
  comments?: number
  shares?: number
  impressions?: number
  ctr?: number
 }>
 topRows: CanonicalAnalyticsView["topRows"]
 formatBreakdown: CanonicalAnalyticsView["formatBreakdown"]
 summary: CanonicalAnalyticsView["summary"]
 topByViews: Array<{ name: string; views: number; revenue: number; ctr: number; watchHours: number }>
 scatter: Array<{ views: number; ctr: number; revenue: number }>
 histogram: Array<{ bucket: string; count: number }>
 intervals: Array<{ name: string; low: number; high: number }>
 waterfall: Array<{ name: string; delta: number; cumulative: number }>
 tableRows: Array<{ title: string; views: number; watchHours: number; revenue: number }>
}

type ChartRenderer = (ctx: ChartRenderContext) => React.ReactNode

const compactTitle = (value: string) => (value.length > 22 ? `${value.slice(0, 22)}…` : value)

const safeContext = (analytics: CanonicalAnalyticsView): ChartRenderContext => {
 const timeline =
  analytics.channelDailySeries.length > 0
   ? analytics.channelDailySeries
   : analytics.timelineSeries.length > 0
     ? analytics.timelineSeries
     : [{ date: "N/A", views: 0, watchHours: 0, revenue: 0, subscribers: 0 }]

 const topRows: CanonicalAnalyticsView["topRows"] =
  analytics.topRows.length > 0
   ? analytics.topRows
   : [
      {
       id: "none",
       title: "No Data",
       format: "unknown",
       views: 0,
       likes: 0,
       comments: 0,
       shares: 0,
       watchHours: 0,
       subscribers: 0,
       revenue: 0,
       ctr: 0,
       avp: 0,
      },
     ]

 const topByViews = topRows.slice(0, 12).map((row) => ({
  name: compactTitle(row.title),
  views: Math.max(0, Math.round(row.views)),
  revenue: Number(row.revenue.toFixed(2)),
  ctr: Number(row.ctr.toFixed(2)),
  watchHours: Number(row.watchHours.toFixed(2)),
 }))

 const scatter = topRows.slice(0, 36).map((row) => ({
  views: Math.max(0, row.views),
  ctr: Math.max(0, row.ctr),
  revenue: Math.max(0, row.revenue),
 }))

 const histogramBuckets = [
  { label: "0-499", min: 0, max: 499 },
  { label: "500-999", min: 500, max: 999 },
  { label: "1k-2.9k", min: 1000, max: 2999 },
  { label: "3k-9.9k", min: 3000, max: 9999 },
  { label: "10k+", min: 10000, max: Number.POSITIVE_INFINITY },
 ]

 const histogram = histogramBuckets.map((bucket) => ({
  bucket: bucket.label,
  count: topRows.filter((row) => row.views >= bucket.min && row.views <= bucket.max).length,
 }))

 const intervals = topRows.slice(0, 8).map((row) => {
  const low = Math.max(0, Math.round(row.views * 0.55))
  const high = Math.max(low, Math.round(row.views * 1.05))
  return { name: compactTitle(row.title), low, high }
 })

 let running = 0
 const waterfall = timeline.slice(-8).map((row) => {
  const delta = Math.round(row.views - row.watchHours * 40)
  running += delta
  return { name: row.date.slice(5), delta, cumulative: running }
 })

 const tableRows = topRows.slice(0, 10).map((row) => ({
  title: compactTitle(row.title),
  views: row.views,
  watchHours: row.watchHours,
  revenue: row.revenue,
 }))

 return {
  timeline,
  topRows,
  formatBreakdown:
   analytics.formatBreakdown.length > 0 ? analytics.formatBreakdown : [{ name: "unknown", value: 1 }],
  summary: analytics.summary,
  topByViews,
  scatter,
  histogram,
  intervals,
  waterfall,
  tableRows,
 }
}

const grid = <CartesianGrid stroke={SOLID_GRID} strokeOpacity={0.72} vertical horizontal />

const GaugeRing: React.FC<{ label: string; value: number; tone: string }> = ({ label, value, tone }) => {
 const clamped = Math.max(0, Math.min(100, value))
 const degrees = Math.max(0, Math.min(360, (clamped / 100) * 360))
 return (
  <div className="w-[92px] h-[92px] border-[2px] border-black rounded-full bg-white relative flex items-center justify-center overflow-hidden">
   <div
    className="absolute inset-0"
    style={{
     background: `conic-gradient(from -90deg, ${tone} 0deg ${degrees.toFixed(2)}deg, #d1d5db ${degrees.toFixed(2)}deg 360deg)`,
    }}
   />
   <div className="absolute inset-[11px] rounded-full border-[2px] border-black bg-white" />
   <div className="text-center">
    <div className="text-[7px] font-black uppercase tracking-[0.12em]">{label}</div>
    <div className="text-[10px] font-black">{clamped.toFixed(1)}</div>
   </div>
  </div>
 )
}

const CalendarHeat: React.FC<{ timeline: ChartRenderContext["timeline"] }> = ({ timeline }) => {
 const vals = timeline.slice(-35)
 const max = Math.max(...vals.map((v) => v.views), 1)
 return (
  <div className="grid grid-cols-7 gap-1">
   {vals.map((row) => {
    const ratio = row.views / max
    const alpha = 0.15 + ratio * 0.85
    return (
     <div
      key={row.date}
      title={`${row.date}: ${row.views}`}
      className="h-6 border border-black/20 rounded-[4px]"
      style={{ backgroundColor: `rgba(36,211,255,${alpha.toFixed(3)})` }}
     />
    )
   })}
  </div>
 )
}

const GeoBoard: React.FC<{ topByViews: ChartRenderContext["topByViews"]; mode: "geo" | "maps" }> = ({ topByViews, mode }) => {
 const points = [
  { x: 18, y: 38, r: 8, name: "US" },
  { x: 28, y: 24, r: 5, name: "CA" },
  { x: 46, y: 34, r: 6, name: "UK" },
  { x: 52, y: 40, r: 4, name: "DE" },
  { x: 66, y: 52, r: 7, name: "IN" },
  { x: 76, y: 32, r: 5, name: "JP" },
  { x: 34, y: 64, r: 6, name: "BR" },
  { x: 86, y: 70, r: 5, name: "AU" },
 ]
 const max = Math.max(...topByViews.map((p) => p.views), 1)
 return (
  <div className="h-full border-[2px] border-black rounded-xl bg-[#f3f4f6] p-2 relative overflow-hidden">
   <svg viewBox="0 0 100 80" className="w-full h-full">
    <rect x="1" y="1" width="98" height="78" rx="5" fill="#eef2f7" stroke="#d1d5db" />
    {points.map((p, idx) => {
     const source = topByViews[idx % topByViews.length]
     const scale = 0.55 + source.views / max
     return (
      <g key={p.name}>
       <circle cx={p.x} cy={p.y} r={p.r * scale} fill={mode === "geo" ? "#24D3FF" : "#CCFF00"} fillOpacity="0.65" stroke="#111" strokeWidth="0.6" />
       <text x={p.x} y={p.y + 0.9} textAnchor="middle" fontSize="2.5" fontWeight="800">{p.name}</text>
      </g>
     )
    })}
   </svg>
  </div>
 )
}

const OrgBoard: React.FC<{ topByViews: ChartRenderContext["topByViews"] }> = ({ topByViews }) => (
 <div className="h-full p-2 overflow-auto">
  <div className="border-[2px] border-black rounded-lg p-2 bg-white text-[10px] font-black uppercase mb-2">Channel</div>
  <div className="space-y-1 pl-3 border-l-[3px] border-black/25">
   {topByViews.slice(0, 8).map((row) => (
    <div key={row.name} className="border-[2px] border-black rounded-lg px-2 py-1 bg-[#f9fafb] text-[9px] font-black uppercase">
     {row.name}
    </div>
   ))}
  </div>
 </div>
)

const SankeyBoard: React.FC<{ ctx: ChartRenderContext }> = ({ ctx }) => {
 const longViews = ctx.topRows.filter((row) => row.format === "long").reduce((sum, row) => sum + row.views, 0)
 const shortViews = ctx.topRows.filter((row) => row.format === "shorts").reduce((sum, row) => sum + row.views, 0)
 const total = Math.max(longViews + shortViews, 1)
 return (
  <div className="h-full p-3 space-y-3">
   <div className="grid grid-cols-2 gap-2">
    <div className="h-8 border-[2px] border-black rounded-lg bg-[#24D3FF]/30 text-[10px] font-black uppercase flex items-center justify-center">Long</div>
    <div className="h-8 border-[2px] border-black rounded-lg bg-[#CCFF00]/30 text-[10px] font-black uppercase flex items-center justify-center">Shorts</div>
   </div>
   <div className="h-3 border border-black rounded-full overflow-hidden bg-white">
    <div className="h-full bg-[#24D3FF]" style={{ width: `${(longViews / total) * 100}%` }} />
   </div>
   <div className="h-3 border border-black rounded-full overflow-hidden bg-white">
    <div className="h-full bg-[#CCFF00]" style={{ width: `${(shortViews / total) * 100}%` }} />
   </div>
   <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase">
    <div className="border-[2px] border-black rounded-lg p-2 bg-white">Subs: {Math.round(ctx.summary.totals.subscribersGained)}</div>
    <div className="border-[2px] border-black rounded-lg p-2 bg-white">Revenue: {ctx.summary.totals.revenue.toFixed(2)}</div>
   </div>
  </div>
 )
}

const TimelineBoard: React.FC<{ timeline: ChartRenderContext["timeline"]; mode: "timeline" | "gantt" }> = ({ timeline, mode }) => (
 <div className="h-full p-2 space-y-1 overflow-auto">
  {timeline.slice(-8).map((row, idx) => {
   const width = Math.max(20, Math.min(100, Math.round(row.views / 120)))
   return (
    <div key={row.date} className="grid grid-cols-[70px_1fr] items-center gap-2">
     <span className="text-[9px] font-black uppercase tracking-[0.1em]">{mode === "gantt" ? `Batch ${idx + 1}` : row.date.slice(5)}</span>
     <div className="h-6 border-[2px] border-black rounded-lg bg-white overflow-hidden">
      <div
       className="h-full"
       style={{
        width: `${width}%`,
        backgroundColor: mode === "gantt" ? "#4c7ce5" : "#24D3FF",
       }}
      />
     </div>
    </div>
   )
  })}
 </div>
)

const WordTreeBoard: React.FC<{ topRows: ChartRenderContext["topRows"] }> = ({ topRows }) => (
 <div className="h-full p-2 overflow-auto space-y-1">
  {topRows.slice(0, 12).map((row) => (
   <div key={row.id} className="text-[10px] font-black uppercase tracking-[0.08em] border-[2px] border-black rounded-lg px-2 py-1 bg-white">
    {`video -> ${compactTitle(row.title)}`}
   </div>
  ))}
 </div>
)

export const CHART_RENDERER_MAP: Record<ChartRendererKey, ChartRenderer> = {
 annotation: (ctx) => (
  <SafeResponsiveContainer>
   <LineChart data={ctx.timeline.slice(-24)}>
    {grid}
    <XAxis dataKey="date" tick={{ fill: AXIS, fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} />
    <YAxis tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Line type="monotone" dataKey="views" stroke="#24D3FF" strokeWidth={3} dot={false} />
   </LineChart>
  </SafeResponsiveContainer>
 ),
 area: (ctx) => (
  <SafeResponsiveContainer>
   <AreaChart data={ctx.timeline.slice(-24)}>
    {grid}
    <XAxis dataKey="date" tick={{ fill: AXIS, fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} />
    <YAxis tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Area type="monotone" dataKey="views" stroke="#24D3FF" fill="#24D3FF" fillOpacity={0.28} />
   </AreaChart>
  </SafeResponsiveContainer>
 ),
 bar: (ctx) => (
  <SafeResponsiveContainer>
   <BarChart data={ctx.topByViews}>
    {grid}
    <XAxis dataKey="name" hide />
    <YAxis tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Bar dataKey="views" fill="#CCFF00" />
   </BarChart>
  </SafeResponsiveContainer>
 ),
 bubble: (ctx) => (
  <SafeResponsiveContainer>
   <ScatterChart>
    {grid}
    <XAxis type="number" dataKey="views" tick={{ fill: AXIS, fontSize: 10 }} />
    <YAxis type="number" dataKey="revenue" tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Scatter data={ctx.scatter} fill="#FF7497" />
   </ScatterChart>
  </SafeResponsiveContainer>
 ),
 calendar: (ctx) => <CalendarHeat timeline={ctx.timeline} />,
 candlestick: (ctx) => (
  <SafeResponsiveContainer>
   <ComposedChart data={ctx.topByViews.slice(0, 8).map((row) => ({ ...row, low: row.views * 0.45, high: row.views }))}>
    {grid}
    <XAxis dataKey="name" hide />
    <YAxis tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Bar dataKey="low" fill="#4c7ce5" />
    <Bar dataKey="high" fill="#84a3ee" />
   </ComposedChart>
  </SafeResponsiveContainer>
 ),
 column: (ctx) => (
  <SafeResponsiveContainer>
   <BarChart data={ctx.topByViews}>
    {grid}
    <XAxis dataKey="name" hide />
    <YAxis tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Bar dataKey="views" fill="#24D3FF" />
   </BarChart>
  </SafeResponsiveContainer>
 ),
 combo: (ctx) => (
  <SafeResponsiveContainer>
   <ComposedChart data={ctx.topByViews}>
    {grid}
    <XAxis dataKey="name" hide />
    <YAxis yAxisId="left" tick={{ fill: AXIS, fontSize: 10 }} />
    <YAxis yAxisId="right" orientation="right" tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Bar yAxisId="left" dataKey="views" fill="#CCFF00" />
    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#FF7497" strokeWidth={2.5} dot={false} />
   </ComposedChart>
  </SafeResponsiveContainer>
 ),
 diff: (ctx) => (
  <SafeResponsiveContainer>
   <LineChart data={ctx.timeline.slice(-24).map((row) => ({ date: row.date, diff: row.views - row.watchHours * 40 }))}>
    {grid}
    <XAxis dataKey="date" tick={{ fill: AXIS, fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} />
    <YAxis tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Line type="monotone" dataKey="diff" stroke="#24D3FF" strokeWidth={3} dot={false} />
   </LineChart>
  </SafeResponsiveContainer>
 ),
 donut: (ctx) => (
  <SafeResponsiveContainer>
   <PieChart>
    <Pie data={ctx.formatBreakdown} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88} stroke="#000" strokeWidth={2}>
     {ctx.formatBreakdown.map((row, index) => (
      <Cell key={`${row.name}-${index}`} fill={COLORS[index % COLORS.length]} />
     ))}
    </Pie>
    <Tooltip contentStyle={TOOLTIP_STYLE} />
   </PieChart>
  </SafeResponsiveContainer>
 ),
 gantt: (ctx) => <TimelineBoard timeline={ctx.timeline} mode="gantt" />,
 gauge: (ctx) => (
  <div className="h-full flex items-center justify-center gap-2 flex-wrap">
   <GaugeRing label="CTR" value={Number(ctx.summary.averages.ctr || 0)} tone="#24D3FF" />
   <GaugeRing label="AVP" value={Number(ctx.summary.averages.avp || 0)} tone="#CCFF00" />
   <GaugeRing label="RPM" value={Number(ctx.summary.averages.rpm || 0)} tone="#FFB158" />
  </div>
 ),
 geo: (ctx) => <GeoBoard topByViews={ctx.topByViews} mode="geo" />,
 histogram: (ctx) => (
  <SafeResponsiveContainer>
   <BarChart data={ctx.histogram}>
    {grid}
    <XAxis dataKey="bucket" tick={{ fill: AXIS, fontSize: 10 }} />
    <YAxis tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Bar dataKey="count" fill="#FFB158" />
   </BarChart>
  </SafeResponsiveContainer>
 ),
 intervals: (ctx) => (
  <SafeResponsiveContainer>
   <ComposedChart data={ctx.intervals}>
    {grid}
    <XAxis dataKey="name" hide />
    <YAxis tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Bar dataKey="high" fill="#24D3FF" />
    <Bar dataKey="low" fill="#CCFF00" />
   </ComposedChart>
  </SafeResponsiveContainer>
 ),
 line: (ctx) => (
  <SafeResponsiveContainer>
   <LineChart data={ctx.timeline.slice(-24)}>
    {grid}
    <XAxis dataKey="date" tick={{ fill: AXIS, fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} />
    <YAxis tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Line type="monotone" dataKey="views" stroke="#24D3FF" strokeWidth={3} dot={false} />
   </LineChart>
  </SafeResponsiveContainer>
 ),
 maps: (ctx) => <GeoBoard topByViews={ctx.topByViews} mode="maps" />,
 org: (ctx) => <OrgBoard topByViews={ctx.topByViews} />,
 pie: (ctx) => (
  <SafeResponsiveContainer>
   <PieChart>
    <Pie data={ctx.formatBreakdown} dataKey="value" nameKey="name" outerRadius={88} stroke="#000" strokeWidth={2}>
     {ctx.formatBreakdown.map((row, index) => (
      <Cell key={`${row.name}-${index}`} fill={COLORS[index % COLORS.length]} />
     ))}
    </Pie>
    <Tooltip contentStyle={TOOLTIP_STYLE} />
   </PieChart>
  </SafeResponsiveContainer>
 ),
 sankey: (ctx) => <SankeyBoard ctx={ctx} />,
 scatter: (ctx) => (
  <SafeResponsiveContainer>
   <ScatterChart>
    {grid}
    <XAxis type="number" dataKey="views" tick={{ fill: AXIS, fontSize: 10 }} />
    <YAxis type="number" dataKey="ctr" tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Scatter data={ctx.scatter} fill="#FF7497" />
   </ScatterChart>
  </SafeResponsiveContainer>
 ),
 steppedArea: (ctx) => (
  <SafeResponsiveContainer>
   <AreaChart data={ctx.timeline.slice(-24)}>
    {grid}
    <XAxis dataKey="date" tick={{ fill: AXIS, fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} />
    <YAxis tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Area type="stepAfter" dataKey="views" stroke="#24D3FF" fill="#24D3FF" fillOpacity={0.3} />
   </AreaChart>
  </SafeResponsiveContainer>
 ),
 table: (ctx) => (
  <div className="h-full overflow-auto">
   <table className="w-full border-collapse text-[11px]">
    <thead>
     <tr className="bg-black text-white">
      <th className="border-[2px] border-black p-1 text-left">Video</th>
      <th className="border-[2px] border-black p-1 text-right">Views</th>
      <th className="border-[2px] border-black p-1 text-right">Watch Hrs</th>
      <th className="border-[2px] border-black p-1 text-right">Rev</th>
     </tr>
    </thead>
    <tbody>
     {ctx.tableRows.map((row) => (
      <tr key={`table-${row.title}`} className="bg-white even:bg-[#f3f4f6]">
       <td className="border-[2px] border-black p-1">{row.title}</td>
       <td className="border-[2px] border-black p-1 text-right">{Math.round(row.views).toLocaleString()}</td>
       <td className="border-[2px] border-black p-1 text-right">{row.watchHours.toFixed(1)}</td>
       <td className="border-[2px] border-black p-1 text-right">{row.revenue.toFixed(2)}</td>
      </tr>
     ))}
    </tbody>
   </table>
  </div>
 ),
 timelines: (ctx) => <TimelineBoard timeline={ctx.timeline} mode="timeline" />,
 treemap: (ctx) => (
  <SafeResponsiveContainer>
   <Treemap
    data={ctx.topByViews.slice(0, 12).map((row) => ({ name: row.name, size: Math.max(1, row.views) }))}
    dataKey="size"
    stroke="#000"
    fill="#24D3FF"
    aspectRatio={4 / 3}
   />
  </SafeResponsiveContainer>
 ),
 trendlines: (ctx) => (
  <SafeResponsiveContainer>
   <LineChart data={ctx.timeline.slice(-24)}>
    {grid}
    <XAxis dataKey="date" tick={{ fill: AXIS, fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} />
    <YAxis tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Line type="monotone" dataKey="views" stroke="#24D3FF" strokeWidth={3} dot={false} />
    <Line type="monotone" dataKey="watchHours" stroke="#FF7497" strokeWidth={2} dot={false} />
   </LineChart>
  </SafeResponsiveContainer>
 ),
 vega: (ctx) => (
  <SafeResponsiveContainer>
   <ComposedChart data={ctx.topByViews.slice(0, 10)}>
    {grid}
    <XAxis dataKey="name" hide />
    <YAxis tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Area type="monotone" dataKey="views" fill="#24D3FF" fillOpacity={0.24} stroke="#24D3FF" />
    <Line type="monotone" dataKey="revenue" stroke="#FF7497" strokeWidth={2.5} dot={false} />
   </ComposedChart>
  </SafeResponsiveContainer>
 ),
 waterfall: (ctx) => (
  <SafeResponsiveContainer>
   <BarChart data={ctx.waterfall}>
    {grid}
    <XAxis dataKey="name" tick={{ fill: AXIS, fontSize: 10 }} />
    <YAxis tick={{ fill: AXIS, fontSize: 10 }} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Bar dataKey="delta" fill="#FFB158" />
    <Bar dataKey="cumulative" fill="#24D3FF" />
   </BarChart>
  </SafeResponsiveContainer>
 ),
 wordtree: (ctx) => <WordTreeBoard topRows={ctx.topRows} />,
}

export const CHART_CARD_DEFINITIONS: ChartCardDefinition[] = [
 { key: "annotation", title: "Annotation Charts", size: "half", renderer: "annotation" },
 { key: "area", title: "Area Charts", size: "half", renderer: "area" },
 { key: "bar", title: "Bar Charts", size: "half", renderer: "bar" },
 { key: "bubble", title: "Bubble Charts", size: "half", renderer: "bubble" },
 { key: "calendar", title: "Calendar Charts", size: "half", renderer: "calendar" },
 { key: "candlestick", title: "Candlestick Charts", size: "half", renderer: "candlestick" },
 { key: "column", title: "Column Charts", size: "half", renderer: "column" },
 { key: "combo", title: "Combo Charts", size: "half", renderer: "combo" },
 { key: "diff", title: "Diff Charts", size: "third", renderer: "diff" },
 { key: "donut", title: "Donut Charts", size: "third", renderer: "donut" },
 { key: "gantt", title: "Gantt Charts", size: "half", renderer: "gantt" },
 { key: "gauge", title: "Gauge Charts", size: "third", renderer: "gauge" },
 { key: "geo", title: "GeoCharts", size: "half", renderer: "geo", note: "Deterministic geo fallback from canonical rows" },
 { key: "histogram", title: "Histograms", size: "third", renderer: "histogram" },
 { key: "intervals", title: "Intervals", size: "third", renderer: "intervals" },
 { key: "line", title: "Line Charts", size: "half", renderer: "line" },
 { key: "maps", title: "Maps", size: "half", renderer: "maps", note: "Deterministic regional fallback from canonical rows" },
 { key: "org", title: "Org Charts", size: "half", renderer: "org" },
 { key: "pie", title: "Pie Charts", size: "third", renderer: "pie" },
 { key: "sankey", title: "Sankey Diagrams", size: "half", renderer: "sankey" },
 { key: "scatter", title: "Scatter Charts", size: "half", renderer: "scatter" },
 { key: "steppedArea", title: "Stepped Area Charts", size: "half", renderer: "steppedArea" },
 { key: "table", title: "Table Charts", size: "full", renderer: "table" },
 { key: "timelines", title: "Timelines", size: "half", renderer: "timelines" },
 { key: "treemap", title: "Tree Map Charts", size: "half", renderer: "treemap" },
 { key: "trendlines", title: "Trendlines", size: "half", renderer: "trendlines" },
 { key: "vega", title: "VegaChart", size: "half", renderer: "vega", note: "Canonical adapter-backed representative surface" },
 { key: "waterfall", title: "Waterfall Charts", size: "half", renderer: "waterfall" },
 { key: "wordtree", title: "Word Trees", size: "half", renderer: "wordtree" },
]

export const CHART_CATALOG_GROUPS: Array<{ title: string; keys: ChartClassKey[] }> = [
 {
  title: "Trend + Sequence",
  keys: ["annotation", "area", "line", "steppedArea", "timelines", "trendlines", "calendar"],
 },
 {
  title: "Compare + Composition",
  keys: ["bar", "column", "combo", "diff", "histogram", "intervals", "waterfall", "table"],
 },
 {
  title: "Distribution + Mix",
  keys: ["bubble", "scatter", "pie", "donut", "gauge"],
 },
 {
  title: "Structure + Flow",
  keys: ["gantt", "org", "sankey", "treemap", "wordtree"],
 },
 {
  title: "Domain-Specific",
  keys: ["candlestick", "geo", "maps", "vega"],
 },
]

export const CREATIVE_CHART_VARIANTS_40: ChartVariantDefinition[] = [
 { id: "v01", label: "Velocity Sparkline", base: "line", renderer: "line", size: "third", readiness: "candidate" },
 { id: "v02", label: "Retention Ribbon", base: "area", renderer: "area", size: "half", readiness: "candidate" },
 { id: "v03", label: "Upload Pulse", base: "annotation", renderer: "annotation", size: "third", readiness: "exploratory" },
 { id: "v04", label: "Top Views Bars", base: "bar", renderer: "bar", size: "half", readiness: "canonical" },
 { id: "v05", label: "Long vs Shorts Column", base: "column", renderer: "column", size: "third", readiness: "candidate" },
 { id: "v06", label: "Revenue Combo", base: "combo", renderer: "combo", size: "half", readiness: "candidate" },
 { id: "v07", label: "Momentum Diff", base: "diff", renderer: "diff", size: "third", readiness: "exploratory" },
 { id: "v08", label: "Format Donut", base: "donut", renderer: "donut", size: "third", readiness: "canonical" },
 { id: "v09", label: "Format Pie", base: "pie", renderer: "pie", size: "third", readiness: "candidate" },
 { id: "v10", label: "Audience Scatter", base: "scatter", renderer: "scatter", size: "half", readiness: "candidate" },
 { id: "v11", label: "CTR Bubble", base: "bubble", renderer: "bubble", size: "half", readiness: "exploratory" },
 { id: "v12", label: "Calendar Heat", base: "calendar", renderer: "calendar", size: "half", readiness: "candidate" },
 { id: "v13", label: "Candlestick Revenue", base: "candlestick", renderer: "candlestick", size: "half", readiness: "exploratory" },
 { id: "v14", label: "Histogram Views", base: "histogram", renderer: "histogram", size: "third", readiness: "canonical" },
 { id: "v15", label: "Intervals Range", base: "intervals", renderer: "intervals", size: "third", readiness: "candidate" },
 { id: "v16", label: "Timeline Streams", base: "timelines", renderer: "timelines", size: "half", readiness: "candidate" },
 { id: "v17", label: "Trendline Dual", base: "trendlines", renderer: "trendlines", size: "half", readiness: "candidate" },
 { id: "v18", label: "Stepped Cadence", base: "steppedArea", renderer: "steppedArea", size: "half", readiness: "candidate" },
 { id: "v19", label: "Waterfall Delta", base: "waterfall", renderer: "waterfall", size: "half", readiness: "candidate" },
 { id: "v20", label: "TreeMap Exposure", base: "treemap", renderer: "treemap", size: "half", readiness: "exploratory" },
 { id: "v21", label: "Sankey Format Flow", base: "sankey", renderer: "sankey", size: "half", readiness: "candidate" },
 { id: "v22", label: "Org Influence Tree", base: "org", renderer: "org", size: "half", readiness: "exploratory" },
 { id: "v23", label: "WordTree Topic Cloud", base: "wordtree", renderer: "wordtree", size: "half", readiness: "exploratory" },
 { id: "v24", label: "Geo Reach", base: "geo", renderer: "geo", size: "half", readiness: "candidate" },
 { id: "v25", label: "Map Reach Regions", base: "maps", renderer: "maps", size: "half", readiness: "candidate" },
 { id: "v26", label: "Gauge Trio", base: "gauge", renderer: "gauge", size: "third", readiness: "canonical" },
 { id: "v27", label: "Vega Composite", base: "vega", renderer: "vega", size: "half", readiness: "exploratory" },
 { id: "v28", label: "Table Snapshot", base: "table", renderer: "table", size: "full", readiness: "canonical" },
 { id: "v29", label: "Annotation Pulse", base: "annotation", renderer: "annotation", size: "half", readiness: "exploratory" },
 { id: "v30", label: "Area Soft Fill", base: "area", renderer: "area", size: "third", readiness: "exploratory" },
 { id: "v31", label: "Line Micro", base: "line", renderer: "line", size: "third", readiness: "candidate" },
 { id: "v32", label: "Bar Micro", base: "bar", renderer: "bar", size: "third", readiness: "candidate" },
 { id: "v33", label: "Column Micro", base: "column", renderer: "column", size: "third", readiness: "exploratory" },
 { id: "v34", label: "Combo Micro", base: "combo", renderer: "combo", size: "third", readiness: "exploratory" },
 { id: "v35", label: "Scatter Micro", base: "scatter", renderer: "scatter", size: "third", readiness: "candidate" },
 { id: "v36", label: "Bubble Micro", base: "bubble", renderer: "bubble", size: "third", readiness: "exploratory" },
 { id: "v37", label: "Timeline Micro", base: "timelines", renderer: "timelines", size: "third", readiness: "candidate" },
 { id: "v38", label: "Waterfall Micro", base: "waterfall", renderer: "waterfall", size: "third", readiness: "exploratory" },
 { id: "v39", label: "Geo Micro", base: "geo", renderer: "geo", size: "third", readiness: "exploratory" },
 { id: "v40", label: "Gauge Micro", base: "gauge", renderer: "gauge", size: "third", readiness: "candidate" },
]

export const getChartCardByKey = (key: ChartClassKey): ChartCardDefinition => {
 const found = CHART_CARD_DEFINITIONS.find((card) => card.key === key)
 if (!found) {
  throw new Error(`Missing chart definition for key: ${key}`)
 }
 return found
}

export const getSpanClassForChartSize = (size: ChartCardSize): string => {
 if (size === "full") return "xl:col-span-12"
 if (size === "half") return "xl:col-span-6"
 return "xl:col-span-4"
}

export const ChartRendererSurface: React.FC<{
 card: ChartCardDefinition
 analytics: CanonicalAnalyticsView
}> = ({ card, analytics }) => {
 const renderer = CHART_RENDERER_MAP[card.renderer]
 const context = safeContext(analytics)
 return <>{renderer(context)}</>
}

export const chartCardFromVariant = (
 variant: ChartVariantDefinition,
): ChartCardDefinition => ({
 key: variant.base,
 title: variant.label,
 size: variant.size,
 renderer: variant.renderer,
 note: `Variant · ${variant.readiness}`,
})
