import React, { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Database, ShieldCheck } from "lucide-react"
import type {
 CanonicalIntelligenceDatasetManifest,
 CanonicalIntelligenceEvidenceBundle,
} from "../../services/analytics-canon"

export type EvidenceGrade = "A" | "B" | "C" | "D" | "BLOCKED"

export const gradeIntelligenceEvidence = (
 evidence: CanonicalIntelligenceEvidenceBundle | null,
 aiConfigured: boolean,
): { grade: EvidenceGrade; score: number; ready: boolean; detail: string } => {
 if (!evidence?.channelId) return { grade: "BLOCKED", score: 0, ready: false, detail: "Channel identity is unresolved." }
 if (!aiConfigured) return { grade: "BLOCKED", score: 0, ready: false, detail: "Gemini is not configured." }
 const represented = evidence.coverage.available + evidence.coverage.partial + evidence.coverage.stale
 if (represented === 0) return { grade: "BLOCKED", score: 0, ready: false, detail: "No usable VT-SYNC datasets are available." }
 const total = Math.max(1, evidence.coverage.total)
 const score = Math.round((
  evidence.coverage.available
  + evidence.coverage.partial * 0.72
  + evidence.coverage.stale * 0.42
 ) / total * 100)
 const grade: EvidenceGrade = score >= 85 ? "A" : score >= 68 ? "B" : score >= 50 ? "C" : "D"
 return {
  grade,
  score,
  ready: true,
  detail: `${represented}/${evidence.coverage.total} datasets can contribute evidence.`,
 }
}

const statusClass = (status: CanonicalIntelligenceDatasetManifest["status"]) => {
 if (status === "available") return "bg-[#CCFF00]"
 if (status === "partial") return "bg-[#FFDD00]"
 if (status === "stale") return "bg-[#FFB158]"
 if (status === "failed") return "bg-[#FF7497]"
 return "bg-white"
}

const EvidenceDatasetDetail: React.FC<{ dataset: CanonicalIntelligenceDatasetManifest }> = ({ dataset }) => {
 const visibleColumns = dataset.columns.slice(0, 6)
 const metrics = Object.entries(dataset.metrics).slice(0, 8)
 return (
  <div className="border-t-[3px] border-black bg-[#f7f5ef] p-4 space-y-4">
   <p className="text-xs font-bold leading-5 text-black/70">{dataset.description}</p>
   <div className="grid gap-2 text-[10px] font-black uppercase sm:grid-cols-2 lg:grid-cols-4">
    <div className="border-2 border-black bg-white p-2">Rows<br/><strong className="text-base">{dataset.rowCount}</strong></div>
    <div className="border-2 border-black bg-white p-2">Updated<br/><strong>{dataset.updatedAt ? new Date(dataset.updatedAt).toLocaleString() : "Unknown"}</strong></div>
    <div className="border-2 border-black bg-white p-2">Sources<br/><strong>{dataset.sources.join(", ")}</strong></div>
    <div className="border-2 border-black bg-white p-2">Evidence refs<br/><strong className="text-base">{dataset.evidenceRefs.length}</strong></div>
   </div>
   {dataset.missingMetrics.length > 0 && (
    <div className="border-2 border-black bg-[#FFE3E8] p-3 text-[10px] font-black uppercase">
     Missing metrics: {dataset.missingMetrics.join(", ")}
    </div>
   )}
   {metrics.length > 0 && (
    <div>
     <h5 className="mb-2 text-[10px] font-black uppercase tracking-[0.14em]">Metric summaries</h5>
     <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([key, metric]) => (
       <div key={key} className="border-2 border-black bg-white p-2 text-[10px] font-bold">
        <strong className="block uppercase">{key}</strong>
        n={metric.count} · avg={metric.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}<br/>
        min={metric.minimum.toLocaleString()} · max={metric.maximum.toLocaleString()}
       </div>
      ))}
     </div>
    </div>
   )}
   {dataset.sampleRows.length > 0 ? (
    <div className="overflow-x-auto border-2 border-black bg-white">
     <table className="w-full min-w-[620px] border-collapse text-[10px]">
      <thead className="bg-black text-white"><tr>
       <th className="p-2 text-left font-black uppercase">Evidence ID</th>
       {visibleColumns.map((column) => <th key={column.key} className="p-2 text-left font-black uppercase">{column.label}</th>)}
      </tr></thead>
      <tbody>{dataset.sampleRows.map((row, rowIndex) => (
       <tr key={dataset.evidenceRefs[rowIndex]} className={rowIndex % 2 ? "bg-black/5" : "bg-white"}>
        <td className="border-t border-black/15 p-2 font-black">{dataset.evidenceRefs[rowIndex]}</td>
        {visibleColumns.map((column) => <td key={column.key} className="max-w-[220px] truncate border-t border-black/15 p-2 font-bold">{String(row[column.key] ?? "—")}</td>)}
       </tr>
      ))}</tbody>
     </table>
    </div>
   ) : <p className="border-2 border-dashed border-black/30 bg-white p-3 text-[10px] font-black uppercase text-black/50">No sample rows are available for this dataset.</p>}
  </div>
 )
}

