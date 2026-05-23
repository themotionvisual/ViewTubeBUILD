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
import { InsightMarquee } from "./InsightMarquee"
import { UPLOAD_CACHE_FILES_KEY } from "../services/analytics/SyncPipeline"
import {
  buildKeywordClustersFromMasterRows,
  buildKeywordSelectionSummary,
  buildKeywordCombinationStats,
  toggleKeywordSelection,
  getKeywordMetricDefinition,
  formatKeywordMetricValue,
  KEYWORD_VENN_METRIC_OPTIONS,
  buildKeywordVideoRows,
  type KeywordMetricKey,
} from "../services/keywordVennAnalysis"

const mv = (row: CanonicalVideoRow, key: string): number =>
 resolveMetricNumber(row, key as any).value || 0

export interface GChartProps { data: CanonicalVideoRow[] }

const COLORS = ["#FF3399","#00E5FF","#CCFF00","#FF9900","#9933FF","#33FF99","#FF7497","#24D3FF","#FFB158"]
const ctrPct = (row: CanonicalVideoRow): number => {
 const raw = mv(row, "ctr")
 if (!Number.isFinite(raw)) return 0
 return raw <= 1 ? raw * 100 : raw
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
 title: string; subtitle?: string; headerColor?: string; count?: number; icon?: React.ReactNode; children: React.ReactNode
}> = ({ title, subtitle = "CANONICAL METRIC VIEW", headerColor = "#FFEA00", count, icon = <CustomIcon name="analytics" size={18} />, children }) => (
 <UnifiedChartModule
  title={title}
  subtitle={subtitle}
  headerIcon={icon}
  headerColor={headerColor}
  stats={count !== undefined ? [{ label: "VIDEOS", value: String(count), tone: "white" }] : []}
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
 const [hoveredKey, setHoveredKey] = useState<string | null>(null)

 const matrix = useMemo(() => {
  const missing = new Set<string>()
  const warnings = new Set<string>()
  const allLongRows = data.filter((row) => isLongFormForValueMatrix(row))

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
  const top100 = sorted.slice(0, 100)

  const inRangeCtr = top100.map((point) => point.ctr).filter((value) => value > 0 && value <= 20)
  const ctrCeilCandidate = inRangeCtr.length > 0 ? Math.max(...inRangeCtr) * 1.1 : 10
  const ctrDomainMax = Math.max(10, Math.min(20, Math.ceil(ctrCeilCandidate)))
  const plotted = top100.filter((point) => point.ctr <= ctrDomainMax)
  if (plotted.length < top100.length) warnings.add("ctr_outliers_excluded_from_plot")

  const maxViews = Math.max(1, ...plotted.map((point) => point.views))
  const minViews = Math.max(1, Math.min(...plotted.map((point) => point.views)))
  const bubbleSize = (views: number) => {
   if (maxViews === minViews) return 220
   const t = (views - minViews) / (maxViews - minViews)
   return Math.round(80 + t * 620)
  }

  return {
   points: plotted.map((point) => ({ ...point, bubble: bubbleSize(point.views) })),
   count: top100.length,
   ctrDomainMax,
   retentionDomainMax: 150,
   thresholds: { ctr: 5, retention: 75 },
   validRows: points.length,
   missingMetrics: Array.from(missing).sort(),
   qualityWarnings: Array.from(warnings).sort(),
   totalLongRows: allLongRows.length,
  }
 }, [data, mode])

 const activePoint = useMemo(() => {
  if (matrix.points.length === 0) return null
  const selected = matrix.points.find((point) => point.key === hoveredKey)
  return selected || matrix.points[0]
 }, [matrix.points, hoveredKey])

 return (
  <SubToolboxChartModule
   header={{
    title: "VIDEO VALUE MATRIX",
    subtitle: `TOP 100 ${mode === "most-recent" ? "RECENT" : "PERFORMING"} LONG FORM`,
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
    countLabel: matrix.totalLongRows <= 100 ? "ALL LONG FORM" : "BEST",
    dropdown:
     matrix.totalLongRows > 100
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
          { value: "top-performing", label: "100 BEST" },
          { value: "most-recent", label: "100 LAST" },
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
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
       <ScatterChart margin={{ top: 10, right: 20, bottom: 8, left: 8 }}>
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
      </ResponsiveContainer>
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
/* 2. Revenue Distribution */
export const RevenueDistribution: React.FC<GChartProps> = ({ data }) => {
 const cd = useMemo(() => [...data].sort((a,b) => mv(b,"revenue")-mv(a,"revenue")).slice(0,10)
  .map(r => ({ name: r.title.substring(0,25), value: +mv(r,"revenue").toFixed(2) })).filter(d=>d.value>0), [data])
 const total = useMemo(() => cd.reduce((s, d) => s + d.value, 0), [cd])
 return (
  <SubToolboxChartModule
   header={{
    title: "REVENUE DISTRIBUTION",
    subtitle: `TOP ${cd.length} — LAST 90 DAYS`,
    icon: <CustomIcon name="analytics" size={18} />,
    headerStyle: "subtoolbox",
   }}
   theme={{
    headerBandBg: "#CCFF00",
    iconBlockBg: "#00E5FF",
    shadowColor: "rgba(204,255,0,0.45)",
   }}
   layout={{ moduleMinHeight: "340px", moduleWidth: "100%" }}
   controlBox={{ count: cd.length, countUnit: "VIDEOS" }}
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
      { badge: "Revenue", text: "Revenue distribution shows which videos generate the most income — focus on creating more of your top earners.", badgeTone: "lime" },
     ]}
    />
   }
  >
   <div className="h-[340px] p-4">
    <StableChartFrame minHeightClassName="min-h-[300px]">
     <PieChart>
      <Pie data={cd} innerRadius="30%" outerRadius="90%" dataKey="value" stroke="#fff" strokeWidth={2} label={({value})=>`$${value}`}>
       {cd.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
      </Pie>
      <Tooltip content={<ChartTip/>}/>
     </PieChart>
    </StableChartFrame>
   </div>
  </SubToolboxChartModule>
 )
}

/* 3. Watch Time Distribution */
export const WatchTimeDistribution: React.FC<GChartProps> = ({ data }) => {
 const cd = useMemo(() => [...data].sort((a,b) => mv(b,"watchHours")-mv(a,"watchHours")).slice(0,10)
  .map(r => ({ name: r.title.substring(0,25), value: +mv(r,"watchHours").toFixed(1) })).filter(d=>d.value>0), [data])
 const total = useMemo(() => cd.reduce((s, d) => s + d.value, 0), [cd])
 return (
  <SubToolboxChartModule
   header={{
    title: "WATCH TIME DISTRIBUTION",
    subtitle: "CANONICAL METRIC VIEW",
    icon: <CustomIcon name="calendar" size={18} />,
    headerStyle: "subtoolbox",
   }}
   theme={{
    headerBandBg: "#FFEA00",
    iconBlockBg: "#FF7497",
    shadowColor: "rgba(255,234,0,0.45)",
   }}
   layout={{ moduleMinHeight: "340px", moduleWidth: "100%" }}
   controlBox={{ count: cd.length, countUnit: "VIDEOS" }}
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
      { badge: "Watch Time", text: "Watch time distribution reveals which videos keep viewers engaged longest — a key factor in algorithmic promotion.", badgeTone: "yellow" },
     ]}
    />
   }
  >
   <div className="h-[340px] p-4">
    <StableChartFrame minHeightClassName="min-h-[300px]">
     <PieChart>
      <Pie data={cd} innerRadius="20%" outerRadius="90%" dataKey="value" stroke="#fff" strokeWidth={2}>
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
 const [mode, setMode] = useState<"subs" | "views" | "watch">("subs")
 const [modeMenuOpen, setModeMenuOpen] = useState(false)
 const modeLabel = mode === "subs" ? "SUBSCRIBERS" : mode === "views" ? "VIEWS" : "WATCH HOURS"
 const cd = useMemo(() => {
  const metric = mode === "views" ? "views" : mode === "watch" ? "watchHours" : "subscribersGained"
  return [...data]
   .sort((a, b) => mv(b, metric) - mv(a, metric))
   .slice(0, 10)
   .map((r) => ({ name: r.title.substring(0, 18), value: mv(r, metric) }))
   .filter((d) => d.value > 0)
 }, [data, mode])
 return (
  <SubToolboxChartModule
   header={{
    title: "SUBSCRIBERS GAINED",
    subtitle: `RANKED BY ${modeLabel}`,
    icon: <CustomIcon name="analytics" size={18} />,
    headerStyle: "subtoolbox",
   }}
   theme={{
    headerBandBg: "#FFEA00",
    iconBlockBg: "#00E5FF",
    shadowColor: "rgba(255,234,0,0.45)",
   }}
   layout={{ moduleMinHeight: "340px", moduleWidth: "100%" }}
   controlBox={{
    count: 50,
    countUnit: "VIDEOS",
    dropdown: {
     value: mode,
     isOpen: modeMenuOpen,
     onToggle: () => setModeMenuOpen((prev) => !prev),
     onSelect: (value) => { setMode(value as any); setModeMenuOpen(false) },
     options: [
      { value: "subs", label: "SUBS" },
      { value: "views", label: "VIEWS" },
      { value: "watch", label: "WATCH" },
     ],
    },
   }}
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
   <div className="h-[340px] p-4">
    <StableChartFrame minHeightClassName="min-h-[300px]">
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
   buildTop("subscribersGained", "Subs"),
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
     <div key={card.label} className="border-[3px] border-black rounded-xl bg-white p-2">
      <div className="text-[10px] font-black uppercase tracking-[0.12em] mb-1">{card.label}</div>
      <div className="h-[200px] border-[2px] border-black rounded-lg bg-[#F4F4F5] p-1">
       <StableChartFrame minHeightClassName="min-h-[160px]">
        <PieChart>
         <Pie data={card.rows} dataKey="value" nameKey="name" innerRadius={40} outerRadius={72} stroke="#111827" strokeWidth={1} isAnimationActive animationDuration={700} animationBegin={idx * 120}>
          {card.rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
         </Pie>
        </PieChart>
       </StableChartFrame>
      </div>
      <div className="mt-2 h-10 border-[2px] border-black rounded-md bg-[#00CCFF] text-black px-2 flex items-center justify-between">
       <span className="text-[8px] font-black uppercase tracking-[0.1em]">#1</span>
       <span className="text-[10px] font-[1000] truncate max-w-[70%]">{card.top?.name || "N/A"}</span>
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
 const cd = useMemo(() => {
  const isShortRow = (r: CanonicalVideoRow) =>
   String(r.format || "").toLowerCase().includes("short") ||
   (r.durationSeconds > 0 && r.durationSeconds <= 180)
  const shorts = data
   .filter((r) => isShortRow(r))
   .map((r) => ({
    title: r.title,
    dur: r.durationSeconds,
    avd: +retentionPct(r).toFixed(1),
    views: mv(r, "views"),
    estIncome: Math.max(mv(r, "revenue"), (mv(r, "rpm") * Math.max(0, mv(r, "views"))) / 1000),
    uploadTs: new Date(String(r.uploadDate || "")).getTime() || 0,
   }))
   .filter((d) => d.dur > 0 && d.avd > 0)

  const ranked = mode === "most-recent"
   ? [...shorts].sort((a, b) => b.uploadTs - a.uploadTs)
   : [...shorts].sort((a, b) => b.views - a.views)

  const top100 = ranked.slice(0, 100)
  const yTop = 300
  if (top100.length === 0) {
   return { points: [], yTop }
  }
  const minViews = Math.min(...top100.map((d) => d.views))
  const maxViews = Math.max(...top100.map((d) => d.views))
  const minIncome = Math.min(...top100.map((d) => d.estIncome))
  const maxIncome = Math.max(...top100.map((d) => d.estIncome))
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

  const rankDenom = Math.max(1, top100.length - 1)
  const rankByKey = new Map<string, number>()
  ;[...top100]
   .sort((a, b) => a.estIncome - b.estIncome)
   .forEach((d, idx) => rankByKey.set(`${d.title}-${d.uploadTs}-${d.views}`, idx))

  const points = top100.map((d) => {
   const key = `${d.title}-${d.uploadTs}-${d.views}`
   const rankT = (rankByKey.get(key) ?? 0) / rankDenom
   const incomeT = maxIncome > minIncome ? (d.estIncome - minIncome) / (maxIncome - minIncome) : 0.5
   const hybridT = clamp01(rankT * 0.65 + incomeT * 0.35)
   const rareLargeBiasT = Math.pow(hybridT, 2.1)
   const r = lerp(3, 30, rareLargeBiasT)
   const c = {
    r: Math.round(lerp(36, 102, clamp01(incomeT))),
    g: Math.round(lerp(188, 255, clamp01(incomeT))),
    b: Math.round(255 - 116 * clamp01(incomeT)),
   }
   return {
    ...d,
    key,
    avdClamped: +Math.max(0, Math.min(yTop, d.avd)).toFixed(2),
    radius: r,
    color: `rgb(${c.r}, ${c.g}, ${c.b})`,
   }
  })

  // Draw larger bubbles first so smaller ones stay above on z-order.
  return {
   points: [...points].sort((a, b) => b.radius - a.radius),
   yTop,
  }
 }, [data, mode])

 const bubbleShape = (props: any) => {
  const { cx, cy, payload } = props
  const isHover = hoveredKey === payload.key
  const scale = isHover ? 1.25 : 1
  return (
   <circle
    cx={cx}
    cy={cy}
    r={payload.radius}
    fill={payload.color}
    fillOpacity={0.75}
    stroke={payload.color}
    strokeWidth={isHover ? 2 : 0}
    style={{
      transformBox: "fill-box",
      transformOrigin: "center",
      transform: `scale(${scale})`,
      shapeRendering: "geometricPrecision",
      transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1)",
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
     <span className="block text-[9px] font-bold opacity-60 uppercase">AVD% × Duration</span>
    </div>
    <div className="flex items-center gap-2">
     <select
      value={mode}
      onChange={(e) => setMode(e.target.value as "top-performing" | "most-recent")}
      className="h-7 px-2 bg-white border-[2px] border-black rounded-[4px] text-[9px] font-black uppercase">
      <option value="top-performing">Top Performing</option>
      <option value="most-recent">Most Recent</option>
     </select>
     <span className="text-[10px] font-black uppercase">TOP AVG % {cd.yTop}</span>
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
      <XAxis type="number" dataKey="dur" name="Duration (s)" tick={{fontWeight:900,fontSize:10}}/>
      <YAxis type="number" dataKey="avdClamped" name="AVG % Viewed (relative)" domain={[0, cd.yTop]} tick={{fontWeight:900,fontSize:10}}/>
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

/* 5b. Shorts Retention - Widget Module (no tooltip, subtitle rail) */
export const ShortsRetentionWidgetModule: React.FC<GChartProps> = ({ data }) => {
 const [mode, setMode] = useState<"top-performing" | "most-recent">("top-performing")
 const [sortMetric, setSortMetric] = useState<"avd" | "estIncome" | "dur" | "views">("avd")
 const [modeMenuOpen, setModeMenuOpen] = useState(false)
 const [activeKey, setActiveKey] = useState<string | null>(null)
 const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
 const rafMouseRef = useRef<number | null>(null)
 const pendingMouseRef = useRef<{ x: number; y: number } | null>(null)

 const cd = useMemo(() => {
  const isShortRow = (r: CanonicalVideoRow) =>
   String(r.format || "").toLowerCase().includes("short") ||
   (r.durationSeconds > 0 && r.durationSeconds <= 180)
  const shorts = data
   .filter((r) => isShortRow(r))
   .map((r) => ({
    title: r.title,
    dur: r.durationSeconds,
    avd: +mv(r, "avp").toFixed(1),
    views: mv(r, "views"),
    estIncome: Math.max(mv(r, "revenue"), (mv(r, "rpm") * Math.max(0, mv(r, "views"))) / 1000),
    uploadTs: new Date(String(r.uploadDate || "")).getTime() || 0,
   }))
   .filter((d) => d.dur > 0 && d.avd > 0)

  const ranked = mode === "most-recent"
   ? [...shorts].sort((a, b) => b.uploadTs - a.uploadTs)
   : [...shorts].sort((a, b) => b[sortMetric] - a[sortMetric])

  const top100 = ranked.slice(0, 100)
  const yTop = 300
  const minViews = Math.min(...top100.map((d) => d.views))
  const maxViews = Math.max(...top100.map((d) => d.views))
  const minIncome = Math.min(...top100.map((d) => d.estIncome))
  const maxIncome = Math.max(...top100.map((d) => d.estIncome))
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

  const rankDenom = Math.max(1, top100.length - 1)
  const rankByKey = new Map<string, number>()
  ;[...top100]
   .sort((a, b) => a.estIncome - b.estIncome)
   .forEach((d, idx) => rankByKey.set(`${d.title}-${d.uploadTs}-${d.views}`, idx))

  const points = top100.map((d) => {
   const key = `${d.title}-${d.uploadTs}-${d.views}`
   const rankT = (rankByKey.get(key) ?? 0) / rankDenom
   const incomeT = maxIncome > minIncome ? (d.estIncome - minIncome) / (maxIncome - minIncome) : 0.5
   const hybridT = clamp01(rankT * 0.65 + incomeT * 0.35)
   const rareLargeBiasT = Math.pow(hybridT, 2.1)
   const r = lerp(3, 30, rareLargeBiasT)
   const c = {
    r: Math.round(lerp(36, 102, clamp01(incomeT))),
    g: Math.round(lerp(188, 255, clamp01(incomeT))),
    b: Math.round(255 - 116 * clamp01(incomeT)),
   }
   return {
    ...d,
    key,
    avdClamped: +Math.max(0, Math.min(yTop, d.avd)).toFixed(2),
    radius: r,
    color: `rgb(${c.r}, ${c.g}, ${c.b})`,
   }
  })

  return {
   points: [...points].sort((a, b) => b.radius - a.radius),
   yTop,
  }
 }, [data, mode, sortMetric])

 useEffect(() => {
  if (cd.points.length === 0) {
   setActiveKey(null)
   return
  }
  if (!activeKey || !cd.points.some((p) => p.key === activeKey)) {
   setActiveKey(cd.points[0].key)
  }
 }, [cd.points, activeKey])

 const activePoint = useMemo(
  () => cd.points.find((p) => p.key === activeKey) || cd.points[0] || null,
  [cd.points, activeKey],
 )

 const shortsInsight = useMemo(() => {
  if (cd.points.length === 0) return "No shorts retention data yet. Sync to unlock retention insights."
  const best = [...cd.points].sort((a, b) => b.avd - a.avd)[0]
  const longHold = cd.points.filter((p) => p.dur >= 90 && p.avd >= 55).length
  return `Your strongest short holds ${best.avd.toFixed(
   1,
  )}% at ${Math.round(best.dur)}s, and ${longHold} videos keep 55%+ attention beyond 90s - that's a repeatable retention signature.`
 }, [cd.points])

 const generalInsight =
  "Shorts retention maps the relationship between video length, attention hold, and reach to expose your strongest duration ranges."

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
    fillOpacity={0.75}
    stroke={payload.color}
    strokeWidth={isActive ? 2 : 0}
    onMouseEnter={() => setActiveKey(payload.key)}
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
    dropdown: {
      value: mode,
      isOpen: modeMenuOpen,
      onToggle: () => setModeMenuOpen((prev) => !prev),
      onSelect: (value) => {
        setMode(value as "top-performing" | "most-recent")
        setModeMenuOpen(false)
      },
      options: [
        { value: "top-performing", label: "BEST" },
        { value: "most-recent", label: "LAST" },
      ],
    },
   }}
   activeContext={{
     title: activePoint?.title?.toUpperCase() || "NO VIDEO SELECTED",
     stats: [
      { label: "AVD%", value: activePoint ? activePoint.avd.toFixed(2) : "0.00", tone: "lime", onClick: () => setSortMetric("avd"), isActive: sortMetric === "avd" },
      { label: "REV", value: `$${activePoint ? activePoint.estIncome.toFixed(2) : "0.00"}`, tone: "cyan", onClick: () => setSortMetric("estIncome"), isActive: sortMetric === "estIncome" },
      { label: "LENGTH", value: `${activePoint ? Math.round(activePoint.dur) : 0}s`, tone: "yellow", onClick: () => setSortMetric("dur"), isActive: sortMetric === "dur" },
      { label: "VIEWS", value: activePoint ? Math.round(activePoint.views).toLocaleString() : "0", tone: "white", onClick: () => setSortMetric("views"), isActive: sortMetric === "views" },
     ],
   }}
   metricBadges={[
    { label: "AVD%", tone: "lime" },
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
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
        if (rafMouseRef.current !== null) {
         cancelAnimationFrame(rafMouseRef.current)
         rafMouseRef.current = null
        }
       }}>
       <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={true} />
       <XAxis
        type="number"
        dataKey="dur"
        domain={[0, 180]}
        axisLine={{ stroke: '#000', strokeWidth: 3 }}
        tickLine={false}
        tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }}
       />
       <YAxis
        type="number"
        dataKey="avdClamped"
        domain={[0, cd.yTop]}
        ticks={[0, 75, 150, 225, 300]}
        axisLine={{ stroke: '#000', strokeWidth: 3 }}
        tickLine={false}
        tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }}
        tickFormatter={(v) => v === 0 ? '' : v}
        label={{
         value: "AVG % VIEWED",
         angle: -90,
         position: "insideLeft",
         offset: 15,
         style: { fontWeight: 1000, fontSize: 14, fill: '#000', letterSpacing: '0.1em', textAnchor: 'middle' },
        }}
       />
       <Scatter data={cd.points} shape={bubbleShape} name="Income Gradient" />
      <Customized component={({ offset }: any) => {
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
          {/* Extend axis lines to container edges without changing tick/label positions */}
          <line
           x1={left}
           y1={top}
           x2={left}
           y2={0}
           stroke="#000"
           strokeWidth={3}
           shapeRendering="crispEdges"
          />
          <line
           x1={right}
           y1={bottom}
           x2={width}
           y2={bottom}
           stroke="#000"
           strokeWidth={3}
           shapeRendering="crispEdges"
          />
          <line
           x1={left}
           y1={snappedY}
           x2={right}
           y2={snappedY}
           stroke="rgba(0, 0, 0, 0.15)"
           strokeWidth={1}
           shapeRendering="crispEdges"
          />
          <line
           x1={snappedX}
           y1={top}
           x2={snappedX}
           y2={bottom}
           stroke="rgba(0, 0, 0, 0.15)"
           strokeWidth={1}
           shapeRendering="crispEdges"
          />
         </g>
       )
      }} />
      </ScatterChart>
      </ResponsiveContainer>
     </StableChartFrame>
     <div className="absolute bottom-[0px] left-[14px] right-[14px] grid grid-cols-3 items-center pointer-events-none">
      <div className="flex items-center gap-2 justify-self-end">
        <span className="text-[14px] font-[1000] uppercase tracking-[0.05em] text-black">Revenue</span>
        <div className="w-[155px] h-6 border-[2px] border-black rounded-[2px] bg-gradient-to-r from-[#24BCFF] via-[#45DDB0] to-[#66FF8A]" />
      </div>
      <div className="justify-self-center flex items-center gap-3">
        <span className="text-black font-[1000] text-[16px] leading-none">◀</span>
        <span
          className="uppercase tracking-[0.1em] text-black"
          style={{ fontWeight: 1000, fontSize: 14, letterSpacing: "0.1em" }}
        >
          Shorts Length
        </span>
        <span className="text-black font-[1000] text-[16px] leading-none">▶</span>
      </div>
      <div className="flex items-center gap-2 justify-self-start">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-between w-[115px]">
            <span className="w-2 aspect-square shrink-0 box-border rounded-full bg-[#24BCFF] opacity-[0.75]" />
            <span className="w-3 aspect-square shrink-0 box-border rounded-full bg-[#2FC8EF] opacity-[0.75]" />
            <span className="w-4 aspect-square shrink-0 box-border rounded-full bg-[#3AD4DF] opacity-[0.75]" />
            <span className="w-5 aspect-square shrink-0 box-border rounded-full bg-[#45DDB0] opacity-[0.75]" />
            <span className="w-6 aspect-square shrink-0 box-border rounded-full bg-[#66FF8A] opacity-[0.75]" />
          </div>
          <span className="text-[14px] font-[1000] uppercase tracking-[0.05em] text-black">Views</span>
        </div>
      </div>
     </div>
    </div>
   </div>
  </SubToolboxChartModule>
 )
}

