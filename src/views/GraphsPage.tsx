import React, { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { getMasterRows } from "../services/analytics/Selectors"
import { applyGlobalRowFilters, UPLOAD_CACHE_FILES_KEY } from "../services/analytics/SyncPipeline"
import type { AnalyticsWindow, CanonicalVideoRow } from "../services/analytics/DataStore"
import {
 VideoValueMatrix, RevenueDistribution, WatchTimeDistribution, SubscribersGained,
 ShortsRetention, Packaging, EngagementMap, PerformanceTrend, DurationSweetSpot,
 RevenueEfficiency, AudienceGrowth, GoldenRatioRadar, HookEffectiveness, GrowthPulse, TopPerformersTrio,
} from "../components/GraphsPageCharts"
import { SubToolbox, ToolboxScaffold } from "../components/Toolbox"
import { Activity, ChartColumnBig } from "lucide-react"
import { useBrain } from "../context/useBrain"
import type { CsvDetectedCategory, CsvFileWithTag } from "../types"

const WINDOWS: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d", "7d"]

const csvSchemaSignature = (rows: unknown[]): string => {
 if (!Array.isArray(rows) || rows.length === 0) return "no_rows"
 const first = rows[0]
 if (!first || typeof first !== "object" || Array.isArray(first)) return "non_object_rows"
 return Object.keys(first as Record<string, unknown>).sort().join("|")
}

const csvFileMergeKey = (file: CsvFileWithTag): string => {
 const rowCount = Array.isArray(file.data) ? file.data.length : 0
 const schema = csvSchemaSignature(file.data || [])
 return [
  String(file.name || "").toLowerCase().trim(),
  String(file.tag || "").toLowerCase().trim(),
  String(file.dateRange || "").toLowerCase().trim(),
  String(file.featureName || "").toLowerCase().trim(),
  String(file.analyticsWindow || "").toLowerCase().trim(),
  String(file.exportKind || "").toLowerCase().trim(),
  String(rowCount),
  schema,
 ].join("::")
}

const dedupeCsvFilesForGraphs = (files: CsvFileWithTag[]): CsvFileWithTag[] => {
 const seen = new Set<string>()
 const output: CsvFileWithTag[] = []
 for (const file of files) {
  const key = csvFileMergeKey(file)
  if (seen.has(key)) continue
  seen.add(key)
  output.push(file)
 }
 return output
}

const isRecognizedCsvCategory = (
 category: CsvDetectedCategory | undefined,
 confidence: "high" | "medium" | "low" | undefined,
): boolean => {
 if (!category || category === "unknown") return false
 return confidence === "high" || confidence === "medium" || confidence === undefined
}

const readCachedUploadFiles = (): CsvFileWithTag[] => {
 try {
  const parsed = JSON.parse(localStorage.getItem(UPLOAD_CACHE_FILES_KEY) || "[]") as CsvFileWithTag[]
  return Array.isArray(parsed) ? parsed : []
 } catch {
  return []
 }
}

const GraphsPage: React.FC = () => {
 const { brain, lastSyncComplete } = useBrain()
 const [win, setWin] = useState<AnalyticsWindow>("365d")
 const [rows, setRows] = useState<CanonicalVideoRow[]>([])
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const [cachedUploadFiles, setCachedUploadFiles] = useState<CsvFileWithTag[]>(() =>
  readCachedUploadFiles(),
 )

 const storedCsvFiles = brain.channelyticsState.csvFiles || []
 const csvFiles = useMemo(
  () => dedupeCsvFilesForGraphs([...storedCsvFiles, ...cachedUploadFiles]),
  [storedCsvFiles, cachedUploadFiles],
 )
 const recognizedCsvFiles = useMemo(
  () =>
   csvFiles.filter((file) =>
    isRecognizedCsvCategory(file.detectedCategory, file.detectionConfidence),
   ),
  [csvFiles],
 )
 const dataSource = recognizedCsvFiles.length > 0 ? "hybrid" : "api"

 const refresh = () => {
  setLoading(true)
  try {
   const next = getMasterRows(win, dataSource, recognizedCsvFiles)
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
  const handleUploadCacheUpdate = () => {
   setCachedUploadFiles(readCachedUploadFiles())
  }
  window.addEventListener("vt_upload_cache_updated", handleUploadCacheUpdate)
  return () => window.removeEventListener("vt_upload_cache_updated", handleUploadCacheUpdate)
 }, [])

 useEffect(() => {
  refresh()
  const h = () => refresh()
  window.addEventListener("yt_analytics_synced", h)
  return () => window.removeEventListener("yt_analytics_synced", h)
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [win, recognizedCsvFiles, dataSource, lastSyncComplete])

 const data = useMemo(() => rows, [rows])

 return (
  <div className="p-8 max-w-[1600px] mx-auto flex flex-col gap-8 pb-24">
   {/* Header */}
   <header className="bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
    <div>
     <h1 className="text-4xl font-[900] uppercase tracking-tighter leading-none">
      GRAPHS <span className="text-[#FF7497]">LABORATORY</span>
     </h1>
     <p className="text-sm font-bold uppercase tracking-widest opacity-60 mt-2">
      All charts • Live sync data • {data.length} videos loaded
     </p>
    </div>
    <div className="flex items-center gap-3">
     <Link
      to="/performance"
      className="h-12 px-4 bg-[#FF7497] text-white rounded-xl text-[11px] font-black uppercase tracking-wider border-[4px] border-black inline-flex items-center shadow-[4px_4px_0px_0px_black]">
      Shorts Performance
     </Link>
     <span className="text-[11px] font-black uppercase text-black/60">Timeframe:</span>
     <select value={win} onChange={e => setWin(e.target.value as AnalyticsWindow)}
      className="h-12 px-4 border-[4px] border-black rounded-xl text-[14px] font-black uppercase tracking-wider bg-[#CCFF00] outline-none cursor-pointer">
      {WINDOWS.map(w => <option key={w} value={w} className="bg-white">{w}</option>)}
     </select>
     <button onClick={refresh}
      className="h-12 px-6 bg-black text-white rounded-xl text-[14px] font-black uppercase tracking-wider border-[4px] border-black hover:bg-[#FFDD00] hover:text-black transition-colors active:translate-y-1">
      Refresh
     </button>
    </div>
   </header>

   {/* Content */}
   {loading ? (
    <div className="flex items-center justify-center p-20 text-2xl font-black uppercase tracking-tighter opacity-30 bg-white border-[4px] border-black rounded-2xl border-dashed">
     Loading Canonical Matrix...
    </div>
   ) : error ? (
    <div className="flex items-center justify-center p-20 text-[#FF7497] font-black text-xl uppercase tracking-widest bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black]">
     {error}
    </div>
   ) : (
    <ToolboxScaffold
     title="CHANNEL"
     icon={<Activity size={42} className="text-black" />}
     headerColor="bg-[#FFDD00]"
     iconBoxColor="bg-[#CCFF00]"
     collapsible
     isOpen={true}
     disableCollapseAnimation
     contentClassName="bg-white p-4 md:p-6 lg:p-8 min-h-[620px]">
     <div className="space-y-6">
      <SubToolbox
       title="DATA VISUALIZATIONS"
       icon={<ChartColumnBig size={22} strokeWidth={3} className="text-black" />}
       headerColor="bg-[#CCFF00]"
       collapsible
       isOpenInitial
       unmountOnClose
      >
       <div className="flex flex-col gap-8">
        {/* Full-width: Video Value Matrix */}
        <VideoValueMatrix data={data} />

        {/* 2-col grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         <RevenueDistribution data={data} />
         <WatchTimeDistribution data={data} />
         <SubscribersGained data={data} />
         <HookEffectiveness data={data} />
         <ShortsRetention data={data} />
        </div>

        {/* Full-width: Revenue Efficiency */}
        <RevenueEfficiency data={data} />

        {/* Full-width: Growth Pulse */}
        <GrowthPulse data={data} />
       </div>
      </SubToolbox>

      <SubToolbox
       title="EXTENDED VISUALS"
       icon={<ChartColumnBig size={22} strokeWidth={3} className="text-black" />}
       headerColor="bg-[#FFB158]"
       collapsible
       isOpenInitial
       unmountOnClose
      >
       <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         <TopPerformersTrio data={data} />
         <Packaging data={data} />
         <EngagementMap data={data} />
         <PerformanceTrend data={data} />
         <DurationSweetSpot data={data} />
         <AudienceGrowth data={data} />
         <GoldenRatioRadar data={data} />
        </div>
       </div>
      </SubToolbox>
     </div>
    </ToolboxScaffold>
   )}
  </div>
 )
}

export default GraphsPage
