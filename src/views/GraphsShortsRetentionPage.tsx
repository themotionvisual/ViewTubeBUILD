import React, { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { getMasterRows } from "../services/analyticsSelectors"
import { applyGlobalRowFilters } from "../services/analyticsRuntime"
import type { AnalyticsWindow, CanonicalVideoRow } from "../services/analyticsContract"
import { ShortsRetentionWidgetModule } from "../components/GraphsPageCharts"

const WINDOWS: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d", "7d"]

const GraphsShortsRetentionPage: React.FC = () => {
 const [win, setWin] = useState<AnalyticsWindow>("365d")
 const [rows, setRows] = useState<CanonicalVideoRow[]>([])
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)

 const refresh = () => {
  setLoading(true)
  try {
   const next = getMasterRows(win, "api")
   const effective = applyGlobalRowFilters(next).rows
   setRows(effective)
   setError(effective.length === 0 ? "No analytics cache. Run Sync first." : null)
  } catch (e) {
   setError(e instanceof Error ? e.message : "Failed to fetch")
  } finally {
   setLoading(false)
  }
 }

 useEffect(() => {
  refresh()
  const h = () => refresh()
  window.addEventListener("yt_analytics_synced", h)
  return () => window.removeEventListener("yt_analytics_synced", h)
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [win])

 const data = useMemo(() => rows, [rows])

 return (
  <div className="p-8 max-w-[1200px] mx-auto flex flex-col gap-6">
   <header className="bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] p-5 flex flex-col md:flex-row items-center justify-between gap-4">
    <div>
     <h1 className="text-3xl font-[900] uppercase tracking-tighter leading-none">
      SHORTS RETENTION <span className="text-[#FF7497]">MODULE</span>
     </h1>
     <p className="text-xs font-bold uppercase tracking-widest opacity-60 mt-2">
      Dedicated chart page • {data.length} videos loaded
     </p>
    </div>
    <div className="flex items-center gap-3">
     <Link
      to="/graphs"
      className="h-11 px-4 bg-white text-black rounded-xl text-[11px] font-black uppercase tracking-wider border-[4px] border-black inline-flex items-center">
      Back To Graphs
     </Link>
     <select
      value={win}
      onChange={(e) => setWin(e.target.value as AnalyticsWindow)}
      className="h-11 px-3 border-[4px] border-black rounded-xl text-[12px] font-black uppercase tracking-wider bg-[#CCFF00] outline-none cursor-pointer">
      {WINDOWS.map((w) => (
       <option key={w} value={w} className="bg-white">{w}</option>
      ))}
     </select>
     <button
      onClick={refresh}
      className="h-11 px-5 bg-black text-white rounded-xl text-[12px] font-black uppercase tracking-wider border-[4px] border-black hover:bg-[#FFDD00] hover:text-black transition-colors">
      Refresh
     </button>
    </div>
   </header>

   {loading ? (
    <div className="flex items-center justify-center p-20 text-2xl font-black uppercase tracking-tighter opacity-30 bg-white border-[4px] border-black rounded-2xl border-dashed">
     Loading Canonical Matrix...
    </div>
   ) : error ? (
    <div className="flex items-center justify-center p-20 text-[#FF7497] font-black text-xl uppercase tracking-widest bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black]">
     {error}
    </div>
   ) : (
    <ShortsRetentionWidgetModule data={data} />
   )}
  </div>
 )
}

export default GraphsShortsRetentionPage

