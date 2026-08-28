import React, { useMemo, useState } from "react"
import { Boxes, Search } from "lucide-react"
import { GUIDE_WIDGETS, type GuideWidgetDefinition } from "../../content/guide-v2"

export const GuideWidgetExplorer: React.FC = () => {
 const [query, setQuery] = useState("")
 const [selectedId, setSelectedId] = useState(GUIDE_WIDGETS[0]?.id || "")
 const filtered = useMemo(() => {
  const needle = query.trim().toLowerCase()
  if (!needle) return GUIDE_WIDGETS
  return GUIDE_WIDGETS.filter((widget) =>
   `${widget.title} ${widget.subtitle} ${widget.category} ${widget.status} ${widget.releaseTier} ${widget.shortDescription} ${widget.detailedDescription}`
    .toLowerCase()
    .includes(needle),
  )
 }, [query])
 const selected = GUIDE_WIDGETS.find((widget) => widget.id === selectedId) || filtered[0] || null

 return (
  <div className="grid min-w-0 gap-4 lg:grid-cols-[.9fr_1.1fr]">
   <div className="min-w-0 rounded-2xl border-[4px] border-black bg-white p-4 shadow-[6px_6px_0_0_#000]">
    <div className="flex items-center justify-between gap-3">
     <div>
      <p className="text-[10px] font-black uppercase tracking-[.18em] text-black/45">Dashboard registry</p>
      <h3 className="text-xl font-black uppercase">Widget encyclopedia</h3>
     </div>
     <span className="rounded-lg border-[3px] border-black bg-[#FF8AAF] px-3 py-2 font-black">{GUIDE_WIDGETS.length}</span>
    </div>
    <label className="mt-3 flex items-center gap-2 rounded-xl border-[3px] border-black px-3">
     <Search size={17} strokeWidth={3} />
     <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a widget..." className="min-w-0 flex-1 bg-transparent py-3 text-sm font-black outline-none" />
    </label>
    <div className="mt-3 max-h-[420px] overflow-auto rounded-xl border-[3px] border-black">
     {filtered.map((widget) => (
      <button key={widget.id} onClick={() => setSelectedId(widget.id)} className={`block w-full border-b-2 border-black p-3 text-left last:border-b-0 ${selected?.id === widget.id ? "bg-[#FF8AAF]" : "bg-white hover:bg-[#F3F4F6]"}`}>
       <strong className="block text-sm font-black uppercase">{widget.title}</strong>
       <span className="mt-1 block text-[10px] font-black uppercase text-black/45">{widget.category} · {widget.releaseTier}</span>
      </button>
     ))}
    </div>
   </div>
   <WidgetDetail widget={selected} />
  </div>
 )
}

const WidgetDetail: React.FC<{ widget: GuideWidgetDefinition | null }> = ({ widget }) => {
 if (!widget) return <div className="rounded-2xl border-[4px] border-black bg-[#F3F4F6] p-5 font-black">No matching widget.</div>
 return (
  <article className="min-w-0 overflow-hidden rounded-2xl border-[4px] border-black bg-[#FF8AAF] p-5 shadow-[6px_6px_0_0_#000]">
   <div className="flex items-start justify-between gap-4">
    <Boxes size={30} strokeWidth={3} />
    <span className="rounded-lg border-[3px] border-black bg-white px-2 py-1 text-[10px] font-black uppercase">{widget.id}</span>
   </div>
   <h3 className="mt-8 break-words text-2xl font-black uppercase leading-none sm:text-3xl">{widget.title}</h3>
   <p className="mt-2 text-sm font-black uppercase tracking-wide">{widget.subtitle}</p>
   <p className="mt-4 text-base font-bold leading-relaxed">{widget.detailedDescription}</p>
   <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2">
    <Detail label="Category" value={widget.category} />
    <Detail label="Status" value={widget.status} />
    <Detail label="Release tier" value={widget.releaseTier} />
    <Detail label="Default visibility" value={widget.defaultVisible ? "Visible" : "Optional / hidden"} />
   </div>
   <div className="mt-3 rounded-xl border-[3px] border-black bg-white p-4">
    <p className="text-[10px] font-black uppercase tracking-wide text-black/45">Dependencies</p>
    <div className="mt-2 flex flex-wrap gap-2">
     {widget.dependency.map((dependency) => <span key={dependency} className="max-w-full break-all rounded-lg border-2 border-black bg-[#F3F4F6] px-2 py-1 text-[10px] font-black uppercase">{dependency}</span>)}
    </div>
   </div>
  </article>
 )
}

const Detail = ({ label, value }: { label: string; value: string }) => (
 <div className="min-w-0 rounded-xl border-[3px] border-black bg-white p-3">
  <p className="text-[10px] font-black uppercase tracking-wide text-black/45">{label}</p>
  <p className="mt-1 text-sm font-black">{value}</p>
 </div>
)
