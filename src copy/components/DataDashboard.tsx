import React, { useEffect, useMemo, useState } from "react"
import type {
 AnalyticsWindow,
 CanonicalMetricKey,
 CanonicalVideoRow,
} from "../services/analyticsContract"
import { getMasterRows, getMetricSummary } from "../services/analyticsSelectors"
import { applyGlobalRowFilters } from "../services/analyticsRuntime"
import { resolveMetricNumber } from "../services/canonicalMetricResolver"

type DashboardStats = {
 totalViews: number
 totalWatchTimeHours: number
 totalRevenue: number
 totalSubscribers: number
 avgCtr: number | null
 avgRpm: number | null
 avgAvd: number | null
 shortsCount: number
 longFormCount: number
 topVideos: Array<{
  videoId: string
  title: string
  views: number | null
  impressions: number | null
  ctr: number | null
  watchHours: number | null
  subsGained: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  revenue: number | null
 }>
}

const WINDOW_OPTIONS: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d", "7d"]

const metricValue = (row: CanonicalVideoRow, metricKey: CanonicalMetricKey): number | null =>
 resolveMetricNumber(row, metricKey).value

const fmtNumber = (value: number | null): string => {
 if (value === null) return "-"
 if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
 if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`
 return value.toLocaleString()
}

const fmtFixed = (value: number | null, digits = 2, suffix = ""): string => {
 if (value === null) return "-"
 return `${value.toFixed(digits)}${suffix}`
}

const DataDashboard: React.FC = () => {
 const [windowKey, setWindowKey] = useState<AnalyticsWindow>("lifetime")
 const [rows, setRows] = useState<CanonicalVideoRow[]>([])
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)

 const refresh = () => {
  setLoading(true)
  try {
   const nextRows = getMasterRows(windowKey, "api")
   const effectiveRows = applyGlobalRowFilters(nextRows).rows
   setRows(effectiveRows)
   if (effectiveRows.length === 0) {
    setError("No analytics cache found. Please run Analytics Sync first.")
   } else {
    setError(null)
   }
  } catch (fetchError) {
   setError(
    fetchError instanceof Error ? fetchError.message : "Failed to load analytics",
   )
  } finally {
   setLoading(false)
  }
 }

 useEffect(() => {
  refresh()
  const handleSync = () => refresh()
  window.addEventListener("yt_analytics_synced", handleSync)
  return () => window.removeEventListener("yt_analytics_synced", handleSync)
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [windowKey])

 const stats = useMemo<DashboardStats>(() => {
  const filteredRows = applyGlobalRowFilters(rows).rows
  const summary = getMetricSummary(windowKey, "api")
  const totalViews = summary.totals.views
  const totalWatchTimeHours = summary.totals.watchHours
  const totalRevenue = summary.totals.revenue
  const totalSubscribers = summary.totals.subscribersGained
  const topVideos = [...rows]
   .map((row) => ({
    videoId: row.videoId,
    title: row.title,
    views: metricValue(row, "views"),
    impressions: metricValue(row, "impressions"),
    ctr: metricValue(row, "ctr"),
    watchHours: metricValue(row, "watchHours"),
    subsGained: metricValue(row, "subscribersGained"),
    likes: metricValue(row, "likes"),
    comments: metricValue(row, "comments"),
    shares: metricValue(row, "shares"),
    revenue: metricValue(row, "revenue"),
   }))
   .sort((a, b) => (b.views ?? -1) - (a.views ?? -1))
   .slice(0, 8)

  const shortsCount = filteredRows.filter((row) => row.format === "shorts").length
  const longFormCount = filteredRows.filter((row) => row.format !== "shorts").length

  return {
   totalViews,
   totalWatchTimeHours,
   totalRevenue,
   totalSubscribers,
   avgCtr: summary.averages.ctr,
   avgRpm: summary.averages.rpm,
   avgAvd: summary.averages.avdSeconds,
   shortsCount,
   longFormCount,
   topVideos,
  }
 }, [rows, windowKey])

 if (loading) {
  return (
   <div className="p-8 text-center">
    <div className="text-2xl font-black uppercase tracking-tighter">Loading...</div>
   </div>
  )
 }

 if (error) {
  return (
   <div className="p-8">
    <div className="text-red-600 font-bold">Error: {error}</div>
   </div>
  )
 }

 return (
  <div className="border-[5px] border-black rounded-[48px] bg-white shadow-[12px_12px_0px_0px_black] p-6">
   <div className="flex items-center justify-between gap-3 mb-5">
    <h2 className="text-3xl font-black uppercase tracking-tighter">
     Channel Dashboard (Canonical Contract)
    </h2>
    <select
     value={windowKey}
     onChange={(event) => setWindowKey(event.target.value as AnalyticsWindow)}
     className="h-10 px-3 border-[3px] border-black rounded-xl text-[10px] font-black uppercase tracking-wider bg-white">
     {WINDOW_OPTIONS.map((windowOption) => (
      <option key={windowOption} value={windowOption}>
       {windowOption}
      </option>
     ))}
    </select>
   </div>

   <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
    <div className="border-[3px] border-black rounded-xl p-3 bg-[#F6F6F6]">
     <p className="text-[10px] font-black uppercase tracking-wider text-black/45">Views</p>
     <p className="text-2xl font-[1000]">{fmtNumber(stats.totalViews)}</p>
    </div>
    <div className="border-[3px] border-black rounded-xl p-3 bg-[#F6F6F6]">
     <p className="text-[10px] font-black uppercase tracking-wider text-black/45">Watch Hrs</p>
     <p className="text-2xl font-[1000]">{fmtFixed(stats.totalWatchTimeHours, 2)}</p>
    </div>
    <div className="border-[3px] border-black rounded-xl p-3 bg-[#F6F6F6]">
     <p className="text-[10px] font-black uppercase tracking-wider text-black/45">Revenue</p>
     <p className="text-2xl font-[1000]">${fmtFixed(stats.totalRevenue, 2)}</p>
    </div>
    <div className="border-[3px] border-black rounded-xl p-3 bg-[#F6F6F6]">
     <p className="text-[10px] font-black uppercase tracking-wider text-black/45">Subs +</p>
     <p className="text-2xl font-[1000]">{fmtNumber(stats.totalSubscribers)}</p>
    </div>
   </div>

   <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
    <div className="border-[3px] border-black rounded-xl p-3 bg-white">
     <p className="text-[10px] font-black uppercase tracking-wider text-black/45">Avg CTR</p>
     <p className="text-xl font-[1000]">{fmtFixed(stats.avgCtr, 2, "%")}</p>
    </div>
    <div className="border-[3px] border-black rounded-xl p-3 bg-white">
     <p className="text-[10px] font-black uppercase tracking-wider text-black/45">Avg RPM</p>
     <p className="text-xl font-[1000]">{fmtFixed(stats.avgRpm, 2)}</p>
    </div>
    <div className="border-[3px] border-black rounded-xl p-3 bg-white">
     <p className="text-[10px] font-black uppercase tracking-wider text-black/45">Avg AVD (Sec)</p>
     <p className="text-xl font-[1000]">{fmtFixed(stats.avgAvd, 1)}</p>
    </div>
    <div className="border-[3px] border-black rounded-xl p-3 bg-white">
     <p className="text-[10px] font-black uppercase tracking-wider text-black/45">Shorts</p>
     <p className="text-xl font-[1000]">{fmtNumber(stats.shortsCount)}</p>
    </div>
    <div className="border-[3px] border-black rounded-xl p-3 bg-white">
     <p className="text-[10px] font-black uppercase tracking-wider text-black/45">Long/Other</p>
     <p className="text-xl font-[1000]">{fmtNumber(stats.longFormCount)}</p>
    </div>
   </div>

   <div className="overflow-x-auto">
    <table className="w-full border-collapse text-sm">
     <thead>
      <tr className="bg-black text-white">
       <th className="border-[3px] border-black px-3 py-3 text-xs font-bold uppercase text-left">
        Title
       </th>
       <th className="border-[3px] border-black px-3 py-3 text-xs font-bold uppercase text-right">
        Views
       </th>
       <th className="border-[3px] border-black px-3 py-3 text-xs font-bold uppercase text-right">
        Impressions
       </th>
       <th className="border-[3px] border-black px-3 py-3 text-xs font-bold uppercase text-right">
        CTR
       </th>
       <th className="border-[3px] border-black px-3 py-3 text-xs font-bold uppercase text-right">
        Watch Hrs
       </th>
       <th className="border-[3px] border-black px-3 py-3 text-xs font-bold uppercase text-right">
        Subs +
       </th>
       <th className="border-[3px] border-black px-3 py-3 text-xs font-bold uppercase text-right">
        Likes
       </th>
       <th className="border-[3px] border-black px-3 py-3 text-xs font-bold uppercase text-right">
        Comments
       </th>
       <th className="border-[3px] border-black px-3 py-3 text-xs font-bold uppercase text-right">
        Shares
       </th>
       <th className="border-[3px] border-black px-3 py-3 text-xs font-bold uppercase text-right">
        Revenue
       </th>
      </tr>
     </thead>
     <tbody>
      {stats.topVideos.map((row, index) => (
       <tr
        key={row.videoId || `${row.title}-${index}`}
        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-pink-100`}>
        <td className="border-[3px] border-black px-3 py-3 max-w-xs truncate" title={row.title}>
         {row.title}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right font-bold">
         {fmtNumber(row.views)}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right">
         {fmtNumber(row.impressions)}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right">
         {fmtFixed(row.ctr, 2, "%")}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right font-bold">
         {fmtFixed(row.watchHours, 2)}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right font-bold">
         {fmtNumber(row.subsGained)}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right">
         {fmtNumber(row.likes)}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right">
         {fmtNumber(row.comments)}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right">
         {fmtNumber(row.shares)}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right font-bold">
         ${fmtFixed(row.revenue, 2)}
        </td>
       </tr>
      ))}
     </tbody>
    </table>
   </div>

   <div className="mt-4 text-xs text-gray-500 font-bold">
    Showing {rows.length} videos • Canonical master contract • unavailable metrics render as -
   </div>
  </div>
 )
}

export default DataDashboard
