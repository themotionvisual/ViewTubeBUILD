import React, { useMemo, useState } from "react"
import { Database, Search, TableProperties } from "lucide-react"
import { GUIDE_DATASETS, type GuideDatasetDefinition } from "../../content/guide-v2"
import { getToolboxPaletteColors } from "../../styles/toolboxPalette"

const datasetPalette = getToolboxPaletteColors(7)

export const GuideDatasetExplorer: React.FC = () => {
 const [query, setQuery] = useState("")
 const [selectedId, setSelectedId] = useState<string>(GUIDE_DATASETS[0]?.id || "")

 const filtered = useMemo(() => {
  const needle = query.trim().toLowerCase()
  if (!needle) return GUIDE_DATASETS
  return GUIDE_DATASETS.filter((dataset) =>
   `${dataset.label} ${dataset.description} ${dataset.categoryIds.join(" ")} ${dataset.id} ${dataset.canonicalDatasetId} ${dataset.syncUnitId || ""}`
    .toLowerCase()
    .includes(needle),
  )
 }, [query])

 const selected = GUIDE_DATASETS.find((dataset) => dataset.id === selectedId) || filtered[0] || null

 return (
  <div className="grid min-w-0 gap-3 lg:grid-cols-[.9fr_1.1fr]">
   <div className="min-w-0 rounded-[14px] border-[4px] border-black bg-white p-3 shadow-[4px_4px_0_0_#000]">
    <div className="flex items-center justify-between gap-3">
     <div>
      <p className="text-[10px] font-black uppercase tracking-[.18em] text-black/45">Canonical VT-SYNC registry</p>
      <h3 className="text-xl font-black uppercase">Dataset explorer</h3>
     </div>
     <span className="rounded-md border-[3px] border-black px-2.5 py-1.5 text-sm font-black" style={{ backgroundColor: datasetPalette.header }}>{GUIDE_DATASETS.length}</span>
    </div>
    <label className="mt-2 flex items-center gap-2 rounded-lg border-[3px] border-black px-3">
     <Search size={17} strokeWidth={3} />
     <input
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder="Find a dataset..."
      className="min-w-0 flex-1 bg-transparent py-2 text-sm font-black outline-none"
     />
    </label>
    <div className="mt-2 max-h-[360px] overflow-auto rounded-lg border-[3px] border-black">
     {filtered.map((dataset) => (
      <button
       key={dataset.id}
       onClick={() => setSelectedId(dataset.id)}
       className={`block w-full border-b-2 border-black p-2.5 text-left last:border-b-0 ${selected?.id === dataset.id ? "bg-[#36E0F6]" : "bg-white hover:bg-[#F3F4F6]"}`}
      >
       <strong className="block text-sm font-black uppercase">{dataset.label}</strong>
       <span className="mt-1 block truncate text-[11px] font-bold text-black/55">{dataset.description}</span>
      </button>
     ))}
    </div>
   </div>

   <DatasetDetail dataset={selected} />
  </div>
 )
}

const DatasetDetail: React.FC<{ dataset: GuideDatasetDefinition | null }> = ({ dataset }) => {
 if (!dataset) {
  return <div className="rounded-2xl border-[4px] border-black bg-[#F3F4F6] p-5 font-black">No matching dataset.</div>
 }

 return (
  <article className="min-w-0 overflow-hidden rounded-[14px] border-[4px] border-black p-3 shadow-[4px_4px_0_0_#000]" style={{ backgroundColor: datasetPalette.header }}>
   <div className="flex items-start justify-between gap-4">
    <span className="flex size-10 items-center justify-center rounded-lg border-[3px] border-black text-black" style={{ backgroundColor: datasetPalette.icon }}><Database size={21} strokeWidth={3} /></span>
    <span className="rounded-lg border-[3px] border-black bg-white px-2 py-1 text-[10px] font-black uppercase">{dataset.id}</span>
   </div>
   <h3 className="mt-3 break-words text-2xl font-black uppercase leading-none">{dataset.label}</h3>
   <p className="mt-2 text-sm font-bold leading-snug">{dataset.description}</p>

   <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
    <DetailCell label="Table registry ID" value={dataset.id} />
    <DetailCell label="Canonical dataset ID" value={dataset.canonicalDatasetId} />
    <DetailCell label="Sync unit" value={dataset.syncUnitId || "Shared / registry-owned"} />
    <DetailCell label="Export" value={dataset.exportName} />
    <DetailCell label="Columns" value={String(dataset.columnCount)} />
    <DetailCell label="Metric columns" value={String(dataset.metricColumnCount)} />
   </div>

   <div className="mt-2 rounded-lg border-[3px] border-black bg-white p-3">
    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide"><TableProperties size={16} strokeWidth={3} /> Categories</div>
    <div className="mt-3 flex flex-wrap gap-2">
     {dataset.categoryIds.map((category) => (
      <span key={category} className="max-w-full break-all rounded-lg border-2 border-black bg-[#F3F4F6] px-2 py-1 text-[10px] font-black uppercase">{category}</span>
     ))}
    </div>
   </div>

   <div className="mt-2 rounded-lg border-[3px] border-black bg-white p-3">
    <p className="text-xs font-black uppercase tracking-wide">Why this stays accurate</p>
    <p className="mt-2 text-sm font-bold text-black/65">This entry is generated directly from the visible VT-SYNC table definition. Table ownership, export identity, category membership, and column counts therefore come from the same contract the Analytics interface uses.</p>
   </div>
  </article>
 )
}

const DetailCell = ({ label, value }: { label: string; value: string }) => (
 <div className="min-w-0 rounded-lg border-[3px] border-black bg-white p-2.5">
  <p className="text-[10px] font-black uppercase tracking-wide text-black/45">{label}</p>
  <p className="mt-1 break-all text-sm font-black">{value}</p>
 </div>
)
