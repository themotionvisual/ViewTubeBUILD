import React, { useMemo, useState } from "react"
import { CheckSquare, ChevronDown, ChevronRight, RefreshCw, ShieldCheck, Square } from "lucide-react"
import { ToolboxScaffold } from "../../../components/Toolbox"
import { getPaletteColor } from "../../../styles/toolboxPalette"
import { RetroRivets } from "./VtSyncRetroChrome"
import type { VtSyncCategoryDefinition, VtSyncCategoryGroup, VtSyncDatasetFreshness } from "../adapters/contracts"
import {
 VT_SYNC_CATEGORY_OPTIONS,
 expandVtSyncCategoryDependencies,
 filterVtSyncVisibleCategoryIds,
 getVtSyncCoreCategoryIds,
 getVtSyncDefaultCategoryIds,
} from "../upstream/syncCategoryRegistry"

export type VtSyncRetentionVideoOption = {
 id: string
 title: string
 thumbnail?: string
 views?: number
}

const GROUP_ORDER: VtSyncCategoryGroup[] = ["channel", "videos", "traffic", "audience", "geography", "device", "revenue", "playlists", "retention", "workspace"]
const GROUP_COLORS: Record<string, string> = Object.fromEntries(GROUP_ORDER.map((group, index) => [group, getPaletteColor(index * 2)]))
const SOURCE_API_LABELS: Record<string, string> = {
 youtube_data_v3: "YouTube Data API v3",
 youtube_analytics_v2: "YouTube Analytics API",
 google_workspace: "Google Workspace API",
 derived: "Derived locally",
 local_import: "Local import",
}

const formatPlainLabel = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

const categoryGroups = GROUP_ORDER
 .map((group) => ({
  group,
  label: formatPlainLabel(group),
  categories: VT_SYNC_CATEGORY_OPTIONS.filter((category) => category.group === group),
 }))
 .filter((entry) => entry.categories.length > 0)

// The three "videos" categories form a strict dependency chain (uploads_playlist -> video_metadata ->
// videos_analytics) that all back a single Videos data table, so they sync as one unit in the UI.
const VIDEOS_MERGED_QUOTA_LABEL = "YouTube Data API v3 + YouTube Analytics API · Low–High quota"
const VIDEOS_MERGED_DESCRIPTION = "Full uploaded video list with titles, thumbnails, tags, and per-video views, watch time, and engagement."

const categoryFreshness = (freshness: VtSyncDatasetFreshness | undefined, categoryId: string) =>
 freshness?.[categoryId] || Object.values(freshness || {}).find((entry) => entry.phase === categoryId)

