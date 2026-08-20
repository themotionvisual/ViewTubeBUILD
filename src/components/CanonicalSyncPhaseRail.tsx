import React from "react"
import { Clock3 } from "lucide-react"
import { formatLastSync } from "../services/analytics/SyncPipeline"
import {
 CANONICAL_SINK_PHASES,
 getCanonicalSinkPhaseSnapshots,
} from "../services/canonicalSync"
import { useCanonicalSyncUiState } from "../hooks/useCanonicalSyncUiState"

type CanonicalSyncPhaseRailProps = {
 lastSyncComplete: string | null
 fallbackSyncLabel?: string
}

const statusChip = (state: string): string => {
 if (state === "failed") return "Failed"
 if (state === "ready") return "Ready"
 if (state === "running") return "Running"
 if (state === "partial") return "Working"
 return "Queued"
}

export const CanonicalSyncPhaseRail: React.FC<CanonicalSyncPhaseRailProps> = ({
 lastSyncComplete,
 fallbackSyncLabel = "idle",
}) => {
 const {
  overview,
  activeOperatorPhase,
  operatorPhases,
  stageStatus,
 } = useCanonicalSyncUiState()
 const detailedSnapshots = getCanonicalSinkPhaseSnapshots(stageStatus)

 return (
  <div className="rounded-[28px] border-[4px] border-black bg-white shadow-[6px_6px_0px_0px_black] p-4 md:p-5">
   <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
     <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/45">
      Canonical sync state
     </p>
     <p className="mt-1 text-[18px] font-[1000] uppercase tracking-[-0.04em] leading-none">
      {activeOperatorPhase
       ? `${activeOperatorPhase.phase.label.toUpperCase()} · ${activeOperatorPhase.state.toUpperCase()}`
       : fallbackSyncLabel.replace(/_/g, " ")}
     </p>
    </div>
    <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#F4F1EB] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em]">
     <Clock3 size={14} />
     {formatLastSync(lastSyncComplete)}
    </div>
   </div>

   <div className="mt-4 grid gap-3 md:grid-cols-3">
    {operatorPhases.map((snapshot) => (
     <div
      key={snapshot.phase.id}
      className={`rounded-[18px] border-[3px] border-black p-3 ${
       activeOperatorPhase?.phase.id === snapshot.phase.id ? "bg-[#F4F1EB]" : "bg-white"
      }`}
     >
      <div className="flex items-center justify-between gap-3">
       <div>
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-black/40">
         {snapshot.phase.id.replace(/_/g, " ")}
        </p>
        <p className="mt-1 text-[14px] font-[1000] uppercase leading-none">
         {snapshot.phase.label}
        </p>
       </div>
       <span className="rounded-full border-[2px] border-black bg-white px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.16em]">
        {statusChip(snapshot.state)}
       </span>
      </div>
      <p className="mt-2 text-[11px] font-bold leading-4 text-black/65">
       {snapshot.phase.description}
      </p>
      <div className="mt-3 h-2 rounded-full border border-black bg-white overflow-hidden">
       <div
        className={`${snapshot.phase.accentClass} h-full transition-[width] duration-300`}
        style={{
         width: `${Math.max(
          snapshot.state === "running" ? 12 : 0,
          Math.round(snapshot.progress * 100),
         )}%`,
        }}
       />
      </div>
     </div>
    ))}
   </div>

   <div className="mt-4 rounded-[22px] border-[3px] border-black bg-[#F4F1EB] p-3">
    <div className="flex items-center justify-between gap-3">
     <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/45">
       Detailed canonical stages
      </p>
      <p className="mt-1 text-[12px] font-bold leading-5 text-black/65">
       The operator phases above collapse the canonical sink, but the underlying
       stage ledger stays visible here for debugging and quota review.
      </p>
     </div>
     <span className="rounded-full border-[2px] border-black bg-white px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em]">
      {overview?.lastRun?.status || "idle"}
     </span>
    </div>
    <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
     {CANONICAL_SINK_PHASES.map((phase) => {
      const snapshot = detailedSnapshots.find((entry) => entry.phase.id === phase.id)
      return (
       <div
        key={phase.id}
        className="rounded-[16px] border-[2px] border-black bg-white px-3 py-2"
       >
        <div className="flex items-center justify-between gap-2">
         <span className="text-[10px] font-black uppercase tracking-[0.16em]">
          {phase.label}
         </span>
         <span className="text-[8px] font-black uppercase tracking-[0.16em] text-black/55">
          {statusChip(snapshot?.state || "queued")}
         </span>
        </div>
        <div className="mt-2 h-1.5 rounded-full border border-black bg-white overflow-hidden">
         <div
          className="h-full bg-black transition-[width] duration-300"
          style={{ width: `${Math.round((snapshot?.progress || 0) * 100)}%` }}
         />
        </div>
       </div>
      )
     })}
    </div>
   </div>
  </div>
 )
}

export default CanonicalSyncPhaseRail
