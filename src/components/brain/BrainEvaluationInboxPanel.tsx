import React, { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Clock3, GitBranch, RefreshCw, Sparkles } from "lucide-react"
import { buildBrainEvaluationInbox, type BrainEvaluationInboxItem } from "../../services/brain/BrainEvaluationInbox"
import { ALGORITHM_INTELLIGENCE_EVENT_CHANGED } from "../../services/brain/AlgorithmIntelligenceEventLedger"
import { BRAIN_OUTCOME_EVENT } from "../../services/brain/BrainOutcomeLedger"
import { reviewAlgorithmLearningCandidate } from "../../services/brain/AlgorithmLearningGovernance"
import { captureCanonicalLifecycleObservations } from "../../services/brain/AlgorithmLifecycleObservationStore"
import { resolveDueAlgorithmMonitoringCheckpoints } from "../../services/brain/AlgorithmMonitoringResolver"
import { processResolvableFinalAlgorithmEvaluations } from "../../services/brain/AlgorithmFinalEvaluationResolver"
import { BrainAttributionDetailPanel } from "./BrainAttributionDetailPanel"
import { getVtSyncSnapshot, subscribeToVtSyncSnapshot } from "../../features/vt-sync-local/adapters/snapshot"

const toneFor = (item: BrainEvaluationInboxItem) => {
 if (item.priority === "critical") return "#FF6B6B"
 if (item.priority === "high") return "#FFDA47"
 if (item.kind === "learning_review") return "#FF7AC8"
 if (item.kind === "measured_outcome") return "#3FEE56"
 return "#36E0F6"
}

const iconFor = (item: BrainEvaluationInboxItem) => {
 if (item.kind === "learning_review") return <Sparkles size={13} aria-hidden="true" />
 if (item.kind === "measured_outcome") return <CheckCircle2 size={13} aria-hidden="true" />
 if (item.kind === "overdue_checkpoint") return <Clock3 size={13} aria-hidden="true" />
 return <AlertTriangle size={13} aria-hidden="true" />
}

