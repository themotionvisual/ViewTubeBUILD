import React, { useMemo, useState } from "react"
import { BookOpen, Search } from "lucide-react"
import { GUIDE_METRICS, guideMetricById, guideMetricRelationship, type GuideMetricDefinition } from "../../content/guide-v2"
import { getToolboxPaletteColors } from "../../styles/toolboxPalette"

const metricPalette = getToolboxPaletteColors(2)

export const GuideMetricExplorer: React.FC = () => {
 const [query, setQuery] = useState("")
 const [selectedId, setSelectedId] = useState(GUIDE_METRICS[0]?.id || "")
 const filtered = useMemo(() => {
  const needle = query.trim().toLowerCase()
  if (!needle) return GUIDE_METRICS
  return GUIDE_METRICS.filter((metric) =>
   `${metric.label} ${metric.definition} ${metric.source} ${metric.aliases?.join(" ") || ""}`
    .toLowerCase()
    .includes(needle),
  )
 }, [query])
 const selected = GUIDE_METRICS.find((metric) => metric.id === selectedId) || filtered[0] || null

 return (
  <div className="grid min-w-0 gap-3 lg:grid-cols-[.85fr_1.15fr]">
   <div className="min-w-0 rounded-[14px] border-[4px] border-black bg-white p-3 shadow-[4px_4px_0_0_#000]">
    <div className="flex items-center justify-between gap-3">
     <div>
      <p className="text-[10px] font-black uppercase tracking-[.18em] text-black/45">Reference registry</p>
      <h3 className="text-xl font-black uppercase">Metric explorer</h3>
     </div>
     <span className="rounded-md border-[3px] border-black px-2.5 py-1.5 text-sm font-black" style={{ backgroundColor: metricPalette.header }}>{GUIDE_METRICS.length}</span>
    </div>
    <label className="mt-2 flex items-center gap-2 rounded-lg border-[3px] border-black px-3">
     <Search size={17} strokeWidth={3} />
     <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a metric..." className="min-w-0 flex-1 bg-transparent py-2 text-sm font-black outline-none" />
    </label>
    <div className="mt-2 max-h-[320px] overflow-auto rounded-lg border-[3px] border-black">
     {filtered.map((metric) => (
      <button key={metric.id} onClick={() => setSelectedId(metric.id)} className={`block w-full border-b-2 border-black p-2.5 text-left last:border-b-0 ${selected?.id === metric.id ? "bg-[#FFA85C]" : "bg-white hover:bg-[#F3F4F6]"}`}>
       <strong className="block text-sm font-black uppercase">{metric.label}</strong>
       <span className="mt-1 block text-[10px] font-black uppercase text-black/45">{metric.format} · {metric.source}</span>
      </button>
     ))}
    </div>
   </div>
   <MetricDetail metric={selected} />
  </div>
 )
}

const MetricDetail: React.FC<{ metric: GuideMetricDefinition | null }> = ({ metric }) => {
 if (!metric) return <div className="rounded-2xl border-[4px] border-black bg-[#F3F4F6] p-5 font-black">No matching metric.</div>
 const relationship = guideMetricRelationship(metric)
 return (
  <article className="min-w-0 overflow-hidden rounded-[14px] border-[4px] border-black p-3 shadow-[4px_4px_0_0_#000]" style={{ backgroundColor: metricPalette.header }}>
   <span className="flex size-10 items-center justify-center rounded-lg border-[3px] border-black text-black" style={{ backgroundColor: metricPalette.icon }}><BookOpen size={21} strokeWidth={3} /></span>
   <h3 className="mt-3 break-words text-2xl font-black uppercase leading-none">{metric.label}</h3>
   <p className="mt-2 text-sm font-bold leading-snug">{metric.definition}</p>
   {metric.interpretation ? (
    <div className="mt-3 rounded-lg border-[3px] border-black bg-[#FFF7A8] p-3">
     <p className="text-[10px] font-black uppercase tracking-wide text-black/45">How to use it</p>
     <p className="mt-2 text-sm font-bold leading-relaxed">{metric.interpretation}</p>
    </div>
   ) : null}
   {metric.caution ? (
    <div className="mt-2 rounded-lg border-[3px] border-black bg-white p-3">
     <p className="text-[10px] font-black uppercase tracking-wide text-black/45">Do not misread it</p>
     <p className="mt-2 text-sm font-bold leading-relaxed">{metric.caution}</p>
    </div>
   ) : null}
   <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
    <Detail label="Format" value={metric.format} />
    <Detail label="Source" value={metric.source} />
   </div>
   {relationship ? (
    <div className="mt-2 rounded-lg border-[3px] border-black bg-[#CFF7E8] p-3">
     <p className="text-[10px] font-black uppercase tracking-wide text-black/45">Pair this metric with</p>
     <div className="mt-2 flex flex-wrap gap-2">
      {relationship.pairWith.map((metricId) => {
       const related = guideMetricById(metricId)
       return <span key={metricId} className="rounded-lg border-2 border-black bg-white px-2 py-1 text-[10px] font-black uppercase">{related?.label || metricId}</span>
      })}
     </div>
     <p className="mt-3 text-sm font-bold leading-relaxed">{relationship.why}</p>
    </div>
   ) : null}
   {metric.aliases?.length ? (
    <div className="mt-2 rounded-lg border-[3px] border-black bg-white p-3">
     <p className="text-[10px] font-black uppercase tracking-wide text-black/45">Also called</p>
     <div className="mt-2 flex flex-wrap gap-2">
      {metric.aliases.map((alias) => <span key={alias} className="max-w-full break-all rounded-lg border-2 border-black bg-[#F3F4F6] px-2 py-1 text-[10px] font-black uppercase">{alias}</span>)}
     </div>
    </div>
   ) : null}
  </article>
 )
}

const Detail = ({ label, value }: { label: string; value: string }) => (
 <div className="min-w-0 rounded-lg border-[3px] border-black bg-white p-2.5">
  <p className="text-[10px] font-black uppercase tracking-wide text-black/45">{label}</p>
  <p className="mt-1 text-sm font-black">{value}</p>
 </div>
)
