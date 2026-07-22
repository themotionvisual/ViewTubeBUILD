import React, { useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Brain, Database, Download, FileJson, GitBranch, ShieldCheck, Upload, Zap } from "lucide-react"
import { useBrain } from "../../../context/useBrain"
import { legacyAccountBridge } from "../../../services/account/legacyAccountBridge"
import { useUnifiedAccount } from "../../../context/UnifiedAccountContext"
import { buildAccountRoute } from "../../../services/account/accountContracts"
import {
 VT_SYNC_LOCAL_ANALYTICS_FLAG,
 VT_SYNC_UPSTREAM_REPO_PATH,
 buildVtSyncBrainContext,
 buildVtSyncBrainContextText,
 getVtSyncSnapshot,
 normalizeVtSyncSnapshot,
 runVtSyncLocalSync,
 saveVtSyncSnapshot,
 toVtSyncRawAppExport,
 type VtSyncBrainContext,
 type VtSyncLocalSyncProgress,
 type VtSyncSnapshot,
 VT_SYNC_SERVER_ACCOUNT_TOKEN,
 applyVtSyncPrivacyFilters,
 readVtSyncPrivacyFilters,
 type VtSyncPrivacyFilters,
} from ".."
import { VtSyncControllerPanel } from "./VtSyncControllerPanel"
import { VtSyncToolboxDataTable } from "./toolbox-table/VtSyncToolboxDataTable"
import "./VtSyncLocalAnalyticsPage.css"
import { VtSyncDataVisualsToolbox } from "./VtSyncDataVisualsToolbox"

const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {}
const flagEnabled = String(viteEnv.VITE_USE_VT_SYNC_LOCAL_ANALYTICS || "false") === "true"

const shellCard = "rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0_0_#000]"
const pill = "rounded-full border-[3px] border-black px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black"

const numberText = (value: unknown): string => {
 if (typeof value === "number" && Number.isFinite(value)) return value.toLocaleString()
 if (typeof value === "string" && value.trim()) return value
 return "0"
}

const VtSyncStatCard: React.FC<{ label: string; value: React.ReactNode; tone: string; sub?: string }> = ({ label, value, tone, sub }) => (
 <section className={`${shellCard} p-5`} style={{ backgroundColor: tone }}>
  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-black/60">{label}</div>
  <div className="mt-2 text-3xl font-black uppercase tracking-[-0.05em] text-black">{value}</div>
  {sub ? <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black/60">{sub}</div> : null}
 </section>
)

const ProgressRail: React.FC<{ progress: VtSyncLocalSyncProgress | null }> = ({ progress }) => {
 if (!progress) return null
 return (
  <section className={`${shellCard} bg-white p-5`}>
   <div className="mb-4 flex items-center justify-between gap-3">
    <div>
     <h2 className="text-2xl font-black uppercase tracking-[-0.04em]">Sync Progress</h2>
     <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-black/55">Run ID: {progress.runId}</p>
    </div>
    <span className={`rounded-full border-[3px] border-black px-4 py-2 text-[10px] font-black uppercase ${progress.status === "complete" ? "bg-[#4FFF5B]" : progress.status === "failed" ? "bg-[#FF8AAF]" : "bg-[#FFFF61]"}`}>{progress.status}</span>
   </div>
   <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
    {progress.phases.map((phase) => (
     <div key={phase.id} className="rounded-[16px] border-[3px] border-black bg-[#f3f4f6] p-3">
      <div className="text-xs font-black uppercase tracking-[0.08em]">{phase.label}</div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.08em]">
       <span className={`rounded-full border-[2px] border-black px-2 py-1 ${phase.status === "complete" ? "bg-[#4FFF5B]" : phase.status === "failed" ? "bg-[#FF8AAF]" : phase.status === "running" ? "bg-[#FFFF61]" : "bg-white"}`}>{phase.status}</span>
       <span>{phase.rows} rows</span>
      </div>
      {phase.error || phase.message ? <div className="mt-2 text-[10px] font-bold uppercase leading-relaxed tracking-[0.05em] text-black/60">{phase.error || phase.message}</div> : null}
     </div>
    ))}
   </div>
  </section>
 )
}

