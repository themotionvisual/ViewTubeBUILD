import React, { useMemo, useState } from "react"
import { CheckSquare, ChevronDown, ChevronRight, RefreshCw, ShieldCheck, Square } from "lucide-react"
import { ToolboxScaffold } from "../../../components/Toolbox"
import { getPaletteColor } from "../../../styles/toolboxPalette"
import type { VtSyncCategoryDefinition, VtSyncCategoryGroup } from "../adapters/contracts"
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

const pillButton = "rounded-full border-[2px] border-black px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.04em] transition-transform disabled:cursor-not-allowed disabled:opacity-50"

const categoryGroups = GROUP_ORDER
 .map((group) => ({
  group,
  label: formatPlainLabel(group),
  categories: VT_SYNC_CATEGORY_OPTIONS.filter((category) => category.group === group),
 }))
 .filter((entry) => entry.categories.length > 0)

export const VtSyncControllerPanel: React.FC<{
 isAuthenticated: boolean
 isSyncing: boolean
 videos: VtSyncRetentionVideoOption[]
 activeCategoryIds?: string[]
 onLogin: () => Promise<void>
 onStartSync: (categoryIds: string[], retentionVideoIds?: string[]) => Promise<void>
}> = ({ isAuthenticated, isSyncing, videos, activeCategoryIds = [], onLogin, onStartSync }) => {
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

 const startSingle = async (category: VtSyncCategoryDefinition) => {
  if (!isAuthenticated) await onLogin()
  const categoryIds = expandVtSyncCategoryDependencies([category.id])
  await onStartSync(categoryIds, category.id === "retention" ? retentionVideoIds : undefined)
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
   contentClassName="bg-white p-4"
   headerActions={
    <div className="flex flex-wrap items-center gap-2">
     <span className="rounded-full border-[2px] border-black bg-[#FFDA47] px-3 py-1 text-[10px] font-black uppercase leading-none tabular-nums">{selected.length} selected</span>
     <span className={`rounded-full border-[2px] border-black px-3 py-1 text-[10px] font-black uppercase leading-none ${isAuthenticated ? "bg-[#3FEE56]" : "bg-[#FA618A]"}`}>{isAuthenticated ? "Authorized" : "Connect"}</span>
     <span className={`rounded-full border-[2px] border-black px-3 py-1 text-[10px] font-black uppercase leading-none ${isSyncing ? "bg-[#FFFF61]" : "bg-white"}`}>{isSyncing ? "Running" : "Ready"}</span>
    </div>
   }
  >
   <div className="w-full bg-white">

   <div className="mb-4 flex flex-wrap items-center gap-2">
    <button type="button" disabled={isSyncing} onClick={() => setSelected(VT_SYNC_CATEGORY_OPTIONS.map((category) => category.id))} className={`${pillButton} bg-white shadow-[2px_2px_0_0_#000]`}>Select All</button>
    <button type="button" disabled={isSyncing} onClick={() => setSelected(getVtSyncCoreCategoryIds())} className={`${pillButton} bg-[#FFDA47] shadow-[2px_2px_0_0_#000]`}>Core Only</button>
    <button type="button" disabled={isSyncing} onClick={() => setSelected(getVtSyncDefaultCategoryIds())} className={`${pillButton} bg-[#36E0F6] shadow-[2px_2px_0_0_#000]`}>Recommended</button>
    <button type="button" disabled={isSyncing} onClick={() => setSelected([])} className={`${pillButton} bg-white shadow-[2px_2px_0_0_#000]`}>Clear</button>
   </div>

   <div className="overflow-hidden rounded-[14px] border-[3px] border-black bg-white">
    {categoryGroups.map(({ group, label, categories }) => {
     const selectedCount = categories.filter((category) => selectedSet.has(category.id)).length
     const expanded = openGroups.has(group)
     const contentId = `vt-sync-controller-group-${group}`
     return (
      <section key={group} className="border-b-[3px] border-black bg-white last:border-b-0">
       <h3>
        <button
         type="button"
         aria-expanded={expanded}
         aria-controls={contentId}
         onClick={() => toggleGroup(group)}
         className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-black ${expanded ? "border-b-[2px] border-black" : ""}`}
         style={{ backgroundColor: GROUP_COLORS[group] }}
        >
         <span className="flex min-w-0 items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[5px] border-[2px] border-black bg-white" aria-hidden="true">
           {expanded ? <ChevronDown className="h-4 w-4" strokeWidth={3.5} /> : <ChevronRight className="h-4 w-4" strokeWidth={3.5} />}
          </span>
          <span className="truncate text-[13px] font-black uppercase tracking-[0.02em]">{label}</span>
         </span>
         <span className="shrink-0 rounded-full border-[2px] border-black bg-white px-2.5 py-1 text-[9.5px] font-black uppercase leading-none">{selectedCount}/{categories.length} selected</span>
        </button>
       </h3>
       <div id={contentId} hidden={!expanded}>
         <div className="divide-y-[2px] divide-black">
          {categories.map((category: VtSyncCategoryDefinition) => {
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
             <button
              type="button"
              disabled={isSyncing}
              onClick={() => void startSingle(category)}
              aria-label={`Sync ${category.label}${category.dependsOn?.length ? " with required prerequisites" : ""}`}
              className="flex min-h-8 min-w-[68px] items-center justify-center gap-1 rounded-[7px] border-[2px] border-black bg-[#C0F240] px-2 py-1 text-[9px] font-black uppercase shadow-[2px_2px_0_0_#000] active:translate-x-px active:translate-y-px active:shadow-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-45"
             >
              <RefreshCw className={`h-3.5 w-3.5 ${active ? "animate-spin" : ""}`} aria-hidden="true" />
              {active ? "Running" : "Sync"}
             </button>
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
