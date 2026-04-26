import React, { useMemo, useState } from "react"
import {
 AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
 BarChart, Bar, ScatterChart, Scatter, ZAxis, Legend, Cell,
 LineChart, Line, PieChart, Pie, ComposedChart, ReferenceLine,
 RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts"
import type { CanonicalVideoRow } from "../services/analyticsContract"
import { resolveMetricNumber } from "../services/canonicalMetricResolver"

const mv = (row: CanonicalVideoRow, key: string): number =>
 resolveMetricNumber(row, key as any).value || 0

export interface GChartProps { data: CanonicalVideoRow[] }

const COLORS = ["#FF3399","#00E5FF","#CCFF00","#FF9900","#9933FF","#33FF99","#FF7497","#24D3FF","#FFB158"]

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
 title: string; subtitle?: string; headerColor?: string; count?: number; children: React.ReactNode
}> = ({ title, subtitle, headerColor = "#FFEA00", count, children }) => (
 <div className="bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] overflow-hidden flex flex-col">
  <div className="border-b-[4px] border-black px-5 py-3 flex justify-between items-center" style={{ background: headerColor }}>
   <div>
    <span className="font-[900] text-lg uppercase tracking-tight">{title}</span>
    {subtitle && <span className="block text-[10px] font-bold opacity-60 uppercase">{subtitle}</span>}
   </div>
   <div className="flex items-center gap-3">
    {count !== undefined && <span className="text-sm font-black">{count} SHOWN</span>}
    <div className="w-7 h-7 bg-[#004D40] rounded border-2 border-black flex items-center justify-center cursor-pointer text-white text-xs">⤢</div>
   </div>
  </div>
  <div className="flex-1 p-4 min-h-[320px]">
   <ResponsiveContainer width="100%" height={300}>{children}</ResponsiveContainer>
  </div>
 </div>
)

/* ═══════════════════════════════════════════════
   1. VIDEO VALUE MATRIX
   ═══════════════════════════════════════════════ */
