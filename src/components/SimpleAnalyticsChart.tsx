import React, { useEffect, useMemo, useState } from "react"
import type {
 AnalyticsWindow,
 CanonicalMetricKey,
 CanonicalVideoRow,
} from "../services/analyticsContract"
import { getMasterRows } from "../services/analyticsSelectors"
import { applyGlobalRowFilters } from "../services/analyticsRuntime"
import { resolveMetricNumber } from "../services/canonicalMetricResolver"

interface VideoData {
 videoId: string
 title: string
 publishedAt: string
 views: number | null
 impressions: number | null
 ctr: number | null
 watchTimeHours: number | null
 subscribersGained: number | null
 likes: number | null
 comments: number | null
 shares: number | null
 revenue: number | null
}

const WINDOW_OPTIONS: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d", "7d"]

const metricValue = (row: CanonicalVideoRow, metricKey: CanonicalMetricKey): number | null =>
 resolveMetricNumber(row, metricKey).value

const formatNumber = (num: number | null): string => {
 if (num === null) return "-"
 if (Math.abs(num) >= 1000000) return `${(num / 1000000).toFixed(1)}M`
 if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(1)}K`
 return num.toLocaleString()
}

const formatFixed = (num: number | null, digits = 2, suffix = ""): string => {
 if (num === null) return "-"
 return `${num.toFixed(digits)}${suffix}`
}

const toVideoData = (rows: CanonicalVideoRow[]): VideoData[] => {
 return rows
  .map((row) => ({
   videoId: row.videoId,
   title: row.title,
   publishedAt: row.uploadDate,
   views: metricValue(row, "views"),
   impressions: metricValue(row, "impressions"),
   ctr: metricValue(row, "ctr"),
   watchTimeHours: metricValue(row, "watchHours"),
   subscribersGained: metricValue(row, "subscribersGained"),
   likes: metricValue(row, "likes"),
   comments: metricValue(row, "comments"),
   shares: metricValue(row, "shares"),
   revenue: metricValue(row, "revenue"),
  }))
  .sort((a, b) => (b.views ?? -1) - (a.views ?? -1))
}

const SimpleAnalyticsChart: React.FC = () => {
 const [windowKey, setWindowKey] = useState<AnalyticsWindow>("lifetime")
 const [rows, setRows] = useState<CanonicalVideoRow[]>([])
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)

 const refresh = () => {
  setLoading(true)
  try {
   const nextRows = getMasterRows(windowKey, "api")
   const effective = applyGlobalRowFilters(nextRows).rows
   setRows(effective)
   if (effective.length === 0) {
    setError("No analytics cache found. Please run Analytics Sync first.")
   } else {
    setError(null)
   }
  } catch (fetchError) {
   setError(
    fetchError instanceof Error ? fetchError.message : "Failed to fetch data",
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

 const data = useMemo(() => toVideoData(rows), [rows])

 if (loading) {
  return (
   <div className="p-8 text-center">
    <div className="text-2xl font-black uppercase tracking-tighter">
     Loading...
    </div>
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
   <div className="flex items-center justify-between gap-3 mb-6">
    <h2 className="text-3xl font-black uppercase tracking-tighter text-center">
     Simple Analytics - Canonical Master Data
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

   <div className="overflow-auto max-h-[560px]">
    <table className="w-full border-collapse text-sm">
     <thead className="sticky top-0 z-10">
      <tr className="bg-black text-white">
       <th className="border-[3px] border-black px-3 py-3 text-xs font-bold uppercase">
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
        Subs
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
      {data.map((row, index) => (
       <tr
        key={row.videoId || `${row.title}-${index}`}
        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-pink-100`}>
        <td
         className="border-[3px] border-black px-3 py-3 max-w-xs truncate"
         title={row.title}>
         {row.title}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right font-bold">
         {formatNumber(row.views)}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right">
         {formatNumber(row.impressions)}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right">
         {formatFixed(row.ctr, 2, "%")}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right font-bold">
         {formatFixed(row.watchTimeHours, 2)}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right font-bold">
         {formatNumber(row.subscribersGained)}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right">
         {formatNumber(row.likes)}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right">
         {formatNumber(row.comments)}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right">
         {formatNumber(row.shares)}
        </td>
        <td className="border-[3px] border-black px-3 py-3 text-right font-bold">
         ${formatFixed(row.revenue, 2)}
        </td>
       </tr>
      ))}
     </tbody>
    </table>
   </div>

   <div className="mt-4 text-xs text-gray-500 font-bold">
    Showing {data.length} videos • Data sourced from canonical contract • unavailable metrics render as -
   </div>
  </div>
 )
}

export default SimpleAnalyticsChart