export const VtSyncControllerPanel: React.FC<{
 isAuthenticated: boolean
 isSyncing: boolean
 videos: VtSyncRetentionVideoOption[]
 activeCategoryIds?: string[]
 datasetFreshness?: VtSyncDatasetFreshness
 onLogin: () => Promise<void>
 onStartSync: (categoryIds: string[], retentionVideoIds?: string[]) => Promise<void>
}> = ({ isAuthenticated, isSyncing, videos, activeCategoryIds = [], datasetFreshness, onLogin, onStartSync }) => {
 const [selected, setSelected] = useState<string[]>(() => getVtSyncDefaultCategoryIds())
 const [retentionVideoIds, setRetentionVideoIds] = useState<string[]>([])
 const [videoSearch, setVideoSearch] = useState("")
 const [openGroups, setOpenGroups] = useState<Set<VtSyncCategoryGroup>>(
  () => new Set(categoryGroups[0] ? [categoryGroups[0].group] : []),
 )
 const selectedSet = useMemo(() => new Set(selected), [selected])
 const retentionSelectedSet = useMemo(() => new Set(retentionVideoIds), [retentionVideoIds])
 const retentionEnabled = selectedSet.has("retention")
 const activeCategorySet = useMemo(() => new Set(activeCategoryIds), [activeCategoryIds])
 const sortedVideos = useMemo(() => [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)), [videos])
 const filteredVideos = useMemo(() => {
  const query = videoSearch.trim().toLowerCase()
  if (!query) return sortedVideos
  return sortedVideos.filter((video) => video.title.toLowerCase().includes(query))
 }, [sortedVideos, videoSearch])

 const toggle = (id: string) => {
  if (isSyncing) return
  setSelected((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id])
 }

 const toggleMany = (ids: string[]) => {
  if (isSyncing) return
  setSelected((current) => {
   const allSelected = ids.every((id) => current.includes(id))
   return allSelected
    ? current.filter((entry) => !ids.includes(entry))
    : [...new Set([...current, ...ids])]
  })
 }

 const toggleRetentionVideo = (id: string) => {
  if (isSyncing) return
  setRetentionVideoIds((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id])
 }

 const toggleGroup = (group: VtSyncCategoryGroup) => {
  setOpenGroups((current) => {
   const next = new Set(current)
   if (next.has(group)) next.delete(group)
   else next.add(group)
   return next
  })
 }

 const start = async () => {
  if (!isAuthenticated) await onLogin()
  await onStartSync(expandVtSyncCategoryDependencies(filterVtSyncVisibleCategoryIds(selected)), retentionEnabled ? retentionVideoIds : undefined)
 }

 const startCategories = async (categoryIds: string[], includeRetentionVideoIds = false) => {
  if (!isAuthenticated) await onLogin()
  const expanded = expandVtSyncCategoryDependencies(categoryIds)
  await onStartSync(expanded, includeRetentionVideoIds ? retentionVideoIds : undefined)
 }

 const startSingle = (category: VtSyncCategoryDefinition) => startCategories([category.id], category.id === "retention")

 // Track category-specific completion
 const [prevActiveCategories, setPrevActiveCategoryIds] = useState<string[]>([])
 const [categoryCompleted, setCategoryCompleted] = useState<Record<string, boolean>>({})

 React.useEffect(() => {
  const activeSet = new Set(activeCategoryIds)
  const justCompleted: string[] = []
  prevActiveCategories.forEach((id) => {
   if (!activeSet.has(id)) {
    justCompleted.push(id)
   }
  })

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

  setPrevActiveCategoryIds(activeCategoryIds)
 }, [activeCategoryIds, prevActiveCategories])

 const renderCategorySlideSwitch = ({
  label,
  active,
  completed,
  onClick,
  disabled,
 }: {
  label: string
  active: boolean
  completed: boolean
  onClick: () => void
  disabled?: boolean
 }) => {
  const statusClass =
   active ? "is-syncing"
   : completed ? "is-completed"
   : ""

  return (
   <div
    className={`vt-retro-pcb-group is-category-action ${active || completed ? "is-active" : ""} ${statusClass}`}
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
      disabled={disabled || isSyncing}
      onClick={onClick}
      className="switch-hitbox"
      aria-pressed={active}
      title={`${active ? "Running" : "Start"} Sync`}
      aria-label={`${active ? "Running" : "Start"} Sync`}
     >
      <div className="sw-slide-housing">
       <div className="sw-slide-track">
        <div className="sw-slide-nub" />
       </div>
      </div>
     </button>
     <div className="led-rim">
      <div className="led-bulb" />
     </div>
    </div>
    <div className="comp-label">{active ? "RUNNING" : completed ? "DONE" : label}</div>
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
    <button type="button" disabled={isSyncing} onClick={() => setSelected(VT_SYNC_CATEGORY_OPTIONS.map((category) => category.id))} className="vt-retro-switch"><span className="vt-retro-switch-led" />Select All</button>
    <button type="button" disabled={isSyncing} onClick={() => setSelected(getVtSyncCoreCategoryIds())} className="vt-retro-switch" style={{ "--tone": "#FFDA47", "--tone-light": "#fff3b0" } as React.CSSProperties}><span className="vt-retro-switch-led" />Core Only</button>
    <button type="button" disabled={isSyncing} onClick={() => setSelected(getVtSyncDefaultCategoryIds())} className="vt-retro-switch" style={{ "--tone": "#36E0F6", "--tone-light": "#b9f2ff" } as React.CSSProperties}><span className="vt-retro-switch-led" />Recommended</button>
    <button type="button" disabled={isSyncing} onClick={() => setSelected([])} className="vt-retro-switch"><span className="vt-retro-switch-led" />Clear</button>
   </div>

   <div className="overflow-hidden rounded-[14px] border-[3px] border-black bg-[#0d0d0d]">
    {categoryGroups.map(({ group, label, categories }) => {
     const expanded = openGroups.has(group)
     const contentId = `vt-sync-controller-group-${group}`
     return (
      <section key={group} className="border-b-[3px] border-black bg-[#0d0d0d] last:border-b-0">
       <h3>
        <button
         type="button"
         aria-expanded={expanded}
         aria-controls={contentId}
         onClick={() => toggleGroup(group)}
         className={`vt-retro-acc-header flex w-full items-center justify-between gap-3 py-1.5 px-3 text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-black ${expanded ? "border-b-[2px] border-black" : ""}`}
         style={{ backgroundColor: GROUP_COLORS[group] }}
        >
         <span className="flex min-w-0 items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[5px] border-[2px] border-black bg-white" aria-hidden="true">
           {expanded ? <ChevronDown className="h-4 w-4" strokeWidth={3.5} /> : <ChevronRight className="h-4 w-4" strokeWidth={3.5} />}
          </span>
          <span className="vt-retro-acc-label truncate text-[15px] tracking-[0.02em]">{label}</span>
         </span>
        </button>
       </h3>
       <div id={contentId} hidden={!expanded}>
         <div className="divide-y-[2px] divide-black">
          {group === "videos" ? (() => {
           const videoCategoryIds = categories.map((category) => category.id)
           const checked = videoCategoryIds.every((id) => selectedSet.has(id))
           const active = videoCategoryIds.some((id) => activeCategorySet.has(id))
           const hasPriorData = videoCategoryIds.some((id) => {
            const entry = categoryFreshness(datasetFreshness, id)
            return Boolean(entry?.status && entry.status !== "failed")
           })
           return (
            <div className={`grid w-full grid-cols-[32px_minmax(130px,1.05fr)_minmax(180px,1.35fr)_72px] items-center gap-3 px-3 py-2.5 text-left hover:bg-[#f8f7f1] max-lg:grid-cols-[32px_1fr_72px] ${checked ? "bg-white" : "bg-white/55 text-black/50"}`}>
             <button type="button" aria-pressed={checked} disabled={isSyncing} onClick={() => toggleMany(videoCategoryIds)} title={`${checked ? "Remove" : "Add"} Videos ${checked ? "from" : "to"} batch sync`} aria-label={`${checked ? "Remove" : "Add"} Videos ${checked ? "from" : "to"} batch sync`} className="grid min-h-8 min-w-8 place-items-center rounded-[6px] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-black">
              {checked ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-black/35" />}
             </button>
             <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-1.5">
               <span className="truncate text-[13px] font-black uppercase tracking-[-0.01em]">Video Catalog &amp; Analytics</span>
               <span className="rounded-full border border-black bg-[#3FEE56] px-1.5 py-[1px] text-[8px] font-black uppercase leading-tight">Core</span>
              </span>
              <span className="mt-1 block text-[9.5px] font-bold uppercase leading-snug tracking-[0.03em] text-black/45">
               {VIDEOS_MERGED_QUOTA_LABEL}
              </span>
             </span>
             <span className="min-w-0 text-[10px] font-black uppercase leading-snug tracking-[0.02em] text-black/70 max-lg:col-span-2 max-lg:col-start-2">
              {VIDEOS_MERGED_DESCRIPTION}
             </span>
             {renderCategorySlideSwitch({
              label: hasPriorData ? "UPDATE" : "FULL SYNC",
              active,
              completed: videoCategoryIds.some((id) => categoryCompleted[id]),
              onClick: () => void startCategories(videoCategoryIds),
             })}
            </div>
           )
          })() : categories.map((category: VtSyncCategoryDefinition) => {
           const checked = selectedSet.has(category.id)
           const active = activeCategorySet.has(category.id)
           return (
            <div
             key={category.id}
             className={`grid w-full grid-cols-[32px_minmax(130px,1.05fr)_minmax(180px,1.35fr)_72px] items-center gap-3 px-3 py-2.5 text-left hover:bg-[#f8f7f1] max-lg:grid-cols-[32px_1fr_72px] ${checked ? "bg-white" : "bg-white/55 text-black/50"}`}
            >
             <button type="button" aria-pressed={checked} disabled={isSyncing} onClick={() => toggle(category.id)} title={`${checked ? "Remove" : "Add"} ${category.label} ${checked ? "from" : "to"} batch sync`} aria-label={`${checked ? "Remove" : "Add"} ${category.label} ${checked ? "from" : "to"} batch sync`} className="grid min-h-8 min-w-8 place-items-center rounded-[6px] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-black">
              {checked ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-black/35" />}
             </button>
             <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-1.5">
               <span className="truncate text-[13px] font-black uppercase tracking-[-0.01em]">{category.label}</span>
               {category.isCore ? <span className="rounded-full border border-black bg-[#3FEE56] px-1.5 py-[1px] text-[8px] font-black uppercase leading-tight">Core</span> : null}
              </span>
              <span className="mt-1 block text-[9.5px] font-bold uppercase leading-snug tracking-[0.03em] text-black/45">
               {SOURCE_API_LABELS[category.sourceApi] || formatPlainLabel(category.sourceApi)} · {formatPlainLabel(category.quotaClass)} quota
              </span>
             </span>
             <span className="min-w-0 text-[10px] font-black uppercase leading-snug tracking-[0.02em] text-black/70 max-lg:col-span-2 max-lg:col-start-2">
              {category.description}
             </span>
             {renderCategorySlideSwitch({
              label: "SYNC",
              active,
              completed: categoryCompleted[category.id],
              onClick: () => void startSingle(category),
             })}
            </div>
           )
          })}
         </div>
         {group === "retention" && retentionEnabled ? (
          <div className="border-t-[3px] border-black bg-[#f3f4f6]">
           <div className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-black bg-white px-3.5 py-2.5">
            <div>
             <span className="text-[12px] font-black uppercase tracking-[0.02em]">Retention Videos</span>
             <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.02em] text-black/45">
              {retentionVideoIds.length > 0 ? `${retentionVideoIds.length} selected` : "None selected — defaults to top 25 by views"}
             </span>
            </div>
            <div className="flex items-center gap-2">
             <button type="button" disabled={isSyncing} onClick={() => setRetentionVideoIds(sortedVideos.slice(0, 25).map((video) => video.id))} className="rounded-full border-[2px] border-black bg-[#FFDA47] px-2.5 py-1 text-[9.5px] font-black uppercase shadow-[2px_2px_0_0_#000]">Top 25</button>
             <button type="button" disabled={isSyncing} onClick={() => setRetentionVideoIds([])} className="rounded-full border-[2px] border-black bg-white px-2.5 py-1 text-[9.5px] font-black uppercase shadow-[2px_2px_0_0_#000]">Clear</button>
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
              <button key={video.id} type="button" aria-pressed={checked} disabled={isSyncing} onClick={() => toggleRetentionVideo(video.id)} className={`grid w-full grid-cols-[22px_1fr_auto] items-center gap-2.5 border-b border-black/10 px-3.5 py-2.5 text-left transition-colors hover:bg-white ${checked ? "bg-white" : "bg-white/40 text-black/50"}`}>
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
    disabled={isSyncing || (isAuthenticated && selected.length === 0)}
    className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] border-[3px] border-black bg-[#3FEE56] py-3.5 text-[14px] font-black uppercase tracking-[0.03em] shadow-[4px_4px_0_0_#000] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-50"
   >
    {isAuthenticated ? <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} /> : <ShieldCheck className="h-4 w-4" />}
    {isSyncing ? "Syncing…" : isAuthenticated ? `Sync Selected YouTube Data (${selected.length})` : "Connect YouTube Channel"}
   </button>

   </div>
  </ToolboxScaffold>
 )
}