/* 5c. Algorithm Trigger Module (CTR × Impressions - SubToolbox) */
export const AlgorithmTriggerModule: React.FC<GChartProps> = ({ data }) => {
 const [mode, setMode] = useState<"top-performing" | "most-recent">("top-performing")
 const [sortMetric, setSortMetric] = useState<"ctr" | "impressions" | "views">("impressions")
 const [modeMenuOpen, setModeMenuOpen] = useState(false)
 const [hoveredKey, setHoveredKey] = useState<string | null>(null)

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

  const top50 = ranked.slice(0, 50)
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
 }, [data, mode, sortMetric])

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
    subtitle: `TOP 50 ${mode === "most-recent" ? "RECENT" : "PERFORMING"} BY ${sortMetric.toUpperCase()}`,
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
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
      </ResponsiveContainer>
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
 { key: "comments", label: "COMMENTS", color: "#00E5FF", tone: "cyan" as const },
 { key: "subscribersGained", label: "SUBS", color: "#CCFF00", tone: "lime" as const },
 { key: "shares", label: "SHARES", color: "#FFE357", tone: "yellow" as const },
 { key: "likes", label: "LIKES", color: "#FF7497", tone: "pink" as const },
] as const

export const EngagementLinesModule: React.FC<GChartProps> = ({ data }) => {
 const [sortMetric, setSortMetric] = useState<string>("likes")
 const [mode, setMode] = useState<"top-performing" | "most-recent">("most-recent")
 const [modeMenuOpen, setModeMenuOpen] = useState(false)
 const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
 const [animKey, setAnimKey] = useState(0)

 const cd = useMemo(() => {
  const mapped = data.map((r) => ({
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
    ? sortedByMetric([...mapped].sort((a, b) => b.uploadTs - a.uploadTs).slice(0, 25))
    : sortedByMetric(mapped)

  return sorted.slice(0, 25).map((d, i) => ({
   ...d,
   idx: i,
   name: String(i + 1),
  }))
 }, [data, sortMetric, mode])

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
  setModeMenuOpen(false)
  setAnimKey((k) => k + 1)
 }

 const sortLabel = ENGAGEMENT_METRICS.find((m) => m.key === sortMetric)?.label || "LIKES"
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
     { label: "SUBS", value: String(activeRow?.subscribersGained ?? 0), tone: "lime", onClick: () => handleSortChange("subscribersGained"), isActive: sortMetric === "subscribersGained" },
    ],
   }}
   controlBox={{
    count: cd.length,
    countUnit: "VIDEOS",
    rightInlineControls: (
     <div className="grid grid-cols-2 gap-1 mr-1">
      {ENGAGEMENT_METRICS.map((m) => (
       <button
        key={m.key}
        type="button"
        onClick={() => handleSortChange(m.key)}
        className={`h-6 px-2 rounded-md border-[2px] text-[9px] font-black uppercase tracking-[0.08em] inline-flex items-center gap-1 ${
         sortMetric === m.key ? "border-black bg-white" : "border-black/40 bg-white/75"
        }`}>
        <span className="w-2 h-2 rounded-full border border-black" style={{ backgroundColor: m.color }} />
        <span>{m.label}</span>
       </button>
      ))}
     </div>
    ),
    dropdown: {
     value: mode,
     isOpen: modeMenuOpen,
     onToggle: () => setModeMenuOpen((prev) => !prev),
     onSelect: handleModeChange,
     options: [
      { value: "most-recent", label: "LAST" },
      { value: "top-performing", label: "BEST" },
     ],
    },
   }}
   legendLayout={{
    right: (
     <div className="flex items-center gap-2 justify-self-start">
      <div className="relative flex items-center h-5 w-[90px]">
       <div className="absolute left-[2px] right-[2px] top-1/2 -translate-y-1/2 h-2 bg-[#FF7497]" />
       <div className="flex items-center justify-between w-full relative z-10">
        <div className="w-4 h-4 bg-[#FF7497] border-[2px] rounded-full border-black" />
        <div className="w-4 h-4 bg-[#FF7497] border-[2px] rounded-full border-black" />
        <div className="w-4 h-4 bg-[#FF7497] border-[2px] rounded-full border-black" />
       </div>
      </div>
      <span className="font-[1000] text-[12px] tracking-tight uppercase">Selected</span>
     </div>
    ),
   }}
   footer={
    <InsightMarquee
     mode="insight-lock"
     segments={[
      { badge: "Chart Insight", text: "Engagement Pulse reveals how each video drives different interaction types — spot which content triggers comments vs. passive likes.", badgeTone: "cyan" },
      { badge: "Personal Insight", text: cd.length > 0 ? `Sorted by ${sortLabel.toLowerCase()}: your #1 video pulled ${(activeRow as any)?.[sortMetric] ?? 0} ${sortLabel.toLowerCase()}. Switch metric chips to rearrange the full ranking.` : "Sync data to unlock engagement insights.", badgeTone: "lime" },
     ]}
    />
   }
  >
   <div className="min-h-[400px] w-full bg-white p-0 overflow-hidden flex flex-col">
    <div className="h-[400px] relative">
     <StableChartFrame minHeightClassName="min-h-[400px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
         tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }}
         axisLine={{ stroke: '#000', strokeWidth: 3 }}
         tickLine={false}
        />
        <YAxis
         yAxisId="left"
         domain={[0, leftMax]}
         tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }}
         axisLine={{ stroke: '#000', strokeWidth: 3 }}
         tickLine={false}
         label={{
          value: 'COMMENTS • SHARES • SUBS',
          angle: -90,
          position: 'insideLeft',
          offset: 5,
          style: { fontWeight: 1000, fontSize: 10, fill: '#000', letterSpacing: '0.05em', textAnchor: 'middle' },
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
          value: 'LIKES',
          angle: 90,
          position: 'insideRight',
          offset: 15,
          style: { fontWeight: 1000, fontSize: 12, fill: '#FF7497', letterSpacing: '0.05em', textAnchor: 'middle' },
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
           dot={m.key === sortMetric ? { r: 4, fill: m.color, stroke: '#000', strokeWidth: 2 } : false}
           activeDot={{ r: 6, fill: m.color, stroke: '#000', strokeWidth: 2 }}
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
      </ResponsiveContainer>
     </StableChartFrame>
    </div>
   </div>
  </SubToolboxChartModule>
 )
}

