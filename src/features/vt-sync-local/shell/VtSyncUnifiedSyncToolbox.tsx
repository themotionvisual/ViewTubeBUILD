import React, { useMemo, useRef, useState } from "react"
import { CheckSquare, ChevronDown, ChevronRight, Copy, RefreshCw, ShieldCheck, Square } from "lucide-react"
import { ToolboxScaffold } from "../../../components/Toolbox"
import { getPaletteColor } from "../../../styles/toolboxPalette"
import { RetroAnalogToggle, RetroRivets, RetroSyncExecutionSwitch, type RetroSyncExecutionStatus } from "./VtSyncRetroChrome"
import type {
 VtSyncAnalyticsWindow,
 VtSyncCategoryGroup,
 VtSyncDatasetFreshness,
} from "../adapters/contracts"
import type { VtSyncLocalSyncProgress } from "../adapters/localSyncEngine"
import type { VtSyncVideoCatalogCoverage } from "../adapters/videoCatalogProjection"
import {
 buildVtSyncUnifiedUnitViewModels,
 getVtSyncProgressQueueSummary,
} from "./vtSyncProgressModel"
import { vtSyncCategoryCostsPerWindow } from "../adapters/windowDerivation"
import {
 ANALYTICS_WINDOWS,
 WINDOW_SHORT_LABELS,
} from "../../../services/analytics/windows"
import { selectVtSyncBaseRetentionVideos } from "../adapters/retentionSelection"
// QW#2 — classify LOGIN_ABORTED / AbortError / popup-closed rejections so
// mid-flow user cancels don't propagate as unhandled promise rejections.
import { isLoginAbortError } from "../../../services/auth/loginErrors"
import {
 expandVtSyncCategoryDependencies,
 filterVtSyncVisibleCategoryIds,
} from "../upstream/syncCategoryRegistry"
import {
 VT_SYNC_GROUP_LABELS,
 VT_SYNC_GROUP_ORDER,
 VT_SYNC_SYNC_UNITS,
 countVtSyncSelectedUnits,
 countVtSyncUnderlyingQueries,
 getVtSyncDefaultUnitIds,
 getVtSyncUnitCategoryIds,
} from "../upstream/syncUnitRegistry"

export type VtSyncRetentionVideoOption = {
 id: string
 title: string
 thumbnail?: string
 views?: number
 format?: string
 publishedAt?: string
 privacyStatus?: string
}

const GROUP_COLORS: Record<string, string> = Object.fromEntries(VT_SYNC_GROUP_ORDER.map((group, index) => [group, getPaletteColor(index * 2)]))
const formatPlainLabel = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

const buildUnitGroups = (hasContentOwner: boolean) => VT_SYNC_GROUP_ORDER
 .map((group) => ({
  group,
  label: VT_SYNC_GROUP_LABELS[group],
  units: VT_SYNC_SYNC_UNITS.filter((unit) => unit.group === group && (unit.id !== "traffic_detail_traffic_campaign_card" || hasContentOwner)),
 }))
 .filter((entry) => entry.units.length > 0)

