import React from "react"
import type { BrainConfidenceLevel } from "../../types"

export type BrainConfidenceValue = BrainConfidenceLevel | "missing"

const CONFIDENCE_TONE: Record<BrainConfidenceValue, { background: string; label: string }> = {
 high: { background: "#3FEE56", label: "Strong evidence" },
 medium: { background: "#FFDA47", label: "Partial evidence" },
 low: { background: "#FFA85C", label: "Early read" },
 missing: { background: "#FA618A", label: "Needs channel data" },
}

/**
 * One shared confidence chip for every Brain surface: answer modules, the context
 * rail, and the sidebar. Confidence has to read the same everywhere or it stops
 * meaning anything to the creator.
 */
export const BrainConfidenceChip: React.FC<{
 confidence: BrainConfidenceValue
 showLabel?: boolean
 className?: string
}> = ({ confidence, showLabel = true, className = "" }) => {
 const tone = CONFIDENCE_TONE[confidence] || CONFIDENCE_TONE.missing
 return (
  <span
   className={`inline-flex items-center gap-1.5 rounded-[9px] border-[2px] border-black px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-black ${className}`}
   style={{ backgroundColor: tone.background }}
  >
   <span className="h-1.5 w-1.5 rounded-full border border-black bg-black/70" aria-hidden="true" />
   {showLabel ? tone.label : confidence}
  </span>
 )
}

export const confidenceForEvidence = (input: {
 hasProfile: boolean
 videoCount: number
 dataStatus: "ready" | "partial" | "missing"
}): BrainConfidenceValue => {
 if (input.dataStatus === "missing" || input.videoCount === 0) return "missing"
 if (input.hasProfile && input.dataStatus === "ready") return "high"
 if (input.hasProfile) return "medium"
 return "low"
}

export default BrainConfidenceChip
