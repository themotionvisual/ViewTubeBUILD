import React, { useMemo, useState } from "react"
import { BarChart3, Search } from "lucide-react"
import {
 GUIDE_ANALYTICS_VISUALS,
 GUIDE_DATASETS,
 guideMetricById,
 guideVisualEncodingById,
 type GuideAnalyticsVisualDefinition,
} from "../../content/guide-v2"
import { getToolboxPaletteColors } from "../../styles/toolboxPalette"

const visualPalette = getToolboxPaletteColors(4)

export const GuideAnalyticsVisualExplorer: React.FC = () => {
 const [query, setQuery] = useState("")
 const [selectedId, setSelectedId] = useState(GUIDE_ANALYTICS_VISUALS[0]?.id || "")
 const filtered = useMemo(() => {
  const q = query.trim().toLowerCase()
  if (!q) return GUIDE_ANALYTICS_VISUALS
  return GUIDE_ANALYTICS_VISUALS.filter((v) =>
   `${v.title} ${v.family} ${v.exportName} ${v.metricIds.join(" ")} ${v.dataConcepts.join(" ")}`.toLowerCase().includes(q),
  )
 }, [query])
 const selected = GUIDE_ANALYTICS_VISUALS.find((v) => v.id === selectedId) || filtered[0] || null
 return <div className="grid min-w-0 gap-3 lg:grid-cols-[.8fr_1.2fr]">
  <div className="min-w-0 rounded-[14px] border-[4px] border-black bg-white p-3 shadow-[4px_4px_0_0_#000]">
   <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-black/45">Analytics source catalog</p><h3 className="text-xl font-black uppercase">Visual encyclopedia</h3></div><span className="rounded-md border-[3px] border-black px-2.5 py-1.5 text-sm font-black" style={{backgroundColor:visualPalette.header}}>{GUIDE_ANALYTICS_VISUALS.length}</span></div>
   <label className="mt-2 flex min-w-0 items-center gap-2 rounded-lg border-[3px] border-black px-3"><Search size={17} strokeWidth={3}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Find a visual..." className="w-0 min-w-0 flex-1 bg-transparent py-2 text-sm font-black outline-none"/></label>
   <div className="mt-2 max-h-[520px] overflow-auto rounded-lg border-[3px] border-black">
    {filtered.map((v)=><button key={v.id} onClick={()=>setSelectedId(v.id)} className={`block w-full border-b-2 border-black p-2.5 text-left last:border-b-0 ${selected?.id===v.id?"bg-[#C0F240]":"bg-white hover:bg-[#F3F4F6]"}`}><strong className="block text-sm font-black uppercase">{v.title}</strong><span className="mt-1 block text-[10px] font-black uppercase text-black/45">{v.family} · {v.status}</span></button>)}
   </div>
  </div>
  <VisualDetail visual={selected}/>
 </div>
}

const VisualDetail:React.FC<{visual:GuideAnalyticsVisualDefinition|null}>=({visual})=>{
 if(!visual)return <div className="rounded-2xl border-[4px] border-black bg-[#F3F4F6] p-5 font-black">No matching visual.</div>
 const encoding = guideVisualEncodingById(visual.id)
 const matchedDatasets = encoding
  ? GUIDE_DATASETS.filter((dataset) => {
     const haystack = `${dataset.id} ${dataset.label} ${dataset.description} ${dataset.categoryIds.join(" ")}`.toLowerCase()
     return encoding.datasetSearchTerms.some((term) => haystack.includes(term.toLowerCase()))
    }).slice(0, 8)
  : []
 return <article className="min-w-0 overflow-hidden rounded-[14px] border-[4px] border-black p-3 shadow-[4px_4px_0_0_#000]" style={{backgroundColor:visualPalette.header}}>
  <div className="flex items-start justify-between gap-4"><span className="flex size-10 items-center justify-center rounded-lg border-[3px] border-black text-black" style={{backgroundColor:visualPalette.icon}}><BarChart3 size={21} strokeWidth={3}/></span><span className="rounded-lg border-[3px] border-black bg-white px-2 py-1 text-[10px] font-black uppercase">{visual.status}</span></div>
  <h3 className="mt-3 break-words text-2xl font-black uppercase leading-none">{visual.title}</h3>
  <p className="mt-2 text-[11px] font-black uppercase tracking-wide text-black/50">{visual.family} · {visual.exportName}</p>
  <Section title="How to read it" tone="bg-white"><p>{visual.read}</p></Section>
  <Section title="Metrics" tone="bg-[#FFF7A8]"><div className="flex flex-wrap gap-2">{visual.metricIds.map(id=><span key={id} className="rounded-lg border-2 border-black bg-white px-2 py-1 text-[10px] font-black uppercase">{guideMetricById(id)?.label||id}</span>)}</div></Section>
  <Section title="Data concepts" tone="bg-[#DDEBFF]"><Chips items={visual.dataConcepts}/></Section>
  {encoding ? <Section title="Visual encoding" tone="bg-[#E7DAFF]"><List items={encoding.encodings}/></Section> : null}
  {encoding ? <Section title="Data provenance" tone="bg-[#D7FFF2]"><p>{encoding.provenance}</p>{matchedDatasets.length ? <div className="mt-3 flex flex-wrap gap-2">{matchedDatasets.map(dataset=><span key={dataset.id} className="max-w-full break-words rounded-lg border-2 border-black bg-white px-2 py-1 text-[10px] font-black uppercase">{dataset.label}</span>)}</div> : null}</Section> : null}
  <Section title="Controls" tone="bg-[#FFD7E4]"><List items={visual.controls}/></Section>
  <Section title="Patterns to notice" tone="bg-[#CFF7E8]"><List items={visual.patterns}/></Section>
  <Section title="Compare with" tone="bg-white"><div className="flex flex-wrap gap-2">{visual.compareWith.map(id=><span key={id} className="rounded-lg border-2 border-black bg-[#F3F4F6] px-2 py-1 text-[10px] font-black uppercase">{GUIDE_ANALYTICS_VISUALS.find(v=>v.id===id)?.title||id}</span>)}</div></Section>
 </article>
}
const Section=({title,tone,children}:{title:string;tone:string;children:React.ReactNode})=><section className={`mt-3 rounded-lg border-[3px] border-black p-3 text-sm font-bold leading-snug ${tone}`}><h4 className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-black/45">{title}</h4>{children}</section>
const List=({items}:{items:readonly string[]})=><ul className="space-y-1.5">{items.map(x=><li key={x} className="flex gap-2"><span>•</span><span>{x}</span></li>)}</ul>
const Chips=({items}:{items:readonly string[]})=><div className="flex flex-wrap gap-2">{items.map(x=><span key={x} className="max-w-full break-words rounded-lg border-2 border-black bg-white px-2 py-1 text-[10px] font-black uppercase">{x}</span>)}</div>
