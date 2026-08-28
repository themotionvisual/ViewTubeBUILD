import React, { useMemo, useState } from "react"
import { BookOpen, Search } from "lucide-react"
import { GUIDE_METRICS, type GuideMetricDefinition } from "../../content/guide-v2"

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
  <div className="grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
   <div className="rounded-2xl border-[4px] border-black bg-white p-4 shadow-[6px_6px_0_0_#000]">
    <div className="flex items-center justify-between gap-3">
     <div>
      <p className="text-[10px] font-black uppercase tracking-[.18em] text-black/45">Reference registry</p>
      <h3 className="text-xl font-black uppercase">Metric explorer</h3>
     </div>
     <span className="rounded-lg border-[3px] border-black bg-[#FFB86B] px-3 py-2 font-black">{GUIDE_METRICS.length}</span>
    </div>
    <label className="mt-3 flex items-center gap-2 rounded-xl border-[3px] border-black px-3">
     <Search size={17} strokeWidth={3} />
     <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a metric..." className="min-w-0 flex-1 bg-transparent py-3 text-sm font-black outline-none" />
    </label>
    <div className="mt-3 max-h-[360px] overflow-auto rounded-xl border-[3px] border-black">
     {filtered.map((metric) => (
      <button key={metric.id} onClick={() => setSelectedId(metric.id)} className={`block w-full border-b-2 border-black p-3 text-left last:border-b-0 ${selected?.id === metric.id ? "bg-[#FFB86B]" : "bg-white hover:bg-[#F3F4F6]"}`}>
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
 return (
  <article className="rounded-2xl border-[4px] border-black bg-[#FFB86B] p-5 shadow-[6px_6px_0_0_#000]">
   <BookOpen size={30} strokeWidth={3} />
   <h3 className="mt-8 text-3xl font-black uppercase leading-none">{metric.label}</h3>
   <p className="mt-3 text-base font-bold leading-relaxed">{metric.definition}</p>
   <div className="mt-6 grid gap-3 sm:grid-cols-2">
    <Detail label="Format" value={metric.format} />
    <Detail label="Source" value={metric.source} />
   </div>
   {metric.aliases?.length ? (
    <div className="mt-3 rounded-xl border-[3px] border-black bg-white p-4">
     <p className="text-[10px] font-black uppercase tracking-wide text-black/45">Also called</p>
     <div className="mt-2 flex flex-wrap gap-2">
      {metric.aliases.map((alias) => <span key={alias} className="rounded-lg border-2 border-black bg-[#F3F4F6] px-2 py-1 text-[10px] font-black uppercase">{alias}</span>)}
     </div>
    </div>
   ) : null}
  </article>
 )
}

const Detail = ({ label, value }: { label: string; value: string }) => (
 <div className="rounded-xl border-[3px] border-black bg-white p-3">
  <p className="text-[10px] font-black uppercase tracking-wide text-black/45">{label}</p>
  <p className="mt-1 text-sm font-black">{value}</p>
 </div>
)