export const EvidencePreflightPanel: React.FC<{
 evidence: CanonicalIntelligenceEvidenceBundle | null
 aiConfigured: boolean
}> = ({ evidence, aiConfigured }) => {
 const [selectedId, setSelectedId] = useState<string | null>(null)
 const grade = useMemo(() => gradeIntelligenceEvidence(evidence, aiConfigured), [evidence, aiConfigured])
 const counts = evidence?.coverage
 return (
  <section className="mb-6 overflow-hidden rounded-2xl border-[3px] border-black bg-white shadow-[5px_5px_0px_0px_black]">
   <header className="flex flex-col gap-3 border-b-[3px] border-black bg-[#00CCFF] p-4 md:flex-row md:items-center md:justify-between">
    <div className="flex items-center gap-3">
     <ShieldCheck size={24}/>
     <div><h3 className="text-xl font-[1000] uppercase tracking-tight">Evidence Preflight</h3><p className="text-[10px] font-black uppercase tracking-[0.12em] text-black/60">Inspect what the report will actually use before generation</p></div>
    </div>
    <div className={`border-2 border-black px-4 py-2 text-center ${grade.ready ? "bg-[#CCFF00]" : "bg-[#FF7497]"}`}>
     <span className="block text-[9px] font-black uppercase">Evidence grade</span><strong className="text-2xl font-[1000]">{grade.grade}{grade.ready ? ` · ${grade.score}` : ""}</strong>
    </div>
   </header>
   <div className="p-4">
    <p className="mb-3 text-xs font-black uppercase">{grade.detail}</p>
    <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
     {[
      ["Available", counts?.available || 0, "bg-[#CCFF00]"], ["Partial", counts?.partial || 0, "bg-[#FFDD00]"],
      ["Stale", counts?.stale || 0, "bg-[#FFB158]"], ["Failed", counts?.failed || 0, "bg-[#FF7497]"],
      ["Unavailable", counts?.unavailable || 0, "bg-white"],
     ].map(([label, value, color]) => <div key={String(label)} className={`border-2 border-black p-2 ${color}`}><span className="block text-[9px] font-black uppercase">{label}</span><strong className="text-xl font-[1000]">{value}</strong></div>)}
    </div>
    {evidence ? (
     <div className="space-y-2">
      {evidence.datasets.map((dataset) => {
       const open = selectedId === dataset.id
       return <article key={dataset.id} className="overflow-hidden rounded-xl border-[3px] border-black">
        <button type="button" className="flex w-full items-center justify-between gap-3 bg-white p-3 text-left hover:bg-black/5" onClick={() => setSelectedId(open ? null : dataset.id)} aria-expanded={open}>
         <div className="flex min-w-0 items-center gap-3"><Database size={17}/><div className="min-w-0"><strong className="block truncate text-xs font-black uppercase">{dataset.label}</strong><span className="text-[9px] font-bold uppercase text-black/50">{dataset.rowCount} rows · {dataset.sources.join(", ")}</span></div></div>
         <div className="flex items-center gap-2"><span className={`border-2 border-black px-2 py-1 text-[9px] font-black uppercase ${statusClass(dataset.status)}`}>{dataset.status}</span>{open ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</div>
        </button>
        {open && <EvidenceDatasetDetail dataset={dataset}/>} 
       </article>
      })}
     </div>
    ) : <div className="border-2 border-dashed border-black/30 p-5 text-center text-[10px] font-black uppercase text-black/50">Evidence preview is unavailable until Analytics resolves a snapshot.</div>}
   </div>
  </section>
 )
}
