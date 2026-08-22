import React, { useMemo, useRef, useState } from "react"
import { CheckSquare, ChevronDown, ChevronRight, RefreshCw, ShieldCheck, Square } from "lucide-react"
import { ToolboxScaffold } from "../../../components/Toolbox"
import { getPaletteColor } from "../../../styles/toolboxPalette"
import { RetroRivets } from "./VtSyncRetroChrome"
import type { VtSyncCategoryGroup, VtSyncDatasetFreshness } from "../adapters/contracts"
import { selectVtSyncBaseRetentionVideos } from "../adapters/retentionSelection"
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

export const VtSyncControllerPanel: React.FC<{
 isAuthenticated: boolean
 isSyncing: boolean
 videos: VtSyncRetentionVideoOption[]
 activeCategoryIds?: string[]
 queuedCategoryIds?: string[]
 datasetFreshness?: VtSyncDatasetFreshness
 contentOwners?: Array<{ id: string; displayName: string }>
 activeContentOwnerId?: string | null
 onSelectContentOwner?: (ownerId: string) => Promise<void>
 onLogin: () => Promise<void>
 onStartSync: (categoryIds: string[], retentionVideoIds?: string[], forceFullVideoMetadata?: boolean) => Promise<void>
}> = ({ isAuthenticated, isSyncing, videos, activeCategoryIds = [], queuedCategoryIds = [], datasetFreshness, contentOwners = [], activeContentOwnerId, onSelectContentOwner, onLogin, onStartSync }) => {
 const [selected, setSelected] = useState<string[]>(() => getVtSyncDefaultUnitIds().flatMap(getVtSyncUnitCategoryIds))
 const [retentionVideoIds, setRetentionVideoIds] = useState<string[]>([])
 const [videoSearch, setVideoSearch] = useState("")
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
 const activeCategorySet = useMemo(() => new Set(activeCategoryIds), [activeCategoryIds])
 const queuedCategorySet = useMemo(() => new Set(queuedCategoryIds), [queuedCategoryIds])
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
  if (!isAuthenticated) await onLogin()
  await onStartSync(expandVtSyncCategoryDependencies(filterVtSyncVisibleCategoryIds(selected)), retentionEnabled ? retentionVideoIds : undefined)
 }

 const startCategories = async (categoryIds: string[], includeRetentionVideoIds = false, forceFullVideoMetadata = false) => {
  if (!isAuthenticated) await onLogin()
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
   subtitle="Select datasets and run the YouTube sync."
   iconName="analytics"
   headerColor="bg-[#36E0F6]"
   iconBoxColor="bg-[#C0F240]"
   paletteIndex={2}
   embedded
   contentClassName="vt-retro-dark-content p-4"
   outerClassName="vt-retro-shell"
   hardShadow
  >
   <RetroRivets />
   <div className="w-full">

   <div className="mb-4 flex flex-wrap items-center gap-2">
    <button type="button" onClick={() => setSelected(availableUnits.flatMap((unit) => unit.categoryIds))} className="vt-retro-switch"><span className="vt-retro-switch-led" />Select All</button>
    <button type="button" onClick={() => setSelected(availableUnits.filter((unit) => unit.defaultEnabled).flatMap((unit) => unit.categoryIds))} className="vt-retro-switch" style={{ "--tone": "#FFDA47", "--tone-light": "#fff3b0" } as React.CSSProperties}><span className="vt-retro-switch-led" />Core Units</button>
    <button type="button" onClick={() => setSelected(getVtSyncDefaultUnitIds().flatMap(getVtSyncUnitCategoryIds))} className="vt-retro-switch" style={{ "--tone": "#36E0F6", "--tone-light": "#b9f2ff" } as React.CSSProperties}><span className="vt-retro-switch-led" />Recommended</button>
    <button type="button" onClick={() => setSelected([])} className="vt-retro-switch"><span className="vt-retro-switch-led" />Clear</button>
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

   <div className="overflow-hidden rounded-[14px] border-[3px] border-black bg-[#0d0d0d]">
    {unitGroups.map(({ group, label, units }) => {
     const expanded = openGroups.has(group)
     const contentId = `vt-sync-controller-group-${group}`
     const groupCategoryIds = [...new Set(units.flatMap((unit) => unit.categoryIds))]
     const groupActive = groupCategoryIds.some((id) => activeCategorySet.has(id))
     const groupQueued = groupCategoryIds.some((id) => queuedCategorySet.has(id))
     const groupCompleted = groupCategoryIds.some((id) => categoryCompleted[id])
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
        <div className={`grid shrink-0 place-items-center border-l-[3px] border-black px-2 py-1 ${expanded ? "border-b-[2px]" : ""}`}>
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
           const hasPriorData = unit.categoryIds.some((id) => {
            const entry = categoryFreshness(datasetFreshness, id)
            return Boolean(entry?.status && entry.status !== "failed")
           })
           return (
            <div key={unit.id} className={`grid min-h-[54px] w-full grid-cols-[28px_minmax(150px,1.05fr)_minmax(180px,1.45fr)_104px] items-center gap-2 px-3 py-1.5 text-left hover:bg-[#f8f7f1] max-lg:grid-cols-[28px_minmax(0,1fr)_104px] ${checked ? "bg-white" : "bg-white/55 text-black/50"}`}>
             <button type="button" aria-pressed={checked} onClick={() => toggleMany(unit.categoryIds)} title={`${checked ? "Remove" : "Add"} ${unit.label} ${checked ? "from" : "to"} batch sync`} aria-label={`${checked ? "Remove" : "Add"} ${unit.label} ${checked ? "from" : "to"} batch sync`} className="grid min-h-8 min-w-8 place-items-center rounded-[6px] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-black">
              {checked ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-black/35" />}
             </button>
             <span className="min-w-0 leading-none">
              <span className="flex flex-wrap items-center gap-1.5">
               <span className="truncate text-[12px] font-black uppercase tracking-[-0.01em]">{unit.label}</span>
               {unit.defaultEnabled ? <span className="rounded-full border border-black bg-[#3FEE56] px-1.5 py-[1px] text-[8px] font-black uppercase leading-tight">Core</span> : null}
              </span>
              <span className="mt-1 flex min-w-0 items-center gap-1 text-[8px] font-bold uppercase leading-none tracking-[0.03em] text-black/50">
               <span className="truncate">{unit.categoryIds.length} child quer{unit.categoryIds.length === 1 ? "y" : "ies"} · {formatPlainLabel(unit.refreshPolicy)}</span>
               {unit.id === "video_catalog" ? <button type="button" onClick={() => void startCategories(unit.categoryIds, false, true)} className="ml-1.5 rounded border border-black bg-[#FFDA47] px-1 py-px text-[7px] font-black uppercase leading-none shadow-[1px_1px_0_0_#000]">Full refresh</button> : null}
              </span>
             </span>
             <span className="min-w-0 truncate text-[9px] font-black uppercase leading-tight tracking-[0.02em] text-black/70 max-lg:col-span-2 max-lg:col-start-2" title={unit.description}>
              {unit.description}
             </span>
             {renderCategorySlideSwitch({
              label: hasPriorData ? "UPDATE" : "FULL SYNC",
              active,
              queued: unit.categoryIds.some((id) => queuedCategorySet.has(id)),
              completed: unit.categoryIds.some((id) => categoryCompleted[id]),
              onClick: () => void startCategories(unit.categoryIds),
             })}
            </div>
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
             <button type="button" onClick={() => setRetentionVideoIds([])} className="rounded-full border-[2px] border-black bg-[#FFDA47] px-2.5 py-1 text-[9.5px] font-black uppercase shadow-[2px_2px_0_0_#000]">Use Balanced Default</button>
            </div>
           </div>
           <div className="border-b-[3px] border-black bg-white px-3.5 py-2.5">
            <input
             type="text"
             value={videoSearch}
             onChange={(event) => setVideoSearch(event.target.value)}
             placeholder="Search videos by title…"
             className="w-full rounded-full border-[2px] border-black px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.02em] outline-none focus:border-[#528FFA]"
            />
           </div>
           <div className="max-h-[240px] overflow-auto custom-scrollbar">
            {filteredVideos.length === 0 ? (
             <div className="px-3.5 py-4 text-center text-[11px] font-black uppercase tracking-[0.03em] text-black/45">No videos match.</div>
            ) : filteredVideos.map((video) => {
             const checked = retentionSelectedSet.has(video.id)
             return (
              <button key={video.id} type="button" aria-pressed={checked} onClick={() => toggleRetentionVideo(video.id)} className={`grid w-full grid-cols-[22px_1fr_auto] items-center gap-2.5 border-b border-black/10 px-3.5 py-2.5 text-left transition-colors hover:bg-white ${checked ? "bg-white" : "bg-white/40 text-black/50"}`}>
               <span>{checked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-black/35" />}</span>
               <span className="truncate text-[11px] font-black uppercase tracking-[0.01em]">{video.title || video.id}</span>
               <span className="whitespace-nowrap text-[10px] font-bold text-black/45">{(video.views || 0).toLocaleString()} views</span>
              </button>
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