export const BrainEvaluationInboxPanel: React.FC<{ channelId: string | null; maximumItems?: number; compact?: boolean }> = ({ channelId, maximumItems = 6, compact = false }) => {
 const [revision, setRevision] = useState(0)
 const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

 useEffect(() => {
  if (typeof window === "undefined") return
  const refresh = () => setRevision((value) => value + 1)
  window.addEventListener(ALGORITHM_INTELLIGENCE_EVENT_CHANGED, refresh)
  window.addEventListener(BRAIN_OUTCOME_EVENT, refresh)
  return () => {
   window.removeEventListener(ALGORITHM_INTELLIGENCE_EVENT_CHANGED, refresh)
   window.removeEventListener(BRAIN_OUTCOME_EVENT, refresh)
  }
 }, [])

 useEffect(() => {
  if (!channelId) return
  const capture = () => {
   try {
    const snapshot = getVtSyncSnapshot()
    captureCanonicalLifecycleObservations({ channelId, snapshot })
    resolveDueAlgorithmMonitoringCheckpoints({ channelId })
    processResolvableFinalAlgorithmEvaluations({ channelId, currentSnapshot: snapshot })
    setRevision((value) => value + 1)
   } catch (error) {
    console.warn("[BrainEvaluationInbox] lifecycle/evaluation advancement unavailable:", error)
   }
  }
  capture()
  return subscribeToVtSyncSnapshot(capture)
 }, [channelId])

 const inbox = useMemo(() => channelId ? buildBrainEvaluationInbox({ channelId, maximum: Math.max(20, maximumItems * 4) }) : null, [channelId, maximumItems, revision])
 const items = inbox?.items.slice(0, maximumItems) || []

 const review = (item: BrainEvaluationInboxItem, decision: "hold" | "reject" | "approve_for_profile_review") => {
  if (!channelId || item.kind !== "learning_review") return
  const candidate = item.metadata?.candidate as { id?: string } | undefined
  if (!candidate?.id) return
  reviewAlgorithmLearningCandidate({ channelId, candidateId: candidate.id, decision })
  setRevision((value) => value + 1)
 }

 if (!channelId) return null
 return (
  <div className="grid gap-2">
   <section className="overflow-hidden rounded-[10px] border-[2px] border-black bg-white" aria-label="Brain evaluation inbox">
    <div className="flex items-center justify-between gap-2 border-b-[2px] border-black bg-[#FFDA47] px-3 py-2">
     <div className="min-w-0"><h3 className="text-[10px] font-[1000] uppercase leading-4 tracking-[0.1em]">Evaluation Inbox</h3>{!compact ? <p className="text-[9px] font-bold leading-3 text-black/60">What worked, what is overdue, and what still needs evidence.</p> : null}</div>
     <div className="flex shrink-0 items-center gap-1">{inbox?.counts.critical ? <span className="rounded-[5px] border-[2px] border-black bg-[#FF6B6B] px-1.5 py-0.5 text-[8px] font-[1000] uppercase">{inbox.counts.critical} urgent</span> : null}<button type="button" title="Refresh evaluation inbox" aria-label="Refresh evaluation inbox" onClick={() => setRevision((value) => value + 1)} className="grid h-7 w-7 place-items-center rounded-[6px] border-[2px] border-black bg-white hover:bg-[#36E0F6]"><RefreshCw size={12} /></button></div>
    </div>
    <div className="grid gap-1.5 p-2">
     {!items.length ? <p className="rounded-[7px] border-[2px] border-black/20 bg-[#f7f7f4] p-2 text-[10px] font-bold leading-4 text-black/55">No evaluation work is waiting right now.</p> : items.map((item) => (
      <article key={item.id} className="overflow-hidden rounded-[8px] border-[2px] border-black bg-white">
       <div className="flex items-center gap-1.5 border-b-[2px] border-black px-2 py-1" style={{ backgroundColor: toneFor(item) }}>{iconFor(item)}<span className="min-w-0 flex-1 truncate text-[9px] font-[1000] uppercase tracking-[0.06em]">{item.title}</span><span className="rounded-[4px] border border-black bg-white/70 px-1 text-[7px] font-black uppercase">{item.priority}</span></div>
       <div className="grid gap-1.5 p-2">
        <p className="line-clamp-3 text-[10px] font-bold leading-[14px] text-black/70">{item.summary}</p>
        {item.requiredMetrics.length ? <div className="flex flex-wrap gap-1">{item.requiredMetrics.slice(0, 4).map((metric) => <span key={metric} className="rounded-[4px] border border-black px-1 py-0.5 text-[7px] font-black uppercase">{metric}</span>)}</div> : null}
        <button type="button" onClick={() => setSelectedEventId(item.sourceEventId)} className="flex items-center justify-center gap-1 rounded-[5px] border-[2px] border-black bg-white px-1 py-1 text-[7px] font-black uppercase hover:bg-[#36E0F6]"><GitBranch size={9} /> Trace evidence</button>
        {item.kind === "learning_review" ? <div className="grid grid-cols-3 gap-1 pt-1"><button type="button" onClick={() => review(item, "hold")} className="rounded-[5px] border-[2px] border-black bg-white px-1 py-1 text-[7px] font-black uppercase hover:bg-[#FFDA47]">Hold</button><button type="button" onClick={() => review(item, "reject")} className="rounded-[5px] border-[2px] border-black bg-white px-1 py-1 text-[7px] font-black uppercase hover:bg-[#FF6B6B]">Reject</button><button type="button" onClick={() => review(item, "approve_for_profile_review")} className="rounded-[5px] border-[2px] border-black bg-[#3FEE56] px-1 py-1 text-[7px] font-black uppercase">Review</button></div> : null}
       </div>
      </article>
     ))}
    </div>
   </section>
   {selectedEventId ? <BrainAttributionDetailPanel channelId={channelId} eventId={selectedEventId} onClose={() => setSelectedEventId(null)} /> : null}
  </div>
 )
}

export default BrainEvaluationInboxPanel
