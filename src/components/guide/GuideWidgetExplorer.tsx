import React, { useMemo, useState } from "react"
import { BookOpenText, Boxes, Eye, Search, SlidersHorizontal, Sparkles } from "lucide-react"
import {
 GUIDE_WIDGETS,
 guideWidgetTeaching,
 type GuideWidgetDefinition,
} from "../../content/guide-v2"
import { getToolboxPaletteColors } from "../../styles/toolboxPalette"

const widgetPalette = getToolboxPaletteColors(0)

const CATEGORY_OPTIONS = ["all", "core", "analytics", "ai", "community", "creation", "system"] as const

export const GuideWidgetExplorer: React.FC = () => {
 const [query, setQuery] = useState("")
 const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>("all")
 const [selectedId, setSelectedId] = useState(GUIDE_WIDGETS[0]?.id || "")

 const filtered = useMemo(() => {
  const needle = query.trim().toLowerCase()
  return GUIDE_WIDGETS.filter((widget) => {
   if (category !== "all" && widget.category !== category) return false
   if (!needle) return true
   return `${widget.title} ${widget.subtitle} ${widget.category} ${widget.status} ${widget.releaseTier} ${widget.shortDescription} ${widget.detailedDescription} ${widget.dependency.join(" ")}`
    .toLowerCase()
    .includes(needle)
  })
 }, [category, query])

 const selected = GUIDE_WIDGETS.find((widget) => widget.id === selectedId) || filtered[0] || null

 return (
  <div className="grid min-w-0 gap-3 lg:grid-cols-[.82fr_1.18fr]">
   <div className="min-w-0 rounded-[14px] border-[4px] border-black bg-white p-3 shadow-[4px_4px_0_0_#000]">
    <div className="flex items-center justify-between gap-3">
     <div>
      <p className="text-[10px] font-black uppercase tracking-[.18em] text-black/45">Dashboard registry</p>
      <h3 className="text-xl font-black uppercase">Widget encyclopedia</h3>
     </div>
     <span className="rounded-md border-[3px] border-black px-2.5 py-1.5 text-sm font-black" style={{ backgroundColor: widgetPalette.header }}>{GUIDE_WIDGETS.length}</span>
    </div>

    <label className="mt-2 flex min-w-0 items-center gap-2 rounded-lg border-[3px] border-black px-3">
     <Search size={17} strokeWidth={3} />
     <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a widget..." className="w-0 min-w-0 flex-1 bg-transparent py-2 text-sm font-black outline-none" />
    </label>

    <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
     {CATEGORY_OPTIONS.map((option) => (
      <button
       key={option}
       type="button"
       onClick={() => setCategory(option)}
       className={`shrink-0 rounded-lg border-2 border-black px-2 py-1 text-[10px] font-black uppercase ${category === option ? "bg-[#CCFF00]" : "bg-white"}`}
      >
       {option}
      </button>
     ))}
    </div>

    <div className="mt-2 max-h-[500px] overflow-auto rounded-lg border-[3px] border-black">
     {filtered.map((widget) => (
      <button key={widget.id} onClick={() => setSelectedId(widget.id)} className={`block w-full border-b-2 border-black p-2.5 text-left last:border-b-0 ${selected?.id === widget.id ? "bg-[#FA618A]" : "bg-white hover:bg-[#F3F4F6]"}`}>
       <strong className="block text-sm font-black uppercase">{widget.title}</strong>
       <span className="mt-1 block text-[10px] font-black uppercase text-black/45">{widget.category} · {widget.releaseTier} · {widget.defaultSize}/{widget.defaultHeight}</span>
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

 const teaching = guideWidgetTeaching(widget)

 return (
  <article className="min-w-0 overflow-hidden rounded-[14px] border-[4px] border-black p-3 shadow-[4px_4px_0_0_#000]" style={{ backgroundColor: widgetPalette.header }}>
   <div className="flex items-start justify-between gap-4">
    <span className="flex size-10 items-center justify-center rounded-lg border-[3px] border-black text-black" style={{ backgroundColor: widgetPalette.icon }}><Boxes size={21} strokeWidth={3} /></span>
    <div className="flex flex-wrap justify-end gap-2">
     <span className="rounded-lg border-[3px] border-black bg-white px-2 py-1 text-[10px] font-black uppercase">{widget.category}</span>
     <span className="rounded-lg border-[3px] border-black bg-[#CCFF00] px-2 py-1 text-[10px] font-black uppercase">{widget.releaseTier}</span>
    </div>
   </div>

   <h3 className="mt-3 break-words text-2xl font-black uppercase leading-none">{widget.title}</h3>
   <p className="mt-2 text-sm font-black uppercase tracking-wide">{widget.subtitle}</p>
   <p className="mt-2 text-sm font-bold leading-snug">{widget.detailedDescription}</p>

   <TeachingBlock icon={Eye} title="What it shows" tone="bg-white">
    <p className="text-sm font-bold leading-relaxed">{teaching.whatItShows}</p>
   </TeachingBlock>

   <TeachingList icon={BookOpenText} title="How to read it" items={teaching.howToRead} tone="bg-[#FFF7A8]" />
   <TeachingList icon={Sparkles} title="Patterns to notice" items={teaching.patterns} tone="bg-[#CFF7E8]" />
   <TeachingList icon={SlidersHorizontal} title="Controls" items={teaching.controls} tone="bg-[#DDEBFF]" />

   <div className="mt-2 grid min-w-0 gap-2 sm:grid-cols-2">
    <Detail label="Default footprint" value={`${widget.defaultSize} · ${widget.defaultHeight}`} />
    <Detail label="Responsive mode" value={widget.responsiveMode} />
    <Detail label="Status" value={widget.status} />
    <Detail label="Default visibility" value={widget.defaultVisible ? "Visible" : "Optional / hidden"} />
   </div>

   <div className="mt-2 rounded-lg border-[3px] border-black bg-white p-3">
    <p className="text-[10px] font-black uppercase tracking-wide text-black/45">Available layout sizes</p>
    <p className="mt-1 break-words text-sm font-black">{widget.supportedSizes.join(" · ")}</p>
    <p className="mt-3 text-[10px] font-black uppercase tracking-wide text-black/45">Available heights</p>
    <p className="mt-1 break-words text-sm font-black">{widget.supportedHeights.join(" · ")}</p>
   </div>

   <div className="mt-2 rounded-lg border-[3px] border-black bg-white p-3">
    <p className="text-[10px] font-black uppercase tracking-wide text-black/45">Data / service dependencies</p>
    <div className="mt-2 flex flex-wrap gap-2">
     {widget.dependency.map((dependency) => <span key={dependency} className="max-w-full break-all rounded-lg border-2 border-black bg-[#F3F4F6] px-2 py-1 text-[10px] font-black uppercase">{dependency}</span>)}
    </div>
    <p className="mt-3 text-[11px] font-bold text-black/55">Renderer: {widget.rendererKey}</p>
   </div>
  </article>
 )
}

const TeachingBlock = ({ icon: Icon, title, tone, children }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; title: string; tone: string; children: React.ReactNode }) => (
 <section className={`mt-3 rounded-lg border-[3px] border-black p-3 ${tone}`}>
  <div className="flex items-center gap-2"><Icon size={17} strokeWidth={3} /><h4 className="text-xs font-black uppercase tracking-wide">{title}</h4></div>
  <div className="mt-2">{children}</div>
 </section>
)

const TeachingList = ({ icon, title, items, tone }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; title: string; items: readonly string[]; tone: string }) => (
 <TeachingBlock icon={icon} title={title} tone={tone}>
  <ul className="space-y-1.5">
   {items.map((item) => <li key={item} className="flex gap-2 text-sm font-bold leading-snug"><span aria-hidden="true">•</span><span>{item}</span></li>)}
  </ul>
 </TeachingBlock>
)

const Detail = ({ label, value }: { label: string; value: string }) => (
 <div className="min-w-0 rounded-lg border-[3px] border-black bg-white p-2.5">
  <p className="text-[10px] font-black uppercase tracking-wide text-black/45">{label}</p>
  <p className="mt-1 break-words text-sm font-black">{value}</p>
 </div>
)
