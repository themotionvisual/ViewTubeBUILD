import React, { useEffect, useMemo, useRef, useState } from "react"
import "./marquee.css"
import {
 AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
 BarChart, Bar, ScatterChart, Scatter, ZAxis, Legend, Cell,
 LineChart, Line, PieChart, Pie, ComposedChart, ReferenceLine, ReferenceArea,
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

 return (
  <UnifiedChartModule
   title="VIDEO VALUE MATRIX"
   subtitle="CTR × RETENTION × VIEWS"
   headerIcon={<CustomIcon name="target" size={18} />}
   headerColor="#FFEA00"
   stats={[{ label: "VIDEOS", value: String(total) }]}
   activeVideo={
    hovered
     ? {
        title: hovered.title,
        stats: [
         { label: "CTR", value: `${hovered.ctr.toFixed(2)}%`, tone: "cyan" },
         { label: "RET", value: `${hovered.ret.toFixed(2)}%`, tone: "pink" },
         { label: "VIEWS", value: hovered.views.toLocaleString(), tone: "yellow" },
        ],
       }
     : topPoint
       ? {
          title: topPoint.title,
          stats: [
           { label: "CTR", value: `${topPoint.ctr.toFixed(2)}%`, tone: "cyan" },
           { label: "RET", value: `${topPoint.ret.toFixed(2)}%`, tone: "pink" },
           { label: "VIEWS", value: topPoint.views.toLocaleString(), tone: "yellow" },
          ],
         }
       : null
   }
   visualLegend={
    <div className="flex items-center gap-4 px-1 py-1 text-[10px] font-black text-black/65 uppercase tracking-[0.1em]">
     <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FF7497] border border-black"/>Shorts</div>
     <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#00E5FF] border border-black"/>Long</div>
     <div className="flex items-center gap-1">Bubble size = Views</div>
    </div>
   }>
  <div className="p-6 h-[420px] relative">
   <StableChartFrame minHeightClassName="min-h-[300px]">
    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
      <ReferenceArea x1={0} x2={ctrMid} y1={0} y2={retMid} fill="#F5F5F5" fillOpacity={0.6} />
      <ReferenceArea x1={ctrMid} x2={Math.ceil(maxCtr * 1.15)} y1={0} y2={retMid} fill="#EEF9FF" fillOpacity={0.6} />
      <ReferenceArea x1={0} x2={ctrMid} y1={retMid} y2={Math.ceil(maxRet * 1.1)} fill="#FFF4F8" fillOpacity={0.6} />
      <ReferenceArea x1={ctrMid} x2={Math.ceil(maxCtr * 1.15)} y1={retMid} y2={Math.ceil(maxRet * 1.1)} fill="#F4FFF4" fillOpacity={0.75} />
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis type="number" dataKey="ctr" name="CTR" unit="%" domain={[0, Math.ceil(maxCtr * 1.15)]} tick={{fontWeight:900,fontSize:11}} />
      <YAxis type="number" dataKey="ret" name="Retention" unit="%" domain={[0, Math.ceil(maxRet * 1.1)]} tick={{fontWeight:900,fontSize:11}} />
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
  </UnifiedChartModule>
 )
}

