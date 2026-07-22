import React, { useMemo, useState } from "react"
import { CheckSquare, RefreshCw, ShieldCheck, Square } from "lucide-react"
import {
 VT_SYNC_CATEGORY_OPTIONS,
 VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS,
 filterVtSyncVisibleCategoryIds,
 getVtSyncCoreCategoryIds,
 getVtSyncDefaultCategoryIds,
} from "../upstream/syncCategoryRegistry"

export const VtSyncControllerPanel: React.FC<{
 isAuthenticated: boolean
 isSyncing: boolean
 onLogin: () => Promise<void>
 onStartSync: (categoryIds: string[]) => Promise<void>
}> = ({ isAuthenticated, isSyncing, onLogin, onStartSync }) => {
 const [selected, setSelected] = useState<string[]>(() => getVtSyncDefaultCategoryIds())
 const selectedSet = useMemo(() => new Set(selected), [selected])
 const selectedByGroup = useMemo(() => VT_SYNC_CATEGORY_OPTIONS.reduce<Record<string, { selected: number; total: number }>>((acc, category) => {
  const current = acc[category.group] || { selected: 0, total: 0 }
  acc[category.group] = {
   selected: current.selected + (selectedSet.has(category.id) ? 1 : 0),
   total: current.total + 1,
  }
  return acc
 }, {}), [selectedSet])

 const toggle = (id: string) => {
  if (isSyncing) return
  setSelected((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id])
 }

 const start = async () => {
 if (!isAuthenticated) await onLogin()
  await onStartSync(filterVtSyncVisibleCategoryIds(selected))
 }

 return (
  <section className="rounded-[22px] border-[4px] border-black bg-white p-4 shadow-[8px_8px_0_0_#000]">
   <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
    <div>
     <h2 className="text-2xl font-black uppercase tracking-[-0.04em]">Sync Controller</h2>
     <p className="mt-1 max-w-4xl text-[10px] font-black uppercase leading-relaxed tracking-[0.09em] text-black/55">Compact VT-SYNC stable dataset checklist. Hidden unvalidated query shapes stay out of Select All and store results only in the local VT-SYNC snapshot.</p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
     <button type="button" disabled={isSyncing} onClick={() => setSelected(VT_SYNC_CATEGORY_OPTIONS.map((category) => category.id))} className="rounded-full border-[3px] border-black bg-white px-3 py-1.5 text-[9px] font-black uppercase shadow-[3px_3px_0_0_#000]">All</button>
     <button type="button" disabled={isSyncing} onClick={() => setSelected(getVtSyncCoreCategoryIds())} className="rounded-full border-[3px] border-black bg-[#FFFF61] px-3 py-1.5 text-[9px] font-black uppercase shadow-[3px_3px_0_0_#000]">Core</button>
     <button type="button" disabled={isSyncing} onClick={() => setSelected(getVtSyncDefaultCategoryIds())} className="rounded-full border-[3px] border-black bg-[#59BFFF] px-3 py-1.5 text-[9px] font-black uppercase shadow-[3px_3px_0_0_#000]">Default</button>
     <button type="button" disabled={isSyncing} onClick={() => setSelected([])} className="rounded-full border-[3px] border-black bg-white px-3 py-1.5 text-[9px] font-black uppercase shadow-[3px_3px_0_0_#000]">Clear</button>
     <span className={`rounded-full border-[3px] border-black px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] ${isAuthenticated ? "bg-[#C9F830]" : "bg-[#FF8AAF]"}`}>{isAuthenticated ? "Authorized" : "Auth Needed"}</span>
     <span className="rounded-full border-[3px] border-black bg-[#FFB570] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em]">{VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS.length} Hidden</span>
     <button
      type="button"
      onClick={isAuthenticated ? start : onLogin}
      disabled={isSyncing || (isAuthenticated && selected.length === 0)}
      className="rounded-full border-[3px] border-black bg-[#4FFF5B] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] shadow-[4px_4px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
     >
      {isAuthenticated ? <RefreshCw className={`mr-1.5 inline h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} /> : <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5" />}
      {isAuthenticated ? `Start (${selected.length})` : "Authorize"}
     </button>
    </div>
   </div>

   <div className="mb-3 flex flex-wrap gap-1.5">
    {Object.entries(selectedByGroup).map(([group, counts]) => (
     <span key={group} className="rounded-full border-[2px] border-black bg-[#f3f4f6] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em]">
      {group}: {counts.selected}/{counts.total}
     </span>
    ))}
   </div>

   <div className="max-h-[390px] overflow-auto rounded-[16px] border-[3px] border-black bg-[#f3f4f6] custom-scrollbar">
    <div className="grid grid-cols-[28px_minmax(105px,0.7fr)_minmax(120px,1fr)_76px_66px] items-center gap-2 border-b-[3px] border-black bg-white px-3 py-2 text-[8px] font-black uppercase tracking-[0.14em] text-black/55">
     <span />
     <span>Group</span>
     <span>Category</span>
     <span>Type</span>
     <span>Quota</span>
    </div>
    {VT_SYNC_CATEGORY_OPTIONS.map((category) => {
     const checked = selectedSet.has(category.id)
     return (
      <button key={category.id} type="button" disabled={isSyncing} onClick={() => toggle(category.id)} className={`grid w-full grid-cols-[28px_minmax(105px,0.7fr)_minmax(120px,1fr)_76px_66px] items-center gap-2 border-b border-black/15 px-3 py-2 text-left transition hover:bg-[#C9F830]/25 ${checked ? "bg-white" : "bg-white/45 text-black/55"}`}>
       <span>{checked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}</span>
       <span className="truncate text-[9px] font-black uppercase tracking-[0.09em]">{category.group}</span>
       <span className="min-w-0">
        <span className="block truncate text-[10px] font-black uppercase tracking-[0.06em]">{category.label}</span>
        <span className="block truncate text-[8px] font-bold uppercase tracking-[0.05em] text-black/45">{category.description}</span>
       </span>
       <span className={`w-fit rounded-full border-[2px] border-black px-2 py-0.5 text-[8px] font-black uppercase ${category.isCore ? "bg-[#4FFF5B]" : "bg-white"}`}>{category.isCore ? "core" : "extra"}</span>
       <span className="w-fit rounded-full border-[2px] border-black bg-[#FFFF61] px-2 py-0.5 text-[8px] font-black uppercase">{category.quotaClass}</span>
      </button>
     )
    })}
   </div>
  </section>
 )
}
