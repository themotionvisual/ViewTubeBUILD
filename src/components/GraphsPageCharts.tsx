import React, { useEffect, useMemo, useRef, useState } from "react"
import "./marquee.css"
import {
 AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
 BarChart, Bar, ScatterChart, Scatter, ZAxis, Legend, Cell,
 LineChart, Line, PieChart, Pie, Label, ComposedChart, ReferenceLine, ReferenceArea,
 RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
 Customized,
} from "recharts"
import type { CanonicalVideoRow } from "../services/analyticsContract"
import { resolveMetricNumber } from "../services/canonicalMetricResolver"
import { UnifiedChartModule } from "./UnifiedChartModule"
import { CustomIcon } from "./CustomIcon"
import { StableChartFrame } from "./StableChartFrame"
import { SubToolboxChartModule, subToolboxChartPresets } from "./SubToolboxChartModule"
import { InsightMarquee } from "./InsightMarquee"

const mv = (row: CanonicalVideoRow, key: string): number =>
 resolveMetricNumber(row, key as any).value || 0

export interface GChartProps { data: CanonicalVideoRow[] }

const COLORS = ["#FF3399","#00E5FF","#CCFF00","#FF9900","#9933FF","#33FF99","#FF7497","#24D3FF","#FFB158"]
const ctrPct = (row: CanonicalVideoRow): number => {
 const raw = mv(row, "ctr")
 if (!Number.isFinite(raw)) return 0
 return raw <= 1 ? raw * 100 : raw
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
 const [hovered, setHovered] = useState<any>(null)
 const shorts = useMemo(
  () =>
   data
    .filter((r) => r.format === "shorts")
    .map((r) => {
     const avp = mv(r, "avp")
     const ret = avp > 100 && r.durationSeconds > 0 ? (avp / r.durationSeconds) * 100 : avp
     return {
      title: r.title,
      ctr: +ctrPct(r).toFixed(2),
      ret: +Math.max(0, ret).toFixed(2),
      views: mv(r, "views"),
      format: "shorts",
     }
    })
    .filter((d) => d.views > 0),
  [data],
 )
 const longs = useMemo(
  () =>
   data
    .filter((r) => r.format !== "shorts")
    .map((r) => {
     const avp = mv(r, "avp")
     const ret = avp > 100 && r.durationSeconds > 0 ? (avp / r.durationSeconds) * 100 : avp
     return {
      title: r.title,
      ctr: +ctrPct(r).toFixed(2),
      ret: +Math.max(0, ret).toFixed(2),
      views: mv(r, "views"),
      format: "long",
     }
    })
    .filter((d) => d.views > 0),
  [data],
 )
 const total = shorts.length + longs.length
 const topPoint = useMemo(() => {
  const pool = [...shorts, ...longs]
  if (pool.length === 0) return null
  return [...pool].sort((a, b) => b.views - a.views)[0]
 }, [shorts, longs])
 const all = useMemo(() => [...shorts, ...longs], [shorts, longs])
 const maxCtr = useMemo(() => Math.max(3, ...all.map((p) => p.ctr)), [all])
 const maxRet = useMemo(() => Math.max(100, ...all.map((p) => p.ret)), [all])
 const ctrMid = maxCtr * 0.5
 const retMid = maxRet * 0.5
 const activePoint = hovered || topPoint

 return (
  <SubToolboxChartModule
   header={{
    title: "VIDEO VALUE MATRIX",
    subtitle: "CTR × RETENTION × VIEWS",
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
    count: total,
    countUnit: "VIDEOS",
   }}
   activeContext={{
    title: activePoint?.title?.toUpperCase().slice(0, 30) || "SELECT VIDEO",
    stats: activePoint ? [
     { label: "CTR", value: `${activePoint.ctr.toFixed(2)}%`, tone: "cyan" },
     { label: "RET", value: `${activePoint.ret.toFixed(2)}%`, tone: "pink" },
     { label: "VIEWS", value: activePoint.views.toLocaleString(), tone: "yellow" },
    ] : [],
   }}
   legendLayout={{
    left: (
     <div className="flex items-center gap-4 px-1 py-1 text-[10px] font-black text-black/65 uppercase tracking-[0.1em]">
      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FF7497] border border-black"/>Shorts</div>
      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#00E5FF] border border-black"/>Long</div>
      <div className="flex items-center gap-1">Bubble size = Views</div>
     </div>
    ),
   }}
   footer={
    <InsightMarquee
     mode="insight-lock"
     segments={[
      { badge: "Chart Insight", text: "Video Value Matrix segments your content into four performance quadrants.", badgeTone: "cyan" },
      { badge: "Personal Insight", text: "Focus on 'Hidden Gems' (Top Left) — high retention videos that need better CTR/Thumbnails.", badgeTone: "lime" },
     ]}
    />
   }
  >
   <div className="p-6 h-[420px] relative">
    <StableChartFrame minHeightClassName="min-h-[300px]">
     <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
       <ReferenceArea x1={0} x2={ctrMid} y1={0} y2={retMid} fill="#F5F5F5" fillOpacity={0.6} />
       <ReferenceArea x1={ctrMid} x2={Math.ceil(maxCtr * 1.15)} y1={0} y2={retMid} fill="#EEF9FF" fillOpacity={0.6} />
       <ReferenceArea x1={0} x2={ctrMid} y1={retMid} y2={Math.ceil(maxRet * 1.1)} fill="#FFF4F8" fillOpacity={0.6} />
       <ReferenceArea x1={ctrMid} x2={Math.ceil(maxCtr * 1.15)} y1={retMid} y2={Math.ceil(maxRet * 1.1)} fill="#F4FFF4" fillOpacity={0.75} />
       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
       <XAxis type="number" dataKey="ctr" name="CTR" unit="%" domain={[0, Math.ceil(maxCtr * 1.15)]} tick={{fontWeight:900,fontSize:11}} axisLine={{ stroke: '#000', strokeWidth: 3 }} />
       <YAxis type="number" dataKey="ret" name="Retention" unit="%" domain={[0, Math.ceil(maxRet * 1.1)]} tick={{fontWeight:900,fontSize:11}} axisLine={{ stroke: '#000', strokeWidth: 3 }} />
       <ZAxis type="number" dataKey="views" range={[30,600]} />
       <ReferenceLine x={ctrMid} stroke="#000" strokeWidth={1} />
       <ReferenceLine y={retMid} stroke="#000" strokeWidth={1} />
       <Tooltip content={<ChartTip />} />
       <Scatter name="Shorts" data={shorts} fill="#FF7497" fillOpacity={0.8} stroke="#fff" strokeWidth={1}
        onMouseEnter={(d:any)=>setHovered(d)} onMouseLeave={()=>setHovered(null)} />
       <Scatter name="Long-form" data={longs} fill="#00E5FF" fillOpacity={0.8} stroke="#fff" strokeWidth={1}
        onMouseEnter={(d:any)=>setHovered(d)} onMouseLeave={()=>setHovered(null)} />
      </ScatterChart>
     </StableChartFrame>
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
    count: cd.length,
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
  const shorts = data
   .filter((r) => r.format === "shorts")
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
   : [...shorts].sort((a, b) => b.views - a.views)

  const top100 = ranked.slice(0, 100)
  const maxA = Math.max(1, ...top100.map((d) => d.avd))
  const yTop = Math.max(100, Math.ceil(maxA / 25) * 25)
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
    avdRel: +((d.avd / maxA) * yTop).toFixed(2),
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
    <ResponsiveContainer width="100%" height={280}>
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
      <YAxis type="number" dataKey="avdRel" name="AVG % Viewed (relative)" domain={[0, cd.yTop]} tick={{fontWeight:900,fontSize:10}}/>
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
  const shorts = data
   .filter((r) => r.format === "shorts")
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
  const maxA = Math.max(1, ...top100.map((d) => d.avd))
  const yTop = Math.max(100, Math.ceil(maxA / 25) * 25)
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
    avdRel: +((d.avd / maxA) * yTop).toFixed(2),
    radius: r,
    color: `rgb(${c.r}, ${c.g}, ${c.b})`,
   }
  })

  return {
   points: [...points].sort((a, b) => b.radius - a.radius),
   yTop,
  }
 }, [data, mode])

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
        { value: "top-performing", label: "TOP PERFORMING" },
        { value: "most-recent", label: "MOST RECENT" },
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
        axisLine={{ stroke: '#000', strokeWidth: 3 }}
        tickLine={false}
        tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }}
       />
       <YAxis
        type="number"
        dataKey="avdRel"
        domain={[0, cd.yTop]}
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
   .map((r) => ({
    title: r.title,
    ctr: +ctrPct(r).toFixed(2),
    impressions: mv(r, "impressions"),
    views: mv(r, "views"),
    format: r.format,
    uploadTs: new Date(String(r.uploadDate || "")).getTime() || 0,
   }))
   .filter((d) => d.ctr > 0 && d.impressions > 0)

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
      { value: "top-performing", label: "TOP PERFORMING" },
      { value: "most-recent", label: "MOST RECENT" },
     ],
    },
   }}
   activeContext={{
    title: activePoint?.title?.toUpperCase() || "SELECT DATA POINT",
    stats: [
     { label: "CTR", value: `${activePoint?.ctr ?? 0}%`, tone: "lime", onClick: () => setSortMetric("ctr"), isActive: sortMetric === "ctr" },
     { label: "IMPRESSIONS", value: activePoint ? (activePoint.impressions >= 1000000 ? `${(activePoint.impressions / 1000000).toFixed(1)}M` : activePoint.impressions >= 1000 ? `${(activePoint.impressions / 1000).toFixed(0)}K` : String(activePoint.impressions)) : "0", tone: "purple", onClick: () => setSortMetric("impressions"), isActive: sortMetric === "impressions" },
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
      <ResponsiveContainer width="100%" height="100%">
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
      <div className="flex items-center gap-2 justify-self-start">
       <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded-full bg-[#00CCFF] border-[2px] border-black" />
        <span className="text-[14px] font-[1000] uppercase tracking-[0.05em] text-black">Shorts</span>
       </div>
      </div>
     </div>
    </div>
   </div>
  </SubToolboxChartModule>
 )
}

/* 5d. Engagement Lines Module (Comments/Likes/Shares/Subs - SubToolbox) */
const ENGAGEMENT_METRICS = [
 { key: "comments", label: "COMMENTS", color: "#00E5FF", tone: "cyan" as const },
 { key: "likes", label: "LIKES", color: "#FF7497", tone: "pink" as const },
 { key: "shares", label: "SHARES", color: "#FFE357", tone: "yellow" as const },
 { key: "subscribersGained", label: "SUBSCRIBERS", color: "#CCFF00", tone: "lime" as const },
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

  const sorted = mode === "most-recent"
   ? [...mapped].sort((a, b) => b.uploadTs - a.uploadTs)
   : [...mapped].sort((a, b) => (b as any)[sortMetric] - (a as any)[sortMetric])

  return sorted.slice(0, 50).map((d, i) => ({
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
   controlBox={{
    count: cd.length,
    countUnit: "VIDEOS",
    dropdown: {
     value: mode,
     isOpen: modeMenuOpen,
     onToggle: () => setModeMenuOpen((prev) => !prev),
     onSelect: handleModeChange,
     options: [
      { value: "most-recent", label: "MOST RECENT" },
      { value: "top-performing", label: "TOP PERFORMING" },
     ],
    },
   }}
   activeContext={{
    title: activeRow?.title?.toUpperCase().slice(0, 40) || "SELECT VIDEO",
    stats: [
     { label: "LIKES", value: String(activeRow?.likes ?? 0), tone: "pink", onClick: () => handleSortChange("likes"), isActive: sortMetric === "likes" },
     { label: "COMMENTS", value: String(activeRow?.comments ?? 0), tone: "cyan", onClick: () => handleSortChange("comments"), isActive: sortMetric === "comments" },
     { label: "SHARES", value: String(activeRow?.shares ?? 0), tone: "yellow", onClick: () => handleSortChange("shares"), isActive: sortMetric === "shares" },
     { label: "SUBS", value: String(activeRow?.subscribersGained ?? 0), tone: "lime", onClick: () => handleSortChange("subscribersGained"), isActive: sortMetric === "subscribersGained" },
    ],
   }}
   legendLayout={{
    left: (
     <div className="flex items-center gap-4 px-1 py-1 text-[10px] font-black text-black/65 uppercase tracking-[0.1em]">
      {ENGAGEMENT_METRICS.map((m) => (
       <div key={m.key} className="flex items-center gap-1">
        <div className="w-2.5 h-2.5 rounded-full border-[2px] border-black" style={{ backgroundColor: m.color }} />
        <span>{m.label}</span>
       </div>
      ))}
     </div>
    ),
   }}
   footer={
    <InsightMarquee
     mode="insight-lock"
     segments={[
      { badge: "Chart Insight", text: "Engagement Pulse reveals how each video drives different interaction types — spot which content triggers comments vs. passive likes.", badgeTone: "cyan" },
      { badge: "Personal Insight", text: cd.length > 0 ? `Sorted by ${sortLabel.toLowerCase()}: your #1 video pulled ${(activeRow as any)?.[sortMetric] ?? 0} ${sortLabel.toLowerCase()}.` : "Sync data to unlock engagement insights.", badgeTone: "lime" },
     ]}
    />
   }
  >
   <div className="min-h-[400px] w-full bg-white p-0 overflow-hidden flex flex-col">
    <div className="h-[400px] relative">
     <StableChartFrame minHeightClassName="min-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
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
        <Tooltip content={<ChartTip />} />
        <g key={animKey}>
         {ENGAGEMENT_METRICS.map((m, i) => (
          <Line
           key={`${m.key}-${animKey}`}
           yAxisId={m.key === "likes" ? "right" : "left"}
           type="monotone"
           dataKey={m.key}
           name={m.label}
           stroke={m.color}
           strokeWidth={m.key === sortMetric ? 3 : 2}
           dot={m.key === sortMetric ? { r: 4, fill: m.color, stroke: '#000', strokeWidth: 2 } : false}
           activeDot={{ r: 6, fill: m.color, stroke: '#000', strokeWidth: 2 }}
           className={`engagement-line-reveal engagement-line-delay-${i}`}
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
   <ResponsiveContainer width="100%" height={300}>
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

/* 15. Stacked Engagement Pulse */
export const StackedEngagementPulse: React.FC<GChartProps> = ({ data }) => {
 const [mode, setMode] = useState<"top-performing" | "most-recent">("top-performing")
 const [modeMenuOpen, setModeMenuOpen] = useState(false)
 const [activeKey, setActiveKey] = useState<string | null>(null)

 const cd = useMemo(() => {
  const sorted = mode === "most-recent"
   ? [...data].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
   : [...data].sort((a, b) => mv(b, "views") - mv(a, "views"))

  return sorted
   .slice(0, 50)
   .map((r, idx) => {
    const key = `${r.title}-${idx}`
    return {
     key,
     title: r.title,
     views: mv(r, "views"),
     likes: mv(r, "likes"),
     shares: mv(r, "shares"),
     comments: mv(r, "comments"),
     subs: mv(r, "subscribersGained"),
    }
   })
 }, [data, mode])

 useEffect(() => {
  if (cd.length > 0 && !activeKey) {
   setActiveKey(cd[0].key)
  }
 }, [cd, activeKey])

 const activePoint = useMemo(
  () => cd.find((p) => p.key === activeKey) || cd[0] || null,
  [cd, activeKey]
 )

 return (
  <SubToolboxChartModule
   header={{
    title: "STACKED ENGAGEMENT PULSE",
    subtitle: "LIKES • SHARES • COMMENTS • SUBS",
    headerStyle: "subtoolbox",
    icon: <CustomIcon name="target" size={18} />,
   }}
   theme={{
    headerBandBg: "#FFE357",
    iconBlockBg: "#FF7497",
    shadowColor: "rgba(255, 227, 87, 0.4)",
   }}
   layout={{ moduleMinHeight: "360px", moduleWidth: "100%" }}
   controlBox={{
    count: cd.length,
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
      { value: "top-performing", label: "best" },
      { value: "most-recent", label: "last" },
     ],
    },
   }}
   activeContext={{
    title: activePoint?.title?.toUpperCase() || "NO VIDEO SELECTED",
    stats: [
     { label: "LIKES", value: activePoint?.likes.toLocaleString() || "0", tone: "pink" },
     { label: "SHARES", value: activePoint?.shares.toLocaleString() || "0", tone: "yellow" },
     { label: "COMMENTS", value: activePoint?.comments.toLocaleString() || "0", tone: "lime" },
     { label: "SUBS", value: activePoint?.subs.toLocaleString() || "0", tone: "orange" },
    ],
   }}
   footer={
    <InsightMarquee 
      chartInsight="Stacked engagement pulse reveals the compound interaction signature of your top content."
      personalInsight="Focus on videos where 'Shares' (Yellow) spiked early to identify viral potential."
     />
   }
  >
   <div className="p-0 bg-white h-[360px] flex flex-col">
     <div className="flex-1 min-h-0 relative">
      <StableChartFrame minHeightClassName="min-h-[300px]">
       <ResponsiveContainer width="100%" height="100%">
        <BarChart data={cd} margin={{ top: 20, right: 10, left: 30, bottom: 40 }}>
         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
         <XAxis 
          dataKey="title" 
          hide={false} 
          tick={false} 
          axisLine={{ stroke: '#000', strokeWidth: 3 }}
          tickLine={false}
         />
         <YAxis 
          axisLine={{ stroke: '#000', strokeWidth: 3 }}
          tickLine={false}
          tick={{ fontWeight: 1000, fontSize: 10, fill: '#000' }} 
          label={{ 
           value: 'ENGAGEMENT', 
           angle: -90, 
           position: 'insideLeft', 
           offset: 15, 
           style: { fontWeight: 1000, fontSize: 14, fill: '#000', textAnchor: 'middle' } 
          }}
         />
         <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
         <Bar dataKey="likes" stackId="a" fill="#FF7497" onMouseEnter={(d) => setActiveKey(d.key)} />
         <Bar dataKey="shares" stackId="a" fill="#FFE357" onMouseEnter={(d) => setActiveKey(d.key)} />
         <Bar dataKey="comments" stackId="a" fill="#C9F830" onMouseEnter={(d) => setActiveKey(d.key)} />
         <Bar dataKey="subs" stackId="a" fill="#FFB158" onMouseEnter={(d) => setActiveKey(d.key)} radius={[4, 4, 0, 0]} />
        </BarChart>
       </ResponsiveContainer>
      </StableChartFrame>
      <div className="absolute bottom-[0px] left-[14px] right-[14px] grid grid-cols-3 items-center pointer-events-none">
         <div className="flex items-center gap-2 justify-self-end">
            <div className="flex items-center gap-1.5">
              <div className="w-10 h-6 bg-[#FF7497] rounded-[2px] border-[0px] border-black" />
              <span className="font-[1000] text-[14px] tracking-tight uppercase">LIKES</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-10 h-6 bg-[#FFE357] rounded-[2px] border-[0px] border-black" />
              <span className="font-[1000] text-[14px] tracking-tight uppercase">SHARES</span>
            </div>
         </div>
         <span className="justify-self-center uppercase tracking-[0.1em] text-black" style={{ fontWeight: 1000, fontSize: 14, letterSpacing: "0.1em" }}>
           Engagement Pulse
         </span>
         <div className="flex items-center gap-2 justify-self-start">
            <div className="flex items-center gap-1.5">
              <div className="w-10 h-6 bg-[#C9F830] rounded-[2px] border-[0px] border-black" />
              <span className="font-[1000] text-[14px] tracking-tight uppercase">COMMENTS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-10 h-6 bg-[#FFB158] rounded-[2px] border-[0px] border-black" />
              <span className="font-[1000] text-[14px] tracking-tight uppercase">SUBS</span>
            </div>
         </div>
      </div>
     </div>
    </div>
  </SubToolboxChartModule>
 )
}

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
   { key: "watchHours", label: "Watch Time" },
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

 const longStats = cd.map(m => ({ label: m.label.toUpperCase(), value: Math.round(m.data[0].value).toLocaleString(), tone: "cyan" as const }))
 const shortsStats = cd.map(m => ({ label: m.label.toUpperCase(), value: Math.round(m.data[1].value).toLocaleString(), tone: "pink" as const }))

 return (
  <SubToolboxChartModule
   header={{
    title: "FORMAT DOMINANCE",
    subtitle: "LONGFORM VS SHORTS SPLIT",
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
    title: (
      <div className="flex items-center justify-center h-full px-3 bg-black text-white font-[1000] text-[18px] uppercase tracking-wider flex-1 min-w-0">
        FORMAT SPLIT
      </div>
    ),
    leftTitle: "LONGFORM",
    leftStats: longStats,
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
      chartInsight="Analyzes the split between high-retention Shorts and high-value Longform content."
      personalInsight="Look for metrics where Longform (Cyan) exceeds 50% to identify core audience anchors."
     />
   }
  >
   <div className="flex flex-row items-stretch justify-center gap-2 p-2 bg-white h-[280px] overflow-hidden">
    {cd.map((metric) => (
     <div key={metric.key} className="flex-1 aspect-square h-full min-w-0 relative bg-white flex flex-col">
      <div className="flex-1 min-h-0 relative">
       <StableChartFrame minHeightClassName="min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
         <PieChart>
          <Pie
           data={metric.data}
           dataKey="value"
           nameKey="name"
           cx="50%"
           cy="50%"
           innerRadius="45%"
           outerRadius="75%"
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
              className="text-[14px] font-[1000] tabular-nums"
             >
              {Math.round(value).toLocaleString()}
             </text>
            )
           }}
          >
           {metric.data.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
           ))}
           <Label
            position="center"
            content={({ viewBox }: any) => {
             const { cx, cy } = viewBox
             const words = metric.label.toUpperCase().split(' ')
             return (
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="text-[10px] font-[1000] fill-black">
               {words.map((word, i) => (
                <tspan x={cx} dy={i === 0 ? -4 : 10} key={i}>{word}</tspan>
               ))}
              </text>
             )
            }}
           />
          </Pie>
          <Tooltip content={<ChartTip />} />
         </PieChart>
        </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height="100%">
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
  const [menuOpen, setMenuOpen] = useState(false)

  const formatK = (val: number, isRevenue: boolean) => {
    if (isRevenue) return val.toFixed(2);
    if (val >= 10000) {
      return (val / 1000).toFixed(1) + "K";
    }
    return Math.round(val).toLocaleString();
  };

  const chartData = useMemo(() => {
    const now = new Date()
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    
    // Filter for shorts in the last year
    const shorts = data.filter(r => {
      const d = new Date(String(r.uploadDate || ""))
      return r.format === "shorts" && d >= oneYearAgo && d <= now
    })

    // Create 26 buckets of 14 days
    const buckets = Array.from({ length: 26 }, (_, i) => {
      const start = new Date(oneYearAgo.getTime() + i * 14 * 24 * 60 * 60 * 1000)
      return {
        start,
        name: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        periodAmount: 0,
        totalProgress: 0
      }
    })

    shorts.forEach(r => {
      const d = new Date(String(r.uploadDate || ""))
      const diff = d.getTime() - oneYearAgo.getTime()
      const idx = Math.floor(diff / (14 * 24 * 60 * 60 * 1000))
      if (idx >= 0 && idx < 26) {
        buckets[idx].periodAmount += mv(r, metric)
      }
    })

    let runningTotal = 0
    return buckets.map(b => {
      runningTotal += b.periodAmount
      return { ...b, totalProgress: runningTotal }
    })
  }, [data, metric])

  const METRIC_OPTIONS = [
    { value: "views", label: "VIEWS", tone: "cyan" as const },
    { value: "subscribersGained", label: "SUBS", tone: "pink" as const },
    { value: "watchHours", label: "WATCH", tone: "yellow" as const },
    { value: "revenue", label: "REVENUE", tone: "lime" as const },
  ]

  const activeMetric = METRIC_OPTIONS.find(o => o.value === metric) || METRIC_OPTIONS[0]

  return (
    <SubToolboxChartModule
      header={{
        title: "CHANNEL PROGRESS",
        subtitle: "2-WEEK DELTA × CUMULATIVE TOTAL",
        icon: <CustomIcon name="analytics" size={18} />,
      }}
      theme={{
        headerBandBg: "#FF82B0",
        iconBlockBg: "#26C7EC",
        shadowColor: "rgba(255,130,176,0.45)",
      }}
      controlBox={{
        count: formatK(chartData.reduce((acc, curr) => acc + curr.periodAmount, 0), metric === "revenue"),
        countUnit: "TOTAL",
        dropdown: {
          value: metric,
          isOpen: menuOpen,
          onToggle: () => setMenuOpen(!menuOpen),
          onSelect: (val) => {
            setMetric(val)
            setMenuOpen(false)
          },
          options: METRIC_OPTIONS.map(o => ({ value: o.value, label: o.label }))
        }
      }}
      activeContext={{
        leftTitle: (
          <div className="flex items-center gap-2 h-full">
            <span className="text-[14px] font-[1000] tracking-tight">{activeMetric.label} DELTA</span>
          </div>
        ),
        leftStats: [
          { 
            label: "PERIOD AVG", 
            value: formatK(chartData.reduce((acc, curr) => acc + curr.periodAmount, 0) / 26, metric === "revenue"),
            tone: activeMetric.tone 
          },
          { 
            label: "PEAK DELTA", 
            value: formatK(Math.max(...chartData.map(d => d.periodAmount)), metric === "revenue"),
            tone: "white" 
          }
        ],
        rightStats: [
          { 
            label: "CUMULATIVE", 
            value: formatK(chartData[chartData.length - 1]?.totalProgress || 0, metric === "revenue"),
            tone: "lime" 
          }
        ]
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
          <ComposedChart data={chartData} margin={{ top: 20, right: 10, bottom: 40, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="name" tick={{ fontWeight: 900, fontSize: 10 }} axisLine={{ stroke: '#000', strokeWidth: 3 }} />
            <YAxis yAxisId="left" tick={{ fontWeight: 900, fontSize: 10 }} axisLine={{ stroke: '#000', strokeWidth: 3 }} label={{ value: 'PERIOD AMOUNT', angle: -90, position: 'insideLeft', offset: 15, style: { fontWeight: 1000, fontSize: 12, fill: '#000' } }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontWeight: 900, fontSize: 10 }} axisLine={{ stroke: '#000', strokeWidth: 3 }} label={{ value: 'PROGRESS', angle: 90, position: 'insideRight', offset: 15, style: { fontWeight: 1000, fontSize: 12, fill: '#000' } }} />
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