export const VideoValueMatrix: React.FC<GChartProps> = ({ data }) => {
 const [hovered, setHovered] = useState<any>(null)
 const shorts = useMemo(() => data.filter(r => r.format === "shorts").map(r => ({
  title: r.title, ctr: +mv(r,"ctr").toFixed(1), ret: +mv(r,"avp").toFixed(1), views: mv(r,"views"), format: "shorts"
 })).filter(d => d.views > 0), [data])
 const longs = useMemo(() => data.filter(r => r.format !== "shorts").map(r => ({
  title: r.title, ctr: +mv(r,"ctr").toFixed(1), ret: +mv(r,"avp").toFixed(1), views: mv(r,"views"), format: "long"
 })).filter(d => d.views > 0), [data])
 const total = shorts.length + longs.length
 return (
  <div className="bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] overflow-hidden">
   <div className="border-b-[4px] border-black px-5 py-3 flex justify-between items-center bg-[#FFEA00]">
    <span className="font-[900] text-xl uppercase">VIDEO VALUE MATRIX</span>
    <div className="flex items-center gap-3">
     <div className="text-right leading-none"><span className="font-black">{total} HIGHEST</span><br/><span className="text-[9px] font-bold opacity-60">CTR × RETENTION × VIEWS</span></div>
     <div className="w-7 h-7 bg-[#004D40] rounded border-2 border-black flex items-center justify-center text-white text-xs">⤢</div>
    </div>
   </div>
   {hovered && (
    <div className="border-b-[4px] border-black px-5 py-2 flex justify-between items-center text-sm font-bold bg-white">
     <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full border-2 border-black ${hovered.format==="shorts"?"bg-[#FF7497]":"bg-[#00E5FF]"}`}/>{hovered.title}</div>
     <div className="flex items-center gap-6">
      <div className="text-[#00E5FF] font-black">{hovered.ctr}%<br/><span className="text-[8px] text-gray-400">CTR</span></div>
      <div className="text-[#FF7497] font-black">{hovered.ret}%<br/><span className="text-[8px] text-gray-400">RETENTION</span></div>
      <div className="font-black">{hovered.views.toLocaleString()}<br/><span className="text-[8px] text-gray-400">VIEWS</span></div>
     </div>
    </div>
   )}
   <div className="flex items-center gap-4 px-5 py-1 text-[10px] font-bold text-gray-500 border-b border-gray-100">
    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FF7497]"/>SHORTS</div>
    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#00E5FF]"/>LONG-FORM</div>
    <div className="flex items-center gap-1">● ●● = VIEWS</div>
   </div>
   <div className="p-6 h-[420px] relative">
    <div className="absolute inset-x-10 inset-y-6 flex flex-col pointer-events-none z-0">
     <div className="flex-1 flex text-gray-200 font-black text-[10px] pt-1"><div className="flex-1">💎 HIDDEN GEMS</div><div className="flex-1 text-right">🏆 GOLD MINE</div></div>
     <div className="flex-1 flex items-end text-gray-200 font-black text-[10px] pb-1"><div className="flex-1">⚠️ NEEDS WORK</div><div className="flex-1 text-right">⚡ CLICKBAIT</div></div>
    </div>
    <ResponsiveContainer width="100%" height="100%">
     <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis type="number" dataKey="ctr" name="CTR" unit="%" domain={[0,10]} tick={{fontWeight:900,fontSize:11}} />
      <YAxis type="number" dataKey="ret" name="Retention" unit="%" domain={[0,150]} tick={{fontWeight:900,fontSize:11}} />
      <ZAxis type="number" dataKey="views" range={[30,600]} />
      <ReferenceLine x={5} stroke="#000" strokeWidth={1} />
      <ReferenceLine y={60} stroke="#000" strokeWidth={1} />
      <Tooltip content={<ChartTip />} />
      <Scatter name="Shorts" data={shorts} fill="#FF7497" fillOpacity={0.8} stroke="#fff" strokeWidth={1}
       onMouseEnter={(d:any)=>setHovered(d)} onMouseLeave={()=>setHovered(null)} />
      <Scatter name="Long-form" data={longs} fill="#00E5FF" fillOpacity={0.8} stroke="#fff" strokeWidth={1}
       onMouseEnter={(d:any)=>setHovered(d)} onMouseLeave={()=>setHovered(null)} />
     </ScatterChart>
    </ResponsiveContainer>
   </div>
  </div>
 )
}

/* 2. Revenue Distribution */
export const RevenueDistribution: React.FC<GChartProps> = ({ data }) => {
 const cd = useMemo(() => [...data].sort((a,b) => mv(b,"revenue")-mv(a,"revenue")).slice(0,10)
  .map(r => ({ name: r.title.substring(0,25), value: +mv(r,"revenue").toFixed(2) })).filter(d=>d.value>0), [data])
 return (
  <Card title="REVENUE DISTRIBUTION" subtitle="Top 10 — Last 90 Days" headerColor="#CCFF00" count={cd.length}>
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
  <Card title="WATCH TIME DISTRIBUTION" headerColor="#FFEA00" count={cd.length}>
   <PieChart><Pie data={cd} innerRadius="20%" outerRadius="90%" dataKey="value" stroke="#fff" strokeWidth={2}>
    {cd.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip content={<ChartTip/>}/></PieChart>
  </Card>
 )
}

/* 4. Subscribers Gained */
export const SubscribersGained: React.FC<GChartProps> = ({ data }) => {
 const cd = useMemo(() => [...data].sort((a,b) => mv(b,"subscribersGained")-mv(a,"subscribersGained")).slice(0,10)
  .map(r => ({ name: r.title.substring(0,18), value: mv(r,"subscribersGained") })).filter(d=>d.value>0), [data])
 return (
  <Card title="SUBSCRIBERS GAINED" headerColor="#FFEA00" count={cd.length}>
   <BarChart data={cd} margin={{top:10,right:10,left:-20,bottom:40}}>
    <CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" tick={{fontSize:8,fontWeight:900}} interval={0} angle={-45} textAnchor="end"/>
    <YAxis tick={{fontSize:10,fontWeight:900}}/><Tooltip content={<ChartTip/>}/><Bar dataKey="value" fill="#00E5FF" radius={[4,4,0,0]}/></BarChart>
  </Card>
 )
}

/* 5. Shorts Retention */
export const ShortsRetention: React.FC<GChartProps> = ({ data }) => {
 const cd = useMemo(() => data.filter(r=>r.format==="shorts").map(r => ({
  title: r.title, dur: r.durationSeconds, avd: +mv(r,"avp").toFixed(1)
 })).filter(d=>d.dur>0&&d.avd>0), [data])
 return (
  <Card title="SHORTS RETENTION" subtitle="AVD% × Duration" headerColor="#CCFF00" count={cd.length}>
   <ScatterChart margin={{top:10,right:10,bottom:10,left:-10}}>
    <CartesianGrid strokeDasharray="3 3"/><XAxis type="number" dataKey="dur" name="Duration (s)" tick={{fontWeight:900,fontSize:10}}/>
    <YAxis type="number" dataKey="avd" name="AVG % Viewed" tick={{fontWeight:900,fontSize:10}}/>
    <Tooltip content={<ChartTip/>}/>
    <Scatter data={cd.filter(d=>d.dur<60)} fill="#FF7497" name="<60s"/>
    <Scatter data={cd.filter(d=>d.dur>=60&&d.dur<120)} fill="#24D3FF" name="60-120s"/>
    <Scatter data={cd.filter(d=>d.dur>=120)} fill="#66FF66" name=">120s"/>
   </ScatterChart>
  </Card>
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
 const cd = useMemo(() => [...data].sort((a,b)=>mv(b,"likes")-mv(a,"likes")).slice(0,15).map(r => ({
  name: r.title.substring(0,18), likes: mv(r,"likes"), comments: mv(r,"comments"), shares: mv(r,"shares")
 })), [data])
 return (
  <Card title="ENGAGEMENT MAP" subtitle="Benchmark Engagement Signature" headerColor="#00E5FF" count={cd.length}>
   <BarChart data={cd} margin={{top:10,right:10,left:-20,bottom:40}}>
    <CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" tick={{fontSize:8,fontWeight:900}} interval={0} angle={-45} textAnchor="end"/>
    <YAxis tick={{fontSize:10,fontWeight:900}}/><Tooltip content={<ChartTip/>}/><Legend wrapperStyle={{fontSize:"10px",fontWeight:900,textTransform:"uppercase"}}/>
    <Bar dataKey="likes" name="Likes" fill="#FF7497" radius={[4,4,0,0]}/><Bar dataKey="comments" name="Comments" fill="#FFDD00" radius={[4,4,0,0]}/>
    <Bar dataKey="shares" name="Shares" fill="#9933FF" radius={[4,4,0,0]}/></BarChart>
  </Card>
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
    <ResponsiveContainer width="100%" height="100%">
     <RadarChart cx="50%" cy="50%" outerRadius="80%" data={rd}>
      <PolarGrid stroke="#444"/><PolarAngleAxis dataKey="subject" tick={{fill:"#fff",fontSize:10,fontWeight:900}}/>
      <PolarRadiusAxis tick={{fill:"#666"}}/><Radar name="Avg" dataKey="A" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.5}/>
     </RadarChart>
    </ResponsiveContainer>
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
    <ResponsiveContainer width="100%" height="100%">
     <LineChart data={cd} margin={{top:10,right:10,left:-10,bottom:0}}>
      <CartesianGrid strokeDasharray="3 3" stroke="#333"/><XAxis dataKey="title" tick={{fill:"#666",fontSize:8,fontWeight:900}}/>
      <YAxis tick={{fill:"#666",fontSize:10}}/><Tooltip content={<ChartTip/>}/>
      <Line type="monotone" dataKey="views" stroke="#FF7497" strokeWidth={3} dot={false} name="Views"/>
      <Line type="monotone" dataKey="subs" stroke="#00E5FF" strokeWidth={3} dot={false} name="Subs"/>
      <Line type="monotone" dataKey="rev" stroke="#FFEA00" strokeWidth={3} dot={false} name="Revenue"/>
      <Line type="monotone" dataKey="shares" stroke="#CCFF00" strokeWidth={3} dot={false} name="Shares"/>
      <Legend wrapperStyle={{fontSize:"10px",fontWeight:900}}/>
     </LineChart>
    </ResponsiveContainer>
   </div>
  </div>
 )
}