/* 6. Packaging */
export const Packaging: React.FC<GChartProps> = ({ data }) => {
 const cd = useMemo(() => [...data].slice(0,20).map(r => ({
  title: r.title, imp: mv(r,"impressions"), ctr: +mv(r,"ctr").toFixed(1), views: mv(r,"views"),
  format: r.format
 })).filter(d=>d.imp>0&&d.ctr>0), [data])
 return (
  <Card title="PACKAGING" subtitle="CTR × Impressions" headerColor="#FFEA00" count={cd.length}>
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
 const cd = useMemo(
  () =>
   [...data]
    .sort((a, b) => mv(b, "likes") - mv(a, "likes"))
    .slice(0, 15)
    .map((r) => ({
     name: r.title.substring(0, 28),
     likes: mv(r, "likes"),
     comments: mv(r, "comments"),
     shares: mv(r, "shares"),
    })),
  [data],
 )
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
  <Card title="PERFORMANCE TREND" subtitle="Views vs. Subs Trends" headerColor="#FFEA00">
   <ComposedChart data={cd} margin={{top:10,right:10,left:-10,bottom:0}}>
    <CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date" tick={{fontSize:9,fontWeight:900}}/>
    <YAxis yAxisId="l" tick={{fontSize:10,fontWeight:900}}/><YAxis yAxisId="r" orientation="right" tick={{fontSize:10,fontWeight:900}}/>
    <Tooltip content={<ChartTip/>}/>
    <Area yAxisId="l" type="monotone" dataKey="views" fill="#FF749730" stroke="#FF7497" strokeWidth={2} name="Views"/>
    <Line yAxisId="r" type="monotone" dataKey="subs" stroke="#00E5FF" strokeWidth={3} dot={false} name="Subs"/>
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
    <Tooltip content={<ChartTip/>}/><Area type="monotone" dataKey="subs" fill="#CCFF00" stroke="#000" strokeWidth={2} name="Subs Gained"/></AreaChart>
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
   { subject:"Subs", A: +avg("subscribersGained").toFixed(0), max: 50 },
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
 const cd = useMemo(() => [...data].sort((a,b)=>mv(b,"avp")-mv(a,"avp")).slice(0,10)
  .map(r => ({ name: r.title.substring(0,20), avp: +mv(r,"avp").toFixed(1) })).filter(d=>d.avp>0), [data])
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
   controlBox={{ count: cd.length, countUnit: "VIDEOS" }}
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
 const cd = useMemo(() => [...data].sort((a,b) => new Date(a.uploadDate).getTime()-new Date(b.uploadDate).getTime())
  .slice(-14).map(r => ({ title: r.title.substring(0,15), views: mv(r,"views"),
   subs: mv(r,"subscribersGained"), rev: +mv(r,"revenue").toFixed(2), shares: mv(r,"shares") })), [data])
 return (
  <div className="bg-[#111] border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] overflow-hidden">
   <div className="border-b-[4px] border-black px-5 py-3 bg-black flex justify-between items-center">
    <span className="font-[900] text-lg uppercase text-[#CCFF00]">GROWTH PULSE</span>
    <span className="text-[10px] text-gray-500 font-bold">Views × Subs × Revenue × Shares — Last 14</span>
   </div>
   <div className="p-4 h-[360px]">
    <StableChartFrame minHeightClassName="min-h-[260px]">
     <LineChart data={cd} margin={{top:10,right:10,left:-10,bottom:0}}>
      <CartesianGrid strokeDasharray="3 3" stroke="#333"/><XAxis dataKey="title" tick={{fill:"#666",fontSize:8,fontWeight:900}}/>
      <YAxis tick={{fill:"#666",fontSize:10}}/><Tooltip content={<ChartTip/>}/>
      <Line type="monotone" dataKey="views" stroke="#FF7497" strokeWidth={3} dot={false} name="Views"/>
      <Line type="monotone" dataKey="subs" stroke="#00E5FF" strokeWidth={3} dot={false} name="Subs"/>
      <Line type="monotone" dataKey="rev" stroke="#FFEA00" strokeWidth={3} dot={false} name="Revenue"/>
      <Line type="monotone" dataKey="shares" stroke="#CCFF00" strokeWidth={3} dot={false} name="Shares"/>
      <Legend wrapperStyle={{fontSize:"10px",fontWeight:900}}/>
     </LineChart>
    </StableChartFrame>
   </div>
  </div>
 )
 }

export const StackedEngagementPulse = EngagementLinesModule

/* 16. Format Comparison Donuts */
export const FormatComparisonDonuts: React.FC<GChartProps> = ({ data }) => {
 const [localWindow, setLocalWindow] = useState<"28d" | "90d" | "lifetime">("lifetime")
 const [windowOpen, setWindowOpen] = useState(false)

 const filteredData = useMemo(() => {
  if (localWindow === "lifetime") return data
  const now = new Date().getTime()
  const days = localWindow === "28d" ? 28 : 90
  const threshold = now - (days * 24 * 60 * 60 * 1000)
  return data.filter((r) => new Date(r.uploadDate || 0).getTime() > threshold)
 }, [data, localWindow])

 const cd = useMemo(() => {
  const metrics = [
   { key: "watchHours", label: "Watch Hrs" },
   { key: "revenue", label: "Revenue" },
   { key: "subscribersGained", label: "Subscribers" },
   { key: "views", label: "Views" },
  ]

  return metrics.map((m) => {
   const longTotal = filteredData
    .filter((r) => r.format === "long" || r.format === "unknown")
    .reduce((acc, r) => acc + mv(r, m.key), 0)
   const shortsTotal = filteredData
    .filter((r) => r.format === "shorts")
    .reduce((acc, r) => acc + mv(r, m.key), 0)

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
 }, [filteredData])

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
   controlBox={{
    count: filteredData.length,
    countUnit: "VIDEOS",
    dropdown: {
     value: localWindow,
     isOpen: windowOpen,
     onToggle: () => setWindowOpen(!windowOpen),
     onSelect: (v) => {
      setLocalWindow(v as any)
      setWindowOpen(false)
     },
     options: [
      { value: "28d", label: "28 DAYS" },
      { value: "90d", label: "90 DAYS" },
      { value: "lifetime", label: "LIFETIME" },
     ],
    },
   }}
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
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
            const x = cx + radius * Math.cos(-midAngle * RADIAN)
            const y = cy + radius * Math.sin(-midAngle * RADIAN)
            return (
             <text
              x={x}
              y={y}
              fill="white"
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[16px] font-[1000] tabular-nums"
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
         </PieChart>
        </ResponsiveContainer>
       </StableChartFrame>
      </div>
      <div className="h-8 flex items-center justify-center">
       <span className="text-[12px] font-[1000] uppercase tracking-[0.11em] text-black">
        {metric.label}
       </span>
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
export const RevenueEfficiency: React.FC<GChartProps> = ({ data }) => {
  const [mode, setMode] = useState<"top-performing" | "most-recent">("top-performing")
  const [modeMenuOpen, setModeMenuOpen] = useState(false)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  const cd = useMemo(() => {
    const raw = data
      .map(r => ({
        title: r.title,
        wh: +mv(r, "watchHours").toFixed(1),
        rpm: +(mv(r, "revenue") / (mv(r, "views") / 1000 || 1)).toFixed(2),
        views: mv(r, "views"),
        rev: mv(r, "revenue"),
        uploadTs: new Date(String(r.uploadDate || "")).getTime() || 0,
      }))
      .filter(d => d.wh > 0 && d.rpm > 0)

    const points = mode === "most-recent" 
      ? [...raw].sort((a, b) => b.uploadTs - a.uploadTs).slice(0, 50)
      : [...raw].sort((a, b) => b.rev - a.rev).slice(0, 50)

    const maxRev = Math.max(1, ...points.map(d => d.rev))
    const minRev = Math.min(...points.map(d => d.rev))
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    return points.map(d => {
      const key = `${d.title}-${d.uploadTs}-${d.rev}`
      const revT = maxRev > minRev ? (d.rev - minRev) / (maxRev - minRev) : 0.5
      const radius = lerp(4, 25, Math.pow(revT, 0.5))
      const c = {
        r: Math.round(lerp(0, 204, revT)),
        g: Math.round(lerp(229, 255, revT)),
        b: Math.round(lerp(255, 0, revT)),
      }

      return {
        ...d,
        key,
        radius,
        color: `rgb(${c.r}, ${c.g}, ${c.b})`
      }
    })
  }, [data, mode])

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

  const activePoint = cd.find(p => p.key === hoveredKey) || cd[0]

  return (
    <SubToolboxChartModule
      header={{
        title: "REVENUE EFFICIENCY",
        subtitle: "WATCH HOURS × RPM DYNAMICS",
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
        count: cd.length,
        countUnit: "VIDEOS",
        dropdown: {
          value: mode,
          isOpen: modeMenuOpen,
          onToggle: () => setModeMenuOpen((prev) => !prev),
          onSelect: (val) => {
            setMode(val as any)
            setModeMenuOpen(false)
          },
          options: [
            { value: "top-performing", label: "BEST" },
            { value: "most-recent", label: "LAST" }
          ]
        }
      }}
      activeContext={{
        title: activePoint?.title?.toUpperCase() || "SELECT DATA POINT",
        stats: [
          { label: "RPM", value: `$${activePoint?.rpm.toFixed(2)}`, tone: "lime" },
          { label: "WATCH HRS", value: activePoint?.wh.toLocaleString(), tone: "cyan" },
          { label: "TOTAL REVENUE", value: `$${activePoint?.rev.toFixed(2)}`, tone: "yellow" }
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
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <ScatterChart 
                margin={{ top: 20, right: 30, bottom: 28, left: 10 }}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={true} />
                <XAxis 
                  type="number" 
                  dataKey="wh" 
                  name="Watch Hours" 
                  tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }}
                  axisLine={{ stroke: '#000', strokeWidth: 3 }}
                  tickLine={false}
                />
                <YAxis 
                  type="number" 
                  dataKey="rpm" 
                  name="RPM" 
                  tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }}
                  axisLine={{ stroke: '#000', strokeWidth: 3 }}
                  tickLine={false}
                  label={{ 
                    value: 'RPM ($)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    offset: 15, 
                    style: { fontWeight: 1000, fontSize: 14, fill: '#000', letterSpacing: '0.1em', textAnchor: 'middle' } 
                  }}
                />
                <Tooltip content={<ChartTip />} />
                <Scatter data={cd} shape={bubbleShape} />
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
            </ResponsiveContainer>
          </StableChartFrame>
          
          <div className="absolute bottom-[0px] left-[14px] right-[14px] grid grid-cols-3 items-center pointer-events-none">
            <div className="flex items-center gap-2 justify-self-end">
              <span className="text-[14px] font-[1000] uppercase tracking-[0.05em] text-black">Revenue</span>
              <div className="w-36 h-6 border-[2px] border-black rounded-[2px] bg-[#CCFF00]" />
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
                <span className="w-2 aspect-square shrink-0 box-border rounded-full bg-white border border-[#00E5FF]" />
                <span className="w-3 aspect-square shrink-0 box-border rounded-full bg-white border border-[#66FF8A]" />
                <span className="w-4 aspect-square shrink-0 box-border rounded-full bg-white border border-[#CCFF00]" />
                <span className="w-5 aspect-square shrink-0 box-border rounded-full bg-white border border-[#EBE357]" />
                <span className="w-6 aspect-square shrink-0 box-border rounded-full bg-white border border-[#FFD700]" />
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

  const formatMetricValue = (val: number) => {
    if (activeMetric.isRevenue) {
      if (!Number.isFinite(val)) return "$0.00"
      return `$${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    }
    return formatCompact(val)
  }

  const chartData = useMemo(() => {
    const now = new Date()
    const rangeStart = new Date(now)
    rangeStart.setMonth(rangeStart.getMonth() - activeTimeRange.months)
    
    // Filter rows inside selected window
    const scopedRows = data.filter(r => {
      const d = new Date(String(r.uploadDate || ""))
      return d >= rangeStart && d <= now
    })

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
  }, [data, metric, activeTimeRange.months])

  const periodRangeLabel = useMemo(() => {
    if (chartData.length === 0) return "No period range"
    const start = chartData[0]?.start
    const end = chartData[chartData.length - 1]?.start
    if (!(start instanceof Date) || !(end instanceof Date)) return "No period range"
    const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "long", day: "numeric" })
    return `${fmt(start)} through ${fmt(end)}`
  }, [chartData])

  const periodAverage = useMemo(() => {
    if (chartData.length === 0) return 0
    const total = chartData.reduce((acc, curr) => acc + curr.periodAmount, 0)
    return total / chartData.length
  }, [chartData])

  const selectedTotal = useMemo(
    () => chartData[chartData.length - 1]?.totalProgress || 0,
    [chartData],
  )

  return (
    <SubToolboxChartModule
      header={{
        title: "CHANNEL PROGRESS",
        subtitle: "",
        icon: <CustomIcon name="analytics" size={18} />,
      }}
      theme={{
        headerBandBg: "#FF82B0",
        iconBlockBg: "#26C7EC",
        shadowColor: "rgba(255,130,176,0.45)",
      }}
      controlBox={{
        count: data.length,
        countLabel: "CHANNEL TOTAL",
        countUnit: "VIDEOS",
        rightInlineControls: (
         <div className="flex flex-col gap-1 mr-1 w-[210px] max-w-full">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="h-7 px-2 rounded-md border-[2px] border-black bg-white text-[9px] font-black uppercase tracking-[0.08em]"
          >
            {METRIC_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "2y" | "1y" | "6m" | "3m")}
            className="h-7 px-2 rounded-md border-[2px] border-black bg-white text-[9px] font-black uppercase tracking-[0.08em]"
          >
            {TIME_RANGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
         </div>
        ),
      }}
      activeContext={{
        title: (
          <div className="flex items-center justify-between h-full px-2 w-full gap-3">
            <div className="flex items-center min-w-0">
              <span className="text-[13px] font-[1000] uppercase tracking-[0.08em]">TIME PERIOD</span>
              <span className="mx-2 h-6 border-r-[3px] border-black" />
              <span className="text-[15px] font-[1000] uppercase tracking-tight truncate">
                {hoveredIdx !== null
                  ? `${chartData[hoveredIdx]?.name || ""} through ${chartData[hoveredIdx]?.end?.toLocaleDateString(undefined, { month: "short", day: "numeric" }) || ""}`
                  : periodRangeLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-7 px-2 border-[2px] border-black rounded-md bg-white text-[10px] font-black uppercase tracking-[0.08em] inline-flex items-center gap-2">
                <span>PERIOD AVG</span>
                <span>{formatMetricValue(periodAverage)}</span>
              </div>
              <div className="h-7 px-2 border-[2px] border-black rounded-md bg-white text-[10px] font-black uppercase tracking-[0.08em] inline-flex items-center gap-2">
                <span>TOTAL</span>
                <span>{formatMetricValue(selectedTotal)}</span>
              </div>
            </div>
          </div>
        ),
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
            <YAxis yAxisId="left" tick={{ fontWeight: 900, fontSize: 10 }} tickFormatter={(v) => formatMetricValue(Number(v || 0))} axisLine={{ stroke: '#000', strokeWidth: 3 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontWeight: 900, fontSize: 10 }} tickFormatter={(v) => formatMetricValue(Number(v || 0))} axisLine={{ stroke: '#000', strokeWidth: 3 }} label={{ value: `${activeMetric.label} PROGRESS`, angle: 90, position: 'insideRight', offset: 15, style: { fontWeight: 1000, fontSize: 12, fill: '#000' } }} />
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
 const s = sourceRaw.toUpperCase()
 if (s.startsWith("EXT_URL.")) return "External"
 if (s.startsWith("YT_SEARCH.")) return "YouTube Search"
 if (s.startsWith("YT_RELATED.")) return "Suggested Videos"
 if (s.startsWith("SHORTS_CONTENT_LINKS.")) return "Shorts Links"
 return sourceRaw || "Other"
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
  { name: "Subs", value: totals.subs, tone: "white" },
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

export const TrafficSourceEvolutionModule: React.FC<GChartProps> = ({ data }) => {
 const ds = useMemo(() => buildExpansionDatasets(data), [data])
 const keys = Array.from(new Set(ds.trafficTimeline.flatMap((t) => Object.keys(t.shares)))).slice(0, 5)
 const areaData = ds.trafficTimeline.map((t) => {
  const total = Math.max(1, Object.values(t.shares).reduce((a, b) => a + b, 0))
  const out: Record<string, string | number> = { bucket: t.bucket }
  keys.forEach((k) => {
   out[k] = ((t.shares[k] || 0) / total) * 100
  })
  return out
 })
 const latest = areaData[areaData.length - 1] as Record<string, number | string> | undefined
 const previous = areaData[areaData.length - 2] as Record<string, number | string> | undefined
 return (
  <SubToolboxChartModule header={{ title: "TRAFFIC SOURCE EVOLUTION", subtitle: "SOURCE MIX OVER TIME", icon: <CustomIcon name="analytics" size={18} /> }} theme={{ headerBandBg: "#B8FF2C", iconBlockBg: "#24D3FF", shadowColor: "rgba(184,255,44,0.45)" }}>
   <div className="min-h-[400px] w-full bg-white p-4 overflow-hidden flex flex-col">{keys.length === 0 ? <EmptyState missing={ds.diagnostics.missing} rows={ds.diagnostics.rows} /> : (
    <div className="flex flex-col gap-3">
     <div className="grid grid-cols-2 xl:grid-cols-5 gap-2">
      {keys.map((k, i) => {
       const now = Number(latest?.[k] || 0)
       const prev = Number(previous?.[k] || 0)
       const delta = now - prev
       return (
        <div key={k} className="border-[3px] border-black rounded-xl bg-white px-3 py-2 shadow-[3px_3px_0px_0px_black]">
         <p className="text-[10px] font-black uppercase tracking-[0.12em]">{k}</p>
         <p className="text-[30px] leading-[0.9] font-[1000]">{now.toFixed(0)}%</p>
         <p className={`text-[12px] font-black ${delta >= 0 ? "text-green-600" : "text-red-600"}`}>{delta >= 0 ? "+" : ""}{delta.toFixed(0)}pp</p>
        </div>
       )
      })}
     </div>
     <div className="h-[310px] border-[3px] border-black rounded-xl bg-[#f5f5f0] p-2 overflow-hidden">
      <StableChartFrame minHeightClassName="min-h-[280px]">
       <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <AreaChart data={areaData}>
         <CartesianGrid strokeDasharray="3 3" />
         <XAxis dataKey="bucket" tick={{ fontSize: 10, fontWeight: 900 }} />
         <YAxis tick={{ fontSize: 10, fontWeight: 900 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
         <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
         {keys.map((k, i) => <Area key={k} type="monotone" dataKey={k} stackId="1" stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.9} />)}
        </AreaChart>
       </ResponsiveContainer>
      </StableChartFrame>
     </div>
    </div>
   )}</div>
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
 if (metricKey === "subscribersGained") return "SUBS"
 if (metricKey === "engagedViews") return "ENGAGED"
 if (metricKey === "impressions") return "IMPRSNS"
 if (metricKey === "revenue") return "REV"
 return getKeywordMetricDefinition(metricKey).label
}

const keywordBadgeStyle = (index: number, active: boolean): React.CSSProperties => ({
 background: active ? KEYWORD_VENN_COLORS[index % KEYWORD_VENN_COLORS.length] : "#fff",
 boxShadow: active ? "2px 2px 0 0 #000" : "1px 1px 0 0 rgba(0,0,0,0.18)",
})

const keywordColorIndexForSelection = (selected: string[], keyword: string, fallback = 0): number => {
 const selectedIndex = selected.indexOf(keyword)
 return selectedIndex >= 0 ? selectedIndex : fallback
}

const keywordVennBadge = (label: string, index: number) => (
 <span
  key={`${label}-${index}`}
  className="inline-flex items-center h-6 px-2.5 border-[2px] border-black rounded-md text-[10px] font-black uppercase tracking-[0.08em]"
  style={{ background: KEYWORD_VENN_COLORS[index % KEYWORD_VENN_COLORS.length] }}
 >
  {label}
 </span>
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
}> = ({ x, y, title, count, metricValue, metricKey, small = false, intersection = false }) => (
 <g>
  {title ? (
   <text
    x={x}
    y={y - (small ? 16 : 24)}
    textAnchor="middle"
    style={{ fontSize: small ? 16 : 22, fontWeight: 900, fill: "#000" }}
   >
    {title}
   </text>
  ) : null}
  <text
   x={x}
   y={y + (intersection ? -4 : small ? 4 : 0)}
   textAnchor="middle"
   style={{ fontSize: small ? 22 : 34, fontWeight: 1000, fill: "#000" }}
  >
   {intersection ? count : `${count} videos`}
  </text>
  <text
   x={x}
   y={y + (intersection ? 18 : small ? 24 : 26)}
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
 const [selected, setSelected] = useState<string[]>([])
 const [metricMode, setMetricMode] = useState<KeywordMetricKey>("views")
 const [metricMenuOpen, setMetricMenuOpen] = useState(false)
 const [rankedByMode, setRankedByMode] = useState<"average" | "total">("average")

 const ranked = useMemo(
  () =>
   buildKeywordClustersFromMasterRows(
    data as unknown as Record<string, unknown>[],
    metricMode,
    { minSupport: 2, maxKeywords: 15 },
   ),
  [data, metricMode],
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
 const selectedMetric = getKeywordMetricDefinition(metricMode)
 const a = selected[0]
 const b = selected[1]
 const c = selected[2]
 const singles = combinationRows.filter((item) => item.keywords.length === 1)
 const pairs = combinationRows.filter((item) => item.keywords.length === 2)
 const triple = combinationRows.find((item) => item.keywords.length === 3) || null
 const pairAB = pairs.find((item) => item.keywords[0] === a && item.keywords[1] === b) || null
 const pairAC = pairs.find((item) => item.keywords[0] === a && item.keywords[1] === c) || null
 const pairBC = pairs.find((item) => item.keywords[0] === b && item.keywords[1] === c) || null
 const singleA = singles.find((item) => item.keywords[0] === a) || null
 const singleB = singles.find((item) => item.keywords[0] === b) || null
 const singleC = singles.find((item) => item.keywords[0] === c) || null
 const rankedMax = Math.max(1, ranked[0]?.metricValue || 1)
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
  setSelected((prev) => toggleKeywordSelection(prev, keyword, 3))
 }

 const top10Videos = useMemo(() => {
  if (selected.length === 0) return []
  const allVideos = buildKeywordVideoRows(data as unknown as Record<string, unknown>[])
  const matched = allVideos.filter(v => selected.every(k => v.keywords.includes(k)))
  return matched.sort((a, b) => b.metrics[metricMode] - a.metrics[metricMode]).slice(0, 10)
 }, [data, selected, metricMode])

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
   controlBox={{
    count: selected.length,
    countUnit: "KEYWORDS",
    dropdown: {
     value: metricMode,
     isOpen: metricMenuOpen,
     onToggle: () => setMetricMenuOpen((prev) => !prev),
     onSelect: (value) => {
      setMetricMode(value as KeywordMetricKey)
      setMetricMenuOpen(false)
     },
     options: KEYWORD_VENN_METRIC_OPTIONS.map((option) => ({
      value: option,
      label: getKeywordMetricDefinition(option).label,
     })),
    },
   }}
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
   <div className="w-full bg-white p-2 overflow-hidden flex flex-col h-[820px]">
    {topKeywords.length === 0 ? (
     <EmptyState missing={["keywords", "title_rows"]} rows={data.length} />
    ) : (
     <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-2 h-full min-h-0">
      <div className="flex flex-col gap-2 min-h-0 overflow-y-auto pr-1 pb-4">
      
      {/* 1. VENN CIRCLE */}
      <div className="border-[3px] border-black rounded-xl bg-[#FAFAFA] overflow-hidden shrink-0 h-[460px] flex items-center justify-center">
       <svg viewBox="0 0 620 520" className="max-w-[700px] h-full object-contain">
        <defs>
         <clipPath id={`${vennId}-two-a`}>
          <circle cx="185" cy="260" r="190" />
         </clipPath>
         <clipPath id={`${vennId}-two-b`}>
          <circle cx="435" cy="260" r="190" />
         </clipPath>
         <clipPath id={`${vennId}-three-a`}>
          <circle cx="310" cy="165" r="160" />
         </clipPath>
         <clipPath id={`${vennId}-three-b`}>
          <circle cx="190" cy="350" r="160" />
         </clipPath>
         <clipPath id={`${vennId}-three-c`}>
          <circle cx="430" cy="350" r="160" />
         </clipPath>
        </defs>
        {selected.length === 0 ? (
         <>
          <text x="310" y="236" textAnchor="middle" style={{ fontWeight: 1000, fontSize: 34, fill: "rgba(0,0,0,0.28)" }}>
           SELECT UP TO 3 KEYWORDS
          </text>
          <text x="310" y="274" textAnchor="middle" style={{ fontWeight: 800, fontSize: 16, fill: "rgba(0,0,0,0.34)" }}>
           Data is derived from titles in the loaded master video table.
          </text>
        </>
        ) : null}

        {selected.length === 1 && singleA ? (
         <>
          <circle cx="310" cy="260" r="182" fill={KEYWORD_VENN_FILLS[0]} stroke={KEYWORD_VENN_STROKES[0]} strokeWidth="6" />
          <VennValueLabel
           x={310}
           y={260}
           title={a.toUpperCase()}
           count={singleA.videoCount}
           metricValue={singleA.metricValue}
           metricKey={metricMode}
          />
         </>
        ) : null}

        {selected.length === 2 ? (
         <>
          <circle cx="185" cy="260" r="190" fill={KEYWORD_VENN_FILLS[0]} />
          <circle cx="435" cy="260" r="190" fill={KEYWORD_VENN_FILLS[1]} />
          <g clipPath={`url(#${vennId}-two-a)`}>
           <circle cx="435" cy="260" r="190" fill={KEYWORD_VENN_OVERLAPS.purple} />
          </g>
          <circle cx="185" cy="260" r="190" fill="none" stroke={KEYWORD_VENN_STROKES[0]} strokeWidth="5" />
          <circle cx="435" cy="260" r="190" fill="none" stroke={KEYWORD_VENN_STROKES[1]} strokeWidth="5" />
          {singleA ? (
           <VennValueLabel
            x={108}
            y={260}
            title={a.toUpperCase()}
            count={singleA.videoCount}
            metricValue={singleA.metricValue}
            metricKey={metricMode}
            small
           />
          ) : null}
          {singleB ? (
           <VennValueLabel
            x={512}
            y={260}
            title={b.toUpperCase()}
            count={singleB.videoCount}
            metricValue={singleB.metricValue}
            metricKey={metricMode}
            small
           />
          ) : null}
          {pairAB ? (
           <VennValueLabel
            x={310}
            y={260}
            count={pairAB.videoCount}
            metricValue={pairAB.metricValue}
            metricKey={metricMode}
            small
            intersection
           />
          ) : null}
         </>
        ) : null}

        {selected.length === 3 ? (
         <>
          <circle cx="310" cy="165" r="160" fill={KEYWORD_VENN_FILLS[0]} />
          <circle cx="190" cy="350" r="160" fill={KEYWORD_VENN_FILLS[1]} />
          <circle cx="430" cy="350" r="160" fill={KEYWORD_VENN_FILLS[2]} />
          <g clipPath={`url(#${vennId}-three-a)`}>
           <circle cx="190" cy="350" r="160" fill={KEYWORD_VENN_OVERLAPS.purple} />
          </g>
          <g clipPath={`url(#${vennId}-three-a)`}>
           <circle cx="430" cy="350" r="160" fill={KEYWORD_VENN_OVERLAPS.orange} />
          </g>
          <g clipPath={`url(#${vennId}-three-b)`}>
           <circle cx="430" cy="350" r="160" fill={KEYWORD_VENN_OVERLAPS.green} />
          </g>
          <g clipPath={`url(#${vennId}-three-a)`}>
           <g clipPath={`url(#${vennId}-three-b)`}>
            <circle cx="430" cy="350" r="160" fill={KEYWORD_VENN_OVERLAPS.white} />
           </g>
          </g>
          <circle cx="310" cy="165" r="160" fill="none" stroke={KEYWORD_VENN_STROKES[0]} strokeWidth="5" />
          <circle cx="190" cy="350" r="160" fill="none" stroke={KEYWORD_VENN_STROKES[1]} strokeWidth="5" />
          <circle cx="430" cy="350" r="160" fill="none" stroke={KEYWORD_VENN_STROKES[2]} strokeWidth="5" />
          {singleA ? (
           <VennValueLabel
            x={310}
            y={116}
            title={a.toUpperCase()}
            count={singleA.videoCount}
            metricValue={singleA.metricValue}
            metricKey={metricMode}
            small
           />
          ) : null}
          {singleB ? (
           <VennValueLabel
            x={110}
            y={400}
            title={b.toUpperCase()}
            count={singleB.videoCount}
            metricValue={singleB.metricValue}
            metricKey={metricMode}
            small
           />
          ) : null}
          {singleC ? (
           <VennValueLabel
            x={510}
            y={400}
            title={c.toUpperCase()}
            count={singleC.videoCount}
            metricValue={singleC.metricValue}
            metricKey={metricMode}
            small
           />
          ) : null}
          {pairAB ? (
           <VennValueLabel
            x={250}
            y={252}
            count={pairAB.videoCount}
            metricValue={pairAB.metricValue}
            metricKey={metricMode}
            small
            intersection
           />
          ) : null}
          {pairAC ? (
           <VennValueLabel
            x={370}
            y={252}
            count={pairAC.videoCount}
            metricValue={pairAC.metricValue}
            metricKey={metricMode}
            small
            intersection
           />
          ) : null}
          {pairBC ? (
           <VennValueLabel
            x={310}
            y={352}
            count={pairBC.videoCount}
            metricValue={pairBC.metricValue}
            metricKey={metricMode}
            small
            intersection
           />
          ) : null}
          {triple ? (
           <VennValueLabel
            x={310}
            y={286}
            count={triple.videoCount}
            metricValue={triple.metricValue}
            metricKey={metricMode}
            small
            intersection
           />
          ) : null}
         </>
        ) : null}
       </svg>
      </div>

      {/* 2. SIDE-BY-SIDE: Click to Select & Combination Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 shrink-0">
       
       {/* Click To Select */}
       <div className="border-[3px] border-black rounded-xl overflow-hidden bg-white flex flex-col h-[280px]">
        <div className="bg-[#BFF8FF] text-black px-4 py-2 border-b-[3px] border-black flex items-center justify-between gap-3 shrink-0">
         <span className="text-[10px] font-black uppercase tracking-[0.12em]">
          Top Keywords - Click To Select
         </span>
         <button
          onClick={() => setSelected([])}
          className="h-6 px-2.5 border-[2px] border-black rounded-md bg-white text-[10px] font-black uppercase tracking-[0.12em]"
         >
          Clear
         </button>
        </div>
        <div className="p-2 flex flex-wrap gap-1.5 overflow-y-auto">
         {topKeywords.map((item) => {
          const activeIndex = selected.indexOf(item.word)
          const active = activeIndex >= 0
         return (
           <button
            key={item.word}
            onClick={() => toggle(item.word)}
            className="inline-flex items-center gap-1.5 h-6 px-2.5 border-[2px] border-black rounded-md text-[10px] font-black uppercase tracking-[0.08em]"
            style={keywordBadgeStyle(keywordColorIndexForSelection(selected, item.word, item.rank - 1), active)}
           >
            {item.word}
            <span className="ml-1 opacity-60 text-[9px]">
             {formatKeywordMetricValue(metricMode, item.metricValue)}
            </span>
           </button>
          )
         })}
        </div>
       </div>

       {/* Combination Breakdown */}
       <div className="border-[3px] border-black rounded-xl overflow-hidden bg-white flex flex-col h-[280px]">
        <div className="bg-[#E9FF93] text-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] border-b-[3px] border-black shrink-0">
         Combination Breakdown
        </div>
        <div key={breakdownSelectionKey} className="divide-y-[2px] divide-black overflow-y-auto bg-white">
         {visibleBreakdownRows.length === 0 ? (
          <div className="px-4 py-2 text-[11px] font-black uppercase opacity-60">
           Select up to 3 keywords to see single and overlap performance.
          </div>
         ) : (
          visibleBreakdownRows.map((row) => (
           <div
            key={row.key}
            className="px-4 py-2 flex items-center justify-between gap-3"
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
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
             {row.kind === "total" ? (
              <span className="inline-flex items-center h-6 px-2.5 border-[2px] border-black rounded-md text-[10px] font-black uppercase tracking-[0.08em] bg-white">
               Total
              </span>
             ) : null}
             {row.keywords.map((keyword, index) =>
              keywordVennBadge(
               keyword.toUpperCase(),
               keywordColorIndexForSelection(selected, keyword, index),
              ),
             )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
             <span className="text-[11px] font-black uppercase">{row.videoCount} videos</span>
             <span className="text-[11px] font-black uppercase">
              {row.kind === "total" ? "Total" : selectedMetric.label}: {formatKeywordMetricValue(metricMode, row.metricValue)}
             </span>
            </div>
           </div>
          ))
         )}
        </div>
       </div>

      </div>

      {/* 3. NEW MODULE: Top 10 Videos */}
      <div className="border-[3px] border-black rounded-xl overflow-hidden bg-white shrink-0 flex flex-col">
       <div className="bg-[#FFD8E6] text-black px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] border-b-[3px] border-black shrink-0">
        Top 10 Videos {selected.length > 0 ? `Matching: ${selected.join(" + ").toUpperCase()}` : ""} — Ranked By {selectedMetric.label}
       </div>
       <div className="divide-y-[2px] divide-black">
        {top10Videos.length === 0 ? (
         <div className="px-4 py-6 text-[11px] font-black uppercase opacity-60 text-center">
          {selected.length === 0 ? "Select keywords to view top videos" : "No videos found for this combination"}
         </div>
        ) : (
         top10Videos.map((video, idx) => (
          <div key={video.rowId} className="px-4 py-3 flex items-center gap-3 bg-white">
           <div className="w-6 h-6 shrink-0 rounded-full border-[2px] border-black bg-[#CCFF00] flex items-center justify-center text-[10px] font-black">
            {idx + 1}
           </div>
           <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="text-[11px] font-black uppercase tracking-[0.05em] text-black leading-[1.6]">
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
                  className="inline-flex items-center mx-1 align-middle h-5 px-2 rounded-md text-[11px] font-black uppercase tracking-[0.05em]"
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
           </div>
           <div className="shrink-0 text-right">
            <p className="text-[16px] font-[1000]">{formatKeywordMetricValue(metricMode, video.metrics[metricMode])}</p>
            <p className="text-[9px] font-black uppercase opacity-60">{selectedMetric.label}</p>
           </div>
          </div>
         ))
        )}
       </div>
      </div>

      </div>

      {/* 4. RIGHT SIDEBAR: Ranked By */}
      <div className="flex flex-col gap-2 min-h-0">
       <div className="border-[3px] border-black rounded-xl overflow-hidden bg-white flex-1 min-h-0 flex flex-col">
        <div className="bg-[#FFD8E6] text-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] border-b-[3px] border-black flex justify-between items-center">
         <span>Ranked By {selectedMetric.label}</span>
         <div className="flex border-[2px] border-black rounded-md overflow-hidden bg-white shrink-0">
          <button onClick={() => setRankedByMode("average")} className={`px-2 py-0.5 ${rankedByMode === "average" ? "bg-[#CCFF00]" : ""}`}>AVG</button>
          <button onClick={() => setRankedByMode("total")} className={`px-2 py-0.5 border-l-[2px] border-black ${rankedByMode === "total" ? "bg-[#CCFF00]" : ""}`}>TOTAL</button>
         </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto divide-y-[2px] divide-black">
         {ranked.map((item, index) => {
         const activeIndex = selected.indexOf(item.word)
          const active = activeIndex >= 0
          const badgeColorIndex = keywordColorIndexForSelection(selected, item.word, item.rank - 1)
          
          const getValue = (key: KeywordMetricKey) => {
             const def = getKeywordMetricDefinition(key)
             if (def.aggregation === "average" || def.aggregation === "derived_average") {
                 return item.metrics[key]
             }
             if (rankedByMode === "average") {
                 return item.metrics[key] / item.videoCount
             }
             return item.metrics[key]
          }

          const renderStat = (key: KeywordMetricKey, label: string) => (
             <div key={key} className="flex flex-col border border-black/10 rounded p-1 bg-[#FAFAFA]">
               <span className="text-[8px] opacity-60 uppercase font-black">{label}</span>
               <span className="text-[10px] font-black">{formatKeywordMetricValue(key, getValue(key))}</span>
             </div>
          )

         return (
           <div
            key={item.word}
            className="px-2 py-3 flex flex-col gap-2"
            style={{ background: active ? `${KEYWORD_VENN_COLORS[badgeColorIndex % KEYWORD_VENN_COLORS.length]}30` : "#fff" }}
           >
             <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
               <span className="text-[11px] font-black opacity-55">{index + 1}</span>
               <span
                className="inline-flex items-center h-6 px-2.5 border-[2px] border-black rounded-md text-[10px] font-black uppercase tracking-[0.08em]"
                style={keywordBadgeStyle(badgeColorIndex, active)}
               >
                {item.word}
                <span className="ml-1 opacity-60 text-[9px]">
                 {formatKeywordMetricValue(metricMode, item.metricValue)}
                </span>
               </span>
              </div>
              <div className="shrink-0 text-right text-[9px] font-black uppercase opacity-60 whitespace-nowrap">
               {item.videoCount} videos · {item.coveragePct.toFixed(1)}% coverage
              </div>
             </div>
             
             <div className="grid grid-cols-4 gap-1">
               {renderStat("impressions", "IMPR")}
               {renderStat("views", "VIEWS")}
               {renderStat("engagedViews", "ENG")}
               {renderStat("subscribersGained", "SUBS")}
               {renderStat("likes", "LIKES")}
               {renderStat("comments", "CMNTS")}
               {renderStat("shares", "SHARE")}
               {renderStat("revenue", "REV")}
               {renderStat("averageViewDuration", "AVD")}
               {renderStat("averageViewPercentage", "AVP")}
               {renderStat("rpm", "RPM")}
             </div>

             <div className="h-2 rounded-full bg-black/10 overflow-hidden mt-1">
              <div
               className="h-full"
               style={{
                width: `${(item.metricValue / rankedMax) * 100}%`,
                background: active ? KEYWORD_VENN_COLORS[badgeColorIndex % KEYWORD_VENN_COLORS.length] : "#000",
               }}
              />
             </div>
           </div>
          )
         })}
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
 const max = Math.max(1, ...ds.heatmapBins.map((b) => b.value))
 return (
  <SubToolboxChartModule header={{ title: "UPLOAD TIME HEATMAP", subtitle: "WEEKDAY × HOUR DENSITY", icon: <CustomIcon name="calendar" size={18} /> }} theme={{ headerBandBg: "#FFEA00", iconBlockBg: "#24D3FF", shadowColor: "rgba(255,234,0,0.45)" }}>
   <div className="min-h-[400px] w-full bg-white p-4 overflow-hidden flex flex-col">{ds.heatmapBins.length === 0 ? <EmptyState missing={ds.diagnostics.missing} rows={ds.diagnostics.rows} /> : (
    <div className="grid grid-cols-24 gap-1 border-[3px] border-black rounded-xl p-2 bg-[#f7f7f7] h-[340px] overflow-auto">
     {Array.from({ length: 7 * 24 }).map((_, idx) => {
      const dow = Math.floor(idx / 24)
      const hour = idx % 24
      const cell = ds.heatmapBins.find((b) => b.dow === dow && b.hour === hour)
      const value = cell?.value || 0
      const alpha = value / max
      return <div key={idx} className="h-4 border border-black/20 rounded-[2px]" title={`D${dow} ${hour}:00 — ${formatCompact(value)}`} style={{ background: `rgba(0,229,255,${Math.max(0.08, alpha)})` }} />
     })}
    </div>
   )}</div>
  </SubToolboxChartModule>
 )
}

export const ConversionFunnelModule: React.FC<GChartProps> = ({ data }) => {
 const ds = useMemo(() => buildExpansionDatasets(data), [data])
 return (
  <SubToolboxChartModule header={{ title: "CONVERSION FUNNEL", subtitle: "IMPRESSIONS TO SUBS", icon: <CustomIcon name="target" size={18} /> }} theme={{ headerBandBg: "#CCFF00", iconBlockBg: "#FF82B0", shadowColor: "rgba(204,255,0,0.45)" }}>
   <div className="min-h-[400px] w-full bg-white p-4 overflow-hidden flex flex-col">{ds.funnelStages.every((s) => s.value <= 0) ? <EmptyState missing={ds.diagnostics.missing} rows={ds.diagnostics.rows} /> : (
    <div className="h-[340px] border-[3px] border-black rounded-xl bg-[#f5f5f0] p-2 overflow-hidden">
     <StableChartFrame minHeightClassName="min-h-[300px]"><ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}><BarChart data={ds.funnelStages} layout="vertical" margin={{ left: 20, right: 20 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" tick={{ fontWeight: 900, fontSize: 10 }} /><YAxis type="category" dataKey="name" tick={{ fontWeight: 900, fontSize: 10 }} width={92} /><Tooltip content={<ChartTip />} /><Bar dataKey="value">{ds.funnelStages.map((s, i) => <Cell key={s.name} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer></StableChartFrame>
    </div>
   )}</div>
  </SubToolboxChartModule>
 )
}

export const PerformanceGaugesModule: React.FC<GChartProps> = ({ data }) => {
 const ds = useMemo(() => buildExpansionDatasets(data), [data])
 return (
  <SubToolboxChartModule header={{ title: "PERFORMANCE GAUGES", subtitle: "CORE HEALTH SNAPSHOT", icon: <CustomIcon name="analytics" size={18} /> }} theme={{ headerBandBg: "#F5E44D", iconBlockBg: "#F06D98", shadowColor: "rgba(245,228,77,0.45)" }}>
   <div className="min-h-[400px] w-full bg-white p-4 overflow-hidden flex flex-col">{ds.gauges.length === 0 ? <EmptyState missing={ds.diagnostics.missing} rows={ds.diagnostics.rows} /> : (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
     {ds.gauges.map((g) => {
      const pct = Math.max(0, Math.min(100, (g.value / Math.max(g.target, 1)) * 100))
      return <div key={g.label} className="border-[3px] border-black rounded-xl p-3 bg-white"><p className="text-[11px] font-black uppercase">{g.label}</p><div className="h-3 border-[2px] border-black rounded-full mt-3 overflow-hidden"><div className="h-full" style={{ width: `${pct}%`, backgroundColor: g.tone }} /></div><p className="text-xl font-[1000] mt-2">{g.value.toFixed(2)}</p></div>
     })}
    </div>
   )}</div>
  </SubToolboxChartModule>
 )
}

export const LissajousWebModule: React.FC<GChartProps> = ({ data }) => {
 const ds = useMemo(() => buildExpansionDatasets(data), [data])
 return (
  <SubToolboxChartModule header={{ title: "LISSAJOUS WEB", subtitle: "CTR × AVP PERFORMANCE SIGNATURE", icon: <CustomIcon name="analytics" size={18} /> }} theme={{ headerBandBg: "#B14AED", iconBlockBg: "#24D3FF", shadowColor: "rgba(180,74,237,0.45)" }}>
   <div className="min-h-[400px] w-full bg-white p-4 overflow-hidden flex flex-col">{ds.lissajous.length === 0 ? <EmptyState missing={ds.diagnostics.missing} rows={ds.diagnostics.rows} /> : (
    <div className="h-[340px] border-[3px] border-black rounded-xl bg-[#060A24] p-2 overflow-hidden">
     <StableChartFrame minHeightClassName="min-h-[300px]"><ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}><ScatterChart margin={{ top: 24, right: 24, left: 8, bottom: 8 }}><CartesianGrid stroke="rgba(255,255,255,0.12)" /><XAxis type="number" dataKey="x" tick={{ fontWeight: 900, fontSize: 10, fill: "#9ca3af" }} /><YAxis type="number" dataKey="y" tick={{ fontWeight: 900, fontSize: 10, fill: "#9ca3af" }} /><Tooltip content={<ChartTip />} /><Scatter data={ds.lissajous} fill="#00E5FF" fillOpacity={0.85} /></ScatterChart></ResponsiveContainer></StableChartFrame>
    </div>
   )}</div>
  </SubToolboxChartModule>
 )
}

export const OrbitalModule: React.FC<GChartProps> = ({ data }) => {
 const ds = useMemo(() => buildExpansionDatasets(data), [data])
 return (
  <SubToolboxChartModule header={{ title: "ORBITAL", subtitle: "CONTENT CATEGORIES AS PLANETARY ORBITS", icon: <CustomIcon name="target" size={18} /> }} theme={{ headerBandBg: "#FF9900", iconBlockBg: "#B14AED", shadowColor: "rgba(180,74,237,0.45)" }}>
   <div className="min-h-[400px] w-full bg-white p-4 overflow-hidden flex flex-col">{ds.orbital.length === 0 ? <EmptyState missing={ds.diagnostics.missing} rows={ds.diagnostics.rows} /> : (
    <div className="h-[390px] border-[3px] border-black rounded-xl bg-[#020617] relative overflow-hidden">
     {[80, 110, 140].map((r) => <div key={r} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" style={{ width: `${r * 2}px`, height: `${r * 2}px` }} />)}
     <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFE857] shadow-[0_0_24px_8px_rgba(255,232,87,0.6)]" />
     {ds.orbital.map((p, i) => (
      <div key={`${p.name}-${i}`} className="absolute text-[9px] font-black uppercase px-2 py-1 rounded-full border-[2px] border-white text-white"
       style={{ left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)`, background: "rgba(2,6,23,0.8)", boxShadow: `0 0 0 2px ${p.tone}` }}
       title={`${p.name}: ${formatCompact(p.value)}`}>
       {p.name}
      </div>
     ))}
    </div>
   )}</div>
  </SubToolboxChartModule>
 )
}
