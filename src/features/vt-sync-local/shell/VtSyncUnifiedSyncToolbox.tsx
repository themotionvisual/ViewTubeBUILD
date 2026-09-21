import React, { useMemo, useRef, useState } from "react"
import { CheckSquare, ChevronDown, ChevronRight, Copy, RefreshCw, ShieldCheck, Square } from "lucide-react"
import { ToolboxScaffold } from "../../../components/Toolbox"
import { SubToolboxAlphabeticalTag, SubToolboxCheckControl } from "../../../components/subtoolbox/SubToolboxPrimitives"
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
type SyncSpectrumTagProps = {
 text: string
 spectrumKey: string
 onClick?: () => void
 title?: string
}

const SyncSpectrumTag: React.FC<SyncSpectrumTagProps> = ({ text, spectrumKey, onClick, title }) => {
 const content = (
  <SubToolboxAlphabeticalTag
   level="l2"
   className="vt-sync-meta-tag"
   label={text}
   spectrumKey={spectrumKey}
   title={title}
  />
 )
 if (!onClick) return content
 return (
  <button
   type="button"
   className="vt-sync-meta-tag-action"
   onClick={onClick}
   title={title}
  >
   {content}
  </button>
 )
}

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
  if (selectedWindows.length === 0 || selected.length === 0) return
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
  if (selectedWindows.length === 0) return
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

 const formatCompactLastSync = (iso?: string) => {
  if (!iso) return "NEVER"
  const value = new Date(iso)
  if (!Number.isFinite(value.getTime())) return "NEVER"
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  const year = String(value.getFullYear()).slice(-2)
  const hours = value.getHours()
  const hour = hours % 12 || 12
  const minute = String(value.getMinutes()).padStart(2, "0")
  const suffix = hours >= 12 ? "P" : "A"
  return `${month}/${day}/${year} · ${hour}:${minute}${suffix}`
 }

 const resultNounForUnit = (unitId: string, rows: number, fallbackLabel: string) => {
  const singular = rows === 1
  const labels: Record<string, [string, string]> = {
   channel_overview_windows: ["channel record", "channel records"],
   video_catalog: ["published video", "published videos"],
   daily_stats: ["daily analytics row", "daily analytics rows"],
   monthly_stats: ["monthly analytics row", "monthly analytics rows"],
   traffic_by_day: ["traffic-by-day row", "traffic-by-day rows"],
   traffic_overview: ["traffic source", "traffic sources"],
   audience_demographics: ["audience segment", "audience segments"],
   content_type: ["content format", "content formats"],
   formats_subscriber_status: ["format × subscriber row", "format × subscriber rows"],
   sharing_services: ["sharing service", "sharing services"],
   playback_locations: ["playback location", "playback locations"],
   subscription_status: ["subscriber segment", "subscriber segments"],
   geography_country: ["country", "countries"],
   geography_city: ["city", "cities"],
   geography_province: ["US state", "US states"],
   geography_dma: ["DMA region", "DMA regions"],
   device_type: ["device type", "device types"],
   operating_system: ["operating system", "operating systems"],
   device_os: ["device × OS row", "device × OS rows"],
   playlists: ["playlist", "playlists"],
   revenue_source: ["revenue source", "revenue sources"],
   ad_type: ["ad type", "ad types"],
   retention: ["retention curve", "retention curves"],
  }
  if (unitId.includes("search_terms")) return singular ? "YouTube search term" : "YouTube search terms"
  if (unitId.startsWith("traffic_detail_")) return singular ? `${fallbackLabel.toLowerCase()} row` : `${fallbackLabel.toLowerCase()} rows`
  const pair = labels[unitId]
  return pair ? (singular ? pair[0] : pair[1]) : singular ? "result" : "results"
 }

 const statusLabelForUnit = (status: string, isNext = false) => {
  if (status === "running") return "SYNCING"
  if (status === "pending") return isNext ? "UP NEXT" : "QUEUED"
  if (status === "synced" || status === "complete") return "COMPLETE"
  if (status === "partial") return "PARTIAL"
  if (status === "failed") return "FAILED"
  if (status === "stale") return "STALE"
  if (status === "skipped") return "SKIPPED"
  return "NEVER"
 }

 const immediateLabelForUnit = (status: string, isNext = false, hasPriorData = false) => {
  if (status === "running") return "SYNCING"
  if (status === "pending") return isNext ? "UP NEXT" : "QUEUED"
  if (status === "synced" || status === "complete") return "COMPLETE"
  if (status === "partial") return "PARTIAL"
  if (status === "failed") return "RETRY"
  return hasPriorData ? "UPDATE" : "FULL SYNC"
 }

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
      const groupSelected = groupCategoryIds.length > 0 && groupCategoryIds.every((id) => selectedSet.has(id))
      const selectedUnitsInGroup = units.filter((unit) => unit.categoryIds.every((id) => selectedSet.has(id))).length
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
       `${selectedUnitsInGroup} selected`,
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
         <div
          className={`flex shrink-0 items-center gap-1.5 border-l-[3px] border-black px-1.5 py-1 ${expanded ? "border-b-[2px]" : ""}`}
          style={{ ["--vt-subtoolbox-fill" as string]: GROUP_COLORS[group] } as React.CSSProperties}
         >
          <SubToolboxCheckControl
           level="l2"
           checked={groupSelected}
           onClick={() => toggleMany(groupCategoryIds)}
           aria-label={`${label} batch selection`}
           className="vt-sync-batch-checkbox"
           style={{
            ["--pair-a" as string]: "#ffffff",
            ["--pair-b" as string]: GROUP_COLORS[group],
           } as React.CSSProperties}
          />
          <RetroSyncExecutionSwitch
           idleLabel="SYNC ALL"
           status={toExecutionStatus(groupStatus)}
           onClick={() => void startCategories(groupCategoryIds, units.some((unit) => unit.id === "retention"))}
          />
         </div>
        </div>

        <div id={contentId} hidden={!expanded} className="bg-white">
         {units.map((unit) => {
          const selectedForBatch = unit.categoryIds.every((id) => selectedSet.has(id))
          const model = unitModelById.get(unit.id)
          const unitStatus = model?.status || "never"
          const expandedUnit = expandedUnitIds.has(unit.id)
          const hasPriorData = unitStatus !== "never"
          const hasExtraDetail = Boolean(
           (model?.issueCount || 0) > 0
           || unit.id === "retention"
           || unit.id === "video_catalog"
          )
          const unitContentId = `vt-sync-unified-unit-${unit.id}`
          const isNextUnit = queueSummary.nextLabel === unit.label
           || Boolean(model?.rows.some((row) => queueSummary.nextLabel.includes(row.category.label)))
          const statusValue = statusLabelForUnit(unitStatus, isNextUnit)
          const lastSyncValue = formatCompactLastSync(model?.lastSyncedAt)
          const statusAndSyncValue = lastSyncValue === "NEVER"
           ? `STATUS: ${statusValue}`
           : `STATUS: ${statusValue} - ${lastSyncValue}`
          const durationValue = formatDuration(model?.durationMs)
          const resultValue = `RESULT: ${durationValue === "—" ? "" : `${durationValue} - `}${compactRows(model?.displayRows || 0)} ${resultNounForUnit(unit.id, model?.displayRows || 0, unit.label)}`
          const issueValue = `ISSUES: ${model?.issueCount || 0}`
          const immediateLabel = immediateLabelForUnit(unitStatus, isNextUnit, hasPriorData)
          const groupColor = GROUP_COLORS[group]
          const rowFill = `color-mix(in srgb, ${groupColor} ${selectedForBatch ? 30 : 10}%, white)`
          const titleFontSize = unit.label.length > 29 ? "13px" : unit.label.length > 24 ? "14px" : "16px"
          const toggleUnitDetails = () => {
           if (!hasExtraDetail) return
           setExpandedUnitIds((current) => {
            const next = new Set(current)
            if (next.has(unit.id)) next.delete(unit.id)
            else next.add(unit.id)
            return next
           })
          }

          return (
           <article
            key={unit.id}
            className="border-b-[2px] border-black last:border-b-0"
            style={{
             ["--vt-sync-group-color" as string]: groupColor,
             ["--vt-subtoolbox-fill" as string]: groupColor,
            } as React.CSSProperties}
           >
            <div className="grid min-h-[66px] grid-cols-[36px_minmax(0,1fr)_88px] items-stretch" style={{ backgroundColor: rowFill }}>
             <div className="grid place-items-center px-0.5 py-1">
              <SubToolboxCheckControl
               level="l2"
               checked={selectedForBatch}
               onClick={() => toggleMany(unit.categoryIds)}
               aria-label={`${unit.label} batch selection`}
               className="vt-sync-batch-checkbox"
               style={{
                ["--pair-a" as string]: "#ffffff",
                ["--pair-b" as string]: groupColor,
               } as React.CSSProperties}
              />
             </div>

             <div className="flex min-w-0 flex-col justify-center gap-1 px-2 py-2">
              <strong
               className="vt-sync-dataset-title block min-w-0 whitespace-nowrap font-[1000] uppercase leading-none tracking-[-0.045em]"
               style={{ fontSize: titleFontSize }}
               title={unit.label}
              >
               {unit.label}
              </strong>
              <span className="vt-sync-dataset-subtitle block min-w-0 whitespace-normal break-words font-black uppercase leading-[1.16] tracking-[0.02em] text-black/50">
               {unit.description}
              </span>
             </div>

             <div className="grid place-items-center px-0.5 py-1">
              <RetroSyncExecutionSwitch
               idleLabel={hasPriorData ? "UPDATE" : "FULL SYNC"}
               labelOverride={immediateLabel}
               status={toExecutionStatus(unitStatus)}
               onClick={() => void startCategories(unit.categoryIds)}
               disabled={selectedWindows.length === 0}
              />
             </div>
            </div>

            <div
             className="vt-sync-meta-rail flex min-w-0 items-center gap-1.5 overflow-x-auto border-t border-black/15 px-2 py-1.5 custom-scrollbar"
             style={{ backgroundColor: rowFill }}
            >
             <SyncSpectrumTag text={statusAndSyncValue} spectrumKey={`STATUS-${statusValue}`} />
             <SyncSpectrumTag text={resultValue} spectrumKey="RESULT" />
             {(model?.issueCount || 0) > 0 ? (
              <SyncSpectrumTag
               text={issueValue}
               spectrumKey="ISSUES"
               onClick={toggleUnitDetails}
               title={expandedUnit ? "Hide issue details" : "Show issue details"}
              />
             ) : null}
             {unit.id === "video_catalog" ? (
              <SyncSpectrumTag
               text="OPTIONS: METADATA"
               spectrumKey="OPTIONS"
               onClick={toggleUnitDetails}
               title={expandedUnit ? "Hide metadata options" : "Show metadata options"}
              />
             ) : null}
             {unit.id === "retention" ? (
              <SyncSpectrumTag
               text="OPTIONS: VIDEOS"
               spectrumKey="OPTIONS"
               onClick={toggleUnitDetails}
               title={expandedUnit ? "Hide retention options" : "Show retention options"}
              />
             ) : null}
            </div>

            {hasExtraDetail ? (
             <div id={unitContentId} hidden={!expandedUnit} className="border-t-[2px] border-black bg-[#f3f4f6]">
              {(model?.issueCount || 0) > 0 ? (
               <section className="border-b-[2px] border-black bg-white p-2 text-[9px]">
                <strong className="text-[8px] uppercase tracking-[0.06em] text-black/50">Issues · {model?.issueCount || 0}</strong>
                <ul className="mt-1 space-y-1 normal-case tracking-normal text-black/75">
                 {model?.issues.map((row, index) => <li key={`${row.category.id}-${index}`}><b>{row.category.label}:</b> {row.message}</li>)}
                </ul>
               </section>
              ) : null}

              {unit.categoryIds.length > 1 ? (
               <section className="border-b-[2px] border-black bg-white px-2 py-1.5">
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
               </section>
              ) : null}

              {unit.id === "video_catalog" ? (
               <section className="border-b-[2px] border-black bg-white p-2">
                <p className="m-0 text-[8px] font-black uppercase text-black/55">Video catalog supports a full metadata refresh when cached metadata is incomplete.</p>
                <button type="button" onClick={() => void startCategories(unit.categoryIds, false, true)} className="mt-2 rounded border-[2px] border-black bg-[#FFDA47] px-2 py-1 text-[8px] font-black uppercase shadow-[2px_2px_0_0_#000]">
                 Full metadata refresh
                </button>
               </section>
              ) : null}

              {unit.id === "retention" && retentionEnabled ? (
               <section className="bg-[#f3f4f6]">
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
            ) : null}
           </article>
          )
         })}
        </div>
       </section>
      )
     })}
    </div>

    <button
     type="button"
     onClick={isAuthenticated ? start : onLogin}
     disabled={isAuthenticated && (selected.length === 0 || selectedWindows.length === 0)}
     className="mt-3 flex w-full items-center justify-center gap-2 rounded-[12px] border-[3px] border-black bg-[#3FEE56] py-2.5 text-[12px] font-black uppercase tracking-[0.03em] shadow-[4px_4px_0_0_#000] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-50"
    >
     {isAuthenticated ? <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} /> : <ShieldCheck className="h-4 w-4" />}
     {selectedWindows.length === 0
      ? "Select a Time Window"
      : isSyncing
       ? `Queue Selected Data (${selectedUnitCount})`
       : isAuthenticated ? `Sync Selected Data (${selectedUnitCount})` : "Connect YouTube Channel"}
    </button>
   </div>
  </ToolboxScaffold>
 )
}

