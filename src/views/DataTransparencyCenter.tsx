import React, { useEffect, useMemo, useState } from "react"
import { Database, Download, Info, ShieldCheck } from "lucide-react"
import { SubToolbox } from "../components/Toolbox"
import { buildMasterTableBundle } from "../services/masterTables"
import { listLocalDataEntries, readLocalData, type LocalDataCategory } from "../services/localDataInspector"
import { clearCachedDataSoft, factoryResetAll, LOCAL_DATA_CHANGED_EVENT } from "../services/localDataReset"
import {
 getStoredIngestMode,
 setStoredIngestMode,
 type IngestMode,
 MASTER_TABLE_LABELS,
} from "../services/productArchitecture"
import { FORMULA_REGISTRY } from "../services/formulaRegistry"
import { SUBSCRIPTION_PLANS } from "../services/subscriptionPlans"
import {
 downloadExportBundle,
 type ExportManifest,
} from "../services/dataExport"
import { DEFAULT_NAMING_TABLE } from "../services/namingGovernance"
import { getStoredSyncSourceMode, getStoredStorageMode } from "../services/analyticsRuntime"
import { readYouTubeAnalyticsCache } from "../services/canonicalAnalyticsStore"

const ingestModes: IngestMode[] = ["connected", "import", "hybrid", "public_handle"]
const OPTIONAL_VIDEO_METRICS_STORAGE_KEY = "vt_optional_video_metrics_enabled"
const SYNC_MERGE_POLICY_KEY = "vt_sync_merge_policy"
type SyncMergePolicy = "merge" | "latest_only"

const getStoredOptionalVideoMetricsEnabled = (): boolean => {
 try {
  const raw = localStorage.getItem(OPTIONAL_VIDEO_METRICS_STORAGE_KEY)
  return raw === "1" || raw === "true"
 } catch {
  return false
 }
}

