import React, { useMemo } from "react"
import { Activity, CheckCircle2, GitBranch, Target, X } from "lucide-react"
import { buildAlgorithmAttributionDetail } from "../../services/brain/AlgorithmAttributionDetail"

const stageTone: Record<string, string> = { signal: "#36E0F6", decision: "#FFDA47", execution: "#FF9B54", monitoring: "#C7A6FF", outcome: "#3FEE56", learning: "#FF7AC8" }
const pct = (value: number | null | undefined) => value == null ? "—" : `${Math.round(value * 100)}%`

export const BrainAttributionDetailPanel: React.FC<{ channelId: string; eventId: string; onClose?: () => void }> = ({ channelId, eventId, onClose }) => {
 const detail = useMemo(() => buildAlgorithmAttributionDetail({ channelId, eventId }), [channelId, eventId])
 if (!detail) return null
 const latestOutcome = detail.outcomeEvents.at(-1)
 const evaluation = latestOutcome?.metadata?.evaluation as { status?: string; explanation?: string } | undefined
 return (
  <section className="overflow-hidden rounded-[10px] border-[2px] border-black bg-white" aria-label="Algorithm attribution detail">
   <div className="flex items-start gap-2 border-b-[2px] border-black bg-[#36E0F6] px-3 py-2">
    <GitBranch size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
    <div className="min-w-0 flex-1">
     <h3 className="text-[10px] font-[1000] uppercase tracking-[0.08em]">Attribution Trace</h3>
     <p className="mt-0.5 line-clamp-2 text-[9px] font-bold leading-3 text-black/65">{detail.root.title}</p>
    </div>
    {onClose ? <button type="button" onClick={onClose} className="grid h-7 w-7 shrink-0 place-items-center rounded-[6px] border-[2px] border-black bg-white hover:bg-[#FF6B6B]" aria-label="Close attribution detail"><X size={12} /></button> : null}
   </div>
   <div className="grid grid-cols-4 border-b-[2px] border-black">
    {[ [detail.counts.evidenceRefs, "Evidence"], [detail.counts.checkpointsReached, "Checks"], [detail.counts.measuredOutcomes, "Outcomes"], [detail.counts.learningEvents, "Learning"] ].map(([value, label], index) => (
     <div key={String(label)} className={`${index < 3 ? "border-r-[2px] border-black" : ""} p-2 text-center`}><div className="text-[14px] font-[1000]">{value}</div><div className="text-[7px] font-black uppercase text-black/50">{label}</div></div>
    ))}
   </div>
   <div className="grid gap-2 p-2">
    <div className="grid grid-cols-2 gap-1.5">
     <div className="rounded-[7px] border-[2px] border-black bg-[#f7f7f4] p-2"><div className="mb-1 flex items-center gap-1 text-[8px] font-black uppercase"><Target size={10} /> Current result</div><div className="text-[11px] font-[1000] uppercase">{evaluation?.status || "Not measured"}</div>{evaluation?.explanation ? <p className="mt-1 line-clamp-3 text-[8px] font-bold leading-3 text-black/55">{evaluation.explanation}</p> : null}</div>
     <div className="rounded-[7px] border-[2px] border-black bg-[#f7f7f4] p-2"><div className="mb-1 flex items-center gap-1 text-[8px] font-black uppercase"><Activity size={10} /> Calibration</div><div className="text-[11px] font-[1000]">{pct(detail.calibration.command?.successRate ?? detail.calibration.confidenceBucket?.successRate)}</div><p className="mt-1 text-[8px] font-bold leading-3 text-black/55">{detail.command || detail.root.confidence} historical measured success</p></div>
    </div>
    {detail.monitoringSchedule ? <div className="rounded-[7px] border-[2px] border-black bg-white p-2"><div className="mb-1.5 text-[8px] font-black uppercase tracking-[0.08em]">Monitoring schedule</div><div className="flex flex-wrap gap-1">{detail.monitoringSchedule.checkpoints.map((checkpoint) => { const reached = detail.checkpointEvents.some((event) => event.metadata?.monitoringCheckpointId === checkpoint.id); return <span key={checkpoint.id} className={`inline-flex items-center gap-1 rounded-[5px] border-[2px] border-black px-1.5 py-0.5 text-[7px] font-black uppercase ${reached ? "bg-[#3FEE56]" : "bg-white"}`}>{reached ? <CheckCircle2 size={8} /> : null}{checkpoint.label}{checkpoint.role === "final_evaluation" ? " final" : ""}</span> })}</div></div> : null}
    <div className="rounded-[7px] border-[2px] border-black bg-white p-2"><div className="mb-1.5 text-[8px] font-black uppercase tracking-[0.08em]">Evidence → decision → outcome</div><div className="grid gap-1">{detail.timeline.map((item) => <div key={item.id} className="flex items-start gap-1.5 rounded-[6px] border-[1.5px] border-black px-2 py-1.5" style={{ backgroundColor: stageTone[item.stage] || "#fff" }}><span className="mt-[1px] rounded-[4px] border border-black bg-white/75 px-1 py-0.5 text-[6px] font-black uppercase">{item.stage}</span><div className="min-w-0 flex-1"><div className="truncate text-[8px] font-[1000] uppercase">{item.title}</div><div className="line-clamp-2 text-[8px] font-bold leading-3 text-black/60">{item.summary}</div></div>{item.status ? <span className="shrink-0 text-[7px] font-black uppercase">{item.status}</span> : null}</div>)}</div></div>
    {detail.calibration.warnings.length ? <div className="rounded-[7px] border-[2px] border-black bg-[#FFDA47] p-2 text-[8px] font-bold leading-3">{detail.calibration.warnings.slice(0, 2).join(" ")}</div> : null}
   </div>
  </section>
 )
}

export default BrainAttributionDetailPanel
