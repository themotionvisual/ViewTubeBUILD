import React, { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Copy } from "lucide-react"
import { useBrain } from "../../../context/useBrain"
import { legacyAccountBridge } from "../../../services/account/legacyAccountBridge"
import { useUnifiedAccount } from "../../../context/UnifiedAccountContext"
import {
 getVtSyncSnapshot,
 runVtSyncLocalSync,
 type VtSyncCategoryDefinition,
 type VtSyncDatasetFreshness,
 type VtSyncLocalSyncProgress,
 type VtSyncSnapshot,
 VT_SYNC_SERVER_ACCOUNT_TOKEN,
 VT_SYNC_CATEGORY_OPTIONS,
 expandVtSyncCategoryDependencies,
 getVtSyncDefaultCategoryIds,
 applyVtSyncPrivacyFilters,
 readVtSyncPrivacyFilters,
 type VtSyncPrivacyFilters,
 loadVtSyncManualImports,
 mergeVtSyncManualImportsIntoSnapshot,
 type VtSyncManualImportState,
} from ".."
import { ToolboxScaffold } from "../../../components/Toolbox"
import { VtSyncControllerPanel } from "./VtSyncControllerPanel"
import { buildVtSyncCreatorHeroModel, VtSyncCreatorHero } from "./VtSyncCreatorHero"
import { VtSyncToolboxDataTable } from "./toolbox-table/VtSyncToolboxDataTable"
import "./VtSyncLocalAnalyticsPage.css"
// Lazy-load the DATA VISUALS toolbox: it pulls in ~24 Recharts modules and the
// GraphsPageCharts library, none of which the user needs before the analytics
// page finishes its first paint. Suspending it here trims the initial payload
// on the mobile-critical /analytics landing route.
const VtSyncDataVisualsToolbox = lazy(() =>
 import("./VtSyncDataVisualsToolbox").then((module) => ({ default: module.VtSyncDataVisualsToolbox })),
)
import { RetroLcd, RetroLedRow, RetroRivets, RetroVuMeter, type RetroLedSpec } from "./VtSyncRetroChrome"

const syncStatusLabel = (status?: string) => {
 switch (status) {
  case "idle": return "Waiting"
  case "pending": return "Waiting"
  case "running": return "Syncing"
  case "complete": return "Complete"
  case "synced": return "Synced"
  case "partial": return "Partial: Saved What YouTube Returned"
  case "failed": return "Failed: Check Message"
  case "skipped": return "Skipped"
  case "stale": return "Previous Snapshot"
  case "placeholder": return "Waiting"
  case "never": return "Never Synced"
  default: return String(status || "Unknown")
 }
}

const syncStatusTone = (status?: string) => {
 if (status === "complete" || status === "synced") return "#3FEE56"
 if (status === "partial") return "#FFDA47"
 if (status === "failed") return "#FA618A"
 if (status === "running") return "#FFDA47"
 if (status === "skipped" || status === "stale" || status === "placeholder") return "#FFA85C"
 if (status === "never") return "#e9eaec"
 return "#ffffff"
}

const freshnessStatusRank: Record<string, number> = { failed: 4, partial: 3, placeholder: 2, stale: 1, synced: 0 }

const sourceApiLabel = (value: string) => ({
 youtube_data_v3: "YouTube Data API v3",
 youtube_analytics_v2: "YouTube Analytics API",
 google_workspace: "Google Workspace API",
 derived: "Derived locally",
 local_import: "Local import",
}[value] || value.replace(/_/g, " "))