const VtSyncLocalAnalyticsPage: React.FC = () => {
 const navigate = useNavigate()
 const { emitSignal, consultBrain } = useBrain()
 const account = useUnifiedAccount()
 const [snapshot, setSnapshot] = useState<VtSyncSnapshot>(() => getVtSyncSnapshot())
 const [privacyFilters, setPrivacyFilters] = useState<VtSyncPrivacyFilters>(() => readVtSyncPrivacyFilters())
 const consumerSnapshot = useMemo(
  () => applyVtSyncPrivacyFilters(snapshot, privacyFilters),
  [privacyFilters, snapshot],
 )
 const [brainContext, setBrainContext] = useState<VtSyncBrainContext>(() => buildVtSyncBrainContext(snapshot, privacyFilters))
 const [brainResult, setBrainResult] = useState<string>("")
 const [syncProgress, setSyncProgress] = useState<VtSyncLocalSyncProgress | null>(null)
 const [syncError, setSyncError] = useState<string>("")
 const [busy, setBusy] = useState(false)
 const [authTick, setAuthTick] = useState(0)
 const jsonInputRef = useRef<HTMLInputElement | null>(null)

 const authReady = useMemo(
  () => account.serverEnabled
   ? account.snapshot.authentication.status === "authenticated" && account.snapshot.google.youtubeScopesGranted
   : legacyAccountBridge.isAuthenticated(),
  [account.serverEnabled, account.snapshot.authentication.status, account.snapshot.google.youtubeScopesGranted, authTick],
 )
 const sessionMeta = useMemo(() => legacyAccountBridge.getSessionMeta(), [authTick])

 const publishSnapshot = (next: VtSyncSnapshot) => {
  setSnapshot(next)
  setBrainContext(buildVtSyncBrainContext(next, privacyFilters))
 }

 const updatePrivacyFilters = (next: VtSyncPrivacyFilters) => {
  setPrivacyFilters(next)
  setBrainContext(buildVtSyncBrainContext(snapshot, next))
 }

 const refreshSnapshot = () => {
  const next = getVtSyncSnapshot({ snapshotId: `vt-sync-refresh-${Date.now()}`, capturedAt: new Date().toISOString() })
  publishSnapshot(next)
  setSyncError("")
 }

 const login = async () => {
  setBusy(true)
  setSyncError("")
  try {
   if (account.serverEnabled) navigate(buildAccountRoute(account.intent, "/local-analytics"))
   else await legacyAccountBridge.login()
   setAuthTick((tick) => tick + 1)
  } catch (error) {
   setSyncError(error instanceof Error ? error.message : String(error))
  } finally {
   setBusy(false)
  }
 }

 const startSync = async (categoryIds: string[]) => {
  setBusy(true)
  setSyncError("")
  try {
   let token = account.serverEnabled && account.snapshot.google.youtubeScopesGranted
    ? VT_SYNC_SERVER_ACCOUNT_TOKEN
    : legacyAccountBridge.getAccessToken()
   if (!token) {
    if (account.serverEnabled) {
     navigate(buildAccountRoute(account.intent, "/local-analytics"))
     return
    }
    await legacyAccountBridge.login()
    token = legacyAccountBridge.getAccessToken()
    setAuthTick((tick) => tick + 1)
   }
   if (!token) throw new Error("No valid Google access token is available after authorization.")
   const next = await runVtSyncLocalSync({
    token,
   selectedCategories: categoryIds,
   previousSnapshot: snapshot,
   onProgress: setSyncProgress,
   onSnapshotCommit: publishSnapshot,
   })
   publishSnapshot(next)
   await emitSignal("vt-sync-local-analytics", "local_sync_complete", {
    snapshotId: next.snapshotId,
    categories: categoryIds,
    manifest: next.syncManifest,
    note: "Local VT-SYNC page sync only. No canonical sink or Performance Hub writes.",
   })
  } catch (error) {
   setSyncError(error instanceof Error ? error.message : String(error))
  } finally {
   setBusy(false)
  }
 }

 const sendToBrain = async () => {
  setBusy(true)
  try {
   const context = buildVtSyncBrainContext(snapshot, privacyFilters)
   setBrainContext(context)
   const response = await consultBrain("vt-sync-local-analytics", {
    task: "Analyze the current VT-SYNC local page snapshot and suggest the safest next VT-SYNC page action. Do not suggest canonical or Performance Hub bridging yet.",
    vtSyncContext: context,
   })
   setBrainResult(typeof response === "string" ? response : JSON.stringify(response, null, 2))
  } finally {
   setBusy(false)
  }
 }

 const copyBrainContext = async () => {
  const text = buildVtSyncBrainContextText(snapshot, privacyFilters)
  if (navigator.clipboard) await navigator.clipboard.writeText(text)
  setBrainResult("VT-SYNC Brain context copied to clipboard.")
 }

 const exportSnapshotJson = () => {
  const latestSnapshot = snapshot.videos.length || snapshot.dailyMetrics.length ? snapshot : getVtSyncSnapshot()
  publishSnapshot(latestSnapshot)
  const blob = new Blob([JSON.stringify(toVtSyncRawAppExport(latestSnapshot), null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `viewtube_raw_data_${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
 }

 const importSnapshotJson = async (file: File | null | undefined) => {
  if (!file) return
  setBusy(true)
  setSyncError("")
  try {
   const raw = await file.text()
   const parsed = JSON.parse(raw) as Record<string, unknown>
   const imported = normalizeVtSyncSnapshot({
    ...parsed,
    source: "manual",
    snapshotId: `vt-sync-import-${Date.now()}`,
    capturedAt: new Date().toISOString(),
   })
   saveVtSyncSnapshot(imported)
   publishSnapshot(imported)
   setBrainResult(`Imported ${file.name}. Data tables now read from the uploaded VT-SYNC JSON snapshot.`)
  } catch (error) {
   setSyncError(`JSON import failed: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
   if (jsonInputRef.current) jsonInputRef.current.value = ""
   setBusy(false)
  }
 }

 return (
  <div className="vt-sync-local-page min-h-screen bg-[#f3f4f6] px-4 py-6 text-black sm:px-6 lg:px-8">
   <div className="mx-auto max-w-[1500px] space-y-6">
    <header className={`${shellCard} overflow-hidden bg-[#C9F830]`}>
     <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="p-6 sm:p-8">
       <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className={`${pill} bg-white`}>VT-SYNC LOCAL</span>
        <span className={`${pill} ${flagEnabled ? "bg-[#4FFF5B]" : "bg-[#FFE357]"}`}>{flagEnabled ? "FLAG ON" : "FLAG OFF"}</span>
        <span className={`${pill} bg-[#FF8AAF]`}>NO CANONICAL WRITES</span>
       </div>
       <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.85] tracking-[-0.08em] sm:text-7xl">
        VT-SYNC Tools Page
       </h1>
       <p className="mt-5 max-w-3xl text-sm font-bold uppercase leading-relaxed tracking-[0.08em]">
        This page runs VT-SYNC sync tools, data tables, diagnostics, and Brain context locally first. It uses the Google OAuth token for YouTube APIs but does not write into canonical analytics or alter Performance Hub behavior.
       </p>
      </div>
      <div className="border-t-[4px] border-black bg-white p-6 lg:border-l-[4px] lg:border-t-0">
       <div className="grid gap-3 text-xs font-black uppercase tracking-[0.14em]">
        <div className="flex items-center gap-3 rounded-[16px] border-[3px] border-black bg-[#59BFFF] p-4">
         <GitBranch className="h-5 w-5" />
         <span>Upstream: {VT_SYNC_UPSTREAM_REPO_PATH}</span>
        </div>
        <div className="flex items-center gap-3 rounded-[16px] border-[3px] border-black bg-[#FF83EA] p-4">
         <ShieldCheck className="h-5 w-5" />
         <span>OAuth: {authReady ? "Connected" : "Not connected"}</span>
        </div>
        <div className="flex items-center gap-3 rounded-[16px] border-[3px] border-black bg-[#FFFF61] p-4">
         <Database className="h-5 w-5" />
         <span>Storage: VT-SYNC local snapshot only</span>
        </div>
       </div>
      </div>
     </div>
    </header>

    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
     <VtSyncStatCard label="Channel" value={snapshot.channelName || "No Channel"} tone="#ffffff" sub={snapshot.channelCustomUrl || snapshot.source} />
     <VtSyncStatCard label="Videos" value={consumerSnapshot.videos.length.toLocaleString()} tone="#59BFFF" sub="privacy-filtered rows" />
     <VtSyncStatCard label="Subscribers" value={numberText(snapshot.subscriberCount)} tone="#FF83EA" sub="Data API metadata" />
     <VtSyncStatCard label="Total Views" value={numberText(snapshot.channelViewCount || (snapshot.channelTotals as any)?.lifetime?.views)} tone="#FFFF61" sub="Channel overview input" />
     <VtSyncStatCard label="Session" value={authReady ? "Ready" : "Needed"} tone="#4FFF5B" sub={account.serverEnabled ? "HttpOnly account session" : sessionMeta.expiresAt ? `expires ${new Date(sessionMeta.expiresAt).toLocaleTimeString()}` : "Legacy OAuth migration"} />
    </section>

    {syncError ? (
     <section className={`${shellCard} bg-[#FF8AAF] p-5 text-sm font-black uppercase tracking-[0.1em]`}>
      {syncError}
     </section>
    ) : null}

    <VtSyncControllerPanel isAuthenticated={authReady} isSyncing={busy} onLogin={login} onStartSync={startSync} />
    <ProgressRail progress={syncProgress} />
    <VtSyncToolboxDataTable snapshot={snapshot} privacyFilters={privacyFilters} onPrivacyFiltersChange={updatePrivacyFilters} />
    <VtSyncDataVisualsToolbox snapshot={consumerSnapshot} />

    <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
     <div className={`${shellCard} bg-white p-5`}>
      <div className="mb-4 flex items-start justify-between gap-3">
       <div>
        <h2 className="text-2xl font-black uppercase tracking-[-0.04em]">Local Actions</h2>
       <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-black/55">Snapshot refresh and Brain context only. No Performance Hub bridge.</p>
       </div>
       <ShieldCheck className="h-8 w-8" />
      </div>
      <div className="grid gap-3">
       <button type="button" onClick={refreshSnapshot} disabled={busy} className={`${pill} bg-[#59BFFF] shadow-[4px_4px_0_0_#000] disabled:opacity-60`}>Refresh Local Snapshot</button>
       <button type="button" onClick={() => jsonInputRef.current?.click()} disabled={busy} className={`${pill} bg-[#C9F830] shadow-[4px_4px_0_0_#000] disabled:opacity-60`}><Upload className="mr-2 inline h-4 w-4" /> Import VT-SYNC JSON</button>
       <button type="button" onClick={exportSnapshotJson} className={`${pill} bg-white shadow-[4px_4px_0_0_#000]`}><Download className="mr-2 inline h-4 w-4" /> Export VT-SYNC JSON</button>
       <input ref={jsonInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => importSnapshotJson(event.target.files?.[0])} />
       <button type="button" onClick={sendToBrain} disabled={busy} className={`${pill} bg-[#FF83EA] shadow-[4px_4px_0_0_#000] disabled:opacity-60`}><Brain className="mr-2 inline h-4 w-4" /> Ask Brain About This Page</button>
       <button type="button" onClick={copyBrainContext} disabled={busy} className={`${pill} bg-[#FFFF61] shadow-[4px_4px_0_0_#000] disabled:opacity-60`}><Zap className="mr-2 inline h-4 w-4" /> Copy Brain Context</button>
       <div className="grid grid-cols-2 gap-3 pt-1">
        <Link to="/performance" className={`${pill} bg-white text-center shadow-[4px_4px_0_0_#000]`}>Performance Hub</Link>
        <Link to="/" className={`${pill} bg-white text-center shadow-[4px_4px_0_0_#000]`}>Dashboard</Link>
       </div>
      </div>
     </div>

     <div className={`${shellCard} bg-[#101010] p-5 text-white`}>
      <div className="mb-4 flex items-center justify-between gap-3">
       <div>
        <h2 className="text-2xl font-black uppercase tracking-[-0.04em]">Brain Context</h2>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-white/55">Analytics-specific context is built on demand without rendering the full JSON payload.</p>
       </div>
       <FileJson className="h-8 w-8 text-[#C9F830]" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
       {Object.entries(brainContext.facts).slice(0, 8).map(([key, value]) => (
        <div key={key} className="rounded-[14px] border-[2px] border-white/25 bg-white/5 p-3">
         <div className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45">{key}</div>
         <div className="mt-1 truncate text-sm font-black uppercase tracking-[-0.02em] text-[#C9F830]">{typeof value === "object" ? JSON.stringify(value) : String(value)}</div>
        </div>
       ))}
      </div>
      <p className="mt-4 rounded-[14px] border-[2px] border-white/25 bg-black/35 p-3 text-[11px] font-bold uppercase leading-relaxed tracking-[0.08em] text-white/60">
       Full Brain context is available through Copy Brain Context or Ask Brain. The page avoids rendering the raw JSON block for performance.
      </p>
      {brainResult ? (
       <div className="mt-4 rounded-[18px] border-[3px] border-[#C9F830] bg-white p-4 text-xs font-bold leading-relaxed text-black whitespace-pre-wrap">
        {brainResult}
       </div>
      ) : null}
     </div>
    </section>
   </div>
  </div>
 )
}

export default VtSyncLocalAnalyticsPage
