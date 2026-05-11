import React, { useEffect, useMemo, useState } from "react"
import { getMasterRows } from "../services/analyticsSelectors"
import { applyGlobalRowFilters } from "../services/analyticsRuntime"
import type {
 AnalyticsWindow,
 CanonicalVideoRow,
} from "../services/analyticsContract"
import {
 ShortsRetentionWidgetModule,
 AlgorithmTriggerModule,
 EngagementLinesModule,
 SubscribersGained,
 TopPerformersTrio,
 VideoValueMatrix,
 WatchTimeDistribution,
 RevenueDistribution,
 Packaging,
 EngagementMap,
 PerformanceTrend,
 DurationSweetSpot,
 RevenueEfficiency,
 AudienceGrowth,
 GoldenRatioRadar,
 HookEffectiveness,
 GrowthPulse,
 StackedEngagementPulse,
 FormatComparisonDonuts,
 ComboChannelProgress,
} from "../components/GraphsPageCharts"

const WINDOWS: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d", "7d"]

export const RevealOnView: React.FC<{
 delayMs?: number
 children: React.ReactNode
}> = ({ delayMs = 0, children }) => {
 const [visible, setVisible] = useState(false)
 const [node, setNode] = useState<HTMLDivElement | null>(null)

 useEffect(() => {
  if (!node) return
  const observer = new IntersectionObserver(
   (entries) => {
    if (entries.some((e) => e.isIntersecting)) {
     setVisible(true)
     observer.disconnect()
    }
   },
   { threshold: 0.15 },
  )
  observer.observe(node)
  return () => observer.disconnect()
 }, [node])

 return (
  <div
   ref={setNode}
   style={{
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0px)" : "translateY(14px)",
    transition: `opacity 420ms ease, transform 420ms ease`,
    transitionDelay: `${delayMs}ms`,
   }}>
   {children}
  </div>
 )
}

export const ShortsRetentionToolboxContent: React.FC = () => {
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
   setError(
    effective.length === 0 ? "No analytics cache. Run Sync first." : null,
   )
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
  <div className="flex flex-col gap-6">
   <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl border-[3px] border-black">
    <div className="text-[12px] font-black uppercase tracking-widest text-black/60">
      Data Controls • {data.length} videos loaded
    </div>
    <div className="flex items-center gap-3">
     <select
      value={win}
      onChange={(e) => setWin(e.target.value as AnalyticsWindow)}
      className="h-11 px-3 border-[4px] border-black rounded-xl text-[12px] font-black uppercase tracking-wider bg-[#CCFF00] outline-none cursor-pointer">
      {WINDOWS.map((w) => (
       <option key={w} value={w} className="bg-white">
        {w}
       </option>
      ))}
     </select>
     <button
      onClick={refresh}
      className="h-11 px-5 bg-black text-white rounded-xl text-[12px] font-black uppercase tracking-wider border-[4px] border-black hover:bg-[#FFDD00] hover:text-black transition-colors">
      Refresh
     </button>
    </div>
   </div>

   {loading ? (
    <div className="flex items-center justify-center p-20 text-2xl font-black uppercase tracking-tighter opacity-30 bg-white border-[4px] border-black rounded-2xl border-dashed">
     Loading Canonical Matrix...
    </div>
   ) : error ? (
    <div className="flex items-center justify-center p-20 text-[#FF7497] font-black text-xl uppercase tracking-widest bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black]">
     {error}
    </div>
   ) : (
    <div className="flex flex-col gap-8">
     <RevealOnView>
      <ShortsRetentionWidgetModule data={data} />
     </RevealOnView>
     <RevealOnView delayMs={25}>
      <AlgorithmTriggerModule data={data} />
     </RevealOnView>
     <RevealOnView delayMs={35}>
      <EngagementLinesModule data={data} />
     </RevealOnView>
     <RevealOnView delayMs={50}>
      <ComboChannelProgress data={data} />
     </RevealOnView>
     <RevealOnView delayMs={100}>
      <StackedEngagementPulse data={data} />
     </RevealOnView>
     <RevealOnView delayMs={150}>
      <FormatComparisonDonuts data={data} />
     </RevealOnView>
     <RevealOnView delayMs={175}>
      <RevenueEfficiency data={data} />
     </RevealOnView>
     <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <RevealOnView delayMs={200}>
       <HookEffectiveness data={data} />
      </RevealOnView>
      <RevealOnView delayMs={250}>
       <RevenueDistribution data={data} />
      </RevealOnView>
      <RevealOnView delayMs={300}>
       <SubscribersGained data={data} />
      </RevealOnView>
      <RevealOnView delayMs={350}>
       <WatchTimeDistribution data={data} />
      </RevealOnView>
     </section>
     <RevealOnView delayMs={400}>
      <VideoValueMatrix data={data} />
     </RevealOnView>
     <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <RevealOnView delayMs={450}>
       <TopPerformersTrio data={data} />
      </RevealOnView>
      <RevealOnView delayMs={500}>
       <Packaging data={data} />
      </RevealOnView>
      <RevealOnView delayMs={550}>
       <EngagementMap data={data} />
      </RevealOnView>
      <RevealOnView delayMs={600}>
       <PerformanceTrend data={data} />
      </RevealOnView>
      <RevealOnView delayMs={650}>
       <DurationSweetSpot data={data} />
      </RevealOnView>
      <RevealOnView delayMs={700}>
       <AudienceGrowth data={data} />
      </RevealOnView>
      <RevealOnView delayMs={750}>
       <GoldenRatioRadar data={data} />
      </RevealOnView>
      <RevealOnView delayMs={800}>
       <GrowthPulse data={data} />
      </RevealOnView>
     </section>
    </div>
   )}
  </div>
 )
}