/* 2. Revenue Distribution */
export const RevenueDistribution: React.FC<GChartProps> = ({ data }) => {
 const cd = useMemo(() => [...data].sort((a,b) => mv(b,"revenue")-mv(a,"revenue")).slice(0,10)
  .map(r => ({ name: r.title.substring(0,25), value: +mv(r,"revenue").toFixed(2) })).filter(d=>d.value>0), [data])
 return (
  <Card title="REVENUE DISTRIBUTION" subtitle="Top 10 — Last 90 Days" headerColor="#CCFF00" count={cd.length} icon={<CustomIcon name="!!!REVENUE" size={18} />}>
   <PieChart><Pie data={cd} innerRadius="30%" outerRadius="90%" dataKey="value" stroke="#fff" strokeWidth={2} label={({name,value})=>`$${value}`}>
    {cd.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip content={<ChartTip/>}/></PieChart>
  </Card>
 )
}

/* 3. Watch Time Distribution */
export const WatchTimeDistribution: React.FC<GChartProps> = ({ data }) => {
 const cd = useMemo(() => [...data].sort((a,b) => mv(b,"watchHours")-mv(a,"watchHours")).slice(0,10)
  .map(r => ({ name: r.title.substring(0,25), value: +mv(r,"watchHours").toFixed(1) })).filter(d=>d.value>0), [data])
 return (
  <Card title="WATCH TIME DISTRIBUTION" headerColor="#FFEA00" count={cd.length} icon={<CustomIcon name="calendar" size={18} />}>
   <PieChart><Pie data={cd} innerRadius="20%" outerRadius="90%" dataKey="value" stroke="#fff" strokeWidth={2}>
    {cd.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip content={<ChartTip/>}/></PieChart>
  </Card>
 )
}

/* 4. Subscribers Gained */
export const SubscribersGained: React.FC<GChartProps> = ({ data }) => {
 const [mode, setMode] = useState<"subs" | "views" | "watch">("subs")
 const [open, setOpen] = useState(false)
 const menuRef = useRef<HTMLDivElement | null>(null)
 useEffect(() => {
  const handler = (event: MouseEvent) => {
   if (!menuRef.current) return
   if (!menuRef.current.contains(event.target as Node)) setOpen(false)
  }
  window.addEventListener("mousedown", handler)
  return () => window.removeEventListener("mousedown", handler)
 }, [])
 const cd = useMemo(() => {
  const metric = mode === "views" ? "views" : mode === "watch" ? "watchHours" : "subscribersGained"
  return [...data]
   .sort((a, b) => mv(b, metric) - mv(a, metric))
   .slice(0, 10)
   .map((r) => ({ name: r.title.substring(0, 18), value: mv(r, metric) }))
   .filter((d) => d.value > 0)
 }, [data, mode])
 return (
  <UnifiedChartModule
   title="SUBSCRIBERS GAINED"
   subtitle="RANKED VIDEO PERFORMANCE"
   headerIcon={<CustomIcon name="!!!SUBSCRIBERS" size={18} />}
   headerColor="#FFEA00"
   controls={
    <div ref={menuRef} className="relative w-[144px] bg-black text-[#CCFF00] border-[2px] border-black rounded-[8px] px-2 py-1 inline-flex flex-col items-center justify-center gap-1 leading-none">
     <span className="text-[40px] font-[1000] leading-none">{cd.length}</span>
     <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="h-6 w-full px-2 bg-white text-black border-[2px] border-black rounded-[4px] text-[8px] font-black uppercase tracking-[0.08em] inline-flex items-center justify-between">
      <span>{mode === "subs" ? "Subs" : mode === "views" ? "Views" : "Watch"}</span>
      <span className={`text-[9px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▼</span>
     </button>
     <span className="text-[8px] font-black uppercase tracking-[0.12em]">videos</span>
     <div className={`absolute right-[-2px] top-[calc(100%-2px)] w-[calc(100%+4px)] bg-white border-[3px] border-black border-t-0 rounded-b-[6px] overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] z-30 origin-top transition-all duration-200 ${open ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"}`}>
      {[
       { key: "subs", label: "Subscribers" },
       { key: "views", label: "Views" },
       { key: "watch", label: "Watch Hours" },
      ].map((opt) => (
       <button
        key={opt.key}
        type="button"
        onClick={() => {
         setMode(opt.key as any)
         setOpen(false)
        }}
        className="w-full h-8 px-2 text-left text-[9px] font-black uppercase tracking-[0.06em] whitespace-nowrap hover:bg-[#EEF7FF] border-t-[2px] border-black/10 first:border-t-0">
        {mode === (opt.key as any) ? "✓ " : ""}{opt.label}
       </button>
      ))}
     </div>
    </div>
   }
   stats={[]}
  >
   <div className="mx-auto max-w-[1020px] border-[3px] border-black rounded-[8px] bg-white p-2">
   <BarChart data={cd} margin={{top:10,right:10,left:-20,bottom:40}}>
    <CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" tick={{fontSize:8,fontWeight:900}} interval={0} angle={-45} textAnchor="end"/>
    <YAxis tick={{fontSize:10,fontWeight:900}}/><Tooltip content={<ChartTip/>}/><Bar dataKey="value" fill="#00E5FF" radius={[4,4,0,0]}/></BarChart>
   </div>
  </UnifiedChartModule>
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
        { value: "top-performing", label: "best" },
        { value: "most-recent", label: "last" },
      ],
    },
   }}
   activeContext={{
    title: activePoint?.title || "No video selected",
    stats: [
      {
       label: "AVD%",
       value: activePoint ? activePoint.avd.toFixed(2) : "0.00",
       tone: "lime",
      },
      {
       label: "REV",
       value: `$${activePoint ? activePoint.estIncome.toFixed(2) : "0.00"}`,
       tone: "cyan",
      },
      {
       label: "LENGTH",
       value: `${activePoint ? Math.round(activePoint.dur) : 0}s`,
       tone: "yellow",
      },
      {
       label: "VIEWS",
       value: activePoint ? Math.round(activePoint.views).toLocaleString() : "0",
       tone: "white",
      },
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
     <div className="absolute bottom-[4px] left-[14px] right-[14px] grid grid-cols-3 items-center pointer-events-none">
      <div className="flex items-center gap-2 justify-self-end">
        <span className="text-[14px] font-[1000] uppercase tracking-[0.05em] text-black">Revenue</span>
        <div className="w-36 h-6 border-[0px] border-black rounded-[2px] bg-gradient-to-r from-[#24BCFF] via-[#45DDB0] to-[#66FF8A]" />
      </div>
      <span
       className="justify-self-center uppercase tracking-[0.1em] text-black"
       style={{ fontWeight: 1000, fontSize: 14, letterSpacing: "0.1em" }}
      >
       Shorts Length
      </span>
      <div className="flex items-center gap-2 justify-self-start">
        <div className="flex items-center gap-2">
          <span className="w-2 aspect-square shrink-0 box-border rounded-full bg-white border border-[#24BCFF]" />
          <span className="w-3 aspect-square shrink-0 box-border rounded-full bg-white border border-[#2FC8EF]" />
          <span className="w-4 aspect-square shrink-0 box-border rounded-full bg-white border border-[#3AD4DF]" />
          <span className="w-5 aspect-square shrink-0 box-border rounded-full bg-white border border-[#45DDB0]" />
          <span className="w-6 aspect-square shrink-0 box-border rounded-full bg-white border border-[#66FF8A]" />
          <span className="text-[14px] font-[1000] uppercase tracking-[0.05em] text-black">Views</span>
        </div>
      </div>
     </div>
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

/* 10. Revenue Efficiency */
export const RevenueEfficiency: React.FC<GChartProps> = ({ data }) => {
 const cd = useMemo(() => data.map(r => ({
  title: r.title, wh: +mv(r,"watchHours").toFixed(1), rpm: +(mv(r,"revenue")/(mv(r,"views")/1000||1)).toFixed(2)
 })).filter(d=>d.wh>0&&d.rpm>0), [data])
 return (
  <Card title="REVENUE EFFICIENCY" subtitle="Watch Hours × RPM" headerColor="#FFEA00">
   <ScatterChart margin={{top:10,right:10,bottom:10,left:-10}}>
    <CartesianGrid strokeDasharray="3 3"/><XAxis type="number" dataKey="wh" name="Watch Hours" tick={{fontWeight:900,fontSize:10}}/>
    <YAxis type="number" dataKey="rpm" name="RPM $" tick={{fontWeight:900,fontSize:10}}/>
    <Tooltip content={<ChartTip/>}/><Scatter data={cd} fill="#FFEA00" stroke="#000" strokeWidth={2}/></ScatterChart>
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
  <Card title="HOOK EFFECTIVENESS" subtitle="30-Second Retention" headerColor="#CCFF00" count={cd.length}>
   <BarChart data={cd} layout="vertical" margin={{top:10,right:30,left:10,bottom:5}}>
    <CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" domain={[0,100]} unit="%"/>
    <YAxis dataKey="name" type="category" tick={{fontWeight:900,fontSize:9}} width={120}/>
    <Tooltip content={<ChartTip/>}/><Bar dataKey="avp" fill="#33FF99" name="AVP %" radius={[0,4,4,0]}/></BarChart>
  </Card>
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
