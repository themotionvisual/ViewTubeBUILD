import React, { useState } from "react"
import { listEvaluationRecords, listWorkflowCandidates, reviewWorkflowCandidate } from "../services/viewTubeEvaluationLedger"
import { getWorkflowLearningSummary } from "../services/viewTubeWorkflowLearning"

export const ViewTubeLearningLedger: React.FC = () => {
 const [, refresh] = useState(0); const summary = getWorkflowLearningSummary(); const evaluations = listEvaluationRecords(); const candidates = listWorkflowCandidates()
 return <section className="rounded-2xl border-[4px] border-black bg-white p-5 shadow-[8px_8px_0_#000]">
  <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><div className="text-[9px] font-black uppercase tracking-[.2em] opacity-50">Evidence → recommendation → action → outcome → candidate</div><h3 className="text-2xl font-[1000] uppercase">Learning Ledger</h3></div><div className="rounded-lg border-[3px] border-black bg-[#FFE357] px-3 py-2 text-[10px] font-black uppercase">{summary.signals} signals · {evaluations.length} evaluations · {candidates.length} candidates</div></div>
  {candidates.length === 0 ? <div className="rounded-xl border-2 border-dashed border-black p-5 text-xs font-bold opacity-50">No workflow candidates yet. Repeated successful tool chains can be proposed here for explicit creator review.</div> : candidates.map((candidate) => <article key={candidate.id} className="mb-3 rounded-xl border-[3px] border-black bg-[#F5F5F5] p-4"><div className="flex flex-wrap justify-between gap-3"><div><div className="text-[9px] font-black uppercase opacity-40">{candidate.scope} · {candidate.status}</div><div className="text-sm font-[1000] uppercase">{candidate.title}</div><div className="mt-1 text-[10px] font-bold opacity-60">{candidate.toolIds.join(" → ")}</div><div className="mt-1 text-[10px] font-bold">{candidate.reason}</div></div>{candidate.status === "candidate" && <div className="flex gap-2"><button onClick={() => { reviewWorkflowCandidate(candidate.id,"approved"); refresh((n)=>n+1) }} className="rounded-lg border-2 border-black bg-[#B7F52A] px-3 py-2 text-[9px] font-black uppercase">Approve</button><button onClick={() => { reviewWorkflowCandidate(candidate.id,"rejected"); refresh((n)=>n+1) }} className="rounded-lg border-2 border-black bg-[#FA618A] px-3 py-2 text-[9px] font-black uppercase">Reject</button></div>}</div></article>)}
 </section>
}

export default ViewTubeLearningLedger