export const VtSyncUnifiedSyncToolbox: React.FC<{
 isAuthenticated: boolean
 isSyncing: boolean
 videos: VtSyncRetentionVideoOption[]
 progress?: VtSyncLocalSyncProgress | null
 queuedCategoryIds?: string[]
 datasetFreshness?: VtSyncDatasetFreshness
 syncError?: string
 videoCatalogCoverage?: VtSyncVideoCatalogCoverage
 contentOwners?: Array<{ id: string; displayName: string }>
 activeContentOwnerId?: string | null
 onSelectContentOwner?: (ownerId: string) => Promise<void>
 onLogin: () => Promise<void>
 onStartSync: (categoryIds: string[], retentionVideoIds?: string[], forceFullVideoMetadata?: boolean, windows?: VtSyncAnalyticsWindow[]) => Promise<void>
}> = ({ isAuthenticated, isSyncing, videos, progress = null, queuedCategoryIds = [], datasetFreshness, syncError, videoCatalogCoverage, contentOwners = [], activeContentOwnerId, onSelectContentOwner, onLogin, onStartSync }) => {
 const [selected, setSelected] = useState<string[]>(() => getVtSyncDefaultUnitIds().flatMap(getVtSyncUnitCategoryIds))
 const [retentionVideoIds, setRetentionVideoIds] = useState<string[]>([])
 // Lifetime starts on, but every time window is independently toggleable.
 // The engine receives the exact selected set rather than silently forcing lifetime.
 const [selectedWindows, setSelectedWindows] = useState<VtSyncAnalyticsWindow[]>(["lifetime"])
 const [videoSearch, setVideoSearch] = useState("")
 const [openGroups, setOpenGroups] = useState<Set<VtSyncCategoryGroup>>(
  () => new Set(["channel"]),
 )
 const [expandedUnitIds, setExpandedUnitIds] = useState<Set<string>>(() => new Set())
 const [copyStatus, setCopyStatus] = useState("")
 const unitGroups = useMemo(() => buildUnitGroups(Boolean(activeContentOwnerId)), [activeContentOwnerId])
 const availableUnits = useMemo(() => unitGroups.flatMap((entry) => entry.units), [unitGroups])
 const unifiedUnitModels = useMemo(
  () => buildVtSyncUnifiedUnitViewModels(progress, datasetFreshness, queuedCategoryIds, syncError)
   .filter((unit) => unit.id !== "traffic_detail_traffic_campaign_card" || Boolean(activeContentOwnerId))
   .map((unit) => unit.id === "video_catalog" && videoCatalogCoverage
    ? { ...unit, displayRows: videoCatalogCoverage.catalogTotal }
    : unit),
  [activeContentOwnerId, datasetFreshness, progress, queuedCategoryIds, syncError, videoCatalogCoverage],
 )
 const unitModelById = useMemo(() => new Map(unifiedUnitModels.map((unit) => [unit.id, unit])), [unifiedUnitModels])
 const queueSummary = useMemo(() => getVtSyncProgressQueueSummary(progress, queuedCategoryIds), [progress, queuedCategoryIds])
 const unitTally = useMemo(() => unifiedUnitModels.reduce<Record<string, number>>((acc, unit) => {
  acc[unit.status] = (acc[unit.status] || 0) + 1
  return acc
 }, {}), [unifiedUnitModels])
 const latestDatasetAt = useMemo(() => unifiedUnitModels
  .map((unit) => unit.lastSyncedAt)
  .filter((value): value is string => Boolean(value))
  .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0], [unifiedUnitModels])
 const groupHeaderRefs = useRef(new Map<VtSyncCategoryGroup, HTMLButtonElement>())
 const selectedSet = useMemo(() => new Set(selected), [selected])
 const selectedUnitCount = useMemo(() => countVtSyncSelectedUnits(selected, availableUnits), [availableUnits, selected])
 const selectedQueryCount = useMemo(() => countVtSyncUnderlyingQueries(selected), [selected])
 const allCategoryIds = useMemo(() => [...new Set(availableUnits.flatMap((unit) => unit.categoryIds))], [availableUnits])
 const coreCategoryIds = useMemo(() => [...new Set(availableUnits.filter((unit) => unit.defaultEnabled).flatMap((unit) => unit.categoryIds))], [availableUnits])
 const recommendedCategoryIds = useMemo(() => [...new Set(getVtSyncDefaultUnitIds().flatMap(getVtSyncUnitCategoryIds))], [])
 const selectionMatches = (target: string[]) => target.length === selected.length && target.every((id) => selectedSet.has(id))
 const retentionSelectedSet = useMemo(() => new Set(retentionVideoIds), [retentionVideoIds])
 const retentionEnabled = selectedSet.has("retention")
 const sortedVideos = useMemo(() => [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)), [videos])
 const baselineRetentionSelection = useMemo(() => selectVtSyncBaseRetentionVideos(videos.map((video) => ({
  id: video.id,
  title: video.title,
  thumbnail: video.thumbnail,
  format: video.format,
  publishedAt: video.publishedAt,
  privacyStatus: video.privacyStatus,
  metrics: { views: video.views },
 }))), [videos])
 const filteredVideos = useMemo(() => {
  const query = videoSearch.trim().toLowerCase()
  if (!query) return sortedVideos
  return sortedVideos.filter((video) => video.title.toLowerCase().includes(query))
 }, [sortedVideos, videoSearch])

 const windowCost = useMemo(() => {
  const perWindowCategories = selected.filter(vtSyncCategoryCostsPerWindow)
  const derivedCount = selected.length - perWindowCategories.length
  return {
   perWindowCategories: perWindowCategories.length,
   derivedCount,
   selectedWindowCount: selectedWindows.length,
   estimatedWindowRequests: perWindowCategories.length * selectedWindows.length,
  }
 }, [selected, selectedWindows])

 const toggleWindow = (window: VtSyncAnalyticsWindow) => {
  setSelectedWindows((current) => current.includes(window)
   ? current.filter((entry) => entry !== window)
   : [...current, window])
 }

 const toggleMany = (ids: string[]) => {
  setSelected((current) => {
   const allSelected = ids.every((id) => current.includes(id))
   return allSelected
    ? current.filter((entry) => !ids.includes(entry))
    : [...new Set([...current, ...ids])]
  })
 }

 const toggleRetentionVideo = (id: string) => {
  setRetentionVideoIds((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id])
 }

 const toggleGroup = (group: VtSyncCategoryGroup) => {
  setOpenGroups((current) => {
   const next = new Set(current)
   if (next.has(group)) next.delete(group)
   else {
    // Preserve insertion order as the "opened" order: only the two newest
    // controller sections stay expanded at once.
    while (next.size >= 2) next.delete(next.values().next().value as VtSyncCategoryGroup)
    next.add(group)
    window.requestAnimationFrame(() => {
     groupHeaderRefs.current.get(group)?.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
     })
    })
   }
   return next
  })
 }

 const start = async () => {
  if (!isAuthenticated) {
   try { await onLogin() } catch (error) {
    if (isLoginAbortError(error)) return
    throw error
   }
   // Post-login auth check — user may have cancelled mid-flow.
   if (!isAuthenticated) return
  }
  await onStartSync(expandVtSyncCategoryDependencies(filterVtSyncVisibleCategoryIds(selected)), retentionEnabled ? retentionVideoIds : undefined, false, selectedWindows)
 }

 const startCategories = async (categoryIds: string[], includeRetentionVideoIds = false, forceFullVideoMetadata = false) => {
  if (!isAuthenticated) {
   try { await onLogin() } catch (error) {
    if (isLoginAbortError(error)) return
    throw error
   }
   if (!isAuthenticated) return
  }
  const expanded = expandVtSyncCategoryDependencies(categoryIds)
  await onStartSync(expanded, includeRetentionVideoIds ? retentionVideoIds : undefined, forceFullVideoMetadata, selectedWindows)
 }

 const toExecutionStatus = (status?: string): RetroSyncExecutionStatus => {
  if (status === "running") return "running"
  if (status === "pending") return "queued"
  if (status === "synced" || status === "complete") return "complete"
  if (status === "partial" || status === "skipped") return "partial"
  if (status === "failed") return "failed"
  return "idle"
 }

 const shortStatus = (status?: string) => {
  if (status === "running") return "RUN"
  if (status === "pending") return "QUEUE"
  if (status === "synced" || status === "complete") return "DONE"
  if (status === "partial") return "PART"
  if (status === "failed") return "FAIL"
  if (status === "stale") return "STALE"
  if (status === "skipped") return "SKIP"
  return "NEVER"
 }

 const statusTone = (status?: string) => {
  if (status === "running") return "#3FEE56"
  if (status === "pending") return "#FFDA47"
  if (status === "synced" || status === "complete") return "#3FEE56"
  if (status === "partial" || status === "stale" || status === "skipped") return "#FFDA47"
  if (status === "failed") return "#FA618A"
  return "#B9BEC8"
 }

 const formatDuration = (durationMs?: number) => {
  if (durationMs === undefined || !Number.isFinite(durationMs)) return "—"
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000))
  if (totalSeconds < 60) return `${totalSeconds}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m${seconds ? ` ${seconds}s` : ""}`
 }

 const formatLastSync = (iso?: string) => {
  if (!iso) return "—"
  const value = new Date(iso)
  if (!Number.isFinite(value.getTime())) return "—"
  const date = value.toLocaleDateString([], { month: "numeric", day: "numeric" })
  const time = value.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  return `${date} ${time}`
 }

 const compactRows = (value: number) => value >= 1_000_000
  ? `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`
  : value >= 1_000
   ? `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`
   : value.toLocaleString()

 const copySyncSummary = async () => {
  const text = [
   "ViewTube Sync Control + Progress",
   `Now: ${queueSummary.currentLabel} — ${queueSummary.currentMessage}`,
   `Next: ${queueSummary.nextLabel} — ${queueSummary.nextMessage}`,
   `Selected: ${selectedUnitCount} datasets · ${selectedQueryCount} underlying queries`,
   "",
   ...unifiedUnitModels.map((unit) => [
    unit.label,
    `Status: ${shortStatus(unit.status)}`,
    `Duration: ${formatDuration(unit.durationMs)}`,
    `Last sync: ${unit.lastSyncedAt ? new Date(unit.lastSyncedAt).toLocaleString() : "Never"}`,
    `Issues: ${unit.issueCount}`,
    `Rows: ${unit.displayRows.toLocaleString()}`,
   ].join(" · ")),
  ].join("\n")
  try {
   if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
   } else {
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
   setCopyStatus("Copied")
  } catch {
   setCopyStatus("Copy failed")
  }
 }


 return (
  <ToolboxScaffold
   title="SYNC CONTROL + PROGRESS"
   subtitle="Select, run, monitor, inspect, and retry every YouTube dataset from one toolbox."
   iconName="analytics"
   headerColor="bg-[#36E0F6]"
   iconBoxColor="bg-[#C0F240]"
   paletteIndex={2}
   embedded
   contentClassName="vt-retro-dark-content p-3"
   outerClassName="vt-retro-shell"
   hardShadow
  >
   <RetroRivets />
   <div className="w-full">
    <section className="mb-3 overflow-hidden rounded-[12px] border-[3px] border-black bg-white">
     <div className="grid grid-cols-2 border-b-[3px] border-black sm:grid-cols-4">
      <div className="min-w-0 border-r-[2px] border-black bg-[#36E0F6] px-2.5 py-1.5 sm:col-span-2">
       <span className="block text-[8px] font-black uppercase tracking-[0.1em] text-black/55">Now</span>
       <strong className="block truncate text-[12px] font-[1000] uppercase leading-tight">{queueSummary.currentLabel}</strong>
       <span className="block truncate text-[7px] font-bold uppercase tracking-[0.03em] text-black/50">{queueSummary.currentMessage}</span>
      </div>
      <div className="min-w-0 bg-[#FFDA47] px-2.5 py-1.5 sm:border-r-[2px] sm:border-black">
       <span className="block text-[8px] font-black uppercase tracking-[0.1em] text-black/55">Next</span>
       <strong className="block truncate text-[11px] font-[1000] uppercase leading-tight">{queueSummary.nextLabel}</strong>
       <span className="block truncate text-[7px] font-bold uppercase tracking-[0.03em] text-black/50">{queueSummary.nextMessage}</span>
      </div>
      <div className="min-w-0 border-l-[2px] border-black bg-[#f4f4f4] px-2.5 py-1.5 sm:border-l-0">
       <span className="block text-[8px] font-black uppercase tracking-[0.1em] text-black/55">Last update</span>
       <strong className="block truncate text-[11px] font-[1000] uppercase leading-tight">{formatLastSync(latestDatasetAt)}</strong>
      </div>
     </div>
     <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-[#161616] px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.08em] text-white">
      {[
       ["Live", progress?.status === "running" ? 1 : 0, "#36E0F6"],
       ["Queued", unitTally.pending || 0, "#FFDA47"],
       ["Done", unitTally.synced || 0, "#3FEE56"],
       ["Partial", unitTally.partial || 0, "#FFDA47"],
       ["Failed", unitTally.failed || 0, "#FA618A"],
       ["Never", unitTally.never || 0, "#B9BEC8"],
      ].map(([label, value, tone]) => (
       <span key={String(label)} className="inline-flex items-center gap-1">
        <i className="h-2 w-2 rounded-full" style={{ backgroundColor: String(tone), boxShadow: `0 0 5px ${String(tone)}` }} />
        {label} <b className="font-mono text-[10px]" style={{ color: String(tone) }}>{Number(value).toLocaleString()}</b>
       </span>
      ))}
     </div>
    </section>

    {syncError ? (
     <div className="mb-3 rounded-[10px] border-[2px] border-black bg-[#FA618A] px-3 py-2 text-[10px] font-black uppercase">
      Sync issue · {syncError}
     </div>
    ) : null}

    <section className="mb-3 grid gap-2 rounded-[12px] border-[3px] border-black bg-[#0d0d0d] p-2">
     <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-[8px] font-[1000] uppercase tracking-[0.08em] text-white/55">Quick select</span>
      <RetroAnalogToggle
       label="All"
       active={selectionMatches(allCategoryIds)}
       onChange={(next) => setSelected(next ? allCategoryIds : [])}
       tone="cyan"
      />
      <RetroAnalogToggle
       label="Core"
       active={selectionMatches(coreCategoryIds)}
       onChange={(next) => setSelected(next ? coreCategoryIds : [])}
       tone="green"
      />
      <RetroAnalogToggle
       label="Recommended"
       active={selectionMatches(recommendedCategoryIds)}
       onChange={(next) => setSelected(next ? recommendedCategoryIds : [])}
       tone="yellow"
      />
      <RetroAnalogToggle
       label="Clear"
       active={selected.length === 0}
       onChange={() => setSelected([])}
       tone="red"
      />
      <button type="button" onClick={() => { void copySyncSummary() }} className="vt-retro-switch ml-auto" style={{ "--tone": "#F55EFC", "--tone-light": "#ffd6f7" } as React.CSSProperties}>
       <Copy className="h-3.5 w-3.5" aria-hidden="true" />{copyStatus || "Copy Summary"}
      </button>
      <span className="sr-only" aria-live="polite">{copyStatus}</span>
      {contentOwners.length > 0 ? <label className="vt-retro-switch">
       <span className="vt-retro-switch-led" />Owner
       <select
        aria-label="Active YouTube Content Owner"
        value={activeContentOwnerId || ""}
        onChange={(event) => { if (event.target.value) void onSelectContentOwner?.(event.target.value) }}
       >
        <option value="">Select</option>
        {contentOwners.map((owner) => <option key={owner.id} value={owner.id}>{owner.displayName}</option>)}
       </select>
      </label> : null}
     </div>

     <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/15 pt-2">
      <span className="text-[8px] font-[1000] uppercase tracking-[0.08em] text-white/55">Time window</span>
      {ANALYTICS_WINDOWS.map((window) => (
       <span key={window} data-window={window}>
        <RetroAnalogToggle
         label={WINDOW_SHORT_LABELS[window]}
         active={selectedWindows.includes(window)}
         onChange={() => toggleWindow(window)}
         tone={window === "lifetime" ? "green" : "cyan"}
        />
       </span>
      ))}
      <span className="ml-auto text-[9px] font-[1000] uppercase text-white/65">{selectedUnitCount} datasets · {selectedQueryCount} queries</span>
     </div>

     <p className="m-0 text-[9px] font-semibold leading-snug text-[#9ca3af]">
      {selectedWindows.length === 0
       ? "No time window selected. Choose at least one window before starting the selected batch."
       : `${selectedWindows.length} window${selectedWindows.length === 1 ? "" : "s"} selected · ~${windowCost.estimatedWindowRequests} windowed request${windowCost.estimatedWindowRequests === 1 ? "" : "s"} for the current dataset selection.`}
      {windowCost.derivedCount > 0
       ? ` ${windowCost.derivedCount} day-grained quer${windowCost.derivedCount === 1 ? "y" : "ies"} derive requested windows from their source data without extra per-window requests.`
       : ""}
     </p>
    </section>

    <div className="overflow-hidden rounded-[12px] border-[3px] border-black bg-[#0d0d0d]">
     {unitGroups.map(({ group, label, units }) => {
      const expanded = openGroups.has(group)
      const contentId = `vt-sync-controller-group-${group}`
      const groupCategoryIds = [...new Set(units.flatMap((unit) => unit.categoryIds))]
      const models = units.map((unit) => unitModelById.get(unit.id)).filter(Boolean)
      const groupCounts = models.reduce<Record<string, number>>((acc, unit) => {
       acc[unit!.status] = (acc[unit!.status] || 0) + 1
       return acc
      }, {})
      const groupIssues = models.reduce((sum, unit) => sum + (unit?.issueCount || 0), 0)
      const groupRows = models.reduce((sum, unit) => sum + (unit?.displayRows || 0), 0)
      const groupStatus = groupCounts.running ? "running"
       : groupCounts.pending ? "pending"
       : groupCounts.failed ? "failed"
       : groupCounts.partial ? "partial"
       : models.length > 0 && models.every((unit) => unit?.status === "synced") ? "synced"
       : "never"
      const groupSummary = [
       `${units.length} dataset${units.length === 1 ? "" : "s"}`,
       groupCounts.running ? `${groupCounts.running} running` : "",
       groupCounts.pending ? `${groupCounts.pending} queued` : "",
       groupCounts.synced ? `${groupCounts.synced} done` : "",
       groupCounts.partial ? `${groupCounts.partial} partial` : "",
       groupCounts.failed ? `${groupCounts.failed} failed` : "",
       groupIssues ? `${groupIssues} issue${groupIssues === 1 ? "" : "s"}` : "0 issues",
       `${compactRows(groupRows)} rows`,
      ].filter(Boolean).join(" · ")

      return (
       <section key={group} className="border-b-[3px] border-black bg-white last:border-b-0">
        <div className="flex items-stretch" style={{ backgroundColor: GROUP_COLORS[group] }}>
         <h3 className="min-w-0 flex-1">
          <button
           ref={(node) => {
            if (node) groupHeaderRefs.current.set(group, node)
            else groupHeaderRefs.current.delete(group)
           }}
           type="button"
           aria-expanded={expanded}
           aria-controls={contentId}
           onClick={() => toggleGroup(group)}
           className={`vt-retro-acc-header grid h-full min-h-[44px] w-full grid-cols-[minmax(0,1fr)] items-center px-2.5 py-1 text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-black ${expanded ? "border-b-[2px] border-black" : ""}`}
          >
           <span className="flex min-w-0 items-center gap-2">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[5px] border-[2px] border-black bg-white" aria-hidden="true">
             {expanded ? <ChevronDown className="h-4 w-4" strokeWidth={3.5} /> : <ChevronRight className="h-4 w-4" strokeWidth={3.5} />}
            </span>
            <span className="min-w-0">
             <span className="vt-retro-acc-label block truncate text-[15px] font-[1000] tracking-tighter">{label}</span>
             <span className="block truncate text-[8px] font-black uppercase tracking-[0.04em] text-black/55">{groupSummary}</span>
            </span>
           </span>
          </button>
         </h3>
         <div className={`grid shrink-0 place-items-center border-l-[3px] border-black px-2 py-1 ${expanded ? "border-b-[2px]" : ""}`}>
          <RetroSyncExecutionSwitch
           idleLabel="SYNC ALL"
           status={toExecutionStatus(groupStatus)}
           onClick={() => void startCategories(groupCategoryIds, units.some((unit) => unit.id === "retention"))}
          />
         </div>
        </div>

        <div id={contentId} hidden={!expanded}>
         <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[600px]">
           <div className="grid h-[26px] grid-cols-[minmax(210px,1fr)_58px_54px_88px_34px_58px_96px] items-center border-b-[2px] border-black bg-[#161616] px-2 text-[8px] font-black uppercase tracking-[0.08em] text-white/75">
            <span>Dataset</span><span>Status</span><span>Time</span><span>Last sync</span><span className="text-center">!</span><span className="text-right">Rows</span><span className="text-center">Sync</span>
           </div>

           {units.map((unit) => {
            const checked = unit.categoryIds.every((id) => selectedSet.has(id))
            const model = unitModelById.get(unit.id)
            const unitStatus = model?.status || "never"
            const expandedUnit = expandedUnitIds.has(unit.id)
            const hasPriorData = unitStatus !== "never"
            const unitContentId = `vt-sync-unified-unit-${unit.id}`
            return (
             <article key={unit.id} className="border-b-[2px] border-black last:border-b-0">
              <div className={`grid min-h-[48px] grid-cols-[minmax(210px,1fr)_58px_54px_88px_34px_58px_96px] items-stretch px-2 ${checked ? "bg-white" : "bg-[#f1f1f1] text-black/50"}`}>
               <div className="sticky left-0 z-[2] flex min-w-0 items-center gap-1.5 bg-inherit pr-1">
                <button
                 type="button"
                 aria-pressed={checked}
                 onClick={() => toggleMany(unit.categoryIds)}
                 title={`${checked ? "Remove" : "Add"} ${unit.label} ${checked ? "from" : "to"} batch sync`}
                 aria-label={`${checked ? "Remove" : "Add"} ${unit.label} ${checked ? "from" : "to"} batch sync`}
                 className="grid h-7 w-7 shrink-0 place-items-center rounded-[5px] focus-visible:outline focus-visible:outline-3 focus-visible:outline-black"
                >
                 {checked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-black/35" />}
                </button>
                <button
                 type="button"
                 aria-expanded={expandedUnit}
                 aria-controls={unitContentId}
                 onClick={() => setExpandedUnitIds((current) => {
                  const next = new Set(current)
                  if (next.has(unit.id)) next.delete(unit.id)
                  else next.add(unit.id)
                  return next
                 })}
                 className="grid h-6 w-6 shrink-0 place-items-center rounded-[4px] border border-black bg-white"
                 title={expandedUnit ? "Collapse dataset details" : "Expand dataset details"}
                >
                 {expandedUnit ? <ChevronDown className="h-3.5 w-3.5" strokeWidth={3} /> : <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} />}
                </button>
                <span className="min-w-0">
                 <strong className="block truncate text-[11px] font-[1000] uppercase leading-none">{unit.label}</strong>
                 <span className="mt-1 block truncate text-[7.5px] font-black uppercase tracking-[0.035em] text-black/45">
                  {unit.categoryIds.length} quer{unit.categoryIds.length === 1 ? "y" : "ies"} · {formatPlainLabel(unit.refreshPolicy)}
                 </span>
                </span>
               </div>

               <div className="flex items-center border-l border-black/20 px-1.5">
                <span className="inline-flex min-w-0 items-center gap-1 text-[8px] font-[1000] uppercase">
                 <i className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: statusTone(unitStatus), boxShadow: `0 0 4px ${statusTone(unitStatus)}` }} />
                 <span className="truncate">{shortStatus(unitStatus)}</span>
                </span>
               </div>
               <div className="flex items-center border-l border-black/20 px-1.5 font-mono text-[9px] font-black tabular-nums">{formatDuration(model?.durationMs)}</div>
               <div className="flex items-center border-l border-black/20 px-1.5 font-mono text-[9px] font-black tabular-nums">{formatLastSync(model?.lastSyncedAt)}</div>
               <div className="grid place-items-center border-l border-black/20 text-[10px] font-[1000]">{model?.issueCount || 0}</div>
               <div className="flex items-center justify-end border-l border-black/20 px-1.5 font-mono text-[9px] font-black tabular-nums">{compactRows(model?.displayRows || 0)}</div>
               <div className="sticky right-0 z-[2] grid place-items-center border-l-[2px] border-black bg-inherit px-1">
                <RetroSyncExecutionSwitch
                 idleLabel={hasPriorData ? "UPDATE" : "FULL SYNC"}
                 status={toExecutionStatus(unitStatus)}
                 onClick={() => void startCategories(unit.categoryIds)}
                />
               </div>
              </div>

              <div id={unitContentId} hidden={!expandedUnit} className="border-t-[2px] border-black bg-[#f3f4f6]">
               <div className="grid gap-2 p-2 text-[9px] font-black uppercase tracking-[0.025em] sm:grid-cols-[minmax(0,1.35fr)_minmax(0,.65fr)]">
                <section className="rounded-[7px] border-[2px] border-black bg-white p-2">
                 <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-[10px]">{unit.description}</strong>
                  {unit.defaultEnabled ? <span className="rounded-full border border-black bg-[#3FEE56] px-1.5 py-[1px] text-[7px]">Core</span> : null}
                 </div>
                 <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[8px] text-black/65 sm:grid-cols-4">
                  <span>STATUS <b className="block text-black">{shortStatus(unitStatus)}</b></span>
                  <span>DURATION <b className="block text-black">{formatDuration(model?.durationMs)}</b></span>
                  <span>LAST SYNC <b className="block text-black">{model?.lastSyncedAt ? new Date(model.lastSyncedAt).toLocaleString() : "Never"}</b></span>
                  <span>SOURCE <b className="block truncate text-black">{model?.sourceLabels.join(" + ") || "—"}</b></span>
                 </div>
                 {unit.id === "video_catalog" ? (
                  <button type="button" onClick={() => void startCategories(unit.categoryIds, false, true)} className="mt-2 rounded border-[2px] border-black bg-[#FFDA47] px-2 py-1 text-[8px] font-black uppercase shadow-[2px_2px_0_0_#000]">
                   Full metadata refresh
                  </button>
                 ) : null}
                </section>

                <section className="rounded-[7px] border-[2px] border-black bg-white p-2">
                 <strong className="text-[8px] text-black/50">Issues · {model?.issueCount || 0}</strong>
                 {model?.issues.length ? (
                  <ul className="mt-1 space-y-1 normal-case tracking-normal text-black/75">
                   {model.issues.map((row, index) => <li key={`${row.category.id}-${index}`}><b>{row.category.label}:</b> {row.message}</li>)}
                  </ul>
                 ) : <span className="mt-1 block">No issues.</span>}
                </section>
               </div>

               <div className="border-t-[2px] border-black bg-white px-2 py-1.5">
                <div className="mb-1 grid grid-cols-[minmax(0,1fr)_68px_72px] gap-2 text-[7px] font-black uppercase tracking-[0.07em] text-black/45">
                 <span>Underlying query</span><span className="text-right">Rows</span><span>Status</span>
                </div>
                {(model?.rows || []).map((row) => (
                 <div key={row.category.id} className="grid min-h-[24px] grid-cols-[minmax(0,1fr)_68px_72px] items-center gap-2 border-t border-black/15 text-[8px] font-black uppercase">
                  <span className="min-w-0 truncate" title={row.message}>{row.category.label} · {row.phaseLabel}</span>
                  <span className="text-right font-mono tabular-nums">{compactRows(row.displayRows)}</span>
                  <span>{shortStatus(row.displayStatus)}</span>
                 </div>
                ))}
               </div>

               {unit.id === "retention" && retentionEnabled ? (
                <section className="border-t-[2px] border-black bg-[#f3f4f6]">
                 <div className="flex flex-wrap items-center justify-between gap-2 border-b-[2px] border-black bg-white px-3 py-2">
                  <div>
                   <span className="text-[10px] font-black uppercase">Retention videos</span>
                   <span className="ml-2 text-[8px] font-bold uppercase text-black/45">
                    {retentionVideoIds.length > 0
                     ? `${retentionVideoIds.length} manually selected`
                     : `Default · ${baselineRetentionSelection.selectedCounts.long} long + ${baselineRetentionSelection.selectedCounts.short} Shorts`}
                   </span>
                  </div>
                  <button type="button" onClick={() => setRetentionVideoIds([])} className="rounded-full border-[2px] border-black bg-[#FFDA47] px-2 py-1 text-[8px] font-black uppercase">Balanced default</button>
                 </div>
                 <div className="border-b-[2px] border-black bg-white p-2">
                  <input
                   type="text"
                   value={videoSearch}
                   onChange={(event) => setVideoSearch(event.target.value)}
                   placeholder="Search videos by title…"
                   className="w-full rounded-full border-[2px] border-black px-3 py-1.5 text-[9px] font-bold uppercase outline-none focus:border-[#528FFA]"
                  />
                 </div>
                 <div className="max-h-[220px] overflow-auto custom-scrollbar">
                  {filteredVideos.length === 0 ? (
                   <div className="px-3 py-3 text-center text-[9px] font-black uppercase text-black/45">No videos match.</div>
                  ) : filteredVideos.map((video) => {
                   const retentionChecked = retentionSelectedSet.has(video.id)
                   return (
                    <button key={video.id} type="button" aria-pressed={retentionChecked} onClick={() => toggleRetentionVideo(video.id)} className={`grid w-full grid-cols-[20px_1fr_auto] items-center gap-2 border-b border-black/10 px-3 py-2 text-left hover:bg-white ${retentionChecked ? "bg-white" : "bg-white/40 text-black/50"}`}>
                     <span>{retentionChecked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-black/35" />}</span>
                     <span className="truncate text-[9px] font-black uppercase">{video.title || video.id}</span>
                     <span className="whitespace-nowrap text-[8px] font-bold text-black/45">{compactRows(video.views || 0)} views</span>
                    </button>
                   )
                  })}
                 </div>
                </section>
               ) : null}
              </div>
             </article>
            )
           })}
          </div>
         </div>
        </div>
       </section>
      )
     })}
    </div>

    <button
     type="button"
     onClick={isAuthenticated ? start : onLogin}
     disabled={isAuthenticated && selected.length === 0}
     className="mt-3 flex w-full items-center justify-center gap-2 rounded-[12px] border-[3px] border-black bg-[#3FEE56] py-2.5 text-[12px] font-black uppercase tracking-[0.03em] shadow-[4px_4px_0_0_#000] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-50"
    >
     {isAuthenticated ? <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} /> : <ShieldCheck className="h-4 w-4" />}
     {isSyncing ? `Queue Selected Data (${selectedUnitCount})` : isAuthenticated ? `Sync Selected Data (${selectedUnitCount})` : "Connect YouTube Channel"}
    </button>
   </div>
  </ToolboxScaffold>
 )
}

