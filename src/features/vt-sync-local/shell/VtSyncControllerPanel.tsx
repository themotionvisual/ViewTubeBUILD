import React, { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronRight, Copy, RefreshCw, ShieldCheck } from "lucide-react"
import { ToolboxScaffold } from "../../../components/Toolbox"
import { getPaletteColor } from "../../../styles/toolboxPalette"
import { RetroLcd, RetroLedRow, RetroRivets, type RetroLedSpec } from "./VtSyncRetroChrome"
import type { VtSyncCategoryGroup, VtSyncDatasetFreshness } from "../adapters/contracts"
import type { VtSyncLocalSyncProgress } from "../adapters/localSyncEngine"
import type { VtSyncVideoCatalogCoverage } from "../adapters/videoCatalogProjection"
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
 getVtSyncDefaultUnitIds,
 getVtSyncUnitCategoryIds,
} from "../upstream/syncUnitRegistry"
import { buildVtSyncConsoleModel } from "./vtSyncProgressModel"

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

const categoryFreshness = (freshness: VtSyncDatasetFreshness | undefined, categoryId: string) =>
 freshness?.[categoryId] || Object.values(freshness || {}).find((entry) => entry.phase === categoryId)

const syncStatusLabel = (status?: string) => {
 switch (status) {
  case "pending": return "Waiting"
  case "running": return "Syncing"
  case "complete": return "Complete"
  case "synced": return "Synced"
  case "partial": return "Partial"
  case "failed": return "Failed"
  case "skipped": return "Skipped"
  case "stale": return "Previous"
  case "placeholder": return "Waiting"
  case "queued": return "Queued"
  case "never": return "Never synced"
  default: return String(status || "Unknown")
 }
}

const syncStatusTone = (status?: string) => {
 if (status === "complete" || status === "synced") return "#3FEE56"
 if (status === "partial" || status === "pending" || status === "running" || status === "queued") return "#FFDA47"
 if (status === "failed") return "#FA618A"
 if (status === "skipped" || status === "stale" || status === "placeholder") return "#FFA85C"
 return "#e9eaec"
}

const formatRelativeTime = (iso?: string): string => {
 if (!iso) return "Never"
 const ms = Date.now() - new Date(iso).getTime()
 if (!Number.isFinite(ms)) return "Never"
 if (ms < 0 || ms < 60_000) return "Just now"
 const minutes = Math.floor(ms / 60_000)
 if (minutes < 60) return `${minutes}m ago`
 const hours = Math.floor(minutes / 60)
 if (hours < 24) return `${hours}h ago`
 const days = Math.floor(hours / 24)
 if (days < 30) return `${days}d ago`
 return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(iso))
}

