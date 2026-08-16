import React from "react"
import type { CanonicalOperatorPhaseSnapshot } from "../services/canonicalSync/operatorPhases"
import { useCanonicalSyncUiState } from "../hooks/useCanonicalSyncUiState"
import { cn } from "../lib/utils"

type CanonicalSyncPhaseBadgeProps = {
 className?: string
 live?: boolean
 connected?: boolean
 labelPrefix?: string
}

const badgeStateClass = (
 snapshot: CanonicalOperatorPhaseSnapshot | null,
 live: boolean,
 connected: boolean,
): string => {
 if (!connected) return "bg-[#E7E7E7] text-black/70"
 if (!snapshot) return "bg-[#E7E7E7] text-black/70"
 if (live && snapshot.state !== "ready") return "bg-[#E5FBFF] text-black"
 if (snapshot.state === "failed") return "bg-[#FFD0D0] text-black"
 if (snapshot.state === "partial") return "bg-[#FFF29B] text-black"
 if (snapshot.state === "ready") return "bg-[#CCFF00] text-black"
 return "bg-white text-black"
}

export const CanonicalSyncPhaseBadge: React.FC<CanonicalSyncPhaseBadgeProps> = ({
 className,
 live = false,
 connected = true,
 labelPrefix = "Canonical",
}) => {
 const { activeOperatorPhase: snapshot } = useCanonicalSyncUiState()

 const title = connected ? snapshot?.phase.label || "Identity & Lifetime" : "Connect"
 const stateLabel =
  !connected
   ? "CONNECT"
   : live && snapshot && snapshot.state !== "ready"
   ? "RUNNING"
   : snapshot?.state === "ready"
    ? "READY"
    : snapshot?.state === "partial"
     ? `${Math.max(1, Math.round(snapshot.progress * 100))}%`
     : snapshot?.state === "failed"
      ? "FAILED"
      : "QUEUED"

 return (
  <div
   className={cn(
   "inline-flex items-center gap-2 rounded-full border-[2px] border-black px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] shadow-[2px_2px_0_0_#000]",
    badgeStateClass(snapshot, live, connected),
    className,
   )}
  >
    <span
     className={cn(
      "h-2 w-2 rounded-full border border-black",
     !connected
      ? "bg-[#B7B7B7]"
      : live && snapshot?.state !== "ready"
      ? "bg-[#24D3FF]"
      : snapshot?.state === "failed"
      ? "bg-[#FF7497]"
      : snapshot?.state === "partial"
       ? "bg-[#FFB158]"
       : snapshot?.state === "ready"
        ? "bg-[#4FFF5B]"
        : "bg-[#F4F1EB]",
    )}
   />
   <span>{labelPrefix}</span>
    <span>{title}</span>
    <span className="opacity-60">{stateLabel}</span>
  </div>
 )
}

export default CanonicalSyncPhaseBadge
