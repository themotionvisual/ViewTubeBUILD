import React, { useMemo, useState } from "react"
import {
 ResponsiveContainer,
 LineChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 BarChart,
 Bar,
 PieChart,
 Pie,
 Cell,
 ScatterChart,
 Scatter,
 ZAxis,
} from "recharts"
import type {
 AnalyticsWindow,
 CanonicalMetricKey,
 CanonicalVideoRow,
} from "../services/analyticsContract"
import { getMasterRows, getMetricSummary } from "../services/analyticsSelectors"
import { useBrain } from "../context/GlobalDataContext"

const WINDOW_OPTIONS: AnalyticsWindow[] = ["28d", "7d", "90d", "365d", "lifetime"]

const COLORS = ["#24D3FF", "#C9F830", "#FFE357", "#FFB158", "#FF7497", "#B14AED"]

const metricValue = (
 row: CanonicalVideoRow,
 metricKey: CanonicalMetricKey,
): number => {
 const cell = row.metrics[metricKey]
 if (!cell || cell.status === "unavailable" || cell.value === null) return 0
 return cell.value
}

const formatNumber = (value: number): string => {
 if (!Number.isFinite(value)) return "-"
 if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
 if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`
 return Math.round(value).toLocaleString()
}

const formatMoney = (value: number): string => `$${value.toFixed(2)}`

const SimpleAnalytics: React.FC = () => {
 const { lastSyncComplete } = useBrain()
 const [windowKey, setWindowKey] = useState<AnalyticsWindow>("28d")

 const rows = useMemo(() => getMasterRows(windowKey, "api"), [windowKey, lastSyncComplete])
 const summary = useMemo(() => getMetricSummary(windowKey, "api"), [windowKey, lastSyncComplete])

 const tableRows = useMemo(
  () =>
   [...rows]
    .map((row, index) => ({
     id: row.videoId || `${row.title}-${index}`,
     title: row.title,
     format: row.format,
     views: metricValue(row, "views"),
     watchHours: metricValue(row, "watchHours"),
     subs: metricValue(row, "subscribersGained"),
     likes: metricValue(row, "likes"),
     comments: metricValue(row, "comments"),
     shares: metricValue(row, "shares"),
     revenue: metricValue(row, "revenue"),
     ctr: metricValue(row, "ctr"),
     avp: metricValue(row, "avp"),
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 30),
  [rows],
 )

 const formatBreakdown = useMemo(() => {
  const totals = new Map<string, number>()
  tableRows.forEach((row) => {
   totals.set(row.format, (totals.get(row.format) || 0) + row.views)
  })
  return Array.from(totals.entries()).map(([name, value]) => ({ name, value }))
 }, [tableRows])

 const topViewsSeries = useMemo(
  () =>
   tableRows.slice(0, 12).map((row, idx) => ({
    rank: `#${idx + 1}`,
    title: row.title.length > 22 ? `${row.title.slice(0, 22)}...` : row.title,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
   })),
  [tableRows],
 )

 const scatterData = useMemo(
  () =>
   tableRows.slice(0, 120).map((row) => ({
    title: row.title,
    x: row.views,
    y: row.ctr,
    z: Math.max(20, row.likes + row.comments + row.shares),
   })),
  [tableRows],
 )

 return (
  <div className="max-w-[1500px] mx-auto pb-24 px-4 space-y-6">
   <div className="flex flex-wrap items-center justify-between gap-4">
    <h1 className="text-5xl font-[1000] uppercase tracking-[calc(-0.06em)] leading-none">
     Analytics
    </h1>
    <select
     value={windowKey}
     onChange={(event) => setWindowKey(event.target.value as AnalyticsWindow)}
     className="h-11 px-4 border-[3px] border-black rounded-xl font-black uppercase text-xs bg-white">
     {WINDOW_OPTIONS.map((option) => (
      <option key={option} value={option}>
       {option}
      </option>
     ))}
    </select>
   </div>

   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
    <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black]">
     <p className="text-[10px] font-black uppercase opacity-50">Views</p>
     <p className="text-3xl font-[1000]">{formatNumber(summary.totals.views)}</p>
    </div>
    <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black]">
     <p className="text-[10px] font-black uppercase opacity-50">Watch Hours</p>
     <p className="text-3xl font-[1000]">{formatNumber(summary.totals.watchHours)}</p>
    </div>
    <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black]">
     <p className="text-[10px] font-black uppercase opacity-50">Subs Gained</p>
     <p className="text-3xl font-[1000]">{formatNumber(summary.totals.subscribersGained)}</p>
    </div>
    <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black]">
     <p className="text-[10px] font-black uppercase opacity-50">Revenue</p>
     <p className="text-3xl font-[1000]">{formatMoney(summary.totals.revenue)}</p>
    </div>
   </div>

   <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black] h-[360px]">
     <p className="text-xs font-black uppercase mb-3">Top Views (Line)</p>
     <ResponsiveContainer width="100%" height="88%">
      <LineChart data={topViewsSeries}>
       <CartesianGrid stroke="#d1d5db" strokeOpacity={0.72} />
       <XAxis dataKey="rank" />
       <YAxis />
       <Tooltip />
       <Line type="monotone" dataKey="views" stroke="#24D3FF" strokeWidth={3} dot={false} />
      </LineChart>
     </ResponsiveContainer>
    </div>

    <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black] h-[360px]">
     <p className="text-xs font-black uppercase mb-3">Engagement Mix (Bar)</p>
     <ResponsiveContainer width="100%" height="88%">
      <BarChart data={topViewsSeries}>
       <CartesianGrid stroke="#d1d5db" strokeOpacity={0.72} />
       <XAxis dataKey="rank" />
       <YAxis />
       <Tooltip />
       <Bar dataKey="likes" fill="#FF7497" />
       <Bar dataKey="comments" fill="#24D3FF" />
       <Bar dataKey="shares" fill="#FFE357" />
      </BarChart>
     </ResponsiveContainer>
    </div>
   </div>

   <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black] h-[360px]">
     <p className="text-xs font-black uppercase mb-3">Views by Format (Pie)</p>
     <ResponsiveContainer width="100%" height="88%">
      <PieChart>
       <Pie data={formatBreakdown} dataKey="value" nameKey="name" outerRadius={110}>
        {formatBreakdown.map((entry, index) => (
         <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
        ))}
       </Pie>
       <Tooltip />
      </PieChart>
     </ResponsiveContainer>
    </div>

    <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black] h-[360px]">
     <p className="text-xs font-black uppercase mb-3">Views vs CTR (Scatter)</p>
     <ResponsiveContainer width="100%" height="88%">
      <ScatterChart>
       <CartesianGrid stroke="#d1d5db" strokeOpacity={0.72} />
       <XAxis type="number" dataKey="x" name="Views" />
       <YAxis type="number" dataKey="y" name="CTR" unit="%" />
       <ZAxis type="number" dataKey="z" range={[60, 420]} />
       <Tooltip cursor={{ stroke: "#d1d5db", strokeOpacity: 0.7, strokeWidth: 1 }} />
       <Scatter data={scatterData} fill="#C9F830" />
      </ScatterChart>
     </ResponsiveContainer>
    </div>
   </div>

   <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black] overflow-x-auto">
    <p className="text-xs font-black uppercase mb-3">Master Analytics Table ({tableRows.length} rows)</p>
    <table className="w-full border-collapse text-sm">
     <thead>
      <tr className="bg-black text-white">
       <th className="border-[3px] border-black p-2 text-left">Title</th>
       <th className="border-[3px] border-black p-2 text-left">Format</th>
       <th className="border-[3px] border-black p-2 text-right">Views</th>
       <th className="border-[3px] border-black p-2 text-right">CTR</th>
       <th className="border-[3px] border-black p-2 text-right">Watch Hrs</th>
       <th className="border-[3px] border-black p-2 text-right">Subs +</th>
       <th className="border-[3px] border-black p-2 text-right">Revenue</th>
      </tr>
     </thead>
     <tbody>
      {tableRows.map((row, index) => (
       <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
        <td className="border-[3px] border-black p-2 max-w-[420px] truncate" title={row.title}>{row.title}</td>
        <td className="border-[3px] border-black p-2 uppercase">{row.format}</td>
        <td className="border-[3px] border-black p-2 text-right">{formatNumber(row.views)}</td>
        <td className="border-[3px] border-black p-2 text-right">{row.ctr.toFixed(2)}%</td>
        <td className="border-[3px] border-black p-2 text-right">{row.watchHours.toFixed(2)}</td>
        <td className="border-[3px] border-black p-2 text-right">{formatNumber(row.subs)}</td>
        <td className="border-[3px] border-black p-2 text-right">{formatMoney(row.revenue)}</td>
       </tr>
      ))}
     </tbody>
    </table>
   </div>
  </div>
 )
}

export default SimpleAnalytics
