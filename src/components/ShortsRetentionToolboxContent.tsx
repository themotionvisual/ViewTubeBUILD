import React, { useEffect, useMemo, useState } from "react"
import { getMasterRows } from "../services/analyticsSelectors"
import { applyGlobalRowFilters } from "../services/analyticsRuntime"
import type { AnalyticsSourceMode } from "../services/analyticsSelectors"
import type {
 AnalyticsWindow,
 CanonicalVideoRow,
} from "../services/analyticsContract"
import type { CsvFileWithTag } from "../types"
import {
 getStoredSyncSourceMode,
 UPLOAD_CACHE_FILES_KEY,
} from "../services/analyticsRuntime"
import {
 ShortsRetentionWidgetModule,
 AlgorithmTriggerModule,
 EngagementLinesModule,
 SubscribersGained,
 VideoValueMatrix,
 WatchTimeDistribution,
 RevenueDistribution,
 RevenueEfficiency,
 HookEffectiveness,
 GrowthPulse,
 FormatComparisonDonuts,
 ComboChannelProgress,
 TrafficSourceEvolutionModule,
 KeywordTreemapModule,
 KeywordVennModule,
 UploadTimeHeatmapModule,
 ConversionFunnelModule,
 PerformanceGaugesModule,
 LissajousWebModule,
 OrbitalModule,
} from "../components/GraphsPageCharts"

const readUploadedCsvFiles = (): CsvFileWithTag[] => {
 try {
  const parsed = JSON.parse(
   localStorage.getItem(UPLOAD_CACHE_FILES_KEY) || "[]",
  ) as CsvFileWithTag[]
  return Array.isArray(parsed) ? parsed : []
 } catch {
  return []
 }
}

const getEffectiveSourceMode = (): AnalyticsSourceMode => {
 const mode = getStoredSyncSourceMode()
 if (mode === "api_analytics") return "api"
 if (mode === "uploads") return "csv"
 return "hybrid"
}

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

export const ShortsRetentionToolboxContent: React.FC<{
 isActive?: boolean
 windowValue?: AnalyticsWindow
 reloadNonce?: number
}> = ({
 isActive = true,
 windowValue,
 reloadNonce = 0,
}) => {
 const win = windowValue ?? "lifetime"
 const [rows, setRows] = useState<CanonicalVideoRow[]>([])
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const [mountedCharts, setMountedCharts] = useState(4)

 const refresh = () => {
  setLoading(true)
  try {
   const sourceMode = getEffectiveSourceMode()
   const csvFiles = readUploadedCsvFiles()
   const next = getMasterRows(win, sourceMode, csvFiles)
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

 useEffect(() => {
  refresh()
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [reloadNonce])

 useEffect(() => {
  if (!isActive || loading || !!error) return
  const steps = 17
  setMountedCharts(4)
  let index = 4
  const timer = window.setInterval(() => {
   index += 1
   setMountedCharts(Math.min(index, steps))
   if (index >= steps) window.clearInterval(timer)
  }, 120)
  return () => window.clearInterval(timer)
 }, [isActive, loading, error, win, rows.length])

 const data = useMemo(() => rows, [rows])

 return (
  <div className="flex flex-col gap-6">
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
     {mountedCharts >= 1 && <RevealOnView>
      <ComboChannelProgress data={data} />
     </RevealOnView>}
     {mountedCharts >= 2 && <RevealOnView delayMs={25}>
      <EngagementLinesModule data={data} />
     </RevealOnView>}
     {mountedCharts >= 3 && <RevealOnView delayMs={35}>
      <FormatComparisonDonuts data={data} />
     </RevealOnView>}
     {mountedCharts >= 4 && <RevealOnView delayMs={50}>
      <ShortsRetentionWidgetModule data={data} />
     </RevealOnView>}
     {mountedCharts >= 5 && <RevealOnView delayMs={100}>
      <AlgorithmTriggerModule data={data} />
     </RevealOnView>}
     {mountedCharts >= 6 && <RevealOnView delayMs={175}>
      <RevenueEfficiency data={data} />
     </RevealOnView>}
     {mountedCharts >= 7 && <RevealOnView delayMs={200}>
      <HookEffectiveness data={data} />
     </RevealOnView>}
     {mountedCharts >= 7 && <RevealOnView delayMs={250}>
      <RevenueDistribution data={data} />
     </RevealOnView>}
     {mountedCharts >= 7 && <RevealOnView delayMs={300}>
      <SubscribersGained data={data} />
     </RevealOnView>}
     {mountedCharts >= 7 && <RevealOnView delayMs={350}>
      <WatchTimeDistribution data={data} />
     </RevealOnView>}
     {mountedCharts >= 8 && <RevealOnView delayMs={400}>
      <VideoValueMatrix data={data} />
     </RevealOnView>}
     {mountedCharts >= 9 && <RevealOnView delayMs={450}>
      <GrowthPulse data={data} />
     </RevealOnView>}
     {mountedCharts >= 10 && <RevealOnView delayMs={500}>
      <TrafficSourceEvolutionModule data={data} />
     </RevealOnView>}
     {mountedCharts >= 11 && <RevealOnView delayMs={560}>
      <KeywordTreemapModule data={data} />
     </RevealOnView>}
     {mountedCharts >= 11 && <RevealOnView delayMs={610}>
      <KeywordVennModule data={data} />
     </RevealOnView>}
     {mountedCharts >= 11 && <RevealOnView delayMs={670}>
      <UploadTimeHeatmapModule data={data} />
     </RevealOnView>}
     {mountedCharts >= 11 && <RevealOnView delayMs={720}>
      <ConversionFunnelModule data={data} />
     </RevealOnView>}
     {mountedCharts >= 12 && <RevealOnView delayMs={760}>
      <PerformanceGaugesModule data={data} />
     </RevealOnView>}
     {mountedCharts >= 12 && <RevealOnView delayMs={800}>
      <LissajousWebModule data={data} />
     </RevealOnView>}
     {mountedCharts >= 12 && <RevealOnView delayMs={840}>
      <OrbitalModule data={data} />
     </RevealOnView>}
    </div>
   )}
  </div>
 )
}