const DataTransparencyCenter: React.FC = () => {
 const [localDataTick, setLocalDataTick] = useState(0)
 const [ingestMode, setIngestModeState] = useState<IngestMode>(getStoredIngestMode())
 const [optionalVideoMetricsEnabled, setOptionalVideoMetricsEnabled] = useState<boolean>(
  getStoredOptionalVideoMetricsEnabled(),
 )
 const [mergePolicy, setMergePolicy] = useState<SyncMergePolicy>(() => {
  try {
   const raw = localStorage.getItem(SYNC_MERGE_POLICY_KEY)
   return raw === "latest_only" ? "latest_only" : "merge"
  } catch {
   return "merge"
  }
 })
 const [inspectorSelectedKey, setInspectorSelectedKey] = useState<string | null>(null)
 const [inspectorShowSensitive, setInspectorShowSensitive] = useState<boolean>(false)
 const [exportStatus, setExportStatus] = useState<string>("")

 useEffect(() => {
  const onChanged = () => setLocalDataTick((t) => t + 1)
  window.addEventListener(LOCAL_DATA_CHANGED_EVENT, onChanged)
  window.addEventListener("storage", onChanged)
  return () => {
   window.removeEventListener(LOCAL_DATA_CHANGED_EVENT, onChanged)
   window.removeEventListener("storage", onChanged)
  }
 }, [])

 const bundle = useMemo(
  () => buildMasterTableBundle("lifetime", ingestMode),
  [ingestMode, localDataTick],
 )

 const tableSummary = useMemo(() => {
  return (Object.keys(bundle.tables) as Array<keyof typeof bundle.tables>).map((table) => ({
   table,
   label: MASTER_TABLE_LABELS[table],
   count: bundle.tables[table].length,
  }))
 }, [bundle])

 const totalRows = tableSummary.reduce((sum, entry) => sum + entry.count, 0)
 const syncDiagnostics = useMemo(() => {
  const cache = readYouTubeAnalyticsCache() as {
   analyticsByWindow?: Record<
    string,
    {
     syncDiagnostics?: {
      disabledMetrics?: string[]
      failureReasons?: unknown[]
      splitRetries?: number
     }
    }
   >
  }
  const windows = Object.values(cache.analyticsByWindow || {})
  const disabledMetrics = new Set<string>()
  let failures = 0
  let splitRetries = 0
  windows.forEach((windowPayload) => {
   ;(windowPayload?.syncDiagnostics?.disabledMetrics || []).forEach((metric) =>
    disabledMetrics.add(metric),
   )
   failures += (windowPayload?.syncDiagnostics?.failureReasons || []).length
   splitRetries += Number(windowPayload?.syncDiagnostics?.splitRetries || 0)
  })
  return {
   disabledMetrics: disabledMetrics.size,
   failures,
   windows: windows.length,
   splitRetries,
  }
 }, [localDataTick])

 const localDataEntries = useMemo(() => listLocalDataEntries(), [localDataTick])

 const bytesByCategory = useMemo(() => {
  const totals: Record<LocalDataCategory, number> = {
   auth: 0,
   analytics: 0,
   uploads: 0,
   preferences: 0,
   ai: 0,
   other: 0,
  }
  localDataEntries.forEach((entry) => {
   totals[entry.category] += entry.bytes
  })
  return totals
 }, [localDataEntries])

 const influencePanel = useMemo(() => {
  const uploadsCacheRaw = localStorage.getItem("vt_uploaded_csv_cache") || ""
  const ga4CacheRaw = localStorage.getItem("ga4_analytics_cache") || ""
  const ytCache = readYouTubeAnalyticsCache() as Record<string, unknown>
  const ytCacheRaw = JSON.stringify(ytCache)
  const lastSync = localStorage.getItem("yt_analytics_last_sync")

  let videoFlagsCount = 0
  try {
   const brainRaw = localStorage.getItem("vt_workspace_brain") || "{}"
   const brain = JSON.parse(brainRaw) as { videoFlags?: Record<string, unknown> }
   if (brain.videoFlags && typeof brain.videoFlags === "object") {
    videoFlagsCount = Object.keys(brain.videoFlags).length
   }
  } catch {
   videoFlagsCount = 0
  }

  let syncRunSummary: unknown = null
  try {
   const parsed = ytCache as { syncRunSummary?: unknown }
   syncRunSummary = parsed?.syncRunSummary ?? null
  } catch {
   syncRunSummary = null
  }

  return {
   ingestMode: getStoredIngestMode(),
   syncSourceMode: getStoredSyncSourceMode(),
   storageMode: getStoredStorageMode(),
   uploadsCacheBytes: uploadsCacheRaw.length,
   ga4CacheBytes: ga4CacheRaw.length,
   ytCacheBytes: ytCacheRaw.length,
   videoFlagsCount,
   lastSync,
   syncRunSummary,
  }
 }, [localDataTick])

 useEffect(() => {
  // Internal-only session toggle via query param:
  // `/data-transparency?optionalMetrics=1` to enable; `=0` to disable.
  try {
   const params = new URLSearchParams(window.location.search)
   const q = params.get("optionalMetrics")
   if (q === "1" || q === "true") {
    localStorage.setItem(OPTIONAL_VIDEO_METRICS_STORAGE_KEY, "1")
    setOptionalVideoMetricsEnabled(true)
   }
   if (q === "0" || q === "false") {
    localStorage.setItem(OPTIONAL_VIDEO_METRICS_STORAGE_KEY, "0")
    setOptionalVideoMetricsEnabled(false)
   }
  } catch {
   // no-op
  }
 }, [])

 const handleModeChange = (mode: IngestMode) => {
  setStoredIngestMode(mode)
  setIngestModeState(mode)
 }

 const handleOptionalMetricsToggle = (next: boolean) => {
  localStorage.setItem(OPTIONAL_VIDEO_METRICS_STORAGE_KEY, next ? "1" : "0")
  setOptionalVideoMetricsEnabled(next)
 }

 const handleMergePolicyChange = (next: SyncMergePolicy) => {
  try {
   localStorage.setItem(SYNC_MERGE_POLICY_KEY, next)
  } catch {
   // ignore
  }
  setMergePolicy(next)
 }

 const downloadKey = (key: string, redact: boolean) => {
  const content = readLocalData(key, { redact })
  const blob = new Blob([content], { type: "application/json;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${key}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
 }

 const handleExport = async () => {
  setExportStatus("Building export bundle...")
  try {
   const manifest: ExportManifest = await downloadExportBundle(ingestMode, "lifetime")
   setExportStatus(
    `Export complete (${manifest.tables.length} tables, ${manifest.generatedAt}).`,
   )
  } catch (error) {
   const message = error instanceof Error ? error.message : String(error)
   setExportStatus(`Export failed: ${message}`)
  }
 }

	 return (
	  <div className="max-w-6xl mx-auto pb-24 px-4 space-y-8 animate-fade-in">
   <div className="flex flex-wrap items-end justify-between gap-4 border-b-[4px] border-black pb-4">
    <div>
     <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
      Data Transparency Center
     </h1>
     <p className="font-bold text-gray-700 mt-2">
      Source lineage, master tables, formula registry, and export controls.
     </p>
    </div>
    <div className="bg-[#CCFF00] border-[3px] border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_black]">
     <ShieldCheck size={28} />
    </div>
   </div>

	   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <SubToolbox
     title="Coverage"
     icon={<Database size={18} strokeWidth={3} />}
     paletteIndex={0}
     contentClassName="p-4">
     <p className="font-black text-3xl">{totalRows}</p>
     <p className="font-bold text-sm text-gray-600">total canonical rows loaded</p>
    </SubToolbox>

    <SubToolbox
     title="Formula Registry"
     icon={<Info size={18} strokeWidth={3} />}
     paletteIndex={1}
     contentClassName="p-4">
     <p className="font-black text-3xl">{FORMULA_REGISTRY.length}</p>
     <p className="font-bold text-sm text-gray-600">deterministic formulas registered</p>
    </SubToolbox>

   <SubToolbox
     title="Plan Tiers"
     icon={<ShieldCheck size={18} strokeWidth={3} />}
     paletteIndex={2}
     contentClassName="p-4">
     <p className="font-black text-3xl">{SUBSCRIPTION_PLANS.length}</p>
     <p className="font-bold text-sm text-gray-600">subscription capability levels</p>
    </SubToolbox>

    <SubToolbox
     title="Sync Diagnostics"
     icon={<Info size={18} strokeWidth={3} />}
    paletteIndex={6}
    contentClassName="p-4">
     <p className="font-black text-2xl">{syncDiagnostics.windows}</p>
     <p className="font-bold text-xs text-gray-600">
      windows with diagnostics ({syncDiagnostics.failures} failures,{" "}
      {syncDiagnostics.disabledMetrics} disabled metrics, {syncDiagnostics.splitRetries} split retries)
     </p>

     <div className="mt-3 flex items-center justify-between gap-3 border-t border-black/20 pt-3">
      <div className="min-w-0">
       <p className="font-black text-[11px] uppercase tracking-wide">
        Optional Video Metrics
       </p>
       <p className="font-bold text-[11px] text-gray-600 leading-tight">
        Thumbnail impressions and CTR are opt-in only (reduces API 400s).
       </p>
      </div>
      <label className="flex items-center gap-2 shrink-0 font-black text-[11px] uppercase">
       <input
        type="checkbox"
        className="h-4 w-4 accent-black"
        checked={optionalVideoMetricsEnabled}
        onChange={(e) => handleOptionalMetricsToggle(e.target.checked)}
       />
       Enable
      </label>
     </div>
	    </SubToolbox>
	   </div>

    <SubToolbox
     title="What Is Influencing My Tables?"
     icon={<Info size={18} strokeWidth={3} />}
     paletteIndex={5}
     contentClassName="p-6 space-y-3">
     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="border-[3px] border-black rounded-xl p-3 bg-white">
       <p className="font-black text-[11px] uppercase tracking-wide">Ingest Mode</p>
       <p className="font-bold text-sm">{influencePanel.ingestMode}</p>
      </div>
      <div className="border-[3px] border-black rounded-xl p-3 bg-white">
       <p className="font-black text-[11px] uppercase tracking-wide">Sync Source</p>
       <p className="font-bold text-sm">{influencePanel.syncSourceMode}</p>
      </div>
      <div className="border-[3px] border-black rounded-xl p-3 bg-white">
       <p className="font-black text-[11px] uppercase tracking-wide">Write Target</p>
       <p className="font-bold text-sm">{influencePanel.storageMode}</p>
      </div>
     </div>
     <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div className="border-[3px] border-black rounded-xl p-3 bg-[#fcfcfc]">
       <p className="font-black text-[11px] uppercase tracking-wide">Uploads Cache</p>
       <p className="font-bold text-sm">{influencePanel.uploadsCacheBytes} bytes</p>
      </div>
      <div className="border-[3px] border-black rounded-xl p-3 bg-[#fcfcfc]">
       <p className="font-black text-[11px] uppercase tracking-wide">GA4 Cache</p>
       <p className="font-bold text-sm">{influencePanel.ga4CacheBytes} bytes</p>
      </div>
      <div className="border-[3px] border-black rounded-xl p-3 bg-[#fcfcfc]">
       <p className="font-black text-[11px] uppercase tracking-wide">YT Cache</p>
       <p className="font-bold text-sm">{influencePanel.ytCacheBytes} bytes</p>
      </div>
      <div className="border-[3px] border-black rounded-xl p-3 bg-[#fcfcfc]">
       <p className="font-black text-[11px] uppercase tracking-wide">Video Flags</p>
       <p className="font-bold text-sm">{influencePanel.videoFlagsCount}</p>
      </div>
     </div>
     <div className="border-[3px] border-black rounded-xl p-3 bg-white">
      <p className="font-black text-[11px] uppercase tracking-wide">Last YouTube Sync</p>
      <p className="font-bold text-sm">{influencePanel.lastSync || "Never"}</p>
     </div>
     <div className="border-[3px] border-black rounded-xl p-3 bg-white">
      <p className="font-black text-[11px] uppercase tracking-wide">Sync Run Summary (raw)</p>
      <pre className="text-[11px] font-mono whitespace-pre-wrap break-words max-h-48 overflow-auto bg-gray-50 border border-black/20 rounded-lg p-3">
       {JSON.stringify(influencePanel.syncRunSummary, null, 2)}
      </pre>
     </div>
    </SubToolbox>

    <SubToolbox
     title="Sync Merge Policy"
     icon={<Info size={18} strokeWidth={3} />}
     paletteIndex={3}
     contentClassName="p-6 space-y-3">
     <p className="font-bold text-gray-700">
      Merge keeps prior cache and overwrites by videoId/window (no double counting). Latest-only rebuilds from scratch each run.
     </p>
     <div className="flex flex-wrap gap-3">
      <button
       onClick={() => handleMergePolicyChange("merge")}
       className={`px-4 py-2 border-[3px] border-black rounded-xl font-black uppercase text-xs tracking-wide ${
        mergePolicy === "merge"
         ? "bg-[#CCFF00] shadow-[4px_4px_0px_0px_black]"
         : "bg-white"
       }`}>
       Merge
      </button>
      <button
       onClick={() => handleMergePolicyChange("latest_only")}
       className={`px-4 py-2 border-[3px] border-black rounded-xl font-black uppercase text-xs tracking-wide ${
        mergePolicy === "latest_only"
         ? "bg-[#FFB570] shadow-[4px_4px_0px_0px_black]"
         : "bg-white"
       }`}>
       Latest-only
      </button>
     </div>
    </SubToolbox>

    <SubToolbox
     title="Local Data Inspector"
     icon={<Database size={18} strokeWidth={3} />}
     paletteIndex={1}
     contentClassName="p-6 space-y-4">
     <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-black uppercase">
      <div className="border-[3px] border-black rounded-xl p-3 bg-white">
       <div className="text-black/60">Analytics</div>
       <div className="text-base">{bytesByCategory.analytics}</div>
      </div>
      <div className="border-[3px] border-black rounded-xl p-3 bg-white">
       <div className="text-black/60">Uploads</div>
       <div className="text-base">{bytesByCategory.uploads}</div>
      </div>
      <div className="border-[3px] border-black rounded-xl p-3 bg-white">
       <div className="text-black/60">Auth</div>
       <div className="text-base">{bytesByCategory.auth}</div>
      </div>
      <div className="border-[3px] border-black rounded-xl p-3 bg-white">
       <div className="text-black/60">Preferences</div>
       <div className="text-base">{bytesByCategory.preferences}</div>
      </div>
      <div className="border-[3px] border-black rounded-xl p-3 bg-white">
       <div className="text-black/60">AI</div>
       <div className="text-base">{bytesByCategory.ai}</div>
      </div>
      <div className="border-[3px] border-black rounded-xl p-3 bg-white">
       <div className="text-black/60">Other</div>
       <div className="text-base">{bytesByCategory.other}</div>
      </div>
     </div>

     <div className="flex flex-wrap items-center justify-between gap-3">
      <label className="flex items-center gap-2 font-black uppercase text-xs">
       <input
        type="checkbox"
        className="h-4 w-4 accent-black"
        checked={inspectorShowSensitive}
        onChange={(e) => setInspectorShowSensitive(e.target.checked)}
       />
       Show sensitive values
      </label>
      <div className="flex flex-wrap gap-2">
       <button
        onClick={async () => clearCachedDataSoft()}
        className="pop-button bg-[#FFB570] text-black px-4 py-2 text-xs">
        Clear cached data (safe)
       </button>
       <button
        onClick={async () => {
         if (!confirm("Factory reset EVERYTHING? This clears all saved keys, preferences, auth, and caches.")) return
         await factoryResetAll()
        }}
        className="pop-button bg-black text-white px-4 py-2 text-xs">
        Factory reset
       </button>
      </div>
     </div>

     <div className="overflow-x-auto border-[3px] border-black rounded-2xl bg-white">
      <table className="w-full text-xs">
       <thead className="bg-[#FFFF61]">
        <tr>
         <th className="text-left p-3 font-black uppercase tracking-wide">Key</th>
         <th className="text-left p-3 font-black uppercase tracking-wide">Category</th>
         <th className="text-left p-3 font-black uppercase tracking-wide">Bytes</th>
         <th className="text-left p-3 font-black uppercase tracking-wide">Preview</th>
         <th className="text-left p-3 font-black uppercase tracking-wide">Actions</th>
        </tr>
       </thead>
       <tbody>
        {localDataEntries.map((entry) => (
         <tr key={entry.key} className="border-t border-black/20">
          <td className="p-3 font-mono">{entry.key}</td>
          <td className="p-3 font-bold">{entry.category}</td>
          <td className="p-3">{entry.bytes}</td>
          <td className="p-3 max-w-[520px]">
           <span className="font-mono text-[11px]">{entry.previewRedacted}</span>
          </td>
          <td className="p-3">
           <div className="flex flex-wrap gap-2">
            <button
             onClick={() => setInspectorSelectedKey(entry.key)}
             className="px-3 py-2 border-[2px] border-black rounded-lg font-black uppercase text-[10px] bg-white shadow-[2px_2px_0px_0px_black]">
             View
            </button>
            <button
             onClick={() => downloadKey(entry.key, !inspectorShowSensitive)}
             className="px-3 py-2 border-[2px] border-black rounded-lg font-black uppercase text-[10px] bg-white shadow-[2px_2px_0px_0px_black]">
             Download
            </button>
           </div>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    </SubToolbox>

    {inspectorSelectedKey ? (
     <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] overflow-hidden">
       <div className="flex items-center justify-between p-4 border-b-[4px] border-black bg-[#CCFF00]">
        <div className="min-w-0">
         <p className="font-black uppercase text-xs tracking-wide">Local Key</p>
         <p className="font-mono text-sm truncate">{inspectorSelectedKey}</p>
        </div>
        <button
         onClick={() => setInspectorSelectedKey(null)}
         className="px-4 py-2 border-[3px] border-black rounded-xl font-black uppercase text-xs bg-white shadow-[3px_3px_0px_0px_black]">
         Close
        </button>
       </div>
       <div className="p-4">
        <pre className="text-[11px] font-mono whitespace-pre-wrap break-words max-h-[70vh] overflow-auto bg-gray-50 border border-black/20 rounded-lg p-3">
         {readLocalData(inspectorSelectedKey, { redact: !inspectorShowSensitive })}
        </pre>
       </div>
      </div>
     </div>
    ) : null}

	   <SubToolbox
	    title="Ingest Mode"
	    icon={<Info size={18} strokeWidth={3} />}
	    paletteIndex={3}
    contentClassName="p-6 space-y-4">
    <p className="font-bold text-gray-700">
     Choose which pipeline mode the architecture reads from.
    </p>
    <div className="flex flex-wrap gap-3">
     {ingestModes.map((mode) => (
      <button
       key={mode}
       onClick={() => handleModeChange(mode)}
       className={`px-4 py-2 border-[3px] border-black rounded-xl font-black uppercase text-xs tracking-wide ${
        ingestMode === mode
         ? "bg-[#FFFF61] shadow-[4px_4px_0px_0px_black]"
         : "bg-white"
       }`}>
       {mode}
      </button>
     ))}
    </div>
   </SubToolbox>

   <SubToolbox
    title="Master Tables"
    icon={<Database size={18} strokeWidth={3} />}
    paletteIndex={4}
    contentClassName="p-0 overflow-hidden">
    <div className="overflow-x-auto">
     <table className="w-full text-sm">
      <thead className="bg-[#CCFF00]">
       <tr>
        <th className="text-left p-3 font-black uppercase tracking-wide">Table</th>
        <th className="text-left p-3 font-black uppercase tracking-wide">Rows</th>
       </tr>
      </thead>
      <tbody>
       {tableSummary.map((entry) => (
        <tr key={entry.table} className="border-t border-black/20">
         <td className="p-3 font-bold">{entry.label}</td>
         <td className="p-3">{entry.count}</td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </SubToolbox>

   <SubToolbox
    title="Naming Governance"
    icon={<Info size={18} strokeWidth={3} />}
    paletteIndex={5}
    contentClassName="p-0 overflow-hidden">
    <div className="overflow-x-auto">
     <table className="w-full text-xs">
      <thead className="bg-[#40C6E9]">
       <tr>
        <th className="p-2 text-left font-black uppercase">Canonical</th>
        <th className="p-2 text-left font-black uppercase">Nickname</th>
        <th className="p-2 text-left font-black uppercase">Common</th>
        <th className="p-2 text-left font-black uppercase">Short</th>
       </tr>
      </thead>
      <tbody>
       {DEFAULT_NAMING_TABLE.map((entry) => (
        <tr key={entry.canonicalKey} className="border-t border-black/20">
         <td className="p-2 font-mono">{entry.canonicalKey}</td>
         <td className="p-2">{entry.nickname}</td>
         <td className="p-2">{entry.commonName}</td>
         <td className="p-2">{entry.shortName}</td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </SubToolbox>

   <SubToolbox
    title="Full Export"
    icon={<Download size={18} strokeWidth={3} />}
    paletteIndex={6}
    contentClassName="p-6 space-y-4">
    <p className="font-bold text-gray-700">
     Download raw cache snapshots, canonical master tables (CSV + JSON), manifest,
     and trust report in one zip.
    </p>
    <button
      onClick={handleExport}
      className="pop-button bg-[#FFB570] text-black px-6 py-3 text-sm flex items-center gap-2">
      <Download size={16} />
      Export Data Bundle
    </button>
    {exportStatus ? <p className="text-sm font-bold text-gray-700">{exportStatus}</p> : null}
   </SubToolbox>
  </div>
 )
}

export default DataTransparencyCenter
