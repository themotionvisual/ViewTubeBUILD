import React, { useMemo, useState } from "react"
import { Check, ChevronRight, Circle, Loader2, Pause, Play, ShieldCheck, X } from "lucide-react"
import {
 createWorkflowChain,
 createWorkflowStep,
 listWorkflowChains,
 updateWorkflowStep,
} from "../../services/workflowEngine"
import type { SuperToolId, SuperToolSurface, WorkflowChain, WorkflowStepStatus } from "../../types"

export type BrainWorkflowRecommendationStep = {
 title: string
 surface: SuperToolSurface
 toolId: SuperToolId
 details: string
 requiresApproval?: boolean
}

export type BrainWorkflowRecommendation = {
 id: string
 title: string
 goal: string
 reason: string
 confidence?: "high" | "medium" | "low"
 steps: BrainWorkflowRecommendationStep[]
}

type Props = {
 recommendation: BrainWorkflowRecommendation
 onStarted?: (chain: WorkflowChain) => void | Promise<void>
 onStatusChanged?: (chain: WorkflowChain, stepId: string, status: WorkflowStepStatus) => void | Promise<void>
}

const statusTone: Record<WorkflowStepStatus, string> = {
 pending: "bg-white",
 active: "bg-[#36E0F6]",
 complete: "bg-[#3FEE56]",
 blocked: "bg-[#FA618A]",
 skipped: "bg-black text-white",
}

const statusIcon = (status: WorkflowStepStatus) => {
 if (status === "complete") return <Check size={13} strokeWidth={4} />
 if (status === "active") return <Loader2 size={13} strokeWidth={3} className="animate-spin" />
 if (status === "blocked") return <X size={13} strokeWidth={4} />
 return <Circle size={11} strokeWidth={3} />
}

