import React, { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { CONTROL_SHELL, ToolboxScaffold } from "../../../components/Toolbox"
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
import { VT_SYNC_GROUP_LABELS, VT_SYNC_GROUP_ORDER, VT_SYNC_SYNC_UNITS, getVtSyncDefaultUnitIds, getVtSyncUnitCategoryIds } from "../upstream/syncUnitRegistry"
import {
 buildVtSyncConsoleModel,
 VT_SYNC_CONSOLE_STATUS_ORDER,
 VT_SYNC_CONSOLE_STATUS_PRESENTATION,
 type VtSyncConsoleStatus,
} from "./vtSyncProgressModel"

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

const formatSyncDuration = (startedAt?: string, completedAt?: string) => {
 if (!startedAt) return ""
 const start = new Date(startedAt).getTime()
 const end = new Date(completedAt || Date.now()).getTime()
 const seconds = Math.max(0, Math.round((end - start) / 1000))
 const duration = seconds >= 60 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : `${seconds}s`
 return `${completedAt ? "sync" : "running"} ${duration}`
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
 const [expandedUnitIds, setExpandedUnitIds] = useState<Set<string>>(() => new Set())
 const [openGroups, setOpenGroups] = useState<Set<VtSyncCategoryGroup>>(
  () => new Set(["channel"]),
 )
 const unitGroups = useMemo(() => buildUnitGroups(Boolean(activeContentOwnerId)), [activeContentOwnerId])
 const availableUnits = useMemo(() => unitGroups.flatMap((entry) => entry.units), [unitGroups])
 const visibleUnitIds = useMemo(() => availableUnits.map((unit) => unit.id), [availableUnits])
 const allVisibleCategoryIds = useMemo(() => [...new Set(availableUnits.flatMap((unit) => unit.categoryIds))], [availableUnits])
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
  visibleUnitIds,
 }), [datasetFreshness, progress, queuedCategoryIds, syncError, videoCatalogCoverage, visibleUnitIds])
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

 const activeOrIssueGroup = consoleModel.groups.find((group) => group.effectiveStatus === "live" || group.issueCount > 0)?.group
 useEffect(() => {
  if (!activeOrIssueGroup) return
  setOpenGroups((current) => current.has(activeOrIssueGroup) ? current : new Set([...current, activeOrIssueGroup]))
 }, [activeOrIssueGroup])

 const syncLeds: RetroLedSpec[] = VT_SYNC_CONSOLE_STATUS_ORDER.map((status) => ({
  id: status,
  label: `${consoleModel.tally[status]} visible units ${VT_SYNC_CONSOLE_STATUS_PRESENTATION[status].label.toLowerCase()}`,
  tone: VT_SYNC_CONSOLE_STATUS_PRESENTATION[status].tone,
  lit: consoleModel.tally[status] > 0,
  pulse: status === "live",
 }))

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

 const renderCategorySlideSwitch = ({
  idleLabel,
  status,
  onClick,
  disabled,
  size = "unit",
 }: {
  idleLabel: string
  status: VtSyncConsoleStatus
  onClick: () => void
  disabled?: boolean
  size?: "unit" | "global"
 }) => {
  const presentation = VT_SYNC_CONSOLE_STATUS_PRESENTATION[status]
  const visibleLabel = status === "never" ? idleLabel : presentation.label

  return (
   <div
    className={`vt-retro-pcb-group is-category-action is-status-${status} ${status !== "never" ? "is-active" : ""} ${size === "global" ? "is-global-action" : ""}`}
    style={{ "--vt-sync-status-tone": presentation.tone } as React.CSSProperties}
   >
    <div className="vt-retro-pcb-controls">
     <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="switch-hitbox"
      aria-pressed={status === "live"}
      title={`${idleLabel}: ${presentation.label}`}
      aria-label={`${idleLabel}: ${presentation.label}`}
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
    <div className="comp-label">{visibleLabel}</div>
   </div>
  )
 }

 const statusForCategories = (categoryIds: string[]): VtSyncConsoleStatus => {
  if (categoryIds.some((id) => activeCategorySet.has(id))) return "live"
  if (categoryIds.some((id) => queuedCategorySet.has(id))) return "queued"
  return "never"
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
   <div className="w-full" data-vt-sync-unified-console style={{ "--vt-sync-control-height": `${CONTROL_SHELL.height}px` } as React.CSSProperties}>

   <section aria-label="Current sync operation" aria-live="polite" className="mb-3 overflow-hidden rounded-[14px] border-[3px] border-black bg-white">
    <header className="flex items-center justify-between gap-2 border-b-[3px] border-black bg-[#C0F240] px-3 py-2">
     <div className="min-w-0">
      <h3 className="vt-retro-acc-label truncate text-[14px] font-[1000] tracking-tighter">Sync operations</h3>
      <p className="truncate text-[8px] font-black uppercase tracking-[0.07em] text-black/55">Live execution and stored freshness share one dataset tree.</p>
     </div>
     <div className="flex min-w-0 items-center gap-2">
      {contentOwners.length > 0 ? <label className="vt-sync-content-owner">
       <span>Content Owner</span>
       <select
        aria-label="Active YouTube Content Owner"
        value={activeContentOwnerId || ""}
        onChange={(event) => { if (event.target.value) void onSelectContentOwner?.(event.target.value) }}
       >
        <option value="">Select owner</option>
        {contentOwners.map((owner) => <option key={owner.id} value={owner.id}>{owner.displayName}</option>)}
       </select>
      </label> : null}
      <RetroLcd tone={VT_SYNC_CONSOLE_STATUS_PRESENTATION.synced.tone} className="shrink-0">{formatRelativeTime(consoleModel.latestDatasetAt)}</RetroLcd>
     </div>
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
   </section>

   <section className="vt-sync-command-rail" aria-label="Sync commands and visible unit status">
    <div className="vt-sync-global-actions">
     {renderCategorySlideSwitch({
      idleLabel: "SYNC ALL",
      status: statusForCategories(allVisibleCategoryIds),
      onClick: () => void startCategories(allVisibleCategoryIds, allVisibleCategoryIds.includes("retention")),
      size: "global",
     })}
     {renderCategorySlideSwitch({
      idleLabel: `SYNC SELECTED (${selectedUnitCount})`,
      status: statusForCategories(selected),
      onClick: () => void start(),
      disabled: selectedUnitCount === 0,
      size: "global",
     })}
    </div>
    <div className="vt-sync-status-grid" role="status" aria-label={`${consoleModel.units.length} visible sync units`}>
     {VT_SYNC_CONSOLE_STATUS_ORDER.map((status) => (
      <span key={status} className={`vt-sync-status-cell is-status-${status}`} style={{ "--vt-sync-status-tone": VT_SYNC_CONSOLE_STATUS_PRESENTATION[status].tone } as React.CSSProperties}>
       <i aria-hidden="true" />
       <span>{VT_SYNC_CONSOLE_STATUS_PRESENTATION[status].label}</span>
       <b>{consoleModel.tally[status]}</b>
      </span>
     ))}
    </div>
   </section>

   <div className="overflow-hidden rounded-[14px] border-[3px] border-black bg-[#0d0d0d]">
    {unitGroups.map(({ group, label, units }) => {
     const expanded = openGroups.has(group)
     const contentId = `vt-sync-controller-group-${group}`
     const groupCategoryIds = [...new Set(units.flatMap((unit) => unit.categoryIds))]
     const progressGroup = progressGroupById.get(group)
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
         className={`vt-retro-acc-header flex h-full w-full items-center justify-between gap-3 px-2 text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-black ${expanded ? "border-b-[2px] border-black" : ""}`}
        >
         <span className="flex min-w-0 items-center gap-2">
          <span className="vt-sync-group-disclosure" aria-hidden="true">
           {expanded ? <ChevronDown strokeWidth={4} /> : <ChevronRight strokeWidth={4} />}
          </span>
          <span className="vt-sync-group-title vt-retro-acc-label truncate">{label}</span>
         </span>
        </button>
        </h3>
        <div className={`flex shrink-0 items-center gap-2 border-l-[3px] border-black px-2 ${expanded ? "border-b-[2px]" : ""}`}>
         {progressGroup?.issueCount ? <span className="vt-sync-issue-count">{progressGroup.issueCount} {progressGroup.issueCount === 1 ? "issue" : "issues"}</span> : null}
         {renderCategorySlideSwitch({
          idleLabel: "SYNC ALL",
          status: progressGroup?.effectiveStatus || "never",
          onClick: () => void startCategories(groupCategoryIds, units.some((unit) => unit.id === "retention")),
         })}
        </div>
       </div>
       <div id={contentId} hidden={!expanded}>
         <div className="divide-y-[2px] divide-black">
          {units.map((unit) => {
           const checked = unit.categoryIds.every((id) => selectedSet.has(id))
           const progressUnit = progressUnitById.get(unit.id)
           const hasUnitDetails = Boolean(progressUnit?.issues.length) || unit.id === "video_catalog"
           const detailsExpanded = hasUnitDetails && (Boolean(progressUnit?.issues.length) || expandedUnitIds.has(unit.id))
           const detailsId = `vt-sync-unit-details-${unit.id}`
           const syncDuration = formatSyncDuration(progressUnit?.startedAt, progressUnit?.completedAt)
           const freshness = formatRelativeTime(progressUnit?.completedAt || progressUnit?.storedUpdatedAt)
           return (
            <React.Fragment key={unit.id}>
             <div className={`grid min-h-[60px] w-full grid-cols-[44px_minmax(0,1fr)_104px] items-center gap-2 px-3 py-1.5 text-left hover:bg-[#f8f7f1] max-sm:grid-cols-[36px_minmax(0,1fr)_88px] max-sm:gap-1.5 max-sm:px-2 ${checked ? "bg-white" : "bg-white/55 text-black/55"}`}>
              <label className="grid min-h-11 min-w-11 cursor-pointer place-items-center max-sm:min-w-9" title={`${checked ? "Remove" : "Add"} ${unit.label} ${checked ? "from" : "to"} batch sync`}>
               <input type="checkbox" checked={checked} onChange={() => toggleMany(unit.categoryIds)} className="h-5 w-5 accent-black" aria-label={`${checked ? "Remove" : "Add"} ${unit.label} ${checked ? "from" : "to"} batch sync`} />
              </label>
              <button
               type="button"
               aria-expanded={hasUnitDetails ? detailsExpanded : undefined}
               aria-controls={detailsId}
               disabled={!hasUnitDetails}
               onClick={() => setExpandedUnitIds((current) => {
                const next = new Set(current)
                if (next.has(unit.id)) next.delete(unit.id)
                else next.add(unit.id)
                return next
               })}
               className="min-w-0 py-1 text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
               <span className="flex min-w-0 items-center gap-1.5">
                {hasUnitDetails ? (detailsExpanded ? <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" /> : <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />) : null}
                <span className="truncate text-[12px] font-black uppercase tracking-[-0.01em]">{unit.label}</span>
               </span>
               <span className="mt-1 block truncate text-[8px] font-bold uppercase leading-none tracking-[0.03em] text-black/55">
                {unit.id === "video_catalog" && videoCatalogCoverage
                 ? `${videoCatalogCoverage.catalogTotal.toLocaleString()} videos · metadata ${videoCatalogCoverage.metadataAvailable.toLocaleString()} · analytics ${videoCatalogCoverage.analyticsAvailable.toLocaleString()} · ${freshness}${syncDuration ? ` · ${syncDuration}` : ""}`
                 : `${progressUnit?.displayCountLabel || `0 ${unit.resultNoun.plural}`} · ${freshness}${syncDuration ? ` · ${syncDuration}` : ""}`}
               </span>
               <span className="mt-1 block truncate text-[8px] font-black uppercase leading-tight tracking-[0.02em] text-black/65" title={unit.description}>{unit.description}</span>
              </button>
              <div className="justify-self-end">
               {renderCategorySlideSwitch({
                idleLabel: "SYNC",
                status: progressUnit?.effectiveStatus || "never",
                onClick: () => void startCategories(unit.categoryIds),
               })}
              </div>
             </div>
             <div id={detailsId} hidden={!detailsExpanded} className="vt-sync-unit-details">
              {progressUnit?.issues.length ? <section className="border-[2px] border-black bg-white px-2 py-2 shadow-[2px_2px_0_0_#000]">
               <strong className="block text-[8px] text-black/50">Issues</strong>
               <ul className="mt-1 space-y-1 normal-case tracking-normal text-black/75">{progressUnit.issues.map((row) => <li key={`${unit.id}-${row.category.id}`}><b>{row.category.label}:</b> {row.message}</li>)}</ul>
              </section> : null}
              {unit.id === "video_catalog" ? <button type="button" onClick={() => void startCategories(unit.categoryIds, false, true)} className="vt-sync-full-metadata-action">Full Video Metadata Refresh</button> : null}
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

   </div>
  </ToolboxScaffold>
 )
}