const formatRelativeTime = (iso?: string): string => {
 if (!iso) return "Never"
 const ms = Date.now() - new Date(iso).getTime()
 if (!Number.isFinite(ms)) return "Never"
 if (ms < 0 || ms < 60_000) return "Just now"
 const min = Math.floor(ms / 60_000)
 if (min < 60) return `${min}m ago`
 const hr = Math.floor(min / 60)
 if (hr < 24) return `${hr}h ago`
 const day = Math.floor(hr / 24)
 if (day < 30) return `${day}d ago`
 return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

type DatasetStatusRow = {
 category: VtSyncCategoryDefinition
 status: string
 rows: number
 updatedAt?: string
 missingMetrics: string[]
 source: string
}

const summarizeDatasetFreshness = (
 freshness: VtSyncDatasetFreshness | undefined,
 category: VtSyncCategoryDefinition,
): DatasetStatusRow => {
 const entries = Object.values(freshness || {}).filter((entry) => entry.phase === category.id)
 if (entries.length === 0) {
  return {
   category,
   status: "never",
   rows: 0,
   updatedAt: undefined,
   missingMetrics: [],
   source: sourceApiLabel(category.sourceApi),
  }
 }
 const status = entries.reduce((worst, entry) => {
  const candidate = entry.status || "synced"
  return (freshnessStatusRank[candidate] ?? -1) > (freshnessStatusRank[worst] ?? -1) ? candidate : worst
 }, entries[0].status || "synced")
 const updatedAt = entries.reduce<string | undefined>(
  (latest, entry) => (entry.updatedAt && (!latest || entry.updatedAt > latest) ? entry.updatedAt : latest),
  undefined,
 )
 return {
  category,
  status,
  rows: Math.max(...entries.map((entry) => entry.rows || 0)),
  updatedAt,
  missingMetrics: entries.flatMap((entry) => entry.missingMetrics || []),
  source: sourceApiLabel(category.sourceApi),
 }
}

const writeClipboardText = async (text: string) => {
 if (navigator.clipboard?.writeText) {
  await navigator.clipboard.writeText(text)
  return
 }
 const textarea = document.createElement("textarea")
 textarea.value = text
 textarea.setAttribute("readonly", "true")
 textarea.style.position = "fixed"
 textarea.style.left = "-9999px"
 document.body.appendChild(textarea)
 textarea.select()
 document.execCommand("copy")
 document.body.removeChild(textarea)
}

export type VtSyncUnifiedProgressRow = ReturnType<typeof summarizeDatasetFreshness> & {
 phaseLabel: string
 displayStatus: string
 displayRows: number
 message: string
}

export const claimVtSyncSyncRequest = (lock: { current: boolean }): boolean => {
 if (lock.current) return false
 lock.current = true
 return true
}

export const buildVtSyncUnifiedProgressRows = (
 progress: VtSyncLocalSyncProgress | null,
 datasetFreshness?: VtSyncDatasetFreshness,
): VtSyncUnifiedProgressRow[] => {
 const liveByPhase = new Map((progress?.phases || []).map((phase) => [phase.id, phase]))
 const requested = new Set(progress?.requestedCategoryIds || [])
 const requestedPhaseCounts = new Map<string, number>()
 VT_SYNC_CATEGORY_OPTIONS.forEach((category) => {
  if (!requested.has(category.id)) return
  requestedPhaseCounts.set(category.runtimePhaseId, (requestedPhaseCounts.get(category.runtimePhaseId) || 0) + 1)
 })
 return VT_SYNC_CATEGORY_OPTIONS.map((category) => {
  const stored = summarizeDatasetFreshness(datasetFreshness, category)
  const live = liveByPhase.get(category.runtimePhaseId)
  const isLiveRequest = Boolean(progress?.status === "running" && requested.has(category.id) && live)
  const hasDedicatedLiveRowCount = requestedPhaseCounts.get(category.runtimePhaseId) === 1
  const displayStatus = isLiveRequest ? live!.status : stored.status
  return {
   ...stored,
   phaseLabel: live?.label || category.phase.replace(/_/g, " "),
   displayStatus,
   displayRows: isLiveRequest && hasDedicatedLiveRowCount ? live!.rows : stored.rows,
   message: isLiveRequest
    ? live!.error || live!.message || (live!.status === "pending" ? "Waiting for prerequisite phases." : "Sync is active.")
    : stored.missingMetrics.length
     ? `Missing: ${stored.missingMetrics.join(", ")}`
     : stored.updatedAt ? "Stored dataset is available." : "This dataset has not been synced yet.",
  }
 })
}

const ProgressRail: React.FC<{ progress: VtSyncLocalSyncProgress | null; datasetFreshness?: VtSyncDatasetFreshness }> = ({ progress, datasetFreshness }) => {
 const [copyStatus, setCopyStatus] = useState("")
 const unifiedRows = useMemo(
  () => buildVtSyncUnifiedProgressRows(progress, datasetFreshness),
  [datasetFreshness, progress],
 )
 const datasetRows = useMemo(
  () => unifiedRows.map(({ phaseLabel: _phaseLabel, displayStatus: _displayStatus, displayRows: _displayRows, message: _message, ...row }) => row),
  [unifiedRows],
 )
 const latestDatasetAt = useMemo(
  () => [...datasetRows]
   .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
   .find((row) => row.updatedAt)?.updatedAt,
  [datasetRows],
 )
 const visibleUnifiedRows = useMemo(
  () => [...unifiedRows].sort((left, right) => {
   const leftRequested = progress?.requestedCategoryIds.includes(left.category.id) ? 1 : 0
   const rightRequested = progress?.requestedCategoryIds.includes(right.category.id) ? 1 : 0
   return rightRequested - leftRequested || new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime()
  }),
  [progress?.requestedCategoryIds, unifiedRows],
 )
 const datasetTally = datasetRows.reduce<Record<string, number>>((acc, row) => {
  acc[row.status] = (acc[row.status] || 0) + 1
  return acc
 }, {})
 const datasetTotalRows = datasetRows.reduce((sum, row) => sum + row.rows, 0)
 const totalDatasetsCount = datasetRows.length || 1
 const syncLeds: RetroLedSpec[] = [
  { id: "live", label: progress?.status === "running" ? "Live sync in progress" : "No active sync", tone: "#36E0F6", lit: progress?.status === "running", pulse: true },
  { id: "synced", label: `${datasetTally.synced || 0} datasets synced`, tone: "#3FEE56", lit: (datasetTally.synced || 0) > 0 },
  { id: "partial", label: `${datasetTally.partial || 0} datasets partial`, tone: "#FFDA47", lit: (datasetTally.partial || 0) > 0 },
  { id: "failed", label: `${datasetTally.failed || 0} datasets failed`, tone: "#FA618A", lit: (datasetTally.failed || 0) > 0 },
 ]
 const copyProgressSummary = async () => {
  const datasetLines = [
   "",
   "Stored dataset status",
   `Latest dataset update: ${formatRelativeTime(latestDatasetAt)}`,
   `Stored rows shown by dataset cards: ${datasetTotalRows.toLocaleString()}`,
   `Successes: ${(datasetTally.synced || 0).toLocaleString()}`,
   `Partials: ${(datasetTally.partial || 0).toLocaleString()}`,
   `Failures: ${(datasetTally.failed || 0).toLocaleString()}`,
   `Never synced: ${(datasetTally.never || 0).toLocaleString()}`,
   "",
   ...visibleUnifiedRows.map((row) => [
    `- ${row.category.label}`,
    `  Phase: ${row.phaseLabel}`,
    `  Status: ${syncStatusLabel(row.displayStatus)}`,
    `  Rows: ${row.displayRows.toLocaleString()}`,
    `  Updated: ${row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "Never"}`,
    `  Message: ${row.message}`,
   ].join("\n")),
  ]
  const lines = progress ? [
   "ViewTube Annalytics Progress Summary",
   `Run ID: ${progress.runId}`,
   `Started: ${new Date(progress.startedAt).toLocaleString()}`,
   `Status: ${syncStatusLabel(progress.status)}`,
   progress.completedAt ? `Completed: ${new Date(progress.completedAt).toLocaleString()}` : "Completed: not yet",
   "",
   ...datasetLines,
  ] : [
   "ViewTube Annalytics Progress Summary",
   "Status: No active sync yet.",
   "Next step: Choose datasets in YouTube Data Sync, then start a sync.",
   ...datasetLines,
  ]
  try {
   await writeClipboardText(lines.join("\n"))
   setCopyStatus("Sync progress summary copied.")
  } catch {
   setCopyStatus("Could not copy sync progress.")
  }
 }
 return (
  <ToolboxScaffold
   title="SYNC PROGRESS"
   subtitle="Dataset history, sync outcomes, rows, and recent updates."
   iconName="analytics"
   headerColor="bg-[#C0F240]"
   iconBoxColor="bg-[#36E0F6]"
   paletteIndex={3}
   embedded
   fillAvailable
   shellClassName="h-full"
   contentClassName="flex min-h-0 flex-1 flex-col vt-retro-dark-content p-4"
   outerClassName="vt-retro-shell"
   hardShadow
   headerActions={<RetroLedRow leds={syncLeds} />}
  >
   <RetroRivets />
   <div className="flex min-h-0 w-full flex-1 flex-col">
    <div className="mb-3 flex flex-wrap items-center gap-2">
     <button type="button" onClick={copyProgressSummary} className="vt-retro-switch" style={{ "--tone": "#F55EFC", "--tone-light": "#ffd6f7" } as React.CSSProperties}>
      <Copy className="h-4 w-4" aria-hidden="true" />
      Copy Sync Summary
     </button>
    </div>
   <div className="sr-only" aria-live="polite">{copyStatus}</div>
   {copyStatus ? <p className="mb-3 rounded-[12px] border-[2px] border-black bg-[#FFDA47] px-3 py-2 text-[10px] font-black uppercase tracking-[0.06em]">{copyStatus}</p> : null}
   <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border-[3px] border-black bg-[#f3f4f6]">
    <header className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-black bg-[#36E0F6] px-3.5 py-3">
     <div>
      <h3 className="vt-retro-acc-label text-[17px] tracking-[-0.01em]">Dataset and Phase Status</h3>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.08em] text-black/55">Live phase state takes precedence; stored freshness remains visible between runs.</p>
     </div>
     <RetroLcd tone="#3FEE56" className="shrink-0">{formatRelativeTime(latestDatasetAt)}</RetroLcd>
    </header>
    <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-4">
     {[
      ["Synced", datasetTally.synced || 0, "#3FEE56"],
      ["Partial", datasetTally.partial || 0, "#FFDA47"],
      ["Failed", datasetTally.failed || 0, "#FA618A"],
      ["Never", datasetTally.never || 0, "#9aa0ab"],
     ].map(([label, value, tone]) => (
      <div key={String(label)} className="rounded-[12px] border-[2px] border-black bg-[#161616] p-3 shadow-[2px_2px_0_0_#000]">
       <span className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45">{label}</span>
       <strong className="mt-1 block font-mono text-2xl font-black tabular-nums" style={{ color: String(tone), textShadow: `0 0 8px ${String(tone)}` }}>{Number(value).toLocaleString()}</strong>
       <span className="mt-2 block">
        <RetroVuMeter tone={String(tone)} percent={(Number(value) / totalDatasetsCount) * 100} />
       </span>
      </div>
     ))}
    </div>
    <div className="min-h-0 flex-1 overflow-auto border-t-[3px] border-black bg-white custom-scrollbar">
     <table className="w-full border-collapse text-left font-black uppercase tabular-nums">
      <thead className="sticky top-0 z-10 bg-black text-[9.5px] tracking-[0.08em] text-[#FFDA47]">
       <tr>
        <th scope="col" className="px-3 py-2.5">Dataset</th>
        <th scope="col" className="px-3 py-2.5">Phase</th>
        <th scope="col" className="px-3 py-2.5">Status</th>
        <th scope="col" className="px-3 py-2.5 text-right">Rows</th>
        <th scope="col" className="px-3 py-2.5">Updated</th>
        <th scope="col" className="px-3 py-2.5">Message</th>
       </tr>
      </thead>
      <tbody className="text-[10.5px]">
       {visibleUnifiedRows.map((row) => (
        <tr key={row.category.id} className="border-t-[2px] border-black align-top">
         <th scope="row" className="px-3 py-2.5">
          <span className="block text-[11px] tracking-[-0.01em]">{row.category.label}</span>
          <span className="mt-0.5 block text-[9px] tracking-[0.08em] text-black/45">{row.source}</span>
         </th>
         <td className="px-3 py-2.5 text-black/65">{row.phaseLabel}</td>
         <td className="px-3 py-2.5"><span className="inline-flex rounded-full border-[2px] border-black px-2.5 py-1 text-[9px] leading-none" style={{ backgroundColor: syncStatusTone(row.displayStatus) }}>{syncStatusLabel(row.displayStatus)}</span></td>
         <td className="px-3 py-2.5 text-right">{row.displayRows.toLocaleString()}</td>
         <td className="px-3 py-2.5 text-black/60">{formatRelativeTime(row.updatedAt)}</td>
         <td className="max-w-[260px] px-3 py-2.5 text-black/60">{row.message}</td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </section>
   </div>
  </ToolboxScaffold>
 )
}

const VtSyncLocalAnalyticsPage: React.FC = () => {
 const navigate = useNavigate()
 const { emitSignal } = useBrain()
 const account = useUnifiedAccount()
 const [snapshot, setSnapshot] = useState<VtSyncSnapshot>(() => getVtSyncSnapshot())
 const [privacyFilters, setPrivacyFilters] = useState<VtSyncPrivacyFilters>(() => readVtSyncPrivacyFilters())
 const [manualImports, setManualImports] = useState<VtSyncManualImportState>({ rowsByTableId: {}, capturedAtByTableId: {} })

 const refreshManualImports = useCallback(async () => {
  try {
   const next = await loadVtSyncManualImports()
   setManualImports(next)
  } catch {
   // IndexedDB may be unavailable (private browsing, quota exhaustion). Leave state as-is.
  }
 }, [])

 useEffect(() => {
  void refreshManualImports()
 }, [refreshManualImports])

 const mergedSnapshot = useMemo(
  () => mergeVtSyncManualImportsIntoSnapshot(snapshot, manualImports),
  [manualImports, snapshot],
 )
 const consumerSnapshot = useMemo(
  () => applyVtSyncPrivacyFilters(mergedSnapshot, privacyFilters),
  [mergedSnapshot, privacyFilters],
 )
 const [syncProgress, setSyncProgress] = useState<VtSyncLocalSyncProgress | null>(null)
 const [syncError, setSyncError] = useState<string>("")
 const [busy, setBusy] = useState(false)
 const [authTick, setAuthTick] = useState(0)
 const [controllerPanelHeight, setControllerPanelHeight] = useState<number>()
 const controllerPanelRef = useRef<HTMLDivElement | null>(null)
 const progressPanelRef = useRef<HTMLDivElement | null>(null)
 const syncRequestActiveRef = useRef(false)

 useLayoutEffect(() => {
  const node = controllerPanelRef.current
  if (!node) return
  const updateHeight = () => {
   const nextHeight = Math.ceil(node.getBoundingClientRect().height)
   setControllerPanelHeight((current) => current === nextHeight ? current : nextHeight)
  }
  updateHeight()
  if (typeof ResizeObserver === "undefined") return
  const observer = new ResizeObserver(updateHeight)
  observer.observe(node)
  return () => observer.disconnect()
 }, [])

 const authReady = useMemo(
  () => account.serverEnabled
   ? account.snapshot.authentication.status === "authenticated" && account.snapshot.google.youtubeScopesGranted
   : legacyAccountBridge.isAuthenticated(),
  [account.serverEnabled, account.snapshot.authentication.status, account.snapshot.google.youtubeScopesGranted, authTick],
 )
 const creatorHeroModel = useMemo(() => buildVtSyncCreatorHeroModel({
  authReady,
  snapshot,
  visibleVideos: consumerSnapshot.videos,
  progress: syncProgress,
  syncError,
 }), [authReady, consumerSnapshot.videos, snapshot, syncError, syncProgress])

 const scrollToPanel = (node: HTMLElement | null) => {
  if (!node) return
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  node.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
 }

 const publishSnapshot = (next: VtSyncSnapshot) => {
  setSnapshot(next)
 }

 const updatePrivacyFilters = (next: VtSyncPrivacyFilters) => {
  setPrivacyFilters(next)
 }

 const login = async () => {
  setBusy(true)
  setSyncError("")
  try {
   if (account.serverEnabled) await account.start(account.intent, "/local-analytics")
   else await legacyAccountBridge.login()
   setAuthTick((tick) => tick + 1)
  } catch (error) {
   setSyncError(error instanceof Error ? error.message : String(error))
  } finally {
   setBusy(false)
  }
 }

 const startSync = async (categoryIds: string[], retentionVideoIds?: string[]) => {
  if (!claimVtSyncSyncRequest(syncRequestActiveRef)) return
  setBusy(true)
  setSyncError("")
  try {
   let token = account.serverEnabled && account.snapshot.google.youtubeScopesGranted
    ? VT_SYNC_SERVER_ACCOUNT_TOKEN
    : legacyAccountBridge.getAccessToken()
   if (!token) {
    if (account.serverEnabled) {
      await account.start(account.intent, "/local-analytics")
      return
    }
    await legacyAccountBridge.login()
    token = legacyAccountBridge.getAccessToken()
    setAuthTick((tick) => tick + 1)
   }
   if (!token) throw new Error("No valid Google access token is available after authorization.")
   const requestedCategoryIds = expandVtSyncCategoryDependencies(categoryIds)
   const next = await runVtSyncLocalSync({
    token,
   selectedCategories: requestedCategoryIds,
   retentionVideoIds,
   previousSnapshot: snapshot,
   onProgress: setSyncProgress,
   onSnapshotCommit: publishSnapshot,
   })
   publishSnapshot(next)
   await emitSignal("vt-sync-local-analytics", "local_sync_complete", {
    snapshotId: next.snapshotId,
    categories: requestedCategoryIds,
    manifest: next.syncManifest,
    note: "Local Annalytics page sync only. No canonical sink or Performance Hub writes.",
   })
  } catch (error) {
   setSyncError(error instanceof Error ? error.message : String(error))
  } finally {
   syncRequestActiveRef.current = false
   setBusy(false)
  }
 }

 return (
  <div className="vt-sync-local-page min-h-screen bg-[#f3f4f6] px-4 py-6 text-black sm:px-6 lg:px-8">
   <div className="mx-auto max-w-[1500px] space-y-6">
    <VtSyncCreatorHero
     model={creatorHeroModel}
     onConnect={() => { void login() }}
     onRecommendedSync={() => { void startSync(getVtSyncDefaultCategoryIds()) }}
     onChooseDatasets={() => scrollToPanel(controllerPanelRef.current)}
     onViewProgress={() => scrollToPanel(progressPanelRef.current)}
    />

    <section className="grid items-start gap-6 md:grid-cols-2">
     <div ref={controllerPanelRef} className="min-w-0">
      <VtSyncControllerPanel
       isAuthenticated={authReady}
       isSyncing={busy}
       activeCategoryIds={syncProgress?.status === "running" ? syncProgress.requestedCategoryIds : []}
       datasetFreshness={snapshot.datasetFreshness}
       videos={snapshot.videos.map((video) => ({ id: video.id, title: video.title, thumbnail: video.thumbnail, views: video.metrics?.views || 0 }))}
       onLogin={login}
       onStartSync={startSync}
      />
     </div>
     <div
      ref={progressPanelRef}
      className="vt-sync-progress-height-match min-h-0 min-w-0"
      style={controllerPanelHeight ? ({ "--vt-sync-controller-height": `${controllerPanelHeight}px` } as React.CSSProperties) : undefined}
     >
      <ProgressRail progress={syncProgress} datasetFreshness={snapshot.datasetFreshness} />
     </div>
    </section>
    <VtSyncToolboxDataTable
     snapshot={snapshot}
     privacyFilters={privacyFilters}
     onPrivacyFiltersChange={updatePrivacyFilters}
     onManualImportsChange={refreshManualImports}
    />
    <Suspense fallback={<div className="min-h-[120px]" aria-hidden />}>
     <VtSyncDataVisualsToolbox snapshot={consumerSnapshot} />
    </Suspense>
   </div>
  </div>
 )
}

export default VtSyncLocalAnalyticsPage