export const BrainWorkflowRunPanel: React.FC<Props> = ({ recommendation, onStarted, onStatusChanged }) => {
 const [chainId, setChainId] = useState<string | null>(null)
 const [tick, setTick] = useState(0)
 const [busy, setBusy] = useState(false)

 const chain = useMemo(
  () => (chainId ? listWorkflowChains().find((item) => item.id === chainId) || null : null),
  [chainId, tick],
 )

 const completed = chain?.steps.filter((step) => step.status === "complete").length || 0
 const progress = chain?.steps.length ? Math.round((completed / chain.steps.length) * 100) : 0

 const start = async () => {
  if (busy || chain) return
  setBusy(true)
  try {
   const steps = recommendation.steps.map((step, index) =>
    createWorkflowStep(
     step.title,
     step.surface,
     step.toolId,
     [
      step.details,
      step.requiresApproval ? "Approval gate: required before execution." : "Approval gate: not required.",
     ].join("\n"),
     index === 0 && !step.requiresApproval ? "active" : "pending",
    ),
   )
   const created = createWorkflowChain({
    title: recommendation.title,
    goal: recommendation.goal,
    primaryToolId: "brain-command-center",
    steps,
    provenance: [
     `brain.recommendation.${recommendation.id}`,
     `brain.confidence.${recommendation.confidence || "medium"}`,
    ],
   })
   setChainId(created.id)
   setTick((value) => value + 1)
   await onStarted?.(created)
  } finally {
   setBusy(false)
  }
 }

 const setStepStatus = async (stepId: string, status: WorkflowStepStatus) => {
  if (!chain || busy) return
  setBusy(true)
  try {
   const updated = updateWorkflowStep(chain.id, stepId, status)
   if (!updated) return
   setTick((value) => value + 1)
   await onStatusChanged?.(updated, stepId, status)
  } finally {
   setBusy(false)
  }
 }

 return (
  <section className="overflow-hidden rounded-[12px] border-[3px] border-black bg-white shadow-[5px_5px_0_0_#000]">
   <header className="border-b-[3px] border-black bg-[#FFDA47] p-3">
    <div className="flex flex-wrap items-start justify-between gap-3">
     <div className="min-w-0 flex-1">
      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-black/55">Brain recommended workflow</div>
      <h3 className="mt-1 text-base font-[1000] uppercase leading-tight">{recommendation.title}</h3>
      <p className="mt-1 text-[11px] font-bold leading-4 text-black/70">{recommendation.reason}</p>
     </div>
     <span className="rounded-[6px] border-[2px] border-black bg-white px-2 py-1 text-[9px] font-black uppercase">
      {recommendation.confidence || "medium"} confidence
     </span>
    </div>
   </header>

   {chain ? (
    <div>
     <div className="border-b-[2px] border-black p-3">
      <div className="mb-1 flex items-center justify-between gap-3 text-[10px] font-black uppercase">
       <span>Live run</span><span>{progress}%</span>
      </div>
      <div className="h-4 overflow-hidden rounded-[5px] border-[2px] border-black bg-white">
       <div className="h-full border-r-[2px] border-black bg-[#3FEE56] transition-all" style={{ width: `${progress}%` }} />
      </div>
     </div>
     <ol className="divide-y-2 divide-black">
      {chain.steps.map((step, index) => {
       const source = recommendation.steps[index]
       const approvalPending = Boolean(source?.requiresApproval && step.status === "pending")
       return (
        <li key={step.id} className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2 p-2.5">
         <span className={`grid h-7 w-7 place-items-center rounded-[6px] border-[2px] border-black ${statusTone[step.status]}`}>
          {statusIcon(step.status)}
         </span>
         <div className="min-w-0">
          <div className="truncate text-[11px] font-[1000] uppercase">{step.title}</div>
          <div className="truncate text-[9px] font-bold uppercase tracking-[0.06em] text-black/50">{step.ownerSurface} · {step.toolId}</div>
         </div>
         <div className="flex items-center gap-1">
          {approvalPending ? (
           <button type="button" disabled={busy} onClick={() => setStepStatus(step.id, "active")} className="inline-flex items-center gap-1 rounded-[6px] border-[2px] border-black bg-[#3FEE56] px-2 py-1 text-[9px] font-black uppercase disabled:opacity-50">
            <ShieldCheck size={12} /> Approve
           </button>
          ) : step.status === "active" ? (
           <>
            <button type="button" disabled={busy} onClick={() => setStepStatus(step.id, "complete")} aria-label={`Complete ${step.title}`} className="grid h-7 w-7 place-items-center rounded-[6px] border-[2px] border-black bg-[#3FEE56] disabled:opacity-50"><Check size={13} strokeWidth={4} /></button>
            <button type="button" disabled={busy} onClick={() => setStepStatus(step.id, "blocked")} aria-label={`Block ${step.title}`} className="grid h-7 w-7 place-items-center rounded-[6px] border-[2px] border-black bg-[#FA618A] disabled:opacity-50"><Pause size={12} /></button>
           </>
          ) : step.status === "pending" ? (
           <button type="button" disabled={busy} onClick={() => setStepStatus(step.id, "active")} aria-label={`Start ${step.title}`} className="grid h-7 w-7 place-items-center rounded-[6px] border-[2px] border-black bg-[#36E0F6] disabled:opacity-50"><Play size={12} fill="currentColor" /></button>
          ) : null}
          <ChevronRight size={14} className="text-black/35" />
         </div>
        </li>
       )
      })}
     </ol>
    </div>
   ) : (
    <div className="p-3">
     <p className="mb-3 text-[11px] font-bold leading-4 text-black/65">{recommendation.goal}</p>
     <button type="button" disabled={busy} onClick={start} className="inline-flex items-center gap-2 rounded-[8px] border-[2px] border-black bg-[#3FEE56] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] shadow-[3px_3px_0_0_#000] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50">
      {busy ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />} Start workflow
     </button>
    </div>
   )}
  </section>
 )
}

export default BrainWorkflowRunPanel