const formatSyncTime = (startedAt?: string, completedAt?: string, storedUpdatedAt?: string) => {
 if (!startedAt) return storedUpdatedAt
  ? `Last completed ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(storedUpdatedAt))}`
  : "Never run"
 const start = new Date(startedAt).getTime()
 const end = new Date(completedAt || Date.now()).getTime()
 const seconds = Math.max(0, Math.round((end - start) / 1000))
 const duration = seconds >= 60 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : `${seconds}s`
 return `${new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(startedAt))} · ${completedAt ? "completed" : "running"} · ${duration}`
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

export const VtSyncControllerPanel: React.FC<{
 isAuthenticated: boolean
 isSyncing: boolean
 progress: VtSyncLocalSyncProgress | null
 videos: VtSyncRetentionVideoOption[]
 queuedCategoryIds?: string[]
 datasetFreshness?: VtSyncDatasetFreshness
 syncError?: string
 videoCatalogCoverage?: VtSyncVideoCatalogCoverage
 contentOwners?: Array<{ id: string; displayName: string }>
 activeContentOwnerId?: string | null
 onSelectContentOwner?: (ownerId: string) => Promise<void>
 onLogin: () => Promise<void>
 onStartSync: (categoryIds: string[], retentionVideoIds?: string[], forceFullVideoMetadata?: boolean) => Promise<void>
}> = ({ isAuthenticated, isSyncing, progress, videos, queuedCategoryIds = [], datasetFreshness, syncError, videoCatalogCoverage, contentOwners = [], activeContentOwnerId, onSelectContentOwner, onLogin, onStartSync }) => {
 const [selected, setSelected] = useState<string[]>(() => getVtSyncDefaultUnitIds().flatMap(getVtSyncUnitCategoryIds))
 const [retentionVideoIds, setRetentionVideoIds] = useState<string[]>([])
 const [videoSearch, setVideoSearch] = useState("")
 const [copyStatus, setCopyStatus] = useState("")
 const [expandedUnitIds, setExpandedUnitIds] = useState<Set<string>>(() => new Set())
 const [openGroups, setOpenGroups] = useState<Set<VtSyncCategoryGroup>>(
  () => new Set(["channel"]),
 )
 const unitGroups = useMemo(() => buildUnitGroups(Boolean(activeContentOwnerId)), [activeContentOwnerId])
 const availableUnits = useMemo(() => unitGroups.flatMap((entry) => entry.units), [unitGroups])
 const groupHeaderRefs = useRef(new Map<VtSyncCategoryGroup, HTMLButtonElement>())
 const selectedSet = useMemo(() => new Set(selected), [selected])
 const selectedUnitCount = useMemo(() => availableUnits.filter((unit) => unit.categoryIds.every((id) => selectedSet.has(id))).length, [availableUnits, selectedSet])
 const retentionSelectedSet = useMemo(() => new Set(retentionVideoIds), [retentionVideoIds])
 const retentionEnabled = selectedSet.has("retention")
 const activeCategoryIds = progress?.status === "running" ? progress.requestedCategoryIds : []
 const activeCategorySet = useMemo(() => new Set(activeCategoryIds), [activeCategoryIds])
 const queuedCategorySet = useMemo(() => new Set(queuedCategoryIds), [queuedCategoryIds])
 const consoleModel = useMemo(() => buildVtSyncConsoleModel({
  progress,
  datasetFreshness,
  queuedCategoryIds,
  syncError,
  videoCatalogCoverage,
 }), [datasetFreshness, progress, queuedCategoryIds, syncError, videoCatalogCoverage])
 const progressUnitById = useMemo(() => new Map(consoleModel.units.map((unit) => [unit.id, unit])), [consoleModel.units])
 const progressGroupById = useMemo(() => new Map(consoleModel.groups.map((group) => [group.group, group])), [consoleModel.groups])
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

 const activeOrIssueGroup = consoleModel.groups.find((group) => group.status === "running" || group.issueCount > 0)?.group
 useEffect(() => {
  if (!activeOrIssueGroup) return
  setOpenGroups((current) => current.has(activeOrIssueGroup) ? current : new Set([...current, activeOrIssueGroup]))
 }, [activeOrIssueGroup])

 const syncLeds: RetroLedSpec[] = [
  { id: "live", label: progress?.status === "running" ? "Live sync in progress" : "No active sync", tone: "#36E0F6", lit: progress?.status === "running", pulse: true },
  { id: "synced", label: `${consoleModel.tally.synced || 0} datasets synced`, tone: "#3FEE56", lit: (consoleModel.tally.synced || 0) > 0 },
  { id: "partial", label: `${consoleModel.tally.partial || 0} datasets partial`, tone: "#FFDA47", lit: (consoleModel.tally.partial || 0) > 0 },
  { id: "failed", label: `${consoleModel.tally.failed || 0} datasets failed`, tone: "#FA618A", lit: (consoleModel.tally.failed || 0) > 0 },
 ]

 const copyProgressSummary = async () => {
  const lines = [
   "ViewTube Analytics Sync Summary",
   `Run status: ${syncStatusLabel(progress?.status || "idle")}`,
   `Current query: ${consoleModel.queue.currentLabel}`,
   `Next query: ${consoleModel.queue.nextLabel}`,
   `Latest dataset update: ${formatRelativeTime(consoleModel.latestDatasetAt)}`,
   `Stored rows: ${consoleModel.totalRows.toLocaleString()}`,
   `Synced: ${(consoleModel.tally.synced || 0).toLocaleString()}`,
   `Partial: ${(consoleModel.tally.partial || 0).toLocaleString()}`,
   `Failed: ${(consoleModel.tally.failed || 0).toLocaleString()}`,
   `Never synced: ${(consoleModel.tally.never || 0).toLocaleString()}`,
   "",
   ...consoleModel.rows.map((row) => [
    `- ${row.category.label}`,
    `  Source: ${row.source}`,
    `  Status: ${syncStatusLabel(row.displayStatus)}`,
    `  Rows: ${row.displayRows.toLocaleString()}`,
    `  Updated: ${row.updatedAt ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.updatedAt)) : "Never"}`,
    `  Message: ${row.message}`,
   ].join("\n")),
  ]
  try {
   await writeClipboardText(lines.join("\n"))
   setCopyStatus("Sync summary copied.")
  } catch {
   setCopyStatus("Could not copy sync summary.")
  }
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
  await onStartSync(expandVtSyncCategoryDependencies(filterVtSyncVisibleCategoryIds(selected)), retentionEnabled ? retentionVideoIds : undefined)
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
  await onStartSync(expanded, includeRetentionVideoIds ? retentionVideoIds : undefined, forceFullVideoMetadata)
 }

 // Track category-specific completion
 const previousActiveCategoryIdsRef = useRef<string[]>([])
 const [categoryCompleted, setCategoryCompleted] = useState<Record<string, boolean>>({})

 React.useEffect(() => {
  const activeSet = new Set(activeCategoryIds)
  const justCompleted: string[] = []
  previousActiveCategoryIdsRef.current.forEach((id) => {
   if (!activeSet.has(id)) {
    justCompleted.push(id)
   }
  })
  previousActiveCategoryIdsRef.current = activeCategoryIds

  if (justCompleted.length > 0) {
   setCategoryCompleted((current) => {
    const next = { ...current }
    justCompleted.forEach((id) => {
     next[id] = true
    })
    return next
   })

   const timer = setTimeout(() => {
    setCategoryCompleted((current) => {
     const next = { ...current }
     justCompleted.forEach((id) => {
      delete next[id]
     })
     return next
    })
   }, 5000)
   return () => clearTimeout(timer)
  }

 }, [activeCategoryIds])

 const renderCategorySlideSwitch = ({
  label,
  active,
  queued,
  completed,
  onClick,
  disabled,
 }: {
  label: string
  active: boolean
  queued?: boolean
  completed: boolean
  onClick: () => void
  disabled?: boolean
 }) => {
  const statusClass =
   active ? "is-syncing"
   : queued ? "is-waiting"
   : completed ? "is-completed"
   : ""

  return (
   <div
    className={`vt-retro-pcb-group is-category-action ${active || completed || queued ? "is-active" : ""} ${statusClass}`}
    style={
     {
      "--active-col": "var(--led-green)",
      "--active-col-rgb": "var(--led-green-rgb)",
     } as React.CSSProperties
    }
   >
    <div className="vt-retro-pcb-controls">
     <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="switch-hitbox"
      aria-pressed={active}
      title={`${active ? "Running" : queued ? "Queued" : "Start"} Sync`}
      aria-label={`${active ? "Running" : queued ? "Queued" : "Start"} Sync`}
     >
      <div className="sw-slide-housing">
       <div className="sw-slide-track">
        <div className="sw-slide-nub" />
       </div>
       <div className="led-rim" aria-hidden="true">
        <div className="led-bulb" />
       </div>
      </div>
     </button>
    </div>
    <div className="comp-label">{active ? "RUNNING" : queued ? "QUEUED" : completed ? "DONE" : label}</div>
   </div>
  )
 }

 return (
  <ToolboxScaffold
   title="YOUTUBE DATA SYNC"
   subtitle="Select, run, monitor, and diagnose every VT-SYNC dataset in one console."
   iconName="analytics"
   headerColor="bg-[#36E0F6]"
   iconBoxColor="bg-[#C0F240]"
   paletteIndex={2}
   embedded
   contentClassName="vt-retro-dark-content p-4"
   outerClassName="vt-retro-shell vt-sync-unified-console"
   hardShadow
   headerActions={<RetroLedRow leds={syncLeds} />}
  >
   <RetroRivets />
   <div className="w-full" data-vt-sync-unified-console>

   <section aria-label="Current sync operation" aria-live="polite" className="mb-3 overflow-hidden rounded-[14px] border-[3px] border-black bg-white">
    <header className="flex items-center justify-between gap-2 border-b-[3px] border-black bg-[#C0F240] px-3 py-2">
     <div className="min-w-0">
      <h3 className="vt-retro-acc-label truncate text-[14px] font-[1000] tracking-tighter">Sync operations</h3>
      <p className="truncate text-[8px] font-black uppercase tracking-[0.07em] text-black/55">Live execution and stored freshness share one dataset tree.</p>
     </div>
     <RetroLcd tone="#3FEE56" className="shrink-0">{formatRelativeTime(consoleModel.latestDatasetAt)}</RetroLcd>
    </header>
    <div className="grid grid-cols-2">
     <div className="min-w-0 border-r-[3px] border-black bg-[#36E0F6] px-3 py-2">
      <strong className="block text-[8px] font-black uppercase tracking-[0.11em] text-black/55">Now syncing</strong>
      <span className="vt-retro-acc-label block truncate text-[13px]">{consoleModel.queue.currentLabel}</span>
      <span className="block truncate text-[8px] font-bold uppercase tracking-[0.04em] text-black/55">{consoleModel.queue.currentMessage}</span>
     </div>
     <div className="min-w-0 bg-[#FFDA47] px-3 py-2">
      <strong className="block text-[8px] font-black uppercase tracking-[0.11em] text-black/55">Next queued query</strong>
      <span className="vt-retro-acc-label block truncate text-[13px]">{consoleModel.queue.nextLabel}</span>
      <span className="block truncate text-[8px] font-bold uppercase tracking-[0.04em] text-black/55">{consoleModel.queue.nextMessage}</span>
     </div>
    </div>
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t-[3px] border-black bg-[#161616] px-3 py-2 text-[9px] font-black uppercase tracking-[0.08em] text-white">
     {[
      ["Live", progress?.status === "running" ? 1 : 0, "#36E0F6"],
      ["Synced", consoleModel.tally.synced || 0, "#3FEE56"],
      ["Partial", consoleModel.tally.partial || 0, "#FFDA47"],
      ["Failed", consoleModel.tally.failed || 0, "#FA618A"],
      ["Never", consoleModel.tally.never || 0, "#9aa0ab"],
     ].map(([label, value, tone]) => (
      <span key={String(label)} className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border border-white/70" style={{ backgroundColor: String(tone) }} aria-hidden="true" />{label} <b className="font-mono text-[11px]" style={{ color: String(tone) }}>{Number(value).toLocaleString()}</b></span>
     ))}
    </div>
   </section>

   <div className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
    <button type="button" onClick={() => setSelected(availableUnits.flatMap((unit) => unit.categoryIds))} className="vt-retro-switch"><span className="vt-retro-switch-led" />Select All</button>
    <button type="button" onClick={() => setSelected(availableUnits.filter((unit) => unit.defaultEnabled).flatMap((unit) => unit.categoryIds))} className="vt-retro-switch" style={{ "--tone": "#FFDA47", "--tone-light": "#fff3b0" } as React.CSSProperties}><span className="vt-retro-switch-led" />Core Units</button>
    <button type="button" onClick={() => setSelected(getVtSyncDefaultUnitIds().flatMap(getVtSyncUnitCategoryIds))} className="vt-retro-switch" style={{ "--tone": "#36E0F6", "--tone-light": "#b9f2ff" } as React.CSSProperties}><span className="vt-retro-switch-led" />Recommended</button>
    <button type="button" onClick={() => setSelected([])} className="vt-retro-switch"><span className="vt-retro-switch-led" />Clear</button>
    <button type="button" onClick={() => void copyProgressSummary()} className="vt-retro-switch" style={{ "--tone": "#F55EFC", "--tone-light": "#ffd6f7" } as React.CSSProperties}>
     <Copy className="h-4 w-4" aria-hidden="true" />Copy Summary
    </button>
    {contentOwners.length > 0 ? <label className="vt-retro-switch">
     <span className="vt-retro-switch-led" />Content Owner
     <select
      aria-label="Active YouTube Content Owner"
      value={activeContentOwnerId || ""}
      onChange={(event) => { if (event.target.value) void onSelectContentOwner?.(event.target.value) }}
     >
      <option value="">Select owner</option>
     {contentOwners.map((owner) => <option key={owner.id} value={owner.id}>{owner.displayName}</option>)}
     </select>
    </label> : null}
   </div>
   <div className="sr-only" aria-live="polite">{copyStatus}</div>
   {copyStatus ? <p className="mb-3 rounded-[12px] border-[2px] border-black bg-[#FFDA47] px-3 py-2 text-[10px] font-black uppercase tracking-[0.06em]">{copyStatus}</p> : null}

   <div className="overflow-hidden rounded-[14px] border-[3px] border-black bg-[#0d0d0d]">
    {unitGroups.map(({ group, label, units }) => {
     const expanded = openGroups.has(group)
     const contentId = `vt-sync-controller-group-${group}`
     const groupCategoryIds = [...new Set(units.flatMap((unit) => unit.categoryIds))]
     const groupActive = groupCategoryIds.some((id) => activeCategorySet.has(id))
     const groupQueued = groupCategoryIds.some((id) => queuedCategorySet.has(id))
     const groupCompleted = groupCategoryIds.some((id) => categoryCompleted[id])
     const progressGroup = progressGroupById.get(group)
     const selectedInGroup = units.filter((unit) => unit.categoryIds.every((id) => selectedSet.has(id))).length
     return (
      <section key={group} className="border-b-[3px] border-black bg-[#0d0d0d] last:border-b-0">
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
         className={`vt-retro-acc-header flex h-full w-full items-center justify-between gap-3 py-1.5 px-3 text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-black ${expanded ? "border-b-[2px] border-black" : ""}`}
        >
         <span className="flex min-w-0 items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[5px] border-[2px] border-black bg-white" aria-hidden="true">
           {expanded ? <ChevronDown className="h-4 w-4" strokeWidth={3.5} /> : <ChevronRight className="h-4 w-4" strokeWidth={3.5} />}
          </span>
          <span className="vt-retro-acc-label truncate text-[15px] font-[1000] tracking-tighter">{label}</span>
         </span>
        </button>
        </h3>
        <div className={`flex shrink-0 items-center gap-2 border-l-[3px] border-black px-2 py-1 ${expanded ? "border-b-[2px]" : ""}`}>
         <span className="hidden text-right text-[8px] font-black uppercase leading-tight tracking-[0.04em] text-black/65 sm:block">
          <span className="block">{selectedInGroup}/{units.length} selected</span>
          <span className="block">{progressGroup?.rowCount.toLocaleString() || 0} rows · {progressGroup?.issueCount || 0} issues</span>
         </span>
         <span className="rounded-[6px] border-[2px] border-black px-2 py-1 text-[8px] font-black uppercase leading-none" style={{ backgroundColor: syncStatusTone(groupActive ? "running" : groupQueued ? "queued" : progressGroup?.status) }}>
          {syncStatusLabel(groupActive ? "running" : groupQueued ? "queued" : progressGroup?.status)}
         </span>
         {renderCategorySlideSwitch({
          label: "SYNC ALL",
          active: groupActive,
          queued: groupQueued,
          completed: groupCompleted,
          onClick: () => void startCategories(groupCategoryIds, units.some((unit) => unit.id === "retention")),
         })}
        </div>
       </div>
       <div id={contentId} hidden={!expanded}>
         <div className="divide-y-[2px] divide-black">
          {units.map((unit) => {
           const checked = unit.categoryIds.every((id) => selectedSet.has(id))
           const active = unit.categoryIds.some((id) => activeCategorySet.has(id))
           const queued = unit.categoryIds.some((id) => queuedCategorySet.has(id))
           const progressUnit = progressUnitById.get(unit.id)
           const hasPriorData = Boolean(progressUnit?.storedUpdatedAt || unit.categoryIds.some((id) => {
             const entry = categoryFreshness(datasetFreshness, id)
             return Boolean(entry?.status && entry.status !== "failed")
            }))
           const detailsExpanded = active || Boolean(progressUnit?.issues.length) || expandedUnitIds.has(unit.id)
           const detailsId = `vt-sync-unit-details-${unit.id}`
           const displayStatus = active ? "running" : queued ? "queued" : progressUnit?.status
           return (
            <React.Fragment key={unit.id}>
             <div className={`grid min-h-[66px] w-full grid-cols-[44px_minmax(0,1fr)_auto_104px] items-center gap-2 px-3 py-2 text-left hover:bg-[#f8f7f1] max-sm:min-h-[58px] max-sm:grid-cols-[36px_minmax(0,1fr)_88px] max-sm:gap-1.5 max-sm:px-2 max-sm:py-1.5 ${checked ? "bg-white" : "bg-white/55 text-black/55"}`}>
              <label className="grid min-h-11 min-w-11 cursor-pointer place-items-center max-sm:min-w-9" title={`${checked ? "Remove" : "Add"} ${unit.label} ${checked ? "from" : "to"} batch sync`}>
               <input type="checkbox" checked={checked} onChange={() => toggleMany(unit.categoryIds)} className="h-5 w-5 accent-black" aria-label={`${checked ? "Remove" : "Add"} ${unit.label} ${checked ? "from" : "to"} batch sync`} />
              </label>
              <button
               type="button"
               aria-expanded={detailsExpanded}
               aria-controls={detailsId}
               onClick={() => setExpandedUnitIds((current) => {
                const next = new Set(current)
                if (next.has(unit.id)) next.delete(unit.id)
                else next.add(unit.id)
                return next
               })}
               className="min-w-0 py-1 text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
               <span className="flex min-w-0 items-center gap-1.5">
                {detailsExpanded ? <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" /> : <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
                <span className="truncate text-[12px] font-black uppercase tracking-[-0.01em]">{unit.label}</span>
                {unit.defaultEnabled ? <span className="rounded-[4px] border border-black bg-[#3FEE56] px-1.5 py-[1px] text-[8px] font-black uppercase leading-tight">Core</span> : null}
               </span>
               <span className="mt-1 block truncate text-[8px] font-bold uppercase leading-none tracking-[0.03em] text-black/55">
                {unit.id === "video_catalog" && videoCatalogCoverage
                 ? `${videoCatalogCoverage.catalogTotal.toLocaleString()} videos · metadata ${videoCatalogCoverage.metadataAvailable.toLocaleString()} · analytics ${videoCatalogCoverage.analyticsAvailable.toLocaleString()}`
                 : `${progressUnit?.displayRows.toLocaleString() || 0} rows · ${formatRelativeTime(progressUnit?.storedUpdatedAt)}`} · {syncStatusLabel(displayStatus)}
               </span>
               <span className="mt-1 block truncate text-[8px] font-black uppercase leading-tight tracking-[0.02em] text-black/65" title={unit.description}>{unit.description}</span>
              </button>
              <span className="rounded-[6px] border-[2px] border-black px-2 py-1 text-[8px] font-black uppercase leading-none max-sm:hidden" style={{ backgroundColor: syncStatusTone(displayStatus) }}>
               {syncStatusLabel(displayStatus)}{progressUnit?.issues.length ? ` · ${progressUnit.issues.length} issue${progressUnit.issues.length === 1 ? "" : "s"}` : ""}
              </span>
              <div className="justify-self-end">
               {renderCategorySlideSwitch({
                label: hasPriorData ? "UPDATE" : "FULL SYNC",
                active,
                queued,
                completed: unit.categoryIds.some((id) => categoryCompleted[id]),
                onClick: () => void startCategories(unit.categoryIds),
               })}
              </div>
             </div>
             <div id={detailsId} hidden={!detailsExpanded} className="grid gap-2 bg-[#f1f1ec] px-3 py-3 text-[9px] font-black uppercase tracking-[0.035em] sm:grid-cols-2">
              <section className="border-[2px] border-black bg-white px-2 py-2 shadow-[2px_2px_0_0_#000]">
               <strong className="block text-[8px] text-black/50">Sync time</strong>
               <span>{formatSyncTime(progressUnit?.startedAt, progressUnit?.completedAt, progressUnit?.storedUpdatedAt)}</span>
              </section>
              <section className="border-[2px] border-black bg-white px-2 py-2 shadow-[2px_2px_0_0_#000]">
               <strong className="block text-[8px] text-black/50">Issues</strong>
               {progressUnit?.issues.length ? <ul className="mt-1 space-y-1 normal-case tracking-normal text-black/75">{progressUnit.issues.map((row) => <li key={`${unit.id}-${row.category.id}`}><b>{row.category.label}:</b> {row.message}</li>)}</ul> : <span>No issues.</span>}
              </section>
              <div className="grid gap-1 border-t border-black/25 pt-2 sm:col-span-2">
               {(progressUnit?.rows || []).map((row) => <div key={row.category.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2"><span className="truncate">{row.category.label} · {row.source}</span><span>{row.displayRows.toLocaleString()} rows</span><span>{syncStatusLabel(row.displayStatus)}</span></div>)}
              </div>
              {unit.id === "video_catalog" ? <button type="button" onClick={() => void startCategories(unit.categoryIds, false, true)} className="min-h-11 border-[2px] border-black bg-[#FFDA47] px-3 py-2 text-[9px] font-black uppercase shadow-[3px_3px_0_0_#000] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none sm:col-span-2">Full Video Metadata Refresh</button> : null}
             </div>
            </React.Fragment>
           )
          })}
         </div>
         {units.some((unit) => unit.id === "retention") && retentionEnabled ? (
          <div className="border-t-[3px] border-black bg-[#f3f4f6]">
           <div className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-black bg-white px-3.5 py-2.5">
            <div>
             <span className="text-[12px] font-black uppercase tracking-[0.02em]">Retention Videos</span>
             <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.02em] text-black/45">
              {retentionVideoIds.length > 0
               ? `${retentionVideoIds.length} manually selected`
               : `Base sync — ${baselineRetentionSelection.selectedCounts.long} long-form + ${baselineRetentionSelection.selectedCounts.short} Shorts by views`}
             </span>
            </div>
            <div className="flex items-center gap-2">
             <button type="button" onClick={() => setRetentionVideoIds([])} className="min-h-11 rounded-[8px] border-[2px] border-black bg-[#FFDA47] px-2.5 py-1 text-[9.5px] font-black uppercase shadow-[2px_2px_0_0_#000] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-black">Use Balanced Default</button>
            </div>
           </div>
           <div className="border-b-[3px] border-black bg-white px-3.5 py-2.5">
            <input
             type="text"
             value={videoSearch}
             onChange={(event) => setVideoSearch(event.target.value)}
             placeholder="Search videos by title…"
             name="retention-video-search"
             autoComplete="off"
             className="w-full rounded-[10px] border-[2px] border-black px-3.5 py-2 text-[16px] font-bold uppercase tracking-[0.02em] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-black sm:text-[11px]"
            />
           </div>
           <div className="max-h-[240px] overflow-auto custom-scrollbar">
            {filteredVideos.length === 0 ? (
             <div className="px-3.5 py-4 text-center text-[11px] font-black uppercase tracking-[0.03em] text-black/45">No videos match.</div>
            ) : filteredVideos.map((video) => {
             const checked = retentionSelectedSet.has(video.id)
             return (
              <label key={video.id} className={`grid min-h-11 w-full cursor-pointer grid-cols-[22px_1fr_auto] items-center gap-2.5 border-b border-black/10 px-3.5 py-2.5 text-left hover:bg-white ${checked ? "bg-white" : "bg-white/40 text-black/50"}`}>
               <input type="checkbox" checked={checked} onChange={() => toggleRetentionVideo(video.id)} className="h-4 w-4 accent-black" />
               <span className="truncate text-[11px] font-black uppercase tracking-[0.01em]">{video.title || video.id}</span>
               <span className="whitespace-nowrap text-[10px] font-bold text-black/45">{(video.views || 0).toLocaleString()} views</span>
              </label>
             )
            })}
           </div>
          </div>
         ) : null}
       </div>
      </section>
     )
    })}
   </div>

   <button
    type="button"
    onClick={isAuthenticated ? start : onLogin}
    disabled={isAuthenticated && selected.length === 0}
    className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] border-[3px] border-black bg-[#3FEE56] py-3.5 text-[14px] font-black uppercase tracking-[0.03em] shadow-[4px_4px_0_0_#000] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-50"
   >
    {isAuthenticated ? <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} /> : <ShieldCheck className="h-4 w-4" />}
    {isSyncing ? `Queue Selected YouTube Data (${selectedUnitCount})` : isAuthenticated ? `Sync Selected YouTube Data (${selectedUnitCount})` : "Connect YouTube Channel"}
   </button>

   </div>
  </ToolboxScaffold>
 )
}
