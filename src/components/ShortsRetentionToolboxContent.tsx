import React, { useEffect, useMemo, useState } from "react"
import { getMasterRows } from "../services/analytics/Selectors"
import { applyGlobalRowFilters } from "../services/analytics/SyncPipeline"
import type { AnalyticsSourceMode } from "../services/analytics/Selectors"
import type {
 AnalyticsWindow,
 CanonicalVideoRow,
} from "../services/analytics/DataStore"
import type { CsvFileWithTag } from "../types"
import {
 getStoredSyncSourceMode,
 UPLOAD_CACHE_FILES_KEY,
} from "../services/analytics/SyncPipeline"
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
import {
 TUBE_EXPLORER_VISUAL_MODULES,
 type TubeExplorerVisualProps,
} from "./TubeExplorerVisualModules"

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

type VisualModuleEntry = {
 id: string
 group: "core" | "tube-explorer"
 delayMs: number
 render: (props: TubeExplorerVisualProps) => React.ReactNode
}

const CORE_VISUAL_MODULES: VisualModuleEntry[] = [
 { id: "combo-channel-progress", group: "core", delayMs: 0, render: ({ data }) => <ComboChannelProgress data={data} /> },
 { id: "engagement-lines", group: "core", delayMs: 25, render: ({ data }) => <EngagementLinesModule data={data} /> },
 { id: "format-comparison-donuts", group: "core", delayMs: 35, render: ({ data }) => <FormatComparisonDonuts data={data} /> },
 { id: "shorts-retention-widget", group: "core", delayMs: 50, render: ({ data }) => <ShortsRetentionWidgetModule data={data} /> },
 { id: "algorithm-trigger", group: "core", delayMs: 100, render: ({ data }) => <AlgorithmTriggerModule data={data} /> },
 { id: "revenue-efficiency", group: "core", delayMs: 175, render: ({ data }) => <RevenueEfficiency data={data} /> },
 { id: "hook-effectiveness", group: "core", delayMs: 200, render: ({ data }) => <HookEffectiveness data={data} /> },
 { id: "revenue-distribution", group: "core", delayMs: 250, render: ({ data }) => <RevenueDistribution data={data} /> },
 { id: "subscribers-gained", group: "core", delayMs: 300, render: ({ data }) => <SubscribersGained data={data} /> },
 { id: "watch-time-distribution", group: "core", delayMs: 350, render: ({ data }) => <WatchTimeDistribution data={data} /> },
 { id: "video-value-matrix", group: "core", delayMs: 400, render: ({ data }) => <VideoValueMatrix data={data} /> },
 { id: "growth-pulse", group: "core", delayMs: 450, render: ({ data }) => <GrowthPulse data={data} /> },
 { id: "traffic-source-evolution", group: "core", delayMs: 500, render: ({ data }) => <TrafficSourceEvolutionModule data={data} /> },
 { id: "keyword-treemap", group: "core", delayMs: 560, render: ({ data }) => <KeywordTreemapModule data={data} /> },
 { id: "keyword-venn", group: "core", delayMs: 610, render: ({ data }) => <KeywordVennModule data={data} /> },
 { id: "upload-time-heatmap", group: "core", delayMs: 670, render: ({ data }) => <UploadTimeHeatmapModule data={data} /> },
 { id: "conversion-funnel", group: "core", delayMs: 720, render: ({ data }) => <ConversionFunnelModule data={data} /> },
 { id: "performance-gauges", group: "core", delayMs: 760, render: ({ data }) => <PerformanceGaugesModule data={data} /> },
 { id: "lissajous-web", group: "core", delayMs: 800, render: ({ data }) => <LissajousWebModule data={data} /> },
 { id: "orbital", group: "core", delayMs: 840, render: ({ data }) => <OrbitalModule data={data} /> },
]

const TUBE_EXPLORER_MODULES: VisualModuleEntry[] = TUBE_EXPLORER_VISUAL_MODULES.map((entry, index) => ({
 id: entry.id,
 group: "tube-explorer",
 delayMs: 80 + (index % 6) * 35,
 render: entry.render,
}))

const VISUAL_MODULES: VisualModuleEntry[] = [
 ...CORE_VISUAL_MODULES,
 ...TUBE_EXPLORER_MODULES,
]

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
 const [csvFiles, setCsvFiles] = useState<CsvFileWithTag[]>([])
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const [mountedCharts, setMountedCharts] = useState(4)

 const refresh = () => {
  setLoading(true)
  try {
   const sourceMode = getEffectiveSourceMode()
   const uploadedCsvFiles = readUploadedCsvFiles()
   const next = getMasterRows(win, sourceMode, uploadedCsvFiles)
   const effective = applyGlobalRowFilters(next).rows
   setRows(effective)
   setCsvFiles(uploadedCsvFiles)
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
  let refreshTimer: number | null = null
  const h = () => {
   if (refreshTimer !== null) window.clearTimeout(refreshTimer)
   refreshTimer = window.setTimeout(() => refresh(), 150)
  }
  window.addEventListener("yt_analytics_synced", h)
  return () => {
   if (refreshTimer !== null) window.clearTimeout(refreshTimer)
   window.removeEventListener("yt_analytics_synced", h)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [win])

 useEffect(() => {
  refresh()
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [reloadNonce])

 useEffect(() => {
  if (!isActive || loading || !!error) return
  const steps = VISUAL_MODULES.length
  setMountedCharts(4)
  let index = 4
  const timer = window.setInterval(() => {
   index += 1
   setMountedCharts(Math.min(index, steps))
   if (index >= steps) window.clearInterval(timer)
  }, 90)
  return () => window.clearInterval(timer)
 }, [isActive, loading, error, win, rows.length])

 const data = useMemo(() => rows, [rows])
 const renderedModules = useMemo(
  () => VISUAL_MODULES.slice(0, mountedCharts),
  [mountedCharts],
 )
 const firstTubeExplorerIndex = CORE_VISUAL_MODULES.length

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
     {renderedModules.map((module, index) => (
      <React.Fragment key={module.id}>
       {index === firstTubeExplorerIndex ? (
        <div className="border-[4px] border-black bg-[#0B0B0B] px-5 py-4 text-white shadow-[8px_8px_0px_0px_#FF7497]">
         <div className="text-[34px] font-[1000] uppercase leading-none tracking-tight text-[#CCFF00]">
          Tube Explorer Visual Lab
         </div>
         <div className="mt-1 text-[12px] font-black uppercase tracking-[0.14em] text-white/70">
          Duplicate modules ported from Tube Insights Explorer, powered by current filtered ViewTube rows and uploaded CSV merge data.
         </div>
        </div>
       ) : null}
       <RevealOnView delayMs={module.delayMs}>
        {module.render({ data, csvFiles })}
       </RevealOnView>
      </React.Fragment>
     ))}
    </div>
   )}
  </div>
 )
}
