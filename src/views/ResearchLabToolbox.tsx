import React, { useEffect, useMemo, useState } from "react"
import { getMasterRows } from "../services/analyticsSelectors"
import { applyGlobalRowFilters } from "../services/analyticsRuntime"
import type { AnalyticsWindow, CanonicalVideoRow } from "../services/analyticsContract"
import {
 PerformanceTrendChart,
 EngagementMapChart,
 ValueMatrixChart,
 AudienceGrowthChart,
 YouTubeVideoSearch,
} from "../components/ResearchLabCharts"

const WINDOW_OPTIONS: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d", "7d"]

const ResearchLabToolbox: React.FC = () => {
 const [windowKey, setWindowKey] = useState<AnalyticsWindow>("365d")
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

 const data = useMemo(() => rows, [rows])

 return (
  <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
   <header className="bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
    <div>
     <h1 className="text-4xl font-[900] uppercase tracking-tighter leading-none">Research Lab <span className="text-[#FF7497]">(Native)</span></h1>
     <p className="text-sm font-bold uppercase tracking-widest opacity-60 mt-2">Standalone Recharts-powered analytics laboratory.</p>
    </div>
    <div className="flex items-center gap-3">
     <span className="text-[11px] font-black uppercase text-black/60">Timeframe:</span>
     <select
      value={windowKey}
      onChange={(event) => setWindowKey(event.target.value as AnalyticsWindow)}
      className="h-12 px-4 border-[4px] border-black rounded-xl text-[14px] font-black uppercase tracking-wider bg-[#CCFF00] outline-none focus:ring-4 focus:ring-black cursor-pointer"
     >
      {WINDOW_OPTIONS.map((windowOption) => (
       <option key={windowOption} value={windowOption} className="bg-white">
        {windowOption}
       </option>
      ))}
     </select>
     <button
      onClick={refresh}
      className="h-12 px-6 bg-black text-white rounded-xl text-[14px] font-black uppercase tracking-wider border-[4px] border-black hover:bg-[#FFDD00] hover:text-black transition-colors active:translate-y-1"
     >
      Refresh
     </button>
    </div>
   </header>

   <main>
    {loading ? (
     <div className="flex items-center justify-center p-20 text-2xl font-black uppercase tracking-tighter opacity-30 bg-white border-[4px] border-black rounded-2xl border-dashed">
      Loading Canonical Matrix...
     </div>
    ) : error ? (
     <div className="flex items-center justify-center p-20 text-[#FF7497] font-black text-xl uppercase tracking-widest bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black]">
      {error}
     </div>
    ) : data.length === 0 ? (
     <div className="flex items-center justify-center p-20 text-xl font-black uppercase tracking-tighter opacity-30 bg-white border-[4px] border-black rounded-2xl border-dashed">
      No data available for {windowKey}. Try syncing.
     </div>
    ) : (
     <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <PerformanceTrendChart data={data} />
      <EngagementMapChart data={data} />
      <ValueMatrixChart data={data} />
      <AudienceGrowthChart data={data} />
      <div className="xl:col-span-2">
        <YouTubeVideoSearch />
      </div>
     </div>
    )}
   </main>
  </div>
 )
}

export default ResearchLabToolbox
